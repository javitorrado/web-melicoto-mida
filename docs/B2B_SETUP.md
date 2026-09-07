# B2B Setup — Dolibarr Configuration Pending

**Status:** ⏳ Code ready, pending Dolibarr DB setup

---

## ✅ What's already implemented (code-side)

- `src/lib/user-context.tsx` — User context (retail | b2b)
- `src/components/ClientToggle.tsx` — Login/logout B2B
- `src/components/PriceDisplay.tsx` — Dynamic pricing
- `DolibarrProduct` extended with B2B fields (in `src/lib/dolibarr.ts`)
- Mapper ready to extract `array_options` → B2B fields

---

## ⏳ TODO: Create Dolibarr Extrafields

When you're ready to enable B2B, create these **custom fields** in Dolibarr:

### **Location:** Eines → Configuració → Extrafields (o "Custom fields")

### **Fields to create:**

#### 1. **b2b_price_ttc** (for Products)
- **Type:** Price / Decimal
- **Label:** "Preu B2B (TTC)"
- **Description:** "Preu exclusiu per a botigues (inclòs IVA)"
- **Storage:** `options_b2b_price_ttc`

#### 2. **b2b_minimum_order** (for Products)
- **Type:** Integer / Number
- **Label:** "Comanda mínima B2B"
- **Description:** "Quantitat mínima per a comandes B2B"
- **Storage:** `options_b2b_minimum_order`

#### 3. **b2b_free_shipping_from** (for Products)
- **Type:** Price / Decimal
- **Label:** "Enviament gratuït a partir de €"
- **Description:** "Impost a partir del qual l'enviament és gratuït (diferent als clients finals)"
- **Storage:** `options_b2b_free_shipping_from`

#### 4. **b2b_hidden** (for Products)
- **Type:** Checkbox / Boolean
- **Label:** "Ocultar per a B2B"
- **Description:** "Si està marcat, aquest producte no apareix per a botigues"
- **Storage:** `options_b2b_hidden`

#### 5. **recargo_equivalencia** (for Products)
- **Type:** Percentage / Decimal
- **Label:** "Recàrrec d'equivalència (%)"
- **Description:** "Afegit al preu B2B (IVA invertit, per recàrrec de equivalència)"
- **Storage:** `options_recargo_equivalencia`

---

## 🔗 How mapping works

Once extrafields are created, the mapper in `src/lib/dolibarr.ts` (`mapRawProductToDolibarr()`) will automatically extract:

```ts
// From Dolibarr API response:
raw.array_options.options_b2b_price_ttc           → product.b2bPriceTTC
raw.array_options.options_b2b_minimum_order       → product.b2bMinimumOrder
raw.array_options.options_b2b_free_shipping_from  → product.b2bFreeShippingFrom
raw.array_options.options_b2b_hidden              → product.b2bHidden
raw.array_options.options_recargo_equivalencia    → product.recargEquivalencia
```

---

## 🏷️ Tags / Etiquetes (Future)

**Status:** ❓ To investigate

Current findings:
- WooCommerce tags are stored in custom Dolibarr tables (not in standard API)
- Possible tables: `llx_melicoto_product_tags`, `llx_melicoto_product_tag_product`
- **Option 1:** Create custom API endpoint in Dolibarr
- **Option 2:** Query SQL directly (if trusted context)
- **Option 3:** Use WooCommerce UI to manage, sync via WoodolisSync

**Pending decision:** How to fetch tags in the web interface?

---

## 📝 Code references

- **User context:** `src/lib/user-context.tsx`
- **Price display:** `src/components/PriceDisplay.tsx` (uses `product.b2bPriceTTC`, `product.recargEquivalencia`)
- **Product mapper:** `src/lib/dolibarr.ts` → `mapRawProductToDolibarr()`
- **Client toggle:** `src/components/ClientToggle.tsx` (login with email + company)

---

## 🚀 Activation checklist

When ready:
1. [ ] Create the 5 extrafields in Dolibarr (as above)
2. [ ] Edit a few products to populate B2B prices
3. [ ] Test in dev: `npm run dev` → ClientToggle → Login B2B → Check price changes
4. [ ] Deploy to Vercel (env vars already set)
5. [ ] Test in production

---

**Last updated:** 2026-09-07  
**Status:** Waiting for Dolibarr extrafields creation
