#!/usr/bin/env node
// Télécharge les kits 3D libres (CC0) dans `assets/models/raw/<kit>/` (dossier ignoré par git) et les
// dézippe. Trois sources :
//   - `kenney` : la page https://kenney.nl/assets/<slug> donne le lien « Download » du zip (de la forme
//     /media/pages/assets/<slug>/<empreinte>/kenney_<slug>.zip ; l'empreinte change à chaque mise à jour) ;
//   - `itch` : page itch.io « Name your own price » (Gobkit) : on suit le parcours « Download Now » →
//     « No thanks » (POST /download_url avec le jeton CSRF de la page, cookie itchio_token), puis
//     POST /file/<upload> qui renvoie l'adresse du zip ;
//   - `files` : liste de fichiers à adresses directes avec miroirs (Quaternius : le dossier Google Drive
//     officiel dépasse souvent son quota ; des copies à l'octet identique du même glTF existent sur GitHub).
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

/** Un fichier Quaternius : dossier Google Drive officiel d'abord, puis miroirs GitHub (même fichier, même taille). */
const QUATERNIUS_UAA = 'https://quaternius.com/packs/ultimateanimatedanimals.html';
function quaterniusFile(name, driveId, bytes) {
  return {
    bytes,
    urls: [
      `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`,
      `https://raw.githubusercontent.com/pashaydev/Metamorph/main/assets/models/characters/forms/glTF/${name}`,
      `https://raw.githubusercontent.com/RadAh174/BarkAndMoss/master/assets/animals/${name}`,
    ],
  };
}

/**
 * Kits retenus (docs/ASSETS.md §6). La clé est le slug du kit (page kenney.nl pour Kenney).
 * `source` : 'kenney' (défaut), 'itch' (`page`) ou 'files' (`files` : nom → { bytes, urls }).
 */
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
  // Animaux animés (squelette + clips dans le fichier), CC0 — voir CREDITS.md
  'quaternius-ultimate-animated-animals': {
    name: 'Ultimate Animated Animals', author: 'Quaternius', source: 'files', page: QUATERNIUS_UAA,
    license: 'CC0 1.0 — https://creativecommons.org/publicdomain/zero/1.0/',
    files: {
      'Deer.gltf': quaterniusFile('Deer.gltf', '1iGpXKrqYGyZCPGHPPSuDAoKnOXLhXJ0q', 3288813),
      'Fox.gltf':  quaterniusFile('Fox.gltf',  '1z-CWoUC2vJxrqgGFTYlMaywpE1ooV-bA', 3163174),
      'Cow.gltf':  quaterniusFile('Cow.gltf',  '1lS3t1Sof0FVne1C1WXfdX48qaHES_pDG', 3114187),
    },
  },
  'gobkit-animal-pack-a': { name: 'Free Animal Pack', author: 'Gobkit', source: 'itch', page: 'https://gobkit.itch.io/gobkit-free-animal-pack' },
  'gobkit-animal-pack-b': { name: 'Free Animal Pack Vol. 2', author: 'Gobkit', source: 'itch', page: 'https://gobkit.itch.io/gobkit-free-animal-pack-vol-2' },
});

export function kitPageUrl(slug) { return (KITS[slug] && KITS[slug].page) || `https://kenney.nl/assets/${slug}`; }
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
  const kenney = (KITS[slug] || {}).source === undefined || KITS[slug].source === 'kenney';
  // On ne garde que ce qui sert : GLB/glTF, textures, licence, aperçus. Les FBX/OBJ/DAE sont ignorés.
  const kept = [];
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const name = entry.entryName;
    const useful = kenney
      ? (/^Models\/GLB format\//i.test(name) || /^License\.txt$/i.test(name)
        || /^Preview\.png$/i.test(name) || /^Previews\//i.test(name) || /^Textures\//i.test(name)
        || /Sample\.png$/i.test(name) || /\.glb$/i.test(name))
      : /\.(glb|gltf|bin|png|txt|md)$/i.test(name);
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

/** Fichiers de modèles (GLB/glTF) d'un kit, cherchés dans tout son dossier. */
function listModelFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listModelFiles(p));
    else if (/\.(glb|gltf)$/i.test(name)) out.push(p);
  }
  return out;
}

function isKitPresent(slug) {
  const info = KITS[slug] || {};
  if (info.source === 'files') return Object.keys(info.files).every((f) => existsSync(join(kitDir(slug), f)));
  return listModelFiles(kitDir(slug)).length > 0;
}

/** Cookies d'une suite de réponses (itch.io pose `itchio_token`), renvoyés sous forme d'en-tête Cookie. */
function cookieHeader(jar) { return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; '); }
function collectCookies(jar, res) {
  const list = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  for (const c of list) { const [kv] = c.split(';'); const i = kv.indexOf('='); if (i > 0) jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim()); }
}

/**
 * Parcours de téléchargement gratuit d'itch.io (« Name your own price », sans compte) : page → jeton CSRF
 * → POST /download_url → page de téléchargement (identifiants `data-upload_id`) → POST /file/<upload>
 * → adresse du fichier. Renvoie [{ name, url }] ; le lien n'est valable que quelques minutes.
 */
export async function itchDownloadLinks(pageUrl) {
  const base = pageUrl.replace(/\/+$/, '');
  const jar = new Map();
  const headers = () => ({ 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) tiletown-fetch-kits', Cookie: cookieHeader(jar), Referer: base });
  const page = await fetch(base, { headers: headers(), redirect: 'follow' });
  collectCookies(jar, page);
  if (!page.ok) throw new Error(`HTTP ${page.status} pour ${base}`);
  const html = await page.text();
  const csrf = (html.match(/csrf_token" value="([^"]+)"/) || [])[1];
  if (!csrf) throw new Error(`jeton CSRF introuvable sur ${base}`);
  const dl = await fetch(`${base}/download_url`, { method: 'POST', headers: { ...headers(), 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' }, body: new URLSearchParams({ csrf_token: csrf }) });
  collectCookies(jar, dl);
  const dlJson = await dl.json();
  if (!dlJson.url) throw new Error(`pas d'adresse de téléchargement : ${JSON.stringify(dlJson)}`);
  const keyPage = await fetch(dlJson.url, { headers: headers(), redirect: 'follow' });
  collectCookies(jar, keyPage);
  const keyHtml = await keyPage.text();
  const csrf2 = (keyHtml.match(/csrf_token" value="([^"]+)"/) || [])[1] || csrf;
  const uploads = [...keyHtml.matchAll(/data-upload_id="(\d+)"[\s\S]*?<strong title="([^"]+)"/g)].map((m) => ({ id: m[1], name: m[2] }));
  if (!uploads.length) throw new Error(`aucun fichier listé sur la page de téléchargement de ${base}`);
  const links = [];
  for (const up of uploads) {
    const res = await fetch(`${base}/file/${up.id}?source=game_download&after_download_lightbox=1&as_props=1`, { method: 'POST', headers: { ...headers(), 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest', Referer: dlJson.url }, body: new URLSearchParams({ csrf_token: csrf2 }) });
    const json = await res.json();
    if (!json.url) throw new Error(`fichier ${up.name} refusé : ${JSON.stringify(json)}`);
    links.push({ name: up.name, url: json.url });
  }
  return links;
}

/** Kit « files » : chaque fichier est pris à la première adresse qui répond avec le bon contenu (taille attendue si connue). */
async function fetchFilesKit(slug, info, { force, log }) {
  const dir = kitDir(slug);
  mkdirSync(dir, { recursive: true });
  let count = 0;
  for (const [name, spec] of Object.entries(info.files)) {
    const dest = join(dir, name);
    if (!force && existsSync(dest) && (!spec.bytes || statSync(dest).size === spec.bytes)) { count++; continue; }
    let done = false;
    for (const url of spec.urls) {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'tiletown-fetch-kits (Node)' }, redirect: 'follow' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        const isModel = /\.gltf$/i.test(name) ? buf.subarray(0, 64).toString('utf8').trimStart().startsWith('{') : /\.glb$/i.test(name) ? buf.subarray(0, 4).toString('latin1') === 'glTF' : true;
        if (!isModel) throw new Error('contenu inattendu (page HTML ? quota Google Drive dépassé ?)');
        if (spec.bytes && buf.length !== spec.bytes) throw new Error(`taille ${buf.length} o, attendu ${spec.bytes} o`);
        writeFileSync(dest, buf);
        log(`  ${slug}/${name} : ${(buf.length / 1e6).toFixed(2)} Mo depuis ${new URL(url).host}`);
        done = true; count++;
        break;
      } catch (e) {
        log(`  ${slug}/${name} : ${new URL(url).host} — ${e.message}`);
      }
    }
    if (!done) throw new Error(`${name} introuvable à toutes les adresses`);
  }
  writeFileSync(join(dir, 'SOURCE.txt'), `${info.name} (${info.author})\n${info.page}\nLicence : ${info.license || 'CC0'}\nFichiers : ${Object.keys(info.files).join(', ')}\n${new Date().toISOString()}\n`);
  return { slug, ok: true, skipped: false, glbCount: count };
}

export async function fetchKit(slug, { force = false, from = null, log = console.log } = {}) {
  const info = KITS[slug];
  if (!info) throw new Error(`kit inconnu : ${slug}`);
  if (!force && isKitPresent(slug)) {
    const n = listModelFiles(kitDir(slug)).length;
    log(`  ${slug} : déjà présent (${n} modèles), ignoré`);
    return { slug, ok: true, skipped: true, glbCount: n };
  }
  if (info.source === 'files') return fetchFilesKit(slug, info, { force, log });
  const zipPath = join(RAW_DIR, `${slug}.zip`);
  let source = 'téléchargement';
  const local = findLocalZip(from, slug);
  if (local) {
    mkdirSync(RAW_DIR, { recursive: true });
    copyFileSync(local, zipPath);
    source = `copie de ${local}`;
  } else if (force || !existsSync(zipPath)) {
    let url;
    if (info.source === 'itch') {
      const links = await itchDownloadLinks(info.page);
      const zip = links.find((l) => /\.zip$/i.test(l.name)) || links[0];
      url = zip.url;
      log(`  ${slug} : ${zip.name} (itch.io)`);
    } else {
      const html = await fetchText(kitPageUrl(slug));
      url = findZipUrl(html, slug);
      if (!url) throw new Error(`lien de téléchargement introuvable sur ${kitPageUrl(slug)}`);
      log(`  ${slug} : ${url}`);
    }
    const size = await downloadFile(url, zipPath);
    source = `${info.source === 'itch' ? info.page : url} (${(size / 1e6).toFixed(1)} Mo)`;
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
  for (const name of ['License.txt', 'LICENSE.txt', 'LICENSE']) {
    const p = join(kitDir(slug), name);
    if (existsSync(p)) return readFile(p, 'utf8');
  }
  return null;
}
