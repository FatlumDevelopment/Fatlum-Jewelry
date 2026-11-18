import "../globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/components/cart";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { locales, type Locale } from "@/lib/types";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return {
    title: { default: t.meta.homeTitle, template: "%s · Fatlum Jewelry" },
    description: t.meta.homeDescription,
    icons: { icon: "/images/brand/fatlum-logo.png" },
    robots: { index: false, follow: false },
    metadataBase: new URL("https://devoted-mintcream-goshawk-42.hostingersite.com"),
    alternates: { languages: { de: "/de", en: "/en" } },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  return (
    <html lang={locale}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

export type { Locale };
