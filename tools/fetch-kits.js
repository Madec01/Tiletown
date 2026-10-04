#!/usr/bin/env node
// Télécharge les kits 3D libres (Kenney, CC0) dans `assets/models/raw/<kit>/` (dossier ignoré par
// git) et les dézippe. Chaque kit est lu depuis sa page https://kenney.nl/assets/<slug> pour trouver
// le lien « Download » du zip (de la forme /media/pages/assets/<slug>/<empreinte>/kenney_<slug>.zip),
// car l'empreinte change à chaque mise à jour du kit.
//
// Usage :
//   node tools/fetch-kits.js                 télécharge les kits manquants
//   node tools/fetch-kits.js --force         retélécharge tout
//   node tools/fetch-kits.js --from <dir>    copie d'abord les zips déjà présents dans <dir>
//                                            (nommés <slug>.zip ou kenney_<slug>*.zip)
//   node tools/fetch-kits.js car-kit nature-kit    seulement ces kits
//
// Un échec de téléchargement n'arrête pas le script : il est signalé dans le résumé final et le
// code de sortie vaut 1.

import { createWriteStream, existsSync, mkdirSync, readdirSync, copyFileSync, writeFileSync, statSync, rmSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW_DIR = join(ROOT, 'assets', 'models', 'raw');

/** Kits retenus (docs/ASSETS.md §6). La clé est le slug de la page kenney.nl. */
export const KITS = Object.freeze({
  'city-kit-roads':      { name: 'City Kit Roads',      author: 'Kenney' },
  'city-kit-suburban':   { name: 'City Kit Suburban',   author: 'Kenney' },
  'city-kit-commercial': { name: 'City Kit Commercial', author: 'Kenney' },
  'city-kit-industrial': { name: 'City Kit Industrial', author: 'Kenney' },
  'nature-kit':          { name: 'Nature Kit',          author: 'Kenney' },
  'train-kit':           { name: 'Train Kit',           author: 'Kenney' },
  'car-kit':             { name: 'Car Kit',             author: 'Kenney' },
  'fantasy-town-kit':    { name: 'Fantasy Town Kit',    author: 'Kenney' },
  'modular-buildings':   { name: 'Modular Buildings',   author: 'Kenney' },
  'mini-characters':     { name: 'Mini Characters',     author: 'Kenney' },
});

export function kitPageUrl(slug) { return `https://kenney.nl/assets/${slug}`; }
export function kitDir(slug) { return join(RAW_DIR, slug); }

/** Trouve l'URL du zip dans le HTML de la page du kit. */
export function findZipUrl(html, slug) {
  const re = new RegExp(`(?:https?://kenney\\.nl)?/media/pages/assets/${slug}/[A-Za-z0-9-]+/[^"'\\s]+\\.zip`, 'g');
  const found = html.match(re);
  if (!found) return null;
  const url = found[0];
  return url.startsWith('http') ? url : `https://kenney.nl${url}`;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'tiletown-fetch-kits (Node)' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${url}`);
  return res.text();
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'tiletown-fetch-kits (Node)' }, redirect: 'follow' });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status} pour ${url}`);
  mkdirSync(dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  const size = statSync(dest).size;
  if (size < 10_000) throw new Error(`fichier trop petit (${size} o) : ${url}`);
  return size;
}

/** Dézippe le kit dans son dossier et renvoie la liste des GLB trouvés. */
function extractKit(zipPath, slug) {
  const dir = kitDir(slug);
  const zip = new AdmZip(zipPath);
  // On ne garde que ce qui sert : GLB, textures, licence, aperçus. Les FBX/OBJ/DAE sont ignorés.
  const kept = [];
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const name = entry.entryName;
    const useful = /^Models\/GLB format\//i.test(name) || /^License\.txt$/i.test(name)
      || /^Preview\.png$/i.test(name) || /^Previews\//i.test(name) || /^Textures\//i.test(name)
      || /Sample\.png$/i.test(name) || /\.glb$/i.test(name);
    if (!useful) continue;
    const out = join(dir, name);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, entry.getData());
    kept.push(name);
  }
  const glbs = kept.filter((n) => /\.glb$/i.test(n));
  return { glbs, kept };
}

/** Cherche un zip déjà téléchargé pour ce kit dans un dossier local. */
function findLocalZip(dir, slug) {
  if (!dir || !existsSync(dir)) return null;
  const names = readdirSync(dir).filter((n) => n.endsWith('.zip'));
  const exact = names.find((n) => n === `${slug}.zip`);
  if (exact) return join(dir, exact);
  const prefixed = names.find((n) => n.startsWith(`kenney_${slug}`));
  return prefixed ? join(dir, prefixed) : null;
}

function isKitPresent(slug) {
  const dir = join(kitDir(slug), 'Models', 'GLB format');
  return existsSync(dir) && readdirSync(dir).some((n) => n.endsWith('.glb'));
}

export async function fetchKit(slug, { force = false, from = null, log = console.log } = {}) {
  const info = KITS[slug];
  if (!info) throw new Error(`kit inconnu : ${slug}`);
  if (!force && isKitPresent(slug)) {
    const n = readdirSync(join(kitDir(slug), 'Models', 'GLB format')).filter((f) => f.endsWith('.glb')).length;
    log(`  ${slug} : déjà présent (${n} GLB), ignoré`);
    return { slug, ok: true, skipped: true, glbCount: n };
  }
  const zipPath = join(RAW_DIR, `${slug}.zip`);
  let source = 'téléchargement';
  const local = findLocalZip(from, slug);
  if (local) {
    mkdirSync(RAW_DIR, { recursive: true });
    copyFileSync(local, zipPath);
    source = `copie de ${local}`;
  } else if (force || !existsSync(zipPath)) {
    const html = await fetchText(kitPageUrl(slug));
    const url = findZipUrl(html, slug);
    if (!url) throw new Error(`lien de téléchargement introuvable sur ${kitPageUrl(slug)}`);
    log(`  ${slug} : ${url}`);
    const size = await downloadFile(url, zipPath);
    source = `${url} (${(size / 1e6).toFixed(1)} Mo)`;
  } else {
    source = `zip déjà en cache ${zipPath}`;
  }
  if (existsSync(kitDir(slug))) rmSync(kitDir(slug), { recursive: true, force: true });
  const { glbs } = extractKit(zipPath, slug);
  if (glbs.length === 0) throw new Error(`aucun GLB dans ${zipPath}`);
  writeFileSync(join(kitDir(slug), 'SOURCE.txt'), `${info.name} (${info.author})\n${kitPageUrl(slug)}\n${source}\n${new Date().toISOString()}\n`);
  log(`  ${slug} : ${glbs.length} GLB extraits (${source.split(' (')[0].slice(0, 70)})`);
  return { slug, ok: true, skipped: false, glbCount: glbs.length };
}

async function main(argv) {
  const args = argv.slice(2);
  const force = args.includes('--force');
  const fromIdx = args.indexOf('--from');
  const from = fromIdx >= 0 ? resolve(args[fromIdx + 1]) : null;
  const wanted = args.filter((a, i) => !a.startsWith('--') && !(fromIdx >= 0 && i === fromIdx + 1));
  const slugs = wanted.length ? wanted : Object.keys(KITS);
  mkdirSync(RAW_DIR, { recursive: true });
  console.log(`Kits → ${RAW_DIR}`);
  const results = [];
  for (const slug of slugs) {
    try {
      results.push(await fetchKit(slug, { force, from }));
    } catch (e) {
      console.error(`  ${slug} : ÉCHEC — ${e.message}`);
      results.push({ slug, ok: false, error: e.message });
    }
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} kits disponibles.`);
  if (failed.length) {
    console.log(`Échecs : ${failed.map((f) => f.slug).join(', ')} (relancer plus tard ou déposer le zip dans ${RAW_DIR}).`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main(process.argv);
}

// Lecture utilitaire du texte de licence d'un kit (pour CREDITS / LICENSE-kenney.txt).
export async function readKitLicense(slug) {
  const p = join(kitDir(slug), 'License.txt');
  return existsSync(p) ? readFile(p, 'utf8') : null;
}
