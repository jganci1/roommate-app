import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { RequestItem, RequestStatus } from '../../types/database'

export function useRequests() {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()

    const channel = supabase
      .channel('requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () =>
        fetchRequests(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const addRequest = async (title: string, description: string) => {
    await supabase.from('requests').insert({ title, description: description || null })
  }

  const setStatus = async (id: string, status: RequestStatus) => {
    await supabase.from('requests').update({ status }).eq('id', id)
  }

  return { requests, loading, addRequest, setStatus }
}
