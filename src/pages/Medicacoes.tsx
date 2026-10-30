import { ChevronRight, PackageX, Pill, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDb } from '../data/store'
import { CuidadoTabs, Empty, PageHeader } from '../components/ui'
import { friendlyDate } from '../services/dates'
import { parseDoseTimes } from '../services/agenda'

export default function Medicacoes() {
  const db = useDb()
  const n = db.medications.length

  return (
    <div className="page">
      <PageHeader title="Cuidado" sub="Consultas, remédios, tarefas e a rede de apoio" />
      <CuidadoTabs />

      {n === 0 ? (
        <div className="card">
          <Empty icon={Pill} title="Nenhum remédio cadastrado">
            <p>Cadastre os remédios para ver os horários na agenda e acompanhar o estoque.</p>
          </Empty>
        </div>
      ) : (
        <>
          <p className="muted" style={{ marginBottom: '0.75rem' }}>{n} {n === 1 ? 'remédio ativo' : 'remédios ativos'}</p>
          <div className="list">
            {db.medications.map((m) => {
              const times = parseDoseTimes(m.schedule)
              const out = m.stock === 0
              const low = m.stock !== null && m.stock > 0 && m.stock <= 5
              const pct = m.stock === null ? 0 : Math.min(100, Math.round((m.stock / 30) * 100))
              return (
                <Link key={m.id} to={`/medicacoes/${m.id}`} className="item" style={{ alignItems: 'flex-start' }}>
                  <span className="kind remedio" aria-hidden>{out ? <PackageX size={20} /> : <Pill size={20} />}</span>
                  <div className="main">
                    <div className="title">{m.name} <span className="faint" style={{ fontWeight: 500 }}>{m.dosage}</span></div>
                    <div className="meta">
                      {m.frequency}{times.length > 0 && ` · ${times.join(' e ')}`} · via {m.route}
                    </div>
                    {m.stock !== null && (
                      <div style={{ marginTop: 8, maxWidth: '16rem' }}>
                        <div className={`meter${out ? ' out' : low ? ' low' : ''}`} role="img" aria-label={`Estoque: ${m.stock} unidades`}>
                          <i style={{ width: `${Math.max(pct, out ? 100 : 4)}%` }} />
                        </div>
                        <div className="row between small" style={{ marginTop: 4 }}>
                          <span
                            className={out || low ? undefined : 'muted'}
                            style={out ? { color: 'var(--danger)', fontWeight: 650 } : low ? { color: 'var(--amber)', fontWeight: 650 } : undefined}
                          >
                            {out ? 'Estoque acabou' : low ? `Estoque baixo: ${m.stock} un.` : `${m.stock} un. em estoque`}
                          </span>
                          {m.nextPurchase && <span className="faint">Comprar {friendlyDate(m.nextPurchase).toLowerCase()}</span>}
                        </div>
                      </div>
                    )}
                    {m.notes && <p className="muted small" style={{ marginTop: 6 }}>{m.notes}</p>}
                  </div>
                  <span className="trail"><ChevronRight size={20} aria-hidden /></span>
                </Link>
              )
            })}
          </div>
        </>
      )}

      <Link to="/medicacoes/novo" className="btn fab"><Plus size={22} aria-hidden /> Novo remédio</Link>
    </div>
  )
}
