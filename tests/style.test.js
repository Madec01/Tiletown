// Feuilles de style : la palette CSS recopie la palette commune, les règles du téléphone sont là
// (100dvh, safe-area, cibles ≥ 48 px, onglets ≥ 56 px), et les polices déclarées existent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../tools/build.js';
import { PALETTE } from '../src/data/palette.js';

// Sans les commentaires : seules les règles comptent (un commentaire peut citer « 100vh »).
const css = readFileSync(join(ROOT, 'css/style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const fonts = readFileSync(join(ROOT, 'css/fonts.css'), 'utf8');
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

test('css/style.css : une variable --c-<rôle> par teinte de src/data/palette.js, même valeur', () => {
  const vars = Object.fromEntries([...css.matchAll(/--c-([a-z-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2].toLowerCase()]));
  for (const [role, hex] of Object.entries(PALETTE)) {
    assert.equal(vars[kebab(role)], hex.toLowerCase(), `--c-${kebab(role)} doit valoir ${hex}`);
  }
  const extra = Object.keys(vars).filter((k) => !Object.keys(PALETTE).map(kebab).includes(k));
  assert.deepEqual(extra, [], 'variables --c-* hors palette');
});

test('règles du téléphone : 100dvh (jamais 100vh seul), safe-area, pas de zoom involontaire', () => {
  assert.ok(css.includes('--app-h: 100dvh'), '--app-h doit valoir 100dvh');
  const vh = [...css.matchAll(/100vh/g)].length;
  assert.equal(vh, 1, '100vh ne sert qu’au repli @supports not (height: 100dvh)');
  assert.ok(/@supports not \(height: 100dvh\)/.test(css));
  for (const side of ['top', 'bottom', 'left', 'right']) assert.ok(css.includes(`env(safe-area-inset-${side}`), `safe-area-inset-${side}`);
  assert.ok(/#scene\s*\{[^}]*touch-action:\s*none/.test(css), 'le canvas doit avoir touch-action: none');
  assert.ok(/overscroll-behavior:\s*none/.test(css));
  assert.ok(/user-select:\s*none/.test(css));
});

test('cibles tactiles : boutons ≥ 48 px, onglets ≥ 56 px, cartes ≥ 64 px, texte ≥ 12 px', () => {
  const rule = (sel) => {
    const m = new RegExp(`(?:^|\\n)${sel.replace(/[.#]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(css);
    assert.ok(m, `règle ${sel} introuvable`);
    return m[1];
  };
  const minPx = (body, prop) => Number((new RegExp(`${prop}:\\s*(?:calc\\()?(\\d+)px`).exec(body) || [])[1] || 0);
  for (const sel of ['.btn', '.gauge', '.hud-speed', '.sheet-x', '.toast-go']) {
    assert.ok(minPx(rule(sel), 'min-height') >= 48 || minPx(rule(sel), 'height') >= 48, `${sel} : hauteur ≥ 48 px`);
  }
  assert.ok(minPx(rule('.tab'), 'min-height') >= 56, '.tab ≥ 56 px');
  assert.ok(minPx(rule('.tab'), 'min-width') >= 48, '.tab ≥ 48 px de large');
  assert.ok(minPx(rule('#tabbar'), 'min-height') >= 56, '#tabbar ≥ 56 px');
  assert.ok(minPx(rule('.card'), 'min-height') >= 64, '.card ≥ 64 px');
  // Aucune taille de texte sous 12 px (0.75rem) hors #stats (mesures, pointer-events: none).
  const sizes = [...css.replace(/#stats\s*\{[^}]*\}/, '').matchAll(/font-size:\s*([\d.]+)(rem|px)/g)].map((m) => (m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1])));
  const small = sizes.filter((s) => s < 12);
  assert.deepEqual(small, [], `tailles de texte < 12 px : ${small.join(', ')}`);
});

test('css/fonts.css : Nunito (OFL) en police variable, fichiers présents avec leur licence', () => {
  const files = [...fonts.matchAll(/url\('\.\.\/(assets\/fonts\/[^']+\.woff2)'\)/g)].map((m) => m[1]);
  assert.ok(files.length >= 1);
  for (const f of files) assert.ok(existsSync(join(ROOT, f)), `${f} manquant`);
  assert.ok(existsSync(join(ROOT, 'assets/fonts/OFL.txt')), 'licence OFL absente');
  assert.ok(/font-weight:\s*200 1000/.test(fonts), 'plage de graisses de la police variable');
  assert.ok(/'Nunito',\s*system-ui/.test(css), 'repli system-ui après Nunito');
});
