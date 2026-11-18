import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { aboutParagraphs } from "@/lib/content";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { SISTER } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return { title: t.about.title, description: t.about.lead };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return (
    <Shell l={locale} crumbs={[{ label: t.nav.about }]}>
      <h1 className="font-serif text-4xl text-navy">{t.about.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-secondary">{t.about.lead}</p>
      <div className="mt-6 max-w-3xl space-y-4 leading-relaxed">
        {aboutParagraphs[locale].map((paragraph) => <p key={paragraph.slice(0, 32)}>{paragraph}</p>)}
      </div>
      <p className="mt-8 text-sm"><a className="text-secondary underline" href={`${SISTER.gold}/${locale}`}>{t.sisters.gold}</a> · <a className="text-secondary underline" href={`${SISTER.diamonds}/${locale}`}>{t.sisters.diamonds}</a></p>
    </Shell>
  );
}
