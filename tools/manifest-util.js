// Lecture et mise à jour partielle du manifeste des modèles (assets/models/manifest.json), partagées par
// tools/import-animated.js et tools/build-fauna.js : ces scripts ajoutent ou remplacent leurs propres
// entrées sans toucher aux autres (tools/import-models.js conserve de son côté les entrées `animated`).

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETTE_LIST } from '../src/data/palette.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const MODELS_DIR = join(ROOT, 'assets', 'models');
export const MANIFEST_PATH = join(MODELS_DIR, 'manifest.json');
export const UNIT = '1 case = 1 unité, origine au centre de la case, y vers le haut, face +Z (sud)';

/** Manifeste existant, ou squelette vide s'il manque ou est illisible. */
export function readManifest() {
  let manifest = null;
  if (existsSync(MANIFEST_PATH)) {
    try { manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')); } catch { manifest = null; }
  }
  if (!manifest || typeof manifest !== 'object') manifest = {};
  manifest.palette = PALETTE_LIST;
  manifest.unit = manifest.unit || UNIT;
  manifest.models = manifest.models || {};
  return manifest;
}

/**
 * Ajoute ou remplace des entrées (`{ id: entry }`), retire celles de `remove`, et réécrit le manifeste.
 * L'ordre existant est conservé ; les nouveaux identifiants sont ajoutés à la fin.
 */
export function updateManifest(entries, { remove = [] } = {}) {
  const manifest = readManifest();
  for (const id of remove) delete manifest.models[id];
  for (const [id, entry] of Object.entries(entries)) manifest.models[id] = entry;
  manifest.generated = new Date().toISOString().slice(0, 10);
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

/** Poids total (octets) des GLB d'un sous-ensemble d'entrées du manifeste. */
export function totalBytes(models, filter = () => true) {
  return Object.values(models).filter(filter).reduce((n, m) => n + (m.bytes || 0), 0);
}
