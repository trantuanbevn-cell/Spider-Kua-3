// ═══════════════════════════════════════════════
// S.H.I.E.L.D. COMMAND — phía app
// Kết nối server Railway: nhận triệu tập khi app tắt, còi báo động,
// xác nhận lệnh, hộp thư 2 chiều bố mẹ ↔ con
// ═══════════════════════════════════════════════

var SRV_DEFAULT='https://spider-kua-3-production.up.railway.app'; // server gia đình — nướng sẵn
function srvUrl(){ return (localStorage.getItem('srv_url')||SRV_DEFAULT).replace(/\/$/,''); }
function srvKey(){ return localStorage.getItem('srv_key')||''; }
function srvOn(){ return !!srvUrl(); }

async function srvPost(path, body){
  const r = await fetch(srvUrl()+path, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})});
  if(!r.ok) throw new Error((await r.json().catch(function(){return{};})).err||r.status);
  return r.json();
}

// ── ĐĂNG KÝ NHẬN THÔNG BÁO ĐẨY (làm 1 lần mỗi máy) ──
function _b64ToU8(s){
  var pad='='.repeat((4-s.length%4)%4), b=(s+pad).replace(/-/g,'+').replace(/_/g,'/');
  var raw=atob(b), a=new Uint8Array(raw.length);
  for(var i=0;i<raw.length;i++) a[i]=raw.charCodeAt(i);
  return a;
}
async function cmdSubscribe(){
  if(!srvOn()||!('serviceWorker' in navigator)||!('PushManager' in window)) return false;
  var perm=await Notification.requestPermission();
  if(perm!=='granted'){ alert('Cần cho phép Thông báo để nhận lệnh triệu tập!'); return false; }
  var reg=await navigator.serviceWorker.ready;
  var vap=await (await fetch(srvUrl()+'/vapid')).json();
  if(!vap.key) return false;
  var sub=await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:_b64ToU8(vap.key)});
  var role=(typeof roleGet==='function'&&roleGet()==='parent')?'parent':'kua';
  await srvPost('/subscribe',{role:role, sub:sub.toJSON()});
  localStorage.setItem('push_ready','1');
  return true;
}
// tự đăng ký lại mỗi lần mở (giữ subscription tươi)
setTimeout(function(){ if(srvOn()&&localStorage.getItem('push_ready')&&Notification.permission==='granted') cmdSubscribe().catch(function(){}); }, 5000);

// ── CÒI BÁO ĐỘNG S.H.I.E.L.D. (WebAudio — không cần file) ──
var _sirenCtx=null,_sirenStop=false;
function sirenStart(sec){
  try{
    _sirenStop=false;
    _sirenCtx=_sirenCtx||new (window.AudioContext||window.webkitAudioContext)();
    var ctx=_sirenCtx, t0=ctx.currentTime;
    var o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sawtooth'; o.connect(g); g.connect(ctx.destination);
    g.gain.value=0.4;
    for(var i=0;i<(sec||6)*2;i++){
      o.frequency.setValueAtTime(660,t0+i*0.5);
      o.frequency.linearRampToValueAtTime(990,t0+i*0.5+0.25);
      o.frequency.linearRampToValueAtTime(660,t0+i*0.5+0.5);
    }
    o.start(t0); o.stop(t0+(sec||6));
  }catch(e){}
}
function sirenStop(){ _sirenStop=true; try{ if(_sirenCtx) _sirenCtx.close(); _sirenCtx=null; }catch(e){} }

// ── XỬ LÝ LỆNH khi mở app từ thông báo (?cmd=...) ──
function cmdHandleUrl(){
  var p=new URLSearchParams(location.search);
  var cmd=p.get('cmd'); if(!cmd) return;
  var id=p.get('id')||'', text=decodeURIComponent(p.get('text')||'');
  history.replaceState(null,'',location.pathname); // xóa query để không lặp
  setTimeout(function(){ cmdShowDirective(cmd,id,text); }, 1200);
}
function cmdShowDirective(cmd,id,text){
  sirenStart(cmd==='call'?10:6);
  if(typeof speak==='function') setTimeout(function(){ speak((cmd==='call'?'Peter! Bố mẹ đang gọi em! ':'Peter! Điện khẩn từ Tổng hành dinh! ')+text); }, 1500);
  var ov=document.createElement('div');
  ov.id='cmdOL';
  ov.style.cssText='position:fixed;inset:0;background:rgba(120,10,15,.97);z-index:980;display:flex;align-items:center;justify-content:center;padding:20px;animation:pulse 1s infinite;';
  ov.innerHTML='<div style="max-width:380px;width:100%;text-align:center;">'
    +'<div style="font-size:56px;">'+(cmd==='call'?'📞':'🚨')+'</div>'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:24px;color:#fff;letter-spacing:.06em;margin:8px 0;">'+(cmd==='call'?'BỐ MẸ ĐANG GỌI!':'S.H.I.E.L.D. TRIỆU TẬP!')+'</div>'
    +'<div style="background:rgba(0,0,0,.4);border-radius:14px;padding:16px;font-size:16px;color:#fff;line-height:1.7;margin-bottom:18px;">'+text.replace(/</g,'&lt;')+'</div>'
    +(cmd==='call'
      ?'<button onclick="cmdAck(\''+id+'\',\'Con nghe đây ạ\');cmdOpenCall();" style="display:block;width:100%;background:#30d158;border:none;border-radius:14px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:18px;padding:16px;cursor:pointer;margin-bottom:10px;">📞 NGHE MÁY (mở Zalo)</button>'
      :'<button onclick="cmdAck(\''+id+'\',\'Con vào học ngay\');cmdGoStudy();" style="display:block;width:100%;background:#30d158;border:none;border-radius:14px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:18px;padding:16px;cursor:pointer;margin-bottom:10px;">✅ CON VÀO HỌC NGAY</button>')
    +'<button onclick="cmdAck(\''+id+'\',\'Con đang học rồi ạ\')" style="display:block;width:100%;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.4);border-radius:14px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:15px;padding:12px;cursor:pointer;margin-bottom:10px;">📚 Con đang học rồi ạ</button>'
    +'<button onclick="cmdReplyVoice(\''+id+'\')" style="display:block;width:100%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);border-radius:14px;color:#fff;font-size:13px;padding:10px;cursor:pointer;">🎤 Nhắn lại bố mẹ bằng giọng nói</button>'
    +'</div>';
  document.body.appendChild(ov);
}
function cmdAck(id,action){
  sirenStop();
  var ov=document.getElementById('cmdOL'); if(ov) ov.remove();
  if(srvOn()&&id) srvPost('/ack',{id:id,action:action}).catch(function(){});
  else if(typeof tgNotify==='function') tgNotify('✅ Con xác nhận: '+action);
}
function cmdGoStudy(){
  setTimeout(function(){ if(typeof openPractice==='function'){ openPractice(); setTimeout(function(){ if(typeof adStartDaily==='function') adStartDaily(); },500); } },300);
}
function cmdOpenCall(){
  var link=localStorage.getItem('call_link');
  if(link) location.href=link;
  else alert('Chưa cài link gọi (bố mẹ vào Bảng điều khiển → Server Command để thêm link Zalo).');
}
function cmdReplyVoice(id){
  var S=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!S){ alert('Máy không hỗ trợ mic.'); return; }
  var sr=new S(); sr.lang='vi-VN';
  sr.onresult=function(e){
    var said=(e.results[0][0].transcript||'').trim();
    if(!said) return;
    if(srvOn()) srvPost('/msg',{from:'kua',text:said}).catch(function(){});
    else if(typeof tgNotify==='function') tgNotify('💬 Con nhắn: '+said);
    cmdAck(id,'Đã nhắn lại: '+said);
  };
  sr.start();
  if(typeof speak==='function') speak('Em nói đi, anh chuyển lời cho bố mẹ!');
}
document.addEventListener('DOMContentLoaded', cmdHandleUrl);
if(document.readyState!=='loading') cmdHandleUrl();

// ── PHÍA BỐ MẸ: nút điều khiển trong dashboard ──
function adminCommand(){
  if(!srvOn()){ adminServerSetup(); return; }
  var text=prompt('Nội dung lệnh gửi xuống tablet của con:','Con vào học Nhiệm vụ hôm nay ngay nhé!');
  if(text===null) return;
  srvPost('/summon',{key:srvKey(),text:text.trim()||'Vào học ngay!'})
    .then(function(){ alert('📡 Đã phát lệnh! Tablet sẽ reo (kể cả khi app tắt). Nếu con không phản hồi trong 10 phút, anh/chị sẽ nhận cảnh báo Telegram.'); })
    .catch(function(e){ alert('Lỗi gửi lệnh: '+e.message+'\nKiểm tra URL server và mã trong "Server Command".'); });
}
function adminCall(){
  if(!srvOn()){ adminServerSetup(); return; }
  srvPost('/summon',{key:srvKey(),kind:'call',text:'Bố mẹ đang gọi — con nghe máy nhé!'})
    .then(function(){ var l=localStorage.getItem('call_link'); if(l) location.href=l; alert('📞 Đã đổ chuông tablet. '+(l?'Đang mở Zalo cho anh/chị...':'')); })
    .catch(function(e){ alert('Lỗi: '+e.message); });
}
function adminMsgKid(){
  if(!srvOn()){ adminServerSetup(); return; }
  var text=prompt('Nhắn cho con (Fury sẽ đọc to trên tablet):');
  if(!text||!text.trim()) return;
  srvPost('/msg',{key:srvKey(),from:'parent',text:text.trim()})
    .then(function(){ alert('💬 Đã gửi.'); })
    .catch(function(e){ alert('Lỗi: '+e.message); });
}
function adminServerSetup(){
  var u=prompt('URL server Railway (VD: https://spider-kua.up.railway.app):', srvUrl());
  if(u===null) return;
  var k=prompt('ADMIN_KEY (đúng mã đã đặt trong Railway → Variables):', srvKey());
  if(k===null) return;
  var z=prompt('Link gọi Zalo (tùy chọn — VD https://zalo.me/09xxxxxxxx):', localStorage.getItem('call_link')||'');
  localStorage.setItem('srv_url',(u||'').trim());
  localStorage.setItem('srv_key',(k||'').trim());
  if(z!==null) localStorage.setItem('call_link',(z||'').trim());
  if(srvOn()){
    fetch(srvUrl()+'/health').then(function(r){return r.json();})
      .then(function(){ alert('✅ Kết nối server thành công! Giờ bấm "Bật nhận thông báo" trên CẢ máy này và máy của con.'); adminOpen(); })
      .catch(function(){ alert('⚠️ Không gọi được server — kiểm tra URL.'); });
  }
}

// ── PHÍA KUA: nút nhắn bố mẹ trong màn hình chính ──
function kuaMsgParent(){
  var S=window.SpeechRecognition||window.webkitSpeechRecognition;
  var send=function(said){
    if(!said||!said.trim()) return;
    if(srvOn()) srvPost('/msg',{from:'kua',text:said.trim()}).then(function(){ if(typeof speak==='function') speak('Đã chuyển lời cho bố mẹ!'); }).catch(function(){});
    else if(typeof tgNotify==='function'){ tgNotify('💬 Con nhắn: '+said.trim()); if(typeof speak==='function') speak('Đã chuyển lời cho bố mẹ!'); }
  };
  if(S){
    if(typeof speak==='function') speak('Em muốn nhắn gì cho bố mẹ? Nói đi!');
    var sr=new S(); sr.lang='vi-VN';
    sr.onresult=function(e){ send(e.results[0][0].transcript); };
    setTimeout(function(){ sr.start(); }, 1800);
  } else {
    var t=prompt('Nhắn gì cho bố mẹ?'); send(t);
  }
}


// ═══ TỰ ĐỘNG KẾT NỐI SERVER SAU KHI ĐĂNG NHẬP — không phải gõ tay gì thêm ═══
async function cmdAutoSetup(role, pin){
  try{
    if(role==='parent' && pin && !srvKey()){
      try{
        var r=await srvPost('/activate',{pin:String(pin)});
        if(r&&r.key){ localStorage.setItem('srv_key',r.key); }
      }catch(e){}
    }
    // đăng ký nhận thông báo đẩy (hỏi quyền ngay trong thao tác chạm của người dùng)
    cmdSubscribe().then(function(ok){
      if(ok && typeof speak==='function' && role==='kua') speak('Kênh liên lạc với bố mẹ đã mở!');
    }).catch(function(){});
  }catch(e){}
}

// Máy đã chọn vai từ trước (không qua màn nhập mã): lần chạm đầu tiên vào app
// sẽ tự đăng ký nhận thông báo — không cần thao tác gì thêm
(function(){
  function once(){
    document.removeEventListener('click', once);
    try{
      var role=(typeof roleGet==='function')?roleGet():localStorage.getItem('device_role');
      if(!role) return;
      if(localStorage.getItem('push_ready')) return;
      cmdSubscribe().catch(function(){});
    }catch(e){}
  }
  document.addEventListener('click', once);
})();
