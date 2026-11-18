import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/chrome";
import { ProfileMark } from "@/components/glyphs";
import { getOptions } from "@/lib/catalog";
import { getGuide, guideSlugs } from "@/lib/content";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
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
  return { title: guide.title, description: guide.description, alternates: { languages: { de: `/de/ratgeber/${slug}`, en: `/en/ratgeber/${slug}` } } };
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
      <h1 className="font-serif text-4xl text-navy">{guide.title}</h1>
      <p className="mt-3 max-w-2xl text-gray-700">{guide.description}</p>
      {guide.blocks.map((block) => (
        <section key={block.heading} className="mt-8 max-w-3xl">
          <h2 className="font-serif text-2xl text-secondary">{block.heading}</h2>
          {block.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 24)} className="mt-3 leading-relaxed">{paragraph}</p>)}
        </section>
      ))}
      {slug === "ringgroesse" && options && (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">{guide.title}</caption>
            <thead className="bg-navy text-white"><tr><th className="px-3 py-2">{locale === "en" ? "German size" : "Deutsche Größe"}</th><th className="px-3 py-2">Ø mm</th><th className="px-3 py-2">US</th><th className="px-3 py-2">UK</th></tr></thead>
            <tbody>
              {options.sizes.filter((_, index) => index % 2 === 0).map((size) => (
                <tr key={size.size_mm} className="odd:bg-cream"><td className="px-3 py-1.5">{size.size_mm}</td><td className="px-3 py-1.5">{diameterMm(size.size_mm)}</td><td className="px-3 py-1.5">{usSize(size.size_mm)}</td><td className="px-3 py-1.5">{ukSize(size.size_mm)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-gray-500">{locale === "en" ? "US and UK columns are approximate." : "US- und UK-Spalten sind ungefähr."}</p>
        </div>
      )}
      {slug === "legierungen" && options && (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {options.alloys.map((alloy) => (
            <li key={alloy.code} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
              <span className="h-10 w-10 rounded-full border border-black/10" style={{ background: alloy.hex_color }} />
              <span><span className="block font-serif text-xl text-navy">{alloy.fineness} {locale === "en" ? alloy.color_en : alloy.color_de}</span><span className="text-xs text-gray-500">{alloy.density} g/cm³</span></span>
            </li>
          ))}
        </ul>
      )}
      {slug === "profile" && options && (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {options.profiles.map((profile) => (
            <li key={profile.code} className="rounded-xl border border-gray-200 p-3">
              <ProfileMark path={profile.svg_path} />
              <p className="mt-2 font-serif text-lg text-navy">{locale === "en" ? profile.name_en : profile.name_de}</p>
              <p className="text-xs text-gray-600">{locale === "en" ? profile.description_en : profile.description_de}</p>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
