import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, findProductBySlug, getProductImages } from "@/lib/dolibarr";
import { ProductPageClient } from "@/components/ProductPageClient";

interface ProductPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  if (slug.length < 2) notFound();

  const categorySlug = slug[slug.length - 2]!;
  const productSlug = slug[slug.length - 1]!;

  const category = await getCategoryBySlug(categorySlug);
  const product = await findProductBySlug(productSlug, category?.id);

  if (!product) {
    return (
      <div className="mc-container mc-page">
        <h1>Producte no trobat</h1>
        <p>El producte «{productSlug}» no existeix.</p>
        <Link href={`/shop/categoria-producte/${categorySlug}`} className="mc-btn mc-btn--ghost">
          Tornar a {category?.label ?? "la botiga"}
        </Link>
      </div>
    );
  }

  // Les fotos viuen al producte pare quan és variable.
  const imageOwnerId = product.parentProductId ?? product.id;
  const imageFiles = (await getProductImages(imageOwnerId)).map((i) => i.name);

  return (
    <ProductPageClient
      product={product}
      category={category ?? { id: 0, label: "Botiga", slug: categorySlug, parentId: 0 }}
      categorySlug={categorySlug}
      imageOwnerId={imageOwnerId}
      imageFiles={imageFiles}
    />
  );
}
