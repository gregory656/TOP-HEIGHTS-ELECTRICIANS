# Client review ZIP

From the project folder in PowerShell, run:

```powershell
./scripts/package-client-preview.ps1
```

The script runs `npm run build:client-preview` and creates a dated `Top-Heights-UI-Preview-*.zip` in Downloads. Each run builds the latest local changes. `-SkipBuild` is only for packaging an already verified preview build.

Upload that ZIP at https://vercel.com/drop, choose a **new** project, and share its generated URL alongside https://topheightselectricals.com/. No Git repository, custom domain or environment variables are needed. Every Drop upload creates a new project.

The ZIP has `index.html` at its root, built JavaScript/CSS, images, `robots.txt` and `vercel.json`. Routing supports direct links such as `/shop/3` and `/admin`. Both HTML and hosting headers request no indexing. No source maps, repository history, environment files, backend code or dependencies are included.

## What the client can review

- Public pages, product cards/details, cart and checkout form layout.
- Use the bottom preview controls to switch between Visitor, Customer and Admin. No real credentials are needed.
- As Admin, open `/admin` and `/admin-dashboard` to review the business and learning interfaces with sample data.
- Course/news edits, order creation, payments and contact actions are disabled. Cart changes stay in the browser. The local demo student-progress controls are not evidence of a completed learning platform.
- The preview is publicly viewable by anyone with its link, including its sample admin screens. Demo roles grant no access to the live system.

## Isolation

`vite.preview.config.ts` replaces live authentication, database and payment modules only for the preview build. The build fails if live Firebase modules, the live auth provider, live service modules or payment credential patterns reach the generated JavaScript. The payment SDK is removed from the HTML. A Content Security Policy blocks API connections, external frames and form submissions. Google Fonts and Wikimedia payment logos remain allowed for matching the existing design.

Normal `npm run dev` and `npm run build` still use `vite.config.ts`. Preview output goes to `preview-dist`; the original repository remote, live backend permissions and production hosting are untouched.
