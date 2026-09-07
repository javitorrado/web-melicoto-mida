import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, findProductBySlug } from "@/lib/dolibarr";
import { ProductPageClient } from "@/components/ProductPageClient";

interface ProductPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  if (slug.length < 2) notFound();

  const categorySlug = slug[slug.length - 2]!;
  const productSlug = slug[slug.length - 1]!;

  // La categoria de la URL pot ser la pare (enllaços de subcategoria) o la
  // subcategoria real; findProductBySlug fa el fallback si cal.
  const category = await getCategoryBySlug(categorySlug);
  const product = await findProductBySlug(productSlug, category?.id);

  if (!product) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Producte no trobat</h1>
        <p>El producte &quot;{productSlug}&quot; no existeix.</p>
        <Link href={`/shop/categoria-producte/${categorySlug}`}>
          Tornar a {category?.label ?? "la botiga"}
        </Link>
      </div>
    );
  }

  return (
    <ProductPageClient
      product={product}
      category={category ?? { id: 0, label: "Botiga", slug: categorySlug, parentId: 0 }}
      categorySlug={categorySlug}
    />
  );
}
