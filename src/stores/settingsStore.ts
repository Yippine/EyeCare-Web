import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SettingsStore } from '../types'

export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      theme: 'system',
      notifications: true,
      soundEnabled: true,
      breakDuration: 300, // 5 minutes
      workDuration: 1200, // 20 minutes

      updateSettings: settings =>
        set(state => ({
          ...state,
          ...settings,
        })),

      toggleTheme: () =>
        set(state => ({
          theme:
            state.theme === 'light'
              ? 'dark'
              : state.theme === 'dark'
                ? 'system'
                : 'light',
        })),

      toggleNotifications: () =>
        set(state => ({
          notifications: !state.notifications,
        })),
    }),
    {
      name: 'eyecare-settings',
    }
  )
)
