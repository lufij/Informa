// Service Worker DISABLED to fix infinite loops and cache issues
// This was causing PUT method cache errors and mobile loading problems

console.log('[SW] Service worker disabled for debugging');

// Simple service worker that doesn't cache anything
self.addEventListener('install', function(event) {
  console.log('[SW] Install event - skipping');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Activate event - clearing all caches');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Don't intercept any fetch requests - let them pass through
self.addEventListener('fetch', function(event) {
  // Do nothing - let all requests pass through without caching
  return;
});
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(cachesToDelete.map((cacheToDelete) => {
          console.log('[SW] Deleting old cache:', cacheToDelete);
          return caches.delete(cacheToDelete);
        }));
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, then cache for API calls
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin && !url.hostname.includes('supabase.co')) {
    return;
  }

  // API calls - Network First strategy
  if (url.pathname.includes('/functions/v1/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving from cache (offline):', request.url);
              return cachedResponse;
            }
            // Return a generic offline response
            return new Response(
              JSON.stringify({ 
                error: 'offline', 
                message: 'No hay conexión a internet. Por favor, intenta más tarde.' 
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // App shell & static assets - Cache First strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update in background
        fetch(request).then((response) => {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, response);
          });
        }).catch(() => {
          // Ignore fetch errors when updating cache
        });
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request).then((response) => {
        // Don't cache if not successful
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch((error) => {
        console.log('[SW] Fetch failed:', error);
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        throw error;
      });
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Informa', body: event.data.text() };
    }
  }

  const title = data.title || 'Informa';
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    vibrate: [200, 100, 200],
    tag: data.tag || 'informa-notification',
    data: data.data || {},
    actions: [
      { action: 'open', title: 'Abrir', icon: '/icons/action-open.png' },
      { action: 'close', title: 'Cerrar', icon: '/icons/action-close.png' }
    ],
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-posts') {
    event.waitUntil(
      // Sync offline posts when connection is restored
      syncOfflinePosts()
    );
  }
});

async function syncOfflinePosts() {
  // This would sync any posts that were created while offline
  console.log('[SW] Syncing offline posts...');
  // Implementation would depend on your offline storage strategy
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-content') {
    event.waitUntil(
      // Sync content in background
      syncContent()
    );
  }
});

async function syncContent() {
  console.log('[SW] Periodic content sync...');
  // Refresh cache with latest content
}

console.log('[SW] Service worker loaded');
