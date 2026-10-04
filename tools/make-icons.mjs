#!/usr/bin/env node
// Génère les icônes de l'application (PWA, favicon, Apple) à partir d'un SVG dessiné ici même :
// une tuile d'herbe arrondie, une maison stylisée (murs crème, toit rouge) et un arbre, dans les
// couleurs de la palette commune (src/data/palette.js). Aucun fichier venant d'ailleurs.
//
//   node tools/make-icons.mjs          écrit assets/icons/*.png (Playwright + Chromium déjà installés)
//
// Fichiers produits :
//   icon-192.png, icon-512.png              purpose « any » : tuile arrondie sur fond transparent
//   icon-maskable-192.png, -512.png          purpose « maskable » : fond plein (la zone sûre = 80 % du centre)
//   icon-monochrome-512.png                  purpose « monochrome » : silhouette blanche sur transparent
//   apple-touch-icon.png (180)               fond plein, coins droits (iOS les arrondit)
//   favicon-32.png                           onglet du navigateur
// Les PNG sont déterministes à SVG égal (même Chromium) : relancer le script ne change rien si le dessin
// n'a pas changé.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PALETTE } from '../src/data/palette.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'icons');
const P = PALETTE;

/**
 * Le dessin, en 100 × 100. `mode` : 'any' (tuile arrondie, fond transparent), 'maskable' / 'opaque'
 * (fond plein, contenu dans la zone sûre), 'mono' (silhouette blanche).
 */
function svg(mode) {
  const mono = mode === 'mono';
  const full = mode === 'maskable' || mode === 'opaque';
  const c = (hex) => (mono ? '#ffffff' : hex);
  // Zone sûre des icônes maskable : cercle de 80 % ; on réduit le dessin à 76 % et on le centre.
  const k = full ? 0.76 : 1;
  const off = (100 - 100 * k) / 2;
  const bg = full ? `<rect x="0" y="0" width="100" height="100" fill="${c(P.grass)}"/>` : '';
  const tile = mono
    ? ''
    : `<rect x="4" y="4" width="92" height="92" rx="22" fill="${P.grass}"/>
       <rect x="4" y="4" width="92" height="88" rx="22" fill="${P.grassLight}" opacity="0.55"/>
       <path d="M4 60 Q 40 48 96 62 L96 74 Q 60 64 4 76 Z" fill="${P.grass}" opacity="0.9"/>`;
  const path = mono ? '' : `<path d="M30 96 L46 66 L58 66 L50 96 Z" fill="${P.soil}" opacity="0.9"/>`;
  const house = `
    <rect x="34" y="46" width="34" height="30" rx="2" fill="${c(P.wallCream)}"/>
    <path d="M28 48 L51 26 L74 48 Z" fill="${c(P.roofRed)}"/>
    <rect x="60" y="30" width="6" height="12" fill="${c(P.wallBeige)}"/>
    ${mono ? '' : `<rect x="47" y="60" width="9" height="16" rx="1" fill="${P.wood}"/>
    <rect x="38" y="54" width="7" height="7" rx="1" fill="${P.river}"/>
    <rect x="58" y="54" width="7" height="7" rx="1" fill="${P.river}"/>`}`;
  const tree = `
    <rect x="76" y="62" width="5" height="12" fill="${c(P.wood)}"/>
    <circle cx="78.5" cy="56" r="10" fill="${c(P.forestDark)}"/>
    <circle cx="73" cy="60" r="6.5" fill="${c(P.forestDark)}"/>
    <circle cx="84" cy="60" r="6.5" fill="${c(P.forestDark)}"/>`;
  const bush = mono ? '' : `<circle cx="22" cy="70" r="6" fill="${P.forestDark}"/><circle cx="17" cy="73" r="4.5" fill="${P.forestDark}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    ${bg}
    <g transform="translate(${off} ${off}) scale(${k})">
      ${tile}${path}${house}${tree}${bush}
    </g>
  </svg>`;
}

const JOBS = [
  ['icon-192.png', 192, 'any'],
  ['icon-512.png', 512, 'any'],
  ['icon-maskable-192.png', 192, 'maskable'],
  ['icon-maskable-512.png', 512, 'maskable'],
  ['icon-monochrome-512.png', 512, 'mono'],
  ['apple-touch-icon.png', 180, 'opaque'],
  ['favicon-32.png', 32, 'any'],
];

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
    for (const [name, size, mode] of JOBS) {
      await page.setViewportSize({ width: size, height: size });
      const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent;overflow:hidden}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${svg(mode)}</body></html>`;
      await page.setContent(html);
      const png = await page.screenshot({ type: 'png', omitBackground: mode === 'any' || mode === 'mono', clip: { x: 0, y: 0, width: size, height: size } });
      writeFileSync(join(OUT, name), png);
      console.log(`  écrit   assets/icons/${name} (${size} px, ${mode}, ${(png.length / 1024).toFixed(1)} Ko)`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
