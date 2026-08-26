import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { JournalEntry } from '../../types/database'

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const addEntry = async (body: string) => {
    await supabase.from('journal_entries').insert({ body })
    await fetchEntries()
  }

  const removeEntry = async (id: string) => {
    await supabase.from('journal_entries').delete().eq('id', id)
    await fetchEntries()
  }

  return { entries, loading, addEntry, removeEntry }
}
