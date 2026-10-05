// Sol de la vallée. Depuis l'étape 5 (docs/ARCHITECTURE.md §11.4) la terre n'est plus une
// `InstancedMesh` de boîtes : c'est UN SEUL MAILLAGE SOUDÉ, continu, tiré d'un champ de hauteur
// interpolé en douceur (smootherstep) entre les centres de cases. Conséquences voulues :
//   - les collines deviennent des DÔMES ARRONDIS qui courent sur plusieurs cases (plus de marches) ;
//   - les berges DESCENDENT EN PENTE vers l'eau et les coudes de rivière s'arrondissent tout seuls
//     (un coin de case entouré de terre remonte au-dessus du niveau de l'eau : l'angle droit disparaît) ;
//   - les couleurs de terrain se FONDENT d'une case à l'autre (couleur par sommet, interpolée) : une
//     forêt de plusieurs cases lit comme une seule forêt, pas comme un damier ;
//   - un micro-relief continu en coordonnées monde (creux seulement, jamais de bosse) casse les aplats
//     sans jamais faire léviter ce qui est posé à `surfaceHeight`.
// Le shader du sol ajoute, sans appel de dessin supplémentaire : grain d'herbe continu, affleurements
// rocheux sur les pentes raides, liseré de sable au bord de l'eau, ombre de contact (`aAo`) au pied des
// bâtiments et sous les bosquets, liseré de grille LOCAL pendant la pose (`setGridHint`), et les
// hachures du mode daltonien (inchangées).
//
// L'EAU reste deux `InstancedMesh` de plans 1 × 1 (rivière et lacs à `WATER_LEVEL`, pellicule des zones
// humides à `WETLAND_FILM_LEVEL`) partageant un `MeshLambertMaterial` modifié par `onBeforeCompile` :
// ondulation, sens du courant, écume des berges, eau qui verdit avec la pollution. Depuis l'étape 5 les
// bandes claires et le scintillement sont BEAUCOUP PLUS DISCRETS : le courant reste lisible, il n'attire
// plus l'œil. `update(dt)` avance l'horloge du shader.
//
// ÉCOLOGIE (§10.3), inchangé côté appelant :
//   `setLayerValues(norm)` + `setLayerPattern(on)` : hachures du mode daltonien (attribut `aLayer`) ;
//   `setWaterQuality(values)` : l'eau glisse vers un vert trouble (attribut d'instance `aQuality`).
//
// Repère : la case (x, y) couvre [x, x+1] × [y, y+1] en (X, Z) ; le dessus de la terre plate est à
// y = 0 ; nord = −Z, est = +X. Fonctions pures (testables sous Node) : `flowVector`, `bankMask`,
// `bankVector`, `hillHeight`, `surfaceHeight`, `heightAt`, `terrainColorHex`.

import * as THREE from 'three';
import { PALETTE } from '../data/palette.js';
import { TERRAINS } from '../data/terrain.js';
import { hashUnit, lerp, composeScaled } from './util.js';
import { LAYER_BANDS, HATCH_CYCLES, valueScale, layerNormalized } from './layers.js';

/** Épaisseur de référence de la terre (le socle commence là ; roads.js s'en sert pour les piles de pont). */
export const LAND_THICKNESS = 0.12;
/** Niveau de la surface de l'eau profonde (rivière, lac). Abaissé à l'étape 5 : la berge se voit. */
export const WATER_LEVEL = -0.16;
/** Niveau de la pellicule d'eau des zones humides : au-dessus de la terre (0), sous les trottoirs (0,012). */
export const WETLAND_FILM_LEVEL = 0.006;
/** Hauteur des collines au-dessus du sol (min, max). Bruit COHÉRENT : les cases voisines se ressemblent. */
export const HILL_HEIGHT = Object.freeze([0.52, 1.10]);
/** Taille (en cases) d'un relief de colline : plus c'est grand, plus les dômes sont larges. */
export const HILL_SCALE = 3.4;
/** Part de hauteur gardée par une colline ISOLÉE : un massif monte en son cœur, un caillou reste bas. */
export const HILL_DOME_MIN = 0.5;
/** Profondeur du socle sous la terre. */
export const BASE_DEPTH = 0.5;
/** Fond de la jupe du diorama (le flanc du socle descend jusque-là). */
export const SKIRT_BOTTOM = -0.66;
/** Sommets par case et par axe : 4 → 16 quads par case, assez pour des dômes lisses. */
export const SUBDIV = 4;
/** Subdivision réduite au-delà de ce nombre de cases (grandes cartes). */
export const SUBDIV_LIMIT = 700;
/** Creux maximal du micro-relief continu (vers le BAS seulement : rien ne lévite jamais). */
export const DIP = 0.035;
/** Échelle du micro-relief, en cases. */
export const DIP_SCALE = 2.6;
/** Fond des rivières et des lacs (caché sous l'eau ; donne la pente de la berge). */
export const BED_RIVER = -0.38;
export const BED_LAKE = -0.50;
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
/** Teinte de l'eau polluée (vert trouble) : la couleur de base y glisse quand `eco.water` monte. */
export const WATER_MURKY = '#6f8a3a';
/** Teinte des hauts-fonds : l'eau pâlit et verdit au bord, d'un contour ondulé (la berge se lit). */
export const WATER_SHALLOW = '#a8dbe0';
/** Part maximale de vert trouble dans l'eau (eau à 100). */
export const WATER_MURKY_MIX = 0.72;
/** Contraste des hachures du mode daltonien (0 = invisible, 1 = noir ou blanc franc). */
export const HATCH_DARKEN = 0.5;
/** Force de l'ombre de contact au pied des objets (0 = aucune, 1 = noire). */
export const CONTACT_SHADOW = 0.3;
/** Bits du masque des berges (`bankMask`) : côtés de la case bordés de terre. */
export const BANK_N = 1;
export const BANK_E = 2;
export const BANK_S = 4;
export const BANK_W = 8;

/** Couleur de repli si un terrain est inconnu du catalogue. */
const UNKNOWN_TERRAIN_COLOR = PALETTE.grass;
/** Herbe rase des collines (entre l'herbe claire et la roche) : le relief se lit, pas le damier. */
const HILL_GRASS = '#9cc273';

const FLOW_VECTORS = Object.freeze({ N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] });

/** Couleur (« #rrggbb ») d'un terrain. */
export function terrainColorHex(terrainId) {
  const def = TERRAINS[terrainId];
  return (def && PALETTE[def.color]) || UNKNOWN_TERRAIN_COLOR;
}

/**
 * Couleur du SOL pour un terrain : comme `terrainColorHex`, sauf la colline, dont la nappe est de
 * l'herbe rase un peu sèche — la roche n'apparaît plus que par affleurements, sur les pentes raides
 * (shader du sol). Une colline toute grise se lisait comme un tas de cailloux carrés.
 */
export function groundColorHex(terrainId) {
  if (terrainId === 'hill') return HILL_GRASS;
  return terrainColorHex(terrainId);
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

// ---------------------------------------------------------------------------------------------
// Champ de hauteur (pur, testable) : collines arrondies, berges en pente, micro-relief continu
// ---------------------------------------------------------------------------------------------

/** Courbe de lissage de Perlin (C², dérivée nulle aux extrémités) : des pentes sans arête. */
function smootherstep(t) {
  const u = t < 0 ? 0 : t > 1 ? 1 : t;
  return u * u * u * (u * (u * 6 - 15) + 10);
}

const clampInt = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/** Bruit de valeur lissé, déterministe : même graine → même paysage, sur tout appareil. */
function valueNoise(seed, x, y, k = 0) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const tx = smootherstep(x - x0), ty = smootherstep(y - y0);
  const a = hashUnit(seed, x0, y0, k), b = hashUnit(seed, x0 + 1, y0, k);
  const c = hashUnit(seed, x0, y0 + 1, k), d = hashUnit(seed, x0 + 1, y0 + 1, k);
  return lerp(lerp(a, b, tx), lerp(c, d, tx), ty);
}

/**
 * Masse du massif autour d'une case : 1 au cœur d'un groupe de collines, `HILL_DOME_MIN` pour une
 * colline isolée. C'est ce qui donne un DÔME (haut au milieu, qui redescend sur les bords) plutôt
 * qu'un plateau à bords francs. Pur, voisinage 5 × 5 pondéré par 1 / (1 + d²).
 */
export function hillMass(world, x, y) {
  let sum = 0, total = 0;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const w = 1 / (1 + dx * dx + dy * dy);
      total += w;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= world.cols || ny >= world.rows) continue;
      const t = world.tiles[ny * world.cols + nx];
      if (t && t.terrain === 'hill') sum += w;
    }
  }
  const share = total > 0 ? sum / total : 0;
  return HILL_DOME_MIN + (1 - HILL_DOME_MIN) * smootherstep((share - 0.12) / 0.75);
}

/**
 * Hauteur du sommet d'une colline (déterministe par case). Bruit COHÉRENT à l'échelle de `HILL_SCALE`
 * (deux cases voisines se ressemblent) multiplié par la masse du massif (`hillMass`) : le maillage
 * soudé en fait UN dôme arrondi, pas un empilement de pavés.
 */
export function hillHeight(world, x, y) {
  const seed = (world && world.seed) | 0;
  const n = valueNoise(seed ^ 0x5eed, x / HILL_SCALE, y / HILL_SCALE, 7);
  return lerp(HILL_HEIGHT[0], HILL_HEIGHT[1], n) * hillMass(world, x, y);
}

/** Hauteur visée au CENTRE d'une case : l'eau creuse, la colline monte, le reste est à plat. */
function tileTarget(world, x, y) {
  const t = world.tiles[y * world.cols + x];
  const terrain = t ? t.terrain : 'grass';
  if (terrain === 'river') return BED_RIVER;
  if (terrain === 'lake') return BED_LAKE;
  if (terrain === 'hill') return hillHeight(world, x, y);
  return 0;
}

/** Champ de hauteur et masques d'un monde, calculés une fois et mémorisés (clé : l'objet monde). */
const FIELDS = new WeakMap();

function getField(world) {
  let f = FIELDS.get(world);
  if (f && f.cols === world.cols && f.rows === world.rows) return f;
  const { cols, rows } = world;
  const n = cols * rows;
  const h = new Float32Array(n);
  const flat = new Float32Array(n);   // 1 : surface tenue à plat (bâti, zone humide) — pas de micro-relief
  const water = new Uint8Array(n);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const t = world.tiles[i];
      h[i] = tileTarget(world, x, y);
      water[i] = t && isWaterTerrain(t.terrain) ? 1 : 0;
      flat[i] = t && (t.building || isShallowWater(t.terrain)) ? 1 : 0;
    }
  }
  // Le lissé de « à plat » déborde d'une case : une rue au bord d'un îlot ne flotte pas au-dessus d'un creux.
  const spread = new Float32Array(n);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let m = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const w = dx === 0 && dy === 0 ? 1 : (dx === 0 || dy === 0 ? 0.75 : 0.5);
          m = Math.max(m, flat[ny * cols + nx] * w);
        }
      }
      spread[y * cols + x] = m;
    }
  }
  f = { cols, rows, h, flat: spread, water, seed: (world.seed | 0) };
  FIELDS.set(world, f);
  return f;
}

/** Échantillonnage lissé (smootherstep) d'un champ centré sur les cases, en coordonnées monde. */
function sampleSmooth(field, cols, rows, x, z) {
  const fx = x - 0.5, fz = z - 0.5;
  const x0 = Math.floor(fx), z0 = Math.floor(fz);
  const tx = smootherstep(fx - x0), tz = smootherstep(fz - z0);
  const at = (gx, gz) => field[clampInt(gz, 0, rows - 1) * cols + clampInt(gx, 0, cols - 1)];
  const a = at(x0, z0), b = at(x0 + 1, z0), c = at(x0, z0 + 1), d = at(x0 + 1, z0 + 1);
  return lerp(lerp(a, b, tx), lerp(c, d, tx), tz);
}

/** Indices de case touchés par une coordonnée (deux sur une frontière exacte, un sinon, aucun hors carte). */
function tilesAtCoord(v, n, out) {
  out.length = 0;
  const k = Math.round(v);
  if (Math.abs(v - k) < 1e-6) {
    if (k - 1 >= 0 && k - 1 < n) out.push(k - 1);
    if (k >= 0 && k < n) out.push(k);
  } else {
    const i = Math.floor(v);
    if (i >= 0 && i < n) out.push(i);
  }
  return out;
}

const _xs = [], _zs = [];

/** Vrai si le point (x, z) est à l'intérieur de l'union des cases d'eau profonde (frontières comprises). */
function insideDeepWater(world, x, z) {
  const f = getField(world);
  tilesAtCoord(x, f.cols, _xs);
  tilesAtCoord(z, f.rows, _zs);
  if (!_xs.length || !_zs.length) return false;
  for (const tx of _xs) for (const tz of _zs) if (!f.water[tz * f.cols + tx]) return false;
  return true;
}

/**
 * HAUTEUR RÉELLE DU TERRAIN en coordonnées CONTINUES (x, z) : c'est la surface qu'on voit.
 * Entre deux centres de cases elle interpole en douceur ; elle creuse sous l'eau, et un micro-relief
 * continu (jamais une bosse, seulement un creux) casse les aplats sans faire léviter ce qui est posé.
 * Hors des cases d'eau, elle ne descend jamais sous `WATER_LEVEL` : le plan d'eau d'une case couvre
 * donc toujours exactement sa case, sans trou au bord. Ce raccord est la SEULE discontinuité de la
 * fonction (sur la frontière exacte d'une case d'eau) ; le maillage, lui, échantillonne la grille de
 * sommets et reste soudé — aucune fente n'apparaît.
 */
export function heightAt(world, x, z) {
  const f = getField(world);
  let h = sampleSmooth(f.h, f.cols, f.rows, x, z);
  const flat = sampleSmooth(f.flat, f.cols, f.rows, x, z);
  if (flat < 1) {
    const dip = valueNoise(f.seed ^ 0x51f1, x / DIP_SCALE, z / DIP_SCALE, 11);
    h -= DIP * dip * (1 - flat);
  }
  if (!insideDeepWater(world, x, z)) h = Math.max(h, WATER_LEVEL);
  return h;
}

/**
 * Altitude de la surface sur laquelle poser un décor ou un bâtiment en (x, y) — CONTRAT INCHANGÉ
 * (buildings.js, roads.js, actors.js, ghost.js, species.js) : 0 sur la terre plate, `WATER_LEVEL` sur
 * l'eau, `hillHeight` sur une colline. Le maillage passe exactement par cette valeur au centre des cases
 * bâties ; sur les cases naturelles le micro-relief peut creuser jusqu'à `DIP` sous elle (jamais au-dessus).
 */
export function surfaceHeight(world, x, y) {
  const tile = world.tiles[y * world.cols + x];
  if (!tile) return 0;
  if (tile.terrain === 'hill') return hillHeight(world, x, y);
  if (isWaterTerrain(tile.terrain)) return WATER_LEVEL;
  return 0;
}

// ---------------------------------------------------------------------------------------------
// Hachures du mode daltonien (partagées par la terre et l'eau)
// ---------------------------------------------------------------------------------------------

/** Déclarations communes aux shaders de sol : valeur du calque par instance et position monde. */
const HATCH_VERTEX_PARS = /* glsl */`
attribute float aLayer;
varying float vLayer;
varying vec2 vHatchPos;
`;

const HATCH_FRAGMENT_PARS = /* glsl */`
uniform float uPattern;
varying float vLayer;
varying vec2 vHatchPos;
`;

/**
 * Hachures diagonales (nord-ouest → sud-est) dont la densité dit la valeur du calque : 5 bandes, de
 * « aucune hachure » à « serrée » (layers.js : `layerBand`). `aLayer` vaut −1 hors calque : rien n'est
 * dessiné. Les traits assombrissent la couleur en place : lisibles sur l'eau comme sur les collines,
 * et sans appel de dessin de plus.
 */
const HATCH_FRAGMENT_BODY = /* glsl */`
if ( uPattern > 0.5 && vLayer >= 0.0 ) {
	float band = floor( min( vLayer, 0.999 ) * ${LAYER_BANDS.toFixed(1)} );
	float freq = band * ${HATCH_CYCLES.toFixed(3)};
	if ( freq > 0.0 ) {
		float s = ( vHatchPos.x + vHatchPos.y ) * freq;
		float f = abs( fract( s ) - 0.5 ) * 2.0;             // 1 au bord de la bande, 0 en son milieu
		float line = 1.0 - smoothstep( 0.1, 0.55, f );       // trait doux, large d'environ la moitié du cycle
		// L'encre contraste toujours : trait foncé sur une case claire, trait clair sur une case foncée.
		float lum = dot( diffuseColor.rgb, vec3( 0.299, 0.587, 0.114 ) );
		vec3 ink = mix( mix( diffuseColor.rgb, vec3( 1.0 ), ${HATCH_DARKEN.toFixed(3)} ), diffuseColor.rgb * ${(1 - HATCH_DARKEN).toFixed(3)}, step( 0.22, lum ) );
		diffuseColor.rgb = mix( diffuseColor.rgb, ink, line );
	}
}
`;

/** Corps de vertex commun : position monde de la case et valeur du calque (après `begin_vertex`). */
const HATCH_VERTEX_BODY = /* glsl */`
{
	vec4 hp = vec4( position, 1.0 );
	#ifdef USE_INSTANCING
		hp = instanceMatrix * hp;
	#endif
	hp = modelMatrix * hp;
	vHatchPos = hp.xz;
	vLayer = aLayer;
}
`;

// ---------------------------------------------------------------------------------------------
// Matériau de la terre : Lambert à couleurs de sommets + grain, roche, sable, ombre de contact, grille
// ---------------------------------------------------------------------------------------------

/** Bruit de valeur compact, partagé par les ajouts du fragment du sol. */
const NOISE_GLSL = /* glsl */`
float ttHash( vec2 p ) {
	return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453123 );
}
float ttNoise( vec2 p ) {
	vec2 i = floor( p ), f = fract( p );
	vec2 u = f * f * ( 3.0 - 2.0 * f );
	return mix( mix( ttHash( i ), ttHash( i + vec2( 1.0, 0.0 ) ), u.x ),
	            mix( ttHash( i + vec2( 0.0, 1.0 ) ), ttHash( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
}
`;

const LAND_VERTEX_PARS = /* glsl */`
attribute float aAo;
varying float vAo;
varying vec3 vLandPos;
varying vec3 vLandNormal;
`;

const LAND_VERTEX_BODY = /* glsl */`
{
	vAo = aAo;
	vLandPos = ( modelMatrix * vec4( position, 1.0 ) ).xyz;
	vLandNormal = normalize( mat3( modelMatrix ) * normal );
}
`;

const LAND_FRAGMENT_PARS = /* glsl */`
uniform float uGrain;
uniform float uFinish;
uniform float uContact;
uniform vec3 uRock;
uniform vec3 uSand;
uniform vec3 uShade;
uniform float uHintOn;
uniform vec2 uHintSize;
uniform sampler2D uHint;
varying float vAo;
varying vec3 vLandPos;
varying vec3 vLandNormal;
${NOISE_GLSL}
`;

/**
 * Finitions du sol, dans l'ordre : grain d'herbe continu (traverse les limites de cases),
 * affleurements rocheux sur les pentes raides, liseré de sable juste au-dessus de l'eau,
 * ombre de contact au pied des objets (légèrement plus FROIDE que la lumière), et le liseré
 * de grille local pendant la pose.
 */
const LAND_FRAGMENT_BODY = /* glsl */`
{
	vec2 wp = vLandPos.xz;
	// 1. Grain : trois échelles en coordonnées monde — aucune limite de case ne se devine. La plus
	//    large tire la teinte vers le doré ou vers le vert froid : des « parcelles » qui se chevauchent.
	float grain = ttNoise( wp * 1.7 ) * 0.58 + ttNoise( wp * 5.3 ) * 0.42;
	float wide = ( ttNoise( wp * 0.33 ) - 0.5 ) * uFinish;
	diffuseColor.rgb *= 1.0 + uGrain * uFinish * ( grain - 0.5 );
	diffuseColor.rgb *= vec3( 1.0 + wide * 0.13, 1.0 + wide * 0.055, 1.0 - wide * 0.085 );
	// 1b. Le relief se lit : les hauteurs sèchent au soleil, les fonds restent gras et sombres.
	float lift = smoothstep( 0.02, 0.62, vLandPos.y );
	diffuseColor.rgb *= mix( vec3( 1.0 ), mix( vec3( 0.95, 0.97, 0.98 ), vec3( 1.10, 1.06, 0.90 ), lift ), uFinish );
	// 2. Affleurements rocheux : là où la pente est raide, et seulement par endroits.
	float steep = smoothstep( 0.94, 0.70, vLandNormal.y );
	float rockPatch = smoothstep( 0.42, 0.78, ttNoise( wp * 0.85 ) + steep * 0.35 );
	diffuseColor.rgb = mix( diffuseColor.rgb, uRock, steep * rockPatch * 0.8 * uFinish );
	// 3. Sable de berge : une frange au-dessus de la ligne d'eau, ondulée par le bruit (contour irrégulier).
	float shoreN = ttNoise( wp * 2.3 ) * 0.62 + ttNoise( wp * 6.1 ) * 0.38;
	float band = ( vLandPos.y - ${WATER_LEVEL.toFixed(3)} ) + ( shoreN - 0.5 ) * 0.085;
	float sand = ( 1.0 - smoothstep( 0.004, 0.115, band ) ) * step( 0.0, band + 0.05 );
	diffuseColor.rgb = mix( diffuseColor.rgb, uSand, sand * 0.78 * uFinish );
	// 4. Ombre de contact : ancre les bâtiments et les bosquets au sol, d'un ton un peu plus froid.
	float ao = clamp( vAo, 0.0, 1.0 ) * uContact * mix( 0.45, 1.0, uFinish );
	diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * uShade, ao );
	// 5. Grille locale pendant la pose : liseré discret sur les cases désignées par setGridHint.
	if ( uHintOn > 0.5 ) {
		vec2 cell = floor( wp );
		float on = texture2D( uHint, ( cell + 0.5 ) / uHintSize ).r;
		if ( on > 0.5 ) {
			vec2 fr = fract( wp );
			float d = min( min( fr.x, 1.0 - fr.x ), min( fr.y, 1.0 - fr.y ) );
			float line = 1.0 - smoothstep( 0.015, 0.05, d );
			diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 1.0 ), line * 0.42 );
		}
	}
}
`;

/**
 * Matériau de la terre : Lambert à couleurs de sommets, finitions du sol, plus les hachures du mode
 * daltonien. { material, uniforms } ; `uniforms.uPattern.value` vaut 0 ou 1.
 */
export function createLandMaterial(shared = { uPattern: { value: 0 } }) {
  const uniforms = {
    uPattern: shared.uPattern || { value: 0 },
    uGrain: { value: 0.20 },
    // 1 : finitions du paysage à pleine force ; abaissé quand un calque écologique est affiché, pour
    // que ses couleurs restent fidèles et lisibles.
    uFinish: { value: 1 },
    uContact: { value: CONTACT_SHADOW },
    uRock: { value: new THREE.Color(PALETTE.rock) },
    uSand: { value: new THREE.Color(PALETTE.soil) },
    uShade: { value: new THREE.Color(0.80, 0.83, 0.92) },
    uHintOn: { value: 0 },
    uHintSize: { value: new THREE.Vector2(1, 1) },
    uHint: { value: null },
  };
  const material = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
  material.onBeforeCompile = (shader) => {
    for (const name of Object.keys(uniforms)) shader.uniforms[name] = uniforms[name];
    shader.vertexShader = HATCH_VERTEX_PARS + LAND_VERTEX_PARS
      + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + HATCH_VERTEX_BODY + LAND_VERTEX_BODY);
    shader.fragmentShader = HATCH_FRAGMENT_PARS + LAND_FRAGMENT_PARS
      + shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n' + LAND_FRAGMENT_BODY + HATCH_FRAGMENT_BODY);
  };
  material.customProgramCacheKey = () => 'tiletown-land-2';
  return { material, uniforms };
}

// ---------------------------------------------------------------------------------------------
// Matériau de l'eau : Lambert modifié par onBeforeCompile (GLSL ES 3.0 via les #define de three.js)
// ---------------------------------------------------------------------------------------------

const WATER_VERTEX_PARS = /* glsl */`
uniform float uTime;
attribute vec2 aFlow;
attribute vec4 aBanks;
attribute vec2 aStyle;
attribute float aQuality;
varying vec2 vWaterPos;
varying vec2 vLocalPos;
varying vec2 vFlow;
varying vec4 vBanks;
varying vec2 vStyle;
varying float vQuality;
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
	vQuality = aQuality;
	// Ondulation douce : deux fréquences croisées, fonction de la position monde (continue d'une case à l'autre).
	float w1 = sin( wp.x * 6.1 + wp.z * 2.3 + uTime * 1.9 );
	float w2 = sin( wp.x * 2.7 - wp.z * 5.3 - uTime * 1.3 );
	transformed.y += aStyle.x * ( 0.6 * w1 + 0.4 * w2 );
}
`;

const WATER_FRAGMENT_PARS = /* glsl */`
uniform float uTime;
uniform vec3 uMurky;
uniform vec3 uShallow;
varying vec2 vWaterPos;
varying vec2 vLocalPos;
varying vec2 vFlow;
varying vec4 vBanks;
varying vec2 vStyle;
varying float vQuality;
${NOISE_GLSL}
`;

/**
 * Corps du fragment, inséré après `color_fragment`. Étape 5 : tout est VOLONTAIREMENT DISCRET — les
 * bandes de courant sont trois fois plus faibles et plus larges, le scintillement est à peine perceptible,
 * l'écume est une ombre claire au bord. Le sens du courant reste lisible, il n'attire plus l'œil.
 */
const WATER_FRAGMENT_BODY = /* glsl */`
{
	// Bandes claires qui défilent dans le sens du courant (FLOW_SPEED u/s) ; nulles sur l'eau dormante (aStyle.y = 0).
	float along = dot( vWaterPos, vFlow );
	float across = vWaterPos.x * vFlow.y - vWaterPos.y * vFlow.x;
	float phase = ( along - uTime * ${FLOW_SPEED.toFixed(3)} ) * 5.1 + sin( across * 2.2 + uTime * 0.4 ) * 0.7;
	float bands = smoothstep( 0.25, 1.0, sin( phase ) ) * 0.038 * vStyle.y;   // longues ondes, à peine marquées
	// Scintillement : deux ondes croisées, lentes et gauchies l'une par l'autre, très faible.
	float sx = sin( vWaterPos.x * 5.5 + uTime * 1.1 + sin( vWaterPos.y * 2.1 + uTime * 0.4 ) * 1.5 );
	float sz = sin( vWaterPos.y * 4.3 - uTime * 0.9 + sin( vWaterPos.x * 1.7 - uTime * 0.3 ) * 1.6 );
	float shimmer = smoothstep( 0.72, 1.0, sx * sz ) * 0.028;
	// Écume : fin liseré clair le long des côtés bordés de terre (nord = z local −0,5, est = x local +0,5).
	float edge = 0.085 + 0.02 * sin( ( vWaterPos.x + vWaterPos.y ) * 5.0 + uTime * 0.9 );
	float foam = 0.0;
	foam = max( foam, vBanks.x * ( 1.0 - smoothstep( 0.0, edge, 0.5 + vLocalPos.y ) ) );
	foam = max( foam, vBanks.y * ( 1.0 - smoothstep( 0.0, edge, 0.5 - vLocalPos.x ) ) );
	foam = max( foam, vBanks.z * ( 1.0 - smoothstep( 0.0, edge, 0.5 - vLocalPos.y ) ) );
	foam = max( foam, vBanks.w * ( 1.0 - smoothstep( 0.0, edge, 0.5 + vLocalPos.x ) ) );
	foam *= 0.6 + 0.2 * sin( uTime * 1.3 + along * 3.0 );
	// HAUT-FOND : large frange pâle le long des berges, au contour ONDULÉ par un bruit en coordonnées
	// monde. C'est elle qui casse la ligne d'eau rectiligne de la grille : on lit une rive, pas un bord de case.
	float dN = mix( 1.0, 0.5 + vLocalPos.y, vBanks.x );
	float dE = mix( 1.0, 0.5 - vLocalPos.x, vBanks.y );
	float dS = mix( 1.0, 0.5 - vLocalPos.y, vBanks.z );
	float dW = mix( 1.0, 0.5 + vLocalPos.x, vBanks.w );
	float bankDist = min( min( dN, dE ), min( dS, dW ) );
	float wobble = ( ttNoise( vWaterPos * 2.4 ) * 0.6 + ttNoise( vWaterPos * 6.3 ) * 0.4 - 0.5 ) * 0.17;
	float shallow = 1.0 - smoothstep( 0.0, 0.26, bankDist + wobble );
	// Eau polluée : la couleur de base glisse vers le vert trouble, les reflets s'éteignent, des voiles
	// d'algues apparaissent (deux ondes lentes), proportionnellement a la pollution (aQuality).
	float q = clamp( vQuality, 0.0, 1.0 );
	float algae = smoothstep( 0.35, 1.0, sin( vWaterPos.x * 2.1 + uTime * 0.17 ) * sin( vWaterPos.y * 1.7 - uTime * 0.13 ) ) * q * 0.25;
	diffuseColor.rgb = mix( diffuseColor.rgb, uMurky, q * ${WATER_MURKY_MIX.toFixed(3)} );
	diffuseColor.rgb = mix( diffuseColor.rgb, uMurky * 0.8, algae );
	diffuseColor.rgb = mix( diffuseColor.rgb, uShallow, shallow * 0.3 * ( 1.0 - 0.7 * q ) );
	float light = clamp( bands + shimmer + foam * 0.22, 0.0, 0.35 ) * ( 1.0 - 0.6 * q );
	diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 1.0 ), light );
}
`;

/**
 * Matériau partagé par toute l'eau : { material, uniforms } ; `uniforms.uTime.value` est l'horloge (s).
 * La couleur vient de `instanceColor` (terrain ou calque), un léger éclat propre éclaircit l'eau.
 */
export function createWaterMaterial(shared = {}) {
  const uniforms = {
    uTime: { value: 0 },
    uMurky: { value: new THREE.Color(WATER_MURKY) },
    uShallow: { value: new THREE.Color(WATER_SHALLOW) },
    uPattern: shared.uPattern || { value: 0 },
  };
  const material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(PALETTE.river).multiplyScalar(0.18),
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uMurky = uniforms.uMurky;
    shader.uniforms.uShallow = uniforms.uShallow;
    shader.uniforms.uPattern = uniforms.uPattern;
    shader.vertexShader = WATER_VERTEX_PARS + HATCH_VERTEX_PARS
      + shader.vertexShader.replace('#include <begin_vertex>', WATER_VERTEX_BODY + HATCH_VERTEX_BODY);
    shader.fragmentShader = WATER_FRAGMENT_PARS + HATCH_FRAGMENT_PARS
      + shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n' + WATER_FRAGMENT_BODY + HATCH_FRAGMENT_BODY);
  };
  material.customProgramCacheKey = () => 'tiletown-water-5';
  return { material, uniforms };
}

// ---------------------------------------------------------------------------------------------
// Ombre de contact : combien le sol est assombri sous ce qui est posé dessus
// ---------------------------------------------------------------------------------------------

/** Rayon et force de l'assombrissement du sol, par type d'occupation. */
const OCCLUDERS = Object.freeze({
  building: Object.freeze([0.62, 1.0]),
  forest: Object.freeze([0.80, 0.70]),
  wetland: Object.freeze([0.80, 0.35]),
  meadow: Object.freeze([0.70, 0.22]),
  field: Object.freeze([0.70, 0.18]),
});

/** Type d'occultation d'une case (null si rien ne s'y pose). */
function occluderOf(tile) {
  if (!tile) return null;
  if (tile.building) return OCCLUDERS.building;
  return OCCLUDERS[tile.terrain] || null;
}

// ---------------------------------------------------------------------------------------------
// Sol
// ---------------------------------------------------------------------------------------------

/**
 * Crée le sol. API : { group, setWorld(world), update(dt), setTime(t), time, setTileColors(rgb | null),
 * setLayerValues(norm01 | null), setLayerPattern(on), layerPattern, setWaterQuality(values | null),
 * setGridHint(cells | null), baseColors(), stats, dispose() }.
 * `setTileColors` reçoit un Float32Array (3 valeurs linéaires par case) pour les calques, ou null
 * pour revenir aux couleurs de terrain. `update(dt)` fait avancer l'eau (à appeler avant chaque image animée).
 */
export function createGround() {
  const group = new THREE.Group();
  group.name = 'ground';

  // Hachures du mode daltonien : un seul interrupteur pour la terre et l'eau.
  const patternUniform = { value: 0 };
  const { material: landMaterial, uniforms: landUniforms } = createLandMaterial({ uPattern: patternUniform });
  // Plan d'eau 1 × 1 à 2 × 2 segments (neuf sommets) : assez pour que l'ondulation se voie.
  const waterTemplate = new THREE.PlaneGeometry(1, 1, 2, 2);
  waterTemplate.rotateX(-Math.PI / 2);
  const { material: waterMaterial, uniforms } = createWaterMaterial({ uPattern: patternUniform });
  const riverColor = new THREE.Color(PALETTE.river);
  const skirtTopColor = new THREE.Color(PALETTE.soil).multiplyScalar(1.12);
  const skirtBottomColor = new THREE.Color(PALETTE.soil).multiplyScalar(0.70);

  let land = null;    // maillage soudé du terrain (+ jupe du socle)
  let water = null;   // rivière + lacs
  let film = null;    // zones humides
  let world = null;
  /** Par case : index d'instance dans `water` (≥ 0), −1 sinon. */
  let waterSlots = null;
  /** Par case : index d'instance dans `film` (zone humide), −1 sinon. */
  let filmSlots = null;
  /** Couleurs de terrain par case (linéaires), référence pour les calques. */
  let colors = null;
  /** Grille de sommets du terrain : sub = subdivision, nx/nz = nombre de sommets par axe. */
  let grid = null;
  /** Valeurs du calque actif normalisées (0 à 1) par case, ou null : conservées pour les hachures. */
  let layerField = null;
  /** Qualité de l'eau par case (0 à 1), ou null : conservée d'un monde à l'autre. */
  let qualityField = null;
  /** Texture du liseré de grille (cases désignées par setGridHint). */
  let hintTexture = null;
  const stats = { tiles: 0, land: 0, water: 0, wetland: 0, hills: 0, drawables: 0, pattern: 0, vertices: 0, triangles: 0, subdiv: SUBDIV };

  const color = new THREE.Color();
  const tint = new THREE.Color();
  const matrix = new THREE.Matrix4();

  /** Teinte de la pellicule des zones humides : la couleur de la case, à moitié vers l'eau courante. */
  function filmTint(out, src) {
    return out.copy(src).lerp(riverColor, 0.5);
  }

  /** InstancedMesh d'eau avec ses attributs par instance (aFlow, aBanks, aStyle, aLayer, aQuality). */
  function createWaterMesh(name, count) {
    const m = Math.max(1, count);
    const geometry = waterTemplate.clone();
    geometry.setAttribute('aFlow', new THREE.InstancedBufferAttribute(new Float32Array(m * 2), 2));
    geometry.setAttribute('aBanks', new THREE.InstancedBufferAttribute(new Float32Array(m * 4), 4));
    geometry.setAttribute('aStyle', new THREE.InstancedBufferAttribute(new Float32Array(m * 2), 2));
    geometry.setAttribute('aLayer', new THREE.InstancedBufferAttribute(new Float32Array(m).fill(-1), 1));
    geometry.setAttribute('aQuality', new THREE.InstancedBufferAttribute(new Float32Array(m), 1));
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

  // -------------------------------------------------------------------------------------------
  // Terrain soudé
  // -------------------------------------------------------------------------------------------

  /** Ombre de contact au sommet (x, z) : somme des occultations des cases proches, bornée à 1. */
  function contactAt(x, z) {
    const { cols, rows, tiles } = world;
    const cx = Math.floor(x), cz = Math.floor(z);
    let ao = 0;
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        const tx = cx + dx, tz = cz + dz;
        if (tx < 0 || tz < 0 || tx >= cols || tz >= rows) continue;
        const occ = occluderOf(tiles[tz * cols + tx]);
        if (!occ) continue;
        const d = Math.hypot(x - (tx + 0.5), z - (tz + 0.5));
        if (d >= occ[0]) continue;
        ao += occ[1] * (1 - smootherstep(d / occ[0]));
      }
    }
    return ao > 1 ? 1 : ao;
  }

  /** Construit le maillage soudé du terrain : nappe lissée + jupe du socle + fond. */
  function buildLand() {
    const { cols, rows } = world;
    const sub = cols * rows > SUBDIV_LIMIT ? 3 : SUBDIV;
    const nx = cols * sub + 1, nz = rows * sub + 1;
    const topCount = nx * nz;
    const ring = 2 * (nx + nz) - 4;            // sommets du bord de la nappe
    const total = topCount + ring * 2 + 4;     // + jupe (haut/bas) + fond
    const position = new Float32Array(total * 3);
    const normal = new Float32Array(total * 3);
    const vcolor = new Float32Array(total * 3);
    const aLayer = new Float32Array(total).fill(-1);
    const aAo = new Float32Array(total);
    const indices = [];
    const eps = 1 / (sub * 2);

    // --- Nappe -------------------------------------------------------------------------------
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        const x = i / sub, z = j / sub;
        const y = heightAt(world, x, z);
        position[k * 3] = x; position[k * 3 + 1] = y; position[k * 3 + 2] = z;
        // Normale analytique : différences centrées du champ de hauteur (pentes douces, sans facette).
        const hL = heightAt(world, x - eps, z), hR = heightAt(world, x + eps, z);
        const hD = heightAt(world, x, z - eps), hU = heightAt(world, x, z + eps);
        let gx = (hL - hR) / (2 * eps), gz = (hD - hU) / (2 * eps);
        const len = Math.hypot(gx, 1, gz) || 1;
        normal[k * 3] = gx / len; normal[k * 3 + 1] = 1 / len; normal[k * 3 + 2] = gz / len;
        aAo[k] = contactAt(x, z);
      }
    }
    for (let j = 0; j < nz - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    // --- Jupe du socle : le bord de la nappe descend jusqu'à SKIRT_BOTTOM ----------------------
    /** Sommets du bord, dans l'ordre horaire. */
    const border = [];
    for (let i = 0; i < nx; i++) border.push([i, 0, 0, -1]);                 // nord : normale −Z
    for (let j = 1; j < nz; j++) border.push([nx - 1, j, 1, 0]);             // est
    for (let i = nx - 2; i >= 0; i--) border.push([i, nz - 1, 0, 1]);        // sud
    for (let j = nz - 2; j >= 1; j--) border.push([0, j, -1, 0]);            // ouest
    let base = topCount;
    const skirtTop = [], skirtBottom = [];
    for (const [i, j, snx, snz] of border) {
      const src = (j * nx + i) * 3;
      const t = base++, b = base++;
      position[t * 3] = position[src]; position[t * 3 + 1] = position[src + 1]; position[t * 3 + 2] = position[src + 2];
      position[b * 3] = position[src]; position[b * 3 + 1] = SKIRT_BOTTOM; position[b * 3 + 2] = position[src + 2];
      // Normale relevée en haut du flanc : le socle attrape la lumière au lieu d'être un mur noir.
      const nl = Math.hypot(snx * 0.42, 0.91, snz * 0.42) || 1;
      normal[t * 3] = snx * 0.42 / nl; normal[t * 3 + 1] = 0.91 / nl; normal[t * 3 + 2] = snz * 0.42 / nl;
      const bl = Math.hypot(snx * 0.86, 0.5, snz * 0.86) || 1;
      normal[b * 3] = snx * 0.86 / bl; normal[b * 3 + 1] = 0.5 / bl; normal[b * 3 + 2] = snz * 0.86 / bl;
      skirtTopColor.toArray(vcolor, t * 3);
      skirtBottomColor.toArray(vcolor, b * 3);
      skirtTop.push(t); skirtBottom.push(b);
    }
    // Anneau fermé, faces tournées vers l'extérieur (le bord est parcouru dans le sens horaire vu de dessus).
    for (let k = 0; k < skirtTop.length; k++) {
      const n2 = (k + 1) % skirtTop.length;
      indices.push(skirtTop[k], skirtTop[n2], skirtBottom[k], skirtTop[n2], skirtBottom[n2], skirtBottom[k]);
    }
    // --- Fond du socle ------------------------------------------------------------------------
    const f0 = base;
    for (const [x, z] of [[0, 0], [cols, 0], [cols, rows], [0, rows]]) {
      position[base * 3] = x; position[base * 3 + 1] = SKIRT_BOTTOM; position[base * 3 + 2] = z;
      normal[base * 3 + 1] = -1;
      skirtBottomColor.toArray(vcolor, base * 3);
      base++;
    }
    indices.push(f0, f0 + 1, f0 + 2, f0, f0 + 2, f0 + 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(vcolor, 3));
    geometry.setAttribute('aLayer', new THREE.BufferAttribute(aLayer, 1));
    geometry.setAttribute('aAo', new THREE.BufferAttribute(aAo, 1));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    land = new THREE.Mesh(geometry, landMaterial);
    land.name = 'land';
    land.castShadow = true;
    land.receiveShadow = true;
    land.frustumCulled = false;
    grid = { sub, nx, nz, topCount };
    stats.vertices = total;
    stats.triangles = indices.length / 3;
  }

  /** Couleurs de sommet de la nappe : échantillonnage lissé du champ de couleurs par case. */
  function writeVertexColors(src) {
    if (!land || !grid || !world) return;
    const { cols, rows } = world;
    const { sub, nx, nz } = grid;
    const attr = land.geometry.attributes.color;
    const arr = attr.array;
    const chan = new Float32Array(cols * rows);
    for (let c = 0; c < 3; c++) {
      for (let i = 0; i < cols * rows; i++) chan[i] = src[i * 3 + c];
      for (let j = 0; j < nz; j++) {
        for (let i = 0; i < nx; i++) {
          arr[(j * nx + i) * 3 + c] = sampleSmooth(chan, cols, rows, i / sub, j / sub);
        }
      }
    }
    attr.needsUpdate = true;
  }

  /** Valeurs du calque par sommet de la nappe (−1 hors calque) + attributs d'instance de l'eau. */
  function writeLayerField(field) {
    if (!world || !land || !water || !grid) return;
    const { cols, rows } = world;
    const { sub, nx, nz } = grid;
    const attr = land.geometry.attributes.aLayer;
    const arr = attr.array;
    if (!field) {
      arr.fill(-1);
    } else {
      for (let j = 0; j < nz; j++) {
        for (let i = 0; i < nx; i++) arr[j * nx + i] = sampleSmooth(field, cols, rows, i / sub, j / sub);
      }
    }
    attr.needsUpdate = true;
    const waterAttr = water.geometry.attributes.aLayer;
    const filmAttr = film.geometry.attributes.aLayer;
    for (let i = 0; i < cols * rows; i++) {
      const v = field ? (i < field.length ? field[i] : 0) : -1;
      if (waterSlots[i] >= 0) waterAttr.array[waterSlots[i]] = v;
      if (filmSlots[i] >= 0) filmAttr.array[filmSlots[i]] = v;
    }
    waterAttr.needsUpdate = true; filmAttr.needsUpdate = true;
  }

  /** Écrit l'attribut `aQuality` (pollution de l'eau, 0 à 1) sur l'eau profonde et les zones humides. */
  function writeQualityField(field) {
    if (!world || !water || !film) return;
    const n = world.cols * world.rows;
    const waterAttr = water.geometry.attributes.aQuality;
    const filmAttr = film.geometry.attributes.aQuality;
    for (let i = 0; i < n; i++) {
      const v = field ? (i < field.length ? field[i] : 0) : 0;
      if (waterSlots[i] >= 0) waterAttr.array[waterSlots[i]] = v;
      if (filmSlots[i] >= 0) filmAttr.array[filmSlots[i]] = v;
    }
    waterAttr.needsUpdate = true; filmAttr.needsUpdate = true;
  }

  function clear() {
    for (const mesh of [land, water, film]) {
      if (!mesh) continue;
      group.remove(mesh);
      mesh.geometry.dispose();
    }
    land = water = film = null;
    grid = null;
    stats.drawables = 0;
  }

  function setWorld(nextWorld) {
    clear();
    world = nextWorld;
    const { cols, rows, tiles } = world;
    const n = cols * rows;
    waterSlots = new Int32Array(n).fill(-1);
    filmSlots = new Int32Array(n).fill(-1);
    colors = new Float32Array(n * 3);

    let landCount = 0, waterCount = 0, wetCount = 0, hillCount = 0;
    for (let i = 0; i < n; i++) {
      const t = tiles[i];
      if (t && isWaterTerrain(t.terrain)) waterCount++; else landCount++;
      if (t && t.terrain === 'hill') hillCount++;
      if (t && isShallowWater(t.terrain)) wetCount++;
    }

    water = createWaterMesh('water', waterCount);
    film = createWaterMesh('wetland-film', wetCount);

    let wi = 0, fi = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const t = tiles[i];
        const terrain = t ? t.terrain : 'grass';
        color.set(groundColorHex(terrain));
        color.toArray(colors, i * 3);
        if (isWaterTerrain(terrain)) {
          composeScaled(matrix, x + 0.5, WATER_LEVEL, y + 0.5, 1, 1, 1);
          water.setMatrixAt(wi, matrix);
          water.setColorAt(wi, color);
          writeWaterAttributes(water, wi, WATER_STYLES[terrain] || WATER_STYLES.lake, t ? t.flow : null, bankMask(world, x, y));
          waterSlots[i] = wi;
          wi++;
        } else if (isShallowWater(terrain)) {
          composeScaled(matrix, x + 0.5, WETLAND_FILM_LEVEL, y + 0.5, 1, 1, 1);
          film.setMatrixAt(fi, matrix);
          film.setColorAt(fi, filmTint(tint, color));
          writeWaterAttributes(film, fi, WATER_STYLES.wetland, null, 0);
          filmSlots[i] = fi;
          fi++;
        }
      }
    }
    for (const mesh of [water, film]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      for (const name of ['aFlow', 'aBanks', 'aStyle']) mesh.geometry.attributes[name].needsUpdate = true;
    }

    buildLand();
    writeVertexColors(colors);
    setGridHint(null);

    group.add(land, water, film);
    stats.tiles = n; stats.land = landCount; stats.water = waterCount; stats.wetland = wetCount; stats.hills = hillCount;
    stats.drawables = 1 + (waterCount > 0 ? 1 : 0) + (wetCount > 0 ? 1 : 0);
    stats.subdiv = grid.sub;
    // Les champs d'écologie survivent à la reconstruction du monde (calque actif, qualité de l'eau).
    writeLayerField(layerField);
    if (qualityField) writeQualityField(qualityField);
  }

  /**
   * Valeurs du calque actif pour les hachures : Float32Array normalisé (0 à 1) par case, ou null pour
   * couper les hachures (calque « Aucun »).
   */
  function setLayerValues(values) {
    layerField = values || null;
    writeLayerField(layerField);
  }

  /** Mode daltonien : hachures diagonales par bandes de valeur sur la terre et l'eau. */
  function setLayerPattern(on) {
    patternUniform.value = on ? 1 : 0;
    stats.pattern = patternUniform.value;
  }

  /**
   * Qualité de l'eau par case (`eco.water` de GAME_DESIGN §5.2, 0 à 100 ou 0 à 1) : la teinte de l'eau
   * glisse vers un vert trouble quand la valeur monte. null ou un tableau vide rend l'eau claire.
   */
  function setWaterQuality(values) {
    if (!values || !values.length) { qualityField = null; writeQualityField(null); return; }
    const scale = valueScale(values);
    const field = qualityField && qualityField.length === values.length ? qualityField : new Float32Array(values.length);
    for (let i = 0; i < values.length; i++) field[i] = layerNormalized(values[i], scale);
    qualityField = field;
    writeQualityField(field);
  }

  /**
   * GRILLE LOCALE pendant la pose : liseré discret sur les cases données ([{ x, y }] ou null).
   * La grille n'est jamais affichée en permanence — elle n'apparaît qu'autour du fantôme, le temps de
   * viser juste. Aucun appel de dessin supplémentaire : un masque par case, lu par le shader du sol.
   */
  function setGridHint(cells) {
    if (!world) return;
    const { cols, rows } = world;
    if (!hintTexture || hintTexture.image.width !== cols || hintTexture.image.height !== rows) {
      if (hintTexture) hintTexture.dispose();
      hintTexture = new THREE.DataTexture(new Uint8Array(cols * rows), cols, rows, THREE.RedFormat, THREE.UnsignedByteType);
      hintTexture.magFilter = THREE.NearestFilter;
      hintTexture.minFilter = THREE.NearestFilter;
      hintTexture.generateMipmaps = false;
      landUniforms.uHint.value = hintTexture;
      landUniforms.uHintSize.value.set(cols, rows);
    }
    const data = hintTexture.image.data;
    data.fill(0);
    let count = 0;
    if (cells && cells.length) {
      for (const c of cells) {
        const x = c.x | 0, y = c.y | 0;
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
        data[y * cols + x] = 255;
        count++;
      }
    }
    hintTexture.needsUpdate = true;
    landUniforms.uHintOn.value = count > 0 ? 1 : 0;
    stats.hint = count;
  }

  /** Applique des couleurs par case (Float32Array linéaire, 3 par case) ou restaure les terrains. */
  function setTileColors(rgb) {
    if (!world || !land || !water) return;
    const src = rgb || colors;
    const n = world.cols * world.rows;
    // Calque affiché : les finitions du paysage s'effacent pour ne pas salir les couleurs du calque.
    landUniforms.uFinish.value = rgb ? 0.3 : 1;
    writeVertexColors(src);
    for (let i = 0; i < n; i++) {
      color.setRGB(src[i * 3], src[i * 3 + 1], src[i * 3 + 2]);
      if (waterSlots[i] >= 0) water.setColorAt(waterSlots[i], color);
      if (filmSlots[i] >= 0) film.setColorAt(filmSlots[i], filmTint(tint, color));
    }
    if (water.instanceColor) water.instanceColor.needsUpdate = true;
    if (film.instanceColor) film.instanceColor.needsUpdate = true;
  }

  /** Fait avancer l'eau de `dt` secondes (rien d'autre à faire : l'ondulation et les bandes sont dans le shader). */
  function update(dt) {
    if (Number.isFinite(dt) && dt > 0) uniforms.uTime.value += dt;
  }

  function dispose() {
    clear();
    waterTemplate.dispose();
    if (hintTexture) { hintTexture.dispose(); hintTexture = null; }
    landMaterial.dispose();
    waterMaterial.dispose();
  }

  return {
    group,
    stats,
    setWorld,
    update,
    setLayerValues,
    setLayerPattern,
    setWaterQuality,
    setGridHint,
    /** Mode daltonien actif ? */
    get layerPattern() { return patternUniform.value > 0.5; },
    /** Fixe l'horloge de l'eau (captures déterministes). */
    setTime(t) { uniforms.uTime.value = Number.isFinite(t) ? t : 0; },
    get time() { return uniforms.uTime.value; },
    /** Matériau de l'eau (débogage, mesure). */
    get waterMaterial() { return waterMaterial; },
    /** Matériau et réglages du terrain (débogage, mesure). */
    get landMaterial() { return landMaterial; },
    get landUniforms() { return landUniforms; },
    setTileColors,
    /** Copie des couleurs de terrain (linéaires) par case. */
    baseColors() { return colors ? colors.slice() : null; },
    dispose,
  };
}
