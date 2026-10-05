#!/usr/bin/env node
// Parcours automatisé de la carrière (docs/ARCHITECTURE.md §11.5) avec Playwright + Chromium
// SwiftShader, en gestes tactiles sur l'écran de référence (412 × 915, DPR 2,625) :
//
//   écran titre affiché → bouton Carrière → carte de carrière → niveau 1 → vallée VIERGE avec la
//   seule mairie → bulle du tutoriel sur sa première leçon → les trois premières leçons suivies PAR
//   GESTES RÉELS (onglet du bas, carte du catalogue, case de la carte, ✓) en vérifiant que la bulle
//   passe à la leçon suivante → bandeau d'objectifs déplié, avancement affiché → objectifs forcés
//   (window.__tiletown) → écran de fin avec ses étoiles → Niveau suivant → le niveau 2 est ouvert et
//   le catalogue débloqué est conservé → rechargement : la carrière est retrouvée.
//
// Captures dans tools/measure-out/career-*.png à chaque étape, rapport career-report.json,
// code de sortie 0 si tout est OK.
//
//   node tools/play-career.mjs [--out tools/measure-out] [--port 0] [--keep]

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
/** La page de développement, sans service worker : l'écran titre est le point de départ par défaut. */
const PAGE = 'dev.html?nosw';
const FRESH = `${PAGE}&new=1`;

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

/** Instantané sérialisable de la carrière, du niveau, du tutoriel et des écrans. */
function snapIn() {
  const t = window.__tiletown;
  const g = t.game;
  const text = (sel) => { const n = document.querySelector(sel); return n ? n.textContent.trim() : ''; };
  const box = (sel) => [...document.querySelectorAll(sel)].map((n) => { const r = n.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  return {
    mode: t.mode,
    career: t.career(),
    level: t.level(),
    goals: t.goals(),
    lesson: t.lesson(),
    money: g.money,
    month: g.month,
    speed: g.speed,
    unlocked: [...(g.unlocked || [])],
    buildings: g.world.tiles.filter((tile) => tile.building).map((tile) => tile.building.type),
    // Écrans
    titleOpen: !!document.querySelector('.screen--title'),
    titleButtons: [...document.querySelectorAll('.title-btn')].map((n) => n.dataset.action),
    careerOpen: !!document.querySelector('.screen--career'),
    careerCards: [...document.querySelectorAll('.level-card')].map((n) => ({ id: n.dataset.level, state: n.dataset.state, stars: Number(n.querySelector('.level-stars')?.dataset.stars || 0) })),
    endOpen: !!document.querySelector('.screen--end'),
    endTitle: text('.end-title'),
    endStars: Number(document.querySelector('.end-stars')?.dataset.stars || 0),
    endStarRows: [...document.querySelectorAll('.end-star-row')].map((n) => ({ id: n.dataset.star, done: n.dataset.done === '1' })),
    endGoals: [...document.querySelectorAll('.end-goal')].map((n) => ({ id: n.dataset.goal, done: n.dataset.done === '1' })),
    endScore: text('.end-score'),
    endButtons: [...document.querySelectorAll('.end-btn')].map((n) => n.dataset.action),
    // Bandeau d'objectifs
    goalsVisible: !!document.querySelector('#goals.is-open'),
    goalsExpanded: !!document.querySelector('.goals-box.is-expanded'),
    goalsSummary: text('.goals-summary'),
    goalsNote: text('.goals-note'),
    goalRows: [...document.querySelectorAll('.goal:not(.goal--empty)')].map((n) => ({
      id: n.dataset.goal, done: n.dataset.done === '1',
      label: n.querySelector('.goal-label')?.textContent.trim() || '',
      value: n.querySelector('.goal-value')?.textContent.trim() || '',
    })),
    // Bulle du tutoriel
    tutoOpen: !!document.querySelector('#tutorial.is-open'),
    tutoTitle: text('.tuto-title'),
    tutoText: text('.tuto-text'),
    tutoId: document.querySelector('.tuto-bubble')?.dataset.lesson || null,
    hinted: [...document.querySelectorAll('.is-hinted')].map((n) => n.dataset.id || n.dataset.gauge || n.id || n.className),
    highlights: t.stats().ghost ? t.stats().ghost.highlights : null,
    // Cibles tactiles de tout ce qui est affiché
    small: [...document.querySelectorAll('#ui button, #ui .level-play, #ui .card')]
      .filter((n) => { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !n.closest('#loading') && !n.closest('[hidden]'); })
      .map((n) => ({ sel: `${n.tagName.toLowerCase()}.${String(n.className).trim().split(/\s+/).join('.')}`, w: n.getBoundingClientRect().width, h: n.getBoundingClientRect().height }))
      .filter((b) => b.w < 47.99 || b.h < 47.99),
    boxes: { titleBtn: box('.title-btn'), levelPlay: box('.level-play'), endBtn: box('.end-btn'), tutoOk: box('.tuto-ok'), goalsHead: box('.goals-head') },
  };
}

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

/** Position écran (px CSS, coordonnées client) du centre d'une case ; recadre la caméra si elle est cachée. */
function screenOfTile({ x, y }) {
  const t = window.__tiletown;
  const r = t.renderer;
  const insets = t.hud.insets();
  const h = window.innerHeight;
  const visible = (p) => p.x > 24 && p.x < window.innerWidth - 24 && p.y > insets.top + 24 && p.y < h - insets.bottom - 110;
  let p = r.camera.toScreen(x + 0.5, 0, y + 0.5);
  if (!visible(p)) {
    r.camera.lookAt(x, y, 8, { insets: { top: insets.top, bottom: insets.bottom + 110, left: 0, right: 0 } });
    r.invalidate(); r.render(1 / 60);
    p = r.camera.toScreen(x + 0.5, 0, y + 0.5);
  }
  const rect = document.querySelector('#scene').getBoundingClientRect();
  return { x: p.x + rect.left, y: p.y + rect.top, visible: visible(p) };
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
    const file = path.join(OUT, `career-${String(shotIndex).padStart(2, '0')}-${name}.png`);
    await page.screenshot({ path: file, scale: 'css' });
    return path.relative(ROOT, file);
  };
  const step = (name, ok, detail) => { steps.push({ name, ok: !!ok, detail }); process.stdout.write(`${ok ? 'OK' : 'KO'}  ${name}${detail ? ` — ${detail}` : ''}\n`); };
  const snap = () => page.evaluate(snapIn);
  const waitReady = async (url) => {
    await page.goto(base + url, { waitUntil: 'load' });
    await page.waitForFunction(() => globalThis.__tiletown && globalThis.__tiletown.ready, null, { timeout: 90000 });
    await page.waitForTimeout(500);
  };
  const tapTile = async (cell) => {
    const p = await page.evaluate(screenOfTile, cell);
    await page.touchscreen.tap(p.x, p.y);
    await page.waitForTimeout(420); // (deux touchers rapprochés feraient un double toucher)
    return p;
  };
  /** Pose une tuile par gestes réels : onglet du bas → carte du catalogue → case de la carte → ✓. */
  const placeByHand = async (tileId, familyTab) => {
    await page.tap(`#tabbar .tab--${familyTab}`);
    await page.waitForSelector(`#sheet-layer.is-open .card[data-id="${tileId}"]`, { timeout: 8000 });
    await page.waitForTimeout(300);
    await page.tap(`.card[data-id="${tileId}"]`);
    await page.waitForTimeout(350);
    const cell = await page.evaluate(freeTileInPage, tileId);
    if (!cell) throw new Error(`aucune case libre pour ${tileId}`);
    await tapTile(cell);
    await page.tap('#action .action-ok');
    await page.waitForTimeout(500);
    await page.tap('#action .action-x').catch(() => {});
    await page.waitForTimeout(250);
    return `${tileId} posé en ${cell.x},${cell.y} (onglet ${familyTab} → carte → case → ✓)`;
  };

  /** Amène le bouton de vitesse sur `want` à force de touchers réels (le cycle du HUD). */
  const tapSpeedTo = async (want) => {
    for (let i = 0; i < 6; i++) {
      const txt = await page.evaluate(() => document.querySelector('#speed .speed-text').textContent.trim());
      if (txt === want) return true;
      await page.tap('#speed');
      await page.waitForTimeout(180);
    }
    return false;
  };

  /** Onglet du bas par défaut quand une leçon nomme une tuile sans dire où la trouver. */
  const TAB_OF_TILE = { house: 'habitat', shop: 'activity', office: 'activity', field: 'activity', school: 'services', clinic: 'services', park: 'nature', 'tree-planting': 'nature', hedge: 'nature' };

  /**
   * Suit la leçon affichée **par le geste qu'elle demande** : poser une tuile (onglet → carte → case
   * → ✓), lancer le temps (bouton de vitesse puis un mois réel), allumer un calque, toucher une jauge.
   */
  const followCurrentLesson = async (lesson) => {
    const kind = (lesson.highlight && lesson.highlight.kind) || null;
    if (kind === 'speed') {
      await tapSpeedTo('×4');
      const before = await page.evaluate(() => window.__tiletown.game.month);
      await page.waitForFunction((m) => window.__tiletown.game.month > m, before, { timeout: 60000 });
      await page.waitForTimeout(400);
      await tapSpeedTo('×1');
      return 'bouton de vitesse ×4, un mois réel écoulé';
    }
    if (lesson.tile) {
      const tab = kind === 'tab' && lesson.highlight.id ? lesson.highlight.id : TAB_OF_TILE[lesson.tile] || 'habitat';
      return placeByHand(lesson.tile, tab);
    }
    if (kind === 'tab' && lesson.highlight.id === 'layers') {
      await page.tap('#tabbar .tab--layers');
      await page.waitForSelector('#sheet-layer.is-open .layer-btn--air', { timeout: 8000 });
      await page.tap('.layer-btn--air');
      await page.waitForTimeout(400);
      await page.tap('#sheet-close').catch(() => {});
      await page.waitForTimeout(300);
      return 'onglet Calques → Air';
    }
    if (kind === 'tab') {
      await page.tap(`#tabbar .tab--${lesson.highlight.id}`);
      await page.waitForTimeout(400);
      await page.tap('#sheet-close').catch(() => {});
      await page.waitForTimeout(300);
      return `onglet ${lesson.highlight.id}`;
    }
    if (kind === 'gauge') {
      await page.tap(`.gauge--${lesson.highlight.id}`);
      await page.waitForTimeout(400);
      await page.tap('#sheet-close').catch(() => {});
      await page.waitForTimeout(300);
      return `jauge ${lesson.highlight.id}`;
    }
    // Leçon sans cible touchable (« regardez les rues ») : un mois réel suffit à la valider.
    await tapSpeedTo('×4');
    const before = await page.evaluate(() => window.__tiletown.game.month);
    await page.waitForFunction((m) => window.__tiletown.game.month > m, before, { timeout: 60000 }).catch(() => {});
    await tapSpeedTo('×1');
    return 'un mois observé';
  };

  try {
    // ── 1. Écran titre ───────────────────────────────────────────────────────────────────────
    await waitReady(FRESH);
    const s1 = await snap();
    step('Écran titre affiché au premier lancement (Carrière, Bac à sable ; pas de « Reprendre »)',
      s1.titleOpen && s1.mode === 'title' && s1.titleButtons.join(',') === 'career,sandbox'
      && s1.boxes.titleBtn.every(([, h]) => h >= 56),
      `boutons ${s1.titleButtons.join(' · ')} (${s1.boxes.titleBtn.map(([w, h]) => `${w}×${h}`).join(' ')})`);
    await shot('title');

    // ── 2. Carte de carrière ─────────────────────────────────────────────────────────────────
    await page.tap('.title-btn[data-action="career"]');
    await page.waitForSelector('.screen--career', { timeout: 8000 });
    await page.waitForTimeout(500);
    const s2 = await snap();
    const open1 = s2.careerCards.filter((c) => c.state === 'open').map((c) => c.id);
    step('Carte de carrière : les niveaux en liste, seul le premier est ouvert',
      s2.careerOpen && s2.careerCards.length >= 5 && open1.join(',') === 'vallee-1'
      && s2.careerCards.slice(1).every((c) => c.state === 'locked')
      && s2.boxes.levelPlay.every(([w, h]) => w >= 48 && h >= 48),
      `${s2.careerCards.length} niveaux, ouvert : ${open1.join(' ')}`);
    await shot('career-map');

    // ── 3. Niveau 1 : vallée vierge avec la seule mairie ──────────────────────────────────────
    await page.tap('.level-play[data-level="vallee-1"]');
    await page.waitForTimeout(1400);
    const s3 = await snap();
    const halls = s3.buildings.filter((b) => b === 'townhall').length;
    step('Niveau 1 lancé : vallée vierge, un seul bâtiment (la mairie)',
      s3.mode === 'career' && s3.level && s3.level.id === 'vallee-1' && s3.buildings.length === 1 && halls === 1,
      `${s3.buildings.length} bâtiment(s) : ${s3.buildings.join(', ') || '—'} · ${s3.money} $`);
    step('Bulle du tutoriel visible avec sa première leçon, et sa cible en surbrillance',
      s3.tutoOpen && !!s3.lesson && s3.lesson.id === 'pose' && s3.tutoTitle.length > 3 && s3.hinted.includes('habitat'),
      `« ${s3.tutoTitle} » — surbrillance : ${s3.hinted.join(', ') || 'aucune'}`);
    step('Bandeau d’objectifs affiché, replié, avec son compte',
      s3.goalsVisible && !s3.goalsExpanded && /Objectifs/.test(s3.goalsSummary) && s3.boxes.goalsHead.every(([, h]) => h >= 48),
      `« ${s3.goalsSummary} · ${s3.goalsNote} »`);
    await shot('level-start');

    // ── 4. Les trois premières leçons, par gestes réels ───────────────────────────────────────
    const lessons = [];
    let before = s3;
    for (let i = 1; i <= 3; i++) {
      const lesson = before.lesson;
      if (!lesson) { step(`Leçon ${i} : plus rien à montrer (tutoriel terminé trop tôt)`, false); break; }
      const how = await followCurrentLesson(lesson);
      const after = await snap();
      lessons.push({ from: lesson.id, to: (after.lesson && after.lesson.id) || null, how });
      step(`Leçon ${i} « ${lesson.title} » suivie par gestes réels : la bulle passe à la suivante`,
        (!after.lesson || after.lesson.id !== lesson.id) && (!after.lesson || after.tutoOpen),
        `${how} ; « ${lesson.id} » → « ${(after.lesson && after.lesson.id) || 'fin du tutoriel'} »`);
      await shot(`lesson-${i}`);
      before = after;
    }

    // ── 5. Bandeau d'objectifs déplié ─────────────────────────────────────────────────────────
    await page.tap('.goals-head');
    await page.waitForTimeout(400);
    const s7 = await snap();
    step('Bandeau d’objectifs déplié : chaque objectif avec sa valeur et sa cible',
      s7.goalsExpanded && s7.goalRows.length >= 2 && s7.goalRows.every((g) => /\d/.test(g.value)),
      s7.goalRows.map((g) => `${g.label} ${g.value}${g.done ? ' ✓' : ''}`).join(' · '));
    await shot('goals');

    // ── 6. Objectifs forcés → écran de fin ────────────────────────────────────────────────────
    const forced = await page.evaluate(() => {
      const t = window.__tiletown;
      // Les cibles du niveau, atteintes d'un coup (outil de test : §11.5 « forcer l'atteinte des objectifs »).
      const stats = {};
      for (const g of t.goals()) {
        if (g.kind === 'population') stats.population = Math.max(g.target, 200);
        if (g.kind === 'nature') stats.nature = Math.max(g.target, 85);
        if (g.kind === 'happiness') stats.happiness = Math.max(g.target, 80);
        if (g.kind === 'jobs') stats.jobs = Math.max(g.target, 200);
      }
      t.grant({ money: 3000, stats });
      return { goals: t.goals(), stars: t.finishLevel() };
    });
    await page.waitForSelector('.screen--end.is-visible', { timeout: 8000 });
    await page.waitForTimeout(900);
    const s8 = await snap();
    step('Objectifs forcés puis fin de niveau : écran de fin avec ses étoiles, ses objectifs et son score',
      s8.endOpen && s8.endStars >= 1 && s8.endStarRows.length === 3 && s8.endGoals.length >= 2
      && /Score/.test(s8.endScore) && s8.endButtons.includes('replay') && s8.endButtons.includes('next')
      && s8.boxes.endBtn.every(([, h]) => h >= 56),
      `${s8.endStars} étoile(s) · « ${s8.endTitle} » · ${s8.endScore} · ${forced.goals.filter((g) => g.done).length}/${forced.goals.length} objectifs`);
    await shot('level-end');

    // ── 7. Niveau suivant : ouvert, et catalogue conservé ─────────────────────────────────────
    const tilesBefore = s8.career.tiles;
    await page.tap('.end-btn[data-action="next"]');
    await page.waitForTimeout(1500);
    const s9 = await snap();
    const keptCatalog = tilesBefore.every((id) => s9.unlocked.includes(id));
    step('« Niveau suivant » : le niveau 2 démarre, il est ouvert dans la carrière',
      s9.mode === 'career' && s9.level && s9.level.id === 'riviere' && s9.career.unlocked.includes('riviere')
      && (s9.career.stars['vallee-1'] ?? 0) >= 1,
      `niveau ${s9.level && s9.level.id} · ouverts : ${s9.career.unlocked.join(' ')} · étoiles vallee-1 : ${s9.career.stars['vallee-1']}`);
    step('Catalogue débloqué conservé d’un niveau à l’autre',
      keptCatalog && s9.career.tiles.length >= tilesBefore.length && tilesBefore.length > 0,
      `${tilesBefore.length} tuile(s) héritées, ${s9.unlocked.length} disponibles au niveau 2`);
    await shot('level-2');

    // ── 8. Rechargement : la carrière est retrouvée ───────────────────────────────────────────
    await page.evaluate(() => window.__tiletown.save());
    await waitReady(PAGE);
    const s10 = await snap();
    step('Rechargement : l’écran titre propose « Reprendre » et la carrière est intacte',
      s10.titleOpen && s10.titleButtons.includes('resume')
      && s10.career.unlocked.includes('riviere') && (s10.career.stars['vallee-1'] ?? 0) >= 1
      && s10.career.tiles.length >= tilesBefore.length,
      `ouverts : ${s10.career.unlocked.join(' ')} · étoiles : ${JSON.stringify(s10.career.stars)}`);
    await shot('reloaded');

    await page.tap('.title-btn[data-action="resume"]');
    await page.waitForTimeout(1200);
    const s11 = await snap();
    step('« Reprendre » : on retrouve le niveau 2 là où on l’avait laissé',
      s11.mode === 'career' && s11.level && s11.level.id === 'riviere' && s11.goalsVisible,
      `${s11.level && s11.level.title} · ${s11.money} $ · mois ${s11.month}`);
    await shot('resumed');

    // ── 9. Cibles tactiles et erreurs de console ──────────────────────────────────────────────
    const allSmall = [s1, s2, s3, s7, s8, s9, s10, s11].flatMap((s) => s.small);
    step('Toutes les cibles touchées font ≥ 48 px', allSmall.length === 0,
      allSmall.length ? allSmall.slice(0, 4).map((b) => `${b.sel} ${Math.round(b.w)}×${Math.round(b.h)}`).join(' | ') : 'écrans titre, carrière, jeu, fin');

    const tolerated = logs.filter((l) => (/assets\/models\//.test(l) && /404|Failed to load/.test(l)) || /^\[http 404\].*assets\/models\//.test(l));
    const real = logs.filter((l) => !tolerated.includes(l));
    step('Aucune erreur de console', real.length === 0, real.length ? real.slice(0, 3).join(' | ').slice(0, 300) : (tolerated.length ? `${tolerated.length} message(s) du pipeline des modèles tolérés` : ''));
    steps.push({ name: 'Leçons enchaînées', ok: true, detail: lessons.map((l) => `${l.from} → ${l.to}`).join(' ; ') });
  } catch (err) {
    step(`Exception : ${err.message.split('\n')[0]}`, false);
    await shot('error').catch(() => {});
  } finally {
    await context.close();
    await browser.close();
    server.close();
  }

  const okAll = steps.every((s) => s.ok);
  await fs.writeFile(path.join(OUT, 'career-report.json'), JSON.stringify({ date: new Date().toISOString(), page: PAGE, ok: okAll, steps, logs }, null, 2));
  console.log(`\n| Étape | Résultat |\n|---|:-:|`);
  for (const s of steps) console.log(`| ${s.name} | ${s.ok ? 'OK' : 'KO'} |`);
  console.log(`\nCaptures : ${path.relative(ROOT, OUT)}/career-*.png — rapport : ${path.relative(ROOT, path.join(OUT, 'career-report.json'))}`);
  if (!okAll) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
