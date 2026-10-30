import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Consultas from './pages/Consultas'
import Medicacoes from './pages/Medicacoes'
import Profissionais from './pages/Profissionais'
import Tarefas from './pages/Tarefas'
import Chat from './pages/Chat'
import Plantao from './pages/Plantao'
import Configuracoes from './pages/Configuracoes'
import Psicologos from './pages/Psicologos'
import PsicologoDetalhe from './pages/PsicologoDetalhe'
import Eventos from './pages/Eventos'
import EventoDetalhe from './pages/EventoDetalhe'
import ComprarIngresso from './pages/ComprarIngresso'
import MeusIngressos from './pages/MeusIngressos'
import CheckIn from './pages/CheckIn'
import { PedidoConfirmado, SessaoConfirmada } from './pages/Confirmacao'
import { applyPrefs } from './data/prefs'
import './styles.css'

applyPrefs()

// HashRouter: o app é estático e funciona em qualquer hospedagem sem regra de rewrite.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="consultas" element={<Consultas />} />
          <Route path="medicacoes" element={<Medicacoes />} />
          <Route path="profissionais" element={<Profissionais />} />
          <Route path="tarefas" element={<Tarefas />} />
          <Route path="chat" element={<Chat />} />
          <Route path="plantao" element={<Plantao />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="psicologos" element={<Psicologos />} />
          <Route path="psicologos/:id" element={<PsicologoDetalhe />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="eventos/:id" element={<EventoDetalhe />} />
          <Route path="eventos/:id/comprar" element={<ComprarIngresso />} />
          <Route path="meus-ingressos" element={<MeusIngressos />} />
          <Route path="checkin" element={<CheckIn />} />
          <Route path="confirmacao/sessao/:id" element={<SessaoConfirmada />} />
          <Route path="confirmacao/pedido/:id" element={<PedidoConfirmado />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
