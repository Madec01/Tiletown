#!/usr/bin/env node
// Six constructions par gestes tactiles dans une vallée réelle, puis sauvegarde/rechargement.
// Serveur sur :8000 ; même build que GitHub Pages. Captures et rapport dans artifacts/blocks.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createGame, serialize } from '../src/core/game.js';
import { blockLayout } from '../src/core/blocks.js';
import { countEdges, networkConnected } from '../src/core/roads.js';
import { TERRAINS } from '../src/data/terrain.js';
import { TILES } from '../src/data/tiles.js';
const out = process.env.TILETOWN_REVIEW_DIR || 'artifacts/blocks';
const base = process.env.TILETOWN_REVIEW_URL || 'http://localhost:8000';
mkdirSync(out, { recursive: true });
const game = createGame({ seed: 12345, starterTown: false, money: 10000, unlocked: TILES.map(t => t.id) });
game.mode = 'sandbox'; game.speed = 0;
const w = game.world;
const eligible = blockLayout(w).blocks.filter(b => b.width === 3 && b.height === 2 && b.x > 1 && b.y > 1)
  .filter(b => Array.from({ length: 6 }, (_, i) => w.tiles[(b.y + Math.floor(i/3))*w.cols+b.x+i%3])
    .every(t => !t.building && TERRAINS[t.terrain].buildable));
eligible.sort((a,b) => Math.hypot(a.x+1-w.cols/2,a.y+.5-w.rows/2) - Math.hypot(b.x+1-w.cols/2,b.y+.5-w.rows/2));
const block = eligible[0]; assert.ok(block, 'un îlot constructible proche de la mairie');
const initial = { schema: 1, mode: 'sandbox', savedAt: Date.now(), state: serialize(game) };
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [], placements = [];
try {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + '/?new=1&mode=sandbox&seed=12345&nosw');
  await page.waitForFunction(() => window.__tiletown?.ready, null, { timeout: 60000 });
  await page.evaluate(() => { const t = window.__tiletown; t.setSpeed(0); t.toasts.clearAll(); t.renderer.setAnimating(false); });
  await page.screenshot({ path: `${out}/ville-portrait.png` });
  await page.addInitScript(state => {
    if (sessionStorage.getItem('blocks-fixture')) return;
    localStorage.setItem('tiletown.save', JSON.stringify(state));
    sessionStorage.setItem('blocks-fixture', '1');
  }, initial);
  await page.goto(base + '/?mode=sandbox&nosw');
  await page.waitForFunction(() => window.__tiletown?.ready, null, { timeout: 60000 });
  await page.evaluate(b => {
    const t = window.__tiletown;
    t.setSpeed(0); t.tutorial.stop(); t.renderer.camera.lookAt(b.x+1, b.y+.5, 6);
  }, block);
  for (let i = 0; i < 6; i++) {
    const target = { x: block.x+i%3, y: block.y+Math.floor(i/3), id: i === 5 ? 'shop' : 'house' };
    const before = await page.evaluate(target => {
      const t = window.__tiletown;
      t.placement.take(target.id);
      const check = t.canPlace(target.x, target.y, target.id);
      return { check, money: t.game.money, point: t.renderer.camera.toScreen(target.x+.5, 0, target.y+.5) };
    }, target);
    assert.ok(before.check.ok, JSON.stringify({ target, check: before.check, block }));
    await page.touchscreen.tap(before.point.x, before.point.y);
    await page.waitForFunction(() => window.__tiletown.placement.state === 'ghost');
    const ghost = await page.evaluate(() => window.__tiletown.placement.ghost);
    assert.equal(ghost.x, target.x); assert.equal(ghost.y, target.y);
    await page.locator('.action-ok').click();
    const after = await page.evaluate(target => {
      const t = window.__tiletown;
      return { money: t.game.money, building: t.world.tiles[target.y*t.world.cols+target.x].building };
    }, target);
    assert.equal(after.money, before.money - before.check.cost);
    assert.equal(after.building.type, target.id);
    assert.equal(after.building.yaw, before.check.yaw);
    placements.push({ ...target, cost: before.check.cost, streets: before.check.road.street, yaw: after.building.yaw });
  }
  const snapshot = await page.evaluate(() => {
    const t = window.__tiletown;
    t.placement.drop(); t.toasts.clearAll(); t.renderer.setAnimating(false); t.save();
    return { money: t.game.money, world: JSON.parse(localStorage.getItem('tiletown.save')).state.world };
  });
  assert.ok(networkConnected(snapshot.world));
  for (let dx = 0; dx < 3; dx++) assert.equal(snapshot.world.edges.h[(block.y+1)*w.cols+block.x+dx], 1, 'un passage au cœur du jardin');
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${out}/ilot-six-batiments.png` });
  await page.evaluate(() => {
    const camera = window.__tiletown.renderer.camera;
    camera.setState({ ...camera.state, pitch: 55*Math.PI/180 });
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${out}/jardin-interieur.png` });
  await page.evaluate(() => {
    const camera = window.__tiletown.renderer.camera;
    camera.setState({ ...camera.state, pitch: 35*Math.PI/180 });
  });
  await page.setViewportSize({ width: 360, height: 740 });
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 360);
  await page.screenshot({ path: `${out}/ilot-360.png` });
  await page.reload();
  await page.waitForFunction(() => window.__tiletown?.ready, null, { timeout: 60000 });
  const restored = await page.evaluate(() => ({ money: window.__tiletown.game.money, world: JSON.parse(localStorage.getItem('tiletown.save')).state.world }));
  assert.deepEqual(restored, snapshot, 'rues, façades et argent survivent au rechargement');
  assert.deepEqual(errors, []);
  const report = { block, placements, roads: countEdges(snapshot.world), savedAndReloaded: true, errors };
  writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
