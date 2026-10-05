// Point d'entrée de Tiletown : crée (ou recharge) la partie, le rendu, l'interface et la boucle
// (docs/ARCHITECTURE.md §6, §9, §11).
//
// Trois modes (§11.3) : `title` (écran titre par-dessus la vallée qui tourne doucement), `career`
// (un niveau de src/data/levels.js : vallée vierge avec la seule mairie, objectifs, tutoriel) et
// `sandbox` (la vallée habitée d'avant, tout ouvert, aucun objectif). La carrière est sauvegardée à
// part (clé `tiletown.career`) de la partie en cours (`tiletown.save`, qui porte `mode` et `levelId`).
// « ?mode=sandbox » ou « ?mode=career » saute l'écran titre (outils de mesure et parcours automatisés).
//
// Ordre de démarrage (la jauge de src/loader.js suit chaque étape via window.__bootProgress) :
//   1. réglages d'accessibilité, interface HTML (barre du haut, onglets, feuille, barre d'action, alertes, messages) ;
//   2. partie : sauvegarde locale (src/storage.js, clé tiletown.save) si elle existe et que « ?seed= » ne la contredit
//      pas, sinon createGame({ seed, cols: 12, rows: 16, starterTown: true }) ; « ?new=1 » repart de zéro ;
//   3. rendu three.js : createRenderer(canvas, { manifestUrl, pixelRatioMax: 2 }) → setWorld, resize, vue de jeu ;
//   4. gestes → caméra (glisser = pan, pincer / molette = zoomAt, double toucher = vue d'ensemble / de jeu) et
//      → pose (toucher bref = placement.tap : fantôme puis confirmation ; appui long = fiche de la case) ;
//   5. boucle rAF : advance(game, dt ≤ 0,1 s) chaque image → événements (saison, année : bandeau ; évolutions,
//      arrivées : messages) ; r.setWorld(game.world) seulement quand la référence change ; updateActors avec
//      dt × game.speed ; HUD toutes les 250 ms ; 60 i/s en interaction, 30 au repos, arrêt quand l'onglet est caché ;
//      sauvegarde à chaque mois franchi et après chaque pose / démolition / annulation.
// window.__tiletown = { ready, game, place, demolish, undo, setSpeed, advance(seconds), actors, stats(), hud, toasts, … }
// pour tools/play.mjs et tools/measure.mjs (Playwright). « ?seed= », « ?zoom= », « ?view=all », « ?new=1 »,
// « ?stats=1 » sont lus dans l'adresse. Toute erreur de démarrage remonte à window.__bootFail.

import { createGame, advance, canPlace, place, demolish, undoLast, setSpeed, cycleSpeed, describeTile as describeGameTile } from './core/game.js';
import { speciesSummary } from './core/ecology.js';
import { calendar } from './core/calendar.js';
import { SPEEDS, UNLOCKS } from './data/balance.js';
import { LEVELS, levelById, nextLevelId } from './data/levels.js';
import { createCareer, startLevel as startCareerLevel, evaluateGoals, evaluateStars, finishLevel as finishCareerLevel, scoreOf } from './core/career.js';
import { nextLesson, lessonDone, markSeen, lessonHighlight } from './core/tutorial.js';
import { TILES } from './data/tiles.js';
import { createActors, updateActors } from './core/actors.js';
import { applyPath, faceTowardRoad } from './core/roads.js';
import { centerOf } from './core/worldgen.js';
import { TERRAINS } from './data/terrain.js';
import { TILE_BY_ID } from './data/tiles.js';
import { createRenderer } from './render3d/renderer.js';
import { assetUrl, isDev } from './version.js';
import * as pwa from './pwa.js';
import { createStorage, createCareerStorage, wantsNewGame, normalizeMode } from './storage.js';
import { initA11y } from './ui/a11y.js';
import { createToasts } from './ui/toasts.js';
import { createHud } from './ui/hud.js';
import { createSheets, createBackStack } from './ui/sheets.js';
import { createCatalog } from './ui/catalog.js';
import { createPlacement } from './ui/placement.js';
import { createTileSheet } from './ui/sheet-tile.js';
import { createLayers } from './ui/layers.js';
import { createNatureSheet } from './ui/nature-sheet.js';
import { createSpeciesBook } from './ui/species-book.js';
import { createStats, statsWanted } from './ui/stats.js';
import { createGestures } from './ui/gestures.js';
import { createTitle, resumeText } from './ui/title.js';
import { createCareerMap } from './ui/career-map.js';
import { createGoals } from './ui/goals.js';
import { createTutorialUi } from './ui/tutorial-ui.js';
import { createLevelEnd } from './ui/level-end.js';
import { $ } from './ui/dom.js';

const DEFAULT_SEED = 12345;
const WORLD_COLS = 12;
const WORLD_ROWS = 16;
/** Vue de jeu par défaut : largeur visible en îlots (la vue d'ensemble se cadre toute seule). */
const GAME_ZOOM = 8;
const IDLE_FPS = 30;
const INTERACT_AFTER_MS = 300; // on reste à 60 i/s un instant après le dernier geste
const STATS_EVERY_MS = 500;
const HUD_EVERY_MS = 250;
const MAX_FRAME_DT = 0.1; // s : au-delà (onglet revenu au premier plan), le temps de jeu ne rattrape pas
/** Durée du cadre jaune posé sur la case montrée par un bouton « Voir » (alerte, espèce). */
const FOCUS_HIGHLIGHT_MS = 6000;
/** Vitesse de rotation de la vallée derrière l'écran titre (radians par seconde : un tour en ≈ 105 s). */
const TITLE_SPIN = 0.06;

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
 * Mode imposé par l'adresse : « ?mode=sandbox » ou « ?mode=career » sautent l'écran titre (outils de
 * mesure, parcours automatisés) ; « ?mode=title » le force. Rien d'autre n'est reconnu → null.
 */
export function modeFromSearch(search) {
  const v = new URLSearchParams(search || '').get('mode');
  if (v === 'title') return 'title';
  return normalizeMode(v);
}

/**
 * Ce que dit le bouton « Reprendre » de l'écran titre, d'après les métadonnées de la sauvegarde :
 * « La première vallée · mai, an 2 » en carrière, « Bac à sable · mars, an 1 » sinon. null si rien n'est sauvé.
 */
export function resumeInfo(meta, levels = LEVELS) {
  if (!meta) return null;
  const mode = normalizeMode(meta.mode) || 'sandbox';
  const level = mode === 'career' ? (levels || []).find((l) => l.id === meta.levelId) || null : null;
  const cal = calendar({ month: meta.month || 0 });
  return {
    mode,
    levelId: level ? level.id : null,
    text: resumeText({ mode, levelTitle: level ? level.title : '', monthLabel: cal.monthLabel, year: cal.year }),
  };
}

/** Catalogue complet (bac à sable) : tout ce qui s'achète, mairie exclue. */
export function allTileIds(tiles = TILES) {
  return tiles.filter((t) => t.buyable !== false).map((t) => t.id);
}

/** « an 2 sur 3 » : où en est le niveau, pour la ligne repliée du bandeau d'objectifs. */
export function levelYearText(game, level) {
  if (!level) return '';
  const years = Number(level.years) || 3;
  const year = Math.min(years, Math.floor((game?.month || 0) / 12) + 1);
  return `${level.title} · an ${year} sur ${years}`;
}

/** Vrai si tous les objectifs d'un niveau sont atteints (liste d'`evaluateGoals`). */
export function goalsAllDone(goals) {
  const rows = Array.isArray(goals) ? goals : [];
  return rows.length > 0 && rows.every((g) => g && g.done);
}

/** Vrai si la dernière année du niveau est écoulée. */
export function levelIsOver(game, level) {
  if (!level) return false;
  return (game?.month || 0) >= (Number(level.years) || 3) * 12;
}

/** Score de fin de niveau : celui du cœur (`scoreOf`), ou un repli lisible s'il n'est pas calculable. */
export function levelScoreOf(game, level = null, score = null) {
  if (typeof score === 'function') {
    try {
      const v = score(game, level);
      if (Number.isFinite(v)) return Math.max(0, Math.round(v));
    } catch { /* repli ci-dessous */ }
  }
  const s = (game && game.stats) || {};
  return Math.max(0, Math.round((s.population || 0) + (s.nature || 0) * 5 + (game?.money || 0) / 10));
}

/** Vrai si l'adresse impose une graine (« ?seed=… » non vide). */
export function hasSeedParam(search) {
  const v = new URLSearchParams(search || '').get('seed');
  return v !== null && v !== '';
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

/** Résumé d'une case pour le message au toucher (sans tuile en main) : « Case 3,4 : Herbe » (+ bâtiment). */
export function describeTile(world, x, y) {
  const tile = world.tiles[y * world.cols + x];
  if (!tile) return null;
  const terrain = TERRAINS[tile.terrain]?.label || tile.terrain;
  const b = tile.building;
  const building = b ? (TILE_BY_ID[b.type]?.label || b.type) + (b.level > 1 ? ` (niveau ${b.level})` : '') : null;
  return { terrain, building, native: !!tile.native, text: `Case ${x},${y} : ${terrain}${building ? ` · ${building}` : ''}` };
}

/** Condition de déblocage d'une tuile (src/data/balance.js UNLOCKS, par palier de population) ou null. */
export function unlockHintFor(id, unlocks = UNLOCKS) {
  for (const u of unlocks || []) {
    if (u.tiles && u.tiles.includes(id)) {
      if (Number.isFinite(u.population)) return `Dès ${u.population} habitants`;
      if (Number.isFinite(u.year)) return `Dès l’an ${u.year}`;
    }
  }
  return null;
}

/**
 * Delta mensuel de l'argent pour la jauge (« +12 $/mois ») : `stats.income` et `stats.upkeep` du cœur sont ce qui
 * est encaissé et payé à chaque tick de mois (les montants par saison sont dans `seasonIncome` / `seasonUpkeep`).
 */
export function monthlyDelta(stats = {}) {
  if (Number.isFinite(stats.monthlyNet)) return stats.monthlyNet;
  if (Number.isFinite(stats.net)) return stats.net;
  return (Number(stats.income) || 0) - (Number(stats.upkeep) || 0);
}

/** Jauges du HUD depuis l'état de partie. */
export function gaugesOf(game) {
  const s = game.stats || {};
  return {
    population: s.population || 0,
    happiness: s.happiness ?? 50,
    nature: s.nature ?? 50,
    money: game.money ?? 0,
    delta: monthlyDelta(s),
  };
}

/** Titres des alertes d'écologie (clés de `stepEcology`, docs/ARCHITECTURE.md §10.1). */
export const ECO_ALERT_TITLES = Object.freeze({
  smog: 'Smog sur les quartiers',
  algae: 'Le lac se couvre d’algues',
  flood: 'La rivière peut déborder',
  heat: 'Un quartier étouffe de chaleur',
});

/** Titre d'une alerte d'écologie en clair (clé inconnue : titre générique, jamais d'identifiant brut). */
export function ecoAlertTitle(key) {
  return ECO_ALERT_TITLES[key] || 'La vallée a besoin d’attention';
}

/** Cible du bouton « Voir » d'un événement : { x, y, layer } ou null (rien à montrer). */
export function seeTargetOf(ev, layer = null) {
  if (!ev || typeof ev !== 'object') return null;
  const x = Number(ev.x);
  const y = Number(ev.y);
  const kind = ev.layer || layer || null;
  const placed = Number.isFinite(x) && Number.isFinite(y);
  if (!placed && !kind) return null;
  return { x: placed ? Math.trunc(x) : null, y: placed ? Math.trunc(y) : null, layer: kind };
}

/**
 * Présentation d'un événement du cœur pour l'interface :
 * { channel: 'banner' | 'toast' | null, kind, title, text, see: { x, y, layer } | null, seeLabel }.
 * `season`, `year` et les alertes d'écologie passent en bandeau (bouton « Voir » puis OK) ; `evolve`,
 * `arrivals`, `species`, `unlock`… en message ; `month` : rien.
 */
export function eventPresentation(ev, cal = null) {
  if (!ev || typeof ev !== 'object') return { channel: null };
  const text = typeof ev.text === 'string' ? ev.text : '';
  switch (ev.type) {
    case 'eco-alert':
      return { channel: 'banner', kind: 'warn', title: ev.title || ecoAlertTitle(ev.key), text: text || 'La vallée a besoin d’attention.', see: seeTargetOf(ev), seeLabel: 'Voir' };
    case 'species':
      return ev.present
        ? { channel: 'toast', kind: 'success', title: ev.title || 'Une espèce s’installe', text: text || 'Une espèce vient de s’installer dans la vallée.', see: seeTargetOf(ev, 'fauna'), seeLabel: 'Voir' }
        : { channel: 'toast', kind: 'warn', title: null, text: text || 'Une espèce a quitté la vallée.', see: null };
    case 'season': return { channel: 'banner', kind: 'season', title: ev.title || `Bilan de saison${cal ? ` · an ${cal.year}` : ''}`, text: text || 'La saison s’achève.' };
    case 'year': return { channel: 'banner', kind: 'year', title: ev.title || `Bilan de l’an ${cal ? Math.max(1, cal.year - 1) : ''}`.trim(), text: text || 'Une année de plus pour la ville.' };
    case 'broke': return { channel: 'banner', kind: 'error', title: ev.title || 'La ville est en faillite', text: text || 'Les caisses sont vides depuis deux saisons.' };
    case 'evolve': return { channel: 'toast', kind: 'success', title: ev.title || 'Évolution', text: text || 'Un îlot a changé de niveau.' };
    case 'arrivals': return { channel: 'toast', kind: 'info', title: null, text: text || 'De nouveaux habitants arrivent.' };
    case 'departures': case 'exodus': return { channel: 'toast', kind: 'warn', title: null, text: text || 'Des habitants s’en vont.' };
    case 'unlock': return { channel: 'toast', kind: 'success', title: ev.title || 'Catalogue', text: text || 'Nouvelle tuile disponible.' };
    case 'month': case 'tick': return { channel: null };
    default: return text ? { channel: 'toast', kind: ev.kind || 'info', title: ev.title || null, text } : { channel: null };
  }
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
  const actionBar = $('#action');
  const alerts = $('#alerts');
  const tabbar = $('#tabbar');

  // ── 1. Réglages et interface ───────────────────────────────────────────────────
  app.a11y = initA11y();
  const vibrate = (n) => app.a11y.vibrate(n);
  app.toasts = createToasts($('#toasts'));
  app.stats = createStats($('#stats'), { visible: statsWanted(location.search, dev) });
  const goalsHost = $('#goals');
  const tutorialHost = $('#tutorial');
  const screens = $('#screens');
  app.hud = createHud(
    { hud: $('#hud'), tabbar, action: actionBar, alerts, goals: goalsHost },
    {
      speeds: SPEEDS,
      vibrate,
      onSpeed: (sp) => { applyGame(setSpeed(game, sp), { silent: true }); app.tutorial?.refresh(); poke(); },
      onTab: (id) => { onTab(id); updateInsets(); poke(); },
      onGauge: (id) => { onGauge(id); updateInsets(); poke(); },
      onMenu: () => { confirmLeaving(() => openTitle()); poke(); },
    },
  );
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

  // Zones de l'écran couvertes par la barre du haut et, en bas, par les onglets et la barre d'action → CSS et rendu.
  let insetsKey = '';
  const hudEl = $('#hud');
  function updateInsets() {
    const { top, bottom } = app.hud.insets();
    const tabH = tabbar.offsetHeight;
    // Hauteur de la seule barre du haut : le bandeau d'objectifs se pose juste dessous (css/style.css).
    const hudH = hudEl.offsetHeight;
    const key = `${top},${bottom},${tabH},${hudH}`;
    if (key === insetsKey) return;
    insetsKey = key;
    document.documentElement.style.setProperty('--hud-h', `${hudH}px`);
    document.documentElement.style.setProperty('--inset-top', `${top}px`);
    document.documentElement.style.setProperty('--inset-bottom', `${bottom}px`);
    document.documentElement.style.setProperty('--tabbar-h', `${tabH}px`);
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
  new ResizeObserver(() => updateInsets()).observe(tabbar);
  new ResizeObserver(() => updateInsets()).observe(actionBar);
  // Changement de densité de pixels sans changement de taille (fenêtre glissée sur un autre écran).
  (function watchDpr() {
    const mq = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    const onChange = () => { mq.removeEventListener?.('change', onChange); sizeKey = ''; resizeScene(); watchDpr(); };
    mq.addEventListener?.('change', onChange);
  })();

  // ── 2. Partie ─────────────────────────────────────────────────────────────────
  const storage = createStorage();
  const careerStore = createCareerStorage();
  const search = location.search;
  const seedParam = seedFromSearch(search);
  const forcedMode = modeFromSearch(search);
  let game = null;
  let restored = false;
  let savedMeta = null;
  if (wantsNewGame(search)) { storage.clearGame(); careerStore.clear(); }
  else {
    savedMeta = storage.meta();
    const saved = storage.loadGame();
    // Une graine imposée dans l'adresse qui diffère de la sauvegarde : nouvelle vallée (débogage, mesures).
    if (saved && (!hasSeedParam(search) || saved.seed === seedParam)) { game = saved; restored = true; }
    else savedMeta = null;
  }
  // Carrière : séparée de la partie en cours (perdre l'une ne perd jamais l'autre).
  let career = careerStore.load() || createCareer();
  // Mode de la partie restaurée : l'enveloppe le dit, et `game.levelId` le confirme (sauvegarde
  // d'avant la carrière : aucun des deux, c'est un bac à sable).
  const savedLevelId = (savedMeta && savedMeta.levelId) || (restored ? game.levelId : null) || null;
  let mode = restored ? (normalizeMode(savedMeta && savedMeta.mode) || (savedLevelId ? 'career' : 'sandbox')) : 'sandbox';
  let level = restored && mode === 'career' ? levelById(savedLevelId) : null;
  if (mode === 'career' && !level) mode = 'sandbox';
  if (!game) game = createGame({ seed: seedParam, cols: WORLD_COLS, rows: WORLD_ROWS, starterTown: true });
  let seed = game.seed ?? seedParam;
  /** Sauvegarde la partie en cours avec son mode et, en carrière, son niveau. */
  const saveNow = () => storage.saveGame(game, { mode, levelId: level ? level.id : null });
  const saveCareer = () => careerStore.save(career);
  // Acteurs : habitants, véhicules, faune (simulation pure, affichée par le rendu ; non sauvegardés).
  let actors = createActors(game.world, seed);
  let updateMs = 0;
  let lastSavedMonth = game.month;
  const getGame = () => game;

  const syncHud = () => {
    app.hud.setGauges(gaugesOf(game));
    app.hud.setDate(calendar(game));
    app.hud.setSpeed(game.speed);
  };
  syncHud();
  boot.progress(0.3);

  // ── 3. Rendu ──────────────────────────────────────────────────────────────────
  const r = await createRenderer(canvas, { manifestUrl: assetUrl('assets/models/manifest.json'), pixelRatioMax: 2, ...renderOptionsFromSearch(search) });
  app.renderer = r;
  boot.progress(0.8);
  r.setWorld(game.world);
  r.setActors(actors);
  sizeKey = '';
  resizeScene();
  boot.progress(0.92);

  // ── 3 bis. Feuilles, catalogue, pose, fiche ─────────────────────────────────────
  const back = createBackStack({ onBack: () => onBack() });
  app.sheets = createSheets($('#sheet-layer'), {
    vibrate,
    onChange: (id) => { if (id) back.hold('sheet'); else back.release('sheet'); syncTabs(); },
  });

  /** Remplace l'état de partie ; pousse le monde au rendu s'il a changé ; met l'interface à jour ; sauvegarde. */
  function applyGame(next, meta = {}) {
    if (!next || next === game) return game;
    const prevWorld = game.world;
    game = next;
    if (game.world !== prevWorld) {
      r.setWorld(game.world);
      pushEco();
      poke();
    }
    syncHud();
    app.catalog?.refresh();
    syncGoals();
    app.tutorial?.refresh();
    if (meta.kind) {
      saveNow();
      lastSavedMonth = game.month;
    }
    return game;
  }

  const unlockHint = (id) => unlockHintFor(id);
  const ops = {
    canPlace,
    place,
    demolish,
    undoLast,
    describeTile: describeGameTile,
    /** Orientation du fantôme (degrés) : vers la rue la plus proche, tracé de raccordement compris. */
    previewYaw(g, x, y, res) {
      try {
        const w = res && Array.isArray(res.path) && res.path.length ? applyPath(g.world, res.path) : g.world;
        return faceTowardRoad(w, x, y, centerOf(g.world));
      } catch {
        return 0;
      }
    },
  };
  app.placement = createPlacement({
    bar: actionBar, renderer: r, ops, getGame, apply: applyGame, toasts: app.toasts, vibrate, back, unlockHint,
    onState: () => { syncTabs(); updateInsets(); poke(); },
  });
  app.catalog = createCatalog({ sheets: app.sheets, placement: app.placement, getGame, vibrate, toasts: app.toasts, unlockHint });
  app.tileSheet = createTileSheet({
    sheets: app.sheets, ops, getGame, renderer: r, vibrate,
    onDemolish: (x, y) => { app.placement.demolishAt(x, y); },
  });

  // ── 3 ter. Écologie : calques, fiche Nature, carnet des espèces (docs/ARCHITECTURE.md §10.4) ───
  app.layers = createLayers({
    sheets: app.sheets, renderer: r, getGame, pill: $('#layer-pill'), vibrate, toasts: app.toasts,
    onChange: () => { syncTabs(); poke(); },
  });
  const ecoOps = { speciesSummary };
  app.speciesBook = createSpeciesBook({
    sheets: app.sheets, getGame, ops: ecoOps, layers: app.layers, renderer: r, vibrate,
    focus: (cell) => focusEco(cell),
    onBack: () => app.natureSheet.open(),
  });
  app.natureSheet = createNatureSheet({
    sheets: app.sheets, getGame, ops: ecoOps, layers: app.layers, renderer: r, vibrate,
    focus: (cell) => focusEco(cell),
    book: app.speciesBook,
  });

  /**
   * Pousse l'écologie du mois au rendu (brume d'air, teinte de l'eau, icônes d'espèces), rafraîchit le
   * calque allumé et les feuilles ouvertes. Chaque appel au rendu est facultatif : l'interface marche
   * même si l'étape écologie du rendu n'est pas encore en place.
   */
  function pushEco() {
    const eco = game.eco;
    if (!eco) return;
    try { r.setEcology?.({ air: eco.air, water: eco.water }); } catch (err) { console.warn('setEcology :', err); }
    try { r.setSpecies?.(eco.species, eco.patches); } catch (err) { console.warn('setSpecies :', err); }
    app.layers.refresh();
    app.natureSheet.refresh();
    app.speciesBook.refresh();
  }
  pushEco();

  // ── 3 quater. Carrière, objectifs, tutoriel, écrans (docs/ARCHITECTURE.md §11.3) ───────────────
  app.goals = createGoals(goalsHost, { vibrate, onToggle: () => { updateInsets(); poke(); } });
  app.tutorial = createTutorialUi(tutorialHost, {
    getGame,
    // Contexte du tutoriel (src/core/tutorial.js) : ce que l'interface sait et que le cœur ne voit pas.
    getContext: () => ({ layer: app.layers?.kind && app.layers.kind !== 'none' ? app.layers.kind : null, level, goals: currentGoals() }),
    ops: { nextLesson, lessonDone, markSeen, lessonHighlight },
    renderer: r,
    hud: app.hud,
    toasts: app.toasts,
    vibrate,
    onSeen: (id, seen) => {
      career = { ...career, seen: [...seen] };
      saveCareer();
    },
  });
  app.title = createTitle(screens, {
    vibrate,
    onResume: () => resumeGame(),
    onCareer: () => openCareerMap(),
    onSandbox: () => startSandbox(),
  });
  app.careerMap = createCareerMap(screens, {
    vibrate,
    onPlay: (id) => startLevelById(id),
    onBack: () => openTitle(),
  });
  app.levelEnd = createLevelEnd(screens, {
    vibrate,
    onReplay: () => { app.levelEnd.close(); startLevelById(level ? level.id : career.levelId); },
    onNext: (id) => { app.levelEnd.close(); startLevelById(id); },
    onMap: () => { app.levelEnd.close(); openCareerMap(); },
  });

  /** Avancement des objectifs du niveau courant (vide hors carrière). */
  function currentGoals() {
    if (mode !== 'career' || !level) return [];
    try { return evaluateGoals(game, level); } catch { return []; }
  }

  /** Remet le bandeau d'objectifs à jour (ligne repliée comprise) ; le cache hors carrière. */
  function syncGoals() {
    if (!app.goals) return;
    const hidden = mode !== 'career' || !level || app.title?.isOpen() || app.careerMap?.isOpen();
    if (hidden) { app.goals.hide(); updateInsets(); return; }
    app.goals.setGoals(currentGoals(), { title: levelYearText(game, level) });
    if (!app.goals.visible) { app.goals.show(); updateInsets(); }
  }

  /** Vrai dès qu'une partie a commencé (niveau lancé, bac à sable, ou partie restaurée). */
  let playing = restored;
  /** Vrai si une partie est en cours et mérite une confirmation avant d'être quittée. */
  function gameInProgress() {
    return playing && !app.title.isOpen() && !app.levelEnd.isOpen();
  }

  /**
   * Demande confirmation avant de quitter la partie en cours (bandeau du HUD, jamais une boîte
   * système) : « Quitter » sauvegarde et s'en va, « Rester » ne fait rien.
   */
  function confirmLeaving(action) {
    if (!gameInProgress()) { action(); return; }
    app.hud.showBanner({
      kind: 'warn',
      title: 'Quitter la partie en cours ?',
      text: 'Elle est sauvegardée : vous la retrouverez avec « Reprendre ».',
      seeLabel: 'Quitter',
      onSee: () => { saveNow(); action(); },
      actionLabel: 'Rester',
    });
  }

  /**
   * Écran titre : le temps se met en pause, la vallée tourne doucement derrière. La partie n'est
   * sauvegardée que si une partie a bien commencé (sinon « Reprendre » s'inviterait au premier lancement).
   */
  function openTitle() {
    if (app.title.isOpen()) return;
    app.sheets.close('title');
    app.placement.drop();
    app.hud.hideBanner();
    app.levelEnd.close();
    app.careerMap.close();
    app.tutorial.stop();
    if (playing) saveNow();
    applyGame(setSpeed(game, 0), { silent: true });
    const meta = storage.meta();
    const info = resumeInfo(meta, LEVELS);
    app.title.open({ hasSave: !!info, resumeText: info ? info.text : '' });
    poke();
  }

  /** Carte de carrière (depuis l'écran titre, ou après un niveau). */
  function openCareerMap() {
    app.title.close();
    app.levelEnd.close();
    app.tutorial.stop();
    app.careerMap.open({ levels: LEVELS, career });
    poke();
  }

  /** Reprend la partie sauvegardée telle qu'elle était (mode et niveau compris). */
  function resumeGame() {
    playing = true;
    app.title.close();
    app.careerMap.close();
    if (mode === 'career' && level) {
      app.tutorial.setScenario(level.tutorial || null, career.seen);
      app.tutorial.resume();
    } else {
      app.tutorial.stop();
    }
    syncGoals();
    syncTabs();
    homeView();
    applyGame(setSpeed(game, 1), { silent: true });
    saveNow();
    poke();
  }

  /** Remplace la partie en cours (nouveau niveau, bac à sable) : monde, acteurs, caméra, interface. */
  function installGame(next) {
    app.placement.drop();
    app.sheets.close('new');
    app.hud.hideBanner();
    game = next;
    seed = game.seed ?? seed;
    actors = createActors(game.world, seed);
    r.setWorld(game.world);
    r.setActors(actors);
    try { r.setHighlight(null); } catch { /* rien */ }
    pushEco();
    homeView();
    syncHud();
    app.catalog.refresh();
    lastSavedMonth = game.month;
    levelEnded = false;
    poke();
  }

  /** Démarre (ou rejoue) un niveau de carrière : vallée vierge avec la seule mairie. */
  function startLevelById(levelId) {
    let started = null;
    try {
      started = startCareerLevel(career, levelId);
    } catch (err) {
      console.warn('Niveau indisponible :', err);
      app.toasts.show({ key: 'level', kind: 'warn', text: 'Ce niveau n’est pas encore ouvert.' });
      return null;
    }
    if (!started || !started.game) return null;
    playing = true;
    mode = 'career';
    level = started.level;
    career = { ...career, levelId: level.id };
    app.title.close();
    app.careerMap.close();
    app.levelEnd.close();
    installGame(started.game);
    app.tutorial.setScenario(level.tutorial || null, career.seen);
    app.tutorial.resume();
    syncGoals();
    syncTabs();
    saveNow();
    saveCareer();
    app.toasts.show({ key: 'level', kind: 'success', title: level.title, text: level.subtitle || 'Bonne vallée !', duration: 4500 });
    return level;
  }

  /** Bac à sable : la vallée habitée d'avant, tout le catalogue ouvert, aucun objectif. */
  function startSandbox(newSeed = seedParam) {
    playing = true;
    mode = 'sandbox';
    level = null;
    app.title.close();
    app.careerMap.close();
    app.levelEnd.close();
    app.tutorial.stop();
    installGame(createGame({ seed: newSeed, cols: WORLD_COLS, rows: WORLD_ROWS, starterTown: true, unlocked: allTileIds() }));
    syncGoals();
    syncTabs();
    saveNow();
    return game;
  }

  /** Fin de niveau : étoiles, carrière mise à jour, écran de fin. */
  let levelEnded = false;
  function endLevel() {
    if (mode !== 'career' || !level || levelEnded) return null;
    levelEnded = true;
    const goals = currentGoals();
    const stars = evaluateStars(game, level);
    const finished = level;
    career = finishCareerLevel(career, finished.id, stars.count, game);
    saveCareer();
    applyGame(setSpeed(game, 0), { silent: true });
    app.sheets.close('end');
    app.placement.drop();
    app.tutorial.stop();
    app.levelEnd.open({ level: finished, stars, goals, score: levelScoreOf(game, finished, scoreOf), nextLevel: levelById(nextLevelId(finished.id)) });
    poke();
    return stars;
  }

  /** À chaque mois franchi : objectifs atteints, ou dernière année écoulée → écran de fin. */
  function checkLevelEnd() {
    if (mode !== 'career' || !level || levelEnded) return false;
    const over = goalsAllDone(currentGoals()) || levelIsOver(game, level);
    if (over) endLevel();
    return over;
  }

  /** Onglet allumé : la feuille ouverte, sinon l'outil Démolir, sinon la famille de la tuile en main. */
  function syncTabs() {
    const sheet = app.sheets.current;
    let active = null;
    if (sheet && sheet !== 'tile') active = sheet === 'nature' || sheet === 'species' ? null : sheet;
    else if (app.layers?.kind && app.layers.kind !== 'none') active = 'layers';
    else if (app.placement.tool === 'demolish') active = 'demolish';
    else if (app.placement.hand) active = TILE_BY_ID[app.placement.hand]?.family || null;
    app.hud.setActiveTab(active);
  }

  function onTab(id) {
    if (id === 'layers') {
      if (app.placement.tool === 'demolish') app.placement.drop();
      app.layers.open();
      syncTabs();
      return;
    }
    if (id === 'demolish') {
      if (app.placement.tool === 'demolish') { app.placement.drop(); return; }
      app.sheets.close('tab');
      app.placement.setTool('demolish');
      app.toasts.show({ key: 'tool', text: 'Démolir : touchez un îlot, puis confirmez.', duration: 2500 });
      return;
    }
    // Un onglet de famille : si la tuile en main est de cette famille et la feuille fermée, on la lâche d'abord.
    if (app.placement.tool === 'demolish') app.placement.drop();
    app.catalog.open(id);
    syncTabs();
  }

  /** Toucher une jauge de la barre du haut : la jauge Nature ouvre sa fiche détaillée. */
  function onGauge(id) {
    if (id === 'nature') {
      if (app.placement.tool === 'demolish') app.placement.drop();
      app.natureSheet.open();
      syncTabs();
    }
  }

  /** Bouton « retour » / Échap : ferme la couche du dessus (écran, feuille, puis tuile en main ou outil). */
  function onBack() {
    if (app.levelEnd?.isOpen()) return; // fin de niveau : il faut choisir (Rejouer ou la suite)
    if (app.careerMap?.isOpen()) { openTitle(); return; }
    if (app.title?.isOpen()) return; // l'écran titre est la racine : rien derrière
    if (app.sheets.isOpen()) { app.sheets.close('back'); return; }
    if (app.placement.state !== 'idle') { app.placement.drop(); return; }
    app.hud.hideBanner();
  }

  // ── 4. Gestes → caméra et pose ────────────────────────────────────────────────
  const insetsNow = () => { const { top, bottom } = app.hud.insets(); return { top, bottom, left: 0, right: 0 }; };

  /** Cadre toute la carte dans la zone libre entre la barre du haut et les onglets. */
  function fitView() {
    r.camera.fitAll({ insets: insetsNow() });
    viewMode = 'all';
  }

  /** Vue de jeu : rapprochée (≈ GAME_ZOOM îlots de large), centrée sur la mairie. */
  function homeView() {
    const c = centerOf(game.world);
    r.camera.lookAt(c.x, c.y, GAME_ZOOM, { insets: insetsNow() });
    viewMode = 'home';
  }

  /** Double toucher : alterne vue d'ensemble et vue de jeu. */
  function toggleView() {
    if (viewMode === 'home') fitView(); else homeView();
  }
  let viewMode = 'home';
  let focusTimer = 0;

  /**
   * Bouton « Voir » d'une alerte ou d'une espèce : centre la carte sur la case, allume le calque
   * concerné et pose un cadre jaune quelques secondes pour que l'œil trouve l'endroit.
   */
  function focusEco({ x, y, layer } = {}) {
    if (layer) app.layers.set(layer);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      r.camera.lookAt(x, y, GAME_ZOOM, { insets: insetsNow() });
      viewMode = 'home';
      try { r.setHighlight([{ x, y }]); } catch { /* rien */ }
      clearTimeout(focusTimer);
      focusTimer = setTimeout(() => {
        try { if (!app.tileSheet.isOpen()) r.setHighlight(null); } catch { /* rien */ }
        r.invalidate?.();
      }, FOCUS_HIGHLIGHT_MS);
    }
    poke();
  }

  function tapAt(p) {
    const hit = r.pick(p.clientX, p.clientY);
    if (app.placement.tap(hit)) { poke(); return; }
    if (!hit) {
      app.toasts.show({ key: 'tile', text: 'Hors de la vallée', duration: 1500 });
      return;
    }
    const d = describeTile(game.world, hit.x, hit.y);
    if (d) app.toasts.show({ key: 'tile', text: d.text, duration: 2200 });
  }

  function longPressAt(p) {
    const hit = r.pick(p.clientX, p.clientY);
    if (!hit) return;
    vibrate(20);
    app.tileSheet.open(hit.x, hit.y);
    poke();
  }

  app.gestures = createGestures(canvas, {
    onTap: (p) => tapAt(p),
    onLongPress: (p) => longPressAt(p),
    onDoubleTap: () => { toggleView(); inertia = null; vibrate(8); poke(); },
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

  // ── 5. Temps de jeu et événements ─────────────────────────────────────────────
  function presentEvents(events) {
    if (!Array.isArray(events) || !events.length) return;
    const cal = calendar(game);
    for (const ev of events) {
      const p = eventPresentation(ev, cal);
      const target = p.see || null;
      const onSee = target ? () => focusEco(target) : null;
      const key = ev.key ? `${ev.type}:${ev.key}` : ev.type;
      if (p.channel === 'banner') {
        app.hud.showBanner({ kind: p.kind, title: p.title, text: p.text, actionLabel: 'OK', seeLabel: p.seeLabel || 'Voir', onSee });
      } else if (p.channel === 'toast') {
        app.toasts.show({
          key, kind: p.kind, title: p.title || undefined, text: p.text,
          duration: onSee ? 9000 : 4000,
          actionLabel: p.seeLabel || 'Voir',
          onClick: onSee || undefined,
        });
      }
      if (ev.type === 'unlock') app.catalog.refresh();
      if (ev.type === 'species') app.speciesBook.refresh();
    }
  }

  /** Avance le temps de jeu de `dt` secondes réelles (× game.speed dans le cœur) : événements, HUD, sauvegarde mensuelle. */
  function stepGame(dt) {
    if (!(dt > 0) || !game.speed) return;
    const before = game;
    const res = advance(game, dt);
    if (!res || !res.game || res.game === before) return;
    game = res.game;
    if (game.world !== before.world) { r.setWorld(game.world); poke(); }
    if (game.month !== before.month) {
      syncHud();
      pushEco();
      app.catalog.refresh();
      app.placement.refresh();
      syncGoals();
      if (game.month !== lastSavedMonth) {
        saveNow();
        lastSavedMonth = game.month;
      }
    }
    presentEvents(res.events);
    app.tutorial?.refresh();
    if (game.month !== before.month) checkLevelEnd();
  }

  // ── 6. Boucle ─────────────────────────────────────────────────────────────────
  let rafId = 0;
  let running = false;
  let lastRender = performance.now();
  let lastStats = lastRender;
  let lastHud = lastRender;
  let lastSim = lastRender;
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
    // Le temps de jeu avance à chaque image (même au repos : une image sur deux), plafonné à 0,1 s.
    const simDt = Math.min(MAX_FRAME_DT, (now - lastSim) / 1000);
    lastSim = now;
    // Écran titre : la vallée tourne doucement derrière, comme une maquette posée sur un plateau.
    if (app.title?.isOpen() && !app.a11y.reducedMotion()) {
      const st = r.camera.state;
      r.camera.setState({ ...st, yaw: st.yaw + simDt * TITLE_SPIN });
      poke();
    }
    const interacting = app.gestures.active || now < interactUntil;
    if (!interacting && dtMs < 1000 / IDLE_FPS - 1) {
      stepGame(simDt);
      return; // repos : une image sur deux
    }
    lastRender = now;
    const tu = performance.now();
    stepGame(simDt);
    if (game.speed > 0) updateActors(actors, game.world, simDt * game.speed);
    updateMs = performance.now() - tu;
    const t0 = performance.now();
    r.render(Math.min(MAX_FRAME_DT, dtMs / 1000));
    app.stats.frame(performance.now() - t0);
    if (now - lastHud >= HUD_EVERY_MS) {
      lastHud = now;
      app.hud.setGauges(gaugesOf(game));
    }
    if (now - lastStats >= STATS_EVERY_MS) {
      lastStats = now;
      app.stats.update(r.stats());
    }
  }
  function start() {
    if (running) return;
    running = true;
    lastRender = performance.now();
    lastSim = lastRender;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stop(); saveNow(); } else start();
  });
  window.addEventListener('pagehide', () => saveNow());

  // Perte du contexte WebGL (onglet longtemps en arrière-plan) : pause, puis reconstruction à la restauration.
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    app.toasts.show({ key: 'gl', kind: 'warn', text: 'Affichage interrompu par le système… reprise automatique.' });
  });
  canvas.addEventListener('webglcontextrestored', () => {
    try {
      r.setWorld(game.world);
      sizeKey = '';
      resizeScene();
    } catch (err) {
      console.warn('Restauration du contexte :', err);
    }
    start();
    app.toasts.show({ key: 'gl', kind: 'success', text: 'Affichage rétabli.' });
  });

  // Première image (vue de jeu centrée sur la mairie, ou vue d'ensemble avec ?view=all), puis la page de chargement s'efface.
  {
    const q = new URLSearchParams(search);
    const z = Number(q.get('zoom'));
    if (q.get('view') === 'all') fitView();
    else if (Number.isFinite(z) && z > 0) { const c = centerOf(game.world); r.camera.lookAt(c.x, c.y, z, { insets: insetsNow() }); }
    else homeView();
  }
  r.render(0);
  app.stats.update(r.stats());
  start();

  // ── Mode de départ (§11.3) : écran titre, sauf si l'adresse impose « ?mode= » ──────────────────
  if (forcedMode === 'career') {
    startLevelById(career.levelId || LEVELS[0].id);
  } else if (forcedMode === 'sandbox') {
    if (restored && mode === 'sandbox') { syncGoals(); syncTabs(); }
    else startSandbox(seed);
  } else if (forcedMode === 'title' || !restored) {
    openTitle();
  } else {
    // Une partie est en cours : l'écran titre s'affiche quand même, « Reprendre » la retrouve telle quelle.
    openTitle();
    const cal = calendar(game);
    app.toasts.show({ key: 'restore', kind: 'success', text: `Partie en attente : ${cal.monthLabel}, an ${cal.year}.`, duration: 3000 });
  }
  syncGoals();

  // ── PWA ───────────────────────────────────────────────────────────────────────
  pwa.initPWA();
  pwa.onUpdateAvailable(() => {
    app.toasts.show({ key: 'update', kind: 'info', title: 'Nouvelle version disponible', text: 'Rechargez pour en profiter.', actionLabel: 'Recharger', onClick: () => pwa.applyUpdate(), duration: 10000 });
  });
  pwa.onOfflineReady(() => app.toasts.show({ key: 'offline', kind: 'success', text: 'Tiletown est prêt à jouer hors ligne.' }));

  // ── Prêt ──────────────────────────────────────────────────────────────────────
  const nowSeconds = () => performance.now() / 1000;
  /** Nouvelle partie de bac à sable (mesures, outils) : la sauvegarde précédente est effacée. */
  function newGame(newSeed = seed) {
    storage.clearGame();
    return startSandbox(newSeed);
  }

  window.__tiletown = {
    ready: true,
    get seed() { return seed; },
    get game() { return game; },
    get world() { return game.world; },
    renderer: r,
    hud: app.hud,
    toasts: app.toasts,
    sheets: app.sheets,
    catalog: app.catalog,
    placement: app.placement,
    tileSheet: app.tileSheet,
    layers: app.layers,
    natureSheet: app.natureSheet,
    speciesBook: app.speciesBook,
    titleScreen: app.title,
    careerMap: app.careerMap,
    levelEnd: app.levelEnd,
    goalsBand: app.goals,
    tutorial: app.tutorial,
    storage,
    careerStore,

    // ── Carrière, tutoriel, objectifs (docs/ARCHITECTURE.md §11.5 : tools/play-career.mjs) ───────
    /** Mode courant : 'title' tant que l'écran titre est affiché, sinon 'career' ou 'sandbox'. */
    get mode() { return app.title.isOpen() ? 'title' : mode; },
    /** Carrière en cours, en objet simple : { levelId, unlocked, stars, tiles, seen }. */
    career: () => ({
      levelId: career.levelId,
      unlocked: [...(career.unlocked || [])],
      stars: { ...(career.stars || {}) },
      tiles: [...(career.tiles || [])],
      seen: [...(career.seen || [])],
    }),
    /** Niveau joué : { id, title, subtitle, years, money } ou null (bac à sable). */
    level: () => (level ? { id: level.id, title: level.title, subtitle: level.subtitle || '', years: level.years || 3, money: level.money ?? null } : null),
    /** Avancement des objectifs : [ { id, label, done, value, target } ] (vide hors carrière). */
    goals: () => currentGoals(),
    /** Leçon affichée : { id, title, text, highlight } ou null. */
    lesson() {
      const l = app.tutorial.lesson;
      if (!l) return null;
      return { id: l.id, title: l.title, text: l.text, highlight: l.highlight || null, tile: l.tile || null, visible: app.tutorial.isOpen() };
    },
    /** Liste des niveaux (carte de carrière). */
    levels: () => LEVELS.map((l) => ({ id: l.id, title: l.title, subtitle: l.subtitle || '', years: l.years || 3 })),
    /** Ouvre l'écran titre (comme le bouton Menu, sans confirmation). */
    showTitle: () => { openTitle(); return true; },
    /** Ouvre la carte de carrière. */
    startCareer() { openCareerMap(); return app.careerMap.rows; },
    /** Démarre (ou rejoue) un niveau ; renvoie le niveau installé. */
    startLevel(id) { return startLevelById(id || career.levelId); },
    /** Démarre une partie de bac à sable. */
    startSandbox: (s) => { startSandbox(s ?? seed); return game; },
    /** Termine le niveau courant tout de suite : étoiles évaluées, écran de fin ouvert. */
    finishLevel() {
      const stars = endLevel();
      return stars ? { count: stars.count, details: stars.details.map((d) => ({ ...d })) } : null;
    },
    /** Allume un calque ('none' le coupe) ; renvoie le calque actif. */
    setLayer: (kind) => app.layers.set(kind),
    get layer() { return app.layers.kind; },
    /** Légende du calque actif : { kind, label, unit, min, max, stops } ou null. */
    layerInfo: () => app.layers.info(),
    /**
     * Écologie du mois, en tableaux ordinaires (sérialisable par Playwright) :
     * { cols, rows, scores, alerts, air, water, fauna, soil, patches, species }.
     */
    eco() {
      const eco = game.eco;
      if (!eco) return null;
      const arr = (v) => (v && typeof v.length === 'number' ? Array.from(v, (n) => Math.round(n * 1000) / 1000) : null);
      const species = {};
      for (const [id, sp] of Object.entries(eco.species || {})) {
        species[id] = { present: !!sp?.present, since: sp?.since ?? null, cells: Array.isArray(sp?.cells) ? [...sp.cells] : [] };
      }
      return {
        cols: game.world.cols,
        rows: game.world.rows,
        scores: { ...(eco.scores || {}) },
        alerts: { ...(eco.alerts || {}) },
        air: arr(eco.air), water: arr(eco.water), fauna: arr(eco.fauna), soil: arr(eco.soil),
        patches: Array.isArray(eco.patches) ? eco.patches.map((pa) => ({ id: pa.id, habitat: pa.habitat, size: pa.size ?? (pa.cells || []).length })) : [],
        species,
      };
    },
    /** Lignes du carnet : [{ id, label, present, since, sinceText, hint }]. */
    species: () => app.speciesBook.rows(),
    /** Route des événements du cœur dans l'interface (bandeaux, messages, bouton « Voir ») : outils de test. */
    emit(events) {
      presentEvents(Array.isArray(events) ? events : [events]);
      return true;
    },
    /** Débloque une entrée du catalogue et/ou crédite la caisse (outils de test seulement). */
    grant({ money = 0, unlock = [], stats = null } = {}) {
      const ids = Array.isArray(unlock) ? unlock : [unlock];
      const unlocked = [...(game.unlocked || [])];
      for (const id of ids) if (id && !unlocked.includes(id)) unlocked.push(id);
      // `stats` force quelques valeurs (population, nature…) : réservé aux outils de test, pour
      // atteindre un objectif sans jouer trois années (tools/play-career.mjs).
      const next = { ...game, unlocked, money: (game.money || 0) + (Number(money) || 0) };
      if (stats && typeof stats === 'object') next.stats = { ...(game.stats || {}), ...stats };
      applyGame(next, { silent: true });
      app.catalog.refresh();
      return { money: game.money, unlocked: [...game.unlocked], stats: { ...(game.stats || {}) } };
    },
    /** { calls, triangles, frameMs, fps, ghost } : valeurs fraîches du rendu + i/s de la dernière fenêtre. */
    stats: () => ({ ...app.stats.snapshot(), ...r.stats(), updateMs: updateMs + (r.stats().layersUpdateMs || 0) }),
    get actors() { return actors; },
    /** Pose directe (sans geste) : { ok, cost, reason } ; passe par le même chemin que la confirmation du fantôme. */
    place(x, y, id) {
      const res = place(game, x, y, id, nowSeconds());
      if (res && res.ok) applyGame(res.game, { kind: 'place', x, y, tileId: id, cost: res.cost });
      return res;
    },
    canPlace: (x, y, id) => canPlace(game, x, y, id),
    demolish(x, y) {
      const res = demolish(game, x, y);
      if (res && res.ok) applyGame(res.game, { kind: 'demolish', x, y, cost: res.cost });
      return res;
    },
    undo: () => app.placement.undo(),
    setSpeed(sp) { applyGame(setSpeed(game, sp), { silent: true }); return game.speed; },
    cycleSpeed() { applyGame(cycleSpeed(game), { silent: true }); return game.speed; },
    /** Avance le temps de jeu de `seconds` secondes réelles, par pas de 0,1 s (tests) ; renvoie la partie. */
    advance(seconds) {
      let left = Math.max(0, Number(seconds) || 0);
      while (left > 1e-9) {
        const dt = Math.min(MAX_FRAME_DT, left);
        stepGame(dt);
        left -= dt;
      }
      r.invalidate?.();
      return game;
    },
    save: () => saveNow(),
    describeTile: (x, y) => describeGameTile(game, x, y),
    /** Nouvelle partie (graine) sans recharger : utile aux mesures. */
    regenerate: (newSeed) => newGame(newSeed).world,
    newGame,
    fitView,
    homeView,
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
