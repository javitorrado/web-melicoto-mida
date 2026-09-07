"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { DolibarrProduct, DolibarrCategory } from "@/lib/dolibarr";

interface ProductPageClientProps {
  product: DolibarrProduct;
  category: DolibarrCategory;
  categorySlug: string;
  imageOwnerId: number;
  imageFiles: string[];
}

function VariantSelector({
  product,
  categorySlug,
}: {
  product: DolibarrProduct;
  categorySlug: string;
}) {
  const variants = product.variants ?? [];
  const [selected, setSelected] = useState<DolibarrProduct | null>(null);

  useEffect(() => {
    const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0] ?? null;
    setSelected(firstInStock);
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (variants.length === 0) {
    return <p style={{ color: "var(--color-muted)" }}>Cap talla disponible.</p>;
  }

  return (
    <div style={{ margin: "var(--space-lg) 0" }}>
      <h3>Talla</h3>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.5rem 0 var(--space-md)" }}>
        {variants.map((v) => {
          const isSel = selected?.id === v.id;
          return (
            <button
              key={v.id}
              disabled={v.stock === 0}
              onClick={() => setSelected(v)}
              style={{
                padding: "0.55rem 0.95rem",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                background: isSel ? "var(--color-turquoise)" : "#fff",
                color: isSel ? "#fff" : v.stock > 0 ? "var(--color-ink)" : "var(--color-muted)",
                border: `2px solid ${isSel ? "var(--color-turquoise)" : "var(--color-border)"}`,
                textDecoration: v.stock === 0 ? "line-through" : "none",
              }}
            >
              {v.variantLabel || v.ref}
            </button>
          );
        })}
      </div>
      {selected && (
        <AddToCartButton
          item={{
            productId: selected.id,
            ref: selected.ref,
            label: product.label,
            variantLabel: selected.variantLabel,
            categorySlug,
            productSlug: product.slug,
            price: selected.priceTTC,
            qty: 1,
            maxStock: selected.stock,
          }}
        />
      )}
    </div>
  );
}

export function ProductPageClient({
  product,
  category,
  categorySlug,
  imageOwnerId,
  imageFiles,
}: ProductPageClientProps) {
  const isVariable = product.productType === "variable" && !!product.variants;
  const totalStock = isVariable
    ? (product.variants ?? []).reduce((s, v) => s + v.stock, 0)
    : product.stock;

  return (
    <div className="mc-container mc-page">
      <nav className="mc-breadcrumb">
        <Link href="/">Inici</Link> ·{" "}
        <Link href={`/shop/categoria-producte/${categorySlug}`}>{category.label}</Link> ·{" "}
        {product.label}
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "var(--space-2xl)",
          alignItems: "start",
        }}
      >
        <ProductGallery
          productId={imageOwnerId}
          fallbackId={product.parentProductId}
          images={imageFiles}
          alt={product.label}
        />

        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
            {product.label}
          </h1>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-ink-strong)", margin: "0.5rem 0" }}>
            {product.priceTTC.toFixed(2)} €{" "}
            <span style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--color-muted)" }}>IVA inclòs</span>
          </p>

          {product.description && (
            <p style={{ marginTop: "var(--space-md)" }}>{product.description}</p>
          )}

          {isVariable ? (
            <VariantSelector product={product} categorySlug={categorySlug} />
          ) : (
            <div style={{ marginTop: "var(--space-lg)" }}>
              <p style={{ color: totalStock > 0 ? "var(--color-success)" : "var(--color-error)", fontWeight: 600 }}>
                {totalStock > 0 ? "En estoc" : "Sense estoc"}
              </p>
              <AddToCartButton
                item={{
                  productId: product.id,
                  ref: product.ref,
                  label: product.label,
                  categorySlug,
                  productSlug: product.slug,
                  price: product.priceTTC,
                  qty: 1,
                  maxStock: product.stock,
                }}
              />
            </div>
          )}

          <p style={{ marginTop: "var(--space-xl)", fontSize: "0.9rem", color: "var(--color-muted)" }}>
            🚚 Enviament gratuït a partir de 60€ · Recollida gratuïta a la botiga de Palma
          </p>
        </div>
      </div>
    </div>
  );
}
