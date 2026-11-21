import { StudioFrame } from "../studio-image";
import { imageSizes, type JewelryId } from "@/lib/image-slots";

export function RingFallback({ id, label }: { id: JewelryId; label: string }) {
  return <StudioFrame id={id} alt={label} sizes={imageSizes.stage} ratio="h-full w-full" fit="contain" />;
}
