"use client";
import { Canvas } from "@react-three/fiber";
import { RingScene } from "./scene";
import type { RingConfig } from "@/lib/types";

export function RingCanvas({ config, view, onReady }: { config: RingConfig; view: "out" | "in"; onReady: () => void }) {
  const narrow = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas
      className="h-full w-full touch-none"
      dpr={narrow ? [1, 1.25] : [1, 1.6]}
      camera={{ position: [26, 14, 36], fov: 32, near: 0.1, far: 220 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady();
      }}
    >
      <RingScene config={config} view={view} />
    </Canvas>
  );
}
