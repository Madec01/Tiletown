// Tutoriel (src/core/tutorial.js, src/data/tutorials.js ; docs/ARCHITECTURE.md §11.2) : contrat des
// leçons, moteur sans mémoire cachée, et enchaînement des dix leçons sur une partie simulée.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TUTORIALS, HIGHLIGHT_KINDS, getScenario, lessonsOf, lessonById, nextLesson, lessonDone, lessonHighlight,
  markSeen, hasSeen, tutorialProgress, tutorialState,
} from '../src/core/tutorial.js';
import { startLevel, evaluateGoals, levelById } from '../src/core/career.js';
import { advance, place, canPlace } from '../src/core/game.js';
import { centerOf } from '../src/core/worldgen.js';
import { MONTH_SECONDS } from '../src/data/balance.js';
import { careerStep } from '../tools/simulate.js';

const BASE_IDS = ['pose', 'roads', 'time', 'gauges', 'jobs', 'school', 'layer-air', 'park', 'species', 'goal'];
/** Marques de tutoiement : l'interface vouvoie le joueur d'un bout à l'autre. */
const TUTOIEMENT = /\b(tu|ton|ta|tes|toi|tiens|regarde|touche|pose)\b/i;

test('tutorial : le scénario « base » tient le contrat (dix leçons, textes courts, vouvoiement)', () => {
  const scenario = getScenario('base');
  assert.ok(scenario);
  assert.equal(scenario.id, 'base');
  assert.equal(scenario.levelId, 'vallee-1');
  assert.deepEqual(lessonsOf('base').map((l) => l.id), BASE_IDS);
  assert.equal(lessonsOf('base').length, 10);
  assert.equal(getScenario(null), null);
  assert.equal(getScenario('inexistant'), null);
  assert.deepEqual(lessonsOf('inexistant'), []);
  assert.equal(lessonById('base', 'park').title, 'Un parc pour respirer');
  assert.equal(lessonById('base', 'rien'), null);
  assert.equal(getScenario(scenario), scenario, 'un scénario déjà résolu passe tel quel');

  for (const lesson of lessonsOf('base')) {
    assert.equal(typeof lesson.title, 'string');
    assert.ok(lesson.title.length >= 4 && lesson.title.length <= 40, `${lesson.id} : titre court`);
    assert.equal(typeof lesson.text, 'string');
    assert.ok(lesson.text.length >= 20 && lesson.text.length <= 180, `${lesson.id} : ${lesson.text.length} caractères`);
    assert.ok(lesson.text.split(/[.!?]\s/).length <= 2, `${lesson.id} : une à deux phrases`);
    assert.equal(TUTOIEMENT.test(lesson.text), false, `${lesson.id} : le jeu vouvoie (« ${lesson.text} »)`);
    assert.equal(typeof lesson.done, 'function');
    assert.ok(lesson.reward && typeof lesson.reward.text === 'string', `${lesson.id} : un mot de récompense`);
    assert.equal(lesson.reward.money, 0, 'aucune leçon ne donne d’argent');
    assert.equal(TUTOIEMENT.test(lesson.reward.text), false, `${lesson.id} : récompense au vouvoiement`);
    const marque = lesson.highlight;
    if (marque) {
      assert.ok(HIGHLIGHT_KINDS.includes(marque.kind), `${lesson.id} : surbrillance ${marque.kind}`);
      if (marque.kind === 'tab') assert.ok(['habitat', 'activity', 'services', 'infrastructure', 'nature', 'demolish', 'layers'].includes(marque.id));
      if (marque.kind === 'gauge') assert.ok(['population', 'happiness', 'nature', 'money'].includes(marque.id));
    } else {
      assert.equal(typeof lesson.focus, 'function', `${lesson.id} : surbrillance ou focus`);
    }
  }
  // Toutes les familles de l'interface que le tutoriel fait découvrir.
  const onglets = lessonsOf('base').map((l) => l.highlight && l.highlight.kind === 'tab' && l.highlight.id).filter(Boolean);
  assert.deepEqual(onglets, ['habitat', 'activity', 'services', 'layers', 'nature']);
  assert.deepEqual(Object.keys(TUTORIALS), ['base']);
});

test('tutorial : le moteur est pur (leçon courante, leçons vues, surbrillance)', () => {
  const { game } = startLevel(null, 'vallee-1');
  const seen = [];
  assert.equal(nextLesson('base', game, seen).id, 'pose');
  const after = markSeen(seen, 'pose');
  assert.deepEqual(seen, [], 'markSeen ne touche pas la liste d’origine');
  assert.deepEqual(after, ['pose']);
  assert.deepEqual(markSeen(after, 'pose'), ['pose'], 'pas de doublon');
  assert.equal(hasSeen(after, 'pose'), true);
  assert.equal(hasSeen(after, 'roads'), false);
  assert.equal(hasSeen(null, 'pose'), false);
  assert.equal(nextLesson('base', game, after).id, 'roads');
  assert.equal(nextLesson('base', game, BASE_IDS), null, 'tout vu : plus de bulle');
  assert.equal(nextLesson('inexistant', game, []), null);

  assert.deepEqual(tutorialProgress('base', []), { done: 0, total: 10 });
  assert.deepEqual(tutorialProgress('base', ['pose', 'roads']), { done: 2, total: 10 });
  assert.deepEqual(tutorialProgress('base', BASE_IDS), { done: 10, total: 10 });

  // Surbrillance : `focus` l'emporte quand il trouve quelque chose, sinon `highlight`.
  const roads = lessonById('base', 'roads');
  assert.equal(lessonHighlight(roads, game), null, 'aucun quartier posé : rien à montrer');
  const c = centerOf(game.world);
  const posé = place(game, c.x + 1, c.y, 'house', 0).game;
  assert.deepEqual(lessonHighlight(roads, posé), { kind: 'tile', x: c.x + 1, y: c.y });
  assert.deepEqual(lessonHighlight(lessonById('base', 'pose'), posé), { kind: 'tab', id: 'habitat' });
  assert.equal(lessonHighlight(null, game), null);

  // Une leçon abîmée ne doit jamais casser la partie ni bloquer le tutoriel.
  const cassée = { id: 'x', title: 'x', text: 'x', done: () => { throw new Error('boum'); }, focus: () => { throw new Error('boum'); } };
  assert.equal(lessonDone(cassée, game), false);
  assert.equal(lessonHighlight(cassée, game), null);
  assert.equal(lessonDone({ id: 'y' }, game), true, 'une leçon sans condition est faite');
  assert.equal(lessonDone(null, game), true);
});

test('tutorial : tutorialState donne tout ce que la bulle affiche', () => {
  const { game } = startLevel(null, 'vallee-1');
  const st = tutorialState('base', game, []);
  assert.equal(st.lesson.id, 'pose');
  assert.equal(st.index, 0);
  assert.equal(st.total, 10);
  assert.equal(st.done, false);
  assert.deepEqual(st.highlight, { kind: 'tab', id: 'habitat' });
  assert.equal(st.tile, 'house');
  assert.equal(st.title, st.lesson.title);
  assert.equal(st.text, st.lesson.text);
  assert.equal(st.reward.money, 0);
  assert.equal(tutorialState('base', game, BASE_IDS), null);
  const second = tutorialState('base', game, ['pose']);
  assert.equal(second.index, 1);
  assert.equal(second.tile, null);
});

test('tutorial : le calque Air et l’objectif du niveau se lisent dans le contexte', () => {
  const { game, level } = startLevel(null, 'vallee-1');
  const air = lessonById('base', 'layer-air');
  assert.equal(lessonDone(air, game), false);
  assert.equal(lessonDone(air, game, { layer: 'water' }), false);
  assert.equal(lessonDone(air, game, { layer: 'air' }), true);

  const goal = lessonById('base', 'goal');
  assert.equal(lessonDone(goal, game), false, 'les objectifs du niveau ne sont pas atteints au premier jour');
  const gagné = { ...game, stats: { ...game.stats, population: 150, nature: 85 } };
  assert.equal(lessonDone(goal, gagné), true, 'le niveau de la partie suffit à juger (game.levelId)');
  assert.equal(lessonDone(goal, gagné, { level }), true);
  assert.equal(lessonDone(goal, gagné, { goals: evaluateGoals(game, level) }), false, 'l’interface peut imposer son relevé');
  // Hors carrière (bac à sable), la dernière leçon ne bloque pas : elle reste simplement à faire.
  assert.equal(lessonDone(goal, { ...gagné, levelId: null }, {}), false);
  assert.equal(levelById(gagné.levelId).tutorial, 'base');
});

test('tutorial : les dix leçons s’enchaînent sur une partie jouée, sans blocage ni répétition', { timeout: 60000 }, () => {
  const { game: départ, level } = startLevel(null, 'vallee-1');
  let game = départ;
  let seen = [];
  const ordre = [];
  const mois = {};
  const months = level.years * 12;

  for (let m = 0; m <= months; m++) {
    // Le joueur ouvre le calque Air dès qu'il a vu passer deux mois (la seule action que le cœur ne voit pas).
    const ctx = { layer: game.month >= 2 ? 'air' : null, level };
    for (;;) {
      const lesson = nextLesson('base', game, seen, ctx);
      if (!lesson) break;
      assert.ok(!ordre.includes(lesson.id), `leçon répétée : ${lesson.id}`);
      const state = tutorialState('base', game, seen, ctx);
      assert.equal(state.lesson.id, lesson.id);
      assert.equal(state.done, lessonDone(lesson, game, ctx));
      if (!state.done) break;
      ordre.push(lesson.id);
      mois[lesson.id] = game.month;
      seen = markSeen(seen, lesson.id);
    }
    if (m === months) break;
    game = advance(game, MONTH_SECONDS).game;
    for (let guard = 0; guard < 8; guard++) {
      const next = careerStep(game, level);
      if (!next) break;
      game = next;
    }
  }

  assert.deepEqual(ordre, BASE_IDS, 'les dix leçons, dans l’ordre, chacune une seule fois');
  assert.equal(seen.length, 10);
  assert.equal(nextLesson('base', game, seen, { level }), null, 'le tutoriel se range une fois fini');
  assert.deepEqual(tutorialProgress('base', seen), { done: 10, total: 10 });
  // Aucune leçon n'attend une éternité : la plus lente est celle de l'objectif du niveau.
  for (const id of BASE_IDS) assert.ok(mois[id] <= months, `${id} : jamais satisfaite`);
  assert.ok(mois.pose <= 2, `la première leçon tombe tout de suite (mois ${mois.pose})`);
  assert.ok(mois.roads <= mois.time && mois.time <= mois.gauges, 'l’ordre des premières leçons suit le jeu');
  assert.ok(mois.species <= 24, `une espèce arrive avant la fin de la deuxième année (mois ${mois.species})`);
  assert.equal(mois.goal, Math.max(...Object.values(mois)), 'la dernière leçon est l’objectif du niveau');
});

test('tutorial : une leçon déjà satisfaite ne bloque pas celles qui suivent', () => {
  // Le joueur a posé un parc avant l'heure : la leçon du parc se montre et se range aussitôt.
  const { game } = startLevel(null, 'vallee-1');
  const c = centerOf(game.world);
  let g = game;
  for (const [tile, dx, dy] of [['house', 1, 0], ['park', 1, 1], ['shop', -1, 0], ['school', 0, 1]]) {
    if (!canPlace(g, c.x + dx, c.y + dy, tile).ok) continue;
    const r = place(g, c.x + dx, c.y + dy, tile, 0);
    if (r.ok) g = r.game;
  }
  let seen = [];
  const faites = [];
  for (let i = 0; i < 10; i++) {
    const lesson = nextLesson('base', g, seen, { layer: 'air' });
    if (!lesson) break;
    if (!lessonDone(lesson, g, { layer: 'air' })) break;
    faites.push(lesson.id);
    seen = markSeen(seen, lesson.id);
  }
  assert.deepEqual(faites, ['pose', 'roads'], 'on ne saute pas les leçons : « lancer le temps » attend encore');
  assert.equal(nextLesson('base', g, seen).id, 'time');
});
