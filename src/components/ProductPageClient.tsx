"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { useState, useEffect } from "react";
import { DolibarrProduct, DolibarrCategory } from "@/lib/dolibarr";

interface ProductPageClientProps {
  product: DolibarrProduct;
  category: DolibarrCategory;
  categorySlug: string;
}

function VariantSelector({
  product,
  categorySlug,
}: {
  product: DolibarrProduct;
  categorySlug: string;
}) {
  const [selectedVariant, setSelectedVariant] = useState<DolibarrProduct | null>(null);

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product.variants]);

  return (
    <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
      <h3>Selecciona talla:</h3>
      {product.variants && product.variants.length > 0 ? (
        <>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                disabled={variant.stock === 0}
                onClick={() => setSelectedVariant(variant)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor:
                    selectedVariant?.id === variant.id
                      ? "#007bff"
                      : variant.stock > 0
                        ? "#e9ecef"
                        : "#ccc",
                  color: selectedVariant?.id === variant.id ? "white" : "#333",
                  border: `2px solid ${selectedVariant?.id === variant.id ? "#007bff" : "#ddd"}`,
                  borderRadius: "4px",
                  cursor: variant.stock > 0 ? "pointer" : "not-allowed",
                  fontWeight:
                    selectedVariant?.id === variant.id ? "bold" : "normal",
                }}
              >
                {variant.variantLabel}
                {variant.stock === 0 && " (s/estoc)"}
              </button>
            ))}
          </div>
          {selectedVariant && (
            <AddToCartButton
              item={{
                productId: selectedVariant.id,
                ref: selectedVariant.ref,
                label: product.label,
                variantLabel: selectedVariant.variantLabel,
                categorySlug: categorySlug,
                productSlug: product.slug,
                price: selectedVariant.priceTTC,
                qty: 1,
                maxStock: selectedVariant.stock,
              }}
            />
          )}
        </>
      ) : (
        <p style={{ color: "#999" }}>Cap talla disponible.</p>
      )}
    </div>
  );
}

export function ProductPageClient({
  product,
  category,
  categorySlug,
}: ProductPageClientProps) {
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
        <VariantSelector product={product} categorySlug={categorySlug} />
      ) : (
        <>
          <p>
            <strong>Estoc:</strong>{" "}
            {totalStock > 0 ? `${totalStock} unitats` : "Sense estoc"}
          </p>
          <AddToCartButton
            item={{
              productId: product.id,
              ref: product.ref,
              label: product.label,
              categorySlug: categorySlug,
              productSlug: product.slug,
              price: product.priceTTC,
              qty: 1,
              maxStock: product.stock,
            }}
          />
        </>
      )}

      <div style={{ marginTop: "2rem" }}>
        <Link href="/">Tornar a l&apos;inici</Link>
      </div>
    </div>
  );
}
