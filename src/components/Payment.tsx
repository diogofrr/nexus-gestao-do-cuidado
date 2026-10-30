import { useState } from 'react'
import { CreditCard, QrCode } from 'lucide-react'
import type { PaymentMethod } from '../domain/types'
import { fakePixCode, validateCard } from '../services/payment'
import { formatMoney } from '../services/dates'
import { Banner } from './ui'

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

  const field = (k: keyof typeof card) => (e: React.ChangeEvent<HTMLInputElement>) => setCard((c) => ({ ...c, [k]: e.target.value }))

  return (
    <div className="stack">
      <Banner>Demonstração: o pagamento é simulado. Para testar o cartão, use 4242 4242 4242 4242.</Banner>

      <div className="stack" role="group" aria-label="Forma de pagamento" style={{ gap: '0.6rem' }}>
        <button className="option" aria-pressed={method === 'pix'} onClick={() => setMethod('pix')}>
          <QrCode size={22} aria-hidden />
          <span className="grow"><b>Pix</b><br /><span className="muted small">Aprovação na hora</span></span>
        </button>
        <button className="option" aria-pressed={method === 'card'} onClick={() => setMethod('card')}>
          <CreditCard size={22} aria-hidden />
          <span className="grow"><b>Cartão de crédito</b><br /><span className="muted small">Em 1x, sem juros</span></span>
        </button>
      </div>

      {method === 'pix' ? (
        <div className="stack" style={{ gap: '0.5rem' }}>
          <p className="small muted">Código Pix copia e cola (fictício):</p>
          <div className="pix">{fakePixCode(reference, totalCents)}</div>
        </div>
      ) : (
        <div className="form-grid">
          <div className="field">
            <label htmlFor="cc-num">Número do cartão</label>
            <input id="cc-num" className="input" inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" value={card.number} onChange={field('number')} />
          </div>
          <div className="field">
            <label htmlFor="cc-name">Nome impresso</label>
            <input id="cc-name" className="input" autoComplete="off" value={card.name} onChange={field('name')} />
          </div>
          <div className="field">
            <label htmlFor="cc-exp">Validade</label>
            <input id="cc-exp" className="input" placeholder="MM/AA" autoComplete="off" value={card.expiry} onChange={field('expiry')} />
          </div>
          <div className="field">
            <label htmlFor="cc-cvv">CVV</label>
            <input id="cc-cvv" className="input" inputMode="numeric" autoComplete="off" value={card.cvv} onChange={field('cvv')} />
          </div>
        </div>
      )}

      {error && <Banner tone="danger">{error}</Banner>}
      <button className="btn lg block" onClick={pay}>
        {method === 'pix' ? `Já paguei: ${submitLabel}` : `${submitLabel} · ${formatMoney(totalCents)}`}
      </button>
    </div>
  )
}
