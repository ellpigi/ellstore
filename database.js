
'use strict';
const APIS={alipBase:'https://docs-alip.clutch.web.id',alipKey:(localStorage.getItem('alipKey')?JSON.parse(localStorage.getItem('alipKey')):'alipaiapikeybaru'),botcahxBase:'https://api.botcahx.eu.org',botcahxKey:(localStorage.getItem('botcahxKey')?JSON.parse(localStorage.getItem('botcahxKey')):'ellapikey'),nexrayBase:(localStorage.getItem('nexrayBase')?JSON.parse(localStorage.getItem('nexrayBase')):'https://api.nexray.eu.cc'),ourinBase:(localStorage.getItem('ourinBase')?JSON.parse(localStorage.getItem('ourinBase')):'https://api.ourin.my.id')};
const ZAKKI_DEFAULT_TOKEN='014a3b134589ee';
const REMI_AI_AVATAR='data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20120%20120%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22120%22%20height%3D%22120%22%20rx%3D%2228%22%20fill%3D%22%232bdcff%22%2F%3E%3Ctext%20x%3D%2260%22%20y%3D%2274%22%20font-size%3D%2244%22%20font-family%3D%22Arial%22%20font-weight%3D%22900%22%20text-anchor%3D%22middle%22%20fill%3D%22%23050812%22%3ER%3C%2Ftext%3E%3C%2Fsvg%3E';

function getProxyUrl(){
  return String(ls.get('apiProxyUrl','')||'').trim().replace(/\/$/,'');
}
function setProxyUrl(v){
  ls.set('apiProxyUrl', String(v||'').trim().replace(/\/$/,''));
}
function proxiedUrl(target){
  const p=getProxyUrl();
  if(!p) return target;
  return p + (p.includes('?') ? '&' : '?') + 'url=' + encodeURIComponent(target);
}
function isFileMode(){
  return location.protocol === 'file:';
}
function proxyNeedHtml(){
  return isFileMode() && !getProxyUrl()
    ? `<div class="proxyWarn">⚠️ Kamu buka dari file lokal/ZArchiver. Beberapa API luar bisa gagal karena CORS. Isi Proxy URL di Admin Panel → API biar fitur Cuki/Alip lebih stabil.</div>`
    : '';
}
async function testApiProxy(){
  const out=$('proxyTestOut');
  const input=($('admProxyUrl')?.value||'').trim();
  if(input) setProxyUrl(input);
  const proxy=getProxyUrl();
  if(!proxy){
    if(out) out.innerHTML='<div class="proxyWarn">Proxy URL kosong.</div>';
    return toast('Proxy URL kosong.','warn');
  }
  const sample='https://api.cuki.biz.id/api/tools/binary2text?apikey=cuki-x&content=01001000+01100101+01101100+01101100+01101111';
  if(out) out.innerHTML='<div class="panel">⏳ Test proxy...</div>';
  try{
    const res=await fetch(proxiedUrl(sample),{cache:'no-store'});
    const txt=await res.text();
    let json; try{json=JSON.parse(txt)}catch{json={raw:txt.slice(0,240)}}
    if(!res.ok) throw new Error('HTTP '+res.status+' '+txt.slice(0,160));
    if(out) out.innerHTML=`<div class="proxyOk">✅ Proxy aktif<br>Response: ${esc(JSON.stringify(json).slice(0,180))}</div>`;
    toast('Proxy aktif ✅');
  }catch(e){
    if(out) out.innerHTML=`<div class="proxyWarn">❌ Proxy gagal: ${esc(e.message)}</div>`;
    toast('Proxy gagal.','err');
  }
}

const CUKI_API={base:(localStorage.getItem('cukiBase')?JSON.parse(localStorage.getItem('cukiBase')):'https://api.cuki.biz.id'),key:(localStorage.getItem('cukiKey')?JSON.parse(localStorage.getItem('cukiKey')):'cuki-x')};
const $=id=>document.getElementById(id), $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},set(k,v){localStorage.setItem(k,JSON.stringify(v))},rm(k){localStorage.removeItem(k)}};
const hash=s=>{let h=0;s=String(s||'');for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return'h'+h.toString(36)};
const fmt=n=>'Rp'+(Number(n)||0).toLocaleString('id-ID');
function compact(n){n=Number(n)||0;if(n>=1e12)return'Rp'+Math.floor(n/1e12)+' T';if(n>=1e9)return'Rp'+Math.floor(n/1e9)+' M';if(n>=1e6)return'Rp'+Math.floor(n/1e6)+' JT';return fmt(n)}
function makeId(p='ID'){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
let current=null,currentCat='all',lbMode='belanja',selectedMsg=null,selectedRating=5,calcExpr='0',activeDM=null;
const defaultProducts=[
{id:1,name:'Sewa Bot 1 Bulan',cat:'Bot WA',price:15000,icon:'🤖',desc:'Sewa bot WhatsApp dengan fitur lengkap, respons cepat, dan stabil untuk penggunaan harian.',reviews:[{u:'Iky',t:'Harga murah, kualitas bagus, dan fiturnya jalan lancar.',r:5}]},
{id:2,name:'Jadi Bot Instant',cat:'Bot WA',price:10000,icon:'🎮',desc:'Aktifkan nomor kamu sebagai bot dengan proses setup yang sederhana.',reviews:[]},
{id:3,name:'Source Code Remi AI',cat:'SC',price:25000,icon:'⚡',desc:'Source code lengkap berisi AI, downloader, store, premium, dan tools.',reviews:[]},
{id:4,name:'Premium User',cat:'Premium',price:5000,icon:'💎',desc:'Buka akses fitur premium dengan limit penggunaan yang lebih lega.',reviews:[]},
{id:5,name:'Jasa Setup Bot',cat:'Jasa',price:20000,icon:'🛠️',desc:'Bantuan pemasangan bot di panel atau VPS sampai siap digunakan.',reviews:[]},
{id:6,name:'Hosting Bot 1 Bulan',cat:'Hosting',price:30000,icon:'☁️',desc:'Hosting bot stabil untuk kebutuhan online harian.',reviews:[]}
];
const defaultTools=[
['⬇️','Downloader Hub','Download media dari TikTok, IG, FB, Spotify, YouTube, Videy, CapCut, dan MediaFire.','downloader'],
['🔗','To URL Uploader','Upload gambar, video, atau audio agar menjadi link siap pakai.','tourl'],
['🎨','Text to Image','Buat gambar dari prompt dan lihat preview hasilnya.','txt2img'],
['🍌','Edit Gambar AI','Upload gambar, masukkan prompt, lalu lihat hasil edit AI.','editimg'],
['👁️','OCR Image','Ambil teks dari gambar menggunakan URL.','ocr'],
['🌐','Translate','Terjemahkan teks ke berbagai bahasa.','translate'],
['😎','Brat Generator','Buat brat versi default, video, Bahlil, atau green.','brat'],
['🎭','Fake Maker','Buat fake NGL, MLBB, FF, Nokia, tulisan, dan developer card.','fake'],
['📱','iPhone Quote Chat','Buat gambar chat quote bergaya iPhone.','iqc'],
['🔍','Stalk Game/Sosmed','Cek info IG, Roblox, TikTok, GitHub, dan Free Fire.','stalk'],
['🧮','Kalkulator','Hitung angka dengan format ribuan yang rapi.','calc'],
['🪄','Remove Background','Hapus background gambar secara otomatis.','removebg'],
['🌦️','Cek Cuaca','Cek cuaca berdasarkan kota atau provinsi.','cuki_weather'],
['🌋','Info Gempa','Lihat info gempa terbaru dan gempa yang dirasakan.','cuki_bmkg'],
['🔎','Search Hub','Cari TikTok, Pinterest Image, MCPE, resep, PlayYT, dan YouTube.','search_hub'],
['🌐','SS Web','Ambil screenshot website melalui URL.','ssweb'],
['🔢','Binary ⇄ Text','Konversi teks ke binary atau binary ke teks.','cuki_binary']
];
const gachaItems=[['💎','Premium 1 Hari'],['💰','Saldo 1K'],['🎟️','Voucher Diskon'],['🔥','Streak Boost'],['🧊','Zonk Tipis'],['👑','Premium 7 Hari']];
const themes={cyan:['#2bdcff','#147cff'],purple:['#b515ff','#6d28d9'],green:['#43d383','#089f62'],gold:['#ffd45e','#e99600'],pink:['#ff79c6','#b515ff']};

function getUsers(){return ls.get('users',{})}function saveUsers(u){ls.set('users',u)}
function me(){if(!current)return null;return getUsers()[current.username]||null}
function saveMe(data){const users=getUsers();if(!current||!users[current.username])return;users[current.username]={...users[current.username],...data};saveUsers(users);current=users[current.username];ls.set('session',current.username)}
function toast(t,type=''){const el=$('toast');if(!el)return alert(t);el.textContent=t;el.className='toast show '+type;setTimeout(()=>el.className='toast',2300)}

function isSensorOn(){return ls.get('sensorOn',true)}
function setSensorOn(v){ls.set('sensorOn',!!v);toast(v?'Sensor aktif.':'Sensor dimatikan.')}
function sensorText(txt){
  txt=String(txt??'');
  if(!isSensorOn()) return txt;
  const words=ls.get('badWords',['anjing','tai','brengsek','kontol','memek','ngentod','tolol','goblok','bangsat']);
  for(const w of words){
    const safe=String(w||'').trim();
    if(!safe) continue;
    const re=new RegExp(safe.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');
    txt=txt.replace(re, m=>m[0]+'*'.repeat(Math.max(1,m.length-1)));
  }
  return txt;
}

function ensureDefaults(){if(!ls.get('products'))ls.set('products',defaultProducts);if(!ls.get('badWords'))ls.set('badWords',['anjing','tai','brengsek','kontol','memek','ngentod','tolol','goblok','bangsat']);const users=getUsers();if(!users.admin){users.admin={username:'admin',display:'Admin Remi 📘',pw:hash('admin'),plain:'admin',saldo:0,avatar:'',bio:'Admin resmi Remi AI Store.',gender:'rahasia',orders:0,spent:0,gacha:0,streak:0,ref:'ADMIN',role:'admin',system:true};saveUsers(users)}}
function init(){ensureDefaults();if(!ls.get('zakkiToken'))ls.set('zakkiToken',ZAKKI_DEFAULT_TOKEN);applyTheme(ls.get('theme','cyan'));const sess=ls.get('session');current=sess?getUsers()[sess]:null;if(current)$('auth').classList.add('hide');saveDeviceSnapshot();
renderAll();updateDmBadge();tick();setInterval(tick,1000);document.addEventListener('click',e=>{if(!e.target.closest('#menuPop')&&!e.target.closest('.header .icon:last-child'))toggleMenu(false)})}
function switchAuth(t){$('loginBox').style.display=t==='login'?'block':'none';$('regBox').style.display=t==='reg'?'block':'none';$('tabLogin').classList.toggle('active',t==='login');$('tabReg').classList.toggle('active',t==='reg')}
function randomName(){return['remi','ell','cyan','nova','luna','kaito','mika','guest'][Math.floor(Math.random()*8)]+'_'+Math.random().toString(36).slice(2,6)}
function randomPass(){return'G-'+Math.random().toString(36).slice(2,6).toUpperCase()+'-'+Math.floor(100+Math.random()*900)}
function login(){
  try{
    const u=$('loginUser').value.trim().toLowerCase(),p=$('loginPass').value;
    const users=getUsers();
    if(!users[u]||users[u].pw!==hash(p))return toast('Login gagal, cek username/password.','err');
    current=users[u];ls.set('session',u);$('auth').classList.add('hide');
    try{renderAll()}catch(e){console.error(e);toast('Login masuk, tapi render error: '+e.message,'warn')}
    toast('Berhasil login.');
  }catch(e){alert('Login error: '+e.message);console.error(e)}
}
function register(){
  try{
    const u=$('regUser').value.trim().toLowerCase().replace(/[^a-z0-9_]/g,''),p=$('regPass').value,g=$('regGender').value;
    if(u.length<3||p.length<4)return toast('Username min 3, password min 4.','warn');
    const users=getUsers();
    if(users[u])return toast('Username sudah dipakai.','err');
    users[u]={username:u,display:u,pw:hash(p),plain:p,saldo:0,avatar:'',bio:'Belum ada bio.',gender:g,orders:0,spent:0,gacha:0,streak:0,ref:u.toUpperCase().slice(0,6)};
    saveUsers(users);current=users[u];ls.set('session',u);$('auth').classList.add('hide');
    try{renderAll()}catch(e){console.error(e);toast('Akun dibuat, tapi render error: '+e.message,'warn')}
    toast('Akun dibuat.');
  }catch(e){alert('Daftar error: '+e.message);console.error(e)}
}
function guestLogin(){
  try{
    const users=getUsers(),u=randomName(),p=randomPass();
    users[u]={username:u,display:'Guest '+u.split('_')[1],pw:hash(p),plain:p,saldo:0,avatar:'',bio:'Akun guest otomatis.',gender:Math.random()>.5?'cowok':'cewek',orders:0,spent:0,gacha:0,streak:0,ref:u.toUpperCase().slice(0,6)};
    saveUsers(users);current=users[u];ls.set('session',u);$('auth').classList.add('hide');
    try{renderAll()}catch(e){console.error(e);toast('Guest masuk, tapi render error: '+e.message,'warn')}
    toast('Guest dibuat. Password ada di Akun.');
  }catch(e){alert('Guest login error: '+e.message);console.error(e)}
}
function logout(){showConfirm('Keluar Akun','Yakin mau keluar?',()=>{ls.rm('session');location.reload()})}
function tick(){const d=new Date(),pad=n=>String(n).padStart(2,'0'),hari=['Min','Sen','Sel','Rab','Kam','Jum','Sab'][d.getDay()],bulan=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()];$('clock').textContent=`${hari}, ${pad(d.getDate())} ${bulan}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} WIB`}
function renderAll(){updateDmBadge();renderHeader();renderCats();renderProducts();renderTools();renderChat();renderAccount();renderCS();renderLeader();renderGacha();renderTheme()}
function renderHeader(){const u=me(),saldo=u?.saldo||0;$('saldoHead').textContent=compact(saldo);$('streakTop').textContent=u?.streak||0;if($('saldoPage'))$('saldoPage').textContent=compact(saldo);if($('saldoUser'))$('saldoUser').textContent=u?'👤 '+u.username:'-'}
function showPage(p){$$('.page').forEach(x=>x.classList.remove('active'));const pg=$('page-'+p);if(pg)pg.classList.add('active');$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===p));toggleMenu(false);if(p==='chat'){renderChat();updateDmBadge()}if(p==='ai')renderAIChat();if(p==='akun')renderAccount();if(p==='leader')renderLeader();if(p==='saldo'){renderDeposits();renderTx()}if(p==='suntik')updateDmBadge();window.scrollTo({top:0,behavior:'smooth'})}
function toggleMenu(force){const m=$('menuPop');m.classList.toggle('show',force===undefined?!m.classList.contains('show'):force)}
function openModal(t,h){$('modalTitle').innerHTML=t;$('modalBody').innerHTML=h;$('modal').classList.add('show')}function closeModal(){$('modal').classList.remove('show')}
let confirmCb=null;
function showConfirm(title,text,cb){
  confirmCb=cb;
  $('confirmTitle').textContent=title||'Konfirmasi';
  $('confirmText').textContent=text||'Yakin?';
  $('confirmOk').onclick=()=>{const fn=confirmCb;closeConfirm();if(typeof fn==='function')fn()};
  $('confirmMini').classList.add('show');
}
function closeConfirm(){$('confirmMini').classList.remove('show');confirmCb=null}

function renderCats(){const cats=['all',...new Set(ls.get('products',defaultProducts).map(p=>p.cat))];$('cats').innerHTML=cats.map(c=>`<button class="tab ${currentCat===c?'active':''}" onclick="currentCat='${c}';renderCats();renderProducts()">${c==='all'?'Semua':esc(c)}</button>`).join('')}
function renderProducts(){const q=($('search')?.value||'').toLowerCase();const arr=ls.get('products',defaultProducts).filter(p=>(currentCat==='all'||p.cat===currentCat)&&(!q||(p.name+p.desc+p.cat).toLowerCase().includes(q)));$('products').innerHTML=arr.map(p=>`<div class="card"><div class="thumb"><span>${p.icon}</span></div><div class="cardBody"><div class="name">${esc(p.name)}</div><div class="desc">${esc(p.desc)}</div><div class="price">${fmt(p.price)}</div><div class="smallbtns"><button class="btn ghost" onclick="detail(${p.id})">Detail</button><button class="btn" onclick="order(${p.id})">Beli</button></div></div></div>`).join('')||'<div class="panel">Produk tidak ditemukan.</div>'}
function renderStars(n=5){return`<div class="starPick">${[1,2,3,4,5].map(i=>`<button class="${i<=n?'on':''}" onclick="selectedRating=${i};document.querySelectorAll('.starPick button').forEach((b,idx)=>b.classList.toggle('on',idx<${i}))">★</button>`).join('')}</div>`}
function detail(id){const p=ls.get('products').find(x=>x.id===id);selectedRating=5;openModal('📦 Detail Produk',`<div style="text-align:center;font-size:48px">${p.icon}</div><h2>${esc(p.name)}</h2><p class="muted">${esc(p.desc)}</p><div class="panel"><div class="row"><b>Harga</b><b class="price">${fmt(p.price)}</b></div><div class="row"><b>Kategori</b><span>${esc(p.cat)}</span></div></div><h3>⭐ Review Pembeli</h3>${(p.reviews||[]).map((r,idx)=>`<div class="panel"><b>${esc(r.u)}</b><div style="color:var(--gold)">${'★'.repeat(r.r||5)}${'☆'.repeat(5-(r.r||5))}</div><p>${esc(r.t)}</p><button class="btn ghost" onclick="likeReview(${p.id},${idx})">👍 Like (${(r.likes||[]).length||0})</button></div>`).join('')||'<p class="muted">Belum ada review.</p>'}<div class="panel"><b>Beri Rating</b>${renderStars(5)}<textarea id="rvText" placeholder="Tulis review..."></textarea><button class="btn" onclick="addReview(${p.id})">Kirim Review</button></div><button class="btn purple" style="width:100%;margin-top:10px" onclick="order(${p.id})">Beli Sekarang</button>`)}
function likeReview(id,idx){const ps=ls.get('products'),p=ps.find(x=>x.id===id);if(!p||!p.reviews||!p.reviews[idx])return;const r=p.reviews[idx];r.likes=r.likes||[];if(r.likes.includes(me().username))return toast('Review sudah kamu like.','warn');r.likes.push(me().username);ls.set('products',ps);toast('Review disukai.');detail(id)}
function addReview(id){const t=$('rvText').value.trim();if(!t)return toast('Review kosong.','warn');const ps=ls.get('products'),p=ps.find(x=>x.id===id);p.reviews=p.reviews||[];p.reviews.unshift({u:me().display,t,r:selectedRating});ls.set('products',ps);toast('Review ditambahkan.');detail(id)}
function order(id){const p=ls.get('products').find(x=>x.id===id),u=me();openModal('🛒 Konfirmasi Order',`<div style="text-align:center;font-size:48px">${p.icon}</div><h2 style="text-align:center">${esc(p.name)}</h2><div class="panel"><div class="row"><span>Produk</span><b>${esc(p.name)}</b></div><div class="row"><span>Harga</span><b>${fmt(p.price)}</b></div><div class="row"><span>Pembeli</span><b>${esc(u.display)}</b></div><div class="row"><span>Saldo kamu</span><b style="color:var(--green)">${fmt(u.saldo)}</b></div></div><div class="panel"><h3>✅ Verifikasi Data Pembelian</h3><input class="input" id="buyWa" placeholder="Nomor WhatsApp, contoh 628xxx"><div style="height:9px"></div><textarea id="buyNote" placeholder="Catatan tambahan..."></textarea></div><button class="btn" style="width:100%" onclick="paySaldo(${p.id})">💰 Bayar Pakai Saldo</button><button class="btn ghost" style="width:100%;margin-top:10px" onclick="showPage('saldo');closeModal()">💳 Deposit Saldo</button><button class="btn green" style="width:100%;margin-top:10px" onclick="openWA('${encodeURIComponent('Halo admin, saya mau beli '+p.name)}')">📱 Tanya Admin via WhatsApp</button>`)}
function paySaldo(id){const ps=ls.get('products'),p=ps.find(x=>x.id===id),u=me();if(!$('buyWa').value.trim())return toast('Nomor WhatsApp wajib diisi.','warn');if(u.saldo<p.price)return toast('Saldo kurang, deposit dulu.','err');saveMe({saldo:u.saldo-p.price,orders:(u.orders||0)+1,spent:(u.spent||0)+p.price});const orders=ls.get('orders',[]);orders.unshift({id:makeId('ORD'),product:p.name,user:u.username,price:p.price,wa:$('buyWa').value,note:$('buyNote').value,status:'paid',time:Date.now()});ls.set('orders',orders);addTx('Beli: '+p.name,-p.price);closeModal();renderAll();toast('Order sukses.')}
function openWA(t){location.href='https://wa.me/6280000000000?text='+t}

function renderTools(){$('toolsGrid').innerHTML=defaultTools.map(t=>`<div class="tool"><div class="toolIcon">${t[0]}</div><h3>${t[1]}</h3><p>${t[2]}</p><button class="btn purple" onclick="runTool('${t[3]}')">Buka</button></div>`).join('')}
function runTool(a){
if(a==='downloader')return toolDownloader();
if(a==='tourl')return toolTourl();
if(a==='txt2img')return toolImage();
if(a==='editimg')return toolEditImg();
if(a==='ocr')return toolOCR();
if(a==='removebg')return toolRemoveBG();
if(a==='translate')return toolTranslate();
if(a==='brat')return toolBrat();
if(a==='fake')return toolFakeMaker();
if(a==='iqc')return toolIQC();
if(a==='stalk')return toolStalk();
if(a==='calc')return toolCalc();
if(a==='search_hub')return toolSearchHub();
if(a==='cuki_weather')return toolCukiWeather();
if(a==='cuki_bmkg')return toolCukiBMKG();
if(a==='cuki_mcpe')return toolCukiMCPE();
if(a==='cuki_pinterest')return toolCukiPinterest();
if(a==='cuki_binary')return toolCukiBinary();
if(a==='cuki_tiktok_search')return toolCukiTikTokSearch();
if(a==='cuki_resep')return toolCukiResep();
if(a==='cuki_playyt')return toolCukiPlayYT();
if(a==='cuki_youtube_search')return toolCukiYoutubeSearch();
if(a==='ssweb')return toolSSWeb();
return toast('Tool tidak dikenal: '+a,'err')
}

function isTourlMime(file){
  return !!(file && /^(image|video|audio)\//.test(file.type || ''));
}
function tourlExt(file){
  const mime=file?.type||'';
  const map={
    'image/jpeg':'jpg','image/jpg':'jpg','image/png':'png','image/gif':'gif','image/webp':'webp',
    'video/mp4':'mp4','video/3gpp':'3gp','video/quicktime':'mov','video/webm':'webm',
    'audio/mpeg':'mp3','audio/mp4':'m4a','audio/ogg':'ogg','audio/wav':'wav','audio/webm':'webm'
  };
  const byName=(file?.name||'').split('.').pop();
  return map[mime] || (byName && byName.length < 8 ? byName : 'bin');
}
function tourlSafeName(file){
  return `elaina-${Date.now()}-${Math.random().toString(16).slice(2,7)}.${tourlExt(file)}`;
}
function formatBytes(n){
  n=Number(n||0);
  if(n<1024)return n+' B';
  if(n<1024*1024)return (n/1024).toFixed(1)+' KB';
  if(n<1024*1024*1024)return (n/1024/1024).toFixed(1)+' MB';
  return (n/1024/1024/1024).toFixed(2)+' GB';
}

function histKey(name){return 'hist_'+name}
function getToolRiwayat(name){return ls.get(histKey(name),[])}
function setToolRiwayat(name,arr){ls.set(histKey(name),(arr||[]).slice(0,5))}
function addToolRiwayat(name,item){
  const arr=getToolRiwayat(name);
  arr.unshift({...item, id:item.id||makeId('H'), time:item.time||Date.now()});
  setToolRiwayat(name,arr.slice(0,5));
}
function delToolRiwayat(name,id){
  setToolRiwayat(name,getToolRiwayat(name).filter(x=>x.id!==id));
  const box=$(`${name}Hist`);
  if(box) box.innerHTML=renderToolRiwayat(name);
  toast('Riwayat dihapus ✅');
}
function clearToolRiwayat(name){
  setToolRiwayat(name,[]);
  const box=$(`${name}Hist`);
  if(box) box.innerHTML=renderToolRiwayat(name);
  toast('Riwayat dibersihkan ✅');
}
function openHistItem(name,id){
  const item=getToolRiwayat(name).find(x=>x.id===id);
  if(!item)return toast('Riwayat tidak ditemukan.','err');
  const media=item.type==='video'
    ? `<video controls style="width:100%;border-radius:15px;border:1px solid var(--line)" src="${escAttr(item.url||'')}"></video>`
    : item.type==='audio'
      ? `<audio controls style="width:100%" src="${escAttr(item.url||'')}"></audio>`
      : item.url ? `<img src="${escAttr(item.url)}" onerror="this.style.display='none'" style="width:100%;border-radius:15px;border:1px solid var(--line);max-height:320px;object-fit:contain">` : '';
  openModal('📜 Detail Riwayat',`
    <div class="panel">
      <h3>${esc(item.title||item.label||'Riwayat')}</h3>
      <p class="muted">${new Date(item.time).toLocaleString('id-ID')} • ${esc(item.note||'')}</p>
      ${media}
      ${item.text?`<pre class="panel" style="white-space:pre-wrap;margin-top:10px">${esc(item.text)}</pre>`:''}
      ${item.url?`<p class="debugLine">${esc(item.url)}</p>
      <div class="btnrow">
        <button class="btn green" onclick="copyTourl('${escAttr(item.url)}')">📋 Copy</button>
        <a class="btn ghost" href="${escAttr(item.url)}" target="_blank" style="text-align:center;text-decoration:none">🔗 Buka</a>
      </div>`:''}
    </div>
  `);
}
function renderToolRiwayat(name){
  const arr=getToolRiwayat(name);
  if(!arr.length)return '<div class="panel muted">Belum ada history.</div>';
  return arr.map(x=>`
    <div class="histCard">
      <b>${esc(x.title||x.label||'Riwayat')}</b>
      <div class="histMeta">${new Date(x.time).toLocaleString('id-ID')}<br>${esc(x.note||x.url||x.text||'-')}</div>
      <div class="histBtns">
        <button class="btn ghost" onclick="openHistItem('${name}','${x.id}')">👁️ Lihat</button>
        ${x.url?`<button class="btn green" onclick="copyTourl('${escAttr(x.url)}')">📋 Copy</button>`:`<button class="btn ghost" disabled>📋 Copy</button>`}
        <button class="btn red" onclick="delToolRiwayat('${name}','${x.id}')">🗑️ Hapus</button>
      </div>
    </div>
  `).join('');
}
function historyBlock(name,title='Riwayat'){
  return `<details style="margin-top:12px" open>
    <summary class="btn ghost" style="list-style:none;text-align:center">📜 ${esc(title)} (Max 5)</summary>
    <div class="btnrow"><button class="btn red" onclick="clearToolRiwayat('${name}')">🧹 Bersihkan Riwayat</button></div>
    <div id="${name}Hist">${renderToolRiwayat(name)}</div>
  </details>`;
}

function toolTourl(){
  openModal('🔗 To URL Uploader',`
    <div class="panel">
      <h3>Upload Jadi Link</h3>
      <p class="muted">Khusus <b>gambar, video, audio</b>. Pilih gambar, video, atau audio.</p>
      <input id="tourlFile" type="file" accept="image/*,video/*,audio/*" style="display:none">
      <label class="tourlPicker" for="tourlFile" onclick="setTimeout(()=>$('tourlFile')?.click(),0)">
        <span class="bigEmoji">📁✨</span>
        <b>Pilih Gambar / Video / Audio</b>
        <p>Klik area ini sekali saja</p>
        <span class="tourlPickBtn">⚡ Pilih File</span>
      </label>
      <div id="tourlPreview" class="preview tourlPreview"></div>
      <button class="btn purple" style="width:100%;margin-top:10px" onclick="doTourlUpload()">🚀 Upload Jadi URL</button>
      <div id="tourlOut" class="preview"></div>
      ${historyBlock('tourl','Riwayat ToURL')}
    </div>
  `);
  setTimeout(()=>{
    const f=$('tourlFile');
    if(f) f.onchange=previewTourlFile;
  },60);
}
function previewTourlFile(){
  const file=$('tourlFile')?.files?.[0];
  const box=$('tourlPreview');
  if(!file || !box)return;
  if(!isTourlMime(file)){
    box.innerHTML='<div class="panel"><b style="color:var(--red)">File ditolak.</b><p class="muted">Fitur ini hanya support gambar, video, audio.</p></div>';
    $('tourlFile').value='';
    return;
  }
  const url=URL.createObjectURL(file);
  const info=`<div class="panel"><b>${esc(file.name)}</b><p class="muted">${esc(file.type||'unknown')} • ${formatBytes(file.size)}</p></div>`;
  if(file.type.startsWith('image/')) box.innerHTML=info+`<img src="${url}" alt="preview">`;
  else if(file.type.startsWith('video/')) box.innerHTML=info+`<video controls src="${url}"></video>`;
  else if(file.type.startsWith('audio/')) box.innerHTML=info+`<audio controls src="${url}"></audio>`;
}
async function postTourlForm(url,form,timeoutMs=18000,headers={}){
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),timeoutMs);
  try{
    const res=await fetch(url,{method:'POST',body:form,signal:ctrl.signal,cache:'no-store',headers});
    const txt=await res.text();
    if(!res.ok) throw new Error('HTTP '+res.status+' '+txt.slice(0,140));
    return txt;
  }finally{
    clearTimeout(timer);
  }
}
async function uploadRahmad(file){
  const form=new FormData();
  form.append('cdnFile',file,tourlSafeName(file));
  const txt=await postTourlForm('https://rahmad-elaina.my.id/upload',form,18000);
  let j;try{j=JSON.parse(txt)}catch{throw new Error('Response Rahmad bukan JSON')}
  const url=j?.url || j?.data?.url;
  if(!url) throw new Error(j?.message || 'Rahmad tidak balikin URL');
  return url;
}
async function uploadQuAx(file){
  const form=new FormData();
  form.append('files[]',file,tourlSafeName(file));
  form.append('expiry','-1');
  const txt=await postTourlForm('https://qu.ax/upload.php',form,18000,{referrer:'https://qu.ax/'});
  let j;try{j=JSON.parse(txt)}catch{throw new Error('Qu.ax response bukan JSON')}
  const url=j?.files?.[0]?.url || j?.files?.[0];
  if(!url) throw new Error(j?.error || 'Qu.ax tidak balikin URL');
  return typeof url === 'string' ? url : (url.url || url.link);
}
async function uploadCatboxTourl(file){
  const form=new FormData();
  form.append('reqtype','fileupload');
  form.append('userhash','');
  form.append('fileToUpload',file,tourlSafeName(file));
  const txt=await postTourlForm('https://catbox.moe/user/api.php',form,18000);
  const url=txt.trim();
  if(!/^https?:\/\//i.test(url)) throw new Error(url || 'Catbox tidak balikin URL');
  return url;
}
async function uploadUguuTourl(file){
  const form=new FormData();
  form.append('files[]',file,tourlSafeName(file));
  const txt=await postTourlForm('https://uguu.se/upload.php',form,18000);
  let j;try{j=JSON.parse(txt)}catch{throw new Error('Uguu response bukan JSON')}
  const url=j?.files?.[0]?.url || j?.url;
  if(!url) throw new Error(j?.description || 'Uguu tidak balikin URL');
  return url;
}
async function uploadLitterboxTourl(file){
  const form=new FormData();
  form.append('reqtype','fileupload');
  form.append('time','1h');
  form.append('fileToUpload',file,tourlSafeName(file));
  const txt=await postTourlForm('https://litterbox.catbox.moe/resources/internals/api.php',form,18000);
  const url=txt.trim();
  if(!/^https?:\/\//i.test(url)) throw new Error(url || 'Litterbox tidak balikin URL');
  return url;
}
function copyTourl(text){
  const val=String(text||'');
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(val).then(()=>toast('Link disalin ✅')).catch(()=>fallbackCopyTourl(val));
  }else{
    fallbackCopyTourl(val);
  }
}
function fallbackCopyTourl(text){
  const ta=document.createElement('textarea');
  ta.value=text;
  ta.setAttribute('readonly','');
  ta.style.position='fixed';
  ta.style.left='-9999px';
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0,999999);
  try{
    document.execCommand('copy');
    toast('Link disalin ✅');
  }catch(e){
    toast('Gagal copy, salin manual.','err');
  }
  document.body.removeChild(ta);
}
function tourlResultOk(label,url){
  return `<div class="tourlResult">
    <b>${esc(label)} <span class="tourlStatus ok">SUCCESS</span></b>
    <div class="tourlUrl">${esc(url)}</div>
    <div class="btnrow">
      <button class="btn green" onclick="copyTourl('${escAttr(url)}')">📋 Copy</button>
      <a class="btn ghost" style="text-align:center;text-decoration:none" href="${escAttr(url)}" target="_blank">🔗 Buka</a>
    </div>
  </div>`;
}
function tourlResultFail(label,msg){
  return `<div class="tourlResult">
    <b>${esc(label)} <span class="tourlStatus fail">FAILED</span></b>
    <p class="muted">${esc(msg)}</p>
  </div>`;
}
async function doTourlUpload(){
  const file=$('tourlFile')?.files?.[0];
  const out=$('tourlOut');
  if(!file) return toast('Pilih file dulu.','warn');
  if(!isTourlMime(file)) return toast('Hanya support gambar, video, audio.','err');
  if(file.size > 200*1024*1024) return toast('File terlalu besar. Maks aman 200MB.','err');

  out.innerHTML=`<div class="panel">⏳ Uploading <b>${esc(file.name)}</b> ke beberapa uploader...</div>`;

  const jobs=[
    ['Http Rahmad',()=>uploadRahmad(file)],
    ['Qu.ax',()=>uploadQuAx(file)],
    ['Catbox',()=>uploadCatboxTourl(file)],
    ['Uguu',()=>uploadUguuTourl(file)],
    ['Litterbox 1 Jam',()=>uploadLitterboxTourl(file)]
  ];

  const results=await Promise.allSettled(jobs.map(([_,fn])=>fn()));
  let success=0;
  let html=`<div class="panel"><b>📎 File</b><p class="muted">${esc(file.name)} • ${esc(file.type)} • ${formatBytes(file.size)}</p></div>`;

  results.forEach((r,i)=>{
    const label=jobs[i][0];
    if(r.status==='fulfilled' && r.value){
      success++;
      html+=tourlResultOk(label,r.value);
    }else{
      html+=tourlResultFail(label,r.reason?.message || 'Gagal upload');
    }
  });

  if(success){
    const firstOk=results.map((r,i)=>r.status==='fulfilled'&&r.value?{label:jobs[i][0],url:r.value}:null).filter(Boolean)[0];
    if(firstOk){
      addToolRiwayat('tourl',{title:file.name,label:firstOk.label,url:firstOk.url,type:file.type.startsWith('video/')?'video':file.type.startsWith('audio/')?'audio':'image',note:`${file.type} • ${formatBytes(file.size)}`});
    }
    html=`<div class="panel"><b style="color:var(--green)">✅ Uploader Results</b><p class="muted">Berhasil di ${success} uploader. Tombol copy sudah aktif.</p></div>`+html;
  }else{
    html=`<div class="panel"><b style="color:var(--red)">⚠️ Semua uploader gagal.</b><p class="muted">Coba ulangi atau gunakan host lain jika upload gagal.</p></div>`+html;
  }
  out.innerHTML=html;
}
function escAttr(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}


function cleanApiBase(base, fallback){
  return String(base || fallback || '').trim().replace(/\/+$/,'');
}
function nexrayEndpoint(type, value){
  const root=cleanApiBase(APIS.nexrayBase,'https://api.nexray.eu.cc');
  const base=root + '/downloader';
  const enc=encodeURIComponent(value);
  const map={
    facebook:`${base}/facebook?url=${enc}`,
    instagram:`${base}/instagram?url=${enc}`,
    spotify_url:`${base}/spotify?url=${enc}`,
    spotify_play:`${base}/spotifyplay?q=${enc}`,
    yt_mp3:`${base}/ytplay?q=${enc}`,
    yt_video:`${base}/ytplayvid?q=${enc}`,
    videy:`${base}/videy?url=${enc}`
  };
  return map[type] || '';
}
function cukiDownloaderEndpoint(type, value){
  const encKey=encodeURIComponent(CUKI_API.key||'cuki-x');
  const encVal=encodeURIComponent(value);
  const base=cleanApiBase(CUKI_API.base,'https://api.cuki.biz.id');
  const map={
    tiktok:`${base}/api/downloader/tiktok?apikey=${encKey}&url=${encVal}`,
    capcut:`${base}/api/downloader/capcut?apikey=${encKey}&url=${encVal}`,
    mediafire:`${base}/api/downloader/mediafire?apikey=${encKey}&url=${encVal}`
  };
  return map[type] || '';
}
function downloaderEndpoint(type,value){
  if(['tiktok','capcut','mediafire'].includes(type)) return cukiDownloaderEndpoint(type,value);
  return nexrayEndpoint(type,value);
}
async function fetchJsonUrl(direct, timeoutMs=26000){
  async function tryFetch(target,label,ms=timeoutMs){
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),ms);
    try{
      const res=await fetch(target,{signal:ctrl.signal,cache:'no-store',headers:{accept:'application/json,text/plain,*/*','cache-control':'no-cache','pragma':'no-cache'}});
      const txt=await res.text();
      let json;
      try{json=JSON.parse(txt)}
      catch{
        const found=String(txt||'').match(/\{[\s\S]*\}/);
        if(found)json=JSON.parse(found[0]);else throw new Error('Response bukan JSON');
      }
      if(json && typeof json.contents==='string'){try{json=JSON.parse(json.contents)}catch{}}
      if(json && typeof json.body==='string'){try{json=JSON.parse(json.body)}catch{}}
      if(!res.ok)throw new Error(json.msg||json.message||'HTTP '+res.status);
      if(json.status===false || json.success===false || (json.statusCode&&json.statusCode>=400))throw new Error(json.msg||json.message||'API error');
      json.__endpoint=direct;json.__via=label;return json;
    }finally{clearTimeout(timer)}
  }
  const errors=[];
  if(getProxyUrl()){
    try{return await tryFetch(proxiedUrl(direct),'proxy',timeoutMs+5000)}
    catch(e){errors.push('proxy: '+(e.name==='AbortError'?'timeout':e.message))}
  }
  const encoded=encodeURIComponent(direct);
  const targets=isFileMode()
    ? [['direct',direct],['allorigins','https://api.allorigins.win/raw?url='+encoded+'&_='+Date.now()],['corsproxy','https://corsproxy.io/?'+encoded+'&_='+Date.now()]]
    : [['direct',direct],['allorigins','https://api.allorigins.win/raw?url='+encoded+'&_='+Date.now()]];
  for(const [label,target] of targets){
    try{return await tryFetch(target,label,timeoutMs)}
    catch(e){errors.push(label+': '+(e.name==='AbortError'?'timeout':e.message))}
  }
  const err=new Error(errors.join(' | ')||'Gagal terhubung');
  err.endpoint=direct;throw err;
}
function setDlType(type){
  if($('dlType'))$('dlType').value=type;
  document.querySelectorAll('[data-dl]').forEach(b=>b.classList.toggle('active',b.dataset.dl===type));
  const q=$('dlUrl');
  if(q){
    const ph={
      tiktok:'Tempel link TikTok...',
      instagram:'Tempel link Instagram...',
      facebook:'Tempel link Facebook...',
      spotify_url:'Tempel link Spotify track...',
      spotify_play:'Cari lagu Spotify, contoh: bestfriend',
      yt_mp3:'Cari YouTube MP3, contoh: supernova',
      yt_video:'Cari YouTube Video, contoh: supernova',
      videy:'Tempel link Videy...',
      capcut:'Tempel link CapCut template...',
      mediafire:'Tempel link MediaFire...'
    };
    q.placeholder=ph[type]||'Masukkan URL/query...';
  }
}
function mediaUrlWithBust(u){
  if(!u)return '';
  return String(u).trim() + (String(u).includes('?')?'&':'?') + '_r=' + Date.now();
}
function dlButton(label,url,kind='purple'){
  if(!url)return '';
  return `<a class="btn ${kind}" style="text-align:center;text-decoration:none" href="${esc(url)}" target="_blank" download>${esc(label)}</a>`;
}
function dlCopy(label,url){
  if(!url)return '';
  return `<button class="btn green" onclick="copyTourl('${escAttr(url)}')">${esc(label)}</button>`;
}
function dlVideo(url,label='Video Preview'){
  if(!url)return '';
  const u=mediaUrlWithBust(url);
  return `<video controls playsinline preload="metadata" src="${esc(u)}" onerror="this.insertAdjacentHTML('afterend','<p class=muted>Preview video gagal. Klik Download/Buka.</p>')"></video>`;
}
function dlAudio(url,label='Audio Preview'){
  if(!url)return '';
  const u=mediaUrlWithBust(url);
  return `<audio controls preload="metadata" src="${esc(u)}" onerror="this.insertAdjacentHTML('afterend','<p class=muted>Preview audio gagal. Klik Download/Buka.</p>')"></audio>`;
}
function dlImage(url){
  if(!url)return '';
  return `<img src="${esc(mediaUrlWithBust(url))}" loading="lazy" onerror="this.style.display='none'">`;
}
function saveDownloadRiwayat(type,title,links=[]){
  addToolRiwayat('download',{type,title,links:links.slice(0,4),time:Date.now()});
  renderRiwayat('download','hist_download_list');
}
function renderDownloaderResult(type,json){
  const via=json.__via?`<span class="dlChip">Via: ${esc(json.__via)}</span>`:'';
  let html='', links=[];
  if(type==='tiktok'){
    const r=json.results||{};
    const video=r.nowm||r.hdplay||r.play||r.wm||'';
    const audio=r.music||r.music_info?.play||'';
    const title=r.title||r.caption||'TikTok Downloader';
    links=[['Video No WM',video],['Video WM',r.wm],['Audio/Music',audio]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(r.cover||r.origin_cover||r.ai_dynamic_cover)}
      <h3>${esc(title)}</h3>
      <p class="muted">@${esc(r.author?.unique_id||'-')} • ${esc(r.author?.nickname||'-')} • ${esc(r.duration||'-')}s</p>
      <div class="dlMini">${via}<span class="dlChip">Play ${shortCount(r.stats?.play_count)}</span><span class="dlChip">Like ${shortCount(r.stats?.digg_count)}</span><span class="dlChip">Comment ${shortCount(r.stats?.comment_count)}</span><span class="dlChip">Share ${shortCount(r.stats?.share_count)}</span></div>
      ${dlVideo(video)}${audio?dlAudio(audio):''}
      <div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',video)}${dlCopy('📋 Copy Video',video)}${audio?dlButton('🎧 Download Audio',audio,'ghost'):''}</div>
    </div>`;
    saveDownloadRiwayat(type,title,links);
  }
  else if(type==='facebook'){
    const r=json.result||{};
    const video=r.video_hd||r.video_sd||'';
    const audio=r.audio||'';
    const title=r.title||'Facebook Video';
    links=[['Video HD',r.video_hd],['Video SD',r.video_sd],['Audio',audio]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>${esc(title)}</h3><div class="dlMini">${via}<span class="dlChip">Views ${esc(r.views||'-')}</span><span class="dlChip">Reaction ${esc(r.reaction||'-')}</span></div>${dlVideo(video)}${audio?dlAudio(audio):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download HD',r.video_hd)}${dlButton('⬇️ Download SD',r.video_sd,'ghost')}${dlCopy('📋 Copy Video',video)}</div></div>`;
    saveDownloadRiwayat(type,title,links);
  }
  else if(type==='instagram'){
    const arr=Array.isArray(json.result)?json.result:[];
    html=arr.map((x,i)=>{
      const isVideo=(x.type||'').includes('video')||/\.mp4|\/v2\?/i.test(x.url||'');
      links.push([x.type||`media ${i+1}`,x.url]);
      return `<div class="dlCard">${dlImage(x.thumbnail)}<h3>Instagram ${esc(x.type||'Media')} #${i+1}</h3>${isVideo?dlVideo(x.url):dlImage(x.url)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download/Buka',x.url)}${dlCopy('📋 Copy Link',x.url)}</div></div>`;
    }).join('')||'<div class="panel muted">Tidak ada media Instagram.</div>';
    saveDownloadRiwayat(type,'Instagram Downloader',links);
  }
  else if(type==='spotify_url'){
    const r=json.result||{};
    const audio=r.url||'';
    links=[['Audio Spotify',audio]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>${esc(r.title||'Spotify Downloader')}</h3><p class="muted">👤 ${esc(r.artist||'-')}</p>${dlAudio(audio)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Audio',audio)}${dlCopy('📋 Copy Audio',audio)}</div></div>`;
    saveDownloadRiwayat(type,r.title||'Spotify URL',links);
  }
  else if(type==='spotify_play'){
    const r=json.result||{};
    const audio=r.download_url||'';
    links=[['Spotify Track',r.url],['Audio Spotify',audio]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(r.thumbnail)}<h3>${esc(r.title||'Spotify Play')}</h3><p class="muted">👤 ${esc(r.artist||'-')} • 💿 ${esc(r.album||'-')} • ⏱ ${esc(r.duration||'-')}</p><div class="dlMini">${via}<span class="dlChip">Popularity ${esc(r.popularity||'-')}</span><span class="dlChip">Release ${esc(r.release_at||'-')}</span></div>${dlAudio(audio)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Audio',audio)}${dlCopy('📋 Copy Audio',audio)}${dlButton('🔗 Spotify',r.url,'ghost')}</div></div>`;
    saveDownloadRiwayat(type,r.title||'Spotify Play',links);
  }
  else if(type==='yt_mp3'){
    const r=json.result||{};
    const audio=r.download_url||'';
    links=[['YouTube',r.url],['MP3 Audio',audio]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(r.thumbnail)}<h3>${esc(r.title||'YouTube MP3')}</h3><p class="muted">📺 ${esc(r.channel||'-')} • ⏱ ${esc(r.duration||'-')} • 👁 ${esc(r.views||'-')} • ${esc(r.upload_at||'-')}</p>${dlAudio(audio)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download MP3',audio)}${dlCopy('📋 Copy MP3',audio)}${dlButton('▶️ YouTube',r.url,'ghost')}</div></div>`;
    saveDownloadRiwayat(type,r.title||'YouTube MP3',links);
  }
  else if(type==='yt_video'){
    const r=json.result||{};
    const video=r.download_url||'';
    links=[['YouTube',r.url],['Video',video]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(r.thumbnail)}<h3>${esc(r.title||'YouTube Video')}</h3><p class="muted">📺 ${esc(r.channel||'-')} • ⏱ ${esc(r.duration||'-')} • 👁 ${esc(r.views||'-')} • ${esc(r.upload_at||'-')}</p>${dlVideo(video)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',video)}${dlCopy('📋 Copy Video',video)}${dlButton('▶️ YouTube',r.url,'ghost')}</div></div>`;
    saveDownloadRiwayat(type,r.title||'YouTube Video',links);
  }
  else if(type==='videy'){
    const video=json.result||'';
    links=[['Videy MP4',video]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>Videy Downloader</h3>${dlVideo(video)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',video)}${dlCopy('📋 Copy Video',video)}</div></div>`;
    saveDownloadRiwayat(type,'Videy',links);
  }
  else if(type==='capcut'){
    const r=json.result||{};
    const video=r.url||'';
    links=[['CapCut Video',video],['Thumbnail',r.thumbnail]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(r.thumbnail)}<h3>${esc(r.title||'CapCut Downloader')}</h3><p class="muted">👤 ${esc(r.author?.name||'-')} • ⏱ ${esc(r.duration||'-')}</p><div class="dlMini">${via}<span class="dlChip">Usage ${esc(r.usage||'-')}</span><span class="dlChip">Likes ${esc(r.likes||'-')}</span></div><p class="muted">${esc(r.description||'')}</p>${dlVideo(video)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',video)}${dlCopy('📋 Copy Video',video)}</div></div>`;
    saveDownloadRiwayat(type,r.title||'CapCut',links);
  }
  else if(type==='mediafire'){
    const r=json.result||{};
    const u=r.download_url||'';
    const mime=r.mimetype||'';
    links=[['MediaFire File',u]].filter(x=>x[1]);
    const preview=mime.startsWith('video/')?dlVideo(u):mime.startsWith('audio/')?dlAudio(u):mime.startsWith('image/')?dlImage(u):'';
    html=`<div class="dlCard"><h3>${esc(r.filename||'MediaFire File')}</h3><div class="dlMini">${via}<span class="dlChip">${esc(r.filesize||'unknown size')}</span><span class="dlChip">${esc(mime||'unknown mime')}</span><span class="dlChip">Uploaded ${esc(r.uploaded||'-')}</span></div>${preview}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download File',u)}${dlCopy('📋 Copy Link',u)}</div></div>`;
    saveDownloadRiwayat(type,r.filename||'MediaFire',links);
  }
  return html || '<div class="panel muted">Response belum dikenali.</div>';
}
function toolDownloader(){
  openModal('⬇️ Downloader Hub',`
    ${proxyNeedHtml()}
    <input type="hidden" id="dlType" value="tiktok">
    <div class="dlTypeGrid">
      <button class="dlTypeBtn active" data-dl="tiktok" onclick="setDlType('tiktok')">🎵 TikTok<small>Cuki</small></button>
      <button class="dlTypeBtn" data-dl="instagram" onclick="setDlType('instagram')">📸 Instagram<small>NexRay</small></button>
      <button class="dlTypeBtn" data-dl="facebook" onclick="setDlType('facebook')">📘 Facebook<small>NexRay</small></button>
      <button class="dlTypeBtn" data-dl="spotify_url" onclick="setDlType('spotify_url')">🟢 Spotify URL<small>NexRay</small></button>
      <button class="dlTypeBtn" data-dl="spotify_play" onclick="setDlType('spotify_play')">🎧 Spotify Play<small>Query</small></button>
      <button class="dlTypeBtn" data-dl="yt_mp3" onclick="setDlType('yt_mp3')">▶️ YouTube MP3<small>Preview</small></button>
      <button class="dlTypeBtn" data-dl="yt_video" onclick="setDlType('yt_video')">🎬 YouTube Video<small>Slow</small></button>
      <button class="dlTypeBtn" data-dl="videy" onclick="setDlType('videy')">🎞️ Videy<small>MP4</small></button>
      <button class="dlTypeBtn" data-dl="capcut" onclick="setDlType('capcut')">✂️ CapCut<small>Template</small></button>
      <button class="dlTypeBtn" data-dl="mediafire" onclick="setDlType('mediafire')">📦 MediaFire<small>File</small></button>
    </div>
    <input class="input" id="dlUrl" placeholder="Tempel link TikTok...">
    <button class="btn purple" style="width:100%;margin-top:12px" onclick="doDownload()">🚀 Ambil Media</button>
    <div id="dlResult" class="preview"></div>
    ${historyBlock('download','Riwayat Download')}
  `);
}
async function doDownload(){
  const type=$('dlType').value, val=$('dlUrl').value.trim();
  const out=$('dlResult');
  if(!val)return toast('Input kosong.','warn');
  const endpoint=downloaderEndpoint(type,val);
  if(!endpoint)return toast('Endpoint tidak tersedia.','err');
  const longTypes=['yt_video'];
  out.innerHTML=`<div class="panel">⏳ Mengambil data ${esc(type)}...${longTypes.includes(type)?'<br><span class="muted">YouTube video bisa lama, endpoint ini memang leletnya sopan sekali.</span>':''}</div>`;
  try{
    const json=await fetchJsonUrl(endpoint, longTypes.includes(type)?85000:30000);
    out.innerHTML=renderDownloaderResult(type,json);
  }catch(e){
    out.innerHTML=`<div class="panel"><b style="color:var(--red)">Gagal mengambil media.</b><p class="muted">${esc(e.message||e)}</p><p class="muted">Kalau buka dari ZArchiver/file://, isi Proxy URL di Admin Panel. Browser lokal itu hobi sok jagoan.</p></div>${e.endpoint||endpoint?`<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${esc(e.endpoint||endpoint)}" target="_blank">🔗 Buka Endpoint Manual</a>`:''}`;
  }
}

function toolImage(){openModal('🎨 Text to Image',`<textarea id="imgPrompt" placeholder="Prompt gambar..."></textarea><button class="btn purple" style="width:100%;margin-top:10px" onclick="makeImage()">Generate</button><div id="imgOut" class="preview"></div>${historyBlock('text2img','Riwayat Text2IMG')}`)}
function makeImage(){const p=$('imgPrompt').value.trim();if(!p)return toast('Prompt kosong.','warn');const u=`${APIS.alipBase}/imagecreator/bananagen?apikey=${APIS.alipKey}&prompt=${encodeURIComponent(p)}`;$('imgOut').innerHTML='<div class="panel">⏳ Sedang membuat gambar...</div>';setTimeout(()=>{$('imgOut').innerHTML=`<img src="${u}" onerror="this.insertAdjacentHTML('afterend','<p class=muted>Jika preview gagal, klik tombol download/buka.</p>')"><a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${u}" download target="_blank">⬇️ Download / Buka</a>`},350)}
function toolEditImg(){openModal('🍌 Edit Gambar AI',`<input class="input" id="editUrl" placeholder="URL gambar"><div style="height:9px"></div><textarea id="editPrompt" placeholder="Prompt edit..."></textarea><button class="btn purple" style="width:100%;margin-top:10px" onclick="editImage()">Edit</button><div id="editOut" class="preview"></div>${historyBlock('editimg','Riwayat Edit Gambar')}`)}
function editImage(){const url=$('editUrl').value.trim(),p=$('editPrompt').value.trim();if(!url||!p)return toast('URL gambar + prompt wajib.','warn');const u=`${APIS.alipBase}/imagecreator/bananaai?apikey=${APIS.alipKey}&url=${encodeURIComponent(url)}&prompt=${encodeURIComponent(p)}`;$('editOut').innerHTML='<div class="panel">⏳ Sedang mengedit gambar...</div>';setTimeout(()=>{$('editOut').innerHTML=`<img src="${u}"><a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${u}" target="_blank" download>⬇️ Download</a>`},350)}

function findFirstUrl(obj){
  if(!obj) return '';
  if(typeof obj === 'string'){
    if(/^https?:\/\//i.test(obj)) return obj;
    return '';
  }
  if(Array.isArray(obj)){
    for(const x of obj){ const u=findFirstUrl(x); if(u) return u; }
    return '';
  }
  if(typeof obj === 'object'){
    const preferred=['url','resultUrl','res_url','downloadUrl','download_url','image','imageUrl','img','src','output','file','path'];
    for(const k of preferred){ const u=findFirstUrl(obj[k]); if(u) return u; }
    for(const k of Object.keys(obj)){ const u=findFirstUrl(obj[k]); if(u) return u; }
  }
  return '';
}
function renderDownloadBlob(target, blob, label){
  const url = URL.createObjectURL(blob);
  $(target).innerHTML = `<div class="panel"><b>✅ ${esc(label)} selesai</b><p class="muted">Preview muncul kalau browser support formatnya.</p></div><img src="${url}" onerror="this.style.display='none'"><a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${url}" download="${esc(label).replace(/\s+/g,'-').toLowerCase()}.png">⬇️ Download ${esc(label)}</a>`;
}
function renderDownloadUrl(target, url, label, type='image'){
  const preview = type === 'video'
    ? `<video controls style="width:100%;border-radius:15px;border:1px solid var(--line);background:#050812" src="${esc(url)}"></video>`
    : `<img src="${esc(url)}" onerror="this.insertAdjacentHTML('afterend','<p class=muted>Preview gagal karena CORS/blob. Klik buka/download.</p>')">`;
  $(target).innerHTML = `${preview}<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${esc(url)}" target="_blank" download>⬇️ Download / Buka ${esc(label)}</a>`;
}
function toolRemoveBG(){
  openModal('🪄 Remove Background', `<input type="file" id="rbFile" accept="image/*" style="display:none"><label class="nativePicker" for="rbFile" onclick="setTimeout(()=>$('rbFile')?.click(),0)"><span class="emoji">🖼️</span><span class="ttl">Pilih Gambar</span><span class="chip">📁 Pilih File</span></label><button class="btn purple" style="width:100%;margin-top:10px" onclick="doRemoveBG()">Remove Background</button><div id="rbOut" class="preview"></div>`);
}
async function doRemoveBG(){
  const f=$('rbFile').files?.[0];
  if(!f) return toast('Pilih gambar dulu.','warn');
  $('rbOut').innerHTML='<div class="panel">⏳ Menghapus background...</div>';
  try{
    const form=new FormData();
    form.append('image', f, f.name || 'image.jpg');
    form.append('format','png');
    form.append('model','v1');
    const res=await fetch('https://api2.pixelcut.app/image/matte/v1',{
      method:'POST',
      headers:{'Accept':'application/json, text/plain, */*','x-locale':'en','x-client-version':'web:pixa.com:4a5b0af2'},
      body:form
    });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const blob=await res.blob();
    renderDownloadBlob('rbOut', blob, 'RemoveBG');
  }catch(e){
    $('rbOut').innerHTML=`<div class="panel"><b style="color:var(--red)">RemoveBG gagal.</b><p class="muted">${esc(e.message)}</p><p class="muted">Ini normal kalau browser kena CORS. Solusi bener: bikin endpoint Vercel /api/removebg yang menjalankan kode Node kamu.</p></div>`;
  }
}
function toolRemini(){
  openModal('✨ Remini HD', `<input type="file" id="reminiFile" accept="image/*" style="display:none"><label class="nativePicker" for="reminiFile" onclick="setTimeout(()=>$('reminiFile')?.click(),0)"><span class="emoji">🌆</span><span class="ttl">Pilih Gambar HD</span><span class="chip">📁 Pilih File</span></label><button class="btn purple" style="width:100%;margin-top:10px" onclick="doRemini()">Enhance Foto HD</button><div id="reminiOut" class="preview"></div>`);
}
async function doRemini(){
  const f=$('reminiFile').files?.[0];
  if(!f) return toast('Pilih foto dulu.','warn');
  $('reminiOut').innerHTML='<div class="panel">⏳ Upload foto ke Remini HD...</div>';
  try{
    const form=new FormData();
    form.append('file', f, f.name || 'image.jpg');
    form.append('type','13');
    form.append('scaleRadio','2');
    const up=await fetch('https://photoai.imglarger.com/api/PhoAi/Upload',{method:'POST',headers:{'accept':'application/json, text/plain, */*'},body:form});
    const uj=await up.json().catch(()=>({}));
    if(!up.ok || !uj?.data) throw new Error(uj?.message || 'Upload gagal');
    const code = typeof uj.data === 'string' ? uj.data : (uj.data.code || uj.data.taskId || uj.data);
    $('reminiOut').innerHTML='<div class="panel">⏳ Menunggu hasil HD...</div>';
    for(let i=0;i<24;i++){
      await new Promise(r=>setTimeout(r,3000));
      const ck=await fetch('https://photoai.imglarger.com/api/PhoAi/CheckStatus',{method:'POST',headers:{'accept':'application/json, text/plain, */*','content-type':'application/json'},body:JSON.stringify({code,type:13})});
      const cj=await ck.json().catch(()=>({}));
      const url=findFirstUrl(cj?.data || cj);
      const st=String(cj?.data?.status || cj?.status || '').toLowerCase();
      if(url){ renderDownloadUrl('reminiOut', url, 'Remini HD'); return; }
      if(['failed','error'].includes(st)) throw new Error(cj?.message || 'Remini gagal');
      $('reminiOut').innerHTML=`<div class="panel">⏳ Processing HD... ${i+1}/24</div>`;
    }
    throw new Error('Timeout menunggu hasil HD');
  }catch(e){
    $('reminiOut').innerHTML=`<div class="panel"><b style="color:var(--red)">Remini gagal.</b><p class="muted">${esc(e.message)}</p><p class="muted">Kalau karena CORS, pakai Vercel API route/server bot.</p></div>`;
  }
}
function toolHDVideo(){
  openModal('🎬 HD Video', `<input type="file" id="hdvFile" accept="video/*" style="display:none"><label class="nativePicker" for="hdvFile" onclick="setTimeout(()=>$('hdvFile')?.click(),0)"><span class="emoji">🎞️</span><span class="ttl">Pilih Video</span><span class="chip">📁 Pilih File</span></label><input class="input" id="hdvKey" type="password" autocomplete="off" placeholder="FGSI API key" value="fgsiapi-20c1605c-6d" style="margin-top:9px"><button class="btn purple" style="width:100%;margin-top:10px" onclick="doHDVideo()">Enhance Video</button><div id="hdvOut" class="preview"></div>`);
}
async function doHDVideo(){
  const f=$('hdvFile').files?.[0], apiKey=($('hdvKey').value||'fgsiapi-20c1605c-6d').trim();
  if(!f) return toast('Pilih video dulu.','warn');
  $('hdvOut').innerHTML='<div class="panel">⏳ Upload video dan buat task HD...</div>';
  try{
    const form=new FormData();
    form.append('file', f, f.name || 'video.mp4');
    const up=await fetch('https://fgsi.dpdns.org/api/tools/enchantVideo',{method:'POST',headers:{apikey:apiKey},body:form});
    const uj=await up.json().catch(()=>({}));
    if(!up.ok || !uj?.status || !uj?.data?.pollUrl) throw new Error(uj?.message || 'Gagal membuat task HD video');
    const pollUrl=uj.data.pollUrl;
    for(let i=0;i<120;i++){
      await new Promise(r=>setTimeout(r,3000));
      const ck=await fetch(pollUrl,{headers:{apikey:apiKey}});
      const cj=await ck.json().catch(()=>({}));
      const status=String(cj?.data?.status||'').toLowerCase();
      if(status==='success'){
        const url=cj?.data?.result?.res_url || findFirstUrl(cj?.data?.result);
        if(!url) throw new Error('Result URL tidak ditemukan');
        renderDownloadUrl('hdvOut', url, 'HD Video', 'video');
        return;
      }
      if(['failed','error','cancelled','canceled'].includes(status)) throw new Error(cj?.message || 'HD video gagal');
      $('hdvOut').innerHTML=`<div class="panel">⏳ Processing video HD... ${i+1}/120</div>`;
    }
    throw new Error('Timeout menunggu video HD');
  }catch(e){
    $('hdvOut').innerHTML=`<div class="panel"><b style="color:var(--red)">HD Video gagal.</b><p class="muted">${esc(e.message)}</p><p class="muted">Untuk file besar, pakai backend/panel bot biar tidak berat di browser.</p></div>`;
  }
}
function toolTranslate(){openModal('🌐 Translate',`<textarea id="trText" placeholder="Teks..."></textarea><input class="input" id="trLang" placeholder="Target bahasa, contoh en/id/ja"><button class="btn" style="width:100%;margin-top:10px" onclick="doTranslate()">Translate</button><div id="trOut" class="panel"></div>`)}
function doTranslate(){$('trOut').innerHTML=`<b>Mode demo:</b><br>${esc($('trText').value)} → ${esc($('trLang').value||'en')}`}
function toolOCR(){openModal('👁️ OCR Image',`<input class="input" id="ocrUrl" placeholder="URL gambar..."><button class="btn purple" style="width:100%;margin-top:10px" onclick="doOCR()">Scan OCR</button><pre id="ocrOut" class="panel" style="white-space:pre-wrap"></pre>`)}
async function doOCR(){
  const url=$('ocrUrl').value.trim();
  if(!url)return toast('URL gambar wajib diisi.','warn');
  const endpoint=`${APIS.alipBase}/tools/ocr?apikey=${APIS.alipKey}&url=${encodeURIComponent(url)}`;
  $('ocrOut').textContent='⏳ Memproses OCR...';
  try{
    const ctrl=new AbortController(); const tm=setTimeout(()=>ctrl.abort(),12000);
    const res=await fetch(endpoint,{signal:ctrl.signal}); clearTimeout(tm);
    const j=await res.json();
    if(!j.status)throw new Error(j.message||'OCR gagal');
    $('ocrOut').textContent=j.result||'Tidak ada text terdeteksi.';
  }catch(e){
    $('ocrOut').innerHTML=`OCR gagal: ${esc(e.name==='AbortError'?'Timeout OCR':e.message)}\n\nBuka endpoint manual:\n${esc(endpoint)}`;
  }
}
function ourinUrl(path, params){const q=new URLSearchParams(params);return `${cleanApiBase(APIS.ourinBase,'https://api.ourin.my.id')}/api/${path}?${q.toString()}`}
function renderMediaResult(target,url,label,type='image'){
  const box=$(target);
  const finalUrl = String(url||'') + (String(url||'').includes('?') ? '&' : '?') + '_r=' + Date.now();
  box.innerHTML='<div class="panel">⏳ Sedang membuat '+esc(label)+'...</div>';
  setTimeout(()=>{
    if(type==='video'){
      box.innerHTML=`<div class="panel mediaResult">
        <b>🎞️ ${esc(label)}</b>
        <video controls playsinline preload="metadata" style="width:100%;border-radius:15px;border:1px solid var(--line);background:#050812" src="${esc(finalUrl)}">
          <source src="${esc(finalUrl)}" type="video/mp4">
        </video>
        <div class="btnrow" style="margin-top:10px">
          <a class="btn purple" style="text-align:center;text-decoration:none" href="${esc(finalUrl)}" target="_blank" download>⬇️ Download / Buka Video</a>
          <button class="btn green" onclick="copyTourl('${escAttr(finalUrl)}')">📋 Copy Link</button>
        </div>
      </div>`;
    }else{
      box.innerHTML=`<div class="panel mediaResult">
        <b>🖼️ ${esc(label)}</b>
        <img src="${esc(finalUrl)}" onerror="this.insertAdjacentHTML('afterend','<p class=muted>Preview gagal. Klik tombol buka/download.</p>')">
        <div class="btnrow" style="margin-top:10px">
          <a class="btn purple" style="text-align:center;text-decoration:none" href="${esc(finalUrl)}" target="_blank" download>⬇️ Download / Buka ${esc(label)}</a>
          <button class="btn green" onclick="copyTourl('${escAttr(finalUrl)}')">📋 Copy Link</button>
        </div>
      </div>`;
    }
  },250)
}
function toolOCR(){openModal('👁️ OCR Image',`<input class="input" id="ocrUrl" placeholder="URL gambar..."><button class="btn purple" style="width:100%;margin-top:10px" onclick="doOCR()">Scan OCR</button><pre id="ocrOut" class="panel" style="white-space:pre-wrap"></pre>`)}
async function doOCR(){const url=$('ocrUrl').value.trim();if(!url)return toast('URL gambar wajib diisi.','warn');$('ocrOut').textContent='⏳ Memproses OCR...';try{const endpoint=`${APIS.alipBase}/tools/ocr?apikey=${APIS.alipKey}&url=${encodeURIComponent(url)}`;const j=await fetch(endpoint).then(r=>r.json());if(!j.status)throw new Error(j.message||'OCR gagal');$('ocrOut').textContent=j.result||'Tidak ada text terdeteksi.'}catch(e){$('ocrOut').textContent='Error: '+e.message}}
function ourinUrl(path, params){const q=new URLSearchParams(params);return `${cleanApiBase(APIS.ourinBase,'https://api.ourin.my.id')}/api/${path}?${q.toString()}`}
function renderMediaResult(target,url,label,type='image'){const box=$(target);box.innerHTML='<div class="panel">⏳ Sedang membuat '+esc(label)+'...</div>';setTimeout(()=>{const preview=type==='video'?`<video controls style="width:100%;border-radius:15px;border:1px solid var(--line);background:#050812" src="${esc(url)}"></video>`:`<img src="${esc(url)}" onerror="this.insertAdjacentHTML('afterend','<p class=muted>Preview gagal karena CORS/blob. Klik tombol buka/download.</p>')">`;box.innerHTML=`${preview}<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${esc(url)}" target="_blank" download>⬇️ Download / Buka ${esc(label)}</a>`},350)}
function findFirstUrl(obj){if(!obj)return'';if(typeof obj==='string'){return/^https?:\/\//i.test(obj)?obj:''}if(Array.isArray(obj)){for(const x of obj){const u=findFirstUrl(x);if(u)return u}return''}if(typeof obj==='object'){const preferred=['url','resultUrl','res_url','downloadUrl','download_url','audio','image','imageUrl','img','src','output','file','path'];for(const k of preferred){const u=findFirstUrl(obj[k]);if(u)return u}for(const k of Object.keys(obj)){const u=findFirstUrl(obj[k]);if(u)return u}}return''}
function toolBrat(){openModal('😎 Brat Generator',`<select id="bratMode"><option value="brat">Default</option><option value="bratvid">Video</option><option value="bratbahlil">Bahlil</option><option value="brat-grenn">Green</option></select><div style="height:9px"></div><input class="input" id="bratTxt" placeholder="Teks brat..."><button class="btn purple" style="width:100%;margin-top:10px" onclick="makeBrat()">Buat Brat</button><div id="bratOut" class="preview"></div>${historyBlock('brat','Riwayat Brat')}`)}
function makeBrat(){const t=$('bratTxt').value.trim(),mode=$('bratMode').value;if(!t)return toast('Teks kosong.','warn');renderMediaResult('bratOut',ourinUrl(mode,{text:t}),mode==='bratvid'?'Brat Video':'Brat',mode==='bratvid'?'video':'image');try{addToolRiwayat('brat',{title:mode==='bratvid'?'Brat Video':'Brat',url:ourinUrl(mode,{text:t}),type:mode==='bratvid'?'video':'image',note:t})}catch{}}
function toolFakeMaker(){
  openModal('🎭 Fake Maker',`<select id="fakeType" onchange="renderFakeFields()">
    <option value="ngl">Fake NGL</option>
    <option value="ml">Fake MLBB</option>
    <option value="ff">Fake FF Solo</option>
    <option value="ffduo">Fake FF Duo</option>
    <option value="ffduo2">Fake FF Duo 2</option>
    <option value="nokia">Fake Nokia</option>
    <option value="nulis">Fake Nulis</option>
    <option value="dev1">Fake Developer 1</option>
    <option value="dev2">Fake Developer 2</option>
    <option value="dev3">Fake Developer 3</option>
  </select><div id="fakeFields" style="margin-top:9px"></div><button class="btn purple" style="width:100%;margin-top:10px" onclick="makeFakeUnified()">Buat Fake</button><div id="fakeOut" class="preview"></div>`);
  renderFakeFields();
}
function renderFakeFields(){
  const t=$('fakeType').value;
  let h='';
  if(t==='ngl')h='<textarea id="fkText" placeholder="Text NGL..."></textarea>';
  else if(t==='ml')h='<input class="input" id="fkText" placeholder="Text, contoh SAVAGE"><div style="height:9px"></div><input class="input" id="fkImage" placeholder="URL gambar">';
  else if(t==='ff')h='<input class="input" id="fkText" placeholder="Text, contoh PRO PLAYER"><div style="height:9px"></div><select id="fkBg"><option value="random">random</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select>';
  else if(t==='ffduo'||t==='ffduo2')h='<input class="input" id="fkName1" placeholder="Nama 1"><div style="height:9px"></div><input class="input" id="fkName2" placeholder="Nama 2"><div style="height:9px"></div><select id="fkBg"><option value="random">random</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select>';
  else if(t==='nokia')h='<input class="input" id="fkName" placeholder="Nama, contoh Pak RT"><div style="height:9px"></div><textarea id="fkText" placeholder="Teks pesan..."></textarea>';
  else if(t==='nulis')h='<textarea id="fkText" placeholder="Teks tulisan..."></textarea>';
  else h='<input class="input" id="fkText" placeholder="Text, contoh Developer"><div style="height:9px"></div><input class="input" id="fkImage" placeholder="URL gambar/profile"><div style="height:9px"></div><select id="fkVerified"><option value="true">Verified</option><option value="false">Tidak Verified</option></select>';
  $('fakeFields').innerHTML=h;
}
function makeFakeUnified(){
  const t=$('fakeType').value;
  let url='', label='Fake Maker';
  if(t==='ngl'){const text=$('fkText').value.trim();if(!text)return toast('Text kosong.','warn');url=ourinUrl('fake-ngl-link',{text});label='Fake NGL'}
  else if(t==='ml'){const text=$('fkText').value.trim(),image=$('fkImage').value.trim();if(!text||!image)return toast('Text dan URL gambar wajib.','warn');url=ourinUrl('fake-mlbb',{text,image});label='Fake MLBB'}
  else if(t==='ff'){const text=$('fkText').value.trim(),bg=$('fkBg').value;if(!text)return toast('Text wajib.','warn');url=ourinUrl('fake-free-fire-2',{text,bg});label='Fake FF'}
  else if(t==='ffduo'||t==='ffduo2'){const name1=$('fkName1').value.trim(),name2=$('fkName2').value.trim(),bg=$('fkBg').value;if(!name1||!name2)return toast('Dua nama wajib.','warn');url=ourinUrl(t==='ffduo'?'fake-ff-duo':'fake-ff-duo-2',{name1,name2,bg});label=t==='ffduo'?'Fake FF Duo':'Fake FF Duo 2'}
  else if(t==='nokia'){const nama=$('fkName').value.trim(),text=$('fkText').value.trim();if(!nama||!text)return toast('Nama dan teks wajib.','warn');url=ourinUrl('nokia-simulator',{nama,text});label='Fake Nokia'}
  else if(t==='nulis'){const text=$('fkText').value.trim();if(!text)return toast('Text kosong.','warn');url=ourinUrl('nulis-buku',{text});label='Fake Nulis'}
  else {const text=$('fkText').value.trim()||'Developer',img=$('fkImage').value.trim(),verified=$('fkVerified').value;if(!img)return toast('URL gambar wajib.','warn');const path=t==='dev1'?'fake-developer-1':t==='dev2'?'fake-developer-2':'fake-developer-3';const params=t==='dev2'?{text,url:img}:{text,image:img,verified};url=ourinUrl(path,params);label='Fake Developer'}
  renderMediaResult('fakeOut',url,label);
}
function toolIQC(){openModal('🧾 IQC Maker',`<input class="input" id="iqcTime" placeholder="Jam, contoh 20:20"><div style="height:9px"></div><textarea id="iqcText" placeholder="Text chat..."></textarea><input class="input" id="iqcImg" placeholder="URL foto profil"><button class="btn purple" style="width:100%;margin-top:10px" onclick="makeIQC()">Buat IQC</button><div id="iqcOut" class="preview"></div>${historyBlock('iqc','Riwayat IQC')}`)}
function makeIQC(){if(!$('iqcText').value.trim())return toast('Text IQC kosong.','warn');const u=`${APIS.alipBase}/imagecreator/iqc?apikey=${APIS.alipKey}&time=${encodeURIComponent($('iqcTime').value||'20:20')}&text=${encodeURIComponent($('iqcText').value)}&imageUrl=${encodeURIComponent($('iqcImg').value||'')}`;$('iqcOut').innerHTML='<div class="panel">⏳ Sedang membuat IQC...</div>';setTimeout(()=>{$('iqcOut').innerHTML=`<img src="${u}"><a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${u}" target="_blank" download>⬇️ Download</a>`},350)}
async function uploadRemoteMediaToRahmad(url, filename='media.mp3', mime='audio/mpeg'){
  const res = await fetch(url, { cache:'no-store' });
  if(!res.ok) throw new Error('Gagal mengambil media result');
  const blob = await res.blob();
  const file = new File([blob], filename, { type: mime || blob.type || 'application/octet-stream' });
  return await uploadRahmad(file);
}
function toolStalk(){
  openModal('🔍 Stalk Center',`
    <select id="stType" onchange="renderStalkFields()">
      <option value="ig">Instagram</option>
      <option value="roblox">Roblox</option>
      <option value="tiktok">TikTok</option>
      <option value="github">GitHub</option>
      <option value="ff">Free Fire</option>
    </select>
    <div id="stFields" style="margin-top:9px"></div>
    <button class="btn purple" style="width:100%;margin-top:10px" onclick="doStalk()">Stalk</button>
    <div id="stOut" class="preview"></div>
  `);
  renderStalkFields();
}
function renderStalkFields(){
  const type=$('stType').value;
  const hints={
    ig:'Username Instagram, contoh pakbadhot',
    roblox:'Username Roblox, contoh yaudahiyaa11',
    tiktok:'Username TikTok, contoh ellstore_1237',
    github:'Username GitHub, contoh ellpigi'
  };
  if(type==='ff'){
    $('stFields').innerHTML=`
      <input class="input" id="stQuery" placeholder="UID Free Fire, contoh 1814767711" inputmode="numeric">
      <div style="height:9px"></div>
      <select id="ffRegion">${(window.FF_REGIONS||FF_REGIONS).map(([c,n])=>`<option value="${c}">${n}</option>`).join('')}</select>
`;
  }else{
    const endpoint = type==='ig' ? `${CUKI_API.base}/api/stalker/Instagram?apikey=***&query=`
      : type==='tiktok' ? `${CUKI_API.base}/api/stalker/tiktok?apikey=***&username=`
      : `${CUKI_API.base}/api/stalker/${type}?apikey=***&query=`;
    $('stFields').innerHTML=`<input class="input" id="stQuery" placeholder="${esc(hints[type]||'Username / ID')}">`;
  }
}
function shortCount(n){
  n=Number(n)||0;
  if(n>=1e9)return(n/1e9).toFixed(1).replace('.0','')+'B';
  if(n>=1e6)return(n/1e6).toFixed(1).replace('.0','')+'M';
  if(n>=1e3)return(n/1e3).toFixed(1).replace('.0','')+'K';
  return String(n);
}
function stalkRows(obj){return Object.entries(obj).map(([k,v])=>`<div class="stalkMini"><span class="muted">${esc(k)}</span><b>${esc(v??'-')}</b></div>`).join('')}
function stalkHtml(title, main, img='', extra='', raw=null){
  $('stOut').innerHTML=`<div class="stalkCard">${img?`<img src="${esc(img)}" onerror="this.style.display='none'">`:''}<h3>${esc(title)}</h3><div class="stalkGrid">${stalkRows(main)}</div>${extra?`<div style="margin-top:10px">${extra}</div>`:''}${raw?`<details style="margin-top:10px"><summary>Raw JSON</summary><pre style="white-space:pre-wrap;font-size:11px;overflow:auto">${esc(JSON.stringify(raw,null,2))}</pre></details>`:''}</div>`;
}
function stalkFail(msg, endpoint=''){
  $('stOut').innerHTML=`<div class="panel"><b style="color:var(--red)">Stalk gagal.</b><p class="muted">${esc(msg||'Unknown error')}</p>${endpoint?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${esc(endpoint)}" target="_blank">🔗 Buka Endpoint</a>`:''}</div>`;
}
async function fetchJsonTimeout(url, opt={}, timeoutMs=18000){
  async function once(target, options){
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const res=await fetch(target,{...options,signal:ctrl.signal});
      const txt=await res.text();
      let json;
      try{json=JSON.parse(txt)}catch{throw new Error('Response bukan JSON')}
      if(!res.ok)throw new Error(json.message||json.error||('HTTP '+res.status));
      return json;
    }finally{clearTimeout(t)}
  }
  try{return await once(url,opt)}
  catch(e){
    if(opt.method&&opt.method!=='GET')throw e;
    const proxies=['https://api.allorigins.win/raw?url='+encodeURIComponent(url),'https://corsproxy.io/?'+encodeURIComponent(url)];
    for(const p of proxies){try{return await once(p,{method:'GET'})}catch{}}
    e.endpoint=url;throw e;
  }
}
async function cukiStalk(path, params={}){
  const j = await cukiFetch(`/api/stalker/${path}`, params, 10000);
  if(!j?.data) throw Object.assign(new Error(j?.message || 'Data stalk kosong'), {endpoint:j?.__endpoint || ''});
  return {j,endpoint:j.__endpoint||''};
}
async function doStalk(){
  const type=$('stType').value;
  const q=$('stQuery').value.trim();
  if(!q)return toast('Query kosong.','warn');
  $('stOut').innerHTML='<div class="panel">⏳ Loading stalk...</div>';
  try{
    if(type==='ig')return await stalkInstagram(q.replace('@',''));
    if(type==='roblox')return await stalkRoblox(q);
    if(type==='tiktok')return await stalkTikTok(q.replace('@',''));
    if(type==='github')return await stalkGithub(q.replace('@',''));
    if(type==='ff')return await stalkFFHL(q,$('ffRegion')?.value||'id');
  }catch(e){
    stalkFail(e.name==='AbortError'?'Timeout/CORS API.':e.message,e.endpoint||e.__endpoint||'');
  }
}
async function stalkInstagram(username){
  const {j}=await cukiStalk('Instagram',{query:username});
  const d=j.data;
  stalkHtml('📸 Instagram Stalk',{Username:d.username||username,Nama:d.full_name||'-',Verified:d.is_verified?'Ya':'Tidak',Private:d.is_private?'Ya':'Tidak',Followers:shortCount(d.follower_count),Following:shortCount(d.following_count),Postingan:shortCount(d.media_count),Kategori:d.category||'-'},d.profile_pic_url_hd||d.profile_pic_url||'',`<p class="muted">Bio:<br>${esc(d.biography||'-')}</p>${d.external_url?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(d.external_url)}" target="_blank">External URL</a>`:''}<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(d.url||('https://instagram.com/'+username))}" target="_blank">Buka Instagram</a>`,j);
}
async function stalkRoblox(username){
  const {j}=await cukiStalk('roblox',{query:username});
  const d=j.data;
  stalkHtml('🎮 Roblox Stalk',{Username:d.username||username,Display:d.displayName||'-',UserID:d.userId||'-',Banned:d.isBanned?'Ya':'Tidak',Created:d.created?new Date(d.created).toLocaleDateString('id-ID'):'-'},d.thumb||'',`<p class="muted">Bio:<br>${esc(d.description||'-')}</p><a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(d.url||'#')}" target="_blank">Buka Roblox</a>`,j);
}
async function stalkTikTok(username){
  const {j}=await cukiStalk('tiktok',{username});
  const d=j.data;
  stalkHtml('🎵 TikTok Stalk',{Username:'@'+(d.username||username),Nama:d.name||'-',Followers:shortCount(d.followers),Following:shortCount(d.following),Likes:shortCount(d.likes),Video:d.videoCount??'-'},d.avatar||'',`<p class="muted">Bio:<br>${esc(d.bio||'-')}</p><a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(d.profile_url||('https://www.tiktok.com/@'+username))}" target="_blank">Buka TikTok</a>`,j);
}
async function stalkGithub(username){
  const {j}=await cukiStalk('github',{query:username});
  const d=j.data;
  stalkHtml('🐙 GitHub Stalk',{Login:d.login||username,ID:d.id||'-',Type:d.type||'-',Admin:d.site_admin?'Ya':'Tidak',Repo:d.public_repos??'-',Gist:d.public_gists??'-',Followers:shortCount(d.followers),Following:shortCount(d.following),Created:d.created_at?new Date(d.created_at).toLocaleDateString('id-ID'):'-'},d.avatar_url||'',`<p class="muted">Bio: ${esc(d.bio||'-')}</p><p class="muted">Company: ${esc(d.company||'-')}<br>Location: ${esc(d.location||'-')}</p><a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(d.html_url||'#')}" target="_blank">Buka GitHub</a>`,j);
}

const FF_HL = {
  devUid: 'HEyllxAnFpMnEpBKrpoDyfrGj652',
  apiKey: 'zvXG2jHW4Ow1pZPlhz85FnLwG4PC4L'
};
const STALK_BASE = {
  ff: 'https://proapis.hlgamingofficial.com/main/games/freefire/account/api'
};
const FF_REGIONS = [
  ['id','🇮🇩 Indonesia'],
  ['sg','🇸🇬 Singapore'],
  ['br','🇧🇷 Brazil'],
  ['th','🇹🇭 Thailand'],
  ['vn','🇻🇳 Vietnam'],
  ['me','🇦🇪 Middle East'],
  ['pk','🇵🇰 Pakistan'],
  ['bd','🇧🇩 Bangladesh'],
  ['cis','🌍 CIS'],
  ['us','🇺🇸 United States'],
  ['ru','🇷🇺 Russia'],
  ['tw','🇹🇼 Taiwan'],
  ['ind','🇮🇳 India']
];
function onlyNumber(text=''){return String(text).replace(/[^\d]/g,'')}
function ffRegionName(code){
  const map={id:'Indonesia',sg:'Singapore',br:'Brazil',th:'Thailand',vn:'Vietnam',me:'Middle East',pk:'Pakistan',bd:'Bangladesh',cis:'CIS',us:'United States',ru:'Russia',tw:'Taiwan',ind:'India'};
  return map[String(code||'').toLowerCase()] || String(code||'-');
}
window.FF_REGIONS = FF_REGIONS;
function formatUnix(ts){
  const num=Number(ts);
  if(!num)return '-';
  const ms=String(num).length===10?num*1000:num;
  return new Date(ms).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'});
}

function normalizeHLFF(uid,region,data){
  const result=data?.result||{};
  const acc=result?.AccountInfo||{};
  const guild=result?.GuildInfo||{};
  const cap=result?.captainBasicInfo||result?.CaptainBasicInfo||{};
  return {uid,regionCode:region,nickname:acc.AccountName,region:ffRegionName(acc.AccountRegion||region),level:acc.AccountLevel,likes:acc.AccountLikes,bio:result?.socialinfo?.AccountSignature||result?.AccountSignature||'Tidak tersedia',createdAt:formatUnix(acc.AccountCreateTime),lastActive:formatUnix(acc.AccountLastLogin),avatar:acc.AccountAvatarImage||'',banner:acc.AccountBannerImage||result?.AccountProfileInfo?.BannerImage||'',guildName:guild.GuildName||guild.Name||'-',guildId:guild.GuildID||guild.GuildId||'-',guildLevel:guild.GuildLevel||guild.Level||'-',guildCaptain:cap.nickname||cap.AccountName||guild.CaptainName||'-',brRank:acc.BrMaxRank,brPoints:acc.BrRankPoint,csRank:acc.CsMaxRank,csPoints:acc.CsRankPoint,petName:result?.petInfo?.name||result?.PetInfo?.Name||'-',petLevel:result?.petInfo?.level||result?.PetInfo?.Level||'-',accountStatus:acc.ReleaseVersion||'Active',bpBadges:acc.AccountBPBadges||'-',diamondCost:acc.DiamondCost||'-',raw:data}
}
async function stalkFFHL(uidRaw,region='id'){
  const uid=onlyNumber(uidRaw);
  if(!uid)throw new Error('UID FF tidak valid.');
  const params=new URLSearchParams({
    sectionName:'AllData',
    PlayerUid:String(uid),
    region:String(region||'id').toLowerCase(),
    useruid:FF_HL.devUid,
    api:FF_HL.apiKey
  });
  const endpoint=`${STALK_BASE.ff}?${params.toString()}`;
  const j=await fetchJsonTimeout(endpoint,{method:'GET',headers:{accept:'application/json','user-agent':'Mozilla/5.0'}},28000);
  const d=normalizeHLFF(uid,region,j);

  if(!d.nickname)throw Object.assign(new Error('Data akun FF tidak ditemukan / region salah / API HL sibuk.'),{endpoint});

  const img=d.banner||d.avatar||'';
  const extra=`
    <p class="muted">Bio:<br>${esc(d.bio||'-')}</p>
    <h3>🏆 Rank Info</h3>
    <div class="stalkGrid">${stalkRows({BR_Rank:d.brRank||'-',BR_Points:d.brPoints||'-',CS_Rank:d.csRank||'-',CS_Points:d.csPoints||'-'})}</div>
    <h3>👥 Guild Info</h3>
    <div class="stalkGrid">${stalkRows({Guild:d.guildName||'-',Guild_ID:d.guildId||'-',Guild_Level:d.guildLevel||'-',Captain:d.guildCaptain||'-'})}</div>
    <h3>🐾 Extra</h3>
    <div class="stalkGrid">${stalkRows({Pet:d.petName||'-',Pet_Level:d.petLevel||'-',BP_Badges:d.bpBadges||'-',Diamond_Cost:d.diamondCost||'-'})}</div>
    <a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${esc(endpoint)}" target="_blank">🔗 Buka Endpoint FF</a>
  `;
  stalkHtml('🔥 Free Fire Stalk',{
    UID:d.uid,
    Nickname:d.nickname,
    Region:d.region,
    Level:d.level||'-',
    Likes:d.likes||'-',
    Created:d.createdAt,
    Last_Login:d.lastActive,
    Status:d.accountStatus||'Active'
  },img,extra,j);
}
function toolCalc(){
  calcExpr='0';
  openModal('🧮 Kalkulator',`<div class="panel"><input class="input mono calcScreen" id="calcDisplay" value="0" readonly></div><div class="calcGrid">${[
    ['AC','C','op'],['⌫','DEL','op'],['%','%','op'],['÷','/','op'],
    ['7','7',''],['8','8',''],['9','9',''],['×','*','op'],
    ['4','4',''],['5','5',''],['6','6',''],['−','-','op'],
    ['1','1',''],['2','2',''],['3','3',''],['+','+','op'],
    ['0','0',''],['00','00',''],['.','.',''],['=','=','eq']
  ].map(b=>`<button class="calcBtn ${b[2]}" onclick="calcPress('${b[1]}')">${b[0]}</button>`).join('')}</div>`);
}
function formatCalcDisplay(expr){return String(expr).split(/([+\-*/%])/).map(p=>/^\d+$/.test(p)?Number(p).toLocaleString('id-ID'):p).join('')}
function calcPress(x){try{if(x==='C')calcExpr='0';else if(x==='DEL')calcExpr=calcExpr.length>1?calcExpr.slice(0,-1):'0';else if(x==='='){const safe=calcExpr.replace(/\./g,'').replace(/%/g,'/100');if(!/^[0-9+\-*/().\s]+$/.test(safe))throw Error('bad');calcExpr=String(Function('return ('+safe+')')())}else{if(calcExpr==='0'&&/[0-9]/.test(x))calcExpr=x;else calcExpr+=x}}catch{calcExpr='0';toast('Format kalkulator salah.','err')}if($('calcDisplay'))$('calcDisplay').value=formatCalcDisplay(calcExpr)}

async function cukiFetch(path, params={}, timeoutMs=12000){
  const url = new URL(CUKI_API.base + path);
  url.searchParams.set('apikey', CUKI_API.key || 'cuki-x');
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  const direct = url.toString();

  function parseProxyJson(json,label){
    if(json && typeof json.contents === 'string'){
      try{ json = JSON.parse(json.contents); }catch{}
    }
    if(json && typeof json.body === 'string'){
      try{ json = JSON.parse(json.body); }catch{}
    }
    if(json && typeof json.data === 'string' && json.data.trim().startsWith('{')){
      try{ json = JSON.parse(json.data); }catch{}
    }
    if(json && typeof json === 'object') json.__via = json.__via || label;
    return json;
  }

  async function fetchOne(target,label){
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const res = await fetch(target,{
        method:'GET',
        signal:ctrl.signal,
        cache:'no-store',
        headers:{'accept':'application/json,text/plain,*/*'}
      });
      const txt = await res.text();
      let json;
      try{ json = JSON.parse(txt); }
      catch{
        const m = txt.match(/\{[\s\S]*\}/);
        if(m) json = JSON.parse(m[0]);
        else throw new Error('Response bukan JSON');
      }
      json = parseProxyJson(json,label);
      if(!res.ok) throw new Error(json?.message || 'HTTP '+res.status);
      if(json?.status === false || (json?.statusCode && json.statusCode >= 400)) throw new Error(json.message || 'API error');
      json.__endpoint = direct;
      json.__via = json.__via || label;
      return json;
    }finally{
      clearTimeout(timer);
    }
  }

  const encoded = encodeURIComponent(direct);
  const targets = [
    ['direct', direct],
    ['allorigins', 'https://api.allorigins.win/raw?url=' + encoded],
    ['allorigins-get', 'https://api.allorigins.win/get?url=' + encoded],
    ['corsproxy', 'https://corsproxy.io/?' + encoded],
    ['codetabs', 'https://api.codetabs.com/v1/proxy?quest=' + encoded]
  ];

  let settled = false;
  const errors = [];
  return await new Promise((resolve,reject)=>{
    const globalTimer = setTimeout(()=>{
      if(settled) return;
      settled = true;
      const err = new Error(errors.join(' | ') || 'Timeout semua jalur API');
      err.endpoint = direct;
      err.details = errors;
      reject(err);
    }, timeoutMs + 1500);

    targets.forEach(([label,target])=>{
      fetchOne(target,label).then(json=>{
        if(settled) return;
        settled = true;
        clearTimeout(globalTimer);
        resolve(json);
      }).catch(e=>{
        errors.push(label + ': ' + (e.name==='AbortError'?'timeout':e.message));
        if(errors.length === targets.length && !settled){
          settled = true;
          clearTimeout(globalTimer);
          const err = new Error(errors.join(' | '));
          err.endpoint = direct;
          err.details = errors;
          reject(err);
        }
      });
    });
  });
}

async function cukiFetchFresh(path, params={}, timeoutMs=12000){
  const url = new URL(CUKI_API.base + path);
  url.searchParams.set('apikey', CUKI_API.key || 'cuki-x');
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  url.searchParams.set('_r', String(Date.now()));
  const direct = url.toString();

  async function tryFetch(target,label,ms=timeoutMs){
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),ms);
    try{
      const res=await fetch(target,{
        method:'GET',
        signal:ctrl.signal,
        cache:'no-store',
        headers:{'accept':'application/json,text/plain,*/*','cache-control':'no-cache','pragma':'no-cache'}
      });
      const txt=await res.text();
      let json;
      try{json=JSON.parse(txt)}
      catch{
        const found=String(txt||'').match(/\{[\s\S]*\}/);
        if(found) json=JSON.parse(found[0]);
        else throw new Error('Response bukan JSON');
      }
      if(json && typeof json.contents==='string'){try{json=JSON.parse(json.contents)}catch{}}
      if(json && typeof json.body==='string'){try{json=JSON.parse(json.body)}catch{}}
      if(!res.ok) throw new Error(json?.message||json?.msg||'HTTP '+res.status);
      if(json?.status===false || json?.success===false || (json?.statusCode && json.statusCode>=400)) throw new Error(json.message||json.msg||'API error');
      json.__endpoint=direct; json.__via=label;
      return json;
    }finally{clearTimeout(timer)}
  }

  const errors=[];
  const proxy=getProxyUrl();
  if(proxy){
    try{return await tryFetch(proxiedUrl(direct),'proxy',timeoutMs+2500)}
    catch(e){errors.push('proxy: '+(e.name==='AbortError'?'timeout':e.message))}
  }

  const encoded=encodeURIComponent(direct);
  const targets = isFileMode()
    ? [
        ['direct',direct],
        ['allorigins','https://api.allorigins.win/raw?url='+encoded+'&_='+Date.now()],
        ['corsproxy','https://corsproxy.io/?'+encoded+'&_='+Date.now()]
      ]
    : [['direct',direct],['allorigins','https://api.allorigins.win/raw?url='+encoded+'&_='+Date.now()]];

  for(const [label,target] of targets){
    try{return await tryFetch(target,label,timeoutMs)}
    catch(e){errors.push(label+': '+(e.name==='AbortError'?'timeout':e.message))}
  }
  const err=new Error(errors.join(' | ') || 'Gagal terhubung');
  err.endpoint=direct;
  throw err;
}

function cukiError(target,e){
  target.innerHTML=`<div class="panel"><b style="color:var(--red)">Gagal terhubung.</b><p class="muted">${esc(e.name==='AbortError'?'Timeout API':e.message)}</p>${e.endpoint?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${esc(e.endpoint)}" target="_blank">🔗 Buka Endpoint</a>`:''}</div>`;
}


function arrFromAny(v){
  if(Array.isArray(v)) return v;
  if(!v || typeof v !== 'object') return [];
  if(Array.isArray(v.results)) return v.results;
  if(Array.isArray(v.result)) return v.result;
  if(Array.isArray(v.data)) return v.data;
  return Object.keys(v).filter(k=>/^\d+$/.test(k)).map(k=>v[k]).filter(Boolean);
}
function pickFirstUrl(obj, keys=[]){
  for(const k of keys){
    const val = k.split('.').reduce((a,b)=>a?.[b], obj);
    if(typeof val === 'string' && /^https?:\/\//i.test(val)) return val;
  }
  return '';
}

function renderTikTokSearchCards(arr, raw){
  return (arr||[]).slice(0,12).map(v=>{
    const video=v.video||{}, a=v.author||{}, s=v.stats||{}, m=v.music||{};
    const title=v.title||v.description||'TikTok Video';
    return `<div class="stalkCard">
      ${video.cover?`<img src="${esc(video.cover)}" onerror="this.style.display='none'">`:''}
      <h3>${esc(title)}</h3>
      <p class="muted">@${esc(a.username||'-')} • ${esc(a.nickname||'-')} • ${esc(v.duration||'-')}s</p>
      <div class="stalkGrid">${stalkRows({Views:shortCount(s.views),Likes:shortCount(s.likes),Comments:shortCount(s.comments),Shares:shortCount(s.shares),Music:m.title||'-',Source:v.source||'-'})}</div>
      ${video.url?`<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(video.url)}" target="_blank" download>⬇️ Download / Buka Video</a>`:''}
      ${m.url?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(m.url)}" target="_blank" download>🎧 Download Musik</a>`:''}
    </div>`;
  }).join('') || `<div class="panel muted">Tidak ada hasil.${raw?.__endpoint?`<br><a href="${esc(raw.__endpoint)}" target="_blank">Buka endpoint</a>`:''}</div>`;
}

function alipUrl(path, params={}){
  const url = new URL(APIS.alipBase + path);
  url.searchParams.set('apikey', APIS.alipKey || 'alipaiapikeybaru');
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  url.searchParams.set('_r', String(Date.now()));
  return url.toString();
}
async function alipFetchFresh(path, params={}, timeoutMs=14000){
  const direct = alipUrl(path, params);
  async function tryOne(target,label){
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const res = await fetch(target,{method:'GET',signal:ctrl.signal,cache:'no-store',headers:{accept:'application/json,text/plain,*/*'}});
      const txt = await res.text();
      let json;
      try{json=JSON.parse(txt)}catch{
        const m=txt.match(/\{[\s\S]*\}/);
        if(m) json=JSON.parse(m[0]);
        else throw new Error('Response bukan JSON');
      }
      if(json && typeof json.contents==='string'){
        try{json=JSON.parse(json.contents)}catch{}
      }
      if(json && typeof json.body==='string'){
        try{json=JSON.parse(json.body)}catch{}
      }
      if(!res.ok) throw new Error(json?.message || 'HTTP '+res.status);
      if(json?.status === false) throw new Error(json?.message || 'API status false');
      json.__endpoint = direct;
      json.__via = label;
      return json;
    }finally{clearTimeout(timer)}
  }
  const enc=encodeURIComponent(direct);
  const targets=[
    ['direct',direct],
    ['allorigins','https://api.allorigins.win/raw?url='+enc+'&_='+Date.now()],
    ['corsproxy','https://corsproxy.io/?'+enc+'&_='+Date.now()],
    ['codetabs','https://api.codetabs.com/v1/proxy?quest='+enc]
  ];
  const attempts = targets.map(([label,target])=>tryOne(target,label).catch(e=>{
    e.message = label + ': ' + (e.name === 'AbortError' ? 'timeout' : e.message);
    throw e;
  }));
  try{
    return await Promise.any(attempts);
  }catch(all){
    const err = new Error((all.errors||[]).map(e=>e.message).join(' | ') || 'Semua jalur Alip gagal');
    err.endpoint = direct;
    throw err;
  }
}
function renderAlipTikTokCards(arr, raw){
  const list = arrFromAny(arr);
  return list.slice(0,12).map(v=>{
    const a=v.author||v.author_info||{}, m=v.music_info||v.music||{};
    const play=v.play || v.video?.url || v.video?.play || v.nowm || v.hdplay || v.wmplay || '';
    const cover=v.cover || v.video?.cover || v.thumbnail || '';
    const music=(typeof m==='string'?m:(m.play||m.url||v.music_url||''));
    return `<div class="stalkCard">
      ${cover?`<img src="${esc(cover)}" onerror="this.style.display='none'">`:''}
      <h3>${esc(v.title||v.desc||v.description||'TikTok Video')}</h3>
      <p class="muted">@${esc(a.unique_id||a.username||'-')} • ${esc(a.nickname||a.name||'-')} • ${esc(v.duration||'-')}s</p>
      <div class="stalkGrid">${stalkRows({
        Views:shortCount(v.play_count||v.stats?.views),
        Likes:shortCount(v.digg_count||v.stats?.likes),
        Comments:shortCount(v.comment_count||v.stats?.comments),
        Shares:shortCount(v.share_count||v.stats?.shares),
        Region:v.region||'-',
        Music:(typeof m==='object' ? (m.title||'-') : '-')
      })}</div>
      ${play?`<video controls playsinline preload="metadata" src="${esc(play)}" style="width:100%;border-radius:14px;margin-top:10px;background:#050812"></video>
      <div class="btnrow" style="margin-top:8px"><a class="btn purple" style="text-align:center;text-decoration:none" href="${esc(play)}" target="_blank" download>⬇️ Download Video</a><button class="btn green" onclick="copyTourl('${escAttr(play)}')">📋 Copy Video</button></div>`:''}
      ${music?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(music)}" target="_blank" download>🎧 Download Musik</a>`:''}
    </div>`;
  }).join('') || `<div class="panel muted">Tidak ada hasil TikTok Video.${raw?.__endpoint?`<br><a href="${esc(raw.__endpoint)}" target="_blank">Buka endpoint</a>`:''}</div>`;
}
function renderPinterestImageList(list, raw){
  return (list||[]).slice(0,30).map((url,i)=>`<div class="stalkCard">
    <img src="${esc(url)}" onerror="this.style.display='none'">
    <h3>Pinterest Image #${i+1}</h3>
    <a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(url)}" target="_blank">Buka Image</a>
    <button class="btn green" style="width:100%;margin-top:8px" onclick="copyTourl('${escAttr(url)}')">📋 Copy</button>
  </div>`).join('') || `<div class="panel muted">Tidak ada hasil.${raw?.__endpoint?`<br><a href="${esc(raw.__endpoint)}" target="_blank">Buka endpoint</a>`:''}</div>`;
}
function renderCukiPinterestVideo(arr, raw){
  const list = arrFromAny(arr);
  return list.slice(0,12).map(x=>{
    const media=x.video_url||x.video||x.videos?.[0]?.url||x.gif_url||x.download_url||'';
    const cover=x.image_url||x.cover||x.thumbnail||x.images?.[0]||'';
    return `<div class="stalkCard">
      ${media?`<video controls playsinline preload="metadata" src="${esc(media)}" style="width:100%;border-radius:14px;background:#050812"></video>`:(cover?`<img src="${esc(cover)}" onerror="this.style.display='none'">`:'' )}
      <h3>${esc(x.grid_title||x.title||x.description||'Pinterest Video')}</h3>
      <p class="muted">${esc(x.created_at||'')} • ❤️ ${esc(Object.values(x.reaction_counts||{})[0]||0)}</p>
      ${media?`<div class="btnrow"><a class="btn purple" style="text-align:center;text-decoration:none" href="${esc(media)}" target="_blank" download>⬇️ Download/Buka</a><button class="btn green" onclick="copyTourl('${escAttr(media)}')">📋 Copy</button></div>`:''}
    </div>`;
  }).join('') || `<div class="panel muted">Tidak ada video dari API.${raw?.__endpoint?`<br><a href="${esc(raw.__endpoint)}" target="_blank">Buka endpoint</a>`:''}</div>`;
}
function renderTikTokFotoCards(arr, raw){
  const list = arrFromAny(arr);
  return list.slice(0,12).map(item=>{
    const a=item.author||{};
    const stats=item.stats||{};
    const imgs=(Array.isArray(item.images)?item.images:arrFromAny(item.images||[]))
      .map(x=>typeof x==='string'?x:(x.url||x.image||''))
      .filter(Boolean);
    const cover = a.avatar || imgs[0] || '';
    return `<div class="stalkCard">
      ${cover?`<img src="${esc(cover)}" onerror="this.style.display='none'">`:''}
      <h3>${esc(item.title||item.description||'TikTok Foto')}</h3>
      <p class="muted">@${esc(a.username||'unknown')} • ${esc(a.nickname||'-')} • ${esc(item.region||'-')} • ${esc(item.image_count||imgs.length)} image</p>
      <div class="stalkGrid">${stalkRows({
        Like:shortCount(stats.like),
        Comment:shortCount(stats.comment),
        Share:shortCount(stats.share),
        ID:item.id||'-'
      })}</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px">
        ${imgs.slice(0,10).map((u,i)=>`<a href="${esc(u)}" target="_blank"><img src="${esc(u)}" loading="lazy" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px;border:1px solid var(--line)" onerror="this.style.display='none'"></a>`).join('')}
      </div>
      ${imgs[0]?`<button class="btn green" style="width:100%;margin-top:8px" onclick="copyTourl('${escAttr(imgs[0])}')">📋 Copy Image Pertama</button>`:''}
    </div>`;
  }).join('') || `<div class="panel muted">Tidak ada hasil TikTok Foto.${raw?.__endpoint?`<br><a href="${esc(raw.__endpoint)}" target="_blank">Buka endpoint</a>`:''}</div>`;
}

function renderMusicSearchCards(results=[], raw={}){
  const arr = arrFromAny(results);
  return arr.slice(0,20).map((item)=>{
    const t = item.track || item || {};
    const cover = t.album_coverart_500x500 || t.album_coverart_350x350 || t.album_coverart_100x100 || '';
    const genres = [
      ...(t.primary_genres?.music_genre_list || []),
      ...(t.secondary_genres?.music_genre_list || [])
    ].map(g=>g.music_genre?.music_genre_name).filter(Boolean).slice(0,3).join(', ');
    const date = String(t.first_release_date || '').slice(0,10) || '-';
    const url = t.track_share_url || '';
    return `<div class="stalkCard">
      ${cover?`<img src="${esc(cover)}" loading="lazy" onerror="this.style.display='none'">`:''}
      <h3>${esc(t.track_name || 'Unknown Track')}</h3>
      <p class="muted">👤 ${esc(t.artist_name || '-')} • 💿 ${esc(t.album_name || '-')}</p>
      <p class="muted">⭐ Rating ${esc(t.track_rating ?? '-')} • 📅 ${esc(date)} • ${genres?`🎼 ${esc(genres)}`:'🎼 Genre -'}</p>
      <p class="muted">Lyrics: ${t.has_lyrics ? '✅' : '❌'} • Subtitle: ${t.has_subtitles ? '✅' : '❌'} • Explicit: ${t.explicit ? '⚠️ Ya' : 'Aman'}</p>
      ${url?`<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(url)}" target="_blank">🔗 Buka Musixmatch</a>`:''}
      ${url?`<button class="btn green" style="width:100%;margin-top:8px" onclick="copyTourl('${escAttr(url)}')">📋 Copy Link</button>`:''}
    </div>`;
  }).join('') || `<div class="panel muted">Tidak ada hasil musik.${raw?.__endpoint?`<br><a href="${esc(raw.__endpoint)}" target="_blank">Buka endpoint</a>`:''}</div>`;
}

function renderMangaToonCards(results=[], raw={}){
  const data = raw?.data || {};
  let items = [];
  const r = data.results || raw.results || {};
  if(Array.isArray(r)) items = r;
  else if(Array.isArray(r?.komik)) {
    items = r.komik.flatMap(group=>Array.isArray(group.items)?group.items:[]);
  } else if(Array.isArray(r?.internet)) {
    items = r.internet;
  } else {
    items = arrFromAny(results);
  }
  return items.slice(0,24).map(x=>`<div class="stalkCard">
    ${x.image?`<img src="${esc(x.image)}" loading="lazy" onerror="this.style.display='none'">`:''}
    <h3>${esc(x.title||'MangaToon')}</h3>
    ${x.link?`<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(x.link)}" target="_blank">📚 Buka MangaToon</a>`:''}
    ${x.link?`<button class="btn green" style="width:100%;margin-top:8px" onclick="copyTourl('${escAttr(x.link)}')">📋 Copy Link</button>`:''}
  </div>`).join('') || `<div class="panel muted">Tidak ada hasil MangaToon.${raw?.__endpoint?`<br><a href="${esc(raw.__endpoint)}" target="_blank">Buka endpoint</a>`:''}</div>`;
}

function toolSearchHub(){
  openModal('🔎 Search Hub',`
    <input type="hidden" id="shType" value="tiktok">
    <div class="choiceGrid">
      <button class="choiceBtn active" data-sh="tiktok" onclick="setSearchHubType('tiktok')">🎬 TikTok<small>Video</small></button>
      <button class="choiceBtn" data-sh="pinterest_image" onclick="setSearchHubType('pinterest_image')">📌 Pinterest<small>Image</small></button>
      <button class="choiceBtn" data-sh="mcpe" onclick="setSearchHubType('mcpe')">⛏️ MCPE<small>Image/List</small></button>
      <button class="choiceBtn" data-sh="resep" onclick="setSearchHubType('resep')">🍳 Resep<small>Image/Text</small></button>
      <button class="choiceBtn" data-sh="playyt" onclick="setSearchHubType('playyt')">🎧 PlayYT<small>MP3</small></button>
      <button class="choiceBtn" data-sh="youtube" onclick="setSearchHubType('youtube')">▶️ YouTube<small>Video</small></button>
    </div>
    <input class="input" id="shQuery" placeholder="Masukkan kata kunci...">
    <button class="btn purple" style="width:100%;margin-top:10px" onclick="doSearchHub()">Search</button>
    <div id="shOut" class="preview"></div>
  `);
}
function setSearchHubType(type){
  if($('shType'))$('shType').value=type;
  document.querySelectorAll('[data-sh]').forEach(b=>b.classList.toggle('active',b.dataset.sh===type));
  const q=$('shQuery');
  if(q)q.placeholder='Masukkan kata kunci...';
}
async function doSearchHub(){
  const type=$('shType').value, query=$('shQuery').value.trim();
  if(!query)return toast('Query kosong.','warn');
  const out=$('shOut');out.innerHTML='<div class="panel">⏳ Search...</div>';
  try{
    if(type==='tiktok'){
      let j;
      try{ j=await cukiFetchFresh('/api/search/tiktok',{query},18000); }
      catch(e){ j=await alipFetchFresh('/search/tiktok',{q:query},18000); }
      out.innerHTML=renderAlipTikTokCards(arrFromAny(j.result||j.data?.result||j.data?.results||j.data||j.results),j);
    }
    else if(type==='pinterest_image'){
      let j;
      try{ j=await cukiFetchFresh('/api/search/pinterest',{query,type:'image'},18000); }
      catch(e){ j=await alipFetchFresh('/search/pinterest',{q:query},18000); }
      const raw=j.result||j.data?.results||j.data||j.results||[];
      const arr=arrFromAny(raw).map(x=>typeof x==='string'?x:(x.url||x.image||x.img||x.src||x.pin||'')).filter(Boolean);
      out.innerHTML=renderPinterestImageList(arr,j);
    }
    else if(type==='mcpe'){
      const j=await cukiFetchFresh('/api/search/mcpe',{query},18000);
      const arr=arrFromAny(j.data?.results||j.result||j.results||j.data);
      out.innerHTML=arr.map(x=>`<div class="stalkCard">${x.image?`<img src="${esc(x.image)}" loading="lazy" onerror="this.style.display='none'">`:''}<h3>${esc(x.title||'MCPE Result')}</h3><p class="muted">Rating: ${esc(x.rating||'-')}</p>${x.link?`<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(x.link)}" target="_blank">Buka MCPEDL</a>`:''}</div>`).join('')||'<div class="panel muted">Tidak ada hasil.</div>';
    }
    else if(type==='resep'){
      const j=await cukiFetchFresh('/api/search/resep',{query},18000);
      const arr=arrFromAny(j.data?.results||j.result||j.results||j.data);
      out.innerHTML=arr.map(x=>`<div class="stalkCard">${x.thumb||x.image?`<img src="${esc(x.thumb||x.image)}" loading="lazy" onerror="this.style.display='none'">`:''}<h3>${esc(x.judul||x.title||'Resep')}</h3><p class="muted">${esc(x.waktu_masak||'-')} • ${esc(x.hasil||'-')} • ${esc(x.tingkat_kesulitan||'-')}</p><details><summary>Bahan & langkah</summary><p class="muted"><b>Bahan:</b><br>${esc(arrFromAny(x.bahan||[]).slice(0,18).join('\n'))}</p><p class="muted"><b>Langkah:</b><br>${esc(arrFromAny(x.langkah_langkah||x.langkah||[]).slice(0,8).join('\n'))}</p></details>${x.link?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(x.link)}" target="_blank">Buka Resep</a>`:''}</div>`).join('')||'<div class="panel muted">Tidak ada hasil.</div>';
    }
    else if(type==='playyt'){
      const j=await cukiFetchFresh('/api/search/playyt',{query},22000);
      const d=j.data||j.result||{}, v=d.video||d.metadata||d.result||{}, a=d.download?.audio||d.audio||{};
      const audioUrl=a.url||a.directLink||d.download?.url||d.download_url||d.url||'';
      const thumb=v.thumbnail?.default||v.thumbnail?.url||v.thumbnail||v.image||v.cover||d.thumbnail||'';
      out.innerHTML=`<div class="stalkCard">
        ${thumb?`<img src="${esc(thumb)}" loading="lazy" onerror="this.style.display='none'">`:''}
        <h3>${esc(v.title||d.download?.metadata?.title||d.title||'YouTube Audio')}</h3>
        <p class="muted">${esc(v.author?.name||d.download?.metadata?.channel||v.channel||d.channel||'-')} • ${esc(v.duration?.formatted||v.duration?.timestamp||v.timestamp||d.duration||'-')} • ${shortCount(v.views||d.views)} views</p>
        ${audioUrl?`<audio controls preload="metadata" style="width:100%;margin-top:10px" src="${esc(audioUrl)}"></audio>`:'<p class="muted">Audio MP3 tidak ditemukan di response.</p>'}
        ${audioUrl?`<div class="btnrow" style="margin-top:10px"><a class="btn purple" style="text-align:center;text-decoration:none" href="${esc(audioUrl)}" target="_blank" download>⬇️ Download MP3 ${esc(a.label||a.quality||'')}</a><button class="btn green" onclick="copyTourl('${escAttr(audioUrl)}')">📋 Copy MP3</button></div>`:''}
        ${v.url||d.url?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(v.url||d.url)}" target="_blank">Buka YouTube</a>`:''}
      </div>`;
    }
    else if(type==='youtube'){
      const j=await cukiFetchFresh('/api/search/youtube',{query},18000);
      const arr=arrFromAny(j.data?.results||j.result||j.results||j.data);
      out.innerHTML=arr.slice(0,12).map(v=>`<div class="stalkCard">${v.thumbnail||v.image?`<img src="${esc(v.thumbnail||v.image)}" loading="lazy" onerror="this.style.display='none'">`:''}<h3>${esc(v.title||'YouTube Video')}</h3><p class="muted">${esc(v.author?.name||v.channel||'-')} • ${esc(v.timestamp||v.duration||'-')} • ${shortCount(v.views)} views</p>${v.url?`<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(v.url)}" target="_blank">Buka Video</a>`:''}</div>`).join('')||'<div class="panel muted">Tidak ada hasil.</div>';
    }
  }catch(e){cukiError(out,e)}
}

/* PATCH V41: helper cuaca/gempa yang sempat hilang waktu patch TTS/Stalk/Search.
   Jangan sentuh fungsi lain, biar yang sudah waras tidak ikut dikorbankan ke dewa bug. */
function getCukiUrl(path, params={}){
  const url = new URL(CUKI_API.base + path);
  url.searchParams.set('apikey', CUKI_API.key || 'cuki-x');
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  return url.toString();
}
function parseJsonSafe(text){
  if(typeof text === 'object' && text) return text;
  const raw = String(text || '').trim();
  if(!raw) throw new Error('JSON kosong.');
  try{return JSON.parse(raw)}
  catch{
    const m = raw.match(/\{[\s\S]*\}/);
    if(m) return JSON.parse(m[0]);
    throw new Error('Format JSON tidak valid.');
  }
}
function cukiFailBox(out,e,endpoint='',pasteFn=''){
  if(!out) return alert(e?.message || e);
  const pasteId = pasteFn ? pasteFn + 'Paste' : 'manualJsonPaste';
  out.innerHTML = `
    <div class="panel">
      <b style="color:var(--red)">Gagal terhubung.</b>
      <p class="muted">${esc(e?.name==='AbortError'?'Timeout API':(e?.message||'Unknown error'))}</p>
      ${endpoint?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${esc(endpoint)}" target="_blank">🔗 Buka Endpoint</a>`:''}
      ${pasteFn?`
        <details style="margin-top:10px">
          <summary>Render manual dari JSON</summary>
          <textarea id="${esc(pasteId)}" placeholder="Paste JSON response di sini..." style="margin-top:8px"></textarea>
          <button class="btn purple" style="width:100%;margin-top:8px" onclick="${esc(pasteFn)}()">Render JSON</button>
        </details>`:''}
    </div>`;
}
async function cukiFetchLegacy(path, params={}, timeoutMs=22000){
  const direct = getCukiUrl(path, params);
  async function once(target,label){
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const res = await fetch(target,{
        method:'GET',
        signal:ctrl.signal,
        cache:'no-store',
        headers:{accept:'application/json,text/plain,*/*'}
      });
      const txt = await res.text();
      let json;
      try{json = JSON.parse(txt)}
      catch{
        const m = txt.match(/\{[\s\S]*\}/);
        if(m) json = JSON.parse(m[0]);
        else throw new Error('Response bukan JSON');
      }
      if(json && typeof json.contents === 'string'){
        try{json = JSON.parse(json.contents)}catch{}
      }
      if(!res.ok) throw new Error(json?.message || 'HTTP '+res.status);
      if(json?.status === false || (json?.statusCode && json.statusCode >= 400)) throw new Error(json?.message || 'API error');
      json.__endpoint = direct;
      json.__via = label;
      return json;
    }finally{clearTimeout(timer)}
  }
  const enc = encodeURIComponent(direct);
  const targets = [
    ['direct', direct],
    ['allorigins', 'https://api.allorigins.win/raw?url=' + enc],
    ['corsproxy', 'https://corsproxy.io/?' + enc],
    ['codetabs', 'https://api.codetabs.com/v1/proxy?quest=' + enc]
  ];
  let last;
  for(const [label,target] of targets){
    try{return await once(target,label)}
    catch(e){last=e}
  }
  last = last || new Error('Semua jalur API gagal.');
  last.endpoint = direct;
  throw last;
}
function renderCuacaJSON(j,target='cwOut'){
  const d = j?.data || {};
  const el = $(target);
  if(!el) return;
  el.innerHTML = `<div class="stalkCard">
    <h3>🌦️ Cek Cuaca</h3>
    <div class="stalkGrid">${stalkRows({
      Lokasi:d.place||'-',
      Negara:d.country||'-',
      Cuaca:d.weather||'-',
      Suhu:(d.temperature_c ?? '-') + '°C',
      Min:(d.min_temperature_c ?? '-') + '°C',
      Max:(d.max_temperature_c ?? '-') + '°C',
      Humidity:(d.humidity_percent ?? '-') + '%',
      Angin:(d.wind_kmh ?? '-') + ' km/h'
    })}</div>
    ${d.coord?`<p class="muted">Koordinat: ${esc(d.coord.lat ?? '-')} , ${esc(d.coord.lon ?? '-')}</p>`:''}
    <p class="muted">Via: ${esc(j.__via || 'direct')}</p>
    <details style="margin-top:10px"><summary>Raw JSON</summary><pre style="white-space:pre-wrap;font-size:11px;overflow:auto">${esc(JSON.stringify(j,null,2))}</pre></details>
  </div>`;
}

async function cukiFetchBMKGFast(timeoutMs=9000){
  const direct = getCukiUrl('/api/info/bmkg');
  async function once(target,label){
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const res = await fetch(target,{
        method:'GET',
        signal:ctrl.signal,
        cache:'no-store',
        headers:{accept:'application/json,text/plain,*/*'}
      });
      const txt = await res.text();
      let json;
      try{json = JSON.parse(txt)}
      catch{
        const m = txt.match(/\{[\s\S]*\}/);
        if(m) json = JSON.parse(m[0]);
        else throw new Error('Response bukan JSON');
      }
      if(json && typeof json.contents === 'string'){
        try{json = JSON.parse(json.contents)}catch{}
      }
      if(!res.ok) throw new Error(json?.message || 'HTTP '+res.status);
      if(json?.status === false || (json?.statusCode && json.statusCode >= 400)) throw new Error(json?.message || 'API error');
      json.__via = label;
      json.__endpoint = direct;
      return json;
    }finally{clearTimeout(timer)}
  }

  const enc = encodeURIComponent(direct);
  const targets = [
    ['direct', direct],
    ['allorigins', 'https://api.allorigins.win/raw?url=' + enc],
    ['corsproxy', 'https://corsproxy.io/?' + enc],
    ['codetabs', 'https://api.codetabs.com/v1/proxy?quest=' + enc]
  ];

  let settled = false;
  const errors = [];
  return await new Promise((resolve,reject)=>{
    const guard = setTimeout(()=>{
      if(settled) return;
      settled = true;
      const err = new Error(errors.join(' | ') || 'Timeout info gempa');
      err.endpoint = direct;
      reject(err);
    }, timeoutMs + 1200);

    targets.forEach(([label,target])=>{
      once(target,label).then(j=>{
        if(settled) return;
        settled = true;
        clearTimeout(guard);
        resolve(j);
      }).catch(e=>{
        errors.push(label + ': ' + (e.name === 'AbortError' ? 'timeout' : e.message));
        if(errors.length === targets.length && !settled){
          settled = true;
          clearTimeout(guard);
          const err = new Error(errors.join(' | '));
          err.endpoint = direct;
          reject(err);
        }
      });
    });
  });
}

function renderBMKGJSON(j,target='bmkgOut'){
  const data = j?.data || {};
  const auto = data.auto?.Infogempa?.gempa || {};
  const terkini = Array.isArray(data.terkini?.Infogempa?.gempa) ? data.terkini.Infogempa.gempa : [];
  const dirasakan = Array.isArray(data.dirasakan?.Infogempa?.gempa) ? data.dirasakan.Infogempa.gempa : [];
  const el = $(target);
  if(!el) return;

  const shake = auto.downloadShakemap || '';
  el.innerHTML = `<div class="stalkCard">
    <h3>🌋 Info Gempa</h3>
    ${shake ? `
      <div class="panel" style="padding:8px;margin-bottom:10px">
        <img loading="lazy" src="${esc(shake)}" style="width:100%;max-height:320px;object-fit:cover;border-radius:16px;border:1px solid var(--border)" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
        <p class="muted" style="display:none">Gambar shakemap gagal dimuat dari BMKG. Browser lagi sok selektif, klasik 😑</p>
        <a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(shake)}" target="_blank">🗺️ Buka Gambar Shakemap</a>
      </div>` : ''}
    <div class="stalkGrid">${stalkRows({
      Tanggal:auto.Tanggal||'-',
      Jam:auto.Jam||'-',
      Magnitude:auto.Magnitude||'-',
      Kedalaman:auto.Kedalaman||'-',
      Koordinat:auto.Coordinates||'-',
      Potensi:auto.Potensi||'-'
    })}</div>
    <p class="muted"><b>Wilayah:</b><br>${esc(auto.Wilayah||'-')}</p>
    <p class="muted"><b>Dirasakan:</b><br>${esc(auto.Dirasakan||'-')}</p>
    <h3>📋 Gempa Terkini</h3>
    ${terkini.slice(0,6).map(g=>`<div class="panel"><b>M${esc(g.Magnitude||'-')} • ${esc(g.Tanggal||'-')} ${esc(g.Jam||'')}</b><p class="muted">${esc(g.Wilayah||'-')}<br>${esc(g.Kedalaman||'')} • ${esc(g.Potensi||'')}</p></div>`).join('')||'<p class="muted">Tidak ada data terkini.</p>'}
    <h3>📍 Gempa Dirasakan</h3>
    ${dirasakan.slice(0,6).map(g=>`<div class="panel"><b>M${esc(g.Magnitude||'-')} • ${esc(g.Tanggal||'-')} ${esc(g.Jam||'')}</b><p class="muted">${esc(g.Wilayah||'-')}<br>${esc(g.Dirasakan||'')}</p></div>`).join('')||'<p class="muted">Tidak ada data dirasakan.</p>'}
    <p class="muted">Via: ${esc(j.__via||'direct')}</p>
    <details style="margin-top:10px"><summary>Raw JSON</summary><pre style="white-space:pre-wrap;font-size:11px;overflow:auto">${esc(JSON.stringify(j,null,2))}</pre></details>
  </div>`;
}


function toolSSWeb(){
  openModal('🌐 SS Web',`
    <input class="input" id="sswebUrl" placeholder="Contoh: https://docs-alip.clutch.web.id/">
    <button class="btn purple" style="width:100%;margin-top:10px" onclick="doSSWeb()">Ambil Screenshot</button>
    <div id="sswebOut" class="preview"></div>
  `);
}
async function doSSWeb(){
  const out=$('sswebOut');
  let url=($('sswebUrl')?.value||'').trim();
  if(!url)return toast('URL kosong.','warn');
  if(!/^https?:\/\//i.test(url)) url='https://'+url;
  out.innerHTML='<div class="panel">⏳ Mengambil screenshot...</div>';
  try{
    const j=await alipFetchFresh('/tools/ssweb',{url},20000);
    const img=j.result||j.url||'';
    out.innerHTML=img?`<div class="stalkCard"><img src="${esc(img)}" loading="lazy" onerror="this.style.display='none'"><h3>🌐 Screenshot Web</h3><p class="muted">${esc(url)}</p><a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(img)}" target="_blank">Buka Gambar</a><button class="btn green" style="width:100%;margin-top:8px" onclick="copyTourl('${escAttr(img)}')">📋 Copy Link</button></div>`:'<div class="panel muted">Gambar screenshot tidak ditemukan.</div>';
  }catch(e){cukiError(out,e)}
}
function toolMangaToon(){
  openModal('📚 MangaToon',`
    <input class="input" id="mangaQuery" placeholder="Contoh: love">
    <button class="btn purple" style="width:100%;margin-top:10px" onclick="doMangaToon()">Cari MangaToon</button>
    <div id="mangaOut" class="preview"></div>
  `);
}
async function doMangaToon(){
  const out=$('mangaOut');
  const query=($('mangaQuery')?.value||'').trim();
  if(!query)return toast('Query kosong.','warn');
  out.innerHTML='<div class="panel">⏳ Mencari MangaToon...</div>';
  try{
    const j=await cukiFetchFresh('/api/search/mangatoon',{query},20000);
    out.innerHTML=renderMangaToonCards([],j);
  }catch(e){cukiError(out,e)}
}

function toolCukiWeather(){
  openModal('🌦️ Cek Cuaca',`
    <input class="input" id="cwQuery" placeholder="Contoh: Banten / Jakarta / Bandung" value="Banten">
    <button type="button" class="btn purple" style="width:100%;margin-top:10px" onclick="doCukiWeather()">Cek Cuaca</button>
    <div id="cwOut" class="preview"></div>
  `);
}
async function doCukiWeather(){
  const out=$('cwOut');
  const q=($('cwQuery')?.value||'').trim();
  if(!q)return toast('Lokasi kosong.','warn');
  const endpoint=getCukiUrl('/api/info/cuaca',{q});
  out.innerHTML='<div class="panel">⏳ Mengambil cuaca...</div>';
  try{
    const j=await cukiFetch('/api/info/cuaca',{q},10000);
    renderCuacaJSON(j,'cwOut');
  }catch(e){
    cukiFailBox(out,e,endpoint,'renderCuacaPaste');
  }
}
function renderCuacaPaste(){
  try{renderCuacaJSON(parseJsonSafe($('renderCuacaPastePaste')?.value || $('renderCuacaPastePaste'.replace('PastePaste','Paste'))?.value || ''),'cwOut')}
  catch(e){toast(e.message,'err')}
}
function toolCukiBMKG(){
  openModal('🌋 Info Gempa',`
    <button class="btn purple" style="width:100%;margin-top:10px" onclick="doCukiBMKG()">Ambil Info Gempa</button>
    <div id="bmkgOut" class="preview"></div>
  `);
}
async function doCukiBMKG(){
  const endpoint=getCukiUrl('/api/info/bmkg');
  $('bmkgOut').innerHTML='<div class="panel">⏳ Mengambil info gempa cepat...</div>';
  try{
    const j=await cukiFetchBMKGFast(9000);
    renderBMKGJSON(j,'bmkgOut');
  }catch(e){
    cukiFailBox($('bmkgOut'),e,endpoint,'renderBMKGPaste');
  }
}
function renderBMKGPaste(){
  try{renderBMKGJSON(parseJsonSafe($('renderBMKGPastePaste')?.value || $('renderBMKGPastePaste'.replace('PastePaste','Paste'))?.value || ''),'bmkgOut')}
  catch(e){toast(e.message,'err')}
}

function toolCukiMCPE(){
  openModal('⛏️ Search MCPE',`<input class="input" id="mcQuery" placeholder="Contoh: survival / shader / house"><button class="btn purple" style="width:100%;margin-top:10px" onclick="doCukiMCPE()">Cari MCPE</button><div id="mcOut" class="preview"></div>`);
}
async function doCukiMCPE(){
  const query=$('mcQuery').value.trim();
  if(!query)return toast('Query kosong.','warn');
  $('mcOut').innerHTML='<div class="panel">⏳ Mencari MCPE...</div>';
  try{
    const j=await cukiFetch('/api/search/mcpe',{query});
    const arr=j.data?.results||[];
    $('mcOut').innerHTML=arr.map(x=>`<div class="stalkCard">${x.image?`<img src="${esc(x.image)}" onerror="this.style.display='none'">`:''}<h3>${esc(x.title||'-')}</h3><p class="muted">Rating: ⭐ ${esc(x.rating||'-')}</p><a class="btn ghost" style="display:block;text-align:center;text-decoration:none" href="${esc(x.link||'#')}" target="_blank">Buka MCPEDL</a></div>`).join('')||'<div class="panel muted">Tidak ada hasil.</div>';
  }catch(e){$('mcOut').innerHTML=`<div class="panel"><b style="color:var(--red)">MCPE search gagal.</b><p class="muted">${esc(e.message)}</p></div>`}
}
function toolCukiPinterest(){
  openModal('📌 Search Pinterest',`
    <input class="input" id="pinQuery" placeholder="Contoh: Frieren">
    <input type="hidden" id="pinType" value="image">
    <div class="choiceGrid">
      <button class="choiceBtn active" data-pin2="image" onclick="setPinStandalone('image')">🖼️ Image</button>
      <button class="choiceBtn" data-pin2="video" onclick="setPinStandalone('video')">🎞️ Video</button>
    </div>
    <button class="btn purple" style="width:100%;margin-top:10px" onclick="doCukiPinterest()">Cari Pinterest</button>
    <div id="pinOut" class="preview"></div>`);
}
function setPinStandalone(type){$('pinType').value=type;document.querySelectorAll('[data-pin2]').forEach(b=>b.classList.toggle('active',b.dataset.pin2===type));}
async function doCukiPinterest(){
  const query=$('pinQuery').value.trim(),type=$('pinType').value;
  if(!query)return toast('Query kosong.','warn');
  $('pinOut').innerHTML='<div class="panel">⏳ Mencari Pinterest...</div>';
  try{
    const j=await cukiFetch('/api/search/pinterest',{query,type});
    const arr=j.data?.results||[];
    $('pinOut').innerHTML=arr.slice(0,20).map(x=>{
      const media=x.image_url||x.video_url||x.gif_url||'';
      const prev=x.video_url?`<video controls src="${esc(x.video_url)}" style="width:100%;border-radius:14px"></video>`:(media?`<img src="${esc(media)}" onerror="this.style.display='none'">`:'');
      return `<div class="stalkCard">${prev}<h3>${esc(x.grid_title||x.description||x.id||'Pinterest')}</h3><p class="muted">${esc((x.description||'').slice(0,120))}</p><a class="btn ghost" style="display:block;text-align:center;text-decoration:none" href="${esc(x.pin||x.link||media||'#')}" target="_blank">Buka</a>${media?`<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(media)}" target="_blank" download>Download Media</a>`:''}</div>`;
    }).join('')||'<div class="panel muted">Tidak ada hasil / API tidak balikin media.</div>';
  }catch(e){$('pinOut').innerHTML=`<div class="panel"><b style="color:var(--red)">Pinterest gagal.</b><p class="muted">${esc(e.message)}</p></div>`}
}


function toolCukiBinary(){
  openModal('🔢 Binary ⇄ Text',`
    <select id="binMode">
      <option value="binary2text">Binary ke Text</option>
      <option value="text2binary">Text ke Binary</option>
    </select>
    <div style="height:9px"></div>
    <textarea id="binInput" placeholder="Binary: 01001000 01100101...\nText: Hello gw suka duit"></textarea>
    <button class="btn purple" style="width:100%;margin-top:10px" onclick="doCukiBinary()">Convert</button>
    <div id="binOut" class="preview"></div>
  `);
}
async function doCukiBinary(){
  const content=$('binInput').value.trim();
  const mode=$('binMode').value;
  if(!content)return toast('Input kosong.','warn');
  $('binOut').innerHTML='<div class="panel">⏳ Convert...</div>';

  try{
    const path = mode === 'text2binary' ? '/api/tools/text2binary' : '/api/tools/binary2text';
    const j=await cukiFetch(path,{content});

    const result = mode === 'text2binary'
      ? (j.data || '')
      : (j.data?.text || '');

    const meta = mode === 'text2binary'
      ? `<p class="muted">Original: ${esc(j.originalText || content)}<br>Length: ${esc(j.length ?? '-')} • Binary Length: ${esc(j.binaryLength ?? '-')}</p>`
      : '';

    $('binOut').innerHTML=`
      <div class="stalkCard">
        <h3>✅ ${mode === 'text2binary' ? 'Text ke Binary' : 'Binary ke Text'}</h3>
        ${meta}
        <textarea readonly style="min-height:130px">${esc(result)}</textarea>
        <button class="btn ghost" style="width:100%;margin-top:8px" onclick="navigator.clipboard?.writeText(\`${String(result).replace(/`/g,'\\`')}\`);toast('Disalin.')">📋 Copy Hasil</button>
        <details style="margin-top:10px"><summary>Raw JSON</summary><pre style="white-space:pre-wrap;font-size:11px">${esc(JSON.stringify(j,null,2))}</pre></details>
      </div>`;
  }catch(e){cukiError($('binOut'),e)}
}
function toolCukiTikTokSearch(){
  openModal('🎵 Search TikTok',`<input class="input" id="cttQuery" placeholder="Contoh: anime / lucu / musik"><button class="btn purple" style="width:100%;margin-top:10px" onclick="doCukiTikTokSearch()">Cari TikTok</button><div id="cttOut" class="preview"></div>`);
}
async function doCukiTikTokSearch(){
  const query=$('cttQuery').value.trim();
  if(!query)return toast('Query kosong.','warn');
  $('cttOut').innerHTML='<div class="panel">⏳ Mencari TikTok...</div>';
  try{
    const j=await cukiFetchFresh('/api/search/tiktok',{query},14000);
    const arr=Object.values(j.data||{}).filter(x=>x&&x.video);
    $('cttOut').innerHTML=renderTikTokSearchCards(arr,j);
  }catch(e){cukiError($('cttOut'),e)}
}
function toolCukiResep(){
  openModal('🍳 Resep Makanan',`<input class="input" id="resepQuery" placeholder="Contoh: Opor ayam"><button class="btn purple" style="width:100%;margin-top:10px" onclick="doCukiResep()">Cari Resep</button><div id="resepOut" class="preview"></div>`);
}
async function doCukiResep(){
  const query=$('resepQuery').value.trim();
  if(!query)return toast('Query kosong.','warn');
  $('resepOut').innerHTML='<div class="panel">⏳ Mencari resep...</div>';
  try{
    const j=await cukiFetch('/api/search/resep',{query});
    const arr=j.data?.results||[];
    $('resepOut').innerHTML=arr.slice(0,8).map(r=>{
      const bahan=[...(new Set(r.bahan||[]))].slice(0,20);
      const langkah=[...(new Set(r.langkah_langkah||[]))].slice(0,12);
      return `<div class="stalkCard">
        ${r.thumb?`<img src="${esc(r.thumb)}" onerror="this.style.display='none'">`:''}
        <h3>${esc(r.judul||'-')}</h3>
        <div class="stalkGrid">${stalkRows({Waktu:r.waktu_masak||'-',Hasil:r.hasil||'-',Level:r.tingkat_kesulitan||'-'})}</div>
        <details style="margin-top:10px" open><summary>Bahan</summary><ul>${bahan.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></details>
        <details style="margin-top:10px"><summary>Langkah</summary><ol>${langkah.map(l=>`<li>${esc(l)}</li>`).join('')}</ol></details>
        ${r.link?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(r.link)}" target="_blank">Buka Resep</a>`:''}
      </div>`;
    }).join('')||'<div class="panel muted">Tidak ada resep.</div>';
  }catch(e){cukiError($('resepOut'),e)}
}
function toolCukiPlayYT(){
  openModal('🎧 Play YouTube',`<input class="input" id="playytQuery" placeholder="Contoh: Masalah masa depan - Hindia"><button class="btn purple" style="width:100%;margin-top:10px" onclick="doCukiPlayYT()">Cari & Ambil Audio</button><div id="playytOut" class="preview"></div>`);
}
async function doCukiPlayYT(){
  const query=$('playytQuery').value.trim();
  if(!query)return toast('Query kosong.','warn');
  $('playytOut').innerHTML='<div class="panel">⏳ Cari lagu YouTube...</div>';
  try{
    const j=await cukiFetch('/api/search/playyt',{query});
    const v=j.data?.video||{}, d=j.data?.download||{}, audio=d.audio||{}, thumb=v.thumbnail?.default||v.thumbnail||v.image||'';
    $('playytOut').innerHTML=`<div class="stalkCard">
      ${thumb?`<img src="${esc(thumb)}" onerror="this.style.display='none'">`:''}
      <h3>${esc(v.title||d.metadata?.title||'-')}</h3>
      <p class="muted">${esc(v.author?.name||d.metadata?.channel||'-')} • ${esc(v.duration?.formatted||v.timestamp||'-')} • ${shortCount(v.views)} views</p>
      ${audio.url?`<audio controls preload="metadata" style="width:100%;margin-top:10px" src="${esc(audio.url)}"></audio><div class="btnrow" style="margin-top:10px"><a class="btn purple" style="text-align:center;text-decoration:none" href="${esc(audio.url)}" target="_blank" download>⬇️ Download MP3 ${esc(audio.label||'')}</a><button class="btn green" onclick="copyTourl('${escAttr(audio.url)}')">📋 Copy MP3</button></div>`:''}
      ${v.url?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(v.url)}" target="_blank">Buka YouTube</a>`:''}
    </div>`;
  }catch(e){cukiError($('playytOut'),e)}
}
function toolCukiYoutubeSearch(){
  openModal('▶️ Search YouTube',`<input class="input" id="ytQuery" placeholder="Contoh: script bot whatsapp"><button class="btn purple" style="width:100%;margin-top:10px" onclick="doCukiYoutubeSearch()">Cari Video</button><div id="ytOut" class="preview"></div>`);
}
async function doCukiYoutubeSearch(){
  const query=$('ytQuery').value.trim();
  if(!query)return toast('Query kosong.','warn');
  $('ytOut').innerHTML='<div class="panel">⏳ Mencari YouTube...</div>';
  try{
    const j=await cukiFetch('/api/search/youtube',{query});
    const arr=j.data?.results||[];
    $('ytOut').innerHTML=arr.slice(0,15).map(v=>`<div class="stalkCard">
      ${v.thumbnail||v.image?`<img src="${esc(v.thumbnail||v.image)}" onerror="this.style.display='none'">`:''}
      <h3>${esc(v.title||'-')}</h3>
      <p class="muted">${esc(v.author?.name||'-')} • ${esc(v.timestamp||v.duration?.timestamp||'-')} • ${shortCount(v.views)} views • ${esc(v.ago||'')}</p>
      <p class="muted">${esc((v.description||'').slice(0,160))}</p>
      <a class="btn ghost" style="display:block;text-align:center;text-decoration:none" href="${esc(v.url||'#')}" target="_blank">Buka YouTube</a>
    </div>`).join('')||'<div class="panel muted">Tidak ada video.</div>';
  }catch(e){cukiError($('ytOut'),e)}
}

function resetProducts(){ls.set('products',defaultProducts);renderAll();toast('Produk direset.')}
function clearBrokenData(){showConfirm('Reset Cache','Reset chat, deposit, transaksi lokal?',()=>{['chat','deposits','tx'].forEach(k=>ls.rm(k));renderAll();closeModal();toast('Cache dibersihkan.')})}

function getBadWords(){return ls.get('badWords',['anjing','tai','brengsek'])}
function censorText(text){if(isAdminAuthed() || me()?.role==='admin')return String(text||'');let out=String(text||'');for(const w of getBadWords()){if(!w)continue;const re=new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');out=out.replace(re,m=>m[0]+'***')}return out}
function getBlocks(){return ls.get('blocks',{})}
function isBlocked(a,b){const bl=getBlocks();return (bl[a]||[]).includes(b)||(bl[b]||[]).includes(a)}
function blockUser(username){if(!username||username===me().username)return;const bl=getBlocks();bl[me().username]=Array.from(new Set([...(bl[me().username]||[]),username]));ls.set('blocks',bl);toast('User diblokir.');closeModal()}
function unblockUser(username){const bl=getBlocks();bl[me().username]=(bl[me().username]||[]).filter(x=>x!==username);ls.set('blocks',bl);toast('Blokir dibuka.')}
const SAFE_EMOJIS=['😀','😄','😁','😆','😂','🤣','😊','😎','😍','😘','😋','😜','🤔','😴','😭','😤','😡','🥳','😱','😇','👍','👎','🙏','👏','🙌','💪','🔥','✨','💖','💙','💜','💚','💛','⭐','🌟','🎉','🎁','🎮','🤖','👑','💎','⚡','☁️','🌈','🍀','🌸','🌙','☀️','🍜','🍕','🍔','🍟','🍩','🍪','☕','🎵','🎧','📱','💻','📌','✅','❌','⚠️','🔍','📷','🖼️','💬','🛒','💰'];
function openEmojiPicker(target='chatText'){openModal('😀 Emoji',`<div class="emojiStrip">${SAFE_EMOJIS.map(e=>`<button class="btn ghost" onclick="insertEmoji('${target}','${e}')">${e}</button>`).join('')}</div><p class="muted">Geser samping buat pilih emoji.</p>`)}
function insertEmoji(target,e){const el=$(target);if(el){el.value=(el.value||'')+e;el.focus()}closeModal()}
function openMentionPicker(target='chatText'){const users=Object.values(getUsers()).filter(u=>!u.system&&u.username!==me().username);openModal('🏷️ Tag User',`<div class="mentionList">${users.map(u=>`<button class="btn ghost" onclick="insertMention('${target}','${u.username}')">@${esc(u.username)}</button>`).join('')||'<p class="muted">Belum ada user lain.</p>'}</div>`)}
function insertMention(target,username){const el=$(target);if(el){el.value=(el.value||'')+' @'+username+' ';el.focus()}closeModal()}

function dmUnreadKey(){return 'dmUnread_' + (me()?.username || 'guest')}
function getDmUnread(){return ls.get(dmUnreadKey(),{})}
function setDmUnread(obj){ls.set(dmUnreadKey(),obj||{});updateDmBadge()}
function unreadDmTotal(){
  const obj=getDmUnread();
  return Object.values(obj).reduce((a,b)=>a+Number(b||0),0);
}
function updateDmBadge(){
  const b=$('dmBadge');
  if(!b)return;
  const n=unreadDmTotal();
  b.textContent=n>99?'99+':String(n);
  b.style.display=n?'flex':'none';
}
function notifyPrivateMessage(from,text){
  updateDmBadge();
  toast(`💌 Chat private dari @${from}`);
  showPage('chat');
  setTimeout(()=>openDMInbox(),180);
}
function dmKey(a,b){return ['dm',a,b].sort().join('_')}
function dmOtherFromKey(k,my){
  const raw=k.replace(/^remi_/,'');
  const parts=raw.split('_').filter(Boolean);
  return parts.filter(x=>x!=='dm'&&x!==my).pop()||'unknown';
}

function openDMInbox(){
  const my=me().username;
  const unread=getDmUnread();
  const keys=Object.keys(localStorage).filter(k=>k.startsWith('remi_dm_')||k.startsWith('dm_')).filter(k=>k.includes(my));
  const unique=[...new Set(keys.map(k=>k.replace(/^remi_/,'')))];
  const rows=unique.map(k=>{
    const other=dmOtherFromKey(k,my);
    const arr=ls.get(k,[]);
    const last=arr[arr.length-1]?.text||'Belum ada pesan';
    const n=unread[other]||0;
    return `<button class="btn ghost" style="display:block;width:100%;text-align:left;margin:7px 0;position:relative" onclick="openDM('${escAttr(other)}')">💌 @${esc(other)} ${n?`<b style="color:var(--red)">(${n} baru)</b>`:''}<br><span class="muted">${esc(last).slice(0,80)}</span></button>`;
  }).join('');
  updateDmBadge();
  openModal('📬 Inbox Private', rows || '<div class="panel muted">Belum ada chat private.</div>');
}



function remiSystemPrompt(){
  const u=me();
  return [
    'Kamu Remi AI, asisten resmi Remi AI Store by Ell.',
    'Gaya: bahasa Indonesia gaul, store-themed, imut, satir ringan, banyak emoji 😼😺😾🤷‍♀️🙅‍♀️😡😹😘🫡👋😑😆🗿😭😮‍💨😽🙀😿. Jangan toxic berat.',
    'Selalu paham konteks web: Store produk digital, deposit saldo QRIS, Provider Order, Tools, Chat Global, Admin Panel.',
    'Kalau ditanya cara pesan: login/guest > Store > pilih produk > detail/beli > isi WA/catatan > deposit kalau saldo kurang > checkout > cek riwayat.',
    'Kalau ditanya provider: Tools > Provider Order > load layanan > pilih layanan > target/quantity > checkout > cek status.',
    'Owner/developer adalah Ell. Puji Ell sewajarnya.',
    'Kalau request bahaya/manipulatif, arahkan ke versi aman.',
    `User: ${u?('@'+u.username+' '+(u.display||'')):'Guest'}`
  ].join('\n');
}
function buildAIQuestion(userText){
  // Cuki pakai GET. Kalau prompt kepanjangan, browser/proxy langsung tantrum: Failed to fetch.
  // Jadi konteks sengaja dipadatkan, bukan novel berseri kayak sebelumnya.
  const hist=ls.get('aiChat',[])
    .filter(m=>!m.loading)
    .slice(-8)
    .map(m=>`${m.role==='user'?'U':'R'}:${String(m.text||'').replace(/\s+/g,' ').slice(0,180)}`)
    .join(' | ');
  let q=`${remiSystemPrompt()}\nHist:${hist||'-'}\nUser:${String(userText||'').slice(0,450)}\nJawab jelas sebagai Remi AI, pakai emoji imut secukupnya dan satir ringan.`;
  if(q.length>1800) q=q.slice(0,1800);
  return q;
}
async function remiAIApiReply(userText){
  const question=buildAIQuestion(userText);
  const direct=`${CUKI_API.base}/api/ai/deepseek?apikey=${encodeURIComponent(CUKI_API.key||'cuki-x')}&question=${encodeURIComponent(question)}&_r=${Date.now()}`;

  function parseAIJson(txt,label){
    let json;
    try{json=JSON.parse(txt)}
    catch{
      const m=String(txt||'').match(/\{[\s\S]*\}/);
      if(m) json=JSON.parse(m[0]);
      else throw new Error(label+': response bukan JSON');
    }
    if(json && typeof json.contents==='string'){
      try{json=JSON.parse(json.contents)}catch{}
    }
    if(json && typeof json.body==='string'){
      try{json=JSON.parse(json.body)}catch{}
    }
    if(!json?.status) throw new Error(label+': '+(json?.msg||json?.message||'AI status false'));
    const reply=json?.data?.response || json?.response || json?.result;
    if(!reply) throw new Error(label+': field response kosong');
    return {text:String(reply),via:label,raw:json};
  }
  async function once(url,label,timeoutMs=12000){
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),timeoutMs);
    try{
      const res=await fetch(url,{method:'GET',signal:ctrl.signal,cache:'no-store',headers:{accept:'application/json,text/plain,*/*'}});
      const txt=await res.text();
      if(!res.ok) throw new Error(label+': HTTP '+res.status);
      return parseAIJson(txt,label);
    }finally{clearTimeout(timer)}
  }

  const enc=encodeURIComponent(direct);
  const targets=[
    ['direct',direct],
    ['allorigins-raw','https://api.allorigins.win/raw?url='+enc],
    ['allorigins-get','https://api.allorigins.win/get?url='+enc],
    ['codetabs','https://api.codetabs.com/v1/proxy?quest='+enc],
    ['corsproxy','https://corsproxy.io/?'+enc],
    ['thingproxy','https://thingproxy.freeboard.io/fetch/'+direct]
  ];

  let settled=false, errors=[];
  return await new Promise((resolve,reject)=>{
    const guard=setTimeout(()=>{
      if(settled)return;
      settled=true;
      const err=new Error(errors.slice(0,4).join(' | ') || 'AI API timeout semua jalur');
      err.endpoint=direct;
      reject(err);
    },15000);
    targets.forEach(([label,url])=>{
      once(url,label).then(r=>{
        if(settled)return;
        settled=true;clearTimeout(guard);resolve(r);
      }).catch(e=>{
        errors.push((e.name==='AbortError'?label+': timeout':e.message));
        if(errors.length===targets.length && !settled){
          settled=true;clearTimeout(guard);
          const err=new Error(errors.slice(0,5).join(' | '));
          err.endpoint=direct;
          reject(err);
        }
      });
    });
  });
}

function renderAIChat(){
  const box=$('aiMsgs');
  if(!box)return;
  let arr=ls.get('aiChat',[]);
  if(!arr.length){
    arr=[{role:'bot',text:'Halo, gue Remi AI ✨😼\nSiap bantu kamu pesan produk, isi saldo, pakai tools, cek provider, dan jelajahi fitur Remi AI Store by Ell 😺🫡',time:Date.now()}];
    ls.set('aiChat',arr);
  }
  box.innerHTML=arr.slice(-120).map(m=>`<div class="msg ${m.role==='user'?'me':''}"><div class="ava">${m.role==='user'?(me()?.display||'U')[0].toUpperCase():`<img src="${REMI_AI_AVATAR}">`}</div><div class="bubble"><div class="meta">${m.role==='user'?esc(me()?.display||'User'):'Remi AI'} • ${new Date(m.time).toLocaleTimeString('id-ID',{hour12:false})}${m.via?' • '+esc(m.via):''}</div>${esc(m.text).replace(/\n/g,'<br>')}</div></div>`).join('');
  setTimeout(()=>box.scrollTop=box.scrollHeight,10);
}
function remiAIReply(text){
  const q=String(text||'').toLowerCase().trim();
  const hist=ls.get('aiChat',[]).filter(x=>x.role==='user').slice(-4).map(x=>String(x.text||'').toLowerCase());
  const prev=hist[hist.length-2]||'';
  const isGreeting=/^(woi|woy|oi|p|halo|hai|hi|bang|kak|permisi|ass?alam)/.test(q);
  const isAngry=/(lama|lemot|error|ngaco|tolol|goblok|anjing|kontol|memek|cape|capek)/.test(q);
  const wantsMemory=/(inget|ingat|chat sebelum|obrolan sebelumnya|konteks)/.test(q);
  const wantsOwner=/(owner|ell|developer|pembuat|siapa yang buat)/.test(q);
  const wantsHowOrder=/(cara pesan|cara order|cara beli|checkout|cara checkout|bagaimana pesan|gimana beli)/.test(q);
  const wantsDeposit=/(deposit|topup saldo|isi saldo|saldo)/.test(q);
  const wantsProvider=/(provider|fayu|layanan|services|service|pesan otomatis)/.test(q);
  const wantsTools=/(fitur|tool|tools|apa aja|menu apa aja)/.test(q);
  const wantsWeather=/(cuaca|weather)/.test(q);
  const wantsQuake=/(gempa|bmkg|shakemap)/.test(q);
  const wantsTts=/(tts|suara|voice|audio)/.test(q);
  const wantsStalk=/(stalk|ff|free fire|instagram|tiktok|roblox|github)/.test(q);
  const wantsSearch=/(search|cari |tiktok search|youtube|pinterest|mcpe|resep|playyt)/.test(q);

  if(isGreeting) return `Yo, gue Remi AI 😼✨
Selamat datang di Remi AI Store by Ell. Gue bisa bantu jelasin cara order, isi saldo, pakai tools, cek provider order, atau cari fitur tertentu. Tulis kebutuhan kamu dengan jelas biar jawabannya nggak muter-muter kayak bug yang pura-pura fitur 😹`;
  if(isAngry) return `Santai dulu 😭😼 Gue paham kamu lagi kesal karena respon AI atau API sempat ngadat. Kalau mode online gagal, mode lokal tetap bisa bantu menjelaskan fitur utama Remi AI Store by Ell. Kirim pertanyaan yang spesifik supaya jawabannya langsung kena sasaran.`;
  if(wantsMemory) return `Bisa. Untuk mode lokal, gue membaca konteks chat yang tersimpan di halaman ini. Pesan kamu sebelumnya: ${prev?('"'+prev.slice(0,120)+'"'):'belum ada konteks sebelumnya yang cukup.'}
Kalau AI online aktif, beberapa chat terakhir juga ikut dipakai agar jawaban tetap nyambung.`;
  if(wantsOwner) return `Owner/developer web ini Ell. Remi AI Store dibuat untuk produk digital, tools, saldo QRIS, provider order, chat, dan fitur store lain. Tampilannya dibuat tetap santai, tapi alurnya tetap jelas dan rapi 😎`;
  if(wantsHowOrder) return `Cara pesan produk di Remi AI Store:
1. Login / guest dulu
2. Buka tab Store
3. Pilih produk lalu klik Detail / Beli
4. Isi nomor WhatsApp + catatan kalau perlu
5. Kalau saldo kurang, masuk ke halaman Saldo buat deposit dulu
6. Setelah saldo cukup, checkout dan pesanan masuk ke riwayat order.
Kalau yang dimaksud adalah provider order, buka menu Provider, pilih layanan, isi target dan jumlah, lalu submit pesanan.`;
  if(wantsDeposit) return `Untuk isi saldo: buka halaman Saldo, pilih nominal, tekan Proses Deposit, scan QRIS, lalu tunggu status pembayaran berhasil. Setelah saldo masuk, kamu bisa memakainya untuk membeli produk store atau checkout layanan provider.`;
  if(wantsProvider) return `Provider order dipakai untuk checkout layanan otomatis dari panel provider. Alurnya: muat daftar layanan, pilih service, isi target dan jumlah, cek total harga, submit order, lalu pantau status atau refill dari panel.`;
  if(wantsTools) return `Fitur utama Remi AI Store meliputi Store produk digital, Saldo/Deposit QRIS, Tools, Chat Global, Remi AI Chat, Akun, CS, serta panel admin/provider.`;
  if(wantsWeather) return `Cek cuaca tersedia di Tools → Cek Cuaca. Masukkan kota atau provinsi, lalu tekan tombol cek. Jika gagal, biasanya penyebabnya ada di akses fetch browser atau mode file lokal.`;
  if(wantsQuake) return `Info Gempa ada di Tools → Info Gempa. Isinya gempa auto, terkini, dirasakan, plus gambar shakemap kalau endpoint-nya ngasih link gambar.`;
  if(wantsTts) return `TTS pakai Cuki. Isi teks, lalu generate ulang audio terbaru. Kalau link MP3 expired, memang harus regen, karena file audio dari API itu bukan pusaka yang abadi.`;
  if(wantsStalk) return `Fitur stalk ada di Tools → Stalk Game/Sosmed. Support FF, Instagram, TikTok, Roblox, dan GitHub. Tinggal isi query sesuai platform, lalu cek hasilnya.`;
  if(wantsSearch) return `Search Hub ngumpulin pencarian TikTok, YouTube, Pinterest Image, MCPE, resep, dan PlayYT. Jadi kalau mau cari konten cepat, masuknya lewat situ, bukan muter-muter kayak NPC.`;
  return `Gue Remi AI siap bantu sesuai konteks web Remi AI Store by Ell 😼🫡 Coba tanya yang spesifik ya—misalnya: “cara pesan produk”, “cara deposit”, “fitur web ini apa aja”, “owner siapa”, atau “cara pakai provider order”.`;
}
async function sendAIChat(){
  const el=$('aiText');
  const text=(el?.value||'').trim();
  if(!text)return;

  const arr=ls.get('aiChat',[]);
  arr.push({role:'user',text,time:Date.now()});
  arr.push({role:'bot',text:'⏳ Remi AI lagi mikir... bentar, server jangan drama dulu.',time:Date.now()+50,loading:true});
  ls.set('aiChat',arr.slice(-140));
  el.value='';
  renderAIChat();

  try{
    const ai=await remiAIApiReply(text);
    const now=ls.get('aiChat',[]);
    const idx=now.findIndex(x=>x.loading);
    const finalText=ai.text + `\n\n— Remi AI ✨`;
    if(idx>=0) now[idx]={role:'bot',text:finalText,time:Date.now(),via:ai.via};
    else now.push({role:'bot',text:finalText,time:Date.now(),via:ai.via});
    ls.set('aiChat',now.slice(-140));
    renderAIChat();
  }catch(e){
    const now=ls.get('aiChat',[]);
    const idx=now.findIndex(x=>x.loading);
    const fallback=remiAIReply(text)+`\n\n⚠️ AI online gagal terhubung, jadi gue pakai mode lokal dulu. Detail: ${e.message}`;
    if(idx>=0) now[idx]={role:'bot',text:fallback,time:Date.now()};
    else now.push({role:'bot',text:fallback,time:Date.now()});
    ls.set('aiChat',now.slice(-140));
    renderAIChat();
  }
}

function renderChat(){const u=me(),users=getUsers();const online=[u,users.admin].filter(Boolean);$('onlineBar').innerHTML=online.map(x=>`<div class="onlineUser" onclick="viewProfile('${x.username}')">${esc(x.display||x.username)}</div>`).join('');let msgs=ls.get('chat',[]).slice(-500);if(!msgs.length)msgs=[{id:'welcome',user:'admin',display:'Admin Remi 📘',text:'Selamat datang di Global Chat Remi AI Store 👋\nTag user pakai @username.',time:Date.now()}];$('chatMsgs').innerHTML=msgs.map(m=>msgHTML(m)).join('');setTimeout(()=>$('chatMsgs').scrollTop=$('chatMsgs').scrollHeight,10)}
function msgHTML(m){const users=getUsers(),u=users[m.user]||{},mine=me()&&m.user===me().username;const av=u.avatar?`<img src="${u.avatar}">`:esc((m.display||m.user||'?')[0].toUpperCase());const text=esc(m.text||'').replace(/@([a-zA-Z0-9_]+)/g,`<button class="vTag" onclick="event.stopPropagation();viewProfile('$1')">@$1</button>`).replace(/\n/g,'<br>');return`<div class="msg ${mine?'me':''}"><div class="ava" onclick="viewProfile('${esc(m.user)}')">${av}</div><div class="bubble" ${mine?`onclick="openMsgAction('${m.id}')"`:''}><div class="meta">${esc(m.display||m.user)} • ${new Date(m.time).toLocaleTimeString('id-ID',{hour12:false})}</div>${text}${m.img?`<img class="chatImg" src="${m.img}">`:''}</div></div>`}
function sendChat(){const t=$('chatText').value.trim();if(!t)return;const msgs=ls.get('chat',[]);msgs.push({id:makeId('MSG'),user:me().username,display:me().display,text:censorText(t),time:Date.now()});ls.set('chat',msgs.slice(-500));$('chatText').value='';renderChat()}
function pickChatImg(){$('chatFile').click()}function sendChatImage(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const msgs=ls.get('chat',[]);msgs.push({id:makeId('IMG'),user:me().username,display:me().display,text:'',img:r.result,time:Date.now()});ls.set('chat',msgs.slice(-500));renderChat()};r.readAsDataURL(f)}
function openMsgAction(id){selectedMsg=id;$('actionCard').innerHTML=`<button onclick="editMsg()">✏️ Edit Pesan</button><button class="danger" onclick="delMsg()">🗑️ Hapus Pesan</button><button onclick="closeAction()">Batal</button>`;$('action').classList.add('show')}function closeAction(){$('action').classList.remove('show')}
function editMsg(){const msgs=ls.get('chat',[]),m=msgs.find(x=>x.id===selectedMsg);if(!m)return closeAction();openModal('✏️ Edit Pesan',`<div class="panel editBox"><p class="muted">Edit pesan kamu di sini.</p><textarea id="editMsgText" placeholder="Edit pesan...">${esc(m.text||'')}</textarea><div class="btnrow"><button class="btn ghost" onclick="closeModal()">Batal</button><button class="btn purple" onclick="saveEditedMsg()">Simpan</button></div></div>`);closeAction()}function saveEditedMsg(){const msgs=ls.get('chat',[]),m=msgs.find(x=>x.id===selectedMsg);if(!m)return closeModal();m.text=($('editMsgText')?.value||'').trim()||m.text;ls.set('chat',msgs);renderChat();closeModal();toast('Pesan diperbarui.')}function delMsg(){ls.set('chat',ls.get('chat',[]).filter(x=>x.id!==selectedMsg));renderChat();closeAction()}
function viewProfile(username){const u=getUsers()[username];if(!u)return toast('User tidak ditemukan.','err');openModal('👤 Profil User',`<div style="text-align:center"><div class="ava" style="width:88px;height:88px;margin:0 auto 12px;font-size:30px">${u.avatar?`<img src="${u.avatar}">`:esc((u.display||u.username)[0].toUpperCase())}</div><h2>${esc(u.display)}</h2><p class="muted">@${esc(u.username)} • ${esc(u.gender||'rahasia')}</p></div><div class="panel">${esc(u.bio||'Belum ada bio')}</div><div class="grid"><div class="panel"><b>${u.orders||0}</b><br><span class="muted">Order</span></div><div class="panel"><b>${u.streak||0}</b><br><span class="muted">Streak</span></div></div>${me().username!==u.username?`<button class="btn purple" style="width:100%;margin-top:12px" onclick="openDM('${u.username}')">Mulai Chat Pribadi</button><button class="btn red" style="width:100%;margin-top:8px" onclick="blockUser('${u.username}')">🚫 Blokir User</button>`:''}`)}
function openDM(username){
  const unread=getDmUnread(); delete unread[username]; setDmUnread(unread); closeModal();
  if(isBlocked(me().username,username))return toast('Chat diblokir salah satu pihak.','err');
  const key=['dm',me().username,username].sort().join('_'),arr=ls.get(key,[]).slice(-500);
  openModal('💌 Chat Pribadi @'+username,`<div class="msgs" id="dmMsgs" style="height:320px">${arr.map(m=>`<div class="msg ${m.user===me().username?'me':''}"><div class="bubble">${esc(m.text)}</div></div>`).join('')||'<p class="muted">Belum ada pesan.</p>'}</div><div class="chatInput"><button class="round" onclick="openEmojiPicker('dmText')">😀</button><input class="input" id="dmText" placeholder="Pesan pribadi..."><button class="round" onclick="sendDM('${username}')">➤</button></div><button class="btn red" style="width:100%;margin-top:10px" onclick="blockUser('${username}')">🚫 Blokir User</button>`);
  setTimeout(()=>{const dm=$('dmMsgs'); if(dm) dm.scrollTop=dm.scrollHeight},50);
}
function sendDM(username){
  if(isBlocked(me().username,username))return toast('Chat diblokir.','err');
  const key=dmKey(me().username,username),arr=ls.get(key,[]);
  const input=$('dmText');
  if(!input || !input.value.trim())return;
  const msg={user:me().username,text:censorText(input.value),time:Date.now()};
  arr.push(msg);
  ls.set(key,arr.slice(-500));

  const unreadKey='dmUnread_'+username;
  const unread=ls.get(unreadKey,{});
  unread[me().username]=(unread[me().username]||0)+1;
  ls.set(unreadKey,unread);

  input.value='';
  openDM(username);
  toast('Pesan private terkirim 💌');
}
function renderAccount(){const u=me();if(!u)return;$('myName').textContent=u.display;$('myUser').textContent='@'+u.username;$('myAvatar').innerHTML=u.avatar?`<img src="${u.avatar}">`:esc(u.display[0].toUpperCase());$('displayName').value=u.display;$('gender').value=u.gender||'rahasia';$('bio').value=u.bio||'';$('refCode').textContent=u.ref||u.username.toUpperCase().slice(0,6);if($('saldoPage'))$('saldoPage').textContent=compact(u.saldo);if($('streakPage'))$('streakPage').textContent=u.streak||0}
function changePFP(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{saveMe({avatar:r.result});renderAccount();renderChat();toast('Foto Profil diperbarui.');if(inp)inp.value=''};r.readAsDataURL(f)}
function saveProfile(){saveMe({display:$('displayName').value.trim()||me().username,gender:$('gender').value,bio:$('bio').value.trim().slice(0,180)});renderAll();toast('Profil disimpan.')}
function showOwnPassword(){const box=$('ownPasswordBox');box.style.display=box.style.display==='none'?'block':'none';box.innerHTML='<b>Password kamu:</b><br><span class="mono">'+esc(me().plain||'Password lama tidak tersimpan')+'</span>'}
function changePw(){const u=me();if(hash($('oldPw').value)!==u.pw)return toast('Password lama salah.','err');if($('newPw').value.length<4)return toast('Password baru min 4.','warn');saveMe({pw:hash($('newPw').value),plain:$('newPw').value});toast('Password diubah.')}
function useReferral(){const code=$('refUse').value.trim().toUpperCase();const target=Object.values(getUsers()).find(u=>(u.ref||'').toUpperCase()===code);if(!target||target.username===me().username)return toast('Kode referral tidak valid.','err');if(me().usedRef)return toast('Referral sudah dipakai.','warn');saveMe({saldo:me().saldo+2000,usedRef:code});addTx('Bonus Referral',2000);renderAll();toast('Bonus referral +Rp2.000.')}


function saveZakkiToken(){
  const token = ($('zakkiToken')?.value || '').trim();
  if(!token) return toast('Token Zakki kosong.', 'warn');
  ls.set('zakkiToken', token);
  toast('Token Zakki disimpan lokal.');

  saveDeviceSnapshot();
  renderAccountDeviceInfo();
}
function getZakkiToken(){ return (ls.get('zakkiToken','') || ZAKKI_DEFAULT_TOKEN || '').trim(); }
function setDep(n){ $('depNom').value = Number(n).toLocaleString('id-ID'); }
async function makeDeposit(n){
  const raw = n || Number(($('depNom').value || '').replace(/\D/g,''));
  const nominal = Number(raw);
  if(!nominal || nominal < 1000) return toast('Nominal minimal Rp1.000.', 'warn');

  const token = getZakkiToken() || (($('zakkiToken')?.value || '').trim());
  if(!token) return toast('Masukkan token Zakki dulu.', 'warn');
  ls.set('zakkiToken', token);
  $('depositBox').innerHTML = '<div class="panel">⏳ Membuat QRIS Zakki...</div>';

  try{
    const res = await fetch('https://qris.zakki.store/topup', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ token, nominal })
    });
    const json = await res.json().catch(()=>({}));
    if(!res.ok || json.code !== 201 || json.status !== 'success') throw new Error(json.message || 'Gagal membuat topup.');

    const d = json.data || {};
    const item = {
      id: d.id_transaksi,
      user: me().username,
      provider: 'zakki',
      amount: Number(d.rincian?.nominal_request || nominal),
      unique: Number(d.rincian?.kode_unik || 0),
      total: Number(d.rincian?.total_bayar || nominal),
      status: 'PENDING',
      qris_image: d.qris_image || '',
      qris_content: d.qris_content || '',
      expired_at: d.expired_at || '',
      cancel_url: d.cancel_url || '',
      cektopup_url: d.cektopup_url || ('https://qris.zakki.store/cektopup?idtopup=' + encodeURIComponent(d.id_transaksi || '')),
      time: Date.now(),
      raw: json
    };
    const deps = ls.get('deposits', []).filter(x => x.id !== item.id);
    deps.unshift(item);
    ls.set('deposits', deps.slice(0, 30));
    renderDeposits();
    toast('QRIS Zakki berhasil dibuat.');
    startZakkiAutoCheck(item.id);
  }catch(e){
    $('depositBox').innerHTML = `<div class="panel"><b style="color:var(--red)">Gagal membuat QRIS.</b><p class="muted">${esc(e.message)}</p><p class="muted">Kalau ini CORS dari browser, pindahkan request Zakki ke Vercel API route biar token aman dan fetch tidak drama.</p></div>`;
    toast('Gagal membuat QRIS Zakki.', 'err');
  }
}
function renderDeposits(){
  if(!$('depositBox')) return;
  if($('zakkiToken')) $('zakkiToken').value=''; const zs=$('zakkiStatus'); if(zs){const on=!!getZakkiToken(); zs.textContent=(on?'🔒 Aktif':'🔒 Belum diatur'); zs.className='badgeMini'+(on?'':' off');}
  const deps = ls.get('deposits', []).filter(d => d.user === me()?.username).slice(0, 8);
  $('depositBox').innerHTML = deps.map(d => {
    const status = String(d.status || 'PENDING').toUpperCase();
    const isPaid = status === 'SUCCESS' || status === 'PAID';
    return `<div class="zakkiCard">
      <div class="row"><b>${esc(d.id || '-')}</b><span class="zakkiStatus ${isPaid?'success':'pending'}">${esc(status)}</span></div>
      <p class="muted">Nominal: <b>${fmt(d.amount)}</b><br>Total bayar: <b style="color:var(--gold)">${fmt(d.total || d.amount)}</b>${d.unique ? `<br>Kode unik: <b>${esc(d.unique)}</b>` : ''}</p>
      ${d.qris_image ? `<div class="zakkiQr"><img src="${esc(d.qris_image)}" alt="QRIS Zakki"></div>` : ''}
      ${d.expired_at ? `<p class="muted">Expired: ${esc(new Date(d.expired_at).toLocaleString('id-ID'))}</p>` : ''}
      <div class="zakkiActions">
        <button class="btn ghost" onclick="checkZakkiDeposit('${esc(d.id)}')">🔎 Cek Status</button>
        <button class="btn red" onclick="cancelZakkiDeposit('${esc(d.id)}')">Batalkan</button>
      </div>
      ${d.qris_image ? `<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(d.qris_image)}" target="_blank">🖼️ Buka QRIS</a>` : ''}
    </div>`;
  }).join('') || '<div class="panel muted">Belum ada invoice deposit.</div>';
}
async function checkZakkiDeposit(id){
  if(!id) return toast('ID deposit kosong.', 'warn');
  try{
    const res = await fetch('https://qris.zakki.store/cektopup?idtopup=' + encodeURIComponent(id));
    const json = await res.json().catch(()=>({}));
    if(json.code === 404 || json.status === 'not_found') return toast('Transaksi tidak ditemukan / expired.', 'warn');
    if(json.code !== 200 || json.status !== 'found') throw new Error(json.message || 'Status tidak valid.');
    const data = json.data || {};
    const status = String(data.status || json.kategori_status || '').toUpperCase();
    const deps = ls.get('deposits', []);
    const dep = deps.find(x => x.id === id || id.includes(x.id) || x.id.includes(id));
    if(dep){ dep.status = status || dep.status; dep.status_raw = json; dep.settlement_time = data.settlement_time || ''; ls.set('deposits', deps); }
    if(status === 'SUCCESS') creditZakkiDeposit(id, Number(data.nominal_asli || dep?.amount || 0), json);
    else { renderDeposits(); toast('Status: ' + (status || 'PENDING'), 'warn'); }
  }catch(e){ toast('Cek status gagal: ' + e.message, 'err'); }
}
function creditZakkiDeposit(id, nominal, raw){
  const paid = ls.get('paidDeposits', []);
  if(paid.includes(id)){ renderDeposits(); return toast('Deposit sudah pernah masuk saldo.'); }
  if(!nominal || nominal < 1) return toast('Nominal paid tidak valid.', 'err');
  const u = me();
  saveMe({ saldo: (u.saldo || 0) + nominal });
  paid.push(id);
  ls.set('paidDeposits', paid);
  addTx('Deposit Zakki SUCCESS', nominal);
  const deps = ls.get('deposits', []);
  const dep = deps.find(x => x.id === id || id.includes(x.id) || x.id.includes(id));
  if(dep){ dep.status = 'SUCCESS'; dep.status_raw = raw; ls.set('deposits', deps); }
  renderAll(); renderDeposits();
  toast('Deposit sukses, saldo masuk +' + fmt(nominal));
}
function cancelZakkiDeposit(id){
  showConfirm('Batalkan QRIS','Batalkan transaksi ini dan hapus QR dari daftar?',()=>cancelZakkiDepositNow(id));
}
async function cancelZakkiDepositNow(id){
  const token = getZakkiToken();
  if(!token) return toast('Token Zakki belum disimpan.', 'warn');
  try{
    const url = 'https://qris.zakki.store/cancel?token=' + encodeURIComponent(token) + '&id_transaksi=' + encodeURIComponent(id);
    const res = await fetch(url).catch(()=>null);
    let json={code:200};
    if(res) json = await res.json().catch(()=>({code:200}));
    const deps = ls.get('deposits', []).filter(x => x.id !== id);
    ls.set('deposits', deps);
    renderDeposits();
    toast('Transaksi dibatalkan dan QR dihapus.');
  }catch(e){
    const deps = ls.get('deposits', []).filter(x => x.id !== id);
    ls.set('deposits', deps);
    renderDeposits();
    toast('QR lokal dihapus, cancel API gagal: '+e.message,'warn');
  }
}
function startZakkiAutoCheck(id){
  let tries = 0;
  const timer = setInterval(()=>{
    tries++;
    checkZakkiDeposit(id);
    const dep = ls.get('deposits', []).find(x => x.id === id);
    if(tries >= 20 || String(dep?.status || '').toUpperCase() === 'SUCCESS') clearInterval(timer);
  }, 15000);
}
function addTx(label,amount){const tx=ls.get('tx',[]);tx.unshift({user:me().username,label,amount,time:Date.now()});ls.set('tx',tx.slice(60))}
function renderTx(){if(!$('txList'))return;const tx=ls.get('tx',[]).filter(x=>x.user===me()?.username).slice(0,10);$('txList').innerHTML=tx.map(x=>`<div class="panel"><div class="row"><b>${esc(x.label)}</b><b style="color:${x.amount>=0?'var(--green)':'var(--red)'}">${x.amount>=0?'+':'-'}${fmt(Math.abs(x.amount))}</b></div><div class="muted">${new Date(x.time).toLocaleString('id-ID')}</div></div>`).join('')||'<div class="muted">Belum ada transaksi.</div>'}
function renderCS(){
  const cs=[
    ['💬','Chat Admin','#chat-admin'],
    ['📱','WhatsApp','https://wa.me/6280000000000'],
    ['📢','Channel','https://whatsapp.com/channel/0029VbBMPJQD8SE5T9Blub27'],
    ['👥','Grup','https://chat.whatsapp.com/'],
    ['✈️','Telegram','https://t.me/']
  ];
  $('csGrid').innerHTML=cs.map(c=>{
    const act=c[1]==='Chat Admin'
      ? `onclick="openDM('admin')"`
      : `onclick="window.open('${c[2]}','_blank')"`;
    return `<div class="tool"><div class="toolIcon">${c[0]}</div><h3>${c[1]}</h3><p>Hubungi ${c[1]}</p><button class="btn" style="width:100%" ${act}>Buka</button></div>`;
  }).join('');
}
function renderLeader(){const modes=['belanja','order','streak','gacha'];$('lbTabs').innerHTML=modes.map(m=>`<button class="tab ${lbMode===m?'active':''}" onclick="lbMode='${m}';renderLeader()">${m}</button>`).join('');const arr=Object.values(getUsers()).filter(u=>!u.system&&u.username!=='admin').sort((a,b)=>lbVal(b)-lbVal(a)).slice(0,10);$('leaderBox').innerHTML=arr.map((u,i)=>`<div class="row panel"><span>${i===0?'🥇':i===1?'🥈':i===2?'🥉':'🏅'}</span><div class="ava">${u.avatar?`<img src="${u.avatar}">`:esc((u.display||u.username)[0].toUpperCase())}</div><div style="flex:1"><b>${esc(u.display)}</b><br><span class="muted">@${esc(u.username)}</span></div><b>${lbMode==='belanja'?fmt(u.spent||0):lbVal(u)}</b></div>`).join('')||'<div class="panel">Belum ada user.</div>'}
function lbVal(u){return lbMode==='belanja'?(u.spent||0):lbMode==='order'?(u.orders||0):lbMode==='streak'?(u.streak||0):(u.gacha||0)}
function renderGacha(){$('gachaPool').innerHTML=gachaItems.map(x=>`<div class="tool"><div class="toolIcon">${x[0]}</div><h3>${x[1]}</h3><p>Hadiah gacha random.</p></div>`).join('')}
function doGacha(){const item=gachaItems[Math.floor(Math.random()*gachaItems.length)],u=me();saveMe({gacha:(u.gacha||0)+1,saldo:u.saldo+(item[1].includes('Saldo')?1000:0)});if(item[1].includes('Saldo'))addTx('Hadiah Gacha',1000);renderAll();openModal('🎰 Hasil Gacha',`<div style="text-align:center;font-size:70px">${item[0]}</div><h2 style="text-align:center">${item[1]}</h2>`)}
function claimStreak(){const u=me(),today=new Date().toDateString();if(u.lastStreak===today)return toast('Sudah claim hari ini.','warn');saveMe({streak:(u.streak||0)+1,lastStreak:today,saldo:u.saldo+500});addTx('Daily Streak',500);renderAll();toast('Streak +1, saldo +500.')}
function renderTheme(){$('themeGrid').innerHTML=Object.keys(themes).map(k=>`<button class="btn ${ls.get('theme','cyan')===k?'purple':'ghost'}" onclick="setTheme('${k}')">${k.toUpperCase()}</button>`).join('')}
function setTheme(k){ls.set('theme',k);applyTheme(k);renderTheme();toast('Tema diganti.')}
function applyTheme(k){const t=themes[k]||themes.cyan;document.documentElement.style.setProperty('--cyan',t[0]);document.documentElement.style.setProperty('--blue',t[1])}
function isAdminAuthed(){return ls.get('adminAuthed',false)===true}
function openAdmin(){
  if(!isAdminAuthed()) return openAdminLogin();
  openAdminPanel();
}
function openAdminLogin(){
  openModal('⚙️ Admin Panel',`
    <div class="panel adminLoginCard">
      <div class="adminHero"><div class="lock">🔐</div></div>
      <h2>Login Admin</h2>
      <p class="muted">Masukkan username dan password admin.</p>
      <div class="adminHint">⚠️ Panel admin hanya untuk operator yang dipercaya.</div>
      <div class="muted" style="font-weight:800;letter-spacing:.14em;text-align:center;margin-bottom:6px">USERNAME</div>
      <input class="input" id="adminUser" placeholder="Username">
      <div style="height:12px"></div>
      <div class="muted" style="font-weight:800;letter-spacing:.14em;text-align:center;margin-bottom:6px">PASSWORD</div>
      <div class="secretInput">
        <input class="input" id="adminPass" placeholder="Password" type="password" autocomplete="off">
        <button class="eyeBtn" id="adminEye" onclick="toggleAdminPw()">👁️</button>
      </div>
      <button class="btn" style="width:100%;margin-top:14px;font-size:20px" onclick="doAdminLogin()">🔓 Login</button>
    </div>
  `);
}
function toggleAdminPw(){
  const p=$('adminPass'),b=$('adminEye');
  if(!p)return;
  p.type=p.type==='password'?'text':'password';
  if(b)b.textContent=p.type==='password'?'👁️':'🙈';
}
function doAdminLogin(){
  const u=($('adminUser')?.value||'').trim();
  const p=($('adminPass')?.value||'').trim();
  if(u==='ell' && p==='ellpigikece'){
    ls.set('adminAuthed',true);
    toast('Login admin berhasil.');
    openAdminPanel();
  } else toast('Username atau password admin salah.','err');
}
function adminLogout(){
  ls.set('adminAuthed',false);
  closeModal();
  toast('Admin berhasil logout.');
}
function openAdminPanel(){

  openModal('⚙️ Admin Panel',`
  <div class="panel" style="margin-bottom:12px;background:linear-gradient(135deg,rgba(21,40,62,.98),rgba(7,17,36,.98))">
    <h2 style="margin:0 0 4px">⚙️ Admin Panel</h2>
    <p class="muted">Atur web, user, produk, deposit, filter, dan API secara lokal.</p>
  </div>
  <div class="tabs"><button class="tab active" onclick="adminTab('web')">Web</button><button class="tab" onclick="adminTab('user')">User</button><button class="tab" onclick="adminTab('product')">Produk</button><button class="tab" onclick="adminTab('api')">API</button><button class="tab" onclick="adminTab('filter')">Filter</button><button class="tab" onclick="adminTab('deposit')">Deposit</button></div>
  <button class="btn red" style="width:100%;margin-top:10px" onclick="adminLogout()">🚪 Logout Admin</button><div id="adminBody" style="margin-top:12px"></div>`);
  adminTab('web');
}
function adminTab(tab){
  document.querySelectorAll('.modal .tab').forEach(b=>b.classList.remove('active'));
  const labels={web:'Web',user:'User',product:'Produk',api:'API',filter:'Filter',deposit:'Deposit'};
  const btn=[...document.querySelectorAll('.modal .tab')].find(b=>b.textContent.includes(labels[tab]));
  if(btn)btn.classList.add('active');
  const body=$('adminBody');
  const users=Object.values(getUsers()).filter(u=>!u.system);
  if(tab==='web')body.innerHTML=`<div class="panel"><h3>Setting Web</h3><input class="input" id="admTitle" placeholder="Nama web" value="${esc(ls.get('webTitle','Remi AI Store'))}"><button class="btn" style="width:100%;margin-top:8px" onclick="saveWebSetting()">Simpan Setting Web</button></div>`;
  else if(tab==='user')body.innerHTML=`<div class="panel"><h3>Setting Saldo User</h3><select id="admUser">${users.map(u=>`<option value="${esc(u.username)}">${esc(u.username)} - ${esc(u.display)}</option>`).join('')}</select><input class="input" id="admSaldo" placeholder="Saldo baru" style="margin-top:8px" inputmode="numeric"><button class="btn green" style="width:100%;margin-top:8px" onclick="setUserSaldo()">Set Saldo</button></div>`;
  else if(tab==='product')body.innerHTML=`<div class="panel"><h3>Tambah Produk</h3><input class="input" id="prdName" placeholder="Nama produk"><input class="input" id="prdCat" placeholder="Kategori" style="margin-top:8px"><input class="input" id="prdPrice" placeholder="Harga" inputmode="numeric" style="margin-top:8px"><input class="input" id="prdIcon" placeholder="Emoji/Icon" value="📦" style="margin-top:8px"><textarea id="prdDesc" placeholder="Deskripsi" style="margin-top:8px"></textarea><button class="btn" style="width:100%;margin-top:8px" onclick="addProductAdmin()">Tambah Produk</button></div><div class="panel"><h3>Kategori</h3><input class="input" id="newCat" placeholder="Nama kategori"><button class="btn ghost" style="width:100%;margin-top:8px" onclick="toast('Kategori dipakai otomatis saat produk dibuat.')">Tambah Kategori</button></div>`;
  else if(tab==='api')body.innerHTML=`<div class="panel"><h3>Setting API Key & Base URL</h3><p class="muted">Base NexRay/Ourin sekarang bisa diatur dari sini. Kalau endpoint berubah, tidak perlu bongkar source lagi seperti ritual purba.</p><input class="input" type="password" autocomplete="off" id="admZakki" placeholder="Zakki token" value="${esc(getZakkiToken())}"><input class="input" type="password" autocomplete="off" id="admAlip" placeholder="Alip API key" value="${esc(APIS.alipKey)}" style="margin-top:8px"><input class="input" type="password" autocomplete="off" id="admBotcah" placeholder="BotCahX API key" value="${esc(APIS.botcahxKey)}" style="margin-top:8px"><input class="input" type="password" autocomplete="off" id="admNeoxr" placeholder="Neoxr API key untuk Discord stalk" value="${esc(ls.get('neoxrKey','Milik-Bot-OurinMD'))}" style="margin-top:8px"><input class="input" type="password" autocomplete="off" id="admCuki" placeholder="Cuki API key" value="${esc(CUKI_API.key)}" style="margin-top:8px"><input class="input" id="admCukiBase" placeholder="Cuki base URL" value="${esc(cleanApiBase(CUKI_API.base,'https://api.cuki.biz.id'))}" style="margin-top:8px"><input class="input" id="admNexrayBase" placeholder="NexRay base URL" value="${esc(cleanApiBase(APIS.nexrayBase,'https://api.nexray.eu.cc'))}" style="margin-top:8px"><input class="input" id="admOurinBase" placeholder="Ourin base URL" value="${esc(cleanApiBase(APIS.ourinBase,'https://api.ourin.my.id'))}" style="margin-top:8px"><button class="btn" style="width:100%;margin-top:8px" onclick="saveApiSetting()">Simpan API</button></div>${adminFayuPanel()}`;
  else if(tab==='filter')body.innerHTML=`<div class="panel">
    <h3>🛡️ Sensor / Unsensor</h3>
    <p class="muted">Status sekarang: <b style="color:var(--cyan)">${isSensorOn()?'AKTIF':'MATI'}</b></p>
    <div class="btnrow">
      <button class="btn green" onclick="adminSetSensor(true)">Aktifkan Sensor</button>
      <button class="btn red" onclick="adminSetSensor(false)">Matikan Sensor</button>
    </div>
  </div>
  <div class="panel">
    <h3>Daftar Kata Sensor</h3>
    <textarea id="admBadWords">${esc(ls.get('badWords',['anjing','tai','brengsek','kontol','memek','ngentod','tolol','goblok','bangsat']).join(', '))}</textarea>
    <button class="btn" style="width:100%;margin-top:8px" onclick="saveFilterWords()">Simpan Filter</button>
  </div>`;
  else body.innerHTML=`<p class="muted">Panel admin lokal. Untuk Zakki otomatis, gunakan tombol Cek Status pada invoice. Confirm manual hanya untuk test.</p><button class="btn" onclick="adminAddSaldo()" style="width:100%">Tambah Saldo Admin Test</button><button class="btn ghost" onclick="checkPendingZakkiList()" style="width:100%;margin-top:8px">📋 Cek Pending Zakki</button><h3>Deposit</h3>${ls.get('deposits',[]).slice(0,10).map(d=>`<div class="panel"><b>${esc(d.id)}</b><p>@${esc(d.user)} • ${fmt(d.amount)} / total ${fmt(d.total||d.amount)} • ${esc(d.status)}</p><div class="btnrow">${String(d.status).toUpperCase()==='PENDING'?`<button class="btn ghost" onclick="checkZakkiDeposit('${d.id}')">Cek Zakki</button><button class="btn green" onclick="confirmDeposit('${d.id}')">Manual Paid</button>`:''}</div></div>`).join('')||'<p class="muted">Tidak ada deposit.</p>'}`;
}
function saveWebSetting(){ls.set('webTitle',$('admTitle').value.trim()||'Remi AI Store');toast('Setting web disimpan.')}
function setUserSaldo(){const users=getUsers(),u=$('admUser').value,n=Number(($('admSaldo').value||'').replace(/\D/g,''));if(!users[u])return toast('User tidak ada.','err');users[u].saldo=n;saveUsers(users);if(me().username===u)current=users[u];renderAll();toast('Saldo user diset.')}
function addProductAdmin(){const ps=ls.get('products',[]);ps.push({id:Date.now(),name:$('prdName').value.trim()||'Produk Baru',cat:$('prdCat').value.trim()||'Lainnya',price:Number(($('prdPrice').value||'0').replace(/\D/g,'')),icon:$('prdIcon').value.trim()||'📦',desc:$('prdDesc').value.trim()||'Deskripsi produk.',reviews:[]});ls.set('products',ps);renderAll();toast('Produk ditambahkan.')}

const FAYU_API_BASE = 'https://fayupedia.id/api';
function getFayuCred(){
  return {
    api_id: String(ls.get('fayuApiId','')).trim(),
    api_key: String(ls.get('fayuApiKey','')).trim()
  };
}
async function fayuPost(path, data={}, timeoutMs=20000){
  const endpoint = FAYU_API_BASE + path;
  const cred = getFayuCred();
  if(!cred.api_id || !cred.api_key) throw Object.assign(new Error('api_id / api_key Fayupedia belum diisi di Admin Panel → API.'), { endpoint });
  const body = { api_id: Number(cred.api_id), api_key: cred.api_key, ...data };

  async function once(jsonMode=true){
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const opt = jsonMode ? {
        method:'POST',
        signal:ctrl.signal,
        cache:'no-store',
        headers:{'content-type':'application/json','accept':'application/json,text/plain,*/*'},
        body: JSON.stringify(body)
      } : {
        method:'POST',
        signal:ctrl.signal,
        cache:'no-store',
        headers:{'content-type':'application/x-www-form-urlencoded','accept':'application/json,text/plain,*/*'},
        body: new URLSearchParams(Object.entries(body).map(([k,v])=>[k,String(v)]))
      };
      const res = await fetch(endpoint, opt);
      const txt = await res.text();
      let json;
      try{ json = JSON.parse(txt) }
      catch{
        const m = txt.match(/\{[\s\S]*\}/);
        if(m) json = JSON.parse(m[0]);
        else throw new Error('Response bukan JSON');
      }
      if(!res.ok) throw new Error(json?.msg || json?.message || ('HTTP '+res.status));
      return json;
    }finally{ clearTimeout(timer) }
  }

  try{ return await once(true) }
  catch(e1){
    try{ return await once(false) }
    catch(e2){
      const err = new Error((e1.name==='AbortError'?'JSON timeout':e1.message) + ' | ' + (e2.name==='AbortError'?'FORM timeout':e2.message));
      err.endpoint = endpoint;
      throw err;
    }
  }
}
function renderFayuError(out,e){
  out.innerHTML = `<div class="panel">
    <b style="color:var(--red)">Fayupedia error.</b>
    <p class="muted">${esc(e.message||e)}</p>
    <p class="muted">Kalau ini CORS dari browser file lokal, perlu proxy/server backend. HTML murni kadang diperlakukan kayak warga asing di bandara API 😑</p>
    ${e.endpoint?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(e.endpoint)}" target="_blank">🔗 Buka Endpoint</a>`:''}
  </div>`;
}
function adminFayuPanel(){
  return `<div class="panel">
    <h3>📡 Fayupedia Provider</h3>
    <p class="muted">Panel aman: cek saldo, daftar layanan, dan cek status pesanan. Create order/refill otomatis tidak diaktifkan.</p>
    <input class="input" type="password" autocomplete="off" id="admFayuId" placeholder="Fayupedia api_id" value="${esc(ls.get('fayuApiId',''))}" inputmode="numeric">
    <input class="input" type="password" autocomplete="off" id="admFayuKey" placeholder="Fayupedia api_key" value="${esc(ls.get('fayuApiKey',''))}" style="margin-top:8px">
    <button class="btn" style="width:100%;margin-top:8px" onclick="saveFayuSetting()">Simpan Fayupedia</button>
    <div class="btnrow" style="margin-top:8px">
      <button class="btn green" onclick="fayuBalance()">Cek Saldo</button>
      <button class="btn ghost" onclick="fayuServices()">Daftar Layanan</button>
    </div>
    <input class="input" id="fayuStatusId" placeholder="Order ID untuk cek status" style="margin-top:8px" inputmode="numeric">
    <button class="btn purple" style="width:100%;margin-top:8px" onclick="fayuStatus()">Cek Status Pesanan</button>
    <div id="fayuOut" class="preview"></div>
  </div>
  <div class="panel">
    <h3>👁‍🗨 Intip Info Perangkat User</h3>
    <p class="muted">Admin bisa lihat data device user yang tersimpan lokal.</p>
    <button class="btn ghost" style="width:100%;margin-bottom:10px" onclick="renderAdminDeviceInfo()">🔄 Refresh List User</button>
    <div id="adminDeviceInfo"><div class="panel muted">Klik Refresh List User, pilih user, lalu Check.</div></div>
  </div>
  <div class="panel">
    <h3>💰 Saldo Provider</h3>
    <p class="muted">Saldo provider hanya dicek dari Admin Panel.</p>
    <button class="btn green" style="width:100%" onclick="adminCheckProviderBalance()">Cek Saldo Provider</button>
    <div id="adminProviderBalanceOut" style="margin-top:10px"></div>
  </div>`;
}

async function adminCheckProviderBalance(){
  const out=$('adminProviderBalanceOut');
  if(out)out.innerHTML='<div class="panel">⏳ Cek saldo provider...</div>';
  try{
    const j=await providerApi('/balance');
    if(!j.status)throw new Error(j.msg||'Gagal cek saldo');
    if(out)out.innerHTML=`<div class="proxyOk">✅ Saldo Provider: <b>${providerFormatRp(j.balance||0)}</b><br>Via: ${esc(j.__via||'direct')}</div>`;
  }catch(e){
    if(out)out.innerHTML=`<div class="proxyWarn">❌ ${esc(e.message||e)}</div>`;
  }
}

function saveFayuSetting(){
  ls.set('fayuApiId', $('admFayuId').value.trim());
  ls.set('fayuApiKey', $('admFayuKey').value.trim());
  toast('Fayupedia API disimpan lokal.');
}
async function fayuBalance(){
  const out=$('fayuOut');
  saveFayuSetting();
  out.innerHTML='<div class="panel">⏳ Cek saldo Fayupedia...</div>';
  try{
    const j=await fayuPost('/balance');
    if(!j.status) throw new Error(j.msg||'Kredensial tidak valid.');
    out.innerHTML=`<div class="stalkCard">
      <h3>💰 Saldo Provider</h3>
      <div class="heroTitle" style="font-size:32px">${fmt(j.balance||0)}</div>
      <p class="muted">${esc(j.msg||'OK')}</p>
      <details><summary>Raw JSON</summary><pre style="white-space:pre-wrap;font-size:11px">${esc(JSON.stringify(j,null,2))}</pre></details>
    </div>`;
  }catch(e){renderFayuError(out,e)}
}
async function fayuServices(){
  const out=$('fayuOut');
  saveFayuSetting();
  out.innerHTML='<div class="panel">⏳ Mengambil daftar layanan...</div>';
  try{
    const j=await fayuPost('/services');
    if(!j.status) throw new Error(j.msg||'Gagal mengambil layanan.');
    const services=Array.isArray(j.services)?j.services:[];
    out.innerHTML=`<div class="stalkCard">
      <h3>📦 Daftar Layanan</h3>
      <input class="input" id="fayuSvcSearch" placeholder="Cari layanan/kategori..." oninput="filterFayuServices()" style="margin-bottom:8px">
      <p class="muted">${services.length} layanan dimuat. Tombol order otomatis tidak dibuat.</p>
      <div id="fayuSvcList">${renderFayuServiceList(services)}</div>
    </div>`;
    window.__fayuServices=services;
  }catch(e){renderFayuError(out,e)}
}
function renderFayuServiceList(services){
  return (services||[]).slice(0,60).map(s=>`<div class="panel">
    <b>#${esc(s.id)} • ${esc(s.name)}</b>
    <p class="muted">${esc(s.category||'-')} • ${esc(s.type||'-')} • ${fmt(s.price||0)} / 1000</p>
    <div class="stalkGrid">${stalkRows({Min:s.min??'-',Max:s.max??'-',Refill:s.refill?'Ya':'Tidak'})}</div>
    ${s.description?`<p class="muted">${esc(s.description)}</p>`:''}
  </div>`).join('') || '<p class="muted">Tidak ada layanan.</p>';
}
function filterFayuServices(){
  const q=($('fayuSvcSearch')?.value||'').toLowerCase();
  const arr=(window.__fayuServices||[]).filter(s=>
    String(s.name||'').toLowerCase().includes(q) ||
    String(s.category||'').toLowerCase().includes(q) ||
    String(s.id||'').includes(q)
  );
  $('fayuSvcList').innerHTML=renderFayuServiceList(arr);
}
async function fayuStatus(){
  const out=$('fayuOut');
  saveFayuSetting();
  const order=$('fayuStatusId').value.trim();
  if(!order)return toast('Order ID kosong.','warn');
  out.innerHTML='<div class="panel">⏳ Cek status pesanan...</div>';
  try{
    const j=await fayuPost('/status',{order});
    if(!j.status) throw new Error(j.msg||'Pesanan tidak ditemukan.');
    out.innerHTML=`<div class="stalkCard">
      <h3>📋 Status Pesanan #${esc(j.order_id||order)}</h3>
      <div class="stalkGrid">${stalkRows({
        Status:j.order_status||'-',
        Charge:fmt(j.charge||0),
        Start:j.start_count??'-',
        Remains:j.remains??'-'
      })}</div>
      <p class="muted">${esc(j.msg||'OK')}</p>
      <details><summary>Raw JSON</summary><pre style="white-space:pre-wrap;font-size:11px">${esc(JSON.stringify(j,null,2))}</pre></details>
    </div>`;
  }catch(e){renderFayuError(out,e)}
}


function isBlockedAutoService(s){
  const raw = `${s?.name||''} ${s?.category||''} ${s?.description||''}`.toLowerCase();
  // Auto-submit engagement manipulation is blocked. Legal/topup-style services still allowed.
  return /(followers?|likes?|views?|comment|comments|subscriber|subscribers|share|shares|vote|poll|tiktok|instagram|youtube|facebook|thread|threads|telegram member|member group)/i.test(raw);
}
function calcFayuPrice(service, qty){
  const price = Number(service?.price||0); // umum panel: harga per 1000
  const q = Math.max(0, Number(qty||0));
  return Math.ceil((price/1000)*q);
}

let providerServicesCache = [];
let providerOrdersCache = ls.get('providerOrders', []);


function deviceKey(){
  return current?.username || me()?.username || 'guest';
}
function getDeviceSnapshots(){
  const all=ls.get('deviceSnapshots',{});
  return all && typeof all==='object' ? all : {};
}
function getDeviceSnapshot(username=deviceKey()){
  const all=getDeviceSnapshots();
  return all[username] || ls.get('deviceSnapshot',{}) || {};
}
function saveDeviceSnapshot(extra={}, username=deviceKey()){
  const all=getDeviceSnapshots();
  const old=getDeviceSnapshot(username);
  const now={
    ...old,
    ...extra,
    username,
    displayName: me()?.display || me()?.name || username,
    userAgent:navigator.userAgent||'-',
    platform:navigator.platform||'-',
    language:navigator.language||'-',
    screen:`${screen?.width||0}x${screen?.height||0}`,
    viewport:`${innerWidth||0}x${innerHeight||0}`,
    timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'-',
    lastSeen:new Date().toLocaleString('id-ID')
  };
  all[username]=now;
  ls.set('deviceSnapshots',all);
  ls.set('deviceSnapshot',now);
  return now;
}
async function refreshDeviceSnapshot(renderTarget='account'){
  saveDeviceSnapshot();
  try{
    if(navigator.getBattery){
      const b=await navigator.getBattery();
      saveDeviceSnapshot({battery:Math.round(b.level*100)+'%'});
    }
  }catch{}
  try{
    const r=await fetch('https://api.ipify.org?format=json',{cache:'no-store'});
    const j=await r.json();
    saveDeviceSnapshot({ip:j.ip||'-'});
  }catch{
    saveDeviceSnapshot({ip:getDeviceSnapshot().ip||'local/file mode'});
  }
  if(renderTarget==='account') renderAccountDeviceInfo();
  if(renderTarget==='admin') renderAdminDeviceInfo();
}
function deviceInfoRowsHTML(d=getDeviceSnapshot()){
  return `<div class="deviceGrid">
    <div class="providerCard"><small>User</small><b style="font-size:13px">${esc(d.username||'-')}</b></div>
    <div class="providerCard"><small>IP</small><b style="font-size:13px">${esc(d.ip||'Belum dicek')}</b></div>
    <div class="providerCard"><small>Battery</small><b style="font-size:13px">${esc(d.battery||'Belum dicek')}</b></div>
    <div class="providerCard"><small>Screen</small><b style="font-size:13px">${esc(d.screen||'-')}</b></div>
    <div class="providerCard"><small>Viewport</small><b style="font-size:13px">${esc(d.viewport||'-')}</b></div>
  </div>
  <div class="providerCard" style="margin-top:10px"><small>Platform</small><p class="muted">${esc(d.platform||'-')}</p></div>
  <div class="providerCard" style="margin-top:10px"><small>Language / Timezone</small><p class="muted">${esc(d.language||'-')} • ${esc(d.timezone||'-')}</p></div>
  <div class="providerCard" style="margin-top:10px"><small>User Agent</small><p class="muted" style="word-break:break-all">${esc(d.userAgent||'-')}</p></div>
  <div class="providerCard" style="margin-top:10px"><small>Last Seen</small><p class="muted">${esc(d.lastSeen||'-')}</p></div>`;
}
function renderAccountDeviceInfo(){
  const box=$('accountDeviceInfo');
  if(box) box.innerHTML=deviceInfoRowsHTML(getDeviceSnapshot());
}
function renderAdminDeviceInfo(){
  const box=$('adminDeviceInfo');
  if(!box)return;
  const all=getDeviceSnapshots();
  const users=getUsers();
  const names=[...new Set([...Object.keys(users||{}),...Object.keys(all||{})])].filter(Boolean);
  if(!names.length){box.innerHTML='<div class="panel muted">Belum ada user/device.</div>';return}
  const selected=$('adminDeviceUser')?.value || names[0] || '';
  const options=names.map(u=>`<option value="${escAttr(u)}" ${u===selected?'selected':''}>${esc((users[u]?.display||users[u]?.name||u))} (@${esc(u)})</option>`).join('');
  const d=selected ? (all[selected]||{username:selected,displayName:users[selected]?.display||selected}) : {};
  box.innerHTML=`<div class="providerInputRow">
    <select id="adminDeviceUser">${options}</select>
    <button class="btn green" onclick="adminCheckSelectedDevice()">Check</button>
  </div>
  <div id="adminDeviceResult" style="margin-top:10px">${selected?deviceInfoRowsHTML({...d,username:selected,displayName:users[selected]?.display||selected}):'<div class="panel muted">Pilih user dulu.</div>'}</div>`;
}
function adminCheckSelectedDevice(){
  const u=$('adminDeviceUser')?.value;
  const all=getDeviceSnapshots();
  const users=getUsers();
  if(!u)return toast('Pilih user dulu.','warn');
  if(u===deviceKey()) refreshDeviceSnapshot('admin');
  const d=all[u] || {username:u,displayName:users[u]?.display||u};
  const box=$('adminDeviceResult');
  if(box) box.innerHTML=deviceInfoRowsHTML({...d,username:u,displayName:users[u]?.display||u});
  toast('Device info user ditampilkan ✅');
}
function getFayuApiBase(){return 'https://fayupedia.id/api'}
function getFayuApiId(){return ls.get('fayuApiId','')}
function getFayuApiKey(){return ls.get('fayuApiKey','')}
function providerFormatRp(n){return 'Rp '+Number(n||0).toLocaleString('id-ID')}
function providerPrice(price, qty){return Math.ceil((Number(price)||0)*(Number(qty)||0)/1000)}
async function providerApi(endpoint, body={}, timeoutMs=22000){
  const api_id=getFayuApiId(), api_key=getFayuApiKey();
  if(!api_id||!api_key)throw new Error('API ID / API Key Fayupedia belum diatur di Admin Panel → API.');
  const target=getFayuApiBase()+endpoint, payload={api_id,api_key,...body};
  async function call(url,label){
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeoutMs);
    try{
      const res=await fetch(url,{method:'POST',signal:ctrl.signal,cache:'no-store',headers:{'content-type':'application/json','accept':'application/json,text/plain,*/*'},body:JSON.stringify(payload)});
      const txt=await res.text();let json;try{json=JSON.parse(txt)}catch{const f=String(txt||'').match(/\{[\s\S]*\}/);if(f)json=JSON.parse(f[0]);else throw new Error('Response bukan JSON')}
      if(!res.ok)throw new Error(json.msg||json.message||'HTTP '+res.status);
      json.__via=label;json.__endpoint=target;return json;
    }finally{clearTimeout(timer)}
  }
  if(getProxyUrl()){try{return await call(proxiedUrl(target),'proxy')}catch(e){console.warn('provider proxy failed',e.message)}}
  try{return await call(target,'direct')}catch(e){e.endpoint=target;throw e}
}
async function detectProviderDevice(){
  try{if($('providerUA'))$('providerUA').textContent=navigator.userAgent.slice(0,90);if($('providerTime'))$('providerTime').textContent=new Date().toLocaleString('id-ID');if(navigator.getBattery){const b=await navigator.getBattery();if($('providerBattery'))$('providerBattery').textContent=Math.round(b.level*100)+'%'}}catch{}
  try{const r=await fetch('https://api.ipify.org?format=json',{cache:'no-store'});const j=await r.json();if($('providerIP'))$('providerIP').textContent=j.ip||'-'}catch{if($('providerIP'))$('providerIP').textContent='local/file mode'}
}
function providerTab(tab){document.querySelectorAll('.providerTab').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));document.querySelectorAll('.providerView').forEach(x=>x.classList.toggle('active',x.id==='provider-'+tab));if(tab==='history')renderProviderOrders()}
function providerToastErr(e,outId){const h=`<div class="proxyWarn">❌ ${esc(e.message||e)}${e.endpoint?`<br><a href="${esc(e.endpoint)}" target="_blank">Buka endpoint manual</a>`:''}</div>`;if(outId&&$(outId))$(outId).innerHTML=h;toast('Provider error.','err')}
async function providerCheckBalance(){const out=$('providerBalanceNote');if(out)out.innerHTML='<span class="muted">⏳ Cek saldo...</span>';try{const j=await providerApi('/balance');if(!j.status)throw new Error(j.msg||'Gagal cek saldo');if($('providerBalance'))$('providerBalance').textContent=providerFormatRp(j.balance||0);if(out)out.innerHTML=`<span class="muted">Update: ${new Date().toLocaleTimeString('id-ID')} • ${esc(j.__via||'direct')}</span>`;toast('Saldo provider berhasil di-load ✅')}catch(e){providerToastErr(e,'providerBalanceNote')}}
async function providerLoadServices(){const out=$('providerServices');if(out)out.innerHTML='<div class="panel">⏳ Memuat layanan...</div>';try{const j=await providerApi('/services');if(!j.status)throw new Error(j.msg||'Gagal mengambil layanan');providerServicesCache=Array.isArray(j.services)?j.services:[];renderProviderServices();populateProviderSelect();toast('Layanan provider berhasil dimuat ✅')}catch(e){providerToastErr(e,'providerServices')}}
function renderProviderServices(){const q=($('providerServiceSearch')?.value||'').toLowerCase(),cat=($('providerCategoryFilter')?.value||'').toLowerCase();const arr=providerServicesCache.filter(s=>{const hay=(s.name+' '+s.category+' '+(s.description||'')).toLowerCase();return(!q||hay.includes(q))&&(!cat||String(s.category||'').toLowerCase()===cat)}).slice(0,80);const out=$('providerServices');if(!out)return;out.innerHTML=arr.map(s=>`<div class="serviceItem"><h4>${esc(s.name)}</h4><p class="muted">${esc(s.description||s.category||'-')}</p><div class="serviceMeta"><span class="serviceChip">ID: ${esc(s.id)}</span><span class="serviceChip">${esc(s.category||'-')}</span><span class="serviceChip">${providerFormatRp(s.price)} / 1000</span><span class="serviceChip">Min ${esc(s.min||'-')}</span><span class="serviceChip">Max ${esc(s.max||'-')}</span>${s.refill?'<span class="serviceChip">Refill ✅</span>':''}</div><button class="btn green" style="width:100%" onclick="providerPickService('${escAttr(s.id)}')">Pilih Layanan</button></div>`).join('')||'<div class="panel muted">Tidak ada layanan.</div>';renderProviderCategories()}
function renderProviderCategories(){const select=$('providerCategoryFilter');if(!select||select.dataset.ready)return;const cats=[...new Set(providerServicesCache.map(s=>s.category).filter(Boolean))].sort();select.innerHTML='<option value="">Semua kategori</option>'+cats.map(c=>`<option value="${escAttr(c)}">${esc(c)}</option>`).join('');select.dataset.ready='1'}
function populateProviderSelect(){const sel=$('providerServiceSelect');if(!sel)return;sel.innerHTML='<option value="">Pilih layanan...</option>'+providerServicesCache.map(s=>`<option value="${escAttr(s.id)}">${esc(s.name)} - ${providerFormatRp(s.price)}/1000</option>`).join('')}
function providerPickService(id){providerTab('order');setTimeout(()=>{if($('providerServiceSelect')){$('providerServiceSelect').value=id;providerCalcPrice()}},50)}
function providerCalcPrice(){const id=$('providerServiceSelect')?.value,qty=Number($('providerQty')?.value||0),s=providerServicesCache.find(x=>String(x.id)===String(id));const price=s?providerPrice(s.price,qty):0;if($('providerPricePreview'))$('providerPricePreview').textContent=providerFormatRp(price);if($('providerLimitPreview'))$('providerLimitPreview').textContent=s?`Min ${s.min} • Max ${s.max} • ${s.category||'-'}`:'Pilih layanan dulu'}
async function providerPlaceOrder(){const service=Number($('providerServiceSelect')?.value||0),target=($('providerTarget')?.value||'').trim(),quantity=Number($('providerQty')?.value||0),s=providerServicesCache.find(x=>String(x.id)===String(service));if(!service||!target||!quantity)return toast('Isi layanan, target, dan jumlah.','warn');if(s&&(quantity<Number(s.min)||quantity>Number(s.max)))return toast(`Jumlah harus ${s.min}-${s.max}.`,'warn');const out=$('providerOrderOut');if(out)out.innerHTML='<div class="panel">⏳ Membuat order...</div>';try{const j=await providerApi('/order',{service,target,link:target,quantity});if(!j.status)throw new Error(j.msg||'Gagal membuat order');const orderId=j.order||String(j.msg||'').match(/#(\d+)/)?.[1]||Date.now();const row={id:orderId,service,name:s?.name||'Provider Service',target,quantity,status:'processing',charge:providerPrice(s?.price,quantity),date:Date.now()};providerOrdersCache.unshift(row);providerOrdersCache=providerOrdersCache.slice(0,30);ls.set('providerOrders',providerOrdersCache);if(out)out.innerHTML=`<div class="proxyOk">✅ ${esc(j.msg||'Order berhasil')}<br>Order ID: #${esc(orderId)}</div>`;renderProviderOrders();providerTab('history')}catch(e){providerToastErr(e,'providerOrderOut')}}
function renderProviderOrders(){const out=$('providerOrders');if(!out)return;const arr=providerOrdersCache||[];out.innerHTML=arr.map(o=>`<div class="orderRow"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><b>#${esc(o.id)}</b><p class="muted">${esc(o.name||o.service||'Provider Service')}</p><p class="muted">${esc(o.target||'-')} • ${esc(o.quantity||'-')} pcs • ${providerFormatRp(o.charge||0)}</p><p class="muted">${new Date(o.date||Date.now()).toLocaleString('id-ID')}</p></div><span class="orderStatus ${esc(o.status||'processing')}">${esc(String(o.status||'processing').toUpperCase())}</span></div><div class="btnrow" style="margin-top:10px"><button class="btn ghost" onclick="providerCheckOrder('${escAttr(o.id)}')">Cek Status</button><button class="btn green" onclick="providerRefillOrder('${escAttr(o.id)}')">Refill</button></div></div>`).join('')||'<div class="panel muted">Belum ada history order.</div>'}
async function providerCheckOrder(id){try{const j=await providerApi('/status',{order:id,orders:id});if(!j.status)throw new Error(j.msg||'Order tidak ditemukan');const row=providerOrdersCache.find(x=>String(x.id)===String(id));if(row){row.status=j.order_status||j.orders?.[id]?.order_status||row.status;row.charge=j.charge??j.orders?.[id]?.charge??row.charge;row.start_count=j.start_count??j.orders?.[id]?.start_count??row.start_count;row.remains=j.remains??j.orders?.[id]?.remains??row.remains;ls.set('providerOrders',providerOrdersCache);renderProviderOrders()}toast('Status order diperbarui ✅')}catch(e){toast(e.message||'Gagal cek status','err')}}
async function providerRefillOrder(id){try{const j=await providerApi('/refill',{order:id});if(!j.status)throw new Error(j.msg||'Gagal refill');toast(j.msg||'Refill dibuat ✅')}catch(e){toast(e.message||'Gagal refill','err')}}
async function providerManualRefill(){const id=($('providerRefillId')?.value||'').trim();if(!id)return toast('Order ID kosong.','warn');await providerRefillOrder(id)}
function toolProviderOrder(){
  openModal('💉 Suntik',`
    <div class="providerShell">${proxyNeedHtml()}<div class="providerHero"><div class="providerTop"><div class="providerBrand"><div class="providerLogo">R</div><div><h2 style="margin:0">Suntik</h2><p class="muted">Saldo, layanan, order, status, dan refill dalam satu tempat.</p></div></div><span class="providerBadge">● READY</span></div><div class="providerCards" style="margin-top:14px"><div class="providerCard"><small>Mode</small><b>Layanan</b><div class="muted" style="font-size:11px;margin-top:4px">Saldo hanya admin</div></div><div class="providerCard"><small>API Status</small><b>${getFayuApiId()&&getFayuApiKey()?'READY':'EMPTY'}</b><div class="muted" style="font-size:11px;margin-top:4px">Diatur dari Admin Panel</div></div></div><div class="btnrow" style="margin-top:12px"><button class="btn ghost" onclick="providerLoadServices()">🔄 Muat Layanan</button></div></div>
      <div class="providerTabs"><button class="providerTab active" data-tab="dashboard" onclick="providerTab('dashboard')">🏠 Dashboard</button><button class="providerTab" data-tab="services" onclick="providerTab('services')">📋 Layanan</button><button class="providerTab" data-tab="order" onclick="providerTab('order')">🛒 Order</button><button class="providerTab" data-tab="history" onclick="providerTab('history')">🕘 Riwayat</button><button class="providerTab" data-tab="refill" onclick="providerTab('refill')">🔁 Refill</button></div>
      <div id="provider-dashboard" class="providerView active">
        <div class="panel">
          <h3>💉 Suntik</h3>
          <p class="muted">Menu ini untuk load layanan, order, cek status, dan refill. Saldo provider hanya bisa dicek lewat Admin Panel.</p>
          <div class="providerCards" style="margin-top:10px">
            <div class="providerCard"><small>API Status</small><b>${getFayuApiId()&&getFayuApiKey()?'READY':'EMPTY'}</b><div class="muted" style="font-size:11px;margin-top:4px">Admin Panel → API</div></div>
            <div class="providerCard"><small>Riwayat Lokal</small><b>${providerOrdersCache.length}</b><div class="muted" style="font-size:11px;margin-top:4px">Order tersimpan</div></div>
          </div>
          <button class="btn green" style="width:100%;margin-top:10px" onclick="providerLoadServices();providerTab('services')">📋 Muat Layanan</button>
        </div>
      </div>
      <div id="provider-services" class="providerView"><div class="panel"><h3>Daftar Layanan</h3><div class="providerInputRow"><input class="input" id="providerServiceSearch" placeholder="Cari layanan..." oninput="renderProviderServices()"><button class="btn ghost" onclick="providerLoadServices()">Refresh</button></div><select id="providerCategoryFilter" onchange="renderProviderServices()" style="margin-top:8px"><option value="">Semua kategori</option></select></div><div id="providerServices" class="serviceList"><div class="panel muted">Klik Muat Layanan dulu.</div></div></div>
      <div id="provider-order" class="providerView"><div class="panel"><h3>Buat Order</h3><select id="providerServiceSelect" onchange="providerCalcPrice()"><option value="">Pilih layanan...</option></select><input class="input" id="providerTarget" placeholder="Target/link/username" style="margin-top:8px"><input class="input" id="providerQty" type="number" placeholder="Jumlah" style="margin-top:8px" oninput="providerCalcPrice()"><div class="providerCard" style="margin-top:10px"><small>Perkiraan Harga</small><b id="providerPricePreview">Rp 0</b><p id="providerLimitPreview" class="muted">Pilih layanan dulu</p></div><button class="btn green" style="width:100%;margin-top:10px" onclick="providerPlaceOrder()">🛒 Buat Order</button><div id="providerOrderOut" style="margin-top:10px"></div></div></div>
      <div id="provider-history" class="providerView"><div class="panel"><h3>Riwayat Order</h3><button class="btn ghost" style="width:100%" onclick="renderProviderOrders()">Refresh Riwayat</button></div><div id="providerOrders"></div></div>
      <div id="provider-refill" class="providerView"><div class="panel"><h3>Request Refill</h3><input class="input" id="providerRefillId" placeholder="Order ID, contoh: 1107"><button class="btn green" style="width:100%;margin-top:10px" onclick="providerManualRefill()">🔁 Request Refill</button></div></div></div>`);
  setTimeout(()=>{populateProviderSelect();renderProviderOrders()},80);
}

function saveApiSetting(){ls.set('zakkiToken',$('admZakki').value.trim());ls.set('alipKey',$('admAlip').value.trim());ls.set('botcahxKey',$('admBotcah').value.trim());if($('admNeoxr'))ls.set('neoxrKey',$('admNeoxr').value.trim());if($('admCuki'))ls.set('cukiKey',$('admCuki').value.trim());if($('admCukiBase'))ls.set('cukiBase', cleanApiBase($('admCukiBase').value.trim(),'https://api.cuki.biz.id'));if($('admNexrayBase'))ls.set('nexrayBase', cleanApiBase($('admNexrayBase').value.trim(),'https://api.nexray.eu.cc'));if($('admOurinBase'))ls.set('ourinBase', cleanApiBase($('admOurinBase').value.trim(),'https://api.ourin.my.id'));if($('admProxyUrl'))setProxyUrl($('admProxyUrl').value.trim());if($('admFayuId'))ls.set('fayuApiId',$('admFayuId').value.trim());if($('admFayuKey'))ls.set('fayuApiKey',$('admFayuKey').value.trim());toast('API key & base URL disimpan. Refresh halaman biar semua config kepakai penuh.')}
function saveBadWords(){const arr=$('badWordsBox').value.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);ls.set('badWords',arr);toast('Filter toxic disimpan.')}
function adminAddSaldo(){saveMe({saldo:me().saldo+10000});addTx('Admin Test Saldo',10000);renderAll();toast('Saldo +10K.')}
function confirmDeposit(id){const deps=ls.get('deposits',[]),d=deps.find(x=>x.id===id);if(!d)return toast('Deposit tidak ditemukan.','err');d.status='SUCCESS';ls.set('deposits',deps);const users=getUsers();if(users[d.user]){users[d.user].saldo=(users[d.user].saldo||0)+Number(d.amount||0);saveUsers(users);if(me().username===d.user){current=users[d.user];addTx('Deposit Manual Paid',Number(d.amount||0))}}renderAll();openAdmin();toast('Deposit manual dikonfirmasi.')}
function openReport(){openModal('🚨 Kirim Laporan',`<input class="input" id="repTitle" placeholder="Judul report"><div style="height:9px"></div><textarea id="repText" placeholder="Isi report..."></textarea><button class="btn" style="width:100%;margin-top:10px" onclick="sendReport()">Kirim</button>`)}
function sendReport(){const r=ls.get('reports',[]);r.unshift({u:me().username,t:$('repTitle').value,b:$('repText').value,time:Date.now()});ls.set('reports',r);closeModal();toast('Report terkirim.')}


/* PATCH V63: NexRay/Ourin/Search hard fix.
   Ini override sengaja ditaruh di akhir supaya menimpa fungsi lama yang bandel. */
function baseUrlOf(name){
  if(name==='nexray') return cleanApiBase(APIS.nexrayBase,'https://api.nexray.eu.cc');
  if(name==='ourin') return cleanApiBase(APIS.ourinBase,'https://api.ourin.my.id');
  if(name==='cuki') return cleanApiBase(CUKI_API.base,'https://api.cuki.biz.id');
  return '';
}
function endpointWithParams(base,path,params={}){
  const url=new URL(baseUrlOf(base)+path);
  Object.entries(params).forEach(([k,v])=>{ if(v!==undefined && v!==null && String(v)!=='') url.searchParams.set(k,v); });
  url.searchParams.set('_r',String(Date.now()));
  return url.toString();
}
function cukiEndpoint(path,params={}){ return endpointWithParams('cuki',path,{apikey:CUKI_API.key||'cuki-x',...params}); }
function nexrayUrl(path,params={}){ return endpointWithParams('nexray',path,params); }
function ourinUrl(path, params={}){ return endpointWithParams('ourin','/api/'+String(path).replace(/^\/+/,'') ,params); }
function downloaderEndpoint(type,value){
  const encVal=value;
  const cuki={
    tiktok:cukiEndpoint('/api/downloader/tiktok',{url:encVal}),
    capcut:cukiEndpoint('/api/downloader/capcut',{url:encVal}),
    mediafire:cukiEndpoint('/api/downloader/mediafire',{url:encVal})
  };
  const nex={
    facebook:nexrayUrl('/downloader/facebook',{url:encVal}),
    instagram:nexrayUrl('/downloader/instagram',{url:encVal}),
    spotify_url:nexrayUrl('/downloader/spotify',{url:encVal}),
    spotify_play:nexrayUrl('/downloader/spotifyplay',{q:encVal}),
    yt_mp3:nexrayUrl('/downloader/ytplay',{q:encVal}),
    yt_video:nexrayUrl('/downloader/ytplayvid',{q:encVal}),
    videy:nexrayUrl('/downloader/videy',{url:encVal})
  };
  return cuki[type] || nex[type] || '';
}
async function fetchJsonAny(urls=[], timeoutMs=22000){
  const list=[...new Set(urls.filter(Boolean))];
  let last;
  for(const u of list){
    try{return await fetchJsonUrl(u,timeoutMs)}
    catch(e){last=e; console.warn('fetchJsonAny failed',u,e.message)}
  }
  throw last || new Error('Semua endpoint gagal.');
}
function deepFindArrays(obj, acc=[]){
  if(!obj) return acc;
  if(Array.isArray(obj)){ if(obj.length) acc.push(obj); obj.forEach(x=>deepFindArrays(x,acc)); return acc; }
  if(typeof obj==='object') Object.values(obj).forEach(v=>deepFindArrays(v,acc));
  return acc;
}
function bestArrayFromResponse(j){
  const direct=[j?.results,j?.result,j?.data?.results,j?.data?.result,j?.data?.data,j?.data,j?.items,j?.list];
  for(const x of direct){ const arr=arrFromAny(x); if(arr.length) return arr; }
  const arrays=deepFindArrays(j).sort((a,b)=>b.length-a.length);
  return arrays[0] || [];
}
function firstUrlFromAny(x){ return findFirstUrl ? findFirstUrl(x) : ''; }
function normalizePinterestItem(x){
  if(typeof x==='string') return {image:x,url:x,title:'Pinterest Image'};
  const image=x.image||x.img||x.url||x.media||x.src||x.thumbnail||x.pin||firstUrlFromAny(x);
  return {image,url:x.link||x.pin||x.url||image,title:x.title||x.grid_title||x.description||'Pinterest Image',desc:x.description||''};
}
function renderGenericCards(arr, raw={}, kind='Hasil Search'){
  const list=arrFromAny(arr);
  return list.slice(0,16).map((x,i)=>{
    const u=typeof x==='string'?x:(x.url||x.link||x.download_url||x.downloadUrl||firstUrlFromAny(x));
    const img=typeof x==='string'?x:(x.thumbnail||x.thumb||x.image||x.img||x.cover||x.poster||'');
    const title=typeof x==='string'?kind+' #'+(i+1):(x.title||x.name||x.judul||x.caption||kind+' #'+(i+1));
    const desc=typeof x==='string'?'':(x.description||x.desc||x.channel||x.author?.name||x.artist||'');
    return `<div class="stalkCard">${img?`<img src="${esc(img)}" loading="lazy" onerror="this.style.display='none'">`:''}<h3>${esc(title)}</h3>${desc?`<p class="muted">${esc(String(desc).slice(0,160))}</p>`:''}${u?`<a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(u)}" target="_blank">Buka / Download</a><button class="btn green" style="width:100%;margin-top:8px" onclick="copyTourl('${escAttr(u)}')">📋 Copy Link</button>`:''}</div>`;
  }).join('') || `<div class="panel muted">Tidak ada hasil.${raw?.__endpoint?`<br><a href="${esc(raw.__endpoint)}" target="_blank">Buka endpoint</a>`:''}</div>`;
}
function renderNexrayPlayResult(j){
  const r=j.result||j.data?.result||j.data||{};
  const audio=r.download_url||r.url||r.audio||r.audio_url||firstUrlFromAny(r);
  return `<div class="stalkCard">
    ${r.thumbnail?`<img src="${esc(r.thumbnail)}" loading="lazy" onerror="this.style.display='none'">`:''}
    <h3>${esc(r.title||'YouTube / Spotify Play')}</h3>
    <p class="muted">${esc(r.artist||r.channel||r.author||'-')} • ${esc(r.duration||r.upload_at||'-')}</p>
    ${audio?`<audio controls preload="metadata" style="width:100%;margin-top:10px" src="${esc(audio)}"></audio><div class="btnrow" style="margin-top:10px"><a class="btn purple" style="text-align:center;text-decoration:none" href="${esc(audio)}" target="_blank" download>⬇️ Download</a><button class="btn green" onclick="copyTourl('${escAttr(audio)}')">📋 Copy</button></div>`:'<p class="muted">Link download tidak ditemukan di response.</p>'}
    ${r.url&&r.url!==audio?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(r.url)}" target="_blank">Buka Source</a>`:''}
    <details style="margin-top:10px"><summary>Raw JSON</summary><pre style="white-space:pre-wrap;font-size:10px">${esc(JSON.stringify(j,null,2).slice(0,4000))}</pre></details>
  </div>`;
}
async function doSearchHub(){
  const type=$('shType').value, query=$('shQuery').value.trim();
  if(!query)return toast('Query kosong.','warn');
  const out=$('shOut');out.innerHTML='<div class="panel">⏳ Search...</div>';
  try{
    if(type==='tiktok'){
      const j=await fetchJsonAny([
        cukiEndpoint('/api/search/tiktok',{query}),
        cukiEndpoint('/api/search/tiktok',{q:query}),
        alipUrl('/search/tiktok',{q:query}),
        alipUrl('/search/tiktok',{query})
      ],22000);
      const arr=bestArrayFromResponse(j);
      out.innerHTML=renderAlipTikTokCards(arr,j);
    }else if(type==='pinterest_image'){
      const j=await fetchJsonAny([
        cukiEndpoint('/api/search/pinterest',{query,type:'image'}),
        cukiEndpoint('/api/search/pinterest',{q:query,type:'image'}),
        alipUrl('/search/pinterest',{q:query}),
        alipUrl('/search/pinterest',{query})
      ],22000);
      const arr=bestArrayFromResponse(j).map(normalizePinterestItem).map(x=>x.image||x.url).filter(Boolean);
      out.innerHTML=renderPinterestImageList(arr,j);
    }else if(type==='playyt'){
      const j=await fetchJsonAny([
        nexrayUrl('/downloader/ytplay',{q:query}),
        cukiEndpoint('/api/search/playyt',{query}),
        cukiEndpoint('/api/search/playyt',{q:query})
      ],35000);
      out.innerHTML=renderNexrayPlayResult(j);
    }else if(type==='youtube'){
      const j=await fetchJsonAny([
        cukiEndpoint('/api/search/youtube',{query}),
        cukiEndpoint('/api/search/youtube',{q:query}),
        alipUrl('/search/youtube',{q:query}),
        alipUrl('/search/youtube',{query})
      ],22000);
      out.innerHTML=renderGenericCards(bestArrayFromResponse(j),j,'YouTube Video');
    }else if(type==='mcpe'){
      const j=await fetchJsonAny([cukiEndpoint('/api/search/mcpe',{query}),cukiEndpoint('/api/search/mcpe',{q:query}),alipUrl('/search/mcpe',{q:query})],22000);
      out.innerHTML=renderGenericCards(bestArrayFromResponse(j),j,'MCPE Result');
    }else if(type==='resep'){
      const j=await fetchJsonAny([cukiEndpoint('/api/search/resep',{query}),cukiEndpoint('/api/search/resep',{q:query}),alipUrl('/search/resep',{q:query})],22000);
      const arr=bestArrayFromResponse(j);
      out.innerHTML=arr.map(x=>`<div class="stalkCard">${x.thumb||x.image?`<img src="${esc(x.thumb||x.image)}" loading="lazy" onerror="this.style.display='none'">`:''}<h3>${esc(x.judul||x.title||x.name||'Resep')}</h3><p class="muted">${esc(x.waktu_masak||x.time||'-')} • ${esc(x.hasil||x.serving||'-')} • ${esc(x.tingkat_kesulitan||x.difficulty||'-')}</p>${x.link||x.url?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(x.link||x.url)}" target="_blank">Buka Resep</a>`:''}</div>`).join('')||renderGenericCards(arr,j,'Resep');
    }
  }catch(e){cukiError(out,e)}
}
function renderDownloaderResult(type,json){
  const via=json.__via?`<span class="dlChip">Via: ${esc(json.__via)}</span>`:'';
  let html='', links=[];
  if(type==='tiktok'){
    const r=json.results||json.result||json.data||{};
    const video=r.nowm||r.no_watermark||r.hdplay||r.play||r.video||r.url||r.wm||firstUrlFromAny(r);
    const audio=r.music||r.music_info?.play||r.audio||r.audio_url||'';
    const title=r.title||r.caption||'TikTok Downloader';
    links=[['Video',video],['Audio/Music',audio]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(r.cover||r.origin_cover||r.ai_dynamic_cover||r.thumbnail)}<h3>${esc(title)}</h3><p class="muted">@${esc(r.author?.unique_id||r.author?.username||'-')} • ${esc(r.author?.nickname||r.author?.name||'-')}</p><div class="dlMini">${via}</div>${dlVideo(video)}${audio?dlAudio(audio):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',video)}${dlCopy('📋 Copy Video',video)}${audio?dlButton('🎧 Download Audio',audio,'ghost'):''}</div></div>`;
  }else if(type==='facebook'){
    const r=json.result||json.data||{}; const video=r.video_hd||r.hd||r.video_sd||r.sd||r.url||firstUrlFromAny(r); const audio=r.audio||'';
    links=[['Video HD',r.video_hd||r.hd],['Video SD',r.video_sd||r.sd],['Audio',audio],['Video',video]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>${esc(r.title||'Facebook Video')}</h3><div class="dlMini">${via}<span class="dlChip">Views ${esc(r.views||'-')}</span></div>${dlVideo(video)}${audio?dlAudio(audio):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download HD',r.video_hd||r.hd)}${dlButton('⬇️ Download SD',r.video_sd||r.sd,'ghost')}${dlCopy('📋 Copy Video',video)}</div></div>`;
  }else if(type==='instagram'){
    const arr=Array.isArray(json.result)?json.result:bestArrayFromResponse(json);
    html=arr.map((x,i)=>{const u=x.url||x.download_url||firstUrlFromAny(x); const isVideo=(x.type||'').includes('video')||/\.mp4|video/i.test(u); links.push([x.type||`media ${i+1}`,u]); return `<div class="dlCard">${dlImage(x.thumbnail||x.cover)}<h3>Instagram ${esc(x.type||'Media')} #${i+1}</h3>${isVideo?dlVideo(u):dlImage(u)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download/Buka',u)}${dlCopy('📋 Copy Link',u)}</div></div>`}).join('')||'<div class="panel muted">Tidak ada media Instagram.</div>';
  }else if(type==='spotify_url'||type==='spotify_play'||type==='yt_mp3'||type==='yt_video'){
    const r=json.result||json.data?.result||json.data||{}; const media=r.download_url||r.url||r.audio||r.video||firstUrlFromAny(r);
    const isVideo=type==='yt_video'; links=[['Media',media],['Source',r.url]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(r.thumbnail||r.cover)}<h3>${esc(r.title||r.name||'Downloader Result')}</h3><p class="muted">${esc(r.artist||r.channel||r.author||'-')} • ${esc(r.duration||r.upload_at||r.release_at||'-')}</p><div class="dlMini">${via}</div>${isVideo?dlVideo(media):dlAudio(media)}<div class="btnrow" style="margin-top:10px">${dlButton(isVideo?'⬇️ Download Video':'⬇️ Download Audio',media)}${dlCopy('📋 Copy',media)}${r.url&&r.url!==media?dlButton('🔗 Source',r.url,'ghost'):''}</div></div>`;
  }else if(type==='videy'){
    const r=json.result||json.data||json; const video=typeof r==='string'?r:(r.url||r.video||r.download_url||firstUrlFromAny(r)); links=[['Videy MP4',video]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>Videy Downloader</h3><div class="dlMini">${via}</div>${dlVideo(video)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',video)}${dlCopy('📋 Copy Video',video)}</div></div>`;
  }else{
    const r=json.result||json.results||json.data||{}; const u=r.download_url||r.url||r.link||firstUrlFromAny(r); links=[['File',u]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(r.thumbnail||r.cover||r.image)}<h3>${esc(r.title||r.filename||'Downloader Result')}</h3><div class="dlMini">${via}<span class="dlChip">${esc(r.filesize||r.size||'')}</span></div>${/\.mp4|video/i.test(u)?dlVideo(u):/\.mp3|audio/i.test(u)?dlAudio(u):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download/Buka',u)}${dlCopy('📋 Copy Link',u)}</div></div>`;
  }
  saveDownloadRiwayat(type,(links[0]&&links[0][0])||type,links);
  return html + `<details class="panel" style="margin-top:10px"><summary>Raw JSON / Debug</summary><pre style="white-space:pre-wrap;font-size:10px">${esc(JSON.stringify(json,null,2).slice(0,5000))}</pre></details>`;
}


/* PATCH V64: Proxy CORS + downloader diagnostics hard fix.
   Catatan kecil dari neraka frontend: HTML lokal + API luar = CORS tantrum. */
function normalizeProxyUrl(proxy, target){
  const p=String(proxy||'').trim();
  if(!p) return target;
  if(p.includes('{url}')) return p.replace('{url}', encodeURIComponent(target));
  const low=p.toLowerCase();
  if(low.includes('allorigins.win')) return p.replace(/\/$/,'') + '/raw?url=' + encodeURIComponent(target) + '&_=' + Date.now();
  if(low.includes('codetabs.com')) return p.replace(/\/$/,'') + '/v1/proxy?quest=' + encodeURIComponent(target) + '&_=' + Date.now();
  if(low.includes('corsproxy.io')) return p.replace(/\/$/,'') + '/?' + encodeURIComponent(target) + '&_=' + Date.now();
  if(low.includes('thingproxy.freeboard.io')) return p.replace(/\/$/,'') + '/fetch/' + target;
  return p.replace(/\/$/,'') + (p.includes('?') ? '&' : '?') + 'url=' + encodeURIComponent(target) + '&_=' + Date.now();
}
function proxiedUrl(target){ return normalizeProxyUrl(getProxyUrl(), target); }
function proxyNeedHtml(){
  const proxy=getProxyUrl();
  if(isFileMode() && !proxy){
    return `<div class="proxyWarn"><b>⚠️ Mode file lokal terdeteksi</b><br>Downloader/Search bisa gagal karena CORS. Buka <b>Admin Panel → API</b>, isi Proxy URL lalu tekan <b>Test Proxy</b>. Contoh cepat: <code>https://corsproxy.io/</code></div>`;
  }
  if(proxy){
    return `<div class="proxyOk"><b>✅ Proxy aktif</b><br><span class="tourlUrl">${esc(proxy)}</span></div>`;
  }
  return '';
}
async function fetchJsonUrl(direct, timeoutMs=26000){
  async function tryFetch(target,label,ms=timeoutMs){
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),ms);
    try{
      const res=await fetch(target,{signal:ctrl.signal,cache:'no-store',headers:{accept:'application/json,text/plain,*/*','cache-control':'no-cache','pragma':'no-cache'}});
      const txt=await res.text();
      let json;
      try{json=JSON.parse(txt)}
      catch{
        const found=String(txt||'').match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if(found) json=JSON.parse(found[0]);
        else throw new Error('Response bukan JSON: '+String(txt||'').slice(0,120));
      }
      if(json && typeof json.contents==='string'){
        try{json=JSON.parse(json.contents)}catch{}
      }
      if(json && typeof json.body==='string'){
        try{json=JSON.parse(json.body)}catch{}
      }
      if(!res.ok) throw new Error((json&&json.msg)||(json&&json.message)||'HTTP '+res.status);
      if(json && (json.status===false || json.success===false || (json.statusCode&&json.statusCode>=400))) throw new Error(json.msg||json.message||'API error');
      if(json && typeof json==='object'){json.__endpoint=direct;json.__via=label;}
      return json;
    }finally{clearTimeout(timer)}
  }
  const errors=[];
  const proxy=getProxyUrl();
  const encoded=encodeURIComponent(direct);
  const targets=[];
  if(proxy) targets.push(['proxy:'+proxy, normalizeProxyUrl(proxy,direct), timeoutMs+12000]);
  targets.push(['direct',direct,timeoutMs]);
  targets.push(['allorigins','https://api.allorigins.win/raw?url='+encoded+'&_='+Date.now(),timeoutMs+8000]);
  targets.push(['corsproxy','https://corsproxy.io/?'+encoded+'&_='+Date.now(),timeoutMs+10000]);
  targets.push(['codetabs','https://api.codetabs.com/v1/proxy?quest='+encoded+'&_='+Date.now(),timeoutMs+10000]);
  for(const [label,target,ms] of targets){
    try{return await tryFetch(target,label,ms)}
    catch(e){errors.push(label+': '+(e.name==='AbortError'?'timeout':e.message));}
  }
  const err=new Error((isFileMode()&&!proxy?'Mode file:// tanpa Proxy URL. Isi Admin Panel → API → Proxy URL. | ':'')+errors.join(' | '));
  err.endpoint=direct;
  throw err;
}
function downloaderHelpHtml(endpoint, e){
  const fileWarn=isFileMode()?'<div class="proxyWarn"><b>Mode file:// aktif</b><br>Kalau endpoint manual terbuka JSON tapi tombol web gagal, berarti CORS. Isi Proxy URL di Admin Panel → API.</div>':'';
  return `${fileWarn}<div class="proxyBox"><a class="btn purple" style="display:block;text-align:center;text-decoration:none" href="${esc(endpoint||e?.endpoint||'')}" target="_blank">🔗 Buka Endpoint Manual</a><button class="btn ghost" onclick="copyTourl('${escAttr(endpoint||e?.endpoint||'')}')">📋 Copy Endpoint</button><button class="btn ghost" onclick="openAdmin();setTimeout(()=>adminTab('api'),100)">⚙️ Buka Setting API/Proxy</button></div>`;
}
async function doDownload(){
  const type=$('dlType').value, val=$('dlUrl').value.trim();
  const out=$('dlResult');
  if(!val)return toast('Input kosong.','warn');
  const endpoint=downloaderEndpoint(type,val);
  if(!endpoint)return toast('Endpoint tidak tersedia.','err');
  const longTypes=['yt_video','yt_mp3','instagram'];
  out.innerHTML=`${proxyNeedHtml()}<div class="panel">⏳ Mengambil data ${esc(type)}...<br><span class="muted">Endpoint: ${esc(endpoint.replace(/apikey=[^&]+/,'apikey=***'))}</span>${longTypes.includes(type)?'<br><span class="muted">Tipe ini bisa lama. API sedang bekerja, bukan sedang merenungi nasib.</span>':''}</div>`;
  try{
    const json=await fetchJsonUrl(endpoint, longTypes.includes(type)?95000:35000);
    out.innerHTML=renderDownloaderResult(type,json);
  }catch(e){
    out.innerHTML=`<div class="panel"><b style="color:var(--red)">Gagal mengambil media.</b><p class="muted">${esc(e.name==='AbortError'?'Timeout API':(e.message||e))}</p><p class="muted">Kalau endpoint manual hidup tapi tombol gagal, itu CORS. HTML lokal memang sering sok suci sama API luar 😑</p></div>${downloaderHelpHtml(endpoint,e)}`;
  }
}
function cukiError(target,e){
  const endpoint=e?.endpoint||'';
  target.innerHTML=`<div class="panel"><b style="color:var(--red)">Gagal terhubung.</b><p class="muted">${esc(e?.name==='AbortError'?'Timeout API':(e?.message||e))}</p><p class="muted">Kalau dibuka dari file lokal/ZArchiver, isi Proxy URL di Admin Panel → API lalu test.</p></div>${endpoint?downloaderHelpHtml(endpoint,e):''}`;
}



/* PATCH V65: Request + response normalizer.
   Fokus: endpoint benar -> fetch benar -> response dibaca benar. Bukan nambah ritual proxy lagi. */
function maskKeyUrl(u){return String(u||'').replace(/(apikey|api_key|key|token)=([^&]+)/gi,'$1=***')}
function jsonLikeText(txt){
  txt=String(txt||'').trim();
  if(!txt) throw new Error('Response kosong dari API.');
  try{return JSON.parse(txt)}catch{}
  const m=txt.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if(m){try{return JSON.parse(m[1])}catch{}}
  throw new Error('Response bukan JSON: '+txt.slice(0,180));
}
function unwrapProxyJson(j){
  if(!j||typeof j!=='object') return j;
  if(typeof j.contents==='string'){
    try{return unwrapProxyJson(JSON.parse(j.contents))}catch{}
  }
  if(typeof j.body==='string'){
    try{return unwrapProxyJson(JSON.parse(j.body))}catch{}
  }
  if(typeof j.response==='string'){
    try{return unwrapProxyJson(JSON.parse(j.response))}catch{}
  }
  return j;
}
function proxyCandidatesFor(endpoint){
  const enc=encodeURIComponent(endpoint), arr=[];
  const custom=getProxyUrl&&getProxyUrl();
  if(custom) arr.push(['proxy-custom',normalizeProxyUrl(custom,endpoint)]);
  arr.push(['allorigins','https://api.allorigins.win/raw?url='+enc]);
  arr.push(['corsproxy','https://corsproxy.io/?'+enc]);
  return arr;
}
async function apiRequest(endpoint, opt={}){
  const timeoutMs=opt.timeout||35000;
  const attempts=[['direct',endpoint], ...proxyCandidatesFor(endpoint)];
  const errors=[];
  for(const [via,url] of attempts){
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(),timeoutMs);
    try{
      const res=await fetch(url,{method:'GET',cache:'no-store',signal:ctrl.signal,headers:{'accept':'application/json,text/plain,*/*'}});
      const txt=await res.text();
      let json=unwrapProxyJson(jsonLikeText(txt));
      if(!res.ok){
        const msg=json?.message||json?.msg||json?.error||('HTTP '+res.status);
        throw new Error(msg);
      }
      if(json&&typeof json==='object'){
        json.__endpoint=endpoint;
        json.__via=via;
        json.__httpStatus=res.status;
      }
      return json;
    }catch(e){
      errors.push(via+': '+(e.name==='AbortError'?'timeout':e.message));
    }finally{clearTimeout(t)}
  }
  const err=new Error(errors.join(' | '));
  err.endpoint=endpoint;
  throw err;
}
async function fetchJsonUrl(direct, timeoutMs=35000){return apiRequest(direct,{timeout:timeoutMs})}
async function fetchJsonAny(urls=[], timeoutMs=35000){
  let last;
  for(const u of [...new Set(urls.filter(Boolean))]){
    try{return await apiRequest(u,{timeout:timeoutMs})}
    catch(e){last=e;console.warn('apiRequest failed:',u,e.message)}
  }
  throw last||new Error('Semua endpoint gagal.');
}
function objAt(j,keys){
  let cur=j;
  for(const k of keys){cur=cur?.[k]}
  return cur;
}
function firstObj(...items){
  for(const x of items){if(x&&typeof x==='object'&&!Array.isArray(x)) return x}
  return {};
}
function deepUrls(x,acc=[]){
  if(!x) return acc;
  if(typeof x==='string'){
    if(/^https?:\/\//i.test(x)) acc.push(x);
    return acc;
  }
  if(Array.isArray(x)){x.forEach(v=>deepUrls(v,acc));return acc;}
  if(typeof x==='object') Object.values(x).forEach(v=>deepUrls(v,acc));
  return acc;
}
function pickUrlDeep(x,prefer=[]){
  const urls=[...new Set(deepUrls(x))];
  for(const p of prefer){const u=urls.find(v=>new RegExp(p,'i').test(v)); if(u) return u;}
  return urls[0]||'';
}
function valAny(obj,paths=[]){
  for(const p of paths){
    const parts=Array.isArray(p)?p:String(p).split('.');
    const v=objAt(obj,parts);
    if(v!==undefined&&v!==null&&String(v)!=='') return v;
  }
  return '';
}
function apiPayload(j){return firstObj(j?.results,j?.result,j?.data?.results,j?.data?.result,j?.data,j)}
function apiArray(j){
  const direct=[j?.result,j?.results,j?.data?.result,j?.data?.results,j?.data,j?.items,j?.list];
  for(const x of direct){if(Array.isArray(x))return x;if(x&&Array.isArray(x.data))return x.data;if(x&&Array.isArray(x.items))return x.items;}
  return bestArrayFromResponse?bestArrayFromResponse(j):[];
}
function renderApiFail(out,e,endpoint){
  out.innerHTML=`<div class="panel"><b style="color:var(--red)">Request gagal / response tidak kebaca.</b><p class="muted">${esc(e?.message||e)}</p><p class="muted">Endpoint yang dipanggil:</p><div class="tourlUrl">${esc(maskKeyUrl(endpoint||e?.endpoint||''))}</div></div>${downloaderHelpHtml?downloaderHelpHtml(endpoint||e?.endpoint||'',e):''}`;
}
function renderDownloaderResult(type,json){
  const via=json.__via?`<span class="dlChip">Via: ${esc(json.__via)}</span>`:'';
  const raw=json||{}, p=apiPayload(raw);
  let html='', links=[];
  if(type==='tiktok'){
    const r=p;
    const video=valAny(r,['nowm','no_watermark','noWatermark','hdplay','play','video','url','wm'])||pickUrlDeep(r,['nowm','mp4','video','play']);
    const audio=valAny(r,['music','music_info.play','audio','audio_url'])||pickUrlDeep(r,['mp3','music','audio']);
    const cover=valAny(r,['cover','origin_cover','ai_dynamic_cover','thumbnail']);
    links=[['Video',video],['Audio',audio]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(cover)}<h3>${esc(valAny(r,['title','caption'])||'TikTok Downloader')}</h3><p class="muted">@${esc(valAny(r,['author.unique_id','author.username'])||'-')} • ${esc(valAny(r,['author.nickname','author.name'])||'-')}</p><div class="dlMini">${via}</div>${dlVideo(video)}${audio?dlAudio(audio):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',video)}${dlCopy('📋 Copy Video',video)}${audio?dlButton('🎧 Download Audio',audio,'ghost'):''}</div></div>`;
  }else if(type==='facebook'){
    const r=p;
    const hd=valAny(r,['video_hd','hd','hd_url']);
    const sd=valAny(r,['video_sd','sd','sd_url']);
    const video=hd||sd||valAny(r,['url','video','download_url'])||pickUrlDeep(r,['mp4','video']);
    const audio=valAny(r,['audio','audio_url'])||pickUrlDeep(r,['mp3','audio']);
    links=[['HD',hd],['SD',sd],['Video',video],['Audio',audio]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>${esc(valAny(r,['title','caption'])||'Facebook Video')}</h3><div class="dlMini">${via}<span class="dlChip">Views ${esc(valAny(r,['views','view'])||'-')}</span><span class="dlChip">Reaction ${esc(valAny(r,['reaction','reactions'])||'-')}</span></div>${dlVideo(video)}${audio?dlAudio(audio):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download HD',hd||video)}${sd?dlButton('⬇️ Download SD',sd,'ghost'):''}${dlCopy('📋 Copy Video',video)}</div></div>`;
  }else if(type==='instagram'){
    const arr=apiArray(raw);
    html=arr.map((x,i)=>{const u=valAny(x,['url','download_url','media','video'])||pickUrlDeep(x,['mp4','jpg','jpeg','webp','png']);const th=valAny(x,['thumbnail','thumb','cover','image']);const isVideo=/video|mp4/i.test((x.type||'')+' '+u);links.push([x.type||('Media '+(i+1)),u]);return `<div class="dlCard">${th?dlImage(th):''}<h3>Instagram ${esc(x.type||'Media')} #${i+1}</h3>${isVideo?dlVideo(u):dlImage(u)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download/Buka',u)}${dlCopy('📋 Copy Link',u)}</div></div>`}).join('')||`<div class="panel muted">Response ada, tapi media Instagram tidak ketemu. Cek Raw JSON.</div>`;
  }else if(type==='spotify_url'){
    const r=p; const media=valAny(r,['url','download_url','audio','audio_url'])||pickUrlDeep(r,['mp3','audio']); links=[['Audio',media]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>${esc(valAny(r,['title','name'])||'Spotify Downloader')}</h3><p class="muted">${esc(valAny(r,['artist','artists'])||'-')}</p><div class="dlMini">${via}</div>${dlAudio(media)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Audio',media)}${dlCopy('📋 Copy Audio',media)}</div></div>`;
  }else if(type==='spotify_play'||type==='yt_mp3'||type==='yt_video'){
    const r=p; const media=valAny(r,['download_url','downloadUrl','audio','audio_url','video','video_url'])||pickUrlDeep(r,[type==='yt_video'?'mp4':'mp3','download','audio','video']); const source=valAny(r,['url','source','youtube_url','spotify_url']); const isVideo=type==='yt_video'; links=[['Media',media],['Source',source]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(valAny(r,['thumbnail','thumb','cover','image']))}<h3>${esc(valAny(r,['title','name'])||'Downloader Result')}</h3><p class="muted">${esc(valAny(r,['artist','channel','author'])||'-')} • ${esc(valAny(r,['duration','upload_at','release_at'])||'-')}</p><div class="dlMini">${via}</div>${isVideo?dlVideo(media):dlAudio(media)}<div class="btnrow" style="margin-top:10px">${dlButton(isVideo?'⬇️ Download Video':'⬇️ Download Audio',media)}${dlCopy('📋 Copy',media)}${source&&source!==media?dlButton('🔗 Source',source,'ghost'):''}</div></div>`;
  }else if(type==='videy'){
    const r=raw.result||raw.data||p||raw; const video=typeof r==='string'?r:(valAny(r,['url','video','download_url'])||pickUrlDeep(r,['mp4'])); links=[['Videy MP4',video]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>Videy Downloader</h3><div class="dlMini">${via}</div>${dlVideo(video)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',video)}${dlCopy('📋 Copy Video',video)}</div></div>`;
  }else{
    const r=p; const u=valAny(r,['download_url','url','link','file','media'])||pickUrlDeep(r,['mp4','mp3','zip','rar','pdf']); links=[['File',u]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(valAny(r,['thumbnail','cover','image']))}<h3>${esc(valAny(r,['title','filename','name'])||'Downloader Result')}</h3><div class="dlMini">${via}</div>${/\.mp4|video/i.test(u)?dlVideo(u):/\.mp3|audio/i.test(u)?dlAudio(u):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download/Buka',u)}${dlCopy('📋 Copy Link',u)}</div></div>`;
  }
  try{saveDownloadRiwayat(type,(links[0]&&links[0][0])||type,links)}catch{}
  return html+`<details class="panel" style="margin-top:10px"><summary>Raw JSON / Debug</summary><pre style="white-space:pre-wrap;font-size:10px">${esc(JSON.stringify(raw,null,2).slice(0,7000))}</pre></details>`;
}
async function doDownload(){
  const type=$('dlType').value, val=$('dlUrl').value.trim(), out=$('dlResult');
  if(!val)return toast('Input kosong.','warn');
  const endpoint=downloaderEndpoint(type,val);
  if(!endpoint)return toast('Endpoint tidak tersedia.','err');
  const longTypes=['yt_video','yt_mp3','instagram'];
  out.innerHTML=`<div class="panel">⏳ Request API...<br><span class="muted">${esc(maskKeyUrl(endpoint))}</span></div>`;
  try{
    const json=await apiRequest(endpoint,{timeout:longTypes.includes(type)?95000:45000});
    out.innerHTML=renderDownloaderResult(type,json);
  }catch(e){renderApiFail(out,e,endpoint)}
}
function normalizeSearchResults(j){
  const arr=apiArray(j);
  if(arr.length) return arr;
  const p=apiPayload(j);
  return Array.isArray(p?.items)?p.items:Array.isArray(p?.list)?p.list:[];
}
async function doSearchHub(){
  const type=$('shType').value, query=$('shQuery').value.trim(), out=$('shOut');
  if(!query)return toast('Query kosong.','warn');
  out.innerHTML='<div class="panel">⏳ Request search API...</div>';
  try{
    let urls=[];
    if(type==='tiktok') urls=[cukiEndpoint('/api/search/tiktok',{query}),cukiEndpoint('/api/search/tiktok',{q:query}),alipUrl('/search/tiktok',{q:query})];
    else if(type==='pinterest_image') urls=[cukiEndpoint('/api/search/pinterest',{query}),cukiEndpoint('/api/search/pinterest',{q:query}),alipUrl('/search/pinterest',{q:query})];
    else if(type==='playyt') urls=[nexrayUrl('/downloader/ytplay',{q:query}),cukiEndpoint('/api/search/playyt',{query}),cukiEndpoint('/api/search/playyt',{q:query})];
    else if(type==='youtube') urls=[cukiEndpoint('/api/search/youtube',{query}),cukiEndpoint('/api/search/youtube',{q:query}),alipUrl('/search/youtube',{q:query})];
    else if(type==='mcpe') urls=[cukiEndpoint('/api/search/mcpe',{query}),cukiEndpoint('/api/search/mcpe',{q:query}),alipUrl('/search/mcpe',{q:query})];
    else if(type==='resep') urls=[cukiEndpoint('/api/search/resep',{query}),cukiEndpoint('/api/search/resep',{q:query}),alipUrl('/search/resep',{q:query})];
    const j=await fetchJsonAny(urls, type==='playyt'?75000:35000);
    const arr=normalizeSearchResults(j);
    if(type==='playyt') out.innerHTML=renderNexrayPlayResult(j);
    else if(type==='pinterest_image') out.innerHTML=renderPinterestImageList(arr.map(normalizePinterestItem).map(x=>x.image||x.url).filter(Boolean),j);
    else if(type==='tiktok') out.innerHTML=renderAlipTikTokCards(arr,j);
    else if(type==='resep') out.innerHTML=arr.map(x=>`<div class="stalkCard">${x.thumb||x.image?`<img src="${esc(x.thumb||x.image)}" loading="lazy" onerror="this.style.display='none'">`:''}<h3>${esc(x.judul||x.title||x.name||'Resep')}</h3><p class="muted">${esc(x.waktu_masak||x.time||'-')} • ${esc(x.hasil||x.serving||'-')} • ${esc(x.tingkat_kesulitan||x.difficulty||'-')}</p>${x.link||x.url?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${esc(x.link||x.url)}" target="_blank">Buka Resep</a>`:''}</div>`).join('')||renderGenericCards(arr,j,'Resep');
    else out.innerHTML=renderGenericCards(arr,j,type.toUpperCase());
  }catch(e){renderApiFail(out,e,e?.endpoint||'')}
}



/* PATCH V66: Direct request only + TikTok no cover + Videy BotCahX/Alip-style result.
   Tidak pakai local proxy. Endpoint sukses -> result dibaca sefleksibel mungkin. */
function botcahxUrl(path, params={}){
  const base=cleanApiBase(APIS.botcahxBase||'https://api.botcahx.eu.org','https://api.botcahx.eu.org');
  const url=new URL(base+'/'+String(path).replace(/^\/+/,''));
  Object.entries(params).forEach(([k,v])=>{ if(v!==undefined && v!==null && String(v)!=='') url.searchParams.set(k,v); });
  url.searchParams.set('_r',String(Date.now()));
  return url.toString();
}
function downloaderEndpoint(type,value){
  const encVal=value;
  const cuki={
    tiktok:cukiEndpoint('/api/downloader/tiktok',{url:encVal}),
    capcut:cukiEndpoint('/api/downloader/capcut',{url:encVal}),
    mediafire:cukiEndpoint('/api/downloader/mediafire',{url:encVal})
  };
  const nex={
    facebook:nexrayUrl('/downloader/facebook',{url:encVal}),
    instagram:nexrayUrl('/downloader/instagram',{url:encVal}),
    spotify_url:nexrayUrl('/downloader/spotify',{url:encVal}),
    spotify_play:nexrayUrl('/downloader/spotifyplay',{q:encVal}),
    yt_mp3:nexrayUrl('/downloader/ytplay',{q:encVal}),
    yt_video:nexrayUrl('/downloader/ytplayvid',{q:encVal})
  };
  // Videy ikut contoh plugin: /api/download/videy -> ambil data.result sebagai MP4.
  const botcahx={
    videy:botcahxUrl('/api/download/videy',{apikey:APIS.botcahxKey||'ellapikey',url:encVal})
  };
  return cuki[type] || nex[type] || botcahx[type] || '';
}
async function apiRequest(endpoint,opt={}){
  const timeoutMs=opt.timeout||45000;
  const ctrl=new AbortController();
  const t=setTimeout(()=>ctrl.abort(),timeoutMs);
  try{
    const res=await fetch(endpoint,{method:'GET',cache:'no-store',signal:ctrl.signal,headers:{'accept':'application/json,text/plain,*/*'}});
    const txt=await res.text();
    const json=unwrapProxyJson(jsonLikeText(txt));
    if(!res.ok){
      const msg=json?.message||json?.msg||json?.error||('HTTP '+res.status);
      throw new Error(msg);
    }
    if(json&&typeof json==='object'){
      json.__endpoint=endpoint;
      json.__via='direct';
      json.__httpStatus=res.status;
    }
    return json;
  }catch(e){
    const err=new Error(e.name==='AbortError'?'Timeout API':(e.message||String(e)));
    err.endpoint=endpoint;
    throw err;
  }finally{clearTimeout(t)}
}
async function fetchJsonUrl(direct, timeoutMs=45000){return apiRequest(direct,{timeout:timeoutMs})}
async function fetchJsonAny(urls=[], timeoutMs=45000){
  let last;
  for(const u of [...new Set(urls.filter(Boolean))]){
    try{return await apiRequest(u,{timeout:timeoutMs})}
    catch(e){last=e;console.warn('Direct request failed:',u,e.message)}
  }
  throw last||new Error('Semua endpoint gagal.');
}
function anyResultFromApi(raw){
  if(raw?.results!==undefined) return raw.results;
  if(raw?.result!==undefined) return raw.result;
  if(raw?.data?.results!==undefined) return raw.data.results;
  if(raw?.data?.result!==undefined) return raw.data.result;
  if(raw?.data!==undefined) return raw.data;
  return raw;
}
function renderAnySuccessBox(title, payload, links=[]){
  const cleanLinks=[...new Set(links.map(x=>Array.isArray(x)?x[1]:x).filter(Boolean))];
  return `<div class="dlCard"><h3>${esc(title)}</h3><p class="muted">API berhasil mengembalikan result. Link media diambil dari field yang tersedia.</p><div class="btnrow" style="margin-top:10px">${cleanLinks.slice(0,4).map((u,i)=>dlButton(i?'🔗 Buka Link':'⬇️ Download/Buka',u,i?'ghost':'purple')).join('')}${cleanLinks[0]?dlCopy('📋 Copy Link',cleanLinks[0]):''}</div>${cleanLinks[0]&&/\.mp4|video|videy|tiktok/i.test(cleanLinks[0])?dlVideo(cleanLinks[0]):''}</div>`;
}
function renderDownloaderResult(type,json){
  const via=json.__via?`<span class="dlChip">Via: ${esc(json.__via)}</span>`:'';
  const raw=json||{}, p=anyResultFromApi(raw);
  let html='', links=[];

  if(type==='tiktok'){
    const r=(p&&typeof p==='object'&&!Array.isArray(p))?p:{};
    const video=valAny(r,['nowm','no_watermark','noWatermark','hdplay','play','video','url','wm'])||pickUrlDeep(r,['nowm','mp4','video','play']);
    const audio=valAny(r,['music','music_info.play','audio','audio_url'])||pickUrlDeep(r,['mp3','music','audio']);
    links=[['Video',video],['Audio',audio]].filter(x=>x[1]);
    const fallbackUrls=deepUrls(r).filter(u=>!/cover|jpg|jpeg|png|webp/i.test(u));
    html=`<div class="dlCard"><h3>${esc(valAny(r,['title','caption'])||'TikTok Downloader')}</h3><p class="muted">@${esc(valAny(r,['author.unique_id','author.username'])||'-')} • ${esc(valAny(r,['author.nickname','author.name'])||'-')}</p><div class="dlMini">${via}<span class="dlChip">No Cover Preview</span></div>${video?dlVideo(video):''}${audio?dlAudio(audio):''}<div class="btnrow" style="margin-top:10px">${video?dlButton('⬇️ Download Video',video):''}${video?dlCopy('📋 Copy Video',video):''}${audio?dlButton('🎧 Download Audio',audio,'ghost'):''}${!video&&fallbackUrls[0]?dlButton('🔗 Buka Result',fallbackUrls[0],'ghost'):''}</div>${!video&&!audio?renderAnySuccessBox('TikTok Result Terdeteksi',r,fallbackUrls):''}</div>`;
  }else if(type==='videy'){
    const r=raw.result!==undefined?raw.result:(raw.data?.result!==undefined?raw.data.result:p);
    const video=typeof r==='string'?r:(valAny(r,['url','video','download_url','result'])||pickUrlDeep(r,['mp4','videy']));
    links=[['Videy MP4',video]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>Videy Downloader</h3><p class="muted">Endpoint BotCahX/Alip-style: ambil <b>result</b> sebagai video MP4.</p><div class="dlMini">${via}</div>${video?dlVideo(video):''}<div class="btnrow" style="margin-top:10px">${video?dlButton('⬇️ Download Video',video):''}${video?dlCopy('📋 Copy Video',video):''}</div>${!video?renderAnySuccessBox('Videy Result Terdeteksi',r,deepUrls(r)):''}</div>`;
  }else if(type==='facebook'){
    const r=(p&&typeof p==='object'&&!Array.isArray(p))?p:{};
    const hd=valAny(r,['video_hd','hd','hd_url']);
    const sd=valAny(r,['video_sd','sd','sd_url']);
    const video=hd||sd||valAny(r,['url','video','download_url'])||pickUrlDeep(r,['mp4','video']);
    const audio=valAny(r,['audio','audio_url'])||pickUrlDeep(r,['mp3','audio']);
    links=[['HD',hd],['SD',sd],['Video',video],['Audio',audio]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>${esc(valAny(r,['title','caption'])||'Facebook Video')}</h3><div class="dlMini">${via}<span class="dlChip">Views ${esc(valAny(r,['views','view'])||'-')}</span><span class="dlChip">Reaction ${esc(valAny(r,['reaction','reactions'])||'-')}</span></div>${video?dlVideo(video):''}${audio?dlAudio(audio):''}<div class="btnrow" style="margin-top:10px">${video?dlButton('⬇️ Download Video',video):''}${sd&&sd!==video?dlButton('⬇️ Download SD',sd,'ghost'):''}${video?dlCopy('📋 Copy Video',video):''}</div>${!video&&!audio?renderAnySuccessBox('Facebook Result Terdeteksi',r,deepUrls(r)):''}</div>`;
  }else if(type==='instagram'){
    const arr=Array.isArray(p)?p:apiArray(raw);
    html=arr.map((x,i)=>{const u=typeof x==='string'?x:(valAny(x,['url','download_url','media','video'])||pickUrlDeep(x,['mp4','jpg','jpeg','webp','png']));const th=typeof x==='object'?valAny(x,['thumbnail','thumb','cover','image']):'';const isVideo=/video|mp4/i.test(((x&&x.type)||'')+' '+u);links.push([((x&&x.type)||('Media '+(i+1))),u]);return `<div class="dlCard">${th?dlImage(th):''}<h3>Instagram ${esc((x&&x.type)||'Media')} #${i+1}</h3>${isVideo?dlVideo(u):dlImage(u)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download/Buka',u)}${dlCopy('📋 Copy Link',u)}</div></div>`}).join('')||renderAnySuccessBox('Instagram Result Terdeteksi',p,deepUrls(p));
  }else if(type==='spotify_url'){
    const r=(p&&typeof p==='object'&&!Array.isArray(p))?p:{}; const media=valAny(r,['url','download_url','audio','audio_url'])||pickUrlDeep(r,['mp3','audio']); links=[['Audio',media]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>${esc(valAny(r,['title','name'])||'Spotify Downloader')}</h3><p class="muted">${esc(valAny(r,['artist','artists'])||'-')}</p><div class="dlMini">${via}</div>${media?dlAudio(media):''}<div class="btnrow" style="margin-top:10px">${media?dlButton('⬇️ Download Audio',media):''}${media?dlCopy('📋 Copy Audio',media):''}</div>${!media?renderAnySuccessBox('Spotify Result Terdeteksi',r,deepUrls(r)):''}</div>`;
  }else if(type==='spotify_play'||type==='yt_mp3'||type==='yt_video'){
    const r=(p&&typeof p==='object'&&!Array.isArray(p))?p:{}; const media=valAny(r,['download_url','downloadUrl','audio','audio_url','video','video_url'])||pickUrlDeep(r,[type==='yt_video'?'mp4':'mp3','download','audio','video']); const source=valAny(r,['url','source','youtube_url','spotify_url']); const isVideo=type==='yt_video'; links=[['Media',media],['Source',source]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(valAny(r,['thumbnail','thumb','cover','image']))}<h3>${esc(valAny(r,['title','name'])||'Downloader Result')}</h3><p class="muted">${esc(valAny(r,['artist','channel','author'])||'-')} • ${esc(valAny(r,['duration','upload_at','release_at'])||'-')}</p><div class="dlMini">${via}</div>${media?(isVideo?dlVideo(media):dlAudio(media)):''}<div class="btnrow" style="margin-top:10px">${media?dlButton(isVideo?'⬇️ Download Video':'⬇️ Download Audio',media):''}${media?dlCopy('📋 Copy',media):''}${source&&source!==media?dlButton('🔗 Source',source,'ghost'):''}</div>${!media?renderAnySuccessBox('Result Terdeteksi',r,deepUrls(r)):''}</div>`;
  }else{
    const r=p; const u=typeof r==='string'?r:(valAny(r,['download_url','url','link','file','media'])||pickUrlDeep(r,['mp4','mp3','zip','rar','pdf'])); links=[['File',u]].filter(x=>x[1]);
    html=`<div class="dlCard">${typeof r==='object'?dlImage(valAny(r,['thumbnail','cover','image'])):''}<h3>${esc((typeof r==='object'&&valAny(r,['title','filename','name']))||'Downloader Result')}</h3><div class="dlMini">${via}</div>${/\.mp4|video/i.test(u)?dlVideo(u):/\.mp3|audio/i.test(u)?dlAudio(u):''}<div class="btnrow" style="margin-top:10px">${u?dlButton('⬇️ Download/Buka',u):''}${u?dlCopy('📋 Copy Link',u):''}</div>${!u?renderAnySuccessBox('Result Terdeteksi',r,deepUrls(r)):''}</div>`;
  }
  try{saveDownloadRiwayat(type,(links[0]&&links[0][0])||type,links)}catch{}
  return html+`<details class="panel" style="margin-top:10px"><summary>Raw JSON / Debug</summary><pre style="white-space:pre-wrap;font-size:10px">${esc(JSON.stringify(raw,null,2).slice(0,7000))}</pre></details>`;
}



/* PATCH V67: field mapping fix. Direct request only, no proxy/local CORS ritual.
   Tambah konstanta videoResult/audioResult per downloader agar response API langsung kebaca. */
function cleanBaseV67(base,fallback){return String(base||fallback||'').trim().replace(/\/+$/,'')}
function cukiUrlV67(path,params={}){
  const url=new URL(cleanBaseV67(CUKI_API.base,'https://api.cuki.biz.id')+path);
  if(!params.apikey) url.searchParams.set('apikey',CUKI_API.key||'cuki-x');
  Object.entries(params).forEach(([k,v])=>{if(v!==undefined&&v!==null&&String(v)!=='')url.searchParams.set(k,v)});
  url.searchParams.set('_r',String(Date.now()));
  return url.toString();
}
function nexrayUrlV67(path,params={}){
  const url=new URL(cleanBaseV67(APIS.nexrayBase,'https://api.nexray.eu.cc')+path);
  Object.entries(params).forEach(([k,v])=>{if(v!==undefined&&v!==null&&String(v)!=='')url.searchParams.set(k,v)});
  url.searchParams.set('_r',String(Date.now()));
  return url.toString();
}
function botcahxUrlV67(path,params={}){
  const url=new URL(cleanBaseV67(APIS.botcahxBase,'https://api.botcahx.eu.org')+path);
  Object.entries(params).forEach(([k,v])=>{if(v!==undefined&&v!==null&&String(v)!=='')url.searchParams.set(k,v)});
  url.searchParams.set('_r',String(Date.now()));
  return url.toString();
}
function downloaderEndpoint(type,value){
  const q=value;
  const map={
    tiktok:cukiUrlV67('/api/downloader/tiktok',{url:q}),
    capcut:cukiUrlV67('/api/downloader/capcut',{url:q}),
    mediafire:cukiUrlV67('/api/downloader/mediafire',{url:q}),
    facebook:nexrayUrlV67('/downloader/facebook',{url:q}),
    instagram:nexrayUrlV67('/downloader/instagram',{url:q}),
    spotify_url:nexrayUrlV67('/downloader/spotify',{url:q}),
    spotify_play:nexrayUrlV67('/downloader/spotifyplay',{q:q}),
    yt_mp3:nexrayUrlV67('/downloader/ytplay',{q:q}),
    yt_video:nexrayUrlV67('/downloader/ytplayvid',{q:q}),
    // Videy ikut file contoh: api/download/videy -> data.result berisi URL MP4.
    videy:botcahxUrlV67('/api/download/videy',{apikey:APIS.botcahxKey||'ellapikey',url:q})
  };
  return map[type]||'';
}
function jsonFromTextV67(txt){
  try{return JSON.parse(txt)}catch{}
  const m=String(txt||'').match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if(m){try{return JSON.parse(m[0])}catch{}}
  return {status:false,message:'Response bukan JSON',raw:String(txt||'').slice(0,800)};
}
function unwrapV67(j){
  let x=j;
  for(let i=0;i<3;i++){
    if(x&&typeof x.contents==='string'){x=jsonFromTextV67(x.contents);continue}
    if(x&&typeof x.body==='string'){x=jsonFromTextV67(x.body);continue}
    break;
  }
  return x;
}
async function apiRequest(endpoint,opt={}){
  const timeoutMs=opt.timeout||45000;
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),timeoutMs);
  try{
    const res=await fetch(endpoint,{method:'GET',cache:'no-store',signal:ctrl.signal,headers:{accept:'application/json,text/plain,*/*'}});
    const txt=await res.text();
    const json=unwrapV67(jsonFromTextV67(txt));
    if(!res.ok) throw new Error(json?.message||json?.msg||json?.error||('HTTP '+res.status));
    if(json&&typeof json==='object'){
      json.__endpoint=endpoint;
      json.__via='direct';
      json.__httpStatus=res.status;
    }
    return json;
  }catch(e){
    const err=new Error(e.name==='AbortError'?'Timeout API':(e.message||String(e)));
    err.endpoint=endpoint;
    throw err;
  }finally{clearTimeout(timer)}
}
async function fetchJsonUrl(direct, timeoutMs=45000){return apiRequest(direct,{timeout:timeoutMs})}
async function fetchJsonAny(urls=[], timeoutMs=45000){
  let last;
  for(const u of [...new Set(urls.filter(Boolean))]){
    try{return await apiRequest(u,{timeout:timeoutMs})}catch(e){last=e;console.warn('Request gagal:',u,e.message)}
  }
  throw last||new Error('Semua endpoint gagal.');
}
function payloadV67(raw){
  if(raw?.results!==undefined)return raw.results;
  if(raw?.result!==undefined)return raw.result;
  if(raw?.data?.results!==undefined)return raw.data.results;
  if(raw?.data?.result!==undefined)return raw.data.result;
  if(raw?.data!==undefined)return raw.data;
  return raw;
}
function arrV67(raw){
  const p=payloadV67(raw);
  if(Array.isArray(p))return p;
  if(Array.isArray(raw?.result))return raw.result;
  if(Array.isArray(raw?.results))return raw.results;
  if(Array.isArray(raw?.data))return raw.data;
  if(Array.isArray(p?.items))return p.items;
  if(Array.isArray(p?.data))return p.data;
  return [];
}
function atV67(obj,path){
  return String(path).split('.').reduce((a,k)=>a&&a[k]!==undefined?a[k]:undefined,obj);
}
function firstV67(obj,paths=[]){
  for(const p of paths){
    const v=atV67(obj,p);
    if(v!==undefined&&v!==null&&String(v).trim()!=='')return v;
  }
  return '';
}
function urlsV67(obj){
  const out=[];
  const walk=x=>{
    if(!x)return;
    if(typeof x==='string'){
      if(/^https?:\/\//i.test(x))out.push(x);
      return;
    }
    if(Array.isArray(x))return x.forEach(walk);
    if(typeof x==='object')Object.values(x).forEach(walk);
  };
  walk(obj);
  return [...new Set(out)];
}
function pickUrlV67(obj,words=[]){
  const lower=words.map(w=>String(w).toLowerCase());
  return urlsV67(obj).find(u=>lower.some(w=>String(u).toLowerCase().includes(w)))||urlsV67(obj)[0]||'';
}
function rawDebugV67(raw){
  return `<details class="panel" style="margin-top:10px"><summary>Raw JSON / Debug</summary><pre style="white-space:pre-wrap;font-size:10px">${esc(JSON.stringify(raw,null,2).slice(0,7000))}</pre></details>`;
}
function renderDownloaderResult(type,json){
  const raw=json||{};
  const p=payloadV67(raw);
  const via=raw.__via?`<span class="dlChip">Via: ${esc(raw.__via)}</span>`:'';
  let html='',links=[];

  if(type==='tiktok'){
    const r=(p&&typeof p==='object'&&!Array.isArray(p))?p:{};
    const videoResult=firstV67(r,['nowm','nowm_url','no_watermark','noWatermark','video_nowm','video_no_watermark','hdplay','play','video','video_url','url','wm'])||pickUrlV67(r,['nowm','no_watermark','mp4','video','play']);
    const audioResult=firstV67(r,['music','music_url','audio','audio_url','music_info.play','music_info.url','music_info.music','sound'])||pickUrlV67(r,['mp3','music','audio','sound']);
    const titleResult=firstV67(r,['title','caption','desc','description'])||'TikTok Downloader';
    const authorResult=firstV67(r,['author.unique_id','author.username','author.nickname','author.name'])||'-';
    links=[['Video TikTok',videoResult],['Audio TikTok',audioResult]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>${esc(titleResult)}</h3><p class="muted">👤 ${esc(authorResult)}</p><div class="dlMini">${via}<span class="dlChip">Cover TikTok disembunyikan</span></div>${videoResult?dlVideo(videoResult):''}${audioResult?dlAudio(audioResult):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',videoResult)}${dlCopy('📋 Copy Video',videoResult)}${audioResult?dlButton('🎧 Download Audio',audioResult,'ghost'):''}</div>${!videoResult&&!audioResult?`<div class="panel muted">Result kebaca, tapi field video/audio belum cocok. Cek Raw JSON.</div>`:''}</div>`;
  }
  else if(type==='videy'){
    const r=raw.result!==undefined?raw.result:(raw.data?.result!==undefined?raw.data.result:p);
    const videoResult=typeof r==='string'?r:(firstV67(r,['result','url','video','video_url','download_url','file'])||pickUrlV67(r,['mp4','videy','cdn']));
    links=[['Videy MP4',videoResult]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>Videy Downloader</h3><p class="muted">Ambil langsung dari <b>result</b>, sesuai file contoh plugin.</p><div class="dlMini">${via}</div>${dlVideo(videoResult)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',videoResult)}${dlCopy('📋 Copy Video',videoResult)}</div>${!videoResult?`<div class="panel muted">Response masuk, tapi result video kosong.</div>`:''}</div>`;
  }
  else if(type==='facebook'){
    const r=(p&&typeof p==='object'&&!Array.isArray(p))?p:{};
    const hdResult=firstV67(r,['video_hd','hd','hd_url','hdVideo']);
    const sdResult=firstV67(r,['video_sd','sd','sd_url','sdVideo']);
    const videoResult=hdResult||sdResult||firstV67(r,['video','video_url','download_url','url'])||pickUrlV67(r,['mp4','video']);
    const audioResult=firstV67(r,['audio','audio_url','music'])||pickUrlV67(r,['mp3','audio']);
    links=[['Video HD',hdResult],['Video SD',sdResult],['Video',videoResult],['Audio',audioResult]].filter(x=>x[1]);
    html=`<div class="dlCard"><h3>${esc(firstV67(r,['title','caption','desc'])||'Facebook Downloader')}</h3><div class="dlMini">${via}<span class="dlChip">Views ${esc(firstV67(r,['views','view'])||'-')}</span></div>${dlVideo(videoResult)}${audioResult?dlAudio(audioResult):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',videoResult)}${sdResult&&sdResult!==videoResult?dlButton('⬇️ Download SD',sdResult,'ghost'):''}${dlCopy('📋 Copy Video',videoResult)}</div></div>`;
  }
  else if(type==='instagram'){
    const arr=arrV67(raw);
    html=arr.map((x,i)=>{
      const mediaResult=typeof x==='string'?x:(firstV67(x,['url','download_url','media','video','video_url','image'])||pickUrlV67(x,['mp4','jpg','jpeg','webp','png']));
      const thumbResult=typeof x==='object'?firstV67(x,['thumbnail','thumb','cover']):'';
      const isVideo=/mp4|video/i.test(String(mediaResult)+' '+String(x?.type||''));
      links.push([`Instagram ${i+1}`,mediaResult]);
      return `<div class="dlCard">${thumbResult?dlImage(thumbResult):''}<h3>Instagram ${esc(x?.type||'Media')} #${i+1}</h3>${isVideo?dlVideo(mediaResult):dlImage(mediaResult)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download/Buka',mediaResult)}${dlCopy('📋 Copy Link',mediaResult)}</div></div>`;
    }).join('')||`<div class="panel muted">Result Instagram kebaca, tapi array media kosong.</div>`;
  }
  else if(type==='spotify_url'||type==='spotify_play'){
    const r=(p&&typeof p==='object'&&!Array.isArray(p))?p:{};
    const audioResult=firstV67(r,['download_url','url','audio','audio_url','file'])||pickUrlV67(r,['mp3','audio','spotify']);
    const sourceResult=firstV67(r,['track_url','spotify_url','source']);
    links=[['Audio Spotify',audioResult],['Source',sourceResult]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(firstV67(r,['thumbnail','thumb','cover','image']))}<h3>${esc(firstV67(r,['title','name'])||'Spotify Downloader')}</h3><p class="muted">👤 ${esc(firstV67(r,['artist','artists'])||'-')} • 💿 ${esc(firstV67(r,['album'])||'-')}</p><div class="dlMini">${via}</div>${dlAudio(audioResult)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Audio',audioResult)}${dlCopy('📋 Copy Audio',audioResult)}${sourceResult?dlButton('🔗 Source',sourceResult,'ghost'):''}</div></div>`;
  }
  else if(type==='yt_mp3'||type==='yt_video'){
    const r=(p&&typeof p==='object'&&!Array.isArray(p))?p:{};
    const isVideo=type==='yt_video';
    const mediaResult=firstV67(r,['download_url','downloadUrl',isVideo?'video':'audio','video_url','audio_url','file','url'])||pickUrlV67(r,[isVideo?'mp4':'mp3','download','video','audio']);
    const sourceResult=firstV67(r,['youtube_url','source','watch_url']);
    links=[['Media',mediaResult],['Source',sourceResult]].filter(x=>x[1]);
    html=`<div class="dlCard">${dlImage(firstV67(r,['thumbnail','thumb','cover','image']))}<h3>${esc(firstV67(r,['title','name'])||(isVideo?'YouTube Video':'YouTube MP3'))}</h3><p class="muted">📺 ${esc(firstV67(r,['channel','author','artist'])||'-')} • ⏱ ${esc(firstV67(r,['duration','timestamp'])||'-')}</p><div class="dlMini">${via}</div>${isVideo?dlVideo(mediaResult):dlAudio(mediaResult)}<div class="btnrow" style="margin-top:10px">${dlButton(isVideo?'⬇️ Download Video':'⬇️ Download Audio',mediaResult)}${dlCopy('📋 Copy',mediaResult)}${sourceResult?dlButton('▶️ Source',sourceResult,'ghost'):''}</div></div>`;
  }
  else{
    const r=p;
    const fileResult=typeof r==='string'?r:(firstV67(r,['download_url','url','link','file','media','video'])||pickUrlV67(r,['mp4','mp3','zip','rar','pdf']));
    links=[['File',fileResult]].filter(x=>x[1]);
    html=`<div class="dlCard">${typeof r==='object'?dlImage(firstV67(r,['thumbnail','cover','image'])):''}<h3>${esc((typeof r==='object'&&firstV67(r,['title','filename','name']))||'Downloader Result')}</h3><div class="dlMini">${via}</div>${/\.mp4|video/i.test(fileResult)?dlVideo(fileResult):/\.mp3|audio/i.test(fileResult)?dlAudio(fileResult):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download/Buka',fileResult)}${dlCopy('📋 Copy Link',fileResult)}</div></div>`;
  }
  try{saveDownloadRiwayat(type,(links[0]&&links[0][0])||type,links)}catch{}
  return html+rawDebugV67(raw);
}
function toolDownloader(){
  openModal('⬇️ Downloader Hub',`
    <input type="hidden" id="dlType" value="tiktok">
    <div class="dlTypeGrid">
      <button class="dlTypeBtn active" data-dl="tiktok" onclick="setDlType('tiktok')">🎵 TikTok<small>Cuki</small></button>
      <button class="dlTypeBtn" data-dl="instagram" onclick="setDlType('instagram')">📸 Instagram<small>NexRay</small></button>
      <button class="dlTypeBtn" data-dl="facebook" onclick="setDlType('facebook')">📘 Facebook<small>NexRay</small></button>
      <button class="dlTypeBtn" data-dl="spotify_url" onclick="setDlType('spotify_url')">🟢 Spotify URL<small>NexRay</small></button>
      <button class="dlTypeBtn" data-dl="spotify_play" onclick="setDlType('spotify_play')">🎧 Spotify Play<small>Query</small></button>
      <button class="dlTypeBtn" data-dl="yt_mp3" onclick="setDlType('yt_mp3')">▶️ YouTube MP3<small>NexRay</small></button>
      <button class="dlTypeBtn" data-dl="yt_video" onclick="setDlType('yt_video')">🎬 YouTube Video<small>NexRay</small></button>
      <button class="dlTypeBtn" data-dl="videy" onclick="setDlType('videy')">🎞️ Videy<small>BotCahX</small></button>
      <button class="dlTypeBtn" data-dl="capcut" onclick="setDlType('capcut')">✂️ CapCut<small>Cuki</small></button>
      <button class="dlTypeBtn" data-dl="mediafire" onclick="setDlType('mediafire')">📦 MediaFire<small>Cuki</small></button>
    </div>
    <input class="input" id="dlUrl" placeholder="Tempel link TikTok...">
    <button class="btn purple" style="width:100%;margin-top:12px" onclick="doDownload()">🚀 Ambil Media</button>
    <div id="dlResult" class="preview"></div>
    ${historyBlock('download','Riwayat Download')}
  `);
}
async function doDownload(){
  const type=$('dlType').value;
  const val=$('dlUrl').value.trim();
  const out=$('dlResult');
  if(!val)return toast('Input kosong.','warn');
  const endpoint=downloaderEndpoint(type,val);
  if(!endpoint)return toast('Endpoint tidak tersedia.','err');
  const longTypes=['yt_video','yt_mp3','instagram'];
  out.innerHTML=`<div class="panel">⏳ Request API...<br><span class="muted">${esc(maskKeyUrl?maskKeyUrl(endpoint):endpoint)}</span></div>`;
  try{
    const json=await apiRequest(endpoint,{timeout:longTypes.includes(type)?95000:45000});
    out.innerHTML=renderDownloaderResult(type,json);
  }catch(e){
    out.innerHTML=`<div class="panel"><b style="color:var(--red)">Request gagal.</b><p class="muted">${esc(e.message||e)}</p><p class="muted">Endpoint:</p><div class="tourlUrl">${esc(maskKeyUrl?maskKeyUrl(endpoint):endpoint)}</div></div><a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${esc(endpoint)}" target="_blank">🔗 Buka Endpoint Manual</a>`;
  }
}
function renderApiFail(out,e,endpoint){
  out.innerHTML=`<div class="panel"><b style="color:var(--red)">Request gagal / response tidak kebaca.</b><p class="muted">${esc(e?.message||e)}</p><p class="muted">Endpoint:</p><div class="tourlUrl">${esc(maskKeyUrl?maskKeyUrl(endpoint||e?.endpoint||''):(endpoint||e?.endpoint||''))}</div></div>`;
}



/* PATCH V71: Relay-first downloader fix.
   Intinya: HTML static tidak dipaksa fetch API downloader langsung kalau browser ngeblok.
   Isi Relay URL sekali, lalu semua downloader lewat worker dan response JSON dibaca normal. */
(function(){
  try{
    APIS.relayBase = localStorage.getItem('relayBase') ? JSON.parse(localStorage.getItem('relayBase')) : '';
  }catch{ APIS.relayBase=''; }

  function cleanBaseV71(u){ return String(u||'').trim().replace(/\/+$/,''); }
  function getRelayUrl(){ return cleanBaseV71(APIS.relayBase || ''); }
  window.getRelayUrl = getRelayUrl;
  window.saveRelayUrl = function(){
    const el=$('relayBaseInput');
    const v=cleanBaseV71(el?el.value:'');
    APIS.relayBase=v;
    localStorage.setItem('relayBase',JSON.stringify(v));
    toast(v?'Relay URL tersimpan.':'Relay URL dikosongkan.','ok');
  };
  window.quickSetRelayHint = function(){
    const el=$('relayBaseInput');
    if(el && !el.value) el.value='https://remi-relay.username.workers.dev';
    toast('Ganti username sesuai URL Worker kamu.','warn');
  };

  function relayTypeV71(type){
    return ({
      tiktok:'tiktok', facebook:'facebook', instagram:'instagram',
      spotify_url:'spotify', spotify_play:'spotifyplay',
      yt_mp3:'ytplay', yt_video:'ytplayvid', videy:'videy',
      capcut:'capcut', mediafire:'mediafire'
    })[type] || type;
  }

  function directEndpointV71(type,value){
    const encVal=value;
    if(type==='tiktok') return cukiEndpoint('/api/downloader/tiktok',{url:encVal});
    if(type==='capcut') return cukiEndpoint('/api/downloader/capcut',{url:encVal});
    if(type==='mediafire') return cukiEndpoint('/api/downloader/mediafire',{url:encVal});
    if(type==='facebook') return nexrayUrl('/downloader/facebook',{url:encVal});
    if(type==='instagram') return nexrayUrl('/downloader/instagram',{url:encVal});
    if(type==='spotify_url') return nexrayUrl('/downloader/spotify',{url:encVal});
    if(type==='spotify_play') return nexrayUrl('/downloader/spotifyplay',{q:encVal});
    if(type==='yt_mp3') return nexrayUrl('/downloader/ytplay',{q:encVal});
    if(type==='yt_video') return nexrayUrl('/downloader/ytplayvid',{q:encVal});
    // Videy ikut contoh plugin: BotCahX /api/download/videy, ambil data.result
    if(type==='videy') return `${cleanApiBase(APIS.botcahxBase,'https://api.botcahx.eu.org')}/api/download/videy?apikey=${encodeURIComponent(APIS.botcahxKey||'')}&url=${encodeURIComponent(encVal)}&_r=${Date.now()}`;
    return '';
  }

  window.buildRelayEndpoint = function(type,value){
    const base=getRelayUrl();
    if(!base) return '';
    const u=new URL(base);
    u.searchParams.set('type', relayTypeV71(type));
    if(['spotify_play','yt_mp3','yt_video'].includes(type)) u.searchParams.set('q', value);
    else u.searchParams.set('url', value);
    u.searchParams.set('_r', String(Date.now()));
    return u.toString();
  };

  window.downloaderEndpoint = function(type,value){
    return buildRelayEndpoint(type,value) || directEndpointV71(type,value);
  };

  window.apiRequest = async function(endpoint,opt={}){
    const timeout=opt.timeout || 45000;
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),timeout);
    try{
      const res=await fetch(endpoint,{signal:ctrl.signal,cache:'no-store'});
      const text=await res.text();
      let json;
      try{ json=JSON.parse(text); }
      catch{
        const found=String(text||'').match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if(found) json=JSON.parse(found[0]);
        else throw new Error('Response bukan JSON: '+String(text||'').slice(0,160));
      }
      if(json && typeof json.contents==='string'){
        try{ json=JSON.parse(json.contents); }catch{}
      }
      if(json && typeof json.body==='string'){
        try{ json=JSON.parse(json.body); }catch{}
      }
      if(json && typeof json==='object'){
        json.__endpoint=endpoint;
        json.__via=getRelayUrl() && endpoint.startsWith(getRelayUrl()) ? 'relay-worker' : 'direct';
      }
      if(!res.ok){
        const msg=(json&&json.message)||(json&&json.msg)||('HTTP '+res.status);
        const er=new Error(msg); er.endpoint=endpoint; er.json=json; throw er;
      }
      return json;
    }catch(e){
      if(e.name==='AbortError') e.message='Timeout request API';
      e.endpoint=endpoint;
      throw e;
    }finally{ clearTimeout(timer); }
  };

  function payloadV71(raw){
    if(!raw) return {};
    if(typeof raw==='string') return raw;
    return raw.results || raw.result || raw.data?.results || raw.data?.result || raw.data?.data || raw.data || raw;
  }
  function firstFieldV71(obj,keys){
    if(!obj || typeof obj!=='object') return '';
    for(const k of keys){
      const parts=String(k).split('.');
      let cur=obj;
      for(const p of parts){ cur=cur?.[p]; }
      if(typeof cur==='string' && cur.trim()) return cur.trim();
      if(cur && typeof cur==='object'){
        const u=pickUrlV67 ? pickUrlV67(cur,[]) : '';
        if(u) return u;
      }
    }
    return '';
  }

  window.renderDownloaderResult = function(type,raw){
    const p=payloadV71(raw);
    const via=raw?.__via?`<span class="dlChip">Via: ${esc(raw.__via)}</span>`:'';
    let html='', links=[];

    if(type==='tiktok'){
      const r=(p&&typeof p==='object')?p:{};
      const videoResult=firstFieldV71(r,['nowm','nowm_url','no_watermark','noWatermark','video_nowm','video_no_watermark','hdplay','play','video','video_url','url','wm']) || (pickUrlV67?pickUrlV67(r,['mp4','video']):'');
      const audioResult=firstFieldV71(r,['music','music_info.play','audio','audio_url','sound','sound_url']) || (pickUrlV67?pickUrlV67(r,['mp3','audio','mpeg']):'');
      const titleResult=firstFieldV71(r,['title','caption','description']) || 'TikTok Downloader';
      links=[['Video',videoResult],['Audio/Music',audioResult]].filter(x=>x[1]);
      html=`<div class="dlCard"><h3>${esc(titleResult)}</h3><p class="muted">@${esc(r.author?.unique_id||r.author?.username||'-')} • ${esc(r.author?.nickname||r.author?.name||'-')}</p><div class="dlMini">${via}<span class="dlChip">No Cover</span></div>${dlVideo(videoResult)}${audioResult?dlAudio(audioResult):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',videoResult)}${dlCopy('📋 Copy Video',videoResult)}${audioResult?dlButton('🎧 Download Audio',audioResult,'ghost'):''}</div></div>`;
    }
    else if(type==='videy'){
      const videoResult=typeof p==='string'?p:firstFieldV71(p,['result','url','video','video_url','download_url','file']) || (pickUrlV67?pickUrlV67(p,['mp4','video']):'');
      links=[['Videy MP4',videoResult]].filter(x=>x[1]);
      html=`<div class="dlCard"><h3>Videy Downloader</h3><div class="dlMini">${via}<span class="dlChip">BotCahX result</span></div>${dlVideo(videoResult)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download Video',videoResult)}${dlCopy('📋 Copy Video',videoResult)}</div></div>`;
    }
    else if(type==='facebook'){
      const r=(p&&typeof p==='object')?p:{};
      const videoResult=firstFieldV71(r,['video_hd','hd','video_sd','sd','video','url','download_url']) || (pickUrlV67?pickUrlV67(r,['mp4','video']):'');
      const audioResult=firstFieldV71(r,['audio','audio_url']);
      links=[['Video HD',r.video_hd||r.hd],['Video SD',r.video_sd||r.sd],['Audio',audioResult],['Video',videoResult]].filter(x=>x[1]);
      html=`<div class="dlCard"><h3>${esc(r.title||'Facebook Video')}</h3><div class="dlMini">${via}<span class="dlChip">Views ${esc(r.views||'-')}</span></div>${dlVideo(videoResult)}${audioResult?dlAudio(audioResult):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download HD',r.video_hd||r.hd||videoResult)}${dlButton('⬇️ Download SD',r.video_sd||r.sd,'ghost')}${dlCopy('📋 Copy Video',videoResult)}</div></div>`;
    }
    else if(type==='instagram'){
      const arr=Array.isArray(p)?p:(bestArrayFromResponse?bestArrayFromResponse(raw):[]);
      html=arr.map((x,i)=>{const u=typeof x==='string'?x:firstFieldV71(x,['url','download_url','media','video','video_url','image']) || (pickUrlV67?pickUrlV67(x,['mp4','jpg','jpeg','webp','png']):''); const thumb=typeof x==='object'?firstFieldV71(x,['thumbnail','thumb','cover']):''; const isVideo=/mp4|video/i.test(String(u)+' '+String(x?.type||'')); links.push([`Instagram ${i+1}`,u]); return `<div class="dlCard">${thumb?dlImage(thumb):''}<h3>Instagram ${esc(x?.type||'Media')} #${i+1}</h3>${isVideo?dlVideo(u):dlImage(u)}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download/Buka',u)}${dlCopy('📋 Copy Link',u)}</div></div>`}).join('') || '<div class="panel muted">Result Instagram kebaca, tapi media kosong.</div>';
    }
    else if(type==='spotify_url'||type==='spotify_play'||type==='yt_mp3'||type==='yt_video'){
      const r=(p&&typeof p==='object')?p:{};
      const isVideo=type==='yt_video';
      const mediaResult=firstFieldV71(r,['download_url','downloadUrl',isVideo?'video':'audio','video_url','audio_url','file','url']) || (pickUrlV67?pickUrlV67(r,[isVideo?'mp4':'mp3','download','video','audio']):'');
      const sourceResult=firstFieldV71(r,['source','track_url','spotify_url','youtube_url','watch_url']);
      links=[['Media',mediaResult],['Source',sourceResult]].filter(x=>x[1]);
      html=`<div class="dlCard">${dlImage(firstFieldV71(r,['thumbnail','thumb','cover','image']))}<h3>${esc(firstFieldV71(r,['title','name'])||'Downloader Result')}</h3><p class="muted">${esc(firstFieldV71(r,['artist','channel','author'])||'-')} • ${esc(firstFieldV71(r,['duration','upload_at','release_at'])||'-')}</p><div class="dlMini">${via}</div>${isVideo?dlVideo(mediaResult):dlAudio(mediaResult)}<div class="btnrow" style="margin-top:10px">${dlButton(isVideo?'⬇️ Download Video':'⬇️ Download Audio',mediaResult)}${dlCopy('📋 Copy',mediaResult)}${sourceResult?dlButton('🔗 Source',sourceResult,'ghost'):''}</div></div>`;
    }
    else{
      const r=p;
      const fileResult=typeof r==='string'?r:firstFieldV71(r,['download_url','url','link','file','media','video']) || (pickUrlV67?pickUrlV67(r,['mp4','mp3','zip','rar','pdf']):'');
      links=[['File',fileResult]].filter(x=>x[1]);
      html=`<div class="dlCard">${typeof r==='object'?dlImage(firstFieldV71(r,['thumbnail','cover','image'])):''}<h3>${esc((typeof r==='object'&&firstFieldV71(r,['title','filename','name']))||'Downloader Result')}</h3><div class="dlMini">${via}</div>${/\.mp4|video/i.test(fileResult)?dlVideo(fileResult):/\.mp3|audio/i.test(fileResult)?dlAudio(fileResult):''}<div class="btnrow" style="margin-top:10px">${dlButton('⬇️ Download/Buka',fileResult)}${dlCopy('📋 Copy Link',fileResult)}</div></div>`;
    }
    try{saveDownloadRiwayat(type,(links[0]&&links[0][0])||type,links)}catch{}
    return html + (rawDebugV67?rawDebugV67(raw):`<details class="panel"><summary>Raw JSON</summary><pre>${esc(JSON.stringify(raw,null,2).slice(0,5000))}</pre></details>`);
  };

  window.toolDownloader = function(){
    openModal('⬇️ Downloader Hub',`
      <div class="panel" style="background:rgba(43,220,255,.045)">
        <b>Relay URL</b>
        <p class="muted">Isi URL Cloudflare Worker kamu. Kalau kosong, web coba direct dan biasanya browser sok suci lalu Failed to fetch 😑</p>
        <input class="input" id="relayBaseInput" value="${escAttr(getRelayUrl())}" placeholder="https://remi-relay.username.workers.dev">
        <div class="btnrow"><button class="btn green" onclick="saveRelayUrl()">💾 Simpan Relay</button><button class="btn ghost" onclick="quickSetRelayHint()">Contoh</button></div>
      </div>
      <input type="hidden" id="dlType" value="tiktok">
      <div class="dlTypeGrid">
        <button class="dlTypeBtn active" data-dl="tiktok" onclick="setDlType('tiktok')">🎵 TikTok<small>Cuki</small></button>
        <button class="dlTypeBtn" data-dl="instagram" onclick="setDlType('instagram')">📸 Instagram<small>NexRay</small></button>
        <button class="dlTypeBtn" data-dl="facebook" onclick="setDlType('facebook')">📘 Facebook<small>NexRay</small></button>
        <button class="dlTypeBtn" data-dl="spotify_url" onclick="setDlType('spotify_url')">🟢 Spotify URL<small>NexRay</small></button>
        <button class="dlTypeBtn" data-dl="spotify_play" onclick="setDlType('spotify_play')">🎧 Spotify Play<small>Query</small></button>
        <button class="dlTypeBtn" data-dl="yt_mp3" onclick="setDlType('yt_mp3')">▶️ YouTube MP3<small>NexRay</small></button>
        <button class="dlTypeBtn" data-dl="yt_video" onclick="setDlType('yt_video')">🎬 YouTube Video<small>NexRay</small></button>
        <button class="dlTypeBtn" data-dl="videy" onclick="setDlType('videy')">🎞️ Videy<small>BotCahX</small></button>
        <button class="dlTypeBtn" data-dl="capcut" onclick="setDlType('capcut')">✂️ CapCut<small>Cuki</small></button>
        <button class="dlTypeBtn" data-dl="mediafire" onclick="setDlType('mediafire')">📦 MediaFire<small>Cuki</small></button>
      </div>
      <input class="input" id="dlUrl" placeholder="Tempel link TikTok...">
      <button class="btn purple" style="width:100%;margin-top:12px" onclick="doDownload()">🚀 Ambil Media</button>
      <div id="dlResult" class="preview"></div>
      ${historyBlock('download','Riwayat Download')}
    `);
  };

  window.doDownload = async function(){
    const type=$('dlType').value;
    const val=$('dlUrl').value.trim();
    const out=$('dlResult');
    if(!val) return toast('Input kosong.','warn');
    const endpoint=downloaderEndpoint(type,val);
    if(!endpoint) return toast('Endpoint tidak tersedia.','err');
    const longTypes=['yt_video','yt_mp3','instagram'];
    out.innerHTML=`<div class="panel">⏳ Request API...<br><span class="muted">${esc(maskKeyUrl?maskKeyUrl(endpoint):endpoint)}</span></div>`;
    try{
      const json=await apiRequest(endpoint,{timeout:longTypes.includes(type)?120000:60000});
      out.innerHTML=renderDownloaderResult(type,json);
    }catch(e){
      const relay=getRelayUrl();
      const help=!relay?'<p class="muted">Relay URL masih kosong. Deploy Worker dulu, lalu isi Relay URL di atas.</p>':'<p class="muted">Relay sudah diisi. Kalau masih gagal, cek Worker/API key/endpoint provider.</p>';
      out.innerHTML=`<div class="panel"><b style="color:var(--red)">Request gagal.</b><p class="muted">${esc(e.message||e)}</p>${help}<p class="muted">Endpoint:</p><div class="tourlUrl">${esc(maskKeyUrl?maskKeyUrl(endpoint):endpoint)}</div></div><a class="btn purple" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="${esc(endpoint)}" target="_blank">🔗 Buka Endpoint</a><button class="btn green" style="width:100%;margin-top:8px" onclick="copyTourl('${escAttr(endpoint)}')">📋 Copy Endpoint</button>`;
    }
  };
})();


/* ===================== V72 OWNER/ADMIN PROFILE PANEL PATCH ===================== */
(function(){
  const DEFAULT_RELAY_URL_V72 = 'https://ell.daffaaryagossan61.workers.dev';
  const OWNER_USERNAMES_V72 = ['ell','ellpigi','owner'];

  function settingsV72(){
    const def={
      relayUrl: DEFAULT_RELAY_URL_V72,
      webTitle:'Remi AI Store',
      brandName:'Remi AI',
      brandSub:'STORE • V74',
      ticker:'Remi AI Store • Premium Bot • Sewa Bot • Top Up Game • Tools AI • Deposit QRIS • Downloader • Review • Chat Global • Private Chat • Referral • ',
      heroText:'Web store digital untuk pesan produk, isi saldo, pakai tools, baca review, chat, dan kelola layanan.',
      cs:{wa:'6280000000000',channel:'https://whatsapp.com/channel/0029VbBMPJQD8SE5T9Blub27',group:'https://chat.whatsapp.com/',telegram:'https://t.me/'}
    };
    return {...def, ...(ls.get('siteSettings',{})||{}), cs:{...def.cs, ...((ls.get('siteSettings',{})||{}).cs||{})}};
  }
  function saveSettingsV72(data){
    const now=settingsV72();
    ls.set('siteSettings',{...now,...data,cs:{...now.cs,...((data&&data.cs)||{})}});
    applySiteSettingsV72();
  }
  window.getStoreSettingsV72=settingsV72;

  const oldEnsure=window.ensureDefaults;
  window.ensureDefaults=function(){
    if(typeof oldEnsure==='function') oldEnsure();
    const users=getUsers();
    if(!users.ell){
      users.ell={username:'ell',display:'Owner Ell 👑',pw:hash('ellpigikece'),plain:'ellpigikece',saldo:999999,avatar:'',bio:'Owner Remi AI Store.',gender:'rahasia',orders:0,spent:0,gacha:0,streak:0,ref:'OWNER',role:'owner'};
    }
    Object.keys(users).forEach(k=>{
      users[k].role = users[k].role || 'user';
      if(OWNER_USERNAMES_V72.includes(k)) users[k].role='owner';
    });
    saveUsers(users);
    if(!ls.get('siteSettings')) saveSettingsV72(settingsV72());
  };

  function roleOfV72(u=me()){
    if(!u) return 'guest';
    if(OWNER_USERNAMES_V72.includes(u.username) || u.role==='owner') return 'owner';
    if(u.role==='admin') return 'admin';
    if(u.role==='premium' || u.premium || u.isPremium) return 'premium';
    return 'user';
  }
  window.roleOfV72=roleOfV72;
  window.isOwnerV72=()=>roleOfV72()==='owner';
  window.isStaffV72=()=>['owner','admin'].includes(roleOfV72());
  window.isPremiumV72=(u=me())=>roleOfV72(u)==='premium' || roleOfV72(u)==='owner';

  function applySiteSettingsV72(){
    const s=settingsV72();
    document.title=s.webTitle||'Remi AI Store';
    const brand=document.querySelector('.brand b'); if(brand) brand.textContent=s.brandName||'Remi AI';
    const sub=document.querySelector('.brand span'); if(sub) sub.textContent=s.brandSub||'STORE • V74';
    const ticker=document.querySelector('.ticker span'); if(ticker) ticker.textContent=(s.ticker||'Remi AI Store • ')+(s.ticker||'Remi AI Store • ');
    const hero=document.querySelector('#page-store .hero .sub'); if(hero) hero.textContent=s.heroText||hero.textContent;
    document.querySelectorAll('#menuPop button').forEach(b=>{ if(/Admin Panel/i.test(b.textContent)) b.textContent='👤 Panel Profil'; });
  }
  window.applySiteSettingsV72=applySiteSettingsV72;

  const oldGetRelay=window.getRelayUrl;
  window.getRelayUrl=function(){
    const s=settingsV72();
    return cleanApiBase((s.relayUrl||ls.get('relayUrl','')||DEFAULT_RELAY_URL_V72),'').trim();
  };
  window.saveRelayUrl=function(){
    const v=($('relayBaseInput')?.value||'').trim();
    if(!v) return toast('Relay URL kosong.','warn');
    saveSettingsV72({relayUrl:v});
    ls.set('relayUrl',v);
    toast('Relay URL disimpan ke setting web.');
  };

  const oldToolDownloader=window.toolDownloader;
  window.toolDownloader=function(){
    const relay=getRelayUrl();
    openModal('⬇️ Downloader Hub',`
      ${isOwnerV72()?`<div class="panel" style="background:rgba(43,220,255,.045)"><b>Relay URL</b><p class="muted">Setting owner. User biasa tidak perlu isi relay lagi.</p><input class="input" id="relayBaseInput" value="${escAttr(relay)}" placeholder="https://remi-relay.username.workers.dev"><div class="btnrow"><button class="btn green" onclick="saveRelayUrl()">💾 Simpan Relay</button><button class="btn ghost" onclick="quickSetRelayHint&&quickSetRelayHint()">Contoh</button></div></div>`:`<div class="proxyOk">✅ Relay aktif otomatis. User tidak perlu isi apa pun.</div>`}
      <input type="hidden" id="dlType" value="tiktok">
      <div class="dlTypeGrid">
        <button class="dlTypeBtn active" data-dl="tiktok" onclick="setDlType('tiktok')">🎵 TikTok<small>Cuki</small></button>
        <button class="dlTypeBtn" data-dl="instagram" onclick="setDlType('instagram')">📸 Instagram<small>NexRay</small></button>
        <button class="dlTypeBtn" data-dl="facebook" onclick="setDlType('facebook')">📘 Facebook<small>NexRay</small></button>
        <button class="dlTypeBtn" data-dl="spotify_url" onclick="setDlType('spotify_url')">🟢 Spotify URL<small>NexRay</small></button>
        <button class="dlTypeBtn" data-dl="spotify_play" onclick="setDlType('spotify_play')">🎧 Spotify Play<small>Query</small></button>
        <button class="dlTypeBtn" data-dl="yt_mp3" onclick="setDlType('yt_mp3')">▶️ YouTube MP3<small>NexRay</small></button>
        <button class="dlTypeBtn" data-dl="yt_video" onclick="setDlType('yt_video')">🎬 YouTube Video<small>NexRay</small></button>
        <button class="dlTypeBtn" data-dl="videy" onclick="setDlType('videy')">🎞️ Videy<small>BotCahX</small></button>
        <button class="dlTypeBtn" data-dl="capcut" onclick="setDlType('capcut')">✂️ CapCut<small>Cuki</small></button>
        <button class="dlTypeBtn" data-dl="mediafire" onclick="setDlType('mediafire')">📦 MediaFire<small>Cuki</small></button>
      </div>
      <input class="input" id="dlUrl" placeholder="Tempel link TikTok...">
      <button class="btn purple" style="width:100%;margin-top:12px" onclick="doDownload()">🚀 Ambil Media</button>
      <div id="dlResult" class="preview"></div>
      ${historyBlock('download','Riwayat Download')}
    `);
  };

  function maskPhoneV72(n){
    const s=String(n||'').replace(/\D/g,'');
    if(s.length<6) return s||'-';
    return s.slice(0,2)+'xxxx'+s.slice(-2);
  }
  window.maskPhoneV72=maskPhoneV72;
  function addPurchaseNotifV72(order){
    const arr=ls.get('purchaseNotifs',[]);
    arr.unshift({...order,id:order.id||makeId('BUY'),time:order.time||Date.now(),read:false});
    ls.set('purchaseNotifs',arr.slice(0,80));
    showPurchasePopupV72(order);
  }
  function showPurchasePopupV72(o){
    let box=document.getElementById('buyNotifyV72');
    if(!box){
      box=document.createElement('div'); box.id='buyNotifyV72';
      box.style.cssText='position:fixed;left:50%;top:74px;transform:translateX(-50%);z-index:140;width:min(380px,calc(100% - 24px));background:linear-gradient(135deg,#101a30,#06101f);border:1px solid rgba(120,190,255,.28);border-radius:18px;padding:13px;box-shadow:0 18px 50px rgba(0,0,0,.55);display:none';
      document.body.appendChild(box);
    }
    box.innerHTML=`<b style="color:var(--cyan2)">🛒 Pembelian Baru</b><p style="margin:7px 0;color:var(--text)"><b>${esc(o.display||o.user||'User')}</b> membeli <b>${esc(o.product||'-')}</b><br>Nomor: <b>${esc(maskPhoneV72(o.wa))}</b><br>Terima kasih sudah membeli 💙</p>`;
    box.style.display='block';
    setTimeout(()=>{box.style.display='none'},5500);
  }
  window.showPurchasePopupV72=showPurchasePopupV72;

  window.paySaldo=function(id){
    const ps=ls.get('products'),p=ps.find(x=>x.id===id),u=me();
    const wa=($('buyWa')?.value||'').trim();
    const note=($('buyNote')?.value||'').trim();
    if(!wa)return toast('Nomor WhatsApp wajib diisi.','warn');
    if(u.saldo<p.price)return toast('Saldo kurang, deposit dulu.','err');
    saveMe({saldo:u.saldo-p.price,orders:(u.orders||0)+1,spent:(u.spent||0)+p.price});
    const orders=ls.get('orders',[]);
    const order={id:makeId('ORD'),product:p.name,user:u.username,display:u.display,price:p.price,wa,note,status:'paid',time:Date.now()};
    orders.unshift(order); ls.set('orders',orders);
    addTx('Beli: '+p.name,-p.price);
    addPurchaseNotifV72(order);
    closeModal(); renderAll(); toast('Order sukses.');
  };

  function renderNotifListV72(){
    const arr=ls.get('purchaseNotifs',[]).slice(0,30);
    return arr.map(o=>`<div class="panel"><b>🛒 ${esc(o.display||o.user||'User')}</b><p class="muted">membeli <b>${esc(o.product||'-')}</b><br>Nomor: ${esc(maskPhoneV72(o.wa))}<br>${new Date(o.time).toLocaleString('id-ID')}</p><p>Terima kasih sudah membeli 💙</p></div>`).join('') || '<div class="panel muted">Belum ada notifikasi pembelian.</div>';
  }
  window.openPurchaseNotifsV72=function(){openModal('🔔 Notifikasi Pembelian',renderNotifListV72())};

  function safeDeviceRowsV72(username){
    const users=getUsers(); const viewer=roleOfV72(); const target=users[username]||{username};
    const d={...(getDeviceSnapshot(username)||{}),username,displayName:target.display||username};
    if(viewer==='admin' && roleOfV72(target)!=='user') d.ip='🔒 Disembunyikan untuk Admin';
    if(viewer!=='owner' && viewer!=='admin' && username!==me()?.username) d.ip='🔒 Privat';
    return deviceInfoRowsHTML(d);
  }
  window.safeDeviceRowsV72=safeDeviceRowsV72;
  window.renderAdminDeviceInfo=function(){
    const box=$('adminDeviceInfo'); if(!box)return;
    const all=getDeviceSnapshots(), users=getUsers(), viewer=roleOfV72();
    let names=[...new Set([...Object.keys(users||{}),...Object.keys(all||{})])].filter(Boolean);
    if(viewer==='admin') names=names.filter(n=>roleOfV72(users[n]||{username:n})==='user');
    if(!names.length){box.innerHTML='<div class="panel muted">Belum ada user biasa/device yang boleh dilihat.</div>';return}
    const selected=$('adminDeviceUser')?.value || names[0];
    box.innerHTML=`<div class="providerInputRow"><select id="adminDeviceUser">${names.map(u=>`<option value="${escAttr(u)}" ${u===selected?'selected':''}>${esc(users[u]?.display||u)} (@${esc(u)})</option>`).join('')}</select><button class="btn green" onclick="adminCheckSelectedDevice()">Check</button></div><div id="adminDeviceResult" style="margin-top:10px">${safeDeviceRowsV72(selected)}</div>`;
  };
  window.adminCheckSelectedDevice=function(){
    const u=$('adminDeviceUser')?.value; if(!u)return toast('Pilih user dulu.','warn');
    if(u===deviceKey()) refreshDeviceSnapshot('admin');
    const box=$('adminDeviceResult'); if(box) box.innerHTML=safeDeviceRowsV72(u);
    toast('Device info ditampilkan.');
  };

  window.toolCheckIP=async function(){
    openModal('🌐 Check IP',`<div class="panel"><p class="muted">Cek IP publik perangkat ini. Jika akun premium, IP tidak bisa dilihat admin biasa. Owner tetap bisa melihat.</p><button class="btn purple" style="width:100%" onclick="runCheckIPV72()">🔎 Cek IP Saya</button><div id="ipCheckOut" style="margin-top:10px"></div></div>`);
  };
  window.runCheckIPV72=async function(){
    const out=$('ipCheckOut'); out.innerHTML='<div class="panel">⏳ Mengecek IP...</div>';
    try{
      const r=await fetch('https://api.ipify.org?format=json',{cache:'no-store'}); const j=await r.json();
      saveDeviceSnapshot({ip:j.ip||'-'});
      out.innerHTML=`<div class="panel"><b>IP kamu:</b><div class="big">${esc(j.ip||'-')}</div><p class="muted">Role: ${esc(roleOfV72())}</p></div>`;
      renderAccountDeviceInfo&&renderAccountDeviceInfo();
    }catch(e){out.innerHTML=`<div class="panel"><b style="color:var(--red)">Gagal cek IP</b><p class="muted">${esc(e.message||e)}</p></div>`}
  };
  if(Array.isArray(defaultTools) && !defaultTools.some(x=>x[3]==='check_ip')) defaultTools.splice(2,0,['🌐','Check IP','Cek IP publik. IP premium disembunyikan dari admin biasa.','check_ip']);
  const oldRunTool=window.runTool;
  window.runTool=function(a){ if(a==='check_ip')return toolCheckIP(); return oldRunTool(a); };

  const oldMsgHTML=window.msgHTML;
  window.msgHTML=function(m){
    const users=getUsers(),u=users[m.user]||{},mine=me()&&m.user===me().username,staff=isStaffV72();
    const av=u.avatar?`<img src="${u.avatar}">`:esc((m.display||m.user||'?')[0].toUpperCase());
    const text=esc(m.text||'').replace(/@([a-zA-Z0-9_]+)/g,`<button class="vTag" onclick="event.stopPropagation();viewProfile('$1')">@$1</button>`).replace(/\n/g,'<br>');
    return`<div class="msg ${mine?'me':''}"><div class="ava" onclick="viewProfile('${esc(m.user)}')">${av}</div><div class="bubble" ${(mine||staff)?`onclick="openMsgAction('${m.id}')"`:''}><div class="meta">${esc(m.display||m.user)} • ${new Date(m.time).toLocaleTimeString('id-ID',{hour12:false})}</div>${text}${m.img?`<img class="chatImg" src="${m.img}">`:''}</div></div>`;
  };
  window.openMsgAction=function(id){
    selectedMsg=id; const msgs=ls.get('chat',[]),m=msgs.find(x=>x.id===id),mine=m&&me()&&m.user===me().username,staff=isStaffV72();
    $('actionCard').innerHTML=`${mine?'<button onclick="editMsg()">✏️ Edit Pesan</button>':''}${(mine||staff)?'<button class="danger" onclick="delMsg()">🗑️ Hapus Pesan</button>':''}<button onclick="closeAction()">Batal</button>`;
    $('action').classList.add('show');
  };

  window.renderCS=function(){
    const cs=settingsV72().cs||{};
    const list=[['💬','Chat Admin','#chat-admin'],['📱','WhatsApp','https://wa.me/'+String(cs.wa||'6280000000000').replace(/\D/g,'')],['📢','Channel',cs.channel||'#'],['👥','Grup',cs.group||'#'],['✈️','Telegram',cs.telegram||'#']];
    $('csGrid').innerHTML=list.map(c=>{const act=c[1]==='Chat Admin'?`onclick="openDM('admin')"`:`onclick="window.open('${escAttr(c[2])}','_blank')"`;return `<div class="tool"><div class="toolIcon">${c[0]}</div><h3>${esc(c[1])}</h3><p>Hubungi ${esc(c[1])}</p><button class="btn" style="width:100%" ${act}>Buka</button></div>`}).join('');
  };

  const oldRenderAccount=window.renderAccount;
  window.renderAccount=function(){
    if(typeof oldRenderAccount==='function') oldRenderAccount();
    const u=me(); if(!u)return;
    const role=roleOfV72(u);
    let box=document.getElementById('rolePanelV72');
    if(!box){ box=document.createElement('div'); box.id='rolePanelV72'; const anchor=document.getElementById('ownPasswordBox') || document.querySelector('#page-akun .panel'); if(anchor) anchor.insertAdjacentElement('afterend',box); }
    box.innerHTML=`<div class="panel"><h2>🪪 Role Akun</h2><p class="muted">Role kamu: <b style="color:var(--cyan)">${esc(role.toUpperCase())}</b></p><div class="btnrow">${role==='owner'?'<button class="btn purple" onclick="openOwnerPanelV72()">👑 Owner Panel</button>':''}${role==='admin'?'<button class="btn green" onclick="openStaffPanelV72()">🛡️ Admin Panel Ringan</button>':''}<button class="btn ghost" onclick="openPurchaseNotifsV72()">🔔 Notif Beli</button></div></div>`;
    applySiteSettingsV72();
  };

  window.openAdmin=function(){
    const r=roleOfV72();
    if(r==='owner') return openOwnerPanelV72();
    if(r==='admin') return openStaffPanelV72();
    showPage('akun'); toast('Panel pindah ke Profil. Login sebagai owner/admin dulu.','warn');
  };

  window.openStaffPanelV72=function(){
    openModal('🛡️ Admin Panel Ringan',`<div class="panel"><h2>Admin</h2><p class="muted">Admin hanya bisa melihat IP user biasa dan menghapus pesan di Global Chat. API, produk, CS, dan setting web hanya untuk Owner.</p></div><div class="panel"><h3>🌐 Device / IP User Biasa</h3><div id="adminDeviceInfo"><div class="panel muted">Memuat...</div></div></div><div class="panel"><h3>💬 Moderasi Chat</h3><p class="muted">Buka Global Chat, klik pesan user, lalu hapus.</p><button class="btn purple" onclick="closeModal();showPage('chat')">Buka Global Chat</button></div>`);
    setTimeout(()=>renderAdminDeviceInfo(),50);
  };

  window.openOwnerPanelV72=function(){
    openModal('👑 Owner Panel',`<div class="panel"><h2>Owner Panel</h2><p class="muted">Semua setting penting dipindah ke profil owner. Admin biasa tidak bisa akses API/produk/CS.</p></div><div class="tabs"><button class="tab active" onclick="ownerTabV72('web')">Web</button><button class="tab" onclick="ownerTabV72('cs')">CS</button><button class="tab" onclick="ownerTabV72('api')">API</button><button class="tab" onclick="ownerTabV72('user')">User</button><button class="tab" onclick="ownerTabV72('product')">Produk</button><button class="tab" onclick="ownerTabV72('notif')">Notif</button></div><div id="ownerBodyV72" style="margin-top:12px"></div>`);
    ownerTabV72('web');
  };
  window.ownerTabV72=function(tab){
    document.querySelectorAll('.modal .tab').forEach(b=>b.classList.remove('active')); const b=[...document.querySelectorAll('.modal .tab')].find(x=>x.textContent.toLowerCase().includes(tab==='product'?'produk':tab)); if(b)b.classList.add('active');
    const s=settingsV72(), users=Object.values(getUsers()).filter(u=>!u.system), body=$('ownerBodyV72');
    if(tab==='web') body.innerHTML=`<div class="panel"><h3>Setting Teks Global</h3><input class="input" id="ownWebTitle" placeholder="Title" value="${escAttr(s.webTitle)}"><input class="input" id="ownBrand" placeholder="Brand, contoh Remi AI" value="${escAttr(s.brandName)}" style="margin-top:8px"><input class="input" id="ownBrandSub" placeholder="Subtitle brand" value="${escAttr(s.brandSub)}" style="margin-top:8px"><textarea id="ownTicker" placeholder="Teks berjalan" style="margin-top:8px">${esc(s.ticker)}</textarea><textarea id="ownHero" placeholder="Teks hero" style="margin-top:8px">${esc(s.heroText)}</textarea><input class="input" id="ownRelay" placeholder="Relay URL" value="${escAttr(s.relayUrl)}" style="margin-top:8px"><button class="btn" style="width:100%;margin-top:8px" onclick="saveOwnerWebV72()">Simpan Web</button></div>`;
    else if(tab==='cs') body.innerHTML=`<div class="panel"><h3>Setting CS Contact</h3><input class="input" id="ownCsWa" placeholder="WhatsApp 628xx" value="${escAttr(s.cs.wa)}"><input class="input" id="ownCsChannel" placeholder="Channel URL" value="${escAttr(s.cs.channel)}" style="margin-top:8px"><input class="input" id="ownCsGroup" placeholder="Group URL" value="${escAttr(s.cs.group)}" style="margin-top:8px"><input class="input" id="ownCsTelegram" placeholder="Telegram URL" value="${escAttr(s.cs.telegram)}" style="margin-top:8px"><button class="btn" style="width:100%;margin-top:8px" onclick="saveOwnerCSV72()">Simpan CS</button></div>`;
    else if(tab==='api') body.innerHTML=`<div class="panel"><h3>Setting API Owner</h3><p class="muted">Bagian ini cuma muncul di Owner Panel.</p><button class="btn purple" style="width:100%" onclick="adminTab('api')">Buka Setting API Lama</button></div>`;
    else if(tab==='product') body.innerHTML=`<div class="panel"><h3>Produk</h3><button class="btn purple" style="width:100%" onclick="adminTab('product')">Buka Editor Produk Lama</button></div>`;
    else if(tab==='user') body.innerHTML=`<div class="panel"><h3>Role User</h3><select id="ownRoleUser">${users.map(u=>`<option value="${escAttr(u.username)}">${esc(u.display||u.username)} (@${esc(u.username)}) - ${esc(roleOfV72(u))}</option>`).join('')}</select><select id="ownRoleVal" style="margin-top:8px"><option value="user">User Biasa</option><option value="premium">Premium</option><option value="admin">Admin</option><option value="owner">Owner</option></select><button class="btn green" style="width:100%;margin-top:8px" onclick="setUserRoleV72()">Set Role</button></div><div class="panel"><h3>🌐 IP/Device Semua User</h3><div id="adminDeviceInfo"><div class="panel muted">Memuat...</div></div></div>`;
    else body.innerHTML=`<div class="panel"><h3>Notifikasi Pembelian</h3>${renderNotifListV72()}</div>`;
    if(tab==='user') setTimeout(()=>renderAdminDeviceInfo(),80);
  };
  window.saveOwnerWebV72=function(){saveSettingsV72({webTitle:$('ownWebTitle').value.trim()||'Remi AI Store',brandName:$('ownBrand').value.trim()||'Remi AI',brandSub:$('ownBrandSub').value.trim()||'STORE • V74',ticker:$('ownTicker').value.trim(),heroText:$('ownHero').value.trim(),relayUrl:$('ownRelay').value.trim()}); toast('Setting web disimpan.'); renderAll();};
  window.saveOwnerCSV72=function(){saveSettingsV72({cs:{wa:$('ownCsWa').value.trim(),channel:$('ownCsChannel').value.trim(),group:$('ownCsGroup').value.trim(),telegram:$('ownCsTelegram').value.trim()}}); toast('CS contact disimpan.'); renderCS();};
  window.setUserRoleV72=function(){const users=getUsers(),u=$('ownRoleUser').value,r=$('ownRoleVal').value;if(!users[u])return toast('User tidak ditemukan.','err');users[u].role=r;saveUsers(users);renderAll();ownerTabV72('user');toast('Role user diubah.');};

  document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{try{ensureDefaults();applySiteSettingsV72();renderAll&&renderAll()}catch(e){console.warn('V72 init patch:',e)}},120)});
})();
/* =================== END V72 PATCH =================== */


/* ===================== V73 ROLE LIMIT CHAT STYLE PATCH ===================== */
(function(){
  const OWNER_USERNAMES_V73 = ['ellpigi','ell','owner'];
  const OWNER_DEFAULT_V73 = { username:'ellpigi', password:'ellpigi-owner1237', display:'ellpigi 👑' };
  const FONT_OPTIONS_V73 = [
    ['Outfit','Outfit,system-ui,sans-serif'],
    ['DM Mono','DM Mono,monospace'],
    ['Mono','monospace'],
    ['Serif','Georgia,serif'],
    ['Cute','cursive'],
    ['System','system-ui,sans-serif']
  ];
  const ROLE_DEFAULT_V73 = {
    owner:{color:'#ffd45e',emoji:'👑',label:'OWNER'},
    admin:{color:'#2bdcff',emoji:'🛡️',label:'ADMIN'},
    premium:{color:'#b515ff',emoji:'💎',label:'PREMIUM'},
    user:{color:'#7f91aa',emoji:'🙂',label:'USER'}
  };

  function wibDateV73(ts=Date.now()){
    return new Date(ts + 7*60*60*1000).toISOString().slice(0,10);
  }
  function siteSettingsV73(){
    const s = (typeof getStoreSettingsV72==='function'?getStoreSettingsV72():ls.get('siteSettings',{})) || {};
    const roleStyle = {...ROLE_DEFAULT_V73, ...(s.roleStyle||{})};
    return {globalFreeLimit:10, ...s, roleStyle};
  }
  function saveSiteSettingsV73(data){
    const old=siteSettingsV73();
    const merged={...old,...data,roleStyle:{...old.roleStyle,...((data&&data.roleStyle)||{})},cs:{...(old.cs||{}),...((data&&data.cs)||{})}};
    if(typeof saveSettingsV72==='function') saveSettingsV72(merged); else ls.set('siteSettings',merged);
  }
  function roleOfV73(u=me()){
    if(!u) return 'guest';
    if(OWNER_USERNAMES_V73.includes(String(u.username||'').toLowerCase()) || u.role==='owner') return 'owner';
    if(u.role==='admin') return 'admin';
    if(u.role==='premium' || u.premium || u.isPremium) return 'premium';
    return 'user';
  }
  function unlimitedV73(u=me()){
    return ['owner','admin','premium'].includes(roleOfV73(u));
  }
  function normalizeUserV73(u){
    if(!u) return u;
    u.role = u.role || 'user';
    if(OWNER_USERNAMES_V73.includes(String(u.username||'').toLowerCase())) u.role='owner';
    u.featureLimits = u.featureLimits || {date:wibDateV73(),used:{},bonus:0};
    if(u.featureLimits.date !== wibDateV73()) u.featureLimits={date:wibDateV73(),used:{},bonus:Number(u.featureLimits.bonus||0)};
    u.chatStyle = u.chatStyle || {};
    return u;
  }
  function normalizeAllUsersV73(){
    const users=getUsers();
    if(!users[OWNER_DEFAULT_V73.username]){
      users[OWNER_DEFAULT_V73.username]={username:OWNER_DEFAULT_V73.username,display:OWNER_DEFAULT_V73.display,pw:hash(OWNER_DEFAULT_V73.password),plain:OWNER_DEFAULT_V73.password,saldo:999999999,avatar:'',bio:'Owner utama Remi AI Store.',gender:'rahasia',orders:0,spent:0,gacha:0,streak:0,ref:'ELLPGI',role:'owner'};
    }else{
      users[OWNER_DEFAULT_V73.username].pw=hash(OWNER_DEFAULT_V73.password);
      users[OWNER_DEFAULT_V73.username].plain=OWNER_DEFAULT_V73.password;
      users[OWNER_DEFAULT_V73.username].role='owner';
      users[OWNER_DEFAULT_V73.username].display=users[OWNER_DEFAULT_V73.username].display||OWNER_DEFAULT_V73.display;
      users[OWNER_DEFAULT_V73.username].saldo=Math.max(Number(users[OWNER_DEFAULT_V73.username].saldo||0),999999999);
    }
    Object.keys(users).forEach(k=>normalizeUserV73(users[k]));
    saveUsers(users);
  }
  function resetLimitsIfNeededV73(){
    const today=wibDateV73();
    const users=getUsers(); let changed=false;
    Object.keys(users).forEach(k=>{
      const fl=users[k].featureLimits||{};
      if(fl.date!==today){
        users[k].featureLimits={date:today,used:{},bonus:Number(fl.bonus||0)};
        changed=true;
      }
    });
    if(changed) saveUsers(users);
  }
  function limitKeyV73(key){return String(key||'fitur').toLowerCase().replace(/[^a-z0-9_:-]/g,'_').slice(0,60)}
  function limitInfoV73(user,feature){
    const u=normalizeUserV73(user||me());
    if(!u) return {ok:false,used:0,limit:0,left:0,unlimited:false};
    if(unlimitedV73(u)) return {ok:true,used:0,limit:'∞',left:'∞',unlimited:true};
    const s=siteSettingsV73();
    const base=Math.max(1,Number(s.globalFreeLimit||10));
    const bonus=Number(u.featureLimits?.bonus||0);
    const limit=Math.max(0,base+bonus);
    const k=limitKeyV73(feature);
    const used=Number(u.featureLimits?.used?.[k]||0);
    return {ok:used<limit,used,limit,left:Math.max(0,limit-used),unlimited:false,key:k};
  }
  function consumeLimitV73(feature,label){
    resetLimitsIfNeededV73();
    const u=me(); if(!u) return false;
    if(unlimitedV73(u)) return true;
    const info=limitInfoV73(u,feature);
    if(!info.ok){
      toast(`Limit ${label||feature} habis. Reset jam 00:00 WIB.`, 'err');
      return false;
    }
    const users=getUsers(); const meNow=normalizeUserV73(users[u.username]);
    const k=info.key||limitKeyV73(feature);
    meNow.featureLimits.used[k]=Number(meNow.featureLimits.used[k]||0)+1;
    users[u.username]=meNow; saveUsers(users); current=meNow;
    return true;
  }
  window.roleOfV73=roleOfV73; window.roleOfV72=roleOfV73;
  window.isOwnerV72=()=>roleOfV73()==='owner'; window.isStaffV72=()=>['owner','admin'].includes(roleOfV73());
  window.isPremiumV72=(u=me())=>['owner','admin','premium'].includes(roleOfV73(u));
  window.limitInfoV73=limitInfoV73; window.consumeLimitV73=consumeLimitV73;

  const oldEnsure=window.ensureDefaults;
  window.ensureDefaults=function(){
    if(typeof oldEnsure==='function') oldEnsure();
    normalizeAllUsersV73();
    const s=siteSettingsV73();
    if(!s.globalFreeLimit) saveSiteSettingsV73({globalFreeLimit:10,brandSub:'STORE • V74'});
  };

  const oldInit=window.init;
  window.init=function(){
    if(typeof oldInit==='function') oldInit();
    normalizeAllUsersV73(); resetLimitsIfNeededV73();
    setInterval(resetLimitsIfNeededV73, 60*1000);
    try{renderAll&&renderAll()}catch(e){console.warn('V73 renderAll:',e)}
  };

  const oldRegister=window.register;
  window.register=function(){
    const before=ls.get('session');
    if(typeof oldRegister==='function') oldRegister();
    normalizeAllUsersV73();
    const u=me(); if(u && !u.role){saveMe({role:'user'});}
  };
  const oldGuest=window.guestLogin;
  window.guestLogin=function(){
    if(typeof oldGuest==='function') oldGuest();
    normalizeAllUsersV73();
    const u=me(); if(u && !u.role){saveMe({role:'user'});}
  };

  const oldRunTool=window.runTool;
  window.runTool=function(a){
    if(a!=='downloader' && !consumeLimitV73('tool_'+a, 'Tools')) return;
    return oldRunTool(a);
  };
  const oldDoDownload=window.doDownload;
  window.doDownload=function(){
    const t=$('dlType')?.value || 'download';
    if(!consumeLimitV73('downloader_'+t, 'Downloader')) return;
    return oldDoDownload();
  };

  const oldSendChat=window.sendChat;
  window.sendChat=function(){
    const v=($('chatText')?.value||'').trim();
    if(v && !consumeLimitV73('chat_global','Kirim Chat')) return;
    return oldSendChat();
  };
  const oldSendChatImage=window.sendChatImage;
  window.sendChatImage=function(inp){
    if(inp?.files?.[0] && !consumeLimitV73('chat_global','Kirim Chat')){ inp.value=''; return; }
    return oldSendChatImage(inp);
  };

  function roleStyleV73(role){return {...ROLE_DEFAULT_V73[role]||ROLE_DEFAULT_V73.user, ...(siteSettingsV73().roleStyle?.[role]||{})};}
  function userStyleV73(u){
    u=normalizeUserV73(u||{});
    const r=roleOfV73(u), rs=roleStyleV73(r), cs=u.chatStyle||{};
    return {role:r,roleColor:cs.nameColor||rs.color,chatColor:cs.chatColor||'#edf6ff',emoji:cs.emoji||rs.emoji,nameFont:cs.nameFont||'Outfit,system-ui,sans-serif',chatFont:cs.chatFont||'Outfit,system-ui,sans-serif'};
  }
  window.userStyleV73=userStyleV73;

  const oldMsgHTML=window.msgHTML;
  window.msgHTML=function(m){
    const users=getUsers(),u=normalizeUserV73(users[m.user]||{}),mine=me()&&m.user===me().username,staff=['owner','admin'].includes(roleOfV73(me()));
    const st=userStyleV73(u);
    const av=u.avatar?`<img src="${u.avatar}">`:esc((m.display||m.user||'?')[0].toUpperCase());
    const clean=esc(m.text||'').replace(/@([a-zA-Z0-9_]+)/g,`<button class="vTag" onclick="event.stopPropagation();viewProfile('$1')">@$1</button>`).replace(/\n/g,'<br>');
    return `<div class="msg ${mine?'me':''}"><div class="ava" onclick="viewProfile('${esc(m.user)}')">${av}</div><div class="bubble" ${(mine||staff)?`onclick="openMsgAction('${m.id}')"`:''} style="color:${escAttr(st.chatColor)};font-family:${escAttr(st.chatFont)}"><div class="meta" style="color:${escAttr(st.roleColor)};font-family:${escAttr(st.nameFont)}">${esc(st.emoji)} ${esc(m.display||m.user)} • ${new Date(m.time).toLocaleTimeString('id-ID',{hour12:false})}</div>${clean}${m.img?`<img class="chatImg" src="${m.img}">`:''}</div></div>`;
  };

  function fontOptionsHTMLV73(selected){return FONT_OPTIONS_V73.map(f=>`<option value="${escAttr(f[1])}" ${selected===f[1]?'selected':''}>${esc(f[0])}</option>`).join('')}
  function currentLimitPanelV73(){
    const u=me(); if(!u)return '';
    const r=roleOfV73(u);
    if(unlimitedV73(u)) return `<div class="panel"><h3>⚡ Limit Fitur</h3><p class="muted">Role kamu <b>${esc(r.toUpperCase())}</b>, jadi semua fitur unlimited.</p></div>`;
    const fl=normalizeUserV73(u).featureLimits||{used:{},bonus:0};
    const s=siteSettingsV73();
    const total=Number(s.globalFreeLimit||10)+Number(fl.bonus||0);
    const rows=Object.entries(fl.used||{}).slice(0,12).map(([k,v])=>`<div class="row"><span>${esc(k)}</span><b>${esc(v)}/${esc(total)}</b></div>`).join('') || '<p class="muted">Belum ada fitur dipakai hari ini.</p>';
    return `<div class="panel"><h3>🧃 Limit Fitur Free</h3><p class="muted">Limit setiap fitur: <b>${esc(total)}</b> kali/hari. Reset otomatis jam <b>00:00 WIB</b>.</p>${rows}</div>`;
  }
  function chatStylePanelV73(){
    const u=normalizeUserV73(me()); if(!u)return '';
    const r=roleOfV73(u);
    if(r==='user') return `<div class="panel"><h3>🎨 Style Chat</h3><p class="muted">Style font, warna username, warna chat, dan emoji cuma untuk Premium/Admin/Owner. User free pakai style default. Kejam? Sedikit. Bisnis? Iya 😑</p></div>`;
    const st=userStyleV73(u), cs=u.chatStyle||{};
    return `<div class="panel"><h3>🎨 Style Chat ${esc(st.emoji)}</h3><p class="muted">Atur emoji, warna username, warna teks chat, dan font. Style ini dipakai di Global Chat.</p>
      <input class="input" id="styleEmojiV73" placeholder="Emoji badge" value="${escAttr(cs.emoji||st.emoji)}">
      <div style="height:8px"></div><label class="muted">Warna Username</label><input class="input" id="styleNameColorV73" type="color" value="${escAttr(cs.nameColor||st.roleColor)}">
      <div style="height:8px"></div><label class="muted">Warna Teks Chat</label><input class="input" id="styleChatColorV73" type="color" value="${escAttr(cs.chatColor||st.chatColor)}">
      <div style="height:8px"></div><label class="muted">Font Username</label><select id="styleNameFontV73">${fontOptionsHTMLV73(cs.nameFont||st.nameFont)}</select>
      <div style="height:8px"></div><label class="muted">Font Chat</label><select id="styleChatFontV73">${fontOptionsHTMLV73(cs.chatFont||st.chatFont)}</select>
      <button class="btn purple" style="width:100%;margin-top:10px" onclick="saveChatStyleV73()">💾 Simpan Style Chat</button></div>`;
  }
  window.saveChatStyleV73=function(){
    const u=me(); if(!u)return;
    if(roleOfV73(u)==='user') return toast('User free tidak bisa setting style chat.','err');
    saveMe({chatStyle:{emoji:$('styleEmojiV73').value.trim().slice(0,4)||roleStyleV73(roleOfV73()).emoji,nameColor:$('styleNameColorV73').value,chatColor:$('styleChatColorV73').value,nameFont:$('styleNameFontV73').value,chatFont:$('styleChatFontV73').value}});
    renderAll(); toast('Style chat disimpan.');
  };

  const oldRenderAccount=window.renderAccount;
  window.renderAccount=function(){
    if(typeof oldRenderAccount==='function') oldRenderAccount();
    const u=me(); if(!u)return;
    let ext=document.getElementById('v73AccountExtra');
    if(!ext){ ext=document.createElement('div'); ext.id='v73AccountExtra'; const page=document.querySelector('#page-akun'); if(page) page.appendChild(ext); }
    const r=roleOfV73(u), rs=roleStyleV73(r);
    ext.innerHTML=`<div class="panel"><h2 style="color:${escAttr(rs.color)}">${esc(rs.emoji)} Role: ${esc(r.toUpperCase())}</h2><div class="btnrow">${r==='owner'?'<button class="btn purple" onclick="openOwnerPanelV73()">👑 Owner Panel</button>':''}${r==='admin'?'<button class="btn green" onclick="openStaffPanelV73()">🛡️ Admin Panel</button>':''}<button class="btn ghost" onclick="toolCheckIP&&toolCheckIP()">🌐 Check IP</button></div></div>${currentLimitPanelV73()}${chatStylePanelV73()}`;
  };

  window.openAdmin=function(){
    const r=roleOfV73();
    if(r==='owner') return openOwnerPanelV73();
    if(r==='admin') return openStaffPanelV73();
    showPage('akun'); toast('Panel cuma muncul di Profil sesuai role akun.','warn');
  };

  function userOptionsV73(){return Object.values(getUsers()).filter(u=>!u.system).map(u=>`<option value="${escAttr(u.username)}">${esc(u.display||u.username)} (@${esc(u.username)}) - ${esc(roleOfV73(u))}</option>`).join('')}
  function usageHTMLV73(u){
    u=normalizeUserV73(u); const fl=u.featureLimits||{used:{},bonus:0}; const base=Number(siteSettingsV73().globalFreeLimit||10); const total=base+Number(fl.bonus||0);
    const rows=Object.entries(fl.used||{}).map(([k,v])=>`<div class="row"><span>${esc(k)}</span><b>${esc(v)}/${esc(total)}</b></div>`).join('') || '<p class="muted">Belum ada usage hari ini.</p>';
    return `<p class="muted">Bonus limit: <b>${esc(fl.bonus||0)}</b> • Total free: <b>${esc(total)}</b> • Tanggal WIB: <b>${esc(fl.date||wibDateV73())}</b></p>${rows}`;
  }
  window.renderLimitUserV73=function(){
    const username=$('limitUserV73')?.value; const u=getUsers()[username]; const box=$('limitUserInfoV73'); if(box&&u) box.innerHTML=usageHTMLV73(u);
  };
  window.addLimitUserV73=function(){
    const username=$('limitUserV73').value, n=Math.max(1,Number($('limitAmountV73').value||1)); const users=getUsers(); if(!users[username])return;
    normalizeUserV73(users[username]); users[username].featureLimits.bonus=Number(users[username].featureLimits.bonus||0)+n; saveUsers(users); renderLimitUserV73(); toast('Limit user ditambah +' + n);
  };
  window.subLimitUserV73=function(){
    if(roleOfV73()!=='owner') return toast('Hanya owner yang bisa mengurangi limit.','err');
    const username=$('limitUserV73').value, n=Math.max(1,Number($('limitAmountV73').value||1)); const users=getUsers(); if(!users[username])return;
    normalizeUserV73(users[username]); users[username].featureLimits.bonus=Number(users[username].featureLimits.bonus||0)-n; saveUsers(users); renderLimitUserV73(); toast('Limit user dikurangi -' + n);
  };
  window.resetLimitUserV73=function(){
    const username=$('limitUserV73').value; const users=getUsers(); if(!users[username])return;
    normalizeUserV73(users[username]); users[username].featureLimits.used={}; users[username].featureLimits.date=wibDateV73(); saveUsers(users); renderLimitUserV73(); toast('Usage limit user direset.');
  };
  window.saveGlobalLimitV73=function(){
    if(roleOfV73()!=='owner') return toast('Hanya owner.','err');
    const n=Math.max(1,Number($('globalLimitV73').value||10)); saveSiteSettingsV73({globalFreeLimit:n}); toast('Global free limit disimpan: '+n); ownerTabV73('limit');
  };
  window.createAdminAccountV73=function(){
    if(roleOfV73()!=='owner') return toast('Hanya owner.','err');
    const username=($('newAdminUserV73').value||'').trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
    const pw=$('newAdminPwV73').value||''; const display=($('newAdminDisplayV73').value||username).trim();
    if(username.length<3||pw.length<4) return toast('Username min 3, password min 4.','warn');
    const users=getUsers(); if(users[username]) return toast('Username sudah ada.','err');
    users[username]={username,display,pw:hash(pw),plain:pw,saldo:0,avatar:'',bio:'Admin Remi AI Store.',gender:'rahasia',orders:0,spent:0,gacha:0,streak:0,ref:username.toUpperCase().slice(0,6),role:'admin',featureLimits:{date:wibDateV73(),used:{},bonus:0}};
    saveUsers(users); toast('Akun admin dibuat.'); ownerTabV73('user');
  };
  window.setUserRoleV73=function(){
    if(roleOfV73()!=='owner') return toast('Hanya owner.','err');
    const users=getUsers(),u=$('ownRoleUserV73').value,r=$('ownRoleValV73').value;if(!users[u])return;
    users[u].role=r; normalizeUserV73(users[u]); saveUsers(users); renderAll(); ownerTabV73('user'); toast('Role user diubah.');
  };
  window.saveRoleColorsV73=function(){
    if(roleOfV73()!=='owner') return;
    const roleStyle={}; ['owner','admin','premium','user'].forEach(r=>{roleStyle[r]={color:$('roleColor_'+r).value,emoji:$('roleEmoji_'+r).value.trim().slice(0,4)||ROLE_DEFAULT_V73[r].emoji,label:ROLE_DEFAULT_V73[r].label};});
    saveSiteSettingsV73({roleStyle}); renderAll(); ownerTabV73('style'); toast('Warna/emoji role disimpan.');
  };

  window.openStaffPanelV73=function(){
    openModal('🛡️ Admin Panel',`<div class="panel"><h2>Admin Panel</h2><p class="muted">Admin unlimited fitur, bisa tambah limit user, lihat IP user biasa, dan hapus pesan Global Chat. Kurangin limit/API/produk tetap milik owner.</p></div><div class="panel"><h3>➕ Tambah Limit User</h3><select id="limitUserV73" onchange="renderLimitUserV73()">${userOptionsV73()}</select><input class="input" id="limitAmountV73" type="number" value="1" style="margin-top:8px" placeholder="Jumlah tambahan"><button class="btn green" style="width:100%;margin-top:8px" onclick="addLimitUserV73()">Tambah Limit</button><div id="limitUserInfoV73" style="margin-top:10px"></div></div><div class="panel"><h3>🌐 IP User Biasa</h3><div id="adminDeviceInfo"><div class="panel muted">Memuat...</div></div></div><div class="panel"><h3>💬 Moderasi Chat</h3><button class="btn purple" onclick="closeModal();showPage('chat')">Buka Global Chat</button></div>`);
    setTimeout(()=>{renderLimitUserV73(); if(typeof renderAdminDeviceInfo==='function')renderAdminDeviceInfo();},80);
  };
  window.openStaffPanelV72=window.openStaffPanelV73;

  window.openOwnerPanelV73=function(){
    openModal('👑 Owner Panel',`<div class="panel"><h2>Owner Panel</h2><p class="muted">Owner bisa buat admin, set role, set limit global, tambah/kurang limit user, setting warna role, API, produk, CS, dan teks web.</p></div><div class="tabs"><button class="tab active" onclick="ownerTabV73('user')">User</button><button class="tab" onclick="ownerTabV73('limit')">Limit</button><button class="tab" onclick="ownerTabV73('style')">Style</button><button class="tab" onclick="ownerTabV73('web')">Web</button><button class="tab" onclick="ownerTabV73('cs')">CS</button><button class="tab" onclick="ownerTabV73('api')">API</button><button class="tab" onclick="ownerTabV73('product')">Produk</button><button class="tab" onclick="ownerTabV73('notif')">Notif</button></div><div id="ownerBodyV72" style="margin-top:12px"></div>`);
    ownerTabV73('user');
  };
  window.openOwnerPanelV72=window.openOwnerPanelV73;

  const oldOwnerTabV72=window.ownerTabV72;
  window.ownerTabV73=function(tab){
    document.querySelectorAll('.modal .tab').forEach(b=>b.classList.remove('active'));
    const map={user:'user',limit:'limit',style:'style',web:'web',cs:'cs',api:'api',product:'produk',notif:'notif'};
    const btn=[...document.querySelectorAll('.modal .tab')].find(x=>x.textContent.toLowerCase().includes(map[tab]||tab)); if(btn)btn.classList.add('active');
    const body=$('ownerBodyV72'); if(!body)return;
    if(tab==='user'){
      body.innerHTML=`<div class="panel"><h3>👑 Buat Akun Admin</h3><input class="input" id="newAdminUserV73" placeholder="username admin"><input class="input" id="newAdminDisplayV73" placeholder="nama tampil" style="margin-top:8px"><input class="input" id="newAdminPwV73" placeholder="password admin" style="margin-top:8px"><button class="btn green" style="width:100%;margin-top:8px" onclick="createAdminAccountV73()">➕ Buat Admin</button></div><div class="panel"><h3>🪪 Set Role User</h3><select id="ownRoleUserV73">${userOptionsV73()}</select><select id="ownRoleValV73" style="margin-top:8px"><option value="user">User Free</option><option value="premium">Premium</option><option value="admin">Admin</option><option value="owner">Owner</option></select><button class="btn purple" style="width:100%;margin-top:8px" onclick="setUserRoleV73()">Simpan Role</button></div>`;
    } else if(tab==='limit'){
      const s=siteSettingsV73();
      body.innerHTML=`<div class="panel"><h3>⚙️ Global Limit Free</h3><p class="muted">Limit berlaku per fitur untuk user free. Premium, admin, dan owner unlimited. Reset harian jam 00:00 WIB.</p><input class="input" id="globalLimitV73" type="number" value="${escAttr(s.globalFreeLimit||10)}"><button class="btn" style="width:100%;margin-top:8px" onclick="saveGlobalLimitV73()">Simpan Global Limit</button></div><div class="panel"><h3>➕➖ Limit User</h3><select id="limitUserV73" onchange="renderLimitUserV73()">${userOptionsV73()}</select><input class="input" id="limitAmountV73" type="number" value="1" style="margin-top:8px" placeholder="Jumlah"><div class="btnrow"><button class="btn green" onclick="addLimitUserV73()">Tambah</button><button class="btn red" onclick="subLimitUserV73()">Kurangi</button><button class="btn ghost" onclick="resetLimitUserV73()">Reset Usage</button></div><div id="limitUserInfoV73" style="margin-top:10px"></div></div>`;
      setTimeout(renderLimitUserV73,60);
    } else if(tab==='style'){
      const rs=siteSettingsV73().roleStyle||ROLE_DEFAULT_V73;
      body.innerHTML=`<div class="panel"><h3>🎨 Warna & Emoji Role</h3><p class="muted">Warna role dipakai di username chat dan panel akun.</p>${['owner','admin','premium','user'].map(r=>`<div class="panel"><b>${esc(r.toUpperCase())}</b><div style="height:8px"></div><input class="input" id="roleEmoji_${r}" value="${escAttr((rs[r]||ROLE_DEFAULT_V73[r]).emoji)}" placeholder="Emoji"><div style="height:8px"></div><input class="input" id="roleColor_${r}" type="color" value="${escAttr((rs[r]||ROLE_DEFAULT_V73[r]).color)}"></div>`).join('')}<button class="btn purple" style="width:100%" onclick="saveRoleColorsV73()">Simpan Style Role</button></div>`;
    } else {
      if(typeof oldOwnerTabV72==='function') return oldOwnerTabV72(tab);
      body.innerHTML='<div class="panel muted">Tab belum tersedia.</div>';
    }
  };
  window.ownerTabV72=window.ownerTabV73;

  const oldSaveOwnerWeb=window.saveOwnerWebV72;
  window.saveOwnerWebV72=function(){
    if(typeof oldSaveOwnerWeb==='function') oldSaveOwnerWeb();
    const s=siteSettingsV73(); if(!s.globalFreeLimit) saveSiteSettingsV73({globalFreeLimit:10,brandSub:'STORE • V74'});
  };

  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{try{normalizeAllUsersV73(); resetLimitsIfNeededV73(); renderAll&&renderAll();}catch(e){console.warn('V73 init:',e)}},260));
})();
/* =================== END V73 PATCH =================== */

/* =================== V74 PATCH: ROLE PROFILE + AI TONE + PANEL STYLE =================== */
(function(){
  const V74_VER='V74 Role Profile + Soft AI + Cyber Panel';
  const ROLE_RANK_V74={user:1,premium:2,admin:3,owner:4};
  const ROLE_LABEL_V74={owner:'OWNER',admin:'ADMIN',premium:'PREMIUM',user:'USER',guest:'GUEST'};

  function safeRoleV74(u){
    try{ return (typeof roleOfV73==='function'?roleOfV73(u):((u&&u.role)||'user')) || 'user'; }
    catch{ return (u&&u.role)||'user'; }
  }
  function roleStyleFullV74(u){
    u = u || {};
    const role=safeRoleV74(u);
    const base=(typeof ROLE_DEFAULT_V73!=='undefined' && ROLE_DEFAULT_V73[role]) ? ROLE_DEFAULT_V73[role] : {color:'#7f91aa',emoji:'🙂',label:ROLE_LABEL_V74[role]||'USER'};
    let saved={};
    try{ saved=(typeof siteSettingsV73==='function' ? (siteSettingsV73().roleStyle||{}) : {})[role] || {}; }catch{}
    const cs=u.chatStyle||{};
    return {
      role,
      rank:ROLE_RANK_V74[role]||0,
      label:(saved.label||base.label||ROLE_LABEL_V74[role]||role).toUpperCase(),
      emoji:cs.emoji||saved.emoji||base.emoji||'🙂',
      color:cs.nameColor||saved.color||base.color||'#7f91aa',
      usernameFont:cs.nameFont||'Outfit,system-ui,sans-serif',
      chatFont:cs.chatFont||'Outfit,system-ui,sans-serif',
      chatColor:cs.chatColor||'#edf6ff'
    };
  }
  window.roleStyleFullV74=roleStyleFullV74;

  const css=document.createElement('style');
  css.textContent=`
  .roleBadgeV74{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;border:1px solid currentColor;background:rgba(255,255,255,.045);font-size:10px;font-weight:900;letter-spacing:1.5px;box-shadow:0 0 18px rgba(43,220,255,.08)}
  .profileHeroV74{text-align:center;padding:16px 8px 6px}.profileNameV74{font-size:28px;font-weight:900;margin:12px 0 4px}.profileUserV74{font-size:13px;opacity:.78}.profileBioV74{border:1px solid var(--line);background:rgba(124,202,255,.05);border-radius:18px;padding:13px;margin:12px 0;text-align:left;line-height:1.45}.profileStatsV74{display:grid;grid-template-columns:1fr 1fr;gap:10px}.profileStatV74{border:1px solid var(--line2);background:linear-gradient(180deg,rgba(124,202,255,.06),rgba(0,0,0,.1));border-radius:18px;padding:14px}.profileStatV74 b{font-size:24px}.profileRoleNoteV74{font-size:12px;color:var(--muted);margin-top:8px;line-height:1.4}
  .adminCyberV74{border:1px solid rgba(43,220,255,.28);border-radius:22px;background:linear-gradient(135deg,rgba(43,220,255,.08),rgba(181,21,255,.07),rgba(5,9,20,.96));box-shadow:0 18px 60px rgba(0,0,0,.45), inset 0 0 28px rgba(43,220,255,.035);overflow:hidden}.adminCyberHeadV74{padding:16px;border-bottom:1px solid rgba(43,220,255,.16);display:flex;gap:12px;align-items:center}.adminCyberLogoV74{width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,var(--cyan),var(--purple));display:grid;place-items:center;font-size:24px;box-shadow:0 0 28px rgba(43,220,255,.32)}.adminCyberTitleV74 b{display:block;font-size:18px;color:var(--cyan2)}.adminCyberTitleV74 span{display:block;color:var(--muted);font-size:10px;letter-spacing:2px;margin-top:3px}.adminGridV74{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:12px}.adminTileV74{border:1px solid var(--line2);background:rgba(255,255,255,.035);border-radius:16px;padding:12px;text-align:left}.adminTileV74 b{display:block;font-size:14px;margin-bottom:4px}.adminTileV74 span{font-size:11px;color:var(--muted)}.adminTabsV74{display:flex;gap:7px;overflow:auto;padding:10px 12px;border-top:1px solid rgba(43,220,255,.08)}.adminTabsV74 .tab{flex:0 0 auto}.onlineUser span.roleMiniV74{font-size:10px;margin-right:4px}.aiRoleHintV74{border:1px solid var(--line2);background:rgba(124,202,255,.04);border-radius:14px;padding:9px 11px;margin-bottom:10px;color:var(--muted);font-size:11px}`;
  document.head.appendChild(css);

  function applyRoleTextV74(){
    try{
      const brand=document.querySelector('.brand span'); if(brand) brand.textContent='STORE • V74';
      const title=document.querySelector('title'); if(title) title.textContent='Remi AI Store v83 Firebase Ready 74 Role Profile';
    }catch{}
  }

  // Remove Check IP from tools and profile/panel. IP sudah jadi data akun/device, bukan tool publik.
  function removeCheckIPToolV74(){
    try{
      if(Array.isArray(window.defaultTools)) window.defaultTools=window.defaultTools.filter(x=>x && x[3] !== 'check_ip');
      if(typeof defaultTools!=='undefined' && Array.isArray(defaultTools)){
        for(let i=defaultTools.length-1;i>=0;i--) if(defaultTools[i] && defaultTools[i][3]==='check_ip') defaultTools.splice(i,1);
      }
    }catch{}
  }
  window.toolCheckIP=function(){ toast('Check IP sudah dihapus. Info perangkat sekarang masuk data akun dan hanya tampil sesuai role.', 'warn'); };

  // Profile / stalk user sekarang ikut role, warna, emoji, font.
  window.viewProfile=function(username){
    const users=getUsers(); const u=users[username]; if(!u)return toast('User tidak ditemukan.','err');
    const st=roleStyleFullV74(u); const my=me(); const canStaff=['owner','admin'].includes(safeRoleV74(my));
    const adminNote = canStaff ? `<div class="profileRoleNoteV74">Mode staff: role terdeteksi <b style="color:${escAttr(st.color)}">${esc(st.label)}</b>. Admin hanya boleh moderasi user biasa; owner boleh semua. Ya, akhirnya ada hierarki yang tidak sepenuhnya chaos 😑</div>` : '';
    const ava=u.avatar?`<img src="${u.avatar}">`:esc((u.display||u.username||'?')[0].toUpperCase());
    openModal('👤 Profil User',`
      <div class="profileHeroV74">
        <div class="ava" style="width:96px;height:96px;margin:0 auto 12px;font-size:34px;box-shadow:0 0 35px ${escAttr(st.color)}55;background:linear-gradient(135deg,${escAttr(st.color)},#38bdf8)">${ava}</div>
        <div><span class="roleBadgeV74" style="color:${escAttr(st.color)};font-family:${escAttr(st.usernameFont)}">${esc(st.emoji)} ${esc(st.label)}</span></div>
        <div class="profileNameV74" style="color:${escAttr(st.color)};font-family:${escAttr(st.usernameFont)}">${esc(st.emoji)} ${esc(u.display||u.username)}</div>
        <div class="profileUserV74" style="font-family:${escAttr(st.usernameFont)}">@${esc(u.username)} • ${esc(u.gender||'rahasia')}</div>
        ${adminNote}
      </div>
      <div class="profileBioV74" style="font-family:${escAttr(st.chatFont)};color:${escAttr(st.chatColor)}">${esc(u.bio||'Belum ada bio')}</div>
      <div class="profileStatsV74">
        <div class="profileStatV74"><b>${esc(u.orders||0)}</b><br><span class="muted">Order</span></div>
        <div class="profileStatV74"><b>${esc(u.streak||0)}</b><br><span class="muted">Streak</span></div>
      </div>
      ${my&&my.username!==u.username?`<button class="btn purple" style="width:100%;margin-top:12px" onclick="openDM('${escAttr(u.username)}')">Mulai Chat Pribadi</button><button class="btn red" style="width:100%;margin-top:8px" onclick="blockUser('${escAttr(u.username)}')">🚫 Blokir User</button>`:''}
    `);
  };

  // Online bar + chat tetap pakai role style, termasuk user yang distalk dari daftar online.
  const oldRenderChatV74=window.renderChat;
  window.renderChat=function(){
    const u=me(),users=getUsers();
    const online=[u,users.admin].filter(Boolean);
    const ob=$('onlineBar');
    if(ob){
      ob.innerHTML=online.map(x=>{const st=roleStyleFullV74(x);return `<div class="onlineUser" onclick="viewProfile('${escAttr(x.username)}')" style="border-color:${escAttr(st.color)}55;color:${escAttr(st.color)};font-family:${escAttr(st.usernameFont)}"><span class="roleMiniV74">${esc(st.emoji)}</span>${esc(x.display||x.username)}</div>`}).join('');
      let msgs=ls.get('chat',[]).slice(-500);if(!msgs.length)msgs=[{id:'welcome',user:'admin',display:'Admin Remi 📘',text:'Selamat datang di Global Chat Remi AI Store 👋\nTag user pakai @username.',time:Date.now()}];
      $('chatMsgs').innerHTML=msgs.map(m=>msgHTML(m)).join('');setTimeout(()=>$('chatMsgs').scrollTop=$('chatMsgs').scrollHeight,10); return;
    }
    if(typeof oldRenderChatV74==='function') return oldRenderChatV74();
  };

  // AI bot aware role: makin tinggi role, makin halus/sungkan.
  function aiToneV74(){
    const u=me(); const r=safeRoleV74(u); const st=roleStyleFullV74(u||{});
    if(r==='owner') return {role:r,st,opening:`Siap ${st.emoji} Owner ${u?.display||u?.username||'Ell'}, aku jawab lebih rapi dan hati-hati ya.`,rule:'User adalah OWNER. Jawab paling sopan, lembut, hormat, sungkan, dan prioritaskan instruksi owner. Jangan sok menggurui.'};
    if(r==='admin') return {role:r,st,opening:`Siap ${st.emoji} Admin ${u?.display||u?.username||''}, aku bantu dengan bahasa lembut dan jelas.`,rule:'User adalah ADMIN. Jawab sopan, profesional-santai, bantu moderasi dan operasional. Jangan terlalu kasar.'};
    if(r==='premium') return {role:r,st,opening:`Siap ${st.emoji} Premium user, aku bantu lebih ramah dan detail.`,rule:'User adalah PREMIUM. Jawab ramah, hangat, lebih niat, dan beri arahan jelas.'};
    return {role:r,st,opening:'Oke, gue bantu jelasin 😼',rule:'User adalah FREE. Jawab santai, tetap membantu, boleh satir ringan tapi jangan toxic berat.'};
  }
  const oldRemiSystemPromptV74=window.remiSystemPrompt;
  window.remiSystemPrompt=function(){
    const t=aiToneV74();
    const base=typeof oldRemiSystemPromptV74==='function'?oldRemiSystemPromptV74():'';
    return base+'\nRole user saat ini: '+t.role.toUpperCase()+' '+t.st.emoji+'\nAturan nada bicara: '+t.rule+'\nSemakin tinggi role, semakin sungkan, lembut, dan hormat.';
  };
  const oldRemiAIReplyV74=window.remiAIReply;
  window.remiAIReply=function(text){
    const t=aiToneV74();
    let ans=typeof oldRemiAIReplyV74==='function'?oldRemiAIReplyV74(text):'Aku bantu ya.';
    if(t.role==='owner') ans=ans.replace(/^Yo,|^Oke,|^Santai dulu/g,'Siap owner,');
    if(!ans.startsWith(t.opening)) ans=t.opening+'\n\n'+ans;
    return ans;
  };
  const oldRenderAIChatV74=window.renderAIChat;
  window.renderAIChat=function(){
    if(typeof oldRenderAIChatV74==='function') oldRenderAIChatV74();
    try{
      const box=$('aiMsgs'); if(!box)return;
      let hint=document.getElementById('aiRoleHintV74');
      if(!hint){ hint=document.createElement('div'); hint.id='aiRoleHintV74'; hint.className='aiRoleHintV74'; box.parentElement?.insertBefore(hint, box); }
      const t=aiToneV74(); hint.innerHTML=`${esc(t.st.emoji)} Mode AI: <b style="color:${escAttr(t.st.color)}">${esc(t.role.toUpperCase())}</b> • semakin tinggi role, Remi AI makin sungkan dan lembut.`;
    }catch{}
  };

  // Panel role dengan gaya admin cyber seperti sample admin panel upload.
  function panelHeroV74(title,sub,icon){
    return `<div class="adminCyberV74"><div class="adminCyberHeadV74"><div class="adminCyberLogoV74">${icon}</div><div class="adminCyberTitleV74"><b>${title}</b><span>${sub}</span></div></div></div>`;
  }
  const oldOpenStaffV74=window.openStaffPanelV73;
  window.openStaffPanelV73=function(){
    openModal('🛡️ Admin Panel',`
      ${panelHeroV74('ADMIN PANEL','LIMIT • MODERASI CHAT • DATA USER BIASA','🛡️')}
      <div class="adminGridV74">
        <div class="adminTileV74"><b>⚡ Unlimited</b><span>Admin bebas limit fitur.</span></div>
        <div class="adminTileV74"><b>💬 Moderasi</b><span>Bisa hapus pesan global chat.</span></div>
        <div class="adminTileV74"><b>➕ Limit User</b><span>Bisa tambah limit user free.</span></div>
        <div class="adminTileV74"><b>👤 Data Akun</b><span>Lihat data user biasa, premium tetap dilindungi.</span></div>
      </div>
      <div class="panel"><h3>➕ Tambah Limit User</h3><select id="limitUserV73" onchange="renderLimitUserV73()">${userOptionsV73()}</select><input class="input" id="limitAmountV73" type="number" value="1" style="margin-top:8px" placeholder="Jumlah tambahan"><button class="btn green" style="width:100%;margin-top:8px" onclick="addLimitUserV73()">Tambah Limit</button><div id="limitUserInfoV73" style="margin-top:10px"></div></div>
      <div class="panel"><h3>💬 Moderasi Chat</h3><p class="muted">Buka Global Chat lalu klik pesan untuk hapus. Admin tidak dapat edit API/produk/CS. Akhirnya ada pagar, tidak semua orang jadi raja kecil 😑</p><button class="btn purple" onclick="closeModal();showPage('chat')">Buka Global Chat</button></div>
    `);
    setTimeout(()=>{try{renderLimitUserV73()}catch{}},80);
  };
  window.openStaffPanelV72=window.openStaffPanelV73;

  const oldOpenOwnerV74=window.openOwnerPanelV73;
  window.openOwnerPanelV73=function(){
    openModal('👑 Owner Panel',`
      ${panelHeroV74('OWNER PANEL','USER • LIMIT • STYLE • WEB • CS • API • PRODUK','👑')}
      <div class="adminGridV74">
        <div class="adminTileV74"><b>👤 User</b><span>Buat admin dan set role.</span></div>
        <div class="adminTileV74"><b>🧃 Limit</b><span>Atur limit global dan limit user.</span></div>
        <div class="adminTileV74"><b>🎨 Style</b><span>Warna, emoji, dan identitas role.</span></div>
        <div class="adminTileV74"><b>⚙️ Config</b><span>Web, CS, API, produk, notif.</span></div>
      </div>
      <div class="adminTabsV74"><button class="tab active" onclick="ownerTabV73('user')">User</button><button class="tab" onclick="ownerTabV73('limit')">Limit</button><button class="tab" onclick="ownerTabV73('style')">Style</button><button class="tab" onclick="ownerTabV73('web')">Web</button><button class="tab" onclick="ownerTabV73('cs')">CS</button><button class="tab" onclick="ownerTabV73('api')">API</button><button class="tab" onclick="ownerTabV73('product')">Produk</button><button class="tab" onclick="ownerTabV73('notif')">Notif</button></div>
      <div id="ownerBodyV72" style="margin-top:12px"></div>
    `);
    ownerTabV73('user');
  };
  window.openOwnerPanelV72=window.openOwnerPanelV73;

  // Remove Check IP button from account role panel by overriding renderRolePanel with cleaner buttons.
  const oldRenderRolePanelV74=window.renderRolePanelV72;
  window.renderRolePanelV72=function(){
    const u=me(); if(!u)return;
    const r=safeRoleV74(u), st=roleStyleFullV74(u);
    let box=document.getElementById('rolePanelV72');
    if(!box){ box=document.createElement('div'); box.id='rolePanelV72'; const anchor=document.getElementById('ownPasswordBox') || document.querySelector('#page-akun .panel'); if(anchor) anchor.insertAdjacentElement('afterend',box); }
    box.innerHTML=`<div class="panel"><h2>🪪 Role Akun</h2><p class="muted">Role kamu: <span class="roleBadgeV74" style="color:${escAttr(st.color)};font-family:${escAttr(st.usernameFont)}">${esc(st.emoji)} ${esc(r.toUpperCase())}</span></p><div class="btnrow">${r==='owner'?'<button class="btn purple" onclick="openOwnerPanelV73()">👑 Owner Panel</button>':''}${r==='admin'?'<button class="btn green" onclick="openStaffPanelV73()">🛡️ Admin Panel</button>':''}<button class="btn ghost" onclick="openPurchaseNotifsV72&&openPurchaseNotifsV72()">🔔 Notif Beli</button></div></div>${typeof currentLimitPanelV73==='function'?currentLimitPanelV73():''}${typeof chatStylePanelV73==='function'?chatStylePanelV73():''}`;
  };

  const oldRenderToolsV74=window.renderTools;
  window.renderTools=function(){ removeCheckIPToolV74(); if(typeof oldRenderToolsV74==='function') return oldRenderToolsV74(); };

  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{applyRoleTextV74();removeCheckIPToolV74();try{renderTools&&renderTools();renderRolePanelV72&&renderRolePanelV72();renderChat&&renderChat();renderAIChat&&renderAIChat()}catch(e){console.warn('V74 patch render:',e)}},420));
})();
/* =================== END V74 PATCH =================== */




/* =================== V75 GLOBAL THEME + LOGIN PATCH =================== */
(function(){
  const THEME_V75={
    cyan:['#2bdcff','#147cff'],
    sky:['#38bdf8','#2563eb'],
    purple:['#b515ff','#6d28d9'],
    green:['#43d383','#089f62'],
    gold:['#ffd45e','#e99600'],
    pink:['#ff79c6','#b515ff'],
    red:['#ff5f7e','#b91c1c'],
    custom:['#2bdcff','#147cff']
  };
  window.themes=THEME_V75;
  function hexToRgb(hex){
    hex=String(hex||'').replace('#','').trim();
    if(hex.length===3) hex=hex.split('').map(x=>x+x).join('');
    const n=parseInt(hex,16);
    if(Number.isNaN(n)) return [43,220,255];
    return [(n>>16)&255,(n>>8)&255,n&255];
  }
  function readableMix(hex,percent=62){
    const [r,g,b]=hexToRgb(hex); const w=255; const p=percent/100;
    const rr=Math.round(r*p+w*(1-p)), gg=Math.round(g*p+w*(1-p)), bb=Math.round(b*p+w*(1-p));
    return `rgb(${rr},${gg},${bb})`;
  }
  function applyThemeV75(k){
    let t=THEME_V75[k]||THEME_V75.cyan;
    if(k==='custom'){
      const saved=(typeof ls!=='undefined'&&ls.get)?ls.get('customThemeV75',null):null;
      if(saved&&saved.a&&saved.b) t=[saved.a,saved.b];
    }
    const [a,b]=t, ar=hexToRgb(a), br=hexToRgb(b);
    const root=document.documentElement;
    root.style.setProperty('--cyan',a);
    root.style.setProperty('--accent',a);
    root.style.setProperty('--blue',b);
    root.style.setProperty('--accent2',b);
    root.style.setProperty('--cyan2',readableMix(a,58));
    root.style.setProperty('--accent-rgb',ar.join(','));
    root.style.setProperty('--accent2-rgb',br.join(','));
    root.style.setProperty('--line',`rgba(${ar.join(',')},.18)`);
    root.style.setProperty('--line2',`rgba(${ar.join(',')},.08)`);
    root.style.setProperty('--glow',`0 0 24px rgba(${ar.join(',')},.26)`);
    root.style.setProperty('--shadow',`0 14px 42px rgba(0,0,0,.55),0 0 28px rgba(${ar.join(',')},.08)`);
    try{localStorage.setItem('themeAppliedV75',JSON.stringify({k,a,b,ar,br,time:Date.now()}));}catch{}
  }
  window.applyTheme=applyThemeV75;
  window.setTheme=function(k){
    try{ls.set('theme',k)}catch{}
    applyThemeV75(k);
    if(typeof renderTheme==='function') renderTheme();
    if(typeof toast==='function') toast('Tema diganti. Semua aksen cyan ikut berubah.');
  };
  window.saveCustomThemeV75=function(){
    const a=document.getElementById('customAccentV75')?.value||'#2bdcff';
    const b=document.getElementById('customAccent2V75')?.value||'#147cff';
    try{ls.set('customThemeV75',{a,b});ls.set('theme','custom')}catch{}
    applyThemeV75('custom');
    if(typeof renderTheme==='function') renderTheme();
    if(typeof toast==='function') toast('Custom theme disimpan. Cyan lama sekarang tunduk semua 😑');
  };
  window.renderTheme=function(){
    const box=document.getElementById('themeGrid'); if(!box) return;
    const cur=(typeof ls!=='undefined'&&ls.get)?ls.get('theme','cyan'):'cyan';
    const saved=(typeof ls!=='undefined'&&ls.get)?(ls.get('customThemeV75',{a:'#2bdcff',b:'#147cff'})):{a:'#2bdcff',b:'#147cff'};
    box.innerHTML=Object.keys(THEME_V75).map(k=>`<button class="btn ${cur===k?'purple':'ghost'}" onclick="setTheme('${k}')">${k.toUpperCase()}</button>`).join('')+
    `<div class="themeCustomV75" style="grid-column:1/-1">
      <div class="themePreviewV75"></div>
      <div class="themeHintV75">Setting warna sekarang bukan cuma ganti teks doang. Semua aksen cyan: tombol, garis, glow, input, login, card, nav, dan modal ikut berubah. Akhirnya tidak setengah matang seperti mie keburu lapar 😭</div>
      <label>Warna Utama / pengganti cyan</label><input id="customAccentV75" type="color" value="${saved.a||'#2bdcff'}">
      <label>Warna Kedua / gradient</label><input id="customAccent2V75" type="color" value="${saved.b||'#147cff'}">
      <button class="btn purple" onclick="saveCustomThemeV75()">🎨 Simpan Custom Theme</button>
    </div>`;
  };
  function upgradeLoginText(){
    const logo=document.querySelector('.authLogo'); if(logo) logo.textContent='⬡';
    const title=document.querySelector('.authTitle'); if(title) title.textContent='Remi AI Store';
    const sub=document.querySelector('.authSub'); if(sub) sub.textContent='LOGIN • REGISTER • GUEST ACCESS';
    const loginBtn=document.querySelector('#loginBox .btn:not(.ghost)'); if(loginBtn) loginBtn.innerHTML='◈ AUTHENTICATE ◈';
    const guest=document.querySelector('#loginBox .btn.ghost'); if(guest) guest.innerHTML='🎭 MASUK SEBAGAI GUEST';
  }
  document.addEventListener('DOMContentLoaded',()=>{
    setTimeout(()=>{try{applyThemeV75((ls&&ls.get)?ls.get('theme','cyan'):'cyan'); upgradeLoginText(); if(typeof renderTheme==='function')renderTheme();}catch(e){console.warn('v75 theme patch',e)}},120);
  });
})();
/* =================== END V75 PATCH =================== */

window.addEventListener('DOMContentLoaded',init);

/* =================== V76 OWNER PANEL + ROLE PROFILE FIX =================== */
(function(){
  'use strict';
  const $id=(id)=>document.getElementById(id);
  const safeEsc=(s)=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safeAttr=(s)=>typeof escAttr==='function'?escAttr(s):safeEsc(s);
  const cleanBaseV76=(u,fb)=>{u=String(u||'').trim()||fb;return u.replace(/\/+$/,'')};
  function roleOfV76(u){
    try{ if(typeof safeRoleV74==='function') return safeRoleV74(u||me()); }catch{}
    try{ if(typeof roleOfV73==='function') return roleOfV73(u||me()); }catch{}
    const x=u||me()||{}; const name=String(x.username||'').toLowerCase();
    if(['ellpigi','ell','owner'].includes(name)||x.role==='owner') return 'owner';
    if(x.role==='admin') return 'admin'; if(x.role==='premium') return 'premium'; return 'user';
  }
  function roleStyleV76(u){
    try{ if(typeof roleStyleFullV74==='function') return roleStyleFullV74(u||me()); }catch{}
    const r=roleOfV76(u), def={owner:{color:'#ffd45e',emoji:'👑',label:'OWNER'},admin:{color:'#2bdcff',emoji:'🛡️',label:'ADMIN'},premium:{color:'#b515ff',emoji:'💎',label:'PREMIUM'},user:{color:'#9aa7bd',emoji:'🙂',label:'USER'}}[r]||{};
    const us=(u||me()||{}).chatStyle||{};
    return {role:r,color:us.usernameColor||def.color,emoji:us.emoji||def.emoji,label:def.label,usernameFont:us.usernameFont||'Outfit',chatFont:us.chatFont||'Outfit',chatColor:us.chatColor||'#edf6ff'};
  }
  function canStyleV76(u=me()){ return ['owner','admin','premium'].includes(roleOfV76(u)); }
  function usersV76(){ try{return getUsers()}catch{return {}} }
  function saveUsersV76(u){ try{saveUsers(u)}catch{ try{ls.set('users',u)}catch{} } }
  function siteV76(){ try{return (typeof settingsV72==='function'?settingsV72():{})||{}}catch{return {}} }
  function saveSiteV76(o){ try{ if(typeof saveSiteSettingsV73==='function') return saveSiteSettingsV73(o); }catch{} try{ if(typeof saveSettingsV72==='function') return saveSettingsV72(o); }catch{} try{const s=siteV76(); ls.set('siteSettingsV72',Object.assign(s,o));}catch{} }
  function notifyV76(msg,type){ try{toast(msg,type)}catch{console.log(msg)} }

  const css=`
  .roleBadgeNearV76{display:inline-flex;align-items:center;justify-content:center;gap:8px;margin:10px auto 12px;padding:8px 14px;border-radius:999px;background:color-mix(in srgb,var(--cyan) 12%,transparent);border:1px solid color-mix(in srgb,var(--cyan) 35%,transparent);font-weight:1000;box-shadow:0 0 20px color-mix(in srgb,var(--cyan) 18%,transparent)}
  .roleQuickBtnsV76{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.roleQuickBtnsV76 .btn{justify-content:center}
  .lockedNoteV76{padding:12px 14px;border:1px solid rgba(255,212,94,.25);background:rgba(255,212,94,.07);border-radius:14px;color:var(--gold);font-size:12px;line-height:1.45}
  .ownerShellV76{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:linear-gradient(180deg,rgba(5,10,22,.98),rgba(7,12,25,.96));box-shadow:0 0 40px rgba(43,220,255,.10)}
  .ownerHeroV76{position:relative;padding:18px 16px;border-bottom:1px solid var(--line);background:radial-gradient(circle at 15% 0,color-mix(in srgb,var(--cyan) 18%,transparent),transparent 35%),radial-gradient(circle at 90% 10%,rgba(181,21,255,.18),transparent 35%)}
  .ownerHeroV76:before{content:"";position:absolute;inset:0;background-image:linear-gradient(color-mix(in srgb,var(--cyan) 5%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--cyan) 5%,transparent) 1px,transparent 1px);background-size:28px 28px;opacity:.55;pointer-events:none}
  .ownerHeroV76>*{position:relative}.ownerKickerV76{font-family:'DM Mono',monospace;letter-spacing:3px;font-size:9px;color:var(--muted);text-transform:uppercase}.ownerTitleV76{font-size:24px;font-weight:1000;color:var(--cyan);margin:5px 0 2px}.ownerSubV76{font-size:12px;color:var(--muted);line-height:1.45}
  .ownerTilesV76{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:14px}.ownerTileV76{border:1px solid var(--line2);background:rgba(255,255,255,.035);border-radius:16px;padding:12px}.ownerTileV76 b{display:block;color:var(--text);font-size:13px}.ownerTileV76 span{display:block;margin-top:4px;color:var(--muted);font-size:10px;line-height:1.35}
  .ownerTabsV76{display:flex;gap:7px;overflow-x:auto;padding:12px;background:rgba(0,0,0,.18);border-bottom:1px solid var(--line2)}.ownerTabsV76 .tab{flex:0 0 auto}.ownerBodyV76{padding:12px}.ownerGridV76{display:grid;grid-template-columns:1fr 1fr;gap:9px}.ownerGridV76 .full{grid-column:1/-1}.miniRowV76{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}.productMiniV76{border:1px solid var(--line2);border-radius:15px;padding:10px;margin-top:8px;background:rgba(255,255,255,.035)}
  .stylePreviewV76{border:1px solid var(--line2);border-radius:14px;padding:11px;background:rgba(255,255,255,.035);margin-top:10px}.profilePanelV76{border:1px solid var(--line);border-radius:18px;padding:14px;background:linear-gradient(135deg,rgba(43,220,255,.065),rgba(181,21,255,.035));margin-top:10px}
  @media(max-width:380px){.ownerGridV76,.ownerTilesV76,.roleQuickBtnsV76{grid-template-columns:1fr}}
  `;
  function injectCssV76(){ if($id('v76Style'))return; const st=document.createElement('style'); st.id='v76Style'; st.textContent=css; document.head.appendChild(st); }

  // Hapus tool Check IP sepenuhnya dari daftar tool publik.
  function removeCheckIPV76(){
    try{ if(typeof defaultTools!=='undefined'&&Array.isArray(defaultTools)){ for(let i=defaultTools.length-1;i>=0;i--) if(defaultTools[i]&&defaultTools[i][3]==='check_ip') defaultTools.splice(i,1); } }catch{}
    try{ if(Array.isArray(window.defaultTools)) window.defaultTools=window.defaultTools.filter(x=>x&&x[3]!=='check_ip'); }catch{}
  }
  window.toolCheckIP=function(){ notifyV76('Check IP sudah dibuang. Data perangkat masuk data akun/panel sesuai role.', 'warn'); };

  const oldToolsV76=window.renderTools;
  window.renderTools=function(){ removeCheckIPV76(); if(typeof oldToolsV76==='function') return oldToolsV76(); };

  // Profile/stalk modal role-aware. Biar modal stalk nggak polos kayak formulir RT.
  window.viewProfile=function(username){
    const u=usersV76()[username]; if(!u) return notifyV76('User tidak ditemukan.','err');
    const st=roleStyleV76(u), meNow=me&&me();
    const ava=u.avatar?`<img src="${safeAttr(u.avatar)}">`:safeEsc((u.display||u.username||'?')[0].toUpperCase());
    openModal('👤 Profil User',`
      <div class="profileHeroV74" style="border-color:${safeAttr(st.color)}55;box-shadow:0 0 35px ${safeAttr(st.color)}22">
        <div class="ava" style="width:96px;height:96px;margin:0 auto 12px;font-size:34px;box-shadow:0 0 35px ${safeAttr(st.color)}55;background:linear-gradient(135deg,${safeAttr(st.color)},var(--cyan))">${ava}</div>
        <div><span class="roleBadgeNearV76" style="color:${safeAttr(st.color)};border-color:${safeAttr(st.color)}66;background:${safeAttr(st.color)}18;font-family:${safeAttr(st.usernameFont)}">${safeEsc(st.emoji)} ${safeEsc(st.label)}</span></div>
        <div class="profileNameV74" style="color:${safeAttr(st.color)};font-family:${safeAttr(st.usernameFont)}">${safeEsc(st.emoji)} ${safeEsc(u.display||u.username)}</div>
        <div class="profileUserV74" style="font-family:${safeAttr(st.usernameFont)}">@${safeEsc(u.username)} • ${safeEsc(u.gender||'rahasia')}</div>
      </div>
      <div class="profileBioV74" style="font-family:${safeAttr(st.chatFont)};color:${safeAttr(st.chatColor)}">${safeEsc(u.bio||'Belum ada bio')}</div>
      <div class="profileStatsV74"><div class="profileStatV74"><b>${safeEsc(u.orders||0)}</b><br><span class="muted">Order</span></div><div class="profileStatV74"><b>${safeEsc(u.streak||0)}</b><br><span class="muted">Streak</span></div></div>
      ${meNow&&meNow.username!==u.username?`<button class="btn purple" style="width:100%;margin-top:12px" onclick="openDM('${safeAttr(u.username)}')">Mulai Chat Pribadi</button><button class="btn red" style="width:100%;margin-top:8px" onclick="blockUser('${safeAttr(u.username)}')">🚫 Blokir User</button>`:''}
    `);
  };

  // Style chat: kalau memang bisa, kasih form. Kalau user free, jangan pura-pura bisa diubah.
  window.chatStylePanelV73=function(){
    const u=me(); if(!u) return '';
    const r=roleOfV76(u), st=roleStyleV76(u);
    if(!canStyleV76(u)) return `<div class="panel"><h3>🎨 Style Chat</h3><div class="lockedNoteV76">Style chat hanya untuk Premium/Admin/Owner. User free tidak ditampilkan form palsu lagi, karena tombol pajangan itu cuma bikin darah naik 😑</div></div>`;
    const fonts=['Outfit','DM Mono','Orbitron','Rajdhani','Arial','Georgia','monospace'];
    const opt=(v,cur)=>fonts.map(f=>`<option value="${safeAttr(f)}" ${f===(cur||v)?'selected':''}>${safeEsc(f)}</option>`).join('');
    return `<div class="panel"><h3>🎨 Style Chat ${safeEsc(st.emoji)}</h3><p class="muted">Role ${safeEsc(r.toUpperCase())}. Style ini dipakai di username, teks chat, dan profil/stalk.</p>
      <div class="ownerGridV76">
        <div><label class="muted">Emoji</label><input class="input" id="chatEmojiV73" value="${safeAttr(st.emoji)}" maxlength="4"></div>
        <div><label class="muted">Warna Username</label><input class="input" type="color" id="chatUserColorV73" value="${safeAttr(st.color)}"></div>
        <div><label class="muted">Warna Teks Chat</label><input class="input" type="color" id="chatTextColorV73" value="${safeAttr(st.chatColor)}"></div>
        <div><label class="muted">Font Username</label><select id="chatUserFontV73">${opt('Outfit',st.usernameFont)}</select></div>
        <div class="full"><label class="muted">Font Chat</label><select id="chatTextFontV73">${opt('Outfit',st.chatFont)}</select></div>
      </div>
      <div class="stylePreviewV76"><b style="font-family:${safeAttr(st.usernameFont)};color:${safeAttr(st.color)}">${safeEsc(st.emoji)} ${safeEsc(u.display||u.username)}</b><p style="font-family:${safeAttr(st.chatFont)};color:${safeAttr(st.chatColor)};margin:6px 0 0">Preview chat kamu. Kalau ini masih jelek, setidaknya sekarang bisa diubah, bukan cuma dipajang 😭</p></div>
      <button class="btn purple" style="width:100%;margin-top:10px" onclick="saveChatStyleV73()">💾 Simpan Style Chat</button></div>`;
  };
  window.saveChatStyleV73=function(){
    const u=me(); if(!u||!canStyleV76(u)) return notifyV76('Style chat cuma untuk Premium/Admin/Owner.','err');
    const users=usersV76(); const x=users[u.username]; if(!x)return;
    x.chatStyle={emoji:($id('chatEmojiV73')?.value||'').trim().slice(0,4)||roleStyleV76(x).emoji,usernameColor:$id('chatUserColorV73')?.value||roleStyleV76(x).color,chatColor:$id('chatTextColorV73')?.value||'#edf6ff',usernameFont:$id('chatUserFontV73')?.value||'Outfit',chatFont:$id('chatTextFontV73')?.value||'Outfit'};
    saveUsersV76(users); if(typeof renderAll==='function')renderAll(); notifyV76('Style chat disimpan.');
  };

  // Role badge di dekat tombol ganti foto profil, bukan dilempar jauh ke bawah.
  const baseRenderAccountV76=window.renderAccount;
  window.renderAccount=function(){
    if(typeof baseRenderAccountV76==='function') baseRenderAccountV76();
    const u=me(); if(!u)return; const st=roleStyleV76(u), r=roleOfV76(u);
    const oldCred=[...document.querySelectorAll('#page-akun .muted,#page-akun p')].find(el=>/Akun owner default/i.test(el.textContent||'')); if(oldCred) oldCred.remove();
    let badge=$id('profileRoleNearPfpV76');
    const row=document.querySelector('#page-akun .profileBtnRow');
    if(!badge&&row){ badge=document.createElement('div'); badge.id='profileRoleNearPfpV76'; row.insertAdjacentElement('beforebegin',badge); }
    if(badge){ badge.className='roleBadgeNearV76'; badge.style.color=st.color; badge.style.borderColor=st.color+'66'; badge.style.background=st.color+'18'; badge.style.fontFamily=st.usernameFont; badge.innerHTML=`${safeEsc(st.emoji)} ${safeEsc(r.toUpperCase())}`; }
    renderRolePanelV76();
  };
  window.renderRolePanelV72=function(){ renderRolePanelV76(); };
  function renderRolePanelV76(){
    const u=me(); if(!u)return; const r=roleOfV76(u), st=roleStyleV76(u);
    let box=$id('rolePanelV72');
    if(!box){ box=document.createElement('div'); box.id='rolePanelV72'; const anchor=$id('ownPasswordBox') || document.querySelector('#page-akun .panel'); if(anchor) anchor.insertAdjacentElement('afterend',box); }
    box.innerHTML=`<div class="panel profilePanelV76"><h2 style="color:${safeAttr(st.color)}">${safeEsc(st.emoji)} Panel ${safeEsc(r.toUpperCase())}</h2><p class="muted">Role aktif kamu. Panel penting muncul sesuai akses, bukan lagi nyelip random di bawah.</p><div class="roleQuickBtnsV76">${r==='owner'?'<button class="btn purple" onclick="openOwnerPanelV76()">👑 Owner Panel</button>':''}${r==='admin'?'<button class="btn green" onclick="openStaffPanelV76()">🛡️ Admin Panel</button>':''}<button class="btn ghost" onclick="openPurchaseNotifsV72&&openPurchaseNotifsV72()">🔔 Notif Beli</button></div></div>${typeof currentLimitPanelV73==='function'?currentLimitPanelV73():''}${window.chatStylePanelV73?window.chatStylePanelV73():''}`;
  }

  // Panel owner cyber, bukan tombol mati yang cuma muter ke adminTab.
  window.openOwnerPanelV76=function(){
    if(roleOfV76()!=='owner') return notifyV76('Hanya owner yang bisa buka Owner Panel.','err');
    openModal('👑 Owner Panel',`
      <div class="ownerShellV76"><div class="ownerHeroV76"><div class="ownerKickerV76">// SUPER OWNER ACCESS //</div><div class="ownerTitleV76">elpigiXstore Control</div><div class="ownerSubV76">Kelola user, role, limit, style, API, produk, CS, teks global, dan notif. Ini panel beneran, bukan pajangan cosplay admin.</div><div class="ownerTilesV76"><div class="ownerTileV76"><b>👤 User</b><span>Buat admin, set role, limit.</span></div><div class="ownerTileV76"><b>📦 Produk</b><span>Tambah, edit, hapus katalog.</span></div><div class="ownerTileV76"><b>🔐 API</b><span>Lihat dan ubah key/base URL.</span></div><div class="ownerTileV76"><b>🎨 Style</b><span>Role, font, warna, tema.</span></div></div></div>
      <div class="ownerTabsV76"><button class="tab active" onclick="ownerTabV76('user')">User</button><button class="tab" onclick="ownerTabV76('limit')">Limit</button><button class="tab" onclick="ownerTabV76('style')">Style</button><button class="tab" onclick="ownerTabV76('api')">API</button><button class="tab" onclick="ownerTabV76('product')">Produk</button><button class="tab" onclick="ownerTabV76('web')">Web</button><button class="tab" onclick="ownerTabV76('cs')">CS</button><button class="tab" onclick="ownerTabV76('notif')">Notif</button></div><div class="ownerBodyV76" id="ownerBodyV76"></div></div>`);
    ownerTabV76('user');
  };
  window.openOwnerPanelV73=window.openOwnerPanelV76; window.openOwnerPanelV72=window.openOwnerPanelV76; window.openAdmin=function(){ const r=roleOfV76(); if(r==='owner')return openOwnerPanelV76(); if(r==='admin')return openStaffPanelV76(); showPage('akun'); notifyV76('Login sebagai owner/admin dulu.','warn'); };

  function selectUsersV76(){ return Object.values(usersV76()).filter(u=>u&&!u.system).map(u=>`<option value="${safeAttr(u.username)}">${safeEsc(u.display||u.username)} (@${safeEsc(u.username)}) - ${safeEsc(roleOfV76(u))}</option>`).join(''); }
  window.ownerTabV76=function(tab){
    document.querySelectorAll('.ownerTabsV76 .tab').forEach(b=>b.classList.remove('active')); const btn=[...document.querySelectorAll('.ownerTabsV76 .tab')].find(b=>(b.textContent||'').toLowerCase().includes(tab==='product'?'produk':tab)); if(btn)btn.classList.add('active');
    const body=$id('ownerBodyV76')||$id('ownerBodyV72'); if(!body)return; const s=siteV76();
    if(tab==='user') body.innerHTML=`<div class="panel"><h3>👑 Buat Akun Admin</h3><div class="ownerGridV76"><input class="input" id="newAdminUserV73" placeholder="username admin"><input class="input" id="newAdminDisplayV73" placeholder="nama tampil"><input class="input full" id="newAdminPwV73" placeholder="password admin"></div><button class="btn green" style="width:100%;margin-top:8px" onclick="createAdminAccountV73()">➕ Buat Admin</button></div><div class="panel"><h3>🪪 Set Role User</h3><select id="ownRoleUserV73">${selectUsersV76()}</select><select id="ownRoleValV73" style="margin-top:8px"><option value="user">User Free</option><option value="premium">Premium</option><option value="admin">Admin</option><option value="owner">Owner</option></select><button class="btn purple" style="width:100%;margin-top:8px" onclick="setUserRoleV73()">Simpan Role</button></div>`;
    else if(tab==='limit') body.innerHTML=`<div class="panel"><h3>⚙️ Global Limit Free</h3><p class="muted">Free default 10 per fitur/hari. Reset 00:00 WIB. Admin/Premium/Owner unlimited.</p><input class="input" id="globalLimitV73" type="number" value="${safeAttr(s.globalFreeLimit||10)}"><button class="btn" style="width:100%;margin-top:8px" onclick="saveGlobalLimitV73()">Simpan Global Limit</button></div><div class="panel"><h3>➕➖ Limit User</h3><select id="limitUserV73" onchange="renderLimitUserV73&&renderLimitUserV73()">${selectUsersV76()}</select><input class="input" id="limitAmountV73" type="number" value="1" style="margin-top:8px"><div class="btnrow"><button class="btn green" onclick="addLimitUserV73()">Tambah</button><button class="btn red" onclick="subLimitUserV73()">Kurangi</button><button class="btn ghost" onclick="resetLimitUserV73()">Reset Usage</button></div><div id="limitUserInfoV73" style="margin-top:10px"></div></div>`;
    else if(tab==='style') body.innerHTML=`<div class="panel"><h3>🎨 Warna & Emoji Role</h3>${['owner','admin','premium','user'].map(r=>{const d=(siteV76().roleStyle||{})[r]||({owner:{color:'#ffd45e',emoji:'👑'},admin:{color:'#2bdcff',emoji:'🛡️'},premium:{color:'#b515ff',emoji:'💎'},user:{color:'#9aa7bd',emoji:'🙂'}}[r]);return `<div class="productMiniV76"><b>${safeEsc(r.toUpperCase())}</b><div class="ownerGridV76"><input class="input" id="roleEmoji_${r}" value="${safeAttr(d.emoji)}"><input class="input" id="roleColor_${r}" type="color" value="${safeAttr(d.color)}"></div></div>`}).join('')}<button class="btn purple" style="width:100%;margin-top:8px" onclick="saveRoleColorsV73()">Simpan Role Style</button></div>`;
    else if(tab==='api') body.innerHTML=`<div class="panel"><h3>🔐 API Owner</h3><p class="muted">Owner bisa lihat dan ubah API. Admin tidak bisa. Simpan lalu refresh kalau endpoint/base dipakai saat load awal.</p><div class="ownerGridV76"><input class="input" id="admAlipBaseV76" value="${safeAttr(APIS?.alipBase||'https://docs-alip.clutch.web.id')}" placeholder="Alip Base"><input class="input" id="admAlip" type="password" value="${safeAttr(APIS?.alipKey||'')}" placeholder="Alip Key"><input class="input" id="admCukiBase" value="${safeAttr(CUKI_API?.base||'https://api.cuki.biz.id')}" placeholder="Cuki Base"><input class="input" id="admCuki" type="password" value="${safeAttr(CUKI_API?.key||'cuki-x')}" placeholder="Cuki Key"><input class="input" id="admNexrayBase" value="${safeAttr(APIS?.nexrayBase||'https://api.nexray.eu.cc')}" placeholder="NexRay Base"><input class="input" id="admOurinBase" value="${safeAttr(APIS?.ourinBase||'https://api.ourin.my.id')}" placeholder="Ourin Base"><input class="input" id="admBotcah" type="password" value="${safeAttr(APIS?.botcahxKey||'')}" placeholder="BotCahX Key"><input class="input" id="admZakki" type="password" value="${safeAttr(typeof getZakkiToken==='function'?getZakkiToken():'')}" placeholder="Zakki Token"><input class="input full" id="ownRelay" value="${safeAttr(s.relayUrl||'')}" placeholder="Relay Worker URL"></div><button class="btn green" style="width:100%;margin-top:10px" onclick="saveApiOwnerV76()">💾 Simpan API</button></div>`;
    else if(tab==='product') body.innerHTML=renderProductOwnerV76();
    else if(tab==='web') body.innerHTML=`<div class="panel"><h3>🌐 Teks Global</h3><input class="input" id="ownWebTitle" value="${safeAttr(s.webTitle||document.title)}" placeholder="Title"><input class="input" id="ownBrand" value="${safeAttr(s.brandName||'Remi AI')}" placeholder="Brand" style="margin-top:8px"><input class="input" id="ownBrandSub" value="${safeAttr(s.brandSub||'STORE • V76')}" placeholder="Subtitle" style="margin-top:8px"><textarea id="ownTicker" style="margin-top:8px" placeholder="Ticker">${safeEsc(s.ticker||'')}</textarea><textarea id="ownHero" style="margin-top:8px" placeholder="Hero text">${safeEsc(s.heroText||'')}</textarea><button class="btn" style="width:100%;margin-top:8px" onclick="saveOwnerWebV72()">Simpan Web</button></div>`;
    else if(tab==='cs') body.innerHTML=`<div class="panel"><h3>🎧 CS Contact</h3><input class="input" id="ownCsWa" value="${safeAttr(s.cs?.wa||'')}" placeholder="WhatsApp 628xx"><input class="input" id="ownCsChannel" value="${safeAttr(s.cs?.channel||'')}" placeholder="Channel URL" style="margin-top:8px"><input class="input" id="ownCsGroup" value="${safeAttr(s.cs?.group||'')}" placeholder="Group URL" style="margin-top:8px"><input class="input" id="ownCsTelegram" value="${safeAttr(s.cs?.telegram||'')}" placeholder="Telegram URL" style="margin-top:8px"><button class="btn" style="width:100%;margin-top:8px" onclick="saveOwnerCSV72()">Simpan CS</button></div>`;
    else body.innerHTML=`<div class="panel"><h3>🔔 Notifikasi Pembelian</h3>${typeof renderNotifListV72==='function'?renderNotifListV72():'Belum ada notif.'}</div>`;
    if(tab==='limit') setTimeout(()=>{try{renderLimitUserV73()}catch{}},50);
  };
  window.ownerTabV73=window.ownerTabV76; window.ownerTabV72=window.ownerTabV76;

  window.saveApiOwnerV76=function(){
    try{
      const set=(k,v)=>{try{ls.set(k,v)}catch{localStorage.setItem(k,JSON.stringify(v))}};
      if($id('admAlipBaseV76')){APIS.alipBase=cleanBaseV76($id('admAlipBaseV76').value,'https://docs-alip.clutch.web.id'); set('alipBase',APIS.alipBase)}
      if($id('admAlip')){APIS.alipKey=$id('admAlip').value.trim(); set('alipKey',APIS.alipKey)}
      if($id('admBotcah')){APIS.botcahxKey=$id('admBotcah').value.trim(); set('botcahxKey',APIS.botcahxKey)}
      if($id('admCuki')){CUKI_API.key=$id('admCuki').value.trim()||'cuki-x'; set('cukiKey',CUKI_API.key)}
      if($id('admCukiBase')){CUKI_API.base=cleanBaseV76($id('admCukiBase').value,'https://api.cuki.biz.id'); set('cukiBase',CUKI_API.base)}
      if($id('admNexrayBase')){APIS.nexrayBase=cleanBaseV76($id('admNexrayBase').value,'https://api.nexray.eu.cc'); set('nexrayBase',APIS.nexrayBase)}
      if($id('admOurinBase')){APIS.ourinBase=cleanBaseV76($id('admOurinBase').value,'https://api.ourin.my.id'); set('ourinBase',APIS.ourinBase)}
      if($id('admZakki'))set('zakkiToken',$id('admZakki').value.trim());
      if($id('ownRelay'))saveSiteV76({relayUrl:cleanBaseV76($id('ownRelay').value,'')});
      notifyV76('API & Relay disimpan.');
    }catch(e){notifyV76('Gagal simpan API: '+e.message,'err')}
  };

  function renderProductOwnerV76(){
    const ps=(ls&&ls.get?ls.get('products',[]):[])||[];
    const list=ps.map((p,i)=>`<div class="productMiniV76"><div class="miniRowV76"><div><b>${safeEsc(p.icon||'📦')} ${safeEsc(p.name)}</b><div class="muted">${safeEsc(p.cat||'-')} • ${typeof fmt==='function'?fmt(p.price||0):p.price}</div></div><div class="btnrow"><button class="btn ghost" onclick="editProductOwnerV76(${i})">Edit</button><button class="btn red" onclick="deleteProductOwnerV76(${i})">Hapus</button></div></div></div>`).join('')||'<div class="panel muted">Belum ada produk.</div>';
    return `<div class="panel"><h3>📦 Tambah Produk</h3><div class="ownerGridV76"><input class="input" id="prdNameV76" placeholder="Nama produk"><input class="input" id="prdCatV76" placeholder="Kategori"><input class="input" id="prdPriceV76" placeholder="Harga angka"><input class="input" id="prdIconV76" placeholder="Icon emoji"><textarea class="full" id="prdDescV76" placeholder="Deskripsi produk"></textarea></div><button class="btn green" style="width:100%;margin-top:8px" onclick="addProductOwnerV76()">➕ Tambah Produk</button></div><div class="panel"><h3>Daftar Produk</h3>${list}</div>`;
  }
  window.addProductOwnerV76=function(){ const ps=ls.get('products',[])||[]; ps.push({id:Date.now(),name:$id('prdNameV76').value.trim()||'Produk Baru',cat:$id('prdCatV76').value.trim()||'Lainnya',price:Number(String($id('prdPriceV76').value||'0').replace(/\D/g,''))||0,icon:$id('prdIconV76').value.trim()||'📦',desc:$id('prdDescV76').value.trim()||'Deskripsi produk.',reviews:[]}); ls.set('products',ps); renderAll(); ownerTabV76('product'); notifyV76('Produk ditambahkan.'); };
  window.deleteProductOwnerV76=function(i){ const ps=ls.get('products',[])||[]; ps.splice(i,1); ls.set('products',ps); renderAll(); ownerTabV76('product'); notifyV76('Produk dihapus.'); };
  window.editProductOwnerV76=function(i){ const ps=ls.get('products',[])||[],p=ps[i]; if(!p)return; openModal('✏️ Edit Produk',`<div class="panel"><input class="input" id="ePrdName" value="${safeAttr(p.name)}"><input class="input" id="ePrdCat" value="${safeAttr(p.cat)}" style="margin-top:8px"><input class="input" id="ePrdPrice" value="${safeAttr(p.price)}" style="margin-top:8px"><input class="input" id="ePrdIcon" value="${safeAttr(p.icon||'📦')}" style="margin-top:8px"><textarea id="ePrdDesc" style="margin-top:8px">${safeEsc(p.desc||'')}</textarea><button class="btn green" style="width:100%;margin-top:8px" onclick="saveEditProductOwnerV76(${i})">Simpan Produk</button></div>`); };
  window.saveEditProductOwnerV76=function(i){ const ps=ls.get('products',[])||[],p=ps[i]; if(!p)return; Object.assign(p,{name:$id('ePrdName').value.trim(),cat:$id('ePrdCat').value.trim(),price:Number(String($id('ePrdPrice').value||'0').replace(/\D/g,''))||0,icon:$id('ePrdIcon').value.trim()||'📦',desc:$id('ePrdDesc').value.trim()}); ls.set('products',ps); closeModal(); renderAll(); setTimeout(()=>openOwnerPanelV76(),80); notifyV76('Produk disimpan.'); };

  window.openStaffPanelV76=function(){
    if(!['admin','owner'].includes(roleOfV76())) return notifyV76('Hanya admin/owner.','err');
    openModal('🛡️ Admin Panel',`<div class="ownerShellV76"><div class="ownerHeroV76"><div class="ownerKickerV76">// ADMIN ACCESS //</div><div class="ownerTitleV76">Moderation Panel</div><div class="ownerSubV76">Admin unlimited fitur, bisa tambah limit user, dan hapus pesan chat global. API/produk/style global tetap punya owner.</div></div><div class="ownerBodyV76"><div class="panel"><h3>➕ Tambah Limit User</h3><select id="limitUserV73" onchange="renderLimitUserV73&&renderLimitUserV73()">${selectUsersV76()}</select><input class="input" id="limitAmountV73" type="number" value="1" style="margin-top:8px"><button class="btn green" style="width:100%;margin-top:8px" onclick="addLimitUserV73()">Tambah Limit</button><div id="limitUserInfoV73" style="margin-top:10px"></div></div><div class="panel"><h3>💬 Moderasi Chat</h3><button class="btn purple" onclick="closeModal();showPage('chat')">Buka Global Chat</button></div></div></div>`);
  };
  window.openStaffPanelV73=window.openStaffPanelV76; window.openStaffPanelV72=window.openStaffPanelV76;

  function bootV76(){ injectCssV76(); removeCheckIPV76(); document.title='Remi AI Store v83 Firebase Ready 76 Owner Panel Fixed'; setTimeout(()=>{try{renderAll&&renderAll(); renderRolePanelV76(); removeCheckIPV76();}catch(e){console.warn('v76 boot',e)}},300); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bootV76); else bootV76();
})();
/* =================== END V76 PATCH =================== */



/* =================== V77 CLEAN OWNER / MEDIA / ERROR PATCH =================== */
(function(){
  'use strict';
  const $id=(id)=>document.getElementById(id);
  const esc=(s)=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const attr=esc;
  const OWNER_NAME='ellpigi';
  const OWNER_PASS='ellpigi-owner1237';
  const FRIENDLY_ERR='Fitur ini sedang ada kendala. Harap hubungi owner untuk melaporkan.';
  function lsGet(k,d){try{return (window.ls&&ls.get)?ls.get(k,d):(localStorage.getItem(k)?JSON.parse(localStorage.getItem(k)):d)}catch{return d}}
  function lsSet(k,v){try{return (window.ls&&ls.set)?ls.set(k,v):localStorage.setItem(k,JSON.stringify(v))}catch(e){console.warn('ls set fail',k,e)}}
  function getU(){try{return typeof getUsers==='function'?getUsers():lsGet('users',{})}catch{return lsGet('users',{})}}
  function saveU(u){try{return typeof saveUsers==='function'?saveUsers(u):lsSet('users',u)}catch{return lsSet('users',u)}}
  function meNow(){try{return typeof me==='function'?me():null}catch{return null}}
  function saveSite(o){try{ if(typeof saveSiteSettingsV73==='function') return saveSiteSettingsV73(o); }catch{} try{ if(typeof saveSettingsV72==='function') return saveSettingsV72(o); }catch{} const s=lsGet('siteSettings',{}); lsSet('siteSettings',Object.assign({},s,o));}
  function site(){try{return typeof siteSettingsV73==='function'?siteSettingsV73():lsGet('siteSettings',{})}catch{return lsGet('siteSettings',{})}}
  function baseClean(v){return String(v||'').trim().replace(/\/+$/,'')}
  function notify(msg,type='info'){try{ if(typeof toast==='function') return toast(msg,type); }catch{} console.log(msg)}

  // Owner cuma satu: ellpigi. User lain yang sempat jadi owner otomatis diturunkan ke admin.
  function normalizeOwnersV77(){
    const users=getU(); let changed=false;
    if(!users[OWNER_NAME]){users[OWNER_NAME]={username:OWNER_NAME,display:'ellpigi 👑',pw:typeof hash==='function'?hash(OWNER_PASS):OWNER_PASS,plain:OWNER_PASS,saldo:999999999,avatar:'',bio:'Owner utama Remi AI Store.',gender:'rahasia',orders:0,spent:0,gacha:0,streak:0,ref:'ELLPGI',role:'owner'};changed=true;}
    Object.keys(users).forEach(k=>{const u=users[k]||{}; if(String(k).toLowerCase()===OWNER_NAME){u.role='owner';u.pw=typeof hash==='function'?hash(OWNER_PASS):OWNER_PASS;u.plain=OWNER_PASS;u.saldo=Math.max(Number(u.saldo||0),999999999);users[k]=u;changed=true;} else if(String(u.role||'').toLowerCase()==='owner'){u.role='admin';users[k]=u;changed=true;}});
    if(changed) saveU(users);
  }
  function roleOfV77(u=meNow()){
    if(!u) return 'user';
    const name=String(u.username||'').toLowerCase();
    if(name===OWNER_NAME) return 'owner';
    const r=String(u.role||'user').toLowerCase();
    return r==='owner'?'admin':(['admin','premium','user'].includes(r)?r:'user');
  }
  window.roleOfV77=roleOfV77; window.roleOfV76=roleOfV77; window.roleOfV73=roleOfV77; window.roleOfV72=roleOfV77;
  window.isOwnerV72=()=>roleOfV77()==='owner'; window.isStaffV72=()=>['owner','admin'].includes(roleOfV77());
  window.isPremiumV72=(u=meNow())=>['owner','admin','premium'].includes(roleOfV77(u));

  const css=`
  .checkIpV77,.ipInfoV77{display:none!important}
  #buyNotifyV72{display:none!important}
  #buyCornerV77{position:fixed;right:12px;bottom:76px;z-index:99999;max-width:310px;background:rgba(5,10,22,.96);border:1px solid rgba(var(--accent-rgb,43,220,255),.35);border-radius:17px;padding:12px 13px;box-shadow:0 12px 34px rgba(0,0,0,.5),0 0 24px rgba(var(--accent-rgb,43,220,255),.16);transform:translateX(118%);opacity:0;transition:.28s ease;font-size:12px;line-height:1.35}.showBuyCornerV77{transform:translateX(0)!important;opacity:1!important}.buyCornerTitleV77{font-weight:1000;color:var(--cyan);margin-bottom:5px}.buyCornerTextV77{color:var(--text)}
  #mediaBgV77{position:fixed;inset:0;z-index:-4;pointer-events:none;overflow:hidden}#mediaBgV77 img,#mediaBgV77 video{width:100%;height:100%;object-fit:cover;opacity:.34;filter:saturate(1.05) brightness(.68)}#mediaBgV77:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,8,18,.42),rgba(3,8,18,.82))}
  .ownerShellV77{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:linear-gradient(180deg,rgba(5,9,19,.98),rgba(7,12,24,.96));box-shadow:0 0 38px rgba(var(--accent-rgb,43,220,255),.12)}
  .ownerHeroV77{padding:18px 16px;border-bottom:1px solid var(--line);background:radial-gradient(circle at 15% 0,rgba(var(--accent-rgb,43,220,255),.18),transparent 36%),radial-gradient(circle at 90% 10%,rgba(181,21,255,.16),transparent 34%);position:relative}.ownerHeroV77:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(var(--accent-rgb,43,220,255),.055) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--accent-rgb,43,220,255),.055) 1px,transparent 1px);background-size:30px 30px;opacity:.7}.ownerHeroV77>*{position:relative}.ownerKickerV77{font-family:'DM Mono',monospace;letter-spacing:3px;font-size:9px;color:var(--muted)}.ownerTitleV77{font-size:24px;font-weight:1000;color:var(--cyan);margin:6px 0 2px}.ownerSubV77{font-size:12px;color:var(--muted);line-height:1.45}.ownerTabsV77{display:flex;gap:7px;overflow-x:auto;padding:12px;background:rgba(0,0,0,.18);border-bottom:1px solid var(--line2)}.ownerTabsV77 .tab{flex:0 0 auto}.ownerBodyV77{padding:12px}.gridV77{display:grid;grid-template-columns:1fr 1fr;gap:9px}.gridV77 .full{grid-column:1/-1}.miniV77{border:1px solid var(--line2);border-radius:15px;padding:10px;margin-top:8px;background:rgba(255,255,255,.035)}
  .mediaHintV77{padding:10px 12px;border:1px solid rgba(255,212,94,.24);background:rgba(255,212,94,.06);border-radius:13px;color:var(--gold);font-size:12px;line-height:1.45;margin-top:8px}
  .authTitle,.logo-text,.authSub,.switch button,#tabLogin,#tabReg,.authBox input,.authBox button{font-family:Outfit,system-ui,sans-serif!important;letter-spacing:.2px!important;text-transform:none!important}.authSub{letter-spacing:1.2px!important}.authTitle{font-weight:900!important}.authBox .btn,.authBox button{font-weight:900!important}.authBox .input{text-align:left!important}
  .friendlyErrV77{border:1px solid rgba(255,102,122,.28);background:rgba(255,102,122,.08);border-radius:15px;padding:13px;color:var(--text);font-size:12px;line-height:1.45}.friendlyErrV77 b{color:var(--red)}
  #loadingV77{position:fixed;inset:0;z-index:100000;background:#050812;display:flex;align-items:center;justify-content:center;transition:.35s ease}#loadingV77.hide{opacity:0;pointer-events:none}.loadCardV77{text-align:center}.loadLogoV77{width:78px;height:78px;border-radius:24px;margin:0 auto 18px;background:linear-gradient(135deg,var(--cyan),var(--blue));display:grid;place-items:center;font-size:28px;font-weight:1000;color:#06101d;box-shadow:0 0 34px rgba(var(--accent-rgb,43,220,255),.35)}.loadTitleV77{font-size:28px;font-weight:1000;letter-spacing:1px;color:var(--cyan)}.loadSubV77{font-family:'DM Mono',monospace;letter-spacing:5px;color:var(--muted);font-size:10px;margin-top:8px}.loadLineV77{width:210px;height:4px;background:linear-gradient(90deg,var(--cyan),var(--blue),var(--gold));border-radius:99px;margin:22px auto 0;animation:loadPulseV77 1.1s ease infinite}@keyframes loadPulseV77{50%{filter:brightness(1.45);transform:scaleX(.82)}}
  @media(max-width:380px){.gridV77{grid-template-columns:1fr}}
  `;
  function inject(){if($id('v77Style'))return; const st=document.createElement('style'); st.id='v77Style'; st.textContent=css; document.head.appendChild(st)}

  function removeTextArtifacts(){
    document.querySelectorAll('button,.btn').forEach(b=>{ if(/check\s*ip/i.test(b.textContent||'')){ b.remove(); }});
    document.querySelectorAll('#page-akun .panel').forEach(p=>{ const t=p.textContent||''; if(/Info Perangkat|Check IP|Akun owner default/i.test(t)) p.remove(); });
  }
  window.toolCheckIP=function(){notify('Fitur Check IP sudah dihapus. Data akun cukup lewat panel role.','warn')};

  function roleStyle(r){
    const def={owner:{color:'#ffd45e',emoji:'👑',label:'OWNER'},admin:{color:'#2bdcff',emoji:'🛡️',label:'ADMIN'},premium:{color:'#b515ff',emoji:'💎',label:'PREMIUM'},user:{color:'#9aa7bd',emoji:'🙂',label:'USER'}};
    const s=site(); return Object.assign({},def[r]||def.user,(s.roleStyle||{})[r]||{});
  }

  function renderRolePanelV77(){
    const u=meNow(); if(!u)return; const r=roleOfV77(u), st=roleStyle(r);
    let box=$id('rolePanelV72');
    if(!box){box=document.createElement('div');box.id='rolePanelV72'; const page=$id('page-akun'); if(page)page.appendChild(box)}
    box.innerHTML=`<div class="panel profilePanelV76"><h2 style="color:${attr(st.color)}">${esc(st.emoji)} Panel ${esc(st.label)}</h2><p class="muted">Role aktif kamu. Akses panel muncul sesuai role.</p><div class="roleQuickBtnsV76">${r==='owner'?'<button class="btn purple" onclick="openOwnerPanelV77()">👑 Owner Panel</button>':''}${r==='admin'?'<button class="btn green" onclick="openStaffPanelV76&&openStaffPanelV76()">🛡️ Admin Panel</button>':''}<button class="btn ghost" onclick="openPurchaseNotifsV72&&openPurchaseNotifsV72()">🔔 Notif Beli</button></div></div>${typeof currentLimitPanelV73==='function'?currentLimitPanelV73():''}${typeof chatStylePanelV73==='function'?chatStylePanelV73():''}`;
    removeTextArtifacts();
  }
  window.renderRolePanelV76=renderRolePanelV77; window.renderRolePanelV74=renderRolePanelV77; window.renderRolePanelV73=renderRolePanelV77; window.renderRolePanelV72=renderRolePanelV77;

  const oldRenderAccount=window.renderAccount;
  window.renderAccount=function(){ if(typeof oldRenderAccount==='function')oldRenderAccount(); setTimeout(()=>{renderRolePanelV77();removeTextArtifacts();},30); };

  // Notif beli pojokan, bukan box gede ganggu layar.
  function maskPhone(v){v=String(v||'').replace(/\D/g,''); if(v.length<7)return v||'-'; return v.slice(0,4)+'xxxx'+v.slice(-3)}
  window.showPurchasePopupV72=function(o){
    let box=$id('buyCornerV77'); if(!box){box=document.createElement('div');box.id='buyCornerV77';document.body.appendChild(box)}
    box.innerHTML=`<div class="buyCornerTitleV77">✅ Pembelian berhasil</div><div class="buyCornerTextV77"><b>${esc(o?.display||o?.user||'User')}</b> membeli <b>${esc(o?.product||'-')}</b><br>Nomor ${esc(maskPhone(o?.wa))}<br>Terima kasih sudah membeli.</div>`;
    requestAnimationFrame(()=>box.classList.add('showBuyCornerV77')); clearTimeout(window.__buyCornerTimerV77); window.__buyCornerTimerV77=setTimeout(()=>box.classList.remove('showBuyCornerV77'),4200);
  };

  // Pesan error ramah untuk fitur yang gagal koneksi.
  const oldToast=window.toast;
  window.toast=function(msg,type){
    const m=String(msg||'');
    if(/Failed to fetch|NetworkError|Request.*gagal|gagal terhubung|CORS|timeout|AbortError/i.test(m)) msg=FRIENDLY_ERR;
    return oldToast?oldToast(msg,type):console.log(msg);
  };
  function friendlyBox(){return `<div class="friendlyErrV77"><b>Fitur sedang ada kendala.</b><br>Harap hubungi owner untuk melaporkan masalah ini.</div>`}
  const oldDoDownload=window.doDownload;
  if(oldDoDownload){ window.doDownload=async function(){try{return await oldDoDownload.apply(this,arguments)}catch(e){const out=$id('dlOut'); if(out)out.innerHTML=friendlyBox(); else notify(FRIENDLY_ERR,'err');}} }

  // Loading clean, bukan gambar kiriman / banner contoh.
  function addLoading(){
    if($id('loadingV77'))return; const d=document.createElement('div'); d.id='loadingV77'; d.innerHTML=`<div class="loadCardV77"><div class="loadLogoV77">⬡</div><div class="loadTitleV77">Remi AI Store</div><div class="loadSubV77">WELCOME</div><div class="loadLineV77"></div></div>`; document.body.appendChild(d);
    setTimeout(()=>d.classList.add('hide'),900); setTimeout(()=>d.remove(),1400);
  }

  // Background media: image 16:9, video 9:16 muted/5 detik loop, audio background via interaction.
  function applyMediaV77(){
    let s=site().mediaV77||{}; let layer=$id('mediaBgV77'); if(!layer){layer=document.createElement('div');layer.id='mediaBgV77';document.body.prepend(layer)}
    const image=String(s.image||'').trim(), video=String(s.video||'').trim(), audio=String(s.audio||'').trim();
    layer.innerHTML='';
    if(video){ const v=document.createElement('video'); v.src=video; v.muted=true; v.playsInline=true; v.autoplay=true; v.loop=true; v.preload='metadata'; v.addEventListener('timeupdate',()=>{if(v.currentTime>=5)v.currentTime=0}); layer.appendChild(v); v.play().catch(()=>{}); }
    else if(image){ const img=document.createElement('img'); img.src=image; layer.appendChild(img); }
    let a=$id('bgAudioV77'); if(!a){a=document.createElement('audio');a.id='bgAudioV77';a.loop=true;a.preload='metadata';document.body.appendChild(a)}
    if(audio){a.src=audio; a.volume=Math.min(1,Math.max(0,Number(s.audioVolume||0.35))); const play=()=>a.play().catch(()=>{}); ['click','touchstart','keydown'].forEach(ev=>document.addEventListener(ev,play,{once:true,passive:true}));} else {a.removeAttribute('src'); try{a.pause()}catch{}}
  }
  function validateImage16x9(url){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>{const r=i.naturalWidth/i.naturalHeight;if(r<1.60||r>1.90)rej(new Error('Foto background wajib horizontal 16:9.'));else res(true)};i.onerror=()=>rej(new Error('Gambar tidak bisa dibuka.'));i.src=url})}
  function validateVideo9x16(url){return new Promise((res,rej)=>{const v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>{const r=v.videoWidth/v.videoHeight;if(r<0.50||r>0.63)rej(new Error('Video background wajib vertikal 9:16.'));else res(true)};v.onerror=()=>rej(new Error('Video tidak bisa dibuka.'));v.src=url})}
  window.saveMediaV77=async function(){
    try{
      const image=($id('mediaImgV77')?.value||'').trim(), video=($id('mediaVidV77')?.value||'').trim(), audio=($id('mediaAudV77')?.value||'').trim(), audioVolume=Number($id('mediaVolV77')?.value||0.35);
      if(image) await validateImage16x9(image); if(video) await validateVideo9x16(video);
      saveSite({mediaV77:{image,video,audio,audioVolume}}); applyMediaV77(); notify('Media background disimpan.');
    }catch(e){notify(e.message||FRIENDLY_ERR,'err')}
  };
  window.clearMediaV77=function(){saveSite({mediaV77:{image:'',video:'',audio:'',audioVolume:.35}});applyMediaV77();notify('Media background dibersihkan.');}

  function apiInputsV77(){
    const s=site(); return `<div class="panel"><h3>🔐 API Owner</h3><p class="muted">API tidak disensor di owner panel. Admin tidak bisa lihat bagian ini.</p><div class="gridV77"><input class="input" id="apiAlipBaseV77" value="${attr((window.APIS&&APIS.alipBase)||lsGet('alipBase','https://docs-alip.clutch.web.id'))}" placeholder="Alip Base"><input class="input" id="apiAlipKeyV77" value="${attr((window.APIS&&APIS.alipKey)||lsGet('alipKey',''))}" placeholder="Alip Key"><input class="input" id="apiCukiBaseV77" value="${attr((window.CUKI_API&&CUKI_API.base)||lsGet('cukiBase','https://api.cuki.biz.id'))}" placeholder="Cuki Base"><input class="input" id="apiCukiKeyV77" value="${attr((window.CUKI_API&&CUKI_API.key)||lsGet('cukiKey','cuki-x'))}" placeholder="Cuki Key"><input class="input" id="apiNexrayBaseV77" value="${attr((window.APIS&&APIS.nexrayBase)||lsGet('nexrayBase','https://api.nexray.eu.cc'))}" placeholder="NexRay Base"><input class="input" id="apiOurinBaseV77" value="${attr((window.APIS&&APIS.ourinBase)||lsGet('ourinBase','https://api.ourin.my.id'))}" placeholder="Ourin Base"><input class="input" id="apiBotKeyV77" value="${attr((window.APIS&&APIS.botcahxKey)||lsGet('botcahxKey',''))}" placeholder="BotCahX Key"><input class="input" id="apiZakkiV77" value="${attr(typeof getZakkiToken==='function'?getZakkiToken():lsGet('zakkiToken',''))}" placeholder="Zakki Token"><input class="input full" id="apiRelayV77" value="${attr(s.relayUrl||'')}" placeholder="Relay Worker URL"></div><button class="btn green" style="width:100%;margin-top:10px" onclick="saveApiV77()">💾 Simpan API</button></div>`;
  }
  window.saveApiV77=function(){
    const set=(k,v)=>lsSet(k,v);
    if(window.APIS){APIS.alipBase=baseClean($id('apiAlipBaseV77')?.value)||'https://docs-alip.clutch.web.id';APIS.alipKey=($id('apiAlipKeyV77')?.value||'').trim();APIS.nexrayBase=baseClean($id('apiNexrayBaseV77')?.value)||'https://api.nexray.eu.cc';APIS.ourinBase=baseClean($id('apiOurinBaseV77')?.value)||'https://api.ourin.my.id';APIS.botcahxKey=($id('apiBotKeyV77')?.value||'').trim();}
    if(window.CUKI_API){CUKI_API.base=baseClean($id('apiCukiBaseV77')?.value)||'https://api.cuki.biz.id';CUKI_API.key=($id('apiCukiKeyV77')?.value||'cuki-x').trim();}
    set('alipBase',APIS?.alipBase||$id('apiAlipBaseV77')?.value);set('alipKey',APIS?.alipKey||$id('apiAlipKeyV77')?.value);set('cukiBase',CUKI_API?.base||$id('apiCukiBaseV77')?.value);set('cukiKey',CUKI_API?.key||$id('apiCukiKeyV77')?.value);set('nexrayBase',APIS?.nexrayBase||$id('apiNexrayBaseV77')?.value);set('ourinBase',APIS?.ourinBase||$id('apiOurinBaseV77')?.value);set('botcahxKey',APIS?.botcahxKey||$id('apiBotKeyV77')?.value);set('zakkiToken',($id('apiZakkiV77')?.value||'').trim()); saveSite({relayUrl:baseClean($id('apiRelayV77')?.value)}); notify('API disimpan tanpa sensor.');
  };
  function mediaPanel(){const m=site().mediaV77||{};return `<div class="panel"><h3>🎞️ Media Background</h3><p class="muted">Kosongkan semua kalau mau style biasa. Video wajib 9:16, muted, hanya 5 detik lalu loop. Foto wajib 16:9. Audio untuk musik latar.</p><input class="input" id="mediaImgV77" value="${attr(m.image||'')}" placeholder="URL gambar background 16:9"><input class="input" id="mediaVidV77" value="${attr(m.video||'')}" placeholder="URL video background 9:16" style="margin-top:8px"><input class="input" id="mediaAudV77" value="${attr(m.audio||'')}" placeholder="URL audio background" style="margin-top:8px"><label class="muted" style="display:block;margin-top:8px">Volume audio</label><input class="input" id="mediaVolV77" type="number" min="0" max="1" step="0.05" value="${attr(m.audioVolume??0.35)}"><div class="btnrow"><button class="btn green" onclick="saveMediaV77()">💾 Simpan Media</button><button class="btn red" onclick="clearMediaV77()">Hapus Media</button></div><div class="mediaHintV77">Video background tidak memakai audio. Kalau butuh suara, isi audio background terpisah.</div></div>`}
  function userPanel(){const users=Object.values(getU()).filter(u=>!u.system);return `<div class="panel"><h3>👑 Owner utama</h3><p class="muted">Owner hanya satu: <b>${OWNER_NAME}</b>. Role owner tidak bisa diberikan ke akun lain.</p></div><div class="panel"><h3>➕ Buat Akun Admin</h3><input class="input" id="newAdminUserV73" placeholder="username admin"><input class="input" id="newAdminDisplayV73" placeholder="nama tampil" style="margin-top:8px"><input class="input" id="newAdminPwV73" placeholder="password admin" style="margin-top:8px"><button class="btn green" style="width:100%;margin-top:8px" onclick="createAdminAccountV73&&createAdminAccountV73()">Buat Admin</button></div><div class="panel"><h3>🪪 Set Role User</h3><select id="ownRoleUserV73">${users.map(u=>`<option value="${attr(u.username)}">${esc(u.display||u.username)} (@${esc(u.username)}) - ${esc(roleOfV77(u))}</option>`).join('')}</select><select id="ownRoleValV73" style="margin-top:8px"><option value="user">User Free</option><option value="premium">Premium</option><option value="admin">Admin</option></select><button class="btn purple" style="width:100%;margin-top:8px" onclick="setUserRoleV73&&setUserRoleV73()">Simpan Role</button></div>`}

  window.setUserRoleV73=function(){
    const users=getU(), name=$id('ownRoleUserV73')?.value, r=$id('ownRoleValV73')?.value; if(!users[name])return notify('User tidak ditemukan.','err'); if(name===OWNER_NAME)return notify('Owner utama tidak bisa diubah.','err'); users[name].role=(r==='owner'?'admin':r); saveU(users); if(typeof renderAll==='function')renderAll(); if(typeof ownerTabV77==='function')ownerTabV77('user'); notify('Role user disimpan.');
  };

  function webPanel(){const s=site();return `<div class="panel"><h3>🌐 Teks Global</h3><input class="input" id="ownWebTitle" value="${attr(s.webTitle||document.title)}" placeholder="Title"><input class="input" id="ownBrand" value="${attr(s.brandName||'Remi AI') }" placeholder="Brand" style="margin-top:8px"><input class="input" id="ownBrandSub" value="${attr(s.brandSub||'STORE') }" placeholder="Subtitle" style="margin-top:8px"><textarea id="ownTicker" style="margin-top:8px" placeholder="Ticker">${esc(s.ticker||'')}</textarea><textarea id="ownHero" style="margin-top:8px" placeholder="Hero text">${esc(s.heroText||'')}</textarea><button class="btn" style="width:100%;margin-top:8px" onclick="saveOwnerWebV72&&saveOwnerWebV72()">Simpan Web</button></div>`}
  function csPanel(){const s=site();return `<div class="panel"><h3>🎧 CS Contact</h3><input class="input" id="ownCsWa" value="${attr(s.cs?.wa||'')}" placeholder="WhatsApp 628xx"><input class="input" id="ownCsChannel" value="${attr(s.cs?.channel||'')}" placeholder="Channel URL" style="margin-top:8px"><input class="input" id="ownCsGroup" value="${attr(s.cs?.group||'')}" placeholder="Group URL" style="margin-top:8px"><input class="input" id="ownCsTelegram" value="${attr(s.cs?.telegram||'')}" placeholder="Telegram URL" style="margin-top:8px"><button class="btn" style="width:100%;margin-top:8px" onclick="saveOwnerCSV72&&saveOwnerCSV72()">Simpan CS</button></div>`}

  window.openOwnerPanelV77=function(){
    if(roleOfV77()!=='owner')return notify('Hanya owner utama.','err');
    openModal('👑 Owner Panel',`<div class="ownerShellV77"><div class="ownerHeroV77"><div class="ownerKickerV77">// OWNER CONTROL //</div><div class="ownerTitleV77">Remi Owner Panel</div><div class="ownerSubV77">API, produk, media background, style, limit, CS, dan teks global. Bersih, nggak nyelip random lagi.</div></div><div class="ownerTabsV77"><button class="tab active" onclick="ownerTabV77('user')">User</button><button class="tab" onclick="ownerTabV77('limit')">Limit</button><button class="tab" onclick="ownerTabV77('style')">Style</button><button class="tab" onclick="ownerTabV77('api')">API</button><button class="tab" onclick="ownerTabV77('media')">Media</button><button class="tab" onclick="ownerTabV77('product')">Produk</button><button class="tab" onclick="ownerTabV77('web')">Web</button><button class="tab" onclick="ownerTabV77('cs')">CS</button><button class="tab" onclick="ownerTabV77('notif')">Notif</button></div><div class="ownerBodyV77" id="ownerBodyV72"></div></div>`); ownerTabV77('user');
  };
  window.ownerTabV77=function(tab){
    document.querySelectorAll('.ownerTabsV77 .tab').forEach(b=>b.classList.toggle('active',b.getAttribute('onclick')?.includes(`'${tab}'`)));
    const b=$id('ownerBodyV72'); if(!b)return;
    if(tab==='user')b.innerHTML=userPanel();
    else if(tab==='limit'&&typeof ownerTabV76==='function'){ownerTabV76('limit')}
    else if(tab==='style'&&typeof ownerTabV76==='function'){ownerTabV76('style')}
    else if(tab==='api')b.innerHTML=apiInputsV77();
    else if(tab==='media')b.innerHTML=mediaPanel();
    else if(tab==='product')b.innerHTML=typeof renderProductOwnerV76==='function'?renderProductOwnerV76():'<div class="panel">Produk belum tersedia.</div>';
    else if(tab==='web')b.innerHTML=webPanel();
    else if(tab==='cs')b.innerHTML=csPanel();
    else b.innerHTML=`<div class="panel"><h3>🔔 Notifikasi Pembelian</h3>${typeof renderNotifListV72==='function'?renderNotifListV72():'Belum ada notifikasi.'}</div>`;
  };
  window.openOwnerPanelV76=window.openOwnerPanelV77; window.openOwnerPanelV73=window.openOwnerPanelV77; window.openOwnerPanelV72=window.openOwnerPanelV77;
  window.openAdmin=function(){const r=roleOfV77(); if(r==='owner')return openOwnerPanelV77(); if(r==='admin'&&window.openStaffPanelV76)return openStaffPanelV76(); notify('Login sebagai owner/admin dulu.','warn')};

  // Hilangkan media lawas kalau belum dipasang lewat patch baru.
  function clearLegacyImagesOnce(){
    if(lsGet('v77LegacyCleaned',false))return; const s=site(); if(!s.mediaV77){saveSite({mediaV77:{image:'',video:'',audio:'',audioVolume:.35}})}; lsSet('v77LegacyCleaned',true);
  }

  function boot(){inject();normalizeOwnersV77();clearLegacyImagesOnce();applyMediaV77();addLoading();setTimeout(()=>{removeTextArtifacts();renderRolePanelV77();},500);document.title='Remi AI Store v83 Firebase Ready 78 Clean Final';}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
/* =================== END V77 PATCH =================== */



/* =================== V78 FINAL CLEAN FIX =================== */
(function(){
  const OWNER='ellpigi', OWNER_PASS='ellpigi-owner1237';
  const ERR='Fitur ini sedang ada kendala. Harap hubungi owner untuk melaporkan.';
  const $id=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}};
  const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
  const notify=(m,t='warn')=>{try{if(window.toast)return toast(m,t); if(window.notify)return notify(m,t)}catch{} console.log(m)};
  const H=p=>{try{return window.hash?hash(p):p}catch{return p}};
  const allUsers=()=>{try{return window.getUsers?getUsers():lsGet('users',{})||{}}catch{return lsGet('users',{})||{}}};
  const saveAll=u=>{try{if(window.saveUsers)return saveUsers(u)}catch{} lsSet('users',u)};
  const meSafe=()=>{try{return window.me?me():null}catch{return null}};
  const saveMeSafe=o=>{try{if(window.saveMe)return saveMe(o)}catch{} const u=meSafe(); if(!u)return; const us=allUsers(); us[u.username]={...us[u.username],...o}; saveAll(us)};
  const site=()=>{try{return window.siteSettingsV73?siteSettingsV73():lsGet('siteSettings',{})||{}}catch{return lsGet('siteSettings',{})||{}}};
  const saveSite=o=>{try{if(window.saveSiteSettingsV73)return saveSiteSettingsV73(o)}catch{} const s=site(); lsSet('siteSettings',{...s,...o,cs:{...(s.cs||{}),...((o&&o.cs)||{})}})};
  const ROLE={owner:{emoji:'👑',label:'OWNER',color:'#ffd45e'},admin:{emoji:'🛡️',label:'ADMIN',color:'#43d383'},premium:{emoji:'💎',label:'PREMIUM',color:'#b515ff'},user:{emoji:'🙂',label:'USER',color:'#8fa4c3'}};
  function roleOf(u=meSafe()){if(!u)return'user'; if(String(u.username||'').toLowerCase()===OWNER)return'owner'; const r=String(u.role||'user').toLowerCase(); return r==='owner'?'admin':r;}
  function roleStyle(r){let base={...(ROLE[r]||ROLE.user)}; try{base={...base,...((site().roleStyle||{})[r]||{})}}catch{} return base;}
  function normalizeOwner(){const u=allUsers(); let ch=false; if(!u[OWNER]){u[OWNER]={username:OWNER,display:'ellpigi',pw:H(OWNER_PASS),plain:OWNER_PASS,saldo:999999999,avatar:'',bio:'Owner utama Remi AI Store.',gender:'rahasia',orders:0,spent:0,gacha:0,streak:0,ref:'ELLPGI',role:'owner'}; ch=true;} Object.keys(u).forEach(k=>{if(k===OWNER){if(u[k].role!=='owner'){u[k].role='owner';ch=true} if(!u[k].plain){u[k].plain=OWNER_PASS;u[k].pw=H(OWNER_PASS);ch=true}} else if(String(u[k].role||'').toLowerCase()==='owner'){u[k].role='admin';ch=true}}); if(ch)saveAll(u)}
  function cleanMediaOnce(){if(lsGet('v78_media_cleaned',false))return; saveSite({mediaV77:{image:'',video:'',audio:'',audioVolume:.35}}); lsSet('v78_media_cleaned',true); try{$id('mediaBgV77')?.remove(); const a=$id('bgAudioV77'); if(a){a.pause();a.removeAttribute('src')}}catch{}}
  function initial(u){const s=String((u?.display||u?.username||'U')).trim(); return (s||'U')[0].toUpperCase();}
  function avatarHTML(u){return u?.avatar?`<img src="${esc(u.avatar)}">`:`<span class="fallbackInitialV78">${esc(initial(u))}</span>`}
  function ensureProfileButtons(){const card=$id('myAvatar')?.closest('.panel'); if(!card)return; if(!$id('profileActionsV78')){const d=document.createElement('div'); d.id='profileActionsV78'; d.className='profileBtnRow'; d.innerHTML='<button class="btn ghost" onclick="document.getElementById(\'pfpInput\')?.click()">📷 Ganti Foto Profil</button><button class="btn ghost" onclick="showOwnPassword&&showOwnPassword()">🔐 Lihat Password</button>'; const before=$id('ownPasswordBox'); card.insertBefore(d,before||null);}}
  function limitPanel(){const u=meSafe(),r=roleOf(u); if(!u)return''; if(r!=='user')return `<div class="panel"><h2>⚡ Limit Fitur</h2><p class="muted">Role kamu <b>${esc(r.toUpperCase())}</b>, jadi semua fitur unlimited.</p></div>`; const used=u.featureLimits?.used||{}, ks=Object.keys(used), lim=Number(site().globalFreeLimit||10); return `<div class="panel"><h2>🧃 Limit Fitur Free</h2><p class="muted">Limit setiap fitur: <b>${lim}</b> kali/hari. Reset otomatis jam <b>00:00 WIB</b>.</p>${ks.length?ks.map(k=>`<div class="row"><b>${esc(k)}</b><b>${used[k]}/${lim}</b></div>`).join(''):'<p class="muted">Belum ada fitur dipakai hari ini.</p>'}</div>`}
  function stylePanel(){const u=meSafe(); if(!u)return''; const r=roleOf(u), rs=roleStyle(r), st={emoji:rs.emoji,usernameColor:rs.color,chatColor:'#edf6ff',usernameFont:'Outfit',chatFont:'Outfit',...(u.chatStyle||{})}; if(!['owner','admin','premium'].includes(r))return `<div class="panel"><h2>🎨 Style Chat</h2><p class="muted">Style chat khusus Premium/Admin/Owner. User free memakai style default.</p></div>`; return `<div class="panel"><h2>🎨 Style Chat</h2><p class="muted">Atur emoji, warna, dan font untuk username, profil/stalk, dan chat global.</p><div class="ownerGridV78"><input class="input" id="styleEmojiV78" value="${esc(st.emoji)}" placeholder="Emoji"><input class="input" id="styleUserColorV78" type="color" value="${esc(st.usernameColor)}"><input class="input" id="styleChatColorV78" type="color" value="${esc(st.chatColor)}"><select id="styleUserFontV78"><option ${st.usernameFont==='Outfit'?'selected':''}>Outfit</option><option ${st.usernameFont==='Rajdhani'?'selected':''}>Rajdhani</option><option ${st.usernameFont==='DM Mono'?'selected':''}>DM Mono</option><option ${st.usernameFont==='Orbitron'?'selected':''}>Orbitron</option></select><select id="styleChatFontV78"><option ${st.chatFont==='Outfit'?'selected':''}>Outfit</option><option ${st.chatFont==='Rajdhani'?'selected':''}>Rajdhani</option><option ${st.chatFont==='DM Mono'?'selected':''}>DM Mono</option><option ${st.chatFont==='Orbitron'?'selected':''}>Orbitron</option></select></div><button class="btn purple" style="width:100%;margin-top:10px" onclick="saveChatStyleV78()">💾 Simpan Style Chat</button></div>`}
  window.saveChatStyleV78=function(){const o={emoji:$id('styleEmojiV78')?.value||'✨',usernameColor:$id('styleUserColorV78')?.value||'#8fd7ff',chatColor:$id('styleChatColorV78')?.value||'#edf6ff',usernameFont:$id('styleUserFontV78')?.value||'Outfit',chatFont:$id('styleChatFontV78')?.value||'Outfit'}; saveMeSafe({chatStyle:o}); notify('Style chat disimpan.'); try{renderChat&&renderChat()}catch{} renderRolePanelV78();};
  window.chatStylePanelV73=stylePanel;
  function renderRolePanelV78(){const u=meSafe(); if(!u)return; const r=roleOf(u), st=roleStyle(r); let box=$id('rolePanelV72')||$id('rolePanelV78'); if(!box){box=document.createElement('div'); box.id='rolePanelV78'; const page=$id('page-akun'); (page||document.body).appendChild(box)} const btns=[]; if(r==='owner')btns.push('<button class="btn purple" onclick="openOwnerPanelV78()">👑 Owner Panel</button>'); if(r==='admin')btns.push('<button class="btn green" onclick="openStaffPanelV76&&openStaffPanelV76()">🛡️ Admin Panel</button>'); btns.push('<button class="btn ghost" onclick="openPurchaseNotifsV72&&openPurchaseNotifsV72()">🔔 Notif Beli</button>'); box.innerHTML=`<div class="panel profilePanelV78"><h2 style="color:${esc(st.color)}">${esc(st.emoji)} Panel ${esc(st.label)}</h2><p class="muted">Role aktif kamu. Akses muncul sesuai role.</p><div class="roleQuickBtnsV78">${btns.join('')}</div></div>${limitPanel()}${stylePanel()}`; cleanup();}
  const oldAcc=window.renderAccount; window.renderAccount=function(){try{oldAcc&&oldAcc()}catch{} normalizeOwner(); const u=meSafe(); if(!u)return; const r=roleOf(u), st=roleStyle(r); if($id('myAvatar'))$id('myAvatar').innerHTML=avatarHTML(u); if($id('myName'))$id('myName').textContent=u.display||u.username; if($id('myUser'))$id('myUser').innerHTML=`@${esc(u.username)} • ${esc(u.gender||'rahasia')} <span class="roleMiniV78" style="color:${esc(st.color)}">${esc(st.emoji)} ${esc(st.label)}</span>`; ensureProfileButtons(); renderRolePanelV78();};
  window.renderRolePanelV78=renderRolePanelV78; window.renderRolePanelV77=renderRolePanelV78; window.renderRolePanelV76=renderRolePanelV78; window.renderRolePanelV73=renderRolePanelV78; window.renderRolePanelV72=renderRolePanelV78;
  window.viewProfile=function(username){const u=allUsers()[username]; if(!u)return notify('User tidak ditemukan.','err'); const r=roleOf(u), st={...roleStyle(r),...(u.chatStyle||{})}, mine=meSafe()?.username===u.username; const html=`<div class="profileStalkV78"><div class="profileAvatarV78" style="border-color:${esc(st.usernameColor||st.color)}">${avatarHTML(u)}</div><h2 style="color:${esc(st.usernameColor||st.color)};font-family:${esc(st.usernameFont||'Outfit')}">${esc(st.emoji||roleStyle(r).emoji)} ${esc(u.display||u.username)}</h2><p class="muted">@${esc(u.username)} • ${esc(u.gender||'rahasia')} • <b style="color:${esc(st.color)}">${esc((st.label||r).toUpperCase())}</b></p><div class="panel">${esc(u.bio||'Belum ada bio')}</div><div class="grid"><div class="panel"><b>${esc(u.orders||0)}</b><br><span class="muted">Order</span></div><div class="panel"><b>${esc(u.streak||0)}</b><br><span class="muted">Streak</span></div></div>${!mine?`<button class="btn purple" style="width:100%;margin-top:12px" onclick="openDM&&openDM('${esc(u.username)}')">Mulai Chat Pribadi</button><button class="btn red" style="width:100%;margin-top:8px" onclick="blockUser&&blockUser('${esc(u.username)}')">🚫 Blokir User</button>`:''}</div>`; openModal('👤 Profil User',html)};
  function apiPanel(){const s=site(); const v=(x)=>esc(x||''); return `<div class="panel"><h3>🔐 API Owner</h3><p class="muted">API tampil penuh di Owner Panel. Admin tidak bisa lihat bagian ini.</p><div class="ownerGridV78"><input class="input" id="apiAlipBaseV78" value="${v(window.APIS?.alipBase||lsGet('alipBase','https://docs-alip.clutch.web.id'))}" placeholder="Alip Base"><input class="input" id="apiAlipKeyV78" value="${v(window.APIS?.alipKey||lsGet('alipKey',''))}" placeholder="Alip Key"><input class="input" id="apiCukiBaseV78" value="${v(window.CUKI_API?.base||lsGet('cukiBase','https://api.cuki.biz.id'))}" placeholder="Cuki Base"><input class="input" id="apiCukiKeyV78" value="${v(window.CUKI_API?.key||lsGet('cukiKey','cuki-x'))}" placeholder="Cuki Key"><input class="input" id="apiNexrayBaseV78" value="${v(window.APIS?.nexrayBase||lsGet('nexrayBase','https://api.nexray.eu.cc'))}" placeholder="NexRay Base"><input class="input" id="apiOurinBaseV78" value="${v(window.APIS?.ourinBase||lsGet('ourinBase','https://api.ourin.my.id'))}" placeholder="Ourin Base"><input class="input" id="apiBotKeyV78" value="${v(window.APIS?.botcahxKey||lsGet('botcahxKey',''))}" placeholder="BotCahX Key"><input class="input" id="apiZakkiV78" value="${v(typeof getZakkiToken==='function'?getZakkiToken():lsGet('zakkiToken',''))}" placeholder="Zakki Token"><input class="input full" id="apiRelayV78" value="${v(s.relayUrl||'')}" placeholder="Relay Worker URL"></div><button class="btn green" style="width:100%;margin-top:10px" onclick="saveApiV78()">💾 Simpan API</button></div>`}
  window.saveApiV78=function(){const val=id=>$id(id)?.value?.trim()||''; if(window.APIS){APIS.alipBase=val('apiAlipBaseV78'); APIS.alipKey=val('apiAlipKeyV78'); APIS.nexrayBase=val('apiNexrayBaseV78'); APIS.ourinBase=val('apiOurinBaseV78'); APIS.botcahxKey=val('apiBotKeyV78');} if(window.CUKI_API){CUKI_API.base=val('apiCukiBaseV78'); CUKI_API.key=val('apiCukiKeyV78')||'cuki-x';} ['alipBase','alipKey','nexrayBase','ourinBase','botcahxKey'].forEach(k=>lsSet(k,window.APIS?.[k]||'')); lsSet('cukiBase',window.CUKI_API?.base||''); lsSet('cukiKey',window.CUKI_API?.key||''); lsSet('zakkiToken',val('apiZakkiV78')); saveSite({relayUrl:val('apiRelayV78')}); notify('API disimpan tanpa sensor.');};
  function mediaPanel(){const m=site().mediaV77||{};return `<div class="panel"><h3>🎞️ Media Background</h3><p class="muted">Kosongkan semua kalau mau style biasa. Video wajib 9:16, muted, hanya 5 detik lalu loop. Foto wajib 16:9. Audio untuk musik latar.</p><input class="input" id="mediaImgV77" value="${esc(m.image||'')}" placeholder="URL gambar background 16:9"><input class="input" id="mediaVidV77" value="${esc(m.video||'')}" placeholder="URL video background 9:16" style="margin-top:8px"><input class="input" id="mediaAudV77" value="${esc(m.audio||'')}" placeholder="URL audio background" style="margin-top:8px"><input class="input" id="mediaVolV77" type="number" min="0" max="1" step="0.05" value="${esc(m.audioVolume??0.35)}" style="margin-top:8px"><div class="btnrow"><button class="btn green" onclick="saveMediaV77&&saveMediaV77()">💾 Simpan Media</button><button class="btn red" onclick="clearMediaV77&&clearMediaV77()">Hapus Media</button></div></div>`}
  function userPanel(){const us=Object.values(allUsers()).filter(u=>!u.system);return `<div class="panel"><h3>👑 Owner utama</h3><p class="muted">Owner hanya satu: <b>${OWNER}</b>. Role owner tidak bisa diberikan ke akun lain.</p></div><div class="panel"><h3>➕ Buat Akun Admin</h3><input class="input" id="newAdminUserV73" placeholder="username admin"><input class="input" id="newAdminDisplayV73" placeholder="nama tampil" style="margin-top:8px"><input class="input" id="newAdminPwV73" placeholder="password admin" style="margin-top:8px"><button class="btn green" style="width:100%;margin-top:8px" onclick="createAdminAccountV73&&createAdminAccountV73()">Buat Admin</button></div><div class="panel"><h3>🪪 Set Role User</h3><select id="ownRoleUserV73">${us.map(u=>`<option value="${esc(u.username)}">${esc(u.display||u.username)} (@${esc(u.username)}) - ${esc(roleOf(u))}</option>`).join('')}</select><select id="ownRoleValV73" style="margin-top:8px"><option value="user">User Free</option><option value="premium">Premium</option><option value="admin">Admin</option></select><button class="btn purple" style="width:100%;margin-top:8px" onclick="setUserRoleV73&&setUserRoleV73()">Simpan Role</button></div>`}
  window.setUserRoleV73=function(){const us=allUsers(), n=$id('ownRoleUserV73')?.value, r=$id('ownRoleValV73')?.value; if(!us[n])return notify('User tidak ditemukan.','err'); if(n===OWNER)return notify('Owner utama tidak bisa diubah.','err'); us[n].role=r==='owner'?'admin':r; saveAll(us); notify('Role user disimpan.'); ownerTabV78('user')};
  function ownerTabV78(tab){document.querySelectorAll('.ownerTabsV78 .tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab)); const b=$id('ownerBodyV78')||$id('ownerBodyV72'); if(!b)return; if(tab==='user')b.innerHTML=userPanel(); else if(tab==='style')b.innerHTML=typeof ownerStylePanelV76==='function'?ownerStylePanelV76():'<div class="panel">Style global belum tersedia.</div>'; else if(tab==='limit')b.innerHTML=typeof ownerLimitPanelV73==='function'?ownerLimitPanelV73():'<div class="panel">Limit belum tersedia.</div>'; else if(tab==='api')b.innerHTML=apiPanel(); else if(tab==='media')b.innerHTML=mediaPanel(); else if(tab==='product')b.innerHTML=typeof renderProductOwnerV76==='function'?renderProductOwnerV76():'<div class="panel">Produk belum tersedia.</div>'; else if(tab==='web')b.innerHTML=typeof ownerWebPanelV76==='function'?ownerWebPanelV76():'<div class="panel">Web panel belum tersedia.</div>'; else if(tab==='cs')b.innerHTML=typeof ownerCsPanelV76==='function'?ownerCsPanelV76():'<div class="panel">CS panel belum tersedia.</div>'; else b.innerHTML=`<div class="panel"><h3>🔔 Notifikasi Pembelian</h3>${typeof renderNotifListV72==='function'?renderNotifListV72():'Belum ada notifikasi.'}</div>`; cleanup()}
  window.ownerTabV78=ownerTabV78;
  window.openOwnerPanelV78=function(){if(roleOf()!=='owner')return notify('Hanya owner utama.','err'); openModal('👑 Owner Panel',`<div class="ownerShellV78"><div class="ownerHeroV78"><div class="ownerKickerV78">// OWNER CONTROL //</div><div class="ownerTitleV78">Remi Owner Panel</div><div class="ownerSubV78">Kontrol user, API, produk, media, style, limit, CS, dan notif dalam satu panel bersih.</div></div><div class="ownerTabsV78">${['user','limit','style','api','media','product','web','cs','notif'].map((t,i)=>`<button class="tab ${i?'':'active'}" data-tab="${t}" onclick="ownerTabV78('${t}')">${t==='product'?'Produk':t.toUpperCase()}</button>`).join('')}</div><div class="ownerBodyV78" id="ownerBodyV78"></div></div>`); ownerTabV78('user')};
  window.openOwnerPanelV77=window.openOwnerPanelV78; window.openOwnerPanelV76=window.openOwnerPanelV78; window.openOwnerPanelV73=window.openOwnerPanelV78; window.openOwnerPanelV72=window.openOwnerPanelV78;
  window.openAdmin=function(){const r=roleOf(); if(r==='owner')return openOwnerPanelV78(); if(r==='admin'&&window.openStaffPanelV76)return openStaffPanelV76(); notify('Login sebagai owner/admin dulu.','warn')};
  window.toolCheckIP=function(){notify('Check IP sudah dihapus. Data akun cukup dari panel role.','warn')};
  function cleanup(){
    document.querySelectorAll('button,.btn,.tool').forEach(el=>{if(/Check IP/i.test(el.textContent||''))el.remove()});
    document.querySelectorAll('.panel').forEach(p=>{const t=p.textContent||''; if(/Info Perangkat|Akun owner default/i.test(t))p.remove(); if(/Keamanan Gateway|Token\/API tidak/i.test(t))p.innerHTML='<h3>🔐 Keamanan Gateway</h3><p class="muted">Gateway pembayaran aktif. Konfigurasi dikelola owner melalui Owner Panel.</p><div class="badgeMini">🔒 Aktif</div>';});
    document.querySelectorAll('input[type=password]').forEach(i=>{if(/api|key|token|zakki|botcah|cuki|alip|nexray|ourin|relay|fayu|neoxr/i.test(i.id+i.placeholder))i.type='text'});
    document.querySelectorAll('#loadingV77,.loadCardV77').forEach(e=>e.remove());
  }
  function injectCSS(){if($id('v78css'))return; const st=document.createElement('style'); st.id='v78css'; st.textContent=`
    #loadingV77,.loadCardV77{display:none!important}.fallbackInitialV78{display:grid;place-items:center;width:100%;height:100%;font-weight:900;font-size:1.1em}.roleMiniV78{margin-left:6px;font-weight:900}.profileBtnRow{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}.profilePanelV78,.ownerShellV78{border:1px solid var(--line);border-radius:20px;background:linear-gradient(180deg,rgba(16,26,48,.96),rgba(7,16,32,.96));padding:14px}.roleQuickBtnsV78{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.ownerHeroV78{border:1px solid var(--line);border-radius:22px;padding:16px;background:linear-gradient(135deg,rgba(var(--accent-rgb,43,220,255),.12),rgba(181,21,255,.08));margin-bottom:12px}.ownerKickerV78{font-family:monospace;font-size:10px;color:var(--muted);letter-spacing:2px}.ownerTitleV78{font-size:24px;font-weight:1000;color:var(--cyan2)}.ownerSubV78{color:var(--muted);font-size:12px}.ownerTabsV78{display:flex;gap:7px;overflow-x:auto;margin-bottom:12px}.ownerGridV78{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ownerGridV78 .full{grid-column:1/-1}.profileStalkV78{text-align:center}.profileAvatarV78{width:92px;height:92px;border:2px solid var(--cyan);border-radius:50%;margin:0 auto 12px;display:grid;place-items:center;overflow:hidden;background:linear-gradient(135deg,var(--blue),var(--cyan))}.profileAvatarV78 img{width:100%;height:100%;object-fit:cover}.authTitle,.authSub,#tabLogin,#tabReg,#loginUser,#loginPass,#regUser,#regPass,#regGender{font-family:Outfit,system-ui,sans-serif!important;letter-spacing:.3px!important}.switch button{font-family:Outfit,system-ui,sans-serif!important;letter-spacing:.3px!important}.authBox .btn{font-family:Outfit,system-ui,sans-serif!important;letter-spacing:.2px!important}`; document.head.appendChild(st)}
  function boot(){injectCSS(); normalizeOwner(); cleanMediaOnce(); cleanup(); setInterval(cleanup,700); try{new MutationObserver(cleanup).observe(document.body,{childList:true,subtree:true})}catch{} setTimeout(()=>{try{renderAccount&&renderAccount()}catch{} cleanup()},600); document.title='Remi AI Store v83 Firebase Ready 78 Clean Final'}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
/* =================== END V78 PATCH =================== */




/* ===== Remi Store v79 hotfix: clickable profile controls + owner IP stalk + unsensored API ===== */
(function(){
  'use strict';
  const OWNER_NAME='ellpigi';
  const OWNER_PASS='ellpigi-owner1237';
  const $v79=id=>document.getElementById(id);
  const escV79=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const attrV79=escV79;
  const notifyV79=(m,t='info')=>{try{toast(m,t)}catch{alert(m)}};
  const storeV79={
    get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},
    set(k,v){localStorage.setItem(k,JSON.stringify(v))}
  };
  const usersV79=()=>{try{return typeof getUsers==='function'?getUsers():storeV79.get('users',{})}catch{return storeV79.get('users',{})||{}}};
  const saveUsersV79=u=>{try{typeof saveUsers==='function'?saveUsers(u):storeV79.set('users',u)}catch{storeV79.set('users',u)}};
  const hashV79=s=>{try{return typeof hash==='function'?hash(s):'h'+String(s)}catch{return 'h'+String(s)}};
  const meV79=()=>{try{return typeof me==='function'?me():null}catch{return null}};
  const siteV79=()=>storeV79.get('siteSettingsV72',{} )||{};
  const saveSiteV79=s=>storeV79.set('siteSettingsV72',s||{});

  function normalizeOwnerV79(){
    const u=usersV79(); let changed=false;
    if(!u[OWNER_NAME]){u[OWNER_NAME]={username:OWNER_NAME,display:'ellpigi',pw:hashV79(OWNER_PASS),plain:OWNER_PASS,saldo:999999999,avatar:'',bio:'Owner utama Remi AI Store.',gender:'rahasia',orders:0,spent:0,gacha:0,streak:0,ref:'ELLPGI',role:'owner'};changed=true;}
    Object.keys(u).forEach(k=>{
      const low=String(k).toLowerCase();
      if(low===OWNER_NAME){
        if(u[k].role!=='owner'){u[k].role='owner';changed=true;}
        if(!u[k].plain || u[k].pw!==hashV79(OWNER_PASS)){u[k].plain=OWNER_PASS;u[k].pw=hashV79(OWNER_PASS);changed=true;}
        if(!u[k].display){u[k].display='ellpigi';changed=true;}
      }else if(String(u[k].role||'').toLowerCase()==='owner'){
        u[k].role='admin';changed=true;
      }
    });
    if(changed)saveUsersV79(u);
    return u;
  }
  function roleV79(u=meV79()){
    if(!u)return'user';
    if(String(u.username||'').toLowerCase()===OWNER_NAME)return'owner';
    const r=String(u.role||'user').toLowerCase();
    return r==='owner'?'admin':(r||'user');
  }
  function roleStyleV79(rOrU){
    const r=typeof rOrU==='string'?rOrU:roleV79(rOrU);
    const custom=(siteV79().roleStyles||{})[r]||{};
    const def={owner:{emoji:'👑',label:'OWNER',color:'#ffd45e'},admin:{emoji:'🛡️',label:'ADMIN',color:'#2bdcff'},premium:{emoji:'💎',label:'PREMIUM',color:'#b515ff'},user:{emoji:'🙂',label:'USER',color:'#9aa7bd'}}[r]||{};
    return {...def,...custom};
  }
  window.roleOf=roleV79; window.roleOfV79=roleV79; window.roleOfV78=roleV79; window.roleOfV77=roleV79; window.roleOfV76=roleV79; window.roleOfV73=roleV79; window.roleOfV72=roleV79;

  function avatarV79(u){
    if(u?.avatar) return `<img src="${attrV79(u.avatar)}" alt="avatar">`;
    const name=String(u?.display||u?.username||'U').trim();
    return `<span class="avatarLetterV79">${escV79(name.charAt(0).toUpperCase()||'U')}</span>`;
  }
  function ensureProfileControlsV79(){
    const page=$v79('page-akun'); if(!page)return;
    let anchor=$v79('myAvatar')?.closest('.panel') || page.querySelector('.panel') || page;
    let row=$v79('profileControlsV79');
    if(!row){
      row=document.createElement('div'); row.id='profileControlsV79'; row.className='profileBtnRow profileControlsV79';
      row.innerHTML=`<button type="button" class="btn ghost" data-action="pfp">📷 Ganti Foto Profil</button><button type="button" class="btn ghost" data-action="pw">🔐 Lihat Password</button>`;
      anchor.appendChild(row);
    }
    row.querySelector('[data-action="pfp"]').onclick=()=>{$v79('pfpInput')?.click()};
    row.querySelector('[data-action="pw"]').onclick=()=>{try{showOwnPassword()}catch{notifyV79('Password tidak bisa ditampilkan.','warn')}};
  }
  function cleanBadOldUiV79(){
    document.querySelectorAll('button,.btn,.tool,a').forEach(el=>{if(/Check\s*IP/i.test(el.textContent||''))el.remove();});
    document.querySelectorAll('.panel').forEach(p=>{
      const t=p.textContent||'';
      if(/Info Perangkat|Akun owner default/i.test(t))p.remove();
      if(/Token\/API tidak ditampilkan|Admin Panel/i.test(t)&&/Keamanan Gateway/i.test(t)){
        p.innerHTML='<h3>🔐 Keamanan Gateway</h3><p class="muted">Gateway pembayaran aktif. Konfigurasi dikelola owner melalui Owner Panel.</p><div class="badgeMini">🔒 Aktif</div>';
      }
      if(/Relay aktif otomatis\. User tidak perlu isi/i.test(t)) p.style.display='none';
    });
    document.querySelectorAll('input[type="password"][id*="api" i], input[type="password"][id*="key" i], input[type="password"][id*="token" i]').forEach(i=>i.type='text');
  }

  function limitPanelV79(){
    const u=meV79(), r=roleV79(u); if(!u)return'';
    if(r!=='user') return `<div class="panel"><h2>⚡ Limit Fitur</h2><p class="muted">Role kamu <b>${escV79(r.toUpperCase())}</b>, semua fitur unlimited.</p></div>`;
    const used=u.featureLimits?.used||{}, lim=Number(siteV79().globalFreeLimit||10), keys=Object.keys(used);
    return `<div class="panel"><h2>🧃 Limit Fitur Free</h2><p class="muted">Limit setiap fitur: <b>${lim}</b> kali/hari. Reset otomatis jam <b>00:00 WIB</b>.</p>${keys.length?keys.map(k=>`<div class="row"><b>${escV79(k)}</b><b>${Number(used[k]||0)}/${lim}</b></div>`).join(''):'<p class="muted">Belum ada fitur dipakai hari ini.</p>'}</div>`;
  }
  function stylePanelV79(){
    const u=meV79(); if(!u)return''; const r=roleV79(u); const rs=roleStyleV79(r); const st={emoji:rs.emoji,usernameColor:rs.color,chatColor:'#edf6ff',usernameFont:'Outfit',chatFont:'Outfit',...(u.chatStyle||{})};
    if(!['owner','admin','premium'].includes(r))return `<div class="panel"><h2>🎨 Style Chat</h2><p class="muted">Style chat khusus Premium/Admin/Owner. User free memakai style default.</p></div>`;
    return `<div class="panel"><h2>🎨 Style Chat</h2><p class="muted">Atur emoji, warna, dan font untuk username, profil/stalk, dan chat global.</p><div class="ownerGridV79"><input class="input" id="styleEmojiV79" value="${attrV79(st.emoji)}" placeholder="Emoji"><label>Warna Username<input class="input" id="styleUserColorV79" type="color" value="${attrV79(st.usernameColor)}"></label><label>Warna Chat<input class="input" id="styleChatColorV79" type="color" value="${attrV79(st.chatColor)}"></label><select id="styleUserFontV79"><option ${st.usernameFont==='Outfit'?'selected':''}>Outfit</option><option ${st.usernameFont==='Rajdhani'?'selected':''}>Rajdhani</option><option ${st.usernameFont==='DM Mono'?'selected':''}>DM Mono</option><option ${st.usernameFont==='Orbitron'?'selected':''}>Orbitron</option></select><select id="styleChatFontV79"><option ${st.chatFont==='Outfit'?'selected':''}>Outfit</option><option ${st.chatFont==='Rajdhani'?'selected':''}>Rajdhani</option><option ${st.chatFont==='DM Mono'?'selected':''}>DM Mono</option><option ${st.chatFont==='Orbitron'?'selected':''}>Orbitron</option></select></div><button type="button" class="btn purple" style="width:100%;margin-top:10px" onclick="saveChatStyleV79()">💾 Simpan Style Chat</button></div>`;
  }
  window.saveChatStyleV79=function(){
    const u=meV79(); if(!u)return; if(!['owner','admin','premium'].includes(roleV79(u)))return notifyV79('Style chat hanya untuk Premium/Admin/Owner.','warn');
    const users=usersV79(); users[u.username]={...u,chatStyle:{emoji:$v79('styleEmojiV79')?.value.trim().slice(0,4)||roleStyleV79(u).emoji,usernameColor:$v79('styleUserColorV79')?.value||roleStyleV79(u).color,chatColor:$v79('styleChatColorV79')?.value||'#edf6ff',usernameFont:$v79('styleUserFontV79')?.value||'Outfit',chatFont:$v79('styleChatFontV79')?.value||'Outfit'}}; saveUsersV79(users); try{current=users[u.username]}catch{}; notifyV79('Style chat disimpan.'); try{renderAll()}catch{renderAccountV79()}
  };

  function renderRolePanelV79(){
    const page=$v79('page-akun'); if(!page)return; const u=meV79(); if(!u)return;
    const r=roleV79(u), rs=roleStyleV79(r);
    let box=$v79('rolePanelV79')||$v79('rolePanelV78')||$v79('rolePanelV72');
    if(!box){box=document.createElement('div');box.id='rolePanelV79';page.appendChild(box)}
    box.id='rolePanelV79';
    const btns=[];
    if(r==='owner')btns.push('<button type="button" class="btn purple" onclick="openOwnerPanelV79()">👑 Owner Panel</button>');
    if(r==='admin')btns.push('<button type="button" class="btn green" onclick="openStaffPanelV79()">🛡️ Admin Panel</button>');
    btns.push('<button type="button" class="btn ghost" onclick="openPurchaseNotifsV72&&openPurchaseNotifsV72()">🔔 Notif Beli</button>');
    box.innerHTML=`<div class="panel profilePanelV79"><h2 style="color:${attrV79(rs.color)}">${escV79(rs.emoji)} Role: ${escV79(rs.label)}</h2><div class="roleQuickBtnsV79">${btns.join('')}</div></div>${limitPanelV79()}${stylePanelV79()}`;
  }
  function renderAccountV79(){
    try{normalizeOwnerV79()}catch{}
    const u=meV79(); if(!u)return;
    const r=roleV79(u), rs={...roleStyleV79(r),...(u.chatStyle||{})};
    if($v79('myName'))$v79('myName').textContent=u.display||u.username;
    if($v79('myUser'))$v79('myUser').innerHTML=`@${escV79(u.username)} • ${escV79(u.gender||'rahasia')} <span class="roleMiniV79" style="color:${attrV79(rs.usernameColor||rs.color)}">${escV79(rs.emoji)} ${escV79(rs.label)}</span>`;
    if($v79('myAvatar'))$v79('myAvatar').innerHTML=avatarV79(u);
    if($v79('displayName'))$v79('displayName').value=u.display||u.username;
    if($v79('gender'))$v79('gender').value=u.gender||'rahasia';
    if($v79('bio'))$v79('bio').value=u.bio||'';
    if($v79('refCode'))$v79('refCode').textContent=u.ref||u.username.toUpperCase().slice(0,6);
    ensureProfileControlsV79(); renderRolePanelV79(); cleanBadOldUiV79();
  }
  const oldRenderAccountV79=window.renderAccount;
  window.renderAccount=function(){try{oldRenderAccountV79&&oldRenderAccountV79()}catch{} renderAccountV79();};

  function getDeviceSnapshotsV79(){try{return typeof getDeviceSnapshots==='function'?getDeviceSnapshots():storeV79.get('deviceSnapshots',{})}catch{return storeV79.get('deviceSnapshots',{})||{}}}
  function getDeviceSnapshotV79(u){try{return typeof getDeviceSnapshot==='function'?getDeviceSnapshot(u):getDeviceSnapshotsV79()[u]}catch{return getDeviceSnapshotsV79()[u]||{}}}
  function deviceRowsV79(u){
    const users=usersV79(); const d={...(getDeviceSnapshotV79(u)||{})}; const target=users[u]||{username:u}; const r=roleV79(target), rs=roleStyleV79(r);
    return `<div class="stalkDeviceV79"><div class="profileMiniV79"><div class="profileMiniAvatarV79">${avatarV79(target)}</div><div><b style="color:${attrV79(rs.color)}">${escV79(rs.emoji)} ${escV79(target.display||u)}</b><br><span class="muted">@${escV79(u)} • ${escV79(rs.label)}</span></div></div><div class="deviceGridV79"><div><small>IP</small><b>${escV79(d.ip||'Belum dicek')}</b></div><div><small>Battery</small><b>${escV79(d.battery||'Belum dicek')}</b></div><div><small>Screen</small><b>${escV79(d.screen||'-')}</b></div><div><small>Viewport</small><b>${escV79(d.viewport||'-')}</b></div><div><small>Platform</small><b>${escV79(d.platform||'-')}</b></div><div><small>Timezone</small><b>${escV79(d.timezone||'-')}</b></div></div><div class="panel"><small>User Agent</small><p class="muted" style="word-break:break-all">${escV79(d.userAgent||'-')}</p><small>Last Seen</small><p class="muted">${escV79(d.lastSeen||'-')}</p></div></div>`;
  }
  function ipStalkPanelV79(){
    const all=getDeviceSnapshotsV79(), users=usersV79();
    const names=[...new Set([...Object.keys(users||{}),...Object.keys(all||{})])].filter(Boolean);
    const selected=$v79('ownerIpUserV79')?.value || names[0] || '';
    return `<div class="panel"><h3>👁‍🗨 Stalk IP / Device</h3><p class="muted">Khusus owner. Ini bukan tool publik, jadi nggak nongol di akun user.</p><div class="providerInputRow"><select id="ownerIpUserV79">${names.map(n=>`<option value="${attrV79(n)}" ${n===selected?'selected':''}>${escV79(users[n]?.display||n)} (@${escV79(n)}) - ${escV79(roleV79(users[n]||{username:n}))}</option>`).join('')}</select><button type="button" class="btn green" onclick="refreshOwnerIpV79()">Lihat</button></div><div id="ownerIpResultV79" style="margin-top:10px">${selected?deviceRowsV79(selected):'<div class="panel muted">Belum ada data device.</div>'}</div></div>`;
  }
  window.refreshOwnerIpV79=function(){const u=$v79('ownerIpUserV79')?.value; if(!u)return notifyV79('Pilih user dulu.','warn'); if($v79('ownerIpResultV79'))$v79('ownerIpResultV79').innerHTML=deviceRowsV79(u); notifyV79('Data user ditampilkan.');};

  function apiPanelV79(){
    const s=siteV79(), ap=window.APIS||{};
    const get=(k,d='')=>storeV79.get(k,d);
    return `<div class="panel"><h3>🔐 API Owner</h3><p class="muted">Tidak disensor. Owner bisa lihat dan edit full.</p><div class="ownerGridV79"><input class="input" type="text" id="apiAlipBaseV79" value="${attrV79(ap.alipBase||get('alipBase','https://docs-alip.clutch.web.id'))}" placeholder="Alip Base"><input class="input" type="text" id="apiAlipKeyV79" value="${attrV79(ap.alipKey||get('alipKey','alipaiapikeybaru'))}" placeholder="Alip Key"><input class="input" type="text" id="apiCukiBaseV79" value="${attrV79(get('cukiBase','https://api.cuki.biz.id'))}" placeholder="Cuki Base"><input class="input" type="text" id="apiCukiKeyV79" value="${attrV79(get('cukiKey','cuki-x'))}" placeholder="Cuki Key"><input class="input" type="text" id="apiNexrayBaseV79" value="${attrV79(ap.nexrayBase||get('nexrayBase','https://api.nexray.eu.cc'))}" placeholder="NexRay Base"><input class="input" type="text" id="apiOurinBaseV79" value="${attrV79(ap.ourinBase||get('ourinBase','https://api.ourin.my.id'))}" placeholder="Ourin Base"><input class="input" type="text" id="apiBotKeyV79" value="${attrV79(ap.botcahxKey||get('botcahxKey',''))}" placeholder="BotCahX Key"><input class="input" type="text" id="apiZakkiV79" value="${attrV79(get('zakkiToken',''))}" placeholder="Zakki Token"><input class="input full" type="text" id="apiRelayV79" value="${attrV79(s.relayUrl||get('relayUrl',''))}" placeholder="Relay Worker URL"></div><button type="button" class="btn green" style="width:100%;margin-top:10px" onclick="saveApiV79()">💾 Simpan API</button></div>`;
  }
  window.saveApiV79=function(){
    const s=siteV79();
    const set=(k,id)=>storeV79.set(k,$v79(id)?.value.trim()||'');
    set('alipBase','apiAlipBaseV79'); set('alipKey','apiAlipKeyV79'); set('cukiBase','apiCukiBaseV79'); set('cukiKey','apiCukiKeyV79'); set('nexrayBase','apiNexrayBaseV79'); set('ourinBase','apiOurinBaseV79'); set('botcahxKey','apiBotKeyV79'); set('zakkiToken','apiZakkiV79');
    s.relayUrl=$v79('apiRelayV79')?.value.trim()||''; saveSiteV79(s);
    try{ if(window.APIS){APIS.alipBase=storeV79.get('alipBase',APIS.alipBase); APIS.alipKey=storeV79.get('alipKey',APIS.alipKey); APIS.nexrayBase=storeV79.get('nexrayBase',APIS.nexrayBase); APIS.ourinBase=storeV79.get('ourinBase',APIS.ourinBase); APIS.botcahxKey=storeV79.get('botcahxKey',APIS.botcahxKey);} }catch{}
    notifyV79('API disimpan tanpa sensor.');
  };
  function userPanelV79(){
    const us=Object.values(usersV79()).filter(u=>!u.system);
    return `<div class="panel"><h3>👑 Owner utama</h3><p class="muted">Owner cuma satu: <b>${OWNER_NAME}</b>. Password tidak ditampilkan di halaman user.</p></div><div class="panel"><h3>➕ Buat Akun Admin</h3><input class="input" id="newAdminUserV73" placeholder="username admin"><input class="input" id="newAdminDisplayV73" placeholder="nama tampil" style="margin-top:8px"><input class="input" id="newAdminPwV73" placeholder="password admin" style="margin-top:8px"><button type="button" class="btn green" style="width:100%;margin-top:8px" onclick="createAdminAccountV73&&createAdminAccountV73()">Buat Admin</button></div><div class="panel"><h3>🪪 Set Role User</h3><select id="ownRoleUserV73">${us.map(u=>`<option value="${attrV79(u.username)}">${escV79(u.display||u.username)} (@${escV79(u.username)}) - ${escV79(roleV79(u))}</option>`).join('')}</select><select id="ownRoleValV73" style="margin-top:8px"><option value="user">User Free</option><option value="premium">Premium</option><option value="admin">Admin</option></select><button type="button" class="btn purple" style="width:100%;margin-top:8px" onclick="setUserRoleV73&&setUserRoleV73()">Simpan Role</button></div>`;
  }
  function mediaPanelV79(){
    const m=siteV79().mediaV77||{};
    return `<div class="panel"><h3>🎞️ Media Background</h3><p class="muted">Kosongkan semua untuk style biasa. Gambar wajib 16:9 horizontal. Video wajib 9:16 vertikal, muted, 5 detik loop. Audio latar terpisah.</p><input class="input" id="mediaImgV77" value="${attrV79(m.image||'')}" placeholder="URL gambar background 16:9"><input class="input" id="mediaVidV77" value="${attrV79(m.video||'')}" placeholder="URL video background 9:16" style="margin-top:8px"><input class="input" id="mediaAudV77" value="${attrV79(m.audio||'')}" placeholder="URL audio background" style="margin-top:8px"><input class="input" id="mediaVolV77" type="number" min="0" max="1" step="0.05" value="${attrV79(m.audioVolume??0.35)}" style="margin-top:8px"><div class="btnrow"><button type="button" class="btn green" onclick="saveMediaV77&&saveMediaV77()">💾 Simpan Media</button><button type="button" class="btn red" onclick="clearMediaV77&&clearMediaV77()">Hapus Media</button></div></div>`;
  }
  function ownerTabV79(tab){
    document.querySelectorAll('.ownerTabsV79 .tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    const b=$v79('ownerBodyV79'); if(!b)return;
    if(tab==='user')b.innerHTML=userPanelV79();
    else if(tab==='ip')b.innerHTML=ipStalkPanelV79();
    else if(tab==='api')b.innerHTML=apiPanelV79();
    else if(tab==='media')b.innerHTML=mediaPanelV79();
    else if(tab==='style')b.innerHTML=typeof ownerStylePanelV76==='function'?ownerStylePanelV76():'<div class="panel">Style global belum tersedia.</div>';
    else if(tab==='limit')b.innerHTML=typeof ownerLimitPanelV73==='function'?ownerLimitPanelV73():'<div class="panel">Limit belum tersedia.</div>';
    else if(tab==='product')b.innerHTML=typeof renderProductOwnerV76==='function'?renderProductOwnerV76():'<div class="panel">Produk belum tersedia.</div>';
    else if(tab==='web')b.innerHTML=typeof ownerWebPanelV76==='function'?ownerWebPanelV76():'<div class="panel">Web panel belum tersedia.</div>';
    else if(tab==='cs')b.innerHTML=typeof ownerCsPanelV76==='function'?ownerCsPanelV76():'<div class="panel">CS panel belum tersedia.</div>';
    else b.innerHTML=`<div class="panel"><h3>🔔 Notifikasi Pembelian</h3>${typeof renderNotifListV72==='function'?renderNotifListV72():'Belum ada notifikasi.'}</div>`;
    cleanBadOldUiV79();
  }
  window.ownerTabV79=ownerTabV79;
  window.openOwnerPanelV79=function(){
    normalizeOwnerV79();
    if(roleV79()!=='owner')return notifyV79('Hanya owner utama. Login ellpigi dulu.','err');
    const tabs=[['user','User'],['ip','Stalk IP'],['limit','Limit'],['style','Style'],['api','API'],['media','Media'],['product','Produk'],['web','Web'],['cs','CS'],['notif','Notif']];
    openModal('👑 Owner Panel',`<div class="ownerShellV79"><div class="ownerHeroV79"><div class="ownerKickerV79">// OWNER CONTROL //</div><div class="ownerTitleV79">Remi Owner Panel</div><div class="ownerSubV79">User, Stalk IP, API tanpa sensor, produk, media, style, limit, CS, dan notif.</div></div><div class="ownerTabsV79">${tabs.map((x,i)=>`<button type="button" class="tab ${i?'':'active'}" data-tab="${x[0]}" onclick="ownerTabV79('${x[0]}')">${x[1]}</button>`).join('')}</div><div class="ownerBodyV79" id="ownerBodyV79"></div></div>`);
    ownerTabV79('user');
  };
  window.openOwnerPanelV78=window.openOwnerPanelV79; window.openOwnerPanelV77=window.openOwnerPanelV79; window.openOwnerPanelV76=window.openOwnerPanelV79; window.openOwnerPanelV73=window.openOwnerPanelV79; window.openOwnerPanelV72=window.openOwnerPanelV79;
  window.openAdmin=function(){const r=roleV79(); if(r==='owner')return openOwnerPanelV79(); if(r==='admin'&&window.openStaffPanelV76)return openStaffPanelV76(); notifyV79('Login sebagai owner/admin dulu.','warn')};
  window.toolCheckIP=function(){notifyV79('Check IP publik sudah dihapus. Owner cek lewat Owner Panel → Stalk IP.','warn')};

  function injectV79Css(){
    if($v79('v79css'))return; const st=document.createElement('style'); st.id='v79css'; st.textContent=`
      button,.btn,.tab,.icon,.nav,[onclick]{pointer-events:auto!important;touch-action:manipulation!important;position:relative}.profileControlsV79{display:grid!important;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.avatarLetterV79{display:grid;place-items:center;width:100%;height:100%;font-weight:1000;font-size:28px;background:linear-gradient(135deg,var(--cyan),var(--blue));color:#06101d;border-radius:inherit}.roleMiniV79{display:inline-flex;margin-left:6px;font-weight:900}.profilePanelV79{border-color:rgba(var(--accent-rgb,43,220,255),.23)!important}.roleQuickBtnsV79{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.ownerShellV79{display:grid;gap:12px}.ownerHeroV79{border:1px solid rgba(var(--accent-rgb,43,220,255),.25);border-radius:22px;padding:16px;background:linear-gradient(135deg,rgba(var(--accent-rgb,43,220,255),.10),rgba(181,21,255,.08));box-shadow:0 10px 28px rgba(0,0,0,.25)}.ownerKickerV79{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--cyan)}.ownerTitleV79{font-size:26px;font-weight:1000;color:#fff;margin-top:6px}.ownerSubV79{color:var(--muted);font-size:12px;line-height:1.45}.ownerTabsV79{display:flex;gap:7px;overflow:auto;padding-bottom:4px}.ownerTabsV79 .tab{flex:0 0 auto}.ownerGridV79{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ownerGridV79 .full{grid-column:1/-1}.stalkDeviceV79{display:grid;gap:10px}.profileMiniV79{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:16px;padding:10px;background:rgba(124,202,255,.045)}.profileMiniAvatarV79{width:46px;height:46px;border-radius:15px;overflow:hidden;display:grid;place-items:center;background:rgba(43,220,255,.1)}.profileMiniAvatarV79 img{width:100%;height:100%;object-fit:cover}.deviceGridV79{display:grid;grid-template-columns:1fr 1fr;gap:8px}.deviceGridV79>div{border:1px solid var(--line2);border-radius:14px;padding:10px;background:rgba(124,202,255,.045)}.deviceGridV79 small{display:block;color:var(--muted);font-size:10px}.deviceGridV79 b{font-size:12px;word-break:break-word}#rolePanelV78:empty,#rolePanelV72:empty{display:none!important}@media(max-width:380px){.ownerGridV79,.deviceGridV79{grid-template-columns:1fr}.profileControlsV79{grid-template-columns:1fr}}
    `; document.head.appendChild(st);
  }
  function bootV79(){
    injectV79Css(); normalizeOwnerV79(); cleanBadOldUiV79();
    // remove old loading leftovers that can sit over UI on some Android WebView
    document.querySelectorAll('#loadingV77,.slide-flash,.slide-scanline,.slide-border').forEach(e=>{e.classList.add('hide');e.style.pointerEvents='none';setTimeout(()=>e.remove(),300)});
    try{renderAccountV79()}catch(e){console.warn('v79 account',e)}
    setTimeout(()=>{try{renderAccountV79()}catch{} cleanBadOldUiV79()},350);
    document.title='Remi AI Store v83 Firebase Ready 81 Login Click Fixed';
  }
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-action]'); if(!t)return;
    if(t.dataset.action==='pfp'){$v79('pfpInput')?.click();}
    if(t.dataset.action==='pw'){try{showOwnPassword()}catch{}}
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootV79); else bootV79();
})();



(function(){
  'use strict';
  const OWNER='ellpigi';
  const OWNER_PW='ellpigi-owner1237';
  const $=id=>document.getElementById(id);
  const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}};
  const jset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
  function h(s){try{return btoa(unescape(encodeURIComponent(String(s)))).split('').reverse().join('')}catch{return String(s)}}
  function toast80(msg,type='warn'){
    try{ if(typeof toast==='function') return toast(msg,type); }catch{}
    alert(msg);
  }
  function ensureOwner80(){
    const users=jget('users',{});
    Object.keys(users).forEach(k=>{ if(k!==OWNER && users[k] && users[k].role==='owner') users[k].role='admin'; });
    users[OWNER]={...(users[OWNER]||{}),username:OWNER,display:'ellpigi',pw:h(OWNER_PW),plain:OWNER_PW,role:'owner',saldo:999000000,avatar:(users[OWNER]||{}).avatar||'',bio:(users[OWNER]||{}).bio||'Owner utama Remi AI Store.',gender:(users[OWNER]||{}).gender||'rahasia',orders:(users[OWNER]||{}).orders||0,spent:(users[OWNER]||{}).spent||0,streak:(users[OWNER]||{}).streak||0,ref:'ELLPGI'};
    jset('users',users);
    return users;
  }
  function hideAuth80(){ const a=$('auth'); if(a){a.classList.add('hide'); a.style.display='none'; a.style.pointerEvents='none';} }
  function showAuth80(){ const a=$('auth'); if(a){a.classList.remove('hide'); a.style.display='flex'; a.style.pointerEvents='auto';} }
  window.forceLoginScreenV80=function(){
    localStorage.removeItem('session');
    try{window.current=null}catch{}
    showAuth80();
    unlockClicks80();
    toast80('Mode login dibuka.');
  };
  window.login=function(){
    try{
      const users=ensureOwner80();
      const u=String(($('loginUser')?.value||'')).trim().toLowerCase();
      const p=String(($('loginPass')?.value||''));
      if(!u || !p) return toast80('Isi username dan password dulu.','warn');
      if(!users[u] || users[u].pw!==h(p)) return toast80('Login gagal. Cek username/password.','err');
      window.current=users[u];
      jset('session',u);
      hideAuth80();
      try{ if(typeof saveDeviceSnapshot==='function') saveDeviceSnapshot(); }catch{}
      try{ if(typeof renderAll==='function') renderAll(); }catch(e){console.warn('renderAll after login',e)}
      try{ if(typeof renderAccountV79==='function') renderAccountV79(); }catch{}
      toast80('Berhasil login.');
    }catch(e){console.error(e); alert('Login error: '+(e.message||e));}
  };
  window.register=function(){
    try{
      ensureOwner80();
      const users=jget('users',{});
      const u=String(($('regUser')?.value||'')).trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
      const p=String(($('regPass')?.value||''));
      const g=String(($('regGender')?.value||'rahasia'));
      if(u.length<3||p.length<4) return toast80('Username min 3, password min 4.','warn');
      if(u===OWNER) return toast80('Username owner sudah dikunci.','err');
      if(users[u]) return toast80('Username sudah dipakai.','err');
      users[u]={username:u,display:u,pw:h(p),plain:p,saldo:0,avatar:'',bio:'Belum ada bio.',gender:g,orders:0,spent:0,gacha:0,streak:0,ref:u.toUpperCase().slice(0,6),role:'user'};
      jset('users',users); window.current=users[u]; jset('session',u); hideAuth80();
      try{ if(typeof saveDeviceSnapshot==='function') saveDeviceSnapshot(); }catch{}
      try{ if(typeof renderAll==='function') renderAll(); }catch(e){console.warn(e)}
      toast80('Akun dibuat.');
    }catch(e){console.error(e); alert('Daftar error: '+(e.message||e));}
  };
  window.guestLogin=function(){
    try{
      ensureOwner80();
      const users=jget('users',{});
      const u='guest_'+Math.random().toString(36).slice(2,6);
      const p='G-'+Math.random().toString(36).slice(2,6).toUpperCase();
      users[u]={username:u,display:'Guest '+u.split('_')[1],pw:h(p),plain:p,saldo:0,avatar:'',bio:'Akun guest otomatis.',gender:Math.random()>.5?'cowok':'cewek',orders:0,spent:0,gacha:0,streak:0,ref:u.toUpperCase().slice(0,6),role:'user'};
      jset('users',users); window.current=users[u]; jset('session',u); hideAuth80();
      try{ if(typeof saveDeviceSnapshot==='function') saveDeviceSnapshot(); }catch{}
      try{ if(typeof renderAll==='function') renderAll(); }catch(e){console.warn(e)}
      toast80('Guest masuk. Password ada di halaman Akun.');
    }catch(e){console.error(e); alert('Guest error: '+(e.message||e));}
  };
  window.switchAuth=function(t){
    const l=$('loginBox'), r=$('regBox'), tl=$('tabLogin'), tr=$('tabReg');
    if(l)l.style.display=t==='login'?'block':'none';
    if(r)r.style.display=t==='reg'?'block':'none';
    if(tl)tl.classList.toggle('active',t==='login');
    if(tr)tr.classList.toggle('active',t==='reg');
  };
  window.logout=function(){ localStorage.removeItem('session'); try{window.current=null}catch{}; showAuth80(); unlockClicks80(); toast80('Silakan login lagi.'); };
  function cleanupBad80(){
    document.querySelectorAll('button,.btn,.tool,.panel').forEach(el=>{
      const tx=(el.textContent||'').trim();
      if(/Check\s*IP/i.test(tx)) el.remove();
      if(/Akun owner default/i.test(tx)) el.remove();
    });
    document.querySelectorAll('input[type="password"][id*="api" i],input[type="password"][placeholder*="key" i],input[type="password"][placeholder*="token" i]').forEach(i=>i.type='text');
    document.querySelectorAll('#loadingV77,.slide-flash,.slide-scanline,.slide-border,.app-loader,.loading-screen').forEach(e=>{e.style.pointerEvents='none';e.style.display='none';});
  }
  function addSwitchAccountButton80(){
    if($('switchAccountV80'))return;
    const b=document.createElement('button');
    b.id='switchAccountV80'; b.type='button'; b.textContent='↪ Login';
    b.style.cssText='position:fixed;right:10px;bottom:74px;z-index:9999;border:1px solid rgba(43,220,255,.35);background:rgba(5,12,24,.88);color:#8fd7ff;border-radius:12px;padding:8px 10px;font-weight:900;font-size:11px;box-shadow:0 0 18px rgba(43,220,255,.16);display:none';
    b.onclick=window.forceLoginScreenV80;
    document.body.appendChild(b);
  }
  function unlockClicks80(){
    if(!$('v80-click-css')){const st=document.createElement('style');st.id='v80-click-css';st.textContent=`
      .auth{z-index:99999!important;pointer-events:auto!important}.auth.hide{display:none!important;pointer-events:none!important}.auth:before,.auth:after{pointer-events:none!important}.authBox,.authBox *{pointer-events:auto!important;position:relative}.modal:not(.show),.action:not(.show),.confirmMini:not(.show),.menuPop:not(.show){pointer-events:none!important}.modal.show,.modal.show *,.action.show,.confirmMini.show,.menuPop.show{pointer-events:auto!important}button,.btn,[onclick],input,select,textarea,.nav,.icon,.pill,.tab{pointer-events:auto!important;touch-action:manipulation!important}#switchAccountV80{pointer-events:auto!important} .profileBtnRow,.profileBtnRow *{pointer-events:auto!important}
    `;document.head.appendChild(st);}
    addSwitchAccountButton80();
    const sb=$('switchAccountV80'); if(sb) sb.style.display=jget('session',null)?'block':'none';
    const owner=$('ownerQuickV80'); if(owner) owner.onclick=()=>{ if($('loginUser'))$('loginUser').value=OWNER; if($('loginPass'))$('loginPass').value=OWNER_PW; switchAuth('login'); };
    const lb=$('loginBtnV80'), gb=$('guestBtnV80'), rb=$('regBtnV80');
    if(lb) lb.onclick=window.login;
    if(gb) gb.onclick=window.guestLogin;
    if(rb) rb.onclick=window.register;
    const tabL=$('tabLogin'), tabR=$('tabReg');
    if(tabL) tabL.onclick=()=>switchAuth('login');
    if(tabR) tabR.onclick=()=>switchAuth('reg');
  }
  document.addEventListener('click',function(e){
    const t=e.target.closest('button,[data-v80-action]'); if(!t)return;
    if(t.id==='loginBtnV80'){e.preventDefault();e.stopImmediatePropagation();return window.login();}
    if(t.id==='guestBtnV80'){e.preventDefault();e.stopImmediatePropagation();return window.guestLogin();}
    if(t.id==='regBtnV80'){e.preventDefault();e.stopImmediatePropagation();return window.register();}
    if(t.id==='ownerQuickV80'){e.preventDefault();e.stopImmediatePropagation(); if($('loginUser'))$('loginUser').value=OWNER; if($('loginPass'))$('loginPass').value=OWNER_PW; switchAuth('login'); return;}
  },true);
  document.addEventListener('keydown',function(e){ if(e.key==='Enter' && $('auth') && !$('auth').classList.contains('hide')){ const isReg=$('regBox')&&$('regBox').style.display!=='none'; e.preventDefault(); isReg?window.register():window.login(); } });
  function boot80(){ ensureOwner80(); unlockClicks80(); cleanupBad80(); setInterval(()=>{unlockClicks80();cleanupBad80()},900); document.title='Remi AI Store v83 Firebase Ready 81 Login Click Fixed'; }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot80); else boot80();
})();







/* ===== Remi Store V81: Firebase realtime + clean login/profile patch ===== */
(function(){
  'use strict';
  const OWNER_USERNAME_V81='ellpigi';
  const OWNER_PASSWORD_V81='ellpigi-owner1237';
  const DB_ROOT_V81='remiStoreV81';
  let fbAppV81=null, fbDbV81=null, chatListeningV81=false, usersListeningV81=false, notifListeningV81=false;
  window.__chatCacheV81=[]; window.__usersCloudV81={};

  const $v=id=>document.getElementById(id);
  const escV=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const nowV=()=>Date.now();
  const safeRoleV=u=>String((u&&u.role)||'user').toLowerCase();
  const myV=()=>{try{return typeof me==='function'?me():null}catch{return null}};
  const lsGetV=(k,d)=>{try{return window.ls?ls.get(k,d):(localStorage.getItem(k)?JSON.parse(localStorage.getItem(k)):d)}catch{return d}};
  const lsSetV=(k,v)=>{try{window.ls?ls.set(k,v):localStorage.setItem(k,JSON.stringify(v))}catch{}};

  function notifyCornerV81(title,text,type='info'){
    let wrap=$v('cornerNotifV81');
    if(!wrap){wrap=document.createElement('div');wrap.id='cornerNotifV81';document.body.appendChild(wrap)}
    const el=document.createElement('div');el.className='cornerNotifItemV81 '+type;
    el.innerHTML=`<b>${escV(title)}</b><span>${escV(text)}</span>`;
    wrap.appendChild(el); setTimeout(()=>el.classList.add('show'),20);
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),350)},4200);
  }
  window.notifyCornerV81=notifyCornerV81;

  function cleanupV81(){
    document.querySelectorAll('#ownerQuickV80, [id*="ownerQuick"], button').forEach(el=>{
      const t=(el.textContent||'').toLowerCase();
      if(t.includes('isi login owner')||t.includes('check ip')) el.remove();
    });
    document.querySelectorAll('*').forEach(el=>{
      if(!el.children.length){
        let t=el.innerHTML||'';
        if(t.includes('ellpigi-owner1237') && !/(script|style)/i.test(el.tagName)){
          el.innerHTML=t.replace(/Akun owner default:\s*/gi,'').replace(/ellpigi\s*\/\s*ellpigi-owner1237/gi,'').replace(/ellpigi-owner1237/gi,'');
        }
        if(t.includes('Admin Panel') && !/(script|style)/i.test(el.tagName)) el.innerHTML=t.replace(/Admin Panel/g,'Owner Panel');
      }
    });
  }
  window.cleanupV81=cleanupV81;

  function ensureOwnerSingleV81(){
    try{
      const users=(typeof getUsers==='function'?getUsers():lsGetV('users',{}))||{};
      const owner=users[OWNER_USERNAME_V81]||{};
      users[OWNER_USERNAME_V81]={...owner,username:OWNER_USERNAME_V81,password:OWNER_PASSWORD_V81,display:owner.display||'ellpigi',role:'owner',gender:owner.gender||'rahasia'};
      Object.keys(users).forEach(k=>{if(k!==OWNER_USERNAME_V81 && String(users[k]?.role).toLowerCase()==='owner') users[k].role='admin'});
      lsSetV('users',users);
    }catch(e){console.warn('ensureOwnerSingleV81',e)}
  }

  function firebaseConfigV81(){
    return lsGetV('firebaseConfigV81',{
      apiKey:'', authDomain:'', databaseURL:'', projectId:'', storageBucket:'', messagingSenderId:'', appId:'', measurementId:''
    })||{};
  }
  window.firebaseConfigV81=firebaseConfigV81;
  function firebaseReadyV81(){return !!(fbDbV81 && window.firebase && firebase.database)};
  window.firebaseReadyV81=firebaseReadyV81;
  function firebaseStatusV81(){return firebaseReadyV81()?'Realtime aktif':'Realtime belum disetting'};

  function initFirebaseV81(silent=false){
    try{
      const cfg=firebaseConfigV81();
      if(!cfg.apiKey || !cfg.databaseURL || !window.firebase){ if(!silent) notifyCornerV81('Firebase belum aktif','Isi Firebase Config di Owner Panel → Firebase','warn'); return false; }
      if(!fbAppV81){
        const exists=(firebase.apps||[]).find(a=>a.name==='remiStoreV81');
        fbAppV81=exists||firebase.initializeApp(cfg,'remiStoreV81');
        fbDbV81=firebase.database(fbAppV81);
      }
      startRealtimeV81();
      syncMeV81();
      return true;
    }catch(e){ console.error(e); if(!silent) notifyCornerV81('Firebase error', e.message||'Config belum valid','err'); return false; }
  }
  window.initFirebaseV81=initFirebaseV81;

  function dbRefV81(path){ return fbDbV81.ref(`${DB_ROOT_V81}/${path}`); }

  function publicUserV81(u){
    if(!u) return null;
    return {username:u.username,display:u.display||u.username,role:safeRoleV(u),avatar:u.avatar||'',bio:u.bio||'',gender:u.gender||'rahasia',chatStyle:u.chatStyle||{},orders:u.orders||0,streak:u.streak||0,lastSeen:nowV(),ua:navigator.userAgent,platform:navigator.platform||'',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||''};
  }
  function syncMeV81(){
    if(!firebaseReadyV81())return;
    const u=myV(); if(!u||!u.username)return;
    dbRefV81(`users/${u.username}`).update(publicUserV81(u)).catch(console.warn);
  }
  window.syncMeV81=syncMeV81;

  function startRealtimeV81(){
    if(!firebaseReadyV81()) return;
    if(!chatListeningV81){
      chatListeningV81=true;
      dbRefV81('globalChat').limitToLast(500).on('value',snap=>{
        const val=snap.val()||{};
        window.__chatCacheV81=Object.entries(val).map(([id,v])=>({id,...v})).sort((a,b)=>(a.time||0)-(b.time||0));
        if(typeof renderChat==='function') renderChat();
      });
    }
    if(!usersListeningV81){
      usersListeningV81=true;
      dbRefV81('users').on('value',snap=>{
        window.__usersCloudV81=snap.val()||{};
        try{ if(typeof renderChat==='function')renderChat(); if(typeof renderAccount==='function')renderAccount(); }catch{}
      });
    }
    if(!notifListeningV81){
      notifListeningV81=true;
      dbRefV81('purchaseNotifs').limitToLast(25).on('child_added',snap=>{
        const n=snap.val()||{};
        if(!n.time || nowV()-n.time>20000) return;
        notifyCornerV81('Pembelian berhasil', `${n.display||n.user||'User'} membeli ${n.product||'produk'}`,'success');
      });
    }
  }

  function mergedUsersV81(){
    const local=(typeof getUsers==='function'?getUsers():lsGetV('users',{}))||{};
    const cloud=window.__usersCloudV81||{};
    return {...local,...cloud};
  }

  const oldLoginV81=window.login;
  window.login=function(){
    ensureOwnerSingleV81();
    const res=typeof oldLoginV81==='function'?oldLoginV81():undefined;
    setTimeout(()=>{cleanupV81();initFirebaseV81(true);syncMeV81();},250);
    return res;
  };
  const oldRegisterV81=window.register;
  window.register=function(){
    const res=typeof oldRegisterV81==='function'?oldRegisterV81():undefined;
    setTimeout(()=>{cleanupV81();initFirebaseV81(true);syncMeV81();},250);
    return res;
  };
  const oldGuestV81=window.guestLogin;
  window.guestLogin=function(){
    const res=typeof oldGuestV81==='function'?oldGuestV81():undefined;
    setTimeout(()=>{cleanupV81();initFirebaseV81(true);syncMeV81();},250);
    return res;
  };

  function fallbackMsgHTMLV81(m){
    const users=mergedUsersV81(); const u=users[m.user]||{};
    const meUser=myV()?.username; const mine=m.user===meUser;
    const text=escV(m.text||'').replace(/\n/g,'<br>');
    const display=escV(m.display||u.display||m.user||'user');
    const av=u.avatar?`<img src="${u.avatar}">`:escV((display||'?')[0].toUpperCase());
    return `<div class="msg ${mine?'me':''}" ${mine?'onclick="msgAction(\''+escV(m.id)+'\')"':''}><div class="ava" onclick="viewProfile('${escV(m.user)}')">${av}</div><div class="bubble"><div class="meta">${display}</div>${text}${m.img?`<img class="chatImg" src="${m.img}">`:''}</div></div>`;
  }
  const oldRenderChatV81=window.renderChat;
  window.renderChat=function(){
    try{
      const u=myV(); const users=mergedUsersV81();
      const online=[u,...Object.values(window.__usersCloudV81||{}).slice(-12)].filter(Boolean);
      if($v('onlineBar')) $v('onlineBar').innerHTML=online.map(x=>`<div class="onlineUser" onclick="viewProfile('${escV(x.username)}')">${escV(x.display||x.username)}</div>`).join('');
      let msgs=firebaseReadyV81()?window.__chatCacheV81:lsGetV('chat',[]).slice(-500);
      if(!msgs||!msgs.length) msgs=[{id:'welcome',user:'admin',display:'Admin Remi 📘',text:'Selamat datang di Global Chat Remi AI Store 👋\nChat akan realtime kalau Firebase sudah disetting.',time:nowV()}];
      if($v('chatMsgs')){
        $v('chatMsgs').innerHTML=msgs.map(m=>{try{return typeof msgHTML==='function'?msgHTML(m):fallbackMsgHTMLV81(m)}catch{return fallbackMsgHTMLV81(m)}}).join('');
        setTimeout(()=>{$v('chatMsgs').scrollTop=$v('chatMsgs').scrollHeight},10);
      }
    }catch(e){console.warn('renderChatV81 fallback',e); if(typeof oldRenderChatV81==='function') oldRenderChatV81();}
  };

  const oldSendChatV81=window.sendChat;
  window.sendChat=function(){
    const inp=$v('chatText'); const t=(inp?.value||'').trim(); if(!t)return;
    syncMeV81();
    if(firebaseReadyV81()){
      const u=myV()||{};
      const ref=dbRefV81('globalChat').push();
      ref.set({id:ref.key,user:u.username,display:u.display||u.username,text:typeof censorText==='function'?censorText(t):t,time:nowV()}).then(()=>{inp.value='';}).catch(e=>{notifyCornerV81('Chat gagal','Fitur ini ada kendala, hubungi owner.','err');console.warn(e)});
      return;
    }
    return typeof oldSendChatV81==='function'?oldSendChatV81():undefined;
  };
  const oldSendChatImageV81=window.sendChatImage;
  window.sendChatImage=function(inp){
    const f=inp?.files?.[0]; if(!f)return;
    if(!firebaseReadyV81()) return typeof oldSendChatImageV81==='function'?oldSendChatImageV81(inp):undefined;
    const r=new FileReader(); r.onload=()=>{const u=myV()||{}; const ref=dbRefV81('globalChat').push(); ref.set({id:ref.key,user:u.username,display:u.display||u.username,text:'',img:r.result,time:nowV()}).catch(()=>notifyCornerV81('Upload chat gagal','Fitur ini ada kendala, hubungi owner.','err')); inp.value='';}; r.readAsDataURL(f);
  };
  const oldDelMsgV81=window.delMsg;
  window.delMsg=function(){
    try{ if(firebaseReadyV81() && window.selectedMsg){ dbRefV81('globalChat/'+window.selectedMsg).remove(); if(typeof closeAction==='function')closeAction(); return; } }catch{}
    return typeof oldDelMsgV81==='function'?oldDelMsgV81():undefined;
  };

  const oldViewProfileV81=window.viewProfile;
  window.viewProfile=function(username){
    try{
      const users=mergedUsersV81(); const u=users[username]; if(!u) return (typeof toast==='function'?toast('User tidak ditemukan.','err'):notifyCornerV81('User tidak ditemukan','Tidak ada data user.','err'));
      const role=safeRoleV(u); const st=typeof roleStyleV73==='function'?roleStyleV73(role):{emoji:role==='owner'?'👑':role==='admin'?'🛡️':role==='premium'?'💎':'🙂',color:role==='owner'?'#ffd45e':'#2bdcff'};
      const av=u.avatar?`<img src="${u.avatar}">`:escV((u.display||u.username||'?')[0].toUpperCase());
      if(typeof openModal==='function') openModal('👤 Profil User',`<div class="profileStalkV81" style="--role:${escV(st.color)}"><div class="ava profileAvatarV81">${av}</div><h2 style="color:var(--role)">${escV(u.display||u.username)}</h2><div class="roleMiniV81">${escV(st.emoji)} ${escV(role.toUpperCase())}</div><p class="muted">@${escV(u.username)} • ${escV(u.gender||'rahasia')}</p><div class="panel">${escV(u.bio||'Belum ada bio')}</div><div class="grid"><div class="panel"><b>${u.orders||0}</b><br><span class="muted">Order</span></div><div class="panel"><b>${u.streak||0}</b><br><span class="muted">Streak</span></div></div>${myV()?.username!==u.username?`<button class="btn purple" style="width:100%;margin-top:12px" onclick="openDM('${escV(u.username)}')">Mulai Chat Pribadi</button><button class="btn red" style="width:100%;margin-top:8px" onclick="blockUser('${escV(u.username)}')">🚫 Blokir User</button>`:''}</div>`);
    }catch(e){ if(typeof oldViewProfileV81==='function') return oldViewProfileV81(username); }
  };

  function firebaseFormV81(){const c=firebaseConfigV81();return `<div class="ownerGridV81"><div class="panel"><h3>🔥 Firebase Realtime</h3><p class="muted">Isi config dari Firebase Console → Project settings → Web app. Setelah disimpan, Global Chat dan user online jadi realtime.</p><label>apiKey</label><input class="input" id="fbApiKeyV81" value="${escV(c.apiKey||'')}"><label>authDomain</label><input class="input" id="fbAuthDomainV81" value="${escV(c.authDomain||'')}"><label>databaseURL</label><input class="input" id="fbDatabaseURLV81" value="${escV(c.databaseURL||'')}"><label>projectId</label><input class="input" id="fbProjectIdV81" value="${escV(c.projectId||'')}"><label>storageBucket</label><input class="input" id="fbStorageBucketV81" value="${escV(c.storageBucket||'')}"><label>messagingSenderId</label><input class="input" id="fbSenderV81" value="${escV(c.messagingSenderId||'')}"><label>appId</label><input class="input" id="fbAppIdV81" value="${escV(c.appId||'')}"><button class="btn purple" style="width:100%;margin-top:10px" onclick="saveFirebaseConfigV81()">💾 Simpan Firebase</button><button class="btn ghost" style="width:100%;margin-top:8px" onclick="testFirebaseV81()">🧪 Test Realtime</button></div><div class="panel"><h3>Status</h3><p class="muted">${escV(firebaseStatusV81())}</p><p class="muted">Kalau belum diisi, chat tetap pakai localStorage, alias pura-pura global. Tragis tapi jujur 😑</p></div></div>`;}
  window.saveFirebaseConfigV81=function(){const cfg={apiKey:$v('fbApiKeyV81')?.value.trim()||'',authDomain:$v('fbAuthDomainV81')?.value.trim()||'',databaseURL:$v('fbDatabaseURLV81')?.value.trim()||'',projectId:$v('fbProjectIdV81')?.value.trim()||'',storageBucket:$v('fbStorageBucketV81')?.value.trim()||'',messagingSenderId:$v('fbSenderV81')?.value.trim()||'',appId:$v('fbAppIdV81')?.value.trim()||''};lsSetV('firebaseConfigV81',cfg);notifyCornerV81('Firebase disimpan','Reload halaman kalau config baru pertama kali diisi.','success');initFirebaseV81(false);};
  window.testFirebaseV81=function(){if(!initFirebaseV81(false))return; dbRefV81('tests/last').set({time:nowV(),by:myV()?.username||'unknown'}).then(()=>notifyCornerV81('Firebase aktif','Write test berhasil.','success')).catch(e=>notifyCornerV81('Firebase gagal',e.message||'Cek rules/config.','err'));};

  const oldOwnerV81=window.openOwnerPanelV79||window.openOwnerPanelV78||window.openOwnerPanelV76||window.openOwnerPanelV73;
  window.openOwnerPanelV81=function(){
    if(safeRoleV(myV())!=='owner' || myV()?.username!==OWNER_USERNAME_V81) return notifyCornerV81('Akses ditolak','Owner hanya ellpigi.','err');
    if(typeof openModal!=='function') return;
    openModal('👑 Owner Panel',`<div class="ownerShellV81"><div class="ownerHeroV81"><div class="ownerKickerV81">// OWNER CONTROL //</div><h2>ellxstore control</h2><p>Panel bersih buat API, Firebase, media, produk, user, style, dan notif.</p></div><div class="ownerTabsV81">${['dashboard','firebase','api','media','product','user','style','web','cs','notif'].map((x,i)=>`<button class="tab ${i?'':'active'}" onclick="ownerTabV81('${x}')" data-tab="${x}">${x==='product'?'Produk':x.toUpperCase()}</button>`).join('')}</div><div id="ownerBodyV81" class="ownerBodyV81"></div></div>`);
    ownerTabV81('dashboard');
  };
  window.openOwnerPanelV79=window.openOwnerPanelV81; window.openOwnerPanelV78=window.openOwnerPanelV81; window.openOwnerPanelV76=window.openOwnerPanelV81; window.openOwnerPanelV73=window.openOwnerPanelV81; window.openOwnerPanelV72=window.openOwnerPanelV81;
  window.openAdmin=function(){const u=myV(); if(safeRoleV(u)==='owner')return openOwnerPanelV81(); if(safeRoleV(u)==='admin'&&window.openStaffPanelV76)return openStaffPanelV76(); showPage&&showPage('akun'); notifyCornerV81('Login dulu','Masuk sebagai owner/admin untuk panel.','warn')};
  window.ownerTabV81=function(tab){document.querySelectorAll('.ownerTabsV81 .tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));const body=$v('ownerBodyV81'); if(!body)return; if(tab==='firebase') body.innerHTML=firebaseFormV81(); else if(tab==='dashboard') body.innerHTML=`<div class="ownerGridV81"><div class="panel"><h3>Realtime</h3><p class="muted">${escV(firebaseStatusV81())}</p><button class="btn purple" onclick="ownerTabV81('firebase')">🔥 Setting Firebase</button></div><div class="panel"><h3>Owner</h3><p class="muted">Owner utama: <b>ellpigi</b>. Password tidak ditampilkan di UI, karena akhirnya kita berhenti naruh kunci di bawah keset 😑</p></div></div>`; else if(tab==='api' && window.ownerTabV78){window.ownerTabV78('api'); const old=$v('ownerBodyV78'); body.innerHTML=old?old.innerHTML:'<div class="panel">API belum tersedia.</div>'; body.querySelectorAll('input').forEach(i=>i.type='text');} else if(window.ownerTabV78){window.ownerTabV78(tab==='product'?'product':tab); const old=$v('ownerBodyV78'); body.innerHTML=old?old.innerHTML:`<div class="panel muted">Tab ${escV(tab)} belum tersedia.</div>`; body.querySelectorAll('input[type="password"]').forEach(i=>i.type='text');} else body.innerHTML=`<div class="panel muted">Tab ${escV(tab)} belum tersedia.</div>`; cleanupV81(); };

  const oldRenderAccountV81=window.renderAccount;
  window.renderAccount=function(){ if(typeof oldRenderAccountV81==='function') oldRenderAccountV81(); setTimeout(()=>{cleanupV81();syncMeV81();},30); };

  const css=document.createElement('style'); css.textContent=`
    #ownerQuickV80,[id*="ownerQuick"]{display:none!important}.authBox .btn.ghost#ownerQuickV80{display:none!important}
    #cornerNotifV81{position:fixed;right:10px;bottom:78px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:310px}.cornerNotifItemV81{transform:translateX(120%);opacity:0;background:rgba(8,18,35,.96);border:1px solid rgba(43,220,255,.25);border-radius:16px;padding:11px 13px;box-shadow:0 14px 34px rgba(0,0,0,.45);transition:.32s;color:#edf6ff}.cornerNotifItemV81.show{transform:translateX(0);opacity:1}.cornerNotifItemV81 b{display:block;color:var(--cyan,#2bdcff);font-size:12px}.cornerNotifItemV81 span{display:block;color:var(--muted,#8ca1ba);font-size:11px;margin-top:2px}.cornerNotifItemV81.success{border-color:rgba(67,211,131,.35)}.cornerNotifItemV81.warn{border-color:rgba(255,212,94,.35)}.cornerNotifItemV81.err{border-color:rgba(255,102,122,.35)}
    .ownerShellV81{display:grid;gap:12px}.ownerHeroV81{border:1px solid rgba(43,220,255,.22);border-radius:22px;padding:18px;background:linear-gradient(135deg,rgba(43,220,255,.10),rgba(181,21,255,.07));position:relative;overflow:hidden}.ownerHeroV81:after{content:"";position:absolute;width:180px;height:180px;border-radius:50%;right:-60px;top:-70px;background:radial-gradient(circle,rgba(43,220,255,.18),transparent 65%)}.ownerKickerV81{font-family:monospace;color:var(--cyan,#2bdcff);letter-spacing:3px;font-size:10px}.ownerHeroV81 h2{margin:8px 0 4px;font-size:26px}.ownerHeroV81 p{color:var(--muted,#8ca1ba);margin:0}.ownerTabsV81{display:flex;gap:7px;overflow-x:auto}.ownerTabsV81 .tab{white-space:nowrap}.ownerBodyV81 .panel label{font-size:11px;color:var(--muted,#8ca1ba);display:block;margin:8px 0 4px}.ownerGridV81{display:grid;grid-template-columns:1fr;gap:10px}.profileStalkV81{text-align:center}.profileAvatarV81{width:88px!important;height:88px!important;margin:0 auto 12px!important;font-size:30px!important;border:2px solid var(--role,#2bdcff);box-shadow:0 0 22px color-mix(in srgb,var(--role,#2bdcff) 35%,transparent)}.roleMiniV81{display:inline-flex;border:1px solid var(--role,#2bdcff);color:var(--role,#2bdcff);border-radius:999px;padding:5px 10px;font-weight:900;margin:4px 0 8px;background:rgba(255,255,255,.04)}
    @media(min-width:700px){.ownerGridV81{grid-template-columns:1fr 1fr}}
  `; document.head.appendChild(css);

  document.addEventListener('DOMContentLoaded',()=>{ensureOwnerSingleV81();cleanupV81();initFirebaseV81(true);setTimeout(()=>{cleanupV81(); if(typeof renderChat==='function')renderChat();},400);});
  setTimeout(()=>{ensureOwnerSingleV81();cleanupV81();initFirebaseV81(true);},500);
})();



/* v82 runtime hotfix: missing admin/staff functions + safe aliases */
(function(){
  'use strict';
  const $safe = (id)=>document.getElementById(id);
  const say = (msg,type)=>{
    try{
      if(typeof window.toast==='function') return window.toast(msg,type);
      if(typeof window.notifyV79==='function') return window.notifyV79(msg,type);
      if(typeof window.notifyCornerV81==='function') return window.notifyCornerV81(type==='err'?'Error':'Info',msg,type);
      alert(msg);
    }catch{ alert(msg); }
  };
  const getLS=(k,d)=>{try{return window.ls?window.ls.get(k,d):(localStorage.getItem(k)?JSON.parse(localStorage.getItem(k)):d)}catch{return d}};
  const setLS=(k,v)=>{try{window.ls?window.ls.set(k,v):localStorage.setItem(k,JSON.stringify(v))}catch(e){console.error(e)}};

  if(typeof window.adminSetSensor!=='function'){
    window.adminSetSensor=function(status){
      try{
        setLS('sensorBadWords',!!status);
        say(status?'Sensor kata diaktifkan.':'Sensor kata dimatikan.', status?'success':'warn');
        if(typeof window.adminTab==='function') window.adminTab('filter');
      }catch(e){console.error(e); say('Gagal mengubah sensor.','err');}
    };
  }

  if(typeof window.saveFilterWords!=='function'){
    window.saveFilterWords=function(){
      try{
        const el=$safe('admBadWords');
        const words=String(el&&el.value||'').split(',').map(v=>v.trim()).filter(Boolean);
        setLS('badWords',words);
        say('Daftar kata sensor disimpan.','success');
      }catch(e){console.error(e); say('Gagal menyimpan filter.','err');}
    };
  }

  if(typeof window.checkPendingZakkiList!=='function'){
    window.checkPendingZakkiList=async function(){
      try{
        const deposits=getLS('deposits',[]);
        const pending=(Array.isArray(deposits)?deposits:[]).filter(d=>String(d&&d.status||'').toUpperCase()==='PENDING');
        if(!pending.length) return say('Tidak ada deposit pending.','warn');
        let done=0;
        for(const d of pending){
          if(d&&d.id&&typeof window.checkZakkiDeposit==='function'){
            await window.checkZakkiDeposit(d.id);
            done++;
          }
        }
        say(`Selesai cek ${done} deposit pending.`,'success');
        if(typeof window.adminTab==='function') window.adminTab('deposit');
      }catch(e){console.error(e); say('Gagal cek pending Zakki.','err');}
    };
  }

  if(typeof window.openStaffPanelV79!=='function'){
    window.openStaffPanelV79=function(){
      try{
        if(typeof window.openStaffPanelV76==='function') return window.openStaffPanelV76();
        if(typeof window.openStaffPanelV73==='function') return window.openStaffPanelV73();
        if(typeof window.openStaffPanelV72==='function') return window.openStaffPanelV72();
        if(typeof window.openAdmin==='function') return window.openAdmin();
        if(typeof window.showPage==='function') return window.showPage('akun');
        say('Admin panel belum tersedia.','warn');
      }catch(e){console.error(e); say('Gagal membuka admin panel.','err');}
    };
  }

  if(typeof window.msgAction!=='function'){
    window.msgAction=function(id){
      try{
        if(typeof window.openMsgAction==='function') return window.openMsgAction(id);
        const action=$safe('action'), card=$safe('actionCard');
        if(!action||!card) return say('Menu pesan belum tersedia.','warn');
        window.selectedMsg=id;
        card.innerHTML='<button onclick="editMsg&&editMsg()">✏️ Edit Pesan</button><button class="danger" onclick="delMsg&&delMsg()">🗑️ Hapus Pesan</button><button onclick="closeAction&&closeAction()">Batal</button>';
        action.classList.add('show');
      }catch(e){console.error(e); say('Gagal membuka aksi pesan.','err');}
    };
  }
})();



(function(){
  'use strict';
  const OWNER='ellpigi';
  const FIREBASE_CONFIG_V83={
    apiKey:'AIzaSyDgivYR6mljjYyeFH286UA8auWkVJDZUy0',
    authDomain:'ellpigi-web-store.firebaseapp.com',
    databaseURL:'https://ellpigi-web-store-default-rtdb.asia-southeast1.firebasedatabase.app/',
    projectId:'ellpigi-web-store',
    storageBucket:'ellpigi-web-store.firebasestorage.app',
    messagingSenderId:'531471360663',
    appId:'1:531471360663:web:28f8f71943e9cc42953fd2',
    measurementId:'G-EPXFJ2FVZW'
  };
  const $=id=>document.getElementById(id);
  const lsGet=(k,d)=>{try{return window.ls?window.ls.get(k,d):(localStorage.getItem(k)?JSON.parse(localStorage.getItem(k)):d)}catch{return d}};
  const lsSet=(k,v)=>{try{window.ls?window.ls.set(k,v):localStorage.setItem(k,JSON.stringify(v))}catch(e){console.error(e)}};
  const note=(title,msg,type='success')=>{try{if(typeof window.notifyCornerV81==='function')return window.notifyCornerV81(title,msg,type);if(typeof window.toast==='function')return window.toast(msg,type);console.log(title,msg)}catch(e){console.log(title,msg)}};

  function seedFirebase(){
    const saved=lsGet('firebaseConfigV81',null);
    const merged=Object.assign({},FIREBASE_CONFIG_V83,(saved&&typeof saved==='object'?saved:{}));
    // Kalau user belum isi databaseURL atau masih kosong, langsung pakai config Ellpigi.
    if(!saved || !saved.databaseURL || !saved.apiKey){
      lsSet('firebaseConfigV81',FIREBASE_CONFIG_V83);
    }else{
      lsSet('firebaseConfigV81',merged);
    }
    if(typeof window.firebaseConfigV81==='function'){
      const old=window.firebaseConfigV81;
      window.firebaseConfigV81=function(){return Object.assign({},FIREBASE_CONFIG_V83,lsGet('firebaseConfigV81',{})||{});};
    }
  }

  function removeOwnerAutofill(){
    document.querySelectorAll('button,.btn,a').forEach(el=>{
      const t=(el.textContent||'').toLowerCase();
      if(t.includes('isi login owner') || t.includes('autofill owner')) el.remove();
    });
  }

  function removePublicCheckIP(){
    document.querySelectorAll('button,.btn,.tool,.panel').forEach(el=>{
      const t=String(el.textContent||'');
      if(/Check\s*IP/i.test(t) && !/Stalk\s*IP/i.test(t)){
        if(el.classList && (el.classList.contains('panel')||el.classList.contains('tool'))) el.remove();
        else el.remove();
      }
    });
    window.toolCheckIP=function(){note('Fitur dihapus','Info perangkat hanya ada di Owner Panel → Stalk IP.','warn')};
  }

  function makeButtonsClickable(){
    const css='button,.btn,a,[onclick],.nav,.tab,.tool,.icon{pointer-events:auto!important;touch-action:manipulation!important} .auth,.modal,.box,.boxBody{pointer-events:auto!important} .loading,.splash,.slide-flash,.slide-scanline,.slide-border{pointer-events:none!important}';
    let st=document.getElementById('v83-click-css');
    if(!st){st=document.createElement('style');st.id='v83-click-css';document.head.appendChild(st)}
    st.textContent=css;
  }

  function firebaseBoot(){
    seedFirebase();
    try{
      if(typeof window.initFirebaseV81==='function'){
        const ok=window.initFirebaseV81(true);
        if(ok) note('Firebase aktif','Realtime Database sudah tersambung otomatis.','success');
      }
    }catch(e){console.error(e);note('Firebase kendala','Cek rules/config Firebase.','err')}
  }

  window.testFirebaseQuickV83=function(){
    seedFirebase();
    if(typeof window.initFirebaseV81==='function' && !window.initFirebaseV81(false)) return;
    try{
      if(window.firebase && typeof window.firebaseConfigV81==='function'){
        const app=(firebase.apps||[]).find(a=>a.name==='remiStoreV81')||firebase.initializeApp(window.firebaseConfigV81(),'remiStoreV81');
        const db=firebase.database(app);
        db.ref('tests/v83').set({time:Date.now(),by:lsGet('currentUser','guest')}).then(()=>note('Firebase aktif','Test realtime berhasil.','success')).catch(e=>note('Firebase gagal',e.message||'Rules/config bermasalah.','err'));
      }
    }catch(e){console.error(e);note('Firebase gagal',e.message||'Config bermasalah.','err')}
  };

  // Override form Firebase supaya langsung kelihatan sudah terisi, tapi masih bisa diedit owner.
  const oldFirebaseForm=window.firebaseFormV81;
  window.firebaseFormV81=function(){
    const c=Object.assign({},FIREBASE_CONFIG_V83,lsGet('firebaseConfigV81',{})||{});
    const esc=s=>String(s||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
    return `<div class="ownerGridV81"><div class="panel"><h3>🔥 Firebase Realtime</h3><p class="muted">Config Ellpigi sudah dipasang otomatis. Klik Test Realtime buat cek koneksi.</p><label>apiKey</label><input class="input" id="fbApiKeyV81" value="${esc(c.apiKey)}"><label>authDomain</label><input class="input" id="fbAuthDomainV81" value="${esc(c.authDomain)}"><label>databaseURL</label><input class="input" id="fbDatabaseURLV81" value="${esc(c.databaseURL)}"><label>projectId</label><input class="input" id="fbProjectIdV81" value="${esc(c.projectId)}"><label>storageBucket</label><input class="input" id="fbStorageBucketV81" value="${esc(c.storageBucket)}"><label>messagingSenderId</label><input class="input" id="fbSenderV81" value="${esc(c.messagingSenderId)}"><label>appId</label><input class="input" id="fbAppIdV81" value="${esc(c.appId)}"><button class="btn purple" style="width:100%;margin-top:10px" onclick="saveFirebaseConfigV81()">💾 Simpan Firebase</button><button class="btn ghost" style="width:100%;margin-top:8px" onclick="testFirebaseQuickV83()">🧪 Test Realtime</button></div><div class="panel"><h3>Status</h3><p class="muted">Realtime siap otomatis. Kalau chat belum sinkron, cek Rules Firebase sudah publish.</p><button class="btn green" onclick="testFirebaseQuickV83()">✅ Test Cepat</button></div></div>`;
  };

  const run=()=>{seedFirebase();makeButtonsClickable();removeOwnerAutofill();removePublicCheckIP();firebaseBoot();};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(run,300));
  setTimeout(run,700);
  setTimeout(run,1800);
  setInterval(()=>{removeOwnerAutofill();removePublicCheckIP();makeButtonsClickable();},2500);
})();


/* ===== REMI V1 DATABASE-FIRST BOOT PATCH ===== */
(function(){
  'use strict';
  function el(id){return document.getElementById(id)}
  function forceSeedAndRender(){
    try{ if(typeof ensureDefaults==='function') ensureDefaults(); }catch(e){console.warn('ensureDefaults failed',e)}
    try{
      const p = (typeof ls!=='undefined' && ls.get) ? ls.get('products', null) : null;
      if((!p || !Array.isArray(p) || !p.length) && typeof defaultProducts!=='undefined') ls.set('products', defaultProducts);
    }catch(e){console.warn('seed products failed', e)}
    try{ if(typeof renderAll==='function') renderAll(); }catch(e){
      console.error('renderAll failed', e);
      const box=el('products'); if(box) box.innerHTML='<div class="panel"><b>Fitur toko ada kendala.</b><p class="muted">'+String(e.message||e)+'</p></div>';
    }
  }
  window.__remiForceRender = forceSeedAndRender;
  window.addEventListener('load', function(){
    setTimeout(function(){
      const box=el('products');
      if(box && /Memuat fitur toko|Memuat data toko/i.test(box.textContent||'')) forceSeedAndRender();
    }, 500);
    setTimeout(function(){
      if(typeof initFirebaseV81==='function') { try{ initFirebaseV81(true); }catch(e){console.warn('late firebase init',e)} }
    }, 1200);
  });
})();
