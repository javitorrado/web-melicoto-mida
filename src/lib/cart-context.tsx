"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  productId: number;
  ref: string;
  label: string;
  variantLabel?: string;
  categorySlug: string;
  productSlug: string;
  price: number;
  qty: number;
  maxStock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantLabel?: string) => void;
  updateQty: (productId: number, qty: number, variantLabel?: string) => void;
  clear: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("melicoto-cart");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("melicoto-cart", JSON.stringify(items));
    }
  }, [items, hydrated]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const key = `${newItem.productId}-${newItem.variantLabel || ""}`;
      const existing = prev.find(
        (item) =>
          item.productId === newItem.productId &&
          item.variantLabel === newItem.variantLabel
      );

      if (existing) {
        return prev.map((item) =>
          item === existing
            ? {
                ...item,
                qty: Math.min(item.qty + newItem.qty, item.maxStock),
              }
            : item
        );
      }

      return [...prev, newItem];
    });
  };

  const removeItem = (productId: number, variantLabel?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.variantLabel === variantLabel
          )
      )
    );
  };

  const updateQty = (productId: number, qty: number, variantLabel?: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.variantLabel === variantLabel
          ? { ...item, qty: Math.max(0, Math.min(qty, item.maxStock)) }
          : item
      )
    );
  };

  const clear = () => {
    setItems([]);
  };

  if (!hydrated) return children;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
