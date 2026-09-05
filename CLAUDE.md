# Melicotó — Web a mida 2026

**Objectiu:** construir una botiga online que replaci la funcionalitat actual de melicoto.com (WordPress + WooCommerce), però eliminant la duplicació de dades. Dolibarr serà l'**única font de veritat** per a productes, preus, estoc, clients i comandes.

---

## 1. Arquitectura proposada

```
┌─────────────────────────────┐         API REST          ┌──────────────────┐
│  Frontend (Next.js)         │ ◄────────────────────────► │  Dolibarr 18.0.4  │
│  - App Router               │    + cache intermèdia      │ (font única)      │
│  - Server Components (SEO)  │    + validació d'estoc     │                   │
│  - Server Actions (actions) │                            └──────────────────┘
└─────────────────────────────┘
        │
        │ (no parla directe amb Dolibarr)
        │
        ▼
┌─────────────────────────────┐
│  Backend propi (API routes) │  
│  - Únic client autenticat   │
│  - Cache 60-120s            │
│  - Usuari d'API escopat     │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│  BD pròpia (pàgines)        │
│  - Textos estàtics          │
│  - Blog                     │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│  Passarel·la (Redsys/Stripe)│
│  - Pagaments segurs         │
│  - Mai dades de targeta     │
│  - Webhooks → Dolibarr      │
└─────────────────────────────┘
```

### Principis clau

1. **Frontend:** Next.js App Router amb Server Components per a fitxes de producte (SEO), Server Actions per a cistella/checkout.
2. **Backend intermedi:** l'ÚNIC client autenticat contra l'API REST de Dolibarr. El navegador mai crida Dolibarr directament.
3. **Cache curta:** 60-120s sobre crides a Dolibarr per protegir-lo de trànsit públic directe.
4. **Estoc atòmic:** mecanisme de reserva/comprovació en el checkout per evitar overbooking en compres simultànies.
5. **Pagament extern:** Redsys o Stripe. Les dades de targeta mai toquen el servidor (PCI-DSS SAQ A).
6. **Continguts pròpis:** panell senzill per editar textos de pàgines estàtiques i blog (BD pròpia, no Dolibarr CMS).
7. **Usuari d'API escopat:** només lectura de productes/estoc/preus i escriptura de terceres/comandes.

---

## 2. Context actual (estat a 2026-09-05)

### Estructura de melicoto.com (WooCommerce actual)

**Stack:** WordPress + WooCommerce + WPBakery Page Builder.  
**Hosting:** WebEmpresa (cPanel/SFTP).  
**Idioma:** català (ca_ES).

**7 categories principals:**
1. Tèxtil (camisetes, dessuadores, punt, camises, pijames, banyadors, calçons)
2. Complements (bosses, necessers, carteres, calcetins, gorres, sabatilles, tapaboques, ventalls)
3. Ca nostra (botelles, clauers, frare, gerres cervesa, jocs taula, neules, rajoles)
4. Cuina (tasses, davantals, motlos, posts)
5. Artesania (imants, ceràmica, siurells, joieria, joguines mà, trinxets, dimonis)
6. Papereria (adhesius, targetes, calendari, làmines, quaderns, pòsters, llibres, fundes)
7. Infantil (roba nadons, pitets, camisetes/dessuadores infants, joguines, llibres)

**Funcionalitats a replicar:**
- Fitxes amb variants (talla/color) — "Selecciona opcions"
- Galeria + imatge principal
- Tags transversals (Mallorca, Nadal, Humor, Sant Antoni...) usats com a filtres
- Cerca + filtre per categoria
- Cistella + comptes d'usuari (login, contrasenya oblidada)
- Enviament: recollida botiga / domicili; certificat (2-5 dies); **gratuït a partir de 60€**
- Pagament amb targeta
- Blog, pàgina Qui som, **Camisetes x grups** (flux especial de comandes personalitzades)
- Pàgines legals: nota legal, cookies, privacitat, mapa web
- Banner CMP (consentiment cookies)
- SEO: metadades OG, canonical, sitemap

### Problema de base

Estoc i preus duplicats entre Dolibarr (ERP) i WooCommerce (botiga). Genera desincronitzacions estructurals (no és un bug puntual). La solució correcta és que Dolibarr sigui l'única font de veritat.

---

## 3. Estructura de repositori

```
WEB-MELICOTO-MIDA/
├── CLAUDE.md                      ← aquest fitxer (decisions + estat)
├── README.md                      ← instruccions per aixecar l'entorn
├── .env.local.example             ← template de variables d'entorn
├── .env.local                     ← (NO commitar) credencials locals
├── docs/
│   ├── architecture.md            ← detalls tècnics de l'arquitectura
│   ├── decisions.log              ← registre de decisions preses per sessió
│   ├── dolibarr-api-mapping.md   ← endpoints de Dolibarr usats + limitacions trovades
│   ├── urls-mapping.md            ← mapa complet URLs actuals WooCommerce → slugs
│   └── payment-integration.md     ← decisió final Redsys vs Stripe
├── src/
│   ├── app/                       ← Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx               ← home
│   │   ├── (shop)/
│   │   │   ├── categoria/[slug]/page.tsx
│   │   │   ├── producte/[...slug]/page.tsx
│   │   │   └── etiqueta/[slug]/page.tsx
│   │   ├── carret/page.tsx        ← cistella + checkout
│   │   ├── api/                   ← endpoints de backend intermedi
│   │   │   ├── products/route.ts
│   │   │   ├── categories/route.ts
│   │   │   ├── orders/route.ts
│   │   │   └── ...
│   │   └── admin/                 ← panell de pàgines (textos, blog)
│   │       └── pages/
│   ├── lib/
│   │   ├── dolibarr.ts            ← client autenticat contra API Dolibarr
│   │   ├── cache.ts               ← estratègia de cache (60-120s)
│   │   ├── db.ts                  ← BD pròpia (SQLite o PostgreSQL)
│   │   └── utils.ts
│   └── components/
│       ├── ProductCard.tsx
│       ├── ProductDetail.tsx
│       ├── Cart.tsx
│       └── ...
├── public/
│   ├── robots.txt                 ← Disallow: / mentre prova.melicoto.com
│   └── sitemap.xml
├── package.json
├── next.config.js
├── tsconfig.json
└── ...
```

---

## 4. Fase 1 — Proves de concepte (en curs)

### Tasques pendents

- [x] Exportar/documentar mapa complet d'URLs actuals de WooCommerce (categories, subcategories, productes, tags) amb slugs exactes — ✅ `docs/urls-mapping.md`
- [ ] Verificar quins mòduls d'API REST estan actius a Dolibarr + provar endpoints bàsics (Productes, Estoc, Terceres, Comandes) — **PENDENT:** crear usuari API escopat `api_melicoto_web`
- [x] Montar scaffold Next.js + capa API intermèdia — ✅ completat (App Router, TypeScript, src/lib/)
- [x] Primer endpoint: llistat de productes amb preu + estoc, cache 60-120s — ✅ `GET /api/products` (amb cache i mock)
- [x] Pàgina de llistat de categoria (bàsica, sense estils definitius) — ✅ `/shop/categoria-producte/[slug]`
- [x] Fitxa de producte bàsica (consumint endpoint anterior) — ✅ `/productes/[...slug]`
- [ ] Resum integració Redsys/Stripe (sense implementar ancora) — pendent fase 2

### Limitacions trovades (Dolibarr API)

**Mode mock actiu** — sense credencials API, la web retorna dades d'exemple. Quan estigui disponible la clau API (usuari `api_melicoto_web`), descartarem limitacions reals.

Pendent documentar quan provem endpoints reals a `docs/dolibarr-api-mapping.md`.

---

## 5. URLs — mapa de redireccionaments

Quan substituïm melicoto.com per aquesta web nova, l'estructura d'URLs ha de ser **idèntica** (mateixos slugs) perquè no calguin redireccions. Si algun slug canvia, cal 301.

**Format expected (a verificar amb mapa WooCommerce actual):**
- Categories: `/shop/categoria-producte/<slug>/`
- Subcategories: `/shop/categoria-producte/<cat>/<subcat>/`
- Productes: `/productes/<categoria>/<subcategoria>/<slug-producte>/`
- Tags: `/shop/etiqueta-producte/<slug>/`

*Documentar a `docs/urls-mapping.md` el mapa complet quan tingem el llistat WooCommerce.*

---

## 6. Proteccions del subdomini de proves (prova.melicoto.com)

Mentre sigui en test, blindar perquè no s'indexi:

- Meta tag: `<meta name="robots" content="noindex, nofollow">` a totes les pàgines
- Capçalera HTTP: `X-Robots-Tag: noindex, nofollow` (via middleware Next.js)
- `robots.txt`: `Disallow: /`
- Mai afegir a Google Search Console
- Opcional: autenticació HTTP bàsica (usuari/contrasenya) per a accés intern

---

## 7. Passarel·la de pagament

**Decisió pendent:** Redsys vs Stripe.

- **Redsys:** TPV Virtual estàndard bancari a Espanya. Integració per redirecció o iFrame.
- **Stripe:** més modern i self-service. API més neta.

*A decidir i documentar a `docs/payment-integration.md` quan testejem les proves de fase 2.*

---

## 8. Dolibarr — configuració d'API

### Usuari d'API (escopat)

```
User: api_melicoto_web
Credentials: [TODO — crear a Dolibarr]
Permissions:
  - Lectura: Productes (Products), Estoc (Stock), Terceres (ThirdParty), Comandes (Orders)
  - Escriptura: Terceres (crear clients), Comandes (crear comandes)
  - NUNCA: accés a Configuració, Moduls, Usuaris
```

### Endpoints base a provar

- `GET /api/index.php/products` — llistat de productes
- `GET /api/index.php/products/{id}` — fitxa de producte
- `GET /api/index.php/stocks` — estocs per almacén
- `GET /api/index.php/thirdparties` — clients
- `POST /api/index.php/orders` — crear comanda
- `GET /api/index.php/orders/{id}` — detall de comanda

*Limitacions i quirks a documentar a `docs/dolibarr-api-mapping.md` conforme les descobrim.*

---

## 9. Model de Claude Code a usar

- **Sonnet 5:** dia a dia (scaffolding, integració API, iteració de pàgines).
- **Opus 5:** només per decisiones difícils d'arquitectura o problemes de rendiment bloquejants.

---

## 10. Convencions de codi

### TypeScript / Next.js

- Usar `eslint-config-next` + Prettier (defaults de `create-next-app`)
- Noms de fitxer: kebab-case per pàgines (`product-detail.tsx`), PascalCase per components
- Server Components per defecte; `'use client'` només si necessaris (cistella interactiva, filtres)
- Tipat complet: no `any`; usar interfaces genèriques per a dades de Dolibarr

### PHP (si mantenim codi pont)

- PSR-12 (Extended Coding Style) per a qualsevol PHP que escrivim
- Comentaris només per a lògica no òbvia

### Git

- Commits atòmics petits (`git commit` en comptes de `git add -A`)
- Missatges descriptius: "Add product listing page with Dolibarr integration" (no "Fix stuff")
- Branch main estable; feature branches per a canvis grans
- Sempre pull before push

---

## 11. Dependències principals (a confirmar)

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "typescript": "^5.x"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "eslint": "^9.x",
    "eslint-config-next": "^15.x",
    "prettier": "^3.x"
  }
}
```

Afegir conforme necessitem:
- `dotenv` per .env.local
- `axios` o fetch nativ (ja inclòs a Node.js 18+) per crides HTTP a Dolibarr
- Cache en memòria: `node-cache` o `lru-cache`
- BD: `prisma` + SQLite (prototipat) o PostgreSQL (producció)

---

## 12. Sesiones completadas

### Sessió 1 — 2026-09-05 (FASE 1: Proves de concepte)

1. ✅ Verificar estructura WEB-MELICOTO-MIDA (repo git existent, CLAUDE.md i docs/ presents)
2. ✅ Documentar mapa d'URLs actuals de WooCommerce — completat a `docs/urls-mapping.md`
3. ✅ Crear usuari API escopat a Dolibarr (`api_melicoto_web`) — clau generada
4. ✅ Montar scaffold Next.js inicial — App Router + TypeScript
5. ✅ Primer endpoint de backend: `GET /api/products` amb cache (90s default)
6. ✅ Pàgines category + product detail (mock mode)
7. ✅ Setup robots.txt + middleware X-Robots-Tag noindex
8. ✅ .env.local.example template + credencials API live
9. ✅ Documentació `docs/dolibarr-api-mapping.md` (amb instruccions crear usuari API)
10. ✅ README.md amb setup + estructura
11. ✅ Deploy a Vercel (auto-deploy en push a main)

### Sessió 2 — 2026-09-06 (FASE 2 PART 1: Categories + Navegació)

1. ✅ Investigar model de dades Dolibarr + mòdul WoodolisSync en viu:
   - Categories són nativas (`llx_categorie`, jerarquia `fk_parent`)
   - Variants són productes separats (`variable`/`variation`, enllaçat per `parentProductId`)
   - Talla extreta del sufix del `label` (camp `options_woodolisync_talla` sovint null)
   - Tags NO accessibles via API REST (taules pròpies sin endpoint)

2. ✅ Estendre `src/lib/dolibarr.ts`:
   - `DolibarrCategory` i ampliació `DolibarrProduct` amb tots els camps reals
   - `getCategories()`, `getTopCategories()`, `getCategoryBySlug()`, `getSubcategories()`
   - `getProductsByCategory(categoryId)` — agrupa variants sota pare
   - `getProductBySlug()` — resol per categoria + slug
   - `slugify()` helper

3. ✅ Reescriure pàgines:
   - `/shop/categoria-producte/[slug]` — mostra subcategories reals + productes de categoria
   - `/shop/categoria-producte/[slug]/[subslug]` — llistat productes subcategoria (nova)
   - `/productes/[...slug]` — detecta variants (si `variable`), mostra selector talles amb estoc individual
   - `/` — menú de les 7 categories principals

4. ✅ Documentar a `docs/dolibarr-api-mapping.md`: endpoints confirmats, limtacions descobertes (tags, slug de producte)

5. ✅ Build succeeds, TypeScript check passes

6. ✅ Commit + push (auto-deploy Vercel)

### Pròxims passos per sessió 3

1. **Cistella (carret)** — estat en client (localStorage) o servidor (sessionStorage)
2. **Checkout** — formulari dades client, validació enviament
3. **Passarel·la de pagament** — decisió Redsys vs Stripe + integració
4. **Blog + pàgines estàtiques** — BD pròpia, editor senzill
5. **Imatges de producte** — endpoint documents de Dolibarr (més complex)
6. **Tags/filtres transversals** — query SQL custom (fora d'API REST)

---

## 13. Contacte / Credencials

**Repositoris locals:**
- `WEB-DOLIBAR-GIT/` — Dolibarr + custom modules
- `WEB-MELICOTO-GIT/` — WordPress melicoto.com
- `WEB-MELICOTO-MIDA/` — Projecte new (aquí estem)

**Hosting prove:**
- Subdomini: `prova.melicoto.com`
- Credencials FTP: a CLAUDE.md de WEB-DOLIBAR-GIT

**Instància Dolibarr:**
- URL: per completar
- Usuari admin: per completar
- Clau API: per completar (usuari escopat `api_melicoto_web`)

---

## Historial de decisions

### 2026-09-05 — Arquitectura inicial

**Decisió:** Next.js + API intermèdia + Dolibarr font única.

**Per què:** eliminar duplicació de dades, simplificar SEO i rendiment, protegir Dolibarr de trànsit públic, centralitzar lògica de negoci (enviaments, reserva d'estoc).

**Trade-offs:**
- Més complex que un "sync per cron cada X minuts" — però menys risc de desincronitzacions
- Cal desenvolupar una capa d'API nova — però rep punts de cost/temps amb SaaS de botiga estàndard (Shopify, Prestashop)
- Redsys/Stripe afegeix complexity de seguretat — però és l'estàndard indústria i a la llarga més segur

### 2026-09-06 — Model de dades: Variants, Categories, Tags

**Decisió:** Per a variants (talles), crear per cada mida un producte Dolibarr SEPARAT (no sub-records), allotjats en el mateix `fk_category` que el pare.

**Per què:** Dolibarr i WoodolisSync ja fan aquest model (cada talla = producte propi ref, propi stock). Matching això amb la estructura real simplifica integració, evita transformacions complexes, reutilitza endpoints natives (`/categories/{id}/objects?type=product`).

**Workaround — Talla extreta del label:** Camp `options_woodolisync_talla` sovint `null`. Extreure talla del sufix del `label` (ex: "Pijama ... - M" → "M").

**Limitació — Tags de WooCommerce:** No accessibles via API REST. Viuen en taules pròpies (`llx_melicoto_product_tags`) sense endpoint oficial. **PENDENT fase futura:** endpoint custom o query SQL.

---

*Última actualització: 2026-09-06 — Fase 2 part 1 completada. Següent: cistella + checkout (fase 2 part 2).*
