// Icônes d'espèces (src/render3d/species.js, docs/ARCHITECTURE.md §10.3) : parties pures (cases d'une
// espèce, centre de la parcelle, ordre déterministe) et objets three.js construits sans WebGL
// (InstancedMesh de panneaux : positions, nombre d'instances, apparition et disparition animées).
// Sous Node il n'y a pas de `document` : l'atlas de silhouettes est absent, tout le reste se vérifie.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { makeWorld, setTerrain } from './world-helpers.js';
import {
  createSpeciesMarkers, speciesMarkerTargets, speciesCells, isPresent, cellsCenter, atlasCell,
  SPECIES_ICONS, ATLAS_COLS, ATLAS_ROWS, MARKER_SIZE, MARKER_LIFT, MARKER_GROW, MARKER_RISE,
} from '../src/render3d/species.js';
import { surfaceHeight, WATER_LEVEL } from '../src/render3d/ground.js';

const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

/** Position d'une instance : [x, y, z]. */
function instancePosition(mesh, i) {
  const m = new THREE.Matrix4();
  mesh.getMatrixAt(i, m);
  const p = new THREE.Vector3().setFromMatrixPosition(m);
  return [p.x, p.y, p.z];
}

/** Avance les animations par pas de 1/60 s (comme la boucle de rendu). */
function advance(markers, seconds, camera = null) {
  const dt = 1 / 60;
  for (let t = 0; t < seconds - 1e-9; t += dt) markers.update(dt, camera);
}

/** Échelle (uniforme) d'une instance. */
function instanceScale(mesh, i) {
  const m = new THREE.Matrix4();
  mesh.getMatrixAt(i, m);
  return new THREE.Vector3().setFromMatrixScale(m).x;
}

/** Monde d'essai 8 × 8 : un massif de forêt au nord-ouest, un lac au sud-est. */
function forestWorld() {
  const world = makeWorld(8, 8);
  for (let y = 0; y < 2; y++) for (let x = 0; x < 3; x++) setTerrain(world, x, y, 'forest');
  for (let y = 6; y < 8; y++) for (let x = 6; x < 8; x++) setTerrain(world, x, y, 'lake');
  return world;
}

/** Parcelles correspondant au monde d'essai (comme `findPatches` de src/core/ecology.js). */
function fixturePatches(cols = 8) {
  const forest = [];
  for (let y = 0; y < 2; y++) for (let x = 0; x < 3; x++) forest.push(y * cols + x);
  const lake = [];
  for (let y = 6; y < 8; y++) for (let x = 6; x < 8; x++) lake.push(y * cols + x);
  return [
    { id: 'p1', habitat: 'forest', cells: forest, size: forest.length, connectedTo: [] },
    { id: 'p2', habitat: 'lake', cells: lake, size: lake.length, connectedTo: [] },
  ];
}

// ---------------------------------------------------------------------------------------------
// Parties pures

test('species : speciesCells et isPresent acceptent l’objet eco.species et les raccourcis', () => {
  assert.deepEqual(speciesCells({ present: true, cells: [1, 2] }), [1, 2]);
  assert.deepEqual(speciesCells([3, 4]), [3, 4]);
  assert.deepEqual(speciesCells({ present: true }), []);
  assert.deepEqual(speciesCells(null), []);
  assert.equal(isPresent({ present: true, cells: [] }), true);
  assert.equal(isPresent({ present: false, cells: [1] }), false);
  assert.equal(isPresent({ cells: [1] }), true, 'sans drapeau, des cases valent présence');
  assert.equal(isPresent({ cells: [] }), false);
  assert.equal(isPresent(undefined), false);
});

test('species : cellsCenter — centre des cases (x + 0,5, y + 0,5)', () => {
  assert.deepEqual(cellsCenter([0], 8), { x: 0.5, z: 0.5 });
  assert.deepEqual(cellsCenter([0, 1], 8), { x: 1, z: 0.5 });
  assert.deepEqual(cellsCenter([0, 8], 8), { x: 0.5, z: 1 });
  assert.equal(cellsCenter([], 8), null);
  assert.equal(cellsCenter([-1], 8), null, 'index aberrant ignoré');
});

test('species : un marqueur par parcelle habitée, posé au centre de la parcelle', () => {
  const world = forestWorld();
  const patches = fixturePatches();
  const species = {
    deer: { present: true, since: 3, cells: [0, 1, 8] },          // dans le massif de forêt
    heron: { present: true, since: 1, cells: [6 * 8 + 6] },        // sur le lac
    owl: { present: false, since: 0, cells: [2] },                 // absente : pas d'icône
  };
  const targets = speciesMarkerTargets(species, patches, world);
  assert.deepEqual(targets.map((t) => t.species), ['deer', 'heron']);
  // Centre du massif (3 × 2 cases en haut à gauche) = (1,5 ; 1) ; centre du lac (2 × 2) = (7 ; 7).
  assert.ok(near(targets[0].x, 1.5) && near(targets[0].z, 1), `${targets[0].x}, ${targets[0].z}`);
  assert.ok(near(targets[1].x, 7) && near(targets[1].z, 7), `${targets[1].x}, ${targets[1].z}`);
  assert.equal(targets[0].patch, 'p1');
  assert.equal(targets[1].patch, 'p2');
  assert.deepEqual(targets.map((t) => t.key), ['deer:p1', 'heron:p2']);
  // Hauteur : le sol de la parcelle plus l'élévation du panneau (le lac est en creux).
  assert.ok(near(targets[0].y, surfaceHeight(world, 1, 1) + MARKER_LIFT));
  assert.ok(near(targets[1].y, WATER_LEVEL + MARKER_LIFT), `héron à ${targets[1].y}`);

  // Une espèce hors parcelle (l'hirondelle en ville) se place au centre de SES cases.
  const town = speciesMarkerTargets({ swallow: { present: true, cells: [4 * 8 + 4, 4 * 8 + 5] } }, patches, world);
  assert.equal(town.length, 1);
  assert.equal(town[0].patch, null);
  assert.equal(town[0].key, 'swallow:free');
  assert.ok(near(town[0].x, 5) && near(town[0].z, 4.5));

  // Deux parcelles pour une même espèce : deux marqueurs, dans l'ordre des parcelles.
  const two = speciesMarkerTargets({ fox: { present: true, cells: [0, 6 * 8 + 7] } }, patches, world);
  assert.deepEqual(two.map((t) => t.key), ['fox:p1', 'fox:p2']);
  // Ordre déterministe entre espèces : celui de SPECIES_ICONS, pas celui de l'objet.
  const order = speciesMarkerTargets({ owl: { present: true, cells: [0] }, deer: { present: true, cells: [1] } }, patches, world);
  assert.deepEqual(order.map((t) => t.species), ['deer', 'owl']);
  // Cas vides.
  assert.deepEqual(speciesMarkerTargets(null, patches, world), []);
  assert.deepEqual(speciesMarkerTargets({ deer: { present: true, cells: [] } }, patches, world), []);
  assert.deepEqual(speciesMarkerTargets({ deer: { present: true, cells: [0] } }, null, world).map((t) => t.key), ['deer:free']);
});

test('species : atlasCell — une case par espèce, ligne retournée (flipY), repli sur la dernière', () => {
  const seen = new Set();
  SPECIES_ICONS.forEach((id, k) => {
    const [u, v] = atlasCell(id);
    assert.ok(near(u, (k % ATLAS_COLS) / ATLAS_COLS), id);
    // La texture de canevas est retournée : la ligne 0 du dessin est la ligne du haut en v.
    assert.ok(near(v, (ATLAS_ROWS - 1 - Math.floor(k / ATLAS_COLS)) / ATLAS_ROWS), id);
    seen.add(`${u},${v}`);
  });
  assert.equal(seen.size, SPECIES_ICONS.length, 'aucune case partagée');
  const [u] = atlasCell('licorne');
  assert.ok(Number.isFinite(u), 'espèce inconnue : icône de repli');
});

// ---------------------------------------------------------------------------------------------
// Couche de rendu

test('species : createSpeciesMarkers — une instance par marqueur, un seul appel de dessin', () => {
  const world = forestWorld();
  const patches = fixturePatches();
  const markers = createSpeciesMarkers(null, {});
  markers.setWorld(world);
  assert.equal(markers.group.name, 'species');
  assert.deepEqual(markers.stats(), { markers: 0, instances: 0, calls: 0, species: 0, atlas: false });

  markers.set({ deer: { present: true, cells: [0, 1] }, heron: { present: true, cells: [6 * 8 + 6] } }, patches);
  advance(markers, MARKER_GROW * 1.2);         // animation d'apparition terminée
  const mesh = markers.debug.mesh;
  assert.ok(mesh && mesh.isInstancedMesh);
  assert.equal(mesh.count, 2);
  assert.equal(mesh.visible, true);
  assert.equal(mesh.castShadow, false, 'les panneaux ne portent pas d’ombre');
  const s = markers.stats();
  assert.equal(s.markers, 2); assert.equal(s.instances, 2); assert.equal(s.calls, 1); assert.equal(s.species, 2);
  assert.equal(markers.group.children.length, 1, 'un seul objet dans la scène');

  // Positions : centre de la parcelle, à la hauteur du marqueur.
  const [x0, y0, z0] = instancePosition(mesh, 0);
  assert.ok(near(x0, 1.5) && near(z0, 1), `${x0}, ${z0}`);
  assert.ok(near(y0, surfaceHeight(world, 1, 1) + MARKER_LIFT, 1e-5), `y ${y0}`);
  const [x1, , z1] = instancePosition(mesh, 1);
  assert.ok(near(x1, 7) && near(z1, 7));
  assert.ok(near(instanceScale(mesh, 0), MARKER_SIZE, 1e-5), 'taille pleine après l’apparition');

  // Cases de l'atlas : chaque instance porte la sienne.
  const cells = mesh.geometry.attributes.aCell;
  assert.deepEqual([cells.getX(0), cells.getY(0)], atlasCell('deer'));
  assert.deepEqual([cells.getX(1), cells.getY(1)], atlasCell('heron'));
  markers.dispose();
  assert.equal(markers.group.children.length, 0);
});

test('species : apparition (montée + grossissement en 0,4 s) et disparition symétrique', () => {
  const world = forestWorld();
  const patches = fixturePatches();
  const markers = createSpeciesMarkers(null, {});
  markers.setWorld(world);
  markers.set({ deer: { present: true, cells: [0] } }, patches);

  // Première image : l'icône est déjà là mais minuscule et plus basse (elle monte).
  advance(markers, MARKER_GROW * 0.25);
  const mesh = markers.debug.mesh;
  assert.equal(mesh.count, 1);
  const small = instanceScale(mesh, 0);
  assert.ok(small > 0 && small < MARKER_SIZE * 0.5, `échelle ${small}`);
  const low = instancePosition(mesh, 0)[1];
  const target = surfaceHeight(world, 1, 1) + MARKER_LIFT;
  assert.ok(low < target - MARKER_RISE * 0.3, `hauteur ${low} < ${target}`);

  // À mi-parcours, elle a grandi et s'est élevée.
  advance(markers, MARKER_GROW * 0.35);
  const mid = instanceScale(mesh, 0);
  assert.ok(mid > small, 'elle grossit');
  assert.ok(instancePosition(mesh, 0)[1] > low, 'elle monte');

  // Au bout des 0,4 s elle est à sa taille et à sa hauteur, et elle n'y bouge plus.
  advance(markers, MARKER_GROW);
  assert.ok(near(instanceScale(mesh, 0), MARKER_SIZE, 1e-5));
  assert.ok(near(instancePosition(mesh, 0)[1], target, 1e-5));
  advance(markers, 1);
  assert.ok(near(instanceScale(mesh, 0), MARKER_SIZE, 1e-5), 'rien ne bouge plus');

  // L'espèce disparaît : l'icône rétrécit puis quitte la liste, sans toucher aux autres.
  markers.set({ deer: { present: true, cells: [0] }, heron: { present: true, cells: [6 * 8 + 6] } }, patches);
  advance(markers, MARKER_GROW * 1.2);
  assert.equal(markers.debug.mesh.count, 2);
  markers.set({ heron: { present: true, cells: [6 * 8 + 6] } }, patches);
  advance(markers, MARKER_GROW * 0.5);
  assert.equal(markers.debug.mesh.count, 2, 'le cerf rétrécit encore');
  const shrinking = markers.debug.markers.find((m) => m.species === 'deer');
  assert.ok(shrinking && shrinking.t < 1 && shrinking.dir < 0);
  assert.ok(instanceScale(markers.debug.mesh, 0) < MARKER_SIZE);
  advance(markers, MARKER_GROW);
  assert.equal(markers.debug.mesh.count, 1, 'le cerf a disparu');
  assert.equal(markers.stats().instances, 1);
  const [hx, , hz] = instancePosition(markers.debug.mesh, 0);
  assert.ok(near(hx, 7) && near(hz, 7), 'le héron n’a pas bougé');

  // Une espèce qui revient pendant sa disparition repart vers le haut.
  markers.set({ heron: { present: true, cells: [6 * 8 + 6] }, deer: { present: true, cells: [0] } }, patches);
  advance(markers, MARKER_GROW * 0.2);
  assert.equal(markers.debug.mesh.count, 2);
  // Plus aucune espèce : plus rien à dessiner.
  markers.set({}, patches);
  advance(markers, MARKER_GROW * 2);
  assert.equal(markers.debug.mesh.count, 0);
  assert.deepEqual(markers.stats(), { markers: 0, instances: 0, calls: 0, species: 0, atlas: false });
  markers.dispose();
});

test('species : les panneaux se tournent vers la caméra et suivent le monde', () => {
  const world = forestWorld();
  const patches = fixturePatches();
  const markers = createSpeciesMarkers(null, {});
  markers.setWorld(world);
  markers.set({ deer: { present: true, cells: [0] } }, patches);
  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 100);
  camera.position.set(10, 10, 10);
  camera.lookAt(1.5, 0, 1);
  camera.updateMatrixWorld();
  advance(markers, MARKER_GROW * 1.2, camera);
  const m = new THREE.Matrix4();
  markers.debug.mesh.getMatrixAt(0, m);
  const q = new THREE.Quaternion();
  m.decompose(new THREE.Vector3(), q, new THREE.Vector3());
  // La normale du panneau (+Z local) regarde la caméra, comme celle d'un plan tourné par sa rotation.
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  const toCamera = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
  assert.ok(normal.distanceTo(toCamera) < 1e-5, `panneau face à la caméra (${normal.toArray()} vs ${toCamera.toArray()})`);

  // Un monde plus petit : le marqueur reste au centre de sa parcelle, à la bonne hauteur.
  const hilly = forestWorld();
  setTerrain(hilly, 1, 1, 'hill');
  markers.setWorld(hilly);
  markers.update(0.016, camera);
  assert.ok(near(instancePosition(markers.debug.mesh, 0)[1], surfaceHeight(hilly, 1, 1) + MARKER_LIFT, 1e-5));
  // `update` sans caméra ni dt ne casse rien.
  markers.update(0, null);
  markers.update(undefined, undefined);
  assert.equal(markers.debug.mesh.count, 1);
  markers.dispose();
  markers.update(0.1, camera);     // après dispose : sans effet
});
