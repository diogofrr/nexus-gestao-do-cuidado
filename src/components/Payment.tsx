import { useState } from 'react'
import type { PaymentMethod } from '../domain/types'
import { fakePixCode, validateCard } from '../services/payment'
import { formatMoney } from '../services/dates'

/** Pagamento simulado: nenhum dado sai do navegador e nenhuma cobrança real é feita. */
export default function Payment({
  totalCents,
  reference,
  submitLabel,
  onPay,
}: {
  totalCents: number
  reference: string
  submitLabel: string
  onPay: (method: PaymentMethod) => string | null
}) {
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [error, setError] = useState('')

  const pay = () => {
    if (method === 'card') {
      const problem = validateCard(card)
      if (problem) return setError(problem)
    }
    const failure = onPay(method)
    setError(failure ?? '')
  }

  const setCardField = (k: keyof typeof card) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCard((c) => ({ ...c, [k]: e.target.value }))

  return (
    <div className="stack">
      <div className="alert info">Ambiente de demonstração: o pagamento é simulado. Para testar o cartão, use 4242 4242 4242 4242.</div>

      <div className="chips" role="group" aria-label="Forma de pagamento">
        <button className="chip" aria-pressed={method === 'pix'} onClick={() => setMethod('pix')}>Pix</button>
        <button className="chip" aria-pressed={method === 'card'} onClick={() => setMethod('card')}>Cartão de crédito</button>
      </div>

      {method === 'pix' ? (
        <div className="stack">
          <p className="small muted">Copia e cola (fictício):</p>
          <div className="pix">{fakePixCode(reference, totalCents)}</div>
        </div>
      ) : (
        <div className="form-grid">
          <div className="field">
            <label htmlFor="cc-num">Número do cartão</label>
            <input id="cc-num" inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" value={card.number} onChange={setCardField('number')} />
          </div>
          <div className="field">
            <label htmlFor="cc-name">Nome impresso</label>
            <input id="cc-name" autoComplete="off" value={card.name} onChange={setCardField('name')} />
          </div>
          <div className="field">
            <label htmlFor="cc-exp">Validade</label>
            <input id="cc-exp" placeholder="MM/AA" autoComplete="off" value={card.expiry} onChange={setCardField('expiry')} />
          </div>
          <div className="field">
            <label htmlFor="cc-cvv">CVV</label>
            <input id="cc-cvv" inputMode="numeric" autoComplete="off" value={card.cvv} onChange={setCardField('cvv')} />
          </div>
        </div>
      )}

      {error && <div className="alert error" role="alert">{error}</div>}
      <button className="btn block" onClick={pay}>
        {method === 'pix' ? `Já paguei: ${submitLabel}` : `${submitLabel} (${formatMoney(totalCents)})`}
      </button>
    </div>
  )
}
