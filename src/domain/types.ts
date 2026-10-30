export type PlanId = 'basic' | 'plus' | 'familia'

export interface User {
  name: string
  email: string
  elderName: string
  plan: PlanId
}

export type AppointmentStatus = 'agendada' | 'realizada' | 'cancelada'

export interface Appointment {
  id: string
  title: string
  doctor: string
  specialty: string
  status: AppointmentStatus
  /** YYYY-MM-DD */
  date: string
  /** HH:mm */
  time: string
}

export interface Medication {
  id: string
  name: string
  elderName: string
  dosage: string
  schedule: string
  stock: number | null
  nextPurchase: string
  prescribedBy: string
  frequency: string
  route: string
  notes: string
}

export interface Professional {
  id: string
  name: string
  specialty: string
  phone: string
}

export type TaskPriority = 'baixa' | 'media' | 'alta'

export interface Task {
  id: string
  title: string
  category: string
  priority: TaskPriority
  done: boolean
  pinned: boolean
}

export type Modality = 'online' | 'presencial'

export interface Psychologist {
  id: string
  name: string
  crp: string
  specialties: string[]
  bio: string
  priceCents: number
  modalities: Modality[]
  /** Dia da semana (0 = domingo) para a lista de horários HH:mm atendidos. */
  weekly: Record<number, string[]>
  /** Datas YYYY-MM-DD em que o profissional não atende. */
  blockedDates: string[]
  hue: number
}

export type SessionStatus = 'agendada' | 'realizada' | 'cancelada'

export interface PsychSession {
  id: string
  psychologistId: string
  date: string
  time: string
  modality: Modality
  reason: string
  status: SessionStatus
  priceCents: number
  paid: boolean
  createdAt: string
}

export type EventKind = 'online' | 'presencial'

export interface TicketType {
  id: string
  name: string
  priceCents: number
  capacity: number
}

export interface EventItem {
  id: string
  title: string
  speaker: string
  description: string
  kind: EventKind
  /** ISO local, sem fuso (YYYY-MM-DDTHH:mm). */
  startsAt: string
  durationMinutes: number
  location: string
  streamUrl: string
  ticketTypes: TicketType[]
}

export type PaymentMethod = 'pix' | 'card'

export interface Order {
  id: string
  eventId: string
  ticketTypeId: string
  quantity: number
  totalCents: number
  method: PaymentMethod | 'free'
  createdAt: string
  /** Pedido de outro participante: ocupa vaga, mas não aparece em "Meus ingressos". */
  external?: boolean
}

export interface Ticket {
  id: string
  orderId: string
  eventId: string
  ticketTypeId: string
  holderName: string
  code: string
  checkedInAt: string | null
  cancelledAt: string | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  at: string
}

export interface Db {
  version: number
  user: User
  appointments: Appointment[]
  medications: Medication[]
  professionals: Professional[]
  tasks: Task[]
  psychologists: Psychologist[]
  sessions: PsychSession[]
  events: EventItem[]
  orders: Order[]
  tickets: Ticket[]
  chat: ChatMessage[]
  notifications: { medsAndAppointments: boolean; events: boolean }
}
