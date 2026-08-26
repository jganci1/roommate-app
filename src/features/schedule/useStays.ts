import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Stay } from '../../types/database'
import { toDateKey } from '../../utils/dateUtils'

export type StayInput = Pick<Stay, 'label' | 'start_date' | 'end_date' | 'notes'>

export function useStays() {
  const [stays, setStays] = useState<Stay[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStays = async () => {
    const { data } = await supabase.from('stays').select('*').order('start_date', { ascending: true })
    setStays(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchStays()
  }, [])

  const overlapping = (start: string, end: string) =>
    stays.filter((s) => start <= s.end_date && end >= s.start_date)

  const addStay = async (input: StayInput) => {
    await supabase.from('stays').insert(input)
    await fetchStays()
  }

  const removeStay = async (id: string) => {
    await supabase.from('stays').delete().eq('id', id)
    await fetchStays()
  }

  const today = toDateKey(new Date())
  const currentStay = stays.find((s) => s.start_date <= today && s.end_date >= today) ?? null
  const nextStay = stays.find((s) => s.start_date > today) ?? null

  return { stays, loading, addStay, removeStay, overlapping, currentStay, nextStay }
}
