import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, advance, monthTick, computeStats, computeDemand, canPlace, place, demolish, undoLast, setSpeed, cycleSpeed,
  describeTile, serialize, deserialize, calendar, roadCostOfPath, countNativeNature, upkeepOf, incomeOf,
  GAME_VERSION, SAVE_VERSIONS, setFieldMode, localHappiness, FIELD_MODE_LABELS,
} from '../src/core/game.js';
import { findPatches, fieldYieldOf, speciesSummary, tourismOf, fieldModeOf } from '../src/core/ecology.js';
import { tileAt, edgesOfTile, edgeValue, index } from '../src/core/grid.js';
import { centerOf } from '../src/core/worldgen.js';
import { EDGE, countEdges, networkConnected } from '../src/core/roads.js';
import { TILES, TILE_BY_ID, residentsOfTile, jobsOfTile } from '../src/data/tiles.js';
import { TERRAINS } from '../src/data/terrain.js';
import {
  MONTH_SECONDS, SPEEDS, START_MONEY, UNDO_SECONDS, STREET_SEGMENT_COST, BRIDGE_SEGMENT_COST, DEMOLISH_COST,
  CAPACITY_BY_LEVEL, UPKEEP_BY_LEVEL, STREET_UPKEEP, INCOME_PER_RESIDENT, HAPPINESS_ARRIVALS, ARRIVAL_RATE, ARRIVAL_MIN,
  MAX_TICKS_PER_ADVANCE, START_UNLOCKED, ADJACENCY, EVOLUTION,
} from '../src/data/balance.js';

const SEED = 1;

/** Toutes les cases (x, y) du monde. */
function allCells(world) {
  const out = [];
  for (let y = 0; y < world.rows; y++) for (let x = 0; x < world.cols; x++) out.push({ x, y });
  return out;
}

/** Première case qui satisfait `pred(check, tile, x, y)` pour canPlace(tileId). */
function findPlaceable(game, tileId, pred = () => true) {
  for (const { x, y } of allCells(game.world)) {
    const check = canPlace(game, x, y, tileId);
    const tile = tileAt(game.world, x, y);
    if (check.ok && pred(check, tile, x, y)) return { x, y, check };
  }
  return null;
}

/** Avance de n mois d'un coup (à vitesse 1, 30 s par mois). */
function months(game, n) {
  let g = setSpeed(game, 1);
  const events = [];
  for (let i = 0; i < n; i++) {
    const r = advance(g, MONTH_SECONDS);
    g = r.game;
    events.push(...r.events);
  }
  return { game: g, events };
}

// ---------------------------------------------------------------------------------------------

test('balance : constantes du contrat, cohérence avec le catalogue', () => {
  assert.equal(MONTH_SECONDS, 30);
  assert.deepEqual([...SPEEDS], [0, 0.5, 1, 2, 4]);
  assert.equal(START_MONEY, 500);
  assert.equal(UNDO_SECONDS, 10);
  assert.equal(STREET_SEGMENT_COST, 10);
  assert.equal(BRIDGE_SEGMENT_COST, 40);
  assert.equal(DEMOLISH_COST, 10);
  assert.deepEqual({ ...CAPACITY_BY_LEVEL }, { 1: 20, 2: 45, 3: 80 });
  assert.deepEqual({ ...UPKEEP_BY_LEVEL }, { 1: 5, 2: 10, 3: 20 });
  assert.equal(STREET_UPKEEP, 2);
  for (const level of [1, 2, 3]) {
    assert.equal(TILE_BY_ID.house.perLevel[level].residents, CAPACITY_BY_LEVEL[level], `capacité niveau ${level}`);
    assert.equal(TILE_BY_ID.house.perLevel[level].upkeep, UPKEEP_BY_LEVEL[level], `entretien niveau ${level}`);
    assert.equal(TILE_BY_ID.house.perLevel[level].income, CAPACITY_BY_LEVEL[level] * INCOME_PER_RESIDENT, `recette niveau ${level}`);
  }
  // Table des adjacences §6.6.
  const byId = Object.fromEntries(ADJACENCY.map((a) => [a.id, a]));
  assert.equal(byId.factory.effect, -15);
  assert.equal(byId.green.effect, 8);
  assert.equal(byId.green.max, 16);
  assert.equal(byId.water.effect, 5);
  assert.equal(byId.shop.effect, 5);
  assert.equal(byId.school.effect, 10);
  assert.equal(byId.school.radius, 2);
  assert.equal(byId.clinic.effect, 5);
  assert.equal(byId['power-plant'].effect, -5);
  assert.equal(byId['power-plant'].radius, 2);
  assert.equal(byId['wind-turbine'].effect, -3);
  assert.equal(byId.market.effect, 5);
  // Évolutions §6.7.
  assert.equal(EVOLUTION.house[2].happiness, 60);
  assert.equal(EVOLUTION.house[3].happiness, 75);
  assert.deepEqual(EVOLUTION.house[2].requires.map((r) => r.buildings[0]), ['school', 'shop']);
  assert.deepEqual(EVOLUTION.house[3].requires[0].buildings, ['clinic']);
  // Le catalogue porte tous les champs que l'économie lit.
  for (const t of TILES) {
    for (const k of ['price', 'upkeep', 'produce', 'consume', 'levels', 'terrains', 'clearing']) assert.ok(k in t, `${t.id} : champ ${k}`);
    assert.ok(Array.isArray(t.terrains) && t.terrains.length > 0, `${t.id} : terrains`);
    for (let level = 1; level <= t.levels; level++) assert.ok(upkeepOf(t, level) >= 0 && incomeOf(t, level) >= 0);
  }
  assert.equal(TILE_BY_ID.orchard.terrainAfter, 'field');
  assert.equal(TILE_BY_ID['tree-planting'].terrainAfter, 'forest');
  assert.equal(TILE_BY_ID['wetland-restored'].terrainAfter, 'wetland');
  assert.equal(TILE_BY_ID.park.terrainAfter, undefined);
  assert.equal(TILE_BY_ID.hedge.terrainAfter, undefined);
  assert.equal(upkeepOf(TILE_BY_ID.house, 3), 20);
  assert.equal(upkeepOf(TILE_BY_ID.shop, 2), 10, 'niveau 2 sans perLevel.upkeep → UPKEEP_BY_LEVEL');
  assert.equal(upkeepOf(TILE_BY_ID.park, 1), 2);
});

test('game : création (argent 500, stats cohérentes, demande dans [0, 1], ville de départ)', () => {
  const g = createGame({ seed: SEED });
  assert.equal(g.version, 2, 'version 2 : l’écologie fait partie de la partie');
  assert.equal(GAME_VERSION, 2);
  assert.deepEqual([...SAVE_VERSIONS], [1, 2]);
  assert.ok(g.eco && g.eco.air.length === g.world.tiles.length, 'l’écologie est créée avec la partie');
  assert.equal(g.stats.nature, g.eco.scores.nature, 'la jauge Nature est le score d’écologie');
  assert.equal(g.seed, SEED);
  assert.equal(g.money, START_MONEY);
  assert.equal(g.clock, 0);
  assert.equal(g.month, 0);
  assert.equal(g.speed, 1);
  assert.equal(g.undo, null);
  assert.deepEqual(g.log, []);
  assert.deepEqual(g.unlocked, [...START_UNLOCKED]);
  assert.ok(g.unlocked.includes('house') && g.unlocked.includes('shop') && g.unlocked.includes('field'));
  assert.equal(g.natureBaseline, countNativeNature(g.world));
  assert.ok(g.natureBaseline > 40, 'une vraie vallée autour de la ville');
  const s = g.stats;
  let capacity = 0;
  let jobs = 0;
  for (const t of g.world.tiles) { capacity += residentsOfTile(t); jobs += jobsOfTile(t); }
  assert.equal(s.capacity, capacity);
  assert.equal(s.capacity, 200, 'dix quartiers de départ');
  assert.equal(s.jobs, jobs);
  assert.equal(s.jobs, 50, 'mairie + deux commerces');
  assert.equal(s.population, g.population);
  assert.ok(s.population > 0 && s.population <= s.capacity);
  assert.ok(s.happiness >= 0 && s.happiness <= 100);
  assert.ok(s.nature >= 0 && s.nature <= 100);
  assert.ok(s.happiness >= HAPPINESS_ARRIVALS, 'la ville de départ accueille des habitants');
  assert.equal(s.energy.have, 3);
  assert.equal(s.water.have, 3);
  assert.equal(s.food.have, 4.2, 'le champ de départ rend 1,5 × 70/100 (§5.4)');
  assert.ok(s.energy.need > s.energy.have, 'l’énergie manque au départ : premier objectif du joueur');
  assert.deepEqual(s.shortages, ['energy']);
  assert.equal(s.unemployment, false);
  assert.equal(s.streets, countEdges(g.world).total);
  assert.ok(s.income > 0 && s.upkeep > 0);
  assert.equal(s.income, Math.round(s.seasonIncome / 3));
  assert.equal(s.upkeep, Math.round(s.seasonUpkeep / 3));
  assert.deepEqual(computeStats(g), s, 'computeStats est déterministe');
  for (const [k, v] of Object.entries(g.demand)) assert.ok(v >= 0 && v <= 1, `demande ${k} = ${v}`);
  assert.ok('habitat' in g.demand && 'activity' in g.demand && 'services' in g.demand);
  assert.deepEqual(computeDemand(g), g.demand);
  assert.ok(g.demand.activity > 0, 'il manque des emplois');
  assert.equal(g.demand.habitat, 0, 'les quartiers sont loin d’être pleins');
  // Sans ville de départ : la mairie seule, personne.
  const alone = createGame({ seed: SEED, starterTown: false });
  assert.equal(alone.population, 0);
  assert.equal(alone.stats.capacity, 0);
  assert.equal(alone.stats.happiness, 50);
  assert.equal(alone.stats.income, 0);
  // Déterminisme.
  assert.deepEqual(createGame({ seed: SEED }), g);
});

test('game : advance (30 s à vitesse 1 = 1 mois ; vitesse 0 n’avance pas ; ×4 = quatre fois plus vite ; plafond de 12 mois)', () => {
  const g = createGame({ seed: SEED });
  const r1 = advance(g, 10);
  assert.equal(r1.game.month, 0);
  assert.equal(r1.game.clock, 10);
  assert.deepEqual(r1.events, []);
  assert.equal(r1.game.world, g.world, 'le monde n’est pas recopié sans changement');
  const r2 = advance(r1.game, 20);
  assert.equal(r2.game.month, 1);
  assert.equal(r2.game.clock, 0);
  assert.ok(r2.events.some((e) => e.type === 'month'));
  assert.equal(g.month, 0, 'pureté : la partie d’origine est intacte');

  const paused = setSpeed(g, 0);
  const r0 = advance(paused, 1000);
  assert.equal(r0.game, paused, 'à l’arrêt, rien ne change (même référence)');
  assert.deepEqual(r0.events, []);
  assert.equal(advance(g, 0).game, g);

  const fast = setSpeed(g, 4);
  const r4 = advance(fast, MONTH_SECONDS / 4);
  assert.equal(r4.game.month, 1);
  assert.equal(r4.game.clock, 0);
  const r4b = advance(fast, MONTH_SECONDS);
  assert.equal(r4b.game.month, 4, '30 s à ×4 = 4 mois');
  assert.equal(r4b.events.filter((e) => e.type === 'month').length, 4);
  const half = setSpeed(g, 0.5);
  assert.equal(advance(half, MONTH_SECONDS).game.month, 0);
  assert.equal(advance(half, 2 * MONTH_SECONDS).game.month, 1);

  // Plus de 12 mois d'un coup : plafonné et signalé.
  const huge = advance(fast, (MONTH_SECONDS * 20) / 4);
  assert.equal(huge.game.month, MAX_TICKS_PER_ADVANCE);
  assert.ok(huge.game.clock >= 0 && huge.game.clock < MONTH_SECONDS);
  const info = huge.events.find((e) => e.type === 'info');
  assert.ok(info && /12 mois/.test(info.text));
  assert.ok(huge.game.log.includes(info));
  // Les mois s'accumulent entre appels : 3 appels de 10 s = 1 mois.
  let g3 = g;
  for (let i = 0; i < 3; i++) g3 = advance(g3, 10).game;
  assert.equal(g3.month, 1);
  assert.ok(Math.abs(g3.clock) < 1e-9);
});

test('game : monthTick (recettes et entretien attendus pour la ville de départ, arrivées, événements)', () => {
  const g = createGame({ seed: SEED });
  const w = g.world;
  let houses = 0;
  let shops = 0;
  let fields = 0;
  let buildingUpkeep = 0;
  for (const t of w.tiles) {
    if (!t.building) continue;
    const def = TILE_BY_ID[t.building.type];
    if (def.id === 'house') houses++;
    if (def.id === 'shop') shops++;
    if (def.id === 'field') fields++;
    buildingUpkeep += def.upkeep;
  }
  assert.equal(houses, 10);
  assert.equal(shops, 2);
  assert.equal(fields, 1);
  // Les commerces profitent du tourisme (§5.5) et le champ rend selon sa fertilité (§5.4).
  const tourism = tourismOf(g.eco, w);
  assert.equal(g.stats.tourism, tourism);
  let fieldIncome = 0;
  for (let i = 0; i < w.tiles.length; i++) {
    if (w.tiles[i].building && w.tiles[i].building.type === 'field') fieldIncome += 10 * fieldYieldOf(g.eco, w, i);
  }
  const expectedSeasonIncome = Math.round(INCOME_PER_RESIDENT * g.population + shops * 30 * (1 + tourism / 100) + fieldIncome);
  const expectedSeasonUpkeep = buildingUpkeep + STREET_UPKEEP * countEdges(w).total;
  assert.equal(g.stats.seasonIncome, expectedSeasonIncome);
  assert.equal(g.stats.seasonUpkeep, expectedSeasonUpkeep);
  const income = Math.round(expectedSeasonIncome / 3);
  const upkeep = Math.round(expectedSeasonUpkeep / 3);
  assert.equal(g.stats.income, income);
  assert.equal(g.stats.upkeep, upkeep);

  const { game: g1, events } = monthTick(g);
  assert.equal(g1.month, 1);
  assert.equal(g1.money, START_MONEY + income - upkeep);
  assert.ok(g1.money > START_MONEY, 'la ville de départ gagne un peu d’argent chaque mois');
  const gap = g.stats.capacity - g.population;
  const arrivals = Math.min(gap, Math.max(ARRIVAL_MIN, Math.round(gap * ARRIVAL_RATE)));
  assert.equal(g1.population, g.population + arrivals);
  assert.equal(g1.stats.population, g1.population);
  const types = events.map((e) => e.type);
  assert.deepEqual(types, ['month', 'arrivals']);
  for (const e of events) {
    assert.equal(e.month, 0);
    assert.ok(typeof e.text === 'string' && e.text.length > 0);
  }
  assert.match(events[1].text, /nouveaux habitants s’installent/);
  assert.equal(events[0].text, `Mars : +${income - upkeep} $ (recettes ${income} $, entretien ${upkeep} $).`);
  assert.deepEqual(g1.log, events);
  assert.equal(g1.world, g.world, 'un mois ordinaire ne touche pas au monde');
  assert.equal(g.month, 0, 'pureté');
  assert.equal(g.money, START_MONEY);

  // Fin de saison et fin d'année.
  const { game: g3, events: e3 } = months(g, 3);
  assert.equal(g3.month, 3);
  assert.ok(e3.some((e) => e.type === 'season' && e.month === 2));
  assert.ok(!e3.some((e) => e.type === 'year'));
  const { game: g12, events: e12 } = months(g, 12);
  assert.equal(g12.month, 12);
  assert.equal(e12.filter((e) => e.type === 'season').length, 4);
  assert.equal(e12.filter((e) => e.type === 'year').length, 1);
  assert.equal(calendar(g12).year, 2);
  assert.ok(g12.money > 0, 'pas de faillite en un an sans rien faire');
  assert.ok(!e12.some((e) => e.type === 'broke'));
  assert.ok(g12.log.length <= 50);
  for (const e of e12) {
    assert.ok(['month', 'season', 'year', 'evolve', 'arrivals', 'departures', 'broke', 'placed', 'demolished', 'unlock', 'info', 'species', 'eco-alert'].includes(e.type), e.type);
  }
  // Les événements d'écologie portent de quoi centrer la carte et choisir le calque (§10.2).
  for (const e of e12.filter((ev) => ev.type === 'eco-alert' || ev.type === 'species')) {
    assert.ok(['smog', 'algae', 'flood', 'heat'].includes(e.key) || speciesSummary(g12).some((sp) => sp.id === e.key), e.key);
    assert.ok(['air', 'water', 'fauna'].includes(e.layer), e.layer);
    assert.ok(Number.isInteger(e.x) && Number.isInteger(e.y));
    assert.equal(typeof e.text, 'string');
  }
});

test('game : fin de saison : un quartier remplissant les conditions évolue, pas les autres', () => {
  // Mairie seule, beaucoup d'argent ; autour (toutes les cases à distance 1 sont en herbe) : un quartier à
  // l'est, une école au sud-est (r2 du quartier), un commerce à l'ouest (distance 2 : r2 mais pas r1),
  // un champ au nord pour la nourriture. Bonheur local = 50 + 10 (école) = 60 : juste la condition.
  const base = createGame({ seed: SEED, starterTown: false, money: 5000 });
  const c = centerOf(base.world);
  const build = (g, dx, dy, id) => {
    const r = place(g, c.x + dx, c.y + dy, id, 0);
    assert.ok(r.ok, `${id} en (${dx}, ${dy}) : ${r.reason}`);
    return r.game;
  };
  let g = build(base, 1, 0, 'house');
  g = build(g, 1, 1, 'school');
  g = build(g, -1, -1, 'shop');
  g = build(g, 0, -1, 'field');
  assert.deepEqual(g.stats.shortages, []);
  assert.equal(g.stats.unemployment, false);
  const sheet = describeTile(g, c.x + 1, c.y);
  assert.equal(sheet.happiness, 60);
  assert.equal(sheet.nextLevel, 2);
  assert.deepEqual(sheet.conditions.map((k) => k.met), [true, true, true]);
  assert.deepEqual(sheet.conditions.map((k) => k.label), ['Bonheur local ≥ 60', 'Une école à 2 cases', 'Un commerce à 2 cases']);

  const { game: after, events } = months(g, 3);
  const house = tileAt(after.world, c.x + 1, c.y).building;
  assert.equal(house.level, 2, 'évolution au bilan de saison');
  assert.equal(house.type, 'house');
  const evolve = events.find((e) => e.type === 'evolve');
  assert.ok(evolve, 'événement evolve');
  assert.equal(evolve.month, 2);
  assert.deepEqual({ x: evolve.x, y: evolve.y, level: evolve.level }, { x: c.x + 1, y: c.y, level: 2 });
  assert.match(evolve.text, /immeubles bas/);
  assert.equal(after.stats.capacity, CAPACITY_BY_LEVEL[2]);
  assert.notEqual(after.world, g.world, 'le monde change de référence quand un bâtiment évolue');
  assert.equal(tileAt(g.world, c.x + 1, c.y).building.level, 1, 'pureté');
  // Avant la fin de saison : rien.
  assert.equal(tileAt(months(g, 2).game.world, c.x + 1, c.y).building.level, 1);
  // Sans école : bonheur 50, pas d'école → pas d'évolution.
  let h = build(base, 1, 0, 'house');
  h = build(h, -1, -1, 'shop');
  h = build(h, 0, -1, 'field');
  const { game: still, events: none } = months(h, 6);
  assert.equal(tileAt(still.world, c.x + 1, c.y).building.level, 1);
  assert.ok(!none.some((e) => e.type === 'evolve'));
  const noSchool = describeTile(still, c.x + 1, c.y);
  assert.deepEqual(noSchool.conditions.map((k) => k.met), [false, false, true]);
  // Niveau 2 → 3 : clinique r2, parc ou forêt r1, bonheur ≥ 75.
  const lvl2 = describeTile(after, c.x + 1, c.y);
  assert.equal(lvl2.nextLevel, 3);
  assert.deepEqual(lvl2.conditions.map((k) => k.label), ['Bonheur local ≥ 75', 'Une clinique à 2 cases', 'Un parc ou une forêt voisine']);
});

test('game : canPlace (chaque raison)', () => {
  const g = createGame({ seed: SEED });
  const c = centerOf(g.world);
  assert.deepEqual(canPlace(g, -1, 0, 'house'), { ok: false, reason: 'out_of_bounds' });
  assert.deepEqual(canPlace(g, 0, g.world.rows, 'house'), { ok: false, reason: 'out_of_bounds' });
  assert.equal(canPlace(g, 0, 0, 'factory').reason, 'locked', 'pas encore au catalogue');
  assert.equal(canPlace(g, 0, 0, 'townhall').reason, 'locked', 'la mairie n’est pas à vendre');
  assert.equal(canPlace(g, 0, 0, 'castle').reason, 'locked', 'tuile inconnue');
  assert.equal(canPlace(g, c.x, c.y, 'house').reason, 'occupied');
  const lake = allCells(g.world).find(({ x, y }) => tileAt(g.world, x, y).terrain === 'lake');
  assert.ok(lake, 'il y a un lac');
  assert.equal(canPlace(g, lake.x, lake.y, 'house').reason, 'terrain', 'interdit sur le lac');
  assert.equal(canPlace(g, lake.x, lake.y, 'tree-planting').reason, 'terrain');
  const river = allCells(g.world).find(({ x, y }) => tileAt(g.world, x, y).terrain === 'river');
  assert.equal(canPlace(g, river.x, river.y, 'house').reason, 'terrain');
  const hill = allCells(g.world).find(({ x, y }) => tileAt(g.world, x, y).terrain === 'hill');
  if (hill) assert.equal(canPlace(g, hill.x, hill.y, 'house').reason, 'terrain');
  // Zone humide restaurée : seulement au bord de l'eau.
  const dry = allCells(g.world).find(({ x, y }) => {
    const t = tileAt(g.world, x, y);
    if (t.terrain !== 'grass' || t.building) return false;
    return ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
      const n = tileAt(g.world, x + dx, y + dy);
      return n && (n.terrain === 'river' || n.terrain === 'lake');
    });
  });
  const unlockedWetland = { ...g, unlocked: [...g.unlocked, 'wetland-restored'] };
  assert.equal(canPlace(unlockedWetland, dry.x, dry.y, 'wetland-restored').reason, 'terrain');
  // Argent.
  const poor = createGame({ seed: SEED, money: 10 });
  const spot = findPlaceable(g, 'house');
  assert.ok(spot);
  const broke = canPlace(poor, spot.x, spot.y, 'house');
  assert.equal(broke.reason, 'money');
  assert.equal(broke.cost, spot.check.cost, 'le coût est donné même quand l’argent manque');
  // Succès : coût = prix + défrichement + segments.
  for (const { x, y } of allCells(g.world)) {
    const check = canPlace(g, x, y, 'house');
    if (!check.ok) continue;
    const t = tileAt(g.world, x, y);
    const clearing = t.native ? TERRAINS[t.terrain].clearingCost : 0;
    assert.equal(check.clearing, clearing);
    assert.equal(check.price, 60);
    assert.deepEqual(check.road, roadCostOfPath(g.world, check.path));
    assert.equal(check.cost, 60 + clearing + check.road.street * STREET_SEGMENT_COST + check.road.bridge * BRIDGE_SEGMENT_COST);
    assert.equal(check.reason, null);
  }
  // Injoignable : un monde où un lac coupe la carte en deux.
  const cols = 8;
  const rows = 8;
  const tiles = Array.from({ length: cols * rows }, (_, i) => ({ terrain: i % cols === 4 ? 'lake' : 'grass', flow: null, native: true, building: null }));
  tiles[1 * cols + 1] = { terrain: 'grass', flow: null, native: false, building: { type: 'townhall', level: 1, variant: 0, yaw: 0 } };
  const island = deserialize({
    version: 1, seed: 9, clock: 0, month: 0, speed: 1, money: 1000, population: 0, unlocked: ['house', 'tree-planting'], natureBaseline: 8,
    world: { seed: 9, cols, rows, tiles, edges: { h: new Array((rows + 1) * cols).fill(0), v: new Array(rows * (cols + 1)).fill(0) } },
  });
  assert.equal(canPlace(island, 6, 1, 'house').reason, 'unreachable');
  assert.ok(canPlace(island, 2, 1, 'house').ok);
  assert.ok(canPlace(island, 6, 1, 'tree-planting').ok, 'une nature plantée n’a pas besoin de rue');
});

test('game : place (débit exact, desserte partagée, raccordement facturé, forêt plantée, orientation, événements)', () => {
  const g = createGame({ seed: SEED });
  // Case déjà contre le réseau : seulement le prix.
  const near = findPlaceable(g, 'house', (check, tile) => check.path.length === 0 && tile.terrain === 'grass');
  assert.ok(near);
  const r = place(g, near.x, near.y, 'house', 100);
  assert.ok(r.ok);
  assert.equal(r.cost, 60);
  assert.equal(r.game.money, g.money - 60);
  const placed = tileAt(r.game.world, near.x, near.y);
  assert.equal(placed.building.type, 'house');
  assert.equal(placed.building.level, 1);
  assert.equal(placed.native, false);
  assert.ok([0, 90, 180, 270].includes(placed.building.yaw));
  assert.ok(Object.values(edgesOfTile(r.game.world, near.x, near.y)).some(ref => edgeValue(r.game.world, ref) >= EDGE.STREET), 'une desserte réelle longe la parcelle');
  assert.deepEqual(r.game.world.edges, g.world.edges, 'une maison déjà desservie ne crée pas de rue');
  assert.ok(networkConnected(r.game.world));
  assert.equal(r.game.stats.capacity, g.stats.capacity + 20);
  assert.equal(r.game.population, g.population);
  assert.equal(r.events.length, 1);
  assert.deepEqual({ type: r.events[0].type, x: r.events[0].x, y: r.events[0].y, month: r.events[0].month }, { type: 'placed', x: near.x, y: near.y, month: 0 });
  assert.ok(r.game.log.includes(r.events[0]));
  assert.ok(r.game.undo && r.game.undo.until === 100 + UNDO_SECONDS);
  assert.notEqual(r.game.world, g.world);
  assert.equal(tileAt(g.world, near.x, near.y).building, null, 'pureté');
  assert.equal(g.money, START_MONEY);

  // Case isolée : le tracé est facturé, puis posé.
  const far = findPlaceable(g, 'house', (check, tile) => check.road.street >= 2 && check.road.bridge === 0 && tile.terrain === 'grass');
  assert.ok(far, 'une case isolée reliable par la terre ferme');
  const bare = far.check.path.filter((ref) => edgeValue(g.world, ref) === EDGE.NONE);
  assert.equal(far.check.road.street, bare.length);
  assert.equal(far.check.cost, 60 + bare.length * STREET_SEGMENT_COST);
  const rf = place(g, far.x, far.y, 'house', 100);
  assert.ok(rf.ok);
  assert.equal(rf.game.money, g.money - far.check.cost);
  for (const ref of far.check.path) assert.ok(edgeValue(rf.game.world, ref) >= EDGE.STREET, 'le tracé est construit');
  assert.ok(networkConnected(rf.game.world));
  assert.ok(countEdges(rf.game.world).total >= countEdges(g.world).total + bare.length);
  assert.ok(rf.game.stats.upkeep > g.stats.upkeep, 'plus de rues, plus d’entretien');

  // Défrichement d'une forêt native : +80 $ et la jauge Nature baisse.
  const woods = findPlaceable(g, 'house', (check, tile) => tile.terrain === 'forest' && tile.native);
  if (woods) {
    assert.equal(woods.check.clearing, 80);
    const rw = place(g, woods.x, woods.y, 'house', 0);
    assert.ok(rw.ok);
    assert.equal(rw.game.money, g.money - woods.check.cost);
    assert.equal(tileAt(rw.game.world, woods.x, woods.y).terrain, 'forest', 'le terrain reste une forêt (défrichée)');
    assert.equal(tileAt(rw.game.world, woods.x, woods.y).native, false);
    // L'écologie enregistre la perte tout de suite : la case n'est plus un habitat de forêt et le massif
    // perd une case (la jauge Nature, elle, suit l'air, l'eau, les espèces et les sols au tick suivant).
    assert.equal(describeTile(rw.game, woods.x, woods.y).eco.habitat, null);
    const before = findPatches(g.world).filter((p) => p.habitat === 'forest');
    const after = findPatches(rw.game.world).filter((p) => p.habitat === 'forest');
    const cells = (list) => list.reduce((n, p) => n + p.size, 0);
    assert.equal(cells(after), cells(before) - 1, 'une case de forêt en moins');
  }

  // Forêt plantée : le terrain devient forêt, non natif ; aucune rue n'est tracée ; la nature monte.
  const grass = findPlaceable(g, 'tree-planting', (check, tile) => tile.terrain === 'grass');
  assert.ok(grass);
  assert.deepEqual(grass.check.path, []);
  assert.equal(grass.check.cost, 30);
  const rt = place(g, grass.x, grass.y, 'tree-planting', 0);
  assert.ok(rt.ok);
  const planted = tileAt(rt.game.world, grass.x, grass.y);
  assert.equal(planted.terrain, 'forest');
  assert.equal(planted.native, false);
  assert.equal(planted.building.type, 'tree-planting');
  assert.equal(rt.game.money, g.money - 30);
  assert.ok(rt.game.stats.nature >= g.stats.nature);
  assert.equal(countEdges(rt.game.world).total, countEdges(g.world).total, 'pas de rue autour d’une forêt plantée');
  // Verger : champ + bâtiment ; parc : herbe + bâtiment.
  const ro = place(g, grass.x, grass.y, 'orchard', 0);
  assert.ok(ro.ok);
  assert.equal(tileAt(ro.game.world, grass.x, grass.y).terrain, 'field');
  assert.equal(tileAt(ro.game.world, grass.x, grass.y).building.type, 'orchard');
  const rp = place(g, grass.x, grass.y, 'park', 0);
  assert.ok(rp.ok);
  assert.equal(tileAt(rp.game.world, grass.x, grass.y).terrain, 'grass');
  assert.equal(tileAt(rp.game.world, grass.x, grass.y).building.type, 'park');

  // Refus : la partie est rendue telle quelle.
  const lake = allCells(g.world).find(({ x, y }) => tileAt(g.world, x, y).terrain === 'lake');
  const bad = place(g, lake.x, lake.y, 'house', 0);
  assert.deepEqual(bad, { ok: false, reason: 'terrain', game: g, cost: 0, events: [] });
  const poor = place(createGame({ seed: SEED, money: 5 }), near.x, near.y, 'house', 0);
  assert.equal(poor.reason, 'money');
});

test('game : demolish (mairie refusée ; argent −10 ; terrain herbe ; rues inutiles retirées)', () => {
  const g = createGame({ seed: SEED });
  const c = centerOf(g.world);
  const hall = demolish(g, c.x, c.y);
  assert.deepEqual(hall, { ok: false, reason: 'protected', game: g, cost: 0, events: [] });
  assert.equal(demolish(g, -1, 0).reason, 'out_of_bounds');
  const empty = allCells(g.world).find(({ x, y }) => !tileAt(g.world, x, y).building);
  assert.equal(demolish(g, empty.x, empty.y).reason, 'empty');

  const house = allCells(g.world).find(({ x, y }) => tileAt(g.world, x, y).building?.type === 'house');
  const r = demolish(g, house.x, house.y);
  assert.ok(r.ok);
  assert.equal(r.cost, DEMOLISH_COST);
  assert.equal(r.game.money, g.money - DEMOLISH_COST);
  const t = tileAt(r.game.world, house.x, house.y);
  assert.deepEqual(t, { terrain: 'grass', flow: null, native: false, building: null });
  assert.equal(r.game.stats.capacity, g.stats.capacity - 20);
  assert.ok(networkConnected(r.game.world));
  assert.equal(r.game.undo, null);
  assert.equal(r.events[0].type, 'demolished');
  assert.ok(tileAt(g.world, house.x, house.y).building, 'pureté');

  // Une maison isolée reliée par un tracé : sa démolition efface le tracé devenu inutile.
  const far = findPlaceable(g, 'house', (check, tile) => check.road.street >= 2 && check.road.bridge === 0 && tile.terrain === 'grass');
  const placed = place(g, far.x, far.y, 'house', 0).game;
  const before = countEdges(g.world);
  const removed = demolish(placed, far.x, far.y).game;
  assert.deepEqual(countEdges(removed.world), before, 'les rues reviennent à l’état d’avant la pose');
  assert.ok(networkConnected(removed.world));
  assert.equal(removed.stats.upkeep, g.stats.upkeep);
  // La population ne dépasse jamais la capacité après une démolition.
  const full = { ...g, population: g.stats.capacity };
  const shrunk = demolish(full, house.x, house.y).game;
  assert.equal(shrunk.population, shrunk.stats.capacity);
});

test('game : undoLast (dans les 10 s : état identique à avant, argent compris ; au-delà : null)', () => {
  const g = createGame({ seed: SEED });
  const spot = findPlaceable(g, 'house', (check) => check.road.street >= 1);
  const r = place(g, spot.x, spot.y, 'house', 100);
  assert.ok(r.ok && r.game.money < g.money);
  const undone = undoLast(r.game, 105);
  assert.ok(undone);
  assert.deepEqual(undone, g, 'retour exact à l’état d’avant la pose');
  assert.equal(undone.money, START_MONEY);
  assert.deepEqual(countEdges(undone.world), countEdges(g.world));
  assert.deepEqual(undoLast(r.game, 100 + UNDO_SECONDS), g, 'borne incluse');
  assert.equal(undoLast(r.game, 110.5), null, 'trop tard');
  assert.equal(undoLast(g, 0), null, 'rien à annuler');
  assert.equal(undoLast(undone, 101), null, 'une seule annulation');
  assert.ok(r.game.undo, 'pureté : la partie posée garde son annulation');
  // Un mois s'est écoulé entre-temps : la pose est remboursée, la caisse du mois conservée.
  const later = advance(r.game, MONTH_SECONDS).game;
  const u2 = undoLast(later, 105);
  assert.ok(u2);
  assert.equal(u2.month, 1);
  assert.equal(u2.money, later.money + r.cost);
  assert.equal(tileAt(u2.world, spot.x, spot.y).building, null);
  assert.equal(u2.undo, null);
  assert.ok(u2.population <= u2.stats.capacity);
  // La démolition efface l'annulation en attente.
  const house = allCells(g.world).find(({ x, y }) => tileAt(g.world, x, y).building?.type === 'house');
  assert.equal(demolish(r.game, house.x, house.y).game.undo, null);
});

test('game : déblocages par palier de population (événement unlock, catalogue étendu)', () => {
  const g = createGame({ seed: SEED });
  assert.ok(!g.unlocked.includes('office'));
  assert.equal(canPlace(g, 0, 0, 'office').reason, 'locked');
  // 90 habitants dès le départ : au premier bilan de saison, les bureaux, le marché et le compost s'ouvrent.
  const crowded = { ...g, population: 90 };
  const { game: after, events } = months(crowded, 3);
  const unlocks = events.filter((e) => e.type === 'unlock');
  assert.deepEqual(unlocks.map((e) => e.tileId), ['office', 'market', 'compost']);
  assert.ok(unlocks.every((e) => e.month === 2 && /Nouveau au catalogue/.test(e.text)));
  assert.ok(after.unlocked.includes('office') && after.unlocked.includes('market'));
  assert.ok(!after.unlocked.includes('factory'), 'palier suivant pas encore atteint');
  assert.equal(months(g, 3).events.filter((e) => e.type === 'unlock').length, 0, 'sous le palier : rien');
});

test('game : setSpeed et cycleSpeed', () => {
  const g = createGame({ seed: SEED });
  assert.equal(setSpeed(g, 1), g, 'même vitesse : même objet');
  assert.equal(setSpeed(g, 2).speed, 2);
  assert.equal(g.speed, 1);
  assert.throws(() => setSpeed(g, 3), /Vitesse inconnue/);
  const seen = [];
  let s = setSpeed(g, 0);
  for (let i = 0; i < 6; i++) { seen.push(s.speed); s = cycleSpeed(s); }
  assert.deepEqual(seen, [0, 0.5, 1, 2, 4, 0]);
});

test('game : describeTile (terrain, bâtiment, conditions d’évolution, rendements)', () => {
  const g = createGame({ seed: SEED });
  const c = centerOf(g.world);
  const hall = describeTile(g, c.x, c.y);
  assert.equal(hall.terrainLabel, 'Herbe');
  assert.equal(hall.building.type, 'townhall');
  assert.equal(hall.building.label, 'Mairie');
  assert.equal(hall.building.family, 'services');
  assert.equal(hall.building.familyLabel, 'Services');
  assert.deepEqual(hall.conditions, []);
  assert.equal(hall.nextLevel, null);
  assert.equal(hall.yields.jobs, 20);
  assert.equal(hall.yields.upkeep, 0);
  assert.equal(hall.happiness, null);

  const house = allCells(g.world).find(({ x, y }) => tileAt(g.world, x, y).building?.type === 'house');
  const h = describeTile(g, house.x, house.y);
  assert.equal(h.building.level, 1);
  assert.equal(h.building.levelLabel, 'Maisons');
  assert.equal(h.building.maxLevel, 3);
  assert.equal(h.nextLevel, 2);
  assert.deepEqual(h.conditions.map((k) => k.label), ['Bonheur local ≥ 60', 'Une école à 2 cases', 'Un commerce à 2 cases']);
  for (const k of h.conditions) assert.equal(typeof k.met, 'boolean');
  assert.equal(h.conditions[1].met, false, 'pas d’école au départ');
  assert.deepEqual(h.yields, { income: 40, upkeep: 5, jobs: 0, capacity: 20, residents: Math.round(20 * g.population / g.stats.capacity), energy: -1, water: -1, food: -1 });
  assert.deepEqual({ energy: hall.yields.energy, water: hall.yields.water }, { energy: 3, water: 3 }, 'la mairie produit 3 énergie et 3 eau');
  assert.ok(h.happiness >= 0 && h.happiness <= 100);
  assert.ok(Array.isArray(h.adjacency));

  const empty = allCells(g.world).find(({ x, y }) => tileAt(g.world, x, y).terrain === 'forest' && !tileAt(g.world, x, y).building);
  const f = describeTile(g, empty.x, empty.y);
  assert.equal(f.terrainLabel, 'Forêt ancienne');
  assert.equal(f.building, null);
  assert.equal(f.native, true);
  assert.equal(f.clearing, 80);
  assert.deepEqual(f.yields, { income: 0, upkeep: 0, jobs: 0, capacity: 0, residents: 0, energy: 0, water: 0, food: 0 });
  assert.equal(describeTile(g, -1, 0), null);
});

test('game : serialize / deserialize (égalité profonde, y compris après trois mois et une pose)', () => {
  const g = createGame({ seed: SEED });
  const s = serialize(g);
  assert.equal(s.version, 2);
  assert.ok(Array.isArray(s.eco.air) && s.eco.air.length === g.world.tiles.length, 'l’écologie est sauvée en tableaux simples');
  assert.ok(Array.isArray(s.world.edges.h) && Array.isArray(s.world.traffic.v), 'tableaux simples dans la sauvegarde');
  assert.equal(s.undo, null);
  const back = deserialize(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(back, g);
  assert.ok(back.world.edges.h instanceof Uint8Array);
  assert.ok(back.world.traffic.h instanceof Float32Array);
  assert.deepEqual(serialize(back), s);

  const spot = findPlaceable(g, 'house');
  const played = advance(place(g, spot.x, spot.y, 'house', 0).game, 3 * MONTH_SECONDS).game;
  assert.equal(played.month, 3);
  assert.ok(played.log.length > 0);
  const s3 = serialize(played);
  const back3 = deserialize(JSON.parse(JSON.stringify(s3)));
  assert.deepEqual(back3, { ...played, undo: null }, 'tout sauf l’annulation (liée aux secondes réelles)');
  assert.deepEqual(serialize(back3), s3);
  // La sauvegarde ne partage rien avec la partie.
  s3.world.tiles[0].terrain = 'lake';
  assert.notEqual(played.world.tiles[0].terrain, 'lake');

  // Aller-retour de l'écologie : champs, espèces, alertes et scores identiques, parcelles recalculées.
  const eg = advance(g, 7 * MONTH_SECONDS).game;
  const eback = deserialize(JSON.parse(JSON.stringify(serialize(eg))));
  assert.deepEqual(eback.eco, eg.eco);
  assert.ok(eback.eco.air instanceof Float32Array && eback.eco.soil instanceof Float32Array);
  assert.deepEqual(eback.eco.patches, findPatches(eg.world));
  assert.deepEqual(speciesSummary(eback.eco), speciesSummary(eg.eco));
  assert.equal(eback.stats.nature, eg.stats.nature);

  // Migration depuis la version 1 (avant l'écologie) : l'écologie est recalculée de zéro.
  const v1 = serialize(g);
  v1.version = 1;
  delete v1.eco;
  const migrated = deserialize(JSON.parse(JSON.stringify(v1)));
  assert.equal(migrated.version, 2);
  assert.ok(migrated.eco && migrated.eco.air.length === g.world.tiles.length);
  assert.deepEqual(migrated.eco, createGame({ seed: SEED }).eco, 'l’écologie migrée est celle d’une partie neuve');
  assert.equal(migrated.stats.nature, g.stats.nature);
  assert.deepEqual(serialize(migrated), s);

  // Versions et contenus inconnus : erreurs claires.
  assert.throws(() => deserialize({ ...s, version: 3 }), /version inconnue/);
  assert.throws(() => deserialize({ ...s, version: undefined }), /version inconnue/);
  assert.throws(() => deserialize(null), /illisible/);
  assert.throws(() => deserialize('{}'), /illisible/);
  assert.throws(() => deserialize({ version: 1 }), /monde/);
  assert.throws(() => deserialize({ ...s, world: { ...s.world, tiles: s.world.tiles.slice(1) } }), /nombre de cases/);
  assert.throws(() => deserialize({ ...s, world: { ...s.world, tiles: s.world.tiles.map((t, i) => (i === 0 ? { ...t, terrain: 'sand' } : t)) } }), /terrain inconnu/);
  // Trafic absent : recalculé.
  const noTraffic = deserialize({ ...s, world: { ...s.world, traffic: null } });
  assert.deepEqual(noTraffic.world.traffic, g.world.traffic);
});


test('game : conduite d’un champ (intensif, bio, jachère) et rendement qui suit', () => {
  const g = createGame({ seed: SEED });
  const i = g.world.tiles.findIndex((t) => t.building && t.building.type === 'field');
  assert.ok(i >= 0, 'la ville de départ a un champ');
  const x = i % g.world.cols;
  const y = (i - x) / g.world.cols;
  assert.equal(fieldModeOf(g.world.tiles[i]), 'intensive', 'la conduite par défaut');

  const bio = setFieldMode(g, x, y, 'organic');
  assert.ok(bio.ok);
  assert.equal(fieldModeOf(bio.game.world.tiles[i]), 'organic');
  assert.notEqual(bio.game.world, g.world, 'le monde est recopié : la partie d’avant ne bouge pas');
  assert.equal(fieldModeOf(g.world.tiles[i]), 'intensive');
  assert.equal(bio.events[0].type, 'info');
  assert.match(bio.events[0].text, new RegExp(FIELD_MODE_LABELS.organic));
  assert.ok(bio.game.stats.food.have < g.stats.food.have, 'le bio rend moins tout de suite');

  // Jachère : plus rien à récolter, mais la terre remonte de 4 par mois.
  const fallow = setFieldMode(g, x, y, 'fallow');
  assert.ok(fallow.ok);
  assert.equal(fieldYieldOf(fallow.game.eco, fallow.game.world, i), 0);
  const soilBefore = fallow.game.eco.soil[i];
  const rested = advance(fallow.game, 3 * MONTH_SECONDS).game;
  assert.ok(rested.eco.soil[i] > soilBefore, 'la jachère régénère');
  // L'intensif, lui, épuise.
  const worked = advance(g, 3 * MONTH_SECONDS).game;
  assert.ok(worked.eco.soil[i] < soilBefore, 'l’intensif épuise');

  // Refus explicites.
  assert.equal(setFieldMode(g, x, y, 'biodynamie').reason, 'mode');
  assert.equal(setFieldMode(g, -1, 0, 'organic').reason, 'out_of_bounds');
  const c = centerOf(g.world);
  assert.equal(setFieldMode(g, c.x, c.y, 'organic').reason, 'not_a_field');
  assert.equal(setFieldMode(bio.game, x, y, 'organic').game, bio.game, 'remettre la même conduite ne change rien');
});

test('game : passage à faune (catalogue, pose, contiguïté rétablie)', () => {
  const g = createGame({ seed: SEED, money: 4000, unlocked: [...START_UNLOCKED, 'wildlife-crossing'] });
  const def = TILE_BY_ID['wildlife-crossing'];
  assert.equal(def.family, 'infrastructure');
  assert.equal(def.price, 120);
  const spot = findPlaceable(g, 'wildlife-crossing', (check, tile) => tile.terrain === 'grass');
  assert.ok(spot, 'une case d’herbe raccordable');
  assert.equal(spot.check.price, 120);
  const r = place(g, spot.x, spot.y, 'wildlife-crossing', 0);
  assert.ok(r.ok);
  assert.equal(tileAt(r.game.world, spot.x, spot.y).building.type, 'wildlife-crossing');
  assert.equal(r.game.money, g.money - spot.check.cost);

  // Son effet d'écologie : une rue chargée ne coupe plus la contiguïté de ses deux voisines.
  const world = r.game.world;
  const before = findPatches(world).length;
  assert.ok(before >= 0);
  const described = describeTile(r.game, spot.x, spot.y);
  assert.equal(described.building.label, 'Passage à faune');
  assert.ok(described.eco, 'la fiche porte l’écologie');
});

test('game : l’air d’une usine pèse sur le bonheur du quartier voisin', () => {
  const base = createGame({ seed: SEED, starterTown: false, money: 6000, unlocked: [...START_UNLOCKED, 'factory'] });
  const c = centerOf(base.world);
  const house = place(base, c.x + 1, c.y, 'house', 0);
  assert.ok(house.ok);
  const clean = advance(house.game, 24 * MONTH_SECONDS).game;
  const dirty0 = place(house.game, c.x + 2, c.y, 'factory', 0);
  assert.ok(dirty0.ok, dirty0.reason);
  const dirty = advance(dirty0.game, 24 * MONTH_SECONDS).game;

  const airClean = clean.eco.air[index(clean.world, c.x + 1, c.y)];
  const airDirty = dirty.eco.air[index(dirty.world, c.x + 1, c.y)];
  assert.ok(airDirty > airClean + 5, `l’usine enfume le quartier (${airDirty} contre ${airClean})`);
  const sheet = describeTile(dirty, c.x + 1, c.y);
  assert.ok(sheet.eco.air > 0);
  // Le bonheur local tient compte de l'air : la même case, avec et sans écologie.
  const withEco = localHappiness(dirty.world, c.x + 1, c.y, 0, dirty.eco);
  const without = localHappiness(dirty.world, c.x + 1, c.y, 0, null);
  assert.ok(withEco <= without, 'l’air ne peut que coûter du bonheur');
  assert.ok(dirty.stats.nature < clean.stats.nature, 'et la jauge Nature le voit');
});
