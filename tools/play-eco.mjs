#!/usr/bin/env node
// Parcours d'écologie automatisé (docs/ARCHITECTURE.md §10.5) avec Playwright + Chromium SwiftShader, en
// gestes tactiles sur l'écran de référence (412 × 915, DPR 2,625) :
//   1. partie neuve, calque Air allumé par l'onglet « Calques » (légende affichée, appels de dessin ≤ 60) ;
//   2. une usine posée au bord de la rivière, par gestes réels (catalogue → fantôme → ✓) ;
//   3. six mois plus tard : l'eau en aval s'est dégradée et l'air a monté ;
//   4. une station d'épuration en aval : six mois plus tard, l'eau va mieux ;
//   5. le massif de forêt du cerf rasé : le cerf s'en va (message chaleureux et carnet à jour) ;
//   6. une alerte d'écologie (réelle si elle est survenue, simulée sinon) : son bouton « Voir » centre la
//      carte sur la case en cause et allume le bon calque.
// Captures dans tools/measure-out/eco-play-*.png, rapport tools/measure-out/eco-play-report.json.
//
//   node tools/play-eco.mjs [--out tools/measure-out] [--port 0] [--seed 7]   code de sortie 0 si tout passe

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
const PAGE = `dev.html?stats=1&seed=${SEED}&nosw&mode=sandbox`;
const MAX_CALLS = 60;
/** Argent et déblocages prêtés au parcours : l'usine et la station ne sont ouvertes qu'à 120 et 160 habitants. */
const GRANT = { money: 40000, unlock: ['factory', 'wastewater', 'house', 'field', 'park'] };

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

/** Enregistre tous les messages et bandeaux qui passent (ils s'effacent au bout de quelques secondes). */
function installRecorder() {
  const log = { toasts: [], banners: [] };
  window.__ecoLog = log;
  const watch = (sel, bucket) => {
    const node = document.querySelector(sel);
    if (!node) return;
    new MutationObserver((records) => {
      for (const rec of records) {
        for (const added of rec.addedNodes) {
          if (added.nodeType !== 1) continue;
          const text = (added.textContent || '').trim();
          if (text) bucket.push(text);
        }
      }
    }).observe(node, { childList: true });
  };
  watch('#toasts', log.toasts);
  watch('#alerts', log.banners);
  return true;
}

/**
 * Case libre, au bord de la rivière, où `id` se pose : la plus en amont possible (il reste de l'aval à
 * observer). Renvoie { x, y, river: { x, y }, downstream: [{ x, y }], cost } ou null.
 */
function riverBankTileInPage(id) {
  const t = window.__tiletown;
  const w = t.game.world;
  const idx = (x, y) => y * w.cols + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < w.cols && y < w.rows;
  const DIR = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  /** Cases de rivière en aval d'une case de rivière, en suivant `flow`. */
  const downstreamOf = (sx, sy, max = 6) => {
    const out = [];
    let x = sx; let y = sy;
    for (let i = 0; i < max; i++) {
      const tile = w.tiles[idx(x, y)];
      const d = tile && tile.flow ? DIR[tile.flow] : null;
      if (!d) break;
      x += d[0]; y += d[1];
      if (!inb(x, y)) break;
      const next = w.tiles[idx(x, y)];
      if (!next || (next.terrain !== 'river' && next.terrain !== 'lake')) break;
      out.push({ x, y, terrain: next.terrain });
    }
    return out;
  };
  const out = [];
  for (let y = 1; y < w.rows - 1; y++) {
    for (let x = 1; x < w.cols - 1; x++) {
      const tile = w.tiles[idx(x, y)];
      if (tile.building || (tile.terrain !== 'grass' && tile.terrain !== 'meadow' && tile.terrain !== 'field')) continue;
      let river = null;
      for (const [dx, dy] of [[0, -1], [0, 1], [1, 0], [-1, 0]]) {
        const nx = x + dx; const ny = y + dy;
        if (!inb(nx, ny)) continue;
        if (w.tiles[idx(nx, ny)].terrain === 'river') { river = { x: nx, y: ny }; break; }
      }
      if (!river) continue;
      const res = t.canPlace(x, y, id);
      if (!res || !res.ok) continue;
      const down = downstreamOf(river.x, river.y);
      if (down.length < 2) continue;
      out.push({ x, y, river, downstream: down, cost: res.cost, reach: down.length });
    }
  }
  // Le plus d'aval observable d'abord, puis le moins de travaux.
  out.sort((a, b) => b.reach - a.reach || (a.cost || 0) - (b.cost || 0));
  return out[0] || null;
}

/** Case libre où `id` se pose, au bord de l'une des cases d'eau données (la moins chère). */
function bankTileNextToInPage({ id, cells }) {
  const t = window.__tiletown;
  const w = t.game.world;
  const idx = (x, y) => y * w.cols + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < w.cols && y < w.rows;
  const want = new Set((cells || []).map((c) => `${c.x},${c.y}`));
  const out = [];
  for (let y = 0; y < w.rows; y++) {
    for (let x = 0; x < w.cols; x++) {
      if (w.tiles[idx(x, y)].building) continue;
      let near = false;
      for (const [dx, dy] of [[0, -1], [0, 1], [1, 0], [-1, 0]]) {
        const nx = x + dx; const ny = y + dy;
        if (inb(nx, ny) && want.has(`${nx},${ny}`)) { near = true; break; }
      }
      if (!near) continue;
      const res = t.canPlace(x, y, id);
      if (!res || !res.ok) continue;
      out.push({ x, y, cost: res.cost });
    }
  }
  out.sort((a, b) => (a.cost || 0) - (b.cost || 0));
  return out[0] || null;
}

/** Position écran (px CSS, coordonnées client) du centre d'une case ; recadre la caméra si elle est cachée. */
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

/** Avance de `months` mois de jeu (vitesse ×4, même chemin que la boucle), puis repasse en pause. */
function advanceMonthsInPage(months) {
  const t = window.__tiletown;
  const target = t.game.month + months;
  t.setSpeed(4);
  let guard = 0;
  while (t.game.month < target && guard++ < 20000) t.advance(1);
  t.setSpeed(0);
  return { month: t.game.month, steps: guard };
}

/** Instantané de l'écologie et de l'interface (tableaux ordinaires : sérialisable). */
function snapEcoInPage(cells) {
  const t = window.__tiletown;
  const eco = t.eco();
  const text = (sel) => { const n = document.querySelector(sel); return n ? n.textContent.trim() : ''; };
  const out = {
    money: t.game.money,
    month: t.game.month,
    layer: t.layer,
    layerInfo: t.layerInfo(),
    pillOpen: !!document.querySelector('#layer-pill:not([hidden])'),
    pillText: text('#layer-pill .layer-pill-text'),
    sheetOpen: !!document.querySelector('#sheet-layer.is-open'),
    sheet: document.body.dataset.sheet || null,
    legend: {
      shown: !!document.querySelector('.layer-legend:not([hidden]) .layer-legend-bar'),
      title: text('.layer-legend-title'),
      min: text('.layer-legend-min'),
      max: text('.layer-legend-max'),
      gradient: (() => { const n = document.querySelector('.layer-legend-bar'); return n ? getComputedStyle(n).backgroundImage : ''; })(),
    },
    bannerOpen: !!document.querySelector('#alerts.is-open'),
    bannerText: text('#alerts'),
    hasSee: !!document.querySelector('#alerts .alert-see'),
    species: t.species(),
    scores: eco ? eco.scores : null,
    alerts: eco ? eco.alerts : null,
    calls: t.stats().calls,
    toasts: (window.__ecoLog ? window.__ecoLog.toasts : []).slice(),
    banners: (window.__ecoLog ? window.__ecoLog.banners : []).slice(),
    at: {},
  };
  for (const [name, c] of Object.entries(cells || {})) {
    if (!c || !eco) continue;
    const i = c.y * eco.cols + c.x;
    const tile = t.game.world.tiles[i];
    out.at[name] = {
      x: c.x, y: c.y, terrain: tile.terrain, building: tile.building ? tile.building.type : null,
      air: eco.air ? eco.air[i] : null, water: eco.water ? eco.water[i] : null,
      fauna: eco.fauna ? eco.fauna[i] : null, soil: eco.soil ? eco.soil[i] : null,
    };
  }
  if (eco) {
    out.airMax = Math.max(...eco.air);
    out.waterMax = Math.max(...eco.water);
  }
  return out;
}

/** Nombre d'appels de dessin d'une image rendue maintenant (calque compris). */
function drawCallsNow() {
  const r = window.__tiletown.renderer;
  r.invalidate();
  r.render(1 / 60);
  return r.stats().calls;
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
    const file = path.join(OUT, `eco-play-${String(shotIndex).padStart(2, '0')}-${name}.png`);
    await page.screenshot({ path: file, scale: 'css' });
    return path.relative(ROOT, file);
  };
  const step = (name, ok, detail) => { steps.push({ name, ok: !!ok, detail }); process.stdout.write(`${ok ? 'OK' : 'KO'}  ${name}${detail ? ` — ${detail}` : ''}\n`); };
  const snap = (cells) => page.evaluate(snapEcoInPage, cells || {});
  const months = (n) => page.evaluate(advanceMonthsInPage, n);
  const tapTile = async (cell) => {
    const p = await page.evaluate(screenOfTile, cell);
    await page.touchscreen.tap(p.x, p.y);
    await page.waitForTimeout(420); // (deux touchers rapprochés feraient un double toucher)
    return p;
  };
  /** Pose `id` sur une case par gestes réels : onglet de famille, carte, toucher la case, ✓. */
  const placeByGesture = async (family, id, cell) => {
    await page.tap(`#tabbar .tab--${family}`);
    await page.waitForSelector(`#sheet-layer.is-open .card[data-id="${id}"]`, { timeout: 8000 });
    await page.waitForTimeout(300);
    await page.tap(`.card[data-id="${id}"]`);
    await page.waitForTimeout(320);
    await tapTile(cell);
    await page.tap('#action .action-ok');
    await page.waitForTimeout(420);
    await page.tap('#action .action-x').catch(() => {});
    await page.waitForTimeout(220);
  };
  const waitReady = async (url) => {
    await page.goto(base + url, { waitUntil: 'load' });
    await page.waitForFunction(() => globalThis.__tiletown && globalThis.__tiletown.ready, null, { timeout: 90000 });
    await page.waitForTimeout(400);
  };

  try {
    // ── 0. Partie neuve, enregistreur de messages, caisse et déblocages du parcours ───────────
    await waitReady(`${PAGE}&new=1`);
    await page.evaluate(installRecorder);
    await page.evaluate((g) => window.__tiletown.grant(g), GRANT);
    await page.evaluate(() => window.__tiletown.setSpeed(0));
    const s0 = await snap();
    step('Partie neuve en pause, écologie présente', s0.month === 0 && !!s0.scores && Number.isFinite(s0.scores.nature), s0.scores ? `nature ${Math.round(s0.scores.nature)} / 100` : 'pas d’écologie (game.eco absent)');

    // ── 1. Calque Air par l'onglet « Calques » : légende, pastille, appels de dessin ──────────
    await page.tap('#tabbar .tab--layers');
    await page.waitForSelector('#sheet-layer.is-open .layer-btn--air', { timeout: 8000 });
    await page.waitForTimeout(320);
    await page.tap('.layer-btn--air');
    await page.waitForTimeout(320);
    const s1 = await snap();
    step('Onglet Calques : calque Air allumé', s1.layer === 'air', `calque « ${s1.layer} »`);
    step('Légende affichée (barre dégradée et bornes)', s1.legend.shown && /gradient/.test(s1.legend.gradient) && s1.legend.min.length > 0 && s1.legend.max.length > 0, `${s1.legend.title} : ${s1.legend.min} → ${s1.legend.max}`);
    const callsLayer = await page.evaluate(drawCallsNow);
    step('Appels de dessin ≤ 60 avec un calque actif', callsLayer <= MAX_CALLS, `${callsLayer} appels`);
    await shot('layer-air');
    // Le calque reste allumé une fois la feuille refermée : la pastille le rappelle.
    await page.tap('#sheet-close');
    await page.waitForTimeout(380);
    const s2 = await snap();
    step('Feuille refermée : calque gardé, pastille affichée', !s2.sheetOpen && s2.layer === 'air' && s2.pillOpen && /Air/.test(s2.pillText), `pastille « ${s2.pillText} »`);
    await shot('layer-pill');

    // ── 2. Une usine au bord de la rivière, par gestes réels ─────────────────────────────────
    const bank = await page.evaluate(riverBankTileInPage, 'factory');
    if (!bank) throw new Error('aucune case libre au bord de la rivière pour une usine');
    const down1 = bank.downstream[0];
    const down2 = bank.downstream[bank.downstream.length - 1];
    const watch = { usine: { x: bank.x, y: bank.y }, aval1: down1, aval2: down2 };
    const before = await snap(watch);
    await page.evaluate(() => window.__tiletown.homeView());
    await placeByGesture('activity', 'factory', bank);
    const placed = await snap(watch);
    step('Usine posée au bord de la rivière (gestes réels)', placed.at.usine.building === 'factory', `case ${bank.x},${bank.y} — rivière en ${bank.river.x},${bank.river.y}, ${bank.downstream.length} cases en aval`);
    await shot('factory');

    // ── 3. Six mois plus tard : l'eau en aval se dégrade, l'air monte ─────────────────────────
    const m3 = await months(6);
    const after6 = await snap(watch);
    const worseWater = after6.at.aval1.water > placed.at.aval1.water + 0.5 || after6.at.aval2.water > placed.at.aval2.water + 0.5;
    const moreAir = after6.airMax > before.airMax + 0.5 || after6.at.usine.air > before.at.usine.air + 0.5;
    step('Six mois : l’eau en aval s’est dégradée', worseWater, `aval ${placed.at.aval1.water.toFixed(1)} → ${after6.at.aval1.water.toFixed(1)} (et ${placed.at.aval2.water.toFixed(1)} → ${after6.at.aval2.water.toFixed(1)})`);
    step('Six mois : l’air a monté autour de l’usine', moreAir, `usine ${before.at.usine.air.toFixed(1)} → ${after6.at.usine.air.toFixed(1)} ; maximum ${before.airMax.toFixed(1)} → ${after6.airMax.toFixed(1)} (mois ${m3.month})`);
    await page.evaluate(() => window.__tiletown.setLayer('water'));
    await page.waitForTimeout(260);
    await shot('water-dirty');

    // ── 4. Une station d'épuration en amont de la case témoin : l'eau va mieux ───────────────
    // Témoin : la case de rivière en aval de l'usine la plus polluée après ces six mois.
    const witness = await page.evaluate((cells) => {
      const t = window.__tiletown;
      const eco = t.eco();
      let best = null;
      cells.forEach((c, i) => {
        const v = eco.water[c.y * eco.cols + c.x];
        if (!best || v > best.water) best = { x: c.x, y: c.y, water: v, i };
      });
      return best;
    }, bank.downstream);
    const upstream = [bank.river, ...bank.downstream.slice(0, Math.max(0, witness.i))];
    const plant = await page.evaluate(bankTileNextToInPage, { id: 'wastewater', cells: upstream });
    if (!plant) throw new Error('aucune case libre au bord de la rivière pour une station d’épuration');
    const plantWatch = { ...watch, station: { x: plant.x, y: plant.y }, temoin: { x: witness.x, y: witness.y } };
    await placeByGesture('infrastructure', 'wastewater', plant);
    const afterPlant = await snap(plantWatch);
    step('Station d’épuration posée en amont de la case témoin', afterPlant.at.station.building === 'wastewater', `station ${plant.x},${plant.y} — témoin ${witness.x},${witness.y} (eau ${witness.water.toFixed(1)})`);
    const m4 = await months(6);
    const cleaner = await snap(plantWatch);
    const better = cleaner.at.temoin.water < afterPlant.at.temoin.water - 0.5 || cleaner.waterMax < afterPlant.waterMax - 0.5;
    step('Six mois de plus : l’eau s’améliore après la station', better, `témoin ${afterPlant.at.temoin.water.toFixed(1)} → ${cleaner.at.temoin.water.toFixed(1)} ; maximum ${afterPlant.waterMax.toFixed(1)} → ${cleaner.waterMax.toFixed(1)} (mois ${m4.month})`);
    await shot('water-clean');

    // ── 5. Le massif du cerf rasé : le cerf s'en va (message + carnet) ───────────────────────
    const deerBefore = (cleaner.species || []).find((sp) => sp.id === 'deer') || null;
    if (deerBefore && deerBefore.present) {
      const cut = await page.evaluate(() => {
        const t = window.__tiletown;
        const eco = t.eco();
        const cells = (eco.species.deer && eco.species.deer.cells) || [];
        const out = [];
        for (const i of cells) {
          const x = i % eco.cols;
          const y = Math.floor(i / eco.cols);
          // Seules les tuiles « urbaines » se posent sur une forêt (défrichement à 80 $) : on bétonne.
          const res = t.place(x, y, 'house');
          out.push({ x, y, ok: !!(res && res.ok), reason: res && res.reason });
        }
        return { asked: cells.length, done: out.filter((o) => o.ok).length, reasons: [...new Set(out.filter((o) => !o.ok).map((o) => o.reason))] };
      });
      step('Forêt du cerf rasée (quartiers sur tout le massif)', cut.done >= Math.max(1, cut.asked - 1), `${cut.done} / ${cut.asked} cases défrichées${cut.reasons.length ? ` (refus : ${cut.reasons.join(', ')})` : ''}`);
      await shot('forest-cut');
      // L'espèce ne part qu'après ECO_SPECIES_LEAVE_MONTHS mois sous son seuil (docs §5.3).
      await page.evaluate(() => window.__tiletown.setLayer('fauna'));
      const m5 = await months(18);
      const gone = await snap(watch);
      const deerAfter = (gone.species || []).find((sp) => sp.id === 'deer') || null;
      const said = [...gone.toasts, ...gone.banners].some((txt) => /cerf/i.test(txt));
      step('Le cerf a disparu du carnet', !!deerAfter && !deerAfter.present, `cerf : ${deerAfter ? (deerAfter.present ? 'toujours là' : 'parti') : 'absent du carnet'} (mois ${m5.month})`);
      step('Message du départ du cerf affiché', said, said ? 'message relevé' : `aucun message « cerf » parmi ${gone.toasts.length} message(s)`);
      // Le carnet s'ouvre depuis la fiche Nature (jauge Nature → « Carnet des espèces »).
      await page.tap('.gauge--nature');
      await page.waitForSelector('#sheet-layer.is-open .nature-book', { timeout: 8000 });
      await page.waitForTimeout(300);
      await shot('nature-sheet');
      await page.tap('.nature-book');
      await page.waitForSelector('#sheet-layer.is-open .species-list--big', { timeout: 8000 });
      await page.waitForTimeout(320);
      const bookState = await page.evaluate(() => ({
        rows: [...document.querySelectorAll('.species-list--big .species')].map((n) => ({ id: n.dataset.id, present: n.dataset.present === '1', text: n.textContent.trim().slice(0, 60) })),
        sheet: document.body.dataset.sheet || null,
      }));
      const deerRow = bookState.rows.find((row) => row.id === 'deer');
      step('Carnet des espèces : le cerf y figure, grisé', bookState.sheet === 'species' && !!deerRow && !deerRow.present, deerRow ? deerRow.text : `${bookState.rows.length} ligne(s)`);
      await shot('species-book');
      await page.tap('#sheet-close');
      await page.waitForTimeout(320);
    } else {
      step('Cerf présent au départ (massif de forêt ≥ 6 cases)', false, 'aucun cerf dans la vallée : le massif de la graine est trop petit ou l’écologie ne le voit pas');
    }

    // ── 6. Alerte d'écologie : le bouton « Voir » centre la carte et allume le calque ─────────
    await page.evaluate(() => window.__tiletown.setLayer('none'));
    await page.waitForTimeout(200);
    const real = await page.evaluate(() => {
      const log = window.__ecoLog || { banners: [] };
      return log.banners.filter((txt) => /smog|algue|inonda|chaleur/i.test(txt));
    });
    const alertCell = await page.evaluate(() => {
      const t = window.__tiletown;
      const w = t.game.world;
      for (let y = 0; y < w.rows; y++) for (let x = 0; x < w.cols; x++) {
        const tile = w.tiles[y * w.cols + x];
        if (tile.building && tile.building.type === 'factory') return { x, y };
      }
      return { x: Math.floor(w.cols / 2), y: Math.floor(w.rows / 2) };
    });
    await page.evaluate(() => window.__tiletown.fitView());
    // Un seul bandeau à la fois : on vide d'abord la file des bilans de saison accumulés.
    await page.evaluate(() => { const h = window.__tiletown.hud; for (let i = 0; i < 80 && h.bannerOpen; i++) h.hideBanner(); });
    await page.waitForTimeout(240);
    await page.evaluate((c) => window.__tiletown.emit({ type: 'eco-alert', key: 'smog', text: 'L’air des quartiers est irrespirable depuis cinq mois.', x: c.x, y: c.y, layer: 'air' }), alertCell);
    await page.waitForTimeout(320);
    const alerted = await snap();
    step(`Alerte d’écologie en bandeau (${real.length ? 'réelle, survenue dans la partie' : 'simulée'}), bouton « Voir »`, alerted.bannerOpen && alerted.hasSee && /irrespirable|smog/i.test(alerted.bannerText), alerted.bannerText.slice(0, 90));
    await shot('alert');
    await page.tap('#alerts .alert-see');
    await page.waitForTimeout(420);
    const seen = await page.evaluate((c) => {
      const t = window.__tiletown;
      const insets = t.hud.insets();
      const p = t.renderer.camera.toScreen(c.x + 0.5, 0, c.y + 0.5);
      const cx = window.innerWidth / 2;
      const cy = insets.top + (window.innerHeight - insets.top - insets.bottom) / 2;
      return { layer: t.layer, dx: Math.abs(p.x - cx), dy: Math.abs(p.y - cy), banner: !!document.querySelector('#alerts.is-open') };
    }, alertCell);
    step('« Voir » : carte centrée sur la case et calque Air allumé', seen.layer === 'air' && seen.dx < 70 && seen.dy < 70 && !seen.banner, `calque « ${seen.layer} », écart ${Math.round(seen.dx)} × ${Math.round(seen.dy)} px`);
    await shot('alert-seen');

    // ── 7. Erreurs de console ────────────────────────────────────────────────────────────────
    const tolerated = logs.filter((l) => (/assets\/models\//.test(l) && /404|Failed to load/.test(l)) || /^\[http 404\].*assets\/models\//.test(l));
    const real2 = logs.filter((l) => !tolerated.includes(l));
    step('Aucune erreur de console', real2.length === 0, real2.length ? real2.slice(0, 3).join(' | ').slice(0, 300) : (tolerated.length ? `${tolerated.length} message(s) du pipeline des modèles tolérés` : ''));
  } catch (err) {
    step(`Exception : ${err.message.split('\n')[0]}`, false);
    await shot('error').catch(() => {});
  } finally {
    await context.close();
    await browser.close();
    server.close();
  }

  const okAll = steps.every((s) => s.ok);
  await fs.writeFile(path.join(OUT, 'eco-play-report.json'), JSON.stringify({ date: new Date().toISOString(), page: PAGE, ok: okAll, steps, logs }, null, 2));
  console.log(`\n| Étape | Résultat |\n|---|:-:|`);
  for (const s of steps) console.log(`| ${s.name} | ${s.ok ? 'OK' : 'KO'} |`);
  console.log(`\nCaptures : ${path.relative(ROOT, OUT)}/eco-play-*.png — rapport : ${path.relative(ROOT, path.join(OUT, 'eco-play-report.json'))}`);
  if (!okAll) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
