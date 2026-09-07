import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getTopCategories } from "@/lib/dolibarr";
import { getPageSlugs, getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Mapa de la web — Melicotó",
  robots: "noindex, nofollow",
};

const PAGE_TITLES: Record<string, string> = {
  melicoto: "Qui som",
  "tens-dubtes": "Tens dubtes?",
  contacte: "Contacte",
  dibuixos: "Dibuixos Melicotó",
  "feim-pinya": "Camisetes x grups",
  "nota-legal-i-condicions": "Nota legal i condicions",
  "politica-de-cookies-ue": "Política de cookies",
  "politica-de-privacitat": "Política de privacitat",
};

export default async function SiteMapPage() {
  const [tops, all] = await Promise.all([getTopCategories(), getCategories()]);
  const pages = getPageSlugs();
  const posts = getPosts();

  return (
    <div className="mc-container mc-page" style={{ maxWidth: 820 }}>
      <h1 className="mc-page-title">Mapa de la web</h1>

      <h2>Botiga</h2>
      <ul>
        {tops.map((cat) => {
          const subs = all.filter((c) => c.parentId === cat.id);
          return (
            <li key={cat.id} style={{ marginBottom: "0.35rem" }}>
              <Link href={`/shop/categoria-producte/${cat.slug}`}>{cat.label}</Link>
              {subs.length > 0 && (
                <ul style={{ margin: "0.25rem 0 0 1.2rem" }}>
                  {subs.map((s) => (
                    <li key={s.id}>
                      <Link href={`/shop/categoria-producte/${cat.slug}/${s.slug}`}>{s.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <h2>Pàgines</h2>
      <ul>
        {pages.map((slug) => (
          <li key={slug}>
            <Link href={`/${slug}`}>{PAGE_TITLES[slug] ?? slug}</Link>
          </li>
        ))}
        <li><Link href="/blog">Blog</Link></li>
      </ul>

      {posts.length > 0 && (
        <>
          <h2>Blog</h2>
          <ul>
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
