import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDb } from '../data/store'
import { Avatar, Empty } from '../components/ui'
import { nextAvailableDate } from '../services/availability'
import { formatDateLong, formatMoney } from '../services/dates'
import { applyDiscount, PLANS } from '../services/plans'
import type { Modality } from '../domain/types'

export default function Psicologos() {
  const db = useDb()
  const [modality, setModality] = useState<'todas' | Modality>('todas')
  const [query, setQuery] = useState('')
  const discount = PLANS[db.user.plan].sessionDiscount

  const q = query.trim().toLowerCase()
  const list = db.psychologists.filter(
    (p) =>
      (modality === 'todas' || p.modalities.includes(modality)) &&
      (!q || `${p.name} ${p.specialties.join(' ')}`.toLowerCase().includes(q)),
  )

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Psicólogos</h1>
          <p>Agende uma sessão com os profissionais da plataforma</p>
        </div>
      </div>

      {discount > 0 && <div className="alert success">Seu plano dá {discount}% de desconto nas sessões.</div>}

      <div className="field">
        <label className="sr-only" htmlFor="busca-psi">Buscar psicólogo</label>
        <input id="busca-psi" type="search" placeholder="Buscar por nome ou especialidade..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="chips" role="group" aria-label="Modalidade">
        {(['todas', 'online', 'presencial'] as const).map((m) => (
          <button key={m} className="chip" aria-pressed={modality === m} onClick={() => setModality(m)}>
            {m === 'todas' ? 'Todas' : m === 'online' ? 'Online' : 'Presencial'}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Empty icon="🧠" title="Nenhum psicólogo encontrado">
          <p>Tente outra busca ou modalidade.</p>
        </Empty>
      ) : (
        <div className="grid2">
          {list.map((p) => {
            const next = nextAvailableDate(p, db.sessions)
            const price = applyDiscount(p.priceCents, discount)
            return (
              <Link key={p.id} to={`/psicologos/${p.id}`} className="card stack" style={{ color: 'inherit' }}>
                <div className="row">
                  <Avatar psych={p} />
                  <div>
                    <h3>{p.name}</h3>
                    <p className="muted small">{p.crp}</p>
                  </div>
                </div>
                <div className="chips">
                  {p.specialties.map((s) => <span key={s} className="badge">{s}</span>)}
                  {p.modalities.map((m) => <span key={m} className="badge neutral">{m === 'online' ? 'Online' : 'Presencial'}</span>)}
                </div>
                <div className="row between">
                  <span className="price">
                    {formatMoney(price)}
                    {discount > 0 && <span className="muted small" style={{ textDecoration: 'line-through', marginLeft: 6 }}>{formatMoney(p.priceCents)}</span>}
                  </span>
                  <span className="small muted">
                    {next ? `Próxima vaga: ${formatDateLong(next)}` : 'Sem vagas nos próximos 60 dias'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
