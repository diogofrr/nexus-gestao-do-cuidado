import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus, Stethoscope } from 'lucide-react'
import { useDb } from '../data/store'
import type { Appointment, AppointmentStatus, PsychSession } from '../domain/types'
import { CuidadoTabs, Empty, PageHeader } from '../components/ui'
import { friendlyDate, parseDateStr, parseDateTime } from '../services/dates'
import { isSessionOpen, isSessionOver } from '../services/sessions'
import { useNow } from '../hooks/useNow'

type Filter = 'proximas' | 'anteriores'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'proximas', label: 'Próximas' },
  { id: 'anteriores', label: 'Anteriores' },
]

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

type Entry =
  | { kind: 'medica'; at: number; status: AppointmentStatus; data: Appointment }
  | { kind: 'psico'; at: number; status: AppointmentStatus; data: PsychSession }

export default function Consultas() {
  const db = useDb()
  const now = useNow()
  const [filter, setFilter] = useState<Filter>('proximas')

  const entries: Entry[] = [
    ...db.appointments.map((a) => ({ kind: 'medica' as const, at: parseDateTime(a.date, a.time).getTime(), status: a.status, data: a })),
    ...db.sessions
      .filter((s) => !s.external)
      .map((s) => ({
        kind: 'psico' as const,
        at: parseDateTime(s.date, s.time).getTime(),
        // Sessão agendada cujo horário já passou conta como realizada.
        status: (s.status === 'agendada' && isSessionOver(s, now) ? 'realizada' : s.status) as AppointmentStatus,
        data: s,
      })),
  ]

  const list = entries
    .filter((e) => (filter === 'proximas' ? e.status === 'agendada' : e.status !== 'agendada'))
    .sort((a, b) => (filter === 'proximas' ? a.at - b.at : b.at - a.at))

  return (
    <div className="page">
      <PageHeader title="Cuidado" />
      <CuidadoTabs />

      <div className="chips" role="group" aria-label="Filtrar consultas">
        {FILTERS.map((f) => (
          <button key={f.id} className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '0.9rem' }}>
        {list.length === 0 ? (
          <div className="card">
            <Empty icon={Stethoscope} title={filter === 'proximas' ? 'Nenhuma consulta marcada' : 'Nada por aqui'} />
          </div>
        ) : (
          <div className="list">
            {list.map((e) => {
              const d = parseDateStr(e.data.date)
              const psych = e.kind === 'psico' ? db.psychologists.find((p) => p.id === e.data.psychologistId) : null
              const open = e.kind === 'psico' && isSessionOpen(e.data, now)
              return (
                <Link
                  key={e.data.id}
                  to={e.kind === 'medica' ? `/consultas/${e.data.id}` : `/sessoes/${e.data.id}`}
                  className={`item${e.status === 'cancelada' ? ' off' : ''}`}
                >
                  <div className="datebox">
                    <b>{d.getDate()}</b>
                    <span>{MONTHS[d.getMonth()]}</span>
                  </div>
                  <div className="main">
                    <div className="title">{e.kind === 'medica' ? e.data.title : `Sessão com ${psych?.name ?? 'psicólogo'}`}</div>
                    <div className="meta">
                      {friendlyDate(e.data.date, now)}, {e.data.time}
                      {e.kind === 'medica' ? ` · ${e.data.doctor}` : ` · ${e.data.modality === 'online' ? 'online' : 'presencial'}`}
                    </div>
                    {(open || e.status === 'realizada' || e.status === 'cancelada') && (
                      <div className="row" style={{ marginTop: 6, gap: '0.4rem' }}>
                        {open && <span className="pill now"><span className="live-dot" aria-hidden /> Agora</span>}
                        {e.status === 'realizada' && <span className="pill">Realizada</span>}
                        {e.status === 'cancelada' && <span className="pill">Cancelada</span>}
                      </div>
                    )}
                  </div>
                  <span className="trail"><ChevronRight size={20} aria-hidden /></span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <Link to="/consultas/novo" className="btn fab"><Plus size={22} aria-hidden /> Nova consulta</Link>
    </div>
  )
}
