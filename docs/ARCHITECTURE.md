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
- `roads.js` : `rebuildRoads(world)` → nouveau `world` : une rue (2) sur chaque arête d'une case bâtie (partagée entre voisins, de ceinture face à la nature) ; un chemin (1) autour d'une nature plantée ; rien entre deux natures. `connectTile(world, x, y)` → `{ ok, path: [edgeRefs], cost }` : plus court chemin sur le treillis d'arêtes jusqu'au réseau existant avec coûts (prairie 1, champ 1, forêt 3, rivière 5 → pont, lac et zone humide interdits). `computeTraffic(world)` : trajets quartier → emploi/commerce le plus proche, somme par arête.

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

## 8. Acteurs et animations (étape 2 : vallée animée)

### 8.1 État des acteurs (`src/core/actors.js`, pur)

Les acteurs vivent **à côté** du monde (ils ne sont pas sauvegardés) : `actors = createActors(world, rng)` puis `updateActors(actors, world, dt)` à chaque image (mutation en place autorisée pour ce chemin chaud, mais déterministe à graine égale : toute décision aléatoire passe par `actors.rng`).

```js
actors = {
  rng,                       // createRng(seed ^ 0xA11CE)
  list: [ {
    id: 7, kind: 'habitant' | 'deer' | 'fox' | 'duck' | 'heron' | 'otter' | 'bee' | 'swallow' | 'owl' | 'car' | 'truck' | 'bus' | 'tram',
    model: 'character-a' | 'deer' | ... ,   // identifiant du manifeste
    x, z,                    // position monde continue (unités ; la case (i, j) couvre [i, i+1] × [j, j+1])
    y,                       // hauteur (0 au sol ; oiseaux en vol > 0)
    yaw,                     // radians, 0 = face +Z (sud), sens horaire vu de dessus
    speed,                   // unités / s
    state: 'idle' | 'walk' | 'run' | 'fly' | 'swim' | 'hover' | 'drive',
    phase,                   // 0..1, phase d'animation (boucle)
    path: [ { x, z }, ... ], // points à atteindre (centres d'arêtes pour la rue, points d'habitat pour la faune)
    home: { x, y } | null,   // case d'origine (habitants, véhicules)
    ttl                      // secondes avant disparition / nouvelle intention (optionnel)
  } ],
  caps: { habitant: 60, vehicle: 20, animal: 24 }
}
```

Règles :
- **Habitants** : 2 par quartier de niveau 1 (4 au niveau 2, 6 au niveau 3), plafond 60 ; ils marchent sur les **arêtes de rue** (ligne de l'arête décalée de 0,12 u vers le trottoir droit) entre leur maison et l'emploi ou le commerce le plus proche (`shortestTrip` de `roads.js`), s'arrêtent 2 à 6 s à destination, repartent. Vitesse 0,6 u/s.
- **Véhicules** : sur les arêtes où `traffic > 0`, à droite (décalage 0,07 u), vitesse 1,2 u/s, plafond 20 ; `car-a`/`car-b` partout, `truck` entre usines et commerces, `bus` sur le trajet le plus long. Ils ralentissent derrière un autre véhicule (distance 0,4 u) et s'arrêtent 1 s aux nœuds à 3 ou 4 branches.
- **Faune**, selon l'habitat (recalculé à `setWorld`) : `deer` dans les massifs de forêt ≥ 4 cases (marche lente, pauses, 1 par massif, 2 si ≥ 8) ; `fox` en lisière de forêt et prairie ; `duck` sur lac et rivière (nage) ; `heron` sur les berges de zone humide ou de rivière (idle long, quelques pas, envol court de 3 à 5 s) ; `otter` dans la rivière (nage dans le sens de `flow`, plonge) ; `bee` au-dessus des prairies fleuries et des champs (vol en boucles à y ≈ 0,4) ; `swallow` au-dessus de la ville (vol en grandes boucles à y ≈ 1,5 à 2,5) ; `owl` perchée en lisière (idle). Plafond 24 au total, répartition proportionnelle aux habitats.
- Aucun acteur ne traverse un bâtiment : les piétons et véhicules restent sur les arêtes, la faune reste dans ses cases d'habitat (et l'eau pour les nageurs).

### 8.2 Modèles animés (extension du manifeste §5)

```json
"deer": { "file": "deer.glb", "kit": "quaternius-ultimate-animated-animals", "license": "CC0",
          "animated": true, "rig": "skinned", "clips": { "idle": "Idle", "walk": "Walk", "run": "Gallop" },
          "scale": 0.3, "yaw": 0, "footprint": [0.4, 0.8] }
"duck": { "file": "duck.glb", "kit": "gobkit-animal-pack-a", "animated": true, "rig": "skinned",
          "clipRanges": { "idle": [0, 29], "attack": [30, 59], "dead": [60, 89], "walk": [90, 119] }, "fps": 24 }
"heron": { "file": "heron.glb", "kit": "tiletown", "license": "CC0", "animated": true, "rig": "puppet",
           "parts": { "body": "Body", "neck": "Neck", "head": "Head", "legL": "LegL", "legR": "LegR", "wingL": "WingL", "wingR": "WingR" } }
"character-a": { "file": "character-a.glb", "kit": "kenney-mini-characters", "animated": true, "rig": "skinned",
                 "clips": { "idle": "idle", "walk": "walk", "run": "sprint" } }
```

- `rig: "skinned"` : squelette et clips dans le GLB ; le rendu clone le squelette (`SkeletonUtils.clone`) et joue le clip de `state`. Nombre d'instances **plafonné** (budget d'appels de dessin) : 12 animaux et 0 habitant en skinned ; au-delà, repli en pantin.
- `rig: "puppet"` : hiérarchie de nœuds rigides nommés (`parts`) sans squelette ; le rendu anime les nœuds par procédure (balancement des pattes, battement des ailes, hochement de tête, roulis) et dessine toutes les instances d'une même espèce par **`InstancedMesh` par pièce** (quelques appels pour toute l'espèce). Les habitants sont des pantins (corps, tête, 2 bras, 2 jambes) dérivés des Mini Characters ou construits en primitives.
- Modèles maison (héron, loutre, hirondelle, cycliste, chouette) : construits par `tools/build-fauna.js` à partir de primitives (boîtes, cônes, sphères aplaties) aux couleurs de la palette, exportés en GLB avec `parts`, licence CC0 Tiletown.

### 8.3 API du rendu

```js
// src/render3d/actors.js
const layer = createActorsLayer(models, { maxSkinned: 12 });
layer.setWorld(world);           // pré-calcule les lignes d'arêtes et les hauteurs du sol
layer.update(dt, actors);        // place et anime ; appelé avant render()
scene.add(layer.group);  layer.stats() → { skinned, puppets, calls }  layer.dispose()

// src/render3d/effects.js
const fx = createEffects(models, { palette });
fx.setWorld(world);              // fumée aux cheminées (usines, centrale), pales des éoliennes, plans d'eau
fx.update(dt, time);             // particules de fumée instanciées (≤ 2 appels), rotation des pales, écoulement de l'eau (shader : direction `flow`, vaguelettes, écume aux berges)
scene.add(fx.group);  fx.dispose()
```

`renderer.js` les intègre : `render(dt)` appelle `fx.update` et `actors.update` puis dessine ; `setAnimating(true)` tant qu'il y a des acteurs. La boucle de `main.js` tourne à 60 i/s en interaction, **30 i/s au repos** même si ça bouge, et s'arrête quand l'onglet est caché.

### 8.4 Critères du prototype (étape 2)

Mesurés par `tools/measure.mjs` (scénario « vallée animée », 60 habitants + 20 véhicules + 24 animaux + fumée) : ≤ 60 appels de dessin, ≤ 200 000 triangles, mise à jour CPU (`updateActors` + `layer.update` + `fx.update`) < 4 ms par image (indicatif sous SwiftShader), précache < 6 Mo, aucune erreur, et une vérification que les acteurs bougent (au moins 35 % des acteurs déplacés entre deux relevés à 2 s d'écart : les pauses des habitants, les cerfs à l'arrêt et les chouettes perchées font partie du tableau).

## 9. Partie, temps, pose et démolition (étape 3 : le prototype devient un jeu)

### 9.1 État de partie (`src/core/game.js`, pur)

```js
game = {
  version: 1, seed, world,                 // world : §3 (tuiles, arêtes, trafic)
  clock: 12.5,                             // secondes écoulées dans le mois courant (au temps de jeu)
  month: 0,                                // mois écoulés depuis le début (0 = mars, an 1) ; saison = floor(month / 3) % 4 (0 printemps … 3 hiver), année = floor(month / 12) + 1
  speed: 1,                                // 0 (pause), 0.5, 1, 2, 4 ; 1 mois = 30 s de jeu à vitesse 1 (MONTH_SECONDS = 30)
  money: 500,
  stats: { population, capacity, jobs, happiness, nature, energy: { need, have }, water: { need, have }, food: { need, have }, income, upkeep },
  demand: { habitat, activity, services },  // 0..1 : boussole du catalogue (ce qui manque)
  unlocked: ['house', 'shop', 'field', 'park', 'tree-planting', ...],   // entrées du catalogue disponibles
  natureBaseline: 83,                      // cases de nature native au départ (pour la jauge Nature provisoire)
  log: [ { month, type, text } ],          // derniers événements (≤ 50)
  undo: null | { game: <copie avant la dernière pose>, until: <clock absolu> }   // annulation possible 10 s
}
```

Fonctions pures (chacune renvoie un nouvel objet ; `world` n'est recopié que s'il change) :

- `createGame({ seed, cols, rows, starterTown })` → `game` (monde généré, rues reconstruites, trafic calculé, stats initiales).
- `advance(game, dtSeconds)` → `{ game, events }` : avance l'horloge de `dt × speed` ; à chaque mois franchi appelle `monthTick` ; `events` cumule les événements des mois franchis (0, 1 ou plusieurs).
- `monthTick(game)` → `{ game, events }` : encaisse recettes et entretien (GAME_DESIGN §6.4 : recettes par saison encaissées par tiers chaque mois, entretien 5/10/20 $ par niveau + 2 $ par segment de rue), arrivées et départs d'habitants (vers la capacité, +10 % de l'écart et au moins 2 si bonheur ≥ 40 ; exode −10 % si bonheur < 30 deux saisons de suite), recalcul des stats et de la demande ; **fin de saison** (mois multiple de 3) : évolutions (§6.7), événement `season` ; **fin d'année** : événement `year`. Faillite : événement `broke` si `money < −200` deux saisons de suite (pas de défaite bloquante dans ce prototype).
- `computeStats(game)` → `stats` : population, capacité (20/45/80 par niveau de quartier), emplois, énergie / eau / nourriture (produit vs consommé, catalogue), bonheur = 50 + moyenne des adjacences des quartiers (§6.6) + services − 10 par ressource en déficit − chômage (population > emplois × 1,2 → −10) ; `nature` provisoire = 60 % part de nature native conservée + 40 % part de cases de forêt/zone humide/prairie (l'écologie réelle arrive à l'étape 3 bis).
- `computeDemand(game)` → `{ habitat, activity, services }` dans [0, 1].
- `canPlace(game, x, y, tileId)` → `{ ok, cost, clearing, path, reason }` : catalogue débloqué, terrain permis (§4 `terrains`), case libre, défrichement (`clearingCost` de `terrain.js` : interdit = null), raccordement (`connectTile` ; coût des arêtes à construire : 10 $ par segment, pont 40 $), argent suffisant ; `reason` ∈ `locked | terrain | occupied | money | unreachable | out_of_bounds`.
- `place(game, x, y, tileId)` → `{ ok, game, cost, events }` : pose le bâtiment (famille nature : change le terrain, `native: false`), applique le tracé de raccordement, `rebuildRoads`, `computeTraffic`, oriente le bâtiment (`faceTowardRoad`), débite, mémorise `undo` (10 s), recalcule les stats.
- `demolish(game, x, y)` → `{ ok, game, cost }` : 10 $ ; le terrain devient `grass` (`native: false`) ; la mairie est indestructible.
- `undoLast(game)` → `game` (si `undo` encore valide) ; `setSpeed(game, speed)` ; `cycleSpeed(game)` (0 → 0,5 → 1 → 2 → 4 → 0).
- `describeTile(game, x, y)` → `{ terrainLabel, building: { label, level, family } | null, conditions: [ { label, met } ] (prochaine évolution), yields: { income, upkeep, jobs, capacity } }`.
- `serialize(game)` → objet JSON (tableaux typés convertis en tableaux) ; `deserialize(obj)` → `game` (versionné, migrations) ; `calendar(game)` → `{ month, season, seasonLabel, year, monthLabel }`.

Constantes dans `src/data/balance.js` : `MONTH_SECONDS = 30`, `SPEEDS = [0, 0.5, 1, 2, 4]`, `START_MONEY = 500`, `UNDO_SECONDS = 10`, coûts de rue, capacités par niveau, seuils de bonheur.

### 9.2 Rendu : fantôme et surbrillance (`src/render3d/ghost.js`, via `renderer.js`)

```js
r.setGhost({ x, y, tileId, ok: true | false | 'warn', path: [ { kind, x, y, value } ] } | null);
// modèle du catalogue en translucide (teinte verte / rouge / jaune), posé sur la case, orienté vers la rue la plus proche ;
// tracé de raccordement en pointillés sur les arêtes ; anneau de surbrillance sous la case.
r.setHighlight([ { x, y } ] | null);      // cases marquées (sélection, fiche)
```

Le fantôme est **un seul objet** (Mesh translucide + segments) mis à jour sans reconstruire le monde ; `setWorld` reste le chemin de mise à jour après une pose (reconstruction complète, suffisante à cette taille).

### 9.3 Interface (`src/ui`)

- `catalog.js` : feuille coulissante par famille (onglets existants), cartes (nom, prix, icône de famille, cadenas si verrouillé, grisée si trop cher), barres de demande en tête ; tap sur une carte → `hand = tileId`, la feuille se replie.
- `placement.js` : machine à états `idle | hand | ghost | confirm` : tap sur une case avec une tuile en main → fantôme via `canPlace` ; tap ailleurs → le fantôme se déplace ; tap sur la même case ou bouton ✓ → `place` ; bouton ✕ ou retour arrière → lâcher ; outil Démolir : fantôme rouge sur la case puis confirmation ; bandeau « Annuler » pendant 10 s après une pose.
- `hud.js` : jauges depuis `game.stats` (Population, Bonheur, Nature, Argent avec delta mensuel), date depuis `calendar(game)`, bouton pause / vitesse qui cycle `SPEEDS` et affiche ×½ ×1 ×2 ×4 ou ⏸.
- `sheet-tile.js` : fiche d'une case (appui long) : `describeTile` + bouton Démolir.
- `storage.js` : sauvegarde locale (`localStorage`, clé `tiletown.save`), à chaque mois et après chaque pose ; chargement au démarrage ; `?new=1` repart de zéro ; try/catch partout (navigation privée).
- `main.js` : boucle : `advance(game, dt)` chaque image (dt plafonné à 0,1 s), événements → toasts et bilans, `r.setWorld` quand `game.world` change de référence, `updateActors` avec `dt × speed`, HUD toutes les 250 ms.

### 9.4 Critères (étape 3)

Un parcours automatisé Playwright (`tools/play.mjs`) : charger, sélectionner une carte du catalogue, poser une maison sur une case libre (l'argent baisse du prix, une rue de ceinture apparaît), poser une forêt plantée, démolir, annuler, passer la vitesse à ×4 et attendre un mois (recettes encaissées, événement de saison au 3e mois), recharger la page (la partie est restaurée). Cibles tactiles ≥ 48 px ; 0 erreur console ; appels de dessin ≤ 60 avec le fantôme affiché.
