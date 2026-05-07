// Remi AI Store V1 — database center
// Semua config penting + database wrapper taro di sini.
// localStorage cuma dipakai buat session/cache biar web tetap nyala kalau koneksi lagi ngambek.

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

  apiKeys: {
    geoIpify: "at_SZOROv2kK5dNchcdaozjbGs8mVpwK",
    cuki: "cuki-x"
  },

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
    users: "users",
    sessions: "sessions",
    products: "products",
    orders: "orders",
    botQueue: "botQueue/autoorder",
    globalChat: "globalChat",
    privateChat: "privateChat",
    gacha: "gacha",
    settings: "settings",
    logs: "logs",
    referrals: "referrals"
  },

  defaults: {
    role: "free",
    limit: 15,
    saldo: 0,
    streak: 0,
    avatar: "",
    bio: "",
    gender: "rahasia",
    relayAuto: true,
    gachaPrice1: 1000,
    gachaPrice10: 9000,
    streakMax: 1000
  }
};

window.REMI_DB_READY = false;

window.REMI_LOAD_SCRIPT = function(src){
  return new Promise((resolve,reject)=>{
    if([...document.scripts].some(s=>s.src===src)) return resolve();
    const s=document.createElement("script");
    s.src=src;
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });
};

window.REMI_INIT_DATABASE = async function(){
  if(window.REMI_DB_READY && window.remiDB) return window.remiDB;

  await window.REMI_LOAD_SCRIPT("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
  await window.REMI_LOAD_SCRIPT("https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js");

  if(!firebase.apps.length){
    firebase.initializeApp(window.REMI_DATABASE.firebaseConfig);
  }

  window.remiDB = firebase.database();
  window.db = window.remiDB;
  window.REMI_DB_READY = true;

  await window.REMI_SEED_SETTINGS();
  return window.remiDB;
};

window.REMI_REF = function(path){
  if(!window.remiDB) throw new Error("Firebase belum siap");
  return window.remiDB.ref(path);
};

window.REMI_SAFE_KEY = function(text){
  return String(text || "guest")
    .trim()
    .toLowerCase()
    .replace(/[.#$/\[\]\s]/g, "_")
    .replace(/[^a-z0-9_-]/gi, "_")
    .slice(0, 48) || "guest";
};

window.REMI_NOW = function(){
  return Date.now();
};

window.REMI_SEED_SETTINGS = async function(){
  if(!window.remiDB) return;
  const db = window.REMI_DATABASE;
  const snap = await window.remiDB.ref(db.paths.settings + "/system").once("value");
  if(!snap.exists()){
    await window.remiDB.ref(db.paths.settings).update({
      system: {
        name: "Remi AI Store V1",
        developer: "ELL",
        realtime: true,
        relayAuto: true,
        createdAt: Date.now()
      },
      api: db.endpoints,
      apiKeys: {
        geoIpify: db.apiKeys.geoIpify,
        cuki: db.apiKeys.cuki
      },
      firebase: db.firebaseConfig,
      gacha: {
        price1: db.defaults.gachaPrice1,
        price10: db.defaults.gachaPrice10
      },
      streak: {
        max: db.defaults.streakMax
      }
    });
  }
};

window.REMI_GET_SESSION = function(){
  try{
    return JSON.parse(localStorage.getItem("remi_session") || "null");
  }catch(e){
    return null;
  }
};

window.REMI_SET_SESSION = function(user){
  localStorage.setItem("remi_session", JSON.stringify({
    username: user.username,
    key: user.key,
    role: user.role || "free",
    loginAt: Date.now()
  }));
  localStorage.setItem("currentUserData", JSON.stringify(user));
  localStorage.setItem("currentUser", user.username);
  window.currentUser = user;
};

window.REMI_CLEAR_SESSION = function(){
  localStorage.removeItem("remi_session");
  localStorage.removeItem("currentUserData");
  localStorage.removeItem("currentUser");
  window.currentUser = null;
};

window.REMI_GET_USER = async function(username){
  await window.REMI_INIT_DATABASE();
  const key = window.REMI_SAFE_KEY(username);
  const snap = await window.REMI_REF(window.REMI_DATABASE.paths.users + "/" + key).once("value");
  const val = snap.val();
  return val ? { ...val, key } : null;
};

window.REMI_SAVE_USER = async function(user){
  await window.REMI_INIT_DATABASE();
  const key = user.key || window.REMI_SAFE_KEY(user.username);
  const data = {
    ...window.REMI_DATABASE.defaults,
    ...user,
    key,
    updatedAt: Date.now()
  };
  await window.REMI_REF(window.REMI_DATABASE.paths.users + "/" + key).update(data);
  return data;
};

window.REMI_REGISTER_USER = async function({username,password,gender}){
  await window.REMI_INIT_DATABASE();
  username = String(username || "").trim();
  password = String(password || "").trim();
  if(username.length < 3) throw new Error("Username minimal 3 karakter");
  if(password.length < 3) throw new Error("Password minimal 3 karakter");

  const key = window.REMI_SAFE_KEY(username);
  const userRef = window.REMI_REF(window.REMI_DATABASE.paths.users + "/" + key);
  const snap = await userRef.once("value");
  if(snap.exists()) throw new Error("Username sudah terdaftar");

  const user = {
    ...window.REMI_DATABASE.defaults,
    key,
    username,
    password,
    gender: gender || "rahasia",
    role: username.toLowerCase() === "ell" ? "owner" : "free",
    title: username.toLowerCase() === "ell" ? "👑 OWNER" : "USER FREE",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastLoginAt: Date.now()
  };

  await userRef.set(user);
  await window.REMI_REF(window.REMI_DATABASE.paths.logs + "/register").push({
    username,
    key,
    createdAt: Date.now()
  });

  return user;
};

window.REMI_LOGIN_USER = async function({username,password,guest=false}){
  await window.REMI_INIT_DATABASE();

  if(guest){
    const usernameGuest = "Guest_" + Math.random().toString(36).slice(2,7);
    const user = {
      ...window.REMI_DATABASE.defaults,
      key: window.REMI_SAFE_KEY(usernameGuest),
      username: usernameGuest,
      password: "",
      role: "free",
      guest: true,
      title: "USER FREE",
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };
    await window.REMI_SAVE_USER(user);
    return user;
  }

  username = String(username || "").trim();
  password = String(password || "").trim();
  if(!username || !password) throw new Error("Username/password kosong");

  const key = window.REMI_SAFE_KEY(username);
  const snap = await window.REMI_REF(window.REMI_DATABASE.paths.users + "/" + key).once("value");
  if(!snap.exists()) throw new Error("Akun tidak ditemukan");

  const user = snap.val();
  if(String(user.password || "") !== password) throw new Error("Password salah");

  await window.REMI_REF(window.REMI_DATABASE.paths.users + "/" + key).update({
    lastLoginAt: Date.now(),
    online: true,
    relayAuto: true
  });

  return { ...user, key };
};

window.REMI_MIGRATE_LOCAL_TO_FIREBASE = async function(){
  await window.REMI_INIT_DATABASE();

  let current = {};
  try{ current = JSON.parse(localStorage.getItem("currentUserData") || "{}"); }catch(e){}
  const legacyUser = localStorage.getItem("currentUser");
  const username = current.username || legacyUser;

  if(username && username !== "null"){
    const key = window.REMI_SAFE_KEY(username);
    const snap = await window.REMI_REF(window.REMI_DATABASE.paths.users + "/" + key).once("value");
    if(!snap.exists()){
      await window.REMI_SAVE_USER({
        ...window.REMI_DATABASE.defaults,
        ...current,
        key,
        username,
        migratedFromLocalStorage: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  }

  const localKeys = [
    "saldo","streak","limit","displayName","bio","gender","avatar","pfp",
    "products","orders","globalChat","privateChat","gachaHistory"
  ];

  const backup = {};
  for(const k of localKeys){
    const raw = localStorage.getItem(k);
    if(raw !== null) backup[k] = raw;
  }

  if(Object.keys(backup).length){
    await window.REMI_REF("localStorageBackup/" + window.REMI_SAFE_KEY(username || "unknown") + "/" + Date.now()).set(backup);
  }
};

window.REMI_BOOT_DATABASE = async function(){
  try{
    await window.REMI_INIT_DATABASE();
    await window.REMI_MIGRATE_LOCAL_TO_FIREBASE();

    const session = window.REMI_GET_SESSION();
    if(session?.key){
      const snap = await window.REMI_REF(window.REMI_DATABASE.paths.users + "/" + session.key).once("value");
      if(snap.exists()){
        const user = { ...snap.val(), key: session.key };
        window.REMI_SET_SESSION(user);
      }
    }

    console.log("REMI DATABASE ONLINE", window.REMI_DATABASE);
    return true;
  }catch(err){
    console.error("REMI DATABASE ERROR", err);
    return false;
  }
};

window.REMI_BOOT_DATABASE();
