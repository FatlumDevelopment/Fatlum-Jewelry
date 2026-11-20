import { takeLocale } from "@/lib/locale";
import { locales } from "@/lib/types";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  await takeLocale(params);
  return children;
}
