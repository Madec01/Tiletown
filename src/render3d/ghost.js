// Fantôme de pose et surbrillance (docs/ARCHITECTURE.md §9.2) : pendant qu'une tuile est « en main »,
// le joueur voit sur la case visée le modèle du catalogue en translucide (vert = pose possible, rouge =
// interdite, jaune = avertissement), un cadre au ras du sol sous la case, et le tracé de raccordement en
// pointillés le long des arêtes qu'il faudra équiper (blanc = rue, jaune = pont). `setHighlight` marque
// d'autres cases (sélection, fiche) d'un cadre jaune.
//
// Tout est UN PETIT NOMBRE D'OBJETS RÉUTILISÉS, créés une fois : un `Mesh` (dont on change la géométrie,
// la couleur et la matrice), une `InstancedMesh` de cadres (instance 0 = la case du fantôme, puis les
// surbrillances) et une `InstancedMesh` de pointillés. Fantôme affiché : 3 appels de dessin au plus, sans
// ombre portée. Aucun texte, aucun DOM.
//
//   const ghost = createGhost(models, { palette });
//   ghost.setWorld(world);                       // hauteurs du sol, arêtes déjà équipées
//   ghost.set({ x, y, tileId, ok, path, yaw });  // ou set(null) pour tout cacher
//   ghost.setHighlight([{ x, y }, …] | null);
//   ghost.update(dt);                            // respiration (échelle ± 2 % à 1 Hz)
//   ghost.stats() → { visible, dashes, highlights, calls } ; scene.add(ghost.group) ; ghost.dispose()
//
// `yaw` est en DEGRÉS, multiple de 90, comme `building.yaw` (0 = façade au sud). `path` est la liste des
// arêtes de `connectTile` : { kind: 'h' | 'v', x, y, value } ; h(x, y) court le long de X à z = y, v(x, y)
// le long de Z à x = x ; les arêtes qui valent déjà ≥ 2 dans `world.edges` ne sont pas pointillées.
// Les calculs purs (`ghostTint`, `ghostTransform`, `dashPositions`, `ghostModelId`) sont testés sous Node.
//
// Repère : la case (x, y) couvre [x, x+1] × [y, y+1] en (X, Z) ; le dessus de la terre est à y = 0.

import * as THREE from 'three';
import { frontageOffset } from '../core/blocks.js';
import { PALETTE } from '../data/palette.js';
import { TILE_BY_ID, modelOfBuilding } from '../data/tiles.js';
import { BUILDING_SCALE } from './buildings.js';
import { surfaceHeight, isWaterTerrain } from './ground.js';
import { ROAD_THICKNESS, BRIDGE_DECK_TOP, EDGE_STREET, EDGE_BRIDGE } from './roads.js';
import { mergeParts } from './models.js';
import { composeMatrix } from './util.js';

/** Opacité du modèle translucide. */
export const GHOST_OPACITY = 0.55;
/** Part de la teinte réémise (les faces à l'ombre restent colorées). */
export const GHOST_EMISSIVE = 0.25;
/**
 * Dosage de la teinte sur le modèle : 0 = couleurs du modèle multipliées par la teinte (toit, murs reconnaissables
 * mais rouge brunâtre), 1 = teinte plate (franche mais le vert se fond dans l'herbe) ; 0,6 garde les deux.
 */
export const GHOST_TINT_MIX = 0.6;
/** Respiration : amplitude relative de l'échelle et fréquence (Hz). */
export const BREATH_AMPLITUDE = 0.02;
export const BREATH_HZ = 1;
/** Pointillés : nombre par arête, taille d'un cube (u) et hauteur de son centre au-dessus de la future chaussée. */
export const DASHES_PER_EDGE = 4;
export const DASH_SIZE = Object.freeze([0.08, 0.02, 0.08]);
export const DASH_LIFT = 0.03;
/** Cadre sous la case : largeur de la barre, épaisseur, hauteur du centre au-dessus du sol (par-dessus l'asphalte à 0,02). */
export const FRAME_WIDTH = 0.06;
export const FRAME_THICKNESS = 0.02;
export const FRAME_LIFT = 0.035;
/** Plafonds des instances (un seul appel de dessin chacun). */
export const MAX_HIGHLIGHTS = 64;
export const MAX_DASHES = 512;

// ---------------------------------------------------------------------------------------------
// Parties pures
// ---------------------------------------------------------------------------------------------

/** Mélange deux couleurs « #rrggbb » : t = 0 → a, t = 1 → b. */
export function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (shift) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return '#' + [ch(16), ch(8), ch(0)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/** Teintes du fantôme : vert (herbe claire éclaircie), rouge (toits), jaune (soleil). */
export const GHOST_COLORS = Object.freeze({
  ok: mixHex(PALETTE.grassLight, '#ffffff', 0.3),
  ko: PALETTE.roofRed,
  warn: PALETTE.sun,
});

/** Couleur « #rrggbb » du fantôme d'après `ok` : true → vert, 'warn' → jaune, tout le reste → rouge. */
export function ghostTint(ok) {
  if (ok === true || ok === 'ok') return GHOST_COLORS.ok;
  if (ok === 'warn') return GHOST_COLORS.warn;
  return GHOST_COLORS.ko;
}

/**
 * Pose du fantôme sur la case (x, y) : { position: [X, Y, Z], yaw (radians), scale }.
 * Centre de la case, pied à `surface`, orientation `yawDeg` en degrés (comme `building.yaw`), échelle des îlots.
 */
export function ghostTransform(x, y, yawDeg = 0, surface = 0) {
  return {
    position: [x + 0.5, surface, y + 0.5],
    yaw: (Number(yawDeg) || 0) * Math.PI / 180,
    scale: BUILDING_SCALE,
  };
}

/**
 * Identifiant du modèle à afficher pour une tuile du catalogue : son modèle de niveau `level` (1 par défaut),
 * variante `variant` ; un identifiant inconnu du catalogue est pris pour un identifiant de modèle (boîte de
 * remplacement s'il manque au manifeste) ; null sans tuile.
 */
export function ghostModelId(tileId, level = 1, variant = 0) {
  if (!tileId) return null;
  if (!TILE_BY_ID[tileId]) return String(tileId);
  return modelOfBuilding({ type: tileId, level: level || 1, variant: variant || 0 }) || String(tileId);
}

/** Valeur (0 à 3) d'une arête { kind, x, y } dans `world.edges` ; 0 hors treillis ou sans monde. */
export function edgeValueAt(world, e) {
  if (!world || !world.edges || !e) return 0;
  const { cols, rows } = world;
  if (e.kind === 'h') {
    if (e.x < 0 || e.x >= cols || e.y < 0 || e.y > rows) return 0;
    return world.edges.h[e.y * cols + e.x] || 0;
  }
  if (e.kind === 'v') {
    if (e.x < 0 || e.x > cols || e.y < 0 || e.y >= rows) return 0;
    return world.edges.v[e.y * (cols + 1) + e.x] || 0;
  }
  return 0;
}

/** Altitude du sol de la case (x, y) ; 0 sans monde ou hors grille. */
export function tileSurface(world, x, y) {
  if (!world || !world.tiles || x < 0 || y < 0 || x >= world.cols || y >= world.rows) return 0;
  return surfaceHeight(world, x, y);
}

/** Altitude de la terre le long d'une arête : la plus haute de ses deux cases (colline), l'eau comptant pour 0. */
export function edgeGround(world, e) {
  if (!world || !world.tiles) return 0;
  const cells = e.kind === 'h' ? [[e.x, e.y - 1], [e.x, e.y]] : [[e.x - 1, e.y], [e.x, e.y]];
  let h = 0;
  for (const [cx, cy] of cells) {
    if (cx < 0 || cy < 0 || cx >= world.cols || cy >= world.rows) continue;
    const t = world.tiles[cy * world.cols + cx];
    if (!t || isWaterTerrain(t.terrain)) continue;
    h = Math.max(h, surfaceHeight(world, cx, cy));
  }
  return h;
}

/**
 * Pointillés du tracé de raccordement : [{ x, y, z, yaw, bridge }] (centre de chaque cube, yaw 0 le long
 * de X pour une arête h, π/2 le long de Z pour une arête v, `bridge` si l'arête vaut 3). `perEdge` cubes
 * par arête, répartis régulièrement ; les arêtes déjà équipées (≥ 2 dans `world.edges`) sont sautées, un
 * chemin (1) est pointillé (il deviendra une rue). Hauteur : future chaussée (+ DASH_LIFT), tablier pour un pont.
 */
export function dashPositions(path, world, options = {}) {
  const perEdge = options.perEdge || DASHES_PER_EDGE;
  const out = [];
  if (!Array.isArray(path)) return out;
  for (const e of path) {
    if (!e || (e.kind !== 'h' && e.kind !== 'v') || !Number.isFinite(e.x) || !Number.isFinite(e.y)) continue;
    if (edgeValueAt(world, e) >= EDGE_STREET) continue;
    const bridge = e.value === EDGE_BRIDGE;
    const y = bridge ? BRIDGE_DECK_TOP + DASH_LIFT : edgeGround(world, e) + ROAD_THICKNESS + DASH_LIFT;
    for (let k = 0; k < perEdge; k++) {
      const t = (k + 0.5) / perEdge;
      if (e.kind === 'h') out.push({ x: e.x + t, y, z: e.y, yaw: 0, bridge });
      else out.push({ x: e.x, y, z: e.y + t, yaw: Math.PI / 2, bridge });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Géométries
// ---------------------------------------------------------------------------------------------

/** Cadre carré de 4 barres fines (1 × 1 u hors tout, centré, épaisseur FRAME_THICKNESS autour de y = 0). */
export function buildFrameGeometry(width = FRAME_WIDTH, thickness = FRAME_THICKNESS) {
  const half = 0.5;
  const bar = (sx, sz, x, z) => {
    const g = new THREE.BoxGeometry(sx, thickness, sz);
    g.translate(x, 0, z);
    return g;
  };
  return mergeParts([
    bar(1, width, 0, -half + width / 2),            // nord
    bar(1, width, 0, half - width / 2),             // sud
    bar(width, 1 - 2 * width, -half + width / 2, 0), // ouest
    bar(width, 1 - 2 * width, half - width / 2, 0),  // est
  ]);
}

// ---------------------------------------------------------------------------------------------
// Objets de rendu
// ---------------------------------------------------------------------------------------------

/**
 * Crée le fantôme. `models` : résultat de `loadModels` (ou tout objet avec `resolve(id)` → { geometry }).
 * options : { palette = PALETTE }.
 */
export function createGhost(models, options = {}) {
  const palette = { ...PALETTE, ...(options.palette || {}) };
  const group = new THREE.Group();
  group.name = 'ghost';

  let world = null;
  let current = null;       // dernière demande `set` (ou null)
  let highlights = [];      // cases marquées [{ x, y }]
  let clock = 0;
  let baseScale = BUILDING_SCALE;
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  const markingColor = new THREE.Color(palette.marking);
  const sunColor = new THREE.Color(palette.sun);

  // --- Modèle translucide ----------------------------------------------------------------------
  // Lambert à couleurs de sommets dont le fragment `color_fragment` est remplacé : la couleur diffuse devient
  // mix(teinte × couleur du modèle, teinte, uTintMix), pour garder la forme (toit, murs) sous une teinte franche.
  const placeholder = new THREE.BufferGeometry();
  const tintMix = { value: GHOST_TINT_MIX };
  const ghostMaterial = new THREE.MeshLambertMaterial({
    color: GHOST_COLORS.ok,
    emissive: new THREE.Color(GHOST_COLORS.ok).multiplyScalar(GHOST_EMISSIVE),
    vertexColors: true,
    transparent: true,
    opacity: GHOST_OPACITY,
    depthWrite: false,
  });
  ghostMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTintMix = tintMix;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uTintMix;')
      .replace('#include <color_fragment>', [
        // r186 : `vColor` est un vec4 quelle que soit la variante (USE_COLOR ou USE_COLOR_ALPHA).
        '#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )',
        '\tdiffuseColor.rgb = mix( diffuseColor.rgb * vColor.rgb, diffuseColor.rgb, uTintMix );',
        '#endif',
      ].join('\n'));
  };
  ghostMaterial.customProgramCacheKey = () => 'tiletown-ghost-tint';
  const mesh = new THREE.Mesh(placeholder, ghostMaterial);
  mesh.name = 'ghost-model';
  mesh.visible = false;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  mesh.renderOrder = 10; // après le reste des transparents (eau)

  // --- Cadres : instance 0 = case du fantôme, puis les surbrillances ------------------------------
  const flatMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // couleur par instance, sans éclairage
  const frameGeometry = buildFrameGeometry();
  const frames = new THREE.InstancedMesh(frameGeometry, flatMaterial, 1 + MAX_HIGHLIGHTS);
  frames.name = 'ghost-frames';
  frames.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array((1 + MAX_HIGHLIGHTS) * 3), 3);
  frames.count = 0;
  frames.visible = false;
  frames.castShadow = false;
  frames.receiveShadow = false;
  frames.frustumCulled = false;
  frames.renderOrder = 9;

  // --- Pointillés du tracé ---------------------------------------------------------------------
  const dashGeometry = new THREE.BoxGeometry(DASH_SIZE[0], DASH_SIZE[1], DASH_SIZE[2]);
  const dashes = new THREE.InstancedMesh(dashGeometry, flatMaterial, MAX_DASHES);
  dashes.name = 'ghost-dashes';
  dashes.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_DASHES * 3), 3);
  dashes.count = 0;
  dashes.visible = false;
  dashes.castShadow = false;
  dashes.receiveShadow = false;
  dashes.frustumCulled = false;
  dashes.renderOrder = 11;

  group.add(mesh, frames, dashes);

  const stats = { visible: false, dashes: 0, highlights: 0, calls: 0 };

  function resolveModel(id) {
    if (!id || !models) return null;
    if (typeof models.resolve === 'function') return models.resolve(id);
    const m = typeof models.get === 'function' ? models.get(id) : null;
    return m || (typeof models.fallback === 'function' ? models.fallback(id) : null);
  }

  function setFrame(i, x, y, hex) {
    composeMatrix(matrix, x + 0.5, tileSurface(world, x, y) + FRAME_LIFT, y + 0.5, 0, 1);
    frames.setMatrixAt(i, matrix);
    frames.setColorAt(i, color.set(hex));
  }

  /** Reconstruit la liste des cadres (fantôme puis surbrillances). */
  function refreshFrames() {
    let n = 0;
    if (current) setFrame(n++, current.x, current.y, ghostTint(current.ok));
    const shown = Math.min(highlights.length, MAX_HIGHLIGHTS);
    for (let i = 0; i < shown; i++) setFrame(n++, highlights[i].x, highlights[i].y, palette.sun);
    frames.count = n;
    frames.visible = n > 0;
    frames.instanceMatrix.needsUpdate = true;
    frames.instanceColor.needsUpdate = true;
    stats.highlights = Math.min(highlights.length, MAX_HIGHLIGHTS);
    stats.calls = (mesh.visible ? 1 : 0) + (frames.visible ? 1 : 0) + (dashes.visible ? 1 : 0);
  }

  function applyBreath() {
    const s = baseScale * (1 + BREATH_AMPLITUDE * Math.sin(2 * Math.PI * BREATH_HZ * clock));
    mesh.scale.setScalar(s);
  }

  function hideGhost() {
    mesh.visible = false;
    dashes.count = 0;
    dashes.visible = false;
    stats.visible = false;
    stats.dashes = 0;
  }

  /** Affiche le fantôme { x, y, tileId, ok, path, yaw, level, variant, modelId } ou cache tout avec null. */
  function set(g) {
    current = g && Number.isFinite(g.x) && Number.isFinite(g.y) ? g : null;
    if (!current) { hideGhost(); refreshFrames(); return; }

    // Modèle et teinte
    const id = current.modelId || ghostModelId(current.tileId, current.level, current.variant);
    const model = resolveModel(id);
    if (model && model.geometry) {
      mesh.geometry = model.geometry;
      mesh.visible = true;
    } else {
      mesh.geometry = placeholder;
      mesh.visible = false;
    }
    color.set(ghostTint(current.ok));
    ghostMaterial.color.copy(color);
    ghostMaterial.emissive.copy(color).multiplyScalar(GHOST_EMISSIVE);

    // Pose
    const tr = ghostTransform(current.x, current.y, current.yaw, tileSurface(world, current.x, current.y));
    const offset = TILE_BY_ID[current.tileId]?.family !== 'nature' && world
      ? frontageOffset(world, current.x, current.y, Number(current.yaw) || 0) : { x: 0, z: 0 };
    mesh.position.set(tr.position[0] + offset.x, tr.position[1], tr.position[2] + offset.z);
    mesh.rotation.set(0, tr.yaw, 0);
    baseScale = tr.scale;
    applyBreath();

    // Pointillés
    const list = dashPositions(current.path, world);
    const n = Math.min(list.length, MAX_DASHES);
    for (let i = 0; i < n; i++) {
      const d = list[i];
      composeMatrix(matrix, d.x, d.y, d.z, d.yaw, 1);
      dashes.setMatrixAt(i, matrix);
      dashes.setColorAt(i, d.bridge ? sunColor : markingColor);
    }
    dashes.count = n;
    dashes.visible = n > 0;
    if (n > 0) {
      dashes.instanceMatrix.needsUpdate = true;
      dashes.instanceColor.needsUpdate = true;
    }
    stats.visible = true;
    stats.dashes = n;
    refreshFrames();
  }

  /** Marque des cases d'un cadre jaune ; null ou [] efface. */
  function setHighlight(cells) {
    highlights = Array.isArray(cells) ? cells.filter((c) => c && Number.isFinite(c.x) && Number.isFinite(c.y)) : [];
    refreshFrames();
  }

  /** Nouveau monde : hauteurs du sol et arêtes équipées changent, on repose ce qui est affiché. */
  function setWorld(next) {
    world = next || null;
    if (current) set(current); else refreshFrames();
  }

  /** Respiration du modèle. */
  function update(dt) {
    if (Number.isFinite(dt) && dt > 0) clock += dt;
    if (mesh.visible) applyBreath();
  }

  /** Dosage de la teinte (0 : couleurs du modèle teintées, 1 : teinte plate) ; réglage de mise au point. */
  function setTintMix(v) {
    tintMix.value = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : GHOST_TINT_MIX;
  }

  function dispose() {
    group.remove(mesh, frames, dashes);
    mesh.geometry = placeholder; // les géométries des modèles sont partagées : jamais libérées ici
    placeholder.dispose();
    frameGeometry.dispose();
    dashGeometry.dispose();
    frames.dispose();
    dashes.dispose();
    ghostMaterial.dispose();
    flatMaterial.dispose();
    current = null;
    highlights = [];
  }

  return {
    group,
    mesh,
    frames,
    dashes,
    material: ghostMaterial,
    set,
    setHighlight,
    setWorld,
    update,
    setTintMix,
    get tintMix() { return tintMix.value; },
    stats: () => ({ ...stats }),
    dispose,
  };
}
