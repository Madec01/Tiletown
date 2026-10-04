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

test('roads : rue entre deux îlots, chemin entre îlot et nature, rien entre natures ni au bord', () => {
  const w = place(place(makeWorld(6, 6), 2, 2, 'townhall'), 3, 2, 'house');
  const r = rebuildRoads(w);
  assert.equal(edgeValue(r, edgesOfTile(r, 2, 2).e), EDGE.STREET, 'arête partagée = rue');
  assert.equal(edgeValue(r, edgesOfTile(r, 3, 2).w), EDGE.STREET);
  assert.equal(edgeValue(r, edgesOfTile(r, 2, 2).n), EDGE.PATH);
  assert.equal(edgeValue(r, edgesOfTile(r, 2, 2).s), EDGE.PATH);
  assert.equal(edgeValue(r, edgesOfTile(r, 2, 2).w), EDGE.PATH);
  assert.equal(edgeValue(r, edgesOfTile(r, 3, 2).e), EDGE.PATH);
  for (const { ref, tiles } of interiorEdges(r)) {
    const built = tiles.filter((t) => t && t.building).length;
    if (built === 0) assert.equal(edgeValue(r, ref), EDGE.NONE, 'aucune rue entre deux natures');
    if (tiles.includes(null)) assert.equal(edgeValue(r, ref), EDGE.NONE, 'rien au bord de la carte');
  }
  assert.deepEqual(countEdges(r), { path: 6, street: 1, bridge: 0, total: 1 });
  // Pureté : le monde d'origine n'a pas changé.
  assert.ok(w.edges.h.every((v) => v === 0) && w.edges.v.every((v) => v === 0));
});

test('roads : une nature plantée n’est pas un îlot (chemin, pas rue) ; les tracés existants sont gardés', () => {
  const w = place(place(makeWorld(6, 6), 2, 2, 'house'), 3, 2, 'park');
  const r = rebuildRoads(w);
  assert.equal(edgeValue(r, edgesOfTile(r, 2, 2).e), EDGE.PATH, 'maison | parc → chemin');
  assert.equal(edgeValue(r, edgesOfTile(r, 3, 2).e), EDGE.NONE, 'parc | herbe → rien');
  // Un tracé de raccordement posé à travers l'herbe survit au recalcul.
  const ref = edgesOfTile(w, 4, 4).n;
  w.edges.h[ref.index] = EDGE.STREET;
  const kept = rebuildRoads(w);
  assert.equal(edgeValue(kept, ref), EDGE.STREET);
  // Un ancien chemin orphelin (plus aucun îlot à côté) disparaît.
  const orphan = edgesOfTile(w, 0, 0).s;
  w.edges.h[orphan.index] = EDGE.PATH;
  assert.equal(edgeValue(rebuildRoads(w), orphan), EDGE.NONE);
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
  assert.deepEqual(connectTile(joined, 5, 2), { ok: true, path: [], cost: 0, bridges: 0 });
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
  assert.equal(direct.cost, 5, 'cinq arêtes d\u2019herbe à 1, du coin de la maison au coin de la mairie');
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
  assert.equal(around.cost, 9);
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

test('roads : cas limites de connectTile et du réseau', () => {
  assert.deepEqual(connectTile(makeWorld(4, 4), 1, 1), { ok: false, reason: 'no_network' });
  assert.deepEqual(connectTile(place(makeWorld(4, 4), 1, 1, 'townhall'), 9, 9), { ok: false, reason: 'out_of_bounds' });
  const w = rebuildRoads(place(place(makeWorld(6, 6), 2, 2, 'townhall'), 3, 2, 'house'));
  assert.deepEqual(connectTile(w, 3, 2), { ok: true, path: [], cost: 0, bridges: 0 }, 'déjà reliée');
  assert.deepEqual(connectTile(w, 4, 3), { ok: true, path: [], cost: 0, bridges: 0 }, 'touche le réseau par un coin');
  const far = connectTile(w, 2, 5);
  assert.ok(far.ok && far.path.length === 2 && far.cost === 2, 'deux arêtes vers le sud');
  assert.ok(networkConnected(makeWorld(3, 3)), 'rien de bâti : trivialement relié');
  // Sans mairie, le premier îlot bâti sert de racine.
  const noHall = rebuildRoads(place(place(makeWorld(6, 3), 0, 1, 'house'), 4, 1, 'house'));
  assert.deepEqual(disconnectedTiles(noHall), [{ x: 4, y: 1 }]);
});

test('roads : trafic non nul, seulement sur des arêtes équipées, une maison voisine charge la rue partagée', () => {
  const w = place(place(place(place(makeWorld(8, 5), 2, 2, 'townhall'), 3, 2, 'house'), 4, 2, 'house'), 5, 2, 'shop');
  const r = rebuildRoads(w);
  const t = computeTraffic(r);
  const stats = trafficStats(t);
  assert.ok(stats.total > 0 && stats.max > 0);
  for (const { ref } of interiorEdges(t)) {
    if (t.traffic[ref.kind][ref.index] > 0) assert.ok(edgeValue(t, ref) >= EDGE.PATH, 'du trafic hors rue');
  }
  // Quatre trajets (2 maisons × emploi + commerce), chacun d'au moins une arête.
  assert.ok(stats.total >= 4);
  const shared = edgesOfTile(t, 3, 2).w; // rue entre la maison (3, 2) et la mairie
  assert.ok(t.traffic[shared.kind][shared.index] >= 1, 'la maison voisine de la mairie emprunte leur rue commune');
  const shopSide = edgesOfTile(t, 4, 2).e; // rue entre la maison (4, 2) et le commerce
  assert.ok(t.traffic[shopSide.kind][shopSide.index] >= 1);
  // Les rues au milieu de la rangée voient passer les deux maisons.
  assert.ok(stats.max >= 2);
  // Le trafic d'origine n'est pas modifié ; sans maison, tout est nul.
  assert.ok(r.traffic.h.every((v) => v === 0));
  const empty = computeTraffic(rebuildRoads(place(makeWorld(4, 4), 1, 1, 'townhall')));
  assert.equal(trafficStats(empty).total, 0);
  // shortestTrip : le trajet le plus court vers une cible désignée.
  const trip = shortestTrip(t, 3, 2, (tile) => tile.building && tile.building.type === 'shop');
  assert.ok(trip && trip.length >= 1);
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

test('roads : orientation vers la rue la plus importante', () => {
  const w = rebuildRoads(place(place(makeWorld(6, 6), 2, 2, 'house'), 3, 2, 'shop'));
  assert.equal(faceTowardRoad(w, 2, 2), 90, 'la maison regarde sa rue à l’est');
  assert.equal(faceTowardRoad(w, 3, 2), 270, 'le commerce regarde sa rue à l’ouest');
  const alone = rebuildRoads(place(makeWorld(5, 5), 2, 2, 'townhall'));
  assert.equal(faceTowardRoad(alone, 2, 2), 0, 'à égalité : le sud');
  assert.equal(faceTowardRoad(alone, 2, 2, { x: 2, y: 0 }), 180, 'à égalité : vers la cible (nord)');
  assert.equal(faceTowardRoad(alone, 2, 2, { x: 0, y: 2 }), 270);
});

test('roads : sur une vallée générée, rues partout entre îlots voisins, jamais entre natures', () => {
  const w = generateWorld({ seed: 7, starterTown: true });
  for (const { ref, tiles } of interiorEdges(w)) {
    const [a, b] = tiles;
    const builtA = Boolean(a && a.building && a.building.type !== 'field');
    const builtB = Boolean(b && b.building && b.building.type !== 'field');
    const v = edgeValue(w, ref);
    if (builtA && builtB) assert.equal(v, EDGE.STREET);
    else if (!a || !b) assert.equal(v, EDGE.NONE);
    else if (builtA || builtB) assert.equal(v, EDGE.PATH);
    else assert.equal(v, EDGE.NONE);
  }
  assert.ok(networkConnected(w));
  assert.ok(trafficStats(w).total > 0);
  assert.deepEqual(rebuildRoads(w).edges, w.edges, 'le recalcul est stable');
});
