import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Ticket } from 'lucide-react'
import { useDb } from '../data/store'
import { useNow } from '../hooks/useNow'
import { Empty, EventosTabs, PageHeader } from '../components/ui'
import { formatMoney, parseDateStr, parseLocalIso } from '../services/dates'
import { eventRemaining, isEventOver, isStreamOpen, unitPrice } from '../services/tickets'
import type { EventKind } from '../domain/types'

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export default function Eventos() {
  const db = useDb()
  const now = useNow()
  const [kind, setKind] = useState<'todos' | EventKind>('todos')

  const list = db.events
    .filter((e) => (kind === 'todos' || e.kind === kind) && !isEventOver(e, now))
    .sort((a, b) => parseLocalIso(a.startsAt).getTime() - parseLocalIso(b.startsAt).getTime())

  return (
    <div className="page">
      <PageHeader title="Eventos" />
      <EventosTabs />

      <div className="chips" role="group" aria-label="Filtros" style={{ marginBottom: '0.9rem' }}>
        {(['todos', 'online', 'presencial'] as const).map((k) => (
          <button key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {k === 'todos' ? 'Todos' : k === 'online' ? 'Online' : 'Presencial'}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card"><Empty icon={Ticket} title="Nenhum evento por enquanto" /></div>
      ) : (
        <div className="list">
          {list.map((e) => {
            const d = parseDateStr(e.startsAt.slice(0, 10))
            const left = eventRemaining(db, e)
            const live = isStreamOpen(e, now)
            const min = Math.min(...e.ticketTypes.map((t) => unitPrice(db, t)))
            return (
              <Link key={e.id} to={`/eventos/${e.id}`} className="item">
                <div className="datebox">
                  <b>{d.getDate()}</b>
                  <span>{MONTHS[d.getMonth()]}</span>
                </div>
                <div className="main">
                  <div className="title">{e.title}</div>
                  <div className="meta">{e.kind === 'online' ? 'Online' : 'Presencial'} · {WEEKDAYS[d.getDay()]}, {e.startsAt.slice(11, 16)} · {min === 0 ? 'Grátis' : formatMoney(min)}</div>
                  {(live || left === 0 || left <= 10) && (
                    <div className="row" style={{ marginTop: 6, gap: '0.4rem' }}>
                      {live ? <span className="pill now"><span className="live-dot" aria-hidden /> Ao vivo</span>
                        : left === 0 ? <span className="pill danger">Esgotado</span>
                        : <span className="pill amber">Restam {left}</span>}
                    </div>
                  )}
                </div>
                <span className="trail"><ChevronRight size={20} aria-hidden /></span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
