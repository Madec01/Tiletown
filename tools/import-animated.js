#!/usr/bin/env node
// Importe les modèles ANIMÉS « skinned » (squelette + clips dans le fichier) des kits bruts et produit
// les GLB normalisés de Tiletown (assets/models/<id>.glb) plus leurs entrées du manifeste
// (docs/ARCHITECTURE.md §8.2 : `animated: true, rig: 'skinned', clips | clipRanges + fps`).
//
// Sources (tools/fetch-kits.js) :
//   - Quaternius « Ultimate Animated Animals » (glTF, CC0) : cerf, renard, vache ; clips nommés
//     (Idle, Walk, Gallop, Eating…) dont on ne garde que ceux du plan ;
//   - Gobkit « Free Animal Pack » A et B (GLB, CC0) : canard, abeille, chouette ; UNE piste de 120 images
//     à 24 i/s (idle 0-29, attack 30-59, dead 60-89, walk 90-119) : la piste complète est conservée sous le
//     nom « all » (animations[0]) ET découpée en quatre clips nommés idle / attack / dead / walk.
//
// Normalisation (sans casser le squelette ni les animations) :
//   - l'échelle (longueur de la boîte englobante en z → `length` u), le lacet et la pose au sol sont portés
//     par un nœud parent NON animé (`<id>`) : rien n'est cuit dans les sommets ni dans les nœuds animés ;
//   - couleurs : texture-atlas quantifiée vers la palette (Gobkit, une primitive texturée), ou
//     baseColorFactor quantifié / imposé puis CUIT EN COULEURS DE SOMMETS (COLOR_0) avec fusion des
//     primitives en UNE seule (Quaternius : 7 matériaux → 1 SkinnedMesh, 1 appel de dessin par animal) ;
//     tangentes supprimées ; metallic 0, roughness 1 ;
//   - nœuds parasites retirés (Gobkit B embarque un nœud vide « skinné » par animal du pack) ;
//   - resample (clés constantes réduites), prune prudent (les articulations et cibles d'animation restent),
//     compression meshopt — relue par le GLTFLoader de three (vérifié par tools/preview-animated.mjs).
//
// Usage :
//   node tools/import-animated.js            tous les modèles
//   node tools/import-animated.js deer duck  seulement ceux-là
//   node tools/import-animated.js --verbose

import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join as joinPath } from 'node:path';
import { prune, resample, meshopt, getBounds, dedup, joinPrimitives } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { io, prepareMaterials, quatY, countTriangles, round3, OUT_DIR, sourcePath } from './import-models.js';
import { KITS, kitDir, readKitLicense } from './fetch-kits.js';
import { updateManifest, totalBytes } from './manifest-util.js';

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');
const ONLY = args.filter((a) => !a.startsWith('--'));
const log = (...m) => console.log(...m);
const vlog = (...m) => { if (VERBOSE) console.log('   ', ...m); };

const QUATERNIUS = 'quaternius-ultimate-animated-animals';
const GOBKIT_A = 'gobkit-animal-pack-a';
const GOBKIT_B = 'gobkit-animal-pack-b';

/** Découpage de la piste unique des GLB Gobkit (images à 24 i/s, bornes incluses). */
export const GOBKIT_CLIP_RANGES = Object.freeze({ idle: [0, 29], attack: [30, 59], dead: [60, 89], walk: [90, 119] });
export const GOBKIT_FPS = 24;

/**
 * Plan des modèles animés « skinned ».
 *   kit, source   kit (clé de fetch-kits.js) et fichier dans assets/models/raw/<kit>/
 *   length        longueur cible (u) de la boîte englobante le long de z (sens de la marche)
 *   yaw           lacet (degrés) pour que le modèle regarde vers +Z (tous regardent déjà vers +Z)
 *   footprint     emprise indicative [x, z] en u (pour les placements)
 *   clips         rôle → nom du clip dans le fichier (les clips absents du plan sont supprimés)
 *   clipRanges    Gobkit : rôle → [image de début, image de fin] de la piste unique, découpée en clips nommés
 *   materials     nom de matériau source → rôle de palette (sinon : teinte la plus proche)
 */
export const ANIMATED_MAP = {
  deer: {
    kit: QUATERNIUS, source: 'Deer.gltf', length: 0.45, yaw: 0, footprint: [0.2, 0.45],
    clips: { idle: 'Idle', walk: 'Walk', run: 'Gallop', eat: 'Eating' },
    materials: { Main: 'wood', Main_Light: 'wallTan', Main_Dark: 'wood', Hooves: 'asphalt', Eye_Lighter: 'soil', Eye_Black: 'asphalt', Eye_White: 'marking' },
  },
  fox: {
    kit: QUATERNIUS, source: 'Fox.gltf', length: 0.3, yaw: 0, footprint: [0.1, 0.3],
    clips: { idle: 'Idle', walk: 'Walk', run: 'Gallop', eat: 'Eating' },
    materials: { Main: 'roofOrange', Main_Light: 'wallCream', Grey: 'asphalt', Black: 'asphalt', Eyes: 'asphalt' },
    note: 'longueur mesurée queue comprise (la queue fait ≈ 40 % de la longueur)',
  },
  cow: {
    kit: QUATERNIUS, source: 'Cow.gltf', length: 0.4, yaw: 0, footprint: [0.15, 0.4],
    clips: { idle: 'Idle', walk: 'Walk', run: 'Gallop', eat: 'Eating' },
    materials: { Main: 'wood', Main_Light: 'wallCream', Hooves: 'asphalt', Muzzle: 'wallBeige', Eye_Black: 'asphalt', Eye_White: 'marking', Horns: 'wallBeige' },
  },
  duck: { kit: GOBKIT_A, source: 'Duck.glb', length: 0.15, yaw: 0, footprint: [0.12, 0.15], clipRanges: GOBKIT_CLIP_RANGES, fps: GOBKIT_FPS },
  bee: { kit: GOBKIT_B, source: 'Bee.glb', length: 0.06, yaw: 0, footprint: [0.09, 0.06], clipRanges: GOBKIT_CLIP_RANGES, fps: GOBKIT_FPS, note: 'ailes déployées : largeur > longueur' },
  owl: { kit: GOBKIT_B, source: 'Owl.glb', length: 0.12, yaw: 0, footprint: [0.12, 0.12], clipRanges: GOBKIT_CLIP_RANGES, fps: GOBKIT_FPS },
};

/** Noms de kit et adresses dans le manifeste. */
const KIT_INFO = {
  [QUATERNIUS]: { url: 'https://quaternius.com/packs/ultimateanimatedanimals.html' },
  [GOBKIT_A]: { url: 'https://gobkit.itch.io/gobkit-free-animal-pack' },
  [GOBKIT_B]: { url: 'https://gobkit.itch.io/gobkit-free-animal-pack-vol-2' },
};

// ─── Animations ─────────────────────────────────────────────────────────────────────────────────

/** Interpolation linéaire (translation, échelle) ou slerp (rotation) entre deux clés. */
function interpolate(a, b, t, path) {
  if (path !== 'rotation') return a.map((v, i) => v + (b[i] - v) * t);
  let [ax, ay, az, aw] = a; let [bx, by, bz, bw] = b;
  let cos = ax * bx + ay * by + az * bz + aw * bw;
  if (cos < 0) { cos = -cos; bx = -bx; by = -by; bz = -bz; bw = -bw; }
  let s0, s1;
  if (1 - cos > 1e-6) { const omega = Math.acos(Math.min(1, cos)); const so = Math.sin(omega); s0 = Math.sin((1 - t) * omega) / so; s1 = Math.sin(t * omega) / so; }
  else { s0 = 1 - t; s1 = t; }
  const q = [ax * s0 + bx * s1, ay * s0 + by * s1, az * s0 + bz * s1, aw * s0 + bw * s1];
  const n = Math.hypot(...q) || 1;
  return q.map((v) => v / n);
}

/** Valeur d'un échantillonneur au temps t (interpolation LINEAR ou STEP ; les clés hors plage sont tenues). */
function sampleAt(times, values, size, t, path, interpolation) {
  const n = times.length;
  if (t <= times[0]) return Array.from(values.subarray(0, size));
  if (t >= times[n - 1]) return Array.from(values.subarray((n - 1) * size, n * size));
  let i = 0;
  while (i < n - 2 && times[i + 1] <= t) i++;
  const a = Array.from(values.subarray(i * size, (i + 1) * size));
  const b = Array.from(values.subarray((i + 1) * size, (i + 2) * size));
  if (interpolation === 'STEP') return a;
  const span = times[i + 1] - times[i];
  return interpolate(a, b, span > 0 ? (t - times[i]) / span : 0, path);
}

/**
 * Crée un clip `name` en rééchantillonnant la piste `source` entre les images f0 et f1 (incluses) à
 * `fps` i/s : une clé par image, temps ramené à 0. Les canaux visent les mêmes nœuds et chemins.
 */
function splitClip(doc, source, name, [f0, f1], fps) {
  const anim = doc.createAnimation(name);
  const buffer = doc.getRoot().listBuffers()[0] || doc.createBuffer();
  const count = f1 - f0 + 1;
  const times = new Float32Array(count);
  for (let k = 0; k < count; k++) times[k] = k / fps;
  const input = doc.createAccessor(`${name}-time`).setType('SCALAR').setArray(times).setBuffer(buffer);
  for (const channel of source.listChannels()) {
    const sampler = channel.getSampler();
    const path = channel.getTargetPath();
    const inArr = sampler.getInput().getArray();
    const outAcc = sampler.getOutput();
    const size = outAcc.getElementSize();
    const outArr = outAcc.getArray();
    const values = new Float32Array(count * size);
    for (let k = 0; k < count; k++) {
      const v = sampleAt(inArr, outArr, size, (f0 + k) / fps, path, sampler.getInterpolation());
      values.set(v, k * size);
    }
    const output = doc.createAccessor().setType(outAcc.getType()).setArray(values).setBuffer(buffer);
    const s = doc.createAnimationSampler().setInput(input).setOutput(output).setInterpolation('LINEAR');
    const c = doc.createAnimationChannel().setTargetNode(channel.getTargetNode()).setTargetPath(path).setSampler(s);
    anim.addSampler(s).addChannel(c);
  }
  return anim;
}

/** Supprime un clip ET ses canaux et échantillonneurs (sinon leurs accesseurs survivent à prune()). */
function disposeAnimation(anim) {
  for (const c of anim.listChannels()) c.dispose();
  for (const s of anim.listSamplers()) s.dispose();
  anim.dispose();
}

/** Durée (s) et nombre de clés d'un clip. */
function clipStats(anim) {
  let duration = 0, keys = 0;
  for (const c of anim.listChannels()) {
    const input = c.getSampler().getInput();
    duration = Math.max(duration, input.getMax([])[0]);
    keys = Math.max(keys, input.getCount());
  }
  return { duration: round3(duration), keys };
}

// ─── Nettoyage de la hiérarchie ─────────────────────────────────────────────────────────────────

/** Nœuds de la scène sans maillage, sans enfant, qui ne sont ni articulation ni cible d'animation : retirés. */
function removeStrayNodes(doc, scene) {
  const root = doc.getRoot();
  const joints = new Set();
  for (const skin of root.listSkins()) for (const j of skin.listJoints()) joints.add(j);
  const animated = new Set();
  for (const anim of root.listAnimations()) for (const ch of anim.listChannels()) animated.add(ch.getTargetNode());
  const removed = [];
  for (const node of scene.listChildren()) {
    if (node.getMesh() || node.listChildren().length || joints.has(node) || animated.has(node)) continue;
    removed.push(node.getName());
    node.dispose();
  }
  // Peaux qui ne sont plus portées par aucun maillage
  for (const skin of root.listSkins()) {
    if (!skin.listParents().some((p) => p.propertyType === 'Node')) skin.dispose();
  }
  return removed;
}

/**
 * Matériaux plats → couleurs de sommets : chaque primitive reçoit un COLOR_0 uni (baseColorFactor linéaire
 * de son matériau), toutes partagent ensuite un matériau blanc « flat-vertex » et sont fusionnées en une
 * seule primitive par maillage (même peau, mêmes attributs). Les textures restent telles quelles.
 */
function bakeMaterialsToVertexColors(doc) {
  const root = doc.getRoot();
  const buffer = root.listBuffers()[0] || doc.createBuffer();
  let shared = null;
  for (const mesh of root.listMeshes()) {
    const prims = mesh.listPrimitives();
    if (prims.some((p) => p.getMaterial() && p.getMaterial().getBaseColorTexture())) continue;
    if (prims.length < 2 && prims[0] && !prims[0].getMaterial()) continue;
    for (const prim of prims) {
      const material = prim.getMaterial();
      const [r, g, b] = material ? material.getBaseColorFactor() : [1, 1, 1, 1];
      const count = prim.getAttribute('POSITION').getCount();
      const colors = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) { colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = b; }
      prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(colors).setBuffer(buffer));
      if (!shared) shared = doc.createMaterial('flat-vertex').setBaseColorFactor([1, 1, 1, 1]).setMetallicFactor(0).setRoughnessFactor(1);
      prim.setMaterial(shared);
    }
    if (prims.length > 1) {
      const joined = joinPrimitives(prims);
      for (const prim of prims) { mesh.removePrimitive(prim); prim.dispose(); }
      mesh.addPrimitive(joined);
    }
  }
}

/** Supprime COLOR_0 (blanc chez Quaternius : il assombrirait inutilement) et les tangentes. */
function stripVertexExtras(doc) {
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      for (const sem of prim.listSemantics()) {
        if (/^COLOR_/.test(sem) || sem === 'TANGENT') prim.setAttribute(sem, null);
      }
    }
  }
}

// ─── Construction d'un modèle ───────────────────────────────────────────────────────────────────

async function buildAnimated(id, spec) {
  const path = sourcePath(spec.kit, spec.source);
  if (!path) return { ok: false, missing: [`${spec.kit}/${spec.source}`] };
  const doc = await io.read(path);
  const root = doc.getRoot();
  const scene = root.getDefaultScene() || root.listScenes()[0];
  const skinsBefore = root.listSkins().length;

  // 1) hiérarchie : nœuds parasites, puis matériaux et attributs
  const stray = removeStrayNodes(doc, scene);
  if (stray.length) vlog(`nœuds parasites retirés : ${stray.join(', ')}`);
  prepareMaterials(doc, spec.kit, spec.materials || {});
  stripVertexExtras(doc);
  bakeMaterialsToVertexColors(doc);
  const primitives = root.listMeshes().reduce((n, m) => n + m.listPrimitives().length, 0);
  const textured = root.listTextures().length > 0;

  // 2) animations : sélection (Quaternius) ou découpage (Gobkit)
  const clips = {};
  if (spec.clipRanges) {
    const track = root.listAnimations()[0];
    if (!track) throw new Error('aucune piste d’animation');
    for (const extra of root.listAnimations().slice(1)) disposeAnimation(extra);
    track.setName('all');
    for (const [role, range] of Object.entries(spec.clipRanges)) {
      splitClip(doc, track, role, range, spec.fps);
      clips[role] = role;
    }
  } else {
    const wanted = new Set(Object.values(spec.clips));
    const present = new Set(root.listAnimations().map((a) => a.getName()));
    for (const anim of root.listAnimations()) if (!wanted.has(anim.getName())) disposeAnimation(anim);
    for (const [role, name] of Object.entries(spec.clips)) {
      if (present.has(name)) clips[role] = name;
      else log(`   clip « ${name} » (${role}) absent de ${spec.source}`);
    }
  }

  // 3) échelle, lacet, pose au sol : sur un nœud parent non animé
  const bounds0 = getBounds(scene);
  const extentZ = bounds0.max[2] - bounds0.min[2];
  const scale = extentZ > 0 ? spec.length / extentZ : 1;
  const wrapper = doc.createNode(id).setScale([scale, scale, scale]);
  if (spec.yaw) wrapper.setRotation(quatY(spec.yaw));
  for (const child of scene.listChildren()) wrapper.addChild(child);
  scene.addChild(wrapper);
  let bounds = getBounds(scene);
  const cx = (bounds.min[0] + bounds.max[0]) / 2, cz = (bounds.min[2] + bounds.max[2]) / 2;
  wrapper.setTranslation([-cx, -bounds.min[1], -cz]);
  bounds = getBounds(scene);

  // 4) nettoyage prudent : clés redondantes, doublons, élagage (articulations et cibles d'animation conservées)
  await doc.transform(resample(), dedup(), prune({ keepLeaves: false, keepAttributes: false }));
  const skinsAfter = root.listSkins().length;
  const joints = root.listSkins().reduce((n, s) => n + s.listJoints().length, 0);
  if (skinsAfter === 0 || skinsAfter > skinsBefore) throw new Error(`peaux : ${skinsBefore} → ${skinsAfter}`);
  const triangles = countTriangles(doc);
  const animations = root.listAnimations().map((a) => ({ name: a.getName(), ...clipStats(a) }));

  // 5) compression meshopt (quantification incluse ; la peau et les clips sont relus par three : voir preview-animated)
  await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  root.getAsset().generator = 'Tiletown tools/import-animated.js';
  root.getAsset().copyright = `CC0 1.0 — ${KITS[spec.kit].author} (${KITS[spec.kit].name}), normalisé par Tiletown`;

  const file = `${id}.glb`;
  await io.write(joinPath(OUT_DIR, file), doc);
  const bytes = statSync(joinPath(OUT_DIR, file)).size;

  const entry = {
    file,
    kit: spec.kit,
    source: spec.source,
    license: 'CC0',
    url: KIT_INFO[spec.kit].url,
    animated: true,
    rig: 'skinned',
    clips,
    scale: +scale.toFixed(6),
    yaw: spec.yaw || 0,
    footprint: spec.footprint,
    bbox: { min: bounds.min.map(round3), max: bounds.max.map(round3), size: bounds.max.map((v, i) => round3(v - bounds.min[i])) },
    triangles,
    primitives,
    colors: textured ? 'texture' : 'vertex',
    joints,
    animations,
    bytes,
  };
  if (spec.clipRanges) { entry.clipRanges = spec.clipRanges; entry.fps = spec.fps; entry.track = 'all'; }
  if (spec.note) entry.note = spec.note;
  vlog(`matériaux : ${root.listMaterials().map((m) => m.getName()).join(', ')}`);
  return { ok: true, entry };
}

// ─── Licences ───────────────────────────────────────────────────────────────────────────────────

async function writeLicenseFiles(kitsUsed) {
  const quaternius = [
    'Modèles 3D animés de Tiletown dérivés du pack « Ultimate Animated Animals » de Quaternius',
    '(https://quaternius.com/packs/ultimateanimatedanimals.html), distribué sous Creative Commons Zero',
    '(CC0 1.0, domaine public) : https://creativecommons.org/publicdomain/zero/1.0/',
    '',
    'Fichiers : deer.glb (Deer.gltf), fox.glb (Fox.gltf), cow.glb (Cow.gltf). Normalisés par',
    'tools/import-animated.js (échelle, couleurs quantifiées vers la palette, sélection des clips, meshopt).',
    '',
  ].join('\n');
  if (kitsUsed.has(QUATERNIUS)) writeFileSync(joinPath(OUT_DIR, 'LICENSE-quaternius.txt'), quaternius);
  const gobkit = ['Modèles 3D animés de Tiletown dérivés des « Free Animal Pack » A et B de Gobkit (Alsomind Tech Co., Ltd.),',
    'https://gobkit.itch.io/gobkit-free-animal-pack · https://gobkit.itch.io/gobkit-free-animal-pack-vol-2,',
    'distribués sous Creative Commons Zero (CC0 1.0). Fichiers : duck.glb (Duck.glb, pack A), bee.glb (Bee.glb,',
    'pack B), owl.glb (Owl.glb, pack B). Normalisés par tools/import-animated.js.', ''];
  for (const kit of [GOBKIT_A, GOBKIT_B]) {
    if (!kitsUsed.has(kit)) continue;
    const text = await readKitLicense(kit);
    if (text) gobkit.push(`---------------------------------------- ${KITS[kit].name}`, text.replace(/\r/g, '').trim(), '');
  }
  if (kitsUsed.has(GOBKIT_A) || kitsUsed.has(GOBKIT_B)) writeFileSync(joinPath(OUT_DIR, 'LICENSE-gobkit.txt'), gobkit.join('\n'));
}

// ─── Programme ──────────────────────────────────────────────────────────────────────────────────

async function main() {
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;
  mkdirSync(OUT_DIR, { recursive: true });
  const ids = ONLY.length ? ONLY.filter((id) => { if (!ANIMATED_MAP[id]) console.error(`identifiant inconnu : ${id}`); return !!ANIMATED_MAP[id]; }) : Object.keys(ANIMATED_MAP);
  const kitsNeeded = new Set(ids.map((id) => ANIMATED_MAP[id].kit));
  for (const kit of kitsNeeded) if (!existsSync(kitDir(kit))) log(`Kit absent de assets/models/raw/ : ${kit} (lancer node tools/fetch-kits.js ${kit})`);

  const entries = {};
  const failed = [];
  const kitsUsed = new Set();
  for (const id of ids) {
    const spec = ANIMATED_MAP[id];
    try {
      const r = await buildAnimated(id, spec);
      if (!r.ok) { failed.push(id); log(`✗ ${id.padEnd(8)} source introuvable : ${r.missing.join(', ')}`); continue; }
      entries[id] = r.entry;
      kitsUsed.add(spec.kit);
      const e = r.entry;
      const sz = e.bbox.size.map((v) => v.toFixed(2)).join(' × ');
      const clipsTxt = e.animations.map((a) => `${a.name} ${a.duration}s`).join(', ');
      log(`✓ ${id.padEnd(8)} ${String(e.triangles).padStart(5)} tris ${String(e.joints).padStart(3)} art. ${e.primitives} prim. (${e.colors}) ${String((e.bytes / 1024).toFixed(1)).padStart(6)} Ko  ${sz}  [${clipsTxt}]`);
    } catch (e) {
      failed.push(id);
      log(`✗ ${id.padEnd(8)} ERREUR : ${e.message}`);
      if (VERBOSE) console.error(e);
    }
  }
  const manifest = updateManifest(entries, { remove: [] });
  await writeLicenseFiles(kitsUsed);
  const skinnedBytes = totalBytes(manifest.models, (m) => m.animated && m.rig === 'skinned');
  const animatedBytes = totalBytes(manifest.models, (m) => m.animated);
  log(`\n${Object.keys(entries).length} modèles skinned écrits ; poids skinned : ${(skinnedBytes / 1e6).toFixed(2)} Mo ; tous modèles animés : ${(animatedBytes / 1e6).toFixed(2)} Mo (objectif < 1,5 Mo).`);
  if (failed.length) { log(`Échecs : ${failed.join(', ')}`); process.exitCode = 1; }
}

const invokedDirectly = process.argv[1] && (await import('node:path')).resolve(process.argv[1]) === (await import('node:url')).fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
