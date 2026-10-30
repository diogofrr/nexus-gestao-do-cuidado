import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { cancelSession, removeAppointment, saveAppointment } from '../data/actions'
import { useDb } from '../data/store'
import type { Appointment, AppointmentStatus, PsychSession, SessionStatus } from '../domain/types'
import { Avatar, Confirm, Empty, Field, FormError, Modal, toast } from '../components/ui'
import { formatDateShort, formatMoney, friendlyDate, parseDateTime } from '../services/dates'
import { CANCEL_LIMIT_HOURS, JOIN_OPENS_MINUTES, canCancelSession, isSessionOpen, isSessionOver, meetingUrl } from '../services/sessions'

type Filter = 'todas' | AppointmentStatus
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'agendada', label: 'Agendada' },
  { id: 'realizada', label: 'Realizada' },
  { id: 'cancelada', label: 'Cancelada' },
]
const STATUS_BADGE: Record<AppointmentStatus, string> = { agendada: '', realizada: 'success', cancelada: 'neutral' }

type Item =
  | { kind: 'medica'; at: number; data: Appointment }
  | { kind: 'psico'; at: number; data: PsychSession }

const blank = (): Omit<Appointment, 'id'> => ({
  title: '', doctor: '', specialty: '', status: 'agendada', date: '', time: '',
})

export default function Consultas() {
  const db = useDb()
  const [filter, setFilter] = useState<Filter>('todas')
  const [editing, setEditing] = useState<(Omit<Appointment, 'id'> & { id?: string }) | null>(null)

  const items: Item[] = [
    ...db.appointments.map((a) => ({ kind: 'medica' as const, at: parseDateTime(a.date, a.time).getTime(), data: a })),
    ...db.sessions.filter((s) => !s.external).map((s) => ({ kind: 'psico' as const, at: parseDateTime(s.date, s.time).getTime(), data: s })),
  ]
    .filter((i) => {
      const status = i.kind === 'psico' && i.data.status === 'agendada' && isSessionOver(i.data) ? 'realizada' : i.data.status
      return filter === 'todas' || status === filter
    })
    .sort((a, b) => a.at - b.at)

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Consultas</h1>
          <p>Gerencie os atendimentos</p>
        </div>
        <div className="row">
          <Link to="/psicologos" className="btn secondary">Agendar com psicólogo</Link>
          <button className="btn" onClick={() => setEditing(blank())}>+ Nova consulta</button>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Filtrar por status">
        {FILTERS.map((f) => (
          <button key={f.id} className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <Empty icon="🩺" title="Nenhuma consulta encontrada">
          <p>Cadastre uma consulta médica ou agende uma sessão com um psicólogo.</p>
        </Empty>
      ) : (
        items.map((i) =>
          i.kind === 'medica' ? (
            <div key={i.data.id} className="card row between">
              <div className="grow">
                <h3>{i.data.title}</h3>
                <p className="muted small">{i.data.doctor} · {i.data.specialty}</p>
                <div className="row" style={{ marginTop: 6 }}>
                  <span className={`badge ${STATUS_BADGE[i.data.status]}`}>{i.data.status[0].toUpperCase() + i.data.status.slice(1)}</span>
                  <span className="small">{formatDateShort(i.data.date)} · {i.data.time}</span>
                </div>
              </div>
              <div className="row">
                <button className="btn ghost sm" onClick={() => setEditing(i.data)}>Editar</button>
                <Confirm label="Remover" message={`Remover "${i.data.title}"?`} onConfirm={() => { removeAppointment(i.data.id); toast('Consulta removida') }} />
              </div>
            </div>
          ) : (
            <SessionCard key={i.data.id} session={i.data} />
          ),
        )
      )}

      {editing && <AppointmentForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function SessionCard({ session }: { session: PsychSession }) {
  const db = useDb()
  const psych = db.psychologists.find((p) => p.id === session.psychologistId)
  if (!psych) return null
  const now = new Date()
  const onCancel = () => {
    const r = cancelSession(session.id)
    toast(r.ok ? 'Sessão cancelada. O horário foi liberado.' : r.error)
  }
  // Sessão agendada cujo horário já passou é exibida como realizada.
  const status: SessionStatus = session.status === 'agendada' && isSessionOver(session, now) ? 'realizada' : session.status
  const open = isSessionOpen(session, now)
  const cancellable = canCancelSession(session, now)
  return (
    <div className="card stack">
      <div className="row between">
        <div className="row grow">
          <Avatar psych={psych} />
          <div className="grow">
            <div className="row">
              <h3>Sessão de psicologia</h3>
              <span className="badge">Psicologia</span>
            </div>
            <p className="muted small">{psych.name} · {session.modality === 'online' ? 'Online' : 'Presencial'} · {formatMoney(session.priceCents)}</p>
            <div className="row" style={{ marginTop: 6 }}>
              <span className={`badge ${open ? 'success live' : STATUS_BADGE[status]}`}>
                {open ? 'Acontecendo agora' : status[0].toUpperCase() + status.slice(1)}
              </span>
              <span className="small">{friendlyDate(session.date, now)} · {session.time}</span>
            </div>
          </div>
        </div>
      </div>
      {status === 'agendada' && (
        <div className="row">
          {session.modality === 'online' &&
            (open ? (
              <a className="btn" href={meetingUrl(session)} target="_blank" rel="noreferrer">Entrar na sessão</a>
            ) : (
              <span className="small muted">O link da sessão abre {JOIN_OPENS_MINUTES} minutos antes do horário.</span>
            ))}
          {session.modality === 'presencial' && <span className="small muted">📍 {psych.name} atende no consultório. O endereço chega por e-mail.</span>}
          {cancellable ? (
            <Confirm label="Cancelar sessão" message="Cancelar esta sessão? O horário volta a ficar disponível." onConfirm={onCancel} />
          ) : open ? null : (
            <span className="small muted">Cancelamento só até {CANCEL_LIMIT_HOURS}h antes. Para remarcar, fale com a equipe.</span>
          )}
        </div>
      )}
    </div>
  )
}

function AppointmentForm({
  initial,
  onClose,
}: {
  initial: Omit<Appointment, 'id'> & { id?: string }
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const set = <K extends keyof Appointment>(k: K, v: Appointment[K]) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date || !form.time) {
      setError('Informe título, data e horário.')
      return
    }
    const r = saveAppointment({ ...form, title: form.title.trim() })
    if (!r.ok) return setError(r.error)
    toast(initial.id ? 'Consulta atualizada' : 'Consulta cadastrada')
    onClose()
  }

  return (
    <Modal title={initial.id ? 'Editar consulta' : 'Nova consulta'} onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        <Field label="Título*">{(id) => <input id={id} value={form.title} onChange={(e) => set('title', e.target.value)} />}</Field>
        <div className="form-grid">
          <Field label="Médico(a)">{(id) => <input id={id} value={form.doctor} onChange={(e) => set('doctor', e.target.value)} />}</Field>
          <Field label="Especialidade">{(id) => <input id={id} value={form.specialty} onChange={(e) => set('specialty', e.target.value)} />}</Field>
          <Field label="Data*">{(id) => <input id={id} type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />}</Field>
          <Field label="Horário*">{(id) => <input id={id} type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />}</Field>
        </div>
        <Field label="Status">
          {(id) => (
            <select id={id} value={form.status} onChange={(e) => set('status', e.target.value as AppointmentStatus)}>
              <option value="agendada">Agendada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          )}
        </Field>
        <FormError message={error} onNavigate={onClose} />
        <div className="row">
          <button className="btn" type="submit">Salvar</button>
          <button className="btn ghost" type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}
