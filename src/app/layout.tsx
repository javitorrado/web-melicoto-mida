import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart-context";
import { UserProvider } from "@/lib/user-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getTopCategories } from "@/lib/dolibarr";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Melicotó — Botiga online",
  description: "Botiga online de Melicotó · cultura illenca, artesania i tradició mallorquina",
  robots: "noindex, nofollow",
};

const FALLBACK_NAV = [
  { label: "Tèxtil", slug: "textil" },
  { label: "Complements", slug: "complements" },
  { label: "Ca nostra", slug: "ca-nostra" },
  { label: "Cuina", slug: "cuina" },
  { label: "Artesania", slug: "artesania" },
  { label: "Papereria", slug: "papereria" },
  { label: "Infantil", slug: "infantil" },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cats = await getTopCategories();
  const nav = cats.length > 0 ? cats.map((c) => ({ label: c.label, slug: c.slug })) : FALLBACK_NAV;

  return (
    <html lang="ca">
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Calistoga&family=Poppins:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>
        <UserProvider>
          <CartProvider>
            <SiteHeader categories={nav} />
            <main>{children}</main>
            <SiteFooter />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
