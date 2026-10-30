import type { PsychSession, Psychologist } from '../domain/types'
import { addDays, parseDateStr, parseDateTime, toDateStr } from './dates'

/** Antecedência mínima, em minutos, para reservar uma sessão. */
export const MIN_LEAD_MINUTES = 60
/** Janela de agendamento, em dias. */
export const BOOKING_WINDOW_DAYS = 60

export function getFreeSlots(
  psych: Psychologist,
  date: string,
  sessions: PsychSession[],
  now: Date = new Date(),
): string[] {
  if (psych.blockedDates.includes(date)) return []
  const weekday = parseDateStr(date).getDay()
  const base = psych.weekly[weekday] ?? []
  const taken = new Set(
    sessions
      .filter((s) => s.psychologistId === psych.id && s.date === date && s.status !== 'cancelada')
      .map((s) => s.time),
  )
  const limit = now.getTime() + MIN_LEAD_MINUTES * 60_000
  return [...base]
    .sort()
    .filter((t) => !taken.has(t) && parseDateTime(date, t).getTime() >= limit)
}

export function isDateBookable(
  psych: Psychologist,
  date: string,
  sessions: PsychSession[],
  now: Date = new Date(),
): boolean {
  return getFreeSlots(psych, date, sessions, now).length > 0
}

export function nextAvailableDate(
  psych: Psychologist,
  sessions: PsychSession[],
  now: Date = new Date(),
): string | null {
  for (let i = 0; i <= BOOKING_WINDOW_DAYS; i++) {
    const d = toDateStr(addDays(now, i))
    if (isDateBookable(psych, d, sessions, now)) return d
  }
  return null
}
