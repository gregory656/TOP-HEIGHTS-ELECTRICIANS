import { useState } from 'react';
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { Product } from '../../data/products';
import { adjustInventory, imageUploadsEnabled, saveContent, uploadImage } from '../../services/contentService';
import ProductImage from '../ProductImage';
import History from './History';
import { products as catalogue } from '../../data/products';
import { catalogueDraft, contentSlug } from '../../services/contentModel';

const blank = (): Product => ({ id: crypto.randomUUID(), name: '', slug: '', sku: '', price: 0, category: '', image: '', images: [], description: '', details: '', specifications: [], stock: 0, lowStockThreshold: 5, status: 'draft', published: false, featured: false });
export default function ProductManager({ products }: { products: Product[] }) {
  const [form, setForm] = useState<Product | null>(null);
  const [specs, setSpecs] = useState('');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [adjustment, setAdjustment] = useState({ type: 'stock_in', quantity: 1, note: '', requestId: '' });
  function edit(product = blank()) { setError(''); setPreview(false); setForm({ ...product }); setSpecs((product.specifications || []).map(s => `${s.label}: ${s.value}`).join('\n')); }
  async function run(action: () => Promise<void>) { setBusy(true); setError(''); try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not save.'); } finally { setBusy(false); } }
  const set = (key: keyof Product, value: unknown) => setForm(current => current ? { ...current, [key]: value } : current);
  const currentStock = products.find(p => p.id === stockProduct?.id) || stockProduct;
  const existingIds = new Set(products.map(p => String(p.id)));
  const missing = catalogue.filter(p => !existingIds.has(String(p.id)) && !products.some(saved => saved.slug === (p.slug || contentSlug(p.name))));
  return <Stack spacing={2}>
    <Stack direction="row" gap={2} flexWrap="wrap" justifyContent="space-between"><Typography variant="h5">Products</Typography><Button variant="contained" onClick={() => edit()}>Add product</Button></Stack>
    {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}
    <TextField label="Search name, SKU or category" value={search} onChange={e => setSearch(e.target.value)} size="small" />
    {products.length === 0 && <Typography>No products yet. Add your first product as a draft.</Typography>}
    {missing.length > 0 && <Box><Alert severity="info" sx={{ mb: 1 }}>These catalogue items are stored in code. Create an editable draft, review the price and actual stock, then publish it.</Alert><Stack direction="row" gap={1} flexWrap="wrap">{missing.map(p => <Button key={p.id} variant="outlined" onClick={() => edit(catalogueDraft(p))}>Create draft: {p.name}</Button>)}</Stack></Box>}
    {products.filter(p => `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(search.toLowerCase())).map(p => <Box key={p.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
        <Box><Typography fontWeight={700}>{p.name}</Typography><Typography variant="body2">{p.sku} · KES {p.price.toLocaleString()} · {p.stock ?? 0} available</Typography><Typography variant="caption">{p.status || 'Needs migration'} · {p.published ? 'Published' : 'Private'}{Number(p.stock) <= Number(p.lowStockThreshold) ? ' · Low stock' : ''}</Typography></Box>
        <Stack direction="row" gap={1}><Button onClick={() => edit(p)}>Edit / preview</Button><Button onClick={() => { setError(''); setStockProduct(p); setAdjustment({ type: 'stock_in', quantity: 1, note: '', requestId: crypto.randomUUID() }); }}>Adjust stock</Button></Stack>
      </Stack>
    </Box>)}
    <Dialog open={!!form} onClose={() => !busy && setForm(null)} fullWidth maxWidth="md">
      <DialogTitle>{form?.version ? 'Edit product' : 'Create product'}</DialogTitle>
      <DialogContent>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{form && (preview ? <Stack spacing={2}>
        <ProductImage product={form} large /><Typography variant="h4">{form.name}</Typography><Typography>KES {form.price.toLocaleString()}</Typography><Typography>{form.description}</Typography><Typography sx={{ whiteSpace: 'pre-wrap' }}>{form.details}</Typography><Typography sx={{ whiteSpace: 'pre-wrap' }}>{specs}</Typography>
      </Stack> : <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField label="Product name" required value={form.name} onChange={e => { const name = e.target.value; setForm({ ...form, name, slug: !form.slug || form.slug === contentSlug(form.name) ? contentSlug(name) : form.slug, sku: form.sku || `PRODUCT-${String(form.id).slice(0, 8).toUpperCase()}` }); }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}><TextField fullWidth label="Slug" required value={form.slug || ''} onChange={e => set('slug', e.target.value)} helperText="Lowercase words separated by hyphens" /><TextField fullWidth label="SKU" required value={form.sku || ''} onChange={e => set('sku', e.target.value)} /></Stack>
        <TextField label="Category" required value={form.category} onChange={e => set('category', e.target.value)} />
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}><TextField fullWidth label="Price (KES)" required type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} /><TextField fullWidth label="Comparison price (optional)" type="number" value={form.comparisonPrice ?? ''} onChange={e => set('comparisonPrice', e.target.value === '' ? null : Number(e.target.value))} /></Stack>
        <TextField label="Short description" multiline minRows={2} value={form.description || ''} onChange={e => set('description', e.target.value)} />
        <TextField label="Full description" multiline minRows={4} value={form.details || ''} onChange={e => set('details', e.target.value)} />
        <TextField label="Specifications" multiline minRows={3} value={specs} onChange={e => setSpecs(e.target.value)} helperText="One per line, for example: Rated power: 550W" />
        <TextField label="Image URLs or site paths (one per line)" multiline value={(form.images || [form.image]).filter(Boolean).join('\n')} onChange={e => { const images = e.target.value.split('\n'); setForm({ ...form, images, image: images[0] || '' }); }} helperText="The first image is the cover. Paste an HTTPS image URL or a site path such as /solarenergy.jpeg." />
        {!imageUploadsEnabled && <Alert severity="info">File uploads are unavailable in this environment. You can still add or replace images using their URLs or existing site paths above.</Alert>}
        <Button component="label" disabled={busy || !imageUploadsEnabled} variant="outlined">Upload image<input hidden disabled={!imageUploadsEnabled} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => { const file = e.target.files?.[0]; if (file) void run(async () => { const image = await uploadImage('products', file); setForm(current => current ? { ...current, images: [...(current.images || []).filter(Boolean), image], image: current.image || image } : current); }); e.target.value = ''; }} /></Button>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}><TextField fullWidth label={form.version ? 'Available stock (use Adjust stock)' : 'Opening stock'} disabled={Boolean(form.version)} type="number" value={form.stock ?? 0} onChange={e => set('stock', Number(e.target.value))} /><TextField fullWidth label="Low-stock threshold" type="number" value={form.lowStockThreshold ?? 5} onChange={e => set('lowStockThreshold', Number(e.target.value))} /></Stack>
        <TextField select label="Selling status" value={form.status || 'draft'} onChange={e => set('status', e.target.value)}>{['active', 'draft', 'out_of_stock', 'archived'].map(status => <MenuItem key={status} value={status}>{status.replaceAll('_', ' ')}</MenuItem>)}</TextField>
        <FormControlLabel control={<Checkbox checked={!!form.published} onChange={e => set('published', e.target.checked)} />} label="Publish in the shop (active or out-of-stock products only)" />
        <FormControlLabel control={<Checkbox checked={!!form.featured} onChange={e => set('featured', e.target.checked)} />} label="Featured on home page" />
      </Stack>)}</DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap' }}><Button disabled={busy} onClick={() => setForm(null)}>Cancel</Button><Button disabled={busy} onClick={() => setPreview(!preview)}>{preview ? 'Back to editor' : 'Preview'}</Button><Button variant="contained" disabled={busy} onClick={() => void run(async () => { if (!form) return; if (!form.name.trim() || !form.category.trim() || !form.slug || !form.sku) throw new Error('Enter a product name, category, slug and SKU.'); if (!(form.price > 0)) throw new Error('Enter a price greater than zero.'); const specifications = specs.split('\n').filter(line => line.trim()).map(line => { const i = line.indexOf(':'); if (i < 1) throw new Error('Each specification needs a label and value separated by a colon.'); return { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() }; }); await saveContent('products', String(form.id), { ...form, images: (form.images || [form.image]).filter(Boolean), specifications }); setNotice(form.published && ['active', 'out_of_stock'].includes(form.status || '') ? `${form.name} saved and published in the shop.` : `${form.name} saved privately. Select an active selling status and Publish in the shop when ready.`); setForm(null); })}>{busy ? 'Saving…' : 'Save product'}</Button></DialogActions>
    </Dialog>
    <Dialog open={!!stockProduct} onClose={() => !busy && setStockProduct(null)} fullWidth maxWidth="sm">
      <DialogTitle>Adjust stock · {currentStock?.name}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}<Typography>Current quantity: {currentStock?.stock ?? 0}</Typography>
        <TextField select label="Adjustment type" value={adjustment.type} onChange={e => setAdjustment({ ...adjustment, type: e.target.value, requestId: crypto.randomUUID() })}>{['stock_in', 'stock_out', 'correction', 'damaged', 'returned'].map(type => <MenuItem key={type} value={type}>{type.replaceAll('_', ' ')}</MenuItem>)}</TextField>
        <TextField label={adjustment.type === 'correction' ? 'Correct total quantity' : 'Quantity to add or remove'} type="number" value={adjustment.quantity} onChange={e => setAdjustment({ ...adjustment, quantity: Number(e.target.value), requestId: crypto.randomUUID() })} />
        <TextField label="Reason / note" required multiline value={adjustment.note} onChange={e => setAdjustment({ ...adjustment, note: e.target.value, requestId: crypto.randomUUID() })} />
        {stockProduct && <History key={String(stockProduct.id)} kind="inventoryMovements" id={String(stockProduct.id)} />}
      </Stack></DialogContent><DialogActions><Button disabled={busy} onClick={() => setStockProduct(null)}>Close</Button><Button variant="contained" disabled={busy} onClick={() => void run(async () => { if (!currentStock) return; await adjustInventory(String(currentStock.id), { ...adjustment, version: currentStock.version }); setStockProduct(null); })}>Record adjustment</Button></DialogActions>
    </Dialog>
  </Stack>;
}
