"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartBadge } from "./cart";
import { CONTACT, SISTER } from "@/lib/site";
import { dict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

function LangSwitch({ l }: { l: Locale }) {
  const path = usePathname() || `/${l}`;
  const rest = path.replace(/^\/(de|en)/, "") || "";
  return (
    <span className="flex gap-3">
      <Link href={`/de${rest}`} hrefLang="de" className={l === "de" ? "text-gold" : "hover:text-white"} aria-current={l === "de" ? "true" : undefined}>DE</Link>
      <Link href={`/en${rest}`} hrefLang="en" className={l === "en" ? "text-gold" : "hover:text-white"} aria-current={l === "en" ? "true" : undefined}>EN</Link>
    </span>
  );
}

export function Header({ l }: { l: Locale }) {
  const t = dict(l);
  const links = [
    { href: `/${l}/kollektion/trauringe`, label: t.nav.wedding },
    { href: `/${l}/kollektion/verlobungsringe`, label: t.nav.engagement },
    { href: `/${l}/kollektion/weitere-ringe`, label: t.nav.otherRings },
    { href: `/${l}/kollektion/ketten`, label: t.nav.chains },
    { href: `/${l}/kollektion/ohrringe`, label: t.nav.earrings },
    { href: `/${l}/kollektion/anhaenger`, label: t.nav.pendants },
    { href: `/${l}/konfigurator`, label: t.nav.configurator },
    { href: `/${l}/ratgeber`, label: t.nav.guides },
    { href: `/${l}/ueber-uns`, label: t.nav.about },
    { href: `/${l}/kontakt`, label: t.nav.contact },
  ];
  return (
    <header className="sticky top-0 z-30 bg-navy text-white shadow">
      <div className="border-b border-white/10 bg-[#020c2b] text-xs text-white/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5">
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            <a className="hover:text-white" href={`${SISTER.gold}/${l}`}>{t.sisters.gold}</a>
            <Link className="text-gold" href={`/${l}`} aria-current="page">{t.sisters.jewelry}</Link>
            <a className="hover:text-white" href={`${SISTER.diamonds}/${l}`}>{t.sisters.diamonds}</a>
          </span>
          <LangSwitch l={l} />
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href={`/${l}`} className="flex items-center gap-3">
          <img src="/images/brand/fatlum-logo.png" alt="Fatlum" className="h-11 w-11" />
          <span className="leading-none">
            <span className="block font-serif text-2xl tracking-[0.18em] text-gold">FATLUM</span>
            <span className="block text-[10px] tracking-[0.28em] text-white/70">JEWELRY</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm lg:flex" aria-label="Main">
          <Link href={`/${l}/kollektion/trauringe`} className="hover:text-gold">{t.nav.wedding}</Link>
          <Link href={`/${l}/kollektion/verlobungsringe`} className="hover:text-gold">{t.nav.engagement}</Link>
          <Link href={`/${l}/konfigurator`} className="hover:text-gold">{t.nav.configurator}</Link>
          <Link href={`/${l}/ratgeber`} className="hover:text-gold">{t.nav.guides}</Link>
          <Link href={`/${l}/kontakt`} className="hover:text-gold">{t.nav.contact}</Link>
        </nav>
        <CartBadge label={t.nav.request} href={`/${l}/anfrage`} />
      </div>
      <details className="border-t border-white/10 px-4 py-2 lg:hidden">
        <summary className="cursor-pointer text-sm text-gold-light">{t.menu}</summary>
        <nav className="flex flex-col gap-2 py-3 text-sm" aria-label="Mobile">
          {links.map((link) => <Link key={link.href} href={link.href} className="hover:text-gold">{link.label}</Link>)}
        </nav>
      </details>
    </header>
  );
}

export function Footer({ l }: { l: Locale }) {
  const t = dict(l);
  return (
    <footer className="mt-20 bg-navy text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src="/images/brand/fatlum-logo.png" alt="" className="h-10 w-10" />
            <span className="font-serif text-xl tracking-[0.18em] text-gold">FATLUM</span>
          </div>
          <p className="mt-4 text-sm">{t.footer.blurb}</p>
          <p className="mt-3 text-sm">{CONTACT.street}<br />{CONTACT.city}<br /><a className="hover:text-gold" href={CONTACT.phoneHref}>{CONTACT.phone}</a><br /><a className="hover:text-gold" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
        </div>
        <div>
          <h2 className="font-serif text-lg text-gold">{t.footer.collections}</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li><Link className="hover:text-gold" href={`/${l}/kollektion/trauringe`}>{t.nav.wedding}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/kollektion/verlobungsringe`}>{t.nav.engagement}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/kollektion/weitere-ringe`}>{t.nav.otherRings}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/kollektion/ketten`}>{t.nav.chains}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/kollektion/ohrringe`}>{t.nav.earrings}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/kollektion/anhaenger`}>{t.nav.pendants}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-lg text-gold">{t.footer.service}</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li><Link className="hover:text-gold" href={`/${l}/konfigurator`}>{t.nav.configurator}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/anfrage`}>{t.nav.request}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/ratgeber`}>{t.nav.guides}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/faq`}>{t.nav.faq}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/ueber-uns`}>{t.nav.about}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/kontakt`}>{t.nav.contact}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-lg text-gold">{t.footer.legal}</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li><Link className="hover:text-gold" href={`/${l}/impressum`}>{t.footer.imprint}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/datenschutz`}>{t.footer.privacy}</Link></li>
            <li><Link className="hover:text-gold" href={`/${l}/agb`}>{t.footer.terms}</Link></li>
          </ul>
          <h2 className="mt-6 font-serif text-lg text-gold">{t.footer.sisters}</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li><a className="hover:text-gold" href={`${SISTER.gold}/${l}`}>{t.sisters.gold}</a></li>
            <li><a className="hover:text-gold" href={`${SISTER.diamonds}/${l}`}>{t.sisters.diamonds}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">© {new Date().getFullYear()} Fatlum. {t.footer.rights}</div>
    </footer>
  );
}

export function Breadcrumb({ l, items }: { l: Locale; items: { href?: string; label: string }[] }) {
  const t = dict(l);
  return (
    <nav className="py-4 text-xs text-gray-500" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1">
        <li><Link href={`/${l}`} className="hover:text-gold">{t.home}</Link></li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1">
            <span aria-hidden>›</span>
            {item.href ? <Link href={item.href} className="hover:text-gold">{item.label}</Link> : <span className="text-navy">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Shell({ l, crumbs, children }: { l: Locale; crumbs?: { href?: string; label: string }[]; children: React.ReactNode }) {
  return (
    <>
      <a href="#content" className="skip-link">{dict(l).skip}</a>
      <Header l={l} />
      <main id="content" className="mx-auto max-w-7xl px-4">
        {crumbs && <Breadcrumb l={l} items={crumbs} />}
        {children}
      </main>
      <Footer l={l} />
    </>
  );
}
