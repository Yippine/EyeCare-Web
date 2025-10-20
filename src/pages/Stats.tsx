/**
 * Statistics Page
 * Formula: StatisticsPage = Hero + TodayMetrics + TotalMetrics + WeeklyTrend + Actions
 */

import { useEffect } from 'react'
import {
  useStatisticsStore,
  statisticsSelectors,
} from '../stores/statisticsStore'
import { useStatisticsSync } from '../hooks/useStatisticsSync'
import { exportAsJSON, generateExportSummary } from '../utils/dataExporter'
import {
  formatDuration,
  getExerciseTypeName,
} from '../utils/statisticsCalculator'
import { motion } from 'framer-motion'
import type { WeeklyTrend } from '../types/statistics'
import { ExerciseType } from '../types/exercise'

export default function Stats() {
  // Initialize statistics sync
  useStatisticsSync()

  const {
    todayMetrics,
    totalMetrics,
    weeklyTrend,
    loading,
    error,
    refreshStats,
    exportData,
    clearData,
  } = useStatisticsStore()

  const hasData = statisticsSelectors.hasData(useStatisticsStore.getState())

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  const handleExport = async () => {
    try {
      const data = await exportData()
      const summary = generateExportSummary(data)

      if (window.confirm(`Export your data?\n\n${summary}`)) {
        exportAsJSON(data)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  const handleClearData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all statistics data? This action cannot be undone.'
    )

    if (confirmed) {
      try {
        await clearData()
        alert('All data has been cleared.')
      } catch (error) {
        console.error('Clear data failed:', error)
        alert('Failed to clear data. Please try again.')
      }
    }
  }

  if (loading && !todayMetrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading statistics...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-300 font-semibold mb-2">
            Error Loading Statistics
          </h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={refreshStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold mb-2">No Statistics Yet</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Start using the timer to see your statistics here
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Statistics</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track your eye care progress and habits
        </p>
      </motion.div>

      {/* Today's Metrics */}
      {todayMetrics && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Today</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Sessions"
              value={todayMetrics.sessionCount}
              icon="🎯"
            />
            <MetricCard
              label="Work Time"
              value={formatDuration(todayMetrics.workDuration)}
              icon="⏱️"
            />
            <MetricCard
              label="Exercises"
              value={todayMetrics.exerciseCount}
              icon="👁️"
            />
            <MetricCard
              label="Break Rate"
              value={`${todayMetrics.breakRate}%`}
              icon="✅"
            />
          </div>
        </motion.section>
      )}

      {/* Total Metrics */}
      {totalMetrics && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">All Time</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Total Sessions"
              value={totalMetrics.totalSessions}
              icon="📈"
            />
            <MetricCard
              label="Total Hours"
              value={`${totalMetrics.totalHours}h`}
              icon="⏰"
            />
            <MetricCard
              label="Current Streak"
              value={`${totalMetrics.currentStreak} days`}
              icon="🔥"
            />
            <MetricCard
              label="Longest Streak"
              value={`${totalMetrics.longestStreak} days`}
              icon="🏆"
            />
          </div>

          {/* Exercise Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Exercise Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(totalMetrics.exerciseBreakdown).map(
                ([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      {getExerciseTypeName(type as ExerciseType)}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Weekly Trend */}
      {weeklyTrend && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Last 7 Days</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <WeeklyChart weeklyTrend={weeklyTrend} />
          </div>
        </motion.section>
      )}

      {/* Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={handleExport}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Export Data
        </button>
        <button
          onClick={handleClearData}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Clear All Data
        </button>
      </motion.section>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  )
}

function WeeklyChart({ weeklyTrend }: { weeklyTrend: WeeklyTrend }) {
  const maxSessions = Math.max(...weeklyTrend.sessionCounts, 1)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-40">
        {weeklyTrend.dates.map((date: string, index: number) => {
          const count = weeklyTrend.sessionCounts[index]
          const height = (count / maxSessions) * 100

          return (
            <div key={date} className="flex-1 flex flex-col items-center">
              <div
                className="relative w-full flex items-end justify-center mb-2"
                style={{ height: '120px' }}
              >
                {count > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="w-full bg-primary rounded-t relative"
                  >
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold">
                      {count}
                    </span>
                  </motion.div>
                )}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
