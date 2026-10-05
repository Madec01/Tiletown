// Niveaux de la carrière (src/data/levels.js, docs/ARCHITECTURE.md §11.1) : contrat des données,
// vallées jouables (graines vérifiées une à une) et objectifs atteignables par une conduite raisonnable.
import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, LEVEL_IDS, LEVEL_BY_ID, MAX_STARS, levelById, nextLevelId, tilesBefore, DEFAULT_YEARS } from '../src/data/levels.js';
import { generateWorld, validateWorld, surveyWorld, centerOf } from '../src/core/worldgen.js';
import { createGame } from '../src/core/game.js';
import { evaluateGoals, evaluateStars, measureOf } from '../src/core/career.js';
import { TUTORIALS } from '../src/data/tutorials.js';
import { TILES, TILE_BY_ID } from '../src/data/tiles.js';
import { tileAt } from '../src/core/grid.js';
import { careerRun } from '../tools/simulate.js';

/** Les mesures que `evaluateGoals` sait lire (src/core/career.js). */
const KINDS = ['population', 'jobs', 'happiness', 'nature', 'air', 'water', 'soil', 'money', 'species', 'buildings', 'blocks', 'bridges', 'prosperity', 'score'];

/** Le monde d'un niveau, tel que la carrière le crée (vallée vierge). */
function worldOf(level) {
  return generateWorld({ seed: level.seed, cols: level.cols, rows: level.rows, map: level.map, starterTown: false });
}

test('levels : la liste est ordonnée, complète et bien formée', () => {
  assert.ok(LEVELS.length >= 5, 'au moins cinq niveaux');
  assert.deepEqual(LEVEL_IDS, ['vallee-1', 'riviere', 'bocage', 'coteau', 'grande-vallee']);
  assert.equal(new Set(LEVEL_IDS).size, LEVELS.length, 'identifiants uniques');
  assert.equal(MAX_STARS, LEVELS.length * 3);
  for (const level of LEVELS) {
    assert.equal(LEVEL_BY_ID[level.id], level);
    assert.equal(levelById(level.id), level);
    for (const key of ['title', 'subtitle', 'brief']) {
      assert.equal(typeof level[key], 'string', `${level.id} : ${key}`);
      assert.ok(level[key].length >= 4 && level[key].length <= 140, `${level.id} : ${key} de longueur raisonnable`);
    }
    assert.equal(level.map, 'valley');
    assert.ok(Number.isInteger(level.seed) || typeof level.seed === 'string');
    assert.ok(Number.isInteger(level.cols) && level.cols >= 12, `${level.id} : colonnes`);
    assert.ok(Number.isInteger(level.rows) && level.rows >= 16, `${level.id} : lignes`);
    assert.equal(level.years, DEFAULT_YEARS, 'trois ans par défaut');
    assert.ok(level.money >= 500 && level.money <= 1000, `${level.id} : argent de départ`);
    assert.equal(level.starterTown, false, 'la carrière commence sur une vallée vierge');
    assert.ok(level.tutorial === null || TUTORIALS[level.tutorial], `${level.id} : scénario de tutoriel connu`);
  }
  assert.equal(LEVELS[0].tutorial, 'base', 'le premier niveau porte le tutoriel');
  assert.equal(nextLevelId('vallee-1'), 'riviere');
  assert.equal(nextLevelId('grande-vallee'), null);
  assert.equal(nextLevelId('inconnu'), null);
});

test('levels : le catalogue se débloque niveau après niveau, sans trou ni doublon', () => {
  const seen = [];
  for (const level of LEVELS) {
    assert.ok(Array.isArray(level.unlock) && level.unlock.length > 0, `${level.id} : ouvre au moins une tuile`);
    for (const id of level.unlock) {
      const def = TILE_BY_ID[id];
      assert.ok(def, `${level.id} : tuile inconnue ${id}`);
      assert.notEqual(def.buyable, false, `${level.id} : ${id} n’est pas achetable`);
      assert.ok(!seen.includes(id), `${id} débloqué deux fois (${level.id})`);
      seen.push(id);
    }
  }
  const buyable = TILES.filter((t) => t.buyable !== false).map((t) => t.id).sort();
  assert.deepEqual(seen.slice().sort(), buyable, 'toute la boutique finit par être ouverte');
  assert.deepEqual(tilesBefore('vallee-1'), []);
  assert.deepEqual(tilesBefore('riviere'), Array.from(LEVELS[0].unlock));
  const avant = tilesBefore('grande-vallee');
  assert.equal(avant.length, buyable.length - LEVELS[4].unlock.length);
  // De quoi jouer dès le premier niveau : loger, employer, nourrir, éclairer, abreuver, planter.
  for (const id of ['house', 'shop', 'field', 'park', 'school', 'wind-turbine', 'water-tower']) {
    assert.ok(LEVELS[0].unlock.includes(id), `le tutoriel a besoin de ${id}`);
  }
});

test('levels : objectifs et étoiles bien formés (trois étoiles, la première sur les objectifs)', () => {
  for (const level of LEVELS) {
    assert.ok(level.goals.length >= 2 && level.goals.length <= 3, `${level.id} : deux ou trois objectifs`);
    const ids = level.goals.map((g) => g.id);
    assert.equal(new Set(ids).size, ids.length, `${level.id} : objectifs uniques`);
    for (const goal of level.goals) {
      assert.ok(KINDS.includes(goal.kind), `${level.id}/${goal.id} : mesure inconnue ${goal.kind}`);
      assert.ok(typeof goal.label === 'string' && goal.label.length > 2);
      assert.ok(Number.isFinite(goal.target) && goal.target > 0, `${level.id}/${goal.id} : cible`);
      if (goal.tile) assert.ok(TILE_BY_ID[goal.tile], `${level.id}/${goal.id} : tuile inconnue`);
    }
    assert.ok(level.goals.some((g) => g.kind === 'population'), `${level.id} : un objectif de population (référence de la prospérité)`);
    assert.equal(level.stars.length, 3, `${level.id} : trois étoiles`);
    assert.equal(level.stars[0].test, 'goals', `${level.id} : la première étoile, ce sont les objectifs`);
    for (const star of level.stars.slice(1)) {
      assert.ok(KINDS.includes(star.kind), `${level.id} : mesure d’étoile inconnue ${star.kind}`);
      assert.ok(typeof star.label === 'string' && star.label.length > 2);
      if (star.kind !== 'species' || !star.species) assert.ok(Number.isFinite(star.target) && star.target > 0);
    }
  }
  // Difficulté croissante : la population demandée ne redescend jamais d'un niveau à l'autre.
  const popOf = (l) => l.goals.find((g) => g.kind === 'population').target;
  for (let i = 1; i < LEVELS.length; i++) {
    assert.ok(popOf(LEVELS[i]) >= popOf(LEVELS[i - 1]) - 10, `${LEVELS[i].id} : la barre ne retombe pas`);
  }
});

test('levels : chaque graine donne une vallée vierge et jouable', () => {
  for (const level of LEVELS) {
    const world = worldOf(level);
    const v = validateWorld(world);
    assert.ok(v.ok, `${level.id} : ${v.problems.join(' ; ')}`);
    const s = surveyWorld(world);
    const c = centerOf(world);
    assert.equal(s.buildings, 1, `${level.id} : la mairie et rien d’autre`);
    assert.deepEqual(s.hall, { x: c.x, y: c.y }, `${level.id} : mairie au centre`);
    assert.equal(tileAt(world, c.x, c.y).building.type, 'townhall');
    assert.ok(s.freeAroundHall >= 3, `${level.id} : ${s.freeAroundHall} cases libres autour de la mairie`);
    assert.ok(s.openNear >= 30, `${level.id} : seulement ${s.openNear} cases à bâtir à trois cases de la mairie`);
    assert.ok(s.buildableShare >= 0.6, `${level.id} : ${Math.round(s.buildableShare * 100)} % de terrain constructible`);
    assert.ok(s.riverDistance >= 2, `${level.id} : la rivière colle à la mairie (${s.riverDistance})`);
    assert.ok(s.crossings >= 3, `${level.id} : rivière difficile à franchir (${s.crossings} gués)`);
    assert.ok(s.forestPatches[0] >= 6, `${level.id} : pas de massif de forêt pour le cerf`);
    assert.ok((s.terrains.meadow || 0) >= 6, `${level.id} : pas de prairie`);
    assert.ok((s.terrains.lake || 0) + (s.terrains.wetland || 0) >= 4, `${level.id} : ni lac ni zone humide`);
  }
});

test('levels : les graines ne bougent pas sans qu’on le sache', () => {
  // Changer une graine change le niveau : ce relevé le rappelle (et sert de repère de non-régression).
  const relevé = LEVELS.map((l) => {
    const s = surveyWorld(worldOf(l));
    return `${l.id}:${l.seed}:${l.cols}x${l.rows}:${s.forestPatches[0]}:${s.crossings}:${s.riverDistance}`;
  });
  assert.deepEqual(relevé, [
    'vallee-1:26:12x16:11:6:4',
    'riviere:110:12x16:9:9:2',
    'bocage:167:12x16:9:5:3',
    'coteau:182:12x16:12:5:3',
    'grande-vallee:48:16x24:12:10:4',
  ]);
});

test('levels : createGame({ level }) part du niveau (argent, taille, graine, catalogue, vallée vierge)', () => {
  for (const level of LEVELS) {
    const game = createGame({ level });
    assert.equal(game.levelId, level.id);
    assert.equal(game.seed, level.seed);
    assert.equal(game.money, level.money);
    assert.equal(game.world.cols, level.cols);
    assert.equal(game.world.rows, level.rows);
    assert.deepEqual(game.unlocked, Array.from(level.unlock));
    assert.equal(game.stats.population, 0, 'personne au départ');
    assert.equal(game.stats.buildings, 1, 'la seule mairie');
    assert.deepEqual(game.flags, { exodusMonths: 0 });
    // Le catalogue du niveau est posable quelque part dans sa vallée (sinon le niveau est injouable).
    assert.ok(game.stats.streets >= 4, 'la mairie a sa rue de ceinture');
  }
  // Une option explicite l'emporte sur le niveau (catalogue cumulé de la carrière).
  const forcé = createGame({ level: LEVELS[0], unlocked: ['house'], money: 123 });
  assert.deepEqual(forcé.unlocked, ['house']);
  assert.equal(forcé.money, 123);
  // Sans niveau, rien ne change pour le bac à sable : ville de départ et catalogue habituel.
  const bac = createGame({ seed: 1 });
  assert.equal(bac.levelId, null);
  assert.ok(bac.stats.population > 0, 'le bac à sable garde sa ville de départ');
});

test('levels : au départ, aucun objectif n’est atteint par hasard (sauf la nature intacte)', () => {
  for (const level of LEVELS) {
    const game = createGame({ level });
    const goals = evaluateGoals(game, level);
    assert.equal(goals.length, level.goals.length);
    for (const g of goals) {
      assert.equal(typeof g.text, 'string');
      if (g.kind === 'population' || g.kind === 'blocks' || g.kind === 'bridges' || g.kind === 'buildings') {
        assert.equal(g.done, false, `${level.id}/${g.id} : déjà atteint au premier jour`);
      }
    }
    const stars = evaluateStars(game, level);
    assert.equal(stars.details.length, 3);
    assert.equal(stars.details[0].done, false, `${level.id} : les objectifs ne sont pas déjà remplis`);
    assert.ok(stars.count <= 2);
    for (const kind of KINDS) assert.notEqual(measureOf(game, { kind }, level), null, `mesure ${kind} lisible`);
  }
});

test('levels : une conduite raisonnable atteint les objectifs de chaque niveau en trois ans', { timeout: 120000 }, () => {
  for (const level of LEVELS) {
    const run = careerRun({ levelId: level.id, dt: 30 });
    const goals = run.result.goals;
    for (const g of goals) {
      assert.ok(g.done, `${level.id} : objectif « ${g.label} » hors de portée (${g.text})`);
      assert.ok(run.goalMonths[g.id] <= level.years * 12, `${level.id} : « ${g.label} » atteint trop tard`);
    }
    assert.ok(run.result.stars >= 1, `${level.id} : au moins une étoile`);
    assert.ok(run.result.stars <= 2, `${level.id} : les trois étoiles ne doivent pas tomber sans effort`);
    assert.equal(run.game.flags.exodusMonths, 0, `${level.id} : une conduite raisonnable ne provoque pas d’exode`);
    assert.ok(run.game.money > -200, `${level.id} : pas de faillite`);
  }
});

test('levels : les objectifs du niveau 1 tombent bien avant la fin, et le tutoriel suit', { timeout: 60000 }, () => {
  const run = careerRun({ levelId: 'vallee-1', dt: 30 });
  for (const g of run.result.goals) {
    assert.ok(g.done, `objectif manqué : ${g.label}`);
    assert.ok(run.goalMonths[g.id] <= 30, `« ${g.label} » n’arrive qu’au mois ${run.goalMonths[g.id]} (attendu : avant le mois 30)`);
  }
  assert.equal(Object.keys(run.lessonMonths).length, 10, 'les dix leçons sont satisfaites en cours de route');
  assert.equal(run.result.stars, 2, 'deux étoiles : la troisième demande mieux');
  assert.ok(run.result.score >= 50, `score de fin modeste : ${run.result.score}`);
});
