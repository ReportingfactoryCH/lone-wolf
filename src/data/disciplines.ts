import type { Lang } from '../i18n'

// Le 10 Discipline Kai della serie Kai (libri 1–5). Nel Libro 1 se ne scelgono 5;
// +1 per ogni libro successivo. Reso data-driven: l'utente le sceglie con un tocco
// nell'Action Chart (o le scrive a mano), l'app mostra solo un riferimento al numero
// atteso. I nomi seguono le edizioni: italiana, inglese (Project Aon) e tedesca
// (Mantikore, "Einsamer Wolf").

export interface Discipline {
  id: string
  names: Record<Lang, string>
}

export const KAI_DISCIPLINES: Discipline[] = [
  { id: 'camouflage', names: { it: 'Mimetismo', en: 'Camouflage', de: 'Tarnung' } },
  { id: 'hunting', names: { it: 'Caccia', en: 'Hunting', de: 'Jagd' } },
  { id: 'sixth-sense', names: { it: 'Sesto Senso', en: 'Sixth Sense', de: 'Sechster Sinn' } },
  { id: 'tracking', names: { it: 'Orientamento', en: 'Tracking', de: 'Spurensuche' } },
  { id: 'healing', names: { it: 'Guarigione', en: 'Healing', de: 'Heilung' } },
  { id: 'weaponskill', names: { it: 'Arte del Combattimento', en: 'Weaponskill', de: 'Waffenkunde' } },
  { id: 'mindshield', names: { it: 'Schermo Psichico', en: 'Mindshield', de: 'Gedankensperre' } },
  { id: 'mindblast', names: { it: 'Assalto Psichico', en: 'Mindblast', de: 'Gedankenstrahl' } },
  { id: 'animal-kinship', names: { it: 'Affinità Animale', en: 'Animal Kinship', de: 'Tierverständnis' } },
  { id: 'mind-over-matter', names: { it: 'Telecinesi', en: 'Mind Over Matter', de: 'Geist über Materie' } },
]

/** Armi della tabella di Waffenkunde/Weaponskill (Libro 1), senza doppioni. */
export const WEAPONS: Array<{ id: string; names: Record<Lang, string> }> = [
  { id: 'dagger', names: { it: 'Pugnale', en: 'Dagger', de: 'Dolch' } },
  { id: 'spear', names: { it: 'Lancia', en: 'Spear', de: 'Speer' } },
  { id: 'mace', names: { it: 'Mazza', en: 'Mace', de: 'Streitkolben' } },
  { id: 'short-sword', names: { it: 'Daga', en: 'Short Sword', de: 'Kurzschwert' } },
  { id: 'warhammer', names: { it: 'Martello da guerra', en: 'Warhammer', de: 'Kriegshammer' } },
  { id: 'sword', names: { it: 'Spada', en: 'Sword', de: 'Schwert' } },
  { id: 'axe', names: { it: 'Ascia', en: 'Axe', de: 'Axt' } },
  { id: 'quarterstaff', names: { it: 'Bastone', en: 'Quarterstaff', de: 'Kampfstab' } },
  { id: 'broadsword', names: { it: 'Spadone', en: 'Broadsword', de: 'Breitschwert' } },
]

const norm = (s: string) => s.trim().toLowerCase()

/**
 * Indice della voce in `list` che corrisponde alla disciplina, in qualunque lingua.
 * Riconosce anche le varianti con l'arma, es. "Waffenkunde: Schwert".
 */
export function findDiscipline(list: string[], d: Discipline): number {
  const names = Object.values(d.names).map(norm)
  return list.findIndex((entry) => {
    const e = norm(entry)
    return names.some((n) => e === n || e.startsWith(n + ':') || e.startsWith(n + ' ('))
  })
}

/** Numero di discipline consigliato in base al numero del libro (1 = 5, poi +1). */
export function expectedDisciplines(bookNumber: number): number {
  return 5 + Math.max(0, bookNumber - 1)
}
