import Link from "next/link";
import {
  getCategoryBySlug,
  getSubcategories,
  getProductsByCategory,
} from "@/lib/dolibarr";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Categoria no trobada</h1>
        <p>La categoria &quot;{slug}&quot; no existeix.</p>
        <Link href="/">Tornar a l&apos;inici</Link>
      </div>
    );
  }

  const subcategories = await getSubcategories(category.id);
  const products = await getProductsByCategory(category.id);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{category.label}</h1>

      {subcategories.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2>Subcategories</h2>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/shop/categoria-producte/${slug}/${sub.slug}`}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "4px",
                  textDecoration: "none",
                  color: "#333",
                }}
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h2>Productes</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "1rem",
                  borderRadius: "4px",
                }}
              >
                <Link href={`/productes/${slug}/${product.slug}`}>
                  <h3>{product.label}</h3>
                </Link>
                <p>
                  <strong>{product.priceTTC.toFixed(2)}€</strong>
                </p>
                {product.productType === "variable" ? (
                  <p style={{ color: "#666", fontSize: "0.9rem" }}>
                    Selecciona talla ({product.variants?.length || 0} opcions)
                  </p>
                ) : (
                  <p style={{ color: product.stock > 0 ? "#333" : "#999" }}>
                    {product.stock > 0 ? `${product.stock} unitats` : "Sense estoc"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {subcategories.length === 0 && products.length === 0 && (
        <p>Cap contingut disponible en aquesta categoria.</p>
      )}

      <div style={{ marginTop: "2rem" }}>
        <Link href="/">Tornar a l&apos;inici</Link>
      </div>
    </div>
  );
}
