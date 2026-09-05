import { getProducts } from "@/lib/dolibarr";
import { withCache } from "@/lib/cache";

export async function GET() {
  try {
    const products = await withCache("products:list", () => getProducts());
    return Response.json(products);
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
