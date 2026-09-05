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
  price: number;
  priceTTC: number;
  stock: number;
  description?: string;
  status: number;
  catalogVisibility: string;
  productType: "simple" | "variable" | "variation" | string;
  parentProductId: number | null;
  variantLabel?: string;
  variants?: DolibarrProduct[];
}

const MOCK_PRODUCTS: Omit<DolibarrProduct, "slug" | "priceTTC" | "status" | "catalogVisibility" | "productType" | "parentProductId">[] = [
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

async function fetchFromDolibarr<T>(endpoint: string): Promise<T> {
  const baseUrl = process.env.DOLIBARR_API_URL;
  const apiKey = process.env.DOLIBARR_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Dolibarr API credentials not configured");
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      DOLAPIKEY: apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Dolibarr API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getProducts(): Promise<DolibarrProduct[]> {
  const baseUrl = process.env.DOLIBARR_API_URL;
  const apiKey = process.env.DOLIBARR_API_KEY;

  // Mode mock: if credentials not set, return mock data
  if (!baseUrl || !apiKey) {
    return MOCK_PRODUCTS.map((p) => ({
      ...p,
      slug: slugify(p.label),
      priceTTC: p.price,
      status: 1,
      catalogVisibility: "visible",
      productType: "simple",
      parentProductId: null,
    }));
  }

  // Mode live: fetch from real Dolibarr API
  try {
    const raw = await fetchFromDolibarr<any[]>("/products?limit=500");
    return raw.map(mapRawProductToDolibarr);
  } catch (error) {
    // Fallback to mock if API fails
    console.error("Dolibarr API fetch failed, using mock data:", error);
    return MOCK_PRODUCTS.map((p) => ({
      ...p,
      slug: slugify(p.label),
      priceTTC: p.price,
      status: 1,
      catalogVisibility: "visible",
      productType: "simple",
      parentProductId: null,
    }));
  }
}

export async function getProductByRef(ref: string): Promise<DolibarrProduct | null> {
  const products = await getProducts();
  return products.find((p) => p.ref.toLowerCase() === ref.toLowerCase()) || null;
}

export function slugToRef(slug: string): string {
  return slug.toUpperCase().replace(/-/g, "-");
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
  return {
    id: raw.id,
    ref: raw.ref,
    label: raw.label,
    slug: slugify(raw.label),
    price: parseFloat(raw.price || "0"),
    priceTTC: parseFloat(raw.price_ttc || "0"),
    stock: parseInt(raw.stock_reel || raw.stock || "0"),
    description: raw.description || raw.array_options?.options_woodolisync_product_short_description || undefined,
    status: parseInt(raw.status || "0"),
    catalogVisibility: raw.array_options?.options_woodolisync_catalog_visibility || "visible",
    productType: raw.array_options?.options_woodolisync_product_type || "simple",
    parentProductId: raw.array_options?.options_woodolisync_parent_product || null,
    variantLabel: extractVariantLabel(raw.label, raw.array_options?.options_woodolisync_talla || null),
  };
}

function mapRawCategoryToDolibarr(raw: any): DolibarrCategory {
  return {
    id: raw.id,
    label: raw.label,
    slug: raw.array_options?.options_woodolisync_slug || slugify(raw.label),
    parentId: raw.fk_parent || 0,
  };
}

export async function getCategories(): Promise<DolibarrCategory[]> {
  const baseUrl = process.env.DOLIBARR_API_URL;
  const apiKey = process.env.DOLIBARR_API_KEY;

  if (!baseUrl || !apiKey) {
    return [];
  }

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
  const baseUrl = process.env.DOLIBARR_API_URL;
  const apiKey = process.env.DOLIBARR_API_KEY;

  if (!baseUrl || !apiKey) {
    return [];
  }

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

  for (const product of products) {
    if (product.slug === productSlug) {
      return product;
    }
    if (product.variants) {
      const variant = product.variants.find((v) => v.slug === productSlug);
      if (variant) return variant;
    }
  }

  return null;
}
