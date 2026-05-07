// Remi AI Store V1 — db.js
// Pusat database/config. Firebase, API key, endpoint, path data, dan helper database disimpan di sini.
window.REMI_DATABASE = {
  firebaseConfig: {
    apiKey: "AIzaSyDgivYR6mljjYyeFH286UA8auWkVJDZUy0",
    authDomain: "ellpigi-web-store.firebaseapp.com",
    databaseURL: "https://ellpigi-web-store-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ellpigi-web-store",
    storageBucket: "ellpigi-web-store.firebasestorage.app",
    messagingSenderId: "531471360663",
    appId: "1:531471360663:web:865434fa34c4da3f953fd2",
    measurementId: "G-K60HEY929K"
  },
  apiKeys: { geoIpify: "at_SZOROv2kK5dNchcdaozjbGs8mVpwK", cuki: "cuki-x" },
  endpoints: {
    spotifyPlay: "https://api.nexray.eu.cc/downloader/spotifyplay?q=",
    spotifyUrl: "https://api.nexray.eu.cc/downloader/spotify?url=",
    pinterestVideo: "https://api.nexray.eu.cc/downloader/pinterest?url=",
    tiktok: "https://api.cuki.biz.id/api/downloader/tiktok?apikey=cuki-x&url=",
    instagram: "https://api.nexray.eu.cc/downloader/instagram?url=",
    facebook: "https://api.nexray.eu.cc/downloader/facebook?url=",
    videy: "https://api.nexray.eu.cc/downloader/videy?url=",
    jadwalBola: "https://api.nexray.eu.cc/information/jadwalbola",
    jadwalSholat: "https://api.nexray.eu.cc/information/jadwalsholat?kota=",
    stickerly: "https://api.nexray.eu.cc/search/stickerly?q=",
    lahelu: "https://api.cuki.biz.id/api/search/lahelu?apikey=cuki-x&query=",
    mangatoon: "https://api.cuki.biz.id/api/search/mangatoon?apikey=cuki-x&query="
  },
  paths: {
    users: "users", sessions: "sessions", products: "products", orders: "orders",
    botQueue: "botQueue/autoorder", globalChat: "globalChat", privateChat: "privateChat",
    gacha: "gacha", settings: "settings", logs: "logs", referrals: "referrals"
  },
  defaults: { role:"free", limit:15, saldo:0, streak:0, avatar:"", bio:"", gender:"rahasia", relayAuto:true }
};
window.REMI_DB_READY = false;
window.REMI_LOAD_SCRIPT = function(src){
  return new Promise(function(resolve,reject){
    if(Array.from(document.scripts).some(function(s){return s.src===src;})) return resolve();
    var s=document.createElement('script'); s.src=src; s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
  });
};
window.REMI_INIT_DATABASE = async function(){
  if(window.REMI_DB_READY && window.remiDB) return window.remiDB;
  await window.REMI_LOAD_SCRIPT('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
  await window.REMI_LOAD_SCRIPT('https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js');
  if(!firebase.apps.length) firebase.initializeApp(window.REMI_DATABASE.firebaseConfig);
  window.remiDB=firebase.database(); window.db=window.remiDB; window.REMI_DB_READY=true; return window.remiDB;
};
window.REMI_REF = function(path){ if(!window.remiDB) throw new Error('Firebase belum siap'); return window.remiDB.ref(path); };
window.REMI_SAFE_KEY = function(text){ return String(text||'guest').trim().toLowerCase().replace(/[.#$/\[\]\s]/g,'_').replace(/[^a-z0-9_-]/gi,'_').slice(0,48)||'guest'; };
window.REMI_BOOT_DATABASE = async function(){
  try{ await window.REMI_INIT_DATABASE(); return true; }catch(e){ console.error('REMI DATABASE ERROR',e); return false; }
};
window.REMI_BOOT_DATABASE();


// ===== Remi V104 endpoint catalog + database center additions =====
window.REMI_V104_ENDPOINTS = Object.assign({}, window.REMI_V104_ENDPOINTS || {}, {
  downloader: {
    tiktok: "https://api.cuki.biz.id/api/downloader/tiktok?apikey=cuki-x&url=",
    instagram: "https://api.nexray.eu.cc/downloader/instagram?url=",
    facebook: "https://api.nexray.eu.cc/downloader/facebook?url=",
    pinterestSearch: "https://api.nexray.eu.cc/search/pinterest?q=",
    spotifyUrl: "https://api.nexray.eu.cc/downloader/spotify?url=",
    spotifyPlay: "https://api.nexray.eu.cc/downloader/spotifyplay?q=",
    youtubeMp3: "https://api.nexray.eu.cc/downloader/ytplay?q=",
    youtubeVideo: "https://api.nexray.eu.cc/downloader/ytplayvid?q=",
    videy: "https://api.nexray.eu.cc/downloader/videy?url=",
    capcut: "https://api.nexray.eu.cc/downloader/v2/capcut?url=",
    mediafire: "https://api.nexray.eu.cc/downloader/mediafire?url="
  },
  nglSpam: "https://api.cuki.biz.id/api/tools/nglspam?apikey=cuki-x&link=<link>&message=<message>&jumlah=<jumlah>",
  bratCewek: "https://api.deline.web.id/maker/cewekbrat?text=",
  musicCard: "https://api.nexray.eu.cc/canvas/musiccard?judul=<judul>&nama=<nama>&image_url=<image_url>",
  textproBase: "https://api.nexray.eu.cc/textpro/"
});
window.REMI_V104_SEARCH_HUB = ["Lahelu","Pin Image","Pin Video","Spotify Search","YT MP3 / Play YT","MCPE","YT Link","Mangatoon","Sticker.ly","HappyMod","Resep Makanan"];
window.REMI_V104_FAKE_MAKER = ["Fake NGL","Fake ML","Fake FF Solo","Fake FF Duo","Fake FF Duo 2","Fake Nokia","Fake Nulis","Fake Dev 1","Fake Dev 2","Fake Dev 3","Wasted 1","Wasted 2","Susu Original","Susu Taro","Starboy","Fake Ustadz","Musik Card"];
window.REMI_V104_BRAT = ["Brat Default","Brat HD","Brat Bahlil","Brat Cewek","Brat Green","Brat Anime","Brat Patrik","Brat Squidward","Brat Gura"];
window.REMI_V104_TEXTPRO = {
  single:["blackpink","pavement","pixel-glitch","typography","wetglass","write-graffiti","naruto","glitch","bear","cartoon-graffiti","comic","devil-wings","dragonball","v5/graffiti"],
  double:["wolf-galaxy","pornhub","painting","marvel","avengers","v1/graffiti"],
  styleSelect:{"foggy-glass":["bear","cat","flower","heart","sad","smile"]},
  mascot:true
};


// ===== Remi V105 final helpers: Storage + Order Queue =====
window.REMI_INIT_DATABASE = (function(oldInit){
  return async function(){
    if(oldInit) await oldInit();
    try{ await window.REMI_LOAD_SCRIPT('https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js'); }catch(e){ console.warn('Storage script gagal', e); }
    try{ window.remiStorage = firebase.storage(); window.storage = window.remiStorage; }catch(e){ console.warn('Firebase storage belum siap', e); }
    window.REMI_DB_READY = true;
    return window.remiDB || window.db;
  };
})(window.REMI_INIT_DATABASE);
window.REMI_UPLOAD_FILE = async function(file, path){
  await window.REMI_INIT_DATABASE();
  if(!window.remiStorage && window.firebase && firebase.storage) window.remiStorage=firebase.storage();
  if(!window.remiStorage) throw new Error('Firebase Storage belum siap');
  const safe = String(path || ('uploads/'+Date.now()+'-'+(file && file.name || 'file'))).replace(/[^a-zA-Z0-9/._-]/g,'_');
  const r = window.remiStorage.ref(safe);
  await r.put(file);
  return await r.getDownloadURL();
};
window.REMI_PUSH = async function(path, data){
  await window.REMI_INIT_DATABASE();
  if(!window.remiDB) throw new Error('Firebase Realtime Database belum siap');
  return window.remiDB.ref(path).update(data);
};
window.REMI_SET = async function(path, data){
  await window.REMI_INIT_DATABASE();
  if(!window.remiDB) throw new Error('Firebase Realtime Database belum siap');
  return window.remiDB.ref(path).set(data);
};
window.REMI_CREATE_ORDER = async function(order){
  const id = order.orderId || order.id || ('ORD'+Date.now());
  order.orderId = id; order.id = id;
  order.status = order.status || 'pending_process';
  order.createdAt = order.createdAt || Date.now();
  await window.REMI_SET('orders/'+id, order);
  await window.REMI_SET('botQueue/autoorder/'+id, order);
  await window.REMI_SET('notifications/purchases/'+id, order);
  return order;
};

// ===== Remi V106 Firebase exact config + GitHub-ready helper =====
window.REMI_VERSION = "V106-FIREBASE-FINAL";
window.REMI_OWNER_USERNAME = "ell";
window.REMI_FIREBASE_CONFIG_FINAL = {
  apiKey: "AIzaSyDgivYR6mljjYyeFH286UA8auWkVJDZUy0",
  authDomain: "ellpigi-web-store.firebaseapp.com",
  databaseURL: "https://ellpigi-web-store-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ellpigi-web-store",
  storageBucket: "ellpigi-web-store.firebasestorage.app",
  messagingSenderId: "531471360663",
  appId: "1:531471360663:web:865434fa34c4da3f953fd2",
  measurementId: "G-K60HEY929K"
};

// Force exact latest config in case older patches above left stale values.
if (window.REMI_DATABASE) {
  window.REMI_DATABASE.firebaseConfig = window.REMI_FIREBASE_CONFIG_FINAL;
  window.REMI_DATABASE.owner = { username: "ell" };
  window.REMI_DATABASE.apiKeys = Object.assign({}, window.REMI_DATABASE.apiKeys || {}, {
    geoIpify: "at_SZOROv2kK5dNchcdaozjbGs8mVpwK",
    cuki: "cuki-x"
  });
  window.REMI_DATABASE.paths = Object.assign({}, window.REMI_DATABASE.paths || {}, {
    orders: "orders",
    botQueue: "botQueue/autoorder",
    purchaseNotifications: "notifications/purchases",
    products: "products",
    users: "users",
    settings: "settings",
    globalChat: "globalChat",
    privateChat: "privateChat",
    payments: "payments",
    logs: "logs"
  });
}

window.REMI_TEST_FIREBASE = async function(){
  await window.REMI_INIT_DATABASE();
  const id = "test_" + Date.now();
  const payload = {
    ok: true,
    version: window.REMI_VERSION,
    owner: "ell",
    createdAt: Date.now()
  };
  await window.REMI_SET("logs/firebaseTest/" + id, payload);
  return payload;
};

window.REMI_ORDER_TO_FIREBASE = async function(order){
  const cleanOrder = Object.assign({
    orderId: "ORD" + Date.now(),
    username: "guest",
    productId: "",
    productName: "",
    price: 0,
    type: "product",
    targetWa: "",
    status: "pending_process",
    payment: "saldo",
    source: "web",
    createdAt: Date.now()
  }, order || {});
  await window.REMI_CREATE_ORDER(cleanOrder);
  return cleanOrder;
};



// ===== V107 info/media defaults =====
window.REMI_INFO_MEDIA = {
  ownerPhoto: "./assets/owner-pp.jpg",
  ownerUsername: "ell",
  uiBase: "V103 x Cuki",
  credits: {
    owner: "Ell",
    ui: "Claude",
    code: "ChatGPT"
  }
};

window.REMI_VERSION = "V108-AUTH-CENTER-FIX";

window.REMI_VERSION = "V109-AUTH-LOGO-EYE-FIX";

window.REMI_VERSION = "V110-AUTH-HARD-FIX";

window.REMI_VERSION = "V111-AUTH-FINAL-CLEAN";
