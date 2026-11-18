import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { CONTACT } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  return { title: locale === "en" ? "Imprint" : "Impressum" };
}

export default async function Imprint({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return (
    <Shell l={locale} crumbs={[{ label: t.footer.imprint }]}>
      <h1 className="font-serif text-4xl text-navy">{t.footer.imprint}</h1>
      <p className="mt-4 rounded-lg border border-gold/40 bg-cream p-4 text-sm">{t.legalNotice}</p>
      {locale === "en" ? (
        <div className="prose-legal mt-6 max-w-3xl space-y-4 leading-relaxed">
          <p><strong>{CONTACT.name}</strong><br />{CONTACT.street}<br />{CONTACT.city}<br />{CONTACT.countryEn}</p>
          <p>Phone: <a className="underline" href={CONTACT.phoneHref}>{CONTACT.phone}</a><br />Email: <a className="underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
          <p>Owner: {CONTACT.owner}</p>
          <p>Legal form: [Legal form to follow]<br />Managing director: [Management to follow]<br />Register court and number: [Commercial register to follow]<br />VAT ID: [VAT ID to follow]</p>
          <p>Responsible for content under § 18 (2) MStV: {CONTACT.owner}, {CONTACT.street}, {CONTACT.city}</p>
          <h2 className="font-serif text-2xl text-navy">Dispute resolution</h2>
          <p>[Placeholder] A statement on consumer dispute resolution will follow a legal review.</p>
        </div>
      ) : (
        <div className="mt-6 max-w-3xl space-y-4 leading-relaxed">
          <p><strong>{CONTACT.name}</strong><br />{CONTACT.street}<br />{CONTACT.city}<br />{CONTACT.countryDe}</p>
          <p>Telefon: <a className="underline" href={CONTACT.phoneHref}>{CONTACT.phone}</a><br />E-Mail: <a className="underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
          <p>Inhaber: {CONTACT.owner}</p>
          <p>Rechtsform: [Rechtsform folgt]<br />Geschäftsführung: [Geschäftsführung folgt]<br />Registergericht und Nummer: [Handelsregister folgt]<br />Umsatzsteuer-ID: [USt-IdNr. folgt]</p>
          <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: {CONTACT.owner}, {CONTACT.street}, {CONTACT.city}</p>
          <h2 className="font-serif text-2xl text-navy">Streitschlichtung</h2>
          <p>[Platzhalter] Ein Hinweis zur Verbraucherstreitbeilegung folgt nach rechtlicher Prüfung.</p>
        </div>
      )}
    </Shell>
  );
}
