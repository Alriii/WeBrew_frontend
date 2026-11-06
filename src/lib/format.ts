export const money = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const count = new Intl.NumberFormat()

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(undefined, options ?? {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function categoryLabel(category: string) {
  return category === 'milk_tea' ? 'Milk tea' : 'Coffee'
}

export function formatHour(hour: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    hour12: true,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2020, 0, 1, hour)))
}
