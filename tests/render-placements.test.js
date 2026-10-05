// Tests des fonctions pures du rendu : instances des îlots, semis continu de la végétation et
// abords des bâtiments (buildings.js), bandes et nœuds de rue sur les arêtes (roads.js), couleurs
// des calques (layers.js). three.js s'importe sous Node (aucun accès au DOM dans ces fonctions).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  collectPlacements, coverageAt, valueNoise, resolveRoles, entrySide, groundAt,
  BUILDING_SCALE, LOT_HALF, SPILL, GROUP_TREE, GROUP_COVER, GROUP_SOLID,
} from '../src/render3d/buildings.js';
import { collectRoadPlacements, EDGE_PATH, EDGE_STREET, EDGE_BRIDGE, ROAD_WIDTH, SIDEWALK_WIDTH } from '../src/render3d/roads.js';
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

/**
 * Monde 10 × 10 : un massif de forêt 4 × 4 au nord-ouest sur fond d'herbe, un lac, et un petit pâté
 * de deux îlots bâtis bordés de rues. Sert aux tests du semis continu et des abords.
 */
function makeForestWorld(seed = 1234) {
  const cols = 10, rows = 10;
  const tiles = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let terrain = 'grass';
      if (x >= 1 && x <= 4 && y >= 1 && y <= 4) terrain = 'forest';
      else if (x === 8 && y === 8) terrain = 'lake';
      tiles.push({ terrain, flow: null, native: true, building: null, variant: 0 });
    }
  }
  const at = (x, y) => tiles[y * cols + x];
  at(5, 6).building = { type: 'house', level: 1, variant: 0, yaw: 0 };
  at(6, 6).building = { type: 'shop', level: 1, variant: 0, yaw: 180 };
  const edges = { h: new Uint8Array((rows + 1) * cols), v: new Uint8Array(rows * (cols + 1)) };
  // Une rue tout autour des deux îlots.
  for (const x of [5, 6]) { edges.h[6 * cols + x] = EDGE_STREET; edges.h[7 * cols + x] = EDGE_STREET; }
  for (const x of [5, 7]) edges.v[6 * (cols + 1) + x] = EDGE_STREET;
  return { seed, cols, rows, tiles, edges };
}

const isTree = (p) => p.group === GROUP_TREE;

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

test('valueNoise : continu, dans [0, 1), déterministe et identique aux nœuds entiers', () => {
  assert.equal(valueNoise(3, 2, 5, 1), hashUnit(3, 2, 5, 1));
  assert.equal(valueNoise(3, 2.25, 5.5, 1), valueNoise(3, 2.25, 5.5, 1));
  let min = 1, max = 0, prev = valueNoise(3, 0, 0, 1);
  for (let i = 1; i <= 400; i++) {
    const v = valueNoise(3, i * 0.05, 1.7, 1);
    assert.ok(v >= 0 && v < 1);
    assert.ok(Math.abs(v - prev) < 0.35, 'champ continu : pas de saut brutal');
    min = Math.min(min, v); max = Math.max(max, v); prev = v;
  }
  assert.ok(min < 0.3 && max > 0.7, 'le champ balaie bien sa plage');
});

test('coverageAt : 1 au cœur du massif, ≈ 0,5 sur la lisière, nul à une demi-case au-delà', () => {
  // Massif : les cases x ∈ [1, 4] (une bande), tout le reste vide.
  const ind = (x) => (x >= 1 && x <= 4 ? 1 : 0);
  assert.equal(coverageAt(ind, 2.5, 2.5), 1, 'cœur');
  assert.ok(Math.abs(coverageAt(ind, 2, 2.5) - 1) < 1e-9, 'entre deux cases du massif');
  assert.ok(Math.abs(coverageAt(ind, 1, 2.5) - 0.5) < 1e-9, 'bord ouest du massif');
  assert.ok(Math.abs(coverageAt(ind, 5, 2.5) - 0.5) < 1e-9, 'milieu de la lisière');
  assert.ok(Math.abs(coverageAt(ind, 5.5, 2.5)) < 1e-9, 'centre de la case voisine : nul');
  assert.ok(coverageAt(ind, 5.2, 2.5) > 0 && coverageAt(ind, 5.2, 2.5) < 0.4, 'débordement qui décroît');
});

test('resolveRoles : prend les nouveaux modèles s’ils existent, les anciens sinon', () => {
  const old = resolveRoles(() => false);
  assert.deepEqual(old.treeL.list, ['tree-a', 'tree-b']);
  assert.deepEqual(old.shrub.list, ['bush']);
  assert.deepEqual(old.tuft.list, ['flowers']);
  assert.ok(old.treeS.max < old.treeL.min, 'les anciens arbres sont réduits pour les jeunes pousses');
  const neuf = resolveRoles((id) => ['tree-round-l', 'tree-tall-l', 'shrub-a', 'grass-tuft-a', 'sapling'].includes(id));
  assert.deepEqual(neuf.treeL.list, ['tree-round-l', 'tree-tall-l']);
  assert.deepEqual(neuf.shrub.list, ['shrub-a']);
  assert.deepEqual(neuf.tuft.list, ['grass-tuft-a']);
  assert.deepEqual(neuf.sapling.list, ['sapling']);
  assert.deepEqual(neuf.pineL.list, ['pine-a'], 'un rôle sans nouveau modèle garde l’ancien');
});

test('collectPlacements : bâtiments au centre de leur case, orientés en degrés, nature native décorée', () => {
  const world = makeWorld();
  const p = collectPlacements(world);
  const house = p.filter((x) => x.tile === 0 && x.id.startsWith('house'));
  assert.equal(house.length, 1);
  assert.equal(house[0].id, 'house-c', 'variant 2 → troisième modèle du niveau 1');
  assert.equal(house[0].x, 0.5); assert.equal(house[0].z, 0.5); assert.equal(house[0].y, 0);
  assert.equal(house[0].scale, BUILDING_SCALE);
  assert.equal(house[0].group, GROUP_SOLID);
  assert.ok(Math.abs(house[0].yaw - Math.PI / 2) < 1e-9, 'yaw 90° → π/2');
  const hall = p.filter((x) => x.tile === 4 && x.id === 'townhall');
  assert.equal(hall.length, 1);

  // Forêt native : des arbres, dans la case et un peu au-delà, de tailles mêlées
  const forest = p.filter((x) => x.tile === 1 && isTree(x));
  assert.ok(forest.length >= 2, `forêt : ${forest.length} arbres`);
  for (const t of forest) {
    assert.ok(/^(tree|pine)-/.test(t.id), t.id);
    assert.ok(t.x > 1 && t.x < 2 && t.z > 0 && t.z < 1, 'posé dans la case (1, 0)');
  }
  assert.ok(new Set(forest.map((t) => Math.round(t.scale * 100))).size > 1, 'échelles variées');
  assert.ok(new Set(forest.map((t) => Math.round(t.yaw * 100))).size > 1, 'rotations variées');

  // Prairie : fleurs et touffes ; champ : une culture ; colline : rochers ; eau : rien
  const meadow = p.filter((x) => x.tile === 2);
  assert.ok(meadow.length >= 2 && meadow.every((x) => x.id === 'flowers' || x.group === GROUP_COVER || isTree(x)));
  const field = p.filter((x) => x.tile === 3);
  assert.equal(field.length, 1); assert.match(field[0].id, /^crop-/);
  const onHill = p.filter((x) => x.tile === 7);
  assert.ok(onHill.length >= 1, 'colline : du décor');
  for (const r of onHill) {
    assert.ok(Math.abs(r.x - 3.5) > 1e-6 || Math.abs(r.z - 1.5) > 1e-6, 'décor jamais pile au centre de la case');
    assert.ok(Math.abs(r.y - groundAt(world, r.x, r.z)) < 1e-9, 'décor posé sur le sol continu');
    assert.ok(r.y > hillHeight(world, 3, 1) * 0.4, 'décor relevé par la colline');
  }
  assert.equal(p.filter((x) => x.tile === 6).length, 0, 'rivière : aucun décor');
  assert.equal(p.filter((x) => x.tile === 9).length, 0, 'lac : aucun décor');
  assert.ok(p.filter((x) => x.tile === 8).length >= 2, 'zone humide : roseaux');

  // Natures plantées : bosquet jeune, haie alignée en Z (yaw 90), verger de 4 petits arbres
  assert.ok(p.filter((x) => x.tile === 5).length >= 4, 'forêt plantée : un bosquet');
  const hedge = p.filter((x) => x.tile === 10);
  assert.equal(hedge.length, 5);
  assert.ok(hedge.every((x) => Math.abs(x.x - 2.5) < 0.03), 'haie alignée nord-sud');
  const orchard = p.filter((x) => x.tile === 11);
  assert.equal(orchard.length, 4);
  assert.ok(orchard.every((x) => x.scale < 0.7));

  // Déterminisme : à graine égale, exactement la même liste
  assert.deepEqual(collectPlacements(makeWorld()), p);
  const other = makeWorld(); other.seed = 8;
  assert.notDeepEqual(collectPlacements(other), p, 'une autre graine donne un autre semis');
});

test('semis continu : une forêt lue comme un massif — débordement borné, densité décroissante, rien sur l’eau ni sur le bâti', () => {
  const world = makeForestWorld();
  const p = collectPlacements(world);
  const trees = p.filter(isTree);
  assert.ok(trees.length > 30, `semis dense : ${trees.length} arbres`);

  // Aucune instance sur une case bâtie, sur l'eau, ou hors de la grille
  for (const q of p) {
    assert.ok(q.x > -SPILL && q.z > -SPILL && q.x < world.cols + SPILL && q.z < world.rows + SPILL);
    const tx = Math.floor(q.x), ty = Math.floor(q.z);
    if (tx < 0 || ty < 0 || tx >= world.cols || ty >= world.rows) continue;
    const tile = world.tiles[ty * world.cols + tx];
    assert.ok(tile.terrain !== 'lake', `rien sur l’eau (${q.id} en ${q.x}, ${q.z})`);
    if (tile.building) assert.equal(q.tile, ty * world.cols + tx, 'seul le décor d’abords se pose sur une case bâtie');
  }
  // Aucun arbre du semis sur les deux cases bâties (seuls les abords y vivent, et ce sont des arbres de rue)
  const onBuilt = trees.filter((q) => {
    const tile = world.tiles[Math.floor(q.z) * world.cols + Math.floor(q.x)];
    return tile && tile.building;
  });
  for (const q of onBuilt) {
    const d = Math.max(Math.abs(q.x - (Math.floor(q.x) + 0.5)), Math.abs(q.z - (Math.floor(q.z) + 0.5)));
    assert.ok(d >= LOT_HALF - 0.05, 'sur une case bâtie, seul un arbre de rue au bord de la parcelle');
  }

  // Débordement : les arbres sortent du massif, mais jamais de plus de SPILL
  const inForest = (x, y) => x >= 1 && x <= 4 && y >= 1 && y <= 4;
  let spilled = 0, maxSpill = 0;
  for (const t of trees) {
    const tx = Math.floor(t.x), ty = Math.floor(t.z);
    if (inForest(tx, ty)) continue;
    // distance au rectangle [1, 5] × [1, 5] du massif
    const dx = Math.max(1 - t.x, 0, t.x - 5);
    const dz = Math.max(1 - t.z, 0, t.z - 5);
    const d = Math.hypot(dx, dz);
    if (d > 0) { spilled++; maxSpill = Math.max(maxSpill, d); }
  }
  assert.ok(spilled > 0, 'les bosquets débordent sur les cases voisines');
  assert.ok(maxSpill <= SPILL + 1e-9, `débordement borné à ${SPILL} (mesuré ${maxSpill.toFixed(3)})`);

  // Densité : le cœur du massif porte plus d'arbres que la lisière
  const count = (x0, x1, y0, y1) => trees.filter((t) => t.x >= x0 && t.x < x1 && t.z >= y0 && t.z < y1).length;
  const core = count(2, 4, 2, 4) / 4;          // 2 × 2 cases au cœur
  const edge = count(5, 6, 1, 5) / 4;          // la bande juste au-delà de la lisière est
  assert.ok(core > edge * 1.5, `densité plus forte au cœur (${core.toFixed(2)}) qu’en lisière (${edge.toFixed(2)})`);

  // Les arbres ne se posent pas sur la rue
  for (const t of trees) {
    const tx = Math.floor(t.x), ty = Math.floor(t.z);
    if (ty === 6 && (tx === 5 || tx === 6)) continue;        // cases bâties : arbres de rue, hors semis
    const nearH = Math.min(Math.abs(t.z - 6), Math.abs(t.z - 7));
    if (tx >= 5 && tx <= 6) assert.ok(nearH > ROAD_WIDTH / 2, 'aucun arbre sur la chaussée');
  }

  // Lisière garnie : arbustes et touffes présents juste en dehors du couvert
  const cover = p.filter((q) => q.group === GROUP_COVER);
  assert.ok(cover.length > 20, `sous-bois et prairie fleurie : ${cover.length} éléments`);
});

test('semis des collines : des rochers irréguliers, sans emplacement type', () => {
  const cols = 5, rows = 5;
  const tiles = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      tiles.push({ terrain: x >= 1 && x <= 3 && y >= 1 && y <= 3 ? 'hill' : 'grass', flow: null, native: true, building: null });
    }
  }
  const world = { seed: 42, cols, rows, tiles, edges: { h: new Uint8Array((rows + 1) * cols), v: new Uint8Array(rows * (cols + 1)) } };
  const p = collectPlacements(world);
  const rocks = p.filter((q) => /^rock-/.test(q.id));
  assert.ok(rocks.length >= 6, `des rochers sur le relief : ${rocks.length}`);
  for (const r of rocks) assert.ok(Math.abs(r.y - groundAt(world, r.x, r.z)) < 1e-9, 'posé sur le sol continu');
  // Les rochers ne sont plus accrochés au centre des cases : au plus un s'en approche par hasard.
  const centred = rocks.filter((r) => {
    const tx = Math.floor(r.x), ty = Math.floor(r.z);
    return Math.abs(r.x - (tx + 0.5)) < 0.06 && Math.abs(r.z - (ty + 0.5)) < 0.06;
  });
  assert.ok(centred.length <= Math.ceil(rocks.length * 0.15), `semis irrégulier : ${centred.length} rochers sur ${rocks.length} près d’un centre de case`);
  // Aucun emplacement type : les décalages dans la case sont presque tous différents
  const slots = new Set(rocks.map((r) => `${Math.round((r.x % 1) * 20)},${Math.round((r.z % 1) * 20)}`));
  assert.ok(slots.size >= rocks.length - 1, `décalages variés : ${slots.size} / ${rocks.length}`);
  // Plusieurs rochers par case : ils ne peuvent pas tous occuper un emplacement type
  const perTile = new Map();
  for (const r of rocks) {
    const key = `${Math.floor(r.x)},${Math.floor(r.z)}`;
    perTile.set(key, (perTile.get(key) || 0) + 1);
  }
  assert.ok(Math.max(...perTile.values()) >= 2, 'des cases portent plusieurs rochers');
  assert.ok(new Set(rocks.map((r) => Math.round(r.scale * 50))).size > 2, 'tailles variées');
  assert.deepEqual(collectPlacements(world), p, 'déterminisme');
});

test('abords d’un îlot : parcelle plantée, allée côté façade, arbres de rue', () => {
  const world = makeForestWorld();
  world.edges.h[6 * world.cols + 5] = 0; // jardin derrière la maison, côté nord
  const p = collectPlacements(world);
  const i = 6 * world.cols + 5;
  const decor = p.filter((q) => q.tile === i && q.group !== GROUP_SOLID);
  assert.ok(decor.length >= 1, 'le quartier a des plantations d’abords');
  for (const d of decor) {
    const r = Math.max(Math.abs(d.x - 5.5), Math.abs(d.z - 6.5));
    assert.ok(r > 0.2 && r <= 0.42, `plantation dans la bande de parcelle (r = ${r.toFixed(3)})`);
  }
  // L'entrée : la maison a yaw 0 (façade au sud) et une rue au sud → côté 2
  assert.equal(entrySide(world, 5, 6), 2);
  assert.equal(entrySide(world, 6, 6), 0, 'le commerce regarde le nord (yaw 180)');
  assert.equal(entrySide(world, 0, 0), null, 'pas de bâtiment : pas d’entrée');
});

test('collectPlacements : un bâtiment inconnu du catalogue garde son type comme identifiant', () => {
  const world = makeWorld();
  world.tiles[0].building = { type: 'mystery', level: 1, variant: 0, yaw: 0 };
  const p = collectPlacements(world).filter((x) => x.tile === 0 && x.id === 'mystery');
  assert.equal(p.length, 1);
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

test('collectRoadPlacements : bandes centrées sur les arêtes, pièce de nœud à chaque sommet, virages arrondis', () => {
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
  assert.deepEqual(r.streets[0], { x: 0.5, z: 1, horizontal: true, main: false, traffic: 0 });
  assert.deepEqual(r.streets[2], { x: 2, z: 1.5, horizontal: false, main: false, traffic: 0 });
  assert.deepEqual(r.paths, [{ x: 1, z: 0.5, horizontal: false, main: false, traffic: 0 }]);
  assert.deepEqual(r.bridges, [{ x: 2.5, z: 2, horizontal: true, main: true, traffic: 0 }]);
  // Un nœud à CHAQUE sommet touché par une rue : les bandes s'y arrêtent.
  const byXZ = (a, b) => (a.z - b.z) || (a.x - b.x);
  const nodes = [...r.streetNodes].sort(byXZ);
  assert.deepEqual(nodes.map((n) => [n.x, n.z, n.shape, n.quarter]), [
    [0, 1, 'end', 0],       // bout de rue à l'ouest (branche vers l'est)
    [1, 1, 'straight', 0],  // rue droite est-ouest
    [2, 1, 'corner', 3],    // virage : vers l'ouest et vers le sud
    [2, 2, 'corner', 1],    // la rue verticale rejoint le pont (vers le nord et vers l'est)
    [3, 2, 'end', 2],       // bout du pont
  ]);
  assert.deepEqual(r.pathNodes, []);
  // Carrefour à 3 : on ajoute une rue vers le nord en (2, 1)
  v(2, 0, EDGE_STREET);
  const r2 = collectRoadPlacements(world);
  const tee = r2.streetNodes.find((n) => n.x === 2 && n.z === 1);
  assert.equal(tee.shape, 'tee'); assert.equal(tee.degree, 3);
  // Trafic recopié
  world.traffic = { h: new Float32Array(world.edges.h.length), v: new Float32Array(world.edges.v.length) };
  world.traffic.h[1 * cols + 0] = 5;
  assert.equal(collectRoadPlacements(world).streets[0].traffic, 5);
  // Deux chemins en angle forment un nœud de chemin
  v(1, 0, 0); v(2, 0, 0); h(0, 0, EDGE_PATH); v(1, 0, EDGE_PATH);
  world.edges.h[1 * cols + 0] = 0; world.edges.h[1 * cols + 1] = 0;
  assert.deepEqual(collectRoadPlacements(world).pathNodes, [{ x: 1, z: 0, degree: 2 }]);
  // Monde sans arêtes : rien, sans erreur
  assert.deepEqual(collectRoadPlacements({ cols: 2, rows: 2, tiles: [] }).streets, []);
});

test('collectRoadPlacements : parcelle et allée d’entrée sous chaque îlot bâti', () => {
  const world = makeForestWorld();
  const r = collectRoadPlacements(world);
  assert.equal(r.lots.length, 2, 'une parcelle par îlot bâti (pas sous la nature plantée)');
  const house = r.lots.find((l) => l.tile === 6 * world.cols + 5);
  assert.equal(house.kind, 'garden');
  assert.ok(house.x - house.width/2 >= 5 && house.x + house.width/2 <= 6);
  assert.equal(house.x + house.width/2, 6, 'le jardin rejoint la parcelle voisine en l’absence de rue');
  const shop = r.lots.find((l) => l.tile === 6 * world.cols + 6);
  assert.equal(shop.kind, 'paved');
  assert.equal(r.driveways.length, 2);
  const drive = r.driveways.find((d) => d.tile === 6 * world.cols + 5);
  assert.ok(Math.abs(drive.yaw) < 1e-9, 'la maison s’ouvre au sud : allée dans l’axe canonique');
  const driveShop = r.driveways.find((d) => d.tile === 6 * world.cols + 6);
  assert.ok(Math.abs(Math.abs(driveShop.yaw) - Math.PI) < 1e-9, 'le commerce s’ouvre au nord');
  // La parcelle tient dans la case, à l'intérieur du trottoir
  assert.ok(LOT_HALF <= 0.5 - SIDEWALK_WIDTH / 2 + 0.02);
  // Une nature plantée n'a ni parcelle ni allée
  const w2 = makeWorld();
  assert.equal(collectRoadPlacements(w2).lots.filter((l) => l.tile === 5 || l.tile === 10 || l.tile === 11).length, 0);
});

test('layerColors : none → null, valeurs 0-100 ou 0-1, mélange avec la couleur du terrain', () => {
  const base = new Float32Array([0.2, 0.6, 0.2, 0.2, 0.6, 0.2]);
  assert.equal(layerColors('none', new Float32Array([50, 50]), base), null);
  assert.equal(layerColors('air', null, base), null);
  assert.equal(valueScale(new Float32Array([0.2, 0.9])), 1);
  assert.equal(valueScale(new Float32Array([0.2, 40])), 100);
  const air = layerColors('air', new Float32Array([0, 100]), base);
  assert.equal(air.length, 6);
  // Case 0 (air pur) : turquoise ; case 1 (irrespirable) : rouge.
  assert.ok(air[1] > air[0] && air[2] > air[0], 'turquoise : vert et bleu > rouge');
  assert.ok(air[3] > air[4], 'pollution : rouge > vert');
  const fauna = layerColors('fauna', new Float32Array([0, 1]), base);
  const saturation = (c, i) => c[i * 3 + 1] - Math.max(c[i * 3], c[i * 3 + 2]);
  assert.ok(saturation(fauna, 1) > saturation(fauna, 0), 'faune riche : vert plus vif (plus saturé) que faune pauvre');
  assert.throws(() => layerColors('bidule', new Float32Array([0, 1]), base));
});
