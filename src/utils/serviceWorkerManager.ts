import type { ServiceWorkerManager as IServiceWorkerManager } from '../types/notification'

/**
 * Manages ServiceWorker registration
 * Provides foundation for PWA capabilities and future background notification support
 */
class ServiceWorkerManagerImpl implements IServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null

  /**
   * Check if ServiceWorker API is supported
   * @returns true if ServiceWorker is supported
   */
  private isSupported(): boolean {
    return 'serviceWorker' in navigator
  }

  /**
   * Register the ServiceWorker
   * Only registers in production mode and when supported
   * @returns ServiceWorkerRegistration or null if failed/not supported
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.log('ServiceWorker not supported in this browser')
      return null
    }

    // Only register in production or when explicitly testing
    if (import.meta.env.DEV) {
      console.log('ServiceWorker registration skipped in development mode')
      return null
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      console.log('ServiceWorker registered successfully:', this.registration)

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        console.log('ServiceWorker update found')
      })

      return this.registration
    } catch (error) {
      console.warn('ServiceWorker registration failed:', error)
      // Graceful degradation - app continues without ServiceWorker
      return null
    }
  }

  /**
   * Get current ServiceWorker registration
   * @returns ServiceWorkerRegistration or undefined if not registered
   */
  async getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
    if (!this.isSupported()) {
      return undefined
    }

    try {
      return await navigator.serviceWorker.getRegistration()
    } catch (error) {
      console.error('Error getting ServiceWorker registration:', error)
      return undefined
    }
  }

  /**
   * Unregister the ServiceWorker
   * @returns true if successfully unregistered
   */
  async unregister(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    try {
      const registration = await this.getRegistration()
      if (registration) {
        const result = await registration.unregister()
        console.log('ServiceWorker unregistered:', result)
        this.registration = null
        return result
      }
      return false
    } catch (error) {
      console.error('Error unregistering ServiceWorker:', error)
      return false
    }
  }
}

// Singleton instance
export const serviceWorkerManager = new ServiceWorkerManagerImpl()
