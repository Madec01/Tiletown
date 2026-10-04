import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng, hashSeed } from '../src/core/rng.js';

function draw(rng, n) {
  return Array.from({ length: n }, () => rng.next());
}

test('rng : même graine, même suite ; graines différentes, suites différentes', () => {
  assert.deepEqual(draw(createRng(42), 50), draw(createRng(42), 50));
  assert.deepEqual(draw(createRng('défi-2026-10-04'), 20), draw(createRng('défi-2026-10-04'), 20));
  assert.notDeepEqual(draw(createRng(42), 20), draw(createRng(43), 20));
  assert.notDeepEqual(draw(createRng('a'), 20), draw(createRng('b'), 20));
});

test('rng : aucun état global, deux générateurs entrelacés restent indépendants', () => {
  const a = createRng(7);
  const b = createRng(7);
  const c = createRng(99);
  const seq = [];
  for (let i = 0; i < 30; i++) { seq.push(a.next()); c.next(); c.next(); }
  assert.deepEqual(seq, draw(b, 30));
});

test('rng : next dans [0, 1), int dans les bornes incluses', () => {
  const rng = createRng(3);
  const seen = new Set();
  for (let i = 0; i < 2000; i++) {
    const f = rng.next();
    assert.ok(f >= 0 && f < 1);
    const n = rng.int(2, 5);
    assert.ok(Number.isInteger(n) && n >= 2 && n <= 5);
    seen.add(n);
  }
  assert.deepEqual([...seen].sort(), [2, 3, 4, 5]);
  assert.equal(createRng(1).int(4, 4), 4);
  const r = createRng(1).range(10, 20);
  assert.ok(r >= 10 && r < 20);
});

test('rng : pick, shuffle et chance', () => {
  const rng = createRng(11);
  const items = ['a', 'b', 'c', 'd'];
  for (let i = 0; i < 100; i++) assert.ok(items.includes(rng.pick(items)));
  assert.equal(rng.pick([]), undefined);
  const original = [1, 2, 3, 4, 5, 6, 7, 8];
  const shuffled = rng.shuffle(original);
  assert.deepEqual(original, [1, 2, 3, 4, 5, 6, 7, 8], 'le tableau d’origine n’est pas modifié');
  assert.deepEqual([...shuffled].sort((p, q) => p - q), original);
  assert.notDeepEqual(shuffled, original);
  assert.equal(rng.chance(0), false);
  assert.equal(rng.chance(1), true);
});

test('rng : fork déterministe et indépendant des tirages du parent', () => {
  const a = createRng(5);
  const b = createRng(5);
  draw(a, 17); // le parent a tiré, pas b
  assert.deepEqual(draw(a.fork('river'), 10), draw(b.fork('river'), 10));
  assert.notDeepEqual(draw(createRng(5).fork('river'), 10), draw(createRng(5).fork('forest'), 10));
  assert.notDeepEqual(draw(createRng(5).fork('river'), 10), draw(createRng(5), 10));
  // Les forks imbriqués dépendent du chemin complet.
  assert.notDeepEqual(draw(createRng(5).fork('a').fork('b'), 10), draw(createRng(5).fork('b').fork('a'), 10));
});

test('rng : hashSeed stable, 32 bits non signé, jamais 0', () => {
  assert.equal(hashSeed(1), hashSeed(1));
  assert.notEqual(hashSeed(1), hashSeed(2));
  assert.notEqual(hashSeed(1, 'x'), hashSeed(1, 'y'));
  const h = hashSeed('texte');
  assert.ok(Number.isInteger(h) && h > 0 && h <= 0xffffffff);
});
