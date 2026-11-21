"use client";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useEnvironment } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { cubeUvReflectionFragment } from "./cube-uv-chunk";
import { CenterGem, MeleeGems, SparkleGhosts } from "./gems";
import {
  bandGeometry,
  caratDiameter,
  galleryGeometry,
  gemGeometry,
  meleeSeatGeometry,
  paveBeadGeometry,
  prongCount,
  prongGeometry,
} from "./geometry";
import { createMetalMaterial } from "./materials";
import type { RingConfig } from "@/lib/types";

(THREE.ShaderChunk as Record<string, string>).cube_uv_reflection_fragment = cubeUvReflectionFragment;

const HDR = "/hdri/studio_strips_v2.hdr";
const MELEE_SCALE = 0.17;

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
      if (view === "in") look.y -= box.getSize(new THREE.Vector3()).y * 0.12;
      const size = box.getSize(new THREE.Vector3());
      const radius = 0.5 * Math.max(size.x, size.y, size.z);
      const fill = view === "in" ? 0.66 : 0.84;
      const aspect = viewport.width / Math.max(viewport.height, 1);
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
      const dist = radius / (Math.tan(Math.min(hFov, vFov) / 2) * fill);
      const dir = (view === "in" ? new THREE.Vector3(0.04, -0.12, 1) : new THREE.Vector3(0.42, 0.38, 1)).normalize();
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
    frame = requestAnimationFrame(() => {
      fit();
      frame = requestAnimationFrame(fit);
    });
    return () => cancelAnimationFrame(frame);
  }, [camera, controls, revision, root, view, viewport.height, viewport.width]);
  return null;
}

function Head({
  config,
  envMap,
  bounces,
  smallBounces,
  metal,
}: {
  config: RingConfig;
  envMap: THREE.Texture;
  bounces: number;
  smallBounces: number;
  metal: THREE.Material;
}) {
  const geo = useMemo(() => gemGeometry(config.shape), [config.shape]);
  const roundMelee = useMemo(() => gemGeometry("round"), []);
  const prong = useMemo(() => prongGeometry(), []);
  const gallery = useMemo(() => galleryGeometry(), []);
  const seat = useMemo(() => meleeSeatGeometry(), []);
  const count = prongCount(config.shape);
  const halo = config.setting === "halo";
  const haloRadius = 0.5 + MELEE_SCALE * 0.52;
  const haloCount = 24;

  const haloStones = useMemo(() => {
    if (!halo) return [];
    return Array.from({ length: haloCount }, (_, i) => {
      const a = (i / haloCount) * Math.PI * 2;
      return {
        position: [Math.cos(a) * haloRadius, 0.02, Math.sin(a) * haloRadius] as [number, number, number],
        scale: MELEE_SCALE,
      };
    });
  }, [halo, haloCount, haloRadius]);

  return (
    <group>
      <CenterGem geometry={geo} envMap={envMap} bounces={bounces} />
      <SparkleGhosts />
      <mesh geometry={gallery} material={metal} />
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.PI / count;
        return (
          <group key={i} rotation={[0, -a, 0]}>
            <mesh geometry={prong} material={metal} />
          </group>
        );
      })}
      {halo && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} material={metal}>
            <torusGeometry args={[haloRadius + MELEE_SCALE * 0.38, 0.018, 12, 96]} />
          </mesh>
          {haloStones.map((stone, i) => {
            const a = (i / haloCount) * Math.PI * 2;
            return (
              <mesh
                key={`seat-${i}`}
                geometry={seat}
                material={metal}
                position={[Math.cos(a) * haloRadius, -0.01, Math.sin(a) * haloRadius]}
                scale={MELEE_SCALE * 1.05}
              />
            );
          })}
          <MeleeGems geometry={roundMelee} envMap={envMap} bounces={smallBounces} stones={haloStones} />
        </>
      )}
    </group>
  );
}

function PaveRow({
  config,
  outer,
  diameter,
  envMap,
  smallBounces,
  metal,
}: {
  config: RingConfig;
  outer: number;
  diameter: number;
  envMap: THREE.Texture;
  smallBounces: number;
  metal: THREE.Material;
}) {
  const roundMelee = useMemo(() => gemGeometry("round"), []);
  const bead = useMemo(() => paveBeadGeometry(), []);
  const { stones, beads } = useMemo(() => {
    if (config.mode !== "finished" || config.setting !== "pave" || diameter <= 0) {
      return { stones: [], beads: [] as [number, number, number][] };
    }
    const melee = MELEE_SCALE * 6.5;
    const radius = outer - melee * 0.12;
    const clear = Math.asin(Math.min(0.92, (diameter * 0.55) / radius));
    const step = (melee + 0.18) / radius;
    const stoneList: { position: [number, number, number]; scale: number; quaternion: THREE.Quaternion }[] = [];
    const beadList: [number, number, number][] = [];
    const up = new THREE.Vector3(0, 1, 0);
    const slots = 8;
    for (let i = 0; i < slots; i++) {
      const angle = clear + step * (i + 0.4);
      for (const sign of [1, -1] as const) {
        const a = angle * sign;
        const dir = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
        const pos: [number, number, number] = [dir.x * radius, dir.y * radius, dir.z * radius * 0.02];
        stoneList.push({
          position: pos,
          scale: melee,
          quaternion: new THREE.Quaternion().setFromUnitVectors(up, dir),
        });
        const tangent = new THREE.Vector3(Math.cos(a), -Math.sin(a), 0).multiplyScalar(melee * 0.55);
        beadList.push([pos[0] + tangent.x, pos[1] + tangent.y, pos[2] + 0.04]);
      }
    }
    return { stones: stoneList, beads: beadList };
  }, [config.mode, config.setting, diameter, outer]);

  return (
    <>
      {beads.map((pos, i) => (
        <mesh key={`bead-${i}`} geometry={bead} material={metal} position={pos} scale={0.35} />
      ))}
      <MeleeGems geometry={roundMelee} envMap={envMap} bounces={smallBounces} stones={stones} />
    </>
  );
}

export function RingScene({
  config,
  view,
  bounces,
  smallBounces,
  bloom,
}: {
  config: RingConfig;
  view: "out" | "in";
  bounces: number;
  smallBounces: number;
  bloom: boolean;
}) {
  const inner = config.size_mm / (2 * Math.PI);
  const width = config.mode === "blank" ? config.width_mm : 1.9;
  const thickness = 1.7;
  const outer = inner + thickness;
  const band = useMemo(() => bandGeometry(inner, width, thickness), [inner, width, thickness]);
  useEffect(() => () => band.dispose(), [band]);
  const metal = useMemo(() => createMetalMaterial(config.metal), [config.metal]);
  useEffect(() => () => metal.dispose(), [metal]);
  const envMap = useEnvironment({ files: HDR });
  const diameter = config.mode === "finished" ? caratDiameter(config.carat) : 0;
  const tex = useEngraving(config.engraving);
  useEffect(() => () => tex?.dispose(), [tex]);
  const ringRef = useRef<THREE.Group>(null);
  const spinning = useRef(true);

  const pose = useMemo<[number, number, number]>(() => (view === "in" ? [0.4, 0.15, 0] : [0.34, -0.62, 0]), [view]);
  const shadow = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const g = canvas.getContext("2d");
    if (!g) return null;
    const grd = g.createRadialGradient(128, 128, 6, 128, 128, 120);
    grd.addColorStop(0, "rgba(36,30,24,0.18)");
    grd.addColorStop(0.35, "rgba(36,30,24,0.05)");
    grd.addColorStop(0.7, "rgba(36,30,24,0)");
    grd.addColorStop(1, "rgba(36,30,24,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, []);
  useEffect(() => () => shadow?.dispose(), [shadow]);

  const revision = `${config.mode}-${config.size_mm}-${config.width_mm}-${config.carat}-${config.shape}-${config.setting}-${view}-${config.metal}`;

  useFrame((_, dt) => {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (spinning.current && view === "out" && ringRef.current && !reduced) {
      ringRef.current.rotation.y += dt * 0.18;
    }
  });

  return (
    <>
      <Environment files={HDR} environmentIntensity={1.05} environmentRotation={[0, 0.85, 0]} />
      <FitView view={view} root={ringRef} revision={revision} />
      <ambientLight intensity={0.015} />
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
        <PaveRow config={config} outer={outer} diameter={diameter} envMap={envMap} smallBounces={smallBounces} metal={metal} />
      </group>
      {shadow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -outer * 0.82, 0]}>
          <planeGeometry args={[outer * 1.75, outer * 1.75]} />
          <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.82} luminanceSmoothing={0.35} intensity={0.35} mipmapBlur />
        </EffectComposer>
      )}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.65}
        zoomSpeed={0.7}
        onStart={() => {
          spinning.current = false;
        }}
      />
    </>
  );
}