import Link from "next/link";
import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { ProductVisual } from "@/components/product-visual";
import { StudioFrame } from "@/components/studio-image";
import { getProducts } from "@/lib/catalog";
import { guideIndex } from "@/lib/content";
import { dict } from "@/lib/i18n";
import { categoryPhoto, imageSizes, type JewelryId } from "@/lib/image-slots";
import { takeLocale } from "@/lib/locale";
import { SITE, pageMeta } from "@/lib/seo";
import { CONTACT } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return pageMeta(locale, locale === "de" ? t.meta.homeAbsoluteDe : t.meta.homeAbsoluteEn, t.meta.homeDescription, "", true);
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  const products = await getProducts();
  const featured = ["aurelia", "solis", "rosa", "klarheit"].map((slug) => products.find((item) => item.slug === slug)).filter((item) => item !== undefined);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: "Fatlum Jewelry",
    url: `${SITE}/${locale}`,
    image: `${SITE}/images/jewelry/hero-rings.webp`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    address: { "@type": "PostalAddress", streetAddress: CONTACT.street, postalCode: "80539", addressLocality: "München", addressCountry: "DE" },
  };
  return (
    <Shell l={locale} wide>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="grid items-center gap-8 pb-8 pt-4 lg:h-[calc(100svh-7rem)] lg:grid-cols-12 lg:gap-16 lg:pb-6 lg:pt-0" data-testid="home-hero">
        <div className="order-1 lg:order-2 lg:col-span-7">
          <StudioFrame id="hero-rings" locale={locale} sizes={imageSizes.hero} priority ratio="aspect-[5/4] sm:aspect-[4/3] lg:aspect-[4/3]" />
        </div>
        <div className="order-2 lg:order-1 lg:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-metal">{t.hero.kicker}</p>
          <h1 className="mt-4 font-serif text-[2.6rem] leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-7xl">{t.hero.title}</h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-stone md:text-base">{t.hero.text}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link className="inline-flex min-h-11 items-center border-b border-ink text-[11px] uppercase tracking-[0.18em]" href={`/${locale}/konfigurator`}>{t.hero.ctaConfig}</Link>
            <Link className="inline-flex min-h-11 items-center border-b border-line text-[11px] uppercase tracking-[0.18em] text-stone" href={`/${locale}/kollektion/trauringe`}>{t.hero.ctaRings}</Link>
          </div>
        </div>
      </section>

      <ul className="border-t border-line">
        {t.landing.rows.map(([title, note, href]) => {
          const thumb = (href === "/konfigurator" ? "hero-ring-macro" : categoryPhoto[href.split("/").pop() || ""]) as JewelryId | undefined;
          return (
            <li key={href} className="border-b border-line">
              <Link href={`/${locale}${href}`} className="group flex min-h-20 items-center gap-4 py-4 sm:gap-6 sm:py-5">
                {thumb ? <span className="relative block h-16 w-16 shrink-0 overflow-hidden sm:h-20 sm:w-24"><StudioFrame id={thumb} locale={locale} alt="" sizes="96px" ratio="h-full w-full" /></span> : null}
                <span className="min-w-0 flex-1 font-serif text-3xl leading-none sm:text-4xl md:text-5xl">{title}</span>
                <span className="hidden text-[11px] uppercase tracking-[0.16em] text-stone sm:block">{note}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="mt-16 md:mt-24">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl md:text-4xl">{t.landing.featured}</h2>
          <Link href={`/${locale}/kollektion/trauringe`} className="inline-flex min-h-11 items-center text-[11px] uppercase tracking-[0.16em] underline">{t.landing.allWedding}</Link>
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
          {featured.map((product, index) => {
            const name = locale === "en" ? product.name_en : product.name_de;
            return (
              <li key={product.slug}>
                <Link href={`/${locale}/schmuck/${product.slug}`} className="group block">
                  <ProductVisual slug={product.slug} glyph={product.glyph} tone={product.tone} alt="" locale={locale} priority={index === 0} />
                  <h3 className="mt-4 font-serif text-3xl group-hover:text-metal">{name}</h3>
                  <p className="mt-1 text-sm text-stone">{locale === "en" ? product.alloy_en : product.alloy_de}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.16em]">{t.price}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-16 md:mt-24">
        <StudioFrame id="hero-ring-macro" locale={locale} sizes={imageSizes.wide} ratio="aspect-video" />
      </section>

      <section className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <StudioFrame id="ring-blanks" locale={locale} sizes={imageSizes.hero} ratio="aspect-square" />
        <div>
          <h2 className="font-serif text-4xl md:text-5xl">{t.landing.houseTitle}</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-stone">{t.landing.houseText}</p>
          <ol className="mt-8 divide-y divide-line border-y border-line">
            {t.landing.steps.map(([title, text]) => (
              <li key={title} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
                <p className="font-serif text-2xl">{title}</p>
                <p className="text-sm leading-relaxed text-stone">{text}</p>
              </li>
            ))}
          </ol>
          <Link href={`/${locale}/ueber-uns`} className="mt-6 inline-flex min-h-11 items-center text-[11px] uppercase tracking-[0.16em] underline">{t.landing.houseLink}</Link>
        </div>
      </section>

      <section className="mt-16 md:mt-24">
        <h2 className="font-serif text-3xl md:text-4xl">{locale === "de" ? "Weiterer Schmuck" : "Further jewelry"}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {([
            ["earrings-gold", t.nav.earrings, `/${locale}/kollektion/ohrringe`],
            ["necklace-pendant-gold", t.nav.chains, `/${locale}/kollektion/ketten`],
            ["bracelet-gold", t.nav.pendants, `/${locale}/kollektion/anhaenger`],
          ] as const).map(([id, label, href]) => (
            <li key={id}>
              <Link href={href} className="group block">
                <StudioFrame id={id} locale={locale} alt="" sizes={imageSizes.card} />
                <p className="mt-4 font-serif text-3xl group-hover:text-metal">{label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 md:mt-24">
        <h2 className="font-serif text-3xl md:text-4xl">{t.landing.guidesTitle}</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {guideIndex[locale].map((guide) => (
            <li key={guide.slug}>
              <Link href={`/${locale}/ratgeber/${guide.slug}`} className="flex min-h-16 flex-col justify-center gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                <span className="font-serif text-2xl">{guide.title}</span>
                <span className="max-w-sm text-sm text-stone sm:text-right">{guide.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
