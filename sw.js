// Service Worker — অফলাইন সাপোর্ট ও দ্রুত লোড
// কনটেন্ট বদলালে নিচের VERSION বাড়িয়ে দিন (যেমন v2)
const VERSION = 'zar-v11';
const CORE = ['./', 'index.html', 'icons-extra.css', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // API (ভিজিটর কাউন্টার), গান (Range রিকুয়েস্ট) ও অন্য সব কিছু নেটওয়ার্ক থেকেই যাবে
  if (url.pathname.startsWith('/api/') || url.pathname.endsWith('.mp3') || req.headers.has('range')) return;

  // পেজ: আগে নেটওয়ার্ক (সবসময় নতুন ভার্সন), না পেলে ক্যাশ
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('index.html', copy));
          return res;
        })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  // ছবি, ফন্ট, আইকন: ক্যাশ থেকে সাথে সাথে, পেছনে আপডেট
  e.respondWith(
    caches.match(req).then((cached) => {
      const fresh = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
