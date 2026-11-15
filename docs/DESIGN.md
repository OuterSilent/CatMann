# Design system

Direzione: **"Il foglio sul tavolo"** (vedi `INTERFACE.md`). Sito chiaro, tratti fini a matita, un solo accento.
I valori vivono in `site/css/tokens.css`; questa pagina li spiega.

## Principi

1. **Carta.** Tanto bianco, niente riquadri pieni: i bordi sono tratti di matita.
2. **Tratto fine.** Una sola larghezza di linea (`--stroke`) per figure, cornici e segni.
3. **Un accento.** Il rosso dell'etichetta del vinile, una volta per schermata.
4. **Leggibilità prima del gioco.** Il testo è tipografia vera; la scrittura a mano è solo per firma, note e prezzi.

## Colori

| Token | Valore | Uso |
|---|---|---|
| `--c-desk` | `#E9E5DD` | tavolo |
| `--c-desk-grain` | `#D9D4CA` | venature |
| `--c-paper` | `#FCFBF8` | foglio, riempimento delle figure |
| `--c-paper-shade` | `#F1EEE8` | retro del foglio nella galleria |
| `--c-ink` | `#232327` | testo e tratti |
| `--c-ink-soft` | `#6B6A70` | testo secondario, scarabocchio |
| `--c-hair` | `#BDBAB4` | bordi leggeri |
| `--c-cat` | `#DCDAD6` | pelo del gatto |
| `--c-vinyl` | `#D8392F` | unico accento |

Tema scuro: non previsto.

## Tipografia

| Ruolo | Font | Token |
|---|---|---|
| Titoli | Cormorant Garamond 300, anche corsivo | `--f-display` |
| Testo e UI | Work Sans 400/500 | `--f-text` |
| Firma, note, prezzi | Caveat 500 | `--f-hand` |
| Didascalie e dati | IBM Plex Mono 400, maiuscoletto spaziato | `--f-mono` |

La firma "Cosmin Mann Art" in Caveat è un segnaposto: va sostituita con la firma vera in SVG.
Scala fluida: `--fs-xs`, `--fs-sm`, `--fs-base`, `--fs-lg`, `--fs-xl`, `--fs-hero`.

## Spaziatura

Base 4 px: `--s-1` … `--s-24`. Foglio largo al massimo 1180 px; margine minimo 16 px sui telefoni.

## Motion

| Token | Valore | Uso |
|---|---|---|
| `--d-mark` | 220 ms | segno su un link |
| `--d-press` | 200 ms | tratteggio del pulsante |
| `--d-write` | 260 ms | titolo scritto |
| `--d-menu` | 400 ms | menu |
| `--d-page` | 600 ms | ridisegno più lungo ammesso |
| `--ease-out`, `--ease-in-out` | curve | entrate, transizioni |
