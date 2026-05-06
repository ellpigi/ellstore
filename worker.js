
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const target = url.searchParams.get('url') || url.searchParams.get('target');
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,*'
    };
    if (request.method === 'OPTIONS') return new Response('', { headers });
    if (!target) return Response.json({ status:false, message:'Parameter url kosong', contoh:'?url=https://api.example.com' }, { headers });
    try {
      const res = await fetch(target, { method: request.method === 'POST' ? 'POST' : 'GET', headers: { 'accept':'application/json,text/plain,*/*' } });
      const body = await res.arrayBuffer();
      const h = new Headers(headers);
      h.set('content-type', res.headers.get('content-type') || 'application/octet-stream');
      return new Response(body, { status: res.status, headers: h });
    } catch (e) {
      return Response.json({ status:false, message:e.message || String(e), target }, { status:500, headers });
    }
  }
}
