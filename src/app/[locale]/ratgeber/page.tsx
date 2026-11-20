import Link from "next/link";
import type { Metadata } from "next";
import { Shell, PageIntro } from "@/components/chrome";
import { guideIndex } from "@/lib/content";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return pageMeta(locale, t.guides.title, t.guides.lead, "/ratgeber");
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return (
    <Shell l={locale} crumbs={[{ label: t.nav.guides }]}>
      <PageIntro title={t.guides.title} lede={t.guides.lead} />
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {guideIndex[locale].map((guide) => (
          <li key={guide.slug}>
            <Link href={`/${locale}/ratgeber/${guide.slug}`} className="flex min-h-16 flex-col justify-center gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
              <span className="font-serif text-3xl">{guide.title}</span>
              <span className="max-w-md text-sm text-stone sm:text-right">{guide.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
