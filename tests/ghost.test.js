// Tests du fantôme de pose et de la surbrillance (src/render3d/ghost.js, docs/ARCHITECTURE.md §9.2) :
// parties pures (teinte, pose, modèle, pointillés du tracé) et objets three.js construits sans WebGL
// (Mesh translucide, InstancedMesh de cadres et de pointillés).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { makeWorld, setTerrain, place } from './world-helpers.js';
import {
  mixHex, ghostTint, ghostTransform, ghostModelId, edgeValueAt, tileSurface, edgeGround, dashPositions,
  buildFrameGeometry, createGhost,
  GHOST_COLORS, GHOST_OPACITY, GHOST_TINT_MIX, BREATH_AMPLITUDE, DASHES_PER_EDGE, DASH_LIFT, FRAME_LIFT, FRAME_WIDTH,
  MAX_DASHES, MAX_HIGHLIGHTS,
} from '../src/render3d/ghost.js';
import { BUILDING_SCALE } from '../src/render3d/buildings.js';
import { ROAD_THICKNESS, BRIDGE_DECK_TOP } from '../src/render3d/roads.js';
import { hillHeight, WATER_LEVEL } from '../src/render3d/ground.js';
import { PALETTE, hexToRgb } from '../src/data/palette.js';

const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

/** Faux `loadModels` : une boîte par identifiant, mise en cache ; `source` distingue GLB et remplacement. */
function stubModels(known = ['house-a', 'townhall']) {
  const cache = new Map();
  const entry = (id, source) => {
    if (!cache.has(id)) {
      const g = new THREE.BoxGeometry(0.8, 0.6, 0.8);
      g.translate(0, 0.3, 0);
      g.computeBoundingBox();
      cache.set(id, { geometry: g, material: null, height: 0.6, source });
    }
    return cache.get(id);
  };
  return {
    resolved: [],
    get: (id) => (known.includes(id) ? entry(id, 'glb') : null),
    fallback: (id) => entry(id, 'fallback'),
    resolve(id) { this.resolved.push(id); return known.includes(id) ? entry(id, 'glb') : entry(id, 'fallback'); },
  };
}

/** Couleur d'une instance d'une InstancedMesh : [r, g, b] linéaires. */
function instanceColor(mesh, i) {
  const a = mesh.instanceColor;
  return [a.getX(i), a.getY(i), a.getZ(i)];
}
const linear = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
const sameColor = (a, b) => a.every((v, i) => near(v, b[i], 1e-6));

/** Position d'une instance : [x, y, z]. */
function instancePosition(mesh, i) {
  const m = new THREE.Matrix4();
  mesh.getMatrixAt(i, m);
  const p = new THREE.Vector3().setFromMatrixPosition(m);
  return [p.x, p.y, p.z];
}

// ---------------------------------------------------------------------------------------------
// Teintes

test('mixHex : extrémités et milieu', () => {
  assert.equal(mixHex('#000000', '#ffffff', 0), '#000000');
  assert.equal(mixHex('#000000', '#ffffff', 1), '#ffffff');
  assert.equal(mixHex('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(mixHex('#d9654a', '#ffffff', 0), '#d9654a');
});

test('ghostTint : vert éclairci pour true, rouge des toits sinon, jaune soleil pour « warn »', () => {
  assert.equal(ghostTint(true), GHOST_COLORS.ok);
  assert.equal(ghostTint('ok'), GHOST_COLORS.ok);
  assert.equal(ghostTint(false), PALETTE.roofRed);
  assert.equal(ghostTint(undefined), PALETTE.roofRed);
  assert.equal(ghostTint(null), PALETTE.roofRed);
  assert.equal(ghostTint(0), PALETTE.roofRed);
  assert.equal(ghostTint('warn'), PALETTE.sun);
  // Le vert est bien l'herbe claire ÉCLAIRCIE : chaque canal au moins égal, et plus clair en moyenne.
  const base = hexToRgb(PALETTE.grassLight), ok = hexToRgb(GHOST_COLORS.ok);
  for (let i = 0; i < 3; i++) assert.ok(ok[i] >= base[i], `canal ${i}`);
  assert.ok(ok.reduce((s, v) => s + v, 0) > base.reduce((s, v) => s + v, 0));
  assert.match(GHOST_COLORS.ok, /^#[0-9a-f]{6}$/);
});

// ---------------------------------------------------------------------------------------------
// Pose et modèle

test('ghostTransform : centre de la case, pied à la surface, degrés → radians, échelle des îlots', () => {
  const t = ghostTransform(3, 4, 90, 0.3);
  assert.deepEqual(t.position, [3.5, 0.3, 4.5]);
  assert.ok(near(t.yaw, Math.PI / 2));
  assert.equal(t.scale, BUILDING_SCALE);
  assert.deepEqual(ghostTransform(0, 0).position, [0.5, 0, 0.5]);
  assert.equal(ghostTransform(0, 0).yaw, 0);
  assert.equal(ghostTransform(0, 0, undefined).yaw, 0);
  assert.equal(ghostTransform(0, 0, 'abc').yaw, 0, 'orientation invalide → 0');
  assert.ok(near(ghostTransform(1, 1, 270).yaw, 3 * Math.PI / 2));
});

test('ghostModelId : modèle de niveau 1 du catalogue, niveau et variante, identifiant direct, null sans tuile', () => {
  assert.equal(ghostModelId('house'), 'house-a');
  assert.equal(ghostModelId('house', 1, 2), 'house-c');
  assert.equal(ghostModelId('house', 2, 1), 'building-small-b');
  assert.equal(ghostModelId('house', 3), 'building-tall-a');
  assert.equal(ghostModelId('townhall'), 'townhall');
  assert.equal(ghostModelId('tree-planting'), 'tree-a');
  assert.equal(ghostModelId('field'), 'crop-wheat');
  assert.equal(ghostModelId('inconnu'), 'inconnu', 'hors catalogue : pris pour un identifiant de modèle');
  assert.equal(ghostModelId(null), null);
  assert.equal(ghostModelId(''), null);
});

// ---------------------------------------------------------------------------------------------
// Arêtes et sol

test('edgeValueAt : lit h et v aux bons index, 0 hors treillis ou sans monde', () => {
  const w = makeWorld(4, 3);
  w.edges.h[1 * 4 + 2] = 2;       // h(2, 1)
  w.edges.v[2 * 5 + 4] = 3;       // v(4, 2) : bord est
  assert.equal(edgeValueAt(w, { kind: 'h', x: 2, y: 1 }), 2);
  assert.equal(edgeValueAt(w, { kind: 'v', x: 4, y: 2 }), 3);
  assert.equal(edgeValueAt(w, { kind: 'h', x: 1, y: 1 }), 0);
  assert.equal(edgeValueAt(w, { kind: 'h', x: 4, y: 1 }), 0, 'x = cols hors treillis pour h');
  assert.equal(edgeValueAt(w, { kind: 'h', x: 0, y: 4 }), 0, 'y > rows');
  assert.equal(edgeValueAt(w, { kind: 'v', x: 5, y: 0 }), 0, 'x > cols');
  assert.equal(edgeValueAt(w, { kind: 'v', x: 0, y: 3 }), 0, 'y = rows hors treillis pour v');
  assert.equal(edgeValueAt(w, { kind: 'x', x: 0, y: 0 }), 0);
  assert.equal(edgeValueAt(null, { kind: 'h', x: 0, y: 0 }), 0);
  assert.equal(edgeValueAt({ cols: 4, rows: 3 }, { kind: 'h', x: 0, y: 0 }), 0, 'monde sans arêtes');
});

test('tileSurface et edgeGround : herbe 0, colline relevée, eau 0 pour une rue (niveau de l’eau pour la case)', () => {
  const w = makeWorld(4, 3);
  setTerrain(w, 1, 1, 'hill');
  setTerrain(w, 2, 1, 'river', 'S');
  assert.equal(tileSurface(w, 0, 0), 0);
  assert.ok(near(tileSurface(w, 1, 1), hillHeight(w, 1, 1)));
  assert.equal(tileSurface(w, 2, 1), WATER_LEVEL);
  assert.equal(tileSurface(w, -1, 0), 0);
  assert.equal(tileSurface(w, 4, 0), 0);
  assert.equal(tileSurface(null, 0, 0), 0);
  // Arête entre colline et herbe : hauteur de la colline ; entre rivière et herbe : 0 ; rivière des deux côtés : 0.
  assert.ok(near(edgeGround(w, { kind: 'v', x: 1, y: 1 }), hillHeight(w, 1, 1)));
  assert.ok(near(edgeGround(w, { kind: 'v', x: 2, y: 1 }), hillHeight(w, 1, 1)), 'colline à l’ouest, rivière à l’est');
  assert.equal(edgeGround(w, { kind: 'v', x: 3, y: 1 }), 0, 'rivière à l’ouest, herbe à l’est');
  assert.equal(edgeGround(w, { kind: 'h', x: 0, y: 0 }), 0, 'bord nord : une seule case');
  assert.equal(edgeGround(null, { kind: 'h', x: 0, y: 0 }), 0);
});

// ---------------------------------------------------------------------------------------------
// Pointillés

test('dashPositions : 4 cubes par arête, régulièrement espacés, le long de X (h) ou de Z (v)', () => {
  const w = makeWorld(4, 3);
  const h = dashPositions([{ kind: 'h', x: 1, y: 1, value: 2 }], w);
  assert.equal(h.length, DASHES_PER_EDGE);
  assert.deepEqual(h.map((d) => d.x), [1.125, 1.375, 1.625, 1.875]);
  assert.ok(h.every((d) => d.z === 1 && d.yaw === 0 && d.bridge === false));
  assert.ok(h.every((d) => near(d.y, ROAD_THICKNESS + DASH_LIFT)), 'au-dessus de la future chaussée');
  const v = dashPositions([{ kind: 'v', x: 2, y: 0, value: 2 }], w);
  assert.equal(v.length, DASHES_PER_EDGE);
  assert.deepEqual(v.map((d) => d.z), [0.125, 0.375, 0.625, 0.875]);
  assert.ok(v.every((d) => d.x === 2 && near(d.yaw, Math.PI / 2)));
  // Option perEdge
  assert.equal(dashPositions([{ kind: 'h', x: 0, y: 0, value: 2 }], w, { perEdge: 6 }).length, 6);
});

test('dashPositions : saute les arêtes déjà équipées (≥ 2), garde les chemins (1), pont en jaune surélevé', () => {
  const w = makeWorld(4, 3);
  w.edges.v[1 * 5 + 2] = 2;   // v(2, 1) déjà une rue
  w.edges.h[2 * 4 + 1] = 1;   // h(1, 2) un chemin
  w.edges.h[2 * 4 + 3] = 3;   // h(3, 2) déjà un pont
  const path = [
    { kind: 'h', x: 1, y: 1, value: 2 },  // libre → pointillée
    { kind: 'v', x: 2, y: 1, value: 2 },  // rue existante → sautée
    { kind: 'h', x: 2, y: 1, value: 3 },  // pont à construire → jaune, au niveau du tablier
    { kind: 'h', x: 1, y: 2, value: 2 },  // chemin → pointillée (il deviendra une rue)
    { kind: 'h', x: 3, y: 2, value: 3 },  // pont existant → sautée
  ];
  const out = dashPositions(path, w);
  assert.equal(out.length, 3 * DASHES_PER_EDGE);
  const streets = out.filter((d) => !d.bridge), bridges = out.filter((d) => d.bridge);
  assert.equal(streets.length, 2 * DASHES_PER_EDGE);
  assert.equal(bridges.length, DASHES_PER_EDGE);
  assert.ok(bridges.every((d) => near(d.y, BRIDGE_DECK_TOP + DASH_LIFT) && d.z === 1 && d.x > 2 && d.x < 3));
  assert.ok(!out.some((d) => d.x === 2 && d.z > 1 && d.z < 2), 'aucun pointillé sur v(2, 1)');
  assert.ok(!out.some((d) => d.z === 2 && d.x > 3), 'aucun pointillé sur h(3, 2)');
  // Sans monde : rien n'est su des arêtes, tout est pointillé.
  assert.equal(dashPositions(path, null).length, 5 * DASHES_PER_EDGE);
});

test('dashPositions : arête le long d’une colline relevée, entrées invalides ignorées, path absent → vide', () => {
  const w = makeWorld(4, 3);
  setTerrain(w, 1, 1, 'hill');
  const out = dashPositions([{ kind: 'v', x: 2, y: 1, value: 2 }], w);
  assert.ok(out.every((d) => near(d.y, hillHeight(w, 1, 1) + ROAD_THICKNESS + DASH_LIFT)));
  assert.deepEqual(dashPositions(null, w), []);
  assert.deepEqual(dashPositions(undefined, w), []);
  assert.deepEqual(dashPositions([null, { kind: 'd', x: 0, y: 0 }, { kind: 'h', x: NaN, y: 0 }, {}], w), []);
});

// ---------------------------------------------------------------------------------------------
// Géométrie du cadre

test('buildFrameGeometry : 1 × 1 hors tout, creux au centre, épaisseur autour de y = 0', () => {
  const g = buildFrameGeometry();
  const b = g.boundingBox;
  assert.ok(near(b.min.x, -0.5) && near(b.max.x, 0.5) && near(b.min.z, -0.5) && near(b.max.z, 0.5));
  assert.ok(near(b.max.y, -b.min.y));
  // Aucun sommet dans le carré intérieur (ouvert) : le cadre est creux.
  const pos = g.attributes.position;
  const inner = 0.5 - FRAME_WIDTH - 1e-6;
  for (let i = 0; i < pos.count; i++) {
    assert.ok(!(Math.abs(pos.getX(i)) < inner && Math.abs(pos.getZ(i)) < inner), `sommet ${i} dans le creux`);
  }
  g.dispose();
});

// ---------------------------------------------------------------------------------------------
// Objets three.js

test('createGhost : tout caché au départ, aucune ombre, un petit nombre d’objets', () => {
  const g = createGhost(stubModels());
  assert.equal(g.group.children.length, 3);
  assert.equal(g.mesh.visible, false);
  assert.equal(g.frames.visible, false);
  assert.equal(g.dashes.visible, false);
  assert.deepEqual(g.stats(), { visible: false, dashes: 0, highlights: 0, calls: 0 });
  for (const o of g.group.children) assert.equal(o.castShadow, false, `${o.name} sans ombre portée`);
  assert.equal(g.frames.count, 0);
  assert.equal(g.dashes.count, 0);
  g.dispose();
});

test('createGhost.set : modèle du catalogue, matériau translucide teinté, pose, cadre et pointillés', () => {
  const models = stubModels();
  const g = createGhost(models);
  const w = makeWorld(4, 3);
  place(w, 0, 0, 'townhall');
  w.edges.v[1 * 5 + 2] = 2;
  g.setWorld(w);
  const path = [{ kind: 'h', x: 1, y: 1, value: 2 }, { kind: 'v', x: 2, y: 1, value: 2 }, { kind: 'h', x: 2, y: 1, value: 3 }];
  g.set({ x: 1, y: 1, tileId: 'house', ok: true, path, yaw: 90 });

  assert.equal(models.resolved[0], 'house-a');
  assert.equal(g.mesh.visible, true);
  assert.equal(g.mesh.geometry, models.get('house-a').geometry, 'géométrie partagée du modèle');
  assert.equal(g.material.transparent, true);
  assert.equal(g.material.opacity, GHOST_OPACITY);
  assert.equal(g.material.depthWrite, false);
  assert.equal(g.mesh.material, g.material, 'jamais le matériau du modèle');
  assert.equal('#' + g.material.color.getHexString(), GHOST_COLORS.ok);
  assert.ok(g.material.emissive.r > 0 || g.material.emissive.g > 0, 'teinte réémise');
  assert.ok(g.mesh.renderOrder > 0, 'rendu après le reste');
  assert.deepEqual([g.mesh.position.x, g.mesh.position.y, g.mesh.position.z], [1.5, 0, 1.5]);
  assert.ok(near(g.mesh.rotation.y, Math.PI / 2));
  assert.ok(near(g.mesh.scale.x, BUILDING_SCALE, BUILDING_SCALE * BREATH_AMPLITUDE + 1e-9));

  // Cadre : instance 0 sur la case du fantôme, à la teinte du fantôme, au-dessus de l'asphalte.
  assert.equal(g.frames.visible, true);
  assert.equal(g.frames.count, 1);
  const fp = instancePosition(g.frames, 0);
  assert.ok(near(fp[0], 1.5) && near(fp[2], 1.5) && near(fp[1], FRAME_LIFT));
  assert.ok(FRAME_LIFT > ROAD_THICKNESS, 'cadre au-dessus de la chaussée : pas de z-fighting');
  assert.ok(sameColor(instanceColor(g.frames, 0), linear(GHOST_COLORS.ok)));

  // Pointillés : 2 arêtes × 4 (la rue existante est sautée), blanc puis jaune pour le pont.
  assert.equal(g.dashes.visible, true);
  assert.equal(g.dashes.count, 2 * DASHES_PER_EDGE);
  assert.ok(sameColor(instanceColor(g.dashes, 0), linear(PALETTE.marking)));
  assert.ok(sameColor(instanceColor(g.dashes, DASHES_PER_EDGE), linear(PALETTE.sun)));
  const dp = instancePosition(g.dashes, 0);
  assert.ok(near(dp[0], 1.125) && near(dp[2], 1) && near(dp[1], ROAD_THICKNESS + DASH_LIFT));
  assert.equal(g.dashes.instanceMatrix.needsUpdate || g.dashes.instanceMatrix.version > 0, true);

  assert.deepEqual(g.stats(), { visible: true, dashes: 8, highlights: 0, calls: 3 });
  g.dispose();
});

test('createGhost.set : teintes rouge et jaune, repli boîte pour un modèle absent, sans tuile → cadre seul', () => {
  const models = stubModels();
  const g = createGhost(models);
  g.setWorld(makeWorld(3, 3));
  g.set({ x: 0, y: 0, tileId: 'house', ok: false });
  assert.equal('#' + g.material.color.getHexString(), PALETTE.roofRed);
  assert.ok(sameColor(instanceColor(g.frames, 0), linear(PALETTE.roofRed)));
  assert.equal(g.dashes.visible, false, 'sans tracé, pas de pointillés');
  assert.deepEqual(g.stats(), { visible: true, dashes: 0, highlights: 0, calls: 2 });

  g.set({ x: 0, y: 0, tileId: 'house', ok: 'warn' });
  assert.equal('#' + g.material.color.getHexString(), PALETTE.sun);

  g.set({ x: 1, y: 1, tileId: 'clinic', ok: true });
  assert.equal(models.resolved.at(-1), 'clinic');
  assert.equal(models.resolve('clinic').source, 'fallback');
  assert.equal(g.mesh.visible, true, 'boîte de remplacement affichée');

  g.set({ x: 1, y: 1, modelId: 'townhall', ok: true });
  assert.equal(g.mesh.geometry, models.get('townhall').geometry, 'modelId direct');

  g.set({ x: 2, y: 2, tileId: null, ok: false });
  assert.equal(g.mesh.visible, false, 'sans tuile : pas de modèle');
  assert.equal(g.frames.count, 1, 'mais le cadre rouge reste (démolition)');
  assert.deepEqual(g.stats(), { visible: true, dashes: 0, highlights: 0, calls: 1 });
  g.dispose();
});

test('createGhost.set : la case d’eau pose le fantôme au niveau de l’eau, la colline sur son sommet', () => {
  const g = createGhost(stubModels());
  const w = makeWorld(3, 3);
  setTerrain(w, 0, 0, 'lake');
  setTerrain(w, 1, 1, 'hill');
  g.setWorld(w);
  g.set({ x: 0, y: 0, tileId: 'house', ok: false });
  assert.ok(near(g.mesh.position.y, WATER_LEVEL));
  assert.ok(near(instancePosition(g.frames, 0)[1], WATER_LEVEL + FRAME_LIFT));
  g.set({ x: 1, y: 1, tileId: 'house', ok: true });
  assert.ok(near(g.mesh.position.y, hillHeight(w, 1, 1)));
  g.dispose();
});

test('createGhost.setHighlight : cadres jaunes après celui du fantôme, plafonnés, effacés par null', () => {
  const g = createGhost(stubModels());
  g.setWorld(makeWorld(10, 10));
  g.setHighlight([{ x: 0, y: 0 }, { x: 3, y: 2 }, null, { x: 'a', y: 1 }]);
  assert.equal(g.frames.visible, true);
  assert.equal(g.frames.count, 2, 'entrées invalides ignorées');
  assert.ok(sameColor(instanceColor(g.frames, 0), linear(PALETTE.sun)));
  assert.deepEqual(instancePosition(g.frames, 1).map((v, i) => (i === 1 ? +v.toFixed(4) : v)), [3.5, FRAME_LIFT, 2.5]);
  assert.deepEqual(g.stats(), { visible: false, dashes: 0, highlights: 2, calls: 1 });

  // Avec un fantôme : instance 0 = fantôme (sa teinte), puis les surbrillances.
  g.set({ x: 5, y: 5, tileId: 'house', ok: true });
  assert.equal(g.frames.count, 3);
  assert.ok(sameColor(instanceColor(g.frames, 0), linear(GHOST_COLORS.ok)));
  assert.ok(sameColor(instanceColor(g.frames, 1), linear(PALETTE.sun)));
  assert.deepEqual(g.stats(), { visible: true, dashes: 0, highlights: 2, calls: 2 });

  // Le fantôme disparaît, les surbrillances restent.
  g.set(null);
  assert.equal(g.mesh.visible, false);
  assert.equal(g.frames.count, 2);
  assert.ok(sameColor(instanceColor(g.frames, 0), linear(PALETTE.sun)));

  // Plafond
  const many = Array.from({ length: MAX_HIGHLIGHTS + 10 }, (_, i) => ({ x: i % 10, y: Math.floor(i / 10) }));
  g.setHighlight(many);
  assert.equal(g.frames.count, MAX_HIGHLIGHTS);
  assert.equal(g.stats().highlights, MAX_HIGHLIGHTS);

  g.setHighlight(null);
  assert.equal(g.frames.count, 0);
  assert.equal(g.frames.visible, false);
  g.setHighlight([]);
  assert.equal(g.frames.visible, false);
  g.dispose();
});

test('createGhost : teinte mêlée aux couleurs du modèle par onBeforeCompile, dosage réglable et borné', () => {
  const g = createGhost(stubModels());
  assert.equal(g.material.vertexColors, true);
  assert.equal(g.tintMix, GHOST_TINT_MIX);
  assert.equal(typeof g.material.onBeforeCompile, 'function');
  assert.equal(g.material.customProgramCacheKey(), 'tiletown-ghost-tint');
  // Le crochet déclare l'uniforme et remplace le fragment des couleurs de sommets par le mélange.
  const shader = { uniforms: {}, vertexShader: '', fragmentShader: '#include <common>\nvoid main() {\n#include <color_fragment>\n}' };
  g.material.onBeforeCompile(shader);
  assert.ok(shader.uniforms.uTintMix && shader.uniforms.uTintMix.value === GHOST_TINT_MIX);
  assert.match(shader.fragmentShader, /uniform float uTintMix;/);
  assert.match(shader.fragmentShader, /mix\( diffuseColor\.rgb \* vColor\.rgb, diffuseColor\.rgb, uTintMix \)/, 'vColor est un vec4 en r186');
  assert.ok(!/\* vColor[,)]/.test(shader.fragmentShader), 'jamais vec3 × vec4');
  assert.ok(!shader.fragmentShader.includes('#include <color_fragment>'));
  // Le dosage change l'uniforme partagé, borné à [0, 1] ; une valeur invalide rétablit le défaut.
  g.setTintMix(0.2);
  assert.equal(shader.uniforms.uTintMix.value, 0.2);
  assert.equal(g.tintMix, 0.2);
  g.setTintMix(7); assert.equal(g.tintMix, 1);
  g.setTintMix(-1); assert.equal(g.tintMix, 0);
  g.setTintMix('x'); assert.equal(g.tintMix, GHOST_TINT_MIX);
  g.dispose();
});

test('createGhost.update : respiration ± 2 % à 1 Hz autour de l’échelle des îlots', () => {
  const g = createGhost(stubModels());
  g.setWorld(makeWorld(3, 3));
  g.set({ x: 1, y: 1, tileId: 'house', ok: true });
  const s0 = g.mesh.scale.x;
  assert.ok(near(s0, BUILDING_SCALE));
  g.update(0.25);                         // quart de période : maximum
  assert.ok(near(g.mesh.scale.x, BUILDING_SCALE * (1 + BREATH_AMPLITUDE), 1e-9));
  assert.ok(near(g.mesh.scale.y, g.mesh.scale.x) && near(g.mesh.scale.z, g.mesh.scale.x), 'échelle uniforme');
  g.update(0.5);                          // trois quarts : minimum
  assert.ok(near(g.mesh.scale.x, BUILDING_SCALE * (1 - BREATH_AMPLITUDE), 1e-9));
  g.update(0.25);                         // période complète : retour
  assert.ok(near(g.mesh.scale.x, BUILDING_SCALE, 1e-9));
  g.update(NaN); g.update(-1);            // valeurs invalides sans effet
  assert.ok(near(g.mesh.scale.x, BUILDING_SCALE, 1e-9));
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < 120; i++) { g.update(1 / 60); min = Math.min(min, g.mesh.scale.x); max = Math.max(max, g.mesh.scale.x); }
  assert.ok(min >= BUILDING_SCALE * (1 - BREATH_AMPLITUDE) - 1e-9 && max <= BUILDING_SCALE * (1 + BREATH_AMPLITUDE) + 1e-9);
  g.dispose();
});

test('createGhost.setWorld : repose le fantôme affiché (hauteurs, arêtes devenues rues)', () => {
  const g = createGhost(stubModels());
  const w1 = makeWorld(4, 3);
  g.setWorld(w1);
  const path = [{ kind: 'h', x: 1, y: 1, value: 2 }, { kind: 'h', x: 2, y: 1, value: 2 }];
  g.set({ x: 1, y: 1, tileId: 'house', ok: true, path });
  assert.equal(g.dashes.count, 2 * DASHES_PER_EDGE);
  const w2 = makeWorld(4, 3);
  w2.edges.h[1 * 4 + 1] = 2; // h(1, 1) construite entre-temps
  setTerrain(w2, 1, 1, 'hill');
  g.setWorld(w2);
  assert.equal(g.dashes.count, DASHES_PER_EDGE, 'l’arête construite n’est plus pointillée');
  assert.ok(near(g.mesh.position.y, hillHeight(w2, 1, 1)));
  g.setWorld(null);
  assert.equal(g.dashes.count, 2 * DASHES_PER_EDGE, 'sans monde, rien n’est su des arêtes');
  assert.equal(g.mesh.position.y, 0);
  g.dispose();
});

test('createGhost : plafond des pointillés, set(null) idempotent, dispose sans erreur', () => {
  const g = createGhost(stubModels());
  const w = makeWorld(200, 2);
  g.setWorld(w);
  const path = Array.from({ length: 200 }, (_, x) => ({ kind: 'h', x, y: 1, value: 2 }));
  g.set({ x: 0, y: 0, tileId: 'house', ok: true, path });
  assert.equal(g.dashes.count, MAX_DASHES);
  assert.equal(g.stats().dashes, MAX_DASHES);
  g.set(null); g.set(null); g.set(undefined);
  assert.deepEqual(g.stats(), { visible: false, dashes: 0, highlights: 0, calls: 0 });
  g.set({ x: 'x', y: 0, tileId: 'house', ok: true });
  assert.equal(g.stats().visible, false, 'coordonnées invalides : rien');
  assert.doesNotThrow(() => g.dispose());
  assert.equal(g.group.children.length, 0);
});

test('createGhost : au plus 3 appels de dessin avec le fantôme, le tracé et des surbrillances', () => {
  const g = createGhost(stubModels());
  g.setWorld(makeWorld(6, 6));
  g.setHighlight([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]);
  g.set({ x: 3, y: 3, tileId: 'house', ok: true, path: [{ kind: 'h', x: 3, y: 3, value: 2 }, { kind: 'v', x: 3, y: 3, value: 3 }] });
  const s = g.stats();
  assert.equal(s.calls, 3);
  assert.equal(s.highlights, 3);
  assert.equal(s.dashes, 8);
  // Les cadres du fantôme et des surbrillances partagent une seule InstancedMesh.
  assert.equal(g.group.children.filter((o) => o.isInstancedMesh).length, 2);
  g.dispose();
});
