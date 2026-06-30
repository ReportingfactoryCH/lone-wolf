// Le 10 Discipline Kai del Libro 1 (Kai). Nel Libro 1 se ne scelgono 5;
// +1 per ogni libro successivo della serie. Reso data-driven: l'utente sceglie
// liberamente nell'Action Chart, l'app mostra solo un riferimento al numero atteso.

export interface Discipline {
  id: string
  name: string
  description: string
}

export const KAI_DISCIPLINES: Discipline[] = [
  { id: 'camouflage', name: 'Mimetismo', description: 'Confondersi con l’ambiente naturale o urbano.' },
  { id: 'hunting', name: 'Caccia', description: 'Procurarsi cibo nelle terre selvagge (niente pasti richiesti).' },
  { id: 'sixth-sense', name: 'Sesto Senso', description: 'Percepire pericoli e l’indole altrui.' },
  { id: 'tracking', name: 'Orientamento', description: 'Scegliere la via giusta e seguire tracce.' },
  { id: 'healing', name: 'Guarigione', description: 'Recuperare Resistenza quando non si combatte.' },
  { id: 'weaponskill', name: 'Arte del Combattimento', description: 'Maestria con un’arma estratta a sorte (+2 CS con quell’arma).' },
  { id: 'mindshield', name: 'Schermo Psichico', description: 'Difesa dagli attacchi mentali nemici.' },
  { id: 'mindblast', name: 'Assalto Psichico', description: 'Colpire la mente del nemico (+2 CS contro chi non è schermato).' },
  { id: 'animal-kinship', name: 'Affinità Animale', description: 'Comunicare con alcuni animali.' },
  { id: 'mind-over-matter', name: 'Telecinesi', description: 'Muovere oggetti con la forza del pensiero.' },
]

/** Numero di discipline consigliato in base al numero del libro (1 = 5, poi +1). */
export function expectedDisciplines(bookNumber: number): number {
  return 5 + Math.max(0, bookNumber - 1)
}
