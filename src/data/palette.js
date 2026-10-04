// Palette commune de Tiletown : 24 teintes, partagées par les modèles 3D (quantification des
// couleurs des kits), le sol, les calques et l'interface. Une seule source de vérité.
// Les clés sont des rôles ; `hex` est la couleur. Toute nouvelle couleur passe par ici.

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

/** Convertit « #rrggbb » en [r, g, b] (0-255). */
export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
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
