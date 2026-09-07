const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

// Import db functions
const { getDb, createPage, createBlogPost, getPageAdmin, getBlogPostAdmin } = require("../src/lib/db");

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

    if (getPageAdmin(slug)) {
      console.log(`⏭️  Skipping page: ${slug} (already exists)`);
      continue;
    }

    createPage(slug, data.title, content, data.description);
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

    if (getBlogPostAdmin(slug)) {
      console.log(`⏭️  Skipping post: ${slug} (already exists)`);
      continue;
    }

    createBlogPost(slug, data.title, content, data.date, data.description, data.excerpt, data.cover);
    console.log(`✅ Migrated post: ${slug}`);
  }
}

function main() {
  console.log("🚀 Starting content migration...\n");
  getDb();
  migratePages();
  console.log("");
  migrateBlog();
  console.log("\n✨ Migration complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
