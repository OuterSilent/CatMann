# Tecnologia

## Stato attuale

| Parte | Com'è fatta | Dove sta |
|---|---|---|
| **Header animato** | SVG in linea + CSS + un file JS, nessuna dipendenza a runtime. Generato da script Python a partire dai vettori ricalcati. | `header/` |
| **Pagina di anteprima** | Un solo file HTML statico che si apre con un doppio clic. | `header/dist/preview.html` |
| **Sito vero** | Non ancora avviato: parte dopo l'approvazione dell'header. | — |

Dettagli su struttura, ricostruzione e controlli dell'header: [`header/README.md`](../header/README.md).

## Stack

| Area | Scelta | Stato |
|---|---|---|
| Header | SVG + CSS + JS vanilla, animazione a ritaglio | **Deciso** (2026-11-14) |
| Framework del sito | **Astro** (TypeScript): HTML statico, JS solo dove serve. L'header entra come frammento già pronto (`header/dist/hero.*`). | Proposto, da confermare |
| Stili | CSS moderno con custom properties, token in un solo file | Proposto |
| Animazioni dell'interfaccia | Solo CSS. Niente GSAP, Lenis o WebGL: l'unica cosa che si muove da sola è l'header. | Proposto |
| Immagini delle opere | `astro:assets` (sharp): AVIF/WebP, `srcset`, lazy loading | Proposto |
| Contenuti | Content Collections di Astro (`src/content/works`), tipizzate con Zod | Proposto |
| i18n | Routing i18n di Astro (`it` default, `en`) | Proposto |
| Shop | Fittizio per ora. Da scegliere tra link esterno e vetrina interna con pagamento di terzi. | Aperto |
| Deploy | Hosting statico (Netlify, Vercel o GitHub Pages), anteprima per ogni branch | Aperto |

## Struttura delle cartelle

```
header/
  dist/          quello che usa il sito: hero.html, hero.css, hero.js (+ preview.html)
  build/         build.py, drawing.py, hero.css, runtime.js, preview.py
  data/          vettori ricalcati dell'illustrazione (un file per pezzo)
  pipe/          dal riferimento ai vettori: maschere, livelli, ricalco
  tools/         controlli con Playwright
docs/            questi documenti
```

Con l'avvio del sito si aggiungeranno `src/` (pagine, componenti, contenuti, stili) e `public/` (font, favicon, firma).

L'immagine di riferimento dell'illustrazione non è nel repository, che è pubblico: `header/ref/` e `header/out/` sono ignorati da git.
Chi deve rifare il ricalco la riceve a parte.

## Convenzioni

- Codice, commenti e nomi in inglese; documenti e contenuti in italiano.
- Nel sito: TypeScript strict, componenti in PascalCase, utility in camelCase.
- Le misure dell'header sono in "unità di scena" (2171 × 724), mai in pixel: così regge a ogni dimensione.
- `header/dist/` è versionato: è l'interfaccia tra l'illustrazione (Python, si rifà di rado) e il sito (che non deve dipendere da Python).
  Dopo ogni modifica in `header/build/` o `header/data/` si rifà il build e si committa anche `dist/`.
- Commit piccoli e descrittivi in inglese. Branch per feature.

## Budget di performance

- Lighthouse mobile ≥ 90 su Performance, 100 su Accessibility e SEO.
- LCP < 2,5 s, CLS < 0,05, INP < 200 ms.
- JS totale in home < 200 KB gzip (oggi l'header ne usa 9).
- Markup dell'header: oggi 179 KB gzip. È il costo principale della home e va servito compresso (brotli o gzip).
- Font: max 4 file WOFF2 self-hosted, `font-display: swap`, preload di quello display.

## Accessibilità

- Navigazione completa da tastiera, focus visibile (anello `--paper` 2 px).
- `alt` obbligatorio per ogni opera; l'header ha una descrizione testuale per screen reader.
- Contrasti AA minimo.
- Il contenuto non dipende mai da un'animazione per essere letto. L'header si può mettere in pausa e rispetta `prefers-reduced-motion`.

## SEO e social

- Meta title/description per pagina, Open Graph con un'opera come immagine.
- Dati strutturati `Person` (artista) e `VisualArtwork` per le opere.
- Sitemap e `robots.txt`. La pagina di anteprima è `noindex`.

## Privacy

- Embed SoundCloud/Instagram caricati solo dopo il click dell'utente.
- Nessun tracker di terze parti di default; se servono statistiche, una soluzione cookieless (Plausible o simili).
- L'anteprima carica i font da Google Fonts; il sito vero li ospita in proprio.
