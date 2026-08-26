import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { HouseGuide } from '../../types/database'

export type HouseGuideInput = Pick<
  HouseGuide,
  'wifi_network' | 'wifi_password' | 'door_code' | 'house_rules' | 'local_tips' | 'emergency_info'
>

export function useHouseGuide() {
  const [guide, setGuide] = useState<HouseGuide | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchGuide = async () => {
    const { data } = await supabase.from('house_guide').select('*').maybeSingle()
    setGuide(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchGuide()
  }, [])

  const save = async (input: HouseGuideInput) => {
    if (guide) {
      await supabase.from('house_guide').update(input).eq('id', guide.id)
    } else {
      await supabase.from('house_guide').insert(input)
    }
    await fetchGuide()
  }

  return { guide, loading, save }
}
