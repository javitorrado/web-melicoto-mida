"use client";

import { useCart } from "@/lib/cart-context";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export function OrderConfirmedPageClient() {
  const { clear } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const orderRef = searchParams.get("orderRef");

  useEffect(() => {
    clear();
  }, [clear]);

  if (!orderId || !orderRef) {
    return (
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1>Error</h1>
        <p>Dades de comanda no vàlides.</p>
        <Link href="/" style={{ color: "#007bff", textDecoration: "none" }}>
          Tornar a l&apos;inici
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          padding: "2rem",
          backgroundColor: "#d4edda",
          borderRadius: "8px",
          border: "1px solid #c3e6cb",
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ color: "#155724", marginBottom: "0.5rem" }}>✓ Comanda creada amb èxit!</h1>
        <p style={{ color: "#155724", fontSize: "1.1rem" }}>
          Número de comanda: <strong>{orderRef}</strong>
        </p>
      </div>

      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "#e7f3ff",
          borderRadius: "8px",
          border: "1px solid #b3d9ff",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Pròxim pas: Pagament</h3>
        <p>
          La comanda s&apos;ha creat en estat esborrany. Per completar la compra,
          cal confirmar el pagament.
        </p>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          Aquesta funcionalitat s&apos;activarà quan connectem la passarel·la de
          pagament CECA. De moment, la comanda està reservada i es confirmarà
          manualment.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link href="/">
          <button
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Tornar a la botiga
          </button>
        </Link>
        <Link href="/carret">
          <button
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Fer una altra compra
          </button>
        </Link>
      </div>
    </div>
  );
}
