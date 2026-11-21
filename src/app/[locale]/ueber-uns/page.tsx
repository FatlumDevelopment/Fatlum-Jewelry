import type { Metadata } from "next";
import Link from "next/link";
import { Shell, PageIntro } from "@/components/chrome";
import { StudioFrame } from "@/components/studio-image";
import { aboutParagraphs } from "@/lib/content";
import { dict } from "@/lib/i18n";
import { imageSizes } from "@/lib/image-slots";
import { takeLocale } from "@/lib/locale";
import { pageMeta } from "@/lib/seo";
import { CONTACT, SISTER } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return pageMeta(locale, t.about.title, t.about.lead, "/ueber-uns");
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return (
    <Shell l={locale} crumbs={[{ label: t.nav.about }]}>
      <PageIntro eyebrow={t.about.eyebrow} title={t.about.title} lede={t.about.lead} />
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
        <StudioFrame id="ring-blanks" locale={locale} sizes={imageSizes.hero} ratio="aspect-[4/5]" priority />
        <div className="prose-quiet">
          {aboutParagraphs[locale].map((paragraph) => <p key={paragraph.slice(0, 32)}>{paragraph}</p>)}
          <p>{CONTACT.street}, {CONTACT.city}</p>
        </div>
      </div>
      <ol className="mt-16 divide-y divide-line border-y border-line">
        {t.about.steps.map(([title, text], index) => (
          <li key={title} className="grid gap-2 py-6 md:grid-cols-[6rem_12rem_1fr] md:items-baseline md:gap-8">
            <span className="text-[11px] uppercase tracking-[0.18em] text-stone">0{index + 1}</span>
            <h2 className="font-serif text-3xl">{title}</h2>
            <p className="text-sm leading-relaxed text-stone">{text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <a className="btn btn-line" href={`${SISTER.gold}/${locale}`}>{t.sisters.gold}</a>
        <a className="btn btn-line" href={`${SISTER.diamonds}/${locale}`}>{t.sisters.diamonds}</a>
        <Link className="btn btn-solid" href={`/${locale}/konfigurator`}>{t.nav.configurator}</Link>
      </div>
    </Shell>
  );
}
