import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog — Melicotó",
  description: "Notícies, històries i cultura illenca des de Melicotó.",
  robots: "noindex, nofollow",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <div className="mc-container mc-page" style={{ maxWidth: 820 }}>
      <h1 className="mc-page-title">Blog</h1>

      {posts.length === 0 ? (
        <p>Encara no hi ha articles publicats.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
          {posts.map((post) => (
            <article key={post.slug} style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-lg)" }}>
              <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                {formatDate(post.date)}
              </p>
              <h2 style={{ marginBottom: "0.4rem" }}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              {post.excerpt && <p style={{ margin: 0 }}>{post.excerpt}</p>}
              <Link href={`/blog/${post.slug}`} style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                Llegir més →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
