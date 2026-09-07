"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Panell de control</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "var(--color-error)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
          }}
        >
          Desconectar
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        <Link
          href="/admin/pages"
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            textDecoration: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <h2 style={{ marginTop: 0, color: "var(--color-primary)" }}>📄 Pàgines</h2>
          <p style={{ margin: 0, color: "var(--color-muted)" }}>Gestiona pàgines estàtiques (Qui som, Contacte, etc.)</p>
        </Link>

        <Link
          href="/admin/blog"
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            textDecoration: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <h2 style={{ marginTop: 0, color: "var(--color-primary)" }}>📝 Blog</h2>
          <p style={{ margin: 0, color: "var(--color-muted)" }}>Gestiona articles de blog (novetats, actualitzacions)</p>
        </Link>
      </div>

      <div style={{ marginTop: "2rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
        <Link
          href="/"
          style={{
            color: "var(--color-primary)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Tornar a la botiga
        </Link>
      </div>
    </div>
  );
}
