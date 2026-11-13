# Header animato — "Lo sguardo"

L'header è la firma del sito: deve fermare chi arriva per qualche secondo e dire subito *grafite, gatti, glamour*.
Occupa il 100% della viewport (`100svh`) nella home.

## Concept

Ispirato alla foto profilo in cui Cosmin si copre il volto con un paio di occhi di gatto disegnati.
Sullo schermo nero appare, **tratto dopo tratto**, uno sguardo felino a grafite. Gli occhi si aprono e **seguono il cursore**.
Poi la firma "Cosmin Mann Art" si scrive da sola e un paio di scintille (gli strass) le passano sopra.

## Sequenza (prima visita)

| t (ms) | Cosa succede |
|---|---|
| 0 | Schermo `--c-night` con grana. Un cursore-matita (punto) al centro. |
| 0–1600 | Il disegno degli occhi emerge: i tratti di grafite compaiono da un rumore (shader di reveal guidato da una mappa di "ordine dei tratti") o, in fallback, da maschere SVG. |
| 1600–2200 | Le pupille si stringono (come un gatto sorpreso dalla luce) e si posizionano verso il cursore. |
| 1800–3000 | La firma SVG si disegna (animazione `stroke-dashoffset`), colore `--c-paper`. |
| 3000–3400 | Un glint attraversa la firma da sinistra a destra (strass). |
| 3400 | Compaiono la nav e un indicatore di scroll in mono: `SCROLL — № 01–13`. |

Visite successive nella stessa sessione: sequenza accorciata a ~1200 ms (`sessionStorage`).
La sequenza si può saltare con click, tasto o scroll.

## Interazione

- **Mouse:** le pupille seguono il cursore con inerzia (lerp ~0.08). Avvicinandosi agli occhi le pupille si stringono.
- **Click/tap sugli occhi:** il gatto sbatte le palpebre (blink 180 ms). Easter egg: 5 click di fila → un breve "miao" visivo (orecchie che si muovono), senza audio.
- **Touch / mobile:** gli occhi seguono l'orientamento del dispositivo se disponibile e consentito, altrimenti un lento movimento "idle" che guarda intorno.
- **Scroll:** la grafite si "sfuma" (dissolve verso la carta) mentre l'header scorre via, con un leggero parallax; la prima opera della sezione successiva entra dallo stesso punto in cui c'erano gli occhi.
- **Idle (> 6 s fermo):** le pupille si dilatano lentamente, poi un blink.

## Implementazione consigliata

- **WebGL** (OGL o Three.js minimale) con un unico fragment shader:
  - texture del disegno degli occhi (grafite su trasparente) + mappa "ordine dei tratti" in scala di grigi per il reveal;
  - pupille come forme separate (SDF) per poterle muovere e scalare;
  - grana e leggera vibrazione della grafite (noise animato a bassa ampiezza).
- **Firma:** SVG inline separato, animato con GSAP o Web Animations API.
- **Glint:** gradiente lineare in un layer con `mix-blend-mode: screen`, mascherato sulla firma.
- **Asset di partenza:** finché non c'è un disegno degli occhi fatto da Cosmin, usare un ritaglio dei suoi disegni (occhi dei gatti) o un segnaposto. **L'ideale è commissionargli un disegno apposito degli occhi, su carta bianca, scansionato ad alta risoluzione.**

## Fallback

| Condizione | Comportamento |
|---|---|
| `prefers-reduced-motion` | Immagine statica degli occhi + firma già disegnata, dissolvenza 200 ms. |
| WebGL non disponibile / errore | Versione SVG/CSS: reveal con maschere, pupille SVG che seguono il cursore. |
| JS disabilitato | Immagine statica + firma, contenuto completamente accessibile. |
| Connessione lenta (`saveData` o `effectiveType` 2g/3g) | Fallback SVG, niente shader. |

## Vincoli

- LCP: l'immagine statica degli occhi (AVIF, < 80 KB) è il primo paint; il WebGL la sostituisce senza salti.
- JS dell'header < 150 KB gzip, caricato dopo il primo paint.
- 60 fps su un portatile medio; mettere in pausa il rendering quando l'header non è visibile (`IntersectionObserver`) o la scheda è nascosta.
- Accessibilità: il canvas è `aria-hidden`; un `h1` visivamente nascosto contiene "Cosmin Mann — Artista".
