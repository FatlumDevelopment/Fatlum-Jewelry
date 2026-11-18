import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { faq } from "@/lib/content";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return { title: t.faq.title, description: t.faq.lead };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return (
    <Shell l={locale} crumbs={[{ label: t.nav.faq }]}>
      <h1 className="font-serif text-4xl text-navy">{t.faq.title}</h1>
      <p className="mt-3 max-w-2xl">{t.faq.lead}</p>
      <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
        {faq[locale].map((item) => (
          <details key={item.q} className="py-4">
            <summary className="cursor-pointer font-serif text-xl text-navy">{item.q}</summary>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </Shell>
  );
}
