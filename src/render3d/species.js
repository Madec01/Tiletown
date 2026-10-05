// Icônes d'espèces (docs/ARCHITECTURE.md §10.3, GAME_DESIGN.md §5.3, §5.5) : au-dessus de chaque
// parcelle où une espèce emblématique est présente, un petit PANNEAU tourné vers la caméra (billboard)
// portant la SILHOUETTE de l'espèce. Les silhouettes sont dessinées EN CODE dans un canevas au
// chargement (aucun fichier image), rassemblées en un atlas : toutes les icônes tiennent donc en
// UN SEUL appel de dessin (`InstancedMesh` + attribut d'instance qui choisit la case de l'atlas).
//
//   const markers = createSpeciesMarkers(models, { palette });
//   markers.setWorld(world);                  // hauteurs du sol, bornes de la carte
//   markers.set(eco.species, eco.patches);    // { [id]: { present, since, cells } } et les parcelles
//   markers.update(dt, camera);               // avant render() : animations et orientation des panneaux
//   scene.add(markers.group); markers.stats() → { markers, instances, calls, species, atlas };
//   markers.dispose();
//
// Animations : apparition en 0,4 s (montée + grossissement), disparition symétrique (descente +
// rétrécissement) ; l'icône disparaît de la liste une fois rétrécie. Rien n'alloue par image.
//
// Sous Node (tests) il n'y a pas de `document` : l'atlas est absent, les panneaux restent des plans
// de couleur unie et toute la géométrie (positions, nombre d'instances, animations) reste vérifiable.
//
// Repère : la case (x, y) couvre [x, x+1] × [y, y+1] en (X, Z) ; nord = −Z, est = +X, y vers le haut.

import * as THREE from 'three';
import { PALETTE } from '../data/palette.js';
import { surfaceHeight } from './ground.js';

/** Espèces emblématiques, dans l'ordre des cases de l'atlas (§5.3 ; `duck` complète la planche). */
export const SPECIES_ICONS = Object.freeze(['deer', 'fox', 'heron', 'otter', 'bee', 'swallow', 'owl', 'duck']);

/** Atlas : 4 × 2 cases de 128 px (512 × 256). */
export const ATLAS_COLS = 4;
export const ATLAS_ROWS = 2;
export const ATLAS_CELL = 128;

/** Côté du panneau (u) et hauteur de son ancrage au-dessus du sol. */
export const MARKER_SIZE = 0.72;
export const MARKER_LIFT = 0.55;
/** Durée de l'apparition et de la disparition (s) et montée pendant l'apparition (u). */
export const MARKER_GROW = 0.4;
export const MARKER_RISE = 0.35;

const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _matrix = new THREE.Matrix4();

const smoothstep = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

// ---------------------------------------------------------------------------------------------
// Parties pures : position des marqueurs
// ---------------------------------------------------------------------------------------------

/** Cases d'une entrée d'espèce (`eco.species[id]`) : tableau d'index, éventuellement vide. */
export function speciesCells(entry) {
  if (!entry) return [];
  if (Array.isArray(entry)) return entry;
  if (Array.isArray(entry.cells)) return entry.cells;
  return [];
}

/** Vrai si l'entrée décrit une espèce présente (`present` absent vaut présent si des cases existent). */
export function isPresent(entry) {
  if (!entry) return false;
  if (Array.isArray(entry)) return entry.length > 0;
  if (typeof entry.present === 'boolean') return entry.present;
  return speciesCells(entry).length > 0;
}

/** Centre d'un groupe de cases : moyenne des centres (x + 0,5, y + 0,5). */
export function cellsCenter(cells, cols) {
  let sx = 0, sz = 0, n = 0;
  for (const i of cells) {
    if (!Number.isFinite(i) || i < 0) continue;
    sx += (i % cols) + 0.5;
    sz += Math.floor(i / cols) + 0.5;
    n++;
  }
  return n ? { x: sx / n, z: sz / n } : null;
}

/** Hauteur du sol sous un point (u), 0 hors carte ou sans monde. */
function groundAt(world, x, z) {
  if (!world) return 0;
  const tx = Math.floor(x), ty = Math.floor(z);
  if (tx < 0 || ty < 0 || tx >= world.cols || ty >= world.rows) return 0;
  return surfaceHeight(world, tx, ty);
}

/**
 * Marqueurs à afficher pour un état d'écologie :
 *   [ { key, species, patch, cells, x, y, z } ]
 * Un marqueur par (espèce, parcelle) où l'espèce est présente, posé au CENTRE DE LA PARCELLE ; les
 * cases d'une espèce qui n'appartiennent à aucune parcelle (l'hirondelle en ville, par exemple)
 * donnent un marqueur à leur propre centre (`patch: null`). Ordre déterministe : ordre des espèces
 * de SPECIES_ICONS, puis identifiant de parcelle. Pure : ne touche ni au DOM ni à three.js.
 */
export function speciesMarkerTargets(species, patches, world) {
  if (!species) return [];
  const cols = world ? world.cols : 1;
  const ids = Object.keys(species);
  ids.sort((a, b) => {
    const ia = SPECIES_ICONS.indexOf(a), ib = SPECIES_ICONS.indexOf(b);
    return (ia < 0 ? SPECIES_ICONS.length : ia) - (ib < 0 ? SPECIES_ICONS.length : ib) || a.localeCompare(b);
  });
  // Case → parcelle (une seule passe sur les parcelles).
  const patchOf = new Map();
  const byId = new Map();
  for (const p of patches || []) {
    if (!p) continue;
    byId.set(p.id, p);
    for (const i of p.cells || []) if (!patchOf.has(i)) patchOf.set(i, p.id);
  }
  const out = [];
  for (const id of ids) {
    const entry = species[id];
    if (!isPresent(entry)) continue;
    const cells = speciesCells(entry);
    if (!cells.length) continue;
    const groups = new Map();      // identifiant de parcelle (ou null) → cases de l'espèce
    for (const i of cells) {
      const key = patchOf.has(i) ? patchOf.get(i) : null;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(i);
    }
    const keys = Array.from(groups.keys()).sort((a, b) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return String(a).localeCompare(String(b), 'en', { numeric: true });
    });
    for (const key of keys) {
      const own = groups.get(key);
      const patch = key === null ? null : byId.get(key);
      const center = cellsCenter(patch ? patch.cells : own, cols);
      if (!center) continue;
      out.push({
        key: `${id}:${key === null ? 'free' : key}`,
        species: id,
        patch: patch ? patch.id : null,
        cells: own,
        x: center.x,
        z: center.z,
        y: groundAt(world, center.x, center.z) + MARKER_LIFT,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Atlas des silhouettes : dessiné en code dans un canevas (aucun fichier image)
// ---------------------------------------------------------------------------------------------

/** Rectangle arrondi (les vieux canevas n'ont pas `roundRect`). */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Ellipse pleine. */
function blob(ctx, cx, cy, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

/** Trait épais entre deux points (pattes, cous, antennes). */
function stroke(ctx, pts, width) {
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

/** Polygone plein. */
function poly(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}

/**
 * Silhouette d'une espèce dans le carré [0, 1]², dessinée en code. `u(v)` convertit une coordonnée
 * locale en pixels. Les formes restent grosses et contrastées : lisibles à 40 px de haut sur le
 * téléphone, reconnaissables sans texte.
 */
function drawSilhouette(ctx, id, box) {
  const ux = (v) => box.x + v * box.w;
  const uy = (v) => box.y + v * box.h;
  const us = (v) => v * box.w;
  const P = (x, y) => [ux(x), uy(y)];
  switch (id) {
    case 'deer':
      blob(ctx, ux(0.44), uy(0.62), us(0.23), us(0.14));                     // corps
      stroke(ctx, [P(0.58, 0.57), P(0.68, 0.42), P(0.72, 0.3)], us(0.1));     // encolure
      blob(ctx, ux(0.76), uy(0.27), us(0.11), us(0.07), -0.35);               // tête
      stroke(ctx, [P(0.72, 0.21), P(0.68, 0.07)], us(0.045));                 // bois gauche
      stroke(ctx, [P(0.68, 0.14), P(0.58, 0.1)], us(0.04));
      stroke(ctx, [P(0.8, 0.2), P(0.86, 0.06)], us(0.045));                   // bois droit
      stroke(ctx, [P(0.84, 0.13), P(0.93, 0.09)], us(0.04));
      for (const x of [0.28, 0.4, 0.52, 0.6]) stroke(ctx, [P(x, 0.72), P(x, 0.92)], us(0.055));
      break;
    case 'fox':
      blob(ctx, ux(0.45), uy(0.6), us(0.22), us(0.13));                       // corps
      poly(ctx, [P(0.26, 0.56), P(0.08, 0.3), P(0.04, 0.5), P(0.2, 0.68)]);   // queue touffue
      blob(ctx, ux(0.71), uy(0.5), us(0.12), us(0.1));                        // tête
      poly(ctx, [P(0.63, 0.44), P(0.62, 0.24), P(0.74, 0.38)]);               // oreille gauche
      poly(ctx, [P(0.78, 0.42), P(0.84, 0.22), P(0.86, 0.44)]);               // oreille droite
      poly(ctx, [P(0.8, 0.52), P(0.95, 0.56), P(0.8, 0.6)]);                  // museau
      for (const x of [0.34, 0.46, 0.56]) stroke(ctx, [P(x, 0.7), P(x, 0.9)], us(0.055));
      break;
    case 'heron':
      stroke(ctx, [P(0.42, 0.95), P(0.42, 0.6)], us(0.045));                  // pattes
      stroke(ctx, [P(0.52, 0.95), P(0.52, 0.6)], us(0.045));
      stroke(ctx, [P(0.34, 0.95), P(0.5, 0.95)], us(0.045));
      blob(ctx, ux(0.44), uy(0.54), us(0.2), us(0.12), -0.2);                 // corps
      stroke(ctx, [P(0.56, 0.48), P(0.66, 0.32), P(0.6, 0.18)], us(0.07));    // cou en S
      blob(ctx, ux(0.59), uy(0.14), us(0.08), us(0.06));                      // tête
      poly(ctx, [P(0.64, 0.12), P(0.95, 0.18), P(0.64, 0.18)]);               // bec
      poly(ctx, [P(0.3, 0.52), P(0.12, 0.72), P(0.3, 0.66)]);                 // aile repliée
      break;
    case 'otter':
      blob(ctx, ux(0.47), uy(0.64), us(0.27), us(0.12), -0.1);                // corps allongé
      poly(ctx, [P(0.24, 0.6), P(0.04, 0.78), P(0.1, 0.84), P(0.3, 0.7)]);    // queue épaisse
      blob(ctx, ux(0.75), uy(0.52), us(0.13), us(0.11));                      // tête ronde
      blob(ctx, ux(0.68), uy(0.42), us(0.035), us(0.035));                    // oreilles
      blob(ctx, ux(0.82), uy(0.42), us(0.035), us(0.035));
      blob(ctx, ux(0.87), uy(0.56), us(0.05), us(0.04));                      // museau
      for (const x of [0.4, 0.58]) stroke(ctx, [P(x, 0.74), P(x, 0.86)], us(0.05));
      break;
    case 'bee':
      blob(ctx, ux(0.5), uy(0.6), us(0.21), us(0.16), -0.25);                 // abdomen
      ctx.save();                                                             // rayures claires
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = us(0.05);
      for (const d of [-0.09, 0.02, 0.13]) stroke(ctx, [P(0.46 + d, 0.46), P(0.56 + d, 0.74)], us(0.05));
      ctx.restore();
      blob(ctx, ux(0.68), uy(0.46), us(0.09), us(0.08));                      // tête
      stroke(ctx, [P(0.72, 0.4), P(0.82, 0.24)], us(0.035));                  // antennes
      stroke(ctx, [P(0.66, 0.38), P(0.68, 0.2)], us(0.035));
      ctx.globalAlpha = 0.45;
      blob(ctx, ux(0.44), uy(0.33), us(0.16), us(0.08), -0.5);                // ailes
      blob(ctx, ux(0.6), uy(0.3), us(0.12), us(0.07), -0.2);
      ctx.globalAlpha = 1;
      break;
    case 'swallow':
      poly(ctx, [P(0.5, 0.52), P(0.08, 0.2), P(0.3, 0.52), P(0.1, 0.62)]);    // aile gauche
      poly(ctx, [P(0.5, 0.52), P(0.92, 0.2), P(0.7, 0.52), P(0.9, 0.62)]);    // aile droite
      blob(ctx, ux(0.5), uy(0.56), us(0.11), us(0.16));                       // corps
      poly(ctx, [P(0.42, 0.66), P(0.3, 0.94), P(0.5, 0.78), P(0.7, 0.94), P(0.58, 0.66)]); // queue fourchue
      blob(ctx, ux(0.5), uy(0.36), us(0.08), us(0.07));                       // tête
      break;
    case 'owl':
      blob(ctx, ux(0.5), uy(0.6), us(0.26), us(0.28));                        // corps rond
      poly(ctx, [P(0.3, 0.4), P(0.26, 0.14), P(0.46, 0.3)]);                  // aigrettes
      poly(ctx, [P(0.7, 0.4), P(0.74, 0.14), P(0.54, 0.3)]);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      blob(ctx, ux(0.4), uy(0.5), us(0.1), us(0.1));                          // grands yeux évidés
      blob(ctx, ux(0.6), uy(0.5), us(0.1), us(0.1));
      ctx.restore();
      blob(ctx, ux(0.4), uy(0.5), us(0.045), us(0.045));                      // pupilles
      blob(ctx, ux(0.6), uy(0.5), us(0.045), us(0.045));
      poly(ctx, [P(0.5, 0.56), P(0.56, 0.64), P(0.44, 0.64)]);                // bec
      stroke(ctx, [P(0.4, 0.86), P(0.4, 0.94)], us(0.05));                    // serres
      stroke(ctx, [P(0.6, 0.86), P(0.6, 0.94)], us(0.05));
      break;
    case 'duck':
      blob(ctx, ux(0.46), uy(0.64), us(0.26), us(0.14), -0.08);               // corps
      poly(ctx, [P(0.22, 0.58), P(0.08, 0.46), P(0.26, 0.52)]);               // croupion
      stroke(ctx, [P(0.66, 0.58), P(0.72, 0.4)], us(0.1));                    // cou
      blob(ctx, ux(0.74), uy(0.34), us(0.1), us(0.09));                       // tête
      poly(ctx, [P(0.82, 0.32), P(0.96, 0.38), P(0.82, 0.42)]);               // bec
      break;
    default:
      // Espèce inconnue : une feuille, pour ne jamais rester sans icône.
      blob(ctx, ux(0.5), uy(0.52), us(0.18), us(0.3), -0.6);
      stroke(ctx, [P(0.42, 0.66), P(0.56, 0.94)], us(0.06));
      break;
  }
}

/** Dessine une case de l'atlas : panneau crème à liseré vert, pointe en bas, silhouette à l'encre. */
function drawCell(ctx, ox, oy, id, palette) {
  const s = ATLAS_CELL;
  const pad = s * 0.06;
  const panelH = s * 0.76;
  ctx.save();
  ctx.translate(ox, oy);
  // Panneau.
  ctx.fillStyle = palette.wallCream || PALETTE.wallCream;
  ctx.strokeStyle = palette.forestDark || PALETTE.forestDark;
  ctx.lineWidth = s * 0.045;
  roundRect(ctx, pad, pad, s - pad * 2, panelH, s * 0.14);
  ctx.fill();
  // Pointe qui désigne la parcelle.
  ctx.beginPath();
  ctx.moveTo(s * 0.42, pad + panelH - 2);
  ctx.lineTo(s * 0.58, pad + panelH - 2);
  ctx.lineTo(s * 0.5, s - pad * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  roundRect(ctx, pad, pad, s - pad * 2, panelH, s * 0.14);
  ctx.stroke();
  // Silhouette.
  ctx.fillStyle = '#2f3b31';
  ctx.strokeStyle = '#2f3b31';
  drawSilhouette(ctx, id, { x: s * 0.14, y: pad + s * 0.06, w: s * 0.72, h: panelH - s * 0.12 });
  ctx.restore();
}

/**
 * Atlas des silhouettes (canevas 512 × 256), ou null sans `document` (tests sous Node).
 * `ids` : espèces dans l'ordre des cases.
 */
export function createSpeciesAtlas(palette = PALETTE, ids = SPECIES_ICONS) {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_COLS * ATLAS_CELL;
  canvas.height = ATLAS_ROWS * ATLAS_CELL;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ids.forEach((id, k) => {
    if (k >= ATLAS_COLS * ATLAS_ROWS) return;
    drawCell(ctx, (k % ATLAS_COLS) * ATLAS_CELL, Math.floor(k / ATLAS_COLS) * ATLAS_CELL, id, palette);
  });
  return canvas;
}

/**
 * Case d'atlas d'une espèce : [u, v] du coin de la case dans les COORDONNÉES DE TEXTURE (dernière case
 * = icône de repli). Les textures de canevas sont retournées verticalement (`flipY`), donc la ligne 0
 * du canevas est la ligne du HAUT en v : la ligne est inversée ici, une fois pour toutes.
 */
export function atlasCell(id) {
  const k = SPECIES_ICONS.indexOf(id);
  const cell = k < 0 ? ATLAS_COLS * ATLAS_ROWS - 1 : k;
  const row = Math.floor(cell / ATLAS_COLS);
  return [(cell % ATLAS_COLS) / ATLAS_COLS, (ATLAS_ROWS - 1 - row) / ATLAS_ROWS];
}

// ---------------------------------------------------------------------------------------------
// Rendu
// ---------------------------------------------------------------------------------------------

const MARKER_VERTEX_PARS = /* glsl */`
attribute vec2 aCell;
`;

/** Chaque instance lit sa case de l'atlas : une seule texture, un seul appel de dessin. */
const MARKER_VERTEX_BODY = /* glsl */`
vMapUv = aCell + uv * vec2( ${(1 / ATLAS_COLS).toFixed(6)}, ${(1 / ATLAS_ROWS).toFixed(6)} );
`;

/**
 * Crée les icônes d'espèces. `models` n'est pas utilisé (les icônes sont dessinées en code) : il reste
 * dans la signature pour suivre le contrat des autres couches de rendu.
 * options : { palette = PALETTE, size = MARKER_SIZE, lift = MARKER_LIFT, grow = MARKER_GROW }.
 */
export function createSpeciesMarkers(models, options = {}) {
  const palette = options.palette || PALETTE;
  const size = Number.isFinite(options.size) ? options.size : MARKER_SIZE;
  const lift = Number.isFinite(options.lift) ? options.lift : MARKER_LIFT;
  const grow = Number.isFinite(options.grow) && options.grow > 0 ? options.grow : MARKER_GROW;

  const group = new THREE.Group();
  group.name = 'species';

  // Plan ancré par le bas : la pointe du panneau touche le point visé, le panneau grandit vers le haut.
  const template = new THREE.PlaneGeometry(1, 1);
  template.translate(0, 0.5, 0);

  const canvas = createSpeciesAtlas(palette);
  let texture = null;
  let material;
  if (canvas) {
    texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    // `forceSinglePass` : sans lui, three dessine les faces arrière puis avant (deux appels de dessin).
    material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true, toneMapped: false });
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = MARKER_VERTEX_PARS + shader.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n' + MARKER_VERTEX_BODY);
    };
    material.customProgramCacheKey = () => 'tiletown-species-1';
  } else {
    // Sans canevas (Node) : panneaux de couleur unie, même géométrie, mêmes animations.
    material = new THREE.MeshBasicMaterial({ color: new THREE.Color(palette.wallCream || PALETTE.wallCream), transparent: true, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true });
  }

  let mesh = null;
  let capacity = 0;
  let world = null;
  let disposed = false;
  /** Marqueurs vivants, dans l'ordre d'apparition : { key, species, patch, x, y, z, t, dir }. */
  let markers = [];
  const byKey = new Map();
  let lastSpecies = null;
  let lastPatches = null;
  const stats = { markers: 0, instances: 0, calls: 0, species: 0, atlas: Boolean(canvas) };

  function ensureMesh(needed) {
    if (mesh && capacity >= needed) return mesh;
    if (mesh) { group.remove(mesh); mesh.geometry.dispose(); }
    const next = Math.max(16, Math.ceil(needed * 1.5));
    const geometry = template.clone();
    geometry.setAttribute('aCell', new THREE.InstancedBufferAttribute(new Float32Array(next * 2), 2));
    mesh = new THREE.InstancedMesh(geometry, material, next);
    mesh.name = 'species-markers';
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    mesh.renderOrder = 3;        // par-dessus la carte et la brume
    mesh.count = 0;
    capacity = next;
    group.add(mesh);
    return mesh;
  }

  function setWorld(nextWorld) {
    world = nextWorld;
    if (lastSpecies) set(lastSpecies, lastPatches);   // les hauteurs du sol ont changé
  }

  /**
   * Espèces présentes et parcelles (`eco.species`, `eco.patches`) : ajoute les icônes nouvelles
   * (animation d'apparition), fait disparaître celles qui n'ont plus lieu d'être, garde les autres
   * en place. Appelable à chaque mois sans rien reconstruire.
   */
  function set(species, patches) {
    lastSpecies = species || null;
    lastPatches = patches || null;
    const targets = speciesMarkerTargets(lastSpecies, lastPatches, world);
    const seen = new Set();
    for (const t of targets) {
      seen.add(t.key);
      const existing = byKey.get(t.key);
      if (existing) {
        existing.x = t.x; existing.y = t.y; existing.z = t.z;
        existing.patch = t.patch;
        existing.dir = 1;                       // de retour avant la fin de sa disparition
      } else {
        const m = { key: t.key, species: t.species, patch: t.patch, x: t.x, y: t.y, z: t.z, t: 0, dir: 1 };
        markers.push(m);
        byKey.set(t.key, m);
      }
    }
    for (const m of markers) if (!seen.has(m.key)) m.dir = -1;
    stats.species = new Set(markers.filter((m) => m.dir > 0).map((m) => m.species)).size;
  }

  /** Avance les animations, oriente les panneaux vers la caméra et écrit les matrices d'instance. */
  function update(dt, camera) {
    if (disposed) return;
    const step = Math.min(0.2, Math.max(0, Number(dt) || 0));
    if (step > 0 && markers.length) {
      let gone = false;
      for (const m of markers) {
        m.t = Math.min(1, Math.max(0, m.t + (m.dir > 0 ? step / grow : -step / grow)));
        if (m.t <= 0 && m.dir < 0) gone = true;
      }
      if (gone) {
        markers = markers.filter((m) => {
          const keep = m.t > 0 || m.dir > 0;
          if (!keep) byKey.delete(m.key);
          return keep;
        });
      }
    }
    if (camera && camera.quaternion) _quat.copy(camera.quaternion); else _quat.identity();
    const live = markers.length;
    if (!live) {
      if (mesh) { mesh.count = 0; mesh.visible = false; }
      stats.markers = 0; stats.instances = 0; stats.calls = 0;
      return;
    }
    const target = ensureMesh(live);
    const cells = target.geometry.attributes.aCell;
    let k = 0;
    for (const m of markers) {
      const e = smoothstep(m.t);
      if (e <= 0) continue;
      _pos.set(m.x, m.y - (1 - e) * MARKER_RISE, m.z);
      _scale.set(size * e, size * e, size * e);
      _matrix.compose(_pos, _quat, _scale);
      target.setMatrixAt(k, _matrix);
      const cell = atlasCell(m.species);
      cells.array[k * 2] = cell[0];
      cells.array[k * 2 + 1] = cell[1];
      k++;
    }
    target.count = k;
    target.visible = k > 0;
    target.instanceMatrix.needsUpdate = true;
    cells.needsUpdate = true;
    stats.markers = markers.length;
    stats.instances = k;
    stats.calls = k > 0 ? 1 : 0;
  }

  function dispose() {
    disposed = true;
    if (mesh) { group.remove(mesh); mesh.geometry.dispose(); mesh = null; }
    template.dispose();
    material.dispose();
    if (texture) texture.dispose();
    markers = [];
    byKey.clear();
  }

  return {
    group,
    setWorld,
    set,
    update,
    dispose,
    stats: () => ({ ...stats }),
    /** Accès de débogage (fixture, mesures). */
    debug: { get mesh() { return mesh; }, get markers() { return markers; }, canvas, get texture() { return texture; } },
  };
}
