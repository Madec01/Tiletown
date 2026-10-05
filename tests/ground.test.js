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
  WATER_LEVEL, HILL_HEIGHT, HILL_DOME_MIN, DIP, SKIRT_BOTTOM, SUBDIV,
} from '../src/render3d/ground.js';

const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

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
  // Continuité : sur une coupe est-ouest, deux points voisins ne sautent jamais (hors ligne d'eau,
  // où la surface est volontairement raccordée à `WATER_LEVEL` : voir la remarque de `heightAt`).
  let prev = heightAt(world, 2.05, 4.5);
  for (let x = 2.1; x <= 9; x += 0.05) {
    const h = heightAt(world, x, 4.5);
    assert.ok(Math.abs(h - prev) < 0.09, `saut en x = ${x.toFixed(2)} : ${prev} → ${h}`);
    prev = h;
  }
  // Berge : l'eau est creusée, la frontière est exactement à la ligne d'eau, la terre remonte.
  assert.ok(heightAt(world, 1.5, 4.5) < WATER_LEVEL - 0.1, 'lit de la rivière creusé');
  assert.ok(near(heightAt(world, 2, 4.5), WATER_LEVEL), 'frontière eau / terre à la ligne d’eau');
  assert.ok(heightAt(world, 2.3, 4.5) > WATER_LEVEL, 'la berge remonte');
  assert.ok(heightAt(world, 2.5, 4.5) > heightAt(world, 2.2, 4.5), 'et continue de monter vers le centre');
  // Hors de l'eau, la surface ne descend jamais sous la ligne d'eau (le plan d'eau couvre toujours sa case).
  for (let x = 2; x <= 9; x += 0.1) assert.ok(heightAt(world, x, 4.5) >= WATER_LEVEL - 1e-9, `trou en x = ${x}`);
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
