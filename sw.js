const CACHE_NAME = 'camilete-shell-v10';
const APP_FILES = [
  './', './index.html', './menu.html', './carrito.html', './nosotros.html',
  './ubicacion.html', './contacto.html', './politicas-privacidad.html',
  './politicas-datos.html', './terminos-condiciones.html',
  './devoluciones-reembolsos.html', './aviso-legal.html', './error.html',
  './offline.html', './manifest.webmanifest', './data.json',
  './css/styles.css?v=9', './css/temas.css?v=20', './css/responsive.css?v=11',
  './js/data.js?v=9', './js/main.js?v=13', './js/seo.js?v=9', './js/pwa.js?v=1',
  './assets/icons/favicon.svg', './assets/icons/pwa-icon.svg',
  './assets/icons/pwa-192.png', './assets/icons/pwa-512.png',
  './assets/icons/accessibility.png', './assets/icons/cart.png',
  './assets/icons/theme-moon.png', './assets/icons/theme-sun.png',
  './assets/icons/whatsapp.png', './assets/icons/logogpt-2.png',
  './assets/images/burger.svg', './assets/images/fries.svg',
  './assets/images/hotdog.svg', './assets/images/lemonade.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('camilete-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match(request, { ignoreSearch: true })
          || await cache.match(new URL('./offline.html', self.registration.scope).href)
          || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) {
      fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone());
      }).catch(() => {});
      return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});
