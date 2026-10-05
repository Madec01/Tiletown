// Îlots stables de deux rangées : 2×2, 3×2 ou 2×3 parcelles. Le plan dépend de la graine,
// jamais de l'ordre de construction. Le relief et l'eau découpent ces emprises en lisières.
import { hashSeed } from './rng.js';
import { edgeTiles, tileAt, edgesOfTile, edgeValue, edgeRef, inBounds, edgeCorners, edgesOfCorner } from './grid.js';
import { TERRAINS } from '../data/terrain.js';
import { isBuiltTile } from '../data/tiles.js';

export const ROAD_VERSION = 2;
const cache = new WeakMap();
export function blockLayout(world) {
  if (cache.has(world)) return cache.get(world);
  const ids = new Uint16Array(world.cols * world.rows), blocks = [];
  for (let y = 0; y < world.rows;) {
    const height = Math.min(world.rows - y, hashSeed(world.seed, `band:${y}`) % 3 === 0 ? 3 : 2);
    for (let x = 0; x < world.cols;) {
      const width = Math.min(world.cols - x, height === 3 ? 2 : hashSeed(world.seed, `block:${x}:${y}`) % 3 === 0 ? 2 : 3);
      const b = { id: blocks.length, x, y, width, height, horizontal: height <= 2 };
      blocks.push(b);
      for (let dy = 0; dy < height; dy++) for (let dx = 0; dx < width; dx++) ids[(y + dy) * world.cols + x + dx] = b.id;
      x += width;
    }
    y += height;
  }
  const result = { ids, blocks }; cache.set(world, result); return result;
}
export function blockAt(world, x, y) {
  if (!inBounds(world, x, y)) return null;
  const plan = blockLayout(world);
  return plan.blocks[plan.ids[y * world.cols + x]];
}

/** Les rues contournent l'intérieur des îlots ; une berge ou une colline en forme la limite. */
export function isBlockInterior(world, ref) {
  const [a, b] = edgeTiles(world, ref);
  if (!a || !b) return false;
  if (!TERRAINS[tileAt(world, a.x, a.y).terrain]?.buildable || !TERRAINS[tileAt(world, b.x, b.y).terrain]?.buildable) return false;
  return blockAt(world, a.x, a.y).id === blockAt(world, b.x, b.y).id;
}

/** Côtés disponibles pour une vraie entrée routière (et non un contact par un coin). */
export function frontageCandidates(world, x, y) {
  const edges = edgesOfTile(world, x, y);
  const all = [ ['s', 0], ['e', 90], ['n', 180], ['w', 270] ]
    .map(([side, yaw]) => ({ ...edges[side], yaw }));
  const passable = ref => edgeTiles(world, ref).every(p => !p || !['lake', 'wetland'].includes(tileAt(world, p.x, p.y).terrain));
  const perimeter = all.filter(ref => !isBlockInterior(world, ref) && passable(ref));
  // Un lac ou une zone humide peut fermer l'unique façade : courte desserte dans l'îlot,
  // en dernier recours, pour que le découpage ne condamne jamais une parcelle de terre.
  const existing = all.filter(ref => edgeValue(world, ref) >= 2 && !perimeter.some(p => p.yaw === ref.yaw))
    .map(ref => ({ ...ref, exception: true }));
  return perimeter.length ? [...perimeter, ...existing]
    : all.filter(ref => passable(ref) || edgeValue(world, ref) >= 2).map(ref => ({ ...ref, exception: true }));
}

export function isAvenue(world, ref) {
  return edgeValue(world, ref) === 3 || !!world.avenues?.[ref.kind]?.[ref.index];
}

/** Position du bâtiment : léger retrait derrière le trottoir, jardin tourné vers le cœur d'îlot. */
export function frontageOffset(world, x, y, yaw) {
  if (world.roadVersion !== ROAD_VERSION) return { x: 0, z: 0 };
  const ref = frontageCandidates(world, x, y).find(e => e.yaw === yaw);
  const amount = ref && isAvenue(world, ref) ? 0 : 0.045;
  const angle = yaw * Math.PI / 180;
  return { x: Math.sin(angle) * amount, z: Math.cos(angle) * amount };
}

/** Passages au cœur des îlots occupés sur leurs deux rangées, de rue à rue. */
export function courtyards(world) {
  const result = [];
  for (const b of blockLayout(world).blocks) {
    if (Math.min(b.width, b.height) !== 2) continue;
    const length = b.horizontal ? b.width : b.height;
    const refs = Array.from({ length }, (_, i) => b.horizontal
      ? edgeRef(world, 'h', b.x + i, b.y + 1)
      : edgeRef(world, 'v', b.x + 1, b.y + i));
    const pairs = refs.map(ref => edgeTiles(world, ref).map(p => p && tileAt(world, p.x, p.y)));
    if (pairs.some(pair => pair.some(t => !t || !TERRAINS[t.terrain]?.buildable))) continue;
    if (pairs.some(pair => pair.some(t => t.building && ['factory', 'power-plant', 'wastewater'].includes(t.building.type)))) continue;
    if (pairs.filter(pair => pair.every(isBuiltTile)).length < 1) continue;
    if (pairs.flat().filter(isBuiltTile).length < 3) continue;
    result.push({ ...b, refs });
  }
  return result;
}

/** Relie les deux bouts d'un passage aux trottoirs, en longeant le périmètre de l'îlot. */
export function courtyardPaths(world, court) {
  const refs = new Map(court.refs.map(r => [`${r.kind}:${r.index}`, r]));
  const ends = [edgeCorners(court.refs[0])[0], edgeCorners(court.refs.at(-1))[1]];
  const onBoundary = r => r.kind === 'h'
    ? (r.y === court.y || r.y === court.y + court.height) && r.x >= court.x && r.x < court.x + court.width
    : (r.x === court.x || r.x === court.x + court.width) && r.y >= court.y && r.y < court.y + court.height;
  for (const start of ends) {
    const queue = [{ ...start, path: [] }], seen = new Set([`${start.cx}:${start.cy}`]);
    for (let i = 0; i < queue.length; i++) {
      const c = queue[i], adjacent = edgesOfCorner(world, c.cx, c.cy);
      if (adjacent.some(e => edgeValue(world, e.ref) >= 2)) {
        for (const ref of c.path) refs.set(`${ref.kind}:${ref.index}`, ref);
        break;
      }
      for (const { ref, to } of adjacent) {
        const key = `${to.cx}:${to.cy}`;
        if (seen.has(key) || !onBoundary(ref)) continue;
        if (edgeTiles(world, ref).some(p => p && ['river', 'lake', 'wetland'].includes(tileAt(world, p.x, p.y).terrain))) continue;
        seen.add(key); queue.push({ ...to, path: [...c.path, ref] });
      }
    }
  }
  return [...refs.values()];
}
