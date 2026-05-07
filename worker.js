/* Remi AI Store V1 Worker / Bot Bridge
   Dipakai bot WA buat polling autoorder dari Firebase REST.
   Node 18+ sudah punya fetch. Kalau panel lu fosil, update Node dulu, ya ampun. */
const firebaseConfig = {
  databaseURL: "https://ellpigi-web-store-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
const ROOT = 'remiStoreV1';
const BASE = firebaseConfig.databaseURL.replace(/\/$/, '') + '/' + ROOT;
async function fbGet(path=''){
  const res = await fetch(`${BASE}/${path}.json`);
  if(!res.ok) throw new Error(`Firebase GET ${res.status}`);
  return res.json();
}
async function fbPatch(path='', data={}){
  const res = await fetch(`${BASE}/${path}.json`, { method:'PATCH', headers:{'content-type':'application/json'}, body:JSON.stringify(data) });
  if(!res.ok) throw new Error(`Firebase PATCH ${res.status}`);
  return res.json();
}
async function getPendingAutoOrders(){
  const data = await fbGet('botQueue/autoorder');
  return Object.values(data || {}).filter(o => !o.bot_detect && o.status === 'paid');
}
async function markOrderDetected(orderId){
  const patch = { bot_detect:true, bot_detect_at:new Date().toISOString() };
  await fbPatch(`botQueue/autoorder/${orderId}`, patch);
  await fbPatch(`orders/${orderId}`, patch);
  return true;
}
async function demo(){
  const orders = await getPendingAutoOrders();
  console.log('Pending autoorder:', orders);
}
if(require.main === module) demo().catch(err=>{ console.error(err); process.exit(1); });
module.exports = { fbGet, fbPatch, getPendingAutoOrders, markOrderDetected };
