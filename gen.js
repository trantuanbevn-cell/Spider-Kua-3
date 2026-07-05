// ═══════════════════════════════════════════════
// MÁY SINH ĐỀ BIẾN THỂ — cùng dạng bài, số liệu & câu chữ đổi mỗi lần
// Toán 4 KNTT: sinh vô hạn biến thể cho các dạng tính toán chính
// ═══════════════════════════════════════════════

function gR(a,b){ return a+Math.floor(Math.random()*(b-a+1)); }
function gPick(a){ return a[Math.floor(Math.random()*a.length)]; }
function gFmt(n){ return n.toLocaleString('vi-VN'); }
function gGcd(a,b){ return b?gGcd(b,a%b):a; }
function gShuf(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;} return a; }

var G_TEN = ['Nam','Minh','An','Bình','Hùng','Khoa','Tú','Long'];
var G_CTX = [
  {dv:'viên bi', hd:'sưu tầm'}, {dv:'quyển vở', hd:'mua'}, {dv:'con tem', hd:'sưu tầm'},
  {dv:'quả bóng', hd:'có'}, {dv:'cái kẹo', hd:'có'}, {dv:'quyển truyện', hd:'đọc'},
  {dv:'cây xanh', hd:'trồng'}, {dv:'bức tranh', hd:'vẽ'}
];

// MCQ 4 lựa chọn từ đáp án đúng + nhiễu
function gMcq(q, dung, nhieu, explain){
  var opts=[dung]; nhieu.forEach(function(x){ if(opts.indexOf(x)<0&&opts.length<4) opts.push(x); });
  while(opts.length<4) opts.push(gFmt(gR(1000,99999)));
  opts=gShuf(opts);
  return {type:'mcq', q:q, options:opts, a:opts.indexOf(dung), explain:explain||'', _gen:1};
}
function gFill(q, ans, accept){ return {type:'fill', q:q, answer:String(ans), accept:(accept||[String(ans)]), _gen:1}; }
function gSolve(de, hints, loiGiai, dapSo){ return {type:'solve', de:de, hints:hints, loiGiai:loiGiai, dapSo:dapSo, _gen:1}; }

// ── các dạng sinh đề theo bài (Toán 4 KNTT) ──
var GEN_TOAN = {
  // Đọc - viết - cấu tạo số
  docso: function(){
    var tr=gR(1,9),ng=gR(10,99),dv=gR(100,999);
    var n=tr*100000+ng*1000+dv;
    return gMcq('Số gồm '+tr+' trăm nghìn, '+ng+' nghìn và '+dv+' đơn vị là số nào?',
      gFmt(n), [gFmt(n+1000),gFmt(n-10000),gFmt(tr*10000+ng*1000+dv)],
      tr+' trăm nghìn = '+gFmt(tr*100000)+', cộng '+gFmt(ng*1000)+' và '+dv+' được '+gFmt(n)+'.');
  },
  sosanh: function(){
    var a=gR(10000,999999), b=a+gPick([-1,1])*gR(1,500)*10;
    return gFill('Điền dấu >, < hoặc = :  '+gFmt(a)+' ___ '+gFmt(b), a>b?'>':(a<b?'<':'='), [a>b?'>':(a<b?'<':'=')]);
  },
  chanle: function(){
    var arr=[gR(100,999)*2, gR(100,999)*2+1, gR(100,999)*2, gR(100,999)*2+1];
    var kind=gPick(['chẵn','lẻ']);
    var dung=arr.find(function(x){return kind==='chẵn'?x%2===0:x%2===1;});
    return gMcq('Số nào là số '+kind+'?', gFmt(dung),
      arr.filter(function(x){return x!==dung;}).map(gFmt),
      'Số '+kind+' là số '+(kind==='chẵn'?'chia hết cho 2 (tận cùng 0,2,4,6,8)':'không chia hết cho 2 (tận cùng 1,3,5,7,9)')+'.');
  },
  bieuthuc: function(){
    var a=gR(200,900),bb=gR(2,9),c=gR(20,90);
    return gFill('Tính giá trị biểu thức a + b × c, với a = '+a+', b = '+bb+', c = '+c+' :  a + b × c = ___',
      a+bb*c, [String(a+bb*c), gFmt(a+bb*c)]);
  },
  lamtron: function(){
    var n=gR(120,980)*1000+gR(1,999);
    var hang=gPick([['trăm nghìn',100000],['chục nghìn',10000],['nghìn',1000]]);
    var kq=Math.round(n/hang[1])*hang[1];
    return gMcq('Làm tròn số '+gFmt(n)+' đến hàng '+hang[0]+' được:',
      gFmt(kq), [gFmt(kq+hang[1]),gFmt(kq-hang[1]),gFmt(Math.floor(n/hang[1])*hang[1]+(kq===Math.floor(n/hang[1])*hang[1]?2*hang[1]:0))],
      'Nhìn chữ số hàng bên phải liền kề: từ 5 trở lên làm tròn lên, dưới 5 làm tròn xuống.');
  },
  hanglop: function(){
    var n=gR(1000000,99999999);
    var s=String(n), pos=gR(0,s.length-1);
    var hang=['đơn vị','chục','trăm','nghìn','chục nghìn','trăm nghìn','triệu','chục triệu'][s.length-1-pos];
    return gMcq('Trong số '+gFmt(n)+', chữ số '+s[pos]+' (từ trái sang là chữ số thứ '+(pos+1)+') thuộc hàng nào?',
      hang, ['đơn vị','chục','trăm','nghìn','chục nghìn','trăm nghìn','triệu','chục triệu'].filter(function(x){return x!==hang;}).slice(0,3),
      'Đếm từ phải sang: đơn vị, chục, trăm, nghìn, chục nghìn, trăm nghìn, triệu...');
  },
  doidonvi_kl: function(){
    var kind=gPick([['yến',10],['tạ',100],['tấn',1000]]);
    var n=gR(2,50);
    return gFill(n+' '+kind[0]+' = ___ kg', n*kind[1], [String(n*kind[1]),gFmt(n*kind[1])]);
  },
  doidonvi_tg: function(){
    var v=gPick([
      function(){var n=gR(2,9);return [n+' thế kỉ = ___ năm', n*100];},
      function(){var n=gR(2,9);return [n+' phút = ___ giây', n*60];},
      function(){var n=gR(2,12);return [n+' giờ = ___ phút', n*60];}
    ])();
    return gFill(v[0], v[1], [String(v[1]),gFmt(v[1])]);
  },
  doidonvi_dt: function(){
    var v=gPick([
      function(){var n=gR(2,90);return [n+' m² = ___ dm²', n*100];},
      function(){var n=gR(2,90);return [n+' dm² = ___ cm²', n*100];},
      function(){var n=gR(2,20);return [n+' cm² = ___ mm²', n*100];}
    ])();
    return gFill(v[0], v[1], [String(v[1]),gFmt(v[1])]);
  },
  congtru: function(){
    var a=gR(12000,860000), b=gR(11000,Math.min(a-1000,500000));
    var op=gPick(['+','-']); var kq=op==='+'?a+b:a-b;
    return gFill('Đặt tính rồi tính:  '+gFmt(a)+' '+op+' '+gFmt(b)+' = ___', kq, [String(kq),gFmt(kq)]);
  },
  tinhthuantien: function(){
    var a=gR(1,9)*100, c=1000-a, b=gR(111,888);
    var kq=a+b+c;
    return gMcq('Tính bằng cách thuận tiện: '+gFmt(a)+' + '+gFmt(b)+' + '+gFmt(c)+' = ?',
      gFmt(kq), [gFmt(kq+100),gFmt(kq-100),gFmt(kq+10)],
      'Ghép '+gFmt(a)+' + '+gFmt(c)+' = 1.000 trước (tính chất giao hoán, kết hợp), rồi cộng '+gFmt(b)+'.');
  },
  tonghieu: function(){
    var hieu=gR(4,60)*2, be=gR(50,400), lon=be+hieu, tong=be+lon;
    var ctx=gPick([['Hai lớp 4A và 4B quyên góp được tổng cộng {T} quyển sách','lớp góp nhiều','lớp góp ít','quyển sách'],
                   ['Hai thùng dầu chứa tổng cộng {T} lít dầu','thùng lớn','thùng bé','lít dầu'],
                   ['Bố và con cân nặng tổng cộng {T} kg','bố','con','kg']]);
    return gSolve(
      ctx[0].replace('{T}',gFmt(tong))+', biết '+ctx[1]+' hơn '+ctx[2]+' '+hieu+' '+ctx[3].split(' ')[0]+'. Hỏi mỗi bên bao nhiêu '+ctx[3]+'?',
      ['Bài cho biết gì? (tổng và hiệu) Bài hỏi gì? Em nhớ dạng "tìm hai số khi biết tổng và hiệu" chứ?',
       'Số bé = (tổng − hiệu) : 2. Em thử tính số bé trước xem!',
       'Số bé = ('+gFmt(tong)+' − '+hieu+') : 2 = '+gFmt(be)+'. Vậy số lớn = số bé + hiệu. Em tính nốt nhé!'],
      'Bài giải\nSố bé là: ('+gFmt(tong)+' − '+hieu+') : 2 = '+gFmt(be)+' ('+ctx[3]+')\nSố lớn là: '+gFmt(be)+' + '+hieu+' = '+gFmt(lon)+' ('+ctx[3]+')\nĐáp số: '+gFmt(be)+' và '+gFmt(lon)+' '+ctx[3],
      gFmt(be)+' và '+gFmt(lon));
  },
  nhanchia1: function(){
    var op=gPick(['×',':']);
    if(op==='×'){ var a=gR(1200,9800), b=gR(2,9); return gFill('Đặt tính rồi tính:  '+gFmt(a)+' × '+b+' = ___', a*b, [String(a*b),gFmt(a*b)]); }
    var b=gR(2,9), kq=gR(1200,9800), a=kq*b;
    return gFill('Đặt tính rồi tính:  '+gFmt(a)+' : '+b+' = ___', kq, [String(kq),gFmt(kq)]);
  },
  nhan10: function(){
    var a=gR(12,98), m=gPick([10,100,1000]);
    var op=gPick(['×',':']);
    if(op==='×') return gFill(a+' × '+gFmt(m)+' = ___', a*m, [String(a*m),gFmt(a*m)]);
    return gFill(gFmt(a*m)+' : '+gFmt(m)+' = ___', a, [String(a)]);
  },
  nhanchia2: function(){
    var op=gPick(['×',':']);
    if(op==='×'){ var a=gR(120,980), b=gR(12,89); return gFill('Đặt tính rồi tính:  '+gFmt(a)+' × '+b+' = ___', a*b, [String(a*b),gFmt(a*b)]); }
    var b=gR(12,89), kq=gR(24,860), a=kq*b;
    return gFill('Đặt tính rồi tính:  '+gFmt(a)+' : '+b+' = ___', kq, [String(kq),gFmt(kq)]);
  },
  tbc: function(){
    var n=gPick([3,4]), arr=[], i;
    var base=gR(40,90);
    for(i=0;i<n;i++) arr.push(base+gR(-8,8)); // các số quanh mức trung bình, luôn dương
    var tong=arr.reduce(function(s,x){return s+x;},0);
    while(tong%n!==0){ arr[0]++; tong++; }
    var tb=tong/n;
    var ctx=gPick([['bạn','số quyển vở quyên góp được','quyển'],['ngày','số trang sách '+gPick(G_TEN)+' đọc được','trang'],['tổ','số cây trồng được','cây']]);
    return gSolve(
      'Trong '+n+' '+ctx[0]+', '+ctx[1]+' lần lượt là: '+arr.join(', ')+' '+ctx[2]+'. Hỏi trung bình mỗi '+ctx[0]+' được bao nhiêu '+ctx[2]+'?',
      ['Muốn tìm trung bình cộng, em làm 2 bước gì nhỉ? (Gợi ý: tính tổng trước)',
       'Bước 1: cộng hết lại. Bước 2: lấy tổng chia cho số '+ctx[0]+' ('+n+').',
       'Tổng là '+arr.join(' + ')+' = '+tong+'. Giờ lấy '+tong+' : '+n+' — em tính nốt!'],
      'Bài giải\nTổng là: '+arr.join(' + ')+' = '+tong+' ('+ctx[2]+')\nTrung bình mỗi '+ctx[0]+' là: '+tong+' : '+n+' = '+tb+' ('+ctx[2]+')\nĐáp số: '+tb+' '+ctx[2],
      String(tb));
  },
  rutvedonvi: function(){
    var dongia=gR(3,15)*1000, n1=gR(3,6), n2=gR(7,12);
    var ctx=gPick([['quyển vở','mua'],['cái bút','mua'],['gói kẹo','mua']]);
    return gSolve(
      gPick(G_TEN)+' '+ctx[1]+' '+n1+' '+ctx[0]+' hết '+gFmt(dongia*n1)+' đồng. Hỏi '+ctx[1]+' '+n2+' '+ctx[0]+' như thế hết bao nhiêu tiền?',
      ['Dạng "rút về đơn vị" đấy! Bước đầu tiên là tìm giá của MẤY '+ctx[0]+'?',
       'Tìm giá 1 '+ctx[0]+' trước: lấy '+gFmt(dongia*n1)+' : '+n1+'.',
       'Giá 1 '+ctx[0]+' là '+gFmt(dongia)+' đồng. Vậy '+n2+' '+ctx[0]+' thì nhân lên — em tính nốt!'],
      'Bài giải\nGiá tiền 1 '+ctx[0]+' là: '+gFmt(dongia*n1)+' : '+n1+' = '+gFmt(dongia)+' (đồng)\n'+n2+' '+ctx[0]+' hết: '+gFmt(dongia)+' × '+n2+' = '+gFmt(dongia*n2)+' (đồng)\nĐáp số: '+gFmt(dongia*n2)+' đồng',
      gFmt(dongia*n2)+' đồng');
  },
  rutgonps: function(){
    var k=gR(2,6), a=gR(1,6), b=a+gR(1,6);
    var g=gGcd(a,b); a/=g; b/=g;
    return gFill('Rút gọn phân số: '+(a*k)+'/'+(b*k)+' = ___', a+'/'+b, [a+'/'+b]);
  },
  sosanhps: function(){
    var b=gR(4,12), a1=gR(1,b-1), a2=gR(1,b-1);
    while(a2===a1) a2=gR(1,b-1);
    return gFill('Điền dấu >, < hoặc = :  '+a1+'/'+b+' ___ '+a2+'/'+b, a1>a2?'>':'<', [a1>a2?'>':'<']);
  },
  congtrups: function(){
    var b=gR(5,12), a1=gR(1,b-2), a2=gR(1,b-a1-1);
    var op=gPick(['+','-']);
    if(op==='+'){ var t=a1+a2, g=gGcd(t,b); return gFill('Tính: '+a1+'/'+b+' + '+a2+'/'+b+' = ___ (rút gọn nếu được)', (t/g)+'/'+(b/g), [(t/g)+'/'+(b/g), t+'/'+b]); }
    var lon=Math.max(a1+a2,a1), nho=Math.min(a1,a2); // đảm bảo dương
    var t=lon-nho, g=gGcd(t||1,b);
    return gFill('Tính: '+lon+'/'+b+' − '+nho+'/'+b+' = ___ (rút gọn nếu được)', (t/g)+'/'+(b/g), [(t/g)+'/'+(b/g), t+'/'+b]);
  },
  nhanchiaps: function(){
    var a1=gR(1,5),b1=gR(2,6),a2=gR(1,5),b2=gR(2,6);
    var op=gPick(['×',':']);
    var ta,tb;
    if(op==='×'){ ta=a1*a2; tb=b1*b2; } else { ta=a1*b2; tb=b1*a2; }
    var g=gGcd(ta,tb);
    return gFill('Tính: '+a1+'/'+b1+' '+op+' '+a2+'/'+b2+' = ___ (rút gọn nếu được)', (ta/g)+'/'+(tb/g), [(ta/g)+'/'+(tb/g), ta+'/'+tb]);
  },
  timps: function(){
    var b=gPick([2,3,4,5,6]), a=gR(1,b-1), n=b*gR(4,15);
    var kq=n/b*a;
    var ctx=gPick(G_CTX);
    return gSolve(
      'Một rổ có '+n+' '+ctx.dv+'. '+gPick(G_TEN)+' lấy '+a+'/'+b+' số '+ctx.dv+' trong rổ. Hỏi bạn ấy lấy bao nhiêu '+ctx.dv+'?',
      ['Muốn tìm '+a+'/'+b+' của '+n+', em làm phép tính gì?',
       'Lấy '+n+' chia cho '+b+' trước (tìm 1 phần), rồi nhân với '+a+'.',
       n+' : '+b+' = '+(n/b)+'. Giờ nhân '+(n/b)+' × '+a+' — em tính nốt!'],
      'Bài giải\nSố '+ctx.dv+' bạn ấy lấy là: '+n+' : '+b+' × '+a+' = '+kq+' ('+ctx.dv+')\nĐáp số: '+kq+' '+ctx.dv,
      String(kq));
  }
};

// ánh xạ bài SGK → dạng sinh đề
var GEN_MAP = {
  1:['docso','sosanh'], 2:['congtru'], 3:['chanle'], 4:['bieuthuc'], 5:['tonghieu','rutvedonvi'], 6:['docso','congtru','chanle'],
  10:['docso','hanglop'], 11:['hanglop'], 12:['hanglop','docso'], 13:['lamtron'], 14:['sosanh'], 15:['sosanh','docso'], 16:['hanglop','lamtron','sosanh'],
  17:['doidonvi_kl'], 18:['doidonvi_dt'], 19:['doidonvi_tg'], 20:['doidonvi_kl','doidonvi_tg'], 21:['doidonvi_kl','doidonvi_dt','doidonvi_tg'],
  22:['congtru'], 23:['congtru'], 24:['tinhthuantien'], 25:['tonghieu'], 26:['congtru','tinhthuantien','tonghieu'],
  33:['docso','hanglop','sosanh'], 34:['congtru','tinhthuantien'], 36:['doidonvi_kl','doidonvi_tg'], 37:['congtru','tonghieu','lamtron'],
  38:['nhanchia1'], 39:['nhanchia1'], 40:['tinhthuantien'], 41:['nhan10'], 42:['nhanchia2'], 43:['nhanchia2'], 44:['nhanchia2'],
  45:['lamtron','nhanchia2'], 46:['tbc'], 47:['rutvedonvi'], 48:['nhanchia2','tbc','rutvedonvi'],
  53:['rutgonps'], 54:['rutgonps'], 55:['rutgonps'], 56:['rutgonps'], 57:['congtrups'], 58:['sosanhps'], 59:['rutgonps','sosanhps'],
  60:['congtrups'], 61:['congtrups'], 62:['congtrups'], 63:['nhanchiaps'], 64:['nhanchiaps'], 65:['timps'], 66:['nhanchiaps','timps'],
  67:['docso','hanglop','lamtron'], 68:['congtru','nhanchia2','nhan10'], 69:['rutgonps','sosanhps'], 70:['congtrups','nhanchiaps','timps'],
  71:['doidonvi_dt','doidonvi_kl'], 72:['tbc'], 73:['tonghieu','rutvedonvi','tbc','timps']
};

function genToanQ(so){
  var kinds=GEN_MAP[so]; if(!kinds||!kinds.length) return null;
  try{ return GEN_TOAN[gPick(kinds)](); }catch(e){ return null; }
}

// ═══ GẮN VÀO ENGINE ═══

// 1) Xáo trộn đáp án trắc nghiệm mỗi lần hiện (chống học vẹt vị trí)
var _pcQ_gen = pcQ;
pcQ = function(){
  try{
    var q=P.qs[P.qi];
    if(q && !q._shuf && (q.type==='mcq'||q.type==='read'||q.type==='listen') && Array.isArray(q.options)){
      var dung=q.options[q.a];
      q.options=gShuf(q.options);
      q.a=q.options.indexOf(dung);
      q._shuf=1;
    }
  }catch(e){}
  _pcQ_gen();
};

// 2) Luyện lại 1 bài Toán đã làm → thay ~nửa câu tĩnh bằng biến thể mới + thêm 2 câu mới
var _pcStart_genwrap = pcStart;
pcStart = function(bi){
  _pcStart_genwrap(bi);
  try{
    if(!P.file || !P.bai) return;
    if(P.file.indexOf('/toan/')<0 && P.file.indexOf('/on3/')<0) return;
    var so=P.bai.so;
    if(!(P.file.indexOf('/on3/')>=0?GEN_ON3_MAP[so]:GEN_MAP[so])) return;
    var attempted = !!pcProg()[P.mon+'|'+P.file+'|'+so];
    var extra = attempted ? 3 : 1;
    if(attempted){
      // thay 1/2 số câu fill/mcq bằng biến thể mới toanh
      P.qs.forEach(function(q,i){
        if((q.type==='fill'||q.type==='mcq') && Math.random()<0.5){
          var v=genAnyQ(so,P.file);
          if(v){ v._i=200+i; v._f=P.file; v._so=so; P.qs[i]=v; }
        }
      });
    }
    for(var k=0;k<extra;k++){
      var v=genAnyQ(so,P.file);
      if(v){ v._i=300+k; v._f=P.file; v._so=so; P.qs.push(v); }
    }
  }catch(e){}
};

// 3) Nhiệm vụ ngày: thêm biến thể mới cho các bài Toán trong nhiệm vụ
function genMissionAug(){
  try{
    var seen={};
    P.qs.slice().forEach(function(q){
      if(q._f && (q._f.indexOf('/toan/')>=0||q._f.indexOf('/on3/')>=0) && q._so && !seen[q._f+q._so] && q.type!=='theory'){
        seen[q._f+q._so]=1;
        var v=genAnyQ(q._so,q._f);
        if(v){ v._i=400+q._so; v._f=q._f; v._so=q._so; v._mode=q._mode; P.qs.push(v); }
      }
    });
  }catch(e){}
}

// ═══ MÁY SINH ĐỀ ÔN HÈ LỚP 3 (phạm vi kiến thức lớp 3) ═══
var GEN_ON3_KINDS = {
  docso3: function(){
    var a=gR(1000,99999), b=a+gPick([-1,1])*gR(1,90)*10;
    return gFill('Điền dấu >, < hoặc = :  '+gFmt(a)+' ___ '+gFmt(b), a>b?'>':(a<b?'<':'='), [a>b?'>':(a<b?'<':'=')]);
  },
  congtru3: function(){
    var a=gR(1200,86000), b=gR(1100,Math.min(a-100,40000));
    var op=gPick(['+','-']); var kq=op==='+'?a+b:a-b;
    return gFill('Đặt tính rồi tính:  '+gFmt(a)+' '+op+' '+gFmt(b)+' = ___', kq, [String(kq),gFmt(kq)]);
  },
  timx3: function(){
    var kind=gPick(['nhan','chia','cong','tru']);
    if(kind==='nhan'){ var b=gR(2,9),x=gR(12,120),a=b*x; return gFill('Tìm x, biết:  x × '+b+' = '+gFmt(a), x, [String(x),gFmt(x)]); }
    if(kind==='chia'){ var b=gR(2,9),kq=gR(12,120),x=kq*b; return gFill('Tìm x, biết:  x : '+b+' = '+kq, x, [String(x),gFmt(x)]); }
    if(kind==='cong'){ var a=gR(120,900),t2=gR(1000,9000); return gFill('Tìm x, biết:  x + '+gFmt(a)+' = '+gFmt(t2+a), t2, [String(t2),gFmt(t2)]); }
    var a=gR(120,900),x=gR(1000,9000); return gFill('Tìm x, biết:  x − '+gFmt(a)+' = '+gFmt(x-a), x, [String(x),gFmt(x)]);
  },
  lamtron3: function(){
    var n=gR(1200,98000);
    var hang=gPick([['nghìn',1000],['chục nghìn',10000]]);
    var kq=Math.round(n/hang[1])*hang[1];
    return gMcq('Làm tròn số '+gFmt(n)+' đến hàng '+hang[0]+' được:', gFmt(kq),
      [gFmt(kq+hang[1]),gFmt(Math.max(0,kq-hang[1])),gFmt(kq+2*hang[1])],
      'Nhìn chữ số bên phải hàng '+hang[0]+': từ 5 trở lên tròn lên, dưới 5 tròn xuống.');
  },
  bangnhan: function(){
    var a=gR(2,9), b=gR(2,9);
    if(Math.random()<0.5) return gFill(a+' × '+b+' = ___', a*b, [String(a*b)]);
    return gFill((a*b)+' : '+a+' = ___', b, [String(b)]);
  },
  nhan3: function(){
    var a=gR(24,320), b=gR(2,9);
    return gFill('Đặt tính rồi tính:  '+a+' × '+b+' = ___', a*b, [String(a*b),gFmt(a*b)]);
  },
  chia3: function(){
    var b=gR(2,9), kq=gR(24,160), a=kq*b;
    return gFill('Đặt tính rồi tính:  '+a+' : '+b+' = ___', kq, [String(kq)]);
  },
  gapgiam: function(){
    var kind=gPick(['gap','giam']);
    var ctx=gPick(G_CTX), ten=gPick(G_TEN);
    if(kind==='gap'){
      var a=gR(4,25), k=gR(2,6);
      return gSolve(ten+' có '+a+' '+ctx.dv+'. Anh của bạn ấy có số '+ctx.dv+' gấp '+k+' lần. Hỏi anh có bao nhiêu '+ctx.dv+'?',
        ['"Gấp '+k+' lần" nghĩa là làm phép tính gì nhỉ?','Gấp lên = phép NHÂN. Lấy '+a+' × '+k+'.','Em tính '+a+' × '+k+' xem bằng bao nhiêu!'],
        'Bài giải\nAnh có số '+ctx.dv+' là: '+a+' × '+k+' = '+(a*k)+' ('+ctx.dv+')\nĐáp số: '+(a*k)+' '+ctx.dv, String(a*k));
    }
    var k=gR(2,6), kq=gR(4,25), a=kq*k;
    return gSolve(ten+' có '+a+' '+ctx.dv+'. Sau khi cho bạn, số '+ctx.dv+' giảm đi '+k+' lần. Hỏi còn lại bao nhiêu '+ctx.dv+'?',
      ['"Giảm đi '+k+' lần" là phép tính gì?','Giảm đi = phép CHIA. Lấy '+a+' : '+k+'.','Em tính '+a+' : '+k+' nhé!'],
      'Bài giải\nSố '+ctx.dv+' còn lại là: '+a+' : '+k+' = '+kq+' ('+ctx.dv+')\nĐáp số: '+kq+' '+ctx.dv, String(kq));
  },
  phanmay: function(){
    var b=gPick([2,3,4,5,6,7,8,9]), kq=gR(3,12), n=b*kq;
    return gFill('Tìm 1/'+b+' của '+n+' :  ___', kq, [String(kq)]);
  },
  chuvi3: function(){
    if(Math.random()<0.5){
      var d=gR(8,30), r=gR(3,d-1);
      return gSolve('Một hình chữ nhật có chiều dài '+d+' cm, chiều rộng '+r+' cm. Tính chu vi hình chữ nhật đó.',
        ['Em còn nhớ công thức chu vi hình chữ nhật không?','Chu vi = (dài + rộng) × 2.','('+d+' + '+r+') × 2 — em tính nốt!'],
        'Bài giải\nChu vi hình chữ nhật là: ('+d+' + '+r+') × 2 = '+((d+r)*2)+' (cm)\nĐáp số: '+((d+r)*2)+' cm', ((d+r)*2)+' cm');
    }
    var c=gR(5,25);
    return gFill('Hình vuông có cạnh '+c+' cm. Chu vi hình vuông là ___ cm.', c*4, [String(c*4)]);
  },
  doidv3: function(){
    var v=gPick([
      function(){var n=gR(2,9);return [n+' m = ___ cm', n*100];},
      function(){var n=gR(2,9);return [n+' kg = ___ g', n*1000];},
      function(){var n=gR(2,9);return [n+' l = ___ ml', n*1000];},
      function(){var n=gR(2,9);return [n+' km = ___ m', n*1000];},
      function(){var n=gR(2,9);return [n+' giờ = ___ phút', n*60];}
    ])();
    return gFill(v[0], v[1], [String(v[1]),gFmt(v[1])]);
  },
  tien3: function(){
    var to=gPick([1000,2000,5000]), n=gR(2,8);
    return gFill('Em có '+n+' tờ tiền '+gFmt(to)+' đồng. Em có tất cả ___ đồng.', to*n, [String(to*n),gFmt(to*n)]);
  }
};
var GEN_ON3_MAP = {
  1:['docso3'], 2:['congtru3'], 3:['timx3'], 4:['lamtron3'],
  5:['bangnhan'], 6:['nhan3'], 7:['chia3'], 8:['gapgiam'], 9:['phanmay'], 10:['gapgiam'],
  11:['chuvi3'], 12:['doidv3'], 13:['doidv3'], 15:['tien3']
};
function genOn3Q(so){
  var kinds=GEN_ON3_MAP[so]; if(!kinds) return null;
  try{ return GEN_ON3_KINDS[gPick(kinds)](); }catch(e){ return null; }
}
// mở rộng: sinh biến thể cho cả bài ôn hè
function genAnyQ(so, f){
  if(f && f.indexOf('/on3/')>=0) return genOn3Q(so);
  if(f && f.indexOf('/toan/')>=0) return genToanQ(so);
  return null;
}
