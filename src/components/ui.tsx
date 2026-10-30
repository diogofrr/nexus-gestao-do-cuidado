import { useEffect, useId, useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  CalendarClock,
  ChevronLeft,
  Info,
  Pill,
  Stethoscope,
  Ticket,
  TriangleAlert,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { AgendaKind } from '../services/agenda'

// ---------- estrutura de página ----------

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string
  sub?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="page-head">
      <div className="grow">
        <h1>{title}</h1>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </header>
  )
}

export function BackLink({ to, children = 'Voltar' }: { to?: string; children?: ReactNode }) {
  const navigate = useNavigate()
  if (to) {
    return (
      <Link to={to} className="back">
        <ChevronLeft size={20} aria-hidden /> {children}
      </Link>
    )
  }
  return (
    <button className="back" style={{ border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit' }} onClick={() => navigate(-1)}>
      <ChevronLeft size={20} aria-hidden /> {children}
    </button>
  )
}

export function Seg({ tabs }: { tabs: { to: string; label: string }[] }) {
  return (
    <nav className="seg" aria-label="Seções">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function CuidadoTabs() {
  return (
    <Seg
      tabs={[
        { to: '/consultas', label: 'Consultas' },
        { to: '/medicacoes', label: 'Remédios' },
        { to: '/tarefas', label: 'Tarefas' },
        { to: '/profissionais', label: 'Rede' },
      ]}
    />
  )
}

export function ApoioTabs() {
  return (
    <Seg
      tabs={[
        { to: '/psicologos', label: 'Psicólogos' },
        { to: '/chat', label: 'Conversar' },
        { to: '/plantao', label: 'Autocuidado' },
      ]}
    />
  )
}

export function EventosTabs() {
  return (
    <Seg
      tabs={[
        { to: '/eventos', label: 'Programação' },
        { to: '/meus-ingressos', label: 'Meus ingressos' },
      ]}
    />
  )
}

// ---------- ícones por tipo de item ----------

const KIND_ICON: Record<AgendaKind, LucideIcon> = {
  consulta: Stethoscope,
  remedio: Pill,
  sessao: Video,
  evento: Ticket,
}

export function KindIcon({ kind, now = false, size = 20 }: { kind: AgendaKind; now?: boolean; size?: number }) {
  const Icon = KIND_ICON[kind]
  return (
    <span className={`kind ${now ? 'now' : kind}`} aria-hidden>
      <Icon size={size} strokeWidth={1.9} />
    </span>
  )
}

// ---------- formulários ----------

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: (id: string) => ReactNode
}) {
  const id = useId()
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
    <div className={`banner ${planLimit ? 'warn' : 'danger'}`} role="alert">
      <TriangleAlert size={20} aria-hidden />
      <div>
        <p>{message}</p>
        {planLimit && (
          <p style={{ marginTop: 6 }}>
            <Link to="/configuracoes/plano" onClick={onNavigate}>Ver planos</Link>
          </p>
        )}
      </div>
    </div>
  )
}

export function Banner({
  tone = 'info',
  children,
  icon: Icon = Info,
}: {
  tone?: 'info' | 'warn' | 'danger' | 'success'
  children: ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className={`banner ${tone === 'info' ? '' : tone}`}>
      <Icon size={20} aria-hidden />
      <div>{children}</div>
    </div>
  )
}

export function Empty({ icon: Icon = CalendarClock, title, children }: { icon?: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="glyph" aria-hidden>
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <h3>{title}</h3>
      {children}
    </div>
  )
}

export function Avatar({
  name,
  hue = 210,
  size,
}: {
  name: string
  hue?: number
  size?: 'sm' | 'lg'
}) {
  const initial = name.replace(/^(Dra?\.)\s*/, '')[0]?.toUpperCase() ?? '?'
  return (
    <div className={`avatar${size ? ` ${size}` : ''}`} style={{ background: `hsl(${hue} 48% 38%)` }} aria-hidden>
      {initial}
    </div>
  )
}

// ---------- sheet: só para confirmar e para pagar ----------

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="grab" aria-hidden />
        <div className="row between" style={{ marginBottom: '0.9rem', flexWrap: 'nowrap' }}>
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
export const Modal = Sheet

export function Confirm({
  label,
  message,
  onConfirm,
  className = 'btn danger sm',
  children,
}: {
  label: string
  message: string
  onConfirm: () => void
  className?: string
  children?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {children ?? label}
      </button>
      {open && (
        <Sheet title="Confirmar" onClose={() => setOpen(false)}>
          <p style={{ marginBottom: '1.1rem' }}>{message}</p>
          <div className="stack">
            <button
              className="btn danger lg block"
              onClick={() => {
                setOpen(false)
                onConfirm()
              }}
            >
              {label}
            </button>
            <button className="btn ghost lg block" onClick={() => setOpen(false)}>Voltar</button>
          </div>
        </Sheet>
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
      t = window.setTimeout(() => setMsg(null), 3600)
    }
    return () => window.clearTimeout(t)
  }, [])
  return msg ? <div className="toast" role="status">{msg}</div> : null
}
