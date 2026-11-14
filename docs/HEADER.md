# Header animato — "L'artista e il gatto"

L'header è la firma del sito. È un'illustrazione low poly animata: Cosmin, cuffie e occhiali scuri, disegna un gatto a matita
al tavolo di un locale; accanto a lui il gatto vero non sta fermo. Sta in cima alla home, da bordo a bordo, e sotto comincia subito la galleria.

Sostituisce il concept "Lo sguardo" del 13/11/2026 (vedi `DECISIONS.md`). Come è costruito e come si rifà: [`header/README.md`](../header/README.md).

## La scena

Ricalcata dall'illustrazione di riferimento fornita dal committente (2171 × 724 px, non pubblicata nel repository), pezzo per pezzo:

- **Sfondo** leggermente fuori fuoco: vetrata al tramonto, sagome dei clienti, lampade, cassa acustica, mensola, stampe alla parete.
- **Neon** a forma di battito cardiaco sulla parete di destra.
- **L'artista:** busto con felpa, braccio destro in tre pezzi (spalla, avambraccio, mano con la penna), mano sinistra appoggiata sul foglio, testa.
- **Il gatto** sul tavolo a destra: corpo, testa, coda, zampa anteriore.
- **Tavolo** con foglio, tazza fumante, stampe, pennarelli, pila di libri.
- **Primo piano** fuori fuoco: pianta a sinistra, macchina fotografica.

## Cosa succede

Il ciclo dura circa 65–70 secondi e poi ricomincia con un foglio pulito.

| Chi | Cosa fa |
|---|---|
| **Artista** | Disegna un muso di gatto in 27 tratti: le due linee di costruzione, orecchie e contorno, occhi e pupille, naso e bocca, il tratteggio delle ombre e per ultimi i baffi. La penna segue ogni tratto. Respira, muove la testa a tempo (92 bpm, il doppio del battito del neon), ogni tanto alza lo sguardo sul modello. |
| **Gatto** | Segue la penna con la testa, muove la coda, sbatte le palpebre ogni 2,5–6 s. |
| **Ambiente** | Il neon pulsa (un battito ogni 1,3 s) e un lampo corre lungo la traccia; il vapore sale dalla tazza. |

Il primo comportamento del gatto arriva dopo 5–7 secondi; poi ne parte uno nuovo 6,5–10 secondi dopo la fine del precedente, sempre al termine di un tratto.
Escono a giri di tre, in ordine casuale: in ogni giro ciascuno compare una volta.

| Comportamento | Sequenza | Durata |
|---|---|---|
| **Osserva** (`observe`) | Si sporge verso il foglio, inclina la testa da una parte e dall'altra, torna a posto. L'artista continua a disegnare. | 5–6 s |
| **Chiede attenzioni** (`attention`) | Si strofina due volte contro l'avambraccio e alza lo sguardo. L'artista solleva la penna, si gira, lo accarezza tre volte dalla testa verso la schiena; il gatto chiude gli occhi. Poi tutti e due tornano al lavoro. | ~9 s |
| **Disturba** (`disturb`) | Punta il foglio, allunga una zampa sull'angolo e lo tira due volte. L'artista si ferma, fa scivolare la mano sinistra sotto il muso del gatto, gli riaccompagna la zampa al suo posto e raddrizza il foglio. Il gatto guarda altrove, offeso, con la coda che frusta. | ~7 s |

A disegno finito l'artista e il gatto lo guardano per un paio di secondi, la mano sinistra liscia il foglio e la pagina torna bianca.

## Interazione

- **Puntatore (mouse):** leggero effetto di profondità. Lo sfondo scorre contro il puntatore, pianta e macchina fotografica lo seguono. Niente su touch.
- **Scroll:** mentre l'header esce, sfondo e primo piano si separano di qualche pixel.
- **Tocco o clic sul gatto:** se è libero, parte "chiede attenzioni" (6 volte su 10) oppure "disturba". È un pulsante vero, raggiungibile da tastiera.
- **Pausa:** pulsante in basso a destra dell'illustrazione, ferma tutto e fa ripartire.
- **Da codice:** `hero.dispatchEvent(new CustomEvent('cm:act', { detail: 'observe' | 'attention' | 'disturb' }))` mette in coda un comportamento.
  La pagina di anteprima lo usa per i tre pulsanti di prova.

## Formati

L'illustrazione è larga 2171 "unità" e alta 724. Tutto è impaginato in unità (`--u`), quindi si ridisegna nitido a ogni dimensione.

| Larghezza | Comportamento |
|---|---|
| ≥ 1020 px | Panorama intero, proporzione 3:1. |
| 425–1019 px | Altezza fissa di 340 px: l'inquadratura parte da artista e gatto e si allarga con lo schermo fino al panorama intero. |
| < 425 px (telefoni in verticale) | Formato 5:4, alto l'80% della larghezza: artista, foglio e muso del gatto. Si vedono 905 unità su 2171, la coda e il neon restano fuori. |

Su un telefono da 390 px l'header è alto 312 px. Su uno schermo basso (telefono in orizzontale) non supera il 72% dell'altezza e torna a mostrare quasi tutto il panorama.

Esiste un secondo formato per schermi stretti, più basso ma con il gatto intero: `data-cm-frame="wide"` sul blocco dell'header
lo porta al 56% della larghezza (218 px a 390 px), con artista e gatto per intero. La pagina di anteprima ha un interruttore per provarli entrambi.

> **Aperto:** il committente ha chiesto un formato "più portrait" su smartphone. Il 5:4 è la proposta; resta da scegliere tra questo e la scena intera.
> Un header ancora più verticale richiede di estendere l'illustrazione in altezza o di far muovere l'inquadratura tra artista e gatto.

## Fallback e accessibilità

| Condizione | Comportamento |
|---|---|
| `prefers-reduced-motion` | Immagine ferma con il disegno già finito; neon acceso senza pulsare; nessun pulsante di pausa. |
| JS disabilitato o in errore | La scena è HTML e SVG in linea: si vede intera, ferma, con il foglio bianco. |
| Header fuori dallo schermo o scheda nascosta | L'animazione si ferma (`IntersectionObserver`, `visibilitychange`) e riprende al ritorno. |

- Descrizione per screen reader in un paragrafo nascosto dentro l'header; i singoli SVG sono `aria-hidden`.
- Il titolo `h1` della pagina sta fuori dall'header, nel testo sotto.
- Pausa e gatto sono `button` con etichetta; il focus è visibile.

## Vincoli e misure

- Nessuna dipendenza a runtime: HTML + CSS + un file JS.
- Peso attuale: markup dell'header 630 KB (179 KB gzip), JS 30 KB (9 KB gzip), CSS 5 KB. Il limite di 150 KB gzip per il JS è rispettato con largo margine;
  il markup è il costo vero e va servito compresso.
- L'header è nell'HTML: è lui il primo paint, senza immagini da aspettare.
- Si muovono solo trasformazioni e opacità di livelli già disegnati. In Chromium senza GPU: 60 fps a 1440 px e su telefono (390 px a 3x), qualche fotogramma a 30 fps a 1920 px.
- Fedeltà al riferimento, in posa di riposo: errore medio assoluto 3,2 su 255 per canale (foglio escluso, perché nell'header parte bianco).
- Provato solo in Chromium. Safari e Firefox sono da verificare su dispositivi veri.

## Limiti noti

- La mano sinistra "si gira" con un ribaltamento: si stringe fino a un terzo e in un fotogramma passa dall'altra parte del polso.
- La zampa che si allunga è disegnata a mano (due facce, con i colori del tratto di zampa che si vede nell'illustrazione): è più semplice del resto del gatto.
- Il foglio si pulisce con una dissolvenza sotto la mano, non c'è un vero cambio pagina.
- Il nome in alto e la firma nel footer dell'anteprima sono composti con un font: segnaposto in attesa del vettoriale della firma.
