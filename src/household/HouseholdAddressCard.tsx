import { useState, type FormEvent } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../auth/useAuth'
import { supabase } from '../lib/supabaseClient'
import { geocodeAddress } from '../features/weather/geocode'

export function HouseholdAddressCard() {
  const { household, refreshProfile } = useAuth()
  const [input, setInput] = useState(household?.address ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weatherLocation, setWeatherLocation] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const address = input.trim()
      const geocoded = await geocodeAddress(address)
      const { error: rpcError } = await supabase.rpc('update_household_address', {
        new_address: address,
        new_latitude: geocoded.latitude,
        new_longitude: geocoded.longitude,
      })
      if (rpcError) throw rpcError
      setWeatherLocation(geocoded.label)
      await refreshProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">House address</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Shown to your household and used for local weather. A city or zip geocodes directly; a
        full street address falls back to its city/state for the weather lookup.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Austin, TX or 123 Main St, Austin, TX"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <Button type="submit" disabled={submitting || !input.trim()}>
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {household?.address && !error && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Currently set to: {household.address}
          {weatherLocation && <> — weather is pulled for {weatherLocation}</>}
        </p>
      )}
    </Card>
  )
}
