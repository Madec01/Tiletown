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

## 2026-10-05 — Étape 5 lancée : carrière, tutoriel et beauté

- Retours de l'utilisateur : « on démarre directement avec une ville, il faut une carrière avec tuto » et « le jeu n'est pas très beau ».
- Sauvegarde : branche `backup/avant-etape5-2026-10-05`. Contrat : `docs/ARCHITECTURE.md` §11.
- **Carrière** : la partie commence sur une vallée vierge avec la seule mairie ; cinq niveaux (vallée, rivière, bocage, coteau, grande vallée), objectifs et trois étoiles chacun, catalogue débloqué cumulatif, bac à sable à part. **Tutoriel** : dix leçons guidées, jamais bloquantes. **Interface** : écran titre, carte de carrière, bandeau d'objectifs, bulle de tutoriel avec surbrillance, écran de fin de niveau.
- **Beauté** : l'utilisateur a analysé le code et les captures et fourni un plan en cinq priorités, repris tel quel en §11.4. Diagnostic : l'aspect cubique vient du terrain (chaque case est une boîte, les collines sont des boîtes plus hautes) et de l'organisation du décor, pas de la lumière. Trois chantiers : terrain continu et lumière ; modèles d'arbres et de bâtiments avec palette par rôle ; placement de la végétation et abords des rues. Méthode imposée : valider sur une petite scène de référence avant de tout refaire.

## 2026-10-05 — Étape 4 livrée : la nature compte vraiment

- **Écologie** (`src/core/ecology.js`, `src/data/species.js`, purs) : air avec diffusion et vent dominant, eau transportée vers l'aval avec lacs et nappe, parcelles d'habitat et corridors coupés par le trafic (rétablis par la nouvelle tuile « passage à faune »), fertilité des sols, sept espèces emblématiques avec leurs seuils, scores et alertes (smog, algues, crue, canicule). Avancée à chaque mois, avant les stats.
- **Rétroactions** dans `game.js` : la jauge Nature devient réelle, l'air pèse sur le bonheur, la nappe sur la santé, le tourisme sur les recettes des commerces, la fertilité et la pollinisation sur les champs. Sauvegarde version 2 avec migration.
- **Rendu** : calques air, eau, faune et sols avec légende et hachures pour le daltonisme (sans appel de dessin supplémentaire), marqueurs d'espèces en billboards dessinés en code, brume au-dessus des quartiers pollués, eau qui verdit ; la faune animée n'apparaît que si l'espèce est présente.
- **Interface** : feuille Calques avec pastille de rappel, fiche Nature (quatre sous-scores et liste des espèces avec leur condition), carnet des espèces, alertes avec bouton « Voir » qui centre la carte et allume le bon calque, bloc écologie dans la fiche de case.
- **Vérifications** : 204 tests, `tools/play.mjs` 20 étapes, `tools/play-eco.mjs` 17 étapes, 0 erreur console, 27 appels de dessin avec un calque actif, précache 2,87 Mo.
- **Équilibrage** (`tools/simulate.js`, 48 mois) : sans rien faire, pas de faillite ; l'étalement naïf coule dès le mois 20 ; **tout bétonner fait chuter la nature de 81 à 51 avec 11 mois d'exode** ; la conduite équilibrée atteint 619 habitants, nature 86 et 5 espèces (abeilles au mois 27, hirondelle au mois 21).
- Incident : le conteneur a redémarré pendant le dernier chantier ; le travail était déjà committé, seul le rapport de l'agent a été perdu.
- Limites / à faire : le bonheur de la conduite équilibrée retombe à 34 en fin de 4e année (pénurie de nourriture à surveiller) ; les icônes d'espèces sont petites en vue d'ensemble ; le voile de brume est plat et traversé par les tours ; toujours pas de son ni de contrats.

## 2026-10-05 — Étape 4 lancée : les systèmes nature

- Décision de l'utilisateur : l'écologie avant la progression et le son.
- Sauvegarde : branche `backup/avant-etape4-2026-10-05`.
- Contrat écrit dans `docs/ARCHITECTURE.md` §10 : état `eco` (air, eau, faune, sols en tableaux typés, parcelles d'habitat, espèces, scores, alertes), `stepEcology` à chaque mois, intégration dans les stats et le bonheur, calques avec légende et hachures daltoniennes, icônes d'espèces, faune animée pilotée par les espèces présentes, brume et lac qui verdit, fiche Nature, carnet des espèces, alertes avec bouton « Voir », parcours `tools/play-eco.mjs` comme critère.
- Trois chantiers parallèles : écologie pure et intégration ; calques, espèces et ambiance 3D ; interface et carnet.

## 2026-10-05 — Étape 3 livrée : Tiletown se joue

- **Logique de partie** (`src/core/game.js`, `calendar.js`, `src/data/balance.js`, purs) : horloge (1 mois = 30 s à vitesse 1, vitesses 0, ½, 1, 2, 4), argent, recettes et entretien encaissés chaque mois, arrivées et départs d'habitants, évolutions de quartier en fin de saison, déblocages par paliers de population, `canPlace` / `place` / `demolish` / `undoLast` (10 s), `describeTile`, `serialize`/`deserialize`. 16 tests.
- **Équilibrage par simulation** (`tools/simulate.js`, 36 mois, plusieurs graines) : sans rien faire la ville ne fait pas faillite (1 510 $, exode limité) ; l'étalement sans services stagne ; une conduite équilibrée atteint 416 habitants et 71 bâtiments en 3 ans sans exode.
- **Fantôme de pose** (`src/render3d/ghost.js`) : modèle translucide teinté vert, rouge ou jaune, anneau de case, tracé de raccordement en pointillés (jaunes sur un pont), arêtes déjà équipées sautées ; au plus 2 appels de dessin de plus. 20 tests.
- **Interface** (`src/ui/{catalog,placement,sheet-tile,sheets,hud}.js`, `src/storage.js`) : feuille du catalogue avec barres de demande, cartes verrouillées ou trop chères, pose en deux temps avec bandeau de coût détaillé, outil Démolir, fiche de case (conditions d'évolution cochées), bouton pause/vitesse actif, bandeau de bilan de saison, sauvegarde locale et reprise au rechargement, retour Android et touche Échap.
- **Parcours automatisé** (`tools/play.mjs`, Playwright, gestes réels) : 20 étapes vérifiées, sortie 0, 0 erreur console, fantôme à 28 appels de dessin. Captures `tools/measure-out/play-*.png`.
- Vérifications finales : 153 tests, `node tools/build.js --check` à jour, précache 2,80 Mo.
- Limites / à faire : les calques air, eau et faune restent informatifs (étape 3 bis) ; pas de son ; pas de contrats ni de politique municipale ; pas d'écran de fin d'année ni de score.

## 2026-10-05 — Étape 3 lancée : poser des tuiles et faire tourner le temps

- Décision de l'utilisateur : étape 3 (le prototype devient un jeu) avant les systèmes nature et le son.
- Sauvegarde : branche `backup/avant-etape3-2026-10-05`.
- Contrat écrit dans `docs/ARCHITECTURE.md` §9 : état de partie pur (`createGame`, `advance`, `monthTick`, `canPlace`, `place`, `demolish`, `undoLast`, `serialize`…), fantôme et surbrillance dans le rendu (`setGhost`, `setHighlight`), interface (catalogue, pose en deux temps, HUD, vitesse, fiche, stockage local), parcours automatisé `tools/play.mjs` comme critère.
- Trois chantiers parallèles : logique de partie (avec `tools/simulate.js` pour l'équilibrage), fantôme 3D, interface et intégration.

## 2026-10-04 (suite) — Étape 2 livrée : la vallée animée

- **Modèles animés** (`tools/import-animated.js`, `tools/build-fauna.js`, `tools/preview-animated.mjs`) : cerf, renard, vache (Quaternius, squelettes 42-51 os, clips Idle/Walk/Gallop/Eating ; fichiers pris sur des miroirs GitHub octet-identiques, le Drive officiel étant saturé), canard, abeille, chouette (Gobkit, piste concaténée découpée en idle/attack/dead/walk) ; pantins maison en primitives : habitants (3 variantes), héron, loutre, hirondelle, cycliste. 13 modèles, 0,99 Mo. Pas de mouton (Farm Animals en FBX seulement). Licences : `LICENSE-quaternius.txt`, `LICENSE-gobkit.txt` (le champ copyright des GLB Gobkit est vide ; la CC0 est dans leur LICENSE.txt).
- **Acteurs** (`src/core/actors.js` pur, `src/render3d/{rigs,puppet-pose,actors}.js`) : habitants 2/4/6 par niveau sur le trottoir de droite, pauses 1-3 s ; véhicules sur les arêtes à trafic > 0, voie de droite, suivi, arrêt aux carrefours ; faune par habitat (cerf, renard, canard, héron avec envols, loutre qui descend le courant, abeille, hirondelle, chouette perchée) ; **un seul BatchedMesh pour tous les pantins**, squelettes clonés plafonnés à 8, véhicules instanciés. 17 tests.
- **Effets** (`src/render3d/effects.js`, `ground.js`, `models.js`) : fumée instanciée aux cheminées poussée par le vent, pales d'éoliennes en rotation (pièce `blades` exclue de la fusion), eau en shader (sens du courant, ondulation, écume aux berges, bandes adoucies). 13 tests.
- **Intégration** : `renderer.setActors`, mise à jour des couches dans `render(dt)`, `updateActors` dans la boucle de `main.js` (vitesse 1 en attendant le bouton pause/vitesse), `?zoom=` ; scénario « vallée animée » dans `tools/measure.mjs` (acteurs comptés, déplacements à 2 s d'écart, CPU).
- **Mesures** (SwiftShader, 412 × 915) : 26 appels de dessin, 145 000 triangles (seuil 200 000), mise à jour CPU 1 ms, précache 2,74 Mo, 110 tests, 0 erreur ; 52 acteurs (20 habitants, 8 véhicules, 24 animaux), 19 à 36 déplacés selon la fenêtre (pauses et perchoirs compris) ; critère porté à 35 %.
- Limites / à faire : hirondelle trop grande en vol rapproché (échelle à revoir) ; `cow` et `cyclist` livrés mais pas encore utilisés par la simulation ; triangles sur grande carte (décor statique) toujours à simplifier ; bouton pause/vitesse pas encore relié à `simSpeed` ; pas de sons.
- Captures : `docs/captures/prototype-etape2-412.png`, `docs/captures/modeles-animes-planche.png`. Sauvegarde : branche `backup/etape2-2026-10-04`.

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
