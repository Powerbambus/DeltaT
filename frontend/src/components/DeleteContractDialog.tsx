import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteContract } from '../api/contracts'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Contract } from '../api/types'

interface DeleteContractDialogProps {
  contract: Contract
  onClose: () => void
}

export function DeleteContractDialog({ contract, onClose }: DeleteContractDialogProps) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (deleteEntries: boolean) => deleteContract(token!, contract.id, deleteEntries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">
          Vertrag „{contract.title}“ löschen
        </h2>
        <p className="text-sm text-gray-600">
          Was soll mit den Zeiteinträgen passieren, die diesem Vertrag zugeordnet sind?
        </p>

        <div className="space-y-2">
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(false)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="block font-medium text-gray-900">Nur Vertrag entkoppeln</span>
            <span className="block text-gray-500">
              Zeiteinträge bleiben erhalten, verlieren aber die Vertragszuordnung.
            </span>
          </button>

          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(true)}
            className="w-full rounded-md border border-red-300 px-3 py-2 text-left text-sm hover:bg-red-50 disabled:opacity-50"
          >
            <span className="block font-medium text-red-700">
              Vertrag und Zeiteinträge löschen
            </span>
            <span className="block text-gray-500">
              Alle zugehörigen Zeiteinträge werden unwiderruflich mitgelöscht.
            </span>
          </button>
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-600">
            {mutation.error instanceof ApiError ? mutation.error.message : 'Löschen fehlgeschlagen.'}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
