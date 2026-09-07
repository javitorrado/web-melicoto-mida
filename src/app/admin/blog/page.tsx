"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  published: number;
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    excerpt: "",
    content: "",
    description: "",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          slug: "",
          title: "",
          date: new Date().toISOString().split("T")[0],
          excerpt: "",
          content: "",
          description: "",
        });
        setShowForm(false);
        fetchPosts();
      } else {
        alert("Error creating post");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Estàs segur?")) return;
    try {
      await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      fetchPosts();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Blog</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancelar" : "+ Nou article"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "var(--radius-lg)",
            marginBottom: "2rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Títol
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Data de publicació
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Extracte
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              style={{
                width: "100%",
                minHeight: 60,
                padding: "0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Contingut (Markdown)
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              style={{
                width: "100%",
                minHeight: 300,
                padding: "0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                fontFamily: "monospace",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Crear article
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Carregant...</p>
      ) : posts.length === 0 ? (
        <p>Cap article trobat</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, marginBottom: "0.25rem" }}>{post.title}</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-muted)" }}>
                  {post.date} — /{post.slug}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link
                  href={`/admin/blog/${post.id}`}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.875rem",
                  }}
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "var(--color-error)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "2rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
        <Link
          href="/admin"
          style={{
            color: "var(--color-primary)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Tornar al panell
        </Link>
      </div>
    </div>
  );
}
