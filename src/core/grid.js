// Grille carrée du monde : indexation des cases, voisins, arêtes et coins du treillis.
// Tout est pur : aucune fonction ne modifie le monde reçu (sauf `cloneWorld`, qui en rend une copie).
//
// Conventions (docs/ARCHITECTURE.md §3) :
// - case (x, y) : x de 0 à cols-1 (ouest → est), y de 0 à rows-1 (nord → sud) ; index = y * cols + x.
// - arête horizontale h(x, y) : entre la case (x, y-1) au nord et la case (x, y) au sud ;
//   y de 0 à rows (rows+1 lignes) ; index = y * cols + x.
// - arête verticale v(x, y) : entre la case (x-1, y) à l'ouest et la case (x, y) à l'est ;
//   x de 0 à cols (cols+1 colonnes) ; index = y * (cols + 1) + x.
// - coin (cx, cy) du treillis : cx de 0 à cols, cy de 0 à rows ; index = cy * (cols + 1) + cx.
//   L'arête h(x, y) relie les coins (x, y) et (x+1, y) ; l'arête v(x, y) relie (x, y) et (x, y+1).

/** Les quatre directions par côté, dans l'ordre N, E, S, O. */
export const DIRS4 = Object.freeze([
  Object.freeze({ dir: 'N', dx: 0, dy: -1 }),
  Object.freeze({ dir: 'E', dx: 1, dy: 0 }),
  Object.freeze({ dir: 'S', dx: 0, dy: 1 }),
  Object.freeze({ dir: 'W', dx: -1, dy: 0 }),
]);

/** Les huit directions (côtés puis diagonales). */
export const DIRS8 = Object.freeze([
  ...DIRS4,
  Object.freeze({ dir: 'NE', dx: 1, dy: -1 }),
  Object.freeze({ dir: 'SE', dx: 1, dy: 1 }),
  Object.freeze({ dir: 'SW', dx: -1, dy: 1 }),
  Object.freeze({ dir: 'NW', dx: -1, dy: -1 }),
]);

export const OPPOSITE = Object.freeze({ N: 'S', S: 'N', E: 'W', W: 'E' });

/** Index de la case (x, y) dans `world.tiles`. */
export function index(world, x, y) {
  return y * world.cols + x;
}

/** Vrai si (x, y) est une case de la grille. */
export function inBounds(world, x, y) {
  return x >= 0 && y >= 0 && x < world.cols && y < world.rows;
}

/** La case (x, y), ou null hors grille. */
export function tileAt(world, x, y) {
  return inBounds(world, x, y) ? world.tiles[index(world, x, y)] : null;
}

/** Coordonnées (x, y) de la case d'index i. */
export function coords(world, i) {
  return { x: i % world.cols, y: Math.floor(i / world.cols) };
}

/** Les voisins par côté dans la grille : [{ x, y, dir }], dir ∈ N, E, S, W. */
export function neighbors4(world, x, y) {
  const out = [];
  for (const d of DIRS4) {
    const nx = x + d.dx;
    const ny = y + d.dy;
    if (inBounds(world, nx, ny)) out.push({ x: nx, y: ny, dir: d.dir });
  }
  return out;
}

/** Les voisins par côté et en diagonale : [{ x, y, dir, dx, dy }]. */
export function neighbors8(world, x, y) {
  const out = [];
  for (const d of DIRS8) {
    const nx = x + d.dx;
    const ny = y + d.dy;
    if (inBounds(world, nx, ny)) out.push({ x: nx, y: ny, dir: d.dir, dx: d.dx, dy: d.dy });
  }
  return out;
}

/** Index dans `edges.h` de l'arête horizontale h(x, y) (0 ≤ x < cols, 0 ≤ y ≤ rows). */
export function edgeH(world, x, y) {
  return y * world.cols + x;
}

/** Index dans `edges.v` de l'arête verticale v(x, y) (0 ≤ x ≤ cols, 0 ≤ y < rows). */
export function edgeV(world, x, y) {
  return y * (world.cols + 1) + x;
}

/** Référence d'arête { kind: 'h' | 'v', index, x, y } : la forme que manipulent les chemins de `roads.js`. */
export function edgeRef(world, kind, x, y) {
  return { kind, index: kind === 'h' ? edgeH(world, x, y) : edgeV(world, x, y), x, y };
}

/**
 * Les quatre arêtes de la case (x, y) : { n, s, e, w }, chacune { kind, index, x, y }.
 * n et s sont horizontales (h), e et w verticales (v).
 */
export function edgesOfTile(world, x, y) {
  return {
    n: edgeRef(world, 'h', x, y),
    s: edgeRef(world, 'h', x, y + 1),
    w: edgeRef(world, 'v', x, y),
    e: edgeRef(world, 'v', x + 1, y),
  };
}

/**
 * Les deux cases que sépare une arête : [a, b] avec a au nord (h) ou à l'ouest (v), b au sud ou à l'est.
 * Une case hors grille (arête du bord) vaut null.
 */
export function edgeTiles(world, ref) {
  const a = ref.kind === 'h' ? { x: ref.x, y: ref.y - 1 } : { x: ref.x - 1, y: ref.y };
  const b = { x: ref.x, y: ref.y };
  return [inBounds(world, a.x, a.y) ? a : null, inBounds(world, b.x, b.y) ? b : null];
}

/** Valeur (0 rien, 1 chemin, 2 rue, 3 pont) d'une arête. */
export function edgeValue(world, ref) {
  return world.edges[ref.kind][ref.index];
}

/** Les deux coins reliés par une arête : [{ cx, cy }, { cx, cy }]. */
export function edgeCorners(ref) {
  return ref.kind === 'h'
    ? [{ cx: ref.x, cy: ref.y }, { cx: ref.x + 1, cy: ref.y }]
    : [{ cx: ref.x, cy: ref.y }, { cx: ref.x, cy: ref.y + 1 }];
}

/** Index du coin (cx, cy) du treillis (0 ≤ cx ≤ cols, 0 ≤ cy ≤ rows). */
export function cornerIndex(world, cx, cy) {
  return cy * (world.cols + 1) + cx;
}

/** Coordonnées du coin d'index i. */
export function cornerCoords(world, i) {
  return { cx: i % (world.cols + 1), cy: Math.floor(i / (world.cols + 1)) };
}

/** Les quatre coins de la case (x, y), dans l'ordre NO, NE, SO, SE. */
export function cornersOfTile(world, x, y) {
  return [
    { cx: x, cy: y },
    { cx: x + 1, cy: y },
    { cx: x, cy: y + 1 },
    { cx: x + 1, cy: y + 1 },
  ];
}

/**
 * Les arêtes qui partent d'un coin, avec le coin d'arrivée : [{ ref, to: { cx, cy } }].
 * Au plus quatre (est, ouest, sud, nord) ; les arêtes hors treillis sont omises.
 */
export function edgesOfCorner(world, cx, cy) {
  const out = [];
  if (cx < world.cols) out.push({ ref: edgeRef(world, 'h', cx, cy), to: { cx: cx + 1, cy } });
  if (cx > 0) out.push({ ref: edgeRef(world, 'h', cx - 1, cy), to: { cx: cx - 1, cy } });
  if (cy < world.rows) out.push({ ref: edgeRef(world, 'v', cx, cy), to: { cx, cy: cy + 1 } });
  if (cy > 0) out.push({ ref: edgeRef(world, 'v', cx, cy - 1), to: { cx, cy: cy - 1 } });
  return out;
}

/** Tableaux d'arêtes vides (0 partout), aux tailles du contrat. */
export function createEdges(cols, rows) {
  return {
    h: new Uint8Array((rows + 1) * cols),
    v: new Uint8Array(rows * (cols + 1)),
  };
}

/** Tableaux de trafic vides, mêmes tailles que les arêtes. */
export function createTraffic(cols, rows) {
  return {
    h: new Float32Array((rows + 1) * cols),
    v: new Float32Array(rows * (cols + 1)),
  };
}

/** Copie profonde d'une case (le bâtiment inclus). */
export function cloneTile(tile) {
  return { ...tile, building: tile.building ? { ...tile.building } : null };
}

/**
 * Copie profonde du monde : cases, bâtiments, arêtes et trafic sont dupliqués ; les autres champs
 * (seed, cols, rows, wind…) sont recopiés tels quels. Les fonctions de `roads.js` partent de là
 * pour rendre un nouvel état sans toucher à l'ancien.
 */
export function cloneWorld(world) {
  const edges = world.edges
    ? { h: Uint8Array.from(world.edges.h), v: Uint8Array.from(world.edges.v) }
    : createEdges(world.cols, world.rows);
  const traffic = world.traffic
    ? { h: Float32Array.from(world.traffic.h), v: Float32Array.from(world.traffic.v) }
    : createTraffic(world.cols, world.rows);
  return {
    ...world,
    tiles: world.tiles.map(cloneTile),
    edges,
    traffic,
    ...(world.avenues ? { avenues: { h: Uint8Array.from(world.avenues.h), v: Uint8Array.from(world.avenues.v) } } : {}),
  };
}
