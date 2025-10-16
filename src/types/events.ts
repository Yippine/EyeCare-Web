// Timer Event Types
export enum TimerEventType {
  WORK_START = 'WORK_START',
  WORK_COMPLETE = 'WORK_COMPLETE',
  BREAK_START = 'BREAK_START',
  BREAK_COMPLETE = 'BREAK_COMPLETE',
  EXERCISE_COMPLETE = 'EXERCISE_COMPLETE',
}

export interface TimerEventPayload {
  timestamp: number
  duration: number
  sessionId: number
  phase: 'work' | 'break' | 'exercise'
  metadata?: Record<string, unknown>
}

export interface TimerEvent {
  type: TimerEventType
  payload: TimerEventPayload
}

export type TimerEventListener = (event: TimerEvent) => void
