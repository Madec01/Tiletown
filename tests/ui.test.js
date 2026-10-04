// Fonctions pures de l'interface (src/ui, src/main.js) : testables sous Node sans DOM.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wheelFactor } from '../src/ui/gestures.js';
import { formatStats, statsWanted } from '../src/ui/stats.js';
import { seasonOf, speedText, nextSpeed, cardsFor, FAMILIES, TOOLS } from '../src/ui/hud.js';
import { durationOf, MAX_VISIBLE } from '../src/ui/toasts.js';
import { normalizeTextScale, DEFAULT_SETTINGS } from '../src/ui/a11y.js';
import { seedFromSearch, describeTile, initialGauges } from '../src/main.js';
import { generateWorld } from '../src/core/worldgen.js';
import { TILES } from '../src/data/tiles.js';

test('molette : vers le haut = rapprocher (facteur > 1), symétrique, lignes et pages converties', () => {
  assert.ok(wheelFactor(-100) > 1);
  assert.ok(wheelFactor(100) < 1);
  assert.ok(Math.abs(wheelFactor(-100) * wheelFactor(100) - 1) < 1e-9);
  assert.ok(wheelFactor(-3, 1) > wheelFactor(-3, 0), 'mode lignes : plus fort que des pixels');
  assert.ok(wheelFactor(-1, 2) > wheelFactor(-3, 1), 'mode pages : plus fort encore');
});

test('mesures : texte compact, activation par ?stats=1 / 0 / développement', () => {
  assert.equal(formatStats({ calls: 42, triangles: 123456, frameMs: 8.26, fps: 59.6 }), '42 appels · 123 k tri\n8.3 ms · 60 i/s');
  assert.equal(formatStats({ calls: 3, triangles: 980, frameMs: 1, fps: 30 }), '3 appels · 980 tri\n1.0 ms · 30 i/s');
  assert.equal(statsWanted('?stats=1', false), true);
  assert.equal(statsWanted('?stats=0', true), false);
  assert.equal(statsWanted('', true), true);
  assert.equal(statsWanted('?seed=4', false), false);
});

test('barre du haut : saisons, vitesses, onglets', () => {
  assert.equal(seasonOf(2), 'Printemps');
  assert.equal(seasonOf(7), 'Été');
  assert.equal(seasonOf(10), 'Automne');
  assert.equal(seasonOf(0), 'Hiver');
  assert.equal(seasonOf(11), 'Hiver');
  assert.equal(speedText(0.5), '×½');
  assert.equal(speedText(2), '×2');
  assert.equal(speedText(0), 'Pause');
  assert.deepEqual([0, 1, 2, 4].map(nextSpeed), [1, 2, 4, 0]);
  assert.equal(FAMILIES.length + TOOLS.length, 7, 'sept onglets : cinq familles, Démolir, Calques');
  assert.deepEqual(FAMILIES.map((f) => f.id), ['habitat', 'activity', 'services', 'infrastructure', 'nature']);
});

test('catalogue : les cartes viennent de src/data/tiles.js quand il est fourni, démo sinon', () => {
  const real = cardsFor('habitat', TILES);
  assert.ok(real.length >= 1);
  assert.ok(TILES.filter((t) => t.family === 'habitat').every((t) => real.some(([title]) => title === t.label)));
  assert.ok(cardsFor('nature', null).length >= 1, 'démo sans catalogue');
  assert.deepEqual(cardsFor('demolish', TILES), []);
  assert.ok(cardsFor('layers', TILES).length === 3, 'calques : air, eau, faune');
});

test('messages : durées (≥ 5 s pour une erreur ou une action, 7 s au plus), deux visibles au plus', () => {
  assert.equal(MAX_VISIBLE, 2);
  assert.equal(durationOf({ text: 'x' }), 3000);
  assert.equal(durationOf({ text: 'x', kind: 'error' }), 5000);
  assert.equal(durationOf({ text: 'x', onClick: () => {} }), 5000);
  assert.equal(durationOf({ text: 'x', duration: 20000 }), 7000);
  assert.equal(durationOf({ text: 'x', duration: 1500 }), 1500);
});

test('accessibilité : facteurs de texte valides', () => {
  assert.equal(normalizeTextScale(1.2), 1.15);
  assert.equal(normalizeTextScale(1.4), 1.3);
  assert.equal(normalizeTextScale(9), 1.5);
  assert.equal(normalizeTextScale('abc'), 1);
  assert.equal(DEFAULT_SETTINGS.pinchZoom, false, 'zoom de page bloqué par défaut (les gestes vont à la carte)');
});

test('main : graine depuis l’adresse, description d’une case, jauges de départ', () => {
  assert.equal(seedFromSearch(''), 12345);
  assert.equal(seedFromSearch('?seed=7'), 7);
  assert.equal(seedFromSearch('?seed=vallee'), seedFromSearch('?seed=vallee'));
  assert.notEqual(seedFromSearch('?seed=vallee'), seedFromSearch('?seed=colline'));
  const world = generateWorld({ seed: 3, cols: 12, rows: 16, map: 'valley', starterTown: true });
  const d = describeTile(world, 0, 0);
  assert.ok(d && /^Case 0,0 : /.test(d.text));
  const hall = world.tiles.findIndex((t) => t.building && t.building.type === 'townhall');
  if (hall >= 0) {
    const x = hall % world.cols;
    const y = Math.floor(hall / world.cols);
    assert.ok(describeTile(world, x, y).building, 'la mairie est nommée');
  }
  const g = initialGauges(world);
  assert.ok(g.population >= 0 && g.money > 0 && g.nature >= 0 && g.nature <= 100 && g.happiness > 0);
  assert.equal(describeTile(world, 99, 99), null);
});
