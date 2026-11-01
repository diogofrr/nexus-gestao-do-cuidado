import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, ChevronRight, CalendarCheck, ListChecks, PackageX, TriangleAlert, Video } from 'lucide-react'
import { toggleDose } from '../data/actions'
import { useDb } from '../data/store'
import { useNow } from '../hooks/useNow'
import { KindIcon } from '../components/ui'
import { agendaForDay, dayKinds, type AgendaItem } from '../services/agenda'
import { addDays, friendlyDate, toDateStr } from '../services/dates'

const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

function greeting(h: number): string {
  if (h < 5) return 'Boa madrugada'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function Hoje() {
  const db = useDb()
  const now = useNow()
  const today = toDateStr(now)
  const [selected, setSelected] = useState(today)
  const [showPast, setShowPast] = useState(false)
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const markDose = (item: AgendaItem) => {
    setTouched((s) => new Set(s).add(item.id))
    toggleDose(item.dose!.key)
  }

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => toDateStr(addDays(new Date(`${today}T12:00:00`), i))), [today])
  const allItems = agendaForDay(db, selected, now)
  const todays = selected === today ? allItems : agendaForDay(db, today, now)
  const isToday = selected === today
  const live = isToday ? todays.filter((i) => i.state === 'agora') : []
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // O que já passou e foi feito fica recolhido, para o "agora" aparecer logo na primeira dobra.
  // Itens que a pessoa acabou de marcar continuam visíveis, para dar chance de desfazer.
  // O que está acontecendo agora aparece só no destaque, nunca duas vezes.
  const pastDone = isToday
    ? allItems.filter((i) => i.time <= nowTime && (i.state === 'feito' || i.state === 'cancelado') && !touched.has(i.id))
    : []
  const items = allItems.filter((i) => i.state !== 'agora' && (!isToday || showPast || !pastDone.includes(i)))
  // O fio "agora" fica antes dos itens que ainda vão acontecer.
  const nowIndex = isToday ? items.findIndex((i) => i.time > nowTime) : -1

  const firstName = db.user.name.split(' ')[0]
  const elder = db.user.elderName || 'Quem você cuida'
  const doses = todays.filter((i) => i.dose)
  const taken = doses.filter((i) => i.dose!.taken).length
  const status = doses.length > 0 ? `${elder} já tomou ${taken} de ${doses.length} ${doses.length === 1 ? 'dose' : 'doses'} hoje.` : ''

  const lowStock = db.medications.filter((m) => m.stock !== null && m.stock <= 5)
  const outOfStock = lowStock.some((m) => m.stock === 0)
  const pending = db.tasks.filter((t) => !t.done)

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
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{i.title}</div>
                    <div className="muted small">{i.meta}</div>
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
            <div className="days" role="group" aria-label="Próximos dias">
              {days.map((d) => {
                const date = new Date(`${d}T12:00:00`)
                const busy = dayKinds(db, d, now).length > 0
                return (
                  <button
                    key={d}
                    className={`day${d === today ? ' today' : ''}`}
                    aria-pressed={selected === d}
                    aria-label={`${friendlyDate(d, now)}${busy ? ', com compromissos' : ', livre'}`}
                    onClick={() => { setSelected(d); setShowPast(false) }}
                  >
                    <span className="dow">{DOW[date.getDay()]}</span>
                    <span className="dnum">{date.getDate()}</span>
                    <span className="dots" aria-hidden>{busy && <i className="has" />}</span>
                  </button>
                )
              })}
            </div>

            <div className="card" style={{ marginTop: '0.9rem', paddingBlock: '0.4rem' }}>
              <h2 style={{ padding: '0.7rem 0 0.2rem', fontSize: 'var(--fs-md)' }}>{friendlyDate(selected, now)}</h2>

              {items.length === 0 && pastDone.length === 0 && live.length === 0 ? (
                <div className="empty" style={{ padding: '1.5rem 0.5rem' }}>
                  <div className="glyph" aria-hidden><CalendarCheck size={26} strokeWidth={1.8} /></div>
                  <h3>Dia livre</h3>
                </div>
              ) : (
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
              )}
            </div>
          </section>
        </div>

        <div className="col">
          {lowStock.length > 0 && (
            <section className="o-3" aria-label="Estoque">
              <div className="list">
                <Link to="/medicacoes" className="item">
                  <span className={`kind ${outOfStock ? 'danger' : 'remedio'}`} aria-hidden>
                    {outOfStock ? <PackageX size={22} /> : <TriangleAlert size={22} />}
                  </span>
                  <div className="main">
                    <div className="title">{lowStock.length === 1 ? '1 remédio precisa de reposição' : `${lowStock.length} remédios precisam de reposição`}</div>
                    <div className="meta">{lowStock.map((m) => m.name).join(', ')}</div>
                  </div>
                  <ChevronRight size={20} aria-hidden />
                </Link>
              </div>
            </section>
          )}

          {pending.length > 0 && (
            <section className="o-3" aria-label="Tarefas">
              <div className="list">
                <Link to="/tarefas" className="item">
                  <span className="kind" aria-hidden><ListChecks size={22} /></span>
                  <div className="main">
                    <div className="title">{pending.length === 1 ? '1 tarefa pendente' : `${pending.length} tarefas pendentes`}</div>
                    <div className="meta">{pending[0].title}</div>
                  </div>
                  <ChevronRight size={20} aria-hidden />
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function TimelineRow({ item, index, onDose }: { item: AgendaItem; index: number; onDose: (item: AgendaItem) => void }) {
  const late = item.state === 'atrasado'
  return (
    <li className="tl-row" style={{ ['--i' as string]: index }}>
      <div className="tl-time">{item.time}</div>
      <div className={`tl-card${item.state === 'feito' || item.state === 'cancelado' ? ' done' : ''}`}>
        <KindIcon kind={item.kind} />
        <Link to={item.href} className="main" style={{ color: 'inherit', fontWeight: 400, textDecoration: 'none' }}>
          <div className="title">{item.title}</div>
          {item.meta && <div className="meta">{item.meta}</div>}
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
