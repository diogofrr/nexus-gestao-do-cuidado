import type { Db, EventItem, Order, PaymentMethod, Ticket, TicketType } from '../domain/types'
import { applyDiscount, PLANS } from './plans'
import { parseLocalIso } from './dates'

export const MAX_TICKETS_PER_ORDER = 5

export function soldCount(db: Pick<Db, 'tickets' | 'orders'>, ticketTypeId: string): number {
  const orderIds = new Set(db.orders.filter((o) => o.ticketTypeId === ticketTypeId).map((o) => o.id))
  return db.tickets.filter((t) => orderIds.has(t.orderId) && !t.cancelledAt).length
}

export function remaining(db: Pick<Db, 'tickets' | 'orders'>, type: TicketType): number {
  return Math.max(0, type.capacity - soldCount(db, type.id))
}

export function myTickets(db: Pick<Db, 'tickets' | 'orders'>): Ticket[] {
  const external = new Set(db.orders.filter((o) => o.external).map((o) => o.id))
  return db.tickets.filter((t) => !external.has(t.orderId))
}

export function eventRemaining(db: Pick<Db, 'tickets' | 'orders'>, event: EventItem): number {
  return event.ticketTypes.reduce((acc, t) => acc + remaining(db, t), 0)
}

export function unitPrice(db: Pick<Db, 'user'>, type: TicketType): number {
  return applyDiscount(type.priceCents, PLANS[db.user.plan].ticketDiscount)
}

export function eventEnd(event: EventItem): Date {
  return new Date(parseLocalIso(event.startsAt).getTime() + event.durationMinutes * 60_000)
}

export function isEventOver(event: EventItem, now: Date = new Date()): boolean {
  return eventEnd(event).getTime() < now.getTime()
}

/** Transmissão liberada 15 minutos antes do início e até o fim do evento. */
export function isStreamOpen(event: EventItem, now: Date = new Date()): boolean {
  const start = parseLocalIso(event.startsAt).getTime() - 15 * 60_000
  return event.kind === 'online' && now.getTime() >= start && !isEventOver(event, now)
}

function randomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 10; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `NXS-${out}`
}

export interface PurchaseInput {
  eventId: string
  ticketTypeId: string
  holders: string[]
  method: PaymentMethod
}

export type PurchaseResult =
  | { ok: true; order: Order; tickets: Ticket[] }
  | { ok: false; error: string }

/** Valida estoque e regras no momento da confirmação e devolve o pedido e os ingressos. */
export function buildPurchase(
  db: Db,
  input: PurchaseInput,
  newId: () => string,
  now: Date = new Date(),
): PurchaseResult {
  const event = db.events.find((e) => e.id === input.eventId)
  if (!event) return { ok: false, error: 'Evento não encontrado.' }
  if (isEventOver(event, now)) return { ok: false, error: 'Este evento já terminou.' }
  const type = event.ticketTypes.find((t) => t.id === input.ticketTypeId)
  if (!type) return { ok: false, error: 'Tipo de ingresso não encontrado.' }
  const quantity = input.holders.length
  if (quantity < 1) return { ok: false, error: 'Informe ao menos um participante.' }
  if (quantity > MAX_TICKETS_PER_ORDER)
    return { ok: false, error: `Máximo de ${MAX_TICKETS_PER_ORDER} ingressos por pedido.` }
  if (input.holders.some((h) => h.trim().length < 2))
    return { ok: false, error: 'Preencha o nome de todos os participantes.' }
  if (quantity > remaining(db, type))
    return { ok: false, error: 'Não há vagas suficientes para esse ingresso.' }

  const total = unitPrice(db, type) * quantity
  const orderId = newId()
  const order: Order = {
    id: orderId,
    eventId: event.id,
    ticketTypeId: type.id,
    quantity,
    totalCents: total,
    method: total === 0 ? 'free' : input.method,
    createdAt: now.toISOString(),
  }
  const tickets: Ticket[] = input.holders.map((h) => ({
    id: newId(),
    orderId,
    eventId: event.id,
    ticketTypeId: type.id,
    holderName: h.trim(),
    code: randomCode(),
    checkedInAt: null,
    cancelledAt: null,
  }))
  return { ok: true, order, tickets }
}
