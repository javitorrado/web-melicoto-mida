/**
 * Script para migrar contenido Markdown a BD SQLite.
 * Executa: npx ts-node scripts/migrate-content.ts
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getDb, createPage, createBlogPost, getPageAdmin, getBlogPostAdmin } from "../src/lib/db";

const CONTENT_DIR = path.join(process.cwd(), "content");

function migratePages() {
  const pagesDir = path.join(CONTENT_DIR, "pages");
  if (!fs.existsSync(pagesDir)) {
    console.log("❌ No pages directory found");
    return;
  }

  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".md"));
  console.log(`📄 Found ${files.length} markdown pages`);

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const filePath = path.join(pagesDir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    // Skip if already exists
    if (getPageAdmin(slug)) {
      console.log(`⏭️  Skipping page: ${slug} (already exists)`);
      continue;
    }

    createPage(slug, data.title as string, content, data.description as string | undefined);
    console.log(`✅ Migrated page: ${slug}`);
  }
}

function migrateBlog() {
  const blogDir = path.join(CONTENT_DIR, "blog");
  if (!fs.existsSync(blogDir)) {
    console.log("❌ No blog directory found");
    return;
  }

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
  console.log(`📝 Found ${files.length} blog posts`);

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const filePath = path.join(blogDir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    // Skip if already exists
    if (getBlogPostAdmin(slug)) {
      console.log(`⏭️  Skipping post: ${slug} (already exists)`);
      continue;
    }

    createBlogPost(
      slug,
      data.title as string,
      content,
      data.date as string,
      data.description as string | undefined,
      data.excerpt as string | undefined,
      data.cover as string | undefined
    );
    console.log(`✅ Migrated post: ${slug}`);
  }
}

function main() {
  console.log("🚀 Starting content migration...\n");
  getDb(); // Initialize DB
  migratePages();
  console.log("");
  migrateBlog();
  console.log("\n✨ Migration complete!");
}

main();
