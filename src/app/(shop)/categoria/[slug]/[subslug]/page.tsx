import Link from "next/link";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/dolibarr";

interface SubcategoryPageProps {
  params: Promise<{ slug: string; subslug: string }>;
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { slug, subslug } = await params;

  // Fetch parent category
  const parentCategory = await getCategoryBySlug(slug);
  if (!parentCategory) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Categoria no trobada</h1>
        <Link href="/">Tornar a l&apos;inici</Link>
      </div>
    );
  }

  // Fetch subcategory (child of parent)
  const subcategory = await getCategoryBySlug(subslug);
  if (!subcategory || subcategory.parentId !== parentCategory.id) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Subcategoria no trobada</h1>
        <Link href={`/shop/categoria-producte/${slug}`}>
          Tornar a {parentCategory.label}
        </Link>
      </div>
    );
  }

  // Fetch products in subcategory
  const products = await getProductsByCategory(subcategory.id);

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Link href={`/shop/categoria-producte/${slug}`}>
          &larr; {parentCategory.label}
        </Link>
      </div>

      <h1>{subcategory.label}</h1>

      {products.length > 0 ? (
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
      ) : (
        <p>Cap producte disponible en aquesta subcategoria.</p>
      )}

      <div style={{ marginTop: "2rem" }}>
        <Link href="/">Tornar a l&apos;inici</Link>
      </div>
    </div>
  );
}
