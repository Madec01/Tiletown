// Scénarios de tutoriel (docs/ARCHITECTURE.md §11.2).
//
// Un scénario est une liste ordonnée de **leçons**. Chaque leçon attend une condition et propose une
// action ; le tutoriel ne bloque jamais le jeu, il accompagne. Les textes vouvoient le joueur, comme le
// reste de l'interface, et tiennent en une ou deux phrases, jamais culpabilisantes.
//
//   { id, title, text,
//     highlight: { kind: 'tab', id } | { kind: 'gauge', id } | { kind: 'tile', x, y } | { kind: 'speed' },
//     focus: (game) => ({ kind: 'tile', x, y }) | null,   // surbrillance calculée (facultatif)
//     tile: 'house',                                       // carte du catalogue concernée (facultatif)
//     done: (game, ctx) => boolean,
//     reward: { money: 0, text } }
//
// `ctx` est fourni par l'interface (src/core/tutorial.js le complète) :
//   { layer: 'air' | 'water' | 'fauna' | null,   le calque allumé
//     level,                                     le niveau en cours (src/data/levels.js)
//     goals }                                    l'avancement des objectifs (`evaluateGoals`)
//
// Ce module est une feuille : aucune importation, que des lectures de l'état de partie.

/** Nombre de bâtiments d'un type (ou de l'un des types donnés). */
function countOf(game, ...types) {
  let n = 0;
  for (const t of game.world.tiles) if (t.building && types.includes(t.building.type)) n++;
  return n;
}

/** Vrai si une espèce est arrivée depuis le début de la partie (les espèces natives ont `since` à 0). */
function newcomer(game) {
  const species = game.eco && game.eco.species;
  if (!species) return false;
  return Object.values(species).some((s) => s.present && Number.isFinite(s.since) && s.since >= 1);
}

/** Première case portant l'un de ces bâtiments : la leçon montre du doigt ce que le joueur vient de poser. */
function firstTile(game, ...types) {
  const { world } = game;
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const t = world.tiles[y * world.cols + x];
      if (t.building && types.includes(t.building.type)) return { kind: 'tile', x, y };
    }
  }
  return null;
}

/** Le scénario d'ouverture : dix leçons, de la première maison à l'objectif du niveau. */
export const BASE_LESSONS = Object.freeze([
  Object.freeze({
    id: 'pose',
    title: 'Poser un quartier',
    text: 'Touchez Habitat, choisissez Quartier, puis une case verte près de la mairie.',
    highlight: Object.freeze({ kind: 'tab', id: 'habitat' }),
    tile: 'house',
    done: (game) => countOf(game, 'house') >= 1,
    reward: Object.freeze({ money: 0, text: 'Vos premières maisons sont là. Les habitants, eux, attendent que le temps s’écoule.' }),
  }),
  Object.freeze({
    id: 'roads',
    title: 'Les rues se tracent seules',
    text: 'Les bâtiments d’un même îlot partagent leurs rues. Le raccordement se fait automatiquement, en gardant des jardins au centre.',
    focus: (game) => firstTile(game, 'house'),
    done: (game) => countOf(game, 'house') >= 1 && game.stats.streets >= 1,
    reward: Object.freeze({ money: 0, text: 'Seuls les nouveaux tronçons sont facturés ; un accès existant est réutilisé.' }),
  }),
  Object.freeze({
    id: 'time',
    title: 'Lancer le temps',
    text: 'Touchez ▶ en haut à droite. Un mois passe en trente secondes, et vous pouvez accélérer ou faire une pause quand vous voulez.',
    highlight: Object.freeze({ kind: 'speed' }),
    done: (game) => game.month >= 1,
    reward: Object.freeze({ money: 0, text: 'Le temps file : les recettes rentrent et les habitants s’installent.' }),
  }),
  Object.freeze({
    id: 'gauges',
    title: 'Lire les jauges',
    text: 'En haut : vos habitants, leur bonheur, la nature et l’argent. Touchez une jauge pour en savoir plus.',
    highlight: Object.freeze({ kind: 'gauge', id: 'nature' }),
    done: (game) => game.stats.population >= 1,
    reward: Object.freeze({ money: 0, text: 'La jauge Nature pèse autant que la prospérité dans votre note de fin.' }),
  }),
  Object.freeze({
    id: 'jobs',
    title: 'Du travail pour tous',
    text: 'Sans emploi, vos habitants s’en vont. Touchez Activité et posez un commerce près des maisons.',
    highlight: Object.freeze({ kind: 'tab', id: 'activity' }),
    tile: 'shop',
    done: (game) => countOf(game, 'shop', 'office') >= 1,
    reward: Object.freeze({ money: 0, text: 'Un commerce voisin, c’est des emplois, des recettes et un peu de bonheur en plus.' }),
  }),
  Object.freeze({
    id: 'school',
    title: 'Une école pour grandir',
    text: 'Touchez Services et posez une école à deux cases des maisons.',
    highlight: Object.freeze({ kind: 'tab', id: 'services' }),
    tile: 'school',
    done: (game) => countOf(game, 'school') >= 1,
    reward: Object.freeze({ money: 0, text: 'Une école et un commerce tout près : à la fin de la saison, le quartier devient des immeubles.' }),
  }),
  Object.freeze({
    id: 'layer-air',
    title: 'Le calque Air',
    text: 'Touchez Calques, puis Air : la carte se teinte là où l’air s’alourdit.',
    highlight: Object.freeze({ kind: 'tab', id: 'layers' }),
    done: (game, ctx) => ctx.layer === 'air',
    reward: Object.freeze({ money: 0, text: 'Gardez ce calque à l’œil le jour où vous poserez une usine.' }),
  }),
  Object.freeze({
    id: 'park',
    title: 'Un parc pour respirer',
    text: 'Touchez Nature et posez un parc contre un quartier : il assainit l’air et réjouit les voisins.',
    highlight: Object.freeze({ kind: 'tab', id: 'nature' }),
    tile: 'park',
    done: (game) => countOf(game, 'park', 'tree-planting') >= 1,
    reward: Object.freeze({ money: 0, text: 'De l’air pur, du bonheur, et de la place pour la faune : un parc ne coûte presque rien.' }),
  }),
  Object.freeze({
    id: 'species',
    title: 'Une espèce s’installe',
    text: 'Dès qu’une vallée leur plaît, les espèces reviennent. Surveillez la jauge Nature et le carnet.',
    highlight: Object.freeze({ kind: 'gauge', id: 'nature' }),
    done: (game) => newcomer(game),
    reward: Object.freeze({ money: 0, text: 'Chaque espèce présente compte dans votre note de nature — et fait venir les visiteurs.' }),
  }),
  Object.freeze({
    id: 'goal',
    title: 'L’objectif du niveau',
    text: 'Il reste à atteindre les objectifs affichés sous les jauges avant la fin de la troisième année. Prenez votre temps.',
    highlight: Object.freeze({ kind: 'gauge', id: 'population' }),
    done: (game, ctx) => Array.isArray(ctx.goals) && ctx.goals.length > 0 && ctx.goals.every((g) => g.done),
    reward: Object.freeze({ money: 0, text: 'La vallée est à vous. Bonne route !' }),
  }),
]);

/** Les scénarios, par identifiant (`level.tutorial` en donne un). */
export const TUTORIALS = Object.freeze({
  base: Object.freeze({
    id: 'base',
    label: 'Premiers pas',
    levelId: 'vallee-1',
    lessons: BASE_LESSONS,
  }),
});

/** Identifiants des scénarios. */
export const TUTORIAL_IDS = Object.freeze(Object.keys(TUTORIALS));
