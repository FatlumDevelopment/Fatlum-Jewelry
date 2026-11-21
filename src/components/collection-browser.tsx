"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductVisual } from "./product-visual";
import { dict } from "@/lib/i18n";
import type { Locale, MetalGroup, Product } from "@/lib/types";

export function CollectionBrowser({ l, products }: { l: Locale; products: Product[] }) {
  const t = dict(l);
  const [metal, setMetal] = useState<MetalGroup | "all">("all");
  const [sort, setSort] = useState<"az" | "za">("az");
  const present = useMemo(() => {
    const groups = new Set(products.map((product) => product.metal_group));
    return (["gold", "silver", "platinum", "palladium"] as MetalGroup[]).filter((group) => groups.has(group));
  }, [products]);
  const rows = useMemo(() => {
    const filtered = products.filter((product) => metal === "all" || product.metal_group === metal);
    return filtered.sort((a, b) => (l === "en" ? a.name_en.localeCompare(b.name_en) : a.name_de.localeCompare(b.name_de, "de")) * (sort === "az" ? 1 : -1));
  }, [products, metal, sort, l]);
  const chip = (active: boolean) => `inline-flex min-h-11 items-center border-b px-1 text-sm ${active ? "border-ink text-ink" : "border-transparent text-stone hover:text-ink"}`;
  return (
    <div>
      <div className="mt-8 flex flex-col gap-4 border-y border-line py-3 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label={t.filters.metal} className="flex flex-wrap gap-x-4">
          <button type="button" className={chip(metal === "all")} aria-pressed={metal === "all"} onClick={() => setMetal("all")}>{t.filters.all}</button>
          {present.map((group) => (
            <button key={group} type="button" className={chip(metal === group)} aria-pressed={metal === group} onClick={() => setMetal(group)}>{t.filters[group]}</button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm text-stone" htmlFor="sort">{t.filters.sort}
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as "az" | "za")} className="ml-3 min-h-11 border border-line bg-white px-3 text-base text-ink">
              <option value="az">{t.filters.name}</option>
              <option value="za">{t.filters.nameDesc}</option>
            </select>
          </label>
          <p className="text-sm text-stone">{t.results(rows.length)}</p>
        </div>
      </div>
      {rows.length === 0 ? <p className="py-16 text-stone">{t.results(0)}</p> : null}
      <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" data-testid="collection-grid">
        {rows.map((product) => {
          const name = l === "en" ? product.name_en : product.name_de;
          const alloy = l === "en" ? product.alloy_en : product.alloy_de;
          return (
            <li key={product.slug}>
              <Link href={`/${l}/schmuck/${product.slug}`} className="group block">
                <ProductVisual slug={product.slug} glyph={product.glyph} tone={product.tone} alt="" locale={l} />
                <h2 className="mt-4 font-serif text-3xl text-ink group-hover:text-metal">{name}</h2>
                <p className="mt-1 text-sm text-stone">{alloy}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.16em]">{t.price}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
