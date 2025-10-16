import { useSettingsStore } from '../../stores/settingsStore'
import { NotificationPermissionState } from '../../types/notification'

export interface NotificationSettingsProps {
  permissionStatus: NotificationPermissionState
  onRequestPermission: () => void
}

/**
 * Notification settings panel component
 * Provides controls for all notification preferences
 */
export function NotificationSettings({
  permissionStatus,
  onRequestPermission,
}: NotificationSettingsProps) {
  const {
    browserNotificationEnabled,
    audioEnabled,
    vibrationEnabled,
    audioVolume,
    updateNotificationSettings,
  } = useSettingsStore()

  const handleToggle = (
    key: 'browserNotificationEnabled' | 'audioEnabled' | 'vibrationEnabled'
  ) => {
    updateNotificationSettings({ [key]: !useSettingsStore.getState()[key] })
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNotificationSettings({ audioVolume: parseInt(e.target.value) })
  }

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case NotificationPermissionState.Granted:
        return 'Granted'
      case NotificationPermissionState.Denied:
        return 'Denied'
      case NotificationPermissionState.Default:
        return 'Not requested'
      case NotificationPermissionState.Checking:
        return 'Checking...'
      default:
        return 'Unknown'
    }
  }

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case NotificationPermissionState.Granted:
        return 'text-green-600 dark:text-green-400'
      case NotificationPermissionState.Denied:
        return 'text-red-600 dark:text-red-400'
      case NotificationPermissionState.Default:
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure how you want to be notified when it's time for eye care
          breaks.
        </p>
      </div>

      {/* Permission Status */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              Browser Notification Permission
            </p>
            <p
              className={`text-sm font-semibold ${getPermissionStatusColor()}`}
            >
              {getPermissionStatusText()}
            </p>
          </div>
          {permissionStatus === NotificationPermissionState.Default && (
            <button
              onClick={onRequestPermission}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Request Permission
            </button>
          )}
        </div>
      </div>

      {/* Browser Notifications Toggle */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <p className="font-medium">Browser Notifications</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Show system notifications
          </p>
        </div>
        <button
          onClick={() => handleToggle('browserNotificationEnabled')}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${browserNotificationEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
          `}
          role="switch"
          aria-checked={browserNotificationEnabled}
          disabled={permissionStatus !== NotificationPermissionState.Granted}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${browserNotificationEnabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Audio Toggle */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <p className="font-medium">Audio Feedback</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Play sound when notifications appear
          </p>
        </div>
        <button
          onClick={() => handleToggle('audioEnabled')}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${audioEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
          `}
          role="switch"
          aria-checked={audioEnabled}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${audioEnabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Audio Volume Slider */}
      {audioEnabled && (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">Audio Volume</p>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {audioVolume}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={audioVolume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      )}

      {/* Vibration Toggle */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <p className="font-medium">Vibration</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vibrate device on mobile (if supported)
          </p>
        </div>
        <button
          onClick={() => handleToggle('vibrationEnabled')}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${vibrationEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
          `}
          role="switch"
          aria-checked={vibrationEnabled}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${vibrationEnabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  )
}
