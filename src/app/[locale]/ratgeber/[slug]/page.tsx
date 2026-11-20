import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/chrome";
import { ProfileMark } from "@/components/glyphs";
import { getOptions } from "@/lib/catalog";
import { getGuide, guideSlugs } from "@/lib/content";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { pageMeta } from "@/lib/seo";
import { diameterMm, ukSize, usSize } from "@/lib/ring";
import { locales } from "@/lib/types";

export async function generateStaticParams() {
  return locales.flatMap((locale) => guideSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await takeLocale(params);
  const guide = getGuide(slug, locale);
  if (!guide) return {};
  return pageMeta(locale, guide.title, guide.description, `/ratgeber/${slug}`);
}

export default async function GuidePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const locale = await takeLocale(params);
  const guide = getGuide(slug, locale);
  if (!guide) notFound();
  const t = dict(locale);
  const options = slug === "profile" || slug === "legierungen" || slug === "ringgroesse" ? await getOptions() : null;
  return (
    <Shell l={locale} crumbs={[{ href: `/${locale}/ratgeber`, label: t.nav.guides }, { label: guide.title }]}>
      <header className="max-w-3xl">
        <h1 className="font-serif text-[2.6rem] leading-[1.02] md:text-6xl">{guide.title}</h1>
        <p className="mt-4 max-w-xl text-stone">{guide.description}</p>
      </header>
      {guide.blocks.map((block) => (
        <section key={block.heading} className="mt-10 max-w-2xl">
          <h2 className="font-serif text-3xl">{block.heading}</h2>
          {block.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 40)} className="mt-3 leading-relaxed">{paragraph}</p>)}
        </section>
      ))}
      {slug === "ringgroesse" && options && (
        <div className="mt-10 max-w-3xl overflow-x-auto" tabIndex={0}>
          <table className="w-full min-w-[28rem] text-left text-sm">
            <caption className="sr-only">{guide.title}</caption>
            <thead className="border-b border-ink text-[11px] uppercase tracking-[0.14em]">
              <tr>
                <th className="py-3 pr-4 font-medium">{locale === "en" ? "German size" : "Deutsche Größe"}</th>
                <th className="py-3 pr-4 font-medium">Ø mm</th>
                <th className="py-3 pr-4 font-medium">US</th>
                <th className="py-3 font-medium">UK</th>
              </tr>
            </thead>
            <tbody>
              {options.sizes.map((size) => (
                <tr key={size.size_mm} className="border-b border-line">
                  <td className="py-2 pr-4">{size.size_mm}</td>
                  <td className="py-2 pr-4">{diameterMm(size.size_mm)}</td>
                  <td className="py-2 pr-4">{usSize(size.size_mm)}</td>
                  <td className="py-2">{ukSize(size.size_mm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-stone">{locale === "en" ? "US and UK columns are approximate." : "US- und UK-Spalten sind ungefähr."}</p>
        </div>
      )}
      {slug === "legierungen" && options && (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {options.alloys.map((alloy) => (
            <li key={alloy.code} className="flex min-h-16 items-center gap-4 py-3">
              <span className="h-8 w-8 shrink-0 rounded-full border border-black/10" style={{ background: alloy.hex_color }} />
              <span className="font-serif text-2xl">{alloy.fineness} {locale === "en" ? alloy.color_en : alloy.color_de}</span>
              <span className="ml-auto text-sm text-stone">{alloy.density} g/cm³</span>
            </li>
          ))}
        </ul>
      )}
      {slug === "profile" && options && (
        <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {options.profiles.map((profile) => (
            <li key={profile.code}>
              <ProfileMark path={profile.svg_path} />
              <p className="mt-2 font-serif text-xl">{locale === "en" ? profile.name_en : profile.name_de}</p>
              <p className="mt-1 text-sm text-stone">{locale === "en" ? profile.description_en : profile.description_de}</p>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
