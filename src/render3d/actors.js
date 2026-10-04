// Couche des acteurs animés (docs/ARCHITECTURE.md §8.3) : place et anime chaque image les acteurs
// calculés par `src/core/actors.js`, en un minimum d'appels de dessin :
//   - pantins (habitants, faune maison, animaux au-delà du plafond de squelettes) : UN SEUL `BatchedMesh`
//     pour toutes les pièces de tous les pantins (une géométrie par pièce et par modèle, une instance par
//     pièce et par acteur, `setMatrixAt` à chaque image) → 1 appel (2 avec l'ombre) ;
//   - véhicules : une `InstancedMesh` par modèle (géométrie fusionnée de `models.js`) ;
//   - animaux skinnés : `SkinnedMesh` clonés (`SkeletonUtils.clone`), plafonnés à `maxSkinned`, un
//     `AnimationMixer` par instance, clip choisi d'après `state`.
// Les GLB animés se chargent en tâche de fond ; tant qu'ils manquent, les pantins en primitives servent.
// Aucun texte, aucun DOM.
//
//   const layer = createActorsLayer(models, { maxSkinned: 12, manifestUrl });
//   layer.setWorld(world); layer.update(dt, actors); scene.add(layer.group);
//   layer.stats() → { skinned, puppets, vehicles, drawables, instances, rigs }; await layer.ready(); layer.dispose();

import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ACTOR_MODELS } from '../core/actors.js';
import { surfaceHeight } from './ground.js';
import { BRIDGE_DECK_TOP } from './roads.js';
import { composeMatrix } from './util.js';
import { loadRig, fallbackRig, disposeRig } from './rigs.js';
import { puppetPose } from './puppet-pose.js';

/** Les véhicules du Car Kit (≈ 0,5 u de large) sont ramenés à la voie (0,18 u) : ≈ 0,14 u de large, 0,25 u de long. */
export const VEHICLE_SCALE = 0.26;

/** Chaîne de repli des clips par état. */
const CLIP_FALLBACKS = {
  idle: ['idle'],
  walk: ['walk', 'run', 'idle'],
  run: ['run', 'walk', 'idle'],
  fly: ['fly', 'walk', 'idle'],
  hover: ['hover', 'fly', 'idle'],
  swim: ['swim', 'walk', 'idle'],
  dive: ['dive', 'swim', 'idle'],
  drive: ['drive', 'idle'],
};

/** URL d'un fichier relative au manifeste (comme models.js). */
function resolveUrl(manifestUrl, file) {
  if (/^(https?:)?\/\//.test(file) || file.startsWith('/') || file.startsWith('data:')) return file;
  const clean = String(manifestUrl || '').split(/[?#]/)[0];
  const base = clean.slice(0, clean.lastIndexOf('/') + 1);
  return base + file;
}

/**
 * Crée la couche. `models` : résultat de `loadModels` (matériau partagé, manifeste, géométries des
 * véhicules). options : { maxSkinned = 12, shadows = true, manifestUrl = 'assets/models/manifest.json',
 * vehicleScale = VEHICLE_SCALE, skinnedShadows = false, rigs (Map modèle → rig préchargé, pour les tests) }.
 */
export function createActorsLayer(models, options = {}) {
  const maxSkinned = options.maxSkinned ?? 12;
  const shadows = options.shadows !== false;
  // Les squelettes coûtent un appel de dessin chacun : leur ombre (un second appel) est coupée par défaut.
  const skinnedShadows = options.skinnedShadows === true;
  const manifestUrl = options.manifestUrl || 'assets/models/manifest.json';
  const vehicleScale = options.vehicleScale ?? VEHICLE_SCALE;
  const group = new THREE.Group();
  group.name = 'actors';
  const material = models.materials.vertex;
  const manifest = (models.manifest && models.manifest.models) || {};

  const rigs = new Map();          // modèle → rig courant (repli en primitives, puis GLB une fois chargé)
  const pending = new Map();       // modèle → promesse de chargement
  const slots = new Map();         // id d'acteur → emplacement de rendu
  const liveIds = new Set();
  let world = null;
  let disposed = false;

  // --- Pantins : un BatchedMesh --------------------------------------------------------------
  let batch = null;
  let batchCapacity = 0;
  let geometryIds = new Map();     // rig → Map(pièce → geometryId)
  let rebuild = true;

  // --- Véhicules : InstancedMesh par modèle --------------------------------------------------
  const vehicleMeshes = new Map(); // modèle → { mesh, capacity, count }

  const stats = { skinned: 0, puppets: 0, vehicles: 0, drawables: 0, instances: 0, rigs: { loaded: 0, failed: 0, pending: 0 } };

  // Matrices de travail.
  const mRoot = new THREE.Matrix4();
  const mTrans = new THREE.Matrix4();
  const mRot = new THREE.Matrix4();
  const euler = new THREE.Euler();
  const partMatrices = new Map();  // pièce → Matrix4 (réutilisées)
  const matrixOf = (name) => { let m = partMatrices.get(name); if (!m) { m = new THREE.Matrix4(); partMatrices.set(name, m); } return m; };

  // -------------------------------------------------------------------------------------------
  // Rigs

  function rigFor(model) {
    let rig = rigs.get(model);
    if (rig) return rig;
    const def = ACTOR_MODELS[model] || { anim: 'biped', height: 0.22 };
    const entry = manifest[model];
    const anim = (entry && entry.anim) || def.anim;
    rig = (options.rigs && options.rigs.get && options.rigs.get(model)) || fallbackRig(anim, model, def.height);
    rigs.set(model, rig);
    const animated = entry && (entry.animated || entry.rig);
    if (animated && !pending.has(model) && !(options.rigs && options.rigs.has && options.rigs.has(model))) {
      const url = resolveUrl(manifestUrl, entry.file || `${model}.glb`);
      stats.rigs.pending++;
      const p = loadRig(url, { ...entry, anim }, { anim, targetHeight: def.height, float: rig.float })
        .then((loaded) => {
          if (disposed) return;
          const previous = rigs.get(model);
          rigs.set(model, loaded);
          if (previous && previous.fallback) disposeRig(previous);
          for (const s of slots.values()) if (s.model === model) s.stale = true;
          rebuild = true;
          stats.rigs.loaded++;
        })
        .catch((err) => {
          stats.rigs.failed++;
          console.warn(`[actors] modèle animé « ${model} » illisible : pantin de repli.`, err);
        })
        .finally(() => { stats.rigs.pending--; });
      pending.set(model, p);
    }
    return rig;
  }

  /** Rig pantin à utiliser pour un acteur : le pantin, ou la version pantin d'un squelette, ou le repli. */
  function puppetRigOf(model, rig) {
    if (rig.kind === 'puppet') return rig;
    if (rig.puppet) return rig.puppet;
    let fb = rigs.get(`${model}#fallback`);
    if (!fb) { const def = ACTOR_MODELS[model] || { anim: rig.anim, height: 0.2 }; fb = fallbackRig(rig.anim, model, def.height); rigs.set(`${model}#fallback`, fb); }
    return fb;
  }

  // Les GLB animés connus du manifeste se chargent dès la création.
  for (const id of Object.keys(ACTOR_MODELS)) if (manifest[id] && (manifest[id].animated || manifest[id].rig)) rigFor(id);

  // -------------------------------------------------------------------------------------------
  // Emplacements

  function releaseSlot(slot) {
    if (slot.kind === 'puppet' && slot.ids && batch) {
      for (const iid of Object.values(slot.ids)) { try { batch.deleteInstance(iid); } catch { /* lot reconstruit entre-temps */ } }
      slot.ids = null;
    } else if (slot.kind === 'skinned' && slot.object) {
      slot.mixer.stopAllAction();
      slot.mixer.uncacheRoot(slot.object);
      group.remove(slot.object);
      slot.object = null;
    }
  }

  function clipFor(rig, state) {
    const chain = CLIP_FALLBACKS[state] || ['idle'];
    for (const name of chain) if (rig.clips[name]) return { name, clip: rig.clips[name] };
    const first = Object.keys(rig.clips)[0];
    return first ? { name: first, clip: rig.clips[first] } : null;
  }

  function createSlot(a, skinnedUsed) {
    const rig = rigFor(a.model);
    if (a.group === 'vehicle') return { kind: 'vehicle', model: a.model, id: a.id };
    if (rig.kind === 'skinned' && skinnedUsed < maxSkinned) {
      const object = SkeletonUtils.clone(rig.template);
      object.name = `actor-${a.id}`;
      object.traverse((o) => { if (o.isMesh) o.castShadow = skinnedShadows; });
      const mixer = new THREE.AnimationMixer(object);
      group.add(object);
      return { kind: 'skinned', model: a.model, id: a.id, rig, object, mixer, action: null, clipName: null };
    }
    return { kind: 'puppet', model: a.model, id: a.id, rig: puppetRigOf(a.model, rig), ids: null, visible: true };
  }

  function syncSlots(actors) {
    liveIds.clear();
    for (const a of actors.list) liveIds.add(a.id);
    for (const [id, slot] of slots) {
      if (!liveIds.has(id) || slot.stale) { releaseSlot(slot); slots.delete(id); }
    }
    let skinnedUsed = 0;
    for (const slot of slots.values()) if (slot.kind === 'skinned') skinnedUsed++;
    for (const a of actors.list) {
      let slot = slots.get(a.id);
      if (slot && slot.model !== a.model) { releaseSlot(slot); slots.delete(a.id); slot = null; }
      if (!slot) {
        slot = createSlot(a, skinnedUsed);
        if (slot.kind === 'skinned') skinnedUsed++;
        if (slot.kind === 'puppet') rebuild = rebuild || !batch || !geometryIds.has(slot.rig);
        slots.set(a.id, slot);
      }
    }
  }

  // -------------------------------------------------------------------------------------------
  // Lot de pantins

  function rebuildBatch() {
    const puppets = Array.from(slots.values()).filter((s) => s.kind === 'puppet');
    const rigSet = new Set(puppets.map((s) => s.rig));
    let vertices = 0, indices = 0, parts = 0;
    for (const rig of rigSet) {
      for (const name of rig.order) {
        const g = rig.parts[name].geometry;
        vertices += g.attributes.position.count;
        indices += g.index ? g.index.count : g.attributes.position.count;
      }
    }
    for (const s of puppets) parts += s.rig.order.length;
    const capacity = Math.max(64, Math.ceil(parts * 1.3) + 16);
    if (batch) { group.remove(batch); batch.dispose(); }
    batch = new THREE.BatchedMesh(capacity, Math.max(vertices, 3), Math.max(indices, 3), material);
    batch.name = 'actors-batch';
    batch.castShadow = shadows;
    batch.receiveShadow = false;
    batch.perObjectFrustumCulled = true;
    batch.sortObjects = false;
    batch.frustumCulled = false;
    batchCapacity = capacity;
    geometryIds = new Map();
    for (const rig of rigSet) {
      const ids = new Map();
      for (const name of rig.order) ids.set(name, batch.addGeometry(rig.parts[name].geometry));
      geometryIds.set(rig, ids);
    }
    for (const s of puppets) addPuppetInstances(s);
    group.add(batch);
    rebuild = false;
  }

  function addPuppetInstances(slot) {
    const ids = geometryIds.get(slot.rig);
    slot.ids = {};
    for (const name of slot.rig.order) slot.ids[name] = batch.addInstance(ids.get(name));
    slot.visible = true;
  }

  function ensureBatch() {
    if (rebuild) { rebuildBatch(); return; }
    let needed = 0;
    for (const s of slots.values()) if (s.kind === 'puppet' && !s.ids) needed += s.rig.order.length;
    if (!needed) return;
    if (!batch || batch.instanceCount + needed > batchCapacity) { rebuildBatch(); return; }
    for (const s of slots.values()) if (s.kind === 'puppet' && !s.ids) addPuppetInstances(s);
  }

  // -------------------------------------------------------------------------------------------
  // Mise à jour

  function groundY(a) {
    if (a.group === 'habitant' || a.group === 'vehicle') return a.bridge ? BRIDGE_DECK_TOP : 0;
    if (!world) return 0;
    const tx = Math.floor(a.x), ty = Math.floor(a.z);
    if (tx < 0 || ty < 0 || tx >= world.cols || ty >= world.rows) return 0;
    return surfaceHeight(world, tx, ty);
  }

  function updatePuppet(a, slot) {
    const rig = slot.rig;
    const hidden = Boolean(a.hidden);
    if (hidden !== !slot.visible) {
      for (const iid of Object.values(slot.ids)) batch.setVisibleAt(iid, !hidden);
      slot.visible = !hidden;
    }
    if (hidden) return;
    composeMatrix(mRoot, a.x, groundY(a) + a.y, a.z, a.yaw, 1);
    const pose = puppetPose(rig.anim, a.state, a.phase, a);
    for (const name of rig.order) {
      const part = rig.parts[name];
      const m = matrixOf(name);
      m.multiplyMatrices(part.parent ? partMatrices.get(part.parent) : mRoot, part.pivotMatrix);
      const t = pose[name];
      if (t) {
        if (t.dx || t.dy || t.dz) m.multiply(mTrans.makeTranslation(t.dx, t.dy, t.dz));
        if (t.rx || t.ry || t.rz) m.multiply(mRot.makeRotationFromEuler(euler.set(t.rx, t.ry, t.rz)));
      }
      batch.setMatrixAt(slot.ids[name], m);
    }
  }

  function updateSkinned(a, slot, dt) {
    const o = slot.object;
    o.visible = !a.hidden;
    o.position.set(a.x, groundY(a) + a.y, a.z);
    o.rotation.y = a.yaw;
    const wanted = clipFor(slot.rig, a.state);
    if (wanted && wanted.name !== slot.clipName) {
      const next = slot.mixer.clipAction(wanted.clip);
      next.enabled = true;
      next.setEffectiveWeight(1);
      next.reset().play();
      if (slot.action && slot.action !== next) slot.action.crossFadeTo(next, 0.2, false);
      slot.action = next;
      slot.clipName = wanted.name;
    }
    if (slot.action) slot.action.timeScale = a.state === 'run' ? 1.4 : 1;
    slot.mixer.update(dt);
  }

  function vehicleMesh(model, needed) {
    let v = vehicleMeshes.get(model);
    if (v && v.capacity >= needed) return v;
    const capacity = Math.max(24, needed * 2);
    if (v) { group.remove(v.mesh); v.mesh.dispose(); }
    const src = models.resolve(model);
    const mesh = new THREE.InstancedMesh(src.geometry, src.material, capacity);
    mesh.name = `vehicles-${model}`;
    mesh.geometry.userData.shared = true;
    mesh.castShadow = shadows;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    mesh.count = 0;
    group.add(mesh);
    v = { mesh, capacity, count: 0 };
    vehicleMeshes.set(model, v);
    return v;
  }

  function update(dt, actors) {
    if (disposed || !actors) return;
    const step = Math.min(0.1, Math.max(0, Number(dt) || 0));
    syncSlots(actors);
    ensureBatch();
    const perModel = new Map();
    for (const a of actors.list) if (a.group === 'vehicle') perModel.set(a.model, (perModel.get(a.model) || 0) + 1);
    for (const v of vehicleMeshes.values()) v.count = 0;
    stats.skinned = 0; stats.puppets = 0; stats.vehicles = 0;
    for (const a of actors.list) {
      const slot = slots.get(a.id);
      if (!slot) continue;
      if (slot.kind === 'puppet') { if (slot.ids) updatePuppet(a, slot); stats.puppets++; }
      else if (slot.kind === 'skinned') { updateSkinned(a, slot, step); stats.skinned++; }
      else {
        const v = vehicleMesh(a.model, perModel.get(a.model) || 1);
        if (a.hidden) continue;
        composeMatrix(mRoot, a.x, groundY(a) + a.y, a.z, a.yaw, vehicleScale);
        v.mesh.setMatrixAt(v.count++, mRoot);
        stats.vehicles++;
      }
    }
    for (const v of vehicleMeshes.values()) {
      v.mesh.count = v.count;
      v.mesh.instanceMatrix.needsUpdate = true;
    }
    let drawables = batch && batch.instanceCount > 0 ? 1 : 0;
    for (const v of vehicleMeshes.values()) if (v.count > 0) drawables++;
    for (const s of slots.values()) if (s.kind === 'skinned' && s.object) s.object.traverse((o) => { if (o.isMesh && o.visible) drawables++; });
    stats.drawables = drawables;
    stats.instances = (batch ? batch.instanceCount : 0) + stats.vehicles;
  }

  function setWorld(nextWorld) { world = nextWorld; }

  function ready() { return Promise.all(Array.from(pending.values())).then(() => undefined); }

  function dispose() {
    disposed = true;
    for (const slot of slots.values()) releaseSlot(slot);
    slots.clear();
    if (batch) { group.remove(batch); batch.dispose(); batch = null; }
    for (const v of vehicleMeshes.values()) { group.remove(v.mesh); v.mesh.dispose(); }
    vehicleMeshes.clear();
    for (const rig of rigs.values()) if (rig.kind === 'puppet') disposeRig(rig);
    rigs.clear();
  }

  return {
    group,
    setWorld,
    update,
    ready,
    stats: () => ({ ...stats, rigs: { ...stats.rigs }, batchCapacity, maxSkinned }),
    /** Accès de débogage (fixture) : rigs chargés, lot. */
    debug: { rigs, slots, get batch() { return batch; } },
    dispose,
  };
}
