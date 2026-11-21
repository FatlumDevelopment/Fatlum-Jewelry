import type { Metadata } from "next";
import { Shell, PageIntro } from "@/components/chrome";
import { faq } from "@/lib/content";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return pageMeta(locale, t.faq.title, t.faq.lead, "/faq");
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return (
    <Shell l={locale} crumbs={[{ label: t.nav.faq }]}>
      <PageIntro title={t.faq.title} lede={t.faq.lead} />
      <div className="mt-8 divide-y divide-line border-y border-line">
        {faq[locale].map((item) => (
          <details key={item.q} className="group py-1">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-serif text-2xl [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden className="text-stone group-open:hidden">+</span>
              <span aria-hidden className="hidden text-stone group-open:inline">–</span>
            </summary>
            <p className="max-w-2xl pb-5 text-sm leading-relaxed text-stone">{item.a}</p>
          </details>
        ))}
      </div>
    </Shell>
  );
}
