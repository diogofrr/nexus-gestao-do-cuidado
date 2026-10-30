import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { bookSession, sessionPrice } from '../data/actions'
import { useDb } from '../data/store'
import { Avatar, Empty, Field, Modal } from '../components/ui'
import Payment from '../components/Payment'
import { BOOKING_WINDOW_DAYS, getFreeSlots, isDateBookable, nextAvailableDate } from '../services/availability'
import { addDays, formatDateLong, formatMoney, monthTitle, toDateStr } from '../services/dates'
import type { Modality } from '../domain/types'

const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export default function PsicologoDetalhe() {
  const { id } = useParams()
  const db = useDb()
  const navigate = useNavigate()
  const psych = db.psychologists.find((p) => p.id === id)

  const today = new Date()
  const [cursor, setCursor] = useState(() => {
    const first = psych ? nextAvailableDate(psych, db.sessions) : null
    const [y, m] = first ? first.split('-').map(Number) : [today.getFullYear(), today.getMonth() + 1]
    return { y, m: m - 1 }
  })
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [modality, setModality] = useState<Modality | null>(null)
  const [reason, setReason] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const days = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1)
    const count = new Date(cursor.y, cursor.m + 1, 0).getDate()
    return { offset: first.getDay(), count }
  }, [cursor])

  if (!psych) {
    return (
      <Empty icon="🔍" title="Psicólogo não encontrado">
        <Link to="/psicologos">Voltar à lista</Link>
      </Empty>
    )
  }

  const lastDay = toDateStr(addDays(today, BOOKING_WINDOW_DAYS))
  const slots = date ? getFreeSlots(psych, date, db.sessions) : []
  const chosenModality = modality ?? (psych.modalities.length === 1 ? psych.modalities[0] : null)
  const price = sessionPrice(psych.id)
  const ready = date && time && chosenModality

  const shiftMonth = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })

  const confirm = (): string | null => {
    if (!date || !time || !chosenModality) return 'Escolha data, horário e modalidade.'
    const r = bookSession({ psychologistId: psych.id, date, time, modality: chosenModality, reason })
    if (!r.ok) {
      setPaying(false)
      setTime(null)
      setError(r.error)
      return r.error
    }
    navigate(`/confirmacao/sessao/${r.value.id}`)
    return null
  }

  return (
    <div className="stack">
      <Link to="/psicologos" className="back">← Psicólogos</Link>

      <div className="card stack">
        <div className="row">
          <Avatar psych={psych} />
          <div>
            <h1 style={{ fontSize: '1.3rem' }}>{psych.name}</h1>
            <p className="muted small">{psych.crp}</p>
          </div>
        </div>
        <p>{psych.bio}</p>
        <div className="chips">
          {psych.specialties.map((s) => <span key={s} className="badge">{s}</span>)}
          {psych.modalities.map((m) => <span key={m} className="badge neutral">{m === 'online' ? 'Online' : 'Presencial'}</span>)}
        </div>
        <p className="price">{formatMoney(price)} por sessão</p>
      </div>

      <section className="card stack" aria-label="Escolha da data">
        <div className="row between">
          <button className="btn ghost sm" onClick={() => shiftMonth(-1)} aria-label="Mês anterior" disabled={cursor.y === today.getFullYear() && cursor.m === today.getMonth()}>‹</button>
          <h2>{monthTitle(cursor.y, cursor.m)}</h2>
          <button className="btn ghost sm" onClick={() => shiftMonth(1)} aria-label="Próximo mês">›</button>
        </div>
        <div className="cal">
          {DOW.map((d, i) => <div key={i} className="dow" aria-hidden>{d}</div>)}
          {Array.from({ length: days.offset }, (_, i) => <span key={`b${i}`} />)}
          {Array.from({ length: days.count }, (_, i) => {
            const d = toDateStr(new Date(cursor.y, cursor.m, i + 1))
            const ok = d <= lastDay && isDateBookable(psych, d, db.sessions)
            return (
              <button
                key={d}
                disabled={!ok}
                className={ok ? 'avail' : ''}
                aria-pressed={date === d}
                aria-label={`${formatDateLong(d)}${ok ? ', com horários' : ', indisponível'}`}
                onClick={() => { setDate(d); setTime(null); setError('') }}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
        <p className="small muted">Dias destacados têm horários livres.</p>
      </section>

      {date && (
        <section className="card stack" aria-label="Horários">
          <h2>Horários em {formatDateLong(date)}</h2>
          <div className="slots">
            {slots.map((t) => (
              <button key={t} className="chip" aria-pressed={time === t} onClick={() => { setTime(t); setError('') }}>{t}</button>
            ))}
          </div>
          {slots.length === 0 && <p className="muted">Não há mais horários neste dia.</p>}
        </section>
      )}

      {date && time && (
        <section className="card stack" aria-label="Detalhes da sessão">
          {psych.modalities.length > 1 && (
            <div className="stack">
              <h3>Modalidade</h3>
              <div className="chips" role="group" aria-label="Modalidade">
                {psych.modalities.map((m) => (
                  <button key={m} className="chip" aria-pressed={chosenModality === m} onClick={() => setModality(m)}>
                    {m === 'online' ? 'Online' : 'Presencial'}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Field label="Motivo da sessão (opcional)">
            {(fid) => <textarea id={fid} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Conte brevemente o que gostaria de trabalhar" />}
          </Field>
        </section>
      )}

      {error && <div className="alert error" role="alert">{error}</div>}

      <button className="btn block" disabled={!ready} onClick={() => setPaying(true)}>
        {ready ? `Continuar: ${formatDateLong(date!)}, ${time}` : 'Escolha data, horário e modalidade'}
      </button>

      {paying && ready && (
        <Modal title="Pagamento da sessão" onClose={() => setPaying(false)}>
          <div className="stack">
            <div className="card">
              <p><b>{psych.name}</b></p>
              <p className="muted small">
                {formatDateLong(date!)}, {time} · {chosenModality === 'online' ? 'Online' : 'Presencial'}
              </p>
              <p className="price" style={{ marginTop: 6 }}>{formatMoney(price)}</p>
            </div>
            <Payment totalCents={price} reference={`${psych.id}${date}${time}`} submitLabel="Confirmar agendamento" onPay={confirm} />
          </div>
        </Modal>
      )}
    </div>
  )
}
