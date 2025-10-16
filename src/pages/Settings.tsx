import { useSettingsStore } from '../stores/settingsStore'

export default function Settings() {
  const { theme, notifications, toggleTheme, toggleNotifications } =
    useSettingsStore()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Customize your preferences
      </p>

      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Settings Store Test</h2>
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
  )
}
