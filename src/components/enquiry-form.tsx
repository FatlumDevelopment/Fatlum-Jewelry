"use client";
import Link from "next/link";
import { useState } from "react";
import { dict } from "@/lib/i18n";
import type { Locale, RingConfig } from "@/lib/types";

export type EnquiryItem = {
  kind: "product" | "configuration";
  qty: number;
  slug?: string;
  payload?: RingConfig;
};

const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function EnquiryForm({
  locale,
  source,
  items,
  submitLabel,
  messageRequired = false,
  onSuccess,
}: {
  locale: Locale;
  source: "contact" | "request_list";
  items: EnquiryItem[];
  submitLabel: string;
  messageRequired?: boolean;
  onSuccess?: () => void;
}) {
  const t = dict(locale);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "mail" | "err">("idle");
  const [mailFailed, setMailFailed] = useState(false);
  const [ref, setRef] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();
    const next: Record<string, string> = {};
    if (name.length < 2) next.name = t.request.required;
    if (!emailOk(email)) next.email = t.request.emailInvalid;
    if (messageRequired && message.length < 10) next.message = t.request.messageShort;
    if (form.get("consent") !== "on") next.consent = t.request.consentRequired;
    setErrors(next);
    if (Object.keys(next).length) {
      const key = Object.keys(next)[0];
      document.getElementById(`field-${key}`)?.focus();
      return;
    }
    setState("sending");
    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source,
          locale,
          name,
          company: form.get("company"),
          email,
          phone: form.get("phone"),
          message,
          consent: true,
          website: form.get("website"),
          items,
        }),
      });
      if (!response.ok) {
        setState("err");
        return;
      }
      const data = (await response.json()) as { emailed?: boolean; ref?: string; mail?: string };
      setRef(data.ref || "");
      setMailFailed(data.mail === "failed");
      setState(data.emailed ? "mail" : "ok");
      onSuccess?.();
    } catch {
      setState("err");
    }
  }

  if (state === "ok" || state === "mail") {
    return (
      <div data-testid="success" className="border border-line bg-white px-6 py-10" role="status">
        <p className="font-serif text-3xl">{state === "mail" ? t.request.successMail : source === "contact" ? t.contact.success : t.request.success}</p>
        {ref ? <p className="mt-4 text-sm tracking-[0.14em] uppercase text-stone">{t.request.ref(ref)}</p> : null}
        {mailFailed ? <p className="mt-4 text-sm text-[#7a2e24]">{t.request.mailFailed}</p> : null}
        <p className="mt-4 text-sm text-stone">{t.request.noPayment}</p>
      </div>
    );
  }

  const err = (key: string) => errors[key] ? <p id={`${key}-error`} className="mt-1 text-sm text-[#7a2e24]">{errors[key]}</p> : null;

  return (
    <form onSubmit={submit} noValidate className="space-y-4" data-testid="enquiry-form">
      <h2 className="font-serif text-3xl">{source === "contact" ? t.contact.formTitle : t.request.formTitle}</h2>
      {state === "err" && <p role="alert" className="text-sm text-[#7a2e24]">{t.request.error}</p>}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="block text-sm" htmlFor="field-name">{t.request.name}
        <input id="field-name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} className="field mt-1" />
      </label>
      {err("name")}
      <label className="block text-sm" htmlFor="field-company">{t.request.company}
        <input id="field-company" name="company" autoComplete="organization" className="field mt-1" />
      </label>
      <label className="block text-sm" htmlFor="field-email">{t.request.email}
        <input id="field-email" name="email" type="email" autoComplete="email" inputMode="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} className="field mt-1" />
      </label>
      {err("email")}
      <label className="block text-sm" htmlFor="field-phone">{t.request.phone}
        <input id="field-phone" name="phone" type="tel" autoComplete="tel" className="field mt-1" />
      </label>
      <label className="block text-sm" htmlFor="field-message">{t.request.message}
        <textarea id="field-message" name="message" aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} className="field mt-1" />
      </label>
      {err("message")}
      <label className="flex items-start gap-3 text-sm leading-relaxed" htmlFor="field-consent">
        <input id="field-consent" name="consent" type="checkbox" className="mt-1 h-5 w-5 accent-ink" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-error" : undefined} />
        <span>{t.request.consent} <Link className="underline" href={`/${locale}/datenschutz`}>{locale === "de" ? "Datenschutz" : "Privacy"}</Link></span>
      </label>
      {err("consent")}
      <button type="submit" className="btn btn-solid w-full sm:w-auto" disabled={state === "sending"} aria-busy={state === "sending"}>
        {state === "sending" ? t.request.sending : submitLabel}
      </button>
      <p className="text-sm text-stone">{t.request.noPayment}</p>
    </form>
  );
}
