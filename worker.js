const CUKI_KEY = 'cuki-x';
const BASE = { cuki:'https://api.cuki.biz.id', nexray:'https://api.nexray.eu.cc' };
export default { async fetch(req){
  if(req.method==='OPTIONS') return new Response(null,{headers:cors()});
  const u=new URL(req.url); const type=(u.searchParams.get('type')||'').toLowerCase(); const target=u.searchParams.get('url')||''; const q=u.searchParams.get('q')||'';
  try{
    let api='';
    if(['tiktok','tt'].includes(type)) api=`${BASE.cuki}/api/downloader/tiktok?apikey=${encodeURIComponent(CUKI_KEY)}&url=${encodeURIComponent(target)}`;
    else if(['facebook','fb'].includes(type)) api=`${BASE.nexray}/downloader/facebook?url=${encodeURIComponent(target)}`;
    else if(['instagram','ig'].includes(type)) api=`${BASE.nexray}/downloader/instagram?url=${encodeURIComponent(target)}`;
    else if(type==='spotify') api=`${BASE.nexray}/downloader/spotify?url=${encodeURIComponent(target)}`;
    else if(type==='spotifyplay') api=`${BASE.nexray}/downloader/spotifyplay?q=${encodeURIComponent(q)}`;
    else if(['ytplay','ytmp3','youtube'].includes(type)) api=`${BASE.nexray}/downloader/ytplay?q=${encodeURIComponent(q)}`;
    else if(['ytplayvid','ytmp4'].includes(type)) api=`${BASE.nexray}/downloader/ytplayvid?q=${encodeURIComponent(q)}`;
    else if(['videy','vd'].includes(type)) api=`${BASE.nexray}/downloader/videy?url=${encodeURIComponent(target)}`;
    else return json({status:false,message:'type tidak dikenal'},400);
    const r=await fetch(api,{headers:{accept:'application/json,text/plain,*/*','user-agent':'Mozilla/5.0'}}); const t=await r.text();
    return new Response(t,{headers:{...cors(),'content-type':t.trim().startsWith('{')?'application/json;charset=utf-8':'text/plain;charset=utf-8'}});
  }catch(e){return json({status:false,message:e.message||'relay error'},500)}
}};
function cors(){return {'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'*','cache-control':'no-store'}}
function json(o,s=200){return new Response(JSON.stringify(o,null,2),{status:s,headers:{...cors(),'content-type':'application/json;charset=utf-8'}})}
