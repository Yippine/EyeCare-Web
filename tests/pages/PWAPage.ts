import { Page, Locator } from '@playwright/test'

/**
 * Page Object for PWA functionality
 *
 * Formula: PWAPage = InstallPrompt + OfflineMode + ServiceWorkerRegistration
 */
export class PWAPage {
  readonly page: Page
  readonly installButton: Locator
  readonly updateNotification: Locator

  constructor(page: Page) {
    this.page = page
    this.installButton = page
      .locator('[data-testid="pwa-install-button"]')
      .or(page.getByRole('button', { name: /install|add to home/i }))
    this.updateNotification = page.locator(
      '[data-testid="update-notification"]'
    )
  }

  async goto() {
    await this.page.goto('/')
  }

  async checkInstallPrompt(): Promise<boolean> {
    try {
      await this.installButton.waitFor({ state: 'visible', timeout: 5000 })
      return true
    } catch {
      return false
    }
  }

  async installApp() {
    if (await this.checkInstallPrompt()) {
      await this.installButton.click()
      // Wait for install to complete
      await this.page.waitForTimeout(2000)
    }
  }

  async verifyServiceWorkerRegistered(): Promise<boolean> {
    const swRegistered = await this.page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        return registration !== undefined
      }
      return false
    })
    return swRegistered
  }

  async verifyOfflineMode(): Promise<boolean> {
    // First, wait for service worker to be registered
    await this.page.waitForTimeout(2000)

    // Simulate offline by blocking all network requests
    await this.page.context().route('**/*', route => {
      // Allow service worker and cache
      if (
        route.request().resourceType() === 'document' ||
        route.request().resourceType() === 'script' ||
        route.request().resourceType() === 'stylesheet'
      ) {
        route.abort()
      } else {
        route.abort()
      }
    })

    // Try to reload the page
    try {
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
      // If we can still see content, offline mode works
      const hasContent = await this.page.locator('body').isVisible()
      return hasContent
    } catch {
      return false
    }
  }
}
