import { useCallback } from 'react'
import { useStore } from '../store'
import { translate, type TFunc } from './index'

/** Hook: restituisce la funzione di traduzione legata alla lingua corrente dello store. */
export function useT(): TFunc {
  const lang = useStore((s) => s.lang)
  return useCallback<TFunc>((key, vars) => translate(lang, key, vars), [lang])
}
