/**
 * Statistics Calculation Engine
 * Formula: CalculationEngine = TodayAggregation + TotalAggregation + StreakCalculation + TrendAnalysis
 */

import type {
  SessionRecord,
  ExerciseRecord,
  DailySummary,
  TodayMetrics,
  TotalMetrics,
  StreakData,
  WeeklyTrend,
} from '../types/statistics'
import { ExerciseType } from '../types/exercise'

/**
 * Helper: Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Helper: Get date N days ago in YYYY-MM-DD format
 */
export function getDateNDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

/**
 * Helper: Format ISO timestamp to YYYY-MM-DD
 */
export function extractDateFromISO(isoTimestamp: string): string {
  return isoTimestamp.split('T')[0]
}

/**
 * Calculate today's metrics
 * Formula: calculateTodayStats = filter(today) + aggregate(sessions + exercises) + calculate(breakRate)
 */
export function calculateTodayMetrics(
  sessions: SessionRecord[],
  exercises: ExerciseRecord[]
): TodayMetrics {
  const today = getTodayDateString()

  // Filter today's records
  const todaySessions = sessions.filter(s => s.date === today && s.completed)
  const todayExercises = exercises.filter(e => e.date === today)

  // Aggregate session data
  const sessionCount = todaySessions.length
  const workDuration = todaySessions.reduce((sum, s) => sum + s.duration, 0)

  // Aggregate exercise data
  const exerciseCount = todayExercises.length
  const exerciseBreakdown: Record<ExerciseType, number> = {
    [ExerciseType.BALL_TRACKING]: 0,
    [ExerciseType.NEAR_FAR_FOCUS]: 0,
    [ExerciseType.BLINK_EXERCISE]: 0,
  }

  todayExercises.forEach(exercise => {
    exerciseBreakdown[exercise.exerciseType] =
      (exerciseBreakdown[exercise.exerciseType] || 0) + 1
  })

  // Calculate break adherence rate
  const breakRate = sessionCount > 0 ? (exerciseCount / sessionCount) * 100 : 0

  return {
    sessionCount,
    workDuration,
    exerciseCount,
    breakRate: Math.round(breakRate),
    exerciseBreakdown,
  }
}

/**
 * Calculate total accumulated metrics
 * Formula: calculateTotalStats = aggregate(all_sessions + all_exercises) + calculate(streaks + averages)
 */
export function calculateTotalMetrics(
  sessions: SessionRecord[],
  exercises: ExerciseRecord[],
  dailySummaries: DailySummary[]
): TotalMetrics {
  // Aggregate session data
  const completedSessions = sessions.filter(s => s.completed)
  const totalSessions = completedSessions.length
  const totalDuration = completedSessions.reduce(
    (sum, s) => sum + s.duration,
    0
  )
  const totalHours = totalDuration / 3600 // Convert seconds to hours

  // Aggregate exercise data
  const totalExercises = exercises.length
  const exerciseBreakdown: Record<ExerciseType, number> = {
    [ExerciseType.BALL_TRACKING]: 0,
    [ExerciseType.NEAR_FAR_FOCUS]: 0,
    [ExerciseType.BLINK_EXERCISE]: 0,
  }

  exercises.forEach(exercise => {
    exerciseBreakdown[exercise.exerciseType] =
      (exerciseBreakdown[exercise.exerciseType] || 0) + 1
  })

  // Calculate streaks
  const streakData = calculateStreak(dailySummaries)

  // Calculate average sessions per day
  const totalDaysActive = dailySummaries.filter(s => s.sessionCount > 0).length
  const averageSessionsPerDay =
    totalDaysActive > 0 ? totalSessions / totalDaysActive : 0

  return {
    totalSessions,
    totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
    totalExercises,
    exerciseBreakdown,
    longestStreak: streakData.longest,
    currentStreak: streakData.current,
    averageSessionsPerDay: Math.round(averageSessionsPerDay * 100) / 100,
    totalDaysActive,
  }
}

/**
 * Calculate streak data
 * Formula: calculateStreak = sort(dailySummaries) + scan(consecutive_days) + max(streak)
 */
export function calculateStreak(dailySummaries: DailySummary[]): StreakData {
  if (dailySummaries.length === 0) {
    return {
      current: 0,
      longest: 0,
      lastActiveDate: '',
    }
  }

  // Sort summaries by date (descending)
  const sortedSummaries = [...dailySummaries]
    .filter(s => s.sessionCount > 0) // Only count days with sessions
    .sort((a, b) => b.date.localeCompare(a.date))

  if (sortedSummaries.length === 0) {
    return {
      current: 0,
      longest: 0,
      lastActiveDate: '',
    }
  }

  const today = getTodayDateString()
  const yesterday = getDateNDaysAgo(1)
  const lastActiveDate = sortedSummaries[0].date

  // Calculate current streak
  let currentStreak = 0
  if (lastActiveDate === today || lastActiveDate === yesterday) {
    // Current streak is active
    currentStreak = 1
    let expectedDate = lastActiveDate

    for (let i = 1; i < sortedSummaries.length; i++) {
      const prevDate = new Date(expectedDate)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevDateString = prevDate.toISOString().split('T')[0]

      if (sortedSummaries[i].date === prevDateString) {
        currentStreak++
        expectedDate = prevDateString
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1
  let expectedDate = sortedSummaries[0].date

  for (let i = 1; i < sortedSummaries.length; i++) {
    const prevDate = new Date(expectedDate)
    prevDate.setDate(prevDate.getDate() - 1)
    const prevDateString = prevDate.toISOString().split('T')[0]

    if (sortedSummaries[i].date === prevDateString) {
      tempStreak++
      expectedDate = prevDateString
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
      expectedDate = sortedSummaries[i].date
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak)

  return {
    current: currentStreak,
    longest: longestStreak,
    lastActiveDate,
  }
}

/**
 * Calculate weekly trend (last 7 days)
 * Formula: calculateWeeklyTrend = aggregate(last_7_days) + fill_missing_days + format_chart_data
 */
export function calculateWeeklyTrend(
  dailySummaries: DailySummary[]
): WeeklyTrend {
  const dates: string[] = []
  const sessionCounts: number[] = []
  const durations: number[] = []
  const exerciseCounts: number[] = []

  // Create map of existing summaries
  const summaryMap = new Map<string, DailySummary>()
  dailySummaries.forEach(summary => {
    summaryMap.set(summary.date, summary)
  })

  // Generate last 7 days (including today)
  for (let i = 6; i >= 0; i--) {
    const date = getDateNDaysAgo(i)
    dates.push(date)

    const summary = summaryMap.get(date)
    sessionCounts.push(summary?.sessionCount || 0)
    durations.push(summary?.totalDuration || 0)
    exerciseCounts.push(summary?.exerciseCount || 0)
  }

  return {
    dates,
    sessionCounts,
    durations,
    exerciseCounts,
  }
}

/**
 * Format duration in seconds to human-readable string
 * Formula: formatDuration = convert(seconds) -> format(hours:minutes)
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Format date to display format
 * Formula: formatDate = parse(YYYY-MM-DD) -> format(MMM DD)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00') // Ensure UTC
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-US', options)
}

/**
 * Calculate percentage with safe division
 */
export function calculatePercentage(
  numerator: number,
  denominator: number
): number {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100)
}

/**
 * Get exercise type display name
 */
export function getExerciseTypeName(type: ExerciseType): string {
  const names: Record<ExerciseType, string> = {
    [ExerciseType.BALL_TRACKING]: 'Ball Tracking',
    [ExerciseType.NEAR_FAR_FOCUS]: 'Near-Far Focus',
    [ExerciseType.BLINK_EXERCISE]: 'Blink Exercise',
  }
  return names[type] || type
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDateString(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  const date = new Date(dateString + 'T00:00:00')
  return !isNaN(date.getTime())
}

/**
 * Validate ISO 8601 timestamp format
 */
export function isValidISOTimestamp(timestamp: string): boolean {
  const date = new Date(timestamp)
  return !isNaN(date.getTime()) && timestamp.includes('T')
}

/**
 * Generate date range array
 */
export function generateDateRange(
  startDate: string,
  endDate: string
): string[] {
  const dates: string[] = []
  const current = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}
