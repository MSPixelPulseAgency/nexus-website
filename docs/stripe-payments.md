# Nexus Stripe integration and handover

## Current status — 2026-11-01

- The user confirmed **Nexus Education Private School is the merchant**. MSPixelPulse is the technical administrator, not the legal merchant or owner.
- Requested temporary technical login: `admin@mspixelpulse.com`. Its use on the open account has **not** been verified.
- The existing Chrome tab is Stripe **test mode**, at the initial business-name/country onboarding screen. Browser input did not reliably apply; no saved registration changes or legal details were verified.
- The user supplied **499**, interpreted as **CA$499 per course for provisional testing only**. No production fee schedule, tax treatment, domestic/international differences, additional fees or refund policy has been verified. No public catalogue prices were changed.
- No actual API keys or webhook signing secrets have been obtained or configured. No Dashboard event destination has been registered.
- The PHP integration and payment pages are prepared on a separate review branch. Production deployment and live payments remain unauthorized.
- The existing enrollment form still does not transmit student data. Moodle is untouched. No real charge, refund, student notification or ownership change was performed.

## Payment and enrollment flow

The course cart contains 207 catalogue records, without confirmed availability or pricing. The registration form intentionally remains local until the school approves privacy, retention, recipient and delivery arrangements. Do not silently turn that form into a payment or student-record endpoint.

A trusted school operator first reviews availability and eligibility outside this integration. They issue an **approved payment request** with a non-personal reference and approved course codes. The server snapshots approved amounts; the payer cannot supply totals or change courses. Link issuance is a private CLI operation, never a public endpoint. A unique enrollment reference prevents accidental duplicate issuance.

The confidential link contains a high-entropy token in its URL fragment. The page exchanges it for an HttpOnly, SameSite cookie, removes the fragment and keeps no token in browser storage. Anyone receiving the link can view its course/amount details. The school must map the reference to its enrollment record in its existing approved system. Never put names, emails, dates of birth, guardian information or academic records in references, Stripe metadata or logs.

Only Stripe-hosted Checkout collects payer/card information. Cards and eligible card wallets are supported, subject to Stripe/device eligibility. No Interac e-Transfer, bank debit, installments or subscriptions are configured. Payment does not automatically enroll students, grant Moodle access or send confirmation emails.

## Runtime and private installation

- `server/payments/`: private app, Composer lockfile, config example, operator CLI and tests.
- `public/api/payments/`: availability, token exchange, quote, Checkout and webhook endpoints.
- `/checkout`, `/payment/success`, `/payment/cancel`: responsive, noindex payment pages in the existing design.
- Private SQLite stores transactional records with unique event, session and reference constraints. Requires a single persistent Cloudways app, PHP 8.1+, cURL and PDO SQLite. Verify these on the actual host before release.
- Production remains Cloudways (Apache/PHP), canonical `https://nexuseps.com/`. The existing `nexuseps` Vercel project is static continuity/preview only. Vercel redirects payment API requests to an unavailable response; it does **not** run the PHP service.

Install the reviewed private app outside the document root:

```text
applications/<app>/private_html/nexus-payments/
applications/<app>/private_html/nexus-payments-config.php
applications/<app>/private_html/nexus-payment-state/
applications/<app>/public_html/api/payments/
```

Run `composer install --no-dev --prefer-dist --no-interaction` in the private app. Copy `config.example.php` into the separate private config and set its absolute `state_dir`. Do not deploy the example unchanged. Restrict config files to 0600 and state directories to 0700, owned by the app user. Confirm HTTPS cannot retrieve config, SQLite, journals, sessions or backups. Exclude payment endpoints from all page/CDN caches. Never upload private app/config/state to `dist` or Vercel.

The default Cloudways locations above are discovered automatically. Alternatively configure these **server-only** variables:

| Variable | Purpose |
| --- | --- |
| `NEXUS_PAYMENT_APP_DIR` | Absolute private application directory |
| `NEXUS_PAYMENT_CONFIG_FILE` | Absolute private PHP config file |
| `NEXUS_STRIPE_SECRET_KEY` | Nexus sandbox/restricted server API key |
| `NEXUS_STRIPE_WEBHOOK_SECRET` | Signing secret for this environment/destination |

Use the host's secret manager/environment editor. Never put secret values in chat, tickets, command arguments, Git or `VITE_*` variables. No publishable key is required for hosted Checkout redirects. Scope the key to current-account read and Checkout Session creation/retrieval, verifying required permissions in the sandbox; avoid payouts, transfers, refunds and account administration. The SDK pins an API version; keep the Dashboard snapshot event version compatible and test upgrades.

Private config requirements:

- Start with `enabled=false`, `mode=test`, `live_approved=false`, `pricing_approved=false`.
- `base_url`: exact staging HTTPS origin without trailing slash; `allow_local_http=false` on hosted systems.
- `expected_account_id`: independently confirm Nexus's account. The credential's account is checked before creating/reconciling sessions.
- `prices`: explicit approved course-code entries with integer CAD cents and a course label. A provisional sandbox entry may be `'MHF4U' => ['amount' => 49900, 'label' => 'Advanced Functions']`. Do not assume every course is available or every student has the same price.
- Production entries must be final **tax-inclusive totals approved by management**. This implementation does not calculate taxes, fees or eligibility. Keep live mode disabled while those are unresolved.

## Stripe sandbox acceptance

1. Reach the existing test Dashboard. Confirm the technical login. Nexus's public display name and Canada are not proof of legal entity, registration or address. Stop at agreements, KYC, ownership and banking for the authorized owner.
2. Securely configure the Nexus test credentials on staging. This remains blocked until authenticated Dashboard access and secure credential entry are available.
3. Deploy the reviewed private app and public build to an **approved HTTPS staging application**. A static Vercel preview checks UI only. No Cloudways staging app was created in this task.
4. In Stripe Workbench, create a **sandbox snapshot webhook destination for this account** at `https://<approved-staging-origin>/api/payments/webhook.php`. Select `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`. Store its signing secret server-side. Never register the unready production endpoint.
5. Alternatively, Stripe CLI can forward events to `http://127.0.0.1:8787/api/payments/webhook.php`. Its listener signing secret differs from a Dashboard destination secret; use the matching secret.
6. After sandbox config is verified, enable staging only. Issue a synthetic request with its confidential link saved directly to a private file:

```bash
NEXUS_PAYMENT_CONFIG_FILE=/absolute/private/config.php \
  php server/payments/manage.php issue TEST-REVIEW-001 /absolute/private/state/links/test.txt MHF4U
```

The output file must be inside the configured `state_dir/links/` directory (created privately by the CLI). The link is never printed. No email is sent. Share real links only through the school's approved process. Requests expire in 48 hours; Checkout expires about 31 minutes after its first attempt. Retries reuse the same Session/idempotency key, including identical parameters after network failure. Expired sessions require operator reconciliation and a new approved request/reference. Check for an already-successful payment before issuing replacements.

7. Use synthetic adult payer data and Stripe's official test payment details. Verify CA$499 and two-course CA$998 totals, successful card, decline/retry, authentication, cancellation/back, browser closure before return, duplicate events, webhook retry, late events, bad signature, wrong amount/currency, incorrect merchant account and checkout pause. Verify success-page navigation cannot forge payment. Check mobile/keyboard use.
8. Compare Stripe Dashboard with the private report:

```bash
NEXUS_PAYMENT_CONFIG_FILE=/absolute/private/config.php \
  php server/payments/manage.php report
```

Keep refunds, disputes and chargebacks in Stripe and the school's existing reconciliation process. `paid` here records successful collection, not a refund/dispute ledger. Monitor webhook 5xx responses/delivery retries through the approved operations process before launch.

## Local checks and privacy

```bash
npm run lint
npm run build
composer install --working-dir=server/payments
composer test --working-dir=server/payments
git diff --check
```

The tests use local fixtures and never contact Stripe. Build first: HTTP tests exercise built PHP endpoints. For a local browser session:

```bash
NEXUS_PAYMENT_APP_DIR=/absolute/repo/server/payments \
NEXUS_PAYMENT_CONFIG_FILE=/absolute/private/config.php \
php -S 127.0.0.1:8787 -t dist scripts/local-php-server.php
```

Webhooks verify the raw-body signature and environment, retrieve the latest Session, reconcile account/session/reference/currency/total, and atomically record status/event. Duplicate delivery is safe; late events cannot downgrade `paid`. Return/cancel URLs never mutate payment state. Pausing new checkout leaves webhooks and existing receipts available.

Private state stores references, course codes/labels, amounts, Stripe Session ID, status/timestamps, hashed access tokens and short-lived rate-limit entries. No raw events, payer/card details or student records are stored. Stripe handles payer information; Nexus must approve privacy wording/consent, retention, access, encrypted backups and incident handling before live use. PHP sessions expire in two hours and require host garbage collection. Financial retention/cleanup requires management policy; do not arbitrarily delete records.

Test/live databases and session cookies are isolated automatically. Do not copy sandbox state into the live database. Authorization attempts are limited by client address; quote/Checkout budgets are scoped to the authorized request so receipt polling does not block other payers on a shared network.

Checkout and return-page reads are bound to the displayed opaque request ID as well as the access cookie. Opening a second request in another tab cannot silently pay or display the other request.

## Verification evidence

- Frontend lint/build and strict Composer validation pass; Composer audit reports no known advisories.
- 38 local payment/signature checks and 30 HTTP/cookie/operator checks pass. No external Stripe requests or real charges are made by these suites.
- Browser: synthetic CA$499 request rendered; token removed from URL; keyboard navigation verified; no browser errors observed. No horizontal overflow at 320, 360, 375, 390, 412, 430, 768, 820, 1024, 1280, 1440, 1728 and 1920 pixels.
- Direct success-page navigation shows waiting for confirmation, never a forged paid state. Payment routes have noindex metadata; success/cancel are excluded from the sitemap.
- The enrollment reminder is suppressed on payment pages; existing styling and cart/enrollment data remain intact.
- The catalogue still contains 207 courses and the sitemap still contains 582 URLs.
- **External boundary blocked:** actual Nexus credentials, real Stripe Checkout/decline/authentication tests, registered webhook delivery, Cloudways runtime/staging and live readiness are not verified. Fixture success is not production approval.

## What management must provide or complete

- Verified legal entity/name/type, registered address, business/tax registration and school billing identity from authoritative documents.
- Authorized representative personally completes identity/KYC, beneficial owners/controllers, requested documents and agreements. Never substitute MSPixelPulse identity.
- School payout bank details, entered directly into Stripe by management. Do not send banking or ID documents in chat.
- Official owner's email and account control. Management handles invitations/ownership transfer, confirms acceptance and assigns only the agreed technical role to MSPixelPulse. No invitations or ownership transfer were performed here.
- Confirm CA$499 currency/basis, course availability/eligibility, domestic/international pricing, taxes/fees, refunds/cancellations, statement descriptor, support details and receipt arrangements.
- Approve privacy/retention, review staging evidence, then explicitly authorize production deployment and live payments.

## Production rollout — approval required

Do not merge into main, deploy production or accept real payments during preparation. After management completes the checklist and explicit approval is recorded:

1. Back up the public site/private configuration separately from Moodle. Validate staging on the same PHP/runtime/storage setup. Record a known-good rollback artifact and private DB backup outside Git.
2. Install the reviewed private app/lockfile on the existing Cloudways app. Configure **separate Nexus live credentials and live webhook** only after management activates the account. Set `base_url=https://nexuseps.com`, local HTTP off, final approved prices and verified account ID. Both pricing/live approval flags must explicitly be true for live mode.
3. Deploy the reviewed public build, verify APIs/direct routes/cache exclusions/private-file protection/webhook delivery, and retain `enabled=false` until final go-live approval.
4. Enable checkout only after authorization. A real charge/refund requires separately authorized financial testing. Match the first authorized payment with Stripe and the school record.

Rollback/pause: set `enabled=false` to block new access/Checkout; **keep webhooks, database and private configuration running** to reconcile already-issued sessions. Restore known-good public assets if needed. Existing Stripe Checkout sessions remain usable until expiry: a website pause does not revoke them. Only management-authorized action may expire outstanding Stripe sessions. Never overwrite payment state with an older website release, remove the webhook as a rollback shortcut, or alter Moodle.

Official references: [Checkout API](https://docs.stripe.com/api/checkout/sessions/create), [fulfillment/idempotency](https://docs.stripe.com/checkout/fulfillment.md?ui=full-page), [webhooks](https://docs.stripe.com/webhooks), [key security](https://docs.stripe.com/keys-best-practices).
