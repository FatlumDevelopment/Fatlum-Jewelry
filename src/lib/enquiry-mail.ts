import { Resend } from "resend";
import { metalByCode, SETTINGS, SHAPES } from "@/lib/ring-config";

export const DEFAULT_MAIL_FROM = "Fatlum Jewelry <info@fatlum.jewelry>";
export const DEFAULT_MAIL_TO = "info@fatlum.jewelry";

const esc = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c);

export type EnquiryLine = {
  item_type: "product" | "configuration";
  sku: string;
  name_de: string;
  name_en: string;
  quantity: number;
  payload: Record<string, unknown>;
};

export type EnquiryMail = {
  id: string;
  locale: "de" | "en";
  source: "contact" | "request_list";
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  lines: EnquiryLine[];
};

export type MailResult = "both" | "shop" | "skipped" | "failed";

function mailFrom() {
  return process.env.MAIL_FROM?.trim() || DEFAULT_MAIL_FROM;
}

function mailTo() {
  return process.env.MAIL_TO?.trim() || DEFAULT_MAIL_TO;
}

function ringRows(payload: Record<string, unknown>): [string, string][] {
  const mode = payload.mode === "blank" ? "blank" : payload.mode === "finished" ? "finished" : null;
  if (!mode || typeof payload.metal !== "string") return [];
  const metal = metalByCode(payload.metal);
  const rows: [string, string][] = [
    ["Art / Type", mode === "blank" ? "Rohling / Blank" : "Fertiger Ring / Finished ring"],
    ["Metall / Metal", `${metal.fineness} ${metal.de} / ${metal.en} (${payload.metal})`],
  ];
  if (mode === "finished") {
    const shape = SHAPES.find((item) => item.code === payload.shape);
    const setting = SETTINGS.find((item) => item.code === payload.setting);
    rows.push(
      ["Stein / Stone", shape ? `${shape.de} / ${shape.en}` : String(payload.shape ?? "")],
      ["Karat / Carat", typeof payload.carat === "number" ? payload.carat.toFixed(2) : String(payload.carat ?? "")],
      ["Fassung / Setting", setting ? `${setting.de} / ${setting.en}` : String(payload.setting ?? "")],
      ["Gravur / Engraving", typeof payload.engraving === "string" && payload.engraving ? payload.engraving : "—"],
    );
  } else if (typeof payload.width_mm === "number") {
    rows.push(["Breite / Width", `${payload.width_mm.toFixed(1)} mm`]);
  }
  if (typeof payload.size_mm === "number") rows.push(["Größe / Size (mm)", String(payload.size_mm)]);
  return rows;
}

function detailRows(mail: EnquiryMail): [string, string][] {
  const rows: [string, string][] = [
    ["Name", mail.name],
    ["Firma / Company", mail.company || "—"],
    ["E-Mail", mail.email],
    ["Telefon / Phone", mail.phone || "—"],
    ["Sprache / Language", mail.locale],
    ["Quelle / Source", mail.source === "contact" ? "Kontakt / Contact" : "Konfigurator / Configurator"],
    ["Nachricht / Message", mail.message || "—"],
  ];
  return rows;
}

function lineBlocks(mail: EnquiryMail): { title: string; rows: [string, string][] }[] {
  return mail.lines.map((line, index) => {
    const title = `${index + 1}. ${line.quantity} × ${line.name_de} / ${line.name_en} (${line.sku})`;
    const rows = line.item_type === "configuration" ? ringRows(line.payload) : Object.entries(line.payload).map(([key, value]) => [key, String(value)] as [string, string]);
    return { title, rows };
  });
}

function textTable(rows: [string, string][]) {
  return rows.map(([key, value]) => `${key}: ${value}`).join("\n");
}

function htmlTable(rows: [string, string][]) {
  return rows.map(([key, value]) => `<tr><td style="padding:4px 16px 4px 0;color:#5c564e;vertical-align:top">${esc(key)}</td><td style="padding:4px 0;vertical-align:top">${esc(value).replace(/\n/g, "<br>")}</td></tr>`).join("");
}

function wrap(inner: string) {
  return `<div style="font-family:Georgia,serif;background:#f3f0ea;color:#1a1814;padding:32px;line-height:1.5"><p style="letter-spacing:0.28em;font-size:13px;margin:0 0 24px">FATLUM JEWELRY</p>${inner}</div>`;
}

function shopBodies(mail: EnquiryMail, ref: string) {
  const blocks = lineBlocks(mail);
  const text = [
    `Neue Anfrage ${ref}`,
    "",
    textTable(detailRows(mail)),
    "",
    ...blocks.flatMap((block) => [block.title, textTable(block.rows), ""]),
    `Referenz ${mail.id}`,
  ].join("\n");
  const html = wrap(
    `<h2 style="font-weight:400;margin:0 0 16px">Neue Anfrage ${esc(ref)}</h2><table>${htmlTable(detailRows(mail))}</table>${blocks.map((block) => `<h3 style="font-weight:400;margin:24px 0 8px">${esc(block.title)}</h3><table>${htmlTable(block.rows)}</table>`).join("")}<p style="font-size:12px;color:#5c564e">${esc(mail.id)}</p>`,
  );
  return { text, html };
}

function customerBodies(mail: EnquiryMail, ref: string) {
  const blocks = lineBlocks(mail);
  const de = mail.locale !== "en";
  const intro = de
    ? `Guten Tag ${mail.name},\n\nwir haben Ihre Anfrage ${ref} erhalten. Es wurde nichts berechnet. Wir antworten mit einem persönlichen Angebot.`
    : `Hello ${mail.name},\n\nwe have your request ${ref}. Nothing has been charged. We will reply with a personal offer.`;
  const text = [intro, "", ...blocks.flatMap((block) => [block.title, textTable(block.rows), ""]), "Fatlum Jewelry · info@fatlum.jewelry"].join("\n");
  const htmlIntro = de
    ? `<p>Guten Tag ${esc(mail.name)},</p><p>wir haben Ihre Anfrage ${esc(ref)} erhalten. Es wurde nichts berechnet. Wir antworten mit einem persönlichen Angebot.</p>`
    : `<p>Hello ${esc(mail.name)},</p><p>we have your request ${esc(ref)}. Nothing has been charged. We will reply with a personal offer.</p>`;
  const html = wrap(`${htmlIntro}${blocks.map((block) => `<h3 style="font-weight:400;margin:24px 0 8px">${esc(block.title)}</h3><table>${htmlTable(block.rows)}</table>`).join("")}<p style="font-size:13px;color:#5c564e">Fatlum Jewelry · info@fatlum.jewelry</p>`);
  const subject = de ? `Ihre Anfrage bei Fatlum Jewelry ${ref}` : `Your Fatlum Jewelry request ${ref}`;
  return { text, html, subject };
}

export async function sendEnquiryMails(mail: EnquiryMail): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info("RESEND_API_KEY is not set; enquiry email was not sent");
    return "skipped";
  }
  const resend = new Resend(apiKey);
  const from = mailFrom();
  const shop = mailTo();
  const ref = mail.id.slice(0, 8).toUpperCase();
  const shopBody = shopBodies(mail, ref);
  const customer = customerBodies(mail, ref);
  const shopSend = await resend.emails.send(
    {
      from,
      to: [shop],
      replyTo: mail.email,
      subject: `Neue Anfrage ${ref} – ${mail.name}`,
      html: shopBody.html,
      text: shopBody.text,
    },
    { idempotencyKey: `jewelry-inquiry/${mail.id}/shop` },
  );
  if (shopSend.error) {
    console.error("resend shop", shopSend.error.message);
    return "failed";
  }
  const customerSend = await resend.emails.send(
    {
      from,
      to: [mail.email],
      replyTo: shop,
      subject: customer.subject,
      html: customer.html,
      text: customer.text,
    },
    { idempotencyKey: `jewelry-inquiry/${mail.id}/customer` },
  );
  if (customerSend.error) {
    console.error("resend customer", customerSend.error.message);
    return "shop";
  }
  return "both";
}
