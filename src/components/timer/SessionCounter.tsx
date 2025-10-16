interface SessionCounterProps {
  sessionCount: number
}

/**
 * Display completed session count
 */
export default function SessionCounter({ sessionCount }: SessionCounterProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="text-3xl">🏆</div>
      <div className="flex flex-col">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Completed Sessions
        </span>
        <span className="text-2xl font-bold text-primary">{sessionCount}</span>
      </div>
    </div>
  )
}
