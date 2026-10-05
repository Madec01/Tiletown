#!/usr/bin/env node
// Contrôle des couleurs réellement dessinées et du parcours tactile des calques.
// Serveur local :8000 ; TILETOWN_REVIEW_URL / TILETOWN_REVIEW_DIR facultatifs.
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const base = process.env.TILETOWN_REVIEW_URL || 'http://localhost:8000';
const out = process.env.TILETOWN_REVIEW_DIR || 'artifacts/layers';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [], report = [];
function difference(a, b, region) {
  let sum = 0, changed = 0, n = 0;
  const [x0, y0, x1, y1] = region || [0, 0, a.width, a.height];
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * a.width + x) * 4;
    const d = [0, 1, 2].reduce((s, c) => s + Math.abs(a.data[i+c] - b.data[i+c]), 0);
    sum += d; n++; if (d > 30) changed++;
  }
  return { mean: sum / (3 * n), changed: changed / n };
}
try {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + '/?new=1&mode=sandbox&seed=12345&nosw');
  await page.waitForFunction(() => window.__tiletown?.ready, null, { timeout: 60000 });
  await page.evaluate(() => {
    const t = window.__tiletown;
    t.setSpeed(0); t.renderer.setAnimating(false); t.toasts.clearAll();
  });
  const capture = async () => PNG.sync.read(Buffer.from(await page.evaluate(() => {
    const r = window.__tiletown.renderer;
    r.invalidate(); r.render(0);
    return document.querySelector('#scene').toDataURL('image/png').split(',')[1];
  }), 'base64'));
  const natural = await capture();
  await page.screenshot({ path: `${out}/ville-portrait.png` });
  for (const kind of ['air', 'water', 'fauna', 'soil']) {
    await page.locator('.tab--layers').click();
    await page.locator(`.layer-btn--${kind}`).click();
    assert.equal(await page.locator(`.layer-btn--${kind}`).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: 'Voir la carte colorée', exact: true }).click();
    await page.waitForFunction(() => !document.body.classList.contains('has-sheet'));
    assert.ok(await page.locator('.analysis-legend').isVisible(), 'légende visible sur la carte');
    const delta = difference(natural, await capture(), [65, 330, 350, 530]);
    assert.ok(delta.mean > 12 && delta.changed > .55, `${kind} : la ville doit changer de couleur (${JSON.stringify(delta)})`);
    report.push({ kind, delta });
    await page.screenshot({ path: `${out}/${kind}.png` });
  }
  // Tap réel au milieu de la scène : valeur écologique de la case, pas seulement son terrain.
  await page.touchscreen.tap(205, 450);
  await page.waitForFunction(() => [...document.querySelectorAll('.toast')].some(n => /Sols\s*:\s*\d+\/100/.test(n.textContent)));
  await page.locator('.layer-pill-x').click();
  assert.ok(await page.locator('#layer-pill').isHidden());
  const restored = difference(natural, await capture());
  // Le vent des feuillages possède sa propre horloge : quelques pixels peuvent bouger.
  assert.ok(restored.mean < 1 && restored.changed < .02, `couleurs naturelles restaurées (${restored.mean})`);
  // Les valeurs réelles, même uniformes ou inférieures à 1, pilotent la teinte de la ville.
  const field = async value => {
    await page.evaluate(value => {
      const t = window.__tiletown;
      t.renderer.setLayer('air', new Float32Array(t.world.cols * t.world.rows).fill(value));
    }, value);
    return capture();
  };
  const clean = await field(0), slight = await field(.8), polluted = await field(100);
  assert.ok(difference(clean, slight).mean < 2, '0,8/100 reste proche de 0/100');
  const endpoints = difference(clean, polluted, [65, 330, 350, 530]);
  assert.ok(endpoints.mean > 40, 'la pollution change nettement la couleur des bâtiments et des rues');
  await page.evaluate(() => window.__tiletown.renderer.setLayerPattern(true));
  assert.ok(difference(polluted, await capture()).changed > .04, 'hachures visibles');
  await page.evaluate(() => { window.__tiletown.renderer.setLayerPattern(false); window.__tiletown.setLayer('air'); });
  // Petit téléphone : commandes, légende et outils ne se recouvrent pas.
  await page.setViewportSize({ width: 360, height: 740 });
  await page.waitForTimeout(300);
  const layout = await page.evaluate(() => {
    const p = document.querySelector('#layer-pill').getBoundingClientRect();
    const tool = document.querySelector('.tab--layers').getBoundingClientRect();
    return { right: p.right, left: p.left, toolRight: tool.right, scroll: document.documentElement.scrollWidth,
      buttons: [...document.querySelectorAll('#layer-pill button')].map(n => { const r = n.getBoundingClientRect(); return [r.width, r.height]; }) };
  });
  assert.ok(layout.left >= layout.toolRight && layout.right <= 360);
  assert.equal(layout.scroll, 360);
  assert.ok(layout.buttons.every(([w,h]) => w >= 48 && h >= 48), 'cibles tactiles de 48 px');
  await page.screenshot({ path: `${out}/air-360.png` });
  assert.deepEqual(errors, []);
  const result = { report, restored, endpoints, layout, errors };
  writeFileSync(`${out}/report.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
