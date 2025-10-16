// Timer Types
export enum TimerMode {
  IDLE = 'IDLE',
  WORKING = 'WORKING',
  BREAK_REMINDER = 'BREAK_REMINDER',
  PAUSED = 'PAUSED',
}

export interface TimerState {
  // Legacy fields (preserved for compatibility)
  duration: number
  isRunning: boolean
  startTime: number | null

  // New state machine fields
  timerMode: TimerMode
  elapsedTime: number // Seconds elapsed in current phase
  sessionCount: number // Completed work+break cycles
  currentPhase: 'work' | 'break' | null
  startTimestamp: number | null // High-resolution timestamp for RAF
}

export interface TimerActions {
  // Legacy actions (preserved)
  start: () => void
  pause: () => void
  reset: () => void
  setDuration: (duration: number) => void

  // New state machine actions
  startWork: () => void
  startBreak: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  incrementSession: () => void
  updateElapsedTime: (elapsed: number) => void
  transitionToBreak: () => void
  transitionToIdle: () => void
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
  // Notification System settings (Increment 5)
  browserNotificationEnabled: boolean
  audioEnabled: boolean
  vibrationEnabled: boolean
  audioVolume: number // 0-100
}

export interface SettingsActions {
  updateSettings: (settings: Partial<SettingsState>) => void
  toggleTheme: () => void
  toggleNotifications: () => void
  updateNotificationSettings: (
    settings: Partial<
      Pick<
        SettingsState,
        | 'browserNotificationEnabled'
        | 'audioEnabled'
        | 'vibrationEnabled'
        | 'audioVolume'
      >
    >
  ) => void
}

export type SettingsStore = SettingsState & SettingsActions
