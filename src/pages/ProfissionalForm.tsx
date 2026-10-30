import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { removeProfessional, saveProfessional } from '../data/actions'
import { useDb } from '../data/store'
import type { Professional } from '../domain/types'
import { BackLink, Confirm, Empty, Field, FormError, PageHeader, toast } from '../components/ui'

type Draft = Omit<Professional, 'id'> & { id?: string }

export default function ProfissionalForm() {
  const { id } = useParams()
  const db = useDb()
  const navigate = useNavigate()
  const existing = id && id !== 'novo' ? db.professionals.find((p) => p.id === id) : undefined
  const [form, setForm] = useState<Draft>(existing ?? { name: '', specialty: '', phone: '' })
  const [error, setError] = useState('')

  if (id && id !== 'novo' && !existing) {
    return (
      <div className="page">
        <BackLink to="/profissionais">Rede de apoio</BackLink>
        <Empty title="Profissional não encontrado" />
      </div>
    )
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Informe o nome.')
    saveProfessional({ ...form, name: form.name.trim() })
    toast(existing ? 'Contato atualizado' : 'Contato adicionado')
    navigate('/profissionais')
  }

  return (
    <div className="page">
      <BackLink to="/profissionais">Rede de apoio</BackLink>
      <PageHeader title={existing ? 'Editar contato' : 'Novo contato'} />
      <form className="stack-lg" onSubmit={submit} noValidate>
        <Field label="Nome *">{(fid) => <input id={fid} className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus={!existing} />}</Field>
        <Field label="Especialidade">{(fid) => <input id={fid} className="input" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />}</Field>
        <Field label="Telefone">{(fid) => <input id={fid} className="input" type="tel" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}</Field>
        <FormError message={error} />
        <div className="formbar">
          {existing && (
            <Confirm
              label="Excluir contato"
              message={`Remover ${existing.name} da sua rede?`}
              className="btn danger"
              onConfirm={() => { removeProfessional(existing.id); toast('Contato removido'); navigate('/profissionais') }}
            >
              Excluir
            </Confirm>
          )}
          <button className="btn" type="submit">Salvar</button>
        </div>
      </form>
    </div>
  )
}
