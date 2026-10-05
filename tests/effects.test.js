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
  hazeDensity, collectHaze,
  SMOKE_LIFE, SMOKE_RISE, WIND_SPEED, SMOKE_SCALE, SMOKE_PUFFS, SMOKE_MAX, BLADE_RPS, BLADE_RPS_JITTER, CHIMNEYS,
  HAZE_THRESHOLD, HAZE_HEIGHT, HAZE_SIZE, HAZE_MAX, HAZE_MIN_DENSITY,
} from '../src/render3d/effects.js';
import {
  flowVector, createGround, shoreDistance, isWaterAt,
  WATER_LEVEL, WETLAND_FILM_LEVEL, WATER_STYLES, createWaterMaterial, createLandMaterial,
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

test('shoreDistance / isWaterAt : la ligne d’eau est le niveau 0,5 du champ, pas le bord des cases', () => {
  const world = riverColumn(makeWorld(5, 5), 2);
  // Au centre d’une case d’eau, l’eau est profonde ; au centre d’une case de terre, on est au sec —
  // exactement, quelle que soit la graine : c’est ce qui garantit une rivière continue et sans flaque.
  assert.ok(isWaterAt(world, 2.5, 2.5) && shoreDistance(world, 2.5, 2.5) > 0.25, 'cœur de la rivière');
  assert.ok(!isWaterAt(world, 0.5, 2.5) && shoreDistance(world, 0.5, 2.5) < -0.25, 'pleine terre');
  assert.ok(!isWaterAt(world, 4.5, 4.5), 'loin de la rivière');
  // La distance au rivage décroît continûment quand on traverse la berge.
  let prev = shoreDistance(world, 1.0, 2.5);
  for (let x = 1.025; x <= 4; x += 0.025) {
    const d = shoreDistance(world, x, 2.5);
    assert.ok(Math.abs(d - prev) < 0.08, `distance au rivage continue en x = ${x.toFixed(3)}`);
    prev = d;
  }
  // La rivière reste continue d’un bout à l’autre : le champ vaut 1 tout le long des centres d’eau.
  for (let z = 0; z <= 5; z += 0.05) assert.ok(isWaterAt(world, 2.5, z), `rivière interrompue en z = ${z.toFixed(2)}`);
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
    assert.ok(e.y > BUILDING_SCALE * 0.6, `au-dessus du sol : ${e.y}`);
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
  assert.deepEqual(fx.stats(), { smoke: 0, emitters: 0, blades: 0, haze: 0, calls: 0, shadowCalls: 0 });
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

test('createGround : nappes d’eau SOUDÉES et sinueuses, attributs par sommet, horloge', () => {
  const world = riverColumn(makeWorld(4, 4), 1);
  setTerrain(world, 2, 1, 'lake');
  setTerrain(world, 3, 1, 'wetland');
  setTerrain(world, 0, 3, 'wetland');
  const ground = createGround();
  ground.setWorld(world);
  assert.deepEqual({ tiles: ground.stats.tiles, water: ground.stats.water, wetland: ground.stats.wetland, land: ground.stats.land }, { tiles: 16, water: 5, wetland: 2, land: 11 });
  const water = ground.group.getObjectByName('water');
  const film = ground.group.getObjectByName('wetland-film');
  // UN SEUL MAILLAGE par nappe, plus un plan par case : c’est lui qui porte le contour sinueux.
  assert.ok(water.isMesh && !water.isInstancedMesh, 'la rivière est un maillage unique');
  assert.ok(film.isMesh && !film.isInstancedMesh, 'les zones humides aussi');
  assert.equal(water.material.customProgramCacheKey(), film.material.customProgramCacheKey(), 'un seul programme d’eau');
  assert.equal(water.material.transparent, false, 'l’eau profonde est opaque');
  assert.equal(film.material.transparent, true, 'la pellicule des zones humides se fond dans la terre');
  assert.equal(water.castShadow, false); assert.equal(water.receiveShadow, true);
  const a = water.geometry.attributes;
  for (const name of ['position', 'normal', 'color', 'aFlow', 'aStyle', 'aShore', 'aLayer', 'aQuality']) {
    assert.ok(a[name] && !a[name].isInstancedBufferAttribute, `attribut par sommet ${name}`);
  }
  assert.ok(a.position.count > 50, `nappe subdivisée : ${a.position.count} sommets`);
  assert.ok(ground.stats.waterTriangles > 0 && ground.stats.drawables === 3, 'terre + rivière + zones humides');

  // Sommets SOUDÉS : jamais deux fois la même position (aucune fente possible dans la nappe).
  const seen = new Set();
  for (let v = 0; v < a.position.count; v++) {
    const key = `${a.position.getX(v).toFixed(5)},${a.position.getZ(v).toFixed(5)}`;
    assert.ok(!seen.has(key), `sommet en double en ${key}`);
    seen.add(key);
  }
  // La nappe est à la ligne d’eau, et son bord se glisse SOUS la berge (distance au rivage < 0).
  let minShore = Infinity, maxShore = -Infinity, offGrid = 0;
  for (let v = 0; v < a.position.count; v++) {
    assert.ok(near(a.position.getY(v), WATER_LEVEL), 'la nappe est au niveau de l’eau');
    minShore = Math.min(minShore, a.aShore.getX(v));
    maxShore = Math.max(maxShore, a.aShore.getX(v));
    const x = a.position.getX(v), z = a.position.getZ(v);
    // Un sommet de contour ne tombe sur aucune des deux lignes de la grille : le bord ne suit plus les cases.
    if (Math.abs(x - Math.round(x)) > 1e-4 && Math.abs(z - Math.round(z)) > 1e-4) offGrid++;
  }
  assert.ok(minShore < 0, 'le bord de la nappe passe sous la berge');
  assert.ok(maxShore > 0.45, 'et le cœur de l’eau est à une demi-case du rivage');
  assert.ok(offGrid > 0, 'des sommets hors des lignes de la grille : le contour ne suit plus les cases');
  // Courant : vers le sud (+Z) au cœur de la rivière, nul au cœur du lac dormant.
  const attrAt = (mesh, name, x, z) => {
    const p = mesh.geometry.attributes.position, at = mesh.geometry.attributes[name];
    let best = -1, bestD = Infinity;
    for (let v = 0; v < p.count; v++) {
      const d = Math.hypot(p.getX(v) - x, p.getZ(v) - z);
      if (d < bestD) { bestD = d; best = v; }
    }
    return at.itemSize === 1 ? at.getX(best) : [at.getX(best), at.getY(best)];
  };
  const flowMid = attrAt(water, 'aFlow', 1.5, 3.5);
  assert.ok(flowMid[1] > 0.8 && Math.abs(flowMid[0]) < 0.3, `rivière vers le sud : ${flowMid}`);
  const styleRiver = attrAt(water, 'aStyle', 1.5, 3.5);
  assert.ok(near(styleRiver[0], WATER_STYLES.river[0], 1e-3) && styleRiver[1] > 0.9, 'style rivière');
  const styleLake = attrAt(water, 'aStyle', 2.5, 1.5);
  assert.ok(styleLake[1] < 0.3, 'lac : pas de bandes de courant');
  // Pellicule : posée JUSTE au-dessus du sol creusé, donc en creux dans la prairie, sans courant.
  const fp = film.geometry.attributes.position;
  let lowest = Infinity, highest = -Infinity;
  for (let v = 0; v < fp.count; v++) { lowest = Math.min(lowest, fp.getY(v)); highest = Math.max(highest, fp.getY(v)); }
  assert.ok(highest < WETLAND_FILM_LEVEL + 1e-6, 'jamais au-dessus de la plaine');
  assert.ok(lowest < 0, 'la nappe humide est légèrement ENFONCÉE dans le sol');
  assert.ok(WETLAND_FILM_LEVEL > 0 && WETLAND_FILM_LEVEL < 0.012, 'au-dessus de la terre, sous les trottoirs');
  assert.ok(near(attrAt(film, 'aStyle', 3.5, 1.5)[0], WATER_STYLES.wetland[0], 1e-4), 'style zone humide');
  assert.ok(WATER_STYLES.wetland[0] < WETLAND_FILM_LEVEL, 'l’ondulation ne traverse pas la terre');

  // Couleurs : par sommet ; la pellicule prend la couleur de la case tirée vers l’eau courante.
  const river = new THREE.Color('#5fb3d9'), wet = new THREE.Color('#7fb89a');
  const filmColor = attrAt(film, 'color', 3.5, 1.5);
  const filmR = film.geometry.attributes.color.getX(0);
  assert.ok(filmR >= 0 && filmR <= 1, 'couleurs de sommet présentes');
  const heart = (() => {
    const p = film.geometry.attributes.position, c = film.geometry.attributes.color;
    let best = 0, bestD = Infinity;
    for (let v = 0; v < p.count; v++) {
      const d = Math.hypot(p.getX(v) - 3.5, p.getZ(v) - 1.5);
      if (d < bestD) { bestD = d; best = v; }
    }
    return new THREE.Color(c.getX(best), c.getY(best), c.getZ(best));
  })();
  assert.ok(near(heart.r, (wet.r + river.r) / 2, 0.05) && near(heart.b, (wet.b + river.b) / 2, 0.05), `pellicule teintée : ${heart.getHexString()}`);
  const waterHeart = (() => {
    const p = water.geometry.attributes.position, c = water.geometry.attributes.color;
    let best = 0, bestD = Infinity;
    for (let v = 0; v < p.count; v++) {
      const d = Math.hypot(p.getX(v) - 1.5, p.getZ(v) - 3.5);
      if (d < bestD) { bestD = d; best = v; }
    }
    return new THREE.Color(c.getX(best), c.getY(best), c.getZ(best));
  })();
  assert.ok(near(waterHeart.r, river.r, 0.02) && near(waterHeart.b, river.b, 0.02), 'la rivière garde sa teinte jusqu’au cœur');
  assert.ok(Number.isFinite(filmColor[0]));
  // Calque : la couleur du calque atteint l’eau (elle n’est pas noyée par la terre voisine).
  const rgb = new Float32Array(16 * 3).fill(0.5);
  ground.setTileColors(rgb);
  const painted = (() => {
    const p = water.geometry.attributes.position, c = water.geometry.attributes.color;
    let best = 0, bestD = Infinity;
    for (let v = 0; v < p.count; v++) {
      const d = Math.hypot(p.getX(v) - 1.5, p.getZ(v) - 3.5);
      if (d < bestD) { bestD = d; best = v; }
    }
    return c.getX(best);
  })();
  assert.ok(near(painted, 0.5, 1e-3), 'calque appliqué à la nappe');
  ground.setTileColors(null);
  assert.equal(ground.baseColors().length, 48);
  // Horloge du shader.
  assert.equal(ground.time, 0);
  ground.update(0.5); ground.update(-1); ground.update(NaN);
  assert.ok(near(ground.time, 0.5));
  ground.setTime(2);
  assert.equal(ground.time, 2);
  // Nouveau monde : les géométries sont remplacées sans erreur.
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
  assert.match(shader.vertexShader, /attribute float aShore;/);
  assert.match(shader.vertexShader, /attribute vec2 aStyle;/);
  assert.match(shader.vertexShader, /transformed\.y \+= aStyle\.x/);
  assert.ok(!shader.vertexShader.includes('#include <begin_vertex>'), 'begin_vertex remplacé');
  assert.match(shader.fragmentShader, /#include <color_fragment>/, 'la couleur d’instance est appliquée avant');
  assert.match(shader.fragmentShader, /along - uTime \* 0\.250/, 'les bandes avancent de 0,25 u/s le long du courant');
  assert.match(shader.fragmentShader, /vShore/, 'écume et haut-fond lisent la distance au rivage');
  assert.ok(!shader.fragmentShader.includes('vBanks'), 'plus de masque de berges par côté de case');
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

// ---------------------------------------------------------------------------------------------
// Brume d'air vicié et champs d'écologie du sol (docs/ARCHITECTURE.md §10.3)

test('effects : hazeDensity — rien jusqu’à 50, puis croissance jusqu’à 1 à 100', () => {
  assert.equal(HAZE_THRESHOLD, 50);
  assert.equal(hazeDensity(0), 0);
  assert.equal(hazeDensity(50), 0);
  assert.equal(hazeDensity(75), 0.5);
  assert.equal(hazeDensity(100), 1);
  assert.equal(hazeDensity(400), 1, 'hors échelle : borné');
  assert.equal(hazeDensity(-20), 0);
  assert.equal(hazeDensity(NaN), 0);
  // Échelle 0 à 1 (si l'écologie fournit des valeurs normalisées).
  assert.equal(hazeDensity(0.75, 1), 0.5);
  assert.equal(hazeDensity(0.5, 1), 0);
});

test('effects : collectHaze — un voile par case polluée, au centre, les plus denses d’abord', () => {
  const values = new Float32Array([0, 60, 100, 55, 51, 80]);
  const list = collectHaze(values, 3, 2);
  assert.deepEqual(list.map((h) => h.i), [2, 5, 1, 3], 'les cases ≤ 50 (et le voile imperceptible de 51) écartées');
  assert.deepEqual(list[0], { i: 2, x: 2.5, y: 0.5, density: 1 });
  assert.deepEqual(list[2], { i: 1, x: 1.5, y: 0.5, density: hazeDensity(60) });
  assert.ok(list.every((h) => h.density >= HAZE_MIN_DENSITY));
  assert.deepEqual(collectHaze(null, 3, 2), []);
  assert.deepEqual(collectHaze(new Float32Array(6), 3, 2), [], 'air pur : aucun voile');
  assert.deepEqual(collectHaze(values, 0, 0), []);
});

test('effects : fx.setAir — une InstancedMesh de brume, un appel de dessin, sans ombre', () => {
  const models = stubModels();
  const world = makeWorld(4, 4);
  const fx = createEffects(models, { shadows: true });
  fx.setWorld(world);
  assert.equal(fx.stats().haze, 0);
  assert.equal(fx.stats().calls, 0);

  const air = new Float32Array(16);
  air[5] = 100; air[6] = 70; air[9] = 20;      // deux cases polluées, une propre
  fx.setAir(air);
  const s = fx.stats();
  assert.equal(s.haze, 2);
  assert.equal(s.calls, 1, 'un seul appel de dessin pour toute la brume');
  const haze = fx.haze;
  assert.ok(haze && haze.isInstancedMesh);
  assert.equal(haze.count, 2);
  assert.equal(haze.castShadow, false);
  assert.equal(haze.receiveShadow, false);
  assert.equal(haze.material.transparent, true);
  assert.ok(haze.count <= HAZE_MAX);
  // Le voile le plus dense est au-dessus du centre de sa case, à la hauteur prévue.
  const m = new THREE.Matrix4();
  haze.getMatrixAt(0, m);
  const p = new THREE.Vector3().setFromMatrixPosition(m);
  assert.ok(Math.abs(p.x - 1.5) < 1e-6 && Math.abs(p.z - 1.5) < 1e-6, `${p.x}, ${p.z}`);
  assert.ok(Math.abs(p.y - HAZE_HEIGHT) < 0.11, `hauteur ${p.y}`);
  const scale = new THREE.Vector3().setFromMatrixScale(m);
  assert.ok(Math.abs(scale.x - HAZE_SIZE) < 1e-6);
  const density = haze.geometry.attributes.aDensity;
  assert.equal(density.getX(0), 1);
  assert.ok(density.getX(1) > 0 && density.getX(1) < 1);

  // Un nouveau monde garde la brume (mêmes valeurs d'air, cases recalculées).
  fx.setWorld(makeWorld(4, 4));
  assert.equal(fx.stats().haze, 2);
  // Air pur : plus rien à dessiner.
  fx.setAir(new Float32Array(16));
  assert.equal(fx.stats().haze, 0);
  assert.equal(fx.stats().calls, 0);
  assert.equal(fx.haze.visible, false);
  fx.setAir(air);
  fx.setAir(null);
  assert.equal(fx.stats().haze, 0);
  fx.dispose();
  assert.equal(fx.group.children.length, 0);
});

test('ground : setLayerValues, setLayerPattern et setWaterQuality peignent la terre ET les nappes d’eau', () => {
  const world = makeWorld(4, 4);
  riverColumn(world, 1);
  setTerrain(world, 3, 3, 'wetland');
  const ground = createGround();
  ground.setWorld(world);
  const land = ground.group.getObjectByName('land');
  const water = ground.group.getObjectByName('water');
  const film = ground.group.getObjectByName('wetland-film');
  /** Valeur d’un attribut au sommet le plus proche de (x, z). */
  const at = (mesh, name, x, z) => {
    const p = mesh.geometry.attributes.position, a = mesh.geometry.attributes[name];
    let best = 0, bestD = Infinity;
    for (let v = 0; v < p.count; v++) {
      const d = Math.hypot(p.getX(v) - x, p.getZ(v) - z);
      if (d < bestD) { bestD = d; best = v; }
    }
    return a.getX(best);
  };
  // Sans calque : l'attribut vaut −1 partout (aucune hachure).
  assert.ok(Array.from(land.geometry.attributes.aLayer.array).every((v) => v === -1));
  assert.ok(Array.from(water.geometry.attributes.aLayer.array).every((v) => v === -1));

  const field = new Float32Array(16).fill(0.5);
  field[0] = 1;              // (0, 0) : terre
  field[1] = 0.25;           // (1, 0) : rivière
  field[15] = 0;             // (3, 3) : zone humide
  ground.setLayerValues(field);
  assert.equal(land.geometry.attributes.aLayer.getX(0), 1, 'première case de terre');
  assert.ok(near(at(water, 'aLayer', 1.5, 0.5), 0.25, 1e-5), 'cœur de la première case de rivière');
  assert.ok(near(at(film, 'aLayer', 3.5, 3.5), 0, 1e-5), 'cœur de la zone humide');
  ground.setLayerValues(null);
  assert.ok(Array.from(land.geometry.attributes.aLayer.array).every((v) => v === -1));
  assert.ok(Array.from(water.geometry.attributes.aLayer.array).every((v) => v === -1));

  // Mode daltonien : un seul interrupteur, partagé par la terre et l'eau.
  assert.equal(ground.layerPattern, false);
  ground.setLayerPattern(true);
  assert.equal(ground.layerPattern, true);
  assert.equal(ground.stats.pattern, 1);
  ground.setLayerPattern(false);
  assert.equal(ground.layerPattern, false);

  // Qualité de l'eau : seules l'eau et les zones humides portent l'attribut (0 à 1).
  const quality = new Float32Array(16);
  quality[1] = 100;          // rivière en haut : polluée
  quality[15] = 40;          // zone humide
  ground.setWaterQuality(quality);
  assert.ok(near(at(water, 'aQuality', 1.5, 0.5), 1, 1e-5));
  assert.ok(near(at(film, 'aQuality', 3.5, 3.5), 0.4, 1e-5));
  ground.setWaterQuality(null);
  assert.ok(near(at(water, 'aQuality', 1.5, 0.5), 0, 1e-6));

  // Les champs survivent à la reconstruction du monde (le calque reste allumé).
  ground.setLayerValues(field);
  ground.setWaterQuality(quality);
  ground.setWorld(world);
  const land2 = ground.group.getObjectByName('land');
  const water2 = ground.group.getObjectByName('water');
  assert.equal(land2.geometry.attributes.aLayer.getX(0), 1);
  assert.ok(near(at(water2, 'aQuality', 1.5, 0.5), 1, 1e-5));
  ground.dispose();
});

test('ground : createLandMaterial — hachures ajoutées au shader de la terre, une seule fois', () => {
  const uniforms = { uPattern: { value: 0 } };
  const { material } = createLandMaterial(uniforms);
  const shader = { uniforms: {}, vertexShader: '#include <begin_vertex>', fragmentShader: '#include <color_fragment>' };
  material.onBeforeCompile(shader);
  assert.equal(shader.uniforms.uPattern, uniforms.uPattern, 'le même interrupteur que l’eau');
  assert.match(shader.vertexShader, /attribute float aLayer/);
  assert.match(shader.vertexShader, /vHatchPos/);
  assert.match(shader.fragmentShader, /uniform float uPattern/);
  assert.match(shader.fragmentShader, /fract\( s \)/);
  assert.equal(typeof material.customProgramCacheKey, 'function');
  assert.notEqual(material.customProgramCacheKey(), createWaterMaterial().material.customProgramCacheKey());
  material.dispose();
});
