"use client";

import { useState, useEffect } from "react";
import { ClientToggle } from "./ClientToggle";
import { MobileMenu } from "./MobileMenu";
import { DolibarrCategory } from "@/lib/dolibarr";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";

function ClientHeaderFallback() {
  return (
    <>
      <div style={{ display: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto" }}>
        <button disabled style={{ padding: "0.5rem 1rem", opacity: 0.5 }}>👤 Client</button>
        <Link href="/carret" className="mc-header__cart">
          <span aria-hidden>🛒</span>
          <span>Cistella</span>
        </Link>
      </div>
    </>
  );
}

export function ClientHeaderWrapper({ categories }: { categories: DolibarrCategory[] }) {
  const [mounted, setMounted] = useState(false);
  const { items } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ClientHeaderFallback />;
  }

  return (
    <>
      {/* Mobile menu button */}
      <MobileMenu
        categories={categories}
        cartCount={count}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto" }}>
        <ClientToggle />

        <Link href="/carret" className="mc-header__cart">
          <span aria-hidden>🛒</span>
          <span>Cistella</span>
          {count > 0 && <span className="mc-cart-count">{count}</span>}
        </Link>
      </div>
    </>
  );
}
