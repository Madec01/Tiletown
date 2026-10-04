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
