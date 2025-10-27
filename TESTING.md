# Testing Guide - EyeCare PWA

Complete testing documentation for the EyeCare application, covering local development, E2E tests, and PWA functionality.

## Quick Start

### Development Server

```bash
pnpm dev
# Visit: http://localhost:5173
```

### Production Build & Preview

```bash
pnpm build
pnpm preview
# Visit: http://localhost:4173
```

---

## Automated Testing (E2E)

### Run Playwright Tests

```bash
# Install browsers (first time only)
pnpm exec playwright install

# Run all tests
pnpm test:e2e

# Run tests in UI mode (interactive)
pnpm test:e2e:ui

# Debug tests
pnpm test:e2e:debug

# Show HTML report
pnpm exec playwright show-report
```

### Test Coverage

- ✅ **Timer Flow**: Start → Work → Break → Exercise → Stats
- ✅ **Statistics Flow**: Data tracking and persistence
- ✅ **PWA Flow**: Service worker, offline mode, install
- ✅ **Notification Flow**: Permission grant and delivery

See `tests/README.md` for detailed testing documentation.

---

## Manual Testing

### 1. Timer Functionality

**Test Steps:**

1. Click "Start" → verify countdown begins (20:00 → 19:59)
2. Click "Pause" → verify countdown stops
3. Click "Reset" → verify timer resets to 20:00
4. Complete work cycle → verify break notification appears

**Acceptance:** Timer controls work correctly and state persists on page reload.

---

### 2. Eye Exercises

**Test Steps:**

1. Trigger break notification (complete 20-minute work period)
2. Select each exercise:
   - Near-Far Focus
   - Ball Tracking
   - Blink Exercise
3. Verify animations are smooth and complete correctly
4. Verify skip button works

**Acceptance:** All 3 exercises run smoothly with proper animations.

---

### 3. Statistics & Data

**Test Steps:**

1. Navigate to `/stats` page
2. Verify today's statistics display
3. Verify weekly trend chart shows data
4. Click "Export Data" → verify JSON download
5. Refresh page → verify data persists

**Acceptance:** Statistics track correctly and persist in IndexedDB.

---

### 4. Notifications

**Test Steps:**

1. Grant notification permission when prompted
2. Complete work period with browser minimized
3. Verify browser notification appears
4. Click notification → verify app opens
5. Test notification settings toggle in Settings page

**Acceptance:** Notifications work in both foreground and background modes.

---

## PWA Testing

> **Important:** PWA features require production build (`pnpm preview`) or HTTPS deployment.

### Service Worker

**Test Steps:**

1. Open Chrome DevTools → Application → Service Workers
2. Verify SW status: "activated and is running"
3. Check console for: `[ServiceWorker] Install event - Version: v2`
4. Verify static assets are cached (Cache Storage tab)

**Acceptance:** Service Worker registers successfully and caches resources.

---

### Offline Mode

**Test Steps:**

1. Load app and use it normally
2. Open DevTools → Network → Select "Offline" throttling
3. Reload page
4. Verify app loads from cache
5. Verify orange offline banner appears
6. Test timer, exercises, and stats work offline

**Acceptance:** App functions fully without internet connection.

---

### Install Prompt (Desktop)

**Chrome/Edge Desktop Test:**

1. Visit app in Chrome/Edge
2. Go to Settings page
3. Verify "Install App" button/banner appears
4. Click "Install"
5. Verify installation dialog appears
6. Install and verify app opens in standalone window

**Acceptance:** App can be installed and runs as standalone PWA.

---

### iOS Installation (Safari)

**iPhone/iPad Test:**

1. Open Safari on iOS device
2. Visit app URL
3. Wait 3 seconds → install instructions modal appears
4. Follow 3-step guide:
   - Tap Share button (⬆️)
   - Tap "Add to Home Screen"
   - Tap "Add"
5. Open app from home screen → verify standalone mode

**Acceptance:** iOS users can manually install with clear instructions.

---

### Update Flow

**Test Steps:**

1. Load app (old version)
2. Deploy new version (make a code change and rebuild)
3. Wait or manually trigger: `updateFlow.checkForUpdates()` in console
4. Verify "Update Available" toast appears bottom-right
5. Click "Update Now" → verify page reloads with new version

**Acceptance:** Update notification appears and reload applies new version.

---

## Browser Compatibility

### Supported Browsers

| Browser        | Desktop | Mobile | Install | Offline | Notifications |
| -------------- | ------- | ------ | ------- | ------- | ------------- |
| Chrome         | ✅      | ✅     | ✅      | ✅      | ✅            |
| Firefox        | ✅      | ✅     | ✅      | ✅      | ✅            |
| Edge           | ✅      | ✅     | ✅      | ✅      | ✅            |
| Safari         | ✅      | ✅     | Limited | ✅      | Limited       |
| Android Chrome | -       | ✅     | ✅      | ✅      | ✅            |
| iOS Safari     | -       | ✅     | Manual  | ✅      | In-app only   |

---

## Performance & Quality

### Lighthouse Audit

**Run Lighthouse:**

1. Build for production: `pnpm build && pnpm preview`
2. Open Chrome DevTools → Lighthouse tab
3. Select all categories (Performance, Accessibility, Best Practices, SEO, PWA)
4. Click "Analyze page load"

**Target Scores:**

- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90
- PWA: All checks passed ✅

---

### TypeScript & Linting

```bash
# Type checking
pnpm type-check
# Expected: 0 errors

# Linting
pnpm lint
# Expected: No errors or warnings
```

---

### Bundle Size

```bash
pnpm build
# Expected output:
# - Total bundle: < 500 KB (uncompressed)
# - Main JS gzip: < 150 KB
# - Code splitting: 5+ chunks
```

---

## Responsive Design Testing

### Test Different Screen Sizes

1. **Desktop (1920x1080)**: Verify full layout
2. **Tablet (768x1024)**: Verify adaptive layout
3. **Mobile (375x667)**: Verify mobile layout, no horizontal scroll
4. **Ultra-wide (2560x1440)**: Verify content max-width

**Acceptance:** App displays correctly on all screen sizes without overflow.

---

## Accessibility Testing

### Keyboard Navigation

1. **Tab Key**: Navigate through all interactive elements
2. **Enter Key**: Activate buttons and controls
3. **Esc Key**: Close modals and overlays

**Acceptance:** All functionality accessible via keyboard only.

---

## Debugging Commands

### Check PWA Status

```javascript
// Check ServiceWorker registration
navigator.serviceWorker.getRegistration().then(reg => console.log(reg))

// Check if app is installed
window.matchMedia('(display-mode: standalone)').matches

// Check online status
navigator.onLine

// Manually check for updates
updateFlow.checkForUpdates()

// Get PWA state
installPrompt.getState()
offlineDetector.getState()
```

### Clear All Caches (Reset)

```javascript
// Clear all caches
caches
  .keys()
  .then(keys => Promise.all(keys.map(key => caches.delete(key))))
  .then(() => console.log('All caches cleared'))

// Unregister ServiceWorker
navigator.serviceWorker
  .getRegistration()
  .then(reg => reg.unregister())
  .then(() => console.log('SW unregistered'))

// Clear install state
localStorage.removeItem('pwa-install-state')
localStorage.removeItem('pwa-ios-instructions-shown')
```

---

## Known Issues & Limitations

### Local Testing Limitations

1. **Service Worker**: Only works in `pnpm preview` or HTTPS, not `pnpm dev`
2. **Notifications**: May not work in WSL or virtual machines
3. **Install Prompt**: May not trigger on localhost (requires HTTPS)
4. **Lighthouse Scores**: Localhost scores typically 5-10 points lower than production

---

## Troubleshooting

### Service Worker Not Registering

**Solution:**

1. Verify using `pnpm preview` (not `pnpm dev`)
2. Hard reload: Ctrl+Shift+R
3. Check DevTools Console for errors
4. Verify `public/sw.js` exists

### Notification Permission Denied

**Solution:**

1. Check browser address bar (lock icon)
2. Reset site permissions in browser settings
3. Clear site data and retry

### IndexedDB Data Not Persisting

**Solution:**

1. Check Console for IndexedDB errors
2. Verify not in incognito mode
3. Check browser storage quota
4. Try clearing browser cache

---

## Production Deployment Checklist

Before deploying:

- [ ] All E2E tests pass
- [ ] TypeScript compilation: 0 errors
- [ ] Lint: No errors or warnings
- [ ] Lighthouse scores ≥ 90
- [ ] Test on real devices (Android + iOS)
- [ ] Verify offline mode works
- [ ] Test install flow on all platforms
- [ ] Verify update flow works
- [ ] Bundle size < 500 KB

---

## Useful Resources

- **PWA Checklist**: https://web.dev/pwa-checklist/
- **Lighthouse Docs**: https://developer.chrome.com/docs/lighthouse/
- **Playwright Docs**: https://playwright.dev/
- **IndexedDB API**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

---

**Last Updated**: 2025-10-22

🤖 Generated with [Claude Code](https://claude.com/claude-code)
