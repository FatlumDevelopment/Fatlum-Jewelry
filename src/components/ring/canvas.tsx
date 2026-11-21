"use client";
import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { RingScene } from "./scene";
import type { RingConfig } from "@/lib/types";

function viewportProfile() {
  if (typeof window === "undefined") {
    return { mobile: false, dpr: 1.5, bounces: 3, smallBounces: 3, bloom: true };
  }
  const mobile = window.innerWidth < 768;
  const dprRaw = window.devicePixelRatio || 1;
  const dpr = mobile ? Math.min(dprRaw, 1.25) : Math.min(dprRaw, 2);
  return {
    mobile,
    dpr,
    bounces: mobile ? 2 : 4,
    smallBounces: mobile ? 1 : 2,
    bloom: !mobile,
  };
}

export function RingCanvas({ config, view, onReady }: { config: RingConfig; view: "out" | "in"; onReady: () => void }) {
  const [profile] = useState(viewportProfile);
  const tone = useMemo(() => (profile.mobile ? THREE.ACESFilmicToneMapping : THREE.AgXToneMapping), [profile.mobile]);

  return (
    <Canvas
      className="h-full w-full touch-none"
      dpr={profile.dpr}
      resize={{ scroll: false, debounce: 0 }}
      camera={{ position: [18, 12, 28], fov: 28, near: 0.1, far: 400 }}
      gl={{ antialias: !profile.mobile, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(profile.dpr);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = tone;
        gl.toneMappingExposure = profile.mobile ? 1.05 : 1.02;
        gl.setClearColor(0x000000, 0);
        onReady();
      }}
    >
      <Suspense fallback={null}>
        <RingScene config={config} view={view} bounces={profile.bounces} smallBounces={profile.smallBounces} bloom={profile.bloom} />
      </Suspense>
    </Canvas>
  );
}