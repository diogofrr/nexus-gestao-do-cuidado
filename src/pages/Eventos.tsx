import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDb } from '../data/store'
import { Empty } from '../components/ui'
import { formatDateLong, formatMoney, parseLocalIso } from '../services/dates'
import { eventRemaining, isEventOver, unitPrice } from '../services/tickets'
import type { EventKind } from '../domain/types'

export default function Eventos() {
  const db = useDb()
  const [kind, setKind] = useState<'todos' | EventKind>('todos')
  const [query, setQuery] = useState('')
  const [past, setPast] = useState(false)

  const now = new Date()
  const q = query.trim().toLowerCase()
  const list = db.events
    .filter((e) => (kind === 'todos' || e.kind === kind) && (!q || `${e.title} ${e.speaker}`.toLowerCase().includes(q)))
    .filter((e) => past || !isEventOver(e, now))
    .sort((a, b) => parseLocalIso(a.startsAt).getTime() - parseLocalIso(b.startsAt).getTime())

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Eventos</h1>
          <p>Palestras e encontros, online e presenciais</p>
        </div>
        <Link to="/meus-ingressos" className="btn secondary">Meus ingressos</Link>
      </div>

      <div className="field">
        <label className="sr-only" htmlFor="busca-evt">Buscar evento</label>
        <input id="busca-evt" type="search" placeholder="Buscar por título ou palestrante..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="chips" role="group" aria-label="Tipo de evento">
        {(['todos', 'online', 'presencial'] as const).map((k) => (
          <button key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {k === 'todos' ? 'Todos' : k === 'online' ? 'Online' : 'Presencial'}
          </button>
        ))}
        <button className="chip" aria-pressed={past} onClick={() => setPast((p) => !p)}>Mostrar encerrados</button>
      </div>

      {list.length === 0 ? (
        <Empty icon="🎟️" title="Nenhum evento encontrado">
          <p>Tente outro filtro.</p>
        </Empty>
      ) : (
        <div className="grid2">
          {list.map((e) => {
            const left = eventRemaining(db, e)
            const over = isEventOver(e, now)
            const prices = e.ticketTypes.map((t) => unitPrice(db, t))
            const min = Math.min(...prices)
            return (
              <Link key={e.id} to={`/eventos/${e.id}`} className="card stack" style={{ color: 'inherit' }}>
                <div className="row between">
                  <span className={`badge ${e.kind === 'online' ? '' : 'success'}`}>{e.kind === 'online' ? 'Online' : 'Presencial'}</span>
                  {over ? <span className="badge neutral">Encerrado</span> : left === 0 ? <span className="badge danger">Esgotado</span> : left <= 10 ? <span className="badge warn">Restam {left}</span> : null}
                </div>
                <h3>{e.title}</h3>
                <p className="muted small">{e.speaker}</p>
                <p className="small">{formatDateLong(e.startsAt.slice(0, 10))} · {e.startsAt.slice(11, 16)}</p>
                <p className="price">{min === 0 ? 'Grátis' : `a partir de ${formatMoney(min)}`}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
