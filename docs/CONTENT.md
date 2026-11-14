# Contenuti e struttura

## Mappa del sito

```
/                 Home: header animato, poi subito la galleria; shop, artista, contatti
/opere            Portfolio completo (filtrabile per serie/tecnica)
/opere/[slug]     Dettaglio opera
/shop             Originali in vendita (per ora fittizio)
/about            Chi è Cosmin, ritratti, processo
/eventi           Eventi e mostre (da "EVENTS 2026")
/contatti         Contatti e commissioni
/en/...           Versione inglese (stessa struttura)
```

Si parte da una **one-page** (home con ancore): è quello che mostra l'anteprima. Le altre pagine si aggiungono dopo.

## Menu

`Opere` · `Artista` · `Shop` · `Contatti`. Nella one-page sono ancore; lo shop diventerà un link alla sua pagina o a un servizio esterno.

## Home — sezioni in ordine

1. **Barra** con il nome e il menu.
2. **Header "L'artista e il gatto"** (vedi `HEADER.md`).
3. **Manifesto breve:** 1–2 righe in Instrument Serif grande, un paragrafo e due pulsanti ("Guarda le opere", "Vai allo shop").
   Segnaposto: *"Gatti a grafite. Un pelo alla volta."*
4. **Opere selezionate:** è la galleria che si trova di default sotto l'header. 6 opere in griglia asimmetrica, poi link a `/opere`.
5. **Shop:** per ora una fascia "in arrivo" con pulsante disattivato. Lo shop venderà i disegni fisici dell'artista.
6. **Artista (teaser):** tre righe e, quando ci sarà, un ritratto.
7. **Footer** con firma grande, Instagram, contatti.

Previste più avanti, non ancora nell'anteprima: **Processo** (foto di lavoro: mani, matite, caffè, il gatto grigio),
**Musica** ("Cosa ascolto mentre disegno", playlist SoundCloud caricata solo al click), **Eventi**.

## Segnaposto in uso

Tutto quello che l'anteprima mostra sotto l'header è segnaposto, e lo dice: etichetta "Segnaposto" su ogni foglio, nota nel footer.

| Cosa | Segnaposto attuale |
|---|---|
| Opere | Sei fogli con un occhio di gatto a sfaccettature, disegnati dal browser. Titoli, anni e misure sono inventati. |
| Manifesto e testi | Scritti da noi, nessuna frase è dell'artista. |
| Logo | "Cosmin Mann Art" composto in Instrument Serif corsivo, in attesa del vettoriale della firma. |
| Shop | Nessun prodotto, nessun prezzo: solo l'annuncio. |
| Contatti | Solo il link a Instagram. |

La striscia "Solo in anteprima" con i tre pulsanti che comandano il gatto serve a provare l'header e non farà parte del sito.

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
available: false                # originale in vendita nello shop?
price_eur: null                 # prezzo, solo se in vendita
```

- Ogni immagine ha un `alt` descrittivo in italiano (e `alt_en`).
- Gli originali vanno in alta risoluzione (lato lungo ≥ 3000 px); il build genera le varianti.

## Testi

- Microcopy breve, ironico, mai sdolcinato. Esempi: pulsante "Guarda da vicino", stato vuoto "Il gatto sta ancora posando".
- Numerazione opere in mono: `№ 01`.
- Tutti i testi segnaposto sono marcati `TODO(artist)` nel codice del sito finché l'artista non li conferma.
- Niente frasi in prima persona attribuite all'artista finché non le scrive lui.

## Materiale da raccogliere

Vedi la lista "Da chiarire con l'artista" in `ARTIST.md`.
