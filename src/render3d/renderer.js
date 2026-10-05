// Rendu three.js de Tiletown : `createRenderer(canvas, options)` → API du contrat
// (docs/ARCHITECTURE.md §6). Lit l'état du monde, ne le modifie jamais ; aucun texte dans la scène.
//
//   const r = await createRenderer(canvas, { manifestUrl, pixelRatioMax: 2 });
//   r.setWorld(world); r.setLayer(kind, values); r.resize(w, h, dpr);
//   r.camera.pan(dx, dy); r.camera.zoomAt(f, cx, cy); r.camera.fitAll();
//   r.pick(clientX, clientY) → { x, y } | null; r.render(dt) → bool (a dessiné ?);
//   r.setGhost({ x, y, tileId, ok, path, yaw } | null); r.setHighlight([{ x, y }] | null);   // §9.2 (ghost.js)
//   r.layerInfo(kind) → légende du calque ; r.setLayerPattern(on) → hachures (mode daltonien);  // §10.3
//   r.setSpecies(eco.species, eco.patches); r.setEcology({ air, water });                       // §10.3
//   r.stats() → { calls, triangles, frameMs, …, ghost: { visible, dashes, highlights } }; r.dispose();
//
// Mode économie : `render` ne redessine que si quelque chose a changé (`dirty`) ou si une animation
// est en cours (`setAnimating(true)`), la boucle appelante choisit la cadence (60 i/s en interaction,
// 30 au repos). Perte de contexte WebGL : rendu suspendu puis repris à la restauration.

import * as THREE from 'three';
import { createScenery } from './scenery.js';
import { PALETTE } from '../data/palette.js';
import * as Camera from './camera.js';
import { loadModels } from './models.js';
import { createGround } from './ground.js';
import { createBuildings } from './buildings.js';
import { createRoads } from './roads.js';
import { createEffects } from './effects.js';
import { createActorsLayer } from './actors.js';
import { createGhost } from './ghost.js';
import { createSpeciesMarkers } from './species.js';
import { layerColors, layerInfo as layerLegend, normalizeLayerValues } from './layers.js';

/** Direction du soleil (du centre de la carte vers la lumière) : ouest-sud-ouest, haut. */
const SUN_DIRECTION = new THREE.Vector3(-0.62, 1.0, 0.42).normalize();
const SUN_DISTANCE = 40;

/**
 * Crée le rendu. options : { manifestUrl = 'assets/models/manifest.json', pixelRatioMax = 2,
 * shadows = true, shadowMapSize = 2048, markings = true, background = '#e1ead6',
 * modelFor (bâtiment → identifiant de modèle), strategy ('batched' | 'instanced' | 'auto'),
 * fetch (injection pour les tests), yaw / pitch (radians) }.
 * Rejette seulement si WebGL2 est indisponible.
 */
export async function createRenderer(canvas, options = {}) {
  const {
    manifestUrl = 'assets/models/manifest.json',
    pixelRatioMax = 2,
    shadows = true,
    shadowMapSize = 2048,
    markings = true,
    background = '#e1ead6',
  } = options;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
    });
  } catch (err) {
    throw new Error(`WebGL2 indisponible : ${err && err.message ? err.message : err}`);
  }
  renderer.setPixelRatio(Math.min(pixelRatioMax, (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1) || 1));
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap a disparu en r186
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;     // couleurs de la palette fidèles
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const multiDraw = renderer.extensions.has('WEBGL_multi_draw');
  const strategy = options.strategy && options.strategy !== 'auto'
    ? options.strategy
    : (multiDraw ? 'batched' : 'instanced');

  // --- Scène, lumières ----------------------------------------------------------------------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);

  const hemi = new THREE.HemisphereLight(0xfff5e5, 0xb4c9a3, 1.65);
  const sun = new THREE.DirectionalLight(0xffefcf, 2.8);
  sun.castShadow = shadows;
  sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 3;
  scene.add(hemi, sun, sun.target);

  // --- Caméra -------------------------------------------------------------------------------
  const threeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 200);
  let camState = Camera.createCameraState({
    yaw: options.yaw ?? Camera.DEFAULT_YAW_DEG * Math.PI / 180,
    pitch: options.pitch ?? Camera.DEFAULT_PITCH_DEG * Math.PI / 180,
  });
  let viewport = { width: Math.max(1, canvas.clientWidth || canvas.width || 1), height: Math.max(1, canvas.clientHeight || canvas.height || 1) };
  let world = null;
  /** Zones couvertes par l'interface (px CSS) : le cadrage centre la carte dans la zone libre. */
  let insets = { top: 0, bottom: 0, left: 0, right: 0, ...(options.insets || {}) };
  let dirty = true;
  let animating = false;
  let contextLost = false;
  let disposed = false;
  let firstWorld = true;
  const last = { calls: 0, triangles: 0, frameMs: 0, frames: 0 };

  function applyCamera() {
    const p = Camera.projectionParams(camState, viewport);
    threeCamera.left = p.left; threeCamera.right = p.right; threeCamera.top = p.top; threeCamera.bottom = p.bottom;
    threeCamera.near = p.near; threeCamera.far = p.far;
    threeCamera.position.set(p.position[0], p.position[1], p.position[2]);
    threeCamera.up.set(0, 1, 0);
    threeCamera.lookAt(p.target[0], p.target[1], p.target[2]);
    threeCamera.updateProjectionMatrix();
    threeCamera.updateMatrixWorld();
    dirty = true;
  }

  function setCameraState(next) {
    if (next === camState) return;
    camState = world ? Camera.clamp(next, world, viewport) : next;
    applyCamera();
  }

  // --- Contenu ------------------------------------------------------------------------------
  const models = await loadModels(manifestUrl, { fetch: options.fetch });
  const ground = createGround();
  const scenery = createScenery();
  scene.add(scenery.group);
  const buildings = createBuildings(models, { strategy, modelFor: options.modelFor, shadows });
  const roads = createRoads(models, { markings });
  // Effets animés (étape 2) : fumée des cheminées, pales des éoliennes ; l'eau animée vit dans ground.
  const fx = createEffects(models, { palette: PALETTE, shadows });
  // Acteurs (habitants, véhicules, faune) : la simulation vit dans src/core/actors.js ; ici on l'affiche.
  const actorsLayer = createActorsLayer(models, { maxSkinned: options.maxSkinned ?? 8, manifestUrl: options.manifestUrl });
  // Fantôme de pose, cadre et pointillés de raccordement, surbrillance des cases (étape 3, §9.2).
  const ghost = createGhost(models, { palette: PALETTE });
  // Icônes des espèces présentes au-dessus de leurs parcelles (étape 4, §10.3).
  const speciesMarkers = createSpeciesMarkers(models, { palette: PALETTE });
  scene.add(ground.group, buildings.group, roads.group, fx.group, actorsLayer.group, ghost.group, speciesMarkers.group);
  let actors = null;   // état des acteurs fourni par setActors (lecture seule)
  let elapsed = 0;     // temps d'animation cumulé (s)
  const upd = { ms: 0 }; // temps CPU de la mise à jour des couches animées

  let layer = { kind: 'none', values: null, pattern: false };
  /** Valeurs du calque normalisées (0 à 1), réutilisées d'un mois à l'autre pour les hachures. */
  let layerNorm = null;
  /** Dernier état d'écologie reçu : champs par case (brume, teinte de l'eau) et espèces présentes. */
  let ecology = { air: null, water: null };
  let ecoSpecies = { species: null, patches: null };

  /** Ajuste le frustum de l'ombre au volume de la carte (ombre statique, nette, sans gaspillage). */
  function fitShadow() {
    if (!world || !shadows) return;
    const cx = world.cols / 2, cz = world.rows / 2;
    sun.target.position.set(cx, 0, cz);
    sun.position.copy(SUN_DIRECTION).multiplyScalar(SUN_DISTANCE).add(sun.target.position);
    sun.target.updateMatrixWorld();
    sun.updateMatrixWorld();
    const view = new THREE.Matrix4().lookAt(sun.position, sun.target.position, new THREE.Vector3(0, 1, 0));
    view.setPosition(sun.position);
    view.invert();
    const v = new THREE.Vector3();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const x of [0, world.cols]) for (const z of [0, world.rows]) for (const y of [Camera.WORLD_BOTTOM, Camera.WORLD_TOP]) {
      v.set(x, y, z).applyMatrix4(view);
      minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
      minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z);
    }
    const cam = sun.shadow.camera;
    const m = 0.5;
    cam.left = minX - m; cam.right = maxX + m; cam.bottom = minY - m; cam.top = maxY + m;
    cam.near = Math.max(0.1, -maxZ - m); cam.far = -minZ + m;
    cam.updateProjectionMatrix();
    sun.shadow.needsUpdate = true;
  }

  function applyLayer() {
    const base = ground.baseColors();
    const colors = base ? layerColors(layer.kind, layer.values, base) : null;
    ground.setTileColors(colors);
    // Hachures du mode daltonien : la même valeur, normalisée, en attribut d'instance du sol.
    const active = layer.kind && layer.kind !== 'none' && layer.values;
    layerNorm = active ? normalizeLayerValues(layer.values, layerNorm) : null;
    ground.setLayerValues(layerNorm);
    dirty = true;
  }

  /** Brume d'air vicié et teinte de l'eau d'après le dernier `setEcology`. */
  function applyEcology() {
    fx.setAir(ecology.air);
    ground.setWaterQuality(ecology.water);
    dirty = true;
  }

  // --- Perte de contexte --------------------------------------------------------------------
  function onContextLost(event) {
    event.preventDefault();
    contextLost = true;
  }
  function onContextRestored() {
    contextLost = false;
    if (shadows) sun.shadow.needsUpdate = true;
    dirty = true;
  }
  canvas.addEventListener('webglcontextlost', onContextLost, false);
  canvas.addEventListener('webglcontextrestored', onContextRestored, false);

  // --- API ----------------------------------------------------------------------------------
  const cameraApi = {
    get state() { return camState; },
    setState(next) { setCameraState(next); },
    pan(dxCss, dyCss) { setCameraState(Camera.pan(camState, dxCss, dyCss, viewport)); },
    zoomAt(factor, cxCss, cyCss) { setCameraState(Camera.zoomAt(camState, factor, cxCss, cyCss, viewport, world)); },
    fitAll(fitOptions = {}) {
      if (!world) return;
      camState = Camera.fitAll(camState, world, viewport, { insets, ...fitOptions });
      applyCamera();
    },
    /** Vue rapprochée centrée sur la case (x, y) (centre de la case), `zoom` = largeur visible en unités. */
    lookAt(x, y, zoom, options = {}) {
      if (!world) return;
      camState = Camera.lookAt(camState, world, viewport, x + 0.5, y + 0.5, zoom, { insets, ...options });
      applyCamera();
    },
    /** Point du sol sous un point écran (coordonnées client). */
    ground(clientX, clientY) {
      const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
      return Camera.pickGround(camState, clientX, clientY, { ...viewport, left: rect.left, top: rect.top });
    },
    /** Position écran (px CSS relatifs au canvas) d'un point du monde. */
    toScreen(x, y, z) { return Camera.worldToScreen(camState, viewport, x, y, z); },
  };

  const api = {
    /** Accès de débogage (fixture de mesure, outils) ; pas pour l'interface. */
    debug: { scene, camera: threeCamera, renderer, models, ground, buildings, roads, sun, ghost, fx, species: speciesMarkers },
    camera: cameraApi,
    get world() { return world; },
    get strategy() { return strategy; },

    setWorld(nextWorld) {
      world = nextWorld;
      fx.setWorld(world);
      actorsLayer.setWorld(world);
      ghost.setWorld(world);
      animating = true; // vallée vivante : eau, fumée, pales, acteurs
      ground.setWorld(world);
      scenery.setWorld(world);
      buildings.setWorld(world);
      roads.setWorld(world);
      fitShadow();
      applyLayer();
      speciesMarkers.setWorld(world);
      applyEcology();
      if (firstWorld) { firstWorld = false; cameraApi.fitAll(); } else { setCameraState(Camera.clamp(camState, world, viewport)); }
      dirty = true;
    },

    /** Marges d'interface (barre du haut, onglets) en px CSS ; recadre si la carte entière est visible. */
    setInsets(next) {
      const prev = insets;
      insets = { top: 0, bottom: 0, left: 0, right: 0, ...(next || {}) };
      if (!world) return;
      const wasFit = Math.abs(camState.zoom - Camera.fitZoom(world, viewport, camState, { insets: prev })) < 1e-6;
      if (wasFit) cameraApi.fitAll();
    },

    setLayer(kind, values) {
      layer = { ...layer, kind: kind || 'none', values: values || null };
      applyLayer();
    },

    /**
     * Légende du calque (§10.3) : { kind, label, unit, min, max, stops: [{ value, hex, label }] }.
     * Sans argument, celle du calque actif ; `none` renvoie une légende vide.
     */
    layerInfo(kind) { return layerLegend(kind === undefined ? layer.kind : kind); },

    /** Mode daltonien : hachures diagonales par bandes de valeur, en plus de la couleur. */
    setLayerPattern(on) {
      layer.pattern = Boolean(on);
      ground.setLayerPattern(layer.pattern);
      dirty = true;
    },
    get layerPattern() { return layer.pattern; },

    /**
     * Espèces présentes et parcelles (`eco.species`, `eco.patches`) : une icône au-dessus de chaque
     * parcelle habitée, avec son animation d'apparition ou de disparition.
     */
    setSpecies(species, patches) {
      ecoSpecies = { species: species || null, patches: patches || null };
      speciesMarkers.set(ecoSpecies.species, ecoSpecies.patches);
      dirty = true;
    },

    /**
     * Ambiance écologique (§10.3) : `{ air, water }` (champs par case de `eco`) → voile de brume
     * au-dessus des cases dont l'air dépasse 50, eau qui verdit quand la pollution monte.
     */
    setEcology(eco) {
      ecology = { air: (eco && eco.air) || null, water: (eco && eco.water) || null };
      applyEcology();
    },

    resize(widthCss, heightCss, dpr) {
      const w = Math.max(1, Math.round(widthCss)), h = Math.max(1, Math.round(heightCss));
      viewport = { width: w, height: h };
      renderer.setPixelRatio(Math.min(pixelRatioMax, dpr || 1));
      renderer.setSize(w, h, false);
      if (world) camState = Camera.clamp(camState, world, viewport);
      applyCamera();
    },

    pick(clientX, clientY) {
      const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
      return Camera.pickTile(camState, clientX, clientY, { ...viewport, left: rect.left, top: rect.top }, world);
    },

    /** Demande explicitement une nouvelle image (après un changement externe). */
    invalidate() { dirty = true; },
    setEvening(on) {
      sun.color.set(on ? '#ffc68a' : '#ffefcf'); sun.intensity = on ? 1.7 : 2.8;
      hemi.color.set(on ? '#c5c6f2' : '#fff5e5'); hemi.intensity = on ? 1.2 : 1.65;
      scene.background.set(on ? '#c9d0d7' : background); dirty = true;
    },
    /** Fournit l'état des acteurs à afficher (objet de src/core/actors.js, mis à jour par l'appelant). */
    setActors(next) { actors = next || null; dirty = true; },
    /** Animation en cours : redessine à chaque appel de `render` (acteurs, étape 2). */
    setAnimating(flag) { animating = Boolean(flag); },
    /**
     * Fantôme de pose (§9.2) : { x, y, tileId, ok: true | false | 'warn', path: [{ kind, x, y, value }], yaw (degrés),
     * level, variant, modelId } ; null le cache. Un seul objet mis à jour sans reconstruire le monde.
     */
    setGhost(g) { ghost.set(g || null); ground.setGridHint(g || null); dirty = true; },
    /** Cases marquées d'un cadre jaune (sélection, fiche) : [{ x, y }] ; null ou [] efface. */
    setHighlight(cells) { ghost.setHighlight(cells || null); dirty = true; },
    get needsRender() { return dirty || animating; },

    render(dt = 0) {
      if (disposed || contextLost) return false;
      if (!dirty && !animating) return false;
      const t0 = performance.now();
      if (animating && dt > 0) {
        const tu = performance.now();
        elapsed += dt;
        fx.update(dt, elapsed);
        if (typeof ground.update === 'function') ground.update(dt);
        if (actors) actorsLayer.update(dt, actors);
        ghost.update(dt);
        upd.ms = performance.now() - tu;
      }
      // Les panneaux d'espèces suivent la caméra : à réorienter même sans animation en cours.
      speciesMarkers.update(animating && dt > 0 ? dt : 0, threeCamera);
      renderer.render(scene, threeCamera);
      last.frameMs = performance.now() - t0;
      last.calls = renderer.info.render.calls;
      last.triangles = renderer.info.render.triangles;
      last.frames++;
      dirty = false;
      return true;
    },

    stats() {
      return {
        calls: last.calls,
        triangles: last.triangles,
        frameMs: last.frameMs,
        frames: last.frames,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        programs: renderer.info.programs ? renderer.info.programs.length : 0,
        pixelRatio: renderer.getPixelRatio(),
        strategy,
        multiDraw,
        buildings: { ...buildings.stats },
        roads: { ...roads.stats },
        ground: { ...ground.stats },
        effects: fx.stats ? fx.stats() : null,
        actors: actorsLayer.stats ? actorsLayer.stats() : null,
        ghost: ghost.stats(),
        species: speciesMarkers.stats(),
        layer: { kind: layer.kind, pattern: layer.pattern },
        layersUpdateMs: upd.ms,
        models: { loaded: models.ids.length, errors: models.errors.length },
      };
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener('webglcontextlost', onContextLost, false);
      canvas.removeEventListener('webglcontextrestored', onContextRestored, false);
      speciesMarkers.dispose();
      ghost.dispose();
      actorsLayer.dispose();
      fx.dispose();
      buildings.dispose();
      roads.dispose();
      ground.dispose();
      scenery.dispose();
      models.dispose();
      if (sun.shadow.map) sun.shadow.map.dispose();
      renderer.dispose();
    },
  };

  applyCamera();
  return api;
}
