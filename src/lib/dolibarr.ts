export interface DolibarrCategory {
  id: number;
  label: string;
  slug: string;
  parentId: number;
}

export interface DolibarrProduct {
  id: number;
  ref: string;
  label: string;
  slug: string;
  /** Preu unitari HT (sense IVA) — el que Dolibarr espera a `subprice` */
  price: number;
  /** Preu unitari TTC (amb IVA) — el que es mostra a la web */
  priceTTC: number;
  /** Tipus d'IVA del producte (%), tal com el té Dolibarr */
  vatRate: number;
  stock: number;
  description?: string;
  status: number;
  catalogVisibility: string;
  productType: "simple" | "variable" | "variation" | string;
  parentProductId: number | null;
  variantLabel?: string;
  variants?: DolibarrProduct[];

  // B2B fields (from array_options)
  b2bPrice?: number;
  b2bPriceTTC?: number;
  b2bMinimumOrder?: number;
  b2bHidden?: boolean;
  b2bFreeShippingFrom?: number;
  recargEquivalencia?: number; // % recàrrec d'equivalència
}

/** IVA per defecte (enviament i productes sense tipus definit a Dolibarr) */
export const DEFAULT_VAT_RATE = 21;

const MOCK_PRODUCTS: Omit<
  DolibarrProduct,
  "slug" | "priceTTC" | "vatRate" | "status" | "catalogVisibility" | "productType" | "parentProductId"
>[] = [
  {
    id: 1,
    ref: "CAMISETA-RISSAGA",
    label: "Camiseta Rissaga",
    price: 22.9,
    stock: 15,
    description: "Camiseta amb el disseny de la Rissaga",
  },
  {
    id: 2,
    ref: "CAMISETA-PAUMA",
    label: "Camiseta Pauma",
    price: 24.9,
    stock: 8,
    description: "Camiseta amb el disseny de la Pauma",
  },
  {
    id: 3,
    ref: "CAMISETA-BOUS-COSTITX",
    label: "Camiseta Bous de Costitx",
    price: 22.9,
    stock: 12,
    description: "Camiseta amb el disseny dels Bous de Costitx",
  },
];

/** TTL de cache (segons) per a les crides GET a Dolibarr. */
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS ?? 90) || 90;

export function isLiveMode(): boolean {
  return Boolean(process.env.DOLIBARR_API_URL && process.env.DOLIBARR_API_KEY);
}

export async function fetchFromDolibarr<T>(
  endpoint: string,
  options?: { method?: string; body?: string }
): Promise<T> {
  const baseUrl = process.env.DOLIBARR_API_URL;
  const apiKey = process.env.DOLIBARR_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Dolibarr API credentials not configured");
  }

  const method = options?.method ?? "GET";
  const isRead = method === "GET";

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      DOLAPIKEY: apiKey,
      Accept: "application/json",
      ...(options?.body && { "Content-Type": "application/json" }),
    },
    body: options?.body,
    // Les lectures es cachegen (i es deduplicen) al runtime de Next;
    // les escriptures mai.
    ...(isRead
      ? { next: { revalidate: CACHE_TTL_SECONDS } }
      : { cache: "no-store" as const }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Dolibarr API error: ${res.status} ${res.statusText}${detail ? ` — ${detail.slice(0, 500)}` : ""}`
    );
  }

  return res.json();
}

function mockProducts(): DolibarrProduct[] {
  return MOCK_PRODUCTS.map((p) => ({
    ...p,
    slug: slugify(p.label),
    priceTTC: Number((p.price * (1 + DEFAULT_VAT_RATE / 100)).toFixed(2)),
    vatRate: DEFAULT_VAT_RATE,
    status: 1,
    catalogVisibility: "visible",
    productType: "simple",
    parentProductId: null,
  }));
}

export async function getProducts(): Promise<DolibarrProduct[]> {
  if (!isLiveMode()) return mockProducts();

  try {
    // Paginem per no quedar-nos amb un tall silenciós a 500 registres.
    // Cap de seguretat per si l'API ignora `page` (evita bucle infinit).
    const pageSize = 500;
    const maxPages = 40;
    const all: any[] = [];
    const seen = new Set<number>();
    for (let page = 0; page < maxPages; page++) {
      const raw = await fetchFromDolibarr<any[]>(
        `/products?limit=${pageSize}&page=${page}`
      );
      const fresh = raw.filter((r) => !seen.has(Number(r.id)));
      fresh.forEach((r) => seen.add(Number(r.id)));
      all.push(...fresh);
      if (raw.length < pageSize || fresh.length === 0) break;
    }
    return all.map(mapRawProductToDolibarr);
  } catch (error) {
    console.error("Dolibarr API fetch failed, using mock data:", error);
    return mockProducts();
  }
}

export async function getProductById(id: number): Promise<DolibarrProduct | null> {
  if (!isLiveMode()) {
    return mockProducts().find((p) => p.id === id) ?? null;
  }
  try {
    const raw = await fetchFromDolibarr<any>(`/products/${id}`);
    return mapRawProductToDolibarr(raw);
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return null;
  }
}

export async function getProductByRef(ref: string): Promise<DolibarrProduct | null> {
  const products = await getProducts();
  return products.find((p) => p.ref.toLowerCase() === ref.toLowerCase()) || null;
}

export interface ProductImage {
  /** `original_file` per a /documents/download, ex: "MEL_06533/DSC01879-scaled.jpg" */
  path: string;
  name: string;
}

/**
 * Llista les fotos d'un producte (taula ECM de Dolibarr, modulepart=product).
 * Ordenades per `position` i amb la marcada com a `cover` primera.
 */
export async function getProductImages(productId: number): Promise<ProductImage[]> {
  if (!isLiveMode()) return [];
  try {
    const files = await fetchFromDolibarr<any[]>(
      `/documents?modulepart=product&id=${productId}`
    );
    return files
      .filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f.filename || f.name || ""))
      .sort((a, b) => {
        const cover = (Number(b.cover) || 0) - (Number(a.cover) || 0);
        if (cover) return cover;
        return (Number(a.position) || 0) - (Number(b.position) || 0);
      })
      .map((f) => {
        const dir: string = f.level1name || (f.filepath || "").replace(/^produit\//, "");
        const name: string = f.filename || f.name;
        return { path: `${dir}/${name}`, name };
      });
  } catch (error) {
    console.error(`Failed to list images for product ${productId}:`, error);
    return [];
  }
}

/** Descarrega un fitxer de producte i el retorna com a bytes + mime. */
export async function downloadProductFile(
  originalFile: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!isLiveMode()) return null;
  try {
    const res = await fetchFromDolibarr<{ content: string; "content-type": string }>(
      `/documents/download?modulepart=product&original_file=${encodeURIComponent(originalFile)}`
    );
    if (!res?.content) return null;
    return {
      buffer: Buffer.from(res.content, "base64"),
      contentType: res["content-type"] || "image/jpeg",
    };
  } catch (error) {
    console.error(`Failed to download ${originalFile}:`, error);
    return null;
  }
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractVariantLabel(label: string, talla: string | null): string {
  if (talla) return talla;
  const parts = label.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function mapRawProductToDolibarr(raw: any): DolibarrProduct {
  const price = parseFloat(raw.price || "0");
  const vatRate = raw.tva_tx != null && raw.tva_tx !== "" ? parseFloat(raw.tva_tx) : DEFAULT_VAT_RATE;
  const priceTTC = raw.price_ttc
    ? parseFloat(raw.price_ttc)
    : Number((price * (1 + vatRate / 100)).toFixed(2));

  // `options_woodolisync_parent_product` pot arribar com a string ("0", "") o number.
  const rawParent = Number(raw.array_options?.options_woodolisync_parent_product);
  const parentProductId = Number.isFinite(rawParent) && rawParent > 0 ? rawParent : null;

  return {
    id: Number(raw.id),
    ref: raw.ref,
    label: raw.label,
    slug: slugify(raw.label),
    price,
    priceTTC,
    vatRate,
    stock: parseInt(raw.stock_reel || raw.stock || "0"),
    description: raw.description || raw.array_options?.options_woodolisync_product_short_description || undefined,
    status: parseInt(raw.status || "0"),
    catalogVisibility: raw.array_options?.options_woodolisync_catalog_visibility || "visible",
    productType: raw.array_options?.options_woodolisync_product_type || "simple",
    parentProductId,
    variantLabel: extractVariantLabel(raw.label, raw.array_options?.options_woodolisync_talla || null),
  };
}

function mapRawCategoryToDolibarr(raw: any): DolibarrCategory {
  return {
    id: Number(raw.id),
    label: raw.label,
    slug: raw.array_options?.options_woodolisync_slug || slugify(raw.label),
    parentId: Number(raw.fk_parent) || 0,
  };
}

export async function getCategories(): Promise<DolibarrCategory[]> {
  if (!isLiveMode()) return [];

  try {
    const categories = await fetchFromDolibarr<any[]>("/categories?limit=200");
    return categories.map(mapRawCategoryToDolibarr);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<DolibarrCategory | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) || null;
}

export async function getTopCategories(): Promise<DolibarrCategory[]> {
  const categories = await getCategories();
  const topSlugs = new Set([
    "textil",
    "complements",
    "ca-nostra",
    "cuina",
    "artesania",
    "papereria",
    "infantil",
  ]);
  return categories.filter(
    (c) => c.parentId === 1 && topSlugs.has(c.slug)
  );
}

export async function getSubcategories(parentId: number): Promise<DolibarrCategory[]> {
  const categories = await getCategories();
  return categories.filter((c) => c.parentId === parentId);
}

export async function getProductsByCategory(
  categoryId: number
): Promise<DolibarrProduct[]> {
  if (!isLiveMode()) return [];

  try {
    const raw = await fetchFromDolibarr<any[]>(
      `/categories/${categoryId}/objects?type=product&limit=500`
    );

    const mapped = raw.map(mapRawProductToDolibarr).filter((p) => p.status === 1);

    const grouped: DolibarrProduct[] = [];
    const procesedIds = new Set<number>();

    for (const product of mapped) {
      if (procesedIds.has(product.id)) continue;
      procesedIds.add(product.id);

      if (product.productType === "variable") {
        const variants = mapped.filter((p) => p.parentProductId === product.id);
        grouped.push({
          ...product,
          variants,
        });
      } else if (product.productType !== "variation") {
        grouped.push(product);
      }
    }

    return grouped;
  } catch (error) {
    console.error("Failed to fetch products by category:", error);
    return [];
  }
}

export async function getProductBySlug(
  categoryId: number,
  productSlug: string
): Promise<DolibarrProduct | null> {
  const products = await getProductsByCategory(categoryId);
  return pickProductBySlug(products, productSlug);
}

function pickProductBySlug(
  products: DolibarrProduct[],
  productSlug: string
): DolibarrProduct | null {
  for (const product of products) {
    if (product.slug === productSlug) return product;
    const variant = product.variants?.find((v) => v.slug === productSlug);
    if (variant) return variant;
  }
  return null;
}

/**
 * Resol un producte pel seu slug quan no sabem (o no encerta) la categoria:
 * els enllaços de subcategoria passen la categoria pare, que no sempre conté
 * el producte. Recorre categories principals + subcategories.
 */
export async function findProductBySlug(
  productSlug: string,
  preferredCategoryId?: number
): Promise<DolibarrProduct | null> {
  if (preferredCategoryId) {
    const hit = await getProductBySlug(preferredCategoryId, productSlug);
    if (hit) return hit;
  }

  const categories = await getCategories();
  const topSlugs = new Set([
    "textil",
    "complements",
    "ca-nostra",
    "cuina",
    "artesania",
    "papereria",
    "infantil",
  ]);
  const roots = categories.filter((c) => topSlugs.has(c.slug));
  const searchable = [
    ...roots,
    ...categories.filter((c) => roots.some((r) => r.id === c.parentId)),
  ];

  for (const cat of searchable) {
    if (cat.id === preferredCategoryId) continue;
    const hit = pickProductBySlug(await getProductsByCategory(cat.id), productSlug);
    if (hit) return hit;
  }
  return null;
}
