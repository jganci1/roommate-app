import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Profile } from '../../types/database'

export function useCheckinStatus() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('display_name', { ascending: true })
    setProfiles(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()

    const channel = supabase
      .channel('profiles-checkin-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchProfiles(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const setStatus = async (userId: string, isHome: boolean) => {
    await supabase
      .from('profiles')
      .update({ is_home: isHome, status_updated_at: new Date().toISOString() })
      .eq('id', userId)
  }

  return { profiles, loading, setStatus }
}
