import type { Db, EventItem, Order, PsychSession, Psychologist, Ticket } from '../domain/types'
import { addDays, toDateStr } from '../services/dates'

export const DB_VERSION = 2

const pad = (n: number) => String(n).padStart(2, '0')
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
const minutesFrom = (now: Date, minutes: number) => {
  const d = new Date(now.getTime() + minutes * 60_000)
  d.setSeconds(0, 0)
  return d
}

const weekdays = (times: string[], days: number[]) =>
  Object.fromEntries(days.map((d) => [d, times])) as Record<number, string[]>

function psychologists(now: Date): Psychologist[] {
  // Dra. Helena está de férias nas próximas 3 semanas.
  const vacation = Array.from({ length: 21 }, (_, i) => toDateStr(addDays(now, i)))
  return [
    {
      id: 'psi-1',
      name: 'Dra. Jéssica Rosa',
      crp: 'CRP 04/58213',
      specialties: ['Burnout do cuidador', 'Ansiedade'],
      bio: 'Psicóloga clínica com foco em saúde mental de cuidadores familiares. Atende há 9 anos em grupos de apoio e consultório.',
      priceCents: 14000,
      modalities: ['online', 'presencial'],
      weekly: weekdays(['09:00', '10:00', '11:00', '14:00', '15:00'], [1, 3, 5]),
      blockedDates: [],
      hue: 210,
    },
    {
      id: 'psi-2',
      name: 'Dr. Marcos Antunes',
      crp: 'CRP 04/61877',
      specialties: ['Luto e perdas', 'Depressão'],
      bio: 'Especialista em luto antecipatório e acompanhamento de famílias de pacientes com doenças crônicas e demências.',
      priceCents: 16000,
      modalities: ['online'],
      weekly: weekdays(['08:00', '09:00', '16:00', '17:00', '18:00'], [2, 4]),
      blockedDates: [],
      hue: 160,
    },
    {
      id: 'psi-3',
      name: 'Dra. Helena Duarte',
      crp: 'CRP 04/49302',
      specialties: ['Terapia familiar', 'Conflitos entre irmãos'],
      bio: 'Mediação de conflitos familiares na divisão dos cuidados, com abordagem sistêmica. Em férias nas próximas semanas.',
      priceCents: 18000,
      modalities: ['online', 'presencial'],
      weekly: weekdays(['10:00', '11:00', '13:00', '14:00'], [1, 2, 3, 4, 5]),
      blockedDates: vacation,
      hue: 285,
    },
    {
      id: 'psi-4',
      name: 'Dr. Rafael Moura',
      crp: 'CRP 04/70415',
      specialties: ['Estresse e sono', 'Mindfulness'],
      bio: 'Trabalha técnicas de regulação emocional, higiene do sono e mindfulness para quem cuida em tempo integral. Agenda muito disputada.',
      priceCents: 12000,
      modalities: ['online'],
      weekly: weekdays(['19:00', '20:00', '21:00'], [1, 2, 3, 4]),
      blockedDates: [],
      hue: 25,
    },
    {
      id: 'psi-5',
      name: 'Dra. Lúcia Prado',
      crp: 'CRP 04/52660',
      specialties: ['Demências', 'Orientação ao cuidador'],
      bio: 'Atende somente no consultório, com foco em orientar famílias que cuidam de pessoas com Alzheimer e outras demências.',
      priceCents: 15000,
      modalities: ['presencial'],
      weekly: weekdays(['08:30', '09:30', '10:30'], [2, 3, 5]),
      blockedDates: [],
      hue: 340,
    },
  ]
}

function events(now: Date): EventItem[] {
  const at = (days: number, time: string) => `${toDateStr(addDays(now, days))}T${time}`
  const atDate = (d: Date) => `${toDateStr(d)}T${hhmm(d)}`
  return [
    {
      id: 'evt-1',
      title: 'Cuidar sem se esgotar: oficina para cuidadores',
      speaker: 'Dra. Jéssica Rosa',
      description:
        'Oficina prática sobre limites, divisão de tarefas e sinais de sobrecarga. Inclui exercícios de respiração e um plano pessoal de pausas.',
      kind: 'presencial',
      startsAt: at(9, '14:00'),
      durationMinutes: 150,
      location: 'Auditório ESAMC, Av. João Naves de Ávila, 2121, Uberlândia',
      streamUrl: '',
      ticketTypes: [
        { id: 'tt-1a', name: 'Geral', priceCents: 4000, capacity: 60 },
        { id: 'tt-1b', name: 'Estudante', priceCents: 2000, capacity: 20 },
      ],
    },
    {
      id: 'evt-2',
      title: 'Alzheimer: como conversar e organizar a rotina',
      speaker: 'Dr. Carlos Menezes (geriatra)',
      description:
        'Palestra com orientações sobre comunicação, segurança em casa e organização de medicamentos para quem convive com pessoas com Alzheimer.',
      kind: 'online',
      startsAt: at(4, '19:30'),
      durationMinutes: 90,
      location: '',
      streamUrl: 'https://meet.example.com/nexus-alzheimer',
      ticketTypes: [{ id: 'tt-2a', name: 'Acesso online', priceCents: 0, capacity: 300 }],
    },
    {
      id: 'evt-3',
      title: 'Direitos do cuidador e do idoso (INSS, BPC e Estatuto)',
      speaker: 'Dra. Camila Torres (advogada)',
      description:
        'Quais benefícios existem, como solicitar e o que fazer em caso de negativa. Tira-dúvidas ao vivo no final.',
      kind: 'online',
      startsAt: at(15, '20:00'),
      durationMinutes: 75,
      location: '',
      streamUrl: 'https://meet.example.com/nexus-direitos',
      ticketTypes: [
        { id: 'tt-3a', name: 'Acesso online', priceCents: 1500, capacity: 200 },
        { id: 'tt-3b', name: 'Online + gravação', priceCents: 2500, capacity: 100 },
      ],
    },
    {
      id: 'evt-4',
      title: 'Encontro de cuidadores: troca de experiências',
      speaker: 'Equipe Nexus',
      description:
        'Roda de conversa presencial, com café, mediada por psicólogos da plataforma. Vagas limitadas para manter o grupo acolhedor.',
      kind: 'presencial',
      startsAt: at(21, '09:30'),
      durationMinutes: 180,
      location: 'Centro Comunitário Santa Mônica, Uberlândia',
      streamUrl: '',
      ticketTypes: [{ id: 'tt-4a', name: 'Participante', priceCents: 0, capacity: 25 }],
    },
    {
      id: 'evt-5',
      title: 'Sono e saúde mental de quem cuida',
      speaker: 'Dr. Rafael Moura',
      description:
        'Estratégias práticas para dormir melhor mesmo com rotina noturna de cuidado. Esta edição está esgotada.',
      kind: 'online',
      startsAt: at(6, '20:30'),
      durationMinutes: 60,
      location: '',
      streamUrl: 'https://meet.example.com/nexus-sono',
      ticketTypes: [{ id: 'tt-5a', name: 'Acesso online', priceCents: 1000, capacity: 1 }],
    },
    {
      id: 'evt-6',
      title: 'Ao vivo: mesa-redonda sobre a rede de apoio do cuidador',
      speaker: 'Dra. Helena Duarte e convidados',
      description:
        'Conversa aberta sobre como pedir e aceitar ajuda de familiares, vizinhos e serviços públicos. Este evento já começou e você tem ingresso.',
      kind: 'online',
      startsAt: atDate(minutesFrom(now, -20)),
      durationMinutes: 90,
      location: '',
      streamUrl: 'https://meet.example.com/nexus-mesa-redonda',
      ticketTypes: [{ id: 'tt-6a', name: 'Acesso online', priceCents: 1000, capacity: 80 }],
    },
    {
      id: 'evt-7',
      title: 'Introdução ao autocuidado para cuidadores',
      speaker: 'Dr. Rafael Moura',
      description: 'Palestra introdutória sobre rotina de pausas, sono e alimentação. Evento já encerrado.',
      kind: 'online',
      startsAt: at(-10, '19:00'),
      durationMinutes: 60,
      location: '',
      streamUrl: 'https://meet.example.com/nexus-autocuidado',
      ticketTypes: [{ id: 'tt-7a', name: 'Acesso online', priceCents: 0, capacity: 100 }],
    },
    {
      id: 'evt-8',
      title: 'Workshop de movimentação segura do idoso',
      speaker: 'Fisioterapeuta Ana Beatriz Lemos',
      description:
        'Aprenda a ajudar na transferência da cama para a cadeira, prevenção de quedas e cuidados com a coluna. Poucas vagas, com prática em grupo pequeno.',
      kind: 'presencial',
      startsAt: at(12, '09:00'),
      durationMinutes: 120,
      location: 'Clínica Vida Ativa, Rua das Acácias, 410, Uberlândia',
      streamUrl: '',
      ticketTypes: [{ id: 'tt-8a', name: 'Participante', priceCents: 6000, capacity: 4 }],
    },
  ]
}

/** Pedidos de outros participantes: ocupam vagas, mas não aparecem em "Meus ingressos". */
function externalSale(orderId: string, eventId: string, ticketTypeId: string, n: number, now: Date) {
  const order: Order = {
    id: orderId, eventId, ticketTypeId, quantity: n, totalCents: 0, method: 'pix',
    createdAt: now.toISOString(), external: true,
  }
  const tickets: Ticket[] = Array.from({ length: n }, (_, i) => ({
    id: `${orderId}-t${i}`, orderId, eventId, ticketTypeId, holderName: `Participante ${i + 1}`,
    code: `NXS-${orderId.toUpperCase().replace(/\W/g, '').padEnd(6, '0')}${i}`.slice(0, 14),
    checkedInAt: null, cancelledAt: null,
  }))
  return { order, tickets }
}

function sessions(now: Date): PsychSession[] {
  const base = { reason: '', paid: true, createdAt: now.toISOString() }
  const live = minutesFrom(now, -15)
  const soon = minutesFrom(now, 90)
  const list: PsychSession[] = [
    // Em andamento agora: o botão "Entrar na sessão" fica ativo.
    { ...base, id: 'ss-live', psychologistId: 'psi-2', date: toDateStr(live), time: hhmm(live), modality: 'online', status: 'agendada', priceCents: 16000 },
    // Começa em 1h30: ainda não dá para entrar e o cancelamento já é bloqueado (menos de 2h).
    { ...base, id: 'ss-soon', psychologistId: 'psi-1', date: toDateStr(soon), time: hhmm(soon), modality: 'online', status: 'agendada', priceCents: 14000 },
    { ...base, id: 'ss-past', psychologistId: 'psi-1', date: toDateStr(addDays(now, -7)), time: '10:00', modality: 'presencial', status: 'realizada', priceCents: 14000, reason: 'Cansaço e sono ruim.' },
    { ...base, id: 'ss-cancel', psychologistId: 'psi-3', date: toDateStr(addDays(now, 30)), time: '14:00', modality: 'online', status: 'cancelada', priceCents: 18000 },
  ]
  // Dr. Rafael está com a agenda lotada pelas próximas duas semanas.
  for (let i = 0; i < 14; i++) {
    const d = addDays(now, i)
    if (d.getDay() >= 1 && d.getDay() <= 4) {
      for (const time of ['19:00', '20:00', '21:00']) {
        list.push({
          ...base, id: `ext-${toDateStr(d)}-${time}`, psychologistId: 'psi-4', date: toDateStr(d), time,
          modality: 'online', status: 'agendada', priceCents: 12000, external: true,
        })
      }
    }
  }
  return list
}

export function makeSeed(now: Date = new Date()): Db {
  const day = (n: number) => toDateStr(addDays(now, n))

  const sold5 = externalSale('od-evt5', 'evt-5', 'tt-5a', 1, now)
  const sold8 = externalSale('od-evt8', 'evt-8', 'tt-8a', 2, now)

  const myOrders: Order[] = [
    { id: 'od-live', eventId: 'evt-6', ticketTypeId: 'tt-6a', quantity: 1, totalCents: 1000, method: 'pix', createdAt: now.toISOString() },
    { id: 'od-past', eventId: 'evt-7', ticketTypeId: 'tt-7a', quantity: 1, totalCents: 0, method: 'free', createdAt: now.toISOString() },
    { id: 'od-cancel', eventId: 'evt-3', ticketTypeId: 'tt-3a', quantity: 1, totalCents: 1500, method: 'card', createdAt: now.toISOString() },
  ]
  const myTickets: Ticket[] = [
    { id: 'tc-live', orderId: 'od-live', eventId: 'evt-6', ticketTypeId: 'tt-6a', holderName: 'Carla Mendes', code: 'NXS-LIVE000001', checkedInAt: null, cancelledAt: null },
    { id: 'tc-past', orderId: 'od-past', eventId: 'evt-7', ticketTypeId: 'tt-7a', holderName: 'Carla Mendes', code: 'NXS-PAST000001', checkedInAt: addDays(now, -10).toISOString(), cancelledAt: null },
    { id: 'tc-cancel', orderId: 'od-cancel', eventId: 'evt-3', ticketTypeId: 'tt-3a', holderName: 'Carla Mendes', code: 'NXS-CANC000001', checkedInAt: null, cancelledAt: now.toISOString() },
  ]

  return {
    version: DB_VERSION,
    user: { name: 'Carla Mendes', email: 'carla.mendes@nexus.demo', elderName: 'Maria da Silva', plan: 'basic' },
    appointments: [
      { id: 'ap-1', title: 'Consulta com neurologista', doctor: 'Dr. Roberto Pereira Rivelino', specialty: 'Neurologia', status: 'agendada', date: day(7), time: '21:00' },
      { id: 'ap-2', title: 'Retorno cardiologia', doctor: 'Dra. Patrícia Nunes', specialty: 'Cardiologia', status: 'realizada', date: day(-20), time: '15:30' },
      { id: 'ap-3', title: 'Avaliação geriátrica', doctor: 'Dr. Henrique Salles', specialty: 'Geriatria', status: 'cancelada', date: day(-3), time: '09:00' },
    ],
    medications: [
      {
        id: 'md-1', name: 'Donepezila', elderName: 'Maria da Silva', dosage: '10 mg', schedule: '21:00', stock: 4,
        nextPurchase: day(3), prescribedBy: 'Dr. Roberto Rivelino', frequency: '1x ao dia', route: 'oral', notes: 'Tomar à noite, depois do jantar.',
      },
      {
        id: 'md-2', name: 'Losartana', elderName: 'Maria da Silva', dosage: '50 mg', schedule: '08:00, 20:00', stock: 28,
        nextPurchase: day(18), prescribedBy: 'Dra. Patrícia Nunes', frequency: '2x ao dia', route: 'oral', notes: '',
      },
      {
        id: 'md-3', name: 'Metformina', elderName: 'Maria da Silva', dosage: '850 mg', schedule: '12:00', stock: 0,
        nextPurchase: day(0), prescribedBy: 'Dra. Patrícia Nunes', frequency: '1x ao dia', route: 'oral', notes: 'Comprar hoje: o estoque acabou.',
      },
    ],
    professionals: [
      { id: 'pr-1', name: 'Jéssica Rosa', specialty: 'Psicólogo(a)', phone: '3497778834' },
      { id: 'pr-2', name: 'Dr. Roberto Pereira Rivelino', specialty: 'Neurologia', phone: '3432145566' },
      { id: 'pr-3', name: 'Ana Beatriz Lemos', specialty: 'Fisioterapia', phone: '34998871020' },
    ],
    tasks: [
      { id: 'tk-1', title: 'Ligar para Advogada Familiar', category: 'Resolução de conflito', priority: 'alta', done: false, pinned: true },
      { id: 'tk-3', title: 'Comprar Metformina na farmácia', category: 'Saúde', priority: 'alta', done: false, pinned: false },
      { id: 'tk-4', title: 'Agendar fisioterapia', category: 'Saúde', priority: 'baixa', done: false, pinned: false },
      { id: 'tk-2', title: 'Compra de remédio', category: 'Saúde', priority: 'media', done: true, pinned: false },
    ],
    psychologists: psychologists(now),
    sessions: sessions(now),
    events: events(now),
    orders: [sold5.order, sold8.order, ...myOrders],
    tickets: [...sold5.tickets, ...sold8.tickets, ...myTickets],
    chat: [],
    notifications: { medsAndAppointments: true, events: true },
  }
}
