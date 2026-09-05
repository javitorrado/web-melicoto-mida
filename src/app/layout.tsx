import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
