import { ChevronRight, PackageX, Pill, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDb } from '../data/store'
import { CuidadoTabs, Empty, PageHeader } from '../components/ui'
import { parseDoseTimes } from '../services/agenda'

export default function Medicacoes() {
  const db = useDb()

  return (
    <div className="page">
      <PageHeader title="Cuidado" />
      <CuidadoTabs />

      {db.medications.length === 0 ? (
        <div className="card">
          <Empty icon={Pill} title="Nenhum remédio cadastrado">
            <p>Cadastre os remédios para ver os horários na agenda.</p>
          </Empty>
        </div>
      ) : (
        <div className="list">
          {db.medications.map((m) => {
            const times = parseDoseTimes(m.schedule)
            const out = m.stock === 0
            const low = m.stock !== null && m.stock > 0 && m.stock <= 5
            return (
              <Link key={m.id} to={`/medicacoes/${m.id}`} className="item">
                <span className="kind remedio" aria-hidden>{out ? <PackageX size={20} /> : <Pill size={20} />}</span>
                <div className="main">
                  <div className="title">{m.name} <span className="faint" style={{ fontWeight: 500 }}>{m.dosage}</span></div>
                  <div className="meta">{times.length > 0 ? times.join(' e ') : m.frequency}</div>
                  {(out || low) && (
                    <div className="small" style={{ marginTop: 4, color: out ? 'var(--danger)' : 'var(--amber)', fontWeight: 650 }}>
                      {out ? 'Estoque acabou' : `Estoque baixo: ${m.stock} un.`}
                    </div>
                  )}
                </div>
                <span className="trail"><ChevronRight size={20} aria-hidden /></span>
              </Link>
            )
          })}
        </div>
      )}

      <Link to="/medicacoes/novo" className="btn fab"><Plus size={22} aria-hidden /> Novo remédio</Link>
    </div>
  )
}
