// Carrière (src/core/career.js, docs/ARCHITECTURE.md §11.1) : déblocage en chaîne, cumul du catalogue,
// meilleur score d'étoiles gardé, mesures des objectifs, sauvegarde.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCareer, startLevel, finishLevel, rememberLesson, careerProgress, careerLevels,
  evaluateGoals, evaluateStars, evaluateMeasure, measureOf, measureText, goalsReached,
  isLevelOver, levelProgress, levelResult, prosperityOf, scoreOf, withoutExodus,
  countBuildings, countBlocks, countBridges, populationTarget,
  serializeCareer, deserializeCareer, CAREER_VERSION, levelById, LEVEL_IDS, MAX_STARS,
} from '../src/core/career.js';
import { LEVELS } from '../src/data/levels.js';
import { advance, place, canPlace } from '../src/core/game.js';
import { centerOf } from '../src/core/worldgen.js';
import { MONTH_SECONDS } from '../src/data/balance.js';
import { EDGE } from '../src/core/roads.js';

/** Une partie du niveau donné, hors carrière. */
function gameOf(levelId = 'vallee-1') {
  return startLevel(null, levelId);
}

/** La même partie, avec des statistiques forcées (pour viser une mesure précise). */
function withStats(game, stats = {}, extra = {}) {
  return { ...game, ...extra, stats: { ...game.stats, ...stats } };
}

test('career : une carrière neuve n’ouvre que le premier niveau', () => {
  const career = createCareer();
  assert.equal(career.version, CAREER_VERSION);
  assert.equal(career.levelId, 'vallee-1');
  assert.deepEqual(career.unlocked, ['vallee-1']);
  assert.deepEqual(career.stars, {});
  assert.deepEqual(career.tiles, []);
  assert.deepEqual(career.seen, []);
  assert.deepEqual(careerProgress(career), { done: 0, total: LEVELS.length, stars: 0, maxStars: MAX_STARS });
  const map = careerLevels(career);
  assert.equal(map.length, LEVELS.length);
  assert.equal(map[0].state, 'open');
  assert.equal(map[0].current, true);
  assert.deepEqual(map.slice(1).map((l) => l.state), ['locked', 'locked', 'locked', 'locked']);
  assert.deepEqual(map[0].goals, LEVELS[0].goals.map((g) => g.label));
});

test('career : startLevel donne la vallée du niveau et le catalogue cumulé', () => {
  const career = createCareer();
  const { game, level } = startLevel(career, 'vallee-1');
  assert.equal(level.id, 'vallee-1');
  assert.equal(game.levelId, 'vallee-1');
  assert.equal(game.money, level.money);
  assert.deepEqual(game.unlocked, Array.from(level.unlock));
  assert.equal(game.stats.buildings, 1, 'vallée vierge : la seule mairie');
  assert.equal(game.month, 0);

  // Un niveau verrouillé ou inconnu se refuse clairement, sans rien casser.
  assert.throws(() => startLevel(career, 'coteau'), /verrouillé/);
  assert.throws(() => startLevel(career, 'nulle-part'), /inconnu/);

  // Hors carrière (essais, bac à sable) : seul le catalogue du niveau.
  const seul = startLevel(null, 'bocage');
  assert.deepEqual(seul.game.unlocked, Array.from(levelById('bocage').unlock));

  // Avec une carrière avancée : les tuiles d'avant s'ajoutent, sans doublon.
  const avancée = { ...career, unlocked: ['vallee-1', 'riviere'], tiles: ['house', 'shop'] };
  const suite = startLevel(avancée, 'riviere');
  assert.deepEqual(suite.game.unlocked, ['house', 'shop', ...levelById('riviere').unlock]);
  assert.equal(new Set(suite.game.unlocked).size, suite.game.unlocked.length);
});

test('career : les mesures lisent la partie (population, nature, espèces, bâtiments, ponts, prospérité)', () => {
  const { game, level } = gameOf('vallee-1');
  assert.equal(measureOf(game, { kind: 'population' }), 0);
  assert.equal(measureOf(game, { kind: 'nature' }), game.stats.nature);
  assert.equal(measureOf(game, { kind: 'money' }), level.money);
  assert.equal(measureOf(game, { kind: 'air' }), game.eco.scores.air);
  assert.equal(measureOf(game, { kind: 'inconnue' }), null, 'une mesure inconnue ne casse rien');
  assert.equal(measureOf(game, { kind: 'species' }), game.stats.species);
  assert.equal(measureOf(game, { kind: 'species', species: 'deer' }), game.eco.species.deer.present ? 1 : 0);
  assert.equal(measureOf(game, { kind: 'species', species: 'bee' }), 0);

  // Bâtiments, îlots, ponts : la mairie est un îlot bâti, le parc n'en est pas un.
  assert.equal(countBuildings(game), 1);
  assert.equal(countBlocks(game), 1);
  assert.equal(countBridges(game), 0);
  const c = centerOf(game.world);
  const posé = place(game, c.x + 1, c.y, 'house', 0);
  assert.ok(posé.ok);
  assert.equal(countBuildings(posé.game, { tile: 'house' }), 1);
  assert.equal(countBuildings(posé.game, { tile: 'house', level: 2 }), 0);
  assert.equal(countBlocks(posé.game), 2);

  // Un pont se compte sur les arêtes.
  const ponté = { ...game, world: { ...game.world, edges: { h: Uint8Array.from(game.world.edges.h), v: Uint8Array.from(game.world.edges.v) } } };
  ponté.world.edges.h[0] = EDGE.BRIDGE;
  assert.equal(countBridges(ponté), 1);

  // Prospérité et score (§7.1).
  assert.equal(populationTarget(level), 100);
  assert.equal(populationTarget({}), 100);
  const riche = withStats(game, { population: 100, jobs: 100, happiness: 60 });
  assert.equal(prosperityOf(riche, level), Math.round(0.4 * 100 + 0.3 * 100 + 0.3 * 60));
  assert.equal(scoreOf(riche, level), Math.round((riche.stats.nature * prosperityOf(riche, level)) / 100));
  assert.equal(prosperityOf(withStats(game, { population: 0, jobs: 0, happiness: 50 }), level), 15);
});

test('career : objectifs et étoiles, avec « sans exode »', () => {
  const { game, level } = gameOf('vallee-1');
  const vide = evaluateGoals(game, level);
  assert.deepEqual(vide.map((g) => g.id), ['pop', 'nature']);
  assert.equal(vide[0].done, false);
  assert.equal(vide[0].text, '0 / 100');
  assert.equal(goalsReached(game, level), false);

  const peuplé = withStats(game, { population: 120, nature: 85 });
  assert.ok(evaluateGoals(peuplé, level).every((g) => g.done));
  assert.equal(goalsReached(peuplé, level), true);

  const stars = evaluateStars(peuplé, level);
  assert.equal(stars.details.length, 3);
  assert.deepEqual(stars.details.map((d) => d.done), [true, true, false]);
  assert.equal(stars.count, 2);
  assert.equal(stars.details[0].text, '2 / 2');

  // La troisième étoile demande 160 habitants ET aucun mois d'exode.
  const grande = withStats(game, { population: 170, nature: 85 });
  assert.equal(evaluateStars(grande, level).count, 3);
  assert.equal(withoutExodus(grande), true);
  const exilée = { ...grande, flags: { exodusMonths: 2 } };
  assert.equal(withoutExodus(exilée), false);
  assert.equal(evaluateStars(exilée, level).count, 2, 'un mois d’exode coûte l’étoile');
  assert.equal(evaluateMeasure(exilée, { kind: 'population', target: 170, noExodus: true }).done, false);

  // L'étoile « espèce » se lit en oui / pas encore.
  const bocage = levelById('bocage');
  const abeilles = { ...game, eco: { ...game.eco, species: { ...game.eco.species, bee: { present: true, since: 4, cells: [], below: 0 } } } };
  const détail = evaluateStars(abeilles, bocage).details.find((d) => d.id === 'bee');
  assert.equal(détail.done, true);
  assert.equal(détail.text, 'oui');
  assert.equal(measureText({ kind: 'species', species: 'bee' }, 0, 1), 'pas encore');
  assert.equal(measureText({ kind: 'population' }, null, 10), '—');

  // Un niveau absent n'évalue rien plutôt que de lever.
  assert.deepEqual(evaluateGoals(game, null), []);
  assert.deepEqual(evaluateStars(game, null), { count: 0, details: [] });
});

test('career : le temps du niveau et le bilan de fin', () => {
  const { game, level } = gameOf('vallee-1');
  assert.equal(isLevelOver(game, level), false);
  assert.deepEqual(levelProgress(game, level), { month: 0, months: 36, year: 1, years: 3, remaining: 36, over: false });
  const fin = { ...game, month: 36 };
  assert.equal(isLevelOver(fin, level), true);
  assert.deepEqual(levelProgress(fin, level), { month: 36, months: 36, year: 3, years: 3, remaining: 0, over: true });

  const bilan = levelResult(withStats(fin, { population: 120, nature: 85, happiness: 70, jobs: 120 }), level);
  assert.equal(bilan.levelId, 'vallee-1');
  assert.equal(bilan.title, level.title);
  assert.equal(bilan.stars, 2);
  assert.equal(bilan.goals.length, 2);
  assert.equal(bilan.details.length, 3);
  assert.equal(bilan.exodus, 0);
  assert.ok(bilan.score > 0 && bilan.score <= 100);
});

test('career : finir un niveau ouvre le suivant, cumule les tuiles et garde le meilleur score', () => {
  let career = createCareer();
  career = finishLevel(career, 'vallee-1', 2);
  assert.deepEqual(career.unlocked, ['vallee-1', 'riviere']);
  assert.equal(career.levelId, 'riviere');
  assert.deepEqual(career.stars, { 'vallee-1': 2 });
  assert.deepEqual(career.tiles, Array.from(LEVELS[0].unlock));
  assert.deepEqual(careerProgress(career), { done: 1, total: 5, stars: 2, maxStars: MAX_STARS });

  // Rejouer moins bien ne retire rien ; rejouer mieux remplace.
  const moinsBien = finishLevel(career, 'vallee-1', 1);
  assert.equal(moinsBien.stars['vallee-1'], 2);
  const mieux = finishLevel(career, 'vallee-1', 3);
  assert.equal(mieux.stars['vallee-1'], 3);
  assert.equal(finishLevel(career, 'vallee-1', 99).stars['vallee-1'], 3, 'trois étoiles au plus');
  assert.equal(finishLevel(createCareer(), 'vallee-1', -5).stars['vallee-1'], 0, 'jamais moins que zéro');
  assert.throws(() => finishLevel(career, 'nulle-part', 1), /inconnu/);

  // Les tuiles débloquées pendant la partie (paliers de population) sont gardées elles aussi.
  const { game } = startLevel(career, 'riviere');
  const enrichi = { ...game, unlocked: game.unlocked.concat('factory') };
  const après = finishLevel(career, 'riviere', 1, enrichi);
  assert.ok(après.tiles.includes('factory'), 'les déblocages de la partie restent acquis');
  assert.equal(new Set(après.tiles).size, après.tiles.length);

  // Déblocage en chaîne jusqu'au bout : chaque niveau ouvre le suivant, le dernier reste le dernier.
  let chaîne = createCareer();
  for (const id of LEVEL_IDS) {
    const { game: g, level } = startLevel(chaîne, id);
    assert.equal(g.levelId, id);
    assert.deepEqual(g.unlocked.slice(0, chaîne.tiles.length), chaîne.tiles, 'le catalogue d’avant est là');
    chaîne = finishLevel(chaîne, id, 3, g);
    assert.equal(level.id, id);
  }
  assert.deepEqual(chaîne.unlocked, LEVEL_IDS);
  assert.equal(chaîne.levelId, 'grande-vallee', 'le dernier niveau terminé reste le niveau courant');
  assert.deepEqual(careerProgress(chaîne), { done: 5, total: 5, stars: MAX_STARS, maxStars: MAX_STARS });
  assert.deepEqual(careerLevels(chaîne).map((l) => l.state), ['done', 'done', 'done', 'done', 'done']);
  assert.equal(chaîne.tiles.length, new Set(chaîne.tiles).size);
  for (const level of LEVELS) for (const t of level.unlock) assert.ok(chaîne.tiles.includes(t), `${t} perdu en route`);
});

test('career : les leçons vues se retiennent, sans doublon', () => {
  let career = createCareer();
  career = rememberLesson(career, 'pose');
  career = rememberLesson(career, 'pose');
  career = rememberLesson(career, 'roads');
  assert.deepEqual(career.seen, ['pose', 'roads']);
  assert.equal(rememberLesson(career, 'pose'), career, 'rien à faire : le même objet');
  assert.deepEqual(createCareer().seen, [], 'pureté : la carrière neuve n’a pas bougé');
});

test('career : sauvegarde et relecture (aller-retour, versions, contenus douteux)', () => {
  let career = createCareer();
  career = rememberLesson(finishLevel(career, 'vallee-1', 2), 'pose');
  const saved = JSON.parse(JSON.stringify(serializeCareer(career)));
  assert.equal(saved.version, 1);
  const back = deserializeCareer(saved);
  assert.deepEqual(back, career);
  assert.deepEqual(serializeCareer(back), saved);
  // La sauvegarde ne partage rien avec la carrière.
  saved.tiles.push('factory');
  saved.stars['vallee-1'] = 0;
  assert.equal(career.tiles.includes('factory'), false);
  assert.equal(career.stars['vallee-1'], 2);

  // Contenus douteux : on répare plutôt que de casser.
  assert.deepEqual(deserializeCareer(null), createCareer());
  assert.deepEqual(deserializeCareer('nimporte quoi'), createCareer());
  assert.throws(() => deserializeCareer({ version: 7 }), /version inconnue/);
  const sale = deserializeCareer({
    version: 1,
    levelId: 'nulle-part',
    unlocked: ['vallee-1', 'riviere', 'atlantide'],
    stars: { 'vallee-1': 9, atlantide: 3, riviere: 'beaucoup' },
    tiles: ['house', 'house', 42, 'shop'],
    seen: ['pose', 'pose'],
  });
  assert.deepEqual(sale.unlocked, ['vallee-1', 'riviere']);
  assert.deepEqual(sale.stars, { 'vallee-1': 3 });
  assert.deepEqual(sale.tiles, ['house', 'shop']);
  assert.deepEqual(sale.seen, ['pose']);
  assert.equal(sale.levelId, 'riviere', 'le niveau courant retombe sur le dernier ouvert');
});

test('career : une partie jouée fait avancer les objectifs pour de bon', () => {
  const { game, level } = gameOf('vallee-1');
  const c = centerOf(game.world);
  let g = game;
  // Trois quartiers autour de la mairie, puis un an de jeu : la population monte, les objectifs suivent.
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    if (!canPlace(g, c.x + dx, c.y + dy, 'house').ok) continue;
    const r = place(g, c.x + dx, c.y + dy, 'house', 0);
    if (r.ok) g = r.game;
  }
  assert.ok(countBuildings(g, { tile: 'house' }) >= 3);
  for (let m = 0; m < 12; m++) g = advance(g, MONTH_SECONDS).game;
  const goals = evaluateGoals(g, level);
  assert.ok(goals[0].value > 0, 'des habitants sont arrivés');
  assert.ok(goals[1].done, 'la nature tient en début de partie');
  assert.equal(g.month, 12);
  assert.equal(levelProgress(g, level).year, 2);
});
