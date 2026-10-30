import type {
  Appointment,
  ChatMessage,
  Medication,
  Modality,
  PaymentMethod,
  PlanId,
  Professional,
  PsychSession,
  Task,
  Ticket,
  User,
} from '../domain/types'
import { getFreeSlots } from '../services/availability'
import { applyDiscount, PLANS } from '../services/plans'
import { CANCEL_LIMIT_HOURS, canCancelSession } from '../services/sessions'
import { buildPurchase, type PurchaseResult } from '../services/tickets'
import { getDb, newId, setDb } from './store'

export type Result<T = void> = ({ ok: true } & (T extends void ? object : { value: T })) | { ok: false; error: string }

const fail = (error: string) => ({ ok: false as const, error })

// ---------- consultas médicas ----------

export function saveAppointment(input: Omit<Appointment, 'id'> & { id?: string }): Result {
  const db = getDb()
  const isNew = !input.id
  if (isNew) {
    const active = db.appointments.filter((a) => a.status !== 'cancelada').length
    if (active >= PLANS[db.user.plan].maxAppointments)
      return fail('Você atingiu o limite de consultas do plano Basic. Conheça o Plus para consultas ilimitadas.')
  }
  setDb((d) => ({
    ...d,
    appointments: isNew
      ? [...d.appointments, { ...input, id: newId() }]
      : d.appointments.map((a) => (a.id === input.id ? ({ ...input } as Appointment) : a)),
  }))
  return { ok: true }
}

export function removeAppointment(id: string): void {
  setDb((d) => ({ ...d, appointments: d.appointments.filter((a) => a.id !== id) }))
}

// ---------- medicações ----------

export function saveMedication(input: Omit<Medication, 'id'> & { id?: string }): Result {
  const db = getDb()
  const isNew = !input.id
  if (isNew && db.medications.length >= PLANS[db.user.plan].maxMedications)
    return fail('Você atingiu o limite de 5 medicações do plano Basic. Conheça o Plus para medicações ilimitadas.')
  setDb((d) => ({
    ...d,
    medications: isNew
      ? [...d.medications, { ...input, id: newId() }]
      : d.medications.map((m) => (m.id === input.id ? ({ ...input } as Medication) : m)),
  }))
  return { ok: true }
}

export function removeMedication(id: string): void {
  setDb((d) => ({ ...d, medications: d.medications.filter((m) => m.id !== id) }))
}

export function toggleDose(key: string): void {
  setDb((d) => {
    const log = { ...d.doseLog }
    if (log[key]) delete log[key]
    else log[key] = true
    return { ...d, doseLog: log }
  })
}

// ---------- profissionais ----------

export function saveProfessional(input: Omit<Professional, 'id'> & { id?: string }): void {
  setDb((d) => ({
    ...d,
    professionals: input.id
      ? d.professionals.map((p) => (p.id === input.id ? ({ ...input } as Professional) : p))
      : [...d.professionals, { ...input, id: newId() }],
  }))
}

export function removeProfessional(id: string): void {
  setDb((d) => ({ ...d, professionals: d.professionals.filter((p) => p.id !== id) }))
}

// ---------- tarefas ----------

export function saveTask(input: Omit<Task, 'id'> & { id?: string }): void {
  setDb((d) => ({
    ...d,
    tasks: input.id
      ? d.tasks.map((t) => (t.id === input.id ? ({ ...input } as Task) : t))
      : [...d.tasks, { ...input, id: newId() }],
  }))
}

export function toggleTask(id: string): void {
  setDb((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }))
}

export function toggleTaskPin(id: string): void {
  setDb((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)) }))
}

export function removeTask(id: string): void {
  setDb((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }))
}

// ---------- conta ----------

export function updateUser(patch: Partial<User>): void {
  setDb((d) => ({ ...d, user: { ...d.user, ...patch } }))
}

export function changePlan(plan: PlanId): void {
  updateUser({ plan })
}

export function setNotifications(patch: Partial<{ medsAndAppointments: boolean; events: boolean }>): void {
  setDb((d) => ({ ...d, notifications: { ...d.notifications, ...patch } }))
}

// ---------- sessões de psicologia ----------

export function sessionPrice(psychologistId: string): number {
  const db = getDb()
  const psych = db.psychologists.find((p) => p.id === psychologistId)
  if (!psych) return 0
  return applyDiscount(psych.priceCents, PLANS[db.user.plan].sessionDiscount)
}

export interface BookSessionInput {
  psychologistId: string
  date: string
  time: string
  modality: Modality
  reason: string
}

/** Revalida a disponibilidade no momento da confirmação, para não haver reserva dupla. */
export function bookSession(input: BookSessionInput, now: Date = new Date()): Result<PsychSession> {
  const db = getDb()
  const psych = db.psychologists.find((p) => p.id === input.psychologistId)
  if (!psych) return fail('Psicólogo não encontrado.')
  if (!psych.modalities.includes(input.modality)) return fail('Esta modalidade não é atendida por este profissional.')
  if (!getFreeSlots(psych, input.date, db.sessions, now).includes(input.time))
    return fail('Esse horário acabou de ser ocupado ou não está mais disponível. Escolha outro.')
  const clash = db.sessions.find(
    (s) => !s.external && s.status === 'agendada' && s.date === input.date && s.time === input.time,
  )
  if (clash) return fail('Você já tem uma sessão agendada nesse mesmo horário.')

  const session: PsychSession = {
    id: newId(),
    psychologistId: psych.id,
    date: input.date,
    time: input.time,
    modality: input.modality,
    reason: input.reason.trim(),
    status: 'agendada',
    priceCents: sessionPrice(psych.id),
    paid: true,
    createdAt: now.toISOString(),
  }
  setDb((d) => ({ ...d, sessions: [...d.sessions, session] }))
  return { ok: true, value: session }
}

/** Cancela e libera o horário. Cancelamento só até 2 horas antes. */
export function cancelSession(id: string, now: Date = new Date()): Result {
  const s = getDb().sessions.find((x) => x.id === id)
  if (!s) return fail('Sessão não encontrada.')
  if (!canCancelSession(s, now))
    return fail(`Cancelamentos só são possíveis até ${CANCEL_LIMIT_HOURS} horas antes da sessão.`)
  setDb((d) => ({ ...d, sessions: d.sessions.map((x) => (x.id === id ? { ...x, status: 'cancelada' } : x)) }))
  return { ok: true }
}

// ---------- ingressos ----------

export function purchaseTickets(
  input: { eventId: string; ticketTypeId: string; holders: string[]; method: PaymentMethod },
  now: Date = new Date(),
): PurchaseResult {
  const result = buildPurchase(getDb(), input, newId, now)
  if (result.ok) {
    setDb((d) => ({
      ...d,
      orders: [...d.orders, result.order],
      tickets: [...d.tickets, ...result.tickets],
    }))
  }
  return result
}

export function cancelTicket(ticket: Ticket): Result {
  const db = getDb()
  const event = db.events.find((e) => e.id === ticket.eventId)
  if (!event) return fail('Evento não encontrado.')
  if (ticket.checkedInAt) return fail('Ingresso já utilizado.')
  setDb((d) => ({
    ...d,
    tickets: d.tickets.map((t) => (t.id === ticket.id ? { ...t, cancelledAt: new Date().toISOString() } : t)),
  }))
  return { ok: true }
}

export function checkIn(code: string): Result<Ticket> {
  const db = getDb()
  const ticket = db.tickets.find((t) => t.code === code.trim().toUpperCase())
  if (!ticket) return fail('Código não encontrado.')
  if (ticket.cancelledAt) return fail('Este ingresso foi cancelado.')
  if (ticket.checkedInAt) return fail('Ingresso já utilizado.')
  const updated = { ...ticket, checkedInAt: new Date().toISOString() }
  setDb((d) => ({ ...d, tickets: d.tickets.map((t) => (t.id === ticket.id ? updated : t)) }))
  return { ok: true, value: updated }
}

// ---------- chat ----------

const REPLIES: { match: RegExp; text: string }[] = [
  {
    match: /exaust|cansa|esgot|sobrecarreg/i,
    text: 'Sentir exaustão é um sinal, não uma falha. Hoje, tente uma pausa de 10 minutos longe do ambiente de cuidado e peça a alguém para assumir uma tarefa pequena. Se o cansaço persistir, você pode agendar uma conversa com um dos psicólogos da plataforma.',
  },
  {
    match: /burnout/i,
    text: 'A síndrome de burnout do cuidador é um esgotamento físico e emocional causado por cuidar por muito tempo sem apoio. Os sinais incluem irritabilidade, insônia, isolamento e negligência da própria saúde. Procure ajuda profissional se se reconhecer em três ou mais.',
  },
  {
    match: /medicament|remédio|remedio|rotina/i,
    text: 'Para organizar os medicamentos: cadastre cada um com horário e estoque na área Medicações, use uma caixa organizadora semanal e deixe a próxima compra registrada para não faltar.',
  },
  {
    match: /direito/i,
    text: 'Entre os direitos mais citados estão o BPC para idosos de baixa renda, a prioridade em atendimento do Estatuto da Pessoa Idosa e licenças previstas na legislação. Há uma palestra sobre isso na área Eventos.',
  },
  {
    match: /conversar|limita/i,
    text: 'Converse com calma e em um momento tranquilo, use frases curtas, valide os sentimentos da pessoa e ofereça escolhas em vez de ordens. Foque no que ela ainda consegue fazer com segurança.',
  },
  {
    match: /psic[óo]log|terapia|sess[ãa]o/i,
    text: 'Você pode agendar uma sessão com os psicólogos da plataforma em Apoio Psicológico, escolhendo o dia e o horário disponíveis.',
  },
  {
    match: /ingress|evento|palestra/i,
    text: 'Em Eventos você vê as palestras online e presenciais, compra o ingresso e acessa o QR Code em Meus ingressos.',
  },
]

const FALLBACK =
  'Entendi. Pode me contar um pouco mais? Estou aqui para ajudar com organização do cuidado, medicamentos e também com o que você está sentindo.'

export function chatMessagesToday(now: Date = new Date()): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return getDb().chat.filter((m) => m.role === 'user' && new Date(m.at).getTime() >= start).length
}

export function sendChat(text: string, now: Date = new Date()): Result {
  const db = getDb()
  const message = text.trim()
  if (!message) return fail('Escreva uma mensagem.')
  if (chatMessagesToday(now) >= PLANS[db.user.plan].chatMessagesPerDay)
    return fail('Você usou as 10 mensagens diárias do plano Basic. Conheça o Plus para chat ilimitado.')
  const reply = REPLIES.find((r) => r.match.test(message))?.text ?? FALLBACK
  const at = now.toISOString()
  const msgs: ChatMessage[] = [
    { id: newId(), role: 'user', text: message, at },
    { id: newId(), role: 'assistant', text: reply, at },
  ]
  setDb((d) => ({ ...d, chat: [...d.chat, ...msgs] }))
  return { ok: true }
}
