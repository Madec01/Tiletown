#!/usr/bin/env node
// Planche de contrôle des modèles ANIMÉS du manifeste (`animated: true`) : chaque modèle est rendu par
// three.js dans Chromium sans écran (Playwright, SwiftShader) sur une ligne de trois cases :
//   - rig « skinned » : le clip `walk` (ou le premier clip) à t = 0, 0,3 et 0,6 s via AnimationMixer,
//     vue 3/4 ; le squelette et les clips sont vérifiés au chargement (GLTFLoader + MeshoptDecoder) ;
//   - rig « puppet » : pose neutre en vue 3/4, de face (+Z vers la caméra) et de dessus (nord en haut).
// Chaque case a une grille au sol adaptée à la taille du modèle (pas indiqué), la flèche rouge pointe +Z.
// Contrôles : chargement, nombre de SkinnedMesh et d'os, noms et durées des clips, pièces nommées
// présentes (pantins), modèle posé au sol (y min ≈ 0) et centré en x/z au repos, dimensions ≈ manifeste.
//
// Sortie : tools/measure-out/animated-sheet.png (+ animated-sheet.json : mesures, clips, problèmes, console).
// Usage : node tools/preview-animated.mjs [--cell 220] [--only deer,heron] [--out animated-sheet]

import { readFileSync, writeFileSync, mkdirSync, existsSync, createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, resolve, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'tools', 'measure-out');
const MANIFEST_PATH = join(ROOT, 'assets', 'models', 'manifest.json');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const CELL = Number(opt('cell', 220));
const ONLY = opt('only', '') ? opt('only', '').split(',') : null;
const OUT_NAME = opt('out', 'animated-sheet');
const TIMES = [0, 0.3, 0.6];

if (!existsSync(MANIFEST_PATH)) { console.error(`Manifeste absent : ${MANIFEST_PATH}`); process.exit(1); }
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const ids = Object.keys(manifest.models).filter((id) => manifest.models[id].animated && (!ONLY || ONLY.includes(id)));
if (!ids.length) { console.error('Aucun modèle animé dans le manifeste (lancer import-animated.js et build-fauna.js).'); process.exit(1); }
mkdirSync(OUT_DIR, { recursive: true });

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png', '.wasm': 'application/wasm' };
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
const modelsUrl = `${base}/assets/models`;

pageHtml = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Planche des modèles animés</title>
<script type="importmap">{ "imports": { "three": "${threeUrl}/build/three.module.js", "three/addons/": "${threeUrl}/examples/jsm/" } }</script>
<style>body{margin:0;background:#f4efe6;font-family:system-ui,sans-serif}</style>
</head><body>
<canvas id="sheet"></canvas>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const IDS = ${JSON.stringify(ids)};
const MANIFEST = ${JSON.stringify(Object.fromEntries(ids.map((id) => [id, manifest.models[id]])))};
const CELL = ${CELL}, COLS = 3, TIMES = ${JSON.stringify(TIMES)};
const sheet = document.getElementById('sheet');
sheet.width = COLS * CELL + 10; sheet.height = IDS.length * CELL;
const ctx = sheet.getContext('2d');
ctx.fillStyle = '#f4efe6'; ctx.fillRect(0, 0, sheet.width, sheet.height);

const gl = document.createElement('canvas'); gl.width = CELL; gl.height = CELL;
const renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, preserveDrawingBuffer: true, alpha: true });
renderer.setPixelRatio(1); renderer.setSize(CELL, CELL, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

/** Scène : sol, grille adaptée à la taille, flèche +Z. half = demi-largeur du cadrage. */
function makeScene(half) {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb0c0a0, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-1.5, 3, 1.2).multiplyScalar(half); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -half * 1.5, right: half * 1.5, top: half * 1.5, bottom: -half * 1.5, near: 0.01, far: half * 20 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  const size = half * 2;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ color: 0x8fcf6f, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -size * 0.002; ground.receiveShadow = true; scene.add(ground);
  // pas de grille : 0,1 u si le modèle fait plus de 0,25 u, sinon 0,02 u
  const step = half > 0.25 ? 0.1 : half > 0.08 ? 0.05 : 0.02;
  const divisions = Math.max(2, Math.round(size / step));
  const grid = new THREE.GridHelper(divisions * step, divisions, 0x5a5a66, 0x6fb85a); grid.material.opacity = 0.55; grid.material.transparent = true; scene.add(grid);
  const axis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, size * 0.005, half * 0.55), half * 0.35, 0xd9654a, half * 0.12, half * 0.08);
  scene.add(axis);
  return { scene, step };
}

function camera(view, half, centerY) {
  const cam = new THREE.OrthographicCamera(-half, half, half, -half, 0.001, 100);
  if (view === 'top') { cam.position.set(0, 10, 0); cam.up.set(0, 0, -1); cam.lookAt(0, 0, 0); }
  else if (view === 'front') { cam.position.set(0, centerY + half * 0.15, 10); cam.lookAt(0, centerY, 0); }
  else { const dir = new THREE.Vector3(1, 1.15, 1.6).normalize(); cam.position.copy(dir.multiplyScalar(10)).add(new THREE.Vector3(0, centerY, 0)); cam.lookAt(0, centerY, 0); }
  return cam;
}

const results = [];
const problems = [];
for (let row = 0; row < IDS.length; row++) {
  const id = IDS[row];
  const entry = MANIFEST[id];
  const info = { id, rig: entry.rig, status: 'ok', clips: [], skinned: 0, bones: 0, parts: {}, box: null, boxes: [] };
  let gltf = null;
  try {
    gltf = await new Promise((res, rej) => loader.load('${modelsUrl}/' + entry.file, res, undefined, rej));
    gltf.scene.traverse((o) => { if (o.isSkinnedMesh) { info.skinned++; info.bones = Math.max(info.bones, o.skeleton.bones.length); } if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    info.clips = gltf.animations.map((c) => ({ name: c.name, duration: +c.duration.toFixed(3), tracks: c.tracks.length }));
    if (entry.rig === 'skinned') {
      if (!info.skinned) { info.status = 'sans peau'; problems.push(id + ' : aucun SkinnedMesh chargé'); }
      if (!gltf.animations.length) { info.status = 'sans clip'; problems.push(id + ' : aucun clip chargé'); }
      const expected = Object.values(entry.clips || {});
      for (const name of expected) if (!gltf.animations.some((c) => c.name === name)) { info.status = 'clip manquant'; problems.push(id + ' : clip « ' + name + ' » absent (' + gltf.animations.map((c) => c.name).join(', ') + ')'); }
    } else {
      for (const [part, nodeName] of Object.entries(entry.parts || {})) {
        const n = gltf.scene.getObjectByName(nodeName);
        info.parts[part] = !!n;
        if (!n) { info.status = 'pièce manquante'; problems.push(id + ' : nœud « ' + nodeName + ' » absent'); }
      }
    }
    // boîte au repos
    gltf.scene.updateMatrixWorld(true);
    const b0 = new THREE.Box3().setFromObject(gltf.scene, true);
    info.box = { min: [b0.min.x, b0.min.y, b0.min.z].map((v) => +v.toFixed(3)), max: [b0.max.x, b0.max.y, b0.max.z].map((v) => +v.toFixed(3)) };
    if (Math.abs(b0.min.y) > 0.01) problems.push(id + ' : pas posé au sol (y min = ' + b0.min.y.toFixed(3) + ')');
    if (Math.abs((b0.min.x + b0.max.x) / 2) > 0.01 || Math.abs((b0.min.z + b0.max.z) / 2) > 0.01) problems.push(id + ' : décentré (centre x ' + ((b0.min.x + b0.max.x) / 2).toFixed(3) + ', z ' + ((b0.min.z + b0.max.z) / 2).toFixed(3) + ')');
    const ms = entry.bbox && entry.bbox.size;
    if (ms) { const sz = [b0.max.x - b0.min.x, b0.max.y - b0.min.y, b0.max.z - b0.min.z]; for (let k = 0; k < 3; k++) if (Math.abs(sz[k] - ms[k]) > Math.max(0.02, ms[k] * 0.15)) { problems.push(id + ' : taille chargée ' + sz.map((v) => v.toFixed(3)).join('×') + ' ≠ manifeste ' + ms.join('×')); break; } }
  } catch (e) {
    info.status = 'ÉCHEC';
    problems.push(id + ' : ' + (e && e.message ? e.message : String(e)));
    console.error('[échec] ' + id + ' : ' + (e && e.message ? e.message : String(e)));
  }
  console.log('[' + id + '] ' + info.status + ' ; rig ' + entry.rig + ' ; skinned ' + info.skinned + ' ; os ' + info.bones + ' ; clips ' + info.clips.map((c) => c.name + ' ' + c.duration + 's').join(', '));

  const sizeMax = info.box ? Math.max(info.box.max[0] - info.box.min[0], info.box.max[1] - info.box.min[1], info.box.max[2] - info.box.min[2]) : 0.3;
  const half = Math.max(0.03, sizeMax * 0.72);
  const centerY = info.box ? (info.box.min[1] + info.box.max[1]) / 2 : half / 2;
  let mixer = null, clipName = '';
  if (gltf && entry.rig === 'skinned' && gltf.animations.length) {
    const walkName = entry.clips && entry.clips.walk;
    const clip = (walkName && THREE.AnimationClip.findByName(gltf.animations, walkName)) || gltf.animations[0];
    clipName = clip.name;
    mixer = new THREE.AnimationMixer(gltf.scene);
    const action = mixer.clipAction(clip); action.play();
  }
  for (let col = 0; col < COLS; col++) {
    const { scene, step } = makeScene(half);
    let label = '';
    let cam;
    if (gltf) {
      if (entry.rig === 'skinned') {
        if (mixer) { mixer.setTime(0); mixer.update(TIMES[col]); }
        gltf.scene.updateMatrixWorld(true);
        const b = new THREE.Box3().setFromObject(gltf.scene, true);
        info.boxes.push({ t: TIMES[col], min: [b.min.x, b.min.y, b.min.z].map((v) => +v.toFixed(3)), max: [b.max.x, b.max.y, b.max.z].map((v) => +v.toFixed(3)) });
        if (b.min.y < -0.02 * Math.max(1, sizeMax / 0.3)) problems.push(id + ' : à t = ' + TIMES[col] + ' s, y min = ' + b.min.y.toFixed(3) + ' (sous le sol)');
        label = clipName + ' t=' + TIMES[col] + 's';
        cam = camera('iso', half, centerY);
      } else {
        const view = ['iso', 'front', 'top'][col];
        label = view === 'iso' ? 'vue 3/4' : view === 'front' ? 'de face (+Z)' : 'de dessus (N en haut)';
        cam = camera(view, half, centerY);
      }
      scene.add(gltf.scene);
    } else {
      cam = camera('iso', half, centerY);
    }
    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, cam);
    const cx = col * CELL, cy = row * CELL;
    ctx.fillStyle = info.status === 'ok' ? '#faf7f0' : '#fde2dd';
    ctx.fillRect(cx + 1, cy + 1, CELL - 2, CELL - 2);
    ctx.drawImage(gl, cx, cy);
    ctx.fillStyle = '#333'; ctx.font = 'bold ' + Math.round(CELL / 14) + 'px system-ui, sans-serif';
    if (col === 0) ctx.fillText(id + '  (' + entry.rig + ')', cx + 6, cy + Math.round(CELL / 11));
    ctx.font = Math.round(CELL / 17) + 'px system-ui, sans-serif'; ctx.fillStyle = '#555';
    ctx.fillText(label, cx + 6, cy + CELL - 8);
    const gridTxt = 'grille ' + step + ' u';
    ctx.fillText(gridTxt, cx + CELL - 6 - ctx.measureText(gridTxt).width, cy + CELL - 8);
    if (col === 0 && info.box) {
      const sz = (info.box.max[0] - info.box.min[0]).toFixed(2) + ' × ' + (info.box.max[1] - info.box.min[1]).toFixed(2) + ' × ' + (info.box.max[2] - info.box.min[2]).toFixed(2) + ' u';
      ctx.fillText(sz, cx + 6, cy + Math.round(CELL / 11) + Math.round(CELL / 15));
    }
    if (col === COLS - 1) {
      const t = (info.skinned ? info.bones + ' os · ' : '') + info.clips.length + ' clips' + (entry.rig === 'puppet' ? ' · ' + Object.keys(entry.parts || {}).length + ' pièces' : '');
      ctx.fillText(t, cx + CELL - 6 - ctx.measureText(t).width, cy + Math.round(CELL / 11));
    }
    if (gltf) scene.remove(gltf.scene);
  }
  if (gltf) gltf.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); });
  results.push(info);
}
window.__results = { results, problems, png: sheet.toDataURL('image/png'), renderer: renderer.getContext().getParameter(renderer.getContext().RENDERER) };
</script></body></html>`;

const t0 = Date.now();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 3 * CELL + 10, height: Math.min(8000, ids.length * CELL) }, deviceScaleFactor: 1 });
const consoleLines = [];
page.on('console', (m) => { consoleLines.push(m.text()); if (m.type() === 'error' || m.type() === 'warning' || m.text().startsWith('[')) console.log('[page]', m.text()); });
page.on('pageerror', (e) => { consoleLines.push('pageerror: ' + e.message); console.log('[pageerror]', e.message); });
await page.goto(`${base}/__sheet.html`);
await page.waitForFunction(() => window.__results, null, { timeout: 240000 });
const r = await page.evaluate(() => window.__results);
await browser.close();
server.close();

writeFileSync(join(OUT_DIR, `${OUT_NAME}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
writeFileSync(join(OUT_DIR, `${OUT_NAME}.json`), JSON.stringify({ generated: new Date().toISOString(), renderer: r.renderer, cell: CELL, times: TIMES, results: r.results, problems: r.problems, console: consoleLines }, null, 2) + '\n');

const failed = r.results.filter((x) => x.status !== 'ok');
console.log(`${r.results.length} modèles animés rendus en ${((Date.now() - t0) / 1000).toFixed(1)} s (${r.renderer}) ; ${r.results.length - failed.length} sans défaut, ${failed.length} à revoir.`);
for (const p of r.problems) console.log('  ! ' + p);
console.log(`Planche : ${join(OUT_DIR, `${OUT_NAME}.png`)}`);
if (failed.length) process.exitCode = 1;
