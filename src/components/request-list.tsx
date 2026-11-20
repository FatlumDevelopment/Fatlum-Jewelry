"use client";
import Link from "next/link";
import { useCart } from "./cart";
import { EnquiryForm } from "./enquiry-form";
import { ProductVisual } from "./product-visual";
import { StudioFrame } from "./studio-image";
import { dict } from "@/lib/i18n";
import { imageSizes } from "@/lib/image-slots";
import { parseRingConfig } from "@/lib/ring-config";
import type { Locale } from "@/lib/types";

export function RequestList({ l }: { l: Locale }) {
  const t = dict(l);
  const { items, setQty, remove, clear, ready } = useCart();
  if (!ready) return <p className="py-16 text-sm text-stone">…</p>;
  if (items.length === 0) {
    return (
      <div className="mt-10" data-testid="request-list">
        <p className="font-serif text-3xl">{t.request.empty}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={`/${l}/kollektion/trauringe`} className="btn btn-solid">{t.request.toCollections}</Link>
          <Link href={`/${l}/konfigurator`} className="btn btn-line">{t.request.toConfig}</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start" data-testid="request-list">
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => {
          const name = l === "en" ? item.name_en : item.name_de;
          const detail = l === "en" ? item.detail_en : item.detail_de;
          return (
            <li key={item.key} className="grid grid-cols-[6.5rem_1fr] gap-4 py-6 sm:grid-cols-[8rem_1fr_auto]">
              <div className="bg-paper">
                {item.kind === "product" && item.glyph && item.tone && item.slug ? (
                  <ProductVisual slug={item.slug} glyph={item.glyph} tone={item.tone} alt="" locale={l} ratio="aspect-square" sizes={imageSizes.thumb} />
                ) : (
                  <StudioFrame id={item.payload?.mode === "blank" ? "ring-blanks" : "engagement-ring-solitaire"} locale={l} alt="" sizes={imageSizes.thumb} ratio="aspect-square" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-serif text-2xl">{name}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone">{detail}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em]">{t.price}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="text-sm text-stone">{t.qty}
                    <input type="number" min={1} max={10} value={item.qty} onChange={(e) => setQty(item.key, Number(e.target.value))} className="ml-2 h-11 w-16 border border-line bg-white text-center text-base text-ink" />
                  </label>
                  <button type="button" onClick={() => remove(item.key)} className="inline-flex min-h-11 items-center text-sm underline">{t.request.remove}</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <EnquiryForm
        locale={l}
        source="request_list"
        submitLabel={t.request.submit}
        onSuccess={clear}
        items={items.map((item) => ({
          kind: item.kind,
          qty: item.qty,
          slug: item.slug,
          payload: item.payload ? parseRingConfig(item.payload) ?? undefined : undefined,
        }))}
      />
    </div>
  );
}
