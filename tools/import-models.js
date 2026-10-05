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
//
// Les entrées ANIMÉES du manifeste (`animated: true`, produites par tools/import-animated.js et
// tools/build-fauna.js) sont conservées telles quelles à chaque passage : ce script ne les régénère
// pas et ne signale pas leurs GLB comme orphelins. Ses utilitaires (lecture/écriture glTF, couleurs,
// primitives) sont exportés pour ces deux scripts.

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
import { PALETTE, PALETTE_LIST, MODEL_PALETTE, MODEL_COLORS, ROLE_PALETTES, hexToRgb, rgbToHsl, nearestPaletteHex, roleColor } from '../src/data/palette.js';
import { MODEL_MAP, KIT_MATERIALS, KIT_ROLE_PROFILES, kitUrl, kitManifestName } from './model-map.js';
import { KITS, kitDir } from './fetch-kits.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const OUT_DIR = joinPath(ROOT, 'assets', 'models');
export const MANIFEST_PATH = joinPath(OUT_DIR, 'manifest.json');
const LICENSE_PATH = joinPath(OUT_DIR, 'LICENSE-kenney.txt');
export const UNIT = '1 case = 1 unité, origine au centre de la case, y vers le haut, face +Z (sud)';

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

/** Teinte nommée de la palette des modèles → baseColorFactor linéaire. */
export function roleToLinearFactor(role) {
  const hex = MODEL_PALETTE[role];
  if (!hex) throw new Error(`teinte de palette inconnue : ${role}`);
  const [r, g, b] = hexToRgb(hex).map((v) => toLinear(v / 255));
  return [r, g, b, 1];
}

/** Teinte « #rrggbb » → [r, g, b] linéaires. */
export function hexToLinear(hex) {
  return hexToRgb(hex).map((v) => toLinear(v / 255));
}

/** baseColorFactor linéaire → teinte de palette la plus proche (comparée en sRGB). */
export function quantizeFactor(factor) {
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
export function quantizeTextureImage(imageBytes) {
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

export const QUIET = new Logger(Logger.Verbosity.ERROR);
export const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder }).setLogger(QUIET);

/** Chemin d'un GLB source dans le kit (les kits Kenney rangent les GLB dans « Models/GLB format/ » ou « Models/GLTF format/ »). */
export function sourcePath(kit, file) {
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
export function prepareMaterials(doc, kit, materialOverrides = {}) {
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

// ─── Attribution des couleurs PAR RÔLE ──────────────────────────────────────────────────────────
// Les kits Kenney partagent une texture-palette (colormap.png) où chaque zone d'un modèle pioche un
// aplat. Ramener chaque aplat à « la teinte la plus proche » laissait tous les toits verts et toutes
// les façades grises. On devine donc le RÔLE de chaque aplat :
//   - sa couleur d'origine (teinte, saturation, luminosité),
//   - sa hauteur moyenne dans la boîte englobante du modèle ENTIER et l'orientation moyenne de ses
//     faces (normale y, pondérées par l'aire des triangles),
//   - le nom du matériau quand le kit en a un parlant (Nature Kit) et le profil du kit,
// puis on tire dans la SOUS-PALETTE de ce rôle (src/data/palette.js) une teinte stable pour ce modèle.
// Deux variantes d'un même type (house-a, house-d…) reçoivent ainsi des toits et des façades différents.
//
// Marche à suivre : chaque source est d'abord « aplatie » (texture échantillonnée par sommet dans
// COLOR_0, matériau renommé `src|<kit>|<rôle imposé>`), les pièces sont assemblées, puis l'attribution
// se fait une seule fois sur le modèle complet (`assignRoleColors`).

/** Préfixe des matériaux en attente d'attribution de rôle. */
const SRC_MATERIAL = 'src|';

/** Cache : empreinte de l'image → pixels décodés. */
const texturePixelsCache = new Map();
function texturePixels(imageBytes) {
  const hash = createHash('sha1').update(imageBytes).digest('hex');
  let png = texturePixelsCache.get(hash);
  if (!png) { png = PNG.sync.read(Buffer.from(imageBytes)); texturePixelsCache.set(hash, png); }
  return png;
}

/**
 * Prépare un document source pour l'attribution par rôle : la couleur d'origine de chaque sommet
 * (texel de la texture-palette, ou baseColorFactor) est écrite dans COLOR_0 en sRGB 0..1, les textures
 * et les UV sont retirés, et le matériau porte le kit et le rôle imposé par le plan.
 */
export function prepareSourceColors(doc, kit, materialOverrides = {}) {
  const root = doc.getRoot();
  for (const material of root.listMaterials()) {
    const name = material.getName();
    const forced = materialOverrides[name] || '';
    material.setMetallicFactor(0).setRoughnessFactor(1).setEmissiveFactor([0, 0, 0]).setAlphaMode('OPAQUE');
    material.setExtension('KHR_materials_unlit', null);
    material.setMetallicRoughnessTexture(null).setNormalTexture(null).setOcclusionTexture(null).setEmissiveTexture(null);
    const texture = material.getBaseColorTexture();
    const png = texture ? texturePixels(texture.getImage()) : null;
    const factorSrgb = material.getBaseColorFactor().slice(0, 3).map((c) => toSrgb(Math.min(1, Math.max(0, c))));
    for (const mesh of root.listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        if (prim.getMaterial() !== material) continue;
        const pos = prim.getAttribute('POSITION');
        const uv = prim.getAttribute('TEXCOORD_0');
        const n = pos.getCount();
        const colors = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
          let rgb;
          if (png && uv) {
            const el = uv.getElement(i, []);
            const px = Math.min(png.width - 1, Math.max(0, Math.floor(el[0] * png.width)));
            const py = Math.min(png.height - 1, Math.max(0, Math.floor(el[1] * png.height)));
            const k = (py * png.width + px) * 4;
            rgb = [png.data[k] / 255, png.data[k + 1] / 255, png.data[k + 2] / 255];
          } else {
            rgb = factorSrgb;
          }
          colors[i * 3] = rgb[0]; colors[i * 3 + 1] = rgb[1]; colors[i * 3 + 2] = rgb[2];
        }
        prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(colors).setBuffer(doc.getRoot().listBuffers()[0] || doc.createBuffer()));
        prim.setAttribute('TANGENT', null);
        for (let i = 0; i < 8; i++) prim.setAttribute(`TEXCOORD_${i}`, null);
      }
    }
    material.setBaseColorTexture(null).setBaseColorFactor([1, 1, 1, 1]).setName(`${SRC_MATERIAL}${kit}|${forced}`);
  }
}

/**
 * Rôle d'un aplat : 'roof', 'roofFlat', 'wall', 'base', 'trim', 'glass', 'foliage', 'trunk', 'rock',
 * 'metal', 'ground' ou 'accent'. `yNorm` ∈ [0, 1] (hauteur dans la boîte), `ny` ∈ [-1, 1] (normale
 * moyenne), `profile` = profil du kit (tools/model-map.js).
 */
export function detectRole({ rgb, yNorm = 0.5, ny = 0, profile = {} }) {
  const [h, , l] = rgbToHsl(rgb);
  // Le CHROMA (max - min) mesure mieux la « couleur » que la saturation HSL, qui s'emballe près du
  // blanc et du noir : sans lui, un mur #f8f8fb passerait pour une vitre bleue.
  const chroma = (Math.max(...rgb) - Math.min(...rgb)) / 255;
  // Vitrage : bleu franc et clair
  if (chroma >= 0.22 && h >= 180 && h <= 262 && l >= 0.45) return profile.glass || 'glass';
  // Vert : toiture (les toits des kits de ville de Kenney sont verts), pelouse au pied, ou feuillage
  if (chroma >= 0.10 && h >= 65 && h <= 180) {
    const green = profile.green || 'foliage';
    if (green === 'roof') return yNorm >= 0.3 ? 'roof' : 'grassLight'; // pelouse de la dalle du kit
    return green;
  }
  // Brun, orange, ocre : terre, bois, enduit crème, menuiserie, accents chauds
  if (chroma >= 0.12 && h >= 15 && h < 65) {
    if (yNorm < 0.16 && ny > 0.5) return 'soil';     // allée, chemin de la dalle du kit
    if (l < 0.42) return profile.bark || 'trunk';    // écorce, bois sombre
    if (l >= 0.72) return profile.light || 'wall';   // enduit crème, pierre chaude (Modular Buildings)
    if (chroma >= 0.35) return 'accent';             // auvent, enseigne, store
    return profile.warm || 'trim';
  }
  // Rouge, rose, violet : accents
  if (chroma >= 0.18 && (h >= 300 || h < 15)) return 'accent';
  // Peu saturé : toiture-terrasse au sommet (kits de bâtiments seulement), façade, soubassement, menuiserie
  if (profile.flat && yNorm >= 0.8 && ny >= 0.45) return profile.flat;
  if (l >= 0.70) return profile.light || 'wall';
  if (l >= 0.38) return profile.mid || 'base';
  return profile.dark || 'trim';
}

/**
 * Attribue une teinte de palette à chaque aplat du modèle assemblé, par rôle.
 * Les aplats proches (même rôle, même famille de teinte) forment une RAMPE : le dégradé d'ombrage
 * cuit dans la texture Kenney devient un seul aplat, sinon un toit se retrouverait bariolé.
 * Renvoie la liste lisible { role, tint, part } pour le manifeste.
 */
export function assignRoleColors(doc, seed, overrideProfile = null) {
  const root = doc.getRoot();
  const scene = root.getDefaultScene() || root.listScenes()[0];
  const bounds = getBounds(scene);
  const minY = bounds.min[1], height = Math.max(1e-6, bounds.max[1] - bounds.min[1]);
  const prims = [];
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const mat = prim.getMaterial();
      if (mat && mat.getName().startsWith(SRC_MATERIAL) && prim.getAttribute('COLOR_0')) prims.push(prim);
    }
  }
  if (!prims.length) return [];

  // 1) aplats : aire, hauteur et normale moyennes, par (kit, rôle imposé, couleur exacte)
  const groups = new Map();
  for (const prim of prims) {
    const [, kit, forced] = prim.getMaterial().getName().split('|');
    const pos = prim.getAttribute('POSITION');
    const col = prim.getAttribute('COLOR_0');
    const nor = prim.getAttribute('NORMAL');
    const idx = prim.getIndices();
    const count = idx ? idx.getCount() : pos.getCount();
    for (let t = 0; t + 2 < count; t += 3) {
      const ia = idx ? idx.getScalar(t) : t, ib = idx ? idx.getScalar(t + 1) : t + 1, ic = idx ? idx.getScalar(t + 2) : t + 2;
      const A = pos.getElement(ia, []), B = pos.getElement(ib, []), C = pos.getElement(ic, []);
      const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
      const cr = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const area = Math.hypot(cr[0], cr[1], cr[2]) / 2;
      const c = col.getElement(ia, []);
      const rgb = [Math.round(c[0] * 255), Math.round(c[1] * 255), Math.round(c[2] * 255)];
      const key = `${kit}|${forced}|${rgb.join(',')}`;
      let g = groups.get(key);
      if (!g) { g = { kit, forced, rgb, area: 0, visArea: 0, yA: 0, nyA: 0 }; groups.set(key, g); }
      const yN = ((A[1] + B[1] + C[1]) / 3 - minY) / height;
      const ny = nor ? (nor.getElement(ia, [])[1] + nor.getElement(ib, [])[1] + nor.getElement(ic, [])[1]) / 3 : 0;
      g.area += area; g.yA += yN * area; g.nyA += ny * area;
      if (ny > -0.25) g.visArea += area; // faces tournées vers le ciel ou l'horizon : ce que le joueur voit
    }
  }

  // 2) rôle de chaque aplat, puis regroupement en rampes (même rôle, même famille de teinte)
  const ramps = new Map();
  for (const g of groups.values()) {
    const profile = overrideProfile ? { ...(KIT_ROLE_PROFILES[g.kit] || {}), ...overrideProfile } : (KIT_ROLE_PROFILES[g.kit] || {});
    const [h, s, l] = rgbToHsl(g.rgb);
    g.l = l;
    if (g.forced && !ROLE_PALETTES[g.forced]) { g.role = null; g.tint = g.forced; continue; } // teinte imposée
    g.role = g.forced || detectRole({ rgb: g.rgb, yNorm: g.area ? g.yA / g.area : 0.5, ny: g.area ? g.nyA / g.area : 0, profile });
    // Une rampe = un même rôle ET une même famille de teinte (le dégradé d'ombrage cuit dans la
    // texture Kenney est alors un seul aplat). Un rôle IMPOSÉ par le plan garde son aplat à lui.
    const family = g.forced ? `f${g.rgb.join(',')}` : (s < 0.18 ? 'n' : `h${Math.round(h / 40)}`);
    const key = `${g.role}|${family}`;
    let ramp = ramps.get(key);
    if (!ramp) { ramp = { role: g.role, area: 0, visArea: 0, lA: 0, groups: [] }; ramps.set(key, ramp); }
    ramp.area += g.area; ramp.visArea += g.visArea; ramp.lA += l * g.area; ramp.groups.push(g);
  }
  // 2 bis) façade contre soubassement : c'est la rampe la plus étendue en AIRE VISIBLE (faces tournées
  // vers le ciel ou l'horizon) qui porte la façade. Les kits Kenney n'ont pas de convention de clarté,
  // et une grande partie de leurs aplats sombres sont des DESSOUS (débords, dalle) que le joueur ne voit
  // jamais : les compter fausserait le choix.
  const faces = [...ramps.values()].filter((r) => r.role === 'wall' || r.role === 'base');
  if (faces.length) {
    faces.sort((a, b) => b.visArea - a.visArea);
    faces.forEach((ramp, i) => { ramp.role = i === 0 ? 'wall' : 'base'; for (const g of ramp.groups) g.role = ramp.role; });
  }

  // 3) une teinte par rampe : les rampes d'un même rôle sont décalées dans la sous-palette
  const byRole = new Map();
  for (const ramp of ramps.values()) {
    if (!byRole.has(ramp.role)) byRole.set(ramp.role, []);
    byRole.get(ramp.role).push(ramp);
  }
  const legend = [];
  const totalArea = [...ramps.values()].reduce((n, r) => n + r.area, 0) || 1;
  for (const [role, list] of byRole) {
    list.sort((a, b) => (b.area ? b.lA / b.area : 0) - (a.area ? a.lA / a.area : 0)); // du plus clair au plus sombre
    list.forEach((ramp, rank) => {
      // Les accents gardent leur FAMILLE de teinte : un store orange reste orange, une enseigne rouge
      // reste rouge. C'est le seul rôle où la couleur d'origine porte un sens.
      const tint = role === 'accent' ? accentTint(ramp.groups[0].rgb) : roleColor(role, seed, rank);
      for (const g of ramp.groups) g.tint = tint;
      legend.push({ role, tint });
      vlog(`rampe ${role} #${rank} → ${tint} : ${(100 * ramp.area / totalArea).toFixed(1)} % de l'aire (${(100 * ramp.visArea / totalArea).toFixed(1)} % visible), ${ramp.groups.length} aplats (${ramp.groups.slice(0, 3).map((g) => '#' + g.rgb.map((v) => v.toString(16).padStart(2, '0')).join('')).join(' ')})`);
    });
  }

  // 4) réécriture des couleurs de sommets (linéaire)
  const linear = new Map();
  const tintOf = (rgb) => {
    for (const g of groups.values()) if (g.rgb[0] === rgb[0] && g.rgb[1] === rgb[1] && g.rgb[2] === rgb[2]) return g.tint;
    return 'wallCream';
  };
  const index = new Map();
  for (const g of groups.values()) index.set(`${g.kit}|${g.forced}|${g.rgb.join(',')}`, g.tint);
  for (const prim of prims) {
    const [, kit, forced] = prim.getMaterial().getName().split('|');
    const col = prim.getAttribute('COLOR_0');
    const n = col.getCount();
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const c = col.getElement(i, []);
      const rgb = [Math.round(c[0] * 255), Math.round(c[1] * 255), Math.round(c[2] * 255)];
      const tint = index.get(`${kit}|${forced}|${rgb.join(',')}`) || tintOf(rgb);
      let lin = linear.get(tint);
      if (!lin) { lin = hexToLinear(MODEL_PALETTE[tint] || PALETTE.wallCream); linear.set(tint, lin); }
      out[i * 3] = lin[0]; out[i * 3 + 1] = lin[1]; out[i * 3 + 2] = lin[2];
    }
    col.setArray(out);
  }
  return legend;
}

/** Teinte d'accent la plus proche de la famille de couleur d'origine (jaune, orange, rouge, bleu). */
function accentTint(rgb) {
  const [h] = rgbToHsl(rgb);
  if (h >= 40 && h < 72) return 'sun';
  if (h >= 15 && h < 40) return 'roofOrange';
  if (h >= 160 && h < 280) return 'river';
  return 'blossom';
}

/**
 * Cuit toutes les couleurs de matériaux dans COLOR_0 et ne garde qu'UN matériau blanc : les primitives
 * géométriques de Tiletown (`flat-<teinte>`) rejoignent ainsi les pièces des kits dans une seule
 * primitive après `join()`. Le rendu (src/render3d/models.js) n'a plus aucune texture à échantillonner.
 */
export function flattenToVertexColors(doc) {
  const root = doc.getRoot();
  const buffer = root.listBuffers()[0] || doc.createBuffer();
  const white = doc.createMaterial('vertex-colors').setBaseColorFactor([1, 1, 1, 1]).setMetallicFactor(0).setRoughnessFactor(1);
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const mat = prim.getMaterial();
      const n = prim.getAttribute('POSITION').getCount();
      if (!prim.getAttribute('COLOR_0')) {
        const factor = mat ? mat.getBaseColorFactor() : [1, 1, 1, 1];
        const out = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { out[i * 3] = factor[0]; out[i * 3 + 1] = factor[1]; out[i * 3 + 2] = factor[2]; }
        prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(out).setBuffer(buffer));
      }
      prim.setAttribute('TANGENT', null);
      for (let i = 0; i < 8; i++) prim.setAttribute(`TEXCOORD_${i}`, null);
      prim.setMaterial(white);
    }
  }
  for (const m of root.listMaterials()) if (m !== white) m.dispose();
  for (const t of root.listTextures()) t.dispose();
}

// ─── Primitives procédurales (boîte, cylindre, cône) aux couleurs de la palette ────────────────

/** Ajoute une face plane (polygone convexe, sommets dans l'ordre antihoraire vu de l'extérieur). */
function addFace(g, verts) {
  const [a, b, c] = verts;
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const len = Math.hypot(n[0], n[1], n[2]) || 1;
  const nn = [n[0] / len, n[1] / len, n[2] / len];
  const base = g.positions.length / 3;
  for (const pt of verts) { g.positions.push(...pt); g.normals.push(...nn); }
  for (let i = 1; i < verts.length - 1; i++) g.indices.push(base, base + i, base + i + 1);
}

/**
 * Boîte BISEAUTÉE posée sur y = 0, centrée en x/z : 6 faces, 12 biseaux, 8 coins.
 * Un chanfrein de quelques millimètres suffit à accrocher la lumière sur les arêtes (une fine bande
 * claire en haut, sombre en bas) : c'est ce qui donne du relief aux pièces ajoutées par Tiletown.
 */
export function chamferBoxGeometry([w, h, d], bevel) {
  const g = { positions: [], normals: [], indices: [] };
  const hx = w / 2, hy = h / 2, hz = d / 2;
  const b = Math.min(bevel, hx * 0.9, hy * 0.9, hz * 0.9);
  const cy = h / 2;
  const P = (sx, sy, sz, ax, ay, az) => [sx * (hx - (ax ? 0 : b)), cy + sy * (hy - (ay ? 0 : b)), sz * (hz - (az ? 0 : b))];
  addFace(g, [P(-1, -1, 1, 0, 0, 1), P(1, -1, 1, 0, 0, 1), P(1, 1, 1, 0, 0, 1), P(-1, 1, 1, 0, 0, 1)]);
  addFace(g, [P(1, -1, -1, 0, 0, 1), P(-1, -1, -1, 0, 0, 1), P(-1, 1, -1, 0, 0, 1), P(1, 1, -1, 0, 0, 1)]);
  addFace(g, [P(1, -1, 1, 1, 0, 0), P(1, -1, -1, 1, 0, 0), P(1, 1, -1, 1, 0, 0), P(1, 1, 1, 1, 0, 0)]);
  addFace(g, [P(-1, -1, -1, 1, 0, 0), P(-1, -1, 1, 1, 0, 0), P(-1, 1, 1, 1, 0, 0), P(-1, 1, -1, 1, 0, 0)]);
  addFace(g, [P(-1, 1, 1, 0, 1, 0), P(1, 1, 1, 0, 1, 0), P(1, 1, -1, 0, 1, 0), P(-1, 1, -1, 0, 1, 0)]);
  addFace(g, [P(-1, -1, -1, 0, 1, 0), P(1, -1, -1, 0, 1, 0), P(1, -1, 1, 0, 1, 0), P(-1, -1, 1, 0, 1, 0)]);
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) { // arêtes parallèles à X
    const a = P(-1, sy, sz, 0, 1, 0), b2 = P(1, sy, sz, 0, 1, 0), c2 = P(1, sy, sz, 0, 0, 1), d2 = P(-1, sy, sz, 0, 0, 1);
    addFace(g, sy * sz > 0 ? [a, b2, c2, d2] : [d2, c2, b2, a]);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { // arêtes parallèles à Y
    const a = P(sx, -1, sz, 1, 0, 0), b2 = P(sx, 1, sz, 1, 0, 0), c2 = P(sx, 1, sz, 0, 0, 1), d2 = P(sx, -1, sz, 0, 0, 1);
    addFace(g, sx * sz > 0 ? [d2, c2, b2, a] : [a, b2, c2, d2]);
  }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { // arêtes parallèles à Z
    const a = P(sx, sy, -1, 1, 0, 0), b2 = P(sx, sy, 1, 1, 0, 0), c2 = P(sx, sy, 1, 0, 1, 0), d2 = P(sx, sy, -1, 0, 1, 0);
    addFace(g, sx * sy > 0 ? [a, b2, c2, d2] : [d2, c2, b2, a]);
  }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    const px = P(sx, sy, sz, 1, 0, 0), py = P(sx, sy, sz, 0, 1, 0), pz = P(sx, sy, sz, 0, 0, 1);
    addFace(g, sx * sy * sz > 0 ? [px, py, pz] : [px, pz, py]);
  }
  return g;
}

/** Bruit déterministe dans [0, 1] à partir de trois entiers et d'une graine. */
function noise3(i, j, seed) {
  let h = (Math.imul(i + 1, 374761393) ^ Math.imul(j + 1, 668265263) ^ Math.imul(seed + 1, 2246822519)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * VOLUME ARRONDI (ellipsoïde) à normales LISSES et rayon légèrement irrégulier : la brique des
 * feuillages. Sommets partagés par anneau (le maillage est indexé), normale analytique de
 * l'ellipsoïde NON déformée — la lumière glisse en dégradé doux au lieu d'accrocher des facettes.
 * `jitter` déforme le rayon de ± jitter (volume « pas tout à fait rond »), `seed` rend le tirage stable.
 * Triangles = 2 × segments × (rings - 1) : 64 pour 8 × 5.
 */
export function blobGeometry([rx, ry, rz], { segments = 8, rings = 5, jitter = 0, seed = 1 } = {}) {
  const positions = [], normals = [], indices = [];
  const vert = (i, j) => {
    const phi = (j / rings) * Math.PI, theta = ((i % segments) / segments) * Math.PI * 2;
    const sp = Math.sin(phi), cp = Math.cos(phi);
    const ct = Math.cos(theta), st = Math.sin(theta);
    const k = jitter ? 1 + (noise3(i % segments, j, seed) - 0.5) * 2 * jitter : 1;
    const nx = sp * ct, nyv = cp, nz = sp * st;
    positions.push(rx * nx * k, ry * nyv * k, rz * nz * k);
    const n = [nx / rx, nyv / ry, nz / rz];
    const len = Math.hypot(n[0], n[1], n[2]) || 1;
    normals.push(n[0] / len, n[1] / len, n[2] / len);
    return positions.length / 3 - 1;
  };
  const grid = [];
  for (let j = 0; j <= rings; j++) {
    const row = [];
    if (j === 0 || j === rings) { const v = vert(0, j); for (let i = 0; i < segments; i++) row.push(v); }
    else for (let i = 0; i < segments; i++) row.push(vert(i, j));
    grid.push(row);
  }
  for (let j = 0; j < rings; j++) {
    for (let i = 0; i < segments; i++) {
      const i2 = (i + 1) % segments;
      const a = grid[j][i], b = grid[j + 1][i], c = grid[j + 1][i2], d = grid[j][i2];
      if (j === 0) indices.push(a, b, c);
      else if (j === rings - 1) indices.push(a, b, d);
      else indices.push(a, b, c, a, c, d);
    }
  }
  return { positions, normals, indices };
}

/** Fait tourner une géométrie autour de X puis de Z (degrés) : troncs légèrement inclinés. */
export function tiltGeometry(geom, [degX = 0, degZ = 0]) {
  if (!degX && !degZ) return geom;
  const rx = (degX * Math.PI) / 180, rz = (degZ * Math.PI) / 180;
  const cx = Math.cos(rx), sx = Math.sin(rx), cz = Math.cos(rz), sz = Math.sin(rz);
  const apply = (arr) => {
    for (let i = 0; i < arr.length; i += 3) {
      let [x, y, z] = [arr[i], arr[i + 1], arr[i + 2]];
      [y, z] = [y * cx - z * sx, y * sx + z * cx];
      [x, y] = [x * cz - y * sz, x * sz + y * cz];
      arr[i] = x; arr[i + 1] = y; arr[i + 2] = z;
    }
  };
  apply(geom.positions); apply(geom.normals);
  return geom;
}

/** Translate une géométrie. */
export function translateGeometry(geom, [tx, ty, tz]) {
  for (let i = 0; i < geom.positions.length; i += 3) { geom.positions[i] += tx; geom.positions[i + 1] += ty; geom.positions[i + 2] += tz; }
  return geom;
}

/** Géométrie d'une boîte posée sur y = 0, centrée en x/z, normales plates (ou biseautée si `bevel`). */
export function boxGeometry([w, h, d], bevel = 0) {
  if (bevel > 0) return chamferBoxGeometry([w, h, d], bevel);
  return rawBoxGeometry([w, h, d]);
}

function rawBoxGeometry([w, h, d]) {
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
export function cylinderGeometry(radius, height, segments = 16, topRadius = radius, smooth = false) {
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
    if (smooth) {
      // normales radiales par sommet : le cylindre se fond en dégradé (troncs doux)
      const n0 = [c0 / nl, slope / nl, s0 / nl], n1 = [c1 / nl, slope / nl, s1 / nl];
      side.normals.push(...n0, ...n1, ...n1, ...n0);
    } else {
      for (let k = 0; k < 4; k++) side.normals.push(...n);
    }
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
export function flatMaterial(doc, role) {
  const name = `flat-${role}`;
  const existing = doc.getRoot().listMaterials().find((m) => m.getName() === name && !m.getBaseColorTexture());
  if (existing) return existing;
  return doc.createMaterial(name).setBaseColorFactor(roleToLinearFactor(role)).setMetallicFactor(0).setRoughnessFactor(1);
}

export function addGeometry(doc, buffer, node, geom, material) {
  if (!geom.indices.length) return;
  const pos = doc.createAccessor().setType('VEC3').setArray(new Float32Array(geom.positions)).setBuffer(buffer);
  const nor = doc.createAccessor().setType('VEC3').setArray(new Float32Array(geom.normals)).setBuffer(buffer);
  const idx = doc.createAccessor().setType('SCALAR').setArray(new Uint16Array(geom.indices)).setBuffer(buffer);
  const prim = doc.createPrimitive().setAttribute('POSITION', pos).setAttribute('NORMAL', nor).setIndices(idx).setMaterial(material);
  let mesh = node.getMesh();
  if (!mesh) { mesh = doc.createMesh(); node.setMesh(mesh); }
  mesh.addPrimitive(prim);
}

/**
 * Ajoute une primitive du plan à la scène. Formes : `box` (chanfrein `bevel`), `cylinder` / `cone`
 * (`topRadius`, `smooth` pour des normales radiales), `blob` (ellipsoïde lisse et irrégulier :
 * `radii`, `segments`, `rings`, `jitter`, `seed`). `tilt: [degX, degZ]` penche la pièce autour de son
 * pied (troncs), `at` la pose, `yaw` la fait pivoter.
 */
export function addPrimitivePart(doc, buffer, scene, part) {
  const node = doc.createNode(`${part.primitive}-${part.color}`).setTranslation(part.at || [0, 0, 0]);
  if (part.yaw) node.setRotation(quatY(part.yaw));
  const material = flatMaterial(doc, part.color);
  const tilt = part.tilt;
  const place = (geom) => (tilt ? tiltGeometry(geom, tilt) : geom);
  if (part.primitive === 'prism') {
    addGeometry(doc, buffer, node, place(prismGeometry(part.points, part.depth)), material);
  } else if (part.primitive === 'box') {
    addGeometry(doc, buffer, node, place(boxGeometry(part.size, part.bevel || 0)), material);
  } else if (part.primitive === 'blob') {
    const geom = blobGeometry(part.radii, { segments: part.segments || 8, rings: part.rings || 5, jitter: part.jitter || 0, seed: part.seed || 1 });
    translateGeometry(geom, [0, part.radii[1], 0]); // posé sur son pied : centre à ry
    addGeometry(doc, buffer, node, place(geom), material);
  } else if (part.primitive === 'cylinder' || part.primitive === 'cone') {
    const topRadius = part.primitive === 'cone' ? 0 : (part.topRadius ?? part.radius);
    const { side, cap, bottom } = cylinderGeometry(part.radius, part.height, part.segments || 16, topRadius, part.smooth || false);
    addGeometry(doc, buffer, node, place(side), material);
    if (cap.indices.length) addGeometry(doc, buffer, node, place(cap), part.topColor ? flatMaterial(doc, part.topColor) : material);
    if (!part.noBottom) addGeometry(doc, buffer, node, place(bottom), material);
  } else {
    throw new Error(`primitive inconnue : ${part.primitive}`);
  }
  scene.addChild(node);
}

/** Profil convexe en x/y extrudé en z : pignons, mansardes, encadrements cintrés. */
export function prismGeometry(points, depth) {
  const positions = [], normals = [], indices = [];
  const tri = (a, b, c) => {
    const u = b.map((v, i) => v - a[i]), v = c.map((x, i) => x - a[i]);
    const n = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
    const length = Math.hypot(...n);
    if (length < 1e-10) return;
    const start = positions.length / 3;
    for (const p of [a,b,c]) { positions.push(...p); normals.push(...n.map(x => x/length)); }
    indices.push(start, start+1, start+2);
  };
  const front = points.map(p => [...p, depth/2]), back = points.map(p => [...p, -depth/2]);
  for (let i=1; i<points.length-1; i++) { tri(front[0],front[i],front[i+1]); tri(back[0],back[i+1],back[i]); }
  for (let i=0; i<points.length; i++) {
    const j=(i+1)%points.length;
    tri(front[i],back[i],back[j]); tri(front[i],back[j],front[j]);
  }
  return { positions, normals, indices };
}

/** Emprise en x/z de la tranche de hauteur [a, b] (fractions de la hauteur) d'une scène. */
function sliceBounds(scene, bounds, a, b) {
  const y0 = bounds.min[1] + a * (bounds.max[1] - bounds.min[1]);
  const y1 = bounds.min[1] + b * (bounds.max[1] - bounds.min[1]);
  const out = { min: [Infinity, bounds.min[1], Infinity], max: [-Infinity, bounds.max[1], -Infinity] };
  const visit = (node) => {
    const mesh = node.getMesh();
    if (mesh) {
      for (const prim of mesh.listPrimitives()) {
        const pos = prim.getAttribute('POSITION');
        for (let i = 0; i < pos.getCount(); i++) {
          const v = pos.getElement(i, []);
          if (v[1] < y0 || v[1] > y1) continue;
          if (v[0] < out.min[0]) out.min[0] = v[0];
          if (v[0] > out.max[0]) out.max[0] = v[0];
          if (v[2] < out.min[2]) out.min[2] = v[2];
          if (v[2] > out.max[2]) out.max[2] = v[2];
        }
      }
    }
    for (const child of node.listChildren()) visit(child);
  };
  for (const node of scene.listChildren()) visit(node);
  if (!Number.isFinite(out.min[0]) || !Number.isFinite(out.min[2])) return bounds;
  return out;
}

/**
 * Pièce de DÉTAIL posée APRÈS la mise à l'échelle : ses repères sont relatifs à la boîte englobante
 * du modèle (`atRel: [x, y, z]` avec x, z ∈ [-1, 1] = bord de la boîte, y ∈ [0, 1] = du sol au faîte ;
 * `sizeRel` donne une taille en fraction de la boîte, `pad` l'élargit de quelques millimètres).
 * C'est ainsi qu'on ajoute un débord de toiture, une cheminée, un porche ou une lucarne sans
 * connaître d'avance les dimensions du modèle Kenney.
 */
function addDetailPart(doc, buffer, scene, detail, bounds, slices) {
  // `slice: [a, b]` mesure l'emprise en x/z de la seule TRANCHE de hauteur [a, b] du modèle : un
  // débord de toiture doit border le haut du bâtiment, pas la dalle de pelouse du kit, bien plus large.
  const band = detail.slice ? slices(detail.slice[0], detail.slice[1]) : bounds;
  const sx = (band.max[0] - band.min[0]) / 2, sz = (band.max[2] - band.min[2]) / 2;
  const sy = bounds.max[1] - bounds.min[1];
  const cx = (band.min[0] + band.max[0]) / 2, cz = (band.min[2] + band.max[2]) / 2;
  const rel = detail.atRel || [0, 0, 0];
  const off = detail.at || [0, 0, 0];
  const at = [cx + rel[0] * sx + off[0], bounds.min[1] + rel[1] * sy + off[1], cz + rel[2] * sz + off[2]];
  const part = { ...detail, at };
  if (detail.sizeRel) {
    const pad = detail.pad || 0;
    const hAbs = detail.height != null ? detail.height : detail.sizeRel[1] * sy;
    part.size = [detail.sizeRel[0] * sx * 2 + pad * 2, hAbs, detail.sizeRel[2] * sz * 2 + pad * 2];
  }
  if (detail.radiiRel) part.radii = [detail.radiiRel[0] * sx, detail.radiiRel[1] * sy, detail.radiiRel[2] * sz];
  if (detail.heightRel != null && part.size) part.size = [part.size[0], detail.heightRel * sy, part.size[2]];
  addPrimitivePart(doc, buffer, scene, part);
}

// ─── Transformations ────────────────────────────────────────────────────────────────────────────

/** Quaternion d'une rotation autour de Y (degrés). */
export function quatY(deg) {
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

export function countTriangles(doc) {
  let tris = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices();
      tris += (idx ? idx.getCount() : prim.getAttribute('POSITION').getCount()) / 3;
    }
  }
  return Math.round(tris);
}

export const round3 = (v) => Math.round(v * 1000) / 1000;

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
    prepareSourceColors(src, part.kit, { ...(KIT_MATERIALS[part.kit] || {}), ...(spec.materials || {}), ...(part.materials || {}) });
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

  // 2 bis) détails de caractère (débord de toiture, cheminée, porche, lucarne…) : repères relatifs à
  // la boîte englobante, donc posés APRÈS la mise à l'échelle. Puis attribution des couleurs par rôle
  // sur le modèle complet, et cuisson de toutes les couleurs dans les sommets (plus aucune texture).
  const sliceCache = new Map();
  const slices = (a, b) => {
    const key = `${a}|${b}`;
    if (!sliceCache.has(key)) sliceCache.set(key, sliceBounds(scene, bounds, a, b));
    return sliceCache.get(key);
  };
  for (const detail of spec.details || []) addDetailPart(doc, buffer, scene, detail, bounds, slices);
  if (spec.details && spec.details.length) {
    await bakeTransforms(doc, keepNodes);
    bounds = getBounds(scene);
    const dx = (bounds.min[0] + bounds.max[0]) / 2, dz = (bounds.min[2] + bounds.max[2]) / 2;
    translateAll(doc, [-dx, -bounds.min[1], -dz], keepNodes);
    bounds = getBounds(scene);
  }
  const legend = assignRoleColors(doc, spec.seed || id, spec.profile || null);
  flattenToVertexColors(doc);

  // 3) nettoyage : matériaux/textures dédoublonnés, une primitive par matériau, soudure, élagage
  for (const node of scene.listChildren()) if (!keepNodes.includes(node.getName())) node.setName('');
  for (const mesh of doc.getRoot().listMeshes()) if (!mesh.listParents().some((p) => p.propertyType === 'Node' && keepNodes.includes(p.getName()))) mesh.setName('');
  await doc.transform(dedup(), join({ keepNamed: true }), weld(), prune({ keepLeaves: false, keepAttributes: false }));
  // nœud principal nommé d'après l'identifiant
  for (const node of scene.listChildren()) if (!node.getName()) node.setName(id);
  for (const mesh of doc.getRoot().listMeshes()) if (!mesh.getName()) mesh.setName(id);

  const triangles = countTriangles(doc);
  const draws = doc.getRoot().listMeshes().reduce((n, m) => n + m.listPrimitives().length, 0);
  const roles = {};
  for (const { role, tint } of legend) if (!roles[role]) roles[role] = tint;

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
  if (Object.keys(roles).length) entry.roles = roles;
  if (spec.keepNodes) entry.nodes = spec.keepNodes;
  if (spec.orientation) entry.orientation = spec.orientation;
  if (spec.provisional) entry.provisional = true;
  if (spec.note) entry.note = spec.note;
  vlog(`rôles : ${Object.entries(roles).map(([r, t]) => `${r}→${t}`).join(', ')} ; primitives : ${draws}`);
  return { ok: true, entry, missing };
}

// ─── Licence et manifeste ───────────────────────────────────────────────────────────────────────

function writeLicenseFile(kitsUsed) {
  // Un import des modèles originaux fonctionne sans les kits bruts. Ne jamais remplacer les
  // licences déjà livrées par un document tronqué lorsque ces sources ne sont pas présentes.
  const kenneyKits = [...kitsUsed].filter(kit => kit !== 'tiletown' && (!KITS[kit]?.author || KITS[kit].author === 'Kenney'));
  if (existsSync(LICENSE_PATH) && kenneyKits.some(kit => !existsSync(joinPath(kitDir(kit), 'License.txt')))) return;
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
    if (info && info.author && info.author !== 'Kenney') continue; // Quaternius, Gobkit : voir CREDITS.md et LICENSE-<auteur>.txt
    lines.push(`  - ${info ? info.name : kit} — https://kenney.nl/assets/${kit}`);
  }
  lines.push('', 'Texte de licence joint à chaque kit (License.txt) :', '');
  const texts = new Set();
  for (const kit of [...kitsUsed].sort()) {
    const info = KITS[kit];
    if (info && info.author && info.author !== 'Kenney') continue;
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
  // Manifeste existant : relu pour conserver les identifiants non régénérés (import partiel) et, dans
  // tous les cas, les modèles animés (import-animated.js, build-fauna.js) qui ne sont pas dans MODEL_MAP.
  let manifest = { palette: MODEL_COLORS, unit: UNIT, models: {} };
  if (existsSync(MANIFEST_PATH)) {
    try { manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')); } catch { /* manifeste illisible : on repart de zéro */ }
  }
  manifest.models = manifest.models || {};
  if (!ONLY.length) {
    for (const [id, entry] of Object.entries(manifest.models)) if (!entry || !entry.animated) delete manifest.models[id];
  }
  manifest.palette = MODEL_COLORS;
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

  // Ordre stable des modèles dans le manifeste (ordre du plan), puis les modèles animés (ordre existant)
  const ordered = {};
  for (const id of Object.keys(MODEL_MAP)) if (manifest.models[id]) ordered[id] = manifest.models[id];
  for (const [id, entry] of Object.entries(manifest.models)) if (!ordered[id] && entry && entry.animated) ordered[id] = entry;
  manifest.models = ordered;
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  writeLicenseFile(new Set([...kitsUsed, ...Object.values(MODEL_MAP).map((s) => s.kit)]));

  // Fichiers GLB orphelins (identifiants retirés du plan)
  for (const f of readdirSync(OUT_DIR)) {
    const fid = f.replace(/\.glb$/, '');
    if (f.endsWith('.glb') && !MODEL_MAP[fid] && !(manifest.models[fid] && manifest.models[fid].animated)) log(`  (orphelin : ${f}, à supprimer ?)`);
  }

  const allBytes = Object.values(manifest.models).reduce((n, m) => n + (m.bytes || 0), 0);
  log(`\n${Object.keys(manifest.models).length} modèles dans le manifeste ; ${ids.length} traités : ${(totalBytes / 1e6).toFixed(2)} Mo, ${totalTris} triangles.`);
  log(`Poids total des GLB du manifeste : ${(allBytes / 1e6).toFixed(2)} Mo (objectif < 3 Mo).`);
  if (missingIds.length) {
    log(`Identifiants absents du manifeste : ${missingIds.map((m) => m.id).join(', ')}`);
    process.exitCode = 1;
  }
}

// Lancé directement : importe tout le plan. Importé (import-animated.js, build-fauna.js) : rien ne s'exécute.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
