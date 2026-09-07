"use client";

import { useState } from "react";
import Link from "next/link";
import { DolibarrCategory } from "@/lib/dolibarr";

interface MobileMenuProps {
  categories: DolibarrCategory[];
  cartCount: number;
}

export function MobileMenu({ categories, cartCount }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        className="mc-mobile-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menú"
        style={{
          display: "none",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.5rem",
          padding: "0.5rem",
        }}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <nav
        className="mc-mobile-nav"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: "280px",
          backgroundColor: "var(--color-bg-primary)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          zIndex: 1000,
          overflowY: "auto",
          boxShadow: isOpen ? "var(--shadow-lg)" : "none",
        }}
      >
        <div style={{ padding: "1.5rem" }}>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              marginBottom: "1rem",
              color: "var(--color-ink)",
            }}
          >
            ✕
          </button>

          {/* Categories */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted)" }}>
              Categories
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop/categoria-producte/${cat.slug}`}
                  onClick={() => setIsOpen(false)}
                  style={{
                    textDecoration: "none",
                    color: "var(--color-ink)",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-ink)")}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Link
                href="/shop/etiqueta-producte"
                onClick={() => setIsOpen(false)}
                style={{ textDecoration: "none", color: "var(--color-ink)", fontWeight: 500 }}
              >
                Etiquetes
              </Link>
              <Link
                href="/melicoto"
                onClick={() => setIsOpen(false)}
                style={{ textDecoration: "none", color: "var(--color-ink)", fontWeight: 500 }}
              >
                Qui som
              </Link>
              <Link
                href="/contacte"
                onClick={() => setIsOpen(false)}
                style={{ textDecoration: "none", color: "var(--color-ink)", fontWeight: 500 }}
              >
                Contacte
              </Link>
            </div>
          </div>

          {/* Cart link */}
          <Link
            href="/carret"
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "2rem",
              padding: "1rem",
              backgroundColor: "var(--color-primary)",
              color: "white",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            🛒 Carret {cartCount > 0 && `(${cartCount})`}
          </Link>
        </div>
      </nav>

      {/* Show hamburger on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .mc-mobile-menu-button {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
}
