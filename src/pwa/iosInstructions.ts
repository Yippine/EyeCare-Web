/**
 * iOS Installation Instructions
 * Increment 6 (PWACapability)
 *
 * Shows manual installation guide for iOS Safari users
 * (iOS doesn't support beforeinstallprompt event)
 */

import type { IOSDetection } from './types'

const STORAGE_KEY = 'pwa-ios-instructions-shown'
const SHOW_DELAY = 3000 // Show after 3 seconds
const COOLDOWN_DAYS = 7 // Don't show again for 7 days

/**
 * Detect iOS device and Safari browser
 */
export function detectIOS(): IOSDetection {
  const userAgent = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  const isSafari =
    /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)

  // Check if running in standalone mode (already installed)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)

  // Should show instructions if:
  // - Device is iOS
  // - Browser is Safari
  // - Not already in standalone mode
  // - Not shown recently
  const shouldShowInstructions =
    isIOS && isSafari && !isStandalone && !wasRecentlyShown()

  return {
    isIOS,
    isSafari,
    isStandalone,
    shouldShowInstructions,
  }
}

/**
 * Check if instructions were shown recently
 */
function wasRecentlyShown(): boolean {
  try {
    const lastShown = localStorage.getItem(STORAGE_KEY)
    if (!lastShown) return false

    const lastShownTime = parseInt(lastShown, 10)
    const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    return Date.now() - lastShownTime < cooldownMs
  } catch {
    return false
  }
}

/**
 * Mark instructions as shown
 */
function markAsShown(): void {
  try {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  } catch (error) {
    console.warn('[IOSInstructions] Failed to save shown state:', error)
  }
}

/**
 * Show iOS installation instructions modal
 */
export function showIOSInstructions(autoShow = true): void {
  const detection = detectIOS()

  // Don't show if conditions not met
  if (autoShow && !detection.shouldShowInstructions) {
    return
  }

  // Show after delay for better UX
  setTimeout(() => {
    createInstructionsModal()
    markAsShown()
  }, SHOW_DELAY)
}

/**
 * Create and display instructions modal
 */
function createInstructionsModal(): void {
  // Check if modal already exists
  if (document.getElementById('pwa-ios-instructions')) {
    return
  }

  // Create modal elements
  const overlay = document.createElement('div')
  overlay.id = 'pwa-ios-instructions'
  overlay.className = 'pwa-ios-overlay'

  overlay.innerHTML = `
    <div class="pwa-ios-modal">
      <button class="pwa-ios-close" aria-label="Close">×</button>

      <div class="pwa-ios-header">
        <div class="pwa-ios-icon">📱</div>
        <h2 class="pwa-ios-title">Install EyeCare</h2>
        <p class="pwa-ios-subtitle">Add to your home screen for the best experience</p>
      </div>

      <div class="pwa-ios-steps">
        <div class="pwa-ios-step">
          <div class="pwa-ios-step-number">1</div>
          <div class="pwa-ios-step-content">
            <p class="pwa-ios-step-text">
              Tap the <strong>Share</strong> button
              <span class="pwa-ios-share-icon">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
                  <path d="M8 0L12 4H9V10H7V4H4L8 0Z"/>
                  <path d="M2 6H0V18C0 19.1 0.9 20 2 20H14C15.1 20 16 19.1 16 18V6H14V18H2V6Z"/>
                </svg>
              </span>
            </p>
            <p class="pwa-ios-step-hint">Usually in the bottom toolbar</p>
          </div>
        </div>

        <div class="pwa-ios-step">
          <div class="pwa-ios-step-number">2</div>
          <div class="pwa-ios-step-content">
            <p class="pwa-ios-step-text">
              Scroll down and tap <strong>"Add to Home Screen"</strong>
            </p>
          </div>
        </div>

        <div class="pwa-ios-step">
          <div class="pwa-ios-step-number">3</div>
          <div class="pwa-ios-step-content">
            <p class="pwa-ios-step-text">
              Tap <strong>"Add"</strong> in the top right corner
            </p>
          </div>
        </div>
      </div>

      <button class="pwa-ios-got-it">Got it!</button>
    </div>
  `

  // Add styles
  injectIOSStyles()

  // Add to page
  document.body.appendChild(overlay)

  // Setup event listeners
  const closeButton = overlay.querySelector('.pwa-ios-close')
  const gotItButton = overlay.querySelector('.pwa-ios-got-it')

  const closeModal = () => {
    overlay.classList.add('pwa-ios-closing')
    setTimeout(() => overlay.remove(), 300)
  }

  closeButton?.addEventListener('click', closeModal)
  gotItButton?.addEventListener('click', closeModal)
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal()
  })

  console.log('[IOSInstructions] Modal shown')
}

/**
 * Inject iOS instructions styles
 */
function injectIOSStyles(): void {
  // Check if styles already injected
  if (document.getElementById('pwa-ios-styles')) {
    return
  }

  const styles = document.createElement('style')
  styles.id = 'pwa-ios-styles'
  styles.textContent = `
    .pwa-ios-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      animation: pwa-ios-fadeIn 0.3s ease-out;
    }

    .pwa-ios-overlay.pwa-ios-closing {
      animation: pwa-ios-fadeOut 0.3s ease-out;
    }

    .pwa-ios-modal {
      background: white;
      border-radius: 20px;
      max-width: 400px;
      width: 100%;
      padding: 32px 24px 24px;
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: pwa-ios-slideUp 0.3s ease-out;
    }

    .pwa-ios-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: transparent;
      border: none;
      font-size: 32px;
      line-height: 1;
      cursor: pointer;
      color: #64748B;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .pwa-ios-close:hover {
      color: #1E293B;
    }

    .pwa-ios-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .pwa-ios-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .pwa-ios-title {
      font-size: 24px;
      font-weight: 700;
      color: #1E293B;
      margin: 0 0 8px 0;
    }

    .pwa-ios-subtitle {
      font-size: 14px;
      color: #64748B;
      margin: 0;
    }

    .pwa-ios-steps {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 32px;
    }

    .pwa-ios-step {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .pwa-ios-step-number {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
    }

    .pwa-ios-step-content {
      flex: 1;
    }

    .pwa-ios-step-text {
      font-size: 15px;
      color: #1E293B;
      margin: 0 0 4px 0;
      line-height: 1.6;
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }

    .pwa-ios-step-hint {
      font-size: 13px;
      color: #94A3B8;
      margin: 0;
    }

    .pwa-ios-share-icon {
      display: inline-flex;
      align-items: center;
      color: #3B82F6;
    }

    .pwa-ios-got-it {
      width: 100%;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 14px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .pwa-ios-got-it:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    }

    @keyframes pwa-ios-fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pwa-ios-fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes pwa-ios-slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @media (max-width: 640px) {
      .pwa-ios-modal {
        padding: 28px 20px 20px;
      }
      .pwa-ios-title {
        font-size: 22px;
      }
      .pwa-ios-step-text {
        font-size: 14px;
      }
    }
  `
  document.head.appendChild(styles)
}

/**
 * Auto-initialize iOS instructions
 */
export function initIOSInstructions(): void {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      showIOSInstructions(true)
    })
  } else {
    showIOSInstructions(true)
  }
}
