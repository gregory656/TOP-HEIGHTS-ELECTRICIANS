const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname, '../src/services/orderModel.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const context = { exports: {} }; vm.runInNewContext(code, context);
const { normalizeOrder, isVerifiedSale, orderTime } = context.exports;
test('both dashboards count only verified live payments, never unpaid, sandbox or legacy records', () => {
  const base = { schemaVersion: 2, paymentVerified: true, paymentStatus: 'paid', paymentEnvironment: 'live', totalAmount: 1000 };
  const rows = [base, {...base, paymentStatus:'pending'}, {...base, paymentEnvironment:'sandbox'}, {...base, schemaVersion:1}, {...base, paymentVerified:false}].map((data,i) => normalizeOrder(String(i),data));
  assert.equal(rows.filter(isVerifiedSale).reduce((sum,o) => sum+o.totalAmount,0),1000);
  assert.equal(rows[3].paymentStatus,'unverified');
});
test('canonical order supports nested customer data, legacy labels and Firestore timestamps', () => {
  const order=normalizeOrder('one',{customerInfo:{fullName:'Customer',deliveryAddress:'Voi'},createdAt:{seconds:100},items:[]});
  assert.equal(order.customerInfo.fullName,'Customer');assert.equal(order.customerInfo.deliveryAddress,'Voi');assert.equal(orderTime(order.createdAt),100000);
  assert.equal(normalizeOrder('old',{customerName:'Older customer'}).customerInfo.fullName,'Older customer');
});
