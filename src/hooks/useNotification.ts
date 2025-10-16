import { useState, useEffect, useCallback, useRef } from 'react'
import { notificationManager } from '../utils/notificationManager'
import {
  NotificationType,
  NotificationPermissionState,
  type PopupState,
} from '../types/notification'

/**
 * Custom hook for notification system integration
 * Manages popup state, permission status, and lifecycle
 */
export function useNotification() {
  const [popupState, setPopupState] = useState<PopupState>({
    visible: false,
    message: '',
    type: NotificationType.WorkComplete,
    autoDismissTimer: 0,
  })

  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionState>(
      notificationManager.getPermissionStatus()
    )

  const autoDismissTimerRef = useRef<number | null>(null)

  /**
   * Dismiss popup notification
   */
  const dismissPopup = useCallback(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current)
      autoDismissTimerRef.current = null
    }

    setPopupState(prev => ({
      ...prev,
      visible: false,
    }))
  }, [])

  /**
   * Show popup notification
   */
  const showPopup = useCallback(
    (message: string, type: NotificationType) => {
      // Clear any existing timer
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current)
      }

      // Show popup
      setPopupState({
        visible: true,
        message,
        type,
        autoDismissTimer: 5000,
      })

      // Auto-dismiss after 5 seconds
      autoDismissTimerRef.current = window.setTimeout(() => {
        dismissPopup()
      }, 5000)
    },
    [dismissPopup]
  )

  /**
   * Request browser notification permission
   */
  const requestPermission = useCallback(async () => {
    const newStatus = await notificationManager.requestPermission()
    setPermissionStatus(newStatus)
    return newStatus
  }, [])

  /**
   * Initialize notification manager and register popup callback
   */
  useEffect(() => {
    console.log('[useNotification] Initializing notification system')

    // Register popup callback
    notificationManager.setPopupCallback(showPopup)

    // Initialize notification manager
    notificationManager.initialize().catch(error => {
      console.error('[useNotification] Initialization error:', error)
    })

    // Update permission status
    setPermissionStatus(notificationManager.getPermissionStatus())

    // Cleanup on unmount
    return () => {
      console.log('[useNotification] Cleaning up notification system')
      notificationManager.cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    popupState,
    dismissPopup,
    permissionStatus,
    requestPermission,
  }
}
