import "server-only";
import { fallbackCategories, fallbackOptions, fallbackProducts } from "./fallback";
import type { Alloy, CatalogOptions, Category, EngravingFont, Finish, GrooveType, Product, Profile, StoneSetting } from "./types";

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  return { url: url.replace(/\/$/, ""), key };
}

async function rest<T>(path: string): Promise<T[] | null> {
  const { url, key } = env();
  if (!url || !key) return null;
  try {
    const response = await fetch(`${url}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as T[];
    return Array.isArray(rows) && rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

const num = (value: unknown, fallback: number | null = null) => {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export async function getCategories(): Promise<Category[]> {
  const rows = await rest<Category>("jewelry_categories?select=slug,name_de,name_en,description_de,description_en,kind,sort_order&is_active=eq.true&order=sort_order.asc");
  return rows ?? fallbackCategories;
}

export async function getProducts(): Promise<Product[]> {
  const rows = await rest<Record<string, unknown>>("jewelry_products?select=slug,sku,category_slug,name_de,name_en,description_de,description_en,metal_group,metal_de,metal_en,alloy_de,alloy_en,width_mm,size_min,size_max,lead_de,lead_en,glyph,tone,sort_order&is_active=eq.true&order=sort_order.asc");
  if (!rows) return fallbackProducts;
  return rows.map((row) => ({
    slug: String(row.slug),
    sku: String(row.sku),
    category_slug: String(row.category_slug),
    name_de: String(row.name_de),
    name_en: String(row.name_en),
    description_de: String(row.description_de),
    description_en: String(row.description_en),
    metal_group: row.metal_group as Product["metal_group"],
    metal_de: String(row.metal_de),
    metal_en: String(row.metal_en),
    alloy_de: String(row.alloy_de),
    alloy_en: String(row.alloy_en),
    width_mm: num(row.width_mm),
    size_min: num(row.size_min),
    size_max: num(row.size_max),
    lead_de: String(row.lead_de),
    lead_en: String(row.lead_en),
    glyph: row.glyph as Product["glyph"],
    tone: row.tone as Product["tone"],
    sort_order: Number(row.sort_order) || 0,
  }));
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((product) => product.slug === slug) ?? null;
}

export async function getOptions(): Promise<CatalogOptions> {
  const fallback = fallbackOptions();
  const [profiles, alloys, finishes, stones, fonts, grooves, sizes] = await Promise.all([
    rest<Profile>("jewelry_profiles?select=code,name_de,name_en,description_de,description_en,svg_path,min_width_mm,max_width_mm,min_height_mm,max_height_mm,area_factor,allows_groove,allows_stones,sort_order&is_active=eq.true&order=sort_order.asc"),
    rest<Alloy>("jewelry_alloys?select=code,metal_group,fineness,color_de,color_en,hex_color,density,sort_order&is_active=eq.true&order=sort_order.asc"),
    rest<Finish>("jewelry_finishes?select=code,name_de,name_en,description_de,description_en,preview,sort_order&is_active=eq.true&order=sort_order.asc"),
    rest<StoneSetting>("jewelry_stone_settings?select=code,name_de,name_en,description_de,description_en,min_count,max_count,min_size_mm,max_size_mm,sort_order&is_active=eq.true&order=sort_order.asc"),
    rest<EngravingFont>("jewelry_engraving_fonts?select=code,name_de,name_en,css_family,variant,sort_order&is_active=eq.true&order=sort_order.asc"),
    rest<GrooveType>("jewelry_groove_types?select=code,name_de,name_en,min_width_mm,max_width_mm,min_depth_mm,max_depth_mm,sort_order&is_active=eq.true&order=sort_order.asc"),
    rest<{ size_mm: number }>("jewelry_sizes?select=size_mm&is_active=eq.true&order=size_mm.asc"),
  ]);
  const coerceProfile = (row: Profile): Profile => ({
    ...row,
    min_width_mm: Number(row.min_width_mm),
    max_width_mm: Number(row.max_width_mm),
    min_height_mm: Number(row.min_height_mm),
    max_height_mm: Number(row.max_height_mm),
    area_factor: Number(row.area_factor),
    allows_groove: Boolean(row.allows_groove),
    allows_stones: Boolean(row.allows_stones),
  });
  return {
    profiles: profiles?.map(coerceProfile) ?? fallback.profiles,
    alloys: alloys?.map((row) => ({ ...row, density: Number(row.density) })) ?? fallback.alloys,
    finishes: finishes ?? fallback.finishes,
    stones: stones?.map((row) => ({
      ...row,
      min_count: Number(row.min_count),
      max_count: Number(row.max_count),
      min_size_mm: Number(row.min_size_mm),
      max_size_mm: Number(row.max_size_mm),
    })) ?? fallback.stones,
    fonts: fonts ?? fallback.fonts,
    grooves: grooves?.map((row) => ({
      ...row,
      min_width_mm: Number(row.min_width_mm),
      max_width_mm: Number(row.max_width_mm),
      min_depth_mm: Number(row.min_depth_mm),
      max_depth_mm: Number(row.max_depth_mm),
    })) ?? fallback.grooves,
    sizes: sizes?.map((row) => ({ size_mm: Number(row.size_mm) })) ?? fallback.sizes,
  };
}
