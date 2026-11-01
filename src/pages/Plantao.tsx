import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Dumbbell, HeartHandshake, Leaf, Phone, Stethoscope, type LucideIcon } from 'lucide-react'
import { ApoioTabs, Banner, PageHeader } from '../components/ui'

const TECHNIQUES = [
  { title: 'Diário de gratidão', text: 'Escreva 3 coisas boas do dia, mesmo pequenas.' },
  { title: 'Pausas programadas', text: 'A cada 2 horas de cuidado, faça 10 minutos de pausa fora do ambiente.' },
  { title: 'Pedir ajuda é força', text: 'Pense em quem pode assumir uma parte das responsabilidades.' },
  { title: 'Movimento diário', text: 'Mesmo 15 minutos de caminhada ajudam a baixar o estresse.' },
]

const SIGNS = [
  'Irritabilidade frequente e raiva',
  'Choro sem motivo aparente',
  'Insônia ou sono em excesso',
  'Sensação de aprisionamento ou desespero',
  'Descuido com a própria saúde',
  'Isolamento social progressivo',
]

const RESOURCES = [
  { name: 'CVV', desc: 'Apoio emocional gratuito, 24 horas', tel: '188', label: 'Ligar 188' },
  { name: 'CAPS', desc: 'Saúde mental pública. Procure a UBS mais próxima.' },
  { name: 'CRAS', desc: 'Apoio social para famílias. Procure a unidade da sua região.' },
]

type Phase = 'idle' | 'in' | 'hold' | 'out' | 'done'
const PHASES: { phase: 'in' | 'hold' | 'out'; seconds: number; label: string }[] = [
  { phase: 'in', seconds: 4, label: 'Inspire' },
  { phase: 'hold', seconds: 7, label: 'Segure' },
  { phase: 'out', seconds: 8, label: 'Solte o ar' },
]
const CYCLES = 4

function BreathGuide() {
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!running) return
    const total = CYCLES * PHASES.length
    if (step >= total) {
      setRunning(false)
      return
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), PHASES[step % 3].seconds * 1000)
    return () => window.clearTimeout(id)
  }, [running, step])

  const finished = !running && step >= CYCLES * PHASES.length
  const current = running ? PHASES[step % 3] : null
  const phase: Phase = running ? current!.phase : finished ? 'done' : 'idle'

  return (
    <section className="card breath" aria-label="Respiração guiada">
      <h2>Respire por um minuto</h2>
      <div
        className={`orb ${phase === 'in' ? 'in' : phase === 'hold' ? 'hold' : phase === 'out' ? 'out' : ''}`}
        style={{ ['--dur' as string]: `${current ? current.seconds : 1}s` }}
        role="status"
        aria-live="polite"
      >
        {current ? current.label : finished ? 'Muito bem' : 'Pronto?'}
      </div>
      <button className="btn lg" onClick={() => { if (running) setRunning(false); else { setStep(0); setRunning(true) } }}>
        {running ? 'Parar' : finished ? 'Repetir' : 'Começar'}
      </button>
    </section>
  )
}

function Fold({ id, icon: Icon, title, open, onToggle, children }: { id: string; icon: LucideIcon; title: string; open: boolean; onToggle: (id: string) => void; children: ReactNode }) {
  return (
    <div>
      <button className="item" onClick={() => onToggle(id)} aria-expanded={open}>
        <span className="kind"><Icon size={20} aria-hidden /></span>
        <span className="main title">{title}</span>
        <ChevronDown size={20} aria-hidden style={{ rotate: open ? '180deg' : '0deg', transition: 'rotate .2s' }} />
      </button>
      {open && <div className="stack" style={{ padding: '0 1rem 1.1rem' }}>{children}</div>}
    </div>
  )
}

export default function Plantao() {
  const [open, setOpen] = useState<string | null>(null)
  const [signs, setSigns] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id))
  const toggleSign = (s: string) =>
    setSigns((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })

  return (
    <div className="page">
      <PageHeader title="Apoio" />
      <ApoioTabs />

      <div className="stack-lg">
        <div className="banner danger" role="note">
          <Phone size={20} aria-hidden />
          <div>
            <b>Está em crise? Ligue agora.</b>
            <div className="row" style={{ marginTop: 8 }}>
              <a className="btn danger sm" href="tel:188">CVV 188 (24h)</a>
              <a className="btn danger sm" href="tel:192">SAMU 192</a>
            </div>
          </div>
        </div>

        <BreathGuide />

        <div className="list accordion">
          <Fold id="dicas" icon={Leaf} title="Dicas de autocuidado" open={open === 'dicas'} onToggle={toggle}>
            {TECHNIQUES.map((t) => <p key={t.title}><b>{t.title}.</b> <span className="muted">{t.text}</span></p>)}
          </Fold>
          <Fold id="sinais" icon={Stethoscope} title="Como você está?" open={open === 'sinais'} onToggle={toggle}>
            <p className="muted">Marque o que você tem sentido ultimamente.</p>
            <div className="list">
              {SIGNS.map((s) => (
                <label key={s} className="switch" style={{ cursor: 'pointer' }}>
                  <span>{s}</span>
                  <input type="checkbox" checked={signs.has(s)} onChange={() => toggleSign(s)} />
                  <span className="track" aria-hidden />
                </label>
              ))}
            </div>
            {signs.size >= 3 && (
              <Banner tone="warn" icon={Dumbbell}>
                <p><b>Você marcou {signs.size} sinais.</b> Vale procurar apoio profissional.</p>
                <p style={{ marginTop: 8 }}><Link to="/psicologos">Ver psicólogos</Link></p>
              </Banner>
            )}
          </Fold>
          <Fold id="ajuda" icon={HeartHandshake} title="Onde buscar ajuda" open={open === 'ajuda'} onToggle={toggle}>
            {RESOURCES.map((r) => (
              <div key={r.name} className="row between" style={{ flexWrap: 'nowrap' }}>
                <p><b>{r.name}</b><br /><span className="muted small">{r.desc}</span></p>
                {r.tel && <a className="btn secondary sm" href={`tel:${r.tel}`}>{r.label}</a>}
              </div>
            ))}
          </Fold>
        </div>
      </div>
    </div>
  )
}
