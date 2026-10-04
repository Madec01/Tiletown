import test from 'node:test';
import assert from 'node:assert/strict';
import {
  index, inBounds, tileAt, coords, neighbors4, neighbors8, edgeH, edgeV, edgesOfTile, edgeTiles, edgeCorners,
  cornerIndex, cornerCoords, cornersOfTile, edgesOfCorner, createEdges, createTraffic, cloneWorld, edgeValue,
} from '../src/core/grid.js';
import { makeWorld, place } from './world-helpers.js';

const world = makeWorld(12, 16);

test('grid : index et bornes suivent le contrat (index = y * cols + x)', () => {
  assert.equal(index(world, 0, 0), 0);
  assert.equal(index(world, 11, 0), 11);
  assert.equal(index(world, 0, 1), 12);
  assert.equal(index(world, 5, 7), 7 * 12 + 5);
  assert.deepEqual(coords(world, 7 * 12 + 5), { x: 5, y: 7 });
  assert.ok(inBounds(world, 0, 0) && inBounds(world, 11, 15));
  assert.ok(!inBounds(world, -1, 0) && !inBounds(world, 12, 0) && !inBounds(world, 0, 16));
  assert.equal(tileAt(world, 12, 0), null);
  assert.equal(tileAt(world, 3, 3).terrain, 'grass');
});

test('grid : voisins par côté et en diagonale, coupés aux bords', () => {
  assert.equal(neighbors4(world, 5, 5).length, 4);
  assert.equal(neighbors8(world, 5, 5).length, 8);
  assert.equal(neighbors4(world, 0, 0).length, 2);
  assert.equal(neighbors8(world, 0, 0).length, 3);
  assert.equal(neighbors4(world, 0, 5).length, 3);
  assert.deepEqual(neighbors4(world, 5, 5).map((n) => n.dir), ['N', 'E', 'S', 'W']);
  assert.deepEqual(neighbors4(world, 5, 5).find((n) => n.dir === 'N'), { x: 5, y: 4, dir: 'N' });
  for (const n of neighbors8(world, 11, 15)) assert.ok(inBounds(world, n.x, n.y));
});

test('grid : tailles des tableaux d’arêtes et indices des arêtes', () => {
  const edges = createEdges(12, 16);
  assert.equal(edges.h.length, 17 * 12);
  assert.equal(edges.v.length, 16 * 13);
  assert.ok(edges.h instanceof Uint8Array && edges.v instanceof Uint8Array);
  const traffic = createTraffic(12, 16);
  assert.equal(traffic.h.length, edges.h.length);
  assert.equal(traffic.v.length, edges.v.length);
  assert.ok(traffic.h instanceof Float32Array);
  assert.equal(edgeH(world, 3, 4), 4 * 12 + 3);
  assert.equal(edgeH(world, 11, 16), 16 * 12 + 11, 'dernière ligne d’arêtes horizontales');
  assert.equal(edgeV(world, 3, 4), 4 * 13 + 3);
  assert.equal(edgeV(world, 12, 15), 15 * 13 + 12, 'dernière colonne d’arêtes verticales');
  assert.ok(edgeH(world, 11, 16) < edges.h.length && edgeV(world, 12, 15) < edges.v.length);
});

test('grid : les arêtes d’une case sont partagées avec ses voisines', () => {
  const a = edgesOfTile(world, 4, 6);
  const east = edgesOfTile(world, 5, 6);
  const south = edgesOfTile(world, 4, 7);
  assert.equal(a.n.kind, 'h');
  assert.equal(a.s.kind, 'h');
  assert.equal(a.e.kind, 'v');
  assert.equal(a.w.kind, 'v');
  assert.deepEqual(a.e, east.w, 'arête est = arête ouest de la voisine est');
  assert.deepEqual(a.s, south.n, 'arête sud = arête nord de la voisine sud');
  assert.equal(a.n.index, edgeH(world, 4, 6));
  assert.equal(a.s.index, edgeH(world, 4, 7));
  assert.equal(a.w.index, edgeV(world, 4, 6));
  assert.equal(a.e.index, edgeV(world, 5, 6));
});

test('grid : cases et coins d’une arête, arêtes d’un coin', () => {
  const a = edgesOfTile(world, 4, 6);
  assert.deepEqual(edgeTiles(world, a.n), [{ x: 4, y: 5 }, { x: 4, y: 6 }]);
  assert.deepEqual(edgeTiles(world, a.w), [{ x: 3, y: 6 }, { x: 4, y: 6 }]);
  assert.deepEqual(edgeTiles(world, edgesOfTile(world, 0, 0).n), [null, { x: 0, y: 0 }], 'bord : case nord absente');
  assert.deepEqual(edgeTiles(world, edgesOfTile(world, 11, 0).e), [{ x: 11, y: 0 }, null], 'bord : case est absente');
  assert.deepEqual(edgeCorners(a.n), [{ cx: 4, cy: 6 }, { cx: 5, cy: 6 }]);
  assert.deepEqual(edgeCorners(a.w), [{ cx: 4, cy: 6 }, { cx: 4, cy: 7 }]);
  assert.equal(cornerIndex(world, 12, 16), 16 * 13 + 12);
  assert.deepEqual(cornerCoords(world, 16 * 13 + 12), { cx: 12, cy: 16 });
  assert.deepEqual(cornersOfTile(world, 4, 6), [{ cx: 4, cy: 6 }, { cx: 5, cy: 6 }, { cx: 4, cy: 7 }, { cx: 5, cy: 7 }]);
  assert.equal(edgesOfCorner(world, 5, 5).length, 4);
  assert.equal(edgesOfCorner(world, 0, 0).length, 2);
  assert.equal(edgesOfCorner(world, 12, 16).length, 2);
  // Chaque arête d'un coin relie bien ce coin et le coin d'arrivée annoncé.
  for (const { ref, to } of edgesOfCorner(world, 5, 5)) {
    const ends = edgeCorners(ref).map((c) => `${c.cx},${c.cy}`);
    assert.ok(ends.includes('5,5') && ends.includes(`${to.cx},${to.cy}`));
  }
});

test('grid : cloneWorld copie en profondeur cases, bâtiments, arêtes et trafic', () => {
  const w = place(makeWorld(4, 4), 1, 1, 'house');
  w.edges.h[3] = 2;
  w.traffic.v[2] = 1.5;
  const c = cloneWorld(w);
  assert.notEqual(c, w);
  assert.notEqual(c.tiles, w.tiles);
  assert.notEqual(c.tiles[5], w.tiles[5]);
  assert.notEqual(c.tiles[5].building, w.tiles[5].building);
  assert.deepEqual(c.tiles[5].building, w.tiles[5].building);
  c.tiles[5].building.level = 3;
  c.edges.h[3] = 0;
  c.traffic.v[2] = 0;
  assert.equal(w.tiles[5].building.level, 1);
  assert.equal(w.edges.h[3], 2);
  assert.equal(w.traffic.v[2], 1.5);
  assert.equal(edgeValue(c, { kind: 'h', index: 3 }), 0);
  const noArrays = cloneWorld({ cols: 3, rows: 2, tiles: makeWorld(3, 2).tiles });
  assert.equal(noArrays.edges.h.length, 3 * 3);
  assert.equal(noArrays.traffic.v.length, 2 * 4);
});
