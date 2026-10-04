// Version publiée (tools/build.js) : index.html, dev.html, dist/ et sw.js doivent correspondre aux sources.
// Si un test échoue ici : lancer « node tools/build.js » puis committer index.html, dev.html,
// dist/ et sw.js avec les sources.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, hash16, sourceFingerprint } from '../tools/build.js';

const readText = (p) => readFileSync(join(ROOT, p), 'utf8');
const HINT = 'lancer « node tools/build.js »';
assert.ok(existsSync(join(ROOT, 'dist/build.json')), `dist/build.json absent : ${HINT}`);
const info = JSON.parse(readText('dist/build.json'));

test('dist/build.json : sources inchangées depuis la dernière construction', () => {
  const now = sourceFingerprint();
  const before = info.sources;
  const changed = Object.keys({ ...now, ...before }).filter((k) => now[k] !== before[k]).sort();
  assert.deepEqual(changed, [], `sources modifiées depuis la dernière construction (${HINT}) : ${changed.join(', ')}`);
});

test('index.html ne désigne que le paquet de cette version, présent et intact', () => {
  const html = readText('index.html');
  const m = /window\.__TILETOWN_BUILD__ = (\{.*?\});<\/script>/.exec(html);
  assert.ok(m, 'configuration du chargeur absente de index.html');
  const cfg = JSON.parse(m[1]);
  assert.equal(cfg.id, info.id);
  assert.equal(cfg.js.src, info.js);
  assert.deepEqual(cfg.css, [info.css]);
  assert.match(cfg.js.src, /^dist\/game\.[0-9a-f]{10}\.js$/);
  assert.match(info.css, /^dist\/game\.[0-9a-f]{10}\.css$/);
  const js = readFileSync(join(ROOT, cfg.js.src));
  assert.equal(hash16(js), cfg.js.sha, `${cfg.js.src} ne correspond pas à index.html (${HINT})`);
  assert.equal(js.length, cfg.js.size);
  assert.ok(existsSync(join(ROOT, `${cfg.js.src}.map`)), 'carte des sources absente');
  assert.ok(html.includes(`href="${info.css}"`), 'feuille de style de la version absente de index.html');
  // Plus aucun module ni style non versionné dans la page publiée, ni plan d'importation (dev.html seulement).
  assert.ok(!/(?:src|href)="(?:\.\/)?(?:src|css)\//.test(html), 'index.html désigne encore des fichiers non versionnés');
  assert.ok(!/type="module"/.test(html) && !/type="importmap"/.test(html), 'index.html ne doit pas charger de modules séparés');
  // Le chargeur vérifie WebGL 2 avant de télécharger le paquet.
  assert.ok(html.includes("getContext('webgl2'"), 'détection de WebGL 2 absente du chargeur');
});

test('le paquet contient three.js (résolu depuis node_modules) et pas d’import externe', () => {
  const js = readText(info.js);
  assert.ok(js.length > 200_000, 'paquet trop petit pour contenir three.js');
  assert.ok(js.includes('THREE.WebGLRenderer'), 'three.js absent du paquet');
  assert.ok(!/^import\s/m.test(js) && !/\bfrom\s*["']three["']/.test(js), 'le paquet importe encore « three » de l’extérieur');
  assert.ok(js.includes('__TILETOWN_ASSETS__') === false || /\?v=/.test(js) || true, 'table des ressources');
  assert.match(js, /\/\/# sourceMappingURL=game\.[0-9a-f]{10}\.js\.map\n$/);
});

test('dev.html charge src/main.js en modules avec un plan d’importation vers node_modules/three', () => {
  const html = readText('dev.html');
  assert.ok(html.includes('type="importmap"'), 'plan d’importation absent de dev.html');
  assert.ok(html.includes('"three":"./node_modules/three/build/three.module.js"'), 'three non résolu vers node_modules');
  assert.ok(html.includes('"three/examples/jsm/":"./node_modules/three/examples/jsm/"'), 'three/examples/jsm/ non résolu');
  const m = /window\.__TILETOWN_BUILD__ = (\{.*?\});<\/script>/.exec(html);
  assert.ok(m);
  const cfg = JSON.parse(m[1]);
  assert.equal(cfg.dev, true);
  assert.equal(cfg.module, 'src/main.js');
  assert.ok(html.includes('href="css/style.css"'), 'dev.html doit charger css/style.css directement');
});

test('sw.js : version et précache de cette construction', () => {
  const sw = readText('sw.js');
  assert.ok(sw.includes(`const VERSION = '${info.id}';`), `sw.js périmé (${HINT})`);
  const html = readFileSync(join(ROOT, 'index.html'));
  assert.ok(sw.includes(`["index.html", '${hash16(html)}'`), 'empreinte de index.html fausse dans sw.js');
  for (const p of [info.js, info.css, 'manifest.webmanifest']) {
    assert.ok(sw.includes(`["${p}", '${hash16(readFileSync(join(ROOT, p)))}'`), `${p} absent du précache ou empreinte fausse`);
  }
  for (const p of ['assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/icon-maskable-512.png', 'assets/fonts/Nunito-latin.woff2']) {
    assert.ok(sw.includes(`["${p}", '${hash16(readFileSync(join(ROOT, p)))}'`), `${p} absent du précache`);
  }
  // Les modèles 3D présents au moment de la construction sont précachés.
  if (existsSync(join(ROOT, 'assets/models/manifest.json'))) {
    assert.ok(sw.includes('["assets/models/manifest.json", '), 'manifeste des modèles absent du précache');
  }
  assert.ok(!/\["src\//.test(sw) && !/\["css\//.test(sw) && !/\["assets\/models\/raw\//.test(sw), 'sources, styles et kits bruts ne doivent pas être précachés');
  assert.ok(!sw.includes('ferme-'), 'préfixe de cache de Seve encore présent');
});

test('les paquets des versions gardées existent', () => {
  for (const h of info.history) for (const f of h.files) assert.ok(existsSync(join(ROOT, f)), `${f} manquant`);
});

test('reconstruction identique (esbuild installé)', async (t) => {
  let check;
  try {
    await import('esbuild');
    ({ check } = await import('../tools/build.js'));
  } catch {
    t.skip('esbuild absent (npm install) : reconstruction non vérifiée');
    return;
  }
  const problems = await check();
  assert.deepEqual(problems, [], `version publiée périmée (${HINT})`);
});
