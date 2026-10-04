// Contrat des modèles ANIMÉS du manifeste (docs/ARCHITECTURE.md §8.2) : chaque entrée `animated: true`
// a son GLB, un rig connu, les champs attendus par le rendu (clips pour les squelettes, pièces nommées
// pour les pantins), est posée au sol et centrée ; le poids total des modèles animés reste sous 1,5 Mo.
// Le test est ignoré si le manifeste n'a pas encore de modèle animé (dépôt sans import).

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = join(ROOT, 'assets', 'models', 'manifest.json');

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { models: {} };
const animated = Object.entries(manifest.models || {}).filter(([, e]) => e && e.animated);

const EXPECTED_SKINNED = ['deer', 'fox', 'duck', 'bee', 'owl'];
const EXPECTED_PUPPETS = { 'citizen-a': 'biped', 'citizen-b': 'biped', 'citizen-c': 'biped', heron: 'wader', otter: 'swimmer', swallow: 'flyer', cyclist: 'wheeled' };
const PUPPET_PARTS = {
  'citizen-a': ['Body', 'Head', 'ArmL', 'ArmR', 'LegL', 'LegR'],
  heron: ['Body', 'Neck', 'Head', 'LegL', 'LegR', 'WingL', 'WingR'],
  otter: ['Body', 'Head', 'Tail', 'PawFL', 'PawFR', 'PawBL', 'PawBR'],
  swallow: ['Body', 'WingL', 'WingR', 'Tail'],
  cyclist: ['Frame', 'WheelF', 'WheelB', 'Body', 'Head', 'LegL', 'LegR'],
};

test('manifeste animé : les modèles du plan sont présents', { skip: animated.length === 0 && 'aucun modèle animé importé' }, () => {
  const ids = new Set(animated.map(([id]) => id));
  for (const id of [...EXPECTED_SKINNED, ...Object.keys(EXPECTED_PUPPETS)]) assert.ok(ids.has(id), `modèle animé manquant : ${id}`);
});

test('manifeste animé : chaque entrée a son GLB, un rig et une pose au sol', { skip: animated.length === 0 && 'aucun modèle animé importé' }, () => {
  for (const [id, e] of animated) {
    assert.ok(e.file && existsSync(join(ROOT, 'assets', 'models', e.file)), `${id} : GLB absent (${e.file})`);
    assert.equal(statSync(join(ROOT, 'assets', 'models', e.file)).size, e.bytes, `${id} : taille du GLB ≠ manifeste`);
    assert.ok(['skinned', 'puppet'].includes(e.rig), `${id} : rig inconnu ${e.rig}`);
    assert.equal(e.license, 'CC0', `${id} : licence`);
    assert.ok(e.bbox && Math.abs(e.bbox.min[1]) < 0.01, `${id} : pas posé sur y = 0`);
    assert.ok(Math.abs(e.bbox.min[0] + e.bbox.max[0]) < 0.02 && Math.abs(e.bbox.min[2] + e.bbox.max[2]) < 0.02, `${id} : décentré en x/z`);
    assert.ok(e.triangles > 0 && e.triangles < 4000, `${id} : ${e.triangles} triangles`);
    assert.ok(Array.isArray(e.footprint) && e.footprint.length === 2, `${id} : footprint`);
  }
});

test('manifeste animé : squelettes avec clips, pantins avec pièces nommées', { skip: animated.length === 0 && 'aucun modèle animé importé' }, () => {
  for (const [id, e] of animated) {
    if (e.rig === 'skinned') {
      assert.ok(e.clips && e.clips.idle && e.clips.walk, `${id} : clips idle/walk requis`);
      assert.ok(e.joints > 0, `${id} : articulations`);
      if (e.clipRanges) { assert.equal(e.fps, 24); assert.deepEqual(e.clipRanges.walk, [90, 119]); assert.equal(e.track, 'all'); }
      for (const role of Object.keys(e.clips)) assert.ok(e.animations.some((a) => a.name === e.clips[role] && a.duration > 0), `${id} : clip ${e.clips[role]} absent`);
    } else {
      assert.equal(e.anim, EXPECTED_PUPPETS[id] || e.anim, `${id} : démarche`);
      assert.ok(e.parts && Object.keys(e.parts).length >= 4, `${id} : pièces`);
      for (const name of PUPPET_PARTS[id] || PUPPET_PARTS[id.replace(/-[abc]$/, '-a')] || []) assert.equal(e.parts[name], name, `${id} : pièce ${name}`);
      assert.ok(e.partsTree && Object.values(e.partsTree).filter((p) => p === null).length === 1, `${id} : une seule pièce racine`);
      for (const name of Object.keys(e.parts)) assert.ok(Array.isArray(e.pivots[name]) && e.pivots[name].length === 3, `${id} : pivot ${name}`);
    }
  }
});

test('manifeste animé : poids total sous 1,5 Mo', { skip: animated.length === 0 && 'aucun modèle animé importé' }, () => {
  const bytes = animated.reduce((n, [, e]) => n + e.bytes, 0);
  assert.ok(bytes < 1.5e6, `${(bytes / 1e6).toFixed(2)} Mo`);
});

test('manifeste animé : tailles attendues (hauteur habitants 0,26 u, héron 0,3 u, cerf 0,45 u de long)', { skip: animated.length === 0 && 'aucun modèle animé importé' }, () => {
  const m = manifest.models;
  const near = (v, target, tol = 0.02) => Math.abs(v - target) <= tol;
  if (m['citizen-a']) assert.ok(near(m['citizen-a'].bbox.size[1], 0.26), 'habitant');
  if (m.heron) assert.ok(near(m.heron.bbox.size[1], 0.3), 'héron');
  if (m.deer) assert.ok(near(m.deer.bbox.size[2], 0.45), 'cerf');
  if (m.fox) assert.ok(near(m.fox.bbox.size[2], 0.3), 'renard');
  if (m.duck) assert.ok(near(m.duck.bbox.size[2], 0.15), 'canard');
  if (m.swallow) assert.ok(near(m.swallow.bbox.size[0], 0.2), 'hirondelle');
  if (m.cyclist) assert.ok(near(m.cyclist.bbox.size[2], 0.28), 'cycliste');
  if (m.otter) assert.ok(near(m.otter.bbox.size[2], 0.3), 'loutre');
});
