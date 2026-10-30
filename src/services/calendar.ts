const pad = (n: number) => String(n).padStart(2, '0')

function icsDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
}

const escapeText = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

export interface IcsInput {
  uid: string
  title: string
  start: Date
  minutes: number
  location?: string
  description?: string
}

/** Gera um evento de calendário (.ics) com horário local flutuante e lembrete 1h antes. */
export function buildIcs(e: IcsInput): string {
  const end = new Date(e.start.getTime() + e.minutes * 60_000)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nexus//Gestao do Cuidado//PT',
    'BEGIN:VEVENT',
    `UID:${e.uid}@nexus.demo`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(e.start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${escapeText(e.title)}`,
    e.location ? `LOCATION:${escapeText(e.location)}` : '',
    e.description ? `DESCRIPTION:${escapeText(e.description)}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(e.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

export function downloadIcs(filename: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
