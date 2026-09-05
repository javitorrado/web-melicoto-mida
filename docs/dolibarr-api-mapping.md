# Dolibarr API Mapping — WEB-MELICOTO-MIDA

**Data de creació:** 2026-09-05  
**Estat:** En construcció (fase 1) — mode mock, pendent de credencials API reals

---

## Context

Aquesta web consumeix l'API REST de Dolibarr 18.0.4 (`empresa.melicoto.com`) com a **única font de veritat** per a productes, preus, estoc, terceres i comandes. La capa intermèdia (Next.js API routes) és l'únic client autenticat contra Dolibarr; els navegadors mai criden l'API directament.

---

## Estat de credencials

### ⚠️ **PENDENT: Crear usuari API escopat**

Actualment **NO existeix** l'usuari `api_melicoto_web` ni una clau API associada a Dolibarr. Fins que no es crei, la web funciona en **mode mock** (dades d'exemple en memòria, veure `src/lib/dolibarr.ts`).

### Passos per crear l'usuari escopat (a fer al backend Dolibarr)

1. **Accedir a Configuració → Usuaris → Crear usuari**
   - **Identificador:** `api_melicoto_web`
   - **Email:** p. ex. `api@melicoto.com` (no crític, no rep emails)
   - **Contrasenya:** generar aleatòria (no usada, només API Key)

2. **Assignar permisos READ**
   - Productes (`Products`)
   - Estoc (`Stock`)
   - Terceres (`ThirdParties`)
   - Comandes (`Orders`)

3. **Assignar permisos WRITE**
   - Terceres (crear clients nous al checkout)
   - Comandes (crear comandes del carret)

4. **Desactivar permisos SENSIBLES**
   - Configuració, Mòduls, Usuaris, Comptabilitat, etc.

5. **Generar API Key**
   - Fitxa de l'usuari → botó "Regenerar clau API"
   - Copiar la clau (ho fan una vegada, no es pot recuperar)

6. **Configurar a WEB-MELICOTO-MIDA**
   - Crear `.env.local` (copiar de `.env.local.example`)
   - Omplir `DOLIBARR_API_URL=https://empresa.melicoto.com/api/index.php`
   - Omplir `DOLIBARR_API_KEY=<clau-copiada>`
   - Reiniciar dev server (`npm run dev`)

---

## Endpoints previstos (Dolibarr API)

### Lectura de productes

**GET** `/api/index.php/products`  
Retorna llistat de productes amb preus i estocs.

**GET** `/api/index.php/products/{id}`  
Fitxa completa d'un producte.

### Lectura d'estocs

**GET** `/api/index.php/stocks`  
Estocs per producte/almacén.

### Lectura de terceres

**GET** `/api/index.php/thirdparties`  
Clients registrats.

### Creació de comandes

**POST** `/api/index.php/orders`  
Crear nova comanda.

**GET** `/api/index.php/orders/{id}`  
Detall de comanda.

---

## Limitacions descobertes (fase 2 — investigació en viu)

**Data:** 2026-09-06 (durant fase 2)

### Categories (confirmades en viu)
- **Endpoint:** `GET /api/index.php/categories` — retorna totes les categories sense paginar (limit=200+)
- **Jerarquia:** via `fk_parent` (arrel = 1 "Raiz www.melicoto.com")
- **Slug:** a `array_options.options_woodolisync_slug` (ex: "textil", "camisetes")
- **Filtratge:** categories principals (7 úniques) diferenciades per slug dins `fk_parent=1`: `textil`, `complements`, `ca-nostra`, `cuina`, `artesania`, `papereria`, `infantil`. Categories com "sense-categoria", "embolicat" són brossa de WooCommerce, descartar.
- **Per-category products:** `GET /api/index.php/categories/{id}/objects?type=product` — retorna tota la categoria en UNA crida (no cal N+1). Verificat: categoria "Tèxtil" (id=30) retorna 23 productes.

### Productes (confirmades en viu)
- **Slug natural:** productes NO tenen `url` (sempre `null`). Cal generar via `slugify(label)` (ex: "Camiseta Rissaga" → "camiseta-rissaga").
- **Variants (talles):** cada variant és una product row separada (propi `ref`, propi `stock`). Distingits per `array_options.options_woodolisync_product_type`:
  - `"variable"` — producte pare (ex. "Pijama d'hivern de dona \"Tot marxa\"")
  - `"variation"` — producte fill/variant (ex. fill amb "- M" al sufix del label)
  - Enllaç: `array_options.options_woodolisync_parent_product` (int) = `id` del pare
  - Camp `options_woodolisync_talla` sovint `null` — extreure talla del sufix del label ("... - M" → "M")
- **Preus:** `price` (HT sense IVA), `price_ttc` (TTC amb IVA) — usar `price_ttc` per mostrar
- **Stock:** `stock_reel` (estoc físic), `stock_theorique` (estoc teòric, sempre `null` aquí)
- **Visibilitat:** `status` (1 = a la venta), `array_options.options_woodolisync_catalog_visibility` (valores: "visible", "hidden", etc.) — filtrar `status=1`
- **Descripció:** `array_options.options_woodolisync_product_short_description` (extrafield)

### Tags / Etiquetes (LIMITACIÓ DESCOBERTA)
- **NO accessibles via API REST.** WooCommerce tags viuen en taules pròpies de Dolibarr creades pel mòdul `custom/woodolisync`:
  - `llx_melicoto_product_tags` (etiqueta master)
  - `llx_melicoto_product_tag_product` (associació)
- **Workaround per fase futura:** query SQL directe (si escala) o endpoint custom a Dolibarr
- **Fora d'abast fase 2:** filtres per tags, navegació de tags

### Variants de color
- **NO trobat extrafield `woodolisync_color`.** Només talla (`options_woodolisync_talla`) està modela explícitament
- **Nota:** WooCommerce pot tenir colors, però Dolibarr/WoodolisSync ho mapeja només per talla en aquesta instala

### Rate limiting
- No observat límit en crides senzilles (`/categories`, `/products?limit=500`)
- Verifica sense-assó en producció si afegim moltes crides en paral·lel

### Paginació
- `/products?limit=500` funciona (retorna fins a 500 registres)
- No es necessita paginació per a categoria+productes d'una sola categoria (máx ~50-100 productes per categoria en aquest cas)

---

## Implementació actual (mode mock)

### `src/lib/dolibarr.ts`
- **`getProducts()`** → retorna `MOCK_PRODUCTS` si no hi ha credencials; si les hi ha, crida la API real
- **`getProductByRef(ref)`** → busca producte per referència (`CAMISETA-RISSAGA`, etc.)
- **Fallback automàtic:** si l'API falla, retorna dades mock

### `src/lib/cache.ts`
- Cache en memòria (Map + timestamp)
- TTL configurable per `CACHE_TTL_SECONDS` (default 90 segons)
- Clau: `products:list`, `product:ref:XXXX`, etc.

### Endpoint `src/app/api/products/route.ts`
- **GET** `/api/products` → retorna JSON de productes (amb cache)

---

## Pàgines que consumeixen l'API

| Pàgina | Endpoint | Codi |
|---|---|---|
| Categoria | `/api/products` | `src/app/(shop)/categoria/[slug]/page.tsx` |
| Fitxa producte | `getProductByRef()` directe | `src/app/(shop)/producte/[...slug]/page.tsx` |

---

## Testing amb credencials reals

**Quan estigui disponible la clau API:**

1. Copiar clau al `.env.local`
2. Executar `npm run dev`
3. Provar endpoints:
   - `http://localhost:3000/api/products` — ha de retornar dades reals de Dolibarr
   - `http://localhost:3000/shop/categoria-producte/textil` — ha de llistar productes reals

---

## Límit de cache

Per fase 1, usem cache en memòria (simple). Prou fins que no hi hagi trànsit públic. Quan sigui producció, considerar:
- **Redis** si la càrrega es dispara (en clúster o cloud hosting)
- **ISR (Incremental Static Regeneration)** de Next.js per a pàgines estàtiques
- **Cache Headers HTTP** (`Cache-Control: public, max-age=120`) per a navegador + CDN

---

**Última actualització:** 2026-09-05  
**Responsable sessió:** Claude Sonnet 5  
**Següent:** validar endpoints en viu quan es crei l'usuari API
