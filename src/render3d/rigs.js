// Chargeur des modèles ANIMÉS (docs/ARCHITECTURE.md §8.2) : contrairement à `models.js`, qui fusionne
// tout un GLB en une géométrie, il GARDE la hiérarchie des pièces.
//
//   const rig = await loadRig(url, manifestEntry, { anim, targetHeight });
//   rig.kind === 'puppet'  → { anim, root, order, parts: { Body: { geometry, pivotMatrix, parent }, … }, height }
//                             géométries exprimées dans le repère de leur pivot (couleurs de sommets issues des
//                             matériaux ou échantillonnées dans la texture-palette), `pivotMatrix` relative au
//                             pivot du parent ; `order` : parents avant enfants.
//   rig.kind === 'skinned' → { anim, template (scène avec SkinnedMesh), clips: { idle, walk, run, fly, swim… },
//                             height, puppet } : le rendu clone `template` (SkeletonUtils.clone) ; `puppet` est
//                             une version pantin (sommets regroupés par os dominant) pour les instances au-delà
//                             du plafond de squelettes.
//   fallbackRig(anim, model, targetHeight) → pantin en primitives (corps, tête, membres) si le GLB manque.
//
// Pièces canoniques et hiérarchie : voir `puppet-pose.js`. Décodeur meshopt comme `models.js`.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { AnimationUtils } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PALETTE } from '../data/palette.js';
import { PUPPET_PARTS, rootPart, parentOf, canonicalPart } from './puppet-pose.js';

const DEG = Math.PI / 180;
/** Au-delà de ce rapport entre la taille lue et la taille cible, le modèle est remis à l'échelle. */
export const RESCALE_RATIO = 1.3;

// ---------------------------------------------------------------------------------------------
// Outils de géométrie (locaux : indépendants des évolutions de models.js).

const _color = new THREE.Color();

/** Copie Float32 dénormalisée d'un attribut. */
function toFloat32(attr, itemSize = attr.itemSize) {
  if (attr.array instanceof Float32Array && !attr.normalized && attr.itemSize === itemSize && !attr.isInterleavedBufferAttribute) return attr;
  const n = attr.count;
  const out = new Float32Array(n * itemSize);
  const get = [(i) => attr.getX(i), (i) => attr.getY(i), (i) => attr.getZ(i), (i) => attr.getW(i)];
  for (let i = 0; i < n; i++) for (let c = 0; c < itemSize; c++) out[i * itemSize + c] = c < attr.itemSize ? get[c](i) : 1;
  return new THREE.BufferAttribute(out, itemSize);
}

/** Ne garde que position, normal, color (+ uv à la demande), tout en Float32, et indexe. */
function normalizeGeometry(geometry, keepUv = false, keepSkin = false) {
  for (const name of Object.keys(geometry.attributes)) {
    if (name === 'position' || name === 'normal' || name === 'color') continue;
    if (keepUv && name === 'uv') continue;
    if (keepSkin && (name === 'skinIndex' || name === 'skinWeight')) continue;
    geometry.deleteAttribute(name);
  }
  geometry.morphAttributes = {};
  if (keepSkin && geometry.attributes.skinIndex) geometry.setAttribute('skinIndex', toFloat32(geometry.attributes.skinIndex, 4));
  if (keepSkin && geometry.attributes.skinWeight) geometry.setAttribute('skinWeight', toFloat32(geometry.attributes.skinWeight, 4));
  geometry.setAttribute('position', toFloat32(geometry.attributes.position, 3));
  if (!geometry.attributes.normal) geometry.computeVertexNormals();
  else geometry.setAttribute('normal', toFloat32(geometry.attributes.normal, 3));
  if (geometry.attributes.color) geometry.setAttribute('color', toFloat32(geometry.attributes.color, 3));
  if (keepUv && geometry.attributes.uv) geometry.setAttribute('uv', toFloat32(geometry.attributes.uv, 2));
  if (!geometry.index) {
    const n = geometry.attributes.position.count;
    const idx = n > 65535 ? new Uint32Array(n) : new Uint16Array(n);
    for (let i = 0; i < n; i++) idx[i] = i;
    geometry.setIndex(new THREE.BufferAttribute(idx, 1));
  }
  return geometry;
}

/** Couleur unie (linéaire) sur tous les sommets. */
function paintLinear(geometry, r, g, b) {
  const n = geometry.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = r; arr[i * 3 + 1] = g; arr[i * 3 + 2] = b; }
  geometry.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geometry;
}

/** Primitive peinte d'une teinte de la palette, prête à fusionner. */
function paint(geometry, hex) {
  _color.set(hex);
  normalizeGeometry(geometry, false);
  return paintLinear(geometry, _color.r, _color.g, _color.b);
}

/** Fusion de pièces peintes en une géométrie (groupes nettoyés, bornes calculées). */
function merge(parts) {
  const merged = parts.length === 1 ? parts[0] : mergeGeometries(parts, false);
  if (!merged) throw new Error('rigs : fusion de géométries impossible');
  merged.clearGroups();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

/** Pixels d'une texture (RGBA 8 bits) ou null si illisible (hors navigateur). */
function readTexturePixels(texture, cache) {
  if (cache.has(texture.uuid)) return cache.get(texture.uuid);
  let pixels = null;
  try {
    const image = texture.image;
    const width = image && (image.width || image.naturalWidth);
    const height = image && (image.height || image.naturalHeight);
    if (width && height) {
      const canvas = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(width, height)
        : (typeof document !== 'undefined' ? document.createElement('canvas') : null);
      if (canvas) {
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, 0, 0);
        pixels = { width, height, data: ctx.getImageData(0, 0, width, height).data };
      }
    }
  } catch (err) {
    console.warn('[rigs] texture illisible, couleur du matériau utilisée', err);
  }
  cache.set(texture.uuid, pixels);
  return pixels;
}

/** Couleurs de sommets d'une géométrie d'après son matériau (texture échantillonnée aux UV, ou couleur unie). */
function bakeColors(geometry, material, cache) {
  const tint = material && material.color ? material.color : { r: 1, g: 1, b: 1 };
  const map = material && material.map;
  const uv = geometry.attributes.uv;
  if (map && uv) {
    const pixels = readTexturePixels(map, cache);
    if (pixels) {
      const n = geometry.attributes.position.count;
      const out = new Float32Array(n * 3);
      map.updateMatrix();
      const m = map.matrix.elements;
      for (let i = 0; i < n; i++) {
        const u0 = uv.getX(i), v0 = uv.getY(i);
        let u = m[0] * u0 + m[3] * v0 + m[6];
        let v = m[1] * u0 + m[4] * v0 + m[7];
        u -= Math.floor(u); v -= Math.floor(v);
        const px = Math.min(pixels.width - 1, Math.floor(u * pixels.width));
        const row = map.flipY ? Math.floor((1 - v) * pixels.height) : Math.floor(v * pixels.height);
        const py = Math.min(pixels.height - 1, Math.max(0, row));
        const k = (py * pixels.width + px) * 4;
        out[i * 3] = srgbToLinear(pixels.data[k] / 255) * tint.r;
        out[i * 3 + 1] = srgbToLinear(pixels.data[k + 1] / 255) * tint.g;
        out[i * 3 + 2] = srgbToLinear(pixels.data[k + 2] / 255) * tint.b;
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(out, 3));
      geometry.deleteAttribute('uv');
      return geometry;
    }
  }
  geometry.deleteAttribute('uv');
  if (geometry.attributes.color) {
    const c = geometry.attributes.color.array;
    for (let i = 0; i < c.length; i += 3) { c[i] *= tint.r; c[i + 1] *= tint.g; c[i + 2] *= tint.b; }
  } else {
    paintLinear(geometry, tint.r, tint.g, tint.b);
  }
  return geometry;
}

/** Sous-géométrie d'un groupe de matériau (index découpé). */
function groupGeometry(geometry, group) {
  const g = geometry.clone();
  if (group && g.index) g.setIndex(new THREE.BufferAttribute(g.index.array.slice(group.start, group.start + group.count), 1));
  return g;
}

// ---------------------------------------------------------------------------------------------
// Construction d'un pantin : { kind, anim, root, order, parts, height }.

function finishPuppet(anim, parts, options = {}) {
  // Racine : la pièce sans parent (Body, ou Frame) ; s'il y en a plusieurs, la première devient racine
  // et les autres s'y rattachent (pivot relatif à l'origine).
  const names = Object.keys(parts);
  const roots = names.filter((n) => !parts[n].parent);
  const root = roots.includes(rootPart(anim)) ? rootPart(anim) : (roots[0] || names[0]);
  for (const n of roots) if (n !== root) parts[n].parent = root;
  if (parts[root].parent) parts[root].parent = null;
  // Les pièces dont le parent n'existe pas se rattachent à la racine.
  for (const n of names) if (parts[n].parent && !parts[parts[n].parent]) parts[n].parent = n === root ? null : root;
  const order = [];
  const pending = new Set(names.filter((n) => n !== root));
  order.push(root);
  while (pending.size) {
    let progressed = false;
    for (const n of Array.from(pending)) {
      if (order.includes(parts[n].parent)) { order.push(n); pending.delete(n); progressed = true; }
    }
    if (!progressed) { for (const n of pending) { parts[n].parent = root; order.push(n); } pending.clear(); }
  }
  for (const n of names) parts[n].geometry.computeBoundingBox();
  const rig = { kind: 'puppet', anim, root, order, parts, height: 0 };
  normalizePuppet(rig, options.targetHeight);
  return rig;
}

/** Matrices monde (pose de repos) de chaque pièce. */
function restMatrices(rig) {
  const world = {};
  for (const n of rig.order) {
    const part = rig.parts[n];
    const m = part.pivotMatrix.clone();
    if (part.parent) m.premultiply(world[part.parent]);
    world[n] = m;
  }
  return world;
}

/** Bornes du pantin au repos. */
function puppetBounds(rig) {
  const world = restMatrices(rig);
  const box = new THREE.Box3();
  const b = new THREE.Box3();
  for (const n of rig.order) {
    const g = rig.parts[n].geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    b.copy(g.boundingBox).applyMatrix4(world[n]);
    box.union(b);
  }
  return box;
}

/**
 * Pose le pantin sur y = 0 (ou le laisse flotter si `rig.float`), centre en X/Z, et le ramène à
 * `targetHeight` quand sa taille s'en écarte beaucoup (× 1,6 ou ÷ 1,6).
 */
function normalizePuppet(rig, targetHeight) {
  let box = puppetBounds(rig);
  let height = box.max.y - box.min.y;
  if (targetHeight && height > 1e-6 && (height > targetHeight * RESCALE_RATIO || height < targetHeight / RESCALE_RATIO)) {
    const s = targetHeight / height;
    for (const n of rig.order) {
      rig.parts[n].geometry.scale(s, s, s);
      rig.parts[n].geometry.computeBoundingBox();
      const e = rig.parts[n].pivotMatrix.elements;
      e[12] *= s; e[13] *= s; e[14] *= s;
    }
    box = puppetBounds(rig);
    height = box.max.y - box.min.y;
  }
  const root = rig.parts[rig.root];
  const e = root.pivotMatrix.elements;
  e[12] -= (box.min.x + box.max.x) / 2;
  e[14] -= (box.min.z + box.max.z) / 2;
  if (!rig.float) e[13] -= box.min.y;
  rig.height = height;
  rig.bounds = puppetBounds(rig);
  return rig;
}

/** Nom canonique d'un nœud d'après le manifeste (`parts: { clé: nomDeNœud }`) ou son propre nom. */
function partOfNode(name, entryParts) {
  if (!name) return null;
  if (entryParts) {
    for (const [key, nodeName] of Object.entries(entryParts)) {
      if (String(nodeName).toLowerCase() === name.toLowerCase()) return canonicalPart(key) || canonicalPart(nodeName);
    }
  }
  return canonicalPart(name);
}

/** Plus proche ancêtre (lui compris) qui soit une pièce. */
function nearestPartNode(node, partByNode) {
  for (let n = node; n; n = n.parent) if (partByNode.has(n)) return n;
  return null;
}

/** Pantin depuis une scène GLTF à nœuds rigides nommés. */
function puppetFromNodes(scene, entry, anim, options) {
  scene.updateMatrixWorld(true);
  const cache = options.textureCache || new Map();
  const partByNode = new Map();
  const nodeByPart = new Map();
  scene.traverse((node) => {
    if (node === scene) return;
    const p = partOfNode(node.name, entry.parts);
    if (p && !nodeByPart.has(p)) { partByNode.set(node, p); nodeByPart.set(p, node); }
  });
  const geoms = new Map(); // pièce → [géométries dans le repère du pivot]
  const inv = new THREE.Matrix4();
  const local = new THREE.Matrix4();
  const root = rootPart(anim);
  scene.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry) return;
    const partNode = nearestPartNode(obj, partByNode);
    const part = partNode ? partByNode.get(partNode) : (nodeByPart.has(root) ? root : '__root__');
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    const groups = obj.geometry.groups.length && Array.isArray(obj.material) ? obj.geometry.groups : [null];
    for (const group of groups) {
      const material = materials[group ? group.materialIndex : 0] || materials[0];
      const g = groupGeometry(obj.geometry, group);
      normalizeGeometry(g, Boolean(material && material.map));
      if (partNode) inv.copy(partNode.matrixWorld).invert(); else inv.identity();
      local.multiplyMatrices(inv, obj.matrixWorld);
      g.applyMatrix4(local);
      bakeColors(g, material, cache);
      if (!geoms.has(part)) geoms.set(part, []);
      geoms.get(part).push(g);
    }
  });
  if (!geoms.size) throw new Error('aucun mesh dans le GLB');
  const parts = {};
  for (const [part, node] of nodeByPart) {
    const list = geoms.get(part);
    if (!list) continue; // pièce sans géométrie : ignorée (son éventuelle descendance se rattache plus haut)
    const parentNode = node.parent ? nearestPartNode(node.parent, partByNode) : null;
    const pivot = new THREE.Matrix4();
    if (parentNode) pivot.copy(parentNode.matrixWorld).invert().multiply(node.matrixWorld);
    else pivot.copy(node.matrixWorld);
    parts[part] = { geometry: merge(list), pivotMatrix: pivot, parent: parentNode ? partByNode.get(parentNode) : null };
  }
  if (geoms.has('__root__')) {
    const list = geoms.get('__root__');
    if (parts[root]) {
      // Géométrie hors pièce : ramenée dans le repère de la racine.
      const inverse = nodeByPart.get(root).matrixWorld.clone().invert();
      for (const g of list) g.applyMatrix4(inverse);
      parts[root].geometry = merge([parts[root].geometry, ...list]);
    } else {
      parts[root] = { geometry: merge(list), pivotMatrix: new THREE.Matrix4(), parent: null };
    }
  }
  // Les pièces dont le parent est une pièce sans géométrie remontent au plus proche ancêtre valable.
  for (const name of Object.keys(parts)) {
    let parent = parts[name].parent;
    let node = nodeByPart.get(name);
    while (parent && !parts[parent]) {
      const parentNode = nodeByPart.get(parent);
      parts[name].pivotMatrix.premultiply(parentNode.matrix);
      const up = parentNode.parent ? nearestPartNode(parentNode.parent, partByNode) : null;
      parent = up ? partByNode.get(up) : null;
      node = parentNode;
    }
    parts[name].parent = parent;
  }
  return finishPuppet(anim, parts, options);
}

/**
 * Pantin depuis une scène SKINNÉE : chaque sommet rejoint la pièce de son os dominant (os nommé comme une
 * pièce canonique, sinon son plus proche ancêtre nommé) ; la géométrie est exprimée dans le repère de
 * l'os (pose de liaison = pose de repos) ; la hiérarchie des os donne les pivots.
 */
function puppetFromSkinned(scene, entry, anim, options) {
  scene.updateMatrixWorld(true);
  const cache = options.textureCache || new Map();
  const root = rootPart(anim);
  const geoms = new Map();
  const pivots = new Map(); // pièce → { node, parent }
  const tmp = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const m4 = new THREE.Matrix4();
  const m3 = new THREE.Matrix3();
  scene.traverse((obj) => {
    if (!obj.isSkinnedMesh) return;
    const skeleton = obj.skeleton;
    const bones = skeleton.bones;
    // Pièce de chaque os : son nom, sinon celui du plus proche ancêtre nommé, sinon la racine.
    const boneParts = bones.map((bone) => {
      for (let b = bone; b; b = b.parent) {
        if (!b.isBone && b !== bone) break;
        const p = partOfNode(b.name, entry.parts);
        if (p) return p;
      }
      return root;
    });
    const nodeOfPart = new Map();
    bones.forEach((bone, i) => {
      const p = boneParts[i];
      if (!nodeOfPart.has(p) && (partOfNode(bone.name, entry.parts) === p || p === root)) nodeOfPart.set(p, bone);
    });
    for (const [p, bone] of nodeOfPart) {
      if (pivots.has(p)) continue;
      let parentPart = null;
      for (let b = bone.parent; b && b.isBone; b = b.parent) {
        const q = partOfNode(b.name, entry.parts);
        if (q && q !== p && nodeOfPart.has(q)) { parentPart = q; break; }
      }
      pivots.set(p, { node: bone, parent: parentPart });
    }
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    const groups = obj.geometry.groups.length && Array.isArray(obj.material) ? obj.geometry.groups : [null];
    for (const group of groups) {
      const material = materials[group ? group.materialIndex : 0] || materials[0];
      const g = groupGeometry(obj.geometry, group);
      normalizeGeometry(g, Boolean(material && material.map), true);
      bakeColors(g, material, cache);
      const pos = g.attributes.position;
      const nor = g.attributes.normal;
      const col = g.attributes.color;
      const si = g.attributes.skinIndex;
      const sw = g.attributes.skinWeight;
      const index = g.index.array;
      // Os dominant de chaque sommet, pièce de chaque triangle (majorité).
      const vertexPart = new Array(pos.count);
      for (let i = 0; i < pos.count; i++) {
        let best = 0, bw = -1;
        for (let c = 0; c < 4; c++) {
          const w = sw ? [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)][c] : (c === 0 ? 1 : 0);
          if (w > bw) { bw = w; best = si ? [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)][c] : 0; }
        }
        vertexPart[i] = boneParts[best] || root;
      }
      const triByPart = new Map();
      for (let t = 0; t < index.length; t += 3) {
        const a = vertexPart[index[t]], b = vertexPart[index[t + 1]], c = vertexPart[index[t + 2]];
        const part = (a === b || a === c) ? a : (b === c ? b : a);
        if (!triByPart.has(part)) triByPart.set(part, []);
        triByPart.get(part).push(index[t], index[t + 1], index[t + 2]);
      }
      for (const [part, tris] of triByPart) {
        const pivot = pivots.get(part) || pivots.get(root);
        const boneIndex = pivot ? bones.indexOf(pivot.node) : -1;
        // repère de l'os : inverse de liaison × bindMatrix × position
        m4.identity();
        if (boneIndex >= 0) m4.copy(skeleton.boneInverses[boneIndex]);
        m4.multiply(obj.bindMatrix);
        m3.getNormalMatrix(m4);
        const remap = new Map();
        const positions = [], normals = [], colors = [], idx = [];
        for (const vi of tris) {
          let k = remap.get(vi);
          if (k === undefined) {
            k = positions.length / 3;
            remap.set(vi, k);
            tmp.fromBufferAttribute(pos, vi).applyMatrix4(m4);
            nrm.fromBufferAttribute(nor, vi).applyMatrix3(m3).normalize();
            positions.push(tmp.x, tmp.y, tmp.z);
            normals.push(nrm.x, nrm.y, nrm.z);
            colors.push(col.getX(vi), col.getY(vi), col.getZ(vi));
          }
          idx.push(k);
        }
        const pg = new THREE.BufferGeometry();
        pg.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        pg.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        pg.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        pg.setIndex(idx.length > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
        if (!geoms.has(part)) geoms.set(part, []);
        geoms.get(part).push(pg);
      }
    }
  });
  if (!geoms.size) throw new Error('aucun SkinnedMesh');
  const parts = {};
  for (const [part, list] of geoms) {
    const pivot = pivots.get(part);
    const matrix = new THREE.Matrix4();
    let parent = null;
    if (pivot) {
      const parentPivot = pivot.parent ? pivots.get(pivot.parent) : null;
      if (parentPivot) matrix.copy(parentPivot.node.matrixWorld).invert().multiply(pivot.node.matrixWorld);
      else matrix.copy(pivot.node.matrixWorld);
      parent = pivot.parent;
    }
    parts[part] = { geometry: merge(list), pivotMatrix: matrix, parent };
  }
  return finishPuppet(anim, parts, options);
}

/** Vrai si la scène contient un SkinnedMesh. */
function hasSkinnedMesh(scene) {
  let found = false;
  scene.traverse((o) => { if (o.isSkinnedMesh) found = true; });
  return found;
}

// ---------------------------------------------------------------------------------------------
// Squelettes.

const STATE_HINTS = {
  idle: [/idle/, /stand/, /rest/],
  walk: [/walk/, /march/],
  run: [/run/, /gallop/, /sprint/, /trot/],
  fly: [/fly/, /flap/, /glide/],
  swim: [/swim/],
  hover: [/hover/, /fly/],
  dive: [/dive/, /swim/],
};

/** Clips par état : d'après `entry.clips` (noms), `entry.clipRanges` (images), sinon par devinette sur les noms. */
function resolveClips(animations, entry) {
  const clips = {};
  if (!animations || !animations.length) return clips;
  const byName = (name) => animations.find((c) => c.name === name) || animations.find((c) => c.name.toLowerCase() === String(name).toLowerCase());
  if (entry.clips) {
    for (const [state, name] of Object.entries(entry.clips)) { const c = byName(name); if (c) clips[state] = c; }
  }
  if (entry.clipRanges) {
    const fps = entry.fps || 24;
    const source = (entry.clipSource && byName(entry.clipSource)) || animations[0];
    for (const [state, range] of Object.entries(entry.clipRanges)) {
      if (!Array.isArray(range) || range.length < 2) continue;
      clips[state] = AnimationUtils.subclip(source, state, range[0], range[1] + 1, fps);
    }
  }
  if (!Object.keys(clips).length) {
    for (const [state, hints] of Object.entries(STATE_HINTS)) {
      const c = animations.find((a) => hints.some((re) => re.test(a.name.toLowerCase())));
      if (c) clips[state] = c;
    }
    if (!clips.idle) clips.idle = animations[0];
  }
  return clips;
}

/** Vrai si deux matrices sont égales à 1e-6 près. */
function sameMatrix(a, b) {
  for (let i = 0; i < 16; i++) if (Math.abs(a.elements[i] - b.elements[i]) > 1e-6) return false;
  return true;
}

/**
 * Fusionne les SkinnedMesh d'un même squelette (une primitive par matériau chez Quaternius) en UN SEUL
 * SkinnedMesh à couleurs de sommets (matériau Lambert partagé) : un clone = un appel de dessin.
 * Les meshes dont les transformations locales ou matrices de liaison diffèrent sont laissés tels quels.
 */
export function mergeSkinnedMeshes(scene, cache = new Map()) {
  scene.updateMatrixWorld(true);
  const groups = new Map();
  scene.traverse((o) => {
    if (!o.isSkinnedMesh) return;
    if (!groups.has(o.skeleton)) groups.set(o.skeleton, []);
    groups.get(o.skeleton).push(o);
  });
  let merged = 0;
  for (const [skeleton, meshes] of groups) {
    const first = meshes[0];
    const multi = meshes.length > 1 || Array.isArray(first.material);
    const compatible = meshes.every((m) => m.parent === first.parent && sameMatrix(m.matrix, first.matrix) && sameMatrix(m.bindMatrix, first.bindMatrix));
    if (!compatible) continue;
    const parts = [];
    for (const m of meshes) {
      const materials = Array.isArray(m.material) ? m.material : [m.material];
      const grps = m.geometry.groups.length && Array.isArray(m.material) ? m.geometry.groups : [null];
      for (const g of grps) {
        const material = materials[g ? g.materialIndex : 0] || materials[0];
        const geo = groupGeometry(m.geometry, g);
        normalizeGeometry(geo, Boolean(material && material.map), true);
        bakeColors(geo, material, cache);
        if (geo.attributes.uv) geo.deleteAttribute('uv');
        if (!geo.attributes.skinIndex || !geo.attributes.skinWeight) { parts.length = 0; break; }
        parts.push(geo);
      }
      if (!parts.length) break;
    }
    if (!parts.length) continue;
    if (!multi && parts.length === 1 && !(first.material && first.material.map)) continue; // déjà minimal et sans texture
    const geometry = merge(parts);
    const material = new THREE.MeshLambertMaterial({ vertexColors: true });
    const sm = new THREE.SkinnedMesh(geometry, material);
    sm.name = first.name || 'skinned';
    sm.position.copy(first.position); sm.quaternion.copy(first.quaternion); sm.scale.copy(first.scale);
    sm.frustumCulled = false;
    first.parent.add(sm);
    sm.bind(skeleton, first.bindMatrix);
    for (const m of meshes) m.parent.remove(m);
    merged++;
  }
  scene.updateMatrixWorld(true);
  return merged;
}

function skinnedRig(gltf, entry, anim, options) {
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);
  try {
    mergeSkinnedMeshes(scene, options.textureCache || new Map());
  } catch (err) {
    console.warn('[rigs] fusion des meshes skinnés impossible', err);
  }
  const box = new THREE.Box3().setFromObject(scene);
  let height = box.max.y - box.min.y;
  const target = options.targetHeight;
  if (target && height > 1e-6 && (height > target * RESCALE_RATIO || height < target / RESCALE_RATIO)) {
    const s = target / height;
    scene.scale.multiplyScalar(s);
    scene.updateMatrixWorld(true);
    box.setFromObject(scene);
    height = box.max.y - box.min.y;
  }
  scene.position.x -= (box.min.x + box.max.x) / 2;
  scene.position.z -= (box.min.z + box.max.z) / 2;
  if (!options.float) scene.position.y -= box.min.y;
  scene.updateMatrixWorld(true);
  scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false; } });
  const clips = resolveClips(gltf.animations, entry);
  let puppet = null;
  try {
    puppet = puppetFromSkinned(gltf.scene, entry, anim, { ...options, textureCache: new Map() });
  } catch (err) {
    console.warn('[rigs] pantin dérivé du squelette impossible', err);
  }
  return { kind: 'skinned', anim, template: scene, clips, height, puppet, entry };
}

// ---------------------------------------------------------------------------------------------
// Chargement.

let sharedLoader = null;

async function defaultLoader() {
  if (sharedLoader) return sharedLoader;
  const loader = new GLTFLoader();
  try {
    await MeshoptDecoder.ready;
    loader.setMeshoptDecoder(MeshoptDecoder);
  } catch (err) {
    console.warn('[rigs] décodeur meshopt indisponible', err);
  }
  sharedLoader = loader;
  return loader;
}

/**
 * Charge un modèle animé. `entry` : entrée du manifeste (`rig`, `parts`, `clips`, `clipRanges`, `fps`,
 * `anim`) ; `options` : { anim, targetHeight, float (ne pas poser sur y = 0 : insectes, oiseaux en vol),
 * loader (injection) }. Rejette si le fichier est illisible : l'appelant se replie sur `fallbackRig`.
 */
export async function loadRig(url, entry = {}, options = {}) {
  const loader = options.loader || await defaultLoader();
  const gltf = await loader.loadAsync(url);
  return rigFromGltf(gltf, entry, options);
}

/** Construit un rig depuis un GLTF déjà chargé (tests, préchargement). */
export function rigFromGltf(gltf, entry = {}, options = {}) {
  const anim = entry.anim || options.anim || 'biped';
  const opts = { ...options, textureCache: new Map() };
  const skinned = hasSkinnedMesh(gltf.scene);
  if (entry.rig === 'skinned' || (entry.rig !== 'puppet' && skinned && gltf.animations && gltf.animations.length)) {
    return skinnedRig(gltf, entry, anim, opts);
  }
  const rig = skinned ? puppetFromSkinned(gltf.scene, entry, anim, opts) : puppetFromNodes(gltf.scene, entry, anim, opts);
  rig.entry = entry;
  return rig;
}

// ---------------------------------------------------------------------------------------------
// Pantins de repli en primitives.

function box(w, h, d, hex, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return paint(g, hex);
}

function ball(r, hex, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, detail = 8) {
  const g = new THREE.SphereGeometry(r, detail, Math.max(4, Math.round(detail * 0.75)));
  g.scale(sx, sy, sz);
  g.translate(x, y, z);
  return paint(g, hex);
}

/** Cône pointant vers −Z (queue) ou +Z (bec) : `dir` = ±1. */
function spike(r, length, hex, x, y, z, dir = 1) {
  const g = new THREE.ConeGeometry(r, length, 6);
  g.rotateX(dir > 0 ? Math.PI / 2 : -Math.PI / 2);
  g.translate(x, y, z + dir * length / 2);
  return paint(g, hex);
}

/** Roue : cylindre d'axe X. */
function wheel(r, thickness, hex) {
  const g = new THREE.CylinderGeometry(r, r, thickness, 12);
  g.rotateZ(Math.PI / 2);
  return paint(g, hex);
}

function part(parts, name, geometries, pivot, parent) {
  const pivotMatrix = new THREE.Matrix4().makeTranslation(pivot[0], pivot[1], pivot[2]);
  parts[name] = { geometry: merge(geometries), pivotMatrix, parent };
}

/** Couleurs des pantins de repli par modèle. */
const FALLBACK_COLORS = {
  'citizen-a': { shirt: PALETTE.roofRed, pants: PALETTE.roofSlate, skin: PALETTE.wallBeige, hair: PALETTE.wood },
  'citizen-b': { shirt: PALETTE.forestDark, pants: PALETTE.asphalt, skin: PALETTE.wallTan, hair: PALETTE.asphalt },
  'citizen-c': { shirt: PALETTE.river, pants: PALETTE.wallTan, skin: PALETTE.wallCream, hair: PALETTE.sun },
  cyclist: { shirt: PALETTE.sun, pants: PALETTE.asphalt, skin: PALETTE.wallBeige, hair: PALETTE.wood },
  deer: { fur: PALETTE.wood, belly: PALETTE.wallTan, dark: PALETTE.asphalt, accent: PALETTE.wallCream },
  fox: { fur: PALETTE.roofOrange, belly: PALETTE.wallCream, dark: PALETTE.asphalt, accent: PALETTE.marking },
  duck: { body: PALETTE.wallCream, head: PALETTE.forestDark, beak: PALETTE.sun, dark: PALETTE.roofOrange },
  owl: { body: PALETTE.wallTan, head: PALETTE.wallCream, beak: PALETTE.sun, dark: PALETTE.wood },
  heron: { body: PALETTE.sidewalk, neck: PALETTE.wallCream, beak: PALETTE.sun, dark: PALETTE.asphalt },
  otter: { fur: PALETTE.wood, belly: PALETTE.wallTan, dark: PALETTE.asphalt },
  bee: { body: PALETTE.sun, stripe: PALETTE.asphalt, wing: PALETTE.marking },
  swallow: { body: PALETTE.roofSlate, belly: PALETTE.wallCream, wing: PALETTE.asphalt },
};

const GENERIC = { shirt: PALETTE.roofOrange, pants: PALETTE.asphalt, skin: PALETTE.wallBeige, hair: PALETTE.wood, fur: PALETTE.wallTan, belly: PALETTE.wallCream, dark: PALETTE.asphalt, accent: PALETTE.marking, body: PALETTE.wallTan, head: PALETTE.wallCream, beak: PALETTE.sun, neck: PALETTE.wallCream, stripe: PALETTE.asphalt, wing: PALETTE.marking };

/**
 * Pantin en primitives pour un type d'animation (quand le GLB manque). Taille ramenée à `targetHeight`
 * (hauteur au repos, pieds sur y = 0 ; les volants gardent leur centre à l'origine).
 */
export function fallbackRig(anim, model = '', targetHeight = null) {
  const c = { ...GENERIC, ...(FALLBACK_COLORS[model] || {}) };
  const parts = {};
  let float = false;
  switch (anim) {
    case 'quadruped': {
      const fox = model === 'fox';
      const legH = 0.13, bodyL = 0.26;
      part(parts, 'Body', [box(0.1, 0.1, bodyL, c.fur, 0, 0.05, 0), box(0.08, 0.03, bodyL * 0.8, c.belly, 0, -0.005, 0)], [0, legH, 0], null);
      const legs = { LegFL: [-0.035, 0.09], LegFR: [0.035, 0.09], LegBL: [-0.035, -0.09], LegBR: [0.035, -0.09] };
      for (const [name, [x, z]] of Object.entries(legs)) part(parts, name, [box(0.025, legH, 0.025, c.dark, 0, -legH / 2, 0)], [x, 0, z], 'Body');
      part(parts, 'Neck', [box(0.05, 0.11, 0.05, c.fur, 0, 0.05, 0.015)], [0, 0.085, 0.11], 'Body');
      const head = [box(0.055, 0.055, 0.09, c.fur, 0, 0.02, 0.03), box(0.03, 0.02, 0.03, c.dark, 0, 0.005, 0.08)];
      if (fox) {
        head.push(box(0.012, 0.03, 0.012, c.fur, -0.02, 0.06, 0.01), box(0.012, 0.03, 0.012, c.fur, 0.02, 0.06, 0.01));
      } else {
        for (const s of [-1, 1]) head.push(box(0.008, 0.08, 0.008, c.accent, s * 0.02, 0.085, 0.02), box(0.03, 0.008, 0.008, c.accent, s * 0.03, 0.1, 0.02));
      }
      part(parts, 'Head', head, [0, 0.105, 0.02], 'Neck');
      part(parts, 'Tail', fox ? [box(0.035, 0.035, 0.1, c.fur, 0, -0.01, -0.05), box(0.03, 0.03, 0.03, c.accent, 0, -0.01, -0.1)] : [box(0.02, 0.025, 0.05, c.belly, 0, 0, -0.025)], [0, 0.08, -bodyL / 2], 'Body');
      break;
    }
    case 'bird': {
      const owl = model === 'owl';
      const legH = owl ? 0.012 : 0.02;
      if (owl) {
        part(parts, 'Body', [ball(0.035, c.body, 0, 0.045, 0, 1, 1.3, 0.9)], [0, legH, 0], null);
        part(parts, 'Head', [ball(0.03, c.head, 0, 0.02, 0, 1, 0.9, 0.9), ball(0.008, c.dark, -0.012, 0.025, 0.024), ball(0.008, c.dark, 0.012, 0.025, 0.024), spike(0.005, 0.012, c.beak, 0, 0.012, 0.025, 1), box(0.01, 0.015, 0.01, c.body, -0.018, 0.045, 0), box(0.01, 0.015, 0.01, c.body, 0.018, 0.045, 0)], [0, 0.085, 0.005], 'Body');
        part(parts, 'WingL', [box(0.012, 0.07, 0.04, c.dark, -0.004, -0.035, 0)], [-0.032, 0.07, 0], 'Body');
        part(parts, 'WingR', [box(0.012, 0.07, 0.04, c.dark, 0.004, -0.035, 0)], [0.032, 0.07, 0], 'Body');
        part(parts, 'Tail', [box(0.03, 0.01, 0.03, c.dark, 0, 0, -0.015)], [0, 0.02, -0.03], 'Body');
      } else {
        part(parts, 'Body', [ball(0.035, c.body, 0, 0.03, 0, 1, 0.8, 1.4)], [0, legH, 0], null);
        part(parts, 'Head', [ball(0.022, c.head, 0, 0.012, 0, 1, 1, 1.1), box(0.016, 0.008, 0.028, c.beak, 0, 0.004, 0.03)], [0, 0.05, 0.038], 'Body');
        part(parts, 'WingL', [box(0.05, 0.008, 0.06, c.dark, -0.025, 0, -0.005)], [-0.03, 0.04, 0], 'Body');
        part(parts, 'WingR', [box(0.05, 0.008, 0.06, c.dark, 0.025, 0, -0.005)], [0.03, 0.04, 0], 'Body');
        part(parts, 'Tail', [box(0.02, 0.01, 0.03, c.body, 0, 0.005, -0.015)], [0, 0.04, -0.045], 'Body');
      }
      part(parts, 'LegL', [box(0.006, legH, 0.006, c.beak, 0, -legH / 2, 0), box(0.014, 0.004, 0.018, c.beak, 0, -legH, 0.005)], [-0.012, 0, 0], 'Body');
      part(parts, 'LegR', [box(0.006, legH, 0.006, c.beak, 0, -legH / 2, 0), box(0.014, 0.004, 0.018, c.beak, 0, -legH, 0.005)], [0.012, 0, 0], 'Body');
      break;
    }
    case 'flyer': {
      float = true;
      if (model === 'bee') {
        part(parts, 'Body', [ball(0.02, c.body, 0, 0, 0, 1, 1, 1.5), box(0.042, 0.042, 0.008, c.stripe, 0, 0, -0.005), box(0.038, 0.038, 0.008, c.stripe, 0, 0, -0.018)], [0, 0, 0], null);
        part(parts, 'Head', [ball(0.012, c.stripe, 0, 0, 0.006)], [0, 0.004, 0.03], 'Body');
        part(parts, 'WingL', [box(0.036, 0.003, 0.016, c.wing, -0.018, 0, 0)], [-0.012, 0.016, 0], 'Body');
        part(parts, 'WingR', [box(0.036, 0.003, 0.016, c.wing, 0.018, 0, 0)], [0.012, 0.016, 0], 'Body');
      } else {
        part(parts, 'Body', [ball(0.02, c.body, 0, 0, 0, 1, 0.9, 2.2), ball(0.018, c.belly, 0, -0.006, 0.004, 0.9, 0.6, 1.8)], [0, 0, 0], null);
        part(parts, 'Head', [ball(0.015, c.body, 0, 0.002, 0.006), spike(0.004, 0.012, c.wing, 0, 0, 0.018, 1)], [0, 0.006, 0.04], 'Body');
        part(parts, 'WingL', [box(0.09, 0.004, 0.035, c.wing, -0.045, 0, -0.008)], [-0.015, 0.008, 0.005], 'Body');
        part(parts, 'WingR', [box(0.09, 0.004, 0.035, c.wing, 0.045, 0, -0.008)], [0.015, 0.008, 0.005], 'Body');
        const tailL = new THREE.BoxGeometry(0.006, 0.003, 0.05); tailL.translate(0, 0, -0.025); tailL.rotateY(0.25);
        const tailR = new THREE.BoxGeometry(0.006, 0.003, 0.05); tailR.translate(0, 0, -0.025); tailR.rotateY(-0.25);
        part(parts, 'Tail', [paint(tailL, c.wing), paint(tailR, c.wing)], [0, 0, -0.04], 'Body');
      }
      break;
    }
    case 'wader': {
      const legH = 0.14;
      part(parts, 'Body', [ball(0.04, c.body, 0, 0.035, 0, 0.9, 0.9, 1.6)], [0, legH, 0], null);
      part(parts, 'LegL', [box(0.008, legH, 0.008, c.dark, 0, -legH / 2, 0)], [-0.015, 0, 0], 'Body');
      part(parts, 'LegR', [box(0.008, legH, 0.008, c.dark, 0, -legH / 2, 0)], [0.015, 0, 0], 'Body');
      part(parts, 'WingL', [box(0.12, 0.006, 0.07, c.body, -0.06, 0, -0.01)], [-0.03, 0.06, 0], 'Body');
      part(parts, 'WingR', [box(0.12, 0.006, 0.07, c.body, 0.06, 0, -0.01)], [0.03, 0.06, 0], 'Body');
      part(parts, 'Neck', [box(0.015, 0.12, 0.015, c.neck, 0, 0.06, 0.01)], [0, 0.06, 0.06], 'Body');
      part(parts, 'Head', [ball(0.018, c.body, 0, 0.005, 0, 1, 0.9, 1.2), spike(0.006, 0.05, c.beak, 0, 0.002, 0.018, 1)], [0, 0.12, 0.015], 'Neck');
      break;
    }
    case 'swimmer': {
      float = true;
      part(parts, 'Body', [ball(0.03, c.fur, 0, 0.012, 0, 1, 0.75, 3.4), box(0.035, 0.01, 0.12, c.belly, 0, 0.03, 0)], [0, 0, 0], null);
      part(parts, 'Head', [ball(0.025, c.fur, 0, 0.004, 0.01, 1, 0.9, 1.1), ball(0.008, c.dark, 0, 0, 0.034)], [0, 0.03, 0.1], 'Body');
      part(parts, 'Tail', [spike(0.018, 0.13, c.fur, 0, 0, 0, -1)], [0, 0.015, -0.1], 'Body');
      break;
    }
    case 'wheeled': {
      const r = 0.045;
      part(parts, 'Frame', [box(0.004, 0.004, 0.11, c.dark, 0, 0.0, 0), box(0.004, 0.05, 0.004, c.dark, 0, 0.025, -0.02), box(0.004, 0.05, 0.004, c.dark, 0, 0.025, 0.05), box(0.06, 0.004, 0.004, c.dark, 0, 0.05, 0.05)], [0, r, 0], null);
      part(parts, 'WheelF', [wheel(r, 0.008, c.dark)], [0, 0, 0.06], 'Frame');
      part(parts, 'WheelB', [wheel(r, 0.008, c.dark)], [0, 0, -0.06], 'Frame');
      part(parts, 'Body', [box(0.05, 0.08, 0.04, c.shirt, 0, 0.04, 0.01), box(0.02, 0.07, 0.02, c.shirt, -0.03, 0.03, 0.03), box(0.02, 0.07, 0.02, c.shirt, 0.03, 0.03, 0.03)], [0, 0.065, -0.02], 'Frame');
      part(parts, 'Head', [ball(0.03, c.skin, 0, 0.03, 0), ball(0.03, c.hair, 0, 0.038, -0.004, 1.02, 0.6, 1.02)], [0, 0.08, 0.01], 'Body');
      part(parts, 'LegL', [box(0.02, 0.07, 0.02, c.pants, 0, -0.035, 0)], [-0.02, 0.005, 0], 'Body');
      part(parts, 'LegR', [box(0.02, 0.07, 0.02, c.pants, 0, -0.035, 0)], [0.02, 0.005, 0], 'Body');
      break;
    }
    case 'vehicle': {
      part(parts, 'Body', [box(0.14, 0.06, 0.26, c.shirt, 0, 0.05, 0), box(0.12, 0.05, 0.14, c.skin, 0, 0.105, -0.02)], [0, 0, 0], null);
      break;
    }
    case 'biped':
    default: {
      const legH = 0.09, bodyH = 0.09;
      part(parts, 'Body', [box(0.08, bodyH, 0.05, c.shirt, 0, bodyH / 2, 0)], [0, legH, 0], null);
      part(parts, 'Head', [ball(0.042, c.skin, 0, 0.04, 0), ball(0.043, c.hair, 0, 0.05, -0.006, 1, 0.7, 1), box(0.012, 0.012, 0.01, c.skin, 0, 0.035, 0.042)], [0, bodyH, 0], 'Body');
      part(parts, 'ArmL', [box(0.022, 0.07, 0.022, c.shirt, 0, -0.035, 0), box(0.02, 0.018, 0.02, c.skin, 0, -0.078, 0)], [-0.052, bodyH - 0.008, 0], 'Body');
      part(parts, 'ArmR', [box(0.022, 0.07, 0.022, c.shirt, 0, -0.035, 0), box(0.02, 0.018, 0.02, c.skin, 0, -0.078, 0)], [0.052, bodyH - 0.008, 0], 'Body');
      part(parts, 'LegL', [box(0.03, legH, 0.035, c.pants, 0, -legH / 2, 0)], [-0.021, 0, 0], 'Body');
      part(parts, 'LegR', [box(0.03, legH, 0.035, c.pants, 0, -legH / 2, 0)], [0.021, 0, 0], 'Body');
    }
  }
  const rig = { kind: 'puppet', anim, root: rootPart(anim), order: [], parts, height: 0, float, fallback: true };
  const names = Object.keys(parts);
  rig.order = names.filter((n) => !parts[n].parent).concat(names.filter((n) => parts[n].parent));
  // Ordre parents → enfants (Neck avant Head, Body avant le reste).
  const order = [];
  const pending = new Set(rig.order);
  while (pending.size) {
    for (const n of Array.from(pending)) {
      const p = parts[n].parent;
      if (!p || order.includes(p)) { order.push(n); pending.delete(n); }
    }
  }
  rig.order = order;
  // Taille exacte demandée pour les pantins de repli.
  if (targetHeight) {
    const box0 = puppetBounds(rig);
    const h = box0.max.y - box0.min.y;
    if (h > 1e-6) {
      const s = targetHeight / h;
      for (const n of rig.order) {
        parts[n].geometry.scale(s, s, s); parts[n].geometry.computeBoundingBox();
        const e = parts[n].pivotMatrix.elements; e[12] *= s; e[13] *= s; e[14] *= s;
      }
    }
  }
  return normalizePuppet(rig, null);
}

/** Vrai pour les pièces attendues par l'animation et absentes du rig (information de débogage). */
export function missingParts(rig) {
  const expected = PUPPET_PARTS[rig.anim] || [];
  return expected.filter((p) => !rig.parts[p]);
}

/** Libère les géométries d'un rig pantin (les squelettes partagent leurs géométries entre clones : non libérées ici). */
export function disposeRig(rig) {
  if (!rig) return;
  if (rig.kind === 'puppet') for (const n of Object.keys(rig.parts)) rig.parts[n].geometry.dispose();
  if (rig.puppet) disposeRig(rig.puppet);
}

export { parentOf };
