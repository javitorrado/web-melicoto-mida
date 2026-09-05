import Link from "next/link";
import { getCategoryBySlug, getProductBySlug } from "@/lib/dolibarr";
import { ProductPageClient } from "@/components/ProductPageClient";

interface ProductPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

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

  return (
    <ProductPageClient
      product={product}
      category={category}
      categorySlug={categorySlug}
    />
  );
}
