"use client";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { RingScene } from "./scene";
import type { RingConfig } from "@/lib/types";

export function RingCanvas({ config, view, onReady }: { config: RingConfig; view: "out" | "in"; onReady: () => void }) {
  const [narrow] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [ratio] = useState(() => Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 3));
  return (
    <Canvas
      className="h-full w-full touch-none"
      dpr={ratio}
      resize={{ scroll: false, debounce: 0 }}
      camera={{ position: [18, 12, 28], fov: 28, near: 0.1, far: 400 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(ratio);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
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
