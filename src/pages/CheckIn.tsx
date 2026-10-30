import { useState, type FormEvent } from 'react'
import { ScanLine } from 'lucide-react'
import { checkIn } from '../data/actions'
import { useDb } from '../data/store'
import { BackLink, Banner, Field, PageHeader } from '../components/ui'

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
    <div className="page">
      <BackLink to="/configuracoes">Configurações</BackLink>
      <PageHeader title="Portaria do evento" sub="Digite o código do ingresso para liberar a entrada." />
      <form className="card stack" onSubmit={submit}>
        <Field label="Código do ingresso">
          {(fid) => <input id={fid} className="input code" placeholder="NXS-XXXXXXXXXX" value={code} onChange={(e) => setCode(e.target.value)} autoFocus autoCapitalize="characters" />}
        </Field>
        <button className="btn lg" type="submit" disabled={!code.trim()}><ScanLine size={20} aria-hidden /> Validar entrada</button>
      </form>
      {result && <div style={{ marginTop: '1rem' }} role="status"><Banner tone={result.ok ? 'success' : 'danger'}>{result.text}</Banner></div>}
    </div>
  )
}
