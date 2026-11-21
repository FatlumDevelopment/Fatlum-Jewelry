"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "./cart";
import { EnquiryForm } from "./enquiry-form";
import { RingStage } from "./ring/stage";
import { dict } from "@/lib/i18n";
import { SISTER } from "@/lib/site";
import { diameterMm, ukSize, usSize } from "@/lib/ring";
import {
  BLANK_WIDTHS,
  CARAT_MAX,
  CARAT_MIN,
  ENGRAVING_MAX,
  METALS,
  SETTINGS,
  SHAPES,
  SIZE_MAX,
  SIZE_MIN,
  caratToDiameter,
  defaultRingConfig,
  describeRing,
  ringNames,
  sanitizeEngraving,
} from "@/lib/ring-config";
import type { Locale, RingConfig } from "@/lib/types";

const groups = [
  { key: "yellow", de: "Gelbgold", en: "Yellow gold" },
  { key: "white", de: "Weißgold", en: "White gold" },
  { key: "rose", de: "Roségold", en: "Rose gold" },
  { key: "platinum", de: "Platin", en: "Platinum" },
] as const;

function ShapeIcon({ code }: { code: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.2 };
  if (code === "princess") return <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6"><rect x="5" y="5" width="14" height="14" {...common} /></svg>;
  if (code === "oval") return <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6"><ellipse cx="12" cy="12" rx="6" ry="8" {...common} /></svg>;
  if (code === "emerald") return <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6"><path d="M8 4h8l4 4v8l-4 4H8l-4-4V8z" {...common} /></svg>;
  if (code === "pear") return <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6"><path d="M12 3c2 3 5 6 5 10a5 5 0 1 1-10 0c0-4 3-7 5-10z" {...common} /></svg>;
  if (code === "cushion") return <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6"><rect x="5" y="5" width="14" height="14" rx="4" {...common} /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6"><circle cx="12" cy="12" r="7" {...common} /></svg>;
}

export function Configurator({ l, initialMode }: { l: Locale; initialMode: RingConfig["mode"] }) {
  const t = dict(l);
  const { add } = useCart();
  const [ring, setRing] = useState<RingConfig>(() => defaultRingConfig(initialMode));
  const [view, setView] = useState<"out" | "in">("out");
  const [added, setAdded] = useState(false);
  const summary = describeRing(ring, l);
  const names = useMemo(() => ringNames(ring), [ring]);
  const patch = (next: Partial<RingConfig>) => {
    setAdded(false);
    setRing((current) => {
      const mode = next.mode ?? current.mode;
      return {
        ...current,
        ...next,
        mode,
        carat: mode === "blank" ? 0 : next.carat ?? (current.carat || 1),
        engraving: mode === "blank" ? "" : next.engraving ?? current.engraving,
        width_mm: mode === "blank" ? next.width_mm ?? (current.width_mm >= 2 ? current.width_mm : 4) : 1.9,
      };
    });
  };
  const choice = (on: boolean) => `min-h-11 border px-3 text-left text-sm transition-colors ${on ? "border-ink bg-ink text-ivory" : "border-line bg-white text-ink hover:border-ink"}`;
  const localeNum = (n: number, digits = 2) => n.toLocaleString(l === "de" ? "de-DE" : "en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });

  return (
    <div className="pb-20 pt-10 md:pt-16" data-testid="configurator">
      <header className="max-w-3xl pb-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-metal">{t.config.eyebrow}</p>
        <h1 className="mt-3 font-serif text-[2.6rem] leading-[1.02] tracking-[-0.02em] md:text-6xl">{t.config.title}</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-stone">{t.config.lead}</p>
      </header>
      <div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-start lg:gap-14">
        <div>
          <div className="relative aspect-square w-full lg:aspect-auto lg:h-[min(720px,calc(100vh-10rem))]">
            <RingStage
              config={ring}
              view={view}
              label={summary}
              fallbackId={ring.mode === "blank" ? "ring-blanks" : "engagement-ring-solitaire"}
            />
          </div>
          <div className="mt-3 flex gap-2">
            {(["out", "in"] as const).map((item) => (
              <button key={item} type="button" aria-pressed={view === item} onClick={() => setView(item)} className={`min-h-11 px-4 text-[11px] uppercase tracking-[0.14em] ${view === item ? "bg-ink text-ivory" : "border border-line bg-white text-ink"}`}>
                {item === "in" ? t.config.inside : t.config.outside}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-stone">{t.config.drag}</p>
          <p className="mt-1 text-sm text-stone">{t.config.modelNote}</p>
        </div>

        <div className="mt-10 space-y-10 lg:mt-0">
          <fieldset>
            <legend className="text-[11px] uppercase tracking-[0.18em] text-stone">{l === "de" ? "Art" : "Piece"}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(["finished", "blank"] as const).map((mode) => (
                <button key={mode} type="button" aria-pressed={ring.mode === mode} className={choice(ring.mode === mode)} onClick={() => patch({ mode })}>
                  <span className="block font-medium">{mode === "finished" ? t.config.finished : t.config.blank}</span>
                  <span className={`mt-1 block text-xs ${ring.mode === mode ? "text-ivory/80" : "text-stone"}`}>{mode === "finished" ? t.config.finishedHelp : t.config.blankHelp}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[11px] uppercase tracking-[0.18em] text-stone">{t.config.metal}</legend>
            <div className="mt-4 space-y-4">
              {groups.map((group) => {
                const metals = METALS.filter((item) => item.group === group.key);
                return (
                  <div key={group.key}>
                    <p className="text-sm">{l === "de" ? group.de : group.en}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {metals.map((item) => (
                        <button key={item.code} type="button" aria-pressed={ring.metal === item.code} className={`${choice(ring.metal === item.code)} inline-flex items-center gap-3`} onClick={() => patch({ metal: item.code })}>
                          <span className="h-5 w-5 shrink-0 rounded-full border border-black/10" style={{ background: item.color }} aria-hidden />
                          <span>{item.fineness}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>

          {ring.mode === "finished" && (
            <>
              <fieldset>
                <legend className="text-[11px] uppercase tracking-[0.18em] text-stone">{t.config.shape}</legend>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {SHAPES.map((shape) => (
                    <button key={shape.code} type="button" aria-pressed={ring.shape === shape.code} className={`${choice(ring.shape === shape.code)} flex flex-col items-center justify-center gap-2 py-3`} onClick={() => patch({ shape: shape.code })}>
                      <ShapeIcon code={shape.code} />
                      <span>{l === "de" ? shape.de : shape.en}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div>
                <div className="flex items-end justify-between gap-4">
                  <label htmlFor="carat" className="text-[11px] uppercase tracking-[0.18em] text-stone">{t.config.carat}</label>
                  <p className="font-serif text-4xl leading-none">{localeNum(ring.carat)}</p>
                </div>
                <input id="carat" type="range" min={CARAT_MIN} max={CARAT_MAX} step={0.05} value={ring.carat} onChange={(e) => patch({ carat: Number(e.target.value) })} aria-valuetext={`${localeNum(ring.carat)} ct`} />
                <p className="text-sm text-stone">{t.config.caratWidth(localeNum(caratToDiameter(ring.carat), 1))}</p>
              </div>
              <fieldset>
                <legend className="text-[11px] uppercase tracking-[0.18em] text-stone">{t.config.setting}</legend>
                <div className="mt-3 grid gap-2">
                  {SETTINGS.map((setting) => (
                    <button key={setting.code} type="button" aria-pressed={ring.setting === setting.code} className={choice(ring.setting === setting.code)} onClick={() => patch({ setting: setting.code })}>
                      <span className="block">{l === "de" ? setting.de : setting.en}</span>
                      <span className={`mt-1 block text-xs ${ring.setting === setting.code ? "text-ivory/80" : "text-stone"}`}>{t.config.settingHelp[setting.code]}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-stone">{t.config.stoneNote} <a className="underline" href={`${SISTER.diamonds}/${l}`}>{l === "de" ? "Fatlum Diamonds" : "Fatlum Diamonds"}</a></p>
              </fieldset>
            </>
          )}

          {ring.mode === "blank" && (
            <fieldset>
              <legend className="text-[11px] uppercase tracking-[0.18em] text-stone">{t.config.width}</legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {BLANK_WIDTHS.map((width) => (
                  <button key={width} type="button" aria-pressed={ring.width_mm === width} className={choice(ring.width_mm === width)} onClick={() => patch({ width_mm: width })}>
                    {localeNum(width, 1)} mm
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div>
            <div className="flex items-end justify-between gap-4">
              <label htmlFor="size" className="text-[11px] uppercase tracking-[0.18em] text-stone">{t.config.size}</label>
              <p className="font-serif text-4xl leading-none">{ring.size_mm}</p>
            </div>
            <input id="size" type="range" min={SIZE_MIN} max={SIZE_MAX} step={1} value={ring.size_mm} onChange={(e) => patch({ size_mm: Number(e.target.value) })} aria-valuetext={`${ring.size_mm} mm`} />
            <p className="text-sm text-stone">{t.config.sizeHelp}</p>
            <p className="mt-1 text-sm text-stone">{t.config.diameter(localeNum(diameterMm(ring.size_mm), 1))} · US {usSize(ring.size_mm)} · UK {ukSize(ring.size_mm)}. {t.config.approx}</p>
            <Link href={`/${l}/ratgeber/ringgroesse`} className="mt-2 inline-flex min-h-11 items-center text-sm underline">{l === "de" ? "Größentabelle" : "Size chart"}</Link>
          </div>

          {ring.mode === "finished" && (
            <div>
              <label htmlFor="engraving" className="text-[11px] uppercase tracking-[0.18em] text-stone">{t.config.engraving}</label>
              <input id="engraving" value={ring.engraving} maxLength={ENGRAVING_MAX} onChange={(e) => patch({ engraving: sanitizeEngraving(e.target.value) })} className="field mt-3" autoComplete="off" />
              <p className="mt-2 text-sm text-stone">{t.config.engravingHelp} {ring.engraving.length}/{ENGRAVING_MAX}</p>
              <p className={`mt-3 border border-line bg-white px-4 py-4 text-center font-serif text-2xl ${ring.engraving ? "text-ink" : "text-stone"}`} aria-live="polite">
                {ring.engraving || t.config.engravingEmpty}
              </p>
            </div>
          )}

          <section className="border-t border-line pt-8" aria-label={t.config.summary}>
            <h2 className="font-serif text-3xl">{t.config.summary}</h2>
            <p className="mt-4 text-sm leading-relaxed">{summary}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-stone">{t.price}</p>
            <button
              type="button"
              className="btn btn-line mt-5 w-full sm:w-auto"
              onClick={() => {
                add({ key: crypto.randomUUID(), kind: "configuration", qty: 1, sku: names.sku, name_de: names.name_de, name_en: names.name_en, detail_de: names.detail_de, detail_en: names.detail_en, payload: ring });
                setAdded(true);
              }}
            >
              {added ? t.config.added : t.config.add}
            </button>
            {added && <Link href={`/${l}/anfrage`} className="ml-0 mt-3 inline-flex min-h-11 items-center text-sm underline sm:ml-4">{t.toRequest}</Link>}
            <div className="mt-8">
              <EnquiryForm
                locale={l}
                source="request_list"
                submitLabel={t.config.reserve}
                items={[{ kind: "configuration", qty: 1, payload: ring }]}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
