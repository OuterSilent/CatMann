# CatMann — sito di Cosmin Mann

Sito portfolio per l'artista **Cosmin Mann** (Instagram `@cosmin_mann`): presenta l'artista e le sue opere.
Il pezzo forte è un **header animato** d'impatto.

## Leggi prima di lavorare

| File | Cosa contiene |
|---|---|
| [docs/ARTIST.md](docs/ARTIST.md) | Chi è l'artista, cosa fa, il suo immaginario. È la fonte di verità sul tono. |
| [docs/DESIGN.md](docs/DESIGN.md) | Design system: palette, tipografia, griglia, componenti, motion. |
| [docs/HEADER.md](docs/HEADER.md) | Specifica dell'header animato (concept, fasi, interazione, fallback). |
| [docs/CONTENT.md](docs/CONTENT.md) | Mappa del sito, sezioni, testi segnaposto, struttura dei dati delle opere. |
| [docs/TECH.md](docs/TECH.md) | Stack, struttura delle cartelle, performance, accessibilità, deploy. |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Registro delle decisioni prese e di quelle aperte. |

## Regole fisse

1. **Le opere vengono prima.** Nessun effetto deve coprire o distorcere un'opera nella vista di dettaglio.
2. **Usa solo i token** definiti in `docs/DESIGN.md` (colori, font, spaziature, durate, easing). Niente valori "a occhio" nei componenti.
3. **Monocromo + un accento.** Il rosso vinile si usa con parsimonia (max un elemento rosso per schermata).
4. **Motion con criterio:** ogni animazione rispetta `prefers-reduced-motion` e ha un fallback statico.
5. **Performance:** LCP < 2,5 s su mobile 4G, header JS < 150 KB gzip, immagini sempre responsive (AVIF/WebP).
6. **Lingua:** contenuti in italiano come lingua principale, inglese come seconda lingua. Codice, commenti e nomi in inglese.
7. **Mobile first**, con layout pensato anche per schermi grandi (il desktop è la vetrina).
8. **Quando una decisione cambia**, aggiorna il documento relativo e annotala in `docs/DECISIONS.md` nello stesso commit.

## Stato

Fase 0: documentazione. Nessun codice ancora. Prossimo passo: scaffolding (vedi `docs/TECH.md`) e header.
