import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { SupplyItem } from '../../types/database'

export function useSupplyItems() {
  const [items, setItems] = useState<SupplyItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = async () => {
    const { data } = await supabase
      .from('supply_items')
      .select('*')
      .order('purchased', { ascending: true })
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()

    const channel = supabase
      .channel('supply-items-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'supply_items' },
        () => fetchItems(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const addItem = async (name: string, quantity: number) => {
    await supabase.from('supply_items').insert({ name, quantity })
  }

  const togglePurchased = async (item: SupplyItem, userId: string) => {
    await supabase
      .from('supply_items')
      .update(
        item.purchased
          ? { purchased: false, purchased_by: null, purchased_at: null }
          : { purchased: true, purchased_by: userId, purchased_at: new Date().toISOString() },
      )
      .eq('id', item.id)
  }

  const removeItem = async (id: string) => {
    await supabase.from('supply_items').delete().eq('id', id)
  }

  return { items, loading, addItem, togglePurchased, removeItem }
}
