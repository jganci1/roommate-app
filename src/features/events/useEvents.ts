import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Event } from '../../types/database'

export type EventInput = Pick<Event, 'title' | 'event_date' | 'recurs_yearly' | 'notes'>

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
    setEvents(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const addEvent = async (input: EventInput) => {
    await supabase.from('events').insert(input)
    await fetchEvents()
  }

  const removeEvent = async (id: string) => {
    await supabase.from('events').delete().eq('id', id)
    await fetchEvents()
  }

  return { events, loading, addEvent, removeEvent }
}
