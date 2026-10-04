#!/usr/bin/env node
// Mesures de la vallée animée (docs/ARCHITECTURE.md §8.4) avec Playwright + Chromium SwiftShader :
// sert le dépôt, ouvre tools/actors-fixture.html en 412 × 915 (DPR 2,625), attend la première image et le
// chargement des modèles animés, mesure pendant 3 s le temps CPU de `updateActors` + `layer.update`, lit
// appels de dessin et triangles, enregistre deux captures à 2 s d'écart (actors-1.png, actors-2.png) et
// vérifie que les acteurs ont bougé. Scénario de charge : ?stress=1 (plafonds × 2).
//
//   node tools/measure-actors.mjs [--out tools/measure-out] [--port 0] [--no-stress]

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
const WITH_STRESS = !args.includes('--no-stress');

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

async function measure(browser, base, scenario) {
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()} ${m.location() && m.location().url ? `(${m.location().url})` : ''}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`); });
  page.on('requestfailed', (r) => logs.push(`[requête échouée] ${r.url()} ${r.failure() ? r.failure().errorText : ''}`));
  await page.goto(base + scenario.page, { waitUntil: 'load' });
  await page.waitForFunction(() => globalThis.__tiletown && globalThis.__tiletown.ready, null, { timeout: 120000 });
  await page.evaluate(() => globalThis.__tiletown.layer.ready());
  await page.waitForTimeout(500);
  await page.evaluate(() => globalThis.__tiletown.resetTiming());
  await page.waitForTimeout(3000);
  const stats = await page.evaluate(() => globalThis.__tiletown.stats());
  const snap1 = await page.evaluate(() => globalThis.__tiletown.snapshot());
  const scale = scenario.device ? 'device' : 'css';
  const shot1 = path.join(OUT, `${scenario.file}-1.png`);
  await page.screenshot({ path: shot1, scale });
  await page.waitForTimeout(2000);
  const snap2 = await page.evaluate(() => globalThis.__tiletown.snapshot());
  const shot2 = path.join(OUT, `${scenario.file}-2.png`);
  await page.screenshot({ path: shot2, scale });
  const by1 = new Map(snap1.map((a) => [a.id, a]));
  let moved = 0, common = 0;
  for (const a of snap2) {
    const b = by1.get(a.id);
    if (!b) continue;
    common++;
    if (Math.hypot(a.x - b.x, a.z - b.z) > 0.05 || Math.abs(a.y - b.y) > 0.05) moved++;
  }
  await context.close();
  const t = stats.timing;
  return {
    ...scenario, stats, logs, moved, common,
    cpu: { updateMs: t.updateMs / Math.max(1, t.frames), layerMs: t.layerMs / Math.max(1, t.frames), updateMax: t.updateMax, layerMax: t.layerMax, frames: t.frames },
    screenshots: [path.relative(ROOT, shot1), path.relative(ROOT, shot2)],
  };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const exe = findChromium();
  if (!exe) throw new Error('Chromium introuvable');
  const { server, port } = await serve(ROOT, PORT);
  const base = `http://127.0.0.1:${port}/`;
  const browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const scenarios = [
    { name: 'Vallée animée 12 × 16 (vue de jeu)', page: 'tools/actors-fixture.html?stats=1&zoom=5', file: 'actors' },
    { name: 'Gros plan ville (trottoirs, voitures)', page: 'tools/actors-fixture.html?stats=1&look=town&zoom=3', file: 'actors-town' },
    { name: 'Gros plan forêt et rivière', page: 'tools/actors-fixture.html?stats=1&look=forest&zoom=4.5', file: 'actors-nature' },
    { name: 'Très gros plan (trottoirs, sens de circulation), pleine résolution', page: 'tools/actors-fixture.html?look=town&zoom=1.8', file: 'actors-closeup', device: true },
    { name: 'Faune en pantins dérivés des squelettes (?skinned=0)', page: 'tools/actors-fixture.html?stats=1&look=forest&zoom=2.5&skinned=0', file: 'actors-puppets', device: true },
  ];
  if (WITH_STRESS) scenarios.push({ name: 'Charge ×2 (24 × 24, plafonds doublés)', page: 'tools/actors-fixture.html?stats=1&stress=1&view=all', file: 'actors-stress' });
  const results = [];
  try {
    for (const s of scenarios) { process.stdout.write(`… ${s.name}\n`); results.push(await measure(browser, base, s)); }
  } finally {
    await browser.close();
    server.close();
  }
  console.log('\n| Scénario | Appels | Triangles | updateActors (ms) | layer.update (ms) | Habitants | Véhicules | Faune | Pantins | Squelettes | Dessinables acteurs | Bougé |');
  console.log('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const r of results) {
    const a = r.stats.actors.byGroup, l = r.stats.layer;
    console.log(`| ${r.name} | ${r.stats.calls} | ${r.stats.triangles} | ${r.cpu.updateMs.toFixed(2)} (max ${r.cpu.updateMax.toFixed(1)}) | ${r.cpu.layerMs.toFixed(2)} (max ${r.cpu.layerMax.toFixed(1)}) | ${a.habitant} | ${a.vehicle} | ${a.animal} | ${l.puppets} | ${l.skinned} | ${l.drawables} | ${r.moved}/${r.common} |`);
  }
  for (const r of results) {
    console.log(`\n${r.name} : par genre ${JSON.stringify(r.stats.actors.byKind)} ; rigs ${JSON.stringify(r.stats.layer.rigs)} ; captures ${r.screenshots.join(', ')}`);
    if (r.logs.length) console.log('  Messages :\n' + r.logs.map((l) => '    ' + l).join('\n'));
  }
  await fs.writeFile(path.join(OUT, 'actors-report.json'), JSON.stringify({ date: new Date().toISOString(), results }, null, 2));
  console.log(`\nRapport : ${path.relative(ROOT, path.join(OUT, 'actors-report.json'))}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
