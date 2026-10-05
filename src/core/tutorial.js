// Moteur de tutoriel (docs/ARCHITECTURE.md §11.2) : il choisit la leçon à montrer, dit si elle est
// faite, et retient celles qui l'ont été. Il ne bloque jamais le jeu et ne garde aucun état caché :
// tout est pur, la liste `seen` appartient à la carrière (src/core/career.js).
//
//   const lesson = nextLesson(scenario, game, career.seen, ctx);   // la leçon courante, ou null
//   lessonDone(lesson, game, ctx)                                  // sa condition est-elle remplie ?
//   lessonHighlight(lesson, game)                                  // ce que l'interface doit désigner
//   career.seen = markSeen(career.seen, lesson.id);                // quand le joueur a compris
//
// `ctx` vient de l'interface : `{ layer, level, goals }` (voir src/data/tutorials.js). `lessonDone` le
// complète tout seul quand il peut : si `goals` manque et que le niveau est connu (par `ctx.level` ou
// par `game.levelId`), les objectifs sont évalués ici.

import { TUTORIALS, TUTORIAL_IDS } from '../data/tutorials.js';
import { levelById } from '../data/levels.js';
import { evaluateGoals } from './career.js';

export { TUTORIALS, TUTORIAL_IDS };

/**
 * Formes de surbrillance qu'une leçon peut demander (contrat avec src/ui/tutorial-ui.js) :
 *   tab    un onglet de la barre du bas : habitat | activity | services | infrastructure | nature | demolish | layers
 *   gauge  une jauge du bandeau : population | happiness | nature | money
 *   speed  le bouton pause / vitesse
 *   tile   une case de la carte, par `r.setHighlight([{ x, y }])`
 * Une forme inconnue se montre sans surbrillance : le tutoriel n'empêche jamais de jouer.
 */
export const HIGHLIGHT_KINDS = Object.freeze(['tab', 'gauge', 'speed', 'tile']);

/** Le scénario, qu'on l'ait reçu entier ou par son identifiant (null si inconnu). */
export function getScenario(scenario) {
  if (!scenario) return null;
  if (typeof scenario === 'string') return TUTORIALS[scenario] || null;
  return Array.isArray(scenario.lessons) ? scenario : null;
}

/** Les leçons d'un scénario (tableau vide si le scénario est inconnu). */
export function lessonsOf(scenario) {
  const s = getScenario(scenario);
  return s ? s.lessons : [];
}

/** Une leçon par son identifiant. */
export function lessonById(scenario, id) {
  return lessonsOf(scenario).find((l) => l.id === id) || null;
}

/** Vrai si la leçon a déjà été vue. */
export function hasSeen(seen, id) {
  return Array.isArray(seen) && seen.includes(id);
}

/** Ajoute une leçon à la liste des leçons vues (nouveau tableau ; sans doublon). */
export function markSeen(seen, id) {
  const list = Array.isArray(seen) ? seen : [];
  if (!id || list.includes(id)) return list.slice();
  return list.concat(id);
}

/** Complète le contexte de l'interface avec ce que le cœur sait déjà déduire. */
function fullContext(game, ctx = {}) {
  const level = ctx.level || levelById(game.levelId) || null;
  const goals = Array.isArray(ctx.goals) ? ctx.goals : level ? evaluateGoals(game, level) : null;
  return { layer: null, ...ctx, level, goals };
}

/** La condition de la leçon est-elle remplie ? (une leçon sans condition est considérée faite). */
export function lessonDone(lesson, game, ctx = {}) {
  if (!lesson || typeof lesson.done !== 'function') return true;
  try {
    return Boolean(lesson.done(game, fullContext(game, ctx)));
  } catch {
    return false; // une leçon ne doit jamais casser la partie
  }
}

/**
 * La leçon à montrer : la première du scénario qui n'a pas encore été vue (et que la partie n'écarte
 * pas, `lesson.skip(game)`). `null` quand le tutoriel est terminé.
 */
export function nextLesson(scenario, game, seen = [], ctx = {}) {
  for (const lesson of lessonsOf(scenario)) {
    if (hasSeen(seen, lesson.id)) continue;
    if (typeof lesson.skip === 'function' && lesson.skip(game, fullContext(game, ctx))) continue;
    return lesson;
  }
  return null;
}

/** Ce que l'interface doit désigner pour cette leçon : `focus(game)` d'abord, sinon `highlight`, sinon null. */
export function lessonHighlight(lesson, game) {
  if (!lesson) return null;
  if (typeof lesson.focus === 'function') {
    try {
      const found = lesson.focus(game);
      if (found) return found;
    } catch {
      /* une surbrillance ratée n'empêche pas la leçon */
    }
  }
  return lesson.highlight || null;
}

/** Avancement du tutoriel : `{ done, total }` (leçons vues sur leçons du scénario). */
export function tutorialProgress(scenario, seen) {
  const lessons = lessonsOf(scenario);
  return { done: lessons.filter((l) => hasSeen(seen, l.id)).length, total: lessons.length };
}

/**
 * Tout ce dont la bulle de tutoriel a besoin, en un appel (src/ui/tutorial-ui.js) :
 * `{ lesson, index, total, done, highlight, title, text, reward }`, ou null si le tutoriel est fini.
 */
export function tutorialState(scenario, game, seen = [], ctx = {}) {
  const lesson = nextLesson(scenario, game, seen, ctx);
  if (!lesson) return null;
  const lessons = lessonsOf(scenario);
  return {
    lesson,
    index: lessons.indexOf(lesson),
    total: lessons.length,
    done: lessonDone(lesson, game, ctx),
    highlight: lessonHighlight(lesson, game),
    title: lesson.title,
    text: lesson.text,
    tile: lesson.tile || null,
    reward: lesson.reward || null,
  };
}
