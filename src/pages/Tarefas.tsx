import { useState, type FormEvent } from 'react'
import { Check, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { removeTask, saveTask, toggleTask } from '../data/actions'
import { useDb } from '../data/store'
import type { Task } from '../domain/types'
import { CuidadoTabs, Empty, PageHeader, toast } from '../components/ui'

const RANK = { alta: 0, media: 1, baixa: 2 } as const

export default function Tarefas() {
  const db = useDb()
  const [showDone, setShowDone] = useState(false)
  const [title, setTitle] = useState('')
  const [urgent, setUrgent] = useState(false)

  const pending = db.tasks
    .filter((t) => !t.done)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || RANK[a.priority] - RANK[b.priority])
  const done = db.tasks.filter((t) => t.done)

  const add = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    saveTask({ title: title.trim(), category: '', priority: urgent ? 'alta' : 'media', done: false, pinned: false })
    setTitle('')
    setUrgent(false)
    toast('Tarefa adicionada')
  }

  return (
    <div className="page">
      <PageHeader title="Cuidado" />
      <CuidadoTabs />

      <form className="card stack" onSubmit={add}>
        <label className="sr-only" htmlFor="nova-tarefa">Nova tarefa</label>
        <input id="nova-tarefa" className="input" placeholder="O que precisa ser feito?" value={title} onChange={(e) => setTitle(e.target.value)} />
        {title.trim() && (
          <div className="row between">
            <button type="button" className="chip" aria-pressed={urgent} onClick={() => setUrgent((u) => !u)}>Urgente</button>
            <button className="btn" type="submit"><Plus size={20} aria-hidden /> Adicionar</button>
          </div>
        )}
      </form>

      <div style={{ marginTop: '1rem' }}>
        {pending.length === 0 ? (
          <div className="card">
            <Empty icon={Check} title="Tudo em dia" />
          </div>
        ) : (
          <div className="list">{pending.map((t) => <TaskRow key={t.id} task={t} />)}</div>
        )}
      </div>

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
        {!task.done && task.priority === 'alta' && <span className="pill danger" style={{ marginTop: 4 }}>Urgente</span>}
      </div>
      <div className="trail">
        <button className="icon-btn" onClick={() => { removeTask(task.id); toast('Tarefa removida') }} aria-label={`Excluir: ${task.title}`}>
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  )
}
