// ═══════════════════════════════════════════════
// 🤖 CHẾ ĐỘ ROBOT — biến tablet thành robot Fury để bàn
// Mặt Fury sống động, chạm để nói chuyện, tự chào & nhắc nhiệm vụ
// Đặt tablet lên giá đỡ + cắm sạc = robot bàn học của Kua
// ═══════════════════════════════════════════════

var _rb={on:false, busy:false, wake:null, timer:null, blinkT:null};

function robotOpen(){
  var ov=document.getElementById('rbOL');
  if(!ov){
    ov=document.createElement('div');
    ov.id='rbOL';
    ov.style.cssText='position:fixed;inset:0;background:radial-gradient(ellipse at 50% 30%,#0d1830 0%,#05070d 70%);z-index:945;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;';
    ov.innerHTML=
      '<style>@keyframes rbBlink{0%,92%,100%{transform:scaleY(1);}95%{transform:scaleY(.06);}}'
      +'@keyframes rbFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}'
      +'@keyframes rbPulse{0%,100%{opacity:.35;transform:scale(1);}50%{opacity:.9;transform:scale(1.12);}}'
      +'@keyframes rbTalk{0%,100%{height:8px;}25%{height:26px;}50%{height:14px;}75%{height:30px;}}</style>'
      +'<button onclick="robotClose()" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#677190;padding:8px 14px;cursor:pointer;font-size:13px;z-index:2;">✕</button>'
      +'<div id="rbClock" style="position:absolute;top:18px;left:20px;font-family:Rajdhani,sans-serif;font-weight:700;font-size:22px;color:#3a4a6e;letter-spacing:.1em;"></div>'
      +'<div id="rbXu" style="position:absolute;top:46px;left:20px;font-size:13px;color:#67719a;"></div>'
      +'<div id="rbFace" onclick="robotTap()" style="cursor:pointer;text-align:center;animation:rbFloat 4.5s ease-in-out infinite;user-select:none;-webkit-user-select:none;">'
      +'<div id="rbRing" style="width:230px;height:230px;border-radius:50%;border:3px solid rgba(26,106,191,.4);display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 0 60px rgba(26,106,191,.25) inset,0 0 80px rgba(26,106,191,.15);">'
      +'<div style="text-align:center;">'
      +'<div style="display:flex;gap:34px;justify-content:center;margin-bottom:22px;">'
      +'<div class="rbEye" style="width:44px;height:58px;background:linear-gradient(180deg,#9fd8ff,#1a6abf);border-radius:50% 50% 46% 46%;animation:rbBlink 4.2s infinite;box-shadow:0 0 22px rgba(120,200,255,.7);"></div>'
      +'<div class="rbEye" style="width:44px;height:58px;background:linear-gradient(180deg,#9fd8ff,#1a6abf);border-radius:50% 50% 46% 46%;animation:rbBlink 4.2s infinite .12s;box-shadow:0 0 22px rgba(120,200,255,.7);"></div></div>'
      +'<div id="rbMouth" style="width:56px;height:8px;background:#1a6abf;border-radius:6px;margin:0 auto;box-shadow:0 0 14px rgba(26,106,191,.8);transition:all .2s;"></div>'
      +'</div></div></div>'
      +'<div id="rbStatus" style="margin-top:26px;font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;color:#f5c842;letter-spacing:.06em;text-align:center;min-height:24px;">CHẠM VÀO MẶT ANH ĐỂ NÓI CHUYỆN</div>'
      +'<div id="rbText" style="margin-top:10px;max-width:520px;padding:0 26px;font-size:14.5px;line-height:1.75;color:#c9d2e8;text-align:center;max-height:30vh;overflow-y:auto;"></div>'
      +'<div id="rbMission" style="position:absolute;bottom:20px;left:0;right:0;text-align:center;font-size:12.5px;color:#67719a;"></div>';
    document.body.appendChild(ov);
  }
  ov.style.display='flex';
  _rb.on=true;
  robotClock();
  _rb.timer=setInterval(robotClock, 20000);
  _rb.blinkT=setInterval(robotIdleNudge, 25*60000); // nhắc nhẹ mỗi 25'
  try{ if('wakeLock' in navigator) navigator.wakeLock.request('screen').then(function(w){_rb.wake=w;}).catch(function(){}); }catch(e){}
  // chào theo giờ + tình hình nhiệm vụ
  setTimeout(function(){
    var ten=(typeof getProfile==='function')?getProfile().ten:'Kua';
    var h=new Date().getHours();
    var chao=h<11?'Chào buổi sáng':(h<14?'Chào buổi trưa':(h<18?'Chào buổi chiều':'Chào buổi tối'));
    var pend=robotPending();
    var msg=chao+' '+ten+'! '+(pend.length?('Hôm nay còn ca '+pend.join(', ')+' đang chờ em đấy. Chạm vào mặt anh khi sẵn sàng nhé!'):'Em đã xong hết nhiệm vụ hôm nay, tuyệt vời! Muốn nói chuyện thì chạm vào mặt anh nhé.');
    robotSay(msg);
  }, 900);
}
function robotClose(){
  _rb.on=false;
  clearInterval(_rb.timer); clearInterval(_rb.blinkT);
  try{ _rb.wake&&_rb.wake.release(); }catch(e){}
  var o=document.getElementById('rbOL'); if(o) o.style.display='none';
  try{ window.speechSynthesis&&speechSynthesis.cancel(); }catch(e){}
}
function robotClock(){
  var el=document.getElementById('rbClock'); if(!el) return;
  var d=new Date();
  el.textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  var xu=document.getElementById('rbXu');
  if(xu&&typeof getXu==='function') xu.textContent='🪙 '+getXu()+' xu';
  var mi=document.getElementById('rbMission');
  if(mi){
    var pend=robotPending();
    mi.textContent=pend.length?('⚡ Ca đang chờ: '+pend.join(' · ')):'🏆 Đã xong nhiệm vụ hôm nay!';
  }
}
function robotPending(){
  try{
    var s=dhState();
    return ['toan','tv','ta'].filter(function(m){return !s[m].complete;}).map(function(m){return DH_MON[m].ten;});
  }catch(e){ return []; }
}
function robotIdleNudge(){
  if(!_rb.on||_rb.busy) return;
  var h=new Date().getHours();
  if(h<8||h>=21) return;
  var pend=robotPending();
  if(!pend.length) return;
  var ten=(typeof getProfile==='function')?getProfile().ten:'Kua';
  robotSay(ten+' ơi, ca '+pend[0]+' vẫn đang chờ em đấy. Làm xong sớm là tối nay thảnh thơi luôn!');
}

// nói + hoạt hình miệng
function robotSay(text){
  var t=document.getElementById('rbText'); if(t) t.textContent=text;
  var m=document.getElementById('rbMouth');
  if(m) m.style.animation='rbTalk .5s ease-in-out infinite';
  var done=function(){ if(m){ m.style.animation=''; m.style.height='8px'; } };
  try{
    if(typeof speak==='function'){ speak(text); setTimeout(done, Math.min(20000, 320*text.split(/\s+/).length)); }
    else done();
  }catch(e){ done(); }
}

// chạm mặt → nghe → hỏi Fury (kèm hồ sơ & luật an toàn như chat thường)
function robotTap(){
  if(_rb.busy) return;
  var S=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!S){ robotSay('Máy này không có mic cho anh rồi. Em dùng Chrome nhé!'); return; }
  try{ if(typeof stopSpeakAll==='function') stopSpeakAll(); else if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
  try{ if(typeof ttsUnlock==='function') ttsUnlock(); }catch(e){}
  var st=document.getElementById('rbStatus'), ring=document.getElementById('rbRing');
  var eyes=document.querySelectorAll('.rbEye');
  st.textContent='🎙️ ANH ĐANG NGHE...';
  if(ring){ ring.style.borderColor='rgba(48,209,88,.8)'; ring.style.animation='rbPulse 1.1s infinite'; }
  eyes.forEach(function(e){ e.style.background='linear-gradient(180deg,#b8ffcf,#30d158)'; });
  var reset=function(){
    st.textContent='CHẠM VÀO MẶT ANH ĐỂ NÓI CHUYỆN';
    if(ring){ ring.style.borderColor='rgba(26,106,191,.4)'; ring.style.animation=''; }
    eyes.forEach(function(e){ e.style.background='linear-gradient(180deg,#9fd8ff,#1a6abf)'; });
  };
  var sr=new S(); sr.lang='vi-VN'; sr.continuous=false; sr.interimResults=false;
  sr.onresult=async function(e){
    var txt=(e.results[0][0].transcript||'').trim();
    reset();
    if(!txt) return;
    _rb.busy=true;
    st.textContent='🕸️ FURY ĐANG NGHĨ...';
    var t=document.getElementById('rbText'); if(t) t.textContent='🕷️ "'+txt+'"';
    try{
      var r=await callAI(txt);
      st.textContent='CHẠM VÀO MẶT ANH ĐỂ NÓI CHUYỆN';
      robotSay(r);
      if(typeof logFuryChat==='function') logFuryChat('[Robot] '+txt, r);
    }catch(err){
      st.textContent='CHẠM VÀO MẶT ANH ĐỂ NÓI CHUYỆN';
      robotSay('Ối, anh gặp trục trặc: '+(err&&err.message?err.message:'mạng chập chờn')+'. Em thử lại nhé!');
    }
    _rb.busy=false;
  };
  sr.onerror=function(e){
    reset();
    var err=(e&&e.error)||'';
    if(err==='not-allowed'||err==='service-not-allowed'){
      st.textContent='⚠️ CHƯA CHO PHÉP MIC';
      var t=document.getElementById('rbText');
      if(t) t.textContent='Bố mẹ vào Chrome → biểu tượng 🔒 cạnh địa chỉ → Quyền → bật Micro cho trang này nhé.';
    } else if(err==='no-speech'){
      st.textContent='ANH CHƯA NGHE THẤY GÌ — CHẠM RỒI NÓI TO NHÉ!';
    } else if(err&&err!=='aborted'){
      st.textContent='LỖI MIC ('+err+') — EM THỬ LẠI NHÉ';
    }
  };
  sr.onend=function(){ if(!_rb.busy&&st.textContent.indexOf('NGHE...')>-1) reset(); };
  try{ sr.start(); }catch(e){ reset(); st.textContent='MIC ĐANG BẬN — EM THỬ LẠI NHÉ'; }
  // chống kẹt: nếu 40 giây không xong thì tự mở khoá
  setTimeout(function(){ if(_rb.busy){ _rb.busy=false; } }, 40000);
}

// nút bật trong hàng công cụ (chỉ máy Kua thấy cần thiết, bố mẹ cũng bật được)
document.addEventListener('DOMContentLoaded', function(){
  try{
    var mic=document.getElementById('micBtn');
    if(!mic||document.getElementById('rbBtn')) return;
    var b=document.createElement('button');
    b.id='rbBtn'; b.className='abtn'; b.title='Chế độ Robot để bàn';
    b.textContent='🤖';
    b.style.cssText='flex:1;height:58px;font-size:24px;border-radius:14px;background:var(--s2);border:1px solid var(--bd2);cursor:pointer;';
    b.onclick=robotOpen;
    mic.parentNode.appendChild(b);
  }catch(e){}
});
