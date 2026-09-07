import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_VAT_RATE, fetchFromDolibarr, getProductById } from "@/lib/dolibarr";
import { calculateShipping } from "@/lib/shipping";

export const dynamic = "force-dynamic";

interface CheckoutRequest {
  items: Array<{
    productId: number;
    ref: string;
    label: string;
    variantLabel?: string;
    price: number; // preu TTC mostrat al client (només per validació)
    qty: number;
  }>;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  deliveryMethod: "pickup" | "delivery";
  address?: {
    address: string;
    postalCode: string;
    city: string;
  };
}

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: NextRequest) {
  let body: CheckoutRequest;
  try {
    body = await req.json();
  } catch {
    return bad("Petició no vàlida");
  }

  if (!body.items?.length) return bad("El carret està buit");
  if (!body.customer?.firstName || !body.customer?.lastName) {
    return bad("Nom i cognoms són obligatoris");
  }
  if (!body.customer.email) return bad("L'email és obligatori");
  if (
    body.deliveryMethod === "delivery" &&
    (!body.address?.address || !body.address?.postalCode || !body.address?.city)
  ) {
    return bad("Falten dades de l'adreça d'enviament");
  }

  try {
    // 1. Resol cada línia contra Dolibarr (font de veritat de preu i estoc).
    const lines: Array<{
      productId: number;
      qty: number;
      priceHT: number;
      vatRate: number;
      desc: string;
      lineTotalTTC: number;
    }> = [];

    for (const item of body.items) {
      const qty = Math.floor(Number(item.qty));
      if (!Number.isFinite(qty) || qty <= 0) {
        return bad(`Quantitat no vàlida per ${item.label}`);
      }

      const product = await getProductById(item.productId);
      if (!product) return bad(`Producte no trobat: ${item.label}`);
      if (product.status !== 1) return bad(`Producte no disponible: ${item.label}`);

      if (product.stock < qty) {
        return bad(
          `Estoc insuficient per ${item.label}. Disponibles: ${product.stock}, demanats: ${qty}`
        );
      }

      // Sanity check: el preu TTC mostrat ha de coincidir amb el de Dolibarr.
      if (Math.abs(product.priceTTC - Number(item.price)) > 0.02) {
        return bad(
          `El preu de "${item.label}" ha canviat (ara ${product.priceTTC.toFixed(2)}€). Refresca el carret.`
        );
      }

      lines.push({
        productId: product.id,
        qty,
        priceHT: product.price, // HT: el que Dolibarr espera a subprice
        vatRate: product.vatRate,
        desc: item.variantLabel ? `${product.label} - ${item.variantLabel}` : product.label,
        lineTotalTTC: product.priceTTC * qty,
      });
    }

    // 2. Enviament calculat al servidor (mai confiar en el client).
    const subtotalTTC = lines.reduce((s, l) => s + l.lineTotalTTC, 0);
    let shippingCost = 0;
    if (body.deliveryMethod === "delivery") {
      const shipping = calculateShipping(subtotalTTC, body.address!.postalCode);
      if (shipping.blocked) {
        return bad(shipping.reason || "No es pot enviar a aquesta zona.");
      }
      shippingCost = shipping.cost;
    }

    // 3. Crea el tercer (client).
    const thirdpartyData = {
      name: `${body.customer.firstName} ${body.customer.lastName}`,
      email: body.customer.email,
      phone: body.customer.phone,
      client: 1,
      ...(body.deliveryMethod === "delivery" && body.address
        ? {
            address: body.address.address,
            zip: body.address.postalCode,
            town: body.address.city,
            country_code: "ES",
          }
        : {}),
    };

    // Dolibarr sol retornar l'id com a enter pelat, però algunes versions
    // retornen l'objecte sencer.
    const thirdpartyRes = await fetchFromDolibarr<{ id: number } | number>(
      "/thirdparties",
      { method: "POST", body: JSON.stringify(thirdpartyData) }
    );
    const societeId =
      typeof thirdpartyRes === "number" ? thirdpartyRes : thirdpartyRes.id;

    // 4. Crea la comanda en esborrany.
    const orderRes = await fetchFromDolibarr<{ id: number; ref: string } | number>(
      "/orders",
      {
        method: "POST",
        body: JSON.stringify({ socid: societeId, date: Math.floor(Date.now() / 1000) }),
      }
    );
    const orderId = typeof orderRes === "number" ? orderRes : orderRes.id;

    // 5. Línies de producte (subprice = HT, tva_tx = IVA real del producte).
    for (const line of lines) {
      await fetchFromDolibarr(`/orders/${orderId}/lines`, {
        method: "POST",
        body: JSON.stringify({
          fk_product: line.productId,
          qty: line.qty,
          subprice: line.priceHT,
          product_type: 0,
          tva_tx: line.vatRate,
          desc: line.desc,
        }),
      });
    }

    // 6. Línia d'enviament com a servei.
    if (shippingCost > 0) {
      const shippingHT = Number((shippingCost / (1 + DEFAULT_VAT_RATE / 100)).toFixed(2));
      await fetchFromDolibarr(`/orders/${orderId}/lines`, {
        method: "POST",
        body: JSON.stringify({
          desc: "Enviament",
          qty: 1,
          subprice: shippingHT,
          product_type: 1,
          tva_tx: DEFAULT_VAT_RATE,
        }),
      });
    }

    // Recarrega la comanda per retornar la ref real.
    const finalOrder = await fetchFromDolibarr<{ ref: string }>(`/orders/${orderId}`);

    return NextResponse.json({ orderId, orderRef: finalOrder.ref });
  } catch (error) {
    console.error("Checkout error:", error);
    return bad("No s'ha pogut crear la comanda. Torna-ho a provar més tard.", 500);
  }
}
