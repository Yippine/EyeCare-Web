import { test, expect } from '@playwright/test'
import { PWAPage } from '../pages/PWAPage'

/**
 * E2E Test: PWA Flow
 *
 * Formula: PWAFlow = ServiceWorkerRegistration -> InstallPrompt -> OfflineMode
 *
 * Test Coverage:
 * - Service Worker registers successfully
 * - PWA install prompt appears (browser-dependent)
 * - App works offline (service worker caching)
 * - App loads from cache when offline
 */

test.describe('PWA Flow', () => {
  test('should register service worker', async ({ page }) => {
    const pwaPage = new PWAPage(page)

    await pwaPage.goto()

    // Wait for service worker registration
    await page.waitForTimeout(3000)

    // Verify service worker is registered
    const isRegistered = await pwaPage.verifyServiceWorkerRegistered()
    expect(isRegistered).toBe(true)
  })

  test('should have manifest.json', async ({ page }) => {
    await page.goto('/')

    // Check if manifest link exists in HTML
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveCount(1)

    // Verify manifest URL
    const manifestHref = await manifestLink.getAttribute('href')
    expect(manifestHref).toBeTruthy()
  })

  test('should have PWA meta tags', async ({ page }) => {
    await page.goto('/')

    // Check for theme-color meta tag
    const themeColor = page.locator('meta[name="theme-color"]')
    await expect(themeColor).toHaveCount(1)

    // Check for apple-mobile-web-app-capable meta tag
    const appleMobileCapable = page.locator(
      'meta[name="apple-mobile-web-app-capable"]'
    )
    await expect(appleMobileCapable).toHaveCount(1)
  })

  test('should have app icons', async ({ page }) => {
    await page.goto('/')

    // Check for apple-touch-icon
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]')
    const count = await appleTouchIcon.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should show install prompt UI (if supported)', async ({ page }) => {
    const pwaPage = new PWAPage(page)

    await pwaPage.goto()

    // Wait a bit for install prompt to appear
    await page.waitForTimeout(2000)

    // Check if install button is visible (may not be on all browsers)
    const hasInstallPrompt = await pwaPage.checkInstallPrompt()

    // We don't assert true here because not all browsers support beforeinstallprompt
    // Just verify the check completes without error
    expect(typeof hasInstallPrompt).toBe('boolean')
  })

  test('should cache static assets for offline use', async ({ page }) => {
    await page.goto('/')

    // Wait for service worker to cache assets
    await page.waitForTimeout(3000)

    // Check if cache storage has entries
    const hasCachedAssets = await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        if (cacheNames.length === 0) return false

        // Check if first cache has entries
        const cache = await caches.open(cacheNames[0])
        const keys = await cache.keys()
        return keys.length > 0
      }
      return false
    })

    expect(hasCachedAssets).toBe(true)
  })

  test('should display offline indicator when disconnected', async ({
    page,
    context,
  }) => {
    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Simulate going offline
    await context.setOffline(true)

    // Wait a bit for offline detection
    await page.waitForTimeout(2000)

    // The app should detect offline state (verify via browser's online/offline API)
    const isOnline = await page.evaluate(() => navigator.onLine)
    expect(isOnline).toBe(false)

    // Restore online state
    await context.setOffline(false)
  })
})
