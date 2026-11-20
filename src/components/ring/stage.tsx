"use client";
import dynamic from "next/dynamic";
import { Component, useState, type ReactNode } from "react";
import { RingFallback } from "./fallback";
import type { JewelryId } from "@/lib/image-slots";
import type { RingConfig } from "@/lib/types";

const CanvasStage = dynamic(() => import("./canvas").then((mod) => mod.RingCanvas), { ssr: false, loading: () => null });

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { bad: boolean }> {
  state = { bad: false };
  static getDerivedStateFromError() { return { bad: true }; }
  render() { return this.state.bad ? this.props.fallback : this.props.children; }
}

export function RingStage({ config, view, label, fallbackId }: { config: RingConfig; view: "out" | "in"; label: string; fallbackId: JewelryId }) {
  const [ready, setReady] = useState(false);
  const still = <RingFallback id={fallbackId} label={label} />;
  return (
    <div className="relative h-full w-full bg-[#f7f4ef]">
      <Boundary fallback={still}>
        <div className={ready ? "h-full w-full" : "h-full w-full opacity-0"} aria-hidden={ready ? true : undefined}>
          <CanvasStage config={config} view={view} onReady={() => setReady(true)} />
        </div>
      </Boundary>
      {ready ? <p className="sr-only">{label}</p> : <div className="absolute inset-0">{still}</div>}
    </div>
  );
}
