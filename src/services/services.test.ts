import { describe, expect, it } from 'vitest'
import { makeSeed } from '../data/seed'
import type { PsychSession } from '../domain/types'
import { getFreeSlots, nextAvailableDate } from './availability'
import { buildIcs } from './calendar'
import { relativeDay, toDateStr } from './dates'
import { luhn, validateCard } from './payment'
import { canCancelSession, isSessionOpen, sessionStart } from './sessions'
import { buildPurchase, isEventOver, isStreamOpen, myTickets, remaining, unitPrice } from './tickets'

// Quarta-feira, 10:30 local
const NOW = new Date(2026, 9, 28, 10, 30)
const WED = '2026-10-28'
const THU = '2026-10-29'

let n = 0
const id = () => `id-${++n}`

function session(psychologistId: string, date: string, time: string, status: PsychSession['status'] = 'agendada'): PsychSession {
  return { id: id(), psychologistId, date, time, status, modality: 'online', reason: '', priceCents: 0, paid: true, createdAt: '' }
}

describe('agenda do psicólogo', () => {
  const db = makeSeed(NOW)
  const jessica = db.psychologists[0] // atende seg, qua, sex

  it('não oferece horários passados nem dentro da antecedência mínima', () => {
    // 10:30 agora, antecedência de 60 min: 11:00 já não cabe, 14:00 e 15:00 sim
    expect(getFreeSlots(jessica, WED, [], NOW)).toEqual(['14:00', '15:00'])
  })

  it('não oferece dias em que o profissional não atende', () => {
    expect(getFreeSlots(jessica, THU, [], NOW)).toEqual([])
  })

  it('remove horários já reservados, mas devolve os cancelados', () => {
    const sessions = [session('psi-1', WED, '14:00'), session('psi-1', WED, '15:00', 'cancelada')]
    expect(getFreeSlots(jessica, WED, sessions, NOW)).toEqual(['15:00'])
  })

  it('respeita bloqueios por data', () => {
    const blocked = { ...jessica, blockedDates: [WED] }
    expect(getFreeSlots(blocked, WED, [], NOW)).toEqual([])
  })

  it('reserva de outro psicólogo não interfere', () => {
    expect(getFreeSlots(jessica, WED, [session('psi-2', WED, '14:00')], NOW)).toEqual(['14:00', '15:00'])
  })

  it('acha a próxima data livre', () => {
    expect(nextAvailableDate(jessica, [], NOW)).toBe(WED)
    const full = [session('psi-1', WED, '14:00'), session('psi-1', WED, '15:00')]
    expect(nextAvailableDate(jessica, full, NOW)).toBe(toDateStr(new Date(2026, 9, 30)))
  })
})

describe('compra de ingressos', () => {
  it('calcula estoque e preço com desconto do plano', () => {
    const db = makeSeed(NOW)
    const evt = db.events.find((e) => e.id === 'evt-1')!
    const type = evt.ticketTypes[0]
    expect(remaining(db, type)).toBe(60)
    expect(unitPrice(db, type)).toBe(4000)
    expect(unitPrice({ user: { ...db.user, plan: 'plus' } }, type)).toBe(3600)
    expect(unitPrice({ user: { ...db.user, plan: 'familia' } }, type)).toBe(3200)
  })

  it('gera pedido e um ingresso por participante', () => {
    const db = makeSeed(NOW)
    const r = buildPurchase(db, { eventId: 'evt-1', ticketTypeId: 'tt-1a', holders: ['Ana', 'Beto'], method: 'pix' }, id, NOW)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.order.totalCents).toBe(8000)
    expect(r.tickets).toHaveLength(2)
    expect(new Set(r.tickets.map((t) => t.code)).size).toBe(2)
  })

  it('ingresso gratuito vira pedido "free" sem forma de pagamento', () => {
    const db = makeSeed(NOW)
    const r = buildPurchase(db, { eventId: 'evt-2', ticketTypeId: 'tt-2a', holders: ['Ana'], method: 'card' }, id, NOW)
    expect(r.ok && r.order.method).toBe('free')
  })

  it('recusa evento esgotado', () => {
    const db = makeSeed(NOW)
    const r = buildPurchase(db, { eventId: 'evt-5', ticketTypeId: 'tt-5a', holders: ['Ana'], method: 'pix' }, id, NOW)
    expect(r).toEqual({ ok: false, error: 'Não há vagas suficientes para esse ingresso.' })
  })

  it('recusa mais de 5 ingressos, nomes vazios e evento encerrado', () => {
    const db = makeSeed(NOW)
    const base = { eventId: 'evt-1', ticketTypeId: 'tt-1a', method: 'pix' as const }
    expect(buildPurchase(db, { ...base, holders: Array(6).fill('Ana') }, id, NOW).ok).toBe(false)
    expect(buildPurchase(db, { ...base, holders: ['A'] }, id, NOW).ok).toBe(false)
    const later = new Date(2027, 0, 1)
    expect(buildPurchase(db, { ...base, holders: ['Ana'] }, id, later).ok).toBe(false)
  })

  it('ingresso cancelado devolve a vaga', () => {
    const db = makeSeed(NOW)
    db.tickets[0].cancelledAt = NOW.toISOString()
    expect(remaining(db, db.events[4].ticketTypes[0])).toBe(1)
  })

  it('libera a transmissão 15 min antes e fecha ao terminar', () => {
    const evt = makeSeed(NOW).events[1]
    const start = new Date(evt.startsAt.replace('T', ' ').replace(/-/g, '/'))
    expect(isStreamOpen(evt, new Date(start.getTime() - 16 * 60_000))).toBe(false)
    expect(isStreamOpen(evt, new Date(start.getTime() - 10 * 60_000))).toBe(true)
    expect(isStreamOpen(evt, new Date(start.getTime() + 91 * 60_000))).toBe(false)
  })
})

describe('cenários do seed', () => {
  const db = makeSeed(NOW)
  const find = (id: string) => db.sessions.find((s) => s.id === id)!

  it('sessão em andamento libera o link; a que começa em 1h30 não libera e não pode ser cancelada', () => {
    expect(isSessionOpen(find('ss-live'), NOW)).toBe(true)
    expect(isSessionOpen(find('ss-soon'), NOW)).toBe(false)
    expect(canCancelSession(find('ss-soon'), NOW)).toBe(false)
    expect(canCancelSession(find('ss-live'), NOW)).toBe(false)
  })

  it('só libera o link nos 10 minutos anteriores ao horário', () => {
    const s = find('ss-soon')
    const start = sessionStart(s).getTime()
    expect(isSessionOpen(s, new Date(start - 11 * 60_000))).toBe(false)
    expect(isSessionOpen(s, new Date(start - 9 * 60_000))).toBe(true)
    expect(isSessionOpen(s, new Date(start + 51 * 60_000))).toBe(false)
  })

  it('sessão futura cancelada não ocupa horário e as realizadas não são canceláveis', () => {
    expect(canCancelSession(find('ss-past'), NOW)).toBe(false)
    expect(canCancelSession(find('ss-cancel'), NOW)).toBe(false)
  })

  it('psicóloga de férias não tem vaga nas próximas 3 semanas, mas depois tem', () => {
    const helena = db.psychologists.find((p) => p.id === 'psi-3')!
    const next = nextAvailableDate(helena, db.sessions, NOW)!
    expect(next > toDateStr(new Date(2026, 10, 17))).toBe(true)
  })

  it('psicólogo com agenda lotada só tem vaga depois de duas semanas', () => {
    const rafael = db.psychologists.find((p) => p.id === 'psi-4')!
    const next = nextAvailableDate(rafael, db.sessions, NOW)!
    expect(next >= toDateStr(new Date(2026, 10, 11))).toBe(true)
  })

  it('evento ao vivo tem transmissão aberta, o encerrado não, e o de poucas vagas mostra estoque baixo', () => {
    const evt = (id: string) => db.events.find((e) => e.id === id)!
    expect(isStreamOpen(evt('evt-6'), NOW)).toBe(true)
    expect(isEventOver(evt('evt-7'), NOW)).toBe(true)
    expect(remaining(db, evt('evt-8').ticketTypes[0])).toBe(2)
    expect(remaining(db, evt('evt-5').ticketTypes[0])).toBe(0)
  })

  it('"meus ingressos" separa o que é do usuário do que é de outros participantes', () => {
    expect(myTickets(db).map((t) => t.id).sort()).toEqual(['tc-cancel', 'tc-live', 'tc-past'])
  })

  it('o estoque do Basic permite mais uma consulta e depois bloqueia', () => {
    const active = db.appointments.filter((a) => a.status !== 'cancelada').length
    expect(active).toBe(2)
  })
})

describe('calendário', () => {
  it('gera um .ics válido com lembrete e texto escapado', () => {
    const ics = buildIcs({ uid: 'x1', title: 'Sessão, com; teste', start: new Date(2026, 9, 28, 10, 0), minutes: 50, location: 'Sala 1' })
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('DTSTART:20261028T100000')
    expect(ics).toContain('DTEND:20261028T105000')
    expect(ics).toContain('SUMMARY:Sessão\\, com\\; teste')
    expect(ics).toContain('TRIGGER:-PT1H')
    expect(ics.endsWith('END:VCALENDAR')).toBe(true)
  })

  it('rotula "Hoje" e "Amanhã"', () => {
    expect(relativeDay('2026-10-28', NOW)).toBe('Hoje')
    expect(relativeDay('2026-10-29', NOW)).toBe('Amanhã')
    expect(relativeDay('2026-10-30', NOW)).toBe('sexta, 30 de outubro')
  })
})

describe('cartão', () => {
  it('valida número pelo algoritmo de Luhn', () => {
    expect(luhn('4242 4242 4242 4242')).toBe(true)
    expect(luhn('4242 4242 4242 4241')).toBe(false)
  })

  it('valida validade e CVV', () => {
    const ok = { number: '4242424242424242', name: 'Ana Souza', expiry: '12/30', cvv: '123' }
    expect(validateCard(ok, NOW)).toBeNull()
    expect(validateCard({ ...ok, expiry: '01/20' }, NOW)).toBe('Cartão vencido.')
    expect(validateCard({ ...ok, expiry: '1230' }, NOW)).toMatch(/MM\/AA/)
    expect(validateCard({ ...ok, cvv: '1' }, NOW)).toBe('CVV inválido.')
  })
})
