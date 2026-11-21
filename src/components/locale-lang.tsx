"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function LocaleLang() {
  const path = usePathname();
  useEffect(() => {
    const locale = path?.split("/")[1];
    if (locale === "de" || locale === "en") document.documentElement.lang = locale;
  }, [path]);
  return null;
}
