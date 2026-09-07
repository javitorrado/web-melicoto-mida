import Link from "next/link";
import { Suspense } from "react";
import { ClientHeaderWrapper } from "./ClientHeaderWrapper";
import { DolibarrCategory } from "@/lib/dolibarr";

interface NavCategory {
  label: string;
  slug: string;
}

function ClientHeaderFallback() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto" }}>
      <button disabled style={{ padding: "0.5rem 1rem", opacity: 0.5 }}>👤 Client</button>
      <Link href="/carret" className="mc-header__cart">
        <span aria-hidden>🛒</span>
        <span>Cistella</span>
      </Link>
    </div>
  );
}

export function SiteHeader({ categories }: { categories: (NavCategory & { id?: number; parentId?: number })[] | DolibarrCategory[] }) {
  const categoriesWithIds = categories.map(c => ({
    id: 'id' in c ? c.id : 0,
    parentId: 'parentId' in c ? c.parentId : 0,
    label: c.label,
    slug: c.slug,
  })) as DolibarrCategory[];

  return (
    <>
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

          <Suspense fallback={<ClientHeaderFallback />}>
            <ClientHeaderWrapper categories={categoriesWithIds} />
          </Suspense>
        </div>
      </header>
    </>
  );
}
