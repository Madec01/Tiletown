#!/usr/bin/env node
// Planche de contrôle des modèles normalisés : chaque modèle du manifeste est rendu par three.js dans
// Chromium sans écran (Playwright, SwiftShader) sur une case de 1 u avec grille au sol, caméra
// orthographique 3/4, lumière avec ombre, fond clair. Vérifie en console que tous les GLB se chargent
// (meshopt via MeshoptDecoder) et que chacun tient dans sa case, posé au sol.
//
// Sortie : tools/measure-out/models-sheet.png (+ models-sheet.json : bbox mesurées, matériaux, avertissements).
//
// Usage : node tools/preview-models.mjs [--cell 160] [--cols 10] [--only house-a,park] [--top] [--out models-sheet]
//   --top : vue de dessus (nord en haut, +Z = sud en bas, +X = est à droite) pour contrôler les orientations.

import { readFileSync, writeFileSync, mkdirSync, existsSync, createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, resolve, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'tools', 'measure-out');
const MODELS_DIR = join(ROOT, 'assets', 'models');
const MANIFEST_PATH = join(MODELS_DIR, 'manifest.json');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const CELL = Number(opt('cell', 160));
const COLS = Number(opt('cols', 10));
const ONLY = opt('only', '') ? opt('only', '').split(',') : null;
const TOP = args.includes('--top');
const OUT_NAME = opt('out', TOP ? 'models-sheet-top' : 'models-sheet');

if (!existsSync(MANIFEST_PATH)) {
  console.error(`Manifeste absent : ${MANIFEST_PATH} (lancer node tools/import-models.js)`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const ids = Object.keys(manifest.models).filter((id) => !ONLY || ONLY.includes(id));
mkdirSync(OUT_DIR, { recursive: true });

// Chromium refuse fetch() sur file:// : un petit serveur HTTP statique sert la racine du dépôt.
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm' };
let pageHtml = '';
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (path === '/__sheet.html') { res.writeHead(200, { 'Content-Type': MIME['.html'] }); res.end(pageHtml); return; }
  const file = join(ROOT, path);
  if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
// Page HTML : import map vers node_modules/three, rendu sur une toile 2D.
const threeUrl = `${base}/node_modules/three`;
const modelsUrl = `${base}/assets/models`;
const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Planche des modèles</title>
<script type="importmap">{ "imports": { "three": "${threeUrl}/build/three.module.js", "three/addons/": "${threeUrl}/examples/jsm/" } }</script>
<style>body{margin:0;background:#f4efe6;font-family:system-ui,sans-serif}</style>
</head><body>
<canvas id="sheet"></canvas>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const IDS = ${JSON.stringify(ids)};
const MANIFEST = ${JSON.stringify(manifest.models)};
const CELL = ${CELL}, COLS = ${COLS}, TOP = ${TOP};
const ROWS = Math.ceil(IDS.length / COLS);
const sheet = document.getElementById('sheet');
sheet.width = COLS * CELL; sheet.height = ROWS * CELL;
const ctx = sheet.getContext('2d');
ctx.fillStyle = '#f4efe6'; ctx.fillRect(0, 0, sheet.width, sheet.height);

const gl = document.createElement('canvas'); gl.width = CELL; gl.height = CELL;
const renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, preserveDrawingBuffer: true, alpha: true });
renderer.setPixelRatio(1); renderer.setSize(CELL, CELL, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Caméra orthographique 3/4 : regarde depuis le sud-est (+X, +Z), inclinée à ~35°, cadrage d'une case + marge.
const HALF = 0.95;
const camera = new THREE.OrthographicCamera(-HALF, HALF, HALF, -HALF, 0.1, 50);
if (TOP) {
  camera.position.set(0, 12, 0); camera.up.set(0, 0, -1); camera.lookAt(0, 0, 0); // nord (-Z) en haut
} else {
  const camDir = new THREE.Vector3(1, 1.15, 1.6).normalize();
  camera.position.copy(camDir.clone().multiplyScalar(12)).add(new THREE.Vector3(0, 0.3, 0));
  camera.lookAt(0, 0.3, 0);
}

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

function makeScene() {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb0c0a0, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-1.5, 3, 1.2); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -1.5, right: 1.5, top: 1.5, bottom: -1.5, near: 0.1, far: 10 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  // Case de 1 u (herbe), ombre reçue, et grille à 0,1 u
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x8fcf6f, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.003; ground.receiveShadow = true; scene.add(ground);
  const grid = new THREE.GridHelper(1, 10, 0x5a5a66, 0x6fb85a); grid.position.y = 0.0; grid.material.opacity = 0.55; grid.material.transparent = true; scene.add(grid);
  const axis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0.005, 0.5), 0.18, 0xd9654a, 0.08, 0.06);
  scene.add(axis); // flèche rouge : +Z (sud, « face »)
  return scene;
}

const results = [];
const problems = [];
for (let i = 0; i < IDS.length; i++) {
  const id = IDS[i];
  const entry = MANIFEST[id];
  const scene = makeScene();
  let status = 'ok';
  let box = null, tris = 0, meshes = 0, materials = new Set(), textures = 0;
  try {
    const gltf = await new Promise((res, rej) => loader.load('${modelsUrl}/' + entry.file, res, undefined, rej));
    const obj = gltf.scene;
    obj.traverse((o) => {
      if (o.isMesh) {
        meshes++; o.castShadow = true; o.receiveShadow = true;
        const idx = o.geometry.index; tris += idx ? idx.count / 3 : o.geometry.attributes.position.count / 3;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { materials.add(m.name); if (m.map) textures++; }
      }
    });
    scene.add(obj);
    const b = new THREE.Box3().setFromObject(obj);
    box = { min: [b.min.x, b.min.y, b.min.z].map((v) => +v.toFixed(3)), max: [b.max.x, b.max.y, b.max.z].map((v) => +v.toFixed(3)) };
    const fp = entry.footprint || [1, 1];
    const tol = 0.03;
    const vehicle = /^(car|bus|truck|tram)(-|$)/.test(id); // les véhicules roulent sur les rues : pas tenus de tenir dans une case
    if (!vehicle && (b.min.x < -fp[0] / 2 - tol || b.max.x > fp[0] / 2 + tol || b.min.z < -fp[1] / 2 - tol || b.max.z > fp[1] / 2 + tol)) { status = 'déborde'; problems.push(id + ' déborde de la case : x ' + b.min.x.toFixed(2) + '..' + b.max.x.toFixed(2) + ', z ' + b.min.z.toFixed(2) + '..' + b.max.z.toFixed(2)); }
    if (Math.abs(b.min.y) > 0.01) { status = status === 'ok' ? 'sol' : status + '+sol'; problems.push(id + ' pas posé au sol : y min = ' + b.min.y.toFixed(3)); }
    if (Math.abs((b.min.x + b.max.x) / 2) > 0.02 || Math.abs((b.min.z + b.max.z) / 2) > 0.02) { problems.push(id + ' décentré : centre x ' + ((b.min.x + b.max.x) / 2).toFixed(3) + ', z ' + ((b.min.z + b.max.z) / 2).toFixed(3)); }
  } catch (e) {
    status = 'ÉCHEC';
    problems.push(id + ' : ' + (e && e.message ? e.message : String(e)));
    console.error('[échec] ' + id + ' : ' + (e && e.message ? e.message : String(e)));
  }
  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, camera);
  const cx = (i % COLS) * CELL, cy = Math.floor(i / COLS) * CELL;
  ctx.fillStyle = status === 'ok' ? '#faf7f0' : '#fde2dd';
  ctx.fillRect(cx + 1, cy + 1, CELL - 2, CELL - 2);
  ctx.drawImage(gl, cx, cy);
  ctx.fillStyle = '#333'; ctx.font = 'bold ' + Math.round(CELL / 13) + 'px system-ui, sans-serif';
  ctx.fillText(id, cx + 6, cy + Math.round(CELL / 10));
  ctx.font = Math.round(CELL / 16) + 'px system-ui, sans-serif'; ctx.fillStyle = '#555';
  const sz = box ? (box.max[0] - box.min[0]).toFixed(2) + ' × ' + (box.max[1] - box.min[1]).toFixed(2) + ' × ' + (box.max[2] - box.min[2]).toFixed(2) : status;
  ctx.fillText(sz, cx + 6, cy + CELL - 8);
  ctx.fillText(tris + ' tri', cx + CELL - 6 - ctx.measureText(tris + ' tri').width, cy + CELL - 8);
  if (entry.provisional) { ctx.fillStyle = '#b4532f'; ctx.fillText('provisoire', cx + CELL - 6 - ctx.measureText('provisoire').width, cy + Math.round(CELL / 10)); }
  results.push({ id, status, box, triangles: tris, meshes, materials: [...materials], textures });
  // dispose
  scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); });
}
window.__results = { results, problems, png: sheet.toDataURL('image/png'), renderer: renderer.getContext().getParameter(renderer.getContext().RENDERER) };
</script></body></html>`;

pageHtml = html; // servie en mémoire : rien d'autre que la planche n'est écrit dans tools/measure-out/

const t0 = Date.now();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: COLS * CELL, height: Math.ceil(ids.length / COLS) * CELL }, deviceScaleFactor: 1 });
const consoleLines = [];
page.on('console', (m) => { consoleLines.push(m.text()); if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
page.on('pageerror', (e) => { consoleLines.push('pageerror: ' + e.message); console.log('[pageerror]', e.message); });
await page.goto(`${base}/__sheet.html`);
await page.waitForFunction(() => window.__results, null, { timeout: 180000 });
const r = await page.evaluate(() => window.__results);
await browser.close();
server.close();

writeFileSync(join(OUT_DIR, `${OUT_NAME}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
writeFileSync(join(OUT_DIR, `${OUT_NAME}.json`), JSON.stringify({ generated: new Date().toISOString(), renderer: r.renderer, cell: CELL, results: r.results, problems: r.problems, console: consoleLines }, null, 2) + '\n');

const failed = r.results.filter((x) => x.status === 'ÉCHEC');
console.log(`${r.results.length} modèles rendus en ${((Date.now() - t0) / 1000).toFixed(1)} s (${r.renderer}) ; ${r.results.length - failed.length} chargés, ${failed.length} en échec.`);
for (const p of r.problems) console.log('  ! ' + p);
console.log(`Planche : ${join(OUT_DIR, `${OUT_NAME}.png`)}`);
if (failed.length) process.exitCode = 1;
