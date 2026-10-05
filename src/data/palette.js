// Palette commune de Tiletown : 24 teintes, partagées par les modèles 3D (quantification des
// couleurs des kits), le sol, les calques et l'interface. Une seule source de vérité.
// Les clés sont des rôles ; `hex` est la couleur. Toute nouvelle couleur passe par ici.
//
// Au-delà de ces 24 teintes « de jeu » (qui ont chacune une variable CSS `--c-<rôle>`), les MODÈLES 3D
// disposent de teintes complémentaires (`MODEL_TINTS`) et de SOUS-PALETTES PAR RÔLE (toiture, façade,
// feuillage…). L'import des modèles (tools/import-models.js) n'attribue plus la teinte « la plus
// proche » : il devine le RÔLE d'une zone (toit, mur, menuiserie, vitrage, végétation, tronc, roche,
// métal, sol) puis tire dans la sous-palette de ce rôle une teinte stable (`roleColor`). Deux variantes
// d'un même bâtiment reçoivent ainsi des toits et des façades différents, tout en restant dans la
// même harmonie.

export const PALETTE = Object.freeze({
  grassLight:   '#8fcf6f', // herbe claire, prairie
  grass:        '#6fb85a', // herbe courante
  forestDark:   '#4f9a4a', // feuillage de forêt dense, pins
  wheat:        '#e9c46a', // champ mûr, blé
  soil:         '#c9a86a', // champ labouré, chemin de terre
  river:        '#5fb3d9', // eau courante
  lakeDeep:     '#3f8fc2', // eau profonde
  wetland:      '#7fb89a', // zone humide, roseaux
  rock:         '#a8a39a', // roche, colline
  rockLight:    '#c9c4b8', // roche claire, gravier
  roofRed:      '#d9654a', // toits de tuiles
  roofOrange:   '#e59a5a', // toits orangés, auvents
  roofSlate:    '#7a8fb5', // toits d'ardoise, bureaux
  wallCream:    '#f4efe6', // murs clairs
  wallBeige:    '#e8d8c0', // murs beiges
  wallTan:      '#c9b8a0', // murs bruns clairs, bois clair
  wood:         '#8b5a3c', // bois, troncs
  asphalt:      '#5a5a66', // chaussée
  sidewalk:     '#9a9aa6', // trottoirs, béton
  marking:      '#f2f2f2', // marquages au sol, blanc
  metal:        '#7d8591', // usines, métal
  metalLight:   '#b8bcc4', // métal clair, éoliennes
  blossom:      '#e85d75', // fleurs, accents roses
  sun:          '#f7d84a', // jaune : panneaux, fleurs, accents
});

export const PALETTE_LIST = Object.freeze(Object.values(PALETTE));

/**
 * Teintes RÉSERVÉES AUX MODÈLES 3D : elles prolongent les 24 teintes ci-dessus (même harmonie, même
 * douceur) pour donner du caractère aux toitures, aux façades et aux feuillages. Elles n'ont pas de
 * variable CSS : l'interface, le sol et les calques n'utilisent que `PALETTE`.
 */
export const MODEL_TINTS = Object.freeze({
  // Toitures : terracotta, ardoise, brun doux, tuile claire
  roofTerracotta: '#c25a3f', // terracotta profond
  roofSlateDark:  '#5d7193', // ardoise bleutée foncée
  roofBrown:      '#9a6a4e', // brun doux
  roofTile:       '#e0a070', // tuile claire, chaude
  // Façades pastel
  wallBlue:       '#dde8f2', // pastel bleu
  wallGreen:      '#dfe9d6', // pastel vert
  wallPink:       '#f5dedf', // pastel rose
  wallOchre:      '#efdcad', // pastel jaune, ocre pâle
  // Soubassements et seconds tons de façade
  baseStone:      '#b9b0a2', // pierre grise chaude
  baseWarm:       '#d3bd9c', // enduit chaud
  // Feuillages (avec grassLight, grass et forestDark : cinq verts)
  foliageOlive:   '#7cae52', // vert olive
  foliageSpring:  '#a3d474', // vert tendre
  foliageDeep:    '#3e7c47', // vert profond
  // Troncs
  trunkDark:      '#6d4630', // écorce sombre
  trunkLight:     '#a37a55', // écorce claire, bouleau
  // Vitrages
  glass:          '#a8cbe8', // vitre claire
  glassDeep:      '#6b90b6', // vitre profonde
});

/** Toutes les teintes disponibles aux modèles 3D : les 24 du jeu + les teintes de modèles. */
export const MODEL_PALETTE = Object.freeze({ ...PALETTE, ...MODEL_TINTS });

/** Liste des teintes des modèles (ordre stable : sert d'index de palette au manifeste). */
export const MODEL_COLORS = Object.freeze(Object.values(MODEL_PALETTE));

// ─── Sous-palettes par rôle (clés de MODEL_PALETTE) ──────────────────────────────────────────────
// Chaque liste est ordonnée du plus clair / plus courant au plus sombre / plus rare.

/** Toitures en pente : terracotta, tuile claire, ardoise, brun doux. */
export const ROOF_COLORS = Object.freeze(['roofRed', 'roofTerracotta', 'roofTile', 'roofSlate', 'roofSlateDark', 'roofBrown']);
/** Toitures-terrasses : gravier, ardoise, zinc. */
export const ROOF_FLAT_COLORS = Object.freeze(['roofSlate', 'roofSlateDark', 'rock', 'asphalt', 'baseStone']);
/** Façades : crème et pastels. */
export const WALL_COLORS = Object.freeze(['wallCream', 'wallBeige', 'wallBlue', 'wallGreen', 'wallPink', 'wallOchre']);
/** Soubassements et seconds tons de façade (plus soutenus que WALL_COLORS). */
export const BASE_COLORS = Object.freeze(['wallTan', 'baseStone', 'baseWarm', 'rockLight', 'sidewalk']);
/** Feuillages : cinq verts. */
export const FOLIAGE_COLORS = Object.freeze(['foliageSpring', 'grass', 'foliageOlive', 'forestDark', 'foliageDeep']);
/** Troncs et bois de charpente. */
export const TRUNK_COLORS = Object.freeze(['trunkLight', 'wood', 'trunkDark']);
/** Menuiseries, encadrements, bordures. */
export const TRIM_COLORS = Object.freeze(['marking', 'wood', 'trunkDark', 'roofSlateDark']);
/** Vitrages. */
export const GLASS_COLORS = Object.freeze(['glass', 'glassDeep', 'lakeDeep']);
/** Roches et graviers. */
export const ROCK_COLORS = Object.freeze(['rockLight', 'rock', 'baseStone']);
/** Métal (usines, cuves, mâts). */
export const METAL_COLORS = Object.freeze(['metalLight', 'metal', 'sidewalk']);
/** Sols : dalle, pelouse de pied d'immeuble, terre. */
export const GROUND_COLORS = Object.freeze(['grassLight', 'grass', 'soil', 'rockLight']);
/** Accents vifs : auvents, enseignes, fleurs. */
export const ACCENT_COLORS = Object.freeze(['roofOrange', 'blossom', 'sun', 'river']);

/** Sous-palette de chaque rôle. `roleColor(role, graine)` y tire une teinte stable. */
export const ROLE_PALETTES = Object.freeze({
  roof: ROOF_COLORS,
  roofFlat: ROOF_FLAT_COLORS,
  wall: WALL_COLORS,
  base: BASE_COLORS,
  foliage: FOLIAGE_COLORS,
  trunk: TRUNK_COLORS,
  trim: TRIM_COLORS,
  glass: GLASS_COLORS,
  rock: ROCK_COLORS,
  metal: METAL_COLORS,
  ground: GROUND_COLORS,
  accent: ACCENT_COLORS,
});

/** Vrai si `name` est un rôle de sous-palette (par opposition à une teinte nommée). */
export function isRole(name) {
  return Object.prototype.hasOwnProperty.call(ROLE_PALETTES, name);
}

/** Hachage FNV-1a d'une graine (chaîne ou nombre) : même graine → même entier. */
export function hashSeed(seed) {
  const s = String(seed);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Teinte d'un rôle pour une graine donnée : renvoie une CLÉ de `MODEL_PALETTE`, stable.
 * `offset` décale dans la sous-palette : deux zones de même rôle dans un même modèle (par exemple le
 * mur clair et le soubassement, ou deux verts d'un feuillage) reçoivent des teintes différentes.
 * Un nom de teinte (hors sous-palettes) est renvoyé tel quel : on peut imposer une couleur exacte.
 */
export function roleColor(role, seed = 0, offset = 0) {
  const list = ROLE_PALETTES[role];
  if (!list) {
    if (Object.prototype.hasOwnProperty.call(MODEL_PALETTE, role)) return role;
    throw new Error(`rôle ou teinte inconnue : ${role}`);
  }
  const i = (hashSeed(seed) + Math.round(offset)) % list.length;
  return list[i];
}

/** Couleur « #rrggbb » d'un rôle ou d'une teinte nommée, pour une graine donnée. */
export function roleHex(role, seed = 0, offset = 0) {
  return MODEL_PALETTE[roleColor(role, seed, offset)];
}

/** Convertit « #rrggbb » en [r, g, b] (0-255). */
export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Convertit [r, g, b] (0-255) en teinte, saturation, luminosité ([0..360], [0..1], [0..1]). */
export function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h;
  if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

/** Teinte de la palette la plus proche d'une couleur [r, g, b] (distance euclidienne simple). */
export function nearestPaletteHex(rgb) {
  let best = PALETTE_LIST[0];
  let bestD = Infinity;
  for (const hex of PALETTE_LIST) {
    const [r, g, b] = hexToRgb(hex);
    const d = (r - rgb[0]) ** 2 + (g - rgb[1]) ** 2 + (b - rgb[2]) ** 2;
    if (d < bestD) { bestD = d; best = hex; }
  }
  return best;
}
