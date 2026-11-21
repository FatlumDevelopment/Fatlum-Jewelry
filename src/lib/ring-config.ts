import type { Locale, RingConfig } from "./types";

export const METALS = [
  { code: "yg585", group: "yellow", fineness: "585", color: "#E4C56A", roughness: 0.14, de: "Gelbgold", en: "Yellow gold" },
  { code: "yg750", group: "yellow", fineness: "750", color: "#C9962E", roughness: 0.1, de: "Gelbgold", en: "Yellow gold" },
  { code: "wg585", group: "white", fineness: "585", color: "#F3F2EF", roughness: 0.12, de: "Weißgold", en: "White gold" },
  { code: "wg750", group: "white", fineness: "750", color: "#F7F6F4", roughness: 0.1, de: "Weißgold", en: "White gold" },
  { code: "rg585", group: "rose", fineness: "585", color: "#F0C2B4", roughness: 0.14, de: "Roségold", en: "Rose gold" },
  { code: "rg750", group: "rose", fineness: "750", color: "#E4A898", roughness: 0.11, de: "Roségold", en: "Rose gold" },
  { code: "pt950", group: "platinum", fineness: "950", color: "#F4F5F6", roughness: 0.09, de: "Platin", en: "Platinum" },
] as const;

export const SHAPES = [
  { code: "round", de: "Rund", en: "Round" },
  { code: "princess", de: "Princess", en: "Princess" },
  { code: "oval", de: "Oval", en: "Oval" },
  { code: "emerald", de: "Smaragd", en: "Emerald" },
  { code: "pear", de: "Birne", en: "Pear" },
  { code: "cushion", de: "Kissen", en: "Cushion" },
] as const;

export const SETTINGS = [
  { code: "solitaire", de: "Solitär", en: "Solitaire" },
  { code: "halo", de: "Halo", en: "Halo" },
  { code: "pave", de: "Pavé", en: "Pavé" },
] as const;

export const BLANK_WIDTHS = [2, 2.5, 3, 4, 5, 6] as const;

export const CARAT_MIN = 0.25;
export const CARAT_MAX = 2.5;
export const SIZE_MIN = 48;
export const SIZE_MAX = 70;
export const ENGRAVING_MAX = 20;

export type MetalCode = (typeof METALS)[number]["code"];
export type ShapeCode = (typeof SHAPES)[number]["code"];
export type SettingCode = (typeof SETTINGS)[number]["code"];

const metalCodes = new Set<string>(METALS.map((m) => m.code));
const shapeCodes = new Set<string>(SHAPES.map((m) => m.code));
const settingCodes = new Set<string>(SETTINGS.map((m) => m.code));

export function metalByCode(code: string) {
  return METALS.find((m) => m.code === code) ?? METALS[1];
}

export function defaultRingConfig(mode: RingConfig["mode"] = "finished"): RingConfig {
  return {
    mode,
    metal: "yg750",
    shape: "round",
    carat: 1,
    setting: "solitaire",
    size_mm: 54,
    width_mm: mode === "blank" ? 4 : 1.9,
    engraving: "",
  };
}

export function roundMm(n: number) {
  return Math.round(n * 10) / 10;
}

export function caratToDiameter(carat: number) {
  const c = Math.min(CARAT_MAX, Math.max(CARAT_MIN, carat));
  return roundMm(6.4 * Math.cbrt(c));
}

export function sanitizeEngraving(value: string) {
  return value
    .replace(/[<>{}[\]\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, ENGRAVING_MAX);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function parseRingConfig(value: unknown): RingConfig | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<RingConfig>;
  const mode = row.mode === "blank" ? "blank" : row.mode === "finished" ? "finished" : null;
  if (!mode || typeof row.metal !== "string" || !metalCodes.has(row.metal)) return null;
  const shape = typeof row.shape === "string" && shapeCodes.has(row.shape) ? row.shape : "round";
  const setting = typeof row.setting === "string" && settingCodes.has(row.setting) ? row.setting : "solitaire";
  const size = clamp(Math.round(Number(row.size_mm) || 54), 44, 74);
  const carat = Math.round(clamp(Number(row.carat) || 1, CARAT_MIN, CARAT_MAX) * 100) / 100;
  let width = Number(row.width_mm);
  if (mode === "blank") {
    const nearest = BLANK_WIDTHS.reduce((best, item) => (Math.abs(item - width) < Math.abs(best - width) ? item : best), BLANK_WIDTHS[0]);
    width = nearest;
  } else {
    width = 1.9;
  }
  return {
    mode,
    metal: row.metal,
    shape,
    setting,
    carat: mode === "blank" ? 0 : carat,
    size_mm: size,
    width_mm: width,
    engraving: mode === "blank" ? "" : sanitizeEngraving(typeof row.engraving === "string" ? row.engraving : ""),
  };
}

function num(locale: Locale, value: number, digits = 2) {
  return value.toLocaleString(locale === "de" ? "de-DE" : "en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function describeRing(ring: RingConfig, locale: Locale) {
  const metal = metalByCode(ring.metal);
  const metalName = `${metal.fineness} ${locale === "de" ? metal.de : metal.en}`;
  const size = locale === "de" ? `Größe ${ring.size_mm}` : `size ${ring.size_mm}`;
  if (ring.mode === "blank") {
    const width = locale === "de" ? `Breite ${num(locale, ring.width_mm, 1)} mm` : `width ${num(locale, ring.width_mm, 1)} mm`;
    return locale === "de" ? `Rohling, ${metalName}, ${width}, ${size}` : `Blank, ${metalName}, ${width}, ${size}`;
  }
  const shape = SHAPES.find((item) => item.code === ring.shape);
  const setting = SETTINGS.find((item) => item.code === ring.setting);
  const shapeName = shape ? (locale === "de" ? shape.de : shape.en) : ring.shape;
  const settingName = setting ? (locale === "de" ? setting.de : setting.en) : ring.setting;
  const stone = `${shapeName} ${num(locale, ring.carat)} ct`;
  const cut = ring.engraving ? (locale === "de" ? `, Gravur „${ring.engraving}“` : `, engraving “${ring.engraving}”`) : "";
  return locale === "de"
    ? `Fertiger Ring, ${metalName}, ${stone}, ${settingName}, ${size}${cut}`
    : `Finished ring, ${metalName}, ${stone}, ${settingName}, ${size}${cut}`;
}

export function ringNames(ring: RingConfig) {
  return {
    sku: ring.mode === "blank" ? "FJ-ROH" : "FJ-KONFIG",
    name_de: ring.mode === "blank" ? "Rohling" : "Ringkonfiguration",
    name_en: ring.mode === "blank" ? "Blank" : "Ring configuration",
    detail_de: describeRing(ring, "de"),
    detail_en: describeRing(ring, "en"),
  };
}
