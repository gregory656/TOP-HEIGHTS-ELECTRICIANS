const fs = require('node:fs');
const path = require('node:path');
const pages = require('../backend/functions/src/publicPages.json');
const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
function renderPublicPage(template, page, origin, indexable) {
  const title = `${page.title} | Top Heights Electricals`, url = origin + page.path, image = origin + '/topeheights.jpeg';
  const tags = { description: page.description, robots: indexable ? 'index, follow' : 'noindex, nofollow', 'og:type':'website', 'og:title':title, 'og:description':page.description, 'og:url':url, 'og:image':image, 'twitter:card':'summary', 'twitter:title':title, 'twitter:description':page.description, 'twitter:image':image };
  const schema = { '@context':'https://schema.org', '@type':'Organization', name:'Top Heights Electricals', url:origin+'/', logo:image, telephone:'+254711343412', areaServed:'Kenya' };
  const metadata = `<title>${escapeHtml(title)}</title><link rel="canonical" href="${escapeHtml(url)}">` + Object.entries(tags).map(([name, value]) => `<meta ${name.startsWith('og:') ? 'property' : 'name'}="${name}" content="${escapeHtml(value)}">`).join('') + `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
  const cleaned = template.replace(/<title>[\s\S]*?<\/title>/gi,'').replace(/<meta\s+(?:name|property)="(?:title|description|robots|og:[^"]+|twitter:[^"]+)"[^>]*>/gi,'').replace(/<link\s+rel="canonical"[^>]*>/gi,'').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi,'');
  const navigation = pages.map(item => `<a href="${item.path}">${escapeHtml(item.path === '/' ? 'Home' : item.path.slice(1).replace(/^./, s=>s.toUpperCase()))}</a>`).join(' | ');
  const content = `<main style="max-width:960px;margin:48px auto;padding:24px;font-family:system-ui"><nav aria-label="Main navigation">${navigation}</nav><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.text)}</p><p><a href="tel:+254711343412">Contact Top Heights: +254 711 343 412</a></p></main>`;
  return cleaned.replace('</head>', metadata + '</head>').replace(/<div id="root"><\/div>/, `<div id="root">${content}</div>`);
}
function preparePublicPages(root, env = process.env) {
  const origin = (env.VITE_SITE_URL || 'https://topheightselectricals.com').replace(/\/$/,'');
  const parsed = new URL(origin);
  if (parsed.origin !== origin || parsed.protocol !== 'https:') throw Error('SEO pages require an exact HTTPS site origin.');
  const template = fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
  for (const page of pages) {
    const target = path.join(root, 'dist', page.path === '/' ? '' : page.path.slice(1), 'index.html');
    fs.mkdirSync(path.dirname(target), { recursive:true });
    fs.writeFileSync(target, renderPublicPage(template,page,origin,env.VITE_INDEXABLE === 'true'));
  }
}
module.exports = { pages, renderPublicPage, preparePublicPages };
