# Registro decisioni

Formato: data — decisione — motivo. Le decisioni aperte stanno in fondo.

## Prese

- **2026-11-13** — La firma "Cosmin Mann Art" è il logo. — È già il suo segno distintivo.
- **2026-11-13** — Sito solo in tema scuro. — Identità.
- **2026-11-13** — Italiano lingua principale, inglese seconda.
- **2026-11-14** — Nuovo header "L'artista e il gatto": l'artista disegna un gatto sul foglio e il gatto vero accanto a lui
  osserva, chiede attenzioni (ricambiate con dolcezza) o disturba (e viene scansato con gentilezza). Parte dall'illustrazione
  di riferimento fornita dal committente. — Richiesta del committente. **Sostituisce "Lo sguardo"** (occhi di gatto a grafite che seguono il cursore).
- **2026-11-14** — Tutto il sito nello stile dell'illustrazione (low poly, interno notturno caldo, neon). — Richiesta del committente.
  **Sostituisce "Grafite di notte"** (monocromo con un solo accento rosso `--c-vinyl`) e toglie il divieto di neon.
- **2026-11-14** — Sotto l'header c'è di default la galleria delle opere; il sito ha un menu e un link allo shop dei disegni fisici,
  per ora fittizio. — Richiesta del committente.
- **2026-11-14** — Formati: panorama largo su desktop, inquadratura più verticale su smartphone. — Richiesta del committente, "correggeremo successivamente".
- **2026-11-14** — Header in **SVG**, ricalcato pezzo per pezzo dall'illustrazione e animato a ritaglio; niente 3D né WebGL.
  — Un primo tentativo in 3D (modelli in Blender, resa in Three.js) è stato scartato dal committente: il risultato era lontano
  dall'immagine. La consegna è diventata "riproviamo in SVG, attieniti di più all'immagine".
- **2026-11-14** — L'immagine di riferimento non entra nel repository. Si pubblicano solo i vettori ricalcati (`header/data`). — Il repository è pubblico.
- **2026-11-14** — Si costruisce una parte nuova del sito solo dopo un via libera esplicito del committente. — Regola di lavoro del committente.

## Proposte nell'anteprima, da confermare

- Palette e token di `DESIGN.md` ("Low poly notturno"): fondo `#141112`, carta `#F3DDD0`, accento arancio neon `#FF8A4C`.
- Angoli tagliati al posto degli angoli arrotondati; filetto con il battito nei titoli di sezione.
- La barra del menu sta sopra l'header e non lo copre.
- Su smartphone l'header è in formato 5:4 (312 px di altezza a 390 px di larghezza) e inquadra artista, foglio e muso del gatto.
  In alternativa `data-cm-frame="wide"` mostra la scena intera in un formato più basso (218 px). L'anteprima permette di provarli entrambi.
- Tocco sul gatto: fa partire "chiede attenzioni" o "disturba".
- Il disegno sul foglio è un muso di gatto a sfaccettature, tracciato con i segni larghi e grigio-malva che il foglio ha nell'illustrazione
  di riferimento (dove sono astratti) e steso sul foglio in prospettiva. All'apertura della pagina il contorno è già tracciato.
- A disegno finito il foglio scivola fuori dall'header verso il basso, dove comincia la galleria: il disegno "va" tra le opere.
- Manifesto segnaposto senza prima persona: "Gatti a grafite. Un pelo alla volta."

## Aperte

- **Approvazione dell'header** da parte del committente (anteprima del 14/11/2026).
- Header su smartphone: 5:4 sull'artista e sul muso del gatto, oppure scena intera più bassa? Serve un formato ancora più verticale
  (illustrazione estesa in altezza o inquadratura che si muove)?
- Vettoriale della firma per il logo.
- Stack del sito: Astro proposto in `TECH.md`, da confermare all'avvio.
- Shop: link esterno o vetrina interna; prezzi e disponibilità delle opere.
- Hosting e dominio.
- Commissioni: sezione dedicata sì/no.
- One-page iniziale o sito multipagina da subito.
- Verifica dell'header su Safari e Firefox e su telefoni veri.
