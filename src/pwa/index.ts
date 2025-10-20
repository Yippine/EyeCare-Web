/**
 * PWA Module Index
 * Increment 6 (PWACapability)
 *
 * Centralized exports for all PWA functionality
 */

// Core modules
export { installPrompt } from './installPrompt'
export { updateFlow } from './updateFlow'
export { offlineDetector } from './offlineDetector'
export {
  showIOSInstructions,
  initIOSInstructions,
  detectIOS,
} from './iosInstructions'

// Types
export type {
  InstallPromptAPI,
  InstallState,
  UpdateFlowAPI,
  UpdateState,
  OfflineAPI,
  NetworkState,
  BeforeInstallPromptEvent,
  PWAConfig,
  IOSDetection,
} from './types'

// Import modules for init function
import { updateFlow as updateFlowInstance } from './updateFlow'
import { initIOSInstructions as initIOSInstructionsFunc } from './iosInstructions'
import type { PWAConfig } from './types'

/**
 * Initialize all PWA features
 */
export function initPWA(config?: Partial<PWAConfig>): void {
  const defaultConfig: PWAConfig = {
    enableInstallPrompt: true,
    enableUpdateFlow: true,
    enableOfflineDetection: true,
    updateCheckInterval: 60 * 60 * 1000, // 1 hour
    showIOSInstructions: true,
  }

  const finalConfig = { ...defaultConfig, ...config }

  console.log('[PWA] Initializing with config:', finalConfig)

  // Install prompt is always initialized (listens for beforeinstallprompt)
  // No explicit init needed

  // Update flow
  if (finalConfig.enableUpdateFlow) {
    updateFlowInstance.setupPeriodicUpdateCheck(finalConfig.updateCheckInterval)
  }

  // Offline detection is always initialized
  // No explicit init needed

  // iOS instructions
  if (finalConfig.showIOSInstructions) {
    initIOSInstructionsFunc()
  }

  console.log('[PWA] Initialization complete')
}
