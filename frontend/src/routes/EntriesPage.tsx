import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTimeEntries } from '../api/timeEntries'
import { useAuth } from '../context/AuthContext'
import { TimeEntryForm } from '../components/TimeEntryForm'
import { DeleteTimeEntryDialog } from '../components/DeleteTimeEntryDialog'
import { formatDateTime, formatDuration } from '../lib/datetime'
import type { TimeEntry } from '../api/types'

export function EntriesPage() {
  const { token } = useAuth()
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null | undefined>(undefined)
  const [deletingEntry, setDeletingEntry] = useState<TimeEntry | null>(null)

  const { data: entries, isLoading, isError } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => fetchTimeEntries(token!),
    enabled: token !== null,
  })

  const sortedEntries = [...(entries ?? [])].sort((a, b) =>
    b.start_date.localeCompare(a.start_date),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Zeiteinträge</h1>
        <button
          onClick={() => setEditingEntry(null)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Zeiteintrag anlegen
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Lade…</p>}
      {isError && <p className="text-sm text-red-600">Zeiteinträge konnten nicht geladen werden.</p>}
      {!isLoading && sortedEntries.length === 0 && (
        <p className="text-sm text-gray-500">Noch keine Zeiteinträge erfasst.</p>
      )}

      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {sortedEntries.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">
                {formatDateTime(entry.start_date)} – {formatDateTime(entry.end_date)}
              </p>
              <p className="text-sm text-gray-500">
                {formatDuration(entry.duration)}
                {entry.contract && ` · ${entry.contract.title}`}
                {entry.description && ` · ${entry.description}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingEntry(entry)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                Bearbeiten
              </button>
              <button
                onClick={() => setDeletingEntry(entry)}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
              >
                Löschen
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editingEntry !== undefined && (
        <TimeEntryForm entry={editingEntry} onClose={() => setEditingEntry(undefined)} />
      )}

      {deletingEntry && (
        <DeleteTimeEntryDialog entry={deletingEntry} onClose={() => setDeletingEntry(null)} />
      )}
    </div>
  )
}
