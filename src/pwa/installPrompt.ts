/**
 * Install Prompt Handler
 * Increment 6 (PWACapability)
 *
 * Handles beforeinstallprompt event and manages app installation flow
 */

import type {
  InstallPromptAPI,
  InstallState,
  BeforeInstallPromptEvent,
} from './types'

const STORAGE_KEY = 'pwa-install-state'
const PROMPT_COOLDOWN = 7 * 24 * 60 * 60 * 1000 // 7 days

class InstallPromptHandler implements InstallPromptAPI {
  private deferredPrompt: BeforeInstallPromptEvent | null = null
  private installState: InstallState = {
    prompted: false,
    installed: false,
    dismissed: false,
  }

  constructor() {
    this.loadState()
    this.setupListeners()
  }

  /**
   * Setup event listeners for install prompt and app installed events
   */
  private setupListeners(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      this.deferredPrompt = e as BeforeInstallPromptEvent

      console.log('[InstallPrompt] beforeinstallprompt event captured')
      console.log('[InstallPrompt] Platforms:', this.deferredPrompt.platforms)

      // Dispatch custom event for UI to react
      window.dispatchEvent(
        new CustomEvent('pwa-install-available', {
          detail: { canInstall: true },
        })
      )
    })

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('[InstallPrompt] App installed successfully')

      this.installState.installed = true
      this.deferredPrompt = null
      this.saveState()

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent('pwa-installed', {
          detail: { installed: true },
        })
      )
    })

    // Check if already installed (standalone mode)
    if (this.isInstalled() && !this.installState.installed) {
      this.installState.installed = true
      this.saveState()
    }
  }

  /**
   * Check if install prompt is available
   */
  canInstall(): boolean {
    // Don't prompt if already installed
    if (this.isInstalled()) {
      return false
    }

    // Don't prompt if no deferred prompt available
    if (!this.deferredPrompt) {
      return false
    }

    // Don't prompt if user dismissed recently (cooldown)
    if (
      this.installState.dismissed &&
      this.installState.lastPrompted &&
      Date.now() - this.installState.lastPrompted < PROMPT_COOLDOWN
    ) {
      return false
    }

    return true
  }

  /**
   * Show install prompt to user
   */
  async promptInstall(): Promise<void> {
    if (!this.canInstall()) {
      throw new Error('Install prompt not available')
    }

    if (!this.deferredPrompt) {
      throw new Error('No deferred prompt')
    }

    try {
      // Show the prompt
      await this.deferredPrompt.prompt()

      // Wait for user choice
      const { outcome } = await this.deferredPrompt.userChoice
      console.log('[InstallPrompt] User choice:', outcome)

      // Update state
      this.installState.prompted = true
      this.installState.lastPrompted = Date.now()

      if (outcome === 'accepted') {
        console.log('[InstallPrompt] User accepted install')
        // installed state will be set by appinstalled event
      } else {
        console.log('[InstallPrompt] User dismissed install')
        this.installState.dismissed = true
      }

      this.saveState()

      // Clear deferred prompt
      this.deferredPrompt = null

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent('pwa-install-prompted', {
          detail: { outcome, prompted: true },
        })
      )
    } catch (error) {
      console.error('[InstallPrompt] Error showing prompt:', error)
      throw error
    }
  }

  /**
   * Check if app is already installed
   * Detects standalone mode (PWA installed)
   */
  isInstalled(): boolean {
    // Check if running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean })
          .standalone === true) ||
      document.referrer.includes('android-app://')

    return isStandalone
  }

  /**
   * Get current install state
   */
  getState(): InstallState {
    return { ...this.installState }
  }

  /**
   * Reset install state (for testing)
   */
  resetState(): void {
    this.installState = {
      prompted: false,
      installed: false,
      dismissed: false,
    }
    this.saveState()
  }

  /**
   * Load install state from localStorage
   */
  private loadState(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        this.installState = JSON.parse(saved)
      }
    } catch (error) {
      console.warn('[InstallPrompt] Failed to load state:', error)
    }
  }

  /**
   * Save install state to localStorage
   */
  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.installState))
    } catch (error) {
      console.warn('[InstallPrompt] Failed to save state:', error)
    }
  }
}

// Singleton instance
export const installPrompt = new InstallPromptHandler()
