import type { MetadataRoute } from "next";
import { fallbackCategories, fallbackProducts } from "@/lib/fallback";
import { guideSlugs } from "@/lib/content";
import { SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/konfigurator",
    "/ueber-uns",
    "/faq",
    "/kontakt",
    "/anfrage",
    "/impressum",
    "/datenschutz",
    "/agb",
    "/ratgeber",
    ...fallbackCategories.map((category) => `/kollektion/${category.slug}`),
    ...fallbackProducts.map((product) => `/schmuck/${product.slug}`),
    ...guideSlugs.map((slug) => `/ratgeber/${slug}`),
  ];
  const now = new Date();
  return (["de", "en"] as const).flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
      priority: path === "" ? 1 : path.startsWith("/schmuck") ? 0.7 : 0.5,
      alternates: { languages: { de: `${SITE}/de${path}`, en: `${SITE}/en${path}` } },
    })),
  );
}
