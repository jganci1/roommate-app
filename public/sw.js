// Deliberately does no caching — it exists only so browsers that require an
// active service worker before offering "Install app" / "Add to Home Screen"
// see one. Every request just passes straight through to the network, so a
// new deploy is never masked by a stale cache.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
