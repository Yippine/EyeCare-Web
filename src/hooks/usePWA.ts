/**
 * usePWA Hook
 * Increment 6 (PWACapability)
 *
 * React hook for PWA functionality
 */

import { useState, useEffect, useCallback } from 'react'
import {
  installPrompt,
  updateFlow,
  offlineDetector,
  type InstallState,
  type UpdateState,
  type NetworkState,
} from '@/pwa'

interface PWAState {
  // Install
  canInstall: boolean
  isInstalled: boolean
  installState: InstallState

  // Update
  updateAvailable: boolean
  updateState: UpdateState

  // Network
  isOffline: boolean
  networkState: NetworkState
}

interface PWAActions {
  // Install actions
  promptInstall: () => Promise<void>

  // Update actions
  checkForUpdates: () => Promise<boolean>
  applyUpdate: () => void
}

/**
 * React hook for PWA functionality
 */
export function usePWA() {
  const [state, setState] = useState<PWAState>({
    // Install
    canInstall: installPrompt.canInstall(),
    isInstalled: installPrompt.isInstalled(),
    installState: installPrompt.getState(),

    // Update
    updateAvailable: updateFlow.getState().updateAvailable,
    updateState: updateFlow.getState(),

    // Network
    isOffline: offlineDetector.isOffline(),
    networkState: offlineDetector.getState(),
  })

  /**
   * Update state from modules
   */
  const updateState = useCallback(() => {
    setState({
      canInstall: installPrompt.canInstall(),
      isInstalled: installPrompt.isInstalled(),
      installState: installPrompt.getState(),
      updateAvailable: updateFlow.getState().updateAvailable,
      updateState: updateFlow.getState(),
      isOffline: offlineDetector.isOffline(),
      networkState: offlineDetector.getState(),
    })
  }, [])

  /**
   * Setup event listeners
   */
  useEffect(() => {
    // Install events
    const handleInstallAvailable = () => {
      console.log('[usePWA] Install available')
      updateState()
    }

    const handleInstalled = () => {
      console.log('[usePWA] App installed')
      updateState()
    }

    const handleInstallPrompted = () => {
      console.log('[usePWA] Install prompted')
      updateState()
    }

    // Update events
    const handleUpdateAvailable = () => {
      console.log('[usePWA] Update available')
      updateState()
    }

    // Network events
    const handleOnline = () => {
      console.log('[usePWA] Network online')
      updateState()
    }

    const handleOffline = () => {
      console.log('[usePWA] Network offline')
      updateState()
    }

    // Register event listeners
    window.addEventListener('pwa-install-available', handleInstallAvailable)
    window.addEventListener('pwa-installed', handleInstalled)
    window.addEventListener('pwa-install-prompted', handleInstallPrompted)
    window.addEventListener('pwa-update-available', handleUpdateAvailable)
    window.addEventListener('pwa-network-online', handleOnline)
    window.addEventListener('pwa-network-offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener(
        'pwa-install-available',
        handleInstallAvailable
      )
      window.removeEventListener('pwa-installed', handleInstalled)
      window.removeEventListener('pwa-install-prompted', handleInstallPrompted)
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
      window.removeEventListener('pwa-network-online', handleOnline)
      window.removeEventListener('pwa-network-offline', handleOffline)
    }
  }, [updateState])

  /**
   * Actions
   */
  const actions: PWAActions = {
    promptInstall: useCallback(async () => {
      try {
        await installPrompt.promptInstall()
        updateState()
      } catch (error) {
        console.error('[usePWA] Install prompt failed:', error)
        throw error
      }
    }, [updateState]),

    checkForUpdates: useCallback(async () => {
      const hasUpdate = await updateFlow.checkForUpdates()
      updateState()
      return hasUpdate
    }, [updateState]),

    applyUpdate: useCallback(() => {
      updateFlow.applyUpdate()
    }, []),
  }

  return {
    ...state,
    ...actions,
  }
}

/**
 * Hook for install prompt only
 */
export function useInstallPrompt() {
  const { canInstall, isInstalled, installState, promptInstall } = usePWA()
  return { canInstall, isInstalled, installState, promptInstall }
}

/**
 * Hook for update flow only
 */
export function useUpdateFlow() {
  const { updateAvailable, updateState, checkForUpdates, applyUpdate } =
    usePWA()
  return { updateAvailable, updateState, checkForUpdates, applyUpdate }
}

/**
 * Hook for offline detection only
 */
export function useOfflineDetection() {
  const { isOffline, networkState } = usePWA()
  return { isOffline, networkState }
}
