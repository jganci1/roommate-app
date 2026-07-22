import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { DayStatus, Profile } from '../../types/database'
import { toDateKey } from '../../utils/dateUtils'

export function useDayStatus(weekDays: Date[]) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [statuses, setStatuses] = useState<DayStatus[]>([])
  const [loading, setLoading] = useState(true)

  const fromKey = toDateKey(weekDays[0])
  const toKey = toDateKey(weekDays[weekDays.length - 1])

  const fetchData = async () => {
    setLoading(true)
    const [profilesRes, statusRes] = await Promise.all([
      supabase.from('profiles').select('*').order('display_name', { ascending: true }),
      supabase.from('day_status').select('*').gte('date', fromKey).lte('date', toKey),
    ])
    setProfiles(profilesRes.data ?? [])
    setStatuses(statusRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromKey, toKey])

  const statusFor = (userId: string, dateKey: string): 'home' | 'away' =>
    statuses.find((s) => s.user_id === userId && s.date === dateKey)?.status ?? 'home'

  const toggleOwnStatus = async (userId: string, dateKey: string) => {
    const current = statusFor(userId, dateKey)
    const next = current === 'home' ? 'away' : 'home'
    await supabase
      .from('day_status')
      .upsert({ user_id: userId, date: dateKey, status: next }, { onConflict: 'user_id,date' })
    await fetchData()
  }

  return { profiles, loading, statusFor, toggleOwnStatus }
}
