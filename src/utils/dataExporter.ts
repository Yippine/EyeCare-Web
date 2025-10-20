/**
 * Data Exporter Utility
 * Formula: DataExporter = export(json_format) + download(blob) + privacy(user_confirmation)
 */

import type { ExportData } from '../types/statistics'

/**
 * Export data as JSON file
 * Formula: exportAsJSON = format(data) -> createBlob -> triggerDownload
 */
export function exportAsJSON(data: ExportData): void {
  try {
    // Format JSON with indentation for readability
    const jsonString = JSON.stringify(data, null, 2)

    // Create blob
    const blob = new Blob([jsonString], { type: 'application/json' })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `eyecare-statistics-${data.metadata.exportedAt.split('T')[0]}.json`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log('[DataExporter] Data exported successfully', {
      totalRecords: data.metadata.totalRecords,
      filename: link.download,
    })
  } catch (error) {
    console.error('[DataExporter] Failed to export data:', error)
    throw error
  }
}

/**
 * Export data as CSV file (for compatibility with Excel)
 * Formula: exportAsCSV = convert(data -> csv) -> createBlob -> triggerDownload
 */
export function exportSessionsAsCSV(data: ExportData): void {
  try {
    // CSV headers
    const headers = [
      'Session ID',
      'Start Time',
      'End Time',
      'Duration (seconds)',
      'Duration (minutes)',
      'Completed',
      'Date',
    ].join(',')

    // CSV rows
    const rows = data.sessions.map(session => {
      return [
        session.sessionId,
        session.startTime,
        session.endTime,
        session.duration,
        Math.round(session.duration / 60),
        session.completed ? 'Yes' : 'No',
        session.date,
      ].join(',')
    })

    const csvString = [headers, ...rows].join('\n')

    // Create blob
    const blob = new Blob([csvString], { type: 'text/csv' })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `eyecare-sessions-${data.metadata.exportedAt.split('T')[0]}.csv`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log('[DataExporter] Sessions exported as CSV')
  } catch (error) {
    console.error('[DataExporter] Failed to export CSV:', error)
    throw error
  }
}

/**
 * Format data size for display
 * Formula: formatDataSize = calculate(bytes) -> format(KB | MB)
 */
export function formatDataSize(data: ExportData): string {
  const jsonString = JSON.stringify(data)
  const bytes = new Blob([jsonString]).size
  const kilobytes = bytes / 1024

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(2)} KB`
  }

  const megabytes = kilobytes / 1024
  return `${megabytes.toFixed(2)} MB`
}

/**
 * Generate export summary for user confirmation
 * Formula: generateExportSummary = count(records) + calculate(size) + format(text)
 */
export function generateExportSummary(data: ExportData): string {
  const { sessions, exercises, dailySummaries, metadata } = data
  const size = formatDataSize(data)

  return `
Export Summary:
- Sessions: ${sessions.length}
- Exercises: ${exercises.length}
- Daily Summaries: ${dailySummaries.length}
- Total Records: ${metadata.totalRecords}
- Data Size: ${size}
- Export Date: ${new Date(metadata.exportedAt).toLocaleString()}
  `.trim()
}
