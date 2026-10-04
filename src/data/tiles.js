// Catalogue des tuiles (docs/GAME_DESIGN.md §3.2, §6.3, §6.4 ; docs/ARCHITECTURE.md §4).
//
// Chaque entrée : id (type du bâtiment dans `tile.building.type`), famille, libellé, prix, entretien,
// production / consommation (habitants, emplois, énergie, eau, nourriture), recette par saison,
// terrains permis, défrichement, et `models` : identifiants de modèles 3D par niveau (manifeste
// `assets/models/manifest.json`, partagé avec tools/import-models.js). Le rendu choisit
// `models[level][variant % models[level].length]`.
//
// Orientation : `building.yaw` est en degrés, multiple de 90 : 0 = façade vers le sud (+Z),
// 90 = est, 180 = nord, 270 = ouest (three.js : `rotation.y = yaw * Math.PI / 180`).
//
// Les tuiles de la famille `nature` ne comptent pas comme « bâties » pour les rues (§4.1) ;
// certaines changent le terrain de la case (`terrainAfter`) avec `native: false`.

/** Familles, dans l'ordre de la barre d'onglets. */
export const FAMILIES = Object.freeze([
  Object.freeze({ id: 'habitat', label: 'Habitat' }),
  Object.freeze({ id: 'activity', label: 'Activité' }),
  Object.freeze({ id: 'services', label: 'Services' }),
  Object.freeze({ id: 'infrastructure', label: 'Infrastructures' }),
  Object.freeze({ id: 'nature', label: 'Nature' }),
]);

/** Familles dont les tuiles sont des îlots bâtis (rues automatiques entre elles). */
export const URBAN_FAMILIES = Object.freeze(['habitat', 'activity', 'services', 'infrastructure']);

/** Orientation (degrés) d'une façade tournée vers chaque côté. */
export const YAW_BY_DIR = Object.freeze({ S: 0, E: 90, N: 180, W: 270 });

/** Défrichement d'une nature native avant de bâtir (§6.3) ; les autres terrains permis coûtent 0. */
const CLEARING = Object.freeze({ forest: 80, field: 20 });
const URBAN_TERRAINS = Object.freeze(['grass', 'meadow', 'field', 'forest']);
const SOFT_TERRAINS = Object.freeze(['grass', 'meadow', 'field']);

function urban(def) {
  return { footprint: [1, 1], terrains: URBAN_TERRAINS, clearing: CLEARING, buyable: true, ...def };
}

function nature(def) {
  return { footprint: [1, 1], terrains: SOFT_TERRAINS, clearing: { field: 20 }, buyable: true, ...def };
}

export const TILES = Object.freeze([
  // ---- Habitat -------------------------------------------------------------------------------
  urban({
    id: 'house', family: 'habitat', label: 'Quartier',
    description: 'Des habitants, des taxes ; évolue en immeubles quand tout est réuni.',
    price: 60, upkeep: 5, levels: 3,
    produce: { residents: 20 }, consume: { energy: 1, water: 1, food: 1 }, income: 40,
    perLevel: {
      1: { label: 'Maisons', residents: 20, upkeep: 5, income: 40 },
      2: { label: 'Immeubles bas', residents: 45, upkeep: 10, income: 90 },
      3: { label: 'Immeubles', residents: 80, upkeep: 20, income: 160 },
    },
    pollution: { air: 0, water: 4 },
    models: {
      1: ['house-a', 'house-b', 'house-c'],
      2: ['building-small-a', 'building-small-b'],
      3: ['building-tall-a', 'building-tall-b'],
    },
  }),

  // ---- Activité ------------------------------------------------------------------------------
  urban({
    id: 'shop', family: 'activity', label: 'Commerce',
    description: 'Des emplois et des recettes, dopées par le tourisme.',
    price: 80, upkeep: 5, levels: 2,
    produce: { jobs: 15 }, consume: { energy: 1 }, income: 30,
    perLevel: { 1: { jobs: 15, income: 30 }, 2: { jobs: 20, income: 45 } },
    pollution: { air: 2, water: 0 },
    models: { 1: ['shop-a', 'shop-b'], 2: ['shop-a', 'shop-b'] },
  }),
  urban({
    id: 'office', family: 'activity', label: 'Bureaux',
    description: 'Beaucoup d’emplois, peu de nuisances.',
    price: 120, upkeep: 5, levels: 2,
    produce: { jobs: 25 }, consume: { energy: 2 }, income: 50,
    perLevel: { 1: { jobs: 25, income: 50 }, 2: { jobs: 35, income: 75 } },
    pollution: { air: 2, water: 0 },
    models: { 1: ['office-a'], 2: ['office-a'] },
  }),
  urban({
    id: 'factory', family: 'activity', label: 'Usine',
    description: 'Les meilleures recettes, au prix de l’air et de l’eau. À placer sous le vent.',
    price: 150, upkeep: 5, levels: 2,
    produce: { jobs: 30 }, consume: { energy: 3, water: 1 }, income: 80,
    perLevel: { 1: { label: 'Usine', jobs: 30, income: 80 }, 2: { label: 'Usine propre', jobs: 30, income: 80 } },
    pollution: { air: 12, water: 15 },
    models: { 1: ['factory-a', 'factory-b'], 2: ['factory-a', 'factory-b'] },
  }),

  // ---- Services ------------------------------------------------------------------------------
  urban({
    id: 'school', family: 'services', label: 'École',
    description: 'Bonheur et montée de niveau des quartiers à 2 cases.',
    price: 150, upkeep: 5, levels: 1,
    produce: {}, consume: { energy: 1 }, income: 0, radius: 2,
    models: { 1: ['school'] },
  }),
  urban({
    id: 'clinic', family: 'services', label: 'Clinique',
    description: 'Santé et bonheur ; condition des immeubles.',
    price: 200, upkeep: 5, levels: 1,
    produce: {}, consume: { energy: 1 }, income: 0, radius: 2,
    models: { 1: ['clinic'] },
  }),
  urban({
    id: 'market', family: 'services', label: 'Marché',
    description: 'Les champs voisins nourrissent mieux ; les quartiers voisins sont plus heureux.',
    price: 120, upkeep: 5, levels: 1,
    produce: {}, consume: { energy: 1 }, income: 0, radius: 2,
    models: { 1: ['market'] },
  }),
  urban({
    id: 'townhall', family: 'services', label: 'Mairie',
    description: 'Le point de départ de la ville : énergie, eau et emplois de base.',
    price: 300, upkeep: 0, levels: 1, buyable: false,
    produce: { jobs: 20, energy: 3, water: 3 }, consume: {}, income: 0,
    models: { 1: ['townhall'] },
  }),
  urban({
    id: 'tram-stop', family: 'services', label: 'Arrêt de tram',
    description: 'Absorbe la moitié des trajets dans un rayon de 3.',
    price: 100, upkeep: 5, levels: 1,
    produce: {}, consume: { energy: 1 }, income: 0, radius: 3,
    models: { 1: ['tram-stop'] },
  }),

  // ---- Infrastructures -----------------------------------------------------------------------
  urban({
    id: 'wastewater', family: 'infrastructure', label: 'Station d’épuration',
    description: 'Dépollue la rivière et fournit de l’eau potable.',
    price: 180, upkeep: 5, levels: 1,
    produce: { water: 6 }, consume: { energy: 1 }, income: 0,
    pollution: { air: 0, water: -20 },
    models: { 1: ['wastewater'] },
  }),
  urban({
    id: 'wind-turbine', family: 'infrastructure', label: 'Éolienne',
    description: 'Énergie propre ; un peu de bruit pour les voisins.',
    price: 90, upkeep: 5, levels: 1,
    produce: { energy: 4 }, consume: {}, income: 0,
    models: { 1: ['wind-turbine'] },
  }),
  urban({
    id: 'solar', family: 'infrastructure', label: 'Panneaux solaires',
    description: 'Énergie propre et silencieuse, modeste.',
    price: 60, upkeep: 5, levels: 1,
    produce: { energy: 2 }, consume: {}, income: 0,
    models: { 1: ['solar'] },
  }),
  urban({
    id: 'power-plant', family: 'infrastructure', label: 'Centrale',
    description: 'Beaucoup d’énergie, beaucoup de fumée.',
    price: 200, upkeep: 5, levels: 1,
    produce: { energy: 15 }, consume: {}, income: 0,
    pollution: { air: 20, water: 0 },
    models: { 1: ['power-plant'] },
  }),
  urban({
    id: 'compost', family: 'infrastructure', label: 'Compost et recyclerie',
    description: 'Traite les déchets ; les champs voisins y gagnent.',
    price: 80, upkeep: 5, levels: 1,
    produce: {}, consume: {}, income: 0, radius: 2,
    models: { 1: ['compost'] },
  }),
  urban({
    id: 'water-tower', family: 'infrastructure', label: 'Château d’eau',
    description: 'Eau potable tirée de la nappe.',
    price: 100, upkeep: 5, levels: 1,
    produce: { water: 4 }, consume: { energy: 1 }, income: 0,
    models: { 1: ['water-tower'] },
  }),

  // ---- Nature plantée ------------------------------------------------------------------------
  nature({
    id: 'park', family: 'nature', label: 'Parc',
    description: 'Puits d’air, bonheur des quartiers voisins, valeur des terrains.',
    price: 40, upkeep: 2, levels: 1,
    produce: {}, consume: {}, income: 0, airSink: 4, habitat: null,
    models: { 1: ['park'] },
  }),
  nature({
    id: 'tree-planting', family: 'nature', label: 'Forêt plantée',
    description: 'Devient une forêt en deux saisons ; vaut moins qu’une forêt ancienne.',
    price: 30, upkeep: 0, levels: 1, terrainAfter: 'forest', maturity: 6,
    produce: {}, consume: {}, income: 0, airSink: 5, habitat: 'forest',
    models: { 1: ['tree-a', 'tree-b', 'tree-c'] },
  }),
  nature({
    id: 'hedge', family: 'nature', label: 'Haie bocagère',
    description: 'Annule l’érosion des champs voisins, filtre leurs rejets, abrite la faune.',
    price: 20, upkeep: 0, levels: 1,
    produce: {}, consume: {}, income: 0, airSink: 1, habitat: null,
    models: { 1: ['bush'] },
  }),
  nature({
    id: 'wetland-restored', family: 'nature', label: 'Zone humide restaurée',
    description: 'Filtre la rivière voisine et accueille le héron. Se pose au bord de l’eau.',
    price: 60, upkeep: 0, levels: 1, terrainAfter: 'wetland', terrains: ['grass', 'meadow'],
    requires: { adjacent: ['river', 'lake'] },
    produce: {}, consume: {}, income: 0, airSink: 3, habitat: 'wetland',
    models: { 1: ['bush'] },
  }),
  nature({
    id: 'orchard', family: 'nature', label: 'Verger',
    description: 'Un peu de nourriture, un peu d’air pur, des abeilles.',
    price: 50, upkeep: 2, levels: 1,
    produce: { food: 2 }, consume: {}, income: 10, airSink: 2, habitat: null,
    models: { 1: ['tree-a', 'tree-b'] },
  }),
  nature({
    id: 'field', family: 'nature', label: 'Champ cultivé',
    description: 'Nourriture et recettes selon la fertilité du sol.',
    price: 30, upkeep: 0, levels: 1, terrainAfter: 'field', terrains: ['grass', 'meadow', 'field'],
    produce: { food: 4 }, consume: {}, income: 10, airSink: 0, habitat: null,
    models: { 1: ['crop-wheat', 'crop-corn'] },
  }),
]);

/** Accès par identifiant. */
export const TILE_BY_ID = Object.freeze(Object.fromEntries(TILES.map((t) => [t.id, t])));

/** Définition d'une tuile par identifiant (lève une erreur si inconnue). */
export function getTile(id) {
  const t = TILE_BY_ID[id];
  if (!t) throw new Error(`Tuile inconnue : ${id}`);
  return t;
}

/** Les tuiles d'une famille, dans l'ordre du catalogue. */
export function tilesOfFamily(family) {
  return TILES.filter((t) => t.family === family);
}

/** Vrai si la famille forme des îlots bâtis (rues automatiques). */
export function isUrbanFamily(family) {
  return URBAN_FAMILIES.includes(family);
}

/** Vrai si la case porte un îlot bâti (bâtiment d'une famille urbaine, pas une nature plantée). */
export function isBuiltTile(tile) {
  if (!tile || !tile.building) return false;
  const def = TILE_BY_ID[tile.building.type];
  return Boolean(def) && isUrbanFamily(def.family);
}

/** Emplois offerts par la case (0 si elle n'en offre pas). */
export function jobsOfTile(tile) {
  if (!tile || !tile.building) return 0;
  const def = TILE_BY_ID[tile.building.type];
  if (!def) return 0;
  const level = def.perLevel && def.perLevel[tile.building.level];
  return (level && level.jobs) ?? def.produce.jobs ?? 0;
}

/** Habitants logés par la case (0 si aucun). */
export function residentsOfTile(tile) {
  if (!tile || !tile.building) return 0;
  const def = TILE_BY_ID[tile.building.type];
  if (!def) return 0;
  const level = def.perLevel && def.perLevel[tile.building.level];
  return (level && level.residents) ?? def.produce.residents ?? 0;
}

/** Modèle 3D d'un bâtiment posé : `models[level][variant % n]`, ou null si la tuile n'a pas de modèle. */
export function modelOfBuilding(building) {
  const def = TILE_BY_ID[building.type];
  if (!def) return null;
  const list = def.models[building.level] || def.models[1];
  if (!list || list.length === 0) return null;
  return list[((building.variant || 0) % list.length + list.length) % list.length];
}

/** Modèles des rues et ponts (pièces posées sur les arêtes). */
export const ROAD_MODELS = Object.freeze({
  straight: 'road-straight',
  corner: 'road-corner',
  t: 'road-t',
  cross: 'road-cross',
  crosswalk: 'road-crosswalk',
  bridge: 'bridge',
});

/** Modèles des véhicules animés sur les rues chargées. */
export const VEHICLE_MODELS = Object.freeze(['car-a', 'car-b', 'bus', 'truck']);
export const TRAM_MODEL = 'tram';

/** Décors naturels (forêt, prairie, colline, champ, zone humide). */
export const NATURE_MODELS = Object.freeze([
  'tree-a', 'tree-b', 'tree-c', 'pine-a', 'pine-b', 'bush', 'flowers', 'rock-a', 'rock-b', 'crop-wheat', 'crop-corn',
]);

/** Tous les identifiants de modèles que le manifeste doit fournir (liste partagée avec tools/import-models.js). */
export const MODEL_IDS = Object.freeze([
  'house-a', 'house-b', 'house-c',
  'building-small-a', 'building-small-b',
  'building-tall-a', 'building-tall-b',
  'shop-a', 'shop-b', 'office-a', 'factory-a', 'factory-b',
  'school', 'clinic', 'market', 'townhall', 'tram-stop',
  'wastewater', 'wind-turbine', 'solar', 'power-plant', 'compost', 'water-tower',
  'park', ...NATURE_MODELS,
  ...Object.values(ROAD_MODELS),
  TRAM_MODEL, ...VEHICLE_MODELS,
]);
