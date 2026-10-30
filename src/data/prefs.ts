import { useSyncExternalStore } from 'react'

export type TextSize = 'normal' | 'large' | 'xlarge'
export type ThemeMode = 'light' | 'dark' | 'auto'

export interface Prefs {
  textSize: TextSize
  theme: ThemeMode
  highContrast: boolean
}

const KEY = 'nexus:prefs'
// Padrão pensado em adultos: tema claro e texto já um pouco maior que o comum.
const DEFAULTS: Prefs = { textSize: 'large', theme: 'light', highContrast: false }

function load(): Prefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) }
  } catch {
    // sem acesso ao armazenamento: usa o padrão
  }
  return DEFAULTS
}

let state: Prefs = load()
const listeners = new Set<() => void>()

export function applyPrefs(p: Prefs = state): void {
  const el = document.documentElement
  el.dataset.text = p.textSize
  el.dataset.theme = p.theme
  el.dataset.contrast = p.highContrast ? 'high' : 'normal'
}

export function setPrefs(patch: Partial<Prefs>): void {
  state = { ...state, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // preferência vale só nesta sessão
  }
  applyPrefs()
  listeners.forEach((l) => l())
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state,
  )
}
