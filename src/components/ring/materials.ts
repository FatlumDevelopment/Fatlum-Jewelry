import * as THREE from "three";
import { metalByCode } from "@/lib/ring-config";

/** Subtle polish micro-variation for believable metal highlights. */
function polishRoughnessMap(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n =
        Math.sin(x * 0.31 + y * 0.17) * 0.04 +
        Math.sin(x * 0.71 - y * 0.53) * 0.03 +
        (Math.random() - 0.5) * 0.02;
      const v = Math.floor(THREE.MathUtils.clamp(128 + n * 140, 96, 172));
      const i = (y * size + x) * 4;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

const roughnessCache = new Map<number, THREE.CanvasTexture>();

export function createMetalMaterial(code: string): THREE.MeshPhysicalMaterial {
  const alloy = metalByCode(code);
  const fineness = Number(alloy.fineness);
  const yellow = alloy.group === "yellow";
  const rose = alloy.group === "rose";
  const platinum = alloy.group === "platinum";
  const base = new THREE.Color(alloy.color);
  if (yellow && fineness >= 750) base.lerp(new THREE.Color("#c8960c"), 0.12);
  if (rose && fineness >= 750) base.lerp(new THREE.Color("#d4927a"), 0.08);
  if (platinum) base.multiplyScalar(1.02);

  const mapKey = fineness * 100 + (yellow ? 1 : rose ? 2 : platinum ? 3 : 0);
  let roughMap = roughnessCache.get(mapKey);
  if (!roughMap) {
    roughMap = polishRoughnessMap();
    roughnessCache.set(mapKey, roughMap);
  }

  return new THREE.MeshPhysicalMaterial({
    color: base,
    metalness: 1,
    roughness: alloy.roughness,
    roughnessMap: roughMap,
    envMapIntensity: platinum ? 1.55 : 1.85,
    clearcoat: 0.28,
    clearcoatRoughness: 0.035,
    reflectivity: 1,
    ior: platinum ? 1.38 : 1.45,
  });
}

export const GEM_IOR = 2.417;
export const GEM_ABERRATION = 0.018;
export const GEM_FRESNEL = 0.22;