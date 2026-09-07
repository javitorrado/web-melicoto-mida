import Link from "next/link";
import {
  getCategoryBySlug,
  getSubcategories,
  getProductsByCategory,
} from "@/lib/dolibarr";
import { ProductCard } from "@/components/ProductCard";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return (
      <div className="mc-container mc-page">
        <h1>Categoria no trobada</h1>
        <p>La categoria «{slug}» no existeix.</p>
        <Link href="/" className="mc-btn mc-btn--ghost">Tornar a l&apos;inici</Link>
      </div>
    );
  }

  const [subcategories, products] = await Promise.all([
    getSubcategories(category.id),
    getProductsByCategory(category.id),
  ]);

  return (
    <div className="mc-container mc-page">
      <nav className="mc-breadcrumb">
        <Link href="/">Inici</Link> · {category.label}
      </nav>
      <h1 className="mc-page-title">{category.label}</h1>

      {subcategories.length > 0 && (
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", margin: "0 0 var(--space-2xl)" }}>
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/shop/categoria-producte/${slug}/${sub.slug}`}
              className="mc-btn mc-btn--ghost"
              style={{ textTransform: "none", padding: "0.55rem 1.1rem" }}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}

      {products.length > 0 ? (
        <div className="mc-product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              href={`/productes/${slug}/${product.slug}`}
            />
          ))}
        </div>
      ) : (
        subcategories.length === 0 && (
          <p>Cap producte disponible en aquesta categoria.</p>
        )
      )}
    </div>
  );
}
