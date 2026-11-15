# Tecnica

## Stack

Nessun framework: HTML, CSS e moduli JavaScript in `site/`, bundle con esbuild. Proposta in attesa di conferma (`DECISIONS.md`).

```
site/
  index.html          contenuto in italiano, chiavi data-i18n per l'inglese
  css/tokens.css      token (colori, font, spazi, durate)
  css/site.css        layout e componenti
  js/main.js          avvio, lingua, navigazione, hover/focus/press
  js/artist.js        testa e braccia: cinematica inversa, tubi delle maniche
  js/ink.js           tratti che si disegnano con la matita sulla punta, cornici a mano
  js/rough.js         geometria "a mano" (linee, rettangoli, ellissi, tratteggi)
  js/gallery.js       pila di disegni con ricciolo (WebGL)
  js/doodle.js        scarabocchio generativo
  js/cat.js, desk.js  gatto, tavolo e oggetti
  js/content.js       testi inglesi, elenco delle opere
  js/figures.js       GENERATO: tracciati di mani, testa e gatto
tools/
  trace/              ricalco a linea centrale dei riferimenti (Python)
  extract_placeholders.py   immagini provvisorie dallo screenshot Instagram
  build.mjs           dist/ e anteprima in un file solo
```

## Come funziona il ridisegno

`ink.stroke()` crea un tracciato SVG nel livello `#ink` del foglio e lo rivela con `stroke-dashoffset`; a ogni frame chiede ad `artist` di mettere la punta della matita sul punto raggiunto.
`artist` risolve il braccio (spalla, gomito, mano) e ruota la mano ricalcata attorno al gomito. La manica superiore è una linea spessa con contorno, quindi può allungarsi.

## Performance e accessibilità

- JS circa 105 KB gzip, di cui la maggior parte sono i tracciati delle figure.
- Testo vero, navigazione ad ancore (`#opere`, `#chi-e`, `#negozio`, `#contatti`), focus visibile disegnato a mano, `aria-current` sulla voce attiva.
- La galleria ha pulsanti, frecce da tastiera e un elenco testuale nascosto delle opere.
- `prefers-reduced-motion`: nessun movimento.

## Da fare

- Font self-hosted (oggi Google Fonts).
- Immagini vere in AVIF/WebP responsive.
- Prova su Safari, Firefox, iOS e Android.
- Hosting e dominio.
