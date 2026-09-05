import Link from "next/link";
import { getProductByRef, slugToRef } from "@/lib/dolibarr";

interface ProductPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const productRef = slugToRef(slug[slug.length - 1]!);
  const product = await getProductByRef(productRef);

  if (!product) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Producte no trobat</h1>
        <p>La referència &quot;{productRef}&quot; no existeix.</p>
        <Link href="/">Tornar a l&apos;inici</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{product.label}</h1>
      <p>
        <strong>Referència:</strong> {product.ref}
      </p>
      <p>
        <strong>Preu:</strong> {product.price}€
      </p>
      <p>
        <strong>Estoc:</strong> {product.stock} unitats
      </p>
      {product.description && (
        <p>
          <strong>Descripció:</strong> {product.description}
        </p>
      )}

      <button disabled={product.stock === 0}>
        {product.stock > 0 ? "Afegir a la cistella" : "Sense estoc"}
      </button>

      <Link href="/">Tornar a l&apos;inici</Link>
    </div>
  );
}
