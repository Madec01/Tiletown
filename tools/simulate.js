#!/usr/bin/env node
// Simulation d'équilibrage (docs/GAME_DESIGN.md §6 ; src/data/balance.js).
//
//   node tools/simulate.js [graine] [--months 36] [--dt 0.1] [--quiet]
//
// Joue la ville de départ à vitesse 1 (advance par pas de `dt` secondes, comme la boucle du jeu) sur
// `months` mois, selon quatre conduites :
//   1. sans intervention ;
//   2. « une maison dès que l'argent le permet » (l'étalement naïf) ;
//   3. « tout bétonner » : usines, centrales et quartiers posés de préférence sur la nature native, jamais
//      un parc ni une plantation — la jauge Nature doit s'effondrer et l'exode arriver (§7.3) ;
//   4. « équilibrée » : on comble d'abord ce qui manque (énergie, eau, nourriture, emplois, école), on
//      épargne la nature native et on plante (parcs, vergers, haies, zones humides) — la jauge Nature doit
//      tenir au-dessus de 60.
// Pour chacune, un tableau par saison (argent, population, bonheur, nature, air, eau, faune, espèces,
// recettes et entretien du mois, bâtiments) et un verdict.

import { createGame, advance, canPlace, place, calendar } from '../src/core/game.js';
import { speciesSummary } from '../src/core/ecology.js';
import { centerOf } from '../src/core/worldgen.js';
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

/**
 * La case la moins chère où poser `tileId`. `nature` dit quoi faire de la nature native : `spare` l'évite
 * (conduite douce), `raze` la cherche au contraire et serre la ville autour de la mairie (conduite
 * « tout bétonner » : du dense, du bitume, et la vallée qu'on grignote de l'intérieur).
 */
function cheapestSpot(game, tileId, nature = 'spare') {
  const c = centerOf(game.world);
  let best = null;
  for (let y = 0; y < game.world.rows; y++) {
    for (let x = 0; x < game.world.cols; x++) {
      const check = canPlace(game, x, y, tileId);
      if (!check.ok) continue;
      const t = tileAt(game.world, x, y);
      const wild = t.native && t.terrain !== 'grass';
      const bias = wild && nature !== 'river' ? (nature === 'raze' ? -1000 : 1000) : 0;
      const pull = nature === 'raze' ? 12 * Math.max(Math.abs(x - c.x), Math.abs(y - c.y)) : 0;
      // `river` : coller à l'eau, quoi qu'il en coûte (l'arbitrage de §7.4, pris à l'envers).
      if (nature === 'river' && !touchesWater(game.world, x, y)) continue;
      const score = check.cost + bias + pull + check.path.length * 0.01;
      if (!best || score < best.score) best = { x, y, check, score };
    }
  }
  return best;
}

function tryPlace(game, tileId, margin = 0, nature = 'spare') {
  if (!game.unlocked.includes(tileId)) return null;
  const spot = cheapestSpot(game, tileId, nature);
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
  concrete: {
    label: 'Tout bétonner (la nature rasée, ni parc ni plantation)',
    act: (game) => {
      let g = game;
      for (let guard = 0; guard < 8; guard++) {
        const s = g.stats;
        let next = null;
        if (s.shortages.includes('energy')) next = tryPlace(g, 'power-plant', 0, 'raze') || tryPlace(g, 'wind-turbine', 0, 'raze');
        else if (s.shortages.includes('water')) next = tryPlace(g, 'water-tower', 0, 'raze');
        else if (s.shortages.includes('food')) next = tryPlace(g, 'field', 0, 'raze');
        else {
          // L'usine au bord de la rivière (§7.4) : le terrain le moins cher, l'aval qu'on oublie.
          next = tryPlace(g, 'factory', 0, 'river')
            || tryPlace(g, 'factory', 0, 'raze')
            || tryPlace(g, 'house', 0, 'raze')
            || tryPlace(g, 'shop', 0, 'raze')
            || tryPlace(g, 'office', 0, 'raze');
        }
        if (!next) return g;
        g = next;
      }
      return g;
    },
  },
  balanced: {
    label: 'Équilibrée (combler les manques, épargner et planter la nature)',
    act: (game) => {
      let g = game;
      for (let guard = 0; guard < 6; guard++) {
        const s = g.stats;
        let next = null;
        if (s.shortages.includes('energy')) next = tryPlace(g, 'wind-turbine', 40) || tryPlace(g, 'solar', 40);
        else if (s.shortages.includes('water')) next = tryPlace(g, 'water-tower', 40);
        else if (s.shortages.includes('food')) next = tryPlace(g, 'orchard', 40) || tryPlace(g, 'field', 40);
        else if (s.unemployment || g.demand.activity > 0.5) next = tryPlace(g, 'office', 60) || tryPlace(g, 'shop', 60);
        else if (g.demand.services > 0.6 && !hasBuilding(g, 'school')) next = tryPlace(g, 'school', 80);
        else if (g.demand.services > 0.6 && !hasBuilding(g, 'clinic')) next = tryPlace(g, 'clinic', 80);
        // La nature d'abord : un parc tous les trois quartiers, des haies, une zone humide au bord de l'eau.
        else if (countType(g, 'park') * 3 < countType(g, 'house')) next = tryPlace(g, 'park', 60);
        else if (s.nature < 70) {
          next = tryPlace(g, 'hedge', 40) || tryPlace(g, 'wetland-restored', 80) || tryPlace(g, 'tree-planting', 60);
        } else if (g.demand.habitat > 0.4) next = tryPlace(g, 'house', 120);
        if (!next) return g;
        g = next;
      }
      return g;
    },
  },
};

/** Vrai si la case touche la rivière ou un lac (par un côté). */
function touchesWater(world, x, y) {
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const t = tileAt(world, x + dx, y + dy);
    if (t && (t.terrain === 'river' || t.terrain === 'lake')) return true;
  }
  return false;
}

/** Nombre de bâtiments d'un type. */
function countType(game, type) {
  let n = 0;
  for (const t of game.world.tiles) if (t.building && t.building.type === type) n++;
  return n;
}

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
  const eco = game.eco ? game.eco.scores : { air: 100, water: 100, fauna: 0 };
  return {
    label,
    month: game.month,
    year: calendar(game).year,
    money: game.money,
    population: s.population,
    capacity: s.capacity,
    happiness: s.happiness,
    nature: s.nature,
    air: eco.air,
    water: eco.water,
    fauna: eco.fauna,
    soil: eco.soil,
    species: s.species || 0,
    health: s.health ?? 100,
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
  const head = `${pad('Fin de', 10, true)} ${pad('Mois', 4)} ${pad('An', 2)} ${pad('Argent', 7)} ${pad('Pop', 4)}/${pad('Cap', 4, true)} ${pad('Bonh.', 5)} ${pad('Nat.', 4)} ${pad('Air', 4)} ${pad('Eau', 4)} ${pad('Faune', 5)} ${pad('Sols', 4)} ${pad('Esp.', 4)} ${pad('Santé', 5)} ${pad('Rec./m', 6)} ${pad('Entr./m', 7)} ${pad('Bât.', 4)} Pénuries`;
  console.log(head);
  console.log('-'.repeat(head.length));
  for (const r of rows) {
    console.log(`${pad(r.label, 10, true)} ${pad(r.month, 4)} ${pad(r.year, 2)} ${pad(r.money, 7)} ${pad(r.population, 4)}/${pad(r.capacity, 4, true)} ${pad(r.happiness, 5)} ${pad(r.nature, 4)} ${pad(r.air, 4)} ${pad(r.water, 4)} ${pad(r.fauna, 5)} ${pad(r.soil, 4)} ${pad(r.species, 4)} ${pad(r.health, 5)} ${pad(r.income, 6)} ${pad(r.upkeep, 7)} ${pad(r.buildings, 4)} ${r.shortages}`);
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
  // Tout bétonner : la nature doit s'effondrer et l'exode arriver (§7.3).
  const c = results.concrete;
  const cEnd = c.game.stats;
  const cLow = Math.min(...c.rows.map((r) => r.nature));
  notes.push(`Tout bétonner : ${countBuildings(c.game)} bâtiments, ${cEnd.population} habitants, nature ${cEnd.nature} (plus bas ${cLow}), air ${c.game.eco.scores.air}, espèces ${cEnd.species}, santé ${cEnd.health}, ${c.exodus} mois d'exode.`);
  if (cEnd.nature >= 50) notes.push(`PROBLÈME : tout bétonner laisse la nature à ${cEnd.nature} (attendu : sous 50).`);
  else notes.push('OK : tout bétonner fait s’effondrer la nature.');
  if (c.exodus === 0) notes.push('PROBLÈME : tout bétonner ne provoque aucun exode.');
  else notes.push(`OK : l’exode arrive (${c.exodus} mois de départs).`);

  // Équilibrée : la nature doit tenir au-dessus de 60 d'un bout à l'autre.
  const b = results.balanced;
  const bLow = Math.min(...b.rows.map((r) => r.nature));
  notes.push(`Équilibrée : ${countBuildings(b.game)} bâtiments, ${b.game.stats.population} habitants, bonheur ${b.game.stats.happiness}, nature ${b.game.stats.nature} (plus bas ${bLow}), espèces ${b.game.stats.species}, ${b.game.money} $, ${b.evolutions} évolution(s).`);
  if (bLow < 60) notes.push(`PROBLÈME : la conduite équilibrée descend à ${bLow} de nature (attendu : jamais sous 60).`);
  else notes.push('OK : la conduite équilibrée tient la nature au-dessus de 60.');
  if (b.game.stats.population <= results.idle.game.stats.population) notes.push('PROBLÈME : la conduite équilibrée ne fait pas mieux que l’inaction.');
  if (b.game.stats.nature <= c.game.stats.nature) notes.push('PROBLÈME : bétonner ne coûte pas plus cher que ménager la vallée.');
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
    const present = speciesSummary(r.game.eco).filter((sp) => sp.present);
    console.log(`Espèces présentes : ${present.length === 0 ? 'aucune' : present.map((sp) => `${sp.label} (dès le mois ${sp.since})`).join(', ')}.`);
    const alerts = Object.entries(r.game.eco.alerts).filter(([, v]) => v > 0);
    if (alerts.length > 0) console.log(`Alertes en cours : ${alerts.map(([k, v]) => `${k} depuis ${v} mois`).join(', ')}.`);
  }
  console.log('\n=== Verdict ===');
  for (const n of verdicts(results, opts.months)) console.log(`- ${n}`);
}
