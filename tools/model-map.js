// Table de correspondance : identifiant Tiletown → kit, fichier source, échelle, orientation, empreinte.
// Lue par tools/import-models.js pour produire assets/models/<id>.glb et manifest.json.
//
// Conventions (docs/ARCHITECTURE.md §5) : 1 case = 1 unité, origine au centre de la case, y vers le
// haut, le modèle regarde vers +Z (sud). Repère des rues : N = -Z, S = +Z, E = +X, W = -X.
//
// Champs d'une entrée :
//   kit        slug kenney.nl du kit principal (clé de tools/fetch-kits.js)
//   source     fichier GLB dans « Models/GLB format/ » (ou « Models/GLTF format/ » pour le Nature Kit)
//   scale      échelle uniforme explicite, OU
//   fit        largeur cible (u) de l'empreinte au sol : l'échelle est calculée pour que max(x, z) = fit
//   yaw        rotation (degrés, autour de Y) appliquée à la source pour qu'elle regarde vers +Z
//   footprint  [colonnes, lignes] occupées (toujours [1, 1] pour l'instant)
//   materials  { nomDeMatériauSource: rôleDePalette } : couleur imposée (matériaux sans texture)
//   keepNodes  noms des nœuds à garder séparés (pivot conservé) pour une animation éventuelle
//   parts      assemblage : liste de pièces { kit, source, at, yaw, scale, materials } ou de
//              primitives { primitive: 'box' | 'cylinder' | 'cone', size | radius/height, at, color, topColor }
//   orientation  note lisible sur l'orientation (rues : axe, bras)
//   provisional  true si le modèle est un pis-aller à remplacer
//   note       remarque libre, reportée dans le manifeste

const SUBURBAN = 'city-kit-suburban';
const COMMERCIAL = 'city-kit-commercial';
const INDUSTRIAL = 'city-kit-industrial';
const ROADS = 'city-kit-roads';
const NATURE = 'nature-kit';
const TRAIN = 'train-kit';
const CARS = 'car-kit';
const FANTASY = 'fantasy-town-kit';
const MODULAR = 'modular-buildings';

/**
 * Couleurs imposées par kit pour les matériaux sans texture (nom de matériau source → rôle de palette).
 * Le Nature Kit a des teintes pastel (vert d'eau, pêche) : on les ramène aux rôles attendus.
 */
export const KIT_MATERIALS = {
  [NATURE]: {
    grass: 'grass', leafsGreen: 'grass', leafsDark: 'forestDark', leafsFall: 'roofOrange',
    woodBark: 'wood', woodBarkDark: 'wood', wood: 'wallTan', woodDark: 'wood', woodBirch: 'wallCream', woodInner: 'wallBeige',
    dirt: 'soil', dirtDark: 'soil', stone: 'rockLight', stoneDark: 'rock', water: 'river',
    colorRed: 'blossom', colorRedDark: 'roofRed', colorPurple: 'blossom', colorYellow: 'sun', colorWhite: 'wallCream',
    colorTan: 'wallBeige', corn: 'sun', _defaultMat: 'wallCream',
  },
  [FANTASY]: { Water: 'river' },
};

/** Largeur d'empreinte d'un bâtiment sur une case (bande de rue autour). */
const BUILDING_FIT = 0.85;
/** Échelle du Car Kit (voitures à l'échelle réelle, berline 2,55 u) et du Train Kit. */
const CAR_SCALE = 0.35;

// Blocs modulaires Kenney : 1 × 0,625 × 1 u, façade vers +Z ; les coins portent leurs faces vers +X et +Z.
const FLOOR = 0.625;
/** Lacet d'un bloc de coin pour qu'il regarde vers les deux faces extérieures voulues. */
const CORNER_YAW = { frontRight: 0, frontLeft: -90, backLeft: 180, backRight: 90 };

/** Un étage rectangulaire de blocs modulaires (cols × rows), façade +Z au rang z = rows - 1. */
function modularFloor(y, cols, rows, { wall = 'building-window.glb', corner = 'building-corner-window.glb', front = {} } = {}) {
  const parts = [];
  const x0 = -(cols - 1) / 2;
  const z0 = -(rows - 1) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c;
      const z = z0 + r;
      const isFront = r === rows - 1;
      const isBack = r === 0;
      const isLeft = c === 0;
      const isRight = c === cols - 1;
      let source = wall;
      let yaw = 0;
      if (isFront && isLeft) { source = corner; yaw = CORNER_YAW.frontLeft; }
      else if (isFront && isRight) { source = corner; yaw = CORNER_YAW.frontRight; }
      else if (isBack && isLeft) { source = corner; yaw = CORNER_YAW.backLeft; }
      else if (isBack && isRight) { source = corner; yaw = CORNER_YAW.backRight; }
      else if (isFront) { source = front[c] || wall; yaw = 0; }
      else if (isBack) { yaw = 180; }
      else if (isLeft) { yaw = -90; }
      else if (isRight) { yaw = 90; }
      else { source = 'building-block.glb'; }
      parts.push({ kit: MODULAR, source, at: [x, y, z], yaw });
    }
  }
  return parts;
}

/** Toit plat à parapet (bordures sur le pourtour, centre plat). */
function modularRoof(y, cols, rows) {
  const parts = [];
  const x0 = -(cols - 1) / 2;
  const z0 = -(rows - 1) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c;
      const z = z0 + r;
      const isFront = r === rows - 1, isBack = r === 0, isLeft = c === 0, isRight = c === cols - 1;
      let source = 'roof-flat-center.glb';
      let yaw = 0;
      if (isFront && isLeft) { source = 'roof-flat-border-corner.glb'; yaw = CORNER_YAW.frontLeft; }
      else if (isFront && isRight) { source = 'roof-flat-border-corner.glb'; yaw = CORNER_YAW.frontRight; }
      else if (isBack && isLeft) { source = 'roof-flat-border-corner.glb'; yaw = CORNER_YAW.backLeft; }
      else if (isBack && isRight) { source = 'roof-flat-border-corner.glb'; yaw = CORNER_YAW.backRight; }
      else if (isFront) { source = 'roof-flat-border-straight.glb'; yaw = 0; }
      else if (isBack) { source = 'roof-flat-border-straight.glb'; yaw = 180; }
      else if (isLeft) { source = 'roof-flat-border-straight.glb'; yaw = -90; }
      else if (isRight) { source = 'roof-flat-border-straight.glb'; yaw = 90; }
      parts.push({ kit: MODULAR, source, at: [x, y, z], yaw });
    }
  }
  return parts;
}

/** Mât et drapeau (primitives). */
function flag(at, color = 'blossom') {
  const [x, y, z] = at;
  return [
    { primitive: 'cylinder', radius: 0.025, height: 0.7, at: [x, y, z], color: 'metalLight' },
    { primitive: 'box', size: [0.32, 0.18, 0.02], at: [x + 0.16, y + 0.58, z], color },
  ];
}

// Rues étroites posées sur les arêtes : 0,3 u de large. Primitives aux couleurs de la palette.
const EDGE_W = 0.3;      // largeur totale
const CURB_W = 0.03;     // trottoir
const SLAB_H = 0.02;     // épaisseur de la chaussée
const CURB_H = 0.035;    // hauteur du trottoir
const CURB_X = EDGE_W / 2 - CURB_W / 2; // 0,135

function curbBox(size, at) { return { primitive: 'box', size, at, color: 'sidewalk' }; }
function curbCorner(x, z) { return curbBox([CURB_W, CURB_H, CURB_W], [x, 0, z]); }

export const MODEL_MAP = {
  // ─── Habitat (Suburban, Commercial) ────────────────────────────────────────────────
  'house-a': { kit: SUBURBAN, source: 'building-type-a.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1] },
  'house-b': { kit: SUBURBAN, source: 'building-type-r.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1] },
  'house-c': { kit: SUBURBAN, source: 'building-type-h.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1], note: 'toit plat à panneaux solaires' },
  'building-small-a': { kit: COMMERCIAL, source: 'building-a.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1] },
  'building-small-b': { kit: COMMERCIAL, source: 'building-d.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1] },
  'building-tall-a': { kit: COMMERCIAL, source: 'building-f.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1] },
  'building-tall-b': { kit: COMMERCIAL, source: 'building-l.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1] },

  // ─── Activité (Commercial, Industrial) ─────────────────────────────────────────────
  'shop-a': { kit: COMMERCIAL, source: 'building-g.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1], note: 'auvent orange en rez-de-chaussée' },
  'shop-b': { kit: COMMERCIAL, source: 'building-k.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1], note: 'commerce large à auvents, bas' },
  'office-a': { kit: COMMERCIAL, source: 'building-i.glb', fit: BUILDING_FIT, yaw: 0, footprint: [1, 1] },
  'factory-a': { kit: INDUSTRIAL, source: 'building-l.glb', fit: 0.9, yaw: 0, footprint: [1, 1], note: 'deux cheminées' },
  'factory-b': { kit: INDUSTRIAL, source: 'building-e.glb', fit: 0.9, yaw: 0, footprint: [1, 1], note: 'deux cheminées sur le toit' },

  // ─── Services (assemblés : Modular Buildings, Fantasy Town, Train Kit) ─────────────
  'school': {
    kit: MODULAR, fit: 0.92, yaw: 0, footprint: [1, 1],
    note: 'assemblage : 3 × 2 blocs, 2 étages, perron, toit à parapet, drapeau',
    parts: [
      ...modularFloor(0, 3, 2, { front: { 1: 'building-steps-wide.glb' } }),
      ...modularFloor(FLOOR, 3, 2, { front: { 1: 'building-window-awnings.glb' } }),
      ...modularRoof(2 * FLOOR, 3, 2),
      ...flag([0.9, 2 * FLOOR + 0.2, -0.4], 'sun'),
    ],
  },
  'clinic': {
    kit: MODULAR, fit: BUILDING_FIT, yaw: 0, footprint: [1, 1],
    note: 'assemblage : 2 × 2 blocs, 2 étages, croix sur la façade et le toit',
    parts: [
      ...modularFloor(0, 2, 2, { corner: 'building-corner-window.glb', front: {} }).map((p) => (p.at[0] < 0 && p.at[2] > 0 ? { ...p, source: 'building-door-window.glb', yaw: 0 } : p)),
      ...modularFloor(FLOOR, 2, 2),
      ...modularRoof(2 * FLOOR, 2, 2),
      // Croix de la clinique sur la façade (+Z) à l'étage, et une seconde debout sur le toit
      { primitive: 'box', size: [0.5, 0.14, 0.04], at: [0, FLOOR + 0.31, 1.0], color: 'blossom' },
      { primitive: 'box', size: [0.14, 0.5, 0.04], at: [0, FLOOR + 0.31, 1.0], color: 'blossom' },
      { primitive: 'box', size: [0.6, 0.16, 0.08], at: [0, 2 * FLOOR + 0.5, 0], color: 'blossom' },
      { primitive: 'box', size: [0.16, 0.6, 0.08], at: [0, 2 * FLOOR + 0.5, 0], color: 'blossom' },
      { primitive: 'box', size: [0.7, 0.04, 0.7], at: [0, 2 * FLOOR + 0.2, 0], color: 'wallCream' },
    ],
  },
  'townhall': {
    kit: MODULAR, fit: 0.92, yaw: 0, footprint: [1, 1],
    note: 'assemblage : 3 × 2 blocs, 2 étages à grandes fenêtres, tour centrale, drapeau',
    parts: [
      ...modularFloor(0, 3, 2, { wall: 'building-window-large.glb', front: { 1: 'building-steps-wide.glb' } }),
      ...modularFloor(FLOOR, 3, 2, { wall: 'building-window-large.glb', front: { 1: 'building-window-large.glb' } }),
      ...modularRoof(2 * FLOOR, 3, 2),
      { kit: MODULAR, source: 'building-windows-round.glb', at: [0, 2 * FLOOR, 0.5], yaw: 0 },
      { kit: MODULAR, source: 'roof-flat-top.glb', at: [0, 3 * FLOOR, 0.5], yaw: 0 },
      ...flag([0, 3 * FLOOR + 0.2, 0.5], 'river'),
    ],
  },
  'market': {
    kit: FANTASY, fit: 0.9, yaw: 0, footprint: [1, 1],
    note: 'assemblage : deux étals (rouge, vert), charrette, banc et lanterne sur une dalle',
    parts: [
      { primitive: 'box', size: [2.1, 0.03, 1.8], at: [0, 0, 0], color: 'rockLight' },
      { kit: FANTASY, source: 'stall-red.glb', at: [-0.55, 0.03, 0.25], yaw: 0 },
      { kit: FANTASY, source: 'stall-green.glb', at: [0.55, 0.03, 0.25], yaw: 0 },
      { kit: FANTASY, source: 'cart.glb', at: [-0.5, 0.03, -0.55], yaw: 90 },
      { kit: FANTASY, source: 'stall-bench.glb', at: [0.6, 0.03, -0.5], yaw: 90 },
      { kit: FANTASY, source: 'lantern.glb', at: [0, 0.03, -0.6], yaw: 0, scale: 0.8 },
    ],
  },
  'tram-stop': {
    kit: TRAIN, scale: 1, yaw: 0, footprint: [1, 1],
    orientation: 'voie le long de Z (nord–sud) à x = -0,15 ; quai à l’est (x > 0,2)',
    note: 'assemblage : rails du Train Kit, quai, abri (poteaux + toit), banc et lanterne du Fantasy Town',
    parts: [
      { kit: TRAIN, source: 'spline-track.glb', at: [-0.15, 0, 0], yaw: 0 },
      { primitive: 'box', size: [0.3, 0.08, 0.96], at: [0.35, 0, 0], color: 'sidewalk' },
      { primitive: 'cylinder', radius: 0.018, height: 0.36, at: [0.26, 0.08, -0.2], color: 'metal' },
      { primitive: 'cylinder', radius: 0.018, height: 0.36, at: [0.26, 0.08, 0.2], color: 'metal' },
      { primitive: 'cylinder', radius: 0.018, height: 0.36, at: [0.46, 0.08, -0.2], color: 'metal' },
      { primitive: 'cylinder', radius: 0.018, height: 0.36, at: [0.46, 0.08, 0.2], color: 'metal' },
      { primitive: 'box', size: [0.3, 0.03, 0.56], at: [0.36, 0.44, 0], color: 'roofSlate' },
      { kit: FANTASY, source: 'stall-bench.glb', at: [0.42, 0.08, 0], yaw: 0, scale: 0.45 },
      { kit: FANTASY, source: 'lantern.glb', at: [0.42, 0.08, 0.4], yaw: 0, scale: 0.35 },
    ],
  },

  // ─── Infrastructure (Industrial + primitives) ──────────────────────────────────────
  'wastewater': {
    kit: INDUSTRIAL, fit: 0.92, yaw: 0, footprint: [1, 1],
    note: 'assemblage : deux bassins ronds, cuve et petit bâtiment technique',
    parts: [
      { primitive: 'box', size: [2.1, 0.03, 2.0], at: [0, 0, 0], color: 'rockLight' },
      { primitive: 'cylinder', radius: 0.46, height: 0.14, at: [-0.52, 0.03, 0.45], color: 'sidewalk', topColor: 'lakeDeep', segments: 20 },
      { primitive: 'cylinder', radius: 0.46, height: 0.14, at: [0.5, 0.03, 0.45], color: 'sidewalk', topColor: 'wetland', segments: 20 },
      { kit: INDUSTRIAL, source: 'detail-tank-large.glb', at: [0.55, 0.03, -0.5], yaw: 0, scale: 0.55 },
      { kit: INDUSTRIAL, source: 'building-k.glb', at: [-0.5, 0.03, -0.5], yaw: 0, scale: 0.75 },
    ],
  },
  'wind-turbine': { kit: INDUSTRIAL, source: 'windmill.glb', scale: 0.6, yaw: 90, footprint: [1, 1], keepNodes: ['blades'], note: 'le nœud « blades » reste séparé (pivot au moyeu) pour l’animation' },
  'solar': {
    kit: INDUSTRIAL, fit: 0.9, yaw: 0, footprint: [1, 1],
    note: 'assemblage : deux rangées de panneaux',
    parts: [
      { kit: INDUSTRIAL, source: 'solar-panel-landscape-group.glb', at: [0, 0, -0.47], yaw: 0 },
      { kit: INDUSTRIAL, source: 'solar-panel-landscape-group.glb', at: [0, 0, 0.47], yaw: 0 },
    ],
  },
  'power-plant': {
    kit: INDUSTRIAL, fit: 0.92, yaw: 0, footprint: [1, 1],
    note: 'assemblage : bâtiment, tour de refroidissement et cheminée',
    parts: [
      { kit: INDUSTRIAL, source: 'building-o.glb', at: [-0.6, 0, 0.1], yaw: 0 },
      { kit: INDUSTRIAL, source: 'chimney-large.glb', at: [0.45, 0, 0.3], yaw: 0 },
      { kit: INDUSTRIAL, source: 'chimney-medium.glb', at: [0.3, 0, -0.65], yaw: 0 },
    ],
  },
  'compost': {
    kit: INDUSTRIAL, fit: 0.9, yaw: 0, footprint: [1, 1],
    note: 'assemblage : trois conteneurs et deux tas de compost sur une dalle',
    parts: [
      { primitive: 'box', size: [1.4, 0.03, 1.5], at: [0, 0, 0], color: 'rockLight' },
      { kit: INDUSTRIAL, source: 'shipping-container-a.glb', at: [-0.45, 0.03, -0.3], yaw: 0 },
      { kit: INDUSTRIAL, source: 'shipping-container-b.glb', at: [0, 0.03, -0.3], yaw: 0 },
      { kit: INDUSTRIAL, source: 'shipping-container-c.glb', at: [0.45, 0.03, -0.3], yaw: 0 },
      { primitive: 'cone', radius: 0.3, height: 0.26, at: [-0.33, 0.03, 0.42], color: 'soil', segments: 12 },
      { primitive: 'cone', radius: 0.26, height: 0.2, at: [0.35, 0.03, 0.42], color: 'wood', segments: 12 },
    ],
  },
  'water-tower': { kit: INDUSTRIAL, source: 'water-tower.glb', scale: 0.7, yaw: 0, footprint: [1, 1] },

  // ─── Nature ────────────────────────────────────────────────────────────────────────
  'park': {
    kit: FANTASY, scale: 1, yaw: 0, footprint: [1, 1],
    note: 'assemblage : pelouse, fontaine, deux arbres, banc, fleurs',
    parts: [
      { primitive: 'box', size: [0.96, 0.03, 0.96], at: [0, 0, 0], color: 'grassLight' },
      { kit: FANTASY, source: 'fountain-round.glb', at: [0, 0.03, 0.02], yaw: 0, scale: 0.26 },
      { kit: NATURE, source: 'tree_default.glb', at: [-0.3, 0.03, -0.3], yaw: 0, scale: 0.42 },
      { kit: NATURE, source: 'tree_oak.glb', at: [0.29, 0.03, -0.28], yaw: 0, scale: 0.48 },
      { kit: FANTASY, source: 'stall-bench.glb', at: [0.28, 0.03, 0.3], yaw: 90, scale: 0.4 },
      { kit: NATURE, source: 'flower_redA.glb', at: [-0.34, 0.03, 0.3], yaw: 0, scale: 0.8 },
      { kit: NATURE, source: 'flower_yellowB.glb', at: [-0.24, 0.03, 0.38], yaw: 40, scale: 0.8 },
    ],
  },
  'tree-a': { kit: NATURE, source: 'tree_default.glb', scale: 0.5, yaw: 0, footprint: [1, 1] },
  'tree-b': { kit: NATURE, source: 'tree_oak.glb', scale: 0.6, yaw: 0, footprint: [1, 1] },
  'tree-c': { kit: NATURE, source: 'tree_fat.glb', scale: 0.6, yaw: 0, footprint: [1, 1] },
  'pine-a': { kit: NATURE, source: 'tree_pineDefaultA.glb', scale: 0.55, yaw: 0, footprint: [1, 1] },
  'pine-b': { kit: NATURE, source: 'tree_pineTallA.glb', scale: 0.6, yaw: 0, footprint: [1, 1] },
  'bush': { kit: NATURE, source: 'plant_bushDetailed.glb', scale: 0.8, yaw: 0, footprint: [1, 1] },
  'flowers': {
    kit: NATURE, scale: 1, yaw: 0, footprint: [1, 1],
    note: 'assemblage : touffe de fleurs rouges, jaunes, roses et d’herbe',
    parts: [
      { kit: NATURE, source: 'flower_redA.glb', at: [-0.12, 0, -0.08], yaw: 0 },
      { kit: NATURE, source: 'flower_yellowB.glb', at: [0.12, 0, -0.1], yaw: 60 },
      { kit: NATURE, source: 'flower_purpleC.glb', at: [0.02, 0, 0.14], yaw: 150 },
      { kit: NATURE, source: 'grass_leafs.glb', at: [-0.16, 0, 0.14], yaw: 0 },
      { kit: NATURE, source: 'grass_leafs.glb', at: [0.2, 0, 0.1], yaw: 90 },
    ],
  },
  'rock-a': { kit: NATURE, source: 'rock_largeA.glb', scale: 0.6, yaw: 0, footprint: [1, 1], materials: { dirt: 'rock', grass: 'grassLight' } },
  'rock-b': { kit: NATURE, source: 'rock_largeB.glb', scale: 0.55, yaw: 30, footprint: [1, 1], materials: { dirt: 'rockLight', grass: 'grass' } },
  'crop-wheat': {
    kit: NATURE, scale: 0.8, yaw: 0, footprint: [1, 1],
    note: 'assemblage : quatre touffes de blé',
    materials: { woodInner: 'wheat', _defaultMat: 'sun' },
    parts: [
      { kit: NATURE, source: 'crops_wheatStageB.glb', at: [-0.27, 0, -0.25], yaw: 0 },
      { kit: NATURE, source: 'crops_wheatStageB.glb', at: [0.27, 0, -0.25], yaw: 90 },
      { kit: NATURE, source: 'crops_wheatStageB.glb', at: [-0.27, 0, 0.25], yaw: 180 },
      { kit: NATURE, source: 'crops_wheatStageB.glb', at: [0.27, 0, 0.25], yaw: 270 },
    ],
  },
  'crop-corn': {
    kit: NATURE, scale: 0.5, yaw: 0, footprint: [1, 1],
    note: 'assemblage : quatre pieds de maïs',
    materials: { grass: 'grass', corn: 'sun' },
    parts: [
      { kit: NATURE, source: 'crops_cornStageC.glb', at: [-0.45, 0, -0.45], yaw: 0 },
      { kit: NATURE, source: 'crops_cornStageC.glb', at: [0.45, 0, -0.45], yaw: 90 },
      { kit: NATURE, source: 'crops_cornStageC.glb', at: [-0.45, 0, 0.45], yaw: 180 },
      { kit: NATURE, source: 'crops_cornStageD.glb', at: [0.45, 0, 0.45], yaw: 270 },
    ],
  },

  // ─── Rues sur une case entière (City Kit Roads, tuile 1 × 1 u) ─────────────────────
  // Source Kenney : la ligne droite court le long de X ; on la tourne pour qu'elle suive Z (nord–sud).
  'road-straight': { kit: ROADS, source: 'road-straight.glb', scale: 1, yaw: 90, footprint: [1, 1], orientation: 'axe Z (nord–sud) ; bras N et S' },
  'road-corner': { kit: ROADS, source: 'road-bend.glb', scale: 1, yaw: 180, footprint: [1, 1], orientation: 'bras N et E' },
  'road-t': { kit: ROADS, source: 'road-intersection.glb', scale: 1, yaw: 90, footprint: [1, 1], orientation: 'bras N, E et S (fermé à l’ouest)' },
  'road-cross': { kit: ROADS, source: 'road-crossroad.glb', scale: 1, yaw: 0, footprint: [1, 1], orientation: 'bras N, E, S, W' },
  'road-crosswalk': { kit: ROADS, source: 'road-crossing.glb', scale: 1, yaw: 90, footprint: [1, 1], orientation: 'axe Z (nord–sud) ; passage piéton au centre' },
  'bridge': { kit: ROADS, source: 'road-bridge.glb', scale: 1, yaw: 0, footprint: [1, 1], orientation: 'axe Z (nord–sud) ; tablier à 0,5 u' },

  // ─── Rues étroites sur les arêtes (primitives, 0,3 u de large) ─────────────────────
  'road-edge-straight': {
    kit: 'tiletown', scale: 1, yaw: 0, footprint: [1, 1],
    orientation: 'axe Z (nord–sud), 0,3 u de large × 1 u de long, trottoirs à x = ±0,135',
    note: 'primitives : chaussée, deux trottoirs, pointillé central',
    parts: [
      { primitive: 'box', size: [EDGE_W, SLAB_H, 1], at: [0, 0, 0], color: 'asphalt' },
      curbBox([CURB_W, CURB_H, 1], [-CURB_X, 0, 0]),
      curbBox([CURB_W, CURB_H, 1], [CURB_X, 0, 0]),
      ...[-0.36, -0.12, 0.12, 0.36].map((z) => ({ primitive: 'box', size: [0.02, 0.006, 0.12], at: [0, SLAB_H, z], color: 'marking' })),
    ],
  },
  'road-edge-node-2': {
    kit: 'tiletown', scale: 1, yaw: 0, footprint: [1, 1],
    orientation: 'nœud d’angle 0,3 × 0,3 u ; bras N et E ; trottoir extérieur à l’ouest et au sud',
    parts: [
      { primitive: 'box', size: [EDGE_W, SLAB_H, EDGE_W], at: [0, 0, 0], color: 'asphalt' },
      curbBox([CURB_W, CURB_H, EDGE_W], [-CURB_X, 0, 0]),
      curbBox([EDGE_W, CURB_H, CURB_W], [0, 0, CURB_X]),
      curbCorner(CURB_X, -CURB_X),
    ],
  },
  'road-edge-node-3': {
    kit: 'tiletown', scale: 1, yaw: 0, footprint: [1, 1],
    orientation: 'nœud en T 0,3 × 0,3 u ; bras N, E et S ; trottoir à l’ouest',
    parts: [
      { primitive: 'box', size: [EDGE_W, SLAB_H, EDGE_W], at: [0, 0, 0], color: 'asphalt' },
      curbBox([CURB_W, CURB_H, EDGE_W], [-CURB_X, 0, 0]),
      curbCorner(CURB_X, -CURB_X),
      curbCorner(CURB_X, CURB_X),
    ],
  },
  'road-edge-node-4': {
    kit: 'tiletown', scale: 1, yaw: 0, footprint: [1, 1],
    orientation: 'croisement 0,3 × 0,3 u ; bras N, E, S, W',
    parts: [
      { primitive: 'box', size: [EDGE_W, SLAB_H, EDGE_W], at: [0, 0, 0], color: 'asphalt' },
      curbCorner(-CURB_X, -CURB_X), curbCorner(CURB_X, -CURB_X), curbCorner(-CURB_X, CURB_X), curbCorner(CURB_X, CURB_X),
    ],
  },

  // ─── Véhicules (Car Kit × 0,35 ; Train Kit × 0,35) : avant vers +Z ─────────────────
  'tram': { kit: TRAIN, source: 'train-tram-classic.glb', scale: CAR_SCALE, yaw: 0, footprint: [1, 1], orientation: 'avant vers +Z' },
  'car-a': { kit: CARS, source: 'sedan.glb', scale: CAR_SCALE, yaw: 0, footprint: [1, 1], orientation: 'avant vers +Z' },
  'car-b': { kit: CARS, source: 'hatchback-sports.glb', scale: CAR_SCALE, yaw: 0, footprint: [1, 1], orientation: 'avant vers +Z' },
  'bus': { kit: CARS, source: 'delivery.glb', scale: CAR_SCALE, yaw: 0, footprint: [1, 1], orientation: 'avant vers +Z', provisional: true, note: 'le Car Kit n’a pas de bus : camionnette longue (delivery) en attendant' },
  'truck': { kit: CARS, source: 'truck.glb', scale: CAR_SCALE, yaw: 0, footprint: [1, 1], orientation: 'avant vers +Z' },
};

/** Adresse publique d'un kit (pour `url` et CREDITS.md). */
export function kitUrl(kit) {
  return kit === 'tiletown' ? 'https://github.com/Madec01/Tiletown' : `https://kenney.nl/assets/${kit}`;
}

/** Nom du kit dans le manifeste (`kenney-<slug>`). */
export function kitManifestName(kit) {
  return kit === 'tiletown' ? 'tiletown-primitives' : `kenney-${kit}`;
}
