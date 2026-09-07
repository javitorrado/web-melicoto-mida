"use client";

import { useState } from "react";

interface ProductGalleryProps {
  productId: number;
  fallbackId?: number | null;
  /** noms de fitxer de les fotos; si és buit es mostra només la portada */
  images: string[];
  alt: string;
}

export function ProductGallery({ productId, fallbackId, images, alt }: ProductGalleryProps) {
  const base =
    `/api/product-image?productId=${productId}` +
    (fallbackId ? `&fallbackId=${fallbackId}` : "");

  const srcs = images.length > 0 ? images.map((f) => `${base}&file=${encodeURIComponent(f)}`) : [base];
  const [active, setActive] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div
        style={{
          aspectRatio: "1 / 1",
          background: "var(--color-bg-alt)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={srcs[active]}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {srcs.length > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {srcs.map((s, i) => (
            <button
              key={s}
              onClick={() => setActive(i)}
              aria-label={`Foto ${i + 1}`}
              style={{
                width: 66,
                height: 66,
                padding: 0,
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                background: "var(--color-bg-alt)",
                border: `2px solid ${i === active ? "var(--color-turquoise)" : "var(--color-border)"}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
