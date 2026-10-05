#!/usr/bin/env node
// Captures et mesures de l'ASPECT du paysage (docs/ARCHITECTURE.md §11.4), sur la petite scène de
// référence `tools/look-fixture.html` : rivière courbe, colline douce, bosquet, trois maisons.
// Toujours la même graine et les mêmes cadrages : « avant » et « après » se comparent pixel à pixel.
//
//   node tools/look.mjs --tag avant        → tools/measure-out/look-avant.png (+ gros plans)
//   node tools/look.mjs --tag apres        → tools/measure-out/look-apres.png (+ gros plans)
//   node tools/look.mjs --tag apres --alias  → écrit aussi look-colline.png, look-berge.png…
//   node tools/look.mjs --views general,colline --tag essai
//
// Rendu en 412 × 915 DPR 2 (Pixel 7 en portrait), Chromium SwiftShader. Mesures par cadrage :
// appels de dessin, triangles, temps CPU par image (médiane de 8), sommets du sol.
// Le tableau comparatif avant / après est imprimé si les deux rapports existent.

import { createServer } from 'node:http';
import { promises as fs, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const TAG = flag('--tag', 'apres');
const ALIAS = args.includes('--alias');
const OUT = path.resolve(ROOT, flag('--out', 'tools/measure-out'));
const WIDTH = Number(flag('--width', '412'));
const HEIGHT = Number(flag('--height', '915'));
const DPR = Number(flag('--dpr', '2'));

/** Cadrages capturés : nom du fichier → paramètres de la fixture. */
const ALL_VIEWS = {
  general: { query: 'view=general', label: 'vue générale' },
  colline: { query: 'view=colline', label: 'gros plan colline' },
  berge: { query: 'view=berge', label: 'gros plan berge' },
  foret: { query: 'view=foret', label: 'gros plan bosquet' },
  riviere: { query: 'view=riviere', label: 'la rivière en entier' },
  coude: { query: 'view=coude', label: 'gros plan coude de rivière' },
  humide: { query: 'view=humide', label: 'gros plan zone humide' },
  large: { query: 'view=large', label: 'carte entière' },
  calque: { query: 'view=general&layer=air', label: 'calque Air par-dessus le sol' },
  'calque-eau': { query: 'view=riviere&layer=water', label: 'calque Eau sur la rivière' },
  hachures: { query: 'view=general&layer=air&pattern=1', label: 'calque Air + hachures' },
  pose: { query: 'view=berge&hint=1', label: 'grille locale pendant la pose' },
};
const VIEWS = (flag('--views', Object.keys(ALL_VIEWS).join(','))).split(',').map((s) => s.trim()).filter((s) => ALL_VIEWS[s]);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.wasm': 'application/wasm',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
};

function serve(root, port = 0) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.normalize(path.join(root, rel));
      if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
      const data = await fs.readFile(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(data);
    } catch { res.writeHead(404); res.end('404'); }
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

function findChromium() {
  if (process.env.TILETOWN_CHROMIUM && existsSync(process.env.TILETOWN_CHROMIUM)) return process.env.TILETOWN_CHROMIUM;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    const dirs = readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => Number(b.slice(9)) - Number(a.slice(9)));
    for (const d of dirs) {
      const exe = path.join(base, d, 'chrome-linux', 'chrome');
      if (existsSync(exe)) return exe;
    }
  } catch { /* dossier absent */ }
  try { const exe = chromium.executablePath(); if (existsSync(exe)) return exe; } catch { /* non installé */ }
  return null;
}

async function captureView(browser, base, name) {
  const view = ALL_VIEWS[name];
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error') logs.push(`[error] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`); });
  await page.goto(`${base}tools/look-fixture.html?stats=0&${view.query}`, { waitUntil: 'load' });
  await page.waitForFunction(() => globalThis.__tiletown && globalThis.__tiletown.ready, null, { timeout: 90000 });
  await page.waitForTimeout(400);
  const frameMs = await page.evaluate(() => globalThis.__tiletown.renderFrames(8));
  const stats = await page.evaluate(() => globalThis.__tiletown.stats());
  const file = name === 'general' ? `look-${TAG}.png` : `look-${name}-${TAG}.png`;
  await page.screenshot({ path: path.join(OUT, file), scale: 'css' });
  if (ALIAS && name !== 'general') await fs.copyFile(path.join(OUT, file), path.join(OUT, `look-${name}.png`));
  await context.close();
  return { name, label: view.label, file, frameMs, logs, stats };
}

const fmt = (v, n = 1) => (v == null ? '?' : Number(v).toFixed(n));

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const exe = findChromium();
  if (!exe) throw new Error('Chromium introuvable (PLAYWRIGHT_BROWSERS_PATH, TILETOWN_CHROMIUM).');
  const { server, port } = await serve(ROOT);
  const browser = await chromium.launch({
    executablePath: exe,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const results = [];
  try {
    for (const name of VIEWS) {
      process.stdout.write(`… ${name}\n`);
      results.push(await captureView(browser, `http://127.0.0.1:${port}/`, name));
    }
  } finally {
    await browser.close();
    server.close();
  }

  const report = { tag: TAG, date: new Date().toISOString(), viewport: { width: WIDTH, height: HEIGHT, dpr: DPR }, views: results };
  await fs.writeFile(path.join(OUT, `look-${TAG}.json`), JSON.stringify(report, null, 2));

  console.log(`\n### Scène de référence — « ${TAG} » (${WIDTH} × ${HEIGHT}, DPR ${DPR})\n`);
  console.log('| Cadrage | Appels | Triangles | Image (ms) | Sommets du sol | Capture |');
  console.log('|---|---:|---:|---:|---:|---|');
  for (const r of results) {
    const g = r.stats.ground || {};
    console.log(`| ${r.label} | ${r.stats.calls} | ${r.stats.triangles} | ${fmt(r.frameMs)} | ${g.vertices ?? '—'} | ${r.file} |`);
  }
  const errs = results.flatMap((r) => r.logs);
  if (errs.length) console.log('\nMessages :\n' + errs.map((l) => '  ' + l).join('\n'));

  // Comparatif avant / après si les deux rapports existent.
  const other = TAG === 'apres' ? 'avant' : 'apres';
  const otherPath = path.join(OUT, `look-${other}.json`);
  if (existsSync(otherPath)) {
    const prev = JSON.parse(await fs.readFile(otherPath, 'utf8'));
    const byName = new Map(prev.views.map((v) => [v.name, v]));
    const [a, b] = TAG === 'apres' ? ['avant', 'apres'] : ['apres', 'avant'];
    console.log(`\n### Comparatif ${a} → ${b}\n`);
    console.log(`| Cadrage | Appels ${a} → ${b} | Triangles ${a} → ${b} | Image ms ${a} → ${b} |`);
    console.log('|---|---|---|---|');
    for (const r of results) {
      const p = byName.get(r.name);
      if (!p) continue;
      console.log(`| ${r.label} | ${p.stats.calls} → ${r.stats.calls} | ${p.stats.triangles} → ${r.stats.triangles} | ${fmt(p.frameMs)} → ${fmt(r.frameMs)} |`);
    }
  }
  const maxCalls = Math.max(...results.map((r) => r.stats.calls));
  console.log(`\nAppels de dessin max : ${maxCalls} (critère ≤ 60) — ${maxCalls <= 60 ? 'OK' : 'KO'}`);
  console.log(`Rapport : ${path.relative(ROOT, path.join(OUT, `look-${TAG}.json`))}`);
  if (results.some((r) => r.logs.some((l) => l.startsWith('[pageerror]')))) process.exitCode = 1;
}

main().catch((err) => { console.error(err); process.exit(1); });
