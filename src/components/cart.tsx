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
const KEY = "fatlum-jewelry-request-v2";
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
    <a href={href} className="inline-flex min-h-11 items-center gap-2 px-2 text-[11px] uppercase tracking-[0.16em] text-ink" data-testid="cart-badge">
      <span className="hidden sm:inline">{label}</span>
      <span className="inline-flex h-6 min-w-6 items-center justify-center border border-ink px-1 text-[11px] tracking-normal">{count}</span>
    </a>
  );
}

export function AddProductButton({ line, label, addedLabel, qtyLabel }: { line: Omit<CartLine, "key" | "qty"> & { qty?: number }; label: string; addedLabel: string; qtyLabel: string }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="inline-flex h-12 items-center border border-line bg-white">
        <button type="button" className="h-12 w-12 text-lg" aria-label="-" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
        <label className="sr-only" htmlFor={`qty-${line.slug}`}>{qtyLabel}</label>
        <input id={`qty-${line.slug}`} type="number" min={1} max={10} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="h-12 w-12 border-x border-line bg-transparent text-center text-base" />
        <button type="button" className="h-12 w-12 text-lg" aria-label="+" onClick={() => setQty(Math.min(10, qty + 1))}>+</button>
      </div>
      <button type="button" onClick={() => { add({ ...line, key: line.slug || crypto.randomUUID(), qty }); setDone(true); window.setTimeout(() => setDone(false), 1600); }} className="btn btn-solid w-full sm:w-auto">
        {done ? addedLabel : label}
      </button>
    </div>
  );
}
