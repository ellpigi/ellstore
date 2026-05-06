const CUKI_KEY = 'cuki-x';
const BOTCAHX_KEY = 'ISI_APIKEY_BOTCAHX_LU';
const BASE = {
  cuki: 'https://api.cuki.biz.id',
  nexray: 'https://api.nexray.eu.cc',
  botcahx: 'https://api.botcahx.eu.org',
  ourin: 'https://api.ourin.my.id'
};
export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });
    const url = new URL(request.url);
    const type = String(url.searchParams.get('type') || '').toLowerCase().trim();
    const target = url.searchParams.get('url') || '';
    const q = url.searchParams.get('q') || '';
    let api = '';
    try {
      if (!type) return json({ status:false, message:'Parameter type kosong', contoh:'?type=tiktok&url=https://vt.tiktok.com/xxxx' }, 400);
      if (type === 'tiktok' || type === 'tt') {
        if (!target) return json({ status:false, message:'URL TikTok kosong' }, 400);
        api = `${BASE.cuki}/api/downloader/tiktok?apikey=${encodeURIComponent(CUKI_KEY)}&url=${encodeURIComponent(target)}`;
      } else if (type === 'facebook' || type === 'fb') {
        if (!target) return json({ status:false, message:'URL Facebook kosong' }, 400);
        api = `${BASE.nexray}/downloader/facebook?url=${encodeURIComponent(target)}`;
      } else if (type === 'instagram' || type === 'ig') {
        if (!target) return json({ status:false, message:'URL Instagram kosong' }, 400);
        api = `${BASE.nexray}/downloader/instagram?url=${encodeURIComponent(target)}`;
      } else if (type === 'spotify') {
        if (!target) return json({ status:false, message:'URL Spotify kosong' }, 400);
        api = `${BASE.nexray}/downloader/spotify?url=${encodeURIComponent(target)}`;
      } else if (type === 'spotifyplay') {
        if (!q) return json({ status:false, message:'Query Spotify kosong' }, 400);
        api = `${BASE.nexray}/downloader/spotifyplay?q=${encodeURIComponent(q)}`;
      } else if (type === 'ytplay' || type === 'youtube' || type === 'ytmp3') {
        if (!q) return json({ status:false, message:'Query YouTube kosong' }, 400);
        api = `${BASE.nexray}/downloader/ytplay?q=${encodeURIComponent(q)}`;
      } else if (type === 'ytplayvid' || type === 'ytmp4') {
        if (!q) return json({ status:false, message:'Query YouTube kosong' }, 400);
        api = `${BASE.nexray}/downloader/ytplayvid?q=${encodeURIComponent(q)}`;
      } else if (type === 'videy' || type === 'vd') {
        if (!target) return json({ status:false, message:'URL Videy kosong' }, 400);
        api = `${BASE.botcahx}/api/download/videy?apikey=${encodeURIComponent(BOTCAHX_KEY)}&url=${encodeURIComponent(target)}`;
      } else {
        return json({ status:false, message:'Type tidak dikenal', type }, 400);
      }
      const res = await fetch(api, { headers:{ 'Accept':'application/json,text/plain,*/*', 'User-Agent':'Mozilla/5.0' } });
      const text = await res.text();
      return new Response(text, { status:200, headers:{ ...cors(), 'Content-Type': contentType(text) }});
    } catch(e) {
      return json({ status:false, message:e.message || 'Relay gagal request API', type, api }, 500);
    }
  }
};
function contentType(text){ const t=String(text||'').trim(); return (t.startsWith('{') || t.startsWith('[')) ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8'; }
function cors(){ return { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS', 'Access-Control-Allow-Headers':'*', 'Cache-Control':'no-store' }; }
function json(data,status=200){ return new Response(JSON.stringify(data,null,2), { status, headers:{ ...cors(), 'Content-Type':'application/json; charset=utf-8' }}); }