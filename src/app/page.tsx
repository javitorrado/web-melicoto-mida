import Link from "next/link";
import { getTopCategories } from "@/lib/dolibarr";
import { CategoryGrid } from "@/components/CategoryGrid";

export default async function Home() {
  const topCategories = await getTopCategories();

  return (
    <div style={{ padding: "var(--space-2xl)", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
        <h1 style={{ color: "var(--color-primary)", marginBottom: "var(--space-md)" }}>Benvingut a Melicotó</h1>
        <p style={{ fontSize: "1.25rem", color: "var(--color-text-secondary)" }}>
          Botiga online de productes culturals, artesania i tradició malloquina
        </p>
      </div>

      {topCategories.length > 0 && (
        <div style={{ marginBottom: "var(--space-2xl)" }}>
          <h2 style={{ marginBottom: "var(--space-lg)", textAlign: "center" }}>Explora les nostres categories</h2>
          <CategoryGrid categories={topCategories} />
        </div>
      )}

      <div style={{ marginTop: "var(--space-2xl)", padding: "var(--space-xl)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-lg)", textAlign: "center", borderLeft: "4px solid var(--color-primary)" }}>
        <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
          📦 Descobreix els millors productes de Mallorca • 🚚 Enviament a tota Espanya
        </p>
      </div>
    </div>
  );
}
