// État de partie, temps, pose et démolition (docs/ARCHITECTURE.md §9.1 ; docs/GAME_DESIGN.md §6).
//
// Tout est pur : chaque fonction rend un nouvel objet (le monde n'est recopié que s'il change, si bien que
// `game.world` change de référence exactement quand le rendu doit reconstruire la scène). Aucun accès au
// DOM, à three.js ni à l'horloge : les secondes réelles nécessaires à l'annulation (`UNDO_SECONDS`) sont
// passées par l'appelant (`place(game, x, y, tileId, nowSeconds)`, `undoLast(game, nowSeconds)`).
//
// Événements rendus par `advance`, `monthTick`, `place`, `demolish` : { type, month, text, x?, y? } avec
// type ∈ month | season | year | evolve | arrivals | departures | broke | placed | demolished | unlock | info
// | species | eco-alert
// (`unlock` porte `tileId` ; `evolve` porte `level` ; `placed` porte `tileId` et `cost` ; `species` porte
// `key` (identifiant d'espèce), `present` et `layer` ; `eco-alert` porte `key` (smog | algae | flood | heat)
// et `layer` (air | water | fauna) : l'interface centre la carte sur (x, y) et active le bon calque).
//
// L'écologie (src/core/ecology.js) est le seul état avancé **sur place** : `monthTick` rend le même objet
// `eco` d'un mois à l'autre (contrat docs/ARCHITECTURE.md §10.1 : ne rien allouer par tick). Tout le reste
// en fait une copie — `place`, `demolish`, `setFieldMode`, l'annulation et la sauvegarde — si bien que
// deux parties dérivées d'une même partie ne partagent jamais leur écologie.
//
// Carrière (§11.1) : une partie créée par `createGame({ level })` porte `levelId` (le niveau joué, nul
// hors carrière) et `flags` — pour l'instant `{ exodusMonths }`, le nombre de mois où des habitants sont
// partis, que l'étoile « sans exode » consulte (src/core/career.js). Les deux voyagent dans la sauvegarde.
//
// Repères d'économie (§6.4) : les recettes et l'entretien du catalogue sont des montants par saison,
// encaissés par tiers chaque mois ; un quartier rapporte INCOME_PER_RESIDENT $ par habitant présent et
// consomme au prorata de ses habitants (ses `consume` valent pour la pleine capacité).

import { cloneWorld, cloneTile, tileAt, inBounds, index, neighbors4, edgesOfTile, edgeValue, createTraffic, createEdges } from './grid.js';
import { generateWorld, centerOf } from './worldgen.js';
import { ROAD_VERSION } from './blocks.js';
import {
  EDGE, rebuildRoads, connectTile, applyPath, computeTraffic, faceTowardRoad, countEdges, networkConnected,
} from './roads.js';
import { hashSeed, createRng } from './rng.js';
import {
  createEcology, cloneEcology, serializeEcology, reviveEcology, syncEcology, stepEcology, describeEcology,
  cityAir, healthOf, tourismOf, airHappinessPenalty, fieldYieldOf, speciesSummary, speciesCount,
  pollutedShare,
} from './ecology.js';
import { calendar, isSeasonEnd, isYearEnd, MONTH_LABELS } from './calendar.js';
import { TILE_BY_ID, FAMILIES, isBuiltTile, isUrbanFamily, residentsOfTile, jobsOfTile } from '../data/tiles.js';
import { TERRAINS } from '../data/terrain.js';
import {
  MONTH_SECONDS, SPEEDS, MAX_TICKS_PER_ADVANCE, START_MONEY, UNDO_SECONDS, STREET_SEGMENT_COST, BRIDGE_SEGMENT_COST,
  DEMOLISH_COST, BROKE_THRESHOLD, BROKE_MONTHS, UPKEEP_BY_LEVEL, STREET_UPKEEP, INCOME_PER_RESIDENT, START_OCCUPANCY,
  HAPPINESS_ARRIVALS, HAPPINESS_EXODUS, EXODUS_MONTHS, ARRIVAL_RATE, ARRIVAL_MIN, EXODUS_RATE,
  BASE_HAPPINESS, SHORTAGE_PENALTY, UNEMPLOYMENT_RATIO, UNEMPLOYMENT_PENALTY, OVERSTAFFED_INCOME_FACTOR,
  ADJACENCY, EVOLUTION, START_UNLOCKED, UNLOCKS,
  NATURE_NATIVE_WEIGHT, NATURE_GREEN_WEIGHT, NATURE_GREEN_TARGET, GREEN_TERRAINS, GREEN_BUILDINGS, LOG_LIMIT,
  ECO_EXODUS_AIR, ECO_EXODUS_HEALTH, ECO_EXODUS_RATE, ECO_TOURISM, ECO_FIELD_MODE,
} from '../data/balance.js';

export { calendar } from './calendar.js';
export { speciesSummary } from './ecology.js';

/** Version du format de sauvegarde (2 : l'écologie de l'étape 4). */
export const GAME_VERSION = 2;
/** Versions relues par `deserialize` (la 1 est migrée : l'écologie est recalculée de zéro). */
export const SAVE_VERSIONS = Object.freeze([1, 2]);

/** Types de bâtiments dont les recettes profitent du tourisme (§5.5). */
const TOURISM_TYPES = Object.freeze(['shop', 'market']);
/** Tuiles dont le rendement suit la fertilité du sol et la pollinisation (§5.4). */
const FIELD_TYPES = Object.freeze(['field', 'orchard']);
/** Conduites d'un champ, telles qu'on les annonce au joueur (§5.4). */
export const FIELD_MODE_LABELS = Object.freeze({
  intensive: 'en culture intensive',
  organic: 'en bio',
  fallow: 'en jachère',
});

const SEASON_END_LABELS = Object.freeze(['Le printemps s’achève', 'L’été s’achève', 'L’automne s’achève', 'L’hiver s’achève']);
const FAMILY_LABEL = Object.freeze(Object.fromEntries(FAMILIES.map((f) => [f.id, f.label])));

// ---------------------------------------------------------------------------------------------
// Petits outils.

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function round1(v) {
  return Math.round(v * 10) / 10;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function signed(n) {
  return n > 0 ? `+${n}` : `${n}`;
}

function plural(n, one, many) {
  return n === 1 ? one : many;
}

/** Ajoute des événements au journal en gardant les `LOG_LIMIT` derniers. */
function appendLog(log, events) {
  if (events.length === 0) return log;
  const all = log.concat(events);
  return all.length > LOG_LIMIT ? all.slice(all.length - LOG_LIMIT) : all;
}

function event(type, month, text, extra = null) {
  return extra ? { type, month, text, ...extra } : { type, month, text };
}

/** Copie profonde d'une partie, sans son annulation (sert à mémoriser l'état d'avant une pose). */
function snapshotOf(game) {
  return structuredClone({ ...game, undo: null });
}

/** Les cases à portée : rayon 1 = les quatre voisins par côté ; rayon 2 = distance de Chebyshev ≤ 2 (sans la case). */
function cellsWithin(world, x, y, radius) {
  if (radius <= 1) return neighbors4(world, x, y);
  const out = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if ((dx !== 0 || dy !== 0) && inBounds(world, x + dx, y + dy)) out.push({ x: x + dx, y: y + dy });
    }
  }
  return out;
}

/** Nombre de cases à portée dont le bâtiment ou le terrain figure dans la spécification (une case compte une fois). */
function countSources(world, x, y, spec) {
  let n = 0;
  for (const c of cellsWithin(world, x, y, spec.radius)) {
    const t = tileAt(world, c.x, c.y);
    const byBuilding = Boolean(t.building) && spec.buildings.includes(t.building.type);
    const byTerrain = spec.terrains.includes(t.terrain);
    if (byBuilding || byTerrain) n++;
  }
  return n;
}

/** Valeurs d'un bâtiment à son niveau (perLevel du catalogue, sinon rien). */
function levelInfo(def, level) {
  return (def.perLevel && def.perLevel[level]) || {};
}

/** Entretien par saison d'un bâtiment : perLevel, sinon UPKEEP_BY_LEVEL au-delà du niveau 1, sinon `upkeep` du catalogue. */
export function upkeepOf(def, level = 1) {
  const info = levelInfo(def, level);
  if (Number.isFinite(info.upkeep)) return info.upkeep;
  if (level > 1 && Number.isFinite(UPKEEP_BY_LEVEL[level])) return UPKEEP_BY_LEVEL[level];
  return def.upkeep || 0;
}

/** Recette par saison d'un bâtiment à pleine activité (quartier : à pleine capacité). */
export function incomeOf(def, level = 1) {
  const info = levelInfo(def, level);
  if (Number.isFinite(info.income)) return info.income;
  return def.income || 0;
}

// ---------------------------------------------------------------------------------------------
// Bonheur et adjacences.

/** Détail des adjacences d'un quartier : [{ id, label, value }] (bonus plafonnés) et leur somme. */
export function adjacencyOf(world, x, y) {
  const details = [];
  let total = 0;
  for (const rule of ADJACENCY) {
    const n = countSources(world, x, y, rule);
    if (n === 0) continue;
    let value = n * rule.effect;
    if (Number.isFinite(rule.max)) value = rule.effect >= 0 ? Math.min(value, rule.max) : Math.max(value, -rule.max);
    details.push({ id: rule.id, label: rule.label, value });
    total += value;
  }
  return { total, details };
}

/** Malus communs à toute la ville : pénuries et chômage. */
export function penaltiesOf(stats) {
  return stats.shortages.length * SHORTAGE_PENALTY + (stats.unemployment ? UNEMPLOYMENT_PENALTY : 0);
}

/**
 * Bonheur local d'un quartier (0..100) : base + adjacences − malus communs − l'air (§5.1 : 1 point par
 * tranche de 10 au-delà de 40, quand l'écologie est fournie).
 */
export function localHappiness(world, x, y, penalties, eco = null) {
  const air = eco ? airHappinessPenalty(eco.air[index(world, x, y)]) : 0;
  return clamp(Math.round(BASE_HAPPINESS + adjacencyOf(world, x, y).total - penalties - air), 0, 100);
}

// ---------------------------------------------------------------------------------------------
// Jauge Nature provisoire.

/** Cases de nature native (tout terrain natif autre que l'herbe) : la référence de la jauge Nature. */
export function countNativeNature(world) {
  let n = 0;
  for (const t of world.tiles) if (t.native && t.terrain !== 'grass') n++;
  return n;
}

function countGreen(world) {
  let n = 0;
  for (const t of world.tiles) {
    if (GREEN_TERRAINS.includes(t.terrain) || (t.building && GREEN_BUILDINGS.includes(t.building.type))) n++;
  }
  return n;
}

/**
 * Nature (0..100) de l'étape 3, conservée pour la migration des sauvegardes de version 1 et comme recours
 * quand une partie n'a pas d'écologie : 60 % de nature native conservée + 40 % de cases vertes (cible
 * 30 % de la carte). Le vrai score est `game.eco.scores.nature` (§7.1).
 */
export function computeNature(world, natureBaseline) {
  const conserved = natureBaseline > 0 ? clamp(countNativeNature(world) / natureBaseline, 0, 1) : 1;
  const green = clamp(countGreen(world) / Math.max(1, NATURE_GREEN_TARGET * world.tiles.length), 0, 1);
  return Math.round(100 * (NATURE_NATIVE_WEIGHT * conserved + NATURE_GREEN_WEIGHT * green));
}

// ---------------------------------------------------------------------------------------------
// Statistiques et demande.

/**
 * Statistiques dérivées de l'état : population (bornée par la capacité), capacité, emplois, ressources
 * (besoin / disponible), bonheur, nature, recettes et entretien (par mois : ce qui est encaissé au tick ;
 * `seasonIncome` / `seasonUpkeep` par saison), segments de rue, pénuries, chômage.
 */
export function computeStats(game) {
  const { world } = game;
  const eco = game.eco || null;
  let capacity = 0;
  let jobs = 0;
  let buildings = 0;
  const have = { energy: 0, water: 0, food: 0 };
  const houseNeed = { energy: 0, water: 0, food: 0 };
  const otherNeed = { energy: 0, water: 0, food: 0 };
  let buildingUpkeep = 0;
  let activityIncome = 0;
  let shopIncome = 0;
  let otherIncome = 0;
  const houses = [];
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const t = tileAt(world, x, y);
      if (!t.building) continue;
      const def = TILE_BY_ID[t.building.type];
      if (!def) continue;
      buildings++;
      const level = t.building.level || 1;
      capacity += residentsOfTile(t);
      jobs += jobsOfTile(t);
      // Champs et vergers : le rendement suit la fertilité et la pollinisation (§5.4).
      const factor = eco && FIELD_TYPES.includes(def.id) ? fieldYieldOf(eco, world, index(world, x, y)) : 1;
      for (const k of Object.keys(have)) have[k] += (def.produce[k] || 0) * factor;
      const need = def.family === 'habitat' ? houseNeed : otherNeed;
      for (const k of Object.keys(need)) need[k] += def.consume[k] || 0;
      buildingUpkeep += upkeepOf(def, level);
      if (def.family === 'habitat') houses.push({ x, y });
      else if (TOURISM_TYPES.includes(def.id)) shopIncome += incomeOf(def, level);
      else if (def.family === 'activity') activityIncome += incomeOf(def, level);
      else otherIncome += incomeOf(def, level) * factor;
    }
  }
  const population = Math.max(0, Math.min(game.population || 0, capacity));
  const occupancy = capacity > 0 ? population / capacity : 0;
  const resources = {};
  const shortages = [];
  for (const k of Object.keys(have)) {
    const need = round1(houseNeed[k] * occupancy + otherNeed[k]);
    const stock = round1(have[k]);
    resources[k] = { need, have: stock };
    if (need > stock + 1e-9) shortages.push(k);
  }
  const unemployment = population > jobs * UNEMPLOYMENT_RATIO;
  const penalties = shortages.length * SHORTAGE_PENALTY + (unemployment ? UNEMPLOYMENT_PENALTY : 0);
  let happiness;
  if (houses.length === 0) {
    happiness = clamp(BASE_HAPPINESS - penalties, 0, 100);
  } else {
    let sum = 0;
    for (const h of houses) sum += localHappiness(world, h.x, h.y, penalties, eco);
    happiness = Math.round(sum / houses.length);
  }
  const streets = countEdges(world).total;
  const activityFactor = jobs > population ? OVERSTAFFED_INCOME_FACTOR : 1;
  // Tourisme (§5.5) : les recettes des commerces sont multipliées par 1 + tourisme/100.
  const tourism = eco ? tourismOf(eco, world) : 0;
  const seasonIncome = Math.round(
    INCOME_PER_RESIDENT * population
    + (activityIncome + shopIncome * (1 + tourism / 100)) * activityFactor
    + otherIncome,
  );
  const seasonUpkeep = buildingUpkeep + STREET_UPKEEP * streets;
  return {
    population,
    capacity,
    jobs,
    happiness,
    nature: eco ? eco.scores.nature : computeNature(world, game.natureBaseline || 0),
    health: eco ? healthOf(eco, world) : 100,
    tourism,
    species: eco ? speciesCount(eco) : 0,
    energy: resources.energy,
    water: resources.water,
    food: resources.food,
    income: Math.round(seasonIncome / 3),
    upkeep: Math.round(seasonUpkeep / 3),
    seasonIncome,
    seasonUpkeep,
    streets,
    buildings,
    houses: houses.length,
    occupancy: round1(occupancy * 100) / 100,
    shortages,
    unemployment,
  };
}

/**
 * Boussole du catalogue : ce qui manque, dans [0, 1] par famille. `habitat` quand les quartiers se
 * remplissent ou que les emplois dépassent la population ; `activity` quand il manque des emplois ;
 * `services` quand le bonheur baisse ou que des quartiers n'ont ni école ni clinique à portée ;
 * `infrastructure` selon les pénuries ; `nature` quand la jauge Nature faiblit.
 */
export function computeDemand(game) {
  const s = game.stats || computeStats(game);
  const { world } = game;
  const occupancy = s.capacity > 0 ? s.population / s.capacity : 1;
  const wantedByJobs = s.jobs > s.population && s.jobs > 0 ? (s.jobs - s.population) / s.jobs : 0;
  const habitat = clamp(Math.max((occupancy - 0.5) * 2, wantedByJobs), 0, 1);
  const activity = clamp(((s.population - s.jobs) / Math.max(1, s.population)) * 2, 0, 1);
  let withoutService = 0;
  let houses = 0;
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const t = tileAt(world, x, y);
      if (!t.building || !TILE_BY_ID[t.building.type] || TILE_BY_ID[t.building.type].family !== 'habitat') continue;
      houses++;
      if (countSources(world, x, y, { buildings: ['school', 'clinic'], terrains: [], radius: 2 }) === 0) withoutService++;
    }
  }
  const shareWithout = houses > 0 ? withoutService / houses : 0;
  const services = clamp(0.5 * ((65 - s.happiness) / 35) + 0.5 * shareWithout, 0, 1);
  const infrastructure = clamp(s.shortages.length / 3, 0, 1);
  const nature = clamp((70 - s.nature) / 40, 0, 1);
  return { habitat, activity, services, infrastructure, nature };
}

function withStats(game) {
  const stats = computeStats(game);
  const next = { ...game, stats, population: stats.population };
  next.demand = computeDemand(next);
  return next;
}

// ---------------------------------------------------------------------------------------------
// Création.

/**
 * Crée une partie : vallée générée (rues et trafic compris), stats et demande.
 *
 * Deux façons d'appeler :
 *   - à la main (bac à sable, tests, simulations) : `createGame({ seed, cols, rows, starterTown, money, unlocked })` ;
 *   - par un niveau de carrière (docs/ARCHITECTURE.md §11.1) : `createGame({ level })` — la graine, la
 *     taille, la carte, l'argent de départ et le catalogue débloqué viennent du niveau, et la vallée est
 *     **vierge** (la seule mairie) sauf si le niveau demande `starterTown`. Une option passée
 *     explicitement l'emporte sur le niveau (`createGame({ level, unlocked })` : le catalogue cumulé de
 *     la carrière, voir `startLevel` dans src/core/career.js).
 *
 * @param {{ seed?, cols?, rows?, map?, starterTown?: boolean, money?: number, unlocked?: string[], level?: object }} options
 */
export function createGame(options = {}) {
  const level = options.level || null;
  const seed = options.seed ?? (level ? level.seed : 1);
  const cols = options.cols ?? (level ? level.cols : undefined);
  const rows = options.rows ?? (level ? level.rows : undefined);
  const map = options.map ?? (level && level.map) ?? 'valley';
  // Hors niveau, la ville de départ reste le défaut (bac à sable) ; en carrière, on arrive sur une
  // vallée vierge avec la seule mairie.
  const starterTown = options.starterTown ?? (level ? Boolean(level.starterTown) : true);
  const money = options.money ?? (level && Number.isFinite(level.money) ? level.money : START_MONEY);
  const unlocked = options.unlocked ?? (level && Array.isArray(level.unlock) ? level.unlock : START_UNLOCKED);
  const world = generateWorld({ seed, cols, rows, map, starterTown });
  let capacity = 0;
  for (const t of world.tiles) capacity += residentsOfTile(t);
  const game = {
    version: GAME_VERSION,
    seed,
    mode: 'career',
    journey: { claimed: [] },
    levelId: level ? level.id : null,
    world,
    eco: createEcology(world),
    clock: 0,
    month: 0,
    speed: 1,
    money,
    population: starterTown ? Math.round(capacity * START_OCCUPANCY) : 0,
    stats: null,
    demand: null,
    unlocked: Array.from(unlocked),
    natureBaseline: countNativeNature(world),
    streaks: { unhappy: 0, broke: 0 },
    // Faits marquants de la partie, lus par les objectifs de carrière (§11.1) : nombre de mois où des
    // habitants sont partis (une étoile demande « sans exode »).
    flags: { exodusMonths: 0 },
    log: [],
    undo: null,
  };
  return withStats(game);
}

// ---------------------------------------------------------------------------------------------
// Temps.

/**
 * Avance l'horloge de `dt × speed` secondes et joue les mois franchis (au plus MAX_TICKS_PER_ADVANCE ;
 * au-delà, le reste du temps est abandonné et un événement `info` le signale).
 * @returns {{ game, events }}
 */
export function advance(game, dtSeconds) {
  if (!(dtSeconds > 0) || !(game.speed > 0)) return { game, events: [] };
  let clock = game.clock + dtSeconds * game.speed;
  let next = game;
  const events = [];
  let ticks = 0;
  while (clock >= MONTH_SECONDS) {
    if (ticks >= MAX_TICKS_PER_ADVANCE) {
      clock %= MONTH_SECONDS;
      const info = event('info', next.month, `Le temps a filé : seuls ${MAX_TICKS_PER_ADVANCE} mois ont été simulés d’un coup, le reste est passé sans bilan.`);
      events.push(info);
      next = { ...next, log: appendLog(next.log, [info]) };
      break;
    }
    clock -= MONTH_SECONDS;
    const r = monthTick(next);
    next = r.game;
    for (const e of r.events) events.push(e);
    ticks++;
  }
  return { game: { ...next, clock }, events };
}

/** Texte d'évolution d'un bâtiment. */
function evolveText(def, level) {
  if (def.id === 'house') {
    return level === 2
      ? 'Un quartier grandit : des immeubles bas remplacent les maisons.'
      : 'Un quartier prospère : de grands immeubles s’élèvent.';
  }
  if (def.id === 'shop') return 'Un commerce prospère et s’agrandit.';
  if (def.id === 'office') return 'Des bureaux s’agrandissent.';
  return `${def.label} passe au niveau ${level}.`;
}

/** Conditions de la prochaine évolution d'une case : [{ label, met }], ou [] si elle n'évolue plus. */
function evolutionConditions(world, x, y, penalties, eco = null) {
  const t = tileAt(world, x, y);
  if (!t || !t.building) return { nextLevel: null, conditions: [] };
  const def = TILE_BY_ID[t.building.type];
  const rules = EVOLUTION[t.building.type];
  const nextLevel = (t.building.level || 1) + 1;
  if (!def || !rules || !rules[nextLevel] || nextLevel > def.levels) return { nextLevel: null, conditions: [] };
  const rule = rules[nextLevel];
  const conditions = [];
  if (Number.isFinite(rule.happiness)) {
    conditions.push({ label: `Bonheur local ≥ ${rule.happiness}`, met: localHappiness(world, x, y, penalties, eco) >= rule.happiness });
  }
  for (const req of rule.requires) {
    conditions.push({ label: req.label, met: countSources(world, x, y, req) >= (req.count || 1) });
  }
  return { nextLevel, conditions };
}

/**
 * Le bilan d'un mois qui s'achève : caisse (recettes − entretien du mois), arrivées ou départs, puis, en fin
 * de saison, évolutions, déblocages et événement `season` (et `year` en fin d'année) ; faillite signalée
 * quand le trésor reste sous BROKE_THRESHOLD deux saisons de suite.
 * @returns {{ game, events }}
 */
export function monthTick(game) {
  const month = game.month;
  const cal = calendar(game);
  const events = [];

  // 0. L'écologie d'abord (§10.2) : les statistiques du mois lisent l'air, l'eau, la faune et les sols
  // qui viennent d'être recalculés. `game.eco` est avancé sur place et rendu tel quel.
  const eco = game.eco || null;
  const ecoEvents = [];
  if (eco) {
    const pass = stepEcology(eco, game.world, { month, season: cal.season, rng: createRng(game.seed, `eco/${month}`) });
    for (const e of pass.events) ecoEvents.push({ ...e, month });
  }
  const stats = computeStats({ ...game, eco });

  // 1. La caisse.
  const net = stats.income - stats.upkeep;
  const money = game.money + net;
  events.push(event('month', month, `${capitalize(cal.monthLabel)} : ${signed(net)} $ (recettes ${stats.income} $, entretien ${stats.upkeep} $).`));
  for (const e of ecoEvents) events.push(e);

  // 2. Les habitants : exode par lassitude, puis exode écologique (§7.3), sinon arrivées.
  let population = Math.min(game.population, stats.capacity);
  let departed = false;
  const unhappy = stats.happiness < HAPPINESS_EXODUS ? game.streaks.unhappy + 1 : 0;
  // §5.1 et §7.3 : les quartiers dont l'air dépasse le seuil perdent des habitants, et une santé trop
  // basse vide toute la ville.
  const choking = eco ? pollutedShare(eco, game.world, ECO_EXODUS_AIR) : 0;
  const sick = Boolean(eco) && stats.health < ECO_EXODUS_HEALTH;
  const ecoExodus = Boolean(eco) && (choking > 0 || sick);
  if (unhappy >= EXODUS_MONTHS && population > 0) {
    const departures = Math.min(population, Math.max(1, Math.round(population * EXODUS_RATE)));
    population -= departures;
    departed = true;
    events.push(event('departures', month, departures === 1
      ? 'Un habitant quitte la vallée, lassé d’attendre mieux.'
      : `${departures} habitants quittent la vallée, lassés d’attendre mieux.`));
  } else if (ecoExodus && population > 0) {
    const rate = ECO_EXODUS_RATE * Math.max(sick ? 1 : 0, choking);
    const departures = Math.min(population, Math.max(1, Math.round(population * rate)));
    population -= departures;
    departed = true;
    const why = choking > 0 ? 'l’air y est devenu irrespirable' : 'la santé se dégrade';
    events.push(event('departures', month, departures === 1
      ? `Un habitant s’en va : ${why}.`
      : `${departures} habitants s’en vont : ${why}.`));
  } else if (stats.happiness >= HAPPINESS_ARRIVALS && population < stats.capacity) {
    const gap = stats.capacity - population;
    const arrivals = Math.min(gap, Math.max(ARRIVAL_MIN, Math.round(gap * ARRIVAL_RATE)));
    population += arrivals;
    events.push(event('arrivals', month, arrivals === 1
      ? 'Un nouvel habitant s’installe.'
      : `${arrivals} nouveaux habitants s’installent.`));
  }

  let next = { ...game, eco, money, population, month: month + 1 };
  let world = game.world;
  let unlocked = game.unlocked;

  // 3. Fin de saison : évolutions, déblocages, bilan.
  if (isSeasonEnd(month)) {
    const current = computeStats({ ...next, world });
    const penalties = penaltiesOf(current);
    const evolutions = [];
    for (let y = 0; y < world.rows; y++) {
      for (let x = 0; x < world.cols; x++) {
        const { nextLevel, conditions } = evolutionConditions(world, x, y, penalties, eco);
        if (nextLevel && conditions.every((c) => c.met)) evolutions.push({ x, y, level: nextLevel });
      }
    }
    if (evolutions.length > 0) {
      world = cloneWorld(world);
      for (const e of evolutions) {
        const b = world.tiles[index(world, e.x, e.y)].building;
        b.level = e.level;
        events.push(event('evolve', month, evolveText(TILE_BY_ID[b.type], e.level), { x: e.x, y: e.y, level: e.level }));
      }
    }
    for (const u of UNLOCKS) {
      if (population < u.population) continue;
      for (const id of u.tiles) {
        if (unlocked.includes(id) || !TILE_BY_ID[id]) continue;
        unlocked = unlocked.concat(id);
        events.push(event('unlock', month, `Nouveau au catalogue : ${TILE_BY_ID[id].label}.`, { tileId: id }));
      }
    }
  }

  if (world !== game.world && eco) syncEcology(eco, world);
  next = withStats({ ...next, world, unlocked });

  if (isSeasonEnd(month)) {
    events.push(event('season', month, `${SEASON_END_LABELS[cal.season]} : ${next.stats.population} ${plural(next.stats.population, 'habitant', 'habitants')}, bonheur ${next.stats.happiness}/100.`));
    if (isYearEnd(month)) {
      events.push(event('year', month, `L’année ${cal.year} s’achève : ${next.stats.population} ${plural(next.stats.population, 'habitant vit', 'habitants vivent')} dans la vallée.`));
    }
  }

  // 4. Faillite.
  const broke = money < BROKE_THRESHOLD ? game.streaks.broke + 1 : 0;
  if (broke >= BROKE_MONTHS && (broke - BROKE_MONTHS) % 3 === 0) {
    events.push(event('broke', month, 'Les caisses sont à sec depuis deux saisons : la commune est en faillite.'));
  }

  next.streaks = { unhappy, broke };
  // Faits marquants (§11.1) : un mois de départs de plus ferme la porte à l'étoile « sans exode ».
  next.flags = { ...(game.flags || { exodusMonths: 0 }), exodusMonths: (game.flags?.exodusMonths || 0) + (departed ? 1 : 0) };
  next.log = appendLog(game.log, events);
  return { game: next, events };
}

// ---------------------------------------------------------------------------------------------
// Pose.

/**
 * Coût des segments d'un tracé de raccordement : seules les arêtes encore nues se paient (rue 10 $,
 * pont 40 $) ; une arête déjà équipée (chemin, rue, pont) est réutilisée gratuitement.
 * @returns {{ street: number, bridge: number, cost: number }}
 */
export function roadCostOfPath(world, path) {
  let street = 0;
  let bridge = 0;
  for (const ref of path) {
    if (edgeValue(world, ref) >= EDGE.PATH) continue;
    if (ref.value === EDGE.BRIDGE) bridge++;
    else street++;
  }
  return { street, bridge, cost: street * STREET_SEGMENT_COST + bridge * BRIDGE_SEGMENT_COST };
}

/**
 * Peut-on poser `tileId` en (x, y) ?
 * @returns {{ ok: true, cost, price, clearing, path, road: { street, bridge, cost }, reason: null }
 *          | { ok: false, reason: 'out_of_bounds' | 'locked' | 'occupied' | 'terrain' | 'unreachable' | 'money', cost?, clearing?, path?, price? }}
 * `cost` = prix + défrichement + segments de rue ; `path` : arêtes du raccordement (vide si la case touche déjà le réseau).
 */
export function canPlace(game, x, y, tileId) {
  const { world } = game;
  if (!inBounds(world, x, y)) return { ok: false, reason: 'out_of_bounds' };
  const def = TILE_BY_ID[tileId];
  if (!def || def.buyable === false || !game.unlocked.includes(tileId)) return { ok: false, reason: 'locked' };
  const tile = tileAt(world, x, y);
  if (tile.building) return { ok: false, reason: 'occupied' };
  if (!def.terrains.includes(tile.terrain)) return { ok: false, reason: 'terrain' };
  if (def.requires && def.requires.adjacent) {
    const near = neighbors4(world, x, y).some((n) => def.requires.adjacent.includes(tileAt(world, n.x, n.y).terrain));
    if (!near) return { ok: false, reason: 'terrain' };
  }
  let clearing = 0;
  if (tile.native) {
    const c = def.clearing && Number.isFinite(def.clearing[tile.terrain]) ? def.clearing[tile.terrain] : TERRAINS[tile.terrain].clearingCost;
    if (c === null || c === undefined) return { ok: false, reason: 'terrain' };
    clearing = c;
  }
  let path = [];
  let road = { street: 0, bridge: 0, cost: 0 };
  let yaw = 0;
  if (isUrbanFamily(def.family)) {
    const c = connectTile(world, x, y);
    if (!c.ok) return { ok: false, reason: 'unreachable', price: def.price, clearing };
    path = c.path;
    yaw = c.yaw;
    road = roadCostOfPath(world, path);
  }
  const cost = def.price + clearing + road.cost;
  if (game.money < cost) return { ok: false, reason: 'money', cost, price: def.price, clearing, path, road, yaw };
  return { ok: true, cost, price: def.price, clearing, path, road, yaw, reason: null };
}

function placedText(def, cost) {
  switch (def.family) {
    case 'habitat': return `Un nouveau quartier s’installe (${cost} $).`;
    case 'activity': return `${def.label} : les portes s’ouvrent (${cost} $).`;
    case 'services': return `${def.label} : au service des habitants (${cost} $).`;
    case 'infrastructure': return `${def.label} en service (${cost} $).`;
    default: return `${def.label} : la vallée respire (${cost} $).`;
  }
}

/**
 * Pose une tuile : terrain changé pour les natures qui le demandent (`terrainAfter`, `native: false`),
 * tracé de raccordement appliqué, rues reconstruites, trafic recalculé, bâtiment orienté vers sa rue,
 * argent débité, annulation mémorisée (UNDO_SECONDS secondes réelles à partir de `nowSeconds`).
 * @returns {{ ok: true, game, cost, events } | { ok: false, reason, game, cost: 0, events: [] }}
 */
export function place(game, x, y, tileId, nowSeconds = Date.now() / 1000) {
  const check = canPlace(game, x, y, tileId);
  if (!check.ok) return { ok: false, reason: check.reason, game, cost: 0, events: [] };
  const def = TILE_BY_ID[tileId];
  let world = cloneWorld(game.world);
  const i = index(world, x, y);
  const tile = world.tiles[i];
  if (def.terrainAfter) {
    tile.terrain = def.terrainAfter;
    tile.flow = null;
  }
  tile.native = false;
  tile.building = { type: tileId, level: 1, variant: hashSeed(game.seed, `${game.month}:${x}:${y}:${tileId}`) % def.models[1].length, yaw: check.yaw || 0 };
  if (check.path.length > 0) world = applyPath(world, check.path);
  world = rebuildRoads(world);
  if (isBuiltTile(world.tiles[i])) world.tiles[i].building.yaw = check.yaw ?? faceTowardRoad(world, x, y, centerOf(world));
  world = computeTraffic(world);

  const events = [event('placed', game.month, placedText(def, check.cost), { x, y, tileId, cost: check.cost })];
  if (check.road.bridge > 0) events.push(event('info', game.month, 'Un pont enjambe la rivière.', { x, y }));
  // L'écologie suit le nouveau monde : copie (la pose rend une partie indépendante, comme pour le monde),
  // parcelles recalculées, fertilité d'un champ neuf initialisée.
  const eco = game.eco ? syncEcology(cloneEcology(game.eco), world) : null;
  const next = withStats({
    ...game,
    eco,
    world,
    money: game.money - check.cost,
    undo: { game: snapshotOf(game), until: nowSeconds + UNDO_SECONDS, cost: check.cost, x, y, month: game.month },
  });
  next.log = appendLog(game.log, events);
  return { ok: true, game: next, cost: check.cost, events };
}

// ---------------------------------------------------------------------------------------------
// Démolition.

/** Retire les rues en impasse (coin libre de tout îlot, une seule arête équipée), jusqu'à stabilité. */
function pruneDeadEnds(world) {
  const protectedCorners = new Uint8Array((world.cols + 1) * (world.rows + 1));
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      if (!isBuiltTile(tileAt(world, x, y))) continue;
      for (const [cx, cy] of [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]) protectedCorners[cy * (world.cols + 1) + cx] = 1;
    }
  }
  const degree = () => {
    const d = new Uint16Array(protectedCorners.length);
    for (let y = 0; y <= world.rows; y++) {
      for (let x = 0; x < world.cols; x++) {
        if (world.edges.h[y * world.cols + x] >= EDGE.PATH) { d[y * (world.cols + 1) + x]++; d[y * (world.cols + 1) + x + 1]++; }
      }
    }
    for (let y = 0; y < world.rows; y++) {
      for (let x = 0; x <= world.cols; x++) {
        if (world.edges.v[y * (world.cols + 1) + x] >= EDGE.PATH) { d[y * (world.cols + 1) + x]++; d[(y + 1) * (world.cols + 1) + x]++; }
      }
    }
    return d;
  };
  let changed = true;
  let next = world;
  while (changed) {
    changed = false;
    const d = degree();
    const removable = (c) => !protectedCorners[c] && d[c] === 1;
    for (let y = 0; y <= next.rows; y++) {
      for (let x = 0; x < next.cols; x++) {
        const i = y * next.cols + x;
        if (next.edges.h[i] >= EDGE.STREET && (removable(y * (next.cols + 1) + x) || removable(y * (next.cols + 1) + x + 1))) {
          if (next === world) next = cloneWorld(world);
          next.edges.h[i] = EDGE.NONE;
          changed = true;
        }
      }
    }
    for (let y = 0; y < next.rows; y++) {
      for (let x = 0; x <= next.cols; x++) {
        const i = y * (next.cols + 1) + x;
        if (next.edges.v[i] >= EDGE.STREET && (removable(y * (next.cols + 1) + x) || removable((y + 1) * (next.cols + 1) + x))) {
          if (next === world) next = cloneWorld(world);
          next.edges.v[i] = EDGE.NONE;
          changed = true;
        }
      }
    }
    world = next;
  }
  return world;
}

/**
 * Démolit la case (x, y) : DEMOLISH_COST $, le terrain redevient de l'herbe (`native: false`), les rues
 * de ceinture devenues inutiles disparaissent (le réseau reste relié), le trafic est recalculé. La mairie
 * est indestructible. L'annulation en attente est oubliée.
 * @returns {{ ok: true, game, cost, events } | { ok: false, reason: 'out_of_bounds' | 'empty' | 'protected', game, cost: 0, events: [] }}
 */
export function demolish(game, x, y) {
  const fail = (reason) => ({ ok: false, reason, game, cost: 0, events: [] });
  if (!inBounds(game.world, x, y)) return fail('out_of_bounds');
  const tile = tileAt(game.world, x, y);
  if (!tile.building) return fail('empty');
  if (tile.building.type === 'townhall') return fail('protected');
  const def = TILE_BY_ID[tile.building.type];

  let world = cloneWorld(game.world);
  const t = world.tiles[index(world, x, y)];
  t.building = null;
  t.terrain = 'grass';
  t.flow = null;
  t.native = false;
  world = rebuildRoads(world);
  // Chaque rue de ceinture de la case est retirée si le réseau reste relié sans elle.
  for (const ref of Object.values(edgesOfTile(world, x, y))) {
    if (edgeValue(world, ref) < EDGE.STREET) continue;
    const trial = cloneWorld(world);
    trial.edges[ref.kind][ref.index] = EDGE.NONE;
    const rebuilt = rebuildRoads(trial);
    if (networkConnected(rebuilt)) world = rebuilt;
  }
  world = computeTraffic(pruneDeadEnds(world));

  const label = def ? def.label : tile.building.type;
  const events = [event('demolished', game.month, `${label} : démolition, la case redevient de l’herbe (${DEMOLISH_COST} $).`, { x, y, cost: DEMOLISH_COST })];
  const eco = game.eco ? syncEcology(cloneEcology(game.eco), world) : null;
  const next = withStats({ ...game, eco, world, money: game.money - DEMOLISH_COST, undo: null });
  next.log = appendLog(game.log, events);
  return { ok: true, game: next, cost: DEMOLISH_COST, events };
}

/**
 * Change la conduite d'un champ (§5.4) : `intensive` (rend 1,5 × F/100, épuise la terre de 2 par mois),
 * `organic` (0,9 × F/100, × 1,2 avec des abeilles, rend 1 point de fertilité par mois) ou `fallow`
 * (jachère : aucun rendement, 4 points de fertilité par mois). Gratuit et réversible.
 * @returns {{ ok: true, game, events } | { ok: false, reason: 'out_of_bounds' | 'not_a_field' | 'mode', game, events: [] }}
 */
export function setFieldMode(game, x, y, mode) {
  const fail = (reason) => ({ ok: false, reason, game, events: [] });
  if (!inBounds(game.world, x, y)) return fail('out_of_bounds');
  if (!FIELD_MODE_LABELS[mode]) return fail('mode');
  const tile = tileAt(game.world, x, y);
  if (!tile.building || tile.building.type !== 'field') return fail('not_a_field');
  if ((tile.building.mode || ECO_FIELD_MODE) === mode) return { ok: true, game, events: [] };
  const world = cloneWorld(game.world);
  world.tiles[index(world, x, y)].building.mode = mode;
  const eco = game.eco ? syncEcology(cloneEcology(game.eco), world) : null;
  const events = [event('info', game.month, `Le champ passe ${FIELD_MODE_LABELS[mode]}.`, { x, y, mode })];
  const next = withStats({ ...game, world, eco });
  next.log = appendLog(game.log, events);
  return { ok: true, game: next, events };
}

// ---------------------------------------------------------------------------------------------
// Annulation, vitesse.

/**
 * Annule la dernière pose si la fenêtre est encore ouverte (`nowSeconds` ≤ `undo.until`) : le monde
 * d'avant est rétabli et la pose intégralement remboursée ; l'horloge, le mois et la caisse des mois
 * écoulés entre-temps sont conservés. Rend null si rien n'est annulable.
 */
export function undoLast(game, nowSeconds = Date.now() / 1000) {
  const u = game.undo;
  if (!u || !u.game || nowSeconds > u.until) return null;
  const snap = u.game;
  const world = cloneWorld(snap.world);
  const restored = withStats({
    ...game,
    world,
    eco: snap.eco ? syncEcology(cloneEcology(snap.eco), world) : createEcology(world),
    unlocked: Array.from(snap.unlocked),
    natureBaseline: snap.natureBaseline,
    money: game.money + u.cost,
    undo: null,
  });
  restored.log = game.log.filter((e) => !((e.type === 'placed' || e.type === 'info') && e.x === u.x && e.y === u.y && e.month === u.month));
  return restored;
}

/** Fixe la vitesse (une valeur de SPEEDS). */
export function setSpeed(game, speed) {
  if (!SPEEDS.includes(speed)) throw new Error(`Vitesse inconnue : ${speed} (attendu : ${SPEEDS.join(', ')})`);
  return speed === game.speed ? game : { ...game, speed };
}

/** Vitesse suivante du cycle 0 → ½ → 1 → 2 → 4 → 0. */
export function cycleSpeed(game) {
  const i = SPEEDS.indexOf(game.speed);
  return { ...game, speed: SPEEDS[(i + 1) % SPEEDS.length] };
}

// ---------------------------------------------------------------------------------------------
// Fiche d'une case.

/**
 * Fiche d'une case pour l'interface.
 * @returns {{ x, y, terrain, terrainLabel, native, buildable, clearing,
 *   building: { type, label, level, levelLabel, maxLevel, family, familyLabel, yaw } | null,
 *   conditions: Array<{ label, met }>, nextLevel: number | null,
 *   yields: { income, upkeep, jobs, capacity, residents, energy, water, food } (recette et entretien par saison,
 *     comme le catalogue ; energy / water / food : bilan net de la tuile, + produit, − consommé),
 *   happiness: number | null (bonheur local d'un quartier), adjacency: Array<{ id, label, value }>,
 *   eco: { air, water, fauna, soil, habitat, patch, fieldMode, species: string[] } | null } | null}
 */
export function describeTile(game, x, y) {
  const { world } = game;
  if (!inBounds(world, x, y)) return null;
  const tile = tileAt(world, x, y);
  const terrain = TERRAINS[tile.terrain];
  const out = {
    x,
    y,
    terrain: tile.terrain,
    terrainLabel: terrain ? terrain.label : tile.terrain,
    native: tile.native,
    buildable: Boolean(terrain && terrain.buildable),
    clearing: tile.native && terrain ? terrain.clearingCost : 0,
    building: null,
    conditions: [],
    nextLevel: null,
    yields: { income: 0, upkeep: 0, jobs: 0, capacity: 0, residents: 0, energy: 0, water: 0, food: 0 },
    happiness: null,
    adjacency: [],
    eco: game.eco ? describeEcology(game.eco, world, x, y) : null,
  };
  if (!tile.building) return out;
  const def = TILE_BY_ID[tile.building.type];
  const level = tile.building.level || 1;
  if (!def) {
    out.building = { type: tile.building.type, label: tile.building.type, level, levelLabel: tile.building.type, maxLevel: level, family: null, familyLabel: null, yaw: tile.building.yaw };
    return out;
  }
  const stats = game.stats || computeStats(game);
  const info = levelInfo(def, level);
  out.building = {
    type: def.id,
    label: def.label,
    level,
    levelLabel: info.label || def.label,
    maxLevel: def.levels,
    family: def.family,
    familyLabel: FAMILY_LABEL[def.family] || def.family,
    yaw: tile.building.yaw,
  };
  const capacity = residentsOfTile(tile);
  // Champs et vergers : la fiche montre le rendement réel (fertilité × pollinisation × haies).
  const factor = game.eco && FIELD_TYPES.includes(def.id) ? fieldYieldOf(game.eco, world, index(world, x, y)) : 1;
  out.yields = {
    income: Math.round(incomeOf(def, level) * factor),
    upkeep: upkeepOf(def, level),
    jobs: jobsOfTile(tile),
    capacity,
    residents: Math.round(capacity * (stats.capacity > 0 ? stats.population / stats.capacity : 0)),
    // Bilan net de la tuile par ressource (+ produit, − consommé à pleine capacité).
    energy: (def.produce.energy || 0) - (def.consume.energy || 0),
    water: (def.produce.water || 0) - (def.consume.water || 0),
    food: round1((def.produce.food || 0) * factor) - (def.consume.food || 0),
  };
  const penalties = penaltiesOf(stats);
  if (def.family === 'habitat') {
    out.happiness = localHappiness(world, x, y, penalties, game.eco);
    out.adjacency = adjacencyOf(world, x, y).details;
  }
  const evo = evolutionConditions(world, x, y, penalties, game.eco);
  out.nextLevel = evo.nextLevel;
  out.conditions = evo.conditions;
  return out;
}

// ---------------------------------------------------------------------------------------------
// Sauvegarde.

/**
 * Objet JSON de la partie (tableaux typés → tableaux ; l'annulation, liée aux secondes réelles, n'est pas
 * sauvée). Version 2 : l'écologie (`eco`) voyage avec, ses parcelles étant recalculées à la relecture.
 */
export function serialize(game) {
  const w = game.world;
  return {
    version: GAME_VERSION,
    seed: game.seed,
    levelId: game.levelId ?? null,
    clock: game.clock,
    month: game.month,
    speed: game.speed,
    money: game.money,
    population: game.population,
    streaks: { ...game.streaks },
    flags: { ...(game.flags || { exodusMonths: 0 }) },
    unlocked: Array.from(game.unlocked),
    natureBaseline: game.natureBaseline,
    mode: game.mode || 'career',
    career: game.career ? structuredClone(game.career) : null,
    journey: structuredClone(game.journey || {claimed: []}),
    log: game.log.map((e) => ({ ...e })),
    undo: null,
    stats: structuredClone(game.stats),
    demand: structuredClone(game.demand),
    eco: game.eco ? serializeEcology(game.eco) : null,
    world: {
      ...w,
      tiles: w.tiles.map(cloneTile),
      edges: { h: Array.from(w.edges.h), v: Array.from(w.edges.v) },
      avenues: w.avenues ? { h: Array.from(w.avenues.h), v: Array.from(w.avenues.v) } : null,
      traffic: w.traffic ? { h: Array.from(w.traffic.h), v: Array.from(w.traffic.v) } : null,
    },
  };
}

/**
 * Relit une sauvegarde (`serialize`). Version inconnue ou contenu incohérent → erreur explicite.
 * Une sauvegarde de version 1 (avant l'écologie) est migrée : l'écologie est recalculée de zéro à partir
 * du monde relu, et la jauge Nature cesse d'être la formule provisoire de l'étape 3.
 */
export function deserialize(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Sauvegarde illisible : ce n’est pas un objet.');
  if (!SAVE_VERSIONS.includes(obj.version)) {
    throw new Error(`Sauvegarde d’une version inconnue (${obj.version}) : seules les versions ${SAVE_VERSIONS.join(' et ')} sont lisibles.`);
  }
  const w = obj.world;
  if (!w || !Number.isInteger(w.cols) || !Number.isInteger(w.rows) || !Array.isArray(w.tiles)) {
    throw new Error('Sauvegarde incohérente : monde absent ou mal formé.');
  }
  if (w.tiles.length !== w.cols * w.rows) throw new Error('Sauvegarde incohérente : nombre de cases inattendu.');
  const hLen = (w.rows + 1) * w.cols;
  const vLen = w.rows * (w.cols + 1);
  if (!w.edges || !Array.isArray(w.edges.h) || !Array.isArray(w.edges.v) || w.edges.h.length !== hLen || w.edges.v.length !== vLen) {
    throw new Error('Sauvegarde incohérente : rues mal formées.');
  }
  for (const t of w.tiles) {
    if (!t || !TERRAINS[t.terrain]) throw new Error(`Sauvegarde incohérente : terrain inconnu (${t && t.terrain}).`);
  }
  let world = {
    ...w,
    tiles: w.tiles.map((t) => ({ terrain: t.terrain, flow: t.flow ?? null, native: Boolean(t.native), building: t.building ? { ...t.building } : null })),
    edges: { h: Uint8Array.from(w.edges.h), v: Uint8Array.from(w.edges.v) },
    avenues: w.avenues?.h?.length === hLen && w.avenues?.v?.length === vLen
      ? { h: Uint8Array.from(w.avenues.h), v: Uint8Array.from(w.avenues.v) } : createEdges(w.cols, w.rows),
    traffic: w.traffic && Array.isArray(w.traffic.h) && w.traffic.h.length === hLen && Array.isArray(w.traffic.v) && w.traffic.v.length === vLen
      ? { h: Float32Array.from(w.traffic.h), v: Float32Array.from(w.traffic.v) }
      : createTraffic(w.cols, w.rows),
  };
  const migratedRoads = world.roadVersion !== ROAD_VERSION;
  if (migratedRoads) world = computeTraffic(rebuildRoads(world, { reset: true, connect: true }));
  else if (!w.traffic) world = computeTraffic(world);
  // Version 1 : aucune écologie sauvée, tout est recalculé (migration).
  const eco = obj.version >= 2 && obj.eco ? reviveEcology(obj.eco, world) : createEcology(world);
  if (migratedRoads) syncEcology(eco, world);
  const game = {
    version: GAME_VERSION,
    mode: obj.mode === 'sandbox' ? 'sandbox' : 'career',
    ...(obj.career ? {career: structuredClone(obj.career)} : {}),
    journey: obj.journey && Array.isArray(obj.journey.claimed) ? structuredClone(obj.journey) : {claimed: []},
    seed: obj.seed ?? world.seed ?? 1,
    levelId: typeof obj.levelId === 'string' ? obj.levelId : null,
    world,
    eco,
    clock: Number.isFinite(obj.clock) ? obj.clock : 0,
    month: Number.isInteger(obj.month) && obj.month >= 0 ? obj.month : 0,
    speed: SPEEDS.includes(obj.speed) ? obj.speed : 1,
    money: Number.isFinite(obj.money) ? obj.money : START_MONEY,
    population: Number.isFinite(obj.population) ? obj.population : 0,
    stats: null,
    demand: null,
    unlocked: Array.isArray(obj.unlocked) ? obj.unlocked.filter((id) => TILE_BY_ID[id]) : Array.from(START_UNLOCKED),
    natureBaseline: Number.isFinite(obj.natureBaseline) ? obj.natureBaseline : countNativeNature(world),
    streaks: { unhappy: obj.streaks?.unhappy || 0, broke: obj.streaks?.broke || 0 },
    flags: { exodusMonths: obj.flags?.exodusMonths || 0 },
    log: Array.isArray(obj.log) ? obj.log.map((e) => ({ ...e })) : [],
    undo: null,
  };
  return withStats(game);
}
