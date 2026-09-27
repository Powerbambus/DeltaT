import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatBalance } from '../lib/balance'
import type { BalanceGranularity, BalanceHistory } from '../api/types'

interface BalanceChartProps {
  history: BalanceHistory
  granularity: BalanceGranularity
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

export function BalanceChart({ history, granularity }: BalanceChartProps) {
  const isApproximate = granularity === 'monthly'
  const data = history.periods.map((period) => ({
    date: period.period_end,
    cumulative_balance: Number(period.cumulative_balance.toFixed(2)),
  }))

  return (
    <div>
      {isApproximate && (
        <p className="mb-2 text-xs text-gray-500">
          ca. — Monatswerte sind eine Näherung (4,38 Wochen/Monat) und können leicht vom exakten
          Gesamtsaldo abweichen. Für exakte Werte auf Wochenansicht wechseln.
        </p>
      )}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} width={48} />
            <ReferenceLine y={0} stroke="#9ca3af" />
            <Tooltip
              labelFormatter={(value) => formatDate(String(value))}
              formatter={(value) => [
                `${isApproximate ? 'ca. ' : ''}${formatBalance(Number(value))}`,
                'Saldo',
              ]}
            />
            <Line
              type="monotone"
              dataKey="cumulative_balance"
              stroke="#2563eb"
              strokeWidth={2}
              strokeDasharray={isApproximate ? '5 4' : undefined}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
