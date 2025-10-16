import { useTimerStore } from '../stores/timerStore'

export default function Home() {
  const { duration, isRunning, start, pause, reset } = useTimerStore()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Home</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Welcome to EyeCare Web - Your eye care companion
      </p>

      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Timer Store Test</h2>
        <p className="mb-2">Duration: {Math.floor(duration / 60)} minutes</p>
        <p className="mb-4">Status: {isRunning ? 'Running' : 'Paused'}</p>
        <div className="flex gap-2">
          <button
            onClick={start}
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
          >
            Start
          </button>
          <button
            onClick={pause}
            className="px-4 py-2 bg-secondary text-gray-900 rounded hover:opacity-90"
          >
            Pause
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:opacity-90"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
