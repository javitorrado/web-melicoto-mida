import { fetchFromDolibarr, getProducts } from "@/lib/dolibarr";
import { NextRequest, NextResponse } from "next/server";

interface CheckoutRequest {
  items: Array<{
    productId: number;
    ref: string;
    label: string;
    variantLabel?: string;
    price: number;
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
  shippingCost: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequest = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "El carret està buit" },
        { status: 400 }
      );
    }

    if (!body.customer.firstName || !body.customer.lastName) {
      return NextResponse.json(
        { error: "Nom i cognoms són obligatoris" },
        { status: 400 }
      );
    }

    // Validate stock and price against real API
    const allProducts = await getProducts();
    const productMap = new Map(allProducts.map((p) => [p.id, p]));

    for (const item of body.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          {
            error: `Producte no trobat: ${item.label}`,
          },
          { status: 400 }
        );
      }

      if (product.stock < item.qty) {
        return NextResponse.json(
          {
            error: `Estoc insuficient per ${item.label}. Disponibles: ${product.stock}, demanats: ${item.qty}`,
          },
          { status: 400 }
        );
      }

      // Price discrepancy check (warn but allow small variance due to IVA rounding)
      const priceDiff = Math.abs(product.priceTTC - item.price);
      if (priceDiff > 0.5) {
        return NextResponse.json(
          {
            error: `Preu incorrecte per ${item.label}. Preu actual: ${product.priceTTC}€`,
          },
          { status: 400 }
        );
      }
    }

    // Create thirdparty
    const thirdpartyData = {
      name: `${body.customer.firstName} ${body.customer.lastName}`,
      email: body.customer.email,
      phone: body.customer.phone,
      client: 1,
      ...(body.deliveryMethod === "delivery" &&
        body.address && {
          address: body.address.address,
          zip: body.address.postalCode,
          town: body.address.city,
          country_code: "ES",
        }),
    };

    const thirdpartyRes: any = await fetchFromDolibarr(
      "/thirdparties",
      {
        method: "POST",
        body: JSON.stringify(thirdpartyData),
      }
    );

    const societeId = thirdpartyRes.id;

    // Create order (draft)
    const orderData = {
      socid: societeId,
      date: Math.floor(Date.now() / 1000),
    };

    const orderRes: any = await fetchFromDolibarr(
      "/orders",
      {
        method: "POST",
        body: JSON.stringify(orderData),
      }
    );

    const orderId = orderRes.id;

    // Add line items
    for (const item of body.items) {
      const lineData = {
        fk_product: item.productId,
        qty: item.qty,
        subprice: item.price,
        product_type: 0,
        tva_tx: 21,
        desc: item.variantLabel
          ? `${item.label} - ${item.variantLabel}`
          : item.label,
      };

      await fetchFromDolibarr(
        `/orders/${orderId}/lines`,
        {
          method: "POST",
          body: JSON.stringify(lineData),
        }
      );
    }

    // Add shipping line if applicable
    if (body.shippingCost > 0) {
      const shippingData = {
        desc: "Enviament",
        qty: 1,
        subprice: body.shippingCost,
        product_type: 1,
        tva_tx: 21,
      };

      await fetchFromDolibarr(
        `/orders/${orderId}/lines`,
        {
          method: "POST",
          body: JSON.stringify(shippingData),
        }
      );
    }

    return NextResponse.json({
      orderId,
      orderRef: orderRes.ref,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error desconegut al crear la comanda",
      },
      { status: 500 }
    );
  }
}
