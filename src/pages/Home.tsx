import { useEffect } from 'react'
import { useTimerEngine } from '../hooks/useTimerEngine'
import { useExerciseOrchestrator } from '../hooks/useExerciseOrchestrator'
import CountdownDisplay from '../components/timer/CountdownDisplay'
import TimerControl from '../components/timer/TimerControl'
import SessionCounter from '../components/timer/SessionCounter'
import ProgressRing from '../components/common/ProgressRing'
import Card from '../components/common/Card'
import { ExerciseOverlay } from '../components/exercises/ExerciseOverlay'
import { setupConsoleLogger } from '../utils/eventEmitter'

export default function Home() {
  const {
    progressPercentage,
    formattedTime,
    timerMode,
    currentPhase,
    sessionCount,
  } = useTimerEngine()

  // Setup exercise orchestrator (Increment 4)
  const { isExerciseOverlayVisible } = useExerciseOrchestrator()

  // Setup console logger for event verification (acceptance criteria 8)
  useEffect(() => {
    setupConsoleLogger()
  }, [])

  return (
    <>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl">
          <Card className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Eye Care Timer
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Follow the 20-20-20 rule: Every 20 minutes, take a 20-second
                break
              </p>
            </div>

            {/* Progress Ring */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <ProgressRing
                  progress={progressPercentage}
                  size={280}
                  strokeWidth={12}
                  showPercentage={false}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CountdownDisplay
                    formattedTime={formattedTime}
                    timerMode={timerMode}
                    currentPhase={currentPhase}
                  />
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="mb-8">
              <TimerControl timerMode={timerMode} />
            </div>

            {/* Session Counter */}
            <div className="flex justify-center">
              <SessionCounter sessionCount={sessionCount} />
            </div>

            {/* Info */}
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                💡 Tip: Look at something 20 feet (6 meters) away during breaks
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Exercise Overlay (Increment 4) */}
      <ExerciseOverlay isVisible={isExerciseOverlayVisible} />
    </>
  )
}
