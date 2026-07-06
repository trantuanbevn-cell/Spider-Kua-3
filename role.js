// ═══════════════════════════════════════════════
// PHÂN VAI THIẾT BỊ — Kua (học sinh) vs Bố mẹ (admin)
// Máy Kua: chỉ thấy tính năng học. Máy bố mẹ: bảng điều khiển đầy đủ.
// ═══════════════════════════════════════════════

// Mã theo yêu cầu gia đình (đổi được trong Bảng điều khiển bố mẹ)
// Áp 1 lần cho mọi thiết bị, kể cả máy đã đặt PIN thử trước đó
if(!localStorage.getItem('pin_seed_v43')){
  localStorage.setItem('parent_pin','280510');
  localStorage.setItem('kua_code','140816');
  localStorage.setItem('pin_seed_v43','1');
}

function roleGet(){ return localStorage.getItem('device_role') || ''; }
function roleSet(r){ localStorage.setItem('device_role', r); roleApply(); }

// ── áp giao diện theo vai ──
function roleApply(){
  var r = roleGet();
  document.body.classList.remove('role-kua','role-parent');
  if(r) document.body.classList.add('role-'+r);
  // máy Kua tự đánh dấu là nguồn dữ liệu chính
  if(r==='kua' && localStorage.getItem('isKuaDevice')!=='true') localStorage.setItem('isKuaDevice','true');
  if(r==='parent') localStorage.setItem('isKuaDevice','false');
}

// CSS ẩn tính năng quản lý trên máy Kua
(function(){
  var st=document.createElement('style');
  st.textContent=
    'body.role-kua .hbtn{display:none!important;}'
    +'body.role-kua .stats .tkb-btn[title="Thống kê học tập"]{display:none!important;}' /* nút 👩 và KEY */
    +'body.role-parent #adminFab{display:flex!important;}'
    +'#adminFab{display:none;position:fixed;right:14px;bottom:14px;z-index:450;width:54px;height:54px;border-radius:50%;background:var(--blue2);border:none;color:#fff;font-size:24px;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.5);align-items:center;justify-content:center;}';
  document.head.appendChild(st);
})();

// ── màn hình chọn vai (lần đầu hoặc khi đổi máy) ──
function roleChooser(force){
  if(roleGet() && !force) { roleApply(); return; }
  var ov=document.getElementById('roleOL');
  if(!ov){
    ov=document.createElement('div');
    ov.id='roleOL';
    ov.style.cssText='position:fixed;inset:0;background:var(--bg,#08090f);z-index:900;display:flex;align-items:center;justify-content:center;padding:20px;';
    document.body.appendChild(ov);
  }
  ov.style.display='flex';
  ov.innerHTML='<div style="max-width:380px;width:100%;text-align:center;">'
    +'<div style="font-size:46px;margin-bottom:8px;">🛡️</div>'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:22px;color:var(--gold);margin-bottom:4px;">AI ĐANG DÙNG MÁY NÀY?</div>'
    +'<div style="font-size:12px;color:var(--tx2);margin-bottom:22px;">Mỗi máy chọn 1 lần — có thể đổi sau bằng mã PIN</div>'
    +'<button onclick="roleLoginKua()" style="display:block;width:100%;background:linear-gradient(135deg,var(--red),#a01020);border:none;border-radius:16px;color:#fff;padding:18px;cursor:pointer;margin-bottom:12px;text-align:left;">'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:19px;">🕷️ KUA — HỌC SINH</div>'
    +'<div style="font-size:12px;opacity:.85;margin-top:2px;">Học với Fury, luyện tập, nhận nhiệm vụ</div></button>'
    +'<button onclick="roleLoginParent()" style="display:block;width:100%;background:linear-gradient(135deg,var(--blue2),#0d3a6e);border:none;border-radius:16px;color:#fff;padding:18px;cursor:pointer;text-align:left;">'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:19px;">👨‍👩‍👦 BỐ MẸ — QUẢN LÝ</div>'
    +'<div style="font-size:12px;opacity:.85;margin-top:2px;">Giao bài từ xa, xem báo cáo, đánh giá tiến độ</div></button>'
    +'</div>';
}
function roleHide(){ var o=document.getElementById('roleOL'); if(o) o.style.display='none'; }

function roleLoginKua(){
  var code=localStorage.getItem('kua_code');
  if(code){
    var c=prompt('Nhập mã của Kua:');
    if(c===null) return;
    if(c.trim()!==code){ alert('❌ Mã không đúng!'); return; }
  }
  roleSet('kua'); roleHide();
}
function roleLoginParent(){
  var saved=localStorage.getItem('parent_pin');
  var pin=saved?prompt('Nhập mã PIN bố mẹ:'):null;
  if(saved && pin===null) return;
  if(!checkParentPin(pin===null?'':pin)){ alert('❌ PIN không đúng!'); return; }
  roleSet('parent'); roleHide();
  setTimeout(adminOpen, 300);
}

// ── BẢNG ĐIỀU KHIỂN BỐ MẸ ──
function adminOpen(){
  pcEl().style.display='block';
  var kuaCode=localStorage.getItem('kua_code');
  var room3=localStorage.getItem('rm3');
  function row(icon,ten,mota,fn,color){
    return '<div onclick="'+fn+'" style="'+pcCard()+'display:flex;align-items:center;gap:14px;'+(color?'border-color:'+color+';':'')+'">'
      +'<div style="font-size:28px;">'+icon+'</div><div style="flex:1;">'
      +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;color:var(--tx);">'+ten+'</div>'
      +'<div style="font-size:12px;color:var(--tx3);">'+mota+'</div></div>'
      +'<div style="color:var(--tx3);font-size:20px;">›</div></div>';
  }
  var srvReady=(typeof srvOn==='function'&&srvOn());
  pcBox().innerHTML=pcHead('👨‍👩‍👦 BẢNG ĐIỀU KHIỂN BỐ MẸ','closePractice()')
    +(srvReady
      ?'<div style="display:flex;gap:8px;margin-bottom:10px;">'
       +'<button onclick="adminCommand()" style="flex:1.4;background:var(--red);border:none;border-radius:14px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:15px;padding:14px 8px;cursor:pointer;">📡 GỌI VÀO HỌC</button>'
       +'<button onclick="adminCall()" style="flex:1;background:var(--green);border:none;border-radius:14px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:15px;padding:14px 8px;cursor:pointer;">📞 GỌI</button>'
       +'<button onclick="adminMsgKid()" style="flex:1;background:var(--blue2);border:none;border-radius:14px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:15px;padding:14px 8px;cursor:pointer;">💬 NHẮN</button></div>'
      :'')
    +row('📚','Giao bài tập từ xa','Gửi bài — máy Kua nhận thông báo ngay','closePractice();document.getElementById(\'parentOL\').style.display=\'flex\';renderHW&&renderHW();','var(--red)')
    +row('📖','Nhật ký buổi học','Khung giờ, nội dung, kết quả và nhận xét của Fury từng buổi','adJournal()','var(--gold)')
    +row('📊','Báo cáo tuần','% đúng từng môn, thời gian học, dạng cần bổ túc','adReport()','var(--green)')
    +row('🗺️','Bản đồ sức mạnh','Độ vững từng dạng bài của con','adMap()')
    +row('📈','Thống kê buổi học','Lịch sử phiên học với Fury','closePractice();showLearningStats&&showLearningStats();')
    +row('📅','Thời khóa biểu & lịch thi','Xem và chỉnh sửa','closePractice();toggleTKB&&toggleTKB();')
    +row('👤','Hồ sơ học sinh','Tên gọi, sở thích, lưu ý cho Fury','adminProfile()')
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;color:var(--tx2);letter-spacing:.08em;margin:16px 0 8px;">CÀI ĐẶT</div>'
    +row('🔑','Mã phòng đồng bộ: '+(room3||'chưa đặt'),'Đặt giống nhau trên 2 máy để đồng bộ bài tập','adminRoom()')
    +row('🧒','Mã đăng nhập của Kua: '+(kuaCode?'đã đặt':'chưa đặt'),'Mã để vào chế độ học sinh (không bắt buộc)','adminKuaCode()')
    +row('🔔','Thông báo Telegram: '+((localStorage.getItem('tg_token')&&localStorage.getItem('tg_chat'))?'ĐÃ BẬT':'chưa cài'),'Báo về điện thoại khi con mở app, học xong, tổng kết 23h — xem HUONG_DAN_THONG_BAO.md','adminNotify()')
    +row('🖥️','Server Command: '+((typeof srvOn==='function'&&srvOn())?'ĐÃ NỐI':'chưa cài'),'Triệu tập khi app tắt, gọi, xác minh học thật — xem HUONG_DAN_RAILWAY.md','adminServerSetup()')
    +row('📳','Bật nhận thông báo trên máy này','Bắt buộc trên máy Kua (và cả máy bố mẹ nếu muốn nhận tin con nhắn)','cmdSubscribe().then(function(ok){if(ok)alert(\'✅ Máy này đã nhận được lệnh triệu tập!\');}).catch(function(e){alert(\'Lỗi: \'+e.message);});')
    +row('🌞','Chế độ hè: '+((typeof summerOn==='function'&&summerOn())?'ĐANG BẬT':'ĐANG TẮT'),'70% ôn lớp 3 + 30% lớp 4 mới (Fury dạy lý thuyết trước) — tự tắt khi vào năm học','adminSummer()')
    +row('⏱️','Thời lượng buổi học: '+(localStorage.getItem('study_minutes_target')||'90')+' phút (trần)','Bắt đầu 20 phút, mỗi tuần tự tăng 5 phút tới mức trần này','adminStudyTime()')
    +row('🔐','Đổi PIN bố mẹ','PIN bảo vệ khu quản lý','adminChangePin()')
    +(roleGet()==='parent'
      ? row('🔄','Chuyển máy này thành máy KUA','Dùng khi cài cho máy của con','roleSet(\'kua\');closePractice();alert(\'✅ Máy này giờ là máy Kua. Bố mẹ vào lại: chạm 5 lần vào logo 🛡️.\');')
      : row('🔄','Chuyển máy này thành máy BỐ MẸ','Máy này đang là máy Kua — đổi hẳn sang chế độ quản lý','roleSet(\'parent\');adminOpen();'));
}

function adminProfile(){
  var p=getProfile();
  var ten=prompt('Biệt danh của con:',p.ten); if(ten===null)return;
  var truong=prompt('Trường (để trống nếu không lưu):',p.truong); if(truong===null)return;
  var soThich=prompt('Sở thích:',p.soThich); if(soThich===null)return;
  var ghiChu=prompt('Lưu ý cho Fury:',p.ghiChu); if(ghiChu===null)return;
  saveProfile({ten:ten.trim()||'Kua',lop:p.lop,truong:truong.trim(),tuoi:p.tuoi,soThich:soThich.trim(),tinhCach:p.tinhCach,ghiChu:ghiChu.trim()});
  alert('✅ Đã lưu.');
}
function adminRoom(){
  var c=prompt('Mã phòng (≥6 ký tự, đặt GIỐNG NHAU trên 2 máy):',localStorage.getItem('rm3')||'');
  if(c===null)return; c=c.trim().toUpperCase();
  if(c.length<6){alert('Cần ít nhất 6 ký tự.');return;}
  localStorage.setItem('rm3',c); adminOpen();
}
function adminKuaCode(){
  var c=prompt('Đặt mã đăng nhập cho Kua (để trống = không cần mã):',localStorage.getItem('kua_code')||'');
  if(c===null)return;
  if(c.trim()) localStorage.setItem('kua_code',c.trim()); else localStorage.removeItem('kua_code');
  adminOpen();
}
function adminNotify(){
  var t=prompt('TOKEN bot Telegram (lấy từ @BotFather — xem HUONG_DAN_THONG_BAO.md):', localStorage.getItem('tg_token')||'');
  if(t===null) return;
  var c=prompt('CHAT ID (id nhóm/chat nhận thông báo):', localStorage.getItem('tg_chat')||'');
  if(c===null) return;
  localStorage.setItem('tg_token', t.trim());
  localStorage.setItem('tg_chat', c.trim());
  if(t.trim()&&c.trim()){
    if(typeof tgPushToCloud==='function') tgPushToCloud();
    if(typeof tgNotify==='function') tgNotify('✅ Spider-Kua đã kết nối! Từ giờ mọi hoạt động học của con sẽ được báo về đây.');
    alert('Đã lưu. Kiểm tra điện thoại — nếu nhận được tin thử là thành công!\nCấu hình sẽ tự đồng bộ sang máy của con (cần chung mã phòng).');
  } else alert('Đã xóa cấu hình thông báo trên máy này.');
  adminOpen();
}
function adminSummer(){
  var cur=(typeof summerOn==='function'&&summerOn());
  localStorage.setItem('summer_mode', cur?'off':'on');
  adminOpen();
}
function adminStudyTime(){
  var c=prompt('Mức TRẦN thời lượng 1 buổi học (phút, 20-120).\nApp tự tăng dần từ 20 phút, mỗi tuần +5 phút cho đến mức này:',localStorage.getItem('study_minutes_target')||'90');
  if(c===null)return;
  var n=parseInt(c);
  if(!n||n<20||n>120){alert('Nhập số từ 20 đến 120.');return;}
  localStorage.setItem('study_minutes_target',String(n)); adminOpen();
}
function adminChangePin(){
  var old=prompt('Nhập PIN hiện tại:'); if(old===null)return;
  if((old||'').trim()!==(localStorage.getItem('parent_pin')||'')){alert('❌ PIN không đúng!');return;}
  var p1=prompt('PIN mới (4-6 số):'); if(!p1||p1.trim().length<4){alert('PIN quá ngắn.');return;}
  var p2=prompt('Nhập lại PIN mới:');
  if(p1.trim()!==(p2||'').trim()){alert('Không khớp.');return;}
  localStorage.setItem('parent_pin',p1.trim()); alert('✅ Đã đổi PIN.');
}

// ── nút nổi mở bảng điều khiển (chỉ hiện máy bố mẹ) ──
(function(){
  var b=document.createElement('button');
  b.id='adminFab'; b.textContent='👨‍👩‍👦'; b.title='Bảng điều khiển bố mẹ';
  b.onclick=adminOpen;
  document.body.appendChild(b);
})();

// ── máy Kua: chạm 5 lần vào logo 🛡️ để bố mẹ vào quản lý ──
(function(){
  var taps=0,timer=null;
  setTimeout(function(){
    var logo=document.querySelector('.hlogo'); if(!logo) return;
    logo.addEventListener('click',function(){
      taps++; clearTimeout(timer);
      timer=setTimeout(function(){taps=0;},1500);
      if(taps>=5){
        taps=0;
        if(roleGet()==='parent'){ adminOpen(); return; }
        rolePinPad('BỐ MẸ — QUẢN LÝ','Nhập mã PIN quản trị','var(--blue2)',
          function(v){ return v===(localStorage.getItem('parent_pin')||''); },
          function(){ adminOpen(); });
      }
    });
  },600);
})();

// ── máy bố mẹ: mở khu giao bài không cần nhập PIN lại ──
var _showParent_core = typeof showParent==='function' ? showParent : null;
showParent = function(){
  if(roleGet()==='parent'){
    document.getElementById('parentOL').style.display='flex';
    if(typeof renderHW==='function') renderHW();
    return;
  }
  if(_showParent_core) _showParent_core();
};

// ── khởi động: chỉ hiện chọn vai khi đã có API key (đã qua màn kích hoạt) ──
roleApply();
(function(){
  var iv=setInterval(function(){
    var hasKey = localStorage.getItem('gem3')||localStorage.getItem('sk3');
    if(!hasKey) return;            // chưa kích hoạt — chờ
    if(roleGet()){ clearInterval(iv); return; }
    var setup=document.getElementById('setup');
    if(setup && getComputedStyle(setup).display!=='none') return; // đang ở màn nhập key
    clearInterval(iv);
    roleChooser(false);
  }, 700);
})();

// ── MÁY KUA: banner nhiệm vụ hôm nay ngay trên màn hình chat ──
// Con mở app là thấy việc cần làm — không phải tự đi tìm
(function(){
  function showNudge(){
    if(roleGet()!=='kua') return;
    if(document.getElementById('dailyNudge')) return;
    var ms=(typeof adGetMission==='function')?adGetMission():null;
    if(ms&&ms.done) return;
    var msgs=document.getElementById('msgs'); if(!msgs) return;
    var target=(typeof adTargetMin==='function')?adTargetMin():20;
    var st=(typeof adStreak==='function')?adStreak():{n:0};
    var b=document.createElement('div');
    b.id='dailyNudge';
    b.style.cssText='margin:6px 10px;padding:12px 14px;background:linear-gradient(135deg,rgba(232,25,44,.2),rgba(15,76,143,.25));border:2px solid var(--red);border-radius:14px;cursor:pointer;display:flex;align-items:center;gap:12px;flex-shrink:0;animation:pulse 2s infinite;';
    b.innerHTML='<div style="font-size:28px;">⚡</div><div style="flex:1;">'
      +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:15px;color:#fff;">NHIỆM VỤ HÔM NAY — '+target+' PHÚT</div>'
      +'<div style="font-size:11.5px;color:var(--tx2);">Fury đã soạn sẵn bài cho em · xong +15 xu · chuỗi '+st.n+' ngày 🔥</div></div>'
      +'<div style="background:var(--red);border-radius:10px;padding:8px 14px;font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;color:#fff;">BẮT ĐẦU</div>';
    b.onclick=function(){ openPractice(); setTimeout(function(){ if(typeof adStartDaily==='function') adStartDaily(); },400); };
    msgs.parentNode.insertBefore(b, msgs);
  }
  // kiểm tra định kỳ: hiện khi vào app, tự ẩn khi đã hoàn thành
  setInterval(function(){
    var ms=(typeof adGetMission==='function')?adGetMission():null;
    var el=document.getElementById('dailyNudge');
    if(ms&&ms.done&&el){ el.remove(); return; }
    showNudge();
  }, 3000);
})();

// ═══════════════════════════════════════════════
// MÁY BỐ MẸ = DASHBOARD THUẦN TÚY
// Vào app là thấy bảng điều khiển, không thấy giao diện của con
// ═══════════════════════════════════════════════
window._peekKid=false;

// thẻ số liệu nhanh trên đầu dashboard
function adminStats(){
  try{
    var log=pcLS('luyen_log','[]');
    var t0=new Date(); t0.setHours(0,0,0,0);
    var today=log.filter(function(e){return e.d>=t0.getTime();});
    var mins=Math.round(today.reduce(function(s,e){return s+e.t;},0)/60);
    var okPct=today.length?Math.round(today.filter(function(e){return e.ok;}).length/today.length*100):0;
    var st=(typeof adStreak==='function')?adStreak():{n:0};
    var xu=(typeof getXu==='function')?getXu().toLocaleString('vi-VN'):'0';
    var cell=function(icon,val,lbl){
      return '<div style="flex:1;background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:12px 6px;text-align:center;">'
        +'<div style="font-size:18px;">'+icon+'</div>'
        +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:19px;color:var(--tx);margin:2px 0;">'+val+'</div>'
        +'<div style="font-size:10.5px;color:var(--tx3);">'+lbl+'</div></div>';
    };
    return '<div style="display:flex;gap:8px;margin-bottom:14px;">'
      +cell('⏱',mins+"'",'phút hôm nay')+cell('✏️',today.length,'câu hôm nay')
      +cell('✅',okPct+'%','đúng hôm nay')+cell('🔥',st.n,'chuỗi ngày')+'</div>';
  }catch(e){ return ''; }
}

// vẽ lại dashboard với thẻ số liệu (bọc adminOpen gốc)
var _adminOpen_core=adminOpen;
adminOpen=function(){
  window._peekKid=false;
  _adminOpen_core();
  var head=pcBox().children[0];
  if(head) head.insertAdjacentHTML('afterend', adminStats()
    +'<div onclick="adminPeek()" style="'+pcCard()+'display:flex;align-items:center;gap:14px;border-style:dashed;">'
    +'<div style="font-size:24px;">🧪</div><div style="flex:1;">'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;color:var(--tx2);">Xem giao diện của con</div>'
    +'<div style="font-size:11.5px;color:var(--tx3);">Chạm 5 lần vào logo 🛡️ để quay lại bảng điều khiển</div></div></div>');
};
function adminPeek(){ window._peekKid=true; closePractice(); }

// máy bố mẹ: nếu không có overlay nào đang mở → luôn quay về dashboard
setInterval(function(){
  try{
    if(roleGet()!=='parent'||window._peekKid) return;
    if(!localStorage.getItem('gem3')&&!localStorage.getItem('sk3')) return;
    var app=document.getElementById('app');
    if(!app||getComputedStyle(app).display==='none') return; // chưa qua splash/setup
    var ov=document.getElementById('roleOL');
    if(ov&&getComputedStyle(ov).display!=='none') return;
    if(pcEl().style.display==='block') return;
    var pol=document.getElementById('parentOL'), tkb=document.getElementById('tkbPopup'), shop=document.getElementById('shopOL');
    if(pol&&getComputedStyle(pol).display!=='none') return;
    if(tkb&&getComputedStyle(tkb).display!=='none') return;
    if(shop&&getComputedStyle(shop).display!=='none') return;
    adminOpen();
  }catch(e){}
}, 1200);

// ═══════════════════════════════════════════════
// BÀN PHÍM PIN S.H.I.E.L.D. — thay hộp prompt() xấu xí của trình duyệt
// ═══════════════════════════════════════════════
(function(){
  var st=document.createElement('style');
  st.textContent='@keyframes pinShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-9px)}40%,80%{transform:translateX(9px)}}'
    +'@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(232,25,44,.35)}50%{box-shadow:0 0 0 10px rgba(232,25,44,0)}}'
    +'.pinkey{width:72px;height:60px;border-radius:14px;background:var(--s2);border:1px solid var(--bd2);color:var(--tx);font-family:Rajdhani,sans-serif;font-weight:700;font-size:24px;cursor:pointer;transition:all .1s;}'
    +'.pinkey:active{background:var(--s3);transform:scale(.94);}';
  document.head.appendChild(st);
})();

var _pinState={val:'',verify:null,ok:null};
function rolePinPad(title, sub, accent, verify, onOk){
  _pinState={val:'',verify:verify,ok:onOk,accent:accent};
  var ov=document.getElementById('pinPad');
  if(!ov){
    ov=document.createElement('div');
    ov.id='pinPad';
    ov.style.cssText='position:fixed;inset:0;background:rgba(4,5,10,.94);z-index:950;display:flex;align-items:center;justify-content:center;padding:20px;';
    document.body.appendChild(ov);
  }
  ov.style.display='flex';
  var keys=[1,2,3,4,5,6,7,8,9,'C',0,'⌫'];
  ov.innerHTML='<div id="pinBox" style="text-align:center;max-width:300px;width:100%;">'
    +'<div style="font-size:38px;margin-bottom:6px;">🛡️</div>'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;color:var(--tx3);letter-spacing:.35em;margin-bottom:2px;">S.H.I.E.L.D. ACCESS</div>'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:20px;color:'+accent+';letter-spacing:.05em;">'+title+'</div>'
    +'<div style="font-size:11.5px;color:var(--tx3);margin:4px 0 18px;">'+sub+'</div>'
    +'<div id="pinDots" style="display:flex;justify-content:center;gap:14px;margin-bottom:22px;"></div>'
    +'<div style="display:grid;grid-template-columns:repeat(3,72px);gap:12px;justify-content:center;">'
    +keys.map(function(k){return '<button class="pinkey" onclick="pinKey(\''+k+'\')">'+k+'</button>';}).join('')
    +'</div>'
    +'<button onclick="pinClose()" style="margin-top:18px;background:transparent;border:1px solid var(--bd);border-radius:10px;color:var(--tx3);font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;padding:8px 22px;cursor:pointer;">HỦY</button>'
    +'</div>';
  pinDraw();
}
function pinDraw(){
  var d=document.getElementById('pinDots'); if(!d) return;
  var n=_pinState.val.length, h='';
  for(var i=0;i<6;i++){
    h+='<div style="width:16px;height:16px;border-radius:50%;border:2px solid '+(i<n?_pinState.accent:'var(--bd2)')+';background:'+(i<n?_pinState.accent:'transparent')+';transition:all .15s;"></div>';
  }
  d.innerHTML=h;
}
function pinKey(k){
  if(k==='C'){ _pinState.val=''; pinDraw(); return; }
  if(k==='⌫'){ _pinState.val=_pinState.val.slice(0,-1); pinDraw(); return; }
  if(_pinState.val.length>=6) return;
  _pinState.val+=k; pinDraw();
  if(_pinState.val.length===6){
    setTimeout(function(){
      if(_pinState.verify(_pinState.val)){
        document.getElementById('pinPad').style.display='none';
        _pinState.ok();
      } else {
        var box=document.getElementById('pinBox');
        box.style.animation='pinShake .4s';
        setTimeout(function(){box.style.animation='';},450);
        _pinState.val=''; pinDraw();
      }
    },150);
  }
}
function pinClose(){ var p=document.getElementById('pinPad'); if(p) p.style.display='none'; }

// ── thay 3 chỗ nhập mã cũ bằng bàn phím mới ──
roleLoginKua=function(){
  var code=localStorage.getItem('kua_code');
  if(!code){ roleSet('kua'); roleHide(); return; }
  rolePinPad('AGENT KUA','Nhập mã truy cập của em','var(--red2)',
    function(v){ return v===code; },
    function(){ roleSet('kua'); roleHide();
      if(typeof speak==='function') setTimeout(function(){speak('Chào mừng trở lại, Peter!');},600);
    });
};
roleLoginParent=function(){
  rolePinPad('BỐ MẸ — QUẢN LÝ','Nhập mã PIN quản trị','var(--blue2)',
    function(v){ return v===(localStorage.getItem('parent_pin')||''); },
    function(){ roleSet('parent'); roleHide(); setTimeout(adminOpen,300); });
};
