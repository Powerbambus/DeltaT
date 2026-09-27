import type { Contract } from '../api/types'

// a contract counts as active if it has no end date, or that end date hasn't passed yet
export function isContractActive(contract: Pick<Contract, 'end_date'>): boolean {
  if (contract.end_date === null) return true
  return contract.end_date >= new Date().toISOString().slice(0, 10)
}
