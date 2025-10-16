import { create } from 'zustand'
import type { TimerStore } from '../types'

export const useTimerStore = create<TimerStore>(set => ({
  duration: 1200, // 20 minutes default
  isRunning: false,
  startTime: null,

  start: () =>
    set(state => ({
      isRunning: true,
      startTime: state.startTime || Date.now(),
    })),

  pause: () =>
    set(() => ({
      isRunning: false,
    })),

  reset: () =>
    set(() => ({
      isRunning: false,
      startTime: null,
    })),

  setDuration: (duration: number) =>
    set(() => ({
      duration,
      isRunning: false,
      startTime: null,
    })),
}))
