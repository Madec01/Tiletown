#!/usr/bin/env node
// Mesures du rendu de l'écologie (docs/ARCHITECTURE.md §10.3) avec Playwright + Chromium SwiftShader :
// sert le dépôt, ouvre tools/eco-fixture.html en 412 × 915 (DPR 2) dans chaque cas (référence sans
// écologie, les quatre calques, les hachures du mode daltonien, les icônes d'espèces, la brume),
// attend la première image, lit `window.__tiletown.stats()`, enregistre les captures
// tools/measure-out/eco-*.png et un rapport eco-report.json, puis imprime le tableau des critères :
// au plus 60 appels de dessin dans chaque cas, au plus 2 appels de plus que la carte seule pour les
// icônes et la brume, et aucune erreur de page.
//
//   node tools/measure-eco.mjs [--out tools/measure-out] [--port 0] [--seed 12345] [--strict]

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
const MAX_CALLS = 60;
const MAX_EXTRA_CALLS = 2;

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

/** Chromium à lancer : TILETOWN_CHROMIUM, sinon le plus récent de /opt/pw-browsers, sinon Playwright. */
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

/** Cas mesurés : nom, paramètres de la fixture, capture (null = pas de capture). */
const CASES = [
  { name: 'référence (sans écologie)', query: { eco: '0' }, file: null },
  { name: 'calque air', query: { layer: 'air' }, file: 'eco-layer-air.png' },
  { name: 'calque eau', query: { layer: 'water' }, file: 'eco-layer-water.png' },
  { name: 'calque faune', query: { layer: 'fauna' }, file: 'eco-layer-fauna.png' },
  { name: 'calque sols', query: { layer: 'soil' }, file: 'eco-layer-soil.png' },
  { name: 'hachures (daltonien)', query: { layer: 'air', pattern: '1' }, file: 'eco-pattern.png' },
  { name: 'icônes d’espèces', query: { species: '1' }, file: 'eco-species.png' },
  { name: 'brume d’air vicié', query: { haze: '1' }, file: 'eco-haze.png' },
  { name: 'tout ensemble', query: { layer: 'air', pattern: '1', species: '1', haze: '1' }, file: 'eco-all.png' },
  { name: 'gros plan sur la ville', query: { species: '1', haze: '1', view: 'town', zoom: '7' }, file: 'eco-town.png' },
  // Gros plans de contrôle : on y vérifie à l'œil que les bâtiments restent reconnaissables sous le
  // calque, que les hachures se lisent sur l'eau et les collines, et que la brume ne noie pas la ville.
  { name: 'gros plan calque air', query: { layer: 'air', view: 'town', zoom: '7' }, file: 'eco-layer-air-town.png' },
  { name: 'gros plan hachures', query: { layer: 'air', pattern: '1', view: 'town', zoom: '7' }, file: 'eco-pattern-town.png' },
  { name: 'gros plan calque eau', query: { layer: 'water', view: 'town', zoom: '7' }, file: 'eco-layer-water-town.png' },
  { name: 'gros plan sur l’usine (eau trouble, brume)', query: { haze: '1', species: '1', view: 'factory', zoom: '7' }, file: 'eco-factory.png' },
];

async function measureCase(browser, base, scenario) {
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`); });
  page.on('requestfailed', (r) => logs.push(`[requête échouée] ${r.url()} ${r.failure() ? r.failure().errorText : ''}`));
  const query = new URLSearchParams({ stats: '1', ...scenario.query });
  if (SEED) query.set('seed', SEED);
  await page.goto(`${base}tools/eco-fixture.html?${query}`, { waitUntil: 'load' });
  await page.waitForFunction(() => globalThis.__tiletown && globalThis.__tiletown.ready, null, { timeout: 120000 });
  await page.waitForTimeout(600);   // quelques images : apparition des icônes, brume, eau animée
  const frameMedianMs = await page.evaluate(() => globalThis.__tiletown.renderFrames(8));
  const info = await page.evaluate(() => {
    const t = globalThis.__tiletown;
    const eco = t.eco;
    const over = Array.from(eco.air).filter((v) => v > 50).length;
    return {
      stats: t.stats(),
      legend: t.legend,
      options: t.options,
      cellsOver50: over,
      sources: eco.sources,
      present: Object.entries(eco.species).filter(([, s]) => s.present).map(([id]) => id),
      patches: eco.patches.length,
    };
  });
  let screenshot = null;
  if (scenario.file) {
    screenshot = path.join(OUT, scenario.file);
    await page.screenshot({ path: screenshot, scale: 'css' });
  }
  await context.close();
  return { name: scenario.name, query: scenario.query, ...info, frameMedianMs, logs, screenshot: screenshot ? path.relative(ROOT, screenshot) : null };
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
    for (const scenario of CASES) {
      process.stdout.write(`… ${scenario.name}\n`);
      results.push(await measureCase(browser, base, scenario));
    }
  } finally {
    await browser.close();
    server.close();
  }

  const ref = results[0];
  const byName = (name) => results.find((r) => r.name === name);
  const maxCalls = Math.max(...results.map((r) => r.stats.calls));
  const speciesCase = byName('icônes d’espèces');
  const hazeCase = byName('brume d’air vicié');
  const patternCase = byName('hachures (daltonien)');
  const rows = [
    [`Appels de dessin ≤ ${MAX_CALLS} dans tous les cas`, `${maxCalls} (max.) ; référence ${ref.stats.calls}`, maxCalls <= MAX_CALLS],
    [`Icônes d’espèces : ≤ ${MAX_EXTRA_CALLS} appels de plus`, `${ref.stats.calls} → ${speciesCase.stats.calls} (+${speciesCase.stats.calls - ref.stats.calls}) pour ${speciesCase.stats.species.instances} icônes (${speciesCase.present.join(', ') || 'aucune'})`, speciesCase.stats.calls - ref.stats.calls <= MAX_EXTRA_CALLS && speciesCase.stats.species.instances > 0],
    [`Brume : ≤ ${MAX_EXTRA_CALLS} appels de plus`, `${ref.stats.calls} → ${hazeCase.stats.calls} (+${hazeCase.stats.calls - ref.stats.calls}) pour ${hazeCase.stats.effects.haze} voiles (${hazeCase.cellsOver50} cases > 50)`, hazeCase.stats.calls - ref.stats.calls <= MAX_EXTRA_CALLS && hazeCase.stats.effects.haze > 0],
    ['Hachures : aucun appel de dessin de plus que le calque seul', `${byName('calque air').stats.calls} → ${patternCase.stats.calls}`, patternCase.stats.calls <= byName('calque air').stats.calls],
    ['Chaque calque a sa légende (libellé, unité, trois paliers)', results.filter((r) => r.legend && r.legend.kind !== 'none').map((r) => `${r.legend.label} : ${r.legend.stops.map((s) => `${s.label} ${s.value}`).join(' → ')}`).join(' ; '), ['air', 'water', 'fauna', 'soil'].every((k) => { const c = results.find((r) => r.query.layer === k); return c && c.legend.stops.length === 3; })],
    ['Captures enregistrées', results.filter((r) => r.screenshot).map((r) => r.screenshot).join(', '), results.filter((r) => r.screenshot).every((r) => existsSync(path.join(ROOT, r.screenshot)))],
    ['Aucune erreur de page', results.reduce((n, r) => n + r.logs.filter((l) => l.startsWith('[pageerror]') || l.startsWith('[error]')).length, 0) + ' erreur(s)', results.every((r) => !r.logs.some((l) => l.startsWith('[pageerror]') || l.startsWith('[error]')))],
  ];

  const report = { date: new Date().toISOString(), chromium: exe, criteria: Object.fromEntries(rows.map(([k, value, ok]) => [k, { value, ok }])), results };
  await fs.writeFile(path.join(OUT, 'eco-report.json'), JSON.stringify(report, null, 2));

  console.log('\n| Cas | Appels | Triangles | Image (ms) | Icônes | Voiles | Calque |');
  console.log('|---|---:|---:|---:|---:|---:|---|');
  for (const r of results) {
    console.log(`| ${r.name} | ${r.stats.calls} | ${r.stats.triangles} | ${r.frameMedianMs == null ? '?' : r.frameMedianMs.toFixed(1)} | ${r.stats.species.instances} | ${r.stats.effects.haze} | ${r.stats.layer.kind}${r.stats.layer.pattern ? ' + hachures' : ''} |`);
  }
  console.log('\n| Critère §10.3 | Mesure | Résultat |');
  console.log('|---|---|:-:|');
  for (const [k, v, ok] of rows) console.log(`| ${k} | ${v} | ${ok ? 'OK' : 'KO'} |`);
  const warnings = results.flatMap((r) => r.logs);
  if (warnings.length) console.log('\nMessages de la page :\n' + warnings.map((l) => '  ' + l).join('\n'));
  console.log(`\nRapport : ${path.relative(ROOT, path.join(OUT, 'eco-report.json'))}`);
  if (STRICT && rows.some(([, , ok]) => !ok)) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
