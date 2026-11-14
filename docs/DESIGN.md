# Design system

Direzione scelta: **"Low poly notturno"**. Tutto il sito prende lo stile dall'illustrazione dell'header: un interno caldo e scuro,
superfici a sfaccettature, fogli di carta chiara, una linea al neon. Le opere a grafite restano le protagoniste: il sito fa da tavolo
su cui sono appoggiate.

Sostituisce la direzione "Grafite di notte" (monocromo e rosso vinile) del 13/11/2026: vedi `DECISIONS.md`.

> **Stato:** i valori qui sotto sono quelli della pagina di anteprima (`header/build/preview.py`) e aspettano la conferma del committente.
> L'anteprima li usa già come custom properties; le scale `--fs-*` e `--s-*` entreranno nel CSS con il sito vero.

## Principi

1. **La scena detta lo stile.** Colori, tagli e luce vengono dall'illustrazione dell'header, non il contrario.
2. **Sfaccettature, non curve.** Gli angoli di pulsanti e riquadri sono tagliati in diagonale (`--cut`), mai arrotondati.
3. **Carta sul tavolo.** Le opere sono fogli chiari appoggiati su un fondo scuro e caldo, con un'ombra corta.
4. **Un solo neon.** L'arancio del battito è l'unico accento dell'interfaccia; il turchese vive solo dentro l'illustrazione.
5. **Ritmo.** Il battito cardiaco al neon dà il tempo: torna come filetto nei titoli di sezione.

## Colori

Custom properties su `:root`. Il sito è solo scuro (`color-scheme: dark`).

| Token | Valore | Uso |
|---|---|---|
| `--night` | `#141112` | Sfondo principale |
| `--surface` | `#1D1819` | Fasce e riquadri |
| `--graphite` | `#2B2628` | Superfici in rilievo |
| `--line` | `#3A2F31` | Bordi, divisori |
| `--paper` | `#F3DDD0` | Testo principale su scuro, fondo dei fogli |
| `--paper-dim` | `#CDB5A8` | Testo secondario |
| `--muted` | `#A8958D` | Didascalie, etichette mono |
| `--paper-ink` | `#5F504B` | Testo piccolo sopra la carta |
| `--neon` | `#FF8A4C` | **Unico accento.** CTA principale, numeri delle opere, filetto del battito |
| `--neon-ink` | `#1D0F07` | Testo sopra `--neon` |
| `--teal` | `#45B6CD` | Riservato: richiama la luce turchese dell'illustrazione, non si usa nell'interfaccia senza una decisione |

Contrasti (WCAG): `--paper` su `--night` 14,4:1 · `--paper-dim` su `--night` 9,6:1 · `--muted` su `--night` 6,6:1 ·
`--muted` su `--surface` 6,1:1 · `--neon` su `--night` 8,0:1 · `--neon-ink` su `--neon` 8,0:1 · `--paper-ink` su `--paper` 5,9:1.

- Un solo elemento pieno in `--neon` per schermata (la CTA principale). Numeri e filetti in neon sono ammessi perché sottili.
- I colori dell'illustrazione (pelle, viola, turchese, i dorsi dei libri) non escono dall'header.
- Niente gradienti nell'interfaccia: le sfumature stanno solo nelle sfaccettature dell'illustrazione.

## Tipografia

| Ruolo | Font | Note |
|---|---|---|
| Display | **Instrument Serif** (OFL) | Titoli grandi, nomi delle opere. Il corsivo fa da seconda voce. |
| Testo / UI | **Inter Tight** (OFL) | Paragrafi, navigazione, pulsanti |
| Didascalie / dati | **JetBrains Mono** (OFL) | Anno, tecnica, misure, numerazione opere |
| Logo | Firma "Cosmin Mann Art" in SVG | Mai ricomporla con un font. Finché il vettoriale non c'è, l'anteprima usa Instrument Serif corsivo **come segnaposto**. |

Nell'anteprima i font arrivano da Google Fonts; nel sito vero vanno self-hosted (WOFF2, subset latin + latin-ext).

Scala fluida (`clamp`), rapporto ~1.25:

| Token | Min → Max |
|---|---|
| `--fs-xs` | 11 → 13 px |
| `--fs-sm` | 14 → 15 px |
| `--fs-base` | 16 → 18 px |
| `--fs-lg` | 20 → 28 px |
| `--fs-xl` | 32 → 56 px |
| `--fs-2xl` | 40 → 92 px |
| `--fs-hero` | 44 → 120 px |

- Display: interlinea 0.98, tracking -0.02em. Testo: interlinea 1.55. Mono: maiuscolo, tracking +0.09em, `--fs-xs`.
- Lunghezza riga dei paragrafi: max 46ch nelle fasce, 64ch nei testi lunghi.

## Spaziatura e griglia

- Unità base 4 px. Token: `--s-1` 4, `--s-2` 8, `--s-3` 12, `--s-4` 16, `--s-6` 24, `--s-8` 32, `--s-12` 48, `--s-16` 64, `--s-24` 96, `--s-32` 128.
- Griglia a 12 colonne su desktop; le opere in home sono asimmetriche (5 + 3 + 4, poi 4 + 3 + 3 rientrate di una colonna).
  Sotto 860 px due colonne, sotto 480 px una.
- Margini laterali `--gutter: clamp(16px, 5vw, 80px)`, mai meno dell'area sicura del dispositivo. Contenuto massimo 1440 px.
- L'header esce dalla griglia: va sempre da bordo a bordo.
- `--cut: 12px` è il taglio d'angolo di pulsanti e riquadri (8 px sugli elementi piccoli).

## Motion

| Token | Valore | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrate |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Transizioni di pagina |
| `--ease-snap` | `cubic-bezier(0.7, 0, 0.2, 1)` | Chiusure nette, hover |
| `--d-fast` | 160 ms | Hover, focus |
| `--d-base` | 400 ms | Comparse di elementi |
| `--d-slow` | 900 ms | Reveal di immagini |

- L'animazione dell'header ha tempi suoi, descritti in `HEADER.md`. È l'unica cosa che si muove da sola nella pagina.
- Il resto dell'interfaccia si muove solo in risposta a un gesto (hover, focus, apertura del menu), con `--d-fast`.
- Hover sulle opere: nessuno zoom aggressivo; scala max 1.02 e comparsa della didascalia mono.
- `prefers-reduced-motion: reduce` → header fermo sul disegno finito, niente scroll morbido, solo dissolvenze ≤ 200 ms.

## Componenti base

- **Barra:** striscia `--night` sopra l'header, mai sovrapposta all'illustrazione. Nome a sinistra, voci in Inter Tight maiuscolo piccolo a destra
  (Opere, Artista, Shop, Contatti). Sotto 640 px le voci stanno dietro un pulsante "Menu".
- **Header:** l'illustrazione animata, da bordo a bordo (vedi `HEADER.md`).
- **Pulsanti:** angoli tagliati. Principale pieno `--neon` con testo `--neon-ink`; secondario `--surface` con bordo `--line`.
- **Titolo di sezione:** etichetta maiuscola, filetto `--neon` con il battito al centro, conteggio in mono a destra.
- **Opera (card):** foglio `--paper` con ombra corta; sotto, numero mono in neon (`№ 07`), titolo in Instrument Serif, anno · tecnica · misure in mono.
- **Dettaglio opera:** fondo `--night`, opera centrata e mai coperta, zoom per esplorare la grafite, frecce e swipe.
- **Fascia:** blocco `--surface` a due colonne (shop e artista in home).
- **Footer:** firma grande, Instagram, contatti.

## Cose da evitare

- Angoli arrotondati, ombre lunghe e diffuse, vetro sfocato.
- Un secondo accento: niente rosso, niente turchese nell'interfaccia.
- Zampine, emoji, icone colorate, illustrazioni stock. Il gatto illustrato vive solo nell'header.
- Qualunque effetto sopra un'opera nella vista di dettaglio.
- Carousel automatici e animazioni in loop fuori dall'header.
