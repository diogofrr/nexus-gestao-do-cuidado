import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Phone, Plus, Search, Users } from 'lucide-react'
import { useDb } from '../data/store'
import { Avatar, CuidadoTabs, Empty, PageHeader } from '../components/ui'

export default function Profissionais() {
  const db = useDb()
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const list = db.professionals.filter((p) => !q || `${p.name} ${p.specialty}`.toLowerCase().includes(q))

  return (
    <div className="page">
      <PageHeader title="Cuidado" sub="Consultas, remédios, tarefas e a rede de apoio" />
      <CuidadoTabs />

      <div className="search" style={{ marginBottom: '1rem' }}>
        <Search size={20} aria-hidden />
        <label className="sr-only" htmlFor="busca">Buscar profissional</label>
        <input id="busca" className="input" type="search" placeholder="Buscar por nome ou especialidade" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {list.length === 0 ? (
        <div className="card">
          <Empty icon={Users} title={q ? 'Ninguém encontrado' : 'Sua rede está vazia'}>
            <p>{q ? 'Tente outro nome ou especialidade.' : 'Salve aqui os contatos de médicos, terapeutas e cuidadores.'}</p>
          </Empty>
        </div>
      ) : (
        <div className="list">
          {list.map((p) => (
            <div key={p.id} className="item">
              <Avatar name={p.name} hue={210} />
              <Link to={`/profissionais/${p.id}`} className="main" style={{ color: 'inherit', fontWeight: 400, textDecoration: 'none' }}>
                <div className="title">{p.name}</div>
                <div className="meta">{p.specialty}{p.phone && ` · ${p.phone}`}</div>
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
