"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { marked } from "marked";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  description?: string;
  excerpt?: string;
  content: string;
  date: string;
  cover?: string;
  published: number;
}

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const postId = parseInt(params.id as string, 10);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    excerpt: "",
    content: "",
    date: "",
    cover: "",
    published: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((posts) => {
        const found = posts.find((p: BlogPost) => p.id === postId);
        if (found) {
          setPost(found);
          setFormData({
            title: found.title,
            description: found.description || "",
            excerpt: found.excerpt || "",
            content: found.content,
            date: found.date,
            cover: found.cover || "",
            published: found.published,
          });
        } else {
          setError("Article no trobat");
        }
      })
      .catch(() => setError("Error carregant article"))
      .finally(() => setIsLoading(false));
  }, [postId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("✅ Article guardat!");
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
    if (!confirm("Estàs segur que vols eliminar aquest article?")) return;

    try {
      await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" });
      alert("✅ Article eliminat!");
      router.push("/admin/blog");
    } catch (err) {
      setError("Error al eliminar");
    }
  };

  if (isLoading) return <div style={{ padding: "2rem" }}>Carregant...</div>;
  if (!post || error) return <div style={{ padding: "2rem" }}>❌ {error || "Article no trobat"}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Editar article: {post.title}</h1>
        <Link href="/admin/blog" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
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
              <input type="text" value={post.slug} disabled style={{ width: "100%", padding: "0.75rem", backgroundColor: "#f5f5f5", borderRadius: "var(--radius-sm)" }} />
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
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Data de publicació</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Extracte</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                style={{
                  width: "100%",
                  minHeight: 80,
                  padding: "0.75rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  boxSizing: "border-box",
                }}
              />
              <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: "0.25rem 0 0 0" }}>Resumen per a la llista de blog</p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Contingut (Markdown)</label>
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
                <span>Publicat</span>
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
                {showPreview ? "Markdown" : "HTML"}
              </button>
            </div>

            {showPreview ? (
              <div style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
                <h3>{formData.title}</h3>
                <p style={{ color: "var(--color-muted)", fontSize: "0.75rem", marginBottom: "1rem" }}>
                  {new Date(formData.date).toLocaleDateString("ca-ES", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                {formData.excerpt && (
                  <blockquote style={{ borderLeft: "3px solid var(--color-primary)", paddingLeft: "1rem", marginLeft: 0, color: "var(--color-muted)", marginBottom: "1rem" }}>
                    {formData.excerpt}
                  </blockquote>
                )}
                <div
                  style={{ lineHeight: 1.7 }}
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
