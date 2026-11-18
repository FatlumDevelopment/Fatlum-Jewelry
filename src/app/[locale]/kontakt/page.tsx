import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { ContactForm } from "@/components/request-list";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { CONTACT } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return { title: t.contact.title, description: t.contact.text };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return (
    <Shell l={locale} crumbs={[{ label: t.nav.contact }]}>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h1 className="font-serif text-4xl text-navy">{t.contact.title}</h1>
          <p className="mt-3">{t.contact.text}</p>
          <address className="mt-6 not-italic leading-relaxed">
            {CONTACT.name}<br />{CONTACT.street}<br />{CONTACT.city}<br />{locale === "en" ? CONTACT.countryEn : CONTACT.countryDe}
            <br /><a className="text-secondary underline" href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            <br /><a className="text-secondary underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </address>
        </div>
        <ContactForm l={locale} />
      </div>
    </Shell>
  );
}
