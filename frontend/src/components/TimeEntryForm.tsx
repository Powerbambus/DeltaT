import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTimeEntry, updateTimeEntry } from '../api/timeEntries'
import { fetchContracts } from '../api/contracts'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../lib/datetime'
import { isContractActive } from '../lib/contracts'
import type { TimeEntry, TimeEntryUpdate, TimeEntryWrite } from '../api/types'

interface TimeEntryFormProps {
  entry: TimeEntry | null
  onClose: () => void
}

interface FormState {
  start_date: string
  end_date: string
  description: string
  contract_id: string
}

function toFormState(entry: TimeEntry | null): FormState {
  if (!entry) {
    return { start_date: '', end_date: '', description: '', contract_id: '' }
  }
  return {
    start_date: toDatetimeLocalValue(entry.start_date),
    end_date: toDatetimeLocalValue(entry.end_date),
    description: entry.description ?? '',
    contract_id: entry.contract?.id.toString() ?? '',
  }
}

export function TimeEntryForm({ entry, onClose }: TimeEntryFormProps) {
  const isEdit = entry !== null
  const [form, setForm] = useState<FormState>(() => toFormState(entry))
  const [validationError, setValidationError] = useState<string | null>(null)
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const { data: contracts } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => fetchContracts(token!),
    enabled: token !== null,
  })

  const sortedContracts = [...(contracts ?? [])].sort((a, b) => {
    const aActive = isContractActive(a)
    const bActive = isContractActive(b)
    if (aActive !== bActive) return aActive ? -1 : 1
    return b.start_date.localeCompare(a.start_date)
  })

  const mutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const update: TimeEntryUpdate = diffAgainstOriginal(form, entry)
        return updateTimeEntry(token!, entry.id, update)
      }

      const data: TimeEntryWrite = {
        start_date: fromDatetimeLocalValue(form.start_date),
        end_date: fromDatetimeLocalValue(form.end_date),
        description: form.description.trim() || null,
        contract_id: Number(form.contract_id),
      }
      return createTimeEntry(token!, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
      onClose()
    },
  })

  function validate(): string | null {
    if (!form.start_date) return 'Startzeit ist erforderlich.'
    if (!form.end_date) return 'Endzeit ist erforderlich.'
    if (form.end_date < form.start_date) return 'Endzeit darf nicht vor der Startzeit liegen.'
    if (!form.contract_id) return 'Vertrag ist erforderlich.'
    return null
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const error = validate()
    setValidationError(error)
    if (error) return
    mutation.mutate()
  }

  const contractWasClearedButCannotBeUnset =
    isEdit && entry.contract !== null && form.contract_id === ''

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Zeiteintrag bearbeiten' : 'Zeiteintrag anlegen'}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
              Start
            </label>
            <input
              id="start_date"
              type="datetime-local"
              required
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              Ende
            </label>
            <input
              id="end_date"
              type="datetime-local"
              required
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="contract_id" className="block text-sm font-medium text-gray-700">
            Vertrag
          </label>
          <select
            id="contract_id"
            required
            value={form.contract_id}
            onChange={(e) => setForm({ ...form, contract_id: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Bitte wählen…</option>
            {sortedContracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.title}
                {isContractActive(contract) ? '' : ' (beendet)'}
              </option>
            ))}
          </select>
        </div>

        {contractWasClearedButCannotBeUnset && (
          <p className="text-xs text-amber-600">
            Hinweis: Ein zugewiesener Vertrag kann aktuell nicht wieder entfernt werden
            (Backend-Einschränkung). Diese Änderung wird beim Speichern ignoriert.
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Beschreibung
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {(validationError || mutation.isError) && (
          <p className="text-sm text-red-600">
            {validationError ??
              (mutation.error instanceof ApiError
                ? mutation.error.message
                : 'Speichern fehlgeschlagen.')}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  )
}

function diffAgainstOriginal(form: FormState, original: TimeEntry): TimeEntryUpdate {
  const update: TimeEntryUpdate = {}

  const startDate = fromDatetimeLocalValue(form.start_date)
  if (startDate !== original.start_date) update.start_date = startDate

  const endDate = fromDatetimeLocalValue(form.end_date)
  if (endDate !== original.end_date) update.end_date = endDate

  const description = form.description.trim() || null
  if (description !== original.description) update.description = description

  const contractId = form.contract_id ? Number(form.contract_id) : null
  if (contractId !== (original.contract?.id ?? null)) update.contract_id = contractId

  return update
}
