import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, Video } from 'lucide-react'
import { bookSession, sessionPrice } from '../data/actions'
import { useDb } from '../data/store'
import { Avatar, BackLink, Banner, Empty, Field, Sheet } from '../components/ui'
import Payment from '../components/Payment'
import { getFreeSlots } from '../services/availability'
import { addDays, formatMoney, friendlyDate, parseDateStr, toDateStr } from '../services/dates'
import type { Modality } from '../domain/types'

const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MON = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const RANGE_DAYS = 60

export default function PsicologoDetalhe() {
  const { id } = useParams()
  const db = useDb()
  const navigate = useNavigate()
  const psych = db.psychologists.find((p) => p.id === id)

  const dates = useMemo(() => {
    const today = new Date()
    return Array.from({ length: RANGE_DAYS }, (_, i) => toDateStr(addDays(today, i)))
  }, [])
  const free = useMemo(
    () => (psych ? Object.fromEntries(dates.map((d) => [d, getFreeSlots(psych, d, db.sessions)])) : {}) as Record<string, string[]>,
    [dates, psych, db.sessions],
  )

  const [date, setDate] = useState<string | null>(() => dates.find((d) => (free[d] ?? []).length > 0) ?? null)
  const [time, setTime] = useState<string | null>(null)
  const [modality, setModality] = useState<Modality | null>(null)
  const [reason, setReason] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  if (!psych) {
    return (
      <div className="page">
        <BackLink to="/psicologos">Psicólogos</BackLink>
        <Empty title="Psicólogo não encontrado" />
      </div>
    )
  }

  const slots = date ? free[date] ?? [] : []
  const periods = [
    { label: 'Manhã', items: slots.filter((t) => t < '12:00') },
    { label: 'Tarde', items: slots.filter((t) => t >= '12:00' && t < '18:00') },
    { label: 'Noite', items: slots.filter((t) => t >= '18:00') },
  ].filter((p) => p.items.length > 0)
  const chosenModality = modality ?? (psych.modalities.length === 1 ? psych.modalities[0] : null)
  const price = sessionPrice(psych.id)
  const ready = !!(date && time && chosenModality)
  const hasAny = dates.some((d) => (free[d] ?? []).length > 0)

  const confirm = (): string | null => {
    if (!date || !time || !chosenModality) return 'Escolha dia, horário e modalidade.'
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
    <div className="page">
      <BackLink to="/psicologos">Psicólogos</BackLink>

      <div className="stack-lg">
        <section className="stack">
          <div className="row" style={{ flexWrap: 'nowrap', gap: '1rem' }}>
            <Avatar name={psych.name} hue={psych.hue} size="lg" />
            <div>
              <h1 style={{ fontSize: '1.45rem' }}>{psych.name}</h1>
              <p className="muted small">{psych.crp}</p>
            </div>
          </div>
          <p>{psych.bio}</p>
          <div className="row" style={{ gap: '0.4rem' }}>
            {psych.specialties.map((s) => <span key={s} className="pill brand">{s}</span>)}
            {psych.modalities.map((m) => <span key={m} className="pill">{m === 'online' ? 'Online' : 'Presencial'}</span>)}
          </div>
          <p><b className="price" style={{ fontSize: '1.2rem' }}>{formatMoney(price)}</b> <span className="muted">por sessão de 50 minutos</span></p>
        </section>

        {!hasAny ? (
          <Banner tone="warn">{psych.name} não tem horários livres nos próximos {RANGE_DAYS} dias. Volte em breve ou escolha outro profissional.</Banner>
        ) : (
          <>
            <section className="stack" aria-label="Escolha do dia">
              <h2>Escolha o dia</h2>
              <div className="dayscroll" role="group" aria-label="Dias disponíveis">
                {dates.map((d) => {
                  const dt = parseDateStr(d)
                  const open = (free[d] ?? []).length > 0
                  return (
                    <button
                      key={d}
                      className="dp"
                      disabled={!open}
                      aria-pressed={date === d}
                      aria-label={`${friendlyDate(d)}${open ? `, ${(free[d] ?? []).length} horários` : ', sem horários'}`}
                      onClick={() => { setDate(d); setTime(null); setError('') }}
                    >
                      <span className="dow">{DOW[dt.getDay()]}</span>
                      <span className="dnum">{dt.getDate()}</span>
                      <span className="mon">{MON[dt.getMonth()]}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            {date && (
              <section className="stack" aria-label="Horários">
                <h2>Horários de {friendlyDate(date).toLowerCase()}</h2>
                {periods.length === 0 && <p className="muted">Não há mais horários neste dia.</p>}
                {periods.map((p) => (
                  <div key={p.label} className="stack" style={{ gap: '0.5rem' }}>
                    <div className="faint small" style={{ fontWeight: 650 }}>{p.label}</div>
                    <div className="slots">
                      {p.items.map((t) => (
                        <button key={t} className="slot" aria-pressed={time === t} onClick={() => { setTime(t); setError('') }}>{t}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {date && time && (
              <section className="stack" aria-label="Detalhes da sessão">
                {psych.modalities.length > 1 && (
                  <div className="stack" role="group" aria-label="Modalidade">
                    <h2>Como prefere?</h2>
                    <div className="stack" style={{ gap: '0.6rem' }}>
                      {psych.modalities.map((m) => (
                        <button key={m} className="option" aria-pressed={chosenModality === m} onClick={() => setModality(m)}>
                          {m === 'online' ? <Video size={22} aria-hidden /> : <MapPin size={22} aria-hidden />}
                          <span className="grow">
                            <b>{m === 'online' ? 'Online' : 'Presencial'}</b>
                            <br />
                            <span className="muted small">{m === 'online' ? 'Por vídeo, de onde você estiver' : 'No consultório'}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <Field label="Quer contar o motivo? (opcional)">
                  {(fid) => <textarea id={fid} className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Conte brevemente o que gostaria de trabalhar" />}
                </Field>
              </section>
            )}
          </>
        )}

        {error && <Banner tone="danger">{error}</Banner>}
      </div>

      {hasAny && (
        <div className="bookbar">
          <div className="sum">
            {ready ? (
              <>
                <div style={{ fontWeight: 700 }}>{friendlyDate(date!)}, {time}</div>
                <div className="muted small">{chosenModality === 'online' ? 'Online' : 'Presencial'} · {formatMoney(price)}</div>
              </>
            ) : (
              <div className="muted small">Escolha dia, horário{psych.modalities.length > 1 ? ' e modalidade' : ''}</div>
            )}
          </div>
          <button className="btn lg" disabled={!ready} onClick={() => setPaying(true)}>Continuar</button>
        </div>
      )}

      {paying && ready && (
        <Sheet title="Confirmar e pagar" onClose={() => setPaying(false)}>
          <div className="stack">
            <div className="card flat">
              <p style={{ fontWeight: 700 }}>{psych.name}</p>
              <p className="muted small">{friendlyDate(date!)}, {time} · {chosenModality === 'online' ? 'Online' : 'Presencial'}</p>
              <p className="price" style={{ marginTop: 6, fontSize: '1.2rem' }}>{formatMoney(price)}</p>
            </div>
            <Payment totalCents={price} reference={`${psych.id}${date}${time}`} submitLabel="Confirmar agendamento" onPay={confirm} />
          </div>
        </Sheet>
      )}
    </div>
  )
}
