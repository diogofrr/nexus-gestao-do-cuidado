import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Dumbbell, Footprints, HandHeart, MessageCircleHeart, NotebookPen, PauseCircle, Phone, type LucideIcon } from 'lucide-react'
import { ApoioTabs, Banner, PageHeader } from '../components/ui'

const TECHNIQUES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: NotebookPen, title: 'Diário de gratidão', text: 'Escreva 3 coisas boas do dia, mesmo pequenas. Isso redireciona o foco para o que está funcionando.' },
  { icon: PauseCircle, title: 'Pausas programadas', text: 'A cada 2 horas de cuidado, faça 10 minutos de pausa. Sair do ambiente ajuda o corpo a baixar o estresse.' },
  { icon: HandHeart, title: 'Pedir ajuda é força', text: 'Delegar tarefas não é fraqueza. Pense em quem pode assumir uma parte das responsabilidades.' },
  { icon: Footprints, title: 'Movimento diário', text: 'Mesmo 15 minutos de caminhada libera endorfina e reduz sintomas de tristeza.' },
  { icon: MessageCircleHeart, title: 'Falar sobre o cansaço', text: 'Nomear o sofrimento já alivia. O cansaço de cuidar não é fraqueza, é humano.' },
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
  { name: 'CVV, Centro de Valorização da Vida', desc: 'Apoio emocional gratuito, 24 horas', tel: '188', label: 'Ligar 188' },
  { name: 'CAPS, Centro de Atenção Psicossocial', desc: 'Rede pública de saúde mental. Procure a UBS mais próxima.' },
  { name: 'CRAS, Assistência Social', desc: 'Apoio social e orientação para famílias. Procure a unidade da sua região.' },
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
      <h2>Respiração 4-7-8</h2>
      <p className="muted" style={{ maxWidth: '26rem' }}>Inspire por 4 segundos, segure por 7 e solte o ar por 8. São 4 ciclos, cerca de 1 minuto e meio.</p>
      <div
        className={`orb ${phase === 'in' ? 'in' : phase === 'hold' ? 'hold' : phase === 'out' ? 'out' : ''}`}
        style={{ ['--dur' as string]: `${current ? current.seconds : 1}s` }}
        role="status"
        aria-live="polite"
      >
        {current ? current.label : finished ? 'Muito bem' : 'Pronto?'}
      </div>
      {running && <p className="muted small">Ciclo {Math.floor(step / 3) + 1} de {CYCLES}</p>}
      <button className="btn lg" onClick={() => { if (running) setRunning(false); else { setStep(0); setRunning(true) } }}>
        {running ? 'Parar' : finished ? 'Repetir' : 'Começar'}
      </button>
    </section>
  )
}

export default function Plantao() {
  const [open, setOpen] = useState<number | null>(null)
  const [signs, setSigns] = useState<Set<string>>(new Set())
  const toggleSign = (s: string) =>
    setSigns((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })

  return (
    <div className="page">
      <PageHeader title="Apoio" sub="Psicólogos da plataforma, conversa e autocuidado" />
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

        <section className="card stack">
          <h2>Você também merece cuidado</h2>
          <p>
            Cuidar de alguém que amamos é um ato profundo de amor. Mas cuidar sem cuidar de si é o caminho para o esgotamento. Você não precisa enfrentar isso sozinho(a).
          </p>
          <div className="row">
            <Link to="/psicologos" className="btn">Agendar com psicólogo</Link>
            <Link to="/chat" className="btn secondary">Conversar com o Nexus</Link>
          </div>
        </section>

        <BreathGuide />

        <section className="stack">
          <h2>Técnicas de autocuidado</h2>
          <div className="list accordion">
            {TECHNIQUES.map((t, i) => (
              <div key={t.title}>
                <button className="item" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                  <span className="kind"><t.icon size={20} aria-hidden /></span>
                  <span className="main title">{t.title}</span>
                  <ChevronDown size={20} aria-hidden style={{ rotate: open === i ? '180deg' : '0deg', transition: 'rotate .2s' }} />
                </button>
                {open === i && <p className="body">{t.text}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="stack">
          <h2>Sinais de sobrecarga</h2>
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
              <p><b>Você marcou {signs.size} sinais.</b> Com 3 ou mais, vale procurar apoio profissional. Cuidar de você também é cuidar de quem você ama.</p>
              <p style={{ marginTop: 8 }}><Link to="/psicologos">Ver psicólogos disponíveis</Link></p>
            </Banner>
          )}
        </section>

        <section className="stack">
          <h2>Onde buscar ajuda</h2>
          <div className="list">
            {RESOURCES.map((r) => (
              <div key={r.name} className="item" style={{ alignItems: 'flex-start' }}>
                <div className="main">
                  <div className="title">{r.name}</div>
                  <div className="meta">{r.desc}</div>
                </div>
                {r.tel && <a className="btn secondary sm" href={`tel:${r.tel}`}>{r.label}</a>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
