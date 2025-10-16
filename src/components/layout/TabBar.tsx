import { NavLink } from 'react-router-dom'

const tabs = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/activities', label: 'Activities', icon: '📋' },
  { path: '/stats', label: 'Stats', icon: '📊' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-primary dark:text-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`
            }
          >
            <span className="text-2xl mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
