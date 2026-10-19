// Local emulator only. This helper cannot seed a live project.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
if (!/^127\.0\.0\.1:\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST || '')) throw Error('Set FIRESTORE_EMULATOR_HOST to the local emulator, e.g. 127.0.0.1:8085.');
const fee = process.env.SHIPPING_FEE_KES;
if (!fee || !/^\d+(\.\d{1,2})?$/.test(fee)) throw Error('Specify SHIPPING_FEE_KES for this local test.');
const source = fs.readFileSync(path.join(__dirname, '../../..', 'src/data/products.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {} }; vm.runInNewContext(compiled, context);
initializeApp({ projectId: 'demo-topheights-commerce' });
const db = getFirestore();
(async () => {
  const batch = db.batch();
  for (const product of context.exports.products) {
    const ref = db.doc(`products/${product.id}`);
    if ((await ref.get()).exists) continue;
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    batch.set(ref, { ...product, id: String(product.id), schemaVersion: 2, slug, sku: `THE-${product.id}`, images: [product.image], status: product.inStock === false ? 'out_of_stock' : 'active', stock: product.inStock === false ? 0 : 20, lowStockThreshold: 5, published: true, active: product.inStock !== false, featured: Number(product.id) <= 4, version: 1, createdAt: new Date(), updatedAt: new Date() });
    batch.set(db.doc(`catalogueKeys/products-slug-${slug}`), { id: String(product.id) });
    batch.set(db.doc(`catalogueKeys/products-sku-THE-${product.id}`), { id: String(product.id) });
  }
  batch.set(db.doc('settings/global'), { shippingFee: Number(fee) }, { merge: true });
  await batch.commit();
  console.log(`Seeded ${context.exports.products.length} products in the local emulator only.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
