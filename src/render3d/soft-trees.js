// Silhouettes douces de la végétation : volumes arrondis, palette par rôle.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
export function softTree(id) {
  const variant = { "tree-a": 0, "tree-b": 1, "tree-c": 2 }[id];
  if (variant === undefined) return null;
  const geometries = [];
  const add = (g, x, y, z, scale, color) => {
    if (g.index) {
      const old = g;
      g = g.toNonIndexed();
      old.dispose();
    }
    g.scale(...scale);
    g.translate(x, y, z);
    const c = new THREE.Color(color),
      arr = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = c.r;
      arr[i + 1] = c.g;
      arr[i + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
    geometries.push(g);
  };
  add(
    new THREE.CylinderGeometry(0.035, 0.055, 0.48, 7),
    0,
    0.24,
    0,
    [1, 1, 1],
    "#967055",
  );
  const greens = [
    ["#7da05f", "#91af6d", "#aac47c"],
    ["#658958", "#82a069", "#9fb77d"],
    ["#749764", "#95ae78", "#bbca91"],
  ][variant];
  const lobes = [
    [-0.13, 0.52, 0.03, 0.24],
    [0.13, 0.59, 0.02, 0.25],
    [0, 0.75, -0.045, 0.26],
    [0.015, 0.5, -0.13, 0.22],
  ];
  lobes.forEach(([x, y, z, r], i) =>
    add(
      new THREE.SphereGeometry(r, 9, 7),
      x,
      y,
      z,
      [1, 1.12 + variant * 0.07, 0.92],
      greens[i % 3],
    ),
  );
  const geometry = mergeGeometries(geometries);
  for (const g of geometries) g.dispose();
  geometry.deleteAttribute("uv");
  geometry.setIndex(
    Array.from({ length: geometry.attributes.position.count }, (_, i) => i),
  );
  geometry.computeBoundingBox();
  return geometry;
}
