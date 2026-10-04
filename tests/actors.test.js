// Acteurs animés (docs/ARCHITECTURE.md §8.1) : déterminisme, plafonds, habitants sur les rues, véhicules sur
// les arêtes chargées, faune dans son habitat, stabilité numérique sur 60 s simulées.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createActors, updateActors, syncActors, actorsStats, habitatSummary, streetGraph, offsetPath, allocate, tileIndexAt,
  CAPS, SIDEWALK_OFFSET, LANE_OFFSET, RESIDENTS_PER_LEVEL, FLIGHT,
} from '../src/core/actors.js';
import { generateWorld } from '../src/core/worldgen.js';
import { rebuildRoads, computeTraffic, EDGE } from '../src/core/roads.js';
import { edgeRef, edgeValue } from '../src/core/grid.js';
import { makeWorld, setTerrain, place, riverColumn } from './world-helpers.js';

const DT = 1 / 60;

/** Distance d'un point au segment [a, b]. */
function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz;
  let t = len2 > 0 ? ((px - ax) * dx + (pz - az) * dz) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

/** Arêtes du monde avec leurs segments : [{ ref, value, traffic, ax, az, bx, bz }]. */
function edgeSegments(world) {
  const out = [];
  for (let y = 0; y <= world.rows; y++) for (let x = 0; x < world.cols; x++) {
    const ref = edgeRef(world, 'h', x, y);
    out.push({ ref, value: edgeValue(world, ref), traffic: world.traffic.h[ref.index], ax: x, az: y, bx: x + 1, bz: y });
  }
  for (let y = 0; y < world.rows; y++) for (let x = 0; x <= world.cols; x++) {
    const ref = edgeRef(world, 'v', x, y);
    out.push({ ref, value: edgeValue(world, ref), traffic: world.traffic.v[ref.index], ax: x, az: y, bx: x, bz: y + 1 });
  }
  return out;
}

/** L'arête la plus proche d'un point (parmi `filter`), avec sa distance. */
function nearestEdge(segments, x, z, filter = () => true) {
  let best = null;
  for (const s of segments) {
    if (!filter(s)) continue;
    const d = distToSegment(x, z, s.ax, s.az, s.bx, s.bz);
    if (!best || d < best.d) best = { ...s, d };
  }
  return best;
}

function simulate(actors, world, seconds, onStep) {
  const steps = Math.round(seconds / DT);
  for (let i = 0; i < steps; i++) {
    updateActors(actors, world, DT);
    if (onStep) onStep(i);
  }
}

function positions(actors) {
  return actors.list.map((a) => [a.id, a.kind, +a.x.toFixed(6), +a.y.toFixed(6), +a.z.toFixed(6), +a.yaw.toFixed(6), +a.phase.toFixed(6), a.state]);
}

test('actors : déterminisme — même graine, même scène après 20 s', () => {
  const world = generateWorld({ seed: 7, starterTown: true });
  const a = createActors(world, 7);
  const b = createActors(world, 7);
  assert.deepEqual(positions(a), positions(b));
  simulate(a, world, 20);
  simulate(b, world, 20);
  assert.deepEqual(positions(a), positions(b));
  // Une autre graine donne une autre scène.
  const c = createActors(world, 8);
  simulate(c, world, 20);
  assert.notDeepEqual(positions(a), positions(c));
});

test('actors : effectifs — 2/4/6 habitants par quartier selon le niveau, plafonds respectés', () => {
  const w = place(place(place(place(makeWorld(8, 8), 3, 3, 'townhall'), 4, 3, 'house', 1), 3, 4, 'house', 2), 4, 4, 'house', 3);
  const world = computeTraffic(rebuildRoads(w));
  const actors = createActors(world, 1);
  const s = actorsStats(actors);
  assert.equal(s.byGroup.habitant, RESIDENTS_PER_LEVEL[1] + RESIDENTS_PER_LEVEL[2] + RESIDENTS_PER_LEVEL[3]);
  const perHome = {};
  for (const a of actors.list) if (a.group === 'habitant') { const k = `${a.home.x},${a.home.y}`; perHome[k] = (perHome[k] || 0) + 1; }
  assert.deepEqual(perHome, { '4,3': 2, '3,4': 4, '4,4': 6 });
  for (const a of actors.list) assert.ok(['citizen-a', 'citizen-b', 'citizen-c'].includes(a.model) || a.group !== 'habitant');

  // Grande ville : plafonds 60 / 20 / 24.
  const big = makeWorld(16, 16);
  place(big, 8, 8, 'townhall');
  for (let y = 3; y < 14; y++) for (let x = 3; x < 14; x++) {
    if (x === 8 && y === 8) continue;
    place(big, x, y, (x + y) % 5 === 0 ? 'shop' : (x + y) % 7 === 0 ? 'factory' : 'house', 3);
  }
  for (let y = 0; y < 16; y++) for (let x = 0; x < 3; x++) setTerrain(big, x, y, 'forest');
  for (let x = 0; x < 16; x++) setTerrain(big, x, 15, 'lake');
  for (let x = 0; x < 16; x++) setTerrain(big, x, 0, 'meadow');
  const bigWorld = computeTraffic(rebuildRoads(big));
  const many = createActors(bigWorld, 3);
  const ms = actorsStats(many);
  assert.ok(ms.byGroup.habitant <= CAPS.habitant && ms.byGroup.habitant === CAPS.habitant, `habitants ${ms.byGroup.habitant}`);
  assert.ok(ms.byGroup.vehicle <= CAPS.vehicle && ms.byGroup.vehicle > 0, `véhicules ${ms.byGroup.vehicle}`);
  assert.ok(ms.byGroup.animal <= CAPS.animal && ms.byGroup.animal > 0, `faune ${ms.byGroup.animal}`);
  // Plafonds surchargés (fixture de charge).
  const doubled = createActors(bigWorld, 3, { caps: { habitant: 120, vehicle: 40, animal: 48 } });
  assert.ok(actorsStats(doubled).byGroup.habitant > CAPS.habitant);
});

test('actors : les habitants restent sur une arête de rue (± 0,2 u) pendant 60 s', () => {
  const world = generateWorld({ seed: 12345, starterTown: true });
  const actors = createActors(world, 12345);
  const segments = edgeSegments(world);
  const isStreet = (s) => s.value >= EDGE.STREET;
  let walked = 0;
  let midEdge = 0;
  simulate(actors, world, 60, (i) => {
    if (i % 30 !== 0) return;
    for (const a of actors.list) {
      if (a.group !== 'habitant') continue;
      const e = nearestEdge(segments, a.x, a.z, isStreet);
      assert.ok(e && e.d <= 0.2, `habitant ${a.id} à ${e ? e.d.toFixed(3) : '?'} u de la rue la plus proche (${a.x.toFixed(2)}, ${a.z.toFixed(2)}) état ${a.state}`);
      // Par rapport à l'arête qu'il longe : en pleine arête (à plus de 0,25 u des deux coins), il est sur le
      // trottoir, à 0,12 u ± 0,04 ; aux carrefours (raccords d'angle, traversées) seule la première borne compte.
      if (a.edge && a.state === 'walk') {
        const own = segments.find((s) => s.ref.kind === a.edge.kind && s.ref.index === a.edge.index);
        assert.ok(own.value >= EDGE.STREET, 'son arête est une rue');
        const along = own.ax === own.bx ? a.z - own.az : a.x - own.ax;
        if (along > 0.25 && along < 0.75) {
          const d = distToSegment(a.x, a.z, own.ax, own.az, own.bx, own.bz);
          assert.ok(Math.abs(d - SIDEWALK_OFFSET) <= 0.04, `décalage trottoir ${d.toFixed(3)} en pleine arête`);
          midEdge++;
        }
      }
      if (a.state === 'walk') walked++;
    }
  });
  assert.ok(walked > 0, 'au moins un habitant a marché');
  assert.ok(midEdge > 20, `assez de mesures en pleine arête (${midEdge})`);
  // Un habitant alterne marche et pause (2 à 6 s).
  const walker = actors.list.find((a) => a.group === 'habitant');
  assert.ok(walker.ttl <= 6.01);
});

test('actors : les véhicules roulent seulement sur les arêtes à trafic > 0, à droite, et s’arrêtent aux carrefours', () => {
  const world = generateWorld({ seed: 1, starterTown: true });
  const actors = createActors(world, 1);
  const segments = edgeSegments(world);
  const stats = actorsStats(actors);
  assert.ok(stats.byGroup.vehicle > 0);
  let stopped = 0;
  let maxSpeed = 0;
  simulate(actors, world, 60, (i) => {
    if (i % 20 !== 0) return;
    for (const a of actors.list) {
      if (a.group !== 'vehicle') continue;
      // L'arête de sa voie porte du trafic, et le véhicule en est proche (à droite, décalé de 0,07 u).
      const own = segments.find((s) => s.ref.kind === a.edge.kind && s.ref.index === a.edge.index);
      assert.ok(own.traffic > 0, `véhicule ${a.id} sur une arête sans trafic (${own.ref.kind} ${own.ref.x},${own.ref.y})`);
      assert.ok(own.value >= EDGE.STREET, 'une rue ou un pont');
      const d = distToSegment(a.x, a.z, own.ax, own.az, own.bx, own.bz);
      assert.ok(d <= 0.2, `véhicule ${a.id} à ${d.toFixed(3)} u de sa voie`);
      assert.ok(Math.abs(d - LANE_OFFSET) <= 0.08 || a.uturn, `décalage voie ${d.toFixed(3)}`);
      const e = nearestEdge(segments, a.x, a.z);
      assert.ok(e.d <= 0.2, 'toujours près d’une arête');
      assert.ok(['car-a', 'car-b', 'truck', 'bus'].includes(a.model));
      if (a.state === 'idle') stopped++;
      maxSpeed = Math.max(maxSpeed, a.speed);
    }
  });
  assert.ok(maxSpeed <= 1.2001 && maxSpeed > 1.0, `vitesse max ${maxSpeed}`);
  assert.ok(stopped > 0, 'au moins un arrêt à un carrefour');
});

test('actors : la faune reste dans son habitat ; nageurs sur l’eau, cerfs en forêt, hirondelles en l’air', () => {
  const world = generateWorld({ seed: 7, starterTown: true });
  const actors = createActors(world, 7);
  const h = habitatSummary(world);
  const kinds = actorsStats(actors).byKind;
  assert.ok(kinds.deer >= 1 && kinds.duck >= 1 && kinds.heron >= 1 && kinds.bee >= 1 && kinds.swallow >= 1, JSON.stringify(kinds));
  const water = new Set(h.water);
  let flewHeron = 0;
  simulate(actors, world, 60, (i) => {
    if (i % 15 !== 0) return;
    for (const a of actors.list) {
      if (a.group !== 'animal') continue;
      const here = tileIndexAt(world, a.x, a.z);
      assert.ok(a.habitatSet.has(here), `${a.kind} ${a.id} hors habitat en (${a.x.toFixed(2)}, ${a.z.toFixed(2)}) état ${a.state}`);
      const t = world.tiles[here];
      switch (a.kind) {
        case 'deer': case 'owl': assert.equal(t.terrain, 'forest'); break;
        case 'duck': assert.ok(water.has(here)); assert.equal(a.state, 'swim'); break;
        case 'otter': assert.equal(t.terrain, 'river'); break;
        case 'fox': assert.ok(['forest', 'meadow', 'grass'].includes(t.terrain)); break;
        case 'bee': assert.ok(['meadow', 'field'].includes(t.terrain)); assert.ok(Math.abs(a.y - FLIGHT.bee) < 0.05); break;
        case 'swallow': assert.ok(a.y >= FLIGHT.swallowMin - 1e-6 && a.y <= FLIGHT.swallowMax + 1e-6, `hirondelle y ${a.y}`); assert.equal(a.state, 'fly'); break;
        case 'heron':
          if (a.state === 'fly') { flewHeron++; assert.ok(a.y >= 0 && a.y <= FLIGHT.heron + 1e-6); }
          else assert.equal(a.y, 0);
          break;
        default: break;
      }
      assert.ok(!t.building || t.building.type === 'field' || a.kind === 'swallow', `${a.kind} traverse un bâtiment ${t.building && t.building.type}`);
    }
  });
  assert.ok(flewHeron >= 0);
  // Un héron finit par s'envoler dans les 3 minutes, et son vol dure 3 à 5 s.
  const heron = actors.list.find((a) => a.kind === 'heron');
  let flights = 0, flying = 0, was = heron.state;
  simulate(actors, world, 180, () => {
    if (heron.state === 'fly') { flying++; if (was !== 'fly') flights++; }
    was = heron.state;
  });
  assert.ok(flights > 0, 'le héron s’est envolé');
  assert.ok(flying * DT / flights >= 2.5 && flying * DT / flights <= 5.5, `durée moyenne de vol ${(flying * DT / flights).toFixed(1)} s`);
});

test('actors : pas de NaN après 60 s à 1/60 s, phases dans [0, 1[, vitesses bornées', () => {
  for (const seed of [1, 12345]) {
    const world = generateWorld({ seed, starterTown: true });
    const actors = createActors(world, seed);
    simulate(actors, world, 60);
    for (const a of actors.list) {
      for (const k of ['x', 'y', 'z', 'yaw', 'speed', 'phase', 'ttl']) assert.ok(Number.isFinite(a[k]), `${a.kind} ${k} = ${a[k]}`);
      assert.ok(a.phase >= 0 && a.phase < 1, `phase ${a.phase}`);
      assert.ok(a.speed >= 0 && a.speed <= 1.61, `vitesse ${a.speed}`);
      assert.ok(a.x >= 0 && a.x <= world.cols && a.z >= 0 && a.z <= world.rows, 'dans la carte');
    }
    // dt nul ou aberrant : rien ne casse (borné à 0,1 s).
    const before = positions(actors);
    updateActors(actors, world, 0);
    assert.deepEqual(positions(actors), before);
    updateActors(actors, world, 5);
    for (const a of actors.list) assert.ok(Number.isFinite(a.x) && Number.isFinite(a.z));
  }
});

test('actors : la phase avance de vitesse / pas (≈ 0,35 u par pas d’habitant)', () => {
  const world = generateWorld({ seed: 1, starterTown: true });
  const actors = createActors(world, 1);
  let walker = null;
  for (let i = 0; i < 60 * 30 && !walker; i++) {
    updateActors(actors, world, DT);
    walker = actors.list.find((a) => a.group === 'habitant' && a.state === 'walk' && a.path.length >= 1 && Math.hypot(a.path[0].x - a.x, a.path[0].z - a.z) > 0.05) || null;
  }
  assert.ok(walker, 'un habitant en marche');
  const p0 = walker.phase;
  updateActors(actors, world, DT);
  const expected = (p0 + 0.6 / 0.35 * DT) % 1;
  assert.ok(Math.abs(walker.phase - expected) < 1e-6, `${walker.phase} vs ${expected}`);
  // Au repos, la phase avance lentement (respiration) et reste dans [0, 1[.
  const idle = actors.list.find((a) => a.group === 'habitant' && a.state === 'idle');
  if (idle) { const q = idle.phase; updateActors(actors, world, DT); assert.ok(Math.abs(((idle.phase - q + 1) % 1) - 0.5 * DT) < 1e-6 || idle.state !== 'idle'); }
});

test('actors : habitatSummary — massifs, berges, lisières et effectifs souhaités sur un monde synthétique', () => {
  const w = makeWorld(10, 10);
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) setTerrain(w, x, y, 'forest');      // massif de 9
  setTerrain(w, 8, 8, 'forest');                                                               // bosquet isolé
  for (let x = 3; x < 6; x++) setTerrain(w, x, 0, 'meadow');                                   // prairie en lisière
  riverColumn(w, 7);
  setTerrain(w, 6, 5, 'wetland');
  place(w, 4, 4, 'townhall');
  place(w, 5, 4, 'house');
  place(w, 4, 5, 'house');
  const world = computeTraffic(rebuildRoads(w));
  const h = habitatSummary(world);
  assert.deepEqual(h.massifs.map((m) => m.size), [9, 1]);
  assert.equal(h.desired.deer, 2, 'un massif ≥ 8 vaut deux cerfs');
  assert.equal(h.desired.owl, 1);
  assert.ok(h.forestEdge.length >= 3 && h.edgeMeadow.length >= 3);
  assert.equal(h.river.length, 10);
  assert.ok(h.banks.includes(6 + 5 * 10), 'la zone humide est une berge');
  assert.ok(h.desired.otter >= 1 && h.desired.duck >= 1 && h.desired.heron >= 1 && h.desired.bee >= 1 && h.desired.swallow >= 1);
  assert.ok(h.town.length >= 3 && h.built.length === 3);
  // Allocation au prorata : la somme ne dépasse jamais le plafond.
  const alloc = allocate(h.desired, 5);
  assert.equal(Object.values(alloc).reduce((s, v) => s + v, 0), 5);
  assert.deepEqual(allocate({ a: 1, b: 2 }, 10), { a: 1, b: 2 });
});

test('actors : décalage à droite — un piéton qui va vers l’est marche au sud de l’arête, vers le sud à l’ouest', () => {
  const world = makeWorld(4, 4);
  const g = (cx, cy) => cy * 5 + cx;
  const east = offsetPath(world, [g(1, 1), g(2, 1)], 0.12);
  assert.ok(east.every((p) => Math.abs(p.z - 1.12) < 1e-9), 'vers l’est : z = y + 0,12 (sud = droite)');
  const south = offsetPath(world, [g(1, 1), g(1, 2)], 0.12);
  assert.ok(south.every((p) => Math.abs(p.x - 0.88) < 1e-9), 'vers le sud : x = x − 0,12 (ouest = droite)');
  assert.equal(east[1].edge.kind, 'h');
  assert.equal(south[1].edge.kind, 'v');
  // Virage à droite (est puis sud) : un seul point au coin du pâté, à 0,12 u des deux rues ; tout droit : un point.
  const turn = offsetPath(world, [g(1, 1), g(2, 1), g(2, 2)], 0.12);
  assert.equal(turn.length, 3);
  assert.ok(Math.abs(turn[1].x - 1.88) < 1e-9 && Math.abs(turn[1].z - 1.12) < 1e-9, `coin ${turn[1].x}, ${turn[1].z}`);
  const straight = offsetPath(world, [g(0, 1), g(1, 1), g(2, 1)], 0.12);
  assert.equal(straight.length, 3);
  assert.ok(straight.every((p) => Math.abs(p.z - 1.12) < 1e-9));
  // Demi-tour : traversée de la rue (deux points au même coin, de part et d'autre).
  const back = offsetPath(world, [g(1, 1), g(2, 1), g(1, 1)], 0.12);
  assert.equal(back.length, 4);
  assert.ok(Math.abs(back[1].z - 1.12) < 1e-9 && Math.abs(back[2].z - 0.88) < 1e-9);
  const graph = streetGraph(computeTraffic(rebuildRoads(place(place(makeWorld(4, 4), 1, 1, 'townhall'), 2, 1, 'house'))));
  assert.ok(graph.degree[g(2, 1)] === 3 && graph.degree[g(1, 1)] === 2, 'degrés des coins');
});

test('actors : un monde modifié se resynchronise (nouveaux quartiers → plus d’habitants ; rue disparue → rien ne casse)', () => {
  const w = place(place(makeWorld(8, 8), 3, 3, 'townhall'), 4, 3, 'house');
  const world = computeTraffic(rebuildRoads(w));
  const actors = createActors(world, 5);
  simulate(actors, world, 10);
  assert.equal(actorsStats(actors).byGroup.habitant, 2);
  const w2 = place(place(makeWorld(8, 8), 3, 3, 'townhall'), 4, 3, 'house');
  place(w2, 3, 4, 'house', 2);
  place(w2, 5, 3, 'shop');
  const world2 = computeTraffic(rebuildRoads(w2));
  updateActors(actors, world2, DT); // changement de monde détecté par référence
  assert.equal(actorsStats(actors).byGroup.habitant, 6);
  assert.ok(actors.list.filter((a) => a.group === 'vehicle').length > 0, 'du trafic apparaît avec le commerce');
  const kept = actors.list.filter((a) => a.group === 'habitant' && a.home.x === 4 && a.home.y === 3).length;
  assert.equal(kept, 2, 'les anciens habitants sont gardés');
  simulate(actors, world2, 30);
  // La maison d'origine disparaît : ses habitants aussi, sans erreur.
  const w3 = place(makeWorld(8, 8), 3, 3, 'townhall');
  place(w3, 3, 4, 'house', 2);
  const world3 = computeTraffic(rebuildRoads(w3));
  syncActors(actors, world3);
  simulate(actors, world3, 10);
  assert.equal(actorsStats(actors).byGroup.habitant, 4);
  for (const a of actors.list) assert.ok(Number.isFinite(a.x) && Number.isFinite(a.z));
});
