#!/usr/bin/env node
// Captures comparées de l'ORGANISATION DU DÉCOR (semis de la végétation, abords des rues) sur la
// scène de référence `tools/placement-fixture.html`, avec Playwright + Chromium SwiftShader.
//
//   node tools/placement-shot.mjs [--out tools/measure-out] [--ref HEAD] [--only apres]
//
// Produit, dans tools/measure-out/ :
//   placement-avant.png    la même scène avec les buildings.js / roads.js de la référence git
//   placement-apres.png    la scène avec le code de travail
//   placement-foret.png    gros plan sur le massif de forêt
//   placement-lisiere.png  gros plan sur la lisière (débordement, arbustes, clairières)
//   placement-rue.png      gros plan sur le pâté de ville (trottoirs, parcelles, allées)
//   placement-maisons.png  gros plan sur les trois maisons et leurs jardins
//   placement-report.json  appels de dessin, triangles, temps par image, nombre d'instances
//
// « Avant » est obtenu en recopiant l'arbre de travail dans un dossier temporaire et en y
// REMETTANT les deux seuls fichiers de ce chantier (`src/render3d/buildings.js` et
// `src/render3d/roads.js`) dans leur version de référence : la comparaison porte donc bien sur ce
// travail, et non sur les chantiers menés en parallèle (terrain, modèles).

import { createServer } from 'node:http';
import { promises as fs, existsSync, readdirSync, mkdirSync, cpSync, symlinkSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const OUT = path.resolve(ROOT, flag('--out', 'tools/measure-out'));
const REF = flag('--ref', 'HEAD');
const ONLY = flag('--only', null);
const VIEWPORT = { width: 412, height: 915, dpr: 2 };

/** Les deux fichiers de ce chantier : eux seuls reviennent à la version de référence pour « avant ». */
const OWNED = ['src/render3d/buildings.js', 'src/render3d/roads.js'];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.wasm': 'application/wasm',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon',
};

/** Serveur statique : `/` sert l'arbre de travail, `/__avant/` l'arbre de référence. */
function serve(roots) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let rel = decodeURIComponent(url.pathname);
      let root = roots.now;
      if (rel.startsWith('/__avant/')) { root = roots.before; rel = rel.slice('/__avant'.length); }
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.normalize(path.join(root, rel));
      const data = await fs.readFile(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(data);
    } catch {
      res.writeHead(404); res.end('404');
    }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

/** Chromium à lancer : TILETOWN_CHROMIUM, sinon le plus récent de /opt/pw-browsers, sinon Playwright. */
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

/** Prépare l'arbre « avant » : copie de l'arbre de travail, puis les fichiers de ce chantier à `REF`. */
function prepareBefore() {
  const dir = path.join(os.tmpdir(), `tiletown-avant-${process.pid}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const name of ['src', 'assets', 'tools', 'css']) {
    if (existsSync(path.join(ROOT, name))) cpSync(path.join(ROOT, name), path.join(dir, name), { recursive: true });
  }
  symlinkSync(path.join(ROOT, 'node_modules'), path.join(dir, 'node_modules'));
  for (const rel of OWNED) {
    const content = execFileSync('git', ['-C', ROOT, 'show', `${REF}:${rel}`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

/** Ouvre une page, attend qu'elle soit prête, cadre une vue, capture et relève les mesures. */
async function shoot(browser, base, { page: pagePath, view, file, label, big = false }) {
  const vp = big ? { width: 900, height: 1200, dpr: 1 } : VIEWPORT;
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr, isMobile: !big, hasTouch: !big,
  });
  const page = await context.newPage();
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error') logs.push(`[error] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  await page.goto(`${base}${pagePath}`, { waitUntil: 'load' });
  try {
    await page.waitForFunction(() => globalThis.__tiletown && globalThis.__tiletown.ready, null, { timeout: 90000 });
  } catch (err) {
    await page.screenshot({ path: path.join(OUT, file.replace('.png', '-timeout.png')), scale: 'css' }).catch(() => {});
    await context.close();
    throw new Error(`${label} : page non prête (${err.message.split('\n')[0]})\n${logs.join('\n')}`);
  }
  if (view) await page.evaluate((v) => globalThis.__tiletown.look(v), view);
  const frameMedianMs = await page.evaluate(() => globalThis.__tiletown.renderFrames(8));
  await page.waitForTimeout(120);
  const stats = await page.evaluate(() => globalThis.__tiletown.stats());
  const shot = path.join(OUT, file);
  await page.screenshot({ path: shot, scale: 'css' });
  await context.close();
  return { label, view: view || 'all', file: path.relative(ROOT, shot), frameMedianMs, stats, logs };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const exe = findChromium();
  if (!exe) throw new Error('Chromium introuvable (PLAYWRIGHT_BROWSERS_PATH, TILETOWN_CHROMIUM).');
  const before = ONLY === 'apres' ? null : prepareBefore();
  const { server, port } = await serve({ now: ROOT, before: before || ROOT });
  const base = `http://127.0.0.1:${port}/`;
  const browser = await chromium.launch({
    executablePath: exe,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });

  const fixture = 'tools/placement-fixture.html?stats=1';
  const jobs = [];
  if (before) jobs.push({ label: 'avant', page: `__avant/${fixture}`, view: 'all', file: 'placement-avant.png' });
  jobs.push({ label: 'après', page: fixture, view: 'all', file: 'placement-apres.png' });
  jobs.push({ label: 'forêt', page: fixture, view: 'foret', file: 'placement-foret.png' });
  jobs.push({ label: 'lisière', page: fixture, view: 'lisiere', file: 'placement-lisiere.png' });
  jobs.push({ label: 'rue', page: fixture, view: 'rue', file: 'placement-rue.png' });
  jobs.push({ label: 'maisons', page: fixture, view: 'maisons', file: 'placement-maisons.png' });
  jobs.push({ label: 'carrefour', page: fixture, view: 'carrefour', file: 'placement-carrefour.png', big: true });
  jobs.push({ label: 'jardin', page: fixture, view: 'jardin', file: 'placement-jardin.png', big: true });
  if (before) {
    jobs.push({ label: 'forêt (avant)', page: `__avant/${fixture}`, view: 'foret', file: 'placement-foret-avant.png' });
    jobs.push({ label: 'rue (avant)', page: `__avant/${fixture}`, view: 'rue', file: 'placement-rue-avant.png' });
    jobs.push({ label: 'carrefour (avant)', page: `__avant/${fixture}`, view: 'carrefour', file: 'placement-carrefour-avant.png', big: true });
  }

  const results = [];
  try {
    for (const job of jobs) {
      process.stdout.write(`… ${job.label} (${job.view})\n`);
      results.push(await shoot(browser, base, job));
    }
  } finally {
    await browser.close();
    server.close();
    if (before) rmSync(before, { recursive: true, force: true });
  }

  await fs.writeFile(path.join(OUT, 'placement-report.json'), JSON.stringify({ date: new Date().toISOString(), ref: REF, results }, null, 2));
  console.log('\n| Capture | Appels | Triangles | Image (ms) | Instances | Arbres | Couvre-sol | Parcelles |');
  console.log('|---|---:|---:|---:|---:|---:|---:|---:|');
  for (const r of results) {
    const b = r.stats.buildings || {}, rd = r.stats.roads || {};
    console.log(`| ${r.label} — ${r.file} | ${r.stats.calls} | ${r.stats.triangles} | ${r.frameMedianMs == null ? '?' : r.frameMedianMs.toFixed(1)} | ${b.placements ?? '?'} | ${b.trees ?? '—'} | ${b.cover ?? '—'} | ${rd.lots ?? '—'} |`);
  }
  const errors = results.flatMap((r) => r.logs);
  if (errors.length) console.log('\nMessages de page :\n' + errors.map((l) => '  ' + l).join('\n'));
  console.log(`\nRapport : ${path.relative(ROOT, path.join(OUT, 'placement-report.json'))}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
