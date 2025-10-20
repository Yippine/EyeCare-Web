import { Page, Locator } from '@playwright/test'

/**
 * Page Object for Timer functionality
 *
 * Formula: TimerPage = StartButton + CountdownDisplay + SessionCounter + BreakNotification
 */
export class TimerPage {
  readonly page: Page
  readonly startButton: Locator
  readonly pauseButton: Locator
  readonly resetButton: Locator
  readonly countdownDisplay: Locator
  readonly sessionCounter: Locator
  readonly breakNotificationModal: Locator
  readonly exerciseSelector: Locator

  constructor(page: Page) {
    this.page = page
    this.startButton = page.getByRole('button', { name: /start/i })
    this.pauseButton = page.getByRole('button', { name: /pause/i })
    this.resetButton = page.getByRole('button', { name: /reset/i })
    this.countdownDisplay = page
      .locator('[data-testid="countdown-display"]')
      .or(page.locator('text=/\\d{2}:\\d{2}/'))
    this.sessionCounter = page
      .locator('[data-testid="session-counter"]')
      .or(page.locator('text=/Session #\\d+/'))
    this.breakNotificationModal = page
      .locator('[data-testid="break-notification"]')
      .or(page.locator('role=dialog'))
    this.exerciseSelector = page.locator('[data-testid="exercise-selector"]')
  }

  async goto() {
    await this.page.goto('/')
  }

  async startTimer() {
    await this.startButton.click()
  }

  async pauseTimer() {
    await this.pauseButton.click()
  }

  async resetTimer() {
    await this.resetButton.click()
  }

  async waitForWorkPeriod() {
    // Wait for countdown to progress (timer should be running)
    // Note: Full work period wait is skipped for testing efficiency
    await this.page.waitForTimeout(1000)
  }

  async waitForBreakNotification() {
    await this.breakNotificationModal.waitFor({
      state: 'visible',
      timeout: 60000,
    })
  }

  async selectExercise(
    exerciseName: 'Near-Far Focus' | 'Ball Tracking' | 'Blink Exercise'
  ) {
    const exerciseButton = this.page.getByRole('button', {
      name: new RegExp(exerciseName, 'i'),
    })
    await exerciseButton.click()
  }

  async completeExercise() {
    // Wait for exercise completion (typically 20 seconds)
    const completeButton = this.page.getByRole('button', {
      name: /complete|done|finish/i,
    })
    await completeButton.waitFor({ state: 'visible', timeout: 30000 })
    await completeButton.click()
  }

  async skipExercise() {
    const skipButton = this.page.getByRole('button', { name: /skip/i })
    await skipButton.click()
  }

  async getSessionCount(): Promise<number> {
    const text = await this.sessionCounter.textContent()
    const match = text?.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }
}
