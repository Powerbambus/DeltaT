import { formatBalance, formatHours, toneFor } from '../lib/balance'
import type { BalanceRead } from '../api/types'

interface BalanceTileProps {
  balance: BalanceRead
}

export function BalanceTile({ balance }: BalanceTileProps) {
  const tone = toneFor(balance.balance)

  return (
    <div className={`rounded-lg border p-6 ${tone.bg} ${tone.border}`}>
      <p className="text-sm font-medium text-gray-500">Aktueller Saldo</p>
      <p className={`mt-1 text-4xl font-bold ${tone.text}`}>{formatBalance(balance.balance)}</p>
      <div className="mt-4 flex gap-6 text-sm text-gray-600">
        <span>
          Soll: <span className="font-medium text-gray-900">{formatHours(balance.target_hours)}</span>
        </span>
        <span>
          Ist: <span className="font-medium text-gray-900">{formatHours(balance.actual_hours)}</span>
        </span>
      </div>
    </div>
  )
}
