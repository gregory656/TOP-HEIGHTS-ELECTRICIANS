import type { Express, Request, Response, NextFunction } from 'express';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { adjustStock, field, integer, parsePost, parseProduct } from './catalogue';
import { digest, record, reject } from './commerce';

export function managementRoutes(app: Express, db: Firestore, admin: (req: Request) => Promise<string>) {
  const route = (fn: (req: Request, res: Response) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => { void fn(req, res).catch(next); };
  const stamp = () => FieldValue.serverTimestamp();
  const identifier = (value: unknown) => { const id = field(value, 'identifier', 100, 1); if (!/^[\w-]+$/.test(id)) reject('Invalid identifier.'); return id; };
  for (const kind of ['products', 'news'] as const) {
    app.post(`/admin/${kind}/:id`, route(async (req, res) => {
      const uid = await admin(req), id = identifier(req.params.id), body = record(req.body);
      const data = kind === 'products' ? parseProduct(body) : parsePost(body);
      const ref = db.doc(`${kind}/${id}`);
      await db.runTransaction(async tx => {
        const old = await tx.get(ref);
        if (old.exists && body.version !== old.data()?.version) reject('This record changed. Reload it before saving.', 409);
        const keys = [`${kind}-slug-${data.slug}`, ...(kind === 'products' ? [`products-sku-${(data as ReturnType<typeof parseProduct>).sku}`] : [])];
        const claims = await Promise.all(keys.map(key => tx.get(db.doc(`catalogueKeys/${key}`))));
        if (claims.some(claim => claim.exists && claim.data()?.id !== id)) reject('That slug or SKU is already in use.', 409);
        const previous = old.data();
        const next: Record<string, unknown> = { ...data, version: Number(previous?.version || 0) + 1, updatedAt: stamp(), updatedBy: uid };
        if (!old.exists) next.createdAt = stamp();
        if (kind === 'products' && !old.exists) {
          const stock = integer(body.stock, 'initial stock');
          next.stock = stock;
          tx.create(db.collection('inventoryMovements').doc(), { productId: id, type: 'stock_in', quantity: stock, previousQuantity: 0, newQuantity: stock, note: 'Opening stock', actor: uid, createdAt: stamp() });
        }
        if (kind === 'products' && old.exists && body.stock !== undefined && body.stock !== previous?.stock) reject('Use Adjust stock to record a quantity change.');
        for (const key of keys) tx.set(db.doc(`catalogueKeys/${key}`), { id });
        if (previous?.slug && previous.slug !== data.slug) tx.delete(db.doc(`catalogueKeys/${kind}-slug-${previous.slug}`));
        if (kind === 'products' && previous?.sku && previous.sku !== (data as ReturnType<typeof parseProduct>).sku) tx.delete(db.doc(`catalogueKeys/products-sku-${previous.sku}`));
        tx.set(ref, next, { merge: true });
      });
      res.json({ id });
    }));
  }
  app.post('/admin/products/:id/stock', route(async (req, res) => {
    const uid = await admin(req), productId = identifier(req.params.id), body = record(req.body);
    const requestId = identifier(body.requestId);
    const movement = db.doc(`inventoryMovements/${digest(`${uid}:${requestId}`)}`);
    const fingerprint = digest(JSON.stringify({ productId, type: body.type, quantity: body.quantity, note: body.note }));
    const result = await db.runTransaction(async tx => {
      const ref = db.doc(`products/${productId}`);
      const [product, existing] = await Promise.all([tx.get(ref), tx.get(movement)]);
      if (existing.exists) { if (existing.data()?.fingerprint !== fingerprint) reject('Stock adjustment reference was reused.', 409); return existing.data()!; }
      if (!product.exists) return reject('Product not found.', 404);
      if (body.version !== product.data()?.version) reject('Stock changed. Reload the product before adjusting it.', 409);
      const adjustment = adjustStock(integer(product.data()?.stock, 'current stock'), body);
      const data = { ...adjustment, productId, actor: uid, fingerprint, createdAt: stamp() };
      tx.update(ref, { stock: adjustment.newQuantity, version: Number(product.data()?.version || 0) + 1, updatedAt: stamp() });
      tx.create(movement, data);
      return data;
    });
    res.json({ newQuantity: result.newQuantity });
  }));
}
