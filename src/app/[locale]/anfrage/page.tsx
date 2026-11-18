import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { RequestList } from "@/components/request-list";
import { getOptions } from "@/lib/catalog";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return { title: t.meta.requestTitle, description: t.meta.requestDescription };
}

export default async function RequestPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  const options = await getOptions();
  return (
    <Shell l={locale} crumbs={[{ label: t.nav.request }]}>
      <h1 className="font-serif text-4xl text-navy md:text-5xl">{t.request.title}</h1>
      <p className="mt-3 max-w-2xl">{t.request.intro}</p>
      <RequestList l={locale} options={options} />
    </Shell>
  );
}
