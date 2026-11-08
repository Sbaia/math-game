'use strict';

// Bump this version whenever the app shell or any runtime asset changes.
const VERSION = 'v2';
const SCOPE = new URL(self.registration.scope);
const CACHE_PREFIX = `math-game:${encodeURIComponent(SCOPE.href)}:`;
const CACHE_NAME = `${CACHE_PREFIX}${VERSION}`;
const APP_FILES = [
  'index.html', 'navigation.js', 'navigation.css', 'pwa.js', 'pwa.css',
  'english/vocabulary.js', 'english/speech.js', 'english/games.js', 'english/english.css',
  'italian/vocabulary.js', 'italian/speech.js', 'italian/games.js', 'italian/italian.css',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'
].map(path => new URL(path, SCOPE).href);
const APP_URLS = new Set(APP_FILES);
const INDEX_URL = new URL('index.html', SCOPE).href;

self.addEventListener('install', event => {
  // addAll commits the batch atomically; rejection keeps the old worker active.
  // Do not remove any previous cache or force an update during installation.
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(
    APP_FILES.map(url => new Request(url, { cache: 'reload' }))
  )));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  }
});

async function navigationResponse(request) {
  // Keep HTML on the same release as the scripts until the user accepts an update.
  const cache = await caches.open(CACHE_NAME);
  return (await cache.match(INDEX_URL)) || fetch(request);
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== SCOPE.origin ||
      !url.pathname.startsWith(SCOPE.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request));
    return;
  }

  // Known assets share the installed version, even with a query or fragment.
  url.search = '';
  url.hash = '';
  if (!APP_URLS.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(url.href)) || fetch(request);
  })());
});
