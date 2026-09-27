import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchBalance, fetchBalanceHistory } from '../api/statistics'
import { fetchContracts } from '../api/contracts'
import { useAuth } from '../context/AuthContext'
import { BalanceTile } from '../components/BalanceTile'
import { BalanceChart } from '../components/BalanceChart'
import { PeriodsTable } from '../components/PeriodsTable'
import { monthsAgoISO, todayISO } from '../lib/datetime'
import type { BalanceGranularity } from '../api/types'

const RANGE_PRESETS = [
  { label: '3 Monate', months: 3 },
  { label: '6 Monate', months: 6 },
  { label: '12 Monate', months: 12 },
]

export function DashboardPage() {
  const { token } = useAuth()
  const [contractId, setContractId] = useState<number | undefined>(undefined)
  const [granularity, setGranularity] = useState<BalanceGranularity>('monthly')
  const [rangeMonths, setRangeMonths] = useState(6)

  const from = monthsAgoISO(rangeMonths)
  const to = todayISO()

  const { data: contracts } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => fetchContracts(token!),
    enabled: token !== null,
  })

  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useQuery({
    queryKey: ['balance', contractId],
    queryFn: () => fetchBalance(token!, { contractId }),
    enabled: token !== null,
  })

  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useQuery({
    queryKey: ['balanceHistory', granularity, contractId, from, to],
    queryFn: () => fetchBalanceHistory(token!, granularity, { contractId, from, to }),
    enabled: token !== null,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <select
          value={contractId ?? ''}
          onChange={(e) => setContractId(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Alle Verträge</option>
          {contracts?.map((contract) => (
            <option key={contract.id} value={contract.id}>
              {contract.title}
            </option>
          ))}
        </select>
      </div>

      {isBalanceLoading && <p className="text-sm text-gray-500">Lade…</p>}
      {isBalanceError && (
        <p className="text-sm text-red-600">Saldo konnte nicht geladen werden.</p>
      )}
      {balance && <BalanceTile balance={balance} />}

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-md bg-gray-100 p-1 text-sm">
            <button
              onClick={() => setGranularity('weekly')}
              className={`rounded px-3 py-1 font-medium ${
                granularity === 'weekly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              Wöchentlich
            </button>
            <button
              onClick={() => setGranularity('monthly')}
              className={`rounded px-3 py-1 font-medium ${
                granularity === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              Monatlich
            </button>
          </div>

          <div className="flex gap-1 rounded-md bg-gray-100 p-1 text-sm">
            {RANGE_PRESETS.map((preset) => (
              <button
                key={preset.months}
                onClick={() => setRangeMonths(preset.months)}
                className={`rounded px-3 py-1 font-medium ${
                  rangeMonths === preset.months ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {isHistoryLoading && <p className="text-sm text-gray-500">Lade…</p>}
        {isHistoryError && (
          <p className="text-sm text-red-600">Verlauf konnte nicht geladen werden.</p>
        )}
        {history && (
          <>
            <BalanceChart history={history} granularity={granularity} />
            <PeriodsTable periods={[...history.periods].reverse()} granularity={granularity} />
          </>
        )}
      </div>
    </div>
  )
}
