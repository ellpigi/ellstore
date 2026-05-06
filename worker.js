const CUKI_KEY = 'cuki-x';
const BOTCAHX_KEY = 'ellapikey';
const BASE = {cuki:'https://api.cuki.biz.id', nexray:'https://api.nexray.eu.cc', botcahx:'https://api.botcahx.eu.org'};
export default { async fetch(request){
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers:cors()});
  const u=new URL(request.url), type=(u.searchParams.get('type')||'').toLowerCase(), url=u.searchParams.get('url')||'', q=u.searchParams.get('q')||'';
  let api='';
  if(['tiktok','tt'].includes(type)) api=`${BASE.cuki}/api/downloader/tiktok?apikey=${encodeURIComponent(CUKI_KEY)}&url=${encodeURIComponent(url)}`;
  else if(['facebook','fb'].includes(type)) api=`${BASE.nexray}/downloader/facebook?url=${encodeURIComponent(url)}`;
  else if(['instagram','ig'].includes(type)) api=`${BASE.nexray}/downloader/instagram?url=${encodeURIComponent(url)}`;
  else if(type==='spotify') api=`${BASE.nexray}/downloader/spotify?url=${encodeURIComponent(url)}`;
  else if(type==='spotifyplay') api=`${BASE.nexray}/downloader/spotifyplay?q=${encodeURIComponent(q)}`;
  else if(['ytplay','youtube','ytmp3'].includes(type)) api=`${BASE.nexray}/downloader/ytplay?q=${encodeURIComponent(q)}`;
  else if(['ytplayvid','ytmp4'].includes(type)) api=`${BASE.nexray}/downloader/ytplayvid?q=${encodeURIComponent(q)}`;
  else if(['videy','vd'].includes(type)) api=`${BASE.botcahx}/api/download/videy?apikey=${encodeURIComponent(BOTCAHX_KEY)}&url=${encodeURIComponent(url)}`;
  else return json({status:false,message:'Type tidak dikenal / kosong',contoh:'?type=tiktok&url=https://vt.tiktok.com/xxx'},400);
  try{ const r=await fetch(api,{headers:{accept:'application/json,text/plain,*/*','user-agent':'Mozilla/5.0'}}); const t=await r.text(); return new Response(t,{headers:{...cors(),'content-type':t.trim().startsWith('{')?'application/json; charset=utf-8':'text/plain; charset=utf-8'}}); }
  catch(e){ return json({status:false,message:e.message||'Relay gagal'},500); }
}};
function cors(){return {'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'*','cache-control':'no-store'}}
function json(o,s=200){return new Response(JSON.stringify(o,null,2),{status:s,headers:{...cors(),'content-type':'application/json; charset=utf-8'}})}
