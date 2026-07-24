import { addYears, format, isBefore, setYear, startOfDay } from 'date-fns'
import type { Event } from '../../types/database'

function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`)
}

// For a recurring event (birthday, anniversary), returns the next time it
// falls on its month/day from `from` onward. For a one-off event, just
// returns its date (which may be in the past).
export function nextOccurrence(event: Event, from: Date): Date {
  const original = parseDateOnly(event.event_date)
  if (!event.recurs_yearly) return original

  const today = startOfDay(from)
  let candidate = setYear(original, today.getFullYear())
  if (isBefore(candidate, today)) {
    candidate = addYears(candidate, 1)
  }
  return candidate
}

export function daysUntil(date: Date, from: Date): number {
  const diff = startOfDay(date).getTime() - startOfDay(from).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function eventDateLabel(event: Event): string {
  return format(parseDateOnly(event.event_date), event.recurs_yearly ? 'MMMM d' : 'MMMM d, yyyy')
}
