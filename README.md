# Nexus Education Private School

Production React + Vite website for Nexus Education Private School, built and maintained by MSPixelPulse Web Solutions (https://mspixelpulse.com).

- Production: https://nexuseps.com/
- LMS: https://lms.nexuseps.com/
- GitHub: https://github.com/MSPixelPulseAgency/nexus-website
- Stack: React 19, Vite, React Router, Lucide React, Manrope, CSS

## Local development

```bash
npm install
npm run dev
npm run lint
npm run build
```

`npm run build` regenerates `public/sitemap.xml` from all indexable static pages, 207 course detail routes, 207 matching course-outline routes and 130 blog records before creating `dist/`.

## Structure

- `src/components/` — shared navigation, footer, cards, SEO, FAQ and form UI
- `src/pages/` — route-level experiences
- `src/data/` — source catalogue, blog index, structured content and central visual configuration
- `src/context/` — duplicate-safe local course-cart state
- `src/config/` — verified-only social and contact configuration
- `src/styles/` — global tokens, component styles, logo-led brand theme and responsive breakpoints
- `scripts/generate-sitemap.mjs` — sitemap generation
- `.ai-agents/` — maintenance rules for future AI-assisted work
- `public/api/brand/` + `server/` — PHP password gate for protected brand-asset downloads (see `docs/brand-asset-access.md`)

## Production notes

Production currently serves `dist/` from the Cloudways (Apache + PHP) host behind `public/.htaccess`; the Vercel project remains linked for deployment continuity. The `/brand-guidelines` page is public, while its downloads are protected by the PHP endpoints documented in `docs/brand-asset-access.md`, which need a one-time secret configuration outside the web root.

The existing Vercel project `nexuseps` follows `main` for static continuity/preview builds with `npm run build` and output `dist`. The canonical production site uses the Cloudways PHP host; Vercel does not run its PHP services. Preserve both existing linkages and verify the target before any approved deployment. `vercel.json` provides the SPA rewrite required for direct route refreshes.

The course cart persists non-sensitive course selections in localStorage and prevents duplicates. `/cart`, `/register` and `/checkout` provide the selection and registration workflow without inventing prices.

The registration page validates fields locally but does not transmit or store sensitive student information. Delivery remains disabled until an approved privacy/data-retention review, verified sender, recipient controls and server-side secret configuration are complete. See `docs/registration-delivery.md`.

The public catalogue is generated from a read-only export of the Nexus Moodle catalogue. A record is not a promise of active availability; public course pages consistently ask visitors to confirm availability and eligibility.

This repository contains the public React/Vite website and its private PHP payment service. Do not modify or replace the separate Nexus Moodle LMS repository from this project.

## Stripe payment preparation

The server-side PHP Checkout integration and `/checkout`, `/payment/success`, `/payment/cancel` pages are prepared for school-approved payment requests. Payments remain disabled by default; enrollment still does not transmit student data and Moodle is unchanged. All 207 courses use the requested CA$499/course catalogue price. Actual Nexus sandbox payments and signed webhook reconciliation have passed. The approved code is deployed to Cloudways with collection disabled. Management verification, taxes/fees/refund and self-service decisions, production Stripe activation/credentials and explicit live collection approval remain outstanding. See [status, setup, management checklist and rollout](docs/stripe-payments.md).

Private PHP code, dependencies, configuration and SQLite state belong outside the Cloudways web root. Vercel is a static preview/continuity target with payments unavailable. Run `npm run build` before `composer test --working-dir=server/payments`; HTTP checks exercise built PHP endpoints.

## Pricing and disabled payment release preparation

Every course uses `src/data/tuition.json`: CAD 499.00, displayed as CA$499 / course. The build generates the server catalogue and a matching public pricing fingerprint. Run `npm run test:pricing` after a build. Payment entry points show availability from the server and keep student registration delivery separate.

`server/payments/preflight.php` checks a private installation without changing it. `npm run package:payments -- /absolute/new/release-directory` builds a review archive from a clean committed checkout; it does not deploy. Follow [the payment handover](docs/stripe-payments.md) for the exact layout, verification limits and management requirements. Live payments remain disabled.
