// Caméra orthographique 3/4 de Tiletown : module PUR (aucune dépendance à three.js ni au DOM),
// testable sous Node. Il décrit l'état de la caméra et calcule tout ce dont le rendu a besoin :
// paramètres de projection, déplacement (pan), zoom continu autour du doigt, cadrage de toute
// la carte, bornes, et déprojection analytique du doigt sur le plan du sol (y = 0).
//
// Conventions du monde (docs/ARCHITECTURE.md §3) : la case (x, y) couvre le carré
// [x, x+1] × [y, y+1] du plan (X, Z) de three.js ; l'axe Y pointe vers le haut.
// L'état est immuable : chaque fonction renvoie un nouvel objet.
//
// Géométrie : la caméra vise le point (cx, 0, cz) depuis la direction
//   dir = (sin(yaw)·cos(pitch), sin(pitch), cos(yaw)·cos(pitch))
// (yaw = azimut autour de Y, pitch = élévation au-dessus du sol). Les axes écran sont
//   right = (cos(yaw), 0, −sin(yaw))              (vers la droite de l'écran)
//   up    = (−sin(p)·sin(yaw), cos(p), −sin(p)·cos(yaw))   (vers le haut de l'écran)
// identiques à ceux que three.js construit dans `lookAt` avec up = (0, 1, 0).
// `zoom` est la largeur visible en unités monde : 1 px CSS = zoom / viewport.width unités.

export const DEFAULT_YAW_DEG = 45;
export const DEFAULT_PITCH_DEG = 35;
/** Largeur visible minimale (jeu, ≈ 6 îlots) et maximale par défaut (vue d'ensemble). */
export const ZOOM_MIN = 6;
export const ZOOM_MAX = 24;
/** Distance de la caméra au point visé (sans effet sur l'image orthographique, sert au near/far). */
export const CAMERA_DISTANCE = 60;
/** Hauteur maximale considérée pour le cadrage (immeubles hauts) et profondeur du socle. */
export const WORLD_TOP = 2.6;
export const WORLD_BOTTOM = -0.7;

const DEG = Math.PI / 180;

/** Crée un état de caméra ; `overrides` permet de fixer cx, cz, zoom, yaw, pitch (radians). */
export function createCameraState(overrides = {}) {
  return Object.freeze({
    cx: 0,
    cz: 0,
    zoom: 12,
    yaw: DEFAULT_YAW_DEG * DEG,
    pitch: DEFAULT_PITCH_DEG * DEG,
    ...overrides,
  });
}

/** Base orthonormée de la caméra : `dir` (du point visé vers la caméra), `right`, `up`. */
export function basis(state) {
  const sy = Math.sin(state.yaw), cy = Math.cos(state.yaw);
  const sp = Math.sin(state.pitch), cp = Math.cos(state.pitch);
  return {
    dir: [sy * cp, sp, cy * cp],
    right: [cy, 0, -sy],
    up: [-sp * sy, cp, -sp * cy],
  };
}

/** Unités monde par pixel CSS (identique en X et en Y écran). */
export function unitsPerPixel(state, viewport) {
  return state.zoom / Math.max(1, viewport.width);
}

/**
 * Paramètres d'une `OrthographicCamera` : plans du frustum, position et point visé.
 * `viewport` = { width, height } en px CSS.
 */
export function projectionParams(state, viewport) {
  const halfW = state.zoom / 2;
  const halfH = halfW * (Math.max(1, viewport.height) / Math.max(1, viewport.width));
  const { dir } = basis(state);
  return {
    left: -halfW,
    right: halfW,
    top: halfH,
    bottom: -halfH,
    near: 1,
    far: CAMERA_DISTANCE * 2 + 40,
    position: [
      state.cx + dir[0] * CAMERA_DISTANCE,
      dir[1] * CAMERA_DISTANCE,
      state.cz + dir[2] * CAMERA_DISTANCE,
    ],
    target: [state.cx, 0, state.cz],
    up: [0, 1, 0],
  };
}

/**
 * Coordonnées caméra (sX vers la droite, sY vers le haut, en unités monde) d'un point du monde,
 * relatives au point visé.
 */
export function worldToCamera(state, x, y, z) {
  const { right, up } = basis(state);
  const dx = x - state.cx, dz = z - state.cz;
  return {
    sX: dx * right[0] + dz * right[2],
    sY: dx * up[0] + y * up[1] + dz * up[2],
  };
}

/** Projette un point du monde en pixels CSS relatifs au coin haut-gauche du canvas. */
export function worldToScreen(state, viewport, x, y, z) {
  const { sX, sY } = worldToCamera(state, x, y, z);
  const k = unitsPerPixel(state, viewport);
  return { x: viewport.width / 2 + sX / k, y: viewport.height / 2 - sY / k };
}

/**
 * Déprojection analytique d'un point écran (coordonnées client) sur le plan du sol y = 0.
 * `viewport` = { width, height, left = 0, top = 0 } : position du canvas dans la page.
 * Renvoie { x, z } en unités monde (toujours défini : la caméra n'est jamais horizontale).
 */
export function pickGround(state, clientX, clientY, viewport) {
  const px = clientX - (viewport.left || 0);
  const py = clientY - (viewport.top || 0);
  const k = unitsPerPixel(state, viewport);
  const sX = (px - viewport.width / 2) * k;          // unités vers la droite
  const sY = (viewport.height / 2 - py) * k;         // unités vers le haut
  const sy = Math.sin(state.yaw), cy = Math.cos(state.yaw);
  const sp = Math.sin(state.pitch);
  // Le sol est vu étiré verticalement d'un facteur 1 / sin(pitch) ; les deux axes se combinent.
  const g = sY / sp;
  return {
    x: state.cx + cy * sX - sy * g,
    z: state.cz - sy * sX - cy * g,
  };
}

/** Case sous le doigt : { x, y } (indices de case) ou null hors de la carte. */
export function pickTile(state, clientX, clientY, viewport, world) {
  if (!world) return null;
  const p = pickGround(state, clientX, clientY, viewport);
  const x = Math.floor(p.x), y = Math.floor(p.z);
  if (x < 0 || y < 0 || x >= world.cols || y >= world.rows) return null;
  return { x, y };
}

/**
 * Déplace la vue de (dxCss, dyCss) pixels : le point du sol sous le doigt suit le doigt
 * (un glisser vers la droite fait défiler la carte vers la droite).
 */
export function pan(state, dxCss, dyCss, viewport) {
  const k = unitsPerPixel(state, viewport);
  const sy = Math.sin(state.yaw), cy = Math.cos(state.yaw);
  const sp = Math.sin(state.pitch);
  const a = -dxCss * k;          // décalage du point visé en unités « droite »
  const g = dyCss * k / sp;      // décalage en unités « haut », ramené au sol
  return { ...state, cx: state.cx + cy * a - sy * g, cz: state.cz - sy * a - cy * g };
}

/**
 * Zoom continu : `factor` > 1 agrandit (pincement qui s'écarte), < 1 réduit.
 * Le point du sol sous (cxCss, cyCss) reste fixe à l'écran. Borné par `clamp` si `world` est donné.
 */
export function zoomAt(state, factor, cxCss, cyCss, viewport, world = null) {
  if (!(factor > 0) || !Number.isFinite(factor)) return state;
  const zoomMax = world ? zoomMaxFor(world, viewport) : ZOOM_MAX;
  const nextZoom = Math.min(zoomMax, Math.max(ZOOM_MIN, state.zoom / factor));
  if (nextZoom === state.zoom) return state;
  const vp = { ...viewport, left: 0, top: 0 };
  const before = pickGround(state, cxCss, cyCss, vp);
  const zoomed = { ...state, zoom: nextZoom };
  const after = pickGround(zoomed, cxCss, cyCss, vp);
  const moved = { ...zoomed, cx: zoomed.cx + before.x - after.x, cz: zoomed.cz + before.z - after.z };
  return world ? clamp(moved, world, viewport) : moved;
}

/** Les huit coins du volume de la carte (socle compris, hauteur des immeubles comprise). */
function worldCorners(world) {
  const corners = [];
  for (const x of [0, world.cols]) for (const z of [0, world.rows]) for (const y of [WORLD_BOTTOM, WORLD_TOP]) {
    corners.push([x, y, z]);
  }
  return corners;
}

/** Étendue de la carte en coordonnées caméra (relatives au point visé courant). */
function cameraExtent(state, world) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y, z] of worldCorners(world)) {
    const { sX, sY } = worldToCamera(state, x, y, z);
    if (sX < minX) minX = sX; if (sX > maxX) maxX = sX;
    if (sY < minY) minY = sY; if (sY > maxY) maxY = sY;
  }
  return { minX, maxX, minY, maxY };
}

/**
 * Largeur visible (zoom) nécessaire pour voir toute la carte dans `viewport`, avec une marge
 * en unités monde et des marges d'interface (`insets`, px CSS : haut, bas, gauche, droite).
 */
export function fitZoom(world, viewport, state = createCameraState(), options = {}) {
  const margin = options.margin ?? 0.6;
  const insets = { top: 0, bottom: 0, left: 0, right: 0, ...(options.insets || {}) };
  const usableW = Math.max(1, viewport.width - insets.left - insets.right);
  const usableH = Math.max(1, viewport.height - insets.top - insets.bottom);
  const e = cameraExtent(state, world);
  const needW = e.maxX - e.minX + 2 * margin;
  const needH = e.maxY - e.minY + 2 * margin;
  // zoom = unités visibles sur toute la largeur du canvas ; la zone utile n'en est qu'une partie.
  const zoomForW = needW * (viewport.width / usableW);
  const zoomForH = needH * (viewport.width / usableH);
  return Math.max(zoomForW, zoomForH);
}

/** Zoom maximal autorisé pour une carte : au moins ZOOM_MAX, et toujours assez pour tout voir. */
export function zoomMaxFor(world, viewport) {
  if (!world || !viewport) return ZOOM_MAX;
  return Math.max(ZOOM_MAX, fitZoom(world, viewport));
}

/**
 * Cadre toute la carte : zoom ajusté et point visé centré sur l'étendue projetée (la carte,
 * vue en losange, n'est pas centrée sur son centre géométrique à cause des hauteurs).
 */
export function fitAll(state, world, viewport, options = {}) {
  const insets = { top: 0, bottom: 0, left: 0, right: 0, ...(options.insets || {}) };
  const centered = { ...state, cx: world.cols / 2, cz: world.rows / 2 };
  const zoom = fitZoom(world, viewport, centered, options);
  const zoomed = { ...centered, zoom };
  const e = cameraExtent(zoomed, world);
  const k = unitsPerPixel(zoomed, viewport);
  // Milieu de l'étendue projetée, décalé pour centrer dans la zone utile (hors marges d'interface).
  // Le centre de la zone utile est décalé de (left − right, bottom − top) / 2 px par rapport au
  // centre du canvas ; on centre donc le point symétrique de l'étendue.
  const midX = (e.minX + e.maxX) / 2 + ((insets.right - insets.left) / 2) * k;
  const midY = (e.minY + e.maxY) / 2 + ((insets.top - insets.bottom) / 2) * k;
  return shiftTargetByCamera(zoomed, midX, midY);
}

/**
 * Vue centrée sur un point du sol (x, z) à un zoom donné (largeur visible en unités), le point
 * étant placé au centre de la zone utile (hors marges d'interface `insets`, px CSS). C'est la
 * vue de jeu par défaut : la mairie au centre, ≈ 8 îlots de large. Le zoom est borné.
 */
export function lookAt(state, world, viewport, x, z, zoom, options = {}) {
  const insets = { top: 0, bottom: 0, left: 0, right: 0, ...(options.insets || {}) };
  const zoomMax = zoomMaxFor(world, viewport);
  const z0 = Math.min(zoomMax, Math.max(ZOOM_MIN, zoom ?? state.zoom));
  const aimed = { ...state, cx: x, cz: z, zoom: z0 };
  const k = unitsPerPixel(aimed, viewport);
  const a = ((insets.right - insets.left) / 2) * k;
  const b = ((insets.top - insets.bottom) / 2) * k;
  return shiftTargetByCamera(aimed, a, b);
}

/** Déplace le point visé (sur le sol) pour décaler l'image de (a, b) unités caméra (droite, haut). */
export function shiftTargetByCamera(state, a, b) {
  const sy = Math.sin(state.yaw), cy = Math.cos(state.yaw);
  const g = b / Math.sin(state.pitch);
  return { ...state, cx: state.cx + cy * a - sy * g, cz: state.cz - sy * a - cy * g };
}

/**
 * Bornes : le point visé reste au-dessus de la carte (avec une petite tolérance), le zoom
 * entre ZOOM_MIN et le maximum qui montre toute la carte.
 */
export function clamp(state, world, viewport = null) {
  const slack = 0.5;
  const zoomMax = viewport ? zoomMaxFor(world, viewport) : ZOOM_MAX;
  const zoom = Math.min(zoomMax, Math.max(ZOOM_MIN, state.zoom));
  const cx = Math.min(world.cols + slack, Math.max(-slack, state.cx));
  const cz = Math.min(world.rows + slack, Math.max(-slack, state.cz));
  if (zoom === state.zoom && cx === state.cx && cz === state.cz) return state;
  return { ...state, zoom, cx, cz };
}
