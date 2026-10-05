#!/usr/bin/env node
// Planche AVANT / APRÈS : un même modèle rendu deux fois côte à côte, à partir de deux dossiers de GLB
// (la version d'avant, extraite de git, et la version courante). Même rendu que tools/preview-models.mjs
// (three.js dans Chromium sans écran, caméra orthographique 3/4, lumière avec ombre).
//
// Préparer la version « avant » :
//   mkdir -p tools/measure-out/avant
//   for f in house-a tree-a ; do git show HEAD:assets/models/$f.glb > tools/measure-out/avant/$f.glb ; done
//
// Usage :
//   node tools/preview-before-after.mjs house-a,house-b,tree-a [--avant tools/measure-out/avant]
//                                       [--cell 260] [--out models-avant-apres]

import { readFileSync, writeFileSync, mkdirSync, existsSync, createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, resolve, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'tools', 'measure-out');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const IDS = (args.find((a) => !a.startsWith('--')) || '').split(',').filter(Boolean);
const AVANT = opt('avant', 'tools/measure-out/avant');
const CELL = Number(opt('cell', 260));
const OUT_NAME = opt('out', 'models-avant-apres');

if (!IDS.length) { console.error('Donner la liste des identifiants : node tools/preview-before-after.mjs house-a,tree-a'); process.exit(1); }
const missing = IDS.filter((id) => !existsSync(join(ROOT, AVANT, `${id}.glb`)));
if (missing.length) { console.error(`GLB « avant » manquants dans ${AVANT} : ${missing.join(', ')}`); process.exit(1); }
mkdirSync(OUT_DIR, { recursive: true });

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
const threeUrl = `${base}/node_modules/three`;

pageHtml = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Avant / après</title>
<script type="importmap">{ "imports": { "three": "${threeUrl}/build/three.module.js", "three/addons/": "${threeUrl}/examples/jsm/" } }</script>
<style>body{margin:0;background:#f4efe6;font-family:system-ui,sans-serif}</style>
</head><body>
<canvas id="sheet"></canvas>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const IDS = ${JSON.stringify(IDS)};
const CELL = ${CELL};
const HEAD = Math.round(CELL * 0.17);
const URLS = { avant: '${base}/${AVANT}/', apres: '${base}/assets/models/' };
const sheet = document.getElementById('sheet');
sheet.width = IDS.length * CELL; sheet.height = 2 * CELL + 2 * HEAD;
const ctx = sheet.getContext('2d');
ctx.fillStyle = '#f4efe6'; ctx.fillRect(0, 0, sheet.width, sheet.height);

const gl = document.createElement('canvas'); gl.width = CELL; gl.height = CELL;
const renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, preserveDrawingBuffer: true, alpha: true });
renderer.setPixelRatio(1); renderer.setSize(CELL, CELL, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const HALF = 1.15;
const camera = new THREE.OrthographicCamera(-HALF, HALF, HALF, -HALF, 0.1, 50);
camera.position.copy(new THREE.Vector3(1, 1.15, 1.6).normalize().multiplyScalar(12)).add(new THREE.Vector3(0, 0.45, 0));
camera.lookAt(0, 0.45, 0);

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

function makeScene() {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb0c0a0, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-1.5, 3, 1.2); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -1.8, right: 1.8, top: 1.8, bottom: -1.8, near: 0.1, far: 12 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x8fcf6f, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.003; ground.receiveShadow = true; scene.add(ground);
  return scene;
}

const stats = [];
for (let row = 0; row < 2; row++) {
  const which = row === 0 ? 'avant' : 'apres';
  const y0 = row * (CELL + HEAD);
  ctx.fillStyle = row === 0 ? '#e7ded0' : '#dfecd6';
  ctx.fillRect(0, y0, sheet.width, HEAD);
  ctx.fillStyle = '#3a3a3a'; ctx.font = 'bold ' + Math.round(HEAD * 0.52) + 'px system-ui, sans-serif';
  ctx.fillText(row === 0 ? 'AVANT  (palette « teinte la plus proche », arbres des kits)' : 'APRÈS  (palette par rôle, arbres arrondis, détails)', 10, y0 + HEAD * 0.68);
  for (let i = 0; i < IDS.length; i++) {
    const id = IDS[i];
    const scene = makeScene();
    let tris = 0;
    try {
      const gltf = await new Promise((res, rej) => loader.load(URLS[which] + id + '.glb', res, undefined, rej));
      gltf.scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; const ix = o.geometry.index; tris += ix ? ix.count / 3 : o.geometry.attributes.position.count / 3; } });
      scene.add(gltf.scene);
    } catch (e) { console.error('[échec] ' + which + ' ' + id + ' : ' + e.message); }
    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, camera);
    const cx = i * CELL, cy = y0 + HEAD;
    ctx.fillStyle = '#faf7f0'; ctx.fillRect(cx + 1, cy + 1, CELL - 2, CELL - 2);
    ctx.drawImage(gl, cx, cy);
    ctx.fillStyle = '#333'; ctx.font = 'bold ' + Math.round(CELL / 14) + 'px system-ui, sans-serif';
    ctx.fillText(id, cx + 8, cy + Math.round(CELL / 10));
    ctx.font = Math.round(CELL / 18) + 'px system-ui, sans-serif'; ctx.fillStyle = '#555';
    ctx.fillText(tris + ' tri', cx + 8, cy + CELL - 10);
    stats.push({ id, which, triangles: tris });
  }
}
window.__results = { png: sheet.toDataURL('image/png'), stats };
</script></body></html>`;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: IDS.length * CELL, height: 2 * CELL + 120 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error') console.log('[page]', m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`${base}/__sheet.html`);
await page.waitForFunction(() => window.__results, null, { timeout: 180000 });
const r = await page.evaluate(() => window.__results);
await browser.close();
server.close();

writeFileSync(join(OUT_DIR, `${OUT_NAME}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
for (const id of IDS) {
  const a = r.stats.find((s) => s.id === id && s.which === 'avant');
  const b = r.stats.find((s) => s.id === id && s.which === 'apres');
  console.log(`${id.padEnd(20)} ${String(a?.triangles ?? 0).padStart(5)} → ${String(b?.triangles ?? 0).padStart(5)} triangles`);
}
console.log(`Planche : ${join(OUT_DIR, `${OUT_NAME}.png`)}`);
