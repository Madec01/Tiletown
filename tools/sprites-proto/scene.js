import * as THREE from 'three';
// Scène de test : rendu orthographique 3/4 d'un « îlot » (maison + arbre), fond transparent, ombres douces.
const SIZE = 256, SCALE = 2; // 2 échelles : 1x et 2x
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(SCALE);
renderer.setSize(SIZE, SIZE);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cam = new THREE.OrthographicCamera(-1.6, 1.6, 1.6, -1.6, 0.1, 100);
cam.position.set(10, 10 * Math.tan(THREE.MathUtils.degToRad(35.264)), 10); // 3/4 isométrique vrai
cam.lookAt(0, 0.3, 0);
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(4, 8, 2); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = sun.shadow.camera.bottom = -2; sun.shadow.camera.right = sun.shadow.camera.top = 2;
scene.add(sun, new THREE.AmbientLight(0xffffff, 0.8));
const ground = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 2), new THREE.MeshStandardMaterial({ color: 0x8fcf6a }));
ground.position.y = -0.1; ground.receiveShadow = true; scene.add(ground);
const house = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), new THREE.MeshStandardMaterial({ color: 0xf4e3c1 }));
house.position.set(-0.3, 0.3, -0.2); house.castShadow = true; scene.add(house);
const roof = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0xd9654b }));
roof.position.set(-0.3, 0.85, -0.2); roof.rotation.y = Math.PI / 4; roof.castShadow = true; scene.add(roof);
const tree = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), new THREE.MeshStandardMaterial({ color: 0x3f9b4f }));
tree.position.set(0.55, 0.5, 0.45); tree.castShadow = true; scene.add(tree);
const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x6b4a2b }));
trunk.position.set(0.55, 0.15, 0.45); trunk.castShadow = true; scene.add(trunk);
// Mesure : 8 directions (rotation de la scène par pas de 45°) puis dataURL
const t0 = performance.now();
const frames = [];
for (let i = 0; i < 8; i++) { scene.rotation.y = i * Math.PI / 4; renderer.render(scene, cam); frames.push(renderer.domElement.toDataURL('image/png').length); }
const gl = renderer.getContext();
const dbg = gl.getExtension('WEBGL_debug_renderer_info');
window.__result = {
  renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
  webgl2: renderer.capabilities.isWebGL2, msaaSamples: gl.getParameter(gl.SAMPLES),
  ms8dirs: Math.round(performance.now() - t0), pngDataUrlLen: frames,
};
window.__png = renderer.domElement.toDataURL('image/png');
