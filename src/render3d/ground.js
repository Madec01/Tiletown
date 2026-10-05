// Sol de la vallée. Depuis l'étape 5 (docs/ARCHITECTURE.md §11.4) la terre n'est plus une
// `InstancedMesh` de boîtes : c'est UN SEUL MAILLAGE SOUDÉ, continu, tiré d'un champ de hauteur
// interpolé en douceur (smootherstep) entre les centres de cases. Conséquences voulues :
//   - les collines deviennent des DÔMES ARRONDIS qui courent sur plusieurs cases (plus de marches) ;
//   - les couleurs de terrain se FONDENT d'une case à l'autre (couleur par sommet, interpolée) : une
//     forêt de plusieurs cases lit comme une seule forêt, pas comme un damier ;
//   - un micro-relief continu en coordonnées monde (creux seulement, jamais de bosse) casse les aplats
//     sans jamais faire léviter ce qui est posé à `surfaceHeight`.
//
// L'EAU suit le même principe depuis le chantier « rivière sinueuse ». Elle ne suit PLUS les bords de
// cases : rivière, lacs et zones humides sont chacun UN SEUL MAILLAGE SOUDÉ dont le contour est la
// LIGNE DE NIVEAU 0,5 d'un champ de « présence d'eau » :
//   - champ par case (1 dans l'eau, 0 sur la terre), interpolé en smootherstep comme les hauteurs :
//     les coudes à angle droit du tracé de `worldgen` deviennent des virages doux, et la largeur reste
//     d'une case en moyenne (le niveau 0,5 tombe exactement sur la frontière des cases en ligne droite) ;
//   - un SERPENTEMENT continu en coordonnées monde (`SHORE_WOBBLE`, ≈ 0,12 unité) déplace le rivage,
//     fenêtré pour ne jamais toucher le centre des cases : la rivière reste donc continue d'un bout à
//     l'autre (le champ vaut exactement 1 le long de la ligne qui joint les centres d'eau) et aucune
//     flaque ne se détache ;
//   - LE LIT ET LA BERGE SONT CREUSÉS D'APRÈS LE MÊME CHAMP : la surface vaut exactement `WATER_LEVEL`
//     sur la ligne de niveau 0,5, descend vers le lit à l'intérieur, remonte en pente douce à
//     l'extérieur. Il ne peut donc y avoir ni trou au bord de l'eau ni eau qui déborde sur la terre,
//     et l'invariant « hors de l'eau, la surface ne descend jamais sous `WATER_LEVEL` » est exact.
//   - la nappe d'eau est extraite un peu AVANT le rivage (`WATER_OVERLAP`) : son bord se glisse sous la
//     berge, qui le masque — ni filet de terre apparent ni bagarre de profondeur sur la ligne d'eau.
// Le maillage est obtenu par `contourMesh` (marching squares, sommets soudés par arête de grille).
//
// Le shader du sol ajoute, sans appel de dessin supplémentaire : grain d'herbe continu, affleurements
// rocheux sur les pentes raides, liseré de sable au bord de l'eau, ombre de contact (`aAo`) au pied des
// bâtiments et sous les bosquets, liseré de grille LOCAL pendant la pose (`setGridHint`), et les
// hachures du mode daltonien (inchangées). Le shader de l'eau (`aFlow`, `aStyle`, `aShore`, `aQuality`)
// garde ses effets : ondulation, sens du courant discret, écume atténuée, haut-fond pâle, eau qui
// verdit avec la pollution — tous pilotés par `aShore`, la DISTANCE AU RIVAGE, qui remplace l'ancien
// masque de berges par côté de case.
//
// ÉCOLOGIE (§10.3), inchangé côté appelant :
//   `setLayerValues(norm)` + `setLayerPattern(on)` : hachures du mode daltonien (attribut `aLayer`) ;
//   `setWaterQuality(values)` : l'eau glisse vers un vert trouble (attribut `aQuality`).
//
// Repère : la case (x, y) couvre [x, x+1] × [y, y+1] en (X, Z) ; le dessus de la terre plate est à
// y = 0 ; nord = −Z, est = +X. Fonctions pures (testables sous Node) : `flowVector`, `hillHeight`,
// `hillMass`, `waterField`, `marshField`, `shoreDistance`, `isWaterAt`, `contourMesh`, `surfaceHeight`,
// `heightAt`, `terrainColorHex`, `groundColorHex`.

import * as THREE from 'three';
import { PALETTE } from '../data/palette.js';
import { TERRAINS } from '../data/terrain.js';
import { hashUnit, lerp } from './util.js';
import { LAYER_BANDS, HATCH_CYCLES, valueScale, layerNormalized } from './layers.js';

/** Épaisseur de référence de la terre (le socle commence là ; roads.js s'en sert pour les piles de pont). */
export const LAND_THICKNESS = 0.12;
/** Niveau de la surface de l'eau profonde (rivière, lac). Abaissé à l'étape 5 : la berge se voit. */
export const WATER_LEVEL = -0.16;
/** Hauteur de la pellicule des zones humides AU-DESSUS du sol creusé (elle épouse le fond de la cuvette). */
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
/** Fond des rivières et des lacs (caché sous l'eau ; donne la pente du lit). */
export const BED_RIVER = -0.38;
export const BED_LAKE = -0.50;
/** Creux d'une zone humide sous la plaine : la nappe est LÉGÈREMENT ENFONCÉE (≤ DIP, rien ne lévite). */
export const WETLAND_DEPTH = 0.03;

/**
 * Pente du champ d'eau à la traversée du rivage (dérivée de smootherstep en son milieu, par case).
 * Sert à convertir « écart de champ » ↔ « distance au rivage en unités monde ».
 */
export const FIELD_SLOPE = 1.875;
/** Amplitude du SERPENTEMENT du rivage, en unités monde : le contour ondule, jamais géométrique. */
export const SHORE_WOBBLE = 0.12;
/** Échelles (en cases) des deux octaves du serpentement : une grande houle, un grain fin. */
export const SHORE_WOBBLE_SCALE = Object.freeze([3.1, 1.25]);
/**
 * Marge d'extraction de la nappe d'eau SOUS la berge (en unités de champ) : le bord du maillage d'eau
 * passe un peu avant le rivage, là où la terre est déjà au-dessus du niveau de l'eau et le masque.
 */
export const WATER_OVERLAP = 0.08;
/** Largeur du fondu du bord de la pellicule des zones humides (unités monde). */
export const WETLAND_FADE = 0.16;

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

// ---------------------------------------------------------------------------------------------
// Champ de hauteur et champ d'eau (purs, testables)
// ---------------------------------------------------------------------------------------------

/** Courbe de lissage de Perlin (C², dérivée nulle aux extrémités) : des pentes sans arête. */
function smootherstep(t) {
  const u = t < 0 ? 0 : t > 1 ? 1 : t;
  return u * u * u * (u * (u * 6 - 15) + 10);
}

const clampInt = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

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

/**
 * Hauteur de la TERRE FERME au CENTRE d'une case, avant creusement de l'eau : la colline monte, tout
 * le reste (eau comprise : son lit est creusé ensuite, d'après le champ d'eau) est à plat.
 */
function tileTarget(world, x, y) {
  const t = world.tiles[y * world.cols + x];
  return t && t.terrain === 'hill' ? hillHeight(world, x, y) : 0;
}

/** Champ de hauteur et masques d'un monde, calculés une fois et mémorisés (clé : l'objet monde). */
const FIELDS = new WeakMap();

function getField(world) {
  let f = FIELDS.get(world);
  if (f && f.cols === world.cols && f.rows === world.rows) return f;
  const { cols, rows } = world;
  const n = cols * rows;
  const base = new Float32Array(n);    // hauteur de la terre ferme (colline comprise)
  const flat = new Float32Array(n);    // 1 : surface tenue à plat (bâti, zone humide) — pas de micro-relief
  const wet = new Float32Array(n);     // 1 : eau profonde (rivière, lac)
  const marsh = new Float32Array(n);   // 1 : zone humide
  const depth = new Float32Array(n);   // creusement du lit sous la ligne d'eau
  const water = new Uint8Array(n);
  const riverDepth = WATER_LEVEL - BED_RIVER, lakeDepth = WATER_LEVEL - BED_LAKE;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const t = world.tiles[i];
      const terrain = t ? t.terrain : 'grass';
      base[i] = tileTarget(world, x, y);
      water[i] = isWaterTerrain(terrain) ? 1 : 0;
      wet[i] = water[i];
      marsh[i] = isShallowWater(terrain) ? 1 : 0;
      depth[i] = terrain === 'lake' ? lakeDepth : riverDepth;
      flat[i] = t && (t.building || isShallowWater(terrain)) ? 1 : 0;
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
  // La profondeur du lit s'étale sur la terre voisine : au bord d'un lac, le lit plonge comme un lac.
  spreadFromMask(depth, 1, water, cols, rows, riverDepth, 2);
  f = { cols, rows, base, flat: spread, wet, marsh, depth, water, seed: (world.seed | 0) };
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

/** Même échantillonnage, pour un champ à plusieurs composantes (couleurs, courant). */
function sampleSmoothN(field, comps, c, cols, rows, x, z) {
  const fx = x - 0.5, fz = z - 0.5;
  const x0 = Math.floor(fx), z0 = Math.floor(fz);
  const tx = smootherstep(fx - x0), tz = smootherstep(fz - z0);
  const at = (gx, gz) => field[(clampInt(gz, 0, rows - 1) * cols + clampInt(gx, 0, cols - 1)) * comps + c];
  const a = at(x0, z0), b = at(x0 + 1, z0), cc = at(x0, z0 + 1), d = at(x0 + 1, z0 + 1);
  return lerp(lerp(a, b, tx), lerp(cc, d, tx), tz);
}

/**
 * Étale les valeurs des cases du masque sur leurs voisines (moyenne pondérée, `passes` anneaux).
 * L'eau garde ainsi SA couleur, SON calque et SON courant jusque sous la berge : rien de la terre
 * voisine ne déteint sur la nappe quand on l'échantillonne au-delà du centre des cases d'eau.
 * Mute `values` sur place ; les cases hors de portée reçoivent `fallback`.
 */
function spreadFromMask(values, comps, mask, cols, rows, fallback, passes = 2) {
  const n = cols * rows;
  const known = Uint8Array.from(mask);
  const acc = new Float32Array(comps);
  for (let pass = 0; pass < passes; pass++) {
    const next = Uint8Array.from(known);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        if (known[i]) continue;
        acc.fill(0);
        let total = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            const j = ny * cols + nx;
            if (!known[j]) continue;
            const w = dx === 0 || dy === 0 ? 1 : 0.5;
            for (let c = 0; c < comps; c++) acc[c] += values[j * comps + c] * w;
            total += w;
          }
        }
        if (total <= 0) continue;
        for (let c = 0; c < comps; c++) values[i * comps + c] = acc[c] / total;
        next[i] = 1;
      }
    }
    known.set(next);
  }
  for (let i = 0; i < n; i++) {
    if (known[i]) continue;
    for (let c = 0; c < comps; c++) values[i * comps + c] = Array.isArray(fallback) ? fallback[c] : fallback;
  }
  return values;
}

/**
 * Serpentement du rivage, dans [−1, 1] : deux octaves de bruit continu en coordonnées monde. La grande
 * houle domine, pour que les deux rives d'une rivière bougent ensemble plutôt que de la pincer.
 */
function shoreNoise(seed, x, z, k) {
  const a = valueNoise(seed, x / SHORE_WOBBLE_SCALE[0], z / SHORE_WOBBLE_SCALE[0], k);
  const b = valueNoise(seed, x / SHORE_WOBBLE_SCALE[1], z / SHORE_WOBBLE_SCALE[1], k + 1);
  return ((a - 0.5) * 1.4 + (b - 0.5) * 0.6);
}

/**
 * Fenêtre du serpentement : 1 dans la bande de transition (autour de la ligne de niveau 0,5),
 * 0 au centre des cases (champ à 0 ou à 1). Deux garanties précieuses :
 *   - le champ vaut EXACTEMENT 1 au centre des cases d'eau et sur les segments qui les joignent →
 *     la rivière reste continue d'un bout à l'autre, quelle que soit la graine ;
 *   - le champ vaut EXACTEMENT 0 au centre des cases de terre → aucune flaque détachée, et la hauteur
 *     de pose d'un bâtiment riverain ne bouge pas d'un pouce.
 */
function wobbleWindow(f0) {
  return 1 - smootherstep((Math.abs(f0 - 0.5) - 0.12) / 0.33);
}

/** Champ brut + serpentement, commun à l'eau profonde et aux zones humides. */
function wobbledField(values, f, x, z, key) {
  const f0 = sampleSmooth(values, f.cols, f.rows, x, z);
  const w = wobbleWindow(f0);
  if (w <= 0) return f0;
  return f0 + SHORE_WOBBLE * FIELD_SLOPE * w * shoreNoise(f.seed ^ key, x, z, key);
}

/**
 * CHAMP D'EAU PROFONDE en coordonnées continues : ≥ 0,5 dans l'eau, 0,5 exactement sur le rivage,
 * 1 au centre d'une case d'eau entourée d'eau. C'est LUI qui dessine la rivière : la nappe, le lit et
 * la berge en sont tous tirés, donc ils ne peuvent pas se contredire.
 */
export function waterField(world, x, z) {
  const f = getField(world);
  return wobbledField(f.wet, f, x, z, 0x1ea0);
}

/** Même champ pour les zones humides (contour propre, décalé du précédent par une autre graine). */
export function marshField(world, x, z) {
  const f = getField(world);
  return wobbledField(f.marsh, f, x, z, 0x6a5d);
}

/** Distance signée au rivage, en unités monde : > 0 dans l'eau, 0 sur la ligne d'eau, < 0 sur la terre. */
export function shoreDistance(world, x, z) {
  return (waterField(world, x, z) - 0.5) / FIELD_SLOPE;
}

/** Vrai si le point continu (x, z) est dans l'eau profonde (du bon côté de la ligne de niveau). */
export function isWaterAt(world, x, z) {
  return waterField(world, x, z) >= 0.5;
}

/**
 * Profil de la BERGE : 0 sur la terre ferme, 1 à la ligne d'eau et au-delà. Parabole (dérivée nulle
 * côté plaine, franche côté eau) : la berge quitte l'eau avec une vraie pente puis s'adoucit dans la
 * prairie — une plage, pas un biseau mou qui lutterait avec le plan d'eau.
 */
function bankBlend(f) {
  if (f >= 0.5) return 1;
  if (f <= 0) return 0;
  const t = 2 * f;
  return t * t;
}

/** Profil du LIT : 0 à la ligne d'eau, 1 au cœur de l'eau ; plonge franchement puis s'aplatit. */
function bedBlend(f) {
  if (f <= 0.5) return 0;
  const v = clamp01((f - 0.5) * 2);
  return v * (2 - v);
}

/**
 * HAUTEUR RÉELLE DU TERRAIN en coordonnées CONTINUES (x, z) : c'est la surface qu'on voit, et elle est
 * CONTINUE PARTOUT (plus aucun raccord à la frontière des cases d'eau). Construction :
 *   terre ferme interpolée → ramenée à `WATER_LEVEL` sur le rivage (profil `bankBlend`) → creusée vers
 *   le lit à l'intérieur (profil `bedBlend`) → creusée encore par le micro-relief et la cuvette des
 *   zones humides, tous deux éteints au bord de l'eau.
 * Deux propriétés exactes en découlent :
 *   - `heightAt == WATER_LEVEL` exactement sur la ligne de niveau 0,5 du champ d'eau (le bord de la
 *     nappe) ; au-dessus à l'extérieur, en dessous à l'intérieur → ni trou ni débordement ;
 *   - hors de l'eau la surface ne descend JAMAIS sous `WATER_LEVEL` (la terre ferme est à 0 au moins,
 *     soit 0,16 au-dessus, et les creux cumulés valent au plus DIP + WETLAND_DEPTH = 0,065).
 */
export function heightAt(world, x, z) {
  const f = getField(world);
  const base = sampleSmooth(f.base, f.cols, f.rows, x, z);
  const wf = waterField(world, x, z);
  const bank = bankBlend(wf);
  let h = base + (WATER_LEVEL - base) * bank;
  if (wf > 0.5) h -= sampleSmooth(f.depth, f.cols, f.rows, x, z) * bedBlend(wf);
  if (bank < 1) {
    const flat = sampleSmooth(f.flat, f.cols, f.rows, x, z);
    let sink = 0;
    if (flat < 1) sink += DIP * valueNoise(f.seed ^ 0x51f1, x / DIP_SCALE, z / DIP_SCALE, 11) * (1 - flat);
    const mf = marshField(world, x, z);
    if (mf > 0) sink += WETLAND_DEPTH * clamp01(mf);
    h -= (1 - bank) * sink;
  }
  return h;
}

/**
 * Altitude de la surface sur laquelle poser un décor ou un bâtiment en (x, y) — CONTRAT INCHANGÉ
 * (buildings.js, roads.js, actors.js, ghost.js, species.js) : 0 sur la terre plate, `WATER_LEVEL` sur
 * l'eau, `hillHeight` sur une colline. Le maillage passe exactement par cette valeur au centre des cases
 * bâties ; sur les cases naturelles les creux continus (micro-relief, cuvette de zone humide) peuvent
 * descendre jusqu'à `DIP` sous elle (jamais au-dessus).
 */
export function surfaceHeight(world, x, y) {
  const tile = world.tiles[y * world.cols + x];
  if (!tile) return 0;
  if (tile.terrain === 'hill') return hillHeight(world, x, y);
  if (isWaterTerrain(tile.terrain)) return WATER_LEVEL;
  return 0;
}

// ---------------------------------------------------------------------------------------------
// Extraction de contour (marching squares) : un maillage soudé pour la région « champ ≥ iso »
// ---------------------------------------------------------------------------------------------

/**
 * MAILLAGE D'UNE LIGNE DE NIVEAU. `field` est échantillonné sur une grille de nx × nz sommets espacés
 * de `step` (le sommet (i, j) est en (i·step, j·step)) ; la fonction renvoie la surface couvrant
 * `field ≥ iso`, découpée case de grille par case de grille (marching squares « plein ») :
 *   { xz: Float32Array (2 par sommet), index: number[] (triangles), count }.
 * Les sommets sont SOUDÉS : un coin de grille et un point de traversée d'arête sont partagés par les
 * cases voisines (clé = indice de coin ou d'arête), donc aucune fente ne peut apparaître.
 * Le parcours des quatre coins dans le sens trigonométrique vu du dessus (+Y) donne des polygones
 * convexes (triangle à hexagone) qu'un éventail triangule sans recouvrement, y compris au point selle.
 */
export function contourMesh(field, nx, nz, step, iso) {
  const total = nx * nz;
  const keyed = new Map();
  const xs = [], zs = [];
  const index = [];
  const poly = [];

  const corner = (i, j) => {
    const key = j * nx + i;
    let v = keyed.get(key);
    if (v === undefined) {
      v = xs.length;
      keyed.set(key, v);
      xs.push(i * step); zs.push(j * step);
    }
    return v;
  };
  const crossing = (i1, j1, i2, j2) => {
    // Clé canonique : arête repérée par son extrémité de plus petit indice, + son axe.
    const swap = j2 * nx + i2 < j1 * nx + i1;
    const ia = swap ? i2 : i1, ja = swap ? j2 : j1;
    const ib = swap ? i1 : i2, jb = swap ? j1 : j2;
    const key = total * (ia === ib ? 2 : 1) + ja * nx + ia;
    let v = keyed.get(key);
    if (v === undefined) {
      const fa = field[ja * nx + ia], fb = field[jb * nx + ib];
      const d = fb - fa;
      const t = Math.abs(d) < 1e-9 ? 0.5 : clamp01((iso - fa) / d);
      v = xs.length;
      keyed.set(key, v);
      xs.push((ia + (ib - ia) * t) * step); zs.push((ja + (jb - ja) * t) * step);
    }
    return v;
  };

  for (let j = 0; j < nz - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      // Coins dans le sens trigonométrique vu du dessus : (i,j) → (i,j+1) → (i+1,j+1) → (i+1,j).
      const ci = [i, i, i + 1, i + 1], cj = [j, j + 1, j + 1, j];
      const f0 = field[j * nx + i], f1 = field[(j + 1) * nx + i];
      const f2 = field[(j + 1) * nx + i + 1], f3 = field[j * nx + i + 1];
      const inMask = (f0 >= iso ? 1 : 0) | (f1 >= iso ? 2 : 0) | (f2 >= iso ? 4 : 0) | (f3 >= iso ? 8 : 0);
      if (inMask === 0) continue;
      if (inMask === 15) {
        const a = corner(i, j), b = corner(i, j + 1), c = corner(i + 1, j + 1), d = corner(i + 1, j);
        index.push(a, b, c, a, c, d);
        continue;
      }
      poly.length = 0;
      for (let k = 0; k < 4; k++) {
        const k2 = (k + 1) & 3;
        const inK = (inMask >> k) & 1, inN = (inMask >> k2) & 1;
        if (inK) poly.push(corner(ci[k], cj[k]));
        if (inK !== inN) poly.push(crossing(ci[k], cj[k], ci[k2], cj[k2]));
      }
      for (let k = 1; k + 1 < poly.length; k++) index.push(poly[0], poly[k], poly[k + 1]);
    }
  }

  const xz = new Float32Array(xs.length * 2);
  for (let v = 0; v < xs.length; v++) { xz[v * 2] = xs[v]; xz[v * 2 + 1] = zs[v]; }
  return { xz, index, count: xs.length };
}

// ---------------------------------------------------------------------------------------------
// Hachures du mode daltonien (partagées par la terre et l'eau)
// ---------------------------------------------------------------------------------------------

/** Déclarations communes aux shaders de sol : valeur du calque par sommet et position monde. */
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

/** Corps de vertex commun : position monde du sommet et valeur du calque (après `begin_vertex`). */
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
attribute vec2 aStyle;
attribute float aShore;
attribute float aQuality;
varying vec2 vWaterPos;
varying vec2 vFlow;
varying vec2 vStyle;
varying float vShore;
varying float vQuality;
`;

const WATER_VERTEX_BODY = /* glsl */`
vec3 transformed = vec3( position );
{
	vec4 wp = modelMatrix * vec4( position, 1.0 );
	vWaterPos = wp.xz;
	vFlow = aFlow;
	vStyle = aStyle;
	vShore = aShore;
	vQuality = aQuality;
	// Ondulation douce : deux fréquences croisées, fonction de la position monde (continue d'un bout
	// à l'autre de la nappe) et ÉTEINTE sur le rivage, pour que le bord reste glissé sous la berge.
	float w1 = sin( wp.x * 6.1 + wp.z * 2.3 + uTime * 1.9 );
	float w2 = sin( wp.x * 2.7 - wp.z * 5.3 - uTime * 1.3 );
	transformed.y += aStyle.x * ( 0.6 * w1 + 0.4 * w2 ) * smoothstep( 0.0, 0.18, aShore );
}
`;

const WATER_FRAGMENT_PARS = /* glsl */`
uniform float uTime;
uniform vec3 uMurky;
uniform vec3 uShallow;
uniform float uFade;
varying vec2 vWaterPos;
varying vec2 vFlow;
varying vec2 vStyle;
varying float vShore;
varying float vQuality;
${NOISE_GLSL}
`;

/**
 * Corps du fragment, inséré après `color_fragment`. Tout est VOLONTAIREMENT DISCRET — les bandes de
 * courant sont faibles et larges, le scintillement est à peine perceptible, l'écume est une ombre
 * claire au bord. Le sens du courant reste lisible, il n'attire plus l'œil.
 * Depuis le maillage d'eau sinueux, l'écume, le haut-fond et le fondu des zones humides ne lisent plus
 * un masque de côtés de case : ils lisent `vShore`, la DISTANCE AU RIVAGE en unités monde. Le contour
 * étant déjà sinueux, un bruit continu suffit à le rendre irrégulier à toutes les échelles.
 */
const WATER_FRAGMENT_BODY = /* glsl */`
{
	float shore = max( vShore, 0.0 );
	// Bandes claires qui défilent dans le sens du courant (FLOW_SPEED u/s) ; nulles sur l'eau dormante (aStyle.y = 0).
	float along = dot( vWaterPos, vFlow );
	float across = vWaterPos.x * vFlow.y - vWaterPos.y * vFlow.x;
	float phase = ( along - uTime * ${FLOW_SPEED.toFixed(3)} ) * 5.1 + sin( across * 2.2 + uTime * 0.4 ) * 0.7;
	float bands = smoothstep( 0.25, 1.0, sin( phase ) ) * 0.038 * vStyle.y;   // longues ondes, à peine marquées
	// Scintillement : deux ondes croisées, lentes et gauchies l'une par l'autre, très faible.
	float sx = sin( vWaterPos.x * 5.5 + uTime * 1.1 + sin( vWaterPos.y * 2.1 + uTime * 0.4 ) * 1.5 );
	float sz = sin( vWaterPos.y * 4.3 - uTime * 0.9 + sin( vWaterPos.x * 1.7 - uTime * 0.3 ) * 1.6 );
	float shimmer = smoothstep( 0.72, 1.0, sx * sz ) * 0.028;
	// Bruit de rive, continu en coordonnées monde : il brouille écume et haut-fond sans jamais
	// dessiner de limite de case.
	float wobble = ( ttNoise( vWaterPos * 2.4 ) * 0.6 + ttNoise( vWaterPos * 6.3 ) * 0.4 - 0.5 );
	// Écume : fin liseré clair le long du rivage, qui respire.
	float edge = 0.075 + 0.025 * sin( ( vWaterPos.x + vWaterPos.y ) * 5.0 + uTime * 0.9 );
	float foam = ( 1.0 - smoothstep( 0.0, edge, shore + wobble * 0.05 ) ) * ( 0.6 + 0.2 * sin( uTime * 1.3 + along * 3.0 ) );
	// HAUT-FOND : large frange pâle le long des berges, au contour ondulé. C'est elle qui fait lire une
	// rive plutôt qu'un bord de nappe.
	float shallow = 1.0 - smoothstep( 0.0, 0.3, shore + wobble * 0.17 );
	// Eau polluée : la couleur de base glisse vers le vert trouble, les reflets s'éteignent, des voiles
	// d'algues apparaissent (deux ondes lentes), proportionnellement a la pollution (aQuality).
	float q = clamp( vQuality, 0.0, 1.0 );
	float algae = smoothstep( 0.35, 1.0, sin( vWaterPos.x * 2.1 + uTime * 0.17 ) * sin( vWaterPos.y * 1.7 - uTime * 0.13 ) ) * q * 0.25;
	diffuseColor.rgb = mix( diffuseColor.rgb, uMurky, q * ${WATER_MURKY_MIX.toFixed(3)} );
	diffuseColor.rgb = mix( diffuseColor.rgb, uMurky * 0.8, algae );
	diffuseColor.rgb = mix( diffuseColor.rgb, uShallow, shallow * 0.3 * ( 1.0 - 0.7 * q ) );
	float light = clamp( bands + shimmer + foam * 0.22, 0.0, 0.35 ) * ( 1.0 - 0.6 * q );
	diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 1.0 ), light );
	// Fondu du bord (pellicule des zones humides seulement : uFade = 0 sur l'eau profonde, opaque).
	if ( uFade > 0.0 ) diffuseColor.a *= smoothstep( 0.0, uFade, shore + wobble * 0.06 );
}
`;

/**
 * Matériau de l'eau : { material, uniforms } ; `uniforms.uTime.value` est l'horloge (s). La couleur
 * vient des couleurs de sommets (terrain ou calque), un léger éclat propre éclaircit l'eau.
 * `shared` permet de partager `uTime` et `uPattern` entre l'eau profonde et la pellicule des zones
 * humides ; `options.fade` (> 0) fond le bord de la nappe (zones humides), `options.transparent`
 * demande le mélange. Les deux matériaux compilent LE MÊME programme.
 */
export function createWaterMaterial(shared = {}, options = {}) {
  const uniforms = {
    uTime: shared.uTime || { value: 0 },
    uMurky: { value: new THREE.Color(WATER_MURKY) },
    uShallow: { value: new THREE.Color(WATER_SHALLOW) },
    uPattern: shared.uPattern || { value: 0 },
    uFade: { value: options.fade || 0 },
  };
  const material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    vertexColors: true,
    emissive: new THREE.Color(PALETTE.river).multiplyScalar(0.18),
    transparent: Boolean(options.transparent),
    depthWrite: !options.transparent,
  });
  material.onBeforeCompile = (shader) => {
    for (const name of Object.keys(uniforms)) shader.uniforms[name] = uniforms[name];
    shader.vertexShader = WATER_VERTEX_PARS + HATCH_VERTEX_PARS
      + shader.vertexShader.replace('#include <begin_vertex>', WATER_VERTEX_BODY + HATCH_VERTEX_BODY);
    shader.fragmentShader = WATER_FRAGMENT_PARS + HATCH_FRAGMENT_PARS
      + shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n' + WATER_FRAGMENT_BODY + HATCH_FRAGMENT_BODY);
  };
  material.customProgramCacheKey = () => 'tiletown-water-6';
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
  const { material: waterMaterial, uniforms } = createWaterMaterial({ uPattern: patternUniform });
  // Pellicule des zones humides : même programme, mais le bord se fond dans la terre.
  const { material: filmMaterial } = createWaterMaterial(
    { uPattern: patternUniform, uTime: uniforms.uTime },
    { fade: WETLAND_FADE, transparent: true },
  );
  const riverColor = new THREE.Color(PALETTE.river);
  const skirtTopColor = new THREE.Color(PALETTE.soil).multiplyScalar(1.12);
  const skirtBottomColor = new THREE.Color(PALETTE.soil).multiplyScalar(0.70);

  let land = null;    // maillage soudé du terrain (+ jupe du socle)
  let water = null;   // maillage soudé de la rivière et des lacs
  let film = null;    // maillage soudé des zones humides
  let world = null;
  /** Couleurs de terrain par case (linéaires), référence pour les calques. */
  let colors = null;
  /** Grille de sommets du terrain : sub = subdivision, nx/nz = nombre de sommets par axe. */
  let grid = null;
  /** Nappes d'eau : { mesh, xz (2 par sommet), mask (cases sources), tint } pour les mises à jour. */
  let sheets = [];
  /** Valeurs du calque actif normalisées (0 à 1) par case, ou null : conservées pour les hachures. */
  let layerField = null;
  /** Qualité de l'eau par case (0 à 1), ou null : conservée d'un monde à l'autre. */
  let qualityField = null;
  /** Texture du liseré de grille (cases désignées par setGridHint). */
  let hintTexture = null;
  const stats = {
    tiles: 0, land: 0, water: 0, wetland: 0, hills: 0, drawables: 0, pattern: 0,
    vertices: 0, triangles: 0, waterVertices: 0, waterTriangles: 0, subdiv: SUBDIV,
  };

  const color = new THREE.Color();
  const tint = new THREE.Color();

  /** Teinte de la pellicule des zones humides : la couleur de la case, à moitié vers l'eau courante. */
  function filmTint(out, src) {
    return out.copy(src).lerp(riverColor, 0.5);
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
    const { sub, nx, nz } = grid;
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
    stats.vertices = total;
    stats.triangles = indices.length / 3;
  }

  // -------------------------------------------------------------------------------------------
  // Nappes d'eau soudées (rivière + lacs, zones humides)
  // -------------------------------------------------------------------------------------------

  /**
   * Construit UNE nappe d'eau : extraction de la ligne de niveau du champ, puis attributs par sommet.
   * `spec` = { name, material, field(x, z), mask (1 par case source), iso, levelAt(x, z), flow, tinted }.
   */
  function buildSheet(spec) {
    const { sub, nx, nz } = grid;
    const samples = new Float32Array(nx * nz);
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) samples[j * nx + i] = spec.field(i / sub, j / sub);
    }
    const { xz, index, count } = contourMesh(samples, nx, nz, 1 / sub, spec.iso);

    const position = new Float32Array(count * 3);
    const normal = new Float32Array(count * 3);
    const aShore = new Float32Array(count);
    const aFlow = new Float32Array(count * 2);
    const aStyle = new Float32Array(count * 2);
    for (let v = 0; v < count; v++) {
      const x = xz[v * 2], z = xz[v * 2 + 1];
      position[v * 3] = x; position[v * 3 + 1] = spec.levelAt(x, z); position[v * 3 + 2] = z;
      normal[v * 3 + 1] = 1;
      aShore[v] = (spec.field(x, z) - 0.5) / FIELD_SLOPE;
      if (spec.flow) {
        let fx = sampleSmoothN(spec.flow, 2, 0, world.cols, world.rows, x, z);
        let fz = sampleSmoothN(spec.flow, 2, 1, world.cols, world.rows, x, z);
        const len = Math.hypot(fx, fz);
        if (len > 0.25) { fx /= len; fz /= len; }
        aFlow[v * 2] = fx; aFlow[v * 2 + 1] = fz;
      }
      aStyle[v * 2] = sampleSmoothN(spec.style, 2, 0, world.cols, world.rows, x, z);
      aStyle[v * 2 + 1] = sampleSmoothN(spec.style, 2, 1, world.cols, world.rows, x, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aShore', new THREE.BufferAttribute(aShore, 1));
    geometry.setAttribute('aFlow', new THREE.BufferAttribute(aFlow, 2));
    geometry.setAttribute('aStyle', new THREE.BufferAttribute(aStyle, 2));
    geometry.setAttribute('aLayer', new THREE.BufferAttribute(new Float32Array(count).fill(-1), 1));
    geometry.setAttribute('aQuality', new THREE.BufferAttribute(new Float32Array(count), 1));
    geometry.setIndex(index);
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, spec.material);
    mesh.name = spec.name;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.visible = index.length > 0;
    return { mesh, xz, count, mask: spec.mask, tinted: Boolean(spec.tinted), triangles: index.length / 3 };
  }

  /** Champ par case étalé sur la terre voisine puis échantillonné sur les sommets d'une nappe. */
  function writeSheetScalar(sheet, values, attrName, fallback) {
    const { cols, rows } = world;
    const attr = sheet.mesh.geometry.attributes[attrName];
    if (!attr) return;
    const spread = new Float32Array(cols * rows);
    if (values) spread.set(values.subarray ? values.subarray(0, cols * rows) : values.slice(0, cols * rows));
    else spread.fill(fallback);
    spreadFromMask(spread, 1, sheet.mask, cols, rows, fallback);
    for (let v = 0; v < sheet.count; v++) {
      attr.array[v] = sampleSmooth(spread, cols, rows, sheet.xz[v * 2], sheet.xz[v * 2 + 1]);
    }
    attr.needsUpdate = true;
  }

  /** Couleurs par case (linéaires) étalées sur la terre voisine puis fondues sur les sommets. */
  function writeSheetColors(sheet, src) {
    const { cols, rows } = world;
    const attr = sheet.mesh.geometry.attributes.color;
    const rgb = Float32Array.from(src.subarray ? src.subarray(0, cols * rows * 3) : src.slice(0, cols * rows * 3));
    if (sheet.tinted) {
      for (let i = 0; i < cols * rows; i++) {
        if (!sheet.mask[i]) continue;
        color.setRGB(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
        filmTint(tint, color).toArray(rgb, i * 3);
      }
    }
    spreadFromMask(rgb, 3, sheet.mask, cols, rows, [riverColor.r, riverColor.g, riverColor.b]);
    for (let v = 0; v < sheet.count; v++) {
      const x = sheet.xz[v * 2], z = sheet.xz[v * 2 + 1];
      for (let c = 0; c < 3; c++) attr.array[v * 3 + c] = sampleSmoothN(rgb, 3, c, cols, rows, x, z);
    }
    attr.needsUpdate = true;
  }

  /** Couleurs de sommet de la nappe de terre : échantillonnage lissé du champ de couleurs par case. */
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

  /** Valeurs du calque par sommet de la terre (−1 hors calque) et de chaque nappe d'eau. */
  function writeLayerField(field) {
    if (!world || !land || !grid) return;
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
    for (const sheet of sheets) writeSheetScalar(sheet, field, 'aLayer', -1);
  }

  /** Écrit l'attribut `aQuality` (pollution de l'eau, 0 à 1) sur l'eau profonde et les zones humides. */
  function writeQualityField(field) {
    if (!world) return;
    for (const sheet of sheets) writeSheetScalar(sheet, field, 'aQuality', 0);
  }

  function clear() {
    for (const mesh of [land, water, film]) {
      if (!mesh) continue;
      group.remove(mesh);
      mesh.geometry.dispose();
    }
    land = water = film = null;
    grid = null;
    sheets = [];
    stats.drawables = 0;
  }

  function setWorld(nextWorld) {
    clear();
    world = nextWorld;
    const { cols, rows, tiles } = world;
    const n = cols * rows;
    colors = new Float32Array(n * 3);

    const waterMask = new Uint8Array(n);
    const marshMask = new Uint8Array(n);
    const flow = new Float32Array(n * 2);
    const waterStyle = new Float32Array(n * 2);
    const marshStyle = new Float32Array(n * 2);
    let landCount = 0, waterCount = 0, wetCount = 0, hillCount = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const t = tiles[i];
        const terrain = t ? t.terrain : 'grass';
        color.set(groundColorHex(terrain));
        color.toArray(colors, i * 3);
        if (isWaterTerrain(terrain)) {
          waterCount++;
          waterMask[i] = 1;
          const v = flowVector(t ? t.flow : null);
          flow[i * 2] = v[0]; flow[i * 2 + 1] = v[1];
          const style = WATER_STYLES[terrain] || WATER_STYLES.lake;
          waterStyle[i * 2] = style[0]; waterStyle[i * 2 + 1] = style[1];
        } else {
          landCount++;
        }
        if (terrain === 'hill') hillCount++;
        if (isShallowWater(terrain)) {
          wetCount++;
          marshMask[i] = 1;
          marshStyle[i * 2] = WATER_STYLES.wetland[0]; marshStyle[i * 2 + 1] = WATER_STYLES.wetland[1];
        }
      }
    }
    // Courant et style débordent d'une case sur la terre voisine : la nappe les lit jusque sous la berge.
    spreadFromMask(flow, 2, waterMask, cols, rows, 0);
    spreadFromMask(waterStyle, 2, waterMask, cols, rows, WATER_STYLES.lake);
    spreadFromMask(marshStyle, 2, marshMask, cols, rows, WATER_STYLES.wetland);

    const sub = cols * rows > SUBDIV_LIMIT ? 3 : SUBDIV;
    grid = { sub, nx: cols * sub + 1, nz: rows * sub + 1 };
    buildLand();

    const waterSheet = buildSheet({
      name: 'water',
      material: waterMaterial,
      mask: waterMask,
      flow,
      style: waterStyle,
      // La nappe déborde un peu sous la berge : son bord est masqué par la terre, qui est déjà
      // au-dessus du niveau de l'eau là où il passe. Ni filet de terre nue, ni z-fighting.
      iso: 0.5 - WATER_OVERLAP,
      field: (x, z) => waterField(world, x, z),
      levelAt: () => WATER_LEVEL,
    });
    const filmSheet = buildSheet({
      name: 'wetland-film',
      material: filmMaterial,
      mask: marshMask,
      flow: null,
      style: marshStyle,
      iso: 0.5,
      tinted: true,
      field: (x, z) => marshField(world, x, z),
      // La pellicule épouse le fond de la cuvette creusée par `heightAt` : toujours 6 mm au-dessus
      // du sol, donc jamais enfouie ni flottante, et visiblement EN CREUX dans la prairie.
      levelAt: (x, z) => heightAt(world, x, z) + WETLAND_FILM_LEVEL,
    });
    water = waterSheet.mesh;
    film = filmSheet.mesh;
    sheets = [waterSheet, filmSheet];

    writeVertexColors(colors);
    for (const sheet of sheets) writeSheetColors(sheet, colors);
    setGridHint(null);

    group.add(land, water, film);
    stats.tiles = n; stats.land = landCount; stats.water = waterCount; stats.wetland = wetCount; stats.hills = hillCount;
    stats.waterVertices = waterSheet.count + filmSheet.count;
    stats.waterTriangles = waterSheet.triangles + filmSheet.triangles;
    stats.drawables = 1 + (waterSheet.triangles > 0 ? 1 : 0) + (filmSheet.triangles > 0 ? 1 : 0);
    stats.subdiv = sub;
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
    if (!world || !land) return;
    const src = rgb || colors;
    // Calque affiché : les finitions du paysage s'effacent pour ne pas salir les couleurs du calque.
    landUniforms.uFinish.value = rgb ? 0.3 : 1;
    writeVertexColors(src);
    for (const sheet of sheets) writeSheetColors(sheet, src);
  }

  /** Fait avancer l'eau de `dt` secondes (rien d'autre à faire : l'ondulation et les bandes sont dans le shader). */
  function update(dt) {
    if (Number.isFinite(dt) && dt > 0) uniforms.uTime.value += dt;
  }

  function dispose() {
    clear();
    if (hintTexture) { hintTexture.dispose(); hintTexture = null; }
    landMaterial.dispose();
    waterMaterial.dispose();
    filmMaterial.dispose();
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
    /** Matériau de l'eau profonde (débogage, mesure). */
    get waterMaterial() { return waterMaterial; },
    /** Matériau de la pellicule des zones humides (débogage, mesure). */
    get filmMaterial() { return filmMaterial; },
    /** Matériau et réglages du terrain (débogage, mesure). */
    get landMaterial() { return landMaterial; },
    get landUniforms() { return landUniforms; },
    setTileColors,
    /** Copie des couleurs de terrain (linéaires) par case. */
    baseColors() { return colors ? colors.slice() : null; },
    dispose,
  };
}
