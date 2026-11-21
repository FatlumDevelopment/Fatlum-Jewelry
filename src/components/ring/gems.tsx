"use client";
import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instance, Instances, MeshRefractionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { GEM_ABERRATION, GEM_FRESNEL, GEM_IOR } from "./materials";

export function CenterGem({
  geometry,
  envMap,
  bounces,
  scale = 1,
  position,
  quaternion,
}: {
  geometry: THREE.BufferGeometry;
  envMap: THREE.Texture;
  bounces: number;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  quaternion?: THREE.Quaternion;
}) {
  return (
    <mesh geometry={geometry} scale={scale} position={position} quaternion={quaternion}>
      <MeshRefractionMaterial
        envMap={envMap}
        bounces={bounces}
        ior={GEM_IOR}
        aberrationStrength={GEM_ABERRATION}
        fresnel={GEM_FRESNEL}
        fastChroma
        color="#ffffff"
        toneMapped={false}
      />
    </mesh>
  );
}

type MeleePlacement = {
  position: [number, number, number];
  scale?: number;
  quaternion?: THREE.Quaternion;
};

/** One draw call per batch — geometry is unit round brilliant; scale per Instance. */
export function MeleeGems({
  geometry,
  envMap,
  bounces,
  stones,
}: {
  geometry: THREE.BufferGeometry;
  envMap: THREE.Texture;
  bounces: number;
  stones: MeleePlacement[];
}) {
  if (stones.length === 0) return null;
  return (
    <Instances limit={stones.length} range={stones.length} geometry={geometry}>
      <MeshRefractionMaterial
        envMap={envMap}
        bounces={bounces}
        ior={GEM_IOR}
        aberrationStrength={GEM_ABERRATION * 0.85}
        fresnel={GEM_FRESNEL}
        fastChroma
        color="#ffffff"
        toneMapped={false}
      />
      {stones.map((stone, i) => (
        <Instance key={i} position={stone.position} scale={stone.scale ?? 1} quaternion={stone.quaternion} />
      ))}
    </Instances>
  );
}

export function SparkleGhosts({ radius = 0.22, height = 0.12 }: { radius?: number; height?: number }) {
  const group = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const g = group.current;
    if (!g) return;
    g.children.forEach((child, i) => {
      const a = (i / 8) * Math.PI * 2;
      child.position.set(Math.cos(a) * radius, height + Math.sin(a * 2) * 0.02, Math.sin(a) * radius);
    });
  }, [height, radius]);
  useFrame((_, dt) => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = group.current;
    if (!g) return;
    const t = performance.now() * 0.001;
    g.children.forEach((child, i) => {
      const flick = Math.sin(t * 9 + i * 1.7);
      child.visible = flick > 0.35;
      child.rotation.z += dt * 2.2;
      child.scale.setScalar(0.15 + Math.max(0, flick) * 0.45);
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} visible={false}>
          <planeGeometry args={[0.06, 0.06]} />
          <meshBasicMaterial color="#fffdf5" transparent opacity={0.95} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}