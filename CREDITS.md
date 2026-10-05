# Crédits et licences des ressources

Toute ressource du dépôt est sous licence libre compatible avec une publication publique (CC0, CC BY, OFL, MIT, Apache) et figure ici : ressource → auteur → adresse → licence. Les règles sont dans `docs/ASSETS.md` §1. Les kits bruts ne sont pas committés (`assets/models/raw/`, ignoré par git) : `node tools/fetch-kits.js` les télécharge, `node tools/import-models.js` produit les GLB normalisés de `assets/models/`.

## Modèles 3D (`assets/models/*.glb`, `assets/models/manifest.json`)

Une partie des modèles dérive des kits ci-dessous, créés et distribués par **Kenney** (www.kenney.nl) sous **Creative Commons Zero (CC0 1.0)** : usage personnel, éducatif et commercial libre, sans obligation de crédit (crédit volontaire). Texte de licence : `assets/models/LICENSE-kenney.txt`. Ils sont normalisés par `tools/import-models.js` (échelle, orientation, assemblages, compression meshopt) et **recolorés par rôle** : l'import devine le rôle de chaque aplat (toiture, façade, soubassement, menuiserie, vitrage, végétation, tronc, roche, métal, sol, accent) d'après sa couleur d'origine, sa hauteur dans la boîte englobante et l'orientation de ses faces, puis tire une teinte dans la sous-palette de ce rôle (`src/data/palette.js`). Les couleurs sont cuites en couleurs de sommets : les GLB publiés ne contiennent plus aucune texture.

Toutes les pièces géométriques **créées par Tiletown** (rues étroites sur les arêtes, dalles, bassins, tas de compost, mâts, **famille d'arbres arrondis**, **détails de caractère des bâtiments**) sont des créations du projet, sous **CC0**.

| Ressource | Auteur | Adresse | Licence | Utilisée pour |
|---|---|---|---|---|
| City Kit Roads 2.1 | Kenney | https://kenney.nl/assets/city-kit-roads | CC0 1.0 | `road-straight`, `road-corner`, `road-t`, `road-cross`, `road-crosswalk`, `bridge` |
| City Kit Suburban 2.0 | Kenney | https://kenney.nl/assets/city-kit-suburban | CC0 1.0 | anciens modèles de maisons, remplacés par les créations Tiletown ci-dessous |
| City Kit Commercial 2.1 | Kenney | https://kenney.nl/assets/city-kit-commercial | CC0 1.0 | anciens modèles de ville, remplacés par les créations Tiletown ci-dessous |
| City Kit Industrial 2.0 | Kenney | https://kenney.nl/assets/city-kit-industrial | CC0 1.0 | `factory-a/b/c`, `wind-turbine`, `solar`, `power-plant`, `compost`, `water-tower`, `wastewater` |
| Nature Kit | Kenney | https://kenney.nl/assets/nature-kit | CC0 1.0 | `flowers`, `rock-a/b`, `crop-wheat`, `crop-corn`, fleurs du `park` (les arbres, arbustes et touffes d'herbe sont désormais des modèles Tiletown, ci-dessous) |
| Train Kit | Kenney | https://kenney.nl/assets/train-kit | CC0 1.0 | `tram`, rails du `tram-stop` |
| Car Kit 3.1 | Kenney | https://kenney.nl/assets/car-kit | CC0 1.0 | `car-a`, `car-b`, `truck`, `bus` (camionnette, provisoire) |
| Fantasy Town Kit 2.0 | Kenney | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | fontaine et banc du `park`, banc et lanterne du `tram-stop` |
| Modular Buildings | Kenney | https://kenney.nl/assets/modular-buildings | CC0 1.0 | anciens assemblages civiques, remplacés par les créations Tiletown ci-dessous |
| Mini Characters | Kenney | https://kenney.nl/assets/mini-characters | CC0 1.0 | téléchargé en réserve pour les habitants ; les habitants du jeu sont finalement des pantins Tiletown (`citizen-a/b/c`, ci-dessous) ; aucun GLB produit |

### Modèles créés par Tiletown (`tools/model-map.js`, `tools/architecture.js`, `tools/import-models.js`)

Ces modèles ne viennent d'aucun kit : ils sont construits en primitives (boîtes biseautées, cylindres à normales lisses, ellipsoïdes irréguliers) aux couleurs de la palette, puis exportés en GLB. Création du projet, **CC0**.

| Ressource | Auteur | Adresse | Licence | Détail |
|---|---|---|---|---|
| Architecture de bourg : `house-a/b/c/d/e/f`, `building-small-a/b/c`, `building-tall-a/b/c`, `shop-a/b/c`, `office-a/b`, `townhall`, `school`, `clinic`, `market` | création du projet | `tools/architecture.js` | CC0 1.0 | 21 GLB originaux : façades et vitrages, volets, balcons fleuris, toits à pans et mansardes, auvents, terrasses, équipements civiques ; primitives exportées et compressées par le pipeline, sans texture externe ; socles et clôtures périphériques retirés pour laisser place aux jardins partagés |
| Abords des quartiers : sols continus, passages, bancs et plantations | création du projet | `src/render3d/roads.js`, `src/render3d/buildings.js` | CC0 1.0 | géométries procédurales et assemblage des végétaux déjà crédités |
| Famille d'arbres arrondis : `tree-round-s/m/l`, `tree-tall-s/m/l`, `pine-s/m/l`, `shrub-a/b`, `grass-tuft-a/b`, `sapling`, plus les identifiants historiques `tree-a/b/c`, `pine-a/b`, `bush` | création du projet | ce dépôt | CC0 | houppiers en deux à quatre ellipsoïdes lisses et légèrement déformés, troncs fuselés et un peu penchés, verts voisins tirés dans `FOLIAGE_COLORS` ; 28 à 306 triangles par modèle |
| Détails de caractère des bâtiments : débords de toiture, corniches, cheminées, porches, lucarnes, édicules de toit | création du projet | ce dépôt | CC0 | boîtes **biseautées** posées après mise à l'échelle, repérées sur une tranche de hauteur du modèle |
| Rues étroites sur les arêtes : `road-edge-straight`, `road-edge-node-2/3/4` | création du projet | ce dépôt | CC0 | chaussée, trottoirs et pointillés en primitives |

### Modèles animés (étape 2 : vallée animée) — `tools/import-animated.js`, `tools/build-fauna.js`

Squelettes et clips conservés dans le GLB (`rig: skinned`), ou pantins en primitives animés par le code (`rig: puppet`). Les kits bruts sont téléchargés par `node tools/fetch-kits.js` (Gobkit : parcours de téléchargement gratuit d'itch.io ; Quaternius : dossier Google Drive officiel, puis miroirs GitHub du même fichier si le quota Drive est dépassé). Textes de licence : `assets/models/LICENSE-quaternius.txt`, `assets/models/LICENSE-gobkit.txt`.

| Ressource | Auteur | Adresse | Licence | Utilisée pour |
|---|---|---|---|---|
| Ultimate Animated Animals (glTF, février 2022) | Quaternius | https://quaternius.com/packs/ultimateanimatedanimals.html | CC0 1.0 | `deer` (Deer.gltf), `fox` (Fox.gltf), `cow` (Cow.gltf) : clips Idle, Walk, Gallop, Eating conservés ; couleurs cuites en couleurs de sommets, une seule primitive par animal |
| Free Animal Pack (vol. A) | Gobkit (Alsomind Tech Co., Ltd.) | https://gobkit.itch.io/gobkit-free-animal-pack | CC0 1.0 (LICENSE.txt du pack ; le champ `copyright` du GLB d'origine est vide) | `duck` (Duck.glb) : piste unique « all » 120 images à 24 i/s + clips idle / attack / dead / walk découpés ; atlas 512² quantifié vers la palette |
| Free Animal Pack Vol. 2 | Gobkit (Alsomind Tech Co., Ltd.) | https://gobkit.itch.io/gobkit-free-animal-pack-vol-2 | CC0 1.0 (idem) | `bee` (Bee.glb), `owl` (Owl.glb) |
| Pantins Tiletown : `citizen-a`, `citizen-b`, `citizen-c` (habitants), `heron`, `otter`, `swallow`, `cyclist` | création du projet, générés par `tools/build-fauna.js` à partir de primitives aux couleurs de la palette | ce dépôt | CC0 | habitants, héron, loutre, hirondelle, cycliste (nœuds nommés Body, Head, LegL… animés par procédure) |

Poids des GLB animés : squelettes 0,86 Mo (cerf 214 Ko, renard 237 Ko, vache 223 Ko, canard 58 Ko, abeille 56 Ko, chouette 56 Ko), pantins 127 Ko (11 à 36 Ko chacun) ; total ≈ 0,99 Mo (objectif < 1,5 Mo).

Non retenus : Quaternius « LowPoly Animated Animals » (mouton, FBX/OBJ/Blend seulement : pas de glTF, donc pas de `sheep`) ; modèles d'exemple de three.js (licence non précisée).

## Palette

Palette commune de 24 teintes (`PALETTE`, `src/data/palette.js`) : création Tiletown, CC0. Elle est prolongée, **pour les modèles 3D seulement**, par 17 teintes complémentaires (`MODEL_TINTS` : terracotta, ardoise foncée, brun doux, tuile claire, pastels bleu/vert/rose/ocre, pierre et enduit chauds, trois verts de feuillage, deux écorces, deux vitrages) et par des **sous-palettes par rôle** (`ROOF_COLORS`, `ROOF_FLAT_COLORS`, `WALL_COLORS`, `BASE_COLORS`, `FOLIAGE_COLORS`, `TRUNK_COLORS`, `TRIM_COLORS`, `GLASS_COLORS`, `ROCK_COLORS`, `METAL_COLORS`, `GROUND_COLORS`, `ACCENT_COLORS`). Création Tiletown, CC0.

## Interface, icônes, polices, audio

À compléter au fil des ajouts (voir le plan d'approvisionnement de `docs/ASSETS.md` §6) : chaque ressource ajoutée doit être inscrite ici avant d'être committée.

## Polices

| Ressource | Auteur | Source | Licence | Fichiers |
|---|---|---|---|---|
| Nunito (police variable, sous-ensembles latin et latin-ext) | Vernon Adams, Cyreal, Jacques Le Bailly | https://fonts.google.com/specimen/Nunito | SIL Open Font License 1.1 (`assets/fonts/OFL.txt`) | `assets/fonts/Nunito-latin*.woff2` |

## Icônes et images du projet

| Ressource | Auteur | Source | Licence | Fichiers |
|---|---|---|---|---|
| Icônes PWA (tuile verte et maison stylisée, couleurs de la palette) | création du projet, générée par `tools/make-icons.mjs` | ce dépôt | CC0 | `assets/icons/*.png` |

## Refonte « Une ville qui respire » — octobre 2026

- **Chill Out Theme** — Komiku, publié par Loyalty Freak Music — [source](https://opengameart.org/content/chill-out-theme) — **CC0 1.0**.
- **Apple Cider** — Zane Little Music — [source](https://opengameart.org/content/apple-cider) — **CC0 1.0**.
- **Exploring Town** — Spring Spring (Julie Damsgaard) — [source](https://opengameart.org/content/exploring-town) — **CC0 1.0**, option choisie parmi les licences proposées.
- Musiques complètes adaptées en MP3 128 kbit/s, 44,1 kHz, normalisation −18 LUFS / −2 dBTP. Sources et transformations dans `assets/audio/SOURCES.md`. Aucun extrait de Seve.
- Pictogrammes d’interface adaptés des tracés **Lucide** — [projet](https://lucide.dev), [source](https://github.com/lucide-icons/lucide) — **ISC**. Licence dans `assets/icons/LICENSE-lucide.txt`. Tracés embarqués dans `src/ui/icons.js`.
- Les **22 aperçus WebP** de `assets/previews/` sont des rendus des modèles GLB libres déjà crédités ci-dessus, réalisés par `tools/render-previews.mjs`. Aucune illustration de bâtiment provenant d’un autre jeu.
- Les abords et les sols continus sont produits par `src/render3d/buildings.js`, `roads.js` et `ground.js`. Les arbres proviennent des modèles libres enrichis crédités ci-dessus. Retours sonores de validation : synthèse Web Audio (`src/audio.js`).
