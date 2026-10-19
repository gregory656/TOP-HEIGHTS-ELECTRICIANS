import { record } from './commerce';

export const escapeHtml = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
export function renderPage(template: string, data: Record<string, unknown>, kind: 'product' | 'article', origin: string, indexable: boolean) {
  const title = String(kind === 'product' ? data.name : data.seoTitle || data.title);
  const description = String(kind === 'product' ? data.description || data.name : data.seoDescription || data.excerpt);
  const path = `/${kind === 'product' ? 'shop' : 'blog'}/${encodeURIComponent(String(data.slug))}`;
  const url = origin + path;
  const image = new URL(String(data.image || '/topeheights.jpeg'), origin).href;
  const schema = kind === 'product' ? { '@context': 'https://schema.org', '@type': 'Product', name: data.name, description, image, sku: data.sku,
    offers: { '@type': 'Offer', priceCurrency: 'KES', price: data.price, availability: data.active && Number(data.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url } }
    : { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: data.title, description, image, datePublished: data.publishedDate, author: { '@type': 'Person', name: data.author }, mainEntityOfPage: url };
  const metadata = `<title>${escapeHtml(title)} | Top Heights Electricals</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${indexable ? 'index, follow' : 'noindex, nofollow'}"><link rel="canonical" href="${escapeHtml(url)}">${Object.entries({ 'og:title': title, 'og:description': description, 'og:url': url, 'og:type': kind === 'article' ? 'article' : 'website', 'og:image': image, 'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': description, 'twitter:image': image }).map(([key, value]) => `<meta property="${key}" content="${escapeHtml(value)}">`).join('')}<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
  const paragraphs = String(kind === 'product' ? data.details || data.description : data.content).split(/\n\s*\n/).map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
  const specifications = kind === 'product' && Array.isArray(data.specifications) ? `<dl>${data.specifications.map(value => { const item = record(value); return `<dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd>`; }).join('')}</dl>` : '';
  const content = `<main style="max-width:960px;margin:48px auto;padding:24px;font-family:system-ui"><nav><a href="/shop">Shop</a> · <a href="/blog">News &amp; advice</a></nav><h1>${escapeHtml(kind === 'product' ? data.name : data.title)}</h1><p>${escapeHtml(description)}</p>${data.image && (kind === 'product' || data.mediaType === 'image') ? `<img style="max-width:100%" src="${escapeHtml(image)}" alt="${escapeHtml(title)}">` : ''}${kind === 'product' ? `<p>KES ${escapeHtml(data.price)}</p>` : `<p>${escapeHtml(data.author)} · ${escapeHtml(data.publishedDate)}</p>`}${paragraphs}${specifications}</main>`;
  return template.replace(/<title>[\s\S]*?<\/title>/gi, '').replace(/<meta\s+(?:name|property)="(?:title|description|robots|og:[^"]+|twitter:[^"]+)"[^>]*>/gi, '').replace(/<link\s+rel="canonical"[^>]*>/gi, '').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '').replace('</head>', `${metadata}</head>`).replace(/<div id="root"><\/div>/, `<div id="root">${content}</div>`);
}
