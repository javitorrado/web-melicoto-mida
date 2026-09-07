"use client";

import { useCart } from "@/lib/cart-context";
import { calculateShipping } from "@/lib/shipping";
import Link from "next/link";

export function CartPageClient() {
  const { items, removeItem, updateQty, subtotal, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="mc-container mc-page">
        <h1 className="mc-page-title">La cistella és buida</h1>
        <p>Afegeix productes per fer una comanda.</p>
        <Link href="/" className="mc-btn mc-btn--primary" style={{ marginTop: "1rem" }}>
          Veure els productes
        </Link>
      </div>
    );
  }

  const { cost: shippingCost } = calculateShipping(subtotal, "07000");
  const total = subtotal + shippingCost;

  return (
    <div className="mc-container mc-page">
      <h1 className="mc-page-title">La teva cistella</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "grid",
              gridTemplateColumns: "72px 1fr auto auto auto",
              gap: "1rem",
              alignItems: "center",
              padding: "0.75rem",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ width: 72, height: 72, borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--color-bg-alt)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/product-image?productId=${item.productId}`}
                alt={item.label}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <strong style={{ color: "var(--color-ink)" }}>{item.label}</strong>
              {item.variantLabel && (
                <div style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>Talla: {item.variantLabel}</div>
              )}
              <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>Ref: {item.ref}</div>
            </div>
            <div style={{ whiteSpace: "nowrap" }}>{item.price.toFixed(2)} €</div>
            <input
              type="number"
              min={1}
              max={item.maxStock}
              value={item.qty}
              onChange={(e) => updateQty(item.productId, parseInt(e.target.value) || 1, item.variantLabel)}
              style={{ width: 64, textAlign: "center" }}
            />
            <button
              onClick={() => removeItem(item.productId, item.variantLabel)}
              className="mc-btn mc-btn--ghost"
              style={{ padding: "0.5rem 0.9rem", textTransform: "none" }}
            >
              Treure
            </button>
          </div>
        ))}
      </div>

      <div className="mc-panel" style={{ marginTop: "var(--space-xl)", maxWidth: 360, marginLeft: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
          <span>Enviament estimat</span>
          <span>{shippingCost > 0 ? `${shippingCost.toFixed(2)} €` : "Gratuït"}</span>
        </div>
        {subtotal < 60 && (
          <p style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>
            Enviament gratuït a partir de 60€
          </p>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 700,
            fontSize: "1.15rem",
            borderTop: "1px solid var(--color-border)",
            paddingTop: "0.6rem",
            marginTop: "0.4rem",
            color: "var(--color-ink)",
          }}
        >
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>

      <div style={{ marginTop: "var(--space-xl)", display: "flex", gap: "1rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button onClick={() => clear()} className="mc-btn mc-btn--ghost">Buidar</button>
        <Link href="/checkout" className="mc-btn mc-btn--accent">Continuar a la compra</Link>
      </div>

      <div style={{ marginTop: "var(--space-lg)" }}>
        <Link href="/">← Continuar comprant</Link>
      </div>
    </div>
  );
}
