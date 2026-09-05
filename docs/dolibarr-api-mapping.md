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

## Limitacions descobertes (a omplir conforme testem)

*Secció pendent — es documentaran aquí quan provem en viu contra Dolibarr.*

- Paginació (endpoints retornen tots els registres, o paginen per defecte?)
- Filtres disponibles (`GET /products?limit=50&sortfield=ref`)
- Format de dades retornades (camp de preus, estoc, variants)
- Autenticació API Key (capçalera `DOLAPIKEY`, o altre?)
- Rate limiting (si n'hi ha)
- Endpoints per variants de producte (talles, colors)

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
