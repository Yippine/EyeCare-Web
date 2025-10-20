/**
 * Statistics Database Layer
 * Formula: StatisticsDB = IndexedDB(EyeCareDB) + idb_wrapper + CRUD_operations + version_management
 *
 * Database Schema:
 * - sessions: SessionRecord[] (with indexes: date, sessionId)
 * - exercises: ExerciseRecord[] (with indexes: date, sessionId, exerciseType)
 * - dailySummaries: DailySummary[] (with primary key: date)
 */

import { openDB, DBSchema, IDBPDatabase, IDBPTransaction } from 'idb'
import {
  SessionRecord,
  ExerciseRecord,
  DailySummary,
  DatabaseState,
  DatabaseError,
} from '../types/statistics'

/**
 * Database schema definition
 */
interface EyeCareDBSchema extends DBSchema {
  sessions: {
    key: string // sessionId
    value: SessionRecord
    indexes: {
      'by-date': string // date index
      'by-sessionId': string // sessionId index
    }
  }
  exercises: {
    key: string // exerciseId
    value: ExerciseRecord
    indexes: {
      'by-date': string // date index
      'by-sessionId': string // sessionId index
      'by-exerciseType': string // exerciseType index
    }
  }
  dailySummaries: {
    key: string // date (YYYY-MM-DD)
    value: DailySummary
  }
}

/**
 * Database configuration
 */
const DB_CONFIG = {
  name: 'EyeCareDB',
  version: 1,
  retentionDays: 90, // Keep detailed records for 90 days
} as const

/**
 * StatisticsDB class - handles all IndexedDB operations
 */
export class StatisticsDB {
  private db: IDBPDatabase<EyeCareDBSchema> | null = null
  private state: DatabaseState = DatabaseState.CLOSED
  private initPromise: Promise<void> | null = null

  /**
   * Initialize database connection
   * Formula: initialize = openDB + createObjectStores + createIndexes
   */
  async initialize(): Promise<void> {
    // Return existing initialization if in progress
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this._initializeInternal()
    return this.initPromise
  }

  private async _initializeInternal(): Promise<void> {
    try {
      this.state = DatabaseState.OPENING

      this.db = await openDB<EyeCareDBSchema>(
        DB_CONFIG.name,
        DB_CONFIG.version,
        {
          upgrade(db, oldVersion, newVersion) {
            console.log(
              `[StatisticsDB] Upgrading database from v${oldVersion} to v${newVersion}`
            )

            // Create sessions store
            if (!db.objectStoreNames.contains('sessions')) {
              const sessionsStore = db.createObjectStore('sessions', {
                keyPath: 'sessionId',
              })
              sessionsStore.createIndex('by-date', 'date', { unique: false })
              sessionsStore.createIndex('by-sessionId', 'sessionId', {
                unique: true,
              })
              console.log('[StatisticsDB] Created sessions store with indexes')
            }

            // Create exercises store
            if (!db.objectStoreNames.contains('exercises')) {
              const exercisesStore = db.createObjectStore('exercises', {
                keyPath: 'exerciseId',
              })
              exercisesStore.createIndex('by-date', 'date', { unique: false })
              exercisesStore.createIndex('by-sessionId', 'sessionId', {
                unique: false,
              })
              exercisesStore.createIndex('by-exerciseType', 'exerciseType', {
                unique: false,
              })
              console.log('[StatisticsDB] Created exercises store with indexes')
            }

            // Create dailySummaries store
            if (!db.objectStoreNames.contains('dailySummaries')) {
              db.createObjectStore('dailySummaries', {
                keyPath: 'date',
              })
              console.log('[StatisticsDB] Created dailySummaries store')
            }
          },
          blocked() {
            console.warn(
              '[StatisticsDB] Database upgrade blocked by another connection'
            )
          },
          blocking() {
            console.warn(
              '[StatisticsDB] This connection is blocking another upgrade'
            )
          },
          terminated() {
            console.error('[StatisticsDB] Database connection terminated')
          },
        }
      )

      this.state = DatabaseState.OPEN
      console.log('[StatisticsDB] Database initialized successfully')

      // Run cleanup on initialization
      await this.cleanupOldRecords()
    } catch (error) {
      this.state = DatabaseState.ERROR
      console.error('[StatisticsDB] Failed to initialize database:', error)
      this.handleDatabaseError(error)
      throw error
    }
  }

  /**
   * Add a session record
   * Formula: addSession = transaction(readwrite) + sessions.add(record) + updateDailySummary
   */
  async addSession(session: SessionRecord): Promise<void> {
    await this.ensureInitialized()

    try {
      const tx = this.db!.transaction(
        ['sessions', 'dailySummaries'],
        'readwrite'
      )

      // Add session record
      await tx.objectStore('sessions').add(session)

      // Update daily summary
      await this.updateDailySummaryForSession(session, tx)

      await tx.done
      console.log(`[StatisticsDB] Added session: ${session.sessionId}`)
    } catch (error) {
      console.error('[StatisticsDB] Failed to add session:', error)
      throw this.wrapDatabaseError(error)
    }
  }

  /**
   * Add an exercise record
   * Formula: addExercise = transaction(readwrite) + exercises.add(record) + updateDailySummary
   */
  async addExercise(exercise: ExerciseRecord): Promise<void> {
    await this.ensureInitialized()

    try {
      const tx = this.db!.transaction(
        ['exercises', 'dailySummaries'],
        'readwrite'
      )

      // Add exercise record
      await tx.objectStore('exercises').add(exercise)

      // Update daily summary
      await this.updateDailySummaryForExercise(exercise, tx)

      await tx.done
      console.log(`[StatisticsDB] Added exercise: ${exercise.exerciseId}`)
    } catch (error) {
      console.error('[StatisticsDB] Failed to add exercise:', error)
      throw this.wrapDatabaseError(error)
    }
  }

  /**
   * Get sessions by date range
   * Formula: getSessionsByDateRange = index(by-date).getAll(lowerBound, upperBound)
   */
  async getSessionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<SessionRecord[]> {
    await this.ensureInitialized()

    try {
      const sessions = await this.db!.getAllFromIndex(
        'sessions',
        'by-date',
        IDBKeyRange.bound(startDate, endDate)
      )
      return sessions
    } catch (error) {
      console.error(
        '[StatisticsDB] Failed to get sessions by date range:',
        error
      )
      throw this.wrapDatabaseError(error)
    }
  }

  /**
   * Get exercises by date range
   * Formula: getExercisesByDateRange = index(by-date).getAll(lowerBound, upperBound)
   */
  async getExercisesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ExerciseRecord[]> {
    await this.ensureInitialized()

    try {
      const exercises = await this.db!.getAllFromIndex(
        'exercises',
        'by-date',
        IDBKeyRange.bound(startDate, endDate)
      )
      return exercises
    } catch (error) {
      console.error(
        '[StatisticsDB] Failed to get exercises by date range:',
        error
      )
      throw this.wrapDatabaseError(error)
    }
  }

  /**
   * Get daily summary for a specific date
   * Formula: getDailySummary = dailySummaries.get(date)
   */
  async getDailySummary(date: string): Promise<DailySummary | null> {
    await this.ensureInitialized()

    try {
      const summary = await this.db!.get('dailySummaries', date)
      return summary || null
    } catch (error) {
      console.error('[StatisticsDB] Failed to get daily summary:', error)
      throw this.wrapDatabaseError(error)
    }
  }

  /**
   * Get daily summaries by date range
   * Formula: getDailySummariesByDateRange = dailySummaries.getAll(lowerBound, upperBound)
   */
  async getDailySummariesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<DailySummary[]> {
    await this.ensureInitialized()

    try {
      const allSummaries = await this.db!.getAll('dailySummaries')
      return allSummaries.filter(
        summary => summary.date >= startDate && summary.date <= endDate
      )
    } catch (error) {
      console.error(
        '[StatisticsDB] Failed to get daily summaries by date range:',
        error
      )
      throw this.wrapDatabaseError(error)
    }
  }

  /**
   * Update daily summary (used internally during add operations)
   * Formula: updateDailySummary = aggregate(sessions + exercises) -> put(summary)
   */
  private async updateDailySummaryForSession(
    session: SessionRecord,
    tx: IDBPTransaction<
      EyeCareDBSchema,
      ('sessions' | 'dailySummaries')[],
      'readwrite'
    >
  ): Promise<void> {
    const date = session.date
    const summaryStore = tx.objectStore('dailySummaries')

    // Get existing summary or create new one
    let summary: DailySummary | undefined = await summaryStore.get(date)

    if (!summary) {
      summary = {
        date,
        sessionCount: 0,
        totalDuration: 0,
        exerciseCount: 0,
        breakAdherence: 0,
        exerciseBreakdown: {} as Record<string, number>,
        updatedAt: new Date().toISOString(),
      }
    }

    // Update summary with session data
    if (session.completed) {
      summary.sessionCount += 1
      summary.totalDuration += session.duration
    }

    summary.updatedAt = new Date().toISOString()

    // Put updated summary
    await summaryStore.put(summary)
  }

  private async updateDailySummaryForExercise(
    exercise: ExerciseRecord,
    tx: IDBPTransaction<
      EyeCareDBSchema,
      ('exercises' | 'dailySummaries')[],
      'readwrite'
    >
  ): Promise<void> {
    const date = exercise.date
    const summaryStore = tx.objectStore('dailySummaries')

    // Get existing summary or create new one
    let summary: DailySummary | undefined = await summaryStore.get(date)

    if (!summary) {
      summary = {
        date,
        sessionCount: 0,
        totalDuration: 0,
        exerciseCount: 0,
        breakAdherence: 0,
        exerciseBreakdown: {} as Record<string, number>,
        updatedAt: new Date().toISOString(),
      }
    }

    // Update summary with exercise data
    summary.exerciseCount += 1
    summary.exerciseBreakdown[exercise.exerciseType] =
      (summary.exerciseBreakdown[exercise.exerciseType] || 0) + 1

    // Recalculate break adherence
    if (summary.sessionCount > 0) {
      summary.breakAdherence = Math.round(
        (summary.exerciseCount / summary.sessionCount) * 100
      )
    }

    summary.updatedAt = new Date().toISOString()

    // Put updated summary
    await summaryStore.put(summary)
  }

  /**
   * Get all sessions (for export)
   */
  async getAllSessions(): Promise<SessionRecord[]> {
    await this.ensureInitialized()

    try {
      return await this.db!.getAll('sessions')
    } catch (error) {
      console.error('[StatisticsDB] Failed to get all sessions:', error)
      throw this.wrapDatabaseError(error)
    }
  }

  /**
   * Get all exercises (for export)
   */
  async getAllExercises(): Promise<ExerciseRecord[]> {
    await this.ensureInitialized()

    try {
      return await this.db!.getAll('exercises')
    } catch (error) {
      console.error('[StatisticsDB] Failed to get all exercises:', error)
      throw this.wrapDatabaseError(error)
    }
  }

  /**
   * Get all daily summaries (for export)
   */
  async getAllDailySummaries(): Promise<DailySummary[]> {
    await this.ensureInitialized()

    try {
      return await this.db!.getAll('dailySummaries')
    } catch (error) {
      console.error('[StatisticsDB] Failed to get all daily summaries:', error)
      throw this.wrapDatabaseError(error)
    }
  }

  /**
   * Clear all data
   * Formula: clearData = transaction(readwrite) + clear(sessions + exercises + dailySummaries)
   */
  async clearAllData(): Promise<void> {
    await this.ensureInitialized()

    try {
      const tx = this.db!.transaction(
        ['sessions', 'exercises', 'dailySummaries'],
        'readwrite'
      )

      await tx.objectStore('sessions').clear()
      await tx.objectStore('exercises').clear()
      await tx.objectStore('dailySummaries').clear()

      await tx.done
      console.log('[StatisticsDB] Cleared all data')
    } catch (error) {
      console.error('[StatisticsDB] Failed to clear data:', error)
      throw this.wrapDatabaseError(error)
    }
  }

  /**
   * Cleanup old records (older than retention period)
   * Formula: cleanupOldRecords = calculate(cutoffDate) + delete(records < cutoffDate)
   */
  async cleanupOldRecords(): Promise<void> {
    await this.ensureInitialized()

    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - DB_CONFIG.retentionDays)
      const cutoffDateString = cutoffDate.toISOString().split('T')[0]

      const tx = this.db!.transaction(['sessions', 'exercises'], 'readwrite')

      // Delete old sessions
      const oldSessions = await tx
        .objectStore('sessions')
        .index('by-date')
        .getAllKeys(IDBKeyRange.upperBound(cutoffDateString, true))

      for (const key of oldSessions) {
        await tx.objectStore('sessions').delete(key)
      }

      // Delete old exercises
      const oldExercises = await tx
        .objectStore('exercises')
        .index('by-date')
        .getAllKeys(IDBKeyRange.upperBound(cutoffDateString, true))

      for (const key of oldExercises) {
        await tx.objectStore('exercises').delete(key)
      }

      await tx.done

      if (oldSessions.length > 0 || oldExercises.length > 0) {
        console.log(
          `[StatisticsDB] Cleaned up ${oldSessions.length} sessions and ${oldExercises.length} exercises older than ${cutoffDateString}`
        )
      }
    } catch (error) {
      console.error('[StatisticsDB] Failed to cleanup old records:', error)
      // Don't throw - cleanup is best-effort
    }
  }

  /**
   * Get database state
   */
  getState(): DatabaseState {
    return this.state
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
      this.state = DatabaseState.CLOSED
      this.initPromise = null
      console.log('[StatisticsDB] Database closed')
    }
  }

  /**
   * Ensure database is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (this.state === DatabaseState.OPEN && this.db) {
      return
    }

    if (this.state === DatabaseState.ERROR) {
      throw new Error('Database is in error state')
    }

    await this.initialize()
  }

  /**
   * Handle database errors with specific error types
   */
  private handleDatabaseError(error: unknown): void {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      if (message.includes('quota')) {
        console.error('[StatisticsDB] Quota exceeded - storage limit reached')
      } else if (message.includes('private') || message.includes('incognito')) {
        console.error(
          '[StatisticsDB] Private browsing mode - IndexedDB may be unavailable'
        )
      } else if (message.includes('version')) {
        console.error(
          '[StatisticsDB] Version change error - another tab may have upgraded the database'
        )
      } else {
        console.error('[StatisticsDB] Database error:', error)
      }
    }
  }

  /**
   * Wrap database errors with custom error types
   */
  private wrapDatabaseError(error: unknown): Error {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      if (message.includes('quota')) {
        return new Error(`${DatabaseError.QUOTA_EXCEEDED}: ${error.message}`)
      } else if (message.includes('private') || message.includes('incognito')) {
        return new Error(`${DatabaseError.PRIVATE_BROWSING}: ${error.message}`)
      } else if (message.includes('version')) {
        return new Error(`${DatabaseError.VERSION_CHANGE}: ${error.message}`)
      } else {
        return new Error(
          `${DatabaseError.TRANSACTION_FAILED}: ${error.message}`
        )
      }
    }

    return new Error(`${DatabaseError.TRANSACTION_FAILED}: Unknown error`)
  }
}

// Singleton instance
let dbInstance: StatisticsDB | null = null

/**
 * Get singleton database instance
 * Formula: getDatabase = singleton(StatisticsDB)
 */
export function getStatisticsDB(): StatisticsDB {
  if (!dbInstance) {
    dbInstance = new StatisticsDB()
  }
  return dbInstance
}

/**
 * Reset database instance (for testing)
 */
export function resetStatisticsDB(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
