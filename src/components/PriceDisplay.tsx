"use client";

import { DolibarrProduct } from "@/lib/dolibarr";
import { useUser } from "@/lib/user-context";

interface PriceDisplayProps {
  product: DolibarrProduct;
  showVAT?: boolean;
}

export function PriceDisplay({ product, showVAT = true }: PriceDisplayProps) {
  const { user } = useUser();
  const isB2B = user.clientType === "b2b";

  // Selecciona preu secondo el tipo de client
  const price = isB2B && product.b2bPriceTTC ? product.b2bPriceTTC : product.priceTTC;
  const priceHT = isB2B && product.b2bPrice ? product.b2bPrice : product.price;

  // Afegeix recàrrec d'equivalència si aplica
  let displayPrice = price;
  let surcharge = 0;
  if (isB2B && product.recargEquivalencia) {
    surcharge = (priceHT * product.recargEquivalencia) / 100;
    displayPrice = priceHT + surcharge + (priceHT + surcharge) * (product.vatRate / 100);
  }

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
      <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-ink-strong)" }}>
        {displayPrice.toFixed(2)}€
      </span>
      {showVAT && (
        <span style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>
          IVA inclòs
          {isB2B && product.recargEquivalencia && ` + ${product.recargEquivalencia}% rec.`}
        </span>
      )}
    </div>
  );
}
