import { useState, type FormEvent } from 'react'
import { removeProfessional, saveProfessional } from '../data/actions'
import { useDb } from '../data/store'
import type { Professional } from '../domain/types'
import { Confirm, Empty, Field, Modal, toast } from '../components/ui'

type Draft = Omit<Professional, 'id'> & { id?: string }
const blank = (): Draft => ({ name: '', specialty: '', phone: '' })

export default function Profissionais() {
  const db = useDb()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Draft | null>(null)

  const q = query.trim().toLowerCase()
  const list = db.professionals.filter((p) => !q || `${p.name} ${p.specialty}`.toLowerCase().includes(q))

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Profissionais</h1>
          <p>Sua rede de apoio</p>
        </div>
        <button className="btn" onClick={() => setEditing(blank())}>+ Adicionar profissional</button>
      </div>

      <div className="field">
        <label className="sr-only" htmlFor="busca">Buscar profissional</label>
        <input id="busca" type="search" placeholder="Buscar por nome ou especialidade..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {list.length === 0 ? (
        <Empty icon="👥" title={q ? 'Nenhum profissional encontrado' : 'Nenhum profissional cadastrado'} />
      ) : (
        list.map((p) => (
          <div key={p.id} className="card row between">
            <div className="row grow">
              <div className="avatar" style={{ background: 'var(--primary)' }} aria-hidden>{p.name[0]}</div>
              <div>
                <h3>{p.name}</h3>
                <p className="muted small">{p.specialty}</p>
                {p.phone && <a className="small" href={`tel:${p.phone}`}>{p.phone}</a>}
              </div>
            </div>
            <div className="row">
              <button className="btn ghost sm" onClick={() => setEditing(p)}>Editar</button>
              <Confirm label="Remover" message={`Remover ${p.name} da sua rede?`} onConfirm={() => { removeProfessional(p.id); toast('Profissional removido') }} />
            </div>
          </div>
        ))
      )}

      {editing && <ProfForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function ProfForm({ initial, onClose }: { initial: Draft; onClose: () => void }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Informe o nome.')
    saveProfessional({ ...form, name: form.name.trim() })
    toast(initial.id ? 'Profissional atualizado' : 'Profissional adicionado')
    onClose()
  }

  return (
    <Modal title={initial.id ? 'Editar profissional' : 'Novo profissional'} onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        <Field label="Nome*">{(id) => <input id={id} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}</Field>
        <Field label="Especialidade">{(id) => <input id={id} value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />}</Field>
        <Field label="Telefone">{(id) => <input id={id} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}</Field>
        {error && <div className="alert error" role="alert">{error}</div>}
        <div className="row">
          <button className="btn" type="submit">Salvar</button>
          <button className="btn ghost" type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}
