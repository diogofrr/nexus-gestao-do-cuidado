import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { chatMessagesToday, sendChat } from '../data/actions'
import { useDb } from '../data/store'
import { ApoioTabs, FormError, PageHeader } from '../components/ui'
import { PLANS } from '../services/plans'

const SUGGESTIONS = [
  'Como lidar com minha exaustão hoje?',
  'Como organizar a rotina de remédios?',
  'Meus direitos como cuidador familiar',
]

export default function Chat() {
  const db = useDb()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (db.chat.length > 0) endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [db.chat.length])

  const send = (value: string) => {
    const r = sendChat(value)
    if (!r.ok) return setError(r.error)
    setError('')
    setText('')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    send(text)
  }

  const limit = PLANS[db.user.plan].chatMessagesPerDay
  const used = chatMessagesToday()

  return (
    <div className="page">
      <PageHeader title="Apoio" />
      <ApoioTabs />

      {limit !== Infinity && limit - used <= 3 && (
        <p className="muted small" style={{ marginBottom: '0.75rem' }}>
          {limit - used > 0 ? `Restam ${limit - used} mensagens hoje.` : 'Suas mensagens de hoje acabaram.'}
        </p>
      )}

      <div className="chat-wrap" aria-live="polite">
        <div className="bubble assistant">Olá! Sou o assistente Nexus. Em que posso ajudar hoje?</div>
        {db.chat.map((m) => (
          <div key={m.id} className={`bubble ${m.role}`}>{m.text}</div>
        ))}
        <div ref={endRef} />
      </div>

      {db.chat.length === 0 && (
        <div className="chips wrap" style={{ marginTop: '1rem' }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      {error && <div style={{ marginTop: '1rem' }}><FormError message={error} /></div>}

      <form className="composer" onSubmit={submit}>
        <label className="sr-only" htmlFor="msg">Mensagem</label>
        <input id="msg" className="input" placeholder="Escreva sua mensagem" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
        <button className="btn" type="submit" disabled={!text.trim()} aria-label="Enviar mensagem"><Send size={20} /></button>
      </form>
    </div>
  )
}
