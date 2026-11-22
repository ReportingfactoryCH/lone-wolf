import { en } from './en'
import { it } from './it'
import { de } from './de'

// i18n leggero e tipizzato: tre dizionari bundlati (niente rete, offline-first),
// chiavi verificate a compile-time. Interpolazione semplice con {segnaposto}.

export type Lang = 'it' | 'en' | 'de'
export type TKey = keyof typeof en

export const LANGS: Lang[] = ['it', 'en', 'de']

export const dictionaries: Record<Lang, Record<TKey, string>> = { en, it, de }

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
    if (saved === 'it' || saved === 'en' || saved === 'de') return saved
  } catch {
    /* localStorage non disponibile: ignora */
  }
  const nav = (navigator.language || '').toLowerCase()
  if (nav.startsWith('it')) return 'it'
  if (nav.startsWith('de')) return 'de'
  return 'en'
}

export type TFunc = (key: TKey, vars?: Record<string, string | number>) => string

/** Locale BCP 47 per formattare date/ore nella lingua dell'interfaccia. */
export const LOCALES: Record<Lang, string> = { it: 'it-IT', en: 'en-GB', de: 'de-DE' }
