// Îlots, nature et décor de la vallée : pour chaque case, les instances de modèles à poser, puis
// leur rendu en un minimum d'appels de dessin.
//
// Deux familles d'instances :
//   - les ÎLOTS (bâtiment du catalogue, nature plantée) : une pose par case, au centre, orientée ;
//     autour d'eux, les ABORDS (haie, buisson, potager, arbre de rue) posés dans la marge laissée
//     par `BUILDING_SCALE` ;
//   - la VÉGÉTATION NATIVE : plus de « trois emplacements types par case », mais un SEMIS CONTINU en
//     coordonnées monde. Un champ de couverture (interpolation bilinéaire de l'indicateur de terrain
//     sur les centres de case) vaut 1 au cœur d'un massif, 0,5 sur une lisière et s'éteint une
//     demi-case au-delà : les bosquets débordent donc d'une case à l'autre, la densité décroît vers
//     la lisière, et plusieurs cases de forêt se lisent comme une seule forêt. Un bruit de valeur
//     basse fréquence ouvre des clairières, un autre mêle feuillus et résineux ; les tailles
//     (jeune, moyen, grand), les rotations et les échelles varient par instance.
//
// Rendu :
//   - stratégie `batched` (défaut) : un `BatchedMesh` par (matériau, groupe) — un seul appel de
//     dessin pour toute la ville, un pour les arbres, un pour le couvre-sol ;
//   - stratégie `instanced` : une `InstancedMesh` par identifiant de modèle (repli quand
//     l'extension WEBGL_multi_draw manque).
//   - VENT : les groupes `tree` et `cover` emploient un matériau dérivé qui incline le sommet des
//     feuillages de ± 2° (ondulation lente, calculée dans le shader : aucun coût CPU).
//
// `collectPlacements` et les fonctions de semis sont PURES (ne dépendent que du monde, du catalogue
// et des options) : testables sous Node.

import * as THREE from 'three';
import { TERRAINS } from '../data/terrain.js';
import { TILE_BY_ID, modelOfBuilding } from '../data/tiles.js';
import { familyOf } from './models.js';
import { hashUnit, lerp, composeMatrix, disposeObject } from './util.js';
import * as Ground from './ground.js';

const { surfaceHeight, isWaterTerrain } = Ground;
const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const QUARTER = Math.PI / 2;

/**
 * Les îlots bâtis sont modélisés à 0,85 u d'emprise ; on les ramène à ≈ 0,58 u pour dégager la rue
 * (chaussée + trottoirs) ET la bande de parcelle qui relie le bâtiment au sol (jardin, haie, allée).
 */
export const BUILDING_SCALE = 0.64;

/** Demi-côté de la parcelle d'un îlot bâti (bande claire entre le trottoir et le bâtiment). */
export const LOT_HALF = 0.31;

/** Rayon auquel se posent les plantations d'abords (haie, buisson, potager) dans la parcelle. */
export const LOT_DECOR_RADIUS = 0.285;

/** Débordement maximal d'un décor au-delà de la case de son massif (unités monde). */
export const SPILL = 0.5;

// ---------------------------------------------------------------------------------------------
// Bruit et champ de couverture (purs, déterministes)
// ---------------------------------------------------------------------------------------------

/** Lissage de Hermite (3t² − 2t³) sur [0, 1]. */
function smooth(t) {
  const u = t < 0 ? 0 : t > 1 ? 1 : t;
  return u * u * (3 - 2 * u);
}

/** Rampe lissée de `a` à `b`. */
function smoothstep(a, b, x) {
  return b === a ? (x < a ? 0 : 1) : smooth((x - a) / (b - a));
}

/**
 * Bruit de valeur sur la grille entière, interpolé en douceur : même (graine, k) → même champ.
 * Période 1 en x et z ; l'appelant met les coordonnées à l'échelle voulue.
 */
export function valueNoise(seed, x, z, k = 0) {
  const x0 = Math.floor(x), z0 = Math.floor(z);
  const fx = smooth(x - x0), fz = smooth(z - z0);
  const n00 = hashUnit(seed, x0, z0, k), n10 = hashUnit(seed, x0 + 1, z0, k);
  const n01 = hashUnit(seed, x0, z0 + 1, k), n11 = hashUnit(seed, x0 + 1, z0 + 1, k);
  return lerp(lerp(n00, n10, fx), lerp(n01, n11, fx), fz);
}

/**
 * Couverture d'un massif au point (px, pz) : interpolation bilinéaire de `indicator(x, y)` (1 sur une
 * case du massif, 0 ailleurs) prise aux CENTRES de case. Vaut 1 au cœur du massif, 0,5 au milieu
 * d'une lisière, et s'annule une demi-case au-delà de la dernière case du massif : c'est ce qui fait
 * déborder les bosquets et décroître la densité vers le bord.
 */
export function coverageAt(indicator, px, pz) {
  const u = px - 0.5, v = pz - 0.5;
  const x0 = Math.floor(u), z0 = Math.floor(v);
  const fx = u - x0, fz = v - z0;
  const a = indicator(x0, z0), b = indicator(x0 + 1, z0);
  const c = indicator(x0, z0 + 1), d = indicator(x0 + 1, z0 + 1);
  return lerp(lerp(a, b, fx), lerp(c, d, fx), fz);
}

// ---------------------------------------------------------------------------------------------
// Identifiants de modèles par rôle (les nouveaux s'ils existent, les anciens sinon)
// ---------------------------------------------------------------------------------------------

/**
 * Rôles du décor. `wanted` : les identifiants attendus du nouveau jeu de modèles ; `fallback` : ceux
 * d'aujourd'hui, avec leur propre plage d'échelle (les anciens arbres sont plus gros, on les réduit
 * pour obtenir les mêmes tailles apparentes).
 */
const ROLES = Object.freeze({
  treeL: { wanted: ['tree-round-l', 'tree-tall-l'], scale: [1.0, 1.2], fallback: ['tree-a', 'tree-b'], fallbackScale: [1.05, 1.3] },
  treeM: { wanted: ['tree-round-m', 'tree-tall-m'], scale: [0.9, 1.1], fallback: ['tree-a', 'tree-b', 'tree-c'], fallbackScale: [0.78, 0.98] },
  treeS: { wanted: ['tree-round-s', 'tree-tall-s'], scale: [0.85, 1.05], fallback: ['tree-c', 'tree-a'], fallbackScale: [0.5, 0.68] },
  pineL: { wanted: ['pine-l'], scale: [1.0, 1.2], fallback: ['pine-a'], fallbackScale: [1.0, 1.25] },
  pineM: { wanted: ['pine-m'], scale: [0.9, 1.1], fallback: ['pine-a', 'pine-b'], fallbackScale: [0.72, 0.95] },
  pineS: { wanted: ['pine-s'], scale: [0.85, 1.05], fallback: ['pine-b'], fallbackScale: [0.48, 0.7] },
  sapling: { wanted: ['sapling'], scale: [0.85, 1.05], fallback: ['tree-c'], fallbackScale: [0.3, 0.45] },
  shrub: { wanted: ['shrub-a', 'shrub-b'], scale: [0.8, 1.1], fallback: ['bush'], fallbackScale: [0.55, 0.85] },
  tuft: { wanted: ['grass-tuft-a', 'grass-tuft-b'], scale: [0.8, 1.15], fallback: ['flowers'], fallbackScale: [0.45, 0.7] },
  flower: { wanted: ['flowers'], scale: [0.7, 1.05], fallback: ['flowers'], fallbackScale: [0.7, 1.05] },
  reed: { wanted: ['reed-a', 'reed-b'], scale: [0.8, 1.1], fallback: ['bush'], fallbackScale: [0.42, 0.68] },
  rock: { wanted: ['rock-a', 'rock-b'], scale: [0.7, 1.3], fallback: ['rock-a', 'rock-b'], fallbackScale: [0.7, 1.3] },
  hedge: { wanted: ['shrub-a', 'shrub-b'], scale: [0.6, 0.72], fallback: ['bush'], fallbackScale: [0.42, 0.55] },
  bench: { wanted: ['bench'], scale: [0.9, 1.0], fallback: [], fallbackScale: [1, 1] },
  fence: { wanted: ['fence'], scale: [0.9, 1.0], fallback: [], fallbackScale: [1, 1] },
  veggie: { wanted: ['veggie-patch'], scale: [0.9, 1.0], fallback: ['flowers'], fallbackScale: [0.5, 0.65] },
  streetTree: { wanted: ['tree-round-m', 'tree-tall-m'], scale: [0.7, 0.85], fallback: ['tree-a', 'tree-c'], fallbackScale: [0.5, 0.64] },
});

/** Résout chaque rôle en { list, min, max } d'après les modèles réellement disponibles. */
export function resolveRoles(hasModel) {
  const has = typeof hasModel === 'function' ? hasModel : () => false;
  const out = {};
  for (const [role, def] of Object.entries(ROLES)) {
    const wanted = def.wanted.filter((id) => has(id));
    if (wanted.length) out[role] = { list: wanted, min: def.scale[0], max: def.scale[1] };
    else out[role] = { list: def.fallback, min: def.fallbackScale[0], max: def.fallbackScale[1] };
  }
  return out;
}

/** Une instance d'un rôle : identifiant tiré de la liste, échelle tirée de la plage. */
function fromRole(roles, role, uPick, uScale) {
  const r = roles[role];
  if (!r || !r.list.length) return null;
  const id = r.list[Math.min(r.list.length - 1, Math.floor(uPick * r.list.length))];
  return { id, scale: lerp(r.min, r.max, uScale) };
}

// ---------------------------------------------------------------------------------------------
// Groupes de rendu : solide (ombre, pas de vent), arbre (ombre + vent), couvre-sol (vent léger)
// ---------------------------------------------------------------------------------------------

export const GROUP_SOLID = 'solid';
export const GROUP_TREE = 'tree';
export const GROUP_COVER = 'cover';

/** Groupe de rendu d'un rôle de décor. */
const GROUP_OF_ROLE = Object.freeze({
  treeL: GROUP_TREE, treeM: GROUP_TREE, treeS: GROUP_TREE, sapling: GROUP_TREE,
  pineL: GROUP_TREE, pineM: GROUP_TREE, pineS: GROUP_TREE, streetTree: GROUP_TREE,
  shrub: GROUP_COVER, tuft: GROUP_COVER, flower: GROUP_COVER, reed: GROUP_COVER, hedge: GROUP_COVER,
  rock: GROUP_SOLID, bench: GROUP_SOLID, fence: GROUP_SOLID, veggie: GROUP_COVER,
});

/** Ajoute une instance d'un rôle dans `out` (ignorée si le rôle n'a aucun modèle). */
function pushRole(out, roles, role, { x, y, z, yaw, tile, uPick, uScale, scale = 1 }) {
  const m = fromRole(roles, role, uPick, uScale);
  if (!m) return null;
  const p = { id: m.id, x, y, z, yaw, scale: m.scale * scale, tile, group: GROUP_OF_ROLE[role] || GROUP_SOLID };
  out.push(p);
  return p;
}

// ---------------------------------------------------------------------------------------------
// Sol et obstacles
// ---------------------------------------------------------------------------------------------

/**
 * Altitude du sol en coordonnées CONTINUES. Utilise `heightAt` de ground.js dès qu'il existe
 * (terrain continu : collines arrondies sur plusieurs cases, berges en pente) ; sinon repli sur
 * `surfaceHeight` de la case qui contient le point.
 */
export function groundAt(world, px, pz) {
  const fn = Ground.heightAt;
  if (typeof fn === 'function') return fn.length >= 3 ? fn(world, px, pz) : fn(px, pz);
  const tx = Math.max(0, Math.min(world.cols - 1, Math.floor(px)));
  const ty = Math.max(0, Math.min(world.rows - 1, Math.floor(pz)));
  return surfaceHeight(world, tx, ty);
}

/** Valeur d'une arête du monde (0 si absente). */
function edgeAt(world, kind, x, y) {
  const e = world.edges;
  if (!e || !e[kind]) return 0;
  if (kind === 'h') return x >= 0 && x < world.cols && y >= 0 && y <= world.rows ? e.h[y * world.cols + x] : 0;
  return x >= 0 && x <= world.cols && y >= 0 && y < world.rows ? e.v[y * (world.cols + 1) + x] : 0;
}

/**
 * Distance libre : vrai si le point (px, pz) est assez loin des rues et chemins de sa case.
 * `street` et `path` sont les demi-largeurs à respecter.
 */
function awayFromRoads(world, tx, ty, px, pz, street = 0.3, path = 0.18) {
  const near = (value, dist) => value >= 2 ? dist < street : value === 1 ? dist < path : false;
  if (near(edgeAt(world, 'h', tx, ty), pz - ty)) return false;
  if (near(edgeAt(world, 'h', tx, ty + 1), ty + 1 - pz)) return false;
  if (near(edgeAt(world, 'v', tx, ty), px - tx)) return false;
  if (near(edgeAt(world, 'v', tx + 1, ty), tx + 1 - px)) return false;
  return true;
}

// ---------------------------------------------------------------------------------------------
// Semis continu d'un massif
// ---------------------------------------------------------------------------------------------

/** Réglages de semis par terrain : maille, densité de canopée et de sous-bois, terrains d'accueil. */
const BIOMES = Object.freeze({
  forest: {
    key: 0x10, canopyCell: 0.4, underCell: 0.4, canopy: 1, under: 0.7,
    host: ['forest', 'grass', 'meadow', 'hill'],
  },
  meadow: {
    key: 0x20, canopyCell: 0.9, underCell: 0.46, canopy: 0.1, under: 0.56,
    host: ['meadow', 'grass'],
  },
  wetland: {
    key: 0x30, canopyCell: 0.9, underCell: 0.4, canopy: 0.12, under: 0.78,
    host: ['wetland', 'grass', 'meadow'],
  },
  hill: {
    key: 0x40, canopyCell: 0.95, underCell: 0.44, canopy: 0.07, under: 0.95,
    host: ['hill', 'grass', 'meadow'],
  },
});

/**
 * Semis d'un massif : parcourt une maille régulière secouée (jitter) en coordonnées monde, garde
 * les points selon la couverture du massif, les clairières et le terrain d'accueil, et pousse les
 * instances dans `out`. Pur et déterministe.
 */
function scatterBiome(world, out, roles, terrainId, bounds) {
  const cfg = BIOMES[terrainId];
  if (!cfg) return;
  const seed = world.seed | 0;
  const { cols, rows, tiles } = world;
  const hostSet = new Set(cfg.host);

  const indicator = (x, y) => (x >= 0 && y >= 0 && x < cols && y < rows && tiles[y * cols + x]
    && tiles[y * cols + x].terrain === terrainId && !tiles[y * cols + x].building ? 1 : 0);

  /** Case d'accueil du point, ou null (hors grille, bâtie, eau profonde, culture…). */
  const hostAt = (px, pz) => {
    const tx = Math.floor(px), ty = Math.floor(pz);
    if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) return null;
    const t = tiles[ty * cols + tx];
    if (!t || t.building) return null;
    if (!hostSet.has(t.terrain)) return null;
    if (isWaterTerrain(t.terrain) && t.terrain !== terrainId) return null;
    if (!awayFromRoads(world, tx, ty, px, pz)) return null;
    return { tx, ty, index: ty * cols + tx };
  };

  const x0 = Math.max(0, bounds.minX - 1), x1 = Math.min(cols, bounds.maxX + 2);
  const z0 = Math.max(0, bounds.minY - 1), z1 = Math.min(rows, bounds.maxY + 2);

  // --- Canopée (arbres) --------------------------------------------------------------------
  if (cfg.canopy > 0) {
    const s = cfg.canopyCell;
    const i0 = Math.floor(x0 / s), i1 = Math.ceil(x1 / s);
    const j0 = Math.floor(z0 / s), j1 = Math.ceil(z1 / s);
    for (let j = j0; j < j1; j++) {
      for (let i = i0; i < i1; i++) {
        const k = cfg.key;
        const px = (i + 0.15 + 0.7 * hashUnit(seed, i, j, k)) * s;
        const pz = (j + 0.15 + 0.7 * hashUnit(seed, i, j, k + 1)) * s;
        const f = coverageAt(indicator, px, pz);
        if (f <= 0.02) continue;
        // Clairières : un bruit basse fréquence creuse des trouées de 2 à 3 cases.
        const open = smoothstep(0.26, 0.56, valueNoise(seed, px * 0.42, pz * 0.42, k + 2));
        const density = Math.pow(f, 1.2) * cfg.canopy * (0.3 + 0.7 * open);
        if (hashUnit(seed, i, j, k + 3) >= density) continue;
        const host = hostAt(px, pz);
        if (!host) continue;
        // Essence : feuillus / résineux par plaques, tailles mêlées, plus jeunes vers la lisière.
        const conifer = valueNoise(seed, px * 0.3, pz * 0.3, k + 4) > 0.56;
        const u = hashUnit(seed, i, j, k + 5);
        const big = 0.16 + 0.34 * f;          // cœur du massif : davantage de grands arbres
        const mid = big + 0.42;
        const role = u < big ? (conifer ? 'pineL' : 'treeL')
          : u < mid ? (conifer ? 'pineM' : 'treeM')
            : u < mid + 0.3 ? (conifer ? 'pineS' : 'treeS') : 'sapling';
        pushRole(out, roles, role, {
          x: px, y: groundAt(world, px, pz), z: pz, yaw: hashUnit(seed, i, j, k + 6) * TAU,
          tile: host.index, uPick: hashUnit(seed, i, j, k + 7), uScale: hashUnit(seed, i, j, k + 8),
        });
      }
    }
  }

  // --- Sous-bois et lisière (arbustes, touffes, fleurs, roseaux, rochers) ---------------------
  if (cfg.under > 0) {
    const s = cfg.underCell;
    const i0 = Math.floor(x0 / s), i1 = Math.ceil(x1 / s);
    const j0 = Math.floor(z0 / s), j1 = Math.ceil(z1 / s);
    const k = cfg.key + 0x8;
    for (let j = j0; j < j1; j++) {
      for (let i = i0; i < i1; i++) {
        const px = (i + 0.12 + 0.76 * hashUnit(seed, i, j, k)) * s;
        const pz = (j + 0.12 + 0.76 * hashUnit(seed, i, j, k + 1)) * s;
        const f = coverageAt(indicator, px, pz);
        if (f <= 0.02) continue;
        const open = smoothstep(0.26, 0.56, valueNoise(seed, px * 0.42, pz * 0.42, cfg.key + 2));
        // Bordure : la couverture partielle (lisière) et les clairières portent le couvre-sol.
        const edge = terrainId === 'forest' ? smoothstep(1, 0.3, f) : 1;
        const density = f * cfg.under * (0.3 + 0.7 * Math.max(edge, 1 - open));
        if (hashUnit(seed, i, j, k + 3) >= density) continue;
        const host = hostAt(px, pz);
        if (!host) continue;
        const u = hashUnit(seed, i, j, k + 4);
        let role;
        if (terrainId === 'forest') role = u < 0.5 ? 'shrub' : u < 0.86 ? 'tuft' : 'sapling';
        else if (terrainId === 'meadow') role = u < 0.32 ? 'flower' : u < 0.9 ? 'tuft' : 'shrub';
        else if (terrainId === 'wetland') role = u < 0.75 ? 'reed' : 'tuft';
        else role = u < 0.74 ? 'rock' : u < 0.92 ? 'tuft' : 'shrub';
        pushRole(out, roles, role, {
          x: px, y: groundAt(world, px, pz), z: pz, yaw: hashUnit(seed, i, j, k + 5) * TAU,
          tile: host.index, uPick: hashUnit(seed, i, j, k + 6), uScale: hashUnit(seed, i, j, k + 7),
        });
      }
    }
  }
}

/** Boîte englobante (en cases) des cases d'un terrain, ou null si le terrain est absent. */
function terrainBounds(world, terrainId) {
  const { cols, rows, tiles } = world;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const t = tiles[y * cols + x];
      if (!t || t.terrain !== terrainId || t.building) continue;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX, maxY };
}

// ---------------------------------------------------------------------------------------------
// Abords d'un îlot bâti : parcelle plantée, haie, potager, arbre de rue
// ---------------------------------------------------------------------------------------------

/** Côté vers lequel regarde la façade, par quart de tour : yaw 0 → sud, 90 → est, 180 → nord, 270 → ouest. */
const FACADE_SIDE = Object.freeze([2, 1, 0, 3]);

/** Valeur de l'arête d'un côté de la case (N, E, S, O). */
function sideEdge(world, tx, ty, side) {
  if (side === 0) return edgeAt(world, 'h', tx, ty);
  if (side === 1) return edgeAt(world, 'v', tx + 1, ty);
  if (side === 2) return edgeAt(world, 'h', tx, ty + 1);
  return edgeAt(world, 'v', tx, ty);
}

/**
 * Côté par lequel on entre dans un îlot bâti (0 N, 1 E, 2 S, 3 O) : la façade si elle donne sur une
 * rue, sinon la rue la plus proche en tournant, sinon un chemin, sinon null. Pur ; partagé avec
 * `roads.js` (allée d'entrée) pour que l'allée et les plantations s'accordent.
 */
export function entrySide(world, tx, ty) {
  const tile = world.tiles[ty * world.cols + tx];
  if (!tile || !tile.building) return null;
  const yawDeg = ((Math.round((Number(tile.building.yaw) || 0) / 90) % 4) + 4) % 4;
  const facade = FACADE_SIDE[yawDeg];
  const order = [facade, (facade + 1) % 4, (facade + 3) % 4, (facade + 2) % 4];
  const street = order.find((s) => sideEdge(world, tx, ty, s) >= 2);
  if (street !== undefined) return street;
  const path = order.find((s) => sideEdge(world, tx, ty, s) >= 1);
  return path === undefined ? null : path;
}

/**
 * Huit ancrages dans la bande de parcelle : quatre milieux de côté (indices pairs), quatre coins
 * (indices impairs), donnés en (dx, dz) relatifs au centre de la case et à multiplier par le rayon.
 */
const LOT_ANCHORS = Object.freeze([
  [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1],
]);

/**
 * Décor des abords d'un îlot bâti : deux à quatre petits éléments dans la bande de parcelle
 * (entre le trottoir et le bâtiment), variés par famille de tuile et par case, plus un arbre de rue
 * à un coin sur deux ou trois le long des rues. Pur.
 */
function collectLotDecor(world, out, roles, tx, ty, tile, def) {
  const seed = world.seed | 0;
  const i = ty * world.cols + tx;
  const cx = tx + 0.5, cz = ty + 0.5;
  const h = (k) => hashUnit(seed, tx, ty, 0x6a0 + k);
  const family = def ? def.family : 'habitat';

  const entry = entrySide(world, tx, ty);
  const entryAnchor = entry === null ? -1 : entry * 2;   // le milieu de côté de l'entrée

  // Haies, buissons, potagers : sur deux à quatre ancrages tirés au hasard, jamais devant l'entrée.
  const roleAt = (k) => {
    const u = h(10 + k);
    if (family === 'habitat') return u < 0.38 ? 'hedge' : u < 0.68 ? 'shrub' : u < 0.86 ? 'veggie' : 'flower';
    if (family === 'infrastructure') return u < 0.6 ? 'shrub' : 'tuft';
    return u < 0.42 ? 'hedge' : u < 0.78 ? 'flower' : 'shrub';
  };
  for (let a = 0; a < LOT_ANCHORS.length; a++) {
    if (a === entryAnchor) continue;
    if (h(20 + a) > 0.44) continue;                   // on ne garnit pas tous les ancrages
    const [ux, uz] = LOT_ANCHORS[a];
    const r = LOT_DECOR_RADIUS;
    const px = cx + ux * r + (h(30 + a) - 0.5) * 0.05;
    const pz = cz + uz * r + (h(40 + a) - 0.5) * 0.05;
    pushRole(out, roles, roleAt(a), {
      x: px, y: groundAt(world, px, pz), z: pz, yaw: h(50 + a) * TAU, tile: i,
      uPick: h(60 + a), uScale: h(70 + a),
    });
  }

  // Arbre de rue : à un coin sur deux ou trois, dans l'angle de la parcelle qui borde deux rues.
  for (let c = 0; c < 4; c++) {
    const sx = c & 1 ? 1 : -1, sz = c & 2 ? 1 : -1;
    const cornerX = tx + (sx > 0 ? 1 : 0), cornerY = ty + (sz > 0 ? 1 : 0);
    // Un coin du treillis sur trois porte un arbre de rue (hachage du coin : aucun alignement).
    if (hashUnit(seed, cornerX, cornerY, 0x7e4) >= 0.34) continue;
    const sideA = sx > 0 ? 1 : 3, sideB = sz > 0 ? 2 : 0;
    if (sideEdge(world, tx, ty, sideA) < 2 || sideEdge(world, tx, ty, sideB) < 2) continue;
    // Une seule des quatre cases du coin le porte : le quadrant tiré par le hachage du coin.
    const quadrant = (cornerX === tx ? 1 : 0) | (cornerY === ty ? 2 : 0);
    if (Math.floor(hashUnit(seed, cornerX, cornerY, 0x7e5) * 4) !== quadrant) continue;
    const px = cx + sx * (LOT_HALF - 0.01), pz = cz + sz * (LOT_HALF - 0.01);
    pushRole(out, roles, 'streetTree', {
      x: px, y: groundAt(world, px, pz), z: pz, yaw: hashUnit(seed, cornerX, cornerY, 0x7e9) * TAU,
      tile: i, uPick: hashUnit(seed, cornerX, cornerY, 0x7ea), uScale: hashUnit(seed, cornerX, cornerY, 0x7eb),
    });
    break; // un seul arbre de rue par îlot
  }
}

// ---------------------------------------------------------------------------------------------
// Liste des instances
// ---------------------------------------------------------------------------------------------

/** Choisit un modèle d'une liste d'après une valeur de hachage. */
function pickModel(list, u) {
  return list[Math.min(list.length - 1, Math.floor(u * list.length))];
}

/**
 * Liste pure des instances à poser : [{ id, x, y, z, yaw, scale, tile, group }] (yaw en radians,
 * position du pied du modèle en unités monde, `tile` = index de la case qui porte l'instance,
 * `group` = 'solid' | 'tree' | 'cover' pour le rendu).
 * options : { modelFor(building) → identifiant, hasModel(id) → bool (modèles réellement chargés) }.
 */
export function collectPlacements(world, options = {}) {
  const modelFor = options.modelFor || modelOfBuilding;
  const roles = resolveRoles(options.hasModel);
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
          // Haie : une file de buissons serrés, dans l'axe donné par l'orientation, légèrement ondulée.
          const alongZ = Math.round((Number(b.yaw) || 0) / 90) % 2 === 1;
          for (let k = -2; k <= 2; k++) {
            const t = k * 0.19;
            const jitter = (h(20 + k) - 0.5) * 0.05;
            const px = cx + (alongZ ? jitter : t), pz = cz + (alongZ ? t : jitter);
            pushRole(out, roles, 'hedge', {
              x: px, y: groundAt(world, px, pz), z: pz, yaw: h(25 + k) * TAU, tile: i,
              uPick: h(30 + k), uScale: h(35 + k),
            });
          }
        } else if (def && def.family === 'nature' && b.type === 'wetland-restored') {
          // Zone humide restaurée : roseaux et touffes, semés dans la case.
          for (let k = 0; k < 7; k++) {
            const px = cx + (h(40 + k) - 0.5) * 0.78, pz = cz + (h(50 + k) - 0.5) * 0.78;
            pushRole(out, roles, k % 3 === 2 ? 'tuft' : 'reed', {
              x: px, y: groundAt(world, px, pz), z: pz, yaw: h(60 + k) * TAU, tile: i,
              uPick: h(70 + k), uScale: h(80 + k),
            });
          }
        } else if (def && def.family === 'nature' && (family === 'tree' || family === 'pine')) {
          if (b.type === 'orchard') {
            // Verger : quatre rangs réguliers (c'est une plantation : l'alignement est voulu),
            // avec de légers écarts pour éviter la copie exacte d'une case à l'autre.
            let k = 0;
            for (const dx of [-0.21, 0.21]) for (const dz of [-0.21, 0.21]) {
              const px = cx + dx + (h(90 + k) - 0.5) * 0.05, pz = cz + dz + (h(95 + k) - 0.5) * 0.05;
              pushRole(out, roles, 'treeS', {
                x: px, y: groundAt(world, px, pz), z: pz, yaw: h(100 + k) * TAU, tile: i,
                uPick: h(105 + k), uScale: h(110 + k), scale: 0.95,
              });
              k++;
            }
          } else {
            // Forêt plantée : un bosquet jeune, semé dans la case (les arbres d'un massif natif
            // voisin viendront déborder dessus par le semis continu).
            const count = 4 + (h(1) < 0.5 ? 0 : 1);
            for (let k = 0; k < count; k++) {
              const px = cx + (h(115 + k) - 0.5) * 0.8, pz = cz + (h(120 + k) - 0.5) * 0.8;
              const u = h(125 + k);
              pushRole(out, roles, u < 0.3 ? 'treeM' : u < 0.75 ? 'treeS' : 'sapling', {
                x: px, y: groundAt(world, px, pz), z: pz, yaw: h(130 + k) * TAU, tile: i,
                uPick: h(135 + k), uScale: h(140 + k),
              });
            }
          }
        } else {
          out.push({ id, x: cx, y: ground, z: cz, yaw, scale: BUILDING_SCALE, tile: i, group: GROUP_SOLID });
          if (def && def.family !== 'nature') collectLotDecor(world, out, roles, tx, ty, tile, def);
        }
        continue;
      }

      // Nature native semée par massif plus bas ; ici, seulement ce qui tient à la case.
      const def = TERRAINS[tile.terrain];
      if (!def || isWaterTerrain(tile.terrain)) continue;
      if (tile.terrain === 'field') {
        const list2 = def.models;
        if (!list2 || !list2.length) continue;
        const variant = Number.isInteger(tile.variant) ? tile.variant : Math.floor(h(10) * list2.length);
        const q = Math.floor(h(1) * 4);
        out.push({
          id: list2[((variant % list2.length) + list2.length) % list2.length],
          x: cx, y: ground, z: cz, yaw: q * QUARTER, scale: 1, tile: i, group: GROUP_COVER,
        });
      } else if (!BIOMES[tile.terrain] && def.models && def.models.length) {
        // Terrain inconnu du semis : une instance au centre, comme avant.
        out.push({ id: pickModel(def.models, h(10)), x: cx, y: ground, z: cz, yaw: Math.floor(h(1) * 4) * QUARTER, scale: 1, tile: i, group: GROUP_COVER });
      }
    }
  }

  // Semis continu des massifs natifs (forêt, prairie, zone humide, colline).
  for (const terrainId of Object.keys(BIOMES)) {
    const bounds = terrainBounds(world, terrainId);
    if (bounds) scatterBiome(world, out, roles, terrainId, bounds);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Vent : matériau dérivé qui incline les feuillages de ± 2°
// ---------------------------------------------------------------------------------------------

/** Amplitude du balancement par groupe (déplacement horizontal au sommet, en unités monde). */
export const WIND_AMPLITUDE = Object.freeze({ [GROUP_TREE]: 0.032, [GROUP_COVER]: 0.018 });
/** Cadence de l'ondulation (rad/s) : lente, à peine perceptible. */
export const WIND_SPEED = 0.85;

const WIND_PARS = /* glsl */`
uniform float uWindTime;
uniform float uWindAmp;
`;

const WIND_BODY = /* glsl */`
{
  #ifdef USE_BATCHING
    vec3 windOrigin = batchingMatrix[3].xyz;
  #elif defined( USE_INSTANCING )
    vec3 windOrigin = instanceMatrix[3].xyz;
  #else
    vec3 windOrigin = vec3( 0.0 );
  #endif
  float windPhase = windOrigin.x * 1.9 + windOrigin.z * 2.7;
  float windGrip = clamp( transformed.y, 0.0, 1.6 );
  float windBend = uWindAmp * windGrip * windGrip
    * ( 0.75 * sin( uWindTime + windPhase ) + 0.25 * sin( uWindTime * 1.7 + windPhase * 2.3 ) );
  transformed.x += windBend;
  transformed.z += windBend * 0.45;
}
`;

/** Clone d'un matériau qui fait onduler le haut des feuillages (coût GPU négligeable). */
function createWindMaterial(base, timeUniform, amplitude) {
  const m = base.clone();
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = timeUniform;
    shader.uniforms.uWindAmp = { value: amplitude };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${WIND_PARS}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${WIND_BODY}`);
  };
  m.customProgramCacheKey = () => `tiletown-wind-${amplitude}`;
  return m;
}

// ---------------------------------------------------------------------------------------------
// Rendu
// ---------------------------------------------------------------------------------------------

/**
 * Crée le rendu des îlots. `models` : résultat de `loadModels`.
 * options : { strategy: 'batched' | 'instanced', modelFor, shadows, wind }.
 * API : { group, setWorld(world), update(dt), stats, dispose() }.
 */
export function createBuildings(models, options = {}) {
  const strategy = options.strategy === 'instanced' ? 'instanced' : 'batched';
  const shadows = options.shadows !== false;
  const windOn = options.wind !== false;
  const group = new THREE.Group();
  group.name = 'buildings';
  const stats = { strategy, placements: 0, drawables: 0, uniqueModels: 0, triangles: 0, fallbacks: 0, trees: 0, cover: 0 };
  const timeUniform = { value: 0 };
  /** Matériaux dérivés (vent) : clé « matériau|groupe ». */
  const windMaterials = new Map();
  const sharedMaterials = new Set([models.materials.vertex, ...models.materials.textured.values()]);
  const matrix = new THREE.Matrix4();

  function materialFor(base, groupName) {
    if (!windOn || groupName === GROUP_SOLID) return base;
    const key = `${base.uuid}|${groupName}`;
    let m = windMaterials.get(key);
    if (!m) {
      m = createWindMaterial(base, timeUniform, WIND_AMPLITUDE[groupName] || 0);
      windMaterials.set(key, m);
      sharedMaterials.add(m);
    }
    return m;
  }

  function clear() {
    for (const child of [...group.children]) {
      group.remove(child);
      disposeObject(child, sharedMaterials);
    }
    for (const k of ['placements', 'drawables', 'uniqueModels', 'triangles', 'fallbacks', 'trees', 'cover']) stats[k] = 0;
  }

  /** Regroupe les instances par (matériau, groupe de rendu) puis par modèle. */
  function groupPlacements(placements) {
    const buckets = new Map();   // clé → { material, group, perModel: Map(id → { geometry, placements }) }
    const fallbackIds = new Set();
    for (const p of placements) {
      const model = models.resolve(p.id);
      if (model.source === 'fallback') fallbackIds.add(p.id);
      const g = p.group || GROUP_SOLID;
      const material = materialFor(model.material, g);
      const key = `${material.uuid}|${g}`;
      let bucket = buckets.get(key);
      if (!bucket) { bucket = { material, group: g, perModel: new Map() }; buckets.set(key, bucket); }
      let per = bucket.perModel.get(p.id);
      if (!per) { per = { geometry: model.geometry, placements: [] }; bucket.perModel.set(p.id, per); }
      per.placements.push(p);
      stats.triangles += model.geometry.index.count / 3;
      if (g === GROUP_TREE) stats.trees++; else if (g === GROUP_COVER) stats.cover++;
    }
    stats.fallbacks = fallbackIds.size;
    return buckets;
  }

  /** Le couvre-sol ne projette pas d'ombre : il ne se verrait pas et coûterait une passe de plus. */
  const castsShadow = (g) => shadows && g !== GROUP_COVER;

  function buildBatched(buckets) {
    for (const bucket of buckets.values()) {
      let instances = 0, vertices = 0, indices = 0;
      for (const per of bucket.perModel.values()) {
        instances += per.placements.length;
        vertices += per.geometry.attributes.position.count;
        indices += per.geometry.index.count;
      }
      const mesh = new THREE.BatchedMesh(instances, vertices, indices, bucket.material);
      mesh.name = `batch-${bucket.group}`;
      mesh.castShadow = castsShadow(bucket.group);
      mesh.receiveShadow = true;
      mesh.perObjectFrustumCulled = true;
      mesh.sortObjects = false;
      mesh.frustumCulled = false;
      for (const per of bucket.perModel.values()) {
        const gid = mesh.addGeometry(per.geometry);
        for (const p of per.placements) {
          const iid = mesh.addInstance(gid);
          mesh.setMatrixAt(iid, composeMatrix(matrix, p.x, p.y, p.z, p.yaw, p.scale));
        }
      }
      group.add(mesh);
      stats.drawables++;
    }
  }

  function buildInstanced(buckets) {
    for (const bucket of buckets.values()) {
      for (const [id, per] of bucket.perModel) {
        const mesh = new THREE.InstancedMesh(per.geometry, bucket.material, per.placements.length);
        mesh.name = id;
        mesh.geometry.userData.shared = true;
        // Repli sans multi-draw : chaque modèle coûte un appel (+ un dans la passe d'ombre) ; les petits
        // décors (fleurs, cultures, rochers, buissons) ne projettent pas d'ombre pour rester ≤ 60 appels.
        mesh.castShadow = castsShadow(bucket.group) && per.geometry.boundingBox.max.y >= 0.35;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        per.placements.forEach((p, k) => {
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
    const placements = collectPlacements(world, { modelFor: options.modelFor, hasModel: (id) => models.has(id) });
    stats.placements = placements.length;
    if (!placements.length) return;
    const buckets = groupPlacements(placements);
    let unique = 0;
    for (const bucket of buckets.values()) unique += bucket.perModel.size;
    stats.uniqueModels = unique;
    if (strategy === 'batched') buildBatched(buckets); else buildInstanced(buckets);
  }

  /** Avance l'ondulation du vent (s). Le rendu peut l'appeler ; sinon une horloge interne s'en charge. */
  let driven = false;
  function update(dt) {
    driven = true;
    timeUniform.value += (dt || 0) * WIND_SPEED;
  }

  // Horloge interne : `renderer.js` n'a pas de rappel pour cette couche ; on anime donc le vent ici,
  // à coût nul (une addition par image), et on s'efface dès que l'appelant appelle `update`.
  let raf = 0;
  let lastT = 0;
  if (windOn && typeof requestAnimationFrame === 'function') {
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      if (driven) return;
      if (lastT) timeUniform.value += Math.min(0.1, (t - lastT) / 1000) * WIND_SPEED;
      lastT = t;
    };
    raf = requestAnimationFrame(tick);
  }

  function dispose() {
    clear();
    if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
    raf = 0;
    for (const m of windMaterials.values()) m.dispose();
    windMaterials.clear();
  }

  return { group, stats, setWorld, update, dispose, get windTime() { return timeUniform.value; } };
}
