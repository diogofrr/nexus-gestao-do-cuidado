import { useState, type FormEvent } from 'react'
import { removeMedication, saveMedication } from '../data/actions'
import { useDb } from '../data/store'
import type { Medication } from '../domain/types'
import { Confirm, Empty, Field, Modal, toast } from '../components/ui'
import { formatDateShort } from '../services/dates'

const FREQUENCIES = ['1x ao dia', '2x ao dia', '3x ao dia', '4x ao dia', 'a cada 8h', 'a cada 12h', 'quando necessário', 'outro']
const ROUTES = ['oral', 'sublingual', 'inalatória', 'tópica', 'injetável', 'outra']

type Draft = Omit<Medication, 'id'> & { id?: string }
const blank = (elderName: string): Draft => ({
  name: '', elderName, dosage: '', schedule: '', stock: null, nextPurchase: '',
  prescribedBy: '', frequency: FREQUENCIES[0], route: ROUTES[0], notes: '',
})

export default function Medicacoes() {
  const db = useDb()
  const [editing, setEditing] = useState<Draft | null>(null)

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Medicações</h1>
          <p>{db.medications.length} medicamento{db.medications.length === 1 ? '' : 's'} ativo{db.medications.length === 1 ? '' : 's'}</p>
        </div>
        <button className="btn" onClick={() => setEditing(blank(db.user.elderName))}>+ Adicionar medicação</button>
      </div>

      {db.medications.length === 0 ? (
        <Empty icon="💊" title="Nenhuma medicação cadastrada">
          <p>Cadastre os remédios para acompanhar horários e estoque.</p>
        </Empty>
      ) : (
        db.medications.map((m) => {
          const low = m.stock !== null && m.stock <= 5
          return (
            <div key={m.id} className="card row between">
              <div className="grow">
                <h3>{m.name} <span className="muted small">{m.dosage}</span></h3>
                <p className="muted small">
                  {m.elderName && `${m.elderName} · `}{m.frequency}{m.schedule && ` (${m.schedule})`} · via {m.route}
                </p>
                <div className="row" style={{ marginTop: 6 }}>
                  {m.stock !== null && (
                    <span className={`badge ${low ? 'warn' : 'neutral'}`}>
                      {low ? 'Estoque baixo: ' : 'Estoque: '}{m.stock} un.
                    </span>
                  )}
                  {m.nextPurchase && <span className="small muted">Próxima compra: {formatDateShort(m.nextPurchase)}</span>}
                </div>
                {m.notes && <p className="small" style={{ marginTop: 6 }}>{m.notes}</p>}
              </div>
              <div className="row">
                <button className="btn ghost sm" onClick={() => setEditing(m)}>Editar</button>
                <Confirm label="Remover" message={`Remover "${m.name}"?`} onConfirm={() => { removeMedication(m.id); toast('Medicação removida') }} />
              </div>
            </div>
          )
        })
      )}

      {editing && <MedForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function MedForm({ initial, onClose }: { initial: Draft; onClose: () => void }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const set = <K extends keyof Medication>(k: K, v: Medication[K]) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.dosage.trim()) return setError('Informe nome e dosagem.')
    if (form.stock !== null && form.stock < 0) return setError('O estoque não pode ser negativo.')
    const r = saveMedication({ ...form, name: form.name.trim(), dosage: form.dosage.trim() })
    if (!r.ok) return setError(r.error)
    toast(initial.id ? 'Medicação atualizada' : 'Medicação cadastrada')
    onClose()
  }

  return (
    <Modal title={initial.id ? 'Editar medicação' : 'Nova Medicação'} onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="Nome*">{(id) => <input id={id} value={form.name} onChange={(e) => set('name', e.target.value)} />}</Field>
          <Field label="Nome do idoso">{(id) => <input id={id} value={form.elderName} onChange={(e) => set('elderName', e.target.value)} />}</Field>
          <Field label="Dosagem*">{(id) => <input id={id} placeholder="Ex: 50 mg" value={form.dosage} onChange={(e) => set('dosage', e.target.value)} />}</Field>
          <Field label="Horários">{(id) => <input id={id} placeholder="Ex: 08:00, 20:00" value={form.schedule} onChange={(e) => set('schedule', e.target.value)} />}</Field>
          <Field label="Estoque (unidades)">
            {(id) => (
              <input id={id} type="number" min={0} value={form.stock ?? ''} onChange={(e) => set('stock', e.target.value === '' ? null : Number(e.target.value))} />
            )}
          </Field>
          <Field label="Próxima compra">{(id) => <input id={id} type="date" value={form.nextPurchase} onChange={(e) => set('nextPurchase', e.target.value)} />}</Field>
          <Field label="Prescrito por">{(id) => <input id={id} value={form.prescribedBy} onChange={(e) => set('prescribedBy', e.target.value)} />}</Field>
          <Field label="Frequência">
            {(id) => <select id={id} value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>{FREQUENCIES.map((f) => <option key={f}>{f}</option>)}</select>}
          </Field>
          <Field label="Via de administração">
            {(id) => <select id={id} value={form.route} onChange={(e) => set('route', e.target.value)}>{ROUTES.map((f) => <option key={f}>{f}</option>)}</select>}
          </Field>
        </div>
        <Field label="Observações">{(id) => <textarea id={id} value={form.notes} onChange={(e) => set('notes', e.target.value)} />}</Field>
        {error && <div className="alert error" role="alert">{error}</div>}
        <div className="row">
          <button className="btn" type="submit">Salvar medicação</button>
          <button className="btn ghost" type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}
