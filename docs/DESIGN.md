# Design system

Direzione scelta: **"Grafite di notte"**. Una galleria monocroma e silenziosa per le opere, con un header immersivo e teatrale.
Base scura (come il suo profilo e le sue giacche), carta chiara per le opere, un solo accento rosso, scintillii rari.

## Principi

1. **Sguardo.** Gli occhi sono il centro: nell'header, nei dettagli, nell'interazione.
2. **Precisione.** Allineamenti esatti, griglia rigorosa, spaziature generose. Come un disegno iperrealista.
3. **Contrasto.** Notte (sfondo) contro carta (opere). Bianco e nero contro un lampo di rosso.
4. **Scintillio dosato.** Il glint degli strass è un premio, non una decorazione costante.
5. **Ritmo.** Le animazioni hanno tempo musicale: entrate lente, chiusure nette.

## Colori

Definiti come CSS custom properties in `src/styles/tokens.css`.

| Token | Valore | Uso |
|---|---|---|
| `--c-night` | `#0B0B0C` | Sfondo principale |
| `--c-graphite-900` | `#17171A` | Superfici, card |
| `--c-graphite-700` | `#2A2A2E` | Bordi, divisori |
| `--c-graphite-500` | `#5C5C63` | Testo secondario su scuro |
| `--c-graphite-300` | `#A3A3A8` | Testo terziario, didascalie |
| `--c-paper` | `#F1EEE8` | Testo principale su scuro, sfondo opere |
| `--c-paper-dim` | `#D9D5CC` | Carta in ombra |
| `--c-vinyl` | `#E3312B` | **Unico accento.** Link attivi, CTA principale, un dettaglio per schermata |
| `--c-glint` | `#FFFFFF` | Solo per i riflessi degli strass (con blend `screen`) |

- Contrasto minimo AA: `--c-paper` su `--c-night` ≈ 17:1; `--c-graphite-300` su `--c-night` ≈ 8:1.
- Niente gradienti colorati. Sono ammessi gradienti tra toni di grafite e grana (noise) leggera.
- Modalità chiara: **non prevista**. Il sito è scuro per scelta d'identità.

## Tipografia

Font self-hosted (WOFF2, subset latin + latin-ext).

| Ruolo | Font | Note |
|---|---|---|
| Display | **Instrument Serif** (Google Fonts, OFL) | Titoli grandi, nomi delle opere. Anche corsivo. |
| Testo / UI | **Inter Tight** (OFL) | Paragrafi, navigazione, pulsanti |
| Didascalie / dati | **JetBrains Mono** (OFL) | Anno, tecnica, misure, numerazione opere |
| Logo | Firma "Cosmin Mann Art" in SVG | Mai ricomporla con un font |

Scala fluida (`clamp`), rapporto ~1.25:

| Token | Min → Max |
|---|---|
| `--fs-xs` | 12 → 13 px |
| `--fs-sm` | 14 → 15 px |
| `--fs-base` | 16 → 18 px |
| `--fs-lg` | 20 → 24 px |
| `--fs-xl` | 28 → 40 px |
| `--fs-2xl` | 40 → 72 px |
| `--fs-hero` | 56 → 160 px |

- Display: interlinea 0.95, tracking -0.02em. Testo: interlinea 1.55. Mono: maiuscolo, tracking +0.08em, `--fs-xs`.
- Lunghezza riga dei paragrafi: max 64ch.

## Spaziatura e griglia

- Unità base 4 px. Token: `--s-1` 4, `--s-2` 8, `--s-3` 12, `--s-4` 16, `--s-6` 24, `--s-8` 32, `--s-12` 48, `--s-16` 64, `--s-24` 96, `--s-32` 128.
- Griglia: 4 colonne mobile, 8 tablet, 12 desktop. Gutter `--s-4` → `--s-6`. Margini laterali `clamp(16px, 5vw, 80px)`.
- Contenuto massimo 1440 px; le opere in dettaglio possono andare a tutto schermo.
- Ritmo verticale tra sezioni: `--s-24` mobile, `--s-32` desktop.

## Motion

| Token | Valore | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrate |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Transizioni di pagina |
| `--ease-snap` | `cubic-bezier(0.7, 0, 0.2, 1)` | Chiusure nette, hover |
| `--d-fast` | 160 ms | Hover, focus |
| `--d-base` | 400 ms | Comparse di elementi |
| `--d-slow` | 900 ms | Reveal di immagini |
| `--d-scene` | 2400 ms | Sequenze dell'header |

- Reveal delle opere allo scroll: maschera che "si disegna" dall'alto (clip-path) + leggera sfocatura che si toglie.
- Testi: entrata per righe (split lines), sfasamento 60 ms.
- Hover sulle opere: nessuno zoom aggressivo; scala max 1.02 e comparsa della didascalia mono.
- Cursore personalizzato su desktop: un punto che diventa una "pupilla" sopra le opere. Disattivato su touch e con reduced motion.
- `prefers-reduced-motion: reduce` → niente parallax, niente WebGL animato, solo dissolvenze ≤ 200 ms.

## Texture

- Grana leggera (noise SVG/PNG 4–6% di opacità) sullo sfondo notte.
- Le opere sono presentate su `--c-paper`, con ombra morbidissima: devono sembrare fogli veri.

## Componenti base

- **Nav:** fissa, trasparente sopra l'header, poi `--c-night` all'80% con blur. Logo-firma a sinistra, voci in Inter Tight maiuscolo piccolo a destra. Menu a tutto schermo su mobile.
- **Work card:** immagine, sotto numero mono (`№ 07`), titolo in Instrument Serif, anno · tecnica in mono.
- **Lightbox / dettaglio opera:** fondo notte, opera centrata, zoom per esplorare la grafite, frecce e swipe.
- **CTA:** testo + freccia, sottolineatura animata; la CTA principale della pagina usa `--c-vinyl`.
- **Footer:** firma grande, social, link playlist, copyright.

## Cose da evitare

- Colori aggiuntivi, emoji, illustrazioni stock, icone colorate.
- Effetti "glitch" o neon: non sono nel suo linguaggio.
- Gatti cartoon o zampine decorative. Il gatto è sempre quello disegnato da lui.
- Carousel automatici.
