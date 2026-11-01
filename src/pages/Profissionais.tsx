import { Link } from 'react-router-dom'
import { ChevronRight, Phone, Plus, Users } from 'lucide-react'
import { useDb } from '../data/store'
import { Avatar, CuidadoTabs, Empty, PageHeader } from '../components/ui'

export default function Profissionais() {
  const db = useDb()

  return (
    <div className="page">
      <PageHeader title="Cuidado" />
      <CuidadoTabs />

      {db.professionals.length === 0 ? (
        <div className="card">
          <Empty icon={Users} title="Sua rede está vazia">
            <p>Salve aqui os contatos de médicos e cuidadores.</p>
          </Empty>
        </div>
      ) : (
        <div className="list">
          {db.professionals.map((p) => (
            <div key={p.id} className="item">
              <Avatar name={p.name} hue={210} />
              <Link to={`/profissionais/${p.id}`} className="main" style={{ color: 'inherit', fontWeight: 400, textDecoration: 'none' }}>
                <div className="title">{p.name}</div>
                <div className="meta">{p.specialty}</div>
              </Link>
              {p.phone && (
                <a className="btn secondary sm" href={`tel:${p.phone}`} aria-label={`Ligar para ${p.name}`}>
                  <Phone size={16} aria-hidden /> Ligar
                </a>
              )}
              <Link to={`/profissionais/${p.id}`} className="trail" aria-label={`Editar ${p.name}`}><ChevronRight size={20} aria-hidden /></Link>
            </div>
          ))}
        </div>
      )}

      <Link to="/profissionais/novo" className="btn fab"><Plus size={22} aria-hidden /> Adicionar</Link>
    </div>
  )
}
