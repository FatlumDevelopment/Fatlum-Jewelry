import type { Locale } from "./types";

export const guideSlugs = ["ringgroesse", "legierungen", "profile", "pflege"] as const;
export type GuideSlug = (typeof guideSlugs)[number];

type Block = { heading: string; paragraphs: string[] };

const guides: Record<GuideSlug, Record<Locale, { title: string; description: string; blocks: Block[] }>> = {
  ringgroesse: {
    de: {
      title: "Ringgröße",
      description: "Die deutsche Ringgröße ist der innere Umfang in Millimetern. So messen Sie, und so lesen Sie die Tabelle.",
      blocks: [
        {
          heading: "Was die Zahl bedeutet",
          paragraphs: [
            "Größe 54 ist ein innerer Umfang von 54 Millimetern. Den Innendurchmesser erhalten Sie, indem Sie den Umfang durch π teilen — bei 54 sind das etwa 17,2 Millimeter.",
            "US- und UK-Angaben in der Tabelle sind Umrechnungen zum Orientieren. Verbindlich ist die deutsche Größe, die wir fertigen. Ein Goldschmied misst nach, bevor wir starten.",
          ],
        },
        {
          heading: "Selber messen",
          paragraphs: [
            "Nehmen Sie einen Ring, der am richtigen Finger sitzt. Legen Sie ihn auf Papier, zeichnen Sie den inneren Kreis und messen Sie den Durchmesser an der weitesten Stelle. Umfang = Durchmesser × 3,1416.",
            "Mit einem Papierstreifen geht es auch: einmal eng um den Finger, markieren, messen. Nicht zu fest, nicht über einem Gelenk. Abends sind Finger etwas dicker — messen Sie dann, wenn der Ring getragen wird.",
            "Breite Bänder sitzen enger. Ab etwa 5 Millimetern Breite nehmen viele eine halbe bis ganze Größe mehr. Sehr schmale Ringe dürfen eher knapp sein.",
          ],
        },
        {
          heading: "Paare",
          paragraphs: [
            "Zwei Ringe eines Paares teilen sich oft das Design und nicht die Größe. Im Konfigurator bleiben die Größen getrennt, auch wenn das Design gekoppelt ist.",
          ],
        },
      ],
    },
    en: {
      title: "Ring size",
      description: "The German ring size is the inner circumference in millimetres. How to measure, and how to read the chart.",
      blocks: [
        {
          heading: "What the number means",
          paragraphs: [
            "Size 54 is an inner circumference of 54 millimetres. Divide by π for the inner diameter — at 54 that is about 17.2 millimetres.",
            "US and UK figures in the chart are conversions for orientation. We make the German size. A jeweller remeasures before we start.",
          ],
        },
        {
          heading: "Measuring yourself",
          paragraphs: [
            "Take a ring that fits the right finger. Trace the inner circle on paper and measure the diameter at its widest. Circumference = diameter × 3.1416.",
            "A paper strip works too: wrap it snugly, mark, measure. Not tight, and not over a knuckle. Fingers are a little larger in the evening — measure when the ring will be worn.",
            "Wide bands feel tighter. From about 5 millimetres of width, many people go up half a size or a full size. Very narrow rings can sit closer.",
          ],
        },
        {
          heading: "Pairs",
          paragraphs: [
            "Two rings in a pair often share a design and not a size. In the configurator the sizes stay apart, even when the design is linked.",
          ],
        },
      ],
    },
  },
  legierungen: {
    de: {
      title: "Legierungen",
      description: "Feingehalt, Farbe und was wir dazu sagen — und was wir nicht belegen.",
      blocks: [
        {
          heading: "Feingehalt",
          paragraphs: [
            "Die Zahl ist der Edelmetallanteil in Tausendsteln. 333 ist ein Drittel Gold, 585 etwas mehr als die Hälfte, 750 drei Viertel. Im Alltag heißen sie auch 8, 14 und 18 Karat. Karat ist hier eine Zusammensetzung, kein Gewicht.",
            "Platin 950 und Silber 925 sind die Feingehalte, die wir für Schmuck führen. Palladium bieten wir als 950 und als graueres 500 an.",
          ],
        },
        {
          heading: "Farben",
          paragraphs: [
            "Gelb, Rosé und Rot kommen vom Kupfer- und Silberanteil. Weißgold ist eine Legierung, keine Beschichtung. Ob eine Rhodiumschicht dazukommt, steht im Angebot — wir versprechen sie nicht pauschal.",
            "Höherer Feingehalt heißt mehr Gold, nicht automatisch mehr Härte. Härte hängt von den übrigen Metallen ab. Konkrete Werte nennen wir auf Nachfrage, nicht als Werbung.",
          ],
        },
        {
          heading: "Allergien und Herkunft",
          paragraphs: [
            "Ob eine Legierung Nickel enthält, bestätigen wir im Angebot. Schreiben Sie Allergien in die Nachricht.",
            "Wo wir es anbieten, arbeiten wir mit recycelten und sekundären Edelmetallen. Welche Charge in Ihrem Stück steckt, steht im Angebot. Zertifikate, die wir nicht vorlegen können, nennen wir nicht.",
          ],
        },
      ],
    },
    en: {
      title: "Alloys",
      description: "Fineness, colour, and what we will say — and what we will not claim.",
      blocks: [
        {
          heading: "Fineness",
          paragraphs: [
            "The number is the precious-metal share in parts per thousand. 333 is one third gold, 585 a little over half, 750 three quarters. In everyday speech that is 8, 14 and 18 karat. Karat here is a composition, not a weight.",
            "Platinum 950 and silver 925 are the finenesses we offer for jewelry. Palladium is available as 950 and as a greyer 500.",
          ],
        },
        {
          heading: "Colours",
          paragraphs: [
            "Yellow, rose and red come from the copper and silver share. White gold is an alloy, not a coating. Whether a rhodium plate is added is in the offer — we do not promise it as a rule.",
            "A higher fineness means more gold, not automatically more hardness. Hardness depends on the other metals. We give figures when you ask, not as advertising.",
          ],
        },
        {
          heading: "Allergies and origin",
          paragraphs: [
            "Whether an alloy contains nickel is confirmed in the offer. Mention allergies in the message.",
            "Where we offer it, we work with recycled and secondary precious metals. Which batch is in your piece is stated in the offer. We do not name certificates we cannot show.",
          ],
        },
      ],
    },
  },
  profile: {
    de: {
      title: "Profile",
      description: "Der Querschnitt bestimmt, wie der Ring am Finger liegt und wie viel Licht die Fläche bekommt.",
      blocks: [
        {
          heading: "Querschnitt",
          paragraphs: [
            "Das Profil ist der Schnitt durch die Schiene, nicht das Muster auf der Oberfläche. Eine Planlinie ist eckig und ruhig, ein Hofband leicht gewölbt, Komfort rund und weicher am Finger.",
            "Spitze Profile wie Dachfirst oder Messerkante wirken schmaler und sind im Alltag empfindlicher. Breite und Höhe begrenzen wir je Profil, damit die Wand tragfähig bleibt.",
          ],
        },
        {
          heading: "Rohr und Rohling",
          paragraphs: [
            "Das Rohr ist ein rundes Hohlprofil. Als fertiger Ring ist es eine schmale Röhre, als Rohling das Ausgangsmaterial für eine Werkstatt.",
            "Fugen — eine U- oder V-Rille — gehen nur bei Profilen, die dafür genug Fläche haben. Der Konfigurator blendet aus, was wir so nicht anbieten.",
          ],
        },
      ],
    },
    en: {
      title: "Profiles",
      description: "The cross-section decides how a ring sits on the finger and how much light the face catches.",
      blocks: [
        {
          heading: "Cross-section",
          paragraphs: [
            "The profile is a cut through the shank, not a pattern on the surface. A flat line is square and quiet, a court is lightly domed, comfort is round and softer on the finger.",
            "Pointed profiles such as the ridge or the knife edge look narrower and are more exposed in daily wear. We limit width and height per profile so the wall stays sound.",
          ],
        },
        {
          heading: "Tube and blank",
          paragraphs: [
            "The tube is a round hollow section. As a finished ring it is a narrow tube; as a blank it is the starting material for a workshop.",
            "Grooves — a U or a V — are only on profiles with enough face. The configurator hides what we do not offer that way.",
          ],
        },
      ],
    },
  },
  pflege: {
    de: {
      title: "Pflege",
      description: "Alltag mit Gold, Platin, Palladium und Silber, ohne Spezialmittel zu versprechen.",
      blocks: [
        {
          heading: "Tragen",
          paragraphs: [
            "Legen Sie Ringe ab bei Sport, Chlor, Salzwasser und beim Hantieren mit Farben oder Reinigern. Steine und Mattierungen leiden zuerst.",
            "Bewahren Sie Stücke getrennt auf. Gold ist weicher als Stahl und zieht Kratzer von Schlüsseln und anderen Ringen.",
          ],
        },
        {
          heading: "Reinigen",
          paragraphs: [
            "Lauwarmes Wasser, ein Tropfen mildes Spülmittel, eine weiche Bürste, danach trockenreiben. Kein Backofen, kein Ultraschall zu Hause, keine scheuernden Pasten auf Matt oder Eis.",
            "Silber läuft an. Ein Silberputztuch reicht für den Anfang. Hochglanz polieren wir auf Wunsch nach — das ist eine Anfrage, kein automatischer Service.",
            "Gravuren werden mit den Jahren flacher. Nachgravieren geht, solange die Wand es hergibt. Das prüfen wir am Stück.",
          ],
        },
      ],
    },
    en: {
      title: "Care",
      description: "Daily life with gold, platinum, palladium and silver, without promising a special product.",
      blocks: [
        {
          heading: "Wearing",
          paragraphs: [
            "Take rings off for sport, chlorine, salt water, and when you handle paint or cleaners. Stones and matte finishes suffer first.",
            "Store pieces apart. Gold is softer than steel and takes scratches from keys and from other rings.",
          ],
        },
        {
          heading: "Cleaning",
          paragraphs: [
            "Lukewarm water, a drop of mild soap, a soft brush, then dry. No oven, no home ultrasonic, no abrasive paste on matte or ice.",
            "Silver tarnishes. A silver cloth is enough to start. We can repolish a mirror finish on request — that is a request, not an automatic service.",
            "Engravings grow shallower over the years. Recutting is possible while the wall allows it. We check that on the piece.",
          ],
        },
      ],
    },
  },
};

export function getGuide(slug: string, locale: Locale) {
  if (!guideSlugs.includes(slug as GuideSlug)) return null;
  return guides[slug as GuideSlug][locale];
}

export const guideIndex: Record<Locale, { slug: GuideSlug; title: string; text: string }[]> = {
  de: [
    { slug: "ringgroesse", title: "Ringgröße", text: "Umfang messen, Tabelle lesen, breite Bänder eine Idee größer nehmen." },
    { slug: "legierungen", title: "Legierungen", text: "333, 585, 750, Platin, Silber und Palladium — Farbe ohne Übertreibung." },
    { slug: "profile", title: "Profile", text: "Was der Querschnitt am Finger verändert, einschließlich Rohr." },
    { slug: "pflege", title: "Pflege", text: "Wasser, weiche Bürste, Silberputz, und wann ein Ring abgelegt wird." },
  ],
  en: [
    { slug: "ringgroesse", title: "Ring size", text: "Measure the circumference, read the chart, size wide bands a touch larger." },
    { slug: "legierungen", title: "Alloys", text: "333, 585, 750, platinum, silver and palladium — colour without exaggeration." },
    { slug: "profile", title: "Profiles", text: "What the cross-section changes on the finger, including tube." },
    { slug: "pflege", title: "Care", text: "Water, a soft brush, silver cloth, and when a ring comes off." },
  ],
};

export const faq: Record<Locale, { q: string; a: string }[]> = {
  de: [
    { q: "Warum steht kein Preis auf der Seite?", a: "Der Preis hängt von Legierung, Maß, Stein und Tagesmetall ab. Wir nennen ihn im persönlichen Angebot, nicht als Schild. Auf der Seite gibt es keine Kasse." },
    { q: "Was passiert mit der Anfrageliste?", a: "Sie liegt in Ihrem Browser, bis Sie das Formular senden. Danach speichern wir Name, Kontaktdaten, Nachricht und die Stücke, um zu antworten. Eine Zahlung lösen Sie damit nicht aus." },
    { q: "Ist die Konfiguration ein Auftrag?", a: "Nein. Das Modell ist eine Ansicht und eine Anfrage. Wir prüfen, ob sie so gefertigt werden kann, und schicken ein Angebot. Erst Ihre Zusage darauf ist die Bestellung." },
    { q: "Was ist der Unterschied zwischen fertigem Ring und Rohling?", a: "Der fertige Ring ist ein Stück mit Metall, Schliff, Karat, Fassung und optionaler Innengravur. Der Rohling ist für Werkstätten: eine Schiene ohne Stein und ohne Gravur." },
    { q: "Welche Größen fertigen Sie?", a: "Deutsche Größen 44 bis 74, das ist der innere Umfang in Millimetern. Die Tabelle im Ratgeber rechnet Durchmesser, US und UK nur ungefähr um." },
    { q: "Kann ich gravieren lassen?", a: "Ja, innen, bis 20 Zeichen. Im Modell sehen Sie den Text in der Schiene, sobald Sie die Innenansicht öffnen. Auf dem Rohling nicht — das setzt die Werkstatt später, wenn Sie es in die Nachricht schreiben." },
    { q: "Sind die Steine bestimmte Diamanten?", a: "Nein. Schliff, Karat und Fassung beschreiben die Anfrage. Den Stein selbst nennen wir im Angebot. Lose Steine führt Fatlum Diamonds." },
    { q: "Wie lange dauert die Fertigung?", a: "Üblicherweise einige Wochen nach Freigabe, Platin und aufwendige Fassungen länger. Einen festen Tag nennen wir im Angebot, nicht hier." },
    { q: "Versenden Sie?", a: "Ja, nach dem Angebot und der Zusage. Den Weg und die Versicherung legen wir dort fest. Auf dieser Seite wird nichts bezahlt und nichts verschickt." },
    { q: "Arbeiten Sie mit recyceltem Metall?", a: "Wo wir es anbieten, ja: recycelte und sekundäre Edelmetalle. Die Charge steht im Angebot. Zertifikate, die wir nicht haben, behaupten wir nicht." },
    { q: "Wo sitzt Fatlum?", a: "Maximilianstraße 2, 80539 München. Telefon +49 89 20 500 85858, E-Mail info@fatlum.jewelry." },
    { q: "Was ist mit Goldbarren und losen Diamanten?", a: "Barren sind Fatlum Gold, lose Steine Fatlum Diamonds. Diese Seite verkauft nur Schmuck und Ringe, und auch die nur auf Anfrage." },
  ],
  en: [
    { q: "Why is there no price on the page?", a: "The price depends on alloy, size, stone and the metal that day. We name it in a personal offer, not on a tag. There is no checkout on the page." },
    { q: "What happens to the request list?", a: "It stays in your browser until you send the form. We then store your name, contact details, message and the pieces so we can reply. That does not take a payment." },
    { q: "Is the configuration an order?", a: "No. The model is a view and a request. We check whether it can be made that way and send an offer. Only your acceptance of that offer is the order." },
    { q: "What is the difference between a finished ring and a blank?", a: "A finished ring is a piece with metal, cut, carat, setting and an optional inside engraving. A blank is for workshops: a shank without a stone or an engraving." },
    { q: "Which sizes do you make?", a: "German sizes 44 to 74, the inner circumference in millimetres. The chart in the guide converts diameter, US and UK only approximately." },
    { q: "Can I have it engraved?", a: "Yes, inside, up to 20 characters. In the model the text sits in the shank when you open the inside view. Not on a blank — the workshop adds that later if you say so in the message." },
    { q: "Are the stones specific diamonds?", a: "No. Cut, carat and setting describe the request. We name the stone itself in the offer. Loose stones are at Fatlum Diamonds." },
    { q: "How long does making take?", a: "Usually a few weeks after you approve the offer; platinum and elaborate settings take longer. We name a date in the offer, not here." },
    { q: "Do you ship?", a: "Yes, after the offer and your acceptance. Route and insurance are set there. Nothing is paid or shipped from this page." },
    { q: "Do you work with recycled metal?", a: "Where we offer it, yes: recycled and secondary precious metals. The batch is in the offer. We do not claim certificates we do not hold." },
    { q: "Where is Fatlum?", a: "Maximilianstraße 2, 80539 Munich. Phone +49 89 20 500 85858, email info@fatlum.jewelry." },
    { q: "What about gold bars and loose diamonds?", a: "Bars are Fatlum Gold, loose stones are Fatlum Diamonds. This site is only jewelry and rings, and those only on request." },
  ],
};

export const aboutParagraphs: Record<Locale, string[]> = {
  de: [
    "Fatlum sitzt in der Maximilianstraße 2 in München. Das Haus handelt mit Edelmetallen. Diese Website ist der Schmuck: Ringe, die Sie aus der Kollektion nehmen oder im Konfigurator skizzieren, dazu Ketten, Ohrringe und Anhänger.",
    "Inhaber ist Augusto Soto. Rechtsform, Registergericht und Umsatzsteuer-ID tragen wir nach, sobald sie feststehen — im Impressum sind die Lücken gekennzeichnet.",
    "Wir zeigen keine Preise. Eine Anfrage ist kein Kauf und keine Anzahlung. Was gefertigt werden kann, zu welchem Termin und zu welchem Preis, steht in der Antwort.",
    "Wo wir es anbieten, verwenden wir recycelte und sekundäre Edelmetalle. Andere Herkunfts- oder Gütesiegel nennen wir nur, wenn wir sie belegen können.",
    "Goldbarren finden Sie bei Fatlum Gold, lose Steine bei Fatlum Diamonds. Die drei Seiten gehören zusammen und verkaufen jeweils nur ihre eigene Ware.",
  ],
  en: [
    "Fatlum is at Maximilianstraße 2 in Munich. The house deals in precious metals. This website is the jewelry: rings you take from a collection or sketch in the configurator, plus chains, earrings and pendants.",
    "The owner is Augusto Soto. Legal form, register court and VAT ID will be added once they are fixed — the gaps are marked in the imprint.",
    "We show no prices. A request is not a purchase and not a deposit. What can be made, on which date and at which price, is in the reply.",
    "Where we offer it, we use recycled and secondary precious metals. We name other origin or quality marks only when we can show them.",
    "Gold bars are at Fatlum Gold, loose stones at Fatlum Diamonds. The three sites belong together and each sells only its own goods.",
  ],
};
