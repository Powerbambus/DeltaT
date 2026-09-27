import { formatBalance, formatHours, toneFor } from '../lib/balance'
import type { BalanceGranularity, BalancePeriod } from '../api/types'

interface PeriodsTableProps {
  periods: BalancePeriod[]
  granularity: BalanceGranularity
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function TargetMetIcon({ met }: { met: boolean }) {
  if (met) {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-green-600">
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
          clipRule="evenodd"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-600">
      <path
        fillRule="evenodd"
        d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 01-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function PeriodsTable({ periods, granularity }: PeriodsTableProps) {
  const isApproximate = granularity === 'monthly'
  const prefix = isApproximate ? 'ca. ' : ''

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Zeitraum</th>
            <th className="px-4 py-2 text-right font-medium text-gray-500">Soll</th>
            <th className="px-4 py-2 text-right font-medium text-gray-500">Ist</th>
            <th className="px-4 py-2 text-right font-medium text-gray-500">Saldo</th>
            <th className="px-4 py-2 text-center font-medium text-gray-500">Ziel erreicht</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {periods.map((period) => {
            const tone = toneFor(period.period_balance)
            return (
              <tr key={period.period_start}>
                <td className="px-4 py-2 text-gray-900">
                  {formatDate(period.period_start)} – {formatDate(period.period_end)}
                </td>
                <td className="px-4 py-2 text-right text-gray-600">
                  {prefix}
                  {formatHours(period.target_hours)}
                </td>
                <td className="px-4 py-2 text-right text-gray-600">
                  {prefix}
                  {formatHours(period.actual_hours)}
                </td>
                <td className={`px-4 py-2 text-right font-medium ${tone.text}`}>
                  {prefix}
                  {formatBalance(period.period_balance)}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-center">
                    <TargetMetIcon met={period.target_met} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
