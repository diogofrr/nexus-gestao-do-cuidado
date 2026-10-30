import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { cancelTicket } from '../data/actions'
import { useDb } from '../data/store'
import type { EventItem, Ticket } from '../domain/types'
import { Confirm, Empty, toast } from '../components/ui'
import { formatDateLong, parseLocalIso } from '../services/dates'
import { isEventOver, isStreamOpen, myTickets } from '../services/tickets'

function Qr({ code }: { code: string }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let alive = true
    QRCode.toDataURL(code, { margin: 1, width: 224 }).then((url) => alive && setSrc(url)).catch(() => alive && setSrc(''))
    return () => { alive = false }
  }, [code])
  return src ? <img src={src} alt={`QR Code do ingresso ${code}`} /> : <div style={{ width: 112, height: 112 }} />
}

export default function MeusIngressos() {
  const db = useDb()
  const [tab, setTab] = useState<'proximos' | 'encerrados'>('proximos')
  const now = new Date()

  const mine = myTickets(db)
    .map((t) => ({ t, e: db.events.find((e) => e.id === t.eventId) }))
    .filter((x): x is { t: Ticket; e: EventItem } => !!x.e)
  const upcoming = mine.filter((x) => !isEventOver(x.e, now) && !x.t.cancelledAt)
  const history = mine.filter((x) => isEventOver(x.e, now) || x.t.cancelledAt)
  const list = (tab === 'proximos' ? upcoming : history).sort(
    (a, b) => parseLocalIso(a.e.startsAt).getTime() - parseLocalIso(b.e.startsAt).getTime(),
  )

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Meus ingressos</h1>
          <p>Apresente o QR Code na entrada ou acesse a transmissão</p>
        </div>
        <Link to="/eventos" className="btn secondary">Ver eventos</Link>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'proximos'} onClick={() => setTab('proximos')}>Próximos ({upcoming.length})</button>
        <button role="tab" aria-selected={tab === 'encerrados'} onClick={() => setTab('encerrados')}>Encerrados e cancelados ({history.length})</button>
      </div>

      {list.length === 0 ? (
        <Empty icon="📱" title={tab === 'proximos' ? 'Você ainda não tem ingressos' : 'Nada por aqui'}>
          {tab === 'proximos' && <Link to="/eventos">Ver palestras e eventos</Link>}
        </Empty>
      ) : (
        list.map(({ t, e }) => {
          const type = e.ticketTypes.find((x) => x.id === t.ticketTypeId)
          const off = !!t.cancelledAt || isEventOver(e, now)
          const stream = !off && isStreamOpen(e, now)
          return (
            <div key={t.id} className={`card ticket${off ? ' off' : ''}`}>
              <div className="stack">
                <div className="row">
                  <span className={`badge ${e.kind === 'online' ? '' : 'success'}`}>{e.kind === 'online' ? 'Online' : 'Presencial'}</span>
                  {t.cancelledAt && <span className="badge danger">Cancelado</span>}
                  {t.checkedInAt && <span className="badge success">Utilizado</span>}
                </div>
                <h3>{e.title}</h3>
                <p className="small muted">
                  {formatDateLong(e.startsAt.slice(0, 10))}, {e.startsAt.slice(11, 16)} · {type?.name}
                </p>
                <p className="small">Participante: <b>{t.holderName}</b></p>
                <p className="small code">{t.code}</p>
                <div className="row">
                  {e.kind === 'online' && !off && (
                    stream ? (
                      <a className="btn sm" href={e.streamUrl} target="_blank" rel="noreferrer">Entrar na transmissão</a>
                    ) : (
                      <span className="small muted">O link abre 15 minutos antes do início.</span>
                    )
                  )}
                  {e.kind === 'presencial' && !off && <span className="small muted">📍 {e.location}</span>}
                  {!off && !t.checkedInAt && (
                    <Confirm
                      label="Cancelar ingresso"
                      message="Cancelar este ingresso? A vaga volta a ficar disponível. O estorno é simulado nesta demonstração."
                      onConfirm={() => {
                        const r = cancelTicket(t)
                        toast(r.ok ? 'Ingresso cancelado' : r.error)
                      }}
                    />
                  )}
                </div>
              </div>
              {!off && <Qr code={t.code} />}
            </div>
          )
        })
      )}
    </div>
  )
}
