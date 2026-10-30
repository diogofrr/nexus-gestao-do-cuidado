import { useState, type FormEvent } from 'react'
import { removeTask, saveTask, toggleTask, toggleTaskPin } from '../data/actions'
import { useDb } from '../data/store'
import type { Task, TaskPriority } from '../domain/types'
import { Empty, Field, Modal, toast } from '../components/ui'

const PRIORITY_BADGE: Record<TaskPriority, string> = { alta: 'danger', media: 'warn', baixa: 'neutral' }
const PRIORITY_RANK: Record<TaskPriority, number> = { alta: 0, media: 1, baixa: 2 }

export default function Tarefas() {
  const db = useDb()
  const [showDone, setShowDone] = useState(false)
  const [adding, setAdding] = useState(false)

  const pending = db.tasks
    .filter((t) => !t.done)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
  const done = db.tasks.filter((t) => t.done)

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Tarefas</h1>
          <p>{pending.length} pendente{pending.length === 1 ? '' : 's'}</p>
        </div>
        <button className="btn" onClick={() => setAdding(true)}>+ Nova tarefa</button>
      </div>

      {pending.length === 0 ? (
        <Empty icon="🎉" title="Tudo em dia" />
      ) : (
        pending.map((t) => <TaskRow key={t.id} task={t} />)
      )}

      {done.length > 0 && (
        <>
          <button className="btn ghost" onClick={() => setShowDone((s) => !s)} aria-expanded={showDone}>
            {showDone ? 'Ocultar' : 'Ver'} concluídas ({done.length})
          </button>
          {showDone && done.map((t) => <TaskRow key={t.id} task={t} />)}
        </>
      )}

      {adding && <TaskForm onClose={() => setAdding(false)} />}
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="card row between" style={task.done ? { opacity: 0.65 } : undefined}>
      <div className="row grow">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => toggleTask(task.id)}
          aria-label={`Concluir ${task.title}`}
          style={{ width: 22, height: 22 }}
        />
        <div className="grow">
          <h3 style={task.done ? { textDecoration: 'line-through' } : undefined}>{task.title}</h3>
          <div className="row" style={{ marginTop: 4 }}>
            <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>{task.priority}</span>
            {task.category && <span className="muted small">{task.category}</span>}
          </div>
        </div>
      </div>
      <div className="row">
        <button
          className="btn ghost sm"
          onClick={() => toggleTaskPin(task.id)}
          aria-pressed={task.pinned}
          aria-label={task.pinned ? 'Desafixar' : 'Fixar'}
          title={task.pinned ? 'Desafixar' : 'Fixar'}
        >
          📌
        </button>
        <button className="btn ghost sm" onClick={() => { removeTask(task.id); toast('Tarefa removida') }} aria-label={`Remover ${task.title}`}>🗑️</button>
      </div>
    </div>
  )
}

function TaskForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('media')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setError('Informe o título da tarefa.')
    saveTask({ title: title.trim(), category: category.trim(), priority, done: false, pinned: false })
    toast('Tarefa criada')
    onClose()
  }

  return (
    <Modal title="Nova tarefa" onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        <Field label="Título*">{(id) => <input id={id} value={title} onChange={(e) => setTitle(e.target.value)} />}</Field>
        <Field label="Categoria">{(id) => <input id={id} value={category} onChange={(e) => setCategory(e.target.value)} />}</Field>
        <Field label="Prioridade">
          {(id) => (
            <select id={id} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          )}
        </Field>
        {error && <div className="alert error" role="alert">{error}</div>}
        <div className="row">
          <button className="btn" type="submit">Salvar</button>
          <button className="btn ghost" type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}
