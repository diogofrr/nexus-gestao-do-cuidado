import { Link, useNavigate, useParams } from 'react-router-dom'
import { CalendarPlus, Clock, CreditCard, FileText, MapPin, Video } from 'lucide-react'
import { cancelSession } from '../data/actions'
import { useDb } from '../data/store'
import { useNow } from '../hooks/useNow'
import { Avatar, BackLink, Banner, Confirm, Empty, PageHeader, toast } from '../components/ui'
import { buildIcs, downloadIcs } from '../services/calendar'
import { formatMoney, friendlyDate } from '../services/dates'
import {
  CANCEL_LIMIT_HOURS,
  JOIN_OPENS_MINUTES,
  SESSION_MINUTES,
  canCancelSession,
  isSessionOpen,
  isSessionOver,
  meetingUrl,
  sessionStart,
} from '../services/sessions'

export default function SessaoDetalhe() {
  const { id } = useParams()
  const db = useDb()
  const now = useNow()
  const navigate = useNavigate()
  const session = db.sessions.find((s) => s.id === id && !s.external)
  const psych = db.psychologists.find((p) => p.id === session?.psychologistId)

  if (!session || !psych) {
    return (
      <div className="page">
        <BackLink to="/consultas">Consultas</BackLink>
        <Empty title="Sessão não encontrada" />
      </div>
    )
  }

  const over = isSessionOver(session, now)
  const open = isSessionOpen(session, now)
  const active = session.status === 'agendada' && !over
  const cancellable = canCancelSession(session, now)
  const online = session.modality === 'online'

  const addToCalendar = () =>
    downloadIcs('sessao-nexus.ics', buildIcs({
      uid: session.id,
      title: `Sessão com ${psych.name}`,
      start: sessionStart(session),
      minutes: SESSION_MINUTES,
      location: online ? meetingUrl(session) : 'Consultório (endereço enviado por e-mail)',
    }))

  return (
    <div className="page">
      <BackLink to="/consultas">Consultas</BackLink>
      <PageHeader
        title="Sessão de psicologia"
        sub={session.status === 'cancelada' ? 'Esta sessão foi cancelada.' : over ? 'Sessão realizada.' : open ? 'Acontecendo agora.' : undefined}
      />

      <div className="stack-lg">
        {open && (
          <div className="hero-live">
            <div className="row"><span className="live-dot" aria-hidden /><b style={{ color: 'var(--now)' }}>Sua sessão está aberta</b></div>
            <a className="btn live lg block" href={meetingUrl(session)} target="_blank" rel="noreferrer"><Video size={20} aria-hidden /> Entrar na sessão</a>
          </div>
        )}

        <div className="card stack">
          <Link to={`/psicologos/${psych.id}`} className="row" style={{ color: 'inherit', textDecoration: 'none', flexWrap: 'nowrap' }}>
            <Avatar name={psych.name} hue={psych.hue} size="lg" />
            <div>
              <h2>{psych.name}</h2>
              <p className="muted small">{psych.crp}</p>
            </div>
          </Link>
          <div className="stack" style={{ gap: '0.7rem' }}>
            <div className="kv"><Clock size={18} aria-hidden /><span>{friendlyDate(session.date, now)}, às {session.time} ({SESSION_MINUTES} minutos)</span></div>
            <div className="kv">
              {online ? <Video size={18} aria-hidden /> : <MapPin size={18} aria-hidden />}
              <span>{online ? `Online. O link abre ${JOIN_OPENS_MINUTES} minutos antes.` : 'Presencial, no consultório. O endereço chega por e-mail.'}</span>
            </div>
            <div className="kv"><CreditCard size={18} aria-hidden /><span>{formatMoney(session.priceCents)}, pago</span></div>
            {session.reason && <div className="kv"><FileText size={18} aria-hidden /><span>{session.reason}</span></div>}
          </div>
        </div>

        {active && (
          <div className="stack">
            <button className="btn secondary block" onClick={addToCalendar}><CalendarPlus size={20} aria-hidden /> Adicionar ao calendário</button>
            {cancellable ? (
              <Confirm
                label="Cancelar sessão"
                message="Cancelar esta sessão? O horário volta a ficar disponível para outras pessoas."
                className="btn danger block"
                onConfirm={() => {
                  const r = cancelSession(session.id)
                  toast(r.ok ? 'Sessão cancelada. O horário foi liberado.' : r.error)
                  if (r.ok) navigate('/consultas')
                }}
              >
                Cancelar sessão
              </Confirm>
            ) : (
              !open && <Banner tone="warn">Cancelamentos são aceitos até {CANCEL_LIMIT_HOURS} horas antes. Para remarcar agora, fale com a equipe.</Banner>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
