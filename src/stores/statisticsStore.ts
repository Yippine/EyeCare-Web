/**
 * Statistics Store
 * Formula: StatisticsStore = ZustandStore × StatisticsDB × CalculationEngine
 *
 * State management for statistics system without localStorage persistence
 * All data stored in IndexedDB via StatisticsDB
 */

import { create } from 'zustand'
import type {
  StatisticsStore,
  SessionRecord,
  ExerciseRecord,
  ExportData,
} from '../types/statistics'
import { DatabaseState } from '../types/statistics'
import { getStatisticsDB } from '../db/statisticsDB'
import {
  calculateTodayMetrics,
  calculateTotalMetrics,
  calculateWeeklyTrend,
  getTodayDateString,
  getDateNDaysAgo,
  extractDateFromISO,
} from '../utils/statisticsCalculator'

/**
 * Create statistics store
 * Formula: createStore = state + actions + IndexedDB_integration
 */
export const useStatisticsStore = create<StatisticsStore>((set, get) => ({
  // Initial state
  todayMetrics: null,
  totalMetrics: null,
  weeklyTrend: null,
  loading: false,
  error: null,
  databaseState: DatabaseState.CLOSED,

  /**
   * Initialize database
   * Formula: initializeDatabase = getDB() -> initialize() -> updateState(databaseState)
   */
  initializeDatabase: async () => {
    try {
      set({ loading: true, error: null })

      const db = getStatisticsDB()
      await db.initialize()

      set({
        databaseState: db.getState(),
        loading: false,
      })

      console.log('[StatisticsStore] Database initialized')

      // Load initial stats
      await get().refreshStats()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to initialize database'
      set({
        error: errorMessage,
        loading: false,
        databaseState: DatabaseState.ERROR,
      })
      console.error('[StatisticsStore] Database initialization failed:', error)
    }
  },

  /**
   * Refresh statistics
   * Formula: refreshStats = fetch(sessions + exercises + dailySummaries) -> calculate(metrics) -> updateState
   */
  refreshStats: async () => {
    try {
      set({ loading: true, error: null })

      const db = getStatisticsDB()

      // Fetch data for last 90 days
      const endDate = getTodayDateString()
      const startDate = getDateNDaysAgo(90)

      const [sessions, exercises, dailySummaries] = await Promise.all([
        db.getSessionsByDateRange(startDate, endDate),
        db.getExercisesByDateRange(startDate, endDate),
        db.getDailySummariesByDateRange(startDate, endDate),
      ])

      // Calculate metrics
      const todayMetrics = calculateTodayMetrics(sessions, exercises)
      const totalMetrics = calculateTotalMetrics(
        sessions,
        exercises,
        dailySummaries
      )
      const weeklyTrend = calculateWeeklyTrend(dailySummaries)

      set({
        todayMetrics,
        totalMetrics,
        weeklyTrend,
        loading: false,
        error: null,
      })

      console.log('[StatisticsStore] Statistics refreshed', {
        todayMetrics,
        totalMetrics,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to refresh statistics'
      set({
        error: errorMessage,
        loading: false,
      })
      console.error('[StatisticsStore] Failed to refresh stats:', error)
    }
  },

  /**
   * Record a session
   * Formula: recordSession = addToDatabase(session) -> refreshStats()
   */
  recordSession: async (
    session: Omit<SessionRecord, 'date'>
  ): Promise<void> => {
    try {
      const db = getStatisticsDB()

      // Add date field
      const sessionWithDate: SessionRecord = {
        ...session,
        date: extractDateFromISO(session.startTime),
      }

      await db.addSession(sessionWithDate)

      console.log(
        '[StatisticsStore] Session recorded:',
        sessionWithDate.sessionId
      )

      // Refresh stats to reflect new data
      await get().refreshStats()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to record session'
      set({ error: errorMessage })
      console.error('[StatisticsStore] Failed to record session:', error)
      throw error
    }
  },

  /**
   * Record an exercise
   * Formula: recordExercise = addToDatabase(exercise) -> refreshStats()
   */
  recordExercise: async (
    exercise: Omit<ExerciseRecord, 'date'>
  ): Promise<void> => {
    try {
      const db = getStatisticsDB()

      // Add date field
      const exerciseWithDate: ExerciseRecord = {
        ...exercise,
        date: extractDateFromISO(exercise.completedAt),
      }

      await db.addExercise(exerciseWithDate)

      console.log(
        '[StatisticsStore] Exercise recorded:',
        exerciseWithDate.exerciseId
      )

      // Refresh stats to reflect new data
      await get().refreshStats()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to record exercise'
      set({ error: errorMessage })
      console.error('[StatisticsStore] Failed to record exercise:', error)
      throw error
    }
  },

  /**
   * Export all data
   * Formula: exportData = fetch(all_records) -> format(json) -> return(ExportData)
   */
  exportData: async (): Promise<ExportData> => {
    try {
      set({ loading: true, error: null })

      const db = getStatisticsDB()

      const [sessions, exercises, dailySummaries] = await Promise.all([
        db.getAllSessions(),
        db.getAllExercises(),
        db.getAllDailySummaries(),
      ])

      const exportData: ExportData = {
        sessions,
        exercises,
        dailySummaries,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          totalRecords:
            sessions.length + exercises.length + dailySummaries.length,
        },
      }

      set({ loading: false })

      console.log('[StatisticsStore] Data exported', {
        sessions: sessions.length,
        exercises: exercises.length,
        summaries: dailySummaries.length,
      })

      return exportData
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to export data'
      set({
        error: errorMessage,
        loading: false,
      })
      console.error('[StatisticsStore] Failed to export data:', error)
      throw error
    }
  },

  /**
   * Clear all data
   * Formula: clearData = confirmAction -> database.clearAll() -> refreshStats()
   */
  clearData: async (): Promise<void> => {
    try {
      set({ loading: true, error: null })

      const db = getStatisticsDB()
      await db.clearAllData()

      // Reset metrics to null
      set({
        todayMetrics: null,
        totalMetrics: null,
        weeklyTrend: null,
        loading: false,
        error: null,
      })

      console.log('[StatisticsStore] All data cleared')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to clear data'
      set({
        error: errorMessage,
        loading: false,
      })
      console.error('[StatisticsStore] Failed to clear data:', error)
      throw error
    }
  },
}))

/**
 * Selectors for common queries
 */
export const statisticsSelectors = {
  // Check if statistics are loaded
  isStatsLoaded: (state: StatisticsStore) => {
    return (
      state.todayMetrics !== null &&
      state.totalMetrics !== null &&
      !state.loading
    )
  },

  // Check if there is any data
  hasData: (state: StatisticsStore) => {
    return state.totalMetrics !== null && state.totalMetrics.totalSessions > 0
  },

  // Get loading state
  isLoading: (state: StatisticsStore) => {
    return state.loading
  },

  // Get error state
  hasError: (state: StatisticsStore) => {
    return state.error !== null
  },
}
