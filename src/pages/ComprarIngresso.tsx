import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { purchaseTickets } from '../data/actions'
import { useDb } from '../data/store'
import { Empty } from '../components/ui'
import Payment from '../components/Payment'
import { formatDateLong, formatMoney } from '../services/dates'
import { MAX_TICKETS_PER_ORDER, isEventOver, remaining, unitPrice } from '../services/tickets'
import type { PaymentMethod } from '../domain/types'

export default function ComprarIngresso() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const db = useDb()
  const navigate = useNavigate()

  const event = db.events.find((e) => e.id === id)
  const [typeId, setTypeId] = useState(params.get('tipo') ?? event?.ticketTypes[0]?.id ?? '')
  const [holders, setHolders] = useState<string[]>([db.user.name === 'Usuário' ? '' : db.user.name])
  const [error, setError] = useState('')

  if (!event) {
    return (
      <Empty icon="🔍" title="Evento não encontrado">
        <Link to="/eventos">Voltar aos eventos</Link>
      </Empty>
    )
  }
  const type = event.ticketTypes.find((t) => t.id === typeId) ?? event.ticketTypes[0]
  const left = remaining(db, type)
  const maxQty = Math.min(MAX_TICKETS_PER_ORDER, left)
  const price = unitPrice(db, type)
  const total = price * holders.length

  if (isEventOver(event) || left === 0) {
    return (
      <Empty icon="🎟️" title={left === 0 ? 'Ingressos esgotados' : 'Este evento já terminou'}>
        <Link to={`/eventos/${event.id}`}>Voltar ao evento</Link>
      </Empty>
    )
  }

  const setQty = (n: number) =>
    setHolders((h) => (n > h.length ? [...h, ...Array(n - h.length).fill('')] : h.slice(0, n)))

  const finish = (method: PaymentMethod): string | null => {
    const r = purchaseTickets({ eventId: event.id, ticketTypeId: type.id, holders, method })
    if (!r.ok) {
      setError(r.error)
      return r.error
    }
    navigate(`/confirmacao/pedido/${r.order.id}`)
    return null
  }

  const namesOk = holders.every((h) => h.trim().length >= 2)

  return (
    <div className="stack">
      <Link to={`/eventos/${event.id}`} className="back">← {event.title}</Link>
      <h1>{total === 0 ? 'Garantir vaga' : 'Comprar ingresso'}</h1>

      <div className="card stack">
        <h3>{event.title}</h3>
        <p className="muted small">{formatDateLong(event.startsAt.slice(0, 10))}, {event.startsAt.slice(11, 16)}</p>

        {event.ticketTypes.length > 1 && (
          <div className="field">
            <label htmlFor="tipo">Tipo de ingresso</label>
            <select id="tipo" value={type.id} onChange={(e) => { setTypeId(e.target.value); setQty(1) }}>
              {event.ticketTypes.map((t) => (
                <option key={t.id} value={t.id} disabled={remaining(db, t) === 0}>
                  {t.name} · {formatMoney(unitPrice(db, t))}{remaining(db, t) === 0 ? ' (esgotado)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label htmlFor="qtd">Quantidade (máx. {maxQty})</label>
          <select id="qtd" value={holders.length} onChange={(e) => setQty(Number(e.target.value))}>
            {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>

        {holders.map((h, i) => (
          <div key={i} className="field">
            <label htmlFor={`h-${i}`}>Participante {i + 1}</label>
            <input
              id={`h-${i}`}
              value={h}
              placeholder="Nome completo"
              onChange={(e) => setHolders((hs) => hs.map((x, j) => (j === i ? e.target.value : x)))}
            />
          </div>
        ))}

        <div className="row between">
          <span>{holders.length} × {formatMoney(price)}</span>
          <span className="price">{formatMoney(total)}</span>
        </div>
      </div>

      {error && <div className="alert error" role="alert">{error}</div>}

      {!namesOk ? (
        <div className="alert warn">Preencha o nome de todos os participantes para continuar.</div>
      ) : total === 0 ? (
        <button className="btn block" onClick={() => finish('pix')}>Confirmar vaga gratuita</button>
      ) : (
        <div className="card">
          <Payment totalCents={total} reference={`${event.id}${type.id}${holders.length}`} submitLabel="Finalizar compra" onPay={finish} />
        </div>
      )}
    </div>
  )
}
