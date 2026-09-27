export interface Token {
  access_token: string
  token_type: string
}

export interface UserRead {
  id: number
  email: string
  is_admin: boolean
  created_at: string
}

export interface Contract {
  id: number
  title: string
  start_date: string
  end_date: string | null
  weekly_hours: number | null
  description: string | null
}

export interface ContractWrite {
  title: string
  start_date: string
  end_date: string | null
  weekly_hours: number | null
  description?: string | null
}

export interface ContractUpdate {
  title?: string
  start_date?: string
  end_date?: string | null
  weekly_hours?: number | null
  description?: string | null
}

export interface ContractBrief {
  id: number
  title: string
}

export interface TimeEntry {
  id: number
  start_date: string
  end_date: string
  duration: number
  description: string | null
  contract: ContractBrief | null
}

export interface TimeEntryWrite {
  start_date: string
  end_date: string
  description?: string | null
  contract_id: number | null
}

export interface TimeEntryUpdate {
  start_date?: string
  end_date?: string
  description?: string | null
  contract_id?: number | null
}

export interface BalanceRead {
  target_hours: number
  actual_hours: number
  balance: number
}

export interface BalancePeriod {
  period_start: string
  period_end: string
  target_hours: number
  actual_hours: number
  period_balance: number
  target_met: boolean
  cumulative_balance: number
}

export interface BalanceHistory {
  start_balance: number
  periods: BalancePeriod[]
}

export type BalanceGranularity = 'weekly' | 'monthly'
