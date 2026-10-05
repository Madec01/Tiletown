import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createCareer,
  startLevel,
  evaluateStars,
  finishLevel,
  finishCareer,
  reconcileCareer,
} from "../src/core/career-session.js";
import { serialize, deserialize } from "../src/core/game.js";
import { finishJourney } from "../src/core/journey.js";
import { heightAt, hillHeight, DIP } from "../src/render3d/ground.js";
import { makeWorld, setTerrain } from "./world-helpers.js";

test("carrière : mairie seule, niveaux verrouillés et déblocages persistants", () => {
  const career = createCareer(),
    game = startLevel(career, "vallee-1");
  assert.deepEqual(
    game.world.tiles.filter((t) => t.building).map((t) => t.building.type),
    ["townhall"],
  );
  assert.equal(game.stats.population, 0);
  assert.equal(game.journey.baseline.house, 0);
  assert.throws(() => startLevel(career, "riviere"), /verrouill/);
  const win = {
    ...game,
    month: 36,
    stats: { ...game.stats, population: 220, nature: 85, happiness: 80 },
  };
  assert.equal(evaluateStars(win).count, 3);
  const finished = finishCareer(finishJourney(win));
  assert.ok(finished.career.unlocked.includes("riviere"));
  assert.equal(finished.journey.result.stars, 3);
  const saved = deserialize(serialize(finished));
  assert.deepEqual(saved.career, finished.career);
  const second = startLevel(saved.career, "riviere");
  assert.ok(second.unlocked.includes("office"));
  assert.equal(second.career.stars["vallee-1"], 3);
  const replay = finishLevel(second.career, "vallee-1", 1);
  assert.equal(
    replay.stars["vallee-1"],
    3,
    "une étoile antérieure ne se perd pas",
  );
});
test("terrain continu : micro-relief borné et continuité des bords de colline", () => {
  const w = makeWorld(4, 4);
  setTerrain(w, 1, 1, "hill");
  setTerrain(w, 2, 1, "hill");
  const dip = hillHeight(w, 1, 1) - heightAt(w, 1.5, 1.5);
  assert.ok(dip >= 0 && dip <= DIP, "micro-relief dans sa profondeur autorisée");
  assert.ok(
    Math.abs(heightAt(w, 2 - 1e-6, 1.5) - heightAt(w, 2 + 1e-6, 1.5)) < 1e-5,
  );
  assert.ok(
    Math.abs(heightAt(w, 1 + 1e-6, 1.5) - heightAt(w, 1 - 1e-6, 1.5)) < 1e-5,
  );
  assert.ok(heightAt(w, 0.5, 0.5) >= -DIP && heightAt(w, 0.5, 0.5) <= 0);
});

test("sauvegardes main et PR : conserve le meilleur progrès des deux formats", () => {
  const base = createCareer();
  const stored = { ...base, stars: { 'vallee-1': 1 }, unlocked: [...base.unlocked, 'riviere'], seen: ['time'] };
  const embedded = { ...base, stars: { 'vallee-1': 3 }, seen: ['pose'], tiles: [...base.tiles, 'office'] };
  const merged = reconcileCareer(stored, embedded);
  assert.equal(merged.stars['vallee-1'], 3);
  assert.ok(merged.unlocked.includes('riviere'));
  assert.ok(merged.tiles.includes('office'));
  assert.deepEqual(merged.seen, ['time', 'pose']);
  assert.deepEqual(reconcileCareer(null, embedded).stars, embedded.stars);
  assert.deepEqual(reconcileCareer(stored, null), stored);
  assert.deepEqual(reconcileCareer(null, null), base);
});
