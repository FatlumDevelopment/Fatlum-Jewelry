"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AddProductButton } from "./cart";
import { ProductGlyph } from "./glyphs";
import { dict } from "@/lib/i18n";
import type { Locale, MetalGroup, Product } from "@/lib/types";

export function CollectionBrowser({ l, products }: { l: Locale; products: Product[] }) {
  const t = dict(l);
  const [metal, setMetal] = useState<MetalGroup | "all">("all");
  const [sort, setSort] = useState<"az" | "za">("az");
  const rows = useMemo(() => {
    const filtered = products.filter((product) => metal === "all" || product.metal_group === metal);
    return filtered.sort((a, b) => (l === "en" ? a.name_en.localeCompare(b.name_en) : a.name_de.localeCompare(b.name_de, "de")) * (sort === "az" ? 1 : -1));
  }, [products, metal, sort, l]);
  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gold/30 bg-cream p-4">
        <label className="text-sm">{t.filters.metal}
          <select value={metal} onChange={(e) => setMetal(e.target.value as MetalGroup | "all")} className="mt-1 block rounded border border-gray-300 bg-white px-3 py-2">
            <option value="all">{t.filters.all}</option>
            <option value="gold">{t.filters.gold}</option>
            <option value="silver">{t.filters.silver}</option>
            <option value="platinum">{t.filters.platinum}</option>
            <option value="palladium">{t.filters.palladium}</option>
          </select>
        </label>
        <label className="text-sm">{t.filters.sort}
          <select value={sort} onChange={(e) => setSort(e.target.value as "az" | "za")} className="mt-1 block rounded border border-gray-300 bg-white px-3 py-2">
            <option value="az">{t.filters.name}</option>
            <option value="za">{t.filters.nameDesc}</option>
          </select>
        </label>
        <button type="button" onClick={() => { setMetal("all"); setSort("az"); }} className="text-sm text-secondary underline">{t.filters.reset}</button>
        <p className="ml-auto text-sm text-gray-600">{t.results(rows.length)}</p>
      </div>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="collection-grid">
        {rows.map((product) => {
          const name = l === "en" ? product.name_en : product.name_de;
          const alloy = l === "en" ? product.alloy_en : product.alloy_de;
          return (
            <li key={product.slug} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
              <Link href={`/${l}/schmuck/${product.slug}`} className="block bg-cream">
                <ProductGlyph uid={product.slug} kind={product.glyph} tone={product.tone} title={name} />
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h2 className="font-serif text-2xl text-navy"><Link href={`/${l}/schmuck/${product.slug}`} className="hover:text-gold-dark">{name}</Link></h2>
                  <p className="text-sm text-gray-600">{alloy}{product.width_mm ? ` · ${product.width_mm} mm` : ""}</p>
                  <p className="mt-1 text-sm text-secondary">{t.price}</p>
                </div>
                <AddProductButton
                  line={{ kind: "product", sku: product.sku, slug: product.slug, name_de: product.name_de, name_en: product.name_en, detail_de: product.alloy_de, detail_en: product.alloy_en, glyph: product.glyph, tone: product.tone }}
                  label={t.add} addedLabel={t.added} qtyLabel={t.qty}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
