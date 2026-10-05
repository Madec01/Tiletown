// Écologie : air, eau, faune, sols, espèces (docs/GAME_DESIGN.md §5 ; docs/ARCHITECTURE.md §10.1).
// Chaque test fabrique le plus petit monde qui montre la règle.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEcology, stepEcology, airStep, waterStep, faunaStep, soilStep, speciesStep, findPatches,
  speciesSummary, speciesCount, serializeEcology, reviveEcology, cloneEcology, syncEcology,
  fieldModeOf, habitatOf, isNatureCell, emitOf, sinkOf, dischargeOf, tourismOf, healthOf,
  airHappinessPenalty, fieldYieldOf, scoresStep, alertsStep, atLeast, atMost,
} from '../src/core/ecology.js';
import { SPECIES, SPECIES_BY_ID, SPECIES_IDS, getSpecies } from '../src/data/species.js';
import { createGame, advance, describeTile } from '../src/core/game.js';
import { index, edgeV, edgeH } from '../src/core/grid.js';
import { createRng } from '../src/core/rng.js';
import { makeWorld, setTerrain, place } from './world-helpers.js';
import {
  ECO_EMIT, ECO_SINK, ECO_WATER_OUT, ECO_WATER_IN, ECO_SOIL, ECO_SOIL_START, ECO_SOIL_EROSION,
  ECO_TRAFFIC_CUT, ECO_SPECIES_LEAVE_MONTHS, ECO_FAUNA_BASE, ECO_RIVER_CARRY, MONTH_SECONDS,
} from '../src/data/balance.js';

// ---------------------------------------------------------------------------------------------
// Aides.

/** Valeur du champ `key` de l'écologie en (x, y). */
function at(eco, world, key, x, y) {
  return eco[key][index(world, x, y)];
}

/** Trafic d'une arête verticale (entre (x-1, y) et (x, y)). */
function setTrafficV(world, x, y, value) {
  world.traffic.v[edgeV(world, x, y)] = value;
  return world;
}

/** Trafic d'une arête horizontale (entre (x, y-1) et (x, y)). */
function setTrafficH(world, x, y, value) {
  world.traffic.h[edgeH(world, x, y)] = value;
  return world;
}

/** Avance l'écologie de `n` mois (sans aléatoire : pas de pluies fortes). */
function steps(eco, world, n, from = 0) {
  const events = [];
  for (let m = 0; m < n; m++) events.push(...stepEcology(eco, world, { month: from + m }).events);
  return events;
}

/** Colonne de rivière de y0 à y1 (comprise), écoulement vers le sud. */
function river(world, x, y0, y1) {
  for (let y = y0; y <= y1; y++) setTerrain(world, x, y, 'river', 'S');
  return world;
}

// ---------------------------------------------------------------------------------------------
// Air (§5.1).

test('écologie / air : une usine pollue ses voisins, davantage sous le vent ; une forêt absorbe', () => {
  const world = makeWorld(7, 7);
  world.wind = 'W'; // le vent vient de l'ouest : le panache part vers l'est
  place(world, 3, 3, 'factory');
  const eco = createEcology(world);
  airStep(eco, world);

  const here = at(eco, world, 'air', 3, 3);
  const east = at(eco, world, 'air', 4, 3);
  const west = at(eco, world, 'air', 2, 3);
  const far = at(eco, world, 'air', 0, 0);
  assert.ok(here > 0, 'la case de l’usine est polluée');
  assert.ok(east > 0 && west > 0, 'les voisins reçoivent la pollution');
  assert.ok(east > west, 'sous le vent, c’est pire');
  assert.equal(far, 0, 'rien ne va encore jusqu’au bord');
  // La valeur exacte du contrat : A1 = 12, diffusion 0,6/0,4, vent 0,15, dissipation 0,97.
  const a1 = ECO_EMIT.factory;
  assert.ok(Math.abs(here - 0.97 * (0.6 * a1 + 0.4 * 0 + 0.15 * (0 - a1))) < 1e-4);
  assert.ok(Math.abs(east - 0.97 * (0.4 * (a1 / 4) + 0.15 * a1)) < 1e-4);

  // La même usine avec une forêt à l'est : elle absorbe au lieu de laisser passer.
  const wooded = makeWorld(7, 7);
  wooded.wind = 'W';
  place(wooded, 3, 3, 'factory');
  setTerrain(wooded, 4, 3, 'forest');
  const eco2 = createEcology(wooded);
  for (let i = 0; i < 3; i++) airStep(eco2, wooded);
  const eco3 = createEcology(world);
  for (let i = 0; i < 3; i++) airStep(eco3, world);
  assert.ok(at(eco2, wooded, 'air', 4, 3) < at(eco3, world, 'air', 4, 3), 'la forêt absorbe sur sa case');
  assert.ok(at(eco2, wooded, 'air', 5, 3) < at(eco3, world, 'air', 5, 3), 'et protège ce qui suit');
  assert.equal(sinkOf(wooded, index(wooded, 4, 3)), 6);
  assert.equal(emitOf(wooded.tiles[index(wooded, 3, 3)]), 12);
});

test('écologie / air : le trafic pollue, les quartiers de niveau 3 aussi, le parc assainit', () => {
  const world = makeWorld(5, 5);
  setTrafficV(world, 2, 2, 8);
  const eco = createEcology(world);
  airStep(eco, world);
  assert.ok(at(eco, world, 'air', 2, 2) > 0 && at(eco, world, 'air', 1, 2) > 0, 'les deux riverains de l’arête');
  assert.equal(at(eco, world, 'air', 4, 4), 0);

  assert.equal(emitOf({ building: { type: 'house', level: 1 } }), 0);
  assert.equal(emitOf({ building: { type: 'house', level: 3 } }), 2);
  assert.equal(emitOf({ building: { type: 'power-plant', level: 1 } }), 20);
  const park = makeWorld(3, 3);
  place(park, 1, 1, 'park');
  assert.equal(sinkOf(park, index(park, 1, 1)), ECO_SINK.park);
  assert.equal(airHappinessPenalty(40), 0);
  assert.equal(airHappinessPenalty(41), 1);
  assert.equal(airHappinessPenalty(60), 3);
});

// ---------------------------------------------------------------------------------------------
// Eau (§5.2).

test('écologie / eau : une usine en amont dégrade l’aval, jamais l’amont', () => {
  const world = makeWorld(9, 9);
  river(world, 4, 0, 8);
  place(world, 3, 3, 'factory');
  const eco = createEcology(world);
  waterStep(eco, world);

  assert.equal(at(eco, world, 'water', 4, 0), 0, 'la source reste claire');
  assert.equal(at(eco, world, 'water', 4, 2), 0, 'juste en amont aussi');
  assert.ok(Math.abs(at(eco, world, 'water', 4, 3) - ECO_WATER_OUT.factory) < 1e-4, 'le rejet entre ici');
  assert.ok(Math.abs(at(eco, world, 'water', 4, 4) - ECO_RIVER_CARRY * ECO_WATER_OUT.factory) < 1e-4);
  assert.ok(at(eco, world, 'water', 4, 5) < at(eco, world, 'water', 4, 4), 'l’aval se dilue en descendant');
  assert.ok(at(eco, world, 'water', 4, 8) > 0, 'tout l’aval subit');
  assert.equal(dischargeOf(world, index(world, 3, 3)), 15);
});

test('écologie / eau : une station d’épuration et une zone humide nettoient la rivière', () => {
  const build = (extra) => {
    const world = makeWorld(9, 9);
    river(world, 4, 0, 8);
    place(world, 3, 2, 'factory');
    if (extra) extra(world);
    const eco = createEcology(world);
    waterStep(eco, world);
    return { world, eco };
  };
  const dirty = build(null);
  const cleaned = build((w) => place(w, 3, 5, 'wastewater'));
  const marshy = build((w) => setTerrain(w, 3, 5, 'wetland'));
  const downstream = (r) => at(r.eco, r.world, 'water', 4, 6);

  assert.ok(downstream(dirty) > 0);
  assert.ok(downstream(cleaned) < downstream(dirty), 'la station dépollue l’aval');
  assert.ok(downstream(marshy) < downstream(dirty), 'la zone humide filtre');
  assert.ok(downstream(cleaned) <= downstream(marshy), 'la station fait mieux qu’une zone humide');
  assert.equal(ECO_WATER_IN.wastewater, 20);
  assert.equal(ECO_WATER_IN.wetland, 8);

  // Ripisylve : une forêt au bord de l'eau nettoie aussi (−4).
  const riparian = build((w) => setTerrain(w, 3, 5, 'forest'));
  assert.ok(downstream(riparian) < downstream(dirty), 'la ripisylve filtre');
  assert.ok(downstream(riparian) > downstream(marshy), 'moins qu’une zone humide');
});

test('écologie / eau : un lac accumule, une nappe locale sous les champs intensifs', () => {
  const world = makeWorld(9, 9);
  river(world, 4, 0, 5);
  setTerrain(world, 4, 6, 'lake');
  setTerrain(world, 4, 7, 'lake');
  place(world, 3, 6, 'factory');
  const eco = createEcology(world);
  const values = [];
  for (let i = 0; i < 4; i++) {
    waterStep(eco, world);
    values.push(at(eco, world, 'water', 4, 6));
  }
  assert.ok(values[0] > 0, 'le lac se charge');
  assert.ok(values[3] > values[0], 'et accumule d’un mois à l’autre');
  assert.equal(at(eco, world, 'water', 4, 7), values[3], 'une seule valeur pour tout le lac');

  // Nappe : un champ intensif voisin remonte la valeur d'une case sans eau.
  const farm = makeWorld(5, 5);
  setTerrain(farm, 2, 2, 'field');
  place(farm, 2, 2, 'field');
  const eco2 = createEcology(farm);
  waterStep(eco2, farm);
  assert.ok(at(eco2, farm, 'water', 2, 1) > 0, 'la nappe monte autour d’un champ intensif');
  assert.equal(at(eco2, farm, 'water', 0, 0), 0, 'loin, elle reste propre');
});

// ---------------------------------------------------------------------------------------------
// Faune et parcelles (§5.3).

test('écologie / faune : parcelles contiguës, taille et liaisons', () => {
  const world = makeWorld(9, 5);
  for (let x = 0; x <= 4; x++) setTerrain(world, x, 2, 'forest');
  const patches = findPatches(world);
  assert.equal(patches.length, 1);
  assert.equal(patches[0].habitat, 'forest');
  assert.equal(patches[0].size, 5);
  assert.equal(patches[0].effectiveSize, 5);
  assert.deepEqual(patches[0].cells, [index(world, 0, 2), index(world, 1, 2), index(world, 2, 2), index(world, 3, 2), index(world, 4, 2)]);
  assert.deepEqual(patches[0].connectedTo, []);

  // Une prairie collée à la forêt fait une parcelle distincte (habitat différent) mais voisine.
  setTerrain(world, 5, 2, 'meadow');
  const two = findPatches(world);
  assert.equal(two.length, 2);
  const forest = two.find((p) => p.habitat === 'forest');
  const meadow = two.find((p) => p.habitat === 'meadow');
  assert.deepEqual(forest.adjacentTo, [meadow.id]);
  assert.deepEqual(forest.connectedTo, [meadow.id], 'même chaîne de nature');
  assert.equal(forest.effectiveSize, 5, 'une prairie n’agrandit pas un bois');
  assert.equal(habitatOf(world, index(world, 0, 2)), 'forest');
  assert.equal(habitatOf(world, index(world, 0, 0)), null);
  assert.ok(isNatureCell(world, index(world, 0, 2)));
  assert.ok(!isNatureCell(world, index(world, 0, 0)), 'l’herbe nue n’est pas un corridor');
});

test('écologie / faune : une rue à fort trafic coupe la contiguïté, un passage à faune la rétablit', () => {
  const build = () => {
    const w = makeWorld(9, 5);
    for (let x = 0; x <= 4; x++) setTerrain(w, x, 2, 'forest');
    return w;
  };
  // Sans trafic : une seule parcelle.
  assert.equal(findPatches(build()).length, 1);

  // Trafic faible : rien n'est coupé.
  const light = build();
  setTrafficV(light, 2, 2, ECO_TRAFFIC_CUT - 1);
  assert.equal(findPatches(light).length, 1, 'sous le seuil, la faune passe encore');

  // Trafic ≥ 3 : deux parcelles, sans corridor entre elles.
  const cut = build();
  setTrafficV(cut, 2, 2, ECO_TRAFFIC_CUT);
  const split = findPatches(cut);
  assert.equal(split.length, 2);
  assert.deepEqual(split.map((p) => p.size).sort(), [2, 3]);
  for (const p of split) {
    assert.deepEqual(p.connectedTo, [], 'la rue coupe aussi la chaîne de nature');
    assert.equal(p.effectiveSize, p.size);
  }

  // Passage à faune sur la case de la coupure : il annule la coupure et sert de corridor.
  const crossed = build();
  setTrafficV(crossed, 2, 2, 9);
  place(crossed, 2, 2, 'wildlife-crossing');
  const linked = findPatches(crossed);
  assert.equal(linked.length, 2, 'la case du passage n’est plus un habitat');
  assert.deepEqual(linked.map((p) => p.size), [2, 2]);
  assert.deepEqual(linked[0].connectedTo, [linked[1].id], 'les deux bois se retrouvent');
  assert.equal(linked[0].effectiveSize, 4, 'ils comptent pour un seul massif');
  assert.equal(linked[1].effectiveSize, 4);
  assert.deepEqual(linked[0].adjacentTo, [], 'elles ne se touchent pas : c’est bien un corridor');
});

test('écologie / faune : biodiversité selon l’habitat, la taille, les rues et la pollution', () => {
  const small = makeWorld(9, 5);
  setTerrain(small, 1, 2, 'forest');
  const ecoSmall = createEcology(small);
  faunaStep(ecoSmall, small);
  assert.ok(Math.abs(at(ecoSmall, small, 'fauna', 1, 2) - ECO_FAUNA_BASE.forest * 1.1) < 1e-4);

  const big = makeWorld(9, 5);
  for (let x = 0; x <= 4; x++) setTerrain(big, x, 2, 'forest');
  const ecoBig = createEcology(big);
  faunaStep(ecoBig, big);
  const value = at(ecoBig, big, 'fauna', 2, 2);
  assert.ok(Math.abs(value - ECO_FAUNA_BASE.forest * 1.5) < 1e-4, 'parcelle de 5 : × 1,5');
  assert.ok(value > at(ecoSmall, small, 'fauna', 1, 2), 'un grand massif vaut mieux qu’un bosquet');
  assert.equal(at(ecoBig, big, 'fauna', 0, 0), 0, 'sans habitat, zéro');

  // Une rue de ceinture coûte 0,5 par arête.
  big.edges.v[edgeV(big, 2, 2)] = 2;
  const ecoRoad = createEcology(big);
  faunaStep(ecoRoad, big);
  assert.ok(Math.abs(at(ecoRoad, big, 'fauna', 2, 2) - (value - 0.5)) < 1e-4);
});

// ---------------------------------------------------------------------------------------------
// Espèces (§5.3).

test('écologie / espèces : la table couvre les sept espèces du contrat', () => {
  assert.deepEqual([...SPECIES_IDS], ['deer', 'heron', 'otter', 'bee', 'owl', 'swallow', 'fox']);
  for (const def of SPECIES) {
    assert.equal(typeof def.label, 'string');
    assert.ok(def.hint.length > 10 && def.hint.endsWith('.'), `${def.id} : la condition en une phrase`);
    assert.ok(def.textIn.length > 10 && def.textOut.length > 10, `${def.id} : textes d’arrivée et de départ`);
    assert.equal(typeof def.check, 'function');
    assert.equal(SPECIES_BY_ID[def.id], def);
  }
  assert.throws(() => getSpecies('dragon'));
  assert.equal(atLeast(3, 6), 0.5);
  assert.equal(atLeast(6, 6), 1);
  assert.equal(atMost(40, 40), 1);
  assert.equal(atMost(52, 40), 0.8, '20 % sous le seuil');
});

/** Les sept mondes fabriqués exprès : un par espèce, plus de quoi faire tomber la condition. */
const SPECIES_WORLDS = {
  deer: {
    make() {
      const w = makeWorld(11, 11);
      for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) setTerrain(w, x, y, 'forest');
      return w;
    },
    break: (w) => place(w, 5, 2, 'factory'),
  },
  heron: {
    make() {
      const w = makeWorld(11, 11);
      for (const [x, y] of [[4, 4], [5, 4], [4, 5], [5, 5]]) setTerrain(w, x, y, 'lake');
      setTerrain(w, 6, 4, 'wetland');
      setTerrain(w, 6, 5, 'wetland');
      return w;
    },
    // On lui retire ses berges : c'est exactement ce que la règle veut protéger.
    break: (w) => { setTerrain(w, 6, 4, 'grass'); setTerrain(w, 6, 5, 'grass'); },
  },
  otter: {
    make() {
      const w = makeWorld(11, 11);
      river(w, 5, 0, 10);
      for (const y of [2, 3, 4]) setTerrain(w, 4, y, 'forest');
      return w;
    },
    break: (w) => { for (const y of [2, 3, 4]) setTerrain(w, 4, y, 'grass'); },
  },
  bee: {
    make() {
      const w = makeWorld(11, 11);
      setTerrain(w, 2, 2, 'meadow');
      setTerrain(w, 3, 2, 'field');
      place(w, 3, 2, 'orchard');
      return w;
    },
    break: (w) => { w.tiles[index(w, 3, 2)].building = null; },
  },
  owl: {
    make() {
      const w = makeWorld(11, 11);
      for (const [x, y] of [[2, 2], [3, 2], [2, 3], [3, 3]]) setTerrain(w, x, y, 'forest');
      return w;
    },
    break: (w) => place(w, 5, 3, 'house'),
  },
  swallow: {
    make() {
      const w = makeWorld(11, 11);
      place(w, 5, 5, 'house');
      place(w, 6, 5, 'park');
      return w;
    },
    // On rase le parc : l'hirondelle récompense la ville verte, pas la ville tout court.
    break: (w) => { w.tiles[index(w, 6, 5)].building = null; },
  },
  fox: {
    make() {
      const w = makeWorld(11, 11);
      for (const y of [1, 2, 3]) setTerrain(w, 1, y, 'forest');
      for (const y of [1, 2, 3]) setTerrain(w, 6, y, 'forest');
      for (const x of [2, 3, 4, 5]) setTerrain(w, x, 2, 'meadow');
      return w;
    },
    break: (w) => { for (const x of [2, 3, 4, 5]) setTerrain(w, x, 2, 'grass'); },
  },
};

test('écologie / espèces : chacune apparaît dans son monde, et nulle part ailleurs', () => {
  const empty = createEcology(makeWorld(11, 11));
  assert.equal(speciesCount(empty), 0, 'une plaine d’herbe n’abrite personne');

  for (const def of SPECIES) {
    const recipe = SPECIES_WORLDS[def.id];
    const world = recipe.make();
    const eco = createEcology(world);
    const state = eco.species[def.id];
    assert.equal(state.present, true, `${def.id} : absente de son propre monde`);
    assert.equal(state.since, 0, `${def.id} : le mois de première apparition`);
    assert.ok(state.cells.length > 0, `${def.id} : aucune case`);
    const summary = speciesSummary(eco).find((s) => s.id === def.id);
    assert.deepEqual(
      { id: summary.id, label: summary.label, present: summary.present, since: summary.since, hint: summary.hint },
      { id: def.id, label: def.label, present: true, since: 0, hint: def.hint },
    );
  }
});

test('écologie / espèces : la condition tombe, l’espèce part après quinze mois', () => {
  for (const def of SPECIES) {
    const recipe = SPECIES_WORLDS[def.id];
    const world = recipe.make();
    const eco = createEcology(world);
    assert.equal(eco.species[def.id].present, true, def.id);
    recipe.break(world);
    syncEcology(eco, world);

    // Jamais avant quinze mois : la nature a droit à un sursis (§5.3).
    const before = steps(eco, world, ECO_SPECIES_LEAVE_MONTHS - 1, 1);
    assert.equal(eco.species[def.id].present, true, `${def.id} : partie trop tôt`);
    assert.ok(!before.some((e) => e.type === 'species' && e.key === def.id && e.present === false), `${def.id} : départ prématuré`);

    // Puis elle s'en va (tout de suite pour une condition qui tombe d'un coup, un peu plus tard quand la
    // dégradation est progressive comme l'eau d'un lac).
    let leaving = null;
    for (let m = ECO_SPECIES_LEAVE_MONTHS; m < 60 && !leaving; m++) {
      leaving = steps(eco, world, 1, m).find((e) => e.type === 'species' && e.key === def.id) || null;
    }
    assert.equal(eco.species[def.id].present, false, `${def.id} : toujours là bien après la coupure`);
    assert.deepEqual(eco.species[def.id].cells, []);
    assert.ok(leaving, `${def.id} : pas d’événement de départ`);
    assert.deepEqual(
      { type: leaving.type, key: leaving.key, present: leaving.present, text: leaving.text, layer: leaving.layer },
      { type: 'species', key: def.id, present: false, text: def.textOut, layer: 'fauna' },
    );
    assert.ok(Number.isInteger(leaving.x) && Number.isInteger(leaving.y));
    assert.equal(eco.species[def.id].since, 0, 'la première apparition reste inscrite au carnet');
  }
});

test('écologie / espèces : l’arrivée produit un événement chaleureux', () => {
  const world = makeWorld(11, 11);
  const eco = createEcology(world);
  assert.equal(speciesCount(eco), 0);
  for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) setTerrain(world, x, y, 'forest');
  syncEcology(eco, world);
  const events = steps(eco, world, 1, 4);
  const deer = events.find((e) => e.type === 'species' && e.key === 'deer');
  assert.ok(deer);
  assert.equal(deer.present, true);
  assert.equal(deer.text, SPECIES_BY_ID.deer.textIn);
  assert.equal(eco.species.deer.since, 4, 'le mois de la première apparition');
  assert.ok(eco.species.owl.present, 'la chouette aussi : le bois est assez sombre');
  assert.ok(speciesCount(eco) >= 2);
});

// ---------------------------------------------------------------------------------------------
// Sols (§5.4).

test('écologie / sols : intensif épuise, bio stabilise, jachère régénère', () => {
  const world = makeWorld(7, 7);
  for (const [x, mode] of [[1, 'intensive'], [3, 'organic']]) {
    setTerrain(world, x, 3, 'field');
    place(world, x, 3, 'field');
    world.tiles[index(world, x, 3)].building.mode = mode;
  }
  setTerrain(world, 5, 3, 'field'); // champ nu : jachère
  const eco = createEcology(world);
  assert.equal(at(eco, world, 'soil', 1, 3), ECO_SOIL_START);
  assert.equal(at(eco, world, 'soil', 5, 3), ECO_SOIL_START);
  assert.equal(at(eco, world, 'soil', 0, 0), 0, 'la fertilité ne vit que sur les champs');
  assert.equal(fieldModeOf(world.tiles[index(world, 1, 3)]), 'intensive');
  assert.equal(fieldModeOf(world.tiles[index(world, 3, 3)]), 'organic');
  assert.equal(fieldModeOf(world.tiles[index(world, 5, 3)]), 'fallow');

  for (let m = 0; m < 5; m++) soilStep(eco, world);
  assert.equal(at(eco, world, 'soil', 1, 3), ECO_SOIL_START + 5 * ECO_SOIL.intensive.change);
  assert.equal(at(eco, world, 'soil', 3, 3), ECO_SOIL_START + 5 * ECO_SOIL.organic.change);
  assert.equal(at(eco, world, 'soil', 5, 3), ECO_SOIL_START + 5 * ECO_SOIL.fallow.change);
  assert.ok(at(eco, world, 'soil', 1, 3) < ECO_SOIL_START, 'l’intensif épuise');
  assert.ok(at(eco, world, 'soil', 3, 3) > ECO_SOIL_START, 'le bio tient');

  // Rendement : l'intensif rend plus tant que la terre est bonne ; la jachère ne rend rien.
  assert.ok(fieldYieldOf(eco, world, index(world, 1, 3)) > fieldYieldOf(eco, world, index(world, 3, 3)));
  assert.equal(fieldYieldOf(eco, world, index(world, 5, 3)), 0);
  assert.equal(fieldYieldOf(eco, world, index(world, 0, 0)), 0);
});

test('écologie / sols : une colline érode, une haie annule l’érosion et filtre les rejets', () => {
  const build = (hedge) => {
    const w = makeWorld(7, 7);
    setTerrain(w, 3, 3, 'field');
    place(w, 3, 3, 'field');
    setTerrain(w, 3, 2, 'hill');
    if (hedge) place(w, 2, 3, 'hedge');
    const eco = createEcology(w);
    for (let m = 0; m < 4; m++) soilStep(eco, w);
    return { world: w, eco };
  };
  const bare = build(false);
  const hedged = build(true);
  assert.equal(at(bare.eco, bare.world, 'soil', 3, 3), ECO_SOIL_START + 4 * (ECO_SOIL.intensive.change - ECO_SOIL_EROSION));
  assert.equal(at(hedged.eco, hedged.world, 'soil', 3, 3), ECO_SOIL_START + 4 * ECO_SOIL.intensive.change);
  assert.ok(at(hedged.eco, hedged.world, 'soil', 3, 3) > at(bare.eco, bare.world, 'soil', 3, 3), 'la haie sauve la terre');

  // Les rejets du champ sont divisés par deux par la haie (§5.4).
  assert.equal(dischargeOf(bare.world, index(bare.world, 3, 3)), ECO_WATER_OUT.field.intensive);
  assert.equal(dischargeOf(hedged.world, index(hedged.world, 3, 3)), ECO_WATER_OUT.field.intensive / 2);

  // Pluies fortes : l'érosion est triplée sans haie.
  const rainy = makeWorld(7, 7);
  setTerrain(rainy, 3, 3, 'field');
  place(rainy, 3, 3, 'field');
  setTerrain(rainy, 3, 2, 'hill');
  const ecoRain = createEcology(rainy);
  soilStep(ecoRain, rainy, { rains: true });
  assert.equal(at(ecoRain, rainy, 'soil', 3, 3), ECO_SOIL_START + ECO_SOIL.intensive.change - 3 * ECO_SOIL_EROSION);
});

test('écologie / sols : un champ posé part de 70, une case qui cesse d’être un champ retombe à 0', () => {
  const world = makeWorld(5, 5);
  const eco = createEcology(world);
  assert.equal(at(eco, world, 'soil', 2, 2), 0);
  setTerrain(world, 2, 2, 'field');
  place(world, 2, 2, 'field');
  syncEcology(eco, world);
  assert.equal(at(eco, world, 'soil', 2, 2), ECO_SOIL_START, 'une terre neuve est bonne');
  for (let m = 0; m < 3; m++) soilStep(eco, world);
  assert.ok(at(eco, world, 'soil', 2, 2) < ECO_SOIL_START);
  setTerrain(world, 2, 2, 'grass');
  world.tiles[index(world, 2, 2)].building = null;
  syncEcology(eco, world);
  assert.equal(at(eco, world, 'soil', 2, 2), 0);
});

// ---------------------------------------------------------------------------------------------
// Scores, alertes, passe complète.

test('écologie / scores : bornés 0–100, nature suit l’air, l’eau, les espèces et les sols', () => {
  const clean = createEcology((() => {
    const w = makeWorld(11, 11);
    for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) setTerrain(w, x, y, 'forest');
    return w;
  })());
  for (const key of ['air', 'water', 'fauna', 'soil', 'nature']) {
    assert.ok(clean.scores[key] >= 0 && clean.scores[key] <= 100, `${key} hors bornes`);
    assert.ok(Number.isFinite(clean.scores[key]));
  }
  assert.ok(clean.scores.nature > 60, 'une vallée intacte est une bonne note');

  // Une ville d'usines sans la moindre nature : la note s'effondre.
  const grim = makeWorld(11, 11);
  for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) place(grim, x, y, 'factory');
  const ecoGrim = createEcology(grim);
  steps(ecoGrim, grim, 24);
  for (const key of ['air', 'water', 'fauna', 'soil', 'nature']) {
    assert.ok(ecoGrim.scores[key] >= 0 && ecoGrim.scores[key] <= 100, `${key} hors bornes`);
  }
  assert.ok(ecoGrim.scores.air < 20, 'l’air est irrespirable');
  assert.ok(ecoGrim.scores.fauna === 0, 'plus un habitat');
  assert.ok(ecoGrim.scores.nature < clean.scores.nature - 30, 'tout bétonner coûte très cher');
});

test('écologie / alertes : smog, algues, canicule et crue, avec de quoi centrer la carte', () => {
  // Smog : l'air moyen des quartiers au-dessus de 60 pendant cinq mois.
  const smoggy = makeWorld(7, 7);
  place(smoggy, 3, 3, 'house');
  for (const [x, y] of [[2, 3], [4, 3], [3, 2], [3, 4]]) place(smoggy, x, y, 'power-plant');
  const eco = createEcology(smoggy);
  const events = steps(eco, smoggy, 20);
  const smog = events.find((e) => e.type === 'eco-alert' && e.key === 'smog');
  assert.ok(smog, 'aucune alerte smog malgré quatre centrales');
  assert.deepEqual({ type: smog.type, key: smog.key, layer: smog.layer }, { type: 'eco-alert', key: 'smog', layer: 'air' });
  assert.equal(smog.x, 3);
  assert.equal(smog.y, 3);
  assert.ok(smog.text.length > 10);
  assert.ok(eco.alerts.smog >= 5);

  // Algues : un lac au-dessus de 60 pendant dix mois.
  const green = makeWorld(7, 7);
  setTerrain(green, 3, 3, 'lake');
  place(green, 2, 3, 'factory');
  const ecoLake = createEcology(green);
  const lakeEvents = steps(ecoLake, green, 24);
  const algae = lakeEvents.find((e) => e.type === 'eco-alert' && e.key === 'algae');
  assert.ok(algae, 'aucune alerte algues');
  assert.equal(algae.layer, 'water');

  // Canicule : en été, un quartier sans espace vert à deux cases.
  const hot = makeWorld(7, 7);
  place(hot, 3, 3, 'house');
  const ecoHot = createEcology(hot);
  const summer = steps(ecoHot, hot, 6, 3); // mois 3 à 5 : l'été
  const heat = summer.find((e) => e.type === 'eco-alert' && e.key === 'heat');
  assert.ok(heat, 'aucune alerte canicule');
  assert.equal(heat.layer, 'air');
  // Un parc à deux cases suffit à la faire taire.
  const shaded = makeWorld(7, 7);
  place(shaded, 3, 3, 'house');
  place(shaded, 4, 4, 'park');
  const ecoShaded = createEcology(shaded);
  assert.ok(!steps(ecoShaded, shaded, 6, 3).some((e) => e.key === 'heat'));

  // Crue : une rivière sans zones humides, quand les pluies fortes tombent.
  const flooded = makeWorld(7, 9);
  river(flooded, 3, 0, 8);
  const ecoFlood = createEcology(flooded);
  let crue = null;
  for (let m = 0; m < 48 && !crue; m++) {
    const r = stepEcology(ecoFlood, flooded, { month: m, rng: createRng(7, `eco/${m}`) });
    crue = r.events.find((e) => e.type === 'eco-alert' && e.key === 'flood') || null;
  }
  assert.ok(crue, 'aucune crue en quatre ans sans zones humides');
  assert.equal(crue.layer, 'water');
  // Avec des zones humides tout le long, le risque ne monte jamais.
  const marshy = makeWorld(7, 9);
  river(marshy, 3, 0, 8);
  for (let y = 0; y <= 8; y++) setTerrain(marshy, 2, y, 'wetland');
  const ecoMarshy = createEcology(marshy);
  for (let m = 0; m < 24; m++) {
    const r = stepEcology(ecoMarshy, marshy, { month: m, rng: createRng(7, `eco/${m}`) });
    assert.ok(!r.events.some((e) => e.key === 'flood'));
  }
  assert.equal(ecoMarshy.alerts.flood, 0);
});

test('écologie / passe mensuelle : déterministe, sans allocation ni NaN sur 120 ticks', () => {
  const world = createGame({ seed: 3 }).world;
  const eco = createEcology(world);
  const air = eco.air;
  const water = eco.water;
  const fauna = eco.fauna;
  const soil = eco.soil;
  for (let m = 0; m < 120; m++) {
    const r = stepEcology(eco, world, { month: m, rng: createRng(3, `eco/${m}`) });
    assert.equal(r.eco, eco, 'stepEcology rend le même objet');
  }
  assert.equal(eco.air, air, 'aucun tableau réalloué');
  assert.equal(eco.water, water);
  assert.equal(eco.fauna, fauna);
  assert.equal(eco.soil, soil);
  for (const key of ['air', 'water', 'fauna', 'soil']) {
    for (let i = 0; i < eco[key].length; i++) {
      assert.ok(Number.isFinite(eco[key][i]), `${key}[${i}] = ${eco[key][i]}`);
      assert.ok(eco[key][i] >= 0 && eco[key][i] <= 100, `${key}[${i}] hors bornes`);
    }
  }
  for (const key of ['air', 'water', 'fauna', 'soil', 'nature']) {
    assert.ok(eco.scores[key] >= 0 && eco.scores[key] <= 100);
  }

  // Déterminisme : le même monde et les mêmes graines donnent exactement la même écologie.
  const twin = createGame({ seed: 3 }).world;
  const again = createEcology(twin);
  for (let m = 0; m < 120; m++) stepEcology(again, twin, { month: m, rng: createRng(3, `eco/${m}`) });
  assert.deepEqual(Array.from(again.air), Array.from(eco.air));
  assert.deepEqual(Array.from(again.soil), Array.from(eco.soil));
  assert.deepEqual(again.scores, eco.scores);
  assert.deepEqual(again.alerts, eco.alerts);
  assert.deepEqual(speciesSummary(again), speciesSummary(eco));
});

test('écologie : sauvegarde, relecture et copie', () => {
  const world = createGame({ seed: 5 }).world;
  const eco = createEcology(world);
  steps(eco, world, 8);
  const saved = JSON.parse(JSON.stringify(serializeEcology(eco)));
  const back = reviveEcology(saved, world);
  assert.deepEqual(back, eco);
  assert.ok(back.air instanceof Float32Array);
  assert.deepEqual(back.patches, findPatches(world));
  // Un contenu absent ou de mauvaise taille : on repart d'une écologie neuve plutôt que de planter.
  const fresh = reviveEcology({ air: [1, 2, 3] }, world);
  assert.deepEqual(fresh, createEcology(world));
  assert.deepEqual(reviveEcology(null, world), createEcology(world));

  const copy = cloneEcology(eco);
  assert.deepEqual(copy, eco);
  steps(copy, world, 3);
  assert.notDeepEqual(Array.from(copy.air), Array.from(eco.air), 'la copie est indépendante');
});

test('écologie : tourisme, santé et rétroactions vers la ville (§5.5)', () => {
  const world = makeWorld(11, 11);
  for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) setTerrain(world, x, y, 'forest');
  const eco = createEcology(world);
  const quiet = tourismOf(eco, world);
  assert.ok(quiet > 0, 'les espèces et la forêt attirent');
  assert.equal(healthOf(eco, world), 100, 'sans ville, pleine santé');

  const city = makeWorld(11, 11);
  place(city, 5, 5, 'house');
  for (const [x, y] of [[4, 5], [6, 5], [5, 4]]) place(city, x, y, 'power-plant');
  const ecoCity = createEcology(city);
  steps(ecoCity, city, 24);
  assert.ok(healthOf(ecoCity, city) < 60, 'l’air malade la ville');
  assert.ok(tourismOf(ecoCity, city) === 0, 'personne ne vient visiter les cheminées');
});

test('écologie : la partie lit bien l’écologie (nature, bonheur, exode, carnet)', () => {
  let g = createGame({ seed: 2 });
  assert.equal(g.stats.nature, g.eco.scores.nature);
  assert.ok(g.stats.health >= 0 && g.stats.health <= 100);
  assert.ok(g.stats.tourism >= 0);
  assert.equal(g.stats.species, speciesCount(g.eco));
  const i = g.world.tiles.findIndex((t) => t.terrain === 'forest' && !t.building);
  const x = i % g.world.cols;
  const y = (i - x) / g.world.cols;
  const sheet = describeTile(g, x, y);
  assert.ok(sheet.eco, 'la fiche d’une case porte son écologie');
  assert.deepEqual(Object.keys(sheet.eco).sort(), ['air', 'fauna', 'fieldMode', 'habitat', 'patch', 'soil', 'species', 'water']);
  assert.equal(sheet.eco.habitat, 'forest');
  assert.ok(sheet.eco.patch && sheet.eco.patch.size > 0);
  g = advance(g, 3 * MONTH_SECONDS).game;
  assert.equal(g.stats.nature, g.eco.scores.nature);
  assert.ok(speciesSummary(g.eco).length === SPECIES.length);
  assert.ok(Number.isFinite(g.eco.air[index(g.world, x, y)]));
});
