/* Remi AI Store V1 - DB / Firebase / IPify patch
   Edit file ini buat config, bukan bongkar index.html. Akhirnya rapi, manusia bisa bernapas. */
(function(){
  'use strict';
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDgivYR6mljjYyeFH286UA8auWkVJDZUy0",
    authDomain: "ellpigi-web-store.firebaseapp.com",
    databaseURL: "https://ellpigi-web-store-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "ellpigi-web-store",
    storageBucket: "ellpigi-web-store.firebasestorage.app",
    messagingSenderId: "531471360663",
    appId: "1:531471360663:web:28f8f71943e9cc42953fd2",
    measurementId: "G-EPXFJ2FVZW"
  };
  const IPIFY_KEY = "at_SZOROv2kK5dNchcdaozjbGs8mVpwK";
  const ROOT = 'remiStoreV1';
  const $ = id => document.getElementById(id);
  const safe = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const now = () => new Date().toISOString();
  const sleep = ms => new Promise(r=>setTimeout(r,ms));

  window.REMI_DB_CONFIG = { firebaseConfig:FIREBASE_CONFIG, ipifyKey:IPIFY_KEY, root:ROOT };

  function lsGet(k,d){ try{ const v=localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch{ return d; } }
  function lsSet(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  function getUsers(){ return (window.getUsers ? window.getUsers() : lsGet('users',{})) || {}; }
  function getMe(){ return (window.me ? window.me() : null) || null; }
  function roleOfUser(u){
    if(!u) return 'user';
    if(typeof window.roleOfV73 === 'function') return window.roleOfV73(u);
    if(typeof window.roleOfV72 === 'function') return window.roleOfV72(u);
    if(u.role) return u.role;
    const name = String(u.username||'').toLowerCase();
    if(['owner','ell','adminowner'].includes(name)) return 'owner';
    return 'user';
  }
  function myRole(){ return roleOfUser(getMe()); }
  function isStaff(){ const r=myRole(); return r==='owner' || r==='admin'; }

  async function loadScript(src){
    if(document.querySelector(`script[src="${src}"]`)) return;
    await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
  }
  async function initFirebase(){
    if(!window.firebase){
      await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js');
    }
    if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    return firebase.database().ref(ROOT);
  }
  async function dbSet(path, data){ const root=await initFirebase(); return root.child(path).set(data); }
  async function dbUpdate(path, data){ const root=await initFirebase(); return root.child(path).update(data); }
  async function dbGet(path){ const root=await initFirebase(); const snap=await root.child(path).get(); return snap.val(); }
  window.REMI_DB = { initFirebase, dbSet, dbUpdate, dbGet, config:FIREBASE_CONFIG, root:ROOT };

  function patchTitle(){
    document.title='Remi AI Store V1';
    document.querySelectorAll('.brand span').forEach(x=>{ x.textContent='STORE • V1'; });
    const authTitle=$('auth')?.querySelector('.authTitle'); if(authTitle) authTitle.textContent='Remi AI Store V1';
  }

  function patchAccessUI(){
    const role=myRole();
    // menu kanan: user biasa tidak lihat Admin/Owner. Owner lihat owner+admin, admin lihat admin.
    document.querySelectorAll('#menuPop button').forEach(btn=>{
      const t=(btn.textContent||'').toLowerCase();
      if(t.includes('owner panel')) btn.style.display = role==='owner' ? '' : 'none';
      if(t.includes('admin panel')) btn.style.display = (role==='owner'||role==='admin') ? '' : 'none';
    });
    // Panel profil jadi tempat akses admin/owner, bukan nongol random buat user biasa.
    const akun=$('page-akun');
    if(akun && !$('rolePanelV1')){
      const panel=document.createElement('div'); panel.className='panel'; panel.id='rolePanelV1';
      const first=akun.querySelector('.panel'); if(first) first.insertAdjacentElement('afterend', panel); else akun.appendChild(panel);
    }
    const panel=$('rolePanelV1');
    if(panel){
      if(role==='owner') panel.innerHTML='<h2>👑 Panel Profil → Owner Panel</h2><p class="muted">Akun owner punya akses penuh: database, produk, API, settings, order, user, dan admin.</p><div class="btnrow"><button class="btn purple" onclick="openOwnerPanelV89?.() || openOwnerPanelV73?.() || openOwnerPanelV72?.()">👑 Buka Owner Panel</button><button class="btn green" onclick="openAdmin?.()">⚙️ Admin Panel</button><button class="btn ghost" onclick="openDatabasePanelV1()">🗄️ Database</button></div>';
      else if(role==='admin') panel.innerHTML='<h2>⚙️ Panel Profil → Admin Panel</h2><p class="muted">Akun admin hanya melihat fitur operasional. Owner panel tetap disembunyikan, biar tidak cosplay raja.</p><div class="btnrow"><button class="btn green" onclick="openAdmin?.()">⚙️ Buka Admin Panel</button><button class="btn ghost" onclick="openDatabasePanelV1()">🗄️ Database</button></div>';
      else panel.innerHTML='<h2>👤 Panel Profil</h2><p class="muted">Admin Panel dan Owner Panel disembunyikan untuk user biasa.</p>';
    }
  }

  window.openDatabasePanelV1 = function(){
    if(!isStaff()) return (window.toast?toast('Database panel cuma untuk admin/owner.','err'):alert('Khusus admin/owner'));
    const cfg=JSON.stringify(FIREBASE_CONFIG,null,2);
    window.openModal?.('🗄️ Database Realtime', `<div class="panel"><h3>Firebase Config</h3><p class="muted">Config utama ada di <b>db.js</b>. Jangan ditaruh di panel publik kalau tidak mau key jadi pajangan umum.</p><textarea readonly>${safe(cfg)}</textarea><div class="btnrow"><button class="btn green" onclick="REMI_DB_TEST()">⚡ Test Firebase</button><button class="btn purple" onclick="REMI_DB_PUSH()">🌍 Push Data Lokal</button></div><div id="dbOutV1"></div></div>`);
  };
  window.REMI_DB_TEST = async function(){ const out=$('dbOutV1'); try{ out.innerHTML='<div class="panel">⏳ Test...</div>'; await dbSet('_test',{ok:true,time:now(),user:getMe()?.username||'guest'}); out.innerHTML='<div class="proxyOk">✅ Firebase nyambung.</div>'; }catch(e){ out.innerHTML='<div class="proxyWarn">❌ '+safe(e.message)+'</div>'; } };
  window.REMI_DB_PUSH = async function(){ const out=$('dbOutV1'); try{ out.innerHTML='<div class="panel">⏳ Push...</div>'; const data={users:getUsers(), chat:lsGet('chat',[]), orders:lsGet('orders',[]), tx:lsGet('tx',[]), updatedAt:now()}; await dbUpdate('',data); out.innerHTML='<div class="proxyOk">✅ Data lokal dikirim ke Firebase global.</div>'; }catch(e){ out.innerHTML='<div class="proxyWarn">❌ '+safe(e.message)+'</div>'; } };

  // Check IP pakai Geo.ipify, bukan peta ngaco versi asal lempar. Tetap: IP lookup bukan GPS rumah.
  window.toolCheckIP = function(){
    window.openModal?.('🌐 Check IP + GMaps', `<div class="panel"><h3>Geo.ipify Lookup</h3><p class="muted">Masukkan IP/domain, atau kosongkan untuk cek IP publik. Catatan: lokasi IP itu lokasi jaringan/ISP, bukan GPS akurat rumah.</p><input class="input" id="ipInputV1" placeholder="contoh: 8.8.8.8 / kosongkan"><button class="btn purple" style="width:100%;margin-top:10px" onclick="runCheckIPV1()">⚡ Cek IP</button><div id="ipOutV1" style="margin-top:10px"></div></div>`);
  };
  window.runCheckIPV1 = async function(){
    const out=$('ipOutV1'); const q=($('ipInputV1')?.value||'').trim();
    out.innerHTML='<div class="panel">⏳ Cek IP via Geo.ipify...</div>';
    try{
      const url='https://geo.ipify.org/api/v2/country,city?apiKey='+encodeURIComponent(IPIFY_KEY)+(q?'&ipAddress='+encodeURIComponent(q):'');
      const j=await (await fetch(url,{cache:'no-store'})).json();
      if(j.code || j.messages) throw new Error(j.messages || j.message || 'Geo.ipify error');
      const lat=j.location?.lat, lon=j.location?.lng;
      const maps=(lat&&lon)?`https://www.google.com/maps?q=${lat},${lon}`:'';
      out.innerHTML=`<div class="panel"><h3>${safe(j.ip||q||'IP Publik')}</h3><div class="row"><span>Negara</span><b>${safe(j.location?.country||'-')}</b></div><div class="row"><span>Region</span><b>${safe(j.location?.region||'-')}</b></div><div class="row"><span>Kota</span><b>${safe(j.location?.city||'-')}</b></div><div class="row"><span>ISP</span><b>${safe(j.isp||'-')}</b></div><div class="row"><span>Timezone</span><b>${safe(j.location?.timezone||'-')}</b></div><div class="row"><span>Koordinat</span><b>${safe(lat)}, ${safe(lon)}</b></div>${maps?`<iframe loading="lazy" style="width:100%;height:220px;border:1px solid var(--line);border-radius:14px;margin-top:10px" src="https://maps.google.com/maps?q=${lat},${lon}&z=9&output=embed"></iframe><div class="btnrow"><a class="btn green" href="${maps}" target="_blank" style="text-decoration:none;text-align:center">🗺️ Buka GMaps</a><button class="btn ghost" onclick="navigator.clipboard.writeText('${maps}');toast?.('Link GMaps disalin')">📋 Copy</button></div>`:''}<p class="muted">Kalau peta jauh, itu normal. IP lookup memang bukan GPS, cuma estimasi ISP.</p></div>`;
      try{ if(window.saveDeviceSnapshot) saveDeviceSnapshot({ip:j.ip, city:j.location?.city, region:j.location?.region, isp:j.isp, lat, lon, ipSource:'geo.ipify'}); }catch{}
    }catch(e){ out.innerHTML='<div class="proxyWarn">❌ '+safe(e.message||e)+'</div>'; }
  };

  // Auto order ke Firebase supaya bot WA tinggal listen botQueue/autoorder.
  function orderPayload(p, u){ return { id:(window.makeId?makeId('ORD'):('ORD'+Date.now())), product:p?.name||'-', productId:p?.id||'', user:u?.username||'guest', display:u?.display||u?.username||'guest', price:Number(p?.price||0), wa:($('buyWa')?.value||'').trim(), note:($('buyNote')?.value||'').trim(), status:'paid', source:'remi-ai-store-v1', bot_detect:false, time:now() }; }
  const oldPaySaldo = window.paySaldo;
  window.paySaldo = async function(id){
    let p=null; try{ p=(lsGet('products',[])||[]).find(x=>String(x.id)===String(id)) || (window.defaultProducts||[]).find(x=>String(x.id)===String(id)); }catch{}
    const u=getMe(); const beforeOrders=lsGet('orders',[]);
    if(oldPaySaldo) await oldPaySaldo(id);
    try{
      const orders=lsGet('orders',[]);
      let order=orders[0];
      if(!order || beforeOrders[0]?.id===order.id) order=orderPayload(p,u);
      await dbUpdate('orders/'+order.id, order);
      await dbUpdate('botQueue/autoorder/'+order.id, order);
      await dbUpdate('users/'+(u?.username||'guest'), getUsers()[u?.username]||u||{});
    }catch(e){ console.warn('Autoorder Firebase gagal:', e); window.toast?.('Order masuk lokal, Firebase gagal: '+e.message,'warn'); }
  };

  // Global chat edit/hapus/kirim tersinkron. Override ringan, tidak merusak UI asli.
  async function syncChat(){ try{ await dbSet('chat', lsGet('chat',[])); }catch(e){ console.warn('sync chat gagal', e); } }
  const oldSendChat=window.sendChat; window.sendChat=async function(){ if(oldSendChat) oldSendChat(); await sleep(80); await syncChat(); };
  const oldSaveEditedMsg=window.saveEditedMsg; window.saveEditedMsg=async function(){ if(oldSaveEditedMsg) oldSaveEditedMsg(); await sleep(80); await syncChat(); };
  const oldDelMsg=window.delMsg; window.delMsg=async function(){ if(oldDelMsg) oldDelMsg(); await sleep(80); await syncChat(); };

  async function startRealtime(){
    try{
      const root=await initFirebase();
      root.child('chat').on('value', snap=>{ const v=snap.val(); if(v){ lsSet('chat', Array.isArray(v)?v:Object.values(v)); window.renderChat?.(); }});
      root.child('orders').on('value', snap=>{ const v=snap.val(); if(v) lsSet('orders', Array.isArray(v)?v:Object.values(v)); });
      root.child('users').on('value', snap=>{ const v=snap.val(); if(v && window.saveUsers){ window.saveUsers(v); window.renderAll?.(); }});
    }catch(e){ console.warn('Realtime init gagal:', e); }
  }

  // Translate fix fallback.
  window.toolTranslate = function(){
    window.openModal?.('🌐 Translate', `<div class="panel"><h3>Translate</h3><select id="trToV1"><option value="id">Indonesia</option><option value="en">English</option><option value="ja">Japanese</option><option value="ko">Korean</option><option value="ar">Arabic</option><option value="zh-CN">Chinese</option></select><div style="height:8px"></div><textarea id="trTextV1" placeholder="Teks yang mau diterjemahkan..."></textarea><button class="btn purple" style="width:100%;margin-top:10px" onclick="runTranslateV1()">Terjemahkan</button><div id="trOutV1" style="margin-top:10px"></div></div>`);
  };
  window.runTranslateV1 = async function(){
    const text=($('trTextV1')?.value||'').trim(), to=$('trToV1')?.value||'id', out=$('trOutV1');
    if(!text) return window.toast?.('Teks kosong.','warn');
    out.innerHTML='<div class="panel">⏳ Translate...</div>';
    try{ const api=`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`; const j=await (await fetch(api)).json(); const res=(j?.[0]||[]).map(x=>x[0]).join(''); out.innerHTML=`<div class="panel"><b>Hasil:</b><p>${safe(res)}</p><button class="btn green" style="width:100%" onclick='navigator.clipboard.writeText(${JSON.stringify(res)});toast?.("Disalin")'>📋 Copy</button></div>`; }catch(e){ out.innerHTML='<div class="proxyWarn">❌ '+safe(e.message)+'</div>'; }
  };

  window.addEventListener('load',()=>{
    patchTitle(); patchAccessUI();
    const oldRenderAll=window.renderAll; if(oldRenderAll && !oldRenderAll.__v1patched){ window.renderAll=function(){ const r=oldRenderAll.apply(this,arguments); setTimeout(()=>{patchTitle();patchAccessUI();},80); return r; }; window.renderAll.__v1patched=true; }
    const oldToggle=window.toggleMenu; if(oldToggle && !oldToggle.__v1patched){ window.toggleMenu=function(){ const r=oldToggle.apply(this,arguments); setTimeout(patchAccessUI,30); return r; }; window.toggleMenu.__v1patched=true; }
    startRealtime();
  });
})();
