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
  Object.freeze({ population: 120, tiles: ['clinic', 'factory', 'wetland-restored', 'wildlife-crossing'] }),
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

// ---- Écologie : air (§5.1) ---------------------------------------------------------------------
/**
 * Émissions d'air d'un bâtiment par mois : un nombre, ou un palier par niveau (le quartier ne pollue
 * qu'au niveau 3). Les terrains n'émettent rien ; le trafic s'ajoute à part (ECO_AIR_PER_TRAFFIC).
 */
export const ECO_EMIT = Object.freeze({
  'power-plant': 20,
  factory: 12,
  shop: 2,
  office: 2,
  house: Object.freeze({ 1: 0, 2: 0, 3: 2 }),
});
/** Puits d'air d'un bâtiment par mois (les terrains ont leur `airSink` dans terrain.js). */
export const ECO_SINK = Object.freeze({
  park: 4,
  'tree-planting': 5,
  'wetland-restored': 3,
  orchard: 2,
  hedge: 1,
});
/** Air : pollution ajoutée par unité de trafic de chaque arête riveraine. */
export const ECO_AIR_PER_TRAFFIC = 0.5;
/**
 * Air : part gardée sur place par la diffusion (le reste vient de la moyenne des quatre voisins) et
 * dissipation mensuelle. GAME_DESIGN §5.1 proposait 0,6 et 0,97 ; mesuré sur une carrière de trois ans
 * (tools/simulate.js), la pollution n'atteignait alors jamais les seuils de ce même §5.1 (bonheur à 40,
 * exode à 60) : une usine plafonnait à 18 sur sa propre case. 0,7 et 0,98 concentrent la fumée là où elle
 * sort et la laissent s'accumuler : une usine monte à ~45 chez elle, une centrale rend un quartier voisin
 * invivable, et « tout bétonner » étouffe la vallée en trois ans.
 */
export const ECO_AIR_KEEP = 0.7;
/** Air : poids du vent dominant (écart avec le voisin au vent). */
export const ECO_AIR_WIND = 0.15;
export const ECO_AIR_DECAY = 0.98;
/** Air d'un quartier : bonheur −1 par tranche de 10 au-delà de 40. */
export const ECO_AIR_HAPPY_THRESHOLD = 40;
export const ECO_AIR_HAPPY_STEP = 10;

// ---- Écologie : eau (§5.2) ---------------------------------------------------------------------
/**
 * Rejets dans l'eau par mois. `house` ne compte que si aucune station d'épuration n'est à moins de
 * ECO_WASTEWATER_RADIUS cases ; `field` dépend de la conduite du champ (`building.mode`) ; une haie
 * voisine divise les rejets d'un champ par deux (ECO_HEDGE_WATER_FACTOR).
 */
export const ECO_WATER_OUT = Object.freeze({
  factory: 15,
  house: 4,
  field: Object.freeze({ intensive: 6, organic: 1, fallow: 0 }),
  orchard: 1,
});
/**
 * Dépollution de l'eau par mois. `wetland` et `riparian` (forêt qui touche l'eau) agissent sur les cases
 * d'eau voisines ; `lake` est la sédimentation que le lac s'applique à lui-même.
 */
export const ECO_WATER_IN = Object.freeze({
  wastewater: 20,
  wetland: 8,
  riparian: 4,
  lake: 2,
});
/** Rivière : part de l'amont transportée vers l'aval chaque mois. */
export const ECO_RIVER_CARRY = 0.8;
/** Lac : part des affluents qui entre chaque mois. */
export const ECO_LAKE_INFLOW = 0.3;
/** Nappe : valeur d'échantillon d'un champ intensif voisin. */
export const ECO_GROUND_FIELD = 5;
/** Distance (Chebyshev) à laquelle une station d'épuration dispense un quartier de ses rejets. */
export const ECO_WASTEWATER_RADIUS = 5;
/** Une haie voisine divise par deux les rejets d'un champ (§5.4). */
export const ECO_HEDGE_WATER_FACTOR = 0.5;
/** Santé : la nappe au-delà de ce seuil coûte ECO_HEALTH_PER_POINT point par point (comme l'air). */
export const ECO_GROUND_HEALTH_THRESHOLD = 40;
export const ECO_HEALTH_PER_POINT = 1.5;

// ---- Écologie : faune (§5.3) -------------------------------------------------------------------
/** Biodiversité de base d'une case selon son habitat. */
export const ECO_FAUNA_BASE = Object.freeze({ forest: 40, wetland: 35, lake: 30, meadow: 25 });
/** Faune : bonus par case de parcelle (plafonné), malus par arête de rue riveraine, poids de la pollution. */
export const ECO_FAUNA_SIZE_BONUS = 0.1;
export const ECO_FAUNA_SIZE_CAP = 10;
export const ECO_FAUNA_ROAD_MALUS = 0.5;
export const ECO_FAUNA_POLLUTION = 1 / 50;
/** Faune : une haie voisine ajoute un point de biodiversité (§5.4). */
export const ECO_FAUNA_HEDGE_BONUS = 1;
/** Trafic d'une arête à partir duquel elle coupe la contiguïté des habitats (sauf passage à faune). */
export const ECO_TRAFFIC_CUT = 3;
/** Part de la carte en habitat qui vaut la note maximale du score de faune. */
export const ECO_HABITAT_TARGET = 0.25;
/** Espèces : mois consécutifs sous ECO_SPECIES_LEAVE_RATIO (20 % sous le seuil) avant le départ. */
export const ECO_SPECIES_LEAVE_MONTHS = 15;
export const ECO_SPECIES_LEAVE_RATIO = 0.8;
/** Score nature : points par espèce présente dans le terme `0,25·min(100, 15·espèces)`. */
export const ECO_SPECIES_SCORE = 15;

// ---- Écologie : sols et champs (§5.4) ----------------------------------------------------------
/** Fertilité d'un champ qui vient d'être mis en culture. */
export const ECO_SOIL_START = 70;
/** Par conduite : rendement (× F/100) et variation mensuelle de la fertilité. */
export const ECO_SOIL = Object.freeze({
  intensive: Object.freeze({ yield: 1.5, change: -2 }),
  organic: Object.freeze({ yield: 0.9, change: 1 }),
  fallow: Object.freeze({ yield: 0, change: 4 }),
});
/** Conduite d'un champ sans consigne (`building.mode` absent) ; le verger est toujours conduit en bio. */
export const ECO_FIELD_MODE = 'intensive';
/** Érosion d'un champ intensif sous une colline sans haie, et multiplicateur des pluies fortes. */
export const ECO_SOIL_EROSION = 2;
export const ECO_RAIN_EROSION = 3;
/** Probabilité de pluies fortes dans le mois (une fois par saison en moyenne). */
export const ECO_RAIN_CHANCE = 1 / 3;
/** Pollinisation : rendement bio multiplié à moins de deux cases d'abeilles ; une haie coûte 10 % de rendement. */
export const ECO_POLLINATION_BONUS = 1.2;
export const ECO_POLLINATION_RADIUS = 2;
export const ECO_HEDGE_YIELD_FACTOR = 0.9;

// ---- Écologie : scores, tourisme, alertes (§5.5, §7.1, §7.3) -----------------------------------
/** Poids du score nature : `0,3·air + 0,3·eau + 0,25·espèces + 0,15·fertilité` (§7.1). */
export const ECO_NATURE_WEIGHTS = Object.freeze({ air: 0.3, water: 0.3, species: 0.25, soil: 0.15 });
/**
 * Tourisme (§5.5) : points par espèce présente, pour un lac propre (sous `cleanLakeMax`), par tranche de
 * dix cases de forêt (plafonnée par `forestMax`), et plafond général. Les recettes des commerces sont
 * multipliées par `1 + tourisme/100`.
 */
export const ECO_TOURISM = Object.freeze({
  perSpecies: 5,
  cleanLake: 10,
  cleanLakeMax: 30,
  perForest10: 2,
  forestMax: 20,
  max: 50,
});
/** Alertes : seuil et nombre de mois consécutifs avant le signalement (§5.1, §5.2, §7.3). */
export const ECO_ALERTS = Object.freeze({
  smog: Object.freeze({ threshold: 60, months: 5 }),
  algae: Object.freeze({ threshold: 60, months: 10 }),
  flood: Object.freeze({ wetlandShare: 0.2, months: 6 }),
  heat: Object.freeze({ radius: 2, months: 3 }),
});
/** Exode écologique (§7.3) : au-delà de ces seuils, cette part des habitants s'en va chaque mois. */
export const ECO_EXODUS_AIR = 60;
export const ECO_EXODUS_HEALTH = 40;
export const ECO_EXODUS_RATE = 0.03;
