"use client";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { ContactShadows, Environment, MeshRefractionMaterial, OrbitControls, useEnvironment } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { cubeUvReflectionFragment } from "./cube-uv-chunk";

(THREE.ShaderChunk as Record<string, string>).cube_uv_reflection_fragment = cubeUvReflectionFragment;
import { bandGeometry, caratDiameter, galleryGeometry, gemGeometry, prongGeometry } from "./geometry";
import { metalByCode } from "@/lib/ring-config";
import type { RingConfig } from "@/lib/types";

const HDR = "/hdri/studio_contrast.hdr";

function Gem({ geometry, envMap, bounces, scale = 1, position, quaternion }: {
  geometry: THREE.BufferGeometry;
  envMap: THREE.Texture;
  bounces: number;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  quaternion?: THREE.Quaternion;
}) {
  return (
    <mesh geometry={geometry} scale={scale} position={position} quaternion={quaternion}>
      <MeshRefractionMaterial envMap={envMap} bounces={bounces} ior={2.42} aberrationStrength={0.02} fresnel={0.35} fastChroma color="#ffffff" />
    </mesh>
  );
}

function useEngraving(text: string) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 256;
    const g = canvas.getContext("2d");
    if (!g || !text) return null;
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = "#2a241c";
    g.font = "500 96px 'Cormorant Garamond', Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, canvas.width / 2, canvas.height / 2 + 4);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [text]);
}

function FitView({ view, root, revision }: { view: "out" | "in"; root: RefObject<THREE.Group | null>; revision: string }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const viewport = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as { target: THREE.Vector3; update: () => void; minDistance: number; maxDistance: number } | null;
  useEffect(() => {
    let frame = 0;
    const fit = () => {
      const group = root.current;
      if (!group) return;
      group.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(group);
      if (box.isEmpty()) return;
      const look = box.getCenter(new THREE.Vector3());
      if (view === "in") look.y -= box.getSize(new THREE.Vector3()).y * 0.15;
      const corners = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z),
      ];
      const narrow = viewport.width < 768;
      const limitY = narrow ? 0.88 : 0.74;
      const limitX = 0.9;
      const dir = (view === "in" ? new THREE.Vector3(0.04, -0.12, 1) : new THREE.Vector3(0.18, 0.46, 1)).normalize();
      const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
      let lo = radius * 0.4;
      let hi = radius * 24;
      for (let step = 0; step < 18; step++) {
        const dist = (lo + hi) / 2;
        camera.position.copy(look).add(dir.clone().multiplyScalar(dist));
        camera.near = Math.max(0.04, dist / 120);
        camera.far = dist * 40;
        camera.lookAt(look);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        let maxX = 0;
        let maxY = 0;
        for (const corner of corners) {
          const projected = corner.clone().project(camera);
          maxX = Math.max(maxX, Math.abs(projected.x));
          maxY = Math.max(maxY, Math.abs(projected.y));
        }
        if (Math.max(maxY / limitY, maxX / limitX) > 1) lo = dist;
        else hi = dist;
      }
      const dist = hi;
      camera.position.copy(look).add(dir.clone().multiplyScalar(dist));
      camera.near = Math.max(0.04, dist / 120);
      camera.far = dist * 40;
      camera.lookAt(look);
      camera.updateProjectionMatrix();
      if (controls) {
        controls.minDistance = Math.max(1.5, dist * 0.4);
        controls.maxDistance = dist * 2.6;
        controls.target.copy(look);
        controls.update();
      }
    };
    frame = requestAnimationFrame(() => { fit(); frame = requestAnimationFrame(fit); });
    return () => cancelAnimationFrame(frame);
  }, [camera, controls, revision, root, view, viewport.height, viewport.width]);
  return null;
}

function Head({ config, envMap, bounces, smallBounces, metal }: {
  config: RingConfig;
  envMap: THREE.Texture;
  bounces: number;
  smallBounces: number;
  metal: THREE.Material;
}) {
  const geo = useMemo(() => gemGeometry(config.shape), [config.shape]);
  const small = useMemo(() => gemGeometry("round"), []);
  const prong = useMemo(() => prongGeometry(), []);
  const gallery = useMemo(() => galleryGeometry(), []);
  const count = 4;
  const halo = config.setting === "halo";
  const melee = 0.2;
  const haloRadius = 0.5 + melee * 0.46;
  const haloCount = 20;
  return (
    <group>
      <Gem geometry={geo} envMap={envMap} bounces={bounces} />
      <mesh geometry={gallery} material={metal} />
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.PI / 4;
        return (
          <group key={i} rotation={[0, -a, 0]}>
            <mesh geometry={prong} material={metal} />
            <mesh position={[0.42, 0.075, 0]} material={metal}>
              <sphereGeometry args={[0.062, 16, 12]} />
            </mesh>
          </group>
        );
      })}
      {halo && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={metal}>
          <torusGeometry args={[haloRadius + melee * 0.42, 0.02, 10, 64]} />
        </mesh>
      )}
      {halo && Array.from({ length: haloCount }, (_, i) => {
        const a = (i / haloCount) * Math.PI * 2;
        return (
          <Gem
            key={`h${i}`}
            geometry={small}
            envMap={envMap}
            bounces={smallBounces}
            scale={melee}
            position={[Math.cos(a) * haloRadius, 0.03, Math.sin(a) * haloRadius]}
          />
        );
      })}
    </group>
  );
}

export function RingScene({ config, view, bounces, smallBounces }: { config: RingConfig; view: "out" | "in"; bounces: number; smallBounces: number }) {
  const alloy = metalByCode(config.metal);
  const inner = config.size_mm / (2 * Math.PI);
  const width = config.mode === "blank" ? config.width_mm : 1.9;
  const thickness = config.mode === "blank" ? 1.7 : 1.7;
  const outer = inner + thickness;
  const band = useMemo(() => bandGeometry(inner, width, thickness), [inner, width, thickness]);
  useEffect(() => () => band.dispose(), [band]);
  const metal = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: alloy.color,
    metalness: 1,
    roughness: alloy.roughness,
    envMapIntensity: 1.75,
  }), [alloy.color, alloy.roughness]);
  useEffect(() => () => metal.dispose(), [metal]);
  const envMap = useEnvironment({ files: HDR });
  const diameter = config.mode === "finished" ? caratDiameter(config.carat) : 0;
  const tex = useEngraving(config.engraving);
  useEffect(() => () => tex?.dispose(), [tex]);
  const ringRef = useRef<THREE.Group>(null);
  const smallGem = useMemo(() => gemGeometry("round"), []);
  const pave = useMemo(() => {
    if (config.mode !== "finished" || config.setting !== "pave" || diameter <= 0) return [];
    const melee = 1.15;
    const radius = outer + melee * 0.02;
    const clear = Math.asin(Math.min(0.9, (diameter * 0.62) / radius));
    const step = (melee + 0.22) / radius;
    const stones: { position: [number, number, number]; quaternion: THREE.Quaternion }[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < 6; i++) {
      const angle = clear + step * (i + 0.35);
      for (const sign of [1, -1]) {
        const a = angle * sign;
        const dir = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
        stones.push({
          position: [dir.x * radius, dir.y * radius, 0],
          quaternion: new THREE.Quaternion().setFromUnitVectors(up, dir),
        });
      }
    }
    return stones;
  }, [config.mode, config.setting, diameter, outer]);

  const pose: [number, number, number] = view === "in" ? [0.4, 0.15, 0] : [0.32, -0.55, 0];

  return (
    <>
      <Environment files={HDR} environmentIntensity={1.15} environmentRotation={[0, 0.35, 0]} />
      <FitView view={view} root={ringRef} revision={`${config.mode}-${config.size_mm}-${config.width_mm}-${config.carat}-${config.shape}-${config.setting}-${view}`} />
      <ambientLight intensity={0.06} />
      <group ref={ringRef} rotation={pose}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={band} material={metal} />
          {config.mode === "finished" && tex && (
            <mesh rotation={[0, Math.PI, 0]}>
              <cylinderGeometry args={[inner - 0.02, inner - 0.02, width * 0.62, 80, 1, true]} />
              <meshBasicMaterial map={tex} transparent alphaTest={0.05} side={THREE.BackSide} depthWrite={false} />
            </mesh>
          )}
        </group>
        {config.mode === "finished" && (
          <group position={[0, outer + diameter * 0.46, 0]} scale={diameter}>
            <Head config={config} envMap={envMap} bounces={bounces} smallBounces={smallBounces} metal={metal} />
          </group>
        )}
        {pave.map((stone, index) => (
          <Gem key={`p${index}`} geometry={smallGem} envMap={envMap} bounces={smallBounces} scale={1.15} position={stone.position} quaternion={stone.quaternion} />
        ))}
      </group>
      <ContactShadows position={[0, -(outer + 0.2), 0]} opacity={0.28} scale={outer * 5} blur={2.6} far={outer * 2} color="#3a342c" />
      <OrbitControls makeDefault enablePan={false} enableDamping />
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom intensity={0.42} luminanceThreshold={0.86} luminanceSmoothing={0.18} mipmapBlur />
      </EffectComposer>
    </>
  );
}
