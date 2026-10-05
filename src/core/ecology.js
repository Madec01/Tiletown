// Écologie : air, eau, faune, sols (docs/GAME_DESIGN.md §5 ; docs/ARCHITECTURE.md §10.1).
//
// Tout est pur au sens du projet : aucun accès au DOM, à three.js ni à l'horloge, et le monde reçu n'est
// jamais modifié. Seule exception assumée, inscrite au contrat §10.1 : **`eco` est avancé sur place**.
// Les cinq champs par case (`air`, `water`, `fauna`, `soil`) sont des `Float32Array` réutilisés d'un mois
// à l'autre : `stepEcology` rend le même objet `eco`, mis à jour, sans rien allouer dans le chemin chaud.
// Une partie copiée (annulation, sauvegarde) obtient sa propre écologie par `structuredClone`.
//
// La topologie (parcelles d'habitat, lacs, rivière dans l'ordre d'écoulement, champs) est coûteuse : elle
// n'est recalculée que quand le monde change — référence différente **ou** empreinte différente
// (`worldStamp` : terrains, bâtiments, arêtes, trafic). Elle vit dans un cache hors de `eco` (WeakMap),
// si bien qu'elle ne part pas dans les sauvegardes et qu'une copie de `eco` repart d'un cache neuf.
//
// Ordre d'une passe mensuelle (§10.1) : air, eau, parcelles et faune, sols, espèces, scores, alertes.
//
// Conventions de valeurs : `air` et `water` 0 = pur … 100 = irrespirable / polluée ; `fauna` 0 … 100 de
// biodiversité locale ; `soil` fertilité des champs 0 … 100 (ECO_SOIL_START au premier labour, 0 ailleurs).

import { index, coords, inBounds, DIRS4, DIRS8 } from './grid.js';
import { EDGE } from './roads.js';
import { seasonOf } from './calendar.js';
import { TERRAINS } from '../data/terrain.js';
import { TILES, TILE_BY_ID, isBuiltTile } from '../data/tiles.js';
import { SPECIES } from '../data/species.js';
import {
  ECO_EMIT, ECO_SINK, ECO_AIR_PER_TRAFFIC, ECO_AIR_KEEP, ECO_AIR_WIND, ECO_AIR_DECAY,
  ECO_AIR_HAPPY_THRESHOLD, ECO_AIR_HAPPY_STEP,
  ECO_WATER_OUT, ECO_WATER_IN, ECO_RIVER_CARRY, ECO_LAKE_INFLOW, ECO_GROUND_FIELD, ECO_WASTEWATER_RADIUS,
  ECO_HEDGE_WATER_FACTOR, ECO_GROUND_HEALTH_THRESHOLD, ECO_HEALTH_PER_POINT,
  ECO_FAUNA_BASE, ECO_FAUNA_SIZE_BONUS, ECO_FAUNA_SIZE_CAP, ECO_FAUNA_ROAD_MALUS, ECO_FAUNA_POLLUTION,
  ECO_FAUNA_HEDGE_BONUS, ECO_TRAFFIC_CUT, ECO_HABITAT_TARGET,
  ECO_SPECIES_LEAVE_MONTHS, ECO_SPECIES_LEAVE_RATIO, ECO_SPECIES_SCORE,
  ECO_SOIL_START, ECO_SOIL, ECO_FIELD_MODE, ECO_SOIL_EROSION, ECO_RAIN_EROSION, ECO_RAIN_CHANCE,
  ECO_POLLINATION_BONUS, ECO_POLLINATION_RADIUS, ECO_HEDGE_YIELD_FACTOR,
  ECO_NATURE_WEIGHTS, ECO_TOURISM, ECO_ALERTS,
} from '../data/balance.js';

export { SPECIES, SPECIES_BY_ID } from '../data/species.js';

/** Version du format de `eco` dans les sauvegardes (voir `serializeEcology`). */
export const ECOLOGY_VERSION = 1;

// ---------------------------------------------------------------------------------------------
// Petits outils.

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

/** Satisfaction d'un seuil « au moins » : 1 quand `value` atteint `threshold`, 0 quand rien. */
export function atLeast(value, threshold) {
  if (!(threshold > 0)) return 1;
  return clamp(value / threshold, 0, 2);
}

/**
 * Satisfaction d'un seuil « au plus » (pollution) : 1 quand `value` est à `threshold` ou mieux,
 * 0,8 quand on est 20 % au-dessus de la marge, 0 quand `value` atteint `span` (100 par défaut).
 */
export function atMost(value, threshold, span = 100) {
  if (!(span > threshold)) return value <= threshold ? 1 : 0;
  return clamp((span - value) / (span - threshold), 0, 2);
}

/** Le passage à faune : la seule construction que la faune traverse. */
export const CROSSING_TYPE = 'wildlife-crossing';

function hasCrossing(tile) {
  return Boolean(tile.building) && tile.building.type === CROSSING_TYPE;
}

/** Habitat d'une case (`forest` | `meadow` | `wetland` | `lake`), ou null : une case bâtie n'en est pas un. */
export function habitatOf(world, i) {
  const tile = world.tiles[i];
  if (isBuiltTile(tile)) return null;
  if (tile.building) {
    const def = TILE_BY_ID[tile.building.type];
    if (def && def.habitat) return def.habitat;
  }
  const terrain = TERRAINS[tile.terrain];
  return terrain ? terrain.habitat : null;
}

/**
 * Case « nature » : de quoi former un corridor. Tout ce qui n'est pas bâti et n'est pas de l'herbe nue,
 * plus les natures plantées (parc, haie, verger…) et le passage à faune, qui n'est jamais un obstacle.
 */
export function isNatureCell(world, i) {
  const tile = world.tiles[i];
  if (hasCrossing(tile)) return true;
  if (isBuiltTile(tile)) return false;
  if (tile.building) return true;
  return tile.terrain !== 'grass';
}

/** Conduite d'un champ : `intensive` | `organic` | `fallow`, ou null si la case n'est pas un champ. */
export function fieldModeOf(tile) {
  if (!tile || tile.terrain !== 'field' || isBuiltTile(tile)) return null;
  if (!tile.building) return 'fallow';
  const type = tile.building.type;
  if (type === 'orchard') return 'organic';
  if (type !== 'field') return null;
  const mode = tile.building.mode;
  return ECO_SOIL[mode] ? mode : ECO_FIELD_MODE;
}

/** Émissions d'air de la case (bâtiment seul, hors trafic). */
export function emitOf(tile) {
  if (!tile.building) return 0;
  const rule = ECO_EMIT[tile.building.type];
  if (rule === undefined) return 0;
  if (typeof rule === 'number') return rule;
  return rule[tile.building.level || 1] || 0;
}

/** Puits d'air de la case : terrain (sauf case bâtie) + bâtiment. */
export function sinkOf(world, i) {
  const tile = world.tiles[i];
  let sink = 0;
  if (!isBuiltTile(tile)) {
    const terrain = TERRAINS[tile.terrain];
    if (terrain) sink += terrain.airSink || 0;
  }
  if (tile.building) sink += ECO_SINK[tile.building.type] || 0;
  return sink;
}

function isDrain(terrain) {
  return terrain === 'river' || terrain === 'lake';
}

function isWaterTerrain(terrain) {
  const t = TERRAINS[terrain];
  return Boolean(t && t.water);
}

function dirOf(name) {
  return DIRS4.find((d) => d.dir === name) || null;
}

/** Trafic de l'arête que partagent (x, y) et son voisin (dx, dy) — sans allouer de référence d'arête. */
function sideTraffic(world, x, y, dx, dy) {
  const tr = world.traffic;
  if (!tr) return 0;
  if (dx === 1) return tr.v[y * (world.cols + 1) + x + 1];
  if (dx === -1) return tr.v[y * (world.cols + 1) + x];
  if (dy === 1) return tr.h[(y + 1) * world.cols + x];
  return tr.h[y * world.cols + x];
}

/** Valeur de l'arête que partagent (x, y) et son voisin (dx, dy). */
function sideEdge(world, x, y, dx, dy) {
  const e = world.edges;
  if (dx === 1) return e.v[y * (world.cols + 1) + x + 1];
  if (dx === -1) return e.v[y * (world.cols + 1) + x];
  if (dy === 1) return e.h[(y + 1) * world.cols + x];
  return e.h[y * world.cols + x];
}

/** Nombre d'arêtes de rue (ou de pont) autour de la case. */
function roadEdgesOf(world, x, y) {
  let n = 0;
  for (const d of DIRS4) if (sideEdge(world, x, y, d.dx, d.dy) >= EDGE.STREET) n++;
  return n;
}

/**
 * Contiguïté entre deux cases voisines par un côté : une arête à trafic ≥ ECO_TRAFFIC_CUT coupe,
 * sauf si l'une des deux cases porte un passage à faune (§5.3).
 */
function linked4(world, x, y, dx, dy) {
  const a = world.tiles[y * world.cols + x];
  const b = world.tiles[(y + dy) * world.cols + (x + dx)];
  if (hasCrossing(a) || hasCrossing(b)) return true;
  return sideTraffic(world, x, y, dx, dy) < ECO_TRAFFIC_CUT;
}

/**
 * Contiguïté en huit voisins. Une diagonale passe s'il reste au moins un détour orthogonal libre :
 * une rue continue qui sépare les deux cases bloque les deux détours.
 */
function linked8(world, x, y, dx, dy) {
  if (dx === 0 || dy === 0) return linked4(world, x, y, dx, dy);
  const route1 = linked4(world, x, y, dx, 0) && linked4(world, x + dx, y, 0, dy);
  const route2 = linked4(world, x, y, 0, dy) && linked4(world, x, y + dy, dx, 0);
  return route1 || route2;
}

// ---------------------------------------------------------------------------------------------
// Cache hors de `eco` : topologie, tableaux de travail, contexte des espèces.

const CACHE = new WeakMap();

function cacheOf(eco) {
  let c = CACHE.get(eco);
  if (!c) {
    c = { world: null, topology: null, ctx: null, scratch: {} };
    CACHE.set(eco, c);
  }
  return c;
}

/** Tableau de travail réutilisé (une seule allocation par écologie et par usage). */
function scratch(eco, key, n) {
  const s = cacheOf(eco).scratch;
  let a = s[key];
  if (!a || a.length !== n) {
    a = new Float32Array(n);
    s[key] = a;
  }
  return a;
}

const BUILDING_CODE = Object.freeze(Object.fromEntries(TILES.map((t, i) => [t.id, i + 1])));
const TERRAIN_CODE = Object.freeze(Object.fromEntries(Object.keys(TERRAINS).map((id, i) => [id, i + 1])));

/** Empreinte 32 bits du monde : terrains, bâtiments, arêtes et trafic (FNV-1a, sans allocation). */
export function worldStamp(world) {
  let h = 2166136261 >>> 0;
  const mix = (v) => {
    h = (h ^ (v | 0)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  };
  mix(world.cols);
  mix(world.rows);
  for (let i = 0; i < world.tiles.length; i++) {
    const t = world.tiles[i];
    mix(TERRAIN_CODE[t.terrain] || 0);
    mix(t.building ? (BUILDING_CODE[t.building.type] || 99) * 101 + (t.building.level || 1) * 7 + (t.building.mode === 'organic' ? 3 : t.building.mode === 'fallow' ? 5 : 1) : 0);
  }
  for (const key of ['h', 'v']) {
    const e = world.edges[key];
    const tr = world.traffic ? world.traffic[key] : null;
    for (let i = 0; i < e.length; i++) mix(e[i] * 13 + (tr ? Math.round(tr[i] * 4) : 0));
  }
  return h >>> 0;
}

/**
 * Parcelles, lacs, rivière et champs du monde.
 * @returns {{ patches, patchOf: Int32Array, group: Int32Array, habitats: Array<string|null>,
 *   lakes: Array<{ id, cells, inflows, value }>, river: number[], fields: number[], fieldSet: Set<number>,
 *   riparian: Uint8Array, habitatCells: number, byHabitat: Record<string, object[]>, stamp: number }}
 */
function buildTopology(world) {
  const n = world.tiles.length;
  const { cols, rows } = world;
  const habitats = new Array(n).fill(null);
  const nature = new Uint8Array(n);
  let habitatCells = 0;
  for (let i = 0; i < n; i++) {
    habitats[i] = habitatOf(world, i);
    if (habitats[i]) habitatCells++;
    nature[i] = isNatureCell(world, i) ? 1 : 0;
  }

  // Parcelles : cases d'habitat de même type, contiguës en huit voisins.
  const patchOf = new Int32Array(n).fill(-1);
  const patches = [];
  const queue = [];
  for (let i = 0; i < n; i++) {
    if (!habitats[i] || patchOf[i] >= 0) continue;
    const habitat = habitats[i];
    const id = patches.length;
    const cells = [];
    patchOf[i] = id;
    queue.length = 0;
    queue.push(i);
    while (queue.length > 0) {
      const cur = queue.pop();
      cells.push(cur);
      const x = cur % cols;
      const y = (cur - x) / cols;
      for (const d of DIRS8) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const j = ny * cols + nx;
        if (habitats[j] !== habitat || patchOf[j] >= 0) continue;
        if (!linked8(world, x, y, d.dx, d.dy)) continue;
        patchOf[j] = id;
        queue.push(j);
      }
    }
    cells.sort((a, b) => a - b);
    patches.push({ id, habitat, cells, size: cells.length, connectedTo: [], adjacentTo: [], group: -1, effectiveSize: cells.length });
  }

  // Composantes de nature : la chaîne de cases nature qui forme les corridors.
  const group = new Int32Array(n).fill(-1);
  let groups = 0;
  for (let i = 0; i < n; i++) {
    if (!nature[i] || group[i] >= 0) continue;
    const id = groups++;
    group[i] = id;
    queue.length = 0;
    queue.push(i);
    while (queue.length > 0) {
      const cur = queue.pop();
      const x = cur % cols;
      const y = (cur - x) / cols;
      for (const d of DIRS8) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const j = ny * cols + nx;
        if (!nature[j] || group[j] >= 0) continue;
        if (!linked8(world, x, y, d.dx, d.dy)) continue;
        group[j] = id;
        queue.push(j);
      }
    }
  }

  // Liaisons : parcelles d'une même composante de nature (corridor) et parcelles qui se touchent.
  const byGroup = new Map();
  for (const p of patches) {
    p.group = group[p.cells[0]];
    if (!byGroup.has(p.group)) byGroup.set(p.group, []);
    byGroup.get(p.group).push(p);
  }
  for (const list of byGroup.values()) {
    for (const p of list) for (const q of list) if (p !== q) p.connectedTo.push(q.id);
  }
  for (const p of patches) {
    const seen = new Set();
    for (const i of p.cells) {
      const x = i % cols;
      const y = (i - x) / cols;
      for (const d of DIRS8) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const j = ny * cols + nx;
        const other = patchOf[j];
        if (other < 0 || other === p.id || seen.has(other)) continue;
        if (!linked8(world, x, y, d.dx, d.dy)) continue;
        seen.add(other);
      }
    }
    p.adjacentTo = Array.from(seen).sort((a, b) => a - b);
  }
  // Taille utile pour les seuils : les parcelles de même habitat reliées par un corridor comptent pour une.
  for (const p of patches) {
    let size = p.size;
    for (const id of p.connectedTo) if (patches[id].habitat === p.habitat) size += patches[id].size;
    p.effectiveSize = size;
  }
  const byHabitat = {};
  for (const p of patches) (byHabitat[p.habitat] || (byHabitat[p.habitat] = [])).push(p);

  // Lacs : cases de lac contiguës par un côté, avec les cases de rivière qui s'y jettent.
  const lakeOf = new Int32Array(n).fill(-1);
  const lakes = [];
  for (let i = 0; i < n; i++) {
    if (world.tiles[i].terrain !== 'lake' || lakeOf[i] >= 0) continue;
    const id = lakes.length;
    const cells = [];
    lakeOf[i] = id;
    queue.length = 0;
    queue.push(i);
    while (queue.length > 0) {
      const cur = queue.pop();
      cells.push(cur);
      const x = cur % cols;
      const y = (cur - x) / cols;
      for (const d of DIRS4) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const j = ny * cols + nx;
        if (world.tiles[j].terrain !== 'lake' || lakeOf[j] >= 0) continue;
        lakeOf[j] = id;
        queue.push(j);
      }
    }
    cells.sort((a, b) => a - b);
    lakes.push({ id, cells, inflows: [], value: 0 });
  }

  // Rivière : graphe d'écoulement, puis tri topologique de l'amont vers l'aval.
  const river = [];
  const nextOf = new Int32Array(n).fill(-1);
  const indegree = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const tile = world.tiles[i];
    if (tile.terrain !== 'river') continue;
    river.push(i);
    const d = dirOf(tile.flow);
    if (!d) continue;
    const x = i % cols;
    const y = (i - x) / cols;
    const nx = x + d.dx;
    const ny = y + d.dy;
    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
    const j = ny * cols + nx;
    if (world.tiles[j].terrain === 'river') {
      nextOf[i] = j;
      indegree[j]++;
    } else if (lakeOf[j] >= 0) {
      lakes[lakeOf[j]].inflows.push(i);
    }
  }
  const inflowsOf = new Map();
  for (const i of river) {
    const j = nextOf[i];
    if (j < 0) continue;
    let list = inflowsOf.get(j);
    if (!list) { list = []; inflowsOf.set(j, list); }
    list.push(i);
  }
  const order = [];
  const pending = river.filter((i) => indegree[i] === 0);
  const left = Int32Array.from(indegree);
  while (pending.length > 0) {
    const i = pending.shift();
    order.push(i);
    const j = nextOf[i];
    if (j >= 0 && --left[j] === 0) pending.push(j);
  }
  // Boucle d'écoulement (monde fabriqué à la main) : on garde l'ordre des index pour rester déterministe.
  if (order.length < river.length) for (const i of river) if (!order.includes(i)) order.push(i);

  // Ripisylve : case d'eau bordée par une forêt (−ECO_WATER_IN.riparian sur l'eau).
  const riparian = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (!isWaterTerrain(world.tiles[i].terrain)) continue;
    const x = i % cols;
    const y = (i - x) / cols;
    for (const d of DIRS4) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      if (habitats[ny * cols + nx] === 'forest') { riparian[i] = 1; break; }
    }
  }

  // Champs : la fertilité ne vit que là. `farms` sont les champs cultivés (avec un bâtiment du catalogue) :
  // eux seuls comptent dans la note de fertilité, une terre en friche ne vaut pas un bon labour.
  const fields = [];
  const farms = [];
  for (let i = 0; i < n; i++) {
    if (!fieldModeOf(world.tiles[i])) continue;
    fields.push(i);
    if (world.tiles[i].building) farms.push(i);
  }

  return {
    patches, patchOf, group, habitats, habitatCells, byHabitat,
    lakes, lakeOf, river: order, inflowsOf, fields, farms, fieldSet: new Set(fields), riparian,
    stamp: 0,
  };
}

/**
 * Parcelles d'habitat contiguës (8 voisins) et leurs liaisons par corridor (docs §5.3, §10.1).
 * @returns {Array<{ id, habitat, cells: number[], size, connectedTo: number[], adjacentTo: number[], group, effectiveSize }>}
 */
export function findPatches(world) {
  return buildTopology(world).patches;
}

/**
 * Topologie à jour. Le chemin rapide suffit dans une passe (le monde ne change pas en cours de route) :
 * même référence, même topologie. Les points d'entrée publics (`stepEcology`, `syncEcology`,
 * `createEcology`) passent `force` : l'empreinte du monde est alors vérifiée, ce qui rattrape aussi un
 * monde modifié sur place (tests, outils) sans changer de référence.
 */
function topologyOf(eco, world, force = false) {
  const cache = cacheOf(eco);
  if (!force && cache.topology && cache.world === world) return cache.topology;
  const stamp = worldStamp(world);
  if (cache.topology && cache.topology.stamp === stamp) {
    // Même contenu, autre objet (monde recopié) : la topologie reste bonne, le contexte des espèces se
    // refait pour pointer sur le nouveau monde.
    cache.world = world;
    cache.ctx = null;
    return cache.topology;
  }
  const previous = cache.topology;
  const topo = buildTopology(world);
  topo.stamp = stamp;
  cache.topology = topo;
  cache.world = world;
  cache.ctx = null;
  eco.patches = topo.patches;

  // Fertilité : un champ qui vient d'être mis en culture part de ECO_SOIL_START ; une case qui n'est plus
  // un champ retombe à zéro. Sans topologie précédente (écologie neuve, sauvegarde relue), on se fie à la
  // valeur enregistrée : zéro signifie « jamais labouré ».
  for (const i of topo.fields) {
    if (previous ? !previous.fieldSet.has(i) : eco.soil[i] <= 0) eco.soil[i] = ECO_SOIL_START;
  }
  if (previous) {
    for (const i of previous.fields) if (!topo.fieldSet.has(i)) eco.soil[i] = 0;
  } else {
    for (let i = 0; i < eco.soil.length; i++) if (!topo.fieldSet.has(i)) eco.soil[i] = 0;
  }
  return topo;
}

// ---------------------------------------------------------------------------------------------
// Création, copie, sauvegarde.

/**
 * Écologie d'un monde neuf : champs par case à zéro, fertilité ECO_SOIL_START sur les champs, parcelles,
 * faune, espèces déjà présentes (sans événement) et scores calculés.
 */
export function createEcology(world) {
  const n = world.cols * world.rows;
  const eco = {
    cols: world.cols,
    rows: world.rows,
    air: new Float32Array(n),
    water: new Float32Array(n),
    fauna: new Float32Array(n),
    soil: new Float32Array(n),
    patches: [],
    species: {},
    scores: { air: 0, water: 0, fauna: 0, soil: 0, nature: 0 },
    alerts: { smog: 0, algae: 0, flood: 0, heat: 0 },
  };
  for (const def of SPECIES) eco.species[def.id] = { present: false, since: null, cells: [], below: 0 };
  topologyOf(eco, world, true);
  waterStep(eco, world);
  faunaStep(eco, world);
  speciesStep(eco, world, { month: 0, silent: true });
  scoresStep(eco, world);
  return eco;
}

/** Copie indépendante (l'écologie est le seul état avancé sur place : l'annulation en a besoin). */
export function cloneEcology(eco) {
  return structuredClone(eco);
}

/** Objet JSON de l'écologie (tableaux typés → tableaux ; les parcelles sont recalculées à la relecture). */
export function serializeEcology(eco) {
  const species = {};
  for (const [id, s] of Object.entries(eco.species)) {
    species[id] = { present: s.present, since: s.since, cells: Array.from(s.cells), below: s.below };
  }
  return {
    version: ECOLOGY_VERSION,
    cols: eco.cols,
    rows: eco.rows,
    air: Array.from(eco.air),
    water: Array.from(eco.water),
    fauna: Array.from(eco.fauna),
    soil: Array.from(eco.soil),
    species,
    scores: { ...eco.scores },
    alerts: { ...eco.alerts },
  };
}

/**
 * Relit une écologie sauvegardée au-dessus du monde relu. Tout ce qui est dérivé (parcelles, lacs, champs)
 * est recalculé ; un contenu absent, de mauvaise taille ou illisible retombe sur `createEcology`.
 */
export function reviveEcology(obj, world) {
  const eco = createEcology(world);
  if (!obj || typeof obj !== 'object') return eco;
  const n = eco.air.length;
  let ok = true;
  for (const key of ['air', 'water', 'fauna', 'soil']) {
    const src = obj[key];
    if (Array.isArray(src) && src.length === n) eco[key].set(src);
    else ok = false;
  }
  if (!ok) return eco;
  if (obj.species && typeof obj.species === 'object') {
    for (const def of SPECIES) {
      const s = obj.species[def.id];
      if (!s || typeof s !== 'object') continue;
      eco.species[def.id] = {
        present: Boolean(s.present),
        since: Number.isFinite(s.since) ? s.since : null,
        cells: Array.isArray(s.cells) ? s.cells.filter((i) => Number.isInteger(i) && i >= 0 && i < n) : [],
        below: Number.isFinite(s.below) ? s.below : 0,
      };
    }
  }
  for (const key of ['smog', 'algae', 'flood', 'heat']) {
    if (Number.isFinite(obj.alerts && obj.alerts[key])) eco.alerts[key] = obj.alerts[key];
  }
  for (const key of ['air', 'water', 'fauna', 'soil', 'nature']) {
    if (Number.isFinite(obj.scores && obj.scores[key])) eco.scores[key] = obj.scores[key];
  }
  return eco;
}

// ---------------------------------------------------------------------------------------------
// Air (§5.1).

/** Pollution de l'air ajoutée par le trafic des arêtes riveraines de la case. */
function trafficEmitOf(world, x, y) {
  if (!world.traffic) return 0;
  let t = 0;
  for (const d of DIRS4) t += sideTraffic(world, x, y, d.dx, d.dy);
  return ECO_AIR_PER_TRAFFIC * t;
}

/**
 * Une passe d'air : émissions et puits, diffusion sur les quatre voisins, vent dominant (`world.wind`,
 * la direction d'où il vient), dissipation. `eco.air` est réécrit sur place.
 */
export function airStep(eco, world) {
  const { cols, rows } = world;
  const n = world.tiles.length;
  const a1 = scratch(eco, 'air1', n);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      a1[i] = eco.air[i] + emitOf(world.tiles[i]) + trafficEmitOf(world, x, y) - sinkOf(world, i);
    }
  }
  const wind = dirOf(world.wind);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      let sum = 0;
      let count = 0;
      for (const d of DIRS4) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        sum += a1[ny * cols + nx];
        count++;
      }
      const a2 = ECO_AIR_KEEP * a1[i] + (1 - ECO_AIR_KEEP) * (count > 0 ? sum / count : a1[i]);
      let upwind = a1[i];
      if (wind) {
        const ux = x + wind.dx;
        const uy = y + wind.dy;
        if (ux >= 0 && uy >= 0 && ux < cols && uy < rows) upwind = a1[uy * cols + ux];
      }
      const a3 = a2 + ECO_AIR_WIND * (upwind - a1[i]);
      eco.air[i] = clamp(ECO_AIR_DECAY * a3, 0, 100);
    }
  }
  return eco;
}

// ---------------------------------------------------------------------------------------------
// Eau (§5.2).

/** Vrai si une station d'épuration est à moins de ECO_WASTEWATER_RADIUS cases (Chebyshev). */
function hasWastewaterNear(world, x, y) {
  const r = ECO_WASTEWATER_RADIUS;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= world.cols || ny >= world.rows) continue;
      const b = world.tiles[ny * world.cols + nx].building;
      if (b && b.type === 'wastewater') return true;
    }
  }
  return false;
}

function hasNeighborType(world, x, y, type) {
  for (const d of DIRS4) {
    const nx = x + d.dx;
    const ny = y + d.dy;
    if (nx < 0 || ny < 0 || nx >= world.cols || ny >= world.rows) continue;
    const b = world.tiles[ny * world.cols + nx].building;
    if (b && b.type === type) return true;
  }
  return false;
}

/** Rejets de la case dans l'eau (§5.2) : usine, quartier non raccordé, champ selon sa conduite. */
export function dischargeOf(world, i) {
  const tile = world.tiles[i];
  const x = i % world.cols;
  const y = (i - x) / world.cols;
  const mode = fieldModeOf(tile);
  if (mode) {
    const base = ECO_WATER_OUT.field[mode] || 0;
    if (base === 0) return 0;
    return hasNeighborType(world, x, y, 'hedge') ? base * ECO_HEDGE_WATER_FACTOR : base;
  }
  if (!tile.building) return 0;
  const type = tile.building.type;
  if (type === 'factory') return ECO_WATER_OUT.factory;
  if (type === 'orchard') return ECO_WATER_OUT.orchard;
  if (type === 'house') return hasWastewaterNear(world, x, y) ? 0 : ECO_WATER_OUT.house;
  return 0;
}

/** Dépollution que la case apporte à l'eau voisine : station d'épuration, zone humide, ripisylve. */
function cleanupOf(world, i) {
  const tile = world.tiles[i];
  if (tile.building && tile.building.type === 'wastewater') return ECO_WATER_IN.wastewater;
  if (isBuiltTile(tile)) return 0;
  if (tile.terrain === 'wetland') return ECO_WATER_IN.wetland;
  if (habitatOf(world, i) === 'forest') return ECO_WATER_IN.riparian;
  return 0;
}

/** Les cases d'eau « conduites » (rivière, lac) voisines de (x, y). */
function forEachDrain(world, x, y, fn) {
  let count = 0;
  for (const d of DIRS4) {
    const nx = x + d.dx;
    const ny = y + d.dy;
    if (nx < 0 || ny < 0 || nx >= world.cols || ny >= world.rows) continue;
    if (isDrain(world.tiles[ny * world.cols + nx].terrain)) count++;
  }
  if (count === 0) return 0;
  for (const d of DIRS4) {
    const nx = x + d.dx;
    const ny = y + d.dy;
    if (nx < 0 || ny < 0 || nx >= world.cols || ny >= world.rows) continue;
    const j = ny * world.cols + nx;
    if (isDrain(world.tiles[j].terrain)) fn(j, count);
  }
  return count;
}

/**
 * Une passe d'eau : rejets et dépollution vers les cases d'eau voisines, transport de l'amont vers l'aval
 * dans la rivière, accumulation et sédimentation des lacs, puis la nappe (moyenne locale) sur les autres
 * cases ; les zones humides filtrent ce qu'elles reçoivent. `eco.water` est réécrit sur place.
 */
export function waterStep(eco, world) {
  const topo = topologyOf(eco, world);
  const { cols, rows } = world;
  const n = world.tiles.length;
  const out = scratch(eco, 'wOut', n);
  const inn = scratch(eco, 'wIn', n);
  const land = scratch(eco, 'wLand', n);
  out.fill(0);
  inn.fill(0);
  land.fill(0);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const discharge = dischargeOf(world, i);
      if (discharge > 0) {
        const drained = forEachDrain(world, x, y, (j, count) => { out[j] += discharge / count; });
        if (drained === 0) land[i] = discharge;
      }
      const cleanup = cleanupOf(world, i);
      if (cleanup > 0) forEachDrain(world, x, y, (j, count) => { inn[j] += cleanup / count; });
    }
  }

  // Rivière, de l'amont vers l'aval.
  for (const i of topo.river) {
    const inflows = topo.inflowsOf.get(i);
    let carried = 0;
    if (inflows && inflows.length > 0) {
      let sum = 0;
      for (const j of inflows) sum += eco.water[j];
      carried = ECO_RIVER_CARRY * (sum / inflows.length);
    }
    eco.water[i] = clamp(carried + out[i] - inn[i], 0, 100);
  }

  // Lacs : une valeur par lac, répartie sur ses cases.
  for (const lake of topo.lakes) {
    let inflow = 0;
    for (const j of lake.inflows) inflow += eco.water[j];
    let discharge = 0;
    let cleanup = 0;
    for (const i of lake.cells) {
      discharge += out[i];
      cleanup += inn[i];
    }
    const previous = eco.water[lake.cells[0]];
    const value = clamp(previous + ECO_LAKE_INFLOW * inflow + discharge - cleanup - ECO_WATER_IN.lake, 0, 100);
    lake.value = value;
    for (const i of lake.cells) eco.water[i] = value;
  }

  // Nappe : moyenne locale de ce qui coule et de ce qui s'infiltre ; les zones humides filtrent.
  const tmp = scratch(eco, 'wTmp', n);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (isDrain(world.tiles[i].terrain)) { tmp[i] = eco.water[i]; continue; }
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const j = ny * cols + nx;
          if (isDrain(world.tiles[j].terrain)) { sum += eco.water[j]; count++; }
          if (fieldModeOf(world.tiles[j]) === 'intensive') { sum += ECO_GROUND_FIELD; count++; }
          if (land[j] > 0) { sum += land[j]; count++; }
        }
      }
      let value = count > 0 ? sum / count : 0;
      if (world.tiles[i].terrain === 'wetland') value -= ECO_WATER_IN.wetland;
      tmp[i] = clamp(value, 0, 100);
    }
  }
  for (let i = 0; i < n; i++) eco.water[i] = tmp[i];
  return eco;
}

// ---------------------------------------------------------------------------------------------
// Faune (§5.3).

/**
 * Une passe de faune : `base(habitat) × (1 + 0,1·min(taille utile, 10)) − 0,5·arêtes routières
 * − (air + eau)/50 + haies voisines`. Les cases sans habitat valent 0. `eco.fauna` est réécrit sur place.
 */
export function faunaStep(eco, world) {
  const topo = topologyOf(eco, world);
  const { cols, rows } = world;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const habitat = topo.habitats[i];
      if (!habitat) { eco.fauna[i] = 0; continue; }
      const patch = topo.patchOf[i] >= 0 ? topo.patches[topo.patchOf[i]] : null;
      const size = Math.min(ECO_FAUNA_SIZE_CAP, patch ? patch.effectiveSize : 1);
      let v = (ECO_FAUNA_BASE[habitat] || 0) * (1 + ECO_FAUNA_SIZE_BONUS * size);
      v -= ECO_FAUNA_ROAD_MALUS * roadEdgesOf(world, x, y);
      v -= (eco.air[i] + eco.water[i]) * ECO_FAUNA_POLLUTION;
      let hedges = 0;
      for (const d of DIRS4) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const b = world.tiles[ny * cols + nx].building;
        if (b && b.type === 'hedge') hedges++;
      }
      eco.fauna[i] = clamp(v + ECO_FAUNA_HEDGE_BONUS * hedges, 0, 100);
    }
  }
  return eco;
}

// ---------------------------------------------------------------------------------------------
// Sols (§5.4).

/**
 * Une passe de sols : fertilité des champs selon leur conduite (intensif −2, bio +1, jachère +4), érosion
 * de 2 de plus sous une colline sans haie (× ECO_RAIN_EROSION les mois de pluies fortes).
 * @param {{ rains?: boolean }} options
 */
export function soilStep(eco, world, options = {}) {
  const topo = topologyOf(eco, world);
  const rains = Boolean(options.rains);
  const { cols } = world;
  for (const i of topo.fields) {
    const mode = fieldModeOf(world.tiles[i]);
    const rule = ECO_SOIL[mode];
    if (!rule) continue;
    let v = eco.soil[i] + rule.change;
    if (mode === 'intensive') {
      const x = i % cols;
      const y = (i - x) / cols;
      let hill = false;
      let hedge = false;
      for (const d of DIRS4) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= world.rows) continue;
        const t = world.tiles[ny * cols + nx];
        if (t.terrain === 'hill') hill = true;
        if (t.building && t.building.type === 'hedge') hedge = true;
      }
      if (hill && !hedge) v -= ECO_SOIL_EROSION * (rains ? ECO_RAIN_EROSION : 1);
    }
    eco.soil[i] = clamp(v, 0, 100);
  }
  return eco;
}

/**
 * Rendement d'un champ (§5.4) : `conduite × F/100`, × ECO_POLLINATION_BONUS si des abeilles sont à moins
 * de deux cases d'un champ bio, × ECO_HEDGE_YIELD_FACTOR avec une haie voisine. 0 hors champ.
 */
export function fieldYieldOf(eco, world, i) {
  const tile = world.tiles[i];
  const mode = fieldModeOf(tile);
  if (!mode) return 0;
  const rule = ECO_SOIL[mode];
  let factor = rule.yield * (eco.soil[i] / 100);
  if (factor === 0) return 0;
  const x = i % world.cols;
  const y = (i - x) / world.cols;
  if (mode === 'organic' && isPollinated(eco, world, x, y)) factor *= ECO_POLLINATION_BONUS;
  if (hasNeighborType(world, x, y, 'hedge')) factor *= ECO_HEDGE_YIELD_FACTOR;
  return factor;
}

/** Vrai si des abeilles butinent à moins de ECO_POLLINATION_RADIUS cases (Chebyshev). */
export function isPollinated(eco, world, x, y) {
  const bees = eco.species.bee;
  if (!bees || !bees.present) return false;
  const r = ECO_POLLINATION_RADIUS;
  for (const i of bees.cells) {
    const bx = i % world.cols;
    const by = (i - bx) / world.cols;
    if (Math.abs(bx - x) <= r && Math.abs(by - y) <= r) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------------------------
// Espèces (§5.3).

/** Contexte passé à `check(ctx)` des espèces (src/data/species.js) : lectures seules. */
function speciesContext(eco, world, topo) {
  const { cols, rows } = world;
  const toXY = (i) => ({ x: i % cols, y: (i - (i % cols)) / cols });
  const ctx = {
    world,
    eco,
    get patches() { return topo.patches; },
    get lakes() { return topo.lakes; },
    get river() { return topo.river; },
    atLeast,
    atMost,
    habitatOf: (i) => topo.habitats[i],
    fieldMode: (tile) => fieldModeOf(tile),
    isBuilt: (tile) => isBuiltTile(tile),
    isRiparian: (i) => topo.riparian[i] === 1,
    patchesOf: (habitat) => topo.byHabitat[habitat] || [],
    patchById: (id) => topo.patches[id] || null,
    effectiveSize: (patch) => patch.effectiveSize,
    /** Index des cases à distance de Chebyshev ≤ radius de `i` (sans `i`). */
    neighbors(i, radius = 1) {
      const { x, y } = toXY(i);
      const out = [];
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          out.push(ny * cols + nx);
        }
      }
      return out;
    },
    /** Vrai si une case à distance ≤ radius de l'une de `cells` satisfait `pred(tile, i)`. */
    anyNear(cells, radius, pred) {
      for (const i of cells) {
        const { x, y } = toXY(i);
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            const j = ny * cols + nx;
            if (pred(world.tiles[j], j)) return true;
          }
        }
      }
      return false;
    },
    /** Nombre de cases distinctes, hors `cells`, à distance ≤ radius de l'une d'elles, satisfaisant `pred`. */
    countNear(cells, radius, pred) {
      const inside = new Set(cells);
      const seen = new Set();
      for (const i of cells) {
        const { x, y } = toXY(i);
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            const j = ny * cols + nx;
            if (inside.has(j) || seen.has(j)) continue;
            if (pred(world.tiles[j], j)) seen.add(j);
          }
        }
      }
      return seen.size;
    },
  };
  return ctx;
}

function contextOf(eco, world) {
  const topo = topologyOf(eco, world);
  const cache = cacheOf(eco);
  if (!cache.ctx) cache.ctx = speciesContext(eco, world, topo);
  return cache.ctx;
}

function speciesEvent(def, present, world, cells) {
  const i = cells && cells.length > 0 ? cells[0] : 0;
  const c = coords(world, i);
  return {
    type: 'species',
    key: def.id,
    present,
    text: present ? def.textIn : def.textOut,
    x: c.x,
    y: c.y,
    layer: 'fauna',
  };
}

/**
 * Une passe d'espèces : apparition dès que la condition est atteinte (`score ≥ 1`), départ après
 * ECO_SPECIES_LEAVE_MONTHS mois consécutifs à 20 % sous le seuil (`score < ECO_SPECIES_LEAVE_RATIO`).
 * `since` garde le mois de la **première** apparition.
 * @param {{ month?: number, silent?: boolean }} options
 * @returns {Array<{ type: 'species', key, present, text, x, y, layer }>}
 */
export function speciesStep(eco, world, options = {}) {
  const month = Number.isFinite(options.month) ? options.month : 0;
  const ctx = contextOf(eco, world);
  const events = [];
  for (const def of SPECIES) {
    const state = eco.species[def.id] || (eco.species[def.id] = { present: false, since: null, cells: [], below: 0 });
    const { score, cells } = def.check(ctx);
    if (!state.present) {
      if (score >= 1) {
        state.present = true;
        if (!Number.isFinite(state.since)) state.since = month;
        state.below = 0;
        state.cells = cells.slice();
        if (!options.silent) events.push(speciesEvent(def, true, world, state.cells));
      } else {
        state.below = 0;
        state.cells = [];
      }
      continue;
    }
    state.cells = cells.slice();
    if (score < ECO_SPECIES_LEAVE_RATIO) state.below++;
    else state.below = 0;
    if (state.below >= ECO_SPECIES_LEAVE_MONTHS) {
      state.present = false;
      state.below = 0;
      const where = state.cells;
      state.cells = [];
      if (!options.silent) events.push(speciesEvent(def, false, world, where));
    }
  }
  return events;
}

/** Nombre d'espèces présentes. */
export function speciesCount(eco) {
  let n = 0;
  for (const def of SPECIES) if (eco.species[def.id] && eco.species[def.id].present) n++;
  return n;
}

/** Carnet des espèces : une ligne par espèce, présente ou non (docs §10.4). */
export function speciesSummary(eco) {
  return SPECIES.map((def) => {
    const s = (eco && eco.species && eco.species[def.id]) || { present: false, since: null, cells: [] };
    return {
      id: def.id,
      label: def.label,
      present: Boolean(s.present),
      since: Number.isFinite(s.since) ? s.since : null,
      hint: def.hint,
      cells: Array.from(s.cells || []),
    };
  });
}

// ---------------------------------------------------------------------------------------------
// Scores (§7.1) et rétroactions vers la ville (§5.5).

/** Air moyen des quartiers (et sa pire case) ; sans quartier, la moyenne de la carte. */
export function cityAir(eco, world) {
  let sum = 0;
  let count = 0;
  let worst = -1;
  for (let i = 0; i < world.tiles.length; i++) {
    const b = world.tiles[i].building;
    if (!b || b.type !== 'house') continue;
    sum += eco.air[i];
    count++;
    if (worst < 0 || eco.air[i] > eco.air[worst]) worst = i;
  }
  if (count === 0) {
    let all = 0;
    for (let i = 0; i < eco.air.length; i++) all += eco.air[i];
    return { mean: eco.air.length > 0 ? all / eco.air.length : 0, worst: -1, count: 0 };
  }
  return { mean: sum / count, worst, count };
}

/** Nappe moyenne sous les quartiers (sans quartier : 0). */
export function cityGroundwater(eco, world) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < world.tiles.length; i++) {
    const b = world.tiles[i].building;
    if (!b || b.type !== 'house') continue;
    sum += eco.water[i];
    count++;
  }
  return count > 0 ? sum / count : 0;
}

/** Eau moyenne : les cases d'eau (rivière, lac, zone humide) ; sans eau, la nappe moyenne de la carte. */
export function waterMean(eco, world) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < world.tiles.length; i++) {
    if (!isWaterTerrain(world.tiles[i].terrain)) continue;
    sum += eco.water[i];
    count++;
  }
  if (count > 0) return sum / count;
  let all = 0;
  for (let i = 0; i < eco.water.length; i++) all += eco.water[i];
  return eco.water.length > 0 ? all / eco.water.length : 0;
}

/**
 * Fertilité moyenne des champs cultivés (ceux que la ville exploite) ; sans aucun champ cultivé, la
 * fertilité naturelle : ne rien cultiver n'est ni récompensé ni puni.
 */
export function soilMean(eco, world) {
  const topo = topologyOf(eco, world);
  if (topo.farms.length === 0) return ECO_SOIL_START;
  let sum = 0;
  for (const i of topo.farms) sum += eco.soil[i];
  return sum / topo.farms.length;
}

/** Note de faune : qualité moyenne des habitats, pondérée par la part de la carte qu'ils couvrent. */
export function faunaScore(eco, world) {
  const topo = topologyOf(eco, world);
  if (topo.habitatCells === 0) return 0;
  let sum = 0;
  for (let i = 0; i < world.tiles.length; i++) if (topo.habitats[i]) sum += eco.fauna[i];
  const quality = sum / topo.habitatCells;
  const share = topo.habitatCells / world.tiles.length;
  return clamp(quality * Math.min(1, share / ECO_HABITAT_TARGET), 0, 100);
}

/** Tourisme (§5.5) : espèces présentes, lac propre, forêts. Plafonné à ECO_TOURISM.max. */
export function tourismOf(eco, world) {
  const topo = topologyOf(eco, world);
  let value = ECO_TOURISM.perSpecies * speciesCount(eco);
  let cleanLake = false;
  for (const lake of topo.lakes) if (eco.water[lake.cells[0]] < ECO_TOURISM.cleanLakeMax) cleanLake = true;
  if (cleanLake) value += ECO_TOURISM.cleanLake;
  let forest = 0;
  for (let i = 0; i < world.tiles.length; i++) if (topo.habitats[i] === 'forest') forest++;
  value += Math.min(ECO_TOURISM.forestMax, ECO_TOURISM.perForest10 * Math.floor(forest / 10));
  return Math.min(ECO_TOURISM.max, Math.round(value));
}

/** Santé de la ville (§5.5) : 100 moins l'air des quartiers et la nappe au-delà de leurs seuils. */
export function healthOf(eco, world) {
  const air = cityAir(eco, world).mean;
  const ground = cityGroundwater(eco, world);
  const fromAir = Math.max(0, air - ECO_AIR_HAPPY_THRESHOLD) * ECO_HEALTH_PER_POINT;
  const fromWater = Math.max(0, ground - ECO_GROUND_HEALTH_THRESHOLD) * ECO_HEALTH_PER_POINT;
  return Math.round(clamp(100 - fromAir - fromWater, 0, 100));
}

/** Bonheur perdu par un quartier à cause de l'air : 1 point par tranche de 10 au-delà de 40 (§5.1). */
export function airHappinessPenalty(air) {
  if (!(air > ECO_AIR_HAPPY_THRESHOLD)) return 0;
  return Math.floor((air - ECO_AIR_HAPPY_THRESHOLD) / ECO_AIR_HAPPY_STEP) + 1;
}

/** Scores 0–100 : air, eau, faune, sols et l'agrégat `nature` (§7.1). Écrits sur place. */
export function scoresStep(eco, world) {
  const air = cityAir(eco, world).mean;
  const water = waterMean(eco, world);
  const soil = soilMean(eco, world);
  const fauna = faunaScore(eco, world);
  const species = Math.min(100, ECO_SPECIES_SCORE * speciesCount(eco));
  const nature = ECO_NATURE_WEIGHTS.air * (100 - air)
    + ECO_NATURE_WEIGHTS.water * (100 - water)
    + ECO_NATURE_WEIGHTS.species * species
    + ECO_NATURE_WEIGHTS.soil * soil;
  eco.scores.air = Math.round(clamp(100 - air, 0, 100));
  eco.scores.water = Math.round(clamp(100 - water, 0, 100));
  eco.scores.fauna = Math.round(clamp(fauna, 0, 100));
  eco.scores.soil = Math.round(clamp(soil, 0, 100));
  eco.scores.nature = Math.round(clamp(nature, 0, 100));
  return eco.scores;
}

// ---------------------------------------------------------------------------------------------
// Alertes (§5.1, §5.2, §7.3).

const ALERT_TEXTS = Object.freeze({
  smog: 'L’air des quartiers est irrespirable depuis des mois : le smog s’installe.',
  algae: 'Le lac verdit : les algues couvrent la surface et le tourisme s’en va.',
  flood: 'Les pluies ont gonflé la rivière : sans zones humides, elle déborde.',
  heat: 'Un quartier cuit au soleil : pas un arbre à deux cases à la ronde.',
});

const ALERT_LAYERS = Object.freeze({ smog: 'air', algae: 'water', flood: 'water', heat: 'air' });

function alertEvent(key, world, i) {
  const c = coords(world, Math.max(0, i));
  return { type: 'eco-alert', key, text: ALERT_TEXTS[key], x: c.x, y: c.y, layer: ALERT_LAYERS[key] };
}

/** Part des cases de rivière bordées d'une zone humide (§7.3 : moins de 20 % → risque de crue). */
export function wetlandShareAlongRiver(eco, world) {
  const topo = topologyOf(eco, world);
  if (topo.river.length === 0) return 1;
  const { cols, rows } = world;
  let withWetland = 0;
  for (const i of topo.river) {
    const x = i % cols;
    const y = (i - x) / cols;
    for (const d of DIRS4) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      if (world.tiles[ny * cols + nx].terrain === 'wetland') { withWetland++; break; }
    }
  }
  return withWetland / topo.river.length;
}

/**
 * Compteurs de mois consécutifs au-dessus du seuil, et les événements à signaler.
 * @param {{ month?: number, season?: number, rains?: boolean }} options
 * @returns {Array<{ type: 'eco-alert', key, text, x, y, layer }>}
 */
export function alertsStep(eco, world, options = {}) {
  const topo = topologyOf(eco, world);
  const season = Number.isFinite(options.season) ? options.season : seasonOf(options.month || 0);
  const events = [];
  const a = eco.alerts;
  const due = (count, months) => count >= months && (count - months) % months === 0;

  // Smog : l'air moyen des quartiers au-dessus du seuil pendant cinq mois.
  const city = cityAir(eco, world);
  if (city.count > 0 && city.mean > ECO_ALERTS.smog.threshold) {
    a.smog++;
    if (due(a.smog, ECO_ALERTS.smog.months)) events.push(alertEvent('smog', world, city.worst));
  } else a.smog = 0;

  // Algues : le lac le plus sale au-dessus du seuil pendant dix mois.
  let dirtiest = null;
  for (const lake of topo.lakes) {
    if (!dirtiest || eco.water[lake.cells[0]] > eco.water[dirtiest.cells[0]]) dirtiest = lake;
  }
  if (dirtiest && eco.water[dirtiest.cells[0]] > ECO_ALERTS.algae.threshold) {
    a.algae++;
    if (due(a.algae, ECO_ALERTS.algae.months)) events.push(alertEvent('algae', world, dirtiest.cells[0]));
  } else a.algae = 0;

  // Crue : une rivière sans zones humides accumule le risque mois après mois ; la crue éclate quand les
  // pluies fortes tombent sur un risque mûr, et remet le compteur à zéro.
  if (topo.river.length > 0 && wetlandShareAlongRiver(eco, world) < ECO_ALERTS.flood.wetlandShare) {
    a.flood++;
    if (options.rains && a.flood >= ECO_ALERTS.flood.months) {
      events.push(alertEvent('flood', world, topo.river[topo.river.length - 1]));
      a.flood = 0;
    }
  } else a.flood = 0;

  // Canicule urbaine : en été, un quartier sans espace vert à deux cases.
  let hot = -1;
  if (season === 1) {
    const { cols, rows } = world;
    for (let i = 0; i < world.tiles.length && hot < 0; i++) {
      const b = world.tiles[i].building;
      if (!b || b.type !== 'house') continue;
      const x = i % cols;
      const y = (i - x) / cols;
      let green = false;
      const r = ECO_ALERTS.heat.radius;
      for (let dy = -r; dy <= r && !green; dy++) {
        for (let dx = -r; dx <= r && !green; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          if (isNatureCell(world, ny * cols + nx)) green = true;
        }
      }
      if (!green) hot = i;
    }
  }
  if (hot >= 0) {
    a.heat++;
    if (due(a.heat, ECO_ALERTS.heat.months)) events.push(alertEvent('heat', world, hot));
  } else a.heat = 0;

  return events;
}

// ---------------------------------------------------------------------------------------------
// Passe mensuelle complète.

/**
 * Une passe mensuelle complète : air, eau, parcelles et faune, sols, espèces, scores, alertes.
 * `eco` est mis à jour **sur place** et rendu tel quel (contrat §10.1).
 * @param {object} eco écologie à avancer
 * @param {object} world monde du mois (jamais modifié)
 * @param {{ month?: number, season?: number, rng?: { chance: (p: number) => boolean } }} options
 * @returns {{ eco, events: Array<object> }} événements `species` puis `eco-alert`
 */
export function stepEcology(eco, world, options = {}) {
  const month = Number.isFinite(options.month) ? options.month : 0;
  const season = Number.isFinite(options.season) ? options.season : seasonOf(month);
  const rng = options.rng || null;
  // Pluies fortes (§5.4) : une fois par saison en moyenne ; elles triplent l'érosion et, si la rivière
  // manque de zones humides, provoquent la crue.
  const rains = rng && typeof rng.chance === 'function' ? rng.chance(ECO_RAIN_CHANCE) : false;
  const pass = { month, season, rains };
  topologyOf(eco, world, true);
  airStep(eco, world, pass);
  waterStep(eco, world, pass);
  faunaStep(eco, world, pass);
  soilStep(eco, world, pass);
  const events = speciesStep(eco, world, pass);
  scoresStep(eco, world, pass);
  for (const e of alertsStep(eco, world, pass)) events.push(e);
  return { eco, events };
}

/** Fiche écologique d'une case (docs §10.2 : `describeTile`). */
export function describeEcology(eco, world, x, y) {
  if (!inBounds(world, x, y)) return null;
  const i = index(world, x, y);
  const species = [];
  for (const def of SPECIES) {
    const s = eco.species[def.id];
    if (s && s.present && s.cells.includes(i)) species.push(def.id);
  }
  const topo = topologyOf(eco, world);
  const patch = topo.patchOf[i] >= 0 ? topo.patches[topo.patchOf[i]] : null;
  return {
    air: Math.round(eco.air[i] * 10) / 10,
    water: Math.round(eco.water[i] * 10) / 10,
    fauna: Math.round(eco.fauna[i] * 10) / 10,
    soil: Math.round(eco.soil[i] * 10) / 10,
    habitat: topo.habitats[i],
    patch: patch ? { id: patch.id, size: patch.size, effectiveSize: patch.effectiveSize, habitat: patch.habitat } : null,
    fieldMode: fieldModeOf(world.tiles[i]),
    species,
  };
}

/**
 * Met l'écologie en phase avec un monde qui vient de changer (pose, démolition, relecture) : parcelles,
 * lacs, champs recalculés et fertilité des nouveaux champs initialisée. Rend le même `eco`.
 */
export function syncEcology(eco, world) {
  topologyOf(eco, world, true);
  return eco;
}
