// Îlots et nature de la vallée : pour chaque case, les instances de modèles à poser (bâtiment du
// catalogue, ou décors natifs : forêt = 1 à 3 arbres, prairie = fleurs clairsemées, champ = culture,
// colline = rochers, zone humide = buissons), puis leur rendu en un minimum d'appels de dessin :
//   - stratégie `batched` (défaut) : un `BatchedMesh` par matériau (tous les modèles à couleurs de
//     sommets partagent un seul matériau → un seul appel de dessin pour toute la ville) ;
//   - stratégie `instanced` : une `InstancedMesh` par identifiant de modèle (repli quand
//     l'extension WEBGL_multi_draw manque : sans elle un BatchedMesh coûte un appel par instance).
// `collectPlacements` est pure (ne dépend que du monde et du catalogue) : testable sous Node.

import * as THREE from 'three';
import { TERRAINS } from '../data/terrain.js';
import { TILE_BY_ID, modelOfBuilding } from '../data/tiles.js';
import { familyOf } from './models.js';
import { hashUnit, lerp, composeMatrix, disposeObject } from './util.js';
import { surfaceHeight, isWaterTerrain } from './ground.js';

const DEG = Math.PI / 180;
const QUARTER = Math.PI / 2;

/** Emplacements de 3 arbres dans une case (relatifs au centre), tournés d'un quart de tour au hasard. */
const TREE_SLOTS = Object.freeze([[-0.30, -0.24], [0.29, -0.18], [0.06, 0.32]]);
/** Emplacements des fleurs et buissons clairsemés. */
const SCATTER_SLOTS = Object.freeze([[-0.26, 0.12], [0.22, -0.26], [0.1, 0.27], [-0.2, -0.24], [0.28, 0.08]]);

/** Tourne un décalage (dx, dz) d'un nombre de quarts de tour. */
function rotateSlot(slot, quarters) {
  let [dx, dz] = slot;
  for (let i = 0; i < (quarters & 3); i++) [dx, dz] = [-dz, dx];
  return [dx, dz];
}

/** Choisit un modèle d'une liste d'après une valeur de hachage. */
function pickModel(list, u) {
  return list[Math.min(list.length - 1, Math.floor(u * list.length))];
}

/**
 * Liste pure des instances à poser : [{ id, x, y, z, yaw, scale, tile }] (yaw en radians, position
 * du pied du modèle en unités monde, `tile` = index de la case).
 * `modelFor(building)` → identifiant de modèle (défaut : catalogue `src/data/tiles.js`).
 */
/** Les îlots bâtis sont modélisés à 0,85 u d'emprise ; on les ramène à ≈ 0,7 u pour laisser la rue (0,36 u + trottoirs) bien visible. */
export const BUILDING_SCALE = 0.82;

export function collectPlacements(world, options = {}) {
  const modelFor = options.modelFor || modelOfBuilding;
  const seed = world.seed | 0;
  const out = [];
  const { cols, rows, tiles } = world;

  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      const i = ty * cols + tx;
      const tile = tiles[i];
      if (!tile) continue;
      const cx = tx + 0.5, cz = ty + 0.5;
      const ground = surfaceHeight(world, tx, ty);
      const h = (k) => hashUnit(seed, tx, ty, k);

      if (tile.building) {
        const b = tile.building;
        let id = null;
        try { id = modelFor(b); } catch { id = null; }
        if (!id) id = b.type;
        const def = TILE_BY_ID[b.type];
        const yaw = (Number(b.yaw) || 0) * DEG;
        const family = familyOf(id);
        const level = b.level || 1;
        const list = (def && def.models && (def.models[level] || def.models[1])) || [id];

        if (def && def.family === 'nature' && b.type === 'hedge') {
          // Haie : trois buissons alignés, dans l'axe donné par l'orientation.
          const alongZ = Math.round((Number(b.yaw) || 0) / 90) % 2 === 1;
          for (let k = -1; k <= 1; k++) {
            out.push({ id, x: cx + (alongZ ? 0 : k * 0.3), y: ground, z: cz + (alongZ ? k * 0.3 : 0), yaw: h(20 + k) * Math.PI * 2, scale: 0.8, tile: i });
          }
        } else if (def && def.family === 'nature' && b.type === 'wetland-restored') {
          // Zone humide restaurée : buissons épars.
          const q = Math.floor(h(1) * 4);
          for (let k = 0; k < 3; k++) {
            const [dx, dz] = rotateSlot(SCATTER_SLOTS[k], q);
            out.push({ id: pickModel(list, h(10 + k)), x: cx + dx, y: ground, z: cz + dz, yaw: h(20 + k) * Math.PI * 2, scale: lerp(0.6, 0.8, h(30 + k)), tile: i });
          }
        } else if (def && def.family === 'nature' && (family === 'tree' || family === 'pine')) {
          // Forêt plantée : bosquet de 3 arbres ; verger : 4 petits arbres alignés.
          if (b.type === 'orchard') {
            let k = 0;
            for (const dx of [-0.22, 0.22]) for (const dz of [-0.22, 0.22]) {
              out.push({ id: pickModel(list, h(10 + k)), x: cx + dx, y: ground, z: cz + dz, yaw: h(20 + k) * Math.PI * 2, scale: 0.62, tile: i });
              k++;
            }
          } else {
            const q = Math.floor(h(1) * 4);
            TREE_SLOTS.forEach((slot, k) => {
              const [dx, dz] = rotateSlot(slot, q);
              out.push({ id: pickModel(list, h(10 + k)), x: cx + dx, y: ground, z: cz + dz, yaw: h(20 + k) * Math.PI * 2, scale: lerp(0.85, 1.0, h(30 + k)), tile: i });
            });
          }
        } else {
          out.push({ id, x: cx, y: ground, z: cz, yaw, scale: BUILDING_SCALE, tile: i });
        }
        continue;
      }

      // Nature native
      const def = TERRAINS[tile.terrain];
      if (!def || !def.models || def.models.length === 0 || isWaterTerrain(tile.terrain)) continue;
      const list = def.models;
      const q = Math.floor(h(1) * 4);
      switch (tile.terrain) {
        case 'forest': {
          const count = h(2) < 0.35 ? 2 : 3;
          for (let k = 0; k < count; k++) {
            const [dx, dz] = rotateSlot(TREE_SLOTS[k], q);
            out.push({
              id: pickModel(list, h(10 + k)),
              x: cx + dx + (h(40 + k) - 0.5) * 0.08, y: ground, z: cz + dz + (h(50 + k) - 0.5) * 0.08,
              yaw: h(20 + k) * Math.PI * 2, scale: lerp(0.6, 1.06, h(30 + k)), tile: i,
            });
          }
          break;
        }
        case 'meadow': {
          const count = 2 + Math.floor(h(2) * 2); // 2 ou 3 touffes de fleurs
          for (let k = 0; k < count; k++) {
            const [dx, dz] = rotateSlot(SCATTER_SLOTS[k], q);
            out.push({ id: pickModel(list, h(10 + k)), x: cx + dx, y: ground, z: cz + dz, yaw: h(20 + k) * Math.PI * 2, scale: lerp(0.42, 0.68, h(30 + k)), tile: i });
          }
          break;
        }
        case 'field': {
          const variant = Number.isInteger(tile.variant) ? tile.variant : Math.floor(h(10) * list.length);
          out.push({ id: list[((variant % list.length) + list.length) % list.length], x: cx, y: ground, z: cz, yaw: q * QUARTER, scale: 1, tile: i });
          break;
        }
        case 'hill': {
          const count = 1;
          for (let k = 0; k < count; k++) {
            const [dx, dz] = count === 1 ? [0, 0] : rotateSlot([-0.18 + k * 0.36, (k ? -1 : 1) * 0.12], q);
            out.push({ id: pickModel(list, h(10 + k)), x: cx + dx, y: ground, z: cz + dz, yaw: h(20 + k) * Math.PI * 2, scale: lerp(0.6, 0.9, h(30 + k)), tile: i });
          }
          break;
        }
        case 'wetland': {
          const count = 2 + Math.floor(h(2) * 2);
          for (let k = 0; k < count; k++) {
            const [dx, dz] = rotateSlot(SCATTER_SLOTS[k + 1], q);
            out.push({ id: pickModel(list, h(10 + k)), x: cx + dx, y: ground, z: cz + dz, yaw: h(20 + k) * Math.PI * 2, scale: lerp(0.55, 0.8, h(30 + k)), tile: i });
          }
          break;
        }
        default: {
          out.push({ id: pickModel(list, h(10)), x: cx, y: ground, z: cz, yaw: q * QUARTER, scale: 1, tile: i });
        }
      }
    }
  }
  return out;
}

/**
 * Crée le rendu des îlots. `models` : résultat de `loadModels`.
 * options : { strategy: 'batched' | 'instanced', modelFor, shadows }.
 * API : { group, setWorld(world), stats, dispose() }.
 */
export function createBuildings(models, options = {}) {
  const strategy = options.strategy === 'instanced' ? 'instanced' : 'batched';
  const shadows = options.shadows !== false;
  const group = new THREE.Group();
  group.name = 'buildings';
  const stats = { strategy, placements: 0, drawables: 0, uniqueModels: 0, triangles: 0, fallbacks: 0 };
  const sharedMaterials = new Set([models.materials.vertex, ...models.materials.textured.values()]);
  const matrix = new THREE.Matrix4();

  function clear() {
    for (const child of [...group.children]) {
      group.remove(child);
      disposeObject(child, sharedMaterials);
    }
    stats.placements = 0; stats.drawables = 0; stats.uniqueModels = 0; stats.triangles = 0; stats.fallbacks = 0;
  }

  /** Regroupe les instances par matériau puis par modèle. */
  function groupPlacements(placements) {
    const byMaterial = new Map();
    const fallbackIds = new Set();
    for (const p of placements) {
      const model = models.resolve(p.id);
      if (model.source === 'fallback') fallbackIds.add(p.id);
      let perModel = byMaterial.get(model.material);
      if (!perModel) { perModel = new Map(); byMaterial.set(model.material, perModel); }
      let bucket = perModel.get(p.id);
      if (!bucket) { bucket = { geometry: model.geometry, placements: [] }; perModel.set(p.id, bucket); }
      bucket.placements.push(p);
      stats.triangles += model.geometry.index.count / 3;
    }
    stats.fallbacks = fallbackIds.size;
    return byMaterial;
  }

  function buildBatched(byMaterial) {
    for (const [material, perModel] of byMaterial) {
      let instances = 0, vertices = 0, indices = 0;
      for (const bucket of perModel.values()) {
        instances += bucket.placements.length;
        vertices += bucket.geometry.attributes.position.count;
        indices += bucket.geometry.index.count;
      }
      const mesh = new THREE.BatchedMesh(instances, vertices, indices, material);
      mesh.name = 'batch';
      mesh.castShadow = shadows;
      mesh.receiveShadow = true;
      mesh.perObjectFrustumCulled = true;
      mesh.sortObjects = false;
      mesh.frustumCulled = false;
      for (const bucket of perModel.values()) {
        const gid = mesh.addGeometry(bucket.geometry);
        for (const p of bucket.placements) {
          const iid = mesh.addInstance(gid);
          mesh.setMatrixAt(iid, composeMatrix(matrix, p.x, p.y, p.z, p.yaw, p.scale));
        }
      }
      group.add(mesh);
      stats.drawables++;
    }
  }

  function buildInstanced(byMaterial) {
    for (const [material, perModel] of byMaterial) {
      for (const [id, bucket] of perModel) {
        const mesh = new THREE.InstancedMesh(bucket.geometry, material, bucket.placements.length);
        mesh.name = id;
        mesh.geometry.userData.shared = true;
        // Repli sans multi-draw : chaque modèle coûte un appel (+ un dans la passe d'ombre) ; les petits
        // décors (fleurs, cultures, rochers, buissons) ne projettent pas d'ombre pour rester ≤ 60 appels.
        mesh.castShadow = shadows && bucket.geometry.boundingBox.max.y >= 0.35;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        bucket.placements.forEach((p, k) => {
          mesh.setMatrixAt(k, composeMatrix(matrix, p.x, p.y, p.z, p.yaw, p.scale));
        });
        mesh.instanceMatrix.needsUpdate = true;
        group.add(mesh);
        stats.drawables++;
      }
    }
  }

  function setWorld(world) {
    clear();
    const placements = collectPlacements(world, { modelFor: options.modelFor });
    stats.placements = placements.length;
    if (!placements.length) return;
    const byMaterial = groupPlacements(placements);
    let unique = 0;
    for (const perModel of byMaterial.values()) unique += perModel.size;
    stats.uniqueModels = unique;
    if (strategy === 'batched') buildBatched(byMaterial); else buildInstanced(byMaterial);
  }

  return { group, stats, setWorld, dispose: clear };
}
