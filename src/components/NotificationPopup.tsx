import { motion, AnimatePresence } from 'framer-motion'
import { NotificationType } from '../types/notification'

export interface NotificationPopupProps {
  visible: boolean
  message: string
  type: NotificationType
  onDismiss: () => void
}

/**
 * In-app notification popup component
 * Displays notifications with animations and auto-dismiss
 */
export function NotificationPopup({
  visible,
  message,
  type,
  onDismiss,
}: NotificationPopupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`
              max-w-md w-full rounded-lg shadow-2xl p-6 pointer-events-auto cursor-pointer
              ${
                type === NotificationType.WorkComplete
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                  : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
              }
            `}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            onClick={onDismiss}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {type === NotificationType.WorkComplete ? (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{message}</p>
                <p className="text-sm opacity-90 mt-1">
                  Click anywhere to dismiss
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
