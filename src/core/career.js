// Carrière : la suite des niveaux, leurs objectifs, leurs étoiles (docs/ARCHITECTURE.md §11.1).
//
// Tout est pur : aucune fonction ne modifie ce qu'on lui donne ; chacune rend un nouvel objet. La
// carrière ne contient que des données simples (JSON), pour voyager dans la sauvegarde.
//
//   career = {
//     version: 1,
//     levelId: 'vallee-1',          // le niveau en cours (ou le dernier ouvert)
//     unlocked: ['vallee-1'],       // niveaux ouverts, dans l'ordre de la carrière
//     stars: { 'vallee-1': 2 },     // meilleur nombre d'étoiles par niveau terminé (0 à 3)
//     tiles: ['house', 'shop', …],  // catalogue débloqué, cumulé d'un niveau à l'autre
//     seen: ['pose', 'roads', …],   // leçons de tutoriel déjà vues (src/core/tutorial.js)
//   }
//
// Les mesures des objectifs et des étoiles sont décrites dans src/data/levels.js.

import { createGame } from './game.js';
import { EDGE } from './roads.js';
import { isBuiltTile } from '../data/tiles.js';
import { LEVELS, LEVEL_IDS, FIRST_LEVEL_ID, MAX_STARS, levelById, levelIndex, nextLevelId } from '../data/levels.js';

export { LEVELS, LEVEL_IDS, FIRST_LEVEL_ID, MAX_STARS, levelById, levelIndex, nextLevelId };

export const CAREER_VERSION = 1;

/** Versions de carrière relisibles par `deserializeCareer`. */
export const CAREER_SAVE_VERSIONS = Object.freeze([1]);

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function uniquePush(list, value) {
  return list.includes(value) ? list : list.concat(value);
}

// ---------------------------------------------------------------------------------------------
// Mesures (le `kind` d'un objectif ou d'une étoile).

/** Bâtiments posés qui correspondent à un filtre `{ tile, level, mode }`. */
export function countBuildings(game, filter = {}) {
  let n = 0;
  for (const t of game.world.tiles) {
    const b = t.building;
    if (!b) continue;
    if (filter.tile && b.type !== filter.tile) continue;
    if (Number.isFinite(filter.level) && (b.level || 1) < filter.level) continue;
    if (filter.mode && (b.mode || (b.type === 'field' ? 'intensive' : null)) !== filter.mode) continue;
    n++;
  }
  return n;
}

/** Îlots bâtis : les bâtiments des familles urbaines (les parcs et les champs n'en sont pas). */
export function countBlocks(game) {
  let n = 0;
  for (const t of game.world.tiles) if (isBuiltTile(t)) n++;
  return n;
}

/** Ponts jetés sur la rivière (arêtes équipées d'un pont). */
export function countBridges(game) {
  const { edges } = game.world;
  let n = 0;
  for (let i = 0; i < edges.h.length; i++) if (edges.h[i] === EDGE.BRIDGE) n++;
  for (let i = 0; i < edges.v.length; i++) if (edges.v[i] === EDGE.BRIDGE) n++;
  return n;
}

/** Objectif de population du niveau (sert de référence à la prospérité §7.1). */
export function populationTarget(level) {
  const goal = level && Array.isArray(level.goals) ? level.goals.find((g) => g.kind === 'population') : null;
  return goal && goal.target > 0 ? goal.target : 100;
}

/**
 * Prospérité (docs/GAME_DESIGN.md §7.1) :
 * `0,4·min(100, 100·population/objectif) + 0,3·(100·emplois/population) + 0,3·bonheur`.
 */
export function prosperityOf(game, level) {
  const s = game.stats;
  const target = populationTarget(level);
  const popTerm = Math.min(100, (100 * s.population) / target);
  const jobTerm = s.population > 0 ? Math.min(100, (100 * s.jobs) / s.population) : 0;
  return Math.round(0.4 * popTerm + 0.3 * jobTerm + 0.3 * s.happiness);
}

/** Score de fin de niveau : nature × prospérité / 100 (§7.1). */
export function scoreOf(game, level) {
  return Math.round((game.stats.nature * prosperityOf(game, level)) / 100);
}

/** Aucun mois de départs depuis le début de la partie (`game.flags.exodusMonths`). */
export function withoutExodus(game) {
  return (game.flags?.exodusMonths || 0) === 0;
}

/**
 * Valeur courante d'une mesure. Rend `null` si le `kind` est inconnu (l'objectif est alors ignoré,
 * jamais bloquant).
 */
export function measureOf(game, spec, level = null) {
  const s = game.stats;
  const eco = game.eco;
  switch (spec.kind) {
    case 'population': return s.population;
    case 'jobs': return s.jobs;
    case 'happiness': return s.happiness;
    case 'nature': return s.nature;
    case 'air': return eco ? eco.scores.air : 100;
    case 'water': return eco ? eco.scores.water : 100;
    case 'soil': return eco ? eco.scores.soil : 0;
    case 'money': return game.money;
    case 'species': return spec.species ? (eco && eco.species[spec.species]?.present ? 1 : 0) : s.species || 0;
    case 'buildings': return countBuildings(game, spec);
    case 'blocks': return countBlocks(game);
    case 'bridges': return countBridges(game);
    case 'prosperity': return prosperityOf(game, level);
    case 'score': return scoreOf(game, level);
    default: return null;
  }
}

/** Libellé court de l'avancement d'une mesure : « 72 / 100 », « oui », « pas encore ». */
export function measureText(spec, value, target) {
  if (value === null) return '—';
  if (spec.kind === 'species' && spec.species) return value >= 1 ? 'oui' : 'pas encore';
  return `${Math.round(value)} / ${target}`;
}

/** Évalue une mesure : `{ value, target, done, text }`. */
export function evaluateMeasure(game, spec, level = null) {
  const target = Number.isFinite(spec.target) ? spec.target : 1;
  const value = measureOf(game, spec, level);
  let done = value !== null && value >= target;
  if (done && spec.noExodus && !withoutExodus(game)) done = false;
  return { value, target, done, text: measureText(spec, value, target) };
}

// ---------------------------------------------------------------------------------------------
// Objectifs et étoiles.

/**
 * Avancement des objectifs d'un niveau.
 * @returns {Array<{ id, label, kind, target, value, done, text }>}
 */
export function evaluateGoals(game, level) {
  if (!level || !Array.isArray(level.goals)) return [];
  return level.goals.map((goal) => {
    const m = evaluateMeasure(game, goal, level);
    return { id: goal.id, label: goal.label, kind: goal.kind, target: m.target, value: m.value, done: m.done, text: m.text };
  });
}

/** Vrai si tous les objectifs du niveau sont atteints. */
export function goalsReached(game, level) {
  const goals = evaluateGoals(game, level);
  return goals.length > 0 && goals.every((g) => g.done);
}

/**
 * Étoiles obtenues : une par condition remplie (l'ordre de `level.stars` est celui de l'affichage).
 * @returns {{ count: number, details: Array<{ id, label, done, value, target, text }> }}
 */
export function evaluateStars(game, level) {
  if (!level || !Array.isArray(level.stars)) return { count: 0, details: [] };
  const details = level.stars.map((star) => {
    if (star.test === 'goals') {
      const done = goalsReached(game, level);
      const goals = evaluateGoals(game, level);
      const reached = goals.filter((g) => g.done).length;
      return { id: star.id, label: star.label, done, value: reached, target: goals.length, text: `${reached} / ${goals.length}` };
    }
    const m = evaluateMeasure(game, star, level);
    return { id: star.id, label: star.label, done: m.done, value: m.value, target: m.target, text: m.text };
  });
  return { count: details.filter((d) => d.done).length, details };
}

/** Fin d'un niveau : la dernière année est jouée (3 ans par défaut = 36 mois). */
export function isLevelOver(game, level) {
  const years = level && Number.isFinite(level.years) ? level.years : 3;
  return game.month >= years * 12;
}

/** Avancement dans le temps du niveau : `{ month, months, year, years, remaining, over }`. */
export function levelProgress(game, level) {
  const years = level && Number.isFinite(level.years) ? level.years : 3;
  const months = years * 12;
  return {
    month: game.month,
    months,
    year: Math.min(years, Math.floor(game.month / 12) + 1),
    years,
    remaining: Math.max(0, months - game.month),
    over: game.month >= months,
  };
}

/** Bilan de fin de niveau, prêt pour l'écran de fin (src/ui/level-end.js). */
export function levelResult(game, level) {
  const goals = evaluateGoals(game, level);
  const stars = evaluateStars(game, level);
  return {
    levelId: level.id,
    title: level.title,
    goals,
    stars: stars.count,
    details: stars.details,
    score: scoreOf(game, level),
    nature: game.stats.nature,
    prosperity: prosperityOf(game, level),
    population: game.stats.population,
    exodus: game.flags?.exodusMonths || 0,
  };
}

// ---------------------------------------------------------------------------------------------
// La carrière elle-même.

/** Une carrière neuve : seul le premier niveau est ouvert, le catalogue est vide. */
export function createCareer() {
  return {
    version: CAREER_VERSION,
    levelId: FIRST_LEVEL_ID,
    unlocked: [FIRST_LEVEL_ID],
    stars: {},
    tiles: [],
    seen: [],
  };
}

/**
 * Commence (ou recommence) un niveau : la vallée du niveau, vierge, avec le catalogue cumulé de la
 * carrière augmenté de ce que ce niveau ouvre.
 * @param {object|null} career carrière (null : hors carrière, pour les essais et le bac à sable)
 * @returns {{ game, level }}
 */
export function startLevel(career, levelId) {
  const level = levelById(levelId);
  if (!level) throw new Error(`Niveau inconnu : ${levelId}`);
  if (career && !career.unlocked.includes(levelId)) throw new Error(`Niveau encore verrouillé : ${levelId}`);
  const tiles = career ? career.tiles : [];
  const unlocked = [];
  for (const id of [...tiles, ...level.unlock]) if (!unlocked.includes(id)) unlocked.push(id);
  return { game: createGame({ level, unlocked }), level };
}

/**
 * Termine un niveau : garde le meilleur nombre d'étoiles, ouvre le niveau suivant, cumule le catalogue.
 * `game` est facultatif : s'il est donné, les tuiles débloquées pendant la partie (paliers de population,
 * §8.1) sont gardées elles aussi.
 * @param {object} career
 * @param {string} levelId
 * @param {number} stars 0 à 3
 * @param {object|null} game la partie qui vient de s'achever (facultatif)
 */
export function finishLevel(career, levelId, stars, game = null) {
  const level = levelById(levelId);
  if (!level) throw new Error(`Niveau inconnu : ${levelId}`);
  const won = clamp(Math.round(Number(stars) || 0), 0, level.stars.length);
  const best = Math.max(career.stars[levelId] || 0, won);
  const next = nextLevelId(levelId);
  const tiles = career.tiles.slice();
  for (const id of [...level.unlock, ...(game && Array.isArray(game.unlocked) ? game.unlocked : [])]) {
    if (!tiles.includes(id)) tiles.push(id);
  }
  return {
    ...career,
    version: CAREER_VERSION,
    levelId: next || levelId,
    unlocked: next ? uniquePush(career.unlocked, next) : career.unlocked.slice(),
    stars: { ...career.stars, [levelId]: best },
    tiles,
    seen: career.seen.slice(),
  };
}

/** Mémorise une leçon de tutoriel vue (le tutoriel ne se répète pas d'un niveau à l'autre). */
export function rememberLesson(career, lessonId) {
  if (!lessonId || career.seen.includes(lessonId)) return career;
  return { ...career, seen: career.seen.concat(lessonId) };
}

/** Avancement de la carrière : `{ done, total, stars, maxStars }`. */
export function careerProgress(career) {
  let done = 0;
  let stars = 0;
  for (const id of LEVEL_IDS) {
    if (!(id in career.stars)) continue;
    done++;
    stars += career.stars[id] || 0;
  }
  return { done, total: LEVELS.length, stars, maxStars: MAX_STARS };
}

/**
 * La carte de carrière, prête à afficher (src/ui/career-map.js) : un niveau par ligne, dans l'ordre.
 * `state` ∈ `locked | open | done`.
 */
export function careerLevels(career) {
  return LEVELS.map((level) => {
    const finished = level.id in career.stars;
    const open = career.unlocked.includes(level.id);
    return {
      id: level.id,
      title: level.title,
      subtitle: level.subtitle,
      brief: level.brief,
      years: level.years,
      stars: career.stars[level.id] || 0,
      maxStars: level.stars.length,
      state: finished ? 'done' : open ? 'open' : 'locked',
      current: career.levelId === level.id,
      goals: level.goals.map((g) => g.label),
    };
  });
}

// ---------------------------------------------------------------------------------------------
// Sauvegarde (version 1).

/** Objet JSON de la carrière. */
export function serializeCareer(career) {
  return {
    version: CAREER_VERSION,
    levelId: career.levelId,
    unlocked: Array.from(career.unlocked),
    stars: { ...career.stars },
    tiles: Array.from(career.tiles),
    seen: Array.from(career.seen),
  };
}

/**
 * Relit une carrière. Tout ce qui est inconnu (niveau disparu, tuile retirée du catalogue) est écarté
 * sans rien casser : une carrière mal formée rend une carrière neuve plutôt qu'une erreur.
 */
export function deserializeCareer(obj) {
  if (!obj || typeof obj !== 'object') return createCareer();
  if (!CAREER_SAVE_VERSIONS.includes(obj.version)) {
    throw new Error(`Carrière d’une version inconnue (${obj.version}) : seule la version ${CAREER_SAVE_VERSIONS.join(' et ')} est lisible.`);
  }
  const unlocked = LEVEL_IDS.filter((id) => Array.isArray(obj.unlocked) && obj.unlocked.includes(id));
  if (unlocked.length === 0) unlocked.push(FIRST_LEVEL_ID);
  const stars = {};
  for (const level of LEVELS) {
    const v = obj.stars && obj.stars[level.id];
    if (Number.isFinite(v)) stars[level.id] = clamp(Math.round(v), 0, level.stars.length);
  }
  const tiles = Array.isArray(obj.tiles) ? Array.from(new Set(obj.tiles.filter((t) => typeof t === 'string'))) : [];
  const seen = Array.isArray(obj.seen) ? Array.from(new Set(obj.seen.filter((s) => typeof s === 'string'))) : [];
  const levelId = typeof obj.levelId === 'string' && unlocked.includes(obj.levelId) ? obj.levelId : unlocked[unlocked.length - 1];
  return { version: CAREER_VERSION, levelId, unlocked, stars, tiles, seen };
}
