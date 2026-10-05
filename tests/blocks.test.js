import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { blockLayout, blockAt, isBlockInterior, courtyards, ROAD_VERSION } from '../src/core/blocks.js';
import { rebuildRoads, countEdges, networkConnected, connectTile, networkCorners, computeTraffic, EDGE } from '../src/core/roads.js';
import { edgeRef, edgeValue, edgesOfTile, edgeCorners, cornerIndex, tileAt, cloneWorld } from '../src/core/grid.js';
import { createGame, canPlace, place, demolish, undoLast, serialize, deserialize } from '../src/core/game.js';
import { createEcology } from '../src/core/ecology.js';
import { generateWorld } from '../src/core/worldgen.js';
import { streetGraph } from '../src/core/actors.js';
import { isBuiltTile } from '../src/data/tiles.js';
import { collectRoadPlacements, createRoads, LOCAL_ROAD_WIDTH, ROAD_WIDTH, PATH_THICKNESS, LOT_THICKNESS } from '../src/render3d/roads.js';
import { makeWorld, place as put, riverColumn, setTerrain } from './world-helpers.js';

function pilot() {
  let world = makeWorld(12, 12);
  const block = blockLayout(world).blocks.find(b => b.width === 3 && b.height === 2 && b.x > 0 && b.y > 0);
  assert.ok(block);
  put(world, block.x - 1, block.y, 'townhall');
  world = rebuildRoads(world, { connect: true });
  const game = { ...createGame({ seed: 0, starterTown: false }), world, eco: createEcology(world), money: 100000 };
  return { game, block };
}
function fillPilot() {
  let { game, block } = pilot();
  for (let y = block.y; y < block.y + block.height; y++) for (let x = block.x; x < block.x + block.width; x++) {
    const check = canPlace(game, x, y, 'house');
    const result = place(game, x, y, 'house', 10);
    assert.ok(result.ok, `${x},${y} : ${result.reason}`);
    assert.equal(result.game.money, game.money - check.cost);
    assert.equal(result.game.world.tiles[y * game.world.cols + x].building.yaw, check.yaw, 'la pose respecte la façade annoncée');
    for (const kind of ['h', 'v']) for (let i = 0; i < game.world.edges[kind].length; i++) {
      const old = game.world.edges[kind][i], next = result.game.world.edges[kind][i];
      if (old >= EDGE.STREET) assert.equal(next, old, 'les rues existantes restent stables');
      if (old < EDGE.STREET && next >= EDGE.STREET) {
        assert.ok(check.path.some(r => r.kind === kind && r.index === i), 'chaque rue ajoutée était annoncée et facturée');
      }
    }
    assert.equal(countEdges(result.game.world).total - countEdges(game.world).total, check.road.street + check.road.bridge);
    game = result.game;
  }
  return { game, block };
}

test('îlots : découpage complet, varié et stable, indépendant du bâti', () => {
  const world = makeWorld(16, 24), plan = blockLayout(world), seen = new Set(), sizes = new Set();
  for (const b of plan.blocks) {
    sizes.add(`${b.width}x${b.height}`);
    assert.ok(b.width * b.height <= 6);
    for (let y = b.y; y < b.y + b.height; y++) for (let x = b.x; x < b.x + b.width; x++) {
      const i = y * world.cols + x;
      assert.ok(!seen.has(i)); seen.add(i);
      assert.equal(blockAt(world, x, y).id, b.id);
    }
  }
  assert.equal(seen.size, world.tiles.length);
  for (const size of ['2x2', '3x2', '2x3']) assert.ok(sizes.has(size));
  const copy = cloneWorld(world); put(copy, 4, 5, 'house');
  assert.deepEqual(blockLayout(copy), plan);
});

test('îlot de six maisons : façades accessibles, rues partagées, cœur sans chaussée', () => {
  const { game, block: b } = fillPilot(), w = game.world;
  assert.ok(networkConnected(w));
  for (let y = b.y; y <= b.y + b.height; y++) for (let x = b.x; x <= b.x + b.width; x++) {
    for (const kind of ['h', 'v']) {
      const ref = edgeRef(w, kind, x, y);
      if (isBlockInterior(w, ref)) assert.ok(edgeValue(w, ref) < EDGE.STREET);
    }
  }
  const court = courtyards(w).find(c => c.id === b.id);
  assert.equal(court.refs.length, 3);
  assert.ok(court.refs.every(r => edgeValue(w, r) === EDGE.PATH));
  const old = cloneWorld(w);
  for (let y = 0; y < old.rows; y++) for (let x = 0; x < old.cols; x++) if (isBuiltTile(tileAt(old, x, y))) {
    for (const ref of Object.values(edgesOfTile(old, x, y))) old.edges[ref.kind][ref.index] = EDGE.STREET;
  }
  assert.ok(countEdges(w).total <= countEdges(old).total * .6, 'au moins 40 % de chaussées en moins sur le pilote');
  const placements = collectRoadPlacements(w);
  const a = placements.lots.find(p => p.tile === b.y * w.cols + b.x + 1);
  const c = placements.lots.find(p => p.tile === (b.y + 1) * w.cols + b.x + 1);
  assert.equal(a.z + a.depth / 2, c.z - c.depth / 2, 'les deux jardins se rejoignent sans séparation artificielle');
  assert.ok(placements.benches.length > 0);
  assert.ok(PATH_THICKNESS > LOT_THICKNESS, 'le chemin reste visible au-dessus de la pelouse');
});

test('passages : chaque extrémité rejoint un trottoir et reste interdite aux voitures', () => {
  const { game, block } = fillPilot(), w = computeTraffic(game.world);
  const court = courtyards(w).find(c => c.id === block.id);
  const foot = streetGraph(w, { pedestrian: true }), cars = streetGraph(w);
  const net = networkCorners(w);
  for (const ref of court.refs) {
    assert.equal(w.traffic[ref.kind][ref.index], 0);
    const [a, b] = edgeCorners(ref).map(c => cornerIndex(w, c.cx, c.cy));
    assert.ok(!cars.adj[a].some(e => e.to === b), 'pas de raccourci motorisé');
    const seen = new Set([a]), queue = [a];
    for (let i = 0; i < queue.length; i++) for (const e of foot.adj[queue[i]]) {
      if (!seen.has(e.to)) { seen.add(e.to); queue.push(e.to); }
    }
    assert.ok([...seen].some(c => net.has(c)), 'passage accessible depuis la rue');
  }
});

test('raccordement : toucher un coin de rue ne dispense pas de créer une façade', () => {
  let w = makeWorld(8, 8); put(w, 2, 2, 'townhall'); w = rebuildRoads(w);
  const net = networkCorners(w);
  let target;
  for (let y = 0; y < w.rows; y++) for (let x = 0; x < w.cols; x++) {
    const refs = Object.values(edgesOfTile(w, x, y));
    if (refs.every(r => edgeValue(w, r) < EDGE.STREET) && refs.some(r => edgeCorners(r).some(c => net.has(cornerIndex(w, c.cx, c.cy))))) target = { x, y };
  }
  assert.ok(target);
  const plan = connectTile(w, target.x, target.y);
  assert.ok(plan.ok && plan.path.length > 0);
  const front = edgesOfTile(w, target.x, target.y)[{ 0: 's', 90: 'e', 180: 'n', 270: 'w' }[plan.yaw]];
  assert.ok(plan.path.some(r => r.kind === front.kind && r.index === front.index));
});

test('quartiers : 150 vallées, y compris les façades bloquées par les zones humides', () => {
  for (const seed of [...Array.from({ length: 150 }, (_, i) => i + 1), 12345]) {
    const w = generateWorld({ seed, starterTown: true });
    assert.ok(networkConnected(w), `vallée ${seed}`);
    const net = networkCorners(w);
    for (let y = 0; y < w.rows; y++) for (let x = 0; x < w.cols; x++) {
      const b = tileAt(w, x, y).building;
      if (!isBuiltTile(tileAt(w, x, y))) continue;
      const front = edgesOfTile(w, x, y)[{ 0: 's', 90: 'e', 180: 'n', 270: 'w' }[b.yaw]];
      assert.ok(edgeValue(w, front) >= EDGE.STREET && edgeCorners(front).every(c => net.has(cornerIndex(w, c.cx, c.cy))), `entrée ${seed} ${x},${y}`);
    }
    const again = rebuildRoads(w);
    assert.deepEqual(again.edges, w.edges);
    assert.deepEqual(again.tiles, w.tiles);
  }
});

test('ancienne berge : conserver seulement les quais nécessaires pour ne pas enclaver une maison', () => {
  const w = makeWorld(6, 6);
  for (let y = 0; y < 6; y++) setTerrain(w, 2, y, 'wetland');
  setTerrain(w, 2, 2, 'grass');
  for (const [x, type] of [[4, 'townhall'], [2, 'house'], [0, 'house']]) {
    put(w, x, 2, type);
    for (const ref of Object.values(edgesOfTile(w, x, 2))) w.edges[ref.kind][ref.index] = EDGE.STREET;
  }
  for (const x of [1, 3]) w.edges.h[2*w.cols+x] = EDGE.STREET;
  assert.ok(networkConnected(w), 'ancienne ville reliée par le quai de la parcelle centrale');
  const migrated = rebuildRoads(w, { reset: true, connect: true });
  assert.ok(networkConnected(migrated), 'aucune maison isolée après conversion');
  assert.ok(countEdges(migrated).total < countEdges(w).total);
  assert.deepEqual(rebuildRoads(migrated).edges, migrated.edges, 'une pose ultérieure ne change pas ce raccordement');
  assert.deepEqual(rebuildRoads(migrated).tiles, migrated.tiles);
});

test('ancienne sauvegarde : conversion gratuite, bâtiments et progression préservés, relecture stable', () => {
  const { game } = fillPilot();
  const old = serialize(game);
  delete old.world.roadVersion; delete old.world.avenues;
  old.month = 13; old.money = 4321; old.levelId = 'vallee-1';
  old.flags.exodusMonths = 2; old.journey.claimed = ['pose'];
  old.career = { stars: { 'vallee-1': 2 }, unlocked: ['vallee-1', 'vallee-2'] };
  for (let y = 0; y < game.world.rows; y++) for (let x = 0; x < game.world.cols; x++) if (isBuiltTile(tileAt(game.world, x, y))) {
    for (const r of Object.values(edgesOfTile(game.world, x, y))) old.world.edges[r.kind][r.index] = EDGE.STREET;
  }
  const before = JSON.stringify(old), back = deserialize(old);
  assert.equal(JSON.stringify(old), before, 'la migration ne modifie pas la sauvegarde source');
  assert.equal(back.world.roadVersion, ROAD_VERSION);
  assert.equal(back.money, old.money); assert.equal(back.month, old.month);
  for (const key of ['levelId', 'flags', 'journey', 'career']) assert.deepEqual(back[key], old[key]);
  const withoutYaw = tiles => tiles.map(t => t.building ? { ...t, building: { ...t.building, yaw: 0 } } : t);
  assert.deepEqual(withoutYaw(back.world.tiles), withoutYaw(old.world.tiles));
  assert.ok(countEdges(back.world).total < countEdges(old.world).total);
  assert.ok(networkConnected(back.world));
  assert.deepEqual(serialize(deserialize(serialize(back))), serialize(back));
});

test('migration : un pont existant et son raccordement sont conservés', () => {
  let w = riverColumn(makeWorld(9, 8), 4);
  put(w, 1, 3, 'townhall'); put(w, 7, 3, 'house');
  w = rebuildRoads(w, { connect: true });
  assert.ok(countEdges(w).bridge > 0);
  const back = rebuildRoads(w, { reset: true, connect: true });
  for (const kind of ['h', 'v']) w.edges[kind].forEach((v, i) => {
    if (v === EDGE.BRIDGE) assert.equal(back.edges[kind][i], EDGE.BRIDGE);
  });
  assert.ok(networkConnected(back));
});

test('annulation et démolition : les voies partagées continuent à desservir le quartier', () => {
  const { game, block } = fillPilot();
  const undone = undoLast(game, 11);
  assert.ok(undone);
  assert.ok(networkConnected(undone.world));
  assert.ok(undone.money > game.money);
  assert.deepEqual(undone.world.edges, game.undo.game.world.edges);
  const result = demolish(game, block.x + 1, block.y);
  assert.ok(result.ok);
  assert.ok(networkConnected(result.game.world));
  assert.equal(tileAt(result.game.world, block.x + 1, block.y).building, null);
  assert.deepEqual(deserialize(serialize(result.game)).world.edges, result.game.world.edges);
});

test('rendu : chaussées résidentielles réellement plus étroites que les axes principaux', () => {
  const { game } = fillPilot();
  const vertex = new THREE.MeshLambertMaterial({ vertexColors: true });
  const roads = createRoads({ materials: { vertex, textured: new Map() } });
  try {
    roads.setWorld(game.world);
    const width = name => {
      const mesh = roads.group.getObjectByName(name);
      assert.ok(mesh?.count > 0); mesh.geometry.computeBoundingBox();
      return mesh.geometry.boundingBox.max.z - mesh.geometry.boundingBox.min.z;
    };
    assert.ok(Math.abs(width('local-streets') - LOCAL_ROAD_WIDTH) < 1e-6);
    assert.ok(Math.abs(width('streets') - ROAD_WIDTH) < 1e-6);
    assert.ok(width('local-streets') < width('streets'));
  } finally { roads.dispose(); vertex.dispose(); }
});
