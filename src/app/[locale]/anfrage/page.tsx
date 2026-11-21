import type { Metadata } from "next";
import { Shell, PageIntro } from "@/components/chrome";
import { RequestList } from "@/components/request-list";
import { dict } from "@/lib/i18n";
import { takeLocale } from "@/lib/locale";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return pageMeta(locale, t.meta.requestTitle, t.meta.requestDescription, "/anfrage");
}

export default async function RequestPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await takeLocale(params);
  const t = dict(locale);
  return (
    <Shell l={locale} crumbs={[{ label: t.nav.request }]}>
      <PageIntro title={t.request.title} lede={t.request.intro} />
      <RequestList l={locale} />
    </Shell>
  );
}
