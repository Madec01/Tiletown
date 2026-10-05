import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calendar, isSeasonEnd, isYearEnd, seasonOf, yearOf, dateLabel, SEASON_LABELS, MONTH_LABELS,
} from '../src/core/calendar.js';

test('calendar : le mois 0 est mars de l’an 1, au printemps', () => {
  assert.deepEqual(calendar({ month: 0 }), {
    month: 0, season: 0, seasonLabel: 'Printemps', year: 1, monthLabel: 'mars', monthInSeason: 0, monthOfYear: 0,
  });
  assert.equal(dateLabel({ month: 0 }), 'mars, an 1');
  assert.deepEqual(SEASON_LABELS, ['Printemps', 'Été', 'Automne', 'Hiver']);
  assert.equal(MONTH_LABELS.length, 12);
  assert.equal(MONTH_LABELS[0], 'mars');
  assert.equal(MONTH_LABELS[11], 'février');
});

test('calendar : saisons de trois mois, années de douze, libellés des mois', () => {
  const expected = [
    [0, 'mars', 0], [1, 'avril', 0], [2, 'mai', 0], [3, 'juin', 1], [4, 'juillet', 1], [5, 'août', 1],
    [6, 'septembre', 2], [7, 'octobre', 2], [8, 'novembre', 2], [9, 'décembre', 3], [10, 'janvier', 3], [11, 'février', 3],
  ];
  for (const [month, label, season] of expected) {
    const c = calendar({ month });
    assert.equal(c.monthLabel, label, `mois ${month}`);
    assert.equal(c.season, season, `mois ${month}`);
    assert.equal(c.seasonLabel, SEASON_LABELS[season]);
    assert.equal(c.year, 1);
    assert.equal(c.monthInSeason, month % 3);
    assert.equal(c.monthOfYear, month);
  }
  // Deuxième année : mêmes mois, mêmes saisons, année 2.
  for (let month = 12; month < 24; month++) {
    const c = calendar({ month });
    assert.equal(c.year, 2);
    assert.equal(c.monthLabel, MONTH_LABELS[month - 12]);
    assert.equal(c.season, Math.floor((month - 12) / 3));
    assert.equal(seasonOf(month), c.season);
    assert.equal(yearOf(month), 2);
  }
  assert.equal(calendar({ month: 35 }).year, 3);
  assert.equal(calendar({ month: 36 }).year, 4);
  assert.equal(calendar({ month: 36 }).monthLabel, 'mars');
  // Valeurs dégradées : rien de négatif, un mois entier.
  assert.equal(calendar({}).month, 0);
  assert.equal(calendar({ month: -3 }).month, 0);
  assert.equal(calendar({ month: 4.7 }).month, 4);
});

test('calendar : fins de saison (mai, août, novembre, février) et fins d’année (février)', () => {
  const seasonEnds = [];
  const yearEnds = [];
  for (let m = 0; m < 24; m++) {
    if (isSeasonEnd(m)) seasonEnds.push(m);
    if (isYearEnd(m)) yearEnds.push(m);
  }
  assert.deepEqual(seasonEnds, [2, 5, 8, 11, 14, 17, 20, 23]);
  assert.deepEqual(yearEnds, [11, 23]);
  for (const m of yearEnds) assert.ok(isSeasonEnd(m), 'une fin d’année est aussi une fin de saison');
  assert.ok(!isSeasonEnd(0) && !isSeasonEnd(1) && !isSeasonEnd(3));
});
