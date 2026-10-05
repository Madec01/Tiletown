// Rues SUR LES ARÊTES (docs/GAME_DESIGN.md §4.1, docs/ARCHITECTURE.md §3) et ABORDS des rues.
//
// Pour chaque arête du treillis valant 2 (rue) ou 3 (pont), une bande centrée sur l'arête, orientée
// est-ouest (arêtes `h`) ou nord-sud (arêtes `v`) ; les chemins (1) sont une bande fine de terre ;
// les ponts sont surélevés avec garde-corps et piles.
//
// NŒUDS. Les bandes de rue s'arrêtent à une demi-largeur de trottoir du sommet : c'est une PIÈCE DE
// NŒUD qui referme la jonction, posée à CHAQUE sommet touché par une rue. Cinq pièces (cul-de-sac,
// droit, virage, en T, carrefour) orientées par un quart de tour :
//   - les angles de trottoir sont ARRONDIS (quart de disque aux sommets) ;
//   - un VIRAGE (deux arêtes à 90° sans troisième branche) devient un ARC : la chaussée suit un
//     quart de disque de rayon `ROAD_WIDTH`, le trottoir l'anneau correspondant.
//
// ABORDS. Sous chaque îlot bâti, une PARCELLE claire (herbe ou dallage selon la famille) relie le
// bâtiment au trottoir, et une ALLÉE d'entrée la raccorde à la rue la plus proche. Chaussée,
// trottoir et parcelle sont rapprochés en valeur : la rue encadre moins les bâtiments.
//
// Les rues saturées se teintent (orange puis rouge) d'après `world.traffic`.
// `collectRoadPlacements` est pure : testable sous Node.

import * as THREE from 'three';
import { PALETTE } from '../data/palette.js';
import { paintGeometry, mergeParts } from './models.js';
import { composeMatrix, disposeObject } from './util.js';
import { LAND_THICKNESS } from './ground.js';
import { LOT_HALF, entrySide } from './buildings.js';
import { TILE_BY_ID } from '../data/tiles.js';

export const EDGE_NONE = 0;
export const EDGE_PATH = 1;
export const EDGE_STREET = 2;
export const EDGE_BRIDGE = 3;

export const ROAD_WIDTH = 0.3;
export const ROAD_THICKNESS = 0.02;
export const SIDEWALK_WIDTH = 0.4;
export const SIDEWALK_THICKNESS = 0.012;
export const PATH_WIDTH = 0.16;
export const PATH_THICKNESS = 0.015;
export const BRIDGE_DECK_TOP = 0.07;
/** Épaisseur de la parcelle (bande claire sous l'îlot) et de l'allée d'entrée. */
export const LOT_THICKNESS = 0.015;
export const DRIVEWAY_THICKNESS = 0.017;
/** Seuils de trafic (trajets par arête) pour l'orange puis le rouge (docs/GAME_DESIGN.md §4.3). */
export const TRAFFIC_ORANGE = 3;
export const TRAFFIC_RED = 6;

/** Demi-largeurs, employées partout dans la construction des pièces. */
const RW = ROAD_WIDTH / 2;
const SW = SIDEWALK_WIDTH / 2;
/** Longueur d'une bande de rue : l'arête moins la place des deux pièces de nœud. */
const STRIP_LENGTH = 1 - 2 * SW;
/** Rayon d'arrondi des coins de trottoir exposés (bout de rue, extérieur d'un virage). */
const SIDEWALK_RADIUS = 0.075;
/** Rayon du liseré d'herbe qui arrondit l'angle du trottoir là où deux rues se rejoignent. */
const VERGE_RADIUS = 0.08;
/**
 * Arcs (angle de départ, angle d'arrivée, décroissants) du liseré d'herbe, dans l'ordre des coins
 * (+x, +z), (+x, −z), (−x, −z), (−x, +z) : chaque quart de disque regarde vers le centre du nœud.
 */
const VERGE_ARCS = Object.freeze([
  [1.5 * Math.PI, Math.PI], [Math.PI, 0.5 * Math.PI], [0.5 * Math.PI, 0], [0, -0.5 * Math.PI],
]);

/** Masques de branches d'un sommet (N, E, S, O). */
const BR_N = 1, BR_E = 2, BR_S = 4, BR_W = 8;

/**
 * Forme de pièce et quart de tour à appliquer, par masque de branches.
 * Les formes canoniques : `end` branche +X, `straight` ±X, `corner` +X et +Z, `tee` ±X et +Z.
 * Une rotation de yaw autour de Y envoie +X sur (cos, −sin) et +Z sur (sin, cos).
 */
const NODE_BY_MASK = Object.freeze({
  [BR_E]: ['end', 0], [BR_N]: ['end', 1], [BR_W]: ['end', 2], [BR_S]: ['end', 3],
  [BR_E | BR_W]: ['straight', 0], [BR_N | BR_S]: ['straight', 1],
  [BR_E | BR_S]: ['corner', 0], [BR_N | BR_E]: ['corner', 1], [BR_N | BR_W]: ['corner', 2], [BR_S | BR_W]: ['corner', 3],
  [BR_E | BR_W | BR_S]: ['tee', 0], [BR_N | BR_S | BR_E]: ['tee', 1], [BR_E | BR_W | BR_N]: ['tee', 2], [BR_N | BR_S | BR_W]: ['tee', 3],
  [BR_N | BR_E | BR_S | BR_W]: ['cross', 0],
});

/**
 * Liste pure des éléments à poser :
 *   - `streets`, `paths`, `bridges` : { x, z, horizontal, traffic } (centre de l'arête ; `horizontal`
 *     = arête `h`, orientée est-ouest) ;
 *   - `streetNodes` : { x, z, degree, mask, shape, quarter } à CHAQUE sommet touché par une rue ;
 *   - `pathNodes` : { x, z, degree } aux angles de chemin ;
 *   - `lots` : { x, z, tile, kind } parcelle sous chaque îlot bâti ;
 *   - `driveways` : { x, z, yaw, tile } allée reliant l'îlot à la rue la plus proche.
 * Un monde sans `edges` donne des listes vides.
 */
export function collectRoadPlacements(world) {
  const result = { streets: [], paths: [], bridges: [], streetNodes: [], pathNodes: [], lots: [], driveways: [] };
  const edges = world && world.edges;
  if (!edges || !edges.h || !edges.v) return result;
  const { cols, rows } = world;
  const traffic = world.traffic || null;
  const hAt = (x, y) => (x >= 0 && x < cols && y >= 0 && y <= rows ? edges.h[y * cols + x] : 0);
  const vAt = (x, y) => (x >= 0 && x <= cols && y >= 0 && y < rows ? edges.v[y * (cols + 1) + x] : 0);

  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = edges.h[y * cols + x];
      if (!v) continue;
      const item = { x: x + 0.5, z: y, horizontal: true, traffic: traffic && traffic.h ? traffic.h[y * cols + x] || 0 : 0 };
      if (v === EDGE_PATH) result.paths.push(item);
      else if (v === EDGE_BRIDGE) result.bridges.push(item);
      else result.streets.push(item);
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x <= cols; x++) {
      const v = edges.v[y * (cols + 1) + x];
      if (!v) continue;
      const item = { x, z: y + 0.5, horizontal: false, traffic: traffic && traffic.v ? traffic.v[y * (cols + 1) + x] || 0 : 0 };
      if (v === EDGE_PATH) result.paths.push(item);
      else if (v === EDGE_BRIDGE) result.bridges.push(item);
      else result.streets.push(item);
    }
  }

  // Nœuds aux sommets du treillis : une pièce à CHAQUE sommet touché par une rue (les bandes s'y
  // arrêtent) ; pour les chemins, seulement aux angles (leurs bandes vont de sommet à sommet).
  for (let cy = 0; cy <= rows; cy++) {
    for (let cx = 0; cx <= cols; cx++) {
      const e = hAt(cx, cy), w = hAt(cx - 1, cy), s = vAt(cx, cy), n = vAt(cx, cy - 1);
      const streetMask = (n >= EDGE_STREET ? BR_N : 0) | (e >= EDGE_STREET ? BR_E : 0)
        | (s >= EDGE_STREET ? BR_S : 0) | (w >= EDGE_STREET ? BR_W : 0);
      if (streetMask) {
        const [shape, quarter] = NODE_BY_MASK[streetMask];
        const degree = (streetMask & 1) + ((streetMask >> 1) & 1) + ((streetMask >> 2) & 1) + ((streetMask >> 3) & 1);
        result.streetNodes.push({ x: cx, z: cy, degree, mask: streetMask, shape, quarter });
      }
      const pathMask = (n === EDGE_PATH ? BR_N : 0) | (e === EDGE_PATH ? BR_E : 0)
        | (s === EDGE_PATH ? BR_S : 0) | (w === EDGE_PATH ? BR_W : 0);
      const pd = (pathMask & 1) + ((pathMask >> 1) & 1) + ((pathMask >> 2) & 1) + ((pathMask >> 3) & 1);
      if (pd >= 3 || (pd === 2 && !((pathMask & BR_E && pathMask & BR_W) || (pathMask & BR_N && pathMask & BR_S)))) {
        result.pathNodes.push({ x: cx, z: cy, degree: pd });
      }
    }
  }

  // Abords : parcelle sous chaque îlot bâti, allée vers la rue la plus proche.
  if (world.tiles) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tile = world.tiles[y * cols + x];
        if (!tile || !tile.building) continue;
        const def = TILE_BY_ID[tile.building.type];
        const family = def ? def.family : 'habitat';
        if (family === 'nature') continue;            // la nature plantée n'a ni parcelle ni allée
        // Un quartier a un jardin jusqu'au bord de la chaussée (pas de trottoir devant chez soi) ;
        // les autres familles gardent leur trottoir et n'ont qu'une bande de parcelle.
        const kind = family === 'habitat' ? 'garden' : family === 'infrastructure' ? 'gravel' : 'paved';
        result.lots.push({ x: x + 0.5, z: y + 0.5, tile: y * cols + x, kind });
        const side = entrySide(world, x, y);
        if (side === null) continue;
        // yaw canonique : l'allée est modélisée vers +Z (sud) ; N = 180°, E = 90°, S = 0, O = 270°.
        const yaw = [Math.PI, Math.PI / 2, 0, -Math.PI / 2][side];
        result.driveways.push({ x: x + 0.5, z: y + 0.5, yaw, tile: y * cols + x });
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------------------------
// Géométries plates (plan XZ, normale vers le haut)
// ---------------------------------------------------------------------------------------------

/**
 * Polygone plat convexe (éventail depuis `center`), sommets donnés dans l'ordre des angles
 * DÉCROISSANTS (c'est l'ordre qui donne une normale vers +Y). `pts` : [[x, z], …].
 */
function fanGeometry(center, pts, y, color) {
  const n = pts.length;
  const position = new Float32Array((n + 1) * 3);
  const normal = new Float32Array((n + 1) * 3);
  position[0] = center[0]; position[1] = y; position[2] = center[1];
  for (let i = 0; i < n; i++) {
    position[(i + 1) * 3] = pts[i][0];
    position[(i + 1) * 3 + 1] = y;
    position[(i + 1) * 3 + 2] = pts[i][1];
  }
  for (let i = 0; i <= n; i++) { normal[i * 3 + 1] = 1; }
  const index = [];
  for (let i = 1; i < n; i++) index.push(0, i, i + 1);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(position, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  g.setIndex(index);
  return paintGeometry(g, color);
}

/** Rectangle plat [x0, x1] × [z0, z1] (normale vers le haut). */
function rectGeometry(x0, z0, x1, z1, y, color) {
  return fanGeometry([(x0 + x1) / 2, (z0 + z1) / 2], [[x0, z0], [x0, z1], [x1, z1], [x1, z0]], y, color);
}

/** Points d'un arc centré en (cx, cz), du rayon r, de l'angle a0 à a1 (rad), en `seg` segments. */
function arcPoints(cx, cz, r, a0, a1, seg) {
  const pts = [];
  for (let i = 0; i <= seg; i++) {
    const a = a0 + (a1 - a0) * (i / seg);
    pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
  }
  return pts;
}

/** Secteur plat (quart de disque et variantes) : centre + arc, angles décroissants. */
function sectorGeometry(cx, cz, r, a0, a1, seg, y, color) {
  return fanGeometry([cx, cz], arcPoints(cx, cz, r, a0, a1, seg), y, color);
}

/**
 * Carré plat de demi-côté `h` dont CHAQUE coin reçoit son propre rayon d'arrondi.
 * `radii` suit l'ordre des coins (+x, +z), (+x, −z), (−x, −z), (−x, +z) ; 0 = angle droit.
 * Les sommets sont émis à angle décroissant (normale vers le haut).
 */
function roundedSquareGeometry(h, radii, y, color, seg = 3) {
  const corners = [
    [1, 1, Math.PI / 2, 0], [1, -1, 0, -Math.PI / 2],
    [-1, -1, -Math.PI / 2, -Math.PI], [-1, 1, Math.PI, Math.PI / 2],
  ];
  const pts = [];
  corners.forEach(([sx, sz, a0, a1], i) => {
    const r = Math.max(0, Math.min(radii[i] || 0, h));
    if (r <= 0) { pts.push([sx * h, sz * h]); return; }
    pts.push(...arcPoints(sx * (h - r), sz * (h - r), r, a0, a1, seg));
  });
  return fanGeometry([0, 0], pts, y, color);
}

/** Boîte posée sur `y0`, peinte d'une couleur. */
function slab(w, h, d, color, y0 = 0, x = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y0 + h / 2, z);
  return paintGeometry(g, color);
}

// ---------------------------------------------------------------------------------------------
// Jeu de couleurs : chaussée, trottoir et parcelle rapprochés en valeur
// ---------------------------------------------------------------------------------------------

/**
 * Mélange de deux teintes « #rrggbb » dans l'espace d'AFFICHAGE (sRGB) : c'est là que se juge le
 * contraste, un mélange en espace linéaire éclaircirait trop peu.
 */
function mixHex(a, b, t) {
  const na = parseInt(a.slice(1), 16), nb = parseInt(b.slice(1), 16);
  const ch = (shift) => Math.round((((na >> shift) & 255) * (1 - t)) + (((nb >> shift) & 255) * t));
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

/**
 * Teintes des rues et de leurs abords. La chaussée est franchement éclaircie et le trottoir
 * réchauffé : l'écart de valeur entre chaussée, trottoir et parcelle devient une gradation douce
 * au lieu d'un cadre sombre autour de chaque bâtiment.
 */
export function roadColors() {
  const P = PALETTE;
  const asphalt = mixHex(P.asphalt, P.sidewalk, 0.62);
  const sidewalk = mixHex(mixHex(P.sidewalk, P.wallCream, 0.45), P.wallTan, 0.18);
  const lotGarden = mixHex(P.grassLight, P.wallCream, 0.2);
  return {
    asphalt: new THREE.Color(asphalt),
    sidewalk: new THREE.Color(sidewalk),
    marking: new THREE.Color(mixHex(P.marking, sidewalk, 0.35)),
    orange: new THREE.Color(mixHex(P.roofOrange, asphalt, 0.35)),
    red: new THREE.Color(mixHex(P.roofRed, asphalt, 0.35)),
    path: new THREE.Color(mixHex(P.soil, P.wallCream, 0.2)),
    lotGarden: new THREE.Color(lotGarden),
    lotPaved: new THREE.Color(mixHex(P.rockLight, P.wallCream, 0.45)),
    lotGravel: new THREE.Color(mixHex(P.rockLight, P.sidewalk, 0.25)),
    driveway: new THREE.Color(mixHex(P.rockLight, P.wallTan, 0.45)),
    // Liseré d'herbe des angles de trottoir : un vert tendre, à mi-chemin du sol et de la parcelle.
    verge: new THREE.Color(mixHex(P.grassLight, P.wallCream, 0.08)),
  };
}

// ---------------------------------------------------------------------------------------------
// Pièces de nœud
// ---------------------------------------------------------------------------------------------

/**
 * Les cinq pièces de nœud, chacune { asphalt, sidewalk } fusionnées en une géométrie.
 * Formes canoniques : `end` branche +X, `straight` ±X, `corner` +X et +Z, `tee` ±X et +Z, `cross`.
 */
function buildNodeGeometries(colors) {
  const ya = ROAD_THICKNESS, ys = SIDEWALK_THICKNESS, yv = (ys + ya) / 2;
  const armDirs = {
    end: [[1, 0]],
    straight: [[1, 0], [-1, 0]],
    corner: [[1, 0], [0, 1]],
    tee: [[1, 0], [-1, 0], [0, 1]],
    cross: [[1, 0], [-1, 0], [0, 1], [0, -1]],
  };
  /** Coins du carré de trottoir, dans l'ordre de `roundedSquareGeometry`. */
  const QUADRANTS = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
  const out = {};
  for (const [shape, dirs] of Object.entries(armDirs)) {
    const parts = [];
    const hasArm = (dx, dz) => dirs.some((d) => d[0] === dx && d[1] === dz);
    // Un coin de trottoir n'est arrondi que si AUCUNE des deux branches voisines n'existe : sinon
    // l'arrondi entamerait la bande de rue qui s'y raccorde.
    const radii = QUADRANTS.map(([sx, sz]) => (hasArm(sx, 0) || hasArm(0, sz) ? 0 : SIDEWALK_RADIUS));

    if (shape === 'corner') {
      // Virage : trottoir en quart de disque (rayon RW + SW) autour du coin intérieur, plus les deux
      // amorces de branche ; chaussée en quart de disque de rayon ROAD_WIDTH : le virage est un ARC.
      parts.push(sectorGeometry(RW, RW, RW + SW, 1.5 * Math.PI, Math.PI, 8, ys, colors.sidewalk));
      parts.push(rectGeometry(RW, -SW, SW, SW, ys, colors.sidewalk));
      parts.push(rectGeometry(-SW, RW, SW, SW, ys, colors.sidewalk));
      parts.push(sectorGeometry(RW, RW, ROAD_WIDTH, 1.5 * Math.PI, Math.PI, 8, ya, colors.asphalt));
      parts.push(rectGeometry(RW, -RW, SW, RW, ya, colors.asphalt));
      parts.push(rectGeometry(-RW, RW, RW, SW, ya, colors.asphalt));
    } else {
      // Carrefours, rue droite, cul-de-sac : trottoir en carré (coins exposés arrondis), chaussée en
      // croix selon les branches présentes.
      parts.push(roundedSquareGeometry(SW, radii, ys, colors.sidewalk));
      parts.push(rectGeometry(-RW, -RW, RW, RW, ya, colors.asphalt));
      for (const [dx, dz] of dirs) {
        if (dx) parts.push(rectGeometry(dx > 0 ? RW : -SW, -RW, dx > 0 ? SW : -RW, RW, ya, colors.asphalt));
        else parts.push(rectGeometry(-RW, dz > 0 ? RW : -SW, RW, dz > 0 ? SW : -RW, ya, colors.asphalt));
      }
    }

    // ANGLES DE TROTTOIR ARRONDIS : là où deux branches se rejoignent, un quart de disque d'herbe
    // (le liseré de parcelle) mord le coin du trottoir. Le trottoir y tourne au lieu de former un
    // angle droit, et un peu de vert revient aux carrefours.
    QUADRANTS.forEach(([sx, sz], q) => {
      if (!hasArm(sx, 0) || !hasArm(0, sz)) return;
      const [a0, a1] = VERGE_ARCS[q];
      parts.push(sectorGeometry(sx * SW, sz * SW, VERGE_RADIUS, a0, a1, 6, yv, colors.verge));
    });
    out[shape] = mergeParts(parts);
  }
  return out;
}

/** Un modèle du manifeste convient à une arête s'il est assez étroit (pièce « bord », pas une case entière). */
function edgeModel(models, id) {
  const m = models.get(id);
  if (!m) return null;
  const b = m.geometry.boundingBox;
  const width = Math.min(b.max.x - b.min.x, b.max.z - b.min.z);
  return width <= 0.5 ? m : null;
}

/** Géométries de remplacement (couleurs de sommets). */
function buildFallbackGeometries({ markings, colors }) {
  const streetTrimParts = [slab(STRIP_LENGTH, SIDEWALK_THICKNESS, SIDEWALK_WIDTH, colors.sidewalk)];
  if (markings) streetTrimParts.push(slab(STRIP_LENGTH * 0.5, 0.004, 0.02, colors.marking, ROAD_THICKNESS));
  const bridgeParts = [
    slab(1, BRIDGE_DECK_TOP - ROAD_THICKNESS, 0.34, PALETTE.wallTan, ROAD_THICKNESS),               // tablier
    slab(1, 0.09, 0.025, PALETTE.wood, BRIDGE_DECK_TOP, 0, 0.165),                                   // garde-corps
    slab(1, 0.09, 0.025, PALETTE.wood, BRIDGE_DECK_TOP, 0, -0.165),
    slab(0.1, ROAD_THICKNESS + LAND_THICKNESS, 0.3, PALETTE.rock, -LAND_THICKNESS, -0.3, 0),      // piles
    slab(0.1, ROAD_THICKNESS + LAND_THICKNESS, 0.3, PALETTE.rock, -LAND_THICKNESS, 0.3, 0),
  ];
  if (markings) bridgeParts.push(slab(0.42, 0.004, 0.03, colors.marking, BRIDGE_DECK_TOP));
  return {
    // Asphalte : couleur par instance (trafic), donc sans couleur de sommets.
    street: new THREE.BoxGeometry(STRIP_LENGTH, ROAD_THICKNESS, ROAD_WIDTH).translate(0, ROAD_THICKNESS / 2, 0),
    streetTrim: mergeParts(streetTrimParts),
    path: slab(1, PATH_THICKNESS, PATH_WIDTH, colors.path),
    pathNode: slab(PATH_WIDTH, PATH_THICKNESS + 0.001, PATH_WIDTH, colors.path),
    bridge: mergeParts(bridgeParts),
    // Parcelle : un plateau clair sous l'îlot, posé juste au-dessus du trottoir.
    lot: slab(LOT_HALF * 2, LOT_THICKNESS, LOT_HALF * 2, colors.lotPaved),
    // Jardin d'un quartier : la pelouse va jusqu'au bord de la chaussée.
    lotGarden: slab((0.5 - RW) * 2, LOT_THICKNESS, (0.5 - RW) * 2, colors.lotGarden),
    // Allée d'entrée : une dalle claire du pied du bâtiment au bord de la chaussée (vers +Z).
    driveway: slab(0.17, DRIVEWAY_THICKNESS, 0.5 - RW + 0.015 - 0.17, colors.driveway, 0, 0, (0.17 + 0.5 - RW + 0.015) / 2),
  };
}

/**
 * Crée le rendu des rues. options : { markings = true, useEdgeModels = false, abords = true }.
 * Par défaut les rues sont des géométries procédurales continues (chaussée 0,30 u, trottoirs
 * arrondis aux nœuds, virages en arc) ; les pièces GLB « road-edge-* » du manifeste restent
 * disponibles avec `useEdgeModels: true`.
 * API : { group, setWorld(world), stats, dispose() }.
 */
export function createRoads(models, options = {}) {
  const markings = options.markings !== false;
  const useEdgeModels = options.useEdgeModels === true;
  const abords = options.abords !== false;
  const group = new THREE.Group();
  group.name = 'roads';
  const stats = { streets: 0, paths: 0, bridges: 0, streetNodes: 0, pathNodes: 0, lots: 0, driveways: 0, drawables: 0 };
  const colors = roadColors();
  const geometries = buildFallbackGeometries({ markings, colors });
  const nodes = buildNodeGeometries(colors);
  const vertexMaterial = models.materials.vertex;
  const asphaltMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const lotMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const sharedMaterials = new Set([vertexMaterial, asphaltMaterial, lotMaterial, ...models.materials.textured.values()]);
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  const lotColorOf = { garden: colors.lotGarden, paved: colors.lotPaved, gravel: colors.lotGravel };

  // Modèles du manifeste dédiés aux arêtes, s'ils existent (sinon géométries de remplacement).
  const streetGlb = useEdgeModels ? edgeModel(models, 'road-edge-straight') : null;
  const bridgeGlb = useEdgeModels ? edgeModel(models, 'road-edge-bridge') : null;

  function clear() {
    for (const child of [...group.children]) {
      group.remove(child);
      disposeObject(child, sharedMaterials);
    }
    for (const k of Object.keys(stats)) stats[k] = 0;
  }

  /**
   * InstancedMesh d'un lot d'éléments. L'orientation vient de `it.yaw` s'il existe, sinon de
   * `it.horizontal` (faux = arête verticale, tournée d'un quart de tour).
   */
  function instance(name, geometry, material, items, { cast = false, colorize = null } = {}) {
    if (!items.length) return null;
    const mesh = new THREE.InstancedMesh(geometry, material, items.length);
    mesh.name = name;
    mesh.geometry.userData.shared = true;
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    items.forEach((it, k) => {
      const yaw = typeof it.yaw === 'number' ? it.yaw : (it.horizontal === false ? Math.PI / 2 : 0);
      mesh.setMatrixAt(k, composeMatrix(matrix, it.x, 0, it.z, yaw, 1));
      if (colorize) mesh.setColorAt(k, colorize(it));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    group.add(mesh);
    stats.drawables++;
    return mesh;
  }

  function trafficColor(item) {
    if (item.traffic >= TRAFFIC_RED) return color.copy(colors.red);
    if (item.traffic >= TRAFFIC_ORANGE) return color.copy(colors.orange);
    return color.copy(colors.asphalt);
  }

  function setWorld(world) {
    clear();
    const p = collectRoadPlacements(world);
    stats.streets = p.streets.length; stats.paths = p.paths.length; stats.bridges = p.bridges.length;
    stats.streetNodes = p.streetNodes.length; stats.pathNodes = p.pathNodes.length;
    stats.lots = p.lots.length; stats.driveways = p.driveways.length;

    if (abords) {
      const gardens = p.lots.filter((l) => l.kind === 'garden');
      const others = p.lots.filter((l) => l.kind !== 'garden');
      instance('lots-garden', geometries.lotGarden, vertexMaterial, gardens);
      instance('lots', geometries.lot, lotMaterial, others, { colorize: (it) => color.copy(lotColorOf[it.kind] || colors.lotPaved) });
      instance('driveways', geometries.driveway, vertexMaterial, p.driveways);
    }
    if (streetGlb) {
      instance('streets', streetGlb.geometry, streetGlb.material, p.streets);
    } else {
      instance('streets', geometries.street, asphaltMaterial, p.streets, { colorize: trafficColor });
      instance('street-trim', geometries.streetTrim, vertexMaterial, p.streets);
    }
    // Une pièce par forme de nœud (cul-de-sac, droit, virage, T, carrefour), tournée au quart de tour.
    for (const shape of Object.keys(nodes)) {
      const list = p.streetNodes.filter((n) => n.shape === shape)
        .map((n) => ({ x: n.x, z: n.z, yaw: n.quarter * Math.PI / 2 }));
      instance(`street-node-${shape}`, nodes[shape], vertexMaterial, list);
    }
    instance('paths', geometries.path, vertexMaterial, p.paths);
    instance('path-nodes', geometries.pathNode, vertexMaterial, p.pathNodes.map((n) => ({ ...n, horizontal: true })));
    instance('bridges', bridgeGlb ? bridgeGlb.geometry : geometries.bridge, bridgeGlb ? bridgeGlb.material : vertexMaterial, p.bridges, { cast: true });
  }

  function dispose() {
    clear();
    for (const g of Object.values(geometries)) g.dispose();
    for (const g of Object.values(nodes)) g.dispose();
    asphaltMaterial.dispose();
    lotMaterial.dispose();
  }

  return { group, stats, setWorld, dispose };
}
