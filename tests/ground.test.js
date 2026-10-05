// Tests du TERRAIN CONTINU (src/render3d/ground.js, étape 5 — docs/ARCHITECTURE.md §11.4) :
// champ de hauteur lissé (collines en dômes, berges en pente), maillage soudé unique, couleurs de
// sommets fondues d'une case à l'autre, ombre de contact, grille locale de pose. Les tests de l'EAU
// animée (attributs d'instance, shader) vivent dans `effects.test.js`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { makeWorld, setTerrain, place, riverColumn } from './world-helpers.js';
import {
  createGround, heightAt, surfaceHeight, hillHeight, hillMass, groundColorHex, terrainColorHex,
  waterField, marshField, shoreDistance, isWaterAt, contourMesh,
  WATER_LEVEL, HILL_HEIGHT, HILL_DOME_MIN, DIP, SKIRT_BOTTOM, SUBDIV, SHORE_WOBBLE,
  WETLAND_DEPTH, WETLAND_FILM_LEVEL, FIELD_SLOPE,
} from '../src/render3d/ground.js';

const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

/** Abscisse du rivage (ligne de niveau 0,5 du champ d'eau) entre `lo` et `hi`, sur la ligne z. */
function shoreX(world, z, lo, hi) {
  for (let k = 0; k < 60; k++) {
    const m = (lo + hi) / 2;
    if (isWaterAt(world, m, z)) lo = m; else hi = m;
  }
  return lo;
}

/** Monde d'essai : une rivière au nord-sud en x = 1 et un massif de collines à l'est. */
function valley(cols = 9, rows = 9) {
  const world = riverColumn(makeWorld(cols, rows), 1);
  const x0 = Math.min(5, cols - 2), y0 = Math.min(3, rows - 3);
  for (let y = y0; y < Math.min(y0 + 4, rows); y++) for (let x = x0; x < Math.min(x0 + 3, cols); x++) setTerrain(world, x, y, 'hill');
  return world;
}

test('surfaceHeight : contrat inchangé — 0 sur la terre, WATER_LEVEL sur l’eau, hillHeight sur la colline', () => {
  const world = valley();
  assert.equal(surfaceHeight(world, 3, 3), 0, 'herbe : exactement 0 (les décors ne flottent pas)');
  assert.equal(surfaceHeight(world, 1, 4), WATER_LEVEL);
  assert.equal(surfaceHeight(world, 6, 4), hillHeight(world, 6, 4));
  assert.ok(surfaceHeight(world, 6, 4) > 0.2, 'une colline reste une colline');
});

test('hillMass : un massif monte en son cœur, une colline isolée reste basse', () => {
  const lone = setTerrain(makeWorld(7, 7), 3, 3, 'hill');
  const massif = valley();
  assert.ok(near(hillMass(lone, 3, 3), HILL_DOME_MIN, 0.02), `isolée ≈ ${HILL_DOME_MIN}`);
  assert.ok(hillMass(massif, 6, 4) > 0.8, 'cœur du massif');
  assert.ok(hillMass(massif, 5, 3) < hillMass(massif, 6, 4), 'le bord du massif est plus bas que son cœur');
  assert.ok(hillHeight(lone, 3, 3) > 0.2 && hillHeight(lone, 3, 3) < HILL_HEIGHT[1], 'bornée');
});

test('heightAt : surface continue — pente de berge, dôme de colline, aucun saut d’une case à l’autre', () => {
  const world = valley();
  // Continuité : sur une coupe est-ouest, deux points voisins ne sautent jamais — y compris en
  // traversant la rivière, depuis que le lit, la berge et la nappe sortent du même champ d'eau.
  let prev = heightAt(world, 0, 4.5);
  for (let x = 0.05; x <= 9; x += 0.05) {
    const h = heightAt(world, x, 4.5);
    assert.ok(Math.abs(h - prev) < 0.09, `saut en x = ${x.toFixed(2)} : ${prev} → ${h}`);
    prev = h;
  }
  // Berge : l'eau est creusée, et la surface vaut EXACTEMENT la ligne d'eau sur le rivage — qui n'est
  // plus le bord de la case mais la ligne de niveau 0,5 du champ d'eau (sinueuse, à ±SHORE_WOBBLE).
  assert.ok(heightAt(world, 1.5, 4.5) < WATER_LEVEL - 0.1, 'lit de la rivière creusé');
  const sx = shoreX(world, 4.5, 1.5, 3);
  assert.ok(Math.abs(sx - 2) <= SHORE_WOBBLE + 1e-3, `rivage proche du bord de case : x = ${sx}`);
  assert.ok(near(heightAt(world, sx, 4.5), WATER_LEVEL, 1e-4), 'la surface vaut la ligne d’eau sur le rivage');
  assert.ok(heightAt(world, sx + 0.3, 4.5) > WATER_LEVEL, 'la berge remonte');
  assert.ok(heightAt(world, sx + 0.5, 4.5) > heightAt(world, sx + 0.2, 4.5), 'et continue de monter vers le centre');
  // Hors de l'eau, la surface ne descend jamais sous la ligne d'eau (la nappe couvre toujours son lit).
  for (let x = 0; x <= 9; x += 0.05) {
    for (let z = 0; z <= 9; z += 0.05) {
      if (isWaterAt(world, x, z)) continue;
      assert.ok(heightAt(world, x, z) >= WATER_LEVEL - 1e-6, `trou hors de l’eau en (${x}, ${z})`);
    }
  }
  // Colline : la pente descend sans marche du cœur du massif jusqu'à la plaine.
  const top = heightAt(world, 6.5, 4.5), flank = heightAt(world, 8, 4.5), plain = heightAt(world, 3.5, 4.5);
  assert.ok(top > 0.3, `sommet du massif : ${top}`);
  assert.ok(top > flank && flank > plain + 0.1, `pente continue : ${plain} < ${flank} < ${top}`);
  let last = top;
  for (let x = 6.5; x <= 8.4; x += 0.1) {
    const h = heightAt(world, x, 4.5);
    assert.ok(h <= last + DIP, `la pente ne remonte pas en x = ${x.toFixed(1)} (hors micro-relief)`);
    last = Math.min(last, h);
  }
});

test('heightAt : micro-relief seulement vers le BAS, et aplani sous les constructions', () => {
  const world = makeWorld(8, 8);
  place(world, 4, 4, 'house');
  let lowest = 0;
  for (let x = 0; x < 8; x += 0.1) for (let z = 0; z < 8; z += 0.1) {
    const h = heightAt(world, x, z);
    assert.ok(h <= 1e-9, `aucune bosse au-dessus de 0 en (${x}, ${z}) : ${h}`);
    lowest = Math.min(lowest, h);
  }
  assert.ok(lowest < -0.005 && lowest >= -DIP - 1e-6, `creux présents mais bornés : ${lowest}`);
  // Sous l'îlot bâti, la surface est tenue à plat : rien ne flotte ni ne s'enfonce.
  assert.equal(heightAt(world, 4.5, 4.5), 0, 'exactement la hauteur de pose au centre de la case bâtie');
  for (const [x, z] of [[4.2, 4.8], [4.85, 4.15], [4.5, 4.15]]) {
    assert.ok(near(heightAt(world, x, z), 0, 0.008), `quasi plat sous l’emprise du bâtiment en (${x}, ${z})`);
  }
});

test('groundColorHex : la colline porte de l’herbe rase (la roche n’est plus qu’un affleurement)', () => {
  assert.equal(groundColorHex('grass'), terrainColorHex('grass'));
  assert.notEqual(groundColorHex('hill'), terrainColorHex('hill'));
  assert.match(groundColorHex('hill'), /^#[0-9a-f]{6}$/);
});

test('createGround : UN seul maillage de terre, soudé, avec normales douces, couleurs fondues et jupe de socle', () => {
  const world = valley(6, 6);
  const ground = createGround();
  ground.setWorld(world);
  const land = ground.group.getObjectByName('land');
  assert.ok(land.isMesh && !land.isInstancedMesh, 'un maillage unique, pas des boîtes instanciées');
  assert.equal(land.castShadow, true);
  assert.equal(land.receiveShadow, true);
  const g = land.geometry;
  for (const name of ['position', 'normal', 'color', 'aLayer', 'aAo']) assert.ok(g.attributes[name], `attribut ${name}`);
  const n = g.attributes.position.count;
  assert.ok(n > 6 * 6 * SUBDIV * SUBDIV, 'nappe subdivisée sous la case');
  assert.equal(ground.stats.vertices, n);
  // La nappe suit exactement `heightAt` et descend jusqu'au fond du socle (jupe + fond).
  const pos = g.attributes.position.array;
  let bottom = 0, checked = 0;
  for (let i = 0; i < n; i++) {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    bottom = Math.min(bottom, y);
    if (y > SKIRT_BOTTOM + 1e-3 && Number.isInteger(x * SUBDIV) && Number.isInteger(z * SUBDIV)) {
      assert.ok(near(y, heightAt(world, x, z), 1e-5), `sommet (${x}, ${z}) à ${y}`);
      checked++;
    }
  }
  assert.ok(checked > 100, 'la nappe a bien été vérifiée');
  assert.ok(near(bottom, SKIRT_BOTTOM, 1e-5), 'la jupe descend au fond du socle');
  // Normales unitaires et tournées vers le haut sur la nappe.
  const nor = g.attributes.normal.array;
  for (let i = 0; i < 40; i++) {
    const k = i * 3;
    assert.ok(near(Math.hypot(nor[k], nor[k + 1], nor[k + 2]), 1, 1e-4), 'normale unitaire');
    assert.ok(nor[k + 1] > 0.2, 'la nappe regarde vers le haut');
  }
  // Couleurs : fondues d'une case à l'autre (le sommet entre deux terrains n'est ni l'un ni l'autre).
  const colors = g.attributes.color;
  const hill = new THREE.Color(groundColorHex('hill'));
  const grass = new THREE.Color(groundColorHex('grass'));
  assert.ok(!hill.equals(grass));
  let blended = 0;
  for (let i = 0; i < n; i++) {
    const c = new THREE.Color(colors.getX(i), colors.getY(i), colors.getZ(i));
    if (!c.equals(hill) && !c.equals(grass) && colors.getY(i) > 0.1) blended++;
  }
  assert.ok(blended > 20, 'des teintes intermédiaires existent : pas de frontière nette case par case');
  // Un seul appel de dessin pour toute la terre, plus l'eau.
  assert.equal(ground.stats.drawables, 2, 'terre + rivière');
  ground.dispose();
});

test('createGround : ombre de contact (aAo) marquée sous les îlots et les bosquets, nulle en pleine prairie', () => {
  const world = makeWorld(8, 8);
  place(world, 4, 4, 'house');
  setTerrain(world, 1, 1, 'forest');
  const ground = createGround();
  ground.setWorld(world);
  const land = ground.group.getObjectByName('land');
  const pos = land.geometry.attributes.position.array;
  const ao = land.geometry.attributes.aAo.array;
  const at = (x, z) => {
    let best = -1, bestD = Infinity;
    for (let i = 0; i < ao.length; i++) {
      const d = Math.hypot(pos[i * 3] - x, pos[i * 3 + 2] - z);
      if (d < bestD) { bestD = d; best = i; }
    }
    return ao[best];
  };
  assert.ok(at(4.5, 4.5) > 0.5, 'sous le bâtiment');
  assert.ok(at(1.5, 1.5) > 0.2, 'sous le bosquet');
  assert.ok(at(1.5, 1.5) < at(4.5, 4.5), 'un bosquet assombrit moins qu’un bâtiment');
  assert.equal(at(7.5, 7.5), 0, 'pleine prairie : aucun assombrissement');
  ground.dispose();
});

test('setGridHint : la grille ne s’allume que sur les cases demandées, sans appel de dessin de plus', () => {
  const world = makeWorld(5, 5);
  const ground = createGround();
  ground.setWorld(world);
  const u = ground.landUniforms;
  assert.equal(u.uHintOn.value, 0, 'éteinte par défaut : jamais de quadrillage permanent');
  const before = ground.stats.drawables;
  ground.setGridHint([{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 99, y: 0 }]);
  assert.equal(u.uHintOn.value, 1);
  assert.equal(ground.stats.hint, 2, 'les cases hors carte sont ignorées');
  assert.deepEqual(u.uHintSize.value.toArray(), [5, 5]);
  const data = u.uHint.value.image.data;
  assert.equal(data[2 * 5 + 1], 255);
  assert.equal(data[2 * 5 + 2], 255);
  assert.equal(data[0], 0);
  assert.equal(ground.stats.drawables, before, 'aucun appel de dessin supplémentaire');
  ground.setGridHint(null);
  assert.equal(u.uHintOn.value, 0);
  assert.equal(Array.from(data).every((v) => v === 0), true);
  ground.dispose();
});

test('setTileColors : un calque repeint la nappe et éteint les finitions du paysage', () => {
  const world = valley(6, 6);
  const ground = createGround();
  ground.setWorld(world);
  const land = ground.group.getObjectByName('land');
  assert.equal(ground.landUniforms.uFinish.value, 1);
  const rgb = new Float32Array(36 * 3).fill(0.25);
  ground.setTileColors(rgb);
  assert.ok(ground.landUniforms.uFinish.value < 0.5, 'finitions atténuées : les couleurs du calque restent fidèles');
  const c = land.geometry.attributes.color;
  assert.ok(near(c.getX(10), 0.25, 1e-5) && near(c.getY(10), 0.25, 1e-5), 'nappe repeinte');
  ground.setTileColors(null);
  assert.equal(ground.landUniforms.uFinish.value, 1);
  assert.equal(ground.baseColors().length, 36 * 3);
  ground.dispose();
});

// ---------------------------------------------------------------------------------------------
// Rivière sinueuse (docs/ARCHITECTURE.md §11.4, priorité 1 : « contours irréguliers, virages doux »)

test('waterField / marshField : 1 au cœur de l’eau, 0 au cœur de la terre, rivage sinueux entre les deux', () => {
  const world = riverColumn(makeWorld(7, 7), 3);
  setTerrain(world, 0, 0, 'wetland');
  // Valeurs EXACTES au centre des cases : c'est ce qui garantit une rivière continue (le serpentement
  // ne peut ni la couper ni détacher une flaque) et une hauteur de pose intacte sur la terre.
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      const want = world.tiles[y * 7 + x].terrain === 'river' ? 1 : 0;
      assert.ok(near(waterField(world, x + 0.5, y + 0.5), want, 1e-9), `champ d’eau exact en (${x}, ${y})`);
    }
  }
  assert.ok(near(marshField(world, 0.5, 0.5), 1, 1e-9), 'cœur de la zone humide');
  assert.ok(near(marshField(world, 4.5, 4.5), 0, 1e-9), 'loin de toute zone humide');
  // Rivage : jamais exactement sur le bord des cases, et jamais au-delà de l'amplitude annoncée.
  let moved = 0, maxOff = 0;
  for (let z = 0.1; z < 7; z += 0.1) {
    const x = shoreX(world, z, 3.5, 4.5);
    const off = Math.abs(x - 4);
    maxOff = Math.max(maxOff, off);
    if (off > 0.01) moved++;
  }
  assert.ok(moved > 50, 'le rivage quitte le bord de case presque partout');
  assert.ok(maxOff <= SHORE_WOBBLE + 1e-3, `serpentement borné : ${maxOff.toFixed(3)} ≤ ${SHORE_WOBBLE}`);
  // Largeur : une case en moyenne.
  let total = 0, samples = 0;
  for (let z = 0.25; z < 7; z += 0.25) {
    let w = 0;
    for (let x = 1; x <= 6; x += 0.01) if (isWaterAt(world, x, z)) w += 0.01;
    total += w; samples++;
    assert.ok(w > 0.6, `la rivière ne se pince pas en z = ${z.toFixed(2)} (largeur ${w.toFixed(2)})`);
  }
  assert.ok(Math.abs(total / samples - 1) < 0.2, `largeur moyenne ≈ 1 case : ${(total / samples).toFixed(3)}`);
  // Distance au rivage : 0 sur la ligne d'eau, une demi-case au cœur, négative à terre.
  assert.ok(near(shoreDistance(world, shoreX(world, 3.5, 3.5, 4.5), 3.5), 0, 1e-3));
  assert.ok(near(shoreDistance(world, 3.5, 3.5), 0.5, 1e-6), 'cœur de la rivière à une demi-case');
  assert.ok(near(shoreDistance(world, 6.5, 3.5), -0.5, 1e-6), 'pleine terre');
  assert.ok(near(FIELD_SLOPE, 1.875, 1e-9), 'pente du champ au rivage (smootherstep’)');
});

test('contourMesh : extraction de la ligne de niveau, sommets soudés, faces tournées vers le haut', () => {
  // Champ analytique : un disque de rayon 1 centré en (1,5 ; 1,5) sur une grille de pas 0,25.
  const n = 13, step = 0.25;
  const field = new Float32Array(n * n);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const d = Math.hypot(i * step - 1.5, j * step - 1.5);
      field[j * n + i] = 1.5 - d;        // niveau 0,5 → cercle de rayon 1
    }
  }
  const { xz, index, count } = contourMesh(field, n, n, step, 0.5);
  assert.ok(count > 50 && index.length > 0);
  assert.equal(count, xz.length / 2);
  // Sommets soudés : aucune position en double.
  const seen = new Set();
  for (let v = 0; v < count; v++) {
    const key = `${xz[v * 2].toFixed(6)},${xz[v * 2 + 1].toFixed(6)}`;
    assert.ok(!seen.has(key), 'sommet dupliqué');
    seen.add(key);
  }
  // Tous les sommets sont dans le disque (à la tolérance d'une interpolation linéaire par maille).
  for (let v = 0; v < count; v++) {
    const d = Math.hypot(xz[v * 2] - 1.5, xz[v * 2 + 1] - 1.5);
    assert.ok(d <= 1 + 1e-6, `sommet hors du niveau : d = ${d}`);
  }
  // Aire : celle du disque, à la finesse de la grille près ; faces toutes orientées vers +Y.
  let area = 0;
  for (let t = 0; t < index.length; t += 3) {
    const a = index[t], b = index[t + 1], c = index[t + 2];
    const cross = (xz[b * 2] - xz[a * 2]) * (xz[c * 2 + 1] - xz[a * 2 + 1])
      - (xz[c * 2] - xz[a * 2]) * (xz[b * 2 + 1] - xz[a * 2 + 1]);
    // Dans le plan (X, Z) vu de +Y, un triangle dont la normale pointe vers le haut a un produit
    // vectoriel NÉGATIF (le repère est indirect) : c'est le signe attendu partout.
    assert.ok(cross <= 1e-9, 'triangle orienté vers le haut (aucun repli)');
    area -= cross / 2;
  }
  assert.ok(Math.abs(area - Math.PI) < 0.1, `aire ≈ π : ${area.toFixed(3)}`);
  // Un champ entièrement sous le niveau ne produit rien.
  assert.equal(contourMesh(new Float32Array(n * n), n, n, step, 0.5).index.length, 0);
});

test('createGround : la nappe d’eau est UN maillage soudé, sans aucun angle droit dans un coude', () => {
  // Rivière en L : le tracé de `worldgen` a un angle droit franc, le rendu ne doit plus en avoir.
  const world = makeWorld(10, 10);
  for (let y = 0; y <= 5; y++) setTerrain(world, 2, y, 'river', 'S');
  for (let x = 2; x < 10; x++) setTerrain(world, x, 5, 'river', 'E');
  const ground = createGround();
  ground.setWorld(world);
  const water = ground.group.getObjectByName('water');
  assert.ok(water.isMesh && !water.isInstancedMesh, 'un seul maillage pour toute l’eau');
  assert.equal(ground.stats.drawables, 2, 'terre + eau : un appel de dessin chacun');
  const pos = water.geometry.attributes.position, idx = water.geometry.index.array;

  // Arêtes de bord : celles qui n'appartiennent qu'à un seul triangle.
  const used = new Map();
  for (let t = 0; t < idx.length; t += 3) {
    for (let e = 0; e < 3; e++) {
      const a = idx[t + e], b = idx[t + (e + 1) % 3];
      if (a === b) continue;
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      used.set(key, (used.get(key) || 0) + 1);
    }
  }
  const segments = [];
  for (const [key, n] of used) {
    if (n !== 1) continue;
    const [a, b] = key.split(':').map(Number);
    segments.push([pos.getX(a), pos.getZ(a), pos.getX(b), pos.getZ(b)]);
  }
  assert.ok(segments.length > 40, 'un vrai contour');
  // Direction du bord autour du coude du L (en (3, 5) à l'intérieur, (2, 6) à l'extérieur) : elle doit
  // tourner PROGRESSIVEMENT. Un escalier de cases fait tourner le bord de 90° d'un segment à l'autre.
  const near3 = segments.filter(([x1, z1, x2, z2]) => {
    const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
    return Math.hypot(cx - 2.6, cz - 5.4) < 1.6 && cx > 0.1 && cz > 0.1 && cx < 9.9 && cz < 9.9;
  });
  assert.ok(near3.length > 10, 'des segments autour du coude');
  const dirs = near3.map(([x1, z1, x2, z2]) => {
    const a = Math.atan2(z2 - z1, x2 - x1) * 180 / Math.PI;
    return ((a % 180) + 180) % 180;      // orientation du segment, sans son sens
  }).sort((a, b) => a - b);
  // Un contour en escalier n'a que deux orientations (0° et 90°) : ici il en faut un éventail continu.
  const bins = new Set(dirs.map((d) => Math.round(d / 15)));
  assert.ok(bins.size >= 5, `éventail d’orientations autour du coude : ${[...bins].join(',')}`);
  const axis = dirs.filter((d) => Math.min(d % 90, 90 - (d % 90)) < 5).length;
  assert.ok(axis / dirs.length < 0.8, `le bord n’est plus aligné sur la grille : ${(axis / dirs.length * 100).toFixed(0)} %`);
  ground.dispose();
});

test('createGround : la nappe des zones humides est enfoncée, à contour fondu et irrégulier', () => {
  const world = makeWorld(9, 9);
  for (const [x, y] of [[3, 3], [4, 3], [5, 3], [3, 4], [4, 4], [5, 4], [4, 5]]) setTerrain(world, x, y, 'wetland');
  const ground = createGround();
  ground.setWorld(world);
  const film = ground.group.getObjectByName('wetland-film');
  assert.ok(film.isMesh && !film.isInstancedMesh);
  assert.equal(film.material.transparent, true, 'le bord se fond dans la terre');
  assert.equal(film.material.depthWrite, false);
  const pos = film.geometry.attributes.position;
  let lowest = Infinity, highest = -Infinity;
  for (let v = 0; v < pos.count; v++) {
    const y = pos.getY(v);
    lowest = Math.min(lowest, y); highest = Math.max(highest, y);
    // La pellicule suit le sol creusé : toujours exactement WETLAND_FILM_LEVEL au-dessus.
    assert.ok(near(y, heightAt(world, pos.getX(v), pos.getZ(v)) + WETLAND_FILM_LEVEL, 1e-5), 'collée au sol');
  }
  assert.ok(near(lowest, -WETLAND_DEPTH + WETLAND_FILM_LEVEL, 1e-3), `cuvette de ${WETLAND_DEPTH} : ${lowest}`);
  assert.ok(highest < WETLAND_FILM_LEVEL + 1e-6, 'jamais au-dessus de la plaine');
  assert.ok(WETLAND_DEPTH <= DIP, 'le creux reste dans la tolérance des creux naturels (rien ne lévite)');
  // Contour irrégulier : le bord de la nappe ne colle pas aux bords des cases humides.
  let offEdge = 0, onEdge = 0;
  const shore = film.geometry.attributes.aShore;
  for (let v = 0; v < pos.count; v++) {
    if (Math.abs(shore.getX(v)) > 0.02) continue;    // sommets du contour (distance au rivage ≈ 0)
    const x = pos.getX(v), z = pos.getZ(v);
    if (Math.abs(x - Math.round(x)) < 1e-4 || Math.abs(z - Math.round(z)) < 1e-4) onEdge++; else offEdge++;
  }
  assert.ok(offEdge > onEdge, `bord irrégulier : ${offEdge} sommets hors grille contre ${onEdge} dessus`);
  ground.dispose();
});
