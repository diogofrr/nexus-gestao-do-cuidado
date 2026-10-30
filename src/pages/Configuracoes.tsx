import { useState, type FormEvent } from 'react'
import { changePlan, setNotifications, updateUser } from '../data/actions'
import { resetDb, useDb } from '../data/store'
import AccessibilityModal from '../components/Accessibility'
import { Confirm, Field, Modal, toast } from '../components/ui'
import { PLANS } from '../services/plans'

type Panel = null | 'perfil' | 'planos' | 'notificacoes' | 'privacidade' | 'aparencia'

export default function Configuracoes() {
  const db = useDb()
  const [panel, setPanel] = useState<Panel>(null)
  const plan = PLANS[db.user.plan]

  const Item = ({ id, title, sub }: { id: Exclude<Panel, null>; title: string; sub: string }) => (
    <button className="card row between" style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }} onClick={() => setPanel(id)}>
      <div>
        <h3>{title}</h3>
        <p className="muted small">{sub}</p>
      </div>
      <span aria-hidden>›</span>
    </button>
  )

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Configurações</h1>
      </div>

      <div className="card row">
        <div className="avatar" style={{ background: 'var(--primary)' }} aria-hidden>{db.user.name[0]}</div>
        <div>
          <h3>{db.user.name}</h3>
          <p className="muted small">{db.user.email}</p>
        </div>
      </div>

      <h2>Conta</h2>
      <Item id="perfil" title="Perfil e Dados" sub="Nome, e-mail e idoso sob seus cuidados" />

      <h2>Assinatura</h2>
      <Item id="planos" title="Plano de Assinatura" sub={`${plan.name} — ${plan.priceLabel}`} />

      <h2>Preferências</h2>
      <Item id="aparencia" title="Aparência e leitura" sub="Tamanho do texto, tema e alto contraste" />
      <Item id="notificacoes" title="Notificações" sub="Medicamentos, consultas e eventos" />
      <Item id="privacidade" title="Privacidade e Segurança" sub="Seus dados protegidos" />

      <p className="muted small" style={{ textAlign: 'center' }}>Nexus v1.1 · ESAMC Uberlândia 2026</p>

      {panel === 'perfil' && <Perfil onClose={() => setPanel(null)} />}
      {panel === 'planos' && <Planos onClose={() => setPanel(null)} />}
      {panel === 'aparencia' && <AccessibilityModal onClose={() => setPanel(null)} />}
      {panel === 'notificacoes' && <Notificacoes onClose={() => setPanel(null)} />}
      {panel === 'privacidade' && <Privacidade onClose={() => setPanel(null)} />}
    </div>
  )
}

function Perfil({ onClose }: { onClose: () => void }) {
  const db = useDb()
  const [name, setName] = useState(db.user.name)
  const [email, setEmail] = useState(db.user.email)
  const [elder, setElder] = useState(db.user.elderName)
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Informe seu nome.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('E-mail inválido.')
    updateUser({ name: name.trim(), email: email.trim(), elderName: elder.trim() })
    toast('Perfil atualizado')
    onClose()
  }

  return (
    <Modal title="Editar Perfil" onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        <Field label="Nome completo">{(id) => <input id={id} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
        <Field label="E-mail">{(id) => <input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
        <Field label="Nome do idoso sob seus cuidados">{(id) => <input id={id} placeholder="Ex: Maria da Silva" value={elder} onChange={(e) => setElder(e.target.value)} />}</Field>
        {error && <div className="alert error" role="alert">{error}</div>}
        <button className="btn" type="submit">Salvar Alterações</button>
      </form>
    </Modal>
  )
}

function Planos({ onClose }: { onClose: () => void }) {
  const db = useDb()
  return (
    <Modal title="Planos Nexus" onClose={onClose}>
      <p className="muted" style={{ marginBottom: 12 }}>Escolha o plano ideal para o seu cuidado. A troca é simulada para a demonstração.</p>
      <div className="stack">
        {Object.values(PLANS).map((p) => {
          const current = p.id === db.user.plan
          return (
            <div key={p.id} className={`card plan${current ? ' current' : ''}`}>
              <div className="row between">
                <h3>{p.name} {p.highlight && <span className="badge">Recomendado</span>}</h3>
                <span className="price">{p.priceLabel}</span>
              </div>
              <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
              <button
                className="btn block"
                style={{ marginTop: 12 }}
                disabled={current}
                onClick={() => { changePlan(p.id); toast(`Plano alterado para ${p.name}`) }}
              >
                {current ? 'Plano atual' : p.id === 'basic' ? 'Continuar Gratuito' : `Assinar ${p.name}`}
              </button>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

function Notificacoes({ onClose }: { onClose: () => void }) {
  const db = useDb()
  const n = db.notifications
  return (
    <Modal title="Notificações" onClose={onClose}>
      <label className="switch">
        <span>
          <b>Medicamentos e consultas</b>
          <br /><span className="muted small">Lembretes de horários e compromissos</span>
        </span>
        <input type="checkbox" checked={n.medsAndAppointments} onChange={(e) => setNotifications({ medsAndAppointments: e.target.checked })} style={{ width: 22, height: 22 }} />
      </label>
      <label className="switch">
        <span>
          <b>Eventos e ingressos</b>
          <br /><span className="muted small">Aviso antes das palestras que você vai assistir</span>
        </span>
        <input type="checkbox" checked={n.events} onChange={(e) => setNotifications({ events: e.target.checked })} style={{ width: 22, height: 22 }} />
      </label>
    </Modal>
  )
}

function Privacidade({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Privacidade e Segurança" onClose={onClose}>
      <div className="stack">
        <p>Nesta versão de demonstração, todos os dados ficam salvos apenas neste navegador e não são enviados a nenhum servidor.</p>
        <p className="muted small">Você pode apagar tudo e voltar aos dados de exemplo a qualquer momento.</p>
        <Confirm
          className="btn danger"
          label="Restaurar dados de exemplo"
          message="Todos os seus cadastros, sessões e ingressos serão apagados e os dados de exemplo voltam. Continuar?"
          onConfirm={() => { resetDb(); onClose(); toast('Dados restaurados') }}
        />
      </div>
    </Modal>
  )
}
