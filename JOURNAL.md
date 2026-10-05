# Journal de Tiletown

Modifications, idées et bugs, du plus récent au plus ancien. À mettre à jour à chaque travail.

## 2026-10-05 — Résolution des conflits de la PR #1

- Intégration de `main` au commit `acbfb3e` dans `feat/refonte-vallee-mobile`. Sauvegarde avant intervention : branche et tag `backup/avant-resolution-pr1-2026-10-05`, publiés sur GitHub (ancien sommet `63a9de3`).
- Terrain continu, rivière sinueuse, nouveaux modèles, semis de végétation et abords de rues de `main` conservés. Ses 85 modèles remplacent les adaptations provisoires redondantes de la PR ; les 22 aperçus du catalogue sont régénérés depuis ces GLB.
- Écrans titre, carte, résultat, objectifs et tutoriel de `main` raccordés à l’interface crème/vert, aux raccourcis tactiles, aux huit primes, aux trois musiques et aux réglages de la PR. Un seul accueil et un seul tutoriel ; commandes accessibles sur téléphone et ordinateur.
- Réconciliation des carrières sauvegardées dans la partie et dans la clé séparée : meilleur nombre d’étoiles et union des niveaux, tuiles et leçons. Le mode libre et une nouvelle vallée conservent la carrière. Bilan figé, sauvegardé et retrouvé après rechargement ; « Continuer ma vallée » reprend le même monde sans rouvrir le bilan au retour du menu.
- Tests : **264 réussis, aucun échec, aucun ignoré**, dont le nouveau contrôle des deux formats de carrière et les cibles tactiles sur 360 × 740 et 412 × 915. Parcours `play-career.mjs` validé (trois premières leçons au toucher, fin de niveau, déblocages et reprise). `review-mobile.mjs` couvre en plus les primes, les réglages, le bilan après recharge et le mode libre ; vues jusqu’à 1440 × 1000. Vérification hors ligne : 85 modèles sans erreur et audio partiel Range 206. Exécution dans Chromium avec rendu logiciel.
- Build régénéré depuis l’historique de production de `main`, en conservant ses quatre versions précédentes ; `npm run check` valide. Crédits, architecture et captures actualisés. La recherche d’assets dans `docs/ASSETS.md` est conservée.

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

## 2026-10-05 — Étape 5, chantier PLACEMENT : semis continu de la végétation, abords des rues

(Priorités 2 et 4 du plan de beauté de l'utilisateur, `docs/ARCHITECTURE.md` §11.4. Chantier mené en
parallèle de TERRAIN — `src/render3d/ground.js`, `renderer.js`, `camera.js` — et de MODÈLES —
`src/render3d/models.js`, `src/data/palette.js`, `assets/models/`.)

- **Fin des « trois emplacements types par case »** (`src/render3d/buildings.js`). La végétation
  native n'est plus posée case par case : elle est SEMÉE en coordonnées monde sur une maille
  régulière secouée (0,40 u pour la canopée, 0,40 à 0,48 u pour le sous-bois). Chaque point est
  gardé selon :
  - un **champ de couverture** `coverageAt` (interpolation bilinéaire de l'indicateur de terrain aux
    centres de case) : 1 au cœur d'un massif, 0,5 au milieu d'une lisière, nul une demi-case au-delà
    — d'où le **débordement borné à 0,5 u** sur les cases voisines libres et la **densité qui
    décroît vers la lisière** ; un plancher (0,55 + 0,45 f) garde garnie une case de massif isolée ;
  - un **bruit de valeur** basse fréquence qui ouvre des **clairières** (2 à 3 cases) et un second
    qui mêle **feuillus et résineux par plaques** ;
  - un filtre d'accueil : jamais sur une case bâtie, sur l'eau, sur un champ, ni à moins de 0,30 u
    d'une rue.
  Tailles mêlées (grand, moyen, jeune, baliveau — plus de grands au cœur, plus de jeunes en
  lisière), rotation et échelle tirées par instance. Même traitement pour les **prairies** (fleurs et
  touffes), les **zones humides** (roseaux) et les **collines** (rochers irréguliers, plus jamais au
  centre des cases). Les lisières portent arbustes et herbes.
- **Vent très discret** : les groupes « arbre » et « couvre-sol » emploient un clone du matériau à
  couleurs de sommets dont le shader incline le haut du feuillage de ± 2° (deux sinus lents, phase
  tirée de la position monde de l'instance). Coût CPU nul ; `renderer.js` n'ayant pas de rappel pour
  cette couche, l'horloge est interne (`requestAnimationFrame`), et `buildings.update(dt)` prend la
  main si un appelant l'utilise un jour.
- **Trois lots de rendu** au lieu d'un : `solid` (bâtiments, rochers, ombres), `tree` (ombres +
  vent), `cover` (vent léger, **sans ombre**). Trois `BatchedMesh`, cinq appels de dessin avec la
  passe d'ombre.
- **Identifiants de modèles par rôle** (`resolveRoles`) : les futurs `tree-round-s/m/l`,
  `tree-tall-s/m/l`, `pine-s/m/l`, `shrub-a/b`, `grass-tuft-a/b`, `sapling`, `reed-a/b`, `bench`,
  `fence`, `veggie-patch` sont employés **s'ils existent** (`models.has(id)`), avec repli sur les
  modèles actuels et leur propre plage d'échelle.
- **Abords des rues** (`src/render3d/roads.js`). Les bandes de rue s'arrêtent à une demi-largeur de
  trottoir du sommet : une **pièce de nœud** referme chaque jonction (cul-de-sac, droit, virage, T,
  carrefour, orientée au quart de tour). Les **coins de trottoir exposés sont arrondis** ; un
  **liseré d'herbe** en quart de disque arrondit l'angle du trottoir là où deux rues se rejoignent ;
  un **virage** (deux arêtes à 90°, sans troisième branche) devient un **arc** (quart de disque de
  chaussée, anneau de trottoir).
- **Moins de cadre autour des bâtiments** : chaussée 0,36 → 0,30 u, trottoir 0,50 → 0,40 u,
  `BUILDING_SCALE` 0,82 → 0,64 ; chaussée, trottoir et parcelle rapprochés en valeur (mélanges en
  espace sRGB, pas linéaire : l'écart sombre/clair devient une gradation).
- **Parcelles, jardins et allées** : sous chaque îlot bâti, une parcelle claire (pelouse jusqu'au
  bord de la chaussée pour un quartier, dallage ou gravier sinon) et une **allée d'entrée** vers la
  rue de la façade (`entrySide`, partagé par les deux modules) ; autour du bâtiment, deux à trois
  petits éléments tirés parmi haie, buisson, potager, fleurs selon la famille ; un **arbre de rue**
  à un coin de treillis sur trois.
- **Tests** (`tests/render-placements.test.js`, 13 cas) : déterminisme à graine égale, `valueNoise`
  continu, `coverageAt` (cœur / lisière / au-delà), `resolveRoles` (nouveaux modèles ou repli),
  débordement borné à 0,5 u, rien sur l'eau ni sur une case bâtie ni sur la chaussée, densité du
  cœur > 1,5 × celle de la lisière, rochers sans emplacement type, parcelles et allées, pièces de
  nœud (forme + quart de tour) à chaque sommet.
- **Vérification** : `tools/placement-fixture.html` (scène de référence fixe : rivière courbe,
  colline, deux bosquets qui se rejoignent, prairie, zone humide, trois maisons, pâté de ville) et
  `tools/placement-shot.mjs` (Playwright + SwiftShader) qui recompose un arbre « avant » à partir du
  dernier commit sans ce chantier et produit `tools/measure-out/placement-{avant,apres,foret,
  lisiere,rue,maisons,carrefour,jardin}.png` + `placement-report.json`.
- **Mesures** (scène de référence, 412 × 915) : avant 9 appels / 145 370 triangles / 158 instances →
  après 19 appels / 138 994 triangles / 321 instances (109 arbres, 173 couvre-sol, 13 parcelles).
  Carte de jeu réelle (`dev.html`, `tools/measure.mjs`) : 19 → 26 appels, 126 663 → 146 243
  triangles (budget 250 000), 137 → 285 instances, 1,5 à 3 ms par image sous SwiftShader.
- **Bug / limite** : sur la carte de charge (24 × 24, 500 îlots bâtis) les abords ajoutent ≈ 1 100
  instances et le total passe de 1,18 M à 1,53 M triangles ; le critère §7 (150 000) était déjà
  largement dépassé par les seuls bâtiments. Le repli `flowers` (380 triangles) employé pour les
  touffes et les potagers en est la part principale : les modèles dédiés de MODÈLES
  (`grass-tuft-*`, `shrub-*`, `veggie-patch`) le feront retomber.

## 2026-10-05 — Étape 5, chantier MODÈLES : arbres arrondis, bâtiments à caractère, palette par rôle

(Priorités 2 et 3 du plan de beauté de l'utilisateur, `docs/ARCHITECTURE.md` §11.4. Chantier mené en
parallèle de TERRAIN — `src/render3d/ground.js`, `renderer.js`, `camera.js` — et de PLACEMENT —
`src/render3d/buildings.js`, `roads.js`.)

- **Palette par rôle** (`src/data/palette.js`). Les 24 teintes du jeu ne bougent pas (une variable CSS
  chacune). Elles sont prolongées, pour les modèles 3D seulement, par 17 teintes (`MODEL_TINTS` :
  terracotta, ardoise foncée, brun doux, tuile claire, pastels bleu/vert/rose/ocre, pierre et enduit
  chauds, trois verts, deux écorces, deux vitrages) et par 12 sous-palettes (`ROOF_COLORS`,
  `ROOF_FLAT_COLORS`, `WALL_COLORS`, `BASE_COLORS`, `FOLIAGE_COLORS`, `TRUNK_COLORS`, `TRIM_COLORS`,
  `GLASS_COLORS`, `ROCK_COLORS`, `METAL_COLORS`, `GROUND_COLORS`, `ACCENT_COLORS`) avec
  `roleColor(rôle, graine, rang)`.
- **Import par rôle** (`tools/import-models.js`). `nearestPaletteHex` ne sert plus aux modèles
  statiques : la couleur de chaque sommet est échantillonnée dans la texture-palette du kit, les aplats
  sont regroupés en rampes (même rôle, même famille de teinte), le rôle est deviné (couleur + hauteur
  dans la boîte englobante + orientation des faces + profil du kit), puis une teinte est tirée dans la
  sous-palette du rôle avec l'identifiant du modèle comme graine. La façade est la rampe de plus grande
  AIRE VISIBLE (les dessous ne comptent pas). Les accents gardent leur famille de teinte.
  Les couleurs sont cuites en COLOR_0 : **plus aucune texture dans les GLB** (≈ 11 Ko gagnés par modèle).
- **Arbres** : famille de 14 nouveaux modèles en primitives Tiletown (CC0) — `tree-round-s/m/l`,
  `tree-tall-s/m/l`, `pine-s/m/l`, `shrub-a/b`, `grass-tuft-a/b`, `sapling` — en volumes lisses
  (ellipsoïdes à normales analytiques, rayon bruité) sur troncs fuselés et penchés. `tree-a/b/c`,
  `pine-a/b` et `bush` pointent vers ces recettes (autres graines) : rien ne casse côté jeu.
- **Bâtiments** : 9 nouvelles variantes (`house-d/e/f`, `building-small-c`, `building-tall-c`,
  `shop-c`, `office-b`, `factory-c`) de silhouettes nettement différentes, et des détails de caractère
  ajoutés en primitives BISEAUTÉES après mise à l'échelle : débord de toiture, corniche, cheminée,
  porche, lucarne, édicule de toit, repérés sur une tranche de hauteur du modèle (`slice`).
- **Vérifications** : planche `tools/measure-out/models-sheet.png` (85 modèles, 0 problème) et planche
  avant/après `tools/measure-out/models-avant-apres.png` (nouveau script `tools/preview-before-after.mjs`).
  `assets/models/` passe de 1,88 à 1,95 Mo pour 22 modèles de plus (objectif < 2,5 Mo) ; les 85 modèles
  se chargent par `src/render3d/models.js` sans aucun repli ni texture.
- À faire / faible : les variantes ne sont pas encore référencées par `src/data/tiles.js` ni
  `src/data/terrain.js` (à câbler avec le chantier PLACEMENT) ; les volumes des kits gardent leurs
  facettes (seules les pièces ajoutées par Tiletown sont biseautées) ; `crop-wheat`, `crop-corn`,
  `rock-a/b` et `flowers` restent des modèles de kit non retravaillés.

## 2026-10-05 — Étape 5 livrée : carrière, tutoriel et refonte visuelle

**Carrière et tutoriel.** La partie commence sur une vallée vierge avec la seule mairie. Cinq niveaux (vallée, rivière, bocage, coteau, grande vallée) avec objectifs et trois étoiles chacun, catalogue débloqué cumulatif, écran titre, carte des niveaux, bandeau d'objectifs, écran de fin, sauvegarde séparée de la carrière. Tutoriel de dix leçons guidées, jamais bloquantes, avec halo sur l'élément visé. Simulation du niveau 1 : 151 habitants, nature 82, aucun exode, deux étoiles.

**Refonte visuelle, d'après le plan de l'utilisateur (§11.4).**
1. *Terrain continu* : la terre n'est plus une grille de boîtes mais un maillage soudé tiré d'un champ de hauteur lissé. Collines en dômes cohérents sur plusieurs cases, berges en pente, couleurs fondues d'une case à l'autre, grain continu en coordonnées monde, ombres de contact, socle épaissi. La grille n'apparaît plus que localement pendant la pose (`setGridHint`).
2. *Rivière sinueuse* : le rivage est la ligne de niveau d'un champ de présence d'eau, extraite en marching squares, avec arrondi des coudes et serpentement. Virage maximal ramené de 90° à 36°. Lit et berge sortent du même champ : plus de trou ni de débordement possible.
3. *Arbres* : feuillages en ellipsoïdes lisses (deux à quatre volumes), troncs fuselés penchés, trois tailles par essence, 14 modèles nouveaux.
4. *Bâtiments* : huit silhouettes nouvelles, toits ardoise, terracotta et brun, façades crème et pastel, cheminées, débords, porches, lucarnes en volumes biseautés.
5. *Palette par rôle* : chaque aplat est classé (toiture, façade, menuiserie, vitrage, feuillage, tronc, roche, métal) et tiré dans sa sous-palette, au lieu de la teinte la plus proche.
6. *Placement* : semis continu en coordonnées monde avec champ de couverture, débordement borné, clairières, plaques de feuillus et de résineux, lisières garnies d'arbustes, vent de ± 2°.
7. *Abords* : chaussée et trottoir resserrés et adoucis, coins arrondis, virages en arc, parcelle sous chaque îlot, allée d'entrée, jardins, arbres de rue.
8. *Lumière et eau* : soleil plus bas et plus chaud, ombres douces, bandes de courant trois fois plus faibles, haut-fond pâle le long des berges.

**Vérifications** : 258 tests, les trois parcours automatisés au complet (20, 17 et 17 étapes), build à jour, 3,01 Mo hors ligne, 26 appels de dessin et 146 000 triangles sur la carte de jeu.

**Limites** : la carte de charge 24 × 24 dépasse le budget de triangles (1,53 million) ; berge raide aux coudes concaves ; roseaux de bordure non posés ; `bus` toujours provisoire ; police de titre Baloo 2 absente du dépôt (Nunito utilisée).

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

## 2026-10-05 — Refonte complète de l’expérience mobile « Une ville qui respire »

Demande : une version beaucoup plus belle, en 3D, jouable sur téléphone en portrait, avec de beaux assets et de la musique.

### Sauvegarde préalable

Branche et tag `backup/avant-refonte-mobile-2026-10-05` créés sur l’état de `main` avant les modifications. Développement sur `feat/refonte-vallee-mobile`.

### Réalisation

- Nouvelle interface crème et vert sapin : identité, quatre jauges, pictogrammes, raccourcis de construction au pouce, commandes de caméra, panneaux illustrés et écran d’accueil.
- Catalogue : 22 images WebP pré-rendues à partir des véritables GLB ; prix, entretien, description et conditions de déblocage lisibles.
- Rendu 3D : lumière chaude et tone mapping filmique, terrain continu aux couleurs fondues, collines raccordées et berges en pente, arbres arrondis, grille locale pendant la pose, toitures terre cuite, jardins, clôtures, lampadaires et cailloux sur les berges. Variante d’éclairage du soir. Environ 27 appels de dessin sur la carte initiale avec multi-draw.
- Audio : trois compositions CC0 complètes, niveau homogénéisé, liste de lecture, réglage du volume, musique et bruitages indépendants, préférences mémorisées. Lecture débloquée par un geste et suspendue quand l’onglet est caché. Les musiques sont mises en cache à leur première utilisation par le service worker existant.
- Carrière : mairie seule au départ, cinq vallées à débloquer, objectifs de population et de nature propres à chaque carte, huit étapes de découverte avec primes uniques, bilan à 36 mois, score et étoiles persistantes, possibilité de continuer la vallée. Mode libre : catalogue débloqué et budget de 100 000 $. Confirmation explicite dans l’interface avant de remplacer une partie.
- Sauvegardes précédentes compatibles ; mode, progression et bilan sérialisés. Une prime supprime l’annulation précédente pour empêcher un remboursement incohérent.
- Vues téléphone / ordinateur adaptées, cibles tactiles de 48 px minimum, chiffres abrégés pour les gros budgets, prise en compte des animations réduites.

### Validation

Tests Node et parcours Chromium automatisés : simulation, sauvegardes, objectifs, fin à trois ans, tactile, aperçu puis confirmation, débit, remboursement, prime, rechargement, paramètres sonores et mode libre. Formats 360 × 740, 412 × 915, 430 × 932 et 1440 × 1000 ; captures produites par `tools/review-mobile.mjs`.

Les mesures sont réalisées dans Chromium avec rendu logiciel en environnement de développement ; elles ne remplacent pas un essai de fluidité sur un appareil Android physique. Aucun achat ni ressource générée par IA ajouté. Le jeu publié sur `main` reste disponible pendant l’examen de la pull request.

Résultats finaux : **235 tests réussis, aucun échec ni test sauté**. Parcours mobile et desktop réussi, sans erreur JavaScript. Contrôle hors ligne réussi après installation du service worker : reprise de la partie, 63 modèles chargés sans erreur, musique mise en cache servie en HTTP 206 pour une requête Range. `npm run check` confirme que les fichiers publiables correspondent aux sources.

Contrôle économique final : `node tools/simulate.js --career --level vallee-1 --quiet --dt 30`, démarrage avec 700 $ et mairie seule ; au mois 36, 151 habitants, nature 82, deux étoiles, score 73 et aucun mois d’exode. Objectifs atteints au mois 22, sans prime du carnet ni injection de budget. Les tests des niveaux vérifient aussi les quatre autres vallées.

Correction du retour Android : attendre le `popstate` de fermeture avant de poser une nouvelle entrée d’historique ; un test de régression reproduit l’ouverture d’une couche pendant la fermeture d’une autre. Les paramètres de nouvelle partie sont nettoyés avant de créer la pile des panneaux.

Intégration du commit `220a2e2` arrivé sur `main` pendant la refonte : moteur de carrière, cartes, règles d’étoiles, dix leçons, suivi d’exode et simulateur conservés. L’adaptateur `career-session.js` les raccorde à la partie sauvegardée ; « Premiers pas » affiche les leçons dans le carnet. Les huit missions à primes restent un parcours complémentaire.

## 2026-10-05 — Recherche complémentaire d'assets et génération 3D

- Demande : rechercher de meilleurs assets 3D et examiner la possibilité de les créer ou de les faire générer.
- Sélection et licences vérifiées sur les pages officielles : Tiny Treats Homely House / Pretty Park, KayKit Forest / City Builder Bits ; Quaternius Stylized Nature comme alternative plus foisonnante. La compatibilité Tiny Treats–KayKit est confirmée par leurs auteurs.
- Comparaison des possibilités réelles : modèles GLB construits par code, images de concept, Meshy et Tripo. Aucun connecteur pour ces deux services trouvé ; aucun achat et aucune génération 3D externe effectués.
- Recherche enregistrée dans `docs/ASSETS.md`. Aucun changement au jeu : la PR #1 reste la version testée (235 tests).
