# Ressources de Tiletown : étude, scénarios, décisions

> Étude du 2026-10-04, menée de zéro (aucune ressource de Seve reprise). Une première passe avait conclu au pixel art 16 px ; l'utilisateur a ensuite demandé un **rendu lisse** (non pixelisé). Une seconde passe en trois volets (modèles 3D basse définition libres, packs 2D lisses, faisabilité technique du rendu) a été menée ; c'est elle qui fait foi. Les rapports complets sont en annexes : A (rendu lisse, §7 à §9), B (étude pixel art écartée, §10 à §14, conservée pour mémoire et pour l'audio, l'interface et les polices qui restent valables).

## 1. Règles de licence

Le dépôt est public. Trois statuts possibles pour une ressource :

| Statut | Licences | Où vit le fichier |
|---|---|---|
| **Dans le dépôt** | CC0, CC BY (crédit nominatif dans `CREDITS.md`), OFL, MIT, Apache | `assets/` public |
| **Hors dépôt** | licences « maison » itch.io, CraftPix, GameDev Market, Unity, Synty, Ovani, Pixabay : usage dans le jeu autorisé, redistribution des fichiers bruts interdite | dossier `assets/licensed/` ignoré par git ; à éviter : la direction retenue n'en a pas besoin |
| **Exclu** | CC BY-SA / GPL (copyleft), CC BY-ND, NC, licences absentes ou contradictoires, contenu « assisté par IA » déclaré, rips, modèles three.js d'exemple sans licence (Flamingo, Parrot, Stork) | — |

## 2. Direction artistique : 3D basse définition (low poly) rendue lisse

### 2.1 Pourquoi

- Les jeux de référence du rendu lisse (Islanders, Townscaper, Dorfromantik, Tiny Glade) sont **des scènes 3D low poly à ombres douces**, pas des dessins 2D.
- **L'écosystème 3D libre est le seul qui couvre un city builder complet en CC0** : ≈ 90 % des besoins (rapport §7), contre ≈ 50 % pour la 2D lisse libre où manquent les bâtiments civiques, l'eau animée, toute la faune vue de dessus et les cyclistes (rapport §8).
- Les modèles 3D donnent **gratuitement** ce que la 2D fait payer très cher : les animaux tournent et marchent dans toutes les directions (animations squelettiques incluses), les saisons sont un changement de couleur, le zoom est lisse à toute échelle.
- Le pixel art est écarté (demande de l'utilisateur) ; la 2D vectorielle dessinée en interne resterait possible (50 à 100 h de dessin, faune symbolique) et la 2D illustrée commandée coûterait 8 000 à 17 000 $.

### 2.2 Couverture par les packs libres (tous CC0 sauf mention, redistribuables)

| Besoin | Source | État |
|---|---|---|
| Maisons (21), immeubles (14 + 5 tours), immeubles modulaires (315 pièces) | Kenney City Kit Suburban, Commercial ; Quaternius Downtown City MegaKit | couvert |
| Commerces, bureaux, usine (20 bâtiments, cheminées, cuves, conteneurs) | Kenney Commercial, Industrial | couvert |
| **Éoliennes, panneaux solaires, château d'eau** | Kenney Industrial 2.0 | couvert |
| Rues : droits, virages, T, croisements, rond-point, **passages piétons**, pont, lampadaires, feux | Kenney City Kit Roads 2.1 (95 pièces), KayKit City Builder Bits | couvert ; pistes cyclables = décalque à peindre |
| **Trams (3), rails, trains** | Kenney Train Kit (103 pièces) | couvert ; gare à assembler |
| Arbres (11 × 3 variantes dont automne, 20 pins, 40 arbres à 7 feuillages), fleurs, rochers, falaises et collines, rivière, chemins, ponts, nénuphars | Kenney Nature Kit (329 modèles), Quaternius Stylized Nature et Ultimate Nature (variantes hiver), KayKit Forest | couvert ; roseaux et arbres fruitiers à modéliser (simples) |
| Champs et cultures en stades (carotte, maïs, blé, citrouille… ; 102 cultures × 5 stades) | Kenney Nature Kit, Quaternius Ultimate Crops | couvert |
| Fontaine, étals de marché, bancs, haies, lanternes | Kenney Fantasy Town Kit, KayKit | couvert ; kiosque à assembler |
| École, mairie, gare, station d'épuration, compost | Kenney Modular Buildings (90 pièces) + cuves et bennes de l'Industrial | **à assembler** (5 bâtiments, < 1 h chacun) |
| Clinique | Quaternius Simple Buildings (hôpital) | couvert, palette à reprendre |
| Habitants animés (12 personnages, **32 clips** : idle, marche, course, assis, conduite…) | Kenney Mini Characters ; Quaternius Universal Characters + 120 animations | couvert |
| **Cerf, renard**, vache, mouton, cheval, loup (12 clips chacun) | Quaternius Ultimate Animated Animals, Farm Animals | couvert |
| **Canard, abeille, chouette** (idle, marche) | Gobkit Free Animal Pack A et B (GLB, une texture) | couvert ; pas de vol pour la chouette |
| Poissons (7, nage), papillon animé | Quaternius Animated Fish, OpenGameArt Butterfly | couvert |
| Grenouille (1 animation) | Sketchfab, CC BY 4.0 | couvert avec crédit |
| Voitures, taxi, camions, van, tracteur (50) ; bus | Kenney Car Kit ; Quaternius Public Transport (bus non texturé) | couvert ; bus à recolorer |
| Fumée, nuage de pollution, eau sale | Kenney Particle Pack (80 sprites) + shader | couvert |
| **Héron, loutre, hirondelle, cycliste** (+ chouette en vol, grenouille qui saute) | — | **manquent** (héron et loutre statiques en CC BY sur Poly Pizza seulement) |

### 2.3 Les manques et comment les combler

| Voie | Coût | Statut |
|---|---|---|
| **Modélisation maison** : formes simples (le style low poly s'y prête : un héron = corps, cou, bec, pattes), export GLB par script ; animations par code (balancement, battement d'ailes, nage) | temps interne | dans le dépôt (CC0) |
| **Commande** à un modeleur low poly : héron (idle, marche, vol), loutre (nage, marche), hirondelle (vol), cycliste (pédalage), chouette en vol, grenouille qui saute ; glTF, rig simple, cession CC0 ou CC BY écrite | 25 à 70 $ par animal sur Fiverr, 17 à 40 $ de l'heure sur Upwork ; **≈ 500 à 900 € pour six animaux** | dans le dépôt après cession |
| Achat acornbringer « Animated Low Poly Animals » | 2 $ | hors dépôt ; n'apporte ni héron ni loutre ni hirondelle : **non retenu** |
| Synty, polyperfect, Unity Asset Store | 20 à 100 $ | EULA sans redistribution, rien d'indispensable : **non retenus** |

### 2.4 Unification du style (rapport §7, mesures dans les fichiers)

- **Échelles** : Kenney City Kit = 1 tuile = 1 unité ; Car Kit à l'échelle réelle (× 0,35) ; KayKit tuile 2 × 2 (÷ 2) ; Quaternius en mètres (× 0,3) ; Gobkit 0,6 u. → table d'échelle par pack, normalisation « 1 tuile = 1 u, y vers le haut, face +Z » par script (gltf-transform).
- **Couleurs** : remplacer textures et matériaux par un matériau à aplats et **quantifier vers une palette commune de 24 teintes** (saisons et calques = changement de palette).
- **Rigs** incompatibles entre Kenney, KayKit, Quaternius, Gobkit : pas de retargeting, chaque modèle garde ses clips ; clonage par `SkeletonUtils.clone`.
- Contour léger (coque inversée) et lumière hémisphérique pour le côté « jouet ».

## 3. Rendu : deux architectures possibles (rapport §9, mesures réelles)

| | **3D temps réel** (three.js, WebGL2) | **Sprites pré-rendus** depuis les mêmes GLB + Canvas 2D |
|---|---|---|
| Lisse au zoom pincé, rotation | **parfait** | flou entre deux échelles, 4 à 8 directions figées |
| Performance sur téléphone | bonne si ≤ 50 appels de dessin (une texture-palette par kit → 10 à 40 appels pour 600 îlots), pixel ratio ≤ 2, 30 i/s au repos | **excellente** (moteur de Seve) |
| Poids | moteur 163 Ko gzip ; modèles ≈ 1,5 à 3 Mo (meshopt) ; précache < 6 Mo | atlas 4 à 6 Mo (deux échelles) |
| Animations | squelettiques natives, particules, eau en shader | feuilles d'images (250 images × 2 échelles) |
| Complexité et risque | plus élevés (contexte WebGL perdu, batterie, 1,2 % d'Android sans WebGL2) | faibles |
| Pipeline | `three` 0.186.1, `@gltf-transform/cli`, meshopt ; interface et textes en DOM par-dessus | Playwright + Chromium + three.js **déjà prouvé dans l'environnement** (îlot 512 px en 0,6 s, 8 directions) |
| Score du rapport | 27 / 35 | 26 / 35 |

**Recommandation du volet technique : hybride 3D temps réel pour la carte + DOM pour l'interface**, avec le pipeline de sprites gardé en plan B (mêmes GLB, bascule sans refaire les contenus). Prototype en trois étapes (carte statique, vallée animée, intégration PWA) avec critères chiffrés : ≤ 60 appels de dessin, 60 i/s, précache < 6 Mo, 30 i/s hors interaction, batterie ≤ 1,5 × Seve.

## 4. Interface, icônes, polices (libre, 0 €)

Pour un rendu lisse, l'interface est **vectorielle** : Kenney UI Pack 2.0 (SVG, 5 couleurs : une par onglet), Input Prompts (gestes du tutoriel) ; icônes **Tabler** (cerf, crue, brume, vent, éolienne, solaire, usine, humeurs) complétées par **Lucide** (même grille) et Material Symbols ; espèces par game-icons.net (CC BY 3.0 : cerf, héron, hirondelle, abeille, chouette, renard) et Font Awesome « otter » (CC BY 4.0). Polices (accents français vérifiés) : **Nunito** 14-16 px pour le corps, **Baloo 2** pour les titres, **Atkinson Hyperlegible Next** pour les chiffres des jauges. Tout texte en DOM, jamais rastérisé dans le canvas.

## 5. Musique et sons (libre, 0 €)

Inchangé (rapport §14) : bande-son CC0 par saison sur OpenGameArt (« Exploring Town », « Chill Out Theme », « Apple Cider », « Kalypo »), couches de prospérité Abstraction (CC0), effets Kenney (Interface Sounds, UI Audio, Music Jingles), ambiances Park Ambiences (CC0) et JC Sounds (CC BY), cris d'animaux Freesound filtré CC0 ; normaliser à −16 LUFS, OGG + MP3. Mieux mais payant et hors dépôt : Ovani Casual Music Pack (50 $, trois intensités).

## 6. Décisions (2026-10-04, confirmées par l'utilisateur)

1. **Rendu lisse, pas de pixel art** : direction **3D basse définition (low poly)** à partir des kits libres Kenney, KayKit, Quaternius, Gobkit ; palette commune de 24 teintes ; interface vectorielle (Kenney UI Pack 2.0, Tabler, Lucide, Nunito, Baloo 2).
2. **Aucun achat** : toutes les ressources retenues sont CC0 ou CC BY. Le scénario d'achats pixel art est annulé.
3. **Rendu : 3D temps réel avec three.js** (WebGL2) pour la carte, interface et textes en DOM par-dessus ; le pipeline de sprites pré-rendus (prouvé, `tools/sprites-proto/`) est le plan B, avec les mêmes modèles.
4. **Un seul dépôt public** `Madec01/Tiletown`, tout dedans (code, modèles, `dist/`), publié sur **GitHub Pages** comme Seve. Plus de dépôt privé ni de Cloudflare Pages.
5. **Faune manquante** (héron, loutre, hirondelle, cycliste, chouette en vol, grenouille qui saute) : **modélisée en interne d'abord** (formes simples, export GLB par script, animations par code) ; commande (≈ 500 à 900 €, cession CC0) seulement si le résultat déçoit.

### Plan d'approvisionnement (tout gratuit, à télécharger et à archiver avec sa licence)

| Pack | Lien | Pour |
|---|---|---|
| Kenney City Kit Roads 2.1 | https://kenney.nl/assets/city-kit-roads | rues, passages piétons, pont, lampadaires, feux |
| Kenney City Kit Suburban 2.0 | https://kenney.nl/assets/city-kit-suburban | maisons (niveau 1) |
| Kenney City Kit Commercial 2.1 | https://kenney.nl/assets/city-kit-commercial | immeubles (niveaux 2 et 3), commerces, bureaux |
| Kenney City Kit Industrial 2.0 | https://kenney.nl/assets/city-kit-industrial | usines, éoliennes, solaire, château d'eau, cuves |
| Kenney Nature Kit | https://kenney.nl/assets/nature-kit | arbres, pins, fleurs, rochers, collines, rivière, cultures |
| Kenney Train Kit | https://kenney.nl/assets/train-kit | trams, rails |
| Kenney Car Kit | https://kenney.nl/assets/car-kit | voitures, camions, van |
| Kenney Fantasy Town Kit 2.0 | https://kenney.nl/assets/fantasy-town-kit | fontaine, étals de marché, bancs, haies |
| Kenney Modular Buildings | https://kenney.nl/assets/modular-buildings | école, mairie, gare, épuration, compost à assembler |
| Kenney Mini Characters | https://kenney.nl/assets/mini-characters | habitants animés (32 clips) |
| Kenney Particle Pack | https://kenney.nl/assets/particle-pack | fumée, pollution |
| Kenney UI Pack 2.0, Input Prompts | https://kenney.nl/assets/ui-pack · https://kenney-assets.itch.io/input-prompts | interface vectorielle, gestes |
| Quaternius Ultimate Animated Animals, Farm Animals, Animated Fish | https://quaternius.com/packs/ultimateanimatedanimals.html · https://quaternius.com/packs/farmanimal.html · https://quaternius.com/packs/animatedfish.html | cerf, renard, vache, mouton, poissons |
| Quaternius Ultimate Crops, Stylized Nature MegaKit, Public Transport | https://quaternius.com/packs/ultimatecrops.html · https://quaternius.com/packs/stylizednaturemegakit.html · https://quaternius.com/packs/publictransport.html | cultures en stades, arbres, bus |
| KayKit City Builder Bits, Forest Nature Pack | https://kaylousberg.itch.io/city-builder-bits · https://kaylousberg.itch.io/kaykit-forest | compléments de ville et de forêt |
| Gobkit Free Animal Pack A et B | https://gobkit.itch.io/gobkit-free-animal-pack · https://gobkit.itch.io/gobkit-free-animal-pack-vol-2 | canard, abeille, chouette |
| OpenGameArt Butterfly (animated) | https://opengameart.org/node/48453 | papillon |
| Sketchfab « Fat Low-Poly Frog » (CC BY 4.0) | https://sketchfab.com/3d-models/fat-low-poly-frog-with-animation-e162d0ecfe6e42f5a3afc4e0893bc560 | grenouille (crédit) |
| Icônes Tabler (MIT), Lucide (ISC), game-icons.net (CC BY 3.0), Font Awesome otter (CC BY 4.0) | https://tabler.io/icons · https://lucide.dev · https://game-icons.net | icônes d'interface et d'espèces |
| Polices Nunito, Baloo 2, Atkinson Hyperlegible Next (OFL) | https://fonts.google.com | corps, titres, chiffres |
| Audio : voir §5 (OpenGameArt, Abstraction, Kenney, Freesound) | | musique, effets, ambiances |

---

# Annexes A : rendu lisse (recherche du 2026-10-04, seconde passe)

## 7. Tiletown — écosystème des modèles 3D low poly libres (rendu lisse)

*Recherche du 2026-10-04. Kenney, KayKit et Gobkit vérifiés en téléchargeant les fichiers GLB/glTF (contenu et tailles mesurés) ; les autres d'après leurs pages officielles.*

### 1. Packs retenus (formats, contenu réel, licence)

| # | Pack (auteur, lien) | Formats | Contenu vérifié | Animations | Licence / dépôt public |
|---|---|---|---|---|---|
| 1 | [City Kit Roads 2.1](https://kenney.nl/assets/city-kit-roads) (Kenney) | GLB, FBX, OBJ | 95 : droits, virages, croisements, T, rond-point, **passage piéton**, variantes trottoir/barrière, pont + piliers, 6 lampadaires, 5 feux, panneaux, poteaux électriques. Tuile 1 × 1 u | — | CC0, oui |
| 2 | [City Kit Commercial 2.1](https://kenney.nl/assets/city-kit-commercial) | idem | 41 : 14 immeubles (a–n), 5 gratte-ciel, 16 « low-detail », auvents, parasols | — | CC0, oui |
| 3 | [City Kit Suburban 2.0](https://kenney.nl/assets/city-kit-suburban) | idem | 40 : 21 maisons (a–u), clôtures, allées, dalles, bac à fleurs, 2 arbres | — | CC0, oui |
| 4 | [City Kit Industrial 2.0](https://kenney.nl/assets/city-kit-industrial) | idem | 37 : 20 bâtiments, 4 cheminées, cuves, 3 conteneurs, **5 panneaux solaires, château d'eau, 2 éoliennes** | — | CC0, oui |
| 5 | [Nature Kit](https://kenney.nl/assets/nature-kit) | GLB, FBX, OBJ, DAE, STL **+ 1 316 rendus isométriques PNG et 322 vues de côté** | 329 : 11 arbres × 3 variantes (normal/sombre/automne), 20 pins, 9 fleurs, herbe, nénuphars, 50 rochers, falaises modulaires (collines), tuiles rivière et chemin, ponts, **cultures** (carotte, melon, citrouille, navet, maïs 4 stades, blé, bambou) | — | CC0, oui |
| 6 | [Car Kit](https://kenney.nl/assets/car-kit) | GLB, FBX, OBJ | 50 : berline, SUV, taxi, police, ambulance, pompiers, **camions**, van, tracteur, karts. **Ni bus ni vélo** | — | CC0, oui |
| 7 | [Train Kit](https://kenney.nl/assets/train-kit) | idem | 103 : rails (droits, courbes, pentes), **3 trams** (classic/modern/round), trains urbains, métro, wagons. **Pas de gare** | — | CC0, oui |
| 8 | [Fantasy Town Kit 2.0](https://kenney.nl/assets/fantasy-town-kit) | idem | 167 : **fontaine modulaire, haies, étals de marché, banc**, lanternes, moulin, murs/toits | — | CC0, oui |
| 9 | [Modular Buildings](https://kenney.nl/assets/modular-buildings) | GLB, FBX | ~90 pièces (murs, fenêtres, toits) + 7 exemples : base pour assembler **école, mairie, gare** | — | CC0, oui |
| 10 | [Mini Characters](https://kenney.nl/assets/mini-characters) | GLB, FBX, OBJ | 12 personnages (6 F / 6 H), fauteuils roulants | **32 clips intégrés au GLB** : idle, walk, sprint, jump, sit, **drive**, emotes… | CC0, oui |
| 13 | [Particle Pack](https://kenney.nl/assets/particle-pack) | PNG 512² | 80 sprites : fumée, feu, étincelles, lumière… (**fumée d'usine, nuage de pollution**) | — | CC0, oui |
| 14 | [Ultimate Animated Animals](https://quaternius.com/packs/ultimateanimatedanimals.html) (Quaternius) | glTF, FBX, OBJ, Blend | 12 : vache, taureau, **cerf, stag, renard**, âne, alpaga, 2 chevaux, loup, husky, shiba ; non texturés | 12+ par animal : Idle, Walk, Gallop, Jump, Attack, Death… | CC0, oui |
| 15 | [LowPoly Animated Farm Animals](https://quaternius.itch.io/lowpoly-animated-animals) | FBX, OBJ, Blend | 6 : vache, cheval, lama, cochon, carlin, **mouton** | Death, Idle, Jump, Run, Walk | CC0, oui |
| 16 | [Farm Animal Pack](https://quaternius.com/packs/farmanimal.html) / [Animated Fish](https://quaternius.com/packs/animatedfish.html) | FBX, OBJ, Blend | 7 animaux de ferme ; 7 **poissons** | animés (nage) | CC0, oui |
| 17 | [Downtown City MegaKit](https://quaternius.com/packs/downtowncitymegakit.html) (05/2026) | glTF, FBX, Blend | 315 pièces modulaires d'**immeubles** texturées ; Standard gratuit (60–70 %), Pro/Source payants | — | CC0, oui |
| 18 | [Stylized Nature MegaKit](https://quaternius.com/packs/stylizednaturemegakit.html) | glTF, FBX, OBJ | 116 : 40 arbres (7 feuillages interchangeables), 35 plantes/fleurs, 27 rochers ; texturé | — | CC0, oui |
| 19 | [Ultimate Nature](https://quaternius.com/packs/ultimatenature.html) / [Ultimate Crops](https://quaternius.com/packs/ultimatecrops.html) | FBX, OBJ, Blend | 150 modèles nature (variantes hiver/automne) ; 102 **cultures en 5 stades** | — | CC0, oui |
| 20 | [Public Transport](https://quaternius.com/packs/publictransport.html), [Cars](https://quaternius.com/packs/cars.html), [Modular Streets](https://quaternius.com/packs/modularstreets.html), [Simple Buildings](https://quaternius.com/packs/simplebuildings.html) | FBX, OBJ, Blend | 12 transports (**bus scolaire**, ambulance, train…) ; 8 voitures ; 25 rues (2018) ; 10 bâtiments texturés dont **hôpital** et boutique | — | CC0, oui |
| 21 | [Universal Base Characters](https://quaternius.com/packs/universalbasecharacters.html) + [Universal Animation Library](https://quaternius.com/packs/universalanimationlibrary.html) | glTF, FBX, Blend | 6 corps, 20 coiffures ; 120+ animations (locomotion, assis, nage…), rig humanoïde | 120+ | CC0, oui |
| 22 | [KayKit City Builder Bits](https://kaylousberg.itch.io/city-builder-bits) ([GitHub](https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0)) | glTF, FBX, OBJ | 40 fichiers : 8 immeubles, 5 voitures, 7 routes (droite, **passage piéton**, virage, T, croisement), lampadaire, 3 feux, **banc**, buisson, château d'eau, poubelles. Tuile **2 × 2 u**. EXTRA 3,95 $ : parc (arbres, fontaine) | — | CC0, oui |
| 23 | [KayKit Forest Nature Pack](https://kaylousberg.itch.io/kaykit-forest) | glTF, FBX, OBJ | gratuit : 100+ arbres/rochers/buissons/herbe ; EXTRA 9,99 $ : 200+ × **8 couleurs** (1 588 fichiers) + terrain modulaire | — | CC0, oui |
| 24 | [KayKit Adventurers](https://kaylousberg.itch.io/kaykit-adventurers) + [Character Animations](https://kaylousberg.itch.io/kaykit-animations) | glTF, FBX | 5 personnages rigués (fantasy) ; 25 clips (Idle, Walk, Run, Wave…) | 25 | CC0, oui |
| 25 | [Gobkit Free Animal Pack A](https://gobkit.itch.io/gobkit-free-animal-pack) et [B](https://gobkit.itch.io/gobkit-free-animal-pack-vol-2) | GLB (une texture, un draw call) | A : **canard**, corgi, chauve-souris, hippo, méduse, platypus, rhino, requin… ; B : **abeille, chouette**, sanglier, chèvre, marmotte, rat, phoque, baleine. Face +Z, champ `copyright` CC0 dans le GLB (vérifié) | idle/attack/dead/walk sur une piste (0–29/30–59/60–89/90–119 @24 fps, `AnimationUtils.subclip`) | CC0, oui |
| 26 | [Poly Pizza](https://poly.pizza) (archive Google Poly + communauté) | glTF, OBJ | **héron** (Poly by Google, statique), chouettes, abeille, ~50 éoliennes, 36 panneaux solaires, château d'eau, loutres statiques ; filtres licence et « animé » | rares | surtout **CC BY 3.0** (crédit), quelques CC0 ; oui avec crédit |
| 27 | OpenGameArt : [Butterfly (animated)](https://opengameart.org/node/48453), [Deer Low Poly rigged](https://opengameart.org/content/deer-low-poly-rigged), [collection CC0 animaux](https://opengameart.org/content/cc0-3d-animals-creatures) | Blend, OBJ | **papillon** animé ; cerf rigué non animé ; poissons, coq, mouton | papillon oui | CC0, oui |
| 28 | [Blend Swap – Flock of Birds](https://blendswap.com/blend/17298) (ElDirector) | Blend 2.7 | 3 oiseaux noirs animés (vol) → export glTF, recolorer | vol | CC0, oui |
| 29 | Sketchfab : [Fat Low-Poly Frog with Animation](https://sketchfab.com/3d-models/fat-low-poly-frog-with-animation-e162d0ecfe6e42f5a3afc4e0893bc560) (Norah) | glTF, FBX | **grenouille** 2 100 tris, 1 animation | 1 | CC BY 4.0, oui avec crédit |
| 30 | three.js `examples/models/gltf/Flamingo|Parrot|Stork.glb` | GLB | oiseaux en vol, crédit « mirada / ro.me » | vol | **licence non précisée** → ne pas redistribuer |

Payants ou non redistribuables (hors dépôt) :

| Pack | Prix | Contenu | Licence |
|---|---|---|---|
| [Animated Low Poly Animals](https://acornbringer.itch.io/assets-animated-low-poly-animals) (acornbringer) | 2 $ | oiseau (11 anim.), bourdon, papillon, pinson, luciole, poisson, **grenouille**, tortue ; 60 anim. ; Unity + FBX | itch standard (usage dans un jeu, pas de redistribution) |
| [Low World – Forest Animals Kit](https://silver-delivery.itch.io/low-world-forest-animals-kit-rigged-animated) | 9,99 $ | ours, sanglier, cerf, renard, élan, lapin, loup ; 36 anim. ; FBX, **GLB**, Blend | non précisée (un acheteur l'a demandée) |
| [SI Animated Duck, Drake and Ducklings](https://sheepintry.itch.io/si-animated-duck-drake-and-ducklings) | 14,99 $ | 18 canards, 37 anim. | propriétaire |
| [polyperfect Low Poly Animated Animals](https://assetstore.unity.com/packages/3d/characters/animals/low-poly-animated-animals-93089) | 50 $ (promo, 100 $) | 57 animaux rigués/animés, 500–1 000 sommets | Unity Single Entity |
| [Synty POLYGON City](https://syntystore.com/products/polygon-city-pack) / [Nature](https://syntystore.com/products/polygon-nature-pack) | 19,99 $ (10 $ promo Unity) / 49,99 $ | ville complète ; nature (arbres animés, papillons en particules) | EULA « Restricted Single Entity » : pas de redistribution des sources |
| ITHappy Animals Free, CraftPix Wild Animals, void1gaming Bikes | gratuits | 7 animaux animés ; 9 animaux rigués (hibou, renard) ; 3 vélos | licences propriétaires : non redistribuables |

### 2. A) Couverture 100 % CC0 / CC BY

| Besoin | Couverture | Source | Manque précis |
|---|---|---|---|
| Maisons / petits immeubles / immeubles | ✔ | Kenney Suburban (21) + Commercial (14 + 5 tours) + KayKit (8) + Quaternius Downtown | — |
| Commerces, bureaux, usine | ✔ | Commercial (auvents), Simple Buildings (boutique), Industrial (20) | — |
| École, mairie, gare | ✘ | à assembler avec Modular Buildings (+ rails Train Kit) | 3 bâtiments signalétiques |
| Clinique | ~ | hôpital Quaternius Simple Buildings (style différent) | reprise palette |
| Marché, bancs, fontaine | ✔ | Fantasy Town (étals, fontaine), KayKit (banc) | kiosque |
| Station d'épuration, compost/recyclerie | ✘ | composer cuves + conteneurs + bennes | 2 bâtiments |
| Éolienne, solaire, centrale, château d'eau | ✔ | Industrial 2.0 | — |
| Pont | ✔ | Roads (road-bridge) + Nature Kit (ponts) | — |
| Rues (droit, virage, T, croisement, passages, trottoirs, lampadaires, feux) | ✔ | Roads 2.1 / KayKit | **pistes cyclables** (décalque à peindre) |
| Arbres (essences, saisons) | ✔ | Nature Kit (default/dark/fall + 20 pins), KayKit (8 couleurs), Quaternius (40) | hiver chez Kenney (recolorer) |
| Haies, buissons, fleurs, prairie, rochers, collines, eau | ✔ | Fantasy Town, Nature Kit (falaises, rivière) | — |
| Roseaux / zone humide | ~ | nénuphars, herbe | roseaux (trivial) |
| Champs / verger | ~ | Nature Kit (7 cultures) + Ultimate Crops (102) | arbres fruitiers |
| Cerf, renard, vaches, moutons | ✔ | Quaternius UAA + Farm | — |
| Canards, abeilles, chouette | ✔ | Gobkit A/B | pas de clip de vol pour la chouette |
| Poissons, papillons | ✔ | Quaternius Fish, OGA Butterfly (.blend à exporter) | — |
| Grenouilles | ~ | Sketchfab CC BY (1 anim.) | saut |
| **Héron, loutre, hirondelle** | ✘ | héron Google Poly statique (CC BY) ; Blend Swap flock (corbeaux) | 3 animaux animés |
| Personnages (marche, idle) | ✔ | Mini Characters (32 clips) ; Universal Characters + 120 anim. | — |
| Cyclistes | ✘ | clip `drive` des Mini Characters + vélo CC BY Google Poly | rig + vélo cohérent |
| Voitures, camion, tram, bus | ✔ | Car Kit, Train Kit (3 trams), Public Transport (bus non texturé) | bus au style Kenney |
| Fumée, pollution, eau sale | ✔ | Particle Pack + shader (three.js `Points`/`ShaderMaterial`) | — |

### 3. B) Assemblage mixte (1–2 achats, hors dépôt)

Pour ~12 $ : **acornbringer (2 $)** ajoute oiseau en vol, grenouille sautant, papillon, bourdon ; **Low World Forest Animals (9,99 $)** un second cerf/renard/sanglier en GLB. Les deux restent hors Git (dossier ignoré, stockage privé) et aucun ne fournit héron, loutre ni hirondelle. polyperfect (50 $) et Synty (20–50 $) n'apportent rien d'indispensable face au gratuit, avec une EULA interdisant la publication des sources. L'achat ne comble donc que « oiseau en vol + grenouille » ; le reste passe par la commande (D).

### 4. C) Cohérence de style et unification

Mesures dans les GLB : **Kenney** City Kit = tuile 1 × 1 u, maison 1,3 × 0,83 u, tour 2,9 u, une texture-palette `colormap.png` par kit, 1 matériau, ombrage plat ; Mini Character 0,67 u (chibi) ; **Car Kit à l'échelle réelle** (berline 2,55 u = 2,5 tuiles) → ×0,35 ; Nature Kit = tuile 1 u, couleurs de matériau sans texture. **KayKit** : tuile **2 × 2 u**, immeuble 1,65 u, voiture 0,94 u, atlas dégradé 1024² → ÷2 ; teintes plus pastel. **Quaternius** : mètres réels, anciens packs sans texture, MegaKits texturés, animaux 1–2 m → ×0,3. **Gobkit** : 0,6 u, texture « unlit ».

Unification : (1) normaliser « 1 tuile = 1 u, y haut, face +Z » par script Node (gltf-transform) ; (2) remplacer les matériaux par un `MeshToonMaterial` sans texture et **quantifier les couleurs vers une palette commune de 24 teintes** (échantillon de texture ou couleur de base → teinte la plus proche) ; (3) contour par coque inversée ou `OutlinePass`, lumière hémisphérique ; (4) pour la variante sprites : rendu Blender orthographique 3/4 (30–35°), 4 orientations, 8–12 images par boucle, comme Kenney le fait déjà pour le Nature Kit (1 316 PNG isométriques).

### 5. D) À modéliser ou à commander

À faire soi-même (simples, < 1 h chacun dans Blender ou par assemblage) : école, mairie, gare/arrêt de tram, kiosque, station d'épuration, compost/recyclerie, roseaux, arbres fruitiers, décalques de pistes cyclables, bus au style Kenney.
À commander (rig + 2–3 boucles) : **héron** (idle, marche, vol), **loutre** (nage, marche), **hirondelle** (vol), **cycliste** (pédalage), chouette en vol, grenouille sautant.
Tarifs constatés : Fiverr 25–70 $ par animal low poly rigué avec idle + walk (gigs à 30 $ « modèle + rig + animation », 70 $ « animal ») ; Upwork 17–30 $/h (animateurs), 25–40 $/h (artistes 3D), lots de personnages rigués 1 000–3 500 $. Sketchfab ne gère pas de commandes (boutique migrée vers Fab) ; passer par ArtStation/itch. Estimation : 6 animaux, 80–150 € pièce = **500–900 €**, en exigeant glTF, rig simple et cession CC0/CC BY écrite.

### 6. E) Pièges

- **Sketchfab** : licence déclarée par l'auteur sans contrôle ; lire la mention exacte (la « Doe animated » est CC BY-NC : exclue). Depuis la migration vers Fab, CC0/BY-SA/BY-NC restent sur Sketchfab et pourront cesser d'être téléchargeables ; archiver fichiers et page de licence.
- **« Royalty free » ≠ libre** (Akochan, CraftPix, ITHappy, Synty, Unity) : usage dans le jeu compilé seulement, jamais dans un dépôt public.
- **Quaternius** : CC0 réel, mais les versions Pro/Source sont payantes et les anciens packs ne sont pas texturés ni en glTF (Blend → export).
- **Google Poly / Poly Pizza** : CC BY 3.0 → crédit nominatif par modèle dans `CREDITS.md` ; site derrière Cloudflare, API avec clé : pas de scraping.
- **Modèles IA** : Meshy publie des « CC0 » générés ; Gobkit se déclare « hand-authored » mais promeut une chaîne IA dans ses métadonnées : contrôler la topologie avant d'adopter.
- **Rigs** incompatibles entre Kenney (FBX + clips séparés), KayKit, Quaternius (rig universel) et Gobkit (16 os, clips concaténés) : pas de retargeting, charger chaque GLB avec ses clips, cloner avec `SkeletonUtils.clone`.
- **Échelles** : Car Kit 2,5 × trop grand pour City Kit ; KayKit 2 × ; Quaternius 3 × → table d'échelle par pack dans le pipeline.
- three.js Flamingo/Parrot/Stork : jolis mais licence absente → exclus.

## 8. Tiletown — packs 2D lisses (vecteur, cartoon, peint) et option « dessin interne »

Recherche du 2026-10-04 (WebSearch étendu, lecture des pages, archives Kenney et index du zip Glitch inventoriés). Cible : grille carrée, vue de dessus/¾, téléphone portrait, dépôt GitHub public.

### 1. Packs retenus

« Dépôt » : redistribuable dans un dépôt public ? **oui** (CC0/CC BY) · **non** (licence maison : jeu compilé seulement).

| # | Pack (lien) | Format / résolution | Perspective | Contenu | Anim. | Style | Prix | Licence | Dépôt |
|---|---|---|---|---|---|---|---|---|---|
| 1 | [Kenney Tower Defense (Top-Down)](https://kenney.nl/assets/tower-defense-top-down) | 299 PNG 64 px + Retina, **1 SVG global** (1 263 tracés) | dessus pur | sols herbe/sable/terre, routes droit/virage/T/croisement, arbres, tours, tanks, soldats | non | plat Kenney | 0 | CC0 | oui |
| 2 | [Kenney Racing Pack](https://kenney.nl/assets/racing-pack) | 420 PNG, **3 SVG** (land/roads/objects) | dessus pur | 15 tuiles route × 3 sols, 10 voitures (5 coul. × 2 tailles), arbres, barrières, cônes, 18 persos | non | plat Kenney | 0 | CC0 | oui |
| 3 | [Kenney Map Pack](https://kenney.nl/assets/map-pack) | 180 PNG, **1 SVG** (496 tracés) | dessus | terrain de carte (herbe, eau, sable, reliefs, forêts), chemins, petits bâtiments | non | plat Kenney | 0 | CC0 | oui |
| 4 | [Kenney Animal Pack Redux (OGA)](https://opengameart.org/content/animal-pack-redux) | 30 animaux × 8 styles, PNG 250 px + vecteur | face (têtes) | vache, canard, grenouille, hibou, élan, cochon… | non | rond/plat | 0 | CC0 | oui |
| 5 | [Kenney Fish Pack](https://kenney.nl/assets/fish-pack) | **126 SVG individuels** + PNG ×2 | côté | poissons, algues, rochers, fond | non | plat | 0 | CC0 | oui |
| 6 | [Kenney Toon Characters](https://kenney.nl/assets/toon-characters) | 6 persos (2 F, 2 H, robot, zombie), **1 SVG/perso**, 48 poses (walk0-7, run0-2…) | côté | marche image par image, parties séparées | oui (frames) | cartoon plat | 0 | CC0 | oui |
| 7 | [Kenney Foliage Pack](https://kenney.nl/assets/foliage-pack) | 100 PNG + 1 SVG | face | arbres, buissons, plantes | non | plat | 0 | CC0 | oui |
| 8 | [Kenney Game Icons](https://kenney.nl/assets/game-icons) / [Generic Items](https://kenney.nl/assets/generic-items) | SVG + AI + PNG | icônes | UI, objets | non | plat | 0 | CC0 | oui |
| 9 | Kenney 3D : [City Kit Roads](https://kenney.nl/assets/city-kit-roads) (95 modèles), [Suburban](https://kenney.nl/assets/city-kit-suburban) 40, [Commercial](https://kenney.nl/assets/city-kit-commercial) 50, [Industrial](https://kenney.nl/assets/city-kit-industrial) 40 (2025), [Nature Kit](https://kenney.nl/assets/nature-kit) 330, [Car Kit](https://kenney.nl/assets/car-kit) 50, [Train Kit](https://kenney.nl/assets/train-kit) 100 | **GLB/OBJ/FBX** vérifiés → sprites 2D via Blender | au choix | routes, feux, panneaux, maisons, commerces, usines, arbres, rochers, voitures, trains | via Blender | low-poly lisse | 0 | CC0 | oui |
| 10 | [KayKit City Builder Bits](https://kaylousberg.itch.io/city-builder-bits) | GLTF/FBX/OBJ, 32 modèles (+16 parc à 3,95 $) | 3D à rendre | immeubles, parc, fontaines | — | low-poly mignon | 0 | CC0 | oui |
| 11 | [Quaternius Ultimate Animated Animals](https://quaternius.com/packs/ultimateanimatedanimals.html) | FBX/OBJ/Blend/glTF, 12 espèces, 12+ anim | 3D à rendre | liste exacte à vérifier au téléchargement | oui (rig) | low-poly | 0 | CC0 | oui |
| 12 | [styloo 2D City](https://styloo.itch.io/2d-city) + [2D Village](https://styloo.itch.io/2d-village) | PNG, **>2 000 sprites 8 directions** (234–244 Mo) ; village >500 (110 Mo) ; résolution non précisée | ¾ (rendus 3D) | maisons, immeubles, véhicules, props ; avec/sans contour | non | cartoon lisse | 0 (PWYW) | CC0 | oui |
| 13 | [Unlucky Studio – Top Down Cars](https://opengameart.org/content/free-top-down-car-sprites-by-unlucky-studio) | PNG HD | dessus | 9 véhicules (taxi, police, ambulance, camion, van…) | police/ambulance (gyrophares) | cartoon | 0 | CC0 | oui |
| 14 | [RGS_Dev Modular Animated Vector Characters](https://rgsdev.itch.io/free-cc0-modular-animated-vector-characters-2d) | PNG 2 048² par image (69 Mo), SVG sur Patreon seulement | ¾/iso | 8 persos montés, parties modulaires, idle/walk/roll/jump/hit/death (DragonBones) | oui | vecteur mignon | 0 | CC0 | oui |
| 15 | [Glitch (Tiny Speck)](https://archive.org/details/glitch-public-domain-game-art) | PNG sprites (zip 389 Mo) ; décors/arbres en **FLA/SWF** seulement ; [SVG objets](https://opengameart.org/content/glitch-misc-assets-svg) | côté | renard, papillon, grenouilles, poulets, cochons, crabe, calmar, flamant, lucioles, rochers, fleurs ; **pas** de cerf/héron/canard/vache | oui (frames) | illustré, très typé | 0 | CC0 | oui |
| 16 | [bevouliin (OGA)](https://opengameart.org/content/bevouliin-free-flying-bird-game-character-sprite-sheets) | PNG + vecteur AI | côté | oiseaux, crocodile, mascottes, décors | oui (frames) | cartoon flappy | 0 | CC0 | oui |
| 17 | [Open Peeps](https://www.openpeeps.com/) / Humaaans | SVG/PNG, 584 000 combinaisons | face (debout, assis, buste) | portraits, UI, dialogues | non | dessin au trait | 0 | CC0 | oui |
| 18 | [Noto Emoji](https://github.com/googlefonts/noto-emoji) · [Twemoji](https://github.com/twitter/twemoji) · Fluent Emoji Flat | SVG | icônes | 🦌 🦦 🦉 🦊 🐸 🦆 🐄 🦋 🐝 🐟 ; pas de héron ni d'hirondelle | non | plat | 0 | Apache 2.0 · CC BY 4.0 · MIT | oui (crédit Twemoji) |
| 19 | [khaledpng Isometric City Builder Vol1](https://khaledpng.itch.io/isometric-city-builder-ultimate-asset-pack) | PNG HD | **iso** | 6 bâtiments, arbres, routes | non | lisse | 1,50 $ | « CC BY 4.0 » mais interdit la redistribution (contradictoire) | douteux |
| 20 | [Last tick – Casual Game Pack](https://last-tick.itch.io/casual-game-pack) | PNG 256 px/tuile (grille 64) | dessus, légère ¾ | bâtiments modulaires, 5 sols, props, 4 arbres, constructeur de persos ; pas de véhicules | GIF persos | **plat vectoriel, très proche de la cible** | 0 (PWYW) | maison (pas de redistribution, pas d'IA) ; publié il y a 2 jours | non |
| 21 | [nacl1234 Modern City Outdoor Mega Pack](https://nacl1234.itch.io/top-down-modern-city-outdoor-2d-mega-pack) | 195 PNG + 32 tuiles, atlas JSON (24 Mo) | dessus | mobilier, verdure, 16 véhicules garés, parc ; **pas de bâtiments** | non | flat-cartoon | 0 (PWYW) | non précisée ; **« AI assisted »** | non |
| 22 | [Buggy Studio Top Down City Pack](https://buggystudio.itch.io/top-down-city-pack) | PNG (4 Mo) | dessus/¾ | 45 bâtiments, végétation, 6 sols, rues, véhicules | non | dessiné lisse, ombres | 0 (PWYW) | **non précisée** | non |
| 23 | [GameDeveloperStudio – Top down city mega pack](https://gamedeveloperstudio.itch.io/top-down-city-mega-pack) | **vecteur + PNG** (17 Mo) | dessus | routes, trottoirs, bâtiments modulaires, décor | non | cartoon propre | 20 $ | [licence GDS](https://www.gamedeveloperstudio.com/license.php) : commercial OK, redistribution interdite | non |
| 24 | GDS faune : [environnement](https://gamedeveloperstudio.itch.io/top-down-environmental-asset-pack) 18 $, [9 oiseaux](https://www.gamedeveloperstudio.com/graphics/viewgraphic.php?page-name=Top-down-birds-game-sprite-pack&item=1n6p6g2n5p6p3z2z11) 4,95 $, [papillons](https://gamedeveloperstudio.itch.io/butterflies) 1,50 $, renards top-down, grenouille, canard, abeille (1–5 $) | Spriter rig + PNG HD + **SVG des parties** | dessus | pigeon, corneille, moineau, mouette, renard roux/noir (idle, marche, course, mange, dort) | oui (rig) | cartoon | ~35 $ le lot | GDS | non |
| 25 | [Roupiks Flashy City](https://roupiks.itch.io/flashy-city) | SVG/EPS/PNG + 4 atlas | **iso 2:1** | 10 bâtiments × 4, sols, routes, 4 véhicules × 6 coul. × 4 dir., UI | non | vecteur plat | 4,99 $ | maison (pas de redistribution) | non |
| 26 | [RhosGFX Vector Structures PRO](https://rhosgfx.itch.io/vector-structures-pack-pro) · [RPG Overworld](https://rhosgfx.itch.io/rpg-overworld) · [Vector Animals](https://rhosgfx.itch.io/vector-animals-pack) | SVG (PRO) + PNG 64/256 | face (icônes) ; overworld dessus | bâtiments moderne/sf/fantasy ; terrain 47 tuiles, maisons, pont, animaux de ferme ; 1 400 icônes animaux | non | vecteur arrondi | 6,99 / 4,99 / 7,99–11,99 $ | maison ; licence commissions 89,99 $ | non |
| 27 | [Captain Moo Paper-Cut Nature](https://captain-moo.itch.io/nature-pack) | PNG 64 + 256 px | dessus | herbe/terre/eau 3 teintes, **eau animée 21 images**, rochers, fleurs, 3 arbres | eau | papier découpé | 3 € | maison (pas de redistribution) | non |
| 28 | [Penzilla Isometric City Builder](https://penzilla.itch.io/giant-city-builder) | PNG 512 × 292 | **iso** | 500+ items, 61 bâtiments publics, 50 véhicules | props animés | peint à la main | 10 $ | Penzilla (crédit obligatoire) | non |
| 29 | [Daniel Thomas – Hand Painted Town](https://danielthomasart.itch.io/2d-hand-painted-town-tileset) | PNG 128 px + PSD (89 Mo) | dessus RPG | maisons modulaires, marché, puits, saisons, eau animée | eau | peint | 13 $ | non précisée | non |
| 30 | [craftpix Free Simple Summer Top-Down Vector](https://craftpix.net/freebies/free-simple-summer-top-down-vector-tileset/) | **AI/EPS/PNG 256 px** | dessus | routes droit/virage/croisement, arbres, pierres, bâtiments médiévaux | non | vecteur | 0 | [craftpix](https://craftpix.net/file-licenses/) : jeu OK, sources non redistribuables | non |
| 31 | Unity Asset Store : [Top Down Shooter Graphic Kit](https://marketplace.unity.com/packages/tools/sprite-management/top-down-shooter-graphic-kit-154585) 4,99 $ ; 2D Isometric Cartoon City 25 $ | PNG | dessus / iso | sols, routes, bâtiments, véhicules, humains | non | cartoon | 5–25 $ | EULA Unity : aucune redistribution | non |
| 32 | [innerchildstudio Happy Town](https://innerchildstudio.itch.io/happy-town) · [100 Happy Trees](https://innerchildstudio.itch.io/100-happy-trees-icon-pack) · Transportation · 250 People | PNG 512 px | **face (icônes)** | 300 bâtiments, 75 lieux, 100 arbres (saisons), véhicules, gens | non | kawaii | 0–2,49 $ | « libre, sans crédit, pas de revente » | gris |

Écartés : ludicarts City (vue de côté), Kenney Sketch Town/Isometric Miniature (iso, **aucun SVG**), Cartoon City Massive Pack (3D), ZamCham Pond (non redistribuable), Humble Bundle 2025 (pixel art), Scirra/Gumroad (rien de pertinent), schwarnhild (pixel).

### A. Assemblage 100 % CC0/CC BY

| Besoin | Source libre | État |
|---|---|---|
| Maisons 3 densités, commerces, bureaux, usine | styloo 2D City ; ou rendus Kenney City Kits (Suburban/Commercial/Industrial) | OK (styloo : ¾, lourd ; Kenney : travail Blender) |
| École, clinique, marché, mairie, gare/tram, épuration, éolienne, solaire, centrale, compost, château d'eau | Kenney Train Kit (gare), Industrial (cheminées/silos) | **manques** : dessiner ≥ 9 bâtiments |
| Parc, pont | Nature Kit, KayKit parc, Map Pack | partiel (pont routier à vérifier) |
| Rues autotuiles | Kenney Tower Defense + Racing (droit, virage, T, croisement) | OK |
| Passages piétons, pistes cyclables | City Kit Roads (passages) | partiel, pistes **manquent** |
| Arbres essences/saisons, haies, fleurs, prairie | TD (2 arbres), Nature Kit (nombreux), Foliage (face) | partiel ; saisons = recoloration |
| Zone humide/roseaux, collines, champs, verger | Nature Kit (rochers, reliefs) | roseaux/verger **manquent** |
| Rivière autotuiles, eau animée, lac | Map Pack (statique) | animation **manque** (à coder) |
| Animaux animés | Glitch (renard, grenouille, papillon, côté), Quaternius 3D, icônes Kenney/Noto | cerf, héron, loutre, abeilles, chouette, hirondelle, vaches top-down : **manquent** |
| Personnages, cyclistes | Toon Characters (côté), RGS_Dev (¾) | cyclistes **manquent** |
| Voitures, bus, camion, vélo, tram | Racing, Unlucky, Car Kit, Train Kit | vélo **manque**, tram partiel |
| Fumée, pollution, eau sale | Kenney Particle Pack (CC0) + teintes | OK |

Verdict : sols, routes et véhicules couverts ; bâtiments civiques, eau animée, faune et cyclistes restent à produire. Mélanger Kenney (dessus pur) et styloo (¾) se verra.

### B. Avec 1 à 3 achats (hors dépôt)

1. **GDS Top down city mega pack** (20 $) + **environnement** (18 $) : vecteur cohérent, routes/trottoirs/bâtiments/forêt ; ni éolienne, ni école, ni épuration.
2. **GDS faune** (~35 $ : oiseaux, renards, papillons, grenouille, canard, abeille) : rigs Spriter + SVG réutilisables ; pas de cerf, héron, loutre, chouette, hirondelle, vache top-down.
3. **Last tick Casual Game Pack** (gratuit mais non redistribuable) : le plus proche du style visé pour la ville.

Total ≈ 55–75 $. Contrainte : ces fichiers ne peuvent pas être dans le dépôt public ; prévoir un dépôt privé d'assets chargé au build. Le `dist/` sur GitHub Pages contient quand même des PNG extractibles : toléré par GDS/craftpix, interdit par Unity/Freepik.

### C. Dessin vectoriel en interne

**Faisabilité** : ~150 tuiles en style géométrique (Mini Motorways) = primitives (rectangles arrondis, cercles, chemins), palette de 14–16 couleurs, une seule ombre portée, saisons par recoloration. Deux voies : Inkscape (symboles, calques nommés) pour bâtiments/props ; génération procédurale JS (Path2D) pour le combinatoire : routes (16 masques de connexions arrondis), rivière (Bézier entre bords), champs (hachures), haies, foule. Animations par code : balancement, translation sur chemin, battement d'ailes (échelle), eau (décalage sinusoïdal), fumée (cercles grossissant et s'estompant). Rendu : rasteriser les SVG en atlas au chargement selon le DPR (OffscreenCanvas) ; Path2D par image seulement pour les sprites animés.

**Avantages** : cohérence totale, poids (quelques dizaines de Ko contre 244 Mo chez styloo), netteté à tout DPR, calques lisibles et recolorables (saisons, pollution, nuit), 100 % libre (CC0 maison, publiable).

**Limites** : faune symbolique (cerf = capsule + tête + deux traits ; héron = ligne de cou + corps), expressivité réduite aux poses et au rythme ; temps : 150 tuiles × 20–40 min ≈ 50–100 h, + 12 animaux × 2–3 h, + code ; risque de rendu « pictogramme » sans texture ni grain.

**Commission** (sources 2025–2026) : objets vectoriels plats 40–120 $/asset ([Rocketbrush](https://rocketbrush.com/blog/2d-character-art-prices-and-tips-to-cut-costs)) ; personnage cartoon 300–900 $ en freelance ; animation 50–3 000 $ ; tileset d'environnement 500–1 500 $ (entrée/milieu) à 2 000–4 000 $ (senior) sur [Upwork](https://www.upwork.com/hire/2d-game-art-freelancers/) ; horaires : 15–30 $ Europe de l'Est, 10–20 $ Asie du Sud-Est, 50–100 $ Amérique du Nord. Fiverr à 10–20 $ = presque exclusivement pixel art. Estimation Tiletown : 150 tuiles ≈ 6 000–12 000 $ ; 12 animaux animés (4 frames) ≈ 150–400 $ pièce → 2 000–5 000 $ ; total 8 000–17 000 $ (ou 100–200 h à 15–30 $/h ≈ 2 000–6 000 $). Exiger la cession complète des droits et les SVG sources.

### D. Pièges

- **Iso vs grille carrée** : Flashy City, Penzilla, khaledpng, Sketch Town, 2D Isometric Cartoon City sont en 2:1 ; inutilisables sur une grille carrée vue de dessus. styloo (¾ rendu 3D) et Last tick (légère ¾) ne se mélangent pas avec Kenney (dessus pur).
- **Résolutions/poids** : RGS_Dev 2 048² par image, styloo 244 Mo, Daniel Thomas 89 Mo ; sur téléphone (DPR 2,6) une tuile de 64 px CSS ≈ 170 px physiques : atlas ≤ 4 096², 2 niveaux de DPR, décodage asynchrone. Les SVG rasterisés au chargement évitent ces soucis.
- **Licences** : Freepik/Flaticon/Vecteezy = attribution + pas de redistribution ; les [conditions Freepik](https://www.magnific.com/legal/terms-of-use) excluent même les jeux/apps en gratuit ; Envato = enregistrement par projet ; EULA Unity = aucune redistribution (GitHub compris) ; licences maison (GDS, craftpix, RhosGFX, Penzilla, Captain Moo, Last tick) = jeu OK, sources publiques non ; « non précisée » (Buggy Studio, nacl1234, Daniel Thomas) = aucun droit ; khaledpng « CC BY sans redistribution » = incohérent.
- **BY-SA** : OpenMoji (CC BY-SA 4.0) contamine les dérivés ; préférer Noto (Apache 2.0) ou Fluent (MIT).
- **IA déclarée** : nacl1234 est marqué « AI assisted » ; filtrer itch.io sur « No generative AI was used ».
- **Packs morts/fragiles** : Glitch (2013, sources Flash, décors non extraits), Kenney TD/Racing/Map (2015–2016, figés), Twemoji (CDN éteint, Unicode 14), Last tick (2 jours d'existence), RhosGFX (financement participatif). Open Peeps et emojis sont des icônes de face, pas des marcheurs.

## 9. Tiletown — rendu « lisse » : trois architectures comparées

*Recherche du 2026-10-04 (web + mesures réelles dans l'environnement de développement). Cible : Pixel 7 (412 × 915 CSS, DPR 2,625), 360 × 740 → 430 × 932, PC ; grille 12 × 16 à 16 × 24 îlots ; 300 à 600 tuiles + ~100 acteurs animés ; zoom pincement continu ; style Islanders / Townscaper / Dorfromantik / Mini Motorways.*

### Mesures faites ici (pas des chiffres de blog)

| Mesure | Résultat |
|---|---|
| `three` 0.186.1 (r186, 24 sept. 2026), bundle minimal WebGL (renderer + ortho + InstancedMesh + GLTFLoader + meshopt), esbuild min + gzip | **642 Ko → 163 Ko gzip** |
| `three/webgpu` complet, min + gzip | 1 083 Ko → 297 Ko gzip |
| `pixi.js` 8.22.0 complet, min + gzip | 922 Ko → 265 Ko gzip |
| Décodeur meshopt (`meshopt_decoder.module.js`) | 29 Ko ; Draco : 286 Ko wasm + 59 Ko |
| Rendu hors ligne : Playwright 1.56.1 + Chromium 1194 (`/opt/pw-browsers`), `--use-angle=swiftshader --enable-unsafe-swiftshader` | WebGL2 **oui**, MSAA 4 échantillons, renderer « ANGLE Vulkan SwiftShader » ; îlot 512 × 512 avec ombres, 8 directions : **589 ms** (≈ 74 ms/image) ; PNG RGBA 30 Ko. Blender : **absent** de l'environnement. |
| r186 | `PCFSoftShadowMap` **supprimé** (repli automatique sur `PCFShadowMap`) ; `Object3D.dispose()` ajouté |

Script et image témoin : `scratchpad/proto-sprite/` (`scene.js`, `render.mjs`, `ilot-2x.png`).

### 1. 3D temps réel (three.js / Babylon.js, WebGL2)

**Principe.** Modèles GLTF low poly CC0 ([Kenney City Kit](https://poly.pizza/bundle/City-Kit-0CkvGrBJ0u), [KayKit City Builder Bits](https://kaylousberg.itch.io/city-builder-bits) : 32+ modèles, un seul atlas dégradé 1024² réductible à 128², [Quaternius](https://quaternius.itch.io/lowpoly-animated-animals) : animaux riggés), caméra orthographique 3/4, une lumière directionnelle avec ombre, instancing.

**Performance.** Le goulot mobile est le nombre de draw calls, pas les triangles : budget « < 100 draw calls, < 100 k sommets », et plutôt **< 50 sur téléphone** ([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips), [D. McCurdy](https://discourse.threejs.org/t/bad-performance-when-loading-more-than-3500-meshes-into-the-scene/63960/4)). Atout décisif : les kits Kenney/KayKit partagent **une seule texture palette** → tous les bâtiments et arbres statiques tiennent dans 1 à 3 `BatchedMesh` (multi-draw) ou un `InstancedMesh` par modèle ; 600 tuiles ≈ 10 à 40 draw calls. Les animaux : `InstancedMesh.setMorphAt` (instancing de morph targets, exemple `webgl_instancing_morph`, 1 024 chevaux animés en un appel) ; le skinning instancié n'existe nativement qu'en WebGPU (`webgpu_skinning_instancing`) ; en WebGL on partage un squelette (`DetachedBindMode`) ou on cuit l'animation en textures. Ombres : une seule lumière, carte 2048, `PCFShadowMap`/`VSM` — PCF à grand noyau est trop lourd sur GPU mobile ([forum](https://discourse.threejs.org/t/how-to-optimize-shadow-rendering-in-three-js-for-better-performance/64681)). Pixel ratio plafonné à 2 (de 1,5 à 3 = travail ×4) ; MSAA 4× quasi gratuit sur GPU mobiles à tuiles ; une scène immobile « cuit le téléphone » si l'on rend en boucle → rendu à 30 i/s hors interaction ([dev.to](https://dev.to/dheerajakula/why-a-static-threejs-scene-still-cooks-your-phone-and-the-dirty-flag-fix-3a6h)).

**Poids / chargement.** 163 Ko gzip de moteur ; meshopt préféré à Draco (décodage 10× plus rapide, décodeur 29 Ko vs 345 Ko, taille gzip proche — [compress-glb](https://compress-glb.com/blog/draco-vs-meshopt/), [cinevva](https://app.cinevva.com/guides/optimize-glb-for-web)) ; 150 modèles palette ≈ 1,5 à 3 Mo ; animaux riggés ≈ 100 à 300 Ko chacun. Précache PWA total < 6 Mo : sans problème (Chrome Android autorise jusqu'à 80 % du disque, [love2dev](https://love2dev.com/blog/what-is-the-service-worker-cache-storage-limit)).

**Code.** Sélection tactile : inutile de raycaster les meshes, on déprojette le doigt sur le plan du sol → indice d'îlot (fonction pure, testable). Outline : plan surligné sous l'îlot ou coque inversée, jamais `OutlinePass` (post-process plein écran). Calques : `instanceColor`/couleur de sommets, palette daltonienne = simple table de couleurs. Lisse **garanti à tout zoom et toute rotation**. WebGL2 : 98,8 % des Android ([web3dsurvey](https://web3dsurvey.com/webgl2)) ; WebGPU : Chrome Android 121+ sur Android 12+ ([Chrome](https://developer.chrome.com/docs/web-platform/webgpu/overview)) — option, pas prérequis.

**Comparables.** [Townscaper web](https://www.pcgamer.com/au/the-most-pleasant-game-of-2021-is-now-playable-in-your-browser) (Unity WebGL + wasm, pas three.js, mais même rendu), [Summer Afternoon](https://discourse.threejs.org/t/summer-afternoon/46963) (three.js, jouable sur téléphone), [Savanna Sam](https://discourse.threejs.org/t/3d-action-browser-game-made-with-three-js-savanna-sam/81902) (three.js, porté Android via Capacitor), [m4rbl3](https://discourse.threejs.org/t/m4rbl3-com-classic-3d-solitaire-puzzle-game-built-with-three-js/89282).

**Babylon.js** 9.29 : `@babylonjs/core` ≈ 1,8 Mo gzip (Babylon Lite réduit fortement mais est récent, [utsubo](https://www.utsubo.com/blog/threejs-vs-babylonjs-vs-playcanvas-comparison)) : écarté pour un PWA téléphone.

### 2. Sprites 2D lisses pré-rendus + Canvas 2D

**Pipeline (prouvé ci-dessus).** `tools/render-sprites.mjs` : esbuild regroupe une scène three.js (caméra ortho 3/4, lumière, ombre, fond transparent, `preserveDrawingBuffer`) ; Playwright lance Chromium SwiftShader ; pour chaque GLB : rendu aux échelles 2× et 3× (DPR 2,6), 8 directions, N images d'animation via `AnimationMixer.setTime` ; `toDataURL` → PNG ; empaquetage en atlas (bin packing maison ou `free-tex-packer-core`), export WebP sans perte ; JSON des cadres. Versionné, reproductible, ≈ 1 à 2 min pour 150 tuiles + 250 images × 2 échelles. Blender (`blender -b -P`, [blender-isometric-renderer](https://github.com/chinjieh/blender-isometric-renderer)) donnerait Cycles/EEVEE mais n'est pas installé ; inutile ici. Variante GPU Node : [@onirenaud/node-webgl](https://github.com/RenaudRohlinger/node-webgl) (ANGLE sans navigateur).

**Qualité.** Lisse à l'échelle native ; entre deux échelles, interpolation bilinéaire → léger flou ; zoom au-delà de 3× → flou net ; **rotation impossible**, directions figées (un cerf qui tourne « saute » de 45° en 45°). Poids : 150 tuiles 192² + 250 images 128² à 2× ≈ 10 Mpx ≈ 2,5 Mo PNG / 1,5 Mo WebP, ×2,25 pour l'échelle 3× → **4 à 6 Mo** au total. Moteur : celui du projet frère (Canvas 2D, atlas, rAF, tri par y) presque inchangé.

### 3. 2D vectoriel (SVG DOM, Canvas Path2D, SVG rasterisé)

SVG dans le DOM : fluide jusqu'à ~100 à 1 000 éléments animés, 30 à 40 i/s à 2 000 ([svggenie](https://www.svggenie.com/blog/svg-vs-canvas-vs-webgl-performance-2025), [vijayt](https://blog.vijayt.com/svg-vs-canvas-performance-cut-offs-benchmarking-hybrid-strategies/)) ; `<use>` par milliers est la technique la plus lente sous Chrome ([cloudfour](https://cloudfour.com/thinks/svg-icon-stress-test)). 600 tuiles × ~10 chemins + 100 acteurs = 6 000 à 8 000 nœuds : trop pour un téléphone de milieu de gamme. Canvas 2D + `Path2D` mis en cache (1 Path2D par calque, un `setTransform` par image, [Felt](https://felt.com/blog/from-svg-to-canvas-part-1-making-felt-faster)) ou rasterisation bitmap par niveau de zoom tient, mais 150 tuiles dessinées à la main en vecteurs est le coût de production le plus élevé ; style géométrique à la Mini Motorways atteignable, faune réduite à des silhouettes (cerf, héron OK ; loutre, renard peu lisibles). Lisse par nature, poids minuscule, animations par interpolation.

### A. Tableau comparatif (sur 5)

| Critère | 1. 3D temps réel | 2. Sprites pré-rendus | 3. Vectoriel |
|---|:-:|:-:|:-:|
| Lisibilité et « lisse » (zoom continu, rotation) | **5** | 3 | 5 |
| Performance mobile (600 tuiles + 100 acteurs) | 3 | **5** | 2 (SVG) / 3 (Canvas) |
| Poids et hors ligne | 4 (≈ 5 Mo) | 3 (4 à 6 Mo) | **5** |
| Complexité et risque | 2 | **4** | 3 |
| Cohérence avec logique pure testable | 4 | **5** | 5 |
| Richesse d'animation (faune, véhicules, fumée, eau) | **5** | 3 | 3 |
| Coût de production des contenus | **4** (CC0 direct) | 3 (pipeline auto) | 2 (tout dessiner) |
| **Total** | **27** | **26** | 25 / 26 |

### B. Recommandation

**Architecture principale : hybride « 3D temps réel pour la carte + DOM pour l'interface ».** C'est la seule qui donne exactement le rendu demandé (Townscaper/Islanders sont des scènes 3D low poly à ombres douces), un lisse garanti au zoom pincé, des animaux qui tournent et marchent sans direction figée, et des contenus CC0 utilisables tels quels. Son surcoût de complexité est circonscrit par trois règles : la simulation (`src/core`, `src/data`) reste pure et émet un état ; un adaptateur `src/render3d` le projette en instances ; toute l'interface (boutons, carnet, légendes des calques, textes) est en HTML/CSS par-dessus le canvas, donc nette et accessible sans effort. **Plan B conservé** : le pipeline de sprites (option 2) est déjà prouvé et réutilise les mêmes GLB ; si l'étape 2 du prototype échoue sur bas de gamme, on bascule sans refaire les contenus.

**Bibliothèques (toutes MIT sauf mention).**
- `three` 0.186.1 — WebGLRenderer, `BatchedMesh`, `InstancedMesh`, `GLTFLoader` + `MeshoptDecoder` : ≈ 163 Ko gzip. `three/webgpu` (297 Ko) plus tard, si le skinning instancié natif devient nécessaire.
- `@gltf-transform/cli` 4.5.1 — `optimize --compress meshopt`, `dedup`, `palette`, `instance` sur les kits.
- `meshoptimizer` (décodeur 29 Ko, livré avec three).
- `troika-three-text` 0.52.5 — texte SDF dans la scène, seulement si des étiquettes doivent suivre la caméra ; sinon `CSS2DRenderer` (inclus).
- Dev : Playwright 1.56.1 (Apache-2.0) — tests visuels de régression sous SwiftShader et génération des sprites du plan B ; esbuild 0.28.2 (déjà dans le projet).
- Contenus : Kenney City Kit (Commercial, Suburban, Roads, Industrial), KayKit City Builder Bits, Quaternius animaux (CC0). Héron, loutre, chouette, hirondelle, abeilles : **pas garantis en CC0** → prévoir 3 à 5 modèles maison ou dérivés (vrai pour les trois options).

**Prototype en trois étapes (objectif : chiffres mesurés sur Pixel 7 et sur un 360 × 740 bas de gamme).**
1. **Carte statique (2 j).** Grille 16 × 24, 500 îlots issus des kits, un `BatchedMesh` par texture, lumière + `PCFShadowMap` 2048, caméra ortho 3/4 à pincement/défilement, pixel ratio plafonné à 2. Critères : `renderer.info.render.calls` ≤ 60, ≤ 150 k triangles, 60 i/s stables, premier rendu < 3 s en 3G, précache < 6 Mo.
2. **Vallée animée (3 j).** 60 habitants + 20 animaux (morph-instancing ou squelette partagé) + 20 véhicules sur les arêtes, fumée en particules instanciées, eau en shader. Critères : 60 i/s, 30 i/s en mode économie hors interaction, consommation batterie mesurée sur 15 min comparée au jeu de ferme (cible ≤ 1,5×), surchauffe nulle.
3. **Intégration (2 j).** UI DOM par-dessus, calques colorés (couleurs d'instances + palette daltonienne), perte/restauration de contexte simulée (`WEBGL_lose_context`), service worker précache, test 360 × 740 et 430 × 932, PC souris.

### C. Risques et parades

| Risque | Parade |
|---|---|
| WebGL sur vieux Android (1,2 % sans WebGL2, Mali-400) | Détection au lancement ; message clair ; plan B sprites si la part des joueurs le justifie. |
| Perte de contexte (onglet en arrière-plan, GPU repris) | `webglcontextlost` → `preventDefault()`, pause de la boucle ; `webglcontextrestored` → three recrée textures/shaders ; limiter à 1 contexte ; test systématique via `WEBGL_lose_context` ([svilenkovic](https://svilenkovic.com/3d/webgl-context-lost-fix)). |
| Batterie et chauffe | Pixel ratio ≤ 2, MSAA 4 au lieu de post-process, 30 i/s hors interaction et quand `document.hidden`, pas de rendu sur scène immobile, ombre statique recalculée seulement quand la carte change. |
| Taille des GLB vs précache | meshopt + palette ; charger les kits par lots (ville, nature, faune) ; `navigator.storage.estimate()` ; viser < 6 Mo au premier lancement. |
| Antialiasing à DPR 2,6 | `antialias: true` (MSAA 4) + rendu à 2× au lieu de 2,625 ; les bords low poly restent nets ; contrôle visuel à 360 px. |
| Texte lisible | Tout texte en DOM (jamais rastérisé dans le canvas) ; étiquettes monde via `CSS2DRenderer` ou troika SDF. |
| Skinning instancié absent en WebGL | Morph-instancing (`setMorphAt`), squelette partagé par espèce, ou textures d'animation cuites ; migration `three/webgpu` possible sans changer la scène. |
| r186 : `PCFSoftShadowMap` supprimé | Utiliser `PCFShadowMap` ou `VSMShadowMap` avec `radius` faible. |
| Daltonisme des calques | Les calques sont des couleurs d'instances : trois palettes (normale, deutéranopie, tritanopie) + motifs/hachures en option. |
| Faune introuvable en CC0 | Budget de modélisation Blender (hors environnement) ou dérivés d'animaux CC0 existants ; licences notées dans `CREDITS.md`. |

---

# Annexes B : étude pixel art (première passe, écartée le 2026-10-04)

> Conservée pour mémoire. Les volets interface-polices (§13) et audio (§14) restent valables ; les volets graphiques (§10 à §12) ne s'appliquent plus.

## 10. Tiletown — comparatif de 5 directions artistiques (recherche du 2026-10-04)

**Cadre.** Écran de référence 412 × 915 px CSS, DPR 2,625 (Pixel 7 : 1080 × 2400 physiques, [yesviz](https://yesviz.com/devices/google-pixel-7/)). Cible tactile ≥ 48 dp. Canvas rendu en pixels physiques ; une tuile « confortable » ≈ 48 px CSS (≈ 128 px physiques) donne **8,5 × 19 tuiles visibles (≈ 160)** quelle que soit la direction : seul le détail logé dans ces 128 px change. Catalogue à produire : ~25 types de tuiles × 2–3 variantes, autotuiles (rues sur arêtes : 2 segments + 16 nœuds ; rivières/haies/lacs : 16–47 formes), 7 animaux × 4 directions × 3–4 images, véhicules, habitants, effets → **≈ 150 tuiles statiques + ≈ 250 images d'animation ≈ 400 éléments**.

### 1. Pixel art 16 px (top-down 3/4 léger)

- **Lisibilité.** Affiché ×3 (48 px CSS) : 8,6 × 19 tuiles, mais 1 pixel d'art = 7,9 pixels physiques : densité gaspillée. École, clinique et mairie se distinguent mal sans icône ; un héron ou une loutre font 6–10 px. Calques : désaturer la carte sous la heatmap.
- **Coût.** Le moins cher : 2,5–3 $/tuile ([Moneyinpocket : 32 tuiles 16 px = 30 $](https://www.fiverr.com/moneyinpocket/make-a-pixel-art-tileset-for-your-2d-game)). 400 éléments ≈ 1 000–1 500 $.
- **Écosystème : le plus riche.**

| Pack | Contenu | Prix | Licence |
|---|---|---|---|
| [Kenney Tiny Town](https://kenney.nl/assets/tiny-town) | 130 tuiles village | gratuit | CC0 |
| [Kenney RPG Urban Kit](https://kenney-assets.itch.io/rpg-urban-kit) | 480+ sprites : routes, bâtiments, véhicules, 6 persos | gratuit | CC0 |
| [LimeZu Modern Exteriors](https://limezu.itch.io/modernexteriors) | ville moderne complète, véhicules animés, 16/32/48 px, 400 mises à jour | 5 $ (promo 2,50 $) | propriétaire : crédit, pas de redistribution |
| [Greywyrd Lo-Bit City](https://greywyrd.itch.io/lo-bit-city) | ville moderne modulaire | gratuit | custom : crédit, pas de revente |
| [Claryu Top-Down City](https://claryu.itch.io/16x16-top-down-city-tileset) | quartiers, entrepôts, véhicules, PNJ | 2,99 $ | custom, pas de redistribution |
| [NYKNCK City Pack](https://nyknck.itch.io/citypackpixelart) | bâtiments animés, voitures, lac | prix libre | commercial avec crédit |
| [Hedi Dev City Streets](https://hedi-dev-studio.itch.io/city-street-top-down-tileset) | routes, panneaux, arbres (sans bâtiments) | 2 $ | CC BY-ND (aucune retouche !) |
| [inkBubi Seasons of Forest](https://inkbubi.itch.io/) ([échantillon CC0](https://opengameart.org/content/free-sample-16x16-pixel-forest-animal-pack-%E2%80%93-top-down-rpg-style)) | renard, cerf, chouette, écureuil, grenouille en 4 directions ; tileset forêt | 5 $ + 5 $ | échantillon CC0, complet propriétaire |
| [Pixel-Boy Ninja Adventure](https://pixel-boy.itch.io/ninja-adventure-asset-pack) | tilesets, 50 persos, animaux (mars 2026), sons | gratuit | CC0 |

- **Rendu.** Trivial : atlas + `drawImage`, `imageSmoothingEnabled=false`.
- **Jeux mobiles.** Stardew Valley ([41 M ventes](https://gamerhorizon.blog/stardew-valley-sales-figures)), Kingdom Two Crowns.
- **Couverture.** Ville, routes, véhicules : oui. Tram, éolienne, épuration, centrale, zone humide, colline, les 7 animaux : **non → ~40 % à commander**.

### 2. Pixel art 32 px

- **Lisibilité.** Affiché ×4 physique (48,8 px CSS) : **8,4 × 18,7 tuiles, autant qu'en 16 px**, avec quatre fois le détail : enseigne, croix de clinique, pales d'éolienne, bec du héron deviennent lisibles sans icône. Contours plus fins : la heatmap respire mieux.
- **Coût.** 3–7 $/tuile 32 px, 5–10 $ en 64 px ([forum RPG Maker](https://forums.rpgmakerweb.com/threads/price-for-a-pixelartist-to-design-a-map-sprites-etcs.91667/)) ; feuille d'animation 100–300 $ ; environnement complet 500–1 500 $, médiane 25 $/h ([Upwork](https://www.upwork.com/hire/2d-game-art-freelancers/cost/)). 400 éléments ≈ 1 500–3 000 $.
- **Écosystème : moyen.**

| Pack | Contenu | Prix | Licence |
|---|---|---|---|
| [LimeZu Modern Exteriors 32×32](https://limezu.itch.io/modernexteriors) | même pack, version 32 px | 5 $ | propriétaire |
| [El Beshuele TopDown City](https://elbeshuele.itch.io/topdowncity) | routes, bâtiments, voitures, végétation | prix libre | CC BY-NC (commercial via Boosty) |
| [Icko Top-down RPG Tileset](https://inr-1ko.itch.io/rpg-asset-pack) | nature, village | 9,99 $ | **CC BY 4.0** |
| [Magma Interactive Modern World](https://magma-interactive.itch.io/pixel-art) | 500 éléments, biomes | 25 $ (promo 5 $) | commercial, pas de revente |
| [CraftPix Buildings Collection](https://craftpix.net/product/buildings-collection-top-down-pixel-art/) | maisons 16/32/48/64 px | abonnement Premium | CraftPix : pas de redistribution |

- **Rendu.** Idem 16 px.
- **Jeux mobiles.** Potion Permit ([6 févr. 2024](https://toucharcade.com/2024/02/06/potion-permit-mobile-download-now-available-simulation-rpg-iphone-android-ipad-playdigious/)), Moonlighter ([Netflix Games](https://www.gamespot.com/articles/netflix-is-bringing-moonlighter-back-to-mobile-devices/1100-6503749/)).
- **Couverture.** Aucun pack CC0 32 px « ville moderne + nature » ; LimeZu couvre ville/routes/véhicules (hors dépôt) ; infrastructures et faune **à commander (~60 %)**.

### 3. Pixel art isométrique

- **Lisibilité.** Losange 2:1 ; à 96 × 48 px CSS, 4,3 losanges en largeur ; en portrait la diagonale de la ville sort de l'écran, les bâtiments hauts masquent la tuile derrière (toucher ambigu), les rues sur arêtes deviennent des diagonales fines ; heatmaps masquées par les volumes.
- **Coût.** 1 à 4 orientations par bâtiment ; 5–10 $/tuile → 2 500–4 500 $.
- **Écosystème : riche et CC0.**

| Pack | Contenu | Prix | Licence |
|---|---|---|---|
| [Kenney Isometric Tiles City](https://kenney.nl/assets/isometric-tiles-city) + [Landscape, Buildings, Vehicles, Roads, Roads Water, Blocks, Miniature](https://kenney.nl/assets/tag:isometric) | 128 tuiles ville + séries | gratuit | CC0 |
| [Screaming Brain Iso Town](https://screamingbrainstudios.itch.io/iso-town-pack) + [Overworld 360, Roads 798, Floor 1 008, Object 395](https://screamingbrainstudios.itch.io/) | 443 tuiles 128 × 64 | gratuit | CC0 |
| [Kelano City Buildings](https://kelano-studio.itch.io/city-buildings) | 30 bâtiments jour/nuit, 64 × 64 | 5 $ | libre, crédit apprécié |
| [Newc42 Isometric Map Tileset](https://newc-42.itch.io/pixel-art-isometric-map-tileset) | 69 tuiles, 6 biomes | gratuit | CC0 |
| [Styloo 2D City](https://styloo.itch.io/2d-city) | 2 000+ sprites cartoon, 8 directions | prix libre | CC0 |

- **Rendu.** Tri de profondeur, hit-test en losange : faisable ([isocity](https://github.com/victorqribeiro/isocity), JS + Kenney) mais 2–3× plus de code.
- **Jeux mobiles.** TheoTown ([28 M téléchargements Android, 4,7★](https://www.appbrain.com/app/theotown-city-builder/info.flowersoft.theotown.theotown)).
- **Couverture.** Ville/routes/nature : oui (CC0), cohérence Kenney/Screaming Brain moyenne ; infrastructures et faune à commander (~50 %).

### 4. Vectoriel plat

- **Lisibilité.** Indépendant de la résolution (56 px → 7,4 × 16 tuiles). Formes et couleurs franches = identification immédiate (Mini Motorways) ; fonds unis = **meilleur contraste pour les calques**. Faune en silhouettes, charme limité.
- **Coût.** Dessinable en interne (Inkscape, ou `Path2D` procédural pour rues, rivières, champs) ; illustrateur vectoriel 25–40 $/h, 40–80 h → 1 000–3 000 $. Animations par interpolation.
- **Écosystème : moyen, très CC0.**

| Pack | Contenu | Prix | Licence |
|---|---|---|---|
| [Kenney Tower Defense Top-Down](https://kenney.nl/assets/tower-defense-top-down) | 300 éléments : terrain, routes, arbres | gratuit | CC0 |
| [Kenney City Kit Suburban / Commercial / Industrial / Roads](https://kenney.nl/assets/city-kit-commercial) | 3D (50 modèles par kit) à rendre en 2D sous Blender | gratuit | CC0 |
| [Kenney All-in-1](https://kenney.itch.io/kenney-game-assets) | 60 000 assets PNG + **SVG** | 19,95 $ | CC0 |
| [Styloo 2D City](https://styloo.itch.io/2d-city) | 2 000 sprites cartoon | prix libre | CC0 |
| [CraftPix Simple Summer Vector](https://craftpix.net/freebies/free-simple-summer-top-down-vector-tileset/) | AI/EPS/PNG 256 px, médiéval | gratuit | CraftPix, pas de redistribution |
| [GDM Top-down City Mega Pack](https://www.gamedevmarket.net/asset/top-down-city-mega-pack) | routes, trottoirs, bâtiments, 100 % vecteur | 20 $ | GDM Pro |

- **Rendu.** SVG/DOM ou Canvas `Path2D` ; tuiles rasterisées en cache pour tenir 60 i/s.
- **Jeux mobiles.** Mini Motorways ([~4 M téléchargements](https://www.thumbculture.co.uk/mini-motorways-big-success)), [Islanders: Mobile (20 nov. 2025)](https://www.pocketgamer.com/islanders-mobile/available-now/), [Townscaper (20 oct. 2021, 4,99 $)](https://9to5mac.com/2021/10/20/build-your-own-town-with-townscaper-for-iphone-ipad-and-m1-macs/).
- **Couverture.** Aucun pack complet, mais un style « formes simples » se termine en interne : 100 % sans commande.

### 5. Illustré doux / peint à la main

- **Lisibilité.** Très charmant ; tuiles 256–512 px → plusieurs atlas 4096², mémoire élevée. Textures riches = **pire contraste** pour les calques.
- **Coût.** 30–80 $/élément ; environnements 3 000–10 000 $+ ([Upwork](https://www.upwork.com/hire/2d-game-art-freelancers/cost/)) ; 400 éléments → 10 000–25 000 $ ; animation image par image prohibitive.
- **Écosystème : pauvre (hex et médiéval dominent).**

| Pack | Contenu | Prix | Licence |
|---|---|---|---|
| [D. Baumgart Hex Medieval-Fantasy Locations](https://dgbaumgart.itch.io/hex-medieval-fantasy-locations) | 125 hex, 143 routes, 235 décors, 256 × 384 | 16 $ | custom, pas de revente |
| [Hex Basic Set: Painted 2D Terrain](https://assetstore.unity.com/packages/2d/environments/hex-basic-set-painted-2d-terrain-52258) | 13 biomes × 4 | 16 $ | Unity EULA (hors dépôt) |
| [Penzilla Expanded Hex Tiles](https://penzilla.itch.io/expanded-hex-tiles) | 7 biomes, 80 bâtiments, rivières, 512 × 853 | 15 $ | commercial, crédit, pas de redistribution |
| [Daniel Thomas Hand Painted Town](https://danielthomasart.itch.io/2d-hand-painted-town-tileset) | ville médiévale 128 px, saisons | 13 $ (bundle 65 $) | propriétaire |
| [ludicarts City Game Tileset](https://ludicarts.itch.io/city-game-tileset) | 88 terrains + 43 objets, ville moderne | 15 $ | propriétaire |

- **Rendu.** Simple mais lourd (Mo, décodage, atlas).
- **Jeux mobiles.** Cozy Grove ([Apple Arcade 2021](https://toucharcade.com/2021/03/19/cozy-grove-release-date-out-now-apple-arcade-spry-fox-pc-steam-nintendo-switch/)) ; Dorfromantik mobile [annoncé mai 2025, date à venir](https://www.pocketgamer.com/dorfromantik/coming-to-mobile/) ; Minami Lane sans version mobile.
- **Couverture.** Rien de cohérent « moderne + infrastructures + faune » : **~90 % à commander**.

### A. Tableau comparatif (/5)

| Direction | Lisibilité portrait | Coût | Écosystème | Rendu Canvas/DOM | Ton cosy + calques | **Total /25** |
|---|---|---|---|---|---|---|
| 1. Pixel 16 px | 3 | 5 | 5 | 5 | 3 | **21** |
| 2. Pixel 32 px | 5 | 4 | 3,5 | 5 | 4 | **21,5** |
| 3. Pixel iso | 2,5 | 2,5 | 4 | 3 | 3 | **15** |
| 4. Vectoriel plat | 4,5 | 4 | 3 | 4 | 3,5 | **19** |
| 5. Peint main | 3,5 | 1 | 1,5 | 3 | 4 | **13** |

### B. Recommandation

**Principale : pixel art 32 px, top-down 3/4 léger, rendu ×4 en pixels physiques (≈ 49 px CSS).** Sur un écran à DPR 2,6, le 32 px donne la même densité que le 16 px (≈ 160 tuiles visibles) avec quatre fois plus de détail : chaque bâtiment et chacun des 7 animaux se reconnaît sans icône, décisif quand la nature compte autant que la prospérité. Rendu le plus simple, style éprouvé sur mobile (Potion Permit, Moonlighter), surcoût (~+50 % vs 16 px) contenu dans 2–3 k$. L'isométrique est écarté malgré TheoTown : en portrait, occlusion, rues-arêtes diagonales et tri de profondeur coûtent plus qu'ils n'apportent. Le peint aussi : 5 à 10× plus cher, mauvais pour les calques, aucun écosystème moderne.

**Alternative : vectoriel plat procédural** (Kenney CC0 + formes dessinées en code) si le budget de commande est nul : 100 % redistribuable, calques parfaits, mais moins « vallée vivante ». Dans tous les cas : **UI, icônes et calques en vectoriel plat** par-dessus les tuiles pixel art.

### C. Plan d'approvisionnement (32 px)

**Licence.** Dépôt GitHub public ⇒ seuls CC0 / CC BY / OFL sont commités. LimeZu, Magma, CraftPix, GDM ([Pro Licence : ni revente ni extraction](https://www.gamedevmarket.net/asset/modern-exteriors-rpg-tileset-16x16)) et Unity ([EULA : pas de redistribution](https://unity.com/legal/as-terms)) vont dans un dépôt privé `tiletown-assets-private` servi à l'exécution, jamais dans `assets/` public. CC BY-ND (Hedi Dev) interdit toute retouche : exclu. CC BY-NC (El Beshuele) : acceptable tant que le jeu est gratuit.

**Étape 1 — références et dépannage (≈ 20–40 $).** LimeZu Modern Exteriors 32×32, 5 $ : référence de style, véhicules et routes provisoires (privé). Icko Top-down RPG, 9,99 $, **CC BY** : herbe, arbres, eau, champs (commitable avec crédit). Magma Modern World, 5 $ (privé). Kenney All-in-1, 19,95 $, optionnel : UI, icônes, SVG, sons (CC0).

**Étape 2 — commande à un seul artiste (cohérence), livrée sous CC BY 4.0 par contrat, donc commitable.**

| Lot | Volume | Tarif constaté | Estimation |
|---|---|---|---|
| Terrain + autotuiles (rivière, lac, haie, colline, zone humide, champ, prairie, forêt, parc) | ~70 tuiles | 3–5 $/tuile | 250–350 $ |
| Bâtiments 32–64 px (quartiers 3 × 3, commerces, bureaux, usines, école, clinique, marché, mairie, tram, épuration, éolienne, solaire, centrale) | ~45 | 5–10 $ | 300–450 $ |
| Rues sur arêtes (2 segments, 16 nœuds, passages) + saisons (recolor) | ~40 | 3–5 $ | 120–200 $ |
| 7 animaux × 4 dir × 4 images | 112 images | 100–300 $/feuille | 700–1 400 $ |
| Véhicules (4 × 4 dir) + habitants (4 × 4 dir × 4 images) | ~80 images | forfait | 250–500 $ |
| Effets (fumée, eau, pollen) | ~30 | 3–5 $ | 100–150 $ |

Sources : Fiverr 10–60 $ la prestation, 2,50 $/tuile ≤ 32 px, 5 $+ par bâtiment ([gigs tileset](https://www.fiverr.com/gigs/pixel-art-tileset)) ; Upwork 15–30 $/h ([pixel art](https://www.upwork.com/hire/pixel-art-freelancers/)). Préférer un artiste itch.io dont le pack 32 px moderne plaît (LimeZu, El Beshuele, SakPix prennent des commandes), 25–35 $/h.

**Budget total ≈ 1 750–3 100 $** (packs 20–40 $ + commande 1 720–3 050 $). Zéro budget : l'alternative vectorielle.

**Reste en interne :** palette commune, heatmaps vectorielles, UI/icônes (Kenney CC0), teintes de saison, brief de style (3 maquettes avant commande).

## 11. Graphismes de bâtiments et de rues pour « Tiletown » — recherche du 2026-10-04

**Méthode.** Recherche étendue (itch.io, Kenney, OpenGameArt, CraftPix, GameDev Market, Unity, Humble, Gumroad, Scirra, Freepik/Envato), puis lecture de la page de chaque pack (prix, contenu, date, licence). **GitHub** : **oui** (CC0), **non** (licence maison → fichiers hors dépôt), **flou** (texte absent).

**Abréviations** : R1-R3 = densités d'habitat ; com. = commerces ; bur. = bureaux ; ind. = usine ; éc. = école ; cli. = clinique ; mai. = mairie ; pp = passages piétons ; routes = autotuiles droit/virage/T/croisement.

### 1. Pixel art 16 px (top-down ou vue 3/4)

| Pack | Auteur | Taille · persp. | Contenu couvert | Anim. | Prix | MAJ | Licence | GitHub |
|---|---|---|---|---|---|---|---|---|
| [RPG Urban Pack](https://kenney.nl/assets/rpg-urban-pack) | Kenney | 16 · 3/4 | 480 tuiles : routes, trottoirs, pp, bâtiments modulaires (R1/R2, com.), véhicules, 6 persos ; ni ind., institutionnel, rails | persos | gratuit | 2019 | CC0 | oui |
| [Roguelike Modern City](https://kenney.nl/assets/roguelike-modern-city) + [extension](https://opengameart.org/content/modern-city-extension) | Kenney / rubberduck | 16 (+1 px marge) · 3/4 | 1036 tuiles : routes, parkings, bâtiments modulaires ; l'extension ajoute **usines** et fenêtres éclairées | non | gratuit | 2015 / 2018 | CC0 | oui |
| [Modern Exteriors](https://limezu.itch.io/modernexteriors) | LimeZu | 16 (32/48 agrandis) · 3/4 | 17+ thèmes : maisons, immeubles, centre commercial, bur., éc., hôpital, poste, pompiers, police, **métro/gare + trains**, chantier, ferme, routes/pp. Ni tram, ind., énergie, mai. | véhicules, props | 5 $ (promo 2,50 $) | il y a 18 j | maison : **crédit obligatoire**, pas de redistribution | non |
| [Gutty Tiny: Clean City](https://guttykreum.itch.io/clean-city) | GuttyKreum | 16 · 3/4 | 600 tuiles : immeubles R2/R3, bur., cafés, poste, parkings | 5 | 5,99 $ | 2021 | maison, pas de redistribution | non |
| [Tiny Tile Town](https://iknowkingrabbit.itch.io/tiny-tile-town) | A. Makarov | 16 + métatuiles · top-down « SimCity » | zones **R (100+) / com. (60) / ind. (61)**, éc., cli., police, pompiers, **transports en commun**, aéroport, fermes, routes, véhicules | catastrophes | 12,50 $ | 2021 | maison, crédit, interdit sur serveur public | non |
| [S13 City Builder 8 bits](https://s13games.itch.io/s13-city-builder-8-bits) | S13Games | 16 · top-down, 16 couleurs | 114 bâtiments : **administration (mai.)**, R1-R3, bur., com., **ind., électricité + éco-électricité, épuration, gare**, éc., cli., parc, port ; routes **et rails** ; 66 véhicules ; 5 saisons ; Godot autotile | 9 bât., 6 véh. | 4 $ | il y a 48 j | maison, crédit, pas de redistribution | non |
| [City Planner](https://cursed-offerings.itch.io/city-planner) | Cursed Offerings | 16 · top-down NES | maisons/usines/bureaux **à paliers**, routes modulaires, véhicules, 5 palettes | GIF | 2 $ | — | maison, pas de ré-upload | non |
| [Modern Buildings Tileset](https://vectoraith.itch.io/vectoraiths-modern-buildings-tileset-pack) | VectoRaith | 16 (32/48) · 3/4 | bâtiments 1-3 étages, « gouvernementaux », tours, « infrastructures » ; pas de routes | fontaine | 3 $ (promo) | 2026-06-21 | maison, pas de redistribution | non |
| [750+ Modern Town](https://triariuskonstantinus.itch.io/modern-town-set-01-750-tiles-and-sprites) | TriariusKonstantinus | 16 · top-down anime | 144 maisons/immeubles (R1-R3), routes 3 largeurs, zones piétonnes, 9 véhicules, 32 persos | persos, véh. | 8,50 $ | 2025-03 | maison, pas de revente | non |
| [Cozy Town](https://shubibubi.itch.io/cozy-town) | shubibubi | 16 · 3/4 | éc., bibliothèque, cinéma, supermarché, **gare + voies + train/bus**, maisons, ponts | portes, train, bus | 7,99 $ (gratuit = non commercial) | — | maison, pas de redistribution | non |
| [Top-Down City Tileset (GTA)](https://claryu.itch.io/16x16-top-down-city-tileset) | Claryu | 16 · **top-down pur** | résidentiel, com., entrepôts, zone ind., véhicules | PNJ | 2,99 $ | — | maison, pas de fichiers seuls | non |
| [Green Energy Pack](https://ttomothyy.itch.io/free-green-energy-pack) + [Solar Punk City](https://ttomothyy.itch.io/solar-punk-city) | TomothyCreates | 16 · top-down | **panneaux solaires**, batterie, éolien « wind bag », 4 bâtiments, rue/trottoir | serre, batterie | gratuit / 1,49 € | il y a ~30 j | maison, pas de redistribution | non |
| Autres : [Lo-Bit City](https://greywyrd.itch.io/lo-bit-city) (gratuit, immeubles modulaires, licence floue) ; [City Pack](https://nyknck.itch.io/citypackpixelart) NYKNCK (gratuit, banque/pont/pp, crédit, « en dév. » depuis 2021) ; [(12x12) City Tiles](https://opengameart.org/content/12x12-city-tiles-top-down) FisherG et [Pico-8 City](https://kenney.nl/assets/pico-8-city) Kenney (CC0, mais **12 / 8 px**) | | | | | | | | |

### 2. Pixel art 32 px

Aucun 32 px natif n'est un city-builder ; LimeZu et VectoRaith 32/48 sont des agrandissements.

| Pack | Auteur | Taille · persp. | Contenu couvert | Anim. | Prix | MAJ | Licence | GitHub |
|---|---|---|---|---|---|---|---|---|
| [Day City, Night City](https://crayg.itch.io/day-city-night-city) | crayg | 32 · 3/4 | 600 tuiles jour + nuit : devantures, vendeurs, véhicules | non | gratuit | il y a 26 j | « may be used commercially », pas de texte | flou |
| [Town Tileset](https://dithart.itch.io/ditharts-town-tileset) | DithArt | 32 · 3/4 | maisons, 6 boutiques, garages, rues, 24 sols, mobilier urbain, fichier Tiled | non | 12 € | — | maison ; **interdit les dépôts publics** | non |
| [Cozy city assets](https://grigoreen.itch.io/cozycity) | grigoreen | 32 · 3/4 | boutique, cinéma, **grand hall**, arcade, tuiles rue + parc, voitures, persos | persos | 5,50 $ | — | maison, pas de redistribution | non |
| [Japanese City](https://guttykreum.itch.io/japanese-town) (+ Osaka, Kanagawa 6,99 $, Dotonbori 9,99 $) | GuttyKreum | 32 · 3/4 | 637 tuiles : immeubles, devantures, rues/trottoirs, pp ; version gratuite réduite | 8 | 7,99 $ | 2025-10-10 | maison, pas de redistribution | non |
| [KR Urban Modern Tiles](https://kokororeflections.itch.io/kr-urban-modern-tiles) (+ [KR Skyscraper](https://kokororeflections.itch.io/kr-skyscraper-tileset-for-rpgs) 16,99 $) | Kokoro Reflections | 32 + 48 · RPG Maker | murs/toits modulaires, devantures, routes, feux, arrêt de bus ; gratte-ciel | portes, feux | 19,99 $ | 2021 | maison « games only », tout moteur | non |
| [Unfinished City Builder 32x32](https://poppants.itch.io/unfinished-project-city-builder-pixelart-tileset) | poppants | 32 · 3/4 | pièces modulaires (fenêtres, toits, arbres), 1 PNG | non | nom ton prix | ~2021, annulé | CC0 | oui |
| Autres : [City tilemap 32x32](https://avkov.itch.io/city-tilemap-32x32) AvKov (gratuit, bur./hôpital/immeuble, prototype 2021) ; [VisuStella Urban City](https://visustella.itch.io/visustella-world-urban-city-vol01) Vol.01/02 (48 px, 39,99 $ chacun, Vol.02 = transports, EULA) ; [Modern City](https://comshadow.itch.io/modern-city-pixel-art-tileset-pack) Cute SCKR (3,99 $, 48 px, **IA**) | | | | | | | | |

### 3. Pixel art isométrique

| Pack | Auteur | Taille · persp. | Contenu couvert | Anim. | Prix | MAJ | Licence | GitHub |
|---|---|---|---|---|---|---|---|---|
| [Isometric City – Starter Pack](https://buggystudio.itch.io/isometric-city-pack) + [Suburban Pack](https://buggystudio.itch.io/isometric-suburban-pack) | Buggy Studio | iso 2:1 (taille non documentée) | 52 bâtiments (R1-R3, com., bur.), 23 véhicules, **108 sols/routes**, 52 props, dégâts, **eau polluée** ; Suburban : 250 maisons/routes/props | persos | nom ton prix | 2026-08-26 (« legacy ») | **CC0** | oui |
| [City Buildings](https://kelano-studio.itch.io/city-buildings) + [Luxury Buildings](https://kelano-studio.itch.io/luxury-buildings-50-isometric-buildings-64x64) + [Groundwork](https://kelano-studio.itch.io/groundwork-165-isometric-tiles-64x64) | Kelano Studio | 64×64 iso | 30 + 50 bâtiments (R, com., ind., civique, gratte-ciel, stade, villas) + nuit ; Groundwork : 165 tuiles chemins/places | 1 GIF | 5 $ + 7 $ + gratuit | 2026-09 | maison : crédit apprécié, pas de redistribution | non |
| [Pixel City](https://oli414.itch.io/isocity) | Oli414 | iso | 62 terrains, **12 routes**, 72 véhicules, 5 bâtiments seulement | non | 6,05 $ | — | **non affichée** | flou |
| [Building Asset: Town](https://iknowkingrabbit.itch.io/building-asset-town) | A. Makarov | 8 px métatuiles · caméra « SimCity 2000 » | 180+ bâtiments R/com./ind., police, **hôpital**, pompiers, **déchetterie**, poste, **dépôt de bus**, parcs | aucune | 10 $ | 2023-07 | maison, crédit, pas de redistribution | non |
| [Isometric Exteriors PHC](https://pixel-salvaje.itch.io/phc-pixel-heat-city) | pixel_Salvaje | 256 px sols, 128 véh. | routes iso, 8 voitures ; bâtiments à venir (v0.03) | véhicules | 16 $ | il y a 5 j (WIP) | « commercial » en commentaire | flou |
| Écartés : [Iso Town Pack](https://screamingbrainstudios.itch.io/iso-town-pack) Screaming Brain (CC0, 432 murs/toits rendus, pas pixel, pas de routes) ; [BuzPin](https://buzpin.itch.io/isometric-modern-buildings) (400 px, **IA**, CC BY-ND) ; [khaledpng Vol.1](https://khaledpng.itch.io/isometric-city-builder-ultimate-asset-pack) (1,50 $, « CC BY 4.0 » contredit par « pas de redistribution », rendu 2.5D) | | | | | | | | |

### 4. Vectoriel plat

| Pack | Auteur | Taille · persp. | Contenu couvert | Anim. | Prix | MAJ | Licence | GitHub |
|---|---|---|---|---|---|---|---|---|
| [Isometric Tiles City](https://kenney.nl/assets/isometric-tiles-city) + [Buildings](https://kenney.nl/assets/isometric-tiles-buildings) + [Isometric road tiles](https://opengameart.org/content/isometric-road-tiles) | Kenney | 128 px iso 2:1 flat | routes/parkings/arrêts de bus, bâtiments modulaires, 97 routes **avec sources SVG** | non | gratuit | 2012-2014 | CC0 | oui |
| [Isometric City Builder Kit](https://multigonlab.com/products/isometric-city-builder-kit/) | Multigon Lab | iso flat, SVG/AI/EPS/PNG | 36 com., 9 R, **24 publics (écoles, hôpitaux, municipal, police, poste, stades)**, 9 **trams/trains**, 25 routes (croisements, ronds-points, **pp**), parcs ; ni ind. ni énergie | non | 29 $ | 2026-07-23 | maison, pas de redistribution, 1 licence par client | non |
| [Top Down City Mega Pack](https://gamedeveloperstudio.itch.io/top-down-city-mega-pack) | R. Brooks | top-down flat, vecteur + PNG | routes, trottoirs, bâtiments, décors (détail non listé) | non | 20 $ | — | [licence GDS](https://www.gamedeveloperstudio.com/license.php) : pas de redistribution | non |
| [Casual game pack](https://last-tick.itch.io/casual-game-pack) | Last tick | 64 px (export ×4) top-down flat | bâtiments modulaires, sols avec transitions, arrêts de bus, props, persos | persos | nom ton prix | il y a 2 j | maison, pas de redistribution | non |
| [Top-Down Modern City Outdoor Mega Pack](https://nacl1234.itch.io/top-down-modern-city-outdoor-2d-mega-pack) | nacl1234 | HD flat-cartoon 3/4 | 195 assets : rues, **pp, pistes cyclables, trottoirs**, parcs, places, résidentiel | non | nom ton prix | — | **non précisée** ; **IA** | non |
| Autres : [Map Pack](https://kenney.nl/assets/map-pack) Kenney (CC0, 180 tuiles, 2016, très simple) ; GameDev Market [Isometric City Vector](https://www.gamedevmarket.net/asset/isometric-city-vector) et [Vector Art Isometric City](https://www.gamedevmarket.net/asset/vector-art-isometric-city) (AI/EPS, prix non lu, Pro Licence sans redistribution) | | | | | | | | |

### 5. Illustré doux

| Pack | Auteur | Taille · persp. | Contenu couvert | Anim. | Prix | MAJ | Licence | GitHub |
|---|---|---|---|---|---|---|---|---|
| [Free City Builder](https://penzilla.itch.io/free-city-builder) + [Isometric City Builder Pack](https://penzilla.itch.io/giant-city-builder) | Penzilla | 512×292 iso dessiné main | 50 items gratuits ; pack 500+ : apparts 9 tailles, 20 maisons, **61 publics (police, poste, éc., bibliothèque, musée, station d'eau, parc, stades)**, 76 com., 225 décors, 50 véhicules ; **routes non listées** | non précisé | gratuit / 10 $ | 2024-10-13 | [licence Penzilla](https://www.scribd.com/document/834023595/PenzillaDesign-StandardLicense) : **1 projet par achat**, crédit, pas de redistribution | non |
| [Sketch Town](https://kenney.nl/assets/sketch-town) | Kenney | iso croquis | 340 sprites de ville (bâtiments, routes, décors) | non | gratuit | 2021 | CC0 | oui |
| [2D City Asset Pack](https://styloo.itch.io/2d-city) | styloo | rendus 3D cartoon, **8 directions** | 2000+ sprites : maisons, immeubles, véhicules, props (~240 Mo) | non | nom ton prix | ~2022 | **CC0** | oui |
| [City Tileset Pack](https://dani567.itch.io/city-tilset-pack) | dani567 | grille 16, cartoon | 62 bâtiments, 23 véhicules, 86 décors | aucune | 15 $ | — | commercial OK (commentaires), texte absent | flou |
| [Top Down City Pack](https://buggystudio.itch.io/top-down-city-pack) | Buggy Studio | top-down ombré | 45 bâtiments, routes, eau, végétation, véhicules | non | nom ton prix | 2023-04 | **non affichée** | flou |

Hors sujet : [Tiny Islands](https://majadroid.itch.io/tiny-islands-16x16-tilemap) (CC0, Anno), [Fantasy Dreamland City](https://elvgames.itch.io/fantasy-dreamland-city) (médiéval).

### Sources écartées

**CraftPix** ([licence](https://craftpix.net/file-licenses/) sans redistribution, même gratuit), **Unity Asset Store** (EULA « may not distribute »), **Envato Elements** (licence par projet), **Freepik/Vecteezy** (attribution, pas de redistribution) : tous hors dépôt. **Humble Bundle** : rien en 2D ville actuellement (sept.-oct. 2026 : 3D, Unreal, Synty, SFX). **Gumroad** : rien ; **Scirra** : [RTS Building & Streets](https://www.construct.net/en/forum/scirra-website/asset-store-36/rts-building-streets-pack-131310) (7 $, 6 bâtiments) ; **Spriters Resource** : rips, exclu. **Fumée** : [Smoke particles](https://opengameart.org/content/smoke-particle-assets) Kenney (CC0, 77 sprites à réduire) ; sinon à dessiner.

### A. Meilleurs assemblages par style

**Pixel 16 px.** *Dépôt 100 % libre (0 $)* : RPG Urban Pack + Roguelike Modern City + extension rubberduck : routes/pp/trottoirs, R1-R2, com., usine, parkings ; tout le reste manque (R3, institutionnel, transports, énergie, eau, faune, pont, pollution). *Maximal (~22 $)* : **S13 City Builder** (4 $) + **Tiny Tile Town** (12,50 $) + LimeZu (5 $) + Green Energy (gratuit). Couvre R1-R3, com., bur., usine, éc., cli., mairie, gare + rails, épuration, centrale et éco-électricité, parc, solaire. Manquent : tram (rails S13 réutilisables), compost, château d'eau, passage à faune, pont (voir Cozy Town/NYKNCK), piste cyclable, nuage de pollution. Trois rendus différents : une base (S13 **ou** Tiny Tile Town), l'autre en référence.

**Pixel 32 px.** crayg (gratuit) + DithArt (12 €) + GuttyKreum Japanese City (7,99 $) + LimeZu 32 (5 $) ≈ 26 $. Couvre devantures, R1-R2, rues/pp, props, jour/nuit ; manque tout l'institutionnel et technique (éc., cli., mai., gare, tram, épuration, énergie, usine, pont, faune).

**Pixel iso.** Buggy Studio Starter + Suburban (CC0) + Kelano City + Luxury + Groundwork ≈ 12 $. Couvre R1-R3, com., bur., ind., stade, routes/sols, véhicules, eau polluée, nuit. Manquent : éc., cli., mai., gare, tram/rails, épuration, énergie, compost, château d'eau, faune, pont, pp, pistes cyclables. Tailles Buggy/Kelano à homogénéiser.

**Vectoriel plat.** Kenney Isometric Tiles (CC0, SVG) + Multigon Kit (29 $) ≈ 29 $. Couvre routes avec pp et ronds-points, **tram/train**, éc., cli., municipal, police, poste, stades, R, com., parcs. Manquent : usine, énergie, épuration, compost, château d'eau, faune, pont, piste cyclable, fumée. Complétable dans Inkscape ; Multigon hors dépôt.

**Illustré doux.** Penzilla Free + Isometric City Builder (10 $) + Kenney Sketch Town + styloo 2D City (CC0) ≈ 10 $. Couvre R1-R3, com., 61 publics (éc., police, poste, station d'eau, parc, stades), véhicules. Manquent : routes/pp (non listées), mai., cli., gare, tram/rails, usine, énergie, épuration, compost, château d'eau, faune, pont, fumée. Licence « un projet » + crédit ; 512×292 lourd sur téléphone.

### B. Classement des styles par couverture

1. **Pixel 16 px** : ~85 % (S13 + Tiny Tile Town) ; tout le marché city-builder est là.
2. **Vectoriel plat** : ~60 % ; seul style avec tram natif.
3. **Illustré doux** : ~50 %, sans routes garanties.
4. **Pixel iso** : ~45 %, sans institutionnel.
5. **Pixel 32 px** : ~30 %, rien de natif.

### C. Pièges rencontrés

- **Tailles mélangées** : 12 (FisherG), 8 (Pico-8, Building Asset: Town), 16 natif contre 32/48 agrandis (LimeZu, VectoRaith), 64 (Kelano) contre inconnu (Buggy), 128 (Kenney iso) contre 256 (PHC), 512×292 (Penzilla).
- **Perspectives incompatibles** : top-down pur (Claryu), 3/4 (Kenney, LimeZu), « caméra SimCity » (Makarov), iso 2:1 ; les 8 directions de styloo sont superflues en grille carrée.
- **Abandonnés ou en chantier** : poppants (annulé), AvKov (2021), NYKNCK (« en dév. » depuis 2021), PHC (v0.03), Buggy « legacy », Kenney iso 2012-2014, Clean City 2021.
- **Licences floues** : crayg (phrase sans texte), Oli414, Buggy Top Down et dani567 (rien d'affiché), PHC (commentaire), khaledpng (« CC BY » + interdiction de redistribution), Hedi Dev et BuzPin en **CC BY-ND** (aucune modification), Penzilla **un projet par achat**, DithArt interdit explicitement les dépôts publics.
- **IA déclarée** : nacl1234, Cute SCKR, Corplex, BuzPin, Polyy.AI, KodaMonroezz → à exclure.
- **Redistribution** : seuls Kenney, Buggy Studio, styloo, Screaming Brain, poppants, FisherG et Majadroid sont CC0 ; tout le reste impose un dossier d'assets hors dépôt (ignoré par git), à prévoir dans l'architecture.

## 12. Tiletown — graphismes nature, animaux, véhicules, personnages, effets

Recherche du 2026-10-04 (itch.io, Kenney, OpenGameArt, CraftPix, Freepik/Vecteezy, Unity, GameDev Market, Fiverr) ; chaque licence lue sur sa page. « Dépôt » : **✅** CC0, **✅\*** CC BY (crédit), **❌** licence maison (utilisable dans le jeu construit, mais HORS dépôt GitHub public).

### 1. Pixel art 16 px (top-down 3/4)

| Pack (auteur) | Prix | Contenu utile | Anim. | MàJ | Licence | Dépôt |
|---|---|---|---|---|---|---|
| [Cute Fantasy RPG](https://kenmi-art.itch.io/cute-fantasy-rpg) (Kenmi) | gratuit / 3,99 $ | eau animée, cascade, falaises, champs, cultures ; 11 animaux animés (vache, mouton, cochon, cheval, poule, oie, cygne, **canard, grenouille, abeille**) ; persos 4 dir (idle, course, travaux) | 4-6 img | mai 2026 | maison (gratuit = crédit) | ❌ |
| [Cozy Farm](https://shubibubi.itch.io/cozy-farm) (Shubibubi) | gratuit NC / 3,99 $ | **4 saisons**, arbres fruitiers/pins animés, **10 cultures × 5 stades**, fleurs 4 stades, nénuphars ; animaux de ferme + bébés (marche, sommeil) | oui | 18 j | maison | ❌ |
| [Cozy People](https://shubibubi.itch.io/cozy-people) | 3,99 $ | habitants 20×16 : marche 8 img, 10 actions ; 5 teints, 13 coiffures × 14 couleurs, vêtements 10 couleurs ; pas de vélo | 8 img | 18 j | maison | ❌ |
| [Sprout Lands](https://cupnooble.itch.io/sprout-lands-asset-pack) (Cup Nooble) | gratuit NC / 3,99 $ | vaches, poules, cultures, eau ; persos 6 anim × 4 dir | oui | 18 j | maison | ❌ |
| [Animal Asset Pack](https://deepdivegamestudio.itch.io/animalassetpack) (DeepDive) | 0 / 2 / 4 $ | **45 animaux** idle seul : **cerf, hibou**, aigle, canard, grenouille, crapaud, tortue, loup, ours | idle | 13/10/2024 | maison | ❌ |
| [Animals Sprite Pack](https://finalbossblues.itch.io/animals-sprite-pack) (Time Fantasy) | 5 $ | 48 animaux **marche 4 dir** (cerf, ours, écureuil, lapin, canards, oiseaux, vaches, moutons) en 16 et 32 px | 3 img × 4 dir | 27/01/2025 | GameDevMarket | ❌ |
| [Wild Animals](https://vectoraith.itch.io/wild-animals-top-down-sprite-pack) (Vectoraith) | 6 $ (10) | 59 espèces, marche **1 direction** | 3 img | 15 j | maison | ❌ |
| [MiniWorld Sprites](https://merchant-shade.itch.io/16x16-mini-world-sprites) (Shade) | gratuit | 100+ persos animés, animaux de ferme et marins, arbres (pin, hiver, mort) | oui | 18 j | **CC0** | ✅ |
| Kenney [Tiny Farm](https://kenney.nl/assets/tiny-farm) / [Tiny Town](https://kenney.nl/assets/tiny-town) / [Roguelike Modern City](https://kenney.nl/assets/roguelike-modern-city) | gratuit | ferme (130 sprites, 2026), ville moderne (1036 fichiers, voitures, routes, 2015) — statiques | non | — | **CC0** | ✅ |
| [Pixel Vehicles](https://minzinn.itch.io/pixelvehicles) (minzinn) | gratuit | **23 véhicules × 8 couleurs, 8 directions**, 16 et 32 px : bus, pick-up, fourgon, camion, taxi, police (ni tram ni vélo) | 12 fps | 25/08/2023 | **CC BY 4.0** | ✅\* |
| [Modern Town Game Kit](https://amadeva.itch.io/modern-town-top-down-pixel-art-game-kit) (KodaMonroezz) | 4,99 $ | 6 habitants 16×24 marche 4 dir ; 11 voitures multi-dir animées, fumée, parc | oui | 72 j | maison | ❌ |
| [Modern Characters Bundle](https://maru-98.itch.io/modern-top-down-pixel-characters-bundle-18-characters-16x16) (Maru) | 16,99 € | 18 citadins idle + marche 4 dir | oui | 35 j | **non affichée** | ❌ |
| [Bao's Pixel Forest](https://baopixels.itch.io/baos-pixel-forest-16x16) / [Seasons of Forest](https://inkbubi.itch.io/seasons-of-forest-tileset) (inkBubi) / [Forest 4 Seasons](https://elvgames.itch.io/forest-4-seasons-16x16-pixelart-tileset) (ELV) | 3,99 / 5 / 7,99 $ | forêt **4 saisons** (434 props ; 3 200 tuiles, 60 arbres ; 2 400 tuiles + particules feuilles/pluie/neige), falaises ; eau non animée | partiel | 2025-26 | maison | ❌ |
| [Verdant 38 Cascades](https://csaf.itch.io/verdant-38-cascades) (CSAF) | 5,59 $ (7,99) | **rivière/rapides/cascades animées, sens N-S et O-E**, 489 tuiles, autotiles Tiled/Godot | 42 jeux | 6 j | maison, sans crédit | ❌ |
| [Winter Forest](https://seliel-the-shaper.itch.io/winter-forest) + Forest of Seasons (Seliel) | 19,99 $ / lot 39,95 $ | eau, cascade 6 img, **roseaux et nénuphars animés** (zone humide), autotiles | 6 img | 26/08/2025 | Mana Seed | ❌ |
| [Butterfly](https://opengameart.org/content/butterfly) / [Deer Rework](https://opengameart.org/content/deer-rework) (AntumDeluge, OGA) | gratuit | papillon 16×32 et cerf 32×32, **4 dir × 3 img** | 3 img | 2017/2019 | **CC BY 3.0** | ✅\* |
| [LPC Birds](https://opengameart.org/content/lpc-birds) (bluecarrot16) | gratuit | 15 oiseaux 32 px (moineau, rouge-gorge, aigle) **vol + marche 4 dir** | oui | 2018 | **CC BY 4.0** (option à choisir, pas SA/GPL) | ✅\* |
| [Weather FX](https://gegx.itch.io/weather-fx) (GegX) | 4,49 € | pluie ×3, neige ×3, brouillard, feuilles, **brume de chaleur**, éclairs ; 256 px, 347 img | 27 boucles | sept. 2026 | maison, sans crédit | ❌ |
| [40 Atmospheric VFX](https://alenia-studios.itch.io/10-pixel-art-atmospheric-vfx-pack) (Alenia) | gratuit | **fumée de cheminée, papillons, oiseaux**, brouillard, pluie, neige, pétales ; 320×180, 60 img | 40 | 1 j | « CC BY 4.0 + termes » anti-redistribution | ❌ |

### 2. Pixel art 32 px

| Pack | Prix | Contenu utile | MàJ | Licence | Dépôt |
|---|---|---|---|---|---|
| [Forest Nature Pack](https://toffeecraft.itch.io/forest-nature-pack) (ToffeeCraft) | 1,80 $ (perso gratuit) | **9 essences** (bouleau, saule, érable, pin, sakura), variantes saisonnières, arbres animés ; **renards, loups, lapins, oiseaux animés** (idle, marche, course, sommeil) | 04/02/2026 | maison | ❌ |
| [NPC Top Down Base](https://pixeline-k.itch.io/character-spritesheet-32-px-walk-idle) (Pixeline) | 8,90 $ | paper-doll : 2 bases × 5 teints, 12 coiffures, 42 vêtements, 15 anim × 4 dir | 12/03/2025 | maison | ❌ |
| [Town Folk](https://gegx.itch.io/town-folk) (GegX) | 11,99 € | 24 villageois 4 dir, marche 8 img + travail 9 img | 2 j | maison | ❌ |
| [TopDown City 32x32](https://elbeshuele.itch.io/topdowncity) (El Beshuele) | gratuit | voitures animées, routes, arbres, **particules fumée** | 28 j | **CC BY-NC 4.0** | ❌ |
| [Top-Down Hunt Animals](https://neiknartdev.itch.io/top-down-hunt-animals-pixel-sprite-pack) (NeikNat) | gratuit | lapin, **renard**, tétras, sanglier, **jeune cerf** ; **4 dir**, idle/marche/course/vol ; PNG+PSD | ? | **non affichée** | ❌ |
| [20 Cute Animals](https://abyssalhunter.itch.io/20-pixel-cute-animals) (AbyssalHunter) | gratuit NC / 9,99 $ | 48 px idle : cerf, renard, hibou, grenouille, vache, mouton | ? | maison | ❌ |
| [Mega Pack Top Down Monsters](https://admurin.itch.io/mega-pack-top-down-monsters) (Admurin) | 15 CAD | 128 px, **3 directions**, 150+ créatures (canidés, oiseaux, insectes, aquatiques, abeille, loup) | 22/01/2025 | maison | ❌ |
| [River Fish](https://quipinny.itch.io/riverfishpixelartpack) (quipinny) | 1 $ | 24 poissons 16 px statiques (350+ dans le grand pack) | ? | maison, crédit non requis | ❌ |
| Pixel Vehicles 32 / Time Fantasy 32 / Deer Rework / LPC Birds | voir §1 | versions 32 px incluses | — | — | ✅\* / ❌ |

### 3. Pixel art isométrique

| Pack | Prix | Contenu utile | MàJ | Licence | Dépôt |
|---|---|---|---|---|---|
| [Isometric City Starter Pack](https://buggystudio.itch.io/isometric-city-pack) (Buggy Studio) | gratuit | 52 bâtiments, **23 véhicules 4 dir**, 108 sols dont **eau contaminée**, arbres, perso animé idle/marche 4 dir, 500+ sprites | 26 août | **CC0** | ✅ |
| [Formwork Isometric City Kit](https://najjar320.itch.io/formwork-isometric-city-kit) (najjar320) | 8 $ | 2:1, 124 bâtiments × **6 stades de construction**, 114 arbres, **10 personnes × 8 orientations**, 49 routes | ? | maison, sans crédit | ❌ |
| [City Top Down Isometric 32x32](https://pozac.itch.io/city-top-down-isometric-asset-pack) (Pozac) | 2,49 $ (4,99) | bâtiments, véhicules, PNJ, Aseprite | 5 j | maison | ❌ |
| Kenney [Isometric Tiles Vehicles](https://kenney.nl/assets/isometric-tiles-vehicles) / [City](https://kenney.nl/assets/isometric-tiles-city) | gratuit | 540 sprites : 10 véhicules × 5 couleurs, **8 directions** ; routes, arbres, arrêts de bus (vectoriel) | 2014 | **CC0** | ✅ |
| [Bicycle](https://opengameart.org/content/bicycle) (Clint Bellanger, OGA) | gratuit | vélo iso **8 dir × 8 img de pédalage** (sans cycliste) | 2013 | **CC BY 3.0** | ✅\* |

Aucun pack d'**animaux isométriques animés** ni de nature iso **4 saisons / rivière animée** trouvé.

### 4. Vectoriel plat

| Pack | Prix | Contenu utile | Licence | Dépôt |
|---|---|---|---|---|
| Kenney [Animal Pack Redux](https://kenney.nl/assets/animal-pack) | gratuit | 30 animaux × 8 styles (hibou, grenouille, canard, vache), SVG, **vue de face, statiques** | **CC0** | ✅ |
| Kenney [Racing Pack](https://kenney.nl/assets/racing-pack) / [Toon Characters 1](https://opengameart.org/content/toon-characters-1) | gratuit | 420 sprites top-down (voitures, routes, arbres) ; 6 persos × 45 poses, membres séparés | **CC0** | ✅ |
| [Free Top Down Car Sprites](https://opengameart.org/content/free-top-down-car-sprites-by-unlucky-studio) (Unlucky Studio) | gratuit | 9 véhicules HD (taxi, ambulance et police animées, camion, van) | **CC0** | ✅ |
| [Modular Animated Vector Characters](https://rgsdev.itch.io/free-cc0-modular-animated-vector-characters-2d) (RGS_Dev) | gratuit | 8 persos modulaires animés, iso, PNG 2048 | **CC0** | ✅ |
| [Casual Game Pack](https://last-tick.itch.io/casual-game-pack) (Last Tick) | gratuit | ville plate 64 px ×4 : bâtiments modulaires, 4 arbres, bancs, **constructeur d'habitants** ; pas de véhicules ; MàJ 2 j | maison | ❌ |
| [GameDeveloperStudio](https://gamedeveloperstudio.itch.io/) (Spriter + SVG) | 4-20 $ /pack | **top-down animés** : [renards](https://gamedeveloperstudio.itch.io/animated-top-down-foxes) 6 $, cerf 5 $, ours, loups, sanglier 6 $, hérisson 5 $, [oiseaux](https://gamedeveloperstudio.itch.io/top-down-birds-game-sprite-pack) 5 $ (pigeon, corneille, moineau, mouette), chats 7 $, chiens 4,95 $ ; [voitures SVG](https://gamedeveloperstudio.itch.io/top-down-cars-game-asset-pack) 5 $, pick-up 4 $ ; hommes 15 $, femmes 20 $ ; **[loutre](https://gamedeveloperstudio.itch.io/otter) 5 $ mais vue de côté** | [GDS](https://www.gamedeveloperstudio.com/license.php) : commercial OK, redistribution interdite | ❌ |
| [Modern City Outdoor Mega Pack](https://nacl1234.itch.io/top-down-modern-city-outdoor-2d-mega-pack) (nacl1234) | gratuit | 195 sprites 3/4 plat : **parc (fontaine, kiosque, bancs, haies, bassin)**, 16 véhicules garés statiques — **« AI assisted »** | non affichée | ❌ |
| [CraftPix Simple Summer Vector](https://craftpix.net/freebies/free-simple-summer-top-down-vector-tileset/) ; [Trucks and Cars](https://craftpix.net/product/top-down-trucks-and-cars-pixel-art-asset-pack/) 5,50 $ | gratuit / 5,50 $ | AI/EPS 256 px : arbres, routes ; pixel : 3 bus, 5 camions | [CraftPix](https://craftpix.net/file-licenses/) : dépôt public explicitement interdit | ❌ |
| Freepik / Vecteezy ([licence](https://support.vecteezy.com/en_us/what-is-a-free-license-BkksvgovK)) | gratuit | tilesets vectoriels divers | attribution obligatoire, redistribution interdite, surveillance active | ❌ |

### 5. Illustré doux

| Pack | Prix | Contenu utile | MàJ | Licence | Dépôt |
|---|---|---|---|---|---|
| [Basic Hand-Drawn Tileset](https://schwarnhild.itch.io/basic-hand-drawn-tileset-and-asset-pack) (schwarnhild) | gratuit | 128 px : falaises et eau animées, 3 arbres, **mouton animé** (idle, marche, pâture) | v0.1, 04/2024 (dormant) | maison | ❌ |
| [Paper-Cut Nature](https://captain-moo.itch.io/nature-pack) (Captain Moo) | 3 € | 64/256 px, **eau animée 21 img**, 3 arbres, fleurs ; pas d'animaux | ? | maison | ❌ |
| [Hand-Drawn Square Characters 8 dir](https://rgsdev.itch.io/hand-drawn-square-characters-animated-8-directions-top-down-free-cc0) (RGS_Dev) | gratuit | 4 persos 128 px, 8 dir, idle/marche/saut | 2023 | **CC0** | ✅ |
| GameDeveloperStudio (§4) + [Hand Painted Grassland](https://danielthomasart.itch.io/2d-hand-painted-dungeon-tileset) (D. Thomas, 13 $) | 4-20 $ | seuls animaux top-down au rendu illustré ; sols peints HD | — | maison | ❌ |

### Animaux introuvables et coût d'une commission

- **Héron top-down animé : introuvable** (itch, OGA, GDS). Seul cousin : [Shoebill, Micro Mobs Plains](https://hunter-art.itch.io/micro-mobs-pack-3) (gratuit, pixel, **vue de côté**).
- **Loutre top-down : introuvable** ; quatre loutres de côté : [RiLi_XL](https://rili-xl.itch.io/otter-sprite-pack), [Hamstar](https://hamstar-games.itch.io/otterpack) (gratuites), [Lil Otter](https://seethingswarm.itch.io/lil-otter) 11,99 $, GDS 5 $.
- **Chouette en vol : introuvable** (DeepDive = posée ; [Elthen Owl](https://elthen.itch.io/2d-pixel-art-owl-sprites) = côté, CC BY-NC). **Hirondelle** : rien de dédié, LPC Birds ou silhouettes Alenia.
- **Cycliste 4 dir** : introuvable en pixel top-down. **Tram** : seul [2DPIXX Vehicle Set](https://2dpixx.itch.io/modern-city-game-kit-vehicle-set) 9 $ (bus, tram modulaire, 4 dir) mais tuiles **128 px**. **Eau sale/algues** : seul Buggy Studio (iso) ; sinon teinte maison.
- **Tarifs réels** : Fiverr [Pixocanvas](https://www.fiverr.com/pixocanvas/design-pixel-art-sprite-sheet-and-animation) 5 $, [Admurin](https://www.fiverr.com/admurin/pixel-art-animations-for-games) 15 $, [Riklaionel](https://www.fiverr.com/riklaionel/create-any-character-in-pixel-art-figthing-game-arcade-style) 20 $, [Metalzebra](https://www.fiverr.com/metalzebra/do-high-quality-pixel-art-and-animations) 30 $, [Trexrell](https://www.fiverr.com/trexrell/create-pixel-art-sprites-for-games-animation-and-more) 40 $ (16 px, 6 img), [Narapop](https://www.fiverr.com/narapop/make-pixel-art-animation) 70 $. Indépendants : feuille 4 dir 20-50 $ + 5-10 $/image ; pro ≈ 2 h/image à 20-30 $/h ; Upwork médiane 25 $/h. **Estimation** : un animal 16 px, 4 dir, idle + marche (≈ 32 img) : 60-150 $ (Fiverr) à 150-400 $ (artiste confirmé) ; 32 px détaillé : 200-600 $. Lot héron + loutre + chouette + hirondelle + cycliste : **≈ 500-1 500 $ en 16 px, 1 000-3 000 $ en 32 px**.

### A) Meilleur assemblage par style

| Style | Assemblage | Coût | Manques |
|---|---|---|---|
| **16 px** | Cozy Farm (saisons, cultures, verger) + Cute Fantasy (eau, falaises, canard/grenouille/abeille) + Verdant 38 (rivière orientée) + Seliel (roseaux) + DeepDive (cerf, hibou) + Time Fantasy (4 dir) + LPC Birds + Butterfly/Deer OGA + Cozy People ou Maru + Pixel Vehicles + GegX + Alenia | ≈ 55 $ (+ 40 $ Seliel) | tram, cycliste, héron, loutre, chouette en vol, eau sale ; 3 palettes à harmoniser |
| **32 px** | ToffeeCraft + Pixel Vehicles 32 + Time Fantasy 32 + Pixeline + Town Folk + Hunt Animals + Deer Rework/LPC Birds + GegX/Alenia ; nature de base agrandie ×2 ou Seliel | ≈ 40 $ | aucun tileset 32 px complet 4 saisons + rivière ; mêmes animaux manquants |
| **Iso pixel** | Buggy Studio (CC0) + Formwork + Pozac + Kenney Isometric (CC0) + Bicycle OGA | ≈ 11 $ | **aucun animal**, ni saisons ni eau animée, peu de personnages |
| **Vectoriel** | Kenney (Racing, Isometric Vehicles, Animal Pack, Toon) + Unlucky Studio + RGS_Dev + Last Tick + GDS (renard, cerf, ours, loup, sanglier, hérisson, oiseaux, voitures, gens) | ≈ 60-80 $ | animaux Kenney de face ; GDS = rig Spriter à exporter ; pas de saisons ; héron/loutre absents |
| **Illustré** | schwarnhild + Captain Moo + D. Thomas + RGS_Dev + GDS + Unlucky | ≈ 35-60 $ | très lacunaire (véhicules, saisons, rivière, animaux) ; packs dormants |

### B) Classement par couverture

1. **Pixel 16 px** (~80 %) : plus grand choix, saisons + cultures + rivière orientée + véhicules 8 dir CC BY.
2. **Pixel 32 px** (~60 %) : bons animaux sauvages animés, nature complète absente.
3. **Vectoriel plat** (~55 %) : meilleure part redistribuable (Kenney CC0), animaux de face.
4. **Iso pixel** (~45 %) : excellent socle CC0, zéro animal.
5. **Illustré doux** (~30 %) : presque tout à commander.

### C) Pièges

- **Tailles mélangées** : 2DPIXX et Admurin 128 px, GDS HD, AbyssalHunter 48 px ; le 16 px agrandi ×2 jure à côté du vrai 32 px.
- **Perspectives** : loutres, Elthen, Micro Mobs = **vue de côté** ; Kenney Animal Pack = face ; Vectoraith et MiniWorld = 1 direction.
- **Gratuit = non commercial** : Cozy Farm/People, Sprout Lands, AbyssalHunter, ToffeeCraft, El Beshuele (NC), Elthen (BY-NC) : payer le palier.
- **Faux libre** : Alenia « CC BY + termes » et khaledpng « CC BY 4.0 » ajoutent une clause anti-redistribution ; LPC offre SA/GPL (prendre CC-BY 4.0) ; CraftPix et GDS interdisent le dépôt public ; Freepik/Vecteezy exigent attribution.
- **Licence absente** : Maru, NeikNat, nacl1234 (de plus AI assisted), Icarus Studios : écrire à l'auteur avant achat.
- **Packs dormants** : schwarnhild (2024), DeepDive (10/2024), Pixel Vehicles (2023), Kenney iso (2014), Unlucky Studio (2015).
- **Dépôt** : ne versionner que CC0/CC BY (Kenney, MiniWorld, Buggy Studio, Pixel Vehicles, OGA) ; packs itch dans un dossier ignoré par git, listés dans CREDITS.md.

## 13. Tiletown — Interface, icônes et polices (recherche du 2026-10-04)

Méthode : recherche web + lecture des pages de licence ; **polices téléchargées et inspectées avec fontTools** (cmap : é è ê ë à â ç î ï ô ù û ü œ Œ É À Ç È « » ’ € ° …) ; inventaires d'icônes tirés des paquets npm (Lucide 1.52.0, Phosphor 2.1.1, Tabler 3.48.0), de `fonts.google.com/metadata/icons` et de game-icons.net.
« Dépôt » : ✅ redistribuable dans un dépôt GitHub public ; ⚠️ oui avec attribution ; ❌ non (licence maison, BY-SA, non commercial).

### 1. Cadres, panneaux, boutons

| Kit | Auteur | Contenu | Prix | Licence | Dépôt |
|---|---|---|---|---|---|
| [UI Pack 2.0](https://kenney.nl/assets/ui-pack) | Kenney | 430 fichiers, 5 couleurs, boutons/panneaux/curseurs/cases, PNG + SVG | 0 | CC0 | ✅ |
| [UI Pack – Pixel Adventure](https://kenney.nl/assets/ui-pack-pixel-adventure) | Kenney | 500+ tuiles pixel, contours fin/épais, panneaux, barres, cases, curseurs | 0 | CC0 | ✅ |
| [UI Pack – Adventure](https://kenney.nl/assets/ui-pack-adventure) | Kenney | 130 fichiers vectoriels (bois, parchemin, rubans), PNG + SVG | 0 | CC0 | ✅ |
| [Pixel UI pack 750](https://opengameart.org/content/pixel-ui-pack-750-assets) | Kenney (OGA) | 750 tuiles 16×16 en 9-slice | 0 | CC0 | ✅ |
| [Input Prompts](https://kenney-assets.itch.io/input-prompts) | Kenney | 1 280+ icônes dont **gestes tactiles**, PNG + SVG | 0 | CC0 | ✅ |
| [Complete UI Essential Pack](https://crusenho.itch.io/complete-ui-essential-pack) | Crusenho | 800+ éléments 32×32, 13 thèmes (Flat gratuit), Aseprite + PNG | 0 / 3,51 $ | CC BY 4.0 | ⚠️ |
| [Pixel Art GUI Elements](https://mounirtohami.itch.io/pixel-art-gui-elements) | Mounir Tohami | GUI.png, cité CC0 | 0 | CC0 déclaré | ⚠️ **page en 404 le 2026-10-04** |
| [Giant Basic GUI Bundle](https://penzilla.itch.io/basic-gui-bundle) | Penzilla | 220 éléments PNG + SVG | libre | « royalty free », PDF maison | ❌ |
| [GUI Casual Nature](https://wenrexa.itch.io/gui-nature) + [UI Casual](https://wenrexa.itch.io/uimobile-free) | Wenrexa | Boutons, panneaux « nature » ; PSD, **pas de vecteur** | 0 | CC0 | ✅ |
| [Simple Vector UI Pack](https://playpug.itch.io/simple-vector-ui-pack) | PlayPug | Boutons, toggles, curseurs 9-slice, onglets, barres ; SVG en payant | 0 / 3,23 $ | CC0 | ✅ |
| [Cozy GUI](https://pizzadoggy.itch.io/cozy-gui) | pizzadoggy | Tileset GUI cosy | 1 € | CC0 | ✅ |
| [Cozy UI Pack](https://dobo-ui.itch.io/cozy-ui) | dobo_ui | 1 000+ éléments cartoon, police Fredoka | 8,54 $ | maison, pas de redistribution | ❌ |
| Pixel-Banner, Humble Pixel, [BDragon1727](https://bdragon1727.itch.io/pixel-ui-icon-all) | divers | UI pixel 32×32 | 0–2 $ | maison ; BDragon : don obligatoire si commercial | ❌ |
| CraftPix · GameDev Market | — | GUI complets | abonnement | maison : sources non redistribuables | ❌ |

Introuvables sur itch.io : « Cheeky Pixels », « PaperMartin », « Pixel Poem » (seulement des effets).

### 2. Icônes

| Source | Volume, licence | Vérifié pour Tiletown | Dépôt |
|---|---|---|---|
| [game-icons.net](https://game-icons.net/about.html) | ~4 000 SVG, **CC BY 3.0** (Lorc, Delapouite…) | stag head, **heron**, **swallow**, bee, owl, fox head ; **pas de loutre** | ⚠️ « Icons made by {auteur}. Available on https://game-icons.net » |
| [Lucide](https://lucide.dev) | 2 130, ISC, 24 px / trait 2 px | bird, rabbit, snail ; wind, cloud-fog, haze, droplet, flame, thermometer-sun, waves, factory, leaf ; smile/frown/meh, users, briefcase, zap, utensils, coins, star, lock, pause, play, fast-forward, gauge, layers, hammer | ✅ |
| [Tabler](https://tabler.io/icons) | 5 166 outline + filled, MIT, 24 px | **deer**, butterfly ; **flood**, haze, mist, cloud-storm, wind-electricity, windmill, solar-panel, seedling, building-factory ; mood-*, coin-euro, pig-money, player-pause/play/skip-forward, urgent | ✅ |
| [Phosphor](https://phosphoricons.com) | 1 512 × 6 graisses, MIT | bird, butterfly, cow ; hurricane, tornado, thermometer-hot, farm, barn, nuclear-plant ; smiley-*, users-three, currency-eur | ✅ |
| [Material Symbols](https://fonts.google.com/icons) | 2 122, Apache 2.0, variable (wght, FILL, GRAD, opsz) | air, water_drop, flood, thunderstorm, cyclone, severe_cold, co2, factory, wind_power, solar_power, emoji_nature (abeille), flutter_dash (oiseau), sentiment_*, groups, work, payments, luggage, forest, recycling, pause, fast_forward, speed, layers, lock, star, crisis_alert | ✅ |
| Heroicons (~300, MIT) · Feather (287, MIT, inactif) · Iconoir (~1 600, MIT) · Remix (~3 000, Apache 2.0) | | boutons génériques | ✅ |
| [Font Awesome Free](https://github.com/FortAwesome/Font-Awesome/blob/master/LICENSE.txt) | icônes CC BY 4.0, polices OFL, code MIT | **otter**, dove, crow, frog | ⚠️ |
| [Noto Emoji](https://github.com/googlefonts/noto-emoji) | police mono variable **OFL** ; SVG/PNG couleur **Apache 2.0** | 🦌 🐝 🦉 🦊 🦦 🐦 🕊 🦢 🦩 ; 🌬 🌫 🌊 🥵 🌡 🏭 ; 🌸 ☀️ 🍂 ❄️ ; pas de héron/hirondelle | ✅ |
| Twemoji → fork maintenu [jdecked/twemoji](https://github.com/jdecked/twemoji) | graphismes CC BY 4.0, code MIT | mêmes emojis | ⚠️ |
| [OpenMoji](https://openmoji.org/faq/) | **CC BY-SA 4.0** | copyleft : toute adaptation reste BY-SA | ❌ |
| Flaticon | gratuit = lien visible « designed by X from Flaticon » + **interdiction de distribuer** ; Premium 12,99 $/mois | | ❌ |
| The Noun Project | gratuit = CC BY 3.0 par auteur ; Icon Pro 3,33 $/mois (licence maison) | | ⚠️ gratuit seulement |
| [1-bit Pixel Icons](https://nikoichu.itch.io/pixel-icons) | Nikoichu, 1 476 icônes 16×16, **CC0** | météo, emoji, pause/avance, flèches, marqueurs, nourriture | ✅ |
| [Animal Icons](https://ydo4ki.itch.io/animalicons) | Ydo4ki, 15 sprites 16×16, CC0 | cerf, renard, canard, aigle | ✅ |
| [Kyrise](https://kyrise.itch.io/kyrises-free-16x16-rpg-icon-pack) · [Shikashi](https://cheekyinkling.itch.io/shikashis-fantasy-icons-pack) · [Crusenho Icons](https://crusenho.itch.io/icons-essential-pack-free-icons) | 350+ / 600+ / 80, CC BY 4.0 | objets, outils, nature | ⚠️ |
| [Weather & Time](https://antahonist.itch.io/48-weather-time-icons-pixel-art-pack) · [Pet & Companion](https://antahonist.itch.io/48-pet-companion-icons-pixel-art) | Antahonist, 56/48 icônes 32–64 px, 3,59 $ chacun | heatwave, flood, foggy, 4 saisons ; renard, chouette, cerf, loutre | ❌ maison |
| Kenney [Game Icons](https://kenney.nl/assets/game-icons) (105) · Board Game Icons (250) · [Emotes](https://kenney.nl/assets/emotes-pack) (480) · Karsiori (cadenas animés) | CC0 | pause, avance, cadenas, étoile, flèches, visages | ✅ |

### 3. Polices (toutes inspectées ; « accents » = 25 caractères testés)

| Police | Auteur | Licence | Graisses | x / cap. | Accents | Lisibilité 14–18 px |
|---|---|---|---|---|---|---|
| [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) | Stefie Justprince | OFL | variable 400–700 | 0,45 / 0,70 | ✅ 574 glyphes | Bonne dès 16 px, minuscules nettes |
| [Tiny5](https://fonts.google.com/specimen/Tiny5) | Stefan Schmidt | OFL | 400 | 0,50 / 0,62 | ✅ 1 154 | Très bonne à 15–16 px (grille 5 px) |
| [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) | CodeMan38 | OFL | 400 | 0,75 / 1,00 | ✅ 656 | Titres ≥ 16 px ; minuscules tassées |
| [Silkscreen](https://fonts.google.com/specimen/Silkscreen) | Jason Kottke | OFL | 400, 700 | 0,50 / 0,70 | ✅ | Étiquettes ≥ 16 px |
| [VT323](https://fonts.google.com/specimen/VT323) | Peter Hull | OFL | 400 | 0,40 / 0,56 | ✅ | Mono, 18 px+ |
| [Jersey 10/15/20/25](https://fonts.google.com/specimen/Jersey+10) | Sarah Cadigan-Fried | OFL | 400 | 0,43–0,46 | ✅ | Condensées, bonnes pour chiffres |
| [DotGothic16](https://fonts.google.com/specimen/DotGothic16) | Fontworks | OFL | 400 | 0,54 / 0,79 | ✅ 8 231 | Excellente à 16 px (à sous-ensembler) |
| [Handjet](https://fonts.google.com/specimen/Handjet) | Rosetta | OFL | variable wght, ELGR, ELSH | 0,47 / 0,65 | ✅ | Matrice réglable, corps 16 px |
| Micro 5 · Jacquard 12/24 · Bytesized · Workbench · Sixtyfour | Cadigan-Fried, Baltdev, Kutílek | OFL | 400 | 0,36–0,62 | ✅ | Titres uniquement |
| [m5x7](https://managore.itch.io/m5x7) / m3x6 | Daniel Linssen | **CC0** | 400 | grille 5×7 | ✅ sauf **’ …** | Très lisible à 16/32 px |
| [Pixel Operator](https://www.dafont.com/pixel-operator.font) | Jayvee Enaguas | **CC0** | Regular/Bold, Mono, 8, HB, SC (15 fichiers) | 0,44 / 0,56 | ✅ 238 | Référence pixel, bold disponible |
| [Departure Mono](https://departuremono.com) | Helena Zhang | OFL | 400 | 0,55 / 0,73 | ✅ 1 079 | Mono, zéro barré : jauges |
| [monogram](https://datagoblin.itch.io/monogram) | datagoblin | CC0 | regular, extended, italic | 5 px | ✅ déclaré ; **œ non vérifié** | Mono compact |
| [Kenney Fonts](https://kenney.nl/assets/kenney-fonts) (12 TTF) | Kenney | CC0 | 400 | 0,38–0,88 | ❌ **œ/Œ absents** | Titres seulement |
| Minecraftia | Andrew Tyler | commercial payant, CC BY-SA | | | | ❌ |
| [Nunito](https://fonts.google.com/specimen/Nunito) | V. Adams, Cyreal | OFL | variable 200–1000 + italique | 0,48 / 0,70 | ✅ 938 | Référence douce, lisible à 14 px |
| [Baloo 2](https://fonts.google.com/specimen/Baloo+2) | Ek Type | OFL | 400–800 | 0,46 / 0,60 | ✅ | Titres ronds ; corps ≥ 15 px |
| [Fredoka](https://fonts.google.com/specimen/Fredoka) | M. Brandão | OFL | variable 300–700 + largeur | 0,50 / 0,70 | ✅ | Ludique ; 0/O proches |
| [Quicksand](https://fonts.google.com/specimen/Quicksand) · [Comfortaa](https://fonts.google.com/specimen/Comfortaa) | Paglinawan · Aakerlund | OFL | 300–700 | 0,50–0,55 | ✅ | Géométriques fines : 16 px+, graisse ≥ 500 |
| [Patrick Hand](https://fonts.google.com/specimen/Patrick+Hand) · [Itim](https://fonts.google.com/specimen/Itim) | Wagesreiter · Cadson Demak | OFL | 400 | 0,47 | ✅ | Manuscrites lisibles (carnet) |
| [Caveat](https://fonts.google.com/specimen/Caveat) | Impallari | OFL | 400–700 | 0,40 | ✅ | Trop fine pour le corps |
| [Gaegu](https://fonts.google.com/specimen/Gaegu) | JIKJI Soft | OFL | 300/400/700 | 0,34 | ❌ **aucun accent** | **ÉLIMINÉE** |
| [Varela Round](https://fonts.google.com/specimen/Varela+Round) | Joe Prince | OFL | 400 | 0,51 / 0,70 | ✅ | Bonne, une seule graisse |
| [M PLUS Rounded 1c](https://fonts.google.com/specimen/M+PLUS+Rounded+1c) | Coji Morishita | OFL | 7 graisses | n.r. | ✅ 8 201 | Lourde, à sous-ensembler |
| [Atkinson Hyperlegible Next](https://fonts.google.com/specimen/Atkinson+Hyperlegible+Next) | Braille Institute | OFL | variable 200–800 | 0,50 / 0,67 | ✅ | 0/O, 1/l/I différenciés par conception |

### A. Trois kits cohérents

**Kit 1 — Pixel art (0 €, tout CC0).** Cadres : Kenney *Pixel Adventure* (feuille, fiches, bilans ; contours épais pour les cibles 48 px) + *Pixel UI 750* (9-slice des cartes du catalogue). Icônes : Nikoichu (météo, brume, flèches, pause/vitesses, visages) + Kenney *Game Icons* (cadenas, étoile) + Ydo4ki (cerf, renard). Polices : Tiny5 corps, Press Start 2P titres. Manques : héron, loutre, abeille, chouette, hirondelle à dessiner en 16×16 (ou Kyrise/Shikashi en CC BY) ; alertes algues/canicule ; écrans de titre et de fin à composer.

**Kit 2 — Vectoriel plat (0 €).** Cadres : Kenney *UI Pack 2.0* (SVG, 5 couleurs → une par onglet) + *Input Prompts* (gestes du tutoriel). Icônes : Tabler (cerf, crue, brume, vent, usine, humeurs, lecteur) complété par Lucide (même grille), Material Symbols pour l'état FILL des onglets ; espèces : game-icons.net (CC BY 3.0) + Font Awesome *otter* (CC BY 4.0), à harmoniser en trait. Polices : Nunito corps, Baloo 2 titres. Manques : cohérence de style des 7 espèces (trois sources).

**Kit 3 — Illustré doux (0 à 4,23 $).** Cadres : Kenney *Adventure* (bois/parchemin SVG) + Wenrexa *Casual Nature* (PSD) ; boutons/curseurs 9-slice : PlayPug (3,23 $) ou pizzadoggy (1 €). Icônes : Noto Emoji couleur (cerf, abeille, chouette, renard, loutre, saisons, brume, vague, canicule) ou Twemoji fork jdecked + Kenney *Emotes* (bonheur). Polices : Fredoka titres, Nunito corps, Patrick Hand carnet. Manques : héron et hirondelle (emoji génériques) ; recoloriser pour unifier Kenney/Wenrexa.

### B. Polices recommandées (accents ✅ vérifiés)

| Kit | Corps | Titre | Justification |
|---|---|---|---|
| Pixel | **Tiny5** 15–16 px (ou Pixelify Sans 16 px) | **Press Start 2P** 16–24 px | Tiny5 : 1 154 glyphes, hauteur d'x 0,50, net aux multiples de 5 px ; Pixelify variable pour les prix en gras ; Press Start 2P réservé aux titres. Jauges : Departure Mono (zéro barré) ou Pixel Operator. |
| Vectoriel | **Nunito** 14–16 px, 500–700 | **Baloo 2** 700–800 | Nunito : x 0,48, 9 graisses, 938 glyphes ; Baloo 2 dense et lisible sur fond coloré. Chiffres : Atkinson Hyperlegible Next (0/O, 1/l distincts). |
| Illustré | **Nunito** (ou Varela Round) | **Fredoka** 600–700 | Fredoka : x 0,50, axe largeur pour boutons étroits ; l'éviter pour les nombres seuls (0/O). Carnet : Patrick Hand ou Itim. |

### C. Pièges

1. **Accents** : Gaegu n'a aucun accent ; les Kenney Fonts n'ont pas œ/Œ ; m5x7 n'a ni ’ ni … (prévoir ' et ...) ; monogram extended : œ à vérifier. Tester avec « cœur, à côté, çà, Été, 0O 1lI ».
2. **Taille** : Press Start 2P, Micro 5, Bytesized, Jacquard, Silkscreen : titres seulement ; corps ≥ 15 px et multiples de la grille (5, 8, 16).
3. **« Gratuit » ≠ libre** : Flaticon (attribution + interdiction de redistribuer), Noun Project payant, Penzilla, Humble Pixel, dobo_ui, Antahonist, CraftPix, GameDev Market : **sources non committables** ; BDragon1727 non commercial sans don.
4. **Copyleft** : OpenMoji et Minecraftia (CC BY-SA) contaminent tout dérivé : à écarter.
5. **Attribution CC BY** : game-icons.net exige l'auteur de chaque icône ; Shikashi, Kyrise, Crusenho, Twemoji, Font Awesome aussi → `CREDITS.md`. La clause « pas de revente » de Crusenho contredit CC BY : la respecter par courtoisie.
6. **Pérennité** : page de Mounir Tohami en 404 ; Twemoji d'origine abandonné (fork jdecked) ; Feather figé (préférer Lucide). Archiver chaque ressource avec sa licence.
7. **Poids** : Material Symbols en police pèse plusieurs Mo : n'embarquer que les SVG utilisés ; sous-ensembler DotGothic16 et M PLUS.

## 14. Audio et polices pour Tiletown — sources vérifiées le 2026-10-04

Légende « dépôt public » : **CC0** = oui ; **CC BY** = oui avec crédit dans `CREDITS.md` ; **⚠️ hors dépôt** = licence royalty-free propriétaire, fichiers non redistribuables (dossier ignoré par git ou dépôt privé) ; **❌** = exclu.

### 1. Musique gratuite

| Source | Couvre | Prix | Licence | Dépôt public |
|---|---|---|---|---|
| [Incompetech – Kevin MacLeod](https://incompetech.com/music/royalty-free/faq.html) | 2 000+ titres ; folk/acoustique : [« Fretless »](https://incompetech.com/wordpress/2015/11/fretless/), [« Wholesome »](https://incompetech.com/wordpress/2019/07/wholesome/), « Carefree » | gratuit ; licence sans crédit 30 $/titre (50 $ pour 2, 20 $/titre dès 3) | CC BY 4.0 | oui + crédit |
| [FreePD](https://freepd.com) | sous-ensemble domaine public (même auteur) | gratuit | CC0 | oui |
| [Abstraction – Music Loop Bundle](https://tallbeard.itch.io/music-loop-bundle) + [Three Red Hearts](https://tallbeard.itch.io/three-red-hearts-prepare-to-dev) | 200+ boucles chiptune/lounge prêtes à boucler | PWYW (0 $) | CC0 (crédit « Abstraction » souhaité) | oui |
| [OpenGameArt](https://opengameart.org) | voir candidats saisons (A) | gratuit | par fichier : CC0, CC BY 3.0/4.0, parfois BY-SA/OGA-BY | selon fichier |
| [Komiku (FMA)](https://freemusicarchive.org/music/Komiku) | chiptune/guitare joyeux : [« Chill Out Theme »](https://opengameart.org/content/chill-out-theme), « Cliff Road Chill », « Champ de tournesol » | gratuit | CC0 | oui |
| [Joshua McLean / Retro Indie Josh](https://retroindiejosh.itch.io) | packs chiptune/électro | gratuit | CC BY 4.0 (anciens packs BY-SA : vérifier) | oui + crédit |
| [Jonathan Shaw](https://www.jshaw.co.uk) ([ex. OGA](https://opengameart.org/node/183688)) | orchestral RPG : hors ton | gratuit | CC BY 3.0/4.0 | oui + crédit |
| [Alexander Nakarada](https://www.free-stock-music.com/alexander-nakarada-townsong.html) | folk/celtique (« Townsong ») | gratuit ; sans crédit 20 $/titre | CC BY 4.0 | oui + crédit |
| [Scott Buckley](https://www.scottbuckley.com.au/library/using-this-music/) | ambient/cinématique (nappes hiver) | gratuit | CC BY 4.0, interdit Content ID | oui + crédit |
| [Pixabay Music](https://pixabay.com/service/license-summary/) | lo-fi abondant | gratuit | Pixabay Content License (pas CC) : « cannot sell or distribute Content on a Standalone basis » | ⚠️ hors dépôt |
| [YouTube Audio Library](https://licenseorg.com/guide/music-audio/youtube-audio-library) | — | gratuit | limitée aux vidéos (sauf rares titres CC BY) | ❌ |
| [Chillhop](https://chillhop.com/about/creator-terms-of-service/) | — | — | programme créateurs : jeux explicitement exclus | ❌ |
| Epidemic Sound | — | abonnement | non adapté à un jeu redistribué | ❌ |

### 2. Musique payante

| Source | Couvre | Prix | Licence | Dépôt public |
|---|---|---|---|---|
| [Pelican Breeze](https://agavius.itch.io/pelicanbreeze) | 10 titres façon Stardew, WAV/MP3 | 2,79 $ (promo ; 3,99 $) | « unrestricted », balise CC0 | oui (garder la facture) |
| [Farm Life Acoustic BGM](https://sunnymelodylab.itch.io/farm-life-bgm) | 9 boucles acoustiques ferme/village | ≥ 4,99 $ | royalty-free propriétaire | ⚠️ |
| [Cozy Lo-fi Game Music Pack (HAJI)](https://haji-creative.itch.io/cozy-lo-fi-game-music-pack) | 6 boucles lo-fi 24 bit/48 kHz | ≥ 11,99 $ | crédit « Kim Dahye (nine) » obligatoire, redistribution interdite | ⚠️ |
| [Cozy Sim Music Pack – Town Life](https://richarrest.itch.io/cozy-sim-music-pack-town-life-grand-pack) | ville cosy | Tiny gratuit / Grand ≥ 10 $ | CC BY-SA 4.0 | à éviter (copyleft) |
| [Ovani – Casual Music Pack](https://ovanisound.com/products/casual-music-pack-vol-1) | 10 titres × 3 intensités (~90 s) + coupes 30/60 s : idéal « prospérité » | 50 $ | royalty-free, pas de redistribution standalone ([FAQ](https://ovanisound.com/pages/faq)) | ⚠️ |
| [Humble Bundle × Ovani](https://gamefromscratch.com/infinite-echoes-ultimate-ovani-sound-and-music-humble-bundle/) | 40+ packs | palier haut 20 $ (févr. 2025) ; aucun bundle audio en cours vérifiable au 04/10/2026 | idem Ovani | ⚠️ |
| [GameDev Market](https://itch.io/post/390325) | packs variés | 5–30 $ | « tout sauf redistribuer » | ⚠️ |
| [Fesliyan Studios](https://www.fesliyanstudios.com/policy) | calme/lo-fi | gratuit avec crédit (non commercial) ; commercial = don libre | propriétaire | ⚠️ |
| Commande indé ([Ninichi](https://ninichimusic.com/blog/understanding-how-much-an-indie-game-music-composer-costs), [Bugnet](https://bugnet.io/blog/how-much-does-game-music-cost)) | sur mesure | 50–2 500 $/min ; amateur 30–100 $/min, indé pro 200–400 $/min → boucle 2 min : 60–200 $ (amateur), 400–800 $ (pro) | à négocier (demander CC BY ou cession) | selon contrat |

### 3. Effets, ambiances, animaux

| Source | Couvre | Prix | Licence | Dépôt public |
|---|---|---|---|---|
| Kenney [Interface Sounds](https://kenney.nl/assets/interface-sounds) (100 OGG), [UI Audio](https://kenney.nl/assets/ui-audio) (50), [Music Jingles](https://kenney.nl/assets/music-jingles) (85), [Impact Sounds](https://kenney.nl/assets/impact-sounds) | clics, confirmations, jingles bilan/niveau, pose de tuile | gratuit | CC0 | oui |
| [Freesound](https://freesound.org) (filtre `license:"Creative Commons 0"`) | animaux : [héron 20 CC0](https://freesound.org/search/?q=heron&f=license%3A%22Creative+Commons+0%22), [loutre 17](https://freesound.org/search/?q=otter&f=license%3A%22Creative+Commons+0%22), [hirondelles 29](https://freesound.org/search/?q=swallow+bird&f=license%3A%22Creative+Commons+0%22), [abeilles 410](https://freesound.org/search/?q=bees+buzzing&f=license%3A%22Creative+Commons+0%22) ; cerf : 1 seul CC0 → CC BY | gratuit | CC0 / CC BY / CC BY-NC (exclure NC) | oui / oui + crédit |
| [OGA – Park Ambiences](https://opengameart.org/content/park-ambiences) | oiseaux avant pluie, rivière, vent | gratuit | CC0 | oui |
| [OGA – JC Sounds Nature Ambient Pack Vol 1](https://opengameart.org/node/180349) | 26 boucles > 1 min : forêts (8), eau (6), pluie/vent (8), feu (4) | gratuit | CC BY 4.0 | oui + crédit |
| [Sonniss GameAudioGDC 2026](https://sonniss.com/gameaudiogdc) ([annonce](https://rekkerd.org/sonniss-releases-gdc-2026-game-audio-bundle/)) | 7,47 Go pro + archives 2015-2024 | gratuit | royalty-free sans crédit ; redistribution standalone interdite ; pas d'IA | ⚠️ |
| [Ovani Environmental Ambience Mega Bundle](https://ovanisound.com/products/environmental-ambience-bundle) | forêt, rivière, ville, pluie, vent | 64 $ (80 $) | Ovani | ⚠️ |
| [ZapSplat](https://licenseorg.com/guide/music-audio/zapsplat) | large | gratuit (crédit) / Gold | propre, pas de redistribution | ⚠️ |
| [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/licensing) | 33 000 sons | gratuit | RemArc : personnel/éducatif/recherche | ❌ |
| [xeno-canto](https://xeno-canto.org/about/terms) | oiseaux | gratuit | BY-NC-SA / BY-NC-ND majoritaires, quelques BY-SA, pas de CC0 | ❌ (NC/SA) |

### 4. Polices

| Police | Licence | Caractères | Remarque |
|---|---|---|---|
| [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) | OFL 1.1 | latin, latin-ext, cyrillique ; variable 400–700 | proportionnelle, 2 graisses en 1 fichier |
| [Jersey 10/15/20/25](https://fonts.google.com/specimen/Jersey+10) | OFL 1.1 | latin, latin-ext | chiffre = hauteur de capitale native en px |
| [Micro 5](https://fonts.google.com/specimen/Micro+5) / [Tiny5](https://fonts.google.com/specimen/Tiny5) | OFL | latin-ext (+ cyrillique/grec pour Tiny5) | 5 px : HUD compact seulement |
| [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) | OFL | latin-ext, cyrillique, grec | monospace 8×8, large → titres/logo |
| [Silkscreen](https://fonts.google.com/specimen/Silkscreen) / [VT323](https://fonts.google.com/specimen/VT323) | OFL | latin-ext | aspect techno/terminal, peu cosy |
| [m5x7](https://managore.itch.io/m5x7) | CC0 (balise itch), crédit apprécié | accents inclus | 16 px natif |
| [m3x6](https://managore.itch.io/m3x6) | « free to use with attribution », pas de licence formelle | accents non précisés | ⚠️ à éviter |
| [Kenney Fonts](https://opengameart.org/content/kenney-fonts) | CC0 | KenPixel Mini/Square/Blocks | accents limités |
| [Monocraft](https://github.com/IdreesInc/Monocraft) (OFL), [Pixel Operator](https://notabug.org/HarvettFox96/ttf-pixeloperator) (CC0), [Departure Mono](https://departuremono.com) (OFL) | libres | — | Pixel Operator = bonne alternative corps ; les deux autres sont monospace |

### A) Bande-son proposée

| Saison | Titre | Auteur | Lien | Licence |
|---|---|---|---|---|
| Printemps | Exploring Town (chiptune FM léger, village) | Spring Spring (Julie Damsgaard) | [OGA](https://opengameart.org/content/exploring-town) | CC0 (aussi BY 3.0/4.0) |
| Été | Chill Out Theme (guitare chill) | Komiku | [OGA](https://opengameart.org/content/chill-out-theme) | CC0 |
| Automne | Apple Cider (+ [Apple Cider Juiced!](https://opengameart.org/content/apple-cider-juiced) : 10 pistes avec versions bouclées, fanfares victoire/échec) | Zane Little Music | [OGA](https://opengameart.org/content/apple-cider) | CC0 |
| Hiver | Kalypo (Ice/Snow/Winter theme, FLAC → réencoder OGG) ; alt. [Snowland Town](https://opengameart.org/content/snowland-town) (M. Pablo, piano/cordes, versions bouclées, CC BY 3.0) | Spring Spring | [OGA](https://opengameart.org/node/148218) | CC0 / OGA-BY 3.0 |

Couches « prospérité » : boucles Abstraction (CC0) ; [Squirrel Village](https://opengameart.org/content/squirrel-village) (SoManyWhales, CC BY 4.0, intro/boucle/queue) ; « Fretless »/« Wholesome » (MacLeod, CC BY 4.0).

**Interface à synthétiser en Web Audio** : pose de tuile (bruit court filtré « bois »), confirmation (2 notes montantes), refus (note grave + chute), alerte douce (2 sinus), montée de niveau (arpège 4 notes), bilan (accord tenu).
**En fichier** : fanfare d'espèce (« Victory Fanfare » Zane Little CC0 ou Kenney Music Jingles), smog (nappe sourde Freesound CC0 ou bruit filtré synthétisé), algues (bulles Freesound CC0), crue (rivière forte JC Sounds/Freesound), ambiances (Park Ambiences, JC Sounds), cris d'animaux (Freesound CC0 ; cerf en CC BY).

### B) Kits

**Gratuit (0 €)** : les 4 morceaux ci-dessus + Abstraction + Kenney (Interface Sounds, UI Audio, Music Jingles) + Park Ambiences + JC Sounds (CC BY) + Freesound CC0. Il manque : brame de cerf CC0 (1 résultat → CC BY ou synthèse) ; variations d'intensité par prospérité (à bricoler par couches) ; cohérence de mixage (sources hétérogènes : normaliser à −16 LUFS, OGG) ; trafic urbain (Freesound CC0 abondant mais à trier).

**Payant (~129 $)** : Ovani Casual Music Pack 50 $ (3 intensités natives) + Ovani Environmental Ambience 64 $ + HAJI Cozy Lo-fi 11,99 $ + Pelican Breeze 2,79 $. Option commande : 4 boucles de 2 min ≈ 1 600–3 200 $ (indé pro) ou 240–800 $ (amateur). Il manque : les animaux (toujours Freesound) ; et les fichiers Ovani/HAJI doivent rester hors dépôt public (`assets/audio/licensed/` ignoré par git ou dépôt privé), crédit HAJI obligatoire.

### C) Polices recommandées (pour une direction pixel art)

- **Corps : Pixelify Sans 400** (OFL) à 16–18 px, 14 px minimum pour les légendes : proportionnelle, hauteur d'x élevée, chiffres bien différenciés (0/O, 1/l), accents français (latin-ext), graisse 700 dans le même fichier pour les montants ; tester 16/18 px et retenir la taille où la grille tombe juste (pas de flou).
- **Titre : Jersey 10** (OFL, latin-ext) à 30–40 px (multiples de sa hauteur native) : condensée mais ronde, plus « cosy » que Press Start 2P (monospace 8×8, à réserver au logo).
- Alternative HUD compact : m5x7 (CC0) à 32 px (×2) ou Pixel Operator (CC0) à 16/32 px.


## Sélection complémentaire pour la refonte — 2026-10-05

Recherche demandée après la refonte : améliorer les modèles 3D et comparer les packs existants à la création sur mesure ou par IA. Pages officielles et licences consultées le 5 octobre 2026. Cette sélection est une recommandation ; ces nouveaux packs ne sont pas encore intégrés.

### Direction recommandée : Tiny Treats + KayKit

Les auteurs de Tiny Treats indiquent explicitement que leurs modèles reprennent les dimensions et spécifications techniques de KayKit. Cette famille est donc un meilleur point de départ pour une ville miniature cohérente que l'accumulation de packs de styles différents.

| Priorité | Pack | Apport à Tiletown | Accès vérifié |
|---|---|---|---|
| 1 | [Tiny Treats — Homely House](https://tinytreats.itch.io/homely-house) | Maison, clôtures et jardin ; base pour plusieurs variantes de quartiers | 16+ modèles, version gratuite CC0, glTF/FBX/OBJ ; source Blender optionnelle à 3,95 $ |
| 2 | [KayKit — Forest Nature Pack](https://kaylousberg.itch.io/kaykit-forest) | Arbres, buissons, rochers et herbes ; enrichir les silhouettes de la vallée | 100+ modèles gratuits CC0 ; Extra à 9,99 $, Source à 14,99 $ |
| 3 | [Tiny Treats — Pretty Park](https://tinytreats.itch.io/pretty-park) | Fontaine, haies, sols et décoration ; parcs plus reconnaissables | 14+ modèles, version gratuite CC0, glTF/FBX/OBJ ; source Blender optionnelle à 3,95 $ |
| 4 | [KayKit — City Builder Bits](https://kaylousberg.itch.io/city-builder-bits) | Bâtiments urbains, voitures et mobilier ; compléter les niveaux denses | 32+ modèles gratuits CC0 ; extension parc à 3,95 $, source à 5,95 $ |
| Alternative | [Quaternius — Stylized Nature MegaKit](https://quaternius.com/packs/stylizednaturemegakit.html) | Végétation plus foisonnante, fleurs et feuillages texturés | CC0, glTF ; environ 60–70 % du pack gratuits, reste en éditions payantes |

Option esthétique intéressante mais payante : [Tiny Treats — Bakery Building](https://tinytreats.itch.io/bakery-building), 7,95 $, 32+ modèles, deux variantes de bâtiment et accessoires, CC0, sources Blender incluses. Aucun achat effectué. Les quatre packs gratuits ci-dessus permettent déjà une nouvelle famille visuelle complète.

Pour retrouver leur qualité visuelle dans le jeu, conserver leurs dégradés de texture, normaliser l'échelle et les orientations, puis utiliser les mêmes lumière et ombres. Les shaders Unity/Godot/Unreal montrés par certains packs ne sont pas transférés automatiquement dans three.js. La densité d'arbres, les matériaux et les niveaux de détail doivent être mesurés sur téléphone après import.

### Création sur mesure et génération IA

- **Disponible dans cette session** : construire des modèles en géométrie par code, les exporter en GLB et préparer leurs variantes ; générer des images de référence ou des textures. Les arbres arrondis et décors de la refonte illustrent déjà la première méthode. Pour une identité propre, privilégier une mairie, une école, une serre et une petite gare assorties à la famille choisie.
- **Image générée ≠ modèle 3D** : une image de concept ne fournit ni maillage, ni arrière du bâtiment, ni animations. Elle peut guider la modélisation ou un service image-vers-3D.
- [Meshy](https://www.meshy.ai/pricing) propose texte/image-vers-3D et export GLB ; sa page officielle indique une licence CC BY 4.0 pour les sorties gratuites, avec attribution, et des droits différents pour les abonnements. Ne pas confondre crédits du site et accès API.
- [Tripo](https://www.tripo3d.ai/help/privacy-policy/how-to-use-tripo-models-commercially) propose aussi la génération 3D ; sa documentation officielle réserve les droits commerciaux aux offres payantes.
- Recherche de connecteurs effectuée : aucun connecteur Meshy ou Tripo trouvé dans le catalogue interrogé. Aucun service 3D IA n'est connecté à cette session et aucune génération 3D externe n'a été lancée. Les outils d'image/vidéo disponibles ne remplacent pas un générateur de maillages 3D.

Recommandation : prendre Tiny Treats + KayKit pour la majorité du décor, créer les bâtiments emblématiques de Tiletown sur mesure et réserver un éventuel essai de génération 3D IA à un objet isolé. Vérifier ensuite ses faces cachées, son échelle, ses matériaux et son coût de rendu avant de le multiplier dans la ville.
