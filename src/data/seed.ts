import type { Db, EventItem, Psychologist } from '../domain/types'
import { addDays, toDateStr } from '../services/dates'

export const DB_VERSION = 1

const weekdays = (times: string[], days: number[]) =>
  Object.fromEntries(days.map((d) => [d, times])) as Record<number, string[]>

function psychologists(): Psychologist[] {
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
      bio: 'Mediação de conflitos familiares na divisão dos cuidados, com abordagem sistêmica.',
      priceCents: 18000,
      modalities: ['online', 'presencial'],
      weekly: weekdays(['10:00', '11:00', '13:00', '14:00'], [1, 2, 3, 4, 5]),
      blockedDates: [],
      hue: 285,
    },
    {
      id: 'psi-4',
      name: 'Dr. Rafael Moura',
      crp: 'CRP 04/70415',
      specialties: ['Estresse e sono', 'Mindfulness'],
      bio: 'Trabalha técnicas de regulação emocional, higiene do sono e mindfulness para quem cuida em tempo integral.',
      priceCents: 12000,
      modalities: ['online'],
      weekly: weekdays(['19:00', '20:00', '21:00'], [1, 2, 3, 4]),
      blockedDates: [],
      hue: 25,
    },
  ]
}

function events(now: Date): EventItem[] {
  const at = (days: number, time: string) => `${toDateStr(addDays(now, days))}T${time}`
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
  ]
}

export function makeSeed(now: Date = new Date()): Db {
  const day = (n: number) => toDateStr(addDays(now, n))
  return {
    version: DB_VERSION,
    user: { name: 'Usuário', email: 'cuidador@nexus.demo', elderName: 'Maria da Silva', plan: 'basic' },
    appointments: [
      {
        id: 'ap-1',
        title: 'Consulta com neurologista',
        doctor: 'Dr. Roberto Pereira Rivelino',
        specialty: 'Neurologia',
        status: 'agendada',
        date: day(7),
        time: '21:00',
      },
    ],
    medications: [],
    professionals: [{ id: 'pr-1', name: 'Jéssica Rosa', specialty: 'Psicólogo(a)', phone: '3497778834' }],
    tasks: [
      { id: 'tk-1', title: 'Ligar para Advogada Familiar', category: 'Resolução de conflito', priority: 'alta', done: false, pinned: true },
      { id: 'tk-2', title: 'Compra de remédio', category: 'Saúde', priority: 'media', done: true, pinned: false },
    ],
    psychologists: psychologists(),
    sessions: [],
    events: events(now),
    // Esgota a edição do evt-5 para demonstrar o estado "esgotado".
    orders: [
      { id: 'od-seed', eventId: 'evt-5', ticketTypeId: 'tt-5a', quantity: 1, totalCents: 1000, method: 'pix', createdAt: now.toISOString(), external: true },
    ],
    tickets: [
      { id: 'tc-seed', orderId: 'od-seed', eventId: 'evt-5', ticketTypeId: 'tt-5a', holderName: 'Outro participante', code: 'NXS-SEED000000', checkedInAt: null, cancelledAt: null },
    ],
    chat: [],
    notifications: { medsAndAppointments: true, events: true },
  }
}
