import { useStatsStore } from '../stores/statsStore'

export default function Stats() {
  const { totalSessions, totalTime, recordSession } = useStatsStore()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Stats</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        View your progress and statistics
      </p>

      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Stats Store Test</h2>
        <p className="mb-2">Total Sessions: {totalSessions}</p>
        <p className="mb-4">Total Time: {Math.floor(totalTime / 60)} minutes</p>
        <button
          onClick={() => recordSession(1200, 'work')}
          className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
        >
          Record Session (20 min)
        </button>
      </div>
    </div>
  )
}
