// Surface continue : les bords partagés ont la même altitude et la même couleur.
import * as THREE from "three";
const smooth = (t) => t * t * (3 - 2 * t);
const mix = (a, b, t) => a + (b - a) * t;
export function continuousHeight(world, x, z, hillHeight, waterLevel = -0.05) {
  const tx = Math.min(world.cols - 1, Math.max(0, Math.floor(x))),
    tz = Math.min(world.rows - 1, Math.max(0, Math.floor(z)));
  const tile = world.tiles[tz * world.cols + tx];
  if (tile?.terrain === "river" || tile?.terrain === "lake") return waterLevel;
  if (tile?.terrain !== "hill") return 0;
  const h = (a, b) =>
    world.tiles[b * world.cols + a]?.terrain === "hill" &&
    a >= 0 &&
    a < world.cols &&
    b >= 0 &&
    b < world.rows
      ? hillHeight(world, a, b)
      : null;
  const center = h(tx, tz);
  const corner = (a, b) => {
    const v = [h(a - 1, b - 1), h(a, b - 1), h(a - 1, b), h(a, b)];
    return v.every((n) => n !== null) ? v.reduce((s, n) => s + n, 0) / 4 : 0;
  };
  const edge = (a, b) => {
    const v = h(a, b);
    return v === null ? 0 : (center + v) / 2;
  };
  const heights = [
    [corner(tx, tz), edge(tx, tz - 1), corner(tx + 1, tz)],
    [edge(tx - 1, tz), center, edge(tx + 1, tz)],
    [corner(tx, tz + 1), edge(tx, tz + 1), corner(tx + 1, tz + 1)],
  ];
  const u = Math.max(0, Math.min(1, x - tx)) * 2,
    v = Math.max(0, Math.min(1, z - tz)) * 2;
  const ix = Math.min(1, Math.floor(u)),
    iz = Math.min(1, Math.floor(v)),
    fx = smooth(u - ix),
    fz = smooth(v - iz);
  return mix(
    mix(heights[iz][ix], heights[iz][ix + 1], fx),
    mix(heights[iz + 1][ix], heights[iz + 1][ix + 1], fx),
    fz,
  );
}
export function makeTerrain(world, heightAt, colorOf) {
  const pos = [],
    colors = [],
    indices = [],
    ranges = [];
  const n = 6;
  const water = (x, z) => {
    const t = world.tiles[z * world.cols + x]?.terrain;
    return (
      x >= 0 &&
      z >= 0 &&
      x < world.cols &&
      z < world.rows &&
      (t === "river" || t === "lake")
    );
  };
  const colorCache = {};
  const rgb = (t) =>
    colorCache[t] || (colorCache[t] = new THREE.Color(colorOf(t)));
  function groundColor(x, z) {
    const tx = Math.floor(x - 0.5),
      tz = Math.floor(z - 0.5),
      u = smooth(x - 0.5 - tx),
      v = smooth(z - 0.5 - tz);
    const at = (a, b) => {
      a = Math.max(0, Math.min(world.cols - 1, a));
      b = Math.max(0, Math.min(world.rows - 1, b));
      const t = world.tiles[b * world.cols + a]?.terrain;
      return rgb(["river", "lake", "hill"].includes(t) ? "grass" : t);
    };
    const c = at(tx, tz)
      .clone()
      .lerp(at(tx + 1, tz), u)
      .lerp(
        at(tx, tz + 1)
          .clone()
          .lerp(at(tx + 1, tz + 1), u),
        v,
      );
    return c.multiplyScalar(
      1 +
        0.035 * Math.sin(x * 1.72 + Math.sin(z * 1.4)) +
        0.025 * Math.sin(z * 2.1 + x * 0.8),
    );
  }
  for (let z = 0; z < world.rows; z++)
    for (let x = 0; x < world.cols; x++) {
      if (water(x, z)) continue;
      const start = pos.length / 3;
      for (let j = 0; j <= n; j++)
        for (let i = 0; i <= n; i++) {
          const px = x + i / n,
            pz = z + j / n;
          let y = heightAt(
            px === world.cols ? px - 1e-8 : px,
            pz === world.rows ? pz - 1e-8 : pz,
          );
          const d = Math.min(
            water(x - 1, z) ? i / n : 1,
            water(x + 1, z) ? 1 - i / n : 1,
            water(x, z - 1) ? j / n : 1,
            water(x, z + 1) ? 1 - j / n : 1,
          );
          if (d < 0.2) y -= 0.065 * (1 - smooth(d / 0.2));
          pos.push(px, y, pz);
          const c = groundColor(px, pz);
          colors.push(c.r, c.g, c.b);
        }
      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
          const a = start + j * (n + 1) + i,
            b = a + 1,
            c = a + n + 1,
            d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      for (const [side, outer] of [
        [0, z === 0 || water(x, z - 1)],
        [1, x === world.cols - 1 || water(x + 1, z)],
        [2, z === world.rows - 1 || water(x, z + 1)],
        [3, x === 0 || water(x - 1, z)],
      ]) {
        if (!outer) continue;
        for (let k = 0; k < n; k++) {
          const ai =
            side === 0
              ? start + k
              : side === 1
                ? start + k * (n + 1) + n
                : side === 2
                  ? start + n * (n + 1) + k
                  : start + k * (n + 1);
          const bi = ai + (side === 0 || side === 2 ? 1 : n + 1),
            v = pos.length / 3;
          for (const [i, bottom] of [
            [ai, false],
            [bi, false],
            [ai, true],
            [bi, true],
          ]) {
            pos.push(
              pos[i * 3],
              bottom ? -0.13 : pos[i * 3 + 1],
              pos[i * 3 + 2],
            );
            const c = groundColor(pos[i * 3], pos[i * 3 + 2]).multiplyScalar(
              bottom ? 0.72 : 0.95,
            );
            colors.push(c.r, c.g, c.b);
          }
          indices.push(
            v,
            v + 1,
            v + 2,
            v + 1,
            v + 3,
            v + 2,
            v + 2,
            v + 1,
            v,
            v + 2,
            v + 3,
            v + 1,
          );
        }
      }
      ranges.push({
        tile: z * world.cols + x,
        start,
        count: pos.length / 3 - start,
      });
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute(
    "aLayer",
    new THREE.Float32BufferAttribute(
      new Float32Array(pos.length / 3).fill(-1),
      1,
    ),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return { geometry, ranges, base: Float32Array.from(colors) };
}
