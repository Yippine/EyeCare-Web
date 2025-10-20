/**
 * Update Flow Controller
 * Increment 6 (PWACapability)
 *
 * Manages ServiceWorker updates and version changes
 */

import type { UpdateFlowAPI, UpdateState } from './types'

class UpdateFlowController implements UpdateFlowAPI {
  private updateState: UpdateState = {
    updateAvailable: false,
    installing: false,
    registration: null,
  }

  constructor() {
    this.setupListeners()
  }

  /**
   * Setup ServiceWorker update listeners
   */
  private async setupListeners(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[UpdateFlow] ServiceWorker not supported')
      return
    }

    try {
      // Get existing registration
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        console.log('[UpdateFlow] No ServiceWorker registration found')
        return
      }

      this.updateState.registration = registration

      // Listen for updatefound event
      registration.addEventListener('updatefound', () => {
        console.log('[UpdateFlow] Update found')
        const newWorker = registration.installing

        if (!newWorker) return

        this.updateState.installing = true

        // Listen for state changes of new worker
        newWorker.addEventListener('statechange', () => {
          console.log('[UpdateFlow] New worker state:', newWorker.state)

          if (newWorker.state === 'installed') {
            // New worker installed
            if (navigator.serviceWorker.controller) {
              // There's an old worker, update is available
              console.log('[UpdateFlow] Update available')
              this.updateState.updateAvailable = true
              this.updateState.installing = false

              // Dispatch custom event for UI
              window.dispatchEvent(
                new CustomEvent('pwa-update-available', {
                  detail: { updateAvailable: true },
                })
              )
            } else {
              // First install, no update needed
              console.log('[UpdateFlow] First install')
              this.updateState.installing = false
            }
          }
        })
      })

      // Listen for controllerchange (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[UpdateFlow] Controller changed, new SW activated')

        // Dispatch custom event
        window.dispatchEvent(
          new CustomEvent('pwa-controller-changed', {
            detail: { reloadRequired: true },
          })
        )
      })
    } catch (error) {
      console.error('[UpdateFlow] Failed to setup listeners:', error)
    }
  }

  /**
   * Manually check for updates
   */
  async checkForUpdates(): Promise<boolean> {
    if (!this.updateState.registration) {
      console.warn('[UpdateFlow] No registration available')
      return false
    }

    try {
      console.log('[UpdateFlow] Checking for updates...')
      await this.updateState.registration.update()
      return this.updateState.updateAvailable
    } catch (error) {
      console.error('[UpdateFlow] Update check failed:', error)
      return false
    }
  }

  /**
   * Apply the update (skip waiting and reload)
   */
  applyUpdate(): void {
    if (!this.updateState.registration?.waiting) {
      console.warn('[UpdateFlow] No waiting worker to activate')
      return
    }

    console.log('[UpdateFlow] Applying update...')

    // Send skip waiting message to waiting worker
    this.updateState.registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Listen for controller change, then reload
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true

      console.log('[UpdateFlow] Reloading page for new version')
      window.location.reload()
    })
  }

  /**
   * Get current update state
   */
  getState(): UpdateState {
    return { ...this.updateState }
  }

  /**
   * Setup periodic update checks
   */
  setupPeriodicUpdateCheck(intervalMs: number = 60 * 60 * 1000): void {
    console.log('[UpdateFlow] Setting up periodic update checks:', intervalMs)

    // Check immediately
    this.checkForUpdates()

    // Check periodically
    setInterval(() => {
      this.checkForUpdates()
    }, intervalMs)
  }
}

// Singleton instance
export const updateFlow = new UpdateFlowController()
