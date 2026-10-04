# Prototype de pré-rendu de sprites (plan B)

Preuve de faisabilité réalisée le 2026-10-04 dans l'environnement de développement : une scène three.js (caméra orthographique 3/4, lumière avec ombre, fond transparent) est rendue par Chromium sans écran (Playwright, SwiftShader) en PNG lisse, 8 directions, en 0,6 s pour un îlot 512 × 512.

- `scene.js` : scène de test (formes simples : maison, arbre, pelouse).
- `render.mjs` : lance Chromium, rend et enregistre les PNG.
- `ilot-2x.png` : image témoin.
- `package.json` : dépendances (three, esbuild, playwright).

Ce pipeline est le **plan B** du rendu : si la 3D temps réel ne tient pas sur les téléphones bas de gamme, les mêmes modèles GLB sont pré-rendus en feuilles de sprites et affichés en Canvas 2D (moteur de Seve). Voir `docs/ASSETS.md` §3.
