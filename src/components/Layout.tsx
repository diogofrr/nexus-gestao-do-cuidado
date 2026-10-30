import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Modal, ToastHost } from './ui'

const MAIN = [
  { to: '/dashboard', label: 'Início', icon: '🏠' },
  { to: '/consultas', label: 'Consultas', icon: '🩺' },
  { to: '/medicacoes', label: 'Medicações', icon: '💊' },
  { to: '/tarefas', label: 'Tarefas', icon: '✅' },
  { to: '/eventos', label: 'Eventos', icon: '🎟️' },
]

const MORE = [
  { to: '/profissionais', label: 'Profissionais', icon: '👥' },
  { to: '/psicologos', label: 'Psicólogos', icon: '🧠' },
  { to: '/meus-ingressos', label: 'Meus ingressos', icon: '📱' },
  { to: '/chat', label: 'Chat Nexus', icon: '💬' },
  { to: '/plantao', label: 'Apoio Psicológico', icon: '💙' },
  { to: '/configuracoes', label: 'Configurações', icon: '⚙️' },
]

const linkClass = ({ isActive }: { isActive: boolean }) => `side-link${isActive ? ' active' : ''}`

export default function Layout() {
  const [more, setMore] = useState(false)
  const { pathname } = useLocation()
  const moreActive = MORE.some((m) => pathname.startsWith(m.to))

  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Principal">
        <div className="brand">NEXUS</div>
        {[...MAIN, ...MORE].map((i) => (
          <NavLink key={i.to} to={i.to} className={linkClass}>
            <span aria-hidden>{i.icon}</span> {i.label}
          </NavLink>
        ))}
      </nav>

      <main className="main">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Principal">
        {MAIN.map((i) => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ico" aria-hidden>{i.icon}</span>
            {i.label}
          </NavLink>
        ))}
        <button onClick={() => setMore(true)} className={moreActive ? 'active' : ''} style={moreActive ? { color: 'var(--primary)' } : undefined}>
          <span className="ico" aria-hidden>☰</span>
          Mais
        </button>
      </nav>

      {more && (
        <Modal title="Mais" onClose={() => setMore(false)}>
          <div className="stack" onClick={() => setMore(false)}>
            {MORE.map((i) => (
              <NavLink key={i.to} to={i.to} className={linkClass}>
                <span aria-hidden>{i.icon}</span> {i.label}
              </NavLink>
            ))}
          </div>
        </Modal>
      )}
      <ToastHost />
    </div>
  )
}
