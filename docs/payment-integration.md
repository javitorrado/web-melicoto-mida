# Payment Integration — CECA (Fase 3)

**Data creació:** 2026-09-06  
**Estat:** Pendent d'implementació  
**Prioritat:** Després de fase 2 (carret + checkout)

---

## Context

L'usuari (Javier, Melicotó) **ja té CECA contractada com a passarel·la de pagament**. Aquesta fase s'ocupa de connectar-la a la web per validar ordres en esborrany i confirmar-les un cop rebut el pagament.

---

## Flux global (pendent)

```
1. Usuari completa checkout → comanda creada en DRAFT
2. `/api/checkout` retorna orderId + orderRef
3. Usuari redirigit a `/comanda-confirmada?orderId=...`
4. Pàgina mostra "Pagament pendent" + botó "Pagar"
5. Botó clickejat → redirecció a TPV CECA
   - Paràmetre: montant (subtotal + enviament)
   - URL de retorn: `https://empresa.melicoto.com/checkout-callback`
6. Usuari confirma/cancela al TPV
7. CECA redirigeix de tornada a `/checkout-callback`
   - Paràmetres: `orderId`, `status` (success/fail), signatura
8. Backend valida signatura CECA
   - Si valid + success: `POST /orders/{id}/validate` a Dolibarr → comanda live
   - Si fail: mantenir draft, mostrar "Pagament rebutjat"
9. Frontend redirigeix a `/comanda-confirmada` (nova view amb resum pagat)
```

---

## Credencials CECA (pendent)

```
Sandbox (testing):
  - Merchant ID: [TBD]
  - Secret key: [TBD]
  - TPV URL: https://sandbox.ceca.es/... [TBD]

Producció:
  - Merchant ID: [TBD]
  - Secret key: [TBD]
  - TPV URL: https://www.ceca.es/... [TBD]
```

> Nota: Credencials no disponibles en aquest moment. Es necesita contactar amb CECA.

---

## Implementació Next.js

### 1. Pàgina `/pagament/[orderId]` (client component)

Reemplaça `/comanda-confirmada` per a ordres amb pagament pendent:

```tsx
"use client";

export function PaymentPageClient() {
  // Lectura del orderId via URL params
  const orderId = useSearchParams().get("orderId");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Fetch order details from `/api/orders/{orderId}`
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(data => setOrder(data.order));
  }, [orderId]);

  const handlePayment = () => {
    // POST /api/payment/initiate
    // → Retorna redirect URL CECA TPV
    fetch("/api/payment/initiate", { 
      method: "POST",
      body: JSON.stringify({ orderId, amount: order.total_ttc })
    })
    .then(r => r.json())
    .then(data => window.location.href = data.redirectUrl);
  };

  return (
    <>
      <p>{order.total_ttc.toFixed(2)}€</p>
      <button onClick={handlePayment}>Pagar amb CECA</button>
    </>
  );
}
```

### 2. Endpoint `/api/payment/initiate` (POST)

Rep `{ orderId, amount }`, construeix URL del TPV CECA amb signatura:

```ts
// src/app/api/payment/initiate/route.ts

export async function POST(req: NextRequest) {
  const { orderId, amount } = await req.json();

  // 1. Carregar credencials CECA
  const merchantId = process.env.CECA_MERCHANT_ID;
  const secretKey = process.env.CECA_SECRET_KEY;

  // 2. Construir payload (paràmetres requerits per CECA)
  const payload = {
    MerchantID: merchantId,
    Amount: Math.round(amount * 100), // en cèntims
    Currency: "978", // EUR
    Order: orderId.toString(),
    Description: `Comanda ${orderId}`,
    Terminal: "001",
    MerchantURL: "https://empresa.melicoto.com/api/payment/callback",
  };

  // 3. Signar amb SHA256(payload + secretKey)
  const signature = generateSignature(payload, secretKey);

  // 4. Construir URL del TPV
  const tpvUrl = new URL("https://sandbox.ceca.es/transaction");
  Object.entries(payload).forEach(([k, v]) => {
    tpvUrl.searchParams.append(k, v.toString());
  });
  tpvUrl.searchParams.append("Signature", signature);

  return NextResponse.json({ redirectUrl: tpvUrl.toString() });
}
```

### 3. Endpoint `/api/payment/callback` (POST)

CECA retorna a aquesta URL un cop el pagament s'ha processat:

```ts
// src/app/api/payment/callback/route.ts

export async function POST(req: NextRequest) {
  const body = await req.json();
  // CECA envia: Order, Response, Amount, Signature, ...

  // 1. Validar signatura
  const signature = validateSignature(body, process.env.CECA_SECRET_KEY);
  if (!signature) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 403 }
    );
  }

  // 2. Revisar status
  const orderId = body.Order;
  const isSuccess = body.Response === "000"; // "000" = aprovat CECA

  if (isSuccess) {
    // 3. Validar comanda a Dolibarr
    const order = await fetchFromDolibarr(`/orders/${orderId}`);
    if (order.status !== 0) {
      // Ja estava validada? Duplicat?
      return NextResponse.json(
        { error: "Order already processed" },
        { status: 400 }
      );
    }

    // 4. Validar comanda (moure de draft a live)
    await fetchFromDolibarr(
      `/orders/${orderId}/validate`,
      { method: "POST" }
    );

    // 5. Redirigir a success page
    return NextResponse.redirect(
      new URL(
        `/pagament-confirmada?orderId=${orderId}&status=success`,
        req.url
      )
    );
  } else {
    // Pagament rebutjat
    return NextResponse.redirect(
      new URL(
        `/pagament-confirmada?orderId=${orderId}&status=failed`,
        req.url
      )
    );
  }
}
```

### 4. Pàgina `/pagament-confirmada`

Mostra resultat del pagament (success o failed).

---

## Variables d'entorn

```bash
# .env.local (sandbox)
CECA_MERCHANT_ID=...
CECA_SECRET_KEY=...
CECA_TPV_URL=https://sandbox.ceca.es/transaction
CECA_WEBHOOK_SECRET=...

# O per producció:
# CECA_MERCHANT_ID=...
# CECA_TPV_URL=https://www.ceca.es/...
```

---

## Punts crítics de seguretat

1. **Validació de signatura CECA:** Sempre verificar que la resposta de callback ve realment de CECA
2. **Idempotència:** Detectar intents de validar dues vegades la mateixa comanda (race condition)
3. **No confiar en paràmetres del client:** Llegir montant final de Dolibarr, no del redirect URL
4. **HTTPS obligat:** Les comunicacions CECA→callback SEMPRE per HTTPS
5. **Timeout de pagament:** Si l'usuari no paga en X minuts, la comanda es cancella automàticament (trigger a Dolibarr)

---

## Documentació CECA de referència

- Developer docs: [TBD — pendent de CECA]
- Sandbox TPV: [TBD]
- Especificació de signatura: [TBD]

---

## Següents passes

1. ✅ Fase 2 completada (carret + checkout draft)
2. ⏳ Fase 3a: Contactar CECA per credencials sandbox
3. ⏳ Fase 3b: Implementar endpoints `/api/payment/*`
4. ⏳ Fase 3c: Testing amb TPV sandbox
5. ⏳ Fase 3d: Produccionització (real TPV CECA, credencials real)

---

**Última actualització:** 2026-09-06
