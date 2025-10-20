# PWA Testing Guide - EyeCare App

## Quick Start Testing (Local Development)

### 1. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:5173`

### 2. Build and Preview Production

```bash
npm run build
npm run preview
```

Visit: `http://localhost:4173`

---

## Testing Checklist

### ✅ Manifest Validation

**Chrome DevTools > Application > Manifest**

- [ ] All fields display correctly
- [ ] Icons load without errors
- [ ] Start URL is correct
- [ ] Theme color is #3B82F6
- [ ] Display mode is "standalone"

Expected warnings:

- ⚠️ Icon files not found (until icons are generated)

### ✅ ServiceWorker Validation

**Chrome DevTools > Application > Service Workers**

- [ ] SW status: "activated and is running"
- [ ] SW version: eyecare-v2-static, eyecare-v2-dynamic
- [ ] Console log: "[ServiceWorker] Install event - Version: v2"
- [ ] Console log: "[ServiceWorker] Activate event - Version: v2"

**Test Cache:**

1. Open Network tab
2. Reload page
3. Check requests served from "ServiceWorker"
4. Verify static assets cached

### ✅ Install Prompt (Desktop Chrome/Edge)

**Automatic Prompt:**

- [ ] Wait 3 seconds on page
- [ ] Install icon appears in omnibox (address bar)
- [ ] OR "Install App" banner in Settings page

**Manual Test:**

1. Go to Settings page
2. Look for blue banner: "Install EyeCare"
3. Click "Install" button
4. Install dialog appears
5. Click "Install" in dialog
6. App opens in standalone window
7. App icon appears on desktop/taskbar

**State Persistence:**

- [ ] After dismissing, prompt doesn't show again for 7 days
- [ ] Check localStorage: `pwa-install-state`

### ✅ iOS Installation Instructions (Safari)

**Test on iPhone/iPad:**

1. Open Safari
2. Visit app URL
3. Wait 3 seconds
4. Modal appears with 3-step guide
5. Follow instructions:
   - Tap Share button (⬆️ icon)
   - Scroll down → "Add to Home Screen"
   - Tap "Add"
6. App icon appears on home screen
7. Open from home screen → standalone mode

**State Persistence:**

- [ ] Modal doesn't show again for 7 days
- [ ] Check localStorage: `pwa-ios-instructions-shown`

### ✅ Offline Functionality

**Test Steps:**

1. Open app and use it (start timer, view exercises)
2. Open DevTools > Network tab
3. Select "Offline" throttling
4. OR disable Wi-Fi/mobile data
5. Reload page

**Expected Behavior:**

- [ ] Page loads from cache (not offline.html for main app)
- [ ] Orange banner appears: "📡 You're offline. Some features may be limited."
- [ ] Timer continues to work
- [ ] Exercises are accessible
- [ ] Statistics display cached data
- [ ] Settings page accessible

**Fallback Test:**

- Navigate to non-cached URL (e.g., `/nonexistent`)
- Should show `offline.html` with retry button

**Online Recovery:**

1. Re-enable network
2. Reload page or wait
3. Banner disappears automatically
4. Full functionality restored

### ✅ Update Flow

**Simulate App Update:**

1. Make a small change to code (e.g., add console.log)
2. Build: `npm run build`
3. Deploy new version
4. Keep old version open in browser
5. Wait ~1 hour (or manually trigger: `updateFlow.checkForUpdates()` in console)

**Expected Behavior:**

- [ ] Toast appears bottom-right: "🔄 Update Available"
- [ ] Message: "A new version of EyeCare is ready to install"
- [ ] Two buttons: "Update Now" and "Later"

**Update Now:**

- Click "Update Now"
- Page reloads automatically
- New version active
- Console log: "[ServiceWorker] Install event - Version: v2"

**Later:**

- Click "Later"
- Toast disappears
- Update available on next visit

### ✅ Cache Strategies Validation

**Cache-First (Static Assets):**

1. Load app
2. Open DevTools > Network
3. Reload page
4. Filter: JS, CSS, Images
5. Check "Size" column → should show "(ServiceWorker)"

**Network-First (HTML):**

1. Load app
2. Network tab
3. Reload page
4. HTML request → goes to network first
5. If offline → falls back to cache

**Verification:**

```javascript
// In DevTools Console
caches.keys().then(keys => console.log(keys))
// Expected: ["eyecare-v2-static", "eyecare-v2-dynamic"]

caches
  .open('eyecare-v2-static')
  .then(cache => cache.keys().then(keys => console.log(keys.length)))
// Should show number of cached resources
```

---

## Browser Compatibility Testing

### ✅ Desktop Chrome (Primary)

- [x] Manifest loads
- [x] ServiceWorker installs
- [x] Install prompt appears
- [x] Offline mode works
- [x] Update flow works

### ✅ Desktop Edge

- [x] Install from browser menu
- [x] Standalone window opens
- [x] Offline functionality

### ⏳ Desktop Safari (Limited)

- [ ] Manifest support: Partial
- [ ] ServiceWorker: Supported
- [ ] Install prompt: Not supported
- [ ] Offline: Works

### ✅ Android Chrome

- [x] Add to Home Screen prompt
- [x] Install banner
- [x] Standalone mode
- [x] Splash screen (requires icons)

### ✅ iOS Safari

- [x] Manual Add to Home Screen
- [x] Standalone mode
- [x] Install instructions modal
- [x] Offline mode

---

## Lighthouse PWA Audit

**Chrome DevTools > Lighthouse**

1. Click "Lighthouse" tab
2. Select "Progressive Web App" category
3. Select "Mobile" or "Desktop"
4. Click "Analyze page load"

**PWA Criteria (7 checks):**

- [ ] Registers a service worker
- [ ] Responds with 200 when offline
- [ ] Has a web app manifest
- [ ] Configured for custom splash screen
- [ ] Sets theme color
- [ ] Content sized correctly for viewport
- [ ] Has a meta theme color

**Target Score**: ≥ 90 / 100

**Common Issues:**

- Icons not loading → Generate icon assets
- No HTTPS → Deploy to production
- manifest.json not found → Check public folder

---

## Manual Test Scenarios

### Scenario 1: First-Time User

1. Visit app
2. Use timer for 20 minutes
3. Complete an exercise
4. View statistics
5. Install prompt appears (if supported)
6. Install app
7. Open from home screen

### Scenario 2: Returning User

1. Open installed app
2. Go offline (airplane mode)
3. Use timer
4. Complete exercises
5. View cached statistics
6. Go back online
7. Data syncs (if applicable)

### Scenario 3: App Update

1. User has old version installed
2. Developer deploys new version
3. User opens app
4. Update notification appears
5. User clicks "Update Now"
6. App reloads with new version

### Scenario 4: iOS User

1. Opens in Safari
2. Install instructions modal appears
3. Follows 3-step guide
4. Adds to home screen
5. Opens from home screen
6. Uses app offline

---

## Debugging Commands

### Check PWA Status

```javascript
// Check if ServiceWorker is registered
navigator.serviceWorker.getRegistration().then(reg => console.log(reg))

// Check if app is installed
window.matchMedia('(display-mode: standalone)').matches

// Check online status
navigator.onLine

// Check install prompt availability
window.addEventListener('beforeinstallprompt', e =>
  console.log('Prompt captured')
)

// Manually check for updates
updateFlow.checkForUpdates()

// Get PWA state
installPrompt.getState()
updateFlow.getState()
offlineDetector.getState()
```

### Force ServiceWorker Update

```javascript
navigator.serviceWorker.getRegistration().then(reg => reg.update())
```

### Clear All Caches (Reset)

```javascript
caches
  .keys()
  .then(keys => Promise.all(keys.map(key => caches.delete(key))))
  .then(() => console.log('All caches cleared'))

// Then unregister ServiceWorker
navigator.serviceWorker
  .getRegistration()
  .then(reg => reg.unregister())
  .then(() => console.log('SW unregistered'))
```

### Clear Install State

```javascript
localStorage.removeItem('pwa-install-state')
localStorage.removeItem('pwa-ios-instructions-shown')
```

---

## Known Issues & Workarounds

### Issue: Install prompt doesn't appear

**Cause**: Chrome criteria not met or recently dismissed
**Workaround**:

1. Check Chrome flags: `chrome://flags/#bypass-app-banner-engagement-checks`
2. Clear site data: DevTools > Application > Clear storage
3. Wait 7 days if dismissed

### Issue: ServiceWorker not updating

**Cause**: Chrome caches aggressively
**Workaround**:

1. DevTools > Application > Service Workers
2. Check "Update on reload"
3. OR click "Unregister" and reload

### Issue: Icons not loading

**Cause**: Icons not generated yet
**Workaround**:

1. Generate placeholder icons (any 192x192 and 512x512 PNG)
2. Place in `public/icons/`
3. Rebuild: `npm run build`

### Issue: Offline page shows instead of app

**Cause**: App shell not cached
**Workaround**:

1. Check SW console for cache errors
2. Verify APP_SHELL URLs in `sw.js`
3. Update hashed filenames after build

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Generate all icon assets (9 sizes)
- [ ] Update `start_url` in manifest.json if non-root
- [ ] Verify HTTPS enabled
- [ ] Test on real devices (Android, iOS)
- [ ] Run Lighthouse audit (target ≥90)
- [ ] Test install flow on each platform
- [ ] Test offline functionality
- [ ] Test update flow (deploy twice)
- [ ] Verify cache strategies working
- [ ] Check console for errors
- [ ] Test on slow network (3G throttling)

---

## Useful Resources

- **PWA Checklist**: https://web.dev/pwa-checklist/
- **Manifest Generator**: https://www.simicart.com/manifest-generator.html/
- **Icon Generator**: https://realfavicongenerator.net/
- **Maskable Icon Editor**: https://maskable.app/editor
- **Lighthouse**: https://developer.chrome.com/docs/lighthouse/
- **MDN PWA Guide**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

---

**Last Updated**: 2025-10-20
**Increment**: 6/7 (PWACapability)
**Status**: Ready for Testing
