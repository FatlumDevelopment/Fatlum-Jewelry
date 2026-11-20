/** Studio ground used when the photographs were normalized. Keep card backgrounds on this exact color. */
export const STUDIO = "#f7f4ef";

export type JewelryId =
  | "wedding-rings-yellow-gold"
  | "wedding-rings-white-gold"
  | "wedding-rings-rose-gold"
  | "engagement-ring-solitaire"
  | "engagement-ring-halo"
  | "engagement-ring-pave"
  | "band-matte"
  | "band-polished"
  | "band-hammered"
  | "earrings-gold"
  | "necklace-pendant-gold"
  | "bracelet-gold"
  | "ring-blanks"
  | "hero-rings"
  | "hero-ring-macro";

export type JewelryImage = {
  src: string;
  width: number;
  height: number;
  alt_de: string;
  alt_en: string;
};

const file = (id: string, width: number, height: number, alt_de: string, alt_en: string): JewelryImage => ({
  src: `/images/jewelry/${id}.webp`,
  width,
  height,
  alt_de,
  alt_en,
});

/** Central map. Sources are original studio photographs, normalized onto #f7f4ef and stored as WebP. Next serves AVIF when the browser accepts it. */
export const jewelryImages: Record<JewelryId, JewelryImage> = {
  "wedding-rings-yellow-gold": file("wedding-rings-yellow-gold", 1024, 1024, "Polierte Trauringe aus Gelbgold, Studioaufnahme", "Polished yellow-gold wedding bands, studio photograph"),
  "wedding-rings-white-gold": file("wedding-rings-white-gold", 1024, 1024, "Polierte Trauringe aus Weißgold, Studioaufnahme", "Polished white-gold wedding bands, studio photograph"),
  "wedding-rings-rose-gold": file("wedding-rings-rose-gold", 1024, 1024, "Polierte Trauringe aus Roségold, Studioaufnahme", "Polished rose-gold wedding bands, studio photograph"),
  "engagement-ring-solitaire": file("engagement-ring-solitaire", 1024, 1024, "Gelbgold-Solitär mit rundem Brillanten, Studioaufnahme", "Yellow-gold solitaire with a round brilliant, studio photograph"),
  "engagement-ring-halo": file("engagement-ring-halo", 1024, 1024, "Weißgoldring mit Halo und Pavé, Studioaufnahme", "White-gold halo ring with pavé shoulders, studio photograph"),
  "engagement-ring-pave": file("engagement-ring-pave", 1024, 1024, "Gelbgoldring mit Pavé-Schiene, Studioaufnahme", "Yellow-gold pavé engagement ring, studio photograph"),
  "band-matte": file("band-matte", 1024, 1024, "Gelbgoldband mit matter Oberfläche, Studioaufnahme", "Yellow-gold band with a matte surface, studio photograph"),
  "band-polished": file("band-polished", 1024, 1024, "Hochglanzpoliertes Gelbgoldband, Studioaufnahme", "High-polish yellow-gold band, studio photograph"),
  "band-hammered": file("band-hammered", 1024, 1024, "Gehämmertes Gelbgoldband, Studioaufnahme", "Hammered yellow-gold band, studio photograph"),
  "earrings-gold": file("earrings-gold", 1024, 1024, "Goldcreolen, Studioaufnahme", "Gold hoop earrings, studio photograph"),
  "necklace-pendant-gold": file("necklace-pendant-gold", 1024, 1024, "Goldkette mit Solitäranhänger, Studioaufnahme", "Gold chain with a solitaire pendant, studio photograph"),
  "bracelet-gold": file("bracelet-gold", 1024, 1024, "Goldarmreif, Studioaufnahme", "Gold bangle, studio photograph"),
  "ring-blanks": file("ring-blanks", 1024, 1024, "Ringrohlinge aus Gelbgold für die Werkstatt, Studioaufnahme", "Yellow-gold ring blanks for the workshop, studio photograph"),
  "hero-rings": file("hero-rings", 1280, 720, "Trauringe und Verlobungsringe in Gelb-, Rosé- und Weißgold", "Wedding bands and engagement rings in yellow, rose and white gold"),
  "hero-ring-macro": file("hero-ring-macro", 1280, 720, "Nahaufnahme eines Solitärs mit rundem Brillanten", "Close view of a solitaire and its round brilliant"),
};

export const productPhoto: Record<string, JewelryId> = {
  aurelia: "wedding-rings-yellow-gold",
  nordlicht: "wedding-rings-white-gold",
  rosa: "wedding-rings-rose-gold",
  alba: "wedding-rings-white-gold",
  cora: "wedding-rings-rose-gold",
  solis: "engagement-ring-solitaire",
  vespera: "engagement-ring-solitaire",
  klarheit: "engagement-ring-halo",
  mira: "engagement-ring-pave",
  forum: "band-hammered",
  trio: "wedding-rings-rose-gold",
  bogen: "band-matte",
  lina: "necklace-pendant-gold",
  nera: "necklace-pendant-gold",
  ronda: "earrings-gold",
  luz: "earrings-gold",
  tropfen: "necklace-pendant-gold",
  kreis: "necklace-pendant-gold",
};

export const categoryPhoto: Record<string, JewelryId> = {
  trauringe: "wedding-rings-yellow-gold",
  verlobungsringe: "engagement-ring-solitaire",
  "weitere-ringe": "band-polished",
  ketten: "necklace-pendant-gold",
  ohrringe: "earrings-gold",
  anhaenger: "necklace-pendant-gold",
};

export const imageSizes = {
  card: "(min-width: 1024px) 360px, (min-width: 640px) 46vw, 92vw",
  detail: "(min-width: 1024px) 560px, 92vw",
  hero: "(min-width: 1024px) 720px, 100vw",
  wide: "100vw",
  stage: "(min-width: 1024px) 640px, 100vw",
  thumb: "128px",
} as const;
