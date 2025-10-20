/**
 * Offline Detector
 * Increment 6 (PWACapability)
 *
 * Monitors network status and manages offline UI
 */

import type { OfflineAPI, NetworkState } from './types'

class OfflineDetector implements OfflineAPI {
  private networkState: NetworkState = {
    online: navigator.onLine,
    lastChange: Date.now(),
  }
  private offlineCallbacks: Array<() => void> = []
  private onlineCallbacks: Array<() => void> = []

  constructor() {
    this.setupListeners()
    this.updateNetworkInfo()
  }

  /**
   * Setup network event listeners
   */
  private setupListeners(): void {
    window.addEventListener('online', () => {
      console.log('[OfflineDetector] Network online')
      this.handleOnline()
    })

    window.addEventListener('offline', () => {
      console.log('[OfflineDetector] Network offline')
      this.handleOffline()
    })

    // Listen for visibility change to check network status
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.updateNetworkInfo()
      }
    })
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.networkState.online = true
    this.networkState.lastChange = Date.now()
    this.updateNetworkInfo()

    // Execute callbacks
    this.onlineCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('[OfflineDetector] Error in online callback:', error)
      }
    })

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('pwa-network-online', {
        detail: { online: true, state: this.networkState },
      })
    )

    // Hide offline banner if present
    this.removeOfflineBanner()
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.networkState.online = false
    this.networkState.lastChange = Date.now()

    // Execute callbacks
    this.offlineCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('[OfflineDetector] Error in offline callback:', error)
      }
    })

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('pwa-network-offline', {
        detail: { online: false, state: this.networkState },
      })
    )

    // Show offline banner
    this.showOfflineBanner()
  }

  /**
   * Update network information (connection type, effective type)
   */
  private updateNetworkInfo(): void {
    // Network Information API (experimental)
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string; type?: string }
      mozConnection?: { effectiveType?: string; type?: string }
      webkitConnection?: { effectiveType?: string; type?: string }
    }
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection

    if (connection) {
      this.networkState.effectiveType = connection.effectiveType
    }
  }

  /**
   * Check if currently offline
   */
  isOffline(): boolean {
    return !navigator.onLine
  }

  /**
   * Register callback for offline event
   * Returns unsubscribe function
   */
  onOffline(callback: () => void): () => void {
    this.offlineCallbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.offlineCallbacks.indexOf(callback)
      if (index > -1) {
        this.offlineCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Register callback for online event
   * Returns unsubscribe function
   */
  onOnline(callback: () => void): () => void {
    this.onlineCallbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.onlineCallbacks.indexOf(callback)
      if (index > -1) {
        this.onlineCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Get current network state
   */
  getState(): NetworkState {
    return { ...this.networkState }
  }

  /**
   * Show offline banner UI
   */
  private showOfflineBanner(): void {
    // Check if banner already exists
    if (document.getElementById('pwa-offline-banner')) {
      return
    }

    const banner = document.createElement('div')
    banner.id = 'pwa-offline-banner'
    banner.className = 'pwa-offline-banner'
    banner.innerHTML = `
      <div class="pwa-offline-banner-content">
        <span class="pwa-offline-icon">📡</span>
        <span class="pwa-offline-text">You're offline. Some features may be limited.</span>
      </div>
    `

    // Add styles
    this.injectOfflineStyles()

    // Insert at the beginning of body
    document.body.insertBefore(banner, document.body.firstChild)

    console.log('[OfflineDetector] Offline banner shown')
  }

  /**
   * Remove offline banner UI
   */
  private removeOfflineBanner(): void {
    const banner = document.getElementById('pwa-offline-banner')
    if (banner) {
      banner.remove()
      console.log('[OfflineDetector] Offline banner removed')
    }
  }

  /**
   * Inject offline banner styles
   */
  private injectOfflineStyles(): void {
    // Check if styles already injected
    if (document.getElementById('pwa-offline-styles')) {
      return
    }

    const styles = document.createElement('style')
    styles.id = 'pwa-offline-styles'
    styles.textContent = `
      .pwa-offline-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
        color: white;
        padding: 12px 16px;
        text-align: center;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        animation: pwa-slideDown 0.3s ease-out;
      }

      .pwa-offline-banner-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        max-width: 600px;
        margin: 0 auto;
      }

      .pwa-offline-icon {
        font-size: 18px;
        animation: pwa-pulse 2s ease-in-out infinite;
      }

      .pwa-offline-text {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.3px;
      }

      @keyframes pwa-slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes pwa-pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.1);
        }
      }

      @media (max-width: 640px) {
        .pwa-offline-banner {
          padding: 10px 12px;
        }
        .pwa-offline-text {
          font-size: 13px;
        }
      }
    `
    document.head.appendChild(styles)
  }
}

// Singleton instance
export const offlineDetector = new OfflineDetector()
