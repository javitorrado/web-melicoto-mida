import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart-context";
import Link from "next/link";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Melicotó — Botiga online",
  description: "Botiga online de Melicotó a Mallorca",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ca">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <CartProvider>
          <nav style={{ backgroundColor: "var(--color-bg-secondary)", padding: "1rem", borderBottom: "1px solid var(--color-border)" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Link href="/" style={{ fontSize: "1.5rem", fontWeight: "bold", textDecoration: "none", color: "var(--color-primary)" }}>
                🏪 Melicotó
              </Link>
              <Link href="/carret" style={{ textDecoration: "none", color: "var(--color-primary)", fontWeight: "bold" }}>
                🛒 Carret
              </Link>
            </div>
          </nav>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
