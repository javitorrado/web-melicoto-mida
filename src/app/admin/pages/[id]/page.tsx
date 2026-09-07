"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { marked } from "marked";

interface Page {
  id: number;
  slug: string;
  title: string;
  description?: string;
  content: string;
  published: number;
}

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = parseInt(params.id as string, 10);

  const [page, setPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", content: "", published: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch all pages to find by ID
    fetch("/api/admin/pages")
      .then((res) => res.json())
      .then((pages) => {
        const found = pages.find((p: Page) => p.id === pageId);
        if (found) {
          setPage(found);
          setFormData({
            title: found.title,
            description: found.description || "",
            content: found.content,
            published: found.published,
          });
        } else {
          setError("Pàgina no trobada");
        }
      })
      .catch(() => setError("Error carregant pàgina"))
      .finally(() => setIsLoading(false));
  }, [pageId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("✅ Pàgina guardada!");
      } else {
        setError("Error al guardar");
      }
    } catch (err) {
      setError("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Estàs segur que vols eliminar aquesta pàgina?")) return;

    try {
      await fetch(`/api/admin/pages/${pageId}`, { method: "DELETE" });
      alert("✅ Pàgina eliminada!");
      router.push("/admin/pages");
    } catch (err) {
      setError("Error al eliminar");
    }
  };

  if (isLoading) return <div style={{ padding: "2rem" }}>Carregant...</div>;
  if (!page || error) return <div style={{ padding: "2rem" }}>❌ {error || "Pàgina no trobada"}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Editar pàgina: {page.title}</h1>
        <Link href="/admin/pages" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
          ← Tornar
        </Link>
      </div>

      <form onSubmit={handleSave} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* FORMULARI */}
        <div>
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
            {error && (
              <div
                style={{
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Slug</label>
              <input type="text" value={page.slug} disabled style={{ width: "100%", padding: "0.75rem", backgroundColor: "#f5f5f5", borderRadius: "var(--radius-sm)" }} />
              <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: "0.25rem 0 0 0" }}>No es pot modificar</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Títol</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Descripció (SEO)</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Contingut (Markdown)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                style={{
                  width: "100%",
                  minHeight: 400,
                  padding: "0.75rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.published === 1}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked ? 1 : 0 })}
                />
                <span>Publicada</span>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? "Guardant..." : "Guardar"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "var(--color-error)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div>
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              position: "sticky",
              top: "2rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1rem" }}>Preview</h2>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                style={{
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
              >
                {showPreview ? "HTML" : "Markdown"}
              </button>
            </div>

            {showPreview ? (
              <div style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
                <h3>{formData.title}</h3>
                <div
                  style={{
                    color: "var(--color-muted)",
                    fontSize: "0.75rem",
                    marginBottom: "1rem",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(formData.content) as string,
                  }}
                />
              </div>
            ) : (
              <pre
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                  maxHeight: 400,
                  overflow: "auto",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {formData.content}
              </pre>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
