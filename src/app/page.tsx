import Link from "next/link";
import { getTopCategories } from "@/lib/dolibarr";

export default async function Home() {
  const topCategories = await getTopCategories();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Benvingut a Melicotó</h1>
      <p>Botiga online de productes culturals a Mallorca.</p>

      {topCategories.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Categories</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop/categoria-producte/${cat.slug}`}
                style={{
                  padding: "1.5rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#333",
                  textAlign: "center",
                  border: "1px solid #ddd",
                  transition: "background-color 0.2s",
                }}
              >
                <h3 style={{ margin: 0 }}>{cat.label}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "3rem", color: "#666", fontSize: "0.9rem" }}>
        <p>Fase 2 — Categories reals, navegació, productes amb variants.</p>
      </div>
    </div>
  );
}
