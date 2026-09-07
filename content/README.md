# Contingut editorial (pàgines i blog)

Fase 1 del CMS: el contingut viu en fitxers Markdown dins d'aquesta carpeta.
Per publicar un canvi: edita el `.md`, fes commit i push → Vercel desplega sol.
(La fase 2 serà un panell `/admin` amb base de dades; l'API de `src/lib/content.ts`
es mantindrà igual.)

## `pages/<slug>.md` → pàgina a `https://…/<slug>`

```markdown
---
title: Títol de la pàgina
description: Frase curta per al SEO / metadades
updated: 2026-09-07   # opcional
---

## Un apartat

Text normal, **negreta**, [enllaços](https://…), llistes…
```

Slugs actuals: `melicoto` (Qui som), `tens-dubtes`, `contacte`, `dibuixos`,
`feim-pinya`, `nota-legal-i-condicions`, `politica-de-cookies-ue`,
`politica-de-privacitat`.

Per afegir una pàgina nova només cal crear el fitxer; la ruta es genera sola.
Per treure'n una, esborra el fitxer.

## `blog/<slug>.md` → article a `https://…/blog/<slug>`

```markdown
---
title: Títol de l'article
date: 2026-09-07        # obligatori, ordena el llistat
excerpt: Resum d'una línia que surt al llistat del blog
description: Text per a metadades (si no hi és, s'usa l'excerpt)
cover: https://…/foto.jpg   # opcional
draft: true                 # opcional: no es publica en producció
---

Cos de l'article en Markdown.
```

## Imatges

De moment, enllaça imatges per URL absoluta (per exemple des de
`https://www.melicoto.com/wp-content/uploads/…`). Quan hi hagi el panell
`/admin` s'hi podran pujar directament.
