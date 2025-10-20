import { Page, Locator, BrowserContext } from '@playwright/test'

/**
 * Page Object for Notification functionality
 *
 * Formula: NotificationPage = PermissionGrant + NotificationDelivery + NotificationClick
 */
export class NotificationPage {
  readonly page: Page
  readonly context: BrowserContext
  readonly notificationPermissionButton: Locator

  constructor(page: Page) {
    this.page = page
    this.context = page.context()
    this.notificationPermissionButton = page.getByRole('button', {
      name: /enable notifications/i,
    })
  }

  async goto() {
    await this.page.goto('/')
  }

  async grantNotificationPermission() {
    // Grant notification permission via browser context
    await this.context.grantPermissions(['notifications'])

    // Click any "Enable Notifications" button if present
    if (
      await this.notificationPermissionButton
        .isVisible({ timeout: 2000 })
        .catch(() => false)
    ) {
      await this.notificationPermissionButton.click()
    }
  }

  async waitForNotification(timeoutMs: number = 30000): Promise<boolean> {
    // In Playwright, we can't directly access system notifications
    // Instead, we verify that the notification modal/UI appears
    const notificationModal = this.page
      .locator('[data-testid="break-notification"]')
      .or(
        this.page
          .locator('role=dialog')
          .filter({ hasText: /break time|take a break/i })
      )

    try {
      await notificationModal.waitFor({ state: 'visible', timeout: timeoutMs })
      return true
    } catch {
      return false
    }
  }

  async clickNotification() {
    // Click the in-app notification/modal
    const notificationModal = this.page
      .locator('[data-testid="break-notification"]')
      .or(this.page.locator('role=dialog'))
    await notificationModal.click()
  }

  async verifyNotificationPermission(): Promise<string> {
    const permission = await this.page.evaluate(async () => {
      if ('Notification' in window) {
        return Notification.permission
      }
      return 'unsupported'
    })
    return permission
  }
}
