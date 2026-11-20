import type { Metadata } from "next";
import { Shell, PageIntro } from "@/components/chrome";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { pageMeta } from "@/lib/seo";
import { CONTACT } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return pageMeta(locale, t.footer.imprint, t.legalNotice, "/impressum");
}

export default async function Imprint({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return (
    <Shell l={locale} crumbs={[{ label: t.footer.imprint }]}>
      <PageIntro title={t.footer.imprint} />
      <p className="note mt-8 max-w-3xl">{t.legalNotice}</p>
      <div className="prose-quiet mt-8">
        {locale === "en" ? (
          <>
            <p><strong>{CONTACT.name}</strong><br />{CONTACT.street}<br />{CONTACT.city}<br />{CONTACT.countryEn}</p>
            <p>Phone: <a className="underline" href={CONTACT.phoneHref}>{CONTACT.phone}</a><br />Email: <a className="underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
            <p>Owner: {CONTACT.owner}</p>
            <p>Legal form: [Legal form to follow]<br />Managing director: [Management to follow]<br />Register court and number: [Commercial register to follow]<br />VAT ID: [VAT ID to follow]</p>
            <p>Responsible for content under § 18 (2) MStV: {CONTACT.owner}, {CONTACT.street}, {CONTACT.city}</p>
            <h2>Dispute resolution</h2>
            <p>[Placeholder] A statement on consumer dispute resolution will follow a legal review.</p>
          </>
        ) : (
          <>
            <p><strong>{CONTACT.name}</strong><br />{CONTACT.street}<br />{CONTACT.city}<br />{CONTACT.countryDe}</p>
            <p>Telefon: <a className="underline" href={CONTACT.phoneHref}>{CONTACT.phone}</a><br />E-Mail: <a className="underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
            <p>Inhaber: {CONTACT.owner}</p>
            <p>Rechtsform: [Rechtsform folgt]<br />Geschäftsführung: [Geschäftsführung folgt]<br />Registergericht und Nummer: [Handelsregister folgt]<br />Umsatzsteuer-ID: [USt-IdNr. folgt]</p>
            <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: {CONTACT.owner}, {CONTACT.street}, {CONTACT.city}</p>
            <h2>Streitschlichtung</h2>
            <p>[Platzhalter] Ein Hinweis zur Verbraucherstreitbeilegung folgt nach rechtlicher Prüfung.</p>
          </>
        )}
      </div>
    </Shell>
  );
}
