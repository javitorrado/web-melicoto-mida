"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

interface NavCategory {
  label: string;
  slug: string;
}

export function SiteHeader({ categories }: { categories: NavCategory[] }) {
  const { items } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);

  return (
    <header className="mc-header">
      <div className="mc-header__bar">
        <Link href="/" className="mc-header__logo" aria-label="Melicotó — inici">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-melicoto.png" alt="Melicotó" width={144} height={46} />
        </Link>

        <nav className="mc-nav">
          {categories.map((c) => (
            <Link key={c.slug} href={`/shop/categoria-producte/${c.slug}`}>
              {c.label}
            </Link>
          ))}
        </nav>

        <Link href="/carret" className="mc-header__cart">
          <span aria-hidden>🛒</span>
          <span>Cistella</span>
          {count > 0 && <span className="mc-cart-count">{count}</span>}
        </Link>
      </div>
    </header>
  );
}
