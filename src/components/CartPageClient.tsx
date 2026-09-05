"use client";

import { useCart } from "@/lib/cart-context";
import { calculateShipping } from "@/lib/shipping";
import Link from "next/link";

export function CartPageClient() {
  const { items, removeItem, updateQty, subtotal, clear } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1>Carret buit</h1>
        <p>Afegeix productes per fer una comanda.</p>
        <Link href="/" style={{ color: "#007bff", textDecoration: "none" }}>
          Tornar a les categories
        </Link>
      </div>
    );
  }

  const { cost: shippingCost } = calculateShipping(subtotal, "07000");
  const total = subtotal + shippingCost;

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Carret</h1>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd" }}>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Producte</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Preu</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Quantitat</th>
            <th style={{ textAlign: "right", padding: "0.75rem" }}>Subtotal</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Accions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.75rem" }}>
                <div>
                  <strong>{item.label}</strong>
                  {item.variantLabel && <div style={{ fontSize: "0.9rem", color: "#666" }}>Talla: {item.variantLabel}</div>}
                  <div style={{ fontSize: "0.85rem", color: "#999" }}>Ref: {item.ref}</div>
                </div>
              </td>
              <td style={{ textAlign: "center", padding: "0.75rem" }}>{item.price.toFixed(2)}€</td>
              <td style={{ textAlign: "center", padding: "0.75rem" }}>
                <input
                  type="number"
                  min="1"
                  max={item.maxStock}
                  value={item.qty}
                  onChange={(e) =>
                    updateQty(item.productId, parseInt(e.target.value), item.variantLabel)
                  }
                  style={{ width: "60px", padding: "0.25rem", textAlign: "center" }}
                />
              </td>
              <td style={{ textAlign: "right", padding: "0.75rem" }}>
                {(item.price * item.qty).toFixed(2)}€
              </td>
              <td style={{ textAlign: "center", padding: "0.75rem" }}>
                <button
                  onClick={() => removeItem(item.productId, item.variantLabel)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          textAlign: "right",
        }}
      >
        <p>
          <strong>Subtotal:</strong> {subtotal.toFixed(2)}€
        </p>
        <p>
          <strong>Enviament:</strong> {shippingCost > 0 ? `${shippingCost.toFixed(2)}€` : "Gratuït"}
        </p>
        {subtotal < 60 && (
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            💡 Enviament gratuït a partir de 60€
          </p>
        )}
        <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
          <strong>Total:</strong> {total.toFixed(2)}€
        </p>
      </div>

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => clear()}
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Buidar carret
        </button>
        <Link href="/checkout">
          <button
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Continuar a checkout
          </button>
        </Link>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Link href="/" style={{ color: "#007bff", textDecoration: "none" }}>
          Continuar comprant
        </Link>
      </div>
    </div>
  );
}
