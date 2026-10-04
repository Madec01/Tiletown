#!/usr/bin/env node
// Affiche une vallée générée en ASCII : une lettre par terrain, les bâtiments en majuscule, les rues
// sur les arêtes. Sert à vérifier la génération à l'œil, sans navigateur.
//
//   node tools/print-world.js [graine] [--cols 12] [--rows 16] [--no-town] [--traffic]
//
// Terrains : . herbe   , prairie   f forêt   = champ   ~ rivière   o lac   w zone humide   ^ colline
// Arêtes   : · chemin   ─ │ rue   ═ ║ pont   (avec --traffic : chiffre = trajets sur l'arête, 1 à 9)

import { generateWorld, validateWorld, traceRiver } from '../src/core/worldgen.js';
import { tileAt, edgeH, edgeV } from '../src/core/grid.js';
import { countEdges, trafficStats, networkConnected } from '../src/core/roads.js';
import { TILES } from '../src/data/tiles.js';
import { TERRAINS } from '../src/data/terrain.js';

const TERRAIN_CHAR = { grass: '.', meadow: ',', forest: 'f', field: '=', river: '~', lake: 'o', wetland: 'w', hill: '^' };
const BUILDING_CHAR = {
  house: 'H', shop: 'S', office: 'B', factory: 'U', school: 'E', clinic: 'C', market: 'M', townhall: 'T', 'tram-stop': 'G',
  wastewater: 'P', 'wind-turbine': 'W', solar: 'L', 'power-plant': 'N', compost: 'K', 'water-tower': 'D',
  park: 'Q', 'tree-planting': 'A', hedge: 'I', 'wetland-restored': 'Z', orchard: 'V', field: 'X',
};

function parseArgs(argv) {
  const opts = { seed: 1, cols: 12, rows: 16, town: true, traffic: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--cols') opts.cols = Number(argv[++i]);
    else if (a === '--rows') opts.rows = Number(argv[++i]);
    else if (a === '--no-town') opts.town = false;
    else if (a === '--traffic') opts.traffic = true;
    else if (a === '--help' || a === '-h') { opts.help = true; }
    else opts.seed = /^-?\d+$/.test(a) ? Number(a) : a;
  }
  return opts;
}

function edgeChar(value, traffic, horizontal, showTraffic) {
  if (showTraffic && traffic > 0) return String(Math.min(9, Math.round(traffic)));
  if (value === 1) return '·';
  if (value === 2) return horizontal ? '─' : '│';
  if (value === 3) return horizontal ? '═' : '║';
  return ' ';
}

/** Rend le monde en lignes de texte. */
export function renderWorld(world, { traffic = false } = {}) {
  const { cols, rows } = world;
  const W = 2 * cols + 1;
  const H = 2 * rows + 1;
  const grid = Array.from({ length: H }, () => new Array(W).fill(' '));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const t = tileAt(world, x, y);
      grid[2 * y + 1][2 * x + 1] = t.building ? (BUILDING_CHAR[t.building.type] || '?') : (TERRAIN_CHAR[t.terrain] || '?');
    }
  }
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = edgeH(world, x, y);
      grid[2 * y][2 * x + 1] = edgeChar(world.edges.h[i], world.traffic.h[i], true, traffic);
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x <= cols; x++) {
      const i = edgeV(world, x, y);
      grid[2 * y + 1][2 * x] = edgeChar(world.edges.v[i], world.traffic.v[i], false, traffic);
    }
  }
  // Coins : + si une rue y arrive, · si seulement un chemin.
  for (let cy = 0; cy <= rows; cy++) {
    for (let cx = 0; cx <= cols; cx++) {
      let best = 0;
      const look = (v) => { if (v > best) best = v; };
      if (cx < cols) look(world.edges.h[edgeH(world, cx, cy)]);
      if (cx > 0) look(world.edges.h[edgeH(world, cx - 1, cy)]);
      if (cy < rows) look(world.edges.v[edgeV(world, cx, cy)]);
      if (cy > 0) look(world.edges.v[edgeV(world, cx, cy - 1)]);
      grid[2 * cy][2 * cx] = best >= 2 ? '+' : best === 1 ? '·' : ' ';
    }
  }
  return grid.map((row) => row.join(''));
}

/** Résumé chiffré du monde. */
export function summarize(world) {
  const terrain = {};
  const buildings = {};
  for (const t of world.tiles) {
    terrain[t.terrain] = (terrain[t.terrain] || 0) + 1;
    if (t.building) buildings[t.building.type] = (buildings[t.building.type] || 0) + 1;
  }
  const river = traceRiver(world);
  return {
    terrain,
    buildings,
    edges: countEdges(world),
    traffic: trafficStats(world),
    connected: networkConnected(world),
    river: river ? { length: river.length, from: river[0], to: river[river.length - 1] } : null,
    wind: world.wind,
  };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log('Usage : node tools/print-world.js [graine] [--cols 12] [--rows 16] [--no-town] [--traffic]');
    return;
  }
  const world = generateWorld({ seed: opts.seed, cols: opts.cols, rows: opts.rows, map: 'valley', starterTown: opts.town });
  const check = validateWorld(world);
  console.log(`Vallée « ${opts.seed} », ${world.cols} × ${world.rows}, vent dominant ${world.wind}${check.ok ? '' : ' — PROBLÈMES : ' + check.problems.join(' ; ')}`);
  console.log();
  for (const line of renderWorld(world, { traffic: opts.traffic })) console.log('  ' + line);
  console.log();
  const s = summarize(world);
  const terrainLine = Object.entries(s.terrain).map(([k, v]) => `${TERRAINS[k].label} ${v}`).join(', ');
  const buildingLine = Object.entries(s.buildings).map(([k, v]) => `${TILES.find((t) => t.id === k)?.label ?? k} ${v}`).join(', ');
  console.log(`Terrains : ${terrainLine}`);
  console.log(`Bâtiments : ${buildingLine || 'aucun'}`);
  console.log(`Rivière : ${s.river ? `${s.river.length} cases, de (${s.river.from.x}, ${s.river.from.y}) à (${s.river.to.x}, ${s.river.to.y})` : 'absente'}`);
  console.log(`Arêtes : ${s.edges.path} chemins, ${s.edges.street} rues, ${s.edges.bridge} ponts ; réseau ${s.connected ? 'relié' : 'NON relié'}`);
  console.log(`Trafic : ${s.traffic.total} passages, maximum ${s.traffic.max} sur une arête`);
  console.log();
  console.log('Légende : . herbe  , prairie  f forêt  = champ  ~ rivière  o lac  w zone humide  ^ colline ;');
  console.log('          T mairie  H quartier  S commerce  X champ cultivé ; · chemin  ─│ rue  ═║ pont');
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) main();
