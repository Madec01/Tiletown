# Crédits et licences des ressources

Toute ressource du dépôt est sous licence libre compatible avec une publication publique (CC0, CC BY, OFL, MIT, Apache) et figure ici : ressource → auteur → adresse → licence. Les règles sont dans `docs/ASSETS.md` §1. Les kits bruts ne sont pas committés (`assets/models/raw/`, ignoré par git) : `node tools/fetch-kits.js` les télécharge, `node tools/import-models.js` produit les GLB normalisés de `assets/models/`.

## Modèles 3D (`assets/models/*.glb`, `assets/models/manifest.json`)

Tous les modèles dérivent des kits ci-dessous, créés et distribués par **Kenney** (www.kenney.nl) sous **Creative Commons Zero (CC0 1.0)** : usage personnel, éducatif et commercial libre, sans obligation de crédit (crédit volontaire). Texte de licence : `assets/models/LICENSE-kenney.txt`. Les modèles ont été normalisés par `tools/import-models.js` (échelle, orientation, couleurs quantifiées vers la palette commune de 24 teintes, assemblages, compression meshopt) ; les primitives ajoutées par Tiletown (rues étroites sur les arêtes, dalles, bassins, tas de compost, mâts) sont elles aussi CC0.

| Ressource | Auteur | Adresse | Licence | Utilisée pour |
|---|---|---|---|---|
| City Kit Roads 2.1 | Kenney | https://kenney.nl/assets/city-kit-roads | CC0 1.0 | `road-straight`, `road-corner`, `road-t`, `road-cross`, `road-crosswalk`, `bridge` |
| City Kit Suburban 2.0 | Kenney | https://kenney.nl/assets/city-kit-suburban | CC0 1.0 | `house-a`, `house-b`, `house-c` |
| City Kit Commercial 2.1 | Kenney | https://kenney.nl/assets/city-kit-commercial | CC0 1.0 | `building-small-a/b`, `building-tall-a/b`, `shop-a/b`, `office-a` |
| City Kit Industrial 2.0 | Kenney | https://kenney.nl/assets/city-kit-industrial | CC0 1.0 | `factory-a/b`, `wind-turbine`, `solar`, `power-plant`, `compost`, `water-tower`, `wastewater` |
| Nature Kit | Kenney | https://kenney.nl/assets/nature-kit | CC0 1.0 | `tree-a/b/c`, `pine-a/b`, `bush`, `flowers`, `rock-a/b`, `crop-wheat`, `crop-corn`, arbres et fleurs du `park` |
| Train Kit | Kenney | https://kenney.nl/assets/train-kit | CC0 1.0 | `tram`, rails du `tram-stop` |
| Car Kit 3.1 | Kenney | https://kenney.nl/assets/car-kit | CC0 1.0 | `car-a`, `car-b`, `truck`, `bus` (camionnette, provisoire) |
| Fantasy Town Kit 2.0 | Kenney | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | `market` (étals, charrette, banc, lanterne), fontaine et banc du `park`, banc et lanterne du `tram-stop` |
| Modular Buildings | Kenney | https://kenney.nl/assets/modular-buildings | CC0 1.0 | `school`, `clinic`, `townhall` (assemblages) |
| Mini Characters | Kenney | https://kenney.nl/assets/mini-characters | CC0 1.0 | téléchargé en réserve pour les habitants ; les habitants du jeu sont finalement des pantins Tiletown (`citizen-a/b/c`, ci-dessous) ; aucun GLB produit |

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

Palette commune de 24 teintes (`src/data/palette.js`) : création Tiletown, CC0.

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
