#!/usr/bin/env node
// Importe les modèles 3D des kits bruts (assets/models/raw/, voir tools/fetch-kits.js) et produit les
// GLB normalisés de Tiletown dans assets/models/, d'après tools/model-map.js, plus le manifeste
// assets/models/manifest.json (docs/ARCHITECTURE.md §5).
//
// Normalisation de chaque modèle :
//   - échelle (1 case = 1 u ; bâtiments ramenés à ≈ 0,85 u d'empreinte), lacet pour regarder vers +Z,
//     centré en x/z, posé sur y = 0, transformations cuites dans les sommets ;
//   - couleurs : la texture-palette du kit (colormap.png) est quantifiée pixel par pixel vers la palette
//     commune (src/data/palette.js) et réencodée en PNG indexé ; les matériaux sans texture reçoivent
//     un baseColorFactor quantifié ; tous : metallic 0, roughness 1, sans « unlit » ;
//   - assemblages (école, mairie, parc…) : pièces de plusieurs kits et primitives (boîtes, cylindres,
//     cônes) aux couleurs de la palette, fusionnées dans un seul document ;
//   - dedup, join (une primitive par matériau), weld, prune, compression meshopt (+ quantification).
//
// Usage :
//   node tools/import-models.js                 tout le catalogue
//   node tools/import-models.js house-a park    seulement ces identifiants
//   node tools/import-models.js --verbose
// Un identifiant dont la source manque est signalé et absent du manifeste (le rendu affichera une
// boîte de remplacement).

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { dirname, join as joinPath, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Document, Logger, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, join, flatten, meshopt, getBounds, transformMesh, clearNodeTransform, mergeDocuments, unpartition } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { PNG } from 'pngjs';
import { PALETTE, PALETTE_LIST, hexToRgb, nearestPaletteHex } from '../src/data/palette.js';
import { MODEL_MAP, KIT_MATERIALS, kitUrl, kitManifestName } from './model-map.js';
import { KITS, kitDir } from './fetch-kits.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = joinPath(ROOT, 'assets', 'models');
const MANIFEST_PATH = joinPath(OUT_DIR, 'manifest.json');
const LICENSE_PATH = joinPath(OUT_DIR, 'LICENSE-kenney.txt');
const UNIT = '1 case = 1 unité, origine au centre de la case, y vers le haut, face +Z (sud)';

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');
const ONLY = args.filter((a) => !a.startsWith('--'));
const log = (...m) => console.log(...m);
const vlog = (...m) => { if (VERBOSE) console.log('   ', ...m); };

// ─── Couleurs ───────────────────────────────────────────────────────────────────────────────────

const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const PALETTE_INDEX = new Map(PALETTE_LIST.map((hex, i) => [hex, i]));
const PALETTE_ROLE = new Map(Object.entries(PALETTE).map(([role, hex]) => [hex, role]));

/** Rôle de palette → baseColorFactor linéaire. */
function roleToLinearFactor(role) {
  const hex = PALETTE[role];
  if (!hex) throw new Error(`rôle de palette inconnu : ${role}`);
  const [r, g, b] = hexToRgb(hex).map((v) => toLinear(v / 255));
  return [r, g, b, 1];
}

/** baseColorFactor linéaire → teinte de palette la plus proche (comparée en sRGB). */
function quantizeFactor(factor) {
  const rgb = factor.slice(0, 3).map((c) => Math.round(toSrgb(Math.min(1, Math.max(0, c))) * 255));
  return nearestPaletteHex(rgb);
}

/** PNG indexé minimal (8 bits, palette ≤ 256 couleurs) : IHDR, PLTE, IDAT (filtre 0), IEND. */
function encodeIndexedPng(width, height, indices, paletteHexes) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type, 'latin1');
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
    return Buffer.concat([len, typeBuf, data, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 3; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const plte = Buffer.alloc(paletteHexes.length * 3);
  paletteHexes.forEach((hex, i) => { const [r, g, b] = hexToRgb(hex); plte[i * 3] = r; plte[i * 3 + 1] = g; plte[i * 3 + 2] = b; });
  const raw = Buffer.alloc((width + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width + 1)] = 0;
    raw.set(indices.subarray(y * width, (y + 1) * width), y * (width + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('PLTE', plte), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/** Cache : empreinte de l'image source → PNG indexé quantifié. */
const quantizedTextureCache = new Map();

/** Quantifie la texture-palette d'un kit : chaque pixel → teinte la plus proche de la palette commune. */
function quantizeTextureImage(imageBytes) {
  const hash = createHash('sha1').update(imageBytes).digest('hex');
  const cached = quantizedTextureCache.get(hash);
  if (cached) return cached;
  const png = PNG.sync.read(Buffer.from(imageBytes));
  const { width, height, data } = png;
  const indices = new Uint8Array(width * height);
  const seen = new Map();
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const key = (r << 16) | (g << 8) | b;
    let idx = seen.get(key);
    if (idx === undefined) {
      idx = PALETTE_INDEX.get(nearestPaletteHex([r, g, b]));
      seen.set(key, idx);
    }
    indices[i] = idx;
  }
  const out = { bytes: encodeIndexedPng(width, height, indices, PALETTE_LIST), width, height, sourceColors: seen.size };
  quantizedTextureCache.set(hash, out);
  return out;
}

// ─── Lecture des sources ────────────────────────────────────────────────────────────────────────

const QUIET = new Logger(Logger.Verbosity.ERROR);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder }).setLogger(QUIET);

/** Chemin d'un GLB source dans le kit (les kits Kenney rangent les GLB dans « Models/GLB format/ » ou « Models/GLTF format/ »). */
function sourcePath(kit, file) {
  const base = kitDir(kit);
  for (const sub of ['Models/GLB format', 'Models/GLTF format', 'Models', '']) {
    const p = joinPath(base, sub, file);
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * Prépare un document source : matériaux quantifiés vers la palette, textures quantifiées,
 * tangentes supprimées, paramètres unifiés (metallic 0, roughness 1, sans unlit).
 */
function prepareMaterials(doc, kit, materialOverrides = {}) {
  const root = doc.getRoot();
  for (const material of root.listMaterials()) {
    const name = material.getName();
    material.setMetallicFactor(0).setRoughnessFactor(1).setEmissiveFactor([0, 0, 0]).setAlphaMode('OPAQUE');
    material.setExtension('KHR_materials_unlit', null);
    material.setMetallicRoughnessTexture(null).setNormalTexture(null).setOcclusionTexture(null).setEmissiveTexture(null);
    const override = materialOverrides[name];
    if (override) {
      material.setBaseColorTexture(null).setBaseColorFactor(roleToLinearFactor(override)).setName(`flat-${override}`);
      continue;
    }
    const texture = material.getBaseColorTexture();
    if (texture) {
      const q = quantizeTextureImage(texture.getImage());
      texture.setImage(q.bytes).setMimeType('image/png').setName(`palette-${kit}`);
      material.setBaseColorFactor([1, 1, 1, 1]).setName(`palette-${kit}`);
      vlog(`texture ${kit} : ${q.width}×${q.height}, ${q.sourceColors} couleurs source → palette`);
    } else {
      const hex = quantizeFactor(material.getBaseColorFactor());
      material.setBaseColorFactor(roleToLinearFactor(PALETTE_ROLE.get(hex))).setName(`flat-${PALETTE_ROLE.get(hex)}`);
    }
  }
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const tangent = prim.getAttribute('TANGENT');
      if (tangent) prim.setAttribute('TANGENT', null);
      for (let i = 1; i < 8; i++) {
        const uv = prim.getAttribute(`TEXCOORD_${i}`);
        if (uv) prim.setAttribute(`TEXCOORD_${i}`, null);
      }
    }
  }
}

// ─── Primitives procédurales (boîte, cylindre, cône) aux couleurs de la palette ────────────────

/** Géométrie d'une boîte posée sur y = 0, centrée en x/z, normales plates. */
function boxGeometry([w, h, d]) {
  const hx = w / 2, hz = d / 2;
  const faces = [
    { n: [0, 0, 1], v: [[-hx, 0, hz], [hx, 0, hz], [hx, h, hz], [-hx, h, hz]] },
    { n: [0, 0, -1], v: [[hx, 0, -hz], [-hx, 0, -hz], [-hx, h, -hz], [hx, h, -hz]] },
    { n: [1, 0, 0], v: [[hx, 0, hz], [hx, 0, -hz], [hx, h, -hz], [hx, h, hz]] },
    { n: [-1, 0, 0], v: [[-hx, 0, -hz], [-hx, 0, hz], [-hx, h, hz], [-hx, h, -hz]] },
    { n: [0, 1, 0], v: [[-hx, h, hz], [hx, h, hz], [hx, h, -hz], [-hx, h, -hz]] },
    { n: [0, -1, 0], v: [[-hx, 0, -hz], [hx, 0, -hz], [hx, 0, hz], [-hx, 0, hz]] },
  ];
  const positions = [], normals = [], indices = [];
  for (const f of faces) {
    const base = positions.length / 3;
    for (const p of f.v) { positions.push(...p); normals.push(...f.n); }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { positions, normals, indices };
}

/** Cylindre (ou cône si topRadius = 0) posé sur y = 0 ; facettes plates ; renvoie côté et chapeau séparés. */
function cylinderGeometry(radius, height, segments = 16, topRadius = radius) {
  const side = { positions: [], normals: [], indices: [] };
  const cap = { positions: [], normals: [], indices: [] };
  const bottom = { positions: [], normals: [], indices: [] };
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2, a1 = ((i + 1) / segments) * Math.PI * 2;
    const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
    const am = (a0 + a1) / 2;
    // normale de la facette, inclinée pour un cône
    const slope = (radius - topRadius) / height;
    const nl = Math.hypot(1, slope);
    const n = [Math.cos(am) / nl, slope / nl, Math.sin(am) / nl];
    const b = side.positions.length / 3;
    side.positions.push(radius * c0, 0, radius * s0, radius * c1, 0, radius * s1, topRadius * c1, height, topRadius * s1, topRadius * c0, height, topRadius * s0);
    for (let k = 0; k < 4; k++) side.normals.push(...n);
    if (topRadius > 0) side.indices.push(b, b + 2, b + 1, b, b + 3, b + 2);
    else side.indices.push(b, b + 2, b + 1);
    if (topRadius > 0) {
      const cb = cap.positions.length / 3;
      cap.positions.push(0, height, 0, topRadius * c0, height, topRadius * s0, topRadius * c1, height, topRadius * s1);
      cap.normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
      cap.indices.push(cb, cb + 2, cb + 1);
    }
    const bb = bottom.positions.length / 3;
    bottom.positions.push(0, 0, 0, radius * c0, 0, radius * s0, radius * c1, 0, radius * s1);
    bottom.normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0);
    bottom.indices.push(bb, bb + 1, bb + 2);
  }
  return { side, cap, bottom };
}

/** Matériau plat d'un rôle de palette, partagé dans le document. */
function flatMaterial(doc, role) {
  const name = `flat-${role}`;
  const existing = doc.getRoot().listMaterials().find((m) => m.getName() === name && !m.getBaseColorTexture());
  if (existing) return existing;
  return doc.createMaterial(name).setBaseColorFactor(roleToLinearFactor(role)).setMetallicFactor(0).setRoughnessFactor(1);
}

function addGeometry(doc, buffer, node, geom, material) {
  if (!geom.indices.length) return;
  const pos = doc.createAccessor().setType('VEC3').setArray(new Float32Array(geom.positions)).setBuffer(buffer);
  const nor = doc.createAccessor().setType('VEC3').setArray(new Float32Array(geom.normals)).setBuffer(buffer);
  const idx = doc.createAccessor().setType('SCALAR').setArray(new Uint16Array(geom.indices)).setBuffer(buffer);
  const prim = doc.createPrimitive().setAttribute('POSITION', pos).setAttribute('NORMAL', nor).setIndices(idx).setMaterial(material);
  let mesh = node.getMesh();
  if (!mesh) { mesh = doc.createMesh(); node.setMesh(mesh); }
  mesh.addPrimitive(prim);
}

/** Ajoute une primitive du plan (box, cylinder, cone) à la scène. */
function addPrimitivePart(doc, buffer, scene, part) {
  const node = doc.createNode(`${part.primitive}-${part.color}`).setTranslation(part.at || [0, 0, 0]);
  if (part.yaw) node.setRotation(quatY(part.yaw));
  const material = flatMaterial(doc, part.color);
  if (part.primitive === 'box') {
    addGeometry(doc, buffer, node, boxGeometry(part.size), material);
  } else if (part.primitive === 'cylinder' || part.primitive === 'cone') {
    const topRadius = part.primitive === 'cone' ? 0 : part.radius;
    const { side, cap, bottom } = cylinderGeometry(part.radius, part.height, part.segments || 16, topRadius);
    addGeometry(doc, buffer, node, side, material);
    if (cap.indices.length) addGeometry(doc, buffer, node, cap, part.topColor ? flatMaterial(doc, part.topColor) : material);
    addGeometry(doc, buffer, node, bottom, material);
  } else {
    throw new Error(`primitive inconnue : ${part.primitive}`);
  }
  scene.addChild(node);
}

// ─── Transformations ────────────────────────────────────────────────────────────────────────────

/** Quaternion d'une rotation autour de Y (degrés). */
function quatY(deg) {
  const a = (deg * Math.PI) / 180 / 2;
  return [0, Math.sin(a), 0, Math.cos(a)];
}

/** Aplatit la hiérarchie et cuit les transformations dans les sommets ; les nœuds `keepNodes` gardent leur translation (pivot). */
async function bakeTransforms(doc, keepNodes = []) {
  await doc.transform(flatten({ cleanup: false }));
  const scene = doc.getRoot().getDefaultScene() || doc.getRoot().listScenes()[0];
  // Un maillage partagé par plusieurs nœuds serait transformé plusieurs fois : on le dédouble.
  for (const node of scene.listChildren()) {
    const mesh = node.getMesh();
    if (mesh && mesh.listParents().filter((p) => p.propertyType === 'Node').length > 1) node.setMesh(mesh.clone());
  }
  for (const node of scene.listChildren()) {
    if (keepNodes.includes(node.getName())) {
      const m = node.getMatrix();
      const t = [m[12], m[13], m[14]];
      const m0 = [...m]; m0[12] = 0; m0[13] = 0; m0[14] = 0;
      if (node.getMesh()) transformMesh(node.getMesh(), m0);
      node.setMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]).setTranslation(t);
    } else {
      clearNodeTransform(node);
    }
  }
}

/** Enveloppe toute la scène dans un nœud transformé (lacet, échelle), puis cuit. */
async function applyGlobal(doc, { yaw = 0, scale = 1 }, keepNodes) {
  const scene = doc.getRoot().getDefaultScene() || doc.getRoot().listScenes()[0];
  if (yaw === 0 && scale === 1) return;
  const wrapper = doc.createNode('wrapper').setRotation(quatY(yaw)).setScale([scale, scale, scale]);
  for (const child of scene.listChildren()) wrapper.addChild(child);
  scene.addChild(wrapper);
  await bakeTransforms(doc, keepNodes);
  if (wrapper.listChildren().length === 0 && !wrapper.getMesh()) wrapper.dispose();
}

/** Translation de toute la scène (sommets, et pivots des nœuds conservés). */
function translateAll(doc, [tx, ty, tz], keepNodes) {
  const scene = doc.getRoot().getDefaultScene() || doc.getRoot().listScenes()[0];
  const m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
  for (const node of scene.listChildren()) {
    if (keepNodes.includes(node.getName())) {
      const t = node.getTranslation();
      node.setTranslation([t[0] + tx, t[1] + ty, t[2] + tz]);
    } else if (node.getMesh()) {
      transformMesh(node.getMesh(), m);
    }
  }
}

function countTriangles(doc) {
  let tris = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices();
      tris += (idx ? idx.getCount() : prim.getAttribute('POSITION').getCount()) / 3;
    }
  }
  return Math.round(tris);
}

const round3 = (v) => Math.round(v * 1000) / 1000;

// ─── Construction d'un modèle ───────────────────────────────────────────────────────────────────

async function buildModel(id, spec) {
  const doc = new Document().setLogger(QUIET);
  const buffer = doc.createBuffer();
  const scene = doc.createScene(id);
  doc.getRoot().setDefaultScene(scene);
  const parts = spec.parts || [{ kit: spec.kit, source: spec.source, at: [0, 0, 0], yaw: 0, scale: 1 }];
  const sources = [];
  const missing = [];
  for (const part of parts) {
    if (part.primitive) { addPrimitivePart(doc, buffer, scene, part); continue; }
    const path = sourcePath(part.kit, part.source);
    if (!path) { missing.push(`${part.kit}/${part.source}`); continue; }
    const src = await io.read(path);
    prepareMaterials(src, part.kit, { ...(KIT_MATERIALS[part.kit] || {}), ...(spec.materials || {}), ...(part.materials || {}) });
    const srcScene = src.getRoot().getDefaultScene() || src.getRoot().listScenes()[0];
    const map = mergeDocuments(doc, src);
    const merged = map.get(srcScene);
    const group = doc.createNode(part.name || part.source.replace(/\.glb$/, ''));
    group.setTranslation(part.at || [0, 0, 0]);
    if (part.yaw) group.setRotation(quatY(part.yaw));
    const s = part.scale ?? 1;
    group.setScale(Array.isArray(s) ? s : [s, s, s]);
    for (const child of merged.listChildren()) group.addChild(child);
    merged.dispose();
    scene.addChild(group);
    sources.push({ kit: part.kit, source: part.source });
  }
  if (missing.length && !spec.parts) return { ok: false, missing };
  if (missing.length) log(`   pièces manquantes ignorées : ${missing.join(', ')}`);
  if (scene.listChildren().length === 0) return { ok: false, missing: missing.length ? missing : ['(aucune pièce)'] };

  const keepNodes = spec.keepNodes || [];
  await doc.transform(unpartition());

  // 1) lacet source → face +Z, cuit ; mesure de l'empreinte
  await applyGlobal(doc, { yaw: spec.yaw || 0, scale: 1 }, keepNodes);
  await bakeTransforms(doc, keepNodes);
  let bounds = getBounds(scene);
  let scale = spec.scale ?? 1;
  if (spec.fit) {
    const w = Math.max(bounds.max[0] - bounds.min[0], bounds.max[2] - bounds.min[2]);
    scale = w > 0 ? spec.fit / w : 1;
  }
  // 2) échelle, puis centrage x/z et pose sur y = 0
  await applyGlobal(doc, { yaw: 0, scale }, keepNodes);
  bounds = getBounds(scene);
  const cx = (bounds.min[0] + bounds.max[0]) / 2, cz = (bounds.min[2] + bounds.max[2]) / 2;
  translateAll(doc, [-cx, -bounds.min[1], -cz], keepNodes);
  bounds = getBounds(scene);

  // 3) nettoyage : matériaux/textures dédoublonnés, une primitive par matériau, soudure, élagage
  for (const node of scene.listChildren()) if (!keepNodes.includes(node.getName())) node.setName('');
  for (const mesh of doc.getRoot().listMeshes()) if (!mesh.listParents().some((p) => p.propertyType === 'Node' && keepNodes.includes(p.getName()))) mesh.setName('');
  await doc.transform(dedup(), join({ keepNamed: true }), weld(), prune({ keepLeaves: false, keepAttributes: false }));
  // nœud principal nommé d'après l'identifiant
  for (const node of scene.listChildren()) if (!node.getName()) node.setName(id);
  for (const mesh of doc.getRoot().listMeshes()) if (!mesh.getName()) mesh.setName(id);

  const triangles = countTriangles(doc);
  const materials = doc.getRoot().listMaterials().map((m) => m.getName());
  const draws = doc.getRoot().listMeshes().reduce((n, m) => n + m.listPrimitives().length, 0);

  // 4) compression meshopt (quantification incluse)
  await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));

  const file = `${id}.glb`;
  await io.write(joinPath(OUT_DIR, file), doc);
  const bytes = statSync(joinPath(OUT_DIR, file)).size;

  const entry = {
    file,
    kit: kitManifestName(spec.kit),
    source: spec.parts ? (sources[0]?.source ?? 'primitives') : spec.source,
    scale: round3(scale),
    yaw: spec.yaw || 0,
    footprint: spec.footprint || [1, 1],
    license: 'CC0',
    url: kitUrl(spec.kit),
    bbox: { min: bounds.min.map(round3), max: bounds.max.map(round3), size: bounds.max.map((v, i) => round3(v - bounds.min[i])) },
    triangles,
    bytes,
  };
  if (spec.parts) {
    entry.assembled = true;
    const seen = new Set();
    entry.parts = sources.filter((s) => { const k = `${s.kit}/${s.source}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .map((s) => ({ kit: kitManifestName(s.kit), source: s.source }));
    if (parts.some((p) => p.primitive)) entry.parts.push({ kit: 'tiletown-primitives', source: 'primitives' });
  }
  if (spec.keepNodes) entry.nodes = spec.keepNodes;
  if (spec.orientation) entry.orientation = spec.orientation;
  if (spec.provisional) entry.provisional = true;
  if (spec.note) entry.note = spec.note;
  vlog(`matériaux : ${materials.join(', ')} ; primitives : ${draws}`);
  return { ok: true, entry, missing };
}

// ─── Licence et manifeste ───────────────────────────────────────────────────────────────────────

function writeLicenseFile(kitsUsed) {
  const lines = [
    'Modèles 3D de Tiletown : origine et licence',
    '==========================================',
    '',
    'Les fichiers GLB de ce dossier sont dérivés des kits ci-dessous, créés et distribués par Kenney',
    '(www.kenney.nl) sous licence Creative Commons Zero (CC0 1.0, domaine public) :',
    'http://creativecommons.org/publicdomain/zero/1.0/',
    '',
    'Ils ont été normalisés par tools/import-models.js (échelle, orientation, couleurs quantifiées vers la',
    'palette de Tiletown, assemblages, compression meshopt). Les primitives géométriques ajoutées par',
    'Tiletown (rues étroites, dalles, bassins, tas) sont elles aussi placées sous CC0.',
    '',
    'Kits utilisés :',
  ];
  for (const kit of [...kitsUsed].sort()) {
    if (kit === 'tiletown') continue;
    const info = KITS[kit];
    lines.push(`  - ${info ? info.name : kit} — https://kenney.nl/assets/${kit}`);
  }
  lines.push('', 'Texte de licence joint à chaque kit (License.txt) :', '');
  const texts = new Set();
  for (const kit of [...kitsUsed].sort()) {
    const p = joinPath(kitDir(kit), 'License.txt');
    if (!existsSync(p)) continue;
    const text = readFileSync(p, 'utf8').replace(/\r/g, '').split('\n').map((l) => l.replace(/^\t/, '').trimEnd()).join('\n').trim();
    texts.add(text);
  }
  for (const t of texts) lines.push('----------------------------------------', t, '');
  writeFileSync(LICENSE_PATH, lines.join('\n'));
}

async function main() {
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;
  mkdirSync(OUT_DIR, { recursive: true });
  const ids = ONLY.length ? ONLY.filter((id) => { if (!MODEL_MAP[id]) console.error(`identifiant inconnu : ${id}`); return !!MODEL_MAP[id]; }) : Object.keys(MODEL_MAP);
  const availableKits = Object.keys(KITS).filter((k) => existsSync(kitDir(k)));
  if (availableKits.length < Object.keys(KITS).length) {
    log(`Kits absents de assets/models/raw/ : ${Object.keys(KITS).filter((k) => !availableKits.includes(k)).join(', ')} (lancer node tools/fetch-kits.js)`);
  }

  // Manifeste existant : conservé pour les identifiants non régénérés (import partiel)
  let manifest = { palette: PALETTE_LIST, unit: UNIT, models: {} };
  if (ONLY.length && existsSync(MANIFEST_PATH)) {
    try { manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')); } catch { /* manifeste illisible : on repart de zéro */ }
  }
  manifest.palette = PALETTE_LIST;
  manifest.unit = UNIT;
  manifest.generated = new Date().toISOString().slice(0, 10);
  manifest.models = manifest.models || {};

  const missingIds = [];
  const kitsUsed = new Set();
  let totalBytes = 0, totalTris = 0;
  for (const id of ids) {
    const spec = MODEL_MAP[id];
    try {
      const r = await buildModel(id, spec);
      if (!r.ok) {
        missingIds.push({ id, missing: r.missing });
        delete manifest.models[id];
        log(`✗ ${id.padEnd(20)} source introuvable : ${r.missing.join(', ')}`);
        continue;
      }
      manifest.models[id] = r.entry;
      kitsUsed.add(spec.kit);
      for (const p of spec.parts || []) if (p.kit) kitsUsed.add(p.kit);
      totalBytes += r.entry.bytes; totalTris += r.entry.triangles;
      const sz = r.entry.bbox.size.map((v) => v.toFixed(2)).join(' × ');
      log(`✓ ${id.padEnd(20)} ${String(r.entry.triangles).padStart(5)} tris  ${String((r.entry.bytes / 1024).toFixed(1)).padStart(6)} Ko  ${sz}${r.entry.provisional ? '  (provisoire)' : ''}`);
    } catch (e) {
      missingIds.push({ id, missing: [e.message] });
      delete manifest.models[id];
      log(`✗ ${id.padEnd(20)} ERREUR : ${e.message}`);
      if (VERBOSE) console.error(e);
    }
  }

  // Ordre stable des modèles dans le manifeste (ordre du plan)
  const ordered = {};
  for (const id of Object.keys(MODEL_MAP)) if (manifest.models[id]) ordered[id] = manifest.models[id];
  manifest.models = ordered;
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  writeLicenseFile(new Set([...kitsUsed, ...Object.values(MODEL_MAP).map((s) => s.kit)]));

  // Fichiers GLB orphelins (identifiants retirés du plan)
  for (const f of readdirSync(OUT_DIR)) {
    if (f.endsWith('.glb') && !MODEL_MAP[f.replace(/\.glb$/, '')]) log(`  (orphelin : ${f}, à supprimer ?)`);
  }

  const allBytes = Object.values(manifest.models).reduce((n, m) => n + (m.bytes || 0), 0);
  log(`\n${Object.keys(manifest.models).length} modèles dans le manifeste ; ${ids.length} traités : ${(totalBytes / 1e6).toFixed(2)} Mo, ${totalTris} triangles.`);
  log(`Poids total des GLB du manifeste : ${(allBytes / 1e6).toFixed(2)} Mo (objectif < 3 Mo).`);
  if (missingIds.length) {
    log(`Identifiants absents du manifeste : ${missingIds.map((m) => m.id).join(', ')}`);
    process.exitCode = 1;
  }
}

await main();
