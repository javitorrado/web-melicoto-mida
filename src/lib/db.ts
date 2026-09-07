import { Pool, QueryResult } from "pg";
import crypto from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function initSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        published INTEGER DEFAULT 1,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        excerpt TEXT,
        content TEXT NOT NULL,
        cover VARCHAR(255),
        date DATE NOT NULL,
        published INTEGER DEFAULT 1,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create demo admin if none exists
    const adminResult = await client.query("SELECT COUNT(*) as count FROM admin_users");
    const adminCount = parseInt(adminResult.rows[0].count, 10);

    if (adminCount === 0) {
      const demoPassword = hashPassword("demo1234");
      const now = new Date().toISOString();
      await client.query(
        "INSERT INTO admin_users (email, password, name, \"createdAt\") VALUES ($1, $2, $3, $4)",
        ["demo@melicoto.com", demoPassword, "Demo Admin", now]
      );
      console.log("✅ Demo admin user created");
    }
  } finally {
    client.release();
  }
}

// Initialize schema on startup
initSchema().catch((err) => console.error("Error initializing schema:", err));

// Auth helpers

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  const [salt, hash] = hashed.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");
  return hash === testHash;
}

// Pages

export interface Page {
  id: number;
  slug: string;
  title: string;
  description?: string;
  content: string;
  published: number;
  createdAt: string;
  updatedAt: string;
}

export async function getPage(slug: string): Promise<Page | null> {
  const result = await pool.query("SELECT * FROM pages WHERE slug = $1 AND published = 1", [slug]);
  return result.rows[0] || null;
}

export async function getPageAdmin(slug: string): Promise<Page | null> {
  const result = await pool.query("SELECT * FROM pages WHERE slug = $1", [slug]);
  return result.rows[0] || null;
}

export async function getAllPages(): Promise<Page[]> {
  const result = await pool.query("SELECT * FROM pages WHERE published = 1 ORDER BY title");
  return result.rows;
}

export async function getAllPagesAdmin(): Promise<Page[]> {
  const result = await pool.query("SELECT * FROM pages ORDER BY \"updatedAt\" DESC");
  return result.rows;
}

export async function createPage(slug: string, title: string, content: string, description?: string): Promise<Page> {
  const now = new Date().toISOString();
  const result = await pool.query(
    "INSERT INTO pages (slug, title, description, content, \"createdAt\", \"updatedAt\") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [slug, title, description || null, content, now, now]
  );
  return result.rows[0];
}

export async function updatePage(id: number, title: string, content: string, description?: string, published?: number): Promise<void> {
  const now = new Date().toISOString();
  await pool.query(
    "UPDATE pages SET title = $1, content = $2, description = $3, \"updatedAt\" = $4, published = $5 WHERE id = $6",
    [title, content, description || null, now, published !== undefined ? published : 1, id]
  );
}

export async function deletePage(id: number): Promise<void> {
  await pool.query("DELETE FROM pages WHERE id = $1", [id]);
}

// Blog posts

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  description?: string;
  excerpt?: string;
  content: string;
  cover?: string;
  date: string;
  published: number;
  createdAt: string;
  updatedAt: string;
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const result = await pool.query("SELECT * FROM blog_posts WHERE slug = $1 AND published = 1", [slug]);
  return result.rows[0] || null;
}

export async function getBlogPostAdmin(slug: string): Promise<BlogPost | null> {
  const result = await pool.query("SELECT * FROM blog_posts WHERE slug = $1", [slug]);
  return result.rows[0] || null;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const result = await pool.query("SELECT * FROM blog_posts WHERE published = 1 ORDER BY date DESC");
  return result.rows;
}

export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  const result = await pool.query("SELECT * FROM blog_posts ORDER BY date DESC");
  return result.rows;
}

export async function createBlogPost(
  slug: string,
  title: string,
  content: string,
  date: string,
  description?: string,
  excerpt?: string,
  cover?: string
): Promise<BlogPost> {
  const now = new Date().toISOString();
  const result = await pool.query(
    "INSERT INTO blog_posts (slug, title, description, excerpt, content, cover, date, \"createdAt\", \"updatedAt\") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
    [slug, title, description || null, excerpt || null, content, cover || null, date, now, now]
  );
  return result.rows[0];
}

export async function updateBlogPost(
  id: number,
  title: string,
  content: string,
  date: string,
  description?: string,
  excerpt?: string,
  cover?: string,
  published?: number
): Promise<void> {
  const now = new Date().toISOString();
  await pool.query(
    "UPDATE blog_posts SET title = $1, content = $2, date = $3, description = $4, excerpt = $5, cover = $6, \"updatedAt\" = $7, published = $8 WHERE id = $9",
    [title, content, date, description || null, excerpt || null, cover || null, now, published !== undefined ? published : 1, id]
  );
}

export async function deleteBlogPost(id: number): Promise<void> {
  await pool.query("DELETE FROM blog_posts WHERE id = $1", [id]);
}

// Admin users

export interface AdminUser {
  id: number;
  email: string;
  password: string;
  name?: string;
  createdAt: string;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const result = await pool.query("SELECT * FROM admin_users WHERE email = $1", [email]);
  return result.rows[0] || null;
}

export async function createAdminUser(email: string, password: string, name?: string): Promise<void> {
  const hashedPassword = hashPassword(password);
  const now = new Date().toISOString();
  await pool.query(
    "INSERT INTO admin_users (email, password, name, \"createdAt\") VALUES ($1, $2, $3, $4)",
    [email, hashedPassword, name || null, now]
  );
}
