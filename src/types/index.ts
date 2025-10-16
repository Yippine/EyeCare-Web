// Timer Types
export interface TimerState {
  duration: number
  isRunning: boolean
  startTime: number | null
}

export interface TimerActions {
  start: () => void
  pause: () => void
  reset: () => void
  setDuration: (duration: number) => void
}

export type TimerStore = TimerState & TimerActions

// Stats Types
export interface Session {
  id: string
  duration: number
  timestamp: number
  type: string
}

export interface StatsState {
  totalSessions: number
  totalTime: number
  sessions: Session[]
}

export interface StatsActions {
  recordSession: (duration: number, type: string) => void
  clearStats: () => void
}

export type StatsStore = StatsState & StatsActions

// Settings Types
export interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  soundEnabled: boolean
  breakDuration: number
  workDuration: number
}

export interface SettingsActions {
  updateSettings: (settings: Partial<SettingsState>) => void
  toggleTheme: () => void
  toggleNotifications: () => void
}

export type SettingsStore = SettingsState & SettingsActions
