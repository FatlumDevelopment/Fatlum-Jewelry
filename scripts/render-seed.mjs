import { readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("../data/catalog.json", import.meta.url), "utf8"));
const q = (value) => (value === null || value === undefined ? "null" : `'${String(value).replace(/'/g, "''")}'`);
const n = (value) => (value === null || value === undefined ? "null" : String(value));
const b = (value) => (value ? "true" : "false");

const lines = [];
lines.push("-- Seed for Fatlum Jewelry. Idempotent: existing codes and slugs are left untouched.");
lines.push("-- Generated from data/catalog.json. Re-run scripts/render-seed.mjs after editing the catalogue.");
lines.push("");

function insert(table, columns, rows) {
  lines.push(`insert into ${table} (${columns.join(", ")}) values`);
  lines.push(rows.map((row) => `  (${row.join(", ")})`).join(",\n"));
  lines.push(`on conflict do nothing;`);
  lines.push("");
}

insert("jewelry_categories", ["slug", "name_de", "name_en", "description_de", "description_en", "kind", "sort_order"], data.categories.map((row) => [q(row.slug), q(row.name_de), q(row.name_en), q(row.description_de), q(row.description_en), q(row.kind), n(row.sort_order)]));

insert("jewelry_products", ["slug", "sku", "category_slug", "name_de", "name_en", "description_de", "description_en", "metal_group", "metal_de", "metal_en", "alloy_de", "alloy_en", "width_mm", "size_min", "size_max", "lead_de", "lead_en", "glyph", "tone", "sort_order"], data.products.map((row) => [q(row.slug), q(row.sku), q(row.category_slug), q(row.name_de), q(row.name_en), q(row.description_de), q(row.description_en), q(row.metal_group), q(row.metal_de), q(row.metal_en), q(row.alloy_de), q(row.alloy_en), n(row.width_mm), n(row.size_min), n(row.size_max), q(row.lead_de), q(row.lead_en), q(row.glyph), q(row.tone), n(row.sort_order)]));

insert("jewelry_profiles", ["code", "name_de", "name_en", "description_de", "description_en", "svg_path", "min_width_mm", "max_width_mm", "min_height_mm", "max_height_mm", "area_factor", "allows_groove", "allows_stones", "sort_order"], data.profiles.map((row) => [q(row.code), q(row.name_de), q(row.name_en), q(row.description_de), q(row.description_en), q(row.svg_path), n(row.min_width_mm), n(row.max_width_mm), n(row.min_height_mm), n(row.max_height_mm), n(row.area_factor), b(row.allows_groove), b(row.allows_stones), n(row.sort_order)]));

insert("jewelry_alloys", ["code", "metal_group", "fineness", "color_de", "color_en", "hex_color", "density", "sort_order"], data.alloys.map((row) => [q(row.code), q(row.metal_group), q(row.fineness), q(row.color_de), q(row.color_en), q(row.hex_color), n(row.density), n(row.sort_order)]));

insert("jewelry_finishes", ["code", "name_de", "name_en", "description_de", "description_en", "preview", "sort_order"], data.finishes.map((row) => [q(row.code), q(row.name_de), q(row.name_en), q(row.description_de), q(row.description_en), q(row.preview), n(row.sort_order)]));

insert("jewelry_stone_settings", ["code", "name_de", "name_en", "description_de", "description_en", "min_count", "max_count", "min_size_mm", "max_size_mm", "sort_order"], data.stones.map((row) => [q(row.code), q(row.name_de), q(row.name_en), q(row.description_de), q(row.description_en), n(row.min_count), n(row.max_count), n(row.min_size_mm), n(row.max_size_mm), n(row.sort_order)]));

insert("jewelry_engraving_fonts", ["code", "name_de", "name_en", "css_family", "variant", "sort_order"], data.fonts.map((row) => [q(row.code), q(row.name_de), q(row.name_en), q(row.css_family), q(row.variant), n(row.sort_order)]));

insert("jewelry_groove_types", ["code", "name_de", "name_en", "min_width_mm", "max_width_mm", "min_depth_mm", "max_depth_mm", "sort_order"], data.grooves.map((row) => [q(row.code), q(row.name_de), q(row.name_en), n(row.min_width_mm), n(row.max_width_mm), n(row.min_depth_mm), n(row.max_depth_mm), n(row.sort_order)]));

lines.push("insert into jewelry_sizes (size_mm)");
lines.push("select g from generate_series(44, 74) as g");
lines.push("on conflict do nothing;");
lines.push("");

writeFileSync(new URL("../supabase/migrations/20261118180100_jewelry_seed.sql", import.meta.url), lines.join("\n"));
console.log("wrote seed", lines.length, "lines");
