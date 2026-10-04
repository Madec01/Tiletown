# Tiletown

City builder cosy en tuiles, en **3D basse définition au rendu lisse** (three.js, WebGL2), jouable dans le navigateur (HTML + JavaScript en modules ES, sans autre framework).
Le but : construire la ville la plus prospère possible **en respectant au maximum la nature** (air, eau, faune). Chaque tuile posée a une spécialité (quartier, commerce, bureaux, usine, bâtiment spécial) ou est un morceau de nature ; les rues se tracent automatiquement sur les arêtes entre les îlots.

Projet frère de « Une année à la ferme » (dépôt `Madec01/Seve`), dont il reprend le cadre de travail et une partie de la base technique (voir `docs/GAME_DESIGN.md` §10).

## Règles de travail

@.claude/REGLES.md

Un hook `UserPromptSubmit` (dans `.claude/settings.json`) réinjecte ces règles à chaque message.

## Priorité : le téléphone

Le jeu se joue **d'abord sur téléphone, en portrait** (Android + Chrome), installable comme une application (PWA). Voir `docs/MOBILE.md` : toute décision se prend d'abord pour le téléphone.

## Documents de référence

- `docs/GAME_DESIGN.md` : conception du jeu (tuiles, rues automatiques, systèmes nature, boucle, économie, progression, UX). **Source de vérité du gameplay.**
- `docs/MOBILE.md` : cahier des charges de la version téléphone (prioritaire).
- `docs/ASSETS.md` : inventaire des ressources (héritées de Seve, à trouver, à acheter) et règles de licence.
- `JOURNAL.md` : journal des modifications, idées et bugs (à mettre à jour à chaque travail).
- `CREDITS.md` : origine et licence de chaque ressource (à créer avec la première ressource ajoutée).

## Décisions prises (2026-10-04)

- Grille **carrée**, un îlot = une unité 3D, caméra orthographique inclinée fixe, zoom continu.
- **Catalogue libre** : argent, catalogue par familles (Habitat, Activité, Services, Infrastructures, Nature), barres de demande, une politique municipale à choisir chaque année.
- **Temps réel accéléré** avec pause et vitesses 0, ½, 1, 2, 4 (comme Seve) ; 1 mois = 30 s à vitesse 1.
- Partie de carrière = **3 ans** (18 min à vitesse 1, en plusieurs sessions).
- Ton **cosy et bienveillant**.
- Vallée **animée** (habitants, animaux, véhicules) dès le prototype.
- **Rendu lisse, pas de pixel art** : modèles 3D low poly **libres** (Kenney City Kits, Nature Kit, Train Kit, Mini Characters, Quaternius, KayKit, Gobkit), palette commune de 24 teintes ; **three.js** pour la carte, interface en DOM par-dessus ; sprites pré-rendus en plan B (`tools/sprites-proto/`).
- **Aucune ressource de Seve reprise** ; **aucun achat** : tout est CC0 / CC BY / OFL / MIT, listé dans `CREDITS.md`. Voir `docs/ASSETS.md`.
- **Un seul dépôt public**, `dist/` committé, publication sur **GitHub Pages** comme Seve.
- Faune introuvable en libre (héron, loutre, hirondelle, cycliste, chouette en vol) : **modélisée en interne** d'abord.

## Commandes (à mettre en place avec le premier code)

- Lancer le jeu : `python3 -m http.server 8000`, puis ouvrir http://localhost:8000
- Tests de la logique : `node --test tests/`
- Construire la version publiée : `node tools/build.js` (à reprendre de Seve, three.js inclus dans le paquet), **à lancer avant chaque commit** qui touche le jeu ; `dist/`, `index.html`, `dev.html` et `sw.js` sont committés comme dans Seve.
- Importer et normaliser les modèles : `node tools/import-models.js` (échelle « 1 tuile = 1 unité », palette de 24 teintes, compression meshopt) — à écrire avec le prototype.

## Conventions

- Code, commentaires et textes du jeu en français ; noms de variables et fonctions en anglais.
- La logique (`src/core`, `src/data`) est pure : aucun accès au DOM, testable sous Node.
- Ne jamais modifier `index.html` ni `dist/` à la main (page dans `src/index.template.html`, chargeur dans `src/loader.js`), comme dans Seve.
- Seules des ressources sous licence libre compatible avec un dépôt public (CC0, CC BY, OFL, MIT, Apache) sont ajoutées, et chacune est listée dans `CREDITS.md` avec son auteur, son lien et sa licence. Jamais de CC BY-SA, de CC BY-ND, de NC, ni de contenu généré par IA.
- Tout texte et tout bouton en HTML/CSS par-dessus le canvas 3D ; la scène ne contient jamais de texte.
