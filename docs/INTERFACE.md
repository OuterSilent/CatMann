# Interfaccia: il foglio sul tavolo

Idea del committente (2026-11-15). Sostituisce l'header animato "Lo sguardo".

## Concept

Il sito è la vista dall'alto di un tavolo chiaro. Al centro c'è un foglio: è l'interfaccia.
Dal bordo basso spuntano la testa e le braccia dell'artista, che (ri)disegna a matita ogni parte del sito quando la tocchi.
Tratti fini, molta carta, un gatto piccolo in un angolo.

## Il set

| Elemento | Dove | Note |
|---|---|---|
| Tavolo | sfondo fisso | legno chiarissimo, venature appena accennate; tazza, matite e gomma solo se il margine supera 120 px |
| Foglio | al centro, scorre con la pagina | contiene tutto il contenuto, testo vero |
| Artista | fisso sul bordo basso | testa con capelli ricci corti e cuffie, felpa, due braccia; scala in base allo schermo |
| Foglietto | fisso accanto alla mano destra | scarabocchio generativo, diverso a ogni visita |
| Gatto | fisso in alto a destra | dorme; alza la testa a ogni cambio pagina o al clic |

## Ridisegni

Ogni gesto è un tratto di matita la cui punta coincide con la punta della matita dell'artista.

| Gesto | Cosa disegna | Durata |
|---|---|---|
| Passaggio su un link | a caso tra sottolineatura, doppia riga, cerchio, freccia, tratteggio; mai due volte uguale | `--d-mark` |
| Passaggio su un pulsante | seconda cornice sfalsata | `--d-press` |
| Pressione di un pulsante | tratteggio rapido | `--d-press` |
| Menu (schermi piccoli) | le voci scritte una dopo l'altra | `--d-menu` |
| Cambio lingua | barra la lingua non attiva, riscrive il titolo | 120 ms + `--d-write` |
| Cambio pagina | passata di mano o gomma, poi titolo scritto e cornici tracciate | ≤ `--d-page` |
| Focus da tastiera | riquadro a mano | 160 ms |
| Nessun gesto | scarabocchio sul foglietto | continuo |

Regole:

- Il contenuto è sempre vero HTML ed è usabile subito: nessun clic aspetta un'animazione.
- La voce di menu attiva ha un cerchio rosso: è l'unico elemento rosso della schermata.
- Con `prefers-reduced-motion` tutto cambia all'istante, le mani restano ferme e lo scarabocchio è statico.

## Galleria

Unica vista diversa: il foglio si riduce alla sola testata e sul tavolo compare la pila di disegni.

- Si sfoglia trascinando (dito o mouse), toccando i lati del foglio, con le frecce disegnate o con ← →.
- Durante il trascinamento solo l'angolo in basso a destra si arriccia; superata la soglia il foglio scivola oltre il bordo sinistro in prospettiva. Indietro: rientra e si distende.
- Il disegno a riposo è piatto e intero (regola fissa 1).
- WebGL; senza WebGL i fogli cambiano senza ricciolo.

## Figure

Mani, testa e gatto sono ricalcati a linea centrale dai disegni di riferimento del committente (`ref/`, fuori dal repository) con `tools/trace/`. I capelli ricci e l'archetto delle cuffie sono generati. Le maniche sono tubi disegnati a codice, così le braccia arrivano ovunque.

## Da verificare

- Solo Chromium è stato provato. Safari, Firefox e telefoni veri no.
- Le braccia si allungano oltre il naturale per raggiungere i punti lontani: da giudicare in movimento.
