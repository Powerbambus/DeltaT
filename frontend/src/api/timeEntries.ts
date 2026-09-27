import { apiRequest } from './client'
import type { TimeEntry, TimeEntryUpdate, TimeEntryWrite } from './types'

export function fetchTimeEntries(token: string): Promise<TimeEntry[]> {
  return apiRequest<TimeEntry[]>('/time_entries/', { token })
}

export function createTimeEntry(token: string, data: TimeEntryWrite): Promise<TimeEntry> {
  return apiRequest<TimeEntry>('/time_entries/', { method: 'POST', json: data, token })
}

export function updateTimeEntry(
  token: string,
  entryId: number,
  data: TimeEntryUpdate,
): Promise<TimeEntry> {
  return apiRequest<TimeEntry>(`/time_entries/${entryId}`, { method: 'PATCH', json: data, token })
}

export function deleteTimeEntry(
  token: string,
  entryId: number,
): Promise<{ status: number; detail: string }> {
  return apiRequest(`/time_entries/${entryId}`, { method: 'DELETE', token })
}
