const pad = (n: number) => String(n).padStart(2, '0')

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Interpreta YYYY-MM-DD como data local (evita o deslocamento de fuso do `new Date(str)`). */
export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function parseDateTime(date: string, time: string): Date {
  const [h, min] = time.split(':').map(Number)
  const d = parseDateStr(date)
  d.setHours(h, min, 0, 0)
  return d
}

export function parseLocalIso(iso: string): Date {
  const [date, time = '00:00'] = iso.split('T')
  return parseDateTime(date, time)
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MONTHS_LONG = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

export function formatDateShort(date: string): string {
  const d = parseDateStr(date)
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateLong(date: string): string {
  const d = parseDateStr(date)
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]}`
}

/** "Hoje", "Amanhã" ou o dia por extenso. */
export function relativeDay(date: string, now: Date = new Date()): string {
  const today = toDateStr(now)
  if (date === today) return 'Hoje'
  if (date === toDateStr(addDays(now, 1))) return 'Amanhã'
  return formatDateLong(date)
}

/** "Hoje, 30 de outubro", "Amanhã, 31 de outubro" ou "sexta, 23 de outubro". */
export function friendlyDate(date: string, now: Date = new Date()): string {
  const rel = relativeDay(date, now)
  if (rel === 'Hoje' || rel === 'Amanhã') {
    const d = parseDateStr(date)
    return `${rel}, ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]}`
  }
  return rel
}

export function monthTitle(year: number, month: number): string {
  return `${MONTHS_LONG[month][0].toUpperCase()}${MONTHS_LONG[month].slice(1)} de ${year}`
}

export function formatMoney(cents: number): string {
  if (cents === 0) return 'Grátis'
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
