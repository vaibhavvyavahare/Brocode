import { useEffect, useMemo, useState } from 'react'

type GlobalSettings = {
  rateFloor: number
  currency: string
}

const STORAGE_KEY = 'blindspot-global-settings'

const DEFAULT_SETTINGS: GlobalSettings = {
  rateFloor: 500,
  currency: '₹',
}

function readSettings(): GlobalSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS

    const parsed = JSON.parse(raw) as Partial<GlobalSettings>
    return {
      rateFloor: Number(parsed.rateFloor ?? DEFAULT_SETTINGS.rateFloor),
      currency: String(parsed.currency ?? DEFAULT_SETTINGS.currency),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function useGlobalSettings() {
  const [settings, setSettings] = useState<GlobalSettings>(() => readSettings())

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // No-op if storage is unavailable.
    }
  }, [settings])

  const api = useMemo(() => ({
    settings,
    setRateFloor: (rateFloor: number) => setSettings((prev) => ({ ...prev, rateFloor: Number.isFinite(rateFloor) ? rateFloor : prev.rateFloor })),
    setCurrency: (currency: string) => setSettings((prev) => ({ ...prev, currency: currency || prev.currency })),
  }), [settings])

  return api
}
