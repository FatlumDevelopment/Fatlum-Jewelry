"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CartBadge } from "./cart";
import { CONTACT, SISTER } from "@/lib/site";
import { dict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

function LangSwitch({ l, className = "" }: { l: Locale; className?: string }) {
  const path = usePathname() || `/${l}`;
  const rest = path.replace(/^\/(de|en)/, "") || "";
  const item = (code: Locale, label: string) => (
    <Link
      href={`/${code}${rest}`}
      hrefLang={code}
      lang={code}
      aria-current={l === code ? "true" : undefined}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center text-[11px] tracking-[0.16em] ${l === code ? "text-ink" : "text-stone hover:text-ink"}`}
    >
      {label}
    </Link>
  );
  return (
    <span className={`inline-flex items-center ${className}`}>
      {item("de", "DE")}
      <span aria-hidden className="text-line">/</span>
      {item("en", "EN")}
    </span>
  );
}

export function Header({ l }: { l: Locale }) {
  const t = dict(l);
  const path = usePathname() || `/${l}`;
  const [open, setOpen] = useState<"rings" | "jewelry" | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const ringLinks: { href: string; label: string; note?: string }[] = [
    { href: `/${l}/kollektion/trauringe`, label: t.nav.wedding, note: l === "de" ? "Bänder" : "Bands" },
    { href: `/${l}/kollektion/verlobungsringe`, label: t.nav.engagement, note: l === "de" ? "Mit Stein" : "With a stone" },
    { href: `/${l}/kollektion/weitere-ringe`, label: t.nav.otherRings, note: l === "de" ? "Alltag" : "Everyday" },
    { href: `/${l}/konfigurator?art=rohling`, label: t.nav.blanks, note: l === "de" ? "Für die Werkstatt" : "For the workshop" },
  ];
  const jewelLinks: { href: string; label: string; note?: string }[] = [
    { href: `/${l}/kollektion/ketten`, label: t.nav.chains },
    { href: `/${l}/kollektion/ohrringe`, label: t.nav.earrings },
    { href: `/${l}/kollektion/anhaenger`, label: t.nav.pendants },
  ];

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    setMobile(false);
    setOpen(null);
  }, [path]);

  useEffect(() => {
    if (!mobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobile(false);
      if (event.key !== "Tab" || !panel.current) return;
      const items = panel.current.querySelectorAll<HTMLElement>("a, button");
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      menuBtn.current?.focus();
    };
  }, [mobile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const desk = "hidden xl:inline-flex min-h-11 items-center px-2 text-[13px] tracking-wide text-ink/80 hover:text-ink";
  const current = (href: string) => (path === href ? "text-ink" : "");

  const menu = mobile ? (
        <div ref={panel} id={menuId} role="dialog" aria-modal="true" aria-label={t.menu} className="fixed inset-0 z-[80] overflow-y-auto bg-ivory xl:hidden">
          <div className="sticky top-0 flex h-16 items-center justify-between border-b border-line bg-ivory px-5">
            <span className="font-serif text-xl tracking-[0.22em]">FATLUM</span>
            <button ref={closeBtn} type="button" className="inline-flex min-h-11 items-center border border-ink px-3 text-[11px] uppercase tracking-[0.18em]" onClick={() => setMobile(false)}>{t.close}</button>
          </div>
          <nav className="px-5 pb-24" aria-label="Mobile">
            <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-stone">{t.nav.rings}</p>
            {ringLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex min-h-14 items-center border-b border-line font-serif text-[1.75rem] leading-none">{link.label}</Link>
            ))}
            <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-stone">{t.nav.jewelry}</p>
            {jewelLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex min-h-14 items-center border-b border-line font-serif text-[1.75rem] leading-none">{link.label}</Link>
            ))}
            <div className="mt-8 grid gap-1">
              <Link href={`/${l}/konfigurator`} className="inline-flex min-h-12 items-center font-serif text-2xl">{t.nav.configurator}</Link>
              <Link href={`/${l}/ueber-uns`} className="inline-flex min-h-12 items-center font-serif text-2xl">{t.nav.about}</Link>
              <Link href={`/${l}/ratgeber`} className="inline-flex min-h-12 items-center font-serif text-2xl">{t.nav.guides}</Link>
              <Link href={`/${l}/faq`} className="inline-flex min-h-12 items-center font-serif text-2xl">{t.nav.faq}</Link>
              <Link href={`/${l}/kontakt`} className="inline-flex min-h-12 items-center font-serif text-2xl">{t.nav.contact}</Link>
            </div>
            <div className="mt-10 border-t border-line pt-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone">{t.footer.sisters}</p>
              <a className="mt-3 block min-h-11 py-2" href={`${SISTER.gold}/${l}`}>{t.sisters.gold}</a>
              <a className="block min-h-11 py-2" href={`${SISTER.diamonds}/${l}`}>{t.sisters.diamonds}</a>
            </div>
          </nav>
        </div>
      ) : null;

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-line bg-ivory" onMouseLeave={() => setOpen(null)}>
      <div className="hidden border-b border-line xl:block">
        <div className="mx-auto flex h-11 max-w-[1240px] items-center justify-between px-8 text-[11px] tracking-[0.16em] uppercase">
          <nav aria-label={l === "de" ? "Weitere Häuser" : "Other houses"} className="flex items-center gap-5">
            <a className="inline-flex min-h-11 items-center text-stone hover:text-ink" href={`${SISTER.gold}/${l}`}>{t.sisters.gold}</a>
            <Link className="inline-flex min-h-11 items-center text-ink" href={`/${l}`} aria-current="page">{t.sisters.jewelry}</Link>
            <a className="inline-flex min-h-11 items-center text-stone hover:text-ink" href={`${SISTER.diamonds}/${l}`}>{t.sisters.diamonds}</a>
          </nav>
          <LangSwitch l={l} />
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 px-5 md:px-8">
        <Link href={`/${l}`} className="flex min-h-11 items-center gap-3">
          <img src="/images/brand/fatlum-logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
          <span className="leading-none">
            <span className="block font-serif text-[1.35rem] tracking-[0.22em] text-ink">FATLUM</span>
            <span className="mt-1 block text-[9px] tracking-[0.32em] text-stone">JEWELRY</span>
          </span>
        </Link>
        <nav className="hidden items-center xl:flex" aria-label="Main">
          <button type="button" className={desk} aria-expanded={open === "rings"} onMouseEnter={() => setOpen("rings")} onClick={() => setOpen(open === "rings" ? null : "rings")}>{t.nav.rings}</button>
          <button type="button" className={desk} aria-expanded={open === "jewelry"} onMouseEnter={() => setOpen("jewelry")} onClick={() => setOpen(open === "jewelry" ? null : "jewelry")}>{t.nav.jewelry}</button>
          <Link className={`${desk} ${current(`/${l}/konfigurator`)}`} href={`/${l}/konfigurator`} onMouseEnter={() => setOpen(null)}>{t.nav.configurator}</Link>
          <Link className={`${desk} ${current(`/${l}/ueber-uns`)}`} href={`/${l}/ueber-uns`} onMouseEnter={() => setOpen(null)}>{t.nav.about}</Link>
          <Link className={`${desk} ${current(`/${l}/ratgeber`)}`} href={`/${l}/ratgeber`} onMouseEnter={() => setOpen(null)}>{t.nav.guides}</Link>
          <Link className={`${desk} ${current(`/${l}/kontakt`)}`} href={`/${l}/kontakt`} onMouseEnter={() => setOpen(null)}>{t.nav.contact}</Link>
        </nav>
        <div className="flex items-center gap-1">
          <LangSwitch l={l} className="xl:hidden" />
          <CartBadge label={t.nav.request} href={`/${l}/anfrage`} />
          <button
            ref={menuBtn}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-[11px] uppercase tracking-[0.18em] xl:hidden"
            aria-expanded={mobile}
            aria-controls={menuId}
            onClick={() => setMobile(true)}
          >
            {t.menu}
          </button>
        </div>
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full hidden border-b border-line bg-ivory xl:block">
          <div className="mx-auto grid max-w-[1240px] grid-cols-3 gap-10 px-8 py-10">
            {(open === "rings" ? ringLinks : jewelLinks).map((link) => {
              const note = "note" in link ? link.note : "";
              return (
                <Link key={link.href} href={link.href} className="group block min-h-11 border-t border-line pt-4" onClick={() => setOpen(null)}>
                  <span className="block font-serif text-3xl text-ink group-hover:text-metal">{link.label}</span>
                  {note ? <span className="mt-2 block text-[11px] uppercase tracking-[0.16em] text-stone">{note}</span> : null}
                </Link>
              );
            })}
            <Link href={open === "rings" ? `/${l}/konfigurator` : `/${l}/kollektion/ketten`} className="self-end text-[11px] uppercase tracking-[0.18em] text-stone hover:text-ink" onClick={() => setOpen(null)}>
              {open === "rings" ? t.nav.configurator : t.nav.jewelry} →
            </Link>
          </div>
        </div>
      )}
      </header>
    {mounted && menu ? createPortal(menu, document.body) : null}
    </>
  );
}

export function Footer({ l }: { l: Locale }) {
  const t = dict(l);
  const col = "text-[11px] uppercase tracking-[0.18em] text-stone";
  const link = "block py-1.5 text-sm hover:text-metal";
  return (
    <footer className="mt-24 border-t border-line bg-ivory">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-16 sm:grid-cols-2 md:px-8 lg:grid-cols-4 lg:py-20">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <img src="/images/brand/fatlum-logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            <span className="font-serif text-xl tracking-[0.22em]">FATLUM</span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-stone">{t.footer.blurb}</p>
          <address className="mt-5 not-italic text-sm leading-relaxed">
            {CONTACT.street}<br />{CONTACT.city}<br />{l === "de" ? CONTACT.countryDe : CONTACT.countryEn}
            <br /><a className="inline-flex min-h-11 items-center hover:text-metal" href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            <br /><a className="inline-flex min-h-11 items-center hover:text-metal" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </address>
        </div>
        <div>
          <h2 className={col}>{t.footer.collections}</h2>
          <ul className="mt-4">
            <li><Link className={link} href={`/${l}/kollektion/trauringe`}>{t.nav.wedding}</Link></li>
            <li><Link className={link} href={`/${l}/kollektion/verlobungsringe`}>{t.nav.engagement}</Link></li>
            <li><Link className={link} href={`/${l}/kollektion/weitere-ringe`}>{t.nav.otherRings}</Link></li>
            <li><Link className={link} href={`/${l}/konfigurator?art=rohling`}>{t.nav.blanks}</Link></li>
            <li><Link className={link} href={`/${l}/kollektion/ketten`}>{t.nav.chains}</Link></li>
            <li><Link className={link} href={`/${l}/kollektion/ohrringe`}>{t.nav.earrings}</Link></li>
            <li><Link className={link} href={`/${l}/kollektion/anhaenger`}>{t.nav.pendants}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className={col}>{t.footer.house}</h2>
          <ul className="mt-4">
            <li><Link className={link} href={`/${l}/konfigurator`}>{t.nav.configurator}</Link></li>
            <li><Link className={link} href={`/${l}/anfrage`}>{t.nav.request}</Link></li>
            <li><Link className={link} href={`/${l}/ueber-uns`}>{t.nav.about}</Link></li>
            <li><Link className={link} href={`/${l}/ratgeber`}>{t.nav.guides}</Link></li>
            <li><Link className={link} href={`/${l}/faq`}>{t.nav.faq}</Link></li>
            <li><Link className={link} href={`/${l}/kontakt`}>{t.nav.contact}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className={col}>{t.footer.legal}</h2>
          <ul className="mt-4">
            <li><Link className={link} href={`/${l}/impressum`}>{t.footer.imprint}</Link></li>
            <li><Link className={link} href={`/${l}/datenschutz`}>{t.footer.privacy}</Link></li>
            <li><Link className={link} href={`/${l}/agb`}>{t.footer.terms}</Link></li>
          </ul>
          <h2 className={`${col} mt-8`}>{t.footer.sisters}</h2>
          <ul className="mt-4">
            <li><a className={link} href={`${SISTER.gold}/${l}`}>{t.sisters.gold}</a></li>
            <li><a className={link} href={`${SISTER.diamonds}/${l}`}>{t.sisters.diamonds}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-[11px] tracking-[0.14em] text-stone">© {new Date().getFullYear()} Fatlum. {t.footer.rights}</div>
    </footer>
  );
}

export function Breadcrumb({ l, items }: { l: Locale; items: { href?: string; label: string }[] }) {
  const t = dict(l);
  return (
    <nav className="py-6 text-[11px] uppercase tracking-[0.16em] text-stone" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li><Link href={`/${l}`} className="inline-flex min-h-11 items-center hover:text-ink">{t.home}</Link></li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {item.href ? <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-ink">{item.label}</Link> : <span className="inline-flex min-h-11 items-center text-ink">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Shell({ l, crumbs, children, wide = false }: { l: Locale; crumbs?: { href?: string; label: string }[]; children: React.ReactNode; wide?: boolean }) {
  return (
    <>
      <a href="#content" className="skip-link">{dict(l).skip}</a>
      <Header l={l} />
      <main id="content">
        <div className={`mx-auto px-5 md:px-8 ${wide ? "max-w-[1240px]" : "max-w-[1180px]"}`}>
          {crumbs && <Breadcrumb l={l} items={crumbs} />}
          {children}
        </div>
      </main>
      <Footer l={l} />
    </>
  );
}

export function PageIntro({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede?: string }) {
  return (
    <header className="max-w-3xl pb-2">
      {eyebrow && <p className="text-[11px] uppercase tracking-[0.22em] text-metal">{eyebrow}</p>}
      <h1 className={`font-serif text-[2.6rem] leading-[1.02] tracking-[-0.02em] text-ink md:text-6xl ${eyebrow ? "mt-3" : ""}`}>{title}</h1>
      {lede && <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-stone md:text-base">{lede}</p>}
    </header>
  );
}
