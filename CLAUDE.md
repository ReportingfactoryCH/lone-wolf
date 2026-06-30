# Lupo Solitario — PWA reader per gamebook (SPEC per Claude Code)

## Obiettivo

Costruire una **PWA offline-first** che permetta di:

1. Caricare un file **EPUB locale** dal dispositivo (es. i gamebook *Lone Wolf* / Lupo Solitario di Project Aon).
2. Leggerlo con un reader EPUB **reflowable** (testo, dark mode, font regolabile).
3. Avere un **header personalizzato** con accesso a: generatore di numeri (Random Number Table), **Action Chart**, **inventario**, **registro di guerra** (war log).
4. Salvare **tutto in locale** (EPUB + stato di gioco) così da poter giocare più volte e **completamente offline** dopo la prima apertura.

Il dispositivo target principale è **iPhone** (PWA installata sulla home), quindi tutte le scelte devono privilegiare la compatibilità Safari/iOS.

---

## Principio di design fondamentale: l'utente è l'arbitro, non l'app

Questo è un vincolo di prodotto che ha **priorità sulla "correttezza" delle regole**. Con il librogame cartaceo, il giocatore era l'unico arbitro: poteva interrompere un combattimento, fuggire, ignorare un risultato sfavorevole, modificare a mano i propri punti, o semplicemente decidere di saltare a un'altra sezione. L'app deve **assistere**, non **imporre**.

Regole concrete che derivano da questo principio (valide ovunque, non solo nel combattimento):

- **Nessun valore è bloccato in modo irreversibile.** Qualsiasi campo dell'Action Chart (Endurance, Combat Skill, oro, inventario...) deve essere sempre modificabile a mano dall'utente, anche in mezzo a un combattimento. Eventuali "blocchi" (es. Combat Skill read-only dopo il tiro iniziale) devono avere sempre un'azione esplicita di sblocco/modifica manuale.
- **Gli strumenti automatici sono suggerimenti, non sentenze.** Generatore di numeri, helper di combattimento e CRT propongono un risultato; l'utente può accettarlo, rifiutarlo, o sovrascriverlo. Niente flusso che "intrappola" l'utente in uno stato finché non completa un'azione.
- **Si può sempre uscire e navigare altrove.** In ogni momento — anche con un combattimento aperto — l'utente deve poter chiudere il pannello, tornare al reader e saltare a un'altra sezione. Lo stato in corso non deve impedire la navigazione.
- **L'app non decide la "morte" o la "vittoria" al posto dell'utente.** Può segnalare che l'Endurance è ≤ 0, ma è l'utente a decidere cosa farne (in molte sezioni un esito a 0 ha conseguenze narrative gestite dal libro, non un game over automatico).

In breve: tutto ciò che è automatizzato deve essere **scavalcabile**. L'app è un foglio di carta intelligente, non un motore di gioco che applica le regole.

---

## Stack tecnico (requirement obbligatori)

- **Vite** (build tool) + **React** + **TypeScript**
- **Tailwind CSS v4** — usare il plugin `@tailwindcss/vite` e `@import "tailwindcss";` nel CSS (NON la vecchia config PostCSS v3). Niente `tailwind.config.js` salvo necessità.
- **react-reader** — usare il componente **`EpubView`** (NON `ReactReader`), perché l'header e la UI devono essere custom. Sotto c'è epub.js.
- **Dexie** — wrapper su IndexedDB per persistenza (EPUB blob + stato di gioco).
- **vite-plugin-pwa** (Workbox) — service worker, manifest, precache dell'app shell. `registerType: 'autoUpdate'`.
- Gestione stato React a scelta (Zustand consigliato per semplicità, oppure Context). Niente Redux.

### Comandi di setup attesi

```bash
npm create vite@latest lupo-solitario -- --template react-ts
cd lupo-solitario
npm i react-reader dexie zustand
npm i -D tailwindcss @tailwindcss/vite vite-plugin-pwa
```

`vite.config.ts` deve includere il plugin Tailwind v4 e vite-plugin-pwa.

---

## Vincoli tecnici CRITICI (da rispettare, sono i punti dove si sbaglia)

1. **Usare `EpubView`, non `ReactReader`.** Vogliamo solo il pannello di rendering centrale; header e navigazione li costruiamo noi.
2. **File locale → blob URL.** L'EPUB caricato dall'utente va salvato come **Blob** in Dexie (un `File` è già un `Blob`). Per darlo al reader: leggere il blob da Dexie → `URL.createObjectURL(blob)` → passarlo come prop `url` a `EpubView`. **Fare `URL.revokeObjectURL` nel cleanup dell'effetto** per non leakare memoria.
3. **Quirk iframe.** epub.js renderizza in un iframe che viene distrutto/ricreato a ogni re-render se non isolato. **Memoizzare** il componente reader (es. `React.memo` / `useMemo`) così che gli aggiornamenti dell'Action Chart non resettino la posizione di lettura.
4. **Niente CDN.** Tutti gli asset (worker, font, ecc.) devono essere bundlati localmente, altrimenti offline si rompe. Nessuna risorsa caricata da rete a runtime.
5. **`navigator.storage.persist()`** va chiamato all'avvio dell'app, per ridurre il rischio che iOS faccia evict dello storage (codice in Cache Storage + dati in IndexedDB).
6. **Contesto sicuro per il SW.** Il service worker si registra solo su HTTPS o `localhost`. Per il test reale su iPhone serve la **build di produzione** servita via HTTPS (o un tunnel). Aggiungere nel README una nota chiara su questo (`npm run build && npm run preview` per test locale; deploy su host HTTPS per uso reale su iPhone).
7. **Export/Import JSON dei salvataggi** come rete di sicurezza contro l'eviction su iOS.
8. **Mobile-first / iPhone come target primario.** L'app è pensata e va sviluppata **prima di tutto per iPhone** (Safari iOS), poi adattata a schermi più grandi. Vedi la sezione dedicata "Design mobile-first (iPhone)" più sotto: è un requisito, non un nice-to-have.

---

## Design mobile-first (iPhone come target primario)

Il dispositivo di riferimento è l'**iPhone** con la PWA installata sulla home. Tutto deve essere progettato e testato **prima** su viewport stretto (~375–430px), poi adattato verso l'alto. Non è "responsive come ripensamento": è mobile-first.

### Layout e viewport
- **Altezza viewport:** NON usare `100vh` per i contenitori a tutto schermo (su iOS Safari include/esclude la barra degli indirizzi e "salta"). Usare `100dvh` (dynamic viewport height) con fallback, o `100svh`/`100lvh` dove serve. Il reader e i pannelli full-screen devono riempire l'altezza senza scrollbar fantasma.
- **Safe areas (notch / Dynamic Island / home indicator):** header e barre fisse devono rispettare `env(safe-area-inset-*)`. Aggiungere `viewport-fit=cover` al meta viewport e usare `padding` con `env(safe-area-inset-top/bottom)` su header e barre inferiori.
- **Header fisso in alto**, compatto, con i pulsanti dei pannelli (🎲 📋 🎒 📜 ⚔️) raggiungibili col pollice. Valutare una barra azioni **in basso** (thumb zone) per le azioni più frequenti durante il gioco: più ergonomica su schermi grandi tipo iPhone Pro Max.
- I pannelli (Action Chart, Inventario, Combattimento, War Log) su mobile sono **full-screen sheet** o **bottom sheet** scorrevoli, non finestrelle desktop. Devono essere chiudibili facilmente (swipe down o pulsante grande).

### Touch e input
- **Target tattili ≥ 44×44px** (linee guida Apple). Niente bottoni minuscoli affiancati.
- **Niente zoom indesiderato sugli input:** gli `<input>`/`<textarea>` devono avere `font-size: 16px` minimo, altrimenti iOS zooma in automatico al focus. (NON disabilitare lo zoom con `user-scalable=no`: è anti-accessibilità; risolvere col font-size.)
- **Evitare hover-only:** nessuna funzione deve dipendere dall'hover. Stati attivi/pressed chiari per il tocco.
- Campi numerici dell'Action Chart e del combattimento: usare `inputMode="numeric"` per far comparire il tastierino, e stepper +/- con target ampi (si modificano spesso al volo).

### Reader su mobile
- epub.js in flow **scrolled**, testo reflowable, font e interlinea regolabili. Larghezza di lettura comoda con padding laterale.
- Attenzione al **bounce/overscroll** di iOS dentro l'iframe del reader: testare che lo scroll del testo non trascini tutta la pagina. Usare `overscroll-behavior: contain` dove opportuno.
- Dark mode applicata al rendition (lettura serale).

### PWA installata su iOS — dettagli
- Manifest `display: 'standalone'`, `theme_color` e `background_color` coerenti (in standalone iOS usa questi per le barre di sistema).
- Fornire le icone e la **apple-touch-icon**; una **splash screen** iOS è gradita ma opzionale.
- Testare in modalità installata (Aggiungi a Home): il comportamento di viewport, safe-area e standalone differisce dal Safari normale.

### Come testare (da mettere nel README)
- DevTools desktop in emulazione iPhone per il grosso del lavoro, ma **verifica finale obbligatoria sull'iPhone reale** (le quirk di `dvh`, safe-area e iframe si vedono solo lì).
- Provare sia in Safari sia come **PWA installata**, in portrait (priorità) e landscape.

---

## Modello dati (Dexie)

```ts
// db.ts
import Dexie, { type Table } from 'dexie';

export interface BookRecord {
  id?: number;
  title: string;
  blob: Blob;          // l'EPUB, non indicizzato
  addedAt: number;
}

export interface Playthrough {
  id?: number;
  bookId: number;
  name: string;        // nome dello slot di salvataggio
  currentLocation: string | null;  // CFI di epub.js
  actionChart: ActionChart;
  activeCombat: CombatState | null; // combattimento in corso (sopravvive all'uscita dal pannello)
  warLog: WarLogEntry[];
  updatedAt: number;
}

export interface CombatState {
  enemyName: string;
  // valori CORRENTI dei combattenti (sempre editabili a mano)
  lwEndurance: number;
  lwCombatSkill: number;
  enemyCombatSkill: number;
  enemyEndurance: number;
  lwBonus: number;          // modificatori temporanei al Combat Ratio
  history: CombatLogEntry[]; // storico-diario, sola lettura (vedi sotto)
  open: boolean;            // l'utente non l'ha ancora chiuso esplicitamente
}

// Ogni evento dello scontro produce una riga nello storico.
// Lo storico è un DIARIO append-only: non si "rewinda", si legge.
// Per rifare parte dello scontro l'utente corregge a mano i valori correnti.
export type CombatLogEntry =
  | { kind: 'start'; ts: number; importedFromChart: boolean; note?: string }
  | { kind: 'round'; ts: number; randomNumber: number | null; combatRatio: number;
      lwLoss: number; enemyLoss: number; lwAfter: number; enemyAfter: number; note?: string }
  | { kind: 'manual'; ts: number; target: 'lw' | 'enemy';
      field: 'endurance' | 'combatSkill'; from: number; to: number; note?: string }
  | { kind: 'evade'; ts: number; lwLoss: number; toSection?: string; note?: string }
  | { kind: 'sync'; ts: number; note?: string } // "Aggiorna resistenza nel registro"
  | { kind: 'end'; ts: number; outcome: 'won' | 'fled' | 'lw-down' | 'closed'; note?: string };

export interface ActionChart {
  combatSkill: number;          // fisso una volta tirato (10 + 0..9)
  endurance: { current: number; max: number };  // 20 + 0..9
  kaiDisciplines: string[];     // 5 nel libro 1, +1 per libro successivo
  weapons: string[];            // max 2
  backpack: string[];           // max 8 (i pasti contano come 1 slot ciascuno)
  specialItems: string[];       // lista separata, no limite fisso
  goldCrowns: number;           // Belt Pouch, max 50
  meals: number;
}

export interface WarLogEntry {
  ts: number;
  type: 'navigation' | 'combat' | 'roll' | 'note';
  text: string;
}

export class GameDB extends Dexie {
  books!: Table<BookRecord, number>;
  playthroughs!: Table<Playthrough, number>;
  constructor() {
    super('lupo-solitario');
    this.version(1).stores({
      books: '++id, title, addedAt',
      playthroughs: '++id, bookId, updatedAt',
    });
  }
}
export const db = new GameDB();
```

---

## Funzionalità

### 1. Libreria / caricamento EPUB
- Schermata iniziale con la lista dei libri salvati (da `db.books`).
- Pulsante "Carica EPUB" → `<input type="file" accept=".epub,application/epub+zip">`.
- Al caricamento: salvare il `File` come `blob` in `db.books`, poi mostrarlo nella libreria.
- Tap su un libro → apre il reader con l'ultimo playthrough, o ne crea uno nuovo.

### 2. Reader (EpubView)
- Componente `Reader` che riceve `bookId` e `playthroughId`.
- Legge il blob da Dexie → `createObjectURL` → `EpubView url={blobUrl}`.
- `location` controllato e `locationChanged` che **persiste il CFI** nel playthrough (debounce ~500ms per non scrivere a ogni scroll).
- `getRendition` per ottenere l'oggetto rendition (serve per i link interni, sotto).
- Flow **scrolled** / reflowable. Dark mode toggle che applica un tema al rendition.

### 3. Header personalizzato (sempre visibile sopra il reader)
Barra con pulsanti che aprono pannelli (modal o drawer):
- 🎲 **Genera numero** (Random Number Table)
- 📋 **Action Chart**
- 🎒 **Inventario**
- 📜 **Registro di guerra**
- ⚔️ **Combattimento**

### 4. Generatore di numeri (Random Number Table)
- Lupo Solitario **non usa dadi**: si estrae **una singola cifra 0–9**. Implementare con `Math.floor(Math.random() * 10)`.
- Animazione breve di "estrazione" prima di mostrare il risultato.
- Ogni estrazione viene loggata nel war log (`type: 'roll'`).

### 5. Action Chart + Inventario
Pannello editabile con tutti i campi di `ActionChart`. **Tutto è sempre modificabile a mano, in qualunque momento, con quello che scrive l'utente** (vedi "Principio di design fondamentale"). I "vincoli" sotto sono **soft**: l'app può evidenziarli o avvisare, ma NON deve mai impedire all'utente di inserire un valore fuori limite. Sono guide, non gabbie.

- **Combat Skill**: di default impostato una volta (10 + numero 0–9), ma deve avere sempre un'azione di **modifica manuale** per cambiarlo dopo (mai read-only definitivo).
- **Endurance**: corrente e max modificabili a mano. Può scendere (combattimento) o **salire** (es. pozione che ridà punti) digitando il valore. L'app può segnalare se ≤ 0, senza forzare alcun "game over".
- **Weapons / Backpack / Special Items / Gold Crowns / Meals**: liste e numeri **liberamente editabili** — aggiungi, rimuovi, rinomina ogni voce a mano in qualsiasi momento. I limiti classici (2 armi, 8 oggetti zaino, 50 corone) sono mostrati come riferimento/avviso ma **non bloccano** l'inserimento: l'utente decide.

Tutto persiste in tempo reale sul playthrough. Nessuna dinamica automatica: l'app non aggiunge, rimuove o modifica voci da sola in risposta ad altri eventi (combattimento, navigazione, ecc.) — ogni cambiamento dell'Action Chart parte da un'azione esplicita dell'utente.

### 6. Helper di combattimento
Il pezzo più utile da automatizzare. **Ma è un assistente, non un giudice** (vedi "Principio di design fondamentale"): propone i calcoli, l'utente resta sempre libero di scavalcarli, fermarsi o andarsene.

**Modello mentale: lo scontro lavora su una COPIA, il registro si tocca solo su comando.**
Il combattimento opera su una propria copia locale dei valori di LW (Endurance, Combat Skill) — il `CombatState`. L'Action Chart (il "registro") NON viene modificata automaticamente da nessun evento di combattimento. La sincronizzazione avviene **esclusivamente** quando l'utente preme un pulsante esplicito. Questo permette di sperimentare durante la battaglia (pozioni, bonus, correzioni, errori) senza intaccare il personaggio finché non si decide di consolidare.

**Avvio: pulsante "Nuovo Combattimento".**
- Avvia uno scontro pulito.
- All'avvio chiede se **importare i dati dal registro** (Endurance corrente e Combat Skill di LW dall'Action Chart). È un'opzione offerta, non un automatismo: l'utente può importarli o inserirli a mano da zero.
- Poi chiede i dati del nemico (nome, Combat Skill, Endurance), anch'essi modificabili in qualsiasi momento.

**Durante lo scontro — tutto modificabile a mano, sempre:**
- Endurance e Combat Skill di **LW** restano editabili a mano in ogni momento. Esempio d'uso reale: durante lo scontro bevo una pozione → aggiungo a mano i punti Endurance, senza che l'app applichi nulla in automatico.
- Endurance e Combat Skill del **nemico** idem.
- L'utente può aggiungere/togliere punti liberamente, indipendentemente dai round.

**Fine round: pulsante "Aggiorna resistenza nel registro".**
- A ogni fine round (e comunque quando l'utente vuole) un pulsante **ricopia l'Endurance corrente dello scontro nell'Action Chart**. Solo su click. Mai in automatico.
- Vale come "consolida lo stato attuale nel personaggio". Utile per non perdere il progresso se poi si chiude lo scontro.

**Storico-diario dello scontro (sola lettura, append-only).**
- Lo scontro tiene uno **storico visibile** di tutto ciò che accade: avvio, ogni round (numero estratto, Combat Ratio, danni, valori risultanti), fughe, sync col registro, fine. Vedi `CombatLogEntry`.
- **Non è una macchina del tempo**: non si "rewinda". È un diario che si legge. Se l'utente vuole rifare parte del combattimento, **corregge a mano** i valori correnti (Endurance e/o Combat Skill, di LW e/o del nemico) — e quella correzione viene a sua volta registrata.
- **Le modifiche manuali compaiono nello storico** come righe dedicate (`kind: 'manual'`), con: chi (LW o nemico), quale campo (Endurance o Combat Skill), valore precedente → valore nuovo. Questo vale **anche per il nemico**: la sua Combat Skill può variare durante lo scontro (eventi, doni, sezioni speciali) e la modifica dev'essere tracciata esattamente come per LW.
- Esempio di righe nello storico: `Round 3 — n.6, CR +2 → LW −2 (16), Nemico −5 (8)` / `Modifica manuale — LW Endurance 16 → 19 (pozione)` / `Modifica manuale — Nemico Combat Skill 18 → 15`.
- Lo storico è solo visualizzazione + log; la fonte di verità dei valori "vivi" sono i campi correnti di `CombatState`, sempre editabili.

Flusso di calcolo (suggerito, scavalcabile):
- Calcola il **Combat Ratio** = (Combat Skill di LW + eventuali bonus) − (Combat Skill nemico).
- A ogni round: l'utente estrae un numero 0–9, si consulta la **Combat Results Table (CRT)** in base a Combat Ratio + numero → propone la perdita di Endurance per LW e nemico.
- L'app **propone** i danni; l'utente li applica, li corregge o li ignora. Mostra le Endurance round per round.
- Quando l'Endurance del nemico ≤ 0 o quella di LW ≤ 0, l'app lo **segnala** (vittoria / situazione critica) ma **non chiude né blocca** nulla automaticamente: decide l'utente.
- Ogni round loggato nel war log (`type: 'combat'`).

**Il combattimento NON è vincolante — requisiti espliciti:**
- **Abbandona / fuggi (Evade).** Pulsante sempre disponibile per terminare il combattimento in qualsiasi momento. In Lupo Solitario molte sezioni permettono di evadere lo scontro: tipicamente l'utente subisce comunque la perdita di Endurance del round in cui fugge (LW), ma il nemico **non** la subisce, e poi si salta alla sezione indicata dal libro. L'app deve gestire questo come un'uscita esplicita, NON forzare il combattimento fino a Endurance 0. Loggare nel war log come fuga.
- **Override manuale di ogni valore.** Endurance di LW e del nemico, Combat Skill (di entrambi), Combat Ratio, danni del round: tutti modificabili a mano in qualunque momento, e ogni modifica viene registrata nello storico. L'utente può anche inserire un risultato a mano senza estrarre il numero. Per disfare un round non c'è un "undo": si correggono i valori a mano (più fedele al cartaceo e più semplice).
- **Salta il calcolo / "barava col cartaceo".** Deve esserci la possibilità di ignorare del tutto la CRT e regolare le Endurance liberamente — esattamente come chi, col libro in mano, decideva di aggiustare l'esito. Nessun blocco moralistico, è una feature voluta.
- **Esci e cambia sezione senza chiudere lo scontro.** L'utente può lasciare il pannello combattimento, tornare al reader, andare a un'altra sezione e — se vuole — riprendere lo scontro dopo (lo stato del combattimento in corso va conservato nel playthrough finché l'utente non lo chiude esplicitamente). Mai un modal che imprigiona l'utente.
- **Bonus/malus al round.** Campo per applicare modificatori temporanei (oggetti, doni Kai, sezioni speciali) al Combat Ratio o ai danni di un singolo round, senza alterare i valori base.

> **Nota sulla CRT:** i valori esatti della Combat Results Table provengono dai materiali di **Project Aon** (che pubblica la serie con licenza). Implementare la tabella come un **file dati separato** (`src/data/crt.ts`) che l'utente possa popolare/verificare dai testi di Project Aon, NON inventarla. Strutturarla come lookup `[combatRatioBucket][randomNumber] => { lwLoss, enemyLoss }`. Se i valori non sono disponibili, lasciare un file template chiaramente commentato con la struttura attesa e un TODO.

### 7. Registro di guerra (War Log)
- Lista cronologica di eventi: navigazione tra sezioni, estrazioni, round di combattimento, note manuali dell'utente.
- Persistito nel playthrough. Possibilità di aggiungere note libere.

### 8. Navigazione per sezione ("vai alla sezione N")
- I gamebook si saltano per **numero di sezione**, non di pagina.
- Negli EPUB di Project Aon le sezioni sono ancore con `id` (es. `sect217`) e i rimandi sono `<a href="#sect217">`.
- Implementare:
  - Un input "Vai alla sezione N" che naviga al CFI/ancora corrispondente.
  - **Intercettare i click sui link interni** via `rendition.on('click'...)` o hook sui link, per: (a) navigare nella nostra UI, (b) loggare il salto nel war log.
- Costruire, alla prima apertura del libro, un indice **sezione → location** scansionando lo spine / le ancore. Cacharlo nel record del libro.

### 9. PWA / offline
- `vite-plugin-pwa` con `registerType: 'autoUpdate'`.
- Manifest: `name`, `short_name`, `display: 'standalone'`, `theme_color`, `background_color`, icone 192/512 (generare placeholder se mancano).
- Workbox: precache dell'app shell (tutti gli asset della build).
- All'avvio: chiamare `navigator.storage.persist()` e mostrare in un piccolo indicatore se la persistenza è stata concessa.

### 10. Export / Import salvataggi
- Esporta un playthrough (Action Chart + war log + location) come file JSON scaricabile.
- Importa un JSON per ripristinare uno slot. Rete di sicurezza contro l'eviction iOS.

---

## Regole di Lupo Solitario (riferimento per i default)

- **Combat Skill** iniziale = 10 + (numero 0–9 estratto). Range 10–19.
- **Endurance** iniziale = 20 + (numero 0–9 estratto). Range 20–29.
- **Kai Disciplines**: nel Libro 1 se ne scelgono 5 su 10; +1 per ogni libro successivo della serie.
- **Weapons**: massimo 2 nella lista armi.
- **Backpack**: massimo 8 oggetti; i pasti occupano uno slot ciascuno.
- **Gold Crowns**: nella Belt Pouch, massimo 50.
- **Combattimento**: Combat Ratio = CS di LW − CS nemico; si consulta la CRT con un numero 0–9; entrambi perdono Endurance ogni round.

Questi valori vanno resi **configurabili / data-driven** dove possibile (es. numero di discipline per libro), non hardcodati in modo rigido.

---

## Struttura cartelle suggerita

```
src/
  db.ts                  # Dexie schema + istanza
  store.ts               # stato globale (Zustand)
  data/
    crt.ts               # Combat Results Table (da Project Aon)
    disciplines.ts       # elenco Kai Disciplines
  components/
    Library.tsx
    Reader.tsx           # wrapper EpubView, memoizzato
    Header.tsx
    panels/
      NumberGenerator.tsx
      ActionChart.tsx
      Inventory.tsx
      WarLog.tsx
      Combat.tsx
  hooks/
    useBookUrl.ts        # blob da Dexie -> objectURL + revoke
    usePersistence.ts    # storage.persist + indicatore
  utils/
    sections.ts          # indice sezione->location, intercettazione link
    saveExport.ts        # export/import JSON
  App.tsx
  main.tsx
  index.css              # @import "tailwindcss";
```

---

## Criteri di completamento (come testo che funziona)

1. `npm run dev` parte senza errori; la libreria si apre.
2. Posso caricare un EPUB locale; compare nella libreria e **resta dopo un refresh** (è in IndexedDB).
3. Aprendo il libro vedo il testo reflowable; la posizione di lettura **persiste** tra refresh.
4. L'header apre i pannelli; il generatore di numeri dà 0–9; l'Action Chart è editabile e persiste.
5. L'helper di combattimento calcola il Combat Ratio e aggiorna le Endurance round per round (anche con CRT placeholder, deve girare).
6. **Combattimento non vincolante e manuale:** "Nuovo Combattimento" avvia uno scontro e mi **chiede** se importare Endurance/Combat Skill dal registro; durante lo scontro posso modificare a mano qualunque valore di LW e del nemico (Endurance e Combat Skill), es. +punti per una pozione o calo di combattività del nemico; ogni modifica manuale **appare nello storico** con valore prima→dopo; a fine round un pulsante **"Aggiorna resistenza nel registro"** ricopia il valore nell'Action Chart **solo su click**; posso fuggire/abbandonare, ignorare la CRT, e uscire per cambiare sezione senza chiudere lo scontro (che posso riprendere). Lo storico è un diario di sola lettura; per "tornare indietro" correggo i valori a mano. Nessuna sincronizzazione automatica registro↔scontro.
7. Export → ottengo un JSON; Import → ripristina lo stato.
8. `npm run build && npm run preview`: il service worker si registra, e **disattivando la rete** (DevTools → Offline) l'app si **riapre e funziona**, EPUB e salvataggi inclusi.
9. README con: comandi, nota sul **contesto sicuro / HTTPS** per testare su iPhone, e istruzioni per "Aggiungi alla schermata Home".
10. **Mobile/iPhone:** in viewport iPhone (portrait) tutto è usabile con un dito — target ≥44px, niente zoom al focus degli input, header e barre rispettano le safe-area (notch/home indicator), i contenitori full-screen usano `dvh` (niente salti con la barra Safari), i pannelli sono sheet a tutto schermo chiudibili facilmente. Verificato anche da PWA installata sulla home.

---

## Note finali per Claude Code

- Scrivere codice **TypeScript tipizzato**, niente `any` non necessari.
- Commentare i punti critici (revoke objectURL, memoizzazione iframe, persist).
- UI pulita con Tailwind, mobile-first (target iPhone), header fisso in alto.
- Non reintrodurre dipendenze da CDN.
- Se un dato di gioco (es. CRT) non è disponibile, lasciare un template chiaro con TODO invece di inventare valori.
