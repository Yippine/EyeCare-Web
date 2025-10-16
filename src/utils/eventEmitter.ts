import type { TimerEvent, TimerEventListener } from '../types/events'
import { TimerEventType } from '../types/events'

/**
 * Simple event emitter for timer events
 * Follows Observer pattern for notification integration
 */
class EventEmitter {
  private listeners: Map<TimerEventType, Set<TimerEventListener>>

  constructor() {
    this.listeners = new Map()
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe(
    eventType: TimerEventType,
    listener: TimerEventListener
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    this.listeners.get(eventType)!.add(listener)

    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventType, listener)
    }
  }

  /**
   * Unsubscribe from a specific event type
   */
  unsubscribe(eventType: TimerEventType, listener: TimerEventListener): void {
    const eventListeners = this.listeners.get(eventType)
    if (eventListeners) {
      eventListeners.delete(listener)
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: TimerEvent): void {
    const eventListeners = this.listeners.get(event.type)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error)
        }
      })
    }
  }

  /**
   * Clear all listeners for a specific event type
   */
  clearListeners(eventType?: TimerEventType): void {
    if (eventType) {
      this.listeners.delete(eventType)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * Get count of listeners for an event type
   */
  getListenerCount(eventType: TimerEventType): number {
    return this.listeners.get(eventType)?.size || 0
  }
}

// Singleton instance
export const timerEventEmitter = new EventEmitter()

// Console logger for verification (acceptance criteria 8)
export const setupConsoleLogger = () => {
  const consoleListener: TimerEventListener = event => {
    console.log(
      `[TimerEvent] ${event.type}:`,
      `Phase=${event.payload.phase}`,
      `Duration=${event.payload.duration}s`,
      `Session=${event.payload.sessionId}`,
      `Time=${new Date(event.payload.timestamp).toLocaleTimeString()}`
    )
  }

  // Subscribe to all event types
  Object.values(TimerEventType).forEach(eventType => {
    timerEventEmitter.subscribe(eventType as TimerEventType, consoleListener)
  })
}
