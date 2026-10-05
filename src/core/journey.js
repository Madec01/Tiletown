// Parcours de découverte. État sérialisable, récompenses explicites et non répétables.
import { TILES } from "../data/tiles.js";
const count = (game, type) =>
  game.world.tiles.filter((t) => t.building?.type === type).length;
export const GOALS = [
  {
    id: "homes",
    title: "Un village prend vie",
    text: "Ajoutez un quartier pour accueillir de nouveaux voisins.",
    target: 1,
    reward: 100,
    tile: "house",
    value: (g) =>
      Math.max(0, count(g, "house") - (g.journey?.baseline?.house ?? 10)),
  },
  {
    id: "market",
    title: "La vie de quartier",
    text: "Ouvrez un nouveau commerce pour rapprocher les emplois des habitants.",
    target: 1,
    reward: 120,
    tile: "shop",
    value: (g) =>
      Math.max(0, count(g, "shop") - (g.journey?.baseline?.shop ?? 2)),
  },
  {
    id: "energy",
    title: "Un vent de changement",
    text: "Installez une éolienne pour alimenter la ville en énergie propre.",
    target: 1,
    reward: 100,
    tile: "wind-turbine",
    value: (g) => count(g, "wind-turbine"),
  },
  {
    id: "school",
    title: "Grandir ensemble",
    text: "Une école près des maisons permet aux quartiers d’évoluer.",
    target: 1,
    reward: 160,
    tile: "school",
    value: (g) => count(g, "school"),
  },
  {
    id: "trees",
    title: "La nature a sa place",
    text: "Plantez deux forêts. Un espace vert près d’un quartier le rend plus heureux.",
    target: 2,
    reward: 120,
    tile: "tree-planting",
    value: (g) => count(g, "tree-planting"),
  },
  {
    id: "water",
    title: "Au fil de l’eau",
    text: "Un château d’eau approvisionne les nouveaux habitants.",
    target: 1,
    reward: 140,
    tile: "water-tower",
    value: (g) => count(g, "water-tower"),
  },
  {
    id: "residents",
    title: "Une petite ville, déjà",
    text: "Accueillez 150 habitants. Emplois, nourriture et services attirent les familles.",
    target: 150,
    reward: 250,
    tile: "house",
    value: (g) => Math.floor(g.stats.population || 0),
  },
  {
    id: "balance",
    title: "Une vallée qui respire",
    text: "Atteignez 65 de bonheur en conservant au moins 70 de nature.",
    target: 65,
    reward: 300,
    value: (g) =>
      g.stats.nature >= 70 ? Math.floor(g.stats.happiness || 0) : 0,
  },
];
export function currentGoal(game) {
  const claimed = game.journey?.claimed || [];
  const goal = GOALS.find((g) => !claimed.includes(g.id));
  if (!goal) return null;
  const value = Math.min(goal.target, Math.max(0, goal.value(game)));
  return {
    ...goal,
    value,
    ready: value >= goal.target,
    index: GOALS.indexOf(goal),
  };
}
export function claimGoal(game) {
  const goal = currentGoal(game);
  if (!goal?.ready) return game;
  return {
    ...game,
    money: game.money + goal.reward,
    undo: null,
    journey: {
      ...game.journey,
      claimed: [...(game.journey?.claimed || []), goal.id],
    },
  };
}
export function startMode(game, mode = "career") {
  return {
    ...game,
    mode: mode === "sandbox" ? "sandbox" : "career",
    journey: {
      claimed: [],
      baseline: { house: count(game, "house"), shop: count(game, "shop") },
    },
    speed: 1,
    ...(mode === "sandbox"
      ? {
          money: 100000,
          unlocked: TILES.filter((t) => t.buyable).map((t) => t.id),
        }
      : {}),
  };
}
export function journeyScore(game) {
  const nature = Math.round(game.stats.nature || 0);
  const prosperity = Math.round(
    Math.min(100, (game.stats.population || 0) / 3) * 0.6 +
      (game.stats.happiness || 0) * 0.4,
  );
  return {
    nature,
    prosperity,
    score: Math.round((nature * prosperity) / 100),
    stars:
      Math.min(nature, prosperity) >= 70
        ? 3
        : Math.min(nature, prosperity) >= 55
          ? 2
          : Math.min(nature, prosperity) >= 40
            ? 1
            : 0,
  };
}
export function finishJourney(game) {
  if (game.mode === "sandbox" || game.journey?.finished || game.month < 36)
    return game;
  return {
    ...game,
    speed: 0,
    journey: { ...game.journey, finished: true, result: journeyScore(game) },
  };
}
