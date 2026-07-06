// ═══════════════════════════════════════════════════════════
// S.H.I.E.L.D. COMMAND — server trung tâm của Spider-Kua
// Chạy trên Railway. Nhiệm vụ:
//  1. Web Push: đánh thức tablet của con KỂ CẢ KHI APP ĐANG TẮT
//  2. Lệnh triệu tập leo thang (reo lại mỗi 2 phút, tối đa 5 lần)
//  3. Xác minh "nói đi đôi với làm": con xác nhận mà không vào học → báo bố mẹ
//  4. Hộp thư 2 chiều bố mẹ ↔ con (lưu qua Supabase)
//  5. Cầu nối Telegram
// ═══════════════════════════════════════════════════════════
const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ── cấu hình từ biến môi trường (đặt trong Railway → Variables) ──
const SB_URL   = (process.env.SB_URL || '').replace(/\/$/, '');
const SB_KEY   = process.env.SB_KEY || '';
const TG_TOKEN = process.env.TG_TOKEN || '';
const TG_CHAT  = process.env.TG_CHAT || '';
const ROOM     = process.env.ROOM || '';
const ADMIN_KEY= process.env.ADMIN_KEY || ''; // mã bí mật cho lệnh của bố mẹ
const PORT     = process.env.PORT || 3000;

// ── Supabase REST helper ──
async function sb(path, opts = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.prefer ? { Prefer: opts.prefer } : {})
    }
  });
  if (!r.ok) throw new Error(`SB ${path}: ${r.status} ${await r.text()}`);
  const txt = await r.text();
  return txt ? JSON.parse(txt) : null;
}
async function cfgGet(k) {
  const rows = await sb(`app_config?room_code=eq.${ROOM}&k=eq.${k}&select=v`);
  return rows && rows[0] ? rows[0].v : null;
}
async function cfgSet(k, v) {
  await sb(`app_config?on_conflict=room_code,k`, {
    method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
    body: JSON.stringify({ room_code: ROOM, k, v })
  });
}
async function tg(text) {
  if (!TG_TOKEN || !TG_CHAT || TG_TOKEN === 'NHAP_SAU') return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text })
    });
  } catch (e) {}
}
// Gửi cảnh báo cho bố mẹ: đẩy lên điện thoại (app Spider-Kua) + Telegram nếu có cài
async function notifyParent(text) {
  await Promise.all([
    pushTo('parent', { type: 'alert', title: '🛡️ Spider-Kua báo cáo', text }),
    tg(text)
  ]);
}

// ── VAPID: tự sinh khóa lần đầu, lưu vào Supabase ──
let VAPID = null;
async function initVapid() {
  let pub = await cfgGet('vapid_pub'), priv = await cfgGet('vapid_priv');
  if (!pub || !priv) {
    const k = webpush.generateVAPIDKeys();
    pub = k.publicKey; priv = k.privateKey;
    await cfgSet('vapid_pub', pub); await cfgSet('vapid_priv', priv);
    console.log('Đã sinh VAPID keys mới');
  }
  VAPID = { pub, priv };
  webpush.setVapidDetails('mailto:admin@spider-kua.local', pub, priv);
}

// ── đăng ký nhận push của từng thiết bị ──
async function getSub(role) {
  const v = await cfgGet('push_' + role);
  return v ? JSON.parse(v) : null;
}
async function pushTo(role, payload) {
  const sub = await getSub(role);
  if (!sub) return false;
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.log('push lỗi', role, e.statusCode || e.message);
    return false;
  }
}

// ═══ API ═══
app.get('/health', (_, res) => res.json({ ok: true, ts: Date.now() }));
app.get('/vapid', (_, res) => res.json({ key: VAPID ? VAPID.pub : null }));

// thiết bị đăng ký nhận thông báo (role: 'kua' | 'parent')
app.post('/subscribe', async (req, res) => {
  try {
    const { role, sub } = req.body || {};
    if (!['kua', 'parent'].includes(role) || !sub) return res.status(400).json({ err: 'thiếu role/sub' });
    await cfgSet('push_' + role, JSON.stringify(sub));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ err: e.message }); }
});

// ── LỆNH TRIỆU TẬP (bố mẹ gửi) — leo thang tự động ──
const summons = {}; // id → {text, tries, acked, timer, verifyTimer}

app.post('/summon', async (req, res) => {
  try {
    const { key, text, kind } = req.body || {};
    if (key !== ADMIN_KEY) return res.status(403).json({ err: 'sai mã' });
    const id = 's' + Date.now();
    const msg = text || 'Bố mẹ yêu cầu con vào học ngay!';
    summons[id] = { text: msg, tries: 0, acked: false, kind: kind || 'study' };

    const fire = async () => {
      const s = summons[id];
      if (!s || s.acked || s.tries >= 5) {
        if (s && !s.acked && s.tries >= 5) {
          await notifyParent('🔴 Đã gọi 5 lần trong 10 phút — con KHÔNG phản hồi lệnh: "' + s.text + '"');
          clearInterval(s.timer);
        }
        return;
      }
      s.tries++;
      const ok = await pushTo('kua', {
        type: s.kind === 'call' ? 'call' : 'summon', id, text: msg,
        title: s.kind === 'call' ? '📞 BỐ MẸ ĐANG GỌI!' : '🛡️ S.H.I.E.L.D. TRIỆU TẬP!',
        urgency: s.tries
      });
      if (!ok && s.tries === 1) await notifyParent('⚠️ Không đẩy được thông báo tới tablet (tablet chưa đăng ký nhận thông báo?).');
    };
    await fire();
    summons[id].timer = setInterval(fire, 2 * 60 * 1000);
    res.json({ ok: true, id });
  } catch (e) { res.status(500).json({ err: e.message }); }
});

// con xác nhận lệnh → bắt đầu đồng hồ xác minh 15 phút
app.post('/ack', async (req, res) => {
  try {
    const { id, action } = req.body || {};
    const s = summons[id];
    const now = new Date();
    const hhmm = `${String(now.getUTCHours() + 7).padStart(2, '0').replace('24','00')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
    if (s) { s.acked = true; clearInterval(s.timer); }
    await notifyParent(`✅ Con đã xác nhận lúc ${hhmm}: "${action || 'Con vào học ngay'}"`);

    // XÁC MINH: 15 phút sau kiểm tra có buổi học mới không
    const ackTime = Date.now();
    setTimeout(async () => {
      try {
        const day = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
        const rows = await sb(`study_log?room_code=eq.${ROOM}&day=eq.${day}&select=data,ts`);
        const started = (rows || []).some(r => {
          const d = r.data || {};
          return (d.d && d.d > ackTime - 5 * 60000) || (new Date(r.ts).getTime() > ackTime - 5 * 60000);
        });
        if (!started) await notifyParent('⚠️ XÁC MINH: con đã bấm xác nhận nhưng SAU 15 PHÚT vẫn chưa vào học buổi nào!');
      } catch (e) {}
    }, 15 * 60 * 1000);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ err: e.message }); }
});

// ── HỘP THƯ 2 CHIỀU (lưu vào Supabase bảng family_msgs) ──
app.post('/msg', async (req, res) => {
  try {
    const { key, from, text } = req.body || {};
    if (from === 'parent' && key !== ADMIN_KEY) return res.status(403).json({ err: 'sai mã' });
    if (!text || !['parent', 'kua'].includes(from)) return res.status(400).json({ err: 'thiếu nội dung' });
    await sb('family_msgs', { method: 'POST', prefer: 'return=minimal',
      body: JSON.stringify({ room_code: ROOM, sender: from, text }) });
    if (from === 'parent') {
      await pushTo('kua', { type: 'msg', title: '📡 Điện khẩn từ Tổng hành dinh', text });
    } else {
      await notifyParent('💬 Con nhắn: ' + text);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ err: e.message }); }
});

app.get('/msgs', async (req, res) => {
  try {
    const rows = await sb(`family_msgs?room_code=eq.${ROOM}&order=ts.desc&limit=30`);
    res.json(rows || []);
  } catch (e) { res.status(500).json({ err: e.message }); }
});


// máy Kua báo sự kiện (mở app, học xong...) → chuyển tới bố mẹ
app.post('/notify', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || String(text).length > 1500) return res.status(400).json({ err: 'thiếu/quá dài' });
    await notifyParent(String(text));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ err: e.message }); }
});

// ── báo cáo 23h VN hằng ngày (thay thế GitHub Actions khi server chạy) ──
setInterval(async () => {
  const vn = new Date(Date.now() + 7 * 3600e3);
  if (vn.getUTCHours() === 23 && vn.getUTCMinutes() === 0) {
    try {
      const day = vn.toISOString().slice(0, 10);
      const rows = await sb(`study_log?room_code=eq.${ROOM}&day=eq.${day}&select=data`);
      const ss = (rows || []).map(r => r.data).filter(Boolean);
      if (!ss.length) { await notifyParent(`🔴 TỔNG KẾT ${day.slice(8)}/${day.slice(5,7)}: hôm nay con CHƯA HỌC buổi nào.`); return; }
      const ok = ss.reduce((s, x) => s + (x.ok || 0), 0), tot = ss.reduce((s, x) => s + (x.tot || 0), 0);
      const mins = ss.reduce((s, x) => s + Math.max(1, Math.round(((x.e || 0) - (x.d || 0)) / 60000)), 0);
      await notifyParent(`🟢 TỔNG KẾT ${day.slice(8)}/${day.slice(5,7)}: ${ss.length} buổi · ~${mins} phút · đúng ${ok}/${tot} (${tot ? Math.round(ok/tot*100) : 0}%)`);
    } catch (e) {}
  }
}, 60 * 1000);

initVapid().then(() => {
  app.listen(PORT, () => console.log('S.H.I.E.L.D. Command chạy tại cổng ' + PORT));
}).catch(e => { console.error('Lỗi khởi động:', e.message); process.exit(1); });
