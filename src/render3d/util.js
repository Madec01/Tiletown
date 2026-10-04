// Petits outils partagés par les modules de rendu : hachage déterministe (décors « aléatoires »
// mais stables d'une image à l'autre et d'un appareil à l'autre) et composition de matrices.

import * as THREE from 'three';

/**
 * Nombre pseudo-aléatoire dans [0, 1) déterminé par (seed, x, y, k) : même monde → mêmes décors.
 * Mélange d'entiers façon xxhash/murmur, sans état global.
 */
export function hashUnit(seed, x, y, k = 0) {
  let h = (seed | 0) ^ 0x9e3779b9;
  h = Math.imul(h ^ (x | 0), 0x85ebca6b); h ^= h >>> 13;
  h = Math.imul(h ^ (y | 0), 0xc2b2ae35); h ^= h >>> 16;
  h = Math.imul(h ^ (k | 0), 0x27d4eb2f); h ^= h >>> 15;
  h = Math.imul(h, 0x165667b1); h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

/** Interpolation linéaire. */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _axisY = new THREE.Vector3(0, 1, 0);

/** Écrit dans `out` la matrice translation(x, y, z) · rotationY(yaw) · échelle(s). */
export function composeMatrix(out, x, y, z, yaw = 0, s = 1) {
  _pos.set(x, y, z);
  _quat.setFromAxisAngle(_axisY, yaw);
  _scale.set(s, s, s);
  return out.compose(_pos, _quat, _scale);
}

/** Écrit dans `out` la matrice translation(x, y, z) · échelle(sx, sy, sz) (sans rotation). */
export function composeScaled(out, x, y, z, sx, sy, sz) {
  _pos.set(x, y, z);
  _quat.identity();
  _scale.set(sx, sy, sz);
  return out.compose(_pos, _quat, _scale);
}

/** Libère géométries et matériaux d'un objet et de ses descendants (les matériaux partagés sont ignorés). */
export function disposeObject(root, sharedMaterials = new Set()) {
  root.traverse((obj) => {
    if (obj.geometry && !obj.geometry.userData.shared) obj.geometry.dispose();
    if (obj.material && !sharedMaterials.has(obj.material)) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) m.dispose();
    }
    if (obj.isBatchedMesh && typeof obj.dispose === 'function') obj.dispose();
  });
}
