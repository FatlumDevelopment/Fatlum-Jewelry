import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddProductButton } from "@/components/cart";
import { Shell } from "@/components/chrome";
import { ProductGlyph } from "@/components/glyphs";
import { getCategories, getProduct, getProducts } from "@/lib/catalog";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
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
  return { title: name, description, alternates: { languages: { de: `/de/schmuck/${slug}`, en: `/en/schmuck/${slug}` } } };
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
  const related = products.filter((item) => item.category_slug === product.category_slug && item.slug !== product.slug).slice(0, 3);
  const rows: [string, string][] = [
    [t.specs.metal, locale === "en" ? product.metal_en : product.metal_de],
    [t.specs.alloy, locale === "en" ? product.alloy_en : product.alloy_de],
    ...(product.width_mm ? [[t.specs.width, `${product.width_mm} mm`] as [string, string]] : []),
    ...(product.size_min && product.size_max ? [[t.specs.sizes, `${product.size_min}–${product.size_max}`] as [string, string]] : []),
    [t.specs.sku, product.sku],
    [t.specs.lead, locale === "en" ? product.lead_en : product.lead_de],
  ];
  return (
    <Shell l={locale} crumbs={[{ href: `/${locale}/kollektion/${product.category_slug}`, label: category ? (locale === "en" ? category.name_en : category.name_de) : t.crumbJewelry }, { label: name }]}>
      <article className="grid items-start gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gold/30 bg-cream">
          <ProductGlyph uid={product.slug} kind={product.glyph} tone={product.tone} title={name} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{product.sku}</p>
          <h1 className="font-serif text-4xl text-navy md:text-5xl">{name}</h1>
          <p className="mt-2 text-secondary">{t.price}</p>
          <p className="mt-4 leading-relaxed">{locale === "en" ? product.description_en : product.description_de}</p>
          <dl className="mt-6 divide-y divide-gray-200 border-y border-gray-200 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-2 gap-3 py-2"><dt className="text-gray-500">{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-gray-500">{t.madeToOrder}. {t.productNote}</p>
          <div className="mt-5 max-w-sm">
            <AddProductButton
              line={{ kind: "product", sku: product.sku, slug: product.slug, name_de: product.name_de, name_en: product.name_en, detail_de: product.alloy_de, detail_en: product.alloy_en, glyph: product.glyph, tone: product.tone }}
              label={t.add} addedLabel={t.added} qtyLabel={t.qty}
            />
          </div>
          {category?.kind === "ring" && <p className="mt-6 text-sm"><Link href={`/${locale}/konfigurator`} className="text-secondary underline">{t.configureInstead}</Link></p>}
        </div>
      </article>
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-3xl text-navy">{t.related}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}><Link href={`/${locale}/schmuck/${item.slug}`} className="block overflow-hidden rounded-xl border border-gray-200"><ProductGlyph uid={`rel-${item.slug}`} kind={item.glyph} tone={item.tone} title={locale === "en" ? item.name_en : item.name_de} /><span className="block p-3 font-serif text-xl text-navy">{locale === "en" ? item.name_en : item.name_de}</span></Link></li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  );
}
