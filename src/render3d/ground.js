// Sol de la vallée : une `InstancedMesh` de boîtes 1 × 1 (une par case de terre) colorées par terrain
// via `instanceColor`, les collines en boîtes plus hautes, un socle sous la carte (diorama), et l'EAU
// ANIMÉE (docs/ARCHITECTURE.md §8.3) : une `InstancedMesh` de plans 1 × 1 pour la rivière et les lacs
// (surface à y = −0,05) et une autre, mince pellicule posée sur la terre, pour les zones humides (eau peu
// profonde). Les deux partagent un `MeshLambertMaterial` modifié par `onBeforeCompile` : ondulation de la
// hauteur (deux fréquences, amplitude 0,015 u), bandes claires qui défilent dans le sens du courant
// (`tile.flow`, 0,25 u/s), léger scintillement, et écume (fin liseré clair) le long des côtés bordés de
// terre. `update(dt)` avance l'horloge du shader ; deux appels de dessin pour toute l'eau, sans ombre portée.
// Les fonctions `flowVector`, `bankMask`, `bankVector` sont pures (testables sous Node).
//
// Repère : la case (x, y) couvre [x, x+1] × [y, y+1] en (X, Z) ; le dessus de la terre est à y = 0 ;
// nord = −Z, est = +X.

import * as THREE from 'three';
import { PALETTE } from '../data/palette.js';
import { TERRAINS } from '../data/terrain.js';
import { hashUnit, lerp, composeScaled } from './util.js';

/** Épaisseur des boîtes de terre (visible sur les berges et au bord de la carte). */
export const LAND_THICKNESS = 0.12;
/** Niveau de la surface de l'eau profonde (rivière, lac). */
export const WATER_LEVEL = -0.05;
/** Niveau de la pellicule d'eau des zones humides : au-dessus de la terre (0), sous les trottoirs (0,012). */
export const WETLAND_FILM_LEVEL = 0.006;
/** Hauteur des collines au-dessus du sol (min, max, tirée au hasard par case). */
export const HILL_HEIGHT = Object.freeze([0.22, 0.42]);
/** Profondeur du socle sous la terre. */
export const BASE_DEPTH = 0.5;
/** Amplitude de l'ondulation de l'eau profonde (u). */
export const WAVE_AMPLITUDE = 0.015;
/** Vitesse de défilement des bandes claires le long du courant (u/s). */
export const FLOW_SPEED = 0.25;
/** Style par type d'eau : [amplitude d'ondulation (u), intensité des bandes de courant (0 ou 1)]. */
export const WATER_STYLES = Object.freeze({
  river: Object.freeze([WAVE_AMPLITUDE, 1]),
  lake: Object.freeze([WAVE_AMPLITUDE, 0]),
  wetland: Object.freeze([0.0025, 0]),
});
/** Bits du masque des berges (`bankMask`) : côtés de la case bordés de terre. */
export const BANK_N = 1;
export const BANK_E = 2;
export const BANK_S = 4;
export const BANK_W = 8;

/** Couleur de repli si un terrain est inconnu du catalogue. */
const UNKNOWN_TERRAIN_COLOR = PALETTE.grass;

const FLOW_VECTORS = Object.freeze({ N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] });

/** Couleur (« #rrggbb ») d'un terrain. */
export function terrainColorHex(terrainId) {
  const def = TERRAINS[terrainId];
  return (def && PALETTE[def.color]) || UNKNOWN_TERRAIN_COLOR;
}

/** Vrai si la case se rend comme une étendue d'eau profonde (rivière, lac). La zone humide reste de la terre. */
export function isWaterTerrain(terrainId) {
  return terrainId === 'river' || terrainId === 'lake';
}

/** Vrai si la case porte une pellicule d'eau peu profonde (zone humide). */
export function isShallowWater(terrainId) {
  return terrainId === 'wetland';
}

/** Direction unitaire du courant d'après `tile.flow` : N = −Z, E = +X, S = +Z, W = −X ; [0, 0] sinon (lac). */
export function flowVector(dir) {
  const v = FLOW_VECTORS[dir];
  return v ? [v[0], v[1]] : [0, 0];
}

/**
 * Masque des berges d'une case d'eau : bits N (1), E (2), S (4), W (8) levés pour chaque côté bordé
 * de terre (toute case qui n'est pas de l'eau profonde ; la zone humide compte comme une berge).
 * Hors de la carte, l'eau continue : pas d'écume au bord du monde.
 */
export function bankMask(world, x, y) {
  const land = (nx, ny) => {
    if (nx < 0 || ny < 0 || nx >= world.cols || ny >= world.rows) return false;
    const t = world.tiles[ny * world.cols + nx];
    return !t || !isWaterTerrain(t.terrain);
  };
  let mask = 0;
  if (land(x, y - 1)) mask |= BANK_N;
  if (land(x + 1, y)) mask |= BANK_E;
  if (land(x, y + 1)) mask |= BANK_S;
  if (land(x - 1, y)) mask |= BANK_W;
  return mask;
}

/** Masque des berges → [n, e, s, w] (0 ou 1), l'attribut `aBanks` du shader. */
export function bankVector(mask) {
  return [mask & BANK_N ? 1 : 0, mask & BANK_E ? 1 : 0, mask & BANK_S ? 1 : 0, mask & BANK_W ? 1 : 0];
}

/** Hauteur du sommet d'une colline (déterministe par case). */
export function hillHeight(world, x, y) {
  return lerp(HILL_HEIGHT[0], HILL_HEIGHT[1], hashUnit(world.seed || 0, x, y, 7));
}

/** Altitude de la surface sur laquelle poser un décor ou un bâtiment en (x, y). */
export function surfaceHeight(world, x, y) {
  const tile = world.tiles[y * world.cols + x];
  if (!tile) return 0;
  if (tile.terrain === 'hill') return hillHeight(world, x, y);
  if (isWaterTerrain(tile.terrain)) return WATER_LEVEL;
  return 0;
}

// ---------------------------------------------------------------------------------------------
// Matériau de l'eau : Lambert modifié par onBeforeCompile (GLSL ES 3.0 via les #define de three.js)
// ---------------------------------------------------------------------------------------------

const WATER_VERTEX_PARS = /* glsl */`
uniform float uTime;
attribute vec2 aFlow;
attribute vec4 aBanks;
attribute vec2 aStyle;
varying vec2 vWaterPos;
varying vec2 vLocalPos;
varying vec2 vFlow;
varying vec4 vBanks;
varying vec2 vStyle;
`;

const WATER_VERTEX_BODY = /* glsl */`
vec3 transformed = vec3( position );
{
	vec4 wp = vec4( position, 1.0 );
	#ifdef USE_INSTANCING
		wp = instanceMatrix * wp;
	#endif
	wp = modelMatrix * wp;
	vWaterPos = wp.xz;
	vLocalPos = position.xz;
	vFlow = aFlow;
	vBanks = aBanks;
	vStyle = aStyle;
	// Ondulation douce : deux fréquences croisées, fonction de la position monde (continue d'une case à l'autre).
	float w1 = sin( wp.x * 6.1 + wp.z * 2.3 + uTime * 1.9 );
	float w2 = sin( wp.x * 2.7 - wp.z * 5.3 - uTime * 1.3 );
	transformed.y += aStyle.x * ( 0.6 * w1 + 0.4 * w2 );
}
`;

const WATER_FRAGMENT_PARS = /* glsl */`
uniform float uTime;
varying vec2 vWaterPos;
varying vec2 vLocalPos;
varying vec2 vFlow;
varying vec4 vBanks;
varying vec2 vStyle;
`;

/** Corps du fragment, inséré après `color_fragment` (diffuseColor porte déjà la couleur d'instance). */
const WATER_FRAGMENT_BODY = /* glsl */`
{
	// Bandes claires qui défilent dans le sens du courant (FLOW_SPEED u/s) ; nulles sur l'eau dormante (aStyle.y = 0).
	float along = dot( vWaterPos, vFlow );
	float across = vWaterPos.x * vFlow.y - vWaterPos.y * vFlow.x;
	float phase = ( along - uTime * ${FLOW_SPEED.toFixed(3)} ) * 12.566 + sin( across * 4.0 + uTime * 0.6 ) * 0.8;
	float bands = smoothstep( 0.45, 0.95, sin( phase ) ) * 0.22 * vStyle.y;
	// Scintillement : deux ondes croisées, lentes et gauchies l'une par l'autre (pas de grille régulière), sur toute eau.
	float sx = sin( vWaterPos.x * 9.0 + uTime * 1.5 + sin( vWaterPos.y * 3.1 + uTime * 0.5 ) * 1.7 );
	float sz = sin( vWaterPos.y * 7.0 - uTime * 1.1 + sin( vWaterPos.x * 2.3 - uTime * 0.4 ) * 1.9 );
	float shimmer = smoothstep( 0.6, 1.0, sx * sz ) * 0.07;
	// Écume : fin liseré clair le long des côtés bordés de terre (nord = z local −0,5, est = x local +0,5).
	float edge = 0.075 + 0.02 * sin( ( vWaterPos.x + vWaterPos.y ) * 9.0 + uTime * 1.4 );
	float foam = 0.0;
	foam = max( foam, vBanks.x * ( 1.0 - smoothstep( 0.0, edge, 0.5 + vLocalPos.y ) ) );
	foam = max( foam, vBanks.y * ( 1.0 - smoothstep( 0.0, edge, 0.5 - vLocalPos.x ) ) );
	foam = max( foam, vBanks.z * ( 1.0 - smoothstep( 0.0, edge, 0.5 - vLocalPos.y ) ) );
	foam = max( foam, vBanks.w * ( 1.0 - smoothstep( 0.0, edge, 0.5 + vLocalPos.x ) ) );
	foam *= 0.75 + 0.25 * sin( uTime * 2.1 + along * 7.0 );
	float light = clamp( bands + shimmer + foam * 0.6, 0.0, 0.85 );
	diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 1.0 ), light );
}
`;

/**
 * Matériau partagé par toute l'eau : { material, uniforms } ; `uniforms.uTime.value` est l'horloge (s).
 * La couleur vient de `instanceColor` (terrain ou calque), un léger éclat propre éclaircit l'eau.
 */
export function createWaterMaterial() {
  const uniforms = { uTime: { value: 0 } };
  const material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(PALETTE.river).multiplyScalar(0.22),
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = WATER_VERTEX_PARS + shader.vertexShader.replace('#include <begin_vertex>', WATER_VERTEX_BODY);
    shader.fragmentShader = WATER_FRAGMENT_PARS + shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n' + WATER_FRAGMENT_BODY);
  };
  material.customProgramCacheKey = () => 'tiletown-water-2';
  return { material, uniforms };
}

// ---------------------------------------------------------------------------------------------
// Sol
// ---------------------------------------------------------------------------------------------

/**
 * Crée le sol. API : { group, setWorld(world), update(dt), setTime(t), time, setTileColors(rgb | null),
 * baseColors(), stats, dispose() }.
 * `setTileColors` reçoit un Float32Array (3 valeurs linéaires par case) pour les calques, ou null
 * pour revenir aux couleurs de terrain. `update(dt)` fait avancer l'eau (à appeler avant chaque image animée).
 */
export function createGround() {
  const group = new THREE.Group();
  group.name = 'ground';

  const landGeometry = new THREE.BoxGeometry(1, 1, 1);
  const landMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  // Plan d'eau 1 × 1 à 2 × 2 segments (neuf sommets) : assez pour que l'ondulation se voie.
  const waterTemplate = new THREE.PlaneGeometry(1, 1, 2, 2);
  waterTemplate.rotateX(-Math.PI / 2);
  const { material: waterMaterial, uniforms } = createWaterMaterial();
  const baseMaterial = new THREE.MeshLambertMaterial({ color: new THREE.Color(PALETTE.soil).multiplyScalar(0.72) });
  const baseGeometry = new THREE.BoxGeometry(1, 1, 1);
  const riverColor = new THREE.Color(PALETTE.river);

  let land = null;
  let water = null;   // rivière + lacs
  let film = null;    // zones humides
  let base = null;
  let world = null;
  /** Par case : index d'instance dans `land` (≥ 0) ou dans `water` (codé −(i + 1)). */
  let slots = null;
  /** Par case : index d'instance dans `film` (zone humide), −1 sinon. */
  let filmSlots = null;
  /** Couleurs de terrain par case (linéaires), référence pour les calques. */
  let colors = null;
  const stats = { tiles: 0, land: 0, water: 0, wetland: 0, hills: 0, drawables: 0 };

  const color = new THREE.Color();
  const tint = new THREE.Color();
  const matrix = new THREE.Matrix4();

  /** Teinte de la pellicule des zones humides : la couleur de la case, à moitié vers l'eau courante. */
  function filmTint(out, src) {
    return out.copy(src).lerp(riverColor, 0.5);
  }

  /** InstancedMesh d'eau avec ses attributs par instance (aFlow, aBanks, aStyle). */
  function createWaterMesh(name, count) {
    const m = Math.max(1, count);
    const geometry = waterTemplate.clone();
    geometry.setAttribute('aFlow', new THREE.InstancedBufferAttribute(new Float32Array(m * 2), 2));
    geometry.setAttribute('aBanks', new THREE.InstancedBufferAttribute(new Float32Array(m * 4), 4));
    geometry.setAttribute('aStyle', new THREE.InstancedBufferAttribute(new Float32Array(m * 2), 2));
    const mesh = new THREE.InstancedMesh(geometry, waterMaterial, m);
    mesh.name = name;
    mesh.count = count;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.visible = count > 0;
    return mesh;
  }

  /** Écrit les attributs d'une instance d'eau. */
  function writeWaterAttributes(mesh, k, style, flow, mask) {
    const a = mesh.geometry.attributes;
    const f = flowVector(flow);
    a.aFlow.array[k * 2] = f[0]; a.aFlow.array[k * 2 + 1] = f[1];
    const b = bankVector(mask);
    for (let c = 0; c < 4; c++) a.aBanks.array[k * 4 + c] = b[c];
    a.aStyle.array[k * 2] = style[0]; a.aStyle.array[k * 2 + 1] = style[1];
  }

  function clear() {
    for (const mesh of [land, water, film, base]) {
      if (!mesh) continue;
      group.remove(mesh);
      if (mesh === water || mesh === film) mesh.geometry.dispose(); // géométrie propre à ce monde (attributs d'instances)
    }
    land = water = film = base = null;
    stats.drawables = 0;
  }

  function setWorld(nextWorld) {
    clear();
    world = nextWorld;
    const { cols, rows, tiles } = world;
    const n = cols * rows;
    slots = new Int32Array(n);
    filmSlots = new Int32Array(n).fill(-1);
    colors = new Float32Array(n * 3);

    let landCount = 0, waterCount = 0, wetCount = 0, hillCount = 0;
    for (let i = 0; i < n; i++) {
      const t = tiles[i];
      if (t && isWaterTerrain(t.terrain)) waterCount++; else landCount++;
      if (t && t.terrain === 'hill') hillCount++;
      if (t && isShallowWater(t.terrain)) wetCount++;
    }

    land = new THREE.InstancedMesh(landGeometry, landMaterial, Math.max(1, landCount));
    land.name = 'land';
    land.castShadow = true;    // les collines et les berges portent une ombre
    land.receiveShadow = true;
    land.frustumCulled = false;
    water = createWaterMesh('water', waterCount);
    film = createWaterMesh('wetland-film', wetCount);

    let li = 0, wi = 0, fi = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const t = tiles[i];
        const terrain = t ? t.terrain : 'grass';
        color.set(terrainColorHex(terrain));
        color.toArray(colors, i * 3);
        if (isWaterTerrain(terrain)) {
          composeScaled(matrix, x + 0.5, WATER_LEVEL, y + 0.5, 1, 1, 1);
          water.setMatrixAt(wi, matrix);
          water.setColorAt(wi, color);
          writeWaterAttributes(water, wi, WATER_STYLES[terrain] || WATER_STYLES.lake, t ? t.flow : null, bankMask(world, x, y));
          slots[i] = -(wi + 1);
          wi++;
        } else {
          const top = terrain === 'hill' ? hillHeight(world, x, y) : 0;
          const h = top + LAND_THICKNESS;
          composeScaled(matrix, x + 0.5, top - h / 2, y + 0.5, 1, h, 1);
          land.setMatrixAt(li, matrix);
          land.setColorAt(li, color);
          slots[i] = li;
          li++;
          if (isShallowWater(terrain)) {
            composeScaled(matrix, x + 0.5, WETLAND_FILM_LEVEL, y + 0.5, 1, 1, 1);
            film.setMatrixAt(fi, matrix);
            film.setColorAt(fi, filmTint(tint, color));
            writeWaterAttributes(film, fi, WATER_STYLES.wetland, null, 0);
            filmSlots[i] = fi;
            fi++;
          }
        }
      }
    }
    land.count = landCount;
    land.instanceMatrix.needsUpdate = true;
    if (land.instanceColor) land.instanceColor.needsUpdate = true;
    for (const mesh of [water, film]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      for (const name of ['aFlow', 'aBanks', 'aStyle']) mesh.geometry.attributes[name].needsUpdate = true;
    }

    // Socle : diorama posé sur la table, affleurant les bords de la carte.
    base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.name = 'base';
    base.scale.set(cols, BASE_DEPTH, rows);
    base.position.set(cols / 2, -LAND_THICKNESS - BASE_DEPTH / 2, rows / 2);
    base.receiveShadow = true;

    group.add(land, water, film, base);
    stats.tiles = n; stats.land = landCount; stats.water = waterCount; stats.wetland = wetCount; stats.hills = hillCount;
    stats.drawables = 2 + (waterCount > 0 ? 1 : 0) + (wetCount > 0 ? 1 : 0);
  }

  /** Applique des couleurs par case (Float32Array linéaire, 3 par case) ou restaure les terrains. */
  function setTileColors(rgb) {
    if (!world || !land || !water) return;
    const src = rgb || colors;
    const n = world.cols * world.rows;
    for (let i = 0; i < n; i++) {
      const s = slots[i];
      color.setRGB(src[i * 3], src[i * 3 + 1], src[i * 3 + 2]);
      if (s >= 0) land.setColorAt(s, color); else water.setColorAt(-s - 1, color);
      if (filmSlots[i] >= 0) film.setColorAt(filmSlots[i], filmTint(tint, color));
    }
    if (land.instanceColor) land.instanceColor.needsUpdate = true;
    if (water.instanceColor) water.instanceColor.needsUpdate = true;
    if (film.instanceColor) film.instanceColor.needsUpdate = true;
  }

  /** Fait avancer l'eau de `dt` secondes (rien d'autre à faire : l'ondulation et les bandes sont dans le shader). */
  function update(dt) {
    if (Number.isFinite(dt) && dt > 0) uniforms.uTime.value += dt;
  }

  function dispose() {
    clear();
    for (const g of [landGeometry, waterTemplate, baseGeometry]) g.dispose();
    for (const m of [landMaterial, waterMaterial, baseMaterial]) m.dispose();
  }

  return {
    group,
    stats,
    setWorld,
    update,
    /** Fixe l'horloge de l'eau (captures déterministes). */
    setTime(t) { uniforms.uTime.value = Number.isFinite(t) ? t : 0; },
    get time() { return uniforms.uTime.value; },
    /** Matériau de l'eau (débogage, mesure). */
    get waterMaterial() { return waterMaterial; },
    setTileColors,
    /** Copie des couleurs de terrain (linéaires) par case. */
    baseColors() { return colors ? colors.slice() : null; },
    dispose,
  };
}
