import { useEffect, useState } from 'react'
import { addDays } from 'date-fns'
import { supabase } from '../../lib/supabaseClient'
import type { Bill } from '../../types/database'
import { toDateKey } from '../../utils/dateUtils'

export function useUpcomingBills(days: number) {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = toDateKey(new Date())
    const end = toDateKey(addDays(new Date(), days))
    supabase
      .from('bills')
      .select('*')
      .gte('due_date', today)
      .lte('due_date', end)
      .order('due_date', { ascending: true })
      .then(({ data }) => {
        setBills(data ?? [])
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  return { bills, loading }
}
