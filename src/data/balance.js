// Constantes d'équilibrage (docs/GAME_DESIGN.md §6.2 à §6.7, §7.2-7.3 ; docs/ARCHITECTURE.md §9.1).
//
// Tout ce qui est un nombre « réglable » du jeu vit ici, pour que tools/simulate.js et les tests parlent
// de la même chose que src/core/game.js. Aucune logique : des données gelées.

// ---- Temps ------------------------------------------------------------------------------------
/** Durée d'un mois de jeu en secondes, à vitesse 1 (saison = 3 mois, année = 12 mois). */
export const MONTH_SECONDS = 30;
/** Vitesses possibles : pause, ½, 1, 2, 4 (dans l'ordre du cycle du bouton). */
export const SPEEDS = Object.freeze([0, 0.5, 1, 2, 4]);
/** Plafond de mois simulés par appel à `advance` (au-delà, le reste du temps est abandonné et signalé). */
export const MAX_TICKS_PER_ADVANCE = 12;

// ---- Argent -----------------------------------------------------------------------------------
export const START_MONEY = 500;
/** Fenêtre d'annulation d'une pose, en secondes réelles (remboursement intégral, tuile et rues). */
export const UNDO_SECONDS = 10;
/** Coût d'un segment de rue de raccordement (par arête nouvellement équipée). */
export const STREET_SEGMENT_COST = 10;
/** Coût d'un segment de pont (arête de raccordement entre deux cases de rivière). */
export const BRIDGE_SEGMENT_COST = 40;
export const DEMOLISH_COST = 10;
/** Trésor en dessous duquel la ville est en faillite ; déclarée après `BROKE_MONTHS` mois de suite. */
export const BROKE_THRESHOLD = -200;
export const BROKE_MONTHS = 6;

// ---- Quartiers ---------------------------------------------------------------------------------
/** Habitants logés par un quartier selon son niveau (maisons, immeubles bas, immeubles). */
export const CAPACITY_BY_LEVEL = Object.freeze({ 1: 20, 2: 45, 3: 80 });
/** Entretien par saison d'une tuile selon son niveau (le niveau 1 des tuiles de nature a son propre `upkeep`). */
export const UPKEEP_BY_LEVEL = Object.freeze({ 1: 5, 2: 10, 3: 20 });
/** Entretien par saison d'un segment de rue ou de pont (les chemins sont gratuits). */
export const STREET_UPKEEP = 2;
/** Recette par saison et par habitant (2 $ : 20 habitants → 40 $, 45 → 90 $, 80 → 160 $). */
export const INCOME_PER_RESIDENT = 2;
/** Part des habitants présents au départ dans les quartiers de la ville de départ (0..1). */
export const START_OCCUPANCY = 0.3;

// ---- Habitants ---------------------------------------------------------------------------------
/** Bonheur à partir duquel des habitants arrivent chaque mois. */
export const HAPPINESS_ARRIVALS = 40;
/** Bonheur en dessous duquel, après `EXODUS_MONTHS` mois de suite, les habitants s'en vont. */
export const HAPPINESS_EXODUS = 30;
export const EXODUS_MONTHS = 6;
/** Arrivées : part de l'écart à la capacité comblée chaque mois, et minimum s'il reste de la place. */
export const ARRIVAL_RATE = 0.1;
export const ARRIVAL_MIN = 2;
/** Départs : part des habitants qui partent chaque mois d'exode. */
export const EXODUS_RATE = 0.1;

// ---- Bonheur -----------------------------------------------------------------------------------
export const BASE_HAPPINESS = 50;
/** Malus par ressource en déficit (énergie, eau, nourriture). */
export const SHORTAGE_PENALTY = 10;
/** Chômage : population > emplois × ce ratio → malus. */
export const UNEMPLOYMENT_RATIO = 1.2;
export const UNEMPLOYMENT_PENALTY = 10;
/** Emplois > population → recettes des activités réduites de moitié. */
export const OVERSTAFFED_INCOME_FACTOR = 0.5;

/**
 * Adjacences qui pèsent sur le bonheur d'un quartier (§6.6). Chaque entrée : la source (types de
 * bâtiments et/ou terrains), le rayon (1 = les quatre voisins par côté ; 2 = toute case à distance de
 * Chebyshev ≤ 2), l'effet par source et, pour les bonus, le plafond cumulé (`max`) ; sans `max`, les
 * sources s'additionnent (deux usines voisines : −30).
 */
export const ADJACENCY = Object.freeze([
  Object.freeze({ id: 'factory', label: 'Usine voisine', buildings: ['factory'], terrains: [], radius: 1, effect: -15 }),
  Object.freeze({ id: 'green', label: 'Espace vert voisin', buildings: ['park'], terrains: ['forest'], radius: 1, effect: 8, max: 16 }),
  Object.freeze({ id: 'water', label: 'Au bord de l’eau', buildings: [], terrains: ['river', 'lake'], radius: 1, effect: 5, max: 5 }),
  Object.freeze({ id: 'shop', label: 'Commerce voisin', buildings: ['shop'], terrains: [], radius: 1, effect: 5, max: 5 }),
  Object.freeze({ id: 'school', label: 'École à 2 cases', buildings: ['school'], terrains: [], radius: 2, effect: 10, max: 10 }),
  Object.freeze({ id: 'clinic', label: 'Clinique à 2 cases', buildings: ['clinic'], terrains: [], radius: 2, effect: 5, max: 5 }),
  Object.freeze({ id: 'power-plant', label: 'Centrale à 2 cases', buildings: ['power-plant'], terrains: [], radius: 2, effect: -5 }),
  Object.freeze({ id: 'wind-turbine', label: 'Éolienne voisine', buildings: ['wind-turbine'], terrains: [], radius: 1, effect: -3 }),
  Object.freeze({ id: 'market', label: 'Marché voisin', buildings: ['market'], terrains: [], radius: 1, effect: 5, max: 5 }),
]);

/**
 * Conditions d'évolution, vérifiées au bilan de saison (§6.7), par type de bâtiment puis par niveau
 * visé. `happiness` : bonheur local minimal du quartier ; `requires` : chaque entrée demande `count`
 * cases (bâtiments et/ou terrains listés) dans le rayon (même convention que `ADJACENCY`).
 * (L'air ≥ 60 du niveau 3 attend le système d'écologie ; l'usine propre aussi.)
 */
export const EVOLUTION = Object.freeze({
  house: Object.freeze({
    2: Object.freeze({
      happiness: 60,
      requires: Object.freeze([
        Object.freeze({ label: 'Une école à 2 cases', buildings: ['school'], terrains: [], radius: 2, count: 1 }),
        Object.freeze({ label: 'Un commerce à 2 cases', buildings: ['shop'], terrains: [], radius: 2, count: 1 }),
      ]),
    }),
    3: Object.freeze({
      happiness: 75,
      requires: Object.freeze([
        Object.freeze({ label: 'Une clinique à 2 cases', buildings: ['clinic'], terrains: [], radius: 2, count: 1 }),
        Object.freeze({ label: 'Un parc ou une forêt voisine', buildings: ['park'], terrains: ['forest'], radius: 1, count: 1 }),
      ]),
    }),
  }),
  shop: Object.freeze({
    2: Object.freeze({
      requires: Object.freeze([
        Object.freeze({ label: 'Deux quartiers voisins', buildings: ['house'], terrains: [], radius: 1, count: 2 }),
        Object.freeze({ label: 'Des bureaux voisins', buildings: ['office'], terrains: [], radius: 1, count: 1 }),
      ]),
    }),
  }),
  office: Object.freeze({
    2: Object.freeze({
      requires: Object.freeze([
        Object.freeze({ label: 'Un commerce voisin', buildings: ['shop'], terrains: [], radius: 1, count: 1 }),
        Object.freeze({ label: 'Une école à 2 cases', buildings: ['school'], terrains: [], radius: 2, count: 1 }),
      ]),
    }),
  }),
});

// ---- Catalogue ---------------------------------------------------------------------------------
/** Entrées du catalogue disponibles au départ (§8.1, simplifié tant que les contrats n'existent pas). */
export const START_UNLOCKED = Object.freeze([
  'house', 'shop', 'field', 'orchard', 'park', 'tree-planting', 'hedge',
  'wind-turbine', 'solar', 'water-tower', 'school',
]);
/** Déblocages par palier de population, vérifiés au bilan de saison. */
export const UNLOCKS = Object.freeze([
  Object.freeze({ population: 80, tiles: ['office', 'market', 'compost'] }),
  Object.freeze({ population: 120, tiles: ['clinic', 'factory', 'wetland-restored'] }),
  Object.freeze({ population: 160, tiles: ['power-plant', 'wastewater', 'tram-stop'] }),
]);

// ---- Jauge Nature provisoire (§9.1) ------------------------------------------------------------
/** Poids de la part de nature native conservée, et de la part de cases vertes (forêt, zone humide, prairie, parc…). */
export const NATURE_NATIVE_WEIGHT = 0.6;
export const NATURE_GREEN_WEIGHT = 0.4;
/** Part de la carte en cases vertes qui vaut la note maximale du second terme. */
export const NATURE_GREEN_TARGET = 0.3;
/** Terrains comptés comme verts, et natures plantées comptées comme vertes. */
export const GREEN_TERRAINS = Object.freeze(['forest', 'wetland', 'meadow']);
export const GREEN_BUILDINGS = Object.freeze(['park', 'hedge', 'orchard']);

/** Nombre d'événements gardés dans `game.log`. */
export const LOG_LIMIT = 50;
