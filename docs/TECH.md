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
  js/ink.js           tratti che si tracciano da soli, cornici a mano
  js/rough.js         geometria "a mano" (linee, rettangoli, ellissi, tratteggi)
  js/gallery.js       pila di disegni con ricciolo (WebGL)
  js/doodle.js        il ritratto del gatto, il foglio dell'artista e le sue mani
  js/desk.js          tavolo e oggetti
  js/content.js       testi inglesi, elenco delle opere
  js/figures.js       GENERATO: tracciati di mani e testa
tools/
  trace/              ricalco a linea centrale dei riferimenti (Python)
  extract_placeholders.py   immagini provvisorie dallo screenshot Instagram
  build.mjs           dist/ e anteprima in un file solo
```

## Come funziona il ridisegno

`ink.stroke()` crea un tracciato SVG nel livello `#ink` del foglio e lo rivela con `stroke-dashoffset`. La mano dell'artista non c'entra.
`doodle` genera il ritratto (mappa di toni, verso del pelo, elenco ordinato di tratti), muove la matita tratto per tratto e dice ad `artist` dove sono le due mani; gestisce anche il foglio che scorre con la pagina e viene messo via.
`artist` risolve le braccia (spalla, gomito, mano) con lunghezze fisse e disegna maniche e pieghe.

## Performance e accessibilità

- JS circa 77 KB gzip, di cui la maggior parte sono i tracciati delle figure.
- Testo vero, navigazione ad ancore (`#opere`, `#chi-e`, `#negozio`, `#contatti`), focus visibile disegnato a mano, `aria-current` sulla voce attiva.
- La galleria ha pulsanti, frecce da tastiera e un elenco testuale nascosto delle opere.
- `prefers-reduced-motion`: nessun movimento.

## Da fare

- Font self-hosted (oggi Google Fonts).
- Immagini vere in AVIF/WebP responsive.
- Prova su Safari, Firefox, iOS e Android.
- Hosting e dominio.
