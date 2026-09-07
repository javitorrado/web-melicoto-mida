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
        className="mc-btn mc-btn--accent"
      >
        {item.maxStock > 0 ? "Afegeix a la cistella" : "Sense estoc"}
      </button>
      {showConfirm && (
        <p style={{ marginTop: "0.6rem", color: "var(--color-success)", fontWeight: 600 }}>
          ✓ Afegit a la cistella
        </p>
      )}
    </div>
  );
}
