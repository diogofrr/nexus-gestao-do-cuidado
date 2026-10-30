import { Link } from 'react-router-dom'
import { useDb } from '../data/store'
import { formatDateShort, parseDateTime, parseLocalIso } from '../services/dates'
import { isEventOver, myTickets } from '../services/tickets'

const TILES = [
  { to: '/consultas', icon: '🩺', title: 'Consultas', sub: 'Agendar e gerenciar' },
  { to: '/medicacoes', icon: '💊', title: 'Medicações', sub: 'Controle de remédios' },
  { to: '/profissionais', icon: '👥', title: 'Profissionais', sub: 'Sua rede de apoio' },
  { to: '/tarefas', icon: '✅', title: 'Tarefas', sub: 'Rotina diária' },
  { to: '/psicologos', icon: '🧠', title: 'Psicólogos', sub: 'Agende uma sessão' },
  { to: '/eventos', icon: '🎟️', title: 'Eventos', sub: 'Palestras e encontros' },
  { to: '/chat', icon: '💬', title: 'Chat Nexus', sub: 'Suporte e orientação' },
  { to: '/plantao', icon: '💙', title: 'Apoio Psicológico', sub: 'Plantão de escuta' },
  { to: '/configuracoes', icon: '⚙️', title: 'Configurações', sub: 'Perfil, plano e preferências' },
]

export default function Dashboard() {
  const db = useDb()
  const now = new Date()

  const appts = db.appointments.filter((a) => a.status === 'agendada')
  const pending = db.tasks.filter((t) => !t.done)

  const nextSession = db.sessions
    .filter((s) => s.status === 'agendada' && parseDateTime(s.date, s.time) > now)
    .sort((a, b) => parseDateTime(a.date, a.time).getTime() - parseDateTime(b.date, b.time).getTime())[0]
  const nextSessionPsych = db.psychologists.find((p) => p.id === nextSession?.psychologistId)

  const myEventIds = new Set(myTickets(db).filter((t) => !t.cancelledAt).map((t) => t.eventId))
  const nextEvent = db.events
    .filter((e) => myEventIds.has(e.id) && !isEventOver(e, now))
    .sort((a, b) => parseLocalIso(a.startsAt).getTime() - parseLocalIso(b.startsAt).getTime())[0]

  return (
    <div className="stack">
      <header>
        <p className="muted">Bem-vindo(a) de volta,</p>
        <h1>{db.user.name} 👋</h1>
      </header>

      <section aria-label="Resumo do cuidado" className="stack">
        <h2>Resumo do Cuidado</h2>
        <div className="stat-row">
          <Link to="/consultas" className="card stat"><b>{appts.length}</b>Consultas</Link>
          <Link to="/medicacoes" className="card stat"><b>{db.medications.length}</b>Medicações</Link>
          <Link to="/tarefas" className="card stat"><b>{pending.length}</b>Pendentes</Link>
        </div>
      </section>

      <section className="grid2" aria-label="Próximos compromissos">
        <Link to={nextSession ? '/consultas' : '/psicologos'} className="card tile">
          <span className="ico" aria-hidden>🧠</span>
          <div className="grow">
            <h3>Próxima sessão</h3>
            {nextSession && nextSessionPsych ? (
              <p className="muted small">
                {nextSessionPsych.name}, {formatDateShort(nextSession.date)} às {nextSession.time}
              </p>
            ) : (
              <p className="muted small">Nenhuma sessão marcada. Agende com um psicólogo.</p>
            )}
          </div>
        </Link>
        <Link to={nextEvent ? '/meus-ingressos' : '/eventos'} className="card tile">
          <span className="ico" aria-hidden>🎟️</span>
          <div className="grow">
            <h3>Próximo evento</h3>
            {nextEvent ? (
              <p className="muted small">
                {nextEvent.title}, {formatDateShort(nextEvent.startsAt.slice(0, 10))} às {nextEvent.startsAt.slice(11, 16)}
              </p>
            ) : (
              <p className="muted small">Veja palestras e encontros que vão acontecer.</p>
            )}
          </div>
        </Link>
      </section>

      <div className="alert info">
        <b>Lembrete de autocuidado.</b> Você também precisa de atenção. Reserve um momento para si hoje.
      </div>

      <section className="stack" aria-label="Recursos">
        <h2>Recursos</h2>
        <div className="grid2">
          {TILES.map((t) => (
            <Link key={t.to} to={t.to} className="card tile">
              <span className="ico" aria-hidden>{t.icon}</span>
              <div>
                <h3>{t.title}</h3>
                <p className="muted small">{t.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
