// Tests des effets animés (src/render3d/effects.js) et de l'eau animée (src/render3d/ground.js) : parties
// pures (vent, émetteurs de fumée, cycle de vie d'une bouffée, direction du courant, masque des berges,
// ancrages des pales) et objets three.js construits sans WebGL (InstancedMesh, attributs d'instances).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { makeWorld, setTerrain, place, riverColumn } from './world-helpers.js';
import {
  windVector, hexToLinear, chimneyOffsets, collectSmokeEmitters, smokePuffAt,
  rotationAxisOf, rotorOf, collectBladeAnchors, bladeAngle, createEffects,
  SMOKE_LIFE, SMOKE_RISE, WIND_SPEED, SMOKE_SCALE, SMOKE_PUFFS, SMOKE_MAX, BLADE_RPS, BLADE_RPS_JITTER, CHIMNEYS,
} from '../src/render3d/effects.js';
import {
  flowVector, bankMask, bankVector, BANK_N, BANK_E, BANK_S, BANK_W, createGround,
  WATER_LEVEL, WETLAND_FILM_LEVEL, WATER_STYLES, createWaterMaterial,
} from '../src/render3d/ground.js';
import { BUILDING_SCALE } from '../src/render3d/buildings.js';
import { excludedNodeNames, createVertexColorMaterial } from '../src/render3d/models.js';
import { modelOfBuilding } from '../src/data/tiles.js';

/** Hauteurs des GLB normalisés (manifeste) pour un faux `models` sans chargement de fichiers. */
const HEIGHTS = { 'factory-a': 0.831, 'factory-b': 0.882, 'power-plant': 0.716, 'wind-turbine': 1.388, 'house-a': 0.545 };

/** Faux `loadModels` : boîtes de la bonne hauteur, pièces (`parts`) injectables par identifiant. */
function stubModels({ parts = {} } = {}) {
  const vertex = createVertexColorMaterial();
  const cache = new Map();
  const entry = (id) => {
    if (!cache.has(id)) {
      const h = HEIGHTS[id] || 0.8;
      const g = new THREE.BoxGeometry(0.8, h, 0.8);
      g.translate(0, h / 2, 0);
      g.computeBoundingBox();
      cache.set(id, { geometry: g, material: vertex, height: h, source: HEIGHTS[id] ? 'glb' : 'fallback' });
    }
    return cache.get(id);
  };
  return {
    materials: { vertex, textured: new Map() },
    resolve: entry,
    get: (id) => (HEIGHTS[id] ? entry(id) : null),
    has: (id) => Boolean(HEIGHTS[id]),
    getPart: (id, name) => (parts[id] && parts[id][name]) || null,
    partNames: (id) => Object.keys(parts[id] || {}),
  };
}

/** Pièce « blades » comme la produit models.js pour le GLB de l'éolienne : plan XY, mince en Z, pivot au moyeu. */
function bladesPart() {
  const g = new THREE.BoxGeometry(0.68, 0.6, 0.07);
  g.computeBoundingBox();
  return { name: 'blades', geometry: g, material: createVertexColorMaterial(), pivot: [0, 1.089, 0.133], height: 0.3 };
}

const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

// ---------------------------------------------------------------------------------------------
// Vent, courant, berges

test('windVector : le vent est nommé par son origine, la dérive va à l’opposé', () => {
  assert.deepEqual(windVector('W'), [1, 0], 'vent d’ouest → vers l’est (+X)');
  assert.deepEqual(windVector('E'), [-1, 0]);
  assert.deepEqual(windVector('N'), [0, 1], 'vent du nord → vers le sud (+Z)');
  assert.deepEqual(windVector('S'), [0, -1]);
  assert.deepEqual(windVector(null), [0, 0]);
  assert.deepEqual(windVector('bidule'), [0, 0]);
});

test('flowVector : N = −Z, E = +X, S = +Z, W = −X, lac = 0', () => {
  assert.deepEqual(flowVector('N'), [0, -1]);
  assert.deepEqual(flowVector('E'), [1, 0]);
  assert.deepEqual(flowVector('S'), [0, 1]);
  assert.deepEqual(flowVector('W'), [-1, 0]);
  assert.deepEqual(flowVector(null), [0, 0]);
  const v = flowVector('N'); v[1] = 9;
  assert.deepEqual(flowVector('N'), [0, -1], 'renvoie une copie');
});

test('bankMask : côtés bordés de terre, pas d’écume au bord du monde ni vers une autre eau', () => {
  const world = riverColumn(makeWorld(3, 3), 1);
  assert.equal(bankMask(world, 1, 1), BANK_E | BANK_W, 'rivière : herbe à l’est et à l’ouest');
  assert.equal(bankMask(world, 1, 0), BANK_E | BANK_W, 'bord nord de la carte : l’eau continue');
  setTerrain(world, 0, 1, 'lake');
  assert.equal(bankMask(world, 1, 1), BANK_E, 'un lac à l’ouest n’est pas une berge');
  assert.equal(bankMask(world, 0, 1), BANK_N | BANK_S, 'le lac : herbe au nord et au sud, rivière à l’est, bord à l’ouest');
  setTerrain(world, 2, 1, 'wetland');
  assert.equal(bankMask(world, 1, 1), BANK_E, 'la zone humide compte comme une berge');
  const lake = setTerrain(makeWorld(3, 3), 1, 1, 'lake');
  assert.equal(bankMask(lake, 1, 1), 15, 'lac d’une case : quatre berges');
  assert.deepEqual(bankVector(BANK_E | BANK_W), [0, 1, 0, 1]);
  assert.deepEqual(bankVector(15), [1, 1, 1, 1]);
  assert.deepEqual(bankVector(0), [0, 0, 0, 0]);
  assert.deepEqual([BANK_N, BANK_E, BANK_S, BANK_W], [1, 2, 4, 8]);
});

// ---------------------------------------------------------------------------------------------
// Fumée

test('chimneyOffsets : nœuds chimney* du manifeste, puis table des modèles connus, puis sommet de la boîte', () => {
  const g = new THREE.BoxGeometry(0.1, 0.3, 0.1); g.computeBoundingBox();
  const models = stubModels({ parts: { bakery: { 'chimney-a': { name: 'chimney-a', geometry: g, pivot: [0.1, 0.5, 0.2], height: 0.3 }, body: { name: 'body', geometry: g, pivot: [0, 0, 0], height: 0.3 } } } });
  assert.deepEqual(chimneyOffsets('bakery', models), [[0.1, 0.8, 0.2]], 'sommet de la pièce = pivot + hauteur ; « body » ignoré');
  assert.deepEqual(chimneyOffsets('factory-b', models), CHIMNEYS['factory-b'].map((c) => [...c]));
  assert.equal(chimneyOffsets('factory-a', models).length, 1);
  assert.equal(chimneyOffsets('power-plant', models).length, 2);
  assert.deepEqual(chimneyOffsets('house-a', models), [[0.22, HEIGHTS['house-a'], -0.22]], 'repli : sommet de la boîte, décalé');
  assert.deepEqual(chimneyOffsets('mystery', null), [[0.22, 0.9, -0.22]], 'sans modèles : hauteur par défaut');
  for (const list of Object.values(CHIMNEYS)) for (const c of list) assert.ok(c[1] > 0.5 && Math.abs(c[0]) < 0.5 && Math.abs(c[2]) < 0.5, 'cheminées dans la case, en hauteur');
});

test('collectSmokeEmitters : 1 à 2 cheminées par usine et centrale, au-dessus du sol, tournées avec le bâtiment', () => {
  const world = makeWorld(5, 5);
  place(world, 1, 1, 'factory');            // variant 0 → factory-a
  place(world, 3, 1, 'factory');
  world.tiles[1 * 5 + 3].building.variant = 1; // factory-b
  place(world, 1, 3, 'power-plant');
  place(world, 3, 3, 'house');
  place(world, 2, 2, 'townhall');
  const models = stubModels();
  const emitters = collectSmokeEmitters(world, models);
  const byTile = (x, y) => emitters.filter((e) => e.tile === y * 5 + x);
  assert.equal(byTile(1, 1).length, 1, 'factory-a : une cheminée');
  assert.equal(byTile(3, 1).length, 2, 'factory-b : deux cheminées');
  assert.equal(byTile(1, 3).length, 2, 'centrale : cheminée + tour');
  assert.equal(byTile(3, 3).length, 0, 'une maison ne fume pas');
  assert.equal(byTile(2, 2).length, 0, 'la mairie non plus');
  assert.equal(emitters.length, 5);
  for (const e of emitters) {
    const tx = e.tile % 5, ty = Math.floor(e.tile / 5);
    assert.ok(e.x > tx && e.x < tx + 1 && e.z > ty && e.z < ty + 1, `dans sa case (${e.x}, ${e.z})`);
    assert.ok(e.y > 0.45, `au-dessus du sol : ${e.y}`);
    assert.ok(e.seed >= 0 && e.seed < 1);
    assert.equal(typeof e.model, 'string');
  }
  assert.ok(near(byTile(1, 1)[0].y, BUILDING_SCALE * CHIMNEYS['factory-a'][0][1]), 'hauteur mise à l’échelle de pose');
  assert.deepEqual(collectSmokeEmitters(world, models), emitters, 'déterministe');
  // Sans `models` (fonction pure sur le monde seul) : mêmes cheminées connues.
  assert.equal(collectSmokeEmitters(world).length, 5);

  // Rotation : une usine tournée d'un quart de tour voit ses cheminées tourner autour du centre de la case.
  const a = byTile(3, 1).map((e) => [e.x - 3.5, e.z - 1.5]);
  world.tiles[1 * 5 + 3].building.yaw = 90;
  const b = collectSmokeEmitters(world, models).filter((e) => e.tile === 1 * 5 + 3).map((e) => [e.x - 3.5, e.z - 1.5]);
  // composeMatrix (rotation Y de π/2) : x' = z, z' = −x
  for (let i = 0; i < 2; i++) {
    assert.ok(near(b[i][0], a[i][1], 1e-9) && near(b[i][1], -a[i][0], 1e-9), `cheminée ${i} tournée : ${a[i]} → ${b[i]}`);
  }

  // Un modèle inconnu du catalogue mais doté de nœuds chimney* fume aussi.
  const g = new THREE.BoxGeometry(0.1, 0.2, 0.1); g.computeBoundingBox();
  const withNodes = stubModels({ parts: { bakery: { 'chimney-1': { name: 'chimney-1', geometry: g, pivot: [0, 0.6, 0], height: 0.2 } } } });
  const world2 = place(makeWorld(3, 3), 1, 1, 'mystery');
  const e2 = collectSmokeEmitters(world2, withNodes, { modelFor: (bld) => (bld.type === 'mystery' ? 'bakery' : modelOfBuilding(bld)) });
  assert.equal(e2.length, 1);
  assert.ok(near(e2[0].y, BUILDING_SCALE * 0.8), 'sommet du nœud cheminée');
});

test('smokePuffAt : naît à la cheminée, monte, dérive avec le vent, grossit puis disparaît, gris → crème', () => {
  const emitter = { x: 2, y: 0.7, z: 3, seed: 0.37 };
  const opts = { wind: windVector('W'), level: 1, puffs: SMOKE_PUFFS };
  const samples = [];
  for (let i = 0; i < 600; i++) {
    const t = (i / 600) * SMOKE_LIFE;
    const p = smokePuffAt(t, emitter, 0, opts);
    samples.push({ t, ...p, color: [...p.color] });
  }
  for (const s of samples) {
    assert.ok(s.u >= 0 && s.u < 1);
    const age = s.u * SMOKE_LIFE;
    assert.ok(near(s.y, emitter.y + SMOKE_RISE * age, 1e-9), 'monte à 0,25 u/s');
    assert.ok(Math.abs(s.x - emitter.x - WIND_SPEED * age) <= 0.036, 'dérive vers l’est à 0,1 u/s (± ondulation)');
    assert.ok(Math.abs(s.z - emitter.z) <= 0.036, 'pas de dérive nord-sud sous un vent d’ouest');
    assert.ok(s.scale >= 0 && s.scale <= SMOKE_SCALE[1] * 1.1 + 1e-9);
  }
  const young = samples.reduce((a, b) => (a.u < b.u ? a : b));
  const old = samples.reduce((a, b) => (a.u > b.u ? a : b));
  const biggest = samples.reduce((a, b) => (a.scale > b.scale ? a : b));
  assert.ok(young.scale < SMOKE_SCALE[0] * 1.15 && young.scale > SMOKE_SCALE[0] * 0.85, `petite à la naissance : ${young.scale}`);
  assert.ok(biggest.scale > SMOKE_SCALE[1] * 0.85, `grosse à mi-vie : ${biggest.scale}`);
  assert.ok(near(biggest.u, 0.6, 0.02), 'au plus gros à 60 % de la vie');
  assert.ok(old.scale < 0.012, `disparaît en fin de vie : ${old.scale}`);
  assert.ok(Math.hypot(young.x - emitter.x, young.z - emitter.z) < 0.02 && near(young.y, emitter.y, 0.01), 'naît à la cheminée');
  assert.ok(old.color[0] > young.color[0] && old.color[2] > young.color[2], 'gris clair → crème (plus clair)');
  const from = hexToLinear('#b8bcc4'), to = hexToLinear('#f4efe6');
  assert.ok(Math.abs(young.color[0] - from[0]) < 0.01 && Math.abs(old.color[0] - to[0]) < 0.01);
  // Déterminisme, bouffées réparties sur le cycle, `out` réutilisé sans allocation.
  const out = { color: [0, 0, 0] };
  assert.equal(smokePuffAt(1.25, emitter, 3, opts, out), out);
  const again = smokePuffAt(1.25, emitter, 3, opts);
  assert.deepEqual({ x: out.x, y: out.y, z: out.z, scale: out.scale }, { x: again.x, y: again.y, z: again.z, scale: again.scale });
  const us = Array.from({ length: SMOKE_PUFFS }, (_, k) => smokePuffAt(0, emitter, k, opts).u).sort((a, b) => a - b);
  for (let k = 1; k < us.length; k++) assert.ok(us[k] - us[k - 1] > 0.04, 'les bouffées d’un émetteur ne se chevauchent pas dans le cycle');
  // Vent du nord : dérive vers le sud (+Z) ; intensité réduite : plus petite et plus basse.
  const south = smokePuffAt(1, emitter, 0, { wind: windVector('N') });
  assert.ok(south.z > emitter.z + 0.03 || Math.abs(south.x - emitter.x) < 0.04);
  const weak = smokePuffAt(1.3, emitter, 0, { ...opts, level: 0.2 });
  const strong = smokePuffAt(1.3, emitter, 0, opts);
  assert.ok(weak.scale < strong.scale && weak.y <= strong.y);
});

// ---------------------------------------------------------------------------------------------
// Pales

test('rotationAxisOf / rotorOf : pièce « blades » (pivot au moyeu, axe Z) ou rotor de repli au sommet du mât', () => {
  const b = new THREE.Box3(new THREE.Vector3(-0.34, -0.3, -0.035), new THREE.Vector3(0.34, 0.3, 0.035));
  assert.equal(rotationAxisOf(b), 'z');
  assert.equal(rotationAxisOf(new THREE.Box3(new THREE.Vector3(-0.01, -1, -1), new THREE.Vector3(0.01, 1, 1))), 'x');
  assert.equal(rotationAxisOf(new THREE.Box3(new THREE.Vector3(-1, -0.01, -1), new THREE.Vector3(1, 0.01, 1))), 'y');
  const withPart = stubModels({ parts: { 'wind-turbine': { blades: bladesPart() } } });
  const r = rotorOf('wind-turbine', withPart);
  assert.deepEqual(r.pivot, [0, 1.089, 0.133]);
  assert.equal(r.axis, 'z');
  assert.ok(near(r.radius, 0.34, 1e-6));
  assert.equal(r.source, 'part');
  const noPart = rotorOf('wind-turbine', stubModels());
  assert.equal(noPart.source, 'fallback');
  assert.ok(noPart.pivot[1] > 1.0 && noPart.pivot[1] < HEIGHTS['wind-turbine'], 'moyeu en haut du mât');
  assert.ok(noPart.radius > 0.25 && noPart.radius < 0.4);
  const fallbackBox = rotorOf('wind-turbine-x', stubModels());
  assert.equal(fallbackBox.source, 'fallback');
  assert.ok(fallbackBox.pivot[1] > 0.5);
});

test('collectBladeAnchors : une ancre par éolienne, vitesse ≈ 1,2 tr/s légèrement variable, sens commun', () => {
  const world = makeWorld(4, 4);
  place(world, 0, 0, 'wind-turbine');
  place(world, 3, 2, 'wind-turbine');
  place(world, 1, 1, 'house');
  world.tiles[2 * 4 + 3].building.yaw = 180;
  const models = stubModels({ parts: { 'wind-turbine': { blades: bladesPart() } } });
  const anchors = collectBladeAnchors(world, models);
  assert.equal(anchors.length, 2);
  for (const a of anchors) {
    assert.equal(a.model, 'wind-turbine');
    assert.deepEqual(a.pivot, [0, 1.089, 0.133]);
    assert.equal(a.axis, 'z');
    assert.equal(a.scale, BUILDING_SCALE);
    assert.ok(Math.abs(a.speed - BLADE_RPS) <= BLADE_RPS * BLADE_RPS_JITTER + 1e-9);
    assert.ok(a.phase >= 0 && a.phase < Math.PI * 2);
    assert.ok(bladeAngle(a, 1) < bladeAngle(a, 0), 'sens horaire vu de face : l’angle décroît');
    assert.ok(near(bladeAngle(a, 1) - bladeAngle(a, 0), -Math.PI * 2 * a.speed, 1e-9));
  }
  assert.notEqual(anchors[0].speed, anchors[1].speed, 'légère variation entre éoliennes');
  assert.ok(near(anchors[1].yaw, Math.PI, 1e-9));
  assert.deepEqual(collectBladeAnchors(world, models), anchors, 'déterministe');
  assert.equal(collectBladeAnchors(world, stubModels())[0].source, 'fallback', 'sans pièce : rotor de repli');
});

// ---------------------------------------------------------------------------------------------
// Rendu (objets three.js sans WebGL)

test('createEffects : une InstancedMesh de fumée (≤ 160), une de pales, intensité réglable, sans allocation visible', () => {
  const world = makeWorld(6, 6);
  world.wind = 'W';
  place(world, 1, 1, 'factory');
  place(world, 3, 1, 'factory'); world.tiles[1 * 6 + 3].building.variant = 1;
  place(world, 1, 3, 'power-plant');
  place(world, 4, 4, 'wind-turbine');
  place(world, 0, 5, 'wind-turbine');
  const models = stubModels({ parts: { 'wind-turbine': { blades: bladesPart() } } });
  const fx = createEffects(models, { palette: undefined, shadows: true });
  assert.equal(fx.group.name, 'effects');
  fx.setWorld(world);
  let s = fx.stats();
  assert.deepEqual({ emitters: s.emitters, smoke: s.smoke, blades: s.blades, calls: s.calls, shadowCalls: s.shadowCalls }, { emitters: 5, smoke: 40, blades: 2, calls: 2, shadowCalls: 1 });
  const smoke = fx.group.getObjectByName('smoke');
  const blades = fx.group.getObjectByName('blades:wind-turbine');
  assert.ok(smoke.isInstancedMesh && blades.isInstancedMesh);
  assert.equal(smoke.castShadow, false);
  assert.equal(blades.castShadow, true);
  assert.equal(smoke.instanceMatrix.count, SMOKE_MAX);
  assert.equal(blades.geometry, models.getPart('wind-turbine', 'blades').geometry, 'la géométrie de la pièce est partagée, pas copiée');

  fx.update(0, 0.5);
  assert.equal(smoke.count, 40);
  const m = new THREE.Matrix4(); const pos = new THREE.Vector3(); const q = new THREE.Quaternion(); const sc = new THREE.Vector3();
  for (let i = 0; i < smoke.count; i++) {
    smoke.getMatrixAt(i, m); m.decompose(pos, q, sc);
    const d = Math.min(...fx.emitters.map((e) => Math.hypot(pos.x - e.x, pos.z - e.z)));
    assert.ok(d < 0.4, `bouffée ${i} près d’une cheminée (${d})`);
    assert.ok(fx.emitters.some((e) => pos.y >= e.y - 1e-6 && pos.y <= e.y + SMOKE_RISE * SMOKE_LIFE + 1e-6), 'entre la cheminée et le sommet du panache');
    assert.ok(sc.x > 0 && sc.x <= SMOKE_SCALE[1] * 1.1 + 1e-9);
  }
  // Pales : au moyeu de l'éolienne (pivot tourné et mis à l'échelle), rotation d'axe Z qui change avec le temps.
  blades.getMatrixAt(0, m); m.decompose(pos, q, sc);
  const a0 = fx.group.children.length && collectBladeAnchors(world, models)[0];
  const c = Math.cos(a0.yaw), sn = Math.sin(a0.yaw);
  assert.ok(near(pos.x, a0.x + a0.scale * (c * a0.pivot[0] + sn * a0.pivot[2]), 1e-6));
  assert.ok(near(pos.y, a0.y + a0.scale * a0.pivot[1], 1e-6));
  assert.ok(near(pos.z, a0.z + a0.scale * (-sn * a0.pivot[0] + c * a0.pivot[2]), 1e-6));
  assert.ok(near(sc.x, BUILDING_SCALE, 1e-6));
  const before = m.clone();
  fx.update(1 / 60);
  assert.ok(near(fx.time, 0.5 + 1 / 60, 1e-9), 'dt s’accumule quand `time` n’est pas donné');
  blades.getMatrixAt(0, m);
  assert.ok(!before.equals(m), 'les pales ont tourné');
  const smokeBefore = smoke.instanceMatrix.array.slice(0, 16);
  fx.update(0.1);
  assert.notDeepEqual(Array.from(smoke.instanceMatrix.array.slice(0, 16)), Array.from(smokeBefore), 'la fumée a bougé');

  fx.setSmokeLevel(0);
  s = fx.stats();
  assert.equal(s.smoke, 0); assert.equal(s.calls, 1); assert.equal(smoke.visible, false);
  fx.setSmokeLevel(0.5);
  fx.update(0.016);
  assert.equal(fx.stats().smoke, 20, '4 bouffées par émetteur à mi-intensité');
  assert.equal(smoke.count, 20);
  fx.setSmokeLevel(1);
  assert.equal(fx.stats().smoke, 40);

  // Monde vide : rien à dessiner, pas d'erreur.
  fx.setWorld(makeWorld(3, 3));
  assert.deepEqual(fx.stats(), { smoke: 0, emitters: 0, blades: 0, calls: 0, shadowCalls: 0 });
  fx.dispose();
  assert.equal(fx.group.children.length, 0);
});

test('createEffects : plafond de 160 bouffées, réparti entre les émetteurs', () => {
  const world = makeWorld(8, 8);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2 === 0) place(world, x, y, 'power-plant'); // 32 centrales × 2 = 64 émetteurs
  const fx = createEffects(stubModels());
  fx.setWorld(world);
  const s = fx.stats();
  assert.equal(s.emitters, 64);
  assert.ok(s.smoke <= SMOKE_MAX && s.smoke >= SMOKE_MAX * 0.75, `${s.smoke} bouffées`);
  assert.equal(s.smoke, 64 * 2, '2 bouffées par émetteur (160 / 64)');
  fx.update(0, 1);
  assert.equal(fx.group.getObjectByName('smoke').count, 128);
  fx.dispose();
});

// ---------------------------------------------------------------------------------------------
// Eau animée (ground.js)

test('createGround : eau profonde et pellicule des zones humides, attributs aFlow / aBanks / aStyle, horloge', () => {
  const world = riverColumn(makeWorld(4, 4), 1);
  setTerrain(world, 2, 1, 'lake');
  setTerrain(world, 3, 1, 'wetland');
  setTerrain(world, 0, 3, 'wetland');
  const ground = createGround();
  ground.setWorld(world);
  assert.deepEqual({ tiles: ground.stats.tiles, water: ground.stats.water, wetland: ground.stats.wetland, land: ground.stats.land }, { tiles: 16, water: 5, wetland: 2, land: 11 });
  const water = ground.group.getObjectByName('water');
  const film = ground.group.getObjectByName('wetland-film');
  assert.ok(water.isInstancedMesh && film.isInstancedMesh);
  assert.equal(water.material, film.material, 'un seul matériau d’eau (un programme)');
  assert.equal(water.count, 5); assert.equal(film.count, 2);
  assert.equal(water.castShadow, false); assert.equal(water.receiveShadow, true);
  const a = water.geometry.attributes;
  assert.ok(a.aFlow.isInstancedBufferAttribute && a.aBanks.isInstancedBufferAttribute && a.aStyle.isInstancedBufferAttribute);
  // Instances d'eau dans l'ordre de lecture : (1,0), (1,1), (2,1), (1,2), (1,3)
  const m = new THREE.Matrix4(); const pos = new THREE.Vector3();
  water.getMatrixAt(0, m); pos.setFromMatrixPosition(m);
  assert.ok(near(pos.x, 1.5) && near(pos.y, WATER_LEVEL) && near(pos.z, 0.5), `plan d’eau en (1,0) à y = ${WATER_LEVEL} : ${pos.toArray()}`);
  assert.deepEqual(Array.from(a.aFlow.array.slice(0, 2)), [0, 1], 'rivière vers le sud : +Z');
  assert.ok(near(a.aStyle.array[0], WATER_STYLES.river[0]) && a.aStyle.array[1] === WATER_STYLES.river[1], 'style rivière');
  assert.deepEqual(Array.from(a.aBanks.array.slice(0, 4)), [0, 1, 0, 1], '(1,0) : herbe à l’est et à l’ouest, bord au nord, rivière au sud');
  assert.deepEqual(Array.from(a.aBanks.array.slice(4, 8)), [0, 0, 0, 1], '(1,1) : lac à l’est, herbe à l’ouest');
  assert.deepEqual(Array.from(a.aFlow.array.slice(2, 4)), [0, 1]);
  assert.deepEqual(Array.from(a.aFlow.array.slice(4, 6)), [0, 0], 'lac : pas de courant');
  assert.ok(near(a.aStyle.array[4], WATER_STYLES.lake[0]) && a.aStyle.array[5] === WATER_STYLES.lake[1], 'style lac');
  assert.deepEqual(Array.from(a.aBanks.array.slice(8, 12)), [1, 1, 1, 0], 'lac (2,1) : zone humide à l’est = berge, rivière à l’ouest');
  // Pellicule : posée sur la terre, sans courant ni écume, ondulation très faible.
  film.getMatrixAt(0, m); pos.setFromMatrixPosition(m);
  assert.ok(near(pos.x, 3.5) && near(pos.y, WETLAND_FILM_LEVEL) && near(pos.z, 1.5), `pellicule en (3,1) à y = ${WETLAND_FILM_LEVEL} : ${pos.toArray()}`);
  assert.ok(WETLAND_FILM_LEVEL > 0 && WETLAND_FILM_LEVEL < 0.012, 'au-dessus de la terre, sous les trottoirs');
  const f = film.geometry.attributes;
  assert.deepEqual(Array.from(f.aFlow.array.slice(0, 2)), [0, 0]);
  assert.deepEqual(Array.from(f.aBanks.array.slice(0, 4)), [0, 0, 0, 0]);
  assert.ok(near(f.aStyle.array[0], WATER_STYLES.wetland[0]) && f.aStyle.array[1] === WATER_STYLES.wetland[1], 'style zone humide');
  assert.ok(WATER_STYLES.wetland[0] < WETLAND_FILM_LEVEL, 'l’ondulation ne traverse pas la terre');
  // Couleurs : la pellicule prend la couleur de la case tirée vers l'eau courante ; les calques la suivent.
  const c = new THREE.Color();
  film.getColorAt(0, c);
  const wet = new THREE.Color('#7fb89a'), river = new THREE.Color('#5fb3d9');
  assert.ok(near(c.r, (wet.r + river.r) / 2, 1e-3) && near(c.b, (wet.b + river.b) / 2, 1e-3));
  const rgb = new Float32Array(16 * 3).fill(0.5);
  ground.setTileColors(rgb);
  film.getColorAt(0, c);
  assert.ok(near(c.r, (0.5 + river.r) / 2, 1e-3), 'calque appliqué à la pellicule');
  water.getColorAt(0, c);
  assert.ok(near(c.r, 0.5, 1e-6));
  ground.setTileColors(null);
  water.getColorAt(0, c);
  assert.ok(near(c.r, river.r, 1e-3), 'retour aux couleurs de terrain');
  assert.equal(ground.baseColors().length, 48);
  // Horloge du shader.
  assert.equal(ground.time, 0);
  ground.update(0.5); ground.update(-1); ground.update(NaN);
  assert.ok(near(ground.time, 0.5));
  ground.setTime(2);
  assert.equal(ground.time, 2);
  // Nouveau monde : les géométries d'instances sont remplacées sans erreur.
  ground.setWorld(makeWorld(2, 2));
  assert.equal(ground.stats.water, 0);
  assert.equal(ground.group.getObjectByName('water').visible, false, 'rien à dessiner sans eau');
  ground.dispose();
});

test('createWaterMaterial : Lambert modifié, uniform uTime partagé, bandes dans le sens du courant', () => {
  const { material, uniforms } = createWaterMaterial();
  assert.ok(material.isMeshLambertMaterial);
  assert.equal(typeof material.onBeforeCompile, 'function');
  assert.match(material.customProgramCacheKey(), /^tiletown-water-\d+$/);
  const shader = {
    uniforms: {},
    vertexShader: 'void main() {\n#include <begin_vertex>\n#include <project_vertex>\n}',
    fragmentShader: 'void main() {\n#include <color_fragment>\n}',
  };
  material.onBeforeCompile(shader, null);
  assert.equal(shader.uniforms.uTime, uniforms.uTime, 'le même objet : avancer l’horloge suffit');
  assert.match(shader.vertexShader, /attribute vec2 aFlow;/);
  assert.match(shader.vertexShader, /attribute vec4 aBanks;/);
  assert.match(shader.vertexShader, /attribute vec2 aStyle;/);
  assert.match(shader.vertexShader, /transformed\.y \+= aStyle\.x/);
  assert.ok(!shader.vertexShader.includes('#include <begin_vertex>'), 'begin_vertex remplacé');
  assert.match(shader.fragmentShader, /#include <color_fragment>/, 'la couleur d’instance est appliquée avant');
  assert.match(shader.fragmentShader, /along - uTime \* 0\.250/, 'les bandes avancent de 0,25 u/s le long du courant');
  assert.match(shader.fragmentShader, /vBanks\.[xyzw]/);
  uniforms.uTime.value = 3;
  assert.equal(shader.uniforms.uTime.value, 3);
});

// ---------------------------------------------------------------------------------------------
// Manifeste : nœuds exclus de la fusion

test('excludedNodeNames : `exclude` d’abord, sinon `nodes`, toujours des chaînes', () => {
  assert.deepEqual(excludedNodeNames({ nodes: ['blades'] }), ['blades']);
  assert.deepEqual(excludedNodeNames({ exclude: ['a', ''], nodes: ['b'] }), ['a']);
  assert.deepEqual(excludedNodeNames({ exclude: [1, 'x'] }), ['x']);
  assert.deepEqual(excludedNodeNames({}), []);
  assert.deepEqual(excludedNodeNames(null), []);
});
