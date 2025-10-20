/**
 * Update Notification Component
 * Increment 6 (PWACapability)
 *
 * Toast notification for app updates
 */

import { useUpdateFlow } from '@/hooks/usePWA'
import { useState } from 'react'

interface UpdateNotificationProps {
  className?: string
}

export function UpdateNotification({
  className = '',
}: UpdateNotificationProps) {
  const { updateAvailable, applyUpdate } = useUpdateFlow()
  const [dismissed, setDismissed] = useState(false)

  const handleUpdate = () => {
    applyUpdate()
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  // Don't show if no update or dismissed
  if (!updateAvailable || dismissed) {
    return null
  }

  return (
    <div className={`update-notification ${className}`}>
      <div className="update-notification-content">
        <div className="update-notification-icon">🔄</div>
        <div className="update-notification-text">
          <h4>Update Available</h4>
          <p>A new version of EyeCare is ready to install</p>
        </div>
        <div className="update-notification-actions">
          <button onClick={handleUpdate} className="update-notification-update">
            Update Now
          </button>
          <button
            onClick={handleDismiss}
            className="update-notification-dismiss"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

// Styles
const styles = `
  .update-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    max-width: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    z-index: 9998;
    animation: update-slide-in 0.3s ease-out;
  }

  .update-notification-content {
    padding: 16px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .update-notification-icon {
    font-size: 28px;
    flex-shrink: 0;
    animation: update-rotate 2s linear infinite;
  }

  .update-notification-text {
    flex: 1;
  }

  .update-notification-text h4 {
    font-size: 15px;
    font-weight: 600;
    color: #1E293B;
    margin: 0 0 4px 0;
  }

  .update-notification-text p {
    font-size: 13px;
    color: #64748B;
    margin: 0;
  }

  .update-notification-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
    width: 100%;
  }

  .update-notification-update {
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    width: 100%;
  }

  .update-notification-update:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .update-notification-dismiss {
    background: transparent;
    color: #64748B;
    border: 1px solid #E2E8F0;
    padding: 8px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    width: 100%;
  }

  .update-notification-dismiss:hover {
    background: #F8FAFC;
    border-color: #CBD5E1;
  }

  @keyframes update-slide-in {
    from {
      transform: translateX(120%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes update-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    .update-notification {
      bottom: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
    }
    .update-notification-content {
      flex-direction: column;
    }
    .update-notification-icon {
      font-size: 24px;
    }
  }
`

// Inject styles (only once)
if (
  typeof document !== 'undefined' &&
  !document.getElementById('update-notification-styles')
) {
  const styleSheet = document.createElement('style')
  styleSheet.id = 'update-notification-styles'
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
