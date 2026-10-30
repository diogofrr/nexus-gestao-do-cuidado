import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, ChevronLeft, ChevronRight, CalendarCheck, PackageX, TriangleAlert, Video } from 'lucide-react'
import { toggleDose, toggleTask } from '../data/actions'
import { useDb } from '../data/store'
import { useNow } from '../hooks/useNow'
import { KindIcon } from '../components/ui'
import { agendaForDay, dayKinds, type AgendaItem } from '../services/agenda'
import { addDays, friendlyDate, toDateStr } from '../services/dates'

const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function greeting(h: number): string {
  if (h < 5) return 'Boa madrugada'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

const KIND_LABEL = { consulta: 'consulta', sessao: 'sessão', evento: 'evento' } as const

export default function Hoje() {
  const db = useDb()
  const now = useNow()
  const today = toDateStr(now)
  const [selected, setSelected] = useState(today)
  const [start, setStart] = useState(today)
  const [showPast, setShowPast] = useState(false)
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const markDose = (item: AgendaItem) => {
    setTouched((s) => new Set(s).add(item.id))
    toggleDose(item.dose!.key)
  }

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => toDateStr(addDays(new Date(`${start}T12:00:00`), i))), [start])
  const allItems = agendaForDay(db, selected, now)
  const todays = selected === today ? allItems : agendaForDay(db, today, now)
  const live = todays.filter((i) => i.state === 'agora')
  const isToday = selected === today
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // Hoje: o que já passou e foi feito fica recolhido, para o "agora" aparecer logo na primeira dobra.
  // Itens que a pessoa acabou de marcar continuam visíveis, para dar chance de desfazer.
  const pastDone = isToday
    ? allItems.filter((i) => i.time <= nowTime && (i.state === 'feito' || i.state === 'cancelado') && !touched.has(i.id))
    : []
  const items = isToday && !showPast ? allItems.filter((i) => !pastDone.includes(i)) : allItems
  // O fio "agora" fica antes dos itens que estão acontecendo e dos que ainda vão acontecer.
  const nowIndex = isToday ? items.findIndex((i) => i.time > nowTime || i.state === 'agora') : -1

  const firstName = db.user.name.split(' ')[0]
  const elder = db.user.elderName || 'Quem você cuida'
  const doses = todays.filter((i) => i.dose)
  const taken = doses.filter((i) => i.dose!.taken).length
  const nextUp = todays.find((i) => i.time > nowTime && i.state === 'proximo')
  const status = [
    doses.length > 0 ? `${elder} já tomou ${taken} de ${doses.length} ${doses.length === 1 ? 'dose' : 'doses'} hoje.` : null,
    nextUp ? `Próximo: ${nextUp.title} às ${nextUp.time}.` : null,
  ].filter(Boolean).join(' ')

  const stockAlerts = db.medications.filter((m) => m.stock !== null && m.stock <= 5)
  const pending = db.tasks.filter((t) => !t.done).slice(0, 4)
  const rangeLabel = (() => {
    const a = new Date(`${days[0]}T12:00:00`)
    const b = new Date(`${days[6]}T12:00:00`)
    const m = (d: Date) => MONTHS_SHORT[d.getMonth()]
    return a.getMonth() === b.getMonth() ? `${a.getDate()} a ${b.getDate()} de ${m(b)}` : `${a.getDate()} ${m(a)} a ${b.getDate()} ${m(b)}`
  })()
  const shift = (n: number) => setStart(toDateStr(addDays(new Date(`${start}T12:00:00`), n)))

  const nowLine = (
    <li className="now-line" aria-label={`Agora, ${nowTime}`}>
      <span className="t">{nowTime}</span>
      <span className="lead" aria-hidden>
        <b>agora</b>
        <span className="rule" />
      </span>
    </li>
  )

  return (
    <div className="page wide">
      <header className="page-head" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1>{greeting(now.getHours())}, {firstName}</h1>
          {status && <p className="sub">{status}</p>}
          <p className="faint small" style={{ marginTop: '0.25rem' }}>
            Você também precisa de atenção. <Link to="/plantao">Reserve um momento para si hoje.</Link>
          </p>
        </div>
      </header>

      <div className="cols two">
        <div className="col">
          {live.length > 0 && (
            <section className="hero-live o-0" aria-labelledby="agora-h">
              <div className="row" style={{ gap: '0.5rem' }}>
                <span className="live-dot" aria-hidden />
                <h2 id="agora-h" style={{ color: 'var(--now)', fontSize: '1.05rem' }}>Acontecendo agora</h2>
              </div>
              {live.map((i) => (
                <div key={i.id} className="live-item">
                  <KindIcon kind={i.kind} now />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{i.title}</div>
                    <div className="muted small">{i.meta} · desde {i.time}</div>
                  </div>
                  {i.join && (
                    <a className="btn live" href={i.join.url} target="_blank" rel="noreferrer" aria-label={`${i.join.label}: ${i.title}`}>
                      <Video size={18} aria-hidden /> Entrar
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}

          <section className="o-2" aria-label="Agenda">
            <div className="row between" style={{ marginBottom: '0.5rem' }}>
              <h2>{rangeLabel}</h2>
              <div className="row" style={{ gap: '0.25rem' }}>
                {selected !== today && (
                  <button className="btn secondary sm" onClick={() => { setStart(today); setSelected(today) }}>Hoje</button>
                )}
                <button className="icon-btn bordered" onClick={() => shift(-7)} aria-label="Semana anterior"><ChevronLeft size={20} /></button>
                <button className="icon-btn bordered" onClick={() => shift(7)} aria-label="Próxima semana"><ChevronRight size={20} /></button>
              </div>
            </div>

            <div className="days" role="group" aria-label="Dias da semana">
              {days.map((d) => {
                const date = new Date(`${d}T12:00:00`)
                const kinds = dayKinds(db, d, now)
                return (
                  <button
                    key={d}
                    className={`day${d === today ? ' today' : ''}`}
                    aria-pressed={selected === d}
                    aria-label={`${friendlyDate(d, now)}${kinds.length ? `: ${kinds.map((k) => KIND_LABEL[k as keyof typeof KIND_LABEL]).join(', ')}` : ''}`}
                    onClick={() => { setSelected(d); setShowPast(false) }}
                  >
                    <span className="dow">{DOW[date.getDay()]}</span>
                    <span className="dnum">{date.getDate()}</span>
                    <span className="dots" aria-hidden>{kinds.map((k) => <i key={k} className={k} />)}</span>
                  </button>
                )
              })}
            </div>
            <div className="legend" aria-hidden>
              <span><i className="consulta" /> Consulta</span>
              <span><i className="sessao" /> Sessão</span>
              <span><i className="evento" /> Evento</span>
            </div>

            <div className="card" style={{ marginTop: '0.9rem', paddingBlock: '0.4rem' }}>
              <div className="row between" style={{ padding: '0.7rem 0 0.2rem' }}>
                <h3>{friendlyDate(selected, now)}</h3>
                <span className="faint small">{allItems.length === 0 ? 'Livre' : `${allItems.length} ${allItems.length === 1 ? 'item' : 'itens'}`}</span>
              </div>

              {allItems.length === 0 ? (
                <div className="empty" style={{ padding: '1.75rem 0.5rem' }}>
                  <div className="glyph" aria-hidden><CalendarCheck size={26} strokeWidth={1.8} /></div>
                  <h3>Dia livre</h3>
                  <p>Nada marcado para {isToday ? 'hoje' : 'este dia'}. Que tal agendar uma conversa com um psicólogo?</p>
                  <Link className="btn secondary sm" to="/psicologos">Ver psicólogos</Link>
                </div>
              ) : (
                <>
                  <ol className="timeline" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {pastDone.length > 0 && !showPast && (
                      <li>
                        <button className="past-toggle" onClick={() => setShowPast(true)} aria-expanded={false}>
                          <span className="t small">{pastDone.length}</span>
                          <span className="row" style={{ gap: '0.3rem' }}>{pastDone.length === 1 ? 'item concluído' : 'itens concluídos'} <ChevronDown size={18} aria-hidden /></span>
                        </button>
                      </li>
                    )}
                    {items.map((i, idx) => (
                      <Fragment key={i.id}>
                        {isToday && nowIndex === idx && nowLine}
                        <TimelineRow item={i} index={idx} onDose={markDose} />
                      </Fragment>
                    ))}
                    {isToday && nowIndex === -1 && nowLine}
                  </ol>
                  <div className="row" style={{ padding: '0.6rem 0 0.8rem', borderTop: '1px solid var(--line)', gap: '1rem' }}>
                    <Link to="/psicologos" className="small">Agendar sessão com psicólogo</Link>
                    <Link to="/eventos" className="small">Ver eventos</Link>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="col">
          {stockAlerts.length > 0 && (
            <section className="stack o-1" aria-labelledby="atencao-h">
              <h2 id="atencao-h">Atenção</h2>
              <div className="list">
                {stockAlerts.map((m) => (
                  <Link key={m.id} to={`/medicacoes/${m.id}`} className="item">
                    <span className={`kind ${m.stock === 0 ? 'danger' : 'remedio'}`} aria-hidden>
                      {m.stock === 0 ? <PackageX size={22} /> : <TriangleAlert size={22} />}
                    </span>
                    <div className="main">
                      <div className="title">{m.name}</div>
                      <div className="meta" style={m.stock === 0 ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>
                        {m.stock === 0 ? 'O estoque acabou. Comprar hoje.' : `Restam ${m.stock} unidades.`}
                      </div>
                    </div>
                    <ChevronRight size={20} aria-hidden />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="stack o-3" aria-labelledby="pend-h">
            <div className="row between">
              <h2 id="pend-h">Pendências</h2>
              <Link to="/tarefas" className="small">Ver todas</Link>
            </div>
            {pending.length === 0 ? (
              <p className="muted">Tudo em dia por aqui.</p>
            ) : (
              <div className="list">
                {pending.map((t) => (
                  <div key={t.id} className="item">
                    <button className="dose-check" onClick={() => toggleTask(t.id)} aria-label={`Concluir: ${t.title}`} aria-pressed={t.done}>
                      <Check size={18} strokeWidth={3} />
                    </button>
                    <div className="main">
                      <div className="title">{t.title}</div>
                      {t.category && <div className="meta">{t.category}</div>}
                    </div>
                    {t.priority === 'alta' && <span className="pill danger">Alta</span>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function TimelineRow({ item, index, onDose }: { item: AgendaItem; index: number; onDose: (item: AgendaItem) => void }) {
  const live = item.state === 'agora'
  const late = item.state === 'atrasado'
  return (
    <li className={`tl-row${live ? ' now-row' : ''}`} style={{ ['--i' as string]: index }}>
      <div className="tl-time">{item.time}</div>
      <div className={`tl-card${item.state === 'feito' || item.state === 'cancelado' ? ' done' : ''}`}>
        <KindIcon kind={item.kind} now={live} />
        <Link to={item.href} className="main" style={{ color: 'inherit', fontWeight: 400, textDecoration: 'none' }}>
          <div className="title">{item.title}</div>
          <div className="meta">{item.meta}</div>
          {(late || item.state === 'cancelado') && (
            <div style={{ marginTop: 4 }}>
              {late ? <span className="pill amber">Atrasado</span> : <span className="pill">Cancelada</span>}
            </div>
          )}
        </Link>
        {item.dose &&
          (item.dose.taken ? (
            <button
              className="dose-check on"
              onClick={() => onDose(item)}
              aria-pressed
              aria-label={`Desmarcar: ${item.title} às ${item.time}`}
            >
              <Check size={18} strokeWidth={3} />
            </button>
          ) : (
            <button
              className="btn secondary sm"
              onClick={() => onDose(item)}
              aria-label={`Marcar como dado: ${item.title} às ${item.time}`}
            >
              Dei
            </button>
          ))}
      </div>
    </li>
  )
}
