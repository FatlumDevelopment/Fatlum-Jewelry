import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { Configurator } from "@/components/configurator";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return pageMeta(locale, t.meta.configTitle, t.meta.configDescription, "/konfigurator");
}

export default async function ConfiguratorPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ art?: string }> }) {
  const locale = await takeLocale(params);
  const art = (await searchParams).art;
  return (
    <Shell l={locale} wide>
      <Configurator l={locale} initialMode={art === "rohling" ? "blank" : "finished"} />
    </Shell>
  );
}
