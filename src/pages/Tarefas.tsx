import { useState, type FormEvent } from 'react'
import { Check, ChevronDown, Pin, Plus, Trash2 } from 'lucide-react'
import { removeTask, saveTask, toggleTask, toggleTaskPin } from '../data/actions'
import { useDb } from '../data/store'
import type { Task, TaskPriority } from '../domain/types'
import { CuidadoTabs, Empty, PageHeader, toast } from '../components/ui'

const PRIORITY: Record<TaskPriority, { label: string; tone: string; rank: number }> = {
  alta: { label: 'Alta', tone: 'danger', rank: 0 },
  media: { label: 'Média', tone: 'amber', rank: 1 },
  baixa: { label: 'Baixa', tone: '', rank: 2 },
}

export default function Tarefas() {
  const db = useDb()
  const [showDone, setShowDone] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('media')

  const pending = db.tasks
    .filter((t) => !t.done)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || PRIORITY[a.priority].rank - PRIORITY[b.priority].rank)
  const done = db.tasks.filter((t) => t.done)

  const add = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    saveTask({ title: title.trim(), category: '', priority, done: false, pinned: false })
    setTitle('')
    toast('Tarefa adicionada')
  }

  return (
    <div className="page">
      <PageHeader title="Cuidado" sub="Consultas, remédios, tarefas e a rede de apoio" />
      <CuidadoTabs />

      <form className="card stack" onSubmit={add}>
        <label className="sr-only" htmlFor="nova-tarefa">Nova tarefa</label>
        <input id="nova-tarefa" className="input" placeholder="O que precisa ser feito?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="row between">
          <div className="chips" role="group" aria-label="Prioridade">
            {(['baixa', 'media', 'alta'] as const).map((p) => (
              <button type="button" key={p} className="chip" aria-pressed={priority === p} onClick={() => setPriority(p)}>{PRIORITY[p].label}</button>
            ))}
          </div>
          <button className="btn" type="submit" disabled={!title.trim()}><Plus size={20} aria-hidden /> Adicionar</button>
        </div>
      </form>

      <div className="group-label">{pending.length} {pending.length === 1 ? 'pendente' : 'pendentes'}</div>
      {pending.length === 0 ? (
        <div className="card">
          <Empty icon={Check} title="Tudo em dia">
            <p>Nenhuma tarefa pendente. Aproveite para descansar um pouco.</p>
          </Empty>
        </div>
      ) : (
        <div className="list">{pending.map((t) => <TaskRow key={t.id} task={t} />)}</div>
      )}

      {done.length > 0 && (
        <>
          <button className="btn ghost" style={{ marginTop: '1.25rem' }} onClick={() => setShowDone((s) => !s)} aria-expanded={showDone}>
            <ChevronDown size={18} aria-hidden style={{ rotate: showDone ? '180deg' : '0deg', transition: 'rotate .2s' }} />
            {showDone ? 'Ocultar' : 'Ver'} concluídas ({done.length})
          </button>
          {showDone && <div className="list" style={{ marginTop: '0.75rem' }}>{done.map((t) => <TaskRow key={t.id} task={t} />)}</div>}
        </>
      )}
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  const p = PRIORITY[task.priority]
  return (
    <div className={`item${task.done ? ' off' : ''}`}>
      <button
        className={`dose-check${task.done ? ' on' : ''}`}
        onClick={() => toggleTask(task.id)}
        aria-pressed={task.done}
        aria-label={`${task.done ? 'Reabrir' : 'Concluir'}: ${task.title}`}
      >
        <Check size={18} strokeWidth={3} />
      </button>
      <div className="main">
        <div className="title">{task.title}</div>
        <div className="row" style={{ gap: '0.4rem', marginTop: 4 }}>
          {!task.done && <span className={`pill ${p.tone}`}>{p.label}</span>}
          {task.category && <span className="muted small">{task.category}</span>}
        </div>
      </div>
      <div className="trail">
        {!task.done && (
          <button
            className="icon-btn"
            onClick={() => toggleTaskPin(task.id)}
            aria-pressed={task.pinned}
            aria-label={task.pinned ? 'Desafixar' : 'Fixar no topo'}
            style={task.pinned ? { color: 'var(--brand)' } : undefined}
          >
            <Pin size={20} fill={task.pinned ? 'currentColor' : 'none'} />
          </button>
        )}
        <button className="icon-btn" onClick={() => { removeTask(task.id); toast('Tarefa removida') }} aria-label={`Excluir: ${task.title}`}>
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  )
}
