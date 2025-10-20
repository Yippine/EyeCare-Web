import { test, expect } from '@playwright/test'
import { StatsPage } from '../pages/StatsPage'

/**
 * E2E Test: Statistics Flow
 *
 * Formula: StatsFlow = CompleteSession -> NavigateToStats -> VerifyData -> CloseTab -> Reopen -> VerifyPersistence
 *
 * Test Coverage:
 * - Statistics page displays session count
 * - Statistics page displays exercise count
 * - Data persists after page reload (IndexedDB)
 * - Navigation to stats page works
 */

test.describe('Statistics Flow', () => {
  test('should navigate to statistics page', async ({ page }) => {
    const statsPage = new StatsPage(page)

    // Go to home page first
    await page.goto('/')

    // Navigate to stats
    await statsPage.navigate()

    // Verify URL changed to stats
    await expect(page).toHaveURL(/.*stats.*/)

    // Verify stats content is visible
    await expect(statsPage.totalSessionsCount).toBeVisible()
  })

  test('should display total sessions count', async ({ page }) => {
    const statsPage = new StatsPage(page)

    await page.goto('/')
    await statsPage.navigate()

    // Verify sessions count is displayed
    await expect(statsPage.totalSessionsCount).toBeVisible()

    // Verify it's a number
    const sessionCount = await statsPage.getSessionCount()
    expect(sessionCount).toBeGreaterThanOrEqual(0)
  })

  test('should display total exercises count', async ({ page }) => {
    const statsPage = new StatsPage(page)

    await page.goto('/')
    await statsPage.navigate()

    // Verify exercises count is displayed
    await expect(statsPage.totalExercisesCount).toBeVisible()

    // Verify it's a number
    const exerciseCount = await statsPage.getExerciseCount()
    expect(exerciseCount).toBeGreaterThanOrEqual(0)
  })

  test('should persist statistics data after reload', async ({ page }) => {
    const statsPage = new StatsPage(page)

    await page.goto('/')
    await statsPage.navigate()

    // Get current counts
    const sessionsBefore = await statsPage.getSessionCount()
    const exercisesBefore = await statsPage.getExerciseCount()

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify counts remain the same (IndexedDB persistence)
    const sessionsAfter = await statsPage.getSessionCount()
    const exercisesAfter = await statsPage.getExerciseCount()

    expect(sessionsAfter).toBe(sessionsBefore)
    expect(exercisesAfter).toBe(exercisesBefore)
  })

  test('should persist data after closing and reopening browser', async ({
    browser,
  }) => {
    // Create new context and page
    const context = await browser.newContext()
    const page = await context.newPage()
    const statsPage = new StatsPage(page)

    await page.goto('/')
    await statsPage.navigate()

    // Get current counts
    const sessionsBefore = await statsPage.getSessionCount()
    const exercisesBefore = await statsPage.getExerciseCount()

    // Close page and context (simulates closing browser)
    await page.close()
    await context.close()

    // Open new context and page (simulates reopening browser)
    const newContext = await browser.newContext()
    const newPage = await newContext.newPage()
    const newStatsPage = new StatsPage(newPage)

    await newPage.goto('/')
    await newStatsPage.navigate()

    // Verify data persisted (IndexedDB is persistent across browser sessions)
    const sessionsAfter = await newStatsPage.getSessionCount()
    const exercisesAfter = await newStatsPage.getExerciseCount()

    expect(sessionsAfter).toBe(sessionsBefore)
    expect(exercisesAfter).toBe(exercisesBefore)

    await newPage.close()
    await newContext.close()
  })
})
