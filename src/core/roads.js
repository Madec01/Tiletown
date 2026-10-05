// Rues sur les arêtes (docs/GAME_DESIGN.md §4, docs/ARCHITECTURE.md §3).
//
// Les rues ne consomment aucune case : elles vivent sur les arêtes du treillis, entre deux cases.
// Valeurs d'arête : 0 rien, 1 passage piéton, 2 rue de façade ou de raccordement,
// 3 pont (rue entre deux cases de rivière). Les coins du treillis sont les nœuds des parcours.
//
// Toutes les fonctions sont pures : elles rendent un nouveau monde ou un résultat, sans toucher à
// l'ancien. Les natures plantées (famille `nature`) ne comptent pas comme bâties.

import {
  cloneWorld, tileAt, inBounds, edgeRef, edgeTiles, edgeValue, edgesOfTile,
  cornerIndex, cornerCoords, edgesOfCorner, createTraffic, createEdges, edgeCorners, DIRS4,
} from './grid.js';
import { ROAD_VERSION, frontageCandidates, isBlockInterior, courtyards, courtyardPaths, blockAt } from './blocks.js';
import { TERRAINS } from '../data/terrain.js';
import { isBuiltTile, jobsOfTile, residentsOfTile, YAW_BY_DIR } from '../data/tiles.js';

export const EDGE = Object.freeze({ NONE: 0, PATH: 1, STREET: 2, BRIDGE: 3 });

/** Coût de réutilisation d'une arête déjà équipée (chemin ou rue) par un tracé de raccordement. */
const REUSE_COST = 0.25;

// ---------------------------------------------------------------------------------------------
// Petite file de priorité (tas binaire) pour Dijkstra.

class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(cost, node) {
    const a = this.a;
    a.push({ cost, node });
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].cost <= a[i].cost) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l].cost < a[m].cost) m = l;
        if (r < a.length && a[r].cost < a[m].cost) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

// ---------------------------------------------------------------------------------------------
// Rues automatiques.

function isRiver(tile) {
  return Boolean(tile) && tile.terrain === 'river';
}

/**
 * Prépare les façades et les cours communes. Les rues existantes restent stables.
 * `connect` raccorde une ville générée / migrée ; les poses ordinaires ont déjà leur tracé payé.
 * `reset` migre l'ancien quadrillage en conservant les ponts, puis redessine les dessertes.
 */
export function rebuildRoads(world, { connect = false, reset = false } = {}) {
  let next = cloneWorld(world);
  next.roadVersion = ROAD_VERSION;
  next.avenues ||= createEdges(world.cols, world.rows);
  if (reset) {
    for (const kind of ['h', 'v']) {
      for (let i = 0; i < next.edges[kind].length; i++) {
        if (next.edges[kind][i] !== EDGE.BRIDGE) next.edges[kind][i] = EDGE.NONE;
      }
      next.avenues[kind].fill(0);
    }
  }
  // Les chemins de jardin sont dérivés : une démolition peut en enlever un.
  for (const kind of ['h', 'v']) for (let i = 0; i < next.edges[kind].length; i++) {
    if (next.edges[kind][i] === EDGE.PATH) next.edges[kind][i] = EDGE.NONE;
  }
  const root = findRoots(next)[0];
  const built = [];
  for (let y = 0; y < next.rows; y++) for (let x = 0; x < next.cols; x++) {
    if (isBuiltTile(tileAt(next, x, y))) built.push({ x, y });
  }
  built.sort((a, b) => (Math.abs(a.x-root.x)+Math.abs(a.y-root.y)) - (Math.abs(b.x-root.x)+Math.abs(b.y-root.y)) || a.y-b.y || a.x-b.x);
  for (const { x, y } of built) {
    const tile = tileAt(next, x, y);
    const candidates = frontageCandidates(next, x, y).filter(ref => edgeBuildCost(next, ref, { x, y }));
    if (!candidates.length && reset) {
      // Ancienne façade de berge, autorisée par le moteur précédent : ne pas enclaver sa maison.
      for (const [side, ref] of Object.entries(edgesOfTile(world, x, y))) {
        if (edgeValue(world, ref) >= EDGE.STREET) candidates.push({ ...ref, yaw: { s: 0, e: 90, n: 180, w: 270 }[side] });
      }
    }
    if (!candidates.length) continue;
    let front = candidates.find(ref => ref.yaw === tile.building.yaw && edgeValue(next, ref) >= EDGE.STREET)
      || candidates.find(ref => edgeValue(next, ref) >= EDGE.STREET)
      || candidates[0];
    if (connect && !(x === root.x && y === root.y)) {
      let plan = connectTile(next, x, y);
      if (!plan.ok && reset) plan = connectTile(next, x, y, { relax: true, legacy: world });
      if (plan.ok) {
        next = applyPath(next, plan.path);
        front = { ...edgesOfTile(next, x, y)[{ 0: 's', 90: 'e', 180: 'n', 270: 'w' }[plan.yaw]], yaw: plan.yaw };
      }
    }
    if (edgeValue(next, front) < EDGE.STREET) next.edges[front.kind][front.index] = EDGE.STREET;
    if (tile.building.type === 'townhall') next.avenues[front.kind][front.index] = 1;
    tileAt(next, x, y).building.yaw = front.yaw;
  }
  for (const court of courtyards(next)) for (const ref of courtyardPaths(next, court)) {
    if (edgeValue(next, ref) < EDGE.STREET) next.edges[ref.kind][ref.index] = EDGE.PATH;
  }
  // Parcs : une seule promenade reliée, pas une ceinture autour de chaque plantation.
  for (let y = 0; y < next.rows; y++) for (let x = 0; x < next.cols; x++) {
    const t = tileAt(next, x, y);
    if (t.building?.type !== 'park') continue;
    const ref = Object.values(edgesOfTile(next, x, y)).find(r => edgeCorners(r).some(c => edgesOfCorner(next, c.cx, c.cy).some(e => edgeValue(next, e.ref) >= EDGE.STREET)));
    if (ref && edgeValue(next, ref) === EDGE.NONE) next.edges[ref.kind][ref.index] = EDGE.PATH;
  }
  return next;
}

/** Décompte des arêtes par valeur : { path, street, bridge, total } (total = rues + ponts, pour l'entretien). */
export function countEdges(world) {
  const out = { path: 0, street: 0, bridge: 0, total: 0 };
  for (const arr of [world.edges.h, world.edges.v]) {
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (v === EDGE.PATH) out.path++;
      else if (v === EDGE.STREET) out.street++;
      else if (v === EDGE.BRIDGE) out.bridge++;
    }
  }
  out.total = out.street + out.bridge;
  return out;
}

// ---------------------------------------------------------------------------------------------
// Réseau : composante des coins reliés à la mairie par des chaussées (≥ 2).

function findRoots(world) {
  const built = [];
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const t = tileAt(world, x, y);
      if (t.building && t.building.type === 'townhall') return [{ x, y }];
      if (isBuiltTile(t) && built.length === 0) built.push({ x, y });
    }
  }
  return built; // sans mairie : le premier îlot bâti fait office de racine
}

/**
 * Ensemble (Set d'index de coins) des coins reliés à la mairie par des arêtes équipées.
 * Vide s'il n'y a aucun îlot bâti.
 */
export function networkCorners(world) {
  const seen = new Set();
  const roots = findRoots(world);
  if (roots.length === 0) return seen;
  const stack = [];
  for (const r of roots) {
    for (const c of accessCorners(world, r.x, r.y)) {
      const i = cornerIndex(world, c.cx, c.cy);
      if (!seen.has(i)) { seen.add(i); stack.push(c); }
    }
  }
  while (stack.length) {
    const c = stack.pop();
    for (const { ref, to } of edgesOfCorner(world, c.cx, c.cy)) {
      if (edgeValue(world, ref) < EDGE.STREET) continue;
      const i = cornerIndex(world, to.cx, to.cy);
      if (!seen.has(i)) { seen.add(i); stack.push(to); }
    }
  }
  return seen;
}

/** Coins accessibles par une chaussée qui longe réellement la parcelle. */
function accessCorners(world, x, y) {
  const unique = new Map();
  for (const ref of Object.values(edgesOfTile(world, x, y))) {
    if (edgeValue(world, ref) < EDGE.STREET) continue;
    for (const c of edgeCorners(ref)) unique.set(cornerIndex(world, c.cx, c.cy), c);
  }
  return [...unique.values()];
}

/** Vrai si une rue longeant la case (x, y) appartient au réseau. */
function touchesNetwork(world, x, y, net) {
  return Object.values(edgesOfTile(world, x, y)).some(ref => edgeValue(world, ref) >= EDGE.STREET && edgeCorners(ref).some(c => net.has(cornerIndex(world, c.cx, c.cy))));
}

/** Les îlots bâtis qui ne touchent pas le réseau de la mairie : [{ x, y }]. */
export function disconnectedTiles(world) {
  const net = networkCorners(world);
  const out = [];
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      if (isBuiltTile(tileAt(world, x, y)) && !touchesNetwork(world, x, y, net)) out.push({ x, y });
    }
  }
  return out;
}

/** Vrai si tous les îlots bâtis sont reliés au réseau de la mairie. */
export function networkConnected(world) {
  return disconnectedTiles(world).length === 0;
}

// ---------------------------------------------------------------------------------------------
// Raccordement d'une tuile isolée : plus court chemin sur les arêtes jusqu'au réseau.

/** Coût de passage d'une case pour une rue qui la longe (1 si bâtie ou cible), null si infranchissable. */
function tileRoadCost(tile, pos, target) {
  if (!tile) return null;
  if (isBuiltTile(tile) || (target && pos.x === target.x && pos.y === target.y)) return 1;
  return TERRAINS[tile.terrain].roadCost;
}

/**
 * Coût de construction d'une rue sur une arête, d'après ses deux cases :
 * - arête déjà équipée : réutilisée presque gratuitement ;
 * - rivière des deux côtés : pont (5) ;
 * - lac ou zone humide d'un côté : interdit (null) ;
 * - rivière d'un seul côté : la rue longe la berge, au coût de la terre ferme ;
 * - sinon moyenne des deux cases (herbe 1, champ 1, colline 2, forêt 3).
 * @returns {{ cost: number, bridge: boolean } | null}
 */
export function edgeBuildCost(world, ref, target = null) {
  const existing = edgeValue(world, ref);
  if (existing >= EDGE.PATH) return { cost: REUSE_COST, bridge: existing === EDGE.BRIDGE };
  const [a, b] = edgeTiles(world, ref);
  const ta = a ? tileAt(world, a.x, a.y) : null;
  const tb = b ? tileAt(world, b.x, b.y) : null;
  if (!ta && !tb) return null;
  if (isRiver(ta) && isRiver(tb)) return { cost: TERRAINS.river.roadCost, bridge: true };
  if (!ta || !tb) {
    // Arête du bord : une seule case ; pas de rue au bord de l'eau.
    const only = ta || tb;
    if (only.terrain === 'river' && !isBuiltTile(only)) return null;
    const c = tileRoadCost(only, a || b, target);
    return c === null ? null : { cost: c, bridge: false };
  }
  const ca = tileRoadCost(ta, a, target);
  const cb = tileRoadCost(tb, b, target);
  if (ca === null || cb === null) return null;
  if (isRiver(ta) && !isBuiltTile(ta)) return { cost: cb, bridge: false };
  if (isRiver(tb) && !isBuiltTile(tb)) return { cost: ca, bridge: false };
  return { cost: (ca + cb) / 2, bridge: false };
}

/**
 * Trace la rue la plus courte depuis la case (x, y) jusqu'au réseau existant (Dijkstra sur les coins).
 * @returns {{ ok: true, path: Array<{kind, index, x, y, value}>, cost: number, bridges: number, yaw: number }
 *          | { ok: false, reason: 'out_of_bounds' | 'no_network' | 'unreachable' }}
 * Une case qui touche déjà le réseau rend `{ ok: true, path: [], cost: 0, bridges: 0 }`.
 * Le tracé n'est pas appliqué : voir `applyPath`.
 */
export function connectTile(world, x, y, { relax = false, legacy = null } = {}) {
  if (!inBounds(world, x, y)) return { ok: false, reason: 'out_of_bounds' };
  const net = networkCorners(world);
  if (net.size === 0) return { ok: false, reason: 'no_network' };
  const target = { x, y };
  // Migration seulement : un ancien quai peut être l'unique accès à une maison. Réutiliser
  // ses tronçons nécessaires est préférable à abandonner le bâtiment ou rétablir tout le quadrillage.
  const buildCost = ref => legacy && edgeValue(legacy, ref) >= EDGE.STREET
    ? { cost: REUSE_COST, bridge: edgeValue(legacy, ref) === EDGE.BRIDGE } : edgeBuildCost(world, ref, target);
  let best = null;
  const fronts = relax ? Object.entries(edgesOfTile(world, x, y)).map(([side, ref]) => ({ ...ref, yaw: { n: 180, e: 90, s: 0, w: 270 }[side], exception: true })) : frontageCandidates(world, x, y);
  for (const front of fronts) {
    const fc = buildCost(front);
    if (!fc) continue;
    const n = (world.cols + 1) * (world.rows + 1);
    const dist = new Float64Array(n).fill(Infinity), prev = new Array(n).fill(null);
    const heap = new MinHeap();
    for (const c of edgeCorners(front)) {
      const i = cornerIndex(world, c.cx, c.cy);
      dist[i] = edgeValue(world, front) >= EDGE.STREET ? 0 : fc.cost;
      heap.push(dist[i], i);
    }
    let goal = -1;
    while (heap.size) {
      const { cost, node } = heap.pop();
      if (cost > dist[node]) continue;
      if (net.has(node)) { goal = node; break; }
      const c = cornerCoords(world, node);
      for (const { ref, to } of edgesOfCorner(world, c.cx, c.cy)) {
        const interior = isBlockInterior(world, ref) && edgeValue(world, ref) < EDGE.STREET;
        // Dernier recours : la seule ouverture d'une berge peut traverser l'îlot voisin.
        // La pénalité privilégie toujours le périmètre et limite cette desserte intérieure.
        if (interior && !relax && !(front.exception && edgeTiles(world, ref).some(p => p && blockAt(world, p.x, p.y).id === blockAt(world, x, y).id))) continue;
        const ec = buildCost(ref);
        if (!ec) continue;
        const j = cornerIndex(world, to.cx, to.cy), nd = cost + ec.cost + (interior ? 8 : 0);
        if (nd < dist[j]) { dist[j] = nd; prev[j] = { from: node, ref, bridge: ec.bridge }; heap.push(nd, j); }
      }
    }
    if (goal < 0 || (best && dist[goal] >= best.cost)) continue;
    const route = [];
    for (let node = goal; prev[node]; node = prev[node].from) {
      const { ref, bridge } = prev[node]; route.push({ ...ref, value: bridge ? EDGE.BRIDGE : EDGE.STREET });
    }
    route.reverse();
    const path = [...route, { kind: front.kind, index: front.index, x: front.x, y: front.y, value: EDGE.STREET }]
      .filter((ref, i, all) => edgeValue(world, ref) < EDGE.STREET && all.findIndex(r => r.kind === ref.kind && r.index === ref.index) === i)
      .map(ref => ({ ...ref, main: ref.value === EDGE.BRIDGE || (route.length >= 3 && !(ref.kind === front.kind && ref.index === front.index)) }));
    best = { ok: true, path, cost: dist[goal], bridges: path.filter(ref => ref.value === EDGE.BRIDGE).length, yaw: front.yaw };
  }
  return best || (relax ? { ok: false, reason: 'unreachable' } : connectTile(world, x, y, { relax: true, legacy }));
}

/**
 * Applique un tracé de `connectTile` : chaque arête du tracé devient une rue (ou un pont sur la rivière),
 * sans jamais rabaisser une arête existante.
 * @returns {object} un nouveau monde
 */
export function applyPath(world, path) {
  const next = cloneWorld(world);
  next.avenues ||= createEdges(world.cols, world.rows);
  for (const ref of path) {
    const [a, b] = edgeTiles(world, ref);
    const ta = a ? tileAt(world, a.x, a.y) : null;
    const tb = b ? tileAt(world, b.x, b.y) : null;
    const value = isRiver(ta) && isRiver(tb) ? EDGE.BRIDGE : (ref.value || EDGE.STREET);
    const arr = next.edges[ref.kind];
    arr[ref.index] = Math.max(arr[ref.index], value);
    if (ref.main || value === EDGE.BRIDGE) next.avenues[ref.kind][ref.index] = 1;
  }
  return next;
}

// ---------------------------------------------------------------------------------------------
// Orientation des bâtiments vers la rue.

/**
 * Orientation (degrés, multiple de 90) d'un bâtiment tourné vers sa rue la plus importante :
 * rue > chemin > rien ; à égalité, le côté qui regarde vers `towards` (la mairie, par exemple), puis
 * l'ordre sud, est, nord, ouest.
 */
export function faceTowardRoad(world, x, y, towards = null) {
  const edges = edgesOfTile(world, x, y);
  const order = ['S', 'E', 'N', 'W'];
  const refByDir = { N: edges.n, S: edges.s, E: edges.e, W: edges.w };
  let best = null;
  let bestScore = -Infinity;
  for (const dir of order) {
    const v = edgeValue(world, refByDir[dir]);
    const weight = v === EDGE.BRIDGE ? EDGE.STREET : v;
    let score = weight * 10;
    // Une rue partagée avec un autre îlot (la vraie rue du quartier) l'emporte sur une rue de ceinture.
    const other = edgeTiles(world, refByDir[dir]).find((p) => p && !(p.x === x && p.y === y));
    if (v >= EDGE.STREET && other && isBuiltTile(tileAt(world, other.x, other.y))) score += 5;
    if (towards) {
      const d = DIRS4.find((e) => e.dir === dir);
      const dx = towards.x - x;
      const dy = towards.y - y;
      const len = Math.hypot(dx, dy) || 1;
      score += (d.dx * dx + d.dy * dy) / len; // produit scalaire normalisé dans [-1, 1]
    }
    if (score > bestScore) { bestScore = score; best = dir; }
  }
  return YAW_BY_DIR[best];
}

// ---------------------------------------------------------------------------------------------
// Trafic : chaque quartier fait un trajet vers l'emploi le plus proche et un vers le commerce le plus
// proche, sur les chaussées (rue ou pont : coût 1), sans emprunter les passages piétons.

/** Identifiant unique d'arête (h puis v) dans un tableau plat. */
function edgeId(world, ref) {
  return ref.kind === 'h' ? ref.index : world.edges.h.length + ref.index;
}

/** Marque les coins et les arêtes périphériques des cases cibles. */
function markTargets(world, tiles) {
  const corners = new Uint8Array((world.cols + 1) * (world.rows + 1));
  const edges = new Uint8Array(world.edges.h.length + world.edges.v.length);
  for (const { x, y } of tiles) {
    for (const c of accessCorners(world, x, y)) corners[cornerIndex(world, c.cx, c.cy)] = 1;
    for (const ref of Object.values(edgesOfTile(world, x, y))) edges[edgeId(world, ref)] = 1;
  }
  return { corners, edges };
}

function travelCost(value) {
  if (value >= EDGE.STREET) return 1;
  // Le trafic motorisé ne traverse pas les passages piétons.
  return null;
}

/**
 * Plus court trajet depuis les coins de la case (x, y) jusqu'à une case cible : il se termine en
 * atteignant un coin d'une cible (après au moins une arête) ou en empruntant une arête bordant une
 * cible. Rend la liste des arêtes { kind, index, x, y } ou null si rien n'est joignable.
 */
function tripToTargets(world, x, y, targets) {
  const n = (world.cols + 1) * (world.rows + 1);
  const dist = new Float64Array(n).fill(Infinity);
  const prev = new Array(n).fill(null);
  const done = new Uint8Array(n);
  const isSource = new Uint8Array(n);
  const heap = new MinHeap();
  for (const c of accessCorners(world, x, y)) {
    const i = cornerIndex(world, c.cx, c.cy);
    dist[i] = 0;
    isSource[i] = 1;
    heap.push(0, i);
  }
  const sourceEdges = new Uint8Array(world.edges.h.length + world.edges.v.length);
  for (const ref of Object.values(edgesOfTile(world, x, y))) sourceEdges[edgeId(world, ref)] = 1;
  let best = { cost: Infinity, node: -1, extra: null };
  while (heap.size) {
    const { cost, node } = heap.pop();
    if (cost >= best.cost) break;
    if (done[node] || cost > dist[node]) continue;
    done[node] = 1;
    if (!isSource[node] && targets.corners[node]) { best = { cost, node, extra: null }; break; }
    const c = cornerCoords(world, node);
    for (const { ref, to } of edgesOfCorner(world, c.cx, c.cy)) {
      const tc = travelCost(edgeValue(world, ref));
      if (tc === null) continue;
      const nd = cost + tc;
      if (targets.edges[edgeId(world, ref)]) {
        // Arête bordant une cible : trajet terminé. À coût égal, la rue commune aux deux îlots gagne.
        const score = nd - (sourceEdges[edgeId(world, ref)] ? 0.001 : 0);
        if (score < best.cost) best = { cost: score, node, extra: ref };
      }
      const j = cornerIndex(world, to.cx, to.cy);
      if (nd < dist[j]) {
        dist[j] = nd;
        prev[j] = { from: node, ref };
        heap.push(nd, j);
      }
    }
  }
  if (best.node < 0) return null;
  const path = [];
  if (best.extra) path.push(best.extra);
  for (let node = best.node; prev[node]; node = prev[node].from) path.push(prev[node].ref);
  path.reverse();
  return path;
}

/**
 * Plus court trajet depuis (x, y) vers la case la plus proche vérifiant `isTarget(tile, x, y)`.
 * @returns {Array<{kind, index, x, y}> | null}
 */
export function shortestTrip(world, x, y, isTarget) {
  const tiles = [];
  for (let ty = 0; ty < world.rows; ty++) {
    for (let tx = 0; tx < world.cols; tx++) {
      if ((tx !== x || ty !== y) && isTarget(tileAt(world, tx, ty), tx, ty)) tiles.push({ x: tx, y: ty });
    }
  }
  if (tiles.length === 0) return null;
  return tripToTargets(world, x, y, markTargets(world, tiles));
}

/**
 * Calcule le trafic : pour chaque quartier, un trajet vers l'emploi le plus proche et un vers le
 * commerce le plus proche ; chaque arête empruntée compte 1 par trajet.
 * @param {object} world
 * @param {{ shopTypes?: string[] }} [options] types de cases « commerce » (défaut : shop, market)
 * @returns {object} un nouveau monde dont `traffic.h` / `traffic.v` sont remplis
 */
export function computeTraffic(world, options = {}) {
  const shopTypes = options.shopTypes || ['shop', 'market'];
  const next = cloneWorld(world);
  next.traffic = createTraffic(world.cols, world.rows);

  const homes = [];
  const jobs = [];
  const shops = [];
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const t = tileAt(world, x, y);
      if (!t.building) continue;
      if (residentsOfTile(t) > 0) homes.push({ x, y });
      if (jobsOfTile(t) > 0) jobs.push({ x, y });
      if (shopTypes.includes(t.building.type)) shops.push({ x, y });
    }
  }
  const targetSets = [jobs, shops].filter((list) => list.length > 0).map((list) => markTargets(world, list));
  for (const home of homes) {
    for (const targets of targetSets) {
      const path = tripToTargets(world, home.x, home.y, targets);
      if (!path) continue;
      for (const ref of path) next.traffic[ref.kind][ref.index] += 1;
    }
  }
  return next;
}

/** Trafic maximal et somme sur toutes les arêtes : { max, total }. */
export function trafficStats(world) {
  let max = 0;
  let total = 0;
  for (const arr of [world.traffic.h, world.traffic.v]) {
    for (let i = 0; i < arr.length; i++) { total += arr[i]; if (arr[i] > max) max = arr[i]; }
  }
  return { max, total };
}
