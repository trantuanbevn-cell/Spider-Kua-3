// ═══════════════════════════════════════════════
// GỌI THOẠI & CHAT TRONG APP — bố mẹ ↔ con, không cần Zalo
// - Chat: bảng nổi nền mờ, hiện ngay khi con đang dùng app
// - Gọi: WebRTC thoại thật, chuông to lặp đến khi nghe máy
// ═══════════════════════════════════════════════

function ccRole(){ return (typeof roleGet==='function')?roleGet():(localStorage.getItem('device_role')||''); }
function ccMy(){ return ccRole()==='parent'?'parent':'kua'; }

// ── CHUÔNG TO LẶP (đến khi trả lời, tối đa 60 giây) ──
var _ringTimer=null;
function ringLoop(){
  ringStop();
  var n=0;
  var fire=function(){ try{ sirenStart(2); if(navigator.vibrate) navigator.vibrate([500,150,500,150,500]); }catch(e){} };
  fire();
  _ringTimer=setInterval(function(){ n++; if(n>40){ ringStop(); return; } fire(); }, 2300);
}
function ringStop(){ if(_ringTimer){ clearInterval(_ringTimer); _ringTimer=null; } try{ sirenStop(); }catch(e){} }

// ═══════════ BẢNG CHAT NỔI (nền mờ phía sau) ═══════════
var _ccLastId=parseInt(localStorage.getItem('fam_last_id')||'0');
var _ccMsgs=[];

function ccOpenChat(urgent){
  var ov=document.getElementById('ccChatOL');
  if(!ov){
    ov=document.createElement('div');
    ov.id='ccChatOL';
    ov.style.cssText='position:fixed;inset:0;z-index:975;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,8,16,.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);';
    ov.innerHTML='<div style="width:100%;max-width:440px;max-height:86vh;background:var(--s1,#0d1117);border:2px solid '+(ccMy()==='kua'?'var(--blue2,#1a6abf)':'var(--red,#e8192c)')+';border-radius:20px;display:flex;flex-direction:column;overflow:hidden;">'
      +'<div style="display:flex;align-items:center;gap:10px;padding:14px 16px;background:rgba(15,76,143,.25);">'
      +'<div style="font-size:26px;">📡</div><div style="flex:1;">'
      +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;color:var(--gold,#f5c842);">LIÊN LẠC GIA ĐÌNH</div>'
      +'<div style="font-size:11px;color:var(--tx3,#4a5570);">Kênh bảo mật S.H.I.E.L.D.</div></div>'
      +'<button onclick="ccCloseChat()" style="background:transparent;border:1px solid var(--bd2,#3a4560);border-radius:8px;color:var(--tx2,#8a94b0);padding:6px 12px;cursor:pointer;font-size:14px;">✕</button></div>'
      +'<div id="ccMsgList" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;min-height:180px;"></div>'
      +'<div id="ccQuick" style="display:flex;gap:8px;padding:0 14px 10px;"></div>'
      +'<div style="display:flex;gap:8px;padding:0 14px 14px;">'
      +'<input id="ccInput" type="text" placeholder="Nhắn tin..." style="flex:1;background:var(--s2,#161b27);border:1px solid var(--bd2,#3a4560);border-radius:12px;color:var(--tx,#e8eaf0);font-size:14px;padding:11px 13px;outline:none;font-family:Nunito,sans-serif;" onkeydown="if(event.key===\'Enter\')ccSend()">'
      +'<button onclick="ccMic()" id="ccMicBtn" style="background:var(--s2,#161b27);border:1px solid var(--blue2,#1a6abf);border-radius:12px;color:var(--blue2,#1a6abf);font-size:16px;padding:0 14px;cursor:pointer;">🎤</button>'
      +'<button onclick="ccSend()" style="background:var(--red,#e8192c);border:none;border-radius:12px;color:#fff;font-size:16px;padding:0 16px;cursor:pointer;">➤</button></div>'
      +'</div>';
    document.body.appendChild(ov);
  }
  ov.style.display='flex';
  // nút phản hồi nhanh cho con
  var q=document.getElementById('ccQuick');
  if(ccMy()==='kua'){
    q.innerHTML='<button onclick="ccQuickSend(\'📚 Con đang học rồi ạ\')" style="flex:1;background:rgba(48,209,88,.12);border:1px solid var(--green,#30d158);border-radius:10px;color:var(--green,#30d158);font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;padding:9px 6px;cursor:pointer;">📚 CON ĐANG HỌC RỒI</button>'
      +'<button onclick="ccQuickSend(\'✅ Con vào học ngay đây ạ\');cmdGoStudy&&cmdGoStudy();" style="flex:1;background:rgba(232,25,44,.12);border:1px solid var(--red,#e8192c);border-radius:10px;color:var(--red2,#ff3347);font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;padding:9px 6px;cursor:pointer;">✅ VÀO HỌC NGAY</button>';
  } else {
    q.innerHTML='<button onclick="adminCommand()" style="flex:1;background:rgba(232,25,44,.12);border:1px solid var(--red,#e8192c);border-radius:10px;color:var(--red2,#ff3347);font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;padding:9px 6px;cursor:pointer;">📡 GỌI VÀO HỌC</button>'
      +'<button onclick="adminCall()" style="flex:1;background:rgba(48,209,88,.12);border:1px solid var(--green,#30d158);border-radius:10px;color:var(--green,#30d158);font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;padding:9px 6px;cursor:pointer;">📞 GỌI THOẠI</button>';
  }
  ccRefresh(true);
  if(urgent){ ringLoop(); setTimeout(ringStop, 7000); }
}
function ccCloseChat(){ var o=document.getElementById('ccChatOL'); if(o) o.style.display='none'; ringStop(); }

function ccRender(){
  var el=document.getElementById('ccMsgList'); if(!el) return;
  var my=ccMy();
  el.innerHTML=_ccMsgs.map(function(m){
    var mine=(m.sender===my);
    var who=m.sender==='parent'?'👨‍👩‍👦 Bố mẹ':'🕷️ '+(typeof getProfile==='function'?getProfile().ten:'Kua');
    var t=new Date(m.ts);
    var hhmm=String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0');
    return '<div style="align-self:'+(mine?'flex-end':'flex-start')+';max-width:82%;">'
      +'<div style="font-size:10px;color:var(--tx3,#4a5570);margin:0 6px 2px;'+(mine?'text-align:right;':'')+'">'+who+' · '+hhmm+'</div>'
      +'<div style="background:'+(mine?'var(--blue,#0f4c8f)':'var(--s2,#161b27)')+';border-radius:'+(mine?'14px 14px 4px 14px':'14px 14px 14px 4px')+';padding:10px 13px;font-size:14px;line-height:1.6;color:#fff;white-space:pre-wrap;">'
      +String(m.text||'').replace(/</g,'&lt;')+'</div></div>';
  }).join('');
  el.scrollTop=el.scrollHeight;
}
async function ccRefresh(scroll){
  try{
    var rows=await (await fetch(srvUrl()+'/msgs')).json();
    _ccMsgs=(rows||[]).slice().reverse();
    var maxId=_ccMsgs.reduce(function(m,x){return Math.max(m,x.id||0);},0);
    if(maxId>_ccLastId){ _ccLastId=maxId; localStorage.setItem('fam_last_id',String(_ccLastId)); }
    ccRender();
  }catch(e){}
}
async function ccSend(){
  var inp=document.getElementById('ccInput');
  var text=(inp.value||'').trim(); if(!text) return;
  inp.value='';
  var my=ccMy();
  _ccMsgs.push({sender:my,text:text,ts:Date.now()}); ccRender();
  try{
    var body={from:my,text:text};
    if(my==='parent') body.key=srvKey();
    await srvPost('/msg',body);
    ccRefresh();
  }catch(e){}
}
function ccQuickSend(t){
  var inp=document.getElementById('ccInput'); if(inp) inp.value=t;
  ccSend(); ringStop();
}
function ccMic(){
  var S=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!S) return;
  var btn=document.getElementById('ccMicBtn');
  btn.textContent='🔴';
  var sr=new S(); sr.lang='vi-VN';
  sr.onresult=function(e){
    btn.textContent='🎤';
    var said=(e.results[0][0].transcript||'').trim();
    if(said){ document.getElementById('ccInput').value=said; ccSend(); }
  };
  sr.onerror=sr.onend=function(){ btn.textContent='🎤'; };
  sr.start();
}

// ── VÒNG KIỂM TRA: tin mới + cuộc gọi đến (khi app đang mở) ──
setInterval(async function(){
  try{
    if(document.visibilityState!=='visible'||!ccRole()) return;
    // 1) tin nhắn mới từ phía bên kia → bật bảng chat nền mờ
    var rows=await (await fetch(srvUrl()+'/msgs')).json();
    var news=(rows||[]).filter(function(m){ return (m.id||0)>_ccLastId && m.sender!==ccMy(); });
    if(news.length){
      _ccMsgs=(rows||[]).slice().reverse();
      _ccLastId=Math.max.apply(null,rows.map(function(x){return x.id||0;}));
      localStorage.setItem('fam_last_id',String(_ccLastId));
      ccOpenChat(true);
      if(typeof speak==='function' && ccMy()==='kua') speak('Peter! Bố mẹ nhắn: '+news[0].text);
    }
    // 2) cuộc gọi đến (phía con)
    if(ccMy()==='kua' && !window._ccInCall){
      var st=await (await fetch(srvUrl()+'/rtc/state?role=k')).json();
      if(st.status==='ringing' && !document.getElementById('ccCallOL')) kuaIncomingCall();
    }
  }catch(e){}
}, 8000);

// ═══════════ GỌI THOẠI WEBRTC ═══════════
var _pc=null,_ccCands={cp:0,ck:0},_callPoll=null,_localStream=null;
window._ccInCall=false;

function ccCallUI(title,sub,showAnswer){
  var ov=document.getElementById('ccCallOL');
  if(!ov){
    ov=document.createElement('div');
    ov.id='ccCallOL';
    ov.style.cssText='position:fixed;inset:0;z-index:985;display:flex;align-items:center;justify-content:center;background:rgba(8,12,24,.96);backdrop-filter:blur(6px);';
    document.body.appendChild(ov);
  }
  ov.style.display='flex';
  ov.innerHTML='<div style="text-align:center;max-width:340px;width:100%;padding:20px;">'
    +'<div style="font-size:64px;animation:pulse 1.2s infinite;border-radius:50%;width:110px;height:110px;line-height:110px;margin:0 auto 14px;background:rgba(48,209,88,.15);">📞</div>'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:24px;color:#fff;">'+title+'</div>'
    +'<div id="ccCallSub" style="font-size:13px;color:var(--tx2,#8a94b0);margin:6px 0 24px;">'+sub+'</div>'
    +(showAnswer
      ?'<button onclick="kuaAnswerCall()" style="display:block;width:100%;background:#30d158;border:none;border-radius:16px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:20px;padding:18px;cursor:pointer;margin-bottom:12px;">📞 NGHE MÁY</button>'
      :'')
    +'<button onclick="ccEndCall()" style="display:block;width:100%;background:var(--red,#e8192c);border:none;border-radius:16px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;padding:14px;cursor:pointer;">✕ '+(showAnswer?'TỪ CHỐI':'KẾT THÚC')+'</button>'
    +'<audio id="ccAudio" autoplay playsinline></audio></div>';
}
function ccCallSub(t){ var e=document.getElementById('ccCallSub'); if(e) e.textContent=t; }

async function ccMakePC(iAmParent){
  _pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]});
  _localStream=await navigator.mediaDevices.getUserMedia({audio:true});
  _localStream.getTracks().forEach(function(t){ _pc.addTrack(t,_localStream); });
  _pc.ontrack=function(e){ var a=document.getElementById('ccAudio'); if(a){ a.srcObject=e.streams[0]; a.play().catch(function(){}); } };
  _pc.onicecandidate=function(e){
    if(e.candidate) srvPost('/rtc/cand',{from:iAmParent?'p':'k',cand:e.candidate}).catch(function(){});
  };
  _pc.onconnectionstatechange=function(){
    if(_pc && _pc.connectionState==='connected'){ ccCallSub('Đã kết nối — nói chuyện thoải mái!'); ringStop(); }
    if(_pc && (_pc.connectionState==='failed'||_pc.connectionState==='disconnected')) ccCallSub('Mất kết nối...');
  };
}
function ccPollState(iAmParent){
  clearInterval(_callPoll);
  _callPoll=setInterval(async function(){
    try{
      var st=await (await fetch(srvUrl()+'/rtc/state?role='+(iAmParent?'p':'k')+'&cp='+_ccCands.cp+'&ck='+_ccCands.ck)).json();
      if(st.status==='ended'||st.status==='idle'){ ccEndCall(true); return; }
      if(iAmParent && st.answer && _pc && !_pc.currentRemoteDescription){
        await _pc.setRemoteDescription(st.answer); ccCallSub('Con đã nghe máy!'); ringStop();
      }
      (st.cands||[]).forEach(function(c){ if(c&&_pc) _pc.addIceCandidate(c).catch(function(){}); });
      if(iAmParent) _ccCands.ck=st.ck||_ccCands.ck; else _ccCands.cp=st.cp||_ccCands.cp;
    }catch(e){}
  }, 1500);
}

// BỐ MẸ bấm GỌI
async function adminCall(){
  try{
    window._ccInCall=true; _ccCands={cp:0,ck:0};
    ccCallUI('ĐANG GỌI KUA...','Tablet của con đang reo — kể cả khi app tắt',false);
    await ccMakePC(true);
    var offer=await _pc.createOffer();
    await _pc.setLocalDescription(offer);
    await srvPost('/rtc/start',{key:srvKey(),offer:offer});
    srvPost('/summon',{key:srvKey(),kind:'call',text:'Bố mẹ đang gọi — con nghe máy nhé!'}).catch(function(){});
    ccPollState(true);
  }catch(e){
    alert('Không mở được micro: '+e.message);
    ccEndCall();
  }
}
// CON: có cuộc gọi đến (app đang mở)
function kuaIncomingCall(){
  ccCallUI('BỐ MẸ ĐANG GỌI!','Bấm nghe máy để nói chuyện',true);
  ringLoop();
  if(typeof speak==='function') speak('Peter! Bố mẹ đang gọi em! Nghe máy đi!');
}
// CON bấm NGHE MÁY
async function kuaAnswerCall(){
  try{
    ringStop(); window._ccInCall=true; _ccCands={cp:0,ck:0};
    ccCallUI('ĐANG KẾT NỐI...','Chờ chút nhé...',false);
    await ccMakePC(false);
    var st=await (await fetch(srvUrl()+'/rtc/state?role=k')).json();
    if(!st.offer){ ccCallSub('Cuộc gọi đã kết thúc.'); setTimeout(ccEndCall,1500); return; }
    await _pc.setRemoteDescription(st.offer);
    (st.cands||[]).forEach(function(c){ if(c) _pc.addIceCandidate(c).catch(function(){}); });
    _ccCands.cp=st.cp||0;
    var ans=await _pc.createAnswer();
    await _pc.setLocalDescription(ans);
    await srvPost('/rtc/answer',{answer:ans});
    ccPollState(false);
  }catch(e){
    alert('Không mở được micro: '+e.message);
    ccEndCall();
  }
}
function ccEndCall(silent){
  window._ccInCall=false;
  clearInterval(_callPoll); _callPoll=null;
  ringStop();
  try{ if(_localStream) _localStream.getTracks().forEach(function(t){t.stop();}); }catch(e){}
  try{ if(_pc) _pc.close(); }catch(e){}
  _pc=null; _localStream=null;
  if(!silent) srvPost('/rtc/end',{}).catch(function(){});
  var ov=document.getElementById('ccCallOL'); if(ov) ov.style.display='none';
}

// ── NÂNG CẤP nút bố mẹ: 💬 NHẮN mở bảng chat thay vì hộp prompt ──
function adminMsgKid(){ ccOpenChat(false); }

// ── nút 💬 Bố mẹ phía con cũng mở bảng chat ──
function kuaMsgParent(){ ccOpenChat(false); }


// ═══ NHẬN TÍN HIỆU TỨC THÌ TỪ SERVICE WORKER (app đang mở là reo ngay, không chờ poll) ═══
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message', function(e){
    try{
      var d=e.data||{};
      if(ccMy()!=='kua') return;
      if(d.type==='call' && !window._ccInCall && !document.getElementById('ccCallOL')){
        kuaIncomingCall();
      } else if(d.type==='summon' && !document.getElementById('cmdOL')){
        if(typeof cmdShowDirective==='function') cmdShowDirective('summon', d.id||'', d.text||'');
      } else if(d.type==='msg'){
        ccOpenChat(true);
        if(typeof speak==='function') speak('Peter! Bố mẹ nhắn: '+(d.text||''));
      }
    }catch(err){}
  });
}
