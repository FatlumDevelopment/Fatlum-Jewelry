"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { CartLine } from "@/lib/types";

type Ctx = {
  items: CartLine[];
  add: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  ready: boolean;
};
const C = createContext<Ctx | null>(null);
const KEY = "fatlum-jewelry-request-list";
const clamp = (q: number) => Math.max(1, Math.min(10, Math.floor(q || 1)));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "[]") as CartLine[];
      if (Array.isArray(parsed)) setItems(parsed.filter((line) => line && typeof line.key === "string"));
    } catch { /* ignore broken local storage */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);
  const add = (line: CartLine) => setItems((current) => {
    if (line.kind === "product" && line.slug) {
      const found = current.find((item) => item.kind === "product" && item.slug === line.slug);
      if (found) return current.map((item) => (item.key === found.key ? { ...item, qty: clamp(item.qty + line.qty) } : item));
    }
    return [...current, { ...line, qty: clamp(line.qty) }];
  });
  const setQty = (key: string, qty: number) => setItems((current) => current.map((item) => (item.key === key ? { ...item, qty: clamp(qty) } : item)));
  const remove = (key: string) => setItems((current) => current.filter((item) => item.key !== key));
  const clear = () => setItems([]);
  return <C.Provider value={{ items, add, setQty, remove, clear, ready, count: items.reduce((sum, item) => sum + item.qty, 0) }}>{children}</C.Provider>;
}
export function useCart() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("cart");
  return ctx;
}

export function CartBadge({ label, href }: { label: string; href: string }) {
  const { count } = useCart();
  return (
    <a href={href} className="relative inline-flex items-center gap-2 rounded-full border border-gold/60 px-4 py-2 text-sm text-white transition hover:bg-gold hover:text-navy" data-testid="cart-badge">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M9 5h11M9 12h11M9 19h11M4 5h.01M4 12h.01M4 19h.01" /></svg>
      <span className="hidden sm:inline">{label}</span>
      <span className="min-w-5 rounded-full bg-gold px-1.5 text-center text-xs font-semibold text-navy">{count}</span>
    </a>
  );
}

export function AddProductButton({ line, label, addedLabel, qtyLabel }: { line: Omit<CartLine, "key" | "qty"> & { qty?: number }; label: string; addedLabel: string; qtyLabel: string }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-stretch gap-2">
      <label className="sr-only" htmlFor={`qty-${line.slug}`}>{qtyLabel}</label>
      <input id={`qty-${line.slug}`} type="number" min={1} max={10} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-16 rounded border border-gray-300 px-2 text-center" />
      <button type="button" onClick={() => { add({ ...line, key: line.slug || crypto.randomUUID(), qty }); setDone(true); window.setTimeout(() => setDone(false), 1400); }} className="flex-1 rounded bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-secondary">
        {done ? addedLabel : label}
      </button>
    </div>
  );
}
