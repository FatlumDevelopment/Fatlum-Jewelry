import type { Alloy, CatalogOptions, ConfigMode, GrooveType, Profile, RingDraft, StoneSetting } from "./types";

export const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function buildSizes() {
  return Array.from({ length: 31 }, (_, i) => ({ size_mm: 44 + i }));
}

export function diameterMm(sizeMm: number) {
  return Math.round((sizeMm / Math.PI) * 100) / 100;
}

/** Approximate US size. A guide only — a jeweller confirms the fit. */
export function usSize(sizeMm: number) {
  const raw = (sizeMm - 36.5) / 2.55;
  const stepped = Math.round(raw * 4) / 4;
  return stepped.toFixed(2).replace(/0$/, "").replace(/\.00$/, "");
}

const UK = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

/** Approximate UK letter. Half sizes sit between letters. */
export function ukSize(sizeMm: number) {
  const index = (sizeMm - 37.5) / 1.25;
  const base = Math.floor(index);
  const frac = index - base >= 0.5;
  const letter = UK[clamp(base, 0, UK.length - 1)] ?? "Z";
  const next = UK[clamp(base + 1, 0, UK.length - 1)] ?? "Z";
  if (base < 0) return "A";
  if (base >= UK.length - 1) return "Z";
  return frac ? `${letter}½` : letter === next ? letter : letter;
}

export function defaultRing(size = 54): RingDraft {
  return {
    profile: "planlinie",
    width_mm: 4,
    height_mm: 1.6,
    size_mm: size,
    alloy: "au585-gelb",
    groove: { code: "none", width_mm: 0.8, depth_mm: 0.35 },
    finish: "poliert",
    stone: { code: "none", count: 1, size_mm: 2.5 },
    engraving: { text: "", font: "antiqua" },
  };
}

export function sanitizeEngraving(text: string) {
  return text.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
}

export function clampRing(ring: RingDraft, options: CatalogOptions, mode: ConfigMode): RingDraft {
  const profile = options.profiles.find((p) => p.code === ring.profile) ?? options.profiles[0];
  if (!profile) return ring;
  const width = round1(clamp(ring.width_mm, profile.min_width_mm, profile.max_width_mm));
  const height = round1(clamp(ring.height_mm, profile.min_height_mm, profile.max_height_mm));
  const size = clamp(Math.round(ring.size_mm), 44, 74);

  let groove = ring.groove;
  const grooveSpec = options.grooves.find((g) => g.code === groove.code);
  if (!profile.allows_groove || !grooveSpec || groove.code === "none") {
    groove = { code: "none", width_mm: groove.width_mm, depth_mm: groove.depth_mm };
  } else {
    const maxW = Math.min(grooveSpec.max_width_mm, Math.max(grooveSpec.min_width_mm, width - 1));
    const maxD = Math.min(grooveSpec.max_depth_mm, Math.max(grooveSpec.min_depth_mm, round1(height - 0.7)));
    groove = {
      code: groove.code,
      width_mm: round1(clamp(groove.width_mm, grooveSpec.min_width_mm, maxW)),
      depth_mm: round1(clamp(groove.depth_mm, grooveSpec.min_depth_mm, maxD)),
    };
  }

  let stone = ring.stone;
  const stoneSpec = options.stones.find((s) => s.code === stone.code);
  if (mode === "blank" || !profile.allows_stones || !stoneSpec || stone.code === "none") {
    stone = { code: "none", count: 0, size_mm: 0 };
  } else {
    const maxSize = Math.min(stoneSpec.max_size_mm, Math.max(stoneSpec.min_size_mm, round1(width * 0.72)));
    stone = {
      code: stone.code,
      count: stone.code === "solitaire" ? 1 : Math.round(clamp(stone.count || stoneSpec.min_count, stoneSpec.min_count, stoneSpec.max_count)),
      size_mm: round1(clamp(stone.size_mm || stoneSpec.min_size_mm, stoneSpec.min_size_mm, maxSize)),
    };
  }

  const font = options.fonts.some((f) => f.code === ring.engraving.font) ? ring.engraving.font : options.fonts[0]?.code ?? "antiqua";
  const engraving = mode === "blank" ? { text: "", font } : { text: sanitizeEngraving(ring.engraving.text), font };

  return {
    profile: profile.code,
    width_mm: width,
    height_mm: height,
    size_mm: size,
    alloy: options.alloys.some((a) => a.code === ring.alloy) ? ring.alloy : options.alloys[0]?.code ?? ring.alloy,
    groove,
    finish: options.finishes.some((f) => f.code === ring.finish) ? ring.finish : options.finishes[0]?.code ?? ring.finish,
    stone,
    engraving,
  };
}

export function copyDesign(source: RingDraft, keepSize: number): RingDraft {
  return { ...source, size_mm: keepSize, engraving: { ...source.engraving }, groove: { ...source.groove }, stone: { ...source.stone } };
}

export function estimateWeight(ring: RingDraft, profile: Profile, alloy: Alloy) {
  const meanCirc = ring.size_mm + Math.PI * ring.height_mm;
  let area = ring.width_mm * ring.height_mm * profile.area_factor;
  if (ring.groove.code === "v") area -= 0.5 * ring.groove.width_mm * ring.groove.depth_mm;
  if (ring.groove.code === "u") area -= ring.groove.width_mm * ring.groove.depth_mm * 0.8;
  area = Math.max(area, ring.width_mm * ring.height_mm * 0.22);
  const grams = ((area * meanCirc) / 1000) * alloy.density;
  return Math.round(grams * 10) / 10;
}

export const ALL_STEPS = ["mode", "profile", "width", "height", "size", "alloy", "grooves", "finish", "stones", "engraving", "summary"] as const;
export type StepId = (typeof ALL_STEPS)[number];

export function stepsFor(mode: ConfigMode): StepId[] {
  const steps: StepId[] = ["mode", "profile", "width", "height", "size", "alloy", "grooves", "finish"];
  if (mode !== "blank") steps.push("stones", "engraving");
  steps.push("summary");
  return steps;
}

export function findProfile(options: CatalogOptions, code: string) {
  return options.profiles.find((p) => p.code === code) ?? options.profiles[0];
}
export function findAlloy(options: CatalogOptions, code: string) {
  return options.alloys.find((a) => a.code === code) ?? options.alloys[0];
}
export function findFinish(options: CatalogOptions, code: string) {
  return options.finishes.find((f) => f.code === code) ?? options.finishes[0];
}
export function findFont(options: CatalogOptions, code: string) {
  return options.fonts.find((f) => f.code === code) ?? options.fonts[0];
}
export function findGroove(options: CatalogOptions, code: string): GrooveType | undefined {
  return options.grooves.find((g) => g.code === code);
}
export function findStone(options: CatalogOptions, code: string): StoneSetting | undefined {
  return options.stones.find((s) => s.code === code);
}
