// Service Worker for Push Notifications - Informa
// Maneja notificaciones push cuando la app está cerrada

const CACHE_NAME = 'informa-v5.5.0'
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-96.png',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker v5.5.0 instalado')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache abierto:', CACHE_NAME)
        return cache.addAll(CACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker v5.5.0 activado')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar cachés antiguos
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('✅ Cachés antiguos eliminados')
      return clients.claim()
    })
  )
})

// Push notification received
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification recibida:', event)
  
  let data = {
    title: '🔥 Informa',
    body: 'Tienes nuevas notificaciones',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    tag: 'informa-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      data = { ...data, ...payload }
    } catch (e) {
      console.error('Error parsing push data:', e)
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    vibrate: data.vibrate,
    data: data.data,
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event)
  
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Si ya hay una ventana abierta, enfócala
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // Si no, abre una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Background sync (opcional - para cuando recupere conexión)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag)
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

async function syncNotifications() {
  // Placeholder para sincronización en background
  console.log('Syncing notifications...')
}

// Fetch event (opcional - para cache)
self.addEventListener('fetch', (event) => {
  // No cachear por ahora para mantenerlo simple
  // Podrías implementar cache strategies aquí si quieres
})