import type { Metadata } from "next";
import { Shell } from "@/components/chrome";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  return { title: locale === "en" ? "Terms" : "AGB" };
}

export default async function Terms({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  const headings = locale === "en"
    ? ["1. Scope", "2. Requests are not orders", "3. Offers", "4. Making and delivery", "5. Retention of title", "6. Liability", "7. Final provisions"]
    : ["1. Geltung", "2. Anfragen sind keine Aufträge", "3. Angebote", "4. Fertigung und Lieferung", "5. Eigentumsvorbehalt", "6. Haftung", "7. Schlussbestimmungen"];
  const note = locale === "en"
    ? "[Placeholder] These headings are not binding terms. The text will be written and reviewed before launch. Until then, a request on this site creates no contract and no duty to pay."
    : "[Platzhalter] Diese Überschriften sind kein verbindlicher Vertragstext. Der Wortlaut wird vor dem Start geschrieben und geprüft. Bis dahin entsteht durch eine Anfrage auf dieser Seite kein Vertrag und keine Zahlungspflicht.";
  return (
    <Shell l={locale} crumbs={[{ label: t.footer.terms }]}>
      <h1 className="font-serif text-4xl text-navy">{t.footer.terms}</h1>
      <p className="mt-4 rounded-lg border border-gold/40 bg-cream p-4 text-sm">{note}</p>
      <ol className="mt-6 max-w-3xl space-y-4">
        {headings.map((heading) => (
          <li key={heading}><h2 className="font-serif text-2xl text-navy">{heading}</h2><p className="mt-1 text-sm text-gray-600">{locale === "en" ? "[Text to follow]" : "[Text folgt]"}</p></li>
        ))}
      </ol>
    </Shell>
  );
}
