import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Profile } from '../types/database'

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .then(({ data }) => setProfiles(data ?? []))
  }, [])

  const nameFor = (userId: string | null | undefined) =>
    profiles.find((p) => p.id === userId)?.display_name ?? 'Someone'

  return { profiles, nameFor }
}
