// public/sw.js
// ─────────────────────────────────────────────────────────────────────────────
// CSEEL Service Worker
// Max storage: 10% of browser quota
//
// Cache strategy:
//   App shell (HTML/JS/CSS)  → Cache First  (offline bhi kaam kare)
//   Images                   → Cache First  (fast load)
//   API (supabase)           → Never cache  (IndexedDB handles)
//   Navigation               → Network First → Cache fallback
// ─────────────────────────────────────────────────────────────────────────────

const SW_VERSION   = "cseel_v1";
const APP_CACHE    = `${SW_VERSION}_app`;
const IMG_CACHE    = `${SW_VERSION}_img`;
const QUOTA_LIMIT  = 0.10; // 10% of total browser quota

// ── INSTALL — app shell cache karo ───────────────────────────────────────────
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(["/", "/index.html"]))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE — purane caches delete karo ─────────────────────────────────────
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !k.startsWith(SW_VERSION)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", e => {
  const { request } = e;
  const url = new URL(request.url);

  // Supabase API — never intercept
  if (url.hostname.includes("supabase.co")) return;
  // Chrome extensions — skip
  if (!url.protocol.startsWith("http")) return;

  // Images — Cache First
  if (/\.(jpg|jpeg|png|gif|webp|svg|avif|ico)$/i.test(url.pathname)) {
    e.respondWith(cacheFirst(request, IMG_CACHE));
    return;
  }

  // JS / CSS / Fonts — Cache First (Vite hashed files change nahi hote)
  if (/\.(js|css|woff2?|ttf|eot)$/i.test(url.pathname)) {
    e.respondWith(cacheFirst(request, APP_CACHE));
    return;
  }

  // HTML / Navigation — Network First → Cache fallback
  if (request.mode === "navigate") {
    e.respondWith(networkFirst(request));
    return;
  }
});

// ── CACHE FIRST ───────────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request.clone());
    if (response.ok && response.status === 200) {
      // Quota check karo pehle save karne se
      const ok = await isUnderQuota();
      if (ok) cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || new Response("Offline", { status: 503 });
  }
}

// ── NETWORK FIRST ─────────────────────────────────────────────────────────────
async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const response = await fetch(request.clone());
    if (response.ok) {
      const ok = await isUnderQuota();
      if (ok) cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback
    const cached = await cache.match(request)
      || await cache.match("/index.html");
    return cached || new Response("Offline", { status: 503 });
  }
}

// ── QUOTA CHECK — 10% limit ───────────────────────────────────────────────────
async function isUnderQuota() {
  try {
    if (!navigator.storage?.estimate) return true;
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return usage < quota * QUOTA_LIMIT;
  } catch { return true; }
}

// ── MESSAGE — main thread se commands ────────────────────────────────────────
self.addEventListener("message", async e => {
  // Cache clear karo (e.g., after logout)
  if (e.data?.type === "CLEAR_CACHE") {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    e.ports[0]?.postMessage({ ok: true });
  }

  // Storage info bhejo
  if (e.data?.type === "STORAGE_INFO") {
    try {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      e.ports[0]?.postMessage({
        used:    +(usage  / 1024 / 1024).toFixed(1),
        quota:   +(quota  / 1024 / 1024).toFixed(0),
        percent: +(usage / quota * 100).toFixed(1),
        limit:   +(quota * QUOTA_LIMIT / 1024 / 1024).toFixed(1),
      });
    } catch {
      e.ports[0]?.postMessage(null);
    }
  }

  // Force update karo
  if (e.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});