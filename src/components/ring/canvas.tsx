"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { RingScene } from "./scene";
import type { RingConfig } from "@/lib/types";

export function RingCanvas({ config, view, onReady }: { config: RingConfig; view: "out" | "in"; onReady: () => void }) {
  const narrow = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas
      className="h-full w-full touch-none"
      dpr={narrow ? [1, 1.15] : [1, 1.5]}
      camera={{ position: [18, 12, 28], fov: 30, near: 0.1, far: 400 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.02;
        gl.setClearColor(0xf3f0ea, 1);
        onReady();
      }}
    >
      <Suspense fallback={null}>
        <RingScene config={config} view={view} bounces={narrow ? 2 : 3} smallBounces={narrow ? 1 : 2} />
      </Suspense>
    </Canvas>
  );
}
