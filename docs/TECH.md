# Tecnologia

## Stack consigliato

| Area | Scelta | Perché |
|---|---|---|
| Framework | **Astro** (TypeScript) | Sito di contenuti, HTML statico, JS solo dove serve (isole). Ottimo per performance e SEO. |
| Stili | CSS moderno con custom properties (`tokens.css`) + CSS modules/scoped di Astro | Nessuna dipendenza, token centralizzati. |
| Animazioni | **GSAP** (+ ScrollTrigger, SplitText) | Sequenze precise, scroll, timeline. |
| WebGL header | **OGL** (leggero) o Three.js minimale | Shader del reveal a grafite. |
| Smooth scroll | **Lenis** | Scroll morbido coerente con le animazioni. Disattivato con reduced motion. |
| Immagini | `astro:assets` (sharp) | AVIF/WebP, `srcset`, lazy loading. |
| Contenuti | Content Collections di Astro (`src/content/works`) | Opere come file, tipizzate con Zod. |
| i18n | Routing i18n di Astro (`it` default, `en`) | |
| Deploy | Netlify o Vercel (statico) | Preview per ogni branch. |

Alternative accettabili se serve: Vite + vanilla TS. Evitare framework SPA pesanti.

## Struttura delle cartelle

```
src/
  components/      Nav, WorkCard, Lightbox, Footer...
  components/header/  HeroGaze.astro, gaze.ts (WebGL), shaders/, fallback-svg.ts
  content/works/   un file per opera + immagini
  layouts/         BaseLayout.astro
  pages/           index, opere, about, eventi, contatti (+ en/)
  styles/          tokens.css, base.css, typography.css
  lib/             motion.ts (preset GSAP dai token), reducedMotion.ts
public/
  fonts/           WOFF2 self-hosted
  brand/           signature.svg, favicon
docs/              questi documenti
```

## Convenzioni

- TypeScript strict. Nomi di file componenti in PascalCase, utility in camelCase.
- Durate ed easing in JS letti dai token (`lib/motion.ts`), mai numeri sparsi.
- Ogni animazione passa da un helper che controlla `prefers-reduced-motion`.
- Commit piccoli e descrittivi in inglese. Branch per feature.

## Budget di performance

- Lighthouse mobile ≥ 90 su Performance, 100 su Accessibility e SEO.
- LCP < 2,5 s, CLS < 0,05, INP < 200 ms.
- JS totale in home < 200 KB gzip (header incluso).
- Font: max 4 file WOFF2, `font-display: swap`, preload di quello display.

## Accessibilità

- Navigazione completa da tastiera, focus visibile (anello `--c-paper` 2 px).
- `alt` obbligatorio per ogni opera.
- Contrasti AA minimo.
- Il contenuto non dipende mai da un'animazione per essere letto.

## SEO e social

- Meta title/description per pagina, Open Graph con un'opera come immagine.
- Dati strutturati `Person` (artista) e `VisualArtwork` per le opere.
- Sitemap e `robots.txt`.

## Privacy

- Embed SoundCloud/Instagram caricati solo dopo il click dell'utente.
- Nessun tracker di terze parti di default; se servono statistiche, una soluzione cookieless (Plausible o simili).
