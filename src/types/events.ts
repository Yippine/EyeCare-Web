// Timer Event Types
export enum TimerEventType {
  WORK_START = 'WORK_START',
  WORK_COMPLETE = 'WORK_COMPLETE',
  BREAK_START = 'BREAK_START',
  BREAK_COMPLETE = 'BREAK_COMPLETE',
}

export interface TimerEventPayload {
  timestamp: number
  duration: number
  sessionId: number
  phase: 'work' | 'break'
}

export interface TimerEvent {
  type: TimerEventType
  payload: TimerEventPayload
}

export type TimerEventListener = (event: TimerEvent) => void
