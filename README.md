# Melicotó — Web a mida (2026)

Botiga online replicant melicoto.com (WordPress + WooCommerce) amb Next.js + API intermèdia + Dolibarr com a font única de dades.

## Fase 1: Proves de concepte

- [x] Scaffold Next.js (App Router + TypeScript)
- [x] Client Dolibarr amb fallback mock
- [x] Cache en memòria (90s default)
- [x] Endpoint `/api/products`
- [x] Pàgines de categoria i fitxa de producte
- [ ] Validació endpoints reals de Dolibarr (pendent credencials API)
- [ ] Checkout + pagament (fase 2)
- [ ] Blog + pàgines estàtiques (fase 2+)

## Setup

### 1. Clonar i instal·lar

```bash
cd WEB-MELICOTO-MIDA
npm install
```

### 2. Configurar variables d'entorn

```bash
cp .env.local.example .env.local
```

Deixa buit `DOLIBARR_API_KEY` per usar **mode mock** (dades d'exemple).

Quan estigui disponible la clau API:

```env
DOLIBARR_API_URL=https://empresa.melicoto.com/api/index.php
DOLIBARR_API_KEY=your-key-here
```

### 3. Executar dev server

```bash
npm run dev
```

Obrir `http://localhost:3000`

- `/` — pàgina d'inici
- `/shop/categoria-producte/textil` — llistat de categoria (mock)
- `/api/products` — endpoint JSON (mock)

### 4. Build per producció

```bash
npm run build
npm start
```

## Estructura de carpetes

```
WEB-MELICOTO-MIDA/
├── src/
│   ├── app/
│   │   ├── layout.tsx          — layout global
│   │   ├── page.tsx            — home
│   │   ├── api/products/route.ts
│   │   └── (shop)/
│   │       ├── categoria/[slug]/page.tsx
│   │       └── producte/[...slug]/page.tsx
│   ├── lib/
│   │   ├── dolibarr.ts         — client API + mock
│   │   └── cache.ts            — cache en memòria
│   └── middleware.ts           — noindex headers
├── public/
│   └── robots.txt              — Disallow: /
├── docs/
│   ├── dolibarr-api-mapping.md — endpoints + limitacions
│   └── urls-mapping.md         — mapa URLs WooCommerce actual
├── .env.local.example
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## Variables d'entorn

| Variable | Default | Descripció |
|---|---|---|
| `DOLIBARR_API_URL` | — | URL base API REST Dolibarr (`https://empresa.melicoto.com/api/index.php`) |
| `DOLIBARR_API_KEY` | — | Clau API usuari `api_melicoto_web` (pendent crear) |
| `CACHE_TTL_SECONDS` | 90 | Cache TTL en segons |

## Mode mock

Si `DOLIBARR_API_KEY` és buit:
- `src/lib/dolibarr.ts` retorna dades d'exemple en memòria
- Les pàgines funcionen sense connectar a Dolibarr
- Permet desenvolupar sense credencials API

Quan sigui disponible la clau, canviar `.env.local` i reiniciar `npm run dev`. La web consumirà dades reals automàticament.

## Pròxim pas

**Crear usuari API escopat a Dolibarr** (veure `docs/dolibarr-api-mapping.md`).
