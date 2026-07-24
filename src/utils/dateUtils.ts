import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export function getMonthGridDays(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function shiftMonth(anchor: Date, delta: number): Date {
  return addMonths(anchor, delta)
}

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function monthYearLabel(date: Date): string {
  return format(date, 'MMMM yyyy')
}

export function monthKey(date: Date): string {
  return format(date, 'yyyy-MM-01')
}

export function monthLabel(dateStr: string): string {
  return format(new Date(`${dateStr}T00:00:00`), 'MMMM yyyy')
}
