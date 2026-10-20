# UI, branding and privacy polish

The home solution cards share a fixed image height and aligned content. The mobile blog callout has readable spacing. Header/footer/loading states use the existing Top Heights logo asset. Navigation calls the articles section Blog; signed-in admins can open Manage blog directly at /admin?tab=blog.

The small bottom banner offers Essential only and Accept optional analytics. Firebase Analytics is imported and initialized only after opt-in; withdrawal disables collection and removes first-party analytics cookies. Choices expire after 180 days and can be changed through the footer or /privacy. Embedded videos connect to their provider only after Load video is clicked. Browsing does not require optional analytics.

The startup/account loader follows application loading without a fixed delay and respects reduced motion. Privacy controls do not change account permissions or payment configuration.

Validation: TypeScript, targeted ESLint, six content/privacy regression tests, production Vercel build, whitespace and secret checks. Browser checks covered matched desktop images, mobile overflow/layout, remembered consent and withdrawal, direct Blog admin navigation, and video gating (zero iframes before click, one after).

These code changes require PR #6 to be merged and deployed. Existing production catalogue drafts still require actual stock, review and explicit publication; nothing is auto-published.
