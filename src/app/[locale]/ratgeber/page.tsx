import Link from "next/link";
import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { guideIndex } from "@/lib/content";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return { title: t.guides.title, description: t.guides.lead };
}

export default async function Guides({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return (
    <Shell l={locale} crumbs={[{ label: t.nav.guides }]}>
      <h1 className="font-serif text-4xl text-navy">{t.guides.title}</h1>
      <p className="mt-3 max-w-2xl">{t.guides.lead}</p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {guideIndex[locale].map((guide) => (
          <li key={guide.slug}><Link href={`/${locale}/ratgeber/${guide.slug}`} className="block rounded-xl border border-gold/30 bg-cream p-6 hover:border-gold"><h2 className="font-serif text-2xl text-navy">{guide.title}</h2><p className="mt-2 text-sm">{guide.text}</p></Link></li>
        ))}
      </ul>
    </Shell>
  );
}
