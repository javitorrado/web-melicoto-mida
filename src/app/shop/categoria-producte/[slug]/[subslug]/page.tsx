import Link from "next/link";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/dolibarr";
import { ProductCard } from "@/components/ProductCard";

interface SubcategoryPageProps {
  params: Promise<{ slug: string; subslug: string }>;
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { slug, subslug } = await params;

  const parentCategory = await getCategoryBySlug(slug);
  if (!parentCategory) {
    return (
      <div className="mc-container mc-page">
        <h1>Categoria no trobada</h1>
        <Link href="/" className="mc-btn mc-btn--ghost">Tornar a l&apos;inici</Link>
      </div>
    );
  }

  const subcategory = await getCategoryBySlug(subslug);
  if (!subcategory || subcategory.parentId !== parentCategory.id) {
    return (
      <div className="mc-container mc-page">
        <h1>Subcategoria no trobada</h1>
        <Link href={`/shop/categoria-producte/${slug}`} className="mc-btn mc-btn--ghost">
          Tornar a {parentCategory.label}
        </Link>
      </div>
    );
  }

  const products = await getProductsByCategory(subcategory.id);

  return (
    <div className="mc-container mc-page">
      <nav className="mc-breadcrumb">
        <Link href="/">Inici</Link> ·{" "}
        <Link href={`/shop/categoria-producte/${slug}`}>{parentCategory.label}</Link> ·{" "}
        {subcategory.label}
      </nav>
      <h1 className="mc-page-title">{subcategory.label}</h1>

      {products.length > 0 ? (
        <div className="mc-product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              href={`/productes/${slug}/${subslug}/${product.slug}`}
            />
          ))}
        </div>
      ) : (
        <p>Cap producte disponible en aquesta subcategoria.</p>
      )}
    </div>
  );
}
