import type { PaymentMethod } from '../domain/types'

export interface CardInput {
  number: string
  name: string
  expiry: string
  cvv: string
}

export function luhn(number: string): boolean {
  const digits = number.replace(/\s/g, '')
  if (!/^\d{13,19}$/.test(digits)) return false
  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i])
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

export function validateCard(card: CardInput, now: Date = new Date()): string | null {
  if (!luhn(card.number)) return 'Número de cartão inválido.'
  if (card.name.trim().length < 3) return 'Informe o nome impresso no cartão.'
  const m = /^(\d{2})\/(\d{2})$/.exec(card.expiry.trim())
  if (!m) return 'Validade deve estar no formato MM/AA.'
  const month = Number(m[1])
  const year = 2000 + Number(m[2])
  if (month < 1 || month > 12) return 'Mês de validade inválido.'
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)
  if (endOfMonth < now) return 'Cartão vencido.'
  if (!/^\d{3,4}$/.test(card.cvv)) return 'CVV inválido.'
  return null
}

/** Código Pix fictício, só para a demonstração. */
export function fakePixCode(reference: string, cents: number): string {
  return `00020126NEXUS-DEMO${reference.replace(/\W/g, '').slice(0, 12)}5204000053039865406${cents}6304DEMO`
}

export const METHOD_LABEL: Record<PaymentMethod | 'free', string> = {
  pix: 'Pix',
  card: 'Cartão de crédito',
  free: 'Gratuito',
}
