/* remi.config.js
   Isi bagian ini sendiri. UI tetap di index.html, database/API disini biar gak jadi bubur HTML.
*/
window.REMI_CONFIG = {
  appName: 'Remi AI Store',
  versionLabel: 'v1',

  // Geo.ipify untuk Check IP + GMaps
  ipifyKey: 'at_SZOROv2kK5dNchcdaozjbGs8mVpwK',

  // Firebase Realtime Database. Isi databaseURL kalau sudah bikin project Firebase.
  firebase: {
    databaseURL: '', // contoh: https://nama-project-default-rtdb.asia-southeast1.firebasedatabase.app
    rootPath: 'remiStore',
    ordersPath: 'orders',
    botQueuePath: 'botQueue/autoorder',
    chatPath: 'chat',
    inboxPath: 'dmInbox',
    usersPath: 'users',
    productsPath: 'products',
    settingsPath: 'settings'
  },

  // Endpoint API yang gampang lu ubah tanpa nyentuh index.html.
  apis: {
    spotifyPlay: 'https://api.nexray.eu.cc/downloader/spotifyplay?q=',
    spotifyUrl: 'https://api.nexray.eu.cc/downloader/spotify?url=',
    videy: 'https://api.nexray.eu.cc/downloader/videy?url=',
    tiktok: 'https://api.cuki.biz.id/api/downloader/tiktok?apikey=cuki-x&url=',
    facebook: 'https://api.nexray.eu.cc/downloader/facebook?url=',
    instagram: 'https://api.nexray.eu.cc/downloader/instagram?url=',
    ytPlayMp3: 'https://api.nexray.eu.cc/downloader/ytplay?q=',
    ytPlayVideo: 'https://api.nexray.eu.cc/downloader/ytplayvid?q=',
    jadwalSholat: 'https://api.nexray.eu.cc/information/jadwalsholat?kota=',
    jadwalBola: 'https://api.nexray.eu.cc/information/jadwalbola',
    capcutSearch: 'https://api.nexray.eu.cc/search/capcut?q=',
    laheluSearch: 'https://api.cuki.biz.id/api/search/lahelu?apikey=cuki-x&query=',
    mangatoonSearch: 'https://api.cuki.biz.id/api/search/mangatoon?apikey=cuki-x&query=',
    stickerlySearch: 'https://api.nexray.eu.cc/search/stickerly?q=',
    happyModSearch: 'https://api.nexray.eu.cc/search/happymood?q=',
    geminiTts: 'https://api.nexray.eu.cc/ai/gemini-tts?text=',
    bratVid: 'https://api.nexray.eu.cc/maker/bratvid?text=',
    bratHd: 'https://api.nexray.eu.cc/maker/brathd?text=',
    fakeStarboy: 'https://api.cuki.biz.id/api/canvas/starboy?apikey=cuki-x&image=',
    fakeSusuOriginal: 'https://api.cuki.biz.id/api/canvas/susu-original?apikey=cuki-x&image=',
    fakeSusuTaro: 'https://api.cuki.biz.id/api/canvas/susu-taro?apikey=cuki-x&image=',
    fakeWasted: 'https://api.cuki.biz.id/api/canvas/wasted?apikey=cuki-x&url=',
    fakeWasted2: 'https://api.nexray.eu.cc/editor/wasted?url=',
    fakeUstadz: 'https://api.cuki.biz.id/api/canvas/ustadz?apikey=cuki-x&text='
  }
};
/* remi.data.js
   Produk/tools default. Edit ini kalau mau isi produk sendiri tanpa nyentuh index.html.
   Kalau localStorage sudah punya produk lama, reset produk di Owner/Admin panel biar data baru kebaca.
*/
window.REMI_DATA = {
  products: [
    {id:1, cat:'Panel', icon:'⚡', name:'Panel Bot 1GB', desc:'Panel private ringan untuk bot kecil.', price:1000},
    {id:2, cat:'Panel', icon:'🚀', name:'Panel Bot 2GB', desc:'Panel lebih lega untuk fitur aktif.', price:2000},
    {id:3, cat:'Premium', icon:'👑', name:'Premium Remi 7 Hari', desc:'Akses fitur premium selama 7 hari.', price:5000},
    {id:4, cat:'Boost', icon:'🚀', name:'Boost Sosmed', desc:'Followers, likes, views, comment, dan engagement sosmed.', price:10000}
  ],
  tools: [
    ['⬇️','Downloader Hub','Download media TikTok, IG, FB, Spotify, YouTube, Videy, CapCut, dan MediaFire.','downloader'],
    ['🔎','Search Hub','Cari Lahelu, Mangatoon, Sticker.ly, HappyMod, CapCut, dan lainnya tanpa pindah halaman.','search_hub'],
    ['🌐','Check IP','Cek IP via Geo.ipify + preview Google Maps.','checkip'],
    ['🌐','Translate','Terjemahkan teks lebih rapi.','translate'],
    ['🔢','Binary ⇄ Text','Konversi teks ke binary atau binary ke teks.','cuki_binary'],
    ['•−','Kode Morse','Ubah teks ke kode Morse dan sebaliknya.','morse_v90'],
    ['🎤','Text To Speech','Ubah teks jadi audio MP3.','tts_v88'],
    ['😎','Brat Generator','Brat HD dan Brat Video.','brat'],
    ['🎭','Fake/Canvas','Wasted, Starboy, Susu, Ustadz, dan canvas lain.','fake']
  ]
};
/* remi.database.js
   Helper Firebase Realtime Database via REST. HTML cukup satu, data/global sync lewat file ini.
*/
(function(){
  function cfg(){
    const c=window.REMI_CONFIG||{};
    const fb=c.firebase||{};
    return {
      databaseURL: fb.databaseURL || '',
      rootPath: (fb.rootPath || 'remiStore').replace(/^\/+|\/+$/g,''),
      ordersPath: fb.ordersPath || 'orders',
      botQueuePath: fb.botQueuePath || 'botQueue/autoorder',
      chatPath: fb.chatPath || 'chat',
      inboxPath: fb.inboxPath || 'dmInbox',
      usersPath: fb.usersPath || 'users',
      productsPath: fb.productsPath || 'products',
      settingsPath: fb.settingsPath || 'settings'
    };
  }
  function base(){
    const c=cfg();
    if(!c.databaseURL) throw new Error('Firebase databaseURL belum diisi di remi.config.js');
    return c.databaseURL.replace(/\/$/,'')+'/'+c.rootPath;
  }
  function clean(path){ return String(path||'').replace(/^\/+|\/+$/g,''); }
  function url(path){ return base()+(path?'/'+clean(path):'')+'.json'; }
  async function req(path, method='GET', body){
    const opt={method, headers:{'Content-Type':'application/json'}};
    if(body!==undefined) opt.body=JSON.stringify(body);
    const r=await fetch(url(path), opt);
    const text=await r.text();
    let json=null; try{ json=text?JSON.parse(text):null }catch{ json=text }
    if(!r.ok) throw new Error((json&&json.error)||text||('HTTP '+r.status));
    return json;
  }
  const RemiDB={
    config: cfg,
    get:(path)=>req(path),
    set:(path,data)=>req(path,'PUT',data),
    patch:(path,data)=>req(path,'PATCH',data),
    remove:(path)=>req(path,'DELETE'),
    async push(path,data){
      const id=(data&&data.id)||('ID'+Date.now()+Math.random().toString(36).slice(2,7));
      await req(clean(path)+'/'+id,'PUT',{...data,id,updatedAt:Date.now()});
      return id;
    },
    async pushOrder(order){
      const c=cfg();
      const id=order.id || ('ORD'+Date.now());
      const payload={...order,id,updatedAt:Date.now(),source:'web'};
      await req(c.ordersPath+'/'+id,'PUT',payload);
      await req(c.botQueuePath+'/'+id,'PUT',{...payload,queueStatus:'pending'});
      return payload;
    },
    async markBotQueueDone(id, extra={}){
      const c=cfg();
      return req(c.botQueuePath+'/'+id,'PATCH',{queueStatus:'done',doneAt:Date.now(),...extra});
    },
    listen(path, cb){
      const es=new EventSource(url(path));
      es.onmessage=e=>{try{const d=JSON.parse(e.data); cb(d.data)}catch(err){console.warn('Firebase listen parse',err)}};
      es.onerror=e=>console.warn('Firebase listen error',e);
      return ()=>es.close();
    }
  };
  window.RemiDB=RemiDB;

  // Jembatan ke function lama di index.html biar panel Firebase tetap pakai config file ini.
  window.getFirebaseCfgV89=function(){
    const c=cfg();
    return {databaseURL:c.databaseURL, rootPath:c.rootPath};
  };

  // Helper global buat bot/WA: panggil dari console atau dari tombol order.
  window.pushAutoOrderToFirebase=function(order){ return RemiDB.pushOrder(order); };
})();
