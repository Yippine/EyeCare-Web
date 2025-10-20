import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { initPWA } from './pwa'

// Initialize PWA features
initPWA({
  enableInstallPrompt: true,
  enableUpdateFlow: true,
  enableOfflineDetection: true,
  updateCheckInterval: 60 * 60 * 1000, // Check for updates every hour
  showIOSInstructions: true,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
