import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/content";
import { Prose } from "@/components/Prose";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: `${page.meta.title} — Melicotó`,
    description: page.meta.description,
    robots: "noindex, nofollow",
  };
}

export default async function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <article className="mc-container mc-page" style={{ maxWidth: 820 }}>
      <h1 className="mc-page-title">{page.meta.title}</h1>
      {page.meta.updated && (
        <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", marginTop: "-0.5rem" }}>
          Actualitzat: {page.meta.updated}
        </p>
      )}
      <Prose html={page.html} />
    </article>
  );
}
