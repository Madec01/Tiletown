// Sauvegarde locale (src/storage.js) avec un localStorage factice : enregistrement, relecture par
// serialize / deserialize du cœur, « ?new=1 », stockage cassé ou plein, sauvegarde illisible.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, createCareerStorage, wantsNewGame, normalizeMode, SAVE_KEY, CAREER_KEY } from '../src/storage.js';
import { createCareer, finishLevel, serializeCareer } from '../src/core/career.js';
import { LEVELS } from '../src/data/levels.js';
import { edgesOfTile, edgeValue } from '../src/core/grid.js';
import { createGame, place, serialize, deserialize } from '../src/core/game.js';

/** localStorage factice : Map + mêmes méthodes ; `failWrite` simule un stockage plein ou interdit. */
function fakeStorage({ failWrite = false } = {}) {
  const map = new Map();
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem(k, v) {
      if (failWrite) throw new Error('QuotaExceededError');
      map.set(k, String(v));
    },
    removeItem: (k) => { map.delete(k); },
  };
}

test('?new=1 repart de zéro', () => {
  assert.equal(wantsNewGame('?new=1'), true);
  assert.equal(wantsNewGame('?new'), true);
  assert.equal(wantsNewGame('?seed=7&new=true'), true);
  assert.equal(wantsNewGame('?new=0'), false);
  assert.equal(wantsNewGame('?seed=7'), false);
  assert.equal(wantsNewGame(''), false);
});

test('saveGame / loadGame : la partie relue est la même (monde, argent, mois, graine), avec horodatage', () => {
  const ls = fakeStorage();
  const st = createStorage({ storage: ls, now: () => 1700000000000 });
  const game = createGame({ seed: 11, cols: 12, rows: 16, starterTown: true });
  assert.equal(st.hasSave(), false);
  assert.equal(st.loadGame(), null);
  assert.equal(st.saveGame(game), true);
  assert.equal(st.hasSave(), true);
  const raw = JSON.parse(ls.map.get(SAVE_KEY));
  assert.equal(raw.schema, 1);
  assert.equal(raw.savedAt, 1700000000000);
  assert.equal(raw.seed, game.seed);
  assert.equal(raw.money, game.money);
  assert.ok(raw.state && typeof raw.state === 'object', 'l’état est celui de serialize(game)');
  assert.deepEqual(raw.state, JSON.parse(JSON.stringify(serialize(game))), 'sérialisable en JSON tel quel');
  const back = st.loadGame();
  assert.ok(back);
  assert.equal(back.seed, game.seed);
  assert.equal(back.money, game.money);
  assert.equal(back.month, game.month);
  assert.equal(back.world.cols, game.world.cols);
  assert.equal(back.world.tiles.length, game.world.tiles.length);
  assert.deepEqual(back.world.tiles.map((t) => t.terrain), game.world.tiles.map((t) => t.terrain));
  assert.deepEqual(Array.from(back.world.edges.h), Array.from(game.world.edges.h), 'les arêtes (tableaux typés) survivent au JSON');
  assert.deepEqual(st.meta(), { savedAt: 1700000000000, seed: game.seed, month: game.month, money: game.money, version: game.version ?? null });
  st.clearGame();
  assert.equal(st.loadGame(), null);
  assert.equal(st.savedAt(), null);
});

test('une pose sauvée est relue : le bâtiment et ses rues sont là', () => {
  const ls = fakeStorage();
  const st = createStorage({ storage: ls });
  const game = createGame({ seed: 5, cols: 12, rows: 16, starterTown: true });
  // Première case libre où le quartier se pose.
  let placed = null;
  for (let i = 0; i < game.world.tiles.length && !placed; i++) {
    const x = i % game.world.cols;
    const y = Math.floor(i / game.world.cols);
    const res = place(game, x, y, 'house', 0);
    if (res && res.ok) placed = { x, y, game: res.game };
  }
  assert.ok(placed, 'aucune case pour un quartier ?');
  assert.equal(st.saveGame(placed.game), true);
  const back = st.loadGame();
  const tile = back.world.tiles[placed.y * back.world.cols + placed.x];
  assert.equal(tile.building && tile.building.type, 'house');
  assert.equal(back.money, placed.game.money);
  assert.ok(Object.values(edgesOfTile(back.world, placed.x, placed.y)).some(ref => edgeValue(back.world, ref) >= 2), 'une rue borde le quartier');
});

test('stockage indisponible, plein ou cassé : jamais d’exception, false / null', () => {
  const none = createStorage({ storage: () => null });
  assert.equal(none.saveGame({ version: 1 }), false);
  assert.equal(none.loadGame(), null);
  none.clearGame();
  const throwing = createStorage({ storage: () => { throw new Error('SecurityError'); } });
  assert.equal(throwing.saveGame({ version: 1 }), false);
  assert.equal(throwing.loadGame(), null);
  const full = createStorage({ storage: fakeStorage({ failWrite: true }) });
  assert.equal(full.saveGame(createGame({ seed: 1, cols: 12, rows: 16, starterTown: true })), false);
  const ls = fakeStorage();
  ls.map.set(SAVE_KEY, '{ pas du json');
  assert.equal(createStorage({ storage: ls }).loadGame(), null, 'JSON cassé → null');
  ls.map.set(SAVE_KEY, JSON.stringify({ schema: 1, state: 42 }));
  assert.equal(createStorage({ storage: ls }).loadGame(), null, 'état absurde → null');
  ls.map.set(SAVE_KEY, JSON.stringify({ schema: 1, state: { version: 999, world: null } }));
  const st = createStorage({ storage: ls, deserialize: () => { throw new Error('version inconnue'); } });
  assert.equal(st.loadGame(), null, 'deserialize qui lève → null, pas d’exception');
  assert.equal(createStorage({ storage: ls, serialize: () => { throw new Error('x'); } }).saveGame({}), false);
  assert.equal(createStorage({ storage: ls }).saveGame(null), false);
  assert.equal(typeof deserialize, 'function');
});


test('mode et niveau dans l’enveloppe : une partie de carrière se retrouve telle quelle', () => {
  const ls = fakeStorage();
  const st = createStorage({ storage: ls, now: () => 1700000000000 });
  const game = createGame({ level: LEVELS[0] });
  assert.equal(st.saveGame(game, { mode: 'career', levelId: LEVELS[0].id }), true);
  const raw = JSON.parse(ls.map.get(SAVE_KEY));
  assert.equal(raw.mode, 'career');
  assert.equal(raw.levelId, LEVELS[0].id);
  assert.deepEqual(st.meta(), { savedAt: 1700000000000, seed: game.seed, month: 0, money: game.money, version: game.version, mode: 'career', levelId: LEVELS[0].id });
  // Bac à sable : pas de niveau dans l’enveloppe.
  st.saveGame(game, { mode: 'sandbox', levelId: 'ignoré' });
  assert.equal(st.meta().mode, 'sandbox');
  assert.equal(st.meta().levelId, undefined);
  // Sans mode (sauvegarde d’avant la carrière) : l’enveloppe reste celle d’avant.
  st.saveGame(game);
  assert.equal(st.meta().mode, undefined);
  assert.equal(normalizeMode('career'), 'career');
  assert.equal(normalizeMode('title'), null);
  assert.equal(normalizeMode(undefined), null);
});

test('carrière sauvegardée à part (tiletown.career) : perdre la partie ne perd pas les étoiles', () => {
  const ls = fakeStorage();
  const games = createStorage({ storage: ls });
  const careers = createCareerStorage({ storage: ls });
  assert.equal(careers.key, CAREER_KEY);
  assert.equal(careers.has(), false);
  assert.equal(careers.load(), null);
  const career = finishLevel(createCareer(), LEVELS[0].id, 2);
  assert.equal(careers.save(career), true);
  assert.equal(careers.has(), true);
  const back = careers.load();
  assert.equal(back.stars[LEVELS[0].id], 2);
  assert.ok(back.unlocked.includes(LEVELS[1].id), 'le niveau suivant est ouvert');
  assert.deepEqual(back.tiles, serializeCareer(career).tiles);
  // La partie en cours s’efface sans toucher à la carrière.
  games.clearGame();
  assert.equal(careers.has(), true, 'la carrière survit à la partie');
  careers.clear();
  assert.equal(careers.load(), null);
  // Stockage cassé ou illisible : jamais d’exception.
  assert.equal(createCareerStorage({ storage: () => null }).save(career), false);
  assert.equal(createCareerStorage({ storage: () => null }).load(), null);
  ls.map.set(CAREER_KEY, '{ pas du json');
  assert.equal(createCareerStorage({ storage: ls }).load(), null);
  ls.map.set(CAREER_KEY, JSON.stringify({ schema: 1, state: { levelId: 'inexistant' } }));
  assert.equal(createCareerStorage({ storage: ls }).load(), null, 'carrière d’une version inconnue → null (on repart d’une carrière neuve)');
  ls.map.set(CAREER_KEY, JSON.stringify({ schema: 1, state: { version: 1, levelId: 'inexistant', unlocked: [], stars: {}, tiles: [], seen: [] } }));
  const repaired = createCareerStorage({ storage: ls }).load();
  assert.equal(repaired.levelId, LEVELS[0].id, 'un niveau inconnu ramène au premier');
  assert.equal(createCareerStorage({ storage: ls }).save(null), false);
});
