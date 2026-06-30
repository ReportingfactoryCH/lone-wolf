import type { Book, Rendition } from 'epubjs'

// ---------------------------------------------------------------------------
// Navigazione per SEZIONE (non per pagina). Negli EPUB di Project Aon ogni
// sezione numerata è tipicamente un file dello spine tipo "sect217.xhtml" e/o
// un'ancora con id "sect217". Costruiamo un indice numero->href alla prima
// apertura e lo cachiamo nel record del libro.
// ---------------------------------------------------------------------------

export type SectionIndex = Record<string, string> // "217" -> href

const SECT_RE = /sect(\d+)/i

/**
 * Costruisce l'indice sezione->href scandendo lo spine del libro.
 * Robusto: se i nomi non seguono lo schema sectNNN, l'indice resta vuoto e la
 * navigazione per sezione semplicemente non troverà corrispondenze (ma il reader
 * funziona comunque).
 */
export async function buildSectionIndex(book: Book): Promise<SectionIndex> {
  const index: SectionIndex = {}
  try {
    await book.ready
    // epubjs: lo spine espone spineItems con href/idref.
    const spine = (book.spine as unknown as { spineItems?: Array<{ href?: string; idref?: string }> })
      .spineItems
    if (Array.isArray(spine)) {
      for (const item of spine) {
        const candidate = item.href || item.idref || ''
        const m = candidate.match(SECT_RE)
        if (m) {
          const n = String(parseInt(m[1], 10))
          if (!(n in index)) index[n] = item.href || candidate
        }
      }
    }
  } catch (err) {
    console.warn('[sections] buildSectionIndex fallito:', err)
  }
  return index
}

/** Risolve il target di navigazione per una sezione N. Prova indice, poi fallback. */
export function targetForSection(index: SectionIndex, n: string): string | null {
  const key = String(parseInt(n, 10))
  if (index[key]) return index[key]
  // Fallback: tenta l'ancora classica di Project Aon.
  return null
}

/** Naviga il rendition a una sezione N (o a un href/CFI grezzo). Ritorna true se tentato. */
export async function goToSection(
  rendition: Rendition,
  index: SectionIndex,
  n: string,
): Promise<boolean> {
  const target = targetForSection(index, n)
  const dest = target ?? guessHref(n)
  try {
    await rendition.display(dest)
    return true
  } catch (err) {
    console.warn('[sections] goToSection fallita per', dest, err)
    return false
  }
}

/** Ipotesi di href quando l'indice non copre la sezione (schema Project Aon). */
function guessHref(n: string): string {
  const num = String(parseInt(n, 10))
  return `sect${num}.xhtml`
}

/** Estrae il numero di sezione da un href, se presente (es. "…/sect217.xhtml" -> "217"). */
export function sectionFromHref(href: string | undefined | null): string | null {
  if (!href) return null
  const m = href.match(SECT_RE)
  return m ? String(parseInt(m[1], 10)) : null
}

/**
 * Registra un intercettatore sui click ai link interni del rendition, per
 * LOGGARE i salti nel war log. NON impedisce la navigazione: epub.js gestisce
 * comunque lo spostamento; noi osserviamo soltanto.
 */
export function attachLinkInterceptor(
  rendition: Rendition,
  onInternalLink: (sectionOrHref: string) => void,
): void {
  try {
    // hooks.content: viene eseguito per ogni documento renderizzato.
    const hooks = (rendition as unknown as {
      hooks?: { content?: { register: (fn: (contents: { document: Document }) => void) => void } }
    }).hooks
    hooks?.content?.register((contents) => {
      const doc = contents.document
      doc.querySelectorAll('a[href]').forEach((a) => {
        a.addEventListener('click', () => {
          const href = (a as HTMLAnchorElement).getAttribute('href') || ''
          const sect = sectionFromHref(href)
          onInternalLink(sect ?? href)
        })
      })
    })
  } catch (err) {
    console.warn('[sections] attachLinkInterceptor fallito:', err)
  }
}
