import { Check } from 'lucide-react'
import { setPrefs, usePrefs, type TextSize, type ThemeMode } from '../data/prefs'
import { Sheet } from './ui'

const SIZES: { id: TextSize; label: string; px: string }[] = [
  { id: 'normal', label: 'Normal', px: '1rem' },
  { id: 'large', label: 'Grande', px: '1.2rem' },
  { id: 'xlarge', label: 'Muito grande', px: '1.45rem' },
]

const THEMES: { id: ThemeMode; label: string }[] = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
  { id: 'auto', label: 'Automático' },
]

/** Controles de texto, tema e contraste. Usados na folha rápida e na página de Configurações. */
export function AppearanceControls() {
  const prefs = usePrefs()
  return (
    <div className="stack-lg">
      <div className="stack">
        <h3>Tamanho do texto</h3>
        <div className="stack" role="group" aria-label="Tamanho do texto">
          {SIZES.map((s) => (
            <button key={s.id} className="option" aria-pressed={prefs.textSize === s.id} onClick={() => setPrefs({ textSize: s.id })}>
              <span style={{ fontSize: s.px, fontWeight: 700, width: '1.8rem', textAlign: 'center' }} aria-hidden>Aa</span>
              <span className="grow" style={{ fontWeight: 650 }}>{s.label}</span>
              {prefs.textSize === s.id && <Check size={20} aria-hidden />}
            </button>
          ))}
        </div>
      </div>

      <div className="stack">
        <h3>Tema</h3>
        <div className="chips wrap" role="group" aria-label="Tema">
          {THEMES.map((t) => (
            <button key={t.id} className="chip" aria-pressed={prefs.theme === t.id} onClick={() => setPrefs({ theme: t.id })}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <label className="list switch" style={{ borderRadius: 'var(--radius)' }}>
        <b>Alto contraste</b>
        <input type="checkbox" checked={prefs.highContrast} onChange={(e) => setPrefs({ highContrast: e.target.checked })} />
        <span className="track" aria-hidden />
      </label>
    </div>
  )
}

export default function AppearanceSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="Texto e tema" onClose={onClose}>
      <AppearanceControls />
      <button className="btn block lg" style={{ marginTop: '1.25rem' }} onClick={onClose}>Pronto</button>
    </Sheet>
  )
}
