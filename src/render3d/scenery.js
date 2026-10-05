// Petits détails de la vallée : jardins, clôtures, berges et éclairage, regroupés en un seul maillage.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { isWaterTerrain, surfaceHeight } from "./ground.js";
import { hashUnit } from "./util.js";
export function createScenery() {
  const group = new THREE.Group();
  group.name = "valley-details";
  const material = new THREE.MeshLambertMaterial({ vertexColors: true });
  function setWorld(world) {
    for (const c of [...group.children]) {
      c.geometry.dispose();
      group.remove(c);
    }
    const parts = [];
    const add = (g, x, y, z, hex) => {
      if (g.index) {
        const original = g;
        g = g.toNonIndexed();
        original.dispose();
      }
      g.translate(x, y, z);
      const c = new THREE.Color(hex);
      const colors = new Float32Array(g.attributes.position.count * 3);
      for (let i = 0; i < colors.length; i += 3) {
        colors[i] = c.r;
        colors[i + 1] = c.g;
        colors[i + 2] = c.b;
      }
      g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      parts.push(g);
    };
    const box = (x, y, z, w, h, d, c) =>
      add(new THREE.BoxGeometry(w, h, d), x, y, z, c);
    for (let z = 0; z < world.rows; z++)
      for (let x = 0; x < world.cols; x++) {
        const t = world.tiles[z * world.cols + x],
          b = t.building;
        const h = (k) => hashUnit(world.seed, x, z, k);
        if (
          b &&
          ["house", "shop", "school", "clinic", "office"].includes(b.type)
        ) {
          // Clôture basse, jardinières et deux arbustes devant les façades.
          for (let k = 0; k < 5; k++)
            box(
              x + 0.26 + k * 0.12,
              0.065,
              z + 0.2,
              0.025,
              0.13,
              0.025,
              "#eee1bc",
            );
          box(x + 0.5, 0.085, z + 0.2, 0.52, 0.022, 0.02, "#eee1bc");
          for (const sx of [0.22, 0.78]) {
            box(x + sx, 0.055, z + 0.75, 0.13, 0.1, 0.13, "#cf8c68");
            add(
              new THREE.IcosahedronGeometry(0.105, 1),
              x + sx,
              0.15,
              z + 0.75,
              "#648751",
            );
            if (h(15) > 0.45)
              add(
                new THREE.IcosahedronGeometry(0.035, 0),
                x + sx,
                0.24,
                z + 0.75,
                "#efb2a1",
              );
          }
          if (h(3) > 0.55) {
            box(x + 0.86, 0.16, z + 0.18, 0.018, 0.32, 0.018, "#485d53");
            add(
              new THREE.SphereGeometry(0.046, 6, 4),
              x + 0.86,
              0.335,
              z + 0.18,
              "#ffe5a0",
            );
          }
        }
        if (!b && !isWaterTerrain(t.terrain) && t.terrain !== "hill") {
          const nextWater = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
          ].some(([dx, dz]) =>
            isWaterTerrain(
              world.tiles[(z + dz) * world.cols + x + dx]?.terrain,
            ),
          );
          if (nextWater && h(20) > 0.35) {
            for (let k = 0; k < 3; k++) {
              const sx = x + 0.15 + h(k + 50) * 0.7,
                sz = z + 0.15 + h(k + 60) * 0.7;
              add(
                new THREE.IcosahedronGeometry(0.035 + h(k + 70) * 0.045, 0),
                sx,
                0.03,
                sz,
                "#c8c5a5",
              );
            }
          }
          if (t.terrain === "grass" && h(8) > 0.5) {
            for (let k = 0; k < 5; k++) {
              const sx = x + 0.12 + h(k + 80) * 0.76,
                sz = z + 0.12 + h(k + 90) * 0.76;
              box(sx, 0.026, sz, 0.018, 0.052, 0.018, "#7e9a58");
              if (k < 2)
                add(
                  new THREE.IcosahedronGeometry(0.025, 0),
                  sx,
                  0.07,
                  sz,
                  k ? "#f4dda2" : "#f5f0d9",
                );
            }
          }
        }
      }
    if (parts.length) {
      const merged = mergeGeometries(parts);
      const mesh = new THREE.Mesh(merged, material);
      mesh.receiveShadow = true;
      group.add(mesh);
      for (const p of parts) p.dispose();
    }
  }
  return {
    group,
    setWorld,
    dispose() {
      for (const c of group.children) c.geometry.dispose();
      material.dispose();
    },
  };
}
