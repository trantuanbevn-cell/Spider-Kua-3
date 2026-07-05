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
    'body.role-kua .hbtn{display:none!important;}' /* nút 👩 và KEY */
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
  pcBox().innerHTML=pcHead('👨‍👩‍👦 BẢNG ĐIỀU KHIỂN BỐ MẸ','closePractice()')
    +row('📚','Giao bài tập từ xa','Gửi bài — máy Kua nhận thông báo ngay','closePractice();document.getElementById(\'parentOL\').style.display=\'flex\';renderHW&&renderHW();','var(--red)')
    +row('📊','Báo cáo tuần','% đúng từng môn, thời gian học, dạng cần bổ túc','adReport()','var(--green)')
    +row('🗺️','Bản đồ sức mạnh','Độ vững từng dạng bài của con','adMap()')
    +row('📈','Thống kê buổi học','Lịch sử phiên học với Fury','closePractice();showLearningStats&&showLearningStats();')
    +row('📅','Thời khóa biểu & lịch thi','Xem và chỉnh sửa','closePractice();toggleTKB&&toggleTKB();')
    +row('👤','Hồ sơ học sinh','Tên gọi, sở thích, lưu ý cho Fury','adminProfile()')
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;color:var(--tx2);letter-spacing:.08em;margin:16px 0 8px;">CÀI ĐẶT</div>'
    +row('🔑','Mã phòng đồng bộ: '+(room3||'chưa đặt'),'Đặt giống nhau trên 2 máy để đồng bộ bài tập','adminRoom()')
    +row('🧒','Mã đăng nhập của Kua: '+(kuaCode?'đã đặt':'chưa đặt'),'Mã để vào chế độ học sinh (không bắt buộc)','adminKuaCode()')
    +row('⏱️','Thời lượng buổi học: '+(localStorage.getItem('study_minutes_target')||'90')+' phút (trần)','Bắt đầu 20 phút, mỗi tuần tự tăng 5 phút tới mức trần này','adminStudyTime()')
    +row('🔐','Đổi PIN bố mẹ','PIN bảo vệ khu quản lý','adminChangePin()')
    +row('🔄','Chuyển máy này thành máy Kua','Dùng khi cài cho máy của con','roleSet(\'kua\');closePractice();alert(\'✅ Máy này giờ là máy Kua. Bố mẹ vào lại bằng cách chạm 5 lần vào logo 🛡️ trên đầu màn hình.\');');
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
        var pin=prompt('Bố mẹ nhập PIN để vào quản lý:');
        if(pin===null)return;
        if(!checkParentPin(pin)){alert('❌ PIN không đúng!');return;}
        adminOpen();
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
