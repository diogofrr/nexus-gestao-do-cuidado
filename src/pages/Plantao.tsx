import { Link } from 'react-router-dom'

const TECHNIQUES = [
  { icon: '🌿', title: 'Respiração 4-7-8', text: 'Inspire por 4s, segure por 7s, expire por 8s. Repita 4 vezes. Ativa o sistema nervoso parassimpático.' },
  { icon: '✍️', title: 'Diário de Gratidão', text: 'Escreva 3 coisas boas do dia, mesmo pequenas. Redireciona o foco cognitivo para aspectos positivos.' },
  { icon: '⏸️', title: 'Pausas Programadas', text: 'A cada 2h de cuidado, faça 10 min de pausa. Sair do ambiente reduz cortisol.' },
  { icon: '🤝', title: 'Pedir Ajuda é Força', text: 'Delegar tarefas não é fraqueza. Identifique quem pode assumir algumas responsabilidades.' },
  { icon: '🚶', title: 'Movimento Diário', text: 'Mesmo 15 min de caminhada libera endorfina e reduz sintomas depressivos.' },
  { icon: '💬', title: 'Falar sobre o Cansaço', text: 'Nomear o sofrimento já alivia. O cansaço de cuidar não é fraqueza, é humano.' },
]

const WARNING_SIGNS = [
  'Irritabilidade frequente e sentimentos de raiva',
  'Choro sem motivo aparente',
  'Insônia ou sono excessivo',
  'Sensação de aprisionamento ou desespero',
  'Negligência da própria saúde',
  'Isolamento social progressivo',
]

const RESOURCES = [
  { name: 'CVV — Centro de Valorização da Vida', desc: 'Apoio emocional gratuito 24h', note: '📞 188' },
  { name: 'CAPS — Centro de Atenção Psicossocial', desc: 'Rede pública de saúde mental', note: 'Procure na UBS mais próxima' },
  { name: 'CRAS — Assistência Social', desc: 'Apoio social e orientação familiar', note: 'Procure na sua região' },
]

export default function Plantao() {
  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Apoio Psicológico</h1>
          <p>Você também merece cuidado</p>
        </div>
      </div>

      <div className="card stack">
        <h2>Mensagem Nexus</h2>
        <p>
          Cuidar de alguém que amamos é um ato profundo de amor. Mas cuidar sem cuidar de si é caminho certo para o esgotamento. Você não precisa enfrentar isso sozinho(a).
        </p>
        <div className="row">
          <Link to="/psicologos" className="btn">Agendar com psicólogo</Link>
          <Link to="/chat" className="btn secondary">Conversar com Nexus</Link>
        </div>
      </div>

      <div className="alert error">
        <b>Em crise? Ligue agora.</b> CVV: 188 (gratuito, 24h) · SAMU: 192
      </div>

      <section className="stack">
        <h2>Técnicas de Autocuidado</h2>
        <div className="grid2">
          {TECHNIQUES.map((t) => (
            <div key={t.title} className="card">
              <div style={{ fontSize: '1.6rem' }} aria-hidden>{t.icon}</div>
              <h3>{t.title}</h3>
              <p className="muted small">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stack">
        <h2>Recursos de Apoio</h2>
        {RESOURCES.map((r) => (
          <div key={r.name} className="card">
            <h3>{r.name}</h3>
            <p className="muted small">{r.desc}</p>
            <p className="small"><b>{r.note}</b></p>
          </div>
        ))}
      </section>

      <section className="card alert warn stack">
        <h2>⚠️ Sinais de Sobrecarga</h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {WARNING_SIGNS.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <p>Se você se identifica com 3 ou mais, procure apoio psicológico profissional.</p>
        <div><Link to="/psicologos" className="btn">Ver psicólogos disponíveis</Link></div>
      </section>
    </div>
  )
}
