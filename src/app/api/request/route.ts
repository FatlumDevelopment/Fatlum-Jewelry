import { NextResponse } from "next/server";
import { getOptions, getProducts } from "@/lib/catalog";
import { CONTACT } from "@/lib/site";
import { clampRing, estimateWeight, findAlloy, findFinish, findProfile, findStone } from "@/lib/ring";
import type { ConfigMode, ConfigPayload, Locale, RingDraft } from "@/lib/types";

export const dynamic = "force-dynamic";

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const esc = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c);

function supabase() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  return { url, key };
}

function asMode(value: unknown): ConfigMode | null {
  return value === "single" || value === "pair" || value === "blank" ? value : null;
}

function asRing(value: unknown): RingDraft | null {
  if (!value || typeof value !== "object") return null;
  const row = value as RingDraft;
  if (typeof row.profile !== "string" || typeof row.alloy !== "string" || typeof row.finish !== "string") return null;
  if (typeof row.width_mm !== "number" || typeof row.height_mm !== "number" || typeof row.size_mm !== "number") return null;
  if (!row.groove || !row.stone || !row.engraving) return null;
  return row;
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
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.consent !== true) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (source === "contact" && message.length < 10) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  if (source === "request_list" && rawItems.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });

  const [products, options] = await Promise.all([getProducts(), getOptions()]);
  type Line = { item_type: "product" | "configuration"; sku: string; name_de: string; name_en: string; quantity: number; payload: Record<string, unknown> };
  const lines: Line[] = [];

  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });
    const row = raw as { kind?: string; qty?: number; slug?: string; payload?: ConfigPayload };
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
    if (row.kind !== "configuration" || !row.payload) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const mode = asMode(row.payload.mode);
    const drafts = Array.isArray(row.payload.rings) ? row.payload.rings.map(asRing) : [];
    if (!mode || drafts.some((ring) => !ring)) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const rings = (drafts as RingDraft[]).slice(0, mode === "pair" ? 2 : 1).map((ring) => clampRing(ring, options, mode));
    if (rings.length === 0) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const bitsDe = rings.map((ring) => describe(ring, options, "de"));
    const bitsEn = rings.map((ring) => describe(ring, options, "en"));
    const titleDe = mode === "pair" ? "Trauringpaar" : mode === "blank" ? "Rohling" : "Einzelring";
    const titleEn = mode === "pair" ? "Wedding pair" : mode === "blank" ? "Blank" : "Single ring";
    lines.push({
      item_type: "configuration",
      sku: mode === "blank" ? "FJ-ROH" : "FJ-KONFIG",
      name_de: `${titleDe}: ${bitsDe.join(" / ")}`,
      name_en: `${titleEn}: ${bitsEn.join(" / ")}`,
      quantity,
      payload: { mode, rings, weights_g: rings.map((ring) => {
        const profile = findProfile(options, ring.profile);
        const alloy = findAlloy(options, ring.alloy);
        return profile && alloy ? estimateWeight(ring, profile, alloy) : null;
      }) },
    });
  }

  const { url, key } = supabase();
  if (!url || !key) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  const id = crypto.randomUUID();
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

  const ref = id.slice(0, 8).toUpperCase();
  let emailed = false;
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const from = process.env.MAIL_FROM || "Fatlum Jewelry <anfragen@fatlum.jewelry>";
    const to = process.env.MAIL_TO || CONTACT.email;
    const list = lines.map((line) => `<li>${line.quantity} × ${esc(locale === "en" ? line.name_en : line.name_de)} (${esc(line.sku)})</li>`).join("");
    const wrap = (inner: string) => `<div style="font-family:Arial,sans-serif;color:#2b2f3a;max-width:600px"><div style="background:#03123f;padding:18px 24px"><span style="font-family:Georgia,serif;color:#bf9e50;font-size:22px;letter-spacing:4px">FATLUM</span></div><div style="padding:24px">${inner}</div></div>`;
    const internal = wrap(`<h2 style="color:#03123f">Neue Schmuckanfrage ${ref}</h2><p><b>${esc(name)}</b>${company ? `<br>${esc(company)}` : ""}<br>${esc(email)}<br>${esc(phone)}</p>${message ? `<p>${esc(message).replace(/\n/g, "<br>")}</p>` : ""}<ul>${list}</ul><p style="font-size:12px;color:#777">Sprache: ${locale} · ${source} · ${id}</p>`);
    const customer = locale === "en"
      ? wrap(`<h2 style="color:#03123f">We have your request</h2><p>Dear ${esc(name)},</p><p>your request ${ref} is with Fatlum Jewelry. Nothing has been charged. We will reply with a personal offer.</p><ul>${list}</ul><p>Fatlum · ${CONTACT.street}, ${CONTACT.city} · ${CONTACT.email}</p>`)
      : wrap(`<h2 style="color:#03123f">Ihre Anfrage ist da</h2><p>Guten Tag ${esc(name)},</p><p>Ihre Anfrage ${ref} liegt bei Fatlum Jewelry. Es wurde nichts berechnet. Wir antworten mit einem persönlichen Angebot.</p><ul>${list}</ul><p>Fatlum · ${CONTACT.street}, ${CONTACT.city} · ${CONTACT.email}</p>`);
    const send = (payload: object, idempotency: string) => fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json", "Idempotency-Key": idempotency },
      body: JSON.stringify({ from, ...payload }),
    }).then(async (response) => {
      if (!response.ok) { console.error("resend", response.status); return false; }
      return true;
    }).catch((error) => { console.error("resend", error instanceof Error ? error.message : "failed"); return false; });
    const [internalOk, customerOk] = await Promise.all([
      send({ to: [to], reply_to: email, subject: `Neue Schmuckanfrage ${ref} – ${name}`, html: internal }, `jewelry-inquiry/${id}/internal`),
      send({ to: [email], reply_to: to, subject: locale === "en" ? `Your Fatlum Jewelry request ${ref}` : `Ihre Anfrage bei Fatlum Jewelry ${ref}`, html: customer }, `jewelry-inquiry/${id}/customer`),
    ]);
    emailed = internalOk && customerOk;
  }

  return NextResponse.json({ ok: true, ref, emailed });
}

function describe(ring: RingDraft, options: Awaited<ReturnType<typeof getOptions>>, locale: Locale) {
  const profile = findProfile(options, ring.profile);
  const alloy = findAlloy(options, ring.alloy);
  const finish = findFinish(options, ring.finish);
  const stone = findStone(options, ring.stone.code);
  const name = profile ? (locale === "en" ? profile.name_en : profile.name_de) : ring.profile;
  const metal = alloy ? `${alloy.fineness} ${locale === "en" ? alloy.color_en : alloy.color_de}` : ring.alloy;
  const face = finish ? (locale === "en" ? finish.name_en : finish.name_de) : ring.finish;
  const gem = !stone || ring.stone.code === "none" ? "" : `, ${locale === "en" ? stone.name_en : stone.name_de} ${ring.stone.count}×${ring.stone.size_mm} mm`;
  const cut = ring.engraving.text ? `, „${ring.engraving.text}“` : "";
  return `${name}, ${ring.width_mm}×${ring.height_mm} mm, ${locale === "en" ? "size" : "Größe"} ${ring.size_mm}, ${metal}, ${face}${gem}${cut}`;
}
