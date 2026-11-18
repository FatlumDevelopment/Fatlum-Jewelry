import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { Configurator } from "@/components/configurator";
import { getOptions } from "@/lib/catalog";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return { title: t.meta.configTitle, description: t.meta.configDescription, alternates: { languages: { de: "/de/konfigurator", en: "/en/konfigurator" } } };
}

export default async function ConfigPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  const options = await getOptions();
  return (
    <Shell l={locale} crumbs={[{ label: t.nav.configurator }]}>
      <h1 className="font-serif text-4xl text-navy md:text-5xl">{t.config.title}</h1>
      <p className="mt-3 max-w-3xl text-gray-700">{t.config.lead}</p>
      <div className="mt-8"><Configurator l={locale} options={options} /></div>
    </Shell>
  );
}
