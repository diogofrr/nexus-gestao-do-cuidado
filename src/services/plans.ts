import type { PlanId } from '../domain/types'

export interface PlanInfo {
  id: PlanId
  name: string
  priceLabel: string
  highlight?: boolean
  features: string[]
  maxMedications: number
  maxAppointments: number
  chatMessagesPerDay: number
  /** Desconto percentual em sessões de psicologia. */
  sessionDiscount: number
  /** Desconto percentual em ingressos. */
  ticketDiscount: number
}

export const PLANS: Record<PlanId, PlanInfo> = {
  basic: {
    id: 'basic',
    name: 'Nexus Basic',
    priceLabel: 'Gratuito',
    features: [
      'Até 5 medicações',
      'Até 3 consultas',
      'Chat limitado (10 mensagens por dia)',
      'Sessões de psicologia e ingressos pelo preço cheio',
    ],
    maxMedications: 5,
    maxAppointments: 3,
    chatMessagesPerDay: 10,
    sessionDiscount: 0,
    ticketDiscount: 0,
  },
  plus: {
    id: 'plus',
    name: 'Nexus Plus',
    priceLabel: 'R$ 49/mês',
    highlight: true,
    features: [
      'Medicações e consultas ilimitadas',
      'Chat ilimitado',
      'Plantão psicológico e notificações',
      '20% de desconto em sessões de psicologia',
      '10% de desconto em ingressos',
    ],
    maxMedications: Infinity,
    maxAppointments: Infinity,
    chatMessagesPerDay: Infinity,
    sessionDiscount: 20,
    ticketDiscount: 10,
  },
  familia: {
    id: 'familia',
    name: 'Nexus Família',
    priceLabel: 'R$ 89/mês',
    features: [
      'Tudo do Plus',
      'Até 3 idosos e múltiplos cuidadores',
      'Relatórios mensais e suporte prioritário',
      '30% de desconto em sessões de psicologia',
      '20% de desconto em ingressos',
    ],
    maxMedications: Infinity,
    maxAppointments: Infinity,
    chatMessagesPerDay: Infinity,
    sessionDiscount: 30,
    ticketDiscount: 20,
  },
}

export function applyDiscount(priceCents: number, percent: number): number {
  return Math.round(priceCents * (100 - percent) / 100)
}
