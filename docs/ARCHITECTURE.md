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
    layers.js             rampes, légendes et normalisation des quatre calques
    analysis.js           coloration géographique partagée du sol, des bâtiments et des rues
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
  roadVersion: 2,                  // migration des anciens quadrillages au chargement
  avenues: { h: Uint8Array, v: Uint8Array }, // même indexation ; 1 = axe principal
  traffic: { h: Float32Array, v: Float32Array }
}
```

Fonctions pures attendues :

- `grid.js` : `index(world, x, y)`, `inBounds(world, x, y)`, `neighbors4(world, x, y)`, `neighbors8(...)`, `edgeH(world, x, y)`, `edgeV(world, x, y)` (indices), `edgesOfTile(world, x, y)` → `{ n, s, e, w }` (indices + orientation).
- `worldgen.js` : `generateWorld({ seed, cols, rows, map: 'valley' })` → `world`. Rivière continue d'un bord à l'autre avec `flow`, 1 à 2 lacs, massifs de forêt, prairies, champs, collines ; la mairie est posée au centre sur de l'herbe, raccordée à rien (c'est le point de départ du réseau).
- `blocks.js` : découpage déterministe par graine en îlots de 2×2, 3×2 ou 2×3 ; façades périphériques, exceptions de desserte près de l'eau, passages piétons et raccords aux trottoirs. Les bords de carte peuvent tronquer un îlot.
- `roads.js` : `rebuildRoads(world, { connect, reset })` conserve les chaussées existantes et recalcule les passages. `connect` raccorde les villes générées/migrées ; `reset` supprime l'ancien quadrillage sauf les ponts (et les anciens quais strictement nécessaires à une maison enclavée). `connectTile(world, x, y)` rend `{ ok, path, cost, bridges, yaw }` : façade complète et Dijkstra sur le périmètre des îlots. Une desserte dans l'îlot est autorisée en dernier recours près d'un obstacle. Le réseau part des vraies rues de la mairie ; un coin isolé ne donne pas accès. `computeTraffic` n'emprunte que rues/ponts ; `streetGraph({ pedestrian: true })` ajoute les passages pour les habitants.
- `game.js` facture uniquement les nouvelles chaussées annoncées, conserve l'orientation du fantôme, sérialise `roadVersion` et `avenues` et migre les anciennes sauvegardes sans débit. L'annulation restaure aussi le classement des rues.

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

Chaque GLB normalisé : échelle appliquée, compressé meshopt, centré sur l'origine, posé sur y = 0, **sans aucune texture** — toutes les couleurs sont cuites dans l'attribut `COLOR_0` (un seul matériau blanc par modèle).

Les couleurs sont attribuées **par rôle**, pas par rapprochement de teinte (`tools/import-models.js`) : chaque aplat de la texture-palette du kit est classé (toiture, toiture-terrasse, façade, soubassement, menuiserie, vitrage, végétation, tronc, roche, métal, sol, accent) d'après sa couleur d'origine, sa hauteur dans la boîte englobante, l'orientation moyenne de ses faces et le profil du kit (`KIT_ROLE_PROFILES`, `tools/model-map.js`, surchargeable par modèle avec `profile`), puis reçoit une teinte de la sous-palette de ce rôle (`src/data/palette.js`), tirée avec l'identifiant du modèle comme graine : deux variantes d'un même type ont des toits et des façades différents. Le manifeste garde la légende dans `models.<id>.roles` (`{ rôle: teinte }`), et `palette` liste les 41 teintes des modèles (24 du jeu + 17 réservées aux modèles).

Un modèle peut aussi porter des **détails de caractère** (`details` dans `tools/model-map.js`) : débord de toiture, corniche, cheminée, porche, lucarne, édicule de toit, en primitives biseautées posées APRÈS la mise à l'échelle, repérées par `atRel` (fraction de la boîte englobante) et `slice` (tranche de hauteur dont on mesure l'emprise).

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

Un parcours automatisé Playwright (`tools/play.mjs`) : charger, sélectionner une carte du catalogue, poser une maison sur une case libre (l'argent baisse du prix, la façade est raccordée au réseau), poser une forêt plantée, démolir, annuler, passer la vitesse à ×4 et attendre un mois (recettes encaissées, événement de saison au 3e mois), recharger la page (la partie est restaurée). Cibles tactiles ≥ 48 px ; 0 erreur console ; appels de dessin ≤ 60 avec le fantôme affiché.

## 10. Écologie : air, eau, faune, sols (étape 4)

Les formules viennent de `docs/GAME_DESIGN.md` §5. Tout est calculé **à chaque tick de mois**, jamais par image. Les champs par case sont des `Float32Array` de `cols × rows` réutilisés d'un mois à l'autre (aucune allocation dans le chemin chaud).

### 10.1 État (`src/core/ecology.js`, pur)

```js
eco = {
  air:   Float32Array,   // 0 = pur … 100 = irrespirable, par case
  water: Float32Array,   // 0 = claire … 100 = polluée (rivière, lac, nappe mêlés : la valeur « de la case »)
  fauna: Float32Array,   // 0 … 100 : biodiversité locale
  soil:  Float32Array,   // fertilité des champs, 0 … 100 (70 au départ ; 0 ailleurs)
  patches: [ { id, habitat: 'forest'|'meadow'|'wetland'|'lake', cells: [i], size, connectedTo: [id] } ],
  species: { deer: { present: true, since: 4, cells: [i] }, heron: {...}, ... },
  scores: { air, water, fauna, soil, nature },    // 0 … 100, `nature` = agrégat §7.1
  alerts: { smog: 0, algae: 0, flood: 0, heat: 0 } // compteurs de mois consécutifs au-dessus du seuil
}
```

Fonctions (chacune pure, `eco` réutilisé en place par `stepEcology` qui renvoie le même objet mis à jour) :

- `createEcology(world)` → `eco` (champs à zéro, fertilité 70 sur les champs, patches et espèces calculés).
- `stepEcology(eco, world, { month, season })` → `{ eco, events }` : une passe mensuelle complète, dans cet ordre : air, eau, patches et faune, sols, espèces, scores, alertes.
- `airStep`, `waterStep`, `faunaStep`, `soilStep`, `speciesStep` exportées pour les tests.
- `findPatches(world)` → liste de parcelles d'habitat contiguës (8 voisins), avec leurs liaisons par corridor (chaîne de cases nature de tout type) ; une **arête de rue à trafic ≥ 3 coupe la contiguïté** entre les deux cases qu'elle sépare, sauf passage à faune (`wildlife-crossing`, à ajouter au catalogue).
- `speciesSummary(eco)` → `[ { id, label, present, since, hint } ]` pour le carnet.

**Air** (§5.1) : émissions par case (centrale 20, usine 12, commerce 2, bureaux 2, quartier niveau 3 : 2, plus 0,5 × trafic des arêtes riveraines), puits (forêt 6, parc 4, zone humide 3, verger 2, prairie 1, lac 1 : `airSink` de `terrain.js` et une table pour les bâtiments), puis diffusion `0,6·A + 0,4·moyenne(voisins)`, vent dominant `+0,15·(A du voisin au vent − A)`, dissipation `×0,97`.

**Eau** (§5.2) : la rivière transporte vers l'aval (`flow`) : `R = clamp(0,8·R[amont] + rejets − dépollution)` ; le lac accumule (une valeur par lac, répartie sur ses cases) ; la nappe = moyenne locale. Rejets : usine 15, champ intensif 6 (3 avec haie), quartier sans station d'épuration à moins de 5 cases 4, champ bio 1. Dépollution : station −20, zone humide −8, ripisylve (forêt touchant l'eau) −4, lac −2.

**Faune** (§5.3) : `fauna = base(habitat) × (1 + 0,1·min(taille de parcelle, 10)) − 0,5·arêtes routières − (air + eau)/50`. Espèces emblématiques avec leurs seuils (cerf, héron, loutre, abeilles, chouette, hirondelle, renard : tableau de GAME_DESIGN §5.3), apparition au seuil, disparition après 15 mois à 20 % sous le seuil ; chaque espèce présente vaut +5 au score nature et nourrit le tourisme.

**Sols** (§5.4) : intensif rendement 1,5·F/100 et F −2 (−2 de plus si colline voisine sans haie) ; bio 0,9·F/100 (×1,2 avec abeilles) et F +1 ; jachère F +4 ; haie annule l'érosion et divise les rejets par 2.

**Scores** : `nature = 0,3·(100 − air moyen des quartiers) + 0,3·(100 − eau moyenne) + 0,25·min(100, 15·espèces) + 0,15·fertilité moyenne`.

**Alertes** (événements de `stepEcology`) : `smog` si l'air moyen des quartiers > 60 pendant 5 mois ; `algae` si un lac > 60 pendant 10 mois ; `flood` si moins de 20 % de zones humides le long de la rivière (probabiliste) ; `heat` si un quartier n'a aucun espace vert à 2 cases en été. Chaque alerte produit un événement `{ type: 'eco-alert', key, text, x, y, layer }` : l'interface peut centrer la carte et activer le bon calque.

### 10.2 Intégration dans la partie (`src/core/game.js`)

- `game.eco` créé par `createGame`, avancé dans `monthTick` **avant** le calcul des stats.
- `computeStats` lit `game.eco.scores` : `nature` devient le vrai score (la formule provisoire de l'étape 3 disparaît) ; le bonheur d'un quartier perd 1 point par tranche de 10 d'air au-dessus de 40 et la santé baisse avec la nappe au-dessus de 40 ; les recettes des commerces sont multipliées par `1 + tourisme/100` (tourisme = espèces + lac propre + forêts) ; le rendement des champs suit la fertilité et la pollinisation.
- `describeTile` ajoute `eco: { air, water, fauna, soil, species: [ids] }` pour la fiche.
- `serialize` / `deserialize` : les champs de `eco` sont sauvegardés (tableaux) et restaurés ; version portée à 2 avec migration depuis 1 (recalcul complet).

### 10.3 Rendu (`src/render3d/`)

- `r.setLayer(kind, values)` existe déjà : l'interface lui passe `game.eco.air`, `.water` ou `.fauna`. Ajouter `LAYER_RAMPS` pour `soil`, une **légende** (min/max) renvoyée par `r.layerInfo(kind)`, et un mode daltonien (hachures) : `r.setLayerPattern(true)`.
- `src/render3d/species.js` : petites icônes 3D (billboards) au-dessus des parcelles où une espèce est présente, et pilotage de la faune animée : les acteurs `deer`, `heron`, `otter`, `bee`, `swallow`, `owl`, `fox` ne sont créés que si l'espèce est présente dans `eco.species` (contrat avec `src/core/actors.js` : `createActors(world, seed, { species })`).
- Effets d'ambiance liés à l'écologie : voile gris au-dessus des quartiers quand l'air est mauvais (brume instanciée, réutilise `effects.js`), lac qui verdit quand l'eau se dégrade (teinte du matériau d'eau selon `water`).

### 10.4 Interface (`src/ui/`)

- Onglet **Calques** : feuille avec quatre choix (Aucun, Air, Eau, Faune) + légende colorée + bascule hachures ; le calque choisi reste actif jusqu'à ce qu'on le coupe.
- Tap sur la jauge **Nature** : fiche détaillée (air, eau, faune, sols, espèces présentes et manquantes avec leur condition en une phrase).
- **Carnet des espèces** : liste illustrée (icône, nom, phrase de condition, date de première apparition) ; une espèce qui arrive déclenche un toast chaleureux et une entrée dans le carnet.
- Alertes `eco-alert` en bandeau avec bouton **Voir** : centre la carte sur la case et active le calque concerné.

### 10.5 Critères (étape 4)

`tools/play-eco.mjs` : partir d'une partie neuve, poser une usine au bord de la rivière, avancer 6 mois, vérifier que l'eau en aval se dégrade et que l'air monte sous le vent ; poser une station d'épuration, vérifier l'amélioration ; raser une forêt et vérifier que le cerf disparaît ; vérifier qu'un calque s'affiche avec sa légende et que l'alerte smog propose « Voir ». Plus : `node --test tests/` vert, `node tools/build.js --check` à jour, appels de dessin ≤ 60 avec un calque actif, et `node tools/simulate.js` qui montre une partie « tout bétonner » qui s'effondre et une partie équilibrée qui prospère.

## 11. Carrière, tutoriel et beauté (étape 5)

Retour de l'utilisateur (2026-10-05) : « on démarre directement avec une ville, il faut une carrière avec tuto » et « le jeu n'est pas très beau ».

### 11.1 Carrière (`src/core/career.js`, `src/data/levels.js`, purs)

La partie ne commence plus par une ville toute faite : **on arrive sur une vallée vierge avec une mairie**, et on apprend en jouant.

```js
career = {
  version: 1,
  levelId: 'vallee-1',
  unlocked: ['vallee-1'],                    // niveaux ouverts
  stars: { 'vallee-1': 2 },                  // 0 à 3 par niveau
  tiles: ['house', 'shop', ...],             // catalogue débloqué, persistant d'un niveau à l'autre
  seen: ['pose', 'roads', 'time', ...]       // leçons déjà vues (le tutoriel ne se répète pas)
}
```

`src/data/levels.js` : une liste ordonnée de niveaux. Chacun :

```js
{ id: 'vallee-1', title: 'La première vallée', subtitle: 'Apprendre à bâtir',
  map: 'valley', seed: 101, cols: 12, rows: 16, years: 3,
  money: 500, unlock: ['house', 'shop', 'field', 'park'],   // ce que ce niveau ajoute au catalogue
  tutorial: 'base',                                          // identifiant du scénario (null = aucun)
  goals: [ { id: 'pop', label: '120 habitants', kind: 'population', target: 120 },
           { id: 'nature', label: 'Nature ≥ 70', kind: 'nature', target: 70 } ],
  stars: [ { label: 'Finir l’année 3', test: 'goals' },
           { label: 'Nature ≥ 80', kind: 'nature', target: 80 },
           { label: '200 habitants sans exode', kind: 'population', target: 200, noExodus: true } ] }
```

Cinq niveaux au moins : `vallee-1` (tutoriel, large et facile), `riviere` (pont et aval à protéger), `bocage` (champs et abeilles), `coteau` (collines, routes chères), `grande-vallee` (carte 16 × 24, tout débloqué). Fonctions : `createCareer()`, `startLevel(career, levelId)` → `game`, `evaluateGoals(game, level)` → `[ { id, label, done, value, target } ]`, `evaluateStars(game, level)` → `{ count, details }`, `finishLevel(career, levelId, stars)` → `career`, `serializeCareer` / `deserializeCareer`.

Le mode **bac à sable** garde `starterTown: true`, tout débloqué, sans objectif.

### 11.2 Tutoriel (`src/core/tutorial.js`, pur)

Un scénario est une liste de **leçons** ; chacune attend une condition et propose une action. Le tutoriel ne bloque jamais le jeu : il guide.

```js
{ id: 'pose', title: 'Poser un quartier',
  text: 'Touchez Habitat, puis Quartier, puis une case verte près de la mairie.',
  highlight: { kind: 'tab', id: 'habitat' } | { kind: 'tile', x, y } | { kind: 'gauge', id: 'nature' },
  done: (game) => countBuildings(game, 'house') >= 1,
  reward: { money: 0, text: 'Les rues se tracent toutes seules autour de vos îlots.' } }
```

`nextLesson(scenario, game, seen)` → la leçon courante ou null ; `lessonDone(lesson, game)`. Scénario `base` (dix leçons) : poser un quartier, voir les rues, lancer le temps, regarder les jauges, poser un commerce (emplois), poser une école (évolution), découvrir le calque Air, poser un parc, voir une espèce arriver, atteindre l'objectif. Textes courts, chaleureux, jamais culpabilisants.

### 11.3 Interface (`src/ui/`)

- **Écran titre** (`src/ui/title.js`) : nom du jeu, trois boutons (Reprendre, Carrière, Bac à sable), et un lien Options. Affiché au premier lancement et par le bouton menu.
- **Carte de carrière** (`src/ui/career-map.js`) : les niveaux en liste verticale (téléphone), chacun avec son titre, ses étoiles gagnées et son état (verrouillé, ouvert, terminé).
- **Bandeau d'objectifs** en jeu : une ligne discrète sous les jauges, dépliable, qui montre les objectifs et leur avancement.
- **Tutoriel** (`src/ui/tutorial-ui.js`) : bulle en bas de l'écran avec le texte de la leçon et un bouton « Compris » ; surbrillance de l'élément visé (onglet, case via `r.setHighlight`, jauge) ; se range dès que la leçon est faite.
- **Fin de niveau** (`src/ui/level-end.js`) : étoiles obtenues, objectifs atteints, score, boutons Rejouer et Niveau suivant.

### 11.4 Beauté du rendu : plan de l'utilisateur (2026-10-05)

Diagnostic : **l'aspect cubique vient du terrain et de l'organisation du décor**, pas de la lumière. Objectif : une petite vallée miniature, douce et légèrement illustrée. On garde la grille carrée pour construire, mais elle devient très peu visible dans le paysage.

| Priorité | Chantier | Fichiers principaux |
|---|---|---|
| 1 | Terrain continu, collines et berges | `src/render3d/ground.js` |
| 2 | Arbres plus doux et bosquets moins réguliers | `src/render3d/buildings.js`, `assets/models/` |
| 3 | Couleurs et silhouettes des bâtiments | `tools/model-map.js`, `tools/import-models.js`, `src/data/palette.js` |
| 4 | Trottoirs, virages et abords des maisons | `src/render3d/roads.js`, `src/render3d/buildings.js` |
| 5 | Lumière, ombres et eau | `src/render3d/renderer.js`, `src/render3d/ground.js` |

**1. Terrain continu.** Aujourd'hui chaque case terrestre est une boîte et les collines sont les mêmes boîtes plus hautes, d'où les marches rocheuses carrées. À la place : collines arrondies et continues sur plusieurs cases avec quelques affleurements rocheux ; berges en pente, aux contours irréguliers et aux virages doux ; transitions progressives entre prairie, forêt et terre ; herbe aux variations de couleur qui traversent les limites des cases. Plusieurs cases de forêt doivent lire comme une seule forêt : arrondir chaque carré séparément redonnerait un plateau de pavés. La grille reste affichée **localement pendant la construction**, pour la précision (`ground.setGridHint(cells | null)`). `surfaceHeight(world, x, y)` reste exporté et exact ; `heightAt(x, z)` est ajouté pour les positions continues.

**2. Silhouettes des arbres.** Feuillages plus ronds, composés de plusieurs volumes légèrement irréguliers ; arbres jeunes, moyens et grands mélangés ; bosquets qui débordent d'une case à l'autre ; lisières avec arbustes, petites clairières et herbes ; mouvement de vent très discret. But : casser les alignements et les silhouettes répétées sans multiplier les détails minuscules.

**3. Personnalité des bâtiments.** Toits terracotta, ardoise et brun doux ; façades crème et pastel ; arêtes légèrement biseautées pour accrocher la lumière ; débords de toiture, porches, cheminées, quelques lucarnes ; plusieurs silhouettes par type. Une silhouette reconnaissable et une belle palette valent mieux que des fenêtres en plus. La cohérence de palette est gardée, mais par **attribution de rôle** (toiture, façade, végétation…) et non par simple recherche de la couleur la plus proche.

**4. Abords des rues.** Sans changer la règle de jeu : angles de trottoir arrondis, contraste adouci entre chaussée, trottoir et parcelle, arbres de rue et petites plantations ponctuelles, entrées de maison, virages arrondis là où le réseau le permet. Regrouper plusieurs bâtiments dans de plus grands îlots serait une évolution plus profonde, car elle toucherait au fonctionnement des routes.

**5. Lumière, après les formes.** Ombres plus douces ; léger assombrissement au pied des bâtiments et sous les arbres pour les ancrer au sol ; ambiance chaude avec des zones ombragées plus fraîches ; eau aux variations plus discrètes (les bandes claires répétées attirent trop l'œil).

**Méthode** : valider le style sur une petite scène de référence (une rivière courbe, une colline douce, un bosquet, trois maisons) avant de refaire le reste. Chaque chantier mesure appels de dessin, triangles et temps par image, avant et après.

### 11.5 Critères (étape 5)

`tools/play-career.mjs` : démarrer une carrière neuve → vallée vierge avec la seule mairie, bulle du tutoriel visible ; suivre les trois premières leçons par gestes réels ; vérifier l'avancement des objectifs ; forcer l'atteinte des objectifs et vérifier l'écran de fin avec ses étoiles ; vérifier que le niveau suivant s'ouvre et que le catalogue débloqué est conservé ; recharger et retrouver la carrière. Plus : `node --test tests/` vert, build à jour, et les captures des variantes visuelles.


### Livraison de la refonte du 2026-10-05

- `ground.js` utilise un maillage continu pour la terre et pour l’eau : relief interpolé, berges inclinées, rivière sinueuse et grille locale pendant la pose. Les calques écologiques restent actifs.
- Les variantes de bâtiments, les feuillus, conifères et arbustes sont chargés depuis les GLB enrichis de `main`. `buildings.js` et `roads.js` gèrent leurs abords. Les 22 aperçus du catalogue sont régénérés depuis ces modèles. La lumière du soir et le rendu ACES restent disponibles.
- `career.js` gère les cinq niveaux, les étoiles et les déblocages. `career-session.js` prépare les parties et réunit les anciennes carrières embarquées dans la partie avec la clé séparée `tiletown.career`, en conservant le meilleur progrès. `journey.js` conserve les huit missions avec primes uniques.
- Les écrans titre, carte et résultat ainsi que les objectifs et le tutoriel utilisent les composants de `main`. Le résultat arrive quand les objectifs sont atteints ou après trois ans ; il permet aussi de continuer la même vallée en mode libre. La fin est sauvegardée et restaurée après rechargement.
- `experience.js` apporte l’habillage mobile, les raccourcis de construction, le carnet et les réglages. `audio.js` déverrouille musique et effets après un geste, et mémorise les préférences. Les trois MP3 sont chargés et cachés à la demande.
- Contrôles reproductibles : `npm test`, `npm run check`, `npm run review:mobile`, `node tools/play-career.mjs`. Les parcours couvrent la pose tactile, les primes, les trois premières leçons, le passage à la vallée suivante et la reprise des étoiles après rechargement.


### Calques lisibles et architecture de bourg — 2026-10-05

- `analysis.js` partage une texture RGBA de la taille de la carte entre les matériaux du sol, de l’eau, des rues et des bâtiments. Le shader retrouve la case depuis la position mondiale, y compris pour les instances et les `BatchedMesh`. L’éclairage conserve du relief ; les hachures restent disponibles. Aucun appel de dessin supplémentaire pour le calque.
- Les données du moteur sont toujours interprétées sur **0 à 100**, y compris lorsque toutes les valeurs sont inférieures à 1. Air : turquoise → rouge ; eau : bleu → rouge ; faune : sable → vert ; sols : brun → vert. Couper le calque restaure la palette naturelle.
- `ui/layers.js` laisse une légende au-dessus de la carte, avec bornes et moyenne ; le toucher d’une case affiche sa valeur. La légende disparaît pendant l’ouverture d’une feuille et laisse les deux outils flottants accessibles à 360 px. Le bouton « Voir la carte colorée » referme le sélecteur.
- `tools/architecture.js` définit 21 modèles originaux exportés en GLB : six maisons, six immeubles, trois commerces, deux bureaux, mairie, école, clinique et marché. Le pipeline accepte les profils convexes extrudés (pignons, mansardes et portes cintrées). Les identifiants existants sont conservés ; les variantes supplémentaires sont reliées au catalogue. Un import partiel conserve les textes de licence si les kits bruts sont absents.
- Emprise des bâtiments : environ 0,65 unité après l’échelle de rendu de 0,76. Rues résidentielles de 0,18 unité (0,26 avec trottoirs), axes principaux de 0,26 (0,34 avec trottoirs) ; caméra mobile à 6,5 unités de largeur. Les 22 aperçus de construction sont rendus depuis les GLB courants.
- `npm run review:layers` compare les pixels réellement dessinés, suit les boutons tactiles des quatre calques, vérifie les valeurs 0 / 0,8 / 100, les hachures, le retour aux couleurs naturelles et la disposition à 360 px. Les captures sont produites dans `artifacts/layers/`.

### Quartiers continus (2026-10-05)

Les 21 GLB d'architecture ne portent plus de socle ni de clôture périphérique ; les pelouses et dallages sont instanciés avec des dimensions adaptées aux rues réellement présentes. Les maisons se décalent de 0,045 unité vers leur rue résidentielle, et leur jardin arrière reçoit deux plantations. Les passages sont placés au-dessus des pelouses pour éviter la superposition de faces. Arbres et bancs complètent le cœur d'îlot. Les cinq types de nœuds de rue existent aux deux largeurs ; seules les voies principales portent un marquage axial.

Validation spécifique : `node --test tests/blocks.test.js` (îlot de six maisons, accès réel, coûts, migration, ponts, annulation, géométrie des rues, 150 graines) et `node tools/review-blocks.mjs` (six poses tactiles sur la version publiée, prix/angles vérifiés, captures 412×915 et 360×740, rechargement). Les cinq vallées restent gagnables en trois ans ; le parcours simulé peut désormais obtenir trois étoiles sur Rivière et Bocage grâce à la réduction des charges et de la fragmentation, sans changer les seuils de carrière.
