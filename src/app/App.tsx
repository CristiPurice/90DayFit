import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { getAllSettings, type Settings } from '@/data/repo/settings'
import { shouldLock, useLock } from '@/app/store/lock'
import { DEFAULT_ROUTE } from '@/app/routes'
import { TabBar } from '@/ui/TabBar'
import { LockScreen } from '@/features/lock/LockScreen'
import { Onboarding } from '@/features/onboarding/Onboarding'
import { TodayPage } from '@/features/today/TodayPage'
import { ProgressPage } from '@/features/progress/ProgressPage'
import { MealsPage } from '@/features/meals/MealsPage'
import { WorkoutsPage } from '@/features/workouts/WorkoutsPage'
import { RecipesPage } from '@/features/recipes/RecipesPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { UpdateBanner } from '@/app/UpdateBanner'
import { useTheme } from '@/app/store/theme'

type Boot = { state: 'loading' } | { state: 'ready'; settings: Partial<Settings> }

/** Blochează aplicația când revine din fundal după timeout. */
function useAutoLock(timeoutMin: number) {
  const touch = useLock((s) => s.touch)
  const lock = useLock((s) => s.lock)
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'hidden') {
        touch()
        return
      }
      const { lastActiveAt, locked } = useLock.getState()
      if (!locked && shouldLock(lastActiveAt, Date.now(), timeoutMin * 60 * 1000)) lock()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [timeoutMin, touch, lock])
}

function Shell() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={DEFAULT_ROUTE} replace />} />
        <Route path="/azi" element={<TodayPage />} />
        <Route path="/progres" element={<ProgressPage />} />
        <Route path="/mese" element={<MealsPage />} />
        <Route path="/sala" element={<WorkoutsPage />} />
        <Route path="/retete" element={<RecipesPage />} />
        <Route path="/setari" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} />
      </Routes>
      <UpdateBanner />
      <TabBar />
    </>
  )
}

export function App() {
  const [boot, setBoot] = useState<Boot>({ state: 'loading' })
  const locked = useLock((s) => s.locked)

  useEffect(() => {
    let alive = true
    getAllSettings().then((settings) => {
      useTheme.getState().load(settings.theme)
      if (alive) setBoot({ state: 'ready', settings })
    })
    return () => {
      alive = false
    }
  }, [])

  const timeoutMin = boot.state === 'ready' ? (boot.settings.lockTimeoutMin ?? 5) : 5
  useAutoLock(timeoutMin)

  if (boot.state === 'loading') {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Se încarcă</p>
      </main>
    )
  }

  const { settings } = boot
  if (!settings.onboarded || !settings.pinHash || !settings.pinSalt) {
    return <Onboarding onDone={() => getAllSettings().then((s) => setBoot({ state: 'ready', settings: s }))} />
  }

  if (locked) {
    return <LockScreen pinHash={settings.pinHash} pinSalt={settings.pinSalt} />
  }

  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}
