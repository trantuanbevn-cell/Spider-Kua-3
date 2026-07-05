// ═══════════════════════════════════════════════
// FURY VOICE — Gemini TTS (giọng tự nhiên) + fallback giọng máy
// ═══════════════════════════════════════════════
// speak(text)        : đọc tiếng Việt giọng Fury
// speakEN(text, cb)  : đọc tiếng Anh (bài nghe Tiếng Anh)
// Bật/tắt giọng xịn: localStorage 'tts_mode' = 'gemini' | 'local'

var _ttsCache = {};      // cache audio đã tạo (đỡ tốn quota khi nghe lại)
var _ttsAudio = null;    // audio đang phát
var _ttsBusy = false;

function ttsMode(){ return localStorage.getItem('tts_mode') || 'gemini'; }

function stopSpeakAll(){
  if(_ttsAudio){ try{_ttsAudio.pause();}catch(e){} _ttsAudio=null; }
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  var el=document.getElementById('spkEl'); if(el) el.classList.remove('on');
}

// PCM 16-bit 24kHz (Gemini trả về) → WAV để <audio> phát được
function _pcmToWav(b64, sampleRate){
  var bin = atob(b64), n = bin.length;
  var buf = new ArrayBuffer(44 + n), v = new DataView(buf);
  function ws(o,s){ for(var i=0;i<s.length;i++) v.setUint8(o+i, s.charCodeAt(i)); }
  ws(0,'RIFF'); v.setUint32(4, 36+n, true); ws(8,'WAVE'); ws(12,'fmt ');
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
  v.setUint32(24,sampleRate,true); v.setUint32(28,sampleRate*2,true);
  v.setUint16(32,2,true); v.setUint16(34,16,true); ws(36,'data'); v.setUint32(40,n,true);
  for(var i=0;i<n;i++) v.setUint8(44+i, bin.charCodeAt(i));
  return new Blob([buf], {type:'audio/wav'});
}

function _cleanForVoice(text){
  return (text||'')
    .replace(/\[.*?\]/g,'')
    .replace(/[*_`#<>]/g,'')
    .replace(/S\.H\.I\.E\.L\.D\./gi,'Shield')
    .replace(/\n+/g,'. ')
    .trim();
}

// Gọi Gemini TTS. instr: chỉ dẫn giọng đọc. Trả về Promise<Blob|null>
async function _geminiTTS(text, instr){
  var k = (typeof gemKey!=='undefined' && gemKey) ? gemKey : localStorage.getItem('gem3');
  if(!k) return null;
  var key = instr + '|' + text;
  if(_ttsCache[key]) return _ttsCache[key];
  try{
    var r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key='+k, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        contents:[{parts:[{text: instr + ': ' + text}]}],
        generationConfig:{
          responseModalities:['AUDIO'],
          speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Puck'}}}
        }
      })
    });
    if(!r.ok) return null;
    var j = await r.json();
    var d = j.candidates && j.candidates[0] && j.candidates[0].content
         && j.candidates[0].content.parts && j.candidates[0].content.parts[0]
         && j.candidates[0].content.parts[0].inlineData;
    if(!d || !d.data) return null;
    var rate = 24000;
    var mm = /rate=(\d+)/.exec(d.mimeType||''); if(mm) rate = parseInt(mm[1]);
    var blob = _pcmToWav(d.data, rate);
    _ttsCache[key] = blob;
    return blob;
  }catch(e){ return null; }
}

async function _playBlob(blob){
  return new Promise(function(res){
    stopSpeakAll();
    _ttsAudio = new Audio(URL.createObjectURL(blob));
    var el = document.getElementById('spkEl');
    if(el) el.classList.add('on');
    _ttsAudio.onended = _ttsAudio.onerror = function(){ if(el) el.classList.remove('on'); _ttsAudio=null; res(); };
    _ttsAudio.play().catch(function(){ if(el) el.classList.remove('on'); res(); });
  });
}

// ═══ API chính: thay thế speak() cũ ═══
async function speak(text){
  var c = _cleanForVoice(text);
  if(!c) return;
  if(ttsMode()==='gemini' && !_ttsBusy){
    _ttsBusy = true;
    var blob = await _geminiTTS(c.slice(0,600),
      'Đọc bằng tiếng Việt, giọng nam trẻ ấm áp, thân thiện như anh trai nói chuyện với em nhỏ, tốc độ vừa phải, tự nhiên có ngữ điệu');
    _ttsBusy = false;
    if(blob){ _playBlob(blob); return; }
  }
  if(typeof speakLocal==='function') speakLocal(text); // fallback giọng máy
}

// Đọc tiếng Anh cho bài nghe (practice)
async function speakEN(text, cb){
  var blob = await _geminiTTS(text, 'Read this in clear, natural English at a slow, friendly pace suitable for a young learner');
  if(blob){ _playBlob(blob).then(function(){ if(cb) cb(); }); return; }
  // fallback
  if(window.speechSynthesis){
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang='en-US'; u.rate=0.8;
    var vv = window.speechSynthesis.getVoices();
    var en = vv.find(function(v){return v.lang.indexOf('en')===0;});
    if(en) u.voice = en;
    u.onend = function(){ if(cb) cb(); };
    window.speechSynthesis.speak(u);
  } else if(cb) cb();
}
