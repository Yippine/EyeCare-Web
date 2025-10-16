import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useNotification } from './hooks/useNotification'
import { NotificationPopup } from './components/NotificationPopup'

function App() {
  const { popupState, dismissPopup } = useNotification()

  return (
    <>
      <RouterProvider router={router} />
      <NotificationPopup
        visible={popupState.visible}
        message={popupState.message}
        type={popupState.type}
        onDismiss={dismissPopup}
      />
    </>
  )
}

export default App
