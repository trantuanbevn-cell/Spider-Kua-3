// ═══════════════════════════════════════════════
// 📚 THƯ VIỆN SÁCH GIÁO KHOA
// Đọc các sách gia đình tự cung cấp (file .txt trong repo)
// + liên kết SGK điện tử chính thức của NXB (Hành Trang Số)
// ═══════════════════════════════════════════════

var LIB_BOOKS=[
  { id:'sgk_toan_t2', ten:'SGK Toán 4 — Tập 2', icon:'🔢', file:'SGK_Toan_4_Tap2_KetNoi.txt' },
  { id:'vbt_toan_t2', ten:'Vở bài tập Toán 4 — Tập 2', icon:'✏️', file:'VBT_Toan_4_Tap2_KetNoi.txt' },
  { id:'sgk_tv_t2',   ten:'SGK Tiếng Việt 4 — Tập 2', icon:'📖', file:'SGK_TiengViet_4_Tap2_KetNoi.txt' }
];
var _libCache={};

function libHome(){
  pcEl().style.display='block';
  var h=pcHead('📚 THƯ VIỆN','closePractice()');
  h+='<div style="font-size:12.5px;color:var(--tx2);margin-bottom:12px;">Tra bài trong sách — bố mẹ giao bài nào, mở đúng bài đó ra xem!</div>';
  LIB_BOOKS.forEach(function(b,i){
    h+='<div onclick="libOpen('+i+')" style="'+pcCard()+'display:flex;align-items:center;gap:14px;">'
      +'<div style="font-size:30px;">'+b.icon+'</div>'
      +'<div style="flex:1;"><div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:15px;color:var(--tx);">'+b.ten+'</div>'
      +'<div style="font-size:11px;color:var(--tx3);">Chạm để mở — xem theo bài hoặc theo trang</div></div>'
      +'<div style="color:var(--tx3);font-size:20px;">›</div></div>';
  });
  // SGK điện tử chính thức — đầy đủ mọi cuốn, có hình ảnh màu
  h+='<div onclick="window.open(\'https://hanhtrangso.nxbgd.vn\',\'_blank\')" style="'+pcCard()+'display:flex;align-items:center;gap:14px;border-color:var(--green);">'
    +'<div style="font-size:30px;">🌐</div>'
    +'<div style="flex:1;"><div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:15px;color:var(--green);">SGK điện tử chính thức (Hành Trang Số)</div>'
    +'<div style="font-size:11px;color:var(--tx3);">Của NXB Giáo dục — đủ mọi cuốn, bản màu có hình. Miễn phí, cần tạo tài khoản 1 lần.</div></div>'
    +'<div style="color:var(--tx3);font-size:20px;">↗</div></div>';
  h+='<div style="font-size:10.5px;color:var(--tx3);margin-top:10px;line-height:1.7;">Muốn thêm sách Tập 1 vào thư viện: bố mẹ đưa file cho Claude là được thêm vào ngay.</div>';
  pcBox().innerHTML=h;
}

function libOpen(i){
  var b=LIB_BOOKS[i];
  pcBox().innerHTML=pcHead(b.icon+' '+b.ten.toUpperCase(),'libHome()')
    +'<div style="text-align:center;padding:50px 0;color:var(--tx2);">🕸️ Đang mở sách...</div>';
  var render=function(txt){
    _libCache[b.id]=txt;
    // mục lục theo BÀI, nếu không có thì theo TRANG
    var lines=txt.split('\n'), toc=[];
    lines.forEach(function(l,idx){
      var m=l.trim().match(/^BÀI\s+(\d+)\s*[:.]?\s*(.*)/i);
      if(m) toc.push({so:parseInt(m[1]), ten:m[2].slice(0,60), line:idx, kind:'bai'});
    });
    if(toc.length<3){
      lines.forEach(function(l,idx){
        var m=l.trim().match(/^---\s*TRANG\s+(\d+)\s*---/i);
        if(m) toc.push({so:parseInt(m[1]), ten:'Trang '+m[1], line:idx, kind:'trang'});
      });
    }
    var h=pcHead(b.icon+' '+b.ten.toUpperCase(),'libHome()');
    h+='<div style="display:flex;gap:8px;margin-bottom:12px;">'
      +'<input id="libSearch" type="text" placeholder="Tìm bài... (VD: 45 hoặc phân số)" style="flex:1;background:var(--s1);border:1px solid var(--bd2);border-radius:10px;color:var(--tx);font-size:13px;padding:10px 12px;outline:none;" oninput="libFilter('+i+')">'
      +'</div><div id="libToc">';
    h+=libTocHtml(toc,i);
    h+='</div>';
    pcBox().innerHTML=h;
    window['_libToc'+i]=toc;
  };
  if(_libCache[b.id]) render(_libCache[b.id]);
  else fetch(b.file).then(function(r){return r.text();}).then(render)
    .catch(function(){ pcBox().innerHTML=pcHead('LỖI','libHome()')+'<div style="text-align:center;color:var(--red2);padding:40px 0;">Không mở được sách — kiểm tra mạng.</div>'; });
}
function libTocHtml(toc,i){
  return toc.map(function(t,j){
    return '<div onclick="libRead('+i+','+j+')" style="'+pcCard()+'padding:11px 14px;display:flex;align-items:center;gap:10px;">'
      +'<div style="min-width:40px;height:32px;border-radius:8px;background:var(--s3);display:flex;align-items:center;justify-content:center;font-family:Rajdhani,sans-serif;font-weight:700;color:var(--gold);font-size:13px;">'+t.so+'</div>'
      +'<div style="flex:1;font-size:13px;color:var(--tx);">'+(t.kind==='bai'?'Bài '+t.so+(t.ten?': '+t.ten:''):t.ten)+'</div></div>';
  }).join('');
}
function libFilter(i){
  var q=(document.getElementById('libSearch').value||'').toLowerCase().trim();
  var toc=window['_libToc'+i]||[];
  var f=q?toc.filter(function(t){ return String(t.so)===q || (t.ten||'').toLowerCase().indexOf(q)>=0; }):toc;
  document.getElementById('libToc').innerHTML=libTocHtml(f.map(function(t){return t;}),i)
    .replace(/libRead\((\d+),(\d+)\)/g, function(m0,a,b){
      // ánh xạ lại chỉ số sau khi lọc
      var t=f[parseInt(b)]; var orig=toc.indexOf(t);
      return 'libRead('+a+','+orig+')';
    });
}
function libRead(i,j){
  var b=LIB_BOOKS[i], toc=window['_libToc'+i], t=toc[j];
  var txt=_libCache[b.id]||'', lines=txt.split('\n');
  var endLine=(j+1<toc.length)?toc[j+1].line:Math.min(t.line+120,lines.length);
  var body=lines.slice(t.line,endLine).join('\n').trim();
  var title=(t.kind==='bai'?'BÀI '+t.so:t.ten).toUpperCase();
  pcBox().innerHTML=pcHead('📖 '+title,'libOpen('+i+')')
    +'<div style="display:flex;gap:8px;margin-bottom:12px;">'
    +'<button onclick="speak&&speak(window._libBody.slice(0,500))" style="'+pcBtn2()+'flex:1;font-size:12px;">🔊 Fury đọc</button>'
    +'<button onclick="libAskFury('+i+','+j+')" style="'+pcBtn2()+'flex:1;font-size:12px;border-color:var(--gold);color:var(--gold);">🛡️ Fury hướng dẫn bài này</button></div>'
    +'<div style="background:var(--s1);border:1px solid var(--bd);border-radius:14px;padding:16px;font-size:14px;line-height:2;color:var(--tx);white-space:pre-wrap;">'
    +body.replace(/</g,'&lt;')+'</div>';
  window._libBody=body;
  pcEl().scrollTop=0;
}
function libAskFury(i,j){
  var b=LIB_BOOKS[i], toc=window['_libToc'+i], t=toc[j];
  var body=(window._libBody||'').slice(0,900);
  closePractice();
  if(typeof qs==='function') qs('[TRA SÁCH] Em đang mở '+b.ten+' — '+(t.kind==='bai'?'Bài '+t.so:t.ten)+':\n'+body+'\nAnh hướng dẫn em làm/hiểu bài này theo đúng cách SGK nhé!');
}

// gắn nút Thư viện vào popup "FURY TRA SÁCH" hiện có
setTimeout(function(){
  var pop=document.getElementById('furySearchPopup');
  if(!pop) return;
  var box=pop.querySelector('div');
  if(!box || document.getElementById('libBtn')) return;
  var d=document.createElement('button');
  d.id='libBtn';
  d.textContent='📚 MỞ THƯ VIỆN SÁCH';
  d.style.cssText='width:100%;margin-top:10px;background:var(--blue2);border:none;border-radius:10px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;padding:11px;cursor:pointer;';
  d.onclick=function(){ if(typeof closeFurySearch==='function') closeFurySearch(); libHome(); };
  box.appendChild(d);
}, 1000);
