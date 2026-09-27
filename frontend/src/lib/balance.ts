export function formatHours(hours: number): string {
  return `${hours.toFixed(1)} h`
}

export function formatBalance(hours: number): string {
  const sign = hours > 0 ? '+' : ''
  return `${sign}${hours.toFixed(1)} h`
}

export const balanceTone = {
  positive: {
    text: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    chartLine: '#16a34a',
  },
  negative: {
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    chartLine: '#dc2626',
  },
} as const

export function toneFor(balance: number) {
  return balance >= 0 ? balanceTone.positive : balanceTone.negative
}
