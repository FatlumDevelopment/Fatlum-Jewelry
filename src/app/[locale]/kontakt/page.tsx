import type { Metadata } from "next";
import { Shell, PageIntro } from "@/components/chrome";
import { EnquiryForm } from "@/components/enquiry-form";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { pageMeta } from "@/lib/seo";
import { CONTACT } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return pageMeta(locale, t.contact.title, t.contact.text, "/kontakt");
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return (
    <Shell l={locale} crumbs={[{ label: t.nav.contact }]}>
      <div className="grid gap-12 pb-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <PageIntro title={t.contact.title} lede={t.contact.text} />
          <address className="mt-8 not-italic text-sm leading-relaxed">
            {CONTACT.name}<br />{CONTACT.owner}<br />{CONTACT.street}<br />{CONTACT.city}<br />{locale === "en" ? CONTACT.countryEn : CONTACT.countryDe}
            <br /><a className="inline-flex min-h-11 items-center underline" href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            <br /><a className="inline-flex min-h-11 items-center underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </address>
        </div>
        <EnquiryForm locale={locale} source="contact" items={[]} submitLabel={t.contact.submit} messageRequired />
      </div>
    </Shell>
  );
}
