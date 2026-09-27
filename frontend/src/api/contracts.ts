import { apiRequest } from './client'
import type { Contract, ContractUpdate, ContractWrite } from './types'

export function fetchContracts(token: string): Promise<Contract[]> {
  return apiRequest<Contract[]>('/contracts/', { token })
}

export function createContract(token: string, data: ContractWrite): Promise<Contract> {
  return apiRequest<Contract>('/contracts/', { method: 'POST', json: data, token })
}

export function updateContract(
  token: string,
  contractId: number,
  data: ContractUpdate,
): Promise<Contract> {
  return apiRequest<Contract>(`/contracts/${contractId}`, { method: 'PATCH', json: data, token })
}

export function deleteContract(
  token: string,
  contractId: number,
  deleteEntries: boolean,
): Promise<{ status: number; detail: string }> {
  return apiRequest(`/contracts/${contractId}?delete_entries=${deleteEntries}`, {
    method: 'DELETE',
    token,
  })
}
