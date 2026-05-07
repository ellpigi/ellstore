// worker.js - Cloudflare Worker bridge buat bot WA detect autoorder Firebase
// Isi ENV di Cloudflare Worker:
// FIREBASE_DB_URL = https://project-default-rtdb...firebasedatabase.app
// FIREBASE_ROOT = remiStore
// BOT_SECRET = secret-bebas-buat-bot

function json(data, status=200){
  return new Response(JSON.stringify(data,null,2), {status, headers:{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,DELETE,OPTIONS','access-control-allow-headers':'content-type,x-bot-secret'}});
}
function cfg(env){
  if(!env.FIREBASE_DB_URL) throw new Error('FIREBASE_DB_URL belum diisi');
  return {base: env.FIREBASE_DB_URL.replace(/\/$/,'')+'/'+(env.FIREBASE_ROOT||'remiStore')};
}
async function fb(env,path,method='GET',body){
  const {base}=cfg(env);
  const r=await fetch(base+'/'+path.replace(/^\/+|\/+$/g,'')+'.json', {method, headers:{'content-type':'application/json'}, body: body?JSON.stringify(body):undefined});
  const text=await r.text();
  let data=null; try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok) throw new Error((data&&data.error)||text||('Firebase HTTP '+r.status));
  return data;
}
function auth(req,env){
  if(!env.BOT_SECRET) return true;
  return req.headers.get('x-bot-secret')===env.BOT_SECRET;
}
export default {
  async fetch(req, env){
    try{
      if(req.method==='OPTIONS') return json({ok:true});
      const u=new URL(req.url);
      if(u.pathname==='/health') return json({ok:true, service:'remi-worker', root:env.FIREBASE_ROOT||'remiStore'});
      if(!auth(req,env)) return json({ok:false, error:'Unauthorized'},401);

      if(u.pathname==='/orders') return json({ok:true, data: await fb(env,'orders')||{}});
      if(u.pathname==='/bot-queue' || u.pathname==='/autoorder') return json({ok:true, data: await fb(env,'botQueue/autoorder')||{}});

      if(u.pathname.startsWith('/bot-queue/') && req.method==='DELETE'){
        const id=decodeURIComponent(u.pathname.split('/').pop());
        await fb(env,'botQueue/autoorder/'+id,'DELETE');
        return json({ok:true, deleted:id});
      }
      if(u.pathname.startsWith('/bot-queue/') && req.method==='POST'){
        const id=decodeURIComponent(u.pathname.split('/').pop());
        const body=await req.json().catch(()=>({}));
        await fb(env,'botQueue/autoorder/'+id,'PATCH',{queueStatus:body.status||'done',botNote:body.note||'',doneAt:Date.now()});
        return json({ok:true, id});
      }
      return json({ok:false, routes:['/health','/orders','/bot-queue','DELETE /bot-queue/:id','POST /bot-queue/:id']},404);
    }catch(e){ return json({ok:false, error:e.message||String(e)},500); }
  }
};
