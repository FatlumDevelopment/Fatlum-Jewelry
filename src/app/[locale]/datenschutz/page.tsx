import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { CONTACT } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  return { title: locale === "en" ? "Privacy" : "Datenschutz" };
}

export default async function Privacy({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  const blocks = locale === "en"
    ? [
        ["1. Controller", `${CONTACT.name}, ${CONTACT.owner}, ${CONTACT.street}, ${CONTACT.city}, ${CONTACT.email}, ${CONTACT.phone}. Legal form, register and VAT ID: [to follow]. This text is a working draft and needs a legal review before launch.`],
        ["2. Request list and contact form", "When you send a request we store your name, optional company, email, phone, message, consent time and the pieces or ring configuration you named, so we can answer you (Art. 6 (1) (b) and (a) GDPR). The list itself stays in your browser (localStorage) until you send it. We do not take payment on this page."],
        ["3. Processors", "The database is Supabase, in an EU region when the project is configured that way. Email is sent through Resend only if an API key is set; otherwise nothing is emailed and the request is only stored. The site is hosted at Hostinger. [A data-processing register follows.]"],
        ["4. Cookies and tracking", "This website uses no analytics, advertising or third-party scripts. Fonts are self-hosted. The request list is the only data kept in the browser."],
        ["5. Retention", "[Placeholder] Requests are kept as long as we need them to answer and for any statutory retention, then deleted. The exact period will be set before launch."],
        ["6. Your rights", "Access, rectification, erasure, restriction, portability and objection, and a complaint to a supervisory authority. [The competent authority will be named once the legal entity is fixed.] Write to " + CONTACT.email + "."],
      ]
    : [
        ["1. Verantwortlicher", `${CONTACT.name}, ${CONTACT.owner}, ${CONTACT.street}, ${CONTACT.city}, ${CONTACT.email}, ${CONTACT.phone}. Rechtsform, Register und USt-IdNr.: [folgen]. Dieser Text ist ein Entwurf und wird vor dem Start rechtlich geprüft.`],
        ["2. Anfrageliste und Kontaktformular", "Wenn Sie eine Anfrage senden, speichern wir Name, optionale Firma, E-Mail, Telefon, Nachricht, den Zeitpunkt der Einwilligung und die genannten Stücke oder die Ringkonfiguration, um Ihnen zu antworten (Art. 6 Abs. 1 lit. b und a DSGVO). Die Liste selbst bleibt in Ihrem Browser (localStorage), bis Sie sie absenden. Auf dieser Seite wird nicht gezahlt."],
        ["3. Auftragsverarbeiter", "Die Datenbank ist Supabase, bei entsprechender Projektregion in der EU. E-Mail geht über Resend nur, wenn ein API-Schlüssel gesetzt ist; sonst wird nichts verschickt und die Anfrage nur gespeichert. Die Seite liegt bei Hostinger. [Ein Verzeichnis der Verarbeitung folgt.]"],
        ["4. Cookies und Tracking", "Diese Website nutzt keine Analyse, keine Werbung und keine Skripte Dritter. Die Schriften liegen auf dem eigenen Server. Die Anfrageliste ist das einzige Datum, das im Browser bleibt."],
        ["5. Speicherdauer", "[Platzhalter] Anfragen bleiben, solange wir sie zur Antwort und für gesetzliche Fristen brauchen, und werden danach gelöscht. Die konkrete Frist steht vor dem Start fest."],
        ["6. Ihre Rechte", "Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch und Beschwerde bei einer Aufsichtsbehörde. [Die zuständige Behörde nennen wir, sobald die Rechtsform feststeht.] Schreiben Sie an " + CONTACT.email + "."],
      ];
  return (
    <Shell l={locale} crumbs={[{ label: t.footer.privacy }]}>
      <h1 className="font-serif text-4xl text-navy">{t.footer.privacy}</h1>
      <p className="mt-4 rounded-lg border border-gold/40 bg-cream p-4 text-sm">{t.legalNotice}</p>
      <div className="mt-6 max-w-3xl space-y-6">
        {blocks.map(([heading, body]) => (
          <section key={heading}><h2 className="font-serif text-2xl text-navy">{heading}</h2><p className="mt-2 leading-relaxed">{body}</p></section>
        ))}
      </div>
    </Shell>
  );
}
