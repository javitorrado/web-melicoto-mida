"use client";

import { useCart, CartItem } from "@/lib/cart-context";
import { useState } from "react";

interface AddToCartButtonProps {
  item: CartItem;
}

export function AddToCartButton({ item }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    addItem(item);
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 2000);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={item.maxStock === 0}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: item.maxStock > 0 ? "#28a745" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: item.maxStock > 0 ? "pointer" : "not-allowed",
          marginTop: "1rem",
        }}
      >
        {item.maxStock > 0 ? "Afegir a la cistella" : "Sense estoc"}
      </button>
      {showConfirm && (
        <p style={{ marginTop: "0.5rem", color: "#28a745", fontWeight: "bold" }}>
          ✓ Afegit al carret
        </p>
      )}
    </div>
  );
}
