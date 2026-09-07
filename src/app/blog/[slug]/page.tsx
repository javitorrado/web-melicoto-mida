import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/content";
import { Prose } from "@/components/Prose";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.meta.title} — Blog Melicotó`,
    description: post.meta.description ?? post.meta.excerpt,
    robots: "noindex, nofollow",
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="mc-container mc-page" style={{ maxWidth: 780 }}>
      <p style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>{formatDate(post.meta.date)}</p>
      <h1 className="mc-page-title" style={{ marginTop: "0.25rem" }}>{post.meta.title}</h1>
      {post.meta.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.meta.cover}
          alt=""
          style={{ width: "100%", borderRadius: "var(--radius-md)", margin: "var(--space-md) 0 var(--space-lg)" }}
        />
      )}
      <Prose html={post.html} />

      <hr style={{ margin: "var(--space-2xl) 0 var(--space-lg)", border: 0, borderTop: "1px solid var(--color-border)" }} />
      <Link href="/blog">← Tornar al blog</Link>
    </article>
  );
}
