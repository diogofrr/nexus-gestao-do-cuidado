import { describe, expect, it } from 'vitest'
import { makeSeed } from '../data/seed'
import type { PsychSession } from '../domain/types'
import { getFreeSlots, nextAvailableDate } from './availability'
import { toDateStr } from './dates'
import { luhn, validateCard } from './payment'
import { buildPurchase, isStreamOpen, remaining, unitPrice } from './tickets'

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
