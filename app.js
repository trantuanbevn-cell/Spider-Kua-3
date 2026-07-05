// ═══ SUPABASE CONFIG ═══


// Lấy bài tập từ Supabase

// ═══ CONFIG ═══
const SB_URL='https://fwzlxitynbpfjngiakqw.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3emx4aXR5bmJwZmpuZ2lha3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MzYzNDYsImV4cCI6MjA5MTIxMjM0Nn0.uz1adH8f7ASyIgPg03d7cb6OMXaP_KFrJ7BPVi8ZHkk';
const K={api:'sk3',gem:'gem3',mem:'mem3',hw:'hw3',room:'rm3',xu:'xu3',cups:'cups3'};
let key='',gemKey='',busy=false,imgArr=[],SR=null,isRec=false;
let typEl=null;
let srHW=null,isRecHW=false;
let srSach=null,isRecSach=false;
let srFury=null,isRecFury=false;
const HW_ALERT_KEY='hw_last_seen';
const DAYS_VI=['CN','T2','T3','T4','T5','T6','T7'];
const DAYS_KEY=['tcn','t2','t3','t4','t5','t6','t7'];
let lastTap=0;

// ═══ SPLASH - GEMINI LOGIC ═══
const SLOGAN_TEXT="Shield Systems Online. Standing by!";
const SLOGAN_VOICE="Shield systems online. Standing by!";

function animateSlogan(){
  const el=document.getElementById('sloganTxt');
  if(!el)return;
  el.textContent='';let j=0;
  const iv=setInterval(()=>{
    if(j<SLOGAN_TEXT.length){el.textContent+=SLOGAN_TEXT[j];j++;}
    else{clearInterval(iv);playVoice();}
  },50);
}

function playVoice(){
  if(!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(SLOGAN_VOICE);
  u.lang='en-US';u.rate=0.85;u.pitch=0.65;
  const tryPlay=()=>{
    const vv=window.speechSynthesis.getVoices();
    const v=vv.find(v=>v.name==='Google UK English Male')
      ||vv.find(v=>v.name==='Microsoft David - English (United States)')
      ||vv.find(v=>v.name==='Google US English')
      ||vv.find(v=>v.lang.startsWith('en-')&&(v.name.toLowerCase().includes('male')||v.name.toLowerCase().includes('david')||v.name.toLowerCase().includes('mark')||v.name.toLowerCase().includes('james')))
      ||vv.find(v=>v.lang==='en-US'&&!v.name.toLowerCase().includes('female'))
      ||vv.find(v=>v.lang.startsWith('en'));
    if(v)u.voice=v;
    u.onend=()=>{};
    window.speechSynthesis.speak(u);
  };
  if(window.speechSynthesis.getVoices().length>0)tryPlay();
  else window.speechSynthesis.onvoiceschanged=()=>{tryPlay();window.speechSynthesis.onvoiceschanged=null;};
}

function hideSplash(){
  window.speechSynthesis&&window.speechSynthesis.cancel();
  const sp=document.getElementById('splash');
  if(!sp)return;
  sp.classList.add('hide');
  setTimeout(()=>{
    sp.remove();
    const g=localStorage.getItem(K.gem),c=localStorage.getItem(K.api);
    if(g)gemKey=g;if(c)key=c;
    if(g||c)boot();
    else document.getElementById('setup').style.display='flex';
  },600);
}

// ═══ MEMORY ═══
function M(){return JSON.parse(localStorage.getItem(K.mem)||JSON.stringify({xp:0,streak:0,lastDay:'',missions:0,badges:[],notes:[],history:[],sessions:0}));}
function SM(m){localStorage.setItem(K.mem,JSON.stringify(m));}
function HW(){return JSON.parse(localStorage.getItem(K.hw)||'[]');}
function SHW(v){localStorage.setItem(K.hw,JSON.stringify(v));}
function room(){let r=localStorage.getItem(K.room);if(!r){r='KUA'+Math.random().toString(36).slice(2,6).toUpperCase();localStorage.setItem(K.room,r);}return r;}

// ═══ XU ═══
function getXu(){return parseInt(localStorage.getItem(K.xu)||'0');}
function setXu(v){localStorage.setItem(K.xu,v);updateXuUI();}
function addXu(n){
  const nw=getXu()+n;
  localStorage.setItem(K.xu,nw);
  updateXuUI();showXuPop(n);
  // Sync lên cloud sau 2s (debounce tránh gọi liên tục)
  clearTimeout(window._xuSyncTimer);
  window._xuSyncTimer=setTimeout(syncProgressToCloud,2000);
}
function spendXu(n){const cur=getXu();if(cur<n)return false;localStorage.setItem(K.xu,cur-n);updateXuUI();return true;}
function updateXuUI(){const x=getXu();document.querySelectorAll('.xu-count').forEach(el=>el.textContent=x.toLocaleString('vi-VN'));}
function showXuPop(n){
  const p=document.createElement('div');p.textContent='+'+n+' xu 🪙';
  p.style.cssText='position:fixed;top:52px;left:50%;transform:translateX(-50%);background:var(--gold);color:#000;font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;padding:4px 14px;border-radius:16px;z-index:9999;pointer-events:none;';
  document.body.appendChild(p);setTimeout(()=>p.remove(),2000);
}

// ═══ SHOP ═══
// ═══ SÁCH GIÁO KHOA ═══
// ═══ SÁCH GIÁO KHOA — tải từ file, không nhúng trong code ═══
var SGK_TOAN='',VBT_TOAN='',SGK_TV='';
function loadBooks(){
  var files=[['SGK_Toan_4_Tap2_KetNoi.txt','SGK_TOAN'],['VBT_Toan_4_Tap2_KetNoi.txt','VBT_TOAN'],['SGK_TiengViet_4_Tap2_KetNoi.txt','SGK_TV']];
  files.forEach(function(f){
    fetch(f[0]).then(function(r){return r.ok?r.text():'';}).then(function(t){window[f[1]]=t;}).catch(function(){});
  });
}
loadBooks();






function traCuuSach(mon,trang,bai){
  var sach='';var m=(mon||'').toLowerCase();
  if(m.includes('vbt')||m.includes('vở')) sach=VBT_TOAN;
  else if(m.includes('toán')||m.includes('toan')) sach=SGK_TOAN;
  else if(m.includes('tiếng')||m.includes('tv')) sach=SGK_TV;
  if(!sach) return '';
  var lines=sach.split('\n');var start=-1,end=-1;
  var trangStr='--- TRANG '+trang+' ---';
  for(var i=0;i<lines.length;i++){if(lines[i].includes(trangStr)){start=i;break;}}
  if(start===-1) return '';
  for(var i=start+1;i<lines.length;i++){if(lines[i].match(/^--- TRANG \d+ ---/)){end=i;break;}}
  if(end===-1) end=Math.min(start+50,lines.length);
  var pg=lines.slice(start,end).join('\n');
  if(bai){
    var bl=pg.split('\n');var bs=-1;
    for(var i=0;i<bl.length;i++){if(bl[i].trim().startsWith(bai+'.')){bs=i;break;}}
    if(bs>-1){
      var be=bl.length;
      for(var i=bs+1;i<bl.length;i++){if(bl[i].trim().match(/^\d+\./)){be=i;break;}}
      return bl.slice(bs,be).join('\n');
    }
  }
  return pg;
}

function traCuuSachTheoBai(sachName, soBai){
  var sach='';
  if(sachName==='vbt'||sachName==='vbt_toan') sach=VBT_TOAN;
  else if(sachName==='sgk'||sachName==='sgk_toan') sach=SGK_TOAN;
  else if(sachName==='tv'||sachName==='sgk_tv') sach=SGK_TV;
  if(!sach||!soBai) return '';
  soBai=parseInt(soBai);
  var lines=sach.split('\n');
  var start=-1;
  for(var i=0;i<lines.length;i++){
    var l=lines[i].trim();
    var m=l.match(/^BÀI\s+(\d+)\s*:/i);
    if(m&&parseInt(m[1])===soBai){start=i;break;}
  }
  if(start<0) return '';
  var end=lines.length;
  for(var j=start+1;j<lines.length;j++){
    if(/^BÀI\s+\d+\s*:/i.test(lines[j].trim())&&j>start+1){end=j;break;}
  }
  if(end-start>80) end=start+80;
  return lines.slice(start,end).join('\n').trim();
}

// SGK và VBT cùng số bài = cùng bài học, đối chiếu trực tiếp
function getLyThuyetSGK(baiSo){
  return traCuuSachTheoBai('sgk', baiSo);
}

function parseAndEnrichHW(hwText){
  // Tìm số bài trong text (VBT bài X, bài số X, trang X bài Y...)
  var found=[];
  // Pattern: "bài X" hoặc "VBT bài X"
  var rBai=/(?:vbt|vở\s*bài\s*tập)?\s*(?:toán)?\s*bài\s*(\d+)/gi;
  var seen={};
  var mb;
  while((mb=rBai.exec(hwText))!==null){
    var baiSo=parseInt(mb[1]);
    if(baiSo<38||baiSo>73||seen[baiSo]) continue;
    seen[baiSo]=true;
    var vbtNd=traCuuSachTheoBai('vbt',baiSo);
    var sgkNd=traCuuSachTheoBai('sgk',baiSo);
    if(vbtNd||sgkNd){
      found.push({
        mon:'VBT Toán', trang:null, bai:baiSo,
        noiDung:vbtNd, lyThuyet:sgkNd, byBai:true
      });
    }
  }
  // Pattern trang: "trang X" → tìm bài ở trang đó
  if(!found.length){
    var rTrang=/(?:trang|tr\.?)\s*(\d+)/gi;
    while((mb=rTrang.exec(hwText))!==null){
      var trangSo=parseInt(mb[1]);
      found.push({mon:'Toán',trang:trangSo,bai:null,noiDung:'Trang '+trangSo,lyThuyet:'',byBai:false});
    }
  }
  return found.length?{original:hwText,found:found}:null;
}





const REWARDS=[
  {id:'tv',icon:'📺',name:'Xem tivi sau 10h30',desc:'30 phút tối nay',xu:30},
  {id:'game',icon:'🎮',name:'Chơi game sau 10h',desc:'30 phút chơi game',xu:50},
  {id:'game_we',icon:'🕹️',name:'Game cuối tuần (T7/CN)',desc:'1 tiếng chơi game',xu:100,weekend:true},
  {id:'toy1',icon:'🧸',name:'Đồ chơi dưới 200k',desc:'Tương đương 2000xu = 200k',xu:2000},
  {id:'toy2',icon:'🎁',name:'Đồ chơi dưới 500k',desc:'Tương đương 5000xu = 500k',xu:5000},
];
function showShop(){
  const cur=getXu();
  const cups=JSON.parse(localStorage.getItem(K.cups)||'[]');
  const el=document.createElement('div');
  el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  el.innerHTML=`
    <div style="background:var(--s1);border:1px solid var(--bd2);border-radius:18px;padding:22px;max-width:400px;width:100%;max-height:90vh;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:20px;color:var(--gold);">🪙 ĐỔI THƯỞNG</div>
        <button onclick="this.closest('div[style*=fixed]').remove()" style="background:transparent;border:1px solid var(--bd);border-radius:7px;color:var(--tx2);padding:4px 10px;cursor:pointer;">✕</button>
      </div>
      <div style="background:var(--s3);border-radius:10px;padding:12px;text-align:center;margin-bottom:14px;">
        <div style="font-size:11px;color:var(--tx2);margin-bottom:4px;">Xu hiện có</div>
        <div style="font-family:Rajdhani,sans-serif;font-size:28px;font-weight:700;color:var(--gold);">${cur.toLocaleString('vi-VN')} 🪙</div>
        <div style="font-size:11px;color:var(--tx3);margin-top:4px;">Cúp điểm 10: ${cups.length} cái 🏆</div>
      </div>
      ${REWARDS.map(r=>{
        const ok=cur>=r.xu;
        return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:${ok?'var(--s2)':'var(--s1)'};border:1px solid ${ok?'var(--bd2)':'var(--bd)'};border-radius:10px;margin-bottom:6px;">
          <div style="font-size:22px;width:34px;text-align:center;">${r.icon}</div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:500;color:${ok?'var(--tx)':'var(--tx3)'};">${r.name}</div>
            <div style="font-size:11px;color:var(--tx3);">${r.desc}</div>
          </div>
          <button onclick="buyReward('${r.id}',${r.xu},'${r.name}')" ${!ok?'disabled':''} style="background:${ok?'var(--gold)':'var(--s3)'};color:${ok?'#000':'var(--tx3)'};border:none;border-radius:8px;font-family:Rajdhani,sans-serif;font-weight:700;font-size:12px;padding:6px 10px;cursor:${ok?'pointer':'not-allowed'};white-space:nowrap;">${r.xu.toLocaleString('vi-VN')} xu</button>
        </div>`;
      }).join('')}
      <div style="font-size:10px;color:var(--tx3);text-align:center;margin-top:8px;">Cần PIN ba/mẹ để xác nhận</div>
    </div>`;
  document.body.appendChild(el);
}

function buyReward(id,xu,name){
  if(id==='game_we'){
    const dow=new Date().getDay();
    if(dow!==0&&dow!==6){alert('⚠️ Game cuối tuần chỉ dùng được vào Thứ 7 hoặc Chủ Nhật!');return;}
  }
  const pin=prompt('Nhập PIN của ba/mẹ:');
  if(!pin)return;
  if(!checkParentPin(pin)){alert('❌ PIN không đúng!');return;}
  if(!spendXu(xu)){alert('Không đủ xu!');return;}
  document.querySelector('div[style*="fixed"][style*="88"]')&&document.querySelector('div[style*="fixed"][style*="88"]').remove();
  const pop=document.createElement('div');pop.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;';
  pop.innerHTML='<div style="text-align:center;padding:20px;"><div style="font-size:56px;margin-bottom:12px;">🎉</div><div style="font-family:Rajdhani,sans-serif;font-size:22px;font-weight:700;color:var(--green);margin-bottom:8px;">Đổi thưởng thành công!</div><div style="font-size:15px;color:var(--tx);margin-bottom:6px;">'+name+'</div><div style="font-size:13px;color:var(--tx2);margin-bottom:20px;">Còn lại: '+getXu().toLocaleString('vi-VN')+' xu</div><button onclick="this.closest(\'div[style*=fixed]\').remove()" style="background:var(--green);border:none;border-radius:12px;color:#000;font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;padding:12px 28px;cursor:pointer;">TUYỆT VỜI!</button></div>';
  document.body.appendChild(pop);
}

// ═══ CUP ĐIỂM 10 ═══
function showCupCelebration(xuAmt, label){
  const el=document.createElement('div');el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;';
  el.innerHTML='<div id="cfwrap" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;"></div><div style="text-align:center;position:relative;z-index:2;padding:20px;"><div style="font-size:72px;margin-bottom:12px;animation:bounce .6s infinite alternate;">🏆</div><div style="font-family:Rajdhani,sans-serif;font-size:28px;font-weight:700;color:var(--gold);margin-bottom:8px;">🏆 '+_label.toUpperCase()+'!</div><div style="font-size:14px;color:var(--tx2);margin-bottom:20px;">Anh Fury tự hào về em lắm!</div><div style="background:var(--gold);color:#000;font-family:Rajdhani,sans-serif;font-weight:700;font-size:22px;padding:10px 28px;border-radius:14px;display:inline-block;margin-bottom:20px;">+'+_xu+' xu 🪙</div><br><button onclick="this.closest(\'div[style*=fixed]\').remove()" style="background:transparent;border:2px solid var(--gold);border-radius:12px;color:var(--gold);font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;padding:10px 28px;cursor:pointer;margin-top:10px;">TIẾP TỤC</button></div>';
  document.body.appendChild(el);
  const wrap=el.querySelector('#cfwrap');
  const colors=['#f5c842','#e8192c','#30d158','#1a6abf','#ff3347','#fff'];
  for(let i=0;i<60;i++){const c=document.createElement('div');const col=colors[Math.floor(Math.random()*colors.length)];const sz=Math.random()*10+5;c.style.cssText='position:absolute;width:'+sz+'px;height:'+sz+'px;background:'+col+';border-radius:'+(Math.random()>.5?'50%':'2px')+';left:'+Math.random()*100+'%;top:-20px;animation:fall '+(Math.random()*2+2)+'s '+(Math.random()*2)+'s linear infinite;';wrap.appendChild(c);}
  const st=document.createElement('style');st.textContent='@keyframes fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1;}100%{transform:translateY(110vh) rotate(720deg);opacity:0;}}@keyframes bounce{from{transform:scale(1);}to{transform:scale(1.15);}}';document.head.appendChild(st);
  var _xu=xuAmt||200;var _label=label||"Điểm 10";addXu(_xu);
  const cups=JSON.parse(localStorage.getItem(K.cups)||'[]');cups.push({ts:Date.now()});localStorage.setItem(K.cups,JSON.stringify(cups));
  updateUI();

  setTimeout(syncProgressToCloud,1000);
}
// ═══ THÀNH TÍCH - ĐIỂM 10 / BẰNG KHEN / GIẤY KHEN ═══
function showCupUpload(){
  const el=document.createElement('div');
  el.id='cupUploadPop';
  el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  el.innerHTML=`
    <div style="background:var(--s1);border:1px solid var(--bd2);border-radius:18px;padding:22px;max-width:380px;width:100%;">
      <div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:20px;color:var(--gold);text-align:center;margin-bottom:4px;">🏆 NỘP THÀNH TÍCH</div>
      <div style="font-size:11px;color:var(--tx3);text-align:center;margin-bottom:16px;">Điểm 10 · Bằng khen · Giấy khen · Bài cô khen</div>

      <!-- Chọn loại thành tích -->
      <div style="margin-bottom:14px;">
        <div style="font-size:11px;color:var(--tx2);font-family:Rajdhani,sans-serif;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;">Loại thành tích:</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <label style="display:flex;align-items:center;gap:6px;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:8px 10px;cursor:pointer;">
            <input type="radio" name="achType" value="diem10" checked style="accent-color:var(--gold);"> <span style="font-size:12px;color:var(--tx);">⭐ Điểm 10</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:8px 10px;cursor:pointer;">
            <input type="radio" name="achType" value="bangkhen" style="accent-color:var(--gold);"> <span style="font-size:12px;color:var(--tx);">🥇 Bằng khen</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:8px 10px;cursor:pointer;">
            <input type="radio" name="achType" value="giayKhen" style="accent-color:var(--gold);"> <span style="font-size:12px;color:var(--tx);">📜 Giấy khen</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:8px 10px;cursor:pointer;">
            <input type="radio" name="achType" value="baiKhen" style="accent-color:var(--gold);"> <span style="font-size:12px;color:var(--tx);">📝 Bài cô khen</span>
          </label>
        </div>
      </div>

      <!-- Chụp ảnh -->
      <div style="display:flex;gap:10px;margin-bottom:14px;">
        <label style="flex:1;background:var(--s3);border:2px dashed var(--red);border-radius:12px;padding:14px;text-align:center;cursor:pointer;">
          <div style="font-size:26px;margin-bottom:4px;">📷</div>
          <div style="font-size:11px;color:var(--tx2);">Chụp ngay</div>
          <input type="file" accept="image/*" capture="environment" style="display:none" onchange="verifyCup(this)">
        </label>
        <label style="flex:1;background:var(--s3);border:2px dashed var(--bd2);border-radius:12px;padding:14px;text-align:center;cursor:pointer;">
          <div style="font-size:26px;margin-bottom:4px;">🖼️</div>
          <div style="font-size:11px;color:var(--tx2);">Thư viện</div>
          <input type="file" accept="image/*" style="display:none" onchange="verifyCup(this)">
        </label>
      </div>

      <!-- PIN mẹ xác nhận -->
      <div style="background:rgba(232,25,44,.06);border:1px solid rgba(232,25,44,.2);border-radius:10px;padding:12px;margin-bottom:12px;">
        <div style="font-size:11px;color:var(--red2);font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.06em;margin-bottom:6px;">🔐 XÁC NHẬN CỦA MẸ</div>
        <input id="cupPinInput" type="password" inputmode="numeric" maxlength="4" placeholder="Nhập mật khẩu của mẹ"
          style="width:100%;background:var(--s2);border:1px solid var(--bd2);border-radius:8px;color:var(--tx);font-size:16px;padding:8px 12px;outline:none;box-sizing:border-box;letter-spacing:.3em;text-align:center;font-family:Rajdhani,sans-serif;">
        <div id="cupPinErr" style="font-size:11px;color:var(--red2);text-align:center;margin-top:4px;display:none;">❌ PIN không đúng!</div>
      </div>

      <button onclick="document.getElementById('cupUploadPop').remove()" style="width:100%;background:transparent;border:1px solid var(--bd);border-radius:10px;color:var(--tx2);font-family:Rajdhani,sans-serif;font-size:14px;padding:10px;cursor:pointer;">Huỷ</button>
    </div>`;
  document.body.appendChild(el);
}

async function verifyCup(input){
  // Kiểm tra PIN mẹ trước
  const pinEl=document.getElementById('cupPinInput');
  const pin=pinEl?pinEl.value.trim():'';
  const correctPin=localStorage.getItem('parent_pin')||'';
  if(pin!==correctPin){
    const errEl=document.getElementById('cupPinErr');
    if(errEl){errEl.style.display='block';}
    setTimeout(function(){if(errEl)errEl.style.display='none';},2000);
    return;
  }

  // Lấy loại thành tích
  const typeEl=document.querySelector('input[name="achType"]:checked');
  const achType=typeEl?typeEl.value:'diem10';
  const achLabels={diem10:'Điểm 10',bangkhen:'Bằng khen',giayKhen:'Giấy khen',baiKhen:'Bài cô khen'};
  const achXu={diem10:200,bangkhen:500,giayKhen:500,baiKhen:150};
  const achLabel=achLabels[achType]||'Thành tích';
  const xuReward=achXu[achType]||200;

  const f=input.files[0];if(!f)return;
  document.getElementById('cupUploadPop').remove();

  // Loading
  const loading=document.createElement('div');
  loading.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;';
  loading.innerHTML='<div style="font-size:48px;margin-bottom:16px;">🔍</div><div style="font-family:Rajdhani,sans-serif;font-size:18px;color:var(--tx);">Fury đang xác nhận thành tích...</div>';
  document.body.appendChild(loading);

  const r=new FileReader();
  r.onload=async function(e){
    const b64=e.target.result.split(',')[1];
    // PIN đã xác nhận → không cần AI verify, xác nhận trực tiếp
    loading.remove();
    showCupCelebration(xuReward, achLabel);
  };
  r.readAsDataURL(f);
}



// ═══════════════════════════════════════════════════════════
// CORE FUNCTIONS (from V3)
// ═══════════════════════════════════════════════════════════

async function sbFetch(path, opts={}){
  const headers={
    'apikey': SB_KEY,
    'Authorization': 'Bearer '+SB_KEY,
    'Content-Type': 'application/json',
  };
  if(opts.prefer) headers['Prefer']=opts.prefer;
  const {prefer,...restOpts}=opts;
  const res = await fetch(SB_URL+'/rest/v1/'+path, {
    headers,
    ...restOpts
  });
  if(!res.ok){const e=await res.json();throw new Error(e.message||res.status);}
  return res.json();
}



async function pingSupabase(){
  try { await sbFetch('homework?limit=1'); } catch(e){}
}

async function loadProgressFromCloud(){
  try{
    const data=await sbFetch('progress?room_code=eq.'+room()+'&limit=1');
    if(!data||!data.length)return;
    const p=data[0];
    // Nếu là máy Kua (thiết bị chính) → KHÔNG đọc từ cloud
    // Máy Kua luôn là nguồn dữ liệu mới nhất, chỉ ghi lên cloud
    const isKuaDevice=localStorage.getItem('isKuaDevice')==='true';
    if(isKuaDevice){
      // Máy Kua: push dữ liệu local lên cloud (đảm bảo cloud = máy Kua)
      await syncProgressToCloud();
      return;
    }
    // Máy bố/mẹ: đọc từ cloud về để xem tiến độ Kua
    localStorage.setItem(K.xu, p.xu||0);
    localStorage.setItem(K.cups, p.cups||0);
    updateXuUI();
  }catch(e){console.warn('progress load err:',e.message);}
}

async function syncProgressToCloud(){
  try{
    const xu=getXu();
    const cups=parseInt(localStorage.getItem(K.cups)||'0');
    const m=M();
    await sbFetch('progress?room_code=eq.'+room(),{
      method:'PATCH',
      prefer:'return=minimal',
      body:JSON.stringify({xu:xu,cups:cups,streak:m.streak||0,xp:m.xp||0,updated_at:new Date().toISOString()})
    });
  }catch(e){console.warn('progress sync err:',e.message);}
}

async function loadHWFromCloud(){
  try {
    const data = await sbFetch('homework?room_code=eq.'+room()+'&order=created_at.desc&limit=5');
    return data||[];
  } catch(e){
    console.warn('Supabase load err:', e.message);
    return [];
  }
}

async function saveHWToCloud(text){
  try {
    await sbFetch('homework', {
      method:'POST',
      prefer:'return=minimal',
      body: JSON.stringify({text, room_code:room()})
    });
    return true;
  } catch(e){
    console.warn('Supabase save err:', e.message);
    return false;
  }
}

async function syncHWFromCloud(){
  const rows = await loadHWFromCloud();
  if(!rows.length) return;
  // Lưu vào localStorage để dùng offline
  const existing = HW();
  rows.forEach(function(r){
    const exists = existing.find(h=>h.id===r.id);
    if(!exists){
      existing.unshift({id:r.id, ts:r.created_at, text:r.text});
    }
  });
  // Giữ tối đa 10 bài
  if(existing.length>10) existing.splice(10);
  localStorage.setItem('hw3', JSON.stringify(existing));
}

async function checkAndShowHWAlert(){
  // Chỉ hiển thị sau khi app đã load xong (qua splash)
  if(document.getElementById('splash')&&
     document.getElementById('splash').style.display!=='none') return;

  // Sync bài mới từ cloud
  try{ await syncHWFromCloud(); }catch(e){}

  const hw=HW();
  if(!hw.length) return;

  const latest=hw[0];
  const lastSeen=localStorage.getItem(HW_ALERT_KEY)||'0';

  // Chỉ hiện nếu bài mới hơn lần cuối Kua xem
  // Chuẩn hóa để so sánh
  var latestTs=typeof latest.ts==='number'?new Date(latest.ts).getTime():new Date(latest.ts).getTime();
  var lastSeenTs=lastSeen==='0'?0:new Date(lastSeen).getTime();
  if(latestTs<=lastSeenTs) return;

  // Hiển thị alert
  const overlay=document.getElementById('hwAlertOverlay');
  const contentEl=document.getElementById('hwAlertContent');
  const metaEl=document.getElementById('hwAlertMeta');
  const sachEl=document.getElementById('hwAlertSach');
  const sachContent=document.getElementById('hwAlertSachContent');
  if(!overlay) return;

  // Điền nội dung
  contentEl.textContent=latest.text;

  // Format thời gian
  const d=new Date(latest.ts);
  const timeStr=d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
  const dateStr=d.getDate()+'/'+( d.getMonth()+1);
  metaEl.textContent='Gửi lúc '+timeStr+' ngày '+dateStr;

  // Tra sách tự động
  try{
    const parsed=parseAndEnrichHW(latest.text);
    if(parsed&&parsed.found&&parsed.found.length){
      var sachTxt='';
      parsed.found.forEach(function(f){
        sachTxt+=f.mon+' trang '+f.trang+(f.bai?' bài '+f.bai:'')+':'+' '+f.noiDung+'\n\n';
      });
      sachContent.textContent=sachTxt.trim();
      sachEl.style.display='block';
    } else {
      sachEl.style.display='none';
    }
  }catch(e){ sachEl.style.display='none'; }

  overlay.style.display='flex';
}

function dismissHWAlert(){
  // Chỉ đóng popup, KHÔNG lưu timestamp → lần sau mở máy vẫn hiện lại
  const overlay=document.getElementById('hwAlertOverlay');
  if(overlay) overlay.style.display='none';
}

function startMissionNow(){
  const hw=HW();
  if(hw.length){
    var hts=hw[0].ts;
    var isoTs=typeof hts==='number'?new Date(hts).toISOString():hts;
    localStorage.setItem(HW_ALERT_KEY, isoTs);
    // Đánh dấu id bài này đã bắt đầu làm
    markHWStarted(hw[0].id);
  }
  const overlay=document.getElementById('hwAlertOverlay');
  if(overlay) overlay.style.display='none';
  setTimeout(showHWInChat, 300);
}

function isHWDone(id){
  var done=JSON.parse(localStorage.getItem('hw_done_ids')||'[]');
  return done.includes(String(id));
}

function markHWStarted(id){
  var done=JSON.parse(localStorage.getItem('hw_done_ids')||'[]');
  if(!done.includes(String(id))) done.push(String(id));
  localStorage.setItem('hw_done_ids', JSON.stringify(done));
}

async function deleteHW(id){
  if(!confirm('Xóa bài tập này? Kua sẽ không nhận thông báo về bài này nữa.')) return;
  // Xóa khỏi localStorage
  const hw=HW().filter(function(h){return h.id!=id;});
  SHW(hw);
  // Nếu xóa bài mới nhất, cập nhật hw_last_seen để không hiện thông báo
  const allHW=HW();
  if(!allHW.length) localStorage.setItem('hw_last_seen', new Date().toISOString());
  // Xóa trên Supabase cloud
  try{
    await sbFetch('homework?id=eq.'+id, {method:'DELETE'});
  }catch(e){console.warn('delete cloud err:',e);}
  renderHW();
}

function renderHW(){
  const hw=HW(),list=document.getElementById('hwList'),now=Date.now();
  // Xóa bài quá 7 ngày
  const clean=hw.filter(h=>(now-new Date(h.ts).getTime())<7*24*3600*1000);
  if(clean.length!==hw.length)SHW(clean);
  if(!clean.length){
    list.innerHTML='<div style="font-size:12px;color:var(--tx3);text-align:center;padding:16px 0;">✅ Chưa có bài nào</div>';
    return;
  }
  // Lấy timestamp Kua đã bắt đầu làm (đánh dấu là xem alert)
  const doneMark=localStorage.getItem('hw_last_seen')||'0';
  var html='<div style="font-size:11px;color:var(--tx3);font-family:Rajdhani,sans-serif;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;">📋 BÀI ĐÃ GIAO ('+clean.length+')</div>';
  clean.forEach(function(h){
    const ts=new Date(h.ts);
    const age=Math.round((now-ts.getTime())/3600000);
    const isToday=ts.toDateString()===new Date().toDateString();
        const isDone=isHWDone(h.id);
    const timeStr=ts.getHours().toString().padStart(2,'0')+':'+ts.getMinutes().toString().padStart(2,'0');
    const dateStr=ts.getDate()+'/'+(ts.getMonth()+1);

    html+='<div style="background:'+(isToday?'rgba(26,107,191,.08)':'var(--s3)')+';border:1px solid '+(isToday?'var(--blue2)':'var(--bd)')+';border-radius:10px;padding:10px 12px;margin-bottom:8px;position:relative;">';

    // Header row: ngày + trạng thái + nút xóa
    html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:7px;">';
    html+='<span style="font-size:10px;font-weight:700;color:'+(isToday?'var(--blue2)':'var(--tx3)')+';font-family:Rajdhani,sans-serif;text-transform:uppercase;">'+(isToday?'HÔM NAY':'TRƯỚC ĐÓ')+' · '+timeStr+' '+dateStr+'</span>';
    html+='<span style="font-size:10px;padding:2px 7px;border-radius:6px;font-family:Rajdhani,sans-serif;font-weight:700;background:'+(isDone?'rgba(48,209,88,.15)':'rgba(255,180,0,.15)')+';color:'+(isDone?'var(--green)':'#ffb400')+'">'+(isDone?'✓ Đã làm':'⏳ Chờ làm')+'</span>';
    html+='<button data-id="'+h.id+'" onclick="window._delHW(this)" style="margin-left:auto;background:rgba(232,25,44,.1);border:1px solid rgba(232,25,44,.3);border-radius:6px;color:var(--red2);font-size:11px;padding:3px 8px;cursor:pointer;font-family:Rajdhani,sans-serif;font-weight:700;">✕ Xóa</button>';
    html+='</div>';

    // Nội dung bài
    html+='<div style="font-size:12px;color:var(--tx2);white-space:pre-line;line-height:1.7;">'+h.text+'</div>';
    html+='</div>';
  });
  list.innerHTML=html;
}

async function showHWInChat(){
  // Sync bài mới từ cloud trước
  try{ await syncHWFromCloud(); }catch(e){ console.warn('sync err',e); }

  const hw=HW();
  if(!hw.length){
    addRaw('ai','📋 Mẹ chưa gửi bài tập nào. Nhờ mẹ mở app → bấm 👩 → nhập bài tập nhé em!');
    return;
  }

  const today=hw.filter(function(h){return new Date(h.ts).toDateString()===new Date().toDateString();});
  const list=today.length?today:hw.slice(0,1);
  const label=today.length?'HÔM NAY':'GẦN ĐÂY NHẤT';

  var html='<div style="background:rgba(26,107,191,.1);border:1px solid var(--blue2);border-radius:12px;padding:14px;">';
  html+='<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;color:var(--blue2);margin-bottom:10px;">📋 BÀI TẬP CỦA KUA</div>';
  html+='<div style="font-size:11px;font-weight:600;color:'+(today.length?'var(--green)':'var(--tx3)')+';font-family:Rajdhani,sans-serif;margin-bottom:6px;">'+label+'</div>';

  var promptParts=[];
  list.forEach(function(h){
    html+='<div style="font-size:13px;color:var(--tx);white-space:pre-line;line-height:1.8;margin-bottom:6px;">'+h.text+'</div>';
    try{
      var parsed=parseAndEnrichHW(h.text);
      if(parsed&&parsed.found&&parsed.found.length){
        html+='<div style="background:rgba(48,209,88,.08);border:1px solid rgba(48,209,88,.25);border-radius:8px;padding:10px;margin-bottom:6px;">';
        html+='<div style="font-size:11px;color:var(--green);font-family:Rajdhani,sans-serif;font-weight:700;margin-bottom:6px;">📖 ĐỀ BÀI TỪ SÁCH</div>';
        parsed.found.forEach(function(f){
          html+='<div style="font-size:11px;color:var(--tx2);font-weight:600;margin-bottom:3px;">'+f.mon+' - Trang '+f.trang+(f.bai?' - Bài '+f.bai:'')+'</div>';
          html+='<div style="font-size:12px;color:var(--tx);white-space:pre-line;font-family:monospace;background:var(--s3);border-radius:6px;padding:8px;margin-bottom:6px;">'+f.noiDung+'</div>';
          promptParts.push(f.mon+' trang '+f.trang+(f.bai?' bài '+f.bai:'')+': '+f.noiDung);
        });
        html+='</div>';
      }
    }catch(e){ console.warn('parse err',e); }
  });
  html+='</div>';

  var msgs=document.getElementById('msgs');
  var wrap=document.createElement('div');wrap.className='msg ai';
  var av=document.createElement('div');av.className='av';av.textContent='🛡️';
  var mc=document.createElement('div');mc.className='mc';
  var mn=document.createElement('div');mn.className='mn';mn.textContent='FURY — BÀI TẬP';
  var mb=document.createElement('div');mb.className='mb';mb.innerHTML=html;
  mc.appendChild(mn);mc.appendChild(mb);wrap.appendChild(av);wrap.appendChild(mc);
  msgs.appendChild(wrap);msgs.scrollTop=msgs.scrollHeight;

  var hwText=list[0]?list[0].text:'';
  var sachInfo=promptParts.length?'\nĐề bài từ sách:\n'+promptParts.join('\n'):'';
  // Đánh dấu bài đã bắt đầu làm
  if(list.length) markHWStarted(list[0].id);
  setTimeout(function(){
    qs('Bài tập hôm nay: '+hwText+sachInfo+'\nAnh đọc đề và hướng dẫn em làm từng bước nhé!');
  },600);
}

function sendHW(){
  const txt=document.getElementById('hwTA').value.trim();
  if(!txt){document.getElementById('hwTA').style.border='1px solid var(--red)';setTimeout(()=>document.getElementById('hwTA').style.border='1px solid var(--bd2)',1500);return;}
  // Lưu localStorage
  const hw=HW();hw.unshift({id:Date.now().toString(),ts:new Date().toISOString(),text:txt});SHW(hw);
  document.getElementById('hwTA').value='';renderHW();
  // Lưu Supabase cloud
  const btn=document.getElementById('hwBtn');
  if(btn){btn.textContent='⏳ Đang đồng bộ...';btn.disabled=true;}
  saveHWToCloud(txt).then(function(ok){
    if(btn){
      btn.textContent=ok?'✅ Đã lưu & đồng bộ cloud!':'📤 LƯU BÀI TẬP CHO KUA';
      btn.disabled=false;
      if(ok) setTimeout(function(){btn.textContent='📤 LƯU BÀI TẬP CHO KUA';},3000);
    }
  });
}

function markAsKuaDevice(){
  localStorage.setItem('isKuaDevice','true');
  syncProgressToCloud();
  alert('✅ Đã đặt thiết bị này là máy Kua!\nDữ liệu xu và huy hiệu sẽ luôn được lấy từ máy này.');
}

function showParent(){
  const pin=prompt('Nhập mã PIN của ba/mẹ:');
  if(!pin)return;
  if(!checkParentPin(pin)){alert('❌ PIN không đúng!');return;}
  document.getElementById('parentOL').style.display='flex';renderHW();
  const dtl=document.getElementById('deviceTypeLabel');
  if(dtl) dtl.textContent=localStorage.getItem('isKuaDevice')==='true'?'Máy Kua ✅':'Máy bố/mẹ 👁️';
}

function copyRoom(){const r=room();navigator.clipboard.writeText(r).then(()=>{const el=document.getElementById('sRoom');el.textContent='Đã copy!';setTimeout(()=>el.textContent=r,1200);});}

async function endSession(){
  const m=M(), xu=getXu(), today=new Date();
  const dayKey=DAYS_KEY[today.getDay()];
  const extra=(getEXTRA()[dayKey])||'không có lịch thêm';
  const p='[Kua vừa kết thúc buổi học hôm nay. Tổng kết: XP hôm nay='+m.xp+', Tổng xu='+xu+', Streak='+m.streak+' ngày, Missions='+m.missions+'. Lịch học thêm hôm nay: '+extra+'. Hãy: 1) Tổng kết ngắn việc Kua đã làm. 2) Khen thưởng. 3) Nhắc soạn sách vở cho ngày mai. 4) Nhắc lịch học thêm tiếp theo. Giọng Fury vui, ngắn gọn.]';
  qs(p);
  // Sync progress lên cloud khi kết thúc buổi học
  setTimeout(syncProgressToCloud, 1000);
}

function showFurySearch(){
  var p=document.getElementById('furySearchPopup');
  if(p){p.style.display='flex';setTimeout(function(){document.getElementById('furySearchInput')&&document.getElementById('furySearchInput').focus();},100);}
}

function closeFurySearch(){
  var p=document.getElementById('furySearchPopup');
  if(p){p.style.display='none';}
  // Dừng mic nếu đang nghe
  if(isRecFury&&srFury){srFury.stop();}
}

function furySearchGo(){
  var inp=document.getElementById('furySearchInput');
  var txt=inp?inp.value.trim():'';
  if(!txt){inp&&(inp.style.border='1px solid var(--red)');setTimeout(function(){inp&&(inp.style.border='1px solid var(--bd2)');},1500);return;}
  closeFurySearch();
  runTestSach(txt);
}

function furyHuongDan(btn){
  var sach=decodeURIComponent(btn.getAttribute('data-sach'));
  btn.disabled=true;btn.textContent='Đang gọi Fury...';
  qs('Đây là đề bài từ sách:\n'+sach+'\nAnh đọc kỹ đề và hướng dẫn em làm từng bước theo đúng cách SGK nhé!');
}

function toggleMicFury(){
  var S=window.SpeechRecognition||window.webkitSpeechRecognition;
  var btn=document.getElementById('micFuryBtn');
  var status=document.getElementById('micFuryStatus');
  if(!S){alert('Dùng Chrome để dùng giọng nói nhé!');return;}
  if(isRecFury){srFury&&srFury.stop();return;}

  srFury=new S();srFury.lang='vi-VN';srFury.continuous=false;srFury.interimResults=false;

  srFury.onresult=function(e){
    var txt=e.results[0][0].transcript;
    if(status) status.textContent='✅ Nghe được: "'+txt+'"';
    setTimeout(function(){
      closeFurySearch();
      setTimeout(function(){runTestSach(txt);},200);
    },600);
  };
  srFury.onend=function(){
    isRecFury=false;
    if(btn){btn.textContent='🎤 Bấm để nói';btn.style.background='var(--s3)';btn.style.borderColor='var(--bd2)';}
  };
  srFury.onerror=function(e){
    isRecFury=false;
    if(btn){btn.textContent='🎤 Bấm để nói';btn.style.background='var(--s3)';}
    if(status) status.textContent='';
    if(e.error!=='aborted'&&status) status.textContent='❌ Không nghe được, thử lại!';
  };
  srFury.start();isRecFury=true;
  if(btn){btn.textContent='⏹ Đang nghe...';btn.style.background='rgba(232,25,44,.15)';btn.style.borderColor='var(--red)';}
  if(status) status.textContent='Hãy nói: "VBT Toán trang 45"...';
}

function toggleMicSach(){
  const S=window.SpeechRecognition||window.webkitSpeechRecognition;
  const btn=document.getElementById('micFuryBtn');
  if(!S){alert('Dùng Chrome để dùng giọng nói nhé!');return;}
  if(isRecFury){
    srFury&&srFury.stop();
    return;
  }
  srFury=new S();
  srFury.lang='vi-VN';
  srFury.continuous=false;
  srFury.interimResults=false;

  srFury.onresult=function(e){
    const txt=e.results[0][0].transcript;
    addRaw('ai','🎤 Nghe được: <b>"'+txt+'"</b> — đang tra sách...');
    setTimeout(function(){ runTestSach(txt); }, 300);
  };

  srFury.onend=function(){
    isRecFury=false;
    if(btn){btn.textContent='🎤';btn.style.borderColor='#c0a060';btn.style.background='';}
  };

  srFury.onerror=function(e){
    isRecFury=false;
    if(btn){btn.textContent='🎤';btn.style.borderColor='#c0a060';btn.style.background='';}
    if(e.error!=='aborted') addRaw('ai','❌ Không nghe được, thử lại nhé!');
  };

  srFury.start();
  isRecFury=true;
  if(btn){btn.textContent='⏹ Đang nghe...';btn.style.borderColor='var(--red)';btn.style.background='rgba(232,25,44,.1)';}
}

function toggleMicHW(){
  const S=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!S){alert('Trình duyệt không hỗ trợ. Dùng Chrome nhé!');return;}
  if(isRecHW){
    srHW&&srHW.stop();
    isRecHW=false;
    document.getElementById('micHWBtn').textContent='🎤 Nói bài tập';
    document.getElementById('micHWBtn').style.borderColor='var(--bd)';
    document.getElementById('micHWStatus').style.display='none';
    return;
  }
  srHW=new S();
  srHW.lang='vi-VN';
  srHW.continuous=true;
  srHW.interimResults=false;
  srHW.onresult=e=>{
    const txt=Array.from(e.results).map(r=>r[0].transcript).join(' ');
    const ta=document.getElementById('hwTA');
    ta.value=(ta.value?ta.value+' ':'')+txt;
  };
  srHW.onend=()=>{
    isRecHW=false;
    document.getElementById('micHWBtn').textContent='🎤 Nói bài tập';
    document.getElementById('micHWBtn').style.borderColor='var(--bd)';
    document.getElementById('micHWStatus').style.display='none';
  };
  srHW.onerror=()=>srHW.onend();
  srHW.start();
  isRecHW=true;
  document.getElementById('micHWBtn').textContent='⏹ Dừng';
  document.getElementById('micHWBtn').style.borderColor='var(--green)';
  document.getElementById('micHWStatus').style.display='block';
}

function runTestSach(inp){
  var parsed=parseAndEnrichHW(inp);
  if(!parsed.found.length){
    addRaw('ai','❌ Không tìm thấy với "'+inp+'".<br>Thử: <b>vbt trang 45</b> · <b>toán trang 21</b> · <b>tiếng việt trang 8</b> · <b>tv trang 10</b>');
    return;
  }
  var html='<div style="background:rgba(48,209,88,.06);border:1px solid rgba(48,209,88,.25);border-radius:12px;padding:14px;">';
  html+='<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;color:var(--green);margin-bottom:10px;">📖 NỘI DUNG SÁCH</div>';
  var sachContext='';
  parsed.found.forEach(function(f){
    html+='<div style="font-size:11px;color:var(--tx2);font-weight:600;margin-bottom:4px;">'+f.mon+' - Trang '+f.trang+(f.bai?' - Bài '+f.bai:'')+'</div>';
    html+='<div style="font-size:12px;color:var(--tx);white-space:pre-line;background:var(--s3);border-radius:8px;padding:10px;margin-bottom:8px;font-family:monospace;line-height:1.7;">'+f.noiDung+'</div>';
    sachContext+='['+f.mon+' Trang '+f.trang+(f.bai?' Bài '+f.bai:'')+']:\n'+f.noiDung+'\n\n';
  });
  html+='<button onclick="furyHuongDan(this)" data-sach="'+encodeURIComponent(sachContext)+'" style="background:var(--red);border:none;border-radius:8px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;padding:8px 16px;cursor:pointer;margin-top:4px;">⚡ Fury hướng dẫn làm bài này</button>';
  html+='</div>';
  var msgs=document.getElementById('msgs');
  var wrap=document.createElement('div');wrap.className='msg ai';
  var av=document.createElement('div');av.className='av';av.textContent='📖';
  var mc=document.createElement('div');mc.className='mc';
  var mn=document.createElement('div');mn.className='mn';mn.textContent='NỘI DUNG SÁCH';
  var mb=document.createElement('div');mb.className='mb';mb.innerHTML=html;
  mc.appendChild(mn);mc.appendChild(mb);wrap.appendChild(av);wrap.appendChild(mc);
  msgs.appendChild(wrap);msgs.scrollTop=msgs.scrollHeight;
}

function testSach(){
  var inp=prompt('Nhập bài tập (VD: "vbt trang 45", "tiếng việt trang 10"):');
  if(!inp)return;
  runTestSach(inp);
}

function addXP(n){const m=M();m.xp+=n;SM(m);updateUI();}

function updateUI(){
  const m=M(),lv=Math.floor(m.xp/100)+1,pct=m.xp%100;
  document.getElementById('xpLbl').textContent='⚡ Lv.'+lv+' '+m.xp+'XP';
  document.getElementById('xpFill').style.width=pct+'%';
  document.getElementById('sStreak').textContent=m.streak;
  document.getElementById('sMission').textContent=m.missions;
  document.getElementById('sBadge').textContent=m.badges.length;
}

function showTyp(){const msgs=document.getElementById('msgs');typEl=document.createElement('div');typEl.className='msg ai';typEl.innerHTML='<div class="av">🛡️</div><div class="mc"><div class="mb"><div class="typing"><span></span><span></span><span></span></div></div></div>';msgs.appendChild(typEl);msgs.scrollTop=msgs.scrollHeight;}

function hideTyp(){if(typEl){typEl.remove();typEl=null;}}

function addUserMsg(txt,imgs){
  const msgs=document.getElementById('msgs');
  const wrap=document.createElement('div');wrap.className='msg user';
  const av=document.createElement('div');av.className='av';av.textContent='🕷️';
  const mc=document.createElement('div');mc.className='mc';
  const mn=document.createElement('div');mn.className='mn';mn.textContent='Kua — Peter Parker';
  const mb=document.createElement('div');mb.className='mb';mb.innerHTML=(txt||'').replace(/\n/g,'<br>');
  if(imgs&&imgs.length){imgs.forEach(i=>{const img=document.createElement('img');img.src='data:image/jpeg;base64,'+i;img.style.cssText='max-width:100%;border-radius:6px;margin-top:6px;opacity:.8;display:block;';mb.appendChild(img);});}
  mc.appendChild(mn);mc.appendChild(mb);wrap.appendChild(av);wrap.appendChild(mc);msgs.appendChild(wrap);msgs.scrollTop=msgs.scrollHeight;
}

function addAIMsg(text){
  const msgs=document.getElementById('msgs');
  const wrap=document.createElement('div');wrap.className='msg ai';
  const av=document.createElement('div');av.className='av';av.textContent='🛡️';
  const mc=document.createElement('div');mc.className='mc';
  const mn=document.createElement('div');mn.className='mn';mn.textContent='FURY — S.H.I.E.L.D.';
  mc.appendChild(mn);parseReply(text,mc);
  wrap.appendChild(av);wrap.appendChild(mc);msgs.appendChild(wrap);msgs.scrollTop=msgs.scrollHeight;
}

function addRaw(role,txt){
  const msgs=document.getElementById('msgs');
  const wrap=document.createElement('div');wrap.className='msg '+role;
  const av=document.createElement('div');av.className='av';av.textContent=role==='ai'?'🛡️':'🕷️';
  const mc=document.createElement('div');mc.className='mc';
  const mb=document.createElement('div');mb.className='mb';mb.innerHTML=txt;
  mc.appendChild(mb);wrap.appendChild(av);wrap.appendChild(mc);msgs.appendChild(wrap);msgs.scrollTop=msgs.scrollHeight;
}

async function callGemini(txt,imgs){
  const parts=[];
  if(imgs&&imgs.length)imgs.forEach(i=>parts.push({inlineData:{mimeType:'image/jpeg',data:i}}));
  parts.push({text:txt||'Đây là ảnh bài tập. Hướng dẫn em làm nhé.'});
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+gemKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:sys()}]},contents:[{role:'user',parts}],generationConfig:{maxOutputTokens:800,temperature:smartTemp()}})});
  if(!r.ok){const e=await r.json();throw new Error(e.error?.message||'Gemini '+r.status);}
  const d=await r.json();return d.candidates[0].content.parts[0].text;
}

async function callClaude(txt,imgs,m){
  let content;
  if(imgs&&imgs.length){content=imgs.map(i=>({type:'image',source:{type:'base64',media_type:'image/jpeg',data:i}}));content.push({type:'text',text:txt||'Đây là '+imgs.length+' trang bài tập. Hướng dẫn nhé.'});}
  else content=txt;
  const msgs=[...m.history.slice(0,-1).map(h=>({role:h.role,content:h.content})),{role:'user',content}];
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:800,system:sys(),messages:msgs})});
  if(!r.ok){const e=await r.json();throw new Error(e.error?.message||'Claude '+r.status);}
  const d=await r.json();return d.content[0].text;
}

async function callAI(txt,imgs){
  const m=M();
  m.history.push({role:'user',content:txt||(imgs&&imgs.length?'[Gửi '+imgs.length+' ảnh]':'')});
  if(m.history.length>40)m.history=m.history.slice(-40);
  let reply;
  if(gemKey){
    try{
      reply=await callGemini(txt,imgs);
    }catch(e){
      console.warn('Gemini err:',e.message);
      const isOverload=e.message&&(e.message.includes('high demand')||e.message.includes('overloaded')||e.message.includes('503')||e.message.includes('429'));
      if(key){
        // Fallback sang Claude khi Gemini quá tải
        console.warn('Chuyển sang Claude backup...');
        reply=await callClaude(txt,imgs,m);
      } else if(isOverload){
        // Không có Claude key - retry sau 3 giây
        await new Promise(res=>setTimeout(res,3000));
        try{
          reply=await callGemini(txt,imgs);
        }catch(e2){
          throw new Error('Gemini đang quá tải, thử lại sau vài phút hoặc thêm Claude API key làm backup.');
        }
      } else {
        throw e;
      }
    }
  }
  else if(key){reply=await callClaude(txt,imgs,m);}
  else throw new Error('Chưa có API key.');
  m.history.push({role:'assistant',content:reply});SM(m);return reply;
}

function parseReply(text,con){
  const ms=[];
  let c=text.replace(/\[MISSION:([^\]]+)\]/g,(_,x)=>{ms.push(x.trim());return'';});
  const xuN=(c.match(/\[\+XU_NHANH\]/g)||[]).length;
  c=c.replace(/\[\+XU_NHANH\]/g,'<span style="color:var(--gold);font-weight:700;">🚀+15 xu</span>');
  const xpN=(c.match(/\[\+XP\]/g)||[]).length;
  c=c.replace(/\[\+XP\]/g,'<span class="gr">⚡+5 xu</span>');
  const bm=c.match(/\[BADGE:([^\]]+)\]/);let badge=null;
  if(bm){badge=bm[1].trim();c=c.replace(/\[BADGE:[^\]]+\]/,'');}
  const mb=document.createElement('div');mb.className='mb';mb.innerHTML=c.trim().replace(/\n/g,'<br>');con.appendChild(mb);
  if(ms.length){const card=document.createElement('div');card.className='mcard';card.innerHTML='<div class="mcardtitle">⚡ NHIỆM VỤ HÔM NAY</div>';ms.forEach(t=>{const it=document.createElement('div');it.className='mitem';it.innerHTML='<div class="mchk" onclick="chk(this)">○</div><span>'+t+'</span>';card.appendChild(it);});con.appendChild(card);}
  if(badge){const m=M();if(!m.badges.includes(badge)){m.badges.push(badge);SM(m);updateUI();const bd=document.createElement('div');bd.className='bdg';bd.innerHTML='<div class="bdgi">🏅</div><div class="bdgn">HUY HIỆU: '+badge.toUpperCase()+'</div>';con.appendChild(bd);}}
  if(xuN>0){addXu(xuN*15);addXP(xuN*15);}
  if(xpN>0){addXu(xpN*5);addXP(xpN*10);const m=M();m.missions+=xpN;SM(m);updateUI();}
}

async function startChat(){
  const m=M();
  const hw=HW().filter(h=>new Date(h.ts).toDateString()===new Date().toDateString());
  const hwN=hw.length?'\nMẹ đã gửi '+hw.length+' bài tập hôm nay.':'';
  const isFirst=m.sessions<=1;
  const p=isFirst?'[Lần đầu Kua dùng app. Giới thiệu ngắn kiểu Fury, tạo 3 mission phù hợp lớp 4, hỏi muốn học môn gì.'+hwN+']':'[Kua quay lại, streak '+m.streak+' ngày. Chào ngắn kiểu Fury, nhắc 1 điểm từ buổi trước, hỏi hôm nay học gì.'+hwN+' Tối đa 3 câu.]';
  showTyp();
  try{const r=await callAI(p);hideTyp();addAIMsg(r);}
  catch(e){hideTyp();addRaw('ai','Xin chào Agent Parker! Anh Fury đây. Hôm nay luyện môn gì?');}
}

function qs(t){document.getElementById('txtIn').value=t;doSend();}

async function doSend(){
  const el=document.getElementById('txtIn'),txt=el.value.trim(),imgs=[...imgArr];
  if((!txt&&!imgs.length)||busy)return;
  el.value='';resize(el);clearImg();stopSpeak();
  addUserMsg(txt,imgs);showTyp();busy=true;document.getElementById('sendBtn').disabled=true;
  try{const r=await callAI(txt,imgs);hideTyp();addAIMsg(r);speak(r);}
  catch(e){hideTyp();addRaw('ai','⚠️ Lỗi: '+e.message);}
  busy=false;document.getElementById('sendBtn').disabled=false;
}

function onKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();doSend();}}

function onImg(inp){
  const files=Array.from(inp.files);if(!files.length)return;
  const prev=document.getElementById('iPrev');prev.style.display='flex';
  files.forEach(f=>{
    const r=new FileReader();
    r.onload=e=>{
      imgArr.push(e.target.result.split(',')[1]);
      const img=document.createElement('img');img.src=e.target.result;img.style.cssText='max-height:80px;border-radius:7px;border:1px solid var(--bd);';
      const wrap=document.createElement('div');wrap.style.cssText='position:relative;display:inline-block;';
      const rm=document.createElement('button');rm.textContent='✕';rm.style.cssText='position:absolute;top:-5px;right:-5px;background:var(--red);border:none;border-radius:50%;width:16px;height:16px;color:#fff;font-size:9px;cursor:pointer;';
      const idx=imgArr.length-1;rm.onclick=()=>{imgArr.splice(idx,1);wrap.remove();if(!imgArr.length)prev.style.display='none';};
      wrap.appendChild(img);wrap.appendChild(rm);prev.appendChild(wrap);
    };r.readAsDataURL(f);
  });inp.value='';
}

function resize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,80)+'px';}

function clearImg(){imgArr=[];const p=document.getElementById('iPrev');p.innerHTML='';p.style.display='none';}

function chk(el){el.classList.toggle('done');el.textContent=el.classList.contains('done')?'✓':'○';if(el.classList.contains('done')){addXu(5);const m=M();m.missions+=1;SM(m);updateUI();}}

function initVoice(){
  const S=window.SpeechRecognition||window.webkitSpeechRecognition;if(!S)return;
  SR=new S();SR.lang='vi-VN';SR.continuous=false;SR.interimResults=false;
  SR.onresult=e=>{document.getElementById('txtIn').value=e.results[0][0].transcript;stopMic();doSend();};
  SR.onend=()=>stopMic();SR.onerror=()=>stopMic();
  window.speechSynthesis&&window.speechSynthesis.getVoices();
}

function toggleMic(){
  if(isRec){stopMic();return;}
  if(!SR){addRaw('ai','⚠️ Dùng Chrome để nhận giọng nói nhé em!');return;}
  stopSpeak();try{SR.start();}catch(e){return;}
  isRec=true;document.getElementById('micBtn').classList.add('on');document.getElementById('micBtn').textContent='⏹';
}

function stopMic(){try{SR&&SR.stop();}catch(e){}isRec=false;document.getElementById('micBtn').classList.remove('on');document.getElementById('micBtn').textContent='🎤';}


// ═══ ACTIVATE / KEY ═══
function activate(){
  const rawG=document.getElementById('gemTA').value;const rawC=document.getElementById('keyTA').value;
  const gk=rawG.replace(/\s+/g,'').trim();const ck=rawC.replace(/\s+/g,'').trim();
  const err=document.getElementById('serr');const btn=document.getElementById('actBtn');
  if(!gk&&!ck){err.textContent='Cần ít nhất 1 API key.';return;}
  if(gk&&gk.startsWith('sk-ant-')){err.textContent='⚠️ Paste Gemini key (AIzaSy...) vào ô Gemini.';return;}
  if(ck&&ck.startsWith('AIzaSy')){err.textContent='⚠️ Paste Claude key (sk-ant-...) vào ô Claude.';return;}
  err.textContent='';btn.disabled=true;btn.textContent='✓ Đang khởi động...';
  if(gk)localStorage.setItem(K.gem,gk);
  if(ck)localStorage.setItem(K.api,ck);
  gemKey=gk;key=ck;
  setTimeout(()=>{btn.disabled=false;boot();},400);
}
function doChangeKey(){
  localStorage.removeItem(K.api);localStorage.removeItem(K.gem);key='';gemKey='';
  document.getElementById('app').style.display='none';
  document.getElementById('setup').style.display='flex';
  document.getElementById('keyTA').value='';document.getElementById('gemTA').value='';
  document.getElementById('serr').textContent='';
  const btn=document.getElementById('actBtn');btn.disabled=false;btn.textContent='🔓 KÍCH HOẠT HỆ THỐNG';
}

// ═══ BOOT ═══
function boot(){
  document.getElementById('setup').style.display='none';
  const app=document.getElementById('app');app.style.display='flex';app.style.flexDirection='column';
  const m=M(),today=new Date().toDateString(),yest=new Date(Date.now()-86400000).toDateString();
  if(m.lastDay!==today){m.streak=m.lastDay===yest?m.streak+1:1;m.lastDay=today;m.sessions+=1;SM(m);}
  const r=room();document.getElementById('sRoom').textContent=r;document.getElementById('pRoom').textContent=r;
  initVoice();updateUI();updateXuUI();startChat();setTimeout(renderExamBannerInChat,500);
}

// ═══ SYSTEM PROMPT ═══
// ═══ HỒ SƠ HỌC SINH (lưu trên máy, KHÔNG nằm trong code công khai) ═══
function getProfile(){
  try{var p=JSON.parse(localStorage.getItem('kua_profile')||'{}');}catch(e){var p={};}
  return {
    ten: p.ten||'Kua', lop: p.lop||'4', truong: p.truong||'',
    tuoi: p.tuoi||'9-10 tuổi', soThich: p.soThich||'bơi, bóng đá, cờ vua',
    tinhCach: p.tinhCach||'năng động, đôi khi mất tập trung',
    ghiChu: p.ghiChu||''
  };
}
function saveProfile(p){localStorage.setItem('kua_profile',JSON.stringify(p));}

// ═══ PIN PHỤ HUYNH — bắt buộc tự đặt, không có PIN mặc định ═══
function checkParentPin(pin){
  var saved=localStorage.getItem('parent_pin');
  if(!saved){
    var p1=prompt('Lần đầu sử dụng: hãy ĐẶT mã PIN phụ huynh (4-6 số):');
    if(!p1||p1.trim().length<4){alert('PIN phải có ít nhất 4 số.');return false;}
    var p2=prompt('Nhập lại PIN để xác nhận:');
    if(p1.trim()!==(p2||'').trim()){alert('Hai lần nhập không khớp.');return false;}
    localStorage.setItem('parent_pin',p1.trim());
    alert('✅ Đã đặt PIN. Hãy ghi nhớ!');
    return true;
  }
  return (pin||'').trim()===saved;
}

// Nhiệt độ thông minh: câu hỏi toán cần chính xác → temperature thấp
function smartTemp(){
  try{
    var last=(typeof convo!=='undefined'&&convo.length)?JSON.stringify(convo.slice(-2)):'';
    if(/toán|tính|phép|\d+\s*[x×+\-:÷]\s*\d+|phân số|chia|nhân|cộng|trừ|\[LUYỆN TẬP\]/i.test(last))return 0.35;
  }catch(e){}
  return 0.7;
}
function sys(){
  const m=M(),lv=Math.floor(m.xp/100)+1;
  const hw=HW().filter(h=>new Date(h.ts).toDateString()===new Date().toDateString());
  const hwTxt=hw.length?'\\nBÀI TẬP MẸ GỬI HÔM NAY (Fury ĐÃ BIẾT, không hỏi lại):\\n'+hw.map((h,i)=>(i+1)+'. '+h.text).join('\\n'):'\\nBÀI TẬP: Mẹ chưa gửi hôm nay.';
  // Lấy lý thuyết SGK theo số bài
  var sgkContext='';
  try{
    var _hwAll=hw.map(function(h){return h.text;}).join(' ');
    var _bNums=[],_rr=/b\u00e0i\s*(\d+)/gi,_mm;
    while((_mm=_rr.exec(_hwAll))!==null){
      var _nb=parseInt(_mm[1]);
      if(_nb>=38&&_nb<=73&&_bNums.indexOf(_nb)<0) _bNums.push(_nb);
    }
    if(_bNums.length){
      sgkContext='\\nNỘI DUNG SGK (Fury đọc kỹ, dạy đúng phương pháp):\\n';
      _bNums.slice(0,3).forEach(function(b){
        var _c=traCuuSachTheoBai('sgk',b);
        if(_c) sgkContext+='[SGK Bài '+b+']:\n'+_c.slice(0,800)+'\n';
      });
      if(sgkContext.length>2500) sgkContext=sgkContext.slice(0,2500)+'...';
    }
  }catch(_e){sgkContext='';}
  const now=new Date();
  const thu=['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
  const thuNgay=thu[now.getDay()];
  const ngayMai=thu[(now.getDay()+1)%7];
  const h=now.getHours();
  const buoi=h<11?'sáng':h<13?'trưa':h<18?'chiều':'tối';
  const thoiGian=thuNgay+' ngày '+now.getDate()+'/'+(now.getMonth()+1)+'/'+now.getFullYear()+', '+h+':'+now.getMinutes().toString().padStart(2,'0')+' (buổi '+buoi+')';
  const _keyMap=['tcn','t2','t3','t4','t5','t6','t7'];
  const _activeTKB=getActiveTKB?getActiveTKB():TKB_DEFAULT;
  const _activeEXTRA=getActiveEXTRA?getActiveEXTRA():EXTRA_DEFAULT;
  const tkbNgayMai=_activeTKB[_keyMap[(now.getDay()+1)%7]]||[];
  const extraNgayMai=_activeEXTRA[_keyMap[(now.getDay()+1)%7]]||'';
  const ngayMaiInfo=thuNgay==='Thứ Bảy'||thuNgay==='Chủ Nhật'?ngayMai+' không có lịch học chính':ngayMai+': '+tkbNgayMai.filter(s=>s!=='—').join(', ')+(extraNgayMai?' | Học thêm: '+extraNgayMai:'');
  var examInfo='';
  try{
    var exs=getExams?getExams():[];
    var tod=new Date(new Date().toDateString());
    var up=exs.filter(function(e){return new Date(e.date+'T00:00:00')>=tod;})
      .sort(function(a,b){return new Date(a.date)-new Date(b.date);});
    if(up.length){
      examInfo='LỊCH THI SẮP TỚI (chỉ nhắc đầu buổi học hoặc khi Kua hỏi, KHÔNG nhắc lại mỗi tin):\n';
      up.slice(0,5).forEach(function(e){
        var d=Math.round((new Date(e.date+'T00:00:00')-tod)/86400000);
        examInfo+='- '+e.subject+' ('+(e.type==='gk'?'Giữa kỳ':'Học kỳ')+') '+e.date+(e.note?' - '+e.note:'')+' → còn '+d+' ngày\n';
      });
    }
  }catch(err){}
  return 'THỜI GIAN: '+thoiGian+'\\n'
    +'NGÀY MAI: '+ngayMaiInfo+'\\n'
    +examInfo+'\\n'
    +'NGÔN NGỮ: Luôn trả lời TIẾNG VIỆT 100%. Chỉ dùng tiếng Anh khi dạy từ vựng tiếng Anh.\\n\\n'
    +'VAI: Anh là Nick Fury — Giám đốc Shield, huấn luyện Peter Parker (biệt danh của học trò) trở thành Spider-Man.\\n\\n'
    +(function(){var p=getProfile();return 'VỀ HỌC TRÒ: Biệt danh '+p.ten+', lớp '+p.lop+(p.truong?', trường '+p.truong:'')+', '+p.tuoi+'. Sở thích: '+p.soThich+'. Tính cách: '+p.tinhCach+(p.ghiChu?'. Lưu ý: '+p.ghiChu:'')+'.';})()+'\n'
    +hwTxt+'\\n'+(localStorage.getItem('weak_summary')?'DẠNG BÀI EM ĐANG CẦN LUYỆN THÊM (anh lồng ghép ôn nhẹ nhàng khi trò chuyện, khen khi em làm được, KHÔNG bao giờ chê yếu): '+localStorage.getItem('weak_summary')+'\\n':'')+'\\n'
    +'TIẾN ĐỘ: Level '+lv+' | '+m.xp+' XP | Streak '+m.streak+' ngày | Missions: '+m.missions+'\\n\\n'
    +'CÁCH GIAO TIẾP:\n'
    +'- Fury xưng "anh", gọi học trò là "em" hoặc "Peter". KHÔNG nói "con", KHÔNG mày/tao.\n'
    +'- Giọng anh trai thân thiết: ấm áp, hài hước, tôn trọng. Nói như người thật đang trò chuyện, KHÔNG như máy đọc kịch bản.\n'
    +'- Dùng từ ngữ tự nhiên của người Việt: "ơ hay", "đấy nhé", "chuẩn luôn", "thử xem nào". Thỉnh thoảng đùa nhẹ theo phong cách siêu anh hùng.\n'
    +'- Khi em làm đúng: khen CỤ THỂ điều em làm tốt ("Em tự nhận ra phải nhân trước cộng sau — đỉnh đấy!"), không khen suông "giỏi lắm".\n'
    +'- Khi em sai: KHÔNG chê. Nói "gần đúng rồi" và chỉ ra chỗ chưa ổn như một manh mối trinh thám để em tự phát hiện.\n'
    +'- Khi em nản/lười: đồng cảm trước ("Anh biết bài này nhìn dài thật"), rồi chia nhỏ nhiệm vụ ("Mình chỉ làm câu a thôi, 2 phút").\n'
    +'- Khi đúng nhanh <1 phút: "[+XU_NHANH]" (+15 xu). Khi đúng bình thường: "[+XP]" (+5 xu).\n'
    +'- Tạo nhiệm vụ: "[MISSION:nội dung]". Thưởng huy hiệu: "[BADGE:tên]".\n\n'
    +'QUY TẮC TRẢ LỜI — QUAN TRỌNG NHẤT:\n'
    +'1. TRẢ LỜI THẲNG: em hỏi gì → trả lời ngay ý đó. KHÔNG tóm tắt lại câu hỏi, KHÔNG lặp lại đề bài.\n'
    +'2. KHÔNG hỏi lại điều đã biết: em đã chụp ảnh/nói nội dung là Fury ĐÃ ĐỌC.\n'
    +'3. KHÔNG nhắc lịch thi/bài tập mỗi tin — chỉ ở tin đầu buổi hoặc khi em hỏi.\n'
    +'4. KHÔNG lặp câu hỏi đã hỏi. Đã hỏi thì kiên nhẫn chờ.\n'
    +'5. NGẮN GỌN: 2-5 câu ngắn cho mỗi tin. Số và phép tính viết rõ ràng, xuống dòng khi cần. Cuối tin chỉ 1 câu hỏi.\n'
    +'6. CHÍNH XÁC TUYỆT ĐỐI VỀ TOÁN: tự tính lại trong đầu trước khi nói. Nếu không chắc, tính từng bước rõ ràng.\n\n'
    +'QUY TẮC DẠY HỌC:\n'
    +'1. GỢI MỞ TỪNG BƯỚC: không bao giờ cho đáp án ngay. Hỏi "Bài cho biết gì? Bài hỏi gì? Em định làm phép tính nào?" — mục tiêu em TỰ TƯ DUY.\n'
    +'2. THANG GỢI Ý 3 BẬC khi em bí: bậc 1 câu hỏi gợi mở → bậc 2 gợi ý phép tính → bậc 3 làm mẫu bước đầu, em làm nốt. Chỉ nâng bậc khi em vẫn bí.\n'
    +'3. SAU MỖI BÀI đúng: nhắc chép vào vở ("Chép đi, anh chờ 3 phút!").\n'
    +'4. NHIỀU ẢNH: đọc hết, liệt kê Bài 1, Bài 2... làm lần lượt từng bài.\n'
    +'5. DẠY THEO SGK Kết nối tri thức lớp 4: khi có NỘI DUNG SGK trong context, dạy đúng phương pháp sách, không dạy cách khác.\n'
    +'6. KHI EM ĐANG LUYỆN TẬP TRONG APP (tin bắt đầu bằng [LUYỆN TẬP]): em đang làm bài trắc nghiệm/tự luận có sẵn. Fury chỉ gợi ý theo thang 3 bậc, TUYỆT ĐỐI không nói đáp án.'
    +'\n\nPHƯƠNG PHÁP SƯ PHẠM — dạy ĐÚNG CÁCH giáo viên GDPT 2018 được đào tạo (rất quan trọng, để cách anh dạy khớp với cách cô dạy trên lớp):\n'
    +'1. TIẾN TRÌNH 4 BƯỚC với mỗi kiến thức mới: Khởi động (gợi 1 tình huống thực tế em từng gặp) → Khám phá (dẫn dắt bằng ví dụ CỤ THỂ, TRỰC QUAN để em TỰ phát hiện quy tắc — không đọc quy tắc trước) → Luyện tập (làm mẫu 1 câu, em làm câu tương tự) → Vận dụng (đố em áp dụng vào đời thực).\n'
    +'2. TOÁN: đi từ CỤ THỂ đến TRỪU TƯỢNG — luôn mở đầu bằng vật thật/hình ảnh gần gũi (viên bi, quả bóng, tiền, cầu thủ...) rồi mới sang con số. Đúng trình tự và ký hiệu của SGK Kết nối tri thức.\n'
    +'3. GIẢI TOÁN CÓ LỜI VĂN đúng 4 bước cô dạy trên lớp: (1) Đọc kỹ đề, tóm tắt: "Bài cho biết gì? Bài hỏi gì?" (2) Lập kế hoạch: "Muốn tìm cái đó cần biết gì trước? Dùng phép tính nào?" (3) Trình bày đúng mẫu vở: dòng "Bài giải" → câu lời giải → phép tính kèm đơn vị → "Đáp số:". (4) Thử lại: "Kết quả có hợp lý không? Thử ngược xem đúng chưa?" — LUÔN nhắc em trình bày đủ 3 phần lời giải, phép tính, đáp số.\n'
    +'4. TIẾNG VIỆT: đọc hiểu theo quy trình đọc đúng trước → tìm hiểu bài bằng câu hỏi từ dễ đến khó (chi tiết → ý chính → liên hệ bản thân). Luyện từ và câu dạy kiểu QUY NẠP: đưa ví dụ trước, để em tự nhận xét điểm chung, rồi mới chốt ghi nhớ như SGK.\n'
    +'5. ĐÁNH GIÁ kiểu Thông tư 27: nhận xét CỤ THỂ điều em làm được + đúng 1 điều cần cố gắng. KHÔNG chấm điểm số, KHÔNG chê, KHÔNG so sánh em với bạn khác.'
    +(sgkContext||'');
}

// ═══════════════════════════════════════════════
// TKB & LỊCH THI SYSTEM
// ═══════════════════════════════════════════════

// Default TKB (chỉnh trong tab TKB)
var TKB_DEFAULT = {
  t2: ['Chào cờ','Toán','Tiếng Việt','Tiếng Việt','Tiếng Anh'],
  t3: ['Toán','Tiếng Việt','Khoa học','Đạo đức','Tin học'],
  t4: ['Toán','Tiếng Việt','Lịch sử & Địa lý','Mĩ thuật','—'],
  t5: ['Toán','Tiếng Việt','Khoa học','Thể dục','—'],
  t6: ['Toán','Tiếng Việt','Tiếng Anh','Âm nhạc','Sinh hoạt'],
  t7: [],
  tcn: []
};

var EXTRA_DEFAULT = {
  t2:'', t3:'', t4:'', t5:'', t6:'', t7:'', tcn:''
};

var DAYS_LABEL = {
  t2:'Thứ Hai', t3:'Thứ Ba', t4:'Thứ Tư', t5:'Thứ Năm', t6:'Thứ Sáu', t7:'Thứ Bảy', tcn:'Chủ Nhật'
};
var DAYS_ORDER = ['t2','t3','t4','t5','t6','t7','tcn'];
var DAY_JS_MAP = {0:'tcn',1:'t2',2:'t3',3:'t4',4:'t5',5:'t6',6:'t7'};

// Lưu/load TKB từ localStorage
function getTKB(){
  try{
    var s = localStorage.getItem('kua_tkb');
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(TKB_DEFAULT));
  }catch(e){ return JSON.parse(JSON.stringify(TKB_DEFAULT)); }
}
function saveTKB(d){ localStorage.setItem('kua_tkb', JSON.stringify(d)); }

function getEXTRA(){
  try{
    var s = localStorage.getItem('kua_extra');
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(EXTRA_DEFAULT));
  }catch(e){ return JSON.parse(JSON.stringify(EXTRA_DEFAULT)); }
}
function saveEXTRA(d){ localStorage.setItem('kua_extra', JSON.stringify(d)); }

// Lịch thi: [{id, subject, type:'gk'|'hk', date:'YYYY-MM-DD', note}]
function getExams(){
  try{
    var s = localStorage.getItem('kua_exams');
    return s ? JSON.parse(s) : [];
  }catch(e){ return []; }
}
function saveExams(d){ localStorage.setItem('kua_exams', JSON.stringify(d)); }

// ═══ TOGGLE TKB POPUP ═══
var _tkbTab = 'main';
function toggleTKB(){
  var p = document.getElementById('tkbPopup');
  if(p.style.display==='flex'){p.style.display='none';return;}
  p.style.display='flex';
  switchTkbTab(_tkbTab);
}

function switchTkbTab(tab){
  _tkbTab = tab;
  ['main','exam','edit'].forEach(function(t){
    var el = document.getElementById('tabTkb'+t.charAt(0).toUpperCase()+t.slice(1));
    if(el) el.classList.toggle('active', t===tab);
  });
  var c = document.getElementById('tkbContent');
  if(!c) return;
  if(tab==='main') renderTKBMain(c);
  else if(tab==='exam') renderExamView(c);
  else if(tab==='edit') renderTKBEdit(c);
}

// ═══ TAB 1: Xem TKB chính ═══
function renderTKBMain(container){
  var tkb = getTKB();
  var extra = getEXTRA();
  var today = DAY_JS_MAP[new Date().getDay()];
  var exams = getExams();
  
  // Banner lịch thi gần nhất
  var upcoming = exams.filter(function(e){
    var d = new Date(e.date+'T00:00:00');
    return d >= new Date(new Date().toDateString());
  }).sort(function(a,b){ return new Date(a.date)-new Date(b.date); });
  
  var bannerHtml = '';
  if(upcoming.length > 0){
    var next = upcoming[0];
    var days = Math.round((new Date(next.date+'T00:00:00') - new Date(new Date().toDateString()))/(86400000));
    var urgentClass = days <= 3 ? 'style="animation:pulse 1s infinite;"' : '';
    bannerHtml = '<div class="exam-banner" onclick="switchTkbTab(\'exam\')">'
      + '<div class="exam-banner-icon">🎯</div>'
      + '<div class="exam-banner-text">'
      + '<div class="exam-banner-title">THI SẮP TỚI: ' + next.subject.toUpperCase() + '</div>'
      + '<div class="exam-banner-sub">' + (next.type==='gk'?'Giữa kỳ':'Học kỳ') + ' · ' + formatDate(next.date) + (next.note?' · '+next.note:'') + '</div>'
      + '</div>'
      + '<div class="exam-banner-days" '+urgentClass+'>' + days + '<br><small style="font-size:10px;font-weight:400;">ngày</small></div>'
      + '</div>';
  }
  
  var html = bannerHtml;
  DAYS_ORDER.forEach(function(dk){
    var subjects = tkb[dk] || [];
    var ex = extra[dk] || '';
    var isToday = dk === today;
    html += '<div class="tkb-day-row" style="' + (isToday?'border:1.5px solid var(--blue2);':'') + '">'
      + '<div class="tkb-day-label" style="' + (isToday?'color:var(--blue2);':'') + '">'
      + (isToday?'▶ ':'') + DAYS_LABEL[dk]
      + (isToday?' <span style="font-size:10px;color:var(--blue2);font-weight:400;">(Hôm nay)</span>':'')
      + '</div>';
    
    if(subjects.length === 0 || (subjects.length===1 && subjects[0]==='—')){
      html += '<div style="font-size:11px;color:var(--tx3);font-style:italic;">Nghỉ học</div>';
    } else {
      html += '<div class="tkb-subjects">';
      subjects.filter(function(s){return s&&s!=='—';}).forEach(function(s,i){
        html += '<span class="tkb-subject-chip" style="background:var(--s3);">' + (i+1) + '. ' + s + '</span>';
      });
      html += '</div>';
    }
    
    if(ex){
      html += '<div class="tkb-extra-row">🏫 <span style="color:var(--green);">Học thêm:</span> ' + ex + '</div>';
    }
    html += '</div>';
  });
  
  container.innerHTML = html;
}

// ═══ TAB 2: Lịch thi ═══
function renderExamView(container){
  var exams = getExams();
  var today = new Date(new Date().toDateString());
  exams.sort(function(a,b){ return new Date(a.date)-new Date(b.date); });
  
  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'
    + '<div style="font-size:12px;color:var(--tx2);">Quản lý lịch thi của Kua</div>'
    + '<button onclick="showAddExamForm()" style="background:var(--red);border:none;border-radius:8px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:12px;padding:6px 14px;cursor:pointer;">+ Thêm thi</button>'
    + '</div>';
  
  if(exams.length === 0){
    html += '<div style="text-align:center;padding:30px;color:var(--tx3);font-size:13px;">'
      + '<div style="font-size:40px;margin-bottom:8px;">🎯</div>'
      + '<div>Chưa có lịch thi nào</div>'
      + '<div style="font-size:11px;margin-top:4px;">Bấm "+ Thêm thi" để cài đặt</div>'
      + '</div>';
  } else {
    exams.forEach(function(e, idx){
      var examDate = new Date(e.date+'T00:00:00');
      var days = Math.round((examDate - today) / 86400000);
      var isPassed = days < 0;
      var isUrgent = !isPassed && days <= 3;
      var cdText = isPassed ? 'Đã qua' : (days === 0 ? 'HÔM NAY!' : days + ' ngày');
      
      html += '<div class="exam-card' + (isPassed?' passed':'') + (isUrgent?' urgent':'') + '">'
        + '<div class="exam-card-type ' + (e.type==='gk'?'gk':'') + '">'
        + (e.type==='gk'?'GIỮA KỲ':'HỌC KỲ') + '</div>'
        + '<div class="exam-card-subject">' + e.subject + '</div>'
        + '<div class="exam-card-date">📅 ' + formatDate(e.date) + (e.note?' · '+e.note:'') + '</div>'
        + '<div class="exam-card-countdown' + (isUrgent?' urgent':'') + '">'
        + (isPassed ? '<span style="font-size:14px;">✓</span>' : cdText)
        + '<small>' + (isPassed ? 'Đã thi' : (days===0?'':'ngày')) + '</small>'
        + '</div>'
        + '<button onclick="deleteExam(' + idx + ')" style="position:absolute;bottom:8px;right:10px;background:transparent;border:none;color:var(--tx3);font-size:11px;cursor:pointer;padding:2px 6px;">✕ Xoá</button>'
        + '</div>';
    });
  }
  
  container.innerHTML = html;
}

function formatDate(dateStr){
  var d = new Date(dateStr+'T00:00:00');
  var thu = ['CN','T2','T3','T4','T5','T6','T7'];
  return thu[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
}

function showAddExamForm(){
  var pop = document.createElement('div');
  pop.id = 'addExamPop';
  pop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';
  pop.innerHTML = '<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:16px;padding:20px;max-width:360px;width:100%;">'
    + '<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;color:var(--gold);margin-bottom:14px;">🎯 THÊM LỊCH THI</div>'
    + '<div style="margin-bottom:10px;">'
    + '<div style="font-size:11px;color:var(--tx2);margin-bottom:4px;">Môn thi</div>'
    + '<select id="examSubjectSel" style="width:100%;background:var(--s2);border:1px solid var(--bd2);border-radius:8px;color:var(--tx);font-size:13px;padding:8px;outline:none;box-sizing:border-box;">'
    + '<option value="">-- Chọn môn --</option>'
    + '<option>Toán</option><option>Tiếng Việt</option><option>Tiếng Anh</option>'
    + '<option>Khoa học</option><option>Lịch sử & Địa lý</option>'
    + '<option>Đạo đức</option><option>Tin học</option><option>Âm nhạc</option><option>Mĩ thuật</option>'
    + '</select>'
    + '</div>'
    + '<div style="margin-bottom:10px;">'
    + '<div style="font-size:11px;color:var(--tx2);margin-bottom:4px;">Loại thi</div>'
    + '<div style="display:flex;gap:8px;">'
    + '<label style="flex:1;display:flex;align-items:center;gap:6px;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:8px;cursor:pointer;">'
    + '<input type="radio" name="examType" value="gk" checked style="accent-color:var(--blue);"> <span style="font-size:12px;">Giữa kỳ</span></label>'
    + '<label style="flex:1;display:flex;align-items:center;gap:6px;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:8px;cursor:pointer;">'
    + '<input type="radio" name="examType" value="hk" style="accent-color:var(--red);"> <span style="font-size:12px;">Học kỳ</span></label>'
    + '</div></div>'
    + '<div style="margin-bottom:10px;">'
    + '<div style="font-size:11px;color:var(--tx2);margin-bottom:4px;">Ngày thi</div>'
    + '<input type="date" id="examDateIn" style="width:100%;background:var(--s2);border:1px solid var(--bd2);border-radius:8px;color:var(--tx);font-size:13px;padding:8px;outline:none;box-sizing:border-box;">'
    + '</div>'
    + '<div style="margin-bottom:14px;">'
    + '<div style="font-size:11px;color:var(--tx2);margin-bottom:4px;">Ghi chú (tuỳ chọn)</div>'
    + '<input type="text" id="examNoteIn" placeholder="VD: Phòng thi 201, 7h30..." style="width:100%;background:var(--s2);border:1px solid var(--bd2);border-radius:8px;color:var(--tx);font-size:12px;padding:8px;outline:none;box-sizing:border-box;">'
    + '</div>'
    + '<div style="display:flex;gap:8px;">'
    + '<button onclick="document.getElementById(\'addExamPop\').remove()" style="flex:1;background:var(--s3);border:1px solid var(--bd);border-radius:10px;color:var(--tx2);font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;padding:10px;cursor:pointer;">Huỷ</button>'
    + '<button onclick="saveNewExam()" style="flex:2;background:var(--red);border:none;border-radius:10px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;padding:10px;cursor:pointer;">💾 Lưu lịch thi</button>'
    + '</div>'
    + '</div>';
  document.body.appendChild(pop);
  // Set default date = today
  document.getElementById('examDateIn').valueAsDate = new Date();
}

function saveNewExam(){
  var subject = document.getElementById('examSubjectSel').value;
  var type = document.querySelector('input[name="examType"]:checked').value;
  var date = document.getElementById('examDateIn').value;
  var note = document.getElementById('examNoteIn').value.trim();
  
  if(!subject){ alert('Vui lòng chọn môn thi!'); return; }
  if(!date){ alert('Vui lòng chọn ngày thi!'); return; }
  
  var exams = getExams();
  exams.push({ id: Date.now(), subject: subject, type: type, date: date, note: note });
  saveExams(exams);
  document.getElementById('addExamPop').remove();
  renderExamView(document.getElementById('tkbContent'));
}

function deleteExam(idx){
  if(!confirm('Xoá lịch thi này?')) return;
  var exams = getExams();
  exams.splice(idx, 1);
  saveExams(exams);
  renderExamView(document.getElementById('tkbContent'));
}

// ═══ TAB 3: Chỉnh sửa TKB ═══
function renderTKBEdit(container){
  var tkb = getTKB();
  var extra = getEXTRA();
  
  var html = '<div style="font-size:11px;color:var(--tx3);margin-bottom:12px;">✏️ Chỉnh sửa TKB và lịch học thêm trực tiếp</div>';
  
  DAYS_ORDER.forEach(function(dk){
    var subjects = tkb[dk] || [];
    var ex = extra[dk] || '';
    html += '<div class="tkb-day-row">'
      + '<div class="tkb-day-label">' + DAYS_LABEL[dk] + '</div>'
      + '<div class="tkb-subjects" id="chips_' + dk + '">';
    
    subjects.forEach(function(s, si){
      if(!s || s==='—') return;
      html += '<span class="tkb-subject-chip">' + s
        + '<span class="del" onclick="removeSubject(\''+dk+'\','+si+')">&times;</span>'
        + '</span>';
    });
    
    html += '</div>'
      + '<div style="display:flex;gap:6px;margin-bottom:6px;">'
      + '<input type="text" id="addSubj_'+dk+'" placeholder="Thêm môn..." onkeydown="if(event.key===\'Enter\')addSubject(\''+dk+'\')" '
      + 'style="flex:1;background:var(--bg);border:1px solid var(--bd2);border-radius:6px;color:var(--tx);font-size:12px;padding:5px 8px;outline:none;">'
      + '<button onclick="addSubject(\''+dk+'\')" style="background:var(--blue);border:none;border-radius:6px;color:#fff;font-family:Rajdhani,sans-serif;font-size:11px;padding:5px 10px;cursor:pointer;">+ Thêm</button>'
      + '</div>'
      + '<div style="font-size:10px;color:var(--tx3);margin-bottom:4px;">Học thêm:</div>'
      + '<input class="tkb-extra-edit" id="extra_'+dk+'" value="'+ex.replace(/"/g,'&quot;')+'" placeholder="Lịch học thêm..." '
      + 'onblur="saveExtraField(\''+dk+'\')" onkeydown="if(event.key===\'Enter\')saveExtraField(\''+dk+'\')">'
      + '</div>';
  });
  
  html += '<button onclick="resetTKBDefault()" style="width:100%;background:transparent;border:1px dashed var(--bd);border-radius:10px;color:var(--tx3);font-size:11px;padding:8px;cursor:pointer;margin-top:6px;">↩ Khôi phục mặc định</button>';
  
  container.innerHTML = html;
}

function addSubject(dk){
  var input = document.getElementById('addSubj_'+dk);
  var val = input.value.trim();
  if(!val) return;
  var tkb = getTKB();
  if(!tkb[dk]) tkb[dk] = [];
  tkb[dk].push(val);
  saveTKB(tkb);
  input.value = '';
  renderTKBEdit(document.getElementById('tkbContent'));
}

function removeSubject(dk, si){
  var tkb = getTKB();
  if(!tkb[dk]) return;
  // Map si to non-dash index
  var realIdx = -1, count = 0;
  for(var i=0;i<tkb[dk].length;i++){
    if(tkb[dk][i] && tkb[dk][i]!=='—'){
      if(count===si){realIdx=i;break;}
      count++;
    }
  }
  if(realIdx >= 0) tkb[dk].splice(realIdx, 1);
  saveTKB(tkb);
  renderTKBEdit(document.getElementById('tkbContent'));
}

function saveExtraField(dk){
  var input = document.getElementById('extra_'+dk);
  if(!input) return;
  var extra = getEXTRA();
  extra[dk] = input.value.trim();
  saveEXTRA(extra);
}

function resetTKBDefault(){
  if(!confirm('Khôi phục TKB về mặc định?')) return;
  saveTKB(JSON.parse(JSON.stringify(TKB_DEFAULT)));
  saveEXTRA(JSON.parse(JSON.stringify(EXTRA_DEFAULT)));
  renderTKBEdit(document.getElementById('tkbContent'));
  alert('✅ Đã khôi phục TKB mặc định!');
}

// ═══ EXAM COUNTDOWN BANNER trên màn hình chính ═══
function renderExamBannerInChat(){
  var exams = getExams();
  var today = new Date(new Date().toDateString());
  var upcoming = exams.filter(function(e){
    var d = new Date(e.date+'T00:00:00');
    return d >= today;
  }).sort(function(a,b){ return new Date(a.date)-new Date(b.date); });
  
  var banner = document.getElementById('examBannerChat');
  if(!banner) return;
  
  if(upcoming.length === 0){ banner.style.display='none'; return; }
  
  var next = upcoming[0];
  var days = Math.round((new Date(next.date+'T00:00:00') - today) / 86400000);
  var isUrgent = days <= 3;
  
  banner.style.display = 'flex';
  banner.style.background = isUrgent
    ? 'linear-gradient(90deg,rgba(232,25,44,.25),rgba(255,100,0,.15))'
    : 'linear-gradient(90deg,rgba(232,25,44,.12),rgba(255,180,0,.08))';
  
  banner.innerHTML = '<span style="font-size:16px;">🎯</span>'
    + '<span style="flex:1;font-size:11px;color:var(--tx);">'
    + '<b style="color:var(--gold);">THI ' + (next.type==='gk'?'GIỮA KỲ':'HỌC KỲ') + ':</b> '
    + next.subject
    + (upcoming.length>1 ? ' <span style="color:var(--tx3);">+' + (upcoming.length-1) + ' môn</span>' : '')
    + '</span>'
    + '<span onclick="toggleTKB();switchTkbTab(\'exam\')" style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:' + (isUrgent?'16':'14') + 'px;color:' + (isUrgent?'var(--red2)':'var(--gold)') + ';cursor:pointer;"'
    + (isUrgent?' style="animation:pulse 1s infinite;"':'') + '>'
    + days + ' ngày</span>';
}

// Override TKB trong sys() - lấy từ localStorage
var TKB = getTKB();
var EXTRA = getEXTRA();

// Sync TKB/EXTRA mỗi khi sys() gọi
function getActiveTKB(){ return getTKB(); }
function getActiveEXTRA(){ return getEXTRA(); }

function stopSpeak(){if(window.speechSynthesis)window.speechSynthesis.cancel();}
function speakLocal(text){
  if(!window.speechSynthesis)return;stopSpeak();
  const c=text.replace(/\[.*?\]/g,'').replace(/[*_`#<>]/g,'').replace(/\n+/g,' ').replace(/S\.H\.I\.E\.L\.D\./gi,'Shield').trim();if(!c)return;
  const processed=c
    .replace(/(\d+)/g,'$1,')
    .replace(/([+\-×÷=])/g,' $1 ')
    .replace(/,+/g,',')
    .replace(/\.\s/g,'... ')
    .replace(/!\s/g,'!... ');
  const u=new SpeechSynthesisUtterance(processed);u.lang='vi-VN';u.rate=0.82;u.pitch=0.70;
  const vv=window.speechSynthesis.getVoices();
  const vi=vv.find(v=>v.lang==='vi-VN'&&!v.name.toLowerCase().includes('female'))||vv.find(v=>v.lang.startsWith('vi'));
  if(vi)u.voice=vi;
  const spkEl=document.getElementById('spkEl');
  u.onstart=()=>{if(spkEl)spkEl.classList.add('on');};
  u.onend=u.onerror=()=>{if(spkEl)spkEl.classList.remove('on');};
  window.speechSynthesis.speak(u);
}

// ═══ TIMER CHÉP BÀI ═══
let _chepTimer=null;
function startChepTimer(minutes){
  clearTimeout(_chepTimer);
  const ms=(minutes||3)*60*1000;
  _chepTimer=setTimeout(function(){
    qs('[Kua chưa báo chép xong sau '+minutes+' phút. Fury nhắc: Chép xong chưa Peter? Anh đang chờ đây! Chép xong báo anh nhé!]');
  },ms);
}
function stopChepTimer(){clearTimeout(_chepTimer);_chepTimer=null;}
function parseTimerChep(text){
  if(text.includes('chép vào vở')||text.includes('chép bài vào')){startChepTimer(3);}
  return text;
}

// ═══ TRACKING HỌC TẬP ═══
function getStats(){return JSON.parse(localStorage.getItem('kua_stats')||JSON.stringify({sessions:[],today:{date:'',responses:[],avgTime:0,correct:0,total:0}}));}
function saveStats(s){localStorage.setItem('kua_stats',JSON.stringify(s));}
let _lastQuestion=0;
function trackQuestion(){_lastQuestion=Date.now();}
function trackAnswer(isCorrect){
  if(!_lastQuestion)return;
  const elapsed=(Date.now()-_lastQuestion)/1000;
  const s=getStats();
  const today=new Date().toDateString();
  if(s.today.date!==today){if(s.today.date)s.sessions.push({...s.today});if(s.sessions.length>30)s.sessions=s.sessions.slice(-30);s.today={date:today,responses:[],avgTime:0,correct:0,total:0};}
  s.today.responses.push({time:elapsed,correct:isCorrect,ts:Date.now()});
  s.today.total++;if(isCorrect)s.today.correct++;
  const times=s.today.responses.map(r=>r.time);
  s.today.avgTime=Math.round(times.reduce((a,b)=>a+b,0)/times.length);
  saveStats(s);_lastQuestion=0;
}
function showLearningStats(){
  const pin=prompt('Nhập mật khẩu để xem thống kê:');
  if(!pin)return;
  if(!checkParentPin(pin)){alert('❌ Mật khẩu không đúng!');return;}
  const s=getStats(),today=s.today;
  const last7=s.sessions.slice(-7);
  const trend=last7.length>1?(last7[last7.length-1].avgTime<last7[0].avgTime?'⬆️ Nhanh hơn':'⬇️ Chậm hơn'):'—';
  const pop=document.createElement('div');
  pop.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  pop.innerHTML=`<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:18px;padding:22px;max-width:380px;width:100%;max-height:85vh;overflow-y:auto;">
    <div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:18px;color:var(--gold);margin-bottom:14px;">📊 THỐNG KÊ HỌC TẬP</div>
    <div style="background:var(--s2);border-radius:10px;padding:12px;margin-bottom:10px;">
      <div style="font-size:11px;color:var(--tx3);font-family:Rajdhani,sans-serif;text-transform:uppercase;margin-bottom:8px;">HÔM NAY</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--blue2);">${today.total||0}</div><div style="font-size:10px;color:var(--tx3);">Câu trả lời</div></div>
        <div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--green);">${today.total?Math.round((today.correct/today.total)*100):0}%</div><div style="font-size:10px;color:var(--tx3);">Đúng</div></div>
        <div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--gold);">${today.avgTime||0}s</div><div style="font-size:10px;color:var(--tx3);">Thời gian TB</div></div>
        <div style="text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--tx);">${trend}</div><div style="font-size:10px;color:var(--tx3);">Xu hướng 7 ngày</div></div>
      </div>
    </div>
    <button onclick="this.closest('div[style*=fixed]').remove()" style="width:100%;background:var(--red);border:none;border-radius:10px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;padding:10px;cursor:pointer;">Đóng</button>
  </div>`;
  document.body.appendChild(pop);
}

// ═══ SERVICE WORKER — mở nhanh, offline một phần ═══
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}

// Khi có phiên bản mới của app → tự nạp lại trang (sửa lỗi kẹt bản cũ trong cache)
if('serviceWorker' in navigator){
  var _swReloaded=false;
  navigator.serviceWorker.addEventListener('controllerchange',function(){
    if(_swReloaded) return; _swReloaded=true;
    location.reload();
  });
}
