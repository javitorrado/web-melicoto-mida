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
      <div className="mc-container mc-page">
        <h1 className="mc-page-title">Comanda no vàlida</h1>
        <Link href="/" className="mc-btn mc-btn--ghost">Tornar a l&apos;inici</Link>
      </div>
    );
  }

  return (
    <div className="mc-container mc-page">
      <div className="mc-alert mc-alert--success" style={{ padding: "1.5rem", textAlign: "center" }}>
        <h1 style={{ color: "var(--color-success)", fontFamily: "var(--font-display)", fontWeight: 400 }}>
          Comanda creada
        </h1>
        <p>Número de comanda: <strong>{orderRef}</strong></p>
      </div>

      <div className="mc-panel" style={{ marginTop: "var(--space-xl)" }}>
        <h3>Pròxim pas: pagament</h3>
        <p>
          La comanda s&apos;ha creat en esborrany. Quan connectem la passarel·la de pagament
          CECA podràs pagar-la online; de moment queda reservada i es confirma manualment.
        </p>
      </div>

      <div style={{ marginTop: "var(--space-xl)", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/" className="mc-btn mc-btn--primary">Tornar a la botiga</Link>
      </div>
    </div>
  );
}
