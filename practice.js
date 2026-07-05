// ═══════════════════════════════════════════════
// LUYỆN TẬP — ngân hàng bài tập cả năm lớp 4
// Toán · Tiếng Việt · Tiếng Anh (nghe-nói-đọc-viết)
// ═══════════════════════════════════════════════

var P = { idx:null, mon:'', file:'', data:null, bai:null, qs:[], qi:0,
          t0:0, sess:{start:0,ok:0,total:0,xu:0}, hints:0, revealed:false, review:false };

// ── tiện ích ──
function pcLS(k,d){ try{return JSON.parse(localStorage.getItem(k)||d);}catch(e){return JSON.parse(d);} }
function pcProg(){ return pcLS('luyen_prog','{}'); }
function pcSaveProg(p){ localStorage.setItem('luyen_prog',JSON.stringify(p)); }
function pcWrong(){ return pcLS('luyen_sai','[]'); }
function pcSaveWrong(w){ localStorage.setItem('luyen_sai',JSON.stringify(w.slice(-100))); }
function pcNorm(s){ return (s||'').toString().toLowerCase().replace(/[.,!?;:'"()]/g,'').replace(/\s+/g,' ').trim(); }
function pcNormNum(s){ return (s||'').toString().replace(/[\s.]/g,'').replace(',','.').toLowerCase().trim(); }
function pcEsc(s){ var d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
function pcXu(n){ if(typeof addXu==='function') addXu(n); P.sess.xu+=n; }

// ── overlay ──
function pcEl(){ return document.getElementById('pcOverlay'); }
function pcBox(){ return document.getElementById('pcBox'); }

(function(){
  var ov=document.createElement('div');
  ov.id='pcOverlay';
  ov.style.cssText='display:none;position:fixed;inset:0;background:var(--bg,#08090f);z-index:500;overflow-y:auto;';
  ov.innerHTML='<div id="pcBox" style="max-width:560px;margin:0 auto;padding:14px 14px 40px;"></div>';
  document.body.appendChild(ov);
})();

function openPractice(){
  pcEl().style.display='block';
  P.sess={start:Date.now(),ok:0,total:0,xu:0};
  if(P.idx){ pcHome(); return; }
  pcBox().innerHTML='<div style="text-align:center;padding:60px 0;color:var(--tx2);">🕸️ Đang tải kho bài tập...</div>';
  fetch('data/index.json').then(function(r){return r.json();}).then(function(d){ P.idx=d; pcHome(); })
    .catch(function(){ pcBox().innerHTML='<div style="text-align:center;padding:60px 0;color:var(--red2);">Không tải được dữ liệu. Kiểm tra mạng rồi thử lại nhé!</div><div style="text-align:center;"><button onclick="closePractice()" style="'+pcBtn2()+'">Đóng</button></div>'; });
}
function closePractice(){ pcEl().style.display='none'; stopSpeakAll&&stopSpeakAll(); }

// ── style helpers ──
function pcBtn(){ return 'background:var(--red);border:none;border-radius:12px;color:#fff;font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;padding:12px 18px;cursor:pointer;'; }
function pcBtn2(){ return 'background:var(--s2);border:1px solid var(--bd2);border-radius:12px;color:var(--tx);font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;padding:10px 16px;cursor:pointer;'; }
function pcCard(){ return 'background:var(--s1);border:1px solid var(--bd);border-radius:14px;padding:14px;margin-bottom:10px;cursor:pointer;'; }
function pcHead(title, backFn){
  return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;position:sticky;top:0;background:var(--bg);padding:10px 0;z-index:5;">'
    +'<button onclick="'+backFn+'" style="'+pcBtn2()+'padding:8px 14px;">←</button>'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:19px;color:var(--gold);flex:1;">'+title+'</div>'
    +'<div style="color:var(--gold);font-size:13px;">🪙 <span class="xu-count">'+(typeof getXu==='function'?getXu().toLocaleString('vi-VN'):'')+'</span></div>'
    +'<button onclick="closePractice()" style="'+pcBtn2()+'padding:8px 12px;">✕</button></div>';
}

// ── màn 1: chọn môn ──
function pcHome(){
  var w=pcWrong();
  var h=pcHead('🎯 LUYỆN TẬP','closePractice()');
  h+='<div style="font-size:13px;color:var(--tx2);margin-bottom:14px;">Chọn môn em muốn luyện hôm nay. Làm đúng có xu, đúng nhanh xu nhân đôi! ⚡</div>';
  ['toan','tv','ta'].forEach(function(m){
    var M=P.idx[m]; if(!M) return;
    var tot=0,done=0,prog=pcProg();
    M.nhom.forEach(function(n){ n.files.forEach(function(f){ tot+=f.soBai;
      // đếm bài đã làm
      for(var k in prog){ if(k.indexOf(f.f)===0||k.indexOf('|'+f.f+'|')>=0){} }
    });});
    for(var k in prog){ if(k.indexOf(m+'|')===0) done++; }
    h+='<div onclick="pcMon(\''+m+'\')" style="'+pcCard()+'display:flex;align-items:center;gap:14px;">'
      +'<div style="font-size:34px;">'+M.icon+'</div>'
      +'<div style="flex:1;"><div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:18px;color:var(--tx);">'+M.ten+'</div>'
      +'<div style="font-size:12px;color:var(--tx3);">'+tot+' bài luyện · đã làm '+done+'</div></div>'
      +'<div style="color:var(--tx3);font-size:20px;">›</div></div>';
  });
  if(w.length){
    h+='<div onclick="pcReview()" style="'+pcCard()+'border-color:var(--gold);display:flex;align-items:center;gap:14px;">'
      +'<div style="font-size:34px;">🔁</div><div style="flex:1;">'
      +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:18px;color:var(--gold);">Ôn lỗi sai</div>'
      +'<div style="font-size:12px;color:var(--tx3);">'+w.length+' câu em từng sai — sửa hết để lên trình!</div></div>'
      +'<div style="color:var(--tx3);font-size:20px;">›</div></div>';
  }
  pcBox().innerHTML=h;
}

// ── màn 2: chọn chủ đề ──
function pcMon(m){
  P.mon=m; var M=P.idx[m];
  var h=pcHead(M.icon+' '+M.ten.toUpperCase(),'pcHome()');
  M.nhom.forEach(function(n,ni){
    h+='<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;color:var(--tx2);letter-spacing:.08em;text-transform:uppercase;margin:14px 0 8px;">'+n.ten+'</div>';
    n.files.forEach(function(f){
      var prog=pcProg(),db=0;
      for(var k in prog){ if(k.indexOf(m+'|'+f.f+'|')===0) db++; }
      var pct=f.soBai?Math.round(db/f.soBai*100):0;
      h+='<div onclick="pcFile(\''+f.f+'\')" style="'+pcCard()+'">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;">'
        +'<div style="font-weight:700;color:var(--tx);font-size:14px;flex:1;">'+pcEsc(f.chuDe)+'</div>'
        +'<div style="font-size:11px;color:'+(pct===100?'var(--green)':'var(--tx3)')+';">'+db+'/'+f.soBai+(pct===100?' ✓':'')+'</div></div>'
        +'<div style="height:5px;background:var(--s3);border-radius:3px;margin-top:8px;"><div style="height:5px;width:'+pct+'%;background:'+(pct===100?'var(--green)':'var(--blue2)')+';border-radius:3px;"></div></div>'
        +'</div>';
    });
  });
  pcBox().innerHTML=h;
}

// ── màn 3: chọn bài ──
function pcFile(f){
  P.file=f;
  pcBox().innerHTML='<div style="text-align:center;padding:60px 0;color:var(--tx2);">🕸️ Đang tải bài...</div>';
  fetch(f).then(function(r){return r.json();}).then(function(d){
    P.data=d;
    var h=pcHead('📚 '+pcEsc(d.chuDe).toUpperCase(),'pcMon(\''+P.mon+'\')');
    d.bai.forEach(function(b,bi){
      var pr=pcProg()[P.mon+'|'+f+'|'+b.so];
      h+='<div onclick="pcStart('+bi+')" style="'+pcCard()+'display:flex;align-items:center;gap:12px;">'
        +'<div style="width:38px;height:38px;border-radius:10px;background:'+(pr?(pr.best>=80?'rgba(48,209,88,.15)':'rgba(245,200,66,.12)'):'var(--s3)')+';display:flex;align-items:center;justify-content:center;font-family:Rajdhani,sans-serif;font-weight:700;color:'+(pr?(pr.best>=80?'var(--green)':'var(--gold)'):'var(--tx3)')+';">'+b.so+'</div>'
        +'<div style="flex:1;"><div style="font-weight:700;font-size:13.5px;color:var(--tx);">'+pcEsc(b.ten)+'</div>'
        +'<div style="font-size:11px;color:var(--tx3);">'+b.cauHoi.length+' câu'+(pr?' · tốt nhất '+pr.best+'%':'')+'</div></div>'
        +(pr&&pr.best>=80?'<div style="color:var(--green);">🏆</div>':'')
        +'</div>';
    });
    pcBox().innerHTML=h;
  }).catch(function(){ pcBox().innerHTML=pcHead('LỖI','pcMon(\''+P.mon+'\')')+'<div style="color:var(--red2);text-align:center;padding:40px 0;">Không tải được bài. Thử lại nhé!</div>'; });
}

// ── bắt đầu 1 bài ──
function pcStart(bi){
  P.bai=P.data.bai[bi]; P.qs=P.bai.cauHoi.map(function(q,i){q._i=i;return q;});
  P.qi=0; P.review=false; P.sess.ok=0; P.sess.total=0;
  if(P.bai.lyThuyet){
    pcBox().innerHTML=pcHead('BÀI '+P.bai.so,'pcFile(\''+P.file+'\')')
      +'<div style="background:linear-gradient(135deg,rgba(15,76,143,.25),rgba(232,25,44,.08));border:1px solid var(--bd2);border-radius:16px;padding:18px;margin-bottom:16px;">'
      +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;color:var(--gold);font-size:15px;margin-bottom:8px;">🛡️ FURY BRIEFING — '+pcEsc(P.bai.ten)+'</div>'
      +'<div style="font-size:14px;line-height:1.8;color:var(--tx);">'+pcEsc(P.bai.lyThuyet)+'</div>'
      +'<button onclick="speak&&speak(\''+pcEsc(P.bai.lyThuyet).replace(/'/g,"\\'")+'\')" style="'+pcBtn2()+'margin-top:10px;font-size:12px;padding:7px 12px;">🔊 Nghe Fury đọc</button></div>'
      +'<button onclick="pcQ()" style="'+pcBtn()+'width:100%;">⚡ VÀO TRẬN — '+P.qs.length+' CÂU</button>';
  } else pcQ();
}

// ── ôn lỗi sai ──
function pcReview(){
  var w=pcWrong();
  if(!w.length){ pcHome(); return; }
  pcBox().innerHTML='<div style="text-align:center;padding:60px 0;color:var(--tx2);">🕸️ Đang gom các câu em từng sai...</div>';
  var byFile={};
  w.forEach(function(x){ (byFile[x.f]=byFile[x.f]||[]).push(x); });
  var files=Object.keys(byFile), qs=[], loaded=0;
  files.forEach(function(f){
    fetch(f).then(function(r){return r.json();}).then(function(d){
      byFile[f].forEach(function(x){
        var b=d.bai.find(function(b){return b.so===x.so;});
        if(b&&b.cauHoi[x.q]){ var q=Object.assign({},b.cauHoi[x.q]); q._i=x.q; q._f=f; q._so=x.so; qs.push(q); }
      });
    }).catch(function(){}).finally(function(){
      loaded++;
      if(loaded===files.length){
        if(!qs.length){ pcHome(); return; }
        P.qs=qs.slice(0,15); P.qi=0; P.review=true; P.bai={so:'ÔN',ten:'Ôn lỗi sai'}; P.sess.ok=0; P.sess.total=0;
        pcQ();
      }
    });
  });
}

// ── render câu hỏi ──
function pcQ(){
  if(P.qi>=P.qs.length){ pcFinish(); return; }
  var q=P.qs[P.qi]; P.t0=Date.now(); P.hints=0; P.revealed=false;
  var mins=Math.round((Date.now()-P.sess.start)/60000);
  var target=(typeof adTargetMin==='function')?adTargetMin():25;
  var h=pcHead((P.review?'🔁 ÔN LỖI SAI':'BÀI '+P.bai.so)+' · CÂU '+(P.qi+1)+'/'+P.qs.length, P.review?'pcHome()':'pcFile(\''+P.file+'\')');
  // đồng hồ buổi học: luôn hiển thị
  var tPct=Math.min(100,Math.round(mins/target*100));
  h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
    +'<span style="font-size:12px;color:'+(mins>=target?'var(--green)':'var(--tx2)')+';">⏱ '+mins+'/'+target+' phút</span>'
    +'<div style="flex:1;height:4px;background:var(--s3);border-radius:2px;"><div style="height:4px;width:'+tPct+'%;background:'+(mins>=target?'var(--green)':'var(--gold)')+';border-radius:2px;"></div></div></div>';
  if(mins>=target) h+='<div style="background:rgba(48,209,88,.1);border:1px solid var(--green);border-radius:10px;padding:10px;font-size:12px;color:var(--green);margin-bottom:10px;">🎖️ Đủ '+target+' phút hôm nay rồi! Làm nốt câu này rồi nghỉ nhé — cố quá lại thành quá cố đấy Peter!</div>';
  else if(mins>0&&mins%25===0) h+='<div style="background:rgba(245,200,66,.12);border:1px solid var(--gold);border-radius:10px;padding:10px;font-size:12px;color:var(--gold);margin-bottom:10px;">⏰ Học liền '+mins+' phút rồi — nghỉ 5 phút cho mắt khỏe rồi chiến tiếp nhé!</div>';
  h+='<div style="height:6px;background:var(--s3);border-radius:3px;margin-bottom:14px;"><div style="height:6px;width:'+Math.round(P.qi/P.qs.length*100)+'%;background:var(--red);border-radius:3px;transition:width .3s;"></div></div>';

  if(q.type==='mcq'||q.type==='read'||q.type==='listen'){
    if(q.type==='read'&&q.vanBan)
      h+='<div style="background:var(--s1);border:1px solid var(--bd);border-radius:14px;padding:16px;font-size:14px;line-height:1.9;color:var(--tx);margin-bottom:12px;">📄 '+pcEsc(q.vanBan)+'</div>';
    if(q.type==='listen')
      h+='<div style="text-align:center;margin-bottom:14px;"><button onclick="speakEN(\''+pcEsc(q.audioText).replace(/'/g,"\\'")+'\')" style="'+pcBtn()+'background:var(--blue2);font-size:15px;">🎧 BẤM ĐỂ NGHE</button><div style="font-size:11px;color:var(--tx3);margin-top:6px;">Nghe được nhiều lần — nghe kỹ rồi chọn nhé</div></div>';
    h+='<div style="font-size:15.5px;font-weight:700;line-height:1.7;color:var(--tx);margin-bottom:14px;">'+pcEsc(q.q)+'</div>';
    q.options.forEach(function(o,i){
      h+='<button onclick="pcAns('+i+')" id="pcOpt'+i+'" style="display:block;width:100%;text-align:left;background:var(--s1);border:1px solid var(--bd2);border-radius:12px;color:var(--tx);font-size:14.5px;font-family:Nunito,sans-serif;padding:13px 15px;margin-bottom:8px;cursor:pointer;">'
        +'<span style="display:inline-block;width:22px;color:var(--tx3);font-weight:700;">'+String.fromCharCode(65+i)+'</span>'+pcEsc(o)+'</button>';
    });
  }
  else if(q.type==='fill'||q.type==='spell'){
    h+='<div style="font-size:15.5px;font-weight:700;line-height:1.8;color:var(--tx);margin-bottom:14px;">✍️ '+pcEsc(q.q)+'</div>'
      +'<input id="pcIn" type="text" autocomplete="off" style="width:100%;box-sizing:border-box;background:var(--s1);border:2px solid var(--bd2);border-radius:12px;color:var(--tx);font-size:16px;padding:13px 15px;outline:none;font-family:Nunito,sans-serif;" placeholder="Gõ câu trả lời..." onkeydown="if(event.key===\'Enter\')pcCheckIn()">'
      +'<button onclick="pcCheckIn()" style="'+pcBtn()+'width:100%;margin-top:10px;">✔ KIỂM TRA</button>';
  }
  else if(q.type==='speak'){
    h+='<div style="font-size:15.5px;font-weight:700;line-height:1.8;color:var(--tx);margin-bottom:6px;">🗣️ '+pcEsc(q.prompt)+'</div>'
      +'<div style="text-align:center;margin:18px 0;">'
      +'<button id="pcMicBtn" onclick="pcSpeak()" style="'+pcBtn()+'background:var(--blue2);font-size:16px;border-radius:50px;padding:16px 28px;">🎤 BẤM VÀ NÓI</button>'
      +'<div id="pcMicSt" style="font-size:12px;color:var(--tx3);margin-top:10px;min-height:20px;"></div></div>'
      +'<button onclick="speakEN(\''+pcEsc(q.target).replace(/'/g,"\\'")+'\')" style="'+pcBtn2()+'width:100%;font-size:12px;">🔊 Nghe mẫu trước</button>'
      +'<button onclick="pcSkipSpeak()" style="'+pcBtn2()+'width:100%;margin-top:8px;font-size:12px;color:var(--tx3);">Bỏ qua câu này</button>';
  }
  else if(q.type==='solve'){
    h+='<div style="background:var(--s1);border:1px solid var(--bd);border-radius:14px;padding:16px;font-size:14.5px;line-height:1.9;color:var(--tx);margin-bottom:12px;">📝 '+pcEsc(q.de)+'</div>'
      +'<div id="pcHints"></div>'
      +(q.dapSo!=='tự chấm'
        ?'<input id="pcIn" type="text" autocomplete="off" style="width:100%;box-sizing:border-box;background:var(--s1);border:2px solid var(--bd2);border-radius:12px;color:var(--tx);font-size:16px;padding:13px 15px;outline:none;" placeholder="Đáp số của em..." onkeydown="if(event.key===\'Enter\')pcSolveCheck()">'
         +'<button onclick="pcSolveCheck()" style="'+pcBtn()+'width:100%;margin-top:10px;">✔ NỘP ĐÁP SỐ</button>'
        :'<div style="font-size:12px;color:var(--tx2);margin-bottom:8px;">Em làm ra giấy/vở rồi so với bài mẫu nhé!</div>'
         +'<button onclick="pcRevealSolve(true)" style="'+pcBtn()+'width:100%;">📖 XEM BÀI MẪU & TỰ CHẤM</button>')
      +'<button onclick="pcHint()" style="'+pcBtn2()+'width:100%;margin-top:8px;border-color:var(--gold);color:var(--gold);">🕷️ GỢI Ý CỦA FURY</button>'
      +'<button onclick="pcAskFury()" style="'+pcBtn2()+'width:100%;margin-top:8px;font-size:12px;">💬 Chat với Fury về bài này</button>';
  }
  h+='<div id="pcFb"></div>';
  pcBox().innerHTML=h;
  pcEl().scrollTop=0;
  var inp=document.getElementById('pcIn'); if(inp) setTimeout(function(){inp.focus();},100);
}

// ── chấm điểm & phản hồi ──
function pcElapsed(){ return (Date.now()-P.t0)/1000; }
function pcReward(base){
  var fast=pcElapsed()<20;
  var n=fast?base*3:base;
  pcXu(n);
  return (fast?'⚡ TỐC ĐỘ! +':'+')+n+' xu';
}
function pcFb(ok, msg, xuTxt){
  var fb=document.getElementById('pcFb');
  fb.innerHTML='<div style="background:'+(ok?'rgba(48,209,88,.12)':'rgba(232,25,44,.12)')+';border:1px solid '+(ok?'var(--green)':'var(--red2)')+';border-radius:14px;padding:15px;margin-top:14px;">'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;color:'+(ok?'var(--green)':'var(--red2)')+';">'+(ok?'✅ CHUẨN LUÔN! '+(xuTxt||''):'❌ Chưa đúng rồi')+'</div>'
    +(msg?'<div style="font-size:13.5px;line-height:1.8;color:var(--tx);margin-top:8px;">'+msg+'</div>':'')
    +'<button onclick="pcNext()" style="'+pcBtn()+'width:100%;margin-top:12px;">'+(P.qi+1>=P.qs.length?'🏁 XONG BÀI':'CÂU TIẾP →')+'</button></div>';
  fb.scrollIntoView({behavior:'smooth',block:'end'});
}
function pcMarkWrong(){
  if(P.review) return;
  var q=P.qs[P.qi], w=pcWrong();
  var rec={f:q._f||P.file, so:q._so||P.bai.so, q:q._i, mon:P.mon};
  if(!w.some(function(x){return x.f===rec.f&&x.so===rec.so&&x.q===rec.q;})) w.push(rec);
  pcSaveWrong(w);
}
function pcMarkRight(){
  if(!P.review) return;
  var q=P.qs[P.qi], w=pcWrong().filter(function(x){return !(x.f===(q._f||P.file)&&x.so===(q._so)&&x.q===q._i);});
  pcSaveWrong(w);
}

function pcAns(i){
  var q=P.qs[P.qi]; P.sess.total++;
  for(var k=0;k<q.options.length;k++){
    var el=document.getElementById('pcOpt'+k);
    el.onclick=null;
    if(k===q.a) el.style.borderColor='var(--green)', el.style.background='rgba(48,209,88,.1)';
    else if(k===i) el.style.borderColor='var(--red2)', el.style.background='rgba(232,25,44,.08)';
    else el.style.opacity='.45';
  }
  if(i===q.a){ P.sess.ok++; pcMarkRight(); pcFb(true, pcEsc(q.explain||''), pcReward(5)); }
  else { pcMarkWrong(); pcFb(false, '<b>Đáp án đúng: '+String.fromCharCode(65+q.a)+'.</b> '+pcEsc(q.explain||'')); }
}

function pcCheckIn(){
  var q=P.qs[P.qi], v=document.getElementById('pcIn').value;
  if(!pcNorm(v)) return;
  P.sess.total++;
  var ok=(q.accept||[q.answer]).some(function(a){ return pcNorm(a)===pcNorm(v)||pcNormNum(a)===pcNormNum(v); });
  if(ok){ P.sess.ok++; pcMarkRight(); pcFb(true,'', pcReward(5)); }
  else { pcMarkWrong(); pcFb(false, '<b>Đáp án đúng: '+pcEsc(q.answer)+'</b>'); }
}

// ── toán giải ──
function pcHint(){
  var q=P.qs[P.qi];
  if(P.hints>=(q.hints||[]).length){ return; }
  var hd=document.getElementById('pcHints');
  hd.innerHTML+='<div style="background:rgba(245,200,66,.08);border:1px solid rgba(245,200,66,.35);border-radius:12px;padding:12px 14px;margin-bottom:10px;font-size:13.5px;line-height:1.8;color:var(--tx);">🛡️ <b style="color:var(--gold);">Fury gợi ý '+(P.hints+1)+':</b> '+pcEsc(q.hints[P.hints])+'</div>';
  if(typeof speak==='function') speak(q.hints[P.hints]);
  P.hints++;
  hd.scrollIntoView({behavior:'smooth',block:'end'});
}
function pcSolveCheck(){
  var q=P.qs[P.qi], v=document.getElementById('pcIn').value;
  if(!pcNorm(v)) return;
  P.sess.total++;
  var ok=pcNormNum(q.dapSo).indexOf(pcNormNum(v))>=0||pcNormNum(v).indexOf(pcNormNum(q.dapSo))>=0||pcNorm(v)===pcNorm(q.dapSo);
  if(ok){
    P.sess.ok++; pcMarkRight();
    var base=P.hints===0?20:(P.hints===1?10:5);
    pcXu(base);
    pcFb(true,'<div style="margin-top:6px;"><b>Bài giải mẫu:</b><br>'+pcEsc(q.loiGiai).replace(/\n/g,'<br>')+'</div>','+'+base+' xu'+(P.hints===0?' (không cần gợi ý — đỉnh!)':''));
  } else {
    pcMarkWrong();
    if(P.hints<(q.hints||[]).length){
      var fb=document.getElementById('pcFb');
      fb.innerHTML='<div style="background:rgba(232,25,44,.1);border:1px solid var(--red2);border-radius:12px;padding:12px;margin-top:12px;font-size:13px;color:var(--tx);">Chưa đúng — nhưng em đang đi đúng hướng đấy. Bấm <b style="color:var(--gold);">🕷️ Gợi ý của Fury</b> rồi thử lại nhé!</div>';
    } else {
      pcFb(false,'<b>Đáp số: '+pcEsc(q.dapSo)+'</b><div style="margin-top:6px;">'+pcEsc(q.loiGiai).replace(/\n/g,'<br>')+'</div>');
    }
  }
}
function pcRevealSolve(selfGrade){
  var q=P.qs[P.qi];
  var fb=document.getElementById('pcFb');
  fb.innerHTML='<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:14px;padding:15px;margin-top:14px;">'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;color:var(--gold);margin-bottom:8px;">📖 BÀI MẪU CỦA FURY</div>'
    +'<div style="font-size:13.5px;line-height:1.9;color:var(--tx);">'+pcEsc(q.loiGiai).replace(/\n/g,'<br>')+'</div>'
    +'<div style="font-size:12px;color:var(--tx2);margin:12px 0 8px;">Em tự chấm: bài của em có giống tinh thần bài mẫu không?</div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button onclick="P.sess.total++;P.sess.ok++;pcMarkRight();pcXu(10);pcFb(true,\'\',\'+10 xu\')" style="'+pcBtn()+'flex:1;background:var(--green);font-size:13px;">✅ Em làm được</button>'
    +'<button onclick="P.sess.total++;pcMarkWrong();pcFb(false,\'Không sao — lần sau em sẽ làm được. Đọc kỹ bài mẫu nhé!\')" style="'+pcBtn2()+'flex:1;font-size:13px;">Chưa được</button></div></div>';
  fb.scrollIntoView({behavior:'smooth',block:'end'});
}
function pcAskFury(){
  var q=P.qs[P.qi];
  closePractice();
  if(typeof qs==='function') qs('[LUYỆN TẬP] Anh Fury ơi, em đang luyện bài này trong app:\n"'+q.de+'"\nEm bí rồi. Anh gợi ý bước tiếp theo cho em nghĩ nhé (đừng nói đáp án)!');
}

// ── nói tiếng Anh ──
var _pcSR=null;
function pcSpeak(){
  var q=P.qs[P.qi];
  var S=window.SpeechRecognition||window.webkitSpeechRecognition;
  var st=document.getElementById('pcMicSt'), btn=document.getElementById('pcMicBtn');
  if(!S){ st.textContent='Thiết bị không hỗ trợ mic — bấm Bỏ qua nhé.'; return; }
  if(_pcSR){ try{_pcSR.stop();}catch(e){} _pcSR=null; }
  _pcSR=new S(); _pcSR.lang='en-US'; _pcSR.interimResults=false;
  btn.style.background='var(--red)'; st.textContent='🔴 Đang nghe... nói to và rõ nhé!';
  _pcSR.onresult=function(e){
    var said=e.results[0][0].transcript;
    st.textContent='Em nói: "'+said+'"';
    btn.style.background='var(--blue2)';
    P.sess.total++;
    var ns=pcNorm(said);
    var ok=(q.accept||[q.target]).some(function(a){
      var na=pcNorm(a);
      return ns===na||ns.indexOf(na)>=0||na.indexOf(ns)>=0;
    });
    if(ok){ P.sess.ok++; pcMarkRight(); pcFb(true,'Phát âm được Fury duyệt! 🎤', pcReward(5)); }
    else { pcMarkWrong(); pcFb(false,'Câu chuẩn là: <b>"'+pcEsc(q.target)+'"</b> — bấm 🔊 nghe mẫu rồi thử lại lần sau nhé!'); }
  };
  _pcSR.onerror=_pcSR.onend=function(){ btn.style.background='var(--blue2)'; if(st.textContent.indexOf('Đang nghe')>=0) st.textContent='Không nghe rõ — bấm nói lại nhé.'; };
  _pcSR.start();
}
function pcSkipSpeak(){ P.sess.total++; pcMarkWrong(); pcFb(false,'Câu mẫu: <b>"'+pcEsc(P.qs[P.qi].target)+'"</b>'); }

// ── chuyển câu / kết thúc ──
function pcNext(){ P.qi++; pcQ(); }
function pcFinish(){
  var pct=P.sess.total?Math.round(P.sess.ok/P.sess.total*100):0;
  if(!P.review){
    var prog=pcProg(), key=P.mon+'|'+P.file+'|'+P.bai.so;
    var old=prog[key]||{best:0,times:0};
    prog[key]={best:Math.max(old.best,pct),times:old.times+1};
    pcSaveProg(prog);
  }
  var msg = pct>=90?'XUẤT SẮC! Spider-Man chính hiệu! 🕷️':pct>=70?'Rất tốt! Sắp thành cao thủ rồi!':pct>=50?'Ổn đấy — ôn thêm chút nữa là ngon!':'Không sao, luyện lại là lên trình ngay!';
  var h=pcHead('🏁 KẾT QUẢ','pcHome()');
  h+='<div style="text-align:center;padding:30px 0;">'
    +'<div style="font-size:64px;">'+(pct>=90?'🏆':pct>=70?'🥈':pct>=50?'💪':'🕸️')+'</div>'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:44px;color:'+(pct>=70?'var(--green)':'var(--gold)')+';margin:8px 0;">'+pct+'%</div>'
    +'<div style="font-size:15px;color:var(--tx);margin-bottom:6px;">Đúng '+P.sess.ok+'/'+P.sess.total+' câu · kiếm được <b style="color:var(--gold);">'+P.sess.xu+' xu</b> 🪙</div>'
    +'<div style="font-size:14px;color:var(--tx2);margin-bottom:26px;">'+msg+'</div>'
    +(P.review?'':'<button onclick="pcStart('+P.data.bai.indexOf(P.bai)+')" style="'+pcBtn2()+'width:100%;margin-bottom:8px;">🔄 Làm lại bài này</button>')
    +'<button onclick="'+(P.review?'pcHome()':'pcFile(\''+P.file+'\')')+'" style="'+pcBtn()+'width:100%;">TIẾP TỤC →</button>'
    +'</div>';
  pcBox().innerHTML=h;
  if(typeof speak==='function') speak(pct>=70?'Tuyệt vời Peter! Em đạt '+pct+' phần trăm!':'Em đạt '+pct+' phần trăm. Luyện thêm chút nữa nhé!');
}

// ═══ Hồ sơ học sinh — nút trong bảng phụ huynh ═══
(function(){
  setTimeout(function(){
    var ol=document.querySelector('#parentOL .obox');
    if(!ol) return;
    var b=document.createElement('button');
    b.textContent='👤 Hồ sơ học sinh (tên gọi, trường, lưu ý)';
    b.style.cssText='margin-top:8px;width:100%;background:rgba(26,106,191,.12);border:1px solid var(--blue2);border-radius:8px;color:var(--blue2);font-family:Rajdhani,sans-serif;font-weight:700;font-size:12px;padding:8px;cursor:pointer;';
    b.onclick=function(){
      var p=getProfile();
      var ten=prompt('Biệt danh của con (hiện trong app):',p.ten); if(ten===null)return;
      var truong=prompt('Trường (để trống nếu không muốn lưu):',p.truong); if(truong===null)return;
      var soThich=prompt('Sở thích của con:',p.soThich); if(soThich===null)return;
      var ghiChu=prompt('Lưu ý cho Fury (VD: con hay vội, cần khen nhiều...):',p.ghiChu); if(ghiChu===null)return;
      saveProfile({ten:ten.trim()||'Kua',lop:p.lop,truong:truong.trim(),tuoi:p.tuoi,soThich:soThich.trim(),tinhCach:p.tinhCach,ghiChu:ghiChu.trim()});
      alert('✅ Đã lưu hồ sơ. Fury sẽ hiểu con hơn từ giờ!');
    };
    ol.appendChild(b);
    // nút mã phòng đồng bộ
    var rb=document.createElement('button');
    rb.textContent='🔑 Mã phòng đồng bộ: '+(localStorage.getItem('rm3')||'(chưa đặt)');
    rb.style.cssText='margin-top:8px;width:100%;background:rgba(245,200,66,.1);border:1px solid var(--gold);border-radius:8px;color:var(--gold);font-family:Rajdhani,sans-serif;font-weight:700;font-size:12px;padding:8px;cursor:pointer;';
    rb.onclick=function(){
      var cur=localStorage.getItem('rm3')||'';
      var c=prompt('Mã phòng đồng bộ bài tập giữa máy bố/mẹ và máy con.\nPhải đặt GIỐNG NHAU trên cả 2 máy (6-10 ký tự, khó đoán):',cur);
      if(c===null)return;
      c=c.trim().toUpperCase();
      if(c.length<6){alert('Mã phòng cần ít nhất 6 ký tự cho an toàn.');return;}
      localStorage.setItem('rm3',c);
      rb.textContent='🔑 Mã phòng đồng bộ: '+c;
      alert('✅ Đã lưu. Nhớ đặt đúng mã này trên máy còn lại!');
    };
    ol.appendChild(rb);
  }, 800);
})();
