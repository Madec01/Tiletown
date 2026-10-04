#!/usr/bin/env node
// Mesures du prototype de rendu (docs/ARCHITECTURE.md §7) avec Playwright + Chromium SwiftShader :
// sert le dépôt, ouvre la carte en 412 × 915 (DPR 2,625) et 360 × 740, attend `window.__tiletown.ready`,
// lit `window.__tiletown.stats()`, compte les octets du précache, enregistre des captures et un
// rapport (tools/measure-out/), puis imprime le tableau des critères OK / KO.
//
//   node tools/measure.mjs [--strict] [--out tools/measure-out] [--port 0] [--page <url relative>]
//
// Page mesurée : dev.html?stats=1 si src/main.js existe, sinon tools/measure-fixture.html (monde de
// démonstration local). Le scénario « 500 îlots » utilise toujours la fixture (?stress=1).
// Les temps d'image sous SwiftShader (rendu logiciel) sont indicatifs : seul le GPU réel compte.

import { createServer } from 'node:http';
import { promises as fs, existsSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const STRICT = args.includes('--strict');
const OUT = path.resolve(ROOT, flag('--out', 'tools/measure-out'));
const PORT = Number(flag('--port', '0'));
const PAGE = flag('--page', null);

const CRITERIA = { calls: 60, triangles: 150000, frameMs: 16, precacheBytes: 6 * 1024 * 1024 };

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.wasm': 'application/wasm',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon',
};

/** Petit serveur statique du dépôt (sans dépendance) ; renvoie { server, port }. */
function serve(root, port) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      if (rel === '/favicon.ico' && !existsSync(path.join(root, rel))) { res.writeHead(204); res.end(); return; }
      const file = path.normalize(path.join(root, rel));
      if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
      const data = await fs.readFile(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(data);
    } catch {
      res.writeHead(404); res.end('404');
    }
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

/** Chromium à lancer : variable TILETOWN_CHROMIUM, sinon le plus récent de /opt/pw-browsers, sinon celui de Playwright. */
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

/** Taille d'un fichier (0 s'il manque). */
const sizeOf = (p) => { try { return statSync(p).size; } catch { return 0; } };

/** Somme des fichiers d'un dossier (récursif), filtrés. */
function dirBytes(dir, filter = () => true) {
  let total = 0;
  if (!existsSync(dir)) return 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'raw') total += dirBytes(p, filter); } else if (filter(p)) total += sizeOf(p);
  }
  return total;
}

/** Octets du précache : liste de sw.js si elle existe, sinon dist/ + page + modèles + polices + icônes. */
async function precacheBytes() {
  const sw = path.join(ROOT, 'sw.js');
  if (existsSync(sw)) {
    const src = await fs.readFile(sw, 'utf8');
    const files = new Set();
    for (const m of src.matchAll(/['"]([^'"\s]+\.(?:js|css|html|json|glb|png|webp|svg|woff2?|webmanifest|ico))(?:\?[^'"]*)?['"]/g)) {
      files.add(m[1].replace(/^\.?\//, ''));
    }
    let total = 0; const listed = [];
    for (const f of files) {
      const p = path.join(ROOT, f);
      if (existsSync(p) && statSync(p).isFile()) { total += sizeOf(p); listed.push(f); }
    }
    if (listed.length) return { bytes: total, method: 'sw.js', files: listed.length };
  }
  const bytes = dirBytes(path.join(ROOT, 'dist'))
    + sizeOf(path.join(ROOT, 'index.html')) + sizeOf(sw)
    + dirBytes(path.join(ROOT, 'assets', 'models'), (p) => /\.(glb|json)$/.test(p))
    + dirBytes(path.join(ROOT, 'assets', 'fonts')) + dirBytes(path.join(ROOT, 'assets', 'icons'))
    + dirBytes(path.join(ROOT, 'assets', 'ui'));
  return { bytes, method: 'dist/ + assets (sans sw.js)', files: null };
}

const fmtMB = (b) => (b / (1024 * 1024)).toFixed(2) + ' Mo';

async function measureScenario(browser, base, scenario) {
  const context = await browser.newContext({
    viewport: { width: scenario.width, height: scenario.height },
    deviceScaleFactor: scenario.dpr,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`); });
  const t0 = Date.now();
  await page.goto(base + scenario.page, { waitUntil: 'load' });
  try {
    await page.waitForFunction(() => globalThis.__tiletown && globalThis.__tiletown.ready, null, { timeout: 90000 });
    await page.evaluate(async () => { await globalThis.__tiletown.ready; });
  } catch (err) {
    const shot = path.join(OUT, scenario.file.replace('.png', '-timeout.png'));
    await page.screenshot({ path: shot, scale: 'css' }).catch(() => {});
    throw new Error(`${scenario.name} : la page n'est pas prête (${err.message.split('\n')[0]}).\nMessages :\n${logs.map((l) => '  ' + l).join('\n') || '  (aucun)'}\nCapture : ${shot}`);
  }
  const readyMs = Date.now() - t0;
  // Quelques images de plus pour stabiliser (sous SwiftShader la première est lente : compilation des shaders).
  const frameMedianMs = await page.evaluate(() => {
    const t = globalThis.__tiletown;
    if (typeof t.renderFrames === 'function') return t.renderFrames(8);
    const r = t.renderer;
    if (!r || typeof r.render !== 'function') return null;
    const times = [];
    for (let i = 0; i < 8; i++) { if (r.invalidate) r.invalidate(); r.render(1 / 60); times.push(r.stats().frameMs); }
    times.sort((a, b) => a - b);
    return times[Math.floor(times.length / 2)];
  });
  await page.waitForTimeout(150);
  const stats = await page.evaluate(() => globalThis.__tiletown.stats());
  const gl = await page.evaluate(() => {
    const r = globalThis.__tiletown.renderer;
    const ctx = r && r.debug ? r.debug.renderer.getContext() : null;
    if (!ctx) return null;
    const dbg = ctx.getExtension('WEBGL_debug_renderer_info');
    return { renderer: dbg ? ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER), samples: ctx.getParameter(ctx.SAMPLES), multiDraw: Boolean(ctx.getExtension('WEBGL_multi_draw')) };
  });
  const shot = path.join(OUT, scenario.file);
  await page.screenshot({ path: shot, scale: 'css' });
  await context.close();
  return { ...scenario, readyMs, frameMedianMs, stats, gl, logs, screenshot: path.relative(ROOT, shot) };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const hasMain = existsSync(path.join(ROOT, 'src', 'main.js')) && existsSync(path.join(ROOT, 'dev.html'));
  const fixture = 'tools/measure-fixture.html';
  const mainPage = PAGE || (hasMain ? 'dev.html?stats=1' : `${fixture}?stats=1`);
  const scenarios = [
    { name: 'Carte 412 × 915 (Pixel 7)', page: mainPage, width: 412, height: 915, dpr: 2.625, file: 'map-412.png' },
    { name: 'Carte 360 × 740 (petit Android)', page: mainPage, width: 360, height: 740, dpr: 2, file: 'map-360.png' },
  ];
  if (existsSync(path.join(ROOT, fixture))) {
    scenarios.push({ name: 'Charge : 24 × 24, ≈ 500 îlots', page: `${fixture}?stats=1&stress=1`, width: 412, height: 915, dpr: 2.625, file: 'map-stress.png' });
  }

  const exe = findChromium();
  if (!exe) throw new Error('Chromium introuvable (PLAYWRIGHT_BROWSERS_PATH, TILETOWN_CHROMIUM).');
  const { server, port } = await serve(ROOT, PORT);
  const base = `http://127.0.0.1:${port}/`;
  const browser = await chromium.launch({
    executablePath: exe,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const results = [];
  try {
    for (const s of scenarios) {
      process.stdout.write(`… ${s.name} (${s.page})\n`);
      results.push(await measureScenario(browser, base, s));
    }
  } finally {
    await browser.close();
    server.close();
  }
  const precache = await precacheBytes();

  // Critères §7 : le pire des scénarios compte pour les appels ; le scénario de charge pour les triangles.
  const ref = results[0];
  const stress = results.find((r) => r.file === 'map-stress.png') || ref;
  const maxCalls = Math.max(...results.map((r) => r.stats.calls));
  const rows = [
    ['Appels de dessin ≤ 60', `${maxCalls} (max.)`, maxCalls <= CRITERIA.calls],
    ['Triangles ≤ 150 000 (500 îlots, passe d\u2019ombre comprise)', `${stress.stats.triangles} (${stress.stats.buildings ? stress.stats.buildings.placements : '?'} instances) ; carte de jeu : ${ref.stats.triangles}`, stress.stats.triangles <= CRITERIA.triangles],
    ['Image < 16 ms (indicatif : temps CPU de render(), SwiftShader)', `${ref.frameMedianMs == null ? '?' : ref.frameMedianMs.toFixed(1)} ms médiane`, (ref.frameMedianMs ?? 99) < CRITERIA.frameMs],
    ['Précache < 6 Mo', `${fmtMB(precache.bytes)} (${precache.method})`, precache.bytes < CRITERIA.precacheBytes],
    ['Captures enregistrées', results.map((r) => r.screenshot).join(', '), results.every((r) => existsSync(path.join(ROOT, r.screenshot)))],
    ['Aucune erreur de page', results.reduce((n, r) => n + r.logs.filter((l) => l.startsWith('[pageerror]')).length, 0) + ' erreur(s)', results.every((r) => !r.logs.some((l) => l.startsWith('[pageerror]')))],
  ];

  const report = {
    date: new Date().toISOString(),
    chromium: exe,
    webgl: ref.gl,
    page: mainPage,
    precache,
    criteria: Object.fromEntries(rows.map(([k, value, ok]) => [k, { value, ok }])),
    scenarios: results,
  };
  await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));

  console.log(`\nRendu WebGL : ${ref.gl ? ref.gl.renderer : '?'} — MSAA ${ref.gl ? ref.gl.samples : '?'} échantillons — WEBGL_multi_draw ${ref.gl && ref.gl.multiDraw ? 'oui' : 'non'}`);
  console.log(`Page : ${mainPage}\n`);
  console.log('| Scénario | Appels | Triangles | Image (ms, médiane) | Prêt (ms) | Instances | Stratégie |');
  console.log('|---|---:|---:|---:|---:|---:|---|');
  for (const r of results) {
    console.log(`| ${r.name} | ${r.stats.calls} | ${r.stats.triangles} | ${r.frameMedianMs == null ? '?' : r.frameMedianMs.toFixed(1)} | ${r.readyMs} | ${r.stats.buildings ? r.stats.buildings.placements : '?'} | ${r.stats.strategy} |`);
  }
  console.log('\n| Critère §7 | Mesure | Résultat |');
  console.log('|---|---|:-:|');
  for (const [k, v, ok] of rows) console.log(`| ${k} | ${v} | ${ok ? 'OK' : 'KO'} |`);
  const warnings = results.flatMap((r) => r.logs);
  if (warnings.length) console.log('\nMessages de la page :\n' + warnings.map((l) => '  ' + l).join('\n'));
  console.log(`\nRapport : ${path.relative(ROOT, path.join(OUT, 'report.json'))}`);
  if (STRICT && rows.some(([, , ok]) => !ok)) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
