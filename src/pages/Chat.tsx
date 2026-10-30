import { useEffect, useRef, useState, type FormEvent } from 'react'
import { chatMessagesToday, sendChat } from '../data/actions'
import { useDb } from '../data/store'
import { PLANS } from '../services/plans'

const SUGGESTIONS = [
  'Como lidar com minha exaustão hoje?',
  'O que é síndrome de burnout do cuidador?',
  'Como organizar melhor a rotina de medicamentos?',
  'Meus direitos como cuidador familiar',
  'Como conversar com o idoso sobre limitações?',
]

export default function Chat() {
  const db = useDb()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
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
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Assistente Nexus</h1>
          <p><span style={{ color: 'var(--success)' }}>●</span> Online agora</p>
        </div>
        {limit !== Infinity && <span className="badge neutral">{used}/{limit} mensagens hoje</span>}
      </div>

      <div className="chat" aria-live="polite">
        <div className="bubble assistant">
          Olá! Sou o assistente Nexus 💙{'\n\n'}Estou aqui para apoiar você no cuidado e no seu bem-estar. Pode me perguntar sobre organização do cuidado, medicamentos, emoções ou simplesmente desabafar.{'\n\n'}Em que posso te ajudar hoje?
        </div>
        {db.chat.map((m) => (
          <div key={m.id} className={`bubble ${m.role}`}>{m.text}</div>
        ))}
        <div ref={endRef} />
      </div>

      {db.chat.length === 0 && (
        <div className="chips">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      {error && <div className="alert warn" role="alert">{error}</div>}

      <form className="row" onSubmit={submit}>
        <label className="sr-only" htmlFor="msg">Mensagem</label>
        <input
          id="msg"
          className="grow"
          style={{ minHeight: 44, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)' }}
          placeholder="Escreva sua mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" type="submit" disabled={!text.trim()}>Enviar</button>
      </form>
    </div>
  )
}
