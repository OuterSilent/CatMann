# CatMann — sito di Cosmin Mann

Sito portfolio per l'artista **Cosmin Mann** (Instagram `@cosmin_mann`): presenta l'artista e le sue opere.
Il pezzo forte è un **header animato**: un'illustrazione low poly in cui Cosmin disegna un gatto e il suo gatto vero gli gira intorno.

## Leggi prima di lavorare

| File | Cosa contiene |
|---|---|
| [docs/ARTIST.md](docs/ARTIST.md) | Chi è l'artista, cosa fa, il suo immaginario. È la fonte di verità sul tono. |
| [docs/DESIGN.md](docs/DESIGN.md) | Design system: palette, tipografia, griglia, componenti, motion. |
| [docs/HEADER.md](docs/HEADER.md) | Specifica dell'header animato (scena, comportamenti, formati, fallback). |
| [docs/CONTENT.md](docs/CONTENT.md) | Mappa del sito, sezioni, testi segnaposto, struttura dei dati delle opere. |
| [docs/TECH.md](docs/TECH.md) | Stack, struttura delle cartelle, performance, accessibilità, deploy. |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Registro delle decisioni prese, delle proposte da confermare e di quelle aperte. |
| [header/README.md](header/README.md) | Come è fatto l'header, come si ricostruisce e come si controlla. |

"Il committente" in questi documenti è chi segue il progetto per conto dell'artista e decide.

## Regole fisse

1. **Le opere vengono prima.** Nessun effetto deve coprire o distorcere un'opera nella vista di dettaglio.
2. **Usa solo i token** definiti in `docs/DESIGN.md` (colori, font, spaziature, durate, easing). Niente valori "a occhio" nei componenti.
3. **Scuro caldo + un accento.** L'arancio neon si usa con parsimonia (max un elemento pieno per schermata). I colori dell'illustrazione restano dentro l'header.
4. **Motion con criterio:** ogni animazione rispetta `prefers-reduced-motion` e ha un fallback statico. Fuori dall'header niente si muove da solo.
5. **Performance:** LCP < 2,5 s su mobile 4G, header JS < 150 KB gzip, immagini sempre responsive (AVIF/WebP).
6. **Lingua:** contenuti in italiano come lingua principale, inglese come seconda lingua. Codice, commenti e nomi in inglese.
7. **Mobile first**, con layout pensato anche per schermi grandi (il desktop è la vetrina).
8. **Quando una decisione cambia**, aggiorna il documento relativo e annotala in `docs/DECISIONS.md` nello stesso commit.
9. **L'header resta fedele all'illustrazione di riferimento.** Si cambia la scena solo su richiesta; ogni ritocco si controlla contro il riferimento (vedi `header/README.md`).
10. **L'immagine di riferimento non entra nel repository**, che è pubblico: `header/ref/` e `header/out/` restano ignorati da git. Si pubblicano solo i vettori ricalcati.
11. **Prima se ne parla.** Non si comincia a costruire una parte nuova del sito senza un via libera esplicito del committente.

## Stato

Fase 1: l'header animato in SVG è pronto in anteprima (`header/dist/preview.html`) e aspetta l'approvazione del committente.
Tutto quello che l'anteprima mostra sotto l'header è segnaposto.
Prossimo passo, dopo l'approvazione: il sito vero (galleria, menu, shop fittizio) nello stesso stile, vedi `docs/CONTENT.md` e `docs/TECH.md`.
