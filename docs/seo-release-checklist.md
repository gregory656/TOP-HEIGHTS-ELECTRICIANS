# SEO release and ownership checklist

Prepared 23 October 2026. This change is tested locally; production deployment remains Gregory's responsibility.

## Included in this change

- Build-time HTML for Home, Services, About, Shop, Blog and Privacy, each with a unique title, description, canonical URL and visible text before JavaScript starts. React still provides the full interactive page.
- Shared metadata keeps Services/About client navigation consistent with the initial HTML.
- Expanded dynamic sitemap includes those public pages plus published products and articles. Invalid/missing article slugs are skipped; duplicate URLs are removed.
- Production robots allow public indexing; preview pages remain noindex. Private dashboard/profile routes receive X-Robots-Tag noindex headers in Vercel.
- Organization structured data uses the established name, URL, logo, contact number and service country. Unsupported 24-hour opening and payment claims were removed.
- Permanent /news to /blog redirect. Existing product/article metadata and API routing are preserved.

No ranking, indexing date or Core Web Vitals score is promised. No live content or payment was changed.

## After Gregory merges and deploys

1. Open the public pages and view page source. Confirm their own canonical URL, title and one initial heading. Confirm the sitemap includes /services, /about and published catalogue records. Check a real published product/article URL too.
2. Open Google Search Console (https://search.google.com/search-console). Add the Domain property topheightselectricals.com if not already verified. The domain/DNS owner adds the exact TXT record Google supplies. Do not send passwords or invent a verification token.
3. Submit https://topheightselectricals.com/sitemap.xml in Sitemaps. Use URL Inspection on Home, Services, About, Shop and Blog to inspect Google's rendered page and request indexing where appropriate. Review Page indexing and Search performance over subsequent weeks.
4. Confirm business name, public phone numbers, service areas, address and hours with the owner. Review/claim the corresponding Google Business Profile and keep details consistent. Do not publish invented opening hours or locations.
5. Run PageSpeed Insights for the live Home, Services, Shop and one article, especially on mobile. Address measured image/JavaScript/layout problems; the current browser checks verify layout, not real-user Core Web Vitals.
6. Publish accurate products with actual prices/stock and useful original articles. Maintain descriptive internal links and image alternative text. Confirm analytics traffic appears under G-SQ2RCSD1VY after optional consent.

Google guidance: https://developers.google.com/search/docs/fundamentals/seo-starter-guide and https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap .
