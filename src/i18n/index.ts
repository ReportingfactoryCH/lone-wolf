import { en } from './en'
import { it } from './it'

// i18n leggero e tipizzato: due dizionari bundlati (niente rete, offline-first),
// chiavi verificate a compile-time. Interpolazione semplice con {segnaposto}.

export type Lang = 'it' | 'en'
export type TKey = keyof typeof en

export const LANGS: Lang[] = ['it', 'en']

export const dictionaries: Record<Lang, Record<TKey, string>> = { en, it }

/** Traduce una chiave nella lingua data, con fallback a inglese e interpolazione {var}. */
export function translate(lang: Lang, key: TKey, vars?: Record<string, string | number>): string {
  let s = dictionaries[lang][key] ?? dictionaries.en[key] ?? key
  if (vars) {
    for (const k of Object.keys(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]))
    }
  }
  return s
}

/** Lingua iniziale: preferenza salvata → lingua del dispositivo → inglese. */
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem('lupo-lang')
    if (saved === 'it' || saved === 'en') return saved
  } catch {
    /* localStorage non disponibile: ignora */
  }
  const nav = (navigator.language || '').toLowerCase()
  return nav.startsWith('it') ? 'it' : 'en'
}

export type TFunc = (key: TKey, vars?: Record<string, string | number>) => string
