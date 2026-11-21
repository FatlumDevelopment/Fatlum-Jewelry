import type { Metadata } from "next";
import { Shell, PageIntro } from "@/components/chrome";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return pageMeta(locale, t.footer.terms, t.legalNotice, "/agb");
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
      <PageIntro title={t.footer.terms} />
      <p className="note mt-8 max-w-3xl">{note}</p>
      <div className="prose-quiet">
        {headings.map((heading) => (
          <section key={heading}><h2>{heading}</h2><p>{locale === "en" ? "[Text to follow]" : "[Text folgt]"}</p></section>
        ))}
      </div>
    </Shell>
  );
}
