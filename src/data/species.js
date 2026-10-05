// Espèces emblématiques (docs/GAME_DESIGN.md §5.3 ; docs/ARCHITECTURE.md §10.1).
//
// Chaque entrée : `id` (clé dans `eco.species`, identifiant d'acteur animé du rendu), `label` (nom
// affiché), `hint` (la condition en une phrase, pour le carnet et la fiche Nature), `textIn` / `textOut`
// (les deux événements chaleureux de l'arrivée et du départ) et `check(ctx)`.
//
// `check(ctx)` → `{ score, cells }` :
//   - `score` est le degré de satisfaction de la condition, normalisé : **1 = le seuil est atteint**,
//     0,8 = 20 % sous le seuil, 0 = rien du tout. L'espèce apparaît dès que `score ≥ 1` et s'en va après
//     ECO_SPECIES_LEAVE_MONTHS mois consécutifs sous ECO_SPECIES_LEAVE_RATIO (docs §5.3) ;
//   - `cells` sont les index des cases qui justifient sa présence (la première sert à centrer la carte,
//     toutes servent aux icônes et aux acteurs animés). Tableau vide quand l'espèce n'a nulle part à vivre.
//
// `ctx` est fabriqué par `src/core/ecology.js` (`speciesContext`) : il donne le monde, l'écologie, les
// parcelles d'habitat, les lacs, la rivière dans l'ordre d'écoulement et de petites aides de voisinage.
// Aucune de ces fonctions ne modifie quoi que ce soit : ce sont des lectures.

export const SPECIES = Object.freeze([
  Object.freeze({
    id: 'deer',
    label: 'Cerf',
    hint: 'Un massif de forêt de 6 cases au moins, sans usine à moins de deux cases.',
    textIn: 'Un cerf s’aventure dans le massif : la forêt est assez vaste pour lui.',
    textOut: 'Le cerf a quitté la vallée : son bois est devenu trop petit.',
    check(ctx) {
      let best = { score: 0, cells: [] };
      for (const patch of ctx.patchesOf('forest')) {
        const quiet = !ctx.anyNear(patch.cells, 2, (tile) => tile.building && tile.building.type === 'factory');
        const score = Math.min(ctx.atLeast(ctx.effectiveSize(patch), 6), quiet ? 1 : 0);
        if (score > best.score) best = { score, cells: patch.cells };
      }
      return best;
    },
  }),

  Object.freeze({
    id: 'heron',
    label: 'Héron',
    hint: 'Un lac clair (eau sous 40) bordé par au moins deux zones humides.',
    textIn: 'Un héron s’est posé sur l’étang.',
    textOut: 'Le héron a quitté l’étang : l’eau n’est plus assez claire.',
    check(ctx) {
      let best = { score: 0, cells: [] };
      for (const lake of ctx.lakes) {
        const wetlands = ctx.countNear(lake.cells, 1, (tile) => tile.terrain === 'wetland');
        const score = Math.min(ctx.atMost(lake.value, 40), ctx.atLeast(wetlands, 2));
        if (score > best.score) best = { score, cells: lake.cells };
      }
      return best;
    },
  }),

  Object.freeze({
    id: 'otter',
    label: 'Loutre',
    hint: 'Cinq cases de rivière propres (eau sous 25) de suite, dont trois bordées de forêt.',
    textIn: 'Une loutre remonte la rivière : l’eau est redevenue claire.',
    textOut: 'La loutre a disparu de la rivière : l’aval s’est troublé.',
    check(ctx) {
      const run = ctx.river;
      let best = { score: 0, cells: [] };
      for (let start = 0; start + 5 <= run.length; start++) {
        let clean = 1;
        let riparian = 0;
        for (let k = 0; k < 5; k++) {
          const i = run[start + k];
          clean = Math.min(clean, ctx.atMost(ctx.eco.water[i], 25));
          if (ctx.isRiparian(i)) riparian++;
        }
        const score = Math.min(clean, ctx.atLeast(riparian, 3));
        if (score > best.score) {
          const cells = [];
          for (let k = 0; k < 5; k++) cells.push(run[start + k]);
          best = { score, cells };
        }
      }
      return best;
    },
  }),

  Object.freeze({
    id: 'bee',
    label: 'Abeilles',
    hint: 'Une prairie fleurie à côté d’un champ bio ou d’un verger.',
    textIn: 'Les abeilles bourdonnent au-dessus de la prairie.',
    textOut: 'Les abeilles ont déserté la prairie : plus rien ne fleurit pour elles.',
    check(ctx) {
      const { world } = ctx;
      for (let i = 0; i < world.tiles.length; i++) {
        if (ctx.habitatOf(i) !== 'meadow') continue;
        for (const j of ctx.neighbors(i, 1)) {
          if (ctx.fieldMode(world.tiles[j]) === 'organic') return { score: 1, cells: [i, j] };
        }
      }
      return { score: 0, cells: [] };
    },
  }),

  Object.freeze({
    id: 'owl',
    label: 'Chouette',
    hint: 'Une forêt de 4 cases sans la moindre construction à deux cases (la nuit doit rester noire).',
    textIn: 'Une chouette hulule à la lisière, dans le noir.',
    textOut: 'La chouette s’est tue : la lisière est devenue trop éclairée.',
    check(ctx) {
      let best = { score: 0, cells: [] };
      for (const patch of ctx.patchesOf('forest')) {
        const dark = !ctx.anyNear(patch.cells, 2, (tile) => ctx.isBuilt(tile));
        const score = Math.min(ctx.atLeast(ctx.effectiveSize(patch), 4), dark ? 1 : 0);
        if (score > best.score) best = { score, cells: patch.cells };
      }
      return best;
    },
  }),

  Object.freeze({
    id: 'swallow',
    label: 'Hirondelle',
    hint: 'Un quartier avec un parc voisin et un air pur (sous 30) : la ville verte elle-même.',
    textIn: 'Des hirondelles nichent dans le quartier : la ville respire.',
    textOut: 'Les hirondelles ont quitté le quartier : l’air s’est alourdi.',
    check(ctx) {
      const { world } = ctx;
      let best = { score: 0, cells: [] };
      for (let i = 0; i < world.tiles.length; i++) {
        const tile = world.tiles[i];
        if (!tile.building || tile.building.type !== 'house') continue;
        let park = false;
        for (const j of ctx.neighbors(i, 1)) {
          const n = world.tiles[j];
          if (n.building && n.building.type === 'park') park = true;
        }
        const score = Math.min(park ? 1 : 0, ctx.atMost(ctx.eco.air[i], 30));
        if (score > best.score) best = { score, cells: [i] };
      }
      return best;
    },
  }),

  Object.freeze({
    id: 'fox',
    label: 'Renard',
    hint: 'Deux parcelles de nature de 3 cases au moins reliées par un corridor.',
    textIn: 'Un renard passe d’une parcelle à l’autre par le corridor.',
    textOut: 'Le renard ne passe plus : le corridor s’est refermé.',
    check(ctx) {
      let best = { score: 0, cells: [] };
      for (const patch of ctx.patches) {
        for (const id of patch.connectedTo) {
          if (id <= patch.id) continue;
          const other = ctx.patchById(id);
          // Un vrai corridor : les deux parcelles ne se touchent pas, quelque chose les relie.
          if (!other || patch.adjacentTo.includes(id)) continue;
          const score = Math.min(ctx.atLeast(patch.size, 3), ctx.atLeast(other.size, 3));
          if (score > best.score) best = { score, cells: patch.cells.concat(other.cells) };
        }
      }
      return best;
    },
  }),
]);

/** Accès par identifiant. */
export const SPECIES_BY_ID = Object.freeze(Object.fromEntries(SPECIES.map((s) => [s.id, s])));

/** Les identifiants, dans l'ordre du carnet. */
export const SPECIES_IDS = Object.freeze(SPECIES.map((s) => s.id));

/** Définition d'une espèce par identifiant (lève une erreur si inconnue). */
export function getSpecies(id) {
  const s = SPECIES_BY_ID[id];
  if (!s) throw new Error(`Espèce inconnue : ${id}`);
  return s;
}
