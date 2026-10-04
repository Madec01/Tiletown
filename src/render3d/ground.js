// Sol de la vallée : une `InstancedMesh` de boîtes 1 × 1 (une par case de terre) colorées par
// terrain via `instanceColor`, une `InstancedMesh` de plans pour l'eau (abaissée à y = −0,05,
// matériau plus clair), les collines en boîtes plus hautes, et un socle sous la carte (diorama).
// Les couleurs viennent de la palette (src/data/palette.js) par les terrains (src/data/terrain.js).
//
// Repère : la case (x, y) couvre [x, x+1] × [y, y+1] en (X, Z) ; le dessus de la terre est à y = 0.

import * as THREE from 'three';
import { PALETTE } from '../data/palette.js';
import { TERRAINS } from '../data/terrain.js';
import { hashUnit, lerp, composeScaled } from './util.js';

/** Épaisseur des boîtes de terre (visible sur les berges et au bord de la carte). */
export const LAND_THICKNESS = 0.12;
/** Niveau de la surface de l'eau. */
export const WATER_LEVEL = -0.05;
/** Hauteur des collines au-dessus du sol (min, max, tirée au hasard par case). */
export const HILL_HEIGHT = Object.freeze([0.22, 0.42]);
/** Profondeur du socle sous la terre. */
export const BASE_DEPTH = 0.5;

/** Couleur de repli si un terrain est inconnu du catalogue. */
const UNKNOWN_TERRAIN_COLOR = PALETTE.grass;

/** Couleur (« #rrggbb ») d'un terrain. */
export function terrainColorHex(terrainId) {
  const def = TERRAINS[terrainId];
  return (def && PALETTE[def.color]) || UNKNOWN_TERRAIN_COLOR;
}

/** Vrai si la case se rend comme une étendue d'eau (rivière, lac). La zone humide reste de la terre. */
export function isWaterTerrain(terrainId) {
  return terrainId === 'river' || terrainId === 'lake';
}

/** Hauteur du sommet d'une colline (déterministe par case). */
export function hillHeight(world, x, y) {
  return lerp(HILL_HEIGHT[0], HILL_HEIGHT[1], hashUnit(world.seed || 0, x, y, 7));
}

/** Altitude de la surface sur laquelle poser un décor ou un bâtiment en (x, y). */
export function surfaceHeight(world, x, y) {
  const tile = world.tiles[y * world.cols + x];
  if (!tile) return 0;
  if (tile.terrain === 'hill') return hillHeight(world, x, y);
  if (isWaterTerrain(tile.terrain)) return WATER_LEVEL;
  return 0;
}

/**
 * Crée le sol. API : { group, setWorld(world), setTileColors(rgb | null), baseColors(), stats, dispose() }.
 * `setTileColors` reçoit un Float32Array (3 valeurs linéaires par case) pour les calques, ou null
 * pour revenir aux couleurs de terrain.
 */
export function createGround() {
  const group = new THREE.Group();
  group.name = 'ground';

  const landGeometry = new THREE.BoxGeometry(1, 1, 1);
  const landMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const waterGeometry = new THREE.PlaneGeometry(1, 1);
  waterGeometry.rotateX(-Math.PI / 2);
  // Eau : couleur d'instance + léger éclat propre (plus clair que la terre, sans reflet coûteux).
  const waterMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(PALETTE.river).multiplyScalar(0.28),
  });
  const baseMaterial = new THREE.MeshLambertMaterial({ color: new THREE.Color(PALETTE.soil).multiplyScalar(0.72) });
  const baseGeometry = new THREE.BoxGeometry(1, 1, 1);

  let land = null;
  let water = null;
  let base = null;
  let world = null;
  /** Par case : index d'instance dans `land` (≥ 0) ou dans `water` (codé −(i + 1)). */
  let slots = null;
  /** Couleurs de terrain par case (linéaires), référence pour les calques. */
  let colors = null;
  const stats = { tiles: 0, land: 0, water: 0, hills: 0 };

  const color = new THREE.Color();
  const matrix = new THREE.Matrix4();

  function clear() {
    for (const mesh of [land, water, base]) if (mesh) group.remove(mesh);
    land = water = base = null;
  }

  function setWorld(nextWorld) {
    clear();
    world = nextWorld;
    const { cols, rows, tiles } = world;
    const n = cols * rows;
    slots = new Int32Array(n);
    colors = new Float32Array(n * 3);

    let landCount = 0, waterCount = 0, hillCount = 0;
    for (let i = 0; i < n; i++) {
      const t = tiles[i];
      if (t && isWaterTerrain(t.terrain)) waterCount++; else landCount++;
      if (t && t.terrain === 'hill') hillCount++;
    }

    land = new THREE.InstancedMesh(landGeometry, landMaterial, Math.max(1, landCount));
    land.name = 'land';
    land.castShadow = true;    // les collines et les berges portent une ombre
    land.receiveShadow = true;
    land.frustumCulled = false;
    water = new THREE.InstancedMesh(waterGeometry, waterMaterial, Math.max(1, waterCount));
    water.name = 'water';
    water.receiveShadow = true;
    water.frustumCulled = false;

    let li = 0, wi = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const t = tiles[i];
        const terrain = t ? t.terrain : 'grass';
        color.set(terrainColorHex(terrain));
        color.toArray(colors, i * 3);
        if (isWaterTerrain(terrain)) {
          composeScaled(matrix, x + 0.5, WATER_LEVEL, y + 0.5, 1, 1, 1);
          water.setMatrixAt(wi, matrix);
          water.setColorAt(wi, color);
          slots[i] = -(wi + 1);
          wi++;
        } else {
          const top = terrain === 'hill' ? hillHeight(world, x, y) : 0;
          const h = top + LAND_THICKNESS;
          composeScaled(matrix, x + 0.5, top - h / 2, y + 0.5, 1, h, 1);
          land.setMatrixAt(li, matrix);
          land.setColorAt(li, color);
          slots[i] = li;
          li++;
        }
      }
    }
    land.count = landCount;
    water.count = waterCount;
    land.instanceMatrix.needsUpdate = true;
    water.instanceMatrix.needsUpdate = true;
    if (land.instanceColor) land.instanceColor.needsUpdate = true;
    if (water.instanceColor) water.instanceColor.needsUpdate = true;

    // Socle : diorama posé sur la table, affleurant les bords de la carte.
    base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.name = 'base';
    base.scale.set(cols, BASE_DEPTH, rows);
    base.position.set(cols / 2, -LAND_THICKNESS - BASE_DEPTH / 2, rows / 2);
    base.receiveShadow = true;

    group.add(land, water, base);
    stats.tiles = n; stats.land = landCount; stats.water = waterCount; stats.hills = hillCount;
  }

  /** Applique des couleurs par case (Float32Array linéaire, 3 par case) ou restaure les terrains. */
  function setTileColors(rgb) {
    if (!world || !land || !water) return;
    const src = rgb || colors;
    const n = world.cols * world.rows;
    for (let i = 0; i < n; i++) {
      const s = slots[i];
      color.setRGB(src[i * 3], src[i * 3 + 1], src[i * 3 + 2]);
      if (s >= 0) land.setColorAt(s, color); else water.setColorAt(-s - 1, color);
    }
    if (land.instanceColor) land.instanceColor.needsUpdate = true;
    if (water.instanceColor) water.instanceColor.needsUpdate = true;
  }

  function dispose() {
    clear();
    for (const g of [landGeometry, waterGeometry, baseGeometry]) g.dispose();
    for (const m of [landMaterial, waterMaterial, baseMaterial]) m.dispose();
  }

  return {
    group,
    stats,
    setWorld,
    setTileColors,
    /** Copie des couleurs de terrain (linéaires) par case. */
    baseColors() { return colors ? colors.slice() : null; },
    dispose,
  };
}
