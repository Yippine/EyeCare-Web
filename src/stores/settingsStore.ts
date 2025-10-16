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
      // Notification System settings (Increment 5)
      browserNotificationEnabled: true,
      audioEnabled: true,
      vibrationEnabled: true,
      audioVolume: 70,

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

      updateNotificationSettings: settings =>
        set(state => ({
          ...state,
          ...settings,
        })),
    }),
    {
      name: 'eyecare-settings',
    }
  )
)
