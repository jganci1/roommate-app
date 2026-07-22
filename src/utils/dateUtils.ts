import { addDays, addWeeks, format, startOfWeek } from 'date-fns'

export function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function shiftWeek(anchor: Date, delta: number): Date {
  return addWeeks(anchor, delta)
}

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function weekRangeLabel(days: Date[]): string {
  return `${format(days[0], 'MMM d')} – ${format(days[6], 'MMM d, yyyy')}`
}

export function monthKey(date: Date): string {
  return format(date, 'yyyy-MM-01')
}

export function monthLabel(dateStr: string): string {
  return format(new Date(`${dateStr}T00:00:00`), 'MMMM yyyy')
}
