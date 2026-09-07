import Link from "next/link";
import { DolibarrProduct } from "@/lib/dolibarr";

interface ProductCardProps {
  product: DolibarrProduct;
  href: string;
}

export function ProductCard({ product, href }: ProductCardProps) {
  const isVariable = product.productType === "variable";
  const totalStock = isVariable
    ? (product.variants ?? []).reduce((s, v) => s + v.stock, 0)
    : product.stock;
  const outOfStock = totalStock <= 0;

  const imgSrc =
    `/api/product-image?productId=${product.id}` +
    (product.parentProductId ? `&fallbackId=${product.parentProductId}` : "");

  return (
    <Link href={href} className="mc-card">
      <div className="mc-card__media">
        {/* imatges servides pel nostre proxy (Dolibarr), amb placeholder si no n'hi ha */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt={product.label} loading="lazy" />
        {outOfStock && <span className="mc-badge">Sense estoc</span>}
      </div>
      <div className="mc-card__body">
        <span className="mc-card__title">{product.label}</span>
        <span className="mc-card__price">
          {product.priceTTC.toFixed(2)} € <small>IVA inclòs</small>
        </span>
        {isVariable ? (
          <span className="mc-card__hint">
            Selecciona opcions{product.variants?.length ? ` (${product.variants.length})` : ""}
          </span>
        ) : outOfStock ? (
          <span className="mc-card__hint mc-card__hint--out">Sense estoc</span>
        ) : (
          <span className="mc-card__hint">Veure producte</span>
        )}
      </div>
    </Link>
  );
}
