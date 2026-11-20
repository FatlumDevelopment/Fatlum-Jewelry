"use client";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { bandGeometry, caratDiameter, gemGeometry, shapeScale } from "./geometry";
import { metalByCode } from "@/lib/ring-config";
import type { RingConfig } from "@/lib/types";

function Studio() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const tex = pmrem.fromScene(room, 0.04).texture;
    scene.environment = tex;
    scene.environmentIntensity = 1.15;
    pmrem.dispose();
    return () => {
      tex.dispose();
      scene.environment = null;
      room.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((item) => item.dispose());
        else mat?.dispose?.();
      });
    };
  }, [gl, scene]);
  return null;
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
      const center = box.getCenter(new THREE.Vector3());
      const dims = box.getSize(new THREE.Vector3());
      const aspect = viewport.width / Math.max(viewport.height, 1);
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
      const distV = (dims.y / 2) / Math.tan(vFov / 2);
      const distH = (dims.x / 2) / Math.tan(hFov / 2);
      const padding = view === "in" ? 1.15 : 1.42;
      const dist = Math.max(distV, distH, dims.z * 0.65) * padding;
      const dir = view === "in"
        ? new THREE.Vector3(0, 0.2, 1)
        : new THREE.Vector3(0.7, 0.32, 0.95);
      dir.normalize();
      const look = view === "in" ? center.clone().add(new THREE.Vector3(0, -dims.y * 0.2, 0)) : center;
      camera.position.copy(look).add(dir.multiplyScalar(dist));
      camera.near = Math.max(0.05, dist / 80);
      camera.far = dist * 40;
      camera.updateProjectionMatrix();
      if (controls) {
        controls.minDistance = Math.max(2, dist * 0.5);
        controls.maxDistance = dist * 3;
        controls.target.copy(look);
        controls.update();
      } else {
        camera.lookAt(look);
      }
    };
    frame = requestAnimationFrame(() => { fit(); frame = requestAnimationFrame(fit); });
    return () => cancelAnimationFrame(frame);
  }, [camera, controls, revision, root, view, viewport.height, viewport.width]);
  return null;
}

function Stones({ config, diameter, metalColor }: { config: RingConfig; diameter: number; metalColor: string }) {
  const geo = useMemo(() => gemGeometry(config.shape), [config.shape]);
  const small = useMemo(() => gemGeometry("round"), []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#f4f7fb",
    metalness: 0,
    roughness: 0.04,
    transmission: 1,
    thickness: 1.8,
    ior: 2.42,
    flatShading: true,
    envMapIntensity: 2.2,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    attenuationColor: "#e7eef8",
    attenuationDistance: 4,
    side: THREE.FrontSide,
  }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  const [sx, sy, sz] = shapeScale(config.shape);
  const prongs = config.shape === "round" || config.shape === "oval" ? 6 : 4;
  const halo = config.setting === "halo";
  const pave = config.setting === "pave";
  return (
    <group scale={[diameter * sx, diameter * sy, diameter * sz]}>
      <mesh geometry={geo} material={mat} />
      {Array.from({ length: prongs }, (_, i) => {
        const a = (i / prongs) * Math.PI * 2 + (prongs === 4 ? Math.PI / 4 : 0);
        return (
          <mesh key={i} position={[Math.cos(a) * 0.48, -0.02, Math.sin(a) * 0.48]} rotation={[0, -a, 0]}>
            <cylinderGeometry args={[0.028, 0.02, 0.34, 8]} />
            <meshPhysicalMaterial color={metalColor} metalness={1} roughness={0.18} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.035, 12, 40]} />
        <meshPhysicalMaterial color={metalColor} metalness={1} roughness={0.2} />
      </mesh>
      {halo && Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <mesh key={`h${i}`} geometry={small} material={mat} position={[Math.cos(a) * 0.74, 0.02, Math.sin(a) * 0.74]} scale={0.26} />;
      })}
      {halo && (
        <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.74, 0.045, 10, 48]} />
          <meshPhysicalMaterial color={metalColor} metalness={1} roughness={0.18} />
        </mesh>
      )}
      {pave && null}
    </group>
  );
}

export function RingScene({ config, view }: { config: RingConfig; view: "out" | "in" }) {
  const metal = metalByCode(config.metal);
  const inner = config.size_mm / (2 * Math.PI);
  const width = config.mode === "blank" ? config.width_mm : 1.9;
  const thickness = config.mode === "blank" ? 1.7 : 1.55;
  const outer = inner + thickness;
  const band = useMemo(() => bandGeometry(inner, width, thickness), [inner, width, thickness]);
  useEffect(() => () => band.dispose(), [band]);
  const metalMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: metal.color,
    metalness: 1,
    roughness: metal.roughness,
    envMapIntensity: 1.2,
    clearcoat: 0.25,
    clearcoatRoughness: 0.25,
  }), [metal.color, metal.roughness]);
  useEffect(() => () => metalMat.dispose(), [metalMat]);
  const color = useMemo(() => new THREE.Color(metal.color), [metal.color]);
  const diameter = config.mode === "finished" ? caratDiameter(config.carat) : 0;
  const scale = useRef(diameter || 1);
  const group = useRef<THREE.Group>(null);
  const tex = useEngraving(config.engraving);
  useEffect(() => () => tex?.dispose(), [tex]);
  const ringRef = useRef<THREE.Group>(null);
  const shadow = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const g = canvas.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 10, 64, 64, 62);
    grd.addColorStop(0, "rgba(28,24,20,0.22)");
    grd.addColorStop(1, "rgba(28,24,20,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const map = new THREE.CanvasTexture(canvas);
    return map;
  }, []);
  useEffect(() => () => shadow.dispose(), [shadow]);

  useFrame((_, dt) => {
    metalMat.color.lerp(color, 1 - Math.pow(0.001, dt));
    metalMat.roughness = THREE.MathUtils.damp(metalMat.roughness, metal.roughness, 4, dt);
    if (config.mode === "finished" && group.current) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      scale.current = reduce ? diameter : THREE.MathUtils.damp(scale.current, diameter, 5, dt);
      const d = Math.max(scale.current, 0.4);
      group.current.scale.setScalar(d / Math.max(diameter, 0.4));
      group.current.position.y = outer + d * 0.12;
    }
  });

  const paveR = inner + thickness * 0.65;
  const head = diameter * 0.55;
  const paveStart = Math.max(0.42, Math.asin(Math.min(0.95, head / Math.max(paveR, 1))));

  return (
    <>
      <Studio />
      <FitView view={view} root={ringRef} revision={`${config.mode}-${config.size_mm}-${config.width_mm}-${config.carat}-${config.shape}-${config.setting}`} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#f4f7ff", "#c4b39a", 0.6]} />
      <directionalLight position={[8, 14, 8]} intensity={2.4} color="#fff6ea" />
      <directionalLight position={[-10, 6, -6]} intensity={0.7} color="#e4ecf8" />
      <spotLight position={[0, 18, 10]} intensity={12} angle={0.55} penumbra={0.85} />
      <group ref={ringRef} rotation={[0.22, -0.55, 0]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={band} material={metalMat} />
          {config.mode === "finished" && tex && (
            <mesh rotation={[0, Math.PI, 0]}>
              <cylinderGeometry args={[inner - 0.02, inner - 0.02, width * 0.62, 80, 1, true]} />
              <meshBasicMaterial map={tex} transparent alphaTest={0.05} side={THREE.BackSide} depthWrite={false} />
            </mesh>
          )}
        </group>
        {config.mode === "finished" && (
          <group ref={group} position={[0, outer + diameter * 0.12, 0]}>
            <Stones config={config} diameter={diameter} metalColor={metal.color} />
          </group>
        )}
        {config.mode === "finished" && config.setting === "pave" && Array.from({ length: 5 }, (_, i) => {
          const a = paveStart + i * 0.16;
          return [-a, a].map((angle) => (
            <mesh key={`${i}-${angle}`} position={[Math.sin(angle) * paveR, Math.cos(angle) * paveR, 0]} scale={1.15}>
              <octahedronGeometry args={[0.55, 0]} />
              <meshPhysicalMaterial color="#ffffff" metalness={0} roughness={0.05} transmission={1} thickness={0.6} ior={2.4} />
            </mesh>
          ));
        })}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -(outer + 0.4), 0]}>
        <planeGeometry args={[outer * 3.2, outer * 3.2]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
      <OrbitControls makeDefault enablePan={false} enableDamping minDistance={4} maxDistance={80} />
    </>
  );
}
