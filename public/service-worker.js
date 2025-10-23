// Service Worker para PWA con Push Notifications
const CACHE_NAME = 'informa-v1'
const API_CACHE = 'informa-api-v1'
const RUNTIME_CACHE = 'informa-runtime-v1'

const currentCaches = [CACHE_NAME, API_CACHE, RUNTIME_CACHE]

// Archivos para cachear
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Instalación
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell')
        return cache.addAll(urlsToCache)
      })
      .then(() => self.skipWaiting())
  )
})

// Activación
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName))
      })
      .then((cachesToDelete) => {
        return Promise.all(cachesToDelete.map((cacheToDelete) => {
          console.log('[SW] Deleting old cache:', cacheToDelete)
          return caches.delete(cacheToDelete)
        }))
      })
      .then(() => self.clients.claim())
  )
})

// Fetch - Network first para APIs, cache first para assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests excepto Supabase
  if (url.origin !== location.origin && !url.hostname.includes('supabase.co')) {
    return
  }

  // API calls - Network First
  if (url.pathname.includes('/functions/v1/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone()
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            return new Response(
              JSON.stringify({ error: 'offline', message: 'Sin conexión' }),
              { headers: { 'Content-Type': 'application/json' }, status: 503 }
            )
          })
        })
    )
    return
  }

  // Assets - Cache First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }
        const responseToCache = response.clone()
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache)
        })
        return response
      })
    })
  )
})

// PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  console.log('[SW] Push received')
  
  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = { title: 'Informa', body: event.data.text() }
    }
  }

  const title = data.title || 'Informa'
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: data.priority === 'high' ? [200, 100, 200, 100, 200] : [200, 100, 200],
    tag: data.tag || 'informa-notification',
    data: data.data || {},
    requireInteraction: data.priority === 'high',
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked')
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
  )
})

console.log('[SW] Service worker loaded')
