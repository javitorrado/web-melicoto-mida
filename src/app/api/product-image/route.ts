import { NextRequest, NextResponse } from "next/server";
import { downloadProductFile, getProductImages } from "@/lib/dolibarr";

// Proxy d'imatges de producte: el navegador mai parla directament amb Dolibarr.
//   /api/product-image?productId=6971            -> imatge de portada
//   /api/product-image?productId=6971&file=x.jpg -> aquesta foto concreta
//   &fallbackId=123  -> si el producte no té fotos, prova aquest (producte pare)

const DAY = 86400;

function placeholder(req: NextRequest) {
  return NextResponse.redirect(new URL("/placeholder-product.svg", req.url), 307);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = Number(searchParams.get("productId"));
  const fallbackId = Number(searchParams.get("fallbackId"));
  const file = searchParams.get("file");

  if (!Number.isFinite(productId) || productId <= 0) {
    return placeholder(req);
  }

  let images = await getProductImages(productId);
  if (images.length === 0 && Number.isFinite(fallbackId) && fallbackId > 0) {
    images = await getProductImages(fallbackId);
  }
  if (images.length === 0) return placeholder(req);

  // Només es pot demanar un fitxer que estigui realment a la llista del producte.
  const target = file
    ? images.find((img) => img.name === file)
    : images[0];
  if (!target) return placeholder(req);

  const downloaded = await downloadProductFile(target.path);
  if (!downloaded) return placeholder(req);

  return new NextResponse(downloaded.buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": downloaded.contentType,
      "Cache-Control": `public, max-age=${DAY}, s-maxage=${DAY * 30}, stale-while-revalidate=${DAY * 7}`,
      "X-Robots-Tag": "noindex",
    },
  });
}
