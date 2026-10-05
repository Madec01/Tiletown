import { test } from "node:test";
import assert from "node:assert/strict";
import { createGame, serialize, deserialize } from "../src/core/game.js";
import {
  currentGoal,
  claimGoal,
  finishJourney,
  startMode,
} from "../src/core/journey.js";

test("les primes exigent leur objectif et ne peuvent pas être obtenues deux fois", () => {
  let g = createGame({ seed: 7, starterTown: true });
  assert.equal(currentGoal(g).id, "homes");
  g = {
    ...g,
    world: {
      ...g.world,
      tiles: g.world.tiles.map((t) =>
        t.building?.type === "house" ? { ...t, building: null } : t,
      ),
    },
  };
  assert.equal(claimGoal(g), g);
  g = {
    ...g,
    world: {
      ...g.world,
      tiles: g.world.tiles.map((t, i) =>
        i < 4 ? { ...t, building: { type: "house", level: 1 } } : t,
      ),
    },
    journey: { claimed: [], baseline: { house: 3, shop: 2 } },
    undo: { dummy: true },
  };
  const next = claimGoal(g);
  assert.equal(next.money, g.money + 100);
  assert.equal(next.undo, null);
  assert.deepEqual(next.journey.claimed, ["homes"]);
  assert.notEqual(currentGoal(next).id, "homes");
  assert.deepEqual(deserialize(serialize(next)).journey, next.journey);
});
test("le bilan arrive à trois ans, fige le résultat et garde le mode libre ouvert", () => {
  const game = createGame({ seed: 7 });
  assert.equal(
    finishJourney({ ...game, month: 35 }).journey.finished,
    undefined,
  );
  const end = finishJourney({ ...game, month: 36 });
  assert.equal(end.speed, 0);
  assert.equal(end.journey.finished, true);
  assert.equal(finishJourney(end), end);
  assert.deepEqual(
    deserialize(serialize(end)).journey.result,
    end.journey.result,
  );
  const free = startMode({ ...game, month: 50 }, "sandbox");
  assert.equal(finishJourney(free), free);
  assert.equal(free.money, 100000);
  assert.ok(free.unlocked.includes("tram-stop"));
});
