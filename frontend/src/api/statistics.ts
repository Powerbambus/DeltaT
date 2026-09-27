import { apiRequest } from './client'
import type { BalanceGranularity, BalanceHistory, BalanceRead } from './types'

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined)
  if (entries.length === 0) return ''
  const search = new URLSearchParams(entries.map(([key, value]) => [key, String(value)]))
  return `?${search.toString()}`
}

interface BalanceParams {
  contractId?: number
  asOf?: string
}

export function fetchBalance(token: string, params: BalanceParams = {}): Promise<BalanceRead> {
  const query = buildQuery({ contract_id: params.contractId, as_of: params.asOf })
  return apiRequest<BalanceRead>(`/balance${query}`, { token })
}

interface BalanceHistoryParams {
  contractId?: number
  from?: string
  to?: string
}

export function fetchBalanceHistory(
  token: string,
  granularity: BalanceGranularity,
  params: BalanceHistoryParams = {},
): Promise<BalanceHistory> {
  const query = buildQuery({ contract_id: params.contractId, from: params.from, to: params.to })
  return apiRequest<BalanceHistory>(`/balance/${granularity}${query}`, { token })
}
