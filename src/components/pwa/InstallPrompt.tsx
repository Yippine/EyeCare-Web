/**
 * Install Prompt Component
 * Increment 6 (PWACapability)
 *
 * Button to prompt PWA installation
 */

import { useInstallPrompt } from '@/hooks/usePWA'

interface InstallPromptProps {
  className?: string
  variant?: 'banner' | 'button' | 'minimal'
}

export function InstallPrompt({
  className = '',
  variant = 'button',
}: InstallPromptProps) {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt()

  const handleInstall = async () => {
    try {
      await promptInstall()
    } catch (error) {
      console.error('Install failed:', error)
    }
  }

  // Don't show if can't install or already installed
  if (!canInstall || isInstalled) {
    return null
  }

  // Banner variant (prominent)
  if (variant === 'banner') {
    return (
      <div className={`install-banner ${className}`}>
        <div className="install-banner-content">
          <div className="install-banner-icon">📱</div>
          <div className="install-banner-text">
            <h3>Install EyeCare</h3>
            <p>Get quick access from your home screen</p>
          </div>
          <button onClick={handleInstall} className="install-banner-button">
            Install
          </button>
        </div>
      </div>
    )
  }

  // Minimal variant (icon only)
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleInstall}
        className={`install-minimal ${className}`}
        title="Install app"
        aria-label="Install app"
      >
        ⬇️
      </button>
    )
  }

  // Button variant (default)
  return (
    <button onClick={handleInstall} className={`install-button ${className}`}>
      <span className="install-button-icon">📱</span>
      <span className="install-button-text">Install App</span>
    </button>
  )
}

// Styles
const styles = `
  .install-banner {
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    margin-bottom: 16px;
  }

  .install-banner-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .install-banner-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .install-banner-text {
    flex: 1;
  }

  .install-banner-text h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
  }

  .install-banner-text p {
    font-size: 13px;
    margin: 0;
    opacity: 0.9;
  }

  .install-banner-button {
    background: white;
    color: #3B82F6;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .install-banner-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .install-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .install-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  .install-button-icon {
    font-size: 18px;
  }

  .install-minimal {
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    transition: transform 0.2s;
  }

  .install-minimal:hover {
    transform: scale(1.1);
  }

  @media (max-width: 640px) {
    .install-banner {
      padding: 12px;
    }
    .install-banner-icon {
      font-size: 28px;
    }
    .install-banner-text h3 {
      font-size: 15px;
    }
    .install-banner-text p {
      font-size: 12px;
    }
    .install-banner-button {
      padding: 8px 16px;
      font-size: 13px;
    }
  }
`

// Inject styles (only once)
if (
  typeof document !== 'undefined' &&
  !document.getElementById('install-prompt-styles')
) {
  const styleSheet = document.createElement('style')
  styleSheet.id = 'install-prompt-styles'
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
