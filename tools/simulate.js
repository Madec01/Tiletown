#!/usr/bin/env node
// Simulation d'équilibrage (docs/GAME_DESIGN.md §6 ; src/data/balance.js).
//
//   node tools/simulate.js [graine] [--months 36] [--dt 0.1] [--quiet]
//
// Joue la ville de départ à vitesse 1 (advance par pas de `dt` secondes, comme la boucle du jeu) sur
// `months` mois, selon trois conduites :
//   1. sans intervention ;
//   2. « une maison dès que l'argent le permet » (l'étalement naïf) ;
//   3. « équilibrée » : on comble d'abord ce qui manque (énergie, eau, nourriture, emplois, école), puis on
//      ajoute un quartier quand la demande d'habitat monte.
// Pour chacune, un tableau par saison (argent, population, bonheur, nature, recettes et entretien du mois,
// bâtiments) et un verdict : faillite précoce (argent < 0 avant 12 mois sans rien faire : interdit), argent
// qui explose (> 3 000 $ à 36 mois sans rien faire), exode.

import { createGame, advance, canPlace, place, calendar } from '../src/core/game.js';
import { tileAt } from '../src/core/grid.js';
import { TILE_BY_ID } from '../src/data/tiles.js';
import { MONTH_SECONDS } from '../src/data/balance.js';

function parseArgs(argv) {
  const opts = { seed: 1, months: 36, dt: 0.1, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--months') opts.months = Number(argv[++i]);
    else if (a === '--dt') opts.dt = Number(argv[++i]);
    else if (a === '--quiet') opts.quiet = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else opts.seed = /^-?\d+$/.test(a) ? Number(a) : a;
  }
  return opts;
}

/** La case la moins chère où poser `tileId` (sans défrichement de forêt quand on peut l'éviter). */
function cheapestSpot(game, tileId) {
  let best = null;
  for (let y = 0; y < game.world.rows; y++) {
    for (let x = 0; x < game.world.cols; x++) {
      const check = canPlace(game, x, y, tileId);
      if (!check.ok) continue;
      const t = tileAt(game.world, x, y);
      const score = check.cost + (t.native && t.terrain !== 'grass' ? 1000 : 0) + check.path.length * 0.01;
      if (!best || score < best.score) best = { x, y, check, score };
    }
  }
  return best;
}

function tryPlace(game, tileId, margin = 0) {
  if (!game.unlocked.includes(tileId)) return null;
  const spot = cheapestSpot(game, tileId);
  if (!spot || game.money < spot.check.cost + margin) return null;
  const r = place(game, spot.x, spot.y, tileId, 0);
  return r.ok ? r.game : null;
}

const STRATEGIES = {
  idle: {
    label: 'Sans intervention',
    act: (game) => game,
  },
  houses: {
    label: 'Une maison dès que l’argent le permet',
    act: (game) => {
      let g = game;
      for (;;) {
        const next = tryPlace(g, 'house', 30);
        if (!next) return g;
        g = next;
      }
    },
  },
  balanced: {
    label: 'Équilibrée (combler les manques, puis des quartiers)',
    act: (game) => {
      let g = game;
      for (let guard = 0; guard < 6; guard++) {
        const s = g.stats;
        let next = null;
        if (s.shortages.includes('energy')) next = tryPlace(g, 'wind-turbine', 40) || tryPlace(g, 'solar', 40);
        else if (s.shortages.includes('water')) next = tryPlace(g, 'water-tower', 40);
        else if (s.shortages.includes('food')) next = tryPlace(g, 'field', 40);
        else if (s.unemployment || g.demand.activity > 0.5) next = tryPlace(g, 'office', 60) || tryPlace(g, 'shop', 60);
        else if (g.demand.services > 0.6 && !hasBuilding(g, 'school')) next = tryPlace(g, 'school', 80);
        else if (g.demand.services > 0.6 && !hasBuilding(g, 'clinic')) next = tryPlace(g, 'clinic', 80);
        else if (g.demand.habitat > 0.4) next = tryPlace(g, 'house', 120);
        else if (g.demand.nature > 0.3) next = tryPlace(g, 'park', 150);
        if (!next) return g;
        g = next;
      }
      return g;
    },
  },
};

function hasBuilding(game, type) {
  return game.world.tiles.some((t) => t.building && t.building.type === type);
}

function countBuildings(game) {
  return game.world.tiles.filter((t) => t.building).length;
}

/** Joue `months` mois à vitesse 1 par pas de `dt` ; `act` est appelée après chaque mois. */
function run(seed, months, dt, strategy) {
  let game = createGame({ seed });
  const rows = [snapshot(game, 'départ')];
  let exodus = 0;
  let evolutions = 0;
  let firstNegative = null;
  const stepsPerMonth = Math.round(MONTH_SECONDS / dt);
  for (let m = 0; m < months; m++) {
    for (let i = 0; i < stepsPerMonth; i++) {
      const r = advance(game, dt);
      game = r.game;
      for (const e of r.events) {
        if (e.type === 'departures') exodus++;
        if (e.type === 'evolve') evolutions++;
      }
    }
    if (game.money < 0 && firstNegative === null) firstNegative = game.month;
    game = strategy.act(game);
    if (game.month % 3 === 0) rows.push(snapshot(game, calendar({ month: game.month - 1 }).seasonLabel.toLowerCase()));
  }
  return { game, rows, exodus, evolutions, firstNegative };
}

function snapshot(game, label) {
  const s = game.stats;
  return {
    label,
    month: game.month,
    year: calendar(game).year,
    money: game.money,
    population: s.population,
    capacity: s.capacity,
    happiness: s.happiness,
    nature: s.nature,
    income: s.income,
    upkeep: s.upkeep,
    buildings: countBuildings(game),
    shortages: s.shortages.join(',') || '—',
    jobs: s.jobs,
  };
}

function pad(v, n, right = false) {
  const s = String(v);
  return right ? s.padEnd(n) : s.padStart(n);
}

function printTable(rows) {
  const head = `${pad('Fin de', 10, true)} ${pad('Mois', 4)} ${pad('An', 2)} ${pad('Argent', 7)} ${pad('Pop', 4)}/${pad('Cap', 4, true)} ${pad('Bonheur', 7)} ${pad('Nature', 6)} ${pad('Rec./m', 6)} ${pad('Entr./m', 7)} ${pad('Bât.', 4)} ${pad('Emplois', 7)} Pénuries`;
  console.log(head);
  console.log('-'.repeat(head.length));
  for (const r of rows) {
    console.log(`${pad(r.label, 10, true)} ${pad(r.month, 4)} ${pad(r.year, 2)} ${pad(r.money, 7)} ${pad(r.population, 4)}/${pad(r.capacity, 4, true)} ${pad(r.happiness, 7)} ${pad(r.nature, 6)} ${pad(r.income, 6)} ${pad(r.upkeep, 7)} ${pad(r.buildings, 4)} ${pad(r.jobs, 7)} ${r.shortages}`);
  }
}

export function simulate({ seed = 1, months = 36, dt = 0.1 } = {}) {
  const out = {};
  for (const [key, strategy] of Object.entries(STRATEGIES)) out[key] = { label: strategy.label, ...run(seed, months, dt, strategy) };
  return out;
}

function verdicts(results, months) {
  const notes = [];
  const idle = results.idle;
  if (idle.firstNegative !== null && idle.firstNegative < 12) notes.push(`PROBLÈME : sans rien faire, la caisse passe sous zéro au mois ${idle.firstNegative} (< 12).`);
  else notes.push('OK : sans rien faire, pas de faillite en un an.');
  if (months >= 36 && idle.game.money > 3000) notes.push(`PROBLÈME : sans rien faire, l'argent explose (${idle.game.money} $ à 36 mois).`);
  else notes.push(`OK : sans rien faire, la caisse reste modeste (${idle.game.money} $ à ${months} mois).`);
  if (idle.exodus > 0) notes.push(`Note : ${idle.exodus} mois d'exode sans intervention (le jeu réclame des emplois et de l'eau).`);
  const h = results.houses;
  notes.push(`Étalement naïf : ${countBuildings(h.game)} bâtiments, ${h.game.stats.population} habitants, bonheur ${h.game.stats.happiness}, nature ${h.game.stats.nature}, ${h.game.money} $${h.firstNegative !== null ? ` (caisse négative dès le mois ${h.firstNegative})` : ''}.`);
  const b = results.balanced;
  notes.push(`Équilibrée : ${countBuildings(b.game)} bâtiments, ${b.game.stats.population} habitants, bonheur ${b.game.stats.happiness}, nature ${b.game.stats.nature}, ${b.game.money} $, ${b.evolutions} évolution(s).`);
  if (b.game.stats.population <= results.idle.game.stats.population) notes.push('PROBLÈME : la conduite équilibrée ne fait pas mieux que l’inaction.');
  return notes;
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log('Usage : node tools/simulate.js [graine] [--months 36] [--dt 0.1] [--quiet]');
    process.exit(0);
  }
  const results = simulate(opts);
  for (const r of Object.values(results)) {
    console.log(`\n=== ${r.label} (graine ${opts.seed}, ${opts.months} mois, vitesse 1, pas ${opts.dt} s) ===`);
    if (!opts.quiet) printTable(r.rows);
    console.log(`Mois d'exode : ${r.exodus} ; évolutions : ${r.evolutions} ; première caisse négative : ${r.firstNegative === null ? 'jamais' : `mois ${r.firstNegative}`}.`);
  }
  console.log('\n=== Verdict ===');
  for (const n of verdicts(results, opts.months)) console.log(`- ${n}`);
}
