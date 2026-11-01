import type { Db } from '../domain/types'
import { parseDateTime, parseLocalIso, toDateStr } from './dates'
import { isSessionOpen, isSessionOver, meetingUrl } from './sessions'
import { eventEnd, isStreamOpen, myTickets } from './tickets'

export type AgendaKind = 'consulta' | 'sessao' | 'remedio' | 'evento'
export type AgendaState = 'agora' | 'proximo' | 'feito' | 'atrasado' | 'cancelado'

export interface AgendaItem {
  id: string
  kind: AgendaKind
  /** HH:mm */
  time: string
  title: string
  meta: string
  state: AgendaState
  href: string
  /** Presente nos itens de remédio: chave no registro de doses. */
  dose?: { key: string; taken: boolean }
  /** Ação principal quando o item está acontecendo agora. */
  join?: { label: string; url: string }
}

const TIME_RE = /\b([01]?\d|2[0-3]):([0-5]\d)\b/g
const pad = (n: number) => String(n).padStart(2, '0')

/** Extrai os horários de uma string como "08:00, 20:00". */
export function parseDoseTimes(schedule: string): string[] {
  const out: string[] = []
  for (const m of schedule.matchAll(TIME_RE)) out.push(`${pad(Number(m[1]))}:${m[2]}`)
  return [...new Set(out)].sort()
}

export function doseKey(medicationId: string, date: string, time: string): string {
  return `${medicationId}|${date}|${time}`
}

export function agendaForDay(db: Db, date: string, now: Date = new Date()): AgendaItem[] {
  const items: AgendaItem[] = []
  const today = toDateStr(now)

  for (const a of db.appointments.filter((x) => x.date === date)) {
    items.push({
      id: `ap-${a.id}`,
      kind: 'consulta',
      time: a.time,
      title: a.title,
      meta: [a.doctor, a.specialty].filter(Boolean).join(' · '),
      state: a.status === 'cancelada' ? 'cancelado' : a.status === 'realizada' ? 'feito' : 'proximo',
      href: `/consultas/${a.id}`,
    })
  }

  for (const s of db.sessions.filter((x) => !x.external && x.date === date)) {
    const psych = db.psychologists.find((p) => p.id === s.psychologistId)
    const open = isSessionOpen(s, now)
    items.push({
      id: `ss-${s.id}`,
      kind: 'sessao',
      time: s.time,
      title: `Sessão com ${psych?.name ?? 'psicólogo'}`,
      meta: s.modality === 'online' ? 'Psicologia · online' : 'Psicologia · presencial',
      state: s.status === 'cancelada' ? 'cancelado' : open ? 'agora' : s.status === 'realizada' || isSessionOver(s, now) ? 'feito' : 'proximo',
      href: `/sessoes/${s.id}`,
      join: open ? { label: 'Entrar na sessão', url: meetingUrl(s) } : undefined,
    })
  }

  for (const m of db.medications) {
    for (const time of parseDoseTimes(m.schedule)) {
      const key = doseKey(m.id, date, time)
      const taken = !!db.doseLog[key]
      const late = !taken && date === today && parseDateTime(date, time) < now
      items.push({
        id: `md-${key}`,
        kind: 'remedio',
        time,
        title: `${m.name} ${m.dosage}`,
        meta: '',
        state: taken ? 'feito' : late ? 'atrasado' : 'proximo',
        href: `/medicacoes/${m.id}`,
        dose: { key, taken },
      })
    }
  }

  const seen = new Set<string>()
  for (const t of myTickets(db).filter((x) => !x.cancelledAt)) {
    const e = db.events.find((x) => x.id === t.eventId)
    if (!e || e.startsAt.slice(0, 10) !== date || seen.has(e.id)) continue
    seen.add(e.id)
    const live = isStreamOpen(e, now) || (e.kind === 'presencial' && now >= parseLocalIso(e.startsAt) && now < eventEnd(e))
    items.push({
      id: `ev-${e.id}`,
      kind: 'evento',
      time: e.startsAt.slice(11, 16),
      title: e.title,
      meta: e.kind === 'online' ? 'Evento online' : e.location.split(',')[0],
      state: live ? 'agora' : eventEnd(e) < now ? 'feito' : 'proximo',
      href: '/meus-ingressos',
      join: live && e.kind === 'online' ? { label: 'Entrar na transmissão', url: e.streamUrl } : undefined,
    })
  }

  return items.sort((a, b) => a.time.localeCompare(b.time) || a.kind.localeCompare(b.kind))
}

/**
 * Tipos de item que existem no dia, para os pontinhos da faixa da semana.
 * Remédio fica de fora: acontece todo dia e não ajuda a distinguir um dia do outro.
 */
export function dayKinds(db: Db, date: string, now: Date = new Date()): Exclude<AgendaKind, 'remedio'>[] {
  const kinds = new Set(agendaForDay(db, date, now).filter((i) => i.state !== 'cancelado').map((i) => i.kind))
  return (['consulta', 'sessao', 'evento'] as const).filter((k) => kinds.has(k))
}
