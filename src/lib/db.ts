import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const dbPath = path.join(process.cwd(), "data", "melicoto.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    initSchema();
  }
  return db;
}

function initSchema() {
  const d = getDb();

  d.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      published INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      excerpt TEXT,
      content TEXT NOT NULL,
      cover TEXT,
      date TEXT NOT NULL,
      published INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

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

export function getPage(slug: string): Page | null {
  const db = getDb();
  return db.prepare("SELECT * FROM pages WHERE slug = ? AND published = 1").get(slug) as Page | null;
}

export function getPageAdmin(slug: string): Page | null {
  const db = getDb();
  return db.prepare("SELECT * FROM pages WHERE slug = ?").get(slug) as Page | null;
}

export function getAllPages(): Page[] {
  const db = getDb();
  return db.prepare("SELECT * FROM pages WHERE published = 1 ORDER BY title").all() as Page[];
}

export function getAllPagesAdmin(): Page[] {
  const db = getDb();
  return db.prepare("SELECT * FROM pages ORDER BY updatedAt DESC").all() as Page[];
}

export function createPage(slug: string, title: string, content: string, description?: string): Page {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(
    "INSERT INTO pages (slug, title, description, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const info = stmt.run(slug, title, description || null, content, now, now);
  return {
    id: info.lastInsertRowid as number,
    slug,
    title,
    description: description || undefined,
    content,
    published: 1,
    createdAt: now,
    updatedAt: now,
  };
}

export function updatePage(id: number, title: string, content: string, description?: string, published?: number): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE pages SET title = ?, content = ?, description = ?, updatedAt = ?, published = ? WHERE id = ?").run(
    title,
    content,
    description || null,
    now,
    published !== undefined ? published : 1,
    id
  );
}

export function deletePage(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM pages WHERE id = ?").run(id);
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

export function getBlogPost(slug: string): BlogPost | null {
  const db = getDb();
  return db.prepare("SELECT * FROM blog_posts WHERE slug = ? AND published = 1").get(slug) as BlogPost | null;
}

export function getBlogPostAdmin(slug: string): BlogPost | null {
  const db = getDb();
  return db.prepare("SELECT * FROM blog_posts WHERE slug = ?").get(slug) as BlogPost | null;
}

export function getAllBlogPosts(): BlogPost[] {
  const db = getDb();
  return db.prepare("SELECT * FROM blog_posts WHERE published = 1 ORDER BY date DESC").all() as BlogPost[];
}

export function getAllBlogPostsAdmin(): BlogPost[] {
  const db = getDb();
  return db.prepare("SELECT * FROM blog_posts ORDER BY date DESC").all() as BlogPost[];
}

export function createBlogPost(
  slug: string,
  title: string,
  content: string,
  date: string,
  description?: string,
  excerpt?: string,
  cover?: string
): BlogPost {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(
    "INSERT INTO blog_posts (slug, title, description, excerpt, content, cover, date, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const info = stmt.run(slug, title, description || null, excerpt || null, content, cover || null, date, now, now);
  return {
    id: info.lastInsertRowid as number,
    slug,
    title,
    description: description || undefined,
    excerpt: excerpt || undefined,
    content,
    cover: cover || undefined,
    date,
    published: 1,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateBlogPost(
  id: number,
  title: string,
  content: string,
  date: string,
  description?: string,
  excerpt?: string,
  cover?: string,
  published?: number
): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE blog_posts SET title = ?, content = ?, date = ?, description = ?, excerpt = ?, cover = ?, updatedAt = ?, published = ? WHERE id = ?"
  ).run(title, content, date, description || null, excerpt || null, cover || null, now, published !== undefined ? published : 1, id);
}

export function deleteBlogPost(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM blog_posts WHERE id = ?").run(id);
}

// Admin users

export interface AdminUser {
  id: number;
  email: string;
  password: string;
  name?: string;
  createdAt: string;
}

export function getAdminByEmail(email: string): AdminUser | null {
  const db = getDb();
  return db.prepare("SELECT * FROM admin_users WHERE email = ?").get(email) as AdminUser | null;
}

export function createAdminUser(email: string, password: string, name?: string): void {
  const db = getDb();
  const hashedPassword = hashPassword(password);
  const now = new Date().toISOString();
  db.prepare("INSERT INTO admin_users (email, password, name, createdAt) VALUES (?, ?, ?, ?)").run(
    email,
    hashedPassword,
    name || null,
    now
  );
}
