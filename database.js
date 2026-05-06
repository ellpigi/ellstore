// database.js — Remi AI Store v1
// Database = data/config/realtime + handler dasar. UI tetap di index.html.
(function(){
  'use strict';

  const OWNER_USERNAME = 'ellpigi';
  const OWNER_PASSWORD = 'ellpigi-owner1237';

  const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyDgivYR6mljjYyeFH286UA8auWkVJDZUy0',
    authDomain: 'ellpigi-web-store.firebaseapp.com',
    databaseURL: 'https://ellpigi-web-store-default-rtdb.asia-southeast1.firebasedatabase.app/',
    projectId: 'ellpigi-web-store',
    storageBucket: 'ellpigi-web-store.firebasestorage.app',
    messagingSenderId: '531471360663',
    appId: '1:531471360663:web:28f8f71943e9cc42953fd2',
    measurementId: 'G-EPXFJ2FVZW'
  };

  const API_CONFIG = {
    relayUrl: 'https://ell.daffaaryagossan61.workers.dev',
    cukiBase: 'https://api.cuki.biz.id',
    cukiKey: 'cuki-x',
    nexrayBase: 'https://api.nexray.eu.cc',
    ourinBase: 'https://api.ourin.my.id',
    botcahxBase: 'https://api.botcahx.eu.org',
    botcahxKey: 'ellapikey',
    zakkiToken: '014a3b134589ee',
    alipBase: 'https://docs-alip.clutch.web.id',
    alipKey: 'alipaiapikeybaru'
  };

  const DEFAULT_PRODUCTS = [
    {id:1,name:'Sewa Bot 1 Bulan',cat:'Bot WA',price:15000,icon:'🤖',desc:'Sewa bot WhatsApp fitur lengkap, respons cepat, dan stabil untuk penggunaan harian.',reviews:[]},
    {id:2,name:'Jadi Bot Instant',cat:'Bot WA',price:10000,icon:'🎮',desc:'Nomor kamu jadi bot aktif dengan setup mudah.',reviews:[]},
    {id:3,name:'Source Code Remi AI',cat:'SC',price:25000,icon:'⚡',desc:'SC lengkap: AI, downloader, store, premium, tools, dan panel owner.',reviews:[]},
    {id:4,name:'Premium User',cat:'Premium',price:5000,icon:'💎',desc:'Akses fitur premium, style chat, dan limit lebih lega.',reviews:[]},
    {id:5,name:'Jasa Setup Bot',cat:'Jasa',price:20000,icon:'🛠️',desc:'Bantu pasang bot di panel/VPS sampai online.',reviews:[]},
    {id:6,name:'Hosting Bot 1 Bulan',cat:'Hosting',price:30000,icon:'☁️',desc:'Hosting bot stabil untuk pemakaian harian.',reviews:[]}
  ];

  const $ = window.$ = window.$ || ((id)=>document.getElementById(id));
  const $$ = window.$$ = window.$$ || ((q,root=document)=>Array.from(root.querySelectorAll(q)));

  const read = (k,d)=>{ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch{return d;} };
  const write = (k,v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){ console.warn('[DB] gagal simpan',k,e); } return v; };
  const remove = (k)=>{ try{ localStorage.removeItem(k); }catch{} };

  window.ls = window.ls || { get: read, set: write, rm: remove };

  function hash(s){ let h=0; s=String(s||''); for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return 'h'+h.toString(36); }
  window.hash = window.hash || hash;

  const escMap = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
  window.esc = window.esc || ((s)=>String(s??'').replace(/[&<>"']/g, m=>escMap[m]));
  window.attr = window.attr || window.esc;
  window.escAttr = window.escAttr || window.esc;
  window.safeEsc = window.safeEsc || window.esc;
  window.safeAttr = window.safeAttr || window.esc;
  window.attrV79 = window.attrV79 || window.esc;
  window.escV79 = window.escV79 || window.esc;

  window.fmt = window.fmt || ((n)=>'Rp'+Number(n||0).toLocaleString('id-ID'));
  window.compact = window.compact || window.fmt;
  window.makeId = window.makeId || ((p='ID')=>p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6));
  window.randomName = window.randomName || (()=>'guest_'+Math.random().toString(36).slice(2,7));
  window.currentCat = window.currentCat || 'all';
  window.lbMode = window.lbMode || 'belanja';
  window.defaultProducts = window.defaultProducts || DEFAULT_PRODUCTS;
  window.gachaItems = window.gachaItems || [['🎁','Saldo Bonus'],['💎','Premium Trial'],['🔥','Streak Bonus'],['🤖','Bot Bonus']];

  function toast(msg,type){
    const text = String(msg||'');
    const el = $('toast');
    if(el){
      el.textContent = text;
      el.className = 'toast show' + (type==='err'?' err':type==='warn'?' warn':'');
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(()=>el.classList.remove('show'),2600);
    } else console.log('[toast]', text);
  }
  window.toast = window.toast || toast;

  function initFirebase(){
    try{
      if(!window.firebase || !firebase.initializeApp || !firebase.database) return false;
      if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      window.remiFirebaseDb = firebase.database();
      return true;
    }catch(e){ console.warn('[DB] Firebase init gagal:', e.message); return false; }
  }

  function fbSet(path,value){
    try{
      if(!initFirebase() || !window.remiFirebaseDb) return Promise.resolve(false);
      return window.remiFirebaseDb.ref(path).set(value).then(()=>true).catch(e=>{console.warn('[DB] firebase set fail',path,e.message); return false;});
    }catch(e){ return Promise.resolve(false); }
  }
  function fbPush(path,value){
    try{
      if(!initFirebase() || !window.remiFirebaseDb) return Promise.resolve(false);
      return window.remiFirebaseDb.ref(path).push(value).then(()=>true).catch(e=>{console.warn('[DB] firebase push fail',path,e.message); return false;});
    }catch(e){ return Promise.resolve(false); }
  }

  function getUsers(){ return read('users',{}) || {}; }
  function saveUsers(users){ write('users', users || {}); fbSet('users', users || {}); return users; }
  window.getUsers = window.getUsers || getUsers;
  window.saveUsers = window.saveUsers || saveUsers;

  function ensureOwner(){
    const users=getUsers();
    Object.keys(users).forEach(k=>{ if(k!==OWNER_USERNAME && users[k] && users[k].role==='owner') users[k].role='admin'; });
    users[OWNER_USERNAME] = Object.assign({
      username:OWNER_USERNAME,display:'ellpigi',saldo:999000000,avatar:'',bio:'Owner Remi AI Store',gender:'rahasia',orders:0,spent:0,gacha:0,streak:0,ref:'ELL_OWNER',created:Date.now()
    }, users[OWNER_USERNAME]||{}, {role:'owner', pw:hash(OWNER_PASSWORD), plain:OWNER_PASSWORD});
    saveUsers(users);
  }

  function seed(){
    ensureOwner();
    if(!read('products',null)) write('products', DEFAULT_PRODUCTS);
    if(!read('firebaseConfig',null)) write('firebaseConfig', FIREBASE_CONFIG);
    if(!read('relayUrl',null)) write('relayUrl', API_CONFIG.relayUrl);
    Object.entries(API_CONFIG).forEach(([k,v])=>{ if(!read(k,null)) write(k,v); });
    ['chat','orders','tx','deposits','paidDeposits','purchaseNotifs','reports','privateChat','leaderboard','topupData'].forEach(k=>{ if(!read(k,null)) write(k, []); });
  }

  function me(){
    const s=read('session',null);
    const users=getUsers();
    return s && users[s] ? users[s] : null;
  }
  function saveMe(data){
    const u=me(); if(!u) return null;
    const users=getUsers();
    users[u.username]=Object.assign({}, u, data||{});
    saveUsers(users);
    window.current = users[u.username];
    return window.current;
  }
  window.me = window.me || me;
  window.saveMe = window.saveMe || saveMe;

  function finishAuth(user,msg){
    write('session', user.username);
    window.current = user;
    const auth=$('auth'); if(auth) auth.classList.add('hide');
    setTimeout(()=>{ try{ if(typeof window.renderAll==='function') window.renderAll(); }catch(e){ console.warn('[DB] renderAll:',e); } }, 20);
    toast(msg||'Berhasil.');
  }

  async function dbLogin(){
    const u=String($('loginUser')?.value||'').trim().toLowerCase();
    const p=String($('loginPass')?.value||'');
    if(!u || !p) return toast('Username dan password wajib diisi.','warn');
    const users=getUsers();
    const user=users[u];
    if(!user || user.pw!==hash(p)) return toast('Login gagal, cek username/password.','err');
    finishAuth(user,'Berhasil login.');
  }

  async function dbRegister(){
    const raw=String($('regUser')?.value||'');
    const u=raw.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
    const p=String($('regPass')?.value||'');
    const g=String($('regGender')?.value||'rahasia');
    if(u.length<3) return toast('Username minimal 3 karakter.','warn');
    if(p.length<4) return toast('Password minimal 4 karakter.','warn');
    const users=getUsers();
    if(users[u]) return toast('Username sudah dipakai.','err');
    const user={username:u,display:u,pw:hash(p),plain:p,role:'user',saldo:0,avatar:'',bio:'Belum ada bio.',gender:g,orders:0,spent:0,gacha:0,streak:0,ref:u.toUpperCase().slice(0,6),created:Date.now(),style:{}};
    users[u]=user;
    saveUsers(users);
    await fbSet('users/'+u, user);
    await fbPush('registerLogs',{user:u,time:Date.now()});
    finishAuth(user,'Akun berhasil dibuat.');
  }

  async function dbGuest(){
    const users=getUsers();
    const u=window.randomName();
    const p='G-'+Math.random().toString(36).slice(2,6).toUpperCase()+'-'+Math.floor(100+Math.random()*900);
    const user={username:u,display:'Guest '+u.split('_')[1],pw:hash(p),plain:p,role:'user',saldo:0,avatar:'',bio:'Akun guest otomatis.',gender:Math.random()>.5?'cowok':'cewek',orders:0,spent:0,gacha:0,streak:0,ref:u.toUpperCase().slice(0,6),created:Date.now(),style:{}};
    users[u]=user;
    saveUsers(users);
    await fbSet('users/'+u, user);
    finishAuth(user,'Guest dibuat. Password ada di Akun.');
  }

  // handler publik: tombol HTML memanggil ini via register/login/guestLogin.
  window.remiLogin = dbLogin;
  window.remiRegister = dbRegister;
  window.remiGuestLogin = dbGuest;
  window.login = dbLogin;
  window.register = dbRegister;
  window.guestLogin = dbGuest;
  window.RemiHandlers = {login:dbLogin, register:dbRegister, guestLogin:dbGuest};

  window.switchAuth = window.switchAuth || function(mode){
    const login=$('loginBox'), reg=$('regBox'), tl=$('tabLogin'), tr=$('tabReg');
    const isReg=mode==='reg';
    if(login) login.style.display=isReg?'none':'block';
    if(reg) reg.style.display=isReg?'block':'none';
    if(tl) tl.classList.toggle('active',!isReg);
    if(tr) tr.classList.toggle('active',isReg);
  };

  function bindAuthButtons(){
    const lb=$('loginBtnV80'), rb=$('regBtnV80'), gb=$('guestBtnV80');
    if(lb) lb.onclick=(e)=>{e&&e.preventDefault(); dbLogin();};
    if(rb) rb.onclick=(e)=>{e&&e.preventDefault(); dbRegister();};
    if(gb) gb.onclick=(e)=>{e&&e.preventDefault(); dbGuest();};
    const tl=$('tabLogin'), tr=$('tabReg');
    if(tl) tl.onclick=()=>window.switchAuth('login');
    if(tr) tr.onclick=()=>window.switchAuth('reg');
  }

  document.addEventListener('click',function(e){
    const b=e.target.closest('button'); if(!b) return;
    if(b.id==='regBtnV80'){ e.preventDefault(); e.stopImmediatePropagation(); return dbRegister(); }
    if(b.id==='loginBtnV80'){ e.preventDefault(); e.stopImmediatePropagation(); return dbLogin(); }
    if(b.id==='guestBtnV80'){ e.preventDefault(); e.stopImmediatePropagation(); return dbGuest(); }
  },true);
  document.addEventListener('keydown',function(e){
    if(e.key==='Enter' && $('auth') && !$('auth').classList.contains('hide')){
      e.preventDefault();
      const isReg=$('regBox') && $('regBox').style.display!=='none';
      isReg ? dbRegister() : dbLogin();
    }
  });

  // Realtime chat bridge sederhana: local tetap jalan, Firebase ikut sinkron kalau siap.
  const oldSendChat = window.sendChat;
  window.sendChat = function(){
    if(typeof oldSendChat==='function') oldSendChat.apply(this,arguments);
    setTimeout(()=>{ const arr=read('chat',[]); const last=Array.isArray(arr)?arr[arr.length-1]:null; if(last) fbPush('globalChat', last); },50);
  };

  // Tombol/function hantu fallback, biar runtime nggak pingsan cuma karena 1 tombol.
  const noopWarn=(name)=>{ if(typeof window[name]!=='function') window[name]=()=>toast('Fitur ini sedang ada kendala. Hubungi owner untuk melaporkan.','warn'); };
  ['adminSetSensor','saveFilterWords','checkPendingZakkiList','openStaffPanelV79','openStaffPanelV76','openStaffPanelV73'].forEach(noopWarn);

  window.REMI_DB = {OWNER_USERNAME,OWNER_PASSWORD,FIREBASE_CONFIG,API_CONFIG,DEFAULT_PRODUCTS,seed,initFirebase,fbSet,fbPush,get:read,set:write,rm:remove,login:dbLogin,register:dbRegister,guestLogin:dbGuest};

  seed();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{bindAuthButtons(); setTimeout(initFirebase,600);});
  else { bindAuthButtons(); setTimeout(initFirebase,600); }
})();
