// Point d'entrée de Tiletown : crée le monde, le rendu, l'interface et la boucle (docs/ARCHITECTURE.md §6).
//
// Ordre de démarrage (la jauge de src/loader.js suit chaque étape via window.__bootProgress) :
//   1. réglages d'accessibilité, interface HTML (barre du haut, onglets, feuille, messages, mesures) ;
//   2. monde : generateWorld({ seed, cols: 12, rows: 16, map: 'valley', starterTown: true }) puis rebuildRoads ;
//   3. rendu three.js : createRenderer(canvas, { manifestUrl, pixelRatioMax: 2 }) → setWorld, resize, fitAll ;
//   4. gestes → caméra (glisser = pan, pincer / molette = zoomAt, double toucher = fitAll, toucher = pick → message) ;
//   5. boucle rAF : 60 i/s en interaction (geste ou élan), 30 i/s au repos, arrêt quand l'onglet est caché ;
//      mesures toutes les 500 ms (#stats) ; window.__tiletown = { ready, stats(), world, renderer } pour
//      tools/measure.mjs (Playwright).
// Redimensionnement : visualViewport → --app-h, --inset-top / --inset-bottom (barre du haut, onglets) et
// r.resize(largeur, hauteur, dpr) ; téléphone en paysage → écran « Tournez votre téléphone ».
// Toute erreur de démarrage remonte à window.__bootFail (écran d'erreur lisible du chargeur).

import { generateWorld, centerOf } from './core/worldgen.js';
import { rebuildRoads } from './core/roads.js';
import { TERRAINS } from './data/terrain.js';
import { TILES, TILE_BY_ID, residentsOfTile } from './data/tiles.js';
import { createRenderer } from './render3d/renderer.js';
import { assetUrl, isDev } from './version.js';
import * as pwa from './pwa.js';
import { initA11y } from './ui/a11y.js';
import { createToasts } from './ui/toasts.js';
import { createHud } from './ui/hud.js';
import { createStats, statsWanted } from './ui/stats.js';
import { createGestures } from './ui/gestures.js';
import { $ } from './ui/dom.js';

const DEFAULT_SEED = 12345;
const WORLD_COLS = 12;
const WORLD_ROWS = 16;
/** Vue de jeu par défaut : largeur visible en îlots (la vue d'ensemble se cadre toute seule). */
const GAME_ZOOM = 8;
const IDLE_FPS = 30;
const INTERACT_AFTER_MS = 300; // on reste à 60 i/s un instant après le dernier geste
const STATS_EVERY_MS = 500;
const START_MONEY = 500; // (provisoire : src/data/balance.js fixera la vraie valeur)

const boot = {
  progress: (v) => { try { window.__bootProgress?.(v); } catch { /* chargeur absent */ } },
  ok: () => { try { window.__bootOk?.(); } catch { /* chargeur absent */ } },
  fail: (err) => { try { window.__bootFail?.(err); } catch { /* chargeur absent */ } console.error(err); },
};

/** Graine de la partie : « ?seed=… » dans l'adresse, sinon la graine par défaut. */
export function seedFromSearch(search, fallback = DEFAULT_SEED) {
  const v = new URLSearchParams(search || '').get('seed');
  if (v === null || v === '') return fallback;
  const n = Number(v);
  if (Number.isFinite(n)) return Math.trunc(n);
  // Chaîne : petit hachage déterministe (même mot → même vallée).
  let h = 2166136261;
  for (const c of String(v)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/**
 * Options de rendu lisibles dans l'adresse (débogage et mesures) : « ?strategy=batched|instanced|auto »,
 * « ?shadows=0 », « ?dpr=1.5 » (plafond du pixel ratio). Rien d'autre que ce qui est reconnu.
 */
export function renderOptionsFromSearch(search) {
  const q = new URLSearchParams(search || '');
  const out = {};
  const strategy = q.get('strategy');
  if (strategy && ['batched', 'instanced', 'auto'].includes(strategy)) out.strategy = strategy;
  const shadows = q.get('shadows');
  if (shadows === '0' || shadows === 'false') out.shadows = false;
  const dpr = Number(q.get('dpr'));
  if (Number.isFinite(dpr) && dpr >= 1 && dpr <= 3) out.pixelRatioMax = dpr;
  return out;
}

/** Résumé d'une case pour le message au toucher : « Case 3,4 : Herbe » (+ bâtiment). */
export function describeTile(world, x, y) {
  const tile = world.tiles[y * world.cols + x];
  if (!tile) return null;
  const terrain = TERRAINS[tile.terrain]?.label || tile.terrain;
  const b = tile.building;
  const building = b ? (TILE_BY_ID[b.type]?.label || b.type) + (b.level > 1 ? ` (niveau ${b.level})` : '') : null;
  return { terrain, building, native: !!tile.native, text: `Case ${x},${y} : ${terrain}${building ? ` · ${building}` : ''}` };
}

/** Jauges de départ calculées sur le monde (statiques tant que le tick n'existe pas). */
export function initialGauges(world) {
  let population = 0;
  let natureTiles = 0;
  for (const t of world.tiles) {
    if (t.building) {
      const def = TILE_BY_ID[t.building.type];
      if (def) population += residentsOfTile({ ...def, level: t.building.level });
    }
    if (t.native && TERRAINS[t.terrain]?.habitat) natureTiles += 1;
  }
  const nature = Math.round((100 * natureTiles) / Math.max(1, world.tiles.length) * 2.2);
  return { population, happiness: 72, nature: Math.min(100, nature), money: START_MONEY };
}

async function main() {
  const app = {};
  window.__tiletown = { ready: false };
  // Interaction en cours (geste, élan, redimensionnement) : la boucle reste à 60 i/s jusqu'à `interactUntil`.
  let interactUntil = 0;
  let inertia = null; // élan après un glissé : { vx, vy } en px/ms
  const poke = () => { interactUntil = performance.now() + INTERACT_AFTER_MS; };
  const dev = isDev();
  const canvas = $('#scene');
  const stage = $('#stage');
  if (!canvas || !stage) throw new Error('page incomplète : #scene introuvable');

  // ── 1. Réglages et interface ───────────────────────────────────────────────────
  app.a11y = initA11y();
  app.toasts = createToasts($('#toasts'));
  app.stats = createStats($('#stats'), { visible: statsWanted(location.search, dev) });
  app.hud = createHud(
    { hud: $('#hud'), tabbar: $('#tabbar'), sheetLayer: $('#sheet-layer') },
    {
      catalog: TILES,
      vibrate: (n) => app.a11y.vibrate(n),
      onSpeed: (sp) => { app.speed = sp; },
      onTab: () => { updateInsets(); poke(); },
    },
  );
  app.speed = 1;
  boot.progress(0.15);

  // Hauteur réelle de l'écran (barre d'adresse de Chrome Android, clavier) ; téléphone en paysage.
  function viewportHeight() {
    const vv = window.visualViewport;
    if (!vv) return Math.round(window.innerHeight);
    return Math.round(vv.height * (vv.scale > 1.01 ? vv.scale : 1));
  }
  const isTouch = matchMedia('(pointer: coarse)').matches;
  function applyViewport() {
    const h = viewportHeight();
    const w = window.innerWidth;
    document.documentElement.style.setProperty('--app-h', `${h}px`);
    const landscapePhone = isTouch && w > h && h < 520;
    document.body.classList.toggle('is-rotated', landscapePhone);
    const vv = window.visualViewport;
    if (vv && (vv.offsetTop || vv.offsetLeft) && vv.scale <= 1.01) window.scrollTo(0, 0);
  }

  // Zones de l'écran couvertes par la barre du haut et les onglets (px CSS) → CSS et rendu.
  let insetsKey = '';
  function updateInsets() {
    const { top, bottom } = app.hud.insets();
    const key = `${top},${bottom}`;
    if (key === insetsKey) return;
    insetsKey = key;
    document.documentElement.style.setProperty('--inset-top', `${top}px`);
    document.documentElement.style.setProperty('--inset-bottom', `${bottom}px`);
    if (typeof app.renderer?.setInsets === 'function') app.renderer.setInsets({ top, bottom, left: 0, right: 0 });
  }

  let sizeKey = '';
  function resizeScene() {
    if (!app.renderer) return;
    const rect = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const dpr = window.devicePixelRatio || 1;
    const key = `${w}x${h}@${dpr}`;
    if (key !== sizeKey) {
      sizeKey = key;
      app.renderer.resize(w, h, dpr);
      poke();
    }
    updateInsets();
  }

  applyViewport();
  window.addEventListener('resize', () => { applyViewport(); resizeScene(); });
  window.visualViewport?.addEventListener('resize', () => { applyViewport(); resizeScene(); });
  window.addEventListener('orientationchange', () => setTimeout(() => { applyViewport(); resizeScene(); }, 150));
  new ResizeObserver(() => resizeScene()).observe(stage);
  new ResizeObserver(() => updateInsets()).observe($('#hud'));
  new ResizeObserver(() => updateInsets()).observe($('#tabbar'));
  // Changement de densité de pixels sans changement de taille (fenêtre glissée sur un autre écran).
  (function watchDpr() {
    const mq = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    const onChange = () => { mq.removeEventListener?.('change', onChange); sizeKey = ''; resizeScene(); watchDpr(); };
    mq.addEventListener?.('change', onChange);
  })();

  // ── 2. Monde ──────────────────────────────────────────────────────────────────
  const seed = seedFromSearch(location.search);
  let world = rebuildRoads(generateWorld({ seed, cols: WORLD_COLS, rows: WORLD_ROWS, map: 'valley', starterTown: true }));
  app.world = world;
  app.hud.setGauges(initialGauges(world));
  app.hud.setDate({ month: 2, year: 1 });
  boot.progress(0.3);

  // ── 3. Rendu ──────────────────────────────────────────────────────────────────
  const r = await createRenderer(canvas, { manifestUrl: assetUrl('assets/models/manifest.json'), pixelRatioMax: 2, ...renderOptionsFromSearch(location.search) });
  app.renderer = r;
  boot.progress(0.8);
  r.setWorld(world);
  sizeKey = '';
  resizeScene();
  boot.progress(0.92);

  // ── 4. Gestes → caméra ────────────────────────────────────────────────────────

  /** Cadre toute la carte dans la zone libre entre la barre du haut et les onglets. */
  function fitView() {
    const { top, bottom } = app.hud.insets();
    r.camera.fitAll({ insets: { top, bottom, left: 0, right: 0 } });
    viewMode = 'all';
  }

  /** Vue de jeu : rapprochée (≈ GAME_ZOOM îlots de large), centrée sur la mairie. */
  function homeView() {
    const { top, bottom } = app.hud.insets();
    const c = centerOf(world);
    r.camera.lookAt(c.x, c.y, GAME_ZOOM, { insets: { top, bottom, left: 0, right: 0 } });
    viewMode = 'home';
  }

  /** Double toucher : alterne vue d'ensemble et vue de jeu. */
  function toggleView() {
    if (viewMode === 'home') fitView(); else homeView();
  }
  let viewMode = 'home';

  function tapAt(p, long) {
    const hit = r.pick(p.clientX, p.clientY);
    if (!hit) {
      app.toasts.show({ key: 'tile', text: 'Hors de la vallée', duration: 1500 });
      return;
    }
    const d = describeTile(world, hit.x, hit.y);
    if (!d) return;
    if (long) app.a11y.vibrate(20);
    app.toasts.show({ key: 'tile', kind: long ? 'info' : 'info', title: long ? (d.building || d.terrain) : undefined, text: long ? `Case ${hit.x},${hit.y}${d.native ? ' · nature d’origine' : ''}` : d.text, duration: long ? 3500 : 2200 });
  }

  app.gestures = createGestures(canvas, {
    onTap: (p) => tapAt(p, false),
    onLongPress: (p) => tapAt(p, true),
    onDoubleTap: () => { toggleView(); inertia = null; app.a11y.vibrate(8); poke(); },
    onPanStart: () => { inertia = null; poke(); },
    onPan: ({ dx, dy }) => { r.camera.pan(dx, dy); poke(); },
    onPanEnd: ({ vx, vy }) => {
      if (!app.a11y.reducedMotion() && Math.hypot(vx, vy) > 0.05) inertia = { vx, vy };
      poke();
    },
    onPinch: ({ factor, cx, cy, dx, dy }) => {
      inertia = null;
      if (factor && factor !== 1) r.camera.zoomAt(factor, cx, cy);
      if (dx || dy) r.camera.pan(dx, dy);
      poke();
    },
    onPinchEnd: () => poke(),
  });

  // ── 5. Boucle ─────────────────────────────────────────────────────────────────
  let rafId = 0;
  let running = false;
  let lastRender = performance.now();
  let lastStats = lastRender;
  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    const dtMs = now - lastRender;
    if (inertia) {
      const step = Math.min(40, dtMs);
      r.camera.pan(inertia.vx * step, inertia.vy * step);
      const k = Math.pow(0.94, step / 16);
      inertia.vx *= k;
      inertia.vy *= k;
      if (Math.hypot(inertia.vx, inertia.vy) < 0.02) inertia = null;
      poke();
    }
    const interacting = app.gestures.active || now < interactUntil;
    if (!interacting && dtMs < 1000 / IDLE_FPS - 1) return; // repos : une image sur deux
    lastRender = now;
    const t0 = performance.now();
    r.render(Math.min(0.1, dtMs / 1000));
    app.stats.frame(performance.now() - t0);
    if (now - lastStats >= STATS_EVERY_MS) {
      lastStats = now;
      app.stats.update(r.stats());
    }
  }
  function start() {
    if (running) return;
    running = true;
    lastRender = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  // Perte du contexte WebGL (onglet longtemps en arrière-plan) : pause, puis reconstruction à la restauration.
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    app.toasts.show({ key: 'gl', kind: 'warn', text: 'Affichage interrompu par le système… reprise automatique.' });
  });
  canvas.addEventListener('webglcontextrestored', () => {
    try {
      r.setWorld(world);
      sizeKey = '';
      resizeScene();
    } catch (err) {
      console.warn('Restauration du contexte :', err);
    }
    start();
    app.toasts.show({ key: 'gl', kind: 'success', text: 'Affichage rétabli.' });
  });

  // Première image (vue de jeu centrée sur la mairie, ou vue d'ensemble avec ?view=all), puis la page de chargement s'efface.
  if (new URLSearchParams(location.search).get('view') === 'all') fitView(); else homeView();
  r.render(0);
  app.stats.update(r.stats());
  start();

  // ── PWA ───────────────────────────────────────────────────────────────────────
  pwa.initPWA();
  pwa.onUpdateAvailable(() => {
    app.toasts.show({ key: 'update', kind: 'info', title: 'Nouvelle version disponible', text: 'Rechargez pour en profiter.', actionLabel: 'Recharger', onClick: () => pwa.applyUpdate(), duration: 10000 });
  });
  pwa.onOfflineReady(() => app.toasts.show({ key: 'offline', kind: 'success', text: 'Tiletown est prêt à jouer hors ligne.' }));

  // ── Prêt ──────────────────────────────────────────────────────────────────────
  window.__tiletown = {
    ready: true,
    seed,
    world,
    renderer: r,
    hud: app.hud,
    toasts: app.toasts,
    /** { calls, triangles, frameMs, fps } : valeurs fraîches du rendu + i/s de la dernière fenêtre. */
    stats: () => ({ ...app.stats.snapshot(), ...r.stats() }),
    /** Change de monde (graine) sans recharger : utile aux mesures. */
    regenerate(newSeed) {
      world = rebuildRoads(generateWorld({ seed: newSeed, cols: WORLD_COLS, rows: WORLD_ROWS, map: 'valley', starterTown: true }));
      app.world = world;
      window.__tiletown.world = world;
      r.setWorld(world);
      homeView();
      app.hud.setGauges(initialGauges(world));
      poke();
      return world;
    },
  };
  boot.ok();
  document.body.classList.remove('is-loading');
  const loading = $('#loading');
  if (loading) {
    loading.classList.add('is-done');
    setTimeout(() => loading.remove(), 600);
  }
}

main().catch((err) => boot.fail(err));
