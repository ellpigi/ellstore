
(function(){
'use strict';
const CFG={
  apiKey:"AIzaSyDgivYR6mljjYyeFH286UA8auWkVJDZUy0",
  authDomain:"ellpigi-web-store.firebaseapp.com",
  databaseURL:"https://ellpigi-web-store-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId:"ellpigi-web-store",
  storageBucket:"ellpigi-web-store.firebasestorage.app",
  messagingSenderId:"531471360663",
  appId:"1:531471360663:web:28f8f71943e9cc42953fd2",
  measurementId:"G-EPXFJ2FVZW"
};
const DEFAULT_API={
  baseurlnexray:"https://api.nexray.eu.cc",
  baseurlourin:"https://api.ourin.my.id",
  baseurlcuki:"https://api.cuki.biz.id",
  baseurlalip:"https://docs-alip.clutch.web.id",
  baseurlbotcahx:"https://api.botcahx.eu.org",
  apikeyalip:"alipaiapikeybaru",
  apikeycuki:"cuki-x",
  apikeybotcahx:"ellapikey",
  zakkiToken:"014a3b134589ee",
  relayUrl:"https://ell.daffaaryagossan61.workers.dev",
  fayuApiId:"180161",
  fayuApiKey:"xytnjh-78p8pn-ibj7qs-jp82lt-i3xl8i"
};
const MEDIA_DEFAULT={ bgImage:'', bgVideo:'', bgAudio:'', siteTitle:'Remi AI', siteSub:'STORE • V1' };
const GACHA_DEFAULT={ freePerDay:1, spin1Price:2000, spin10Price:10000, rewards:[
  {name:'Saldo 500', type:'saldo', amount:500, weight:35, icon:'💰'},
  {name:'Saldo 1K', type:'saldo', amount:1000, weight:22, icon:'💸'},
  {name:'Saldo 2K', type:'saldo', amount:2000, weight:12, icon:'💎'},
  {name:'Zonk Tipis', type:'none', amount:0, weight:25, icon:'🧊'},
  {name:'Premium 1 Hari', type:'premium_days', amount:1, weight:5, icon:'👑'},
  {name:'Jackpot 10K', type:'saldo', amount:10000, weight:1, icon:'🔥'}
]};
let app=null,db=null,dbReady=false,chatOff=null,usersOff=null,productsOff=null,catsOff=null,settingsOff=null,lbOff=null,streakOff=null,activeDmOff=null;
function has(fn){return typeof window[fn]==='function'}
function call(fn,...a){try{ if(has(fn)) return window[fn](...a) }catch(e){console.error('[RemiDB]',fn,e)}}
function dom(id){return document.getElementById(id)}
function toast2(t,type=''){ if(has('toast')) return window.toast(t,type); console[type==='err'?'error':'log'](t) }
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function safeLsGet(k,d){try{return window.ls?ls.get(k,d):JSON.parse(localStorage.getItem(k)||'null')??d}catch{return d}}
function safeLsSet(k,v){try{return window.ls?ls.set(k,v):localStorage.setItem(k,JSON.stringify(v))}catch(e){console.warn(e)}}
function getMe(){try{return has('me')?me():null}catch{return null}}
function getUsersSafe(){try{return has('getUsers')?getUsers():safeLsGet('users',{})}catch{return {}}}
function saveUsersSafe(u){try{ if(has('saveUsers')) return saveUsers(u); safeLsSet('users',u)}catch(e){console.error(e)}}
function makeId2(prefix='ID'){try{return has('makeId')?makeId(prefix):prefix+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}catch{return prefix+Date.now()}}
function fmt2(n){try{return has('fmt')?fmt(n):'Rp'+(Number(n)||0).toLocaleString('id-ID')}catch{return 'Rp'+(Number(n)||0).toLocaleString('id-ID')}}
function cleanObj(o){return JSON.parse(JSON.stringify(o||{}))}
function loadScript(src){return new Promise((resolve,reject)=>{ if(document.querySelector(`script[src="${src}"]`)) return resolve(); const sc=document.createElement('script'); sc.src=src; sc.async=true; sc.onload=resolve; sc.onerror=()=>reject(new Error('Gagal load '+src)); document.head.appendChild(sc); })}
async function initFirebase(){
  try{
    await loadScript('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js');
    app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(CFG);
    db = firebase.database(); dbReady=true;
    window.RemiDB={db,ref:(p)=>db.ref(p),seed:seedFirebase,ready:true,getApi:()=>window.constBaseUrl||DEFAULT_API};
    await seedFirebase();
    attachRealtime();
    toast2('Firebase realtime aktif ✅');
  }catch(e){ console.error('[Firebase init gagal]',e); toast2('Firebase realtime gagal, mode lokal aktif.','warn'); }
}
function ref(p){ if(!dbReady) throw new Error('Firebase belum siap'); return db.ref(p) }
async function once(p){ const snap=await ref(p).once('value'); return snap.val() }
async function setIfEmpty(p,val){ const snap=await ref(p).once('value'); if(snap.exists()) return snap.val(); await ref(p).set(val); return val }
function localProducts(){ try{return safeLsGet('products', typeof defaultProducts!=='undefined'?defaultProducts:[])}catch{return []} }
function categoriesFromProducts(ps){ const cats=[...new Set((ps||[]).map(p=>p.cat||p.category).filter(Boolean))]; return cats.reduce((a,c,i)=>{a[c.replace(/[.#$\[\]/]/g,'_')]={id:c,name:c,order:i}; return a},{all:{id:'all',name:'Semua',order:-1}}) }
async function seedFirebase(){
  if(!dbReady) return;
  const users=getUsersSafe();
  const owner=users.ellpigi || {username:'ellpigi',display:'ellpigi',pw:(has('hash')?hash('ellpigi-owner1237'):'ellpigi-owner1237'),plain:'ellpigi-owner1237',saldo:999000000,avatar:'',bio:'Owner Remi AI Store.',gender:'rahasia',orders:0,spent:0,streak:0,role:'owner',ref:'ELLPGI'};
  users.ellpigi=owner; saveUsersSafe(users);
  await setIfEmpty('_schema',{name:'Remi AI Store Firebase DB',version:'rtfix18',updatedAt:Date.now()});
  await setIfEmpty('settings/api', {...DEFAULT_API, ...safeLsGet('apiSettings',{})});
  await setIfEmpty('settings/site', MEDIA_DEFAULT);
  await setIfEmpty('settings/media', {bgImage:'',bgVideo:'',bgAudio:''});
  await setIfEmpty('settings/gacha', GACHA_DEFAULT);
  await setIfEmpty('settings/roles',{owner:{emoji:'👑',color:'#ffd45e'},admin:{emoji:'🛡️',color:'#43d383'},premium:{emoji:'💎',color:'#b515ff'},user:{emoji:'',color:'#edf6ff'}});
  await setIfEmpty('settings/limits',{freeDaily:10, resetHour:'00:00 WIB'});
  await setIfEmpty('settings/badWords', safeLsGet('badWords',['anjing','tai','brengsek','kontol','memek','ngentod','tolol','goblok','bangsat']));
  await setIfEmpty('settings/sensorOn', safeLsGet('sensorOn',true));
  await setIfEmpty('users', users);
  await setIfEmpty('accounts',{_init:true});
  await setIfEmpty('devices',{_init:true});
  await setIfEmpty('products', arrayToObj(localProducts(),'id'));
  await setIfEmpty('categories', categoriesFromProducts(localProducts()));
  const blank=['chat','privateChats','orders','autoOrders','ownerNotifs','transactions','deposits','paidDeposits','purchaseNotifs','streaks','leaderboard','reports','reviews','referrals','limits','topups','live/online','logs'];
  for(const p of blank) await setIfEmpty(p,{_init:true,createdAt:Date.now()});
  await ref('logs/lastSeed').set({at:Date.now(),by:getMe()?.username||'system'});
  return true;
}
function arrayToObj(arr,key='id'){ const o={}; (arr||[]).forEach((x,i)=>{ const k=String(x?.[key]??i).replace(/[.#$\[\]/]/g,'_'); o[k]=cleanObj(x); }); return o }
function objToArray(o){ return Object.entries(o||{}).filter(([k,v])=>k!=='_init' && v && typeof v==='object').map(([k,v])=>({...v,_key:k})).sort((a,b)=>(a.order||a.time||a.id||0)-(b.order||b.time||b.id||0)) }
function applyApiSettings(api){
  api={...DEFAULT_API,...(api||{})}; window.constBaseUrl=api;
  safeLsSet('apiSettings',api); safeLsSet('apiProxyUrl',api.relayUrl||api.proxyUrl||''); safeLsSet('zakkiToken',api.zakkiToken||DEFAULT_API.zakkiToken);
  safeLsSet('fayuApiId',api.fayuApiId||api.apiIdProvider||'180161'); safeLsSet('fayuApiKey',api.fayuApiKey||api.apiKeyProvider||DEFAULT_API.fayuApiKey);
  safeLsSet('cukiKey',api.apikeycuki||DEFAULT_API.apikeycuki); safeLsSet('cukiBase',api.baseurlcuki||DEFAULT_API.baseurlcuki);
  safeLsSet('alipKey',api.apikeyalip||DEFAULT_API.apikeyalip); safeLsSet('botcahxKey',api.apikeybotcahx||DEFAULT_API.apikeybotcahx);
  safeLsSet('nexrayBase',api.baseurlnexray||DEFAULT_API.baseurlnexray); safeLsSet('ourinBase',api.baseurlourin||DEFAULT_API.baseurlourin);
  try{ if(window.APIS){ APIS.nexrayBase=api.baseurlnexray; APIS.ourinBase=api.baseurlourin; APIS.alipBase=api.baseurlalip; APIS.alipKey=api.apikeyalip; APIS.botcahxBase=api.baseurlbotcahx; APIS.botcahxKey=api.apikeybotcahx } if(window.CUKI_API){ CUKI_API.base=api.baseurlcuki; CUKI_API.key=api.apikeycuki }}catch{}
}
function attachRealtime(){
  if(!dbReady) return;
  settingsOff&&settingsOff(); settingsOff=ref('settings/api').on('value',s=>applyApiSettings(s.val()||DEFAULT_API));
  usersOff&&usersOff(); usersOff=ref('users').on('value',s=>{ const v=s.val()||{}; if(Object.keys(v).length){ saveUsersSafe(v); try{ const sess=safeLsGet('session'); if(sess && v[sess]) window.current=v[sess]; }catch{}; call('renderAccount'); call('renderHeader'); }});
  productsOff&&productsOff(); productsOff=ref('products').on('value',s=>{ const arr=objToArray(s.val()); if(arr.length){ safeLsSet('products',arr); call('renderCats'); call('renderProducts'); }});
  catsOff&&catsOff(); catsOff=ref('categories').on('value',s=>{ const arr=objToArray(s.val()).map(x=>x.name||x.id).filter(Boolean); if(arr.length) safeLsSet('categories',arr); });
  chatOff&&chatOff(); chatOff=ref('chat').limitToLast(500).on('value',s=>{ const arr=objToArray(s.val()).sort((a,b)=>(a.time||0)-(b.time||0)); safeLsSet('chat',arr); if(document.querySelector('#page-chat.active')||dom('chatMsgs')) call('renderChat'); });
  lbOff&&lbOff(); lbOff=ref('leaderboard').on('value',s=>{ const v=s.val(); if(v) {safeLsSet('leaderboard',v); call('renderLeader')}});
  streakOff&&streakOff(); streakOff=ref('streaks').on('value',s=>{ const v=s.val(); if(v) {safeLsSet('streaks',v); call('renderAll')}});
  ref('settings/site').on('value',s=>applySiteSettings(s.val()||{}));
  ref('settings/media').on('value',s=>applyMediaSettings(s.val()||{}));
  ref('settings/gacha').on('value',s=>safeLsSet('gachaSettings', {...GACHA_DEFAULT,...(s.val()||{})}));
}
function applySiteSettings(st){ const title=st.siteTitle||st.title||'Remi AI'; const sub=st.siteSub||st.subtitle||'STORE • V1'; const b=document.querySelector('.brand b'); const sp=document.querySelector('.brand span'); if(b)b.textContent=title; if(sp)sp.textContent=sub; }
function applyMediaSettings(m){
  document.querySelectorAll('.remiMediaBg,.remiBgAudio').forEach(x=>x.remove());
  const app=document.querySelector('.app'); if(!app) return;
  if(m.bgImage){ const d=document.createElement('div'); d.className='remiMediaBg'; d.style.cssText=`position:fixed;inset:0;z-index:-4;background:url(${m.bgImage}) center top/cover no-repeat;opacity:.22;pointer-events:none`; document.body.appendChild(d); }
  if(m.bgVideo){ const v=document.createElement('video'); v.className='remiMediaBg'; v.src=m.bgVideo; v.muted=true; v.loop=true; v.playsInline=true; v.autoplay=true; v.style.cssText='position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:-4;opacity:.18;pointer-events:none'; document.body.appendChild(v); v.play().catch(()=>{}); setInterval(()=>{try{ if(v.currentTime>5)v.currentTime=0 }catch{}},1000); }
  if(m.bgAudio){ const a=document.createElement('audio'); a.className='remiBgAudio'; a.src=m.bgAudio; a.loop=true; a.preload='none'; document.body.appendChild(a); const play=()=>a.play().catch(()=>{}); document.addEventListener('click',play,{once:true}); }
}
function syncUserToFirebase(username){ if(!dbReady||!username)return; const u=getUsersSafe()[username]; if(u) ref('users/'+safeKey(username)).update(cleanObj(u)); }
function safeKey(k){return String(k||'').replace(/[.#$\[\]/]/g,'_')}
/* Tool trigger fixes */
function ensureToolCards(){
  try{
    if(typeof defaultTools==='undefined') return;
    const extras=[['🌍','Check IP','Masukkan IP publik untuk melihat kota, negara, ISP, ASN, timezone, koordinat, dan link Google Maps.','iplookup'],['〰️','Text ⇄ Morse','Konversi teks ke kode Morse atau kode Morse ke teks. Logic offline, tidak butuh API.','morse']];
    const by={}; [...defaultTools,...extras].forEach(t=>{ if(!t||!t[3])return; by[t[3]]=t });
    const ordered=[...defaultTools.map(t=>by[t[3]]).filter(Boolean), ...extras.filter(t=>!defaultTools.some(x=>x&&x[3]===t[3]))];
    const seen=new Set(), final=[]; ordered.forEach(t=>{ if(!seen.has(t[3])){seen.add(t[3]); final.push(t)} });
    defaultTools.splice(0,defaultTools.length,...final);
  }catch(e){console.warn(e)}
}
const origRenderTools=window.renderTools; window.renderTools=function(){ ensureToolCards(); return origRenderTools?origRenderTools():null };
const origRunTool=window.runTool; window.runTool=function(a){ if(a==='iplookup')return openIpLookup(); if(a==='morse')return openMorseTool(); return origRunTool?origRunTool(a):toast2('Tool tidak dikenal: '+a,'err') };
function openIpLookup(){ call('openModal','🌍 Check IP',`<p class="muted">Masukkan IP publik. Hasil lokasi hanya perkiraan database ISP/VPN/CDN, bukan alamat rumah, tenang James Bond KW.</p><input class="input" id="ipLookupInput" placeholder="Contoh: 8.8.8.8"><button class="btn" style="width:100%;margin-top:10px" onclick="runIpLookupNow()">🔍 Cek IP</button><div id="ipLookupOut" style="margin-top:12px"></div>`) }
window.runIpLookupNow=async function(){ const ip=(dom('ipLookupInput')?.value||'').trim(); const out=dom('ipLookupOut'); if(!out)return; if(!/^(?:(?:\d{1,3}\.){3}\d{1,3}|[a-fA-F0-9:]{3,})$/.test(ip)) {out.innerHTML='<div class="panel"><b style="color:var(--red)">Format IP tidak valid.</b></div>';return} out.innerHTML='<div class="panel">⏳ Mengecek IP...</div>'; try{ let data=null; const r=await fetch('https://ipwho.is/'+encodeURIComponent(ip),{cache:'no-store'}); data=await r.json(); if(!data||data.success===false) throw new Error(data?.message||'IP tidak ditemukan'); const lat=data.latitude||data.lat,lon=data.longitude||data.lon; const map=(lat&&lon)?`https://www.google.com/maps?q=${lat},${lon}`:''; out.innerHTML=`<div class="panel"><h3>🌍 Hasil Check IP</h3><div class="stalkGrid"><div class="stalkMini"><span class="muted">IP</span><b>${escapeHtml(data.ip||ip)}</b></div><div class="stalkMini"><span class="muted">Tipe</span><b>${escapeHtml(data.type||'-')}</b></div><div class="stalkMini"><span class="muted">Kota</span><b>${escapeHtml(data.city||'-')}</b></div><div class="stalkMini"><span class="muted">Region</span><b>${escapeHtml(data.region||'-')}</b></div><div class="stalkMini"><span class="muted">Negara</span><b>${escapeHtml(data.country||'-')} ${escapeHtml(data.flag?.emoji||'')}</b></div><div class="stalkMini"><span class="muted">ISP</span><b>${escapeHtml(data.connection?.isp||'-')}</b></div><div class="stalkMini"><span class="muted">ORG</span><b>${escapeHtml(data.connection?.org||'-')}</b></div><div class="stalkMini"><span class="muted">ASN</span><b>${escapeHtml(data.connection?.asn||'-')}</b></div><div class="stalkMini"><span class="muted">Timezone</span><b>${escapeHtml(data.timezone?.id||'-')}</b></div><div class="stalkMini"><span class="muted">Koordinat</span><b>${escapeHtml(lat||'-')}, ${escapeHtml(lon||'-')}</b></div></div>${map?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:12px" target="_blank" href="${map}">🗺️ Buka Google Maps</a>`:''}</div>` }catch(e){ out.innerHTML=`<div class="panel"><b style="color:var(--red)">Fitur Check IP sedang kendala.</b><p class="muted">${escapeHtml(e.message||e)}</p></div>` }};
const MORSE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.','.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','/':'-..-.','(':'-.--.',')':'-.--.-','&':'.-...',':':'---...',';':'-.-.-.','=':'-...-','+':'.-.-.','-':'-....-','_':'..--.-','"':'.-..-.',"'":'.----.','$':'...-..-','@':'.--.-.'};
const MORSE_R=Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));
function openMorseTool(){ call('openModal','〰️ Text ⇄ Morse',`<p class="muted">Pilih mode, masukkan teks/kode Morse, lalu konversi. Spasi antar huruf pakai spasi, antar kata pakai /.</p><select id="morseMode"><option value="text2morse">Text → Morse</option><option value="morse2text">Morse → Text</option></select><textarea id="morseInput" style="margin-top:10px" placeholder="Contoh: REMI AI atau .-. . -- .. / .- .."></textarea><button class="btn" style="width:100%;margin-top:10px" onclick="runMorseNow()">⚡ Konversi</button><div class="panel" style="margin-top:12px"><b>Hasil</b><pre class="debugLine" id="morseOut" style="white-space:pre-wrap;font-size:13px"></pre><button class="btn ghost" style="width:100%;margin-top:8px" onclick="navigator.clipboard.writeText(document.getElementById('morseOut').textContent||'')">📋 Copy</button></div>`) }
window.runMorseNow=function(){ const mode=dom('morseMode')?.value; const input=dom('morseInput')?.value||''; let out=''; if(mode==='text2morse'){ out=input.toUpperCase().split('').map(ch=>ch===' '?' / ':(MORSE[ch]||ch)).join(' ').replace(/\s+\/\s+/g,' / '); }else{ out=input.trim().split(/\s*\/\s*/).map(word=>word.split(/\s+/).map(c=>MORSE_R[c]||'?').join('')).join(' '); } if(dom('morseOut')) dom('morseOut').textContent=out };
/* Auto order sewa bot */
const origOrder=window.order; window.order=function(id){ const ps=safeLsGet('products',[]); const p=ps.find(x=>String(x.id)===String(id)); if(p && /sewa.*bot|bot.*sewa/i.test((p.name||'')+' '+(p.cat||''))) return openSewaBotOrder(p); return origOrder?origOrder(id):toast2('Order function hilang.','err') };
function openSewaBotOrder(p){ const u=getMe(); call('openModal','🤖 Auto Order Sewa Bot',`<div style="text-align:center;font-size:48px">${escapeHtml(p.icon||'🤖')}</div><h2 style="text-align:center">${escapeHtml(p.name)}</h2><div class="panel"><div class="row"><span>Harga</span><b>${fmt2(p.price)}</b></div><div class="row"><span>Saldo</span><b style="color:var(--green)">${fmt2(u?.saldo||0)}</b></div></div><input class="input" id="sewaWa" placeholder="Nomor WhatsApp, contoh 628xxx"><div style="height:9px"></div><input class="input" id="sewaLink" placeholder="https://chat.whatsapp.com/xxxx"><div style="height:9px"></div><select id="sewaDurasi"><option value="7d">7 Hari</option><option value="30d" selected>30 Hari</option><option value="90d">90 Hari</option></select><textarea id="sewaNote" placeholder="Catatan tambahan..." style="margin-top:9px"></textarea><button class="btn green" style="width:100%;margin-top:10px" onclick="submitSewaBotAutoOrder('${escapeHtml(p.id)}')">🚀 Bayar & Kirim Auto Order</button><p class="muted">Jika bot gagal masuk grup, status akan jadi perlu owner. Bot panel kamu tinggal baca Firebase autoOrders.</p>`) }
window.submitSewaBotAutoOrder=async function(pid){ const p=safeLsGet('products',[]).find(x=>String(x.id)===String(pid)); const u=getMe(); if(!p||!u)return toast2('Produk/user tidak ditemukan.','err'); const wa=(dom('sewaWa')?.value||'').trim(); const link=(dom('sewaLink')?.value||'').trim(); const dur=(dom('sewaDurasi')?.value||'30d'); if(!/^62\d{7,15}$/.test(wa))return toast2('Nomor WA harus format 62xxxx.','warn'); if(!/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{15,}$/i.test(link))return toast2('Link grup WhatsApp tidak valid.','err'); if((u.saldo||0)<Number(p.price||0))return toast2('Saldo kurang, deposit dulu.','err'); const users=getUsersSafe(); users[u.username].saldo=(users[u.username].saldo||0)-Number(p.price||0); users[u.username].orders=(users[u.username].orders||0)+1; users[u.username].spent=(users[u.username].spent||0)+Number(p.price||0); saveUsersSafe(users); window.current=users[u.username]; const order={id:makeId2('AUTO'),type:'sewa_bot',productId:p.id,productName:p.name,buyer:u.username,buyerName:u.display||u.username,buyerJid:wa+'@s.whatsapp.net',wa,groupLink:link,duration:dur,days:dur==='7d'?7:dur==='90d'?90:30,price:Number(p.price||0),note:(dom('sewaNote')?.value||''),status:'pending',paid:true,createdAt:Date.now(),updatedAt:Date.now()}; const arr=safeLsGet('orders',[]); arr.unshift({...order,product:p.name,user:u.username}); safeLsSet('orders',arr.slice(0,200)); try{ if(dbReady){ await ref('users/'+safeKey(u.username)).update(cleanObj(users[u.username])); await ref('orders/'+safeKey(order.id)).set(order); await ref('autoOrders/'+safeKey(order.id)).set(order); await ref('ownerNotifs/'+safeKey(order.id)).set({id:order.id,type:'auto_order',title:'Order Sewa Bot Baru',text:`${order.buyerName} membeli ${order.productName}`,order,read:false,createdAt:Date.now()}); await ref('leaderboard/'+safeKey(u.username)).update({username:u.username,display:u.display||u.username,spent:users[u.username].spent||0,orders:users[u.username].orders||0,updatedAt:Date.now()}); }}catch(e){console.error(e); toast2('Order lokal dibuat, Firebase gagal: '+e.message,'warn')} call('closeModal'); call('renderAll'); toast2('Auto order dibuat. Bot akan cek Firebase.','warn') };
/* Realtime chat */
const origSendChat=window.sendChat; window.sendChat=async function(){ const el=dom('chatText'); const text=(el?.value||'').trim(); const u=getMe(); if(!text||!u)return; const msg={id:makeId2('MSG'),user:u.username,display:displayWithRole(u),text:(has('censorText')?censorText(text):text),time:Date.now()}; if(el)el.value=''; if(dbReady){ try{ await ref('chat/'+safeKey(msg.id)).set(msg); return }catch(e){console.warn(e)} } const arr=safeLsGet('chat',[]); arr.push(msg); safeLsSet('chat',arr.slice(-500)); call('renderChat'); };
const origSendChatImage=window.sendChatImage; window.sendChatImage=function(inp){ const f=inp.files&&inp.files[0]; if(!f)return; const r=new FileReader(); r.onload=async()=>{ const u=getMe(); const msg={id:makeId2('IMG'),user:u.username,display:displayWithRole(u),text:'',img:r.result,time:Date.now()}; if(dbReady){try{await ref('chat/'+safeKey(msg.id)).set(msg);return}catch(e){console.warn(e)}} const arr=safeLsGet('chat',[]); arr.push(msg); safeLsSet('chat',arr.slice(-500)); call('renderChat') }; r.readAsDataURL(f) };
function roleMeta(u){ const role=(u?.role||'user').toLowerCase(); const map={owner:{emoji:'👑',color:'#ffd45e'},admin:{emoji:'🛡️',color:'#43d383'},premium:{emoji:'💎',color:'#b515ff'},user:{emoji:'',color:'#edf6ff'}}; return map[role]||map.user }
function displayWithRole(u){ const m=roleMeta(u); return (m.emoji?m.emoji+' ':'')+(u.display||u.username) }
/* Realtime DM */
function dmPath(a,b){return 'privateChats/'+[safeKey(a),safeKey(b)].sort().join('_')}
const origOpenDM=window.openDM; window.openDM=function(username){ const meU=getMe(); if(!meU)return; if(activeDmOff){try{activeDmOff()}catch{}}; call('closeModal'); call('openModal','💌 Chat Pribadi @'+username,`<div class="msgs" id="dmMsgs" style="height:320px"><p class="muted">Memuat chat...</p></div><div class="chatInput"><button class="round" onclick="openEmojiPicker('dmText')">😀</button><input class="input" id="dmText" placeholder="Pesan pribadi..." onkeydown="if(event.key==='Enter')sendDM('${escapeHtml(username)}')"><button class="round" onclick="sendDM('${escapeHtml(username)}')">➤</button></div><button class="btn red" style="width:100%;margin-top:10px" onclick="blockUser('${escapeHtml(username)}')">🚫 Blokir User</button>`); if(dbReady){ activeDmOff=ref(dmPath(meU.username,username)).limitToLast(300).on('value',s=>{ const arr=objToArray(s.val()).sort((a,b)=>(a.time||0)-(b.time||0)); const box=dom('dmMsgs'); if(box){box.innerHTML=arr.map(m=>`<div class="msg ${m.user===meU.username?'me':''}"><div class="bubble">${escapeHtml(m.text)}</div></div>`).join('')||'<p class="muted">Belum ada pesan.</p>'; setTimeout(()=>box.scrollTop=box.scrollHeight,20)} }); } else if(origOpenDM) origOpenDM(username) };
const origSendDM=window.sendDM; window.sendDM=async function(username){ const input=dom('dmText'), text=(input?.value||'').trim(), u=getMe(); if(!text||!u)return; const msg={id:makeId2('DM'),user:u.username,to:username,text:(has('censorText')?censorText(text):text),time:Date.now(),read:false}; if(input)input.value=''; if(dbReady){ try{await ref(dmPath(u.username,username)+'/'+safeKey(msg.id)).set(msg); await ref('ownerNotifs/dm_'+safeKey(msg.id)).set({type:'dm',from:u.username,to:username,createdAt:Date.now(),read:false}); return}catch(e){console.warn(e)} } return origSendDM?origSendDM(username):null };
/* Profile/settings/product realtime */
const origSaveProfile=window.saveProfile; window.saveProfile=async function(){ if(origSaveProfile) origSaveProfile(); const u=getMe(); if(dbReady&&u) await ref('users/'+safeKey(u.username)).update(cleanObj(u)); };
const origSetUserSaldo=window.setUserSaldo; window.setUserSaldo=async function(){ if(origSetUserSaldo) origSetUserSaldo(); if(dbReady){ const user=dom('admUser')?.value; const users=getUsersSafe(); if(user&&users[user]) await ref('users/'+safeKey(user)).update(cleanObj(users[user])); }};
const origAddProductAdmin=window.addProductAdmin; window.addProductAdmin=async function(){ if(origAddProductAdmin) origAddProductAdmin(); if(dbReady){ const ps=safeLsGet('products',[]); await ref('products').set(arrayToObj(ps,'id')); await ref('categories').set(categoriesFromProducts(ps)); } };
const origSaveWebSetting=window.saveWebSetting; window.saveWebSetting=async function(){ if(origSaveWebSetting) origSaveWebSetting(); if(dbReady){ await ref('settings/site').update({siteTitle:dom('admTitle')?.value||'Remi AI',siteSub:'STORE • V1',updatedAt:Date.now()}); }};
const origSaveApi=window.saveApiSetting; window.saveApiSetting=async function(){ if(origSaveApi) origSaveApi(); const api={...DEFAULT_API, baseurlnexray:dom('admNexrayBase')?.value||safeLsGet('nexrayBase',DEFAULT_API.baseurlnexray), baseurlourin:dom('admOurinBase')?.value||safeLsGet('ourinBase',DEFAULT_API.baseurlourin), baseurlcuki:dom('admCukiBase')?.value||safeLsGet('cukiBase',DEFAULT_API.baseurlcuki), apikeycuki:dom('admCuki')?.value||safeLsGet('cukiKey',DEFAULT_API.apikeycuki), apikeyalip:dom('admAlip')?.value||safeLsGet('alipKey',DEFAULT_API.apikeyalip), apikeybotcahx:dom('admBotcah')?.value||safeLsGet('botcahxKey',DEFAULT_API.apikeybotcahx), zakkiToken:dom('admZakki')?.value||safeLsGet('zakkiToken',DEFAULT_API.zakkiToken), relayUrl:dom('admProxyUrl')?.value||safeLsGet('apiProxyUrl',DEFAULT_API.relayUrl), fayuApiId:dom('admFayuId')?.value||safeLsGet('fayuApiId','180161'), fayuApiKey:dom('admFayuKey')?.value||safeLsGet('fayuApiKey',DEFAULT_API.fayuApiKey)}; applyApiSettings(api); if(dbReady) await ref('settings/api').update({...api,updatedAt:Date.now(),updatedBy:getMe()?.username||'unknown'}); toast2('API/base URL tersimpan realtime ✅') };
/* Admin API panel: ensure Fayu fields + realtime tools visible */
const origAdminTab=window.adminTab; window.adminTab=function(tab){ const r=origAdminTab?origAdminTab(tab):null; setTimeout(()=>{ if(tab==='api'){ const body=dom('adminBody'); if(body&&!dom('admFayuId')) body.insertAdjacentHTML('beforeend',`<div class="panel"><h3>🚀 API Layanan Boost</h3><input class="input" id="admFayuId" placeholder="API ID" value="${escapeHtml(safeLsGet('fayuApiId','180161'))}"><input class="input" id="admFayuKey" placeholder="API Key" value="${escapeHtml(safeLsGet('fayuApiKey',DEFAULT_API.fayuApiKey))}" style="margin-top:8px"><button class="btn green" style="width:100%;margin-top:8px" onclick="saveApiSetting()">Simpan API Realtime</button></div>`); if(body&&!dom('admMediaPanel')) body.insertAdjacentHTML('beforeend',`<div class="panel" id="admMediaPanel"><h3>🎬 Media Web</h3><p class="muted">Video disarankan 9:16, gambar 16:9, audio untuk backsound setelah user klik halaman.</p><input class="input" id="admBgImage" placeholder="URL gambar background 16:9" value="${escapeHtml(safeLsGet('bgImage',''))}"><input class="input" id="admBgVideo" placeholder="URL video background 9:16" style="margin-top:8px" value="${escapeHtml(safeLsGet('bgVideo',''))}"><input class="input" id="admBgAudio" placeholder="URL audio backsound" style="margin-top:8px" value="${escapeHtml(safeLsGet('bgAudio',''))}"><button class="btn purple" style="width:100%;margin-top:8px" onclick="saveMediaSettingRealtime()">Simpan Media Realtime</button></div>`); } if(tab==='product'){ const body=dom('adminBody'); if(body&&!dom('catRealtimeBox')) body.insertAdjacentHTML('beforeend',`<div class="panel" id="catRealtimeBox"><h3>Tambah Kategori Realtime</h3><input class="input" id="newCatRT" placeholder="Nama kategori"><button class="btn ghost" style="width:100%;margin-top:8px" onclick="addCategoryRealtime()">Tambah Kategori</button></div>`); } },80); return r };
window.saveMediaSettingRealtime=async function(){ const m={bgImage:dom('admBgImage')?.value||'',bgVideo:dom('admBgVideo')?.value||'',bgAudio:dom('admBgAudio')?.value||'',updatedAt:Date.now()}; safeLsSet('bgImage',m.bgImage); safeLsSet('bgVideo',m.bgVideo); safeLsSet('bgAudio',m.bgAudio); applyMediaSettings(m); if(dbReady) await ref('settings/media').update(m); toast2('Media web tersimpan realtime.') };
window.addCategoryRealtime=async function(){ const name=(dom('newCatRT')?.value||'').trim(); if(!name)return toast2('Nama kategori kosong.','warn'); const ps=safeLsGet('products',[]); const cats=categoriesFromProducts(ps); cats[safeKey(name)]={id:name,name,order:Object.keys(cats).length}; if(dbReady) await ref('categories').set(cats); safeLsSet('categories',Object.values(cats).map(x=>x.name)); call('renderCats'); toast2('Kategori ditambahkan realtime.') };
/* Gacha balance */
function todayKey(){ const d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate() }
const origDoGacha=window.doGacha; window.doGacha=async function(spins=1){ const u=getMe(); if(!u)return; const cfg=safeLsGet('gachaSettings',GACHA_DEFAULT); const key='gacha_'+u.username+'_'+todayKey(); const used=safeLsGet(key,0); const count=Number(spins)||1; const price=(used<Number(cfg.freePerDay||1)&&count===1)?0:(count>=10?Number(cfg.spin10Price||10000):Number(cfg.spin1Price||2000)*count); if((u.saldo||0)<price)return toast2(`Saldo kurang untuk gacha ${count}x. Butuh ${fmt2(price)}.`,'err'); if(price>0){ const users=getUsersSafe(); users[u.username].saldo=(users[u.username].saldo||0)-price; saveUsersSafe(users); window.current=users[u.username]; if(dbReady) await ref('users/'+safeKey(u.username)).update(cleanObj(users[u.username])); }
  safeLsSet(key,used+count); let rewards=[]; for(let i=0;i<count;i++) rewards.push(drawReward(cfg.rewards||GACHA_DEFAULT.rewards)); let totalSaldo=0; rewards.forEach(r=>{ if(r.type==='saldo') totalSaldo+=Number(r.amount||0) }); if(totalSaldo>0){ const users=getUsersSafe(); users[u.username].saldo=(users[u.username].saldo||0)+totalSaldo; saveUsersSafe(users); window.current=users[u.username]; if(dbReady) await ref('users/'+safeKey(u.username)).update(cleanObj(users[u.username])); }
  call('renderAll'); call('openModal','🎰 Hasil Gacha',`<div class="panel"><h3>${count}x Spin ${price?`• Biaya ${fmt2(price)}`:'• Gratis harian'}</h3>${rewards.map(r=>`<div class="row"><span>${escapeHtml(r.icon||'🎁')} ${escapeHtml(r.name)}</span><b>${r.type==='saldo'?('+'+fmt2(r.amount)):''}</b></div>`).join('')}</div><button class="btn" style="width:100%" onclick="doGacha(1)">Spin 1x (${used+count < Number(cfg.freePerDay||1)?'Gratis':fmt2(cfg.spin1Price||2000)})</button><button class="btn purple" style="width:100%;margin-top:8px" onclick="doGacha(10)">Spin 10x (${fmt2(cfg.spin10Price||10000)})</button>`); if(dbReady) await ref('streaks/'+safeKey(u.username)+'/gacha').set({date:todayKey(),used:used+count,updatedAt:Date.now()}); };
function drawReward(list){ const sum=list.reduce((a,b)=>a+Number(b.weight||1),0); let r=Math.random()*sum; for(const item of list){ r-=Number(item.weight||1); if(r<=0)return item } return list[0] }
const origRenderGacha=window.renderGacha; window.renderGacha=function(){ const cfg=safeLsGet('gachaSettings',GACHA_DEFAULT); const box=dom('gachaPool'); if(box){ box.innerHTML=(cfg.rewards||GACHA_DEFAULT.rewards).map(x=>`<div class="tool"><div class="toolIcon">${escapeHtml(x.icon||'🎁')}</div><h3>${escapeHtml(x.name)}</h3><p>Weight: ${escapeHtml(x.weight||1)}</p></div>`).join(''); } };
/* Streak + leaderboard realtime */
const origClaimStreak=window.claimStreak; window.claimStreak=async function(){ if(origClaimStreak) origClaimStreak(); const u=getMe(); if(dbReady&&u){ await ref('streaks/'+safeKey(u.username)).update({username:u.username,display:u.display||u.username,streak:u.streak||0,lastClaim:todayKey(),updatedAt:Date.now()}); await ref('leaderboard/'+safeKey(u.username)).update({username:u.username,display:u.display||u.username,spent:u.spent||0,orders:u.orders||0,streak:u.streak||0,updatedAt:Date.now()}); }};
const origRenderLeader=window.renderLeader; window.renderLeader=function(){ if(dbReady){ const lb=safeLsGet('leaderboard',{}); if(lb&&Object.keys(lb).length>1){ const arr=Object.values(lb).filter(x=>x&&x.username).sort((a,b)=>(b.spent||0)-(a.spent||0)); const box=dom('leaderBox'); if(box) box.innerHTML=arr.slice(0,30).map((u,i)=>`<div class="panel"><div class="row"><b>#${i+1} ${escapeHtml(u.display||u.username)}</b><b>${fmt2(u.spent||0)}</b></div><p class="muted">Order: ${u.orders||0} • Streak: ${u.streak||0}</p></div>`).join('')||'<p class="muted">Belum ada data realtime.</p>'; return; }} return origRenderLeader?origRenderLeader():null };
/* Zakki anti spam on cancel / not-found */
const origStartZakkiAutoCheck=window.startZakkiAutoCheck; window.startZakkiAutoCheck=function(id){ let tries=0; const timer=setInterval(async()=>{ tries++; const dep=safeLsGet('deposits',[]).find(x=>x.id===id); if(!dep || String(dep.status||'').toUpperCase()==='CANCELED' || String(dep.status||'').toUpperCase()==='SUCCESS' || tries>20){ clearInterval(timer); return; } await window.checkZakkiDeposit(id); },15000); return timer };
const origCancelZakkiNow=window.cancelZakkiDepositNow; window.cancelZakkiDepositNow=async function(id){ const deps=safeLsGet('deposits',[]).map(d=>d.id===id?{...d,status:'CANCELED',canceledAt:Date.now()}:d).filter(d=>d.id!==id); safeLsSet('deposits',deps); try{ if(dbReady) await ref('deposits/'+safeKey(id)).update({status:'CANCELED',canceledAt:Date.now()}) }catch{} if(origCancelZakkiNow) return origCancelZakkiNow(id); call('renderDeposits'); toast2('QRIS dibatalkan, auto-check dihentikan.') };
const origCheckZakki=window.checkZakkiDeposit; window.checkZakkiDeposit=async function(id){ const dep=safeLsGet('deposits',[]).find(x=>x.id===id); if(!dep) return; if(String(dep.status||'').toUpperCase()==='CANCELED') return; return origCheckZakki?origCheckZakki(id):null };
/* Brat video endpoint BotCahX */
window.remiBratVideoUrl=function(text){ const api=(window.constBaseUrl||DEFAULT_API); return `${api.baseurlbotcahx||DEFAULT_API.baseurlbotcahx}/api/maker/brat-video?apikey=${encodeURIComponent(api.apikeybotcahx||DEFAULT_API.apikeybotcahx)}&text=${encodeURIComponent(text||'')}` };
/* Force endpoints/settings before original UI */
function bootGuards(){
  ensureToolCards(); call('renderTools');
  ['loginBtnV80','guestBtnV80','regBtnV80'].forEach(id=>{ const b=dom(id); if(!b||b.dataset.rtbind)return; b.dataset.rtbind='1'; const fn=id==='loginBtnV80'?'login':id==='guestBtnV80'?'guestLogin':'register'; b.addEventListener('click',e=>{ try{ if(has(fn)) window[fn]() }catch(err){ alert(fn+' error: '+err.message); console.error(err) } }); });
  const menu=dom('menuPop'); if(menu&&!dom('seedFirebaseBtn')) menu.insertAdjacentHTML('beforeend','<button id="seedFirebaseBtn" onclick="remiSeedFirebaseNow()">🗄️ Seed Firebase DB</button><button onclick="openRealtimeOwnerTools()">⚡ Owner RT Tools</button>');
}
window.remiSeedFirebaseNow=async()=>{ try{ await seedFirebase(); toast2('Firebase DB diseed / diperbarui ✅') }catch(e){toast2('Seed gagal: '+e.message,'err')} };
window.openRealtimeOwnerTools=function(){ call('openModal','⚡ Owner Realtime Tools',`<div class="panel"><h3>Firebase Status</h3><p class="muted">${dbReady?'✅ Aktif':'❌ Belum aktif'}</p><button class="btn" style="width:100%" onclick="remiSeedFirebaseNow()">Seed Struktur Database</button></div><div class="panel"><h3>Gacha Setting</h3><input class="input" id="gSpin1" placeholder="Harga 1x" value="${safeLsGet('gachaSettings',GACHA_DEFAULT).spin1Price}"><input class="input" id="gSpin10" placeholder="Harga 10x" style="margin-top:8px" value="${safeLsGet('gachaSettings',GACHA_DEFAULT).spin10Price}"><button class="btn purple" style="width:100%;margin-top:8px" onclick="saveGachaSettingRT()">Simpan Gacha</button></div>`)};
window.saveGachaSettingRT=async function(){ const cfg={...safeLsGet('gachaSettings',GACHA_DEFAULT), spin1Price:Number((dom('gSpin1')?.value||'2000').replace(/\D/g,'')), spin10Price:Number((dom('gSpin10')?.value||'10000').replace(/\D/g,'')), updatedAt:Date.now()}; safeLsSet('gachaSettings',cfg); if(dbReady) await ref('settings/gacha').update(cfg); toast2('Gacha setting tersimpan realtime.') };
/* public exports */
window.constBaseUrl={...DEFAULT_API}; window.RemiFirebaseConfig=CFG;
setTimeout(bootGuards,50); setTimeout(bootGuards,800); setTimeout(()=>initFirebase(),250);
})();
