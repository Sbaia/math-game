'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

const SCOPE = 'https://example.github.io/math-game/';
const workerSource = readFileSync(require('node:path').join(__dirname, 'sw.js'), 'utf8');

// This event/CacheStorage model is not browser QA; see the contract assumption ledger.
function browser(scope = SCOPE) {
  const listeners = new Map();
  const stores = new Map();
  const effects = { skipped: 0, claimed: 0 };
  let network = async request => new Response(`installed:${new URL(request.url || request).pathname}`);
  const key = request => {
    const url = new URL(request.url || request);
    url.hash = '';
    return url.href;
  };
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name);
      return {
        async addAll(requests) {
          const responses = await Promise.all(requests.map(async request => {
            const response = await network(request);
            if (!response.ok) throw new TypeError('Precache fetch failed');
            return [key(request), response];
          }));
          for (const [url, response] of responses) entries.set(url, response.clone());
        },
        async match(request) { return entries.get(key(request))?.clone(); },
        async put(request, response) { entries.set(key(request), response.clone()); },
        async delete(request) { return entries.delete(key(request)); },
        async keys() { return [...entries.keys()]; }
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); }
  };
  vm.runInNewContext(workerSource, {
    URL, Request, Response, caches, fetch: request => network(request),
    self: {
      registration: { scope },
      addEventListener(type, listener) { listeners.set(type, listener); },
      async skipWaiting() { effects.skipped++; },
      clients: { async claim() { effects.claimed++; } }
    }
  });
  return {
    caches, effects,
    network(fn) { network = fn; },
    async event(type, fields = {}) {
      const pending = [];
      let response;
      listeners.get(type)({ ...fields,
        waitUntil(promise) { pending.push(promise); },
        respondWith(promise) { response = promise; }
      });
      await Promise.all(pending);
      return response;
    },
    request(path, options = {}) {
      return this.event('fetch', { request: {
        url: new URL(path, scope).href, method: 'GET', mode: 'cors', ...options
      } });
    }
  };
}

// Catches: root-relative URLs or missing assets make some games unavailable offline.
test('complete install serves all assigned runtime files offline beneath the registration scope', async () => {
  const b = browser();
  await b.event('install');
  b.network(async () => { throw new TypeError('Offline'); });
  const files = [
    'index.html', 'navigation.js', 'navigation.css', 'pwa.js', 'pwa.css',
    'english/vocabulary.js', 'english/speech.js', 'english/games.js', 'english/english.css',
    'italian/vocabulary.js', 'italian/speech.js', 'italian/games.js', 'italian/italian.css',
    'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
    'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'
  ];
  for (const file of files) {
    assert.equal(await (await b.request(file)).text(), `installed:/math-game/${file}`);
  }
  assert.equal(await (await b.request('english/games.js?v=2#route')).text(),
    'installed:/math-game/english/games.js');
});

// Catches: accepting a partial batch or deleting old caches breaks the active app on failed update.
test('install rejects missing precache files without replacing a previous active version', async () => {
  for (const failure of ['http', 'network']) {
    const b = browser();
    const previousName = `math-game:${encodeURIComponent(SCOPE)}:v0`;
    const previous = await b.caches.open(previousName);
    await previous.put(`${SCOPE}index.html`, new Response('previous playable app'));
    b.network(async request => {
      if (request.url.endsWith('italian/games.js')) {
        if (failure === 'network') throw new TypeError('Offline');
        return new Response('Missing', { status: 404 });
      }
      return new Response('new version');
    });
    await assert.rejects(b.event('install'), TypeError);
    assert.equal(await (await previous.match(`${SCOPE}index.html`)).text(), 'previous playable app');
    for (const name of (await b.caches.keys()).filter(name => name !== previousName)) {
      assert.deepEqual(await (await b.caches.open(name)).keys(), []);
    }
    assert.equal(b.effects.skipped, 0);
  }
});

// Catches: network-first navigation mixes new HTML with old scripts before update consent.
test('navigation serves the installed document for online and offline routes until explicit update', async () => {
  const b = browser();
  await b.event('install');
  b.network(async () => new Response('live document'));
  assert.equal(await (await b.request('./', { mode: 'navigate' })).text(),
    'installed:/math-game/index.html');
  for (const failure of ['network', 'http']) {
    b.network(async () => {
      if (failure === 'network') throw new TypeError('Offline');
      return new Response('Unavailable', { status: 503 });
    });
    for (const route of ['./', 'index.html?installed=1#!/italian', 'deep/route?game=2']) {
      assert.equal(await (await b.request(route, { mode: 'navigate' })).text(),
        'installed:/math-game/index.html');
    }
  }
  const cache = await b.caches.open((await b.caches.keys())[0]);
  await cache.delete(`${SCOPE}index.html`);
  b.network(async () => new Response('uncached live document'));
  assert.equal(await (await b.request('./', { mode: 'navigate' })).text(), 'uncached live document');
  assert.equal(await cache.match(`${SCOPE}index.html`), undefined);
});

// Catches: runtime caching mixes releases or persists HTTP errors when an installed entry is missing.
test('static assets retain installed bytes and cache misses never persist network responses', async () => {
  const b = browser();
  await b.event('install');
  b.network(async () => new Response('new asset'));
  assert.equal(await (await b.request('navigation.js')).text(), 'installed:/math-game/navigation.js');
  const cache = await b.caches.open((await b.caches.keys())[0]);
  await cache.delete(`${SCOPE}navigation.js`);
  for (const status of [200, 404, 500]) {
    b.network(async () => new Response('runtime response', { status }));
    assert.equal((await b.request('navigation.js')).status, status);
    assert.equal(await cache.match(`${SCOPE}navigation.js`), undefined);
  }
});

// Catches: intercepting all origin requests takes over other repositories, APIs or remote resources.
test('external, sibling-scope, unknown and non-GET requests bypass the worker without caching', async () => {
  const b = browser();
  await b.event('install');
  b.network(async () => { throw new Error('Bypassed request must not be fetched by worker'); });
  for (const [url, options] of [
    ['https://cdn.example.org/math-game/navigation.js', {}],
    ['https://example.github.io/other-game/index.html', { mode: 'navigate' }],
    ['https://example.github.io/math-game-extra/index.html', { mode: 'navigate' }],
    ['unknown.js', {}], ['navigation.js', { method: 'POST' }]
  ]) assert.equal(await b.request(url, options), undefined);
  const cache = await b.caches.open((await b.caches.keys())[0]);
  assert.equal(await cache.match(`${SCOPE}unknown.js`), undefined);
});

// Catches: origin-wide cache deletion destroys other GitHub Pages apps during activation.
test('activation deletes only obsolete caches from this exact scope and claims clients', async () => {
  const b = browser();
  await b.event('install');
  const currentName = (await b.caches.keys())[0];
  const ownOldName = currentName.slice(0, currentName.lastIndexOf(':') + 1) + 'obsolete';
  await b.caches.open(ownOldName);
  const sibling = browser('https://example.github.io/other-game/');
  await sibling.event('install');
  const siblingName = (await sibling.caches.keys())[0];
  await b.caches.open(siblingName);
  await b.caches.open('unrelated-cache');
  await b.event('activate');
  assert.deepEqual(new Set(await b.caches.keys()),
    new Set([currentName, siblingName, 'unrelated-cache']));
  assert.equal(b.effects.claimed, 1);
});

// Catches: automatic skipWaiting interrupts a game, or ignored update messages leave the UI stuck.
test('waiting updates activate only after an explicit SKIP_WAITING message', async () => {
  const b = browser();
  await b.event('install');
  await b.event('activate');
  for (const data of [undefined, null, 'SKIP_WAITING', { type: 'OTHER' }]) {
    await b.event('message', { data });
  }
  assert.equal(b.effects.skipped, 0);
  await b.event('message', { data: { type: 'SKIP_WAITING' } });
  assert.equal(b.effects.skipped, 1);
});
