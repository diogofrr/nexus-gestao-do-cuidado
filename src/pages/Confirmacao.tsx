import { Link, useParams } from 'react-router-dom'
import { useDb } from '../data/store'
import { Empty } from '../components/ui'
import { buildIcs, downloadIcs } from '../services/calendar'
import { formatDateLong, formatMoney, parseLocalIso } from '../services/dates'
import { meetingUrl, sessionStart, SESSION_MINUTES } from '../services/sessions'
import { METHOD_LABEL } from '../services/payment'

export function SessaoConfirmada() {
  const { id } = useParams()
  const db = useDb()
  const session = db.sessions.find((s) => s.id === id && !s.external)
  const psych = db.psychologists.find((p) => p.id === session?.psychologistId)

  if (!session || !psych) {
    return (
      <Empty icon="🔍" title="Sessão não encontrada">
        <Link to="/consultas">Ver minhas consultas</Link>
      </Empty>
    )
  }

  const online = session.modality === 'online'
  const addToCalendar = () =>
    downloadIcs(
      'sessao-nexus.ics',
      buildIcs({
        uid: session.id,
        title: `Sessão com ${psych.name}`,
        start: sessionStart(session),
        minutes: SESSION_MINUTES,
        location: online ? meetingUrl(session) : 'Consultório (endereço enviado por e-mail)',
        description: 'Sessão de psicologia agendada pelo Nexus.',
      }),
    )

  return (
    <div className="stack">
      <div className="card stack" style={{ textAlign: 'center' }}>
        <div className="success-mark" aria-hidden>✓</div>
        <h1>Sessão agendada!</h1>
        <p className="muted">Enviamos os detalhes para {db.user.email}.</p>
      </div>

      <div className="card stack">
        <h2>Resumo</h2>
        <p><b>{psych.name}</b> <span className="muted">· {psych.crp}</span></p>
        <p>📅 {formatDateLong(session.date)}, às {session.time} (duração de {SESSION_MINUTES} minutos)</p>
        <p>{online ? '💻 Online. O link abre 10 minutos antes, em Consultas.' : '📍 Presencial, no consultório. O endereço chega por e-mail.'}</p>
        <p>💳 {formatMoney(session.priceCents)}, pago</p>
        {session.reason && <p>📝 Motivo: {session.reason}</p>}
      </div>

      <div className="alert info">Precisa cancelar? É possível até 2 horas antes, em Consultas, e o horário volta para a agenda.</div>

      <div className="stack">
        <Link to="/consultas" className="btn block">Ver minhas consultas</Link>
        <button className="btn secondary block" onClick={addToCalendar}>Adicionar ao calendário</button>
        <Link to="/dashboard" className="btn ghost block">Voltar ao início</Link>
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
      <Empty icon="🔍" title="Pedido não encontrado">
        <Link to="/meus-ingressos">Ver meus ingressos</Link>
      </Empty>
    )
  }

  const tickets = db.tickets.filter((t) => t.orderId === order.id)
  const addToCalendar = () =>
    downloadIcs(
      'evento-nexus.ics',
      buildIcs({
        uid: order.id,
        title: event.title,
        start: parseLocalIso(event.startsAt),
        minutes: event.durationMinutes,
        location: event.kind === 'online' ? event.streamUrl : event.location,
        description: `${event.speaker}. Ingresso Nexus.`,
      }),
    )

  return (
    <div className="stack">
      <div className="card stack" style={{ textAlign: 'center' }}>
        <div className="success-mark" aria-hidden>✓</div>
        <h1>{order.totalCents === 0 ? 'Vaga garantida!' : 'Compra confirmada!'}</h1>
        <p className="muted">
          {tickets.length} ingresso{tickets.length === 1 ? '' : 's'} para <b>{event.title}</b>
        </p>
      </div>

      <div className="card stack">
        <h2>Resumo do pedido</h2>
        <p>📅 {formatDateLong(event.startsAt.slice(0, 10))}, às {event.startsAt.slice(11, 16)}</p>
        <p>{event.kind === 'online' ? '💻 Online. O link abre 15 minutos antes, em Meus ingressos.' : `📍 ${event.location}`}</p>
        <p>🎟️ {type?.name} × {order.quantity}</p>
        <p>💳 {formatMoney(order.totalCents)} · {METHOD_LABEL[order.method]}</p>
        <p className="small muted">Participantes: {tickets.map((t) => t.holderName).join(', ')}</p>
      </div>

      <div className="stack">
        <Link to="/meus-ingressos" className="btn block">Ver meus ingressos e QR Code</Link>
        <button className="btn secondary block" onClick={addToCalendar}>Adicionar ao calendário</button>
        <Link to="/eventos" className="btn ghost block">Ver outros eventos</Link>
      </div>
    </div>
  )
}
