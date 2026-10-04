// Calques air / eau / faune : ils modulent les couleurs d'instances du sol. Une valeur par case
// (0 à 100 comme dans docs/GAME_DESIGN.md §5, ou 0 à 1 si toutes les valeurs sont ≤ 1) ; le calque
// mélange la couleur du terrain avec une rampe à deux teintes :
//   air   : gris clair (pur)            → brun (irrespirable)
//   water : bleu (propre)               → vert sale (polluée)
//   fauna : vert pâle (peu de vie)      → vert vif (riche)
// `none` restaure les couleurs de terrain. Aucun accès au DOM : une fonction pure sur des tableaux
// typés, plus les couleurs three.js pour l'interpolation en espace linéaire.

import * as THREE from 'three';
import { PALETTE } from '../data/palette.js';

export const LAYER_KINDS = Object.freeze(['none', 'air', 'water', 'fauna']);

/** Rampes [valeur basse, valeur haute] en « #rrggbb ». */
export const LAYER_RAMPS = Object.freeze({
  air: Object.freeze([PALETTE.rockLight, '#7a4a30']),
  water: Object.freeze([PALETTE.river, '#6f8a3a']),
  fauna: Object.freeze(['#d6e9bf', '#1f8a3c']),
});

/** Part du calque dans le mélange avec la couleur du terrain (le relief reste lisible). */
export const LAYER_BLEND = 0.8;

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

/**
 * Couleurs par case pour un calque : Float32Array (3 valeurs linéaires par case) à passer au sol,
 * ou null pour `none` / valeurs absentes. `baseColors` : couleurs de terrain (linéaires, 3 par case).
 */
export function layerColors(kind, values, baseColors) {
  if (!kind || kind === 'none' || !values || !baseColors) return null;
  const ramp = LAYER_RAMPS[kind];
  if (!ramp) throw new Error(`Calque inconnu : ${kind}`);
  _low.set(ramp[0]);
  _high.set(ramp[1]);
  const scale = valueScale(values);
  const n = baseColors.length / 3;
  const out = new Float32Array(baseColors.length);
  for (let i = 0; i < n; i++) {
    const v = i < values.length ? values[i] : 0;
    const t = Math.min(1, Math.max(0, (Number.isFinite(v) ? v : 0) / scale));
    _mix.copy(_low).lerp(_high, t);
    _base.setRGB(baseColors[i * 3], baseColors[i * 3 + 1], baseColors[i * 3 + 2]);
    _base.lerp(_mix, LAYER_BLEND);
    out[i * 3] = _base.r; out[i * 3 + 1] = _base.g; out[i * 3 + 2] = _base.b;
  }
  return out;
}
