// English UI dictionary — SOURCE OF TRUTH for the set of keys.
// `it.ts` is type-checked to provide exactly the same keys (compile error if not).
// Placeholders use {name}; game content typed by the user is never translated.
export const en = {
  // Common
  'common.close': 'Close',
  'common.add': 'Add',
  'common.remove': 'Remove',
  'common.decrease': 'Decrease',
  'common.increase': 'Increase',
  'common.go': 'Go',
  'common.noItems': 'No items.',
  'common.newItem': 'New item…',
  'common.overLimit': 'over limit',
  'common.belowRef': 'Below reference ({min})',

  // Top bar (reader)
  'top.library': 'Library',
  'top.back': 'Back',
  'top.backAria': 'Back in reading history',
  'top.settingsAria': 'Settings',
  'top.smaller': 'Smaller text',
  'top.larger': 'Larger text',

  // Bottom bar (panels)
  'nav.number': 'Number',
  'nav.chart': 'Chart',
  'nav.inventory': 'Backpack',
  'nav.warlog': 'Log',
  'nav.combat': 'Fight',

  // Library
  'lib.subtitle': 'Offline gamebook reader',
  'lib.load': 'Load EPUB',
  'lib.loading': 'Loading…',
  'lib.empty': 'No books yet. Load an EPUB (e.g. the Project Aon gamebooks) to start.',
  'lib.open': 'Open',
  'lib.newGame': 'New game',
  'lib.removeBook': 'Remove book',
  'lib.persistDenied': 'Storage not persistent: iOS may evict your data. Export your saves from the Log.',
  'lib.persistGranted': 'Persistent storage granted.',
  'lib.newGameConfirm':
    'Start a new game?\n\nPrevious saves for this book will be deleted. If you want to keep them, export them first from the Log.',
  'lib.playthroughName': 'Game {n}',
  'lib.settings': 'Settings',
  'lib.copyChar': 'Copy the character from “{title}” to another book',
  'lib.copyTo': 'Copy the character from “{title}” to:',
  'lib.copyHint':
    'Creates a new game on the chosen book with the Action Chart, backpack, gold and notes of the most recent game. Bookmarks, reading position and war log stay with the original book.',
  'lib.copyNoTarget': 'Load the next book into the library first: the character is copied onto a different book.',
  'lib.copyNoSave': 'No saved game to copy for “{title}”.',
  'lib.copyCancel': 'Cancel',
  'lib.copyLogNote': 'Character copied from “{from}”.',

  // Instructions / help
  'help.button': 'Guide',
  'help.title': 'How to use the app',
  'help.intro': 'A quick guide to the app. Tap ✕ to close and go back to the library.',
  'help.load.title': 'Loading a book',
  'help.load.b1': 'Tap “＋ Load EPUB” and pick a .epub file from your device.',
  'help.load.b2': 'The book is saved on your device: you’ll find it again offline and after a restart.',
  'help.load.b3':
    '“Open” resumes your last game; “New game” starts over and deletes that book’s saves — export them first if you want to keep them.',
  'help.load.b4': 'The Lone Wolf gamebooks are available for free from Project Aon.',
  'help.load.b5':
    'Finished a book? Tap 🧳 on it to copy your character (chart, backpack, gold and notes) into a new game on the next book. Bookmarks and war log stay with the original book.',
  'help.read.title': 'Reading & navigating',
  'help.read.b1': 'Your reading position is saved automatically as you read.',
  'help.read.b2': 'Use A− / A+ at the top to change text size; switch the dark/light theme in Settings.',
  'help.read.b3':
    'At the bottom of each page: ‹ Previous / Next ›, ↩ Back (returns to where you were) and 🧭 Section.',
  'help.read.b4': 'Tap an in-book link (e.g. “turn to 217”) to jump — the jump is recorded in the War Log.',
  'help.read.b5': 'Tap a map or illustration to open it full-screen with zoom.',
  'help.goto.title': 'Go to a section & bookmarks',
  'help.goto.b1': 'Enter a section number and press Go — gamebooks are navigated by section, not by page.',
  'help.goto.b2': 'Bookmark the current page to jump back to it later (handy for maps or rules pages).',
  'help.chart.title': 'Character sheet (Action Chart)',
  'help.chart.b1': 'Initial Combat Skill is 10–19 and initial Endurance 20–29 (10/20 plus a drawn digit 0–9).',
  'help.chart.b2': 'Every value is always editable by hand — even mid-combat (e.g. add points after a potion).',
  'help.chart.b3': 'The classic limits are only hints: the app never stops you from entering a value.',
  'help.chart.b4':
    'At the bottom of the chart there is a free Notes area (clues, codes, reminders): it is saved with the game, included in backups and copied along with the character.',
  'help.inv.title': 'Backpack & items',
  'help.inv.b1':
    'Weapons (ref. max 2), Backpack (ref. max 8), Special Items (no limit), Gold Crowns (ref. max 50) and Meals.',
  'help.inv.b2': 'Add, rename or remove any entry whenever you like.',
  'help.num.title': 'Number generator',
  'help.num.b1': 'Tap to draw a single digit 0–9 (Lone Wolf uses no dice). Every draw goes to the War Log.',
  'help.combat.title': 'Combat helper',
  'help.combat.b1':
    'It’s an assistant, not a referee: it works on a copy of your values and never changes the chart on its own.',
  'help.combat.b2':
    '“New combat”: choose whether to import Endurance and Combat Skill from the chart, then enter the enemy’s data.',
  'help.combat.b3':
    'Each round: draw a number and the app proposes the losses from the CRT — apply, adjust or ignore them.',
  'help.combat.b4':
    'You can edit any value (yours and the enemy’s) at any time; every change appears in the History.',
  'help.combat.b5':
    '“Update endurance in the chart” copies Endurance into the sheet — only when you tap it, never automatically.',
  'help.combat.b6':
    '“Evade” ends the fight taking only your round’s loss; the enemy takes none, then you jump to the book’s section.',
  'help.combat.b7': 'You can leave combat, change section and resume later: the fight stays open until you end it.',
  'help.combat.b8': 'The History is a read-only diary: to “undo”, just correct the values by hand.',
  'help.combat.b9': 'If the CRT table isn’t filled in, enter the losses by hand — the fight still works.',
  'help.warlog.title': 'War Log',
  'help.warlog.b1': 'A chronological diary: section jumps, number draws, combat rounds and your own notes.',
  'help.warlog.b2': 'Tap a navigation entry to jump back to that point; add free notes anytime.',
  'help.backup.title': 'Settings & backup',
  'help.backup.b1': 'Change the interface language and the light/dark theme.',
  'help.backup.b2':
    'Export your saves to a JSON file as a safety net (iOS can evict data), and re-import them anytime. Bookmarks and notes are included.',
  'help.backup.b3': 'EPUBs aren’t in the backup: reload them and the saves re-link by book title.',
  'help.principle.title': 'You are the referee',
  'help.principle.body':
    'The app is a smart sheet of paper, not a rules engine. Everything automatic is only a suggestion: you can always override it, change it or ignore it.',

  // Reader (App)
  'reader.loading': 'Loading…',
  'reader.bookLoading': 'Loading the book…',

  // Settings panel
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.theme': 'Theme',
  'settings.themeDark': 'Dark',
  'settings.themeLight': 'Light',
  'settings.backup': 'Saves backup',
  'settings.backupHint':
    'Exports every save (all games, all books) to one file, bookmarks and notes included. EPUBs are not included: reload them from the library and saves re-link by book title.',
  'settings.export': '⬇︎ Export all saves',
  'settings.import': '⬆︎ Import saves',
  'settings.exportDone': '{n} saves exported.',
  'settings.exportEmpty': 'No saves to export yet.',
  'settings.importDone': 'Imported {n} saves ({linked} linked to books).',
  'settings.importMissing':
    'No book found for: {titles}. Load these EPUBs into the library and the matching saves will be restored automatically.',
  'settings.importFailed': 'Import failed: {err}',
  'settings.storage': 'Data storage',
  'settings.storageIntro':
    'On launch the app asks the browser to keep your books and game saves even when device space runs low. Current status:',
  'settings.storageGranted': 'Persistent',
  'settings.storageDenied': 'Not persistent',
  'settings.storageUnsupported': 'Not supported',
  'settings.storageUnknown': 'Checking…',
  'settings.storageHintGranted':
    'The browser has promised to keep your data (books and saves) and should not evict it. This is the ideal state.',
  'settings.storageHintDenied':
    'Your data is kept on a best-effort basis: under memory pressure iOS may delete it. Use “Export all saves” above as a safety net.',
  'settings.storageHintUnsupported':
    'This browser does not expose the persistence API. Data usually stays, but export your saves regularly to be safe.',
  'settings.storageHintUnknown': 'Asking the browser…',

  // Number generator
  'num.title': 'Generate number',
  'num.drawing': 'Drawing…',
  'num.draw': 'Draw number (0–9)',
  'num.hint':
    'Lone Wolf does not use dice: a single digit 0–9 is drawn. Every draw is recorded in the War Log.',
  'num.logDraw': 'Number drawn: {n}',

  // Action Chart
  'chart.title': 'Action Chart',
  'chart.combatSkill': 'Combat Skill',
  'chart.csHint': 'initial 10–19',
  'chart.endurance': 'Endurance',
  'chart.enduranceCurrent': 'Current',
  'chart.enduranceMax': 'Maximum',
  'chart.enduranceCritical': '≤ 0 — critical situation (your call)',
  'chart.kai': 'Kai Disciplines',
  'chart.kaiPlaceholder': 'e.g. Camouflage, Sixth Sense…',
  'chart.notes': 'Notes',
  'chart.notesPlaceholder': 'Free notes… (e.g. clues, codes, things to remember)',
  'chart.itemsNote': 'Weapons, backpack, special items and gold are managed in the 🎒 Backpack panel.',

  // Inventory
  'inv.title': 'Backpack',
  'inv.gold': 'Gold Crowns (Belt Pouch)',
  'inv.goldHint': 'reference max 50',
  'inv.goldWarn': 'over the classic limit of 50 (allowed)',
  'inv.weapons': 'Weapons',
  'inv.weaponsPlaceholder': 'e.g. Sword, Spear…',
  'inv.backpack': 'Backpack',
  'inv.backpackPlaceholder': 'e.g. Rope, Lantern…',
  'inv.special': 'Special Items',
  'inv.specialPlaceholder': 'e.g. Map, Kai Seal…',
  'inv.meals': 'Meals',
  'inv.mealsHint': 'each meal takes 1 backpack slot',

  // War Log
  'log.title': 'War Log',
  'log.notePlaceholder': 'Add a note…',
  'log.add': 'Add',
  'log.export': 'Export save',
  'log.import': 'Import save',
  'log.importedNew': 'Save imported as a new game.',
  'log.importedFallback': 'Imported (original book missing: linked to an existing book).',
  'log.importFailed': 'Import failed: {err}',
  'log.empty': 'No events yet.',
  'log.goToAria': 'Go to: {text}',
  'log.linkSection': 'Link → section {n}',
  'log.linkHref': 'Link → {href}',

  // Go to section
  'goto.title': 'Go to section',
  'goto.sectionNumber': 'Section number',
  'goto.go': 'Go',
  'goto.notFound': 'Section {n} not found (or reader not ready).',
  'goto.indexed': '{n} sections indexed from this book.',
  'goto.indexUnavailable': 'Section index unavailable: the sectN.xhtml scheme will be tried.',
  'goto.bookmarks': 'Bookmarks',
  'goto.ofBook': "of the book",
  'goto.noBookmarks': 'No bookmarks. Mark the current page below.',
  'goto.bookmarkPlaceholder': 'Name (e.g. World map)',
  'goto.addPage': 'Add this page',
  'goto.bookmarkDefault': 'Bookmark {n}',
  'goto.posUnavailable': 'Current position unavailable (reader not ready).',
  'goto.readerNotReady': 'Reader not ready: try again.',
  'goto.removeBookmark': 'Remove bookmark {label}',
  'goto.logGo': 'Go to section {n}',
  'goto.logBookmark': 'Bookmark → {label}',

  // Combat — start
  'combat.newTitle': 'New combat',
  'combat.lwData': 'Lone Wolf data',
  'combat.importFromChart': 'Import Endurance and Combat Skill from the chart',
  'combat.fromChart': 'CS {cs} · Endurance {en} (from the chart)',
  'combat.enemyData': 'Enemy data',
  'combat.name': 'Name',
  'combat.enemyNamePlaceholder': 'e.g. Helghast Lord',
  'combat.start': 'Start combat',
  'combat.allEditableNote': 'All values stay editable by hand during the fight.',
  'combat.enemyDefault': 'Enemy',
  'combat.logStart': 'Combat started against {name}',

  // Combat — active
  'combat.title': 'Combat — {name}',
  'combat.exitResume': 'Exit (resume later)',
  'combat.finish': 'End fight',
  'combat.lwName': 'Lone Wolf',
  'combat.enemyDown': '☠️ Enemy at 0 or less — possible victory. ',
  'combat.lwDown': '⚠️ LW at 0 or less — critical situation. ',
  'combat.decide': 'You decide what to do (the app never closes anything automatically).',
  'combat.ratio': 'Combat Ratio',
  'combat.bonus': 'Temporary CR bonus/malus',
  'combat.round': 'Round',
  'combat.drawnNumber': 'Drawn number (0–9)',
  'combat.drawBtn': 'Draw',
  'combat.crtMissing': 'CRT not filled in (src/data/crt.ts): enter the losses by hand.',
  'combat.lwLoss': 'LW loss',
  'combat.enemyLoss': 'Enemy loss',
  'combat.death': 'DEATH',
  'combat.crtProposal': 'CRT proposal: LW {lw}, Enemy {enemy}',
  'combat.applyRound': 'Apply round',
  'combat.sync': '⬆︎ Update endurance in the chart',
  'combat.evadeTitle': 'Evade / abandon',
  'combat.evadeLoss': 'LW loss on evade',
  'combat.evadeSection': 'Go to section',
  'combat.evadeBtn': 'Evade (the enemy takes no damage)',
  'combat.historyTitle': 'History (diary, read-only)',
  'combat.historyNote': 'To "go back", correct the values by hand: the change is recorded here.',
  'combat.logEvadeEnd': 'End of combat against {name} (evade)',
  'combat.logEnd': 'End of combat against {name} ({outcome})',

  // Combat log entries (describeEntry)
  'clog.startImported': 'Combat start (values imported from the chart)',
  'clog.startManual': 'Combat start (values entered by hand)',
  'clog.roundManual': 'manual',
  'clog.roundNum': 'no.{n}',
  'clog.round': 'Round — {num}, CR {cr} → LW {lwLoss} ({lwAfter}), Enemy {enLoss} ({enAfter})',
  'clog.manualLw': 'LW',
  'clog.manualEnemy': 'Enemy',
  'clog.manualEndurance': 'Endurance',
  'clog.manualCs': 'Combat Skill',
  'clog.manual': 'Manual change — {who} {field} {from} → {to}',
  'clog.manualNote': 'Manual change — {who} {field} {from} → {to} ({note})',
  'clog.evade': 'Evade — LW −{loss}',
  'clog.evadeSection': 'Evade — LW −{loss}, go to sect. {section}',
  'clog.sync': 'Endurance updated in the chart',
  'clog.outcomeWon': 'victory',
  'clog.outcomeFled': 'evade',
  'clog.outcomeLwDown': 'LW down',
  'clog.outcomeClosed': 'closed',
  'clog.end': 'End of combat ({outcome})',

  // Orientation gate
  'orient.rotate': 'Rotate to portrait',
  'orient.hint': 'Lone Wolf is designed for portrait orientation.',

  // Lightbox
  'box.zoomOut': 'Zoom out',
  'box.zoomIn': 'Zoom in',
  'box.close': 'Close image',
  'box.alt': 'Book image',
  'box.hint': 'Double tap to zoom · drag to pan',

  // Injected reader nav bar
  'pagenav.prev': '‹ Previous',
  'pagenav.prevAria': 'Previous page',
  'pagenav.next': 'Next ›',
  'pagenav.nextAria': 'Next page',
  'pagenav.back': '↩ Back',
  'pagenav.backAria': 'Back in history',
  'pagenav.section': '🧭 Section',
  'pagenav.sectionAria': 'Go to section',
}
