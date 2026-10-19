import { money, record, reject } from './commerce';

export function field(value: unknown, label: string, max: number, min = 0) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) return reject(`Invalid ${label}.`);
  return value.trim();
}
export function integer(value: unknown, label: string, min = 0, max = 1000000) {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) return reject(`Invalid ${label}.`);
  return Number(value);
}
export function slug(value: unknown) {
  const result = field(value, 'slug', 100, 1);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) reject('Use lowercase letters, numbers and single hyphens for the slug.');
  return result;
}
export function mediaUrl(value: unknown) {
  const result = field(value, 'image URL', 2000, 1);
  if (/^\/[a-zA-Z0-9_ ./%-]+$/.test(result) && !result.startsWith('//') && !result.includes('..')) return result;
  let url: URL;
  try { url = new URL(result); } catch { return reject('Use an uploaded image or a local image path.'); }
  const local = process.env.FIREBASE_STORAGE_EMULATOR_HOST && url.protocol === 'http:' && url.hostname === '127.0.0.1' && url.port === '9198';
  // Administrators may use an existing hosted image without provisioning Storage.
  // These URLs are rendered as images, never fetched or executed by this API.
  if (!local && (url.protocol !== 'https:' || url.username || url.password || url.port)) reject('Use an HTTPS image URL without credentials or a site image path.');
  return url.href;
}
export function videoEmbed(value: unknown) {
  const result = field(value, 'video URL', 500, 1);
  let url: URL;
  try { url = new URL(result); } catch { return reject('Enter a YouTube or Vimeo URL.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) reject('Enter a secure YouTube or Vimeo URL.');
  const host = url.hostname;
  let video = '';
  if (['www.youtube.com', 'youtube.com', 'm.youtube.com'].includes(host)) video = url.pathname === '/watch' ? url.searchParams.get('v') || '' : url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})\/?$/)?.[1] || '';
  if (host === 'youtu.be') video = url.pathname.slice(1);
  if (/^[\w-]{11}$/.test(video)) return `https://www.youtube-nocookie.com/embed/${video}`;
  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
    const match = url.pathname.match(/^\/(?:video\/)?(\d{6,12})\/?$/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;
  }
  return reject('Use a public YouTube or Vimeo video link.');
}
export function parseProduct(input: unknown) {
  const data = record(input);
  const price = money(data.price) / 100;
  if (price <= 0) reject('Price must be greater than zero.');
  const comparisonPrice = data.comparisonPrice == null || data.comparisonPrice === '' ? null : money(data.comparisonPrice) / 100;
  if (comparisonPrice !== null && comparisonPrice < price) reject('Comparison price must be at least the selling price.');
  const status = field(data.status, 'product status', 20);
  if (!['active', 'draft', 'out_of_stock', 'archived'].includes(status)) reject('Invalid product status.');
  const images = Array.isArray(data.images) ? data.images.map(mediaUrl) : [];
  if (images.length > 8) reject('Use at most eight product images.');
  if (!Array.isArray(data.specifications) || data.specifications.length > 40) reject('Use at most forty specifications.');
  const specifications = (data.specifications as unknown[]).map(raw => { const item = record(raw); return { label: field(item.label, 'specification label', 100, 1), value: field(item.value, 'specification value', 500, 1) }; });
  const published = data.published === true && ['active', 'out_of_stock'].includes(status);
  if (published && !images.length) reject('Add an image before publishing.');
  const sku = field(data.sku, 'SKU', 80, 1).toUpperCase();
  if (!/^[A-Z0-9_-]+$/.test(sku)) reject('SKU may contain letters, numbers, hyphens and underscores.');
  return { schemaVersion: 2, name: field(data.name, 'product name', 150, 1), slug: slug(data.slug), sku,
    description: field(data.description, 'short description', 600), details: field(data.details, 'full description', 15000),
    category: field(data.category, 'category', 100, 1), price, comparisonPrice, images, image: images[0] || '', specifications,
    lowStockThreshold: integer(data.lowStockThreshold, 'low-stock threshold'), status, published,
    active: published && status === 'active', featured: data.featured === true };
}
export function parsePost(input: unknown) {
  const data = record(input);
  const status = field(data.status, 'post status', 20);
  if (!['draft', 'published', 'archived'].includes(status)) reject('Invalid post status.');
  const mediaType = data.mediaType === 'video' ? 'video' : 'image';
  const image = data.image ? mediaUrl(data.image) : '';
  const videoUrl = data.videoUrl ? field(data.videoUrl, 'video URL', 500) : '';
  const embedUrl = videoUrl ? videoEmbed(videoUrl) : '';
  const publishedDate = field(data.publishedDate, 'publication date', 10, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedDate) || !Number.isFinite(Date.parse(publishedDate)) || new Date(publishedDate).toISOString().slice(0, 10) !== publishedDate) reject('Invalid publication date.');
  if (status === 'published' && publishedDate > new Date().toISOString().slice(0, 10)) reject('Future posts must remain drafts. Publish on the intended date.');
  if (status === 'published' && !(mediaType === 'image' ? image : embedUrl)) reject('Add a featured image or video before publishing.');
  const tags = Array.isArray(data.tags) ? data.tags.map(tag => field(tag, 'tag', 50, 1)) : [];
  if (tags.length > 20) reject('Use at most twenty tags.');
  return { schemaVersion: 2, title: field(data.title, 'title', 200, 1), slug: slug(data.slug),
    excerpt: field(data.excerpt, 'excerpt', 600, status === 'published' ? 1 : 0), summary: field(data.summary, 'summary', 1000),
    content: field(data.content, 'content', 60000, status === 'published' ? 1 : 0), author: field(data.author, 'author', 120, 1),
    category: field(data.category, 'category', 100, 1), tags, mediaType, image, videoUrl, embedUrl,
    status, publishedDate, seoTitle: field(data.seoTitle, 'SEO title', 100), seoDescription: field(data.seoDescription, 'SEO description', 200) };
}
export function adjustStock(previous: number, input: unknown) {
  const data = record(input);
  const type = field(data.type, 'adjustment type', 20);
  if (!['stock_in', 'stock_out', 'correction', 'damaged', 'returned'].includes(type)) reject('Invalid stock adjustment.');
  const quantity = integer(data.quantity, 'quantity', type === 'correction' ? 0 : 1);
  const note = field(data.note, 'reason for adjustment', 1000, 3);
  const next = type === 'correction' ? quantity : previous + (['stock_out', 'damaged'].includes(type) ? -quantity : quantity);
  if (next < 0 || next > 1000000) reject('Stock must remain between zero and one million.', 409);
  return { type, quantity, note, previousQuantity: previous, newQuantity: next };
}
