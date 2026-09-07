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

export async function getPageSlugs(): Promise<string[]> {
  const pages = await getAllPages();
  return pages.map((p) => p.slug);
}

export async function getPage(slug: string): Promise<RenderedDoc<PageMeta> | null> {
  const page = await getPageDb(slug);
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

export async function getPostSlugs(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  return posts.map((p) => p.slug);
}

export async function getPosts(): Promise<PostMeta[]> {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    excerpt: post.excerpt,
    cover: post.cover,
  }));
}

export async function getPost(slug: string): Promise<RenderedDoc<PostMeta> | null> {
  const post = await getBlogPostDb(slug);
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
