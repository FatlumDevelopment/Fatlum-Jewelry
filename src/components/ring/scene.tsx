"use client";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { bandGeometry, caratDiameter, clawGeometry, gemGeometry, shapeScale } from "./geometry";
import { metalByCode } from "@/lib/ring-config";
import type { RingConfig } from "@/lib/types";

function studioScene() {
  const room = new THREE.Scene();
  const panel = (color: string, intensity: number, w: number, h: number, x: number, y: number, z: number, rx = 0, ry = 0) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, side: THREE.DoubleSide, roughness: 1 }),
    );
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, 0);
    room.add(mesh);
  };
  panel("#fff8ee", 1.6, 14, 10, 0, 7, 0, -Math.PI / 2, 0);
  panel("#ffffff", 3.2, 5, 7, 5.5, 2.5, 4, 0, -0.7);
  panel("#d7e4f4", 1.1, 7, 7, -6, 1.5, 2, 0, 0.8);
  panel("#fffdf8", 2.4, 3, 4, -1, 3, -6, 0, Math.PI);
  panel("#c9b59a", 0.35, 16, 16, 0, -5, 0, Math.PI / 2, 0);
  return room;
}

function Studio() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = studioScene();
    const tex = pmrem.fromScene(room, 0.02).texture;
    scene.environment = tex;
    scene.environmentIntensity = 1.05;
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
    color: "#f7fbff",
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    thickness: 2.4,
    ior: 2.42,
    dispersion: 0.25,
    iridescence: 0.35,
    iridescenceIOR: 1.4,
    iridescenceThicknessRange: [100, 400],
    flatShading: true,
    envMapIntensity: 2.6,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    attenuationColor: "#e4eefc",
    attenuationDistance: 2.5,
  }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  const [sx, sy, sz] = shapeScale(config.shape);
  const claws = useMemo(() => clawGeometry(), []);
  const prongs = config.shape === "round" || config.shape === "oval" ? 6 : config.shape === "pear" ? 3 : 4;
  const halo = config.setting === "halo";
  const metal = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: metalColor,
    metalness: 1,
    roughness: 0.22,
    envMapIntensity: 1.15,
    clearcoat: 0.15,
    clearcoatRoughness: 0.3,
  }), [metalColor]);
  useEffect(() => () => metal.dispose(), [metal]);
  return (
    <group scale={[diameter * sx, diameter * sy, diameter * sz]}>
      <mesh geometry={geo} material={mat} castShadow />
      {Array.from({ length: prongs }, (_, i) => {
        const a = (i / prongs) * Math.PI * 2 + (prongs === 4 ? Math.PI / 4 : prongs === 3 ? -Math.PI / 2 : 0);
        return <mesh key={i} geometry={claws} material={metal} rotation={[0, -a + Math.PI / 2, 0]} />;
      })}
      <mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]} material={metal}>
        <torusGeometry args={[0.28, 0.028, 12, 40]} />
      </mesh>
      {halo && Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <mesh key={`h${i}`} geometry={small} material={mat} position={[Math.cos(a) * 0.78, 0.04, Math.sin(a) * 0.78]} scale={0.22} />;
      })}
      {halo && (
        <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={metal}>
          <torusGeometry args={[0.78, 0.04, 10, 48]} />
        </mesh>
      )}
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
  const gemMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#f7fbff",
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    thickness: 0.8,
    ior: 2.42,
    dispersion: 0.2,
    flatShading: true,
    envMapIntensity: 2.4,
  }), []);
  useEffect(() => () => gemMat.dispose(), [gemMat]);
  const color = useMemo(() => new THREE.Color(metal.color), [metal.color]);
  const diameter = config.mode === "finished" ? caratDiameter(config.carat) : 0;
  const scale = useRef(diameter || 1);
  const group = useRef<THREE.Group>(null);
  const tex = useEngraving(config.engraving);
  useEffect(() => () => tex?.dispose(), [tex]);
  const ringRef = useRef<THREE.Group>(null);
  const spinning = useRef(true);
  const smallGem = useMemo(() => gemGeometry("round"), []);
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
    if (spinning.current && ringRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ringRef.current.rotation.y += dt * 0.18;
    }
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
        {config.mode === "finished" && config.setting === "pave" && Array.from({ length: 6 }, (_, i) => {
          const a = paveStart + i * 0.13;
          return [-a, a].map((angle) => (
            <mesh key={`${i}-${angle}`} geometry={smallGem} material={gemMat} position={[Math.sin(angle) * paveR, Math.cos(angle) * paveR, 0]} scale={1.15} />
          ));
        })}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -(outer + 0.4), 0]}>
        <planeGeometry args={[outer * 3.2, outer * 3.2]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
      <OrbitControls makeDefault enablePan={false} enableDamping minDistance={4} maxDistance={80} onStart={() => { spinning.current = false; }} />
    </>
  );
}
