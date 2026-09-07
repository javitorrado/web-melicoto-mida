#!/usr/bin/env node

/**
 * Script per crear un usuari admin de demostració
 * Executa: node create-demo-admin.js
 */

const Database = require("better-sqlite3");
const crypto = require("crypto");
const path = require("path");

const dbPath = path.join(process.cwd(), "data", "melicoto.db");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function main() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Inicializar schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Crear usuari demo
  const email = "demo@melicoto.com";
  const password = "demo1234";
  const name = "Demo Admin";

  try {
    const hashedPassword = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare("INSERT INTO admin_users (email, password, name, createdAt) VALUES (?, ?, ?, ?)").run(
      email,
      hashedPassword,
      name,
      now
    );

    console.log("✅ Usuari demo creat!");
    console.log("");
    console.log("📧 Email:    demo@melicoto.com");
    console.log("🔐 Password: demo1234");
    console.log("");
    console.log("🌐 Accés: http://localhost:3000/admin/login");
    console.log("");
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      console.log("⚠️  Usuari demo ja existeix!");
      console.log("");
      console.log("📧 Email:    demo@melicoto.com");
      console.log("🔐 Password: demo1234");
    } else {
      console.error("❌ Error:", error.message);
    }
  }

  db.close();
}

main();
