// Chargement des modèles 3D de Tiletown : lit `assets/models/manifest.json` (contrat
// docs/ARCHITECTURE.md §5), charge chaque GLB (GLTFLoader + décodeur meshopt), fusionne les
// meshes d'un modèle en UNE géométrie à couleurs de sommets, et fournit des géométries de
// remplacement colorées pour tout identifiant absent : un modèle manquant n'est jamais une erreur
// bloquante.
//
// Couleurs : les matériaux plats donnent leur `color` aux sommets ; la texture-palette d'un kit
// (aplats de couleurs, un pixel par sommet suffit) est ÉCHANTILLONNÉE par sommet et devient aussi
// une couleur de sommet. Résultat : aucune texture au rendu, un seul matériau partagé par tous
// les modèles → un seul `BatchedMesh` pour toute la ville. Si une texture ne peut pas être lue
// (image indisponible), le modèle garde un matériau texturé partagé par kit (repli).
//
// Les GLB sont quantifiés (KHR_mesh_quantization : Int16 / Uint16 normalisés) : tous les attributs
// sont convertis en Float32 avant fusion, condition exigée par `mergeGeometries` et `BatchedMesh`.
// Les champs `scale` et `yaw` du manifeste sont informatifs (déjà appliqués dans les sommets).
//
// API : `await loadModels(url)` → { get(id), has(id), fallback(id), resolve(id), getPart(id, name), partNames(id),
//                                   ids, palette, materials, dispose() }
//   - get(id)      → { geometry, material, height, source: 'glb', parts } ou null si absent
//   - fallback(id) → { geometry, material, height, source: 'fallback' } (boîte 0,85 × h × 0,85
//                    colorée par famille ; arbres, fleurs, rochers et cultures ont une forme simple)
//   - getPart(id, name) → { geometry, material, pivot: [x, y, z], height } : un nœud du manifeste déclaré
//                    dans `exclude` (sinon `nodes`) reste HORS de la fusion, géométrie exprimée au pivot
//                    (origine du nœud) ; c'est ainsi que les pales d'éolienne tournent (effects.js).
// Toutes les géométries portent position, normal, color (Float32), sont centrées en X/Z, posées sur y = 0.

import * as THREE from 'three';
import { softTree } from './soft-trees.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PALETTE, PALETTE_LIST } from '../data/palette.js';

/** Emprise au sol d'un îlot dans sa case (docs/GAME_DESIGN.md §4.1). */
export const FOOTPRINT = 0.85;

/** Hauteur de la boîte de remplacement par famille (préfixe de l'identifiant du modèle). */
export const FALLBACK_HEIGHTS = Object.freeze({
  'building-tall': 2.2,
  'building-small': 1.2,
  house: 0.6,
  shop: 0.7,
  office: 1.6,
  factory: 0.9,
  school: 0.8,
  clinic: 0.9,
  market: 0.5,
  townhall: 1.1,
  station: 0.7,
  'tram-stop': 0.45,
  wastewater: 0.5,
  'water-tower': 1.4,
  'wind-turbine': 1.8,
  solar: 0.15,
  'power-plant': 1.3,
  compost: 0.4,
  treatment: 0.5,
  park: 0.3,
  tree: 0.9,
  pine: 1.1,
  bush: 0.35,
  flower: 0.12,
  crop: 0.12,
  rock: 0.3,
  grass: 0.15,
  reed: 0.3,
  'road-edge-node': 0.02,
  'road-edge-straight': 0.02,
});

/** Couleurs de remplacement par famille : [murs, toit ou accent]. */
const FALLBACK_COLORS = Object.freeze({
  'building-tall': [PALETTE.wallBeige, PALETTE.roofSlate],
  'building-small': [PALETTE.wallCream, PALETTE.roofOrange],
  house: [PALETTE.wallCream, PALETTE.roofRed],
  shop: [PALETTE.wallBeige, PALETTE.roofOrange],
  office: [PALETTE.sidewalk, PALETTE.roofSlate],
  factory: [PALETTE.metal, PALETTE.metalLight],
  school: [PALETTE.wallTan, PALETTE.roofRed],
  clinic: [PALETTE.wallCream, PALETTE.marking],
  market: [PALETTE.wallTan, PALETTE.sun],
  townhall: [PALETTE.wallCream, PALETTE.roofSlate],
  station: [PALETTE.wallBeige, PALETTE.metal],
  'tram-stop': [PALETTE.metal, PALETTE.roofSlate],
  wastewater: [PALETTE.sidewalk, PALETTE.river],
  'water-tower': [PALETTE.metalLight, PALETTE.metal],
  'wind-turbine': [PALETTE.metalLight, PALETTE.marking],
  solar: [PALETTE.roofSlate, PALETTE.metal],
  'power-plant': [PALETTE.metal, PALETTE.rock],
  compost: [PALETTE.wood, PALETTE.soil],
  treatment: [PALETTE.sidewalk, PALETTE.river],
  park: [PALETTE.grassLight, PALETTE.blossom],
  tree: [PALETTE.wood, PALETTE.forestDark],
  pine: [PALETTE.wood, PALETTE.forestDark],
  bush: [PALETTE.forestDark, PALETTE.grass],
  flower: [PALETTE.forestDark, PALETTE.blossom],
  crop: [PALETTE.soil, PALETTE.wheat],
  rock: [PALETTE.rock, PALETTE.rockLight],
  grass: [PALETTE.grassLight, PALETTE.grassLight],
  reed: [PALETTE.wetland, PALETTE.soil],
  'road-edge-node': [PALETTE.asphalt, PALETTE.asphalt],
  'road-edge-straight': [PALETTE.asphalt, PALETTE.asphalt],
});

const DEFAULT_COLORS = [PALETTE.wallBeige, PALETTE.roofOrange];

/** Famille d'un identifiant de modèle : le plus long préfixe connu (« building-tall-a » → « building-tall »). */
export function familyOf(id) {
  let best = null;
  for (const key of Object.keys(FALLBACK_HEIGHTS)) {
    if ((id === key || id.startsWith(key + '-') || id.startsWith(key)) && (!best || key.length > best.length)) best = key;
  }
  return best;
}

/** Hauteur de remplacement d'un identifiant (0,8 par défaut). */
export function fallbackHeight(id) {
  const family = familyOf(id);
  return family ? FALLBACK_HEIGHTS[family] : 0.8;
}

/** Matériau partagé à couleurs de sommets (Lambert : léger sur GPU mobile, rendu doux). */
export function createVertexColorMaterial() {
  return new THREE.MeshLambertMaterial({ vertexColors: true });
}

// ---------------------------------------------------------------------------------------------
// Outils de géométrie
// ---------------------------------------------------------------------------------------------

const _color = new THREE.Color();

/** Remplit (ou crée) l'attribut `color` d'une géométrie avec une couleur unie (espace linéaire). */
export function paintGeometry(geometry, hex) {
  _color.set(hex);
  return paintGeometryLinear(geometry, _color.r, _color.g, _color.b);
}

function paintGeometryLinear(geometry, r, g, b) {
  const n = geometry.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = r; arr[i * 3 + 1] = g; arr[i * 3 + 2] = b; }
  geometry.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geometry;
}

/** Copie Float32 (dénormalisée) d'un attribut, avec `itemSize` composantes (tronque ou complète par 1). */
function toFloat32(attr, itemSize = attr.itemSize) {
  if (attr.array instanceof Float32Array && !attr.normalized && attr.itemSize === itemSize && !attr.isInterleavedBufferAttribute) return attr;
  const n = attr.count;
  const out = new Float32Array(n * itemSize);
  const getters = [(i) => attr.getX(i), (i) => attr.getY(i), (i) => attr.getZ(i), (i) => attr.getW(i)];
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < itemSize; c++) out[i * itemSize + c] = c < attr.itemSize ? getters[c](i) : 1;
  }
  return new THREE.BufferAttribute(out, itemSize);
}

/** Ne garde que position, normal, color (+ uv si demandé), tout en Float32, et indexe la géométrie. */
function normalizeAttributes(geometry, keepUv) {
  for (const name of Object.keys(geometry.attributes)) {
    if (name === 'position' || name === 'normal' || name === 'color' || (keepUv && name === 'uv')) continue;
    geometry.deleteAttribute(name);
  }
  geometry.morphAttributes = {};
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
  } else if (!(geometry.index.array instanceof Uint32Array) && !(geometry.index.array instanceof Uint16Array)) {
    geometry.setIndex(new THREE.BufferAttribute(Uint32Array.from(geometry.index.array), 1));
  }
  return geometry;
}

/** Fusionne des géométries (toutes indexées, mêmes attributs) ; nettoie les groupes. */
export function mergeParts(parts) {
  const merged = parts.length === 1 ? parts[0] : mergeGeometries(parts, false);
  if (!merged) throw new Error('fusion de géométries impossible (attributs incompatibles)');
  merged.clearGroups();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

/** Pose la géométrie sur y = 0 et la centre en X/Z. */
function groundGeometry(geometry) {
  geometry.computeBoundingBox();
  const b = geometry.boundingBox;
  geometry.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

// ---------------------------------------------------------------------------------------------
// Géométries de remplacement
// ---------------------------------------------------------------------------------------------

function box(w, h, d, hex, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y + h / 2, z);
  return paintGeometry(g, hex);
}

/** Toit à deux pans (prisme) posé sur une boîte de largeur w et profondeur d. */
function roof(w, d, h, hex, y) {
  const g = new THREE.CylinderGeometry(0, Math.SQRT1_2, d, 4, 1, false);
  // Cylindre à 4 côtés et rayon 0 au sommet = pyramide ; on l'écrase en prisme à 2 pans.
  g.rotateY(Math.PI / 4);
  g.rotateX(Math.PI / 2);
  g.scale(w * 1.08, h, 1.04);
  g.translate(0, y + h / 2, 0);
  return paintGeometry(g, hex);
}

function buildFallbackGeometry(id) {
  const family = familyOf(id);
  const h = fallbackHeight(id);
  const [wall, accent] = FALLBACK_COLORS[family] || DEFAULT_COLORS;
  const s = FOOTPRINT;
  let parts;
  switch (family) {
    case 'tree': {
      // Feuillu : tronc + houppier arrondi (icosaèdre à facettes, esprit low poly).
      const trunk = new THREE.CylinderGeometry(0.05, 0.07, 0.3, 6);
      trunk.translate(0, 0.15, 0);
      const canopy = new THREE.IcosahedronGeometry(0.3, 1);
      canopy.scale(1, (h - 0.3) / 0.6, 1);
      canopy.translate(0, 0.3 + (h - 0.3) / 2, 0);
      parts = [paintGeometry(trunk, wall), paintGeometry(canopy, accent)];
      break;
    }
    case 'pine': {
      const trunk = new THREE.CylinderGeometry(0.04, 0.06, 0.25, 6);
      trunk.translate(0, 0.125, 0);
      const canopy = new THREE.ConeGeometry(0.27, h - 0.2, 7);
      canopy.translate(0, 0.2 + (h - 0.2) / 2, 0);
      parts = [paintGeometry(trunk, wall), paintGeometry(canopy, accent)];
      break;
    }
    case 'bush': {
      const g = new THREE.IcosahedronGeometry(0.22, 1);
      g.scale(1.1, h / 0.44, 1);
      g.translate(0, h / 2, 0);
      parts = [paintGeometry(g, wall)];
      break;
    }
    case 'flower': {
      const stem = new THREE.CylinderGeometry(0.012, 0.012, 0.09, 4);
      stem.translate(0, 0.045, 0);
      const head = new THREE.SphereGeometry(0.035, 6, 4);
      head.translate(0, 0.1, 0);
      parts = [paintGeometry(stem, wall), paintGeometry(head, accent)];
      break;
    }
    case 'rock': {
      const g = new THREE.DodecahedronGeometry(0.2, 0);
      g.scale(1, 0.75, 0.85);
      g.translate(0, 0.14, 0);
      parts = [paintGeometry(g, wall)];
      break;
    }
    case 'crop': {
      // Quatre rangs de culture sur un sol labouré.
      parts = [box(0.8, 0.03, 0.8, wall)];
      for (let i = 0; i < 4; i++) parts.push(box(0.8, 0.09, 0.12, accent, 0, 0.03, -0.3 + i * 0.2));
      break;
    }
    case 'grass':
    case 'reed': {
      const g = new THREE.ConeGeometry(0.06, h, 4);
      g.translate(0, h / 2, 0);
      parts = [paintGeometry(g, wall)];
      break;
    }
    case 'road-edge-node':
      parts = [box(0.3, 0.022, 0.3, wall)];
      break;
    case 'road-edge-straight':
      parts = [box(1, 0.02, 0.3, wall)];
      break;
    case 'house':
    case 'school':
    case 'townhall':
    case 'shop':
    case 'market':
    case 'station':
    case 'clinic': {
      // Boîte + toit à deux pans : lisible de loin, fidèle à l'esprit des kits.
      const bodyH = h * 0.7;
      parts = [box(s * 0.9, bodyH, s * 0.9, wall), roof(s * 0.9, s * 0.9, h - bodyH, accent, bodyH)];
      break;
    }
    case 'factory': {
      parts = [box(s, h, s, wall), box(0.14, 0.7, 0.14, accent, s * 0.3, h, -s * 0.3)];
      break;
    }
    case 'wastewater': {
      // Deux bassins ronds sur une dalle.
      parts = [box(s, 0.06, s, wall)];
      for (const dx of [-0.2, 0.2]) {
        const tank = new THREE.CylinderGeometry(0.18, 0.18, h - 0.06, 10);
        tank.translate(dx, 0.06 + (h - 0.06) / 2, 0);
        parts.push(paintGeometry(tank, accent));
      }
      break;
    }
    case 'tram-stop': {
      parts = [box(s * 0.9, 0.04, s * 0.5, PALETTE.sidewalk), box(0.05, h, 0.05, wall, -0.3, 0.04, 0), box(0.05, h, 0.05, wall, 0.3, 0.04, 0), box(s * 0.85, 0.04, 0.4, accent, 0, h, 0)];
      break;
    }
    case 'wind-turbine': {
      const mast = new THREE.CylinderGeometry(0.03, 0.05, h, 6);
      mast.translate(0, h / 2, 0);
      parts = [paintGeometry(mast, wall), box(0.06, 0.9, 0.06, accent, 0, h - 0.45, 0.05)];
      break;
    }
    case 'solar':
      parts = [box(s, h, s, wall), box(s * 0.9, 0.02, s * 0.9, accent, 0, h, 0)];
      break;
    default: {
      // Boîte 0,85 × h × 0,85, toit plat teinté.
      parts = [box(s, h, s, wall), box(s, 0.04, s, accent, 0, h, 0)];
    }
  }
  const geometry = mergeParts(parts.map((p) => normalizeAttributes(p, false)));
  return groundGeometry(geometry);
}

// ---------------------------------------------------------------------------------------------
// Échantillonnage des textures-palettes
// ---------------------------------------------------------------------------------------------

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

/**
 * Lit les pixels d'une texture (une fois par texture) : { width, height, data (RGBA 8 bits) } ou
 * null si l'image n'est pas lisible (pas de canvas, image absente).
 */
function readTexturePixels(texture, cache) {
  if (cache.has(texture.uuid)) return cache.get(texture.uuid);
  let pixels = null;
  try {
    const image = texture.image;
    const width = image.width || image.naturalWidth, height = image.height || image.naturalHeight;
    if (image && width && height) {
      const canvas = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(width, height) : (typeof document !== 'undefined' ? document.createElement('canvas') : null);
      if (canvas) {
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, 0, 0);
        pixels = { width, height, data: ctx.getImageData(0, 0, width, height).data };
      }
    }
  } catch (err) {
    console.warn('[models] texture illisible, matériau texturé conservé', err);
    pixels = null;
  }
  cache.set(texture.uuid, pixels);
  return pixels;
}

/** Couleurs de sommets depuis la texture-palette échantillonnée aux UV (transformation KHR comprise). */
function bakeTextureToColors(geometry, texture, pixels, tint) {
  const uv = geometry.attributes.uv;
  const n = geometry.attributes.position.count;
  const out = new Float32Array(n * 3);
  texture.updateMatrix();
  const m = texture.matrix.elements; // matrice 3 × 3 colonne-major
  const flipY = texture.flipY;
  for (let i = 0; i < n; i++) {
    const u0 = uv.getX(i), v0 = uv.getY(i);
    let u = m[0] * u0 + m[3] * v0 + m[6];
    let v = m[1] * u0 + m[4] * v0 + m[7];
    u -= Math.floor(u); v -= Math.floor(v);                 // répétition
    const px = Math.min(pixels.width - 1, Math.floor(u * pixels.width));
    const row = flipY ? Math.floor((1 - v) * pixels.height) : Math.floor(v * pixels.height);
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

// ---------------------------------------------------------------------------------------------
// Chargement du manifeste et des GLB
// ---------------------------------------------------------------------------------------------

/** Résout une URL de fichier relative au manifeste. */
function resolveUrl(manifestUrl, file) {
  if (/^(https?:)?\/\//.test(file) || file.startsWith('/') || file.startsWith('data:')) return file;
  const clean = manifestUrl.split(/[?#]/)[0];
  const base = clean.slice(0, clean.lastIndexOf('/') + 1);
  return base + file;
}

const _white = new THREE.Color(1, 1, 1);

/**
 * Noms des nœuds d'un modèle à garder HORS de la fusion (pièces animées à part : pales d'éolienne,
 * cheminées…) : le champ `exclude` du manifeste, sinon `nodes` (nœuds conservés par l'import, pivot
 * au bon endroit). Toujours un tableau de chaînes.
 */
export function excludedNodeNames(entry) {
  if (!entry) return [];
  const list = Array.isArray(entry.exclude) ? entry.exclude : (Array.isArray(entry.nodes) ? entry.nodes : []);
  return list.filter((n) => typeof n === 'string' && n.length > 0);
}

/** Le nœud exclu (lui-même ou un ancêtre) qui porte `obj`, ou null. */
function excludedOwner(obj, names) {
  if (!names.length) return null;
  for (let o = obj; o; o = o.parent) if (names.includes(o.name)) return o;
  return null;
}

/** Translation d'une matrice (colonne 4) dans `out`. */
function matrixPosition(m, out) {
  return out.set(m.elements[12], m.elements[13], m.elements[14]);
}

/**
 * Convertit une scène GLTF en une géométrie unique à couleurs de sommets. Renvoie
 * { geometry, kind: 'colored' | 'textured', texture, parts } ; `textured` seulement si une texture n'a
 * pas pu être échantillonnée (la géométrie garde alors ses UV).
 * `excludeNames` : nœuds laissés hors de la fusion ; chacun devient une pièce de `parts`
 * ({ name: { geometry, pivot: [x, y, z] } }), géométrie exprimée AU PIVOT (origine du nœud), le pivot
 * dans le repère final du modèle (centré en X/Z, posé sur y = 0 avec les pièces comprises dans la boîte).
 */
function bakeScene(scene, textureCache, excludeNames = []) {
  scene.updateMatrixWorld(true);
  const colored = [];
  const textured = [];
  const partsByNode = new Map(); // nœud exclu → { geometries: [], pivot: Vector3 }
  let texture = null;
  const local = new THREE.Matrix4();
  scene.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry) return;
    const owner = excludedOwner(obj, excludeNames);
    let part = null;
    if (owner) {
      part = partsByNode.get(owner);
      if (!part) {
        part = { geometries: [], pivot: matrixPosition(owner.matrixWorld, new THREE.Vector3()) };
        partsByNode.set(owner, part);
      }
    }
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    const groups = obj.geometry.groups.length && Array.isArray(obj.material) ? obj.geometry.groups : [null];
    for (const group of groups) {
      const material = materials[group ? group.materialIndex : 0] || materials[0];
      const g = obj.geometry.clone();
      if (group && g.index) {
        g.setIndex(new THREE.BufferAttribute(g.index.array.slice(group.start, group.start + group.count), 1));
      }
      const tint = material && material.color ? material.color : _white;
      const map = material && material.map;
      normalizeAttributes(g, Boolean(map));
      if (part) {
        // Pièce animée : sommets relatifs au pivot (la rotation et l'échelle du nœud sont cuites, pas sa position).
        local.copy(obj.matrixWorld);
        local.elements[12] -= part.pivot.x; local.elements[13] -= part.pivot.y; local.elements[14] -= part.pivot.z;
        g.applyMatrix4(local);
      } else {
        g.applyMatrix4(obj.matrixWorld);
      }
      let isTextured = false;
      if (map && g.attributes.uv) {
        const pixels = readTexturePixels(map, textureCache);
        if (pixels) {
          bakeTextureToColors(g, map, pixels, tint);
        } else {
          texture = texture || map;
          if (!g.attributes.color) paintGeometryLinear(g, tint.r, tint.g, tint.b);
          isTextured = true;
        }
      } else {
        g.deleteAttribute('uv');
        if (g.attributes.color) {
          // COLOR_0 du GLTF × couleur du matériau.
          const c = g.attributes.color.array;
          for (let i = 0; i < c.length; i += 3) { c[i] *= tint.r; c[i + 1] *= tint.g; c[i + 2] *= tint.b; }
        } else {
          paintGeometryLinear(g, tint.r, tint.g, tint.b);
        }
      }
      if (part) {
        // Les pièces restent à couleurs de sommets (texture illisible → teinte du matériau).
        if (g.attributes.uv) g.deleteAttribute('uv');
        part.geometries.push(g);
      } else if (isTextured) {
        textured.push(g);
      } else {
        colored.push(g);
      }
    }
  });
  if (!colored.length && !textured.length) {
    if (!partsByNode.size) throw new Error('aucun mesh dans le GLB');
    // Tout le modèle était exclu : on garde tout fusionné (rien à animer séparément).
    for (const part of partsByNode.values()) {
      for (const g of part.geometries) { g.translate(part.pivot.x, part.pivot.y, part.pivot.z); colored.push(g); }
    }
    partsByNode.clear();
  }
  let mainParts, kind;
  if (textured.length) {
    // Repli mixte : les parties colorées reçoivent des UV nulles (la texture y est multipliée par la couleur).
    for (const g of colored) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    mainParts = textured.concat(colored); kind = 'textured';
  } else {
    mainParts = colored; kind = 'colored';
  }
  const geometry = mergeParts(mainParts);
  const parts = {};
  for (const [node, part] of partsByNode) {
    parts[node.name] = { geometry: mergeParts(part.geometries), pivot: part.pivot };
  }
  // Pose sur y = 0 et centrage X/Z d'après la boîte de TOUT le modèle (pièces comprises, à leur pivot) :
  // le modèle garde exactement la place que lui a donnée l'import, pales en place ou non.
  const box = geometry.boundingBox.clone();
  const partBox = new THREE.Box3();
  for (const part of Object.values(parts)) {
    partBox.copy(part.geometry.boundingBox).translate(part.pivot);
    box.union(partBox);
  }
  const dx = -(box.min.x + box.max.x) / 2, dy = -box.min.y, dz = -(box.min.z + box.max.z) / 2;
  geometry.translate(dx, dy, dz);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  for (const part of Object.values(parts)) {
    part.pivot = [part.pivot.x + dx, part.pivot.y + dy, part.pivot.z + dz];
  }
  return { geometry, kind, texture, parts };
}

/**
 * Charge le manifeste et tous ses modèles. Ne rejette jamais pour un modèle ou un manifeste
 * absent : les identifiants manquants recevront des géométries de remplacement.
 * `options.fetch` permet d'injecter un `fetch` (tests) ; `options.onProgress(loaded, total)`.
 */
export async function loadModels(manifestUrl, options = {}) {
  const fetchFn = options.fetch || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
  const entries = new Map();           // id → { geometry, material, height, source, entry }
  const fallbacks = new Map();         // id → { geometry, material, height, source: 'fallback' }
  const texturedMaterials = new Map(); // texture.uuid → matériau texturé (repli)
  const textureCache = new Map();      // texture.uuid → pixels
  const vertexMaterial = createVertexColorMaterial();
  let manifest = null;
  let palette = PALETTE_LIST;
  const errors = [];

  if (manifestUrl && fetchFn) {
    try {
      const res = await fetchFn(manifestUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      manifest = await res.json();
      if (Array.isArray(manifest.palette) && manifest.palette.length) palette = manifest.palette;
    } catch (err) {
      errors.push({ id: '(manifest)', error: String((err && err.message) || err) });
      console.warn(`[models] manifeste absent ou illisible (${manifestUrl}) : boîtes de remplacement.`, err);
    }
  }

  const models = manifest && manifest.models ? Object.entries(manifest.models) : [];
  if (models.length) {
    const loader = new GLTFLoader();
    try {
      await MeshoptDecoder.ready;
      loader.setMeshoptDecoder(MeshoptDecoder);
    } catch (err) {
      console.warn('[models] décodeur meshopt indisponible', err);
    }
    let loaded = 0;
    await Promise.all(models.map(async ([id, entry]) => {
      try {
        const url = resolveUrl(manifestUrl, entry.file || `${id}.glb`);
        const gltf = await loader.loadAsync(url);
        let { geometry, kind, texture, parts: rawParts } = bakeScene(gltf.scene, textureCache, excludedNodeNames(entry));
        const tree = softTree(id);
        if (tree) { geometry.dispose(); geometry=tree; }
        // Les toitures des maisons deviennent terre cuite, les jardins gardent leur vert.
        if (/^(house-|shop-|school$)/.test(id) && geometry.attributes.color) {
          const colors = geometry.attributes.color, pos = geometry.attributes.position;
          const top = geometry.boundingBox.max.y;
          const roof = new THREE.Color(id === 'house-b' ? '#e8ac78' : id.startsWith('shop') ? '#72969a' : '#c77958');
          for (let v=0;v<colors.count;v++) {
            const r=colors.getX(v),g=colors.getY(v),b=colors.getZ(v);
            if (pos.getY(v)>top*.48 && g>r*1.09 && g>b*1.12) colors.setXYZ(v,roof.r,roof.g,roof.b);
          }
        }
        let material = vertexMaterial;
        if (kind === 'textured' && texture) {
          if (!texturedMaterials.has(texture.uuid)) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texturedMaterials.set(texture.uuid, new THREE.MeshLambertMaterial({ map: texture, vertexColors: true }));
          }
          material = texturedMaterials.get(texture.uuid);
        }
        const parts = {};
        for (const [name, p] of Object.entries(rawParts)) {
          parts[name] = { name, geometry: p.geometry, material: vertexMaterial, pivot: p.pivot, height: p.geometry.boundingBox.max.y, source: 'glb' };
        }
        entries.set(id, { geometry, material, height: geometry.boundingBox.max.y, source: 'glb', entry, parts });
      } catch (err) {
        errors.push({ id, error: String((err && err.message) || err) });
        console.warn(`[models] modèle « ${id} » illisible : remplacement.`, err);
      } finally {
        loaded++;
        if (options.onProgress) options.onProgress(loaded, models.length);
      }
    }));
  }

  const api = {
    palette,
    manifest,
    errors,
    materials: { vertex: vertexMaterial, textured: texturedMaterials },
    get ids() { return Array.from(entries.keys()); },
    has(id) { return entries.has(id); },
    get(id) { return entries.get(id) || null; },
    /** Géométrie de remplacement (mise en cache) pour un identifiant absent. */
    fallback(id) {
      if (!fallbacks.has(id)) {
        const geometry = buildFallbackGeometry(id);
        fallbacks.set(id, { geometry, material: vertexMaterial, height: geometry.boundingBox.max.y, source: 'fallback' });
      }
      return fallbacks.get(id);
    },
    /** Modèle ou remplacement : ne renvoie jamais null. */
    resolve(id) { return entries.get(id) || api.fallback(id); },
    /**
     * Pièce laissée hors de la fusion (nœud `exclude` / `nodes` du manifeste), par exemple
     * `getPart('wind-turbine', 'blades')` → { name, geometry, material, pivot: [x, y, z], height } ;
     * la géométrie est exprimée au pivot (origine du nœud) dans le repère du modèle. null si absente.
     */
    getPart(id, name) {
      const e = entries.get(id);
      return (e && e.parts && e.parts[name]) || null;
    },
    /** Noms des pièces séparées d'un modèle (vide si aucune ou modèle absent). */
    partNames(id) {
      const e = entries.get(id);
      return e && e.parts ? Object.keys(e.parts) : [];
    },
    dispose() {
      for (const e of entries.values()) {
        e.geometry.dispose();
        if (e.parts) for (const p of Object.values(e.parts)) p.geometry.dispose();
      }
      for (const f of fallbacks.values()) f.geometry.dispose();
      for (const m of texturedMaterials.values()) { if (m.map) m.map.dispose(); m.dispose(); }
      vertexMaterial.dispose();
      entries.clear(); fallbacks.clear(); texturedMaterials.clear(); textureCache.clear();
    },
  };
  return api;
}
