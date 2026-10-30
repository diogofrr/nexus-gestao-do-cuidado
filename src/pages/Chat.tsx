import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { chatMessagesToday, sendChat } from '../data/actions'
import { useDb } from '../data/store'
import { ApoioTabs, FormError, PageHeader } from '../components/ui'
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
      <PageHeader
        title="Apoio"
        sub="Psicólogos da plataforma, conversa e autocuidado"
      />
      <ApoioTabs />

      <div className="row between" style={{ marginBottom: '0.75rem' }}>
        <span className="row" style={{ gap: '0.45rem' }}>
          <span className="live-dot" aria-hidden />
          <b>Assistente Nexus</b>
          <span className="muted small">online agora</span>
        </span>
        {limit !== Infinity && <span className="pill">{used}/{limit} mensagens hoje</span>}
      </div>

      <div className="chat-wrap" aria-live="polite">
        <div className="bubble assistant">
          Olá! Sou o assistente Nexus. Estou aqui para apoiar você no cuidado e no seu bem-estar. Pode me perguntar sobre organização do cuidado, remédios, emoções ou simplesmente desabafar.{'\n\n'}Em que posso ajudar hoje?
        </div>
        {db.chat.map((m) => (
          <div key={m.id} className={`bubble ${m.role}`}>{m.text}</div>
        ))}
        <div ref={endRef} />
      </div>

      {db.chat.length === 0 && (
        <div className="stack" style={{ marginTop: '1rem', gap: '0.5rem' }}>
          <span className="faint small" style={{ fontWeight: 650 }}>Sugestões para começar</span>
          <div className="chips wrap">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
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
