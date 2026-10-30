import { Link, useParams } from 'react-router-dom'
import { CalendarClock, CalendarPlus, Check, CreditCard, FileText, MapPin, Ticket, Video } from 'lucide-react'
import { useDb } from '../data/store'
import { Empty } from '../components/ui'
import { buildIcs, downloadIcs } from '../services/calendar'
import { formatMoney, friendlyDate, parseLocalIso } from '../services/dates'
import { meetingUrl, sessionStart, SESSION_MINUTES } from '../services/sessions'
import { METHOD_LABEL } from '../services/payment'

function Done({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="stack" style={{ textAlign: 'center', justifyItems: 'center', padding: '1rem 0 0.5rem' }}>
      <div className="success-mark" aria-hidden><Check size={36} strokeWidth={2.6} /></div>
      <h1>{title}</h1>
      <p className="muted" style={{ maxWidth: '26rem' }}>{sub}</p>
    </div>
  )
}

export function SessaoConfirmada() {
  const { id } = useParams()
  const db = useDb()
  const session = db.sessions.find((s) => s.id === id && !s.external)
  const psych = db.psychologists.find((p) => p.id === session?.psychologistId)

  if (!session || !psych) {
    return (
      <div className="page">
        <Empty title="Sessão não encontrada"><Link to="/consultas">Ver minhas consultas</Link></Empty>
      </div>
    )
  }

  const online = session.modality === 'online'
  const addToCalendar = () =>
    downloadIcs('sessao-nexus.ics', buildIcs({
      uid: session.id,
      title: `Sessão com ${psych.name}`,
      start: sessionStart(session),
      minutes: SESSION_MINUTES,
      location: online ? meetingUrl(session) : 'Consultório (endereço enviado por e-mail)',
      description: 'Sessão de psicologia agendada pelo Nexus.',
    }))

  return (
    <div className="page">
      <div className="stack-lg">
        <Done title="Sessão agendada" sub={`Enviamos os detalhes para ${db.user.email}.`} />

        <section className="card stack">
          <h2>Resumo</h2>
          <div className="stack" style={{ gap: '0.8rem' }}>
            <div className="kv"><Check size={18} aria-hidden /><span><b>{psych.name}</b> <span className="muted">· {psych.crp}</span></span></div>
            <div className="kv"><CalendarClock size={18} aria-hidden /><span>{friendlyDate(session.date)}, às {session.time} ({SESSION_MINUTES} minutos)</span></div>
            <div className="kv">
              {online ? <Video size={18} aria-hidden /> : <MapPin size={18} aria-hidden />}
              <span>{online ? 'Online. O link abre 10 minutos antes, em Consultas.' : 'Presencial, no consultório. O endereço chega por e-mail.'}</span>
            </div>
            <div className="kv"><CreditCard size={18} aria-hidden /><span>{formatMoney(session.priceCents)}, pago</span></div>
            {session.reason && <div className="kv"><FileText size={18} aria-hidden /><span>{session.reason}</span></div>}
          </div>
        </section>

        <p className="muted small" style={{ textAlign: 'center' }}>Precisa cancelar? É possível até 2 horas antes, em Consultas, e o horário volta para a agenda.</p>

        <div className="stack">
          <Link to={`/sessoes/${session.id}`} className="btn lg block">Ver detalhes da sessão</Link>
          <button className="btn secondary block" onClick={addToCalendar}><CalendarPlus size={20} aria-hidden /> Adicionar ao calendário</button>
          <Link to="/hoje" className="btn ghost block">Voltar para Hoje</Link>
        </div>
      </div>
    </div>
  )
}

export function PedidoConfirmado() {
  const { id } = useParams()
  const db = useDb()
  const order = db.orders.find((o) => o.id === id && !o.external)
  const event = db.events.find((e) => e.id === order?.eventId)
  const type = event?.ticketTypes.find((t) => t.id === order?.ticketTypeId)

  if (!order || !event) {
    return (
      <div className="page">
        <Empty title="Pedido não encontrado"><Link to="/meus-ingressos">Ver meus ingressos</Link></Empty>
      </div>
    )
  }

  const tickets = db.tickets.filter((t) => t.orderId === order.id)
  const addToCalendar = () =>
    downloadIcs('evento-nexus.ics', buildIcs({
      uid: order.id,
      title: event.title,
      start: parseLocalIso(event.startsAt),
      minutes: event.durationMinutes,
      location: event.kind === 'online' ? event.streamUrl : event.location,
      description: `${event.speaker}. Ingresso Nexus.`,
    }))

  return (
    <div className="page">
      <div className="stack-lg">
        <Done
          title={order.totalCents === 0 ? 'Vaga garantida' : 'Compra confirmada'}
          sub={`${tickets.length} ${tickets.length === 1 ? 'ingresso' : 'ingressos'} para ${event.title}.`}
        />

        <section className="card stack">
          <h2>Resumo do pedido</h2>
          <div className="stack" style={{ gap: '0.8rem' }}>
            <div className="kv"><CalendarClock size={18} aria-hidden /><span>{friendlyDate(event.startsAt.slice(0, 10))}, às {event.startsAt.slice(11, 16)}</span></div>
            <div className="kv">
              {event.kind === 'online' ? <Video size={18} aria-hidden /> : <MapPin size={18} aria-hidden />}
              <span>{event.kind === 'online' ? 'Online. O link abre 15 minutos antes, em Meus ingressos.' : event.location}</span>
            </div>
            <div className="kv"><Ticket size={18} aria-hidden /><span>{type?.name} × {order.quantity}</span></div>
            <div className="kv"><CreditCard size={18} aria-hidden /><span>{formatMoney(order.totalCents)} · {METHOD_LABEL[order.method]}</span></div>
          </div>
          <p className="muted small">Participantes: {tickets.map((t) => t.holderName).join(', ')}</p>
        </section>

        <div className="stack">
          <Link to="/meus-ingressos" className="btn lg block">Ver ingressos e QR Code</Link>
          <button className="btn secondary block" onClick={addToCalendar}><CalendarPlus size={20} aria-hidden /> Adicionar ao calendário</button>
          <Link to="/eventos" className="btn ghost block">Ver outros eventos</Link>
        </div>
      </div>
    </div>
  )
}
