# Cahier des charges — version téléphone (prioritaire)

Décision héritée de « Une année à la ferme » et confirmée pour Tiletown : **le jeu est d'abord un jeu de téléphone**, tenu en **portrait**, testé sur **Android + Chrome**, **installable** (application web / PWA, plein écran, hors ligne). Le PC reste supporté, mais toute décision se prend d'abord pour le téléphone.

## Appareil de référence

- Écran de référence : **412 × 915 CSS px, DPR 2,625** (Pixel 7, Chrome Android). Doit aussi marcher de **360 × 740** (petit Android) à **430 × 932**, et en fenêtre PC.
- Barre d'adresse Chrome qui apparaît/disparaît : utiliser `100dvh` / `visualViewport`, jamais `100vh` seul.
- Encoches et barre de gestes : `viewport-fit=cover` + `env(safe-area-inset-*)`.
- En paysage sur téléphone : message « Tournez votre téléphone ».

## Règles d'ergonomie tactile (non négociables)

- **Cible tactile ≥ 48 × 48 CSS px** pour tout ce qui se touche (boutons, onglets, cartes du catalogue, tuiles au zoom de jeu).
- **Texte ≥ 14 CSS px** (corps), 12 px minimum pour les mentions secondaires ; chiffres importants (argent, jauges) ≥ 18 px.
- Zones d'action principales **dans la moitié basse de l'écran** (jeu à une main).
- Aucune information accessible **seulement au survol** : tout ce qui serait en infobulle se trouve en touchant (fiche en bas d'écran) ou en appui long.
- Pas de zoom involontaire : `touch-action` adapté, `user-scalable=no` dans l'application installée, `overscroll-behavior: none`, pas de sélection de texte ni de menu contextuel sur appui long dans le jeu.
- Réponse immédiate au toucher (pas de délai de 300 ms, retour visuel `:active`, petite vibration optionnelle `navigator.vibrate(10)` réglable).
- Un geste = une intention : toucher bref = sélectionner / poser ; glisser = faire défiler la carte ; pincer = zoomer en continu (rendu 3D lisse à toute échelle) ; double toucher dans le vide = cadrage par défaut ; appui long = fiche d'une tuile.
- **Pose en deux temps** : premier toucher = fantôme avec aperçu des effets, second toucher ou bouton ✓ = confirmation. Jamais de pose sur un seul toucher.

## Disposition en portrait

```
┌───────────────────────────┐  ← safe-area haut
│ 4 jauges · saison/année   │  Population · Bonheur · Nature · Argent · pause / vitesse
├───────────────────────────┤
│                           │
│   carte 3D (défilement,   │  flèche du vent dans un coin,
│   zoom continu)           │  calques air / eau / faune
│                           │
├───────────────────────────┤
│ feuille coulissante :     │  cartes du catalogue ≥ 64 px, barres de demande
│ Habitat Activ. Serv. ...  │  barre d'onglets ≥ 56 px + Démolir + Calques
└───────────────────────────┘  ← safe-area bas
```

## Rendu 3D sur téléphone

- Scène three.js en WebGL2 ; pixel ratio plafonné à 2 ; antialiasing MSAA 4× ; une seule lumière avec ombre ; ≤ 60 appels de dessin ; 60 i/s en interaction, 30 i/s au repos et pause quand l'onglet est caché (batterie).
- Détection de WebGL2 au lancement ; message clair si absent (≈ 1 % des Android), plan B sprites si la part des joueurs le justifie.
- Perte de contexte WebGL (onglet en arrière-plan) : pause puis restauration automatique, testée.
- Tout texte et tout bouton en HTML par-dessus le canvas : net, accessible, zoomable par le système.

## Lisibilité

- Quatre jauges au plus à l'écran ; le détail (air, eau, faune, emplois, énergie, eau potable, nourriture) se lit au toucher.
- Un seul calque actif à la fois ; couleur + hachures pour le daltonisme.
- Alertes en bandeau coulissant, une à la fois, avec un bouton « Voir » qui centre la carte.
- Le trafic ne s'affiche que sur les rues saturées (orange, rouge).

## Tests

- Un test Node mesure les cibles tactiles (≥ 48 px) sur l'écran de référence et sur 360 × 740, comme `tests/touch-targets.test.js` dans Seve.

## Mise à jour de l’interface — 2026-10-05

Le bandeau de marque et les quatre jauges occupent désormais au plus 190 px, hors encoche, avec un carnet d’objectif séparé. Les cinq familles restent en bas ; Démolir et Calques sont deux boutons flottants. Les raccourcis illustrés (quartier, commerce, forêt) se masquent pendant une pose ou l’ouverture d’un panneau. Les panneaux restent sous les jauges, avec défilement interne.

Le mode libre abrège les grands budgets (`100 k$`) tout en conservant le montant exact dans le libellé accessible. Toutes les commandes mesurées font au moins 48 × 48 px. La souris dispose aussi de boutons de zoom ; le double toucher et le pincement restent disponibles sur téléphone. Le réglage « Animations réduites » suspend les mouvements visuels de la scène sans suspendre l’économie.

Parcours reproductible : démarrer `python3 -m http.server 8000`, puis lancer `npm run review:mobile`. Les captures et le rapport sont écrits dans `artifacts/review/`, non committé. Le test simule le tactile Chromium, pas un appareil Android réel.
