import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useHouseGuide, type HouseGuideInput } from './useHouseGuide'

const emptyForm: HouseGuideInput = {
  wifi_network: '',
  wifi_password: '',
  door_code: '',
  house_rules: '',
  local_tips: '',
  emergency_info: '',
}

const fieldClass =
  'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

export function GuidePage() {
  const { guide, loading, save } = useHouseGuide()
  const [form, setForm] = useState<HouseGuideInput>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (guide) {
      setForm({
        wifi_network: guide.wifi_network ?? '',
        wifi_password: guide.wifi_password ?? '',
        door_code: guide.door_code ?? '',
        house_rules: guide.house_rules ?? '',
        local_tips: guide.local_tips ?? '',
        emergency_info: guide.emergency_info ?? '',
      })
    }
  }, [guide])

  const field = (key: keyof HouseGuideInput) => ({
    value: form[key] ?? '',
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSaved(false)
      setForm((f) => ({ ...f, [key]: e.target.value }))
    },
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await save({
      wifi_network: form.wifi_network?.trim() || null,
      wifi_password: form.wifi_password?.trim() || null,
      door_code: form.door_code?.trim() || null,
      house_rules: form.house_rules?.trim() || null,
      local_tips: form.local_tips?.trim() || null,
      emergency_info: form.emergency_info?.trim() || null,
    })
    setSaving(false)
    setSaved(true)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Spinner />
        <span className="text-sm text-slate-500 dark:text-slate-400">Loading house guide…</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">House guide</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Everything the next crew needs before they arrive. Anyone can edit this.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Card className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Wifi</p>
          <input placeholder="Network name" {...field('wifi_network')} className={fieldClass} />
          <input placeholder="Password" {...field('wifi_password')} className={fieldClass} />
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Getting in</p>
          <input placeholder="Door code / lockbox code" {...field('door_code')} className={fieldClass} />
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">House rules</p>
          <textarea
            placeholder="Trash day, quiet hours, shoes off, thermostat settings…"
            rows={4}
            {...field('house_rules')}
            className={fieldClass}
          />
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Local tips</p>
          <textarea
            placeholder="Favorite restaurants, best beach access, parking tricks…"
            rows={4}
            {...field('local_tips')}
            className={fieldClass}
          />
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Emergency info</p>
          <textarea
            placeholder="Nearest hospital, property manager, breaker box location…"
            rows={3}
            {...field('emergency_info')}
            className={fieldClass}
          />
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save guide'}
          </Button>
          {saved && <span className="text-sm text-teal-600 dark:text-teal-400">Saved</span>}
        </div>
      </form>
    </div>
  )
}
