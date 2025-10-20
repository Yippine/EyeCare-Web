import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useNotification } from './hooks/useNotification'
import { NotificationPopup } from './components/NotificationPopup'
import { UpdateNotification } from './components/pwa/UpdateNotification'

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
      <UpdateNotification />
    </>
  )
}

export default App
