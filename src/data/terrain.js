// Types de terrain de la vallée : libellé, couleur de palette, constructibilité, défrichement,
// habitat pour la faune, puits d'air et coût de passage d'une rue (docs/GAME_DESIGN.md §3.2, §4.2, §5).
//
// `color` est une clé de `PALETTE` (src/data/palette.js) ; `models` liste les décors 3D posés sur le
// terrain natif (identifiants du manifeste, partagés avec tools/import-models.js) ; le rendu en choisit
// un par case d'après `variant`.
//
// `clearingCost` : surcoût pour bâtir dessus (0 herbe et prairie, 20 champ, 80 forêt) ; null = interdit.
// `roadCost` : coût d'une arête de rue qui longe ou traverse ce terrain pour `connectTile`
// (herbe, prairie, champ 1 ; colline 2 ; forêt 3 ; rivière 5 → pont) ; null = infranchissable.
// `airSink` : pollution absorbée par mois (forêt ancienne 6, zone humide 3, prairie 1, lac 1).

export const TERRAINS = Object.freeze({
  grass: Object.freeze({
    id: 'grass', label: 'Herbe', color: 'grass',
    buildable: true, clearingCost: 0, roadCost: 1,
    habitat: null, airSink: 0, water: false, models: [],
  }),
  meadow: Object.freeze({
    id: 'meadow', label: 'Prairie fleurie', color: 'grassLight',
    buildable: true, clearingCost: 0, roadCost: 1,
    habitat: 'meadow', airSink: 1, water: false, models: ['flowers'],
  }),
  forest: Object.freeze({
    id: 'forest', label: 'Forêt ancienne', color: 'forestDark',
    buildable: true, clearingCost: 80, roadCost: 3,
    habitat: 'forest', airSink: 6, water: false, models: ['tree-a', 'tree-b', 'tree-c', 'pine-a', 'pine-b'],
  }),
  field: Object.freeze({
    id: 'field', label: 'Champ', color: 'wheat',
    buildable: true, clearingCost: 20, roadCost: 1,
    habitat: null, airSink: 0, water: false, models: ['crop-wheat', 'crop-corn'],
  }),
  river: Object.freeze({
    id: 'river', label: 'Rivière', color: 'river',
    buildable: false, clearingCost: null, roadCost: 5,
    habitat: null, airSink: 0, water: true, models: [],
  }),
  lake: Object.freeze({
    id: 'lake', label: 'Lac', color: 'lakeDeep',
    buildable: false, clearingCost: null, roadCost: null,
    habitat: 'lake', airSink: 1, water: true, models: [],
  }),
  wetland: Object.freeze({
    id: 'wetland', label: 'Zone humide', color: 'wetland',
    buildable: false, clearingCost: null, roadCost: null,
    habitat: 'wetland', airSink: 3, water: true, models: ['bush'],
  }),
  hill: Object.freeze({
    id: 'hill', label: 'Colline', color: 'rock',
    buildable: false, clearingCost: null, roadCost: 2,
    habitat: null, airSink: 0, water: false, models: ['rock-a', 'rock-b'],
  }),
});

/** Les identifiants de terrain, dans l'ordre du catalogue. */
export const TERRAIN_IDS = Object.freeze(Object.keys(TERRAINS));

/** Définition d'un terrain par identifiant (lève une erreur si inconnu). */
export function getTerrain(id) {
  const t = TERRAINS[id];
  if (!t) throw new Error(`Terrain inconnu : ${id}`);
  return t;
}

/** Vrai si le terrain est de l'eau (rivière, lac, zone humide). */
export function isWater(id) {
  return getTerrain(id).water;
}

/** Vrai si l'on peut y bâtir (au besoin après défrichement). */
export function isBuildable(id) {
  return getTerrain(id).buildable;
}

/** Vrai si le terrain compte comme habitat pour la faune. */
export function isHabitat(id) {
  return getTerrain(id).habitat !== null;
}
