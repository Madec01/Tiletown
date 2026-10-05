// Coloration géographique commune au sol, à l'eau, aux bâtiments et aux rues.
// Une texture par carte, partagée entre les matériaux : aucun appel de dessin supplémentaire.
import * as THREE from 'three';
import { layerRampColor, layerNormalized } from './layers.js';

export function createAnalysis() {
  const uniforms = {
    ttAnalysis: { value: 0 }, ttAnalysisPattern: { value: 0 },
    ttAnalysisMap: { value: null }, ttAnalysisSize: { value: new THREE.Vector2(1, 1) },
  };
  const attached = new WeakSet();
  let texture = null;
  function attach(group) {
    group.traverse(node => {
      for (const material of [node.material].flat().filter(Boolean)) {
        if (attached.has(material)) continue;
        attached.add(material);
        const before = material.onBeforeCompile.bind(material);
        const key = material.customProgramCacheKey();
        material.onBeforeCompile = (shader, renderer) => {
          before(shader, renderer);
          Object.assign(shader.uniforms, uniforms);
          shader.vertexShader = 'varying vec3 ttWorld;\n' + shader.vertexShader.replace('#include <project_vertex>', `
            #include <project_vertex>
            vec4 ttPosition = vec4(transformed, 1.0);
            #ifdef USE_BATCHING
              ttPosition = batchingMatrix * ttPosition;
            #endif
            #ifdef USE_INSTANCING
              ttPosition = instanceMatrix * ttPosition;
            #endif
            ttWorld = (modelMatrix * ttPosition).xyz;
          `);
          shader.fragmentShader = `
            varying vec3 ttWorld;
            uniform float ttAnalysis;
            uniform float ttAnalysisPattern;
            uniform sampler2D ttAnalysisMap;
            uniform vec2 ttAnalysisSize;
          ` + shader.fragmentShader.replace('#include <tonemapping_fragment>', `
            #include <tonemapping_fragment>
            if (ttAnalysis > 0.5) {
              vec4 field = texture2D(ttAnalysisMap, ttWorld.xz / ttAnalysisSize);
              // Le relief reste lisible, sans que l'éclairage chaud déforme la légende.
              float light = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
              float relief = 0.45 + 0.55 * clamp(light * 1.7, 0.25, 1.0);
              gl_FragColor.rgb = mix(gl_FragColor.rgb, field.rgb * relief, 0.92);
              if (ttAnalysisPattern > 0.5) {
                float band = floor(min(field.a, 0.999) * 5.0);
                float stroke = step(0.78, fract((ttWorld.x + ttWorld.z) * (band + 1.0) * 1.5));
                gl_FragColor.rgb *= 1.0 - stroke * step(0.5, band) * 0.32;
              }
            }
          `);
        };
        material.customProgramCacheKey = () => key + '|tiletown-analysis-1';
        material.needsUpdate = true;
      }
    });
  }
  function set(world, kind, values) {
    const active = world && kind !== 'none' && values?.length;
    uniforms.ttAnalysis.value = active ? 1 : 0;
    if (!active) return;
    const { cols, rows } = world;
    if (!texture || texture.image.width !== cols || texture.image.height !== rows) {
      texture?.dispose();
      texture = new THREE.DataTexture(new Uint8Array(cols * rows * 4), cols, rows);
      texture.magFilter = texture.minFilter = THREE.LinearFilter;
      uniforms.ttAnalysisMap.value = texture;
      uniforms.ttAnalysisSize.value.set(cols, rows);
    }
    const c = new THREE.Color(), data = texture.image.data;
    for (let i = 0; i < cols * rows; i++) {
      // Les mesures du moteur sont toujours sur 100, même si toute la carte est sous 1.
      const value = layerNormalized(values[i], 100);
      c.set(layerRampColor(kind, value));
      data[i * 4] = Math.round(c.r * 255);
      data[i * 4 + 1] = Math.round(c.g * 255);
      data[i * 4 + 2] = Math.round(c.b * 255);
      data[i * 4 + 3] = Math.round(value * 255);
    }
    texture.needsUpdate = true;
  }
  return { attach, set, setPattern: on => { uniforms.ttAnalysisPattern.value = on ? 1 : 0; }, dispose: () => texture?.dispose() };
}
