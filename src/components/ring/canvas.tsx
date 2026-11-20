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
      dpr={narrow ? [1, 1.1] : [1, 1.5]}
      camera={{ position: [26, 14, 36], fov: 32, near: 0.1, far: 220 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.setClearColor(0x000000, 0);
        onReady();
      }}
    >
      <Suspense fallback={null}>
        <RingScene config={config} view={view} bounces={narrow ? 2 : 3} smallBounces={narrow ? 1 : 2} />
      </Suspense>
    </Canvas>
  );
}
