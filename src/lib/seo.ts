import type { Metadata } from "next";
import type { Locale } from "./types";

export const SITE = "https://top-orangered-kudu-52.hostingersite.com";

export function pageMeta(locale: Locale, title: string, description: string, path = "", absolute = false): Metadata {
  const pathname = `/${locale}${path}`;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: {
      canonical: pathname,
      languages: { de: `/de${path}`, en: `/en${path}`, "x-default": `/de${path}` },
    },
    openGraph: {
      title,
      description,
      url: pathname,
      siteName: "Fatlum Jewelry",
      locale: locale === "de" ? "de_DE" : "en_GB",
      alternateLocale: locale === "de" ? ["en_GB"] : ["de_DE"],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
