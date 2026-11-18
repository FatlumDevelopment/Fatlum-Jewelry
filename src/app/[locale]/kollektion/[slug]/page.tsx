import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/chrome";
import { CollectionBrowser } from "@/components/collection-browser";
import { getCategories, getProducts } from "@/lib/catalog";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
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
  return { title, description, alternates: { languages: { de: `/de/kollektion/${slug}`, en: `/en/kollektion/${slug}` } } };
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
  return (
    <Shell l={locale} crumbs={[{ href: `/${locale}/kollektion/trauringe`, label: t.nav.collections }, { label: name }]}>
      <h1 className="font-serif text-4xl text-navy md:text-5xl">{name}</h1>
      <p className="mt-3 max-w-2xl text-gray-700">{locale === "en" ? category.description_en : category.description_de}</p>
      <p className="mt-2 text-sm text-secondary">{t.price}</p>
      <div className="mt-8"><CollectionBrowser l={locale} products={rows} /></div>
    </Shell>
  );
}
