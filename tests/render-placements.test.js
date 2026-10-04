// Tests des fonctions pures du rendu : instances des îlots et de la nature (buildings.js),
// bandes de rue et nœuds sur les arêtes (roads.js), couleurs des calques (layers.js).
// three.js s'importe sous Node (aucun accès au DOM dans ces fonctions).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectPlacements } from '../src/render3d/buildings.js';
import { collectRoadPlacements, EDGE_PATH, EDGE_STREET, EDGE_BRIDGE } from '../src/render3d/roads.js';
import { layerColors, valueScale } from '../src/render3d/layers.js';
import { hillHeight, surfaceHeight, WATER_LEVEL } from '../src/render3d/ground.js';
import { familyOf, fallbackHeight } from '../src/render3d/models.js';
import { hashUnit } from '../src/render3d/util.js';

/** Petit monde 4 × 3 : herbe, forêt, prairie, champ, colline, rivière, bâtiments. */
function makeWorld() {
  const cols = 4, rows = 3;
  const terrains = [
    'grass', 'forest', 'meadow', 'field',
    'grass', 'grass', 'river', 'hill',
    'wetland', 'lake', 'grass', 'grass',
  ];
  const tiles = terrains.map((terrain) => ({ terrain, flow: null, native: true, building: null }));
  tiles[0].building = { type: 'house', level: 1, variant: 2, yaw: 90 };
  tiles[4].building = { type: 'townhall', level: 1, variant: 0, yaw: 0 };
  tiles[5].building = { type: 'tree-planting', level: 1, variant: 0, yaw: 0 };
  tiles[10].building = { type: 'hedge', level: 1, variant: 0, yaw: 90 };
  tiles[11].building = { type: 'orchard', level: 1, variant: 0, yaw: 0 };
  const edges = { h: new Uint8Array((rows + 1) * cols), v: new Uint8Array(rows * (cols + 1)) };
  return { seed: 7, cols, rows, tiles, edges };
}

test('hashUnit : déterministe, dans [0, 1), sensible à chaque argument', () => {
  const a = hashUnit(1, 2, 3, 4);
  assert.equal(a, hashUnit(1, 2, 3, 4));
  assert.ok(a >= 0 && a < 1);
  assert.notEqual(a, hashUnit(2, 2, 3, 4));
  assert.notEqual(a, hashUnit(1, 3, 3, 4));
  assert.notEqual(a, hashUnit(1, 2, 3, 5));
  let min = 1, max = 0;
  for (let i = 0; i < 1000; i++) { const u = hashUnit(99, i, i * 7, 0); min = Math.min(min, u); max = Math.max(max, u); }
  assert.ok(min < 0.05 && max > 0.95, 'répartition correcte');
});

test('collectPlacements : bâtiments au centre de leur case, orientés en degrés, nature native décorée', () => {
  const world = makeWorld();
  const p = collectPlacements(world);
  const house = p.filter((x) => x.tile === 0);
  assert.equal(house.length, 1);
  assert.equal(house[0].id, 'house-c', 'variant 2 → troisième modèle du niveau 1');
  assert.equal(house[0].x, 0.5); assert.equal(house[0].z, 0.5); assert.equal(house[0].y, 0);
  assert.ok(Math.abs(house[0].yaw - Math.PI / 2) < 1e-9, 'yaw 90° → π/2');
  const hall = p.filter((x) => x.tile === 4);
  assert.deepEqual(hall.map((x) => x.id), ['townhall']);
  // Forêt native : 2 ou 3 arbres parmi les modèles du terrain, dans la case
  const forest = p.filter((x) => x.tile === 1);
  assert.ok(forest.length >= 2 && forest.length <= 3, `forêt : ${forest.length} arbres`);
  for (const t of forest) {
    assert.ok(/^(tree|pine)-/.test(t.id), t.id);
    assert.ok(t.x > 1 && t.x < 2 && t.z > 0 && t.z < 1, 'dans la case (1, 0)');
    assert.ok(t.scale > 0.8 && t.scale < 1.2);
  }
  // Prairie : fleurs clairsemées ; champ : une culture ; colline : rochers posés au sommet ; eau : rien
  assert.ok(p.filter((x) => x.tile === 2).every((x) => x.id === 'flowers') && p.filter((x) => x.tile === 2).length >= 2);
  const field = p.filter((x) => x.tile === 3);
  assert.equal(field.length, 1); assert.match(field[0].id, /^crop-/);
  const rocks = p.filter((x) => x.tile === 7);
  assert.ok(rocks.length >= 1 && rocks.every((x) => /^rock-/.test(x.id)));
  for (const r of rocks) assert.ok(Math.abs(r.y - hillHeight(world, 3, 1)) < 1e-9, 'rocher au sommet de la colline');
  assert.equal(p.filter((x) => x.tile === 6).length, 0, 'rivière : aucun décor');
  assert.equal(p.filter((x) => x.tile === 9).length, 0, 'lac : aucun décor');
  assert.ok(p.filter((x) => x.tile === 8).length >= 2, 'zone humide : buissons');
  // Natures plantées : bosquet de 3, haie de 3 alignés en Z (yaw 90), verger de 4 petits arbres
  assert.equal(p.filter((x) => x.tile === 5).length, 3);
  const hedge = p.filter((x) => x.tile === 10);
  assert.equal(hedge.length, 3);
  assert.ok(hedge.every((x) => Math.abs(x.x - 2.5) < 1e-9), 'haie alignée nord-sud');
  const orchard = p.filter((x) => x.tile === 11);
  assert.equal(orchard.length, 4);
  assert.ok(orchard.every((x) => x.scale < 0.7));
  // Déterminisme
  assert.deepEqual(collectPlacements(world), p);
});

test('collectPlacements : un bâtiment inconnu du catalogue garde son type comme identifiant', () => {
  const world = makeWorld();
  world.tiles[0].building = { type: 'mystery', level: 1, variant: 0, yaw: 0 };
  const p = collectPlacements(world).filter((x) => x.tile === 0);
  assert.deepEqual(p.map((x) => x.id), ['mystery']);
  assert.equal(familyOf('mystery'), null);
  assert.equal(fallbackHeight('mystery'), 0.8);
  assert.equal(familyOf('building-tall-b'), 'building-tall');
  assert.equal(familyOf('flowers'), 'flower');
  assert.equal(familyOf('pine-a'), 'pine');
  assert.ok(fallbackHeight('building-tall-a') > fallbackHeight('house-a'));
});

test('surfaceHeight : 0 sur la terre, abaissé sur l’eau, relevé sur les collines', () => {
  const world = makeWorld();
  assert.equal(surfaceHeight(world, 0, 0), 0);
  assert.equal(surfaceHeight(world, 2, 1), WATER_LEVEL);
  assert.ok(surfaceHeight(world, 3, 1) > 0.2);
});

test('collectRoadPlacements : bandes centrées sur les arêtes, orientation, nœuds aux angles et carrefours', () => {
  const world = makeWorld();
  const { cols } = world;
  const h = (x, y, v) => { world.edges.h[y * cols + x] = v; };
  const v = (x, y, val) => { world.edges.v[y * (cols + 1) + x] = val; };
  // Rue horizontale sur la ligne y = 1 de x = 0 à 2, rue verticale en x = 2 de y = 1 à 2 : angle en (2, 1)
  h(0, 1, EDGE_STREET); h(1, 1, EDGE_STREET);
  v(2, 1, EDGE_STREET);
  // Chemin en x = 1 de y = 0 à 1 (rejoint la rue en (1, 1) : pas de nœud de chemin seul)
  v(1, 0, EDGE_PATH);
  // Pont sur l'arête h(2, 2) entre la rivière (2, 1) et l'herbe (2, 2)
  h(2, 2, EDGE_BRIDGE);
  const r = collectRoadPlacements(world);
  assert.equal(r.streets.length, 3);
  assert.deepEqual(r.streets[0], { x: 0.5, z: 1, horizontal: true, traffic: 0 });
  assert.deepEqual(r.streets[2], { x: 2, z: 1.5, horizontal: false, traffic: 0 });
  assert.deepEqual(r.paths, [{ x: 1, z: 0.5, horizontal: false, traffic: 0 }]);
  assert.deepEqual(r.bridges, [{ x: 2.5, z: 2, horizontal: true, traffic: 0 }]);
  // Nœuds : angle en (2, 1) (rue est-ouest qui tourne vers le sud) et angle en (2, 2) (la rue verticale
  // rejoint le pont) ; pas de nœud en (1, 1) (rue droite) ni là où le chemin rejoint la rue.
  assert.deepEqual(r.streetNodes, [{ x: 2, z: 1, degree: 2 }, { x: 2, z: 2, degree: 2 }]);
  assert.deepEqual(r.pathNodes, []);
  // Carrefour à 3 : on ajoute une rue vers le nord en (2, 1)
  v(2, 0, EDGE_STREET);
  const r2 = collectRoadPlacements(world);
  assert.deepEqual(r2.streetNodes, [{ x: 2, z: 1, degree: 3 }, { x: 2, z: 2, degree: 2 }]);
  // Trafic recopié
  world.traffic = { h: new Float32Array(world.edges.h.length), v: new Float32Array(world.edges.v.length) };
  world.traffic.h[1 * cols + 0] = 5;
  assert.equal(collectRoadPlacements(world).streets[0].traffic, 5);
  // Deux chemins en angle forment un nœud de chemin
  v(1, 0, 0); h(0, 0, EDGE_PATH); v(1, 0, EDGE_PATH);
  world.edges.h[1 * cols + 0] = 0; world.edges.h[1 * cols + 1] = 0;
  assert.deepEqual(collectRoadPlacements(world).pathNodes, [{ x: 1, z: 0, degree: 2 }]);
  // Monde sans arêtes : rien, sans erreur
  assert.deepEqual(collectRoadPlacements({ cols: 2, rows: 2, tiles: [] }).streets, []);
});

test('layerColors : none → null, valeurs 0-100 ou 0-1, mélange avec la couleur du terrain', () => {
  const base = new Float32Array([0.2, 0.6, 0.2, 0.2, 0.6, 0.2]);
  assert.equal(layerColors('none', new Float32Array([50, 50]), base), null);
  assert.equal(layerColors('air', null, base), null);
  assert.equal(valueScale(new Float32Array([0.2, 0.9])), 1);
  assert.equal(valueScale(new Float32Array([0.2, 40])), 100);
  const air = layerColors('air', new Float32Array([0, 100]), base);
  assert.equal(air.length, 6);
  // Case 0 (air pur) : vers le gris clair ; case 1 (irrespirable) : vers le brun, plus rouge que vert
  assert.ok(air[0] > base[0] && air[1] > 0.3, 'gris clair');
  assert.ok(air[3] > air[4], 'brun : rouge > vert');
  const fauna = layerColors('fauna', new Float32Array([0, 1]), base);
  const saturation = (c, i) => c[i * 3 + 1] - Math.max(c[i * 3], c[i * 3 + 2]);
  assert.ok(saturation(fauna, 1) > saturation(fauna, 0), 'faune riche : vert plus vif (plus saturé) que faune pauvre');
  assert.throws(() => layerColors('bidule', new Float32Array([0, 1]), base));
});
