import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Search, Ticket, Video } from 'lucide-react'
import { useDb } from '../data/store'
import { useNow } from '../hooks/useNow'
import { Empty, EventosTabs, PageHeader } from '../components/ui'
import { formatMoney, parseDateStr, parseLocalIso } from '../services/dates'
import { eventRemaining, isEventOver, isStreamOpen, unitPrice } from '../services/tickets'
import type { EventKind } from '../domain/types'

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

export default function Eventos() {
  const db = useDb()
  const now = useNow()
  const [kind, setKind] = useState<'todos' | EventKind>('todos')
  const [query, setQuery] = useState('')
  const [past, setPast] = useState(false)

  const q = query.trim().toLowerCase()
  const list = db.events
    .filter((e) => (kind === 'todos' || e.kind === kind) && (!q || `${e.title} ${e.speaker}`.toLowerCase().includes(q)))
    .filter((e) => past || !isEventOver(e, now))
    .sort((a, b) => parseLocalIso(a.startsAt).getTime() - parseLocalIso(b.startsAt).getTime())

  return (
    <div className="page">
      <PageHeader title="Eventos" sub="Palestras e encontros, online e presenciais" />
      <EventosTabs />

      <div className="search" style={{ marginBottom: '0.75rem' }}>
        <Search size={20} aria-hidden />
        <label className="sr-only" htmlFor="busca-evt">Buscar evento</label>
        <input id="busca-evt" className="input" type="search" placeholder="Buscar por tema ou palestrante" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="chips" role="group" aria-label="Filtros" style={{ marginBottom: '0.75rem' }}>
        {(['todos', 'online', 'presencial'] as const).map((k) => (
          <button key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {k === 'todos' ? 'Todos' : k === 'online' ? 'Online' : 'Presencial'}
          </button>
        ))}
        <button className="chip" aria-pressed={past} onClick={() => setPast((p) => !p)}>Incluir encerrados</button>
      </div>

      {list.length === 0 ? (
        <div className="card"><Empty icon={Ticket} title="Nenhum evento encontrado"><p>Tente outro filtro ou outra busca.</p></Empty></div>
      ) : (
        <div className="list">
          {list.map((e) => {
            const d = parseDateStr(e.startsAt.slice(0, 10))
            const left = eventRemaining(db, e)
            const over = isEventOver(e, now)
            const live = isStreamOpen(e, now)
            const min = Math.min(...e.ticketTypes.map((t) => unitPrice(db, t)))
            return (
              <Link key={e.id} to={`/eventos/${e.id}`} className={`item${over ? ' off' : ''}`} style={{ alignItems: 'flex-start' }}>
                <div className="datebox">
                  <b>{d.getDate()}</b>
                  <span>{MONTHS[d.getMonth()]}</span>
                </div>
                <div className="main">
                  <div className="title" style={{ textDecoration: 'none' }}>{e.title}</div>
                  <div className="meta">{e.speaker}</div>
                  <div className="meta">{WEEKDAYS[d.getDay()]}, {e.startsAt.slice(11, 16)}</div>
                  <div className="row" style={{ marginTop: 8, gap: '0.4rem' }}>
                    {live && <span className="pill now"><span className="live-dot" aria-hidden /> Ao vivo</span>}
                    <span className={`pill ${e.kind === 'online' ? 'brand' : 'rose'}`}>{e.kind === 'online' ? <><Video size={13} aria-hidden /> Online</> : 'Presencial'}</span>
                    {over ? <span className="pill">Encerrado</span> : left === 0 ? <span className="pill danger">Esgotado</span> : left <= 10 ? <span className="pill amber">Restam {left}</span> : null}
                    <span className="pill">{min === 0 ? 'Grátis' : `a partir de ${formatMoney(min)}`}</span>
                  </div>
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
