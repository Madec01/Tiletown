// Génération de la vallée (docs/GAME_DESIGN.md §3.1 : « la vallée existe avant la ville »).
//
// `generateWorld({ seed, cols, rows, map: 'valley', starterTown })` rend un monde conforme au contrat
// de docs/ARCHITECTURE.md §3 : une rivière continue d'un bord à l'autre (largeur 1, marche aléatoire
// douce, `flow` cohérent de l'amont vers l'aval), un ou deux lacs près de la rivière, des zones humides
// sur les berges, des collines sur un bord, deux ou trois massifs de forêt, des prairies fleuries, quelques
// champs près du centre, le reste en herbe ; la mairie au centre, sur de l'herbe, jamais coupée par la
// rivière. Avec `starterTown`, une dizaine de maisons, deux commerces et un champ cultivé entourent la
// mairie sans toucher à la nature native ; chaque bâtiment est orienté vers sa rue.
//
// Tout passe par le générateur à graine : même graine, même vallée.

import { createRng } from './rng.js';
import { index, inBounds, tileAt, neighbors4, neighbors8, createEdges, createTraffic, DIRS4 } from './grid.js';
import { rebuildRoads, computeTraffic, faceTowardRoad } from './roads.js';
import { isBuiltTile, TILE_BY_ID } from '../data/tiles.js';

export const DEFAULT_COLS = 12;
export const DEFAULT_ROWS = 16;
export const MIN_SIZE = 8;

/** Rayon (Chebyshev) autour de la mairie laissé en herbe pour la ville de départ. */
const TOWN_RADIUS = 2;

// ---------------------------------------------------------------------------------------------
// Utilitaires locaux (le monde en construction est mutable ; il n'est partagé qu'une fois fini).

function chebyshev(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function dirBetween(from, to) {
  if (to.y < from.y) return 'N';
  if (to.y > from.y) return 'S';
  if (to.x > from.x) return 'E';
  return 'W';
}

function isGrass(world, x, y) {
  const t = tileAt(world, x, y);
  return Boolean(t) && t.terrain === 'grass' && !t.building;
}

function hasNeighbor4(world, x, y, terrain) {
  return neighbors4(world, x, y).some((n) => tileAt(world, n.x, n.y).terrain === terrain);
}

function hasNeighbor8(world, x, y, terrain) {
  return neighbors8(world, x, y).some((n) => tileAt(world, n.x, n.y).terrain === terrain);
}

function listTiles(world, predicate) {
  const out = [];
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      if (predicate(tileAt(world, x, y), x, y)) out.push({ x, y });
    }
  }
  return out;
}

function inBlob(blob, x, y) {
  return blob.some((b) => b.x === x && b.y === y);
}

/** Vrai si (x, y) touche (8 voisins) une case de `terrain` qui n'appartient pas à `blob` : sert à séparer les taches. */
function touchesOtherBlob(world, x, y, terrain, blob) {
  return neighbors8(world, x, y).some((n) => tileAt(world, n.x, n.y).terrain === terrain && !inBlob(blob, n.x, n.y));
}

/**
 * Fait pousser une tache compacte de `terrain` à partir de `seed`, sur l'herbe, jusqu'à `size` cases.
 * `allowed(x, y, blob)` filtre les candidats ; ceux-ci sont comptés une fois par case voisine déjà prise,
 * si bien que la tache reste ramassée.
 */
function growBlob(world, rng, seed, size, terrain, allowed) {
  const blob = [seed];
  world.tiles[index(world, seed.x, seed.y)].terrain = terrain;
  while (blob.length < size) {
    const candidates = [];
    for (const b of blob) {
      for (const n of neighbors4(world, b.x, b.y)) {
        if (isGrass(world, n.x, n.y) && allowed(n.x, n.y, blob)) candidates.push(n);
      }
    }
    if (candidates.length === 0) break;
    const pick = rng.pick(candidates);
    world.tiles[index(world, pick.x, pick.y)].terrain = terrain;
    blob.push({ x: pick.x, y: pick.y });
  }
  return blob;
}

// ---------------------------------------------------------------------------------------------
// Rivière.

function carveRiver(world, rng, center) {
  const { cols, rows } = world;
  const vertical = rng.chance(0.7);
  const length = vertical ? rows : cols; // le long de l'axe d'écoulement
  const width = vertical ? cols : rows; // en travers
  const c = vertical ? center.x : center.y;
  // La rivière reste d'un côté du centre, à au moins deux cases de la mairie, et jamais collée au bord.
  const bands = [[1, c - TOWN_RADIUS], [c + TOWN_RADIUS, width - 2]].filter(([lo, hi]) => hi >= lo);
  const band = rng.pick(bands);
  const downstream = rng.chance(0.5) ? 1 : -1;

  let across = rng.int(band[0], band[1]);
  let drift = rng.chance(0.5) ? 1 : -1;
  let lastLateral = -2;
  const cells = [];
  for (let along = 0; along < length; along++) {
    cells.push({ along, across });
    if (along < length - 1 && along - lastLateral >= 2 && rng.chance(0.45)) {
      if (rng.chance(0.3)) drift = -drift;
      let next = across + drift;
      if (next < band[0] || next > band[1]) { drift = -drift; next = across + drift; }
      if (next >= band[0] && next <= band[1]) {
        across = next;
        cells.push({ along, across });
        lastLateral = along;
      }
    }
  }
  const ordered = downstream > 0 ? cells : cells.slice().reverse();
  const toXY = (p) => (vertical ? { x: p.across, y: p.along } : { x: p.along, y: p.across });
  const exitFlow = vertical ? (downstream > 0 ? 'S' : 'N') : (downstream > 0 ? 'E' : 'W');
  for (let i = 0; i < ordered.length; i++) {
    const p = toXY(ordered[i]);
    const tile = world.tiles[index(world, p.x, p.y)];
    tile.terrain = 'river';
    tile.flow = i + 1 < ordered.length ? dirBetween(p, toXY(ordered[i + 1])) : exitFlow;
  }
  return { vertical, downstream, meanAcross: cells.reduce((s, p) => s + p.across, 0) / cells.length };
}

// ---------------------------------------------------------------------------------------------
// Lacs, zones humides, collines, forêts, prairies, champs.

function carveLakes(world, rng, center) {
  const count = rng.int(1, 2);
  const rivers = listTiles(world, (t) => t.terrain === 'river');
  const farFromTown = (x, y) => chebyshev({ x, y }, center) > TOWN_RADIUS;
  const notNearLake = (x, y) => !hasNeighbor8(world, x, y, 'lake');
  const lakes = [];
  for (let k = 0; k < count; k++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const r = rng.pick(rivers);
      const shore = neighbors4(world, r.x, r.y).filter((n) => isGrass(world, n.x, n.y) && farFromTown(n.x, n.y) && notNearLake(n.x, n.y));
      if (shore.length === 0) continue;
      const seed = rng.pick(shore);
      const blob = growBlob(world, rng, seed, rng.int(3, 6), 'lake',
        (x, y, current) => farFromTown(x, y) && !touchesOtherBlob(world, x, y, 'lake', current));
      lakes.push(blob);
      break;
    }
  }
  return lakes;
}

function carveWetlands(world, rng, center) {
  const farFromTown = (x, y) => chebyshev({ x, y }, center) > TOWN_RADIUS;
  const canHost = (x, y) => isGrass(world, x, y) && farFromTown(x, y) && !hasNeighbor4(world, x, y, 'wetland');
  const target = rng.int(2, 5);
  let placed = 0;
  // Berges de la rivière, parcourues dans un ordre mélangé.
  for (const r of rng.shuffle(listTiles(world, (t) => t.terrain === 'river'))) {
    if (placed >= target) break;
    if (!rng.chance(0.35)) continue;
    const banks = neighbors4(world, r.x, r.y).filter((n) => canHost(n.x, n.y));
    if (banks.length === 0) continue;
    const b = rng.pick(banks);
    world.tiles[index(world, b.x, b.y)].terrain = 'wetland';
    placed++;
  }
  // Une roselière au bord de chaque lac, souvent.
  for (const l of listTiles(world, (t) => t.terrain === 'lake')) {
    if (!rng.chance(0.25)) continue;
    const shore = neighbors4(world, l.x, l.y).filter((n) => canHost(n.x, n.y));
    if (shore.length === 0) continue;
    const s = rng.pick(shore);
    world.tiles[index(world, s.x, s.y)].terrain = 'wetland';
    placed++;
  }
  return placed;
}

function raiseHills(world, rng, center, river) {
  const { cols, rows } = world;
  // Les collines occupent un bord que la rivière ne traverse pas : celui qui lui fait face, sauf une fois
  // sur cinq, et jamais un bord que la rivière frôle (moins de trois cases de recul).
  const sides = river.vertical ? ['W', 'E'] : ['N', 'S'];
  const width = river.vertical ? cols : rows;
  const axisCenter = river.vertical ? center.x : center.y;
  const opposite = river.meanAcross < axisCenter ? sides[1] : sides[0];
  const riverHugsOther = Math.min(river.meanAcross, width - 1 - river.meanAcross) < 3;
  const side = riverHugsOther || rng.chance(0.8) ? opposite : sides.find((s) => s !== opposite);
  const length = side === 'W' || side === 'E' ? rows : cols;
  let depth = 1;
  const placed = [];
  for (let i = 0; i < length; i++) {
    // Bande d'une case, parfois deux, avec une trouée de loin en loin.
    if (depth === 1 ? rng.chance(0.25) : rng.chance(0.5)) depth = 3 - depth;
    const rowDepth = rng.chance(0.1) ? 0 : depth;
    for (let d = 0; d < rowDepth; d++) {
      let x;
      let y;
      if (side === 'W') { x = d; y = i; } else if (side === 'E') { x = cols - 1 - d; y = i; } else if (side === 'N') { x = i; y = d; } else { x = i; y = rows - 1 - d; }
      if (!isGrass(world, x, y) || chebyshev({ x, y }, center) <= TOWN_RADIUS + 1) break;
      world.tiles[index(world, x, y)].terrain = 'hill';
      placed.push({ x, y });
    }
  }
  return { side, placed };
}

function growForests(world, rng, center) {
  const count = rng.int(2, 3);
  const massifs = [];
  const farFromTown = (x, y) => chebyshev({ x, y }, center) > TOWN_RADIUS;
  for (let k = 0; k < count; k++) {
    const seeds = listTiles(world, (t, x, y) => isGrass(world, x, y) && chebyshev({ x, y }, center) >= TOWN_RADIUS + 1
      && !massifs.some((m) => m.some((f) => Math.abs(f.x - x) + Math.abs(f.y - y) < 5)));
    if (seeds.length === 0) break;
    const seed = rng.pick(seeds);
    massifs.push(growBlob(world, rng, seed, rng.int(5, 12), 'forest',
      (x, y, current) => farFromTown(x, y) && !touchesOtherBlob(world, x, y, 'forest', current)));
  }
  return massifs;
}

function growMeadows(world, rng, center) {
  const count = rng.int(2, 3);
  const patches = [];
  const farFromTown = (x, y) => chebyshev({ x, y }, center) > TOWN_RADIUS;
  for (let k = 0; k < count; k++) {
    const seeds = listTiles(world, (t, x, y) => isGrass(world, x, y) && farFromTown(x, y) && !hasNeighbor8(world, x, y, 'meadow'));
    if (seeds.length === 0) break;
    patches.push(growBlob(world, rng, rng.pick(seeds), rng.int(3, 6), 'meadow', farFromTown));
  }
  return patches;
}

function sowFields(world, rng, center) {
  // Quelques champs à deux ou trois cases de la ville de départ ; on essaie plusieurs emplacements jusqu'à
  // obtenir une tache d'au moins deux cases, en effaçant les essais trop petits.
  const near = (x, y) => {
    const d = chebyshev({ x, y }, center);
    return d > TOWN_RADIUS && d <= TOWN_RADIUS + 3;
  };
  const seeds = rng.shuffle(listTiles(world, (t, x, y) => isGrass(world, x, y) && chebyshev({ x, y }, center) === TOWN_RADIUS + 1));
  for (const seed of seeds) {
    const blob = growBlob(world, rng, seed, rng.int(2, 4), 'field', near);
    if (blob.length >= 2) return blob;
    for (const b of blob) world.tiles[index(world, b.x, b.y)].terrain = 'grass';
  }
  return [];
}

// ---------------------------------------------------------------------------------------------
// Mairie et ville de départ.

function placeBuilding(world, x, y, type, variant) {
  const tile = world.tiles[index(world, x, y)];
  tile.building = { type, level: 1, variant, yaw: 0 };
  tile.native = false;
}

function buildStarterTown(world, rng, center) {
  const plan = ['shop', 'house', 'house', 'house', 'shop', 'house', 'house', 'house', 'house', 'house', 'house', 'house', 'field'];
  const taken = [center];
  for (const type of plan) {
    const candidates = [];
    for (const b of taken) {
      for (const n of neighbors4(world, b.x, b.y)) {
        if (isGrass(world, n.x, n.y) && chebyshev(n, center) <= TOWN_RADIUS + 1) candidates.push(n);
      }
    }
    if (candidates.length === 0) break;
    // On préfère rester serré autour de la mairie : les plus proches d'abord, sept fois sur dix.
    const minD = Math.min(...candidates.map((c) => chebyshev(c, center)));
    const pool = rng.chance(0.7) ? candidates.filter((c) => chebyshev(c, center) === minD) : candidates;
    const spot = rng.pick(pool);
    if (type === 'field') {
      const tile = world.tiles[index(world, spot.x, spot.y)];
      tile.terrain = 'field';
      placeBuilding(world, spot.x, spot.y, 'field', rng.int(0, 1));
    } else {
      placeBuilding(world, spot.x, spot.y, type, rng.int(0, 2));
    }
    taken.push({ x: spot.x, y: spot.y });
  }
}

// ---------------------------------------------------------------------------------------------
// Point d'entrée.

/**
 * Génère la vallée.
 * @param {{ seed?: number|string, cols?: number, rows?: number, map?: 'valley', starterTown?: boolean }} options
 * @returns {object} le monde (voir docs/ARCHITECTURE.md §3), avec en plus `map` et `wind` (vent dominant).
 */
export function generateWorld({ seed = 1, cols = DEFAULT_COLS, rows = DEFAULT_ROWS, map = 'valley', starterTown = false } = {}) {
  if (map !== 'valley') throw new Error(`Carte inconnue : ${map}`);
  if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < MIN_SIZE || rows < MIN_SIZE) {
    throw new Error(`Carte trop petite : ${cols} × ${rows} (minimum ${MIN_SIZE} × ${MIN_SIZE})`);
  }
  const rng = createRng(seed, 'valley');
  const world = {
    seed,
    cols,
    rows,
    map,
    wind: 'W',
    tiles: Array.from({ length: cols * rows }, () => ({ terrain: 'grass', flow: null, native: true, building: null })),
    edges: createEdges(cols, rows),
    traffic: createTraffic(cols, rows),
  };
  const center = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };

  const river = carveRiver(world, rng.fork('river'), center);
  carveLakes(world, rng.fork('lakes'), center);
  carveWetlands(world, rng.fork('wetlands'), center);
  raiseHills(world, rng.fork('hills'), center, river);
  growForests(world, rng.fork('forests'), center);
  growMeadows(world, rng.fork('meadows'), center);
  sowFields(world, rng.fork('fields'), center);
  world.wind = rng.fork('wind').pick(DIRS4.map((d) => d.dir));

  placeBuilding(world, center.x, center.y, 'townhall', 0);
  if (starterTown) buildStarterTown(world, rng.fork('town'), center);

  const withRoads = rebuildRoads(world);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tile = withRoads.tiles[index(withRoads, x, y)];
      if (isBuiltTile(tile)) tile.building.yaw = faceTowardRoad(withRoads, x, y, center);
    }
  }
  return computeTraffic(withRoads);
}

/** Centre de la carte (la case de la mairie). */
export function centerOf(world) {
  return { x: Math.floor(world.cols / 2), y: Math.floor(world.rows / 2) };
}

/**
 * Suit la rivière de l'amont à l'aval : rend les cases dans l'ordre d'écoulement, ou null si la rivière
 * n'est pas une chaîne continue (source unique sur un bord, chaque `flow` menant à la case suivante,
 * dernière case s'écoulant hors de la carte).
 */
export function traceRiver(world) {
  const rivers = listTiles(world, (t) => t.terrain === 'river');
  if (rivers.length === 0) return null;
  const isRiverAt = (x, y) => inBounds(world, x, y) && tileAt(world, x, y).terrain === 'river';
  const stepOf = (dir) => DIRS4.find((d) => d.dir === dir);
  // La source : une case de rivière vers laquelle aucune autre ne s'écoule.
  const fedBy = new Set();
  for (const r of rivers) {
    const d = stepOf(tileAt(world, r.x, r.y).flow);
    if (!d) return null;
    const nx = r.x + d.dx;
    const ny = r.y + d.dy;
    if (isRiverAt(nx, ny)) fedBy.add(index(world, nx, ny));
  }
  const sources = rivers.filter((r) => !fedBy.has(index(world, r.x, r.y)));
  if (sources.length !== 1) return null;
  const path = [];
  const seen = new Set();
  let cur = sources[0];
  for (;;) {
    const i = index(world, cur.x, cur.y);
    if (seen.has(i)) return null;
    seen.add(i);
    path.push(cur);
    const d = stepOf(tileAt(world, cur.x, cur.y).flow);
    const nx = cur.x + d.dx;
    const ny = cur.y + d.dy;
    if (!inBounds(world, nx, ny)) break; // l'embouchure sort de la carte
    if (!isRiverAt(nx, ny)) return null;
    cur = { x: nx, y: ny };
  }
  return path.length === rivers.length ? path : null;
}

/**
 * Vérifie les invariants d'un monde généré : tailles, rivière continue d'un bord à l'autre avec
 * écoulement cohérent, mairie au centre, aucune case de rivière isolée.
 * @returns {{ ok: boolean, problems: string[] }}
 */
export function validateWorld(world) {
  const problems = [];
  const { cols, rows } = world;
  if (world.tiles.length !== cols * rows) problems.push('nombre de cases incorrect');
  if (world.edges.h.length !== (rows + 1) * cols) problems.push('taille de edges.h incorrecte');
  if (world.edges.v.length !== rows * (cols + 1)) problems.push('taille de edges.v incorrecte');
  if (world.traffic.h.length !== world.edges.h.length || world.traffic.v.length !== world.edges.v.length) problems.push('taille du trafic incorrecte');

  const path = traceRiver(world);
  if (!path) {
    problems.push('rivière discontinue ou écoulement incohérent');
  } else {
    const onBorder = (p) => p.x === 0 || p.y === 0 || p.x === cols - 1 || p.y === rows - 1;
    if (!onBorder(path[0]) || !onBorder(path[path.length - 1])) problems.push('la rivière ne va pas d’un bord à l’autre');
    const first = path[0];
    const last = path[path.length - 1];
    const opposite = (first.x === 0 && last.x === cols - 1) || (first.x === cols - 1 && last.x === 0)
      || (first.y === 0 && last.y === rows - 1) || (first.y === rows - 1 && last.y === 0);
    if (!opposite) problems.push('la source et l’embouchure ne sont pas sur deux bords opposés');
  }
  for (const r of listTiles(world, (t) => t.terrain === 'river')) {
    if (!hasNeighbor4(world, r.x, r.y, 'river')) problems.push(`case de rivière isolée en (${r.x}, ${r.y})`);
  }
  for (const t of listTiles(world, (tile) => tile.terrain !== 'river' && tile.flow !== null)) {
    problems.push(`écoulement hors rivière en (${t.x}, ${t.y})`);
  }

  const c = centerOf(world);
  const hall = tileAt(world, c.x, c.y);
  if (!hall.building || hall.building.type !== 'townhall') problems.push('pas de mairie au centre');
  if (hall.terrain !== 'grass') problems.push(`la mairie n’est pas sur de l’herbe (${hall.terrain})`);
  if (hall.native) problems.push('la case de la mairie est marquée native');
  return { ok: problems.length === 0, problems };
}

/**
 * Portrait d'une vallée, pour choisir et vérifier les graines des niveaux (src/data/levels.js) :
 *
 *   { cols, rows, cells, terrains: { grass, forest, … },
 *     buildings,            bâtiments posés (une vallée vierge n'a que la mairie)
 *     hall,                 la case de la mairie, ou null
 *     freeAroundHall,       cases libres et constructibles sans défrichement touchant la mairie (0 à 4)
 *     openNear,             idem à trois cases ou moins de la mairie
 *     buildableShare,       part de la carte où un quartier peut se poser (défrichement compris)
 *     riverDistance,        distance (Chebyshev) de la rivière à la mairie, null sans rivière
 *     crossings,            cases de rivière franchissables (du terrain constructible des deux côtés)
 *     forestPatches,        tailles des massifs de forêt, du plus grand au plus petit
 *     wind }
 *
 * Tout est lu : rien n'est modifié.
 */
export function surveyWorld(world) {
  const house = TILE_BY_ID.house;
  const clearingOf = (terrain) => (house.clearing && house.clearing[terrain]) || 0;
  const buildable = (x, y) => {
    const t = tileAt(world, x, y);
    return Boolean(t) && house.terrains.includes(t.terrain) && !t.building;
  };
  const soft = (x, y) => buildable(x, y) && clearingOf(tileAt(world, x, y).terrain) === 0;

  const terrains = {};
  let buildings = 0;
  let buildableCells = 0;
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const t = tileAt(world, x, y);
      terrains[t.terrain] = (terrains[t.terrain] || 0) + 1;
      if (t.building) buildings++;
      if (buildable(x, y)) buildableCells++;
    }
  }

  const c = centerOf(world);
  const hallTile = tileAt(world, c.x, c.y);
  const hall = hallTile && hallTile.building && hallTile.building.type === 'townhall' ? { x: c.x, y: c.y } : null;
  let freeAroundHall = 0;
  for (const d of DIRS4) if (soft(c.x + d.dx, c.y + d.dy)) freeAroundHall++;
  let openNear = 0;
  let riverDistance = null;
  let crossings = 0;
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const d = chebyshev({ x, y }, c);
      if (d >= 1 && d <= 3 && soft(x, y)) openNear++;
      if (tileAt(world, x, y).terrain !== 'river') continue;
      riverDistance = riverDistance === null ? d : Math.min(riverDistance, d);
      const across = (dx, dy) => buildable(x + dx, y + dy) || (tileAt(world, x + dx, y + dy) || {}).building;
      if ((across(-1, 0) && across(1, 0)) || (across(0, -1) && across(0, 1))) crossings++;
    }
  }

  // Massifs de forêt (8 voisins), du plus grand au plus petit : le cerf en demande six d'un tenant.
  const seen = new Uint8Array(world.cols * world.rows);
  const forestPatches = [];
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const i = index(world, x, y);
      if (seen[i] || tileAt(world, x, y).terrain !== 'forest') continue;
      let size = 0;
      const stack = [{ x, y }];
      seen[i] = 1;
      while (stack.length > 0) {
        const cur = stack.pop();
        size++;
        for (const n of neighbors8(world, cur.x, cur.y)) {
          const j = index(world, n.x, n.y);
          if (seen[j] || tileAt(world, n.x, n.y).terrain !== 'forest') continue;
          seen[j] = 1;
          stack.push(n);
        }
      }
      forestPatches.push(size);
    }
  }
  forestPatches.sort((a, b) => b - a);

  return {
    cols: world.cols,
    rows: world.rows,
    cells: world.tiles.length,
    terrains,
    buildings,
    hall,
    freeAroundHall,
    openNear,
    buildableShare: buildableCells / world.tiles.length,
    riverDistance,
    crossings,
    forestPatches,
    wind: world.wind,
  };
}
