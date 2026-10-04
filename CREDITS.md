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
| Mini Characters | Kenney | https://kenney.nl/assets/mini-characters | CC0 1.0 | téléchargé pour les habitants animés (étape 2) ; aucun GLB produit pour l'instant |

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
