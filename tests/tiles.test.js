import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TILES, TILE_BY_ID, FAMILIES, MODEL_IDS, ROAD_MODELS, VEHICLE_MODELS, URBAN_FAMILIES, YAW_BY_DIR,
  getTile, tilesOfFamily, isBuiltTile, jobsOfTile, residentsOfTile, modelOfBuilding,
} from '../src/data/tiles.js';
import { TERRAINS, TERRAIN_IDS, getTerrain, isWater, isBuildable } from '../src/data/terrain.js';
import { PALETTE } from '../src/data/palette.js';

/** Liste partagée avec l'agent des modèles (tools/import-models.js) : rien d'autre ne doit être référencé. */
const SHARED_MODEL_IDS = [
  'house-a', 'house-b', 'house-c', 'house-d', 'house-e', 'house-f', 'building-small-a', 'building-small-b', 'building-small-c', 'building-tall-a', 'building-tall-b', 'building-tall-c',
  'shop-a', 'shop-b', 'shop-c', 'office-a', 'office-b', 'factory-a', 'factory-b', 'school', 'clinic', 'market', 'townhall', 'tram-stop',
  'wastewater', 'wind-turbine', 'solar', 'power-plant', 'compost', 'water-tower',
  'park', 'tree-a', 'tree-b', 'tree-c', 'pine-a', 'pine-b', 'bush', 'flowers', 'rock-a', 'rock-b', 'crop-wheat', 'crop-corn',
  'road-straight', 'road-corner', 'road-t', 'road-cross', 'road-crosswalk', 'bridge',
  'tram', 'car-a', 'car-b', 'bus', 'truck',
];

test('tiles : identifiants uniques, familles connues, prix > 0, entretien ≥ 0', () => {
  const ids = TILES.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, 'identifiants en double');
  const families = FAMILIES.map((f) => f.id);
  for (const t of TILES) {
    assert.ok(families.includes(t.family), `${t.id} : famille inconnue ${t.family}`);
    assert.ok(Number.isFinite(t.price) && t.price > 0, `${t.id} : prix invalide`);
    assert.ok(Number.isFinite(t.upkeep) && t.upkeep >= 0, `${t.id} : entretien invalide`);
    assert.ok(typeof t.label === 'string' && t.label.length > 0, `${t.id} : libellé manquant`);
    assert.ok(t.produce && t.consume, `${t.id} : produce/consume manquants`);
    assert.ok(Number.isInteger(t.levels) && t.levels >= 1, `${t.id} : niveaux invalides`);
  }
  assert.deepEqual(families, ['habitat', 'activity', 'services', 'infrastructure', 'nature']);
  assert.ok(TILE_BY_ID.townhall && TILE_BY_ID.townhall.buyable === false, 'la mairie n’est pas à vendre');
});

test('tiles : le catalogue couvre les tuiles de GAME_DESIGN §3.2 et §6.3', () => {
  const expected = {
    habitat: ['house'],
    activity: ['shop', 'office', 'factory'],
    services: ['school', 'clinic', 'market', 'townhall', 'tram-stop'],
    infrastructure: ['wastewater', 'wind-turbine', 'solar', 'power-plant', 'compost', 'wildlife-crossing', 'water-tower'],
    nature: ['park', 'tree-planting', 'hedge', 'wetland-restored', 'orchard', 'field'],
  };
  for (const [family, ids] of Object.entries(expected)) {
    assert.deepEqual(tilesOfFamily(family).map((t) => t.id), ids, `famille ${family}`);
  }
  assert.equal(TILE_BY_ID.house.levels, 3);
  assert.equal(TILE_BY_ID.house.price, 60);
  assert.equal(TILE_BY_ID.shop.price, 80);
  assert.equal(TILE_BY_ID.office.price, 120);
  assert.equal(TILE_BY_ID.factory.price, 150);
  assert.equal(TILE_BY_ID.wastewater.price, 180);
  assert.equal(TILE_BY_ID['wind-turbine'].price, 90);
  assert.equal(TILE_BY_ID['power-plant'].price, 200);
  assert.deepEqual(TILE_BY_ID.townhall.produce, { jobs: 20, energy: 3, water: 3 });
  assert.deepEqual(TILE_BY_ID.house.clearing, { forest: 80, field: 20 });
  // Passage à faune (§5.3) : il rétablit la contiguïté des habitats malgré le trafic.
  const crossing = TILE_BY_ID['wildlife-crossing'];
  assert.equal(crossing.price, 120);
  assert.equal(crossing.upkeep, 5);
  assert.deepEqual(crossing.terrains, ['grass', 'meadow', 'forest']);
  assert.deepEqual(crossing.models[1], ['bridge'], 'modèle provisoire : le pont');
});

test('tiles : chaque modèle référencé est dans la liste partagée, un jeu de modèles par niveau', () => {
  const allowed = new Set(SHARED_MODEL_IDS);
  for (const t of TILES) {
    for (let level = 1; level <= t.levels; level++) {
      const list = t.models[level];
      assert.ok(Array.isArray(list) && list.length > 0, `${t.id} : pas de modèle au niveau ${level}`);
      for (const id of list) assert.ok(allowed.has(id), `${t.id} : modèle hors liste ${id}`);
    }
  }
  assert.deepEqual([...MODEL_IDS].sort(), [...SHARED_MODEL_IDS].sort(), 'MODEL_IDS = liste partagée');
  assert.equal(new Set(MODEL_IDS).size, MODEL_IDS.length);
  for (const id of Object.values(ROAD_MODELS)) assert.ok(allowed.has(id));
  for (const id of VEHICLE_MODELS) assert.ok(allowed.has(id));
  assert.deepEqual(TILE_BY_ID.house.models[1], ['house-a', 'house-b', 'house-c', 'house-d', 'house-e', 'house-f']);
  assert.deepEqual(TILE_BY_ID.house.models[3], ['building-tall-a', 'building-tall-b', 'building-tall-c']);
});

test('tiles : terrains permis valides, défrichement cohérent avec terrain.js', () => {
  for (const t of TILES) {
    for (const id of t.terrains) {
      assert.ok(TERRAIN_IDS.includes(id), `${t.id} : terrain inconnu ${id}`);
      assert.ok(isBuildable(id), `${t.id} : terrain non constructible ${id}`);
      const cost = getTerrain(id).clearingCost;
      if (cost > 0) assert.equal(t.clearing[id], cost, `${t.id} : défrichement de ${id}`);
    }
    for (const id of ['river', 'lake', 'wetland', 'hill']) assert.ok(!t.terrains.includes(id), `${t.id} sur ${id}`);
  }
});

test('terrain : huit terrains, couleurs de palette, coûts du contrat', () => {
  assert.deepEqual(TERRAIN_IDS, ['grass', 'meadow', 'forest', 'field', 'river', 'lake', 'wetland', 'hill']);
  for (const t of Object.values(TERRAINS)) {
    assert.ok(PALETTE[t.color], `${t.id} : couleur ${t.color} absente de la palette`);
    assert.ok(typeof t.label === 'string' && t.label.length > 0);
    for (const m of t.models) assert.ok(SHARED_MODEL_IDS.includes(m), `${t.id} : décor ${m} hors liste`);
  }
  assert.equal(TERRAINS.grass.clearingCost, 0);
  assert.equal(TERRAINS.meadow.clearingCost, 0);
  assert.equal(TERRAINS.field.clearingCost, 20);
  assert.equal(TERRAINS.forest.clearingCost, 80);
  for (const id of ['river', 'lake', 'wetland', 'hill']) {
    assert.equal(TERRAINS[id].clearingCost, null);
    assert.equal(TERRAINS[id].buildable, false);
  }
  assert.equal(TERRAINS.forest.airSink, 6);
  assert.equal(TERRAINS.wetland.airSink, 3);
  assert.equal(TERRAINS.meadow.airSink, 1);
  assert.equal(TERRAINS.lake.airSink, 1);
  assert.equal(TERRAINS.forest.habitat, 'forest');
  assert.equal(TERRAINS.grass.habitat, null);
  assert.equal(TERRAINS.forest.roadCost, 3);
  assert.equal(TERRAINS.river.roadCost, 5);
  assert.equal(TERRAINS.lake.roadCost, null);
  assert.equal(TERRAINS.wetland.roadCost, null);
  assert.ok(isWater('river') && isWater('lake') && isWater('wetland') && !isWater('grass'));
  assert.throws(() => getTerrain('sand'));
});

test('tiles : aides sur les cases (bâti, emplois, habitants, modèle)', () => {
  const house = { terrain: 'grass', flow: null, native: false, building: { type: 'house', level: 2, variant: 4, yaw: 90 } };
  const park = { terrain: 'grass', flow: null, native: false, building: { type: 'park', level: 1, variant: 0, yaw: 0 } };
  const grass = { terrain: 'grass', flow: null, native: true, building: null };
  assert.ok(isBuiltTile(house));
  assert.ok(!isBuiltTile(park), 'une nature plantée n’est pas un îlot bâti');
  assert.ok(!isBuiltTile(grass) && !isBuiltTile(null));
  assert.equal(residentsOfTile(house), 45);
  assert.equal(jobsOfTile(house), 0);
  assert.equal(jobsOfTile({ ...grass, building: { type: 'shop', level: 1, variant: 0, yaw: 0 } }), 15);
  assert.equal(jobsOfTile({ ...grass, building: { type: 'townhall', level: 1, variant: 0, yaw: 0 } }), 20);
  assert.equal(modelOfBuilding(house.building), 'building-small-b', 'variant 4 sur 3 modèles → le deuxième');
  assert.equal(modelOfBuilding({ type: 'house', level: 1, variant: 2 }), 'house-c');
  assert.equal(modelOfBuilding({ type: 'school', level: 1, variant: 7 }), 'school');
  assert.deepEqual(URBAN_FAMILIES, ['habitat', 'activity', 'services', 'infrastructure']);
  assert.deepEqual(YAW_BY_DIR, { S: 0, E: 90, N: 180, W: 270 });
  assert.throws(() => getTile('castle'));
});
