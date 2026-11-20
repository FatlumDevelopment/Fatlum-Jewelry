"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shell } from "./chrome";
import { dict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function NotFoundView() {
  const path = usePathname() || "/de";
  const locale: Locale = path.startsWith("/en") ? "en" : "de";
  const t = dict(locale);
  return (
    <Shell l={locale}>
      <div className="mx-auto flex min-h-[60vh] max-w-[1180px] flex-col justify-center px-5 py-24 md:px-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-metal">404</p>
        <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[1.02] md:text-6xl">{t.notFound.title}</h1>
        <p className="mt-5 max-w-md text-stone">{t.notFound.text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="btn btn-solid" href={`/${locale}`}>{t.notFound.home}</Link>
          <Link className="btn btn-line" href={`/${locale}/kollektion/trauringe`}>{t.notFound.rings}</Link>
        </div>
      </div>
    </Shell>
  );
}
