import type { BlogPost } from './contentService';
import type { Product } from '../data/products';

export const contentSlug = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100).replace(/-$/, '');
const text = (value: unknown) => typeof value === 'string' ? value : '';

export function normalizePost(id: string, data: Record<string, unknown>): BlogPost {
  const date = (text(data.publishedDate) || text(data.date)).slice(0, 10);
  return { ...data, id, title: text(data.title), slug: text(data.slug) || contentSlug(text(data.title)) || `article-${id}`,
    excerpt: text(data.excerpt) || text(data.summary) || text(data.content).slice(0, 600), summary: text(data.summary), content: text(data.content),
    author: text(data.author) || 'Top Heights Electricals', category: text(data.category) || 'Solar & electrical',
    tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    mediaType: data.mediaType === 'video' ? 'video' : 'image', image: text(data.image), videoUrl: text(data.videoUrl), embedUrl: text(data.embedUrl),
    status: ['draft', 'published', 'archived'].includes(text(data.status)) ? data.status as BlogPost['status'] : 'draft',
    publishedDate: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10),
    seoTitle: text(data.seoTitle), seoDescription: text(data.seoDescription),
  };
}

export function catalogueDraft(product: Product): Product {
  return { ...product, id: String(product.id), slug: product.slug || contentSlug(product.name), sku: product.sku || `CATALOGUE-${product.id}`,
    images: product.images || (product.image ? [product.image] : []), details: product.details || product.description || '',
    specifications: product.specifications || [], stock: 0, lowStockThreshold: 5, status: 'draft', published: false, featured: product.featured || false };
}

export function articleForSave(post: BlogPost, status: 'draft' | 'published', today = new Date().toISOString().slice(0, 10)): BlogPost {
  if (!post.title.trim() || !post.slug || !post.author.trim() || !post.category.trim()) throw new Error('Enter a title, slug, author and category.');
  if (status === 'published') {
    if (!post.excerpt.trim() || !post.content.trim()) throw new Error('Add an excerpt and main content before publishing.');
    if (!(post.mediaType === 'video' ? post.videoUrl.trim() : post.image.trim())) throw new Error('Add a featured image or video before publishing.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.publishedDate) || !Number.isFinite(Date.parse(post.publishedDate)) || new Date(post.publishedDate).toISOString().slice(0, 10) !== post.publishedDate) throw new Error('Choose a valid publication date.');
    if (post.publishedDate > today) throw new Error('Choose today or an earlier date to publish now. Future articles can be saved as drafts.');
  }
  return { ...post, status, tags: post.tags.filter(Boolean) };
}
