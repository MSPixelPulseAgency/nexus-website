# Nexus payment maintenance boundaries

Nexus Education Private School is the merchant; MSPixelPulse is the temporary technical administrator (`admin@mspixelpulse.com` requested, not verified). Never substitute agency legal, banking, ownership or identity details. Preserve the existing website, catalogue, enrollment privacy boundary and separate Moodle system.

Read `docs/stripe-payments.md` before changes. Public routes are `/checkout`, `/payment/success` and `/payment/cancel`; `/register` and `/enroll` remain local enrollment forms. Keep Nexus branding, accessible labels/statuses, responsive layouts and noindex payment metadata. Do not invent legal information, availability or pricing. CA$499/course is provisional testing input, not approved production tax/fee treatment.

Private PHP code/dependencies/configuration/SQLite belong outside Cloudways's web root. Vercel serves a disabled payment API fallback. Never commit secrets, payment links, state, student data or logs. No `VITE_*` keys. Only authorized school operators issue requests through the private CLI. No student records in these APIs/Stripe metadata. Amounts are immutable server snapshots; only signed/reconciled webhooks confirm payment. Keep duplicates safe and paid status absorbing.

Run lint, build, Composer validation, unit/signature and HTTP checks. Real Stripe sandbox testing is a separate launch gate; fixtures do not prove credentials/payment methods/webhook delivery. Default checkout off, prices empty until configured, approval flags false. Management personally handles KYC, banking, ownership and agreements. No live charges/refunds, production deployment or merge without scope-specific authorization. Do not add notifications or automatic LMS enrollment.
