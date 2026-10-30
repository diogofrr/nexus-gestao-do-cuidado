import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Minus, Plus, Ticket } from 'lucide-react'
import { purchaseTickets } from '../data/actions'
import { useDb } from '../data/store'
import { BackLink, Banner, Empty, Field, PageHeader } from '../components/ui'
import Payment from '../components/Payment'
import { formatMoney, friendlyDate } from '../services/dates'
import { MAX_TICKETS_PER_ORDER, isEventOver, remaining, unitPrice } from '../services/tickets'
import type { PaymentMethod } from '../domain/types'

export default function ComprarIngresso() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const db = useDb()
  const navigate = useNavigate()

  const event = db.events.find((e) => e.id === id)
  const [typeId, setTypeId] = useState(params.get('tipo') ?? event?.ticketTypes[0]?.id ?? '')
  const [holders, setHolders] = useState<string[]>([db.user.name])
  const [error, setError] = useState('')

  if (!event) {
    return (
      <div className="page">
        <BackLink to="/eventos">Eventos</BackLink>
        <Empty title="Evento não encontrado" />
      </div>
    )
  }
  const type = event.ticketTypes.find((t) => t.id === typeId) ?? event.ticketTypes[0]
  const left = remaining(db, type)
  const maxQty = Math.min(MAX_TICKETS_PER_ORDER, left)
  const price = unitPrice(db, type)
  const total = price * holders.length

  if (isEventOver(event) || left === 0) {
    return (
      <div className="page">
        <BackLink to={`/eventos/${event.id}`}>Evento</BackLink>
        <div className="card"><Empty icon={Ticket} title={left === 0 ? 'Ingressos esgotados' : 'Este evento já terminou'} /></div>
      </div>
    )
  }

  const setQty = (n: number) => setHolders((h) => (n > h.length ? [...h, ...Array(n - h.length).fill('')] : h.slice(0, n)))

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
    <div className="page">
      <BackLink to={`/eventos/${event.id}`}>Evento</BackLink>
      <PageHeader title={total === 0 ? 'Garantir vaga' : 'Comprar ingresso'} sub={`${event.title} · ${friendlyDate(event.startsAt.slice(0, 10))}, ${event.startsAt.slice(11, 16)}`} />

      <div className="stack-lg">
        <section className="card stack">
          {event.ticketTypes.length > 1 && (
            <Field label="Tipo de ingresso">
              {(fid) => (
                <select id={fid} className="select" value={type.id} onChange={(e) => { setTypeId(e.target.value); setQty(1) }}>
                  {event.ticketTypes.map((t) => (
                    <option key={t.id} value={t.id} disabled={remaining(db, t) === 0}>
                      {t.name} · {formatMoney(unitPrice(db, t))}{remaining(db, t) === 0 ? ' (esgotado)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          )}

          <div className="row between">
            <div>
              <div style={{ fontWeight: 650 }}>Quantidade</div>
              <div className="faint small">Máximo de {maxQty} por pedido</div>
            </div>
            <div className="stepper">
              <button type="button" onClick={() => setQty(holders.length - 1)} disabled={holders.length <= 1} aria-label="Diminuir quantidade"><Minus size={18} /></button>
              <output aria-live="polite">{holders.length}</output>
              <button type="button" onClick={() => setQty(holders.length + 1)} disabled={holders.length >= maxQty} aria-label="Aumentar quantidade"><Plus size={18} /></button>
            </div>
          </div>

          {holders.map((h, i) => (
            <Field key={i} label={`Nome do participante ${holders.length > 1 ? i + 1 : ''}`.trim()}>
              {(fid) => (
                <input id={fid} className="input" value={h} placeholder="Nome completo" autoComplete="name" onChange={(e) => setHolders((hs) => hs.map((x, j) => (j === i ? e.target.value : x)))} />
              )}
            </Field>
          ))}

          <div className="row between" style={{ borderTop: '1px solid var(--line)', paddingTop: '0.9rem' }}>
            <span className="muted">{holders.length} × {formatMoney(price)}</span>
            <span className="price" style={{ fontSize: '1.3rem' }}>{formatMoney(total)}</span>
          </div>
        </section>

        {error && <Banner tone="danger">{error}</Banner>}

        {!namesOk ? (
          <Banner tone="warn">Preencha o nome de todos os participantes para continuar.</Banner>
        ) : total === 0 ? (
          <button className="btn lg block" onClick={() => finish('pix')}>Confirmar vaga gratuita</button>
        ) : (
          <section className="stack">
            <h2>Pagamento</h2>
            <Payment totalCents={total} reference={`${event.id}${type.id}${holders.length}`} submitLabel="Finalizar compra" onPay={finish} />
          </section>
        )}
      </div>
    </div>
  )
}
