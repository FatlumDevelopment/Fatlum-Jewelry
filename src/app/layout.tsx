import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart";
import { LocaleLang } from "@/components/locale-lang";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Fatlum Jewelry", template: "%s · Fatlum Jewelry" },
  description: "Rings and jewelry by Fatlum in Munich. Prices on request.",
  applicationName: "Fatlum Jewelry",
  authors: [{ name: "Fatlum" }],
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: "Fatlum Jewelry" },
};

export const viewport: Viewport = {
  themeColor: "#f3f0ea",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <LocaleLang />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
