export interface DolibarrProduct {
  id: number;
  ref: string;
  label: string;
  price: number;
  stock: number;
  description?: string;
}

const MOCK_PRODUCTS: DolibarrProduct[] = [
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
    return MOCK_PRODUCTS;
  }

  // Mode live: fetch from real Dolibarr API
  try {
    return await fetchFromDolibarr<DolibarrProduct[]>("/products");
  } catch (error) {
    // Fallback to mock if API fails
    console.error("Dolibarr API fetch failed, using mock data:", error);
    return MOCK_PRODUCTS;
  }
}

export async function getProductByRef(ref: string): Promise<DolibarrProduct | null> {
  const products = await getProducts();
  return products.find((p) => p.ref.toLowerCase() === ref.toLowerCase()) || null;
}

export function slugToRef(slug: string): string {
  return slug.toUpperCase().replace(/-/g, "-");
}
