import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchContracts } from '../api/contracts'
import { useAuth } from '../context/AuthContext'
import { ContractForm } from '../components/ContractForm'
import { DeleteContractDialog } from '../components/DeleteContractDialog'
import type { Contract } from '../api/types'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('de-DE')
}

function formatPeriod(contract: Contract) {
  const start = formatDate(contract.start_date)
  const end = contract.end_date ? formatDate(contract.end_date) : 'laufend'
  return `${start} – ${end}`
}

export function ContractsPage() {
  const { token } = useAuth()
  const [editingContract, setEditingContract] = useState<Contract | null | undefined>(undefined)
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null)

  const { data: contracts, isLoading, isError } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => fetchContracts(token!),
    enabled: token !== null,
  })

  const sortedContracts = [...(contracts ?? [])].sort((a, b) =>
    b.start_date.localeCompare(a.start_date),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Verträge</h1>
        <button
          onClick={() => setEditingContract(null)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Vertrag anlegen
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Lade…</p>}
      {isError && <p className="text-sm text-red-600">Verträge konnten nicht geladen werden.</p>}
      {!isLoading && sortedContracts.length === 0 && (
        <p className="text-sm text-gray-500">Noch keine Verträge angelegt.</p>
      )}

      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {sortedContracts.map((contract) => (
          <li key={contract.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">{contract.title}</p>
              <p className="text-sm text-gray-500">
                {formatPeriod(contract)}
                {contract.weekly_hours !== null && ` · ${contract.weekly_hours} Std./Woche`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingContract(contract)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                Bearbeiten
              </button>
              <button
                onClick={() => setDeletingContract(contract)}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
              >
                Löschen
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editingContract !== undefined && (
        <ContractForm contract={editingContract} onClose={() => setEditingContract(undefined)} />
      )}

      {deletingContract && (
        <DeleteContractDialog
          contract={deletingContract}
          onClose={() => setDeletingContract(null)}
        />
      )}
    </div>
  )
}
