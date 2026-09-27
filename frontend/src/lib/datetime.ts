// datetime-local inputs need "YYYY-MM-DDTHH:mm" in local time (no timezone suffix)
export function toDatetimeLocalValue(isoString: string): string {
  const date = new Date(isoString)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// the backend's datetime field has no timezone; send local wall-clock time as-is
export function fromDatetimeLocalValue(value: string): string {
  return value.length === 16 ? `${value}:00` : value
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`
}

export function toDateInputValue(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function monthsAgoISO(months: number, from: Date = new Date()): string {
  const date = new Date(from)
  date.setMonth(date.getMonth() - months)
  return toDateInputValue(date)
}

export function todayISO(): string {
  return toDateInputValue(new Date())
}
