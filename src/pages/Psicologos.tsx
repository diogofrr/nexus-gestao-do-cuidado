import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useDb } from '../data/store'
import { ApoioTabs, Avatar, PageHeader } from '../components/ui'
import { nextAvailableDate } from '../services/availability'
import { formatMoney } from '../services/dates'
import { applyDiscount, PLANS } from '../services/plans'

export default function Psicologos() {
  const db = useDb()
  const discount = PLANS[db.user.plan].sessionDiscount

  return (
    <div className="page">
      <PageHeader title="Apoio" />
      <ApoioTabs />

      <div className="list">
        {db.psychologists.map((p) => {
          const available = !!nextAvailableDate(p, db.sessions)
          const modes = p.modalities.length > 1 ? 'Online e presencial' : p.modalities[0] === 'online' ? 'Online' : 'Presencial'
          return (
            <Link key={p.id} to={`/psicologos/${p.id}`} className="item">
              <Avatar name={p.name} hue={p.hue} size="lg" />
              <div className="main">
                <div className="title">{p.name}</div>
                <div className="meta">{p.specialties.slice(0, 2).join(' · ')}</div>
                {available ? (
                  <div className="meta">{modes} · {formatMoney(applyDiscount(p.priceCents, discount))}</div>
                ) : (
                  <div className="small" style={{ color: 'var(--amber)', fontWeight: 650 }}>Sem vagas agora</div>
                )}
              </div>
              <span className="trail"><ChevronRight size={20} aria-hidden /></span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
