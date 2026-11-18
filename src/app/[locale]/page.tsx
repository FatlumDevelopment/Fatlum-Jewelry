import Link from "next/link";
import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { ProductGlyph } from "@/components/glyphs";
import { getCategories, getProducts } from "@/lib/catalog";
import { guideIndex } from "@/lib/content";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return { title: t.meta.homeTitle, description: t.meta.homeDescription };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const featured = ["trauringe", "verlobungsringe", "weitere-ringe", "ketten", "ohrringe", "anhaenger"]
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category) => category !== undefined);
  const preview = products.filter((product) => ["aurelia", "solis", "lina", "ronda"].includes(product.slug));
  return (
    <Shell l={locale}>
      <section className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-navy via-secondary to-navy px-6 py-12 text-white md:px-12" data-testid="home-hero">
        <p className="text-xs tracking-[0.28em] text-gold">{t.hero.kicker}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl text-gold md:text-6xl">{t.hero.title}</h1>
        <p className="mt-4 max-w-2xl text-white/85">{t.hero.text}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/${locale}/konfigurator`} className="rounded-full bg-gold px-5 py-2.5 font-medium text-navy hover:bg-gold-light">{t.hero.ctaConfig}</Link>
          <Link href={`/${locale}/kollektion/trauringe`} className="rounded-full border border-white/40 px-5 py-2.5 hover:border-gold hover:text-gold">{t.hero.ctaRings}</Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-3xl text-navy">{t.landing.collectionsTitle}</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {featured.slice(0, 3).map((category) => (
            <li key={category.slug}>
              <Link href={`/${locale}/kollektion/${category.slug}`} className="block h-full rounded-xl border border-gold/30 bg-cream p-5 hover:border-gold">
                <h3 className="font-serif text-2xl text-navy">{locale === "en" ? category.name_en : category.name_de}</h3>
                <p className="mt-2 text-sm text-gray-700">{locale === "en" ? category.description_en : category.description_de}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 grid items-center gap-8 rounded-2xl bg-cream p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div>
          <h2 className="font-serif text-3xl text-navy">{t.landing.configTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed">{t.landing.configText}</p>
          <ul className="mt-5 space-y-3">
            {t.landing.modes.map(([title, text]) => (
              <li key={title}><p className="font-serif text-xl text-secondary">{title}</p><p className="text-sm text-gray-700">{text}</p></li>
            ))}
          </ul>
          <Link href={`/${locale}/konfigurator`} className="mt-6 inline-block rounded bg-navy px-5 py-2.5 text-white hover:bg-secondary">{t.hero.ctaConfig}</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {preview.map((product) => (
            <Link key={product.slug} href={`/${locale}/schmuck/${product.slug}`} className="overflow-hidden rounded-xl bg-white">
              <ProductGlyph uid={`home-${product.slug}`} kind={product.glyph} tone={product.tone} title={locale === "en" ? product.name_en : product.name_de} />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-3xl text-navy">{t.landing.jewelryTitle}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {featured.slice(3).map((category) => (
            <li key={category.slug}><Link href={`/${locale}/kollektion/${category.slug}`} className="block rounded-xl border border-gray-200 p-5 hover:border-gold"><h3 className="font-serif text-2xl text-navy">{locale === "en" ? category.name_en : category.name_de}</h3><p className="mt-2 text-sm">{locale === "en" ? category.description_en : category.description_de}</p></Link></li>
          ))}
        </ul>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.landing.trust.map(([title, text]) => (
          <div key={title} className="rounded-xl border border-gold/30 p-4"><p className="font-serif text-xl text-navy">{title}</p><p className="mt-2 text-sm text-gray-600">{text}</p></div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-3xl text-navy">{t.landing.guidesTitle}</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-4">
          {guideIndex[locale].map((guide) => (
            <li key={guide.slug}><Link href={`/${locale}/ratgeber/${guide.slug}`} className="block h-full rounded-xl bg-navy p-4 text-white hover:bg-secondary"><h3 className="font-serif text-xl text-gold">{guide.title}</h3><p className="mt-2 text-sm text-white/80">{guide.text}</p></Link></li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
