import { Outlet } from 'react-router-dom'
import TabBar from './TabBar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pb-16">
      <main className="container mx-auto">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
