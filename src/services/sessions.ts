import type { PsychSession } from '../domain/types'
import { parseDateTime } from './dates'

export const SESSION_MINUTES = 50
/** Quantos minutos antes do início o link da sessão online é liberado. */
export const JOIN_OPENS_MINUTES = 10
/** Antecedência mínima, em horas, para cancelar. */
export const CANCEL_LIMIT_HOURS = 2

export const sessionStart = (s: Pick<PsychSession, 'date' | 'time'>) => parseDateTime(s.date, s.time)
export const sessionEnd = (s: Pick<PsychSession, 'date' | 'time'>) =>
  new Date(sessionStart(s).getTime() + SESSION_MINUTES * 60_000)

export function isSessionOpen(s: PsychSession, now: Date = new Date()): boolean {
  if (s.status !== 'agendada' || s.modality !== 'online') return false
  return now.getTime() >= sessionStart(s).getTime() - JOIN_OPENS_MINUTES * 60_000 && now < sessionEnd(s)
}

export function isSessionOver(s: PsychSession, now: Date = new Date()): boolean {
  return sessionEnd(s) <= now
}

export function canCancelSession(s: PsychSession, now: Date = new Date()): boolean {
  return s.status === 'agendada' && sessionStart(s).getTime() - now.getTime() >= CANCEL_LIMIT_HOURS * 3_600_000
}

export function meetingUrl(s: Pick<PsychSession, 'id'>): string {
  return `https://meet.example.com/nexus-sessao-${s.id.slice(0, 8)}`
}
