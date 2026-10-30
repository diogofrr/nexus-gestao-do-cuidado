import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Search, Brain } from 'lucide-react'
import { useDb } from '../data/store'
import { ApoioTabs, Avatar, Banner, Empty, PageHeader } from '../components/ui'
import { nextAvailableDate } from '../services/availability'
import { formatMoney, friendlyDate } from '../services/dates'
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
    <div className="page">
      <PageHeader title="Apoio" sub="Psicólogos da plataforma, conversa e autocuidado" />
      <ApoioTabs />

      {discount > 0 && <div style={{ marginBottom: '1rem' }}><Banner tone="success">Seu plano dá {discount}% de desconto nas sessões.</Banner></div>}

      <div className="search" style={{ marginBottom: '0.75rem' }}>
        <Search size={20} aria-hidden />
        <label className="sr-only" htmlFor="busca-psi">Buscar psicólogo</label>
        <input id="busca-psi" className="input" type="search" placeholder="Buscar por nome ou tema" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="chips" role="group" aria-label="Modalidade" style={{ marginBottom: '0.75rem' }}>
        {(['todas', 'online', 'presencial'] as const).map((m) => (
          <button key={m} className="chip" aria-pressed={modality === m} onClick={() => setModality(m)}>
            {m === 'todas' ? 'Todos' : m === 'online' ? 'Online' : 'Presencial'}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card">
          <Empty icon={Brain} title="Nenhum psicólogo encontrado"><p>Tente outra busca ou outra modalidade.</p></Empty>
        </div>
      ) : (
        <div className="list">
          {list.map((p) => {
            const next = nextAvailableDate(p, db.sessions)
            const price = applyDiscount(p.priceCents, discount)
            return (
              <Link key={p.id} to={`/psicologos/${p.id}`} className="item" style={{ alignItems: 'flex-start' }}>
                <Avatar name={p.name} hue={p.hue} size="lg" />
                <div className="main">
                  <div className="title">{p.name}</div>
                  <div className="meta">{p.specialties.join(' · ')}</div>
                  <div className="row" style={{ marginTop: 8, gap: '0.4rem' }}>
                    {p.modalities.map((m) => <span key={m} className="pill">{m === 'online' ? 'Online' : 'Presencial'}</span>)}
                    <span className="pill brand">{formatMoney(price)}</span>
                  </div>
                  <div className="small" style={{ marginTop: 8, color: next ? 'var(--ink-2)' : 'var(--amber)', fontWeight: 600 }}>
                    {next ? `Próxima vaga: ${friendlyDate(next).toLowerCase()}` : 'Sem vagas nos próximos 60 dias'}
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
