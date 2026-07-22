import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Bill } from '../../types/database'

export function useBills(monthKey: string) {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBills = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bills')
      .select('*')
      .eq('month', monthKey)
      .order('created_at', { ascending: true })
    setBills(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchBills()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey])

  const addBill = async (category: string, amount: number, notes: string) => {
    await supabase
      .from('bills')
      .insert({ category, amount, month: monthKey, notes: notes || null })
    await fetchBills()
  }

  const removeBill = async (id: string) => {
    await supabase.from('bills').delete().eq('id', id)
    await fetchBills()
  }

  const total = bills.reduce((sum, b) => sum + Number(b.amount), 0)

  return { bills, loading, addBill, removeBill, total }
}
