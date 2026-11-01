import { Link, useParams } from 'react-router-dom'
import { CalendarClock, MapPin, Mic, Video } from 'lucide-react'
import { useDb } from '../data/store'
import { useNow } from '../hooks/useNow'
import { BackLink, Empty } from '../components/ui'
import { formatMoney, friendlyDate } from '../services/dates'
import { isEventOver, remaining, unitPrice } from '../services/tickets'

export default function EventoDetalhe() {
  const { id } = useParams()
  const db = useDb()
  const now = useNow()
  const event = db.events.find((e) => e.id === id)

  if (!event) {
    return (
      <div className="page">
        <BackLink to="/eventos">Eventos</BackLink>
        <Empty title="Evento não encontrado" />
      </div>
    )
  }

  const over = isEventOver(event, now)
  const online = event.kind === 'online'

  return (
    <div className="page">
      <BackLink to="/eventos">Eventos</BackLink>

      <div className="stack-lg">
        <section className="stack">
          {over && <div><span className="pill">Encerrado</span></div>}
          <h1>{event.title}</h1>
          <div className="stack" style={{ gap: '0.7rem' }}>
            <div className="kv"><Mic size={18} aria-hidden /><span>{event.speaker}</span></div>
            <div className="kv"><CalendarClock size={18} aria-hidden /><span>{friendlyDate(event.startsAt.slice(0, 10))}, às {event.startsAt.slice(11, 16)}</span></div>
            <div className="kv">
              {online ? <Video size={18} aria-hidden /> : <MapPin size={18} aria-hidden />}
              <span>{online ? 'Online. O link aparece no ingresso 15 minutos antes.' : event.location}</span>
            </div>
          </div>
          <p>{event.description}</p>
        </section>

        <section className="stack">
          <h2>Ingressos</h2>
          <div className="list">
            {event.ticketTypes.map((t) => {
              const left = remaining(db, t)
              const price = unitPrice(db, t)
              return (
                <div key={t.id} className="item">
                  <div className="main">
                    <div className="title">{t.name}</div>
                    <div className="meta">{left === 0 ? 'Esgotado' : `${left} ${left === 1 ? 'vaga restante' : 'vagas restantes'}`}</div>
                  </div>
                  <div className="price">{price === 0 ? 'Grátis' : formatMoney(price)}</div>
                  {over || left === 0 ? (
                    <button className="btn" disabled>{over ? 'Encerrado' : 'Esgotado'}</button>
                  ) : (
                    <Link className="btn" to={`/eventos/${event.id}/comprar?tipo=${t.id}`}>{price === 0 ? 'Garantir vaga' : 'Comprar'}</Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
