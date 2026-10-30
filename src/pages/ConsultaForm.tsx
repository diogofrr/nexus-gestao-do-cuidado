import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { removeAppointment, saveAppointment } from '../data/actions'
import { useDb } from '../data/store'
import type { Appointment, AppointmentStatus } from '../domain/types'
import { BackLink, Confirm, Empty, Field, FormError, PageHeader, toast } from '../components/ui'

const blank = (): Omit<Appointment, 'id'> => ({ title: '', doctor: '', specialty: '', status: 'agendada', date: '', time: '' })

export default function ConsultaForm() {
  const { id } = useParams()
  const db = useDb()
  const navigate = useNavigate()
  const existing = id && id !== 'novo' ? db.appointments.find((a) => a.id === id) : undefined
  const [form, setForm] = useState<Omit<Appointment, 'id'> & { id?: string }>(existing ?? blank())
  const [error, setError] = useState('')
  const set = <K extends keyof Appointment>(k: K, v: Appointment[K]) => setForm((f) => ({ ...f, [k]: v }))

  if (id && id !== 'novo' && !existing) {
    return (
      <div className="page">
        <BackLink to="/consultas">Consultas</BackLink>
        <Empty title="Consulta não encontrada" />
      </div>
    )
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date || !form.time) return setError('Informe o título, a data e o horário.')
    const r = saveAppointment({ ...form, title: form.title.trim() })
    if (!r.ok) return setError(r.error)
    toast(existing ? 'Consulta atualizada' : 'Consulta cadastrada')
    navigate('/consultas')
  }

  return (
    <div className="page">
      <BackLink to="/consultas">Consultas</BackLink>
      <PageHeader title={existing ? 'Editar consulta' : 'Nova consulta'} />
      <form className="stack-lg" onSubmit={submit} noValidate>
        <Field label="O que é? *" hint="Ex.: Consulta com cardiologista">
          {(fid) => <input id={fid} className="input" value={form.title} onChange={(e) => set('title', e.target.value)} autoFocus={!existing} />}
        </Field>
        <div className="form-grid">
          <Field label="Data *">{(fid) => <input id={fid} className="input" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />}</Field>
          <Field label="Horário *">{(fid) => <input id={fid} className="input" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />}</Field>
          <Field label="Médico(a)">{(fid) => <input id={fid} className="input" value={form.doctor} onChange={(e) => set('doctor', e.target.value)} />}</Field>
          <Field label="Especialidade">{(fid) => <input id={fid} className="input" value={form.specialty} onChange={(e) => set('specialty', e.target.value)} />}</Field>
        </div>
        <Field label="Situação">
          {(fid) => (
            <select id={fid} className="select" value={form.status} onChange={(e) => set('status', e.target.value as AppointmentStatus)}>
              <option value="agendada">Agendada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          )}
        </Field>
        <FormError message={error} />
        <div className="formbar">
          {existing && (
            <Confirm label="Excluir consulta" message={`Excluir "${existing.title}"? Isso não pode ser desfeito.`} onConfirm={() => { removeAppointment(existing.id); toast('Consulta excluída'); navigate('/consultas') }} className="btn danger">
              Excluir
            </Confirm>
          )}
          <button className="btn" type="submit">Salvar</button>
        </div>
      </form>
    </div>
  )
}
