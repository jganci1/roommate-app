import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { HandoffNote } from '../../types/database'

export function useHandoffNotes() {
  const [notes, setNotes] = useState<HandoffNote[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = async () => {
    const { data } = await supabase
      .from('handoff_notes')
      .select('*')
      .order('created_at', { ascending: false })
    setNotes(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const addNote = async (note: string) => {
    await supabase.from('handoff_notes').insert({ note })
    await fetchNotes()
  }

  const setResolved = async (id: string, resolved: boolean) => {
    await supabase.from('handoff_notes').update({ resolved }).eq('id', id)
    await fetchNotes()
  }

  const removeNote = async (id: string) => {
    await supabase.from('handoff_notes').delete().eq('id', id)
    await fetchNotes()
  }

  const unresolved = notes.filter((n) => !n.resolved)
  const resolved = notes.filter((n) => n.resolved)

  return { notes, unresolved, resolved, loading, addNote, setResolved, removeNote }
}
