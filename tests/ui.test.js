// Fonctions pures de l'interface (src/ui, src/main.js) : testables sous Node sans DOM.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wheelFactor } from '../src/ui/gestures.js';
import { formatStats, statsWanted } from '../src/ui/stats.js';
import { seasonOf, speedText, nextSpeed, deltaText, dateParts, FAMILIES, TOOLS, DEFAULT_SPEEDS } from '../src/ui/hud.js';
import { durationOf, MAX_VISIBLE, MAX_ACTION_MS } from '../src/ui/toasts.js';
import { normalizeTextScale, DEFAULT_SETTINGS } from '../src/ui/a11y.js';
import { shouldClose } from '../src/ui/sheets.js';
import { cardsFor, priceText, demandRows, lockTextOf, isUnlocked, DEMAND_ROWS, LAYER_CARDS } from '../src/ui/catalog.js';
import { costText, costParts, reasonText, ghostStatus, DEMOLISH_COST } from '../src/ui/placement.js';
import { yieldLines, conditionsTitle } from '../src/ui/sheet-tile.js';
import { isLayerKind, layerChoice, layerInfoOf, gradientCss, boundsText, pillText, LAYER_CHOICES, LAYER_KINDS, SOIL_CHOICE } from '../src/ui/layers.js';
import { sinceLabel, speciesRows, speciesCountText, speciesCellOf, speciesLabel, speciesArt, SPECIES_FALLBACK } from '../src/ui/species-book.js';
import { scoreRows, scoreWord, natureText, SCORE_ROWS } from '../src/ui/nature-sheet.js';
import { ecoRows, ecoWord, ecoSpeciesText, ECO_FIELDS } from '../src/ui/sheet-tile.js';
import { seedFromSearch, hasSeedParam, describeTile, unlockHintFor, monthlyDelta, gaugesOf, eventPresentation, ecoAlertTitle, seeTargetOf, ECO_ALERT_TITLES } from '../src/main.js';
import { layerInfo as rendererLayerInfo } from '../src/render3d/layers.js';
import { SPECIES } from '../src/data/species.js';
import { generateWorld } from '../src/core/worldgen.js';
import { TILES, TILE_BY_ID } from '../src/data/tiles.js';
import { SPEEDS, UNLOCKS } from '../src/data/balance.js';

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

test('barre du haut : saisons, vitesses (cycle pause → ×½ → ×1 → ×2 → ×4 → pause), delta, date, onglets', () => {
  assert.equal(seasonOf(2), 'Printemps');
  assert.equal(seasonOf(7), 'Été');
  assert.equal(seasonOf(10), 'Automne');
  assert.equal(seasonOf(0), 'Hiver');
  assert.equal(seasonOf(11), 'Hiver');
  assert.equal(speedText(0.5), '×½');
  assert.equal(speedText(2), '×2');
  assert.equal(speedText(0), 'Pause');
  assert.deepEqual([...DEFAULT_SPEEDS], [...SPEEDS], 'les vitesses de l’interface sont celles de balance.js');
  assert.deepEqual([0, 0.5, 1, 2, 4].map((s) => nextSpeed(s)), [0.5, 1, 2, 4, 0]);
  assert.equal(nextSpeed(3), 1, 'vitesse inconnue → ×1');
  assert.equal(deltaText(12), '+12 $/mois');
  assert.equal(deltaText(-4), '−4 $/mois');
  assert.equal(deltaText(0), '±0 $/mois');
  assert.deepEqual(dateParts({ seasonLabel: 'Printemps', monthLabel: 'mars', year: 1 }), { season: 'Printemps', month: 'mars', year: 'an 1' });
  assert.deepEqual(dateParts({ month: 7, year: 2 }), { season: 'Été', month: 'août', year: 'an 2' }, 'repli : mois du calendrier (0 = janvier)');
  assert.equal(FAMILIES.length + TOOLS.length, 7, 'sept onglets : cinq familles, Démolir, Calques');
  assert.deepEqual(FAMILIES.map((f) => f.id), ['habitat', 'activity', 'services', 'infrastructure', 'nature']);
  const infra = FAMILIES.find((f) => f.id === 'infrastructure');
  assert.equal(infra.label, 'Infrastructures');
  assert.ok(infra.short && infra.short.length <= 8, 'libellé court pour les onglets de téléphone');
});

test('feuilles : un glissement long, ou court mais vif, ferme la feuille', () => {
  assert.equal(shouldClose(100, 0.1), true);
  assert.equal(shouldClose(40, 1), true);
  assert.equal(shouldClose(40, 0.1), false);
  assert.equal(shouldClose(10, 5), false);
});

test('catalogue : cartes depuis src/data/tiles.js, cadenas et condition, grisées si trop cher, barres de demande', () => {
  const game = { money: 70, unlocked: ['house', 'shop', 'park'], demand: { habitat: 0.5, activity: 1.4, services: -1 } };
  const habitat = cardsFor('habitat', game);
  assert.ok(habitat.length >= 1);
  assert.ok(TILES.filter((t) => t.family === 'habitat' && t.buyable !== false).every((t) => habitat.some((c) => c.id === t.id)));
  const house = habitat.find((c) => c.id === 'house');
  assert.equal(house.locked, false);
  assert.equal(house.poor, false, '70 $ suffisent pour 60 $');
  assert.equal(priceText(house), '60 $ · 5 $/mois');
  assert.equal(priceText({ price: 30, upkeep: 0 }), '30 $');
  const activity = cardsFor('activity', game, (id) => (id === 'office' ? 'Dès 80 habitants' : null));
  const shop = activity.find((c) => c.id === 'shop');
  assert.equal(shop.poor, true, '80 $ > 70 $ : grisée');
  const office = activity.find((c) => c.id === 'office');
  assert.equal(office.locked, true);
  assert.equal(office.lockText, 'Dès 80 habitants');
  const factory = activity.find((c) => c.id === 'factory');
  assert.equal(factory.locked, true);
  assert.ok(factory.lockText.length > 5, 'condition générique quand le cœur n’en donne pas');
  assert.equal(lockTextOf('x', { unlockHints: { x: 'Bientôt' } }), 'Bientôt');
  assert.equal(isUnlocked('anything', {}), true, 'sans liste unlocked : tout est ouvert');
  assert.ok(!cardsFor('services', game).some((c) => c.id === 'townhall'), 'la mairie n’est pas à vendre');
  assert.deepEqual(demandRows(game).map((r) => r.percent), [50, 100, 0], 'demande bornée à 0..100 %');
  assert.deepEqual(DEMAND_ROWS.map((r) => r.key), ['habitat', 'activity', 'services']);
  assert.equal(LAYER_CARDS.length, 3, 'calques : air, eau, faune');
  assert.deepEqual(cardsFor('demolish', game), []);
});

test('pose : résumé du coût, raisons de refus en clair, couleur du fantôme', () => {
  const house = TILE_BY_ID.house;
  assert.equal(costText(house, { ok: true, cost: 60, clearing: 0, path: [] }), 'Quartier · 60 $');
  assert.equal(costText(house, { ok: true, cost: 160, clearing: 80, path: [{ kind: 'h', x: 1, y: 1, value: 2 }, { kind: 'v', x: 1, y: 1, value: 2 }] }), 'Quartier · 60 $ + défrichement 80 $ + rue 20 $ = 160 $');
  assert.equal(costText(house, { ok: true, cost: 100, clearing: 0, path: [{ kind: 'h', x: 1, y: 1, value: 3 }] }), 'Quartier · 60 $ + rue et pont 40 $ = 100 $');
  assert.equal(costParts(house, { cost: 80, clearing: 20, path: [] }).total, 80);
  assert.equal(costParts(house, {}).total, 60, 'sans résultat : le prix');
  assert.equal(reasonText('unreachable'), 'Il faut passer par la terre ferme');
  assert.equal(reasonText('money'), 'Pas assez d’argent');
  assert.equal(reasonText('locked', { hint: 'Dès 80 habitants' }), 'Verrouillé : Dès 80 habitants');
  assert.equal(reasonText('terrain', { terrain: 'lake' }), 'Pas sur l’eau');
  assert.equal(reasonText('occupied'), 'La case est déjà occupée');
  assert.equal(reasonText('townhall'), 'La mairie ne se démolit pas');
  assert.ok(/Impossible/.test(reasonText('quelque-chose')));
  assert.equal(ghostStatus({ ok: true, clearing: 0, path: [] }), true);
  assert.equal(ghostStatus({ ok: true, clearing: 80, path: [] }), 'warn');
  assert.equal(ghostStatus({ ok: true, clearing: 0, path: [{}] }), 'warn');
  assert.equal(ghostStatus({ ok: false, reason: 'money' }), false);
  assert.equal(ghostStatus(null), false);
  assert.equal(DEMOLISH_COST, 10);
});

test('fiche d’une case : lignes des rendements et titre des conditions', () => {
  assert.deepEqual(yieldLines({ income: 40, upkeep: 5, jobs: 0, capacity: 20, residents: 6 }), ['Recettes : 40 $/saison', 'Entretien : 5 $/saison', 'Habitants : 6 / 20\u00a0places']);
  assert.deepEqual(yieldLines({ jobs: 15, energy: -1 }), ['Emplois : 15', 'Énergie : −1']);
  assert.deepEqual(yieldLines({}), []);
  assert.equal(conditionsTitle({ level: 1 }, [{ label: 'x', met: false }]), 'Prochaine évolution (niveau 2)');
  assert.equal(conditionsTitle({ level: 3 }, []), 'Au niveau maximal');
  assert.equal(conditionsTitle(null, []), '');
});

test('messages : durées (≥ 5 s pour une erreur ou une action, 7 s au plus, 12 s avec une action), deux visibles au plus', () => {
  assert.equal(MAX_VISIBLE, 2);
  assert.equal(durationOf({ text: 'x' }), 3000);
  assert.equal(durationOf({ text: 'x', kind: 'error' }), 5000);
  assert.equal(durationOf({ text: 'x', onClick: () => {} }), 5000);
  assert.equal(durationOf({ text: 'x', duration: 20000 }), 7000);
  assert.equal(durationOf({ text: 'x', duration: 1500 }), 1500);
  assert.equal(durationOf({ text: 'Annuler', duration: 10000, onClick: () => {} }), 10000, 'le message « Annuler » reste 10 s');
  assert.equal(MAX_ACTION_MS, 12000);
});

test('accessibilité : facteurs de texte valides', () => {
  assert.equal(normalizeTextScale(1.2), 1.15);
  assert.equal(normalizeTextScale(1.4), 1.3);
  assert.equal(normalizeTextScale(9), 1.5);
  assert.equal(normalizeTextScale('abc'), 1);
  assert.equal(DEFAULT_SETTINGS.pinchZoom, false, 'zoom de page bloqué par défaut (les gestes vont à la carte)');
});

test('main : graine depuis l’adresse, description d’une case, déblocages, delta mensuel, événements', () => {
  assert.equal(seedFromSearch(''), 12345);
  assert.equal(seedFromSearch('?seed=7'), 7);
  assert.equal(seedFromSearch('?seed=vallee'), seedFromSearch('?seed=vallee'));
  assert.notEqual(seedFromSearch('?seed=vallee'), seedFromSearch('?seed=colline'));
  assert.equal(hasSeedParam('?seed=7'), true);
  assert.equal(hasSeedParam('?new=1'), false);
  const world = generateWorld({ seed: 3, cols: 12, rows: 16, map: 'valley', starterTown: true });
  const d = describeTile(world, 0, 0);
  assert.ok(d && /^Case 0,0 : /.test(d.text));
  const hall = world.tiles.findIndex((t) => t.building && t.building.type === 'townhall');
  assert.ok(hall >= 0);
  assert.ok(describeTile(world, hall % world.cols, Math.floor(hall / world.cols)).building, 'la mairie est nommée');
  assert.equal(describeTile(world, 99, 99), null);
  // Déblocages (balance.js UNLOCKS) : chaque tuile d'un palier a une condition lisible.
  for (const u of UNLOCKS) for (const id of u.tiles) assert.equal(unlockHintFor(id), `Dès ${u.population} habitants`);
  assert.equal(unlockHintFor('house'), null);
  assert.equal(unlockHintFor('x', [{ year: 2, tiles: ['x'] }]), 'Dès l’an 2');
  // Delta mensuel : recettes et entretien du mois (stats du cœur).
  assert.equal(monthlyDelta({ income: 36, upkeep: 0 }), 36);
  assert.equal(monthlyDelta({ income: 0, upkeep: 12 }), -12);
  assert.equal(monthlyDelta({ monthlyNet: 7, income: 999 }), 7);
  const g = gaugesOf({ money: 500, stats: { population: 12, happiness: 72, nature: 65, income: 30, upkeep: 15 } });
  assert.deepEqual(g, { population: 12, happiness: 72, nature: 65, money: 500, delta: 15 });
  // Événements : saison et année en bandeau, évolutions et arrivées en message, mois sans rien.
  assert.equal(eventPresentation({ type: 'season', text: 'x' }, { seasonLabel: 'Été', year: 1 }).channel, 'banner');
  assert.equal(eventPresentation({ type: 'year', text: 'x' }).channel, 'banner');
  assert.equal(eventPresentation({ type: 'evolve', text: 'x' }).channel, 'toast');
  assert.equal(eventPresentation({ type: 'arrivals', text: 'x' }).kind, 'info');
  assert.equal(eventPresentation({ type: 'month' }).channel, null);
  assert.equal(eventPresentation(null).channel, null);
});

test('calques : quatre choix plus les sols, légende du rendu, dégradé CSS, pastille', () => {
  assert.deepEqual(LAYER_CHOICES.map((c) => c.id), ['none', 'air', 'water', 'fauna']);
  assert.equal(SOIL_CHOICE.id, 'soil');
  assert.deepEqual([...LAYER_KINDS], ['none', 'air', 'water', 'fauna', 'soil']);
  for (const k of LAYER_KINDS) assert.equal(isLayerKind(k), true, `calque ${k}`);
  assert.equal(isLayerKind('argent'), false);
  assert.equal(layerChoice('soil').label, 'Sols');
  assert.equal(layerChoice('inconnu'), null);
  // Sans rendu (ou avec un rendu qui ne sait pas encore) : la légende de repli, jamais d'erreur.
  assert.equal(layerInfoOf('none', null), null);
  assert.equal(layerInfoOf('air', null).kind, 'air');
  assert.equal(layerInfoOf('water', { layerInfo: () => { throw new Error('pas encore'); } }).kind, 'water');
  // Avec le rendu (src/render3d/layers.js) : paliers, bornes et unité réels.
  const info = layerInfoOf('air', { layerInfo: rendererLayerInfo });
  assert.equal(info.min, 0);
  assert.equal(info.max, 100);
  assert.equal(info.stops.length, 3);
  assert.match(gradientCss(info), /^linear-gradient\(90deg, #[0-9a-f]{6} 0%, #[0-9a-f]{6} 50%, #[0-9a-f]{6} 100%\)$/);
  const b = boundsText(info);
  assert.match(b.min, /^Pur 0/);
  assert.equal(b.mid, 'Chargé');
  assert.match(b.max, /^Irrespirable 100/);
  assert.deepEqual(boundsText(null), { min: '', mid: '', max: '' });
  assert.equal(gradientCss(null), 'var(--panel-2)');
  // Arrêts donnés en simples couleurs : répartis régulièrement.
  assert.equal(gradientCss({ stops: ['#000000', '#ffffff'] }), 'linear-gradient(90deg, #000000 0%, #ffffff 100%)');
  assert.equal(pillText('fauna'), 'Calque Faune');
  assert.equal(pillText('none'), '');
  assert.equal(pillText(null), '');
});

test('carnet des espèces : date d’apparition, tri, comptage, case à montrer, dessins', () => {
  assert.equal(sinceLabel(0), 'depuis le printemps de l’an 1');
  assert.equal(sinceLabel(15), 'depuis l’été de l’an 2');
  assert.equal(sinceLabel(11), 'depuis l’hiver de l’an 1');
  assert.equal(sinceLabel(null), '');
  assert.equal(sinceLabel(-3), '');
  const rows = speciesRows([
    { id: 'fox', label: 'Renard', present: false, hint: 'Un corridor entre deux parcelles.' },
    { id: 'deer', label: 'Cerf', present: true, since: 6 },
    { id: 'bee', label: 'Abeilles', present: true, since: 3 },
    { id: 'owl', present: false },
  ]);
  assert.deepEqual(rows.map((r) => r.id), ['bee', 'deer', 'owl', 'fox'], 'présentes d’abord (les plus anciennes en tête), puis par ordre alphabétique');
  assert.equal(rows[0].sinceText, 'depuis l’été de l’an 1');
  assert.equal(rows[1].sinceText, 'depuis l’automne de l’an 1');
  assert.equal(rows[2].sinceText, '', 'une espèce absente n’a pas de date');
  assert.equal(rows[2].since, null, 'une espèce absente n’a pas de mois d’apparition');
  assert.equal(rows[2].label, 'Chouette', 'nom de repli depuis src/data/species.js');
  assert.deepEqual(speciesRows(null), []);
  assert.match(speciesCountText(rows), /sur 4/);
  assert.match(speciesCountText([{ id: 'x', label: 'X', present: false }]), /Aucune espèce/);
  assert.match(speciesCountText([]), /premier mois/);
  assert.deepEqual(speciesCellOf({ species: { deer: { cells: [13, 14, 15] } } }, 'deer', 12), { x: 2, y: 1 });
  assert.equal(speciesCellOf({ species: { deer: { cells: [] } } }, 'deer', 12), null);
  assert.equal(speciesCellOf(null, 'deer', 12), null);
  assert.equal(speciesLabel('deer'), 'Cerf');
  assert.equal(speciesLabel('bees'), 'Abeilles');
  assert.equal(speciesLabel('x', 'Loup'), 'Loup');
  // Chaque espèce du catalogue a son dessin et son nom (jamais l'identifiant brut à l'écran).
  for (const def of SPECIES) {
    assert.notEqual(speciesArt(def.id), SPECIES_FALLBACK, `dessin manquant pour ${def.id}`);
    assert.equal(speciesLabel(def.id), def.label);
    assert.ok(def.hint && def.hint.length > 10, `condition en une phrase pour ${def.id}`);
  }
  assert.equal(speciesArt('licorne'), SPECIES_FALLBACK);
});

test('fiche Nature : quatre sous-scores, chacun ouvre son calque, appréciation en un mot', () => {
  assert.deepEqual(SCORE_ROWS.map((r) => r.key), ['air', 'water', 'fauna', 'soil']);
  assert.deepEqual(SCORE_ROWS.map((r) => r.layer), ['air', 'water', 'fauna', 'soil']);
  for (const row of SCORE_ROWS) assert.equal(isLayerKind(row.layer), true, `${row.key} : calque connu`);
  const rows = scoreRows({ scores: { air: 82, water: 55, fauna: 30, soil: 0, nature: 64 } });
  assert.deepEqual(rows.map((r) => r.value), [82, 55, 30, 0]);
  assert.deepEqual(rows.map((r) => r.word), ['excellent', 'passable', 'fragile', 'critique']);
  assert.deepEqual(scoreRows(null).map((r) => r.value), [null, null, null, null]);
  assert.equal(scoreRows({ scores: { air: 140 } })[0].value, 100, 'note bornée à 100');
  assert.equal(natureText({ scores: { nature: 64 } }), 'Nature : 64 / 100 · bon');
  assert.match(natureText(null), /premier mois/);
  assert.equal(scoreWord(100), 'excellent');
  assert.equal(scoreWord('x'), '');
});

test('fiche d’une case : bloc écologie en barres courtes et espèces de la parcelle', () => {
  assert.deepEqual(ECO_FIELDS.map((f) => f.key), ['air', 'water', 'fauna', 'soil']);
  const rows = ecoRows({ air: 12, water: 48, fauna: 70, soil: 0 });
  assert.deepEqual(rows.map((r) => r.key), ['air', 'water', 'fauna'], 'la fertilité d’un sol non cultivé est omise');
  assert.deepEqual(rows.map((r) => r.word), ['pur', 'trouble', 'riche']);
  assert.deepEqual(rows.map((r) => r.invert), [true, true, false], 'air et eau : la valeur haute est mauvaise');
  assert.deepEqual(rows.map((r) => r.pct), [12, 48, 70]);
  assert.equal(ecoRows({ air: 0, water: 0, fauna: 0, soil: 70 }).length, 4);
  assert.equal(ecoRows(null).length, 0);
  assert.equal(ecoWord('air', 95), 'irrespirable');
  assert.equal(ecoWord('soil', 70), 'bonne');
  assert.equal(ecoWord('inconnu', 10), '');
  assert.equal(ecoSpeciesText({ species: ['deer', 'fox'] }), 'Espèces ici : Cerf, Renard');
  assert.equal(ecoSpeciesText({ species: [] }), '');
  assert.equal(ecoSpeciesText(null), '');
});

test('main : alertes d’écologie en bandeau avec « Voir », arrivée et départ d’une espèce', () => {
  assert.equal(ecoAlertTitle('smog'), ECO_ALERT_TITLES.smog);
  assert.deepEqual(Object.keys(ECO_ALERT_TITLES), ['smog', 'algae', 'flood', 'heat']);
  assert.match(ecoAlertTitle('inconnue'), /vallée/, 'jamais une clé brute à l’écran');
  const alert = eventPresentation({ type: 'eco-alert', key: 'smog', text: 'L’air des quartiers est irrespirable.', x: 3, y: 4, layer: 'air' });
  assert.equal(alert.channel, 'banner');
  assert.equal(alert.kind, 'warn');
  assert.equal(alert.title, ECO_ALERT_TITLES.smog);
  assert.deepEqual(alert.see, { x: 3, y: 4, layer: 'air' });
  assert.equal(alert.seeLabel, 'Voir');
  const arrival = eventPresentation({ type: 'species', key: 'deer', present: true, text: 'Un cerf s’aventure dans le massif.', x: 2, y: 5 });
  assert.equal(arrival.channel, 'toast');
  assert.equal(arrival.kind, 'success');
  assert.deepEqual(arrival.see, { x: 2, y: 5, layer: 'fauna' }, 'le bouton « Voir » allume le calque faune');
  const departure = eventPresentation({ type: 'species', key: 'deer', present: false, text: 'Le cerf a quitté la vallée.' });
  assert.equal(departure.channel, 'toast');
  assert.equal(departure.kind, 'warn');
  assert.equal(departure.title, null, 'un départ reste sobre');
  assert.equal(departure.see, null);
  assert.equal(seeTargetOf({}), null);
  assert.equal(seeTargetOf(null), null);
  assert.deepEqual(seeTargetOf({ layer: 'water' }), { x: null, y: null, layer: 'water' });
  assert.deepEqual(seeTargetOf({ x: 1.7, y: 2.2 }, 'fauna'), { x: 1, y: 2, layer: 'fauna' });
});
