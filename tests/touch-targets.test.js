// Cibles tactiles (docs/MOBILE.md, non négociable) : sur l'écran de référence (412 × 915, DPR 2,625) et sur
// un petit Android (360 × 740), tout ce qui se touche dans l'interface HTML mesure ≥ 48 × 48 px CSS, la barre
// d'onglets ≥ 56 px, les chiffres des jauges ≥ 18 px, le corps ≥ 14 px, les mentions ≥ 12 px, et la page ne
// déborde pas en largeur. Trois états sont mesurés : la feuille du catalogue ouverte (cartes ≥ 64 px, barres de
// demande), une tuile en main (pastille + ✕), un fantôme affiché (bandeau + ✓ 56 px + ✕ 48 px) ; plus la fiche
// d'une case. Mesuré dans Chromium (Playwright, SwiftShader) sur dev.html servi par un petit serveur local ; si
// Playwright ou son navigateur manquent, le test est sauté (les vérifications statiques sont dans
// tests/style.test.js). Les erreurs de console sont aussi relevées : une erreur de page ou d'interface fait
// échouer le test ; celles du pipeline des modèles 3D (« THREE.… », ressources de assets/models/ absentes)
// sont seulement signalées (diagnostic), comme un démarrage du rendu en échec : l'interface se mesure quand
// même, et le garde-fou doit alors afficher un message lisible. Le rendu lui-même est mesuré par tools/measure.mjs,
// le parcours de jeu par tools/play.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { ROOT } from '../tools/build.js';

const SCREENS = [
  { name: 'Pixel 7', width: 412, height: 915, dpr: 2.625 },
  { name: '360 × 740', width: 360, height: 740, dpr: 3 },
];
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.ico': 'image/x-icon',
};

/** Petit serveur statique sur ROOT (dev.html a besoin de node_modules/three). */
function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const abs = normalize(join(ROOT, path === '/' ? 'index.html' : path));
    if (!abs.startsWith(ROOT) || !existsSync(abs) || !statSync(abs).isFile()) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(abs)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(abs).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

async function launchChromium() {
  try {
    const { chromium } = await import('playwright');
    return await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  } catch (err) {
    return { skip: String(err && err.message ? err.message : err) };
  }
}

/** Mesures dans la page : cibles, barres, textes, débordement. `label` nomme l'état mesuré. */
function measureInPage(label) {
  const vis = (n) => {
    const cs = getComputedStyle(n);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') return false;
    const r = n.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && !n.closest('#loading') && !n.closest('[hidden]') && !n.closest('[aria-hidden="true"]:not(#action)');
  };
  const targets = [...document.querySelectorAll('#ui button, #ui [role="button"], #ui a[href], #ui input, #ui select, #ui .card')].filter(vis);
  const small = targets
    .map((n) => ({ state: label, sel: `${n.tagName.toLowerCase()}${n.id ? `#${n.id}` : ''}${n.className ? `.${String(n.className).trim().split(/\s+/).join('.')}` : ''}`, w: n.getBoundingClientRect().width, h: n.getBoundingClientRect().height }))
    .filter((t) => t.w < 47.99 || t.h < 47.99);
  const fs = (sel) => [...document.querySelectorAll(sel)].filter(vis).map((n) => parseFloat(getComputedStyle(n).fontSize));
  const size = (sel) => { const n = document.querySelector(sel); return n && vis(n) ? [n.getBoundingClientRect().width, n.getBoundingClientRect().height] : null; };
  const tabbar = document.querySelector('#tabbar');
  const hud = document.querySelector('#hud');
  return {
    label,
    targets: targets.length,
    small,
    tabbarH: tabbar ? tabbar.getBoundingClientRect().height : 0,
    hudH: hud ? hud.getBoundingClientRect().height : 0,
    tabs: tabbar ? tabbar.querySelectorAll('.tab').length : 0,
    gaugeValues: fs('.gauge-value'),
    secondary: fs('.gauge-label, .gauge-delta, .tab-label, .hud-date, .card-price, .demand-value'),
    body: fs('.toast-text, .sheet-hint, .card-title, .rotate-text, .action-title, .action-sub, .demand-label, .alert-text, .tile-sheet p, .cond-text'),
    speed: size('#speed'),
    ok: size('#action .action-ok'),
    x: size('#action .action-x'),
    cards: [...document.querySelectorAll('.card')].filter(vis).map((n) => n.getBoundingClientRect().height),
    actionOpen: !!document.querySelector('#action.is-open'),
    actionTitle: (document.querySelector('#action .action-title') || {}).textContent || '',
    sheetOpen: !!document.querySelector('#sheet-layer.is-open'),
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    ready: !!(window.__tiletown && window.__tiletown.ready),
    failed: document.documentElement.classList.contains('boot-failed'),
    errorText: (document.querySelector('.loading-error') || {}).textContent || '',
    // Troncature (« … ») au sous-pixel : largeur réelle du texte (Range) contre celle de sa boîte.
    truncated: [...document.querySelectorAll('.gauge-label, .tab-label, .card-title, .action-title, .sheet-title')].filter(vis).filter((n) => {
      const range = document.createRange();
      range.selectNodeContents(n);
      return range.getBoundingClientRect().width > n.getBoundingClientRect().width + 0.01;
    }).map((n) => `${n.textContent} (${n.className})`),
    canvasSize: (() => { const c = document.querySelector('#scene'); return c ? [c.width, c.height] : null; })(),
    placement: window.__tiletown && window.__tiletown.placement ? window.__tiletown.placement.state : null,
  };
}

/** Case libre où un quartier se pose sans surcoût, la plus proche de la mairie (dans la page). */
function freeTileInPage(id) {
  const t = window.__tiletown;
  if (!t || !t.ready || !t.game) return null;
  const w = t.game.world;
  const c = { x: Math.floor(w.cols / 2), y: Math.floor(w.rows / 2) };
  const out = [];
  for (let y = 0; y < w.rows; y++) {
    for (let x = 0; x < w.cols; x++) {
      const tile = w.tiles[y * w.cols + x];
      if (tile.building || (tile.terrain !== 'grass' && tile.terrain !== 'meadow')) continue;
      const res = t.canPlace(x, y, id);
      if (!res || !res.ok) continue;
      out.push({ x, y, d: Math.abs(x - c.x) + Math.abs(y - c.y), extra: (res.clearing || 0) + ((res.path && res.path.length) || 0) });
    }
  }
  out.sort((a, b) => a.extra - b.extra || a.d - b.d);
  return out[0] || null;
}

test('cibles tactiles ≥ 48 px, onglets ≥ 56 px, ✓ 56 px, textes lisibles (Chromium, 412 × 915 et 360 × 740)', { timeout: 180000 }, async (t) => {
  assert.ok(existsSync(join(ROOT, 'dev.html')), 'dev.html absent : lancer « node tools/build.js »');
  const browser = await launchChromium();
  if (browser.skip) {
    t.skip(`Playwright / Chromium indisponible : ${browser.skip}`);
    return;
  }
  const { server, port } = await serve();
  try {
    for (const s of SCREENS) {
      const context = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: s.dpr, isMobile: true, hasTouch: true });
      const page = await context.newPage();
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      await page.goto(`http://127.0.0.1:${port}/dev.html?stats=1&seed=7&nosw&new=1`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => (window.__tiletown && window.__tiletown.ready) || document.documentElement.classList.contains('boot-failed'), null, { timeout: 60000 }).catch(() => {});
      const states = [];
      // 1. Feuille du catalogue ouverte (cartes, barres de demande).
      await page.click('#tabbar .tab--habitat').catch(() => {});
      await page.waitForTimeout(450);
      states.push(await page.evaluate(measureInPage, 'catalogue'));
      const ready = states[0].ready;
      if (ready) {
        // 2. Tuile en main : la carte « Quartier » replie la feuille, la pastille et son ✕ apparaissent.
        await page.click('.card[data-id="house"]').catch(() => {});
        await page.waitForTimeout(350);
        states.push(await page.evaluate(measureInPage, 'en main'));
        // 3. Fantôme sur une case libre : bandeau de résumé, ✓ (56 px) et ✕ (48 px).
        const free = await page.evaluate(freeTileInPage, 'house');
        if (free) {
          await page.evaluate(({ x, y }) => window.__tiletown.placement.preview(x, y), free);
          await page.waitForTimeout(200);
          states.push(await page.evaluate(measureInPage, 'fantôme'));
        } else t.diagnostic(`${s.name} : aucune case libre pour le fantôme`);
        // 4. Fiche d'une case (la mairie) : conditions, bouton Démolir absent (mairie) ; puis une case bâtie quelconque.
        await page.evaluate(() => { window.__tiletown.placement.drop(); const c = window.__tiletown.game.world; window.__tiletown.tileSheet.open(Math.floor(c.cols / 2), Math.floor(c.rows / 2)); });
        await page.waitForTimeout(350);
        states.push(await page.evaluate(measureInPage, 'fiche'));
        await page.evaluate(() => window.__tiletown.sheets.close());
      }
      await context.close();

      const tolerated = errors.filter((e) => (/assets\/models\//.test(e) && /404|Failed to load resource/.test(e)) || /^THREE\./.test(e) || /BatchedMesh|BufferGeometryUtils/.test(e));
      const real = errors.filter((e) => !tolerated.includes(e) && !/^pageerror:.*(THREE\.|BatchedMesh)/.test(e));
      if (tolerated.length) t.diagnostic(`${s.name} : ${tolerated.length} erreur(s) du pipeline des modèles 3D tolérée(s) (ex. ${tolerated[0].slice(0, 120)})`);
      assert.deepEqual(real, [], `${s.name} : erreurs de console`);
      const m = states[0];
      if (!m.ready) {
        t.diagnostic(`${s.name} : rendu non démarré (${m.errorText.slice(0, 160) || 'sans message'}) — interface mesurée quand même`);
        assert.ok(m.failed && m.errorText.length > 10, `${s.name} : en cas d'échec, le garde-fou doit afficher un message lisible`);
      }
      for (const st of states) {
        assert.deepEqual(st.truncated, [], `${s.name} (${st.label}) : libellés tronqués`);
        assert.deepEqual(st.small, [], `${s.name} (${st.label}) : cibles < 48 px`);
        assert.ok(st.secondary.every((v) => v >= 12), `${s.name} (${st.label}) : mentions ≥ 12 px (${st.secondary})`);
        assert.ok(st.body.every((v) => v >= 14), `${s.name} (${st.label}) : corps ≥ 14 px (${st.body})`);
        assert.ok(st.scrollW <= st.innerW, `${s.name} (${st.label}) : la page déborde en largeur (${st.scrollW} > ${st.innerW})`);
        assert.ok(st.speed && st.speed[0] >= 48 && st.speed[1] >= 48, `${s.name} (${st.label}) : bouton vitesse ${st.speed} < 48 px`);
      }
      assert.ok(m.sheetOpen, `${s.name} : la feuille du catalogue s'ouvre`);
      assert.ok(m.targets >= 12, `${s.name} : ${m.targets} cibles mesurées (jauges, vitesse, onglets, cartes)`);
      assert.ok(m.cards.length >= 1 && m.cards.every((h) => h >= 64), `${s.name} : cartes ≥ 64 px (${m.cards})`);
      assert.equal(m.tabs, 7, `${s.name} : sept onglets`);
      assert.ok(m.tabbarH >= 56, `${s.name} : barre d'onglets ${m.tabbarH} px < 56`);
      assert.ok(m.hudH >= 48 && m.hudH <= 140, `${s.name} : barre du haut ${m.hudH} px`);
      assert.ok(m.gaugeValues.length === 4 && m.gaugeValues.every((v) => v >= 18), `${s.name} : chiffres des jauges ≥ 18 px (${m.gaugeValues})`);
      assert.ok(m.canvasSize && m.canvasSize[0] <= s.width * 2 + 2, `${s.name} : pixel ratio du canvas plafonné à 2 (${m.canvasSize})`);
      if (ready) {
        const hand = states.find((st) => st.label === 'en main');
        assert.ok(hand && hand.actionOpen && !hand.sheetOpen, `${s.name} : la carte touchée replie la feuille et ouvre la barre d'action`);
        assert.equal(hand.placement, 'hand');
        assert.match(hand.actionTitle, /Quartier/, `${s.name} : pastille « en main : Quartier »`);
        assert.ok(hand.x && hand.x[0] >= 48 && hand.x[1] >= 48, `${s.name} : bouton ✕ ${hand.x}`);
        const ghost = states.find((st) => st.label === 'fantôme');
        if (ghost) {
          assert.equal(ghost.placement, 'ghost');
          assert.ok(ghost.ok && ghost.ok[0] >= 56 && ghost.ok[1] >= 56, `${s.name} : bouton ✓ ${ghost.ok} < 56 px`);
          assert.ok(ghost.x && ghost.x[0] >= 48 && ghost.x[1] >= 48, `${s.name} : bouton ✕ ${ghost.x}`);
          assert.match(ghost.actionTitle, /Quartier · 60 \$/, `${s.name} : résumé du coût`);
        }
        const sheet = states.find((st) => st.label === 'fiche');
        assert.ok(sheet && sheet.sheetOpen, `${s.name} : la fiche s'ouvre`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
});
