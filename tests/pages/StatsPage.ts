import { Page, Locator } from '@playwright/test'

/**
 * Page Object for Statistics functionality
 *
 * Formula: StatsPage = SessionCount + ExerciseCount + ChartsDisplay + DataPersistence
 */
export class StatsPage {
  readonly page: Page
  readonly totalSessionsCount: Locator
  readonly totalExercisesCount: Locator
  readonly statsTab: Locator

  constructor(page: Page) {
    this.page = page
    this.totalSessionsCount = page
      .locator('[data-testid="total-sessions"]')
      .or(page.locator('text=/Total Sessions.*\\d+/'))
    this.totalExercisesCount = page
      .locator('[data-testid="total-exercises"]')
      .or(page.locator('text=/Total Exercises.*\\d+/'))
    this.statsTab = page.getByRole('link', { name: /stats|statistics/i })
  }

  async navigate() {
    await this.statsTab.click()
    await this.page.waitForURL(/.*stats.*/)
  }

  async getSessionCount(): Promise<number> {
    const text = await this.totalSessionsCount.textContent()
    const match = text?.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  async getExerciseCount(): Promise<number> {
    const text = await this.totalExercisesCount.textContent()
    const match = text?.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  async verifyDataPersistence(
    expectedSessions: number,
    expectedExercises: number
  ) {
    // Reload page to verify data persists from IndexedDB
    await this.page.reload()
    await this.page.waitForLoadState('networkidle')

    const sessions = await this.getSessionCount()
    const exercises = await this.getExerciseCount()

    return sessions === expectedSessions && exercises === expectedExercises
  }
}
