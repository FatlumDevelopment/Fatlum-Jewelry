"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "./cart";
import { ProfileMark, RingSketch, SectionSketch, type PreviewRing } from "./glyphs";
import { dict } from "@/lib/i18n";
import { clampRing, copyDesign, defaultRing, diameterMm, estimateWeight, findAlloy, findFinish, findFont, findProfile, findStone, stepsFor, ukSize, usSize, type StepId } from "@/lib/ring";
import type { CatalogOptions, ConfigMode, Locale, MetalGroup, RingDraft } from "@/lib/types";

const GROUPS: MetalGroup[] = ["gold", "silver", "platinum", "palladium"];

export function Configurator({ l, options }: { l: Locale; options: CatalogOptions }) {
  const t = dict(l).config;
  const { add } = useCart();
  const [mode, setMode] = useState<ConfigMode>("single");
  const [step, setStep] = useState<StepId>("mode");
  const [active, setActive] = useState<0 | 1>(0);
  const [linked, setLinked] = useState(true);
  const [rings, setRings] = useState<[RingDraft, RingDraft]>([defaultRing(54), defaultRing(52)]);
  const [added, setAdded] = useState(false);

  const steps = stepsFor(mode);
  const index = Math.max(0, steps.indexOf(step));
  const current = rings[active];

  function write(next: RingDraft, which: 0 | 1 = active) {
    setRings((prev) => {
      const copy: [RingDraft, RingDraft] = [{ ...prev[0] }, { ...prev[1] }];
      const clamped = clampRing(next, options, mode);
      copy[which] = clamped;
      if (mode === "pair" && linked) {
        const other = which === 0 ? 1 : 0;
        copy[other] = clampRing(copyDesign(clamped, prev[other].size_mm), options, mode);
      }
      return copy;
    });
    setAdded(false);
  }

  function changeMode(next: ConfigMode) {
    setMode(next);
    setStep("mode");
    setActive(0);
    setRings((prev) => {
      const first = clampRing(prev[0], options, next);
      const second = clampRing(next === "pair" ? { ...copyDesign(first, prev[1].size_mm === first.size_mm ? Math.max(44, first.size_mm - 4) : prev[1].size_mm) } : prev[1], options, next);
      return [first, second];
    });
  }

  const preview = useMemo(() => rings.map((ring) => toPreview(ring, options)), [rings, options]);
  const weights = rings.map((ring) => {
    const profile = findProfile(options, ring.profile);
    const alloy = findAlloy(options, ring.alloy);
    if (!profile || !alloy) return 0;
    return estimateWeight(ring, profile, alloy);
  });

  function addConfig() {
    const used = mode === "pair" ? rings : [rings[0]];
    const names = used.map((ring, i) => labelFor(ring, options, l, mode === "pair" ? i + 1 : 0));
    const nameDe = `${mode === "pair" ? "Trauringpaar" : mode === "blank" ? "Rohling" : "Einzelring"} · ${names.map((n) => n.de).join(" · ")}`;
    const nameEn = `${mode === "pair" ? "Wedding pair" : mode === "blank" ? "Blank" : "Single ring"} · ${names.map((n) => n.en).join(" · ")}`;
    add({
      key: crypto.randomUUID(),
      kind: "configuration",
      qty: 1,
      sku: mode === "blank" ? "FJ-ROH" : "FJ-KONFIG",
      name_de: nameDe,
      name_en: nameEn,
      detail_de: names.map((n) => n.detailDe).join("\n"),
      detail_en: names.map((n) => n.detailEn).join("\n"),
      payload: { mode, rings: used.map((ring) => clampRing(ring, options, mode)) },
    });
    setAdded(true);
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]" data-testid="configurator">
      <div>
        <ol className="flex flex-wrap gap-2" aria-label={t.title}>
          {steps.map((id, i) => (
            <li key={id}>
              <button type="button" onClick={() => setStep(id)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${i === index ? "bg-gold text-navy" : i < index ? "bg-navy text-white" : "bg-cream text-gray-600"}`} aria-current={i === index ? "step" : undefined}>
                {i + 1}. {t.steps[id]}
              </button>
            </li>
          ))}
        </ol>

        {mode === "pair" && step !== "mode" && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {([0, 1] as const).map((n) => (
              <button key={n} type="button" onClick={() => setActive(n)} className={`rounded-full px-4 py-1.5 text-sm ${active === n ? "bg-navy text-white" : "border border-navy text-navy"}`}>{t.ring(n + 1)} · {rings[n].size_mm}</button>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={linked} onChange={(e) => {
                const on = e.target.checked;
                setLinked(on);
                if (on) setRings((prev) => {
                  const source = prev[active];
                  const other = active === 0 ? 1 : 0;
                  const next: [RingDraft, RingDraft] = [...prev] as [RingDraft, RingDraft];
                  next[other] = clampRing(copyDesign(source, prev[other].size_mm), options, mode);
                  return next;
                });
              }} className="accent-[#bf9e50]" />
              {t.link}
            </label>
          </div>
        )}

        <div className="mt-6">
          {step === "mode" && (
            <div className="grid gap-3 md:grid-cols-3">
              {(["single", "pair", "blank"] as const).map((id) => (
                <button key={id} type="button" onClick={() => changeMode(id)} className={`rounded-xl border p-4 text-left ${mode === id ? "border-gold bg-cream" : "border-gray-200 hover:border-gold"}`}>
                  <span className="font-serif text-2xl text-navy">{t.modes[id][0]}</span>
                  <span className="mt-2 block text-sm text-gray-600">{t.modes[id][1]}</span>
                </button>
              ))}
            </div>
          )}

          {step === "profile" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {options.profiles.map((profile) => {
                const on = current.profile === profile.code;
                return (
                  <button key={profile.code} type="button" onClick={() => write({ ...current, profile: profile.code })} className={`rounded-xl border p-3 text-left ${on ? "border-gold bg-cream" : "border-gray-200"}`}>
                    <ProfileMark path={profile.svg_path} active={on} />
                    <span className="mt-2 block font-serif text-lg text-navy">{l === "en" ? profile.name_en : profile.name_de}</span>
                    <span className="block text-xs text-gray-600">{l === "en" ? profile.description_en : profile.description_de}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step === "width" && <Measure label={t.steps.width} help={t.widthHelp} value={current.width_mm} min={findProfile(options, current.profile)?.min_width_mm ?? 2} max={findProfile(options, current.profile)?.max_width_mm ?? 8} onChange={(width_mm) => write({ ...current, width_mm })} />}
          {step === "height" && <Measure label={t.steps.height} help={t.heightHelp} value={current.height_mm} min={findProfile(options, current.profile)?.min_height_mm ?? 1.2} max={findProfile(options, current.profile)?.max_height_mm ?? 2.6} onChange={(height_mm) => write({ ...current, height_mm })} />}

          {step === "size" && (
            <div>
              <p className="text-sm text-gray-600">{t.diameter}: {diameterMm(current.size_mm).toLocaleString(l === "en" ? "en-GB" : "de-DE")} {t.mm} · US {usSize(current.size_mm)} ({t.approx}) · UK {ukSize(current.size_mm)} ({t.approx})</p>
              <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8">
                {options.sizes.map((size) => (
                  <button key={size.size_mm} type="button" onClick={() => write({ ...current, size_mm: size.size_mm })} className={`rounded py-2 text-sm ${current.size_mm === size.size_mm ? "bg-navy text-white" : "bg-cream text-navy hover:bg-gold-light"}`}>{size.size_mm}</button>
                ))}
              </div>
              <Link href={`/${l}/ratgeber/ringgroesse`} className="mt-4 inline-block text-sm text-secondary underline">{t.sizeGuide}</Link>
            </div>
          )}

          {step === "alloy" && (
            <div className="space-y-6">
              {GROUPS.map((group) => {
                const rows = options.alloys.filter((alloy) => alloy.metal_group === group);
                if (!rows.length) return null;
                return (
                  <section key={group}>
                    <h3 className="font-serif text-xl text-navy">{t.groups[group]}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rows.map((alloy) => {
                        const on = current.alloy === alloy.code;
                        const name = `${alloy.fineness} ${l === "en" ? alloy.color_en : alloy.color_de}`;
                        return (
                          <button key={alloy.code} type="button" onClick={() => write({ ...current, alloy: alloy.code })} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${on ? "border-navy bg-navy text-white" : "border-gray-300"}`}>
                            <span className="h-4 w-4 rounded-full border border-black/10" style={{ background: alloy.hex_color }} />
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {step === "grooves" && (
            <GrooveStep l={l} options={options} ring={current} onChange={(groove) => write({ ...current, groove })} />
          )}

          {step === "finish" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {options.finishes.map((finish) => {
                const on = current.finish === finish.code;
                return (
                  <button key={finish.code} type="button" onClick={() => write({ ...current, finish: finish.code })} className={`rounded-xl border p-4 text-left ${on ? "border-gold bg-cream" : "border-gray-200"}`}>
                    <span className="font-serif text-xl text-navy">{l === "en" ? finish.name_en : finish.name_de}</span>
                    <span className="mt-1 block text-sm text-gray-600">{l === "en" ? finish.description_en : finish.description_de}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step === "stones" && <StoneStep l={l} options={options} ring={current} onChange={(stone) => write({ ...current, stone })} />}

          {step === "engraving" && (
            <div className="max-w-lg">
              <label className="block text-sm" htmlFor="engraving">{t.engravingLabel}
                <input id="engraving" value={current.engraving.text} maxLength={24} onChange={(e) => write({ ...current, engraving: { ...current.engraving, text: e.target.value } })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
              </label>
              <p className="mt-1 text-xs text-gray-500">{t.engravingHelp}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {options.fonts.map((font) => (
                  <button key={font.code} type="button" onClick={() => write({ ...current, engraving: { ...current.engraving, font: font.code } })} className={`rounded border px-3 py-3 ${current.engraving.font === font.code ? "border-gold bg-cream" : "border-gray-200"}`} style={{ fontFamily: font.css_family, fontVariant: font.variant === "caps" ? "small-caps" : "normal" }}>
                    {l === "en" ? font.name_en : font.name_de}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "summary" && (
            <div>
              {(mode === "pair" ? [0, 1] : [0]).map((n) => {
                const ring = rings[n]!;
                const profile = findProfile(options, ring.profile);
                const alloy = findAlloy(options, ring.alloy);
                const finish = findFinish(options, ring.finish);
                const stone = findStone(options, ring.stone.code);
                return (
                  <section key={n} className="mt-4 rounded-xl border border-gray-200 p-4">
                    {mode === "pair" && <h3 className="font-serif text-2xl text-navy">{t.ring(n + 1)}</h3>}
                    <dl className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
                      <dt className="text-gray-500">{t.steps.profile}</dt><dd>{profile ? (l === "en" ? profile.name_en : profile.name_de) : ring.profile}</dd>
                      <dt className="text-gray-500">{t.steps.width}</dt><dd>{ring.width_mm} mm</dd>
                      <dt className="text-gray-500">{t.steps.height}</dt><dd>{ring.height_mm} mm</dd>
                      <dt className="text-gray-500">{t.steps.size}</dt><dd>{ring.size_mm} · Ø {diameterMm(ring.size_mm)} mm</dd>
                      <dt className="text-gray-500">{t.steps.alloy}</dt><dd>{alloy ? `${alloy.fineness} ${l === "en" ? alloy.color_en : alloy.color_de}` : ring.alloy}</dd>
                      <dt className="text-gray-500">{t.steps.grooves}</dt><dd>{ring.groove.code === "none" ? (l === "en" ? "None" : "Keine") : `${ring.groove.code.toUpperCase()} ${ring.groove.width_mm} × ${ring.groove.depth_mm} mm`}</dd>
                      <dt className="text-gray-500">{t.steps.finish}</dt><dd>{finish ? (l === "en" ? finish.name_en : finish.name_de) : ring.finish}</dd>
                      {mode !== "blank" && <><dt className="text-gray-500">{t.steps.stones}</dt><dd>{stone ? (l === "en" ? stone.name_en : stone.name_de) : ring.stone.code}{ring.stone.code !== "none" ? ` · ${ring.stone.count} × ${ring.stone.size_mm} mm` : ""}</dd></>}
                      {mode !== "blank" && <><dt className="text-gray-500">{t.steps.engraving}</dt><dd>{ring.engraving.text || "—"}</dd></>}
                      <dt className="text-gray-500">{t.weight}</dt><dd>{tWeight(weights[n] ?? 0, l)}</dd>
                    </dl>
                  </section>
                );
              })}
              <p className="mt-3 text-xs text-gray-500">{t.weightNote}</p>
              <p className="mt-4 text-sm font-medium text-secondary">{dict(l).price}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={addConfig} className="rounded bg-navy px-5 py-3 text-white hover:bg-secondary">{added ? t.added : t.add}</button>
                {added && <Link href={`/${l}/anfrage`} className="rounded border border-navy px-5 py-3 text-navy">{t.toList}</Link>}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          <button type="button" disabled={index === 0} onClick={() => setStep(steps[index - 1] ?? "mode")} className="rounded border border-gray-300 px-4 py-2 text-sm disabled:opacity-40">{t.back}</button>
          {step !== "summary" && <button type="button" onClick={() => setStep(steps[index + 1] ?? "summary")} className="rounded bg-navy px-5 py-2 text-sm text-white hover:bg-secondary">{index === steps.length - 2 ? t.summary : t.next}</button>}
        </div>
      </div>

      <aside className="order-first rounded-2xl border border-gold/30 bg-white p-4 lg:sticky lg:top-28 lg:order-none">
        <p className="font-serif text-xl text-navy">{l === "en" ? "Preview" : "Vorschau"}</p>
        <RingSketch uid="live" rings={mode === "pair" ? preview : [preview[active]!]} pair={mode === "pair"} label={t.title} />
        <div className="mt-3 flex items-center gap-3">
          <SectionSketch path={findProfile(options, current.profile)?.svg_path || ""} hex={findAlloy(options, current.alloy)?.hex_color || "#E0B84A"} width={current.width_mm} height={current.height_mm} groove={current.groove.code} />
          <div className="text-sm">
            <p className="font-medium text-navy">{findProfile(options, current.profile) ? (l === "en" ? findProfile(options, current.profile)!.name_en : findProfile(options, current.profile)!.name_de) : ""}</p>
            <p className="text-gray-600">{current.width_mm} × {current.height_mm} mm · {current.size_mm}</p>
            <p className="text-gray-600">{t.weight} {tWeight(weights[active] ?? 0, l)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">{t.sketchNote}</p>
        {mode === "blank" && <p className="mt-2 text-xs text-gray-500">{t.blankNote}</p>}
      </aside>
    </div>
  );
}

function Measure({ label, help, value, min, max, step = 0.1, unit = "mm", onChange }: { label: string; help: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (n: number) => void }) {
  const safeMax = Math.max(min, max);
  const safe = Math.min(safeMax, Math.max(min, value));
  return (
    <div className="max-w-lg">
      <label className="block font-serif text-3xl text-navy" htmlFor={label}>{label}: {safe.toLocaleString("de-DE")} {unit}
        <input id={label} type="range" min={min} max={safeMax} step={step} value={safe} onChange={(e) => onChange(Number(e.target.value))} className="mt-4 block w-full accent-[#03123f]" />
      </label>
      <p className="mt-2 text-sm text-gray-600">{help} {min}–{roundRange(safeMax)} {unit}.</p>
    </div>
  );
}
function roundRange(n: number) { return Math.round(n * 10) / 10; }

function GrooveStep({ l, options, ring, onChange }: { l: Locale; options: CatalogOptions; ring: RingDraft; onChange: (g: RingDraft["groove"]) => void }) {
  const t = dict(l).config;
  const profile = findProfile(options, ring.profile);
  if (!profile?.allows_groove) return <p className="text-sm">{t.grooveNone}</p>;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.grooves.map((groove) => (
          <button key={groove.code} type="button" onClick={() => onChange({ ...ring.groove, code: groove.code })} className={`rounded-full border px-4 py-2 text-sm ${ring.groove.code === groove.code ? "border-navy bg-navy text-white" : "border-gray-300"}`}>{l === "en" ? groove.name_en : groove.name_de}</button>
        ))}
      </div>
      {ring.groove.code !== "none" && (
        <div className="mt-4 grid max-w-lg gap-4">
          <Measure label={t.grooveWidth} help="" value={ring.groove.width_mm} min={options.grooves.find((g) => g.code === ring.groove.code)?.min_width_mm ?? 0.2} max={Math.min(options.grooves.find((g) => g.code === ring.groove.code)?.max_width_mm ?? 2, Math.max(0.3, ring.width_mm - 1))} onChange={(width_mm) => onChange({ ...ring.groove, width_mm })} />
          <Measure label={t.grooveDepth} help="" value={ring.groove.depth_mm} min={options.grooves.find((g) => g.code === ring.groove.code)?.min_depth_mm ?? 0.15} max={Math.min(options.grooves.find((g) => g.code === ring.groove.code)?.max_depth_mm ?? 0.8, Math.max(0.2, ring.height_mm - 0.7))} onChange={(depth_mm) => onChange({ ...ring.groove, depth_mm })} />
        </div>
      )}
    </div>
  );
}

function StoneStep({ l, options, ring, onChange }: { l: Locale; options: CatalogOptions; ring: RingDraft; onChange: (s: RingDraft["stone"]) => void }) {
  const t = dict(l).config;
  const profile = findProfile(options, ring.profile);
  if (!profile?.allows_stones) return <p className="text-sm">{t.stonesNone}</p>;
  const spec = findStone(options, ring.stone.code);
  return (
    <div>
      <p className="mb-3 text-sm text-gray-600">{t.stoneNote} <a className="underline" href="https://little-mistyrose-starling-03.hostingersite.com">Fatlum Diamonds</a></p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.stones.map((stone) => (
          <button key={stone.code} type="button" onClick={() => onChange(stone.code === "none" ? { code: "none", count: 0, size_mm: 0 } : { code: stone.code, count: stone.min_count || 1, size_mm: stone.min_size_mm || 1.5 })} className={`rounded-xl border p-4 text-left ${ring.stone.code === stone.code ? "border-gold bg-cream" : "border-gray-200"}`}>
            <span className="font-serif text-xl text-navy">{l === "en" ? stone.name_en : stone.name_de}</span>
            <span className="mt-1 block text-sm text-gray-600">{l === "en" ? stone.description_en : stone.description_de}</span>
          </button>
        ))}
      </div>
      {ring.stone.code !== "none" && spec && (
        <div className="mt-4 grid max-w-lg gap-4">
          {ring.stone.code !== "solitaire" && <Measure label={t.count} help="" unit="" value={ring.stone.count} min={spec.min_count} max={spec.max_count} step={1} onChange={(count) => onChange({ ...ring.stone, count })} />}
          <Measure label={t.stoneSize} help="" value={ring.stone.size_mm} min={spec.min_size_mm} max={Math.min(spec.max_size_mm, Math.max(spec.min_size_mm, ring.width_mm * 0.72))} onChange={(size_mm) => onChange({ ...ring.stone, size_mm })} />
        </div>
      )}
    </div>
  );
}

function toPreview(ring: RingDraft, options: CatalogOptions): PreviewRing {
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

function labelFor(ring: RingDraft, options: CatalogOptions, _l: Locale, n: number) {
  const profile = findProfile(options, ring.profile);
  const alloy = findAlloy(options, ring.alloy);
  const deName = profile?.name_de ?? ring.profile;
  const enName = profile?.name_en ?? ring.profile;
  const deAlloy = alloy ? `${alloy.fineness} ${alloy.color_de}` : ring.alloy;
  const enAlloy = alloy ? `${alloy.fineness} ${alloy.color_en}` : ring.alloy;
  const prefixDe = n ? `Ring ${n}: ` : "";
  const prefixEn = n ? `Ring ${n}: ` : "";
  return {
    de: `${deName}, ${deAlloy}, ${ring.size_mm}`,
    en: `${enName}, ${enAlloy}, ${ring.size_mm}`,
    detailDe: `${prefixDe}${deName}, ${ring.width_mm} × ${ring.height_mm} mm, Größe ${ring.size_mm}, ${deAlloy}`,
    detailEn: `${prefixEn}${enName}, ${ring.width_mm} × ${ring.height_mm} mm, size ${ring.size_mm}, ${enAlloy}`,
  };
}

function tWeight(grams: number, l: Locale) {
  return `${grams.toLocaleString(l === "en" ? "en-GB" : "de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} g`;
}
