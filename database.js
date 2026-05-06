/* Remi Store Database Addon v4 Seeded Source-Truth
   Konsep: Firebase = database utama. localStorage hanya fallback/cache sesi, karena browser frontend tetap butuh state sinkron. */
(function(){
  'use strict';

  var firebaseConfig = {
    apiKey: "AIzaSyDgivYR6mljjYyeFH286UA8auWkVJDZUy0",
    authDomain: "ellpigi-web-store.firebaseapp.com",
    databaseURL: "https://ellpigi-web-store-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "ellpigi-web-store",
    storageBucket: "ellpigi-web-store.firebasestorage.app",
    messagingSenderId: "531471360663",
    appId: "1:531471360663:web:28f8f71943e9cc42953fd2",
    measurementId: "G-EPXFJ2FVZW"
  };

  var DEFAULT_API = {
    baseurlnexray: 'https://api.nexray.eu.cc',
    baseurlourin: 'https://api.ourin.my.id',
    baseurlcuki: 'https://api.cuki.biz.id',
    baseurlalip: 'https://docs-alip.clutch.web.id',
    baseurlbotcahx: 'https://api.botcahx.eu.org',
    apikeyalip: 'alipaiapikeybaru',
    apikeycuki: 'cuki-x',
    apikeybotcahx: 'ellapikey',
    zakkiToken: '014a3b134589ee',
    relayUrl: 'https://ell.daffaaryagossan61.workers.dev'
  };

  var DB_PATHS = {
    users: 'users',
    products: 'products',
    chat: 'chat',
    orders: 'orders',
    tx: 'transactions',
    deposits: 'deposits',
    paidDeposits: 'paidDeposits',
    purchaseNotifs: 'purchaseNotifs',
    streaks: 'streaks',
    leaderboard: 'leaderboard',
    badWords: 'settings/badWords',
    sensorOn: 'settings/sensorOn',
    siteSettings: 'settings/site',
    customThemeV75: 'settings/theme/customThemeV75',
    relayBase: 'settings/api/relayUrl',
    relayUrl: 'settings/api/relayUrl',
    alipBase: 'settings/api/baseurlalip',
    alipKey: 'settings/api/apikeyalip',
    botcahxBase: 'settings/api/baseurlbotcahx',
    botcahxKey: 'settings/api/apikeybotcahx',
    cukiBase: 'settings/api/baseurlcuki',
    cukiKey: 'settings/api/apikeycuki',
    nexrayBase: 'settings/api/baseurlnexray',
    ourinBase: 'settings/api/baseurlourin',
    zakkiToken: 'settings/api/zakkiToken',
    neoxrKey: 'settings/api/neoxrKey'
  };

  var cache = Object.create(null);
  var ready = false;
  var db = null;
  var booted = false;
  var originalLs = null;

  function $(id){ return document.getElementById(id); }
  function safeText(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function cleanBase(v, fallback){
    v = String(v || '').trim();
    if(!v) return fallback || '';
    return v.replace(/\/+$/,'');
  }
  function toast(msg,type){
    if(typeof window.toast === 'function') return window.toast(msg,type);
    console.log('[Remi]', msg);
  }
  function loadScript(src){
    return new Promise(function(resolve,reject){
      if(document.querySelector('script[src="'+src+'"]')) return resolve();
      var s=document.createElement('script');
      s.src=src; s.async=true; s.onload=resolve; s.onerror=function(){reject(new Error('Gagal load '+src));};
      document.head.appendChild(s);
    });
  }
  function getPathByKey(key){
    if(DB_PATHS[key]) return DB_PATHS[key];
    if(/^remi_dm_|^dm_/.test(key)) return 'privateChats/' + key.replace(/[.#$\[\]/]/g,'_');
    return null;
  }
  function ref(path){ return db.ref(path); }
  async function dbGet(path, fallback){
    if(!db) return fallback;
    try{ var snap = await ref(path).get(); return snap.exists() ? snap.val() : fallback; }
    catch(e){ console.warn('[RemiDB get]', path, e.message); return fallback; }
  }
  async function dbSet(path, value){
    if(!db) return false;
    try{ await ref(path).set(value); return true; }
    catch(e){ console.warn('[RemiDB set]', path, e.message); return false; }
  }
  async function dbUpdate(path, value){
    if(!db) return false;
    try{ await ref(path).update(value); return true; }
    catch(e){ console.warn('[RemiDB update]', path, e.message); return false; }
  }
  async function dbPush(path, value){
    if(!db) return null;
    try{ var r = ref(path).push(); await r.set(value); return r.key; }
    catch(e){ console.warn('[RemiDB push]', path, e.message); return null; }
  }


  async function dbEnsure(path, value){
    if(!db) return false;
    try{
      var snap = await ref(path).get();
      if(!snap.exists()) await ref(path).set(value);
      return true;
    }catch(e){ console.warn('[RemiDB ensure]', path, e.message); return false; }
  }
  function asRecord(arr, keyName){
    var out = {};
    if(Array.isArray(arr)){
      arr.forEach(function(item, i){
        if(!item) return;
        var id = String(item.id || item[keyName || 'id'] || ('item_'+i)).replace(/[.#$\[\]/]/g,'_');
        out[id] = item;
      });
    }
    return out;
  }
  function defaultUserRecord(){
    var now = Date.now();
    return {
      ellpigi: {
        username:'ellpigi', password:'ellpigi-owner1237', display:'ellpigi', role:'owner',
        saldo:999999999, orders:0, spent:0, streak:0, ref:'ELLPIGI',
        style:{ emoji:'👑', usernameColor:'#ffd45e', chatColor:'#2bdcff', font:'Outfit' },
        system:true, createdAt:now, updatedAt:now
      }
    };
  }
  function defaultDbSkeleton(){
    var now = Date.now();
    return {
      _schema:{ name:'Remi AI Store Database', version:'v4-seeded-source-truth', createdAt:now, note:'Semua data utama web disimpan di Firebase. localStorage hanya cache/session.' },
      settings:{
        api: DEFAULT_API,
        site:{ brandName:'Remi AI', brandSub:'STORE • V76', webTitle:'Remi AI Store', ticker:'Remi AI Store • Premium Bot • Sewa Bot • Top Up Game • Tools AI • Deposit QRIS • Downloader • Review • Chat Global • Private Chat • Referral', relayUrl:DEFAULT_API.relayUrl, csContact:'628xxxx' },
        theme:{ customThemeV75:{ accent:'#2bdcff', accent2:'#147cff' } },
        badWords:[], sensorOn:false, limits:{ freeDefault:10, resetHour:'00:00', timezone:'Asia/Jakarta' },
        roles:{ owner:{emoji:'👑', color:'#ffd45e'}, admin:{emoji:'🛡️', color:'#43d383'}, premium:{emoji:'💎', color:'#b515ff'}, user:{emoji:'🙂', color:'#2bdcff'} }
      },
      users: defaultUserRecord(),
      accounts:{}, sessions:{}, devices:{}, products:{}, categories:{},
      chat:{ welcome:{ id:'welcome', user:'admin', display:'Admin Remi 📘', text:'Selamat datang di Global Chat Remi AI Store 👋', time:now } },
      privateChats:{ _meta:{ createdAt:now, note:'DM/inbox user tersimpan di sini' } },
      orders:{}, autoOrders:{}, ownerNotifs:{}, transactions:{}, deposits:{}, paidDeposits:{}, purchaseNotifs:{},
      streaks:{}, leaderboard:{}, reports:{}, reviews:{}, referrals:{}, limits:{}, topups:{}, live:{ online:{} },
      logs:{ boot:{ time:now, message:'Database skeleton dibuat otomatis dari database.js' } }
    };
  }
  async function seedAllDatabasePaths(){
    if(!db) return false;
    var sk = defaultDbSkeleton();
    await dbEnsure('_schema', sk._schema);
    await dbEnsure('settings/api', DEFAULT_API);
    await dbEnsure('settings/site', sk.settings.site);
    await dbEnsure('settings/theme/customThemeV75', sk.settings.theme.customThemeV75);
    await dbEnsure('settings/badWords', []);
    await dbEnsure('settings/sensorOn', false);
    await dbEnsure('settings/limits', sk.settings.limits);
    await dbEnsure('settings/roles', sk.settings.roles);
    await dbEnsure('users', sk.users);
    await dbEnsure('accounts', { _meta:{ createdAt:Date.now(), note:'Data akun tambahan. users tetap path utama.' } });
    await dbEnsure('sessions', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('devices', { _meta:{ createdAt:Date.now() } });
    var localProducts = (window.ls && ls.get && ls.get('products', null)) || window.defaultProducts || [];
    var localCats = (window.ls && ls.get && ls.get('cats', null)) || window.CATS || window.defaultCats || [];
    await dbEnsure('products', Array.isArray(localProducts) && localProducts.length ? asRecord(localProducts) : { _meta:{ createdAt:Date.now(), note:'Belum ada produk. Tambahkan dari owner panel.' } });
    await dbEnsure('categories', Array.isArray(localCats) && localCats.length ? asRecord(localCats, 'id') : { semua:{ id:'semua', name:'Semua', createdAt:Date.now() } });
    await dbEnsure('chat', sk.chat);
    await dbEnsure('privateChats', sk.privateChats);
    await dbEnsure('orders', { _meta:{ createdAt:Date.now(), note:'Order normal' } });
    await dbEnsure('autoOrders', { _meta:{ createdAt:Date.now(), note:'Bot WA membaca order sewa bot dari path ini' } });
    await dbEnsure('ownerNotifs', { _meta:{ createdAt:Date.now(), note:'Notifikasi owner/admin' } });
    await dbEnsure('transactions', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('deposits', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('paidDeposits', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('purchaseNotifs', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('streaks', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('leaderboard', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('reports', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('reviews', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('referrals', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('limits', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('topups', { _meta:{ createdAt:Date.now() } });
    await dbEnsure('live/online', { _meta:{ createdAt:Date.now() } });
    await dbUpdate('logs/lastSeed', { at:Date.now(), by:'database.js', version:'v4-seeded-source-truth' });
    return true;
  }

  window.constBaseUrl = Object.assign({}, DEFAULT_API);
  window.firebaseConfig = firebaseConfig;
  window.REMI_FIREBASE_CONFIG = firebaseConfig;
  window.REMI_DB = {
    config: firebaseConfig,
    cache: cache,
    ready: function(){ return ready; },
    get: dbGet,
    set: dbSet,
    update: dbUpdate,
    push: dbPush,
    ensure: dbEnsure,
    seedAll: seedAllDatabasePaths,
    pathForKey: getPathByKey,
    syncApiToGlobals: syncApiToGlobals,
    hydrate: hydrateImportant
  };

  function applyApiObject(api){
    api = Object.assign({}, DEFAULT_API, api || {});
    window.constBaseUrl = api;
    if(window.APIS){
      APIS.nexrayBase = cleanBase(api.baseurlnexray, DEFAULT_API.baseurlnexray);
      APIS.ourinBase = cleanBase(api.baseurlourin, DEFAULT_API.baseurlourin);
      APIS.alipBase = cleanBase(api.baseurlalip, DEFAULT_API.baseurlalip);
      APIS.botcahxBase = cleanBase(api.baseurlbotcahx, DEFAULT_API.baseurlbotcahx);
      APIS.alipKey = api.apikeyalip || APIS.alipKey || DEFAULT_API.apikeyalip;
      APIS.botcahxKey = api.apikeybotcahx || APIS.botcahxKey || DEFAULT_API.apikeybotcahx;
      APIS.relayBase = api.relayUrl || APIS.relayBase || DEFAULT_API.relayUrl || '';
    }
    try{
      localStorage.setItem('relayBase', JSON.stringify(api.relayUrl || DEFAULT_API.relayUrl || ''));
      localStorage.setItem('relayUrl', JSON.stringify(api.relayUrl || DEFAULT_API.relayUrl || ''));
      localStorage.setItem('nexrayBase', JSON.stringify(api.baseurlnexray || DEFAULT_API.baseurlnexray));
      localStorage.setItem('ourinBase', JSON.stringify(api.baseurlourin || DEFAULT_API.baseurlourin));
      localStorage.setItem('alipKey', JSON.stringify(api.apikeyalip || DEFAULT_API.apikeyalip));
      localStorage.setItem('botcahxKey', JSON.stringify(api.apikeybotcahx || DEFAULT_API.apikeybotcahx));
    }catch(e){}
    if(window.CUKI_API){
      CUKI_API.base = cleanBase(api.baseurlcuki, DEFAULT_API.baseurlcuki);
      CUKI_API.key = api.apikeycuki || DEFAULT_API.apikeycuki;
    }
    return api;
  }

  async function syncApiToGlobals(){
    var api = await dbGet('settings/api', DEFAULT_API);
    cache.__api = applyApiObject(api);
    return cache.__api;
  }

  async function seedDefaults(){
    await seedAllDatabasePaths();
  }

  function installLsBridge(){
    if(!window.ls || window.ls.__remiDbBridge) return;
    originalLs = {
      get: window.ls.get.bind(window.ls),
      set: window.ls.set.bind(window.ls),
      rm: window.ls.rm ? window.ls.rm.bind(window.ls) : function(k){ localStorage.removeItem(k); }
    };
    window.ls.get = function(key, fallback){
      if(Object.prototype.hasOwnProperty.call(cache, key)) return cache[key];
      return originalLs.get(key, fallback);
    };
    window.ls.set = function(key, value){
      cache[key] = value;
      // session/theme tetap dicache lokal agar halaman tidak login ulang setiap refresh.
      if(key === 'session' || key === 'theme' || key === 'themeAppliedV75'){
        try{ originalLs.set(key, value); }catch(e){}
      }
      var path = getPathByKey(key);
      if(path) dbSet(path, value);
      return value;
    };
    window.ls.rm = function(key){
      delete cache[key];
      try{ originalLs.rm(key); }catch(e){}
      var path = getPathByKey(key);
      if(path && db) ref(path).remove().catch(function(e){console.warn('[RemiDB rm]',e.message);});
    };
    window.ls.__remiDbBridge = true;
  }

  async function hydrateImportant(){
    if(!db) return;
    var pairs = [
      ['users','users'], ['products','products'], ['chat','chat'], ['orders','orders'], ['tx','transactions'],
      ['deposits','deposits'], ['paidDeposits','paidDeposits'], ['purchaseNotifs','purchaseNotifs'],
      ['badWords','settings/badWords'], ['sensorOn','settings/sensorOn'], ['siteSettings','settings/site'],
      ['customThemeV75','settings/theme/customThemeV75']
    ];
    for(var i=0;i<pairs.length;i++){
      var key=pairs[i][0], path=pairs[i][1];
      var val = await dbGet(path, undefined);
      if(val !== undefined && val !== null) cache[key] = val;
    }
    await syncApiToGlobals();
    try{ if(typeof window.renderAll==='function') window.renderAll(); }catch(e){ console.warn('[RemiDB renderAll]', e.message); }
  }

  function liveListeners(){
    if(!db) return;
    ref('settings/api').on('value', function(snap){
      var api = snap.val() || DEFAULT_API;
      cache.__api = applyApiObject(api);
    });
    ref('chat').limitToLast(500).on('value', function(snap){
      var val = snap.val();
      if(val){ cache.chat = Array.isArray(val) ? val : Object.values(val); try{ if(typeof renderChat==='function') renderChat(); }catch(e){} }
    });
    ref('users').on('value', function(snap){
      var val = snap.val();
      if(val){ cache.users = val; try{ if(typeof renderHeader==='function') renderHeader(); if(typeof renderLeader==='function') renderLeader(); }catch(e){} }
    });
    ref('orders').limitToLast(80).on('value', function(snap){
      var val=snap.val(); if(val) cache.orders = Array.isArray(val) ? val : Object.values(val);
    });
  }

  async function initFirebase(){
    try{
      await loadScript('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js');
      if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      db = firebase.database();
      ready = true;
      await seedDefaults();
      await hydrateImportant();
      liveListeners();
      document.dispatchEvent(new CustomEvent('remi:firebase-ready'));
      console.log('[RemiDB] Firebase ready, database jadi source utama. localStorage hanya cache sesi.');
    }catch(e){
      console.error('[RemiDB] Firebase gagal:', e);
      toast('Firebase lambat/gagal, web tetap jalan mode cache.', 'warn');
    }
  }

  function bindAuthButtons(){
    function q(id){ return document.getElementById(id); }
    var loginBtn = q('loginBtnV80') || Array.from(document.querySelectorAll('#loginBox button')).find(function(b){return /masuk/i.test(b.textContent||'') && !/guest/i.test(b.textContent||'')});
    var guestBtn = q('guestBtnV80') || Array.from(document.querySelectorAll('#loginBox button')).find(function(b){return /guest/i.test(b.textContent||'')});
    var regBtn = q('regBtnV80') || Array.from(document.querySelectorAll('#regBox button')).find(function(b){return /buat akun|daftar/i.test(b.textContent||'')});
    var tabLogin = q('tabLogin'), tabReg = q('tabReg');
    [[loginBtn,'login'],[guestBtn,'guestLogin'],[regBtn,'register']].forEach(function(pair){
      var btn=pair[0], fn=pair[1];
      if(btn && !btn.__remiDbBound){
        btn.__remiDbBound=true;
        btn.addEventListener('click', function(ev){ ev.preventDefault(); ev.stopPropagation(); if(typeof window[fn]==='function') window[fn](); else alert('Function '+fn+' belum kebaca.'); }, true);
      }
    });
    if(tabLogin && !tabLogin.__remiDbBound){ tabLogin.__remiDbBound=true; tabLogin.addEventListener('click', function(ev){ev.preventDefault(); if(typeof switchAuth==='function') switchAuth('login');}, true); }
    if(tabReg && !tabReg.__remiDbBound){ tabReg.__remiDbBound=true; tabReg.addEventListener('click', function(ev){ev.preventDefault(); if(typeof switchAuth==='function') switchAuth('reg');}, true); }
  }

  function addToolsTriggers(){
    if(!window.renderTools || window.renderTools.__remiDbPatched) return;
    var oldRenderTools = window.renderTools;
    window.renderTools = function(){
      try{ oldRenderTools.apply(this, arguments); }catch(e){ console.warn('[renderTools original]', e.message); }
      var grid = $('toolsGrid');
      if(!grid) return;
      if(!grid.querySelector('[data-remi-tool="iplookup"]')){
        grid.insertAdjacentHTML('beforeend', '<div class="tool" data-remi-tool="iplookup"><div class="toolIcon">🌍</div><h3>Check IP</h3><p>Cek kota, negara, ISP, ASN, timezone, dan Google Maps dari IP publik.</p><button class="btn purple" type="button" onclick="toolIpLookup()">Buka</button></div>');
      }
      if(!grid.querySelector('[data-remi-tool="morse"]')){
        grid.insertAdjacentHTML('beforeend', '<div class="tool" data-remi-tool="morse"><div class="toolIcon">📡</div><h3>Text ⇄ Morse</h3><p>Ubah text ke kode morse atau morse balik ke text. Offline tanpa API.</p><button class="btn purple" type="button" onclick="toolMorseCode()">Buka</button></div>');
      }
    };
    window.renderTools.__remiDbPatched = true;
    try{ window.renderTools(); }catch(e){}
  }

  window.toolIpLookup = function(){
    if(typeof openModal !== 'function') return alert('Modal belum siap');
    openModal('🌍 Check IP', '<p class="muted">Masukkan IP publik. Hasil lokasi bersifat perkiraan kota/region, bukan alamat detail.</p><input class="input" id="ipLookupInput" placeholder="Contoh: 8.8.8.8"><button class="btn" type="button" style="width:100%;margin-top:10px" onclick="runIpLookup()">🔍 Cek IP</button><div id="ipLookupResult" style="margin-top:12px"></div>');
  };
  window.runIpLookup = async function(){
    var ip = String(($('ipLookupInput')||{}).value || '').trim();
    var out = $('ipLookupResult');
    if(!out) return;
    if(!ip) return out.innerHTML='<div class="panel"><b style="color:var(--red)">IP kosong.</b></div>';
    if(!/^(?:(?:\d{1,3}\.){3}\d{1,3}|[a-fA-F0-9:]{3,})$/.test(ip)) return out.innerHTML='<div class="panel"><b style="color:var(--red)">Format IP tidak valid.</b></div>';
    out.innerHTML='<div class="panel">⏳ Mengecek IP...</div>';
    try{
      var res = await fetch('https://ipwho.is/' + encodeURIComponent(ip));
      var data = await res.json();
      if(!data || data.success === false) throw new Error(data && data.message ? data.message : 'IP tidak ditemukan');
      var lat=data.latitude, lon=data.longitude;
      var map = (lat && lon) ? 'https://www.google.com/maps?q='+encodeURIComponent(lat+','+lon) : '';
      out.innerHTML = '<div class="panel"><h3>🌍 Hasil IP</h3><div class="stalkGrid">'
        + mini('IP', data.ip || ip) + mini('Tipe', data.type || '-') + mini('Kota', data.city || '-') + mini('Region', data.region || '-')
        + mini('Negara', (data.country || '-') + ' ' + ((data.flag&&data.flag.emoji)||'')) + mini('Kode', data.country_code || '-')
        + mini('ISP', (data.connection&&data.connection.isp)||'-') + mini('ORG', (data.connection&&data.connection.org)||'-')
        + mini('ASN', (data.connection&&data.connection.asn)||'-') + mini('Timezone', (data.timezone&&data.timezone.id)||'-')
        + '</div><div class="panel" style="margin-top:12px"><b>📍 Koordinat</b><p class="debugLine">'+safeText(lat||'-')+' , '+safeText(lon||'-')+'</p>'
        + (map?'<a class="btn ghost" style="display:block;text-align:center;text-decoration:none;margin-top:10px" target="_blank" href="'+map+'">🗺️ Buka Google Maps</a>':'<p class="muted">Koordinat tidak tersedia.</p>')
        + '</div><p class="muted">Catatan: lokasi IP hanya perkiraan berdasarkan database ISP/VPN/CDN.</p></div>';
    }catch(e){
      out.innerHTML='<div class="panel"><b style="color:var(--red)">Fitur Check IP sedang kendala.</b><p class="muted">Harap hubungi owner untuk melaporkan.</p><p class="debugLine">'+safeText(e.message||e)+'</p></div>';
    }
  };
  function mini(k,v){ return '<div class="stalkMini"><span class="muted">'+safeText(k)+'</span><b>'+safeText(v)+'</b></div>'; }

  var MORSE = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.', '.':'.-.-.-', ',':'--..--', '?':'..--..', '!':'-.-.--', '/':'-..-.', '-':'-....-', '(':'-.--.', ')':'-.--.-', ':':'---...', ';':'-.-.-.', '=':'-...-', '+':'.-.-.', '@':'.--.-.' };
  var REV = Object.keys(MORSE).reduce(function(a,k){a[MORSE[k]]=k; return a;},{});
  function textToMorse(t){ return String(t||'').toUpperCase().split('').map(function(ch){ return ch===' ' ? '/' : (MORSE[ch] || ch); }).join(' '); }
  function morseToText(m){ return String(m||'').trim().split(/\s+/).map(function(code){ return code==='/' ? ' ' : (REV[code] || ''); }).join('').replace(/\s+/g,' ').trim(); }
  window.toolMorseCode = function(){
    openModal('📡 Text ⇄ Kode Morse', '<p class="muted">Logic offline. Tulis text atau kode morse, lalu pilih konversi.</p><textarea id="morseInput" placeholder="Contoh text: halo ell\nContoh morse: .... .- .-.. ---"></textarea><div class="btnrow"><button class="btn" type="button" onclick="convertTextToMorse()">Text → Morse</button><button class="btn ghost" type="button" onclick="convertMorseToText()">Morse → Text</button><button class="btn ghost" type="button" onclick="copyMorseResult()">Copy</button></div><div class="panel" style="margin-top:12px"><b>Hasil</b><p class="debugLine" id="morseResult">-</p></div>');
  };
  window.convertTextToMorse = function(){ var el=$('morseInput'), out=$('morseResult'); if(out) out.textContent=textToMorse(el?el.value:''); };
  window.convertMorseToText = function(){ var el=$('morseInput'), out=$('morseResult'); if(out) out.textContent=morseToText(el?el.value:''); };
  window.copyMorseResult = function(){ var t=($('morseResult')||{}).textContent||''; navigator.clipboard&&navigator.clipboard.writeText(t); toast('Hasil disalin.'); };

  function isSewaProduct(p){
    var s = ((p && (p.name+' '+p.cat+' '+p.desc)) || '').toLowerCase();
    return /sewa|rent|bot grup|bot wa|bot whatsapp/.test(s);
  }
  function getProductById(id){
    var products = (window.ls && ls.get('products', window.defaultProducts || [])) || window.defaultProducts || [];
    return products.find(function(x){ return String(x.id) === String(id); });
  }
  function validWaGroupLink(link){ return /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{15,}$/i.test(String(link||'').trim()); }
  function durationFromProduct(p){
    var s = ((p && (p.name+' '+p.desc)) || '').toLowerCase();
    var m = s.match(/(\d+)\s*(hari|day|d|bulan|month|minggu|week)/i);
    if(!m) return { label:'7d', days:7 };
    var n = Number(m[1]);
    var unit = m[2].toLowerCase();
    if(/bulan|month/.test(unit)) return { label:n+' bulan', days:n*30 };
    if(/minggu|week/.test(unit)) return { label:n+' minggu', days:n*7 };
    return { label:n+' hari', days:n };
  }
  function patchAutoOrder(){
    if(!window.order || window.order.__remiAutoPatched) return;
    var oldOrder = window.order;
    window.order = function(id){
      var p=getProductById(id);
      if(p && isSewaProduct(p)) return openSewaBotOrder(id);
      return oldOrder.apply(this, arguments);
    };
    window.order.__remiAutoPatched = true;
  }
  window.openSewaBotOrder = function(productId){
    var p = getProductById(productId), u = typeof me==='function' ? me() : null;
    if(!p) return toast('Produk tidak ditemukan.','err');
    var dur = durationFromProduct(p);
    openModal('🤖 Auto Order Sewa Bot', '<div style="text-align:center;font-size:48px">'+safeText(p.icon||'🤖')+'</div><h2 style="text-align:center">'+safeText(p.name)+'</h2><div class="panel"><div class="row"><span>Harga</span><b>'+fmtSafe(p.price)+'</b></div><div class="row"><span>Durasi</span><b>'+safeText(dur.label)+'</b></div><div class="row"><span>Saldo kamu</span><b style="color:var(--green)">'+fmtSafe((u&&u.saldo)||0)+'</b></div></div><div class="panel"><h3>Data Grup</h3><input class="input" id="autoWa" placeholder="Nomor WhatsApp kamu, contoh 628xxx"><div style="height:9px"></div><input class="input" id="autoGroupLink" placeholder="https://chat.whatsapp.com/xxxx"><div style="height:9px"></div><textarea id="autoNote" placeholder="Catatan tambahan opsional..."></textarea></div><button class="btn" style="width:100%" type="button" onclick="submitSewaBotOrder(\''+String(productId).replace(/'/g,'')+'\')">🚀 Bayar & Kirim Auto Order</button><button class="btn ghost" style="width:100%;margin-top:10px" type="button" onclick="showPage(\'saldo\');closeModal()">💳 Deposit Saldo</button><p class="muted">Setelah sukses, data dikirim ke Firebase <b>autoOrders</b>. Bot WA kamu akan cek Firebase dan join grup.</p>');
  };
  window.submitSewaBotOrder = async function(productId){
    var p=getProductById(productId), u=typeof me==='function'?me():null;
    if(!p || !u) return toast('Produk/user tidak ditemukan.','err');
    var wa=String(($('autoWa')||{}).value||'').trim();
    var link=String(($('autoGroupLink')||{}).value||'').trim();
    var note=String(($('autoNote')||{}).value||'').trim();
    if(!wa) return toast('Nomor WhatsApp wajib diisi.','warn');
    if(!validWaGroupLink(link)) return toast('Link grup WhatsApp tidak valid/kedaluwarsa.','err');
    if(Number(u.saldo||0) < Number(p.price||0)) return toast('Saldo kurang, deposit dulu.','err');
    var dur=durationFromProduct(p);
    var id='ORD-'+Date.now()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
    var order={ id:id, type:'sewa_bot', productId:p.id, productName:p.name, buyer:u.username, buyerName:u.display||u.username, buyerJid: wa.replace(/\D/g,'')+'@s.whatsapp.net', wa:wa, groupLink:link, waGroupLink:link, duration:dur.label, days:dur.days, price:Number(p.price||0), status:'pending', paid:true, note:note, createdAt:Date.now(), source:'web' };
    try{
      if(typeof saveMe==='function') saveMe({ saldo:Number(u.saldo||0)-Number(p.price||0), orders:(u.orders||0)+1, spent:(u.spent||0)+Number(p.price||0) });
      var orders=(window.ls&&ls.get('orders',[]))||[]; orders.unshift(order); if(window.ls) ls.set('orders',orders);
      if(typeof addTx==='function') addTx('Auto Order Sewa Bot: '+p.name, -Number(p.price||0));
      await dbSet('autoOrders/'+id, order);
      await dbSet('ownerNotifs/'+id, { id:id, type:'auto_order', title:'Auto Order Sewa Bot Baru', text:(u.username||'-')+' membeli '+p.name, order:order, read:false, createdAt:Date.now() });
      closeModal();
      try{ if(typeof renderAll==='function') renderAll(); }catch(e){}
      toast('Order dibuat. Bot sedang/akan cek Firebase.', 'success');
    }catch(e){
      console.error(e);
      toast('Order lokal dibuat, tapi kirim Firebase gagal. Hubungi owner.', 'warn');
    }
  };
  function fmtSafe(n){ try{ return typeof fmt==='function' ? fmt(n) : 'Rp'+Number(n||0).toLocaleString('id-ID'); }catch(e){ return String(n||0); } }

  function patchSaveApi(){
    var old = window.saveApiOwnerV76 || window.saveApiSetting;
    if(old && !old.__remiDbPatched){
      var patched=function(){
        var ret; try{ ret = old.apply(this, arguments); }catch(e){ console.error(e); toast('Simpan API lokal error: '+e.message,'err'); }
        var api = {
          baseurlalip: cleanBase(($('admAlipBaseV76')||{}).value || (window.APIS&&APIS.alipBase), DEFAULT_API.baseurlalip),
          apikeyalip: (($('admAlip')||{}).value || (window.APIS&&APIS.alipKey) || DEFAULT_API.apikeyalip).trim(),
          baseurlcuki: cleanBase(($('admCukiBase')||{}).value || (window.CUKI_API&&CUKI_API.base), DEFAULT_API.baseurlcuki),
          apikeycuki: (($('admCuki')||{}).value || (window.CUKI_API&&CUKI_API.key) || DEFAULT_API.apikeycuki).trim(),
          baseurlnexray: cleanBase(($('admNexrayBase')||{}).value || (window.APIS&&APIS.nexrayBase), DEFAULT_API.baseurlnexray),
          baseurlourin: cleanBase(($('admOurinBase')||{}).value || (window.APIS&&APIS.ourinBase), DEFAULT_API.baseurlourin),
          baseurlbotcahx: cleanBase((window.APIS&&APIS.botcahxBase) || DEFAULT_API.baseurlbotcahx, DEFAULT_API.baseurlbotcahx),
          apikeybotcahx: (($('admBotcah')||{}).value || (window.APIS&&APIS.botcahxKey) || DEFAULT_API.apikeybotcahx).trim(),
          zakkiToken: (($('admZakki')||{}).value || DEFAULT_API.zakkiToken).trim(),
          relayUrl: (($('ownRelay')||{}).value || (window.APIS&&APIS.relayBase) || '').trim()
        };
        applyApiObject(api);
        dbSet('settings/api', api).then(function(ok){ if(ok) toast('API disimpan ke Firebase database.'); });
        return ret;
      };
      patched.__remiDbPatched=true;
      if(window.saveApiOwnerV76) window.saveApiOwnerV76=patched;
      if(window.saveApiSetting) window.saveApiSetting=patched;
    }
  }



  window.remiSeedFirebaseNow = async function(){
    if(!db){ toast('Firebase belum ready. Tunggu sebentar lalu coba lagi.', 'warn'); return false; }
    var ok = await seedAllDatabasePaths();
    if(ok){ toast('Struktur database Firebase sudah dibuat/diisi.', 'success'); await hydrateImportant(); }
    return ok;
  };
  window.remiShowFirebasePaths = function(){
    var paths = ['settings/api','users','accounts','products','categories','chat','privateChats','orders','autoOrders','ownerNotifs','transactions','deposits','paidDeposits','purchaseNotifs','streaks','leaderboard','reports','reviews','referrals','limits','topups','live/online'];
    if(typeof openModal === 'function') openModal('🗃️ Firebase Database Paths', '<p class="muted">Path yang dibuat otomatis oleh database.js.</p><div class="panel"><p class="debugLine">'+paths.map(safeText).join('<br>')+'</p></div><button class="btn" onclick="remiSeedFirebaseNow()" style="width:100%">Seed / Upload Struktur Sekarang</button>');
    else alert(paths.join('\n'));
  };

  function addDatabaseMenuButton(){
    var menu = document.getElementById('menuPop');
    if(menu && !menu.querySelector('[data-remi-db-seed]')){
      var btn = document.createElement('button');
      btn.setAttribute('data-remi-db-seed','1');
      btn.type = 'button';
      btn.textContent = '🗃️ Seed Firebase DB';
      btn.onclick = function(){ if(typeof toggleMenu==='function') toggleMenu(false); remiShowFirebasePaths(); };
      menu.insertBefore(btn, menu.firstChild);
    }
  }

  function bootPatches(){
    installLsBridge();
    bindAuthButtons();
    addToolsTriggers();
    patchAutoOrder();
    patchSaveApi();
    addDatabaseMenuButton();
    setTimeout(function(){ bindAuthButtons(); addToolsTriggers(); patchAutoOrder(); patchSaveApi(); addDatabaseMenuButton(); },500);
    setTimeout(function(){ bindAuthButtons(); addToolsTriggers(); patchAutoOrder(); patchSaveApi(); addDatabaseMenuButton(); },1500);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootPatches); else bootPatches();
  initFirebase();
})();
