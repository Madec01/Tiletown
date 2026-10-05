#!/usr/bin/env node
// Parcours de validation réel sur le build publié, serveur local sur :8000.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({
  args: [
    "--no-sandbox",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const outDir = process.env.TILETOWN_REVIEW_DIR || "artifacts/review";
const base = process.env.TILETOWN_REVIEW_URL || "http://localhost:8000";
const errors = [],
  report = [];
mkdirSync(outDir, { recursive: true });
try {
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/?new=1&seed=12345&nosw");
  await page.waitForFunction(() => window.__tiletown?.ready, null, {
    timeout: 60000,
  });
  await page.screenshot({ path: `${outDir}/welcome.png` });
  await page.locator('.title-btn[data-action="career"]').click();
  await page.locator('.level-play[data-level="vallee-1"]').click();
  // Le parcours guidé est couvert par play-career ; ici, on contrôle les raccourcis et les primes.
  await page.evaluate(() => window.__tiletown.setSpeed(0));
  const initial = await page.evaluate(() => ({
    money: window.__tiletown.game.money,
    count: window.__tiletown.world.tiles.filter(
      (t) => t.building?.type === "house",
    ).length,
  }));
  await page
    .getByRole("button", { name: "Construire : Quartier", exact: true })
    .click();
  const target = await page.evaluate(() => {
    const t = window.__tiletown;
    const options = [];
    for (let y = 0; y < t.world.rows; y++)
      for (let x = 0; x < t.world.cols; x++) {
        const c = t.canPlace(x, y, "house");
        if (!c?.ok) continue;
        const p = t.renderer.camera.toScreen(x + 0.5, 0, y + 0.5);
        if (p.x < 30 || p.x > 330 || p.y < 300 || p.y > 635) continue;
        options.push({ x, y, px: p.x, py: p.y, cost: c.cost });
      }
    return options.sort((a, b) => a.cost - b.cost)[0];
  });
  assert.ok(target, "case constructible accessible au doigt");
  await page.touchscreen.tap(target.px, target.py);
  assert.equal(
    await page.evaluate(
      () =>
        window.__tiletown.world.tiles.filter(
          (t) => t.building?.type === "house",
        ).length,
    ),
    initial.count,
    "premier tap = aperçu",
  );
  await page.locator(".action-ok").click();
  assert.equal(
    await page.evaluate(
      () =>
        window.__tiletown.world.tiles.filter(
          (t) => t.building?.type === "house",
        ).length,
    ),
    initial.count + 1,
    "confirmation = construction",
  );
  const placedMoney = await page.evaluate(() => window.__tiletown.game.money);
  assert.equal(placedMoney, initial.money - target.cost);
  await page.getByRole("button", { name: /^Annuler/ }).click();
  assert.equal(
    await page.evaluate(() => window.__tiletown.game.money),
    initial.money,
    "annulation rembourse",
  );
  await page.touchscreen.tap(target.px, target.py);
  await page.locator(".action-ok").click();
  await page.getByRole("button", { name: "Lâcher", exact: true }).click();
  await page.evaluate(() => window.__tiletown.tutorial.stop());
  await page.locator(".mission").click();
  await page
    .getByRole("button", { name: "Recevoir 100 $", exact: true })
    .click();
  assert.equal(
    await page.evaluate(() => window.__tiletown.game.money),
    placedMoney + 100,
    "prime unique",
  );
  assert.ok(await page.evaluate(() => window.__tiletown.career().seen.includes('pose')), 'la pose valide la leçon et la mémorise');
  await page.locator('#sheet-close').click();
  const saved = await page.evaluate(() => {
    window.__tiletown.save();
    return {
      money: window.__tiletown.game.money,
      claimed: window.__tiletown.game.journey.claimed,
    };
  });
  await page.getByRole("button", { name: "Réglages", exact: true }).click();
  await page.locator(".setting-toggle").filter({ hasText: "Musique" }).click();
  assert.equal(
    await page.evaluate(() => window.__tiletown.audio.settings.music),
    false,
  );
  await page
    .locator(".setting-toggle")
    .filter({ hasText: "Lumière du soir" })
    .click();
  await page.locator("#sheet-close").click();
  await page.screenshot({ path: `${outDir}/evening.png` });
  await page.goto(base + "/?nosw");
  await page.waitForFunction(() => window.__tiletown?.ready);
  assert.deepEqual(
    await page.evaluate(() => ({
      money: window.__tiletown.game.money,
      claimed: window.__tiletown.game.journey.claimed,
    })),
    saved,
  );
  assert.equal(
    await page.evaluate(() => window.__tiletown.audio.settings.music),
    false,
  );
  await page.locator('.title-btn[data-action="resume"]').click();
  await page.evaluate(() => window.__tiletown.tutorial.stop());
  await page.screenshot({ path: `${outDir}/mobile-412.png` });
  await page.click(".tab--nature");
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${outDir}/catalog.png` });
  await page.locator("#sheet-close").click();
  // La fin de niveau utilise la même API que le parcours de carrière de main.
  await page.evaluate(() => {
    const t = window.__tiletown;
    t.grant({ stats: { population: 220, nature: 85, happiness: 80 } });
    t.finishLevel();
  });
  await page.reload();
  await page.waitForFunction(() => window.__tiletown?.ready);
  await page.locator('.title-btn[data-action="resume"]').click();
  assert.equal(await page.locator('.end-stars').getAttribute('data-stars'), '3', 'bilan sauvegardé intact après rechargement');
  await page.locator('.end-btn[data-action="next"]').click();
  await page.evaluate(() => { window.__tiletown.experience.careerMap(); });
  assert.equal(await page.locator('.level-card[data-level="bocage"]').getAttribute('data-state'), 'locked');
  await page.screenshot({ path: `${outDir}/career.png` });
  await page.locator('.level-play[data-level="riviere"]').click();
  assert.equal(
    await page.evaluate(() => window.__tiletown.game.career.levelId),
    "riviere",
  );
  assert.equal(
    await page.evaluate(() => window.__tiletown.game.career.stars["vallee-1"]),
    3,
  );
  assert.equal(
    await page.evaluate(
      () => window.__tiletown.world.tiles.filter((t) => t.building).length,
    ),
    1,
  );
  await page.evaluate(() => {
    window.__tiletown.setSpeed(0);
    window.__tiletown.save();
  });
  await page.goto(base + "/?nosw");
  await page.waitForFunction(() => window.__tiletown?.ready);
  assert.equal(
    await page.evaluate(() => window.__tiletown.game.career.levelId),
    "riviere",
  );
  await page.locator('.title-btn[data-action="resume"]').click();
  report.push(
    "Carrière : bilan, trois étoiles, verrouillage, passage à la deuxième vallée, mairie seule et reprise après rechargement OK",
  );
  await page.evaluate(() => window.__tiletown.finishLevel());
  await page.locator('.end-btn[data-action="continue"]').click();
  assert.equal(await page.evaluate(() => window.__tiletown.mode), 'sandbox');
  await page.evaluate(() => window.__tiletown.showTitle());
  await page.locator('.title-btn[data-action="resume"]').click();
  assert.equal(await page.locator('.screen--end').count(), 0, 'continuer puis reprendre ne rouvre pas le bilan');
  await page.getByRole("button", { name: "Réglages", exact: true }).click();
  await page
    .getByRole("button", { name: "Nouvelle vallée", exact: true })
    .click();
  await page.getByRole("button", { name: /Une vallée libre/ }).click();
  assert.equal(
    await page.evaluate(() => window.__tiletown.game.mode),
    "sandbox",
  );
  assert.equal(await page.evaluate(() => window.__tiletown.game.money), 100000);
  assert.equal(await page.evaluate(() => window.__tiletown.career().stars['vallee-1']), 3, 'passer en mode libre conserve les étoiles');
  await page.evaluate(() => window.__tiletown.setSpeed(0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/sandbox-412.png` });
  report.push(
    "412 × 915 : accueil, aperçu tactile, confirmation, débit exact, annulation, prime, sauvegarde, son, soir, mode libre OK",
  );
  for (const [width, height] of [
    [360, 740],
    [430, 932],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(600);
    const metrics = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      screen: innerWidth,
      toolsVisible: [...document.querySelectorAll('.tab--tool')].every(n => {
        const r = n.getBoundingClientRect();
        return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
      }),
      small: [...document.querySelectorAll("button")]
        .filter((n) => {
          const r = n.getBoundingClientRect(),
            s = getComputedStyle(n);
          return (
            s.visibility !== "hidden" &&
            s.display !== "none" &&
            r.width > 0 &&
            r.height > 0 &&
            !n.closest("[hidden]") &&
            r.bottom > 0 &&
            r.top < innerHeight &&
            (r.width < 47.9 || r.height < 47.9)
          );
        })
        .map((n) => n.className),
    }));
    assert.equal(metrics.width, width, "pas de débordement horizontal");
    assert.deepEqual(metrics.small, [], "cibles de 48px");
    assert.ok(metrics.toolsVisible, 'outils de démolition et calques dans l’écran');
    await page.screenshot({ path: `${outDir}/mobile-${width}.png` });
    report.push(`${width} × ${height} : sans débordement, boutons ≥ 48 px`);
  }
  assert.deepEqual(errors, []);
  report.push("Aucune erreur JavaScript");
  console.log(report.join("\n"));
  writeFileSync(
    `${outDir}/report.json`,
    JSON.stringify({ report, errors }, null, 2),
  );
} finally {
  await browser.close();
}
