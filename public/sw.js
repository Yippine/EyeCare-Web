/**
 * EyeCare PWA ServiceWorker
 * Increment 6 (PWACapability) - Enhanced with production-grade caching strategies
 *
 * Features:
 * - Cache versioning and management
 * - Multi-strategy caching (cache-first, network-first, stale-while-revalidate)
 * - Offline fallback
 * - Update flow with skip waiting
 * - Automatic old cache cleanup
 */

const CACHE_VERSION = 'v2'
const CACHE_NAME = `eyecare-${CACHE_VERSION}`
const STATIC_CACHE = `${CACHE_NAME}-static`
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`

/**
 * App Shell - Critical resources to cache on install
 * Note: Vite generates hashed filenames, these will be updated after build
 */
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Icons
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

/**
 * Install event - Pre-cache app shell
 */
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install event - Version:', CACHE_VERSION)

  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[ServiceWorker] Caching app shell')
      return cache.addAll(APP_SHELL).catch(err => {
        console.warn('[ServiceWorker] Failed to cache some resources:', err)
        // Don't fail installation, cache what we can
      })
    })
  )

  // Activate immediately without waiting for old SW to finish
  self.skipWaiting()
})

/**
 * Activate event - Clean up old caches and take control
 */
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate event - Version:', CACHE_VERSION)

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName =>
            cacheName.startsWith('eyecare-') &&
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE
          )
          .map(cacheName => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )

  // Take control of all clients immediately
  return self.clients.claim()
})

/**
 * Fetch event - Multi-strategy caching
 * - Static assets (JS/CSS/Images/Fonts): cache-first
 * - HTML documents: network-first
 * - Other resources: stale-while-revalidate
 */
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Skip cross-origin requests (except for common CDNs)
  if (url.origin !== location.origin) {
    return
  }

  // Strategy selection based on request destination
  if (isStaticAsset(request)) {
    // Cache-first for static assets (faster load, less bandwidth)
    event.respondWith(cacheFirst(request))
  } else if (request.destination === 'document' || request.mode === 'navigate') {
    // Network-first for HTML documents (avoid stale app shell)
    event.respondWith(networkFirst(request))
  } else {
    // Stale-while-revalidate for other resources (balance freshness and speed)
    event.respondWith(staleWhileRevalidate(request))
  }
})

/**
 * Message event - Handle commands from app
 */
self.addEventListener('message', event => {
  console.log('[ServiceWorker] Message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[ServiceWorker] Skip waiting requested')
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLAIM_CLIENTS') {
    console.log('[ServiceWorker] Claiming clients')
    self.clients.claim()
  }
})

// ============================================
// Caching Strategies
// ============================================

/**
 * Cache-first strategy: Serve from cache, fallback to network
 * Best for: Static assets that rarely change (JS, CSS, images, fonts)
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('[ServiceWorker] Cache-first fetch failed:', error)

    // Try cache one more time
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html')
    }

    throw error
  }
}

/**
 * Network-first strategy: Try network, fallback to cache
 * Best for: HTML documents that should be fresh
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache')

    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page as last resort
    return caches.match('/offline.html')
  }
}

/**
 * Stale-while-revalidate strategy: Serve from cache, update in background
 * Best for: Resources that benefit from speed but should update eventually
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await caches.match(request)

  // Fetch from network in background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(error => {
    console.warn('[ServiceWorker] Background fetch failed:', error)
  })

  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise
}

/**
 * Determine if request is for a static asset
 */
function isStaticAsset(request) {
  const destination = request.destination
  const url = new URL(request.url)
  const pathname = url.pathname

  // Check by request destination
  if (
    destination === 'script' ||
    destination === 'style' ||
    destination === 'image' ||
    destination === 'font'
  ) {
    return true
  }

  // Check by file extension
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf']
  return staticExtensions.some(ext => pathname.endsWith(ext))
}
