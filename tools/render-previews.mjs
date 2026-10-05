#!/usr/bin/env node
// Pré-rend les véritables GLB du catalogue pour les cartes de construction.
// Lancer le serveur local puis : node tools/render-previews.mjs [http://localhost:8000]
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
const base = process.argv[2] || "http://localhost:8000";
mkdirSync("assets/previews", { recursive: true });
const browser = await chromium.launch({
  args: [
    "--no-sandbox",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
try {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await page.goto(base + "/dev.html");
  await page.waitForFunction(() => window.__tiletown?.ready, null, {
    timeout: 60000,
  });
  const images = await page.evaluate(async () => {
    const THREE = await import("three");
    const { loadModels } = await import("/src/render3d/models.js");
    const { TILES } = await import("/src/data/tiles.js");
    const models = await loadModels("/assets/models/manifest.json");
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(280, 230);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xfff5e5, 0xb4c9a3, 1.65));
    const sun = new THREE.DirectionalLight(0xffefcf, 2.8);
    sun.position.set(-3, 7, 5);
    scene.add(sun);
    const camera = new THREE.OrthographicCamera(
      -0.8,
      0.8,
      0.66,
      -0.66,
      0.1,
      30,
    );
    camera.position.set(3, 2.8, 4);
    camera.lookAt(0, 0.22, 0);
    const out = {};
    for (const t of TILES) {
      const group = new THREE.Group();
      const model = models.resolve(t.models[1][0]);
      const mesh = new THREE.Mesh(model.geometry, model.material);
      group.add(mesh);
      if (t.id === "tree-planting" || t.id === "orchard") {
        mesh.scale.setScalar(0.65);
        mesh.position.x = -0.18;
        const second = mesh.clone();
        second.position.set(0.18, 0, 0.18);
        group.add(second);
      }
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.08, 0.9),
        new THREE.MeshLambertMaterial({
          color: t.family === "nature" ? "#a0b77b" : "#d3cba9",
        }),
      );
      base.position.y = -0.045;
      group.add(base);
      scene.add(group);
      const box = new THREE.Box3().setFromObject(group);
      const size = box.getSize(new THREE.Vector3());
      const width = Math.max(1.25, size.y * 1.25, size.x * 1.15);
      camera.left = -width * 0.66;
      camera.right = width * 0.66;
      camera.top = width * 0.55;
      camera.bottom = -width * 0.55;
      camera.position.set(3, 2.8, 4);
      camera.lookAt(0, size.y * 0.4, 0);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      out[t.id] = renderer.domElement.toDataURL("image/png").split(",")[1];
      scene.remove(group);
      base.geometry.dispose();
      base.material.dispose();
    }
    renderer.dispose();
    models.dispose();
    return out;
  });
  for (const [id, b64] of Object.entries(images)) {
    const png = `assets/previews/${id}.png`;
    writeFileSync(png, Buffer.from(b64, "base64"));
    execFileSync("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      png,
      "-quality",
      "88",
      `assets/previews/${id}.webp`,
    ]);
    unlinkSync(png);
  }
  console.log(Object.keys(images).length + " aperçus GLB rendus.");
} finally {
  await browser.close();
}
