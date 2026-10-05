// Niveaux de la carrière (docs/ARCHITECTURE.md §11.1 ; docs/GAME_DESIGN.md §8).
//
// Une liste **ordonnée** : on commence par `vallee-1` et chaque niveau terminé ouvre le suivant
// (src/core/career.js). Un niveau est une vallée (graine choisie et vérifiée par tests/levels.test.js),
// une durée (3 ans par défaut), un argent de départ, ce qu'il ajoute au catalogue, des objectifs et
// trois conditions d'étoiles.
//
//   { id, title, subtitle, brief, map, seed, cols, rows, years, money, starterTown,
//     unlock: [ 'house', … ],        // ce que CE niveau ajoute au catalogue (cumulé par la carrière)
//     tutorial: 'base' | null,       // scénario de src/data/tutorials.js
//     goals: [ { id, label, kind, target, … } ],
//     stars: [ { id, label, test: 'goals' } | { id, label, kind, target, … } ] }
//
// Les **mesures** (`kind`) sont évaluées par `evaluateGoals` / `evaluateStars` (src/core/career.js) :
//
//   population  habitants                       | jobs      emplois
//   happiness   bonheur 0..100                  | nature    jauge Nature 0..100
//   air         air 0..100 (100 = pur)          | water     eau 0..100 (100 = claire)
//   soil        fertilité 0..100                | money     trésor en $
//   species     espèces présentes (ou une seule espèce avec `id: 'bee'`)
//   buildings   bâtiments posés (filtres `tile`, `level`, `mode`)
//   blocks      îlots bâtis (familles urbaines)  | bridges  ponts jetés sur la rivière
//   prosperity  prospérité §7.1                  | score    nature × prospérité / 100
//
// Deux options s'ajoutent à une mesure : `noExodus: true` (aucun mois de départs depuis le début de la
// partie) et, pour une étoile, `test: 'goals'` (tous les objectifs du niveau sont atteints).
//
// Les graines sont choisies une à une et **vérifiées** par `tests/levels.test.js` : vallée valide, une
// seule mairie, de la place autour d'elle, une rivière franchissable, des forêts. Les changer sans
// relancer les tests revient à changer le niveau.

/** Durée d'un niveau par défaut, en années de jeu (3 ans = 36 mois = 18 min à vitesse 1). */
export const DEFAULT_YEARS = 3;

/** Catalogue de départ du tout premier niveau (ce qu'on sait faire en arrivant dans la vallée). */
const VALLEE_1_UNLOCK = Object.freeze(['house', 'shop', 'field', 'park', 'school', 'wind-turbine', 'water-tower', 'tree-planting']);

export const LEVELS = Object.freeze([
  Object.freeze({
    id: 'vallee-1',
    title: 'La première vallée',
    subtitle: 'Apprendre à bâtir',
    brief: 'Une vallée large et douce, une mairie, et tout à apprendre. Joseph vous guide pas à pas.',
    map: 'valley', seed: 26, cols: 12, rows: 16, years: DEFAULT_YEARS,
    money: 700, starterTown: false,
    unlock: VALLEE_1_UNLOCK,
    tutorial: 'base',
    goals: Object.freeze([
      Object.freeze({ id: 'pop', label: '100 habitants', kind: 'population', target: 100 }),
      Object.freeze({ id: 'nature', label: 'Nature ≥ 70', kind: 'nature', target: 70 }),
    ]),
    stars: Object.freeze([
      Object.freeze({ id: 'goals', label: 'Atteindre les objectifs', test: 'goals' }),
      Object.freeze({ id: 'nature', label: 'Nature ≥ 80 à la fin', kind: 'nature', target: 80 }),
      Object.freeze({ id: 'pop', label: '160 habitants, sans exode', kind: 'population', target: 160, noExodus: true }),
    ]),
  }),

  Object.freeze({
    id: 'riviere',
    title: 'Au fil de la rivière',
    subtitle: 'Un pont à jeter, un aval à protéger',
    brief: 'La rivière coupe la vallée en deux. Il faudra la franchir, et garder son eau claire jusqu’en bas.',
    map: 'valley', seed: 110, cols: 12, rows: 16, years: DEFAULT_YEARS,
    money: 700, starterTown: false,
    unlock: Object.freeze(['office', 'market', 'compost', 'solar', 'wetland-restored']),
    tutorial: null,
    goals: Object.freeze([
      Object.freeze({ id: 'pop', label: '90 habitants', kind: 'population', target: 90 }),
      Object.freeze({ id: 'bridge', label: 'Un pont sur la rivière', kind: 'bridges', target: 1 }),
      Object.freeze({ id: 'water', label: 'Eau ≥ 75', kind: 'water', target: 75 }),
    ]),
    stars: Object.freeze([
      Object.freeze({ id: 'goals', label: 'Atteindre les objectifs', test: 'goals' }),
      Object.freeze({ id: 'water', label: 'Eau ≥ 90 à la fin', kind: 'water', target: 90 }),
      Object.freeze({ id: 'pop', label: '130 habitants, sans exode', kind: 'population', target: 130, noExodus: true }),
    ]),
  }),

  Object.freeze({
    id: 'bocage',
    title: 'Le bocage',
    subtitle: 'Des haies, des champs, des abeilles',
    brief: 'Prairies et bosquets à perte de vue. Cultivez sans épuiser la terre : les abeilles le verront.',
    map: 'valley', seed: 167, cols: 12, rows: 16, years: DEFAULT_YEARS,
    money: 700, starterTown: false,
    unlock: Object.freeze(['hedge', 'orchard', 'clinic', 'wildlife-crossing']),
    tutorial: null,
    goals: Object.freeze([
      Object.freeze({ id: 'pop', label: '120 habitants', kind: 'population', target: 120 }),
      Object.freeze({ id: 'organic', label: '4 champs conduits en bio', kind: 'buildings', tile: 'field', mode: 'organic', target: 4 }),
      Object.freeze({ id: 'soil', label: 'Fertilité ≥ 70', kind: 'soil', target: 70 }),
    ]),
    stars: Object.freeze([
      Object.freeze({ id: 'goals', label: 'Atteindre les objectifs', test: 'goals' }),
      Object.freeze({ id: 'bee', label: 'Les abeilles s’installent', kind: 'species', species: 'bee' }),
      Object.freeze({ id: 'pop', label: '170 habitants, sans exode', kind: 'population', target: 170, noExodus: true }),
    ]),
  }),

  Object.freeze({
    id: 'coteau',
    title: 'Le coteau',
    subtitle: 'Peu de terrain plat, chaque rue se mérite',
    brief: 'Les collines mangent la moitié de la vallée. Il faudra serrer la ville et la rendre agréable.',
    map: 'valley', seed: 182, cols: 12, rows: 16, years: DEFAULT_YEARS,
    money: 700, starterTown: false,
    unlock: Object.freeze(['tram-stop', 'factory', 'wastewater']),
    tutorial: null,
    goals: Object.freeze([
      Object.freeze({ id: 'pop', label: '120 habitants', kind: 'population', target: 120 }),
      Object.freeze({ id: 'happiness', label: 'Bonheur ≥ 65', kind: 'happiness', target: 65 }),
      Object.freeze({ id: 'nature', label: 'Nature ≥ 70', kind: 'nature', target: 70 }),
    ]),
    stars: Object.freeze([
      Object.freeze({ id: 'goals', label: 'Atteindre les objectifs', test: 'goals' }),
      Object.freeze({ id: 'nature', label: 'Nature ≥ 80 à la fin', kind: 'nature', target: 80 }),
      Object.freeze({ id: 'pop', label: '170 habitants, sans exode', kind: 'population', target: 170, noExodus: true }),
    ]),
  }),

  Object.freeze({
    id: 'grande-vallee',
    title: 'La grande vallée',
    subtitle: 'Tout le catalogue, une vallée entière',
    brief: 'Seize cases sur vingt-quatre, tout le catalogue, trois ans : la vallée vivante au complet.',
    map: 'valley', seed: 48, cols: 16, rows: 24, years: DEFAULT_YEARS,
    money: 800, starterTown: false,
    unlock: Object.freeze(['power-plant']),
    tutorial: null,
    goals: Object.freeze([
      Object.freeze({ id: 'pop', label: '150 habitants', kind: 'population', target: 150 }),
      Object.freeze({ id: 'nature', label: 'Nature ≥ 70', kind: 'nature', target: 70 }),
      Object.freeze({ id: 'blocks', label: '18 îlots bâtis', kind: 'blocks', target: 18 }),
    ]),
    stars: Object.freeze([
      Object.freeze({ id: 'goals', label: 'Atteindre les objectifs', test: 'goals' }),
      Object.freeze({ id: 'species', label: '6 espèces dans la vallée', kind: 'species', target: 6 }),
      Object.freeze({ id: 'pop', label: '200 habitants, sans exode', kind: 'population', target: 200, noExodus: true }),
    ]),
  }),
]);

/** Les identifiants, dans l'ordre de la carrière. */
export const LEVEL_IDS = Object.freeze(LEVELS.map((l) => l.id));

/** Accès par identifiant. */
export const LEVEL_BY_ID = Object.freeze(Object.fromEntries(LEVELS.map((l) => [l.id, l])));

/** Le premier niveau de la carrière. */
export const FIRST_LEVEL_ID = LEVEL_IDS[0];

/** Étoiles possibles sur l'ensemble de la carrière. */
export const MAX_STARS = LEVELS.reduce((n, l) => n + l.stars.length, 0);

/** Définition d'un niveau (null si l'identifiant est inconnu). */
export function levelById(id) {
  return LEVEL_BY_ID[id] || null;
}

/** Rang d'un niveau dans la carrière (−1 s'il est inconnu). */
export function levelIndex(id) {
  return LEVEL_IDS.indexOf(id);
}

/** Identifiant du niveau suivant, ou null si c'est le dernier (ou un inconnu). */
export function nextLevelId(id) {
  const i = levelIndex(id);
  return i >= 0 && i + 1 < LEVELS.length ? LEVEL_IDS[i + 1] : null;
}

/** Le catalogue qu'un joueur possède en arrivant au niveau `id` : tout ce que les niveaux précédents ont ouvert. */
export function tilesBefore(id) {
  const i = levelIndex(id);
  const out = [];
  for (let k = 0; k < (i < 0 ? LEVELS.length : i); k++) {
    for (const t of LEVELS[k].unlock) if (!out.includes(t)) out.push(t);
  }
  return out;
}
