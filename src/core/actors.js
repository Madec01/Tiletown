// Acteurs animés de la vallée (docs/ARCHITECTURE.md §8.1) : habitants sur les trottoirs, véhicules sur
// les rues chargées, faune dans ses habitats. Module PUR : aucun DOM, aucun three.js ; tout l'aléa passe
// par `actors.rng` (graine dérivée de celle du monde), si bien qu'une même graine rejoue la même scène.
//
//   const actors = createActors(world, seed);   // crée le tout d'après le monde (rues, trafic, habitats)
//   updateActors(actors, world, dt);            // à chaque image ; un `world` différent → `syncActors`
//   actorsStats(actors)                         // comptes par genre (tests, affichage de débogage)
//   habitatSummary(world)                       // habitats de la faune et effectifs souhaités (pur)
//
// Conventions d'espace : la case (i, j) couvre [i, i+1] × [j, j+1] en (x, z) ; les rues vivent sur les
// arêtes du treillis (h(x, y) le long de X à z = y, v(x, y) le long de Z à x = x) ; yaw = atan2(dx, dz),
// 0 = face +Z (sud), comme `rotation.y` de three.js. La « droite » dans le sens de marche (dx, dz) est
// (−dz, dx) : on circule à droite, piétons comme véhicules.
//
// Chaque acteur : { id, kind, group, model, anim, x, y, z, yaw, speed, state, phase, path, home, ttl,
// bridge, hidden, stride, habitat … } ; `phase` ∈ [0, 1[ avance de `speed / stride` par seconde en
// marche (≈ 0,35 u par pas d'habitant) et à une cadence fixe en vol ou au repos.

import { createRng } from './rng.js';
import {
  tileAt, inBounds, index, neighbors4, neighbors8, edgeRef, edgeValue, cornerIndex, edgesOfCorner,
  cornersOfTile, DIRS4,
} from './grid.js';
import { EDGE, shortestTrip } from './roads.js';
import { isBuiltTile, jobsOfTile, residentsOfTile } from '../data/tiles.js';

// ---------------------------------------------------------------------------------------------
// Constantes du contrat.

/** Plafonds par groupe (§8.1). */
export const CAPS = Object.freeze({ habitant: 60, vehicle: 20, animal: 24 });
/** Décalage des piétons vers le trottoir de droite (u), depuis la ligne de l'arête. */
export const SIDEWALK_OFFSET = 0.12;
/** Décalage des véhicules vers la voie de droite (u). */
export const LANE_OFFSET = 0.07;
export const WALK_SPEED = 0.6;
export const DRIVE_SPEED = 1.2;
/** Longueur d'un pas d'habitant (u) : la phase boucle une fois par pas. */
export const STRIDE = 0.35;
/** Distance (centre à centre) sous laquelle un véhicule ralentit derrière le précédent. */
export const FOLLOW_DISTANCE = 0.4;
/** Arrêt aux nœuds à 3 ou 4 branches (s). */
export const NODE_STOP = 1.0;
/** Habitants par quartier selon le niveau. */
export const RESIDENTS_PER_LEVEL = Object.freeze({ 1: 2, 2: 4, 3: 6 });
/** Altitudes de vol (u, au-dessus du sol). */
export const FLIGHT = Object.freeze({ bee: 0.4, swallowMin: 1.6, swallowMax: 2.5, heron: 1.0, owlPerch: 0.5 });

/**
 * Modèles d'acteurs (identifiants du manifeste) : groupe, animation procédurale, hauteur cible (u),
 * pas (u) et cadence d'ailes (Hz). Partagé avec le rendu (`src/render3d/actors.js`).
 */
export const ACTOR_MODELS = Object.freeze({
  'citizen-a': { group: 'habitant', anim: 'biped', height: 0.22, stride: STRIDE },
  'citizen-b': { group: 'habitant', anim: 'biped', height: 0.22, stride: STRIDE },
  'citizen-c': { group: 'habitant', anim: 'biped', height: 0.22, stride: STRIDE },
  deer: { group: 'animal', anim: 'quadruped', height: 0.28, stride: 0.5 },
  fox: { group: 'animal', anim: 'quadruped', height: 0.14, stride: 0.3 },
  duck: { group: 'animal', anim: 'bird', height: 0.09, stride: 0.12, flap: 6 },
  heron: { group: 'animal', anim: 'wader', height: 0.3, stride: 0.3, flap: 4 },
  otter: { group: 'animal', anim: 'swimmer', height: 0.08, stride: 0.3 },
  bee: { group: 'animal', anim: 'flyer', height: 0.05, stride: 0.1, flap: 12 },
  swallow: { group: 'animal', anim: 'flyer', height: 0.08, stride: 0.2, flap: 8 },
  owl: { group: 'animal', anim: 'bird', height: 0.11, stride: 0.1, flap: 6 },
  'car-a': { group: 'vehicle', anim: 'vehicle', height: 0.14, stride: 0.2 },
  'car-b': { group: 'vehicle', anim: 'vehicle', height: 0.12, stride: 0.2 },
  truck: { group: 'vehicle', anim: 'vehicle', height: 0.14, stride: 0.2 },
  bus: { group: 'vehicle', anim: 'vehicle', height: 0.17, stride: 0.2 },
});

const CITIZEN_MODELS = ['citizen-a', 'citizen-b', 'citizen-c'];
const SPECIES = ['deer', 'fox', 'duck', 'heron', 'otter', 'bee', 'swallow', 'owl'];
/** Marge gardée au bord d'une case par la faune (les points visés restent dans [m, 1 − m]). */
const TILE_MARGIN = 0.18;
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------------------------
// Petits outils.

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

/** Différence d'angles ramenée dans ]−π, π]. */
function angleDelta(from, to) {
  let d = (to - from) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d <= -Math.PI) d += TAU;
  return d;
}

/** Fait tourner `a.yaw` vers `target` à `rate` rad/s ; mémorise la vitesse de virage normalisée dans `a.turn`. */
function turnToward(a, target, dt, rate) {
  const d = angleDelta(a.yaw, target);
  const step = clamp(d, -rate * dt, rate * dt);
  a.yaw += step;
  if (a.yaw > Math.PI) a.yaw -= TAU; else if (a.yaw <= -Math.PI) a.yaw += TAU;
  a.turn = dt > 0 ? clamp(step / dt / rate, -1, 1) : 0;
}

/** Index de la case qui contient le point (x, z), ou −1 hors carte. */
export function tileIndexAt(world, x, z) {
  const tx = Math.floor(x);
  const ty = Math.floor(z);
  return inBounds(world, tx, ty) ? index(world, tx, ty) : -1;
}

function cornerXZ(world, i) {
  const w = world.cols + 1;
  return { x: i % w, z: Math.floor(i / w) };
}

/** Arête entre deux coins voisins du treillis (indices). */
function edgeBetween(world, a, b) {
  const ca = cornerXZ(world, a);
  const cb = cornerXZ(world, b);
  if (ca.z === cb.z) return edgeRef(world, 'h', Math.min(ca.x, cb.x), ca.z);
  return edgeRef(world, 'v', ca.x, Math.min(ca.z, cb.z));
}

/** Point aléatoire dans la case d'index i, à l'écart des bords. */
function pointInTile(world, i, rng, margin = TILE_MARGIN) {
  const tx = i % world.cols;
  const ty = Math.floor(i / world.cols);
  return { x: tx + rng.range(margin, 1 - margin), z: ty + rng.range(margin, 1 - margin) };
}

/** Partage un budget entre des demandes entières, au prorata (reste aux plus grandes parts fractionnaires). */
export function allocate(desired, cap) {
  const keys = Object.keys(desired);
  const sum = keys.reduce((s, k) => s + desired[k], 0);
  if (sum <= cap) return { ...desired };
  const out = {};
  const fracs = [];
  let used = 0;
  for (const k of keys) {
    const exact = desired[k] * cap / sum;
    out[k] = Math.floor(exact);
    used += out[k];
    fracs.push({ k, f: exact - out[k] });
  }
  fracs.sort((a, b) => b.f - a.f || a.k.localeCompare(b.k));
  for (let i = 0; used < cap && i < fracs.length; i++) { out[fracs[i].k]++; used++; }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Treillis des rues : coins reliés par les arêtes valant rue ou pont (≥ 2).

/**
 * Graphe des rues : `adj[c]` = [{ to, ref, value, traffic }] pour chaque coin c ; `degree[c]` = nombre de
 * rues qui en partent ; `trafficEdges` = arêtes (une entrée par arête, les deux sens) à trafic > 0.
 */
export function streetGraph(world) {
  const n = (world.cols + 1) * (world.rows + 1);
  const adj = Array.from({ length: n }, () => []);
  const degree = new Uint8Array(n);
  const trafficEdges = [];
  const traffic = world.traffic || null;
  const link = (ref, a, b) => {
    const value = edgeValue(world, ref);
    if (value < EDGE.STREET) return;
    const t = traffic && traffic[ref.kind] ? traffic[ref.kind][ref.index] || 0 : 0;
    adj[a].push({ to: b, ref, value, traffic: t });
    adj[b].push({ to: a, ref, value, traffic: t });
    degree[a]++; degree[b]++;
    if (t > 0) trafficEdges.push({ ref, a, b, traffic: t, value });
  };
  for (let y = 0; y <= world.rows; y++) {
    for (let x = 0; x < world.cols; x++) link(edgeRef(world, 'h', x, y), cornerIndex(world, x, y), cornerIndex(world, x + 1, y));
  }
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x <= world.cols; x++) link(edgeRef(world, 'v', x, y), cornerIndex(world, x, y), cornerIndex(world, x, y + 1));
  }
  return { n, adj, degree, trafficEdges };
}

/**
 * Plus court chemin (toutes les rues coûtent 1 : parcours en largeur) depuis un ensemble de coins
 * jusqu'au premier coin vérifiant `isGoal` ; les égalités sont départagées au hasard par `rng`.
 * @returns {number[] | null} liste de coins, ou null
 */
function bfsPath(graph, sources, isGoal, rng) {
  const prev = new Int32Array(graph.n).fill(-2);
  const queue = [];
  for (const s of sources) { if (prev[s] === -2) { prev[s] = -1; queue.push(s); } }
  let head = 0;
  while (head < queue.length) {
    const c = queue[head++];
    if (isGoal(c) && prev[c] !== -1) {
      const path = [];
      for (let k = c; k !== -1; k = prev[k]) path.push(k);
      return path.reverse();
    }
    const edges = rng ? rng.shuffle(graph.adj[c]) : graph.adj[c];
    for (const e of edges) {
      if (prev[e.to] === -2) { prev[e.to] = c; queue.push(e.to); }
    }
  }
  return null;
}

/** Promenade aléatoire de `steps` arêtes depuis un coin, sans revenir sur ses pas si possible. */
function randomWalk(graph, start, steps, rng) {
  const path = [start];
  let prev = -1;
  for (let i = 0; i < steps; i++) {
    const c = path[path.length - 1];
    const options = graph.adj[c].filter((e) => e.to !== prev);
    const pool = options.length ? options : graph.adj[c];
    if (!pool.length) break;
    const e = rng.pick(pool);
    prev = c;
    path.push(e.to);
  }
  return path.length > 1 ? path : null;
}

/**
 * Points de passage le long d'une suite de coins, décalés de `offset` vers la droite du sens de marche.
 * Aux carrefours : tout droit, un seul point ; virage, le coin du pâté de maisons (à `offset` des deux
 * rues : le piéton contourne l'angle sans couper le carrefour) ; demi-tour, traversée de la rue.
 * Chaque point porte l'arête du segment qu'il termine (`edge`), null pour le point de départ et après un
 * demi-tour.
 */
export function offsetPath(world, corners, offset) {
  const pts = [];
  const n = corners.length;
  if (n < 2) return pts;
  const segment = (i) => {
    const a = cornerXZ(world, corners[i]);
    const b = cornerXZ(world, corners[i + 1]);
    const dx = Math.sign(b.x - a.x);
    const dz = Math.sign(b.z - a.z);
    return { a, b, dx, dz, rx: -dz * offset, rz: dx * offset, ref: edgeBetween(world, corners[i], corners[i + 1]) };
  };
  let s = segment(0);
  pts.push({ x: s.a.x + s.rx, z: s.a.z + s.rz, edge: null });
  for (let i = 1; i < n - 1; i++) {
    const t = segment(i);
    const c = s.b;
    if (s.dx === t.dx && s.dz === t.dz) {
      pts.push({ x: c.x + s.rx, z: c.z + s.rz, edge: s.ref });
    } else if (s.dx === -t.dx && s.dz === -t.dz) {
      pts.push({ x: c.x + s.rx, z: c.z + s.rz, edge: s.ref });
      pts.push({ x: c.x + t.rx, z: c.z + t.rz, edge: null });
    } else {
      pts.push({ x: c.x + s.rx + t.rx, z: c.z + s.rz + t.rz, edge: s.ref });
    }
    s = t;
  }
  pts.push({ x: s.b.x + s.rx, z: s.b.z + s.rz, edge: s.ref });
  return pts;
}

/** Suit `a.path` à `speed` u/s pendant `dt` ; rend vrai quand le chemin est épuisé. */
function followPath(a, dt, speed) {
  let remaining = speed * dt;
  let target = null;
  while (remaining > 0 && a.path.length) {
    const p = a.path[0];
    if (p.edge) a.edge = p.edge; // l'arête du segment en cours
    const dx = p.x - a.x;
    const dz = p.z - a.z;
    const d = Math.hypot(dx, dz);
    if (d <= remaining) {
      a.x = p.x; a.z = p.z;
      remaining -= d;
      a.path.shift();
    } else {
      a.x += dx / d * remaining;
      a.z += dz / d * remaining;
      target = Math.atan2(dx, dz);
      remaining = 0;
    }
  }
  if (target !== null) a.targetYaw = target;
  return a.path.length === 0;
}

// ---------------------------------------------------------------------------------------------
// Habitats de la faune.

function isForestTile(t) { return Boolean(t) && t.terrain === 'forest' && !isBuiltTile(t); }
function isOpenGround(t) { return Boolean(t) && (t.terrain === 'grass' || t.terrain === 'meadow') && !t.building; }
function isWaterTile(t) { return Boolean(t) && (t.terrain === 'river' || t.terrain === 'lake'); }

/** Composantes connexes (8 voisins) des cases de forêt, triées de la plus grande à la plus petite. */
function forestMassifs(world) {
  const seen = new Uint8Array(world.tiles.length);
  const massifs = [];
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const i = index(world, x, y);
      if (seen[i] || !isForestTile(world.tiles[i])) continue;
      const tiles = [];
      const stack = [{ x, y }];
      seen[i] = 1;
      while (stack.length) {
        const p = stack.pop();
        tiles.push(index(world, p.x, p.y));
        for (const n of neighbors8(world, p.x, p.y)) {
          const j = index(world, n.x, n.y);
          if (!seen[j] && isForestTile(world.tiles[j])) { seen[j] = 1; stack.push(n); }
        }
      }
      tiles.sort((a, b) => a - b);
      massifs.push({ tiles, size: tiles.length });
    }
  }
  massifs.sort((a, b) => b.size - a.size || a.tiles[0] - b.tiles[0]);
  return massifs;
}

/**
 * Habitats de la faune et effectifs souhaités (avant plafond) :
 * { massifs, forestEdge, edgeMeadow, water, river, lake, banks, flowers, town, built, desired }.
 * Tous les champs sont des listes d'index de cases, sauf `massifs` ([{ tiles, size }]) et `desired`.
 */
export function habitatSummary(world) {
  const massifs = forestMassifs(world);
  const forestEdge = [];
  const edgeMeadow = new Set();
  const water = [];
  const river = [];
  const lake = [];
  const banks = new Set();
  const flowers = [];
  const built = [];
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const i = index(world, x, y);
      const t = world.tiles[i];
      if (isForestTile(t)) {
        let edge = false;
        for (const n of neighbors4(world, x, y)) {
          if (isOpenGround(tileAt(world, n.x, n.y))) { edge = true; edgeMeadow.add(index(world, n.x, n.y)); }
        }
        if (edge) forestEdge.push(i);
      }
      if (isWaterTile(t)) {
        water.push(i);
        (t.terrain === 'river' ? river : lake).push(i);
        for (const n of neighbors4(world, x, y)) {
          if (isOpenGround(tileAt(world, n.x, n.y))) banks.add(index(world, n.x, n.y));
        }
      }
      if (t.terrain === 'wetland') banks.add(i);
      if ((t.terrain === 'meadow' || t.terrain === 'field') && !isBuiltTile(t)) flowers.push(i);
      if (isBuiltTile(t)) built.push(i);
    }
  }
  // La ville vue du ciel : les îlots bâtis et leur voisinage immédiat, sauf les tours (niveau 3).
  const town = new Set();
  for (const i of built) {
    const x = i % world.cols;
    const y = Math.floor(i / world.cols);
    for (const p of [{ x, y }, ...neighbors8(world, x, y)]) {
      const t = tileAt(world, p.x, p.y);
      if (t.building && t.building.level >= 3) continue;
      town.add(index(world, p.x, p.y));
    }
  }
  const sorted = (set) => Array.from(set).sort((a, b) => a - b);
  const bigMassifs = massifs.filter((m) => m.size >= 4);
  const desired = {
    deer: bigMassifs.reduce((s, m) => s + (m.size >= 8 ? 2 : 1), 0),
    owl: Math.min(2, bigMassifs.length),
    fox: forestEdge.length >= 2 ? Math.min(3, 1 + Math.floor(forestEdge.length / 8)) : 0,
    duck: water.length >= 2 ? Math.min(6, 1 + Math.floor(water.length / 4)) : 0,
    heron: banks.size >= 1 ? Math.min(3, 1 + Math.floor(banks.size / 5)) : 0,
    otter: river.length >= 5 ? (river.length >= 14 ? 2 : 1) : 0,
    bee: flowers.length >= 1 ? Math.min(5, 1 + Math.floor(flowers.length / 4)) : 0,
    swallow: built.length >= 3 ? Math.min(4, 1 + Math.floor(built.length / 8)) : 0,
  };
  return {
    massifs, forestEdge, edgeMeadow: sorted(edgeMeadow), water, river, lake, banks: sorted(banks), flowers,
    town: sorted(town), built, desired,
  };
}

/** Cases d'habitat d'une espèce (hors cerf et chouette, attachés à un massif). */
function speciesTiles(h, species) {
  switch (species) {
    case 'fox': return h.forestEdge.concat(h.edgeMeadow);
    case 'duck': return h.water;
    case 'heron': return h.banks;
    case 'otter': return h.river;
    case 'bee': return h.flowers;
    case 'swallow': return h.town;
    case 'owl': return h.forestEdge;
    default: return [];
  }
}

// ---------------------------------------------------------------------------------------------
// Contexte dérivé du monde (recalculé à chaque changement de monde).

function buildContext(world) {
  const graph = streetGraph(world);
  const homes = [];
  const jobs = [];
  const shops = [];
  const factories = [];
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const t = tileAt(world, x, y);
      if (!t.building) continue;
      const i = index(world, x, y);
      if (residentsOfTile(t) > 0) homes.push({ x, y, i, level: t.building.level || 1 });
      if (jobsOfTile(t) > 0) jobs.push(i);
      if (t.building.type === 'shop' || t.building.type === 'market') shops.push(i);
      if (t.building.type === 'factory') factories.push(i);
    }
  }
  let trafficTotal = 0;
  for (const e of graph.trafficEdges) trafficTotal += e.traffic;
  const cornerTiles = new Map(); // coin → cases dont il est un sommet (pour cibler une case)
  return { world, graph, homes, jobs, shops, factories, trafficTotal, habitats: habitatSummary(world), cornerTiles };
}

/** Ensemble des coins des cases listées. */
function cornersOfTiles(world, tileIndices) {
  const set = new Set();
  for (const i of tileIndices) {
    const x = i % world.cols;
    const y = Math.floor(i / world.cols);
    for (const c of cornersOfTile(world, x, y)) set.add(cornerIndex(world, c.cx, c.cy));
  }
  return set;
}

// ---------------------------------------------------------------------------------------------
// Création des acteurs.

function baseActor(actors, kind, model, x, z) {
  const def = ACTOR_MODELS[model];
  return {
    id: actors.nextId++,
    kind,
    group: def.group,
    model,
    anim: def.anim,
    x, y: 0, z,
    yaw: 0, targetYaw: 0, turn: 0,
    speed: 0,
    state: 'idle',
    phase: actors.rng.next(),
    path: [],
    home: null,
    ttl: 0,
    stride: def.stride,
    flap: def.flap || 6,
    bridge: false,
    hidden: false,
    edge: null,
  };
}

/** Coins d'un quartier qui touchent au moins une rue. */
function streetCornersOfHome(ctx, home) {
  const out = [];
  for (const c of cornersOfTile(ctx.world, home.x, home.y)) {
    const i = cornerIndex(ctx.world, c.cx, c.cy);
    if (ctx.graph.degree[i] > 0) out.push(i);
  }
  return out;
}

function spawnHabitant(actors, ctx, home) {
  const rng = actors.rng;
  const corners = streetCornersOfHome(ctx, home);
  const c = corners.length ? rng.pick(corners) : cornerIndex(ctx.world, home.x, home.y);
  const p = cornerXZ(ctx.world, c);
  const lane = SIDEWALK_OFFSET + rng.range(-0.02, 0.02);
  // Sur le trottoir, au coin de sa maison : décalé du coin vers l'intérieur de la case, sur les deux axes.
  const a = baseActor(actors, 'habitant', rng.pick(CITIZEN_MODELS), p.x + (home.x + 0.5 > p.x ? lane : -lane), p.z + (home.y + 0.5 > p.z ? lane : -lane));
  a.home = { x: home.x, y: home.y };
  a.lane = lane;
  a.corner = c;
  a.away = false;
  a.corners = null;
  a.ttl = rng.range(0.5, 4);
  a.yaw = rng.range(-Math.PI, Math.PI);
  a.targetYaw = a.yaw;
  actors.list.push(a);
  return a;
}

/** Choisit la prochaine course d'un habitant : vers un emploi ou un commerce, puis retour, sinon flânerie. */
function planHabitant(actors, ctx, a) {
  const { world, graph } = ctx;
  const rng = actors.rng;
  let corners = null;
  if (a.away && a.corners && a.corners.length > 1) {
    corners = a.corners.slice().reverse();
  } else {
    const homeCorners = streetCornersOfHome(ctx, a.home);
    const homeI = index(world, a.home.x, a.home.y);
    // Le trajet part du coin où l'habitant se tient (sinon il couperait à travers sa maison).
    const start = Number.isInteger(a.corner) && graph.degree[a.corner] > 0 ? [a.corner] : homeCorners;
    const pools = [ctx.jobs, ctx.shops].filter((l) => l.some((i) => i !== homeI));
    if (pools.length && start.length) {
      const pool = rng.pick(pools).filter((i) => i !== homeI);
      const goal = cornersOfTiles(world, pool);
      const homeSet = new Set(homeCorners);
      corners = bfsPath(graph, start, (c) => goal.has(c) && !homeSet.has(c), rng);
    }
    if (!corners && start.length) corners = randomWalk(graph, start[0], rng.int(2, 5), rng);
    a.away = false;
  }
  if (!corners || corners.length < 2) {
    a.state = 'idle';
    a.ttl = rng.range(2, 6);
    return;
  }
  a.corners = corners;
  a.away = !a.away;
  a.path = offsetPath(world, corners, a.lane);
  // Départ en virage depuis le trottoir d'arrivée : on contourne le coin du pâté plutôt que de couper.
  if (a.arrive && a.path.length) {
    const c = cornerXZ(world, corners[0]);
    const n1 = cornerXZ(world, corners[1]);
    const dx2 = Math.sign(n1.x - c.x), dz2 = Math.sign(n1.z - c.z);
    const d1 = a.arrive;
    const straight = d1.dx === dx2 && d1.dz === dz2;
    const back = d1.dx === -dx2 && d1.dz === -dz2;
    if (!straight && !back) a.path[0] = { x: c.x + (-d1.dz - dz2) * a.lane, z: c.z + (d1.dx + dx2) * a.lane, edge: null };
  }
  a.state = 'walk';
  a.corner = corners[corners.length - 1];
}

/** Direction (dx, dz) du dernier segment d'une suite de coins. */
function lastDirection(world, corners) {
  if (!corners || corners.length < 2) return null;
  const a = cornerXZ(world, corners[corners.length - 2]);
  const b = cornerXZ(world, corners[corners.length - 1]);
  return { dx: Math.sign(b.x - a.x), dz: Math.sign(b.z - a.z) };
}

function spawnVehicle(actors, ctx, kind, model) {
  const rng = actors.rng;
  const { world, graph } = ctx;
  if (!graph.trafficEdges.length) return null;
  const a = baseActor(actors, kind, model, 0, 0);
  a.state = 'drive';
  a.speed = DRIVE_SPEED;
  a.wait = 0;
  a.uturn = false;
  // Une arête chargée au hasard (pondérée par le trafic ; les camions près des usines), un sens, une position libre.
  for (let attempt = 0; attempt < 10; attempt++) {
    const e = pickTrafficEdge(ctx, rng, kind === 'truck' ? ctx.factories : null);
    const forward = rng.chance(0.5);
    const from = forward ? e.a : e.b;
    const to = forward ? e.b : e.a;
    const s = rng.range(0.05, 0.9);
    const key = laneKey(e.ref, from);
    const blocked = actors.list.some((o) => o.group === 'vehicle' && o.laneKey === key && Math.abs(o.s - s) < FOLLOW_DISTANCE);
    if (blocked && attempt < 9) continue;
    setLane(world, a, e.ref, from, to, s);
    a.yaw = a.targetYaw;
    break;
  }
  if (!a.laneKey) return null;
  actors.list.push(a);
  return a;
}

/** Une arête à trafic, tirée au sort proportionnellement à son trafic (près des cases `near` si données). */
function pickTrafficEdge(ctx, rng, near) {
  const edges = ctx.graph.trafficEdges;
  let pool = edges;
  if (near && near.length) {
    const corners = cornersOfTiles(ctx.world, near);
    const close = edges.filter((e) => corners.has(e.a) || corners.has(e.b));
    if (close.length) pool = close;
  }
  let total = 0;
  for (const e of pool) total += e.traffic;
  let r = rng.range(0, total);
  for (const e of pool) { r -= e.traffic; if (r <= 0) return e; }
  return pool[pool.length - 1];
}

function laneKey(ref, from) { return `${ref.kind}${ref.index}:${from}`; }

/** Place un véhicule sur la voie de droite de l'arête `ref`, du coin `from` vers `to`, à l'abscisse `s`. */
function setLane(world, a, ref, from, to, s) {
  const pa = cornerXZ(world, from);
  const pb = cornerXZ(world, to);
  a.lane = { ref, from, to, ax: pa.x, az: pa.z, dx: pb.x - pa.x, dz: pb.z - pa.z };
  a.laneKey = laneKey(ref, from);
  a.s = s;
  a.edge = ref;
  a.bridge = edgeValue(world, ref) === EDGE.BRIDGE;
  a.targetYaw = Math.atan2(a.lane.dx, a.lane.dz);
  placeOnLane(a);
}

function placeOnLane(a) {
  const l = a.lane;
  // Après un demi-tour, le véhicule glisse de la voie de gauche à celle de droite sur le premier quart de l'arête.
  const side = a.uturn ? -1 + 2 * clamp(a.s / 0.25, 0, 1) : 1;
  const off = LANE_OFFSET * side;
  a.x = l.ax + l.dx * a.s - l.dz * off;
  a.z = l.az + l.dz * a.s + l.dx * off;
  if (a.uturn && a.s >= 0.25) a.uturn = false;
}

/** Choisit la prochaine arête d'un véhicule arrivé au coin `a.lane.to`. */
function nextLane(actors, ctx, a) {
  const { world, graph } = ctx;
  const rng = actors.rng;
  const here = a.lane.to;
  const back = a.lane.from;
  if (a.route) {
    // Le bus suit sa ligne dans les deux sens.
    const r = a.route;
    let next = a.routeIndex + a.routeDir;
    if (next < 0 || next >= r.length) { a.routeDir = -a.routeDir; next = a.routeIndex + a.routeDir; a.uturn = true; }
    const ref = edgeBetween(world, here, r[next]);
    a.routeIndex = next;
    setLane(world, a, ref, here, r[next], 0);
    return;
  }
  const options = graph.adj[here].filter((e) => e.traffic > 0 && e.to !== back);
  let choice;
  if (options.length) {
    let total = 0;
    for (const e of options) total += e.traffic;
    let r = rng.range(0, total);
    choice = options[options.length - 1];
    for (const e of options) { r -= e.traffic; if (r <= 0) { choice = e; break; } }
  } else {
    choice = graph.adj[here].find((e) => e.to === back && e.traffic > 0) || graph.adj[here].find((e) => e.to === back);
    a.uturn = true;
  }
  if (!choice) { a.dead = true; return; }
  setLane(world, a, choice.ref, here, choice.to, 0);
}

/** Ligne de bus : le plus long trajet quartier → emploi (en coins), ou null. */
function busRoute(ctx) {
  const { world } = ctx;
  let best = null;
  for (const h of ctx.homes) {
    const trip = shortestTrip(world, h.x, h.y, (t) => jobsOfTile(t) > 0);
    if (!trip || trip.length < 3) continue;
    if (!trip.every((ref) => edgeValue(world, ref) >= EDGE.STREET)) continue;
    if (!best || trip.length > best.length) best = trip;
  }
  if (!best) return null;
  // Arêtes → coins : chaque arête partage un coin avec la suivante.
  const cornersOf = (ref) => (ref.kind === 'h'
    ? [cornerIndex(world, ref.x, ref.y), cornerIndex(world, ref.x + 1, ref.y)]
    : [cornerIndex(world, ref.x, ref.y), cornerIndex(world, ref.x, ref.y + 1)]);
  const route = [];
  for (let i = 0; i < best.length; i++) {
    const [p, q] = cornersOf(best[i]);
    if (i === 0) {
      const [np, nq] = cornersOf(best[1]);
      const shared = (p === np || p === nq) ? p : q;
      route.push(shared === p ? q : p, shared);
    } else {
      const last = route[route.length - 1];
      if (p === last) route.push(q); else if (q === last) route.push(p); else return null;
    }
  }
  return route;
}

function spawnAnimal(actors, ctx, species, habitat, massif = null) {
  const rng = actors.rng;
  const { world } = ctx;
  if (!habitat.length) return null;
  // On évite les cases déjà occupées par la même espèce quand c'est possible.
  const taken = new Set(actors.list.filter((o) => o.kind === species).map((o) => tileIndexAt(world, o.x, o.z)));
  const free = habitat.filter((i) => !taken.has(i));
  const tile = rng.pick(free.length ? free : habitat);
  const p = pointInTile(world, tile, rng);
  const a = baseActor(actors, species, species, p.x, p.z);
  a.habitat = habitat;
  a.habitatSet = new Set(habitat);
  a.massif = massif;
  a.yaw = rng.range(-Math.PI, Math.PI);
  a.targetYaw = a.yaw;
  a.ttl = rng.range(0.5, 3);
  switch (species) {
    case 'duck': a.state = 'swim'; a.speed = 0; break;
    case 'otter': a.state = 'swim'; a.speed = 0.35; a.leg = 'down'; break;
    case 'bee': a.state = 'fly'; a.y = FLIGHT.bee; a.speed = 0.7; a.ttl = 0; break;
    case 'swallow': a.state = 'fly'; a.y = 2.0; a.speed = 1.6; a.ttl = 0; a.clock = rng.range(0, TAU); break;
    case 'owl': {
      a.state = 'idle'; a.y = FLIGHT.owlPerch;
      // Perchée au bord du bois, du côté de la clairière.
      const tx = tile % world.cols, ty = Math.floor(tile / world.cols);
      const open = neighbors4(world, tx, ty).filter((n) => isOpenGround(tileAt(world, n.x, n.y)));
      if (open.length) {
        const n = rng.pick(open);
        a.x = tx + 0.5 + (n.x - tx) * 0.3;
        a.z = ty + 0.5 + (n.y - ty) * 0.3;
        a.yaw = Math.atan2(n.x - tx, n.y - ty);
        a.targetYaw = a.yaw;
      }
      a.ttl = rng.range(4, 10);
      break;
    }
    default: a.state = 'idle';
  }
  actors.list.push(a);
  return a;
}

// ---------------------------------------------------------------------------------------------
// Synchronisation avec le monde.

/** Effectifs d'habitants souhaités par quartier, plafonnés (tour de rôle entre quartiers). */
function habitantQuota(ctx, cap) {
  const quota = new Map();
  let total = 0;
  for (const h of ctx.homes) { quota.set(h.i, 0); total += RESIDENTS_PER_LEVEL[h.level] || 2; }
  const budget = Math.min(cap, total);
  let given = 0;
  for (let round = 0; given < budget; round++) {
    let progressed = false;
    for (const h of ctx.homes) {
      if (given >= budget) break;
      if (round < (RESIDENTS_PER_LEVEL[h.level] || 2)) { quota.set(h.i, quota.get(h.i) + 1); given++; progressed = true; }
    }
    if (!progressed) break;
  }
  return quota;
}

/** Chemin encore valable : toutes ses arêtes sont des rues. */
function pathStillValid(world, a) {
  if (a.group !== 'habitant') return true;
  for (const p of a.path) if (p.edge && edgeValue(world, p.edge) < EDGE.STREET) return false;
  return true;
}

/**
 * Met les acteurs en accord avec un nouveau monde : treillis des rues, trafic et habitats recalculés ;
 * les acteurs encore valables sont gardés, les autres retirés, les manquants créés. Mutation en place.
 */
export function syncActors(actors, world) {
  const ctx = buildContext(world);
  actors.world = world;
  actors.ctx = ctx;
  const rng = actors.rng;
  const caps = actors.caps;
  const keep = [];

  // --- Habitants : un quota par quartier.
  const quota = habitantQuota(ctx, caps.habitant);
  const have = new Map();
  for (const a of actors.list) {
    if (a.group !== 'habitant') continue;
    const hi = a.home ? index(world, a.home.x, a.home.y) : -1;
    const q = quota.get(hi) || 0;
    const n = have.get(hi) || 0;
    if (n >= q) continue;
    have.set(hi, n + 1);
    if (!pathStillValid(world, a)) {
      // La rue a disparu sous ses pas : on le ramène devant chez lui.
      const corners = streetCornersOfHome(ctx, { x: a.home.x, y: a.home.y });
      const c = corners.length ? rng.pick(corners) : cornerIndex(world, a.home.x, a.home.y);
      const p = cornerXZ(world, c);
      a.x = p.x + (a.home.x + 0.5 > p.x ? a.lane : -a.lane);
      a.z = p.z + (a.home.y + 0.5 > p.z ? a.lane : -a.lane);
      a.corner = c;
      a.path = []; a.corners = null; a.away = false; a.state = 'idle'; a.ttl = rng.range(1, 3);
    }
    keep.push(a);
  }
  for (const a of actors.list) if (a.group !== 'habitant') keep.push(a);
  actors.list = keep;
  for (const h of ctx.homes) {
    const q = quota.get(h.i) || 0;
    for (let n = have.get(h.i) || 0; n < q; n++) spawnHabitant(actors, ctx, h);
  }

  // --- Véhicules : effectif d'après le trafic total ; camions près des usines ; un bus sur la plus longue ligne.
  const trafficAlive = new Set(ctx.graph.trafficEdges.map((e) => `${e.ref.kind}${e.ref.index}`));
  const route = ctx.homes.length && ctx.jobs.length ? busRoute(ctx) : null;
  let desiredVehicles = ctx.graph.trafficEdges.length ? Math.min(caps.vehicle, Math.max(1, Math.round(ctx.trafficTotal / 2.5))) : 0;
  const wantBus = route && desiredVehicles >= 4 ? 1 : 0;
  const wantTrucks = ctx.shops.length ? Math.min(3, ctx.factories.length, Math.max(0, desiredVehicles - wantBus - 1)) : 0;
  const wantCars = Math.max(0, desiredVehicles - wantBus - wantTrucks);
  const wants = { car: wantCars, truck: wantTrucks, bus: wantBus };
  const counts = { car: 0, truck: 0, bus: 0 };
  const routeKey = route ? route.join(',') : '';
  actors.list = actors.list.filter((a) => {
    if (a.group !== 'vehicle') return true;
    if (a.dead || !a.lane || !trafficAlive.has(`${a.lane.ref.kind}${a.lane.ref.index}`)) return false;
    if (edgeValue(world, a.lane.ref) < EDGE.STREET) return false;
    if (a.kind === 'bus' && (a.route || []).join(',') !== routeKey) return false;
    if (counts[a.kind] >= wants[a.kind]) return false;
    counts[a.kind]++;
    a.bridge = edgeValue(world, a.lane.ref) === EDGE.BRIDGE;
    return true;
  });
  for (let n = counts.bus; n < wants.bus; n++) {
    const a = spawnVehicle(actors, ctx, 'bus', 'bus');
    if (!a) break;
    // Le bus démarre sur sa ligne.
    a.route = route; a.routeIndex = 0; a.routeDir = 1;
    setLane(world, a, edgeBetween(world, route[0], route[1]), route[0], route[1], 0.1);
    a.routeIndex = 1;
    a.yaw = a.targetYaw;
  }
  for (let n = counts.truck; n < wants.truck; n++) if (!spawnVehicle(actors, ctx, 'truck', 'truck')) break;
  for (let n = counts.car; n < wants.car; n++) if (!spawnVehicle(actors, ctx, 'car', rng.pick(['car-a', 'car-b']))) break;

  // --- Faune : effectifs au prorata des habitats, plafond global.
  const h = ctx.habitats;
  const alloc = allocate(h.desired, caps.animal);
  const bigMassifs = h.massifs.filter((m) => m.size >= 4);
  // Cerfs et chouettes : attachés à un massif (le plus grand d'abord).
  const massifQuota = (species, budget) => {
    const out = [];
    for (const m of bigMassifs) {
      const want = species === 'deer' ? (m.size >= 8 ? 2 : 1) : 1;
      for (let k = 0; k < want && out.length < budget; k++) out.push(m);
    }
    return out;
  };
  const kept = { deer: 0, owl: 0 };
  const perMassif = new Map();
  actors.list = actors.list.filter((a) => {
    if (a.group !== 'animal') return true;
    const here = tileIndexAt(world, a.x, a.z);
    if (a.kind === 'deer' || a.kind === 'owl') {
      const m = bigMassifs.find((mm) => mm.tiles.includes(here));
      if (!m) return false;
      const slots = massifQuota(a.kind, alloc[a.kind] || 0).filter((mm) => mm === m).length;
      const key = `${a.kind}:${m.tiles[0]}`;
      const n = perMassif.get(key) || 0;
      if (n >= slots) return false;
      perMassif.set(key, n + 1);
      kept[a.kind]++;
      a.habitat = m.tiles; a.habitatSet = new Set(m.tiles); a.massif = m;
      if (a.kind === 'owl' && here !== -1 && !h.forestEdge.includes(here)) return false;
      return true;
    }
    const tiles = speciesTiles(h, a.kind);
    if (!tiles.includes(here)) return false;
    kept[a.kind] = (kept[a.kind] || 0) + 1;
    if (kept[a.kind] > (alloc[a.kind] || 0)) return false;
    a.habitat = tiles; a.habitatSet = new Set(tiles);
    if (!a.path.every((p) => a.habitatSet.has(tileIndexAt(world, p.x, p.z)))) { a.path = []; a.ttl = 0.1; if (a.kind === 'heron' && a.state === 'fly') a.flight = null; }
    return true;
  });
  for (const species of SPECIES) {
    const want = alloc[species] || 0;
    const now = kept[species] || 0;
    if (species === 'deer' || species === 'owl') {
      const slots = massifQuota(species, want);
      for (let k = now; k < slots.length; k++) {
        const m = slots[k];
        const tiles = species === 'owl' ? m.tiles.filter((i) => h.forestEdge.includes(i)) : m.tiles;
        spawnAnimal(actors, ctx, species, tiles.length ? tiles : m.tiles, m);
      }
    } else {
      const tiles = speciesTiles(h, species);
      for (let k = now; k < want; k++) if (!spawnAnimal(actors, ctx, species, tiles)) break;
    }
  }
  return actors;
}

/**
 * Crée les acteurs d'un monde. `seed` : graine (celle du monde par défaut) ; `options.caps` surcharge
 * les plafonds (la fixture de charge les double).
 */
export function createActors(world, seed = world.seed, options = {}) {
  const rng = typeof seed === 'number' ? createRng((seed ^ 0xA11CE) >>> 0, 'actors') : createRng(seed, 'actors');
  const actors = {
    rng,
    list: [],
    caps: { ...CAPS, ...(options.caps || {}) },
    nextId: 1,
    time: 0,
    world: null,
    ctx: null,
  };
  return syncActors(actors, world);
}

// ---------------------------------------------------------------------------------------------
// Mise à jour.

/** Cadence de la phase (cycles / s) selon l'état. */
function phaseRate(a) {
  switch (a.state) {
    case 'walk': case 'run': case 'swim': case 'drive': return a.speed / a.stride;
    case 'fly': return a.flap;
    case 'hover': return a.flap;
    case 'dive': return 2;
    default: return 0.5;
  }
}

function advancePhase(a, dt) {
  a.phase += phaseRate(a) * dt;
  if (a.phase >= 1 || a.phase < 0) a.phase -= Math.floor(a.phase);
}

function updateHabitant(actors, ctx, a, dt) {
  if (a.state === 'walk') {
    a.speed = WALK_SPEED;
    const done = followPath(a, dt, a.speed);
    if (a.edge) a.bridge = edgeValue(ctx.world, a.edge) === EDGE.BRIDGE;
    turnToward(a, a.targetYaw, dt, 10);
    if (done) { a.state = 'idle'; a.speed = 0; a.ttl = actors.rng.range(1, 3); a.turn = 0; a.arrive = lastDirection(ctx.world, a.corners); } // pause courte : la ville doit rester vivante
  } else {
    a.speed = 0;
    a.ttl -= dt;
    if (a.ttl <= 0) planHabitant(actors, ctx, a);
  }
}

/** Groupe les véhicules par voie (clé) et par abscisse croissante : pour trouver celui qui précède. */
function laneIndex(actors) {
  const lanes = new Map();
  for (const a of actors.list) {
    if (a.group !== 'vehicle' || !a.laneKey) continue;
    let list = lanes.get(a.laneKey);
    if (!list) { list = []; lanes.set(a.laneKey, list); }
    list.push(a);
  }
  for (const list of lanes.values()) list.sort((p, q) => p.s - q.s || p.id - q.id);
  return lanes;
}

function updateVehicle(actors, ctx, a, dt, lanes) {
  if (a.state === 'idle') {
    a.speed = 0;
    a.wait -= dt;
    if (a.wait <= 0) {
      nextLane(actors, ctx, a);
      if (a.dead) return;
      a.state = 'drive';
    }
    return;
  }
  // Vitesse visée : pleine, ou réduite derrière le véhicule qui précède sur la même voie.
  let desired = DRIVE_SPEED;
  const list = lanes.get(a.laneKey);
  if (list && list.length > 1) {
    const k = list.indexOf(a);
    const leader = list[k + 1];
    if (leader) {
      const gap = leader.s - a.s;
      desired = DRIVE_SPEED * clamp((gap - 0.25) / (FOLLOW_DISTANCE - 0.25), 0, 1);
    }
  }
  const accel = desired > a.speed ? 2.0 : 4.0;
  a.speed = desired > a.speed ? Math.min(desired, a.speed + accel * dt) : Math.max(desired, a.speed - accel * dt);
  a.s += a.speed * dt;
  if (a.s >= 1) {
    a.s = 1;
    placeOnLane(a);
    const node = a.lane.to;
    const endOfLine = a.route && (a.routeIndex === 0 || a.routeIndex === a.route.length - 1);
    if (ctx.graph.degree[node] >= 3 || endOfLine) {
      a.state = 'idle';
      a.wait = endOfLine ? 1.5 : NODE_STOP;
      a.speed = 0;
    } else {
      nextLane(actors, ctx, a);
    }
  } else {
    placeOnLane(a);
  }
  turnToward(a, a.targetYaw, dt, 7);
}

/** Point suivant d'une promenade : vers une case d'habitat voisine (4 côtés), sinon ailleurs dans la case. */
function nextHabitatPoint(world, a, rng, margin = TILE_MARGIN) {
  const here = tileIndexAt(world, a.x, a.z);
  const tx = here % world.cols;
  const ty = Math.floor(here / world.cols);
  const options = neighbors4(world, tx, ty).map((n) => index(world, n.x, n.y)).filter((i) => a.habitatSet.has(i));
  const tile = options.length && rng.chance(0.75) ? rng.pick(options) : here;
  return pointInTile(world, tile, rng, margin);
}

/** Enchaîne `n` points de promenade dans l'habitat. */
function wanderPath(world, a, rng, n, margin = TILE_MARGIN) {
  const pts = [];
  const probe = { x: a.x, z: a.z, habitatSet: a.habitatSet };
  for (let k = 0; k < n; k++) {
    const p = nextHabitatPoint(world, probe, rng, margin);
    pts.push({ x: p.x, z: p.z, edge: null });
    probe.x = p.x; probe.z = p.z;
  }
  return pts;
}

function updateQuadruped(actors, ctx, a, dt) {
  const rng = actors.rng;
  if (a.state === 'walk' || a.state === 'run') {
    const done = followPath(a, dt, a.speed);
    turnToward(a, a.targetYaw, dt, 4);
    if (done) { a.state = 'idle'; a.speed = 0; a.ttl = a.kind === 'deer' ? rng.range(3, 8) : rng.range(1.5, 5); a.turn = 0; }
  } else {
    a.ttl -= dt;
    if (a.ttl <= 0) {
      const run = rng.chance(a.kind === 'fox' ? 0.2 : 0.1);
      a.state = run ? 'run' : 'walk';
      a.speed = a.kind === 'deer' ? (run ? 0.9 : 0.25) : (run ? 1.0 : 0.4);
      a.path = wanderPath(ctx.world, a, rng, run ? 2 : rng.int(1, 3));
    }
  }
}

function updateDuck(actors, ctx, a, dt) {
  const rng = actors.rng;
  if (a.path.length) {
    a.speed = 0.2;
    const done = followPath(a, dt, a.speed);
    turnToward(a, a.targetYaw, dt, 3);
    if (done) { a.speed = 0; a.ttl = rng.range(2, 5); a.turn = 0; }
  } else {
    a.speed = 0;
    a.ttl -= dt;
    if (a.ttl <= 0) a.path = wanderPath(ctx.world, a, rng, rng.int(1, 2));
  }
  a.state = 'swim';
}

function updateHeron(actors, ctx, a, dt) {
  const rng = actors.rng;
  if (a.state === 'fly') {
    const f = a.flight;
    f.t += dt;
    const done = followPath(a, dt, a.speed);
    turnToward(a, a.targetYaw, dt, 3);
    // Montée puis descente : profil en cloche sur la durée du vol.
    const edge = Math.min(f.t, f.total - f.t) / (0.3 * f.total);
    const k = clamp(edge, 0, 1);
    a.y = FLIGHT.heron * (k * k * (3 - 2 * k));
    if (done || f.t >= f.total) { a.state = 'idle'; a.y = 0; a.speed = 0; a.ttl = rng.range(6, 14); a.flight = null; a.turn = 0; }
    return;
  }
  if (a.state === 'walk') {
    const done = followPath(a, dt, a.speed);
    turnToward(a, a.targetYaw, dt, 2);
    if (done) { a.state = 'idle'; a.speed = 0; a.ttl = rng.range(6, 14); a.turn = 0; }
    return;
  }
  a.ttl -= dt;
  if (a.ttl > 0) return;
  if (rng.chance(0.35)) {
    // Envol de 3 à 5 s en boucle sur ses berges : on allonge la boucle jusqu'à ≈ 2,4 u pour que le vol
    // dure assez à une vitesse crédible (0,5 à 0,8 u/s).
    const pts = [];
    let length = 0;
    let px = a.x, pz = a.z;
    const probe = { x: a.x, z: a.z, habitatSet: a.habitatSet };
    for (let k = 0; k < 14 && length < 2.4; k++) {
      const p = nextHabitatPoint(ctx.world, probe, rng, 0.25);
      pts.push({ x: p.x, z: p.z, edge: null });
      length += Math.hypot(p.x - px, p.z - pz);
      px = p.x; pz = p.z; probe.x = p.x; probe.z = p.z;
    }
    const total = clamp(length / 0.8, 3, 5);
    a.path = pts;
    a.speed = length / total;
    a.flight = { t: 0, total };
    a.state = 'fly';
  } else {
    a.path = wanderPath(ctx.world, a, rng, 1);
    a.speed = 0.2;
    a.state = 'walk';
  }
}

/** Suite de cases de rivière dans le sens du courant (`flow`) à partir de la case `start`. */
function downstream(world, start, maxTiles) {
  const out = [start];
  let cur = start;
  for (let k = 0; k < maxTiles; k++) {
    const t = world.tiles[cur];
    const d = DIRS4.find((e) => e.dir === t.flow);
    if (!d) break;
    const nx = cur % world.cols + d.dx;
    const ny = Math.floor(cur / world.cols) + d.dy;
    if (!inBounds(world, nx, ny)) break;
    const j = index(world, nx, ny);
    if (world.tiles[j].terrain !== 'river') break;
    out.push(j);
    cur = j;
  }
  return out;
}

function updateOtter(actors, ctx, a, dt) {
  const rng = actors.rng;
  const { world } = ctx;
  if (a.state === 'dive') {
    // Plonge (0,6 s), file sous l'eau vers l'amont, remonte.
    a.ttl -= dt;
    if (a.leg === 'down') {
      a.y = Math.max(-0.25, a.y - 0.5 * dt);
      a.hidden = a.y < -0.12;
      if (a.ttl <= 0) { a.leg = 'under'; a.speed = 1.0; }
    } else if (a.leg === 'under') {
      a.hidden = true;
      const done = followPath(a, dt, a.speed);
      turnToward(a, a.targetYaw, dt, 6);
      if (done) { a.leg = 'up'; a.speed = 0; a.ttl = rng.range(0.5, 1.5); }
    } else {
      a.ttl -= dt;
      if (a.ttl <= 0) {
        a.y = Math.min(0, a.y + 0.5 * dt);
        a.hidden = a.y < -0.12;
        if (a.y >= 0) { a.state = 'swim'; a.hidden = false; a.ttl = 0; a.leg = 'down'; }
      }
    }
    return;
  }
  if (a.path.length) {
    a.speed = 0.35;
    const done = followPath(a, dt, a.speed);
    turnToward(a, a.targetYaw, dt, 3);
    if (done) {
      // Plongée : le chemin du retour (vers l'amont) est la suite des cases traversées, à l'envers.
      a.state = 'dive';
      a.ttl = 0.6;
      a.leg = 'down';
      a.speed = 0;
      a.path = (a.trail || []).slice().reverse().map((i) => {
        const p = pointInTile(world, i, rng, 0.3);
        return { x: p.x, z: p.z, edge: null };
      });
      a.trail = null;
    }
  } else {
    const here = tileIndexAt(world, a.x, a.z);
    const chain = downstream(world, here, rng.int(3, 6));
    if (chain.length < 2) {
      // Embouchure : une petite nage sur place puis plongée.
      a.path = wanderPath(world, a, rng, 1, 0.3);
      a.trail = [here];
    } else {
      a.trail = chain.slice(0, -1);
      a.path = chain.slice(1).map((i) => { const p = pointInTile(world, i, rng, 0.3); return { x: p.x, z: p.z, edge: null }; });
    }
    a.speed = 0.35;
    a.state = 'swim';
  }
}

function updateBee(actors, ctx, a, dt) {
  const rng = actors.rng;
  if (a.state === 'hover') {
    a.ttl -= dt;
    a.speed = 0;
    if (a.ttl <= 0) { a.state = 'fly'; a.path = wanderPath(ctx.world, a, rng, rng.int(2, 4), 0.2); a.speed = 0.7; }
    return;
  }
  if (!a.path.length) a.path = wanderPath(ctx.world, a, rng, rng.int(2, 4), 0.2);
  a.speed = 0.7;
  const done = followPath(a, dt, a.speed);
  turnToward(a, a.targetYaw, dt, 12);
  a.y = FLIGHT.bee + 0.03 * Math.sin(actors.time * 9 + a.id);
  if (done) { a.state = 'hover'; a.ttl = rng.range(0.5, 1.5); a.turn = 0; }
}

function updateSwallow(actors, ctx, a, dt) {
  const rng = actors.rng;
  if (!a.path.length) a.path = wanderPath(ctx.world, a, rng, rng.int(6, 10), 0.2);
  a.speed = 1.6;
  a.state = 'fly';
  followPath(a, dt, a.speed);
  turnToward(a, a.targetYaw, dt, 5);
  a.clock += dt;
  const mid = (FLIGHT.swallowMin + FLIGHT.swallowMax) / 2;
  const amp = (FLIGHT.swallowMax - FLIGHT.swallowMin) / 2;
  a.y = mid + amp * Math.sin(a.clock * 0.7);
}

function updateOwl(actors, ctx, a, dt) {
  const rng = actors.rng;
  a.state = 'idle';
  a.ttl -= dt;
  if (a.ttl <= 0) { a.targetYaw = a.yaw + rng.range(-1.2, 1.2); a.ttl = rng.range(4, 10); }
  turnToward(a, a.targetYaw, dt, 1.5);
}

/**
 * Fait avancer tous les acteurs de `dt` secondes (mutation en place). Un `world` différent de celui
 * de la dernière synchronisation déclenche `syncActors`. `dt` est borné à 0,1 s pour rester stable.
 */
export function updateActors(actors, world, dt) {
  if (actors.world !== world) syncActors(actors, world);
  const step = clamp(Number(dt) || 0, 0, 0.1);
  if (step <= 0) return actors;
  const ctx = actors.ctx;
  actors.time += step;
  const lanes = laneIndex(actors);
  for (const a of actors.list) {
    switch (a.group) {
      case 'habitant': updateHabitant(actors, ctx, a, step); break;
      case 'vehicle': updateVehicle(actors, ctx, a, step, lanes); break;
      default:
        switch (a.kind) {
          case 'deer': case 'fox': updateQuadruped(actors, ctx, a, step); break;
          case 'duck': updateDuck(actors, ctx, a, step); break;
          case 'heron': updateHeron(actors, ctx, a, step); break;
          case 'otter': updateOtter(actors, ctx, a, step); break;
          case 'bee': updateBee(actors, ctx, a, step); break;
          case 'swallow': updateSwallow(actors, ctx, a, step); break;
          case 'owl': updateOwl(actors, ctx, a, step); break;
          default: break;
        }
    }
    advancePhase(a, step);
  }
  if (actors.list.some((a) => a.dead)) actors.list = actors.list.filter((a) => !a.dead);
  return actors;
}

// ---------------------------------------------------------------------------------------------
// Statistiques.

/** Comptes par genre et par groupe : { total, byKind, byGroup, byModel }. */
export function actorsStats(actors) {
  const byKind = {};
  const byGroup = { habitant: 0, vehicle: 0, animal: 0 };
  const byModel = {};
  for (const a of actors.list) {
    byKind[a.kind] = (byKind[a.kind] || 0) + 1;
    byGroup[a.group] = (byGroup[a.group] || 0) + 1;
    byModel[a.model] = (byModel[a.model] || 0) + 1;
  }
  return { total: actors.list.length, byKind, byGroup, byModel };
}
