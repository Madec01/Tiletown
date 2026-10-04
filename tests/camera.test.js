// Tests de la caméra orthographique 3/4 (module pur, sans three.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ZOOM_MIN, ZOOM_MAX, CAMERA_DISTANCE,
  createCameraState, basis, projectionParams, worldToScreen, pickGround, pickTile,
  pan, zoomAt, fitAll, fitZoom, zoomMaxFor, clamp,
} from '../src/render3d/camera.js';
import * as Camera from '../src/render3d/camera.js';

const VIEWPORT = { width: 412, height: 915 };
const WORLD = { cols: 12, rows: 16 };
const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b} (±${eps})`);
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];

test('la base caméra est orthonormée et cohérente avec lookAt(up = +Y)', () => {
  const s = createCameraState({ cx: 3, cz: 4 });
  const { dir, right, up } = basis(s);
  close(dot(dir, dir), 1); close(dot(right, right), 1); close(dot(up, up), 1);
  close(dot(dir, right), 0); close(dot(dir, up), 0); close(dot(right, up), 0);
  assert.ok(dir[1] > 0, 'la caméra est au-dessus du sol');
  assert.ok(up[1] > 0, 'le haut de l’écran pointe vers le ciel');
  assert.equal(right[1], 0, 'l’axe droite est horizontal');
});

test('projectionParams : frustum symétrique au rapport du viewport, caméra à distance fixe du point visé', () => {
  const s = createCameraState({ cx: 6, cz: 8, zoom: 12 });
  const p = projectionParams(s, VIEWPORT);
  close(p.right, 6); close(p.left, -6);
  close(p.top, 6 * (915 / 412)); close(p.bottom, -p.top);
  assert.ok(p.near > 0 && p.far > 2 * CAMERA_DISTANCE);
  assert.deepEqual(p.target, [6, 0, 8]);
  const d = Math.hypot(p.position[0] - 6, p.position[1], p.position[2] - 8);
  close(d, CAMERA_DISTANCE, 1e-9);
  assert.ok(p.position[1] > 0);
});

test('pickGround : le centre de l’écran vise (cx, cz) et worldToScreen est son inverse', () => {
  const s = createCameraState({ cx: 5.5, cz: 7.25, zoom: 9 });
  const c = pickGround(s, VIEWPORT.width / 2, VIEWPORT.height / 2, VIEWPORT);
  close(c.x, 5.5); close(c.z, 7.25);
  for (const [px, py] of [[10, 20], [400, 900], [206, 100], [50, 457]]) {
    const g = pickGround(s, px, py, VIEWPORT);
    const back = worldToScreen(s, VIEWPORT, g.x, 0, g.z);
    close(back.x, px, 1e-6); close(back.y, py, 1e-6);
  }
});

test('pickGround tient compte de la position du canvas dans la page (left, top)', () => {
  const s = createCameraState({ cx: 2, cz: 2, zoom: 8 });
  const vp = { ...VIEWPORT, left: 100, top: 50 };
  const a = pickGround(s, 100 + 206, 50 + 457.5, vp);
  close(a.x, 2); close(a.z, 2);
});

test('pickTile : indices de case, null hors carte', () => {
  const s = createCameraState({ cx: 6, cz: 8, zoom: 12 });
  const t = pickTile(s, 206, 457.5, VIEWPORT, WORLD);
  assert.deepEqual(t, { x: 6, y: 8 });
  // Un point loin à gauche, hors de la carte
  assert.equal(pickTile(createCameraState({ cx: -40, cz: 0 }), 206, 457.5, VIEWPORT, WORLD), null);
  assert.equal(pickTile(s, 206, 457.5, VIEWPORT, null), null);
});

test('pan : le point du sol sous le doigt suit le doigt', () => {
  const s = createCameraState({ cx: 6, cz: 8, zoom: 10 });
  const finger = [150, 600];
  const before = pickGround(s, finger[0], finger[1], VIEWPORT);
  const moved = pan(s, 37, -81, VIEWPORT);
  const after = pickGround(moved, finger[0] + 37, finger[1] - 81, VIEWPORT);
  close(after.x, before.x, 1e-9); close(after.z, before.z, 1e-9);
  assert.notEqual(moved, s, 'nouvel objet');
  assert.equal(s.cx, 6, 'l’état d’origine n’est pas modifié');
  // Un glisser vers la droite fait défiler la carte vers la droite : le point visé part à gauche de l'écran.
  const centerAfter = worldToScreen(pan(s, 50, 0, VIEWPORT), VIEWPORT, 6, 0, 8);
  close(centerAfter.x, VIEWPORT.width / 2 + 50, 1e-9);
  close(centerAfter.y, VIEWPORT.height / 2, 1e-9);
});

test('zoomAt : le point sous le doigt reste fixe, le zoom est borné et continu', () => {
  const s = createCameraState({ cx: 6, cz: 8, zoom: 12 });
  const finger = [300, 250];
  const before = pickGround(s, finger[0], finger[1], VIEWPORT);
  const z1 = zoomAt(s, 1.5, finger[0], finger[1], VIEWPORT);
  close(z1.zoom, 8);
  const after = pickGround(z1, finger[0], finger[1], VIEWPORT);
  close(after.x, before.x, 1e-9); close(after.z, before.z, 1e-9);
  // Bornes
  close(zoomAt(s, 100, 206, 457, VIEWPORT).zoom, ZOOM_MIN);
  close(zoomAt(s, 0.01, 206, 457, VIEWPORT).zoom, ZOOM_MAX);
  // Facteurs dégénérés : état inchangé
  assert.equal(zoomAt(s, 1, 206, 457, VIEWPORT), s);
  assert.equal(zoomAt(s, 0, 206, 457, VIEWPORT), s);
  assert.equal(zoomAt(s, NaN, 206, 457, VIEWPORT), s);
  // Avec le monde : la vue d'ensemble peut dépasser ZOOM_MAX si la carte l'exige, jamais ZOOM_MIN en dessous
  const big = { cols: 16, rows: 24 };
  const out = zoomAt(s, 0.001, 206, 457, VIEWPORT, big);
  close(out.zoom, zoomMaxFor(big, VIEWPORT));
  assert.ok(out.zoom >= ZOOM_MAX);
});

test('fitAll : toute la carte (socle et hauteurs compris) tient dans le viewport, hors marges d’interface', () => {
  for (const [world, vp, insets] of [
    [WORLD, VIEWPORT, { top: 0, bottom: 0 }],
    [WORLD, { width: 360, height: 740 }, { top: 72, bottom: 220 }],
    [{ cols: 16, rows: 24 }, VIEWPORT, { top: 60, bottom: 260 }],
    [{ cols: 12, rows: 16 }, { width: 1200, height: 700 }, {}],
  ]) {
    const s = fitAll(createCameraState(), world, vp, { insets });
    const ins = { top: 0, bottom: 0, left: 0, right: 0, ...insets };
    for (const x of [0, world.cols]) for (const z of [0, world.rows]) for (const y of [-0.7, 2.6]) {
      const p = worldToScreen(s, vp, x, y, z);
      assert.ok(p.x >= ins.left - 1e-6 && p.x <= vp.width - ins.right + 1e-6, `x ${p.x} hors zone utile`);
      assert.ok(p.y >= ins.top - 1e-6 && p.y <= vp.height - ins.bottom + 1e-6, `y ${p.y} hors zone utile`);
    }
    // Le cadrage est serré : l'étendue projetée occupe toute la largeur OU toute la hauteur utile (à la marge près)
    const xs = [], ys = [];
    for (const x of [0, world.cols]) for (const z of [0, world.rows]) for (const y of [-0.7, 2.6]) {
      const p = worldToScreen(s, vp, x, y, z); xs.push(p.x); ys.push(p.y);
    }
    const spanX = Math.max(...xs) - Math.min(...xs), spanY = Math.max(...ys) - Math.min(...ys);
    const usableW = vp.width - ins.left - ins.right, usableH = vp.height - ins.top - ins.bottom;
    assert.ok(spanX / usableW > 0.85 || spanY / usableH > 0.85, `cadrage trop lâche : ${spanX}/${usableW}, ${spanY}/${usableH}`);
    // Le centre de l'étendue est au centre de la zone utile
    close((Math.max(...xs) + Math.min(...xs)) / 2, ins.left + usableW / 2, 1e-6);
    close((Math.max(...ys) + Math.min(...ys)) / 2, ins.top + usableH / 2, 1e-6);
  }
});

test('fitZoom en portrait : la largeur du losange gouverne (12 × 16 ≈ 21 unités)', () => {
  const z = fitZoom(WORLD, VIEWPORT);
  assert.ok(z > 19 && z < 24, `zoom ${z}`);
  assert.ok(fitZoom({ cols: 16, rows: 24 }, VIEWPORT) > ZOOM_MAX, 'la grande carte dépasse ZOOM_MAX');
});

test('clamp : point visé au-dessus de la carte, zoom borné', () => {
  const s = createCameraState({ cx: -30, cz: 99, zoom: 1 });
  const c = clamp(s, WORLD, VIEWPORT);
  assert.equal(c.cx, -0.5); assert.equal(c.cz, 16.5); assert.equal(c.zoom, ZOOM_MIN);
  const ok = createCameraState({ cx: 6, cz: 8, zoom: 12 });
  assert.equal(clamp(ok, WORLD, VIEWPORT), ok, 'rien à borner : même objet');
  const far = clamp(createCameraState({ zoom: 500 }), WORLD, VIEWPORT);
  close(far.zoom, zoomMaxFor(WORLD, VIEWPORT));
  assert.equal(clamp(createCameraState({ zoom: 500 }), WORLD).zoom, ZOOM_MAX, 'sans viewport : ZOOM_MAX');
});

test('le sol est vu étiré de 1 / sin(pitch) : un déplacement écran vertical parcourt plus de sol', () => {
  const s = createCameraState({ cx: 6, cz: 8, zoom: 10 });
  const k = 10 / VIEWPORT.width;
  const a = pickGround(s, 206, 457.5, VIEWPORT);
  const b = pickGround(s, 206, 457.5 - 100, VIEWPORT);
  const c = pickGround(s, 306, 457.5, VIEWPORT);
  close(Math.hypot(b.x - a.x, b.z - a.z), 100 * k / Math.sin(s.pitch), 1e-9);
  close(Math.hypot(c.x - a.x, c.z - a.z), 100 * k, 1e-9);
  // Vers le haut de l'écran on s'éloigne de la caméra (vers −x, −z avec yaw = 45°)
  assert.ok(b.x < a.x && b.z < a.z);
  // Vers la droite de l'écran : +x et −z
  assert.ok(c.x > a.x && c.z < a.z);
});

test('lookAt : le point visé se projette au centre de la zone utile, hors marges d’interface', () => {
  const world = { cols: 12, rows: 16 };
  const viewport = { width: 412, height: 915 };
  const insets = { top: 120, bottom: 160, left: 0, right: 0 };
  const state = Camera.lookAt(Camera.createCameraState(), world, viewport, 6.5, 8.5, 8, { insets });
  assert.equal(state.zoom, 8);
  const p = Camera.worldToScreen(state, viewport, 6.5, 0, 8.5);
  const usableCenterY = insets.top + (viewport.height - insets.top - insets.bottom) / 2;
  assert.ok(Math.abs(p.x - viewport.width / 2) < 0.5, `x écran ${p.x}`);
  assert.ok(Math.abs(p.y - usableCenterY) < 0.5, `y écran ${p.y} attendu ${usableCenterY}`);
  // zoom borné par ZOOM_MIN
  const tight = Camera.lookAt(Camera.createCameraState(), world, viewport, 6.5, 8.5, 2, { insets });
  assert.equal(tight.zoom, Camera.ZOOM_MIN);
});
