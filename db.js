// Remi AI Store V1 — db.js
// Pusat database/config. Firebase, API key, endpoint, path data, dan helper database disimpan di sini.
window.REMI_DATABASE = {
  firebaseConfig: {
    apiKey: "AIzaSyDgivYR6mljjYyeFH286UA8auWkVJDZUy0",
    authDomain: "ellpigi-web-store.firebaseapp.com",
    databaseURL: "https://ellpigi-web-store-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "ellpigi-web-store",
    storageBucket: "ellpigi-web-store.firebasestorage.app",
    messagingSenderId: "531471360663",
    appId: "1:531471360663:web:28f8f71943e9cc42953fd2",
    measurementId: "G-EPXFJ2FVZW"
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
