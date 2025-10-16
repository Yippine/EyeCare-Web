import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StatsStore } from '../types'

export const useStatsStore = create<StatsStore>()(
  persist(
    set => ({
      totalSessions: 0,
      totalTime: 0,
      sessions: [],

      recordSession: (duration: number, type: string) =>
        set(state => ({
          totalSessions: state.totalSessions + 1,
          totalTime: state.totalTime + duration,
          sessions: [
            ...state.sessions,
            {
              id: crypto.randomUUID(),
              duration,
              timestamp: Date.now(),
              type,
            },
          ],
        })),

      clearStats: () =>
        set(() => ({
          totalSessions: 0,
          totalTime: 0,
          sessions: [],
        })),
    }),
    {
      name: 'eyecare-stats',
    }
  )
)
