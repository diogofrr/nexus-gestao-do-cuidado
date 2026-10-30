import { useSyncExternalStore } from 'react'

export type TextSize = 'normal' | 'large' | 'xlarge'
export type ThemeMode = 'light' | 'dark' | 'auto'

export interface Prefs {
  textSize: TextSize
  theme: ThemeMode
  highContrast: boolean
}

const KEY = 'nexus:prefs'
const DEFAULTS: Prefs = { textSize: 'normal', theme: 'light', highContrast: false }

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
const darkQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

export function applyPrefs(p: Prefs = state): void {
  const el = document.documentElement
  el.dataset.text = p.textSize
  el.dataset.theme = p.theme
  el.dataset.contrast = p.highContrast ? 'high' : 'normal'
  // No modo automático, o CSS usa [data-dark] para acompanhar o sistema.
  if (p.theme === 'auto' && darkQuery?.matches) el.dataset.dark = ''
  else delete el.dataset.dark
}

darkQuery?.addEventListener('change', () => applyPrefs())

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
