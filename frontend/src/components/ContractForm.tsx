import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createContract, updateContract } from '../api/contracts'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Contract, ContractUpdate, ContractWrite } from '../api/types'

interface ContractFormProps {
  contract: Contract | null
  onClose: () => void
}

interface FormState {
  title: string
  start_date: string
  end_date: string
  weekly_hours: string
  description: string
}

function toFormState(contract: Contract | null): FormState {
  if (!contract) {
    return { title: '', start_date: '', end_date: '', weekly_hours: '', description: '' }
  }
  return {
    title: contract.title,
    start_date: contract.start_date,
    end_date: contract.end_date ?? '',
    weekly_hours: contract.weekly_hours?.toString() ?? '',
    description: contract.description ?? '',
  }
}

export function ContractForm({ contract, onClose }: ContractFormProps) {
  const isEdit = contract !== null
  const [form, setForm] = useState<FormState>(() => toFormState(contract))
  const [validationError, setValidationError] = useState<string | null>(null)
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const update: ContractUpdate = diffAgainstOriginal(form, contract)
        return updateContract(token!, contract.id, update)
      }

      const data: ContractWrite = {
        title: form.title.trim(),
        start_date: form.start_date,
        end_date: form.end_date || null,
        weekly_hours: form.weekly_hours ? Number(form.weekly_hours) : null,
        description: form.description.trim() || null,
      }
      return createContract(token!, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      onClose()
    },
  })

  function validate(): string | null {
    if (!form.title.trim()) return 'Titel ist erforderlich.'
    if (!form.start_date) return 'Startdatum ist erforderlich.'
    if (form.end_date && form.end_date < form.start_date) {
      return 'Enddatum darf nicht vor dem Startdatum liegen.'
    }
    if (form.weekly_hours && Number(form.weekly_hours) < 0) {
      return 'Wochenstunden dürfen nicht negativ sein.'
    }
    return null
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const error = validate()
    setValidationError(error)
    if (error) return
    mutation.mutate()
  }

  const endDateWasClearedButCannotBeUnset =
    isEdit && contract.end_date !== null && form.end_date === ''

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Vertrag bearbeiten' : 'Vertrag anlegen'}
        </h2>

        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titel
          </label>
          <input
            id="title"
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
              Startdatum
            </label>
            <input
              id="start_date"
              type="date"
              required
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              Enddatum
            </label>
            <input
              id="end_date"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400">Leer lassen für laufenden Vertrag.</p>
          </div>
        </div>

        {endDateWasClearedButCannotBeUnset && (
          <p className="text-xs text-amber-600">
            Hinweis: Ein bereits gesetztes Enddatum kann aktuell nicht wieder entfernt werden
            (Backend-Einschränkung). Diese Änderung wird beim Speichern ignoriert.
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="weekly_hours" className="block text-sm font-medium text-gray-700">
            Wochenstunden
          </label>
          <input
            id="weekly_hours"
            type="number"
            step="0.5"
            min="0"
            value={form.weekly_hours}
            onChange={(e) => setForm({ ...form, weekly_hours: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

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

function diffAgainstOriginal(form: FormState, original: Contract): ContractUpdate {
  const update: ContractUpdate = {}

  const title = form.title.trim()
  if (title !== original.title) update.title = title

  if (form.start_date !== original.start_date) update.start_date = form.start_date

  const endDate = form.end_date || null
  if (endDate !== original.end_date) update.end_date = endDate

  const weeklyHours = form.weekly_hours ? Number(form.weekly_hours) : null
  if (weeklyHours !== original.weekly_hours) update.weekly_hours = weeklyHours

  const description = form.description.trim() || null
  if (description !== original.description) update.description = description

  return update
}
