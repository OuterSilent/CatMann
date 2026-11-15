# Contenuti e struttura

## Mappa del sito

Una pagina sola con viste ad ancora:

```
#home       titolo, pila in miniatura, tre rimandi (Chi è, Negozio, Musica)
#opere      galleria a pila
#chi-e      ritratto, testo, strumenti, due foto
#negozio    originali con prezzo (dimostrativo)
#contatti   modulo (dimostrativo), Instagram, playlist SoundCloud
```

Italiano nella pagina, inglese in `site/js/content.js`. Tutti i testi sono provvisori.
Le opere oggi sono un elenco in `content.js` con immagini segnaposto; il modello qui sotto vale per quando arriveranno quelle vere.

## Modello dati di un'opera

File in `src/content/works/*.md` (o JSON), un file per opera:

```yaml
slug: gatto-grigio-01
title: "Senza titolo (Grigio)"
year: 2026
technique: "Grafite su carta"   # IT
technique_en: "Graphite on paper"
size: "30 × 40 cm"
series: "Gatti"                 # opzionale
featured: true                  # appare in home
order: 1                        # ordine in home
images:
  - src: ./gatto-grigio-01.jpg  # originale ad alta risoluzione
    alt: "Ritratto a grafite di un gatto grigio che guarda in basso"
    focal: [0.5, 0.35]          # punto focale per i ritagli
process: []                     # foto del processo, opzionali
available: false                # originale disponibile?
```

- Ogni immagine ha un `alt` descrittivo in italiano (e `alt_en`).
- Gli originali vanno in alta risoluzione (lato lungo ≥ 3000 px); il build genera le varianti.

## Testi

- Microcopy breve, ironico, mai sdolcinato. Esempi: pulsante "Guarda da vicino", stato vuoto "Il gatto sta ancora posando".
- Numerazione opere in mono: `№ 01`.
- Tutti i testi segnaposto sono marcati `TODO(artist)` nel codice finché l'artista non li conferma.

## Materiale da raccogliere

Vedi la lista "Da chiarire con l'artista" in `ARTIST.md`.
