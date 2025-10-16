/**
 * EyeCare PWA ServiceWorker
 * Minimal ServiceWorker implementation for Increment 5 (NotificationSystem)
 *
 * Foundation for future enhancements:
 * - Increment 6 will add offline caching strategy
 * - Future increments may add background sync and push notifications
 */

const CACHE_NAME = 'eyecare-v1'
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
]

/**
 * Install event - cache essential resources
 */
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install event')

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching essential resources')
      return cache.addAll(CACHE_URLS).catch(err => {
        console.warn('[ServiceWorker] Some resources failed to cache:', err)
        // Don't fail installation if caching fails
      })
    })
  )

  // Activate immediately
  self.skipWaiting()
})

/**
 * Activate event - claim clients and cleanup old caches
 */
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate event')

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )

  // Take control of all pages immediately
  self.clients.claim()
})

/**
 * Fetch event - minimal implementation
 * Network-first strategy with no fallback to cache yet
 * Increment 6 will add comprehensive caching strategy
 */
self.addEventListener('fetch', event => {
  // For now, just pass through to network
  // Future: implement cache-first or network-first strategies
  event.respondWith(
    fetch(event.request).catch(() => {
      // If network fails, try cache
      return caches.match(event.request)
    })
  )
})

/**
 * Message event - for future communication with app
 */
self.addEventListener('message', event => {
  console.log('[ServiceWorker] Message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
