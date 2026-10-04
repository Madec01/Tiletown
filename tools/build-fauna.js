#!/usr/bin/env node
// Construit les PANTINS de Tiletown (docs/ARCHITECTURE.md §8.2, `rig: 'puppet'`) : habitants, héron,
// loutre, hirondelle, cycliste — des assemblages de primitives (boîtes, boîtes biseautées, ellipsoïdes,
// cylindres, cônes) aux couleurs de la palette, exportés en GLB (@gltf-transform) avec :
//   - une hiérarchie de nœuds NOMMÉS (un nœud par pièce : Body, Head, LegL…), l'origine de chaque nœud
//     étant son pivot d'articulation (hanche, épaule, base du cou, moyeu…) ; le rendu anime ces nœuds
//     par procédure (balancement, battement, roulis) et dessine chaque pièce en InstancedMesh ;
//   - un maillage par pièce (une primitive par couleur), matériaux plats `flat-<rôle>` sans texture ;
//   - le modèle centré en x/z, posé sur y = 0, regardant vers +Z (sud) ; x positif = côté GAUCHE du
//     personnage (comme les modèles glTF de Quaternius et Gobkit) ;
//   - licence CC0 (création Tiletown), champ `copyright` du GLB renseigné.
// Le manifeste reçoit pour chaque pantin : animated, rig, anim (démarche), parts (nom de pièce → nœud),
// partsTree (pièce → pièce parente), pivots (translation de repos de chaque nœud dans son parent),
// footprint, bbox, triangles, bytes.
//
// Usage : node tools/build-fauna.js [citizen-a heron ...] [--verbose]

import { mkdirSync, statSync } from 'node:fs';
import { join as joinPath } from 'node:path';
import { Document } from '@gltf-transform/core';
import { dedup, prune, meshopt, getBounds } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { io, QUIET, flatMaterial, addGeometry, cylinderGeometry, countTriangles, round3, OUT_DIR } from './import-models.js';
import { updateManifest, totalBytes } from './manifest-util.js';

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');
const ONLY = args.filter((a) => !a.startsWith('--'));
const log = (...m) => console.log(...m);
const vlog = (...m) => { if (VERBOSE) console.log('   ', ...m); };

// ─── Géométries (positions + normales plates + indices), dans le repère local de la pièce ──────────

const DEG = Math.PI / 180;

function emptyGeom() { return { positions: [], normals: [], indices: [] }; }

/** Ajoute une face plane (polygone convexe, sommets dans l'ordre antihoraire vu de l'extérieur). */
function addFace(g, verts) {
  const [a, b, c] = verts;
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const l = Math.hypot(...n) || 1;
  const nn = n.map((x) => x / l);
  const base = g.positions.length / 3;
  for (const p of verts) { g.positions.push(...p); g.normals.push(...nn); }
  for (let i = 1; i < verts.length - 1; i++) g.indices.push(base, base + i, base + i + 1);
}

/** Boîte centrée en `c`, dimensions [w, h, d]. */
function box([w, h, d], c = [0, 0, 0]) {
  return chamferBox([w, h, d], 0, c);
}

/**
 * Boîte biseautée (chanfrein `b` sur les 12 arêtes) centrée en `c` : 6 faces, 12 biseaux, 8 coins.
 * b = 0 donne une boîte simple.
 */
function chamferBox([w, h, d], b, c = [0, 0, 0]) {
  const g = emptyGeom();
  const hx = w / 2, hy = h / 2, hz = d / 2;
  b = Math.min(b, hx, hy, hz);
  const P = (sx, sy, sz, ax, ay, az) => [c[0] + sx * (hx - (ax ? 0 : b)), c[1] + sy * (hy - (ay ? 0 : b)), c[2] + sz * (hz - (az ? 0 : b))];
  if (b <= 0) {
    const v = (sx, sy, sz) => [c[0] + sx * hx, c[1] + sy * hy, c[2] + sz * hz];
    addFace(g, [v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1)]);       // +Z
    addFace(g, [v(1, -1, -1), v(-1, -1, -1), v(-1, 1, -1), v(1, 1, -1)]);   // -Z
    addFace(g, [v(1, -1, 1), v(1, -1, -1), v(1, 1, -1), v(1, 1, 1)]);       // +X
    addFace(g, [v(-1, -1, -1), v(-1, -1, 1), v(-1, 1, 1), v(-1, 1, -1)]);   // -X
    addFace(g, [v(-1, 1, 1), v(1, 1, 1), v(1, 1, -1), v(-1, 1, -1)]);       // +Y
    addFace(g, [v(-1, -1, -1), v(1, -1, -1), v(1, -1, 1), v(-1, -1, 1)]);   // -Y
    return g;
  }
  // Faces principales (rectangles rentrés de b)
  addFace(g, [P(-1, -1, 1, 0, 0, 1), P(1, -1, 1, 0, 0, 1), P(1, 1, 1, 0, 0, 1), P(-1, 1, 1, 0, 0, 1)]);
  addFace(g, [P(1, -1, -1, 0, 0, 1), P(-1, -1, -1, 0, 0, 1), P(-1, 1, -1, 0, 0, 1), P(1, 1, -1, 0, 0, 1)]);
  addFace(g, [P(1, -1, 1, 1, 0, 0), P(1, -1, -1, 1, 0, 0), P(1, 1, -1, 1, 0, 0), P(1, 1, 1, 1, 0, 0)]);
  addFace(g, [P(-1, -1, -1, 1, 0, 0), P(-1, -1, 1, 1, 0, 0), P(-1, 1, 1, 1, 0, 0), P(-1, 1, -1, 1, 0, 0)]);
  addFace(g, [P(-1, 1, 1, 0, 1, 0), P(1, 1, 1, 0, 1, 0), P(1, 1, -1, 0, 1, 0), P(-1, 1, -1, 0, 1, 0)]);
  addFace(g, [P(-1, -1, -1, 0, 1, 0), P(1, -1, -1, 0, 1, 0), P(1, -1, 1, 0, 1, 0), P(-1, -1, 1, 0, 1, 0)]);
  // Biseaux : 4 arêtes parallèles à chaque axe
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) { // arêtes // X
    const a = P(-1, sy, sz, 0, 1, 0), b2 = P(1, sy, sz, 0, 1, 0), c2 = P(1, sy, sz, 0, 0, 1), d2 = P(-1, sy, sz, 0, 0, 1);
    addFace(g, sy * sz > 0 ? [a, b2, c2, d2] : [d2, c2, b2, a]);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { // arêtes // Y
    const a = P(sx, -1, sz, 1, 0, 0), b2 = P(sx, 1, sz, 1, 0, 0), c2 = P(sx, 1, sz, 0, 0, 1), d2 = P(sx, -1, sz, 0, 0, 1);
    addFace(g, sx * sz > 0 ? [d2, c2, b2, a] : [a, b2, c2, d2]);
  }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { // arêtes // Z
    const a = P(sx, sy, -1, 1, 0, 0), b2 = P(sx, sy, 1, 1, 0, 0), c2 = P(sx, sy, 1, 0, 1, 0), d2 = P(sx, sy, -1, 0, 1, 0);
    addFace(g, sx * sy > 0 ? [a, b2, c2, d2] : [d2, c2, b2, a]);
  }
  // Coins : triangles
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    const px = P(sx, sy, sz, 1, 0, 0), py = P(sx, sy, sz, 0, 1, 0), pz = P(sx, sy, sz, 0, 0, 1);
    addFace(g, sx * sy * sz > 0 ? [px, py, pz] : [px, pz, py]);
  }
  return g;
}

/** Ellipsoïde à facettes (rayons [rx, ry, rz]) centré en `c`. */
function ellipsoid([rx, ry, rz], c = [0, 0, 0], segments = 8, rings = 6) {
  const g = emptyGeom();
  const pt = (i, j) => {
    const phi = (j / rings) * Math.PI, theta = (i / segments) * Math.PI * 2;
    return [c[0] + rx * Math.sin(phi) * Math.cos(theta), c[1] + ry * Math.cos(phi), c[2] + rz * Math.sin(phi) * Math.sin(theta)];
  };
  for (let j = 0; j < rings; j++) {
    for (let i = 0; i < segments; i++) {
      const a = pt(i, j), b = pt(i, j + 1), cc = pt(i + 1, j + 1), d = pt(i + 1, j);
      if (j === 0) addFace(g, [a, b, cc]);
      else if (j === rings - 1) addFace(g, [a, b, d]);
      else addFace(g, [a, b, cc, d]);
    }
  }
  return g;
}

/** Applique une rotation (axe 'x' | 'y' | 'z', degrés) puis une translation à une géométrie. */
function transformGeom(g, { rotate = null, translate = [0, 0, 0] } = {}) {
  const out = { positions: [], normals: [], indices: [...g.indices] };
  const rot = (p) => {
    if (!rot.m) return p;
    const [a, b, c] = p;
    return [rot.m[0] * a + rot.m[1] * b + rot.m[2] * c, rot.m[3] * a + rot.m[4] * b + rot.m[5] * c, rot.m[6] * a + rot.m[7] * b + rot.m[8] * c];
  };
  if (rotate) {
    const [axis, deg] = rotate; const s = Math.sin(deg * DEG), co = Math.cos(deg * DEG);
    rot.m = axis === 'x' ? [1, 0, 0, 0, co, -s, 0, s, co] : axis === 'y' ? [co, 0, s, 0, 1, 0, -s, 0, co] : [co, -s, 0, s, co, 0, 0, 0, 1];
  }
  for (let i = 0; i < g.positions.length; i += 3) {
    const p = rot(g.positions.slice(i, i + 3)); out.positions.push(p[0] + translate[0], p[1] + translate[1], p[2] + translate[2]);
    out.normals.push(...rot(g.normals.slice(i, i + 3)));
  }
  return out;
}

/** Concatène des géométries. */
function mergeGeoms(list) {
  const out = emptyGeom();
  for (const g of list) {
    const base = out.positions.length / 3;
    out.positions.push(...g.positions); out.normals.push(...g.normals);
    for (const i of g.indices) out.indices.push(base + i);
  }
  return out;
}

/** Cylindre (ou cône si topRadius = 0) du point `from` au point `to`, à facettes. */
function tube(from, to, radius, { segments = 8, topRadius = radius } = {}) {
  const d = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  const len = Math.hypot(...d);
  const { side, cap, bottom } = cylinderGeometry(radius, len, segments, topRadius);
  const g = mergeGeoms([side, cap, bottom]);
  // Rotation qui amène +Y sur d : axe = Y × d, angle = acos(dy / len)
  const dy = d[1] / len;
  const out = emptyGeom(); out.indices = g.indices;
  let m = null;
  if (Math.abs(dy) < 0.999999) {
    const ax = [d[2], 0, -d[0]]; const al = Math.hypot(...ax); const u = ax.map((v) => v / al);
    const ang = Math.acos(Math.max(-1, Math.min(1, dy))); const s = Math.sin(ang), c = Math.cos(ang), t = 1 - c;
    m = [t * u[0] * u[0] + c, t * u[0] * u[1] - s * u[2], t * u[0] * u[2] + s * u[1],
      t * u[0] * u[1] + s * u[2], t * u[1] * u[1] + c, t * u[1] * u[2] - s * u[0],
      t * u[0] * u[2] - s * u[1], t * u[1] * u[2] + s * u[0], t * u[2] * u[2] + c];
  } else if (dy < 0) {
    m = [1, 0, 0, 0, -1, 0, 0, 0, -1];
  }
  const ap = (p) => (m ? [m[0] * p[0] + m[1] * p[1] + m[2] * p[2], m[3] * p[0] + m[4] * p[1] + m[5] * p[2], m[6] * p[0] + m[7] * p[1] + m[8] * p[2]] : p);
  for (let i = 0; i < g.positions.length; i += 3) {
    const p = ap(g.positions.slice(i, i + 3)); out.positions.push(p[0] + from[0], p[1] + from[1], p[2] + from[2]);
    out.normals.push(...ap(g.normals.slice(i, i + 3)));
  }
  return out;
}

/** Disque épais (roue) d'axe x, centré en c. */
function wheel(radius, thickness, c = [0, 0, 0], segments = 12) {
  return tube([c[0] - thickness / 2, c[1], c[2]], [c[0] + thickness / 2, c[1], c[2]], radius, { segments });
}

// ─── Pantins ────────────────────────────────────────────────────────────────────────────────────
// Une pièce : { name, parent (nom ou null), pivot: [x, y, z] dans le repère du parent, shapes: [{ geom, color }] }.
// Les géométries sont exprimées dans le repère de la pièce (origine = pivot).

/** Habitant : corps, tête, deux bras (pivot épaule), deux jambes (pivot hanche) ; hauteur 0,26 u. */
function citizen(colors) {
  const HIP = 0.09, TORSO = 0.08, HEAD = 0.08;
  const { shirt, pants, skin, hair } = colors;
  return {
    anim: 'biped', fitHeight: 0.26, footprint: [0.12, 0.08],
    pieces: [
      { name: 'Body', parent: null, pivot: [0, HIP, 0], shapes: [
        { geom: chamferBox([0.085, TORSO, 0.05], 0.008, [0, TORSO / 2, 0]), color: shirt },
        { geom: box([0.07, 0.012, 0.045], [0, 0.006, 0]), color: pants }, // ceinture / haut du pantalon
      ] },
      { name: 'Head', parent: 'Body', pivot: [0, TORSO, 0], shapes: [
        { geom: chamferBox([HEAD, HEAD, HEAD * 0.95], 0.012, [0, HEAD / 2 + 0.004, 0]), color: skin },
        { geom: chamferBox([HEAD + 0.006, 0.03, HEAD * 0.95 + 0.006], 0.008, [0, HEAD - 0.011, -0.004]), color: hair }, // cheveux
        { geom: box([0.01, 0.012, 0.004], [-0.017, HEAD / 2 + 0.008, HEAD * 0.95 / 2 + 0.001]), color: 'asphalt' }, // yeux
        { geom: box([0.01, 0.012, 0.004], [0.017, HEAD / 2 + 0.008, HEAD * 0.95 / 2 + 0.001]), color: 'asphalt' },
      ] },
      { name: 'ArmL', parent: 'Body', pivot: [0.055, TORSO - 0.008, 0], shapes: [
        { geom: chamferBox([0.026, 0.078, 0.028], 0.006, [0, -0.034, 0]), color: shirt },
        { geom: box([0.022, 0.016, 0.024], [0, -0.078, 0]), color: skin }, // main
      ] },
      { name: 'ArmR', parent: 'Body', pivot: [-0.055, TORSO - 0.008, 0], shapes: [
        { geom: chamferBox([0.026, 0.078, 0.028], 0.006, [0, -0.034, 0]), color: shirt },
        { geom: box([0.022, 0.016, 0.024], [0, -0.078, 0]), color: skin },
      ] },
      { name: 'LegL', parent: 'Body', pivot: [0.021, 0, 0], shapes: [
        { geom: chamferBox([0.034, HIP - 0.012, 0.04], 0.006, [0, -(HIP - 0.012) / 2, 0]), color: pants },
        { geom: box([0.034, 0.014, 0.05], [0, -HIP + 0.007, 0.006]), color: 'asphalt' }, // chaussure
      ] },
      { name: 'LegR', parent: 'Body', pivot: [-0.021, 0, 0], shapes: [
        { geom: chamferBox([0.034, HIP - 0.012, 0.04], 0.006, [0, -(HIP - 0.012) / 2, 0]), color: pants },
        { geom: box([0.034, 0.014, 0.05], [0, -HIP + 0.007, 0.006]), color: 'asphalt' },
      ] },
    ],
  };
}

/** Héron : pattes fines, cou en S, bec jaune, ailes repliées (pivot à l'attache) ; hauteur 0,3 u. */
function heron() {
  const BODY_Y = 0.17; // hauteur du centre du corps
  const LEG = 0.15;
  const body = 'sidewalk', wing = 'roofSlate', neck = 'sidewalk', head = 'wallCream', cap = 'asphalt', beak = 'sun', leg = 'asphalt';
  return {
    anim: 'wader', fitHeight: 0.3, footprint: [0.1, 0.18],
    pieces: [
      { name: 'Body', parent: null, pivot: [0, BODY_Y, 0], shapes: [
        { geom: ellipsoid([0.034, 0.03, 0.062], [0, 0, -0.012], 8, 6), color: body },
        { geom: tube([0, 0.006, -0.07], [0, 0.028, -0.1], 0.006, { segments: 6, topRadius: 0.001 }), color: wing }, // plumes de la queue
      ] },
      { name: 'Neck', parent: 'Body', pivot: [0, 0.016, 0.042], shapes: [
        { geom: tube([0, 0, 0], [0, 0.034, 0.03], 0.009, { segments: 6, topRadius: 0.008 }), color: neck },
        { geom: tube([0, 0.034, 0.03], [0, 0.074, 0.012], 0.008, { segments: 6, topRadius: 0.0075 }), color: neck },
        { geom: tube([0, 0.074, 0.012], [0, 0.09, 0.02], 0.0075, { segments: 6, topRadius: 0.007 }), color: neck },
      ] },
      { name: 'Head', parent: 'Neck', pivot: [0, 0.09, 0.02], shapes: [
        { geom: ellipsoid([0.013, 0.012, 0.022], [0, 0.004, 0.006], 8, 5), color: head },
        { geom: chamferBox([0.02, 0.008, 0.028], 0.003, [0, 0.014, -0.002]), color: cap }, // calotte noire
        { geom: tube([0, 0.002, 0.024], [0, 0.0, 0.07], 0.006, { segments: 5, topRadius: 0.0005 }), color: beak },
        { geom: box([0.004, 0.004, 0.004], [-0.011, 0.007, 0.012]), color: 'asphalt' },
        { geom: box([0.004, 0.004, 0.004], [0.011, 0.007, 0.012]), color: 'asphalt' },
      ] },
      { name: 'WingL', parent: 'Body', pivot: [0.028, 0.014, 0.016], shapes: [
        { geom: transformGeom(chamferBox([0.012, 0.03, 0.095], 0.004, [0.002, -0.014, -0.044]), { rotate: ['y', -6] }), color: wing },
      ] },
      { name: 'WingR', parent: 'Body', pivot: [-0.028, 0.014, 0.016], shapes: [
        { geom: transformGeom(chamferBox([0.012, 0.03, 0.095], 0.004, [-0.002, -0.014, -0.044]), { rotate: ['y', 6] }), color: wing },
      ] },
      { name: 'LegL', parent: 'Body', pivot: [0.012, -0.02, -0.004], shapes: [
        { geom: tube([0, 0, 0], [0, -LEG, 0], 0.0035, { segments: 5 }), color: leg },
        { geom: box([0.014, 0.004, 0.03], [0, -LEG + 0.002, 0.008]), color: leg },
      ] },
      { name: 'LegR', parent: 'Body', pivot: [-0.012, -0.02, -0.004], shapes: [
        { geom: tube([0, 0, 0], [0, -LEG, 0], 0.0035, { segments: 5 }), color: leg },
        { geom: box([0.014, 0.004, 0.03], [0, -LEG + 0.002, 0.008]), color: leg },
      ] },
    ],
  };
}

/** Loutre : corps allongé, tête, queue effilée, quatre pattes courtes ; longueur 0,3 u. */
function otter() {
  const BODY_Y = 0.045;
  const fur = 'wood', belly = 'wallTan', nose = 'asphalt';
  return {
    anim: 'swimmer', fitLength: 0.3, footprint: [0.08, 0.3],
    pieces: [
      { name: 'Body', parent: null, pivot: [0, BODY_Y, 0], shapes: [
        { geom: ellipsoid([0.036, 0.032, 0.105], [0, 0, 0], 8, 6), color: fur },
        { geom: ellipsoid([0.03, 0.02, 0.085], [0, -0.016, 0.005], 8, 5), color: belly },
      ] },
      { name: 'Head', parent: 'Body', pivot: [0, 0.012, 0.1], shapes: [
        { geom: ellipsoid([0.028, 0.024, 0.036], [0, 0.002, 0.012], 8, 6), color: fur },
        { geom: ellipsoid([0.016, 0.012, 0.018], [0, -0.006, 0.04], 6, 4), color: belly }, // museau
        { geom: box([0.01, 0.006, 0.006], [0, -0.002, 0.057]), color: nose },
        { geom: ellipsoid([0.007, 0.006, 0.004], [-0.02, 0.02, 0.0], 6, 4), color: fur }, // oreilles
        { geom: ellipsoid([0.007, 0.006, 0.004], [0.02, 0.02, 0.0], 6, 4), color: fur },
        { geom: box([0.005, 0.005, 0.004], [-0.013, 0.01, 0.042]), color: 'asphalt' }, // yeux
        { geom: box([0.005, 0.005, 0.004], [0.013, 0.01, 0.042]), color: 'asphalt' },
      ] },
      { name: 'Tail', parent: 'Body', pivot: [0, -0.006, -0.1], shapes: [
        { geom: tube([0, 0, 0], [0, -0.004, -0.115], 0.02, { segments: 7, topRadius: 0.003 }), color: fur },
      ] },
      { name: 'PawFL', parent: 'Body', pivot: [0.026, -0.022, 0.065], shapes: [{ geom: tube([0, 0, 0], [0, -0.023, 0], 0.01, { segments: 6 }), color: fur }] },
      { name: 'PawFR', parent: 'Body', pivot: [-0.026, -0.022, 0.065], shapes: [{ geom: tube([0, 0, 0], [0, -0.023, 0], 0.01, { segments: 6 }), color: fur }] },
      { name: 'PawBL', parent: 'Body', pivot: [0.028, -0.022, -0.06], shapes: [{ geom: tube([0, 0, 0], [0, -0.023, 0], 0.011, { segments: 6 }), color: fur }] },
      { name: 'PawBR', parent: 'Body', pivot: [-0.028, -0.022, -0.06], shapes: [{ geom: tube([0, 0, 0], [0, -0.023, 0], 0.011, { segments: 6 }), color: fur }] },
    ],
  };
}

/** Hirondelle : corps bleu nuit, ventre crème, gorge rousse, ailes en faucille, queue fourchue ; envergure 0,2 u. */
function swallow() {
  const top = 'asphalt', belly = 'wallCream', wing = 'roofSlate', throat = 'roofRed';
  const BODY_Y = 0.016;
  return {
    anim: 'flyer', fitWidth: 0.2, footprint: [0.2, 0.1],
    pieces: [
      { name: 'Body', parent: null, pivot: [0, BODY_Y, 0], shapes: [
        { geom: ellipsoid([0.012, 0.011, 0.034], [0, 0, 0], 8, 6), color: top },
        { geom: ellipsoid([0.0105, 0.0075, 0.03], [0, -0.0055, 0.002], 8, 5), color: belly },
        { geom: ellipsoid([0.0105, 0.0095, 0.012], [0, 0.001, 0.034], 8, 5), color: top }, // tête
        { geom: ellipsoid([0.008, 0.006, 0.007], [0, -0.004, 0.038], 6, 4), color: throat }, // gorge
        { geom: tube([0, 0, 0.044], [0, -0.001, 0.056], 0.0025, { segments: 5, topRadius: 0.0003 }), color: 'asphalt' }, // bec
      ] },
      { name: 'WingL', parent: 'Body', pivot: [0.009, 0.004, 0.006], shapes: [
        { geom: transformGeom(chamferBox([0.09, 0.0035, 0.03], 0.0025, [0.046, 0, -0.012]), { rotate: ['y', 22] }), color: wing },
      ] },
      { name: 'WingR', parent: 'Body', pivot: [-0.009, 0.004, 0.006], shapes: [
        { geom: transformGeom(chamferBox([0.09, 0.0035, 0.03], 0.0025, [-0.046, 0, -0.012]), { rotate: ['y', -22] }), color: wing },
      ] },
      { name: 'Tail', parent: 'Body', pivot: [0, 0.002, -0.03], shapes: [
        { geom: transformGeom(chamferBox([0.007, 0.0025, 0.05], 0.0015, [0, 0, -0.025]), { rotate: ['y', 12] }), color: top },
        { geom: transformGeom(chamferBox([0.007, 0.0025, 0.05], 0.0015, [0, 0, -0.025]), { rotate: ['y', -12] }), color: top },
      ] },
    ],
  };
}

/** Cycliste : cadre (+ guidon, selle), deux roues (pivot au moyeu), corps, tête, deux jambes ; longueur 0,28 u. */
function cyclist() {
  const R = 0.05, HUB_F = [0, R, 0.105], HUB_B = [0, R, -0.1], BB = [0, 0.055, 0.0];
  const SEAT = [0, 0.135, -0.03], HEAD_TUBE = [0, 0.13, 0.085];
  const frame = 'roofRed', tyre = 'asphalt', hub = 'metalLight', saddle = 'asphalt';
  const shirt = 'river', pants = 'asphalt', skin = 'wallBeige', helmet = 'sun';
  const tubeR = 0.005;
  const HIP = [0, 0.15, -0.03];
  return {
    anim: 'wheeled', fitLength: 0.28, footprint: [0.08, 0.28],
    pieces: [
      { name: 'Frame', parent: null, pivot: [0, 0, 0], shapes: [
        { geom: tube(BB, SEAT, tubeR), color: frame },                          // tube de selle
        { geom: tube(BB, HEAD_TUBE, tubeR), color: frame },                     // tube diagonal
        { geom: tube([0, 0.128, -0.028], [0, 0.128, 0.082], tubeR), color: frame }, // tube horizontal
        { geom: tube(HEAD_TUBE, HUB_F, tubeR), color: frame },                  // fourche
        { geom: tube(BB, HUB_B, tubeR * 0.8), color: frame },                   // bases
        { geom: tube(HUB_B, SEAT, tubeR * 0.8), color: frame },                 // haubans
        { geom: tube([-0.036, 0.142, 0.088], [0.036, 0.142, 0.088], 0.004), color: hub }, // guidon
        { geom: tube([0, 0.13, 0.085], [0, 0.142, 0.088], 0.004), color: hub },  // potence
        { geom: chamferBox([0.03, 0.01, 0.05], 0.003, [0, 0.14, -0.032]), color: saddle }, // selle
        { geom: tube([-0.012, 0.055, 0], [0.012, 0.055, 0], 0.004), color: hub }, // axe de pédalier
      ] },
      { name: 'WheelF', parent: 'Frame', pivot: HUB_F, shapes: [
        { geom: wheel(R, 0.008, [0, 0, 0], 14), color: tyre },
        { geom: wheel(R * 0.3, 0.012, [0, 0, 0], 8), color: hub },
      ] },
      { name: 'WheelB', parent: 'Frame', pivot: HUB_B, shapes: [
        { geom: wheel(R, 0.008, [0, 0, 0], 14), color: tyre },
        { geom: wheel(R * 0.3, 0.012, [0, 0, 0], 8), color: hub },
      ] },
      { name: 'Body', parent: 'Frame', pivot: HIP, shapes: [
        { geom: transformGeom(chamferBox([0.06, 0.085, 0.04], 0.008, [0, 0.042, 0]), { rotate: ['x', 28] }), color: shirt }, // torse penché en avant
        { geom: tube([0.034, 0.07, 0.03], [0.034, 0.0, 0.112], 0.009, { segments: 6 }), color: shirt },   // bras gauche vers le guidon
        { geom: tube([-0.034, 0.07, 0.03], [-0.034, 0.0, 0.112], 0.009, { segments: 6 }), color: shirt }, // bras droit
        { geom: ellipsoid([0.01, 0.009, 0.01], [0.034, -0.004, 0.115], 6, 4), color: skin },   // mains
        { geom: ellipsoid([0.01, 0.009, 0.01], [-0.034, -0.004, 0.115], 6, 4), color: skin },
      ] },
      { name: 'Head', parent: 'Body', pivot: [0, 0.078, 0.04], shapes: [
        { geom: chamferBox([0.06, 0.056, 0.058], 0.01, [0, 0.03, 0.004]), color: skin },
        { geom: ellipsoid([0.034, 0.024, 0.036], [0, 0.052, 0.0], 8, 5), color: helmet },
        { geom: box([0.008, 0.009, 0.004], [-0.014, 0.03, 0.034]), color: 'asphalt' },
        { geom: box([0.008, 0.009, 0.004], [0.014, 0.03, 0.034]), color: 'asphalt' },
      ] },
      { name: 'LegL', parent: 'Body', pivot: [0.022, 0, 0], shapes: [
        { geom: tube([0, 0, 0], [0.002, -0.06, 0.03], 0.011, { segments: 6 }), color: pants },   // cuisse
        { geom: tube([0.002, -0.06, 0.03], [0.004, -0.096, 0.028], 0.009, { segments: 6 }), color: pants }, // tibia
        { geom: box([0.018, 0.012, 0.036], [0.004, -0.1, 0.034]), color: 'asphalt' },           // pied
      ] },
      { name: 'LegR', parent: 'Body', pivot: [-0.022, 0, 0], shapes: [
        { geom: tube([0, 0, 0], [-0.002, -0.06, 0.03], 0.011, { segments: 6 }), color: pants },
        { geom: tube([-0.002, -0.06, 0.03], [-0.004, -0.096, 0.028], 0.009, { segments: 6 }), color: pants },
        { geom: box([0.018, 0.012, 0.036], [-0.004, -0.1, 0.034]), color: 'asphalt' },
      ] },
    ],
  };
}

/** Plan des pantins : identifiant → constructeur. */
export const PUPPETS = {
  'citizen-a': () => citizen({ shirt: 'roofRed', pants: 'asphalt', skin: 'wallBeige', hair: 'wood' }),
  'citizen-b': () => citizen({ shirt: 'river', pants: 'roofSlate', skin: 'wallTan', hair: 'asphalt' }),
  'citizen-c': () => citizen({ shirt: 'sun', pants: 'wood', skin: 'wallBeige', hair: 'roofOrange' }),
  heron,
  otter,
  swallow,
  cyclist,
};

// ─── Assemblage, normalisation, export ──────────────────────────────────────────────────────────

/** Boîte englobante monde d'un pantin (pivots composés le long de la hiérarchie). */
function puppetBounds(pieces) {
  const byName = new Map(pieces.map((p) => [p.name, p]));
  const world = (p) => { const t = [...p.pivot]; let q = p.parent ? byName.get(p.parent) : null; while (q) { t[0] += q.pivot[0]; t[1] += q.pivot[1]; t[2] += q.pivot[2]; q = q.parent ? byName.get(q.parent) : null; } return t; };
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const p of pieces) {
    const w = world(p);
    for (const s of p.shapes) for (let i = 0; i < s.geom.positions.length; i += 3) for (let k = 0; k < 3; k++) { const v = s.geom.positions[i + k] + w[k]; if (v < min[k]) min[k] = v; if (v > max[k]) max[k] = v; }
  }
  return { min, max };
}

/** Échelle uniforme (pivots et sommets) puis recalage : centré en x/z, posé sur y = 0 (via le pivot racine). */
function normalizePuppet(spec) {
  const { pieces } = spec;
  let b = puppetBounds(pieces);
  const size = b.max.map((v, i) => v - b.min[i]);
  let k = 1;
  if (spec.fitHeight) k = spec.fitHeight / size[1];
  else if (spec.fitLength) k = spec.fitLength / size[2];
  else if (spec.fitWidth) k = spec.fitWidth / size[0];
  if (Math.abs(k - 1) > 1e-9) {
    for (const p of pieces) {
      p.pivot = p.pivot.map((v) => v * k);
      for (const s of p.shapes) s.geom.positions = s.geom.positions.map((v) => v * k);
    }
  }
  b = puppetBounds(pieces);
  const root = pieces.find((p) => !p.parent);
  root.pivot = [root.pivot[0] - (b.min[0] + b.max[0]) / 2, root.pivot[1] - b.min[1], root.pivot[2] - (b.min[2] + b.max[2]) / 2];
  return { scale: k, bounds: puppetBounds(pieces) };
}

async function buildPuppet(id, spec) {
  const { scale, bounds } = normalizePuppet(spec);
  const doc = new Document().setLogger(QUIET);
  doc.getRoot().getAsset().generator = 'Tiletown tools/build-fauna.js';
  doc.getRoot().getAsset().copyright = 'CC0 1.0 — Tiletown (https://github.com/Madec01/Tiletown)';
  const buffer = doc.createBuffer();
  const scene = doc.createScene(id);
  doc.getRoot().setDefaultScene(scene);
  const rootNode = doc.createNode(id);
  scene.addChild(rootNode);
  const nodes = new Map();
  const parts = {}, partsTree = {}, pivots = {};
  for (const p of spec.pieces) {
    const node = doc.createNode(p.name).setTranslation(p.pivot);
    const mesh = doc.createMesh(p.name);
    node.setMesh(mesh);
    for (const s of p.shapes) addGeometry(doc, buffer, node, s.geom, flatMaterial(doc, s.color));
    nodes.set(p.name, node);
    parts[p.name] = p.name;
    partsTree[p.name] = p.parent;
    pivots[p.name] = p.pivot.map(round3);
  }
  for (const p of spec.pieces) (p.parent ? nodes.get(p.parent) : rootNode).addChild(nodes.get(p.name));
  await doc.transform(dedup(), prune({ keepLeaves: true, keepAttributes: false }));
  const triangles = countTriangles(doc);
  const prims = doc.getRoot().listMeshes().reduce((n, m) => n + m.listPrimitives().length, 0);
  const measured = getBounds(scene);
  await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const file = `${id}.glb`;
  await io.write(joinPath(OUT_DIR, file), doc);
  const bytes = statSync(joinPath(OUT_DIR, file)).size;
  vlog(`${id} : ${spec.pieces.length} pièces, ${prims} primitives, échelle ${scale.toFixed(3)}`);
  return {
    file,
    kit: 'tiletown',
    source: 'tools/build-fauna.js',
    license: 'CC0',
    url: 'https://github.com/Madec01/Tiletown',
    animated: true,
    rig: 'puppet',
    anim: spec.anim,
    parts,
    partsTree,
    pivots,
    scale: 1,
    yaw: 0,
    footprint: spec.footprint,
    bbox: { min: measured.min.map(round3), max: measured.max.map(round3), size: measured.max.map((v, i) => round3(v - measured.min[i])) },
    triangles,
    primitives: prims,
    bytes,
    note: `pantin en primitives ; pivots : ${Object.entries(partsTree).filter(([, par]) => par).map(([n, par]) => `${n}←${par}`).join(', ')} ; x+ = côté gauche`,
    _bounds: bounds,
  };
}

async function main() {
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;
  mkdirSync(OUT_DIR, { recursive: true });
  const ids = ONLY.length ? ONLY.filter((id) => { if (!PUPPETS[id]) console.error(`pantin inconnu : ${id}`); return !!PUPPETS[id]; }) : Object.keys(PUPPETS);
  const entries = {};
  let failed = 0;
  for (const id of ids) {
    try {
      const entry = await buildPuppet(id, PUPPETS[id]());
      delete entry._bounds;
      entries[id] = entry;
      const sz = entry.bbox.size.map((v) => v.toFixed(3)).join(' × ');
      log(`✓ ${id.padEnd(10)} ${String(entry.triangles).padStart(5)} tris ${String(entry.primitives).padStart(3)} prim. ${String((entry.bytes / 1024).toFixed(1)).padStart(6)} Ko  ${sz}  ${Object.keys(entry.parts).join(' ')}`);
    } catch (e) {
      failed++;
      log(`✗ ${id.padEnd(10)} ERREUR : ${e.message}`);
      if (VERBOSE) console.error(e);
    }
  }
  const manifest = updateManifest(entries);
  const puppetBytes = totalBytes(manifest.models, (m) => m.animated && m.rig === 'puppet');
  const animatedBytes = totalBytes(manifest.models, (m) => m.animated);
  log(`\n${Object.keys(entries).length} pantins écrits ; poids pantins : ${(puppetBytes / 1024).toFixed(1)} Ko ; tous modèles animés : ${(animatedBytes / 1e6).toFixed(2)} Mo (objectif < 1,5 Mo).`);
  if (failed) process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && (await import('node:path')).resolve(process.argv[1]) === (await import('node:url')).fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
