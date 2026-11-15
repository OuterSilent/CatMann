# CatMann — sito di Cosmin Mann

Sito portfolio per l'artista **Cosmin Mann** (Instagram `@cosmin_mann`): presenta l'artista e le sue opere.
Il sito è un foglio su un tavolo visto dall'alto: l'artista ne ridisegna l'interfaccia a ogni interazione.

## Leggi prima di lavorare

| File | Cosa contiene |
|---|---|
| [docs/ARTIST.md](docs/ARTIST.md) | Chi è l'artista, cosa fa, il suo immaginario. È la fonte di verità sul tono. |
| [docs/DESIGN.md](docs/DESIGN.md) | Design system: palette, tipografia, griglia, componenti, motion. |
| [docs/INTERFACE.md](docs/INTERFACE.md) | Il concept "foglio sul tavolo": set, ridisegni, galleria, figure. |
| [docs/CONTENT.md](docs/CONTENT.md) | Mappa del sito, sezioni, testi segnaposto, struttura dei dati delle opere. |
| [docs/TECH.md](docs/TECH.md) | Stack, struttura delle cartelle, performance, accessibilità, deploy. |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Registro delle decisioni prese e di quelle aperte. |

## Regole fisse

1. **Le opere vengono prima.** Nessun effetto deve coprire o distorcere un'opera nella vista di dettaglio.
2. **Usa solo i token** definiti in `docs/DESIGN.md` (colori, font, spaziature, durate, easing). Niente valori "a occhio" nei componenti.
3. **Monocromo + un accento.** Il rosso vinile si usa con parsimonia (max un elemento rosso per schermata).
4. **Motion con criterio:** ogni animazione rispetta `prefers-reduced-motion` e ha un fallback statico.
5. **Performance:** LCP < 2,5 s su mobile 4G, JS < 150 KB gzip, immagini sempre responsive (AVIF/WebP).
6. **Lingua:** contenuti in italiano come lingua principale, inglese come seconda lingua. Codice, commenti e nomi in inglese.
7. **Mobile first**, con layout pensato anche per schermi grandi (il desktop è la vetrina).
8. **Quando una decisione cambia**, aggiorna il documento relativo e annotala in `docs/DECISIONS.md` nello stesso commit.

## Comandi

```
npm install
npm run dev      # sito su http://localhost:8765 (serve site/)
npm run build    # dist/ e dist/preview.html (file unico)
npm run assets   # rigenera site/js/figures.js da ref/ (serve Python con numpy, opencv, scikit-image)
```

`ref/` (disegni di riferimento) e `site/placeholder/` (immagini provvisorie) non sono nel repository: senza, il sito funziona ma le immagini mancano.

## Stato

Fase 1: anteprima dell'interfaccia completa in `site/`, con testi e immagini provvisori. Prossimi passi: giudizio del committente, opere vere, firma, prova su Safari/Firefox e telefoni.
