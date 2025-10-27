import { motion } from 'framer-motion'
import Card from '../components/common/Card'
import { ExerciseOverlay } from '../components/exercises/ExerciseOverlay'
import { useExerciseStore } from '../stores/exerciseStore'
import { ExerciseType, ExerciseState } from '../types/exercise'
import { EXERCISE_DEFINITIONS } from '../config/exerciseConfig'

export default function Activities() {
  const { launchExercise, exerciseState } = useExerciseStore()

  const handleStartExercise = (exerciseType: ExerciseType) => {
    launchExercise(exerciseType)
  }

  const exercises = [
    {
      type: ExerciseType.NEAR_FAR_FOCUS,
      gradient: 'from-blue-500 to-cyan-500',
      hoverGradient: 'hover:from-blue-600 hover:to-cyan-600',
    },
    {
      type: ExerciseType.BALL_TRACKING,
      gradient: 'from-purple-500 to-pink-500',
      hoverGradient: 'hover:from-purple-600 hover:to-pink-600',
    },
    {
      type: ExerciseType.BLINK_EXERCISE,
      gradient: 'from-amber-500 to-orange-500',
      hoverGradient: 'hover:from-amber-600 hover:to-orange-600',
    },
  ]

  const isExerciseVisible = exerciseState !== ExerciseState.IDLE

  return (
    <>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Eye Exercises
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose an exercise to start practicing immediately. No need to wait
            for the 20-minute timer!
          </p>
        </div>

        {/* Exercise Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {exercises.map(({ type, gradient, hoverGradient }) => {
            const metadata = EXERCISE_DEFINITIONS[type]

            return (
              <motion.div
                key={type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={() => handleStartExercise(type)}
              >
                <Card hover className="h-full relative overflow-hidden group">
                  {/* Gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} ${hoverGradient} opacity-10 group-hover:opacity-15 transition-opacity`}
                  />

                  {/* Content */}
                  <div className="relative p-6 flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div className="text-6xl md:text-7xl mb-2">
                      {metadata.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {metadata.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {metadata.description}
                    </p>

                    {/* Duration badge */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                      <svg
                        className="w-5 h-5 text-gray-500 dark:text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {metadata.duration} seconds
                      </span>
                    </div>

                    {/* Start button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full mt-4 px-6 py-3 bg-gradient-to-r ${gradient} text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all`}
                      onClick={e => {
                        e.stopPropagation()
                        handleStartExercise(type)
                      }}
                    >
                      Start Now
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Info Section */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Tips for Best Results
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>
                    Practice each exercise 2-3 times daily for optimal eye
                    health
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>
                    Follow the on-screen instructions and maintain proper
                    posture
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>
                    These exercises also appear automatically during your
                    20-minute breaks
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Exercise Overlay */}
      <ExerciseOverlay isVisible={isExerciseVisible} />
    </>
  )
}
