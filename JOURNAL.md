# Journal de Tiletown

Modifications, idées et bugs, du plus récent au plus ancien. À mettre à jour à chaque travail.

## 2026-10-04 — Création du dépôt et conception initiale

- Séance de réflexion sur le gameplay avec quatre agents : réutilisable dans Seve, jeux comparables, systèmes nature (air, eau, faune, sols), économie / boucle / routes automatiques / UX mobile.
- Résultat : `docs/GAME_DESIGN.md` (12 sections + annexe), source de vérité du gameplay.
- Décisions prises : grille carrée ; **catalogue libre** en **temps réel accéléré** avec pause et vitesses (comme Seve) ; partie de carrière de 3 ans ; ton cosy et bienveillant ; vallée animée (habitants, animaux, véhicules) dès le prototype ; dépôt public et ressources libres (CC0, CC BY, OFL), achats possibles s'ils restent sous ces licences et peu chers.
- La boucle « main de 3 tuiles » d'abord recommandée a été écartée par l'utilisateur ; on en garde les barres de demande (ce qui manque) et le choix annuel (politique municipale).
- Ressources : l'utilisateur demande de repartir de zéro (rien de Seve) avec une recherche approfondie sur Internet ; étude en cinq volets (direction artistique, bâtiments et rues, nature-animaux-véhicules, interface-polices, audio), plus de 150 packs et sources vérifiés sur leur page → `docs/ASSETS.md` (synthèse + rapports en annexes).
- Décisions de l'utilisateur : pixel art 16 px en métatuiles, scénario B mixte (≈ 45 €), code public + ressources privées (`Tiletown-assets`), hébergement Cloudflare Pages ; liste d'achats et conséquences (packs hors dépôt public, hébergement hors GitHub Pages public) dans `docs/ASSETS.md`.
- Conclusions : le city builder 2D n'existe qu'en pixel art 16 px (métatuiles 2 × 2 pour la lisibilité) ; trois scénarios : A tout libre (0 €, 150-180 éléments à dessiner), B mixte (≈ 45 €, 80-85 % couvert, packs hors dépôt public), C commande 32 px (1 750-3 100 $, tout public) ; héron, loutre, chouette en vol, hirondelle, cycliste introuvables partout ; interface, polices et audio 100 % libres.
- Création du dépôt refusée à l'intégration GitHub (403) : le dépôt `Madec01/Tiletown` est à créer par l'utilisateur, les fichiers sont prêts à pousser.
- Dépôt créé avec le cadre de travail hérité de Seve : `CLAUDE.md`, `.claude/REGLES.md`, hook `UserPromptSubmit`, `docs/MOBILE.md`.
- Aucun code pour l'instant : le premier lot sera le prototype (grille, main de 3, pose, rues automatiques, jauges air et eau).

## 2026-10-04 (suite) — Rues visibles, lancement de l'étape 2

- Retour de l'utilisateur : « je n'ai pas vu les rues et routes ». Cause : îlots à 0,85 u et rues de 0,15 u d'écart masquées en vue 3/4, chemins de terre seulement autour de la ville.
- **Règle changée** (`src/core/roads.js`, conception §4.1) : chaque îlot bâti est entouré de rues sur ses quatre côtés (partagée entre voisins, de ceinture face à la nature, quai le long de l'eau) ; chemin autour d'une nature plantée ; rien entre natures. Les tracés de raccordement sont conservés même le long du bord. Orientation des bâtiments : la rue partagée avec un autre îlot l'emporte sur la rue de ceinture. Trajets : à coût égal, la rue commune aux deux îlots est préférée.
- **Rendu** : rues procédurales continues (asphalte 0,36 u, trottoirs 0,5 u, un trait central par segment, nœuds aux carrefours) ; les pièces GLB `road-edge-*` (0,3 u, fermées aux bouts, qui segmentaient les rues) restent en option `useEdgeModels`. Bâtiments ramenés à ≈ 0,7 u d'emprise (`BUILDING_SCALE`). Vue de jeu par défaut sur la mairie, `?zoom=` et `?view=all` pour le débogage, `tools/shot.mjs` pour capturer une adresse.
- Tests adaptés (75 passent) ; capture `docs/captures/prototype-rues-412.png`.
- Sauvegarde avant l'étape 2 : branche `backup/avant-etape2-2026-10-04`. Contrat des acteurs et effets ajouté à `docs/ARCHITECTURE.md` §8.

## 2026-10-04 (suite) — Dépôt créé, prototype de rendu lancé

- Dépôt `Madec01/tiletown` créé par l'utilisateur (vide) ; premier commit « graine » préparé en local. La poussée est refusée (403) tant que l'application GitHub Claude n'est pas installée sur le dépôt ; liens transmis à l'utilisateur.
- Sauvegarde : tag `backup/graine-2026-10-04` sur le premier commit.
- `docs/ARCHITECTURE.md` écrit : contrat entre modules (état du monde, arêtes, catalogue, manifeste des modèles, API du rendu, critères du prototype).
- `package.json` : three 0.186.1 en dépendance ; esbuild, @gltf-transform, meshoptimizer, playwright, adm-zip en développement. `src/data/palette.js` : palette commune de 24 teintes.
- **Prototype étape 1 (carte statique) livré.** Résultats mesurés (Playwright, Chromium sans GPU, 412 × 915 et 360 × 740) : 10 appels de dessin, 74 000 triangles passe d'ombre comprise, précache 1,70 Mo (64 fichiers), 0 erreur, prêt en ≈ 1 s ; 75 tests passent ; `node tools/build.js --check` à jour.
  - Pipeline des modèles : 10 kits Kenney téléchargés (`tools/fetch-kits.js`, cache ignoré par git), 50 modèles normalisés (`tools/import-models.js`, `tools/model-map.js`) : échelle 1 case = 1 u, couleurs quantifiées vers la palette, assemblages (école, clinique, mairie, marché, arrêt de tram, épuration, centrale, compost, parc), rues étroites pour les arêtes, meshopt ; 0,82 Mo au total ; planche de contrôle `tools/preview-models.mjs`. Provisoire : `bus` = camionnette.
  - Logique pure : `rng`, `grid`, `worldgen` (rivière bord à bord, lacs, zones humides, forêts, collines, champs, mairie et ville de départ), `roads` (rues sur les arêtes, raccordement Dijkstra, trafic), catalogue `tiles.js` (21 tuiles), `terrain.js` ; `tools/print-world.js`.
  - Rendu three.js : caméra pure (`camera.js`, 12 tests), un seul `BatchedMesh` pour la ville (repli instancié), sol instancié coloré par terrain, rues et nœuds sur les arêtes, ponts, calques par couleurs d'instances, ombres PCF 2048, rendu seulement si nécessaire, perte de contexte gérée ; `tools/measure.mjs` et `tools/measure-fixture.html`.
  - Squelette : build esbuild (three.js inclus, 731 Ko de JS), `dev.html` avec import map, PWA (manifeste, `sw.js`, icônes générées par `tools/make-icons.mjs`), HUD à 4 jauges, onglets du catalogue, feuille, gestes (tap, appui long, double tap, pan, pincement, molette), police Nunito (OFL), tests de cibles tactiles.
  - Intégration : vue de jeu par défaut rapprochée sur la mairie (`lookAt`, ≈ 8 îlots de large), double tap = bascule vue d'ensemble / vue de jeu, `?view=all` ; crédits complétés (Nunito, icônes) ; scripts npm.
- Limites connues / à faire : triangles sur une grande carte de test 24 × 24 (1,19 M, critère ≤ 150 k KO) → simplifier les modèles (`simplify`) ou niveaux de détail ; pas de hachures daltoniennes sur les calques ; `bus` provisoire ; stats « i/s » trompeuses au repos (rendu seulement si nécessaire). Le proxy git de la session refuse l'envoi des **tags** : les sauvegardes sont poussées comme **branches** `backup/…` (le tag reste en local).
- Prototype étape 1 (carte statique) lancé en quatre chantiers parallèles : squelette/build/PWA/interface ; logique pure (grille, vallée, rues sur les arêtes) ; pipeline des modèles 3D (téléchargement des kits Kenney, normalisation, palette, meshopt, manifeste) ; rendu three.js (sol, îlots, rues, calques, caméra, mesures Playwright).

## 2026-10-04 (suite) — Revirement : rendu lisse, pas de pixel art

- L'utilisateur refuse finalement le pixel art et veut un rendu **lisse** (non pixelisé), façon Islanders, Townscaper, Dorfromantik, Mini Motorways.
- Les décisions 9 (pixel art 16 px en métatuiles), 10 (scénario B d'achats de packs pixel) et 11 (dépôt privé pour ces packs) sont **suspendues** ; la liste d'achats pixel art n'est plus à exécuter.
- Nouvelle étude en trois volets : modèles 3D low poly libres (Kenney, Quaternius, KayKit, Poly Pizza…) rendus en 2D ou en 3D temps réel ; packs 2D vectoriels et illustrés lisses ; faisabilité technique du rendu lisse sur téléphone (three.js temps réel, pré-rendu en sprites, SVG). Résultat : la 3D libre couvre ≈ 90 % des besoins en CC0, la 2D lisse libre ≈ 50 % ; un prototype de pré-rendu (Playwright + three.js) a été réalisé et rangé dans `tools/sprites-proto/`.
- **Décisions finales** : 3D basse définition libre (Kenney, KayKit, Quaternius, Gobkit), rendu **three.js temps réel** + interface DOM, **un seul dépôt public avec GitHub Pages** (plus de dépôt privé ni d'achats), faune manquante modélisée en interne d'abord. Conception, cahier mobile, CLAUDE.md et README mis à jour en conséquence.
- Prochaine étape : création du dépôt par l'utilisateur, puis prototype de rendu en trois étapes (carte statique ≤ 60 appels de dessin et 60 i/s ; vallée animée ; intégration PWA avec précache < 6 Mo).

## Idées en vrac

- Carnet des espèces illustré (herbier) comme fil rouge de la carrière.
- Espèces « urbaines » (hirondelle, renard) qui récompensent de bien construire, pas seulement de ne pas construire.
- Rues sur les arêtes des tuiles : aucune case consommée, corridors préservés par défaut.
- Défi du jour à graine partagée.
- Animations : cerfs qui traversent les corridors, hérons sur le lac propre, voitures seulement sur les rues chargées (le trafic se voit sans jauge).

## Bugs

- Aucun pour l'instant.
