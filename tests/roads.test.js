import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EDGE, rebuildRoads, connectTile, applyPath, networkConnected, disconnectedTiles, computeTraffic,
  faceTowardRoad, countEdges, trafficStats, edgeBuildCost, shortestTrip,
} from '../src/core/roads.js';
import { edgesOfTile, edgeValue, edgeTiles, tileAt, edgeRef } from '../src/core/grid.js';
import { generateWorld } from '../src/core/worldgen.js';
import { makeWorld, setTerrain, place, riverColumn } from './world-helpers.js';

/** Toutes les arêtes intérieures du monde, avec leurs deux cases. */
function interiorEdges(world) {
  const out = [];
  for (let y = 0; y <= world.rows; y++) {
    for (let x = 0; x < world.cols; x++) out.push(edgeRef(world, 'h', x, y));
  }
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x <= world.cols; x++) out.push(edgeRef(world, 'v', x, y));
  }
  return out.map((ref) => ({ ref, tiles: edgeTiles(world, ref).map((p) => (p ? tileAt(world, p.x, p.y) : null)) }));
}

test('roads : une rue de façade, pas de ceinture automatique ; le recalcul conserve les dessertes', () => {
  const w = place(makeWorld(6, 6), 2, 2, 'townhall');
  const r = rebuildRoads(w);
  assert.equal(countEdges(r).street, 1);
  assert.ok(networkConnected(r));
  assert.deepEqual(rebuildRoads(r).edges, r.edges);
  assert.ok(w.edges.h.every(v => v === 0) && w.edges.v.every(v => v === 0), 'entrée inchangée');
  const other = edgesOfTile(r, 4, 4).n;
  r.edges[other.kind][other.index] = EDGE.STREET;
  assert.equal(edgeValue(rebuildRoads(r), other), EDGE.STREET, 'une desserte existante reste stable');
});

test('roads : une forêt plantée ne crée aucune rue, un parc ajoute au plus une promenade', () => {
  const w = rebuildRoads(place(makeWorld(8, 8), 3, 3, 'townhall'));
  const before = countEdges(w).total;
  place(w, 4, 3, 'tree-planting');
  const forest = rebuildRoads(w);
  assert.equal(countEdges(forest).total, before);
  assert.equal(countEdges(forest).path, 0);
  place(w, 3, 4, 'park');
  const park = rebuildRoads(w);
  assert.equal(countEdges(park).total, before);
  assert.ok(countEdges(park).path <= 1);
});

test('roads : connectTile traverse la rivière par un pont et rejoint le réseau', () => {
  const w = riverColumn(place(place(makeWorld(7, 5), 1, 2, 'townhall'), 5, 2, 'house'), 3);
  const r = rebuildRoads(w);
  assert.ok(!networkConnected(r));
  assert.deepEqual(disconnectedTiles(r), [{ x: 5, y: 2 }]);
  const res = connectTile(r, 5, 2);
  assert.ok(res.ok, res.reason);
  assert.equal(res.bridges, 1, 'exactement un pont');
  assert.ok(res.cost >= 5, 'un pont coûte au moins 5');
  const bridges = res.path.filter((e) => e.value === EDGE.BRIDGE);
  assert.equal(bridges.length, 1);
  const [a, b] = edgeTiles(r, bridges[0]).map((p) => tileAt(r, p.x, p.y));
  assert.equal(a.terrain, 'river');
  assert.equal(b.terrain, 'river');
  assert.equal(bridges[0].kind, 'h', 'le pont franchit une rivière nord-sud par une arête est-ouest');
  for (const e of res.path) assert.ok(e.kind === 'h' || e.kind === 'v');
  const joined = rebuildRoads(applyPath(r, res.path));
  assert.equal(edgeValue(joined, bridges[0]), EDGE.BRIDGE, 'le pont survit au recalcul');
  assert.ok(networkConnected(joined));
  assert.equal(countEdges(joined).bridge, 1);
  // Une fois reliée, la case n'a plus besoin de tracé.
  assert.deepEqual(connectTile(joined, 5, 2).path, []);
});

test('roads : connectTile contourne le lac et la zone humide, et renonce si tout est bouché', () => {
  const w = place(place(makeWorld(9, 5), 1, 2, 'townhall'), 7, 2, 'house');
  for (const y of [1, 2, 3]) setTerrain(w, 4, y, 'lake');
  setTerrain(w, 4, 0, 'wetland');
  const r = rebuildRoads(w);
  const res = connectTile(r, 7, 2);
  assert.ok(res.ok, res.reason);
  for (const e of res.path) {
    for (const p of edgeTiles(r, e)) {
      if (!p) continue;
      const t = tileAt(r, p.x, p.y);
      assert.ok(t.terrain !== 'lake' && t.terrain !== 'wetland', `le tracé longe ${t.terrain} en (${p.x}, ${p.y})`);
    }
  }
  assert.ok(res.path.some((e) => e.y === 4 || e.y === 5), 'le tracé passe par le sud, seule ouverture');
  assert.ok(networkConnected(rebuildRoads(applyPath(r, res.path))));
  // Tout bouché : lac sur toute la hauteur.
  setTerrain(w, 4, 0, 'lake');
  setTerrain(w, 4, 4, 'lake');
  assert.deepEqual(connectTile(rebuildRoads(w), 7, 2), { ok: false, reason: 'unreachable' });
});

test('roads : la forêt coûte plus cher que l’herbe, et le tracé l’évite quand il peut', () => {
  const plain = rebuildRoads(place(place(makeWorld(9, 5), 1, 2, 'townhall'), 7, 2, 'house'));
  const direct = connectTile(plain, 7, 2);
  assert.ok(direct.ok);
  assert.ok(direct.cost > 0 && direct.path.length > 0, 'raccordement jusqu’à une véritable façade');
  // Bande de forêt sur toute la hauteur : il faut la traverser, plus cher.
  const woods = place(place(makeWorld(9, 5), 1, 2, 'townhall'), 7, 2, 'house');
  for (let y = 0; y < 5; y++) setTerrain(woods, 4, y, 'forest');
  const through = connectTile(rebuildRoads(woods), 7, 2);
  assert.ok(through.ok);
  assert.ok(through.cost > direct.cost, `${through.cost} > ${direct.cost}`);
  // Massif de 3 × 3 au milieu : le traverser coûterait 11 (trois arêtes à 3), le contourner par le nord 9.
  const partial = place(place(makeWorld(9, 5), 1, 2, 'townhall'), 7, 2, 'house');
  for (const x of [3, 4, 5]) for (const y of [1, 2, 3]) setTerrain(partial, x, y, 'forest');
  const around = connectTile(rebuildRoads(partial), 7, 2);
  assert.ok(around.ok);
  assert.ok(around.cost >= direct.cost, 'le contournement a un coût');
  for (const e of around.path) {
    const both = edgeTiles(partial, e).every((p) => p && tileAt(partial, p.x, p.y).terrain === 'forest');
    assert.ok(!both, 'aucune arête au cœur de la forêt');
  }
  // Coût d'arête : lac interdit, rivière des deux côtés = pont, berge = terre ferme.
  const costs = riverColumn(makeWorld(5, 3), 2);
  setTerrain(costs, 4, 1, 'lake');
  assert.deepEqual(edgeBuildCost(costs, edgesOfTile(costs, 2, 1).s), { cost: 5, bridge: true });
  assert.deepEqual(edgeBuildCost(costs, edgesOfTile(costs, 2, 1).w), { cost: 1, bridge: false });
  assert.equal(edgeBuildCost(costs, edgesOfTile(costs, 4, 1).w), null);
  assert.deepEqual(edgeBuildCost(costs, edgesOfTile(costs, 0, 1).e), { cost: 1, bridge: false });
});

test('roads : cas limites et véritable accès par un côté, jamais seulement par un coin', () => {
  assert.deepEqual(connectTile(makeWorld(4, 4), 1, 1), { ok: false, reason: 'no_network' });
  assert.deepEqual(connectTile(place(makeWorld(4, 4), 1, 1, 'townhall'), 9, 9), { ok: false, reason: 'out_of_bounds' });
  const w = rebuildRoads(place(makeWorld(8, 8), 3, 3, 'townhall'));
  assert.deepEqual(connectTile(w, 3, 3).path, []);
  let cornerOnly = null;
  for (let y=0; y<w.rows; y++) for(let x=0;x<w.cols;x++) {
    if (tileAt(w,x,y).building || Object.values(edgesOfTile(w,x,y)).some(e=>edgeValue(w,e)>=EDGE.STREET)) continue;
    const c = connectTile(w,x,y);
    if (c.ok && c.path.length) { cornerOnly = { x,y,c }; break; }
  }
  assert.ok(cornerOnly);
  const { x,y,c } = cornerOnly;
  const connected = applyPath(w,c.path);
  assert.ok(Object.values(edgesOfTile(connected,x,y)).some(e=>edgeValue(connected,e)>=EDGE.STREET));
  assert.ok(networkConnected(makeWorld(3,3)));
  const noHall = rebuildRoads(place(place(makeWorld(6,3),0,1,'house'),4,1,'house'));
  assert.deepEqual(disconnectedTiles(noHall), [{ x:4,y:1 }]);
});

test('roads : trafic motorisé seulement sur les chaussées ; les raccourcis piétons restent sans voiture', () => {
  const w = place(place(place(place(makeWorld(8,5),2,2,'townhall'),3,2,'house'),4,2,'house'),5,2,'shop');
  const r = rebuildRoads(w, { connect:true });
  const t = computeTraffic(r);
  assert.ok(trafficStats(t).total >= 4);
  for (const {ref} of interiorEdges(t)) {
    if (edgeValue(t,ref)<EDGE.STREET) assert.equal(t.traffic[ref.kind][ref.index],0);
  }
  const trip = shortestTrip(t,3,2,tile=>tile.building?.type==='shop');
  assert.ok(trip?.length);
  assert.ok(trip.every(ref=>edgeValue(t,ref)>=EDGE.STREET));
  assert.ok(r.traffic.h.every(v=>v===0));
});

test('roads : le trafic suit le réseau, pont compris', () => {
  const w = riverColumn(place(place(makeWorld(7, 5), 1, 2, 'townhall'), 5, 2, 'house'), 3);
  const r = rebuildRoads(w);
  const res = connectTile(r, 5, 2);
  const joined = rebuildRoads(applyPath(r, res.path));
  const t = computeTraffic(joined);
  const bridge = res.path.find((e) => e.value === EDGE.BRIDGE);
  assert.ok(t.traffic[bridge.kind][bridge.index] >= 1, 'les habitants passent par le pont');
  assert.equal(trafficStats(computeTraffic(r)).total, 0, 'sans raccordement, pas de trajet possible');
});

test('roads : orientation vers une rue existante, priorité aux chaussées sur les chemins', () => {
  const w = place(makeWorld(6,6),2,2,'house');
  const e = edgesOfTile(w,2,2);
  w.edges[e.e.kind][e.e.index] = EDGE.STREET;
  w.edges[e.s.kind][e.s.index] = EDGE.PATH;
  assert.equal(faceTowardRoad(w,2,2),90);
  w.edges[e.n.kind][e.n.index] = EDGE.STREET;
  assert.equal(faceTowardRoad(w,2,2,{x:2,y:0}),180);
});

test('roads : vallées générées desservies, moins de chaussées et recalcul stable', () => {
  for(const seed of [1,7,27,42,12345]) {
    const w = generateWorld({seed,starterTown:true});
    assert.ok(networkConnected(w), `graine ${seed}`);
    assert.ok(trafficStats(w).total>0);
    assert.ok(countEdges(w).total<26,'les maisons partagent leurs dessertes');
    assert.deepEqual(rebuildRoads(w).edges,w.edges,'recalcul stable');
    assert.deepEqual(rebuildRoads(w).avenues,w.avenues,'hiérarchie stable');
  }
});
