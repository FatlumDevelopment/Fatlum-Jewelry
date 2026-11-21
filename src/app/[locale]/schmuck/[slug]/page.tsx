import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddProductButton } from "@/components/cart";
import { Shell } from "@/components/chrome";
import { ProductVisual } from "@/components/product-visual";
import { getCategories, getProduct, getProducts } from "@/lib/catalog";
import { dict } from "@/lib/i18n";
import { imageSizes } from "@/lib/image-slots";
import { takeLocale } from "@/lib/locale";
import { SITE, pageMeta } from "@/lib/seo";
import { productPhoto, jewelryImages } from "@/lib/image-slots";
import { locales } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return locales.flatMap((locale) => products.map((product) => ({ locale, slug: product.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await takeLocale(params);
  const product = await getProduct(slug);
  if (!product) return {};
  const name = locale === "en" ? product.name_en : product.name_de;
  const description = locale === "en" ? product.description_en : product.description_de;
  const photo = productPhoto[slug];
  const meta = pageMeta(locale, name, description, `/schmuck/${slug}`);
  if (photo) meta.openGraph = { ...meta.openGraph, images: [{ url: jewelryImages[photo].src, width: jewelryImages[photo].width, height: jewelryImages[photo].height, alt: name }] };
  return meta;
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const locale = await takeLocale(params);
  const t = dict(locale);
  const product = await getProduct(slug);
  if (!product) notFound();
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const category = categories.find((item) => item.slug === product.category_slug);
  const name = locale === "en" ? product.name_en : product.name_de;
  const alloy = locale === "en" ? product.alloy_en : product.alloy_de;
  const related = products.filter((item) => item.category_slug === product.category_slug && item.slug !== product.slug).slice(0, 3);
  const rows: [string, string][] = [
    [t.specs.metal, locale === "en" ? product.metal_en : product.metal_de],
    [t.specs.alloy, alloy],
    ...(product.width_mm ? [[t.specs.width, `${product.width_mm} mm`] as [string, string]] : []),
    ...(product.size_min && product.size_max ? [[t.specs.sizes, `${product.size_min}–${product.size_max}`] as [string, string]] : []),
    [t.specs.sku, product.sku],
    [t.specs.lead, locale === "en" ? product.lead_en : product.lead_de],
  ];
  const photo = productPhoto[slug];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku: product.sku,
    description: locale === "en" ? product.description_en : product.description_de,
    image: photo ? `${SITE}${jewelryImages[photo].src}` : undefined,
    brand: { "@type": "Brand", name: "Fatlum" },
    category: category ? (locale === "en" ? category.name_en : category.name_de) : undefined,
  };
  return (
    <Shell l={locale} crumbs={[{ href: `/${locale}/kollektion/${product.category_slug}`, label: category ? (locale === "en" ? category.name_en : category.name_de) : name }, { label: name }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="grid gap-10 pb-8 lg:grid-cols-2 lg:gap-16">
        <ProductVisual slug={product.slug} glyph={product.glyph} tone={product.tone} alt={`${name}, ${alloy}`} locale={locale} priority sizes={imageSizes.detail} ratio="aspect-square" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-metal">{category ? (locale === "en" ? category.name_en : category.name_de) : ""}</p>
          <h1 className="mt-3 font-serif text-5xl leading-none md:text-6xl">{name}</h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-stone">{locale === "en" ? product.description_en : product.description_de}</p>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-6 py-3 text-sm">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-stone">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[11px] uppercase tracking-[0.16em]">{t.price}</p>
          <div className="mt-4">
            <AddProductButton
              line={{ kind: "product", sku: product.sku, slug: product.slug, name_de: product.name_de, name_en: product.name_en, detail_de: alloy, detail_en: alloy, glyph: product.glyph, tone: product.tone }}
              label={t.price}
              addedLabel={t.added}
              qtyLabel={t.qty}
            />
          </div>
          <Link href={`/${locale}/konfigurator`} className="mt-4 inline-flex min-h-11 items-center text-sm underline">{t.configureInstead}</Link>
        </div>
      </article>
      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-12">
          <h2 className="font-serif text-3xl">{t.related}</h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-3">
            {related.map((item) => {
              const itemName = locale === "en" ? item.name_en : item.name_de;
              return (
                <li key={item.slug}>
                  <Link href={`/${locale}/schmuck/${item.slug}`} className="group block">
                    <ProductVisual slug={item.slug} glyph={item.glyph} tone={item.tone} alt="" locale={locale} />
                    <h3 className="mt-3 font-serif text-2xl group-hover:text-metal">{itemName}</h3>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.16em]">{t.price}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </Shell>
  );
}
