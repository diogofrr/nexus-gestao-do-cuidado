import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, ChevronRight, CaseSensitive, Crown, ShieldCheck, UserRound } from 'lucide-react'
import { changePlan, setNotifications, updateUser } from '../data/actions'
import { resetDb, useDb } from '../data/store'
import { AppearanceControls } from '../components/Appearance'
import { Avatar, BackLink, Confirm, Field, FormError, PageHeader, toast } from '../components/ui'
import { PLANS } from '../services/plans'

function Sub({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="page">
      <BackLink to="/configuracoes">Perfil</BackLink>
      <PageHeader title={title} sub={sub} />
      {children}
    </div>
  )
}

export default function Configuracoes() {
  const db = useDb()
  const plan = PLANS[db.user.plan]

  const rows = [
    { to: '/configuracoes/perfil', icon: UserRound, title: 'Meus dados' },
    { to: '/configuracoes/plano', icon: Crown, title: 'Meu plano', sub: plan.name },
    { to: '/configuracoes/aparencia', icon: CaseSensitive, title: 'Texto e tema' },
    { to: '/configuracoes/notificacoes', icon: Bell, title: 'Notificações' },
    { to: '/configuracoes/privacidade', icon: ShieldCheck, title: 'Privacidade' },
  ]

  return (
    <div className="page">
      <PageHeader title="Perfil" />
      <div className="stack-lg">
        <div className="card row" style={{ flexWrap: 'nowrap', gap: '1rem' }}>
          <Avatar name={db.user.name} size="lg" />
          <div className="grow">
            <h2>{db.user.name}</h2>
            <p className="muted small">{db.user.email}</p>
          </div>
        </div>

        <div className="list">
          {rows.map((r) => (
            <Link key={r.to} to={r.to} className="item">
              <span className="kind"><r.icon size={20} aria-hidden /></span>
              <div className="main">
                <div className="title">{r.title}</div>
                {r.sub && <div className="meta">{r.sub}</div>}
              </div>
              <span className="trail"><ChevronRight size={20} aria-hidden /></span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PerfilPage() {
  const db = useDb()
  const [name, setName] = useState(db.user.name)
  const [email, setEmail] = useState(db.user.email)
  const [elder, setElder] = useState(db.user.elderName)
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Informe seu nome.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Esse e-mail parece inválido.')
    updateUser({ name: name.trim(), email: email.trim(), elderName: elder.trim() })
    toast('Perfil atualizado')
  }

  return (
    <Sub title="Meus dados">
      <form className="stack-lg" onSubmit={submit} noValidate>
        <Field label="Seu nome">{(id) => <input id={id} className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}</Field>
        <Field label="E-mail">{(id) => <input id={id} className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />}</Field>
        <Field label="Quem você cuida">
          {(id) => <input id={id} className="input" placeholder="Ex.: Maria da Silva" value={elder} onChange={(e) => setElder(e.target.value)} />}
        </Field>
        <FormError message={error} />
        <div className="formbar"><button className="btn" type="submit">Salvar alterações</button></div>
      </form>
    </Sub>
  )
}

export function PlanoPage() {
  const db = useDb()
  return (
    <Sub title="Meu plano">
      <div className="stack">
        {Object.values(PLANS).map((p) => {
          const current = p.id === db.user.plan
          return (
            <section key={p.id} className={`plan-card${current ? ' current' : ''}`}>
              <div className="row between">
                <h2>{p.name}</h2>
                {p.highlight && <span className="pill brand">Recomendado</span>}
              </div>
              <p className="price" style={{ fontSize: '1.3rem' }}>{p.priceLabel}</p>
              <ul>
                {p.features.map((f) => <li key={f}><Check size={18} aria-hidden /> {f}</li>)}
              </ul>
              <button
                className={`btn block${current ? ' secondary' : ''}`}
                disabled={current}
                onClick={() => { changePlan(p.id); toast(`Plano alterado para ${p.name}`) }}
              >
                {current ? 'Seu plano atual' : p.id === 'basic' ? 'Voltar para o gratuito' : `Assinar ${p.name}`}
              </button>
            </section>
          )
        })}
      </div>
    </Sub>
  )
}

export function AparenciaPage() {
  return (
    <Sub title="Texto e tema">
      <AppearanceControls />
    </Sub>
  )
}

export function NotificacoesPage() {
  const db = useDb()
  const n = db.notifications
  return (
    <Sub title="Notificações">
      <div className="list">
        <label className="switch">
          <b>Remédios e consultas</b>
          <input type="checkbox" checked={n.medsAndAppointments} onChange={(e) => setNotifications({ medsAndAppointments: e.target.checked })} />
          <span className="track" aria-hidden />
        </label>
        <label className="switch" style={{ borderTop: '1px solid var(--line)' }}>
          <b>Eventos e ingressos</b>
          <input type="checkbox" checked={n.events} onChange={(e) => setNotifications({ events: e.target.checked })} />
          <span className="track" aria-hidden />
        </label>
      </div>
    </Sub>
  )
}

export function PrivacidadePage() {
  return (
    <Sub title="Privacidade">
      <div className="stack-lg">
        <p>Seus dados ficam salvos só neste aparelho. Nada é enviado para fora.</p>
        <Confirm
          className="btn danger"
          label="Restaurar dados de exemplo"
          message="Seus cadastros, sessões e ingressos serão apagados e os dados de exemplo voltam. Continuar?"
          onConfirm={() => { resetDb(); toast('Dados restaurados') }}
        />
      </div>
    </Sub>
  )
}
