// ═══════════════════════════════════════════════
// THÔNG BÁO ĐẾN ĐIỆN THOẠI BỐ MẸ (Telegram)
// Máy Kua tự gửi tin khi: mở app · bắt đầu buổi học · học xong (kèm kết quả)
// Tổng kết 23h đêm do GitHub Actions gửi (xem HUONG_DAN_THONG_BAO.md)
// ═══════════════════════════════════════════════

function tgCfg(){ return { t: localStorage.getItem('tg_token')||'', c: localStorage.getItem('tg_chat')||'' }; }

function tgNotify(text){
  var g=tgCfg(); if(!g.t||!g.c) return;
  try{
    fetch('https://api.telegram.org/bot'+g.t+'/sendMessage', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: g.c, text: text})
    }).catch(function(){});
  }catch(e){}
}

// cấu hình nhập 1 lần ở máy bố mẹ → đẩy lên cloud → máy Kua tự nhận về
function tgPushToCloud(){
  try{
    if(typeof sbFetch!=='function') return;
    var g=tgCfg();
    [['tg_token',g.t],['tg_chat',g.c]].forEach(function(kv){
      if(!kv[1]) return;
      sbFetch('app_config?on_conflict=room_code,k', {method:'POST',
        prefer:'resolution=merge-duplicates,return=minimal',
        body: JSON.stringify({room_code: room(), k: kv[0], v: kv[1]})
      }).catch(function(){});
    });
  }catch(e){}
}
function tgSyncFromCloud(){
  try{
    if(typeof sbFetch!=='function') return;
    if(tgCfg().t && tgCfg().c) return; // máy này đã có cấu hình
    sbFetch('app_config?room_code=eq.'+room()+'&select=k,v').then(function(rows){
      (rows||[]).forEach(function(r){
        if(r.k==='tg_token') localStorage.setItem('tg_token', r.v);
        if(r.k==='tg_chat')  localStorage.setItem('tg_chat',  r.v);
      });
    }).catch(function(){});
  }catch(e){}
}
setTimeout(tgSyncFromCloud, 4000);

function tgIsKua(){ return (typeof roleGet==='function'?roleGet():localStorage.getItem('device_role'))==='kua'; }
function tgTime(){ var d=new Date(); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }

// ── SỰ KIỆN 1: con mở app (tối đa 1 tin / 30 phút) ──
setTimeout(function(){
  try{
    if(!tgIsKua()) return;
    var last=parseInt(localStorage.getItem('tg_last_open')||'0');
    if(Date.now()-last < 30*60000) return;
    localStorage.setItem('tg_last_open', String(Date.now()));
    var ten=(typeof getProfile==='function')?getProfile().ten:'Kua';
    tgNotify('🟢 '+ten+' vừa mở Spider-Kua lúc '+tgTime());
  }catch(e){}
}, 6000);

// ── SỰ KIỆN 2: bắt đầu Nhiệm vụ hôm nay (tối đa 1 tin / 10 phút) ──
if(typeof adStartDaily==='function'){
  var _tg_start=adStartDaily;
  adStartDaily=function(){
    try{
      if(tgIsKua()){
        var last=parseInt(localStorage.getItem('tg_last_start')||'0');
        if(Date.now()-last > 10*60000){
          localStorage.setItem('tg_last_start', String(Date.now()));
          var ten=(typeof getProfile==='function')?getProfile().ten:'Kua';
          tgNotify('📚 '+ten+' bắt đầu Nhiệm vụ hôm nay lúc '+tgTime()+' (mục tiêu '+((typeof adTargetMin==='function')?adTargetMin():20)+' phút)');
        }
      }
    }catch(e){}
    _tg_start();
  };
}

// ── SỰ KIỆN 3: học xong 1 buổi — gửi kèm kết quả & nhận xét Fury ──
if(typeof adSaveJournal==='function'){
  var _tg_save=adSaveJournal;
  adSaveJournal=function(kind){
    _tg_save(kind);
    try{
      if(!tgIsKua()) return;
      var j=pcLS('hoc_nhatky','[]'); var s=j[j.length-1]; if(!s) return;
      var pct=s.tot?Math.round(s.ok/s.tot*100):0;
      var kindLabel=s.kind==='daily'?'⚡ Nhiệm vụ ngày':(s.kind==='review'?'🔁 Ôn lỗi sai':'🎯 Tự luyện');
      tgNotify('🏁 Học xong '+adFmtTime(s.d)+'–'+adFmtTime(s.e)+' · '+kindLabel+(s.mon?' · '+s.mon:'')
        +'\n✅ Đúng '+s.ok+'/'+s.tot+' câu ('+pct+'%) · +'+(s.xu||0)+' xu'
        +(s.noiDung?'\n📚 '+s.noiDung:'')
        +(s.nhanXet?'\n🛡️ Fury: '+s.nhanXet:''));
    }catch(e){}
  };
}
