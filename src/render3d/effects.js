// Effets animés de la vallée (docs/ARCHITECTURE.md §8.3) : la FUMÉE des cheminées (usines, centrale) en
// UNE `InstancedMesh` de petites sphères basse définition (icosaèdre à une subdivision), et les PALES des
// éoliennes en UNE `InstancedMesh` de la pièce « blades » du modèle (nœud laissé hors de la fusion par
// models.js, pivot au moyeu), en rotation continue avec ombre portée. L'eau animée vit dans ground.js
// (shader) : `ground.update(dt)`.
//
//   const fx = createEffects(models, { palette });
//   fx.setWorld(world);            // émetteurs de fumée, ancrages des pales
//   fx.update(dt, time);           // avant render() ; `time` (s) impose l'horloge, sinon dt s'accumule
//   fx.setSmokeLevel(0..1);        // intensité de la fumée (plus tard liée à la pollution)
//   fx.stats() → { smoke, emitters, blades, calls, shadowCalls } ; scene.add(fx.group) ; fx.dispose()
//
// Les parties pures (vent, émetteurs, cycle de vie d'une bouffée, ancrages des pales) sont exportées et
// testées sous Node (tests/effects.test.js). `update` n'alloue rien par image.
//
// Repère : la case (x, y) couvre [x, x+1] × [y, y+1] en (X, Z) ; nord = −Z, est = +X, y vers le haut.

import * as THREE from 'three';
import { PALETTE } from '../data/palette.js';
import { collectPlacements } from './buildings.js';
import { familyOf, paintGeometry, mergeParts } from './models.js';
import { hashUnit, lerp, composeMatrix } from './util.js';

/** Durée de vie d'une bouffée (s). */
export const SMOKE_LIFE = 3;
/** Vitesse d'ascension (u/s). */
export const SMOKE_RISE = 0.25;
/** Vitesse de dérive sous le vent dominant (u/s). */
export const WIND_SPEED = 0.1;
/** Bouffées par émetteur, à pleine intensité. */
export const SMOKE_PUFFS = 8;
/** Plafond d'instances de fumée (un seul appel de dessin). */
export const SMOKE_MAX = 160;
/** Diamètre d'une bouffée : à la naissance, au plus gros (u). */
export const SMOKE_SCALE = Object.freeze([0.05, 0.18]);
/** Part de la vie passée à grossir ; le reste rétrécit jusqu'à zéro (c'est ainsi que la bouffée disparaît). */
export const SMOKE_GROW = 0.6;
/** Vitesse de rotation des pales (tours par seconde) et variation relative par éolienne. */
export const BLADE_RPS = 1.2;
export const BLADE_RPS_JITTER = 0.12;

/** Familles de modèles (préfixes) qui fument. */
export const SMOKING_FAMILIES = Object.freeze(['factory', 'power-plant']);

/**
 * Sommets des cheminées des modèles connus, dans le repère du modèle (avant l'échelle de pose) : [x, y, z].
 * Relevés sur les GLB normalisés (anneaux de sommets les plus hauts) ; la centrale fume par sa cheminée
 * et sa tour de refroidissement.
 */
export const CHIMNEYS = Object.freeze({
  'factory-a': Object.freeze([Object.freeze([0.055, 0.83, 0.31])]),
  'factory-b': Object.freeze([Object.freeze([-0.105, 0.88, 0.23]), Object.freeze([-0.31, 0.88, 0.23])]),
  'power-plant': Object.freeze([Object.freeze([0.205, 0.72, -0.325]), Object.freeze([0.26, 0.63, 0.025])]),
});

/**
 * Dérive imposée par le vent dominant `world.wind` : le vent est nommé par son ORIGINE (un vent d'ouest,
 * 'W', pousse la fumée vers l'est, +X ; un vent du nord, 'N', la pousse vers le sud, +Z). [0, 0] sans vent.
 */
const WIND_DRIFT = Object.freeze({ N: [0, 1], S: [0, -1], E: [-1, 0], W: [1, 0] });
export function windVector(wind) {
  const v = WIND_DRIFT[wind];
  return v ? [v[0], v[1]] : [0, 0];
}

/** « #rrggbb » → [r, g, b] linéaire (sans three.js : utilisable dans les fonctions pures). */
export function hexToLinear(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return [f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)];
}

const smoothstep = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** Couleurs de la fumée (linéaires) : gris clair à la naissance, crème en fin de vie. */
const ZERO2 = Object.freeze([0, 0]);
const SMOKE_COLOR_FROM = Object.freeze(hexToLinear(PALETTE.metalLight));
const SMOKE_COLOR_TO = Object.freeze(hexToLinear(PALETTE.wallCream));

// ---------------------------------------------------------------------------------------------
// Fumée : parties pures
// ---------------------------------------------------------------------------------------------

/**
 * Sommets des cheminées d'un modèle, dans son repère (avant l'échelle de pose) : [[x, y, z], …], 1 à 2.
 *   1. nœuds « chimney* » du manifeste gardés hors fusion (`models.getPart`) : sommet de la pièce au pivot ;
 *   2. table `CHIMNEYS` des modèles connus ;
 *   3. sinon sommet de la boîte englobante, décalé vers un angle.
 */
export function chimneyOffsets(id, models) {
  const out = [];
  if (models && typeof models.partNames === 'function') {
    for (const name of models.partNames(id)) {
      if (!/^chimney/i.test(name)) continue;
      const part = models.getPart(id, name);
      if (part && part.pivot) out.push([part.pivot[0], part.pivot[1] + (Number.isFinite(part.height) ? part.height : 0), part.pivot[2]]);
    }
  }
  if (out.length) return out.slice(0, 2);
  if (CHIMNEYS[id]) return CHIMNEYS[id].map((c) => c.slice());
  const model = models && typeof models.resolve === 'function' ? models.resolve(id) : null;
  const h = model && Number.isFinite(model.height) ? model.height : 0.9;
  return [[0.22, h, -0.22]];
}

/** Vrai si le modèle déclare des cheminées nommées (nœuds « chimney* » hors fusion). */
function hasChimneyNodes(id, models) {
  return Boolean(models && typeof models.partNames === 'function' && models.partNames(id).some((n) => /^chimney/i.test(n)));
}

/**
 * Émetteurs de fumée du monde : [{ x, y, z, tile, model, seed }] (position monde du sommet de cheminée,
 * `seed` ∈ [0, 1) déterministe par case). Toute pose d'un modèle de famille `factory` ou `power-plant`,
 * ou d'un modèle à nœuds « chimney* », fume par 1 à 2 cheminées, tournées et mises à l'échelle avec lui.
 * Pure : ne dépend que du monde, du catalogue et des pièces connues de `models` (facultatif).
 */
export function collectSmokeEmitters(world, models = null, options = {}) {
  const out = [];
  const seed = world.seed | 0;
  for (const p of collectPlacements(world, { modelFor: options.modelFor })) {
    const family = familyOf(p.id);
    if (!SMOKING_FAMILIES.includes(family) && !hasChimneyNodes(p.id, models)) continue;
    const c = Math.cos(p.yaw), s = Math.sin(p.yaw);
    chimneyOffsets(p.id, models).forEach((o, k) => {
      out.push({
        // Rotation autour de Y comme `composeMatrix` : x' = c·x + s·z, z' = −s·x + c·z.
        x: p.x + p.scale * (c * o[0] + s * o[2]),
        y: p.y + p.scale * o[1],
        z: p.z + p.scale * (-s * o[0] + c * o[2]),
        tile: p.tile,
        model: p.id,
        seed: hashUnit(seed, p.tile, k, 0x5e0),
      });
    });
  }
  return out;
}

/**
 * État de la bouffée `k` d'un émetteur à l'instant `t` (s), déterministe : écrit dans `out`
 * { x, y, z, scale, u, color: [r, g, b] } et le renvoie (aucune allocation si `out` est fourni).
 * options : { wind: [dx, dz] (dérive, voir `windVector`), level: 0..1 (intensité), puffs (bouffées par
 * émetteur), colorFrom, colorTo ([r, g, b] linéaires) }.
 * Cycle (SMOKE_LIFE) : naît au sommet de la cheminée (diamètre SMOKE_SCALE[0]), monte à SMOKE_RISE, dérive
 * avec le vent à WIND_SPEED en ondulant un peu, grossit jusqu'à SMOKE_SCALE[1] (SMOKE_GROW de la vie) puis
 * rétrécit jusqu'à zéro ; gris clair → crème. Les bouffées d'un émetteur sont réparties sur le cycle.
 */
export function smokePuffAt(t, emitter, k, options = {}, out = { color: [0, 0, 0] }) {
  const wind = options.wind || ZERO2;
  const level = Number.isFinite(options.level) ? Math.min(1, Math.max(0, options.level)) : 1;
  const puffs = options.puffs || SMOKE_PUFFS;
  const from = options.colorFrom || SMOKE_COLOR_FROM;
  const to = options.colorTo || SMOKE_COLOR_TO;
  const seed = Number.isFinite(emitter.seed) ? emitter.seed : 0;
  // Décalage de phase : réparti sur le cycle, légèrement irrégulier par émetteur.
  const stagger = ((k + 0.6 * hashUnit(Math.floor(seed * 65536), k, 0, 3)) / puffs) * SMOKE_LIFE;
  const age = (((t + stagger) % SMOKE_LIFE) + SMOKE_LIFE) % SMOKE_LIFE;
  const u = age / SMOKE_LIFE;
  const phase = seed * Math.PI * 2 + k * 2.1;
  const wobble = 0.035 * u;
  out.x = emitter.x + wind[0] * WIND_SPEED * age + wobble * Math.sin(age * 2.3 + phase);
  out.y = emitter.y + SMOKE_RISE * age * (0.75 + 0.25 * level);
  out.z = emitter.z + wind[1] * WIND_SPEED * age + wobble * Math.cos(age * 1.9 + phase * 1.7);
  let scale;
  if (u < SMOKE_GROW) scale = lerp(SMOKE_SCALE[0], SMOKE_SCALE[1], smoothstep(u / SMOKE_GROW));
  else scale = SMOKE_SCALE[1] * (1 - smoothstep((u - SMOKE_GROW) / (1 - SMOKE_GROW)));
  out.scale = scale * (0.7 + 0.3 * level) * (0.9 + 0.2 * hashUnit(Math.floor(seed * 65536), k, 1, 3));
  out.u = u;
  out.color[0] = lerp(from[0], to[0], u);
  out.color[1] = lerp(from[1], to[1], u);
  out.color[2] = lerp(from[2], to[2], u);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Pales : parties pures
// ---------------------------------------------------------------------------------------------

/** Axe de rotation d'une pièce de rotor : la dimension la plus mince de sa boîte ('x' | 'y' | 'z'). */
export function rotationAxisOf(box) {
  const ex = box.max.x - box.min.x, ey = box.max.y - box.min.y, ez = box.max.z - box.min.z;
  if (ex <= ey && ex <= ez) return 'x';
  if (ey <= ex && ey <= ez) return 'y';
  return 'z';
}

/**
 * Rotor d'un modèle d'éolienne : { pivot: [x, y, z], axis, radius, source: 'part' | 'fallback' }.
 * Avec la pièce « blades » du manifeste : son pivot (le moyeu) et son axe ; sinon un rotor de repli au
 * sommet du mât (hauteur de la boîte : moyeu à 78,5 %, rayon 24 %, en avant du mât côté +Z).
 */
export function rotorOf(id, models) {
  const part = models && typeof models.getPart === 'function' ? models.getPart(id, 'blades') : null;
  if (part && part.geometry && part.geometry.boundingBox) {
    const b = part.geometry.boundingBox;
    const axis = rotationAxisOf(b);
    const radius = Math.max(axis === 'x' ? 0 : Math.max(-b.min.x, b.max.x), axis === 'y' ? 0 : Math.max(-b.min.y, b.max.y), axis === 'z' ? 0 : Math.max(-b.min.z, b.max.z));
    return { pivot: part.pivot.slice(), axis, radius, source: 'part' };
  }
  const model = models && typeof models.resolve === 'function' ? models.resolve(id) : null;
  const h = model && Number.isFinite(model.height) && model.height > 0 ? model.height : 1.8;
  if (model && model.source === 'fallback') {
    // Boîte de remplacement de models.js : barre verticale centrée en y = h, en avant de 0,05.
    return { pivot: [0, h, 0.09], axis: 'z', radius: 0.45, source: 'fallback' };
  }
  const b = model && model.geometry && model.geometry.boundingBox;
  const front = b ? Math.min(0.14, b.max.z * 0.75 + 0.03) : 0.08;
  return { pivot: [0, h * 0.785, front], axis: 'z', radius: h * 0.24, source: 'fallback' };
}

/**
 * Ancrages des rotors du monde : [{ x, y, z, yaw, scale, tile, model, pivot, axis, radius, source, speed,
 * phase }] pour chaque pose d'un modèle de famille `wind-turbine` (ou qui possède une pièce « blades »).
 * `speed` (tours/s) varie un peu par éolienne, `phase` (rad) aussi ; toutes tournent dans le même sens.
 */
export function collectBladeAnchors(world, models = null, options = {}) {
  const out = [];
  const seed = world.seed | 0;
  for (const p of collectPlacements(world, { modelFor: options.modelFor })) {
    const hasPart = models && typeof models.getPart === 'function' && Boolean(models.getPart(p.id, 'blades'));
    if (familyOf(p.id) !== 'wind-turbine' && !hasPart) continue;
    const rotor = rotorOf(p.id, models);
    const u = hashUnit(seed, p.tile, 0, 0xb1ad);
    out.push({
      x: p.x, y: p.y, z: p.z, yaw: p.yaw, scale: p.scale, tile: p.tile, model: p.id,
      pivot: rotor.pivot, axis: rotor.axis, radius: rotor.radius, source: rotor.source,
      speed: BLADE_RPS * (1 + (u * 2 - 1) * BLADE_RPS_JITTER),
      phase: hashUnit(seed, p.tile, 1, 0xb1ad) * Math.PI * 2,
    });
  }
  return out;
}

/** Angle (rad) du rotor d'un ancrage à l'instant t : sens horaire vu de face (axe +Z vers le spectateur). */
export function bladeAngle(anchor, t) {
  return -(anchor.phase + Math.PI * 2 * anchor.speed * t);
}

// ---------------------------------------------------------------------------------------------
// Rendu
// ---------------------------------------------------------------------------------------------

/** Rotor de repli : moyeu + trois pales plates dans le plan XY, axe Z, couleur `marking`. */
function buildFallbackRotor(radius, hex) {
  const parts = [];
  const hub = new THREE.CylinderGeometry(0.035, 0.035, 0.05, 8);
  hub.rotateX(Math.PI / 2);
  parts.push(paintGeometry(hub, hex));
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.BoxGeometry(0.045, radius, 0.012);
    blade.translate(0, radius / 2 + 0.02, 0);
    blade.rotateZ((i * 2 * Math.PI) / 3);
    parts.push(paintGeometry(blade, hex));
  }
  return mergeParts(parts);
}

/**
 * Crée les effets. `models` : résultat de `loadModels`. options : { palette = PALETTE, shadows = true,
 * modelFor (bâtiment → identifiant de modèle, comme buildings.js) }.
 */
export function createEffects(models, options = {}) {
  const palette = options.palette || PALETTE;
  const shadows = options.shadows !== false;
  const group = new THREE.Group();
  group.name = 'effects';

  // --- Fumée ----------------------------------------------------------------------------------
  // Sphère de diamètre 1 (rayon 0,5) : l'échelle d'instance est directement le diamètre de la bouffée.
  const smokeGeometry = new THREE.IcosahedronGeometry(0.5, 1);
  const smokeMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(palette.metalLight || PALETTE.metalLight).multiplyScalar(0.2),
  });
  const smoke = new THREE.InstancedMesh(smokeGeometry, smokeMaterial, SMOKE_MAX);
  smoke.name = 'smoke';
  smoke.castShadow = false;
  smoke.receiveShadow = false;
  smoke.frustumCulled = false;
  smoke.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(SMOKE_MAX * 3), 3);
  smoke.count = 0;
  smoke.visible = false;
  group.add(smoke);

  let emitters = [];
  let puffsPerEmitter = SMOKE_PUFFS;
  let activePuffs = SMOKE_PUFFS;
  let smokeLevel = 1;
  const puffOptions = {
    wind: [0, 0], level: 1, puffs: SMOKE_PUFFS,
    colorFrom: hexToLinear(palette.metalLight || PALETTE.metalLight),
    colorTo: hexToLinear(palette.wallCream || PALETTE.wallCream),
  };
  const puff = { x: 0, y: 0, z: 0, scale: 0, u: 0, color: [0, 0, 0] };

  // --- Pales ----------------------------------------------------------------------------------
  /** Par identifiant de modèle : { mesh, anchors, bases: Matrix4[], owned (géométrie de repli à libérer) }. */
  const rotors = new Map();
  let bladeCount = 0;

  let clock = 0;
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Matrix4();
  const color = new THREE.Color();

  function applySmokeLevel() {
    activePuffs = emitters.length ? Math.round(puffsPerEmitter * smokeLevel) : 0;
    puffOptions.level = smokeLevel;
    puffOptions.puffs = Math.max(1, puffsPerEmitter);
    smoke.visible = activePuffs > 0;
    if (!smoke.visible) smoke.count = 0;
  }

  function clearRotors() {
    for (const r of rotors.values()) {
      group.remove(r.mesh);
      if (r.owned) r.mesh.geometry.dispose();
    }
    rotors.clear();
    bladeCount = 0;
  }

  function setWorld(world) {
    puffOptions.wind = windVector(world.wind);
    emitters = collectSmokeEmitters(world, models, { modelFor: options.modelFor });
    if (emitters.length > SMOKE_MAX) emitters = emitters.slice(0, SMOKE_MAX);
    puffsPerEmitter = emitters.length ? Math.min(SMOKE_PUFFS, Math.floor(SMOKE_MAX / emitters.length)) : 0;
    applySmokeLevel();

    clearRotors();
    const anchors = collectBladeAnchors(world, models, { modelFor: options.modelFor });
    const byModel = new Map();
    for (const a of anchors) {
      if (!byModel.has(a.model)) byModel.set(a.model, []);
      byModel.get(a.model).push(a);
    }
    for (const [id, list] of byModel) {
      const part = models && typeof models.getPart === 'function' ? models.getPart(id, 'blades') : null;
      let geometry, material, owned = false;
      if (part) {
        geometry = part.geometry; material = part.material;
      } else {
        geometry = buildFallbackRotor(list[0].radius, palette.marking || PALETTE.marking);
        material = models && models.materials && models.materials.vertex ? models.materials.vertex : smokeMaterial;
        owned = true;
      }
      const mesh = new THREE.InstancedMesh(geometry, material, list.length);
      mesh.name = `blades:${id}`;
      mesh.castShadow = shadows;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;
      const bases = list.map((a) => {
        const m = composeMatrix(new THREE.Matrix4(), a.x, a.y, a.z, a.yaw, a.scale);
        return m.multiply(new THREE.Matrix4().makeTranslation(a.pivot[0], a.pivot[1], a.pivot[2]));
      });
      group.add(mesh);
      rotors.set(id, { mesh, anchors: list, bases, owned });
      bladeCount += list.length;
    }
    update(0, clock);
  }

  function updateSmoke(t) {
    if (!smoke.visible) return;
    let idx = 0;
    for (let i = 0; i < emitters.length; i++) {
      const e = emitters[i];
      for (let k = 0; k < activePuffs && idx < SMOKE_MAX; k++) {
        smokePuffAt(t, e, k, puffOptions, puff);
        const s = Math.max(1e-4, puff.scale);
        matrix.makeScale(s, s * 0.92, s);
        matrix.setPosition(puff.x, puff.y, puff.z);
        smoke.setMatrixAt(idx, matrix);
        color.setRGB(puff.color[0], puff.color[1], puff.color[2]);
        smoke.setColorAt(idx, color);
        idx++;
      }
    }
    smoke.count = idx;
    smoke.instanceMatrix.needsUpdate = true;
    smoke.instanceColor.needsUpdate = true;
  }

  function updateBlades(t) {
    for (const r of rotors.values()) {
      for (let i = 0; i < r.anchors.length; i++) {
        const a = r.anchors[i];
        const angle = bladeAngle(a, t);
        if (a.axis === 'x') rotation.makeRotationX(angle);
        else if (a.axis === 'y') rotation.makeRotationY(angle);
        else rotation.makeRotationZ(angle);
        matrix.multiplyMatrices(r.bases[i], rotation);
        r.mesh.setMatrixAt(i, matrix);
      }
      r.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  /** Avance les effets : `time` (s) impose l'horloge (captures déterministes), sinon `dt` s'accumule. */
  function update(dt, time) {
    clock = Number.isFinite(time) ? time : clock + (Number.isFinite(dt) ? Math.max(0, dt) : 0);
    updateSmoke(clock);
    updateBlades(clock);
  }

  function setSmokeLevel(v) {
    smokeLevel = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
    applySmokeLevel();
  }

  function stats() {
    const bladeMeshes = rotors.size;
    return {
      smoke: smoke.visible ? emitters.length * activePuffs : 0,
      emitters: emitters.length,
      blades: bladeCount,
      calls: (smoke.visible ? 1 : 0) + bladeMeshes,
      shadowCalls: shadows ? bladeMeshes : 0,
    };
  }

  function dispose() {
    clearRotors();
    group.remove(smoke);
    smokeGeometry.dispose();
    smokeMaterial.dispose();
    emitters = [];
  }

  return {
    group,
    setWorld,
    update,
    setSmokeLevel,
    stats,
    dispose,
    /** Accès de débogage. */
    get emitters() { return emitters; },
    get time() { return clock; },
    get smokeLevel() { return smokeLevel; },
  };
}
