# Contenuti e struttura

## Mappa del sito

```
/                 Home: header + selezione opere + teaser about + musica + contatti
/opere            Portfolio completo (filtrabile per serie/tecnica)
/opere/[slug]     Dettaglio opera
/about            Chi è Cosmin, ritratti, processo
/eventi           Eventi e mostre (da "EVENTS 2026")
/contatti         Contatti e commissioni
/en/...           Versione inglese (stessa struttura)
```

Fase 1: si può partire con una **one-page** (home con ancore) e aggiungere le pagine dopo.

## Home — sezioni in ordine

1. **Header "Lo sguardo"** (vedi `HEADER.md`).
2. **Manifesto breve:** 1–2 righe in Instrument Serif grande. Segnaposto: *"Disegno gatti come se fossero persone. Un pelo alla volta."*
3. **Opere selezionate:** 6 opere in griglia asimmetrica, link a `/opere`.
4. **Processo:** striscia orizzontale con foto di lavoro (mani, matite, caffè, il gatto grigio), scroll orizzontale guidato dallo scroll verticale su desktop.
5. **About (teaser):** ritratto B/N di Cosmin + 3 righe + link.
6. **Musica:** "Cosa ascolto mentre disegno" + embed della playlist SoundCloud (caricato solo al click, per performance e privacy).
7. **Contatti / commissioni:** CTA rossa "Commissiona un ritratto" (se confermato), email, Instagram.
8. **Footer** con firma grande.

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
