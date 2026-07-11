// ═══════════════════════════════════════════════
// TRUNG TÂM NHIỆM VỤ HÔM NAY — 3 ca môn mỗi ngày
// Toán · Tiếng Việt · Tiếng Anh, mỗi ca ~45 phút
// + Hợp đồng xu minh bạch + Đánh giá chu kỳ 5 ngày
// ═══════════════════════════════════════════════

var DH_MON={ toan:{ten:'Toán',icon:'🔢',mau:'var(--red)'},
             tv:{ten:'Tiếng Việt',icon:'📖',mau:'var(--gold)'},
             ta:{ten:'Tiếng Anh',icon:'🌏',mau:'var(--blue2)'} };

function dhMinutes(mon){
  var v=parseInt(localStorage.getItem('subj_min_'+mon)||'45');
  return Math.max(20,Math.min(60,v));
}
function dhTargetQ(mon){ return Math.max(12, Math.round(dhMinutes(mon)/1.7)); }

// trạng thái ngày: mỗi môn done/target/complete
function dhState(){
  var s=pcLS('daily3','{}');
  if(s.date!==adToday()){
    s={date:adToday()};
    ['toan','tv','ta'].forEach(function(m){ s[m]={done:0,ok:0,xu:0,complete:false}; });
    localStorage.setItem('daily3',JSON.stringify(s));
  }
  ['toan','tv','ta'].forEach(function(m){ if(!s[m]) s[m]={done:0,ok:0,xu:0,complete:false}; });
  return s;
}
function dhSave(s){ localStorage.setItem('daily3',JSON.stringify(s)); }

// ═══ MÀN HÌNH CHÍNH MỚI: hub 3 ca môn (thay pcHome cũ) ═══
pcHome=function(){
  P.dailyMode=false; P.dhMon=null;
  var s=dhState();
  var doneCnt=['toan','tv','ta'].filter(function(m){return s[m].complete;}).length;
  var h=pcHead('⚡ NHIỆM VỤ HÔM NAY','closePractice()');
  var d=new Date();
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">'
    +'<div style="font-size:13px;color:var(--tx2);">'+['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'][d.getDay()]+', '+d.getDate()+'/'+(d.getMonth()+1)
    +(typeof summerOn==='function'&&summerOn()?' · 🌞 Chế độ hè':'')+'</div>'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;color:'+(doneCnt===3?'var(--green)':'var(--gold)')+';">'+doneCnt+'/3 ca hoàn thành'+(doneCnt===3?' 🏆':'')+'</div></div>';
  // định hướng từ đánh giá 5 ngày
  var dir=localStorage.getItem('review5_dir');
  if(dir) h+='<div style="background:rgba(15,76,143,.15);border-left:3px solid var(--blue2);border-radius:0 10px 10px 0;padding:9px 12px;font-size:12px;color:var(--tx2);margin-bottom:12px;">🧭 '+dir+'</div>';
  // 3 thẻ ca môn
  ['toan','tv','ta'].forEach(function(m){
    var M=DH_MON[m], st=s[m], target=dhTargetQ(m);
    var pct=Math.min(100,Math.round(st.done/target*100));
    h+='<div onclick="dhContract(\''+m+'\')" style="'+pcCard()+'border:2px solid '+(st.complete?'var(--green)':M.mau)+';">'
      +'<div style="display:flex;align-items:center;gap:12px;">'
      +'<div style="font-size:32px;">'+(st.complete?'✅':M.icon)+'</div>'
      +'<div style="flex:1;">'
      +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:17px;color:var(--tx);">CA '+M.ten.toUpperCase()+'</div>'
      +'<div style="font-size:11.5px;color:var(--tx3);">'+st.done+'/'+target+' câu'+(st.xu?' · +'+st.xu+' xu':'')+'</div></div>'
      +'<div style="background:'+(st.complete?'var(--green)':M.mau)+';border-radius:10px;padding:9px 16px;font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;color:#fff;">'+(st.complete?'XONG':(st.done>0?'TIẾP TỤC':'VÀO CA'))+'</div></div>'
      +'<div style="height:5px;background:var(--s3);border-radius:3px;margin-top:10px;"><div style="height:5px;width:'+pct+'%;background:'+(st.complete?'var(--green)':M.mau)+';border-radius:3px;"></div></div>'
      +'</div>';
  });
  // hàng phụ
  var w=pcWrong();
  h+='<div style="display:flex;gap:8px;margin-top:4px;">'
    +(w.length?'<div onclick="pcReview()" style="'+pcCard()+'flex:1;text-align:center;margin-bottom:0;"><div style="font-size:22px;">🔁</div><div style="font-size:11px;color:var(--gold);font-weight:700;">Ôn lỗi sai ('+w.length+')</div></div>':'')
    +'<div onclick="adMap()" style="'+pcCard()+'flex:1;text-align:center;margin-bottom:0;"><div style="font-size:22px;">🗺️</div><div style="font-size:11px;color:var(--tx2);font-weight:700;">Sức mạnh</div></div>'
    +'<div onclick="pcCatalog()" style="'+pcCard()+'flex:1;text-align:center;margin-bottom:0;"><div style="font-size:22px;">📚</div><div style="font-size:11px;color:var(--tx2);font-weight:700;">Tự luyện thêm</div></div>'
    +'</div>';
  pcBox().innerHTML=h;
};

// kho tự luyện (danh mục cũ)
function pcCatalog(){
  var h=pcHead('📚 KHO TỰ LUYỆN','pcHome()');
  h+='<div style="font-size:12.5px;color:var(--tx2);margin-bottom:12px;">Muốn luyện thêm ngoài nhiệm vụ? Chọn môn bất kỳ — làm đúng vẫn có xu!</div>';
  ['toan5','tv5','ta','toan','tv','on3'].forEach(function(m){
    var M=P.idx[m]; if(!M) return;
    var tot=0,done=0,prog=pcProg();
    M.nhom.forEach(function(n){ n.files.forEach(function(f){ tot+=f.soBai; }); });
    for(var k in prog){ if(k.indexOf(m+'|')===0) done++; }
    h+='<div onclick="pcMon(\''+m+'\')" style="'+pcCard()+'display:flex;align-items:center;gap:14px;">'
      +'<div style="font-size:30px;">'+M.icon+'</div>'
      +'<div style="flex:1;"><div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;color:var(--tx);">'+M.ten+'</div>'
      +'<div style="font-size:11.5px;color:var(--tx3);">'+tot+' bài · đã làm '+done+'</div></div>'
      +'<div style="color:var(--tx3);font-size:20px;">›</div></div>';
  });
  pcBox().innerHTML=h;
}

// ═══ HỢP ĐỒNG NHIỆM VỤ — nói rõ luật xu TRƯỚC khi làm ═══
function dhContract(mon){
  var M=DH_MON[mon], s=dhState(), st=s[mon], target=dhTargetQ(mon);
  var remain=Math.max(0,target-st.done);
  if(st.complete){ dhStart(mon); return; } // đã xong vẫn cho làm thêm, khỏi hợp đồng
  var maxXu=Math.round(remain*(0.8*5+0.2*10))+10;
  var h=pcHead(M.icon+' CA '+M.ten.toUpperCase(),'pcHome()');
  h+='<div style="background:linear-gradient(135deg,rgba(15,76,143,.25),rgba(232,25,44,.08));border:2px solid '+M.mau+';border-radius:18px;padding:20px;margin-bottom:14px;">'
    +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;color:var(--gold);letter-spacing:.15em;margin-bottom:12px;">📜 HỢP ĐỒNG NHIỆM VỤ S.H.I.E.L.D.</div>'
    +'<div style="display:flex;flex-direction:column;gap:10px;font-size:13.5px;color:var(--tx);line-height:1.6;">'
    +'<div>🎯 Nhiệm vụ: <b>'+remain+' câu</b> — làm lúc nào cũng được, miễn xong trong hôm nay!</div>'
    +'<div>💰 Thưởng tối đa: <b style="color:var(--gold);">~'+maxXu+' xu</b> — nếu đúng hết, nhanh (dưới 15 giây/câu) và KHÔNG dùng gợi ý</div>'
    +'<div>🕷️ Mỗi lần bấm gợi ý: <b style="color:var(--red2);">-2 xu</b> và giảm thưởng câu đó</div>'
    +'<div>🏁 Hoàn thành cả ca: <b style="color:var(--green);">+10 xu thưởng nóng</b> · xong cả 3 ca: <b style="color:var(--green);">+20 xu</b></div>'
    +'</div></div>'
    +'<button onclick="dhStart(\''+mon+'\')" style="'+pcBtn()+'width:100%;background:'+M.mau+';font-size:17px;">⚡ EM NHẬN NHIỆM VỤ!</button>'
    +'<button onclick="pcHome()" style="'+pcBtn2()+'width:100%;margin-top:8px;">← Để sau</button>';
  pcBox().innerHTML=h;
  if(typeof speak==='function') speak('Ca '+M.ten+': tối đa '+maxXu+' xu đang chờ. Dùng gợi ý là mất xu đấy nhé! Nhận nhiệm vụ không Peter?');
}

// ═══ SINH ĐỀ CHO TỪNG CA MÔN ═══
function dhFiles(mon){
  // main = kiến thức MỚI lớp 5 · review = ôn tập lớp 4 (kho 1.100 câu có sẵn)
  var idx=P.idx, out={main:[],review:[]};
  if(mon==='toan'){
    (idx.toan5?idx.toan5.nhom:[]).forEach(function(n){n.files.forEach(function(f){out.main.push(f);});});
    (idx.toan?idx.toan.nhom:[]).forEach(function(n){n.files.forEach(function(f){out.review.push(f);});});
  } else if(mon==='tv'){
    (idx.tv5?idx.tv5.nhom:[]).forEach(function(n){n.files.forEach(function(f){out.main.push(f);});});
    (idx.tv?idx.tv.nhom:[]).forEach(function(n){n.files.forEach(function(f){out.review.push(f);});});
  } else {
    (idx.ta?idx.ta.nhom:[]).forEach(function(n){n.files.forEach(function(f){out.main.push(f);});});
  }
  return out;
}
// chọn bài trong một nhóm file: ưu tiên dạng chưa vững (<70), rồi mới mở bài mới
function dhGate(files, exclude){
  exclude=exclude||{};
  var mast=adMastery(), worst=null;
  for(var k in mast){
    if(exclude[k]) continue;
    var p=k.split('|');
    var inSet=files.some(function(f){return f.f===p[1];});
    if(inSet && mast[k].s<70){ if(!worst||mast[k].s<mast[worst].s) worst=k; }
  }
  if(worst){ var pp=worst.split('|'); return {f:pp[1], so:parseInt(pp[2]), mode:'weak', key:worst}; }
  for(var i=0;i<files.length;i++){
    var att={}; for(var k2 in mast){ var q=k2.split('|'); if(q[1]===files[i].f) att[q[2]]=1; }
    if(Object.keys(att).length<files[i].soBai && !exclude['new|'+files[i].f]) return {f:files[i].f, mode:'new', key:'new|'+files[i].f};
  }
  return null;
}
function dhGenRefs(mon){
  var fs=dhFiles(mon), refs=[], target=Math.max(0,dhTargetQ(mon)-dhState()[mon].done);
  if(target<=0) target=10;
  var summer=(typeof summerOn==='function'&&summerOn());
  if(summer && fs.review && fs.review.length && mon!=='ta'){
    // HÈ (lên lớp 5): 70% ôn chắc LỚP 4 + 30% LỚP 5 mới (Fury dạy lý thuyết trước)
    var nOn=Math.round(target*0.7), nMoi=target-nOn, ex={}, taken=0, g;
    while(taken<nOn && (g=dhGate(fs.review,ex))){ ex[g.key]=1; g.n=Math.min(5,nOn-taken); g._ord=0; refs.push(g); taken+=g.n; }
    if(refs.length&&taken<nOn) refs[0].n+=nOn-taken;
    var g5=dhGate(fs.main,{});
    if(g5){ g5.n=nMoi; g5._ord=1; g5.theory=(g5.mode==='new'); refs.push(g5); }
  } else if(mon==='ta'){
    var ex3={}, taken3=0, g3, tMain=Math.max(4,target-3);
    while(taken3<tMain && (g3=dhGate(fs.main.filter(function(f){return f.f.indexOf('fun-')<0;}),ex3))){
      ex3[g3.key]=1; g3.n=Math.min(6,tMain-taken3); g3._ord=refs.length; g3.theory=(g3.mode==='new'); refs.push(g3); taken3+=g3.n;
      if(refs.length>=4) break;
    }
    // luôn kèm 3 câu bài hát 🎵 cuối ca — học mà chơi
    refs.push({f:'data/ta/fun-songs.json', mode:'new', n:3, _ord:8});
  } else {
    var ex2={}, taken2=0, g2;
    while(taken2<target && (g2=dhGate(fs.main,ex2))){
      ex2[g2.key]=1; g2.n=Math.min(6,target-taken2); g2._ord=refs.length; g2.theory=(g2.mode==='new'); refs.push(g2); taken2+=g2.n;
      if(refs.length>=5) break;
    }
  }
  return refs;
}

// ═══ LẮP RÁP & BẮT ĐẦU CA ═══
function dhStart(mon){
  try{
    var st0=dhState()[mon];
    var ten0=(typeof getProfile==='function')?getProfile().ten:'Kua';
    if(typeof tgNotify==='function') tgNotify('▶️ '+ten0+' bắt đầu '+(st0.done>0?'làm tiếp':'')+' ca '+DH_MON[mon].ten+' ('+st0.done+'/'+dhTargetQ(mon)+' câu đã xong trước đó)');
  }catch(e){}
  pcBox().innerHTML='<div style="text-align:center;padding:60px 0;color:var(--tx2);">🛡️ Fury đang soạn ca '+DH_MON[mon].ten+'...</div>';
  var fail=function(msg){
    pcBox().innerHTML=pcHead('⚠️ CÓ TRỤC TRẶC','pcHome()')
      +'<div style="text-align:center;padding:30px 0;color:var(--tx2);font-size:13px;line-height:1.8;">Fury soạn bài bị lỗi:<br><span style="color:var(--red2);font-size:12px;">'+String(msg||'').replace(/</g,'&lt;')+'</span></div>'
      +'<button onclick="dhStart(\''+mon+'\')" style="'+pcBtn()+'width:100%;">🔄 THỬ LẠI</button>'
      +'<button onclick="pcHome()" style="'+pcBtn2()+'width:100%;margin-top:8px;">← Quay lại</button>';
  };
  var go=function(){
    try{
      var refs=dhGenRefs(mon);
      if(!refs.length){ pcHome(); return; }
      var files={}; refs.forEach(function(r){ files[r.f]=1; });
      var fl=Object.keys(files), loaded={}, cnt=0;
      fl.forEach(function(f){
        fetch(f).then(function(r){return r.json();}).then(function(d){ loaded[f]=d; adSaveNames(d,f); })
        .catch(function(){}).finally(function(){
          cnt++;
          if(cnt===fl.length){
            try{ dhAssemble(mon,refs,loaded); }catch(e){ fail(e.message); }
          }
        });
      });
      // quá 15 giây chưa xong → báo lỗi thay vì treo
      setTimeout(function(){ if(cnt<fl.length) fail('Mạng chậm hoặc thiếu file bài tập.'); }, 15000);
    }catch(e){ fail(e.message); }
  };
  if(P.idx) go();
  else fetch('data/index.json').then(function(r){return r.json();}).then(function(d){P.idx=d;go();}).catch(function(){fail('Không tải được mục lục.');});
}
function dhAssemble(mon, refs, loaded){
  var mast=adMastery(), wrong=pcWrong(), qs=[];
  refs.forEach(function(r){
    var d=loaded[r.f]; if(!d) return;
    var bai=null;
    if(r.mode==='new'){
      bai=d.bai.find(function(b){ return !mast[adMonOf(r.f)+'|'+r.f+'|'+b.so]; })||d.bai[0];
    } else bai=d.bai.find(function(b){ return b.so==r.so; });
    if(!bai) return;
    if(r.theory && bai.lyThuyet){
      qs.push({type:'theory',ten:bai.ten,lyThuyet:bai.lyThuyet,_i:-1,_f:r.f,_so:bai.so,_mode:r.mode,_ord:r._ord||0});
    }
    var idxs=bai.cauHoi.map(function(_,i){return i;});
    if(r.mode==='weak'){
      var wq=wrong.filter(function(x){return x.f===r.f&&x.so==bai.so;}).map(function(x){return x.q;});
      idxs.sort(function(a,b){ return (wq.indexOf(b)>=0?1:0)-(wq.indexOf(a)>=0?1:0)||Math.random()-0.5; });
    } else idxs.sort(function(){return Math.random()-0.5;});
    idxs.slice(0,r.n).forEach(function(i){
      var q=Object.assign({},bai.cauHoi[i]);
      q._i=i; q._f=r.f; q._so=bai.so; q._mode=r.mode; q._ord=r._ord||0;
      qs.push(q);
    });
  });
  // TA: thêm 5 câu GHÉP TỪ từ chính từ vựng trong bài
  if(mon==='ta'){
    var words=[];
    Object.keys(loaded).forEach(function(f){
      (loaded[f].bai||[]).forEach(function(b){
        (b.cauHoi||[]).forEach(function(q){
          var w=(q.type==='spell'||q.type==='fill')?(q.answer||''):'';
          if(/^[a-zA-Z]{3,10}$/.test(w)) words.push({w:w.toLowerCase(),hint:(q.q||'').slice(0,60)});
        });
      });
    });
    words.sort(function(){return Math.random()-0.5;});
    words.slice(0,5).forEach(function(x,i){
      qs.push({type:'scramble',word:x.w,hint:x.hint||'từ tiếng Anh',_i:500+i,_f:'vocab',_so:0,_ord:9});
    });
  }
  if(!qs.length){ pcHome(); return; }
  qs.sort(function(a,b){ return (a._ord||0)-(b._ord||0); });
  P.qs=qs; P.qi=0; P.review=true; P.dailyMode=false; P.dhMon=mon; P.mon=mon;
  P.bai={so:DH_MON[mon].icon,ten:'Ca '+DH_MON[mon].ten};
  P.sess.ok=0; P.sess.total=0; P.sess.xu=0; P.sess.start=Date.now();
  try{ if(typeof genMissionAug==='function') genMissionAug(); }catch(e){}
  pcQ();
}

// ═══ KẾT THÚC CA: cộng dồn tiến độ ngày + thưởng ═══
var _pcFinish_dh=pcFinish;
pcFinish=function(){
  var mon=P.dhMon;
  _pcFinish_dh();
  if(!mon) return;
  P.dhMon=null;
  var s=dhState(), st=s[mon], target=dhTargetQ(mon);
  st.done+=P.sess.total; st.ok+=P.sess.ok; st.xu+=P.sess.xu;
  var justDone=(!st.complete && st.done>=target);
  if(justDone){
    st.complete=true;
    pcXu(10);
    var all3=['toan','tv','ta'].every(function(m){return s[m].complete;});
    if(all3) pcXu(20);
    var head=pcBox().children[0];
    if(head) head.insertAdjacentHTML('afterend',
      '<div style="background:rgba(48,209,88,.13);border:2px solid var(--green);border-radius:14px;padding:14px;margin-bottom:12px;text-align:center;">'
      +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:16px;color:var(--green);">🎖️ HOÀN THÀNH CA '+DH_MON[mon].ten.toUpperCase()+' — +10 XU</div>'
      +(all3?'<div style="font-size:13px;color:var(--gold);margin-top:4px;">🏆 CẢ 3 CA TRONG NGÀY — +20 XU! Fury nghiêng mình!</div>':'')
      +'</div>');
    if(typeof speak==='function') speak(all3?'Xuất sắc Peter! Cả 3 ca trong ngày! Em là đặc vụ hạng nhất!':'Hoàn thành ca '+DH_MON[mon].ten+'! Cộng 10 xu!');
    if(typeof adBumpStreak==='function' && all3) adBumpStreak();
    if(typeof tgNotify==='function') tgNotify((all3?'🏆 HOÀN THÀNH CẢ 3 CA hôm nay!':'🎖️ Hoàn thành ca '+DH_MON[mon].ten)+' · đúng '+st.ok+'/'+st.done+' câu');
  }
  dhSave(s);
};

// nút cũ "Nhiệm vụ hôm nay" (banner, triệu tập...) giờ mở thẳng hub
adStartDaily=function(){ if(pcEl().style.display!=='block') openPractice(); else pcHome(); };

// ═══ ĐÁNH GIÁ CHU KỲ 5 NGÀY — máy tự nhìn lại & điều chỉnh lộ trình ═══
function dhSubjectOf(f){
  if(!f) return 'khac';
  if(f.indexOf('toan')>=0) return 'toan';
  if(f.indexOf('tv')>=0) return 'tv';
  if(f.indexOf('/ta/')>=0||f==='vocab') return 'ta';
  return 'khac';
}
function dhReview5(){
  var last=localStorage.getItem('review5_last');
  if(!last){ localStorage.setItem('review5_last',adToday()); return; }
  var days=Math.round((new Date(adToday())-new Date(last))/86400000);
  if(days<5) return;
  var log=pcLS('luyen_log','[]').filter(function(e){return Date.now()-e.d<=5*86400000;});
  if(log.length<15){ localStorage.setItem('review5_last',adToday()); return; }
  var stats={};
  ['toan','tv','ta'].forEach(function(m){stats[m]={n:0,ok:0,t:0,h:0};});
  log.forEach(function(e){
    var m=dhSubjectOf(e.f); if(!stats[m]) return;
    stats[m].n++; stats[m].ok+=e.ok; stats[m].t+=e.t; stats[m].h+=(e.h||0);
  });
  function lvl(acc){ return acc>=85?'Xuất sắc 🌟':acc>=70?'Khá 👍':acc>=50?'Trung bình 📈':'Cần kèm thêm 🎯'; }
  var lines=['🧭 ĐÁNH GIÁ 5 NGÀY ('+last+' → '+adToday()+')'];
  var accs={};
  ['toan','tv','ta'].forEach(function(m){
    var x=stats[m];
    if(!x.n){ lines.push(DH_MON[m].ten+': chưa học'); accs[m]=null; return; }
    var acc=Math.round(x.ok/x.n*100); accs[m]=acc;
    lines.push(DH_MON[m].ten+': '+acc+'% đúng ('+x.n+' câu, TB '+Math.round(x.t/x.n)+'s, '+x.h+' gợi ý) → '+lvl(acc));
  });
  // điều chỉnh thời lượng: môn yếu nhất +10 phút, môn mạnh nhất -10 phút
  var arr=['toan','tv','ta'].filter(function(m){return accs[m]!==null&&stats[m].n>=10;});
  var dir='Giữ nhịp hiện tại — học đều 3 môn.';
  if(arr.length>=2){
    arr.sort(function(a,b){return accs[a]-accs[b];});
    var weak=arr[0], strong=arr[arr.length-1];
    if(accs[strong]-accs[weak]>=15){
      localStorage.setItem('subj_min_'+weak, String(Math.min(60,dhMinutes(weak)+10)));
      localStorage.setItem('subj_min_'+strong, String(Math.max(30,dhMinutes(strong)-10)));
      dir='5 ngày tới tăng cường '+DH_MON[weak].ten+' ('+dhMinutes(weak)+' phút/ca), giảm nhẹ '+DH_MON[strong].ten+'.';
    }
  }
  var weakList=(typeof adWeakList==='function')?adWeakList().slice(0,3):[];
  if(weakList.length) dir+=' Trọng tâm: '+weakList.map(function(x){return x.ten;}).join('; ')+'.';
  lines.push('📌 Định hướng: '+dir);
  var report=lines.join('\n');
  localStorage.setItem('review5_text', report);
  localStorage.setItem('review5_dir', dir);
  localStorage.setItem('review5_last', adToday());
  if(typeof tgNotify==='function') tgNotify(report);
  try{
    if(typeof sbFetch==='function') sbFetch('study_log',{method:'POST',prefer:'return=minimal',
      body:JSON.stringify({room_code:room(),day:adToday(),data:{kind:'review5',d:Date.now(),e:Date.now(),noiDung:report,ok:0,tot:0,xu:0,nhanXet:dir}})}).catch(function(){});
  }catch(e){}
}
setTimeout(function(){ try{ dhReview5(); }catch(e){} }, 7000);

function dhReviewView(){
  pcEl().style.display='block';
  var t=localStorage.getItem('review5_text')||'Chưa có kỳ đánh giá nào — cần ít nhất 5 ngày học.';
  pcBox().innerHTML=pcHead('🧭 ĐÁNH GIÁ 5 NGÀY','closePractice()')
    +'<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:14px;padding:16px;font-size:13.5px;line-height:2;color:var(--tx);white-space:pre-wrap;">'+t.replace(/</g,'&lt;')+'</div>';
}


// ═══ TẠM NGHỈ GIỮA CA: thoát giữa chừng vẫn tính công + báo bố mẹ ═══
var _closeP_dh=closePractice;
closePractice=function(){
  try{
    if(P.dhMon && P.sess && P.sess.total>0 && P.qi<P.qs.length){
      var mon=P.dhMon;
      if(typeof adSaveJournal==='function') adSaveJournal('daily');
      var s=dhState();
      s[mon].done+=P.sess.total; s[mon].ok+=P.sess.ok; s[mon].xu+=P.sess.xu;
      dhSave(s);
      if(typeof tgNotify==='function'){
        var ten=(typeof getProfile==='function')?getProfile().ten:'Kua';
        tgNotify('⏸ '+ten+' tạm nghỉ ca '+DH_MON[mon].ten+' · đợt này: '+P.sess.total+' câu, đúng '+P.sess.ok+' · tổng hôm nay: '+s[mon].done+'/'+dhTargetQ(mon));
      }
      P.dhMon=null; P.sess={start:Date.now(),ok:0,total:0,xu:0};
    }
  }catch(e){}
  _closeP_dh();
};

// ═══ BIỂU ĐỒ NĂNG LỰC — đầu bảng điều khiển bố mẹ ═══
function dhCharts(){
  try{
    var log=pcLS('luyen_log','[]');
    if(!log.length) return '';
    // 14 ngày: cột = số câu, màu = % đúng
    var days=[], now=new Date(); now.setHours(0,0,0,0);
    for(var i=13;i>=0;i--){
      var d0=now.getTime()-i*86400000, d1=d0+86400000;
      var es=log.filter(function(e){return e.d>=d0&&e.d<d1;});
      var ok=es.filter(function(e){return e.ok;}).length;
      days.push({n:es.length, acc:es.length?Math.round(ok/es.length*100):0, dd:new Date(d0).getDate()});
    }
    var maxN=Math.max(5,Math.max.apply(null,days.map(function(x){return x.n;})));
    var bars=days.map(function(x){
      var hgt=Math.max(3,Math.round(x.n/maxN*54));
      var c=x.n===0?'var(--s3)':(x.acc>=75?'var(--green)':x.acc>=50?'var(--gold)':'var(--red2)');
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;" title="'+x.n+' câu · '+x.acc+'% đúng">'
        +'<div style="width:70%;height:'+hgt+'px;background:'+c+';border-radius:3px 3px 0 0;"></div>'
        +'<div style="font-size:8.5px;color:var(--tx3);">'+x.dd+'</div></div>';
    }).join('');
    // tiến bộ 7 ngày vs 7 ngày trước theo môn + độ tập trung
    function stat(from,to,mon){
      var es=log.filter(function(e){return e.d>=from&&e.d<to&&(!mon||dhSubjectOf(e.f)===mon);});
      if(!es.length) return null;
      return { acc:Math.round(es.filter(function(e){return e.ok;}).length/es.length*100),
               spd:Math.round(es.reduce(function(s,e){return s+e.t;},0)/es.length), n:es.length };
    }
    var t7=Date.now()-7*86400000, t14=Date.now()-14*86400000;
    var rows='';
    ['toan','tv','ta'].forEach(function(m){
      var cur=stat(t7,Date.now(),m), old=stat(t14,t7,m);
      if(!cur) return;
      var arrow='→', ac='var(--tx3)';
      if(old){ if(cur.acc-old.acc>=5){arrow='↑';ac='var(--green)';} else if(old.acc-cur.acc>=5){arrow='↓';ac='var(--red2)';} }
      rows+='<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--tx);padding:4px 0;">'
        +'<div style="width:74px;color:var(--tx2);">'+DH_MON[m].icon+' '+DH_MON[m].ten+'</div>'
        +'<div style="flex:1;height:7px;background:var(--s3);border-radius:4px;"><div style="height:7px;width:'+cur.acc+'%;background:'+DH_MON[m].mau+';border-radius:4px;"></div></div>'
        +'<div style="width:38px;text-align:right;font-weight:700;">'+cur.acc+'%</div>'
        +'<div style="width:18px;text-align:center;color:'+ac+';font-weight:700;font-size:15px;">'+arrow+'</div></div>';
    });
    var curAll=stat(t7,Date.now(),null), oldAll=stat(t14,t7,null);
    var focus='';
    if(curAll){
      var ftxt=curAll.spd<=30?'Tập trung tốt ⚡':curAll.spd<=55?'Bình thường':'Hay xao nhãng 🐌';
      var ftrend=oldAll?(curAll.spd<oldAll.spd-5?' (đang nhanh lên ↑)':curAll.spd>oldAll.spd+5?' (đang chậm đi ↓)':''):'';
      focus='<div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--tx2);margin-top:8px;padding-top:8px;border-top:1px solid var(--bd);">'
        +'<span>🧠 Độ tập trung: <b style="color:var(--tx);">'+ftxt+'</b>'+ftrend+'</span>'
        +'<span>TB '+curAll.spd+' giây/câu</span></div>';
    }
    return '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:14px;padding:14px;margin-bottom:12px;">'
      +'<div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;color:var(--gold);letter-spacing:.08em;margin-bottom:10px;">📈 NĂNG LỰC HỌC TẬP 14 NGÀY</div>'
      +'<div style="display:flex;align-items:flex-end;height:70px;gap:2px;margin-bottom:12px;">'+bars+'</div>'
      +rows+focus
      +'<div style="font-size:9.5px;color:var(--tx3);margin-top:6px;">Cột: số câu mỗi ngày · Màu: xanh ≥75% đúng, vàng ≥50%, đỏ <50% · Mũi tên: so với 7 ngày trước</div>'
      +'</div>';
  }catch(e){ return ''; }
}
// gắn biểu đồ lên ĐẦU dashboard
if(typeof adminOpen==='function'){
  var _adminOpen_dh=adminOpen;
  adminOpen=function(){
    _adminOpen_dh();
    var head=pcBox().children[0];
    if(head) head.insertAdjacentHTML('afterend', dhCharts());
  };
}


// ═══ BỐ MẸ XEM LẠI HỘI THOẠI CON ↔ FURY ═══
function adChatView(){
  pcEl().style.display='block';
  pcBox().innerHTML=pcHead('💬 HỘI THOẠI VỚI FURY','closePractice()')+'<div style="text-align:center;color:var(--tx2);padding:30px 0;">🕸️ Đang tải...</div>';
  var local=[];
  try{local=JSON.parse(localStorage.getItem('fury_chat_log')||'[]');}catch(e){}
  var render=function(rows){
    var seen={},list=[];
    rows.forEach(function(x){ var k=(x.d||x.ts||'')+(x.q||'').slice(0,20); if(!seen[k]){seen[k]=1;list.push(x);} });
    list.sort(function(a,b){ return (b.d||new Date(b.ts).getTime())-(a.d||new Date(a.ts).getTime()); });
    var h=pcHead('💬 HỘI THOẠI VỚI FURY','closePractice()');
    if(!list.length){ pcBox().innerHTML=h+'<div style="text-align:center;color:var(--tx2);padding:40px 0;">Chưa có hội thoại nào được ghi.</div>'; return; }
    list.slice(0,40).forEach(function(m){
      var t=new Date(m.d||m.ts);
      h+='<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:12px 14px;margin-bottom:8px;">'
        +'<div style="font-size:10px;color:var(--tx3);margin-bottom:6px;">'+t.getDate()+'/'+(t.getMonth()+1)+' '+String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0')+'</div>'
        +'<div style="font-size:12.5px;color:var(--gold);margin-bottom:6px;">🕷️ '+String(m.q||'').replace(/</g,'&lt;')+'</div>'
        +'<div style="font-size:12.5px;color:var(--tx);line-height:1.7;">🛡️ '+String(m.a||'').replace(/</g,'&lt;')+'</div></div>';
    });
    pcBox().innerHTML=h;
  };
  try{
    if(typeof sbFetch==='function'){
      sbFetch('chat_log?room_code=eq.'+room()+'&order=ts.desc&limit=50')
        .then(function(rows){ render(local.concat(rows||[])); })
        .catch(function(){ render(local); });
    } else render(local);
  }catch(e){ render(local); }
}
