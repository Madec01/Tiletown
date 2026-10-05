// Raccord entre le moteur de carrière et l'état unique sauvegardé par l'application.
// Les règles et les cartes restent dans career.js / data/levels.js.
import { createGame } from "./game.js";
import {
  startLevel as beginLevel,
  finishLevel,
  levelById,
  levelResult,
  evaluateGoals as goalsOf,
  evaluateStars as starsOf,
  createCareer,
  deserializeCareer,
} from "./career.js";
export { createCareer, finishLevel } from "./career.js";

/** Réunit les deux formats de sauvegarde sans perdre étoiles, tuiles ou leçons. */
export function reconcileCareer(stored, embedded) {
  const clean = (value) => {
    try { return deserializeCareer(value); } catch { return createCareer(); }
  };
  const a = clean(stored), b = clean(embedded);
  const union = (key) => [...new Set([...a[key], ...b[key]])];
  const stars = { ...a.stars };
  for (const [id, count] of Object.entries(b.stars)) stars[id] = Math.max(stars[id] || 0, count);
  return { ...a, levelId: embedded ? b.levelId : a.levelId, stars, unlocked: union('unlocked'), tiles: union('tiles'), seen: union('seen') };
}

export function startLevel(career, id, options = {}) {
  const started = beginLevel(career, id);
  const game =
    options.seed === undefined
      ? started.game
      : createGame({
          level: started.level,
          seed: options.seed,
          unlocked: started.game.unlocked,
        });
  return {
    ...game,
    career: {
      ...career,
      levelId: id,
      tiles: [...new Set([...career.tiles, ...game.unlocked])],
    },
    journey: { claimed: [], baseline: { house: 0, shop: 0 } },
  };
}

export function evaluateGoals(game, level = levelById(game.levelId)) {
  return goalsOf(game, level);
}
export function evaluateStars(game, level = levelById(game.levelId)) {
  return starsOf(game, level);
}

export function finishCareer(game) {
  if (!game.career || !game.journey?.finished || game.journey.recorded)
    return game;
  const level = levelById(game.levelId);
  if (!level) return game;
  const result = levelResult(game, level);
  return {
    ...game,
    career: finishLevel(game.career, level.id, result.stars, game),
    journey: { ...game.journey, recorded: true, result },
  };
}
