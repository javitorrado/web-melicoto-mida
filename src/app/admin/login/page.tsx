"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });

      if (res.ok) {
        router.push("/admin/pages");
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, password, name }),
      });

      if (res.ok) {
        setShowRegister(false);
        setEmail("");
        setPassword("");
        setName("");
        setError("✅ Registered! Now login with your credentials.");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h1 style={{ marginTop: 0, textAlign: "center", fontSize: "1.5rem" }}>
          {showRegister ? "Crear compte" : "Accés admin"}
        </h1>

        {error && (
          <div
            style={{
              backgroundColor: error.includes("✅") ? "#d4edda" : "#f8d7da",
              color: error.includes("✅") ? "#155724" : "#721c24",
              padding: "0.75rem",
              borderRadius: "var(--radius-sm)",
              marginBottom: "1rem",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={showRegister ? handleRegister : handleLogin}>
          {showRegister && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
                disabled={isLoading}
              />
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Contrasenya
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "..." : showRegister ? "Registrar" : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
          {showRegister ? (
            <>
              Ja tens compte?{" "}
              <button
                onClick={() => setShowRegister(false)}
                style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", textDecoration: "underline" }}
              >
                Entra aquí
              </button>
            </>
          ) : (
            <>
              No tens compte?{" "}
              <button
                onClick={() => setShowRegister(true)}
                style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", textDecoration: "underline" }}
              >
                Crea un
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop: "1rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem", textAlign: "center" }}>
          <Link href="/" style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
            ← Tornar a l&apos;inici
          </Link>
        </div>
      </div>
    </div>
  );
}
