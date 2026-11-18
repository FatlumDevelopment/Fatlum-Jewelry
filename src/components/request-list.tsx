"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart";
import { ProductGlyph, RingSketch, type PreviewRing } from "./glyphs";
import { dict } from "@/lib/i18n";
import { findAlloy, findFinish, findFont } from "@/lib/ring";
import type { CatalogOptions, Locale } from "@/lib/types";

export function RequestList({ l, options }: { l: Locale; options: CatalogOptions }) {
  const t = dict(l);
  const { items, setQty, remove, clear, ready } = useCart();
  const [state, setState] = useState<"idle" | "sending" | "ok" | "mail" | "err">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = new FormData(event.currentTarget);
    const body = {
      source: "request_list",
      locale: l,
      name: form.get("name"),
      company: form.get("company"),
      email: form.get("email"),
      phone: form.get("phone"),
      message: form.get("message"),
      consent: form.get("consent") === "on",
      website: form.get("website"),
      items: items.map((item) => ({ kind: item.kind, qty: item.qty, slug: item.slug, payload: item.payload })),
    };
    const response = await fetch("/api/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) { setState("err"); return; }
    const data = (await response.json()) as { emailed?: boolean };
    clear();
    setState(data.emailed ? "mail" : "ok");
  }

  if (state === "ok" || state === "mail") {
    return <p data-testid="success" className="mt-8 rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-emerald-900">{state === "mail" ? t.request.successMail : t.request.success}</p>;
  }
  if (ready && items.length === 0) {
    return (
      <div className="mt-8" data-testid="request-list">
        <p>{t.request.empty}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${l}/kollektion/trauringe`} className="rounded bg-navy px-5 py-2 text-white hover:bg-secondary">{t.request.toCollections}</Link>
          <Link href={`/${l}/konfigurator`} className="rounded border border-navy px-5 py-2 text-navy">{t.request.toConfig}</Link>
        </div>
      </div>
    );
  }

  const field = "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none";
  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]" data-testid="request-list">
      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
        {items.map((item) => (
          <li key={item.key} className="flex flex-wrap items-center gap-4 p-4">
            <div className="h-24 w-28 overflow-hidden rounded bg-cream">
              {item.kind === "product" && item.glyph && item.tone ? (
                <ProductGlyph uid={item.key} kind={item.glyph} tone={item.tone} title={l === "en" ? item.name_en : item.name_de} />
              ) : item.payload ? (
                <RingSketch uid={item.key} pair={item.payload.mode === "pair"} label={l === "en" ? item.name_en : item.name_de} rings={item.payload.rings.map((ring) => toPreview(ring, options))} />
              ) : null}
            </div>
            <div className="min-w-40 flex-1">
              <p className="font-serif text-lg text-navy">{l === "en" ? item.name_en : item.name_de}</p>
              <p className="whitespace-pre-line text-sm text-gray-600">{l === "en" ? item.detail_en : item.detail_de}</p>
              <p className="text-sm text-secondary">{t.price}</p>
            </div>
            <label className="text-xs text-gray-500">{t.qty}
              <input type="number" min={1} max={10} value={item.qty} onChange={(e) => setQty(item.key, Number(e.target.value))} className="mt-1 block w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm" />
            </label>
            <button type="button" onClick={() => remove(item.key)} className="text-sm text-red-800 hover:underline">{t.request.remove}</button>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="space-y-3 rounded-lg border border-gold/40 bg-cream p-6">
        <h2 className="font-serif text-2xl text-navy">{t.request.formTitle}</h2>
        <label className="block text-sm">{t.request.name}<input name="name" required minLength={2} autoComplete="name" className={`mt-1 ${field}`} /></label>
        <label className="block text-sm">{t.request.company}<input name="company" autoComplete="organization" className={`mt-1 ${field}`} /></label>
        <label className="block text-sm">{t.request.email}<input name="email" type="email" required autoComplete="email" className={`mt-1 ${field}`} /></label>
        <label className="block text-sm">{t.request.phone}<input name="phone" type="tel" autoComplete="tel" className={`mt-1 ${field}`} /></label>
        <label className="block text-sm">{t.request.message}<textarea name="message" rows={4} className={`mt-1 ${field}`} /></label>
        <label className="flex gap-2 text-xs text-gray-700"><input type="checkbox" name="consent" required className="mt-0.5 accent-[#bf9e50]" /><span>{t.request.consent} <Link href={`/${l}/datenschutz`} className="underline">{t.footer.privacy}</Link></span></label>
        <div className="absolute -left-[9999px]" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
        <button disabled={state === "sending"} className="w-full rounded bg-navy py-3 font-medium text-white hover:bg-secondary disabled:opacity-60">{state === "sending" ? t.request.sending : t.request.submit}</button>
        <p className="text-xs text-gray-600">{t.request.noPayment}</p>
        {state === "err" && <p className="text-sm text-red-800">{t.request.error}</p>}
      </form>
    </div>
  );
}

function toPreview(ring: { alloy: string; width_mm: number; height_mm: number; finish: string; profile: string; stone: { code: PreviewRing["stoneCode"]; count: number; size_mm: number }; groove: { code: PreviewRing["groove"] }; engraving: { text: string; font: string } }, options: CatalogOptions): PreviewRing {
  const alloy = findAlloy(options, ring.alloy);
  const finish = findFinish(options, ring.finish);
  const font = findFont(options, ring.engraving.font);
  return {
    hex: alloy?.hex_color || "#E0B84A",
    width_mm: ring.width_mm,
    height_mm: ring.height_mm,
    finish: finish?.preview || "polish",
    profile: ring.profile,
    stoneCode: ring.stone.code,
    stoneCount: ring.stone.count,
    stoneSize: ring.stone.size_mm,
    groove: ring.groove.code,
    engraving: ring.engraving.text,
    fontFamily: font?.css_family || "Georgia, serif",
    fontVariant: font?.variant || "serif",
  };
}

export function ContactForm({ l }: { l: Locale }) {
  const t = dict(l);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "contact",
        locale: l,
        name: form.get("name"),
        company: form.get("company"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
        consent: form.get("consent") === "on",
        website: form.get("website"),
        items: [],
      }),
    });
    setState(response.ok ? "ok" : "err");
    if (response.ok) event.currentTarget.reset();
  }
  if (state === "ok") return <p className="rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-emerald-900">{t.contact.success}</p>;
  const field = "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm";
  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-gold/40 bg-cream p-6">
      <h2 className="font-serif text-2xl text-navy">{t.contact.formTitle}</h2>
      <label className="block text-sm">{t.request.name}<input name="name" required minLength={2} autoComplete="name" className={field} /></label>
      <label className="block text-sm">{t.request.company}<input name="company" autoComplete="organization" className={field} /></label>
      <label className="block text-sm">{t.request.email}<input name="email" type="email" required autoComplete="email" className={field} /></label>
      <label className="block text-sm">{t.request.phone}<input name="phone" type="tel" autoComplete="tel" className={field} /></label>
      <label className="block text-sm">{t.request.message}<textarea name="message" required minLength={10} rows={5} className={field} /></label>
      <label className="flex gap-2 text-xs text-gray-700"><input type="checkbox" name="consent" required className="mt-0.5 accent-[#bf9e50]" /><span>{t.request.consent} <Link href={`/${l}/datenschutz`} className="underline">{t.footer.privacy}</Link></span></label>
      <div className="absolute -left-[9999px]" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <button disabled={state === "sending"} className="rounded bg-navy px-5 py-3 text-white hover:bg-secondary disabled:opacity-60">{state === "sending" ? t.request.sending : t.contact.submit}</button>
      {state === "err" && <p className="text-sm text-red-800">{t.request.error}</p>}
    </form>
  );
}
