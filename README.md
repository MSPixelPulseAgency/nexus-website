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

The site must remain linked to the existing Vercel project `nexuseps`, use the `main` production branch, build with `npm run build`, and output `dist`. `vercel.json` provides the SPA rewrite required for direct route refreshes.

The course cart persists non-sensitive course selections in localStorage and prevents duplicates. `/cart`, `/register` and `/checkout` provide the selection and registration workflow without inventing prices.

The registration page validates fields locally but does not transmit or store sensitive student information. Delivery remains disabled until an approved privacy/data-retention review, verified sender, recipient controls and server-side secret configuration are complete. See `docs/registration-delivery.md`.

The public catalogue is generated from a read-only export of the Nexus Moodle catalogue. A record is not a promise of active availability; public course pages consistently ask visitors to confirm availability and eligibility.

This repository is only for the public React/Vite website. Do not modify or replace the separate Nexus Moodle LMS repository from this project.
