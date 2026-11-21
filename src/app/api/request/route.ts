import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";
import { sendEnquiryMails, type EnquiryLine } from "@/lib/enquiry-mail";
import { describeRing, parseRingConfig, ringNames } from "@/lib/ring-config";
import type { Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const emailOk = (value: string) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n]/.test(value);

function supabase() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  return { url, key };
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  if (text(body.website, 200)) return NextResponse.json({ ok: true, emailed: false });

  const locale: Locale = body.locale === "en" ? "en" : "de";
  const source = body.source === "contact" ? "contact" : "request_list";
  const name = text(body.name, 200);
  const email = text(body.email, 254);
  const company = text(body.company, 200);
  const phone = text(body.phone, 40);
  const message = text(body.message, 4000);
  if (name.length < 2 || !emailOk(email) || body.consent !== true) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (source === "contact" && message.length < 10) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  if (source === "request_list" && rawItems.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });

  const products = rawItems.some((item) => item && typeof item === "object" && (item as { kind?: string }).kind === "product") ? await getProducts() : [];
  const lines: EnquiryLine[] = [];

  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });
    const row = raw as { kind?: string; qty?: number; slug?: string; payload?: unknown };
    const quantity = Math.max(1, Math.min(10, Math.floor(Number(row.qty) || 1)));
    if (row.kind === "product") {
      const product = products.find((item) => item.slug === row.slug);
      if (!product) return NextResponse.json({ error: "unknown product" }, { status: 400 });
      lines.push({
        item_type: "product",
        sku: product.sku,
        name_de: product.name_de,
        name_en: product.name_en,
        quantity,
        payload: { slug: product.slug, alloy_de: product.alloy_de, alloy_en: product.alloy_en },
      });
      continue;
    }
    if (row.kind !== "configuration") return NextResponse.json({ error: "invalid" }, { status: 400 });
    const ring = parseRingConfig(row.payload);
    if (!ring) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const names = ringNames(ring);
    lines.push({
      item_type: "configuration",
      sku: names.sku,
      name_de: `${names.name_de}: ${describeRing(ring, "de")}`,
      name_en: `${names.name_en}: ${describeRing(ring, "en")}`,
      quantity,
      payload: { ...ring, summary_de: describeRing(ring, "de"), summary_en: describeRing(ring, "en") },
    });
  }

  const { url, key } = supabase();
  const id = crypto.randomUUID();
  let stored = false;
  if (url && key) {
    const headers = { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json", Prefer: "return=minimal" };
    const inquiry = await fetch(`${url}/rest/v1/jewelry_inquiries`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id, locale, source, name, company: company || null, email, phone: phone || null, message: message || null, consent_at: new Date().toISOString(), status: "new" }),
    });
    if (!inquiry.ok) {
      console.error("jewelry inquiry insert", inquiry.status);
      return NextResponse.json({ error: "db" }, { status: 500 });
    }
    if (lines.length) {
      const items = await fetch(`${url}/rest/v1/jewelry_inquiry_items`, {
        method: "POST",
        headers,
        body: JSON.stringify(lines.map((line, position) => ({ inquiry_id: id, position, ...line }))),
      });
      if (!items.ok) {
        console.error("jewelry inquiry items", items.status);
        return NextResponse.json({ error: "db" }, { status: 500 });
      }
    }
    stored = true;
  } else {
    console.info("Supabase is not configured; enquiry was not stored");
  }

  const mail = await sendEnquiryMails({ id, locale, source, name, company, email, phone, message, lines });
  if (!stored && mail !== "both" && mail !== "shop") {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }
  const ref = id.slice(0, 8).toUpperCase();
  return NextResponse.json({ ok: true, ref, emailed: mail === "both", mail });
}
