import type { en } from './en'

// Dizionario italiano. Tipizzato su `keyof typeof en` → errore di compilazione
// se manca (o avanza) una chiave rispetto all'inglese.
export const it: Record<keyof typeof en, string> = {
  // Common
  'common.close': 'Chiudi',
  'common.add': 'Aggiungi',
  'common.remove': 'Rimuovi',
  'common.decrease': 'Diminuisci',
  'common.increase': 'Aumenta',
  'common.go': 'Vai',
  'common.noItems': 'Nessuna voce.',
  'common.newItem': 'Nuova voce…',
  'common.overLimit': 'oltre il limite',
  'common.belowRef': 'Sotto il riferimento ({min})',

  // Top bar (reader)
  'top.library': 'Libreria',
  'top.back': 'Indietro',
  'top.backAria': 'Indietro nella cronologia di lettura',
  'top.settingsAria': 'Impostazioni',
  'top.smaller': 'Riduci testo',
  'top.larger': 'Ingrandisci testo',

  // Bottom bar (panels)
  'nav.number': 'Numero',
  'nav.chart': 'Scheda',
  'nav.inventory': 'Zaino',
  'nav.warlog': 'Registro',
  'nav.combat': 'Combatti',

  // Library
  'lib.subtitle': 'Reader offline per gamebook',
  'lib.load': 'Carica EPUB',
  'lib.loading': 'Caricamento…',
  'lib.empty': 'Nessun libro. Carica un EPUB (es. i gamebook di Project Aon) per iniziare.',
  'lib.open': 'Apri',
  'lib.newGame': 'Nuova partita',
  'lib.removeBook': 'Rimuovi libro',
  'lib.persistDenied': 'Storage non persistente: iOS potrebbe cancellare i dati. Esporta i salvataggi dal Registro.',
  'lib.persistGranted': 'Storage persistente concesso.',
  'lib.newGameConfirm':
    'Iniziare una nuova partita?\n\nI salvataggi precedenti di questo libro verranno cancellati. Se vuoi conservarli, esportali prima dal Registro.',
  'lib.playthroughName': 'Partita {n}',
  'lib.settings': 'Impostazioni',
  'lib.copyChar': 'Copia il personaggio di «{title}» su un altro libro',
  'lib.copyTo': 'Copia il personaggio di «{title}» su:',
  'lib.copyHint':
    'Crea una nuova partita sul libro scelto con Action Chart, zaino, oro e note della partita più recente. Segnalibri, posizione di lettura e registro di guerra restano sul libro originale.',
  'lib.copyNoTarget': 'Carica prima il libro successivo in libreria: il personaggio si copia su un libro diverso.',
  'lib.copyNoSave': 'Nessuna partita da copiare per «{title}».',
  'lib.copyCancel': 'Annulla',
  'lib.copyLogNote': 'Personaggio copiato da «{from}».',

  // Istruzioni / guida
  'help.button': 'Istruzioni',
  'help.title': 'Come si usa l’app',
  'help.intro': 'Guida rapida all’app. Tocca ✕ per chiudere e tornare alla libreria.',
  'help.load.title': 'Caricare un libro',
  'help.load.b1': 'Tocca “＋ Carica EPUB” e scegli un file .epub dal dispositivo.',
  'help.load.b2': 'Il libro viene salvato sul dispositivo: lo ritrovi anche offline e dopo un riavvio.',
  'help.load.b3':
    '“Apri” riprende l’ultima partita; “Nuova partita” ricomincia da zero e cancella i salvataggi di quel libro — esportali prima se vuoi conservarli.',
  'help.load.b4': 'I gamebook di Lupo Solitario si scaricano gratis da Project Aon.',
  'help.load.b5':
    'Finito un libro? Tocca 🧳 sul libro per copiare il personaggio (scheda, zaino, oro e note) in una nuova partita sul libro successivo. Segnalibri e registro di guerra restano sul libro originale.',
  'help.read.title': 'Leggere e navigare',
  'help.read.b1': 'La posizione di lettura viene salvata automaticamente mentre leggi.',
  'help.read.b2': 'Usa A− / A+ in alto per la dimensione del testo; cambia tema scuro/chiaro dalle Impostazioni.',
  'help.read.b3':
    'In fondo a ogni pagina: ‹ Precedente / Successiva ›, ↩ Indietro (torna al punto di prima) e 🧭 Sezione.',
  'help.read.b4':
    'Tocca un link interno del libro (es. “vai al 217”) per saltare — il salto viene annotato nel Registro di guerra.',
  'help.read.b5': 'Tocca una mappa o un’illustrazione per aprirla a tutto schermo con lo zoom.',
  'help.goto.title': 'Vai alla sezione e segnalibri',
  'help.goto.b1': 'Inserisci il numero di sezione e premi Vai — i gamebook si navigano per sezione, non per pagina.',
  'help.goto.b2': 'Aggiungi un segnalibro alla pagina corrente per ritrovarla al volo (utile per mappe o regole).',
  'help.chart.title': 'Scheda del personaggio (Action Chart)',
  'help.chart.b1':
    'Combat Skill iniziale 10–19 ed Endurance iniziale 20–29 (10/20 più una cifra estratta 0–9).',
  'help.chart.b2':
    'Ogni valore è sempre modificabile a mano — anche a metà combattimento (es. aggiungi punti dopo una pozione).',
  'help.chart.b3': 'I limiti classici sono solo avvisi: l’app non ti impedisce mai di inserire un valore.',
  'help.chart.b4':
    'In fondo alla scheda c’è uno spazio Note libere (indizi, codici, promemoria): si salva con la partita, è incluso nei backup e viene copiato insieme al personaggio.',
  'help.inv.title': 'Zaino e oggetti',
  'help.inv.b1':
    'Armi (rif. max 2), Zaino (rif. max 8), Oggetti speciali (senza limite), Corone d’oro (rif. max 50) e Pasti.',
  'help.inv.b2': 'Aggiungi, rinomina o rimuovi ogni voce quando vuoi.',
  'help.num.title': 'Generatore di numeri',
  'help.num.b1':
    'Tocca per estrarre una cifra 0–9 (Lupo Solitario non usa dadi). Ogni estrazione va nel Registro di guerra.',
  'help.combat.title': 'Helper di combattimento',
  'help.combat.b1':
    'È un assistente, non un arbitro: lavora su una copia dei tuoi valori e non modifica mai la scheda da solo.',
  'help.combat.b2':
    '“Nuovo combattimento”: scegli se importare Endurance e Combat Skill dalla scheda, poi inserisci i dati del nemico.',
  'help.combat.b3':
    'A ogni round: estrai un numero e l’app propone le perdite dalla CRT — applicale, correggile o ignorale.',
  'help.combat.b4':
    'Puoi modificare qualsiasi valore (tuo e del nemico) in ogni momento; ogni modifica compare nello Storico.',
  'help.combat.b5':
    '“Aggiorna resistenza nel registro” copia l’Endurance nella scheda — solo quando lo premi tu, mai in automatico.',
  'help.combat.b6':
    '“Fuggi” termina lo scontro subendo solo la tua perdita del round; il nemico non la subisce, poi salti alla sezione del libro.',
  'help.combat.b7':
    'Puoi uscire dal combattimento, cambiare sezione e riprenderlo dopo: lo scontro resta aperto finché non lo chiudi.',
  'help.combat.b8': 'Lo Storico è un diario di sola lettura: per “tornare indietro” correggi i valori a mano.',
  'help.combat.b9': 'Se la tabella CRT non è compilata, inserisci le perdite a mano — lo scontro funziona comunque.',
  'help.warlog.title': 'Registro di guerra',
  'help.warlog.b1': 'Un diario cronologico: salti di sezione, estrazioni, round di combattimento e le tue note.',
  'help.warlog.b2': 'Tocca una voce di navigazione per tornare a quel punto; aggiungi note libere quando vuoi.',
  'help.backup.title': 'Impostazioni e backup',
  'help.backup.b1': 'Cambia la lingua dell’interfaccia e il tema chiaro/scuro.',
  'help.backup.b2':
    'Esporta i salvataggi in un file JSON come rete di sicurezza (iOS può cancellare i dati) e reimportali quando vuoi. Segnalibri e note sono inclusi.',
  'help.backup.b3': 'Gli EPUB non sono nel backup: ricaricali e i salvataggi si ri-agganciano per titolo del libro.',
  'help.principle.title': 'Sei tu l’arbitro',
  'help.principle.body':
    'L’app è un foglio di carta intelligente, non un motore di regole. Tutto ciò che è automatico è solo un suggerimento: puoi sempre scavalcarlo, modificarlo o ignorarlo.',

  // Reader (App)
  'reader.loading': 'Caricamento…',
  'reader.bookLoading': 'Caricamento del libro…',

  // Settings panel
  'settings.title': 'Impostazioni',
  'settings.language': 'Lingua',
  'settings.theme': 'Tema',
  'settings.themeDark': 'Scuro',
  'settings.themeLight': 'Chiaro',
  'settings.backup': 'Backup salvataggi',
  'settings.backupHint':
    'Esporta tutti i salvataggi (tutte le partite, tutti i libri) in un unico file, segnalibri e note inclusi. Gli EPUB non sono inclusi: ricaricali dalla libreria e i salvataggi si ri-agganciano per titolo del libro.',
  'settings.export': '⬇︎ Esporta tutti i salvataggi',
  'settings.import': '⬆︎ Importa salvataggi',
  'settings.exportDone': 'Esportati {n} salvataggi.',
  'settings.exportEmpty': 'Nessun salvataggio da esportare.',
  'settings.importDone': 'Importati {n} salvataggi ({linked} agganciati ai libri).',
  'settings.importMissing':
    'Nessun libro trovato per: {titles}. Carica questi EPUB nella libreria e i salvataggi corrispondenti verranno ripristinati automaticamente.',
  'settings.importFailed': 'Import fallito: {err}',
  'settings.storage': 'Archiviazione dati',
  'settings.storageIntro':
    'All’avvio l’app chiede al browser di conservare libri e salvataggi anche quando lo spazio sul dispositivo scarseggia. Stato attuale:',
  'settings.storageGranted': 'Persistente',
  'settings.storageDenied': 'Non persistente',
  'settings.storageUnsupported': 'Non supportato',
  'settings.storageUnknown': 'Verifica…',
  'settings.storageHintGranted':
    'Il browser ha promesso di conservare i tuoi dati (libri e salvataggi) e non dovrebbe cancellarli. È lo stato ideale.',
  'settings.storageHintDenied':
    'I dati sono conservati “best-effort”: sotto pressione di memoria iOS potrebbe cancellarli. Usa “Esporta tutti i salvataggi” qui sopra come rete di sicurezza.',
  'settings.storageHintUnsupported':
    'Questo browser non espone l’API di persistenza. I dati di solito restano, ma esporta i salvataggi regolarmente per sicurezza.',
  'settings.storageHintUnknown': 'Richiesta al browser in corso…',

  // Number generator
  'num.title': 'Genera numero',
  'num.drawing': 'Estrazione…',
  'num.draw': 'Estrai numero (0–9)',
  'num.hint':
    'Lupo Solitario non usa dadi: si estrae una singola cifra da 0 a 9. Ogni estrazione viene registrata nel Registro di guerra.',
  'num.logDraw': 'Numero estratto: {n}',

  // Action Chart
  'chart.title': 'Action Chart',
  'chart.combatSkill': 'Combat Skill',
  'chart.csHint': 'iniziale 10–19',
  'chart.endurance': 'Endurance (Resistenza)',
  'chart.enduranceCurrent': 'Corrente',
  'chart.enduranceMax': 'Massima',
  'chart.enduranceCritical': '≤ 0 — situazione critica (decidi tu)',
  'chart.kai': 'Discipline Kai',
  'chart.kaiPlaceholder': 'es. Mimetismo, Sesto Senso…',
  'chart.notes': 'Note',
  'chart.notesPlaceholder': 'Note libere… (es. indizi, codici, cose da ricordare)',
  'chart.itemsNote': 'Armi, zaino, oggetti speciali e oro si gestiscono nel pannello 🎒 Zaino.',

  // Inventory
  'inv.title': 'Inventario',
  'inv.gold': 'Corone d’oro (Belt Pouch)',
  'inv.goldHint': 'riferimento max 50',
  'inv.goldWarn': 'oltre il limite classico di 50 (consentito)',
  'inv.weapons': 'Armi',
  'inv.weaponsPlaceholder': 'es. Spada, Lancia…',
  'inv.backpack': 'Zaino (Backpack)',
  'inv.backpackPlaceholder': 'es. Corda, Lanterna…',
  'inv.special': 'Oggetti speciali',
  'inv.specialPlaceholder': 'es. Mappa, Sigillo Kai…',
  'inv.meals': 'Pasti (Meals)',
  'inv.mealsHint': 'ogni pasto occupa 1 slot zaino',

  // War Log
  'log.title': 'Registro di guerra',
  'log.notePlaceholder': 'Aggiungi una nota…',
  'log.add': 'Aggiungi',
  'log.export': 'Esporta salvataggio',
  'log.import': 'Importa salvataggio',
  'log.importedNew': 'Salvataggio importato come nuova partita.',
  'log.importedFallback': 'Importato (libro originale assente: associato a un libro esistente).',
  'log.importFailed': 'Import fallito: {err}',
  'log.empty': 'Nessun evento ancora.',
  'log.goToAria': 'Vai a: {text}',
  'log.linkSection': 'Link → sezione {n}',
  'log.linkHref': 'Link → {href}',

  // Go to section
  'goto.title': 'Vai alla sezione',
  'goto.sectionNumber': 'Numero di sezione',
  'goto.go': 'Vai',
  'goto.notFound': 'Sezione {n} non trovata (o reader non pronto).',
  'goto.indexed': '{n} sezioni indicizzate da questo libro.',
  'goto.indexUnavailable': 'Indice sezioni non disponibile: verrà tentato lo schema sectN.xhtml.',
  'goto.bookmarks': 'Segnalibri',
  'goto.ofBook': 'del libro',
  'goto.noBookmarks': 'Nessun segnalibro. Marca la pagina corrente qui sotto.',
  'goto.bookmarkPlaceholder': 'Nome (es. Mappa del mondo)',
  'goto.addPage': 'Aggiungi questa pagina',
  'goto.bookmarkDefault': 'Segnalibro {n}',
  'goto.posUnavailable': 'Posizione corrente non disponibile (reader non pronto).',
  'goto.readerNotReady': 'Reader non pronto: riprova.',
  'goto.removeBookmark': 'Rimuovi segnalibro {label}',
  'goto.logGo': 'Vai alla sezione {n}',
  'goto.logBookmark': 'Segnalibro → {label}',

  // Combat — start
  'combat.newTitle': 'Nuovo combattimento',
  'combat.lwData': 'Dati di Lupo Solitario',
  'combat.importFromChart': 'Importa Endurance e Combat Skill dal registro',
  'combat.fromChart': 'CS {cs} · Endurance {en} (dal registro)',
  'combat.enemyData': 'Dati del nemico',
  'combat.name': 'Nome',
  'combat.enemyNamePlaceholder': 'es. Signore di Helghast',
  'combat.start': 'Avvia combattimento',
  'combat.allEditableNote': 'Tutti i valori restano modificabili a mano durante lo scontro.',
  'combat.enemyDefault': 'Nemico',
  'combat.logStart': 'Inizio combattimento contro {name}',

  // Combat — active
  'combat.title': 'Combattimento — {name}',
  'combat.exitResume': 'Esci (riprendi dopo)',
  'combat.finish': 'Termina scontro',
  'combat.lwName': 'Lupo Solitario',
  'combat.enemyDown': '☠️ Nemico a 0 o meno — possibile vittoria. ',
  'combat.lwDown': '⚠️ LW a 0 o meno — situazione critica. ',
  'combat.decide': 'Decidi tu cosa farne (l’app non chiude nulla in automatico).',
  'combat.ratio': 'Combat Ratio',
  'combat.bonus': 'Bonus/malus temporaneo al CR',
  'combat.round': 'Round',
  'combat.drawnNumber': 'Numero estratto (0–9)',
  'combat.drawBtn': 'Estrai',
  'combat.crtMissing': 'CRT non compilata (src/data/crt.ts): inserisci i danni a mano.',
  'combat.lwLoss': 'Perdita LW',
  'combat.enemyLoss': 'Perdita nemico',
  'combat.death': 'MORTE',
  'combat.crtProposal': 'Proposta CRT: LW {lw}, Nemico {enemy}',
  'combat.applyRound': 'Applica round',
  'combat.sync': '⬆︎ Aggiorna resistenza nel registro',
  'combat.evadeTitle': 'Fuggi / abbandona',
  'combat.evadeLoss': 'Perdita LW alla fuga',
  'combat.evadeSection': 'Vai alla sezione',
  'combat.evadeBtn': 'Fuggi (il nemico non subisce danni)',
  'combat.historyTitle': 'Storico (diario, sola lettura)',
  'combat.historyNote': 'Per “tornare indietro” correggi a mano i valori: la modifica verrà registrata qui.',
  'combat.logEvadeEnd': 'Fine combattimento contro {name} (fuga)',
  'combat.logEnd': 'Fine combattimento contro {name} ({outcome})',

  // Combat log entries (describeEntry)
  'clog.startImported': 'Inizio combattimento (valori importati dal registro)',
  'clog.startManual': 'Inizio combattimento (valori inseriti a mano)',
  'clog.roundManual': 'manuale',
  'clog.roundNum': 'n.{n}',
  'clog.round': 'Round — {num}, CR {cr} → LW {lwLoss} ({lwAfter}), Nemico {enLoss} ({enAfter})',
  'clog.manualLw': 'LW',
  'clog.manualEnemy': 'Nemico',
  'clog.manualEndurance': 'Endurance',
  'clog.manualCs': 'Combat Skill',
  'clog.manual': 'Modifica manuale — {who} {field} {from} → {to}',
  'clog.manualNote': 'Modifica manuale — {who} {field} {from} → {to} ({note})',
  'clog.evade': 'Fuga — LW −{loss}',
  'clog.evadeSection': 'Fuga — LW −{loss}, vai alla sez. {section}',
  'clog.sync': 'Resistenza aggiornata nel registro',
  'clog.outcomeWon': 'vittoria',
  'clog.outcomeFled': 'fuga',
  'clog.outcomeLwDown': 'LW a terra',
  'clog.outcomeClosed': 'chiuso',
  'clog.end': 'Fine combattimento ({outcome})',

  // Orientation gate
  'orient.rotate': 'Ruota in verticale',
  'orient.hint': 'Lupo Solitario è pensato per il formato portrait.',

  // Lightbox
  'box.zoomOut': 'Riduci zoom',
  'box.zoomIn': 'Aumenta zoom',
  'box.close': 'Chiudi immagine',
  'box.alt': 'Immagine del libro',
  'box.hint': 'Doppio tap per zoom · trascina per spostarti',

  // Injected reader nav bar
  'pagenav.prev': '‹ Precedente',
  'pagenav.prevAria': 'Pagina precedente',
  'pagenav.next': 'Successiva ›',
  'pagenav.nextAria': 'Pagina successiva',
  'pagenav.back': '↩ Indietro',
  'pagenav.backAria': 'Torna indietro nella cronologia',
  'pagenav.section': '🧭 Sezione',
  'pagenav.sectionAria': 'Vai alla sezione',
}
