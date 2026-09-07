import Link from "next/link";
import { getTopCategories } from "@/lib/dolibarr";

export default async function Home() {
  const topCategories = await getTopCategories();

  return (
    <>
      <section style={{ background: "var(--color-bg-alt)" }}>
        <div className="mc-container" style={{ padding: "var(--space-2xl) var(--space-lg)", textAlign: "center" }}>
          <h1 className="mc-page-title">Cultura illenca</h1>
          <p className="mc-lead" style={{ maxWidth: 620, margin: "0 auto" }}>
            Productes, artesania i tradició de Mallorca. Fets amb humor i estima.
          </p>
        </div>
      </section>

      <div className="mc-container mc-page">
        <h2 style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}>
          Explora les nostres categories
        </h2>

        {topCategories.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "var(--space-lg)",
            }}
          >
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop/categoria-producte/${cat.slug}`}
                className="mc-panel"
                style={{
                  textAlign: "center",
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  border: "1px solid var(--color-border)",
                  background: "#fff",
                  padding: "var(--space-xl) var(--space-lg)",
                }}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center" }}>
            Encara no hi ha connexió amb el catàleg. Torna-ho a provar en un moment.
          </p>
        )}

        <div
          className="mc-panel"
          style={{
            marginTop: "var(--space-2xl)",
            textAlign: "center",
            borderLeft: "4px solid var(--color-turquoise)",
          }}
        >
          📦 Els millors productes de Mallorca · 🚚 Enviament gratuït a partir de 60€
        </div>
      </div>
    </>
  );
}
