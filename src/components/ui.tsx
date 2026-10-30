import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Psychologist } from '../domain/types'

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="row between" style={{ marginBottom: 14 }}>
          <h2>{title}</h2>
          <button className="btn ghost sm" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: (id: string) => ReactNode
}) {
  const id = `f-${label.replace(/\W/g, '').toLowerCase()}`
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}

/** Aviso de erro; quando é limite de plano, oferece o caminho para os planos. */
export function FormError({ message, onNavigate }: { message: string; onNavigate?: () => void }) {
  if (!message) return null
  const planLimit = /plano Basic/.test(message)
  return (
    <div className={`alert ${planLimit ? 'warn' : 'error'}`} role="alert">
      <p>{message}</p>
      {planLimit && (
        <p style={{ marginTop: 8 }}>
          <Link to="/configuracoes" onClick={onNavigate}>Ver planos →</Link>
        </p>
      )}
    </div>
  )
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="card empty">
      <div style={{ fontSize: '2rem' }} aria-hidden>{icon}</div>
      <h3 style={{ color: 'var(--text)', margin: '6px 0' }}>{title}</h3>
      {children}
    </div>
  )
}

export function Avatar({ psych }: { psych: Pick<Psychologist, 'name' | 'hue'> }) {
  const initial = psych.name.replace(/^(Dra?\.)\s*/, '')[0]
  return (
    <div className="avatar" style={{ background: `hsl(${psych.hue} 55% 42%)` }} aria-hidden>
      {initial}
    </div>
  )
}

export function Confirm({
  label,
  message,
  onConfirm,
  className = 'btn danger sm',
}: {
  label: string
  message: string
  onConfirm: () => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>{label}</button>
      {open && (
        <Modal title="Confirmar" onClose={() => setOpen(false)}>
          <p style={{ marginBottom: 16 }}>{message}</p>
          <div className="row">
            <button className="btn danger" onClick={() => { setOpen(false); onConfirm() }}>{label}</button>
            <button className="btn ghost" onClick={() => setOpen(false)}>Voltar</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ---------- toast ----------

let pushToast: (msg: string) => void = () => {}
export const toast = (msg: string) => pushToast(msg)

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let t: number | undefined
    pushToast = (m) => {
      setMsg(m)
      window.clearTimeout(t)
      t = window.setTimeout(() => setMsg(null), 3200)
    }
    return () => window.clearTimeout(t)
  }, [])
  return msg ? <div className="toast" role="status">{msg}</div> : null
}
