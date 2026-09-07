"use client";

import { useUser, ClientType } from "@/lib/user-context";
import { useState } from "react";

export function ClientToggle() {
  const { user, setClientType, login, logout } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const handleB2BLogin = () => {
    if (email && company) {
      login(email, company, "b2b");
      setShowLogin(false);
      setEmail("");
      setCompany("");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowLogin(!showLogin)}
        style={{
          background: user.clientType === "b2b" ? "var(--color-primary)" : "var(--color-bg-secondary)",
          color: user.clientType === "b2b" ? "white" : "var(--color-ink)",
          border: "1px solid var(--color-border)",
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        {user.clientType === "b2b" ? `🏪 B2B (${user.company})` : "👤 Client"}
      </button>

      {showLogin && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            backgroundColor: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            minWidth: "300px",
            boxShadow: "var(--shadow-lg)",
            zIndex: 100,
            marginTop: "0.5rem",
          }}
        >
          {user.clientType === "retail" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Accés B2B</h4>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "0.5rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                }}
              />
              <input
                type="text"
                placeholder="Nom empresa"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                style={{
                  padding: "0.5rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                }}
              />
              <button
                onClick={handleB2BLogin}
                disabled={!email || !company}
                style={{
                  padding: "0.5rem",
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: !email || !company ? "not-allowed" : "pointer",
                  opacity: !email || !company ? 0.5 : 1,
                  fontWeight: 500,
                }}
              >
                Entrar B2B
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-muted)" }}>
                Conectat com: <strong>{user.email}</strong>
              </p>
              <button
                onClick={() => logout()}
                style={{
                  padding: "0.5rem",
                  backgroundColor: "var(--color-error)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Desconectar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
