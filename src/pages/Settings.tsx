import { useSettingsStore } from '../stores/settingsStore'
import { NotificationSettings } from '../components/Settings/NotificationSettings'
import { useNotification } from '../hooks/useNotification'
import { InstallPrompt } from '../components/pwa/InstallPrompt'

export default function Settings() {
  const { theme, notifications, toggleTheme, toggleNotifications } =
    useSettingsStore()
  const { permissionStatus, requestPermission } = useNotification()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Customize your preferences
      </p>

      <div className="space-y-6">
        {/* PWA Install Prompt */}
        <InstallPrompt variant="banner" />

        {/* Notification Settings Section */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <NotificationSettings
            permissionStatus={permissionStatus}
            onRequestPermission={requestPermission}
          />
        </div>

        {/* General Settings Section */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2">Theme: {theme}</p>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
              >
                Toggle Theme
              </button>
            </div>
            <div>
              <p className="mb-2">
                Notifications: {notifications ? 'Enabled' : 'Disabled'}
              </p>
              <button
                onClick={toggleNotifications}
                className="px-4 py-2 bg-secondary text-gray-900 rounded hover:opacity-90"
              >
                Toggle Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
