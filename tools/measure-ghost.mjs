#!/usr/bin/env node
// Mesures du fantôme de pose (docs/ARCHITECTURE.md §9.2) avec Playwright + Chromium SwiftShader : sert le
// dépôt, ouvre tools/ghost-fixture.html en 412 × 915 (DPR 2) dans chaque état (none = fantôme caché, puis
// ok, ko, warn), attend la première image, lit `window.__tiletown.stats()` (appels de dessin, triangles,
// fantôme), enregistre les captures tools/measure-out/ghost-ok.png, ghost-ko.png, ghost-warn.png et un
// rapport ghost-report.json, puis imprime le tableau : le fantôme affiché doit coûter au plus 3 appels de
// dessin de plus que la carte seule, et la page ne doit produire aucune erreur.
//
//   node tools/measure-ghost.mjs [--out tools/measure-out] [--port 0] [--seed 12345] [--strict]

import { createServer } from 'node:http';
import { promises as fs, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const OUT = path.resolve(ROOT, flag('--out', 'tools/measure-out'));
const PORT = Number(flag('--port', '0'));
const SEED = flag('--seed', null);
const STRICT = args.includes('--strict');
const MAX_EXTRA_CALLS = 3;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png',
  '.wasm': 'application/wasm', '.woff2': 'font/woff2',
};

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

/** Chromium à lancer : TILETOWN_CHROMIUM, sinon le plus récent de /opt/pw-browsers, sinon celui de Playwright. */
function findChromium() {
  if (process.env.TILETOWN_CHROMIUM && existsSync(process.env.TILETOWN_CHROMIUM)) return process.env.TILETOWN_CHROMIUM;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    const dirs = readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => Number(b.slice(9)) - Number(a.slice(9)));
    for (const d of dirs) { const exe = path.join(base, d, 'chrome-linux', 'chrome'); if (existsSync(exe)) return exe; }
  } catch { /* absent */ }
  try { const exe = chromium.executablePath(); if (existsSync(exe)) return exe; } catch { /* absent */ }
  return null;
}

/** Scénarios : état de la fixture, paramètres de vue, nom de capture (null : pas de capture). */
const SCENARIOS = [
  { state: 'none', file: null },
  { state: 'ok', file: 'ghost-ok.png' },
  { state: 'ko', file: 'ghost-ko.png' },
  { state: 'warn', file: 'ghost-warn.png' },
  // Gros plan sur la case du fantôme (zoom 4,5 u) : translucidité, cadre, pointillés sur la berge et le pont.
  { state: 'ok', file: 'ghost-ok-close.png', extra: { view: 'target', zoom: '4.5' } },
];

async function measureState(browser, base, scenario) {
  const { state } = scenario;
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`); });
  page.on('requestfailed', (r) => logs.push(`[requête échouée] ${r.url()} ${r.failure() ? r.failure().errorText : ''}`));
  const query = new URLSearchParams({ state, stats: '1', ...(scenario.extra || {}) });
  if (SEED) query.set('seed', SEED);
  await page.goto(`${base}tools/ghost-fixture.html?${query}`, { waitUntil: 'load' });
  await page.waitForFunction(() => globalThis.__tiletown && globalThis.__tiletown.ready, null, { timeout: 120000 });
  await page.waitForTimeout(400); // quelques images : respiration, acteurs, stabilisation des appels
  const frameMedianMs = await page.evaluate(() => globalThis.__tiletown.renderFrames(8));
  const info = await page.evaluate(() => {
    const t = globalThis.__tiletown;
    return { stats: t.stats(), state: t.state, target: t.target, forbidden: t.forbidden, pathEdges: t.path.length, equipped: t.equipped, link: t.link };
  });
  let screenshot = null;
  if (scenario.file) {
    screenshot = path.join(OUT, scenario.file);
    await page.screenshot({ path: screenshot, scale: 'device' });
  }
  await context.close();
  return { state, name: scenario.file ? scenario.file.replace(/^ghost-|\.png$/g, '') : state, ...info, frameMedianMs, logs, screenshot: screenshot ? path.relative(ROOT, screenshot) : null };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
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
    for (const scenario of SCENARIOS) {
      process.stdout.write(`… état ${scenario.state}${scenario.extra ? ' (gros plan)' : ''}\n`);
      results.push(await measureState(browser, base, scenario));
    }
  } finally {
    await browser.close();
    server.close();
  }

  const baseline = results.find((r) => r.state === 'none');
  const rows = [];
  for (const r of results.filter((r) => r.state !== 'none' && !r.name.endsWith('close'))) {
    const extra = r.stats.calls - baseline.stats.calls;
    rows.push([`Appels de dessin en plus (${r.state}) ≤ ${MAX_EXTRA_CALLS}`, `${baseline.stats.calls} → ${r.stats.calls} (+${extra}) ; fantôme ${r.stats.ghost.visible ? 'visible' : 'caché'}, ${r.stats.ghost.dashes} pointillés, ${r.stats.ghost.highlights} surbrillances`, extra <= MAX_EXTRA_CALLS]);
  }
  rows.push(['Appels de dessin ≤ 60 avec le fantôme', `${Math.max(...results.map((r) => r.stats.calls))} (max.)`, Math.max(...results.map((r) => r.stats.calls)) <= 60]);
  const ok = results.find((r) => r.state === 'ok');
  rows.push(['Tracé de raccordement : pont sur la rivière et une arête déjà équipée', `${ok.pathEdges} arêtes, ponts ${ok.link.bridges ?? 0}, équipée ${ok.equipped ? `${ok.equipped.kind}(${ok.equipped.x}, ${ok.equipped.y})` : 'aucune'} ; ${ok.stats.ghost.dashes} pointillés`, (ok.link.bridges ?? 0) >= 1 && Boolean(ok.equipped) && ok.stats.ghost.dashes === (ok.pathEdges - 1) * 4]);
  rows.push(['Captures enregistrées', results.filter((r) => r.screenshot).map((r) => r.screenshot).join(', '), results.filter((r) => r.screenshot).every((r) => existsSync(path.join(ROOT, r.screenshot)))]);
  rows.push(['Aucune erreur de page', results.reduce((n, r) => n + r.logs.filter((l) => l.startsWith('[pageerror]') || l.startsWith('[error]')).length, 0) + ' erreur(s)', results.every((r) => !r.logs.some((l) => l.startsWith('[pageerror]') || l.startsWith('[error]')))]);

  const report = { date: new Date().toISOString(), chromium: exe, criteria: Object.fromEntries(rows.map(([k, value, ok]) => [k, { value, ok }])), results };
  await fs.writeFile(path.join(OUT, 'ghost-report.json'), JSON.stringify(report, null, 2));

  console.log('\n| État | Appels | Triangles | Image (ms, médiane) | Fantôme | Pointillés | Surbrillances |');
  console.log('|---|---:|---:|---:|---|---:|---:|');
  for (const r of results) console.log(`| ${r.name} | ${r.stats.calls} | ${r.stats.triangles} | ${r.frameMedianMs == null ? '?' : r.frameMedianMs.toFixed(1)} | ${r.stats.ghost.visible ? 'visible' : 'caché'} | ${r.stats.ghost.dashes} | ${r.stats.ghost.highlights} |`);
  console.log('\n| Critère §9.2 | Mesure | Résultat |');
  console.log('|---|---|:-:|');
  for (const [k, v, okRow] of rows) console.log(`| ${k} | ${v} | ${okRow ? 'OK' : 'KO'} |`);
  const warnings = results.flatMap((r) => r.logs);
  if (warnings.length) console.log('\nMessages de la page :\n' + warnings.map((l) => '  ' + l).join('\n'));
  console.log(`\nRapport : ${path.relative(ROOT, path.join(OUT, 'ghost-report.json'))}`);
  if (STRICT && rows.some(([, , okRow]) => !okRow)) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
