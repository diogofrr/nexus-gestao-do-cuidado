import { useState, type FormEvent } from 'react'
import { checkIn } from '../data/actions'
import { useDb } from '../data/store'
import { Field } from '../components/ui'

/** Tela de portaria: valida o código do ingresso na entrada do evento. */
export default function CheckIn() {
  const db = useDb()
  const [code, setCode] = useState('')
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const r = checkIn(code)
    if (!r.ok) return setResult({ ok: false, text: r.error })
    const event = db.events.find((x) => x.id === r.value.eventId)
    setResult({ ok: true, text: `Entrada liberada: ${r.value.holderName} (${event?.title ?? 'evento'})` })
    setCode('')
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Check-in</h1>
          <p>Portaria do evento: digite o código do ingresso</p>
        </div>
      </div>
      <form className="card stack" onSubmit={submit}>
        <Field label="Código do ingresso">
          {(id) => <input id={id} className="code" placeholder="NXS-XXXXXXXXXX" value={code} onChange={(e) => setCode(e.target.value)} autoFocus />}
        </Field>
        <button className="btn" type="submit" disabled={!code.trim()}>Validar</button>
      </form>
      {result && <div className={`alert ${result.ok ? 'success' : 'error'}`} role="status">{result.text}</div>}
    </div>
  )
}
