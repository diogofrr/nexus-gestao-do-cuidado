import { setPrefs, usePrefs, type TextSize, type ThemeMode } from '../data/prefs'
import { Modal } from './ui'

const SIZES: { id: TextSize; label: string; sample: string }[] = [
  { id: 'normal', label: 'Normal', sample: '16px' },
  { id: 'large', label: 'Grande', sample: '20px' },
  { id: 'xlarge', label: 'Muito grande', sample: '24px' },
]

const THEMES: { id: ThemeMode; label: string }[] = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
  { id: 'auto', label: 'Automático' },
]

export default function AccessibilityModal({ onClose }: { onClose: () => void }) {
  const prefs = usePrefs()
  return (
    <Modal title="Aparência e leitura" onClose={onClose}>
      <div className="stack">
        <div className="stack">
          <h3>Tamanho do texto</h3>
          <div className="chips" role="group" aria-label="Tamanho do texto">
            {SIZES.map((s) => (
              <button key={s.id} className="chip" aria-pressed={prefs.textSize === s.id} onClick={() => setPrefs({ textSize: s.id })}>
                <span style={{ fontSize: s.sample }}>A</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="stack">
          <h3>Tema</h3>
          <div className="chips" role="group" aria-label="Tema">
            {THEMES.map((t) => (
              <button key={t.id} className="chip" aria-pressed={prefs.theme === t.id} onClick={() => setPrefs({ theme: t.id })}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <label className="switch">
          <span>
            <b>Alto contraste</b>
            <br />
            <span className="muted small">Letras mais escuras e bordas mais marcadas</span>
          </span>
          <input type="checkbox" checked={prefs.highContrast} onChange={(e) => setPrefs({ highContrast: e.target.checked })} />
        </label>

        <p className="muted small">Suas escolhas ficam salvas neste aparelho.</p>
        <button className="btn block" onClick={onClose}>Pronto</button>
      </div>
    </Modal>
  )
}
