import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTimeEntry } from '../api/timeEntries'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../lib/datetime'
import type { TimeEntry } from '../api/types'

interface DeleteTimeEntryDialogProps {
  entry: TimeEntry
  onClose: () => void
}

export function DeleteTimeEntryDialog({ entry, onClose }: DeleteTimeEntryDialogProps) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteTimeEntry(token!, entry.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">Zeiteintrag löschen</h2>
        <p className="text-sm text-gray-600">
          Eintrag vom {formatDateTime(entry.start_date)} wirklich löschen?
        </p>

        {mutation.isError && (
          <p className="text-sm text-red-600">
            {mutation.error instanceof ApiError ? mutation.error.message : 'Löschen fehlgeschlagen.'}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Löschen…' : 'Löschen'}
          </button>
        </div>
      </div>
    </div>
  )
}
