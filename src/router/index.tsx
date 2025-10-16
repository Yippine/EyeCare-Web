import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import Activities from '../pages/Activities'
import Stats from '../pages/Stats'
import Settings from '../pages/Settings'
import Layout from '../components/layout/Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'activities',
        element: <Activities />,
      },
      {
        path: 'stats',
        element: <Stats />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
])
