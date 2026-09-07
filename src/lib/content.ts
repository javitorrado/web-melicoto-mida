import { marked } from "marked";
import { getPage as getPageDb, getAllPages, getBlogPost as getBlogPostDb, getAllBlogPosts } from "./db";

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
}

export interface RenderedDoc<M> {
  meta: M;
  html: string;
}

/* ---------- Pàgines estàtiques ---------- */

export function getPageSlugs(): string[] {
  return getAllPages().map((p) => p.slug);
}

export function getPage(slug: string): RenderedDoc<PageMeta> | null {
  const page = getPageDb(slug);
  if (!page) return null;
  return {
    meta: {
      slug: page.slug,
      title: page.title,
      description: page.description,
      updated: page.updatedAt,
    },
    html: marked.parse(page.content) as string,
  };
}

/* ---------- Blog ---------- */

export function getPostSlugs(): string[] {
  return getAllBlogPosts().map((p) => p.slug);
}

export function getPosts(): PostMeta[] {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    excerpt: post.excerpt,
    cover: post.cover,
  }));
}

export function getPost(slug: string): RenderedDoc<PostMeta> | null {
  const post = getBlogPostDb(slug);
  if (!post) return null;
  return {
    meta: {
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      excerpt: post.excerpt,
      cover: post.cover,
    },
    html: marked.parse(post.content) as string,
  };
}
