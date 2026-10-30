import { useEffect, useState } from 'react'

/** Relógio que atualiza sozinho, para o que muda com o tempo (agora, atrasado, sessão aberta). */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
