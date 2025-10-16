import { useState } from 'react'
import { useTimerStore } from '../../stores/timerStore'
import { TimerMode } from '../../types'
import Button from '../common/Button'
import Modal from '../common/Modal'

interface TimerControlProps {
  timerMode: TimerMode
}

/**
 * Timer control buttons with dynamic states
 */
export default function TimerControl({ timerMode }: TimerControlProps) {
  const { startWork, pauseTimer, resumeTimer, resetTimer } = useTimerStore()
  const [showResetModal, setShowResetModal] = useState(false)

  const handleStart = () => {
    startWork()
  }

  const handlePause = () => {
    pauseTimer()
  }

  const handleResume = () => {
    resumeTimer()
  }

  const handleResetClick = () => {
    setShowResetModal(true)
  }

  const handleResetConfirm = () => {
    resetTimer()
    setShowResetModal(false)
  }

  const handleResetCancel = () => {
    setShowResetModal(false)
  }

  // Render buttons based on current timer mode
  const renderButtons = () => {
    switch (timerMode) {
      case TimerMode.IDLE:
        return (
          <Button onClick={handleStart} variant="primary" size="lg">
            Start Working (20 min)
          </Button>
        )

      case TimerMode.WORKING:
      case TimerMode.BREAK_REMINDER:
        return (
          <div className="flex gap-3">
            <Button onClick={handlePause} variant="secondary" size="lg">
              Pause
            </Button>
            <Button onClick={handleResetClick} variant="outline" size="lg">
              Reset
            </Button>
          </div>
        )

      case TimerMode.PAUSED:
        return (
          <div className="flex gap-3">
            <Button onClick={handleResume} variant="primary" size="lg">
              Resume
            </Button>
            <Button onClick={handleResetClick} variant="outline" size="lg">
              Reset
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <div className="flex justify-center">{renderButtons()}</div>

      <Modal
        isOpen={showResetModal}
        onClose={handleResetCancel}
        title="Reset Timer?"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to reset the timer? Your current progress will
          be lost.
        </p>
        <div className="flex gap-3 justify-end">
          <Button onClick={handleResetCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleResetConfirm} variant="primary">
            Reset
          </Button>
        </div>
      </Modal>
    </>
  )
}
