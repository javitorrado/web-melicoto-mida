import Link from "next/link";
import { getProducts } from "@/lib/dolibarr";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const products = await getProducts();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Categoria: {slug}</h1>
      <p>Productes en aquesta categoria (mock):</p>

      {products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/productes/textil/camisetes/${product.ref.toLowerCase()}`}>
                {product.label} &mdash; {product.price}€ ({product.stock} unitats)
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Cap producte disponible.</p>
      )}

      <Link href="/">Tornar a l&apos;inici</Link>
    </div>
  );
}
