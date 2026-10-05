// Rampes et légendes des calques écologiques. Le jeu utilise toujours une échelle fixe 0..100.
// analysis.js applique ces couleurs au sol, aux bâtiments et aux rues ; ground.js garde également
// ses couleurs par case. Les fonctions restent compatibles avec des tableaux normalisés explicites.
// Les hachures complètent les couleurs par cinq densités de traits.
import * as THREE from 'three';

export const LAYER_KINDS = Object.freeze(['none', 'air', 'water', 'fauna', 'soil']);

/** Rampes [valeur basse, valeur haute] en « #rrggbb ». */
export const LAYER_RAMPS = Object.freeze({
  air: Object.freeze(['#3dc8b2', '#d94c48']),
  water: Object.freeze(['#36afe0', '#d75845']),
  fauna: Object.freeze(['#dcb87a', '#28905d']),
  soil: Object.freeze(['#bb7953', '#8bbe46']),
});

/** Part du calque dans le mélange avec la couleur du terrain (le relief reste lisible). */
export const LAYER_BLEND = 0.8;

/** Bornes communes des calques (indices 0 à 100 de GAME_DESIGN §5). */
export const LAYER_MIN = 0;
export const LAYER_MAX = 100;

/**
 * Légendes : libellé du calque, unité, et nom de chaque palier (bas, milieu, haut). Les textes sont
 * affichés tels quels par l'interface (feuille « Calques », §10.4).
 */
export const LAYER_LEGENDS = Object.freeze({
  air: Object.freeze({ label: 'Air', unit: '/ 100', stops: Object.freeze(['Pur', 'Chargé', 'Irrespirable']) }),
  water: Object.freeze({ label: 'Eau', unit: '/ 100', stops: Object.freeze(['Claire', 'Trouble', 'Polluée']) }),
  fauna: Object.freeze({ label: 'Faune', unit: '/ 100', stops: Object.freeze(['Déserte', 'Vivante', 'Foisonnante']) }),
  soil: Object.freeze({ label: 'Sols', unit: '/ 100', stops: Object.freeze(['Épuisé', 'Correct', 'Fertile']) }),
  none: Object.freeze({ label: 'Aucun', unit: '', stops: Object.freeze([]) }),
});

/** Nombre de bandes de hachures (mode daltonien) : 0 = aucune hachure, 4 = la plus serrée. */
export const LAYER_BANDS = 5;
/** Cycles de hachures par unité de monde et par bande (bande 1 : 1,5 trait/u, bande 4 : 6). */
export const HATCH_CYCLES = 1.5;

const _low = new THREE.Color();
const _high = new THREE.Color();
const _mix = new THREE.Color();
const _base = new THREE.Color();

/** Détecte l'échelle des valeurs : 100 si une valeur dépasse 1, sinon 1. */
export function valueScale(values) {
  let max = 0;
  for (let i = 0; i < values.length; i++) if (values[i] > max) max = values[i];
  return max > 1 ? 100 : 1;
}

/** Valeur ramenée dans [0, 1] (hors échelle : bornée ; NaN : 0). */
export function layerNormalized(value, scale = LAYER_MAX) {
  const v = Number.isFinite(value) ? value / (scale || 1) : 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Bande de hachures d'une valeur normalisée (0 à 1) : entier de 0 (aucune hachure) à LAYER_BANDS − 1
 * (la plus serrée). Le shader du sol fait le même calcul ; cette fonction sert aux tests et à la légende.
 */
export function layerBand(t) {
  const v = Number.isFinite(t) ? (t < 0 ? 0 : t > 0.999 ? 0.999 : t) : 0;
  return Math.floor(v * LAYER_BANDS);
}

/**
 * Valeurs d'un calque normalisées dans [0, 1] pour le sol (attribut d'instance des hachures) :
 * Float32Array de la longueur de `values`, réutilise `out` s'il est de la bonne taille.
 */
export function normalizeLayerValues(values, out = null, fixedScale = null) {
  if (!values || !values.length) return null;
  const scale = fixedScale ?? valueScale(values);
  const dst = out && out.length === values.length ? out : new Float32Array(values.length);
  for (let i = 0; i < values.length; i++) dst[i] = layerNormalized(values[i], scale);
  return dst;
}

/** Couleur « #rrggbb » d'une rampe à la fraction `t` (interpolation en espace linéaire). */
export function layerRampColor(kind, t) {
  const ramp = LAYER_RAMPS[kind];
  if (!ramp) throw new Error(`Calque inconnu : ${kind}`);
  _low.set(ramp[0]);
  _high.set(ramp[1]);
  return `#${_low.lerp(_high, Math.min(1, Math.max(0, t))).getHexString()}`;
}

/**
 * Légende d'un calque, prête à afficher :
 *   { kind, label, unit, min, max, stops: [ { value, hex, label } ] }
 * Trois paliers (0, 50, 100) avec leur teinte et leur nom (air : « Pur 0 » → « Irrespirable 100 »).
 * `none` renvoie une légende vide. Un calque inconnu lève une erreur.
 */
export function layerInfo(kind) {
  const id = kind || 'none';
  const legend = LAYER_LEGENDS[id];
  if (!legend) throw new Error(`Calque inconnu : ${id}`);
  if (id === 'none') {
    return { kind: 'none', label: legend.label, unit: legend.unit, min: LAYER_MIN, max: LAYER_MAX, stops: [] };
  }
  const stops = legend.stops.map((label, i) => {
    const t = i / (legend.stops.length - 1);
    return { value: LAYER_MIN + t * (LAYER_MAX - LAYER_MIN), hex: layerRampColor(id, t), label };
  });
  return { kind: id, label: legend.label, unit: legend.unit, min: LAYER_MIN, max: LAYER_MAX, stops };
}

/**
 * Couleurs par case pour un calque : Float32Array (3 valeurs linéaires par case) à passer au sol,
 * ou null pour `none` / valeurs absentes. `baseColors` : couleurs de terrain (linéaires, 3 par case).
 */
export function layerColors(kind, values, baseColors, fixedScale = null) {
  if (!kind || kind === 'none' || !values || !baseColors) return null;
  const ramp = LAYER_RAMPS[kind];
  if (!ramp) throw new Error(`Calque inconnu : ${kind}`);
  _low.set(ramp[0]);
  _high.set(ramp[1]);
  const scale = fixedScale ?? valueScale(values);
  const n = baseColors.length / 3;
  const out = new Float32Array(baseColors.length);
  for (let i = 0; i < n; i++) {
    const v = i < values.length ? values[i] : 0;
    const t = layerNormalized(v, scale);
    _mix.copy(_low).lerp(_high, t);
    _base.setRGB(baseColors[i * 3], baseColors[i * 3 + 1], baseColors[i * 3 + 2]);
    _base.lerp(_mix, LAYER_BLEND);
    out[i * 3] = _base.r; out[i * 3 + 1] = _base.g; out[i * 3 + 2] = _base.b;
  }
  return out;
}
