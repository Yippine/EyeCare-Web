/**
 * PWA TypeScript Type Definitions
 * Increment 6 (PWACapability)
 */

/**
 * Install Prompt API
 * Handles beforeinstallprompt event and app installation
 */
export interface InstallPromptAPI {
  /** Check if app can be installed (prompt available) */
  canInstall(): boolean
  /** Show the install prompt to user */
  promptInstall(): Promise<void>
  /** Check if app is already installed */
  isInstalled(): boolean
  /** Get current install state */
  getState(): InstallState
}

/**
 * Install state tracking
 */
export interface InstallState {
  /** Has the prompt been shown to user */
  prompted: boolean
  /** Is the app installed */
  installed: boolean
  /** Did user dismiss the prompt */
  dismissed: boolean
  /** Timestamp of last prompt */
  lastPrompted?: number
}

/**
 * Update Flow API
 * Handles ServiceWorker updates and version management
 */
export interface UpdateFlowAPI {
  /** Check if an update is available */
  checkForUpdates(): Promise<boolean>
  /** Apply the update (skip waiting and reload) */
  applyUpdate(): void
  /** Get current update state */
  getState(): UpdateState
}

/**
 * Update state tracking
 */
export interface UpdateState {
  /** Is an update available */
  updateAvailable: boolean
  /** Is update installation in progress */
  installing: boolean
  /** ServiceWorker registration */
  registration: ServiceWorkerRegistration | null
}

/**
 * Offline Detection API
 * Monitors network status and manages offline UI
 */
export interface OfflineAPI {
  /** Check if currently offline */
  isOffline(): boolean
  /** Register callback for offline event */
  onOffline(callback: () => void): () => void
  /** Register callback for online event */
  onOnline(callback: () => void): () => void
  /** Get current network state */
  getState(): NetworkState
}

/**
 * Network state tracking
 */
export interface NetworkState {
  /** Is device online */
  online: boolean
  /** Network type (if available) */
  effectiveType?: string
  /** Last state change timestamp */
  lastChange: number
}

/**
 * BeforeInstallPrompt Event (extended)
 * Chrome-specific event for install prompts
 */
export interface BeforeInstallPromptEvent extends Event {
  /** Platforms on which the app can be installed */
  readonly platforms: string[]
  /** User's choice (accept/dismiss) */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  /** Show the install prompt */
  prompt(): Promise<void>
}

/**
 * PWA Configuration
 */
export interface PWAConfig {
  /** Enable install prompt */
  enableInstallPrompt: boolean
  /** Enable update notifications */
  enableUpdateFlow: boolean
  /** Enable offline detection */
  enableOfflineDetection: boolean
  /** Auto-check for updates interval (ms) */
  updateCheckInterval: number
  /** Show iOS install instructions */
  showIOSInstructions: boolean
}

/**
 * iOS Detection Result
 */
export interface IOSDetection {
  isIOS: boolean
  isSafari: boolean
  isStandalone: boolean
  shouldShowInstructions: boolean
}
