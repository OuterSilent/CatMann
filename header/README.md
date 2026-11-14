# Header animato

L'header della home: Cosmin disegna un gatto e il gatto vero, accanto a lui, osserva, chiede coccole o disturba.
È un'illustrazione vettoriale ricalcata dall'immagine di riferimento e animata "a ritaglio": ogni pezzo che si muove è un SVG in linea,
spostato con trasformazioni CSS. A runtime non ci sono dipendenze.

Cosa deve fare, come si adatta agli schermi e cosa succede senza animazioni è scritto in [`docs/HEADER.md`](../docs/HEADER.md).
Qui c'è come è costruito.

## Cosa c'è in questa cartella

| Cartella | Contenuto |
|---|---|
| `dist/` | Quello che usa il sito: `hero.html` (il blocco dell'header), `hero.css`, `hero.js`. `preview.html` è la pagina di prova completa e si apre con un doppio clic. |
| `build/` | Monta l'header a partire dai vettori: `build.py` (assemblaggio e punti di snodo), `drawing.py` (il disegno a matita che compare sul foglio), `hero.css`, `runtime.js` (l'animazione), `preview.py` (la pagina di prova). |
| `data/` | L'illustrazione ricalcata: un file `vec_<pezzo>.json` per ognuno dei 16 pezzi, più `lights.json` con le lampade dello sfondo. La genera `pipe/`. |
| `pipe/` | Dal riferimento ai vettori: maschere dei pezzi, livelli, ricalco. Serve solo per rifare `data/`. |
| `tools/` | Controlli con Playwright: pose, formati, movimento ridotto, prestazioni, pagina di prova. |

Non sono nel repository, che è pubblico: `ref/` (l'immagine di riferimento), `out/` (ritagli e file intermedi) e `view/` (screenshot dei controlli).

## Usarlo in una pagina

```html
<link rel="stylesheet" href="hero.css">
<!-- qui il contenuto di hero.html: un <div class="cm-hero" data-cm-hero> -->
<script src="hero.js" defer></script>
```

- Un solo header per pagina. Il blocco è largo quanto il contenitore: va messo fuori dai margini della pagina, da bordo a bordo.
- Lo script parte da solo. Con `prefers-reduced-motion` lascia l'immagine ferma sul disegno finito.
- Per far partire un comportamento del gatto: `hero.dispatchEvent(new CustomEvent('cm:act', { detail: 'attention' }))`
  (`observe`, `attention` o `disturb`). Parte alla fine del tratto in corso.
- Su schermi stretti l'header è in formato 5:4 e inquadra artista, foglio e muso del gatto. Con `data-cm-frame="wide"` sul blocco
  diventa più basso e mostra la scena intera.
- L'attributo `data-cm-manual` sul blocco impedisce l'avvio automatico: lo usano i controlli, che pilotano le pose con `window.__cm`.

## Ricostruire l'header

Serve Python 3 con i pacchetti di `requirements.txt`.

```sh
pip install -r header/requirements.txt
cd header/build
python3 build.py      # data/ -> dist/hero.html, hero.css, hero.js (+ le pagine di prova test.html e test_manual.html, non versionate)
python3 preview.py    # dist/preview.html
```

`dist/` è versionato: dopo ogni modifica in `build/` o `data/` va rifatto il build e committato anche `dist/`.

### Come si muove

- `build.py` mette ogni pezzo in un nodo HTML (`<div class="n" data-n="...">`) e passa a `runtime.js` il "rig": snodi, punti di presa, tratti del disegno.
- Le misure sono in unità di scena (2171 × 724). `hero.css` definisce `--u`, la lunghezza di un'unità, e impagina tutto con quella:
  i livelli vengono disegnati alla dimensione a cui si vedono, senza ingrandimenti a posteriori.
- `runtime.js` tiene uno stato (`S`: penna, testa, mano sinistra, gatto, foglio), lo anima con interpolazioni e a ogni fotogramma lo traduce in matrici.
  Un "regista" fa avanzare il disegno tratto per tratto e, tra un tratto e l'altro, lancia i comportamenti del gatto.
- Braccio destro, zampa e manica del braccio sinistro sono calcolati: l'avambraccio segue la penna, la zampa si allunga dal petto fino a dove arriva,
  la manica segue la mano che accarezza o che sposta la zampa.
- I pezzi si sovrappongono nell'ordine in cui sono scritti. Dalla testa del gatto in poi hanno un livello (`z2`–`z4` in `hero.css`):
  così la mano sinistra passa sopra la testa quando accarezza e sotto (`cm-under`) quando va a prendere la zampa.

## Rifare il ricalco

Serve solo se cambia l'illustrazione o il modo di tagliarla. Ci vuole l'immagine di riferimento in `header/ref/reference.png` (2171 × 724 px).

```sh
cd header/pipe
python3 masks.py      # 1.  maschere dei pezzi in movimento: contorni tracciati a mano (rough.py) e agganciati ai bordi dell'immagine
python3 masks2.py     # 1b. maschere dei livelli di profondità: pianta, macchina fotografica, tazza, tavolo
python3 lights.py     # 1c. le lampade dello sfondo come pile di contorni -> out/lights.json
python3 layers.py     # 2.  un'immagine per pezzo, con i bordi puliti e il riempimento delle zone nascoste dagli altri pezzi
python3 trace.py      # 3.  ricalco vettoriale di ogni livello -> out/vec_<pezzo>.json
python3 publish.py    # 4.  copia i vettori finiti in data/
```

Tutto il giro dura circa tre minuti e rigenera `data/` identico, byte per byte.

Due ricalcatori, scelti pezzo per pezzo in `trace.py`:

- **`ptrace.py`**, scritto apposta: riduce il livello a una tavolozza di toni, unisce le regioni separate solo da una sfumatura,
  aggancia i confini ai bordi veri dell'immagine e dà alle sfaccettature un colore pieno o un gradiente a due stop.
  Si usa per lo sfondo sfocato e per la felpa (toni scuri vicinissimi tra loro, ricalcati su un ingrandimento 3x).
- **vtracer** (poligoni impilati) per i pezzi a bordi netti: testa, mani, gatto, oggetti. Dopo il ricalco i contorni vengono semplificati,
  rifilati lungo la sagoma (`unpeek`, per non far spuntare un filo del colore sbagliato) e ricolorati con il colore vero dell'immagine (`recolour`).

Il foglio, il disegno a matita, il neon, il vapore, le palpebre e i baffi del gatto non vengono dal ricalco: sono disegnati in `build.py` e `drawing.py`.

## Controlli

Usano Playwright (`npm i playwright`, poi `npx playwright install chromium`). Gli screenshot vanno in `view/`.

```sh
cd header/tools
# posa di riposo a grandezza naturale, poi confronto con il riferimento
node pose.cjs ../view/rest.png "__cm.freeze(); __cm.ink(27); __cm.S.tailAmp=0; __cm.S.track=0; __cm.set({}, 0)" 2171 724
(cd ../pipe && python3 cmpref.py ../view/rest.png ../view/rest_err.png)

node responsive.cjs ../view/phone.png 390 844 3    # l'header da solo a una certa finestra: larghezza, altezza, densità
node reduced-motion.cjs ../view/reduced.png        # con movimento ridotto è fermo? la pausa ferma davvero tutto?
node perf.cjs 1440 900 1 6                         # cadenza dei fotogrammi per 6 secondi
node perf.cjs 1440 900 1 13 disturb                # la stessa misura mentre il gatto fa un comportamento (observe, attention, disturb)
node timeline.cjs 120                              # cosa succede e quando, in 120 secondi simulati
node page-check.cjs                                # pagina di prova: pulsanti dei comportamenti, pausa, tocco sul gatto, menu su telefono
node page-shot.cjs ../view/page.png 1440 900 1     # screenshot dell'intera pagina di prova
```

`cmpref.py` confronta con il riferimento escludendo il foglio (nell'header parte bianco) e ha bisogno delle maschere in `out/`, quindi del passo 1 del ricalco.

Valori attuali: errore medio assoluto 3,23 su 255 per canale; 60 fps a 1440 px e a 390 px con densità 3 in Chromium senza GPU.
