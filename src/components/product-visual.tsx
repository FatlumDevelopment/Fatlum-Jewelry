import { ProductGlyph } from "./glyphs";
import { StudioFrame } from "./studio-image";
import { imageSizes, productPhoto } from "@/lib/image-slots";
import type { GlyphKind, Locale, MetalTone } from "@/lib/types";

export function ProductVisual({
  slug,
  glyph,
  tone,
  alt,
  locale,
  priority = false,
  sizes = imageSizes.card,
  ratio = "aspect-square",
}: {
  slug: string;
  glyph: GlyphKind;
  tone: MetalTone;
  alt: string;
  locale: Locale;
  priority?: boolean;
  sizes?: string;
  ratio?: string;
}) {
  const photo = productPhoto[slug];
  if (!photo) {
    return (
      <div className={`overflow-hidden bg-[#f7f4ef] ${ratio}`}>
        <ProductGlyph uid={`vis-${slug}`} kind={glyph} tone={tone} title={alt} />
      </div>
    );
  }
  return <StudioFrame id={photo} locale={locale} alt={alt} sizes={sizes} priority={priority} ratio={ratio} />;
}
