import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { removeMedication, saveMedication } from '../data/actions'
import { useDb } from '../data/store'
import type { Medication } from '../domain/types'
import { BackLink, Confirm, Empty, Field, FormError, PageHeader, toast } from '../components/ui'

const FREQUENCIES = ['1x ao dia', '2x ao dia', '3x ao dia', '4x ao dia', 'a cada 8h', 'a cada 12h', 'quando necessário', 'outro']
const ROUTES = ['oral', 'sublingual', 'inalatória', 'tópica', 'injetável', 'outra']

type Draft = Omit<Medication, 'id'> & { id?: string }

export default function MedicacaoForm() {
  const { id } = useParams()
  const db = useDb()
  const navigate = useNavigate()
  const existing = id && id !== 'novo' ? db.medications.find((m) => m.id === id) : undefined
  const [form, setForm] = useState<Draft>(
    existing ?? {
      name: '', elderName: db.user.elderName, dosage: '', schedule: '', stock: null, nextPurchase: '',
      prescribedBy: '', frequency: FREQUENCIES[0], route: ROUTES[0], notes: '',
    },
  )
  const [error, setError] = useState('')
  const set = <K extends keyof Medication>(k: K, v: Medication[K]) => setForm((f) => ({ ...f, [k]: v }))

  if (id && id !== 'novo' && !existing) {
    return (
      <div className="page">
        <BackLink to="/medicacoes">Remédios</BackLink>
        <Empty title="Remédio não encontrado" />
      </div>
    )
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.dosage.trim()) return setError('Informe o nome e a dosagem.')
    if (form.stock !== null && form.stock < 0) return setError('O estoque não pode ser negativo.')
    const r = saveMedication({ ...form, name: form.name.trim(), dosage: form.dosage.trim() })
    if (!r.ok) return setError(r.error)
    toast(existing ? 'Remédio atualizado' : 'Remédio cadastrado')
    navigate('/medicacoes')
  }

  return (
    <div className="page">
      <BackLink to="/medicacoes">Remédios</BackLink>
      <PageHeader title={existing ? 'Editar remédio' : 'Novo remédio'} />
      <form className="stack-lg" onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="Nome *">{(fid) => <input id={fid} className="input" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus={!existing} />}</Field>
          <Field label="Dosagem *">{(fid) => <input id={fid} className="input" placeholder="Ex.: 50 mg" value={form.dosage} onChange={(e) => set('dosage', e.target.value)} />}</Field>
          <Field label="Para quem">{(fid) => <input id={fid} className="input" value={form.elderName} onChange={(e) => set('elderName', e.target.value)} />}</Field>
          <Field label="Frequência">
            {(fid) => <select id={fid} className="select" value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>{FREQUENCIES.map((f) => <option key={f}>{f}</option>)}</select>}
          </Field>
        </div>
        <Field label="Horários" hint="Separe por vírgula, como 08:00, 20:00. Eles aparecem na agenda de Hoje.">
          {(fid) => <input id={fid} className="input" placeholder="08:00, 20:00" value={form.schedule} onChange={(e) => set('schedule', e.target.value)} />}
        </Field>
        <div className="form-grid">
          <Field label="Estoque (unidades)">
            {(fid) => (
              <input id={fid} className="input" type="number" inputMode="numeric" min={0} value={form.stock ?? ''} onChange={(e) => set('stock', e.target.value === '' ? null : Number(e.target.value))} />
            )}
          </Field>
          <Field label="Próxima compra">{(fid) => <input id={fid} className="input" type="date" value={form.nextPurchase} onChange={(e) => set('nextPurchase', e.target.value)} />}</Field>
          <Field label="Via de administração">
            {(fid) => <select id={fid} className="select" value={form.route} onChange={(e) => set('route', e.target.value)}>{ROUTES.map((f) => <option key={f}>{f}</option>)}</select>}
          </Field>
          <Field label="Prescrito por">{(fid) => <input id={fid} className="input" value={form.prescribedBy} onChange={(e) => set('prescribedBy', e.target.value)} />}</Field>
        </div>
        <Field label="Observações">{(fid) => <textarea id={fid} className="textarea" value={form.notes} onChange={(e) => set('notes', e.target.value)} />}</Field>
        <FormError message={error} />
        <div className="formbar">
          {existing && (
            <Confirm
              label="Excluir remédio"
              message={`Excluir "${existing.name}"? Os horários somem da agenda.`}
              className="btn danger"
              onConfirm={() => { removeMedication(existing.id); toast('Remédio excluído'); navigate('/medicacoes') }}
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
