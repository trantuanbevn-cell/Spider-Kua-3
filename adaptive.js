// ═══════════════════════════════════════════════
// HỌC THÍCH ỨNG — nhiệm vụ hằng ngày + chẩn đoán điểm yếu
// Ghi nhớ mọi câu con làm (đúng/sai, thời gian, số gợi ý)
// → tính "độ vững" từng dạng bài → tự trộn bài bổ túc vào hôm sau
// ═══════════════════════════════════════════════

// ── tiện ích ──
function adToday(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function adNames(){ return pcLS('bai_names','{}'); }
function adSaveNames(d,f){ var n=adNames(); (d.bai||[]).forEach(function(b){ n[f+'|'+b.so]=b.ten; }); localStorage.setItem('bai_names',JSON.stringify(n)); }
function adMonOf(f){ return f.indexOf('/toan/')>=0?'toan':f.indexOf('/tv/')>=0?'tv':'ta'; }
function adMonTen(m){ return m==='toan'?'Toán':m==='tv'?'Tiếng Việt':'Tiếng Anh'; }

// ── NHẬT KÝ HỌC: mỗi câu trả lời là 1 dòng ──
function adLog(ok){
  try{
    var q=P.qs[P.qi]; if(!q) return;
    var log=pcLS('luyen_log','[]');
    log.push({ m:P.mon||adMonOf(q._f||P.file||''), f:q._f||P.file, so:(q._so!==undefined?q._so:(P.bai&&P.bai.so)),
               q:q._i, ok:ok?1:0, t:Math.min(300,Math.round((Date.now()-P.t0)/1000)), h:P.hints||0, d:Date.now() });
    localStorage.setItem('luyen_log',JSON.stringify(log.slice(-800)));
    // câu sai trong nhiệm vụ ngày cũng vào danh sách "Ôn lỗi sai"
    if(!ok && P.dailyMode && q._f){
      var w=pcWrong(), rec={f:q._f,so:q._so,q:q._i,mon:adMonOf(q._f)};
      if(!w.some(function(x){return x.f===rec.f&&x.so===rec.so&&x.q===rec.q;})){ w.push(rec); pcSaveWrong(w); }
    }
  }catch(e){}
}

// ── ĐỘ VỮNG từng dạng (0-100): đúng có gợi ý/chậm được tính thấp hơn ──
function adMastery(){
  var log=pcLS('luyen_log','[]'), map={};
  log.forEach(function(e){
    if(!e.f||e.so===undefined) return;
    var k=e.m+'|'+e.f+'|'+e.so;
    var eff=e.ok ? (1-0.15*Math.min(e.h||0,3))*(e.t>90?0.7:(e.t>45?0.85:1)) : 0;
    if(!map[k]) map[k]={s:eff,n:1,last:e.d};
    else { map[k].s=map[k].s*0.6+eff*0.4; map[k].n++; map[k].last=e.d; }
  });
  for(var k in map) map[k].s=Math.round(map[k].s*100);
  return map;
}

// điểm yếu (làm ≥2 lần mà độ vững <55)
function adWeakList(){
  var m=adMastery(), names=adNames(), out=[];
  for(var k in m){ if(m[k].n>=2&&m[k].s<55){
    var p=k.split('|');
    out.push({key:k,mon:p[0],f:p[1],so:p[2],s:m[k].s,ten:names[p[1]+'|'+p[2]]||('Bài '+p[2])});
  }}
  out.sort(function(a,b){return a.s-b.s;});
  return out;
}

// cập nhật tóm tắt điểm yếu cho Fury đọc trong prompt
function adUpdateWeakSummary(){
  var w=adWeakList().slice(0,3);
  if(w.length) localStorage.setItem('weak_summary', w.map(function(x){return adMonTen(x.mon)+' — '+x.ten;}).join('; '));
  else localStorage.removeItem('weak_summary');
}

// ── STREAK nhẹ nhàng: lỡ 1 ngày không mất chuỗi ──
function adStreak(){ return pcLS('daily_streak','{"n":0,"last":""}'); }
function adBumpStreak(){
  var s=adStreak(), t=adToday();
  if(s.last===t) return s;
  var gap=s.last?Math.round((new Date(t)-new Date(s.last))/86400000):99;
  s.n = gap<=2 ? s.n+1 : 1;
  s.last=t;
  localStorage.setItem('daily_streak',JSON.stringify(s));
  return s;
}

// ═══ SINH NHIỆM VỤ HÔM NAY ═══
// Công thức chống chán: 6 câu KIẾN THỨC MỚI theo lộ trình
// + 3 câu BỔ TÚC dạng đang yếu + 2 câu ÔN LẠI dạng đã vững (thắng dễ, tự tin)
function adFilesOf(mon){
  var out=[]; (P.idx[mon].nhom||[]).forEach(function(n){ n.files.forEach(function(f){ out.push(f); }); });
  return out;
}
// Thời lượng buổi học mục tiêu: bắt đầu 20 phút, mỗi tuần +5, tới trần 90 phút (1,5 giờ)
function adTargetMin(){
  var start=localStorage.getItem('study_start');
  if(!start){ start=adToday(); localStorage.setItem('study_start',start); }
  var weeks=Math.floor((Date.now()-new Date(start).getTime())/(7*86400000));
  var cap=parseInt(localStorage.getItem('study_minutes_target')||'90');
  return Math.max(20, Math.min(cap, 20+5*weeks));
}
function adGenRefs(){
  var prog=pcProg(), mast=adMastery(), refs=[];
  // hệ số theo thời lượng: 15 phút ≈ hệ số 1 (≈11 câu), 60 phút ≈ hệ số 4
  var f=Math.max(1, Math.round(adTargetMin()/15));
  // 1) MỚI: mỗi môn f bài kế tiếp chưa làm (mỗi bài 2 câu)
  ['toan','tv','ta'].forEach(function(mon){
    var files=adFilesOf(mon), picked=0;
    for(var i=0;i<files.length && picked<f;i++){
      var done=0; for(var k in prog){ if(k.indexOf(mon+'|'+files[i].f+'|')===0) done++; }
      if(done<files[i].soBai){ refs.push({f:files[i].f,mode:'new',n:2}); picked++; }
    }
  });
  // 2) BỔ TÚC: các dạng yếu nhất, quy mô theo thời lượng
  adWeakList().slice(0,1+f).forEach(function(w,i){ refs.push({f:w.f,so:parseInt(w.so),mode:'weak',n:i===0?2:1}); });
  // 3) ÔN VỮNG: 1 dạng đã vững nhưng >5 ngày chưa đụng (2 câu — thắng dễ)
  var old=null, names=adNames();
  for(var k in mast){
    if(mast[k].s>=75 && (Date.now()-mast[k].last)>5*86400000){ if(!old||mast[k].last<mast[old].last) old=k; }
  }
  if(old){ var p=old.split('|'); refs.push({f:p[1],so:parseInt(p[2]),mode:'review',n:2}); }
  return refs;
}

function adGetMission(){ var ms=pcLS('daily_mission','{}'); return ms.date===adToday()?ms:null; }

function adStartDaily(){
  var ms=adGetMission();
  if(ms&&ms.done){ pcHome(); return; }
  pcBox().innerHTML='<div style="text-align:center;padding:60px 0;color:var(--tx2);">🛡️ Fury đang soạn nhiệm vụ riêng cho em...</div>';
  var go=function(){
    var refs=adGenRefs();
    if(!refs.length){ pcHome(); return; }
    var files={}; refs.forEach(function(r){ files[r.f]=1; });
    var fl=Object.keys(files), loaded={}, cnt=0;
    fl.forEach(function(f){
      fetch(f).then(function(r){return r.json();}).then(function(d){ loaded[f]=d; adSaveNames(d,f); })
      .catch(function(){}).finally(function(){
        cnt++;
        if(cnt===fl.length) adAssemble(refs, loaded);
      });
    });
  };
  if(P.idx) go();
  else fetch('data/index.json').then(function(r){return r.json();}).then(function(d){P.idx=d;go();}).catch(function(){pcHome();});
}

function adAssemble(refs, loaded){
  var prog=pcProg(), wrong=pcWrong(), qs=[];
  refs.forEach(function(r){
    var d=loaded[r.f]; if(!d) return;
    var bai=null;
    if(r.mode==='new'){ // bài đầu tiên chưa có tiến độ
      bai=d.bai.find(function(b){ return !prog[adMonOf(r.f)+'|'+r.f+'|'+b.so]; })||d.bai[0];
    } else {
      bai=d.bai.find(function(b){ return b.so==r.so; });
    }
    if(!bai) return;
    // ưu tiên câu từng sai với dạng yếu
    var idxs=bai.cauHoi.map(function(_,i){return i;});
    if(r.mode==='weak'){
      var wq=wrong.filter(function(x){return x.f===r.f&&x.so==bai.so;}).map(function(x){return x.q;});
      idxs.sort(function(a,b){ return (wq.indexOf(b)>=0?1:0)-(wq.indexOf(a)>=0?1:0) || Math.random()-0.5; });
    } else idxs.sort(function(){return Math.random()-0.5;});
    idxs.slice(0,r.n).forEach(function(i){
      var q=Object.assign({},bai.cauHoi[i]);
      q._i=i; q._f=r.f; q._so=bai.so; q._mode=r.mode;
      qs.push(q);
    });
  });
  if(!qs.length){ pcHome(); return; }
  // trộn: mới trước (đang tỉnh táo), yếu giữa, ôn vững cuối (kết thúc bằng chiến thắng)
  var order={new:0,weak:1,review:2};
  qs.sort(function(a,b){ return order[a._mode]-order[b._mode]; });
  localStorage.setItem('daily_mission',JSON.stringify({date:adToday(),total:qs.length,done:false}));
  P.qs=qs; P.qi=0; P.review=true; P.dailyMode=true;
  P.bai={so:'⚡',ten:'Nhiệm vụ hôm nay'}; P.sess.ok=0; P.sess.total=0; P.mon='';
  try{ if(typeof genMissionAug==='function') genMissionAug(); }catch(e){}
  pcQ();
}

// ═══ BẢN ĐỒ SỨC MẠNH ═══
function adMap(){
  var mast=adMastery(), names=adNames();
  var h=pcHead('🗺️ BẢN ĐỒ SỨC MẠNH','pcHome()');
  var byMon={toan:[],tv:[],ta:[]};
  for(var k in mast){ var p=k.split('|'); if(byMon[p[0]]) byMon[p[0]].push({so:p[2],f:p[1],s:mast[k].s,n:mast[k].n,ten:names[p[1]+'|'+p[2]]||('Bài '+p[2])}); }
  var any=false;
  ['toan','tv','ta'].forEach(function(mon){
    var arr=byMon[mon]; if(!arr.length) return; any=true;
    arr.sort(function(a,b){return a.s-b.s;});
    var avg=Math.round(arr.reduce(function(s,x){return s+x.s;},0)/arr.length);
    h+='<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:15px;color:var(--tx);margin:16px 0 8px;">'+(P.idx&&P.idx[mon]?P.idx[mon].icon:'')+' '+adMonTen(mon)+' <span style="color:var(--tx3);font-size:12px;">· trung bình '+avg+'%</span></div>';
    arr.forEach(function(x){
      var c=x.s>=75?'var(--green)':x.s>=55?'var(--gold)':'var(--red2)';
      var lbl=x.s>=75?'Vững 💪':x.s>=55?'Đang lên 📈':'Cần luyện 🎯';
      h+='<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:10px;">'
        +'<div style="flex:1;font-size:13px;color:var(--tx);">'+pcEsc(x.ten)+'</div>'
        +'<div style="width:90px;height:6px;background:var(--s3);border-radius:3px;"><div style="height:6px;width:'+x.s+'%;background:'+c+';border-radius:3px;"></div></div>'
        +'<div style="font-size:11px;color:'+c+';width:74px;text-align:right;">'+lbl+'</div></div>';
    });
  });
  if(!any) h+='<div style="text-align:center;color:var(--tx2);padding:40px 0;">Em làm vài nhiệm vụ trước đã — bản đồ sẽ tự hiện ra! 🕸️</div>';
  pcBox().innerHTML=h;
}

// ═══ BÁO CÁO TUẦN CHO BỐ MẸ ═══
function adReport(){
  pcEl().style.display='block';
  var log=pcLS('luyen_log','[]').filter(function(e){return Date.now()-e.d<7*86400000;});
  var h=pcHead('📊 BÁO CÁO 7 NGÀY','closePractice()');
  if(!log.length){ pcBox().innerHTML=h+'<div style="text-align:center;color:var(--tx2);padding:40px 0;">Chưa có dữ liệu tuần này.</div>'; return; }
  var days={}; log.forEach(function(e){ days[new Date(e.d).toDateString()]=1; });
  var mins=Math.round(log.reduce(function(s,e){return s+e.t;},0)/60);
  var okAll=Math.round(log.filter(function(e){return e.ok;}).length/log.length*100);
  h+='<div style="display:flex;gap:8px;margin-bottom:14px;">'
    +[['📆',Object.keys(days).length+' ngày học'],['✏️',log.length+' câu'],['✅',okAll+'% đúng'],['⏱️','~'+mins+' phút']].map(function(x){
      return '<div style="flex:1;background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:12px 6px;text-align:center;"><div style="font-size:20px;">'+x[0]+'</div><div style="font-size:11px;color:var(--tx2);margin-top:4px;">'+x[1]+'</div></div>';
    }).join('')+'</div>';
  ['toan','tv','ta'].forEach(function(mon){
    var l=log.filter(function(e){return e.m===mon;}); if(!l.length) return;
    var ok=Math.round(l.filter(function(e){return e.ok;}).length/l.length*100);
    var avgT=Math.round(l.reduce(function(s,e){return s+e.t;},0)/l.length);
    h+='<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:12px 14px;margin-bottom:8px;">'
      +'<div style="display:flex;justify-content:space-between;"><b style="color:var(--tx);font-size:13.5px;">'+adMonTen(mon)+'</b>'
      +'<span style="font-size:12px;color:'+(ok>=70?'var(--green)':'var(--gold)')+';">'+ok+'% đúng · '+l.length+' câu · TB '+avgT+'s/câu</span></div></div>';
  });
  var w=adWeakList().slice(0,4);
  if(w.length){
    h+='<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;color:var(--red2);margin:14px 0 8px;">🎯 DẠNG CẦN BỔ TÚC (app đang tự trộn vào nhiệm vụ ngày)</div>';
    w.forEach(function(x){ h+='<div style="background:rgba(232,25,44,.07);border:1px solid rgba(232,25,44,.3);border-radius:10px;padding:9px 13px;margin-bottom:6px;font-size:12.5px;color:var(--tx);">'+adMonTen(x.mon)+' — '+pcEsc(x.ten)+' <span style="color:var(--tx3);">('+x.s+'%)</span></div>'; });
  } else h+='<div style="font-size:12.5px;color:var(--green);margin-top:10px;">Chưa phát hiện dạng nào yếu rõ rệt. 👏</div>';
  h+='<div style="font-size:11px;color:var(--tx3);margin-top:14px;line-height:1.7;">Độ vững tính từ: đúng/sai, tốc độ làm, số lần cần gợi ý. Dạng dưới 55% sẽ tự động được trộn vào "Nhiệm vụ hôm nay" cho đến khi vững.</div>';
  pcBox().innerHTML=h;
}

// ═══ GẮN VÀO ENGINE CŨ (không sửa practice.js nhiều) ═══
// 1) Ghi log mỗi khi có kết quả câu hỏi
var _pcFb_core=pcFb;
pcFb=function(ok,msg,xuTxt){
  if(P._loggedQ!==P.qi){ adLog(ok); P._loggedQ=P.qi; }
  _pcFb_core(ok,msg,xuTxt);
};
var _pcQ_core=pcQ;
pcQ=function(){ P._loggedQ=-1; _pcQ_core(); };

// 2) Lưu tên bài mỗi khi mở 1 bài (phục vụ bản đồ/báo cáo)
var _pcStart_core=pcStart;
pcStart=function(bi){ try{ if(P.data&&P.file) adSaveNames(P.data,P.file); }catch(e){} P.dailyMode=false; _pcStart_core(bi); };

// 3) Màn hình chính luyện tập: thêm thẻ Nhiệm vụ hôm nay + Bản đồ
var _pcHome_core=pcHome;
pcHome=function(){
  P.dailyMode=false;
  _pcHome_core();
  var ms=adGetMission(), st=adStreak();
  var doneToday=ms&&ms.done;
  var card='<div onclick="adStartDaily()" style="'+pcCard()+'border:2px solid '+(doneToday?'var(--green)':'var(--red)')+';background:linear-gradient(135deg,rgba(232,25,44,.12),rgba(15,76,143,.15));display:flex;align-items:center;gap:14px;">'
    +'<div style="font-size:34px;">'+(doneToday?'✅':'⚡')+'</div><div style="flex:1;">'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:18px;color:'+(doneToday?'var(--green)':'var(--tx)')+';">NHIỆM VỤ HÔM NAY</div>'
    +'<div style="font-size:12px;color:var(--tx2);">'+(doneToday?'Hoàn thành! Chuỗi '+st.n+' ngày 🔥 — mai lại có nhiệm vụ mới':'~'+adTargetMin()+' phút trộn nhiều dạng · xong +30 xu · chuỗi '+st.n+' ngày 🔥')+'</div></div>'
    +'<div style="color:var(--tx3);font-size:20px;">›</div></div>'
    +'<div onclick="adMap()" style="'+pcCard()+'display:flex;align-items:center;gap:14px;">'
    +'<div style="font-size:30px;">🗺️</div><div style="flex:1;">'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;color:var(--tx);">Bản đồ sức mạnh</div>'
    +'<div style="font-size:12px;color:var(--tx3);">Xem dạng nào vững, dạng nào cần luyện</div></div>'
    +'<div style="color:var(--tx3);font-size:20px;">›</div></div>';
  var head=pcBox().children[0];
  if(head) head.insertAdjacentHTML('afterend', card);
};

// 4) Kết thúc phiên: cập nhật điểm yếu + thưởng nhiệm vụ ngày
var _pcFinish_core=pcFinish;
pcFinish=function(){
  var wasDaily=P.dailyMode;
  _pcFinish_core();
  adUpdateWeakSummary();
  if(wasDaily){
    var ms=pcLS('daily_mission','{}');
    if(ms.date===adToday()&&!ms.done){
      ms.done=true; localStorage.setItem('daily_mission',JSON.stringify(ms));
      var st=adBumpStreak();
      pcXu(30);
      var head=pcBox().children[0];
      if(head) head.insertAdjacentHTML('afterend',
        '<div style="background:linear-gradient(135deg,rgba(48,209,88,.15),rgba(245,200,66,.1));border:2px solid var(--green);border-radius:14px;padding:14px;margin-bottom:12px;text-align:center;">'
        +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:17px;color:var(--green);">🎖️ NHIỆM VỤ NGÀY HOÀN THÀNH — +30 XU</div>'
        +'<div style="font-size:13px;color:var(--tx);margin-top:4px;">Chuỗi '+st.n+' ngày liên tiếp 🔥 Fury tự hào về em!</div></div>');
      if(typeof speak==='function') speak('Nhiệm vụ hoàn thành! Chuỗi '+st.n+' ngày. Fury tự hào về em, Peter!');
    }
    P.dailyMode=false;
  }
};

// 5) Nút báo cáo tuần trong khu phụ huynh
setTimeout(function(){
  var ol=document.querySelector('#parentOL .obox');
  if(!ol) return;
  var b=document.createElement('button');
  b.textContent='📊 Báo cáo tuần & dạng bài cần bổ túc';
  b.style.cssText='margin-top:8px;width:100%;background:rgba(48,209,88,.1);border:1px solid var(--green);border-radius:8px;color:var(--green);font-family:Rajdhani,sans-serif;font-weight:700;font-size:12px;padding:8px;cursor:pointer;';
  b.onclick=function(){ document.getElementById('parentOL').style.display='none'; adReport(); };
  ol.appendChild(b);
}, 900);
