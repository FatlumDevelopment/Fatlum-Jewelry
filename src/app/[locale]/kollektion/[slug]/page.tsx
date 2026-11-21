import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/chrome";
import { CollectionBrowser } from "@/components/collection-browser";
import { StudioFrame } from "@/components/studio-image";
import { getCategories, getProducts } from "@/lib/catalog";
import { dict } from "@/lib/i18n";
import { categoryPhoto, imageSizes } from "@/lib/image-slots";
import { takeLocale } from "@/lib/locale";
import { pageMeta } from "@/lib/seo";
import { locales } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getCategories();
  return locales.flatMap((locale) => categories.map((category) => ({ locale, slug: category.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await takeLocale(params);
  const category = (await getCategories()).find((item) => item.slug === slug);
  if (!category) return {};
  const title = locale === "en" ? category.name_en : category.name_de;
  const description = locale === "en" ? category.description_en : category.description_de;
  return pageMeta(locale, title, description, `/kollektion/${slug}`);
}

export default async function CollectionPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const locale = await takeLocale(params);
  const t = dict(locale);
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const rows = products.filter((product) => product.category_slug === slug);
  const name = locale === "en" ? category.name_en : category.name_de;
  const photo = categoryPhoto[slug];
  return (
    <Shell l={locale} crumbs={[{ label: name }]}>
      <header className="max-w-3xl">
        <h1 className="font-serif text-[2.6rem] leading-[1.02] md:text-6xl">{name}</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-stone">{locale === "en" ? category.description_en : category.description_de}</p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.16em]">{t.price}</p>
      </header>
      {photo && <div className="mt-8"><StudioFrame id={photo} locale={locale} sizes={imageSizes.wide} ratio="aspect-video md:aspect-[2/1]" priority /></div>}
      <CollectionBrowser l={locale} products={rows} />
    </Shell>
  );
}
