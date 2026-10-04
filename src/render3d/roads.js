// Rues SUR LES ARÊTES (docs/GAME_DESIGN.md §4.1, docs/ARCHITECTURE.md §3) : pour chaque arête du
// treillis valant 2 (rue) ou 3 (pont), une bande centrée sur l'arête, orientée est-ouest (arêtes
// `h`) ou nord-sud (arêtes `v`) ; aux sommets où des rues se rejoignent (2 en angle, 3 ou 4), un
// nœud carré ; les chemins (1) sont une bande fine de terre ; les ponts sont surélevés avec
// garde-corps et piles. Tout est instancié : six appels de dessin au plus pour tout le réseau.
// Les rues saturées se teintent (orange puis rouge) d'après `world.traffic`.
// `collectRoadPlacements` est pure : testable sous Node.

import * as THREE from 'three';
import { PALETTE } from '../data/palette.js';
import { paintGeometry, mergeParts } from './models.js';
import { composeMatrix, disposeObject } from './util.js';
import { LAND_THICKNESS } from './ground.js';

export const EDGE_NONE = 0;
export const EDGE_PATH = 1;
export const EDGE_STREET = 2;
export const EDGE_BRIDGE = 3;

export const ROAD_WIDTH = 0.3;
export const ROAD_THICKNESS = 0.02;
export const SIDEWALK_WIDTH = 0.42;
export const SIDEWALK_THICKNESS = 0.012;
export const PATH_WIDTH = 0.16;
export const PATH_THICKNESS = 0.015;
export const BRIDGE_DECK_TOP = 0.07;
/** Seuils de trafic (trajets par arête) pour l'orange puis le rouge (docs/GAME_DESIGN.md §4.3). */
export const TRAFFIC_ORANGE = 3;
export const TRAFFIC_RED = 6;

/**
 * Liste pure des éléments à poser. Chaque bande : { x, z, horizontal, traffic } (centre de l'arête ;
 * `horizontal` = arête `h`, orientée est-ouest). Chaque nœud : { x, z, degree }.
 * Un monde sans `edges` donne des listes vides.
 */
export function collectRoadPlacements(world) {
  const result = { streets: [], paths: [], bridges: [], streetNodes: [], pathNodes: [] };
  const edges = world && world.edges;
  if (!edges || !edges.h || !edges.v) return result;
  const { cols, rows } = world;
  const traffic = world.traffic || null;
  const hAt = (x, y) => (x >= 0 && x < cols && y >= 0 && y <= rows ? edges.h[y * cols + x] : 0);
  const vAt = (x, y) => (x >= 0 && x <= cols && y >= 0 && y < rows ? edges.v[y * (cols + 1) + x] : 0);

  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = edges.h[y * cols + x];
      if (!v) continue;
      const item = { x: x + 0.5, z: y, horizontal: true, traffic: traffic && traffic.h ? traffic.h[y * cols + x] || 0 : 0 };
      if (v === EDGE_PATH) result.paths.push(item);
      else if (v === EDGE_BRIDGE) result.bridges.push(item);
      else result.streets.push(item);
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x <= cols; x++) {
      const v = edges.v[y * (cols + 1) + x];
      if (!v) continue;
      const item = { x, z: y + 0.5, horizontal: false, traffic: traffic && traffic.v ? traffic.v[y * (cols + 1) + x] || 0 : 0 };
      if (v === EDGE_PATH) result.paths.push(item);
      else if (v === EDGE_BRIDGE) result.bridges.push(item);
      else result.streets.push(item);
    }
  }

  // Nœuds aux sommets du treillis : rues (≥ 2) et chemins (= 1), séparément.
  for (let cy = 0; cy <= rows; cy++) {
    for (let cx = 0; cx <= cols; cx++) {
      const e = hAt(cx, cy), w = hAt(cx - 1, cy), s = vAt(cx, cy), n = vAt(cx, cy - 1);
      const street = (val) => val >= EDGE_STREET;
      const path = (val) => val === EDGE_PATH;
      for (const [test, list] of [[street, result.streetNodes], [path, result.pathNodes]]) {
        const E = test(e), W = test(w), S = test(s), N = test(n);
        const degree = E + W + S + N;
        if (degree >= 3 || (degree === 2 && !((E && W) || (N && S)))) {
          list.push({ x: cx, z: cy, degree });
        }
      }
    }
  }
  return result;
}

/** Boîte posée sur `y0`, peinte d'une couleur. */
function slab(w, h, d, hex, y0 = 0, x = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y0 + h / 2, z);
  return paintGeometry(g, hex);
}

/** Géométries de remplacement (couleurs de sommets). */
function buildFallbackGeometries({ markings }) {
  const streetTrimParts = [slab(1, SIDEWALK_THICKNESS, SIDEWALK_WIDTH, PALETTE.sidewalk)];
  if (markings) streetTrimParts.push(slab(0.42, 0.004, 0.03, PALETTE.marking, ROAD_THICKNESS));
  const bridgeParts = [
    slab(1, BRIDGE_DECK_TOP - ROAD_THICKNESS, 0.34, PALETTE.wallTan, ROAD_THICKNESS),               // tablier
    slab(1, 0.09, 0.025, PALETTE.wood, BRIDGE_DECK_TOP, 0, 0.165),                                   // garde-corps
    slab(1, 0.09, 0.025, PALETTE.wood, BRIDGE_DECK_TOP, 0, -0.165),
    slab(0.1, ROAD_THICKNESS + LAND_THICKNESS, 0.3, PALETTE.rock, -LAND_THICKNESS, -0.3, 0),      // piles
    slab(0.1, ROAD_THICKNESS + LAND_THICKNESS, 0.3, PALETTE.rock, -LAND_THICKNESS, 0.3, 0),
  ];
  if (markings) bridgeParts.push(slab(0.42, 0.004, 0.03, PALETTE.marking, BRIDGE_DECK_TOP));
  return {
    // Asphalte : couleur par instance (trafic), donc sans couleur de sommets.
    street: new THREE.BoxGeometry(1, ROAD_THICKNESS, ROAD_WIDTH).translate(0, ROAD_THICKNESS / 2, 0),
    streetTrim: mergeParts(streetTrimParts),
    streetNode: mergeParts([
      slab(ROAD_WIDTH, ROAD_THICKNESS + 0.002, ROAD_WIDTH, PALETTE.asphalt),
      slab(SIDEWALK_WIDTH, SIDEWALK_THICKNESS, SIDEWALK_WIDTH, PALETTE.sidewalk),
    ]),
    path: slab(1, PATH_THICKNESS, PATH_WIDTH, PALETTE.soil),
    pathNode: slab(PATH_WIDTH, PATH_THICKNESS + 0.001, PATH_WIDTH, PALETTE.soil),
    bridge: mergeParts(bridgeParts),
  };
}

/** Un modèle du manifeste convient à une arête s'il est assez étroit (pièce « bord », pas une case entière). */
function edgeModel(models, id) {
  const m = models.get(id);
  if (!m) return null;
  const b = m.geometry.boundingBox;
  const width = Math.min(b.max.x - b.min.x, b.max.z - b.min.z);
  return width <= 0.5 ? m : null;
}

/**
 * Crée le rendu des rues. options : { markings = true }.
 * API : { group, setWorld(world), stats, dispose() }.
 */
export function createRoads(models, options = {}) {
  const markings = options.markings !== false;
  const group = new THREE.Group();
  group.name = 'roads';
  const stats = { streets: 0, paths: 0, bridges: 0, streetNodes: 0, pathNodes: 0, drawables: 0 };
  const geometries = buildFallbackGeometries({ markings });
  const vertexMaterial = models.materials.vertex;
  const asphaltMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const sharedMaterials = new Set([vertexMaterial, asphaltMaterial, ...models.materials.textured.values()]);
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  const asphalt = new THREE.Color(PALETTE.asphalt);
  const orange = new THREE.Color(PALETTE.roofOrange);
  const red = new THREE.Color(PALETTE.roofRed);

  // Modèles du manifeste dédiés aux arêtes, s'ils existent (sinon géométries de remplacement).
  const streetGlb = edgeModel(models, 'road-edge-straight');
  const nodeGlb = edgeModel(models, 'road-edge-node');
  const bridgeGlb = edgeModel(models, 'road-edge-bridge');

  function clear() {
    for (const child of [...group.children]) {
      group.remove(child);
      disposeObject(child, sharedMaterials);
    }
    for (const k of Object.keys(stats)) stats[k] = 0;
  }

  /** InstancedMesh d'un lot d'éléments { x, z, horizontal } ; `rotate` tourne les arêtes verticales. */
  function instance(name, geometry, material, items, { cast = false, colorize = null } = {}) {
    if (!items.length) return null;
    const mesh = new THREE.InstancedMesh(geometry, material, items.length);
    mesh.name = name;
    mesh.geometry.userData.shared = true;
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    items.forEach((it, k) => {
      const yaw = it.horizontal === false ? Math.PI / 2 : 0;
      mesh.setMatrixAt(k, composeMatrix(matrix, it.x, 0, it.z, yaw, 1));
      if (colorize) mesh.setColorAt(k, colorize(it));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    group.add(mesh);
    stats.drawables++;
    return mesh;
  }

  function trafficColor(item) {
    if (item.traffic >= TRAFFIC_RED) return color.copy(red);
    if (item.traffic >= TRAFFIC_ORANGE) return color.copy(orange);
    return color.copy(asphalt);
  }

  function setWorld(world) {
    clear();
    const p = collectRoadPlacements(world);
    stats.streets = p.streets.length; stats.paths = p.paths.length; stats.bridges = p.bridges.length;
    stats.streetNodes = p.streetNodes.length; stats.pathNodes = p.pathNodes.length;

    if (streetGlb) {
      instance('streets', streetGlb.geometry, streetGlb.material, p.streets);
    } else {
      instance('streets', geometries.street, asphaltMaterial, p.streets, { colorize: trafficColor });
      instance('street-trim', geometries.streetTrim, vertexMaterial, p.streets);
    }
    const nodes = p.streetNodes.map((n) => ({ ...n, horizontal: true }));
    instance('street-nodes', nodeGlb ? nodeGlb.geometry : geometries.streetNode, nodeGlb ? nodeGlb.material : vertexMaterial, nodes);
    instance('paths', geometries.path, vertexMaterial, p.paths);
    instance('path-nodes', geometries.pathNode, vertexMaterial, p.pathNodes.map((n) => ({ ...n, horizontal: true })));
    instance('bridges', bridgeGlb ? bridgeGlb.geometry : geometries.bridge, bridgeGlb ? bridgeGlb.material : vertexMaterial, p.bridges, { cast: true });
  }

  function dispose() {
    clear();
    for (const g of Object.values(geometries)) g.dispose();
    asphaltMaterial.dispose();
  }

  return { group, stats, setWorld, dispose };
}
