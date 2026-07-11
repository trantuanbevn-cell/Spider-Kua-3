// ═══════════════════════════════════════════════
// SÁCH LỚP 5 TRONG APP — ảnh trang thật từ kho riêng (Supabase Storage)
// Giao bài "Toán 5 trang 28" → Kua mở đúng ảnh trang đó
// Fury ĐỌC TRỰC TIẾP trang sách bằng Gemini Vision để giảng bài
// ═══════════════════════════════════════════════

var SACH5={
  toan5:    {ten:'SGK Toán 5',        icon:'🔢', mau:'var(--red)'},
  tv5:      {ten:'SGK Tiếng Việt 5',  icon:'📖', mau:'var(--gold)'},
  vbt_toan5:{ten:'VBT Toán 5',        icon:'✏️', mau:'var(--red)'},
  vbt_tv5:  {ten:'VBT Tiếng Việt 5',  icon:'📝', mau:'var(--gold)'}
};

// ── tải ảnh trang từ bucket riêng 'sach' (cần policy select cho anon) ──
var _s5cache={};
async function sachImgObj(book,page){
  var key=book+'/'+page;
  if(_s5cache[key]) return _s5cache[key];
  var p3=String(page).padStart(3,'0');
  var url=SB_URL+'/storage/v1/object/authenticated/sach/'+book+'/p'+p3+'.jpg';
  var r=await fetch(url,{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}});
  if(!r.ok) throw new Error('no-page');
  var blob=await r.blob();
  if(blob.size<500) throw new Error('no-page');
  _s5cache[key]={url:URL.createObjectURL(blob), blob:blob};
  return _s5cache[key];
}
function sachImgB64(book,page){
  return sachImgObj(book,page).then(function(o){
    return new Promise(function(res,rej){
      var fr=new FileReader();
      fr.onload=function(){ res(String(fr.result).split(',')[1]); };
      fr.onerror=rej; fr.readAsDataURL(o.blob);
    });
  });
}

// ── nhận diện "sách + trang" trong lời giao bài của bố mẹ ──
// VD: "Toán 5 trang 28", "tv trang 30-31", "vbt toán trang 12 đến 13"
function sachParse5(text){
  var t=' '+String(text||'').toLowerCase()+' ', out=[], seen={};
  var pats=[
    [/vbt\s*(?:toán|toan)[^0-9]*?trang\s*(\d+)(?:\s*(?:-|–|đến|den)\s*(\d+))?/g,'vbt_toan5'],
    [/vbt\s*(?:tiếng\s*việt|tieng\s*viet|tv)[^0-9]*?trang\s*(\d+)(?:\s*(?:-|–|đến|den)\s*(\d+))?/g,'vbt_tv5'],
    [/(?:toán|toan)\s*(?:5)?[^0-9a-zà-ỹ]*?trang\s*(\d+)(?:\s*(?:-|–|đến|den)\s*(\d+))?/g,'toan5'],
    [/(?:tiếng\s*việt|tieng\s*viet|tv)\s*(?:5)?[^0-9a-zà-ỹ]*?trang\s*(\d+)(?:\s*(?:-|–|đến|den)\s*(\d+))?/g,'tv5']
  ];
  pats.forEach(function(p){
    var m;
    while((m=p[0].exec(t))!==null){
      // đã khớp VBT thì xoá khỏi chuỗi để không bắt trùng vào SGK
      if(p[1].indexOf('vbt_')===0){ t=t.slice(0,m.index)+' '.repeat(m[0].length)+t.slice(m.index+m[0].length); }
      var from=parseInt(m[1]), to=m[2]?parseInt(m[2]):from;
      if(from<1||from>250) continue;
      if(to<from||to>from+7) to=from;
      var k=p[1]+':'+from;
      if(seen[k]) continue; seen[k]=1;
      out.push({book:p[1], from:from, to:to});
    }
  });
  return out;
}

// ── TRÌNH XEM TRANG SÁCH (toàn màn hình, phóng to được) ──
var _s5v={book:null,page:1,from:1,to:1};
function sachView(book,from,to){
  _s5v={book:book,page:from,from:from,to:(to||from)};
  var ov=document.getElementById('s5OL');
  if(!ov){
    ov=document.createElement('div');
    ov.id='s5OL';
    ov.style.cssText='position:fixed;inset:0;background:#06070c;z-index:960;display:flex;flex-direction:column;';
    document.body.appendChild(ov);
  }
  ov.style.display='flex';
  sachRender();
}
function sachClose(){ var o=document.getElementById('s5OL'); if(o) o.style.display='none'; }
function sachNav(d){
  var p=_s5v.page+d;
  if(p<_s5v.from||p>_s5v.to) return;
  _s5v.page=p; sachRender();
}
function sachRender(){
  var ov=document.getElementById('s5OL'); if(!ov) return;
  var B=SACH5[_s5v.book]||{ten:_s5v.book,icon:'📚',mau:'var(--blue2)'};
  var multi=_s5v.to>_s5v.from;
  ov.innerHTML='<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--s1,#0d1117);border-bottom:1px solid var(--bd,#232b3d);">'
    +'<div style="font-size:22px;">'+B.icon+'</div>'
    +'<div style="flex:1;"><div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:15px;color:var(--gold,#f5c842);">'+B.ten+'</div>'
    +'<div style="font-size:11px;color:var(--tx3,#4a5570);">Trang '+_s5v.page+(multi?' · bài giao trang '+_s5v.from+'–'+_s5v.to:'')+'</div></div>'
    +'<button onclick="sachClose()" style="background:transparent;border:1px solid var(--bd2,#3a4560);border-radius:8px;color:var(--tx2,#8a94b0);padding:6px 12px;cursor:pointer;font-size:14px;">✕</button></div>'
    +'<div id="s5Body" style="flex:1;overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y pinch-zoom;display:flex;align-items:flex-start;justify-content:center;padding:8px;">'
    +'<div style="color:var(--tx3,#4a5570);padding:60px 20px;text-align:center;">🕸️ Đang mở trang '+_s5v.page+'...</div></div>'
    +'<div style="display:flex;gap:8px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:var(--s1,#0d1117);border-top:1px solid var(--bd,#232b3d);">'
    +(multi?'<button onclick="sachNav(-1)" style="background:var(--s2,#161b27);border:1px solid var(--bd2,#3a4560);border-radius:12px;color:var(--tx,#e8eaf0);font-size:18px;padding:12px 16px;cursor:pointer;'+(_s5v.page<=_s5v.from?'opacity:.3;':'')+'">‹</button>':'')
    +'<button onclick="sachFury()" style="flex:1;background:linear-gradient(135deg,var(--red,#e8192c),#a01020);border:none;border-radius:12px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:15px;padding:12px;cursor:pointer;">🛡️ FURY DẠY TRANG NÀY</button>'
    +(multi?'<button onclick="sachNav(1)" style="background:var(--s2,#161b27);border:1px solid var(--bd2,#3a4560);border-radius:12px;color:var(--tx,#e8eaf0);font-size:18px;padding:12px 16px;cursor:pointer;'+(_s5v.page>=_s5v.to?'opacity:.3;':'')+'">›</button>':'');
  sachImgObj(_s5v.book,_s5v.page).then(function(o){
    var b=document.getElementById('s5Body'); if(!b) return;
    b.innerHTML='<img src="'+o.url+'" style="width:100%;max-width:760px;border-radius:8px;display:block;" alt="Trang '+_s5v.page+'">';
  }).catch(function(){
    var b=document.getElementById('s5Body'); if(!b) return;
    b.innerHTML='<div style="max-width:340px;text-align:center;padding:50px 16px;color:var(--tx2,#8a94b0);line-height:1.8;font-size:13.5px;">'
      +'<div style="font-size:44px;margin-bottom:10px;">📚</div>'
      +'<b style="color:var(--gold,#f5c842);">Trang '+_s5v.page+' chưa có trong kho sách.</b><br>'
      +'Bố mẹ chụp trang này thả vào thư mục Spider Kua là có ngay!<br><br>'
      +'Em vẫn có thể bấm <b>FURY DẠY TRANG NÀY</b> — anh Fury sẽ hướng dẫn theo chương trình lớp 5 nhé.</div>';
  });
}

// ── FURY ĐỌC TRANG SÁCH — đính ảnh trang vào Gemini Vision ──
async function sachFury(){
  var B=SACH5[_s5v.book]||{ten:_s5v.book};
  var page=_s5v.page;
  sachClose();
  var ask=B.ten+' trang '+page+'. Anh đọc kỹ toàn bộ trang sách này: nếu có phần lý thuyết/kiến thức mới thì giảng cho em thật dễ hiểu trước (ví dụ gần gũi kiểu Spider-Man), rồi hướng dẫn em làm TỪNG bài tập trên trang theo từng bước nhỏ — mỗi lần chỉ hỏi em 1 bước, KHÔNG làm hộ đáp án.';
  var imgs=[];
  try{ imgs.push(await sachImgB64(_s5v.book,page)); }catch(e){}
  try{
    addUserMsg('🛡️ Fury ơi, dạy em '+B.ten+' trang '+page+' nhé!', imgs);
    showTyp();
    var r=await callAI(imgs.length?ask:(ask+' (Chưa có ảnh trang — anh dựa vào chương trình '+B.ten+' Kết nối tri thức để đoán nội dung trang '+page+' và dạy em phần kiến thức tương ứng.)'), imgs);
    hideTyp(); addAIMsg(r); if(typeof speak==='function') speak(r);
    if(typeof logFuryChat==='function') logFuryChat('[Sách] '+B.ten+' trang '+page, r);
  }catch(e){ hideTyp(); addAIMsg('Ối, đường truyền trục trặc! Em bấm lại giúp anh nhé.'); }
}

// ── GẮN VÀO BÀI TẬP ĐƯỢC GIAO: hiện nút mở trang sách trong chat ──
function sachHwButtons(text){
  var refs=sachParse5(text);
  if(!refs.length) return '';
  var h='<div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">';
  refs.forEach(function(r){
    var B=SACH5[r.book];
    h+='<button onclick="sachView(\''+r.book+'\','+r.from+','+r.to+')" style="background:linear-gradient(135deg,rgba(15,76,143,.35),rgba(232,25,44,.15));border:1.5px solid '+B.mau+';border-radius:12px;color:var(--tx,#e8eaf0);font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;padding:12px;cursor:pointer;text-align:left;">'
      +B.icon+' MỞ '+B.ten.toUpperCase()+' — TRANG '+r.from+(r.to>r.from?'–'+r.to:'')+' ›</button>';
  });
  return h+'</div>';
}
// chèn nút sau khi Fury đọc bài tập trong chat
if(typeof showHWInChat==='function'){
  var _s5hw=showHWInChat;
  showHWInChat=function(){
    _s5hw();
    try{
      var hwText=(HW()[0]||{}).text||'';
      var btns=sachHwButtons(hwText);
      if(btns) addRaw('ai','<div style="font-size:12.5px;color:var(--tx2);margin-bottom:2px;">📖 Bài hôm nay có trang sách — em mở ra làm trực tiếp nhé:</div>'+btns);
    }catch(e){}
  };
}

// ── PHÍA BỐ MẸ: nút mẫu điền nhanh vào ô giao bài ──
document.addEventListener('DOMContentLoaded', function(){
  try{
    var ta=document.getElementById('hwTA');
    if(!ta||document.getElementById('s5Tpl')) return;
    var d=document.createElement('div');
    d.id='s5Tpl';
    d.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;';
    [['🔢 Toán 5','Toán 5 trang '],['📖 TV 5','Tiếng Việt 5 trang '],['✏️ VBT Toán','VBT Toán trang '],['📝 VBT TV','VBT Tiếng Việt trang ']].forEach(function(x){
      var b=document.createElement('button');
      b.textContent=x[0];
      b.style.cssText='background:var(--s2);border:1px solid var(--bd2);border-radius:8px;color:var(--tx2);font-size:11.5px;padding:6px 10px;cursor:pointer;';
      b.onclick=function(){ ta.value=(ta.value?ta.value+'\n':'')+x[1]; ta.focus(); };
      d.appendChild(b);
    });
    ta.parentNode.insertBefore(d, ta);
  }catch(e){}
});

// ── THƯ VIỆN: duyệt sách lớp 5 tự do ──
setTimeout(function(){
  if(typeof libHome!=='function') return;
  var _s5lib=libHome;
  libHome=function(){
    _s5lib();
    try{
      var box=pcBox(); if(!box) return;
      var h='<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;color:var(--tx2);letter-spacing:.08em;margin:14px 0 8px;">📚 SÁCH LỚP 5 (ẢNH TRANG THẬT)</div>';
      Object.keys(SACH5).forEach(function(k){
        var B=SACH5[k];
        h+='<div onclick="sachBrowse(\''+k+'\')" style="'+pcCard()+'display:flex;align-items:center;gap:14px;">'
          +'<div style="font-size:28px;">'+B.icon+'</div>'
          +'<div style="flex:1;"><div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:15px;color:var(--tx);">'+B.ten+'</div>'
          +'<div style="font-size:11.5px;color:var(--tx3);">Mở theo số trang · Fury dạy trực tiếp từ trang sách</div></div>'
          +'<div style="color:var(--tx3);font-size:20px;">›</div></div>';
      });
      box.insertAdjacentHTML('beforeend', h);
    }catch(e){}
  };
}, 800);
function sachBrowse(book){
  var p=prompt('Mở '+(SACH5[book]||{}).ten+' — trang số mấy?');
  if(!p) return;
  var n=parseInt(p); if(!n||n<1||n>250){ alert('Số trang không hợp lệ!'); return; }
  closePractice&&closePractice();
  sachView(book, n, Math.min(n+5,250));
}
