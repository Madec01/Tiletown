// Table de correspondance : identifiant Tiletown → kit, fichier source, échelle, orientation, empreinte.
// Lue par tools/import-models.js pour produire assets/models/<id>.glb et manifest.json.
//
// Conventions (docs/ARCHITECTURE.md §5) : 1 case = 1 unité, origine au centre de la case, y vers le
// haut, le modèle regarde vers +Z (sud). Repère des rues : N = -Z, S = +Z, E = +X, W = -X.
//
// Champs d'une entrée :
//   kit        slug kenney.nl du kit principal (clé de tools/fetch-kits.js)
//   source     fichier GLB dans « Models/GLB format/ » (ou « Models/GLTF format/ » pour le Nature Kit)
//   scale      échelle uniforme explicite, OU
//   fit        largeur cible (u) de l'empreinte au sol : l'échelle est calculée pour que max(x, z) = fit
//   yaw        rotation (degrés, autour de Y) appliquée à la source pour qu'elle regarde vers +Z
//   footprint  [colonnes, lignes] occupées (toujours [1, 1] pour l'instant)
//   materials  { nomDeMatériauSource: rôleDePalette } : couleur imposée (matériaux sans texture)
//   keepNodes  noms des nœuds à garder séparés (pivot conservé) pour une animation éventuelle
//   parts      assemblage : liste de pièces { kit, source, at, yaw, scale, materials } ou de
//              primitives { primitive: 'box' | 'cylinder' | 'cone', size | radius/height, at, color, topColor }
//   details    pièces de caractère ajoutées APRÈS la mise à l'échelle (débord de toiture, cheminée,
//              porche, lucarne…), repérées par `atRel` / `slice` dans la boîte englobante
//   profile    surcharge du profil de rôles du kit pour ce modèle seulement (KIT_ROLE_PROFILES)
//   seed       graine de l'attribution des teintes par rôle (par défaut : l'identifiant)
//   orientation  note lisible sur l'orientation (rues : axe, bras)
//   provisional  true si le modèle est un pis-aller à remplacer
//   note       remarque libre, reportée dans le manifeste

import { roleColor, hashSeed, FOLIAGE_COLORS } from '../src/data/palette.js';
import { ARCHITECTURE } from './architecture.js';

const SUBURBAN = 'city-kit-suburban';
const COMMERCIAL = 'city-kit-commercial';
const INDUSTRIAL = 'city-kit-industrial';
const ROADS = 'city-kit-roads';
const NATURE = 'nature-kit';
const TRAIN = 'train-kit';
const CARS = 'car-kit';
const FANTASY = 'fantasy-town-kit';
const MODULAR = 'modular-buildings';

/**
 * Couleurs imposées par kit pour les matériaux NOMMÉS (nom de matériau source → rôle de sous-palette,
 * ou teinte exacte). Le Nature Kit a des teintes pastel (vert d'eau, pêche) : on les ramène aux rôles
 * attendus. Une valeur qui est un RÔLE (`foliage`, `trunk`…) laisse l'import tirer dans la sous-palette
 * du rôle ; une valeur qui est une teinte nommée (`sun`, `river`…) est imposée telle quelle.
 */
export const KIT_MATERIALS = {
  [NATURE]: {
    grass: 'grassLight', leafsGreen: 'foliage', leafsDark: 'foliage', leafsFall: 'roofOrange',
    woodBark: 'trunk', woodBarkDark: 'trunk', wood: 'wallTan', woodDark: 'trunk', woodBirch: 'wallCream', woodInner: 'wallBeige',
    dirt: 'soil', dirtDark: 'soil', stone: 'rockLight', stoneDark: 'rock', water: 'river',
    colorRed: 'blossom', colorRedDark: 'roofRed', colorPurple: 'blossom', colorYellow: 'sun', colorWhite: 'wallCream',
    colorTan: 'wallBeige', corn: 'sun', _defaultMat: 'wallCream',
  },
  [FANTASY]: { Water: 'river' },
};

/**
 * PROFIL DE RÔLES d'un kit : il guide `detectRole` (tools/import-models.js) quand la couleur seule ne
 * suffit pas. Les toits des kits de ville de Kenney sont VERTS : dans ces kits, un aplat vert haut
 * dans la boîte est une toiture, et un aplat vert au pied du modèle est la pelouse. Dans le Nature Kit,
 * le même vert est un feuillage.
 *
 * Clés : `green` (rôle des verts, ou 'roof' pour la règle « haut = toit, bas = pelouse »),
 * `light` (aplats clairs peu saturés), `mid` (aplats moyens), `dark` (aplats sombres),
 * `warm` (bruns et ocres clairs), `bark` (bruns sombres), `glass` (bleus clairs saturés),
 * `flat` (sommet plat et horizontal = toiture-terrasse ; absent = pas de règle).
 * Une valeur peut être un rôle (teinte tirée dans la sous-palette) ou une teinte exacte.
 */
export const KIT_ROLE_PROFILES = {
  [SUBURBAN]:   { green: 'roof', light: 'wall', mid: 'base', dark: 'trim', warm: 'trim', flat: 'roofFlat' },
  [COMMERCIAL]: { green: 'roof', light: 'wall', mid: 'base', dark: 'trim', warm: 'accent', flat: 'roofFlat' },
  [INDUSTRIAL]: { green: 'roof', light: 'wall', mid: 'metal', dark: 'trim', warm: 'accent', flat: 'roofFlat' },
  [MODULAR]:    { green: 'roof', light: 'wall', mid: 'base', dark: 'trim', warm: 'trim', flat: 'roofFlat' },
  [FANTASY]:    { green: 'foliage', light: 'wall', mid: 'base', dark: 'trim', warm: 'trunk', bark: 'trunk' },
  [NATURE]:     { green: 'foliage', light: 'wallCream', mid: 'rock', dark: 'trunk', warm: 'trunk', bark: 'trunk' },
  [ROADS]:      { green: 'grassLight', light: 'marking', mid: 'sidewalk', dark: 'asphalt', warm: 'soil', glass: 'marking' },
  [TRAIN]:      { green: 'foliage', light: 'wall', mid: 'metal', dark: 'trim', warm: 'wood' },
  [CARS]:       { green: 'accent', light: 'marking', mid: 'metal', dark: 'asphalt', warm: 'accent' },
  tiletown:     {},
};

/** Largeur d'empreinte d'un bâtiment sur une case (bande de rue autour). */
const BUILDING_FIT = 0.85;
/** Échelle du Car Kit (voitures à l'échelle réelle, berline 2,55 u) et du Train Kit. */
const CAR_SCALE = 0.35;

// Blocs modulaires Kenney : 1 × 0,625 × 1 u, façade vers +Z ; les coins portent leurs faces vers +X et +Z.
const FLOOR = 0.625;
/** Lacet d'un bloc de coin pour qu'il regarde vers les deux faces extérieures voulues. */
const CORNER_YAW = { frontRight: 0, frontLeft: -90, backLeft: 180, backRight: 90 };

/** Un étage rectangulaire de blocs modulaires (cols × rows), façade +Z au rang z = rows - 1. */
function modularFloor(y, cols, rows, { wall = 'building-window.glb', corner = 'building-corner-window.glb', front = {} } = {}) {
  const parts = [];
  const x0 = -(cols - 1) / 2;
  const z0 = -(rows - 1) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c;
      const z = z0 + r;
      const isFront = r === rows - 1;
      const isBack = r === 0;
      const isLeft = c === 0;
      const isRight = c === cols - 1;
      let source = wall;
      let yaw = 0;
      if (isFront && isLeft) { source = corner; yaw = CORNER_YAW.frontLeft; }
      else if (isFront && isRight) { source = corner; yaw = CORNER_YAW.frontRight; }
      else if (isBack && isLeft) { source = corner; yaw = CORNER_YAW.backLeft; }
      else if (isBack && isRight) { source = corner; yaw = CORNER_YAW.backRight; }
      else if (isFront) { source = front[c] || wall; yaw = 0; }
      else if (isBack) { yaw = 180; }
      else if (isLeft) { yaw = -90; }
      else if (isRight) { yaw = 90; }
      else { source = 'building-block.glb'; }
      parts.push({ kit: MODULAR, source, at: [x, y, z], yaw });
    }
  }
  return parts;
}

/** Toit plat à parapet (bordures sur le pourtour, centre plat). */
function modularRoof(y, cols, rows) {
  const parts = [];
  const x0 = -(cols - 1) / 2;
  const z0 = -(rows - 1) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c;
      const z = z0 + r;
      const isFront = r === rows - 1, isBack = r === 0, isLeft = c === 0, isRight = c === cols - 1;
      let source = 'roof-flat-center.glb';
      let yaw = 0;
      if (isFront && isLeft) { source = 'roof-flat-border-corner.glb'; yaw = CORNER_YAW.frontLeft; }
      else if (isFront && isRight) { source = 'roof-flat-border-corner.glb'; yaw = CORNER_YAW.frontRight; }
      else if (isBack && isLeft) { source = 'roof-flat-border-corner.glb'; yaw = CORNER_YAW.backLeft; }
      else if (isBack && isRight) { source = 'roof-flat-border-corner.glb'; yaw = CORNER_YAW.backRight; }
      else if (isFront) { source = 'roof-flat-border-straight.glb'; yaw = 0; }
      else if (isBack) { source = 'roof-flat-border-straight.glb'; yaw = 180; }
      else if (isLeft) { source = 'roof-flat-border-straight.glb'; yaw = -90; }
      else if (isRight) { source = 'roof-flat-border-straight.glb'; yaw = 90; }
      parts.push({ kit: MODULAR, source, at: [x, y, z], yaw });
    }
  }
  return parts;
}

/** Mât et drapeau (primitives). */
function flag(at, color = 'blossom') {
  const [x, y, z] = at;
  return [
    { primitive: 'cylinder', radius: 0.025, height: 0.7, at: [x, y, z], color: 'metalLight' },
    { primitive: 'box', size: [0.32, 0.18, 0.02], at: [x + 0.16, y + 0.58, z], color },
  ];
}

// Rues étroites posées sur les arêtes : 0,3 u de large. Primitives aux couleurs de la palette.
const EDGE_W = 0.3;      // largeur totale
const CURB_W = 0.03;     // trottoir
const SLAB_H = 0.02;     // épaisseur de la chaussée
const CURB_H = 0.035;    // hauteur du trottoir
const CURB_X = EDGE_W / 2 - CURB_W / 2; // 0,135

function curbBox(size, at) { return { primitive: 'box', size, at, color: 'sidewalk' }; }
function curbCorner(x, z) { return curbBox([CURB_W, CURB_H, CURB_W], [x, 0, z]); }

// ─── Végétation : famille d'arbres à feuillage ARRONDI (primitives Tiletown, CC0) ───────────────
// Les arbres des kits ont des houppiers à facettes très marquées. On les reconstruit en VOLUMES LISSES
// et légèrement irréguliers (`blob` : ellipsoïde à normales analytiques et rayon bruité), empilés par
// deux à quatre sur un tronc un peu penché. Trois tailles par famille (s, m, l) et des verts voisins
// tirés dans FOLIAGE_COLORS : une forêt n'a jamais deux arbres identiques, et la silhouette reste douce.
// Budget : ≤ 400 triangles par arbre (il y en aura beaucoup).

/** Déplacement du sommet d'un tronc penché de [degX, degZ] : le houppier suit l'inclinaison. */
function leanTop(height, degX, degZ) {
  const tx = (degX * Math.PI) / 180, tz = (degZ * Math.PI) / 180;
  const y1 = height * Math.cos(tx);
  return [-y1 * Math.sin(tz), y1 * Math.cos(tz), height * Math.sin(tx)];
}

/** Inclinaison stable d'un arbre : un angle tiré de son identifiant, d'au plus `max` degrés. */
function leanOf(id, max) {
  const a = ((hashSeed(`${id}:lean`) % 360) * Math.PI) / 180;
  return [Math.cos(a) * max, Math.sin(a) * max];
}

/** Trois verts VOISINS pour un même arbre : houppier, volumes latéraux (plus sombres), cime (plus claire). */
function foliageShades(id, lo = 0, hi = FOLIAGE_COLORS.length - 1) {
  const n = FOLIAGE_COLORS.length;
  const base = lo + (hashSeed(`${id}:leaf`) % (hi - lo + 1));
  return {
    main: FOLIAGE_COLORS[base],
    side: FOLIAGE_COLORS[Math.min(n - 1, base + 1)],
    crown: FOLIAGE_COLORS[Math.max(0, base - 1)],
  };
}

/** Un volume de feuillage : `at` est son PIED (le centre est à la hauteur d'un rayon). */
function leaf(id, n, [cx, cy, cz], [rx, ry, rz], color, { segments = 8, rings = 5, jitter = 0.13 } = {}) {
  return { primitive: 'blob', radii: [rx, ry, rz], at: [cx, cy - ry, cz], color, segments, rings, jitter, seed: hashSeed(`${id}:${n}`) % 100000 };
}

/** Tronc fuselé à normales lisses, légèrement penché. */
function trunkPart(id, height, radius, tilt, { segments = 7, taper = 0.68, color = null } = {}) {
  return { primitive: 'cylinder', radius, topRadius: radius * taper, height, segments, smooth: true, noBottom: true, at: [0, 0, 0], tilt, color: color || roleColor('trunk', `${id}:bark`) };
}

/**
 * Feuillu à houppier rond ou ovale. `shape` : 'round' (large, trois à quatre volumes en bouquet) ou
 * 'tall' (étroit, volumes empilés en fuseau).
 */
function broadleaf(id, { trunkH, trunkR, r, rings = 5, segments = 8, blobs = 3, shape = 'round', lean = 5 }) {
  const tilt = leanOf(id, lean);
  const [tx, ty, tz] = leanTop(trunkH, tilt[0], tilt[1]);
  const c = foliageShades(id);
  const parts = [trunkPart(id, trunkH, trunkR, tilt, { segments: segments - 1 })];
  const a = ((hashSeed(`${id}:spin`) % 360) * Math.PI) / 180;
  if (shape === 'tall') {
    const ry = r * 1.35;
    parts.push(leaf(id, 0, [tx, ty + ry * 0.95, tz], [r, ry, r], c.main, { segments, rings, jitter: 0.1 }));
    parts.push(leaf(id, 1, [tx + Math.cos(a) * r * 0.28, ty + ry * 1.78, tz + Math.sin(a) * r * 0.28], [r * 0.74, ry * 0.58, r * 0.74], c.crown, { segments: segments - 1, rings: rings - 1, jitter: 0.12 }));
    if (blobs >= 3) parts.push(leaf(id, 2, [tx - Math.cos(a) * r * 0.4, ty + ry * 0.5, tz - Math.sin(a) * r * 0.4], [r * 0.58, ry * 0.46, r * 0.58], c.side, { segments: segments - 1, rings: rings - 1, jitter: 0.15 }));
  } else {
    parts.push(leaf(id, 0, [tx, ty + r * 0.92, tz], [r, r * 0.95, r], c.main, { segments, rings, jitter: 0.12 }));
    for (let i = 0; i < Math.max(0, blobs - 2); i++) {
      const ang = a + (i * 2 * Math.PI) / Math.max(1, blobs - 2);
      parts.push(leaf(id, 1 + i, [tx + Math.cos(ang) * r * 0.56, ty + r * 0.52, tz + Math.sin(ang) * r * 0.56], [r * 0.58, r * 0.56, r * 0.58], c.side, { segments: segments - 1, rings: rings - 1, jitter: 0.16 }));
    }
    parts.push(leaf(id, 9, [tx + Math.cos(a + 1.1) * r * 0.2, ty + r * 1.52, tz + Math.sin(a + 1.1) * r * 0.2], [r * 0.64, r * 0.6, r * 0.64], c.crown, { segments: segments - 1, rings: rings - 1, jitter: 0.13 }));
  }
  return parts;
}

/** Conifère « nuageux » : volumes aplatis de rayon décroissant, empilés sur un tronc court. */
function conifer(id, { trunkH, trunkR, r, levels = 4, step, segments = 8, lean = 3 }) {
  const tilt = leanOf(id, lean);
  const [tx, ty, tz] = leanTop(trunkH, tilt[0], tilt[1]);
  const c = foliageShades(id);
  const parts = [trunkPart(id, trunkH, trunkR, tilt, { segments: segments - 2, taper: 0.6 })];
  for (let i = 0; i < levels; i++) {
    const k = 1 - (i / levels) * 0.78;
    const ry = step * (1.05 - i * 0.06);
    parts.push(leaf(id, i, [tx, ty + step * i + ry * 0.9, tz], [r * k, ry, r * k], i % 2 ? c.side : c.main, { segments, rings: 4, jitter: 0.1 }));
  }
  parts.push(leaf(id, 8, [tx, ty + step * levels + step * 0.5, tz], [r * 0.2, step * 0.72, r * 0.2], c.crown, { segments: segments - 2, rings: 4, jitter: 0.08 }));
  return parts;
}

/** Arbuste : deux ou trois petits volumes au ras du sol. */
function shrub(id, { r = 0.17, n = 3, flat = 0.72 } = {}) {
  const c = foliageShades(id, 1, 3);
  const a = ((hashSeed(`${id}:spin`) % 360) * Math.PI) / 180;
  const parts = [leaf(id, 0, [0, r * flat, 0], [r, r * flat, r], c.main, { segments: 8, rings: 4, jitter: 0.16 })];
  for (let i = 1; i < n; i++) {
    const ang = a + (i * 2 * Math.PI) / (n - 1 || 1);
    parts.push(leaf(id, i, [Math.cos(ang) * r * 0.62, r * flat * 0.72, Math.sin(ang) * r * 0.62], [r * 0.66, r * flat * 0.78, r * 0.66], i % 2 ? c.side : c.crown, { segments: 7, rings: 4, jitter: 0.18 }));
  }
  return parts;
}

/** Touffe d'herbe : quelques lames fines, inclinées, en deux verts. */
function grassTuft(id, { n = 6, h = 0.13, r = 0.11 } = {}) {
  const c = foliageShades(id, 0, 2);
  const parts = [];
  for (let i = 0; i < n; i++) {
    // angles répartis en couronne (plus un peu de désordre) : la touffe ne penche pas d'un seul côté
    const ang = (i / n) * Math.PI * 2 + ((hashSeed(`${id}:${i}`) % 60) - 30) * Math.PI / 180;
    const d = 0.35 + ((hashSeed(`${id}:d${i}`) % 100) / 100) * 0.65;
    const hh = h * (0.6 + d * 0.5);
    parts.push({ primitive: 'cone', radius: 0.022, height: hh, segments: 5, noBottom: true, smooth: true,
      at: [Math.cos(ang) * r * d, 0, Math.sin(ang) * r * d], tilt: [Math.cos(ang) * 16, Math.sin(ang) * 16], color: i % 2 ? c.main : c.side });
  }
  return parts;
}

/** Décale toutes les pièces d'un assemblage (pour poser un arbre Tiletown dans un parc, un jardin…). */
function at(parts, [dx, dy, dz], scale = 1) {
  return parts.map((part) => {
    const p = { ...part, at: [(part.at?.[0] || 0) * scale + dx, (part.at?.[1] || 0) * scale + dy, (part.at?.[2] || 0) * scale + dz] };
    if (scale !== 1) {
      if (p.radii) p.radii = p.radii.map((v) => v * scale);
      if (p.size) p.size = p.size.map((v) => v * scale);
      if (p.radius) p.radius = p.radius * scale;
      if (p.topRadius) p.topRadius = p.topRadius * scale;
      if (p.height) p.height = p.height * scale;
    }
    return p;
  });
}

const VEG = (parts, note) => ({ kit: 'tiletown', scale: 1, yaw: 0, footprint: [1, 1], parts, note });

/** Tailles des trois gabarits d'arbre (petit, moyen, grand). */
const BROADLEAF = {
  s: { trunkH: 0.21, trunkR: 0.026, r: 0.175, segments: 8, rings: 5, blobs: 3 },
  m: { trunkH: 0.30, trunkR: 0.034, r: 0.225, segments: 9, rings: 5, blobs: 4 },
  l: { trunkH: 0.38, trunkR: 0.042, r: 0.255, segments: 9, rings: 6, blobs: 4 },
};
const NARROW = {
  s: { trunkH: 0.24, trunkR: 0.022, r: 0.120, segments: 8, rings: 5, blobs: 3, shape: 'tall' },
  m: { trunkH: 0.33, trunkR: 0.028, r: 0.148, segments: 8, rings: 6, blobs: 3, shape: 'tall' },
  l: { trunkH: 0.42, trunkR: 0.034, r: 0.172, segments: 9, rings: 6, blobs: 3, shape: 'tall' },
};
const CONIFER = {
  s: { trunkH: 0.10, trunkR: 0.022, r: 0.165, levels: 3, step: 0.125, segments: 8 },
  m: { trunkH: 0.13, trunkR: 0.027, r: 0.195, levels: 4, step: 0.145, segments: 8 },
  l: { trunkH: 0.16, trunkR: 0.032, r: 0.225, levels: 4, step: 0.185, segments: 9 },
};

// ─── Détails de caractère (primitives Tiletown, CC0) ────────────────────────────────────────────
// « Une silhouette reconnaissable et une belle palette apportent davantage que beaucoup de fenêtres. »
// Les modèles des kits sont des volumes nets : on leur ajoute, APRÈS mise à l'échelle, un débord de
// toiture, une cheminée, un porche ou une lucarne. Toutes ces pièces sont BISEAUTÉES (`bevel`) : une
// arête chanfreinée de quelques millimètres accroche la lumière et casse l'aspect « boîte ».
// Repères : `atRel` est relatif à la boîte englobante (x, z ∈ [-1, 1] = bords, y ∈ [0, 1] = sol → faîte),
// `at` ajoute un décalage en unités, `heightRel` donne une hauteur en fraction de celle du modèle.

/** Chanfrein standard des pièces ajoutées (≈ 7 mm à l'échelle d'une case). */
const BEVEL = 0.007;

/** Cheminée : conduit biseauté et sa couronne, plantée dans le toit et dépassant du faîte. */
function chimney([x, z], { y = 0.5, w = 0.055, heightRel = 0.55, tint = 'roofBrown', cap = 'baseStone', slice = [0.35, 0.75] } = {}) {
  return [
    { primitive: 'box', size: [w, 0, w], heightRel, atRel: [x, y, z], color: tint, bevel: BEVEL, slice },
    { primitive: 'box', size: [w * 1.55, 0.016, w * 1.55], atRel: [x, y + heightRel, z], color: cap, bevel: 0.004, slice },
  ];
}

/** Débord de toiture (ou bandeau de corniche) : dalle fine débordant de `pad` tout autour. */
function eave(y, { pad = 0.022, h = 0.024, tint = 'roofBrown', w = 1, d = 1, dy = 0, slice = [0.86, 1] } = {}) {
  return [{ primitive: 'box', sizeRel: [w, 0, d], height: h, pad, atRel: [0, y, 0], at: [0, dy, 0], color: tint, bevel: 0.005, slice }];
}

/** Porche : deux poteaux et un auvent devant la façade (+Z), à peine en saillie. */
function porch({ y = 0, w = 0.3, out = 0.075, h = 0.2, post = 0.026, roof = 'roofBrown', pillar = 'marking', slice = [0.08, 0.5] } = {}) {
  return [
    { primitive: 'box', size: [post, h, post], atRel: [0, y, 1], at: [-w / 2, 0, out - post / 2], color: pillar, bevel: 0.005, slice },
    { primitive: 'box', size: [post, h, post], atRel: [0, y, 1], at: [w / 2, 0, out - post / 2], color: pillar, bevel: 0.005, slice },
    { primitive: 'box', size: [w + 0.08, 0.024, out + 0.05], atRel: [0, y, 1], at: [0, h, (out - 0.05) / 2], color: roof, bevel: 0.005, slice },
  ];
}

/** Lucarne : petite boîte vitrée coiffée d'un chapeau, posée sur un pan de toit. */
function dormer([x, z], { y = 0.62, w = 0.1, h = 0.075, d = 0.085, wall = 'wallCream', pane = 'glassDeep', roof = 'roofBrown', slice = [0.45, 0.8] } = {}) {
  return [
    { primitive: 'box', size: [w, h, d], atRel: [x, y, z], color: wall, bevel: 0.006, slice },
    { primitive: 'box', size: [w * 0.52, h * 0.42, 0.014], atRel: [x, y, z], at: [0, h * 0.3, d / 2], color: pane, slice },
    { primitive: 'box', size: [w + 0.028, 0.014, d + 0.022], atRel: [x, y, z], at: [0, h, 0], color: roof, bevel: 0.004, slice },
  ];
}

/** Édicule technique sur une toiture-terrasse (cage d'escalier, machinerie) + garde-corps. */
function roofBox([x, z], { y = 1, w = 0.17, h = 0.09, d = 0.15, tint = 'baseStone', top = 'roofSlateDark', slice = [0.86, 1] } = {}) {
  return [
    { primitive: 'box', size: [w, h, d], atRel: [x, y, z], color: tint, bevel: BEVEL, slice },
    { primitive: 'box', size: [w + 0.02, 0.012, d + 0.02], atRel: [x, y, z], at: [0, h, 0], color: top, bevel: 0.004, slice },
  ];
}

export const MODEL_MAP = {
  // ─── Habitat (Suburban, Commercial) ────────────────────────────────────────────────
  // Six silhouettes de maison, trois d'immeuble bas, trois d'immeuble haut : chacune avec ses propres
  // teintes de toit et de façade (attribution par rôle, graine = identifiant) et ses détails.
  'house-a': {
    kit: SUBURBAN, source: 'building-type-a.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'maison en L avec garage ; cheminée et porche',
    details: [...chimney([0.42, -0.3], { y: 0.5, heightRel: 0.6 }), ...porch({ w: 0.26, h: 0.19 })],
  },
  'house-b': {
    kit: SUBURBAN, source: 'building-type-r.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'maison à étage et balcon ; cheminée et lucarne',
    details: [...chimney([-0.5, 0.1], { y: 0.55, heightRel: 0.45 }), ...dormer([0.22, 0.3], { y: 0.66 })],
  },
  'house-c': {
    kit: SUBURBAN, source: 'building-type-h.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'toit plat à panneaux solaires ; débord de toiture et édicule',
    details: [...eave(1, { pad: 0.026, h: 0.022, dy: -0.024 }), ...roofBox([-0.4, -0.35], { h: 0.07, w: 0.14, d: 0.13 })],
  },
  'house-d': {
    kit: SUBURBAN, source: 'building-type-s.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'maison compacte à pignon frontal ; cheminée et porche',
    details: [...chimney([-0.38, -0.25], { y: 0.52, heightRel: 0.5 }), ...porch({ w: 0.24, h: 0.2, out: 0.07 })],
  },
  'house-e': {
    kit: SUBURBAN, source: 'building-type-k.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'maison cubique à deux niveaux ; débord de toiture et lucarne de toit',
    details: [...eave(1, { pad: 0.03, h: 0.026, dy: -0.026 }), ...roofBox([0.3, -0.3], { h: 0.06, w: 0.13, d: 0.12 })],
  },
  'house-f': {
    kit: SUBURBAN, source: 'building-type-d.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'maison longue et basse ; deux lucarnes et une cheminée',
    details: [...chimney([0.55, -0.2], { y: 0.5, heightRel: 0.5 }), ...dormer([-0.3, 0.26], { y: 0.6 }), ...dormer([0.14, 0.26], { y: 0.6 })],
  },
  'building-small-a': {
    kit: COMMERCIAL, source: 'building-a.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'immeuble bas à toit-terrasse ; corniche et édicule',
    details: [...eave(1, { pad: 0.02, h: 0.022, dy: -0.022, tint: 'baseStone' }), ...roofBox([0.3, -0.3])],
  },
  'building-small-b': {
    kit: COMMERCIAL, source: 'building-d.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'immeuble bas à tourelle ; corniche',
    details: [...eave(0.74, { pad: 0.022, h: 0.02, tint: 'baseStone' })],
  },
  'building-small-c': {
    kit: COMMERCIAL, source: 'building-b.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'immeuble bas à étages décalés ; corniche et édicule',
    details: [...eave(1, { pad: 0.024, h: 0.022, dy: -0.022, tint: 'baseStone' }), ...roofBox([-0.28, 0.3], { w: 0.14, d: 0.12, h: 0.08 })],
  },
  'building-tall-a': {
    kit: COMMERCIAL, source: 'building-f.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'immeuble haut et étroit ; corniche, bandeau et édicule',
    details: [...eave(1, { pad: 0.022, h: 0.022, dy: -0.022, tint: 'baseStone' }), ...eave(0.18, { pad: 0.014, h: 0.016, tint: 'baseStone' }), ...roofBox([0.25, -0.25], { w: 0.14, d: 0.13, h: 0.08 })],
  },
  'building-tall-b': {
    kit: COMMERCIAL, source: 'building-l.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'immeuble haut compact ; corniche et édicule',
    details: [...eave(1, { pad: 0.022, h: 0.022, dy: -0.022, tint: 'baseStone' }), ...roofBox([-0.25, 0.25], { w: 0.15, d: 0.13, h: 0.09 })],
  },
  'building-tall-c': {
    kit: COMMERCIAL, source: 'building-skyscraper-c.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'tour élancée ; corniche et machinerie de toit',
    details: [...eave(1, { pad: 0.018, h: 0.02, dy: -0.02, tint: 'baseStone' }), ...roofBox([0, 0], { w: 0.2, d: 0.18, h: 0.06 })],
  },

  // ─── Activité (Commercial, Industrial) ─────────────────────────────────────────────
  'shop-a': {
    kit: COMMERCIAL, source: 'building-g.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'auvent orange en rez-de-chaussée ; corniche et édicule',
    details: [...eave(1, { pad: 0.022, h: 0.022, dy: -0.022, tint: 'baseStone' }), ...roofBox([0.26, -0.28], { w: 0.14, d: 0.12, h: 0.07 })],
  },
  'shop-b': {
    kit: COMMERCIAL, source: 'building-k.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'commerce large à auvents, bas ; corniche',
    details: [...eave(1, { pad: 0.024, h: 0.022, dy: -0.022, tint: 'baseStone' })],
  },
  'shop-c': {
    kit: COMMERCIAL, source: 'building-c.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'commerce de quartier à auvent vert ; corniche et édicule',
    details: [...eave(1, { pad: 0.024, h: 0.022, dy: -0.022, tint: 'baseStone' }), ...roofBox([-0.3, 0.26], { w: 0.13, d: 0.12, h: 0.07 })],
  },
  'office-a': {
    kit: COMMERCIAL, source: 'building-i.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'bureaux ; corniche, bandeau et machinerie de toit',
    details: [...eave(1, { pad: 0.022, h: 0.022, dy: -0.022, tint: 'baseStone' }), ...roofBox([-0.26, -0.26], { w: 0.16, d: 0.14, h: 0.08 })],
  },
  'office-b': {
    kit: COMMERCIAL, source: 'building-m.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'bureaux à terrasse plantée ; corniche et édicule',
    details: [...eave(1, { pad: 0.02, h: 0.02, dy: -0.02, tint: 'baseStone' }), ...roofBox([0.28, 0.28], { w: 0.14, d: 0.13, h: 0.07 })],
  },
  'factory-a': {
    kit: INDUSTRIAL, source: 'building-l.glb', fit: 0.9, yaw: 0, footprint: [1, 1],
    note: 'deux cheminées ; édicule de toit',
    details: [...roofBox([-0.35, 0.3], { y: 0.72, w: 0.16, d: 0.14, h: 0.07, tint: 'metalLight', top: 'metal' })],
  },
  'factory-b': {
    kit: INDUSTRIAL, source: 'building-e.glb', fit: 0.9, yaw: 0, footprint: [1, 1],
    note: 'deux cheminées sur le toit ; conduit supplémentaire',
    details: [...chimney([0.5, 0.35], { y: 0.45, w: 0.05, heightRel: 0.35, tint: 'metal', cap: 'metalLight' })],
  },
  'factory-c': {
    kit: INDUSTRIAL, source: 'building-j.glb', fit: 0.9, yaw: 0, footprint: [1, 1],
    note: 'hangar à toit cintré (silhouette très différente) ; conduit et édicule',
    details: [...chimney([-0.55, -0.3], { y: 0.5, w: 0.045, heightRel: 0.45, tint: 'metal', cap: 'metalLight' })],
  },

  // ─── Services (assemblés : Modular Buildings, Fantasy Town, Train Kit) ─────────────
  'school': {
    kit: MODULAR, fit: 0.92, yaw: 0, footprint: [1, 1],
    note: 'assemblage : 3 × 2 blocs, 2 étages, perron, toit à parapet, drapeau',
    parts: [
      ...modularFloor(0, 3, 2, { front: { 1: 'building-steps-wide.glb' } }),
      ...modularFloor(FLOOR, 3, 2, { front: { 1: 'building-window-awnings.glb' } }),
      ...modularRoof(2 * FLOOR, 3, 2),
      ...flag([0.9, 2 * FLOOR + 0.2, -0.4], 'sun'),
    ],
  },
  'clinic': {
    kit: MODULAR, fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'assemblage : 2 × 2 blocs, 2 étages, croix sur la façade et le toit',
    parts: [
      ...modularFloor(0, 2, 2, { corner: 'building-corner-window.glb', front: {} }).map((p) => (p.at[0] < 0 && p.at[2] > 0 ? { ...p, source: 'building-door-window.glb', yaw: 0 } : p)),
      ...modularFloor(FLOOR, 2, 2),
      ...modularRoof(2 * FLOOR, 2, 2),
      // Croix de la clinique sur la façade (+Z) à l'étage, et une seconde debout sur le toit
      { primitive: 'box', size: [0.5, 0.14, 0.04], at: [0, FLOOR + 0.31, 1.0], color: 'blossom' },
      { primitive: 'box', size: [0.14, 0.5, 0.04], at: [0, FLOOR + 0.31, 1.0], color: 'blossom' },
      { primitive: 'box', size: [0.6, 0.16, 0.08], at: [0, 2 * FLOOR + 0.5, 0], color: 'blossom' },
      { primitive: 'box', size: [0.16, 0.6, 0.08], at: [0, 2 * FLOOR + 0.5, 0], color: 'blossom' },
      { primitive: 'box', size: [0.7, 0.04, 0.7], at: [0, 2 * FLOOR + 0.2, 0], color: 'wallCream' },
    ],
  },
  'townhall': {
    kit: MODULAR, fit: 0.92, yaw: 0, footprint: [1, 1],
    note: 'assemblage : 3 × 2 blocs, 2 étages à grandes fenêtres, tour centrale, drapeau',
    parts: [
      ...modularFloor(0, 3, 2, { wall: 'building-window-large.glb', front: { 1: 'building-steps-wide.glb' } }),
      ...modularFloor(FLOOR, 3, 2, { wall: 'building-window-large.glb', front: { 1: 'building-window-large.glb' } }),
      ...modularRoof(2 * FLOOR, 3, 2),
      { kit: MODULAR, source: 'building-windows-round.glb', at: [0, 2 * FLOOR, 0.5], yaw: 0 },
      { kit: MODULAR, source: 'roof-flat-top.glb', at: [0, 3 * FLOOR, 0.5], yaw: 0 },
      ...flag([0, 3 * FLOOR + 0.2, 0.5], 'river'),
    ],
  },
  'market': {
    kit: FANTASY, fit: 0.9, yaw: 0, footprint: [1, 1],
    note: 'assemblage : deux étals (rouge, vert), charrette, banc et lanterne sur une dalle',
    parts: [
      { primitive: 'box', size: [2.1, 0.03, 1.8], at: [0, 0, 0], color: 'rockLight' },
      { kit: FANTASY, source: 'stall-red.glb', at: [-0.55, 0.03, 0.25], yaw: 0 },
      { kit: FANTASY, source: 'stall-green.glb', at: [0.55, 0.03, 0.25], yaw: 0 },
      { kit: FANTASY, source: 'cart.glb', at: [-0.5, 0.03, -0.55], yaw: 90 },
      { kit: FANTASY, source: 'stall-bench.glb', at: [0.6, 0.03, -0.5], yaw: 90 },
      { kit: FANTASY, source: 'lantern.glb', at: [0, 0.03, -0.6], yaw: 0, scale: 0.8 },
    ],
  },
  'tram-stop': {
    kit: TRAIN, scale: 1, yaw: 0, footprint: [1, 1], profile: { light: 'marking', mid: 'metal' },
    orientation: 'voie le long de Z (nord–sud) à x = -0,15 ; quai à l’est (x > 0,2)',
    note: 'assemblage : rails du Train Kit, quai, abri (poteaux + toit), banc et lanterne du Fantasy Town',
    parts: [
      { kit: TRAIN, source: 'spline-track.glb', at: [-0.15, 0, 0], yaw: 0 },
      { primitive: 'box', size: [0.3, 0.08, 0.96], at: [0.35, 0, 0], color: 'sidewalk' },
      { primitive: 'cylinder', radius: 0.018, height: 0.36, at: [0.26, 0.08, -0.2], color: 'metal' },
      { primitive: 'cylinder', radius: 0.018, height: 0.36, at: [0.26, 0.08, 0.2], color: 'metal' },
      { primitive: 'cylinder', radius: 0.018, height: 0.36, at: [0.46, 0.08, -0.2], color: 'metal' },
      { primitive: 'cylinder', radius: 0.018, height: 0.36, at: [0.46, 0.08, 0.2], color: 'metal' },
      { primitive: 'box', size: [0.3, 0.03, 0.56], at: [0.36, 0.44, 0], color: 'roofSlate' },
      { kit: FANTASY, source: 'stall-bench.glb', at: [0.42, 0.08, 0], yaw: 0, scale: 0.45 },
      { kit: FANTASY, source: 'lantern.glb', at: [0.42, 0.08, 0.4], yaw: 0, scale: 0.35 },
    ],
  },

  // ─── Infrastructure (Industrial + primitives) ──────────────────────────────────────
  'wastewater': {
    kit: INDUSTRIAL, fit: 0.92, yaw: 0, footprint: [1, 1],
    note: 'assemblage : deux bassins ronds, cuve et petit bâtiment technique',
    parts: [
      { primitive: 'box', size: [2.1, 0.03, 2.0], at: [0, 0, 0], color: 'rockLight' },
      { primitive: 'cylinder', radius: 0.46, height: 0.14, at: [-0.52, 0.03, 0.45], color: 'sidewalk', topColor: 'lakeDeep', segments: 20 },
      { primitive: 'cylinder', radius: 0.46, height: 0.14, at: [0.5, 0.03, 0.45], color: 'sidewalk', topColor: 'wetland', segments: 20 },
      { kit: INDUSTRIAL, source: 'detail-tank-large.glb', at: [0.55, 0.03, -0.5], yaw: 0, scale: 0.55 },
      { kit: INDUSTRIAL, source: 'building-k.glb', at: [-0.5, 0.03, -0.5], yaw: 0, scale: 0.75 },
    ],
  },
  'wind-turbine': { kit: INDUSTRIAL, source: 'windmill.glb', scale: 0.6, yaw: 90, footprint: [1, 1], keepNodes: ['blades'], profile: { light: 'marking', mid: 'metalLight' }, note: 'mât et pales blancs (profil imposé) ; le nœud « blades » reste séparé (pivot au moyeu) pour l’animation' },
  'solar': {
    kit: INDUSTRIAL, fit: 0.9, yaw: 0, footprint: [1, 1],
    note: 'assemblage : deux rangées de panneaux',
    parts: [
      { kit: INDUSTRIAL, source: 'solar-panel-landscape-group.glb', at: [0, 0, -0.47], yaw: 0 },
      { kit: INDUSTRIAL, source: 'solar-panel-landscape-group.glb', at: [0, 0, 0.47], yaw: 0 },
    ],
  },
  'power-plant': {
    kit: INDUSTRIAL, fit: 0.92, yaw: 0, footprint: [1, 1],
    note: 'assemblage : bâtiment, tour de refroidissement et cheminée',
    parts: [
      { kit: INDUSTRIAL, source: 'building-o.glb', at: [-0.6, 0, 0.1], yaw: 0 },
      { kit: INDUSTRIAL, source: 'chimney-large.glb', at: [0.45, 0, 0.3], yaw: 0 },
      { kit: INDUSTRIAL, source: 'chimney-medium.glb', at: [0.3, 0, -0.65], yaw: 0 },
    ],
  },
  'compost': {
    kit: INDUSTRIAL, fit: 0.9, yaw: 0, footprint: [1, 1],
    note: 'assemblage : trois conteneurs et deux tas de compost sur une dalle',
    parts: [
      { primitive: 'box', size: [1.4, 0.03, 1.5], at: [0, 0, 0], color: 'rockLight' },
      { kit: INDUSTRIAL, source: 'shipping-container-a.glb', at: [-0.45, 0.03, -0.3], yaw: 0 },
      { kit: INDUSTRIAL, source: 'shipping-container-b.glb', at: [0, 0.03, -0.3], yaw: 0 },
      { kit: INDUSTRIAL, source: 'shipping-container-c.glb', at: [0.45, 0.03, -0.3], yaw: 0 },
      { primitive: 'cone', radius: 0.3, height: 0.26, at: [-0.33, 0.03, 0.42], color: 'soil', segments: 12 },
      { primitive: 'cone', radius: 0.26, height: 0.2, at: [0.35, 0.03, 0.42], color: 'wood', segments: 12 },
    ],
  },
  'water-tower': { kit: INDUSTRIAL, source: 'water-tower.glb', scale: 0.7, yaw: 0, footprint: [1, 1], profile: { light: 'marking', mid: 'metalLight' }, note: 'cuve et charpente claires (profil imposé)' },

  // ─── Nature ────────────────────────────────────────────────────────────────────────
  'park': {
    kit: FANTASY, scale: 1, yaw: 0, footprint: [1, 1],
    note: 'assemblage : pelouse, fontaine, deux arbres, banc, fleurs',
    parts: [
      { primitive: 'box', size: [0.96, 0.03, 0.96], at: [0, 0, 0], color: 'grassLight' },
      { kit: FANTASY, source: 'fountain-round.glb', at: [0, 0.03, 0.02], yaw: 0, scale: 0.26 },
      ...at(broadleaf('park-tree-a', BROADLEAF.s), [-0.3, 0.03, -0.3], 0.95),
      ...at(broadleaf('park-tree-b', BROADLEAF.m), [0.29, 0.03, -0.28], 0.8),
      { kit: FANTASY, source: 'stall-bench.glb', at: [0.28, 0.03, 0.3], yaw: 90, scale: 0.4 },
      { kit: NATURE, source: 'flower_redA.glb', at: [-0.34, 0.03, 0.3], yaw: 0, scale: 0.8 },
      { kit: NATURE, source: 'flower_yellowB.glb', at: [-0.24, 0.03, 0.38], yaw: 40, scale: 0.8 },
    ],
  },
  // Famille d'arbres (volumes arrondis Tiletown). Les identifiants historiques tree-a/b/c, pine-a/b
  // et bush pointent vers ces nouvelles versions : rien ne casse côté jeu (src/data/tiles.js).
  'tree-round-s': VEG(broadleaf('tree-round-s', BROADLEAF.s), 'feuillu rond, jeune'),
  'tree-round-m': VEG(broadleaf('tree-round-m', BROADLEAF.m), 'feuillu rond, moyen'),
  'tree-round-l': VEG(broadleaf('tree-round-l', BROADLEAF.l), 'feuillu rond, grand'),
  'tree-tall-s': VEG(broadleaf('tree-tall-s', NARROW.s), 'feuillu en fuseau, jeune'),
  'tree-tall-m': VEG(broadleaf('tree-tall-m', NARROW.m), 'feuillu en fuseau, moyen'),
  'tree-tall-l': VEG(broadleaf('tree-tall-l', NARROW.l), 'feuillu en fuseau, grand'),
  'pine-s': VEG(conifer('pine-s', CONIFER.s), 'conifère jeune'),
  'pine-m': VEG(conifer('pine-m', CONIFER.m), 'conifère moyen'),
  'pine-l': VEG(conifer('pine-l', CONIFER.l), 'conifère grand'),
  'shrub-a': VEG(shrub('shrub-a', { r: 0.175, n: 3 }), 'arbuste rond'),
  'shrub-b': VEG(shrub('shrub-b', { r: 0.145, n: 4, flat: 0.62 }), 'arbuste bas et large'),
  'grass-tuft-a': VEG(grassTuft('grass-tuft-a', { n: 9, h: 0.19, r: 0.13 }), 'touffe d’herbe haute'),
  'grass-tuft-b': VEG(grassTuft('grass-tuft-b', { n: 7, h: 0.13, r: 0.10 }), 'touffe d’herbe rase'),
  'sapling': VEG([
    ...broadleaf('sapling', { trunkH: 0.14, trunkR: 0.013, r: 0.085, segments: 7, rings: 4, blobs: 2, lean: 7 }),
  ], 'jeune plant'),

  // Identifiants historiques (utilisés par src/data/tiles.js) : mêmes recettes, graines différentes.
  'tree-a': VEG(broadleaf('tree-a', BROADLEAF.m), 'feuillu rond moyen (= tree-round-m, autre graine)'),
  'tree-b': VEG(broadleaf('tree-b', NARROW.m), 'feuillu en fuseau moyen (= tree-tall-m, autre graine)'),
  'tree-c': VEG(broadleaf('tree-c', BROADLEAF.l), 'feuillu rond grand (= tree-round-l, autre graine)'),
  'pine-a': VEG(conifer('pine-a', CONIFER.m), 'conifère moyen (= pine-m, autre graine)'),
  'pine-b': VEG(conifer('pine-b', CONIFER.l), 'conifère grand (= pine-l, autre graine)'),
  'bush': VEG(shrub('bush', { r: 0.19, n: 3 }), 'arbuste rond (= shrub-a, autre graine)'),
  'flowers': {
    kit: NATURE, scale: 1, yaw: 0, footprint: [1, 1],
    note: 'assemblage : touffe de fleurs rouges, jaunes, roses et d’herbe',
    parts: [
      { kit: NATURE, source: 'flower_redA.glb', at: [-0.12, 0, -0.08], yaw: 0 },
      { kit: NATURE, source: 'flower_yellowB.glb', at: [0.12, 0, -0.1], yaw: 60 },
      { kit: NATURE, source: 'flower_purpleC.glb', at: [0.02, 0, 0.14], yaw: 150 },
      { kit: NATURE, source: 'grass_leafs.glb', at: [-0.16, 0, 0.14], yaw: 0 },
      { kit: NATURE, source: 'grass_leafs.glb', at: [0.2, 0, 0.1], yaw: 90 },
    ],
  },
  'rock-a': { kit: NATURE, source: 'rock_largeA.glb', scale: 0.6, yaw: 0, footprint: [1, 1], materials: { dirt: 'rock', grass: 'grassLight' } },
  'rock-b': { kit: NATURE, source: 'rock_largeB.glb', scale: 0.55, yaw: 30, footprint: [1, 1], materials: { dirt: 'rockLight', grass: 'grass' } },
  'crop-wheat': {
    kit: NATURE, scale: 0.8, yaw: 0, footprint: [1, 1],
    note: 'assemblage : quatre touffes de blé',
    materials: { woodInner: 'wheat', _defaultMat: 'sun' },
    parts: [
      { kit: NATURE, source: 'crops_wheatStageB.glb', at: [-0.27, 0, -0.25], yaw: 0 },
      { kit: NATURE, source: 'crops_wheatStageB.glb', at: [0.27, 0, -0.25], yaw: 90 },
      { kit: NATURE, source: 'crops_wheatStageB.glb', at: [-0.27, 0, 0.25], yaw: 180 },
      { kit: NATURE, source: 'crops_wheatStageB.glb', at: [0.27, 0, 0.25], yaw: 270 },
    ],
  },
  'crop-corn': {
    kit: NATURE, scale: 0.5, yaw: 0, footprint: [1, 1],
    note: 'assemblage : quatre pieds de maïs',
    materials: { grass: 'grass', corn: 'sun' },
    parts: [
      { kit: NATURE, source: 'crops_cornStageC.glb', at: [-0.45, 0, -0.45], yaw: 0 },
      { kit: NATURE, source: 'crops_cornStageC.glb', at: [0.45, 0, -0.45], yaw: 90 },
      { kit: NATURE, source: 'crops_cornStageC.glb', at: [-0.45, 0, 0.45], yaw: 180 },
      { kit: NATURE, source: 'crops_cornStageD.glb', at: [0.45, 0, 0.45], yaw: 270 },
    ],
  },

  // ─── Rues sur une case entière (City Kit Roads, tuile 1 × 1 u) ─────────────────────
  // Source Kenney : la ligne droite court le long de X ; on la tourne pour qu'elle suive Z (nord–sud).
  'road-straight': { kit: ROADS, source: 'road-straight.glb', scale: 1, yaw: 90, footprint: [1, 1], orientation: 'axe Z (nord–sud) ; bras N et S' },
  'road-corner': { kit: ROADS, source: 'road-bend.glb', scale: 1, yaw: 180, footprint: [1, 1], orientation: 'bras N et E' },
  'road-t': { kit: ROADS, source: 'road-intersection.glb', scale: 1, yaw: 90, footprint: [1, 1], orientation: 'bras N, E et S (fermé à l’ouest)' },
  'road-cross': { kit: ROADS, source: 'road-crossroad.glb', scale: 1, yaw: 0, footprint: [1, 1], orientation: 'bras N, E, S, W' },
  'road-crosswalk': { kit: ROADS, source: 'road-crossing.glb', scale: 1, yaw: 90, footprint: [1, 1], orientation: 'axe Z (nord–sud) ; passage piéton au centre' },
  'bridge': { kit: ROADS, source: 'road-bridge.glb', scale: 1, yaw: 0, footprint: [1, 1], orientation: 'axe Z (nord–sud) ; tablier à 0,5 u' },

  // ─── Rues étroites sur les arêtes (primitives, 0,3 u de large) ─────────────────────
  'road-edge-straight': {
    kit: 'tiletown', scale: 1, yaw: 0, footprint: [1, 1],
    orientation: 'axe Z (nord–sud), 0,3 u de large × 1 u de long, trottoirs à x = ±0,135',
    note: 'primitives : chaussée, deux trottoirs, pointillé central',
    parts: [
      { primitive: 'box', size: [EDGE_W, SLAB_H, 1], at: [0, 0, 0], color: 'asphalt' },
      curbBox([CURB_W, CURB_H, 1], [-CURB_X, 0, 0]),
      curbBox([CURB_W, CURB_H, 1], [CURB_X, 0, 0]),
      ...[-0.36, -0.12, 0.12, 0.36].map((z) => ({ primitive: 'box', size: [0.02, 0.006, 0.12], at: [0, SLAB_H, z], color: 'marking' })),
    ],
  },
  'road-edge-node-2': {
    kit: 'tiletown', scale: 1, yaw: 0, footprint: [1, 1],
    orientation: 'nœud d’angle 0,3 × 0,3 u ; bras N et E ; trottoir extérieur à l’ouest et au sud',
    parts: [
      { primitive: 'box', size: [EDGE_W, SLAB_H, EDGE_W], at: [0, 0, 0], color: 'asphalt' },
      curbBox([CURB_W, CURB_H, EDGE_W], [-CURB_X, 0, 0]),
      curbBox([EDGE_W, CURB_H, CURB_W], [0, 0, CURB_X]),
      curbCorner(CURB_X, -CURB_X),
    ],
  },
  'road-edge-node-3': {
    kit: 'tiletown', scale: 1, yaw: 0, footprint: [1, 1],
    orientation: 'nœud en T 0,3 × 0,3 u ; bras N, E et S ; trottoir à l’ouest',
    parts: [
      { primitive: 'box', size: [EDGE_W, SLAB_H, EDGE_W], at: [0, 0, 0], color: 'asphalt' },
      curbBox([CURB_W, CURB_H, EDGE_W], [-CURB_X, 0, 0]),
      curbCorner(CURB_X, -CURB_X),
      curbCorner(CURB_X, CURB_X),
    ],
  },
  'road-edge-node-4': {
    kit: 'tiletown', scale: 1, yaw: 0, footprint: [1, 1],
    orientation: 'croisement 0,3 × 0,3 u ; bras N, E, S, W',
    parts: [
      { primitive: 'box', size: [EDGE_W, SLAB_H, EDGE_W], at: [0, 0, 0], color: 'asphalt' },
      curbCorner(-CURB_X, -CURB_X), curbCorner(CURB_X, -CURB_X), curbCorner(-CURB_X, CURB_X), curbCorner(CURB_X, CURB_X),
    ],
  },

  // ─── Véhicules (Car Kit × 0,35 ; Train Kit × 0,35) : avant vers +Z ─────────────────
  'tram': { kit: TRAIN, source: 'train-tram-classic.glb', scale: CAR_SCALE, yaw: 0, footprint: [1, 1], orientation: 'avant vers +Z' },
  'car-a': { kit: CARS, source: 'sedan.glb', scale: CAR_SCALE, yaw: 0, footprint: [1, 1], orientation: 'avant vers +Z' },
  'car-b': { kit: CARS, source: 'hatchback-sports.glb', scale: CAR_SCALE, yaw: 0, footprint: [1, 1], orientation: 'avant vers +Z' },
  'bus': { kit: CARS, source: 'delivery.glb', scale: CAR_SCALE, yaw: 0, footprint: [1, 1], orientation: 'avant vers +Z', provisional: true, note: 'le Car Kit n’a pas de bus : camionnette longue (delivery) en attendant' },
  'truck': { kit: CARS, source: 'truck.glb', scale: CAR_SCALE, yaw: 0, footprint: [1, 1], orientation: 'avant vers +Z' },
};

// Les bâtiments originaux remplacent les anciennes silhouettes, sans changer les sauvegardes.
Object.assign(MODEL_MAP, ARCHITECTURE);

/** Adresse publique d'un kit (pour `url` et CREDITS.md). */
export function kitUrl(kit) {
  return kit === 'tiletown' ? 'https://github.com/Madec01/Tiletown' : `https://kenney.nl/assets/${kit}`;
}

/** Nom du kit dans le manifeste (`kenney-<slug>`). */
export function kitManifestName(kit) {
  return kit === 'tiletown' ? 'tiletown-primitives' : `kenney-${kit}`;
}
