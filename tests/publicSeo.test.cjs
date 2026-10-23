const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pages, renderPublicPage, preparePublicPages } = require('../scripts/public-page-seo.cjs');
const config = require('../vercel.json');
const template = '<!doctype html><head><title>Old</title><meta name="description" content="Old"><link rel="canonical" href="https://old.test/"><script type="application/ld+json">{"openingHours":"24/7"}</script><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body>';
test('every public page has one matching canonical, title and heading before JavaScript runs', () => {
  for (const page of pages) {
    const html = renderPublicPage(template,page,'https://topheightselectricals.com',true);
    assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
    assert.ok(html.includes(`href="https://topheightselectricals.com${page.path}"`));
    assert.equal((html.match(/<title>/g)||[]).length,1);
    assert.equal((html.match(/<h1>/g)||[]).length,1);
    assert.ok(html.includes('content="index, follow"'));
    assert.ok(html.includes('/assets/app.js'));
    assert.ok(!html.includes('openingHours'));
    if(page.path!=='/')assert.ok(config.rewrites.some(r=>r.source===page.path&&r.destination===page.path+'/index.html'));
  }
});
test('generated HTML escapes editable text and previews stay noindex', () => {
  const html=renderPublicPage(template,{...pages[0],title:'<script>bad</script>',description:'" onload="bad',heading:'<img src=x>'},'https://preview.example.test',false);
  assert.ok(!html.includes('<script>bad</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&quot; onload=&quot;bad'));
  assert.ok(html.includes('content="noindex, nofollow"'));
});
test('build writes every static entry and keeps the source template reusable', t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'topheights-seo-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  fs.mkdirSync(path.join(root,'dist'));fs.writeFileSync(path.join(root,'dist/index.html'),template);
  preparePublicPages(root,{VITE_SITE_URL:'https://preview.example.test',VITE_INDEXABLE:'false'});
  for(const page of pages){const html=fs.readFileSync(path.join(root,'dist',page.path.slice(1),'index.html'),'utf8');assert.ok(html.includes(`href="https://preview.example.test${page.path}"`));assert.ok(html.includes('noindex, nofollow'));}
});

test('sitemap combines public routes with published catalogue records and skips missing article slugs', async () => {
  const { createNetlifyHandler } = require('../backend/functions/lib/netlify');
  const handler = createNetlifyHandler({ db: { collection: name => ({ where: (field, op, value) => {
    assert.equal(op,'==');assert.equal(field,name === 'products' ? 'published' : 'status');assert.equal(value,name === 'products' ? true : 'published');
    return { get: async () => ({ docs: name === 'products' ? [{id:'p1',data:()=>({slug:'solar-panel'})}] : [{id:'n1',data:()=>({slug:'solar-guide'})},{id:'old',data:()=>({})}] }) };
  } }) }, verifyToken: async()=>({uid:'unused'}), provider:{}, storefront:'https://topheightselectricals.com',mode:'sandbox',webhookChallenge:'' });
  const result = await handler({httpMethod:'GET',path:'/sitemap.xml',rawUrl:'https://topheightselectricals.com/sitemap.xml',headers:{},isBase64Encoded:false},{});
  assert.equal(result.statusCode,200);
  for(const page of pages)assert.ok(result.body.includes(`<loc>https://topheightselectricals.com${page.path}</loc>`));
  assert.ok(result.body.includes('/shop/solar-panel'));assert.ok(result.body.includes('/blog/solar-guide'));assert.ok(!result.body.includes('/undefined'));
});
