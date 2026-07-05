// Spider-Kua Service Worker — cache để mở nhanh & dùng offline một phần
const VER = 'sk-v49';
const CORE = [
  './', 'index.html', 'styles.css', 'app.js', 'tts.js', 'practice.js', 'adaptive.js', 'role.js', 'gen.js',
  'manifest.json', 'Spider-Man-Logo-PNG-Isolated-HD.png', 'the-avengers-seeklogo.png',
  'icon-192_2.png', 'icon-512_2.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // API AI / Supabase / fonts: luôn ra mạng
  if (url.origin !== location.origin) return;
  // dữ liệu bài tập & sách: mạng trước, cache dự phòng
  if (url.pathname.includes('/data/') || url.pathname.endsWith('.txt') || url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const cp = r.clone();
        caches.open(VER).then(c => c.put(e.request, cp));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // core: cache trước, mạng dự phòng (ignoreSearch để khớp ?v=40)
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(r => r || fetch(e.request)));
});
