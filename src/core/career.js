// Progression entre vallées : logique pure, sauvegardée avec la partie.
import { LEVELS, LEVEL_BY_ID } from "../data/levels.js";
import { START_UNLOCKED } from "../data/balance.js";
import { createGame } from "./game.js";
export function createCareer() {
  return {
    version: 1,
    levelId: LEVELS[0].id,
    unlocked: [LEVELS[0].id],
    stars: {},
    tiles: [...START_UNLOCKED],
  };
}
export function startLevel(career, id, options = {}) {
  const level = LEVEL_BY_ID[id];
  if (!level || !career.unlocked.includes(id))
    throw new Error("Cette vallée est encore verrouillée.");
  const tiles = [...new Set([...career.tiles, ...level.unlock])];
  const game = createGame({
    seed: options.seed ?? level.seed,
    cols: level.cols,
    rows: level.rows,
    money: level.money,
    starterTown: false,
    unlocked: tiles,
  });
  return {
    ...game,
    career: { ...career, levelId: id, tiles },
    journey: { claimed: [], baseline: { house: 0, shop: 0 } },
  };
}
export function evaluateGoals(game, level = LEVEL_BY_ID[game.career?.levelId]) {
  if (!level) return [];
  const goals = [
    {
      id: "population",
      label: `${level.population} habitants`,
      value: Math.floor(game.stats.population || 0),
      target: level.population,
    },
    {
      id: "nature",
      label: `Nature ≥ ${level.nature}`,
      value: Math.floor(game.stats.nature || 0),
      target: level.nature,
    },
  ];
  if (level.water)
    goals.push({
      id: "water",
      label: `Eau saine ≥ ${level.water}`,
      value: Math.round(game.eco?.scores?.water ?? 0),
      target: level.water,
    });
  if (level.fields)
    goals.push({
      id: "fields",
      label: `${level.fields} champs cultivés`,
      value: game.world.tiles.filter((t) => t.building?.type === "field")
        .length,
      target: level.fields,
    });
  return goals.map((g) => ({ ...g, done: g.value >= g.target }));
}
export function evaluateStars(game, level = LEVEL_BY_ID[game.career?.levelId]) {
  const goals = evaluateGoals(game, level),
    done = goals.length > 0 && goals.every((g) => g.done);
  const details = [
    { label: "Objectifs de la vallée atteints", done },
    {
      label: "Nature préservée à 80 ou plus",
      done: done && (game.stats.nature || 0) >= 80,
    },
    {
      label: `${level?.bonusPopulation || 200} habitants heureux, sans exode`,
      done:
        done &&
        (game.stats.population || 0) >= (level?.bonusPopulation || 200) &&
        (game.stats.happiness || 0) >= 65 &&
        !game.journey?.hadExodus,
    },
  ];
  return { count: details.filter((d) => d.done).length, details, goals };
}
export function finishLevel(career, id, stars) {
  const index = LEVELS.findIndex((l) => l.id === id);
  if (index < 0) return career;
  const unlocked = [...career.unlocked];
  if (
    stars > 0 &&
    LEVELS[index + 1] &&
    !unlocked.includes(LEVELS[index + 1].id)
  )
    unlocked.push(LEVELS[index + 1].id);
  return {
    ...career,
    unlocked,
    stars: { ...career.stars, [id]: Math.max(career.stars[id] || 0, stars) },
  };
}
export function finishCareer(game) {
  if (!game.career || !game.journey?.finished || game.journey.recorded)
    return game;
  const result = evaluateStars(game);
  return {
    ...game,
    career: {
      ...finishLevel(game.career, game.career.levelId, result.count),
      tiles: [...new Set([...game.career.tiles, ...game.unlocked])],
    },
    journey: {
      ...game.journey,
      recorded: true,
      result: {
        ...game.journey.result,
        stars: result.count,
        goals: result.goals,
        details: result.details,
      },
    },
  };
}
