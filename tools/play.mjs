#!/usr/bin/env node
// Parcours de jeu automatisé (docs/ARCHITECTURE.md §9.4) avec Playwright + Chromium SwiftShader, en gestes
// tactiles sur l'écran de référence (412 × 915, DPR 2,625) : ouvrir le catalogue, prendre une carte, poser un
// quartier sur une case libre (fantôme puis ✓), poser une forêt plantée, démolir, annuler, passer à ×4 et
// attendre un mois (l'argent bouge) puis le bilan de saison (3e mois), recharger la page (partie restaurée).
// Vérifie aussi : aucune erreur de console, ≤ 60 appels de dessin avec le fantôme affiché, cibles touchées
// réellement (les boutons sont visés par Playwright, les cases par r.camera.toScreen). Captures dans
// tools/measure-out/play-*.png à chaque étape, rapport tools/measure-out/play-report.json.
//
//   node tools/play.mjs [--out tools/measure-out] [--port 0] [--keep]     code de sortie 0 si tout est OK

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
const SEED = flag('--seed', '7');
const PAGE = `dev.html?stats=1&seed=${SEED}&nosw`;
const MAX_CALLS = 60;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon',
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

/** Chromium : variable TILETOWN_CHROMIUM, sinon le plus récent de /opt/pw-browsers, sinon celui de Playwright. */
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

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Fonctions évaluées dans la page.

/** Case libre où `id` se pose sans surcoût (ni défrichement ni rue à tracer), la plus proche de la mairie. */
function freeTileInPage(id) {
  const t = window.__tiletown;
  const w = t.game.world;
  const c = { x: Math.floor(w.cols / 2), y: Math.floor(w.rows / 2) };
  const out = [];
  for (let y = 1; y < w.rows - 1; y++) {
    for (let x = 1; x < w.cols - 1; x++) {
      const tile = w.tiles[y * w.cols + x];
      if (tile.building || (tile.terrain !== 'grass' && tile.terrain !== 'meadow')) continue;
      const res = t.canPlace(x, y, id);
      if (!res || !res.ok) continue;
      const extra = (res.clearing || 0) + ((res.path && res.path.length) || 0);
      out.push({ x, y, d: Math.abs(x - c.x) + Math.abs(y - c.y), extra, cost: res.cost });
    }
  }
  out.sort((a, b) => a.extra - b.extra || a.d - b.d);
  return out[0] || null;
}

/** Position écran (px CSS, coordonnées client) du centre d'une case ; recadre la caméra si la case est cachée. */
function screenOfTile({ x, y }) {
  const t = window.__tiletown;
  const r = t.renderer;
  const insets = t.hud.insets();
  const h = window.innerHeight;
  const visible = (p) => p.x > 24 && p.x < window.innerWidth - 24 && p.y > insets.top + 24 && p.y < h - insets.bottom - 24;
  let p = r.camera.toScreen(x + 0.5, 0, y + 0.5);
  if (!visible(p)) {
    r.camera.lookAt(x, y, 8, { insets: { top: insets.top, bottom: insets.bottom, left: 0, right: 0 } });
    r.invalidate(); r.render(1 / 60);
    p = r.camera.toScreen(x + 0.5, 0, y + 0.5);
  }
  const rect = document.querySelector('#scene').getBoundingClientRect();
  return { x: p.x + rect.left, y: p.y + rect.top, visible: visible(p) };
}

/** Instantané sérialisable de la partie et de l'interface, avec les cases demandées (autonome : évalué dans la page). */
function snapIn(cells) {
  const t = window.__tiletown;
  const g = t.game;
  const w = g.world;
  const ring = (x, y) => {
    const cols = w.cols;
    const hN = w.edges.h[y * cols + x], hS = w.edges.h[(y + 1) * cols + x];
    const vW = w.edges.v[y * (cols + 1) + x], vE = w.edges.v[y * (cols + 1) + x + 1];
    return { n: hN, s: hS, w: vW, e: vE, all: [hN, hS, vW, vE].every((v) => v >= 2) };
  };
  const text = (sel) => { const n = document.querySelector(sel); return n ? n.textContent : ''; };
  const out = {
    money: g.money, month: g.month, speed: g.speed, clock: g.clock,
    state: t.placement.state, hand: t.placement.hand,
    actionOpen: !!document.querySelector('#action.is-open'),
    actionTitle: text('#action .action-title'),
    actionSub: text('#action .action-sub'),
    sheetOpen: !!document.querySelector('#sheet-layer.is-open'),
    bannerOpen: !!document.querySelector('#alerts.is-open'),
    bannerText: text('#alerts'),
    speedText: text('#speed .speed-text'),
    moneyText: text('.gauge--money .gauge-value'),
    deltaText: text('.gauge-delta'),
    dateText: text('.hud-date'),
    undoToast: !!document.querySelector('#toasts .toast[data-key="undo"] .toast-go'),
    ghost: t.stats().ghost || null,
    calls: t.stats().calls,
    tiles: w.tiles.map((tile) => (tile.building ? `${tile.building.type}:${tile.terrain}` : tile.terrain)),
    cells: {},
  };
  for (const [name, c] of Object.entries(cells || {})) {
    if (!c) continue;
    const tile = w.tiles[c.y * w.cols + c.x];
    out.cells[name] = { x: c.x, y: c.y, building: tile.building ? tile.building.type : null, terrain: tile.terrain, native: tile.native, ring: ring(c.x, c.y) };
  }
  return out;
}

/** Nombre d'appels de dessin d'une image rendue maintenant (fantôme compris s'il est affiché). */
function drawCallsNow() {
  const r = window.__tiletown.renderer;
  r.invalidate();
  r.render(1 / 60);
  return r.stats().calls;
}

/** Montant total affiché dans le bandeau : « … = 160 $ » ou « Quartier · 60 $ ». */
function parseTotal(title) {
  const eq = /=\s*([\d\s  ]+)\s*\$/.exec(title);
  if (eq) return Number(eq[1].replace(/[\s  ]/g, ''));
  const dot = /·\s*([\d\s  ]+)\s*\$/.exec(title);
  return dot ? Number(dot[1].replace(/[\s  ]/g, '')) : NaN;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const exe = findChromium();
  if (!exe) throw new Error('Chromium introuvable (PLAYWRIGHT_BROWSERS_PATH, TILETOWN_CHROMIUM).');
  const { server, port } = await serve(ROOT, PORT);
  const base = `http://127.0.0.1:${port}/`;
  const browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error') logs.push(`[error] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`); });

  const steps = [];
  let shotIndex = 0;
  const shot = async (name) => {
    shotIndex += 1;
    const file = path.join(OUT, `play-${String(shotIndex).padStart(2, '0')}-${name}.png`);
    await page.screenshot({ path: file, scale: 'css' });
    return path.relative(ROOT, file);
  };
  const step = (name, ok, detail) => { steps.push({ name, ok: !!ok, detail }); process.stdout.write(`${ok ? 'OK' : 'KO'}  ${name}${detail ? ` — ${detail}` : ''}\n`); };
  const snap = (cells) => page.evaluate(snapIn, cells || {});
  const tapTile = async (cell) => {
    const p = await page.evaluate(screenOfTile, cell);
    await page.touchscreen.tap(p.x, p.y);
    await page.waitForTimeout(420); // (deux touchers rapprochés feraient un double toucher)
    return p;
  };
  const waitReady = async (url) => {
    await page.goto(base + url, { waitUntil: 'load' });
    await page.waitForFunction(() => globalThis.__tiletown && globalThis.__tiletown.ready, null, { timeout: 90000 });
    await page.waitForTimeout(400);
  };

  try {
    // ── 0. Démarrage (nouvelle partie) ──────────────────────────────────────────────────────
    await waitReady(`${PAGE}&new=1`);
    const s0 = await snap();
    step('Démarrage : partie neuve, 500 $, mars an 1', s0.money === 500 && s0.month === 0 && /Printemps/.test(s0.dateText), `${s0.moneyText} · ${s0.dateText} · ${s0.speedText}`);
    await shot('start');

    // ── 1. Catalogue : onglet Habitat → feuille, carte Quartier → en main ───────────────────
    await page.tap('#tabbar .tab--habitat');
    await page.waitForSelector('#sheet-layer.is-open .card[data-id="house"]', { timeout: 5000 });
    await page.waitForTimeout(350);
    const demand = await page.evaluate(() => [...document.querySelectorAll('.demand-row')].length);
    step('Onglet Habitat : feuille ouverte, barres de demande', demand === 3, `${demand} barres`);
    await shot('catalog');
    await page.tap('.card[data-id="house"]');
    await page.waitForTimeout(350);
    const s1 = await snap();
    step('Carte Quartier : feuille repliée, pastille « en main »', !s1.sheetOpen && s1.state === 'hand' && s1.hand === 'house' && s1.actionOpen && /Quartier/.test(s1.actionTitle), s1.actionTitle);
    await shot('hand');

    // ── 2. Fantôme sur une case libre, puis ✓ ───────────────────────────────────────────────
    const free = await page.evaluate(freeTileInPage, 'house');
    if (!free) throw new Error('aucune case libre pour un quartier');
    await page.evaluate(() => window.__tiletown.homeView());
    await tapTile(free);
    const s2 = await snap({ free });
    const callsGhost = await page.evaluate(drawCallsNow);
    step('Toucher une case : fantôme affiché, bandeau de résumé, ✓', s2.state === 'ghost' && s2.ghost && s2.ghost.visible && s2.actionOpen, `${s2.actionTitle} — ${s2.actionSub}`);
    step('Appels de dessin ≤ 60 avec le fantôme', callsGhost <= MAX_CALLS, `${callsGhost} appels`);
    await shot('ghost');
    const total = parseTotal(s2.actionTitle);
    const before = s2.money;
    await page.tap('#action .action-ok');
    await page.waitForTimeout(400);
    const s3 = await snap({ free });
    const ring = s3.cells.free.ring;
    step('✓ : argent diminué du coût affiché', Number.isFinite(total) && s3.money === before - total, `${before} − ${total} = ${s3.money}`);
    step('✓ : quartier présent dans game.world', s3.cells.free.building === 'house', `${free.x},${free.y}`);
    step('✓ : rue de ceinture autour du quartier', ring.all, JSON.stringify(ring));
    step('✓ : fantôme disparu, tuile toujours en main', s3.ghost && !s3.ghost.visible && s3.state === 'hand' && s3.hand === 'house', s3.actionTitle);
    step('✓ : message « Annuler » affiché', s3.undoToast);
    await shot('placed');

    // ── 3. Forêt plantée ────────────────────────────────────────────────────────────────────
    await page.tap('#action .action-x');
    await page.waitForTimeout(250);
    await page.tap('#tabbar .tab--nature');
    await page.waitForSelector('#sheet-layer.is-open .card[data-id="tree-planting"]', { timeout: 5000 });
    await page.waitForTimeout(300);
    await page.tap('.card[data-id="tree-planting"]');
    await page.waitForTimeout(300);
    const forest = await page.evaluate(freeTileInPage, 'tree-planting');
    if (!forest) throw new Error('aucune case libre pour une forêt plantée');
    await tapTile(forest);
    const s4 = await snap({ forest });
    await shot('ghost-forest');
    const totalF = parseTotal(s4.actionTitle);
    await page.tap('#action .action-ok');
    await page.waitForTimeout(400);
    const s5 = await snap({ forest });
    step('Forêt plantée : posée, argent diminué, terrain devenu forêt', s5.cells.forest.building === 'tree-planting' && s5.money === s4.money - totalF && s5.cells.forest.terrain === 'forest' && s5.cells.forest.native === false, `${s4.actionTitle} ; terrain ${s5.cells.forest.terrain}`);
    await shot('forest');

    // ── 4. Démolir le quartier ──────────────────────────────────────────────────────────────
    await page.tap('#action .action-x');
    await page.waitForTimeout(250);
    await page.tap('#tabbar .tab--demolish');
    await page.waitForTimeout(300);
    await tapTile(free);
    const s6 = await snap({ free });
    step('Démolir : îlot visé, surbrillance, bandeau « Démolir · 10 $ »', s6.state === 'demolish-target' && /Démolir/.test(s6.actionTitle) && /10 \$/.test(s6.actionTitle) && s6.ghost && s6.ghost.highlights >= 1, s6.actionTitle);
    await shot('demolish-target');
    await page.tap('#action .action-ok');
    await page.waitForTimeout(400);
    const s7 = await snap({ free });
    step('Démolir ✓ : bâtiment retiré, −10 $', s7.cells.free.building === null && s7.money === s6.money - 10 && s7.state === 'demolish', `${s6.money} → ${s7.money}`);
    await shot('demolished');

    // ── 5. Annuler une pose ─────────────────────────────────────────────────────────────────
    await page.tap('#action .action-x');
    await page.waitForTimeout(250);
    await page.tap('#tabbar .tab--habitat');
    await page.waitForSelector('#sheet-layer.is-open .card[data-id="house"]', { timeout: 5000 });
    await page.waitForTimeout(300);
    await page.tap('.card[data-id="house"]');
    await page.waitForTimeout(300);
    const again = await page.evaluate(freeTileInPage, 'house');
    await tapTile(again);
    await page.tap('#action .action-ok');
    await page.waitForTimeout(400);
    const s8 = await snap({ again });
    await shot('placed-again');
    const undoBtn = await page.$('#toasts .toast[data-key="undo"] .toast-go');
    step('Pose à annuler : quartier posé, bouton « Annuler » présent', s8.cells.again.building === 'house' && !!undoBtn);
    if (undoBtn) await undoBtn.tap();
    await page.waitForTimeout(400);
    const s9 = await snap({ again });
    step('Annuler : bâtiment retiré, argent remboursé', s9.cells.again.building === null && s9.money === s7.money, `${s8.money} → ${s9.money} (avant la pose : ${s7.money})`);
    await shot('undone');
    await page.tap('#action .action-x');
    await page.waitForTimeout(250);

    // ── 6. Vitesse ×4, un mois réel, puis bilan de saison ───────────────────────────────────
    for (let i = 0; i < 6; i++) {
      const txt = await page.evaluate(() => document.querySelector('#speed .speed-text').textContent);
      if (txt === '×4') break;
      await page.tap('#speed');
      await page.waitForTimeout(150);
    }
    const s10 = await snap();
    step('Bouton vitesse : ×4 actif', s10.speed === 4 && s10.speedText === '×4', `${s10.speedText} (game.speed = ${s10.speed})`);
    const monthBefore = s10.month;
    const moneyBefore = s10.money;
    const t0 = Date.now();
    await page.waitForFunction((m) => window.__tiletown.game.month > m, monthBefore, { timeout: 90000 });
    await page.waitForTimeout(300);
    const s11 = await snap();
    step('Un mois à ×4 : mois franchi, argent qui bouge, sauvegarde', s11.month === monthBefore + 1 && s11.money !== moneyBefore && (await page.evaluate(() => window.__tiletown.storage.hasSave())), `${((Date.now() - t0) / 1000).toFixed(1)} s réelles ; ${moneyBefore} → ${s11.money} ; ${s11.deltaText}`);
    await shot('month');
    // Jusqu'au 3e mois (fin du printemps) : le temps est avancé par pas de 0,1 s (même chemin que la boucle).
    await page.evaluate(() => { const t = window.__tiletown; let guard = 0; while (t.game.month < 3 && guard++ < 400) t.advance(1); });
    await page.waitForTimeout(400);
    const s12 = await snap();
    step('3e mois : bilan de saison en bandeau (bouton OK)', s12.month >= 3 && s12.bannerOpen && /saison|Été|été/i.test(s12.bannerText), s12.bannerText.trim().slice(0, 90));
    await shot('season');
    await page.tap('#alerts .alert-ok').catch(() => {});
    await page.waitForTimeout(250);
    await page.evaluate(() => window.__tiletown.setSpeed(1));

    // ── 7. Rechargement : partie restaurée ──────────────────────────────────────────────────
    const beforeReload = await snap({ forest });
    await page.evaluate(() => window.__tiletown.save());
    await waitReady(PAGE);
    const s13 = await snap({ forest });
    step('Rechargement : même argent, même mois, forêt plantée toujours là', s13.money === beforeReload.money && s13.month === beforeReload.month && s13.cells.forest.building === 'tree-planting' && JSON.stringify(s13.tiles) === JSON.stringify(beforeReload.tiles), `${s13.moneyText} · ${s13.dateText}`);
    await shot('reloaded');

    // ── 8. Erreurs de console ────────────────────────────────────────────────────────────────
    const tolerated = logs.filter((l) => (/assets\/models\//.test(l) && /404|Failed to load/.test(l)) || /^\[http 404\].*assets\/models\//.test(l));
    const real = logs.filter((l) => !tolerated.includes(l));
    step('Aucune erreur de console', real.length === 0, real.length ? real.slice(0, 3).join(' | ').slice(0, 300) : (tolerated.length ? `${tolerated.length} message(s) du pipeline des modèles tolérés` : ''));
  } catch (err) {
    step(`Exception : ${err.message.split('\n')[0]}`, false);
    await shot('error').catch(() => {});
  } finally {
    await context.close();
    await browser.close();
    server.close();
  }

  const okAll = steps.every((s) => s.ok);
  await fs.writeFile(path.join(OUT, 'play-report.json'), JSON.stringify({ date: new Date().toISOString(), page: PAGE, ok: okAll, steps, logs }, null, 2));
  console.log(`\n| Étape | Résultat |\n|---|:-:|`);
  for (const s of steps) console.log(`| ${s.name} | ${s.ok ? 'OK' : 'KO'} |`);
  console.log(`\nCaptures : ${path.relative(ROOT, OUT)}/play-*.png — rapport : ${path.relative(ROOT, path.join(OUT, 'play-report.json'))}`);
  if (!okAll) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
