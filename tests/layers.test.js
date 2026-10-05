// Calques air / eau / faune / sols (src/render3d/layers.js, docs/ARCHITECTURE.md §10.3) : rampes,
// légende de `layerInfo` (bornes et paliers), normalisation des valeurs (échelle 0-1 ou 0-100, valeurs
// hors échelle), bandes de hachures du mode daltonien, et mélange avec les couleurs de terrain.
// Tout est pur : aucun WebGL, three.js seulement pour vérifier les couleurs en espace linéaire.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  LAYER_KINDS, LAYER_RAMPS, LAYER_BLEND, LAYER_LEGENDS, LAYER_MIN, LAYER_MAX, LAYER_BANDS, HATCH_CYCLES,
  valueScale, layerNormalized, layerBand, normalizeLayerValues, layerRampColor, layerInfo, layerColors,
} from '../src/render3d/layers.js';
import { PALETTE } from '../src/data/palette.js';

const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;
/** Couleur « #rrggbb » → [r, g, b] linéaires (comme three.js les stocke). */
const linear = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };

// ---------------------------------------------------------------------------------------------
// Rampes

test('layers : quatre calques (air, eau, faune, sols) et leurs rampes', () => {
  assert.deepEqual(LAYER_KINDS, ['none', 'air', 'water', 'fauna', 'soil']);
  for (const kind of ['air', 'water', 'fauna', 'soil']) {
    const ramp = LAYER_RAMPS[kind];
    assert.equal(ramp.length, 2, kind);
    for (const hex of ramp) assert.match(hex, /^#[0-9a-f]{6}$/, `${kind} : ${hex}`);
    // Les deux bouts se distinguent franchement (sinon la carte ne dit rien).
    const [a, b] = ramp.map(linear);
    const d = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    assert.ok(d > 0.25, `${kind} : rampe trop plate (${d.toFixed(3)})`);
  }
  // Les vues analytiques se distinguent de la palette naturelle.
  assert.notEqual(LAYER_RAMPS.air[0], PALETTE.grass);
  assert.notEqual(LAYER_RAMPS.water[1], PALETTE.river);
  // Le calque des sols existe bien, et il est distinct de celui de l'air (sinon on les confond).
  assert.ok(LAYER_RAMPS.soil[0] !== LAYER_RAMPS.air[0] && LAYER_RAMPS.soil[1] !== LAYER_RAMPS.air[1]);
  assert.ok(LAYER_BLEND > 0.5 && LAYER_BLEND <= 1);
});

test('layers : layerRampColor interpole la rampe et borne les fractions', () => {
  for (const kind of ['air', 'water', 'fauna', 'soil']) {
    assert.equal(layerRampColor(kind, 0), LAYER_RAMPS[kind][0].toLowerCase());
    assert.equal(layerRampColor(kind, 1), LAYER_RAMPS[kind][1].toLowerCase());
    assert.equal(layerRampColor(kind, -5), LAYER_RAMPS[kind][0].toLowerCase());
    assert.equal(layerRampColor(kind, 42), LAYER_RAMPS[kind][1].toLowerCase());
    const mid = linear(layerRampColor(kind, 0.5));
    const [lo, hi] = LAYER_RAMPS[kind].map(linear);
    for (let c = 0; c < 3; c++) assert.ok(near(mid[c], (lo[c] + hi[c]) / 2, 0.01), `${kind} canal ${c}`);
  }
  assert.throws(() => layerRampColor('bruit', 0.5), /Calque inconnu/);
});

// ---------------------------------------------------------------------------------------------
// Échelle et normalisation

test('layers : valueScale — 100 dès qu’une valeur dépasse 1, sinon 1', () => {
  assert.equal(valueScale(new Float32Array([0, 0.2, 1])), 1);
  assert.equal(valueScale(new Float32Array([0, 0, 0])), 1);
  assert.equal(valueScale(new Float32Array([])), 1);
  assert.equal(valueScale(new Float32Array([0, 1.0001])), 100);
  assert.equal(valueScale(new Float32Array([0, 73, 12])), 100);
});

test('layers : layerNormalized borne dans [0, 1] et absorbe les valeurs aberrantes', () => {
  assert.equal(layerNormalized(0, 100), 0);
  assert.equal(layerNormalized(50, 100), 0.5);
  assert.equal(layerNormalized(100, 100), 1);
  assert.equal(layerNormalized(140, 100), 1, 'hors échelle par le haut');
  assert.equal(layerNormalized(-30, 100), 0, 'hors échelle par le bas');
  assert.equal(layerNormalized(NaN, 100), 0);
  assert.equal(layerNormalized(undefined, 100), 0);
  assert.equal(layerNormalized(0.25, 1), 0.25, 'échelle 0 à 1');
});

test('layers : normalizeLayerValues réutilise le tampon et normalise selon l’échelle détectée', () => {
  const cent = new Float32Array([0, 25, 50, 100, 250]);
  const a = normalizeLayerValues(cent);
  assert.deepEqual(Array.from(a), [0, 0.25, 0.5, 1, 1]);
  const unit = new Float32Array([0, 0.5, 1, 1, 0]);
  assert.deepEqual(Array.from(normalizeLayerValues(unit)), [0, 0.5, 1, 1, 0]);
  // Tampon réutilisé quand la taille correspond, remplacé sinon.
  const out = new Float32Array(5);
  assert.equal(normalizeLayerValues(cent, out), out);
  assert.notEqual(normalizeLayerValues(new Float32Array(3), out), out);
  assert.equal(normalizeLayerValues(null), null);
  assert.equal(normalizeLayerValues(new Float32Array(0)), null);
});

// ---------------------------------------------------------------------------------------------
// Bandes de hachures (mode daltonien)

test('layers : layerBand — 5 bandes, de « aucune hachure » à la plus serrée', () => {
  assert.equal(LAYER_BANDS, 5);
  assert.ok(HATCH_CYCLES > 0);
  assert.equal(layerBand(0), 0);
  assert.equal(layerBand(0.19), 0);
  assert.equal(layerBand(0.2), 1);
  assert.equal(layerBand(0.5), 2);
  assert.equal(layerBand(0.79), 3);
  assert.equal(layerBand(0.8), 4);
  assert.equal(layerBand(1), LAYER_BANDS - 1, 'la valeur maximale reste dans la dernière bande');
  assert.equal(layerBand(12), LAYER_BANDS - 1, 'hors échelle par le haut');
  assert.equal(layerBand(-3), 0, 'hors échelle par le bas');
  assert.equal(layerBand(NaN), 0);
  // La bande croît avec la valeur (lecture sans couleur possible).
  let last = -1;
  for (let t = 0; t <= 1.0001; t += 0.05) { const b = layerBand(t); assert.ok(b >= last); last = b; }
});

// ---------------------------------------------------------------------------------------------
// Légende

test('layers : layerInfo — légende prête à afficher (« Pur 0 » → « Irrespirable 100 »)', () => {
  const air = layerInfo('air');
  assert.equal(air.kind, 'air');
  assert.equal(air.label, 'Air');
  assert.equal(air.unit, '/ 100');
  assert.equal(air.min, LAYER_MIN);
  assert.equal(air.max, LAYER_MAX);
  assert.equal(air.stops.length, 3);
  assert.deepEqual(air.stops.map((s) => s.value), [0, 50, 100]);
  assert.deepEqual(air.stops.map((s) => s.label), ['Pur', 'Chargé', 'Irrespirable']);
  assert.equal(air.stops[0].hex, LAYER_RAMPS.air[0].toLowerCase());
  assert.equal(air.stops[2].hex, LAYER_RAMPS.air[1].toLowerCase());
  for (const s of air.stops) assert.match(s.hex, /^#[0-9a-f]{6}$/);

  for (const kind of ['water', 'fauna', 'soil']) {
    const info = layerInfo(kind);
    assert.equal(info.kind, kind);
    assert.equal(info.label, LAYER_LEGENDS[kind].label);
    assert.equal(info.stops.length, 3);
    assert.deepEqual(info.stops.map((s) => s.value), [0, 50, 100]);
    assert.deepEqual(info.stops.map((s) => s.label), [...LAYER_LEGENDS[kind].stops]);
    assert.equal(info.stops[0].hex, LAYER_RAMPS[kind][0].toLowerCase());
    assert.equal(info.stops[2].hex, LAYER_RAMPS[kind][1].toLowerCase());
  }
  // Les sols se lisent du plus pauvre au plus riche : « Épuisé » puis « Fertile ».
  assert.deepEqual(layerInfo('soil').stops.map((s) => s.label), ['Épuisé', 'Correct', 'Fertile']);

  // « Aucun » : une légende vide, affichable sans cas particulier.
  const none = layerInfo('none');
  assert.deepEqual(none, { kind: 'none', label: 'Aucun', unit: '', min: 0, max: 100, stops: [] });
  assert.deepEqual(layerInfo(null), none, 'sans calque : « Aucun »');
  assert.deepEqual(layerInfo(''), none);
  assert.throws(() => layerInfo('bruit'), /Calque inconnu/);
});

// ---------------------------------------------------------------------------------------------
// Couleurs du sol

test('layers : layerColors — mélange avec le terrain, bornes et valeurs hors échelle', () => {
  const base = new Float32Array([...linear(PALETTE.grass), ...linear(PALETTE.grass), ...linear(PALETTE.grass)]);
  const values = new Float32Array([0, 100, 400]);
  const out = layerColors('air', values, base);
  assert.equal(out.length, base.length);
  const lo = linear(LAYER_RAMPS.air[0]), hi = linear(LAYER_RAMPS.air[1]);
  const expect = (rampColor, c) => base[c] + (rampColor[c] - base[c]) * LAYER_BLEND;
  for (let c = 0; c < 3; c++) {
    assert.ok(near(out[c], expect(lo, c), 1e-5), `case pure canal ${c}`);
    assert.ok(near(out[3 + c], expect(hi, c), 1e-5), `case saturée canal ${c}`);
    assert.ok(near(out[6 + c], expect(hi, c), 1e-5), 'au-delà de 100 : borné au haut de la rampe');
  }
  // Valeurs 0 à 1 : la même carte, lue à l'échelle 1.
  const unit = layerColors('air', new Float32Array([0, 1, 1]), base);
  for (let c = 0; c < 3; c++) assert.ok(near(unit[3 + c], out[3 + c], 1e-6));
  // Valeurs négatives : bornées au bas de la rampe, jamais de couleur aberrante.
  const neg = layerColors('fauna', new Float32Array([-50, -1, 0]), base);
  for (let c = 0; c < 9; c++) assert.ok(neg[c] >= 0 && neg[c] <= 1);
  // Tableau plus court que la carte : les cases manquantes valent 0.
  const short = layerColors('air', new Float32Array([100]), base);
  for (let c = 0; c < 3; c++) assert.ok(near(short[3 + c], expect(lo, c), 1e-5), 'case sans valeur');
  // `none` et les cas vides ne renvoient rien (le sol garde ses terrains).
  assert.equal(layerColors('none', values, base), null);
  assert.equal(layerColors(null, values, base), null);
  assert.equal(layerColors('air', null, base), null);
  assert.equal(layerColors('air', values, null), null);
  assert.throws(() => layerColors('bruit', values, base), /Calque inconnu/);
});

test('layers : le calque des sols distingue terre épuisée et sol fertile', () => {
  const base = new Float32Array([...linear(PALETTE.grass), ...linear(PALETTE.grass)]);
  const out = layerColors('soil', new Float32Array([0, 100]), base);
  assert.ok(out[0] > out[1], 'un sol épuisé est brun');
  assert.ok(out[4] > out[3], 'un sol fertile est vert');
});

test('mesures écologiques sous 1 : restent sur une échelle fixe de 100', () => {
  const values = new Float32Array([0, 0.2, 0.8]);
  const normalized = normalizeLayerValues(values, null, 100);
  assert.ok(near(normalized[2], 0.008));
  const base = new Float32Array(9);
  const colors = layerColors('air', values, base, 100);
  assert.ok(Math.abs(colors[0] - colors[6]) < 0.01, '0,8 de pollution reste proche de l’air pur');
});
