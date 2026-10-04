// Cibles tactiles (docs/MOBILE.md, non négociable) : sur l'écran de référence (412 × 915, DPR 2,625) et sur
// un petit Android (360 × 740), tout ce qui se touche dans l'interface HTML mesure ≥ 48 × 48 px CSS, la barre
// d'onglets ≥ 56 px, les chiffres des jauges ≥ 18 px, le corps ≥ 14 px, les mentions ≥ 12 px, et la page ne
// déborde pas en largeur. Mesuré dans Chromium (Playwright, SwiftShader) sur dev.html servi par un petit serveur
// local ; si Playwright ou son navigateur manquent, le test est sauté (les vérifications statiques sont dans
// tests/style.test.js). Les erreurs de console sont aussi relevées : une erreur de page ou d'interface fait
// échouer le test ; celles du pipeline des modèles 3D (« THREE.… », ressources de assets/models/ absentes)
// sont seulement signalées (diagnostic), comme un démarrage du rendu en échec : l'interface se mesure quand
// même, et le garde-fou doit alors afficher un message lisible. Le rendu lui-même est mesuré par tools/measure.mjs.
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

/** Mesures dans la page : cibles, barres, textes, débordement. */
function measureInPage() {
  const vis = (n) => {
    const cs = getComputedStyle(n);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') return false;
    const r = n.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && !n.closest('#loading') && !n.closest('[hidden]');
  };
  const targets = [...document.querySelectorAll('#ui button, #ui [role="button"], #ui a[href], #ui input, #ui select, #ui .card')].filter(vis);
  const small = targets
    .map((n) => ({ sel: `${n.tagName.toLowerCase()}${n.id ? `#${n.id}` : ''}${n.className ? `.${String(n.className).trim().split(/\s+/).join('.')}` : ''}`, w: n.getBoundingClientRect().width, h: n.getBoundingClientRect().height }))
    .filter((t) => t.w < 47.99 || t.h < 47.99);
  const fs = (sel) => [...document.querySelectorAll(sel)].filter(vis).map((n) => parseFloat(getComputedStyle(n).fontSize));
  const tabbar = document.querySelector('#tabbar');
  const hud = document.querySelector('#hud');
  return {
    targets: targets.length,
    small,
    tabbarH: tabbar ? tabbar.getBoundingClientRect().height : 0,
    hudH: hud ? hud.getBoundingClientRect().height : 0,
    tabs: tabbar ? tabbar.querySelectorAll('.tab').length : 0,
    gaugeValues: fs('.gauge-value'),
    secondary: fs('.gauge-label, .tab-label, .hud-date, .card-price'),
    body: fs('.toast-text, .sheet-hint, .card-title, .rotate-text'),
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    ready: !!(window.__tiletown && window.__tiletown.ready),
    failed: document.documentElement.classList.contains('boot-failed'),
    errorText: (document.querySelector('.loading-error') || {}).textContent || '',
    // Troncature (« … ») au sous-pixel : largeur réelle du texte (Range) contre celle de sa boîte.
    truncated: [...document.querySelectorAll('.gauge-label, .tab-label, .card-title')].filter(vis).filter((n) => {
      const range = document.createRange();
      range.selectNodeContents(n);
      return range.getBoundingClientRect().width > n.getBoundingClientRect().width + 0.01;
    }).map((n) => `${n.textContent} (${n.className})`),
    canvasSize: (() => { const c = document.querySelector('#scene'); return c ? [c.width, c.height] : null; })(),
  };
}

test('cibles tactiles ≥ 48 px, onglets ≥ 56 px, textes lisibles (Chromium, 412 × 915 et 360 × 740)', { timeout: 120000 }, async (t) => {
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
      await page.goto(`http://127.0.0.1:${port}/dev.html?stats=1&seed=7&nosw`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => (window.__tiletown && window.__tiletown.ready) || document.documentElement.classList.contains('boot-failed'), null, { timeout: 60000 }).catch(() => {});
      // Feuille ouverte (cartes du catalogue) : mesurée aussi.
      await page.click('#tabbar .tab--habitat').catch(() => {});
      await page.waitForTimeout(400);
      const m = await page.evaluate(measureInPage);
      await context.close();

      const tolerated = errors.filter((e) => (/assets\/models\//.test(e) && /404|Failed to load resource/.test(e)) || /^THREE\./.test(e) || /BatchedMesh|BufferGeometryUtils/.test(e));
      const real = errors.filter((e) => !tolerated.includes(e) && !/^pageerror:.*(THREE\.|BatchedMesh)/.test(e));
      if (tolerated.length) t.diagnostic(`${s.name} : ${tolerated.length} erreur(s) du pipeline des modèles 3D tolérée(s) (ex. ${tolerated[0].slice(0, 120)})`);
      assert.deepEqual(real, [], `${s.name} : erreurs de console`);
      if (!m.ready) {
        t.diagnostic(`${s.name} : rendu non démarré (${m.errorText.slice(0, 160) || 'sans message'}) — interface mesurée quand même`);
        assert.ok(m.failed && m.errorText.length > 10, `${s.name} : en cas d'échec, le garde-fou doit afficher un message lisible`);
      }
      assert.deepEqual(m.truncated, [], `${s.name} : libellés tronqués`);
      assert.ok(m.targets >= 12, `${s.name} : ${m.targets} cibles mesurées (jauges, vitesse, onglets, cartes)`);
      assert.deepEqual(m.small, [], `${s.name} : cibles < 48 px`);
      assert.equal(m.tabs, 7, `${s.name} : sept onglets`);
      assert.ok(m.tabbarH >= 56, `${s.name} : barre d'onglets ${m.tabbarH} px < 56`);
      assert.ok(m.hudH >= 48 && m.hudH <= 140, `${s.name} : barre du haut ${m.hudH} px`);
      assert.ok(m.gaugeValues.length === 4 && m.gaugeValues.every((v) => v >= 18), `${s.name} : chiffres des jauges ≥ 18 px (${m.gaugeValues})`);
      assert.ok(m.secondary.every((v) => v >= 12), `${s.name} : mentions ≥ 12 px (${m.secondary})`);
      assert.ok(m.body.every((v) => v >= 14), `${s.name} : corps ≥ 14 px (${m.body})`);
      assert.ok(m.scrollW <= m.innerW, `${s.name} : la page déborde en largeur (${m.scrollW} > ${m.innerW})`);
      assert.ok(m.canvasSize && m.canvasSize[0] <= s.width * 2 + 2, `${s.name} : pixel ratio du canvas plafonné à 2 (${m.canvasSize})`);
    }
  } finally {
    await browser.close();
    server.close();
  }
});
