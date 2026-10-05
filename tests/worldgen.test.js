import test from 'node:test';
import assert from 'node:assert/strict';
import { generateWorld, validateWorld, traceRiver, centerOf } from '../src/core/worldgen.js';
import { tileAt, edgesOfTile, edgeValue, neighbors4, DIRS4 } from '../src/core/grid.js';
import { networkConnected, trafficStats, countEdges } from '../src/core/roads.js';
import { isBuiltTile, YAW_BY_DIR } from '../src/data/tiles.js';
import { TERRAIN_IDS } from '../src/data/terrain.js';

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 42, 2026, 'défi', 'vallée'];

function snapshot(world) {
  return JSON.stringify({
    tiles: world.tiles,
    h: Array.from(world.edges.h),
    v: Array.from(world.edges.v),
    th: Array.from(world.traffic.h),
    tv: Array.from(world.traffic.v),
    wind: world.wind,
  });
}

function count(world, terrain) {
  return world.tiles.filter((t) => t.terrain === terrain).length;
}

test('worldgen : déterministe (même graine, même vallée ; graines différentes, vallées différentes)', () => {
  for (const seed of [1, 42, 'défi']) {
    const a = generateWorld({ seed, starterTown: true });
    const b = generateWorld({ seed, starterTown: true });
    assert.equal(snapshot(a), snapshot(b), `graine ${seed}`);
  }
  assert.notEqual(snapshot(generateWorld({ seed: 1 })), snapshot(generateWorld({ seed: 2 })));
  assert.notEqual(snapshot(generateWorld({ seed: 'a' })), snapshot(generateWorld({ seed: 'b' })));
});

test('worldgen : le monde respecte le contrat (dimensions, cases, tableaux typés, champs)', () => {
  const w = generateWorld({ seed: 3, cols: 12, rows: 16, starterTown: true });
  assert.equal(w.seed, 3);
  assert.equal(w.cols, 12);
  assert.equal(w.rows, 16);
  assert.equal(w.tiles.length, 192);
  assert.ok(w.edges.h instanceof Uint8Array && w.edges.h.length === 17 * 12);
  assert.ok(w.edges.v instanceof Uint8Array && w.edges.v.length === 16 * 13);
  assert.ok(w.traffic.h instanceof Float32Array && w.traffic.h.length === w.edges.h.length);
  assert.ok(w.traffic.v instanceof Float32Array && w.traffic.v.length === w.edges.v.length);
  assert.ok(['N', 'E', 'S', 'W'].includes(w.wind));
  for (const t of w.tiles) {
    assert.deepEqual(Object.keys(t).sort(), ['building', 'flow', 'native', 'terrain']);
    assert.ok(TERRAIN_IDS.includes(t.terrain), `terrain inconnu ${t.terrain}`);
    assert.ok(t.flow === null || ['N', 'S', 'E', 'W'].includes(t.flow));
    assert.equal(t.flow !== null, t.terrain === 'river', 'flow seulement sur la rivière');
    assert.equal(typeof t.native, 'boolean');
    if (t.building) {
      assert.deepEqual(Object.keys(t.building).sort(), ['level', 'type', 'variant', 'yaw']);
      assert.ok(Object.values(YAW_BY_DIR).includes(t.building.yaw));
      assert.equal(t.native, false, 'une case bâtie n’est plus native');
    } else {
      assert.equal(t.native, true, 'toute nature générée est native');
    }
  }
});

test('worldgen : validateWorld accepte toutes les graines, avec et sans ville de départ', () => {
  for (const seed of SEEDS) {
    for (const starterTown of [false, true]) {
      const v = validateWorld(generateWorld({ seed, starterTown }));
      assert.ok(v.ok, `graine ${seed}, ville ${starterTown} : ${v.problems.join(' ; ')}`);
    }
  }
});

test('worldgen : rivière continue d’un bord à l’autre, largeur 1, écoulement cohérent, aucune case isolée', () => {
  for (const seed of SEEDS) {
    const w = generateWorld({ seed });
    const path = traceRiver(w);
    assert.ok(path, `graine ${seed} : rivière discontinue`);
    assert.equal(path.length, count(w, 'river'));
    assert.ok(path.length >= Math.min(w.cols, w.rows), 'au moins aussi longue que le petit côté');
    const first = path[0];
    const last = path[path.length - 1];
    const vertical = (first.y === 0 && last.y === w.rows - 1) || (first.y === w.rows - 1 && last.y === 0);
    const horizontal = (first.x === 0 && last.x === w.cols - 1) || (first.x === w.cols - 1 && last.x === 0);
    assert.ok(vertical || horizontal, `graine ${seed} : source et embouchure sur deux bords opposés`);
    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      const t = tileAt(w, p.x, p.y);
      const d = DIRS4.find((e) => e.dir === t.flow);
      if (i + 1 < path.length) {
        assert.deepEqual({ x: p.x + d.dx, y: p.y + d.dy }, path[i + 1], 'flow mène à la case suivante');
        assert.equal(Math.abs(path[i + 1].x - p.x) + Math.abs(path[i + 1].y - p.y), 1, 'cases consécutives adjacentes par côté');
      } else {
        const out = { x: p.x + d.dx, y: p.y + d.dy };
        assert.ok(out.x < 0 || out.y < 0 || out.x >= w.cols || out.y >= w.rows, 'l’embouchure sort de la carte');
      }
      assert.ok(neighbors4(w, p.x, p.y).some((n) => tileAt(w, n.x, n.y).terrain === 'river'), 'aucune case de rivière isolée');
    }
    // Largeur 1 : jamais un bloc 2 × 2 de rivière.
    for (let y = 0; y + 1 < w.rows; y++) {
      for (let x = 0; x + 1 < w.cols; x++) {
        const block = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]].every(([bx, by]) => tileAt(w, bx, by).terrain === 'river');
        assert.ok(!block, `graine ${seed} : rivière large en (${x}, ${y})`);
      }
    }
  }
});

test('worldgen : la mairie est au centre, sur de l’herbe, loin de la rivière', () => {
  for (const seed of SEEDS) {
    const w = generateWorld({ seed });
    const c = centerOf(w);
    assert.deepEqual(c, { x: 6, y: 8 });
    const hall = tileAt(w, c.x, c.y);
    assert.deepEqual(hall.building, { type: 'townhall', level: 1, variant: 0, yaw: hall.building.yaw });
    assert.equal(hall.terrain, 'grass');
    assert.equal(hall.native, false);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        assert.notEqual(tileAt(w, c.x + dx, c.y + dy).terrain, 'river', `graine ${seed} : rivière contre la mairie`);
      }
    }
    // Sans ville : la mairie seule, entourée de ses quatre rues de ceinture, rien d'autre.
    const edges = edgesOfTile(w, c.x, c.y);
    assert.equal(Object.values(edges).filter(ref => edgeValue(w, ref) === 2).length, 1, 'une façade desservie');
    assert.equal(w.tiles.filter((t) => t.building).length, 1);
    assert.equal(countEdges(w).street, 1);
  }
});

test('worldgen : comptages plausibles (lacs, zones humides, forêts, collines, prairies, champs)', () => {
  for (const seed of SEEDS) {
    const w = generateWorld({ seed });
    const lake = count(w, 'lake');
    const forest = count(w, 'forest');
    const hill = count(w, 'hill');
    const wetland = count(w, 'wetland');
    const meadow = count(w, 'meadow');
    const field = count(w, 'field');
    const grass = count(w, 'grass');
    assert.ok(lake >= 3 && lake <= 12, `graine ${seed} : ${lake} cases de lac`);
    assert.ok(forest >= 8 && forest <= 36, `graine ${seed} : ${forest} cases de forêt`);
    assert.ok(hill >= 8 && hill <= 32, `graine ${seed} : ${hill} cases de colline`);
    assert.ok(wetland >= 2 && wetland <= 12, `graine ${seed} : ${wetland} zones humides`);
    assert.ok(meadow >= 3 && meadow <= 18, `graine ${seed} : ${meadow} cases de prairie`);
    assert.ok(field >= 2 && field <= 4, `graine ${seed} : ${field} champs`);
    assert.ok(grass >= 60, `graine ${seed} : il reste ${grass} cases d’herbe`);
    // Les lacs touchent la rivière ; chaque zone humide borde l'eau.
    assert.ok(w.tiles.some((t, i) => t.terrain === 'lake' && neighbors4(w, i % w.cols, Math.floor(i / w.cols)).some((n) => tileAt(w, n.x, n.y).terrain === 'river')), `graine ${seed} : lac loin de la rivière`);
    w.tiles.forEach((t, i) => {
      if (t.terrain !== 'wetland') return;
      const x = i % w.cols;
      const y = Math.floor(i / w.cols);
      assert.ok(neighbors4(w, x, y).some((n) => ['river', 'lake'].includes(tileAt(w, n.x, n.y).terrain)), `graine ${seed} : zone humide sans eau en (${x}, ${y})`);
    });
  }
});

test('worldgen : les collines occupent un seul bord', () => {
  for (const seed of SEEDS) {
    const w = generateWorld({ seed });
    const hills = [];
    w.tiles.forEach((t, i) => { if (t.terrain === 'hill') hills.push({ x: i % w.cols, y: Math.floor(i / w.cols) }); });
    const sides = {
      W: hills.every((h) => h.x <= 2), E: hills.every((h) => h.x >= w.cols - 3),
      N: hills.every((h) => h.y <= 2), S: hills.every((h) => h.y >= w.rows - 3),
    };
    assert.ok(Object.values(sides).some(Boolean), `graine ${seed} : collines dispersées`);
  }
});

test('worldgen : ville de départ (10 maisons, 2 commerces, 1 champ cultivé) sans toucher à la nature native', () => {
  for (const seed of SEEDS) {
    const bare = generateWorld({ seed });
    const w = generateWorld({ seed, starterTown: true });
    const c = centerOf(w);
    const types = {};
    w.tiles.forEach((t, i) => {
      if (!t.building) {
        assert.deepEqual(t, bare.tiles[i], `graine ${seed} : nature modifiée en ${i}`);
        return;
      }
      types[t.building.type] = (types[t.building.type] || 0) + 1;
      const x = i % w.cols;
      const y = Math.floor(i / w.cols);
      assert.equal(bare.tiles[i].terrain, 'grass', `graine ${seed} : bâti sur ${bare.tiles[i].terrain} en (${x}, ${y})`);
      assert.ok(Math.max(Math.abs(x - c.x), Math.abs(y - c.y)) <= 3, 'la ville reste groupée autour de la mairie');
      assert.equal(t.native, false);
      assert.equal(t.building.level, 1);
      if (t.building.type === 'field') assert.equal(t.terrain, 'field');
      else assert.equal(t.terrain, 'grass');
    });
    assert.deepEqual(types, { townhall: 1, house: 10, shop: 2, field: 1 }, `graine ${seed}`);
    assert.ok(networkConnected(w), `graine ${seed} : ville non reliée`);
    assert.ok(countEdges(w).street >= 6 && countEdges(w).street < 26, 'des dessertes partagées, sans quadriller chaque maison');
    assert.ok(trafficStats(w).total > 0, 'du trafic vers la mairie et les commerces');
  }
});

test('worldgen : chaque bâtiment regarde vers une rue (ou à défaut un chemin)', () => {
  for (const seed of [1, 2, 3, 42]) {
    const w = generateWorld({ seed, starterTown: true });
    for (let y = 0; y < w.rows; y++) {
      for (let x = 0; x < w.cols; x++) {
        const t = tileAt(w, x, y);
        if (!isBuiltTile(t)) continue;
        const e = edgesOfTile(w, x, y);
        const byDir = { S: e.s, E: e.e, N: e.n, W: e.w };
        const values = Object.fromEntries(Object.entries(byDir).map(([d, ref]) => [d, Math.min(2, edgeValue(w, ref))]));
        const facing = Object.keys(YAW_BY_DIR).find((d) => YAW_BY_DIR[d] === t.building.yaw);
        assert.equal(values[facing], Math.max(...Object.values(values)), `(${x}, ${y}) regarde ${facing} : ${JSON.stringify(values)}`);
      }
    }
  }
});

test('worldgen : grandes cartes et erreurs', () => {
  const big = generateWorld({ seed: 9, cols: 16, rows: 24, starterTown: true });
  assert.ok(validateWorld(big).ok);
  assert.deepEqual(centerOf(big), { x: 8, y: 12 });
  assert.ok(validateWorld(generateWorld({ seed: 9, cols: 8, rows: 8 })).ok, 'carte minimale');
  assert.throws(() => generateWorld({ seed: 1, map: 'coast' }), /Carte inconnue/);
  assert.throws(() => generateWorld({ seed: 1, cols: 4, rows: 16 }), /trop petite/);
  assert.ok(validateWorld(generateWorld()).ok, 'valeurs par défaut');
});
