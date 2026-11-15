# Interfaccia: il foglio sul tavolo

Idea del committente (2026-11-15). Sostituisce l'header animato "Lo sguardo".

## Concept

Il sito è la vista dall'alto di un tavolo chiaro. Al centro c'è un foglio: è l'interfaccia.
Dal bordo alto, dietro il menu, spuntano la testa e le braccia dell'artista, chino sul suo disegno: il ritratto di un gatto, un pelo alla volta.
L'artista lavora solo al suo disegno: non tocca e non copre gli elementi dell'interfaccia (richiesta del committente, 2026-11-15). I segni a matita dell'interfaccia si tracciano da soli.

## Il set

| Elemento | Dove | Note |
|---|---|---|
| Tavolo | sfondo fisso | legno chiarissimo, venature appena accennate; tazza, matite e gomma solo se il margine supera 120 px |
| Foglio | al centro, scorre con la pagina | contiene tutto il contenuto, testo vero |
| Artista | fisso sul bordo alto, al centro della testata | testa con capelli ricci corti e cuffie, felpa, due braccia di lunghezza fissa con i gomiti piegati verso l'esterno; movimenti lenti e meticolosi |
| Disegno dell'artista | sotto le sue mani, appartiene alla pagina | ritratto realistico di un gatto tigrato a grafite: occhi, naso e bocca, poi il pelo a zone dagli occhi verso l'esterno, baffi per ultimi. La pagina si apre con il ritratto a metà |

Il disegno dell'artista:

- Resta al suo posto sulla pagina: scorre con essa e le mani lo seguono per un tratto breve.
- Quando scorrendo finirebbe sotto l'artista, è lui a metterlo via; poi tiene le mani sulla scrivania, vicino a sé. Tornando in cima lo riprende e continua.
- Nella galleria è messo via.
- Finito un ritratto, lo mette via e ne comincia un altro su un foglio nuovo.

## Segni dell'interfaccia

Tratti di matita che si tracciano da soli, senza la mano.

| Gesto | Cosa compare | Durata |
|---|---|---|
| Passaggio su un link | a caso tra sottolineatura, doppia riga, cerchio, freccia, tratteggio; mai due volte uguale | `--d-mark` |
| Passaggio su un pulsante | seconda cornice sfalsata | `--d-press` |
| Pressione di un pulsante | tratteggio rapido | `--d-press` |
| Menu (schermi piccoli) | le voci scritte una dopo l'altra | `--d-menu` |
| Cambio lingua | barra la lingua non attiva, riscrive il titolo | 120 ms + `--d-write` |
| Cambio pagina | la pagina si cancella da sinistra, poi titolo scritto e cornici tracciate | ≤ `--d-page` |
| Focus da tastiera | riquadro a mano | 160 ms |

Regole:

- Il contenuto è sempre vero HTML ed è usabile subito: nessun clic aspetta un'animazione.
- La voce di menu attiva ha un cerchio rosso: è l'unico elemento rosso della schermata.
- Con `prefers-reduced-motion` tutto cambia all'istante, le mani restano ferme e il ritratto è già finito.

Testata: firma a sinistra, al centro lo spazio per l'artista, a destra le voci del menu in colonna e IT/EN. Sotto i 1240 px il menu diventa un pulsante. Sui telefoni firma e menu stanno in una riga sotto il disegno, perché accanto alle braccia non c'è spazio.

## Galleria

Unica vista diversa: il foglio si riduce alla sola testata e sul tavolo compare la pila di disegni.

- Si sfoglia trascinando (dito o mouse), toccando i lati del foglio, con le frecce disegnate o con ← →.
- Durante il trascinamento solo l'angolo in basso a destra si arriccia; superata la soglia il foglio scivola oltre il bordo sinistro in prospettiva. Indietro: rientra e si distende.
- Il disegno a riposo è piatto e intero (regola fissa 1).
- WebGL; senza WebGL i fogli cambiano senza ricciolo.

## Figure

Mani e testa sono ricalcate a linea centrale dai disegni di riferimento del committente (`ref/`, fuori dal repository) con `tools/trace/`. I capelli ricci e l'archetto delle cuffie sono generati. Le maniche sono disegnate a codice: braccio e avambraccio di lunghezza fissa, con le pieghe del gomito. Il ritratto del gatto è generato (`site/js/doodle.js`): una mappa di toni resa con migliaia di tratti corti che seguono il verso del pelo.

## Da verificare

- Solo Chromium è stato provato. Safari, Firefox e telefoni veri no.
- Le braccia si allungano oltre il naturale per raggiungere i punti lontani: da giudicare in movimento.
