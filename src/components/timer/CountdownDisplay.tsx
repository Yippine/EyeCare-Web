import { TimerMode } from '../../types'

interface CountdownDisplayProps {
  formattedTime: string
  timerMode: TimerMode
  currentPhase: 'work' | 'break' | null
}

/**
 * Countdown display showing MM:SS with color-coded states
 */
export default function CountdownDisplay({
  formattedTime,
  timerMode,
  currentPhase,
}: CountdownDisplayProps) {
  // Color coding based on timer mode
  const getTextColor = () => {
    switch (timerMode) {
      case TimerMode.WORKING:
        return 'text-primary'
      case TimerMode.BREAK_REMINDER:
        return 'text-secondary'
      case TimerMode.PAUSED:
        return 'text-gray-500'
      case TimerMode.IDLE:
      default:
        return 'text-gray-700 dark:text-gray-300'
    }
  }

  const getPhaseLabel = () => {
    if (currentPhase === 'work') return 'Working'
    if (currentPhase === 'break') return 'Break Time'
    return 'Ready'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`text-6xl md:text-8xl font-bold font-mono transition-colors ${getTextColor()}`}
      >
        {formattedTime}
      </div>
      <div className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
        {getPhaseLabel()}
      </div>
    </div>
  )
}
