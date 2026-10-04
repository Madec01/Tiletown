// Aides pour fabriquer de petits mondes synthétiques dans les tests de la logique pure.
import { createEdges, createTraffic, index } from '../src/core/grid.js';

/** Monde de cols × rows cases, tout en herbe native, sans bâtiment ni rue. */
export function makeWorld(cols, rows, terrain = 'grass') {
  return {
    seed: 0,
    cols,
    rows,
    tiles: Array.from({ length: cols * rows }, () => ({ terrain, flow: null, native: true, building: null })),
    edges: createEdges(cols, rows),
    traffic: createTraffic(cols, rows),
  };
}

/** Change le terrain d'une case (préparation des tests : mutation volontaire). */
export function setTerrain(world, x, y, terrain, flow = null) {
  const t = world.tiles[index(world, x, y)];
  t.terrain = terrain;
  t.flow = flow;
  return world;
}

/** Pose un bâtiment sur une case (préparation des tests). */
export function place(world, x, y, type, level = 1) {
  const t = world.tiles[index(world, x, y)];
  t.building = { type, level, variant: 0, yaw: 0 };
  t.native = false;
  return world;
}

/** Colonne de rivière en x, du nord au sud. */
export function riverColumn(world, x) {
  for (let y = 0; y < world.rows; y++) setTerrain(world, x, y, 'river', 'S');
  return world;
}
