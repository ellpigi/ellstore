export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors() });
    const target = url.searchParams.get('url');
    if (!target) return json({ status:false, message:'url parameter required' }, 400);
    try {
      const res = await fetch(target, { headers: { 'user-agent':'RemiStoreWorker/1.0' } });
      const body = await res.arrayBuffer();
      const h = cors();
      h.set('content-type', res.headers.get('content-type') || 'application/octet-stream');
      return new Response(body, { status:res.status, headers:h });
    } catch (e) {
      return json({ status:false, message:e.message }, 500);
    }
  }
};
function cors(){ return new Headers({ 'access-control-allow-origin':'*', 'access-control-allow-methods':'GET,POST,OPTIONS', 'access-control-allow-headers':'content-type,authorization' }); }
function json(data, status=200){ const h=cors(); h.set('content-type','application/json'); return new Response(JSON.stringify(data), { status, headers:h }); }
