# Admin content editing repair — 20 October 2026

The old news document lacked the slug and fields required by the editor, which disabled its Edit / preview button. Products shown publicly were fallback code entries rather than saved catalogue records. Saving a valid product already worked, but the editor did not report success or clearly explain private drafts.

Production data repair has been applied through the authenticated admin API: eight original catalogue products were copied to private drafts using their existing prices/content, with stock 0 and published=false. One legacy article was normalized to editable metadata while preserving its title/content. Original production records were backed up privately in ignored .local before migration. No product was published or real inventory inferred. Live browser checks confirmed eight product edit controls and enabled article edit/preview. A separate temporary private diagnostic product was removed with its own stock/key records.

This patch adds compatible legacy article defaults, automatic slugs/SKUs, required-field checks, save confirmations, editable starter/catalogue drafts and reversible article removal (archive). With Firebase configured, the public shop/blog use saved published records; empty results and errors no longer silently substitute code examples. Missing Firebase config retains the existing visual fallback for unconfigured previews only.

Before merging/deploying, review prices, record actual stock via Adjust stock, and publish intended products/articles. If nothing is published, the public shop/blog correctly show an empty state rather than unmanaged examples. Existing Greg UI/layout/auth changes are retained.

Verification: focused normalization/catalogue/error regression tests, TypeScript, changed-file lint, production Vercel build and secret scan passed. Browser checks against isolated staging passed legacy article edit, private preview, save/publication, archive, and importing a catalogue draft with successful save notice and persistence after reload. No live payments were initiated.
