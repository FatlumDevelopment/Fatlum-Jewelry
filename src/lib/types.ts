export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

export type MetalGroup = "gold" | "silver" | "platinum" | "palladium";
export type MetalTone = "yellow" | "white" | "rose" | "red" | "platinum" | "silver" | "palladium";
export type GlyphKind = "band" | "solitaire" | "pave" | "signet" | "stack" | "chain" | "hoop" | "stud" | "drop" | "locket";
export type FinishPreview = "polish" | "matte" | "brush" | "hammer" | "ice" | "sand";
export type StoneCode = "none" | "solitaire" | "channel" | "pave";
export type GrooveCode = "none" | "u" | "v";
export type ConfigMode = "single" | "pair" | "blank";

export type Category = {
  slug: string;
  name_de: string;
  name_en: string;
  description_de: string;
  description_en: string;
  kind: "ring" | "jewelry";
  sort_order: number;
};

export type Product = {
  slug: string;
  sku: string;
  category_slug: string;
  name_de: string;
  name_en: string;
  description_de: string;
  description_en: string;
  metal_group: MetalGroup;
  metal_de: string;
  metal_en: string;
  alloy_de: string;
  alloy_en: string;
  width_mm: number | null;
  size_min: number | null;
  size_max: number | null;
  lead_de: string;
  lead_en: string;
  glyph: GlyphKind;
  tone: MetalTone;
  sort_order: number;
};

export type Profile = {
  code: string;
  name_de: string;
  name_en: string;
  description_de: string;
  description_en: string;
  svg_path: string;
  min_width_mm: number;
  max_width_mm: number;
  min_height_mm: number;
  max_height_mm: number;
  area_factor: number;
  allows_groove: boolean;
  allows_stones: boolean;
  sort_order: number;
};

export type Alloy = {
  code: string;
  metal_group: MetalGroup;
  fineness: string;
  color_de: string;
  color_en: string;
  hex_color: string;
  density: number;
  sort_order: number;
};

export type Finish = {
  code: string;
  name_de: string;
  name_en: string;
  description_de: string;
  description_en: string;
  preview: FinishPreview;
  sort_order: number;
};

export type StoneSetting = {
  code: StoneCode;
  name_de: string;
  name_en: string;
  description_de: string;
  description_en: string;
  min_count: number;
  max_count: number;
  min_size_mm: number;
  max_size_mm: number;
  sort_order: number;
};

export type EngravingFont = {
  code: string;
  name_de: string;
  name_en: string;
  css_family: string;
  variant: "serif" | "script" | "sans" | "caps";
  sort_order: number;
};

export type GrooveType = {
  code: GrooveCode;
  name_de: string;
  name_en: string;
  min_width_mm: number;
  max_width_mm: number;
  min_depth_mm: number;
  max_depth_mm: number;
  sort_order: number;
};

export type RingSize = { size_mm: number };

export type CatalogOptions = {
  profiles: Profile[];
  alloys: Alloy[];
  finishes: Finish[];
  stones: StoneSetting[];
  fonts: EngravingFont[];
  grooves: GrooveType[];
  sizes: RingSize[];
};

export type GrooveChoice = { code: GrooveCode; width_mm: number; depth_mm: number };
export type StoneChoice = { code: StoneCode; count: number; size_mm: number };

export type RingDraft = {
  profile: string;
  width_mm: number;
  height_mm: number;
  size_mm: number;
  alloy: string;
  groove: GrooveChoice;
  finish: string;
  stone: StoneChoice;
  engraving: { text: string; font: string };
};

export type ConfigPayload = {
  mode: ConfigMode;
  rings: RingDraft[];
};

export type RingConfig = {
  mode: "finished" | "blank";
  metal: string;
  shape: string;
  carat: number;
  setting: string;
  size_mm: number;
  width_mm: number;
  engraving: string;
};

export type CartLine = {
  key: string;
  kind: "product" | "configuration";
  qty: number;
  sku: string;
  slug?: string;
  name_de: string;
  name_en: string;
  detail_de: string;
  detail_en: string;
  glyph?: GlyphKind;
  tone?: MetalTone;
  payload?: RingConfig;
};
