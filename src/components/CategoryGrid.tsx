"use client";

import Link from "next/link";
import { DolibarrCategory } from "@/lib/dolibarr";

interface CategoryGridProps {
  categories: DolibarrCategory[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "var(--space-lg)",
      }}
    >
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/shop/categoria-producte/${cat.slug}`}
          style={{
            padding: "var(--space-lg)",
            backgroundColor: "var(--color-bg-secondary)",
            borderRadius: "var(--radius-lg)",
            textDecoration: "none",
            color: "var(--color-text-primary)",
            textAlign: "center",
            border: "1px solid var(--color-border)",
            transition: "all 0.3s ease",
            boxShadow: "var(--shadow-sm)",
            cursor: "pointer",
            display: "block",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "var(--color-primary-light)";
            el.style.borderColor = "var(--color-primary)";
            el.style.boxShadow = "var(--shadow-md)";
            el.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "var(--color-bg-secondary)";
            el.style.borderColor = "var(--color-border)";
            el.style.boxShadow = "var(--shadow-sm)";
            el.style.transform = "translateY(0)";
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{cat.label}</h3>
        </Link>
      ))}
    </div>
  );
}
