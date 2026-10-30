import { Link, useParams } from 'react-router-dom'
import { useDb } from '../data/store'
import { Empty } from '../components/ui'
import { formatDateLong, formatMoney } from '../services/dates'
import { isEventOver, remaining, unitPrice } from '../services/tickets'
import { PLANS } from '../services/plans'

export default function EventoDetalhe() {
  const { id } = useParams()
  const db = useDb()
  const event = db.events.find((e) => e.id === id)

  if (!event) {
    return (
      <Empty icon="🔍" title="Evento não encontrado">
        <Link to="/eventos">Voltar aos eventos</Link>
      </Empty>
    )
  }

  const over = isEventOver(event)
  const discount = PLANS[db.user.plan].ticketDiscount

  return (
    <div className="stack">
      <Link to="/eventos" className="back">← Eventos</Link>

      <div className="card stack">
        <div className="row">
          <span className={`badge ${event.kind === 'online' ? '' : 'success'}`}>{event.kind === 'online' ? 'Online' : 'Presencial'}</span>
          {over && <span className="badge neutral">Encerrado</span>}
        </div>
        <h1>{event.title}</h1>
        <p className="muted">{event.speaker}</p>
        <p>
          📅 {formatDateLong(event.startsAt.slice(0, 10))}, {event.startsAt.slice(11, 16)} ({event.durationMinutes} min)
        </p>
        <p>{event.kind === 'online' ? '💻 Transmissão online. O link é liberado no seu ingresso 15 minutos antes.' : `📍 ${event.location}`}</p>
        <p>{event.description}</p>
      </div>

      <h2>Ingressos</h2>
      {discount > 0 && <div className="alert success">Seu plano dá {discount}% de desconto nos ingressos.</div>}
      <div className="stack">
        {event.ticketTypes.map((t) => {
          const left = remaining(db, t)
          const price = unitPrice(db, t)
          return (
            <div key={t.id} className="card row between">
              <div>
                <h3>{t.name}</h3>
                <p className="muted small">{left === 0 ? 'Esgotado' : `${left} vaga${left === 1 ? '' : 's'} restante${left === 1 ? '' : 's'}`}</p>
              </div>
              <div className="row">
                <span className="price">
                  {formatMoney(price)}
                  {discount > 0 && t.priceCents > 0 && (
                    <span className="muted small" style={{ textDecoration: 'line-through', marginLeft: 6 }}>{formatMoney(t.priceCents)}</span>
                  )}
                </span>
                {over || left === 0 ? (
                  <button className="btn" disabled>{over ? 'Encerrado' : 'Esgotado'}</button>
                ) : (
                  <Link className="btn" to={`/eventos/${event.id}/comprar?tipo=${t.id}`}>{price === 0 ? 'Garantir vaga' : 'Comprar'}</Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
