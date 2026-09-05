import Link from "next/link";
import { getCategoryBySlug, getProductBySlug } from "@/lib/dolibarr";

interface ProductPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Resolve category from penultimate slug segment, product from last
  if (slug.length < 2) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Producte no trobat</h1>
        <Link href="/">Tornar a l&apos;inici</Link>
      </div>
    );
  }

  const categorySlug = slug[slug.length - 2]!;
  const productSlug = slug[slug.length - 1]!;

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Categoria no trobada</h1>
        <Link href="/">Tornar a l&apos;inici</Link>
      </div>
    );
  }

  const product = await getProductBySlug(category.id, productSlug);
  if (!product) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Producte no trobat</h1>
        <p>El producte &quot;{productSlug}&quot; no existeix.</p>
        <Link href={`/shop/categoria-producte/${categorySlug}`}>
          Tornar a {category.label}
        </Link>
      </div>
    );
  }

  const totalStock = product.variants
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Link href={`/shop/categoria-producte/${categorySlug}`}>
          &larr; {category.label}
        </Link>
      </div>

      <h1>{product.label}</h1>

      <p>
        <strong>Referència:</strong> {product.ref}
      </p>
      <p>
        <strong>Preu:</strong> {product.priceTTC.toFixed(2)}€
      </p>

      {product.description && (
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <p>{product.description}</p>
        </div>
      )}

      {product.productType === "variable" && product.variants ? (
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <h3>Selecciona talla:</h3>
          {product.variants.length > 0 ? (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  disabled={variant.stock === 0}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: variant.stock > 0 ? "#007bff" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: variant.stock > 0 ? "pointer" : "not-allowed",
                  }}
                >
                  {variant.variantLabel}
                  {variant.stock === 0 && " (sense estoc)"}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ color: "#999" }}>Cap talla disponible.</p>
          )}
        </div>
      ) : (
        <p>
          <strong>Estoc:</strong>{" "}
          {totalStock > 0 ? `${totalStock} unitats` : "Sense estoc"}
        </p>
      )}

      <button
        disabled={totalStock === 0}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: totalStock > 0 ? "#28a745" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: totalStock > 0 ? "pointer" : "not-allowed",
          marginTop: "1rem",
        }}
      >
        {totalStock > 0 ? "Afegir a la cistella" : "Sense estoc"}
      </button>

      <div style={{ marginTop: "2rem" }}>
        <Link href="/">Tornar a l&apos;inici</Link>
      </div>
    </div>
  );
}
