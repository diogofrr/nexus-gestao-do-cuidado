import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { MapPin, TicketCheck, Video } from 'lucide-react'
import { cancelTicket } from '../data/actions'
import { useDb } from '../data/store'
import { useNow } from '../hooks/useNow'
import type { EventItem, Ticket } from '../domain/types'
import { Confirm, Empty, EventosTabs, PageHeader, toast } from '../components/ui'
import { friendlyDate, parseLocalIso } from '../services/dates'
import { isEventOver, isStreamOpen, myTickets } from '../services/tickets'

function Qr({ code }: { code: string }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let alive = true
    QRCode.toDataURL(code, { margin: 1, width: 240 }).then((url) => alive && setSrc(url)).catch(() => alive && setSrc(''))
    return () => { alive = false }
  }, [code])
  return src ? <img src={src} alt={`QR Code do ingresso ${code}`} /> : <div style={{ width: '7rem', height: '7rem' }} />
}

export default function MeusIngressos() {
  const db = useDb()
  const now = useNow()
  const [tab, setTab] = useState<'proximos' | 'encerrados'>('proximos')

  const mine = myTickets(db)
    .map((t) => ({ t, e: db.events.find((e) => e.id === t.eventId) }))
    .filter((x): x is { t: Ticket; e: EventItem } => !!x.e)
  const upcoming = mine.filter((x) => !isEventOver(x.e, now) && !x.t.cancelledAt)
  const history = mine.filter((x) => isEventOver(x.e, now) || x.t.cancelledAt)
  const list = (tab === 'proximos' ? upcoming : history).sort(
    (a, b) => parseLocalIso(a.e.startsAt).getTime() - parseLocalIso(b.e.startsAt).getTime(),
  )

  return (
    <div className="page">
      <PageHeader title="Eventos" />
      <EventosTabs />

      <div className="chips" role="group" aria-label="Filtrar ingressos" style={{ marginBottom: '1rem' }}>
        <button className="chip" aria-pressed={tab === 'proximos'} onClick={() => setTab('proximos')}>Próximos</button>
        <button className="chip" aria-pressed={tab === 'encerrados'} onClick={() => setTab('encerrados')}>Anteriores</button>
      </div>

      {list.length === 0 ? (
        <div className="card">
          <Empty icon={TicketCheck} title={tab === 'proximos' ? 'Você ainda não tem ingressos' : 'Nada por aqui'}>
            {tab === 'proximos' && <Link className="btn secondary sm" to="/eventos">Ver programação</Link>}
          </Empty>
        </div>
      ) : (
        <div className="stack">
          {list.map(({ t, e }) => {
            const type = e.ticketTypes.find((x) => x.id === t.ticketTypeId)
            const off = !!t.cancelledAt || isEventOver(e, now)
            const stream = !off && isStreamOpen(e, now)
            return (
              <article key={t.id} className={`ticket${off ? ' off' : ''}`}>
                <div className="info">
                  {(stream || t.cancelledAt || t.checkedInAt) && (
                    <div className="row" style={{ gap: '0.4rem' }}>
                      {stream && <span className="pill now"><span className="live-dot" aria-hidden /> Ao vivo</span>}
                      {t.cancelledAt && <span className="pill danger">Cancelado</span>}
                      {t.checkedInAt && <span className="pill now">Utilizado</span>}
                    </div>
                  )}
                  <h3>{e.title}</h3>
                  <p className="muted small">{friendlyDate(e.startsAt.slice(0, 10))}, {e.startsAt.slice(11, 16)} · {type?.name}</p>
                  <p className="small"><b>{t.holderName}</b></p>
                  <div className="row" style={{ marginTop: 4 }}>
                    {e.kind === 'online' && !off && (
                      stream
                        ? <a className="btn live sm" href={e.streamUrl} target="_blank" rel="noreferrer"><Video size={16} aria-hidden /> Entrar na transmissão</a>
                        : <span className="small muted">O link abre 15 minutos antes.</span>
                    )}
                    {e.kind === 'presencial' && !off && <span className="small muted row" style={{ gap: '0.3rem' }}><MapPin size={15} aria-hidden /> {e.location}</span>}
                    {!off && !t.checkedInAt && (
                      <Confirm
                        label="Cancelar ingresso"
                        message="Cancelar este ingresso? A vaga volta a ficar disponível."
                        className="btn ghost sm"
                        onConfirm={() => { const r = cancelTicket(t); toast(r.ok ? 'Ingresso cancelado' : r.error) }}
                      />
                    )}
                  </div>
                </div>
                {!off && <div className="qr"><Qr code={t.code} /><span className="code faint small">{t.code}</span></div>}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
