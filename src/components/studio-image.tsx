import Image from "next/image";
import { jewelryImages, STUDIO, type JewelryId } from "@/lib/image-slots";
import type { Locale } from "@/lib/types";

export function StudioFrame({
  id,
  locale,
  alt,
  sizes,
  priority = false,
  ratio = "aspect-square",
  fit = "contain",
}: {
  id: JewelryId;
  locale?: Locale;
  alt?: string;
  sizes: string;
  priority?: boolean;
  ratio?: string;
  fit?: "contain" | "cover";
}) {
  const image = jewelryImages[id];
  const label = alt ?? (locale === "en" ? image.alt_en : image.alt_de);
  return (
    <div className={`relative overflow-hidden ${ratio}`} style={{ background: STUDIO }}>
      <Image
        src={image.src}
        alt={label}
        fill
        sizes={sizes}
        priority={priority}
        quality={82}
        className={fit === "cover" ? "object-cover" : "object-contain"}
      />
    </div>
  );
}
