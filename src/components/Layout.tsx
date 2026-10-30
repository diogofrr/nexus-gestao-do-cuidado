import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardList,
  LifeBuoy,
  MessageCircle,
  Pill,
  ListChecks,
  Stethoscope,
  QrCode,
  Ticket,
  Users,
  UserRound,
  Brain,
  Leaf,
  CaseSensitive,
  type LucideIcon,
} from 'lucide-react'
import { useDb } from '../data/store'
import AppearanceSheet from './Appearance'
import { Avatar, ToastHost } from './ui'

interface Group {
  key: string
  label: string
  to: string
  icon: LucideIcon
  match: string[]
  links: { to: string; label: string; icon: LucideIcon }[]
}

const GROUPS: Group[] = [
  { key: 'hoje', label: 'Hoje', to: '/hoje', icon: CalendarDays, match: ['/hoje'], links: [] },
  {
    key: 'cuidado', label: 'Cuidado', to: '/consultas', icon: ClipboardList,
    match: ['/consultas', '/medicacoes', '/tarefas', '/profissionais', '/sessoes'],
    links: [
      { to: '/consultas', label: 'Consultas', icon: Stethoscope },
      { to: '/medicacoes', label: 'Remédios', icon: Pill },
      { to: '/tarefas', label: 'Tarefas', icon: ListChecks },
      { to: '/profissionais', label: 'Rede de apoio', icon: Users },
    ],
  },
  {
    key: 'apoio', label: 'Apoio', to: '/psicologos', icon: LifeBuoy,
    match: ['/psicologos', '/chat', '/plantao'],
    links: [
      { to: '/psicologos', label: 'Psicólogos', icon: Brain },
      { to: '/chat', label: 'Conversar com o Nexus', icon: MessageCircle },
      { to: '/plantao', label: 'Autocuidado', icon: Leaf },
    ],
  },
  {
    key: 'eventos', label: 'Eventos', to: '/eventos', icon: Ticket,
    match: ['/eventos', '/meus-ingressos', '/checkin', '/confirmacao/pedido'],
    links: [
      { to: '/eventos', label: 'Programação', icon: Ticket },
      { to: '/meus-ingressos', label: 'Meus ingressos', icon: QrCode },
    ],
  },
]

const inGroup = (g: Group, path: string) => g.match.some((m) => path === m || path.startsWith(`${m}/`))

export default function Layout() {
  const { pathname } = useLocation()
  const db = useDb()
  const [appearance, setAppearance] = useState(false)
  const perfilActive = pathname.startsWith('/configuracoes')

  // Cada tela abre no topo, como se fosse uma página nova.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="app">
      <aside className="rail" aria-label="Navegação principal">
        <Link to="/hoje" className="wordmark">NEXUS</Link>
        {GROUPS.map((g) => (
          <div key={g.key}>
            {g.links.length === 0 ? (
              <NavLink to={g.to} className={({ isActive }) => `nav${isActive ? ' active' : ''}`}>
                <g.icon size={20} aria-hidden /> {g.label}
              </NavLink>
            ) : (
              <>
                <div className="rail-group">{g.label}</div>
                {g.links.map((l) => (
                  <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav${isActive ? ' active' : ''}`}>
                    <l.icon size={20} aria-hidden /> {l.label}
                  </NavLink>
                ))}
              </>
            )}
          </div>
        ))}
        <div className="spacer" />
        <button className="nav" onClick={() => setAppearance(true)} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', width: '100%', textAlign: 'left' }}>
          <CaseSensitive size={20} aria-hidden /> Texto e tema
        </button>
        <Link to="/configuracoes" className="rail-user">
          <Avatar name={db.user.name} size="sm" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 650 }}>{db.user.name}</div>
            <div className="faint small">Configurações</div>
          </div>
        </Link>
      </aside>

      <div>
        <header className="topbar">
          <Link to="/hoje" className="wordmark">NEXUS</Link>
          <div className="topbar-actions">
            <button className="btn ghost sm" onClick={() => setAppearance(true)} aria-label="Tamanho do texto e tema">
              <CaseSensitive size={20} aria-hidden /> Texto
            </button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>

      <nav className="tabbar" aria-label="Navegação principal">
        {GROUPS.map((g) => (
          <NavLink key={g.key} to={g.to} className={inGroup(g, pathname) ? 'active' : ''} aria-current={inGroup(g, pathname) ? 'page' : undefined}>
            <g.icon size={24} strokeWidth={inGroup(g, pathname) ? 2.2 : 1.8} aria-hidden />
            {g.label}
          </NavLink>
        ))}
        <NavLink to="/configuracoes" className={perfilActive ? 'active' : ''}>
          <UserRound size={24} strokeWidth={perfilActive ? 2.2 : 1.8} aria-hidden />
          Perfil
        </NavLink>
      </nav>

      {appearance && <AppearanceSheet onClose={() => setAppearance(false)} />}
      <ToastHost />
    </div>
  )
}
