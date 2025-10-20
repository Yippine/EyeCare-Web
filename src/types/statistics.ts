/**
 * Statistics Type Definitions
 * Formula: StatisticsTypes = SessionRecord + ExerciseRecord + DailySummary + TodayMetrics + TotalMetrics + StreakData
 */

import { ExerciseType } from './exercise'

/**
 * Session record stored in IndexedDB
 * Formula: SessionRecord = {sessionId, startTime, endTime, duration, completed}
 */
export interface SessionRecord {
  sessionId: string // UUID
  startTime: string // ISO 8601 UTC timestamp
  endTime: string // ISO 8601 UTC timestamp
  duration: number // Duration in seconds
  completed: boolean // Whether session was completed or interrupted
  date: string // YYYY-MM-DD for indexing
}

/**
 * Exercise record stored in IndexedDB
 * Formula: ExerciseRecord = {exerciseId, sessionId, exerciseType, completedAt, duration}
 */
export interface ExerciseRecord {
  exerciseId: string // UUID
  sessionId: string // Reference to SessionRecord
  exerciseType: ExerciseType
  completedAt: string // ISO 8601 UTC timestamp
  duration: number // Duration in seconds (~20)
  date: string // YYYY-MM-DD for indexing
}

/**
 * Daily summary aggregation
 * Formula: DailySummary = {date, sessionCount, totalDuration, exerciseCount, breakAdherence}
 */
export interface DailySummary {
  date: string // YYYY-MM-DD (primary key)
  sessionCount: number // Total work sessions completed
  totalDuration: number // Total work duration in seconds
  exerciseCount: number // Total exercises completed
  breakAdherence: number // Percentage of breaks taken (0-100)
  exerciseBreakdown: Record<ExerciseType, number> // Count per exercise type
  updatedAt: string // ISO 8601 UTC timestamp
}

/**
 * Today's real-time metrics
 * Formula: TodayMetrics = {sessionCount, workDuration, exerciseCount, breakRate}
 */
export interface TodayMetrics {
  sessionCount: number
  workDuration: number // In seconds
  exerciseCount: number
  breakRate: number // Percentage (0-100)
  exerciseBreakdown: Record<ExerciseType, number>
}

/**
 * Total accumulated metrics
 * Formula: TotalMetrics = {totalSessions, totalHours, exerciseBreakdown, longestStreak, currentStreak}
 */
export interface TotalMetrics {
  totalSessions: number
  totalHours: number // Converted from seconds
  totalExercises: number
  exerciseBreakdown: Record<ExerciseType, number>
  longestStreak: number // Days
  currentStreak: number // Days
  averageSessionsPerDay: number
  totalDaysActive: number
}

/**
 * Streak calculation data
 * Formula: StreakData = {current, longest, lastActiveDate}
 */
export interface StreakData {
  current: number // Current streak in days
  longest: number // Longest streak in days
  lastActiveDate: string // YYYY-MM-DD
}

/**
 * Weekly trend data for charts
 * Formula: WeeklyTrend = {dates, sessionCounts, durations, exerciseCounts}
 */
export interface WeeklyTrend {
  dates: string[] // Last 7 days (YYYY-MM-DD)
  sessionCounts: number[] // Sessions per day
  durations: number[] // Total duration per day (seconds)
  exerciseCounts: number[] // Exercises per day
}

/**
 * Data export format
 * Formula: ExportData = {sessions, exercises, dailySummaries, metadata}
 */
export interface ExportData {
  sessions: SessionRecord[]
  exercises: ExerciseRecord[]
  dailySummaries: DailySummary[]
  metadata: {
    exportedAt: string // ISO 8601 UTC timestamp
    version: string // Export format version
    totalRecords: number
  }
}

/**
 * Database error types
 */
export enum DatabaseError {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  PRIVATE_BROWSING = 'PRIVATE_BROWSING',
  VERSION_CHANGE = 'VERSION_CHANGE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
}

/**
 * Database connection state
 */
export enum DatabaseState {
  CLOSED = 'CLOSED',
  OPENING = 'OPENING',
  OPEN = 'OPEN',
  ERROR = 'ERROR',
}

/**
 * Data migration status
 */
export enum MigrationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Statistics store state
 * Formula: StatisticsStoreState = todayMetrics + totalMetrics + weeklyTrend + loading + error
 */
export interface StatisticsStoreState {
  todayMetrics: TodayMetrics | null
  totalMetrics: TotalMetrics | null
  weeklyTrend: WeeklyTrend | null
  loading: boolean
  error: string | null
  databaseState: DatabaseState
}

/**
 * Statistics store actions
 * Formula: StatisticsActions = refreshStats + exportData + clearData + recordSession + recordExercise
 */
export interface StatisticsStoreActions {
  refreshStats: () => Promise<void>
  exportData: () => Promise<ExportData>
  clearData: () => Promise<void>
  recordSession: (session: Omit<SessionRecord, 'date'>) => Promise<void>
  recordExercise: (exercise: Omit<ExerciseRecord, 'date'>) => Promise<void>
  initializeDatabase: () => Promise<void>
}

/**
 * Complete statistics store
 * Formula: StatisticsStore = StatisticsStoreState + StatisticsStoreActions
 */
export type StatisticsStore = StatisticsStoreState & StatisticsStoreActions
