# Lupo Solitario — PWA reader per gamebook

PWA **offline-first** per leggere e giocare i gamebook *Lone Wolf* / Lupo Solitario
(EPUB di [Project Aon](https://www.projectaon.org)) da iPhone, con Action Chart,
inventario, generatore di numeri, helper di combattimento e registro di guerra.

Stack: **Vite + React + TypeScript**, **Tailwind v4**, **react-reader (EpubView)**,
**Dexie** (IndexedDB), **Zustand**, **vite-plugin-pwa** (Workbox).

---

## Comandi

```bash
npm install         # installa le dipendenze
npm run dev         # sviluppo (http://localhost:4200) — il service worker NON è attivo qui
npm run build       # build di produzione (genera anche il service worker)
npm run preview     # serve la build di produzione su http://localhost:4200
```

### Provare l'offline (criterio di completamento)

Il service worker si registra **solo in contesto sicuro** (HTTPS o `localhost`) e
**solo nella build di produzione**:

```bash
npm run build && npm run preview
```

Poi apri `http://localhost:4200`, carica un EPUB, naviga un po', quindi in
DevTools → **Network → Offline** (o spegni la rete) e **ricarica**: l'app si
riapre e funziona, EPUB e salvataggi inclusi (sono in IndexedDB; l'app shell è in
Cache Storage).

---

## Test su iPhone reale

Il service worker richiede **HTTPS** (o `localhost`). Da iPhone hai due strade:

1. **Tunnel HTTPS** verso la tua macchina di sviluppo, es.:
   ```bash
   npm run build && npm run preview   # poi esponi la porta 4200 via un tunnel HTTPS
   ```
   (ngrok, cloudflared, ecc. — il punto è servire la build via HTTPS.)
2. **Deploy su un host statico HTTPS** (Netlify, Vercel, GitHub Pages, …):
   pubblica il contenuto di `dist/`.

### Aggiungere alla schermata Home (installare la PWA)

Su iPhone, in **Safari**: apri il sito → tasto **Condividi** → **Aggiungi a Home**.
Avvia l'app dall'icona: parte in modalità **standalone** (a tutto schermo, con
safe-area per notch/Dynamic Island/home indicator). La **verifica finale va fatta
sull'iPhone reale**: le quirk di `dvh`, safe-area e iframe del reader si vedono solo lì.

> Nota: testa sia in Safari sia come **PWA installata**, in **portrait** (priorità)
> e landscape.

---

## Dati di gioco

- **Combat Results Table (CRT)** — `src/data/crt.ts` è un **TEMPLATE con TODO**:
  i valori NON sono inclusi (provengono dai materiali di Project Aon). Finché non
  la compili, l'helper di combattimento funziona comunque e chiede di inserire i
  danni **a mano**. Per popolarla: apri la CRT dal libro su Project Aon e riempi
  ogni cella `{ lwLoss, enemyLoss }` (usa `K` per la morte istantanea).
- **Discipline Kai** — `src/data/disciplines.ts` (le 10 del Libro 1).

---

## Principio di design: l'utente è l'arbitro

Tutto ciò che è automatizzato è **scavalcabile**. Ogni valore (Endurance, Combat
Skill, oro, inventario, valori del combattimento) è **sempre modificabile a mano**,
anche durante un combattimento. Gli strumenti (generatore, CRT, helper di
combattimento) **propongono**, non impongono: niente game over automatici, niente
flussi che intrappolano. Il combattimento lavora su una **copia**; l'Action Chart
si aggiorna **solo** premendo *"Aggiorna resistenza nel registro"*.

---

## Nota tecnica: EPUB come ArrayBuffer (non blob URL)

L'EPUB caricato è salvato come **Blob** in Dexie. Per darlo al reader si legge il
blob e si passa a `EpubView` come **`ArrayBuffer`**, NON come `URL.createObjectURL`.
Motivo: epub.js deduce il tipo di input dall'**estensione dell'URL**, e un blob URL
(`blob:…/uuid`) non ha estensione → verrebbe trattato come *directory* e il libro
non si caricherebbe mai. Con l'ArrayBuffer epub.js riconosce l'archivio e lo
decomprime (JSZip), restando 100% offline. Vedi `src/hooks/useBookUrl.ts`.
(`URL.createObjectURL` + `revokeObjectURL` resta usato per il download dell'export
JSON, dove è appropriato — `src/utils/saveExport.ts`.)

---

## Struttura

```
src/
  db.ts                 # schema Dexie (books, playthroughs) + default
  store.ts              # stato globale (Zustand) + persistenza su Dexie
  data/crt.ts           # Combat Results Table (TEMPLATE + TODO)
  data/disciplines.ts   # Discipline Kai
  components/
    Library.tsx         # libreria + caricamento EPUB
    Reader.tsx          # wrapper EpubView, MEMOIZZATO (iframe stabile)
    Header.tsx          # barra superiore + action bar inferiore (thumb-zone)
    Sheet.tsx           # sheet full-screen riusabile (mobile-first, safe-area)
    ui.tsx              # Stepper / TextField / EditableList
    panels/             # NumberGenerator, ActionChart, Inventory, WarLog, Combat, GoToSection
  hooks/
    useBookUrl.ts       # blob Dexie -> ArrayBuffer (vedi nota sopra)
    usePersistence.ts   # navigator.storage.persist() + indicatore
  utils/
    combat.ts           # logica di combattimento pura (proposte, storico)
    sections.ts         # indice sezione->href + intercettazione link
    saveExport.ts       # export/import JSON dei salvataggi
    readerControl.ts    # ponte non-reattivo per "vai alla sezione"
  App.tsx, main.tsx, index.css
```

---

## Mobile-first (iPhone)

- Contenitori full-screen con `100dvh` (niente `100vh`: salterebbe con la barra Safari).
- `viewport-fit=cover` + `env(safe-area-inset-*)` su header e barre.
- Target tattili ≥ 44px, input a `font-size: 16px` (niente zoom iOS al focus),
  `inputMode="numeric"` per i campi numerici.
- Pannelli come **sheet a tutto schermo**, chiudibili con il pulsante grande o `Esc`.
- `navigator.storage.persist()` all'avvio (indicatore 🟢/🟡 nell'header) per ridurre
  l'eviction; **export/import JSON** dei salvataggi come rete di sicurezza.
