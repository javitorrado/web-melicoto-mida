import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * CMS basat en fitxers Markdown (fase 1 — sense BD).
 *   content/pages/<slug>.md   → pàgines estàtiques (/<slug>)
 *   content/blog/<slug>.md    → articles del blog (/blog/<slug>)
 *
 * Frontmatter comú: title, description
 * Blog, a més: date (YYYY-MM-DD), excerpt, cover (opcional), draft (opcional)
 *
 * Quan es faci el panell /admin, aquesta capa es reemplaça per consultes a BD
 * mantenint la mateixa firma pública.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

marked.setOptions({ gfm: true, breaks: false });

export interface PageMeta {
  slug: string;
  title: string;
  description?: string;
  updated?: string;
}

export interface PostMeta extends PageMeta {
  date: string;
  excerpt?: string;
  cover?: string;
  draft?: boolean;
}

export interface RenderedDoc<M> {
  meta: M;
  html: string;
}

function readDir(sub: string): string[] {
  const dir = path.join(CONTENT_DIR, sub);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function readDoc(sub: string, slug: string) {
  const file = path.join(CONTENT_DIR, sub, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { data: data as Record<string, unknown>, body: content };
}

/* ---------- Pàgines estàtiques ---------- */

export function getPageSlugs(): string[] {
  return readDir("pages");
}

export function getPage(slug: string): RenderedDoc<PageMeta> | null {
  const doc = readDoc("pages", slug);
  if (!doc) return null;
  return {
    meta: {
      slug,
      title: (doc.data.title as string) ?? slug,
      description: doc.data.description as string | undefined,
      updated: doc.data.updated as string | undefined,
    },
    html: marked.parse(doc.body) as string,
  };
}

/* ---------- Blog ---------- */

export function getPostSlugs(): string[] {
  return readDir("blog");
}

export function getPosts(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => {
      const doc = readDoc("blog", slug)!;
      return {
        slug,
        title: (doc.data.title as string) ?? slug,
        description: doc.data.description as string | undefined,
        date: (doc.data.date as string) ?? "1970-01-01",
        excerpt: doc.data.excerpt as string | undefined,
        cover: doc.data.cover as string | undefined,
        draft: Boolean(doc.data.draft),
      };
    })
    .filter((p) => !p.draft || process.env.NODE_ENV !== "production")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): RenderedDoc<PostMeta> | null {
  const doc = readDoc("blog", slug);
  if (!doc) return null;
  return {
    meta: {
      slug,
      title: (doc.data.title as string) ?? slug,
      description: doc.data.description as string | undefined,
      date: (doc.data.date as string) ?? "1970-01-01",
      excerpt: doc.data.excerpt as string | undefined,
      cover: doc.data.cover as string | undefined,
      draft: Boolean(doc.data.draft),
    },
    html: marked.parse(doc.body) as string,
  };
}
