# Architecture de Tiletown

Organisation du code, contrats entre modules, conventions. Référence pour tout travail sur le code. La conception du jeu est dans `GAME_DESIGN.md`, les ressources dans `ASSETS.md`, le téléphone dans `MOBILE.md`.

## 1. Principes

- **Logique pure** dans `src/core` et `src/data` : aucun accès au DOM, à `window`, à three.js ; tout est testable sous Node (`node --test tests/`). Les fonctions renvoient un nouvel état ou un résultat `{ ok: true, ... }` / `{ ok: false, reason }`.
- **Rendu** dans `src/render3d` (three.js, WebGL2) : lit l'état, ne le modifie jamais. **Interface** dans `src/ui` (HTML/CSS par-dessus le canvas) : tout texte, tout bouton y vit ; la scène 3D ne contient jamais de texte.
- **Un paquet** : `node tools/build.js` (esbuild) produit `dist/game.<empreinte>.js` et `.css`, `index.html` depuis `src/index.template.html`, `dev.html`, et la liste de précache de `sw.js`. `dist/`, `index.html`, `dev.html`, `sw.js` sont committés (publication GitHub Pages). `node tools/build.js --check` échoue si c'est périmé.
- **Ressources** : uniquement CC0 / CC BY / OFL / MIT / Apache, chacune dans `CREDITS.md`. Les kits bruts sont téléchargés dans `assets/models/raw/` (ignoré par git) par `tools/fetch-kits.js` ; `tools/import-models.js` produit les GLB normalisés committés dans `assets/models/` et `assets/models/manifest.json`.
- Code, commentaires, textes en français ; identifiants (variables, fonctions, clés) en anglais.

## 2. Arborescence

```
src/
  main.js                 point d'entrée : crée l'état, le rendu, l'interface, la boucle
  loader.js               garde-fou de démarrage (erreurs, WebGL2 absent)
  index.template.html     page (jamais index.html à la main)
  pwa.js  sw-register     installation, mise à jour, Wake Lock
  core/                   logique pure
    rng.js                aléatoire à graine (mulberry32 / sfc32), sans état global
    grid.js               index(x, y), voisins, arêtes, bornes
    worldgen.js           génération de la vallée (rivière, lacs, forêts, prairies, champs, collines)
    roads.js              rues sur les arêtes : réseau, raccordement par plus court chemin, trafic
    game.js               état de partie, tick mensuel, pose/démolition (étapes suivantes)
    ecology.js            air, eau, faune, sols (étapes suivantes)
  data/
    tiles.js              catalogue des tuiles (familles, prix, modèles, terrains permis)
    terrain.js            types de terrain et leurs couleurs de palette
    palette.js            palette commune (24 teintes) et rôles
    balance.js            constantes d'équilibrage
  render3d/
    renderer.js           createRenderer(canvas, options) → API ci-dessous
    camera.js             caméra orthographique 3/4, pan, zoom continu, bornes (pur, testable)
    models.js             chargement du manifeste et des GLB (meshopt), cache, instances
    ground.js             sol : InstancedMesh des cases colorées par terrain, eau
    buildings.js          îlots : une InstancedMesh (ou BatchedMesh) par modèle
    roads.js              bandes de rue et carrefours sur les arêtes
    layers.js             calques air / eau / faune par couleurs d'instances
    actors.js             habitants, animaux, véhicules animés (étape 2)
  ui/
    gestures.js           toucher bref, appui long, glisser, pincer (adapté de Seve)
    hud.js  catalog.js  sheets.js  toasts.js  a11y.js
assets/
  models/                 GLB normalisés + manifest.json (committés)
  models/raw/             kits téléchargés (ignorés)
  ui/  audio/  fonts/
tools/
  build.js  fetch-kits.js  import-models.js  measure.mjs (mesures Playwright)
  sprites-proto/          plan B (pré-rendu)
tests/                    node:test ; tests/index.js importe chaque *.test.js
```

## 3. État du monde (`src/core`)

```js
// Indexation des cases : index = y * cols + x, x de 0 à cols-1 (ouest → est), y de 0 à rows-1 (nord → sud).
world = {
  seed: 12345,
  cols: 12, rows: 16,
  tiles: [ /* cols*rows */ {
    terrain: 'grass' | 'meadow' | 'forest' | 'field' | 'river' | 'lake' | 'wetland' | 'hill',
    flow: null | 'N' | 'S' | 'E' | 'W',      // sens d'écoulement, rivière seulement
    native: true | false,                      // nature d'origine (vaut plus qu'une nature plantée)
    building: null | { type: 'house', level: 1, variant: 0, yaw: 0 }   // type = id du catalogue
  } ],
  edges: {
    // arête horizontale entre (x, y-1) et (x, y) : h[y * cols + x], y de 0 à rows (rows+1 lignes)
    h: Uint8Array((rows + 1) * cols),
    // arête verticale entre (x-1, y) et (x, y) : v[y * (cols + 1) + x], x de 0 à cols
    v: Uint8Array(rows * (cols + 1)),
    // valeurs : 0 rien, 1 chemin, 2 rue, 3 pont ; trafic dans traffic.h / traffic.v (Float32Array mêmes tailles)
  },
  traffic: { h: Float32Array, v: Float32Array }
}
```

Fonctions pures attendues :

- `grid.js` : `index(world, x, y)`, `inBounds(world, x, y)`, `neighbors4(world, x, y)`, `neighbors8(...)`, `edgeH(world, x, y)`, `edgeV(world, x, y)` (indices), `edgesOfTile(world, x, y)` → `{ n, s, e, w }` (indices + orientation).
- `worldgen.js` : `generateWorld({ seed, cols, rows, map: 'valley' })` → `world`. Rivière continue d'un bord à l'autre avec `flow`, 1 à 2 lacs, massifs de forêt, prairies, champs, collines ; la mairie est posée au centre sur de l'herbe, raccordée à rien (c'est le point de départ du réseau).
- `roads.js` : `rebuildRoads(world)` → nouveau `world` : une rue (2) sur chaque arête entre deux cases bâties ; un chemin (1) entre bâti et nature ; rien entre deux natures. `connectTile(world, x, y)` → `{ ok, path: [edgeRefs], cost }` : plus court chemin sur le treillis d'arêtes jusqu'au réseau existant avec coûts (prairie 1, champ 1, forêt 3, rivière 5 → pont, lac et zone humide interdits). `computeTraffic(world)` : trajets quartier → emploi/commerce le plus proche, somme par arête.

## 4. Catalogue (`src/data/tiles.js`)

```js
export const TILES = [
  { id: 'house', family: 'habitat', label: 'Quartier', price: 60, upkeep: 5,
    levels: 3, models: { 1: ['house-a', 'house-b', 'house-c'], 2: ['building-small-a'], 3: ['building-tall-a'] },
    terrains: ['grass', 'meadow', 'field'], clearing: { forest: 80, field: 20 } },
  ...
];
```

Familles : `habitat`, `activity`, `services`, `infrastructure`, `nature`. Les identifiants de modèles renvoient au manifeste.

## 5. Manifeste des modèles (`assets/models/manifest.json`)

```json
{
  "palette": ["#f4efe6", "..."],
  "unit": "1 case = 1 unité, origine au centre de la case, y vers le haut, face +Z (sud)",
  "models": {
    "house-a": { "file": "house-a.glb", "kit": "kenney-city-kit-suburban", "source": "building-type-a.glb",
                 "scale": 1.0, "yaw": 0, "footprint": [1, 1], "license": "CC0", "url": "https://kenney.nl/assets/city-kit-suburban" }
  }
}
```

Chaque GLB normalisé : échelle appliquée, matériaux remplacés par des couleurs de la palette (sans texture), compressé meshopt, centré sur l'origine, posé sur y = 0.

## 6. API du rendu (`src/render3d/renderer.js`)

```js
const r = await createRenderer(canvas, { manifestUrl: 'assets/models/manifest.json', pixelRatioMax: 2 });
r.setWorld(world);              // reconstruit les instances (appel à chaque changement d'état)
r.setLayer('none' | 'air' | 'water' | 'fauna', valuesFloat32Array);   // calque coloré par case
r.resize(widthCss, heightCss, dpr);
r.camera.pan(dxCss, dyCss);     r.camera.zoomAt(factor, cxCss, cyCss);     r.camera.fitAll();
r.pick(clientX, clientY) → { x, y } | null   // déprojection du doigt sur le plan du sol (fonction pure dans camera.js)
r.render(dtSeconds);            // une image ; la boucle appelle à 60 i/s en interaction, 30 au repos
r.stats() → { calls, triangles, frameMs }    // renderer.info
r.dispose();
```

Modèles absents du manifeste : boîte colorée de remplacement, jamais une erreur bloquante.

## 7. Critères du prototype (étape 1, carte statique)

Mesurés par `tools/measure.mjs` (Playwright, Chromium SwiftShader, viewport 412 × 915, DPR 2,625) : ≤ 60 appels de dessin, ≤ 150 000 triangles pour 500 îlots, image rendue en moins de 16 ms sur GPU réel (indicatif sous SwiftShader), précache < 6 Mo, capture d'écran enregistrée dans `tools/measure-out/`.
