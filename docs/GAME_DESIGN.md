# Tiletown — conception du jeu

> Source de vérité du gameplay. Issu de la séance de réflexion du 2026-10-04 ; à faire évoluer à chaque décision (et à noter dans `JOURNAL.md`).

## 1. Pitch

Tiletown est un city builder en tuiles, cosy, en **3D basse définition au rendu lisse** (façon Islanders, Townscaper), joué sur téléphone en portrait.
On construit la ville la plus prospère possible **sans sacrifier la vallée qui l'accueille** : l'air, l'eau et la faune sont des jauges aussi importantes que l'argent et la population.
Chaque tuile posée est un îlot avec une spécialité (quartier, commerce, bureaux, usine, bâtiment spécial) ou un morceau de nature (forêt, champ, prairie, rivière, lac, zone humide).
Les routes se tracent toutes seules entre les îlots : le joueur ne dessine jamais une rue, il décide **où** la ville pousse.

## 2. Piliers de conception

1. **Une pose, une décision.** Chaque tuile posée doit poser une question intéressante : ici ou là, maintenant ou plus tard, au prix de quoi.
2. **La nature est un partenaire, pas un décor.** Une forêt bien placée vaut autant qu'un quartier : elle purifie l'air, protège l'eau, abrite une espèce et fait monter la valeur des terrains voisins.
3. **Lisible d'un coup d'œil sur un écran de téléphone.** Au plus 4 jauges, des calques colorés, un fantôme vert/rouge avant de poser, zéro menu profond.
4. **Sessions courtes, parties longues.** Le temps avance en accéléré avec pause et vitesses, comme dans Seve ; une partie de 3 ans se joue en trois ou quatre sessions et se pose à tout moment. Rien ne punit l'absence : le jeu est en pause quand on le quitte.
5. **Deux optimums interdits.** « Ne rien construire » et « tout bétonner » doivent tous deux perdre. La victoire est au croisement.

## 3. Le plateau et les tuiles

### 3.1 Grille

- **Grille carrée** (et non hexagonale) : simple à lire en portrait, naturelle pour des rues sur les arêtes, et c'est la grille des kits 3D libres (Kenney City Kit : une tuile = une unité). L'hexagone est plus élégant pour un Dorfromantik, mais il complique les rues et la lecture d'un plateau étroit.
- **Taille** : 12 × 16 tuiles au début (format portrait), extensible par « terrains » adjacents achetés ou gagnés (comme les lots de la carrière de Seve), jusqu'à 16 × 24. **Un îlot = une unité 3D** ; caméra orthographique inclinée à environ 35°, orientation fixe (pas de rotation libre au départ, pour garder des rues et des ombres lisibles) ; **zoom continu** au pincement, d'environ 6 îlots visibles en largeur (jeu) à toute la carte (vue d'ensemble). Rendu lisse à toute échelle.
- **Voisinage** : les effets d'adjacence se calculent sur les **4 voisins par côté** (les diagonales ne comptent que pour la contiguïté des habitats). Rayon fixe de 1 tuile pour les bonus/malus, 2 pour les services (école, clinique). Jamais de courbe de propagation à lire.
- **Carte générée à graine** : la vallée existe avant la ville. Rivière orientée (amont → aval), un ou deux lacs, massifs de forêt, prairies, champs, collines. Le joueur ne part jamais d'un désert plat : il s'installe dans un paysage.

### 3.2 Familles de tuiles

| Famille | Tuiles | Rôle économique | Rôle écologique |
|---|---|---|---|
| **Habitat** | Quartier (niv. 1 → 3 : maisons, immeubles bas, immeubles) | Population, taxes | Consomme eau et énergie ; rejette eaux usées |
| **Activité** | Commerce, Bureaux, Usine (niv. 1 → 2) | Emplois, recettes | Usine : air et eau ; commerce : trafic ; bureaux : neutre |
| **Services** | École, Clinique, Marché, Mairie, Gare/arrêt de tram | Bonheur, montée de niveau des quartiers | Transports : baissent le trafic routier |
| **Infrastructures** | Station d'épuration, Éolienne, Solaire, Centrale (gaz), Compost/recyclerie, Château d'eau | Énergie, eau potable, déchets | Centrale : air ; épuration : eau ; éolienne : bruit faible, faune oiseaux |
| **Nature plantée** | Parc, Forêt plantée, Haie bocagère, Zone humide restaurée, Verger | Valeur des terrains, tourisme | Puits d'air, filtre d'eau, habitat |
| **Nature native** (sur la carte) | Forêt ancienne, Prairie fleurie, Rivière, Lac, Zone humide, Colline, Champ | Bois, nourriture, pêche, tourisme | Habitats de référence, corridors ; **détruire en coûte plus que replanter ne rapporte** |

Principes :

- **Évolution plutôt qu'étalement.** Un quartier passe du niveau 1 au niveau 3 quand ses conditions sont réunies (emplois à portée, air ≥ 60, un service à 2 tuiles, un espace vert voisin). C'est la source principale de prospérité : densifier au lieu de grignoter la vallée.
- **Rendements décroissants entre doublons** (idée de Six Sided Streets) : deux usines côte à côte produisent moins, deux parcs côte à côte comptent moins. Le jeu pousse à la mosaïque, qui est aussi ce qui plaît à la faune.
- **La nature native vaut plus que la nature plantée.** Une forêt ancienne compte 1,5 en habitat ; une forêt plantée 1,0 et met 2 saisons à « mûrir ». Raser pour replanter ailleurs n'est jamais neutre.

## 4. Routes automatiques

### 4.1 Les rues sont des bords, pas des cases

Chaque tuile bâtie est un **îlot**. Les rues courent **sur les arêtes** entre deux îlots : elles ne consomment aucune case, se dessinent toutes seules (raccords automatiques comme les allées de Seve) et donnent immédiatement un aspect de ville.

- Chaque îlot bâti est **entouré de rues sur ses quatre côtés** : rue partagée entre deux îlots voisins, rue de ceinture face à la nature, quai le long de l'eau. La ville se lit immédiatement comme une ville.
- Une nature plantée (parc, forêt plantée, haie) n'est pas un îlot : un simple chemin la borde.
- Deux natures voisines → **aucune rue** : les corridors écologiques sont préservés par défaut.

En 3D, chaque îlot bâti est en retrait de sa case (≈ 0,7 unité d'emprise) : la bande de rue (0,36 unité d'asphalte, trottoirs clairs, ligne centrale) court sur l'arête, les coins reçoivent les carrefours ; entre deux natures l'espace est de l'herbe. Les ponts utilisent les pièces de pont du même kit.

### 4.2 Raccordement d'une tuile isolée

Si le joueur pose un îlot qui ne touche aucun autre îlot, le jeu trace **la route la plus courte** (recherche en largeur sur les arêtes) jusqu'au réseau existant, avec des coûts :

| Terrain traversé | Coût | Conséquence |
|---|---|---|
| Champ, prairie | 1 | Fragmente l'habitat prairie |
| Forêt | 3 | Déboise une bande : −habitat, −puits d'air |
| Rivière | 5 | Pont : cher en argent, pas de pollution |
| Zone humide, lac | interdit | Impossible : il faut contourner |

Le fantôme de pose montre le tracé de la future route en rouge avant de confirmer : poser loin de la ville **coûte visiblement** un morceau de vallée. C'est le mécanisme anti-étalement sans jamais dessiner de route.

### 4.3 Trafic

- Chaque quartier génère des trajets vers les emplois (commerce, bureaux, usine) et les commerces les plus proches ; chaque trajet suit le plus court chemin sur les arêtes.
- Le **trafic d'une arête** = nombre de trajets qui l'empruntent. Au-delà d'un seuil, l'arête vire orange puis rouge : +pollution de l'air sur les deux tuiles riveraines, −bonheur (bruit).
- Le joueur agit sans tracer : rapprocher emplois et logements, poser un **arrêt de tram** ou une **gare** (absorbe 50 % des trajets dans un rayon de 3), des **rues piétonnes** (tuile commerce « piétonne » qui n'accepte pas de trafic de transit), des pistes cyclables (bonus de service).
- Les routes **fragmentent** la faune : une arête à trafic élevé entre deux habitats coupe le corridor ; un **passage à faune** (infrastructure) le rétablit.

## 5. Les systèmes nature

Conventions : un tick = un mois de jeu (voir §6). Chaque valeur par tuile est bornée 0–100, stockée dans un tableau typé, recalculée en deux passes (émission, puis diffusion). Tout tient en sommes et moyennes locales : négligeable même à 32 × 32.

### 5.1 Air

Pollution `A` par tuile (0 = pur, 100 = irrespirable).

- **Émetteurs** par tick : centrale 20, usine 12, commerce 2, bureaux 2, quartier niv. 3 : 2, plus **0,5 × trafic** de chaque arête riveraine.
- **Puits** : forêt ancienne 6, forêt plantée mûre 5, parc 4, zone humide 3, verger 2, prairie 1, lac 1.

```
A1 = A + émetteurs − puits
A2 = 0,6·A1 + 0,4·moyenne(A1 des 4 voisins)       // diffusion
A3 = A2 + 0,15·(A1 du voisin AU VENT − A1)         // vent dominant, fixe par carte, flèche en coin d'écran
A  = clamp(0,97·A3, 0, 100)                        // dissipation
```

Effets : un quartier avec A > 40 perd du bonheur (−1 par tranche de 10), un quartier avec A > 60 perd des habitants. Alerte « Smog » si la moyenne des quartiers dépasse 60 pendant 5 ticks. **Le vent est le levier spatial principal** : une usine sous le vent de la ville est acceptable, au-dessus elle est désastreuse.

### 5.2 Eau

Trois réservoirs : la rivière `R` (par tuile, dans le sens d'écoulement), le lac `L` (une valeur par lac), la nappe `N` (moyenne locale).

- **Rejets** dans la tuile d'eau adjacente : usine 15, champ intensif 6 (3 avec haie), quartier sans station d'épuration à moins de 5 tuiles : 4, champ bio 1.
- **Dépollution** : station d'épuration −20, zone humide −8, ripisylve (forêt touchant la rivière) −4, lac −2 (sédimentation).

```
R[t] = clamp(0,8·R[amont] + rejets − dépollution, 0, 100)     // tout l'aval subit
L    = clamp(L + 0,3·Σ R[affluents] + rejets − dépollution − 2, 0, 100)
N[t] = moyenne(R et L voisins, champs intensifs voisins × 5)
```

Effets : pêche et tourisme si L < 30 ; « Algues » (lac qui verdit, −tourisme, −bonheur) si L > 60 pendant 10 ticks ; santé des quartiers touchée par la nappe au-dessus de 40.

### 5.3 Faune et biodiversité

- **Habitats** : forêt, prairie, zone humide, lac. Un remplissage regroupe les tuiles d'habitat contiguës (8 voisins) en **parcelles** ; recalculé seulement quand une tuile change.
- **Fragmentation** : une arête à trafic ≥ 3 coupe la contiguïté ; un **passage à faune** la rétablit. Une chaîne de tuiles nature (de tout type) reliant deux parcelles forme un **corridor** : les deux parcelles comptent alors comme une seule pour les seuils.
- **Biodiversité d'une tuile** : `base(habitat) × (1 + 0,1·min(taille de la parcelle, 10)) − 0,5·arêtes routières − (A + eau)/50`.

**Espèces emblématiques** (apparaissent au seuil ; disparaissent après 15 ticks à 20 % sous le seuil ; chacune ajoute +5 au score nature, du tourisme et une entrée dans le carnet) :

| Espèce | Condition | Ce qu'elle récompense |
|---|---|---|
| Cerf | parcelle forêt ≥ 6, aucune usine à moins de 2 | Garder un massif entier |
| Héron | lac L < 40 adjacent à ≥ 2 zones humides | Protéger les berges |
| Loutre | rivière R < 25 sur 5 tuiles consécutives dont 3 avec ripisylve | L'aval propre |
| Abeilles | prairie fleurie adjacente à un champ bio (+20 % de rendement bio à moins de 2) | L'agriculture douce |
| Chouette | forêt ≥ 4 sans tuile bâtie à moins de 2 (pollution lumineuse) | Les marges sombres |
| Hirondelle | quartier avec parc adjacent et A < 30 | **La ville verte elle-même** |
| Renard | corridor reliant deux parcelles ≥ 3 | Les corridors |

L'hirondelle et le renard sont importants : ce sont les espèces qui récompensent **de construire bien**, pas seulement de ne pas construire.

### 5.4 Sols et champs

Fertilité `F` par champ (0–100, départ 70).

```
intensif : rendement 1,5·F/100 ; F −= 2 ; érosion si colline voisine sans haie : F −= 2 de plus
bio      : rendement 0,9·F/100 (× 1,2 avec abeilles) ; F += 1
jachère  : rendement 0 ; F += 4
haie     : annule l'érosion, divise les rejets eau par 2, +1 biodiversité aux voisins, −10 % de rendement
```

L'intensif rapporte plus pendant une dizaine d'années puis décroche ; le bio est stable. Événement « Pluies fortes » : érosion × 3 sans haie.

### 5.5 Rétroactions nature → ville

- **Santé** = f(A, N) → dépenses de clinique, productivité des emplois.
- **Attractivité** = bonheur + nature/2 → arrivées d'habitants chaque mois.
- **Tourisme** = espèces + lac propre + forêts → recettes des commerces × (1 + tourisme/100).
- **Valeur des terrains** : +30 % près d'un parc ou d'un lac propre, −30 % sous le vent d'une usine → taxes et coût d'achat des terrains.
- **Rendement agricole** = F × pollinisation → recettes des fermes.

## 6. La boucle de jeu et l'économie

### 6.1 Trois variantes étudiées, une décision

| Variante | Pour | Contre |
|---|---|---|
| a) Pioche imposée (Dorfromantik : une tuile reçue, à poser obligatoirement, sans argent) | Zéro friction, un pouce, sessions courtes | L'écologie est subie, pas d'économie, pas de ville qui mûrit |
| **b) Catalogue libre** (city builder classique allégé : argent, catalogue, temps qui s'écoule) | Fantasme complet du city builder, maîtrise totale, profondeur, proche de Seve techniquement | Risque de menus profonds et d'attente que l'argent tombe : à contrer par la conception |
| c) Hybride (main de 3 tuiles tirées, argent pour repiocher) | Décisions courtes et fortes | Le hasard décide d'une partie de la ville |

**Décision (2026-10-04) : b), le catalogue libre, en temps réel accéléré avec pause et vitesses comme dans Seve.** On garde deux bonnes idées de l'hybride sous une autre forme : l'indication de **ce qui manque** à la ville (barres de demande dans le catalogue, au lieu d'une pioche pondérée) et le **choix annuel** (une politique municipale, au lieu d'une tuile ajoutée à la pioche).

### 6.2 Le temps

- **Temps réel accéléré** : 1 mois = 30 s réelles à vitesse 1 ; saison = 3 mois ; année = 4 saisons ; partie de carrière = 3 ans = 18 min à vitesse 1. Vitesses 0 (pause), ½, 1, 2, 4, comme Seve.
- Construire **ne suspend pas** le temps (c'est le joueur qui met en pause, d'un tap) ; les bilans et les alertes importantes mettent en pause automatiquement.
- **Chaque mois (tick)** : air, eau, faune et trafic recalculés ; recettes et dépenses encaissées ; arrivées et départs d'habitants.
- **Chaque saison** : bilan léger (bandeau) : quartiers qui évoluent, événement éventuel, effets de saison (hiver : chauffage = +énergie, −tourisme ; été : risque de canicule urbaine ; printemps : retour des espèces ; automne : récoltes).
- **Chaque année** : bilan complet, contrats, étoiles, et **une politique municipale à choisir parmi trois** (taxe verte, tram subventionné, zone 30, label bio, éco-quartier, réserve naturelle…) : c'est le choix structurant de l'année.

### 6.3 Le catalogue

- **Cinq familles** dans une barre d'onglets en bas d'écran (Habitat, Activité, Services, Infrastructures, Nature) ; un onglet ouvre une **feuille coulissante** de cartes : nom, prix, entretien, icônes d'effets, et pour les tuiles verrouillées la condition de déblocage.
- **Barres de demande** en tête du catalogue (Habitat, Activité, Services), calculées à partir de population, emplois et bonheur : c'est la boussole « ce qui manque », sans forcer la main.
- **Prix du terrain** : bâtir sur une prairie ou une friche coûte le prix de base ; sur une **nature native** s'ajoute un **défrichement** (forêt +80 $ et pénalité nature, champ +20 $ ; zone humide et lac interdits). La valeur du terrain monte de 30 % près d'un parc ou d'un lac propre et baisse de 30 % sous le vent d'une usine.
- **Outils** : Construire, Démolir (10 $ ; laisse une friche qui redevient prairie en 4 saisons ou peut être replantée), Calques, Fiche.
- **Bonus de cohérence** : une pose sans aucun malus de voisinage est remboursée de 10 %. Récompense la ville bien agencée sans punir.
- **Annuler** : pendant 10 s après une pose, remboursement intégral (tuile et rue).

### 6.4 Ressources et flux

**Quatre jauges visibles** : Argent, Population, Bonheur (0-100), Nature (0-100, détail air / eau / faune au tap).
**Dérivés, cachés** : emplois, énergie, eau potable, nourriture. Ils n'apparaissent que comme alertes et pèsent sur le Bonheur (−10 par ressource en déficit).

Départ : 500 $, une mairie déjà posée (3 énergie, 3 eau, 20 emplois), une vallée générée. Recettes par saison, encaissées par tiers chaque mois.

| Tuile | Prix | Produit | Consomme | Recette / saison |
|---|---|---|---|---|
| Quartier niv. 1 | 60 $ | 20 habitants | 1 énergie, 1 eau, 1 nourriture | 2 $/habitant = 40 $ |
| Commerce | 80 $ | 15 emplois | 1 énergie | 30 $ (× tourisme) |
| Bureaux | 120 $ | 25 emplois | 2 énergie | 50 $ |
| Usine | 150 $ | 30 emplois | 3 énergie, 1 eau | 80 $ |
| Champ | 30 $ | 4 nourriture | — | 10 $ (× fertilité) |
| Éolienne / Centrale | 90 $ / 200 $ | 4 / 15 énergie | — / air | 0 |
| Station d'épuration | 180 $ | 6 eau | 1 énergie | 0 |
| École, clinique, marché | 120 à 200 $ | services | 1 énergie | 0 |
| Parc, forêt plantée, haie, zone humide | 20 à 60 $ | nature | — | 0 (mais valeur des terrains, tourisme) |

- **Entretien croissant** : 5 $/tuile (10 $ au niveau 2, 20 $ au niveau 3) + 2 $/segment de rue, contre la boule de neige financière.
- Population > emplois × 1,2 → chômage (−10 bonheur) ; emplois > population → recettes des activités −50 %.
- Bonheur = 50 + adjacences + services − pénuries − pollution locale ; sous 30 deux saisons de suite → exode.

### 6.5 Contre l'attente (le piège du city builder en temps réel)

- Les recettes sont modestes face aux prix : la croissance vient des **évolutions** (§6.7), qui demandent des actions (services, espaces verts, air propre), pas du temps qui passe.
- **Contrats à échéance** et événements de saison rythment la partie.
- Les vitesses 2 et 4 sont à un tap ; la vitesse ½ existe pour les moments denses.
- Le bilan d'année et la politique municipale donnent un rendez-vous régulier.

### 6.6 Adjacences et synergies

`r1` = les 4 voisins par côté ; `r2` = rayon de 2 (services).

| Source | Cible | Effet |
|---|---|---|
| Usine | Quartier r1 | −15 bonheur |
| Usine, centrale | Rivière, lac, zone humide r1 | −10 eau |
| Usine | Usine r1 | +10 % production la première fois, puis rendement décroissant |
| Centrale | Tout r2 | −5 bonheur, air en hausse |
| Forêt, parc | Quartier r1 | +8 bonheur (max +16) |
| Rivière, lac propre | Quartier r1 ; champ r1 | +5 bonheur ; +25 % nourriture |
| Commerce | Bureaux r1 ; quartier r1 | +20 % recettes des deux ; +5 bonheur |
| École, clinique | Quartier r2 | +10 / +5 bonheur, conditions d'évolution |
| Marché | Champ r2 ; quartier r1 | +50 % nourriture ; +5 bonheur |
| Éolienne | Quartier r1 | −3 bonheur (bruit) |
| Zone humide | Rivière r1 | +5 eau (filtre) |
| Haie | Champ r1 | érosion annulée, rejets ÷ 2 |

### 6.7 Évolutions (vérifiées au bilan de saison)

- **Quartier niv. 1 (20 hab.) → niv. 2 (45)** : bonheur local ≥ 60, école r2, commerce r2.
- **Niv. 2 → niv. 3 (80, immeubles)** : clinique r2, parc ou forêt r1, bonheur ≥ 75, air ≥ 60.
- **Commerce niv. 2** (+50 %) : 2 quartiers r1 + bureaux r1. **Bureaux niv. 2** : commerce r1 + école r2.
- **Usine → usine propre** : station d'épuration r2 + énergie 100 % renouvelable → pollution ÷ 2.

Un quartier de niveau 3 vaut quatre quartiers de niveau 1 **sans toucher une forêt** : c'est le cœur du jeu. Risque : un motif optimal « résolu » ; contre-mesures : les cartes différentes, le vent et l'aval, l'entretien croissant, les politiques municipales.

## 7. Scores, victoire, défaite

### 7.1 Deux jauges, un produit

```
nature     = 0,3·(100 − moyenne A des quartiers) + 0,3·(100 − moyenne eau)
           + 0,25·min(100, 15·nbEspèces) + 0,15·moyenne F
prospérité = 0,4·min(100, 100·population/objectif) + 0,3·(100·emplois/population) + 0,3·bonheur
score      = nature × prospérité / 100
```

Le **produit** interdit de sacrifier un côté : 90 × 20 vaut moins que 60 × 60. C'est la règle qui rend la nature stratégiquement nécessaire, pas seulement sympathique.

### 7.2 Contre « ne rien construire »

- Objectif de population par palier (année 1 : 500 habitants ; année 5 : 3 000).
- Impôt foncier fixe sur chaque terrain possédé, construit ou non.
- Contrats régionaux à échéance (« 200 emplois industriels avant l'hiver »).
- **Faillite** si le trésor reste négatif 10 ticks.

### 7.3 Contre « tout bétonner »

- **Exode** : A > 60 ou santé < 40 → −3 % d'habitants par tick.
- **Amende régionale** si nature < 30.
- **Désastres** probabilistes et prévisibles : crue si moins de 20 % de zones humides le long de la rivière, glissement de terrain si les collines sont déboisées, canicule urbaine si un quartier n'a aucun espace vert à 2 tuiles.
- **Défaite** si nature < 15 pendant 30 ticks (« la vallée est morte »).

### 7.4 Trois arbitrages types

1. **L'usine au bord de la rivière.** Emplois immédiats et contrat rempli, mais tout l'aval se dégrade (pêche, loutre, lac). Alternatives : en amont avec une station d'épuration (chère), ou loin de l'eau avec une route plus longue, donc du trafic et de l'air pollué.
2. **Le corridor ou le lotissement.** La bande de prairie entre deux forêts est le terrain le moins cher. La bâtir scinde la parcelle (le cerf part, −5 nature, −tourisme) mais loge les 300 habitants qui manquent pour l'objectif de l'année.
3. **Intensif ou bio.** L'intensif finance la station d'épuration dès cette année ; le bio avec haies et abeilles rapporte moins mais stabilise fertilité et eau pour la décennie.

## 8. Progression et modes

### 8.1 Contrats et déblocages

- **3 contrats actifs** à la fois, tirés d'une liste par carte : « 300 habitants avec air ≥ 70 », « 4 saisons sans pénurie », « 5 quartiers de niveau 3 », « bonheur ≥ 80 avec ≤ 40 % de la carte bâtie », « faire revenir le héron ».
- Récompense : argent + une entrée du catalogue débloquée, dans l'ordre : quartier, commerce, champ, éolienne, école → bureaux, parc, marché → usine, station d'épuration, clinique → tram, usine propre, passage à faune, réserve naturelle.

### 8.2 Cartes (scénarios)

| Carte | Difficulté | Ce qui change |
|---|---|---|
| Plaine agricole | Facile | Pas de rivière : l'eau potable est rare, les champs sont partout |
| Vallée fluviale | Normale | Ponts, zones humides fragiles, aval à protéger |
| Côte | Normale | Terrain réduit, éoliennes × 1,5, tourisme fort si l'eau est propre |
| Montagne | Difficile | Prairies étroites, forêt dense, routes chères, glissements de terrain |

### 8.3 Victoire, étoiles, défaite

- **Fin de partie** : à la fin de l'année N fixée par la carte (3 ans par défaut), ou quand le dernier contrat est rempli.
- **Score** = nature × prospérité / 100 (§7.1). **Étoiles** : ★ nature ≥ 40 et prospérité ≥ 40 ; ★★ les deux ≥ 55 ; ★★★ les deux ≥ 70 **et au moins 50 % de la carte bâtie** (pour que « laisser la forêt » ne suffise pas).
- **Défaite** : faillite (trésor < −200 $ deux saisons), exode (population < 50 % de son pic trois saisons), vallée morte (nature < 15 pendant 30 mois).

### 8.4 Modes

- **Carrière** : cartes successives, déblocages persistants, **carnet des espèces** (chaque espèce observée est illustrée, comme un herbier).
- **Bac à sable** : tout débloqué, grande carte, argent illimité en option, pas de défaite (le plaisir « Townscaper »).
- **Défi du jour** : graine partagée (même vallée, mêmes événements, mêmes contrats), 2 ans, classement local du score.

## 9. UX téléphone (portrait, référence 412 × 915)

- **Haut (72 px)** : 4 jauges (Population, Bonheur, Nature, Argent), la date (saison, année) et le bouton pause / vitesse, comme le HUD de Seve. Tap sur Nature → trois pastilles air / eau / faune, chacune active un **calque** coloré semi-transparent (air : gris → brun ; eau : bleu → vert sale ; faune : parcelles contourées, corridors en pointillé, icônes d'espèces). Couleur + hachures pour le daltonisme.
- **Centre** : la carte en 3D (canvas WebGL), défilement au doigt, pincer pour zoomer en continu, double tap pour revenir au cadrage par défaut. **Flèche du vent** dans un coin. Tout ce qui est texte ou bouton est en HTML par-dessus le canvas, jamais dessiné dedans.
- **Bas** : une **barre d'onglets** (≥ 56 px) : Habitat, Activité, Services, Infrastructures, Nature, plus Démolir et Calques. Un onglet ouvre une **feuille coulissante** (comme les feuilles de Seve) avec les cartes du catalogue (≥ 64 px : nom, prix, icônes d'effets, cadenas et condition si verrouillée) et les barres de demande. La feuille se ferme en glissant vers le bas.
- **Pose en deux temps** : tap sur une carte → la feuille se replie, la tuile est « en main » ; tap sur une case (le doigt est déprojeté sur le plan du sol : fonction pure, testable) → **fantôme** translucide vert (ok), rouge (interdit), jaune (pont ou défrichement) ; rue future en pointillés ; icônes d'effet sur les voisins (−15 ☹, nuage vers la rivière, cerf qui part) ; deltas des jauges (−60 $, +40 $/saison, −3 nature). Tap à nouveau ou ✓ → confirmation, petite vibration. Tap ailleurs → le fantôme se déplace. La tuile reste en main pour en poser plusieurs à la suite ; retour arrière ou tap sur l'onglet pour la lâcher.
- **Appui long** sur une tuile posée : fiche (niveau, conditions d'évolution manquantes en rouge, espèces voisines, bouton Démolir).
- **Pas de rotation** de tuile ni de caméra au départ : bâtiments orientés automatiquement vers la rue la plus proche, rivières et rues automatiques.
- **Annuler** : bandeau « Annuler » pendant 10 s après une pose (remboursement intégral).
- **Alertes** en bandeau coulissant, une à la fois (Smog, Algues, Retour d'une espèce, Prime), avec un bouton « Voir » qui centre la carte et active le bon calque.
- Cibles ≥ 48 px, tout l'actionnable dans la moitié basse (jeu à une main), `100dvh`, safe-area, message « Tournez votre téléphone » en paysage.

## 10. Ce que l'on reprend de Seve

Tiletown aura son propre dépôt, mais Seve fournit une base **technique** éprouvée sur téléphone. **Aucune ressource graphique ou sonore de Seve n'est reprise** (décision du 2026-10-04) : les modèles, musiques, sons et polices de Tiletown sont choisis de zéro, voir `docs/ASSETS.md`. Le rendu change aussi : Seve dessine des sprites en Canvas 2D, Tiletown affiche une scène 3D en WebGL (three.js) ; le moteur de rendu est donc nouveau, le reste se reprend.

- **Tels quels** : `rng.js` (aléatoire à graine : indispensable pour le défi du jour), `events.js`, `dom.js`, `version.js`, `synth.js` (technique de synthèse sonore, à reparamétrer), `pwa.js`, `loader.js`, `sw.js`, `tools/build.js` (renommer les préfixes ; ajouter three.js au paquet).
- **À adapter** : `gestures.js` (toucher bref, appui long, glisser, pincer : la sortie devient une caméra 3D au lieu d'un décalage de sprites), `zoom.js`, `sheets.js`, `tabbar.js`, `toasts.js`, `a11y.js`, `storage.js` (sauvegarde avec migrations), `audio.js`, `calendar.js` (saisons), `progression.js` et `contest.js` (étoiles, épreuves), le schéma de `levels.js`, le principe d'adjacence des lots de la carrière, `css/style.css` (safe-area, `--app-h`), les tests `touch-targets.test.js` et `helpers.js`.
- **Nouveau** : `src/render3d/` (scène three.js : `BatchedMesh` ou `InstancedMesh` par kit, caméra orthographique, ombres, calques par couleurs d'instances, acteurs animés), `tools/import-models.js` (normalisation des GLB : échelle, palette, meshopt), `tools/sprites-proto/` (plan B).
- **Hors sujet** : toute la logique ferme (`game.js`, `farm.js`, `economy.js`, `market.js`, la carrière, le tuteur Joseph, les cultures), le rendu Canvas 2D (`scene.js`, `atlas.js`, `layout-*.js`).
- **Conventions à garder** : logique pure dans `src/core` et `src/data` testée sous Node ; code en français, identifiants en anglais ; `node --test tests/` ; build en deux fichiers à empreinte ; `index.html` jamais modifié à la main ; `dist/` committé et publié sur GitHub Pages.

## 11. Pièges identifiés et parades

1. **L'optimum devient « ne rien construire »** → score produit, objectifs de population, impôt foncier, 50 % de bâti pour 3★.
2. **Surcharge d'indicateurs** → 4 jauges, détail au tap, calques un à la fois.
3. **Effets de zone illisibles** → rayons fixes (1 ou 2), fantôme avant pose, jamais de courbe de propagation à lire.
4. **Pollution persistante punitive** (Cities Skylines) → remèdes toujours disponibles (station, zone humide, temps), défaite seulement après 30 mois.
5. **Routes automatiques qui vident la décision** → le vent, l'aval, l'adjacence et le coût du raccordement portent la décision spatiale.
6. **Attendre que l'argent tombe** (dérive « idle » du temps réel) → recettes modestes, croissance par évolutions, contrats à échéance, vitesses à un tap.
7. **Argent en boule de neige** → entretien par niveau.
8. **Motif de quartier niveau 3 unique** → cartes différentes, vent et aval, rendements décroissants entre doublons, politiques municipales.
9. **Trafic illisible** → n'afficher que les arêtes saturées (orange, rouge).

## 12. Décisions prises et questions ouvertes

Décisions prises le 2026-10-04 :

1. **Grille carrée** (un îlot = une unité 3D, rues automatiques sur les arêtes).
2. **Catalogue libre** : argent, catalogue par familles, barres de demande, politique municipale annuelle (la main de 3 tuiles a été écartée).
3. **Temps réel accéléré** avec pause et vitesses 0, ½, 1, 2, 4, comme Seve ; 1 mois = 30 s à vitesse 1.
4. **Partie de carrière = 3 ans** (18 min à vitesse 1, en plusieurs sessions).
5. **Ton cosy et bienveillant** : alertes douces, remèdes toujours possibles, défaite rare et expliquée.
6. **Vallée animée** dès le prototype : habitants, animaux, véhicules sur les rues chargées.
7. **Dépôt public, ressources libres** (CC0, CC BY, OFL) ; un achat reste possible s'il est sous une de ces licences et peu cher ; toute ressource payante meilleure est signalée à l'utilisateur avant achat.
8. **Ressources choisies de zéro** : rien n'est repris des graphismes ni des sons de Seve (étude `docs/ASSETS.md`).
9. **Rendu lisse, pas de pixel art** : direction **3D basse définition (low poly)** à partir de kits libres (Kenney City Kits, Nature Kit, Train Kit, Mini Characters ; Quaternius ; KayKit ; Gobkit), palette commune de 24 teintes, interface vectorielle (Nunito, Baloo 2, Tabler, Lucide).
10. **Rendu 3D temps réel avec three.js** (WebGL2) pour la carte, interface en DOM par-dessus ; sprites pré-rendus en plan B.
11. **Aucun achat** : toutes les ressources sont CC0 ou CC BY ; **un seul dépôt public** `Madec01/Tiletown`, `dist/` committé, publié sur GitHub Pages comme Seve.
12. **Faune manquante** (héron, loutre, hirondelle, cycliste, chouette en vol) modélisée en interne d'abord ; commande seulement si le résultat déçoit.

Questions encore ouvertes :

- Liste exhaustive des tuiles avec leurs valeurs définitives (équilibrage par simulation, comme `tools/simulate.js` dans Seve).
- Détail des 4 cartes, des espèces et des contrats ; maquettes d'écran.
- Création du dépôt `Madec01/Tiletown` par l'utilisateur, puis prototype de rendu en trois étapes (carte statique, vallée animée, intégration PWA) avec critères chiffrés (§3 de `docs/ASSETS.md`).

## Annexe : inspirations par jeu

- **Dorfromantik** : pioche finie comme horloge, quêtes de groupe, pose parfaite récompensée.
- **Islanders** : aperçu du score sous le doigt, malus de voisinage.
- **Terra Nil** : bâtiments de restauration qui transforment une tuile, biodiversité comme objectif.
- **Mini Motorways** : pression par paliers, embouteillages colorés, dépouillement visuel.
- **Townscaper** : raccords automatiques jolis, mode bac à sable.
- **Concrete Jungle** : main au choix, usines = malus local, deck-building entre années.
- **Pocket City** : 3-4 jauges maximum, quêtes tutoriel.
- **Against the Storm** : hostilité indexée sur l'empreinte, double jauge, parties courtes.
- **Timberborn** : rivière orientée, l'aval subit.
- **Anno 2070 / Cities Skylines** : écobilan unique avec bonus positif, vent dominant, eaux usées en aval.
- **Carcassonne** : adjacence, zones fermées.
- **Six Sided Streets** : rendements décroissants entre doublons voisins.

## 13. Parcours livré avec la refonte du 2026-10-05

Cette première aventure utilise un **objectif actif à la fois**, dans un carnet de huit étapes : quartier supplémentaire, commerce supplémentaire, éolienne, école, deux forêts, château d’eau, 150 habitants, puis bonheur ≥ 65 avec nature ≥ 70. Les récompenses vont de 100 à 300 $ et se réclament explicitement. Leur état est sauvegardé ; une prime ne peut être réclamée deux fois.

La carrière commence avec **la mairie seule**. Cinq vallées se débloquent successivement avec au moins une étoile : première vallée (120 habitants, nature 70), rivière (180 habitants, nature 75, eau saine 75), bocage (180 habitants, nature 80, trois champs cultivés), coteaux (250 habitants, nature 75), grande vallée (350 habitants, nature 75). Les graines, dimensions, budgets et nouveaux bâtiments sont centralisés dans `src/data/levels.js`.

À 36 mois, le temps s’arrête sur un bilan. La première étoile exige tous les objectifs de la vallée ; la deuxième ajoute une nature d’au moins 80 ; la troisième ajoute un objectif supérieur de population, un bonheur d’au moins 65 et l’absence d’exode. Les deux étoiles supplémentaires exigent aussi la réussite des objectifs principaux. Le meilleur résultat et les bâtiments débloqués sont conservés lors des changements de vallée. La carte des vallées est accessible depuis le carnet, les réglages et le bilan.

Le score indicatif reste `nature × prospérité / 100`, avec `prospérité = 0,6 × min(100, population / 3) + 0,4 × bonheur`. Les anciennes parties sans carrière utilisent les seuils conjoints de nature et prospérité 40, 55 et 70. La condition initialement envisagée de 50 % de terrain bâti n’est pas appliquée. Le résultat est figé ; « Continuer ma vallée » passe en mode libre.

Le **mode libre** ouvre toutes les constructions avec un budget de 100 000 $ et sans bilan forcé à trois ans. L’économie et les besoins des habitants continuent de fonctionner. Il ne promet pas un budget infini.
