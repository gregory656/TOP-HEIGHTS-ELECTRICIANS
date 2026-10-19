const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { webcrypto } = require('node:crypto');
const source = fs.readFileSync(require('node:path').join(__dirname,'../src/services/orderService.ts'),'utf8').replace('import.meta.env.VITE_COMMERCE_API_URL', "'https://api.example.test'");
const code = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
test('a webhook-paid checkout is retired before an identical later purchase', async () => {
  const storage=new Map(),orders=new Map(),requests=[];
  const context={exports:{},crypto:webcrypto,TextEncoder,AbortSignal,
    sessionStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
    require:id=> id==='./firebase'? {auth:{currentUser:{uid:'customer',getIdToken:async()=>'mock-token'}}} : {},
    fetch:async(url,init)=>{assert.equal(url,'https://api.example.test/orders');assert.equal(init.headers.Authorization,'Bearer mock-token');const body=JSON.parse(init.body);requests.push(body);if(!orders.has(body.idempotencyKey)) orders.set(body.idempotencyKey,{orderId:`order-${orders.size+1}`,paymentStatus:'pending',totalAmount:1000});return {ok:true,json:async()=>structuredClone(orders.get(body.idempotencyKey))};}};
  vm.runInNewContext(code,context);
  const payload={userId:'customer',fullName:'Customer',email:'customer@example.test',phone:'0712345678',address:'Voi',paymentMethod:'MPESA',items:[{productId:'1',quantity:1,price:0.01}]};
  const first=await context.exports.createOrderWithItems(payload);
  assert.equal((await context.exports.createOrderWithItems(payload)).orderId,first.orderId);
  assert.equal(orders.size,1);assert.equal('price' in requests[0].items[0],false);assert.equal(requests[0].paymentMethod,'MPESA');
  for(const order of orders.values())order.paymentStatus='paid';
  const second=await context.exports.createOrderWithItems(payload);
  assert.notEqual(second.orderId,first.orderId);assert.equal(second.paymentStatus,'pending');assert.equal(orders.size,2);
  await assert.rejects(context.exports.createOrderWithItems({...payload,userId:'other'}),/account changed/);
});
