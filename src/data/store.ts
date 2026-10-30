import { useSyncExternalStore } from 'react'
import type { Db } from '../domain/types'
import { DB_VERSION, makeSeed } from './seed'

const KEY = 'nexus:db'

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Db
      if (parsed.version === DB_VERSION) return parsed
    }
  } catch {
    // armazenamento indisponível ou corrompido: recomeça do seed
  }
  return makeSeed()
}

let state: Db = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // sem persistência (modo privado, por exemplo); o app segue em memória
  }
}

function emit() {
  persist()
  listeners.forEach((l) => l())
}

export function getDb(): Db {
  return state
}

export function setDb(updater: (db: Db) => Db): void {
  state = updater(state)
  emit()
}

export function resetDb(): void {
  state = makeSeed()
  emit()
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useDb(): Db {
  return useSyncExternalStore(subscribe, getDb, getDb)
}

export function newId(): string {
  return crypto.randomUUID()
}
