"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Page {
  id: number;
  slug: string;
  title: string;
  description?: string;
  published: number;
  updatedAt: string;
}

export default function AdminPages() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ slug: "", title: "", description: "", content: "" });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      setPages(data);
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ slug: "", title: "", description: "", content: "" });
        setShowForm(false);
        fetchPages();
      } else {
        alert("Error creating page");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Estàs segur?")) return;
    try {
      await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      fetchPages();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Pàgines</h1>
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
          {showForm ? "Cancelar" : "+ Nova pàgina"}
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
              Descripció
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: "100%",
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
            Crear pàgina
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Carregant...</p>
      ) : pages.length === 0 ? (
        <p>Cap pàgina trobada</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {pages.map((page) => (
            <div
              key={page.id}
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
                <h3 style={{ margin: 0, marginBottom: "0.25rem" }}>{page.title}</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-muted)" }}>
                  /{page.slug} — {page.published ? "Publicada" : "Oculta"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link
                  href={`/admin/pages/${page.id}`}
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
                  onClick={() => handleDelete(page.id)}
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
