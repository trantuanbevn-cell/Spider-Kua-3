// Spider-Kua Service Worker — cache để mở nhanh & dùng offline một phần
const VER = 'sk-v68';
const CORE = [
  './', 'index.html', 'styles.css', 'app.js', 'tts.js', 'practice.js', 'adaptive.js', 'role.js', 'gen.js', 'notify.js', 'command.js', 'callchat.js', 'dailyhub.js', 'library.js', 'sach5.js', 'robot.js',
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

// ═══ WEB PUSH — nhận lệnh từ S.H.I.E.L.D. Command kể cả khi app tắt ═══
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (err) { d = { text: e.data ? e.data.text() : '' }; }
  const isCall = d.type === 'call';
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || '🛡️ Spider-Kua', {
      body: d.text || '',
      tag: (d.type || 'msg') + (d.urgency || ''),
      renotify: true,
      requireInteraction: true,
      vibrate: isCall ? [700, 200, 700, 200, 700, 200, 1000] : [400, 150, 400, 150, 600],
      data: d,
      actions: isCall ? [{ action: 'answer', title: '📞 Nghe máy' }] : (d.type === 'summon' ? [{ action: 'study', title: '✅ Vào học' }] : []),
      icon: 'icon-192_2.png',
      badge: 'icon-192_2.png'
    }),
    // app đang mở (kể cả nền) → hiện màn gọi + hú còi NGAY
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
      ws.forEach(w => w.postMessage(d));
    })
  ]));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const d = e.notification.data || {};
  if (e.action === 'answer') d.type = 'call';
  if (e.action === 'study') d.type = 'summon';
  const q = '?cmd=' + (d.type || 'msg') + '&id=' + (d.id || '') + '&text=' + encodeURIComponent(d.text || '');
  const url = self.registration.scope + q;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) { w.navigate(url); return w.focus(); }
    return clients.openWindow(url);
  }));
});
