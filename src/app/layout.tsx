import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart-context";
import Link from "next/link";

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
          <nav style={{ backgroundColor: "#f8f9fa", padding: "1rem", borderBottom: "1px solid #ddd" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Link href="/" style={{ fontSize: "1.5rem", fontWeight: "bold", textDecoration: "none", color: "#333" }}>
                Melicotó
              </Link>
              <Link href="/carret" style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}>
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
