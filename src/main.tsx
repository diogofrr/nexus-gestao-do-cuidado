import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import '@fontsource-variable/figtree'
import '@fontsource/playfair-display/latin-700.css'
import Layout from './components/Layout'
import Hoje from './pages/Hoje'
import Consultas from './pages/Consultas'
import ConsultaForm from './pages/ConsultaForm'
import SessaoDetalhe from './pages/SessaoDetalhe'
import Medicacoes from './pages/Medicacoes'
import MedicacaoForm from './pages/MedicacaoForm'
import Profissionais from './pages/Profissionais'
import ProfissionalForm from './pages/ProfissionalForm'
import Tarefas from './pages/Tarefas'
import Chat from './pages/Chat'
import Plantao from './pages/Plantao'
import Configuracoes, { AparenciaPage, NotificacoesPage, PerfilPage, PlanoPage, PrivacidadePage } from './pages/Configuracoes'
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
          <Route index element={<Navigate to="/hoje" replace />} />
          <Route path="hoje" element={<Hoje />} />
          <Route path="dashboard" element={<Navigate to="/hoje" replace />} />

          <Route path="consultas" element={<Consultas />} />
          <Route path="consultas/:id" element={<ConsultaForm />} />
          <Route path="sessoes/:id" element={<SessaoDetalhe />} />
          <Route path="medicacoes" element={<Medicacoes />} />
          <Route path="medicacoes/:id" element={<MedicacaoForm />} />
          <Route path="tarefas" element={<Tarefas />} />
          <Route path="profissionais" element={<Profissionais />} />
          <Route path="profissionais/:id" element={<ProfissionalForm />} />

          <Route path="psicologos" element={<Psicologos />} />
          <Route path="psicologos/:id" element={<PsicologoDetalhe />} />
          <Route path="chat" element={<Chat />} />
          <Route path="plantao" element={<Plantao />} />

          <Route path="eventos" element={<Eventos />} />
          <Route path="eventos/:id" element={<EventoDetalhe />} />
          <Route path="eventos/:id/comprar" element={<ComprarIngresso />} />
          <Route path="meus-ingressos" element={<MeusIngressos />} />
          <Route path="checkin" element={<CheckIn />} />
          <Route path="confirmacao/sessao/:id" element={<SessaoConfirmada />} />
          <Route path="confirmacao/pedido/:id" element={<PedidoConfirmado />} />

          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="configuracoes/perfil" element={<PerfilPage />} />
          <Route path="configuracoes/plano" element={<PlanoPage />} />
          <Route path="configuracoes/aparencia" element={<AparenciaPage />} />
          <Route path="configuracoes/notificacoes" element={<NotificacoesPage />} />
          <Route path="configuracoes/privacidade" element={<PrivacidadePage />} />

          <Route path="*" element={<Navigate to="/hoje" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
